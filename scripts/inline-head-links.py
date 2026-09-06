#!/usr/bin/env python3
"""Move the five stylesheet links from js/head.js into every page's <head>.

WHY. js/head.js injected the fonts link, all five stylesheets, the favicon and
theme-color at runtime, so a visit with JavaScript off or blocked got NO CSS at
all: measured, 34 of the 35 pages rendered as raw unstyled HTML with no header,
no footer and no cards. /collections/ showed 412 characters of text and none of
the 18 pieces. Only the homepage was unaffected, because it carries the same
links statically.

WHAT IT COSTS. The `?v=` cache-buster now lives in 35 files instead of one. That
is what scripts/bump-css-version.py is for, and it is a better trade than a site
whose stylesheets depend on a script executing.

ORDER MATTERS: tokens -> base -> pages -> experience -> nav. Equal-specificity
rules resolve by file order, so experience.css beats base.css and pages.css
(README.md, "Architecture in five facts").

--check reports what would change and exits non-zero if anything would.

CONTRACT & ORDERING WARNING:
Do NOT re-run this script on pages with critical CSS enabled. Re-running it
rewrites the head links back to blocking rel="stylesheet", destroying the
preload deferral pattern and the atomic __cssGo swapper shipped in Plan §2.3.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"dist", "_ref", "node_modules"}
VERSION = "v=13"
SHEETS = ["tokens", "base", "pages", "experience", "nav"]

# The tag this replaces, capturing data-depth.
HEAD_TAG = re.compile(
    r'^[ \t]*<script[^>]*\bsrc="[^"]*js/head\.js"[^>]*\bdata-depth="(\d+)"[^>]*>\s*</script>[ \t]*\n',
    re.MULTILINE,
)


def block(depth: int) -> str:
    r = "../" * depth
    lines = [
        '<meta name="theme-color" content="#111219">',
        f'<link rel="icon" href="{r}assets/img/favicon.svg" type="image/svg+xml">',
        # Self-hosted since scripts/use-local-fonts.py. Google Fonts put two
        # foreign origins and a blocking cross-origin request on the critical
        # path, and the fallback-to-Jost swap reflowed text — 0.2317 of CLS on the
        # Royal Sofa Pair, 0.0071 with the fonts blocked. Only the latin pair is
        # preloaded; latin-ext is 107 KB most visits never need. `crossorigin` is
        # mandatory even same-origin or the preload is discarded and refetched.
        f'<link rel="preload" href="{r}assets/fonts/jost-latin.woff2" as="font" type="font/woff2" crossorigin>',
        f'<link rel="preload" href="{r}assets/fonts/inter-tight-latin.woff2" as="font" type="font/woff2" crossorigin>',
        f'<link rel="stylesheet" href="{r}css/fonts.generated.css?{VERSION}">',
    ]
    lines += [f'<link rel="stylesheet" href="{r}css/{name}.css?{VERSION}">' for name in SHEETS]
    return "\n".join(lines) + "\n"


def pages():
    for p in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP for part in p.relative_to(ROOT).parts):
            continue
        yield p


def main() -> int:
    check = "--check" in sys.argv
    changed, already, missing = [], [], []

    for path in pages():
        text = path.read_text(encoding="utf-8-sig")
        match = HEAD_TAG.search(text)
        if not match:
            # The homepage never used head.js; anything else is a surprise.
            (already if 'css/nav.css' in text else missing).append(path)
            continue
        new = HEAD_TAG.sub(lambda m: block(int(m.group(1))), text, count=1)
        if new != text:
            changed.append(path)
            if not check:
                path.write_text(new, encoding="utf-8")

    rel = lambda p: p.relative_to(ROOT).as_posix()
    for p in changed:
        print(f"{'would rewrite' if check else 'rewrote'}  {rel(p)}")
    for p in already:
        print(f"already static  {rel(p)}")
    for p in missing:
        print(f"NO STYLESHEETS AND NO head.js TAG  {rel(p)}", file=sys.stderr)

    print(f"\n{len(changed)} rewritten, {len(already)} already static, {len(missing)} unresolved")
    if missing:
        return 2
    return 1 if (check and changed) else 0


if __name__ == "__main__":
    sys.exit(main())
