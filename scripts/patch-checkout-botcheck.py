"""Replaces the instant-submit assertion in _ref/verify-checkout.mjs with a
deterministic version.

The first attempt navigated with waitUntil:'networkidle' and then filled three
fields through separate Playwright round trips. That burned well over the 2000ms
the guard allows, so the submit was NOT refused, the real Web3Forms request went
out instead, and the assertion failed for a reason unrelated to what it was
testing.

The fix is to stop racing the clock: load with domcontentloaded, wait only for the
form, set all three values in a single evaluate (no round trips), then click. That
reliably lands inside the window.

    python scripts/patch-checkout-botcheck.py
"""
path = '_ref/verify-checkout.mjs'
s = open(path, encoding='utf-8').read()

OLD = """  /* The bot signal itself. Filling and submitting instantly must be refused —
     this is the check that notices if the guard is ever removed. */
  await page.fill('#co-name', 'Rahim Uddin');
  await page.fill('#co-phone', '01712345678');
  await page.fill('#co-address', 'House 12, Road 3, Khulshi, Chattogram');
  await page.fill('#co-email', '');
  await page.reload({ waitUntil: 'networkidle' });
  await page.fill('#co-name', 'Rahim Uddin');
  await page.fill('#co-phone', '01712345678');
  await page.fill('#co-address', 'House 12, Road 3, Khulshi, Chattogram');
  await page.click('#co-submit');           /* immediately — under 2s */
  await page.waitForTimeout(300);
  const fast = await page.evaluate(() => ({
    url: location.pathname,
    err: document.getElementById('err-form').textContent,
    shown: !document.getElementById('err-form').hidden,
  }));
  check('an instant submit is refused (bot signal)',
    /\\/checkout\\//.test(fast.url) && fast.shown && /again/i.test(fast.err),
    `${fast.url} — ${fast.err.slice(0, 60)}`);
  await page.close();
}"""

NEW = """  /* THE BOT SIGNAL. js/checkout.js refuses a submit under 2000ms because nobody
     types a name, a phone number and a full address that fast.

     Everything here is about landing inside that window: domcontentloaded rather
     than networkidle, and all three fields set in ONE evaluate rather than three
     Playwright round trips. The first version of this check used networkidle plus
     separate fills, took longer than the guard allows, and therefore tested
     nothing — it fired a real Web3Forms request and failed for an unrelated
     reason. */
  await page.goto(BASE + '/checkout/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#co-submit', { timeout: 8000 });
  await page.evaluate(() => {
    document.getElementById('co-name').value = 'Rahim Uddin';
    document.getElementById('co-phone').value = '01712345678';
    document.getElementById('co-address').value = 'House 12, Road 3, Khulshi, Chattogram';
  });
  await page.click('#co-submit');
  await page.waitForTimeout(250);
  const fast = await page.evaluate(() => ({
    url: location.pathname,
    err: document.getElementById('err-form').textContent,
    shown: !document.getElementById('err-form').hidden,
  }));
  check('an instant submit is refused (bot signal)',
    /\\/checkout\\//.test(fast.url) && fast.shown && /again/i.test(fast.err),
    `${fast.url} — "${fast.err.slice(0, 60)}"`);
  await page.close();
}"""

if 'THE BOT SIGNAL' in s:
    print('already patched')
elif OLD in s:
    open(path, 'w', encoding='utf-8', newline='').write(s.replace(OLD, NEW, 1))
    print('rewrote the instant-submit assertion to land inside the guard window')
else:
    raise SystemExit('anchor not found')
