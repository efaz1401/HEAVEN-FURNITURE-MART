/* ==========================================================================
   ONE piece-card builder for the whole site.

   This used to be copy-pasted into index.html, collections/index.html,
   js/cat.js and js/piece.js. The AR badge was hard-coded in all four, so
   pieces with no .glb advertised AR they could not open — and fixing it in
   one copy left three wrong. There is now exactly one implementation, which
   is what makes the gate below enforceable rather than aspirational.

   THE AR GATE: the badge renders ONLY when p.hasModel is true. A badge on a
   piece that cannot open AR is worse than no badge at all — it spends the
   user's trust and returns nothing. `white_wooden_panel_bed` is the standing
   regression test: hasModel is false, so no AR affordance may appear anywhere
   on its card.

   `root` is the relative prefix back to the site root ('', '../', '../../'),
   so the same builder works at any URL depth. Callers pass it explicitly
   because a DOM builder cannot know how deep its page is.

   ---- Re-skin notes (Phase 4) ---------------------------------------------

   The reference's grid cell HAS NO BOX. The old card was a filled --ink-2
   rectangle with a border, a cropped photo and four stacked text rows. This
   one is a column of content separated by hairlines, which is why the CSS in
   css/pages.css moved from "card" rules to "rule" rules.

   Three substantive changes beyond layout:

   1. CUT-OUTS, NOT PHOTOGRAPHS. `_cut_*.webp` carries real alpha, so the
      silhouette sits on the page instead of inside a window. An error handler
      falls back to the opaque `_512.webp` master rather than leaving a broken
      image: all 54 cut-outs exist today, but they are pending sign-off, and a
      rejected cut-out must degrade to the photo it replaced.
   2. LEAD TIME, NOT DIMENSIONS. The reference puts a price in the cell foot.
      This catalogue has no price field and quotes on WhatsApp, so the foot
      carries the one number a buyer actually decides on. Dimensions still
      appear in full on the piece page (js/piece-fill.js builds #spec).
   3. SQUARE INTRINSIC SIZE. The old width/height said 1024x768 while
      .piece-figure is aspect-ratio 1/1, so every card reserved the wrong box
      and shifted on decode. The cut-outs are re-padded square by
      scripts/make_cutouts.py, so 1024x1024 is both true and stable.

   `dimText()` was exported from here and imported by nothing — it duplicated
   `dimLine()` in data/pieces.js, which room/index.html already uses. Removed
   rather than left as a second formatter that could drift from the first.
   ========================================================================== */

import { fromPrice } from './pricing.js';

const AR_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
  'aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>' +
  '<path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>';

/* Cards render at <=400px, so the 512w file is what phones and most desktop
   columns actually fetch (~28 KB); 1024w exists for wide 3-column layouts on
   2x screens. No 1536w here — that size is for the piece-page stage. */
const SIZES = '(max-width: 640px) 92vw, (max-width: 1024px) 30vw, 400px';

/**
 * Builds one piece-card anchor.
 * @param {object} p        piece record from data/pieces.js
 * @param {string} root     path prefix to site root, e.g. '' | '../' | '../../'
 * @param {string} [catLabel] human-readable category name, e.g. "Dining"
 * @returns {HTMLAnchorElement}
 */
export function card(p, root = '', catLabel = '') {
  const a = document.createElement('a');
  a.className = 'piece-card reveal';
  a.href = `${root}piece/${p.id}/`;

  /* ---- Figure: the cut-out on the shared product ground ------------------ */
  const fig = document.createElement('figure');
  fig.className = 'piece-figure';

  const img = document.createElement('img');
  img.src = `${root}assets/img/${p.id}_cut_512.webp`;
  img.srcset =
    `${root}assets/img/${p.id}_cut_512.webp 512w, ` +
    `${root}assets/img/${p.id}_cut_1024.webp 1024w`;
  img.sizes = SIZES;
  img.alt = p.alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.width = 1024;
  img.height = 1024;

  /* Fall back to the opaque master if the cut-out is missing or unreadable.
     `once` matters: without it a failing fallback would re-enter this handler
     and loop. Clearing srcset first is required — a live srcset outranks src,
     so setting src alone would change nothing. */
  img.addEventListener('error', () => {
    img.srcset = '';
    img.src = `${root}assets/img/${p.id}_512.webp`;
    fig.dataset.fallback = 'photo';   /* lets CSS re-crop an opaque image */
  }, { once: true });

  fig.appendChild(img);

  /* The gate. No model, no badge. */
  if (p.hasModel) {
    const flag = document.createElement('span');
    flag.className = 'ar-flag';
    flag.innerHTML = AR_ICON + ' AR';
    fig.appendChild(flag);
  }

  /* ---- Body: eyebrow, title, tagline, foot ------------------------------- */
  const body = document.createElement('div');
  body.className = 'piece-body';

  /* The category eyebrow carries the reference's short leading rule, drawn as
     a ::before in css/pages.css so it costs no markup. */
  const cat = document.createElement('span');
  cat.className = 'piece-cat';
  cat.textContent = catLabel || p.cat.replace(/-/g, ' ');

  const h3 = document.createElement('h3');
  h3.textContent = p.name;

  const tag = document.createElement('p');
  tag.className = 'piece-tag';
  tag.textContent = p.tagline;

  /* The cell foot: the reference's price row. It now carries a real price AND
     the lead time, because for made-to-order furniture the two are one decision
     — a customer weighing ৳120,000 against ৳420,000 also needs to know one is
     six weeks and the other twelve.

     "From" is doing real work, not hedging. Every piece is configurable on its
     own page, and this is the published minimum: the piece exactly as listed, at
     standard size and base materials. It is the floor of a real range, so it is
     the honest number to lead with. */
  const foot = document.createElement('p');
  foot.className = 'piece-foot';

  const price = document.createElement('b');
  price.className = 'piece-price';
  price.textContent = fromPrice(p);

  const lead = document.createElement('span');
  lead.className = 'piece-foot-k';
  lead.textContent = p.lead;

  foot.append(price, document.createTextNode(' '), lead);
  body.append(cat, h3, tag, foot);
  a.append(fig, body);
  return a;
}
