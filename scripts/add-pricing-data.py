"""Adds `price`, `matGroup` and `addons` to all 18 pieces in data/pieces.js.

Scripted rather than hand-edited: 18 insertions at the same anchor is exactly the
kind of mechanical change where a hand edit silently misses one, and a piece
without a `price` would render "from ৳NaN" on its card.

Every number here is transcribed from the client's price table, in BDT. USD was
supplied too and is deliberately not stored — the site is BDT-only.

    python scripts/add-pricing-data.py
"""
import re

# id -> (min, max, matGroup, [addon keys])
#
# matGroup picks which material-tier ladder the configurator offers. It names the
# COST DRIVER, not every material present: the Classic Sofa Set has damask
# cushions but its price moves with the exposed teak frame, so it is 'hardwood'.
#
# addons are keys into ADDONS in data/pieces.js. Universal ones (delivery,
# protection, warranty) are appended automatically and are not listed here.
DATA = {
    # ---- living room ----
    'royal_blue_gold_luxury_sofa_pair':          (120000, 180000, 'upholstery', ['cushions', 'piping']),
    'minimalist_cream_modular_sectional_sofa':   ( 85000, 130000, 'upholstery', ['cushions', 'module']),
    'classic_wooden_cream_cushion_sofa_set':     (150000, 220000, 'hardwood',   ['cushions', 'piping']),
    # ---- bedroom ----
    'luxury_wooden_bed_teal_velvet_headboard':   ( 90000, 140000, 'upholstery', ['bedside', 'drawers']),
    'majesty_glame_emerald_green_velvet_bed':    ( 75000, 115000, 'upholstery', ['bedside', 'drawers']),
    'royal_navy_gold_velvet_bed':                (140000, 210000, 'upholstery', ['bedside', 'drawers']),
    'white_wooden_panel_bed':                    ( 60000,  95000, 'hardwood',   ['bedside', 'drawers']),
    # ---- dining ----
    'royal_gold_carved_dining_chair':            ( 18000,  28000, 'hardwood',   ['seatpad']),
    'carved_wooden_glass_display_showcase':      (110000, 165000, 'hardwood',   ['led', 'mirror']),
    'luxury_cream_gold_glass_showcase':          ( 95000, 145000, 'hardwood',   ['led', 'mirror']),
    'luxury_marble_dining_table_leather_chairs': (160000, 240000, 'stone',      ['chairs2', 'pads']),
    'luxury_cream_marble_dining_table_set':      (220000, 320000, 'stone',      ['chairs2', 'pads']),
    'luxury_carved_dining_table_cream_chairs':   (280000, 420000, 'stone',      ['chairs2', 'pads', 'lazy']),
    # ---- office ----
    'executive_brown_leather_tufted_chair':      ( 32000,  48000, 'leather',    ['headrest', 'alubase']),
    'executive_black_leather_tufted_chair':      ( 30000,  46000, 'leather',    ['headrest', 'alubase']),
    'executive_black_padded_wood_chair':         ( 35000,  52000, 'leather',    ['headrest', 'alubase']),
    'ergonomic_black_mesh_highback_chair':       ( 22000,  34000, 'mesh',       ['headrest', 'alubase']),
    # ---- bespoke ----
    'minimalist_black_gold_shoe_cabinet':        ( 42000,  65000, 'lacquer',    ['shelf', 'softclose']),
}

path = 'data/pieces.js'
src = open(path, encoding='utf-8').read()

added = 0
for pid, (lo, hi, group, addons) in DATA.items():
    marker = f"id: '{pid}',"
    if marker not in src:
        raise SystemExit(f'id not found in {path}: {pid}')
    start = src.index(marker)
    # Anchor on this piece's `alt:` line — the last field in every record.
    alt_at = src.index('    alt:', start)
    if 'price:' in src[start:alt_at]:
        continue                                   # idempotent: already done
    keys = ', '.join(f"'{k}'" for k in addons)
    block = (f"    price: {{ min: {lo}, max: {hi} }}, matGroup: '{group}',\n"
             f"    addons: [{keys}],\n")
    src = src[:alt_at] + block + src[alt_at:]
    added += 1

open(path, 'w', encoding='utf-8', newline='').write(src)
print(f'added price/matGroup/addons to {added} pieces')

# ---- verify every piece now has all three, and the ranges are sane ----------
recs = re.findall(
    r"id: '([a-z0-9_]+)',.*?price: \{ min: (\d+), max: (\d+) \}, matGroup: '(\w+)',\s*\n\s*addons: \[([^\]]*)\]",
    src, re.S)
print(f'verified: {len(recs)} pieces carry pricing data')
bad = [r[0] for r in recs if int(r[2]) <= int(r[1])]
print('ranges where max <= min:', bad or 'none')
groups = sorted({r[3] for r in recs})
print('material groups in use:', ', '.join(groups))
missing = set(DATA) - {r[0] for r in recs}
print('pieces still missing data:', missing or 'none')
