/* ==========================================================================
   V3 overlay menu — open/close, letter scramble, pointer-scrubbed giant list.

   Mechanics after tux.co/en:
   • the full-screen ink overlay opens behind the (still visible) pill bar
   • the giant thin-caps items deliberately overflow the viewport; on pointer
     devices the MOUSE scrubs the list (pointer Y → translateY, lerped).
     The wheel does nothing; body scroll is locked.
   • labels decode via a scramble effect on hover / on open.
   All of it fails soft: if this module dies, links still work.
   ========================================================================== */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const overlay = document.getElementById('ovmenu');
const btn     = document.getElementById('dots-btn');
const wrap    = document.querySelector('.ovlist-wrap');
const list    = document.getElementById('ovlist');

const SCRAMBLE = 'ABCDEFGHKMNPRSTUVWXYZ*#';
const EASE = 0.12;

if (overlay && btn) {
  let open = false;

  const setOpen = (v) => {
    open = v;
    overlay.classList.toggle('-open', v);
    overlay.setAttribute('aria-hidden', String(!v));
    btn.setAttribute('aria-expanded', String(v));
    document.body.classList.toggle('menu-locked', v);
    if (v) {
      if (!reduced) scrambleCorners();
      if (finePointer && !reduced) startScrub(); else stopScrub();
      const first = overlay.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else {
      stopScrub();
      btn.focus({ preventScroll: true });
    }
  };

  btn.addEventListener('click', () => setOpen(!open));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });
  overlay.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  /* ---- Letter scramble ----------------------------------------------------
     Scrambles every TEXT NODE inside `el` independently, in place, leaving the
     element's own markup untouched.

     This used to read and write `el.textContent`, which flattened children and
     broke two things the moment anything was hovered or the menu was opened:
       • .ovlist a wraps its label in <span class="ovi"> — the very element the
         pointer-scrub parallax transforms. Overwriting textContent deleted it,
         so hovering an item permanently killed that item's parallax.
       • .ov-tr contains the WhatsApp <a>, and all four corners use <br>.
         Flattening turned the phone number into dead text and collapsed
         the address's two lines into one run-on string.
     The pristine strings are cached on the node list (replacing the old
     data-phrase attribute) so repeat hovers scramble the real label rather
     than a half-scrambled one. */
  function textNodes(el) {
    if (el._scrambleNodes) return el._scrambleNodes;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeValue.trim()) nodes.push({ node: n, text: n.nodeValue });
    }
    el._scrambleNodes = nodes;
    return nodes;
  }

  function scrambleEl(el, dur = 320) {
    if (reduced || document.documentElement.lang === 'bn') return;
    const nodes = textNodes(el);
    if (!nodes.length) return;
    const start = performance.now();
    (function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      for (const { node, text } of nodes) {
        const settled = Math.floor(t * text.length);
        let out = text.slice(0, settled);
        for (let i = settled; i < text.length; i++) {
          out += text[i] === ' ' ? ' ' : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
        }
        node.nodeValue = out;
      }
      if (t < 1) requestAnimationFrame(frame);
      else for (const { node, text } of nodes) node.nodeValue = text;
    })(start);
  }

  function scrambleCorners() {
    document.querySelectorAll('.ovmenu .ov-corner, .ovlist a .ovi').forEach((el) => {
      scrambleEl(el, 380);
    });
  }

  /* hover decode on pill-bar links and giant items */
  document.querySelectorAll('.plink a, .ovlist a').forEach((a) => {
    textNodes(a);                    // cache the pristine label up front
    a.addEventListener('mouseenter', () => {
      if (!reduced) scrambleEl(a, 300);
    });
  });

  /* ---- Pointer-scrubbed list ---------------------------------------------- */
  let raf = null, target = 0, current = 0, overflow = 0;

  function measure() {
    if (window.innerWidth <= 900) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      list.style.transform = '';
      document.querySelectorAll('.ovlist .ovi').forEach((el) => { el.style.transform = ''; });
      overflow = 0;
      return;
    }
    overflow = Math.max(0, list.scrollHeight - wrap.clientHeight);
  }
  function frame() {
    current += (target - current) * EASE;
    list.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0)`;
    if (Math.abs(target - current) > 0.1) raf = requestAnimationFrame(frame);
    else raf = null;
  }
  function onMove(e) {
    if (window.innerWidth <= 900) return;
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, e.clientY / vh));
    target = -overflow * p;
    /* micro-parallax: neighbouring items drift a few px apart, like tux */
    document.querySelectorAll('.ovlist a .ovi').forEach((el, i) => {
      el.style.transform = `translate3d(0, ${((i % 3) - 1) * (p - 0.5) * 10}px, 0)`;
    });
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function startScrub() {
    measure();
    current = target = 0;
    /* window-level: the pointer scrubs from anywhere over the overlay,
       even when a corner label or the pill bar sits under the cursor. */
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', measure);
  }
  function stopScrub() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('resize', measure);
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    list.style.transform = '';
    document.querySelectorAll('.ovlist .ovi').forEach((el) => { el.style.transform = ''; });
  }
}
