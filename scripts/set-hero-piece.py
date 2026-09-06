"""Swaps the homepage hero's 3D subject.

`data-piece` on #hero-stage is the one place the model is chosen — js/hero3d.js
derives the .glb path from it and gates on that piece's `hasModel` — but four
other things in index.html name the same piece and have to move with it: the
preload hint, the still's src/srcset, its alt text, and the caption link. Miss one
and you get a mismatched still, a wasted preload of an image nothing uses, or a
caption pointing at the wrong product.

Scripted so all five change together and are verified afterwards.

    python scripts/set-hero-piece.py <piece_id>

Idempotent: re-running with the same id is a no-op.
"""
import re
import sys

FROM_ANY = r'[a-z0-9_]+'
target = (sys.argv[1] if len(sys.argv) > 1 else 'executive_black_leather_tufted_chair')

# ---- Look the piece up in the single source of truth ------------------------
data = open('data/pieces.js', encoding='utf-8').read()
try:
    i = data.index(f"id: '{target}',")
except ValueError:
    raise SystemExit(f'no such piece in data/pieces.js: {target}')
# The record ends at a closing brace on its own indented line. NOT the first
# '},' after the id — `price: { min: …, max: … },` contains one, which truncated
# the block before `alt:` and made the lookup throw.
block = data[i:data.index('\n  },', i)]

name = re.search(r"name: '([^']+)'", block).group(1)
alt = re.search(r"alt: '([^']+)'", block).group(1)
has_model = "hasModel: true" in block

if not has_model:
    raise SystemExit(f'{target} has hasModel: false — js/hero3d.js would refuse to '
                     'load 3D and the hero would silently stay a still. Pick a piece '
                     'with a GLB.')

import os
glb = f'assets/models/{target}.glb'
if not os.path.exists(glb):
    raise SystemExit(f'{glb} does not exist, even though hasModel is true — fix the '
                     'data or the asset before pointing the hero at it.')
for size in ('512', '1024'):
    cut = f'assets/img/{target}_cut_{size}.webp'
    if not os.path.exists(cut):
        raise SystemExit(f'{cut} missing — the hero still and its preload need it.')

# ---- Rewrite the five places index.html names the subject -------------------
path = 'index.html'
s = open(path, encoding='utf-8').read()

current = re.search(r'id="hero-stage" data-piece="(' + FROM_ANY + r')"', s).group(1)
if current == target:
    print(f'hero already shows {target} — nothing to do')
    raise SystemExit(0)

before = s

# 1 + 2. the preload hint (href + imagesrcset)
s = s.replace(f'href="assets/img/{current}_cut_1024.webp"',
              f'href="assets/img/{target}_cut_1024.webp"')
s = s.replace(
    f'imagesrcset="assets/img/{current}_cut_512.webp 512w, assets/img/{current}_cut_1024.webp 1024w"',
    f'imagesrcset="assets/img/{target}_cut_512.webp 512w, assets/img/{target}_cut_1024.webp 1024w"')

# 3. data-piece — the one js/hero3d.js reads
s = s.replace(f'data-piece="{current}"', f'data-piece="{target}"')

# 4. the still: src, srcset, alt
s = s.replace(f'src="assets/img/{current}_cut_1024.webp"',
              f'src="assets/img/{target}_cut_1024.webp"')
s = s.replace(f'srcset="assets/img/{current}_cut_512.webp 512w,\n                     '
              f'assets/img/{current}_cut_1024.webp 1024w"',
              f'srcset="assets/img/{target}_cut_512.webp 512w,\n                     '
              f'assets/img/{target}_cut_1024.webp 1024w"')
s = re.sub(r'(class="hero-still".*?)alt="[^"]*"', lambda m: m.group(1) + f'alt="{alt}"',
           s, count=1, flags=re.S)

# 5. the caption link and label
s = re.sub(r'(<a class="rule-link" href="piece/)' + FROM_ANY + r'(/">)[^<]*(</a>)',
           lambda m: m.group(1) + target + m.group(2) + name + m.group(3), s, count=1)

if s == before:
    raise SystemExit('nothing changed — the markup shape has moved; inspect index.html')
open(path, 'w', encoding='utf-8', newline='').write(s)

# ---- Verify: the OLD id must be gone from the hero entirely -----------------
hero = s[s.index('<section id="hero"'):s.index('<!-- ===================== §2')]
head = s[:s.index('</head>')]
problems = []
if current in hero:
    problems.append(f'old id still present in the hero section')
if current in head:
    problems.append(f'old id still present in the preload hint')
for want, where in [(f'data-piece="{target}"', 'data-piece'),
                    (f'{target}_cut_1024.webp', 'still src'),
                    (f'{target}_cut_512.webp', 'still srcset'),
                    (f'piece/{target}/', 'caption link'),
                    (alt, 'alt text'),
                    (name, 'caption label')]:
    if want not in s:
        problems.append(f'{where} not updated')

print(f'hero subject: {current} -> {target}')
print(f'  name  : {name}')
print(f'  alt   : {alt[:70]}')
print(f'  glb   : {glb} ({os.path.getsize(glb) // 1024} KB)')
print('  checks:', '; '.join(problems) if problems else 'all five references updated, old id gone')
