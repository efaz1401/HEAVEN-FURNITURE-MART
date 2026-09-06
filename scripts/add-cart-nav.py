"""Adds the cart button to the nav and a 4th dock slot, in BOTH chrome copies.

The header and dock exist twice on this site: statically in index.html (the
homepage does not load js/chrome.js) and as template strings in js/chrome.js for
the other 32 pages. Any chrome change has to land in both or the homepage
silently diverges — this is the same trap the monogram swap hit.

    python scripts/add-cart-nav.py
"""
import re

CART_SVG = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
    'aria-hidden="true"><path d="M4 5h2.2l2.1 10.4a1.6 1.6 0 001.6 1.3h8.4a1.6 1.6 0 '
    '001.6-1.3L21 8H7"/><circle cx="10.5" cy="20" r="1.3"/>'
    '<circle cx="18" cy="20" r="1.3"/></svg>'
)

# ---- 1. js/chrome.js -------------------------------------------------------
p = 'js/chrome.js'
s = open(p, encoding='utf-8').read()

if 'CART_SVG' not in s:
    s = s.replace(
        "const SEARCH_SVG =",
        f"const CART_SVG = '{CART_SVG}';\nconst SEARCH_SVG =",
        1)

    # The cart sits between search and the language indicator: it is an action,
    # so it belongs with the other actions rather than after the passive "EN".
    s = s.replace(
        '    <span class="pill-lang" aria-label="Language: English">EN</span>',
        '    <a class="pill-util pill-cart" href="${R}cart/" data-cart-label>Cart is empty\n'
        '      ${CART_SVG}<span class="cart-count" data-cart-count hidden></span>\n'
        '    </a>\n'
        '    <span class="pill-lang" aria-label="Language: English">EN</span>',
        1)

    # Dock: 3 slots become 4. Cart goes beside AR, before WhatsApp, so the two
    # "get in touch" actions stay together at the end.
    s = s.replace(
        '    <a class="is-ar" href="${R}ar/">${AR_SVG} See in your room</a>',
        '    <a class="is-ar" href="${R}ar/">${AR_SVG} See in your room</a>\n'
        '    <a href="${R}cart/">${CART_SVG} Cart<span class="dock-count" data-cart-count hidden></span></a>',
        1)
    s = s.replace(
        ".dock-inner { display: grid; grid-template-columns: 1fr 1.3fr 1fr; }", "")
    open(p, 'w', encoding='utf-8', newline='').write(s)
    print(f'  updated {p}')
else:
    print(f'  skip (already done): {p}')

# ---- 2. index.html (the static copy) --------------------------------------
p = 'index.html'
s = open(p, encoding='utf-8').read()

if 'pill-cart' not in s:
    s = s.replace(
        '    <span class="pill-lang" aria-label="Language: English">EN</span>',
        f'    <a class="pill-util pill-cart" href="cart/" data-cart-label>Cart is empty\n'
        f'      {CART_SVG}<span class="cart-count" data-cart-count hidden></span>\n'
        f'    </a>\n'
        f'    <span class="pill-lang" aria-label="Language: English">EN</span>',
        1)

    old_dock = re.search(
        r'    <a class="is-ar" href="ar/">.*?</a>\n', s, re.S)
    if not old_dock:
        raise SystemExit('index.html: AR dock slot not found')
    s = s[:old_dock.end()] + (
        f'    <a href="cart/">\n      {CART_SVG}\n'
        f'      Cart<span class="dock-count" data-cart-count hidden></span>\n    </a>\n'
    ) + s[old_dock.end():]
    open(p, 'w', encoding='utf-8', newline='').write(s)
    print(f'  updated {p}')
else:
    print(f'  skip (already done): {p}')

# ---- verify both copies agree ---------------------------------------------
problems = []
for f, href in [('index.html', 'cart/'), ('js/chrome.js', '${R}cart/')]:
    t = open(f, encoding='utf-8').read()
    if t.count('pill-cart') != 1:
        problems.append(f'{f}: pill-cart count != 1')
    if t.count('data-cart-count') != 2:
        problems.append(f'{f}: expected 2 data-cart-count (nav + dock), got {t.count("data-cart-count")}')
    if f'href="{href}"' not in t:
        problems.append(f'{f}: cart href missing')
print('verification:', '\n  ' + '\n  '.join(problems) if problems else 'both chrome copies carry the cart')
