#!/usr/bin/env python3
"""Ship each piece page's derivable initial state in the markup.

Three blocks on the piece template have a final state that is fully determined by
data/pieces.js, but were being set by JavaScript after first paint. Every one of
them is a layout shift, and two of them are also wrong with JavaScript off:

  #variant-block   swatches exist only where hasModel AND variants -> 3 of 18
  #ar-row          the AR button and QR card, only where hasModel   -> 8 of 18
  #no-model        the "no 3D model yet" notice, the exact inverse   -> 10 of 18

Measured before this: hiding #ar-row after paint collapsed 193px to 19px and
moved the breadcrumb up 30px, worth 0.2246 of CLS on the Royal Sofa Pair. And a
no-JS visitor on a model-less piece was shown a "See this in your room" button
that could never work, while the notice explaining why stayed hidden.

js/piece.js keeps its own toggles as belt-and-braces; with the attributes already
correct they become no-ops rather than shifts.

    python scripts/set-piece-initial-state.py [--check]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def pieces():
    """id -> (shows swatches, has a model), parsed without a JS engine."""
    src = (ROOT / "data" / "pieces.js").read_text(encoding="utf-8")
    body = src.split("export const PIECES = [")[1].split("\n];")[0]
    out = {}
    for block in re.split(r"\n  \{\n", body):
        m = re.search(r"id: '([^']+)'", block)
        if not m:
            continue
        has_model = bool(re.search(r"hasModel: true", block))
        variants = re.search(r"variants: \[([^\]]*)\]", block)
        n = len([v for v in (variants.group(1).split(",") if variants else []) if v.strip()])
        out[m.group(1)] = (has_model and n > 0, has_model)
    return out


def retag(text, element_id, want_hidden, path):
    """Sets or clears `hidden` on one element, preserving its other attributes."""
    pattern = re.compile(rf'<div (?P<pre>[^>]*?)id="{element_id}"(?P<post>[^>]*?)>')
    m = pattern.search(text)
    if not m:
        raise SystemExit(f"no #{element_id} in {path}")
    attrs = (m.group("pre") + m.group("post"))
    attrs = re.sub(r"\bhidden\b", "", attrs)
    attrs = re.sub(r"\s+", " ", attrs).strip()
    rebuilt = f'<div {attrs} id="{element_id}"' if attrs else f'<div id="{element_id}"'
    # `hidden` first so it reads as the state, not as an afterthought.
    rebuilt = rebuilt.replace(f'id="{element_id}"',
                              f'id="{element_id}"{" hidden" if want_hidden else ""}')
    return text[:m.start()] + rebuilt + ">" + text[m.end():], m.group(0), rebuilt + ">"


def main() -> int:
    check = "--check" in sys.argv
    table = pieces()
    if len(table) != 18:
        raise SystemExit(f"parsed {len(table)} pieces, expected 18")

    changed = 0
    for slug, (shows_swatches, has_model) in sorted(table.items()):
        path = ROOT / "piece" / slug / "index.html"
        text = original = path.read_text(encoding="utf-8")
        for element_id, want_hidden in (
            ("variant-block", not shows_swatches),
            ("ar-row", not has_model),
            ("no-model", has_model),
        ):
            text, before, after = retag(text, element_id, want_hidden, path)
            if before != after:
                print(f"  {'would set' if check else 'set'}  #{element_id:14} "
                      f"{'hidden' if want_hidden else 'shown ':6}  piece/{slug}/")
        if text != original:
            changed += 1
            if not check:
                path.write_text(text, encoding="utf-8")

    n_model = sum(1 for _, m in table.values() if m)
    print(f"\n{changed} pages rewritten · {n_model} with a model, {len(table) - n_model} without")
    return 1 if (check and changed) else 0


if __name__ == "__main__":
    sys.exit(main())
