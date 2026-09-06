/* Inline each page's above-the-fold CSS and take the six sheets off the
 * critical path.  Plan §2.3.
 *
 * WHY, WITH THE NUMBER. _ref/probe-css-critical-path.mjs measures a 390x844
 * phone on slow 4G + 4x CPU with the sheets served normally, then again with
 * them fulfilled from memory so CSS costs nothing:
 *
 *     homepage    FCP 1308ms -> 688ms
 *     piece page  FCP 1216ms -> 532ms
 *
 * That ~620-680ms gap is the ceiling this script chases. It is not the 61 KB
 * itself — it is that six render-blocking requests have to finish before the
 * browser may paint a single pixel, on top of the HTML they were discovered in.
 *
 * HOW THE CRITICAL SET IS CHOSEN. Per page, at 390x844 and again at 1440x900,
 * collect every element whose border box intersects the first viewport, plus
 * every position:fixed element (the header outlives any scroll position), plus
 * the document root. Then walk every CSSRule and keep it if any of those
 * elements matches it. The union of the two viewports is kept, with @media
 * wrappers intact, so a desktop-only rule stays inert on a phone.
 *
 * WHAT IS ALWAYS KEPT, regardless of matching:
 *   - @font-face. Dropping it would paint in the fallback face and swap, which
 *     is the 0.2317 CLS that scripts/use-local-fonts.py was written to kill.
 *   - @keyframes named by a kept animation. A kept rule that starts at
 *     opacity:0 and is revealed only by its animation would otherwise paint
 *     nothing at all until the deferred CSS lands.
 *   - prefers-reduced-motion blocks whose selectors were kept. headless Chrome
 *     reports no-preference, so these never match here; shipping motion to
 *     someone who asked for none, even for 500ms, is not a tradeoff worth making.
 *
 * WHAT THIS DOES NOT DO. It does not minify beyond whitespace collapsing, and
 * it does not touch the sheets on disk. Below-the-fold styling is unchanged and
 * arrives with the deferred load.
 *
 * KEEPING IT HONEST. The inline block is generated, not authored — it is stale
 * the moment any of css/*.css changes. `--check` hashes the six sheets and
 * compares against the stamp written into each page, and exits non-zero if a
 * page is out of date. Run it after bump-css-version.py, in the same breath.
 *
 *     node scripts/build-critical-css.mjs [--check] [--only /piece/]
 *
 * Needs the dev server on :8082 (one is usually already up — do not start a second).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'http://localhost:8082';
const SHEETS = ['fonts.generated', 'tokens', 'base', 'pages', 'experience', 'nav'];

const check = process.argv.includes('--check');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

/* Stamped into each page so --check can tell "regenerated" from "stale". */
const cssHash = createHash('sha1')
  .update(SHEETS.map((s) => readFileSync(join(ROOT, 'css', `${s}.css`))).reduce((a, b) => Buffer.concat([a, b])))
  .digest('hex').slice(0, 12);

const CATS = ['living-room', 'bedroom', 'dining', 'office', 'bespoke'];
const PIECES = [
  'royal_blue_gold_luxury_sofa_pair', 'minimalist_cream_modular_sectional_sofa',
  'classic_wooden_cream_cushion_sofa_set', 'luxury_wooden_bed_teal_velvet_headboard',
  'majesty_glame_emerald_green_velvet_bed', 'royal_navy_gold_velvet_bed',
  'white_wooden_panel_bed', 'royal_gold_carved_dining_chair',
  'carved_wooden_glass_display_showcase', 'luxury_cream_gold_glass_showcase',
  'luxury_marble_dining_table_leather_chairs', 'luxury_cream_marble_dining_table_set',
  'luxury_carved_dining_table_cream_chairs', 'executive_brown_leather_tufted_chair',
  'executive_black_leather_tufted_chair', 'executive_black_padded_wood_chair',
  'ergonomic_black_mesh_highback_chair', 'minimalist_black_gold_shoe_cabinet',
];
/* /room/ is a redirect stub with no styling of its own; loading it lands on
   /cart/ and would write the cart's critical CSS into the wrong file. */
const ROUTES = [
  '/', '/collections/', ...CATS.map((c) => `/collections/${c}/`),
  ...PIECES.map((p) => `/piece/${p}/`),
  '/ar/', '/bespoke/', '/materials/', '/showroom/', '/about/', '/contact/',
  '/cart/', '/checkout/', '/thanks/', '/404.html',
].filter((r) => !only || r.includes(only));

const fileFor = (route) => join(ROOT, route.endsWith('.html') ? route.slice(1) : route.slice(1) + 'index.html');

/* ------------------------------------------------------------------ extract */

/* Two passes over one page, not two separate renders.
 *
 * The first cut of this script extracted at 390 and again at 1440 and
 * concatenated the results. That is wrong twice over. Order: the 1440 chunk's
 * base.css rules landed after the 390 chunk's nav.css rules, so any two
 * equal-specificity rules that disagreed resolved backwards. And completeness:
 * see MARK below.
 *
 * So mark the critical elements at each viewport with a data attribute, then
 * emit ONCE, walking the sheets in their real order and keeping any rule that
 * matches a marked element. Source order is preserved by construction.
 */

/* Tag every element that is critical at the CURRENT viewport, and report which
 * @media conditions apply here so the emit pass can union them.
 *
 * WHY display:none ELEMENTS ARE COLLECTED. The obvious critical set is
 * "everything with a box in the first viewport", and it is subtly, visibly
 * wrong: an element hidden at this breakpoint has no box, so it is skipped, so
 * the rule that hides it is never kept — and the critical-only render shows it.
 * Measured on a piece page at 390px, that put the desktop brand wordmark, the
 * full nav and the entire desktop QR handoff block on screen, 10.28% of the
 * viewport differing from the real render. Hidden elements need their hiding
 * rule more than visible ones need their styling.
 *
 * Their descendants do not: nothing under display:none paints, so the subtree
 * root is taken and the rest skipped, which is what keeps this from dragging
 * the whole overlay menu in behind it.
 */
const MARK = () => {
  const vh = window.innerHeight;
  const crit = new Set([document.documentElement, document.body]);
  const skip = new WeakSet();

  for (const el of document.querySelectorAll('*')) {
    if (skip.has(el)) { for (const d of el.children) skip.add(d); continue; }
    const cs = getComputedStyle(el);
    if (cs.display === 'none') {
      let p = el.parentElement;
      while (p && getComputedStyle(p).display === 'none') p = p.parentElement;
      if (p && crit.has(p)) crit.add(el);
      for (const d of el.children) skip.add(d);
      continue;
    }
    /* Fixed elements outlive any scroll position, so the header is always
       above the fold no matter where the reader is. */
    if (cs.position === 'fixed') { crit.add(el); continue; }
    const r = el.getBoundingClientRect();
    /* One screen PAST the fold, not up to it. Content below the fold still moves
       content above it whenever the two share a layout context: on /about/ the
       right-hand column of a .media-split grid runs to 1.3 screens, its unstyled
       tail made the row 16px taller, and the photograph beside it — half of it
       on screen — slid down by that much the moment the deferred sheets landed.
       A visible element that moves is CLS, which is the one thing this whole
       exercise is not allowed to trade away.
       No width/height floor either: a zero-height wrapper still carries the
       rules that make it zero-height. */
    if (r.bottom >= 0 && r.top <= vh * 2) crit.add(el);
  }
  for (const el of crit) {
    if (!el.setAttribute) continue;
    el.setAttribute('data-crit', '');
    /* Remember where it sits. Scripts tear elements down between MARK and
       EXTRACT — js/loader.js:88 removes #loader 1200ms after the intro ends —
       and a detached node takes its data-crit with it, so every #loader rule
       silently vanished from the homepage and a first-time visitor got an
       unstyled 54px block above the hero. EXTRACT puts them back before it
       matches, because an ancestor-dependent selector such as
       `body:not(.loading) #loader` cannot resolve against a detached node. */
    if (el.parentElement) {
      (window.__critRestore ||= []).push([el, el.parentElement, el.nextElementSibling]);
    }
  }

  const media = new Set();
  const scan = (rules) => {
    for (const rule of rules) {
      if (rule.constructor.name === 'CSSMediaRule') {
        const cond = rule.conditionText || rule.media.mediaText;
        if (window.matchMedia(cond).matches) media.add(cond);
        scan(rule.cssRules);
      } else if (rule.cssRules) scan(rule.cssRules);
    }
  };
  for (const s of document.styleSheets) {
    if (!s.href || !s.href.includes('/css/')) continue;
    try { scan(s.cssRules); } catch { /* cross-origin */ }
  }
  return [...media];
};

/* Emit. `applicable` is the union of media conditions that matched at either
 * viewport; anything outside it is a breakpoint neither reader will hit.
 *
 * DECLARATIONS COME FROM THE RAW FILE, NOT FROM THE CSSOM. Two attempts to read
 * them back through Chrome's object model both lost data on the same rule:
 *
 *     .piece-figure, .stage, .room-item img, .media-split img {
 *       background: var(--product-bg);
 *       background-color: var(--paper);
 *     }
 *
 * A var() in a shorthand followed by a longhand of the same family leaves the
 * shorthand unreconstitutable, so Chrome serialises the var-dependent longhands
 * as pending substitutions — the empty string. Both rule.style.cssText and
 * rule.cssText hand back a literal `background-image:;background-size:;...`,
 * and the soft ground under every product photograph disappears. There is no
 * CSSOM property that survives this, so the sheets are re-fetched (from cache)
 * and tokenised. These files are flat: no nesting, no @layer, no @import, at
 * most one level of @media/@supports — checked before writing the tokeniser.
 */
const EXTRACT = async (applicable) => {
  const ok = new Set(applicable);
  /* Re-attach anything a script removed since MARK, in its original slot, so
     descendant selectors resolve. This is the last thing to touch the DOM before
     the context is thrown away, so restoring costs nothing. */
  for (const [el, parent, next] of window.__critRestore || []) {
    if (el.isConnected || !parent.isConnected) continue;
    try { parent.insertBefore(el, next && next.isConnected ? next : null); } catch { /* moved */ }
  }
  const crit = [...document.querySelectorAll('[data-crit]')];

  /* matches() throws on pseudo-elements and never fires for state pseudos, so
     strip both and match the base selector. A :hover rule on an above-the-fold
     button is worth its handful of bytes. */
  const DYNAMIC = /::?(?:before|after|placeholder|selection|marker|backdrop|-webkit-[a-z-]+|hover|focus-visible|focus-within|focus|active|visited|target)\b(?:\([^)]*\))?/g;
  const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';
  const matchesAny = (sel) => {
    const base = sel.replace(DYNAMIC, '').trim() || '*';
    if (isHomepage && (base.includes('#loader') || base.includes('loader-') || base.includes('is-first-visit') || base.includes('sheen-text'))) return true;
    try { return crit.some((el) => el.matches(base)); } catch { return true; }
  };
  /* Selector lists cannot be split on a bare comma — :is(a,b) and [x=","]
     both contain one. Track depth and quoting. */
  const splitSelector = (s) => {
    const out = []; let depth = 0, q = null, buf = '';
    for (const ch of s) {
      if (q) { buf += ch; if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") { q = ch; buf += ch; continue; }
      if (ch === '(' || ch === '[') depth++;
      if (ch === ')' || ch === ']') depth--;
      if (ch === ',' && depth === 0) { out.push(buf); buf = ''; continue; }
      buf += ch;
    }
    if (buf.trim()) out.push(buf);
    return out.map((x) => x.trim()).filter(Boolean);
  };

  /* Quote-aware, so a comment marker inside content:"/*" cannot truncate the
     file. Done once up front and the tokeniser below never sees a comment. */
  const stripComments = (css) => {
    let out = '', q = null;
    for (let i = 0; i < css.length; i++) {
      const ch = css[i];
      if (q) { out += ch; if (ch === '\\') { out += css[++i] ?? ''; } else if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") { q = ch; out += ch; continue; }
      if (ch === '/' && css[i + 1] === '*') {
        const end = css.indexOf('*/', i + 2);
        i = end < 0 ? css.length : end + 1;
        out += ' ';
        continue;
      }
      out += ch;
    }
    return out;
  };

  /* [{ prelude, body }] — body is null for statement at-rules. */
  const parse = (css) => {
    const nodes = [];
    let i = 0;
    while (i < css.length) {
      while (i < css.length && /\s/.test(css[i])) i++;
      if (i >= css.length) break;
      const start = i;
      let depth = 0, q = null, stop = -1;
      for (; i < css.length; i++) {
        const ch = css[i];
        if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
        if (ch === '"' || ch === "'") { q = ch; continue; }
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (depth === 0 && (ch === '{' || ch === ';')) { stop = i; break; }
      }
      if (stop < 0) break;
      const prelude = css.slice(start, stop).trim();
      if (css[stop] === ';') { i = stop + 1; nodes.push({ prelude, body: null }); continue; }
      const bodyStart = stop + 1;
      let bd = 1;
      q = null;
      for (i = bodyStart; i < css.length && bd > 0; i++) {
        const ch = css[i];
        if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
        if (ch === '"' || ch === "'") { q = ch; continue; }
        if (ch === '{') bd++;
        else if (ch === '}') bd--;
      }
      nodes.push({ prelude, body: css.slice(bodyStart, i - 1) });
    }
    return nodes;
  };

  const usedAnimations = new Set();
  const keyframes = new Map();

  /* THE ONE THING THAT SILENTLY BREAKS THIS WHOLE SCRIPT.
     A url() inside a stylesheet resolves against the stylesheet. Move that same
     text into a <style> in the document and it resolves against the PAGE. So
     fonts.generated.css's url("../assets/fonts/inter-tight-latin.woff2"), which
     means /assets/fonts/... from /css/, becomes /piece/assets/fonts/... once
     inlined into /piece/<slug>/index.html — a 404 for every font on all 18
     piece pages, and the fallback-face swap this site self-hosts fonts to avoid.
     Re-root every relative url() to an absolute path so depth stops mattering.
     Quoted forms are matched whole because SVG data URIs contain ')'. */
  const URL_FN = /url\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^)\s]*))\s*\)/g;
  const reroot = (text, sheetHref) => text.replace(URL_FN, (m, dq, sq, bare) => {
    const u = dq ?? sq ?? bare ?? '';
    if (!u || /^(?:data:|https?:|\/\/|#|\/)/i.test(u)) return m;
    try { return `url("${new URL(u, sheetHref).pathname}")`; } catch { return m; }
  });

  const walk = (nodes) => {
    const out = [];
    for (const { prelude, body } of nodes) {
      if (body === null) continue;                       // @charset and friends
      if (prelude.startsWith('@media')) {
        const cond = prelude.slice(6).trim();
        /* headless Chrome always reports no-preference, so a reduced-motion
           block never appears in `applicable`. Shipping motion to someone who
           asked for none, even for half a second, is not a trade worth making. */
        if (!ok.has(cond) && !/prefers-reduced-motion/.test(cond)) continue;
        const inner = walk(parse(body));
        if (inner.length) out.push(`@media ${cond}{${inner.join('')}}`);
        continue;
      }
      if (prelude.startsWith('@supports')) {
        const inner = walk(parse(body));
        if (inner.length) out.push(`${prelude}{${inner.join('')}}`);
        continue;
      }
      if (prelude.startsWith('@font-face')) { out.push(`@font-face{${body}}`); continue; }
      if (/^@(?:-webkit-)?keyframes/.test(prelude)) {
        keyframes.set(prelude.split(/\s+/).pop(), `${prelude}{${body}}`);
        continue;
      }
      if (prelude.startsWith('@')) continue;             // @page, @property, ...
      const kept = splitSelector(prelude).filter(matchesAny);
      if (!kept.length || !body.trim()) continue;
      const anim = body.matchAll(/\banimation(?:-name)?\s*:\s*([^;]+)/g);
      for (const m of anim) for (const w of m[1].split(/[\s,]+/)) if (w) usedAnimations.add(w);
      out.push(`${kept.join(',')}{${body.trim()}}`);
    }
    return out;
  };

  /* Filter on the RESOLVED href, not the attribute. An attribute selector such
     as [href*="/css/"] silently misses the homepage, whose links are written
     "css/tokens.css?v=33" with no leading ../ — it emitted an empty <style> next
     to six now-non-blocking sheets, i.e. a fully unstyled first paint. The .href
     property is always absolute, so /css/ is present on every page. Document
     order is preserved, which is what makes the cascade come out right. */
  const parts = [];
  const links = [...document.querySelectorAll('link')]
    .filter((l) => /\/css\/[^/]+\.css/.test(l.href));
  if (links.length !== 6) throw new Error(`expected 6 stylesheets, found ${links.length}`);
  for (const link of links) {
    const href = link.href;
    const res = await fetch(href);
    if (!res.ok) throw new Error(`${href} -> ${res.status}`);
    const text = await res.text();
    parts.push(...walk(parse(stripComments(text))).map((t) => reroot(t, href)));
  }
  /* A kept rule that starts at opacity:0 and is revealed only by its animation
     would otherwise paint nothing until the deferred sheets land. */
  for (const [name, text] of keyframes) if (usedAnimations.has(name)) parts.push(text);
  return parts.join('\n');
};

/* --------------------------------------------------------------- html patch */

const OPEN = '<!-- critical css: generated by scripts/build-critical-css.mjs';
const CLOSE = '<!-- /critical css -->';
const BLOCK = new RegExp(`[ \\t]*${OPEN}[\\s\\S]*?${CLOSE}\\r?\\n`, 'g');
/* The blocking form inline-head-links.py writes, and the deferred form this
   script replaces it with. Both are recognised so a rerun is a no-op. The
   deferred pattern matches with or without the onload/onerror hooks so an
   older generated page is still recognised and cleanly replaced. */
const BLOCKING = /^[ \t]*<link rel="stylesheet" href="([^"]*css\/(?:fonts\.generated|tokens|base|pages|experience|nav)\.css\?v=\d+)">[ \t]*\r?\n/gm;
const DEFERRED = /^[ \t]*<link rel="preload" as="style" href="([^"]*css\/(?:fonts\.generated|tokens|base|pages|experience|nav)\.css\?v=\d+)"[^>]*>[ \t]*\r?\n/gm;
const NOSCRIPT = /^[ \t]*<noscript>(?:<link rel="stylesheet" href="[^"]*css\/[^"]*">)+<\/noscript>[ \t]*\r?\n/gm;
const SWAPPER = /^[ \t]*<script>\/\*css-swap\*\/[\s\S]*?<\/script>[ \t]*\r?\n/gm;

/* Flip the six preloads to real stylesheets — but only once ALL SIX have
 * arrived, which is the whole point of it being a counter and not six
 * independent onload handlers.
 *
 * WHAT THIS PREVENTS. The obvious pattern is per-link:
 *
 *     <link rel="preload" as="style" href="..." onload="this.rel='stylesheet'">
 *
 * and it puts the cascade in an order the author never wrote. The sheets finish
 * in whatever order the network hands them over — measured on /collections/ at
 * slow 4G: fonts 557ms, tokens 712ms, base 805ms, experience 898ms, nav 1100ms,
 * pages 1224ms — and each becomes live the instant it lands. A live sheet sits
 * after the inline <style> and therefore outranks every rule in it at equal
 * specificity, INCLUDING the inlined copies of rules from sheets that have not
 * arrived yet. So for the 419ms between base.css and pages.css, base.css beat
 * pages.css, which is backwards. Waiting for all six makes the transition atomic:
 * until then the page is styled by the inline block alone, which is the one
 * intermediate state verified pixel-identical to the finished render. It costs
 * nothing — the last sheet lands when it lands either way.
 *
 * A CORRECTION, because this comment used to claim more than it could support.
 * It said the out-of-order cascade was what made above-the-fold content on
 * /collections/ slide 41px, for 0.0266 of CLS. That was a hypothesis, and
 * measurement killed it: the 41px shift SURVIVES with every stylesheet request
 * aborted, and DISAPPEARS with only the woff2 requests aborted. It was the font
 * swap re-wrapping the h1 from three lines to two — a fallback size-adjust ~8%
 * too wide at weight 200 — fixed at source in the FALLBACKS table in
 * scripts/self-host-fonts.mjs, and guarded by _ref/measure-font-swap-shift.mjs.
 *
 * So the counter is not load-bearing for any CLS number now measured. Keep it
 * anyway: the reordering above is real and demonstrable, it is cheap, and a
 * cascade that only holds when the network cooperates is not one to ship. Just
 * do not credit it with the 0.0266.
 *
 * onerror counts too — a 404 on one sheet must not strand the other five as
 * preloads. The counter is then parked at a value re-entry cannot reach, because
 * Safari has been seen firing load a second time on the rel swap itself.
 */
const swapper = '<script>/*css-swap*/window.__cssN=' + SHEETS.length
  + ';function __cssGo(){if(--window.__cssN>0)return;window.__cssN=1/0;'
  + 'var l=document.querySelectorAll(\'link[rel=preload][as=style]\');'
  + 'for(var i=0;i<l.length;i++){l[i].onload=null;l[i].rel=\'stylesheet\';}}</script>';

const stampOf = (text) => (text.match(/<!-- critical css: [^>]*?css=([0-9a-f]{12})/) || [])[1];

function patch(text, criticalCss) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';

  /* Collect the sheet hrefs in document order before stripping either form. */
  const hrefs = [];
  for (const re of [BLOCKING, DEFERRED]) {
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) hrefs.push(m[1]);
  }
  if (hrefs.length !== SHEETS.length) {
    throw new Error(`expected ${SHEETS.length} stylesheet links, found ${hrefs.length}`);
  }

  let out = text.replace(BLOCK, '').replace(BLOCKING, '').replace(DEFERRED, '')
    .replace(NOSCRIPT, '').replace(SWAPPER, '');

  /* rel=preload as=style fetches at the same high priority a stylesheet would.
     media="print" is the other common trick and it deprioritises the request,
     which is the opposite of the point. The rel swap is __cssGo's job, not each
     link's — see the comment on it. */
  const links = hrefs.map((h) =>
    `<link rel="preload" as="style" href="${h}" onload="__cssGo()" onerror="__cssGo()">`);
  /* Without this, turning JS off returns the site to the state
     inline-head-links.py was written to fix: 34 of 35 pages as raw HTML. */
  const noscript = `<noscript>${hrefs.map((h) => `<link rel="stylesheet" href="${h}">`).join('')}</noscript>`;

  const block = [
    `${OPEN} - css=${cssHash} -->`,
    '<style>' + criticalCss + '</style>',
    CLOSE,
  ].join(eol) + eol;

  const anchor = '</head>';
  if (!out.includes(anchor)) throw new Error('no </head>');
  /* The swapper is declared before the links so the inline onload attributes it
     serves are registered at parse time. Attaching listeners afterwards races a
     preload that finished first, and losing that race leaves the page on
     critical CSS forever. */
  return out.replace(anchor,
    block + swapper + eol + links.join(eol) + eol + noscript + eol + anchor);
}

/* -------------------------------------------------------------------- drive */

const browser = await chromium.launch();
let stale = 0, wrote = 0, failed = 0;
const report = [];

for (const route of ROUTES) {
  const file = fileFor(route);
  if (!existsSync(file)) { console.error(`MISSING  ${route}`); continue; }
  const rel = relative(ROOT, file).split('\\').join('/');

  if (check) {
    if (stampOf(readFileSync(file, 'utf8')) !== cssHash) { stale++; console.log(`stale  ${rel}`); }
    continue;
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1400);            // chrome.js injects the header/footer,
                                              // configurator.js mounts the panel

  /* Mark at the phone, then at the desktop, then emit once. Resizing keeps the
     same DOM, so the marks accumulate and source order survives. */
  const media = new Set(await page.evaluate(MARK));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(800);
  for (const m of await page.evaluate(MARK)) media.add(m);

  let criticalCss = '';
  try {
    criticalCss = (await page.evaluate(EXTRACT, [...media]))
      .replace(/\s+/g, ' ').replace(/\s*([{};,])\s*/g, '$1').replace(/;}/g, '}').trim();
  } catch (e) {
    console.error(`SKIP ${rel}: extract failed — ${e.message.split('\n')[0]}`);
    failed++;
    await ctx.close();
    continue;
  }
  await ctx.close();

  /* A short extraction is never legitimate — the leanest real route (/404.html)
     lands at 12.3 KB, and every page needs at least the @font-face block, the
     tokens and the fixed header. Writing one anyway is worse than not running at
     all: the sheets have already been made non-blocking by then, so the page
     paints unstyled. Refuse rather than half-apply. */
  if (criticalCss.length < 6000) {
    console.error(`SKIP ${rel}: extracted only ${criticalCss.length} B — refusing to defer the sheets behind that`);
    failed++;
    continue;
  }

  const before = readFileSync(file, 'utf8');
  let after;
  try { after = patch(before, criticalCss); } catch (e) {
    console.error(`SKIP ${rel}: ${e.message}`);
    failed++;
    continue;
  }
  writeFileSync(file, after, 'utf8');
  wrote++;
  report.push([rel, criticalCss.length]);
  console.log(`${String((criticalCss.length / 1024).toFixed(1)).padStart(6)} KB critical  ${rel}`);
}

await browser.close();

if (check) {
  console.log(`\n${stale} of ${ROUTES.length} pages stale (css=${cssHash})`);
  process.exit(stale ? 1 : 0);
}
const avg = report.reduce((n, r) => n + r[1], 0) / (report.length || 1);
console.log(`\n${wrote} pages, average ${(avg / 1024).toFixed(1)} KB critical inline (css=${cssHash})`);
