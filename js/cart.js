/* ==========================================================================
   THE CART — /cart/

   Replaces the old order board (js/room.js), which listed pieces without prices
   because there were none to list. A line now carries a full configuration, so
   this page shows what each line costs, what the whole order costs, and links
   back to the piece page to change a specification.

   WHAT IT DELIBERATELY DOES NOT DO: let you edit a specification here. The
   configurator is 3 sliders, a material ladder, a finish picker and up to 6
   add-ons; rebuilding that inline would be a second implementation to keep in
   step with the first. Instead each line has an Edit link carrying its exact
   configuration in the URL hash, so the piece page reopens on that spec and
   Add to cart replaces it. Quantity IS editable here, because that is the one
   change a person makes while looking at a total.

   Fails the same three ways as everything else: no JS and the markup's own
   WhatsApp link still reaches the workshop; no localStorage and the page shows
   its empty state; a piece removed from the catalogue is dropped on read by
   js/order.js rather than breaking the render.
   ========================================================================== */

import { catName, pick, toBnDigits } from '../data/pieces.js';
import { readCart, setQty, removeLine, clearCart } from './order.js';
import { unitPrice, lineTotal, cartTotal, specSummary, taka } from './pricing.js';
import { currentLang, LANG_EVENT, t } from '../data/i18n.js';

const list    = document.getElementById('cart-list');
const empty   = document.getElementById('cart-empty');
const actions = document.getElementById('cart-actions');
const total   = document.getElementById('cart-total');
const units   = document.getElementById('cart-units');
const clear   = document.getElementById('cart-clear');

if (list) {
  const MAX_QTY = 99;

  /* ---- One row --------------------------------------------------------- */
  function row(line, i) {
    const { piece: p, config } = line;
    const isBn = currentLang() === 'bn';
    const pName = pick(p, 'name', currentLang());
    const li = document.createElement('li');
    li.className = 'cart-item';

    const thumb = document.createElement('a');
    thumb.href = `../piece/${p.id}/`;
    thumb.className = 'cart-thumb';
    const img = document.createElement('img');
    img.src = `../assets/img/${p.id}_cut_512.webp`;
    img.alt = pick(p, 'alt', currentLang());
    img.width = 160; img.height = 160;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      img.src = `../assets/img/${p.id}_512.webp`;
      img.style.objectFit = 'cover';
    }, { once: true });
    thumb.appendChild(img);

    /* ---- Body: title, spec summary, edit link ------------------------- */
    const body = document.createElement('div');
    body.className = 'cart-body';

    const h3 = document.createElement('h3');
    const hl = document.createElement('a');
    hl.href = `../piece/${p.id}/`;
    hl.textContent = pName;
    h3.appendChild(hl);

    const leadStr = isBn ? p.lead.replace('weeks', 'সপ্তাহ').replace('week', 'সপ্তাহ') : p.lead;
    const cat = document.createElement('p');
    cat.className = 'cart-cat';
    cat.textContent = `${catName(p.cat, currentLang())} · ${leadStr}`;

    /* The whole configuration in one readable line — the same string that goes
       into the order email, so what the customer approved is what the workshop
       receives. */
    const spec = document.createElement('p');
    spec.className = 'cart-spec';
    spec.textContent = specSummary(p, config, currentLang());

    const edit = document.createElement('a');
    edit.className = 'rule-link cart-edit';
    edit.href = `../piece/${p.id}/#${hashFor(config)}`;
    edit.textContent = isBn ? (t('cart_edit_spec') || 'স্পেসিফিকেশন পরিবর্তন') : 'Change specification';

    body.append(h3, cat, spec, edit);

    /* ---- Quantity stepper -------------------------------------------- */
    const qtyBox = document.createElement('div');
    qtyBox.className = 'room-qty';
    const qtyId = `qty-${i}`;

    const qLabel = document.createElement('label');
    qLabel.className = 'sr-only';
    qLabel.setAttribute('for', qtyId);
    qLabel.textContent = isBn ? `${pName}-এর সংখ্যা` : `Quantity of ${p.name}`;

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.className = 'qty-btn';
    minus.textContent = '\u2212';
    minus.setAttribute('aria-label', isBn ? `একটি ${pName} কমান` : `One fewer ${p.name}`);
    minus.disabled = config.qty <= 1;
    minus.addEventListener('click', () => { setQty(i, config.qty - 1); render(); });

    const input = document.createElement('input');
    input.id = qtyId;
    input.className = 'qty-input';
    input.type = 'number';
    input.inputMode = 'numeric';
    input.min = '1';
    input.max = String(MAX_QTY);
    input.step = '1';
    input.value = String(config.qty);
    /* `change`, not `input`: re-rendering on every keystroke would yank the
       field out from under the cursor mid-typing. */
    input.addEventListener('change', () => {
      const n = Math.floor(Number(input.value));
      if (!Number.isFinite(n) || n < 1) { render(); return; }   /* junk restores */
      setQty(i, n);
      render();
    });

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'qty-btn';
    plus.textContent = '+';
    plus.setAttribute('aria-label', isBn ? `একটি ${pName} বাড়ান` : `One more ${p.name}`);
    plus.disabled = config.qty >= MAX_QTY;
    plus.addEventListener('click', () => { setQty(i, config.qty + 1); render(); });

    qtyBox.append(qLabel, minus, input, plus);

    /* ---- Money -------------------------------------------------------- */
    const money = document.createElement('div');
    money.className = 'cart-money';
    const lt = document.createElement('b');
    lt.className = 'cart-line-total';
    lt.textContent = taka(lineTotal(p, config), currentLang());
    money.appendChild(lt);
    /* The unit price is only worth showing when it is not the line total —
       otherwise it is the same number twice. */
    if (config.qty > 1) {
      const each = document.createElement('span');
      each.className = 'cart-each';
      each.textContent = isBn
        ? `${taka(unitPrice(p, config), 'bn')} \u09AA\u09CD\u09B0\u09A4\u09BF \u09AA\u09BF\u09B8`
        : `${taka(unitPrice(p, config))} each`;
      money.appendChild(each);
    }

    const rm = document.createElement('button');
    rm.className = 'room-remove cart-remove';
    rm.type = 'button';
    rm.setAttribute('aria-label', isBn ? `কার্ট থেকে ${pName} মুছে ফেলুন` : `Remove ${p.name} from your cart`);
    rm.textContent = isBn ? (t('cart_remove') || '\u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8') : 'Remove';
    rm.addEventListener('click', () => { removeLine(i); render(); });

    li.append(thumb, body, qtyBox, money, rm);
    return li;
  }

  /* ---- Render ---------------------------------------------------------- */
  function render() {
    const lines = readCart();
    const isBn = currentLang() === 'bn';

    list.textContent = '';
    empty.hidden = lines.length > 0;
    actions.hidden = lines.length === 0;

    lines.forEach((line, i) => list.appendChild(row(line, i)));
    if (!lines.length) return;

    const n = lines.reduce((sum, l) => sum + l.config.qty, 0);
    units.textContent = isBn
      ? `${toBnDigits(n)}\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC \u00B7 ${toBnDigits(lines.length)}\u099F\u09BF \u09A1\u09BF\u099C\u09BE\u0987\u09A8`
      : `${n} ${n === 1 ? 'piece' : 'pieces'} \u00B7 ` +
        `${lines.length} ${lines.length === 1 ? 'design' : 'designs'}`;
    total.textContent = taka(cartTotal(lines), currentLang());

    const checkoutBtn = actions.querySelector('a[href$="checkout/"]');
    if (checkoutBtn) checkoutBtn.textContent = isBn ? (t('cart_proceed_checkout') || '\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09C1\u09A8') : 'Checkout';
    const browseBtn = actions.querySelector('a[href$="collections/"]');
    if (browseBtn) browseBtn.textContent = isBn ? (t('cart_keep_browsing') || '\u0986\u09B0\u0993 \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8') : 'Keep browsing';
    if (clear) clear.textContent = isBn ? (t('cart_empty_action') || '\u0995\u09BE\u09B0\u09CD\u099F \u0996\u09BE\u09B2\u09BF \u0995\u09B0\u09C1\u09A8') : 'Empty the cart';
  }

  if (clear) {
    clear.addEventListener('click', () => {
      /* Destructive and irreversible — the cart is the only copy. */
      const isBn = currentLang() === 'bn';
      const confirmMsg = isBn ? (t('cart_clear_confirm') || 'আপনার কার্টের সবকিছু মুছে ফেলতে চান?') : 'Remove everything from your cart?';
      if (!confirm(confirmMsg)) return;
      clearCart();
      render();
    });
  }

  /* A piece page open in another tab can change the cart under this one. */
  addEventListener('storage', render);
  document.addEventListener(LANG_EVENT, render);

  render();
}

/* The same compact encoding js/configurator.js reads, kept in step by shape
   rather than by import: this file only ever writes it, and a malformed hash
   makes the configurator fall back to the standard specification. */
function hashFor(c) {
  const parts = [`cfg=${c.dims.map((v) => Math.round(v)).join('x')}`, `m${c.material}`];
  if (c.variant) parts.push(`v${encodeURIComponent(c.variant)}`);
  if (c.addons.length) parts.push(`a=${c.addons.join('+')}`);
  return parts.join(',');
}
