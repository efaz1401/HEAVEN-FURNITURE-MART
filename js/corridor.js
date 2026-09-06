/* ==========================================================================
   The corridor — two mirrored rails of product cards rushing out of a
   vanishing point. Vanilla port of the ImageStreamHero React component
   (shadcn); no React, no Tailwind — the effect is generated CSS keyframes
   plus inline styles, so the port is near 1:1.

   Geometry notes (from the original):
   • Depth is authored as *apparent size*, geometrically — each card is a
     constant ratio bigger than the one behind it, so the ribbon stays solid
     at both ends of the loop.
   • The rails open hard then hold (fan > 1): the ribbon leaves the centre
     flat, bends once, then runs out on the diagonal.
   • Cards are born ACROSS the axis (negative railBirth) and die past the
     frame edge, so the centre never opens up and nothing needs to fade in.

   Site hardening added on top of the original:
   • IntersectionObserver pauses the corridor off-screen (battery).
   • save-data / 2G get a static strip instead of 18 image requests.
   • prefers-reduced-motion pauses mid-flight (a composed still, not a reset).
   ========================================================================== */

import { PIECES } from '../data/pieces.js';

const MOUNT = document.getElementById('corridor-canvas');
if (MOUNT) {
  /* No `reduced` constant here any more. It used to gate a branch that called
     build() either way — the pause is done by the @media rule build() writes
     into its own <style>, not by JS — so the variable read as if it changed
     something and did not. The behaviour is unchanged and documented at the
     keyframes block below. */
  const conn = navigator.connection || {};
  const saveData = conn.saveData === true || /(^|-)2g/.test(conn.effectiveType || '');

  const CARDS = 9;      // per rail; geometry tears below this
  const SPEED = 20;     // seconds, one card end-to-end
  const AXIS = 55;      // corridor axis, % of section height

  /* ---- Corridor geometry (all lengths in cqw = % of container width) ---- */
  const P = {
    perspective: 30, cardWidth: 18, cardHeight: 25,
    birthHeight: 2.6, exitHeight: 46,
    railBirth: -11, railExit: 44, fan: 3.3,
    turnBirth: 6, turnExit: 28, stops: 24,
  };

  function keyframes(dir, name) {
    const steps = [];
    for (let s = 0; s <= P.stops; s++) {
      const u = s / P.stops;
      const scale = (P.birthHeight / P.cardHeight) *
        Math.pow(P.exitHeight / P.birthHeight, u);
      const z = P.perspective * (1 - 1 / scale);
      const rail = P.railExit - (P.railExit - P.railBirth) * Math.pow(1 - u, P.fan);
      const turn = P.turnBirth + (P.turnExit - P.turnBirth) * u;
      steps.push(
        `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`
      );
    }
    return `@keyframes ${name}{${steps.join('')}}`;
  }

  /* ---- Product images from the single source of truth ---------------------
     Depth-relative, the same way js/chrome.js builds its prefix. This used to
     be an absolute `/assets/img/...`, which silently breaks the moment the
     site is served from a sub-path (a project page, a staging folder, a
     preview URL) — the corridor would run with 18 broken images and no error.

     CUT-OUTS, NOT THE MASTERS. This used to request `_512.webp`: the opaque
     photographs baked onto the retired OXBLOOD studio ground. Measured corners:
     rgb(124,3,19), rgb(103,1,10), rgb(145,17,31). Every other product surface
     on the site moved to transparent cut-outs in Phase 4, but the corridor was
     missed — so the most animated band on the homepage was the only one still
     wearing the palette the re-skin retired, and it streamed eighteen hot red
     rectangles through the middle of a disciplined blue-black opening. That,
     not the dark ground, is what made the opening read as playful.

     With alpha the cards now show the piece itself over the corridor's own
     #111219, so the stream reads as furniture moving through a dark room.
     Requires `object-fit: contain` on the card images (see build() below) —
     `cover` would crop away the 8% alpha margin scripts/make_cutouts.py adds
     and clip every silhouette's feet. */
  const R = '../'.repeat(Number(document.body.dataset.depth || 0));
  /* STILL `_cut_512`, AND THAT IS A MEASURED DECISION, NOT INERTIA.
     A srcset down to 128/256 was implemented and reverted. The cards look tiny in
     a still frame — 10 to 282px at 390px wide — so serving small files reads as
     an easy 482 KB saving. It is not: every card ANIMATES from the vanishing
     point to the front of the frame, so each one passes through every depth.
     Measured maximum width each card reaches, sampled over 5s:

       390px viewport   19 19 27 27 39 39 60 60 94 94 155 155 269 269 297 297 297 297
       1440px viewport  69 69 99 99 146 146 221 221 348 348 574 574 998 998 1065 ... 1067

     So the front cards need ~297px on a phone and ~1067px on a desktop, and the
     128px file they were picking would have been visibly soft at exactly the
     moment a card is largest and most looked at. Reverted rather than shipped.

     Worth knowing, separately: at 1440px the front cards render at 1067px from a
     512px file, so there is an EXISTING softness here. Adding a 1024w candidate
     would fix it and cost bytes on desktop — a quality call for the client, not a
     performance one, so it is not made here. */
  const images = PIECES.map((p) => `${R}assets/img/${p.id}_cut_512.webp`);
  /* JS-off is not a concern here (the whole corridor is JS-built), but a
     missing or rejected cut-out is: fall back to the opaque master per image
     rather than leaving a hole in the ribbon. */
  const fallbacks = PIECES.map((p) => `${R}assets/img/${p.id}_512.webp`);

  function build() {
    const uid = Math.random().toString(36).slice(2, 8);
    const right = `ish-r-${uid}`, left = `ish-l-${uid}`, card = `ish-c-${uid}`;

    const style = document.createElement('style');
    style.textContent =
      `${keyframes(1, right)}${keyframes(-1, left)}` +
      `@media (prefers-reduced-motion: reduce) {` +
      `.${card}{animation-play-state:paused !important}}`;
    MOUNT.appendChild(style);

    const scene = document.createElement('div');
    scene.style.cssText =
      `position:absolute;inset:0;perspective:${P.perspective}cqw;` +
      `perspective-origin:50% ${AXIS}%;pointer-events:none;`;
    const space = document.createElement('div');
    space.style.cssText = 'position:absolute;inset:0;transform-style:preserve-3d;';
    scene.appendChild(space);

    [right, left].forEach((name) => {
      for (let i = 0; i < CARDS; i++) {
        // Both rails walk the same sequence: the left mirrors the right at
        // every depth, so the corridor reads as one stream.
        const idx = i % images.length;
        const el = document.createElement('div');
        el.setAttribute('aria-hidden', 'true');
        el.className = card;
        el.style.cssText =
          `position:absolute;left:50%;top:${AXIS}%;` +
          `width:${P.cardWidth}cqw;height:${P.cardHeight}cqw;` +
          `margin-left:${-P.cardWidth / 2}cqw;margin-top:${-P.cardHeight / 2}cqw;` +
          /* No border-radius any more: it was rounding a photograph's corners.
             A cut-out has no corners to round — the silhouette IS the shape — so
             the radius would only clip the alpha margin. */
          `overflow:hidden;` +
          `animation:${name} ${SPEED}s linear infinite;` +
          `animation-delay:${-(i * SPEED) / CARDS}s;backface-visibility:hidden;`;
        const img = document.createElement('img');
        img.src = images[idx];
        img.alt = '';
        img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
        /* `contain`, not `cover`: cropping to fill would eat the 8% alpha margin
           make_cutouts.py pads each piece with and clip its feet. */
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        /* A missing cut-out must not leave a hole in the ribbon. `once` stops a
           failing fallback from re-entering. Clearing srcset first is required —
           a live srcset outranks src. */
        img.addEventListener('error', () => {
          img.src = fallbacks[idx];
          img.style.objectFit = 'cover';   /* the master is an opaque 4:3 photo */
        }, { once: true });
        el.appendChild(img);
        space.appendChild(el);
      }
    });
    MOUNT.appendChild(scene);

    /* Pause off-screen — the corridor animates only while visible. */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          space.querySelectorAll('.' + card).forEach((c) => {
            c.style.animationPlayState = en.isIntersecting ? 'running' : 'paused';
          });
        });
      }, { threshold: 0 });
      io.observe(MOUNT);
    }
  }

  /* ---- Boot: full corridor, static strip for save-data/2G, still for RM --
     THE BUILD IS DEFERRED UNTIL THE BAND IS NEAR THE VIEWPORT. The corridor sits
     roughly 1.9 screens down, so on a phone it is never visible at load, yet it
     used to issue its image requests immediately and compete with the hero for
     bandwidth. A visitor who reads the hero and leaves now pays nothing for it.

     This is not a visual change: the animation was already paused off-screen by
     the observer in build(), so the ribbon was at frame 0 when you scrolled to it
     either way. rootMargin gives it a screen of warning so the images are decoded
     before the band comes into view.

     Fails open — without IntersectionObserver it builds immediately, which is
     exactly the old behaviour. */
  function boot() {
    if (saveData) {
      // No 18-request stream for metered connections: three static product
      // photos, side by side, same dark band.
      const strip = document.createElement('div');
      strip.className = 'corridor-strip';
      [0, 6, 12].forEach((n) => {
        const img = document.createElement('img');
        img.src = images[n % images.length];
        img.alt = PIECES[n % PIECES.length].alt;
        img.loading = 'lazy';
        img.width = 400; img.height = 300;
        strip.appendChild(img);
      });
      MOUNT.appendChild(strip);
    } else {
      /* `reduced` used to branch here to the same call — build() pauses itself
         through the media query it writes, so the two arms were identical. */
      build();
    }
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      boot();
    }, { rootMargin: '50% 0px' });
    io.observe(MOUNT);
  } else {
    boot();
  }
}
