/* ==========================================================================
   Heaven Furniture Mart — cinematic section driver (js/cine.js)

   Powers the .cine section on the homepage:
   • Scroll-driven fluid fill: words and headlines fill up smoothly (left→right)
     as you scroll DOWN, and smoothly empty out (right→left) as you scroll UP.
   • Desktop (hover capable): mouseenter opens a row, mouseleave closes it.
   • Mobile / touch: tap opens; auto-closes after 5 s; tapping another row
     switches immediately (no double-close flash).
   • Fully respects prefers-reduced-motion.
   ========================================================================== */

const rows  = document.querySelectorAll('.cine-row');
const heads = document.querySelectorAll('.fluid-head');
const words = document.querySelectorAll('.cine-word');
const MOBILE_HOLD = 5000;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Set to the fill-loop's kick function once the loop exists, so the row
   accordion (open/close/ResizeObserver) can restart the animation even
   when no scroll event fires. */
let kickFill = () => {};

/* ---- Scroll-driven fluid fill (both headline & words) ------------------- */
const fluidItems = Array.from(document.querySelectorAll('.fluid-head, .cine-word'))
  .map((el) => {
    const fill = el.querySelector('.fill');
    return fill ? { el, fill, current: 0, target: 0 } : null;
  })
  .filter(Boolean);

if (fluidItems.length && !reduced) {
  function updateScrollTargets() {
    const vh = window.innerHeight;
    /* Starts filling when top of element enters 90% of viewport,
       reaches 100% filled when top is at 35% of viewport */
    const startY = vh * 0.90;
    const endY   = vh * 0.35;

    fluidItems.forEach((item) => {
      const rect = item.el.getBoundingClientRect();
      let p = (startY - rect.top) / (startY - endY);
      p = Math.max(0, Math.min(1, p));
      /* An open (hovered/tapped) row is always fully revealed — the fill is
         scroll-driven, but hover must not leave the word half-dark. */
      const rowEl = item.el.closest('.cine-row');
      if (rowEl && rowEl.dataset.open === 'true') p = 1;
      item.target = p;
    });
  }

  let rafId = null;
  function tick() {
    /* Recompute targets every frame so layout shifts that aren't scroll
       events — a row above expanding, fonts finishing, the intro — still
       settle the fills correctly. Six getBoundingClientRect calls per
       frame while the loop is alive; the loop stops once settled. */
    updateScrollTargets();
    let running = false;
    fluidItems.forEach((item) => {
      const diff = item.target - item.current;
      if (Math.abs(diff) > 0.001) {
        /* Silky liquid lerp factor */
        item.current += diff * 0.16;
        running = true;
      } else {
        item.current = item.target;
      }
      const insetPct = ((1 - item.current) * 100).toFixed(2);
      item.fill.style.setProperty('--fill-inset', insetPct + '%');
      item.fill.style.clipPath = 'inset(0 ' + insetPct + '% 0 0)';
    });

    if (running) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function onScroll() {
    if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  }
  kickFill = onScroll;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  /* Row expansion and font loading change heights without scrolling. */
  if ('ResizeObserver' in window) {
    const list = document.querySelector('.cine-list');
    if (list) new ResizeObserver(onScroll).observe(list);
  }
  /* Initial layout pass */
  onScroll();
} else if (reduced) {
  fluidItems.forEach((item) => {
    item.fill.style.setProperty('--fill-inset', '0%');
    item.fill.style.clipPath = 'inset(0 0 0 0)';
  });
}

/* ---- Row interaction (hover / tap accordion) ----------------------------- */
if (rows.length) {
  let openRow     = null;
  let mobileTimer = null;
  let openedAt    = 0;

  function openR(row) {
    if (openRow === row) return;
    closeR();
    openRow = row;
    openedAt = Date.now();
    row.dataset.open = 'true';
    const openBtn = row.querySelector('button');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    kickFill(); /* hovered row fills in, even without scrolling */
    /* Touch-only devices: a tap shouldn't leave the row open forever. */
    if (touchOnly && !reduced) {
      clearTimeout(mobileTimer);
      mobileTimer = setTimeout(closeR, MOBILE_HOLD);
    }
  }

  function closeR() {
    if (!openRow) return;
    openRow.dataset.open = 'false';
    const closedBtn = openRow.querySelector('button');
    if (closedBtn) closedBtn.setAttribute('aria-expanded', 'false');
    openRow = null;
    clearTimeout(mobileTimer);
    kickFill();
  }

  /* Pointer devices follow the mouse; touch-only devices get tap + auto-close.
     The old `min-width: 1025px` clause pushed mouse users on narrow windows
     and trackpad iPads into the touch branch, where rows hid themselves
     after 5 seconds. */
  const canHover  = matchMedia('(hover: hover)').matches;
  const touchOnly = matchMedia('(hover: none)').matches;

  /* Rows close when the pointer leaves the LIST, not each row: opening or
     closing a row shifts the layout under a stationary pointer, and per-row
     mouseleave would let the row under the pointer steal the open state
     back (hover flicker). Switching between rows happens via mouseenter;
     leaving the section closes everything. */
  if (canHover && rows[0].parentElement) {
    const list = rows[0].parentElement;
    list.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (![...rows].some((r) => r.matches(':hover'))) closeR();
      }, 80);
    });
  }

  rows.forEach((row) => {
    const btn = row.querySelector('button');
    if (!btn) return;

    if (canHover) {
      /* Desktop: follow the pointer. */
      row.addEventListener('mouseenter', () => openR(row));
    }

    /* Click toggles on touch devices and is a graceful fallback everywhere
       else (keyboard, hybrid tap). A tap on a touch device also fires an
       emulated mouseenter just before click, so ignore clicks within a
       short window of a pointer-open or they'd instantly close the row. */
    btn.addEventListener('click', () => {
      if (Date.now() - openedAt < 500) return;
      if (openRow === row) { closeR(); return; }
      openR(row);
    });
  });
}

