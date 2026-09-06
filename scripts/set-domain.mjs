#!/usr/bin/env node
/* =============================================================================
   Rewrite the hardcoded production domain across the whole site.

   WHY THIS EXISTS: 35 files hardcode `heavenfurnituremart.com` — every page's
   <link rel="canonical">, every og:image, the 18 Product JSON-LD `image`
   fields, sitemap.xml and robots.txt. If the site is deployed on any other
   hostname (including a free Hostinger test subdomain) and these are not
   rewritten, every page tells search engines its canonical version lives on a
   different domain, and social previews fetch images from a host that may not
   serve them. It is invisible in a browser, which is what makes it dangerous.

   USAGE
     node scripts/set-domain.mjs example.com            # rewrite
     node scripts/set-domain.mjs example.com --dry-run  # report only

   It rewrites the HOST ONLY, never a path, so it is safe to run repeatedly and
   safe to run back to the original host to undo it.
   ============================================================================= */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const CURRENT = 'yourfirstsite.com';
const target = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!target || target.startsWith('-')) {
  console.error('usage: node scripts/set-domain.mjs <new-domain> [--dry-run]');
  process.exit(1);
}
/* A scheme or a path here would corrupt every URL in the site, so refuse it
   rather than "helpfully" stripping it. */
if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(target)) {
  console.error(`refusing "${target}": pass a bare hostname, e.g. example.com`);
  process.exit(1);
}

const SKIP_DIRS = new Set(['_ref', 'scripts', 'node_modules', '.git',
  '.claude', '.zcode', '.playwright-mcp', 'dist']);
const EXTS = new Set(['.html', '.xml', '.txt', '.json', '.webmanifest']);

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (EXTS.has(extname(name))) files.push(p);
  }
})('.');

let touched = 0, occurrences = 0;
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  if (!s.includes(CURRENT)) continue;
  const n = s.split(CURRENT).length - 1;
  occurrences += n;
  touched++;
  console.log(`  ${dryRun ? 'would rewrite' : 'rewrote'}  ${f}  (${n})`);
  if (!dryRun) writeFileSync(f, s.split(CURRENT).join(target));
}

console.log(`\n${CURRENT} -> ${target}`);
console.log(`${touched} files, ${occurrences} occurrences${dryRun ? ' (dry run, nothing written)' : ''}`);
if (!dryRun && touched) {
  console.log('\nRemember: CURRENT at the top of this file is still the OLD host.');
  console.log('To rewrite again later, update it or pass the old host as the target.');
}
