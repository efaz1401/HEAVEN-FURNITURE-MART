"""Cross-checks the client's price table against data/pieces.js before the pricing
model is wired in — a typo'd id or a dimension that disagrees would silently
produce a piece with no price or a configurator calibrated to the wrong size.

    python scripts/check-price-table.py
"""
import re

# The 18 ids from the client's price table, in their order.
TABLE = [
    ('royal_blue_gold_luxury_sofa_pair',          '220 92 104',  '6–8 weeks',   120000, 180000),
    ('minimalist_cream_modular_sectional_sofa',   '280 160 78',  '5–7 weeks',    85000, 130000),
    ('classic_wooden_cream_cushion_sofa_set',     '210 85 95',   '6–8 weeks',   150000, 220000),
    ('luxury_wooden_bed_teal_velvet_headboard',   '193 215 130', '7–9 weeks',    90000, 140000),
    ('majesty_glame_emerald_green_velvet_bed',    '200 220 140', '6–8 weeks',    75000, 115000),
    ('royal_navy_gold_velvet_bed',                '200 220 165', '9–11 weeks',  140000, 210000),
    ('white_wooden_panel_bed',                    '180 210 120', '5–7 weeks',    60000,  95000),
    ('royal_gold_carved_dining_chair',            '52 58 112',   '4–6 weeks',    18000,  28000),
    ('carved_wooden_glass_display_showcase',      '120 45 190',  '8–10 weeks',  110000, 165000),
    ('luxury_cream_gold_glass_showcase',          '110 42 185',  '8–10 weeks',   95000, 145000),
    ('luxury_marble_dining_table_leather_chairs', '180 95 78',   '7–9 weeks',   160000, 240000),
    ('luxury_cream_marble_dining_table_set',      '200 100 78',  '9–11 weeks',  220000, 320000),
    ('luxury_carved_dining_table_cream_chairs',   '210 105 78',  '10–12 weeks', 280000, 420000),
    ('executive_brown_leather_tufted_chair',      '68 72 118',   '3–4 weeks',    32000,  48000),
    ('executive_black_leather_tufted_chair',      '68 72 118',   '3–4 weeks',    30000,  46000),
    ('executive_black_padded_wood_chair',         '70 74 122',   '4–5 weeks',    35000,  52000),
    ('ergonomic_black_mesh_highback_chair',       '65 68 125',   '2–3 weeks',    22000,  34000),
    ('minimalist_black_gold_shoe_cabinet',        '100 35 120',  '5–7 weeks',    42000,  65000),
]

src = open('data/pieces.js', encoding='utf-8').read()
have = re.findall(r"^\s*id: '([a-z0-9_]+)'", src, re.M)
want = [row[0] for row in TABLE]

print(f'catalogue: {len(have)} pieces   price table: {len(want)} rows\n')
missing = [w for w in want if w not in have]
extra = [h for h in have if h not in want]
print('in the table but not the catalogue :', missing or 'none')
print('in the catalogue but not the table :', extra or 'none')

print('\n%-44s %-14s %-14s %s' % ('id', 'dims (file)', 'dims (table)', 'lead / spread'))
print('-' * 104)
problems = 0
for pid, dims, lead, lo, hi in TABLE:
    if pid not in have:
        continue
    blk = src[src.index(f"id: '{pid}'"):]
    dim_src = re.search(r'dims: \[(.*?)\],\n', blk, re.S).group(1)
    nums = ' '.join(re.findall(r"', (\d+),", dim_src))
    lead_src = re.search(r"lead: '([^']+)'", blk).group(1)
    ok_d = nums == dims
    ok_l = lead_src == lead
    if not (ok_d and ok_l):
        problems += 1
    print('%-44s %-14s %-14s %s  %s  x%.2f' % (
        pid[:44], nums, dims,
        ('lead OK' if ok_l else f'LEAD: {lead_src} vs {lead}'),
        ('dims OK' if ok_d else 'DIMS MISMATCH'),
        hi / lo))

print(f'\n{problems} row(s) disagree with the catalogue.')
print('price spread (max/min) is the band the configurator has to cover:')
spreads = [hi / lo for _, _, _, lo, hi in TABLE]
print(f'  min {min(spreads):.2f}x   max {max(spreads):.2f}x   mean {sum(spreads)/len(spreads):.2f}x')
