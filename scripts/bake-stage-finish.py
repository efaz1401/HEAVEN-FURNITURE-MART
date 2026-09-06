#!/usr/bin/env python3
"""Bake the stage swatch row into the 5 variant pieces' static markup.

WHY: js/piece.js builds the .stage-finish block after first paint (~120ms on
a warm cache), which pushed #ar-btn and everything below it down ~200px and
gave the piece pages a measured CLS of 0.1167 where V5 measured 0.0000
(_ref/measure-cls.mjs, verified against both trees side by side). Reserving
the space from parse time is the fix, and static markup is the only thing
that can occupy space before paint on a no-build site.

Only the 5 pieces with variants get the block — the other 13 must not carry
a 112px hole above the fold. Per-page markup variance is this codebase's
established pattern (see scripts/set-piece-initial-state.py).

The static block is a SHELL: label, active-name and swatch <li>s carry the
data (name + tint hex) so the page renders correctly with JS off, and
js/piece.js adopts the existing nodes and wires the listeners instead of
creating the block. Idempotent: skips any page that already has
#stage-finish in the markup.

CRLF-aware: all HTML on disk is CRLF; every regex below tolerates it.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Mirrors TINTS in js/piece.js — kept in one place there; this migration only
# needs the hexes for the 5 pieces that carry variants. If a colourway is
# added, re-run this script after adding the tint there.
TINTS = {
    'royal blue': '#1E2FB8', 'emerald': '#0E6B4F', 'burgundy': '#6E1220',
    'ivory': '#EFE7D6', 'gold on ivory': '#C9A227', 'ivory on ivory': '#E6DCC8',
    'teal velvet': '#1F5E63', 'charcoal velvet': '#3A3A3C', 'blush velvet': '#C98F8A',
    'cream': '#EFE4D2', 'oat': '#D8C7A9', 'charcoal': '#33343A', 'clay': '#B5674B',
    'brown': '#5C3A28', 'black': '#1A1A1C', 'oxblood': '#8E1F2B',
}

def tint_for(name):
    k = name.lower().strip()
    if k in TINTS:
        return TINTS[k]
    for key in sorted(TINTS, key=len, reverse=True):
        if key in k:
            return TINTS[key]
    return '#8A8A8A'

# piece slug -> variants (from data/pieces.js; re-check if the catalogue grows)
VARIANT_PIECES = {
    'minimalist_cream_modular_sectional_sofa': ['Cream', 'Oat', 'Charcoal', 'Clay'],
    'luxury_wooden_bed_teal_velvet_headboard': ['Teal Velvet', 'Charcoal Velvet', 'Blush Velvet'],
    'royal_gold_carved_dining_chair': ['Gold on Ivory', 'Ivory on Ivory'],
    'executive_brown_leather_tufted_chair': ['Brown', 'Black', 'Oxblood'],
}

def swatch_li(name, pressed):
    return (f'          <li><button class="swatch" type="button" aria-pressed="{pressed}">'
            f'<span class="chip" style="background:{tint_for(name)}"></span>{name}</button></li>')

def build_block(variants):
    lis = '\r\n'.join(swatch_li(v, 'true' if i == 0 else 'false') for i, v in enumerate(variants))
    first = variants[0]
    return f'''\r
      <!-- Baked in by scripts/bake-stage-finish.py: this block occupies its
           space from parse time, so js/piece.js wiring it can never shift the
           layout. The first swatch ships aria-pressed="true" so a JS-off
           visitor still sees the listed finish selected. -->
      <div class="stage-finish" id="stage-finish">
        <div class="stage-finish-head">
          <span class="stage-finish-label" data-i18n="finish_title">Select Color &amp; Finish</span>:
          <strong class="stage-finish-active" id="stage-finish-name">{first}</strong>
        </div>
        <ul class="swatches stage-swatches">
{lis}
        </ul>
      </div>
'''

def main():
    changed = 0
    for slug, variants in VARIANT_PIECES.items():
        page = ROOT / 'piece' / slug / 'index.html'
        if not page.exists():
            print(f'  SKIP  {slug}: no such page'); continue
        src = page.read_text(encoding='utf-8')
        if 'id="stage-finish"' in src:
            print(f'  SKIP  {slug}: already baked'); continue
        # Insert AFTER the closing </div> of the .stage element and BEFORE
        # .scale-ctl. The stage-closing tag is the LAST </div> before
        # scale-ctl's opening tag — inserting at m.start(1) would land the
        # block INSIDE the stage (it overlays the 3D poster: the stage is a
        # position:relative aspect-ratio box), so insert after the tag, not
        # before it. The comment line above the block starts a fresh line.
        m = re.search(r'(</div>)(\s*\r?\n\s*)(<div class="scale-ctl")', src)
        if not m:
            print(f'  MISS  {slug}: stage/scale-ctl boundary not found'); continue
        block = build_block(variants)
        # Re-anchor on the closing tag's END, dropping the original
        # whitespace so the block is a clean sibling between stage and ctl.
        src = src[:m.end(1)] + '\r\n      ' + block + '\r\n      ' + src[m.end(1):].lstrip()
        page.write_text(src, encoding='utf-8', newline='')
        changed += 1
        print(f'  OK    {slug}: baked {len(variants)} swatches')
    print(f'{changed} pages updated')
    return 0 if changed or all(('id="stage-finish"' in (ROOT / 'piece' / s / 'index.html').read_text(encoding='utf-8')) for s in VARIANT_PIECES) else 1

if __name__ == '__main__':
    sys.exit(main())
