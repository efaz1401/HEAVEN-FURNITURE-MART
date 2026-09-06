/* ==========================================================================
   HOMEPAGE — everything on index.html that is derived from data.

   This replaces the inline <script type="module"> that used to sit at the
   bottom of index.html. Same job, same single source of truth, but now it is
   cacheable, syntax-checkable, and has room for the sections the re-skin added.

   THE RULE THIS FILE EXISTS TO ENFORCE: no count is ever typed into the page.
   "18 pieces", "8 in AR", "5 rooms" are all computed from
   data/pieces.js at runtime, so adding a nineteenth piece updates the
   homepage's prose, its meta strip, its carousel and its rail together. The
   numbers that DO appear in index.html are fallbacks for a JS-off visit and
   are always overwritten when this module runs.

   Every block guards its own mount point, so a section can be removed from the
   markup without breaking the others.
   ========================================================================== */

import { PIECES, CATEGORIES, MILESTONES, MD, CRAFT_PILLARS, CASE_STUDIES, FAQS, catName, inCat, withAR, waLink } from '../data/pieces.js';
import { card } from './card.js';
import { currentLang, LANG_EVENT, t } from '../data/i18n.js';
/* See the note in js/cat.js: the cat_* lookup has to live outside pieces.js. */
const catLabel = (slug) =>
  (currentLang() === 'bn' && t('cat_' + slug.replace(/-/g, '_'))) || catName(slug);

import { initBeforeAfter } from './before-after.js';
import { initEstimator } from './estimator.js';
import { initConcierge } from './concierge.js';

/* ==========================================================================
   §0 — BILINGUAL STATIC COPY
   The homepage's copy is static markup (it must be: it is the no-JS state and
   the LCP text), so বাংলা mode rewrites the buyer-critical zones in place:
   hero, section headings and CTAs, the consult band and its ask-form. Runs at
   boot and on every hfm:lang event; mirrors js/shell.js's initLang() and
   js/cart.js's render() pattern. Body copy that JS does not own (the craft
   story, milestones prose) stays English in this pass — it is the deep-read
   content, not the buying path.
   ========================================================================== */
function translateHome() {
  const isBn = currentLang() === 'bn';
  const set = (sel, txt) => {
    if (!txt) return;
    document.querySelectorAll(sel).forEach((el) => { el.textContent = txt; });
  };

  /* Hero. The keys carry fuller copy than the current EN headline; EN keeps
     the live markup untouched by passing null (t() returns '' on a miss,
     so the || fallbacks below are the shipped strings). */
  set('#hero h1', isBn ? t('home_hero_title') : 'Furniture carved by hand. Checked by phone.');
  set('#hero .lead', isBn ? t('home_hero_sub')
    : 'We build bespoke pieces in our own workshop \u2014 then let you stand them in your actual room, at actual size, before you commission anything.');
  const heroCta = document.querySelector('#hero .btn-ar');
  if (heroCta) {
    const svg = heroCta.querySelector('svg');
    const label = isBn ? (t('nav_ar') || '\u09B0\u09C1\u09AE\u09C7 \u09AC\u09B8\u09BF\u09DF\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8') : 'See it in your room';
    if (svg) {
      const span = heroCta.querySelector('.br-b');
      heroCta.textContent = '';
      heroCta.append(svg, document.createTextNode(' ' + label + ' '));
      if (span) heroCta.appendChild(span);
    }
  }
  const browseCta = document.querySelector('#hero .btn--ghost');
  if (browseCta) browseCta.textContent = isBn
    ? (t('home_cta_collections') || '\u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8') : 'Browse collections';

  /* Section headings the keys cover. */
  set('[data-i18n="home_collections_heading"]', t('home_collections_heading'));
  set('[data-i18n="home_bespoke_heading"]', t('home_bespoke_heading'));
  set('[data-i18n="home_workshop_heading"]', t('home_workshop_heading'));

  /* Consult band + ask-form. */
  set('.consult h2', isBn
    ? '\u0985\u09A5\u09AC\u09BE \u098F\u09AE\u09A8 \u0995\u09BF\u099B\u09C1 \u0986\u099C\u09BE\u09A8\u09C7 \u0986\u099C \u09A8\u09C7\u0987, \u09B8\u09C7\u099F\u09BE \u0986\u09AE\u09B0\u09BE \u0986\u0981\u0995\u09BF\u09C7\u099B\u09BF\u0964'
    : 'Or we draw something that doesn\u2019t exist yet.');
  set('.consult .lead', isBn
    ? '\u098F\u0995\u099F\u09BF \u09B0\u09C1\u09AE\u09C7\u09B0 \u09AE\u09BE\u09AA, \u09AC\u09BE \u09AC\u09BF\u09B6 \u09AC\u099B\u09B0 \u0986\u0997\u09C7 \u09A6\u09C7\u0996\u09BE \u0995\u09CB\u09A8\u0993 \u099B\u09AC\u09BF\u09B0 \u0995\u09A5\u09BE \u09AC\u09B2\u09C1\u09A8\u0964 \u0986\u09AE\u09B0\u09BE \u098F\u0996\u09BE\u09A8\u09BF \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09BF, \u09A6\u09BE\u09AE \u09A0\u09BF\u0995\u09BF, \u0995\u09BE\u09B0\u09C7 \u098F\u09AC\u0982 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u0995\u09B0\u09BF\u0964'
    : 'Bring a room, a measurement, or a photograph of something you saw twenty years ago. We draw it, quote it, carve it and deliver it.');
  set('.consult .rule-link', isBn
    ? '\u0995\u09AE\u09BF\u09B6\u09A8 \u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u09B9\u09DF' : 'How a commission works');

  const askRoom = document.getElementById('ask-room');
  if (askRoom) {
    const first = askRoom.querySelector('option');
    if (first) first.textContent = isBn ? '\u09AF\u09C7 \u0995\u09CB\u09A8\u09CB \u09B0\u09C1\u09AE' : 'Any room';
    askRoom.querySelectorAll('option').forEach((o, i) => {
      if (i === 0) return;
      const cat = CATEGORIES[i - 1];
      if (cat) {
        const slugKey = 'cat_' + cat.slug.replace(/-/g, '_');
        o.textContent = isBn ? (t(slugKey) || cat.name) : cat.name;
      }
    });
  }
  const askText = document.getElementById('ask-text');
  if (askText) askText.placeholder = isBn
    ? '\u0995\u09C0 \u09A6\u09C1\u0987\u099B\u09C7\u09A8? \u09AF\u09C7\u09AE\u09A8 \u2014 \u0997\u09BE\u099D\u09BE\u0995\u09BE\u09A0\u09BF \u09A1\u09BE\u0987\u09A8\u09BF\u0982 \u09B8\u09C7\u099F\u2026'
    : 'A six-seat dining set in dark walnut\u2026';
  const askLabel = document.querySelector('label[for="ask-text"]');
  if (askLabel) askLabel.textContent = isBn ? '\u0995\u09C0 \u0996\u09C7\u0981\u099C\u099B\u09C7\u09A8?' : 'What are you looking for?';
  const askRoomLabel = document.querySelector('label[for="ask-room"]');
  if (askRoomLabel) askRoomLabel.textContent = isBn ? '\u09B0\u09C1\u09AE' : 'Room';

  /* Craft story narrative */
  const cineRows = document.querySelectorAll('.cine-row');
  if (cineRows.length >= 3) {
    const p0 = cineRows[0].querySelector('.cine-detail p');
    if (p0) p0.textContent = isBn ? '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u0995\u09BE\u09B0\u0996\u09BE\u09A8\u09BE\u09DF \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AB\u09CD\u09B0\u09C7\u09AE \u09A4\u09C8\u09B0\u09BF \u0993 \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u099C\u09CB\u09DC\u09BE \u09B2\u09BE\u0997\u09BE\u09A8\u09CB\u0964 \u0995\u09CB\u09A8\u09CB \u09B8\u09BE\u09AC-\u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09BE\u0995\u09CD\u099F\u09B0 \u09A8\u09C7\u0987, \u0995\u09CB\u09A8\u09CB \u0985\u09A8\u09BE\u0995\u09BE\u0999\u09CD\u0995\u09CD\u09B7\u09BF\u09A4 \u09AA\u09CD\u09B2\u09BE\u0987\u0989\u09A1 \u09AC\u09BE \u099C\u09CB\u09DC\u09BE\u09A4\u09BE\u09B2\u09BF \u09A8\u09C7\u0987\u0964' : "Every frame cut and joined by hand in our own workshop. No sub-contractors, no MDF where you'd see it.";
    const p1 = cineRows[1].querySelector('.cine-detail p');
    if (p1) p1.textContent = isBn ? '\u09B8\u09AE\u09CD\u09AA\u0982\u09B0\u09CD\u09A3 \u09B8\u09B2\u09BF\u09A1 \u0995\u09BE\u09A0 \u2014 \u09B6\u0995\u09CD\u09A4 \u09AE\u09B0\u09CD\u099F\u09BF\u09B8-\u0985\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1-\u099F\u09C7\u09A8\u09A8 \u099C\u09DF\u09C7\u09A8\u09CD\u099F, \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09C7\u09B8\u09CD\u099F\u09C7 \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u0996\u09CB\u09A6\u09BE\u0987\u0964 \u0995\u09BE\u09A0 \u0993 \u099C\u09DF\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u0997\u09C1\u09A3\u0997\u09A4 \u09AE\u09BE\u09A8\u0987 \u0986\u09B8\u09B2 \u09AA\u09B0\u09BF\u099A\u09DF\u0964' : "Solid hardwood throughout \u2014 pegged mortise-and-tenon joints, hand-carved crests on every back rail. The joint is the detail.";
    const p2 = cineRows[2].querySelector('.cine-detail p');
    if (p2) p2.textContent = isBn ? '\u09B0\u09C1\u09AE\u09C7\u09B0 \u09AE\u09BE\u09AA, \u0995\u09CB\u09A8\u09CB \u099B\u09AC\u09BF \u09AC\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09A7\u09BE\u09B0\u09A3\u09BE \u09A8\u09BF\u09DF\u09C7 \u0986\u09B8\u09C1\u09A8\u0964 \u0986\u09AE\u09B0\u09BE \u09A8\u0995\u09B6\u09BE \u0986\u0981\u0995\u09BF, \u09A6\u09BE\u09AE \u09A8\u09BF\u09B0\u09CD\u09A7\u09BE\u09B0\u09A3 \u0995\u09B0\u09BF, \u0995\u09BE\u09A0 \u0996\u09CB\u09A6\u09BE\u0987 \u0995\u09B0\u09BF \u098F\u09AC\u0982 \u0986\u09AA\u09A8\u09BE\u09B0 \u0998\u09B0\u09C7 \u09AA\u09CC\u0981\u099B\u09C7 \u09A6\u09BF\u0987\u0964' : "Bring a room measurement, a photograph, or a description. We draw it, quote it, carve it, and deliver it to your door.";
  }

  /* Workshop floor narrative */
  set('.workshop-text h2', isBn ? t('home_heritage_title') : 'Built in Agrabad. Carved by hand.');
  set('.workshop-text p:first-of-type', isBn ? t('home_heritage_lead') : 'Twenty-eight years in Chattogram. We season our own timber, carve our own frames and deliver across Bangladesh.');

  /* 10/10 Feature Sections */
  set('#pillars-eyebrow', t('pillars_eyebrow') || 'Engineering Standards');
  set('#pillars-heading', t('pillars_heading') || 'The Four Pillars of Craftsmanship.');
  set('#pillars-lead', t('pillars_lead') || 'Real luxury is not surface ornament. It is moisture-controlled seasoning, interlocking joinery, and durable protective barriers designed for generations.');

  set('#ba-eyebrow', t('ba_eyebrow') || 'Space Transformation');
  set('#ba-heading', t('ba_title') || 'From Architectural Line to Delivered Sanctuary.');
  set('#ba-lead', t('ba_lead') || 'Drag the slider to observe how empty Chattogram residential spaces transform into fully styled sanctuaries with custom dimensions, hand-selected timber, and tailored upholstery.');
  set('#ba-badge-before', t('ba_label_before') || 'Raw Space');
  set('#ba-badge-after', t('ba_label_after') || 'Delivered Sanctuary');
  set('#ba-hint-text', t('ba_hint') || 'Drag to compare');

  set('#cases-eyebrow', t('cases_eyebrow') || 'Local Commissions');
  set('#cases-heading', t('cases_title') || 'Curated Chattogram Residences.');
  set('#cases-lead', t('cases_lead') || 'Named bespoke commissions across Khulshi, GEC Hills, and Agrabad — proportioned, hand-finished, and installed on site by our workshop team.');

  set('#est-eyebrow', t('est_eyebrow') || 'Instant Transparency');
  set('#est-heading', t('est_title') || 'Timber & Budget Quick-Estimator.');
  set('#est-lead', t('est_lead') || 'Select your room category, hardwood grade, and upholstery to view real-time workshop pricing and lead times before commissioning.');
  set('#est-step1-title', t('est_step1') || '1. Select Category');
  set('#est-step2-title', t('est_step2') || '2. Select Hardwood Grade');
  set('#est-step3-title', t('est_step3') || '3. Select Upholstery & Finish');
  set('#est-res-kicker', t('est_from') || 'Estimated Investment Range');
  set('#est-lead-title', t('est_lead_time') || 'Crafting Time');
  set('#est-cta-text', t('est_cta_wa') || 'Send Estimate on WhatsApp');
  set('#est-note-text', t('est_note') || 'Transparent estimate based on current timber seasoning stock. No account required.');

  set('#faq-eyebrow', t('faq_eyebrow') || 'Client Inquiries');
  set('#faq-heading', t('faq_title') || 'Frequently Answered Questions.');
  set('#faq-lead', t('faq_lead') || 'Uncompromising clarity on timber durability, custom commissions, and white-glove delivery across Bangladesh.');

  set('#concierge-title', t('concierge_title') || 'VIP Concierge Consultation');
  set('#concierge-sub', t('concierge_sub') || 'Choose how you would like to connect with our master craftsmen and design directors.');
  set('#c-t1-title', t('concierge_t1_title') || 'Private Showroom Walkthrough');
  set('#c-t1-desc', t('concierge_t1_desc') || 'VIP table reservation at our Agrabad showroom with MD Abul Kalam Bhuiyan or master artisans.');
  set('#c-t2-title', t('concierge_t2_title') || 'In-Home Architectural Measurement');
  set('#c-t2-desc', t('concierge_t2_desc') || 'Complimentary on-site laser measuring and timber swatches at your Chattogram residence.');
  set('#c-t3-title', t('concierge_t3_title') || 'Live Workshop Video Walkthrough');
  set('#c-t3-desc', t('concierge_t3_desc') || 'Direct WhatsApp HD video call for expatriates and busy executives to inspect carving and finishes live.');
  document.querySelectorAll('.concierge-tier-btn').forEach(el => {
    el.textContent = t('concierge_btn') || 'Book Consultation';
  });

  renderPillars();
  renderCases();
  renderFaqs();
}

let pillarMode = 'heaven'; // 'heaven' | 'market'

function setupPillarsToggle() {
  const toggleWrap = document.querySelector('.pillars-toggle');
  if (!toggleWrap || toggleWrap.dataset.bound) return;
  toggleWrap.dataset.bound = 'true';

  toggleWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.pillars-toggle-btn');
    if (!btn) return;
    const mode = btn.dataset.mode;
    if (mode === pillarMode) return;
    pillarMode = mode;

    toggleWrap.querySelectorAll('.pillars-toggle-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.mode === pillarMode);
    });

    const grid = document.getElementById('pillars-grid');
    if (grid) {
      grid.classList.toggle('is-market', pillarMode === 'market');
      grid.classList.add('pillar-content-fade', 'is-fading');
      setTimeout(() => {
        renderPillarsCards();
        grid.classList.remove('is-fading');
      }, 150);
    }
  });
}

function renderPillarsCards() {
  const isBn = currentLang() === 'bn';
  const grid = document.getElementById('pillars-grid');
  if (!grid || !CRAFT_PILLARS.length) return;
  grid.textContent = '';

  const isMarket = pillarMode === 'market';
  grid.classList.toggle('is-market', isMarket);

  CRAFT_PILLARS.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'pillar-card';

    const data = isMarket ? p.market : p;
    let metric;
    let badge;
    let title;
    let sub;
    let desc;

    if (isMarket) {
      metric = isBn ? (t(`pillar_${p.id}_m_metric`) || data.metric) : data.metric;
      badge = isBn ? (t(`pillar_${p.id}_m_badge`) || data.specBadge) : data.specBadge;
      title = isBn ? (t(`pillar_${p.id}_m_title`) || data.title) : data.title;
      sub = isBn ? (t(`pillar_${p.id}_m_sub`) || data.subtitle) : data.subtitle;
      desc = isBn ? (t(`pillar_${p.id}_m_desc`) || data.desc) : data.desc;
    } else {
      metric = isBn ? (t(`pillar_${p.id}_metric`) || (p.metric === '10-Year' ? '১০ বছর' : (p.metric === '7-Layer' ? '৭ স্তর' : p.metric))) : p.metric;
      badge = isBn ? (t(`pillar_${p.id}_badge`) || p.specBadge) : p.specBadge;
      title = isBn ? (t(`pillar_${p.id}_title`) || p.title) : p.title;
      sub = isBn ? (t(`pillar_${p.id}_sub`) || p.subtitle) : p.subtitle;
      desc = isBn ? (t(`pillar_${p.id}_desc`) || p.desc) : p.desc;
    }

    const indexStr = isBn
      ? p.index.replace(/0/g, '০').replace(/1/g, '১').replace(/2/g, '২').replace(/3/g, '৩').replace(/4/g, '৪')
      : p.index;

    card.innerHTML = `
      <span class="pillar-index" aria-hidden="true">${indexStr}</span>
      <div class="pillar-badge-svg" aria-hidden="true">${p.svg}</div>
      <div class="pillar-spec-pill">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6"/></svg>
        <span>${badge}</span>
      </div>
      <span class="pillar-metric">${metric}</span>
      <h3 class="pillar-title">${title}</h3>
      <span class="pillar-subtitle">${sub}</span>
      <p class="pillar-desc">${desc}</p>
    `;
    grid.appendChild(card);
  });
}

function renderPillars() {
  setupPillarsToggle();
  const btnHeavenLabel = document.getElementById('pillars-toggle-ours');
  if (btnHeavenLabel) {
    btnHeavenLabel.textContent = t('pillars_toggle_ours') || 'Heaven Workshop Standard';
  }
  const btnMarketLabel = document.getElementById('pillars-toggle-market');
  if (btnMarketLabel) {
    btnMarketLabel.textContent = t('pillars_toggle_market') || 'Commercial Market';
  }
  renderPillarsCards();
}

function renderCases() {
  const isBn = currentLang() === 'bn';
  const grid = document.getElementById('cases-grid');
  if (!grid || !CASE_STUDIES.length) return;
  grid.textContent = '';
  CASE_STUDIES.forEach((cs) => {
    const card = document.createElement('article');
    card.className = 'case-card';
    const srcsetAttr = cs.srcset ? `srcset="${cs.srcset}" sizes="(min-width: 900px) 400px, calc(100vw - 3rem)"` : '';
    card.innerHTML = `
      <div class="case-img-wrap">
        <img src="${cs.img}" ${srcsetAttr} alt="${cs.name}" loading="lazy" decoding="async" width="640" height="400">
        <span class="case-lead-tag">${cs.lead}</span>
      </div>
      <div class="case-body">
        <span class="case-loc">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <span>${cs.location}</span>
        </span>
        <h3 class="case-title">${cs.name}</h3>
        <ul class="case-meta-list">
          <li class="case-meta-item">
            <span class="case-meta-k">${t('cases_room') || 'Space'}</span>
            <span class="case-meta-v">${cs.room}</span>
          </li>
          <li class="case-meta-item">
            <span class="case-meta-k">${t('cases_species') || 'Hardwood'}</span>
            <span class="case-meta-v">${cs.species}</span>
          </li>
          <li class="case-meta-item">
            <span class="case-meta-k">${t('cases_finish') || 'Finish'}</span>
            <span class="case-meta-v">${cs.finish}</span>
          </li>
        </ul>
        <p class="case-desc">${cs.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderFaqs() {
  const isBn = currentLang() === 'bn';
  const faqList = document.getElementById('faq-list');
  if (!faqList || !FAQS.length) return;
  faqList.textContent = '';
  FAQS.forEach((faq, idx) => {
    const li = document.createElement('li');
    li.className = 'faq-item';
    li.dataset.open = idx === 0 ? 'true' : 'false';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'faq-question';
    btn.setAttribute('aria-expanded', idx === 0 ? 'true' : 'false');
    btn.setAttribute('aria-controls', `faq-ans-${idx}`);
    btn.id = `faq-q-${idx}`;

    const qSpan = document.createElement('span');
    qSpan.textContent = isBn ? (t(`faq_q_${idx}`) || faq.q) : faq.q;

    const icon = document.createElement('span');
    icon.className = 'faq-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';

    btn.append(qSpan, icon);

    const ans = document.createElement('div');
    ans.className = 'faq-answer';
    ans.id = `faq-ans-${idx}`;
    ans.setAttribute('role', 'region');
    ans.setAttribute('aria-labelledby', `faq-q-${idx}`);

    const inner = document.createElement('div');
    inner.className = 'faq-answer-inner';
    const p = document.createElement('p');
    p.textContent = isBn ? (t(`faq_a_${idx}`) || faq.a) : faq.a;
    inner.appendChild(p);
    ans.appendChild(inner);

    btn.addEventListener('click', () => {
      const isOpen = li.dataset.open === 'true';
      li.dataset.open = isOpen ? 'false' : 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    li.append(btn, ans);
    faqList.appendChild(li);
  });
}

initBeforeAfter('ba-slider');
initEstimator('quick-estimator');
initConcierge();

translateHome();
document.addEventListener(LANG_EVENT, translateHome);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Numbers read as words in prose and as digits in the meta strip — the same
   value, two registers. Nineteen and up fall back to digits rather than
   inventing English; the list only has to cover the catalogue's real size. */
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const word = (n) => (NUM[n] || String(n));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const AR_PIECES = withAR();
const arCount = AR_PIECES.length;

/* ==========================================================================
   §2 — META STRIP
   ========================================================================== */
/* querySelectorAll, not querySelector: the counts appear twice on this page now —
   once in the numbers strip and again inside §8b's third-party-checkable claims —
   and the single-element version silently left the second copy at its hardcoded
   fallback, which is exactly the drift the derived counts exist to prevent. */
const setText = (sel, value) => {
  document.querySelectorAll(sel).forEach((el) => { el.textContent = value; });
};

setText('[data-count="pieces"]', String(PIECES.length));
setText('[data-count="ar"]', String(arCount));

/* THIS CELL USED TO COMPUTE AN AGE, and the age was invented. It read the founding
   year out of `data-since="1998"` and printed the difference — 28 — against a company
   the brief says was founded in 2020. The arithmetic was sound and the input was
   fiction, which is the worst combination: it self-updated, so it stayed plausible
   every January.
   The room count is derived from the same catalogue as its two neighbours, and the
   real dated achievements now have their own strip below (§2b). */
setText('[data-count="rooms"]', String(CATEGORIES.length));

/* ==========================================================================
   §2b — MILESTONES

   Five dated achievements, from MILESTONES in data/pieces.js. This replaces the
   invented "hand-carved since 1998" heritage the site used to lead with: a real 2020
   founding is younger than the fiction, but five verifiable dates — a showroom, a
   trade fair, a chamber membership, a national recognition — carry more than one
   number nobody can check.

   Rendered rather than typed so the strip and the data cannot drift, the same rule
   the counts above follow.
   ========================================================================== */
const stones = document.getElementById('milestones');
if (stones && MILESTONES.length) {
  stones.textContent = '';
  MILESTONES.forEach(([year, what]) => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = year;
    const s = document.createElement('span');
    s.textContent = what;
    li.append(b, s);
    stones.appendChild(li);
  });
}

/* ==========================================================================
   §8c — THE MANAGING DIRECTOR

   Written from MD in data/pieces.js for the same reason as the strip above: a
   quote attributed to a named person is the one piece of copy on this site that
   must never be paraphrased by whoever edits the markup next.

   Each field is set only if its element exists, so the section can be removed
   from the page without this throwing.
   ========================================================================== */
setText('#md-words', MD.quote);
setText('#md-name', MD.name);
setText('#md-role', MD.role);

/* ==========================================================================
   §5 — AR CAROUSEL
   The site's best feature, given its own room: only pieces that actually
   carry a .glb appear here, so the section can never promise AR it cannot
   deliver. Same gate as the card badge (js/card.js) and the 3D hero.
   ========================================================================== */
const arcLead = document.getElementById('arc-lead');
if (arcLead) {
  arcLead.innerHTML =
    `${cap(word(arCount))} of the ${word(PIECES.length)} pieces carry a 3D model. ` +
    'Open one on an Android phone and it stands on your own floor at full size — ' +
    'look for the <span class="ar-inline">AR</span> mark.';
}

const track = document.getElementById('arc-track');
if (track && AR_PIECES.length) {
  track.textContent = '';                /* clears the JS-off fallback link */

  AR_PIECES.forEach((p) => {
    const li = document.createElement('li');
    /* NOT `.reveal`. The scroll-reveal IntersectionObserver in js/shell.js
       measures against the VIEWPORT, which is the wrong axis for a horizontal
       scroller: slides past the right edge start at opacity 0 and only fade in
       once they are scrolled into view. Measured at 1832px wide — 8 slides, 5
       revealed, 3 permanently invisible until the arrows were clicked. The strip
       therefore read as a short centred group instead of a row running off the
       edge, which is the one cue telling a visitor there is more to swipe to.

       js/cat.js already sets this precedent for grids above the fold. Here the
       track is revealed by scrolling IT, so a page-scroll reveal adds nothing
       and actively hides content. */
    li.className = 'arc-slide';

    const a = document.createElement('a');
    a.href = `piece/${p.id}/`;

    /* Cut-out on paper inside a hairline rectangle: the reference's product
       treatment. The frame is drawn behind the piece, not around the photo,
       so the silhouette breaks the rule at the top — that overlap is the
       whole effect. */
    const frame = document.createElement('div');
    frame.className = 'arc-frame';
    const img = document.createElement('img');
    img.src = `assets/img/${p.id}_cut_512.webp`;
    img.srcset =
      `assets/img/${p.id}_cut_512.webp 512w, assets/img/${p.id}_cut_1024.webp 1024w`;
    img.sizes = '(max-width: 700px) 78vw, 34vw';
    img.alt = p.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 1024;
    img.height = 1024;
    frame.appendChild(img);

    const h3 = document.createElement('h3');
    h3.textContent = p.name;

    const tag = document.createElement('p');
    tag.className = 'arc-tag';
    tag.textContent = p.tagline;

    const meta = document.createElement('p');
    meta.className = 'arc-meta';
    meta.innerHTML = `<span class="ar-inline">AR</span> <span>${p.lead}</span>`;

    a.append(frame, h3, tag, meta);
    li.appendChild(a);
    track.appendChild(li);
  });

  /* ---- Prev / next -------------------------------------------------------
     Scrolls by exactly one slide pitch, measured from the DOM rather than
     assumed, so the buttons stay correct at every breakpoint and gap. The
     track is a real scroll container: wheel, trackpad, touch and keyboard all
     work without these buttons, which is why losing them to a JS error is
     survivable. */
  const step = () => {
    const s = track.children;
    if (s.length < 2) return track.clientWidth;
    return s[1].getBoundingClientRect().left - s[0].getBoundingClientRect().left;
  };

  const prev = document.querySelector('[data-arc="prev"]');
  const next = document.querySelector('[data-arc="next"]');

  /* The arrows tween scrollLeft on rAF instead of calling
     scrollBy({behavior:'smooth'}).

     Measured, not assumed: on this track a NATIVE smooth programmatic scroll
     resolves to the position it started from roughly three clicks out of four —
     scrollBy and scrollTo both, under `mandatory` and `proximity` snap alike,
     while the same call with behavior:'auto' moves every time. Four clicks
     advanced the track once. A rAF tween lands on 376 / 752 / 1128 / 1504
     every time, so the arrows became reliable the moment the animation stopped
     being the browser's job. It is also the same idiom as the rest of the
     site's motion (js/cine.js lerps on rAF; the corridor runs generated
     keyframes) rather than a new one.

     Native snapping is untouched — it still governs wheel, trackpad and touch.
     Only the two buttons animate by hand. */
  let raf = 0;
  const tweenTo = (to) => {
    cancelAnimationFrame(raf);          // a second click retargets, never queues
    const from = track.scrollLeft;
    if (reduced || from === to) { track.scrollLeft = to; sync(); return; }
    /* Snapping stays ON through the tween, deliberately. Suspending it for the
       animation's duration was tried and is worse: restoring scroll-snap-type
       does not make Chrome re-snap, so any rounding left the track resting
       BETWEEN slides (measured: 368, 578, 1493 instead of 376, 752, 1504).
       With snap left on, every landing is exactly a slide edge; the cost is
       that a second click arriving inside the same 420ms can be absorbed by
       the snap engine. Landing wrong is worse than landing late. */
    const t0 = performance.now();
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / 420);
      track.scrollLeft = from + (to - from) * (1 - Math.pow(1 - p, 3));
      if (p < 1) { raf = requestAnimationFrame(frame); return; }
      /* Sync HERE, not only from the scroll listener. The listener fires
         throughout the tween and the browser coalesces those events, so the last
         one it delivered could be an early frame — measured: after one Next
         click the track sat at 376 with Previous still disabled, so a visitor one
         slide in could not go back. Reading the settled position is the only
         reliable moment. */
      raf = 0;
      sync();
    };
    raf = requestAnimationFrame(frame);
  };

  /* The intended index is HELD, not re-derived from scrollLeft on every click.
     Re-deriving read a position the tween (or the snap engine) had not finished
     writing, which is what made roughly one click in three appear to do nothing.

     The last step targets `max` rather than lastIndex * pitch, because the final
     slide's pitch does not reach the end of the scroll range: measured, the track
     rested at 1504 of 1587, so `next` never satisfied `>= max - 2` and never
     disabled, and 83px of the last slide stayed off-screen. */
  let index = 0;
  const lastIndex = () => {
    const pitch = step();
    return pitch > 0 ? Math.ceil((track.scrollWidth - track.clientWidth) / pitch) : 0;
  };
  const go = (dir) => {
    const last = lastIndex();
    index = Math.max(0, Math.min(index + dir, last));
    tweenTo(index >= last ? track.scrollWidth - track.clientWidth : index * step());
  };
  if (prev) prev.addEventListener('click', () => go(-1));
  if (next) next.addEventListener('click', () => go(1));

  function sync() {
    const max = track.scrollWidth - track.clientWidth;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max - 2;
  }
  track.addEventListener('scroll', () => {
    /* Wheel, trackpad and touch move the track without going through go(), so
       the held index has to follow them — but NOT while a tween is writing
       scrollLeft, or the arrows would chase their own animation. */
    if (!raf) {
      const pitch = step();
      if (pitch > 0) index = Math.round(track.scrollLeft / pitch);
      sync();
    }
  }, { passive: true });
  window.addEventListener('resize', sync, { passive: true });
  sync();
}

/* ==========================================================================
   §6 — CATEGORY RAIL
   "All" plus one node per category, each with its live count.
   ========================================================================== */
const rail = document.getElementById('cat-rail');
if (rail) {
  rail.textContent = '';

  const node = (href, name, n) => {
    const a = document.createElement('a');
    a.className = 'rail-node';
    a.href = href;
    a.innerHTML = `<b>${name}</b><i>${String(n).padStart(2, '0')}</i>`;
    return a;
  };

  rail.appendChild(node('collections/', 'All pieces', PIECES.length));
  CATEGORIES.forEach((c) => {
    rail.appendChild(node(`collections/${c.slug}/`, c.name, inCat(c.slug).length));
  });

  /* A single rule slides under whichever node is hovered or focused, instead
     of every node growing its own underline. Position is written as custom
     properties so the movement is one compositor-friendly transform. */
  const ind = document.createElement('span');
  ind.className = 'rail-ind';
  ind.setAttribute('aria-hidden', 'true');
  rail.appendChild(ind);

  const move = (el) => {
    const r = el.getBoundingClientRect();
    const base = rail.getBoundingClientRect();
    rail.style.setProperty('--ind-x', (r.left - base.left + rail.scrollLeft) + 'px');
    rail.style.setProperty('--ind-w', r.width + 'px');
    rail.dataset.ind = 'on';
  };
  rail.querySelectorAll('.rail-node').forEach((a) => {
    a.addEventListener('pointerenter', () => move(a));
    a.addEventListener('focus', () => move(a));
  });
  rail.addEventListener('pointerleave', () => { rail.dataset.ind = 'off'; });
  rail.addEventListener('focusout', () => { rail.dataset.ind = 'off'; });
}

/* ==========================================================================
   §7 — PIECE GRID
   Only the heading is derived; the lead paragraph is static editorial copy and
   lives in the markup where a JS-off visitor can read it.
   ========================================================================== */
setText('#coll-heading', `${cap(word(PIECES.length))} pieces, ${word(CATEGORIES.length)} rooms.`);
/* The corridor's own heading was the last typed count on the homepage — "Eighteen
   pieces. One corridor." would have gone stale the moment a nineteenth was added. */
setText('#corridor-h', `${cap(word(PIECES.length))} pieces. One corridor.`);

const box = document.getElementById('home-pieces');
if (box) {
  /* A deliberate spread: one per room plus the two that photograph best.
     Hand-picked because "first six in the file" is not an editorial decision. */
  const pick = ['carved_wooden_glass_display_showcase', 'majesty_glame_emerald_green_velvet_bed',
    'royal_blue_gold_luxury_sofa_pair', 'royal_gold_carved_dining_chair',
    'minimalist_black_gold_shoe_cabinet', 'minimalist_cream_modular_sectional_sofa'];
  const chosen = pick.map((id) => PIECES.find((x) => x.id === id)).filter(Boolean);
  /* Rebuild on language flip: the cards' prices read the language at render
     time (fromPrice), so the grid re-renders rather than patching each card. */
  const renderPieces = () => {
    if (!chosen.length) return;
    box.textContent = '';
    chosen.forEach((p) => box.appendChild(card(p, '', catLabel(p.cat))));
    box.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  };
  renderPieces();
  document.addEventListener(LANG_EVENT, renderPieces);
}

/* ==========================================================================
   §9 — QUICK ASK
   No backend exists and none is wanted: the workshop quotes on WhatsApp. The
   form's action is the wa.me link itself and the message field is named
   `text`, so submitting it with JS off already opens WhatsApp with the note
   typed in. This handler only enriches that note with the room selection.
   ========================================================================== */
const ask = document.getElementById('ask-form');
if (ask) {
  const room = ask.querySelector('[name="room"]');
  if (room) {
    CATEGORIES.forEach((c) => {
      const o = document.createElement('option');
      o.value = c.name;
      o.textContent = c.name;
      room.appendChild(o);
    });
  }

  ask.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = (ask.querySelector('[name="text"]') || {}).value || '';
    const pickd = room && room.value ? room.value : '';
    const msg = [
      'Hello Heaven Furniture Mart —',
      pickd ? `I'm looking for something for the ${pickd.toLowerCase()}.` : '',
      note.trim(),
    ].filter(Boolean).join(' ');
    window.open(waLink(msg), '_blank', 'noopener');
  });
}

/* ==========================================================================
   GHOST PARALLAX
   The giant background words drift slower than the page. One listener, one
   rAF, transform only — and nothing at all under reduced motion, where the
   words simply sit still.
   ========================================================================== */
if (!reduced) {
  const ghosts = [...document.querySelectorAll('[data-parallax]')];
  if (ghosts.length) {
    let queued = false;
    const paint = () => {
      queued = false;
      const vh = window.innerHeight;
      ghosts.forEach((g) => {
        const r = g.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        /* -1 … 1 across the viewport, times the element's own depth. */
        const t = (r.top + r.height / 2 - vh / 2) / vh;
        const depth = parseFloat(g.dataset.parallax) || 30;
        g.style.setProperty('--ghost-y', (-t * depth).toFixed(1) + 'px');
      });
    };
    addEventListener('scroll', () => {
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }
}
