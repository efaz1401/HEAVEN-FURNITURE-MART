# scripts/

Two kinds of thing live here and the difference matters: **tools** you run
repeatedly, and **one-shot migrations** that were run once and left behind as a
record of what was done. The review that prompted this file asked the right
question — *"are any of them safe to re-run?"* — so here is the answer for each.

Every one-shot below **guards its own anchor** and prints `skip (already done)`
rather than double-applying. That is deliberate: a migration you cannot re-run
safely is a migration you cannot verify.

## Tools — run these

| Script | What it does |
|---|---|
| `build-deploy.sh` | Stages `dist/` and builds `hfm-deploy.zip`. `--check` reports whether `dist/` is stale and exits non-zero if so — run that before deploying. |
| `make-zip.py` | Writes the zip with explicit **directory entries** and verifies them. Do not replace with `zip` or `Compress-Archive`; both produced locally-valid, host-broken archives. Read its header before touching it. |
| `serve-dist.mjs` | Serves the built payload on `:8082`, so the archive can be tested rather than the source tree. |
| `set-domain.mjs` | Rewrites the hardcoded hostname across all 35 files that carry it. Host-only, so safe to re-run and to reverse. `--dry-run` supported. |
| `check-price-table.py` | Read-only. Cross-checks the client's price table against `data/pieces.js` — ids, dimensions, lead times, and the min/max spread. |
| `audit-buttons.py` | Read-only. Inventories every button-like control across the site and reports what `js/magnetic.js` is bound to. |
| `make_cutouts.py` | Regenerates the 54 `_cut_*.webp` alpha cut-outs from the 18 PNG masters. **Never modifies the masters.** |
| `make_webp.py` | Regenerates the opaque `_512`/`_1024` WebP variants. |
| `bump-css-version.py` | Increments the `?v=NN` cache-buster across all HTML pages. **Must run before `build-critical-css.mjs`.** |
| `build-critical-css.mjs` | Inlines critical CSS on all 35 routes. **Must run after `bump-css-version.py`.** |

## Script Ordering Contracts

1. **`bump-css-version.py` must run BEFORE `build-critical-css.mjs`.**
   `build-critical-css.mjs` stamps each HTML file with the sha1 of the CSS sheets (`css=<12 hex>`). Any subsequent bump would invalidate the stamp or cause cache drift on deferred sheets.
2. **Do NOT re-run `inline-head-links.py`.**
   Re-running `inline-head-links.py` rewrites the `<link rel="preload" as="style">` deferral pattern back to blocking `<link rel="stylesheet">`, destroying critical CSS deferral.

## One-shot migrations — already applied, safe to re-run

Each is idempotent and will no-op if its change is already present.

| Script | Applied | Re-running |
|---|---|---|
| `add-pricing-data.py` | `price`, `matGroup`, `addons` on all 18 pieces | no-op; skips records that already have `price:` |
| `add-configurator.py` | `<div id="configurator">` + button changes in 18 piece templates | no-op; skips files containing the mount point |
| `add-cart-nav.py` | Cart button in the nav and a 4th dock slot, in **both** chrome copies | no-op; skips if `pill-cart` is present |
| `relabel-order.py` | "room board" → "order request" wording sitewide | no-op; each replacement checks its anchor |
| `extend-checkout-suite.py` | Appended the submit/failure/confirmation blocks to `_ref/verify-checkout.mjs` | no-op; skips if `SUCCESSFUL SUBMIT` is present |
| `patch-pricing-suite.py` | Lakh-grouping and parts-sum assertions in `_ref/verify-pricing.mjs` | no-op; skips if `lakh grouping` is present |
| `update-decisions.py` | Rewrote the ordering section of `DECISIONS.md` | **re-runnable but destructive**: it replaces everything between `## Ordering` and `## Verification`, so hand edits to that section would be lost. Check before running. |
| `bake-stage-finish.py` | Baked the `.stage-finish` swatch block into the 5 variant pieces' markup so it occupies space at parse time (JS-inserting it cost 0.1167 CLS, measured V5-vs-V6 side by side in `_ref/measure-cls.mjs`) | no-op; skips any page already carrying `id="stage-finish"` |
| `remove-scale-ctl.py` | Stripped the AR Size slider (`.scale-ctl`) from all 18 piece templates — `ar-scale="auto"` already gives pinch-to-resize inside the AR session, making the site-side 50–200% pre-scale redundant. `js/piece.js` and `css/experience.css` were cleaned in the same change. | no-op; skips any page with no `scale-ctl` |

## Why these exist as files at all

Three reasons, in order of how often they mattered:

1. **Eighteen identical edits is where a hand pass misses one.** A piece page
   without a configurator mount silently shows no price; a piece without `price`
   renders `From ৳NaN`. Scripting it makes the change verifiable, and every one
   of these ends by asserting the result across all 18 files.
2. **Escaping.** Several insert regex, backticks, `৳` and template literals.
   Shell heredocs mangled all of them — `patch-pricing-suite.py` exists precisely
   because a `-c` one-liner silently ate `\u09F3`.
3. **The record.** Each header says what changed and why, which is the part a
   commit message would carry if this were a git repository. It isn't.

## `test_cine.js`

Predates this work and is unreferenced by any suite. Left in place rather than
deleted, but nothing runs it — treat it as unverified.
