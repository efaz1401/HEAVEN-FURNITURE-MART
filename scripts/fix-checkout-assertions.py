"""Three stale assertions in _ref/verify-checkout.mjs, all of the same kind: a literal
that used to be true.

  1+2. Two checks hardcoded wa.me/8801885133937, the second WhatsApp line. The company
       brief gives ONE number, so ORDERS_WHATSAPP now aliases WHATSAPP — and the fix is
       to import the constant, not to retype the new digits, because a second real line
       can be restored by changing that one export.

  3.   The Edit round-trip compared the restored sliders to the literal '60,58,112' and
       read them positionally. 24 of the 54 dimensions in this catalogue are fixed and
       render as a stated value with no slider, so the third <input> is not the third
       axis — the check has failed since that landed, in V4 as well. Rewritten to
       address every axis by its own row and to assert the fixed ones too, which is
       strictly more than it checked before.
"""
from pathlib import Path
import sys

p = Path('_ref/verify-checkout.mjs')
t = p.read_text(encoding='utf-8')
before = t

t = t.replace(
    "import { chromium } from 'playwright';",
    "import { chromium } from 'playwright';\n"
    "/* The number under test comes from the source of truth. Retyping it here is how\n"
    "   these two checks went stale in the first place. */\n"
    "import { ORDERS_WHATSAPP } from '../data/pieces.js';",
    1)

t = t.replace(
    """  check('WhatsApp copy goes to the ORDERS number',
    !ty.waHidden && /wa\\.me\\/8801885133937/.test(ty.waHref));""",
    """  check('WhatsApp copy goes to the ORDERS number',
    !ty.waHidden && ty.waHref.includes(`wa.me/${ORDERS_WHATSAPP}`), ty.waHref);""")

t = t.replace(
    """  check('offers the WhatsApp fallback with the order pre-filled',
    /wa\\.me\\/8801885133937/.test(f.waHref) && /Rahim/.test(decodeURIComponent(f.waHref)));""",
    """  check('offers the WhatsApp fallback with the order pre-filled',
    f.waHref.includes(`wa.me/${ORDERS_WHATSAPP}`) && /Rahim/.test(decodeURIComponent(f.waHref)),
    f.waHref.slice(0, 60));""")

t = t.replace(
    """  const restored = await page.evaluate(() => ({
    dims: [...document.querySelectorAll('.cfg-range')].map((r) => r.value),
    mat: [...document.querySelectorAll('.cfg-tier input')].findIndex((i) => i.checked),
    price: document.querySelector('.cfg-price').textContent,
  }));
  check('Edit reopens the piece on that exact specification',
    restored.dims.join(',') === '60,58,112' && restored.mat === 1,
    `${restored.dims.join(',')} / tier ${restored.mat} / ${restored.price}`);""",
    """  /* One entry per AXIS, in piece.dims order, because a fixed dimension renders as a
     stated value with no slider — so the Nth <input> is not the Nth axis. Reading the
     sliders positionally is what made this check compare 60,58 to 60,58,112. */
  const restored = await page.evaluate(() => ({
    axes: [...document.querySelectorAll('.cfg-row')].map((row) => ({
      slider: row.querySelector('.cfg-range')?.value ?? null,
      stated: row.querySelector('.cfg-val')?.textContent ?? null,
    })),
    mat: [...document.querySelectorAll('.cfg-tier input')].findIndex((i) => i.checked),
    price: document.querySelector('.cfg-price').textContent,
  }));

  /* The fragment always carries all three axes; only the adjustable ones have a
     slider to restore into, and the rest must still agree with what is stated. */
  const want = c.edit.match(/#cfg=(\\d+)x(\\d+)x(\\d+)/).slice(1, 4);
  const wrong = restored.axes
    .map((a, i) => (a.slider !== null
      ? (a.slider === want[i] ? null : `axis ${i} slider ${a.slider} != ${want[i]}`)
      : (String(a.stated || '').startsWith(want[i]) ? null : `axis ${i} states ${a.stated} != ${want[i]}`)))
    .filter(Boolean);
  check('Edit reopens the piece on that exact specification',
    wrong.length === 0 && restored.axes.length === 3 && restored.mat === 1,
    wrong.length ? wrong.join('; ') : `${want.join(',')} / tier ${restored.mat} / ${restored.price}`);""")

if t == before:
    print('nothing changed — every target missed')
    sys.exit(2)
p.write_text(t, encoding='utf-8')
print('patched _ref/verify-checkout.mjs')
