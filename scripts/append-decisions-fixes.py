"""Appends the review-fix record to DECISIONS.md.

A file rather than a heredoc: the text contains ৳, backticks and code fences.

    python scripts/append-decisions-fixes.py
"""
BLOCK = '''
---

## Review fixes — what was wrong and what changed

An external code review found seven issues. Each was reproduced against the
running site before being accepted; all seven held, and one was worse than
reported. This section records the defects rather than only the fixes, because
several were invisible in the UI and would otherwise be reintroduced.

### The breakdown did not add up, on 10 of 18 pieces

The configurator printed three figures a customer reads in one glance — base,
extras, headline — and on ten pieces they did not sum. The dining chair showed
`18,000 + 10,700` under a headline of `28,500`; the emerald bed was out by 500.

`unitPrice()` computed its own **unrounded** base and rounded the sum once, while
the configurator printed the **already-rounded** `basePrice()` and fed that to
`addonsTotal()`. Two bases, one rounding.

Fixed by deriving `unitPrice()` from `basePrice()` and exporting **one**
`extrasPrice()` that everything calls. The magic `Math.round(x / 500) * 500` that
briefly appeared in `js/configurator.js` during the fix was exactly the third copy
that caused the problem, and was removed in favour of the shared function.
`_ref/check-rounding.mjs` must report `0 of 18`, and `_ref/verify-pricing.mjs`
asserts `basePrice + extrasPrice === unitPrice` for all 18 across every add-on.

**The lesson worth keeping: round once, in one place.** Any second rounding site
recreates this.

### Money was formatted for the wrong country

`taka()` used `toLocaleString('en-US')`, producing `৳420,000`. Bangladesh uses
lakh and crore: `৳4,20,000`. It is the most repeated string on the site.

Now `en-IN`. Deliberately **not** `bn-BD`, which renders Bengali numerals
(`৳৪,২০,০০০`) — that is a decision about the whole site's language, not a number
format.

### The no-JS checkout did not exist, and two files said it did

`js/checkout.js` and `checkout/index.html` both described a working no-JS path:
native POST, Web3Forms emails the order, `redirect` lands on `/thanks/`. Measured
with JavaScript disabled: both `#co-main` and `#co-empty` hidden, no reachable
submit, all hidden fields empty, page ending mid-sentence.

**It was not an unwired feature but an impossible one.** The cart lives in
`localStorage` and is read by `readCart()`, so a native POST cannot carry an order
only JavaScript can see. No arrangement of markup changes that.

Both claims are gone. `#co-empty` now renders **visible by default** — the wrong
way round for a JS page, and deliberate, because it is also the no-JS state — with
a WhatsApp link and a phone number. `js/checkout.js` hides it once there is a cart.
A visitor without JavaScript gets a route to a human instead of a dead page.

`/thanks/` also had contact-form wording ("we have your message") while serving
order confirmations, including the no-JS case where there is no `?ref=` and
nothing in storage to detect. Its static copy now reads true for both arrivals,
and `js/thanks.js` still upgrades to order-specific copy when it can.

### Four smaller defects

- **`isStandard` was wrong about add-ons.** It filtered presets out and checked the
  remainder was empty, so deselecting free Chattogram delivery still read as
  standard: no money moved, but the order document changed while the Reset link
  stayed hidden. It now compares the add-on **set** against the default set.
- **An O(n²) lookup with a correctness trap.** `js/checkout.js` did
  `lines.find((l) => l.id === id).piece` inside a `.map` over `lines`. The piece
  was already in scope, and the lookup returns the *wrong* line as soon as two
  lines share an id — which `signature()` explicitly supports.
- **Duplicated shape knowledge.** `js/order.js` hardcoded `Math.min(2, …)` for the
  material index while `materialNorm()` derived the same bound from
  `tiers.length - 1`. A fourth tier would have updated one of them.
- **PII with no expiry.** `hfm-customer-v1` held a name, phone and full delivery
  address indefinitely. Now a 30-day TTL enforced **on read**, not by a timer: a
  device never opened again never runs a timer, and a record with no timestamp is
  treated as expired rather than fresh. The checkout copy states the period.

### The carousel gutter, and one token instead of two numbers

`.arc-track` carried a page-margin gutter so slide 1 lined up under the headline.
That is the reference's pattern and it reads well to about 1500px, but the gutter
grows with the window: at 1955px it was **358px** of empty white against a
full-bleed right edge, and the row looked shoved rather than aligned. Slides also
travel *through* that gutter when scrolled, because a scroll container's padding
does not clip — so products filled the space only after a swipe, which is exactly
how it was reported.

Now full-bleed: `--arc-gutter: 20px`, read by **both** `.arc-track`'s padding and
`.arc-slide`'s `scroll-margin-inline-start`. Those two must be equal —
`scroll-snap-align: start` snaps to the scrollport edge, so a mismatch leaves the
track resting at a non-zero offset with slide 1 clipped and the prev arrow live.
One token makes divergence impossible. Verified at 1955 / 1832 / 1440 / 768 / 375:
slide 1 at 20px, `scrollLeft` 0 at rest, prev disabled, last slide past the right
edge, no document overflow.

A separate defect found in the same area: the slides carried `.reveal`, whose
IntersectionObserver measures against the **viewport** — the wrong axis for a
horizontal scroller. Three of eight slides were invisible until an arrow was
clicked.

### Two duplicate site trees, and the trap had already sprung

`dist/` and `hfm-deploy/` were each 47 MB, and `hfm-deploy/` was **already
stale**: `?v=9` with `arc-slide reveal` still in `js/home.js` while the source was
at `?v=10`. That is the failure mode of a copied tree — ship yesterday's site,
with both trees looking equally plausible.

`hfm-deploy/` is deleted; the zip is the artifact. `scripts/build-deploy.sh
--check` now compares the newest source mtime against `dist/` and exits non-zero
rather than letting a stale build be deployed. `scripts/README.md` classifies all
fifteen scripts and states, for each one-shot migration, whether re-running is
safe — every one guards its own anchor and no-ops.

### Web3Forms: hardened as far as client-side allows

The honeypot was the only filter. A minimum time-to-submit check now sits beside
it: nobody types a name, a phone number and a full address in under two seconds,
and a scripted POST does it instantly. It refuses quietly rather than explaining
the heuristic.

**Accepted risk, not solved:** the free tier caps at 250 submissions/month and
*rejects* past it. The customer sees the WhatsApp fallback; **the workshop is
never told.** Closing that needs the paid tier's webhook or the Apps Script
email-plus-Sheet route. It is recorded here rather than implied away.

### Still open: model calibration

Not a code defect, and the most important item. The site moved from
quote-on-request to published prices generated by a model — four numbers in
`PRICING` now decide what eighteen pieces cost at every configuration.

Every surface says "estimate" and the copy does that consistently, but a cart and
a "Place order" button speak louder than a disclaimer. The failure mode is a
customer who configures a bed at ৳1,15,000, orders, and hears ৳1,40,000 from the
workshop.

**Before this is public, someone at the workshop should price ten real
configurations by hand and check the model against them.** If `volumeExponent:
0.6` does not match how they actually quote, the site is generating numbers it
cannot honour — which costs more trust than having no prices did.
'''

path = 'DECISIONS.md'
s = open(path, encoding='utf-8').read()
if 'Review fixes — what was wrong' in s:
    print('already appended')
else:
    open(path, 'w', encoding='utf-8', newline='').write(s.rstrip() + '\n' + BLOCK)
    print('appended the review-fix record to DECISIONS.md')
