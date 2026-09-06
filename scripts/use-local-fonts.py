#!/usr/bin/env python3
"""Swap the Google Fonts request for the self-hosted faces, on every page.

Removes the two preconnects and the fonts.googleapis.com stylesheet, and adds:

  * a preload for each LATIN woff2 — the two files English text actually needs.
    The latin-ext pair (107 KB) is left to load on demand, because preloading
    bytes most visits never use is a regression dressed as an optimisation.
    `crossorigin` is mandatory even same-origin: fonts are always fetched in
    anonymous CORS mode, and without it the preload is discarded and fetched
    again.
  * a stylesheet link for css/fonts.generated.css, written by
    scripts/self-host-fonts.mjs.

Net effect on the critical path: two foreign origins and one blocking
cross-origin request replaced by one same-origin request that can start in the
same round trip as the rest of the CSS.

    python scripts/use-local-fonts.py [--check]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"dist", "_ref", "node_modules"}
VERSION = "v=17"
PRELOAD = ["jost-latin.woff2", "inter-tight-latin.woff2"]

GOOGLE = re.compile(
    r'[ \t]*<link rel="preconnect" href="https://fonts\.googleapis\.com">\n'
    r'[ \t]*<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\n'
    r'[ \t]*<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">\n'
)


def block(depth: int) -> str:
    r = "../" * depth
    lines = [f'<link rel="preload" href="{r}assets/fonts/{f}" as="font" type="font/woff2" crossorigin>'
             for f in PRELOAD]
    lines.append(f'<link rel="stylesheet" href="{r}css/fonts.generated.css?{VERSION}">')
    return "\n".join(lines) + "\n"


def pages():
    for p in sorted(ROOT.rglob("*.html")):
        if not any(part in SKIP for part in p.relative_to(ROOT).parts):
            yield p


def depth_of(path: Path, text: str) -> int:
    m = re.search(r'<body[^>]*data-depth="(\d+)"', text)
    if m:
        return int(m.group(1))
    # index.html and 404.html are at the root and carry no data-depth.
    return 0


def main() -> int:
    check = "--check" in sys.argv
    changed, already = [], []
    for path in pages():
        text = path.read_text(encoding="utf-8")
        if not GOOGLE.search(text):
            already.append(path)
            continue
        depth = depth_of(path, text)
        # 404.html reaches its assets root-absolutely, not relatively.
        new_block = block(depth) if path.name != "404.html" else block(0).replace('href="', 'href="/')
        indent = re.search(r'([ \t]*)<link rel="preconnect" href="https://fonts\.googleapis\.com">', text).group(1)
        replacement = "".join(indent + line + "\n" for line in new_block.strip().split("\n"))
        text = GOOGLE.sub(replacement, text, count=1)
        changed.append(path)
        if not check:
            path.write_text(text, encoding="utf-8")

    rel = lambda p: p.relative_to(ROOT).as_posix()
    for p in changed:
        print(f"{'would swap' if check else 'swapped'}  {rel(p)}")
    for p in already:
        print(f"no google fonts block  {rel(p)}")
    print(f"\n{len(changed)} swapped, {len(already)} untouched")
    return 1 if (check and changed) else 0


if __name__ == "__main__":
    sys.exit(main())
