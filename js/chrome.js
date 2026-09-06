/* ==========================================================================
   Heaven Furniture Mart — shared chrome (header, overlay menu, footer, quote pill).
   Injected on every page except the homepage so the shell lives in ONE place.

   `data-depth` on <body> says how far the page is from the site root, e.g.
   "collections/" is 1, "piece/royal_sofa/" is 2. All chrome links are built
   from that prefix so the same markup works at any depth.

   NOTE: sitemap.xml lists every URL so crawlers get a complete link graph
   regardless of how the chrome is rendered.
   ========================================================================== */

const depth = parseInt(document.body.dataset.depth || '0', 10);
const R = depth === 0 ? '' : '../'.repeat(depth);

const AR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>';
const CART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 5h2.2l2.1 10.4a1.6 1.6 0 001.6 1.3h8.4a1.6 1.6 0 001.6-1.3L21 8H7"/><circle cx="10.5" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>';
const SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21"/></svg>';
const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
const MARK_SVG = '<svg class="hfm-mark" viewBox="0 0 64 64" width="20" height="20" aria-hidden="true"><g class="hfm-mark-joint" fill="currentColor"><rect x="10" y="12" width="3" height="40"/><rect x="34" y="12" width="3" height="40"/><rect x="10" y="30" width="37" height="3"/></g><rect class="hfm-mark-peg" x="41" y="26" width="3" height="11" fill="var(--primary)"/></svg>';

/* The one number, from data/pieces.js. This module deliberately imports nothing so
   the chrome can never be delayed by the catalogue, which is why the digits are
   repeated here instead of read from WHATSAPP — and why tests/data-contract.test.js
   asserts the two are identical. Hardcoding WITHOUT that assertion is what left 21
   stale copies across the site when the real number arrived. */
const WA = '8801960481983';
const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

/* Names the PIECE the request came from — and only a piece. Deriving the name from
   document.title alone read well on /piece/… and produced "I'd like a quote for the
   Your cart." on /cart/ and "for the Collections." on /collections/. #piece-root is
   the hook every product page carries, so the test is "am I on a product page", not
   "does my title happen to look like a product name". */
function quoteMessage() {
  const onPiece = !!document.getElementById('piece-root');
  const name = onPiece ? (document.title || '').split(' — ')[0].trim() : '';
  return name
    ? `Hello Heaven Furniture Mart. I'd like a quote for the ${name}.`
    : "Hello Heaven Furniture Mart. I'd like a quote, please.";
}

const NAV = [
  ['collections/', 'Collections'],
  ['bespoke/', 'Bespoke'],
  ['materials/', 'Materials'],
  ['showroom/', 'Showroom'],
  ['about/', 'About'],
];

/* Giant items in the full-screen overlay — deliberately includes Contact,
   which the pill bar reaches only through the footer and the overlay. */
const MENU = [
  ['collections/', 'Collections'],
  ['bespoke/', 'Bespoke'],
  ['materials/', 'Materials'],
  ['showroom/', 'Showroom'],
  ['about/', 'About'],
  ['contact/', 'Contact'],
];

/* ---- Header: reference bar at rest, floating glass pill once scrolled ----- */
const head = document.createElement('header');
head.className = 'pill-head';
head.innerHTML = `
  <a class="pill-brand" href="${R || '/'}" aria-label="Heaven Furniture Mart">${MARK_SVG}<span class="pb-long">Heaven Furniture Mart</span><span class="pb-mono" aria-hidden="true">HFM</span></a>
  <nav class="pill-nav" aria-label="Main">
    ${NAV.map(([h, t]) => `<span class="plink"><a href="${R}${h}">${t}</a></span>`).join('')}
    <a class="pill-cta" href="${R}ar/">${AR_SVG} See it in your room</a>
    <button class="pill-util" id="search-btn" type="button"
            aria-expanded="false" aria-controls="psearch" aria-label="Search pieces">
      ${SEARCH_SVG}
    </button>
    <a class="pill-util pill-cart" href="${R}cart/" aria-label="Cart is empty" data-cart-label>
      ${CART_SVG}<span class="cart-count" data-cart-count hidden></span>
    </a>
    <button class="pill-lang" id="lang-btn" type="button" aria-label="Switch language / ভাষা পরিবর্তন">বাংলা</button>
    <button class="dots-btn" id="dots-btn" aria-expanded="false" aria-controls="ovmenu" aria-label="Menu">
      <span class="dots-inner"><i></i><i></i><i></i><i></i></span>
    </button>
  </nav>`;

/* ---- Full-screen overlay menu -------------------------------------------- */
const menu = document.createElement('div');
menu.className = 'ovmenu';
menu.id = 'ovmenu';
menu.setAttribute('aria-hidden', 'true');
menu.innerHTML = `
  <p class="ov-corner ov-tl">Agrabad Access Road<br>Chattogram — Bangladesh<br><a href="mailto:heavenfurnituremart@gmail.com" style="text-transform:lowercase;letter-spacing:normal">heavenfurnituremart@gmail.com</a></p>
  <p class="ov-corner ov-tr"><a href="https://wa.me/8801960481983">+880 1960-481983</a><br>WhatsApp us any day</p>
  <p class="ov-corner ov-bl">Designed. Crafted. Customized.<br>Made to order, 2–12 weeks</p>
  <p class="ov-corner ov-br">
    <a href="https://facebook.com/HeavenFurnitureMart" rel="me">Facebook</a><br>
    <a href="https://instagram.com/heaven_furniture_ltd" rel="me">Instagram</a><br>
    <a href="https://youtube.com/@HeavenFurnitureMart" rel="me">YouTube</a>
  </p>
  <div class="ovlist-wrap">
    <ul class="ovlist" id="ovlist">
      <li class="ov-item-lang"><button class="ov-lang-btn" id="ov-lang-btn" type="button" aria-label="Switch language / ভাষা পরিবর্তন"><span class="ovi">বাংলা</span></button></li>
      ${MENU.map(([h, t]) => `<li><a href="${R}${h}"><span class="ovi">${t}</span></a></li>`).join('')}
    </ul>
  </div>`;

/* The five collections, used twice below: the footer column and the pipe rail.
   Kept as a literal rather than imported from data/pieces.js — this module
   loads on all 32 non-home pages and stays deliberately dependency-free, so
   the chrome can never be delayed by the catalogue. */
const COLLECTIONS = [
  ['collections/living-room/', 'Living Room'],
  ['collections/bedroom/', 'Bedroom'],
  ['collections/dining/', 'Dining'],
  ['collections/office/', 'Office &amp; Study'],
  ['collections/bespoke/', 'Bespoke'],
];

/* ---- Footer ------------------------------------------------------------- */
const foot = document.createElement('footer');
foot.className = 'site-foot';
foot.innerHTML = `
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <h4>Heaven Furniture Mart</h4>
        <p style="color:var(--on-dark-mute);font-size:var(--fs-small)">Bespoke furniture and interior styling, designed and crafted in Chattogram.</p>
        <ul class="foot-social" aria-label="Heaven Furniture Mart on social media">
          <li><a href="https://facebook.com/HeavenFurnitureMart" rel="me" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg></a></li>
          <li><a href="https://instagram.com/heaven_furniture_ltd" rel="me" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg></a></li>
          <li><a href="https://youtube.com/@HeavenFurnitureMart" rel="me" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a></li>
        </ul>
      </div>
      <div>
        <h4>Collections</h4>
        <ul>
          ${COLLECTIONS.map(([h, t]) => `<li><a href="${R}${h}">${t}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h4>Visit</h4>
        <ul>
          <li><a href="${R}showroom/">Showroom &amp; directions</a></li>
          <li><a href="${R}materials/">Materials library</a></li>
          <li><a href="${R}ar/">See it in your room</a></li>
          <li><a href="${R}cart/">Your cart</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="${R}contact/">Book a consultation</a></li>
          <li><a href="https://wa.me/8801960481983">WhatsApp us</a></li>
          <li><a href="mailto:heavenfurnituremart@gmail.com">Email us</a></li>
          <li><a href="${R}about/">About</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-base">
      <span>© <span data-year>2026</span> Heaven Furniture Mart</span>
      <span>Chattogram, Bangladesh</span>
    </div>
  </div>
  <div class="foot-rail">
    <div class="wrap">
      <ul>
        ${COLLECTIONS.map(([h, t]) => `<li><a href="${R}${h}">${t}</a></li>`).join('\n        ')}
        <li><a href="${R}collections/">All pieces</a></li>
      </ul>
    </div>
    <div class="foot-brand" aria-hidden="true">
      <span class="foot-brand--full">HEAVEN FURNITURE MART</span>
      <span class="foot-brand--short">HFM</span>
    </div>
  </div>`;

/* ---- The floating quote button ------------------------------------------
   THIS REPLACED THE MOBILE DOCK, and the swap is a conversion decision rather than
   a layout one. The dock was four competing actions — Collections, See in your room,
   Cart, WhatsApp — pinned across the bottom of every phone screen, and the brief asks
   for one clear action repeated instead of five competing ones.

   Nothing became unreachable. Below 900px the header already carries the cart, the
   search and the overlay menu, and the overlay lists all six destinations including
   AR, so every dock item still has a home. Removing the bar also gave back the 80px
   of body padding it reserved on every mobile page.

   A real <a href>, not a button: it works with JavaScript disabled, it can be opened
   in a new tab, and long-press gives the phone's own share sheet. The message names
   the page it was pressed from, so a quote request arrives with context instead of
   "hi". ------------------------------------------------------------------------- */
const quote = document.createElement('a');
quote.className = 'quote-fab';
quote.id = 'quote-fab';
quote.href = waLink(quoteMessage());
quote.setAttribute('aria-label', 'Request a quote on WhatsApp');
quote.innerHTML = `${WA_SVG}<span class="quote-fab-label"><span class="qf-hide-sm">Quote on </span>WhatsApp</span>`;

/* body:has() fallback — older browsers get the reserved space via a class. */
if (!CSS.supports || !CSS.supports('selector(body:has(.pill-head))')) {
  document.body.classList.add('has-pill');
}

const main = document.getElementById('main');
document.body.insertBefore(head, main);
document.body.insertBefore(menu, main);
document.body.appendChild(foot);

/* ---- ...but NOT on the three funnel pages -------------------------------
   The pill is "one clear action repeated", which is exactly right on a
   browsing page and exactly wrong once the visitor is already converting:
   on /cart/, /checkout/ and /thanks/ the page's own primary button IS the
   WhatsApp handoff, so the pill stops being a shortcut and becomes a second
   button competing with it.

   It was also physically in the way. On the empty cart the pill sits on top
   of "Browse the collection" — the only control on the screen — because that
   state is short, so the button lands in the bottom-right corner the pill
   owns. --fab-clear only ever reserved space in the FOOTER, which a short
   page never reaches.

   Detected by DOM feature, not location.pathname, for the same reason
   quoteMessage() checks for #piece-root and R is built from data-depth: the
   site has to survive being served from a sub-path (staging folder, preview
   URL, project page), and a pathname test silently breaks there. */
const inFunnel = !!document.querySelector('#cart-list, #co-form, #ty-order');
if (!inFunnel) document.body.appendChild(quote);

/* Chrome must exist before shell.js wires shared behaviour; menu.js adds the
   overlay interactions. Dynamic imports resolve in order, so no await is
   needed — and avoiding top-level await keeps the whole file parseable on
   browsers older than Safari 15 / Chrome 89, where it would silently kill
   the nav entirely. */
import('./shell.js');
import('./menu.js');
import('./magnetic.js');
import('./search.js');
