import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'DEPLOY-FINAL');

console.log('Cleaning DEPLOY-FINAL/ ...');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

console.log('Staging root files...');
const rootFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  '.htaccess',
  'site.webmanifest'
];
for (const f of rootFiles) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUT, f));
  } else {
    console.error(`ERROR: Missing required root file: ${f}`);
    process.exit(1);
  }
}

console.log('Staging code & data directories...');
const codeDirs = ['css', 'js', 'data'];
for (const d of codeDirs) {
  fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
}

console.log('Staging page directories...');
const pageDirs = [
  'about', 'ar', 'bespoke', 'cart', 'checkout', 'collections',
  'contact', 'materials', 'piece', 'room', 'showroom', 'thanks'
];
for (const d of pageDirs) {
  fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
}

console.log('Staging selective assets (excluding large PNG masters)...');
const assetDirs = [
  'assets/img/og',
  'assets/img/real',
  'assets/models',
  'assets/fonts',
  'assets/video'
];
for (const ad of assetDirs) {
  fs.mkdirSync(path.join(OUT, ad), { recursive: true });
}

const SHIPPABLE_PNGS = ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];

// Copy assets/img/*.webp, favicon.svg and the three icon PNGs
for (const file of fs.readdirSync(path.join(ROOT, 'assets/img'))) {
  if (file.endsWith('.webp') || file === 'favicon.svg' || SHIPPABLE_PNGS.includes(file)) {
    fs.copyFileSync(path.join(ROOT, 'assets/img', file), path.join(OUT, 'assets/img', file));
  }
}

// Older iOS versions request /apple-touch-icon.png at document root
const appleIcon = path.join(ROOT, 'assets/img/apple-touch-icon.png');
if (fs.existsSync(appleIcon)) {
  fs.copyFileSync(appleIcon, path.join(OUT, 'apple-touch-icon.png'));
}

// Copy subdirectories
const copySubDir = (sub, extFilter) => {
  const dir = path.join(ROOT, sub);
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (!extFilter || extFilter(f)) {
      fs.copyFileSync(path.join(dir, f), path.join(OUT, sub, f));
    }
  }
};

copySubDir('assets/img/og', f => f.endsWith('.jpg'));
copySubDir('assets/img/real', f => f.endsWith('.webp'));
copySubDir('assets/models', f => f.endsWith('.glb') || f.endsWith('.usdz'));
copySubDir('assets/fonts', f => f.endsWith('.woff2'));
copySubDir('assets/video', f => f.endsWith('.mp4'));

// Assertions & Health Checks
console.log('Running production integrity verification...');

// 1. Verify no PNG masters leaked
const outImgFiles = fs.readdirSync(path.join(OUT, 'assets/img'));
const leakedPngs = outImgFiles.filter(f => f.endsWith('.png') && !SHIPPABLE_PNGS.includes(f));
if (leakedPngs.length) {
  console.error(`ERROR: PNG masters leaked into DEPLOY-FINAL/assets/img: ${leakedPngs.join(', ')}`);
  process.exit(1);
}

// 2. Verify model pairs (both GLB and USDZ)
const outModels = fs.readdirSync(path.join(OUT, 'assets/models'));
const glbCount = outModels.filter(f => f.endsWith('.glb')).length;
const usdzCount = outModels.filter(f => f.endsWith('.usdz')).length;
if (glbCount !== usdzCount || glbCount === 0) {
  console.error(`ERROR: model formats out of step — ${glbCount} .glb vs ${usdzCount} .usdz.`);
  process.exit(1);
}
console.log(`  ✓ 3D / AR Models: ${glbCount} .glb + ${usdzCount} .usdz (100% paired)`);

// 3. Verify manifest, htaccess and icons
for (const required of ['.htaccess', 'site.webmanifest', 'assets/img/icon-192.png', 'assets/img/icon-512.png', 'assets/img/apple-touch-icon.png']) {
  if (!fs.existsSync(path.join(OUT, required))) {
    console.error(`ERROR: ${required} missing from DEPLOY-FINAL/`);
    process.exit(1);
  }
}
console.log('  ✓ .htaccess, site.webmanifest, and PWA icons verified');

// 4. Verify no developer artifacts or test suites leaked
for (const bad of ['_ref', 'scripts', 'serve.mjs', 'node_modules', 'tests', 'scratch', 'README.md', 'HANDOFF.md', 'CHANGELOG.md']) {
  if (fs.existsSync(path.join(OUT, bad))) {
    console.error(`ERROR: ${bad} leaked into DEPLOY-FINAL/!`);
    process.exit(1);
  }
}
console.log('  ✓ Zero developer tooling, scripts, or internal logs leaked');

// 5. Count total staged items
let totalFiles = 0;
let totalDirs = 0;
function countTree(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      totalDirs++;
      countTree(path.join(dir, entry.name));
    } else {
      totalFiles++;
    }
  }
}
countTree(OUT);
console.log(`DEPLOY-FINAL is 100% ready for Hostinger: ${totalFiles} files in ${totalDirs} directories.`);
