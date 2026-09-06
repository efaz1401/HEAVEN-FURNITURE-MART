/* Self-host Jost and Inter Tight, replacing the Google Fonts request.
 *
 * WHY. The Google stylesheet is a render-blocking request on a FOREIGN origin, so
 * every first visit paid DNS + TLS + CSS to fonts.googleapis.com before it could
 * even discover the woff2 files on fonts.gstatic.com. Measured consequence beyond
 * the latency: the swap from fallback to Jost reflowed the breadcrumb from two
 * lines to one on /piece/royal_blue_gold_luxury_sofa_pair/ — 0.2317 of CLS, which
 * dropped to 0.0071 with the fonts blocked. Same-origin, preloaded fonts arrive
 * before first paint, so there is no swap to reflow.
 *
 * BOTH FAMILIES ARE VARIABLE FONTS. Google returns 53 @font-face rules but only
 * 10 distinct files: one per family per unicode-range, each covering the whole
 * weight axis. So the 53 rules collapse to four — two families × latin and
 * latin-ext — declared with a weight RANGE rather than one rule per weight.
 *
 * latin + latin-ext only. The site is English (`lang="en"`); Cyrillic, Greek and
 * Vietnamese are 6 files nothing on it can render. A customer typing Bengali into
 * the checkout falls back to a system font, which is the correct outcome — Jost
 * has no Bengali glyphs either.
 *
 *     node scripts/self-host-fonts.mjs [--check | --css-only]
 *
 * --check      touches nothing: reports what it would fetch and stops.
 * --css-only   rewrites css/fonts.generated.css but leaves assets/fonts/ alone.
 *              This is the one to use after editing the FALLBACKS table below,
 *              which is pure CSS and has nothing to do with the binaries. (The
 *              small Google stylesheet is still fetched either way — the
 *              unicode-range and weight-range values are read out of it.)
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'fonts');
const check = process.argv.includes('--check');
const cssOnly = process.argv.includes('--css-only');
/* Two independent decisions, and conflating them was the reason this script
   could not be used to regenerate its own CSS: --check skipped the write too. */
const getBinaries = !check && !cssOnly;
const writeCss = !check;

const CSS_URL = 'https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500;600;700'
  + '&family=Inter+Tight:wght@400;500;600;700;800&display=swap';
/* A modern desktop UA, or Google serves the legacy truetype/woff payloads. */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/120.0.0.0 Safari/537.36';

/* The two ranges we keep, identified by their opening codepoints. */
const RANGES = { latin: 'U+0000-00FF', 'latin-ext': 'U+0100-02BA' };

const css = await (await fetch(CSS_URL, { headers: { 'user-agent': UA } })).text();

const faces = [];
for (const block of css.split('@font-face').slice(1)) {
  const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
  const weight = Number(block.match(/font-weight:\s*(\d+)/)?.[1]);
  const url = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
  const range = block.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim();
  if (family && url && range) faces.push({ family, weight, url, range });
}

/* Group by family + range: one file, one weight range. */
const groups = new Map();
for (const f of faces) {
  const name = Object.entries(RANGES).find(([, head]) => f.range.startsWith(head))?.[0];
  if (!name) continue;                                  // cyrillic, greek, vietnamese
  const key = `${f.family}|${name}`;
  const g = groups.get(key) || { family: f.family, subset: name, url: f.url, range: f.range,
    min: f.weight, max: f.weight };
  g.min = Math.min(g.min, f.weight);
  g.max = Math.max(g.max, f.weight);
  if (g.url !== f.url) throw new Error(`${key} maps to two files — not a variable font?`);
  groups.set(key, g);
}

if (getBinaries) mkdirSync(OUT, { recursive: true });
const rules = [];
for (const g of [...groups.values()].sort((a, b) => a.family.localeCompare(b.family) || a.subset.localeCompare(b.subset))) {
  const slug = g.family.toLowerCase().replace(/\s+/g, '-');
  const file = `${slug}-${g.subset}.woff2`;
  const dest = join(OUT, file);
  let bytes = existsSync(dest) ? statSync(dest).size : 0;
  if (getBinaries) {
    const buf = Buffer.from(await (await fetch(g.url, { headers: { 'user-agent': UA } })).arrayBuffer());
    writeFileSync(dest, buf);
    bytes = buf.length;
  }
  console.log(`${getBinaries ? 'fetched' : check ? 'would fetch' : 'kept   '}  ${file.padEnd(26)} ${String(bytes).padStart(7)} B  `
    + `weight ${g.min}-${g.max}  (${g.subset})`);
  rules.push(`@font-face {
  font-family: '${g.family}';
  font-style: normal;
  font-weight: ${g.min} ${g.max};
  font-display: swap;
  src: url('../assets/fonts/${file}') format('woff2');
  unicode-range: ${g.range};
}`);
}

/* ------------------------------------------------- metric-matched fallbacks

   Inlining critical CSS (scripts/build-critical-css.mjs) pulled first paint on
   a slow-4G phone from ~1050ms to ~500ms, which is the point — but the woff2
   files still do not land until ~870ms. So the page now paints in the fallback
   face and swaps once the real one arrives, where before it simply waited. The
   swap moved text: Arial is wider than Jost, a display heading re-wrapped onto
   one fewer line, and everything under it jumped 41px. Measured on /ar/:
   CLS 0.001 -> 0.041, and 0.000 with the woff2 requests blocked, which is what
   pinned it on the swap rather than on a dropped rule.

   These faces give the fallback the real font's proportions, so the swap
   changes the letterforms without moving a single line box.

     size-adjust      = width(real) / width(fallback), measured over this site's
                        own copy as it RENDERS (uppercase applied), through
                        @font-face declarations shaped like the ones below
     ascent-override  = ascent/em of the real face / size-adjust
     descent-override = descent/em of the real face / size-adjust

   Re-derive all of it with `node _ref/measure-font-fallback.mjs`, which prints
   this table ready to paste and explains what it does and does not measure.

   ONE FACE PER FALLBACK FAMILY WAS NOT ENOUGH, and that is what this split
   fixes. Jost is a variable font that narrows as it lightens, while
   local('Arial') resolves a single static Regular face at one fixed width, so
   the correction needed is a function of weight:

     Jost vs Arial, over the site's own headings and copy
       weight 200   87.5%      <- every display heading on the site
       weight 300   89.0%
       weight 500   94.2%

   The shipped value was 95.3%, i.e. ~8% too wide exactly where it mattered
   most. On /collections/ that was the difference between "EVERY PIECE, MADE TO
   ORDER." setting on two lines and on three: the h1 grew 41px when Jost landed,
   everything under it slid, and the page took 0.0266 of CLS for it. So the
   faces are bucketed by weight, each with its own measured number.

   Each bucket declares an explicit font-weight RANGE, which does two things:
   the requested weight lands inside it, so Chrome uses the face as measured
   instead of synthesising a bolder one and widening it unpredictably; and 600+
   can therefore point at Arial Bold and be genuinely bold rather than faked.
   Nothing points a bold bucket at Arial Regular as a last resort on purpose —
   a Bold-tuned size-adjust over a Regular face is worse than no face at all,
   and dropping out lets the stack fall through to the next family cleanly.

   Within a bucket, the Arial row is declared first and the Roboto row second,
   so Roboto wins on a device that has both — correctly, since Roboto is then
   what gets drawn. Android is the case that matters here (this site sells in
   Chattogram): it ships Roboto and no Arial, and the corrections point in
   opposite directions, Arial being wider than Jost and Roboto narrower. */
const ARIAL = ["local('Arial')", "local('Helvetica')", "local('Liberation Sans')"];
const ARIAL_BOLD = ["local('Arial Bold')", "local('Arial-BoldMT')", "local('Helvetica Bold')",
  "local('Liberation Sans Bold')"];
const ROBOTO = ["local('Roboto')"];
const ROBOTO_BOLD = ["local('Roboto Bold')", "local('Roboto-Bold')", "local('Roboto')"];

const FALLBACKS = [
  /* Jost 200-300: 3855 chars of real copy; Roboto var 95.9% / fix 94.9% -> mid */
  { family: 'Jost fallback',        local: ARIAL,       weight: '200 300', size: 88.2,  asc: 121.3, desc: 43.1 },
  { family: 'Jost fallback',        local: ROBOTO,      weight: '200 300', size: 95.4,  asc: 112.1, desc: 39.8 },
  /* Jost 400-500: 325 chars — the site barely sets Jost at text weights */
  { family: 'Jost fallback',        local: ARIAL,       weight: '400 500', size: 94.1,  asc: 113.7, desc: 40.4 },
  { family: 'Jost fallback',        local: ROBOTO,      weight: '400 500', size: 100.0, asc: 106.9, desc: 38.0 },
  /* Jost 600-900: 633 chars, all at 600 */
  { family: 'Jost fallback',        local: ARIAL_BOLD,  weight: '600 900', size: 95.6,  asc: 111.9, desc: 39.7 },
  { family: 'Jost fallback',        local: ROBOTO_BOLD, weight: '600 900', size: 102.5, asc: 104.4, desc: 37.1 },
  /* Inter Tight 400-500: 30790 chars — this is the body-copy face */
  { family: 'Inter Tight fallback', local: ARIAL,       weight: '400 500', size: 96.3,  asc: 100.7, desc: 24.9 },
  { family: 'Inter Tight fallback', local: ROBOTO,      weight: '400 500', size: 96.9,  asc: 100.1, desc: 24.8 },
  /* Inter Tight 600-900: 7896 chars at 600/700/800/900 */
  { family: 'Inter Tight fallback', local: ARIAL_BOLD,  weight: '600 900', size: 93.4,  asc: 103.9, desc: 25.7 },
  { family: 'Inter Tight fallback', local: ROBOTO_BOLD, weight: '600 900', size: 99.9,  asc: 97.1,  desc: 24.0 },
];
for (const f of FALLBACKS) {
  rules.push(`@font-face {
  font-family: '${f.family}';
  font-weight: ${f.weight};
  src: ${f.local.join(', ')};
  size-adjust: ${f.size}%;
  ascent-override: ${f.asc}%;
  descent-override: ${f.desc}%;
  line-gap-override: 0%;
}`);
}

const out = join(ROOT, 'css', 'fonts.generated.css');
const header = `/* GENERATED by scripts/self-host-fonts.mjs — do not hand-edit.
   Re-run that script to refresh the files in assets/fonts/ and this block, or
   with --css-only to rewrite just this block.
   Both families are variable, so one file per family per subset covers every
   weight the site uses; the font-weight RANGE is what makes that legal. The
   metric-matched fallback faces below are bucketed by weight for the opposite
   reason — the local fonts they resolve to are NOT variable, so one size-adjust
   cannot serve a 200 heading and a 700 label at once. */\n\n`;
if (writeCss) writeFileSync(out, header + rules.join('\n\n') + '\n', 'utf8');
console.log(`\n${rules.length} @font-face rules ${writeCss ? '->' : 'would go to'} css/fonts.generated.css`);
