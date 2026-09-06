#!/usr/bin/env bash
# =============================================================================
# Build a deploy-ready archive of the site.
#
#   ./scripts/build-deploy.sh              -> dist/ + hfm-deploy.zip
#   ./scripts/build-deploy.sh --no-video   -> omit the 19 MB workshop film
#
# WHY A STAGING FOLDER RATHER THAN "zip -x": the exclude list is long and
# easy to get subtly wrong, and a single stray file — a 4 MB PNG master, the
# HANDOFF, a verification screenshot — is invisible in a zip listing of 200
# entries. Copying only what should ship makes the payload auditable: whatever
# is in dist/ is exactly what goes live.
#
# WHAT IS DELIBERATELY EXCLUDED, AND WHY
#   assets/img/*.png   the eighteen 2880px masters, 72 MB. These are BUILD
#                      INPUTS for scripts/make_cutouts.py. Nothing served
#                      references them any more: the two About-page images now
#                      use cut-outs, and the 18 Product JSON-LD `image` fields
#                      point at assets/img/og/*.jpg (same 2880px pixels, ~480 KB
#                      each instead of ~4 MB). Verify with:
#                        grep -rn "assets/img/[a-z_]*\.png" --include=*.html .
#   _ref/ scripts/     tooling, the contrast auditor, the verification suites
#   serve.mjs          local dev server; Hostinger shared hosting runs no Node
#   README HANDOFF     internal documentation
#   temp_* crop_* p4-* working images and verification screenshots (~30 MB)
#   .claude .zcode .playwright-mcp  agent/editor state
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

# ---- Staleness guard --------------------------------------------------------
# dist/ is a COPY of the source, which means nothing detects it going stale.
# Edit css/pages.css, forget to rebuild, deploy dist/, and you ship yesterday's
# site — with both trees looking equally plausible. That already happened once:
# an extracted hfm-deploy/ sat in the repo at ?v=9 with the pre-fix carousel
# while the source was at ?v=10.
#
# `--check` reports and exits without building, so it can be run before a deploy.
if [[ "${1:-}" == "--check" ]]; then
  if [[ ! -d dist ]]; then
    echo "dist/ does not exist — nothing to check. Run without --check to build."
    exit 0
  fi
  newest_src=$(find index.html 404.html robots.txt sitemap.xml .htaccess css js data assets     about ar bespoke cart checkout collections contact materials piece room showroom thanks     -type f -newer dist -print -quit 2>/dev/null || true)
  if [[ -n "$newest_src" ]]; then
    echo "STALE: dist/ is older than at least one source file ($newest_src)." >&2
    echo "Rebuild before deploying." >&2
    exit 1
  fi
  echo "dist/ is current."
  exit 0
fi

NO_VIDEO=0
[[ "${1:-}" == "--no-video" ]] && NO_VIDEO=1

OUT=dist
ARCHIVE=hfm-deploy.zip

rm -rf "$OUT" "$ARCHIVE" hfm-deploy.tar.gz
mkdir -p "$OUT"

echo "staging ->  $OUT/"

# ---- root files -------------------------------------------------------------
# .htaccess is copied explicitly: it starts with a dot, so a bare glob misses it
# and the site would silently deploy without compression, cache headers or the
# .glb MIME type.
for f in index.html 404.html robots.txt sitemap.xml .htaccess; do
  cp "$f" "$OUT/"
done

# ---- code -------------------------------------------------------------------
cp -r css js data "$OUT/"

# ---- page directories -------------------------------------------------------
for d in about ar bespoke cart checkout collections contact materials piece room showroom thanks; do
  cp -r "$d" "$OUT/"
done

# ---- assets ----------------------------------------------------------------
# assets/ is copied SELECTIVELY (the eighteen PNG masters are 72 MB of build
# input), which means every new asset directory has to be added here by hand.
# assets/fonts/ is self-hosted Jost and Inter Tight — the pages preload them, so
# omitting them would leave the whole site in fallback type.
# assets/img/real/ is the six real photographs of the business — the showroom, a
# delivered room, the team and the Managing Director. `cp assets/img/*.webp` does
# NOT reach into a subdirectory, so omitting this line ships /showroom/ and /about/
# with broken images and no error anywhere in the build.
mkdir -p "$OUT/assets/img/og" "$OUT/assets/img/real" "$OUT/assets/models" "$OUT/assets/fonts"
cp assets/img/*.webp        "$OUT/assets/img/"
cp assets/img/favicon.svg   "$OUT/assets/img/"
cp assets/img/og/*.jpg      "$OUT/assets/img/og/"
cp assets/img/real/*.webp   "$OUT/assets/img/real/"
cp assets/models/*.glb      "$OUT/assets/models/"
cp assets/fonts/*.woff2     "$OUT/assets/fonts/"

if [[ $NO_VIDEO -eq 0 ]]; then
  mkdir -p "$OUT/assets/video"
  cp assets/video/*.mp4 "$OUT/assets/video/"
else
  # §8 is click-to-play and js/hero.js has an error handler that restores the
  # poster and relabels the control, so omitting the film degrades cleanly.
  echo "  (--no-video: workshop film omitted; §8 falls back to its poster)"
fi

# ---- guard: nothing that should not ship ------------------------------------
if compgen -G "$OUT/assets/img/*.png" > /dev/null; then
  echo "ERROR: PNG masters leaked into $OUT" >&2; exit 1
fi

# Every asset the pages actually reference must have arrived. The selective copy
# above is silent when a directory is missed — this is what turns that into a
# failed build instead of a live site with broken images. Derived from the markup,
# so a new photograph is covered the moment it is referenced.
missing=0
while read -r ref; do
  [[ -f "$OUT/$ref" ]] || { echo "ERROR: $ref referenced by the pages but not in $OUT" >&2; missing=1; }
done < <(grep -rhoE '(\.\./)*assets/img/(real|og)/[A-Za-z0-9._-]+\.(webp|jpg)'            --include='*.html' . | sed -E 's#^(\.\./)+##' | sort -u)
[[ $missing -eq 0 ]] || exit 1
for bad in _ref scripts serve.mjs README.md HANDOFF.md; do
  if [[ -e "$OUT/$bad" ]]; then echo "ERROR: $bad leaked into $OUT" >&2; exit 1; fi
done

# ---- archive ---------------------------------------------------------------
# Delegated to scripts/make-zip.py, which writes explicit DIRECTORY entries and
# then re-opens the result to assert them. Read the header of that file before
# changing this line: both of the obvious archivers on this machine produced
# zips that verified locally and then lost every subfolder on the host.
#   - the `zip` binary archived only the 4 root files and exited 0
#   - PowerShell Compress-Archive wrote 178 files and 0 directory entries, which
#     Hostinger's extractor turned into a site with no css/, js/ or assets/
python scripts/make-zip.py "$OUT" "$ARCHIVE"

# make-zip.py already asserts file count, directory entries, root index.html,
# .htaccess, path separators and CRC, and exits non-zero on any of them — so
# `set -e` above is the whole check. The duplicate bash verification that used to
# live here was removed rather than kept in sync with it.
staged=$(find "$OUT" -type f | wc -l)

echo
echo "dist/ contents:"
du -sh "$OUT"
printf '  %s files\n' "$staged"
echo
printf 'archive: %s  (%s)\n' "$ARCHIVE" "$(du -h "$ARCHIVE" | cut -f1)"
echo '         (make-zip.py printed the verified file / directory counts above)'
echo
echo "Deploy with the Hostinger MCP:"
echo "  hosting_deployStaticWebsite  domain=<your-domain>  archivePath=$(pwd)/$ARCHIVE"
echo "NOTE: that call OVERWRITES the target site's contents and cannot be undone."
