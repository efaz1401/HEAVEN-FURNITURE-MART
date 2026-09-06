"""Inventory every button-like control on the site: markup and JS-built.

   python scripts/audit-buttons.py

Written because "restyle the buttons" is only safe once you know how many there
really are, where they live, and which ones js/magnetic.js is bound to.
"""
import collections
import glob
import os
import re

files = [f for f in glob.glob('**/*.html', recursive=True)
         if not any(x in f.replace(os.sep, '/') for x in ('_ref/', 'playwright', 'dist/'))]
js = sorted(glob.glob('js/*.js'))

INTEREST = re.compile(
    r'btn|chip|swatch|rule-link|dots-btn|pill-cta|pill-util|arc-btn|film-play|'
    r'stage-poster|stage-exit|scale-reset|room-remove|psearch-close|skip|rail-node')

pat = re.compile(r'<(button|a)\b[^>]*?class="([^"]+)"', re.I)
count = collections.Counter()
pages = collections.defaultdict(set)


def bucket(path):
    p = path.replace(os.sep, '/')
    if p == 'index.html':
        return 'home'
    top = p.split('/')[0]
    return 'piece/* (18)' if top == 'piece' else top + '/'


for f in files:
    s = open(f, encoding='utf-8', errors='replace').read()
    for tag, cls in pat.findall(s):
        cls = ' '.join(cls.split())
        if not INTEREST.search(cls):
            continue
        count[(tag.lower(), cls)] += 1
        pages[cls].add(bucket(f))

print('MARKUP — %d HTML files\n' % len(files))
print('%-7s %-32s %6s  %s' % ('TAG', 'CLASS', 'TOTAL', 'PAGE TYPES'))
print('-' * 100)
for (tag, cls), n in sorted(count.items(), key=lambda kv: (-kv[1], kv[0][1])):
    w = sorted(pages[cls])
    print('%-7s %-32s %6d  %s' % (tag, cls[:32], n, ', '.join(w[:5]) + ('…' if len(w) > 5 else '')))

print('\n\nBUILT AT RUNTIME BY JS\n')
jsp = re.compile(r"""class\s*=\s*['"]([^'"]*(?:btn|chip|swatch|rule-link|close)[^'"]*)['"]""")
for f in js:
    s = open(f, encoding='utf-8', errors='replace').read()
    hits = set()
    for m in re.finditer(r"""className\s*=\s*['"]([^'"]+)['"]""", s):
        if INTEREST.search(m.group(1)):
            hits.add(m.group(1))
    for m in jsp.finditer(s):
        if INTEREST.search(m.group(1)):
            hits.add(m.group(1))
    if hits:
        print('  %-22s %s' % (os.path.basename(f), ', '.join(sorted(hits))))

print('\n\nMAGNETIC BINDING (js/magnetic.js)\n')
mag = open('js/magnetic.js', encoding='utf-8').read()
m = re.search(r'querySelectorAll\((.*?)\)', mag)
print('  selector:', m.group(1) if m else '?')
print('  mechanism: writes --mag-x / --mag-y, consumed by a transform in css/base.css')
print('  => any new transform on these MUST include var(--mag-x)/var(--mag-y) or the lean dies')
