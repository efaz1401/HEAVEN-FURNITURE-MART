/* ==========================================================================
   js/cashmemo.js — Professional PDF Cash Memo / Proforma Invoice Generator
   Generates a clean, bespoke, formal Unpaid Cash Memo for Heaven Furniture Mart.
   Includes client details, itemized specifications, unpaid verification status,
   workshop conditions, and one-click PDF download & print.
   ========================================================================== */

import { bySlug, WHATSAPP, pick, toBnDigits } from '../data/pieces.js';
import { unitPrice, lineTotal, cartTotal, specSummary, taka } from './pricing.js';
import { currentLang, t } from '../data/i18n.js';
import { printDocument, endPrintDocument } from './print-doc.js';

let vendorLoading = null;

function getVendorBase() {
  const depth = document.body ? document.body.getAttribute('data-depth') : '1';
  if (depth === '2') return '../../js/vendor/';
  if (depth === '0') return 'js/vendor/';
  return '../js/vendor/';
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function loadPdfDependencies() {
  if (window.jspdf && window.html2canvas) {
    return { jsPDF: window.jspdf.jsPDF, html2canvas: window.html2canvas };
  }
  if (!vendorLoading) {
    vendorLoading = (async () => {
      const base = getVendorBase();
      try {
        await loadScript(base + 'html2canvas.min.js');
        await loadScript(base + 'jspdf.umd.min.js');
      } catch (e) {
        console.warn('Local vendor scripts load failed, falling back to CDN:', e);
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }
      return { jsPDF: window.jspdf.jsPDF, html2canvas: window.html2canvas };
    })();
  }
  return vendorLoading;
}

export function buildCashMemoElement(order) {
  const isBn = currentLang() === 'bn';
  const lang = isBn ? 'bn' : 'en';
  const ref = order.ref || `HFM-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const dateStr = now.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const customer = order.customer || {};
  const custName = customer.name || (isBn ? 'সম্মানিত ক্রেতা' : 'Valued Patron');
  const custPhone = customer.phone || (isBn ? 'ফোনে যোগাযোগ করা হবে' : 'Pending verification');
  const custAddress = customer.address || (isBn ? 'চট্টগ্রাম বা নির্দিষ্ট ঠিকানা' : 'To be confirmed on verification call');
  const custNotes = customer.notes || '';

  const lines = (order.lines || []).map(line => {
    const p = line.piece || bySlug(line.id);
    return p ? { piece: p, config: line.config } : null;
  }).filter(Boolean);

  const total = cartTotal(lines);
  const totalQty = lines.reduce((sum, l) => sum + (l.config.qty || 1), 0);

  const el = document.createElement('div');
  el.className = 'memo-document';
  el.style.width = '794px';
  el.style.margin = '0 auto';
  el.style.padding = '36px 40px';
  el.style.background = '#FFFFFF';
  el.style.color = '#111111';
  el.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  el.style.boxSizing = 'border-box';

  let linesRows = '';
  lines.forEach((l, idx) => {
    const sl = isBn ? toBnDigits(idx + 1) : String(idx + 1).padStart(2, '0');
    const p = l.piece;
    const cfg = l.config;
    const pName = pick(p, 'name', lang);
    const uPrice = unitPrice(p, cfg);
    const lTotal = lineTotal(p, cfg);
    const spec = specSummary(p, cfg, lang);
    const mats = pick(p, 'materials', lang);
    const matsStr = Array.isArray(mats) ? mats.slice(0, 3).join(', ') : (mats || '');
    const leadStr = isBn ? (p.lead || '৬–৮ সপ্তাহ').replace('weeks', 'সপ্তাহ').replace('week', 'সপ্তাহ') : (p.lead || '6–8 weeks');
    const isEven = idx % 2 === 1;

    linesRows += `
      <tr style="border-bottom: 1px solid #E8E5E0; background: ${isEven ? '#FAFAFA' : '#FFFFFF'};">
        <td style="padding: 11px 8px; text-align: center; vertical-align: top; font-weight: 600; color: #666; font-size: 11px;">${sl}</td>
        <td style="padding: 11px 12px; vertical-align: top;">
          <strong style="font-size: 12.5px; color: #111; letter-spacing: 0.2px;">${pName}</strong>
          <div style="color: #555; font-size: 10.5px; margin-top: 3px; line-height: 1.45;">
            &bull; <strong>${isBn ? 'স্পেসিফিকেশন' : 'Specification'}:</strong> ${spec}<br>
            &bull; <strong>${isBn ? 'উপাদান' : 'Materials'}:</strong> ${matsStr}
          </div>
        </td>
        <td style="padding: 11px 8px; text-align: center; vertical-align: top; color: #666; font-size: 10.5px;">${leadStr}</td>
        <td style="padding: 11px 8px; text-align: center; vertical-align: top; font-weight: 700; font-size: 12px;">${isBn ? toBnDigits(cfg.qty || 1) : (cfg.qty || 1)}</td>
        <td style="padding: 11px 10px; text-align: right; vertical-align: top; color: #333; font-size: 11px;">${taka(uPrice, lang)}</td>
        <td style="padding: 11px 12px; text-align: right; vertical-align: top; font-weight: 700; color: #111; font-size: 11.5px;">${taka(lTotal, lang)}</td>
      </tr>
    `;
  });

  el.innerHTML = `
    <div style="border-bottom: 2px solid #8E1F2B; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
          <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true" style="flex:none;"><g fill="#111111"><rect x="10" y="12" width="3" height="40"/><rect x="34" y="12" width="3" height="40"/><rect x="10" y="30" width="37" height="3"/></g><rect x="41" y="26" width="3" height="11" fill="#8E1F2B"/></svg>
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #111; font-family: 'Cinzel', Georgia, serif;">HEAVEN FURNITURE MART</h1>
            <p style="margin: 2px 0 0; font-size: 9.5px; color: #8E1F2B; letter-spacing: 1.8px; text-transform: uppercase; font-weight: 700;">${isBn ? 'কাস্টম ও ক্লাসিক্যাল আসবাব তৈরির মাস্টার কারিগর' : 'Bespoke Heritage & Classical Furniture Craftsmen'}</p>
          </div>
        </div>
        <p style="margin: 7px 0 0 38px; font-size: 10.5px; color: #555; line-height: 1.45;">
          <strong>${isBn ? 'শো-রুম ও ওয়ার্কশপ' : 'Showroom & Workshop'}:</strong> 218/A CDA Avenue, East Nasirabad, GEC Circle, Chattogram - 4000<br>
          <strong>${isBn ? 'হটলাইন' : 'Hotline'}:</strong> +880 1960-481983 &bull; <strong>${isBn ? 'ইমেইল' : 'Email'}:</strong> heavenfurnituremart@gmail.com &bull; <strong>${isBn ? 'ওয়েব' : 'Web'}:</strong> heavenfurnituremart.com
        </p>
      </div>
      <div style="text-align: right; min-width: 220px;">
        <div style="display: inline-block; padding: 5px 12px; background: #FFF1F0; border: 1.5px solid #FF4D4F; color: #CF1322; font-weight: 800; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; border-radius: 4px; margin-bottom: 8px;">
          &#x25CF; ${isBn ? 'অশোধিত ক্যাশ মেমো' : 'UNPAID CASH MEMO'}
        </div>
        <p style="margin: 0; font-size: 11px; color: #555;">${isBn ? 'অর্ডার রেফারেন্স' : 'Order Ref'}: <strong style="color: #111; font-family: monospace; font-size: 12px;">${ref}</strong></p>
        <p style="margin: 3px 0 0; font-size: 10.5px; color: #555;">${isBn ? 'তারিখ' : 'Date'}: <strong>${dateStr}</strong></p>
        <p style="margin: 2px 0 0; font-size: 10px; color: #777;">${isBn ? 'ইস্যুর সময়' : 'Issued At'}: <strong>${timeStr}</strong></p>
      </div>
    </div>

    <div style="background: #FAF9F7; border: 1px solid #EADBCE; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between;">
      <div style="max-width: 56%;">
        <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 700; color: #8E1F2B; display: block; margin-bottom: 3px;">${isBn ? 'গ্রাহক ও ডেলিভারি বিবরণ' : 'CLIENT / DELIVERY INFORMATION'}</span>
        <strong style="font-size: 13.5px; color: #111; display: block; margin-bottom: 2px;">${custName}</strong>
        <span style="font-size: 11px; color: #444; display: block;"><strong>${isBn ? 'মোবাইল' : 'Mobile'}:</strong> ${custPhone}</span>
        <span style="font-size: 11px; color: #444; display: block;"><strong>${isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}:</strong> ${custAddress}</span>
        ${custNotes ? `<span style="font-size: 10.5px; color: #666; display: block; margin-top: 3px;"><strong>${isBn ? 'বিশেষ নির্দেশনা' : 'Special Notes'}:</strong> ${custNotes}</span>` : ''}
      </div>
      <div style="text-align: right; max-width: 40%; border-left: 1px dashed #D6C8B8; padding-left: 16px;">
        <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 700; color: #8E1F2B; display: block; margin-bottom: 3px;">${isBn ? 'পেমেন্ট ও ভেরিফিকেশন স্ট্যাটাস' : 'PAYMENT & VERIFICATION STATUS'}</span>
        <div style="color: #CF1322; font-weight: 700; font-size: 12px; margin-bottom: 3px;">${isBn ? 'অননুমোদিত / প্রাথমিক প্রাক্কলন' : 'UNPAID / ESTIMATE'}</div>
        <p style="margin: 0; font-size: 10px; color: #666; line-height: 1.35;">
          ${isBn ? 'অনলাইনে কোনো প্রকার অর্থ লেনদেন হয়নি।<br><strong>পেমেন্ট কিস্তি:</strong> ড্রয়িং অনুমোদনে ৫০% অগ্রিম; ডেলিভারি ও পরিদর্শনের পর অবশিষ্ট ৫০% পরিশোধযোগ্য।' : 'Zero monetary exchange occurred online.<br><strong>Payment Schedule:</strong> 50% deposit upon workshop drawing sign-off; 50% balance upon delivery &amp; inspection.'}
        </p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 11px;">
      <thead>
        <tr style="background: #1A1A1A; color: #FAF7F2; border: 1px solid #1A1A1A;">
          <th style="padding: 8px 8px; text-align: center; font-weight: 600; width: 32px;">${isBn ? 'ক্রমিক' : 'SL'}</th>
          <th style="padding: 8px 12px; text-align: left; font-weight: 600;">${isBn ? 'আসবাবের বিবরণ ও কাস্টম স্পেসিফিকেশন' : 'Item Description & Custom Specification'}</th>
          <th style="padding: 8px 8px; text-align: center; font-weight: 600; width: 68px;">${isBn ? 'তৈরির সময়' : 'Lead Time'}</th>
          <th style="padding: 8px 8px; text-align: center; font-weight: 600; width: 40px;">${isBn ? 'পরিমাণ' : 'Qty'}</th>
          <th style="padding: 8px 10px; text-align: right; font-weight: 600; width: 95px;">${isBn ? 'একক দর' : 'Unit Rate'}</th>
          <th style="padding: 8px 12px; text-align: right; font-weight: 600; width: 105px;">${isBn ? 'মোট টাকা' : 'Amount (BDT)'}</th>
        </tr>
      </thead>
      <tbody>
        ${linesRows}
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px;">
      <div style="width: 48%; background: #FAF9F7; border: 1px solid #EADBCE; border-radius: 6px; padding: 12px 14px;">
        <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #8E1F2B; display: block; margin-bottom: 4px;">${isBn ? 'কমিশনের মূল বিবরণ' : 'COMMISSION HIGHLIGHTS'}</span>
        <p style="margin: 0; font-size: 10.5px; color: #444; line-height: 1.5;">
          ${isBn
            ? `মোট আসবাব: <strong>${toBnDigits(totalQty)}</strong>টি &bull; নকশা: <strong>${toBnDigits(lines.length)}</strong>টি<br>আনুমানিক প্রস্তুতকাল: <strong>৬–১০ সপ্তাহ</strong><br>ডেলিভারির এলাকা: <strong>${custAddress.includes('Chattogram') || custAddress.includes('চট্টগ্রাম') ? 'চট্টগ্রাম মহানগরী' : 'আন্তঃজেলা ডেলিভারি'}</strong>`
            : `Total Commission Pieces: <strong>${totalQty}</strong> &bull; Designs: <strong>${lines.length}</strong><br>Estimated Production Window: <strong>6–10 weeks</strong><br>Delivery Location: <strong>${custAddress.includes('Chattogram') || custAddress.includes('চট্টগ্রাম') ? 'Chattogram Metropolitan Area' : 'Inter-District Dispatch'}</strong>`
          }
        </p>
      </div>

      <div style="width: 46%;">
        <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 6px; color: #666;">${isBn ? 'সাবটোটাল' : 'Subtotal Amount'}:</td>
            <td style="padding: 4px 6px; text-align: right; font-weight: 600;">${taka(total, lang)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 6px; color: #666;">${isBn ? 'হোয়াইট গ্লোভ ডেলিভারি ও সেটআপ' : 'White Glove Delivery & Setup'}:</td>
            <td style="padding: 4px 6px; text-align: right; color: #237804; font-weight: 600;">${isBn ? 'বিনামূল্যে (চট্টগ্রাম)' : 'Complimentary (CTG)'}</td>
          </tr>
          <tr style="border-top: 1.5px solid #111; border-bottom: 1.5px solid #111; font-size: 13px; background: #FFFDF9;">
            <td style="padding: 6px 6px; font-weight: 700; color: #111;">${isBn ? 'সর্বমোট আনুমানিক মূল্য' : 'Estimated Grand Total'}:</td>
            <td style="padding: 6px 6px; text-align: right; font-weight: 800; color: #8E1F2B;">${taka(total, lang)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 6px; color: #777;">${isBn ? 'অনলাইনে পরিশোধিত' : 'Paid Online'}:</td>
            <td style="padding: 4px 6px; text-align: right; color: #777;">৳ 0.00</td>
          </tr>
          <tr style="font-weight: 800; color: #CF1322; font-size: 12px; background: #FFF1F0; border: 1px solid #FFA39E;">
            <td style="padding: 6px 6px;">${isBn ? 'চূড়ান্ত অনুমোদনে প্রদেয়' : 'Net Due on Confirmation'}:</td>
            <td style="padding: 6px 6px; text-align: right;">${taka(total, lang)} (${isBn ? 'বাকি' : 'UNPAID'})</td>
          </tr>
        </table>
      </div>
    </div>

    <div style="border-top: 1px solid #D6D0C5; padding-top: 12px; font-size: 9.5px; color: #666; line-height: 1.45;">
      <strong style="color: #222; text-transform: uppercase; letter-spacing: 0.8px;">${isBn ? 'কাস্টম আসবাব নির্মাণের শর্তাবলী' : 'Terms & Conditions of Custom Joinery'}:</strong><br>
      ${isBn
        ? `১. <strong>অশোধিত প্রোফরমা মেমো:</strong> এটি প্রাথমিক প্রাক্কলন ও চাহিদা সংক্রান্ত আনুষ্ঠানিক রেকর্ড। কোনো অনলাইন পেমেন্ট সংগৃহীত হয়নি।<br>
           ২. <strong>পরিমাপ ও স্থান পরিদর্শন:</strong> প্রতিটি বাড়ির সিঁড়ি, প্রবেশদ্বার ও কক্ষের মাপ স্বতন্ত্র হওয়ায় কাঠ কাটার পূর্বে আমাদের সিনিয়র কারিগর সরাসরি মাপ নেবেন।<br>
           ৩. <strong>পেমেন্ট শিডিউল:</strong> ওয়ার্কশপ ড্রয়িং চূড়ান্ত অনুমোদনের পর ৫০% অগ্রিম এবং ডেলিভারি ও ইন্সটলেশনের পর বাকি ৫০% পরিশোধযোগ্য।<br>
           ৪. <strong>মাস্টার গ্যারান্টি:</strong> মেহগনি ও বার্মা সেগুন কাঠ সম্পূর্ণ সিজনিং ও কিলন-ড্রাইডকৃত, যা আমাদের ১০ বছরের স্ট্রাকচারাল গ্যারান্টি দ্বারা সুরক্ষিত।`
        : `1. <strong>Unpaid Proforma Memo:</strong> This document is an initial commercial quotation and order record. No digital payment has been authorized or collected through the software.<br>
           2. <strong>Dimension & Access Survey:</strong> Because every home in Chattogram has unique stairways, door clearances, and ceiling heights, our master craftsman conducts a physical measurement check before cutting hardwood.<br>
           3. <strong>Payment Schedule:</strong> 50% deposit upon formal workshop drawing sign-off; 50% final balance upon installation and client satisfaction.<br>
           4. <strong>Master Guarantee:</strong> Solid mahogany and Burmese teak timbers are 100% seasoned and kiln-dried, protected by our Lifetime Structural & Joinery Guarantee.`
      }
    </div>

    <div style="margin-top: 32px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 8px;">
      <div style="width: 190px; text-align: center;">
        <div style="border-bottom: 1px solid #888; height: 30px; margin-bottom: 5px;"></div>
        <span style="font-size: 10px; color: #444; font-weight: 600;">${isBn ? 'ক্রেতার স্বাক্ষর' : 'Customer Signature'}</span><br>
        <span style="font-size: 8.5px; color: #888;">${isBn ? 'তারিখ' : 'Date'}: ________________________</span>
      </div>

      <div style="text-align: center;">
        <div style="display: inline-block; padding: 5px 12px; border: 1.5px dashed #8E1F2B; border-radius: 50%; width: 64px; height: 64px; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 0 auto 4px; color: #8E1F2B; font-size: 7.5px; font-weight: 700; text-transform: uppercase; line-height: 1.1;">
          HEAVEN<br>FURNITURE<br>MART<br><span style="font-size: 6.5px; color: #555;">SEAL</span>
        </div>
      </div>

      <div style="width: 210px; text-align: center;">
        <div style="border-bottom: 1px solid #888; height: 30px; margin-bottom: 5px;"></div>
        <span style="font-size: 10px; color: #444; font-weight: 600;">${isBn ? 'অনুমোদিত ওয়ার্কশপ স্বাক্ষরকারী' : 'Authorized Workshop Signatory'}</span><br>
        <span style="font-size: 8.5px; color: #888;">Heaven Furniture Mart &bull; CDA Ave</span>
      </div>
    </div>
  `;

  return el;
}

export async function downloadCashMemoPdf(order, triggerBtn) {
  let originalText = '';
  if (triggerBtn) {
    originalText = triggerBtn.innerHTML;
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = `
      <svg class="spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <span>${t('memo_generating') || 'Generating PDF...'}</span>
    `;
  }

  try {
    const { jsPDF, html2canvas } = await loadPdfDependencies();
    const memoDom = buildCashMemoElement(order);

    memoDom.style.position = 'fixed';
    memoDom.style.left = '-9999px';
    memoDom.style.top = '0';
    document.body.appendChild(memoDom);

    // Strip one-time cssGo handler attributes from head links before cloning
    document.querySelectorAll('link[onload]').forEach(l => {
      l.removeAttribute('onload');
      l.removeAttribute('onerror');
    });

    const canvas = await html2canvas(memoDom, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF'
    });

    memoDom.remove();

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    const safeRef = (order.ref || 'PROFORMA').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Heaven-Furniture-Mart-CashMemo-${safeRef}.pdf`;
    pdf.save(filename);

  } catch (err) {
    console.error('Failed to generate Cash Memo PDF:', err);
    alert('Unable to generate PDF directly. Opening printable memo view instead.');
    openCashMemoModal(order);
  } finally {
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = originalText;
    }
  }
}

let modalContainer = null;

export function openCashMemoModal(order) {
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'memo-modal';
    modalContainer.className = 'memo-modal';
    document.body.appendChild(modalContainer);
  }

  const isBn = currentLang() === 'bn';
  const memoEl = buildCashMemoElement(order);

  modalContainer.innerHTML = `
    <div class="memo-backdrop" data-close-memo></div>
    <div class="memo-dialog" role="dialog" aria-modal="true" aria-label="Cash Memo">
      <div class="memo-actions-bar no-print">
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <button type="button" class="btn btn--sm" id="modal-download-pdf-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            <span>${t('memo_btn_download') || 'Download PDF'}</span>
          </button>
          <button type="button" class="btn btn--sm btn--ghost" id="modal-print-memo-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>${isBn ? 'প্রিন্ট করুন' : 'Print Memo'}</span>
          </button>
        </div>
        <button type="button" class="memo-close-btn" data-close-memo aria-label="Close">&times;</button>
      </div>
      <div class="memo-content-wrapper">
      </div>
    </div>
  `;

  modalContainer.querySelector('.memo-content-wrapper').appendChild(memoEl);
  modalContainer.classList.add('is-open');

  const closeMemo = () => {
    modalContainer.classList.remove('is-open');
    /* Clear the print scoping class with the modal: left set, it would blank
       the next print on this page. See js/print-doc.js. */
    endPrintDocument();
  };

  modalContainer.querySelectorAll('[data-close-memo]').forEach(b => {
    b.addEventListener('click', closeMemo);
  });

  const dlBtn = modalContainer.querySelector('#modal-download-pdf-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => downloadCashMemoPdf(order, dlBtn));
  }

  const prBtn = modalContainer.querySelector('#modal-print-memo-btn');
  if (prBtn) {
    prBtn.addEventListener('click', printDocument);
  }

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeMemo();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}
