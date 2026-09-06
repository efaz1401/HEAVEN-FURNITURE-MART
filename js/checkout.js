/* ==========================================================================
   CHECKOUT — /checkout/

   Submits the cart to Web3Forms, which emails the order to the workshop. There
   is no backend: the form posts straight to Web3Forms and this module wires the
   validation, the order document and the confirmation around it.

   THIS CHECKOUT REQUIRES JAVASCRIPT, AND THAT IS NOT A GAP TO CLOSE. An earlier
   version of this comment claimed a working no-JS path — native POST, Web3Forms
   emails the order, `redirect` lands on /thanks/ — and it was false. The cart
   lives in localStorage and is read by readCart(), so a native POST cannot carry
   an order that only JavaScript can see. There is no arrangement of markup that
   fixes it; the whole configurator is JS anyway.

   What the site does instead: checkout/index.html renders its empty state
   VISIBLE BY DEFAULT with a WhatsApp link and a phone number, and this module
   hides it once there is a cart to show. A visitor without JavaScript gets a
   route to a human rather than a page that stops mid-sentence.

   The real <form method="post"> still earns its keep — if this module throws
   for any reason after the form is on screen, the browser's own submit reaches
   Web3Forms rather than doing nothing.

   WHY THE CART IS CLEARED ONLY AFTER A CONFIRMED SUCCESS: if the submit fails
   (quota exhausted, network, service down) the customer must still have their
   order to retry or to send over WhatsApp. Clearing optimistically would lose
   a real order to a transient failure.

   THE ACCESS KEY IS PUBLIC BY DESIGN — see the note in data/pieces.js. It is not
   a credential, only a submit permission for this one form.
   ========================================================================== */

import { WEB3FORMS_URL, ORDERS_EMAIL_FALLBACK, orderWaLink, pick, toBnDigits } from '../data/pieces.js';
import {
  readCart, readCustomer, writeCustomer, forgetCustomer,
  clearCart, writeLastOrder, orderRef,
} from './order.js';
import {
  unitPrice, lineTotal, cartTotal, specSummary, taka, buildOrderDocument,
} from './pricing.js';
import { currentLang, LANG_EVENT, t } from '../data/i18n.js';


/* ---- The summary beside the form ---------------------------------------- */
function renderSummary(lines) {
  const list = document.getElementById('co-lines');
  list.textContent = '';
  const isBn = currentLang() === 'bn';

  lines.forEach(({ piece: p, config }) => {
    const li = document.createElement('li');
    const pName = pick(p, 'name', currentLang());

    const top = document.createElement('p');
    top.className = 'co-line-top';
    const name = document.createElement('b');
    name.textContent = isBn ? `${toBnDigits(config.qty)} \u00D7 ${pName}` : `${config.qty} \u00D7 ${p.name}`;
    const money = document.createElement('span');
    money.textContent = taka(lineTotal(p, config), currentLang());
    top.append(name, money);

    const spec = document.createElement('p');
    spec.className = 'co-line-spec';
    /* The same string the cart showed and the email will carry, so what the
       customer approved is what the workshop receives. */
    spec.textContent = specSummary(p, config, currentLang());

    li.append(top, spec);
    if (config.qty > 1) {
      const each = document.createElement('p');
      each.className = 'co-line-each';
      each.textContent = isBn
        ? `${taka(unitPrice(p, config), 'bn')} \u09AA\u09CD\u09B0\u09A4\u09BF \u09AA\u09BF\u09B8`
        : `${taka(unitPrice(p, config))} each`;
      li.appendChild(each);
    }
    list.appendChild(li);
  });

  const units = lines.reduce((n, l) => n + l.config.qty, 0);
  document.getElementById('co-units').textContent = isBn
    ? `${toBnDigits(units)}\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC \u00B7 ${toBnDigits(lines.length)}\u099F\u09BF \u09A1\u09BF\u099C\u09BE\u0987\u09A8`
    : `${units} ${units === 1 ? 'piece' : 'pieces'} \u00B7 ` +
      `${lines.length} ${lines.length === 1 ? 'design' : 'designs'}`;
  document.getElementById('co-total').textContent = taka(cartTotal(lines), currentLang());

  const sumH = document.getElementById('co-sum-h');
  if (sumH) sumH.textContent = isBn ? (t('checkout_order_summary') || 'আপনার অর্ডার') : 'Your order';
  const sumHint = document.querySelector('.co-summary .field-hint');
  if (sumHint) sumHint.textContent = t('checkout_summary_hint') || (isBn ? 'প্রদর্শিত স্পেসিফিকেশনের আনুমানিক হিসাব। কাজ শুরুর আগে নিশ্চিত করা হবে।' : 'Estimate for the specification shown. We confirm before production.');
}

/* ---- Bilingual labels ----------------------------------------------------
   The form's markup stays English (it is also the no-JS state); this rewrites
   the labels, placeholders and buttons in place, following the same pattern as
   js/cart.js. Runs once at boot and again on every hfm:lang event, so a
   visitor can flip language mid-form without losing what they typed — only
   the chrome around the fields changes, never the field values. */
function translateCheckout() {
  const isBn = currentLang() === 'bn';
  const set = (sel, txt) => {
    const el = document.querySelector(sel);
    if (el && txt) el.textContent = txt;
  };

  set('.eyebrow', isBn ? (t('nav_checkout') || 'চেকআউট') : 'Checkout');
  set('h1', t('checkout_heading') || (isBn ? 'অর্ডার সম্পন্ন করুন' : 'Place your order.'));
  const lead = document.querySelector('.lead');
  if (lead) lead.textContent = t('checkout_sub') ||
    'Tell us where it\u2019s going and we\u2019ll confirm the price and a firm lead time before anything is made.';
  const notice = document.querySelector('.notice');
  if (notice) notice.textContent = t('checkout_notice') ||
    'Nothing is charged online. Every piece is built to order, so we confirm your estimate against the final drawing first.';

  /* The label's `for` points at the input, so resolve through it: writing to
     the INPUT's textContent (as an id-only lookup would) sets the field's
     VALUE, pre-filling the form with the label text. */
  const label = (id, key, en) => {
    const el = document.querySelector(`label[for="${id}"]`);
    if (!el) return;
    const opt = el.querySelector('.field-opt');
    const txt = t(key) || en;
    if (opt) { el.childNodes[0].textContent = txt + ' '; }
    else el.textContent = txt;
  };
  const ph = (id, key, en) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = t(key) || en;
  };

  label('co-name', 'checkout_name_label', 'Your name');
  ph('co-name', 'checkout_name_placeholder', 'Rahim Uddin');
  label('co-phone', 'checkout_phone_label', 'Phone');
  ph('co-phone', 'checkout_phone_placeholder', '01XXXXXXXXX');
  label('co-address', 'checkout_address_label', 'Delivery address');
  ph('co-address', 'checkout_address_placeholder', 'House, road, area, city');
  label('co-email', 'checkout_email_label', 'Email');
  label('co-notes', 'checkout_notes_label', 'Anything we should know?');
  ph('co-notes', 'checkout_notes_placeholder', 'Room measurements, a deadline, a fabric you\u2019ve seen\u2026');

  const submit = document.getElementById('co-submit');
  if (submit) submit.textContent = t('checkout_btn_submit') || 'Place order';
  const sumH = document.getElementById('co-sum-h');
  if (sumH) sumH.textContent = isBn ? (t('checkout_order_summary') || 'আপনার অর্ডার') : 'Your order';
  const sumTotal = document.querySelector('.cart-sum-total');
  if (sumTotal) sumTotal.childNodes[0].textContent = isBn ? 'আনুমানিক মোট ' : 'Estimated total ';

  const remember = document.getElementById('co-remember');
  if (remember) {
    /* Keep the Forget button intact — rewrite only the leading text node. */
    const forget = document.getElementById('co-forget');
    const before = isBn
      ? 'আপনার তথ্য এই ডিভাইসে ৩০ দিন সংরক্ষিত থাকে, পুনরায় টাইপ করতে হবে না। '
      : 'Your details are saved on this device for 30 days so you don\u2019t retype them. ';
    const after = isBn ? ' বিস্মৃত করুন' : 'Forget my details';
    remember.childNodes[0].textContent = before;
    if (forget) forget.textContent = after;
  }

  /* Empty-state copy (also the no-JS state) and its buttons. */
  const emptyTitle = document.querySelector('#co-empty strong');
  if (emptyTitle) emptyTitle.textContent = isBn
    ? 'এখনো অর্ডার করার কিছু নেই।' : 'Nothing to check out yet.';
  const emptyBody = document.querySelector('#co-empty p:nth-of-type(2)');
  if (emptyBody) emptyBody.textContent = isBn
    ? 'আপনি যদি আগে কিছু যুক্ত করে থাকেন, তবে সেগুলো এই ব্রাউজারে সংরক্ষিত আছে এবং পড়তে জাভাস্ক্রিপ্ট লাগে। যেভাবেই হোক, আমরা সরাসরি অর্ডার নিতে পারি — প্রায়ই তা দ্রুততর।'
    : 'If you have already added pieces, your cart lives in this browser and needs JavaScript to read it. Either way we can take the order directly \u2014 it is often faster.';
  const emptyBtns = document.querySelectorAll('#co-empty .btn');
  if (emptyBtns.length === 3) {
    emptyBtns[0].textContent = isBn ? 'হোয়াটসঅ্যাপে অর্ডার করুন' : 'Order on WhatsApp';
    emptyBtns[1].textContent = isBn ? 'শো-রুমে কল করুন' : 'Call the showroom';
    emptyBtns[2].textContent = isBn ? 'কালেকশন দেখুন' : 'Browse the collections';
  }

  const backBtn = document.querySelector('a[href="../cart/"].btn--ghost');
  if (backBtn) backBtn.textContent = isBn ? (t('checkout_back_cart') || 'কার্টে ফিরে যান') : 'Back to cart';
}

/* ---- Remembered details ------------------------------------------------- */
function restoreCustomer() {
  const c = readCustomer();
  ['name', 'phone', 'address', 'email', 'notes'].forEach((k) => {
    const el = document.getElementById(`co-${k}`);
    if (el && c[k]) el.value = c[k];
  });
  const forget = document.getElementById('co-forget');
  if (forget) {
    forget.addEventListener('click', () => {
      forgetCustomer();
      ['name', 'phone', 'address', 'email', 'notes'].forEach((k) => {
        const el = document.getElementById(`co-${k}`);
        if (el) el.value = '';
      });
      const remember = document.getElementById('co-remember');
      const msg = currentLang() === 'bn'
        ? '\u09A4\u09A5\u09CD\u09AF \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964'
        : 'Details forgotten.';
      if (remember) remember.textContent = msg;
      else document.getElementById('co-remember').textContent = msg;
    });
  }
}

/* ---- Validation ---------------------------------------------------------
   Inline and explicit rather than relying on the browser's own bubbles: the
   native messages cannot be styled, appear one at a time, and vanish on scroll.
   `required` stays in the markup so the no-JS path keeps its own validation.
   Messages route through t() with the English strings as fallback, so they
   follow the language the visitor chose at the moment of validation. */
const RULES = {
  name: (v) => (v.trim().length < 2
    ? (t('co_err_name') || 'Please tell us your name.') : ''),
  /* Deliberately loose: Bangladeshi mobiles are 11 digits and may arrive with
     +880, spaces or dashes. Counting digits accepts every real format and still
     rejects a name typed into the wrong box. */
  phone: (v) => {
    const digits = v.replace(/\D/g, '');
    return digits.length < 10
      ? (t('co_err_phone') || 'A phone number we can reach you on, please.') : '';
  },
  address: (v) => (v.trim().length < 10
    ? (t('co_err_address') || 'Where should we deliver? Road and area is enough.') : ''),
  /* Optional, but if given it has to look like an address, or the reply-to on the
     workshop's email bounces. */
  email: (v) => (v.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim())
    ? (t('co_err_email') || 'That email address looks incomplete.') : ''),
};

function validate() {
  let first = null;
  Object.entries(RULES).forEach(([k, rule]) => {
    const el = document.getElementById(`co-${k}`);
    const err = document.getElementById(`err-${k}`);
    if (!el || !err) return;
    const msg = rule(el.value);
    err.textContent = msg;
    err.hidden = !msg;
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg && !first) first = el;
  });
  return first;
}

/* ---- Submit ------------------------------------------------------------- */
function wire(lines) {
  const form = document.getElementById('co-form');
  const submit = document.getElementById('co-submit');
  const formErr = document.getElementById('err-form');

  /* When the form became fillable. A second bot signal beside the honeypot:
     nobody types a name, a phone number and a full address in under two seconds,
     and a scripted POST does it instantly. Cheap, invisible to real customers,
     and it costs a bot nothing to defeat if it waits — which is the honest limit
     of client-side filtering and why this is a signal, not a wall. */
  const readyAt = Date.now();
  const MIN_FILL_MS = 2000;

  /* Turn OFF native validation — but from JS, never in the markup.
     The fields carry `required` so a no-JS submit is still validated by the
     browser. With JS on, native validation fires FIRST and blocks the submit
     event entirely, so our handler never ran and no inline message ever
     appeared: the browser focused the field and showed nothing else. Setting
     noValidate here hands validation to RULES below only when we are actually
     able to run it. */
  form.noValidate = true;

  /* Validate as they leave a field, not as they type: an error appearing on the
     third keystroke of a name is noise. */
  Object.keys(RULES).forEach((k) => {
    const el = document.getElementById(`co-${k}`);
    if (el) el.addEventListener('blur', () => validate());
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formErr.hidden = true;

    const bad = validate();
    if (bad) { bad.focus(); return; }

    /* Submitted impossibly fast. Refuse quietly rather than explaining the
       heuristic — a real customer who somehow trips it just presses again a
       second later, and telling a bot the rule is how the rule stops working. */
    if (Date.now() - readyAt < MIN_FILL_MS) {
      formErr.hidden = false;
      formErr.textContent = t('co_err_fast') || 'One moment \u2014 please press Place order again.';
      return;
    }

    const customer = {
      name: document.getElementById('co-name').value.trim(),
      phone: document.getElementById('co-phone').value.trim(),
      address: document.getElementById('co-address').value.trim(),
      email: document.getElementById('co-email').value.trim(),
      notes: document.getElementById('co-notes').value.trim(),
    };
    writeCustomer(customer);

    const ref = orderRef();
    const total = cartTotal(lines);
    const doc = buildOrderDocument(lines, { ...customer, ref }, currentLang());

    /* Fill the hidden fields. The same values a no-JS POST would carry, so the
       email is identical either way. */
    document.getElementById('co-ref').value = ref;
    document.getElementById('co-total-field').value = taka(total);
    document.getElementById('co-order').value = doc;
    document.getElementById('co-order-json').value = JSON.stringify({
      ref,
      total,
      currency: 'BDT',
      /* `piece` comes straight from the line being mapped. It used to be
         re-looked-up with lines.find(l => l.id === id), which is O(n^2) and —
         worse — returns the WRONG line as soon as two lines share an id, which
         signature() explicitly supports (same piece, different configuration).
         The value happened to be right today; the code was a trap. */
      lines: lines.map(({ id, piece, config }) => ({
        id, ...config, unit: unitPrice(piece, config),
      })),
      customer,
    });

    submit.disabled = true;
    const restore = submit.textContent;
    submit.textContent = currentLang() === 'bn'
      ? 'পাঠানো হচ্ছে…' : 'Sending\u2026';

    const payload = new FormData(form);
    /* Web3Forms uses `email` as the reply-to. Email is optional here — phone is
       the real channel — so a blank one is replaced rather than risking a
       rejected submission on a requirement we could not verify. */
    if (!customer.email) payload.set('email', ORDERS_EMAIL_FALLBACK);

    let ok = false;
    let message = '';
    try {
      const res = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
      });
      const body = await res.json().catch(() => ({}));
      ok = res.ok && body.success !== false;
      message = body.message || '';
    } catch (err) {
      message = err && err.message ? err.message : 'network error';
    }

    if (ok) {
      /* Write the order BEFORE clearing the cart — /thanks/ reads it to show
         what was ordered, and the cart is where it currently lives. */
      writeLastOrder({
        ref,
        at: new Date().toISOString(),
        total,
        customer,
        document: doc,
        lines: lines.map(({ id, config }) => ({ id, config })),
      });
      clearCart();
      location.href = `../thanks/?ref=${encodeURIComponent(ref)}`;
      return;
    }

    /* Failure keeps the cart intact and hands over the one route that cannot
       fail: the order, pre-written, in WhatsApp. */
    submit.disabled = false;
    submit.textContent = restore;
    formErr.hidden = false;
    formErr.textContent = '';
    const isBn = currentLang() === 'bn';
    const p = document.createElement('span');
    p.textContent = isBn
      ? '\u09B8\u09CD\u09AC\u09AF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7'
        + (message ? ` (${message})` : '') + '\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6\u09C7 \u0986\u099B\u09C7 \u2014 \u09AC\u09B0\u0982 \u09B9\u09CB\u09DF\u09BE\u099F\u09B8\u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8:'
      : 'We couldn\u2019t send that automatically'
        + (message ? ` (${message})` : '') + '. Your order is safe \u2014 send it on WhatsApp instead:';
    const a = document.createElement('a');
    a.className = 'btn btn--sm';
    a.style.marginTop = '.75rem';
    a.href = orderWaLink(doc);
    a.textContent = t('co_send_wa') || 'Send this order on WhatsApp';
    formErr.append(p, document.createElement('br'), a);
  });
}

/* ---- Boot ---------------------------------------------------------------
   AT THE BOTTOM OF THE FILE, DELIBERATELY. Function declarations hoist, but
   `const RULES` does not initialise until the engine reaches it — so calling
   wire() from the top threw "Cannot access 'RULES' before initialization",
   which meant no submit handler was ever attached and the browser fell back to
   a native POST. Silent, because the throw happened in module evaluation and the
   form still appeared to work.

   Bootstrapping last is the fix and the rule for this file: every declaration
   exists before anything runs. */
const form  = document.getElementById('co-form');
const main  = document.getElementById('co-main');
const empty = document.getElementById('co-empty');

if (form && main) {
  const lines = readCart();

  /* Labels/buttons translate in both states — the empty state carries
     WhatsApp/call routes, which matter most to a বাংলা visitor with no cart. */
  translateCheckout();
  document.addEventListener(LANG_EVENT, translateCheckout);

  /* Nothing to check out: show the empty state rather than a form that would be
     rejected on submit. */
  if (!lines.length) {
    /* Already the markup default — set explicitly so the two states can never
       both be visible if this runs twice. */
    empty.hidden = false;
    main.hidden = true;
  } else {
    /* The markup ships #co-empty VISIBLE as the no-JS state; hiding it is this
       module's job, not the browser's. */
    empty.hidden = true;
    main.hidden = false;
    renderSummary(lines);
    restoreCustomer();
    wire(lines);
    document.addEventListener(LANG_EVENT, () => renderSummary(readCart()));
  }
}
