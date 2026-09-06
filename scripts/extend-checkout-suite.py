"""/* Appends the submit / confirmation / failure / empty-cart blocks to
   _ref/verify-checkout.mjs.

   Written as a file rather than a heredoc because the test code it inserts is
   full of regex escapes and backticks, which a shell heredoc mangles — the first
   attempt lost `\.` sequences and failed its own anchor assertion.

    python scripts/extend-checkout-suite.py
"""
BLOCK = r'''
/* ---------- checkout: a successful submit -------------------------------- */
{
  const page = await ctx.newPage();
  const seen = await stub(page, { success: true });
  await page.goto(BASE + '/checkout/', { waitUntil: 'domcontentloaded' });
  await seedCart(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  out.push('\n=== SUCCESSFUL SUBMIT ===');
  await page.fill('#co-name', 'Rahim Uddin');
  await page.fill('#co-phone', '01712345678');
  await page.fill('#co-address', 'House 12, Road 3, Khulshi, Chattogram');
  await page.fill('#co-notes', 'Room is 4.2m wide.');
  await page.click('#co-submit');
  await page.waitForURL(/thanks/, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);

  check('posted to Web3Forms once', seen.method === 'POST', String(seen.method));
  /* The payload is what the workshop actually receives, so it is asserted piece
     by piece rather than trusted. */
  const body = seen.body || '';
  check('carries the access key', body.includes('8c3cd395-4c16-438f-805c-c50073ce2d3e'));
  check('carries the itemised order', /Carved Dining Chair/.test(body));
  check('carries the specification per line', /Figured walnut/.test(body));
  check('carries the estimated total', /ESTIMATED TOTAL/.test(body));
  check('says the total is an estimate', /confirm before production/i.test(body));
  check('carries the customer',
    /Rahim Uddin/.test(body) && /01712345678/.test(body) && /Khulshi/.test(body));
  check('carries a machine-readable copy', /order_json/.test(body) && /BDT/.test(body));
  /* Email is optional at checkout, but Web3Forms uses it as reply-to, so a blank
     one is substituted rather than risking a rejection on an unverified rule. */
  check('substitutes a reply-to when email is blank', /orders@heavenfurnituremart/.test(body));
  check('carries an order reference', /HFM-[A-Z0-9]{6}/.test(body),
    (body.match(/HFM-[A-Z0-9]{6}/) || [''])[0]);

  check('lands on the confirmation page with the reference',
    /\/thanks\/\?ref=HFM-/.test(page.url()), page.url());

  const after = await page.evaluate(() => ({
    cart: JSON.parse(localStorage.getItem('hfm-cart-v2') || '[]').length,
    customer: JSON.parse(localStorage.getItem('hfm-customer-v1') || '{}').name,
    lastRef: (JSON.parse(localStorage.getItem('hfm-last-order-v1') || '{}')).ref,
    badge: document.querySelector('.pill-cart [data-cart-count]')?.hidden,
  }));
  check('the cart is cleared only after success', after.cart === 0, String(after.cart));
  check('customer details are remembered', after.customer === 'Rahim Uddin', after.customer);
  check('the order is stored for the confirmation page', /^HFM-/.test(after.lastRef || ''), after.lastRef);
  check('the nav badge empties', after.badge === true, String(after.badge));

  out.push('\n=== CONFIRMATION PAGE ===');
  const ty = await page.evaluate(() => ({
    h1: document.querySelector('h1').textContent,
    ref: document.getElementById('ty-ref').textContent.trim(),
    refHidden: document.getElementById('ty-ref').hidden,
    orderHidden: document.getElementById('ty-order').hidden,
    lines: document.querySelectorAll('#ty-lines li').length,
    total: document.getElementById('ty-total').textContent,
    waHref: document.getElementById('ty-wa').getAttribute('href'),
    waHidden: document.getElementById('ty-wa').hidden,
    nextHidden: document.getElementById('ty-next').hidden,
  }));
  check('heading switches to the order wording', /we have your order/i.test(ty.h1), ty.h1);
  check('shows the reference', !ty.refHidden && /HFM-/.test(ty.ref), ty.ref);
  check('itemises what was ordered', !ty.orderHidden && ty.lines === 2, `${ty.lines} lines`);
  check('total matches the cart total', money(ty.total) === 433500, ty.total);
  check('what-happens-next is revealed', ty.nextHidden === false);
  check('WhatsApp copy goes to the ORDERS number',
    !ty.waHidden && /wa\.me\/8801885133937/.test(ty.waHref));
  check('WhatsApp copy carries the same document',
    /Rahim/.test(decodeURIComponent(ty.waHref)) &&
    /ESTIMATED TOTAL/.test(decodeURIComponent(ty.waHref)));
  await page.close();
}

/* ---------- checkout: a FAILED submit ------------------------------------ */
{
  const page = await ctx.newPage();
  await stub(page, { success: false, message: 'Quota exceeded' });
  await page.goto(BASE + '/checkout/', { waitUntil: 'domcontentloaded' });
  await seedCart(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  out.push('\n=== FAILED SUBMIT ===');
  await page.fill('#co-name', 'Rahim Uddin');
  await page.fill('#co-phone', '01712345678');
  await page.fill('#co-address', 'House 12, Road 3, Khulshi, Chattogram');
  await page.click('#co-submit');
  await page.waitForTimeout(700);

  const f = await page.evaluate(() => ({
    url: location.pathname,
    errShown: !document.getElementById('err-form').hidden,
    errText: document.getElementById('err-form').textContent,
    waHref: document.querySelector('#err-form a')?.getAttribute('href') || '',
    cart: JSON.parse(localStorage.getItem('hfm-cart-v2') || '[]').length,
    submitEnabled: !document.getElementById('co-submit').disabled,
  }));
  check('stays on checkout', /\/checkout\//.test(f.url), f.url);
  check('THE CART IS PRESERVED', f.cart === 2, `${f.cart} lines`);
  check('the submit button is usable again', f.submitEnabled);
  check('an honest error is shown, naming the reason',
    f.errShown && /Quota exceeded/.test(f.errText), f.errText.slice(0, 90));
  check('offers the WhatsApp fallback with the order pre-filled',
    /wa\.me\/8801885133937/.test(f.waHref) && /Rahim/.test(decodeURIComponent(f.waHref)));
  await page.close();
}

/* ---------- empty cart --------------------------------------------------- */
{
  const page = await ctx.newPage();
  await page.goto(BASE + '/checkout/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('hfm-cart-v2'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  out.push('\n=== EMPTY CART ===');
  const e = await page.evaluate(() => ({
    empty: !document.getElementById('co-empty').hidden,
    form: !document.getElementById('co-main').hidden,
  }));
  check('shows the empty state rather than a form that would be rejected',
    e.empty && !e.form, JSON.stringify(e));
  await page.close();
}
'''

path = '_ref/verify-checkout.mjs'
s = open(path, encoding='utf-8').read()
ANCHOR = 'await browser.close();'
if 'SUCCESSFUL SUBMIT' in s:
    print('already extended — nothing to do')
else:
    assert ANCHOR in s, 'anchor not found'
    s = s.replace(ANCHOR, BLOCK.strip() + '\n\n' + ANCHOR, 1)
    open(path, 'w', encoding='utf-8', newline='').write(s)
    print('appended submit / confirmation / failure / empty-cart blocks')
