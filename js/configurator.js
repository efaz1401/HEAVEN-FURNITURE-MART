/* ==========================================================================
   THE CONFIGURATOR — specification, and therefore price, on a piece page.

   Every piece is made to order, so the published price is a range rather than a
   figure: the minimum is the piece exactly as listed, the maximum is the same
   piece at top materials and larger dimensions. This component lets a visitor
   pick a point in that range and see what it costs, which is the only honest way
   to show a price for bespoke work.

   BUILT ENTIRELY IN JS, mounted into one <div id="configurator"> that every
   piece template carries. That is the same discipline as js/piece-fill.js: one
   implementation reaches all 18 pages, so a change to the controls is one edit
   and never eighteen. The maths is not here — js/pricing.js owns it, and this
   file only reads it.

   IT NEVER SHOWS A NUMBER WITHOUT SAYING "ESTIMATED". The workshop confirms the
   final figure; the site must not imply otherwise.

   Fails closed and quietly: no mount point, or a piece with no price data, and
   nothing renders. The page keeps its photography, its specification table and
   its WhatsApp quote link, exactly as before this existed.
   ========================================================================== */

import { bySlug } from '../data/pieces.js';
import {
  defaultConfig, dimBounds, tiersFor, addonsFor, unitPrice, basePrice,
  extrasPrice, specLevel, isStandard, taka, clampDims, clampMaterial,
  isFixedDim, dimMode,
} from './pricing.js';
import { addLine } from './order.js';
import { VARIANT_EVENT } from './piece.js';
import { t, LANG_EVENT, currentLang } from '../data/i18n.js';
import { openSpecSheet } from './spec-sheet.js';

const mount = document.getElementById('configurator');
const root = document.getElementById('piece-root');
const piece = root ? bySlug(root.dataset.piece) : null;

if (mount && piece && piece.price) {
  /* The configuration can arrive from the cart's Edit link as a hash, so
     returning to a line reopens the exact specification that was priced. */
  let config = fromHash(piece) || defaultConfig(piece);

  /* Has the visitor actually specified anything yet?

     paint() used to write the deep-link hash unconditionally, including on its
     own first call — so merely OPENING a piece page rewrote the address bar to
     /piece/<slug>/#cfg=200x220x140,m0,a=delivery_ctg before the visitor had
     touched a control. That put a configurator blob into every copied URL and
     every share, and described a specification nobody had chosen.

     Seeded true when the page was itself opened from a deep link (the cart's
     Edit link, or a spec pasted into WhatsApp): that hash is already the
     visitor's, so it has to survive a repaint rather than be cleared. */
  let touched = !!fromHash(piece);

  let advancedExpanded = !!fromHash(piece);

  const els = {};
  mount.append(buildPanel());
  paint({ initial: true });

  /* Rebuild or repaint on language change */
  document.addEventListener(LANG_EVENT, () => {
    rebuildControls();
    paint();
  });

  /* ---- Markup ---------------------------------------------------------- */
  function buildPanel() {
    const wrap = document.createElement('div');
    wrap.className = 'cfg';

    // 1. Curated Workshop Standard Card
    wrap.appendChild(buildCuratedStandard());

    // 2. Expandable Progressive Disclosure Toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'cfg-advanced-toggle';
    toggleBtn.id = 'cfg-advanced-toggle';
    toggleBtn.setAttribute('aria-expanded', String(advancedExpanded));
    toggleBtn.setAttribute('aria-controls', 'cfg-advanced');

    const toggleText = document.createElement('div');
    toggleText.className = 'cfg-toggle-text';
    const toggleTitle = document.createElement('span');
    toggleTitle.className = 'cfg-toggle-title';
    toggleTitle.textContent = t('custom_toggle');
    const toggleSub = document.createElement('span');
    toggleSub.className = 'cfg-toggle-sub';
    toggleSub.textContent = t('custom_toggle_sub');
    toggleText.append(toggleTitle, toggleSub);

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'cfg-toggle-icon';
    toggleIcon.setAttribute('aria-hidden', 'true');
    toggleIcon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>';

    toggleBtn.append(toggleText, toggleIcon);
    wrap.appendChild(toggleBtn);

    // 3. Technical Customization Sliders & Tiers (enclosed in accordion)
    const adv = document.createElement('div');
    adv.className = 'cfg-advanced';
    adv.id = 'cfg-advanced';
    adv.hidden = !advancedExpanded;

    adv.appendChild(buildDims());
    adv.appendChild(buildMaterials());
    adv.appendChild(buildAddons());
    wrap.appendChild(adv);

    toggleBtn.addEventListener('click', () => {
      advancedExpanded = !advancedExpanded;
      toggleBtn.setAttribute('aria-expanded', String(advancedExpanded));
      adv.hidden = !advancedExpanded;
    });

    // 4. Total and actions
    wrap.appendChild(buildTotal());
    return wrap;
  }

  function buildCuratedStandard() {
    const card = document.createElement('div');
    card.className = 'cfg-curated';

    const topRow = document.createElement('div');
    topRow.className = 'cfg-curated-top';

    const badge = document.createElement('span');
    badge.className = 'cfg-curated-badge';
    badge.textContent = t('standard_spec') || 'Standard Specification';

    const stdPrice = unitPrice(piece, defaultConfig(piece));
    const priceEl = document.createElement('strong');
    priceEl.className = 'cfg-curated-price';
    priceEl.textContent = taka(stdPrice, currentLang());

    topRow.append(badge, priceEl);

    const title = document.createElement('h3');
    title.className = 'cfg-curated-title';
    title.textContent = t('curated_title') || 'Curated Workshop Standard';

    const desc = document.createElement('p');
    desc.className = 'cfg-curated-desc';
    desc.textContent = t('curated_desc');

    const spec = document.createElement('div');
    spec.className = 'cfg-curated-spec';

    const dimSpan = document.createElement('span');
    const dimVals = piece.dims.map(([, std, unit]) => `${std}${unit}`).join(' \u00D7 ');
    dimSpan.innerHTML = `<span>${t('dimensions') || 'Dimensions'}:</span> <strong>${dimVals}</strong>`;

    const matSpan = document.createElement('span');
    const masterMat = piece.materials[0] || 'Seasoned Hardwood';
    matSpan.innerHTML = `<span>${t('materials_heading') || 'Materials'}:</span> <strong>${masterMat}</strong>`;

    spec.append(dimSpan, matSpan);
    card.append(topRow, title, desc, spec);
    return card;
  }

  /* ---- Dimensions ------------------------------------------------------ */
  function buildDims() {
    const box = document.createElement('fieldset');
    box.className = 'cfg-group';
    box.innerHTML = `<legend>${t('spec_dimension_legend') || 'Dimensions'}</legend>`;

    els.dimOut = [];
    piece.dims.forEach(([label, standard, unit], i) => {
      const row = document.createElement('div');
      row.className = 'cfg-row';

      /* A FIXED dimension is stated, not offered. */
      if (isFixedDim(piece, i)) {
        row.classList.add('cfg-row--fixed');
        const top = document.createElement('div');
        top.className = 'cfg-row-top';
        const lab = document.createElement('span');
        lab.className = 'cfg-fixed-label';
        lab.textContent = label;
        const val = document.createElement('b');
        val.className = 'cfg-val';
        val.textContent = `${standard}${unit}`;
        top.append(lab, val);
        row.appendChild(top);

        const why = dimMode(piece, i).note;
        if (why) {
          const p = document.createElement('p');
          p.className = 'cfg-fixed-note';
          p.textContent = why;
          row.appendChild(p);
        }
        els.dimOut.push(null);
        box.appendChild(row);
        return;
      }

      const b = dimBounds(standard);
      const id = `cfg-dim-${i}`;

      const top = document.createElement('div');
      top.className = 'cfg-row-top';
      const lab = document.createElement('label');
      lab.setAttribute('for', id);
      lab.textContent = label;
      const out = document.createElement('output');
      out.setAttribute('for', id);
      out.className = 'cfg-val';
      top.append(lab, out);
      els.dimOut.push(out);

      // Senior-friendly Stepper Row: [-] [ Slider ] [+]
      const stepperRow = document.createElement('div');
      stepperRow.className = 'cfg-slider-stepper';

      const decBtn = document.createElement('button');
      decBtn.type = 'button';
      decBtn.className = 'cfg-step-btn cfg-step-dec';
      decBtn.setAttribute('aria-label', `${t('step_dec') || 'Decrease'} (${label})`);
      decBtn.innerHTML = '<span aria-hidden="true">&#8722;</span>';

      const input = document.createElement('input');
      input.type = 'range';
      input.id = id;
      input.className = 'cfg-range';
      input.min = String(b.min);
      input.max = String(b.max);
      input.step = String(b.step);
      input.value = String(config.dims[i]);
      input.addEventListener('input', () => {
        config.dims[i] = Number(input.value);
        paint();
      });

      const incBtn = document.createElement('button');
      incBtn.type = 'button';
      incBtn.className = 'cfg-step-btn cfg-step-inc';
      incBtn.setAttribute('aria-label', `${t('step_inc') || 'Increase'} (${label})`);
      incBtn.innerHTML = '<span aria-hidden="true">&#43;</span>';

      decBtn.addEventListener('click', () => {
        const cur = Number(input.value);
        const next = Math.max(b.min, cur - b.step);
        if (next !== cur) {
          input.value = String(next);
          config.dims[i] = next;
          paint();
        }
      });

      incBtn.addEventListener('click', () => {
        const cur = Number(input.value);
        const next = Math.min(b.max, cur + b.step);
        if (next !== cur) {
          input.value = String(next);
          config.dims[i] = next;
          paint();
        }
      });

      stepperRow.append(decBtn, input, incBtn);

      const ends = document.createElement('p');
      ends.className = 'cfg-ends';
      ends.innerHTML = `<span>${b.min}${unit}</span><span>standard ${standard}${unit}</span><span>${b.max}${unit}</span>`;

      row.append(top, stepperRow, ends);
      box.appendChild(row);
    });
    return box;
  }

  /* ---- Material tier --------------------------------------------------- */
  function buildMaterials() {
    const tiers = tiersFor(piece);
    const box = document.createElement('fieldset');
    box.className = 'cfg-group';
    box.innerHTML = `<legend>${t('spec_material_legend') || 'Material'}</legend>`;


    const list = document.createElement('div');
    list.className = 'cfg-tiers';
    els.tierInputs = [];

    tiers.forEach((tier, i) => {
      const id = `cfg-mat-${i}`;
      const lab = document.createElement('label');
      lab.className = 'cfg-tier';
      lab.setAttribute('for', id);

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'cfg-material';
      input.id = id;
      input.value = String(i);
      input.checked = config.material === i;
      input.addEventListener('change', () => { config.material = i; paint(); });
      els.tierInputs.push(input);

      const text = document.createElement('span');
      text.className = 'cfg-tier-text';
      text.innerHTML = `<b>${tier.name}</b><i>${tier.note}</i>`;

      const delta = document.createElement('span');
      delta.className = 'cfg-tier-delta';
      els[`tierDelta${i}`] = delta;

      lab.append(input, text, delta);
      list.appendChild(lab);
    });

    box.appendChild(list);
    return box;
  }

  function pickVariant(v) {
    if (config.variant === v) return;
    config.variant = v;
    paint();
  }

  /* Follow the stage finish swatches when one is clicked */
  document.addEventListener(VARIANT_EVENT, (e) => {
    const v = e.detail && e.detail.variant;
    if (v && piece.variants.includes(v)) pickVariant(v);
  });

  /* ---- Add-ons ---------------------------------------------------------
     Two shapes in one group. `group: 'delivery'` options are mutually exclusive
     and render as radios, because a customer cannot have delivery both inside
     and outside Chattogram; everything else is an independent checkbox. */
  function buildAddons() {
    const offered = addonsFor(piece);
    const box = document.createElement('fieldset');
    box.className = 'cfg-group';
    box.innerHTML = `<legend>${t('spec_addons_legend') || 'Delivery & extras'}</legend>`;

    const groups = new Map();
    const singles = [];
    offered.forEach((a) => {
      if (a.group) {
        if (!groups.has(a.group)) groups.set(a.group, []);
        groups.get(a.group).push(a);
      } else singles.push(a);
    });

    els.addonPrice = {};

    const priceTag = (a) => {
      const span = document.createElement('span');
      span.className = 'cfg-addon-price';
      els.addonPrice[a.key] = span;
      return span;
    };

    groups.forEach((items, name) => {
      const list = document.createElement('div');
      list.className = 'cfg-exclusive';
      items.forEach((a) => {
        const id = `cfg-a-${a.key}`;
        const lab = document.createElement('label');
        lab.className = 'cfg-addon';
        lab.setAttribute('for', id);
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `cfg-group-${name}`;
        input.id = id;
        input.checked = config.addons.includes(a.key);
        input.addEventListener('change', () => {
          /* Selecting one clears its siblings — the model has no concept of an
             exclusive group, so the UI enforces it here. */
          config.addons = config.addons.filter((k) => !items.some((s) => s.key === k));
          config.addons.push(a.key);
          paint();
        });
        const text = document.createElement('span');
        text.textContent = a.label;
        lab.append(input, text, priceTag(a));
        list.appendChild(lab);
      });
      box.appendChild(list);
    });

    singles.forEach((a) => {
      const id = `cfg-a-${a.key}`;
      const lab = document.createElement('label');
      lab.className = 'cfg-addon';
      lab.setAttribute('for', id);
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.checked = config.addons.includes(a.key);
      input.addEventListener('change', () => {
        config.addons = input.checked
          ? [...config.addons, a.key]
          : config.addons.filter((k) => k !== a.key);
        paint();
      });
      const text = document.createElement('span');
      text.textContent = a.label;
      lab.append(input, text, priceTag(a));
      box.appendChild(lab);
    });

    return box;
  }

  /* ---- The total, and the two order controls ---------------------------- */
  function buildTotal() {
    const box = document.createElement('div');
    box.className = 'cfg-total';

    const line = document.createElement('p');
    line.className = 'cfg-total-line';
    line.innerHTML = `<span>${t('estimated_price') || 'Estimated price'}</span>`;
    els.price = document.createElement('b');
    els.price.className = 'cfg-price';
    line.appendChild(els.price);

    els.breakdown = document.createElement('p');
    els.breakdown.className = 'cfg-breakdown';

    /* Reset is only offered once something has moved. A permanently visible
       "reset" on an untouched form is noise. */
    els.reset = document.createElement('button');
    els.reset.type = 'button';
    els.reset.className = 'rule-link cfg-reset';
    els.reset.textContent = t('reset_standard') || 'Reset to the standard specification';
    els.reset.addEventListener('click', () => {
      config = defaultConfig(piece);
      document.dispatchEvent(new CustomEvent(VARIANT_EVENT, { detail: { variant: config.variant } }));
      rebuildControls();
      paint();
    });

    const actions = document.createElement('div');
    actions.className = 'cfg-actions';

    /* Order now = add this configuration, then go to checkout. */
    els.orderNow = document.createElement('button');
    els.orderNow.type = 'button';
    els.orderNow.className = 'btn';
    els.orderNow.textContent = t('btn_order_now') || 'Order';
    els.orderNow.addEventListener('click', () => {
      addLine(piece.id, config);
      location.href = '../../checkout/';
    });

    els.addCart = document.createElement('button');
    els.addCart.type = 'button';
    els.addCart.className = 'btn btn--ghost';
    els.addCart.textContent = t('btn_add_cart') || 'Add to cart';
    els.addCart.addEventListener('click', () => {
      const qty = addLine(piece.id, config);
      const isBn = currentLang() === 'bn';
      if (qty === 1) {
        els.addCart.textContent = t('cart_added_one') || 'Added to cart \u2014 add another?';
      } else {
        const multi = t('cart_added_multi') || '{qty} in your cart \u2014 add another?';
        els.addCart.textContent = multi.replace('{qty}', isBn ? Math.round(qty).toLocaleString('bn-BD') : qty);
      }
    });

    els.waVip = document.createElement('a');
    els.waVip.className = 'btn btn--wa';
    els.waVip.id = 'cfg-wa-vip';
    els.waVip.target = '_blank';
    els.waVip.rel = 'noopener';
    const waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
    els.waVip.innerHTML = `${waIcon}<span>${t('btn_order_wa') || 'Order on WhatsApp'}</span>`;
    els.specSheetBtn = document.createElement('button');
    els.specSheetBtn.type = 'button';
    els.specSheetBtn.className = 'btn btn--ghost';
    els.specSheetBtn.id = 'cfg-spec-btn';
    els.specSheetBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="margin-right:.45rem"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span>${t('spec_sheet_btn') || 'Export Spec Sheet'}</span>`;
    els.specSheetBtn.addEventListener('click', () => {
      openSpecSheet(piece, config);
    });

    actions.append(els.orderNow, els.waVip, els.addCart, els.specSheetBtn);

    const note = document.createElement('p');
    note.className = 'field-hint';
    note.textContent = t('price_note') || ('Nothing is charged online. We confirm your price and ' +
      'lead time before anything is made.');


    box.append(line, els.breakdown, els.reset, actions, note);
    return box;
  }

  /* Radios and sliders hold their own state in the DOM, so a reset has to put
     the controls back as well as the object. Rebuilding the panel is cheaper to
     reason about than reaching into every input. */
  function rebuildControls() {
    mount.textContent = '';
    mount.append(buildPanel());
  }

  /* ---- Paint ------------------------------------------------------------
     One function writes every derived value, called after any change. Nothing
     else computes a price, so the panel cannot disagree with itself. */
  function paint({ initial = false } = {}) {
    piece.dims.forEach(([, standard, unit], i) => {
      const out = els.dimOut[i];
      if (!out) return;              /* a fixed row: nothing to rewrite */
      const v = config.dims[i];
      out.textContent = `${v}${unit}`;
      out.dataset.std = String(v === standard);
    });

    /* Each tier shows what CHOOSING it would cost from here, so the comparison
       is against the current configuration rather than an abstract base. */
    const here = basePrice(piece, config);
    tiersFor(piece).forEach((tier, i) => {
      const at = basePrice(piece, { ...config, material: i });
      const d = at - here;
      const el = els[`tierDelta${i}`];
      if (!el) return;
      el.textContent = d === 0 ? '' : (d > 0 ? `+${taka(d)}` : `−${taka(-d)}`);
    });

    const base = basePrice(piece, config);
    addonsFor(piece).forEach((a) => {
      const el = els.addonPrice[a.key];
      if (!el) return;
      const cost = a.pct ? base * a.pct : (a.amount || 0);
      el.textContent = cost === 0 ? 'Included' : `+${taka(cost)}`;
    });

    const total = unitPrice(piece, config);
    els.price.textContent = taka(total);
    document.dispatchEvent(new CustomEvent('hfm:config-price', { detail: { total, formatted: taka(total) } }));

    /* extrasPrice(), not a local rounding: unitPrice() adds this exact figure to
       this exact base, so the printed parts sum to the printed headline by
       construction. Rounding it here independently is half of what made 10 of
       the 18 pieces disagree with themselves. */
    const extras = extrasPrice(piece, config);
    const pct = Math.round(specLevel(piece, config) * 100);
    const range = `${taka(piece.price.min)}–${taka(piece.price.max)}`;
    const isBn = currentLang() === 'bn';
    if (isBn) {
      els.breakdown.textContent = extras
        ? `আসবাব ${taka(base, 'bn')} · অতিরিক্ত সেবা ${taka(extras, 'bn')}`
        : pct === 0 ? `মূল স্ট্যান্ডার্ড স্পেসিফিকেশন। আনুমানিক রেঞ্জ ${range}।`
        : pct < 0 ? `স্ট্যান্ডার্ড মাপের চেয়ে কম। আনুমানিক রেঞ্জ ${range}।`
        : `স্ট্যান্ডার্ড থেকে ${Math.round(pct).toLocaleString('bn-BD')}% কাস্টমাইজড (${range})।`;
    } else {
      els.breakdown.textContent = extras
        ? `${taka(base)} for the piece · ${taka(extras)} in extras`
        : pct === 0 ? `The standard specification, as listed. Range ${range}.`
        : pct < 0 ? `Below the standard specification. Range ${range}.`
        : `${pct}% through the ${range} range for this piece.`;
    }


    function syncWaVip() {
      if (!els.waVip) return;
      const v = config.variant || (piece.variants.length ? piece.variants[0] : '');
      const priceStr = taka(unitPrice(piece, config));
      const rawMsg = t('wa_greeting', currentLang());
      const msg = rawMsg
        .replace('{name}', piece.name)
        .replace('{variant}', v || 'Standard')
        .replace('{price}', priceStr);
      els.waVip.href = `https://wa.me/8801960481983?text=${encodeURIComponent(msg)}`;
    }
    syncWaVip();

    const lang = currentLang();
    els.reset.hidden = isStandard(piece, config);
    els.reset.textContent = t('reset_standard', lang);
    els.orderNow.textContent = t('btn_order_now', lang) || 'Order';
    if (els.waVip) {
      const sp = els.waVip.querySelector('span');
      if (sp) sp.textContent = t('btn_order_wa', lang);
    }
    els.addCart.textContent = t('btn_add_cart', lang);

    /* Keep the deep link current so the address bar always describes what is on
       screen — copyable, shareable, and what the cart's Edit link restores.
       replaceState, not pushState: a slider must not fill the back button.

       Only once the visitor has specified something, though. Every call that is
       not the one from init is driven by a control — a slider, a material
       radio, a variant swatch, an add-on, or Reset — so `initial` is the whole
       test, and no handler needs to opt in. */
    if (!initial) touched = true;
    if (touched) history.replaceState(null, '', '#' + toHash(config));
  }
}

/* ---- Deep links ---------------------------------------------------------
   A compact hash rather than JSON: it has to survive being pasted into
   WhatsApp, so it stays short and uses no characters that need escaping.
     cfg=200x220x140,m1,vEmerald,a=led+warranty
   Unparseable input returns null and the caller falls back to standard spec —
   a bad link must open the piece, never an error. */
function toHash(c) {
  const parts = [`cfg=${c.dims.map((v) => Math.round(v)).join('x')}`, `m${c.material}`];
  if (c.variant) parts.push(`v${encodeURIComponent(c.variant)}`);
  if (c.addons.length) parts.push(`a=${c.addons.join('+')}`);
  return parts.join(',');
}

function fromHash(p) {
  const h = location.hash.replace(/^#/, '');
  if (!h.startsWith('cfg=')) return null;
  try {
    const parts = h.split(',');
    const raw = parts[0].slice(4).split('x').map(Number);
    /* Wrong arity is MALFORMED, not merely out of range — a two-dimension hash
       for a three-dimension piece describes nothing, so fall back to standard
       rather than guessing which dimension is missing. */
    if (raw.length !== p.dims.length) return null;

    const std = defaultConfig(p);
    const mat = parts.find((s) => /^m\d+$/.test(s));
    const variant = parts.find((s) => s.startsWith('v'));
    const addons = parts.find((s) => s.startsWith('a='));
    const asked = addons ? addons.slice(2).split('+') : std.addons;

    /* Every field is clamped to what this piece actually offers. The hash is
       built to survive being pasted into WhatsApp, which is exactly where it
       gets truncated or mangled — and whatever survives that reaches the order
       document. See the note above clampDims() in js/pricing.js. */
    return {
      dims: clampDims(p, raw),
      material: clampMaterial(p, mat ? mat.slice(1) : 0),
      /* A variant this piece does not have would leave every Finish chip
         un-pressed, so it falls back to the first rather than to nothing. */
      variant: p.variants.includes(variant ? decodeURIComponent(variant.slice(1)) : null)
        ? decodeURIComponent(variant.slice(1))
        : std.variant,
      addons: clampAddons(p, asked, std.addons),
      qty: 1,
    };
  } catch { return null; }
}

/* Drops unknown keys, and guarantees each mutually exclusive group has exactly
   one selection. Without the group repair, `a=protection` alone renders the
   delivery radios with none checked — the same defect an out-of-range material
   index used to produce. */
function clampAddons(p, asked, fallback) {
  const offered = addonsFor(p);
  const keep = (Array.isArray(asked) ? asked : fallback)
    .filter((k) => typeof k === 'string' && offered.some((a) => a.key === k));

  const groups = new Set(offered.filter((a) => a.group).map((a) => a.group));
  groups.forEach((g) => {
    const inGroup = offered.filter((a) => a.group === g);
    const chosen = keep.filter((k) => inGroup.some((a) => a.key === k));
    if (chosen.length === 1) return;
    /* Zero or several: keep the preset, or the group's first option. */
    const preset = inGroup.find((a) => a.preset) || inGroup[0];
    chosen.forEach((k) => keep.splice(keep.indexOf(k), 1));
    if (preset) keep.push(preset.key);
  });
  return keep;
}
