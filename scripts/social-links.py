"""Adds Heaven's own social channels — the site carried none at all.

Four insertion points, because the chrome exists twice: js/chrome.js builds the footer
and overlay for 34 pages, index.html carries its own static copy of both, and two
JSON-LD blocks need `sameAs` so Google ties the accounts to the business.

Glyph paths come from Simple Icons (CC0), kept in _ref/glyphs/ and read from there
rather than typed: each is 20-40 bezier segments and renders as noise if one is wrong.

Run from the site root; exits 2 if any target is missing or ambiguous.
"""
from pathlib import Path
import re
import sys

SOCIAL = [
    ("Facebook", "https://facebook.com/HeavenFurnitureMart", "facebook"),
    ("Instagram", "https://instagram.com/heaven_furniture_ltd", "instagram"),
    ("YouTube", "https://youtube.com/@HeavenFurnitureMart", "youtube"),
]


def glyph(slug: str) -> str:
    src = Path("_ref/glyphs") / f"{slug}.svg"
    d = re.search(r'\sd="([^"]+)"', src.read_text(encoding="utf-8"))
    if not d:
        raise SystemExit(f"no path in {src}")
    return ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
            f'<path d="{d.group(1)}"/></svg>')


GLYPHS = {slug: glyph(slug) for _, _, slug in SOCIAL}

FOOT_LI = "\n".join(
    f'          <li><a href="{url}" rel="me" aria-label="{name}">{GLYPHS[slug]}</a></li>'
    for name, url, slug in SOCIAL
)
FOOT_BLOCK = f"""        <ul class="foot-social" aria-label="Heaven Furniture Mart on social media">
{FOOT_LI}
        </ul>
"""

OV_LINKS = "<br>\n    ".join(f'<a href="{url}" rel="me">{name}</a>' for name, url, _ in SOCIAL)
OV_BLOCK = f'<p class="ov-corner ov-br">\n    {OV_LINKS}\n  </p>'

SAME_AS = ",\n  " + '"sameAs": [' + ", ".join(f'"{url}"' for _, url, _ in SOCIAL) + "]"

BLURB = ('<p style="color:var(--on-dark-mute);font-size:var(--fs-small)">Bespoke furniture '
         'and interior styling, designed and crafted in Chattogram.</p>')

EDITS = []

# ---- 1. the footer's first column, in both copies of the chrome ---------------
for rel, indent in (("index.html", "        "), ("js/chrome.js", "        ")):
    EDITS.append((rel, f"{indent}{BLURB}\n",
                  f"{indent}{BLURB}\n" + FOOT_BLOCK))

# ---- 2. the overlay's bottom-right corner. It replaces "HFM — EN", which was the
# only corner carrying nothing a visitor could act on — and one of just two corners
# that survive the narrow breakpoint at css/nav.css:639. ------------------------
for rel in ("index.html", "js/chrome.js"):
    EDITS.append((rel, '<p class="ov-corner ov-br">HFM — EN</p>', OV_BLOCK))

# ---- 3. sameAs on both business JSON-LD blocks -------------------------------
EDITS.append(("index.html",
              '"@type": "FurnitureStore",\n  "name": "Heaven Furniture Mart"',
              '"@type": "FurnitureStore",\n  "name": "Heaven Furniture Mart"' + SAME_AS))
EDITS.append(("showroom/index.html",
              '"@type": "FurnitureStore",\n  "name": "Heaven Furniture Mart"',
              '"@type": "FurnitureStore",\n  "name": "Heaven Furniture Mart"' + SAME_AS))


def main() -> int:
    bad = 0
    for rel, old, new in EDITS:
        p = Path(rel)
        t = p.read_text(encoding="utf-8")
        n = t.count(old)
        if n != 1:
            print(f"{'MISS ' if n == 0 else 'AMBIG'} {rel} ({n}x): {old.splitlines()[0][:60]}")
            bad += 1
            continue
        p.write_text(t.replace(old, new), encoding="utf-8")
        print(f"ok    {rel}: {old.splitlines()[0][:60]}")
    return 2 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
