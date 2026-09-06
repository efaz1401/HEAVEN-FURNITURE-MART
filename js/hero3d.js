/* ==========================================================================
   3D HERO — the homepage's opening product, as real geometry, ON REQUEST.

   IT USED TO MOUNT ITSELF, AND THE COST WAS NOT WHAT THE COMMENT HERE CLAIMED.
   The old note called it "a straight win rather than a trade" because the GLB was
   already shipped for AR. Measured on the deployed site at Lighthouse mobile
   throttling, blocking this module alone:

     largest contentful paint   11,284ms -> 1,728ms
     total blocking time         1,738ms ->   303ms
     long tasks                      215 ->       3
     homepage transfer             2,341 KB -> 753 KB

   The bytes were never the problem. model-viewer runs a CONTINUOUS WebGL render
   loop, so on a throttled phone it produced 212 of the page's 215 long tasks and
   starved the main thread so badly that the hero's own preloaded photograph took
   eleven seconds to paint. The save-data / 2G gate below did not help, because a
   normal 4G phone reports neither — which is the common case and the one
   Lighthouse tests. requestIdleCallback did not help either: it moves when the
   loop starts, not that it never stops.

   So the model is behind a press now. The affordance is the turntable in
   index.html and css/pages.css: a hairline disc where the chair's shadow already
   falls, with a red dot that laps it once when the hero is looked at. On load the
   disc stays and becomes the ground the model stands on, so the control turns into
   the thing it promised rather than disappearing.

   Everything else is unchanged: the <img> in the markup is the hero with JS off,
   with WebGL blocked, and on a metered phone, and `data-piece` on #hero-stage is
   still the one place the subject is named.
   ========================================================================== */

import { PIECES } from '../data/pieces.js';
import { t, LANG_EVENT } from '../data/i18n.js';

/* Same CDN and version as js/piece.js on purpose: one shared cache entry for
   the whole site, so a visitor who lands on the homepage first pays for
   model-viewer once. */
const MV_URL = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
const MODELS = 'assets/models/';        /* the hero only exists at depth 0 */

/* Rotation budget. 20°/s × 54 s = three full turns, then it stops for good:
   long enough to read as alive, short enough that a phone left on this page
   isn't spinning a GPU forever. Only VISIBLE time counts. */
const SPIN_DEG_S = 20;
const SPIN_MS = (360 / SPIN_DEG_S) * 3 * 1000;

const stage   = document.getElementById('hero-stage');
const still   = document.getElementById('hero-still');
const turn    = document.getElementById('hero-turn');
const gesture = document.getElementById('hero-gesture');

/* The label is the whole state machine's voice. Reward first, mechanism never:
   "View in 3D" names a file format, "Turn it around" names what you get. */
const LABEL = {
  rest:   'Turn it around',
  busy:   'Loading…',
  live:   'Drag to spin',
  failed: '3D unavailable — showing the photograph',
};

/* 15s. The GLB is 948 KB, which is ~5s on ordinary mobile data, so this is a
   genuine stall rather than a slow connection. Past it, give the photograph back
   rather than leaving a control spinning at nothing. */
const LOAD_TIMEOUT_MS = 15000;

/* How long "Drag to spin" stays before it gets out of the way. Long enough to read
   twice at a glance; short enough that it is not permanent furniture. */
const TEACH_MS = 3200;

if (stage && turn) {
  const piece = PIECES.find((p) => p.id === stage.dataset.piece);
  const conn = navigator.connection || {};
  /* save-data is the one gate that stays. It is not about capability — accepting
     this invitation spends 1.2 MB, so on a metered connection the honest thing is
     not to offer it. 2G and reduced-motion no longer gate: a slow phone can still
     CHOOSE to wait, and someone who dislikes animation may still want to see the
     chair's back. Both were deciding on the visitor's behalf. */
  if (piece && piece.hasModel && conn.saveData !== true) {
    setState('rest');
    turn.hidden = false;
    if (gesture) gesture.hidden = false;

    /* One lap when the hero is actually looked at, not when this file parses. */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        turn.classList.add('is-seen');
        if (gesture) gesture.classList.add('is-seen');
        io.disconnect();
      }, { threshold: 0.35 });
      io.observe(stage);
    } else {
      turn.classList.add('is-seen');
      if (gesture) gesture.classList.add('is-seen');
    }

    turn.addEventListener('click', press, { once: true });
    if (gesture) gesture.addEventListener('click', press, { once: true });
    /* The photograph is the bigger target, and on a phone it is what a thumb
       lands on. It is not focusable and carries no label — the button is the
       accessible control; this is a convenience surface over the same action. */
    if (still) still.addEventListener('click', press, { once: true });

    function syncGestureLang() {
      if (!gesture) return;
      const lbl = gesture.querySelector('[data-i18n]');
      if (lbl) lbl.textContent = t('hero_tap_hint') || 'Tap to view in 3D';
    }
    document.addEventListener(LANG_EVENT, syncGestureLang);
    syncGestureLang();
  } else {
    if (gesture) gesture.hidden = true;
  }
}

function setState(state) {
  if (turn) {
    turn.dataset.state = state;
    const label = turn.querySelector('[data-label]');
    if (label) label.textContent = LABEL[state] || '';
  }
  if (gesture) {
    gesture.dataset.state = state;
    if (state !== 'rest') {
      gesture.classList.add('is-hidden');
    }
  }
}

function press() {
  if (!turn || turn.dataset.state !== 'rest') return;
  const piece = PIECES.find((p) => p.id === stage.dataset.piece);
  if (!piece) return;
  setState('busy');
  mount(piece);
}

async function mount(piece) {
  try {
    await import(MV_URL);
  } catch {
    /* CDN blocked. The still is the hero — say so rather than leaving the disc
       spinning at a script that will never arrive. */
    setState('failed');
    return;
  }

  const mv = document.createElement('model-viewer');
  mv.src = MODELS + piece.id + '.glb';
  mv.alt = piece.alt;

  /* No `poster`: the markup's own <img> is the poster, and it is already
     decoded. Handing model-viewer a second copy would download it twice. */
  mv.setAttribute('camera-controls', '');     /* it is a product — let people turn it */
  mv.setAttribute('disable-zoom', '');        /* ...but not wreck the composition */
  mv.setAttribute('touch-action', 'pan-y');   /* a drag up the page still scrolls */
  mv.setAttribute('interaction-prompt', 'none');
  mv.setAttribute('environment-image', 'neutral');
  mv.setAttribute('exposure', '1.05');
  /* On the ink hero the contact shadow is nearly invisible by design; it is
     kept so the same element reads correctly if the hero is ever moved onto
     paper, where it is what stops the piece from floating. */
  mv.setAttribute('shadow-intensity', '1');
  mv.setAttribute('shadow-softness', '0.8');
  mv.setAttribute('auto-rotate', '');
  mv.setAttribute('rotation-per-second', SPIN_DEG_S + 'deg');
  mv.setAttribute('loading', 'eager');

  /* A stall must not leave the disc spinning forever. */
  const bail = setTimeout(() => {
    if (stage.dataset.mode === '3d') return;      /* it arrived in time */
    mv.remove();
    setState('failed');
  }, LOAD_TIMEOUT_MS);

  mv.addEventListener('load', () => {
    clearTimeout(bail);
    stage.dataset.mode = '3d';
    if (gesture) gesture.hidden = true;
    requestAnimationFrame(() => mv.classList.add('is-in'));
    /* The disc stops being a control and becomes the model's floor. The label
       teaches the next move — drag — at the moment it becomes possible, then
       gets out of the way; the CSS delays its own fade. */
    setState('live');
    /* setTimeout, NOT requestAnimationFrame. The fade is a CSS transition with a
       2.6s delay, and adding .is-taught on the next frame put the class in the SAME
       style recalculation as data-state="live" — so the browser never painted the
       visible state, skipped the transition, and "Drag to spin" was at opacity 0
       from the first frame. Measured: labelOpacity 0 within 1.9s of the press, i.e.
       the one label whose whole job is to teach the drag was never seen.
       A timer makes it two separate changes, which is what a transition needs. */
    if (turn) setTimeout(() => turn.classList.add('is-taught'), TEACH_MS);
    budgetSpin(mv);
  }, { once: true });

  /* A broken GLB must leave the hero exactly as it was, not half-swapped. */
  mv.addEventListener('error', () => {
    clearTimeout(bail);
    delete stage.dataset.mode;
    mv.remove();
    setState('failed');
  }, { once: true });

  stage.appendChild(mv);
  /* Only once the model is committed: the still is the accessible hero until then,
     and hiding it from assistive tech while it is still the only thing on screen
     would leave the stage unlabelled. */
  if (still) still.setAttribute('aria-hidden', 'true');
}

/* ---- Spin budget, spent only while on screen -----------------------------
   model-viewer stops RENDERING off-screen on its own, but auto-rotate keeps
   accumulating turns, so a hero scrolled past would burn its whole budget
   invisibly and be frozen when you scrolled back. This counts visible time
   only, and drops the attribute permanently once the budget is gone. */
function budgetSpin(mv) {
  if (!('IntersectionObserver' in window)) {
    setTimeout(() => mv.removeAttribute('auto-rotate'), SPIN_MS);
    return;
  }
  let spent = 0, since = 0, timer = 0;

  const stop = () => {
    mv.removeAttribute('auto-rotate');
    io.disconnect();
    clearTimeout(timer);
  };

  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) {
      since = performance.now();
      mv.setAttribute('auto-rotate', '');
      timer = setTimeout(stop, Math.max(0, SPIN_MS - spent));
    } else {
      if (since) spent += performance.now() - since;
      since = 0;
      mv.removeAttribute('auto-rotate');
      clearTimeout(timer);
      if (spent >= SPIN_MS) stop();
    }
  }, { threshold: 0.05 });

  io.observe(mv);
}
