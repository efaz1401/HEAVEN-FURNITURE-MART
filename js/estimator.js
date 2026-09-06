/* ==========================================================================
   js/estimator.js — Interactive Timber & Budget Quick-Estimator
   Zero-bloat vanilla calculator with 1-click WhatsApp routing & i18n
   ========================================================================== */

import { ESTIMATOR_RATES, WHATSAPP } from '../data/pieces.js';
import { currentLang, t, LANG_EVENT } from '../data/i18n.js';

const ESTIMATOR_LABELS = {
  cat: {
    living: { en: 'Living Room (Sofas & Sectionals)', bn: 'লিভিং রুম (সোফা ও সেকশনাল)', nameBn: 'লিভিং রুম (সোফা ও সেকশনাল)' },
    dining: { en: 'Dining (Tables & Showcases)', bn: 'ডাইনিং (টেবিল ও শোকেস)', nameBn: 'ডাইনিং (টেবিল সেট ও শোকেস)' },
    bedroom: { en: 'Bedroom (Master Beds)', bn: 'বেডরুম (মাস্টার বেড)', nameBn: 'বেডরুম (মাস্টার বেড ও ফ্রেম)' },
    office: { en: 'Office & Study (Executive)', bn: 'অফিস ও স্টাডি (এক্সিকিউটিভ)', nameBn: 'অফিস ও স্টাডি (এক্সিকিউটিভ চেয়ার)' }
  },
  wood: {
    teak: { en: 'Solid Burma Teak', bn: 'খাঁটি বার্মা সেগুন', nameBn: 'খাঁটি বার্মা সেগুন (গ্রেড-এ)' },
    mahogany: { en: 'Seasoned Mahogany', bn: 'সিজনড মেহগনি', nameBn: 'সিজনড মেহগনি' },
    walnut: { en: 'Figured Walnut', bn: 'ফিগারড আখরোট', nameBn: 'ফিগারড আখরোট কাঠ (বার্ল)' },
    marble: { en: 'Italian Marble & Teak', bn: 'মার্বেল ও সেগুন', nameBn: 'ইতালিয়ান মার্বেল ও সেগুন কাঠ' }
  },
  finish: {
    velvet_std: { en: 'Cotton-Backed Velvet', bn: 'কটন-ব্যাকড ভেলভেট', nameBn: 'কটন-ব্যাকড ভেলভেট' },
    velvet_prem: { en: 'Premium Italian Velvet', bn: 'প্রিমিয়াম ভেলভেট', nameBn: 'প্রিমিয়াম ইতালিয়ান ভেলভেট' },
    leather: { en: 'Full-Grain Leather', bn: 'ফুল-গ্রেইন চামড়া', nameBn: 'ইতালিয়ান ফুল-গ্রেইন চামড়া' },
    boucle: { en: 'Imported Bouclé', bn: 'আমদানি করা বুকলে', nameBn: 'আমদানি করা হেভি বুকলে' }
  }
};

export function initEstimator(containerId = 'quick-estimator') {
  const root = document.getElementById(containerId);
  if (!root) return;

  const form = root.querySelector('.est-form');
  const catInputs = root.querySelectorAll('input[name="est-cat"]');
  const woodInputs = root.querySelectorAll('input[name="est-wood"]');
  const finishInputs = root.querySelectorAll('input[name="est-finish"]');
  
  const priceValEl = root.querySelector('.est-price-val');
  const leadValEl = root.querySelector('.est-lead-val');
  const waBtnEl = root.querySelector('.est-wa-btn');

  function round500(n) {
    return Math.round(n / 500) * 500;
  }

  function fmtMoney(num, lang) {
    if (lang === 'bn') {
      return '\u09F3' + num.toLocaleString('bn-BD');
    }
    return '\u09F3' + num.toLocaleString('en-IN');
  }

  function recalculate() {
    const lang = currentLang();
    const isBn = lang === 'bn';

    const selCatId = root.querySelector('input[name="est-cat"]:checked')?.value || 'living';
    const selWoodId = root.querySelector('input[name="est-wood"]:checked')?.value || 'teak';
    const selFinishId = root.querySelector('input[name="est-finish"]:checked')?.value || 'velvet_std';

    const catObj = ESTIMATOR_RATES.categories.find(c => c.id === selCatId) || ESTIMATOR_RATES.categories[0];
    const woodObj = ESTIMATOR_RATES.woods.find(w => w.id === selWoodId) || ESTIMATOR_RATES.woods[0];
    const finishObj = ESTIMATOR_RATES.finishes.find(f => f.id === selFinishId) || ESTIMATOR_RATES.finishes[0];

    const baseCost = (catObj.base * woodObj.mult) + finishObj.add;
    const minPrice = round500(baseCost * 0.92);
    const maxPrice = round500(baseCost * 1.15);

    // Update pill labels
    root.querySelectorAll('input[name^="est-"]').forEach(input => {
      const group = input.name.replace('est-', '');
      const val = input.value;
      const span = input.closest('label')?.querySelector('span');
      if (span && ESTIMATOR_LABELS[group]?.[val]) {
        span.textContent = isBn ? ESTIMATOR_LABELS[group][val].bn : ESTIMATOR_LABELS[group][val].en;
      }
    });

    // Update step titles & descriptions
    const stepTitles = root.querySelectorAll('.est-step-title');
    if (stepTitles[0]) stepTitles[0].textContent = t('est_step1') || (isBn ? '১. আসবাবের ধরন' : '1. Select Category');
    if (stepTitles[1]) stepTitles[1].textContent = t('est_step2') || (isBn ? '২. কাঠের গ্রেড নির্বাচন' : '2. Select Hardwood Grade');
    if (stepTitles[2]) stepTitles[2].textContent = t('est_step3') || (isBn ? '৩. কাপড় বা ফিনিশ' : '3. Select Upholstery & Finish');

    const kicker = root.querySelector('.est-res-kicker');
    if (kicker) kicker.textContent = t('est_from') || (isBn ? 'আনুমানিক বিনিয়োগ পরিসীমা' : 'Estimated Investment Range');

    const leadTitle = root.querySelector('#est-lead-title, .est-lead-box span');
    if (leadTitle) leadTitle.textContent = isBn ? 'তৈরির সময়' : 'Crafting Time';

    const ctaSpan = root.querySelector('.est-wa-btn span');
    if (ctaSpan) ctaSpan.textContent = t('est_cta_wa') || (isBn ? 'এই হিসাবটি হোয়াটসঅ্যাপে পাঠান' : 'Send Estimate on WhatsApp');

    const note = root.querySelector('.est-note');
    if (note) note.textContent = t('est_note') || (isBn ? 'ওয়ার্কশপের সিজনড কাঠের বর্তমান মজুতের ওপর ভিত্তি করে তৈরি হিসাব। কোনো অগ্রিম সাইন-আপের প্রয়োজন নেই।' : 'Transparent estimate based on current timber seasoning stock. No account required.');

    if (priceValEl) {
      priceValEl.textContent = `${fmtMoney(minPrice, lang)} – ${fmtMoney(maxPrice, lang)}`;
    }

    if (leadValEl) {
      leadValEl.textContent = isBn ? `${catObj.lead.replace('weeks', 'সপ্তাহ')}` : catObj.lead;
    }

    if (waBtnEl) {
      const catBn = ESTIMATOR_LABELS.cat[selCatId]?.nameBn || catObj.name;
      const woodBn = ESTIMATOR_LABELS.wood[selWoodId]?.nameBn || woodObj.name;
      const finishBn = ESTIMATOR_LABELS.finish[selFinishId]?.nameBn || finishObj.name;
      const leadBn = catObj.lead.replace('weeks', 'সপ্তাহ');

      const msgEn = `Hello Heaven Furniture Mart! I calculated a quick estimate on your site:%0A`
        + `• Category: ${catObj.name}%0A`
        + `• Hardwood: ${woodObj.name}%0A`
        + `• Finish: ${finishObj.name}%0A`
        + `• Est. Range: BDT ${minPrice.toLocaleString('en-IN')} - ${maxPrice.toLocaleString('en-IN')}%0A`
        + `• Est. Timeline: ${catObj.lead}%0A`
        + `Could you please advise on scheduling a consultation?`;

      const msgBn = `আসসালামু আলাইকুম হেভেন ফার্নিচার মার্ট! আমি ওয়েবসাইটে একটি বাজেট হিসাব করেছি:%0A`
        + `• আসবাব: ${catBn}%0A`
        + `• কাঠ: ${woodBn}%0A`
        + `• ফিনিশ: ${finishBn}%0A`
        + `• আনুমানিক বাজেট: ৳${minPrice.toLocaleString('en-IN')} – ৳${maxPrice.toLocaleString('en-IN')}%0A`
        + `• তৈরির সময়: ${leadBn}%0A`
        + `পরামর্শের জন্য বিস্তারিত জানতে চাই।`;

      const text = isBn ? msgBn : msgEn;
      waBtnEl.href = `https://wa.me/${WHATSAPP}?text=${text}`;
    }
  }

  // Event Listeners
  [...catInputs, ...woodInputs, ...finishInputs].forEach(input => {
    input.addEventListener('change', recalculate);
  });

  window.addEventListener(LANG_EVENT, recalculate);

  // Initial calculation
  recalculate();
}
