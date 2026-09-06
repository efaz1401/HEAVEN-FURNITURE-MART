/* ==========================================================================
   Fills the static piece-page shell from data/pieces.js so every piece page
   shares one source of truth for copy, dimensions, materials and lead times.
   The HTML files carry only what SEO needs in the markup (title, meta,
   canonical, JSON-LD); everything visible is filled from the manifest.
   ========================================================================== */

import { bySlug, catName, taka, pick, DIM_LABELS_BN } from '../data/pieces.js';
import { t, currentLang, LANG_EVENT } from '../data/i18n.js';

const root = document.getElementById('piece-root');
const p = root && bySlug(root.dataset.piece);

if (p) {
  function fillText() {
    const isBn = currentLang() === 'bn';
    const lang = isBn ? 'bn' : 'en';
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

    const pName = pick(p, 'name', lang) || p.name;
    const pTagline = pick(p, 'tagline', lang) || p.tagline;
    const pDesc = pick(p, 'desc', lang) || p.desc;
    const cName = isBn ? (t('cat_' + p.cat.replace('-', '_')) || catName(p.cat)) : catName(p.cat);
    const madeToOrder = isBn ? t('made_to_order') : 'Made to order';

    set('p-name', pName);
    set('p-tagline', pTagline);
    set('p-desc', pDesc);
    set('p-lead', isBn ? p.lead.replace('weeks', 'সপ্তাহ').replace('week', 'সপ্তাহ') : p.lead);
    set('crumb-name', pName);
    set('crumb-cat', cName);
    set('p-eyebrow', `${cName} \u00B7 ${madeToOrder}`);
    document.title = `${pName} — Heaven Furniture Mart`;

    // Breadcrumbs
    const crumbsNav = document.querySelector('.crumbs nav');
    if (crumbsNav) {
      const homeLink = crumbsNav.querySelector('a[href="../../"]');
      if (homeLink) homeLink.textContent = isBn ? t('nav_home') : 'Home';
      const collLink = crumbsNav.querySelector('a[href="../../collections/"]');
      if (collLink) collLink.textContent = isBn ? t('nav_collections') : 'Collections';
    }

    const waBtn = document.getElementById('wa-btn');
    if (waBtn) waBtn.textContent = isBn ? (t('btn_ask_wa') || 'হোয়াটসঅ্যাপে জানতে চান') : 'Ask a question on WhatsApp';

    let pMeta = document.getElementById('p-meta-lead');
    const nameEl = document.getElementById('p-name');
    if (!pMeta && nameEl) {
      pMeta = document.createElement('div');
      pMeta.id = 'p-meta-lead';
      pMeta.className = 'piece-meta-lead';
      nameEl.insertAdjacentElement('afterend', pMeta);
    }
    if (pMeta && p.price) {
      const priceStr = taka(p.price.min, lang);
      const leadStr = isBn ? p.lead.replace('weeks', 'সপ্তাহ').replace('week', 'সপ্তাহ') : p.lead;
      pMeta.innerHTML = `<span class="piece-meta-price">${isBn ? `${priceStr} থেকে শুরু` : `From ${priceStr}`}</span> <span class="piece-meta-dot">\u00B7</span> <span class="piece-meta-time">${isBn ? `তৈরির সময়: ${leadStr}` : `Lead time: ${leadStr}`}</span>`;
    }

    const specCaption = document.querySelector('#spec caption');
    if (specCaption) specCaption.textContent = isBn ? (t('dimensions') || 'মাপ (ডাইমেনশন)') : 'Dimensions';

    // Dimensions
    const tb = document.querySelector('#spec tbody');
    if (tb) {
      tb.textContent = '';
      p.dims.forEach(([label, value, unit]) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = isBn ? (DIM_LABELS_BN[label] || label) : label;
        const td = document.createElement('td');
        const inches = Math.round(value / 2.54);
        const valStr = isBn ? value.toLocaleString('bn-BD') : value;
        const inStr = isBn ? inches.toLocaleString('bn-BD') : inches;
        const unitStr = isBn ? 'সেমি' : unit;
        const inUnitStr = isBn ? 'ইঞ্চি' : 'in';
        td.textContent = `${valStr} ${unitStr} / ${inStr} ${inUnitStr}`;
        tr.append(th, td);
        tb.appendChild(tr);
      });
    }

    // Materials
    const ml = document.getElementById('materials');
    if (ml) {
      const matHeading = ml.previousElementSibling;
      if (matHeading && (matHeading.tagName === 'H2' || matHeading.tagName === 'H3')) {
        matHeading.textContent = isBn ? (t('materials_heading') || 'উপাদান') : 'Materials';
      }
      ml.textContent = '';
      const mats = pick(p, 'materials', lang) || p.materials;
      mats.forEach((m) => {
        const li = document.createElement('li');
        li.textContent = m;
        ml.appendChild(li);
      });
    }

    const pLead = document.getElementById('p-lead');
    if (pLead) {
      const parent = pLead.closest('.pill');
      if (parent) {
        Array.from(parent.childNodes).forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE) n.remove();
        });
        parent.insertBefore(document.createTextNode(isBn ? 'তৈরির সময় ' : 'Lead time '), pLead);
      }
    }

    const poster = document.getElementById('poster-img');
    if (poster) {
      poster.alt = pick(p, 'alt', lang) || p.alt;
    }

    const caveat = document.getElementById('ar-caveat');
    if (caveat) {
      caveat.innerHTML = t('ar_caveat');
    }

    const arHelp = document.getElementById('ar-help');
    if (arHelp) {
      arHelp.innerHTML = t('ar_help_notice');
    }

    const qrCard = document.querySelector('.qr-card p');
    if (qrCard) {
      qrCard.innerHTML = `<strong>${t('qr_title')}</strong>${t('qr_desc')}`;
    }
  }

  fillText();
  document.addEventListener(LANG_EVENT, fillText);

  /* ---- The stage poster error fallback ---------------------------------- */
  const poster = document.getElementById('poster-img');
  if (poster) {
    poster.addEventListener('error', () => {
      const stage = document.getElementById('stage');
      poster.srcset = '';
      poster.src = `../../assets/img/${p.id}_1024.webp`;
      poster.width = 1024;
      poster.height = 768;
      if (stage) delete stage.dataset.cut;
    }, { once: true });
  }

  // Hide the fabric block entirely when a piece has no variants.
  const vb = document.getElementById('variant-block');
  if (vb && !p.variants.length) vb.hidden = true;

  // Honest AR-scale caveat only while the model is uncalibrated.
  const caveat = document.getElementById('ar-caveat');
  if (caveat && p.arVerified) caveat.hidden = true;
}
