/* ==========================================================================
   THE WORKSHOP FILM — click-to-play.

   History matters here: this module used to autoplay the hero video at the top
   of the homepage. That cost 12.19 MB (desktop) / 7.68 MB (mobile) on first
   paint, for a background loop most visitors scrolled past. The film is now a
   deliberate act — a poster with a play control in §8 — so it costs 0 bytes
   until someone asks for it. The hero is 3D geometry instead (js/hero3d.js).

   ONE FILE FOR EVERY SCREEN. There used to be two — a portrait cut served to
   portrait viewports and a landscape cut to everything else, chosen here in JS
   because `media` attributes on <source> inside <video> are ignored by browsers.
   The portrait file has been retired at the client's request: the workshop footage
   is framed landscape, and the cropped vertical version showed less of the room
   than the same film letterboxed does.

   The cost of that is honest and worth stating: a phone that presses play now
   fetches the 11.9 MB desktop file instead of a 7.5 MB portrait one. It is still
   0 bytes until someone asks, and re-encoding the single remaining file is the
   documented next step in PERF-AUDIT.md.

   Gone with it: the resize swap that preserved currentTime across an orientation
   change. With one source there is nothing to swap, so rotating a phone no longer
   touches the video at all — which is strictly better than reloading it.

   What is gone, deliberately: the save-data / 2G / reduced-motion gate. Those
   guard against spending a user's bytes WITHOUT being asked. Here the user
   asked — tapping play is explicit consent, and silently refusing it would be
   the worse failure. (js/hero3d.js still carries that gate, because the 3D
   hero does load unprompted.)

   Fails soft: the control is a real <a href> to the file, so with this module
   dead or JS off it still plays — just in the browser's own viewer.
   ========================================================================== */

const film = document.getElementById('film');
const video = document.getElementById('film-video');
const play = document.getElementById('film-play');

if (film && video && play) {
  let started = false;

  const label = (playing) => {
    play.setAttribute('aria-label', playing ? 'Pause the workshop film' : 'Play the workshop film');
    film.dataset.playing = String(playing);
  };

  const start = () => {
    const src = video.dataset.src || '';
    if (!src) return;
    started = true;
    video.preload = 'auto';
    video.src = src;
    film.dataset.mode = 'play';
    video.play().then(() => label(true)).catch(() => label(false));
  };

  play.addEventListener('click', (e) => {
    e.preventDefault();                /* the href is the no-JS fallback */
    if (!started) return start();
    if (video.paused) { video.play().then(() => label(true)).catch(() => {}); }
    else { video.pause(); label(false); }
  });

  /* Clicking the frame itself toggles too, once the film is running. */
  video.addEventListener('click', () => {
    if (!started) return;
    if (video.paused) { video.play().then(() => label(true)).catch(() => {}); }
    else { video.pause(); label(false); }
  });

  video.addEventListener('pause', () => label(false));
  video.addEventListener('playing', () => label(true));

  /* A file that 404s or won't decode must give the poster back rather than
     leave a black rectangle with a dead control. */
  video.addEventListener('error', () => {
    started = false;
    delete film.dataset.mode;
    label(false);
    play.removeAttribute('aria-label');
    play.title = 'Film unavailable — opens in a new tab';
  }, { once: true });

}
