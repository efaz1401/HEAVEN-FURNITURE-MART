/* ==========================================================================
   THE CONFIRMATION PAGE — /thanks/

   This page serves two different arrivals and must be correct for both:

     an ORDER    js/checkout.js wrote the order to localStorage, cleared the
                 cart, and sent the customer here with ?ref=HFM-XXXXXX. They see
                 their reference, what they ordered, what happens next, and the
                 WhatsApp copy.
     a MESSAGE   the contact form has always landed here. No order, no reference.
                 They see the original "we'll reply shortly" page.

   A third case exists and is the reason nothing here is required: a no-JS order.
   Web3Forms redirects the customer here after a native form POST, so there is no
   reference in the URL and nothing in localStorage — but the order DID arrive by
   email. That visitor must get a page that says so, which is why the static copy
   is complete on its own and this module only ADDS detail when it has some.

   Everything order-specific starts hidden in the markup and is revealed here,
   rather than starting visible and being hidden — a JS failure then degrades to
   the message page, not to an empty order shell.
   ========================================================================== */

import { bySlug } from '../data/pieces.js';
import { readLastOrder } from './order.js';
import { unitPrice, lineTotal, cartTotal, specSummary, taka, buildOrderDocument } from './pricing.js';
import { orderWaLink } from '../data/pieces.js';
import { currentLang, t } from '../data/i18n.js';
import { downloadCashMemoPdf, openCashMemoModal } from './cashmemo.js';

const isBn = () => currentLang() === 'bn';

const ref = new URLSearchParams(location.search).get('ref');
const last = readLastOrder();

/* Only treat this as an order confirmation when the reference in the URL matches
   the order on the device. A stale ?ref= from a shared link, or a stored order
   from a previous purchase, must not be shown to whoever is looking now. */
const isThisOrder = ref && last && last.ref === ref;

if (isThisOrder) {
  showOrder(last);
} else if (ref) {
  /* A reference we cannot resolve — most likely the no-JS path, or a device that
     cleared its storage. The order still reached the workshop by email, so the
     page confirms it and shows the reference, just without the itemisation. */
  showRefOnly(ref);
}

function heading(text, lead) {
  const h1 = document.querySelector('h1');
  if (h1) h1.textContent = text;
  const el = document.getElementById('ty-lead');
  if (el) el.textContent = lead;
  const eyebrow = document.querySelector('.eyebrow');
  if (eyebrow) eyebrow.textContent = isBn()
    ? (t('thanks_heading') || '\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AA\u09C7\u09DF\u09C7\u099B\u09C7')
    : 'Order received';
  document.title = isBn()
    ? '\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AA\u09C7\u09DF\u09C7\u099B\u09C7 \u2014 Heaven Furniture Mart'
    : 'Order received \u2014 Heaven Furniture Mart';
}

/* Static-shell strings ("What you ordered", the three next-steps, the buttons).
   Runs regardless of arrival type so the message-form visitor also gets বাংলা.
   The step copy is the deep-read explanation; its headings translate, the
   paragraphs stay English in this pass rather than half-translating them. */
function translateStatic() {
  if (!isBn()) return;
  const set = (sel, txt) => {
    if (!txt) return;
    const el = document.querySelector(sel);
    if (el) el.textContent = txt;
  };
  set('.ty-h:nth-of-type(1)', '\u0986\u09AA\u09A8\u09BF \u09AF\u09BE\u0993 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C7\u099B\u09C7\u09A8');
  set('#ty-next .ty-h', '\u098F\u09B0 \u09AA\u09B0 \u09AF\u09BE\u0993\u09DF\u09BE\u09B0 \u09B9\u09AC\u09C7');
  const steps = document.querySelectorAll('#ty-next h3');
  if (steps.length === 3) {
    steps[0].textContent = '\u0986\u09AE\u09B0\u09BE \u09AE\u09C2\u09B2\u09CD\u09AF \u0993 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09AE\u09DF \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09BF';
    steps[1].textContent = '\u0986\u09AA\u09A8\u09BF \u099A\u09C1\u09DC\u09BC\u09BF\u09A4 \u0985\u0999\u09CD\u0995\u09A8 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C7\u09A8';
    steps[2].textContent = '\u0986\u09AE\u09B0\u09BE \u09A4\u09C8\u09B0\u09BF \u0993 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u0995\u09B0\u09BF';
  }
  const sumTotal = document.querySelector('#ty-order .cart-sum-total');
  if (sumTotal) sumTotal.childNodes[0].textContent = '\u0986\u09A8\u09C1\u09AE\u09BE\u09A8\u09BF\u0995 \u09AE\u09CB\u099F ';
  const wa = document.getElementById('ty-wa');
  if (wa) wa.textContent = t('thanks_btn_wa') || '\u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09B6\u09AA\u09C7 \u09AE\u09C7\u09B8\u09C7\u099C \u09A6\u09BF\u09A8';
  const keep = document.querySelector('.ty-actions .btn--ghost');
  if (keep) keep.textContent = '\u0986\u09B0\u0993 \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8';
  const memoSpan = document.querySelector('#ty-memo-btn span');
  if (memoSpan) memoSpan.textContent = t('memo_btn_download');
  const viewMemoSpan = document.querySelector('#ty-view-memo-btn span');
  if (viewMemoSpan) viewMemoSpan.textContent = t('memo_btn_view');
}

translateStatic();

function showRefOnly(r) {
  heading(
    isBn() ? '\u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6 \u2014 \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AA\u09C7\u09DF\u09C7\u099B\u09C7\u0964'
           : 'Thank you \u2014 we have your order.',
    isBn()
      ? '\u0985\u09A0\u098D\u09AF\u0927\u09BE \u098F\u0995 \u0995\u09BE\u09B0\u09CD\u09AF\u09A6\u09BF\u09AC\u09B8\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7\u0987 \u0986\u09AE\u09B0\u09BE \u09AE\u09C2\u09B2\u09CD\u09AF \u0993 \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09B8\u09AE\u09DF \u099C\u09BE\u09A8\u09BE\u0987\u0964 \u099A\u09C1\u09A1\u09BC\u09BF\u09A4 \u0985\u0999\u09CD\u0995\u09A8 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u09A8\u09BE \u0995\u09B0\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u0995\u09BF\u099B\u09C1 \u0986\u09B0\u0995 \u09B9\u099A\u09CD\u099B\u09C7 \u09A8\u09BE\u0964'
      : 'We\u2019ll confirm your price and a firm lead time, usually within one working day. ' +
        'Nothing is charged until you approve the final drawing.');
  const box = document.getElementById('ty-ref');
  if (box) {
    box.hidden = false;
    box.innerHTML = isBn()
      ? `\u0986\u09AA\u09A8\u09BE\u09B0 \u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09A8\u09CD\u09B8 <strong>${escapeHtml(r)}</strong>\u0964 ` +
        '\u098F\u0987 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u0995\u09C7 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u0995\u09A5\u09BE \u09B9\u09B2\u09C7 \u098F\u099F\u09BF \u0989\u09B2\u09CD\u09B2\u09C7\u0996 \u0995\u09B0\u09C1\u09A8\u0964'
      : `Your reference is <strong>${escapeHtml(r)}</strong>. ` +
        'Quote it if you get in touch about this order.';
  }
  const next = document.getElementById('ty-next');
  if (next) next.hidden = false;
}

function showOrder(order) {
  showRefOnly(order.ref);

  /* Re-resolve every line against the live catalogue rather than trusting the
     stored copy: a piece could have been withdrawn between order and reload, and
     the pricing model needs the real record to recompute a total. */
  const lines = (order.lines || [])
    .map(({ id, config }) => {
      const piece = bySlug(id);
      return piece ? { id, piece, config } : null;
    })
    .filter(Boolean);

  if (!lines.length) return;

  const list = document.getElementById('ty-lines');
  list.textContent = '';
  lines.forEach(({ piece: p, config }) => {
    const li = document.createElement('li');

    const top = document.createElement('p');
    top.className = 'co-line-top';
    const name = document.createElement('b');
    name.textContent = `${config.qty} \u00D7 ${p.name}`;
    const money = document.createElement('span');
    money.textContent = taka(lineTotal(p, config));
    top.append(name, money);

    const spec = document.createElement('p');
    spec.className = 'co-line-spec';
    spec.textContent = specSummary(p, config);

    li.append(top, spec);
    if (config.qty > 1) {
      const each = document.createElement('p');
      each.className = 'co-line-each';
      each.textContent = isBn()
        ? `${taka(unitPrice(p, config))} \u09AA\u09CD\u09B0\u09A4\u09BF \u09AA\u09BF\u09B8`
        : `${taka(unitPrice(p, config))} each`;
      li.appendChild(each);
    }
    list.appendChild(li);
  });

  const units = lines.reduce((n, l) => n + l.config.qty, 0);
  document.getElementById('ty-units').textContent = isBn()
    ? `${units.toLocaleString('bn-BD')}\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC \u00B7 ${lines.length.toLocaleString('bn-BD')}\u099F\u09BF \u09A1\u09BF\u099C\u09BE\u0987\u09A8`
    : `${units} ${units === 1 ? 'piece' : 'pieces'} \u00B7 ` +
      `${lines.length} ${lines.length === 1 ? 'design' : 'designs'}`;
  /* Recomputed, not read from the stored total: if the model or a price has
     changed since the order, showing today's arithmetic beside today's
     specification is the consistent thing to do. */
  document.getElementById('ty-total').textContent = taka(cartTotal(lines));
  document.getElementById('ty-order').hidden = false;

  /* The WhatsApp copy carries the SAME document the email did — one builder, so
     the two can never describe the order differently. Prefer the stored text
     when it is there, since that is literally what was sent. */
  const wa = document.getElementById('ty-wa');
  if (wa) {
    wa.href = orderWaLink(order.document ||
      buildOrderDocument(lines, { ...order.customer, ref: order.ref }));
    wa.hidden = false;
  }

  const memoBtn = document.getElementById('ty-memo-btn');
  if (memoBtn) {
    memoBtn.hidden = false;
    memoBtn.addEventListener('click', () => downloadCashMemoPdf(order, memoBtn));
  }
  const viewMemoBtn = document.getElementById('ty-view-memo-btn');
  if (viewMemoBtn) {
    viewMemoBtn.hidden = false;
    viewMemoBtn.addEventListener('click', () => openCashMemoModal(order));
  }
}

/* The reference is generated by this site, not user input, but it reaches
   innerHTML — so it is escaped anyway. A value that only ever looks safe is
   exactly the one that stops being safe after a refactor. */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
