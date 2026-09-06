import fs from 'fs';
import path from 'path';

function findHtml(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules', 'dist', '_ref', '.git', 'scratch'].includes(f)) findHtml(full, list);
    } else if (f.endsWith('.html')) {
      list.push(full);
    }
  }
  return list;
}

const files = findHtml('.');
const report = [];

for (const file of files) {
  const rel = file.replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const desc = descMatch ? descMatch[1].trim() : '';

  const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  const can = canMatch ? canMatch[1].trim() : '';

  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i)?.[1] ?? '';
  const ogImg = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)?.[1] ?? '';

  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

  const hasSchema = html.includes('application/ld+json');

  const imgs = [...html.matchAll(/<img\b([^>]*)>/gi)];
  const imgsWithoutAlt = imgs.filter(m => !m[1].includes('alt=')).length;

  report.push({
    rel,
    titleLen: title.length,
    title,
    descLen: desc.length,
    desc,
    hasCanonical: !!can,
    canonical: can,
    hasOgTitle: !!ogTitle,
    hasOgImg: !!ogImg,
    h1Count: h1Matches.length,
    h1: h1Matches[0] || 'NONE',
    hasSchema,
    imgsWithoutAlt
  });
}

console.log('=== SEO AUDIT REPORT (' + report.length + ' pages scanned) ===\n');

console.log('1. TITLES & METADATA:');
console.log('  Missing Title: ' + report.filter(r => !r.title).length);
console.log('  Title Length > 60 chars: ' + report.filter(r => r.titleLen > 60).length);
console.log('  Missing Meta Description: ' + report.filter(r => !r.desc).length);
console.log('  Desc Length > 160 chars: ' + report.filter(r => r.descLen > 160).length);
console.log('  Desc Length < 100 chars: ' + report.filter(r => r.descLen < 100 && r.descLen > 0).length);
console.log('  Missing Canonical: ' + report.filter(r => !r.hasCanonical).length);
console.log('  Missing OpenGraph Image: ' + report.filter(r => !r.hasOgImg).length);
console.log('  Images missing Alt: ' + report.reduce((acc, r) => acc + r.imgsWithoutAlt, 0));

console.log('\n2. HEADINGS:');
console.log('  Pages with 0 or >1 H1 tag: ' + report.filter(r => r.h1Count !== 1).length);

console.log('\n3. STRUCTURED DATA (SCHEMA.ORG):');
console.log('  Pages with JSON-LD: ' + report.filter(r => r.hasSchema).length + '/' + report.length);
console.log('  Pages missing JSON-LD:');
report.filter(r => !r.hasSchema).forEach(r => console.log('    • ' + r.rel));

console.log('\n4. SAMPLE TITLE & CANONICAL AUDIT:');
report.slice(0, 10).forEach(r => {
  console.log('  [' + r.rel + ']');
  console.log('    Title (' + r.titleLen + 'c): ' + r.title);
  console.log('    Canonical: ' + r.canonical);
  console.log('    H1: ' + r.h1);
});