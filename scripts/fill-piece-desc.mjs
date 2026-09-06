/* Ship each piece's description in its markup instead of writing it in later.
 *
 * `<p id="p-desc"></p>` was empty and filled by js/piece-fill.js, which is a
 * 163px shift on the Royal Sofa Pair — the last CLS contributor on the piece
 * template, worth 0.2246 on its own — and it left a no-JS visitor with no
 * description at all. `p-name`, `p-tagline` and `p-lead` were already static; the
 * description was the odd one out.
 *
 * Written in Node rather than Python because package.json's "type": "module" now
 * lets a script IMPORT data/pieces.js directly. No regex over JS string literals,
 * so apostrophes and punctuation cannot corrupt the output.
 *
 *     node scripts/fill-piece-desc.mjs [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PIECES } from '../data/pieces.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

const escapeHtml = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let changed = 0;
for (const p of PIECES) {
  const path = join(ROOT, 'piece', p.id, 'index.html');
  const text = readFileSync(path, 'utf8');
  const re = /<p id="p-desc">([\s\S]*?)<\/p>/;
  const m = text.match(re);
  if (!m) throw new Error(`no #p-desc in piece/${p.id}/index.html`);

  const wanted = `<p id="p-desc">${escapeHtml(p.desc)}</p>`;
  if (m[0] === wanted) {
    console.log(`unchanged  piece/${p.id}/`);
    continue;
  }
  changed += 1;
  console.log(`${check ? 'would fill' : 'filled'}  piece/${p.id}/  (${p.desc.length} chars)`);
  if (!check) writeFileSync(path, text.replace(re, wanted), 'utf8');
}

console.log(`\n${changed} of ${PIECES.length} piece pages rewritten`);
process.exit(check && changed ? 1 : 0);
