"""Rewrites the ordering section of DECISIONS.md.

A file rather than a heredoc: the replacement text contains triple quotes, ৳,
backticks and a fenced code block, all of which a shell heredoc mangles — the
first attempt terminated the Python string early and died on a syntax error.

    python scripts/update-decisions.py
"""
NEW = '''## Ordering — configured prices, a cart, and Web3Forms

The site takes **orders**, not just enquiries: every piece is configurable, every
configuration has a price, and the checkout emails the whole order to the
workshop with no backend involved.

**There is still no payment, deliberately.** Pieces are made to order and priced
per commission, so the site shows an **estimate** and the workshop confirms it
against the final drawing. That word appears on the configurator, the cart, the
checkout, the confirmation page and inside the order email. A site that cannot
take money must not imply that it has.

### The pricing model

Each piece carries `price: { min, max }` in BDT, transcribed from the workshop's
own table. **That range is the specification band, not uncertainty:**

| | |
|---|---|
| `min` | the piece exactly as listed — standard size, base materials |
| `max` | the same piece at the top material tier and larger dimensions |
| below `min` | smaller than standard, floored at -15% |
| above `max` | add-ons, which genuinely are extra work |

```
sizeNorm  = (V / V_standard)^0.6 - 1        // from three dimension sliders
matNorm   = 0 | 0.5 | 1                      // material tier
specLevel = clamp(sizeNorm x 1.1 + matNorm x 0.75, -0.15, 1.0)
unit      = round(min + (max - min) x specLevel + addOns, 500)
```

`volumeExponent: 0.6` is the load-bearing constant. Bespoke cost tracks the
frame, the joinery hours and the covered surface, not the air inside - so +25% on
one dimension adds ~14% of the band, and +25% on all three adds 55%, which with a
material upgrade reaches the published maximum.

**All 18 pieces calibrate exactly**: standard spec lands on the published minimum
and top spec on the published maximum, from four constants and no per-piece
tuning. That worked because the spreads were uniform - 1.45x to 1.58x, mean
1.52x. `scripts/check-price-table.py` re-derives it; `_ref/verify-pricing.mjs`
asserts it.

Two model decisions worth keeping:

- **Percentage add-ons.** A flat 6,000 warranty is trivial on a 420,000 dining
  set and absurd on an 18,000 chair. At 5% it is 14,000 and 1,000. Percentages
  take their share of the pre-add-on price and deliberately do not compound with
  each other.
- **`matGroup` names the cost driver, not every material.** The Classic Sofa Set
  has damask cushions but its price moves with the exposed teak frame, so it is
  `hardwood`. The marble dining sets are `stone`.

**BDT only.** The USD column was supplied and deliberately not stored - a second
currency nothing reads is a maintenance liability. Formatting uses Western
grouping to match the client's table rather than the lakh grouping `Intl`
produces for `en-IN`.

### The configurator

`js/configurator.js` mounts into one `<div id="configurator">` that all 18 piece
templates carry, so the controls are one implementation rather than eighteen.
Three dimension sliders seeded from the piece's own `dims` (+/-25%, stepping 5cm
on large pieces and 1cm on chairs), the three-rung material ladder for its
`matGroup`, the existing `variants` as finish chips, add-on checkboxes with a
mutually-exclusive delivery pair, a live estimate, and a reset link that appears
only once something has moved.

Each material tier shows what **choosing it** would cost from the current
configuration, not from an abstract base - the comparison a person is actually
making.

The configuration is mirrored into the URL hash (`#cfg=60x58x112,m1,vGold...`)
with `replaceState`, so the address bar always describes what is on screen, the
link is shareable, and the cart's Edit link can reopen an exact specification. A
malformed hash falls back to standard spec - a bad link must open the piece, not
an error.

### The cart and checkout

`js/order.js` owns all three localStorage keys - cart, customer details, last
order. **Line identity is the whole configuration**: two identical chairs are one
line of two, but the same chair 8cm wider is a different thing to build and a
different line.

The old `hfm-room-v1` board is **migrated, not discarded**, on first read: its
`{ id, variant, qty }` records become standard-specification lines, which is what
they meant.

The cart does **not** offer inline specification editing. Rebuilding three
sliders, a ladder and six add-ons there would be a second implementation to keep
in step; instead each line links back to the piece page with its configuration in
the hash. Quantity is editable in the cart, because that is the change people
make while looking at a total.

**Web3Forms carries the order.** The checkout is a genuine
`<form method="post" action="https://api.web3forms.com/submit">`, so **with
JavaScript disabled it still submits**, still emails the workshop, and its
`redirect` field still lands the customer on our own `/thanks/`. With JavaScript
it is intercepted: inline validation, hidden fields filled, `fetch`, then the
confirmation page with an order reference. Progressive enhancement, not two code
paths.

Decisions inside that:

- **The cart clears only after a confirmed success.** A failed submit keeps the
  order so it can be retried or sent over WhatsApp. Clearing optimistically would
  lose real orders to transient failures.
- **`form.noValidate` is set from JS, never in the markup.** The fields keep
  `required` so a no-JS submit is validated by the browser; with JS the native
  validation would otherwise fire first and block the submit event entirely,
  which is a bug this actually had - the browser focused the field and showed
  nothing else.
- **Email is optional; a reply-to is substituted when it is blank.** Web3Forms
  uses `email` as reply-to and its docs could not be verified from here (their
  API rejects server-side requests and sits behind Cloudflare, which blocks the
  test browser). Substituting removes the unknown rather than betting on it.
  Phone is the real contact channel and always travels in the body.
- **One document builder.** `buildOrderDocument()` in `js/pricing.js` produces
  the email body and the WhatsApp fallback, so the two can never describe the
  same order differently.
- **The access key is public by design.** It is not a credential - only a submit
  permission for one form - and Web3Forms requires it client-side. The
  consequence is that junk submissions are possible; the honeypot and their spam
  filter are the mitigation, as with any contact form.

**Free tier is 250 submissions/month**, and at the cap Web3Forms *rejects* rather
than queues. That is what the WhatsApp fallback is for, and it is offered on the
confirmation page always - not only on failure - because a silently lost email
should never cost an order.

Orders go to **8801885133937**; general enquiries stay on **8801708446655**.

### Two bugs this work produced, both fixed

**`paintCartCount()` deleted the cart button.** It wrote `el.textContent` on the
`[data-cart-label]` element, and `.pill-cart` *is* that element - so the write
destroyed its children, taking the SVG and the count badge with it. The same
class of defect as `scrambleEl()` in `js/menu.js`. It now sets `aria-label`,
which cannot flatten markup, and that also removed a `font-size: 0` clipping hack
the text node had needed.

**A floated `<legend>` overflowed the document by 110px at every width.** The
usual `float: left; width: 100%` legend trick exists to escape a fieldset's
border notch, and this fieldset has `border: 0`, so there was no notch. But
`.cfg-tiers` is `display: grid`, a grid container establishes its own formatting
context and therefore must not overlap a float, so it shifted right by the full
width of a 100%-wide float. Measured `scrollWidth: 485` in a 375px viewport.
`display: block` gives identical layout with none of it.

### What still is not there

No payment. It needs prices (now done) **and** a gateway that settles to a
Bangladeshi account - and **Stripe does not onboard Bangladeshi merchants**,
which rules out the default rail for Snipcart and Ecwid. SSLCommerz is the
credible local option (33+ methods including bKash, Nagad, Rocket, Upay) but its
integration is irreducibly server-side, so it would break the zero-build
constraint.

No order pipeline. Web3Forms' Sheets and Notion forwarding are paid features, so
the free tier gives a stack of emails rather than a board with a status column.
That is the upgrade to buy if tracking orders through production starts to hurt.

---

'''

path = 'DECISIONS.md'
s = open(path, encoding='utf-8').read()
START = '## Ordering'
END = '## Verification'
i = s.index(START)
j = s.index(END)
open(path, 'w', encoding='utf-8', newline='').write(s[:i] + NEW + s[j:])
print('rewrote the ordering section of DECISIONS.md')
