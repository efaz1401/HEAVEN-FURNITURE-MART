"""Adds the configurator mount point and the two order controls to all 18 piece
templates, and removes the old single "Add to my order" button.

Scripted for the same reason as the pricing data: 18 identical edits is exactly
where a hand pass misses one, and a piece page without <div id="configurator">
would silently show no price at all.

The old block was:
    <a class="btn" id="wa-btn" ...>Ask for a quote on WhatsApp</a>
    <button class="btn btn--ghost" id="add-room" ...>Add to my order</button>

It becomes:
    <div id="configurator"></div>          <- js/configurator.js mounts here,
                                              and renders Order now / Add to cart
    <p><a class="rule-link" id="wa-btn" ...>Ask a question on WhatsApp</a></p>

Why the quote link demotes to a text link: the configurator now shows a real
price, so "ask for a quote" is no longer the primary action — it is the fallback
for someone who wants to talk first. Keeping it a full-width button beside two
order controls would give the page three competing primaries.

    python scripts/add-configurator.py
"""
import glob
import re

OLD = re.compile(
    r'[ \t]*<a class="btn" id="wa-btn" href="https://wa\.me/8801708446655">'
    r'Ask for a quote on WhatsApp</a>\s*\n'
    r'[ \t]*<button class="btn btn--ghost" id="add-room" type="button">'
    r'Add to my order</button>\s*\n'
)

NEW = (
    '        <!-- js/configurator.js mounts the specification panel here: the\n'
    '             dimension sliders, material tier, finish, add-ons, the live\n'
    '             estimate and the Order now / Add to cart controls. Empty in the\n'
    '             markup so all 18 pages stay template-identical, and so a page\n'
    '             with JS off simply has no configurator rather than a broken one. -->\n'
    '        <div id="configurator"></div>\n'
    '\n'
    '        <!-- Demoted from a button to a text link now that the panel above\n'
    '             carries a real price: this is for someone who wants to talk\n'
    '             before specifying, not the primary action. -->\n'
    '        <p class="piece-ask"><a class="rule-link" id="wa-btn"\n'
    '           href="https://wa.me/8801708446655">Ask a question on WhatsApp</a></p>\n'
)

done, skipped = [], []
for f in sorted(glob.glob('piece/*/index.html')):
    s = open(f, encoding='utf-8').read()
    if 'id="configurator"' in s:
        skipped.append(f)
        continue
    t, n = OLD.subn(NEW, s)
    if n != 1:
        raise SystemExit(f'{f}: expected 1 action block, matched {n} — aborting '
                         'rather than half-editing the catalogue')
    open(f, 'w', encoding='utf-8', newline='').write(t)
    done.append(f)

print(f'updated {len(done)} piece pages' + (f', skipped {len(skipped)} already done' if skipped else ''))

# ---- verify every page ended up consistent ---------------------------------
problems = []
for f in sorted(glob.glob('piece/*/index.html')):
    s = open(f, encoding='utf-8').read()
    if s.count('id="configurator"') != 1:
        problems.append(f'{f}: configurator mount count != 1')
    if 'id="add-room"' in s:
        problems.append(f'{f}: old add-room button still present')
    if s.count('id="wa-btn"') != 1:
        problems.append(f'{f}: wa-btn count != 1')
    if 'class="rule-link" id="wa-btn"' not in s:
        problems.append(f'{f}: wa-btn is not a rule-link')
print('verification:', '\n  ' + '\n  '.join(problems) if problems else 'all 18 consistent')
