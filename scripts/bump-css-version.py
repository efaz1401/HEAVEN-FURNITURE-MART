#!/usr/bin/env python3
"""Bump the ?v= cache-buster on the five stylesheets across every page.

This exists because scripts/inline-head-links.py moved the links out of
js/head.js and into all 35 pages, so the version string is no longer in one
place. Run this instead of editing 35 files by hand.

    python scripts/bump-css-version.py            # 13 -> 14
    python scripts/bump-css-version.py 21         # set explicitly
    python scripts/bump-css-version.py --check    # report the current version

HTML is served with `Cache-Control: max-age=0, must-revalidate` (.htaccess) and
the stylesheets with `immutable`, so bumping this string is the ONLY thing that
invalidates CSS for a returning visitor.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"dist", "_ref", "node_modules", "hfm-deploy"}
LINK = re.compile(
    r'(href="[^"]*css/(?:tokens|base|pages|experience|nav|fonts\.generated)\.css\?v=)(\d+)(")')


def pages():
    for p in sorted(ROOT.rglob("*.html")):
        if not any(part in SKIP for part in p.relative_to(ROOT).parts):
            yield p


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--check" in sys.argv

    found = set()
    for path in pages():
        found.update(int(m.group(2)) for m in LINK.finditer(path.read_text(encoding="utf-8")))

    if not found:
        print("no versioned stylesheet links found", file=sys.stderr)
        return 2
    if len(found) > 1:
        print(f"pages disagree on the version: {sorted(found)} — pass one explicitly",
              file=sys.stderr)
        if not args:
            return 2

    current = max(found)
    if check:
        print(f"current: v={current} across {len(list(pages()))} pages")
        return 0

    target = int(args[0]) if args else current + 1
    touched = 0
    for path in pages():
        text = path.read_text(encoding="utf-8")
        new = LINK.sub(lambda m: f"{m.group(1)}{target}{m.group(3)}", text)
        if new != text:
            path.write_text(new, encoding="utf-8")
            touched += 1

    print(f"v={current} -> v={target} in {touched} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
