/* ==========================================================================
   Heaven Furniture Mart - piece page: 3D viewer, AR, variants, order board.
   ========================================================================== */

import { PIECES, bySlug, waLink, catName, taka, pick, variantLabel } from '../data/pieces.js';
import { t, LANG_EVENT, currentLang } from '../data/i18n.js';

/* The cart store moved to js/order.js and the add control moved to
   js/configurator.js, so this module no longer touches storage at all. */
import { card } from './card.js';

const MV_URL = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
const MODELS = '../../assets/models/';
const IMG    = '../../assets/img/';
const DUR_XL = 720;

const TINTS = {
  'royal blue': '#1E2FB8', 'emerald': '#0E6B4F', 'burgundy': '#6E1220',
  'ivory': '#EFE7D6', 'gold on ivory': '#C9A227', 'ivory on ivory': '#E6DCC8',
  'teal velvet': '#1F5E63', 'charcoal velvet': '#3A3A3C', 'blush velvet': '#C98F8A',
  'cream': '#EFE4D2', 'oat': '#D8C7A9', 'charcoal': '#33343A', 'clay': '#B5674B',
  'brown': '#5C3A28', 'black': '#1A1A1C', 'oxblood': '#8E1F2B',
};
function tintFor(name) {
  const k = name.toLowerCase().trim();
  if (TINTS[k]) return TINTS[k];
  const keys = Object.keys(TINTS).sort((a, b) => b.length - a.length);
  const hit = keys.find((key) => k.includes(key));
  return hit ? TINTS[hit] : '#8A8A8A';
}

const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/* ==========================================================================
   RECOLOURING THE 3D MODEL FROM THE FINISH PICKER

   NONE OF THE EIGHT GLBs CARRIES KHR_materials_variants. Measured:
   `mv.availableVariants` is [] on every one, so the variantName path in
   applyVariant() has never fired once. Picking a colourway moved the swatch and
   the order and left the model in whatever finish it was baked in.

   What the models do have is exactly one material with a baseColorTexture and no
   baseColorFactor, and model-viewer 4.0.0 exposes
   model.materials[0].pbrMetallicRoughness.setBaseColorFactor(). That factor
   MULTIPLIES the texture, so a tint keeps the weave, the tufting shadows and the
   specular highlights and moves only the hue — which is what a colourway
   actually looks like, and it costs no new bytes.

   THE LIMIT IS ARITHMETIC, AND IT IS WHY ONE PIECE CANNOT DO THIS. A multiply
   only darkens. The factor is measured against the finish the model was baked in,
   which is always variants[0]:

     Modular Sectional    cream -> oat / charcoal / clay      darker, all work
     Executive Chair Brown brown -> black / oxblood           darker, both work
     Carved Dining Chair  gold on ivory -> ivory on ivory     BRIGHTER, impossible

   The dining chair's factor clamps to (1,1,1), so the model correctly stays put
   instead of showing a wrong colour. A real ivory needs a second baked texture in
   the GLB — asset work, not a runtime fix.
   ========================================================================== */
function baseColorFactorFor(piece, variant) {
  const base = rgbOf(tintFor(piece.variants[0] || ''));
  const want = rgbOf(tintFor(variant));
  /* Clamped per channel: baseColorFactor is [0,1] in glTF 2.0, and a target
     brighter than the baked finish leaves that channel alone. */
  return [...want.map((v, i) => Math.min(1, v / Math.max(1, base[i]))), 1];
}

/** Would this tint visibly change anything? An all-ones factor is the identity. */
const factorMoves = (f) => f.slice(0, 3).some((v) => v < 0.985);

/** Both finish pickers on a piece page broadcast through this one event.
    #swatches (js/piece.js) drives the 3D; .cfg-chips (js/configurator.js) drives
    the price and the order. They were independent, so choosing Charcoal in the
    configurator left the swatch — and the model — on Cream, and the customer
    could order one finish while looking at another. */
export const VARIANT_EVENT = 'hfm:variant';

function initPiece(id) {
  const piece = bySlug(id);
  if (!piece) return;

  const stage      = document.getElementById('stage');
  const stageWrap  = stage && stage.closest('.stage-wrap');
  const arRow      = document.getElementById('ar-row');
  const arBtn      = document.getElementById('ar-btn');
  const note       = document.getElementById('stage-note');
  const swatchBox  = document.getElementById('swatches');
  const exitBtn    = document.getElementById('stage-exit');

  let mv              = null;
  let selectedVariant = piece.variants[0] || null;

  /* ---- Fabric / Finish list in markup is replaced by stage swatches ---- */
  const variantBlock = document.getElementById('variant-block');
  if (variantBlock) {
    variantBlock.hidden = true;
    variantBlock.style.display = 'none';
  }

  /* ---- Stage Swatches (Relocated to 3D Stage for live visual feedback) ----
     The block is BAKED into the markup of the five pieces that carry
     colourways (scripts/bake-stage-finish.py): a JS-inserted block landed
     ~120ms after first paint and shifted everything below the stage,
     measurably 0.1167 CLS where the pre-move page scored 0.0000. So the
     markup owns the structure and this code only ADOPTS it — wiring the
     click listeners and the label translation. The create-path below stays
     only for a variant piece whose page was never baked (a future catalogue
     entry before its migration runs), which would degrade to the old
     post-paint insertion rather than to no swatches. */
  let stageState = 'idle'; // 'idle' | 'loading' | 'ready' | 'error_viewer' | 'error_model'

  function updateStageNote() {
    if (!note) return;
    if (!piece.hasModel) {
      note.textContent = currentLang() === 'bn'
        ? 'আমাদের শো-রুমে সরাসরি ক্যামেরায় তোলা ছবি। এই আসবাবটির ৩D মডেল তৈরির কাজ চলছে।'
        : 'Photographed in our showroom. A 3D model for this piece is still being built.';
      return;
    }
    if (stageState === 'idle') {
      note.textContent = t('stage_hint_tap') || 'Tap to load the interactive 3D model.';
    } else if (stageState === 'loading') {
      note.textContent = currentLang() === 'bn' ? '৩D মডেল লোড হচ্ছে…' : 'Loading 3D model…';
    } else if (stageState === 'ready') {
      note.textContent = t('stage_hint_rotate') || 'Drag to rotate. Pinch or scroll to zoom.';
    } else if (stageState === 'error_viewer') {
      note.textContent = t('stage_err_viewer') || 'The 3D viewer could not load. The photo above shows this piece.';
    } else if (stageState === 'error_model') {
      note.textContent = t('stage_err_model') || 'This 3D model is not available yet. The photo above shows this piece.';
    }
  }

  function updateStageFinish() {
    const lang = currentLang();
    const finishEl = document.getElementById('stage-finish');
    if (!finishEl) return;
    const label = finishEl.querySelector('.stage-finish-label');
    if (label) label.textContent = t('finish_title') || label.textContent;
    const activeLabel = document.getElementById('stage-finish-name');
    if (activeLabel && selectedVariant) {
      activeLabel.textContent = variantLabel(selectedVariant, lang);
    }
    finishEl.querySelectorAll('.swatches .swatch').forEach((b) => {
      const canonical = b.dataset.variant || b.textContent.trim();
      b.dataset.variant = canonical;
      const translated = variantLabel(canonical, lang);
      Array.from(b.childNodes).forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) n.remove();
      });
      b.appendChild(document.createTextNode(translated));
    });
  }

  let stageFinish = document.getElementById('stage-finish');
  if (stageFinish) {
    stageFinish.querySelectorAll('.swatches .swatch').forEach((b) => {
      const name = b.dataset.variant || b.textContent.trim();
      b.dataset.variant = name;
      b.addEventListener('click', () => {
        selectShown(name);
        document.dispatchEvent(new CustomEvent(VARIANT_EVENT, { detail: { variant: name } }));
        if (piece.hasModel && !mv) load3D();
      });
    });
    selectedVariant = null;
    selectShown(piece.variants[0]);
    document.addEventListener(LANG_EVENT, () => {
      updateStageFinish();
      updateStageNote();
    });
  } else if (stage && piece.variants.length) {
    stageFinish = document.createElement('div');
    stageFinish.className = 'stage-finish';
    stageFinish.id = 'stage-finish';

    const head = document.createElement('div');
    head.className = 'stage-finish-head';

    const label = document.createElement('span');
    label.className = 'stage-finish-label';
    label.textContent = t('finish_title') || 'Select Color & Finish';

    const sep = document.createTextNode(': ');

    const activeName = document.createElement('strong');
    activeName.id = 'stage-finish-name';
    activeName.className = 'stage-finish-active';
    activeName.textContent = variantLabel(selectedVariant || piece.variants[0], currentLang());

    head.append(label, sep, activeName);
    stageFinish.appendChild(head);

    const stageSwatches = document.createElement('ul');
    stageSwatches.className = 'swatches stage-swatches';

    piece.variants.forEach((name, i) => {
      const li = document.createElement('li');
      const b  = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.dataset.variant = name;
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.style.background = tintFor(name);
      b.append(chip, document.createTextNode(variantLabel(name, currentLang())));
      b.addEventListener('click', () => {
        selectShown(name);
        document.dispatchEvent(new CustomEvent(VARIANT_EVENT, { detail: { variant: name } }));
        if (piece.hasModel && !mv) load3D();
      });
      li.appendChild(b);
      stageSwatches.appendChild(li);
    });

    stageFinish.appendChild(stageSwatches);
    stage.insertAdjacentElement('afterend', stageFinish);

    document.addEventListener(LANG_EVENT, () => {
      updateStageFinish();
      updateStageNote();
    });
  }

  /* Paints the swatch row and retints the model. Split out from the click handler
     so external events can drive it through VARIANT_EVENT without synthesising a click. */
  function selectShown(name) {
    if (selectedVariant === name) {
      updateStageFinish();
      return;
    }
    selectedVariant = name;
    updateStageFinish();
    document.querySelectorAll('.stage-swatches .swatch').forEach((s) => {
      const canonical = s.dataset.variant || s.textContent.trim();
      s.dataset.variant = canonical;
      s.setAttribute('aria-pressed', String(canonical === name));
    });
    applyVariant();
  }

  /* Follows external variant change events */
  document.addEventListener(VARIANT_EVENT, (e) => {
    const v = e.detail && e.detail.variant;
    if (v && piece.variants.includes(v)) selectShown(v);
  });

  /* ---- No model? Say so plainly and stop 3D setup, but keep swatches and quote active ---- */
  if (!piece.hasModel) {
    const posterBtn = document.getElementById('stage-poster');
    if (posterBtn) {
      const play = posterBtn.querySelector('.play-3d');
      if (play) play.remove();
      posterBtn.disabled = true;
      posterBtn.classList.add('stage-poster--static');
    }
    if (arRow)   arRow.hidden = true;
    if (exitBtn) exitBtn.hidden = true;
    const updateNote = () => {
      const isBn = currentLang() === 'bn';
      if (note) note.textContent = isBn
        ? 'আমাদের শো-রুমে সরাসরি ক্যামেরায় তোলা ছবি। এই আসবাবটির ৩D মডেল তৈরির কাজ চলছে।'
        : 'Photographed in our showroom. A 3D model for this piece is still being built.';
    };
    updateNote();
    document.addEventListener(LANG_EVENT, updateNote);

    const caveat = document.getElementById('ar-caveat');
    if (caveat) caveat.hidden = true;

    const qr = document.getElementById('qr-img');
    if (qr) qr.remove();

    const noModel = document.getElementById('no-model');
    if (noModel) {
      noModel.hidden = false;
      const link = noModel.querySelector('[data-wa]');
      if (link) link.href = waLink(`Hello, I'd like to see the ${piece.name} — can you send photos or video?`);
    }
    initRoomAndQuote(piece, () => selectedVariant, stageFinish);
    initRelated(piece);
    initStickyBar(piece);
    return;
  }


  function applyVariant() {
    if (!mv || !selectedVariant) return;
    try {
      /* If a GLB ever gains KHR_materials_variants, that is the correct path and
         it wins: baked variants can change texture, roughness and metalness, not
         just hue. Today no model has it, so this falls through to the tint. */
      const available = mv.availableVariants || [];
      if (available.includes(selectedVariant)) {
        mv.variantName = selectedVariant;
        return;
      }
      const material = mv.model && mv.model.materials && mv.model.materials[0];
      if (!material || !material.pbrMetallicRoughness) return;
      const factor = baseColorFactorFor(piece, selectedVariant);
      /* Reset to the baked finish rather than skipping, or switching back to the
         first colourway would leave the previous tint applied. */
      material.pbrMetallicRoughness.setBaseColorFactor(
        factorMoves(factor) ? factor : [1, 1, 1, 1]);
    } catch { /* an older model-viewer without the scene graph: leave it baked */ }
  }

  /* ---- Scale controls ----------------------------------------------------
     REMOVED: the AR Size slider let a visitor pre-scale the model before
     opening AR, but model-viewer already runs ar-scale="auto", so Scene
     Viewer and WebXR offer pinch-to-resize with a reset-to-100% button in
     the AR app itself. A site-side 50–200% slider in front of that is a
     second, worse control for the same job — and a range slider is the
     least senior-friendly control on the page. The model-viewer still
     receives no explicit `scale`, which is real-world 1:1 by default. */

  /* ---- Exit 3D ----------------------------------------------------------- */
  if (exitBtn) {
    exitBtn.addEventListener('click', async () => {
      if (!mv) return;
      mv.classList.remove('is-in');
      await new Promise((r) => setTimeout(r, DUR_XL));
      if (mv) { mv.remove(); mv = null; }
      if (stage) delete stage.dataset.mode;
      if (stageWrap) delete stageWrap.dataset.model;
      stageState = 'idle';
      updateStageNote();
      const posterBtn = document.getElementById('stage-poster');
      if (posterBtn) {
        posterBtn.disabled = false;
        posterBtn.addEventListener('click', () => load3D(), { once: true });
      }
    });
  }

  function update3DButtons() {
    const lang = currentLang();
    if (exitBtn) {
      const exitTxt = t('btn_exit_3d') || 'Exit 3D';
      exitBtn.setAttribute('aria-label', exitTxt);
      Array.from(exitBtn.childNodes).forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) n.remove();
      });
      exitBtn.appendChild(document.createTextNode(' ' + exitTxt));
    }
    const play = document.querySelector('.play-3d');
    if (play) {
      const playTxt = t('btn_view_3d') || 'View in 3D';
      Array.from(play.childNodes).forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) n.remove();
      });
      play.appendChild(document.createTextNode(' ' + playTxt));
    }
    if (arBtn) {
      const arTxt = t('btn_ar') || 'See this in your room';
      Array.from(arBtn.childNodes).forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) n.remove();
      });
      const brB = arBtn.querySelector('.br-b');
      if (brB) {
        arBtn.insertBefore(document.createTextNode(' ' + arTxt + ' '), brB);
      } else {
        arBtn.appendChild(document.createTextNode(' ' + arTxt));
      }
    }
  }

  update3DButtons();
  updateStageNote();
  document.addEventListener(LANG_EVENT, () => {
    update3DButtons();
    updateStageNote();
  });

  /* ---- 3D: loaded on demand (tap the poster) ----------------------------- */
  const posterBtn = document.getElementById('stage-poster');
  if (posterBtn) {
    posterBtn.addEventListener('click', () => load3D(), { once: true });
  }

  async function load3D() {
    if (mv) return;
    stageState = 'loading';
    updateStageNote();
    if (stage) stage.dataset.mode = '3d';
    try {
      await import(MV_URL);
    } catch {
      if (stage) delete stage.dataset.mode;
      stageState = 'error_viewer';
      updateStageNote();
      return;
    }
    mv = document.createElement('model-viewer');
    mv.src = MODELS + piece.id + '.glb';
    /* Apple iOS AR Quick Look: powered by native .usdz models generated from GLB.
       Enables one-tap augmented reality directly through Safari and Chrome on iPhone & iPad. */
    mv.setAttribute('ios-src', MODELS + piece.id + '.usdz');
    mv.alt = pick(piece, 'alt', currentLang());
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('touch-action', 'pan-y');
    mv.setAttribute('shadow-intensity', '1');
    mv.setAttribute('exposure', '0.95');
    mv.setAttribute('ar', '');
    mv.setAttribute('ar-modes', 'scene-viewer quick-look webxr');
    /* ar-scale="auto" enables pinch-to-scale gestures in Google Scene Viewer / WebXR,
       allowing users to adjust the size in the AR app, with Scene Viewer offering
       a 100% reset button to snap back to real-world scale at any time. */
    mv.setAttribute('ar-scale', 'auto');
    /* The cut-out, matching the stage poster js/piece-fill.js swapped in. This
       is what model-viewer paints while the GLB streams, so handing it the
       opaque oxblood master would flash the retired palette into the middle of
       a paper stage. Already in the HTTP cache: piece-fill.js requested the
       same file on page load. */
    mv.setAttribute('poster', IMG + piece.id + '_cut_1024.webp');
    mv.setAttribute('loading', 'eager');
    mv.addEventListener('load', () => {
      stageState = 'ready';
      updateStageNote();
      applyVariant();
      requestAnimationFrame(() => mv.classList.add('is-in'));
      if (stageWrap) stageWrap.dataset.model = 'ready';
    });
    mv.addEventListener('error', () => {
      stageState = 'error_model';
      updateStageNote();
      if (stage) delete stage.dataset.mode;
      mv.remove(); mv = null;
    });
    if (stage) stage.appendChild(mv);
  }

  /* ---- AR button --------------------------------------------------------- */
  if (arBtn) {
    arBtn.addEventListener('click', async () => {
      if (arBtn.disabled) return;
      arBtn.disabled = true;
      arBtn.setAttribute('aria-busy', 'true');
      const restore = arBtn.innerHTML;
      const finish = () => {
        arBtn.disabled = false;
        arBtn.removeAttribute('aria-busy');
        arBtn.innerHTML = restore;
      };
      if (!mv || !mv.loaded) {
        const prep = t('stage_ar_preparing') || 'Preparing the model…';
        const curLabel = t('btn_ar') || 'See this in your room';
        arBtn.innerHTML = restore.replace(curLabel, prep).replace('See this in your room', prep);
      }
      if (!mv) await load3D();
      if (!mv) { finish(); return; }
      if (!mv.loaded) {
        await new Promise((res) => {
          mv.addEventListener('load', res, { once: true });
          setTimeout(res, 15000);
        });
      }
      finish();
      applyVariant();
      if (mv.canActivateAR) {
        mv.activateAR();
      } else {
        const help = document.getElementById('ar-help');
        if (help) { help.hidden = false; help.scrollIntoView({ block: 'nearest' }); }
      }
    });
  }

  /* ---- First-run AR coaching --------------------------------------------- */
  const coach = document.getElementById('coach');
  if (coach) {
    const KEY = 'hfm-coached';
    const dismiss = () => {
      coach.hidden = true;
      try { localStorage.setItem(KEY, '1'); } catch {}
    };
    coach.querySelectorAll('[data-coach-close]').forEach((b) =>
      b.addEventListener('click', dismiss));
    let seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch {}
    if (arBtn && !seen) {
      arBtn.addEventListener('click', (e) => {
        if (coach.hidden === false) return;
        if (localStorage.getItem(KEY) === '1') return;
        e.preventDefault();
        e.stopImmediatePropagation();
        coach.hidden = false;
      }, { capture: true, once: true });
    }
  }

  /* ---- Auto-fire AR from QR handoff (?ar=1) ------------------------------ */
  if (new URLSearchParams(location.search).get('ar') === '1' && arBtn) {
    try { localStorage.setItem('hfm-coached', '1'); } catch {}
    setTimeout(() => arBtn.click(), 400);
  }

  initRoomAndQuote(piece, () => selectedVariant, swatchBox);

  /* ---- QR handoff: desktop to phone -------------------------------------- */
  const qr = document.getElementById('qr-img');
  if (qr) {
    const url = location.origin + location.pathname + '?ar=1';
    qr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=232x232&margin=0&data=' +
             encodeURIComponent(url);
    qr.alt = 'QR code linking to this page with augmented reality ready to open';
  }

  initRelated(piece);
  initStickyBar(piece);
}

/* ========================================================================== */

function initRoomAndQuote(piece, getVariant = () => null, swatchBox = null) {
  /* THE ADD-TO-CART BUTTON MOVED. It used to live here as #add-room, adding the
     piece at its selected variant with no other specification — which was all
     there was to add before pricing existed.

     js/configurator.js now owns both order controls, because the thing being
     added is a full configuration (dimensions, material tier, finish, add-ons)
     and only the panel that collected it knows what that is. Splitting the
     button from the state it submits is how the two drift apart.

     What stays here is the WhatsApp question link, which the configurator does
     not own: it is the route for someone who wants to talk before specifying. */
  const waBtn = document.getElementById('wa-btn');
  if (waBtn) {
    let callBtn = document.getElementById('call-showroom-btn');
    if (!callBtn && waBtn.parentElement) {
      const sep = document.createElement('span');
      sep.className = 'piece-ask-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.style.margin = '0 .75rem';
      sep.style.color = 'var(--hair-strong)';
      sep.textContent = '\u00B7';

      callBtn = document.createElement('a');
      callBtn.id = 'call-showroom-btn';
      callBtn.className = 'rule-link';
      callBtn.href = 'tel:+8801960481983';

      waBtn.parentElement.append(sep, callBtn);
    }
    const updateText = () => {
      const askTxt = t('btn_ask_wa');
      if (askTxt) waBtn.textContent = askTxt;
      if (callBtn) {
        const isBn = currentLang() === 'bn';
        callBtn.textContent = isBn
          ? (t('btn_call_showroom') || '\u09B6\u09CB-\u09B0\u09C1\u09AE\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0995\u09B2 \u0995\u09B0\u09C1\u09A8')
          : (t('btn_call_showroom') || 'Call showroom (+880 1960-481983)');
      }
    };
    updateText();
    const sync = () => {
      const v = getVariant();
      const isBn = currentLang() === 'bn';
      const pieceName = pick(piece, 'name', currentLang());
      const vLabel = v ? variantLabel(v, currentLang()) : '';
      const fabric = v ? (isBn ? ` (${vLabel} ফিনিশ)` : ` in ${v}`) : '';
      const text = isBn
        ? `আসসালামু আলাইকুম, আমি Heaven Furniture Mart-এর ${pieceName}${fabric} আসবাবটির মূল্য ও বিবরণ জানতে আগ্রহী। পেজ: ${location.href}`
        : `Hello Heaven Furniture Mart. I'd like a quote for the ${piece.name}${fabric}. Page: ${location.href}`;
      waBtn.href = waLink(text);
    };
    sync();
    if (swatchBox) swatchBox.addEventListener('click', sync);
    document.addEventListener(LANG_EVENT, () => {
      updateText();
      sync();
    });
  }
}

function initRelated(piece) {
  const rel = document.getElementById('related');
  if (!rel) return;
  const section = rel.closest('section');
  const h2 = section && section.querySelector('h2');
  const updateTitle = () => {
    if (h2) h2.textContent = t('more_from_workshop') || 'More from the workshop';
  };
  updateTitle();
  document.addEventListener(LANG_EVENT, updateTitle);
  let picks = PIECES.filter((p) => p.cat === piece.cat && p.id !== piece.id).slice(0, 3);
  if (!picks.length) {
    picks = PIECES.filter((p) => p.id !== piece.id).slice(0, 3);
  }
  picks.forEach((p) => rel.appendChild(card(p, '../../', catName(p.cat))));
  rel.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
}

function initStickyBar(piece) {
  if (document.getElementById('piece-sticky-bar')) return;

  const bar = document.createElement('div');
  bar.id = 'piece-sticky-bar';
  bar.className = 'piece-sticky-bar';

  const initialPrice = taka(piece.price.min, currentLang());

  bar.innerHTML = `
    <div class="piece-sticky-info">
      <span class="piece-sticky-name">${pick(piece, 'name', currentLang())}</span>
      <span class="piece-sticky-price" id="piece-sticky-price">${initialPrice}</span>
    </div>
    <div class="piece-sticky-actions">
      <button type="button" class="btn piece-sticky-btn" id="piece-sticky-btn">
        ${t('btn_order_now') || 'Order'}
      </button>
    </div>
  `;

  document.body.appendChild(bar);

  const cta = bar.querySelector('#piece-sticky-btn');
  if (cta) {
    cta.addEventListener('click', () => {
      const cfg = document.getElementById('configurator');
      if (cfg) {
        cfg.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const priceEl = bar.querySelector('#piece-sticky-price');
  const stickyNameEl = bar.querySelector('.piece-sticky-name');

  document.addEventListener('hfm:config-price', (e) => {
    if (priceEl && e.detail && e.detail.formatted) {
      priceEl.textContent = e.detail.formatted;
    }
  });

  document.addEventListener(LANG_EVENT, () => {
    const lang = currentLang();
    if (cta) cta.textContent = t('btn_order_now') || (lang === 'bn' ? 'অর্ডার করুন' : 'Order');
    if (stickyNameEl) stickyNameEl.textContent = pick(piece, 'name', lang);
    const cfgPrice = document.querySelector('.cfg-price');
    if (priceEl) {
      if (cfgPrice && cfgPrice.textContent) {
        priceEl.textContent = cfgPrice.textContent;
      } else {
        priceEl.textContent = taka(piece.price.min, lang);
      }
    }
  });

  const nameEl = document.getElementById('p-name');

  if (nameEl) {
    let namePassed = false;
    let ctaInView = false;

    const updateVisibility = () => {
      if (namePassed && !ctaInView) {
        bar.classList.add('piece-sticky-bar--visible');
      } else {
        bar.classList.remove('piece-sticky-bar--visible');
      }
    };

    if ('IntersectionObserver' in window) {
      const nameObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          namePassed = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
          updateVisibility();
        }
      }, { threshold: 0 });
      nameObserver.observe(nameEl);

      const getCta = () => document.querySelector('.cfg-actions') || document.getElementById('configurator');
      const targetCta = getCta();
      if (targetCta) {
        const ctaObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            ctaInView = entry.isIntersecting;
            updateVisibility();
          }
        }, { threshold: 0.1 });
        ctaObserver.observe(targetCta);
      }
    }

    window.addEventListener('scroll', () => {
      const rect = nameEl.getBoundingClientRect();
      namePassed = rect.top < 0;
      const targetCta = document.querySelector('.cfg-actions');
      if (targetCta) {
        const cRect = targetCta.getBoundingClientRect();
        ctaInView = (cRect.top < window.innerHeight && cRect.bottom > 0);
      }
      updateVisibility();
    }, { passive: true });
  }
}


/* Boot */
const root = document.getElementById('piece-root');
if (root) initPiece(root.dataset.piece);