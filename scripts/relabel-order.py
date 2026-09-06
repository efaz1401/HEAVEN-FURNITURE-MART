"""One-off: relabel the "room board" as the "order request" everywhere it is
user-facing. Kept as a file rather than run as a shell one-liner because the
footer link exists in TWO places (index.html is static, the other 32 pages are
built by js/chrome.js) and the 18 piece-page buttons need the markup label to
agree with the one js/piece.js writes at runtime — a JS-off visitor reads the
markup.

    python scripts/relabel-order.py
"""
import glob
import os
import re

edits = [
    ('index.html',
     '<li><a href="room/">My room board</a></li>',
     '<li><a href="room/">My order request</a></li>'),
    ('js/chrome.js',
     '<li><a href="${R}room/">My room board</a></li>',
     '<li><a href="${R}room/">My order request</a></li>'),
    ('js/piece.js',
     'piece page: 3D viewer, AR, variants, room board.',
     'piece page: 3D viewer, AR, variants, order board.'),
    ('data/pieces.js',
     'Every collection page, piece page, AR page and the room board read this.',
     'Every collection page, piece page, AR page and the order board read this.'),
]

for path, old, new in edits:
    s = open(path, encoding='utf-8').read()
    if old not in s:
        print(f'  skip (already done): {path}')
        continue
    open(path, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
    print(f'  updated: {path}')

n = 0
for f in sorted(glob.glob('piece/*/index.html')):
    s = open(f, encoding='utf-8').read()
    t = s.replace('id="add-room" type="button">Add to my room<',
                  'id="add-room" type="button">Add to my order<')
    if t != s:
        open(f, 'w', encoding='utf-8', newline='').write(t)
        n += 1
print(f'  updated the add button in {n} piece pages')

SKIP = ('_ref/', 'dist/', 'playwright', 'scripts/')
left = []
targets = glob.glob('**/*.html', recursive=True) + glob.glob('js/*.js') + glob.glob('data/*.js')
for f in targets:
    norm = f.replace(os.sep, '/')
    if any(x in norm for x in SKIP):
        continue
    for i, line in enumerate(open(f, encoding='utf-8', errors='replace'), 1):
        if re.search(r'room board|my room', line, re.I):
            left.append(f'{norm}:{i}  {line.strip()[:78]}')

print('\nremaining user-facing references:')
print('\n'.join('  ' + x for x in left) if left else '  none')
