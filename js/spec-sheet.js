/* ==========================================================================
   js/spec-sheet.js — Architectural Specification Sheet Generator
   Generates a formal bespoke specification card with 10-Year Warranty stamp,
   dimensions, engineering standards, and 1-click Print/PDF export.
   ========================================================================== */

import { taka, unitPrice, tiersFor, addonsFor } from './pricing.js';
import { WHATSAPP, CRAFT_PILLARS, pick, toBnDigits, catName, tierText, addonLabel, variantLabel, DIM_LABELS_BN } from '../data/pieces.js';
import { currentLang, t } from '../data/i18n.js';
import { printDocument, endPrintDocument } from './print-doc.js';

let modalEl = null;

export function openSpecSheet(piece, config) {
  if (!piece) return;

  const isBn = currentLang() === 'bn';
  const lang = isBn ? 'bn' : 'en';
  const price = unitPrice(piece, config);
  const tiers = tiersFor(piece);
  const activeTier = tiers[config.material] || tiers[0];
  const allAddons = addonsFor(piece);
  const selectedAddons = allAddons.filter(a => config.addons.includes(a.key));

  const pieceName = pick(piece, 'name', lang);
  const cName = catName(piece.cat, lang);
  const leadStr = isBn ? (piece.lead || '').replace('weeks', 'সপ্তাহ').replace('week', 'সপ্তাহ') : piece.lead;
  const tier = tierText(activeTier, lang);
  const vLabel = variantLabel(config.variant, lang);
  const addonsStr = selectedAddons.length
    ? selectedAddons.map(a => addonLabel(a, lang)).join(', ')
    : (isBn ? 'স্ট্যান্ডার্ড ওয়ার্কশপ ডেলিভারি' : 'Standard Workshop Delivery');

  const dimsText = config.dims && config.dims.length && piece.dims && piece.dims.length
    ? config.dims.map((d, i) => {
        const pDim = piece.dims[i];
        const rawLabel = pDim ? pDim[0] : '';
        const label = isBn ? (DIM_LABELS_BN[rawLabel] || rawLabel) : rawLabel;
        const rawUnit = pDim ? pDim[2] || 'cm' : 'cm';
        const unit = isBn ? (rawUnit === 'cm' ? 'সেমি' : rawUnit === 'in' ? 'ইঞ্চি' : rawUnit) : rawUnit;
        const val = isBn ? toBnDigits(Math.round(d)) : Math.round(d);
        return `${val} ${unit}${label ? ` (${label})` : ''}`;
      }).join(' × ')
    : (piece.dims && piece.dims.length
        ? piece.dims.map(d => {
            const rawLabel = d[0];
            const label = isBn ? (DIM_LABELS_BN[rawLabel] || rawLabel) : rawLabel;
            const rawUnit = d[2] || 'cm';
            const unit = isBn ? (rawUnit === 'cm' ? 'সেমি' : rawUnit === 'in' ? 'ইঞ্চি' : rawUnit) : rawUnit;
            const val = isBn ? toBnDigits(d[1]) : d[1];
            return `${val} ${unit} (${label})`;
          }).join(' × ')
        : (isBn ? 'স্ট্যান্ডার্ড আর্কিটেকচারাল প্রোপোরশন' : 'Standard Architectural Proportion'));

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'spec-sheet-modal';
    modalEl.className = 'spec-modal';
    document.body.appendChild(modalEl);
  }

  const dateStr = new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const refCode = `HFM-${piece.id.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  modalEl.innerHTML = `
    <div class="spec-backdrop" data-close-spec></div>
    <div class="spec-dialog" role="dialog" aria-modal="true" aria-labelledby="spec-title">
      <div class="spec-actions-bar no-print">
        <button type="button" class="btn btn--sm btn--primary" id="spec-print-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>${t('spec_sheet_print') || 'Print / Save PDF'}</span>
        </button>
        <button type="button" class="spec-close-btn" data-close-spec aria-label="${t('spec_sheet_close') || 'Close'}">&times;</button>
      </div>

      <div class="spec-document">
        <header class="spec-doc-head">
          <div class="spec-brand-block">
            <span class="spec-brand-kicker">Heaven Furniture Mart · Chattogram</span>
            <h2 id="spec-title" class="spec-doc-title">${t('spec_sheet_title') || 'Architectural Specification'}</h2>
            <p class="spec-doc-sub">${isBn ? 'আগ্রাবাদ এক্সেস রোড ওয়ার্কশপ ও স্টুডিও · সার্টিফাইড উৎপাদন' : 'Agrabad Access Road Workshop & Studio · Certified Production'}</p>
          </div>
          <div class="spec-meta-block">
            <div class="spec-badge-box">
              <span class="spec-ref-label">${isBn ? 'রেফারেন্স কোড' : 'Ref Code'}</span>
              <b class="spec-ref-code">${refCode}</b>
            </div>
            <span class="spec-doc-date">${dateStr}</span>
          </div>
        </header>

        <div class="spec-doc-body">
          <div class="spec-sec-highlight">
            <div class="spec-prop">
              <span class="spec-prop-k">${isBn ? 'আসবাবের নাম' : 'Commission Piece'}</span>
              <b class="spec-prop-v">${pieceName}</b>
            </div>
            <div class="spec-prop">
              <span class="spec-prop-k">${isBn ? 'ক্যাটাগরি / রুম' : 'Category / Space'}</span>
              <span class="spec-prop-v">${cName}</span>
            </div>
            <div class="spec-prop">
              <span class="spec-prop-k">${isBn ? 'তৈরির সময়' : 'Workshop Lead Time'}</span>
              <span class="spec-prop-v">${leadStr}</span>
            </div>
          </div>

          <table class="spec-table-detail">
            <tbody>
              <tr>
                <th>${isBn ? 'পরিমাপ (ডাইমেনশন)' : 'Architectural Dimensions'}</th>
                <td><b>${dimsText}</b></td>
              </tr>
              <tr>
                <th>${isBn ? 'কাঠ ও উপাদানের গ্রেড' : 'Primary Hardwood & Material'}</th>
                <td><b>${tier.name}</b> — <i>${tier.note}</i></td>
              </tr>
              <tr>
                <th>${isBn ? 'রং ও টেক্সচার ফিনিশ' : 'Surface Finish & Variant'}</th>
                <td>${vLabel || (isBn ? 'ন্যাচারাল ওয়ার্কশপ পলিশ' : 'Natural Workshop Polish')}</td>
              </tr>
              <tr>
                <th>${isBn ? 'লজিস্টিকস ও অতিরিক্ত সুবিধা' : 'Selected Add-ons & Logistics'}</th>
                <td>${addonsStr}</td>
              </tr>
              <tr class="spec-row-total">
                <th>${isBn ? 'আনুমানিক প্রাক্কলিত মূল্য' : 'Estimated Unit Investment'}</th>
                <td><span class="spec-price-tag">${taka(price, lang)}</span></td>
              </tr>
            </tbody>
          </table>

          <div class="spec-pillars-row">
            <div class="spec-pillar-badge">
              <b>${isBn ? '৮–১২%' : '8–12%'}</b>
              <span>${isBn ? 'কিলন ময়েশ্চার' : 'Kiln Moisture'}</span>
            </div>
            <div class="spec-pillar-badge">
              <b>${isBn ? '১০ বছর' : '10-Year'}</b>
              <span>${isBn ? 'ফ্রেম ওয়ারেন্টি' : 'Frame Warranty'}</span>
            </div>
            <div class="spec-pillar-badge">
              <b>${isBn ? '১০০%' : '100%'}</b>
              <span>${isBn ? 'খাঁটি কাঠের জোড়া' : 'Pegged Joinery'}</span>
            </div>
            <div class="spec-pillar-badge">
              <b>${isBn ? '৭-স্তর' : '7-Layer'}</b>
              <span>${isBn ? 'ইতালিয়ান ব্যারিয়ার' : 'Italian Barrier'}</span>
            </div>
          </div>

          <footer class="spec-doc-foot">
            <p>${isBn ? 'আমাদের চট্টগ্রামের আগ্রাবাদ এক্সেস রোড ওয়ার্কশপে সিজনড কাঠ থেকে প্রতিটি আসবাব যত্নসহকারে নির্মিত। চূড়ান্ত ডেলিভারির সময় স্বাক্ষরিত স্ট্রাকচারাল গ্যারান্টি সনদ প্রদান করা হয়।' : 'Every piece is individually handcrafted from seasoned hardwood at our Agrabad Access Road workshop in Chattogram. Structural guarantee certificate issued upon final delivery.'}</p>
            <div class="spec-sign-row">
              <div class="spec-sign-box">
                <span class="spec-sign-line"></span>
                <span>${isBn ? 'আবুল কালাম ভূঁইয়া<br><small>ব্যবস্থাপনা পরিচালক</small>' : 'Abul Kalam Bhuiyan<br><small>Managing Director</small>'}</span>
              </div>
              <div class="spec-sign-box">
                <span class="spec-sign-line"></span>
                <span>${isBn ? 'মাস্টার কারিগরের স্বাক্ষর<br><small>কোয়ালিটি কন্ট্রোল সিল</small>' : 'Master Joiner Signature<br><small>Quality Control Seal</small>'}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  `;

  modalEl.removeAttribute('hidden');
  modalEl.classList.add('is-open');
  document.body.classList.add('modal-open');

  const closeHandler = () => {
    modalEl.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    /* If a print was cancelled in a way that skipped `afterprint`, the class
       would otherwise survive the modal and blank the next print. */
    endPrintDocument();
    setTimeout(() => {
      if (!modalEl.classList.contains('is-open')) {
        modalEl.setAttribute('hidden', '');
      }
    }, 300);
  };

  modalEl.querySelectorAll('[data-close-spec]').forEach(el => {
    el.addEventListener('click', closeHandler);
  });

  const printBtn = modalEl.querySelector('#spec-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', printDocument);
  }
}
