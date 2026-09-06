/* ==========================================================================
   Category page renderer. Reads the slug from <body data-cat="…"> and paints
   the heading, blurb and grid from data/pieces.js.
   Cards come from js/card.js so the AR badge stays gated on hasModel.
   ========================================================================== */

import { PIECES, CATEGORIES, catName } from '../data/pieces.js';
import { card } from './card.js';
import { currentLang, LANG_EVENT, t } from '../data/i18n.js';

const slug = document.body.dataset.cat;
const cat = CATEGORIES.find((c) => c.slug === slug);
const grid = document.getElementById('piece-grid');

function paintCat() {
  if (cat) {
    const isBn = currentLang() === 'bn';
    const name = isBn ? (t('cat_' + slug.replace(/-/g, '_')) || cat.name) : cat.name;
    const titleEl = document.getElementById('cat-title');
    const blurbEl = document.getElementById('cat-blurb');
    const crumbEl = document.getElementById('crumb-cat');
    if (titleEl) titleEl.textContent = name;
    if (blurbEl) blurbEl.textContent = cat.blurb;
    if (crumbEl) crumbEl.textContent = name;
    document.title = `${name} Furniture — Heaven Furniture Mart, Chattogram`;
  }
}

paintCat();
document.addEventListener(LANG_EVENT, paintCat);

if (grid) {
  const list = PIECES.filter((p) => p.cat === slug);

  /* Cards price themselves via fromPrice(), which reads the language at
     render time — so a language flip rebuilds the grid. paintCat() handles
     the heading; this handles the cards and the count line. */
  function renderGrid() {
    grid.textContent = '';
    list.forEach((p) => grid.appendChild(card(p, '../../', catName(p.cat))));
    grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));

    const count = document.getElementById('cat-count');
    if (count) {
      const ar = list.filter((p) => p.hasModel).length;
      if (currentLang() === 'bn') {
        const bn = (n) => n.toLocaleString('bn-BD');
        count.textContent = list.length === 1
          ? `${bn(list.length)}\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC${ar ? ` \u00B7 ${bn(ar)}\u099F\u09BF 3D \u09A4\u09C7 \u09A6\u09C7\u0996\u09BE \u09AF\u09BE\u09AC\u09C7` : ''}`
          : `${bn(list.length)}\u099F\u09BF \u0986\u09B8\u09AC\u09BE\u09AC${ar ? ` \u00B7 ${bn(ar)}\u099F\u09BF 3D \u09A4\u09C7 \u09A6\u09C7\u0996\u09BE \u09AF\u09BE\u09AC\u09C7` : ''}`;
      } else {
        count.textContent = list.length === 1
          ? `1 piece${ar ? ', viewable in AR' : ''}`
          : `${list.length} pieces${ar ? ` \u00B7 ${ar} viewable in AR` : ''}`;
      }
    }
  }

  renderGrid();
  document.addEventListener(LANG_EVENT, renderGrid);
}
