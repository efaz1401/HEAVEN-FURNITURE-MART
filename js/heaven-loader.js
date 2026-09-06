/* ==========================================================================
   js/heaven-loader.js — the HEAVEN progress overlay, shared.

   WHY THIS EXISTS. The first-visit loading screen on the homepage and the
   "loading the 3D model" state on a piece page are the same problem: a wait the
   user did not ask for, long enough that a blank or static frame reads as broken.
   The homepage already had a good answer — the sheened HEAVEN wordmark over a
   hairline progress bar. This module is that answer, extracted, so the piece
   pages get it without a second copy of the animation drifting out of step.

   WHAT IT DOES NOT DO. It does not build the homepage overlay. That markup is
   static in index.html on purpose: it has to paint before any module executes,
   which is the whole point of a loading screen. attachHeavenLoader() binds to
   markup that already exists; createStageLoader() builds markup for the 3D case,
   where there is nothing to paint early because the user has not clicked yet.

   PROGRESS IS MONOTONIC. set() never moves the bar backwards. A bar that
   retreats reads as a failure even when it isn't, and both callers feed it from
   more than one source (fonts + image; library + model bytes).

   FAILS OPEN. Every caller gets done() and fail(); neither can throw. The
   overlay is removed on both paths, because an overlay that outlives its reason
   is worse than no overlay.
   ========================================================================== */

import { currentLang, t } from '../data/i18n.js';

/* Default status copy, in the same three bands the homepage always used.
   Callers may override; the 3D case does, because "Crafting Sanctuary" is the
   right voice for a first visit and the wrong one for a model download. */
const DEFAULT_LABELS = {
  early: () => (currentLang() === 'bn' ? t('loader_early') || 'সংগ্রহ প্রস্তুত হচ্ছে' : 'Crafting Sanctuary'),
  mid: () => (currentLang() === 'bn' ? t('loader_mid') || 'গ্যালারি সাজানো হচ্ছে' : 'Preparing Gallery'),
  late: () => (currentLang() === 'bn' ? t('loader_late') || 'প্রস্তুত' : 'Sanctuary Ready'),
};

/** Bengali digits when the page is in Bengali — a percentage is a number too. */
function pctText(fraction) {
  const n = Math.round(fraction * 100);
  const s = currentLang() === 'bn' ? n.toLocaleString('bn-BD') : String(n);
  return s + '%';
}

/**
 * Binds progress control to an existing `.loader-*` subtree.
 * @param {Element} root element containing .loader-progress / .loader-pct / .loader-status
 * @param {{labels?: object}} [opts]
 * @returns {{set: (n:number)=>void, value: ()=>number, root: Element}}
 */
export function attachHeavenLoader(root, opts = {}) {
  const labels = { ...DEFAULT_LABELS, ...(opts.labels || {}) };
  const bar = root ? root.querySelector('.loader-progress') : null;
  const pct = root ? root.querySelector('.loader-pct') : null;
  const status = root ? root.querySelector('.loader-status') : null;

  let progress = 0;
  const set = (v) => {
    if (!Number.isFinite(v)) return;
    progress = Math.max(progress, Math.min(1, v));
    if (bar) bar.style.setProperty('--p', progress.toFixed(3));
    if (pct) pct.textContent = pctText(progress);
    if (status) {
      const band = progress < 0.45 ? 'early' : progress < 0.85 ? 'mid' : 'late';
      const label = labels[band];
      status.textContent = typeof label === 'function' ? label() : String(label);
    }
  };

  return { set, value: () => progress, root };
}

/* SVG-free: the wordmark is six spans so the existing per-character sheen
   animation in css/experience.css applies with no new CSS. */
function brandMarkup(word) {
  return [...word].map((ch) => `<span class="char"><span class="sheen-text">${ch}</span></span>`).join('');
}

/**
 * Builds a stage-scoped HEAVEN overlay and returns progress control plus exits.
 * Used by the 3D viewer, where the wait starts on a click.
 *
 * @param {Element} mount element the overlay is positioned inside (needs a
 *        non-static position; `.stage` already has one)
 * @param {{sub?: string, labels?: object}} [opts]
 */
export function createStageLoader(mount, opts = {}) {
  if (!mount) return null;

  const el = document.createElement('div');
  el.className = 'stage-loader';
  /* aria-hidden with a sibling live region would double-announce. The status
     text is the live region, and it carries the percentage as well. */
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `
    <div class="loader-inner">
      <div class="loader-brand" aria-hidden="true">${brandMarkup('HEAVEN')}</div>
      <div class="loader-sub">${opts.sub || ''}</div>
      <div class="loader-bar-wrap">
        <div class="loader-bar"><i class="loader-progress"></i></div>
        <div class="loader-meta">
          <span class="loader-status"></span>
          <span class="loader-pct">0%</span>
        </div>
      </div>
    </div>`;
  mount.appendChild(el);

  const ctl = attachHeavenLoader(el, opts);
  ctl.set(0.02);           // a visible sliver immediately: 0% reads as stalled

  let gone = false;
  const remove = () => {
    if (gone) return;
    gone = true;
    el.classList.add('is-done');
    /* Matches the --dur-xl exit in css/experience.css. setTimeout rather than
       transitionend because a display:none ancestor fires no transition and the
       overlay would then never be removed. */
    setTimeout(() => { if (el.parentNode) el.remove(); }, 700);
  };

  return {
    el,
    set: ctl.set,
    value: ctl.value,
    /** Runs the bar to 100% so the fill is seen, then lifts the overlay. */
    done: () => { ctl.set(1); setTimeout(remove, 260); },
    /** Give up: show why, then lift. The caller still owns the fallback copy. */
    fail: (msg) => {
      const status = el.querySelector('.loader-status');
      if (status && msg) status.textContent = msg;
      setTimeout(remove, msg ? 1400 : 0);
    },
    destroy: remove,
  };
}
