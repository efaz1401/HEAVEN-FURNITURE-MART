/* ==========================================================================
   Heaven Furniture Mart — shared shell: nav, menu, reveals, room count.
   Loaded on every page. Deliberately small and failure-tolerant: if anything
   here throws, the page content stays fully visible and readable.
   ========================================================================== */

/* ---- No mobile menu lives here ------------------------------------------
   There used to be an initMenu() in this slot, driving #menu-btn / #menu. It
   was unreachable: the re-skin deleted that markup along with its CSS (see the
   note at css/base.css:358), and grep confirms neither id appears in any of
   the 33 HTML files, so the function returned on its first line forever.

   Removed rather than kept, because it read exactly like the thing a future
   editor would go looking for: anyone debugging the small-screen menu would
   land on a plausible, intact, never-called implementation and lose an hour to
   it. The real component is the overlay menu — #dots-btn, .ovmenu, and
   js/menu.js, which owns the scramble, the pointer scrub and the per-item
   parallax. Small screens get the same overlay, plus the floating quote pill.
   Nothing on this page needs a third menu. ------------------------------- */

/* ---- Scroll reveal -------------------------------------------------------
   Fails OPEN: the .reveal-on class is only added once JS is running, so
   content is never hidden by a script that didn't load.

   Idempotent, because the call site below hooks two events and either may fire
   first. A call that finds nothing to observe deliberately does NOT latch, so a
   later call can still pick up cards that were built after it. ------------- */
let revealsReady = false;
function initReveals() {
  if (revealsReady) return;
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;          // too early — leave the latch open and retry
  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) { revealsReady = true; return; }

  revealsReady = true;
  document.documentElement.classList.add('reveal-on');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  els.forEach((el) => io.observe(el));

  // Safety net: if anything is still unrevealed after 4s, show it.
  setTimeout(() => els.forEach((el) => el.classList.add('in')), 4000);
}

/* ---- The cart badge -----------------------------------------------------
   The store itself moved to js/order.js when cart lines gained a configuration
   (dimensions, material tier, add-ons) — a genuinely different shape from the
   old { id, variant, qty } board, and one that the pricing model has to be able
   to read. js/order.js migrates the old `hfm-room-v1` key on first read, so an
   abandoned board becomes a cart at standard specification.

   Only the BADGE is wired here, because shell.js is the one module that loads on
   every page and therefore the only place that can paint chrome injected by
   js/chrome.js. The re-export keeps `import { paintCartCount } from './shell.js'`
   working for anything that already reaches for the shell. */
export { paintCartCount, readCart, cartCount } from './order.js';
import { paintCartCount } from './order.js';
import { currentLang, setLang, LANG_EVENT, t } from '../data/i18n.js';

/* ---- Docked <-> floating bar ---------------------------------------------
   The header is DOCKED at page top and becomes the floating glass pill after
   ~24px of scroll. rAF-throttled; the reduced-motion path is handled purely
   by CSS (transitions off).

   The re-skin added a THIRD state — transparent over the dark hero — with no
   JS at all: it is the CSS default under body[data-nav="over-dark"], so a
   no-JS visit still gets a correct at-rest bar.

   THE FOURTH STATE IS WHAT THIS FUNCTION GREW FOR. The floating pill is LIGHT
   liquid glass, and light glass needs light behind it: 55% white over the
   #111219 hero composites to a dead rgb(148,148,152), which photographs as a
   flat grey slab rather than glass. So the pill now also tracks WHAT IT IS
   FLOATING OVER and swaps to dark glass across the dark bands.

   `body[data-nav="over-dark"]` cannot do this job — it is a static page-level
   attribute, and the homepage runs dark → light → red → dark as you scroll.
   This has to be measured per frame.

   Cost: one getBoundingClientRect per dark band per frame, and only while the
   page is scrolling. The homepage has four (hero, meta strip, corridor,
   footer); every other page has one. Both classes fail OPEN — with JS dead the
   bar never floats in the first place, so there is nothing to mismatch. */
function initDockState() {
  const head = document.querySelector('.pill-head');
  if (!head) return;

  /* .site-foot is dark (--ink-2) but is not a .section-dark, so it is named
     explicitly — the pill floats over it at the bottom of every page. */
  const darkBands = [...document.querySelectorAll('.section-dark, .site-foot')];

  /* A FIXED probe line, deliberately not the pill's own measured centre.

     Measuring the pill was tried first and is wrong: .pill-head transitions
     `top` and `padding` over 400ms (css/nav.css), and this function reads the
     rect in the same frame it adds .is-floating — so the measurement lands
     mid-transition, on the docked geometry, not the floating geometry.
     Reproduced at the bottom of the homepage: the pill's settled centre is
     y=47.2 and the footer starts at y=44.3 (a hit), but the mid-transition read
     put the probe near y=36 (a miss), so the bar stayed light glass over a dark
     footer and no further scroll event ever arrived to correct it.

     46px is inside the floating pill at every breakpoint — it spans 15–73px
     below 900px wide (--dock-h 64 + 12px padding) and 15–79px above — and the
     section rects it is tested against are not animating, so the whole check is
     deterministic. */
  const PROBE_Y = 46;

  const apply = () => {
    const floating = window.scrollY > 24;
    head.classList.toggle('is-floating', floating);
    if (!floating) { head.classList.remove('on-dark'); return; }

    const overDark = darkBands.some((el) => {
      const b = el.getBoundingClientRect();
      return b.top <= PROBE_Y && b.bottom >= PROBE_Y;
    });
    head.classList.toggle('on-dark', overDark);
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { apply(); ticking = false; });
  }, { passive: true });
  /* Sections move under the bar on resize too (the corridor is 70vh, the hero
     is sized in svh), so a resize can change which band the pill sits over
     without any scrolling at all. */
  window.addEventListener('resize', apply, { passive: true });
  apply();
}

/* ---- Mark the current nav item ------------------------------------------ */
function markCurrent() {
  const here = location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('.pill-nav a, .ovlist a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    const target = new URL(href, location.href).pathname.replace(/index\.html$/, '');
    if (target === here) a.setAttribute('aria-current', 'page');
  });
}

/* ---- Footer year -------------------------------------------------------- */
function initYear() {
  const isBn = currentLang() === 'bn';
  const y = new Date().getFullYear();
  const yStr = isBn ? y.toLocaleString('bn-BD').replace(/,/g, '') : String(y);
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = yStr;
  });
}

/**
 * Traverses elements with data-i18n and data-i18n-aria and updates their
 * textContent (or placeholder for form inputs) and aria-label from data/i18n.js.
 */
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (!val) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else if (val.includes('<br>') || val.includes('<strong>') || val.includes('<em>')) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  });

  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    const val = t(key);
    if (val) el.setAttribute('aria-label', val);
  });
}

/* ---- Bilingual Language Switcher (EN / বাংলা) -------------------------- */
function initLang() {
  const syncLangUI = () => {
    const isBn = currentLang() === 'bn';
    document.documentElement.lang = isBn ? 'bn' : 'en';

    document.querySelectorAll('#lang-btn').forEach((btn) => {
      btn.textContent = isBn ? 'English' : 'বাংলা';
      btn.setAttribute('aria-label', isBn ? 'Switch to English' : 'বাংলায় দেখুন');
    });

    document.querySelectorAll('#ov-lang-btn').forEach((btn) => {
      const ovi = btn.querySelector('.ovi') || btn;
      ovi.textContent = isBn ? 'English' : 'বাংলা';
      btn.setAttribute('aria-label', isBn ? 'Switch to English' : 'বাংলায় দেখুন');
    });

    const plinks = document.querySelectorAll('.plink a');
    if (plinks.length >= 5) {
      plinks[0].textContent = t('nav_collections');
      plinks[1].textContent = t('nav_bespoke');
      plinks[2].textContent = t('nav_materials');
      plinks[3].textContent = t('nav_showroom');
      plinks[4].textContent = t('nav_about');
    }

    const ovis = document.querySelectorAll('.ovlist a .ovi');
    if (ovis.length >= 6) {
      ovis[0].textContent = t('nav_collections');
      ovis[1].textContent = t('nav_bespoke');
      ovis[2].textContent = t('nav_materials');
      ovis[3].textContent = t('nav_showroom');
      ovis[4].textContent = t('nav_about');
      ovis[5].textContent = t('nav_contact');
    }

    const cta = document.querySelector('.pill-cta');
    if (cta) {
      const svg = cta.querySelector('svg');
      if (svg) {
        cta.innerHTML = `${svg.outerHTML} ${t('nav_ar')}`;
      }
    }

    initYear();
    applyI18n();
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('#lang-btn, #ov-lang-btn');
    if (b) {
      const next = currentLang() === 'bn' ? 'en' : 'bn';
      setLang(next);
      syncLangUI();
    }
  });

  document.addEventListener(LANG_EVENT, syncLangUI);
  syncLangUI();
}

initDockState();
markCurrent();
initYear();
paintCartCount();
initLang();

/* initReveals is the one initialiser that must wait.
   Module scripts are deferred and run in order, so this file evaluates BEFORE
   js/home.js and js/piece-fill.js have built their cards — and it queries
   .reveal once, at call time. Called inline it observes nothing on the homepage
   (every card there is now generated from data/pieces.js) and skips adding
   .reveal-on entirely, which silently switches the whole scroll-reveal system
   off. Still fails open: if this never runs, .reveal-on is absent and nothing
   is hidden.

   DO NOT test for readyState === 'loading' here. That reads as the obvious
   "still parsing?" check and is never true inside a module script: the spec
   sets document readiness to "interactive" BEFORE running deferred scripts and
   only fires DOMContentLoaded after them, so a 'loading' test takes the
   run-now branch every time. Measured on this page — one
   querySelectorAll('.reveal'), at readyState "interactive", returning 0, and no
   DOMContentLoaded listener registered at all.

   Both events are hooked because this file has two callers with opposite
   timing: the homepage's static <script type="module"> evaluates before
   DOMContentLoaded (that listener wins), while chrome.js's dynamic import on
   every other page may resolve AFTER it, in which case DOMContentLoaded is
   already gone and `load` is the only signal left. initReveals is idempotent,
   so being called twice costs nothing. */
if (document.readyState === 'complete') {
  initReveals();
} else {
  document.addEventListener('DOMContentLoaded', initReveals, { once: true });
  window.addEventListener('load', initReveals, { once: true });
}
