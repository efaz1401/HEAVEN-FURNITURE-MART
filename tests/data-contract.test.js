/* Data and asset contracts. data/pieces.js is the single source of truth only
   while it agrees with the filesystem and with the 35 HTML pages — this suite is
   what keeps that claim true. Pure Node plus the filesystem; no browser. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { PIECES, CATEGORIES, MATERIAL_TIERS, ADDONS, UNIVERSAL_ADDONS, WHATSAPP } from '../data/pieces.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const at = (...p) => join(ROOT, ...p);
const read = (...p) => readFileSync(at(...p), 'utf8');

const SIZES = ['_cut_512', '_cut_1024', '_cut_1536', '_512', '_1024'];

test('D1 every piece has all six images', () => {
  for (const p of PIECES) {
    for (const suffix of SIZES) {
      assert.ok(existsSync(at('assets', 'img', `${p.id}${suffix}.webp`)),
        `missing assets/img/${p.id}${suffix}.webp`);
    }
    assert.ok(existsSync(at('assets', 'img', 'og', `${p.id}.jpg`)),
      `missing assets/img/og/${p.id}.jpg`);
  }
});

/* The AR gate, both directions. A badge on a piece that cannot open AR spends
   the visitor's trust and returns nothing; a GLB with hasModel false is a
   feature nobody can reach. white_wooden_panel_bed is the standing negative. */
test('D2 hasModel matches the GLB files exactly', () => {
  const onDisk = new Set(readdirSync(at('assets', 'models'))
    .filter((f) => f.endsWith('.glb')).map((f) => f.replace(/\.glb$/, '')));

  for (const p of PIECES) {
    assert.equal(onDisk.has(p.id), p.hasModel,
      p.hasModel ? `${p.id} claims a model with no .glb` : `${p.id} has a .glb but hasModel is false`);
  }
  assert.equal(onDisk.size, PIECES.filter((p) => p.hasModel).length);
  assert.equal(PIECES.find((p) => p.id === 'white_wooden_panel_bed').hasModel, false);
});

test('D3 pieces and piece directories map one to one', () => {
  const dirs = readdirSync(at('piece'), { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);
  assert.deepEqual(dirs.slice().sort(), PIECES.map((p) => p.id).sort());
  for (const id of dirs) {
    assert.ok(existsSync(at('piece', id, 'index.html')), `piece/${id}/ has no index.html`);
  }
});

test('D4 each piece page declares its own id and depth', () => {
  for (const p of PIECES) {
    const html = read('piece', p.id, 'index.html');
    assert.match(html, new RegExp(`data-piece="${p.id}"`), `${p.id} data-piece`);
    assert.match(html, /<body data-depth="2">/, `${p.id} data-depth`);
  }
  for (const c of CATEGORIES) {
    const html = read('collections', c.slug, 'index.html');
    assert.match(html, new RegExp(`data-cat="${c.slug}"`), `${c.slug} data-cat`);
    assert.match(html, /data-depth="2"/, `${c.slug} data-depth`);
  }
});

test('D5 every piece is internally well formed', () => {
  const ids = new Set();
  for (const p of PIECES) {
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`);
    ids.add(p.id);
    assert.ok(p.price.min < p.price.max, `${p.id} price band inverted`);
    assert.ok(MATERIAL_TIERS[p.matGroup], `${p.id} unknown matGroup ${p.matGroup}`);
    assert.equal(MATERIAL_TIERS[p.matGroup].length, 3, `${p.id} ladder is not 3 tiers`);
    assert.equal(p.dims.length, 3, `${p.id} does not have 3 dimensions`);
    assert.ok(CATEGORIES.some((c) => c.slug === p.cat), `${p.id} unknown category ${p.cat}`);
    for (const key of p.addons || []) {
      assert.ok(ADDONS[key], `${p.id} unknown add-on ${key}`);
    }
    assert.ok(p.alt && p.alt.length > 20, `${p.id} alt text too thin`);
    assert.equal(p.arVerified, false, `${p.id} arVerified flipped without rescaled GLBs`);
  }
  for (const key of UNIVERSAL_ADDONS) assert.ok(ADDONS[key], `unknown universal add-on ${key}`);
});

/* One pricing model calibrates all 18 only while the bands stay this uniform.
   A new piece outside the range breaks that assumption silently. */
test('D6 every price band stays in the documented 1.45-1.58 ratio', () => {
  for (const p of PIECES) {
    const ratio = p.price.max / p.price.min;
    assert.ok(ratio >= 1.44 && ratio <= 1.59, `${p.id} ratio ${ratio.toFixed(3)}`);
  }
});

/* The omissions are deliberate: cart, checkout and thanks are noindex, /room/ is
   a noindex redirect stub, 404.html must never be indexed. Encoded so nobody
   "fixes" the sitemap by adding them back. */
test('D7 the sitemap lists exactly the indexable pages', () => {
  const urls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = urls.map((u) => new URL(u).pathname);
  const expected = [
    '/', '/collections/', ...CATEGORIES.map((c) => `/collections/${c.slug}/`),
    ...PIECES.map((p) => `/piece/${p.id}/`),
    '/ar/', '/bespoke/', '/materials/', '/showroom/', '/about/', '/contact/',
  ];
  assert.deepEqual(paths.slice().sort(), expected.slice().sort());

  for (const excluded of ['/cart/', '/checkout/', '/thanks/', '/room/', '/404.html']) {
    assert.ok(!paths.includes(excluded), `${excluded} must stay out of the sitemap`);
    if (excluded !== '/404.html') {
      const file = at(excluded.replace(/^\/|\/$/g, ''), 'index.html');
      assert.match(readFileSync(file, 'utf8'), /name="robots" content="noindex/,
        `${excluded} is out of the sitemap but not marked noindex`);
    }
  }
});

test('D8 per-page metadata agrees with the catalogue', () => {
  /* Two piece names carry an ampersand, so the markup holds the ESCAPED form. */
  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const p of PIECES) {
    const html = read('piece', p.id, 'index.html');
    assert.match(html, new RegExp(`<title>${escapeRe(escapeHtml(p.name))} — `), `${p.id} title`);
    assert.ok(html.includes(`href="https://yourfirstsite.com/piece/${p.id}/"`),
      `${p.id} canonical`);
    assert.ok(html.includes(`og/${p.id}.jpg`), `${p.id} og:image`);

    const ld = JSON.parse(html.match(/id="ld-product">\s*(\{[\s\S]*?\})\s*<\/script>/)[1]);
    assert.equal(ld.name, p.name, `${p.id} JSON-LD name`);
    const spec = ld.offers.priceSpecification;
    assert.ok(spec, `${p.id} JSON-LD has no price — invalid for Rich Results`);
    assert.equal(spec.minPrice, p.price.min, `${p.id} JSON-LD minPrice`);
    assert.equal(spec.maxPrice, p.price.max, `${p.id} JSON-LD maxPrice`);
    assert.equal(spec.priceCurrency, 'BDT', `${p.id} JSON-LD currency`);
  }
});

/* The one meta description that duplicated a derived count said "eleven" while
   the real figure was 8. Counts belong in the DOM, written from data. */
test('D9 no meta description hardcodes a catalogue count', () => {
  const words = /\b(eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/i;
  for (const rel of ['collections/index.html', 'ar/index.html', 'index.html']) {
    const desc = read(rel).match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
    assert.ok(!words.test(desc), `${rel} description hardcodes a count: "${desc}"`);
  }
});

/* Three places repeat the WhatsApp number on purpose and cannot import it:
   js/chrome.js imports nothing so the header is never delayed by the catalogue,
   and index.html / 404.html carry static chrome with no module at all. Repetition
   is fine; UNCHECKED repetition is what left 21 stale copies across the site when
   the real number arrived. This is the check that makes it safe. */
test('D10 every hardcoded copy of the WhatsApp number matches WHATSAPP', () => {
  const inChrome = read('js', 'chrome.js').match(/^const WA = '(\d+)';$/m)?.[1];
  assert.equal(inChrome, WHATSAPP, 'js/chrome.js WA has drifted from data/pieces.js');

  for (const rel of ['index.html', '404.html']) {
    const html = read(rel);
    const nums = [...html.matchAll(/wa\.me\/(\d+)/g)].map((m) => m[1]);
    assert.ok(nums.length, `${rel} has no wa.me link at all`);
    for (const n of nums) assert.equal(n, WHATSAPP, `${rel} links wa.me/${n}`);
  }
});

/* The pill is the site's one repeated action, and on two pages it is static markup
   rather than something js/chrome.js can guarantee. */
test('D11 the static pages carry the quote pill', () => {
  for (const rel of ['index.html', '404.html']) {
    const html = read(rel);
    assert.ok(/class="quote-fab"/.test(html), `${rel} is missing the quote pill`);
    assert.ok(/aria-label="Request a quote on WhatsApp"/.test(html),
      `${rel} pill has no accessible name`);
  }
});

/* assets/img/real/ holds the six real photographs of the business. It is a separate
   directory from assets/img/ on purpose — every name in the flat directory is a piece
   id, and D1 above walks it expecting six files per piece. These are photographs of
   the company, not of a product, so they get their own namespace and their own check.

   The failure this catches is silent: scripts/build-deploy.sh copies assets/ with
   `cp assets/img/*.webp`, which does not descend into a subdirectory, so a missing
   line there ships /showroom/ and /about/ with broken images and no build error. */
test('D13 every real photograph referenced by a page exists on disk', () => {
  const pages = [];
  const walk = (dir) => {
    for (const e of readdirSync(at(dir), { withFileTypes: true })) {
      if (e.isDirectory() && !['assets', 'dist', 'node_modules', '_ref', 'scripts', '.git'].includes(e.name)) walk(join(dir, e.name));
      else if (e.isFile() && e.name.endsWith('.html')) pages.push(join(dir, e.name));
    }
  };
  walk('.');

  const refs = new Set();
  for (const rel of pages) {
    for (const m of read(rel).matchAll(/(?:\.\.\/)*assets\/img\/(?:real|og)\/([A-Za-z0-9._-]+\.(?:webp|jpg))/g)) {
      refs.add(join('assets', 'img', /real\//.test(m[0]) ? 'real' : 'og', m[1]));
    }
  }
  assert.ok(refs.size >= 15, `only ${refs.size} photo references found`);
  for (const r of refs) {
    assert.ok(existsSync(at(r)), `${r} is referenced by a page but is not on disk`);
  }
});

/* Two claims the photographs make that the markup has to keep. A photograph without
   a reserved box is this site's single most common layout-shift source, and an
   undescribed photograph of a named person is an accessibility failure. */
test('D14 every real photograph reserves its box and describes itself', () => {
  for (const rel of ['index.html', 'showroom/index.html', 'about/index.html']) {
    const html = read(rel);
    const tags = [...html.matchAll(/<img[^>]*assets\/img\/real\/[^>]*>/g)].map((m) => m[0]);
    assert.ok(tags.length, `${rel} references no real photograph`);
    for (const tag of tags) {
      assert.match(tag, /\swidth="\d+"/, `${rel}: an <img> has no width — ${tag.slice(0, 70)}`);
      assert.match(tag, /\sheight="\d+"/, `${rel}: an <img> has no height — ${tag.slice(0, 70)}`);
      const alt = tag.match(/\salt="([^"]*)"/);
      assert.ok(alt && alt[1].length > 30,
        `${rel}: an <img> has no useful alt text — ${tag.slice(0, 70)}`);
    }
  }
});

/* The dock was replaced by the pill. A leftover .dock in one page's markup would
   render a fixed bar that nothing reserves space for any more. */
test('D12 no page still ships the mobile dock', () => {
  const pages = [];
  const walk = (dir) => {
    for (const e of readdirSync(at(dir), { withFileTypes: true })) {
      if (e.isDirectory() && !['assets', 'dist', 'node_modules', '_ref', 'scripts', '.git'].includes(e.name)) walk(join(dir, e.name));
      else if (e.isFile() && e.name.endsWith('.html')) pages.push(join(dir, e.name));
    }
  };
  walk('.');
  assert.ok(pages.length >= 35, `only found ${pages.length} pages`);
  for (const rel of pages) {
    assert.ok(!/class="dock/.test(read(rel)), `${rel} still ships the dock`);
  }
});

/* AR scaling: Google Scene Viewer requires ar-scale="auto" to allow user pinch-to-scale.
   Setting ar-scale to fixed passes resizable=false, preventing users from adjusting size. */
test('D16 AR models allow pinch-to-scale resizing (ar-scale is auto)', () => {
  const pieceJs = read('js', 'piece.js');
  assert.match(pieceJs, /mv\.setAttribute\(['"]ar-scale['"],\s*['"]auto['"]\)/,
    'js/piece.js must set ar-scale to auto so models can be resized in Google Scene Viewer / WebXR AR');
  assert.ok(!/mv\.setAttribute\(['"]ar-scale['"],\s*['"]fixed['"]\)/.test(pieceJs),
    'js/piece.js must not lock ar-scale to fixed');
});

/* Apple AR Quick Look: every piece with hasModel must have a .usdz file and js/piece.js must set ios-src */
test('D17 iPhone AR Quick Look models exist and are wired', () => {
  const pieceJs = read('js', 'piece.js');
  assert.match(pieceJs, /mv\.setAttribute\(['"]ios-src['"],/,
    'js/piece.js must set ios-src attribute for iOS AR Quick Look');
  assert.match(pieceJs, /quick-look/,
    'js/piece.js must declare quick-look in ar-modes');

  for (const p of PIECES) {
    if (p.hasModel) {
      const usdzPath = at('assets', 'models', `${p.id}.usdz`);
      assert.ok(existsSync(usdzPath), `missing USDZ model: ${usdzPath}`);
    }
  }
});


