/* ==========================================================================
   Heaven Furniture Mart — first-visit loading screen (homepage only).

   Shown ONLY on the first page of a session (sessionStorage flag), so moving
   between already-visited pages never re-triggers it. Waits on the real heavy
   assets — web fonts + the hero still decoding — then transitions out
   smoothly. Fails OPEN four ways:
     1. hard safety cap (never traps the user behind the overlay),
     2. if the image errors we stop waiting on it,
     3. the overlay is display:none unless HTML carries .is-first-visit,
     4. click or tap anywhere to immediately skip to content.
   ========================================================================== */

const SEEN = 'hfm-loaded-session';
const loader = document.getElementById('loader');
const isPreview = new URLSearchParams(window.location.search).has('preview-loader');

/* Not the homepage / no overlay, or already seen this session (and not in preview mode) → skip entirely. */
if (!loader || (!isPreview && sessionStorage.getItem(SEEN))) {
  if (loader) loader.remove();
  document.documentElement.classList.remove('is-first-visit');
  document.body.classList.remove('loading', 'intro');
} else {
  runLoader();
}

function runLoader() {
  document.body.classList.add('loading', 'intro');

  const bar = loader.querySelector('.loader-progress');
  const pct = loader.querySelector('.loader-pct');
  const status = loader.querySelector('.loader-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let progress = 0;
  const setP = (v) => {
    progress = Math.max(progress, Math.min(1, v));
    if (bar) bar.style.setProperty('--p', progress.toFixed(3));
    if (pct) pct.textContent = Math.round(progress * 100) + '%';
    if (status) {
      if (progress < 0.45) status.textContent = 'Crafting Sanctuary';
      else if (progress < 0.85) status.textContent = 'Preparing Gallery';
      else status.textContent = 'Sanctuary Ready';
    }
  };
  setP(0.08);

  /* ---- Tap / Click to skip instantly ---- */
  loader.addEventListener('click', () => dismiss(), { once: true });

  /* ---- Track fonts ---- */
  const fontReady = (document.fonts && document.fonts.ready)
    ? document.fonts.ready.then(() => setP(Math.max(progress, 0.55)))
    : Promise.resolve();

  /* ---- Track the hero still ---- */
  const still = document.getElementById('hero-still');
  let shotReady;
  if (still) {
    shotReady = new Promise((res) => {
      const done = () => { setP(Math.max(progress, 0.90)); res(); };
      if (still.complete) return done();
      still.addEventListener('load', done, { once: true });
      still.addEventListener('error', done, { once: true });
    });
  } else {
    shotReady = Promise.resolve();
  }

  /* ---- Gentle trickle so the bar never looks stuck on slow networks ---- */
  const trickle = setInterval(() => setP(progress + (1 - progress) * 0.06), 240);

  /* ---- Dismiss ---- */
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    clearInterval(trickle);
    setP(1);
    sessionStorage.setItem(SEEN, '1');

    // Let the bar reach 100% visibly, then lift the overlay
    setTimeout(() => {
      loader.classList.add('is-done');
      document.body.classList.remove('loading');
      requestAnimationFrame(() => document.body.classList.add('intro-run'));
      setTimeout(() => {
        loader.remove();
        document.documentElement.classList.remove('is-first-visit');
        document.body.classList.remove('intro');
      }, 1000);
    }, reduced ? 0 : 220);
  };

  /* Ready when both tracked assets resolve … */
  Promise.all([fontReady, shotReady]).then(() => setTimeout(dismiss, reduced ? 0 : 250));

  /* … or a safety cap (max 2.5s) so we never penalize slow mobile networks */
  setTimeout(dismiss, 2500);
}
