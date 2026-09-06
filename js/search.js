/* ==========================================================================
   Piece search — the reference bar's magnifier, wired to data/pieces.js.

   Entirely client-side: 18 records is far too small to justify a request, and
   the whole catalogue is already a module. Nothing is fetched until the user
   actually opens search, so the 32 pages that never use it pay nothing.

   Deliberately NOT a fuzzy matcher. With 18 items, plain case-insensitive
   substring matching over the fields a person would actually type (name,
   tagline, category, materials, colourways) is more predictable than
   Levenshtein scoring, and predictable beats clever at this scale.

   Fails silently and completely: no #search-btn, no wiring. The magnifier is
   an enhancement over a catalogue that is already reachable by link.
   ========================================================================== */

import { currentLang, t } from '../data/i18n.js';

const R = (() => {
  const d = parseInt(document.body.dataset.depth || '0', 10);
  return d > 0 ? '../'.repeat(d) : '';
})();

const CLOSE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

/* Match weights. Lower sorts first. A name hit outranks a tagline hit, and a
   name that STARTS with the query outranks one that merely contains it —
   typing "din" should surface "Dining Table" above "Bedside with dining…". */
const RANK_NAME_START = 0;
const RANK_NAME = 1;
const RANK_CAT = 2;
const RANK_TAG = 3;
const RANK_OTHER = 4;

let ui = null;      // built lazily on first open
let data = null;    // { PIECES, catName } once the module has loaded
let lastFocus = null;

/* ---- Matching -------------------------------------------------------------- */
function score(p, q, catLabel) {
  const name = p.name.toLowerCase();
  if (name.startsWith(q)) return RANK_NAME_START;
  if (name.includes(q)) return RANK_NAME;
  if (catLabel.toLowerCase().includes(q)) return RANK_CAT;
  if (p.tagline.toLowerCase().includes(q)) return RANK_TAG;
  const rest = [...(p.materials || []), ...(p.variants || [])].join(' ').toLowerCase();
  if (rest.includes(q)) return RANK_OTHER;
  return -1;
}

/* Every string that reaches innerHTML goes through this. Piece names are our
   own data, but the query is user-typed, and building HTML out of it unescaped
   is how a search box becomes an injection point. */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Escapes `text`, wrapping the matched run in <mark>. */
function mark(text, q) {
  const at = q ? text.toLowerCase().indexOf(q) : -1;
  if (at < 0) return esc(text);
  return esc(text.slice(0, at)) + '<mark>' + esc(text.slice(at, at + q.length)) +
         '</mark>' + esc(text.slice(at + q.length));
}

/* ---- Rendering ------------------------------------------------------------- */
function render(query) {
  const q = query.trim().toLowerCase();
  const { PIECES, catName } = data;

  /* Empty query lists everything rather than showing a blank panel: opening
     search is also a legitimate way to browse 18 pieces. */
  const hits = PIECES
    .map((p) => ({ p, cat: catName(p.cat), s: q ? score(p, q, catName(p.cat)) : RANK_NAME }))
    .filter((h) => h.s >= 0)
    .sort((a, b) => a.s - b.s || a.p.name.localeCompare(b.p.name));

  const isBn = currentLang() === 'bn';
  ui.count.textContent = q
    ? (isBn
        ? `“${query.trim()}” \u098F\u09B0 \u099C\u09A8\u09CD\u09AF ${hits.length.toLocaleString('bn-BD')}\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC \u09AA\u09BE\u0993\u09DF\u09BE \u0997\u09C7\u099B\u09C7`
        : `${hits.length} ${hits.length === 1 ? 'piece' : 'pieces'} matching “${query.trim()}”`)
    : (isBn
        ? `\u09B8\u0995\u09B2 ${PIECES.length.toLocaleString('bn-BD')}\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC`
        : `All ${PIECES.length} pieces`);

  ui.results.innerHTML = hits.map(({ p, cat }) => `
    <li>
      <a href="${R}piece/${p.id}/">
        <img src="${R}assets/img/${p.id}_cut_512.webp" alt="" width="56" height="56"
             loading="lazy"
             onerror="this.onerror=null;this.src='${R}assets/img/${p.id}_512.webp'">
        <span class="ps-txt">
          <b>${mark(p.name, q)}</b>
          <span>${esc(cat)} — ${esc(p.tagline)}</span>
        </span>
      </a>
    </li>`).join('') ||
    `<li class="psearch-empty">${isBn ? (t('search_no_results') || '\u0995\u09CB\u09A8\u09CB \u0986\u09B8\u09AC\u09BE\u09AC \u09AE\u09C7\u09B2\u09C7\u09A8\u09BF\u0964') : 'Nothing matches that. Try a material, a room or a colourway.'}</li>`;
}

/* ---- Overlay --------------------------------------------------------------- */
function build() {
  const isBn = currentLang() === 'bn';
  const el = document.createElement('div');
  el.className = 'psearch';
  el.id = 'psearch';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', isBn ? 'আসবাব খুঁজুন' : 'Search pieces');
  el.innerHTML = `
    <div class="psearch-top">
      <label class="sr-only" for="psearch-input">${isBn ? 'আসবাব খুঁজুন' : 'Search pieces'}</label>
      <input id="psearch-input" type="search" autocomplete="off" spellcheck="false"
             placeholder="${isBn ? (t('search_placeholder') || 'আসবাব খুঁজুন...') : 'Search pieces'}">
      <button class="psearch-close" type="button" aria-label="Close search">${CLOSE_SVG}</button>
    </div>
    <p class="psearch-count" aria-live="polite"></p>
    <ul class="psearch-results"></ul>`;
  document.body.appendChild(el);

  ui = {
    el,
    input: el.querySelector('input'),
    count: el.querySelector('.psearch-count'),
    results: el.querySelector('.psearch-results'),
  };

  ui.input.addEventListener('input', () => render(ui.input.value));
  el.querySelector('.psearch-close').addEventListener('click', close);
  /* Click the backdrop (not the panel contents) to dismiss. */
  el.addEventListener('mousedown', (e) => { if (e.target === el) close(); });

  /* ---- Focus trap ---------------------------------------------------------
     The panel declares aria-modal="true", which promises assistive technology
     that nothing outside it is reachable. Tab did not honour that: it walked
     straight out of the dialog into the page behind, so a keyboard user landed
     on links they could not see while a modal was still open. WCAG 2.4.3.

     Computed on each Tab rather than cached, because the results list is rebuilt
     on every keystroke and a cached node list goes stale immediately. */
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [ui.input, ...ui.results.querySelectorAll('a'),
      el.querySelector('.psearch-close')].filter(Boolean);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const at = focusable.indexOf(document.activeElement);
    /* Focus somewhere inside the dialog but not on a tracked control (the panel
       itself, say) — pull it back to a known end rather than letting it escape. */
    if (at === -1) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Arrow keys walk the results without leaving the input. */
  ui.input.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown') return;
    const first = ui.results.querySelector('a');
    if (first) { e.preventDefault(); first.focus(); }
  });
  ui.results.addEventListener('keydown', (e) => {
    const links = [...ui.results.querySelectorAll('a')];
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); (links[i + 1] || links[0]).focus(); }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (i === 0) ui.input.focus(); else links[i - 1].focus();
    }
  });
  return ui;
}

async function open(btn) {
  /* Captured before anything else moves focus — closing the overlay menu
     below returns focus to its own button, which would otherwise become the
     restore target when search closes. */
  lastFocus = document.activeElement;

  /* The overlay menu and this panel share body.menu-locked, so leaving both
     open means whichever closes first releases the other's scroll lock. Shut
     the menu through its own button so menu.js runs its full teardown
     (pointer scrub, focus return) rather than being torn out from under it. */
  const dots = document.getElementById('dots-btn');
  if (dots && dots.getAttribute('aria-expanded') === 'true') dots.click();

  if (!data) {
    /* Relative to THIS module, so it resolves the same at every page depth. */
    const mod = await import('../data/pieces.js');
    data = { PIECES: mod.PIECES, catName: mod.catName };
  }
  if (!ui) build();
  render(ui.input.value);
  ui.el.classList.add('-open');
  document.body.classList.add('menu-locked');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  /* One frame, so the input is focusable before focus lands on it — a
     visibility:hidden element cannot take focus. */
  requestAnimationFrame(() => { ui.input.focus(); ui.input.select(); });
}

function close() {
  if (!ui) return;
  ui.el.classList.remove('-open');
  document.body.classList.remove('menu-locked');
  document.querySelectorAll('#search-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
}

const isOpen = () => !!ui && ui.el.classList.contains('-open');

/* ---- Boot ------------------------------------------------------------------ */
function init() {
  const btn = document.getElementById('search-btn');
  if (!btn) return;
  btn.addEventListener('click', () => (isOpen() ? close() : open(btn)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { close(); return; }
    /* Cmd/Ctrl+K anywhere. Bare "/" only when the user isn't already typing —
       otherwise it eats the slash in every text field on the page. */
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') ||
                   document.activeElement?.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault(); if (!isOpen()) open(btn); return;
    }
    if (e.key === '/' && !typing && !isOpen()) { e.preventDefault(); open(btn); }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
