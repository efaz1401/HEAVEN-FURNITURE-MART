/* ==========================================================================
   Magnetic buttons + interactive hover fill — vanilla ports of the React
   components (MagneticButton / InteractiveHoverButton). No dependencies.

   1. MAGNETIC (all .btn and .btn-ar): the button leans toward the cursor
      while it's nearby, and springs back when the pointer leaves. The pull
      is proportional to how close the cursor is to the button's centre,
      capped so labels never detach from their fills.

   Both are pointer-fine only; touch devices keep plain taps (nothing to
   magnet toward), and prefers-reduced-motion disables them entirely.
   ========================================================================== */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const STRENGTH = 0.12;   // subtle, gentle tactile lean for senior comfort
const MAX_PULL = 4;       // px cap — prevents jitter and keeps buttons steady

/* ---- Magnetic lean ------------------------------------------------------- */
function bindMagnetic(btn) {
  let raf = null;
  const reset = () => {
    cancelAnimationFrame(raf);
    btn.style.setProperty('--mag-x', '0px');
    btn.style.setProperty('--mag-y', '0px');
  };
  btn.addEventListener('mousemove', (e) => {
    if (reduced) return;
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = (e.clientX - cx) * STRENGTH;
    let dy = (e.clientY - cy) * STRENGTH;
    dx = Math.max(-MAX_PULL, Math.min(MAX_PULL, dx));
    dy = Math.max(-MAX_PULL, Math.min(MAX_PULL, dy));
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      btn.style.setProperty('--mag-x', dx.toFixed(1) + 'px');
      btn.style.setProperty('--mag-y', dy.toFixed(1) + 'px');
    });
  });
  btn.addEventListener('mouseleave', reset);
  btn.addEventListener('blur', reset);
}

/* Interactive fill: retired from JS. The wash is a pure-CSS background
   swap now (base.css) — a JS-driven pseudo-element painted over raw
   text-node labels and hid them on hover. */

/* ---- Boot ------------------------------------------------------------------ */
function init() {
  document.querySelectorAll('.btn, .btn-ar').forEach((btn) => {
    if (finePointer && !reduced) bindMagnetic(btn);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
