import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PARENT_DOWNLOADS = path.resolve(ROOT, '..'); // C:\Users\MSI\Downloads
const OUT = path.join(ROOT, 'dist');
const ARCHIVE_ROOT = path.join(ROOT, 'hfm-deploy.zip');
const ARCHIVE_NAMED = path.join(ROOT, 'website-v8-latest-deploy.zip');

console.log('===============================================================');
console.log('  HEAVEN FURNITURE MART (V8) - LATEST HOSTING BUILD PIPELINE');
console.log('===============================================================');

// Extract current cache version (from ?v=NN in index.html)
const indexSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const vMatch = indexSrc.match(/tokens\.css\?v=(\d+)/);
const BUILD_VERSION = vMatch ? vMatch[1] : '60';
console.log(`\nDetected asset cache-buster version: v=${BUILD_VERSION}`);

// Pre-step: Ensure module preloads are up to date
console.log('\n[1/7] Updating module preloads for latest JS dependencies...');
try {
  execSync('node scripts/add-modulepreload.mjs', { cwd: ROOT, stdio: 'pipe' });
  console.log('  ✓ Module preloads synchronized across all routes');
} catch (e) {
  console.warn('  ! Warning: add-modulepreload.mjs skipped or reported notice');
}

// Clean old dist and archives
console.log('\n[2/7] Cleaning previous dist/ and archives...');
fs.rmSync(OUT, { recursive: true, force: true });
fs.rmSync(ARCHIVE_ROOT, { force: true });
fs.rmSync(ARCHIVE_NAMED, { force: true });
fs.mkdirSync(OUT, { recursive: true });

console.log('[3/7] Staging root files...');
const rootFiles = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '.htaccess', 'site.webmanifest'];
for (const f of rootFiles) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUT, f));
  } else {
    console.error(`ERROR: Required root file missing: ${f}`);
    process.exit(1);
  }
}

console.log('[4/7] Staging code, data, and page routes...');
const codeDirs = ['css', 'js', 'data'];
for (const d of codeDirs) {
  fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
}

const pageDirs = ['about', 'ar', 'bespoke', 'cart', 'checkout', 'collections', 'contact', 'materials', 'piece', 'room', 'showroom', 'thanks'];
for (const d of pageDirs) {
  fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
}

console.log('[5/7] Staging selective assets (excluding large master PNGs)...');
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

for (const file of fs.readdirSync(path.join(ROOT, 'assets/img'))) {
  if (file.endsWith('.webp') || file === 'favicon.svg' || SHIPPABLE_PNGS.includes(file)) {
    fs.copyFileSync(path.join(ROOT, 'assets/img', file), path.join(OUT, 'assets/img', file));
  }
}

// Apple touch icon at root
const appleIcon = path.join(ROOT, 'assets/img/apple-touch-icon.png');
if (fs.existsSync(appleIcon)) fs.copyFileSync(appleIcon, path.join(OUT, 'apple-touch-icon.png'));

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

// Assertions & Integrity Checks
console.log('\nRunning production integrity verification...');

// 1. Verify no PNG masters leaked into assets/img
const outImgFiles = fs.readdirSync(path.join(OUT, 'assets/img'));
const leakedPngs = outImgFiles.filter(f => f.endsWith('.png') && !SHIPPABLE_PNGS.includes(f));
if (leakedPngs.length) {
  console.error(`ERROR: PNG masters leaked into dist/assets/img: ${leakedPngs.join(', ')}`);
  process.exit(1);
}
console.log('  ✓ PNG masters exclusion: passed (only PWA icons shipped)');

// 2. Verify model pairs (both GLB for Android/desktop and USDZ for iOS AR Quick Look)
const outModels = fs.readdirSync(path.join(OUT, 'assets/models'));
const glbCount = outModels.filter(f => f.endsWith('.glb')).length;
const usdzCount = outModels.filter(f => f.endsWith('.usdz')).length;
if (glbCount !== usdzCount || glbCount === 0) {
  console.error(`ERROR: model formats out of step — ${glbCount} .glb vs ${usdzCount} .usdz.`);
  process.exit(1);
}
console.log(`  ✓ 3D / AR models: ${glbCount} .glb + ${usdzCount} .usdz (100% paired)`);

// 3. Verify manifest, htaccess and icons
for (const required of ['.htaccess', 'site.webmanifest', 'assets/img/icon-192.png', 'assets/img/icon-512.png', 'assets/img/apple-touch-icon.png']) {
  if (!fs.existsSync(path.join(OUT, required))) {
    console.error(`ERROR: ${required} missing from dist/ — it is referenced by the site.`);
    process.exit(1);
  }
}
console.log('  ✓ .htaccess, site.webmanifest, and PWA icons present');

// 4. Verify no internal tooling or dev artifacts leaked
const forbidden = [
  '_ref', 'scripts', 'serve.mjs', 'node_modules', 'tests',
  'scratch', 'README.md', 'HANDOFF.md', 'CHANGELOG.md',
  'eval.bat', 'up.bat', 'build.bat', 'build.ps1', '.claude',
  '.zcode', '.playwright-mcp'
];
for (const bad of forbidden) {
  if (fs.existsSync(path.join(OUT, bad))) {
    console.error(`ERROR: ${bad} leaked into dist/!`);
    process.exit(1);
  }
}
console.log('  ✓ Zero developer artifacts, tests, or node_modules leaked');

// [6/7] Stamp JS imports with cache-buster ?v=NN to guarantee Hostinger CDN edge cache bypass
console.log(`\n[6/7] Stamping JS module graph with ?v=${BUILD_VERSION} for CDN cache-busting...`);
const staticRe = /(from\s+['"])(\.[^'"]+?\.js)(['"])/g;
const dynamicRe = /(import\s*\(\s*['"])(\.[^'"]+?\.js)(['"]\s*\))/g;
const scriptSrcRe = /(<script\s+[^>]*?src=["'])([^"']+\.js)(["'])/gi;
const preloadHrefRe = /(<link\s+[^>]*?rel=["']modulepreload["'][^>]*?href=["'])([^"']+\.js)(["'])/gi;
const preloadHrefRe2 = /(<link\s+[^>]*?href=["'])([^"']+\.js)(["'][^>]*?rel=["']modulepreload["'])/gi;

let jsRewrittenCount = 0;
let htmlRewrittenCount = 0;

function versionDistFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      versionDistFiles(full);
    } else if (entry.name.endsWith('.js') && !full.includes('vendor')) {
      const code = fs.readFileSync(full, 'utf8');
      const next = code
        .replace(staticRe, (m, p1, p2, p3) => p2.includes('?v=') ? m : `${p1}${p2}?v=${BUILD_VERSION}${p3}`)
        .replace(dynamicRe, (m, p1, p2, p3) => p2.includes('?v=') ? m : `${p1}${p2}?v=${BUILD_VERSION}${p3}`);
      if (next !== code) {
        fs.writeFileSync(full, next, 'utf8');
        jsRewrittenCount++;
      }
    } else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(full, 'utf8');
      const next = html
        .replace(scriptSrcRe, (m, p1, p2, p3) => p2.includes('?v=') || p2.startsWith('http') ? m : `${p1}${p2}?v=${BUILD_VERSION}${p3}`)
        .replace(preloadHrefRe, (m, p1, p2, p3) => p2.includes('?v=') || p2.startsWith('http') ? m : `${p1}${p2}?v=${BUILD_VERSION}${p3}`)
        .replace(preloadHrefRe2, (m, p1, p2, p3) => p2.includes('?v=') || p2.startsWith('http') ? m : `${p1}${p2}?v=${BUILD_VERSION}${p3}`);
      if (next !== html) {
        fs.writeFileSync(full, next, 'utf8');
        htmlRewrittenCount++;
      }
    }
  }
}
versionDistFiles(OUT);
console.log(`  ✓ Stamped ${jsRewrittenCount} JS modules and ${htmlRewrittenCount} HTML pages with ?v=${BUILD_VERSION}`);
console.log('  ✓ Prevents CDN/browser edge proxies from serving stale cached modules');

console.log('\n[7/7] Packaging deployment archive with explicit directory entries...');
const pyCommands = ['python', 'py', 'python3'];
let zipSuccess = false;
for (const cmd of pyCommands) {
  try {
    execSync(`${cmd} "${path.join(ROOT, 'scripts', 'make-zip.py')}" "${OUT}" "${ARCHIVE_ROOT}"`, {
      cwd: ROOT,
      stdio: 'inherit'
    });
    zipSuccess = true;
    break;
  } catch {
    // try next
  }
}

if (!zipSuccess) {
  console.error('ERROR: Could not run scripts/make-zip.py with python, py, or python3.');
  process.exit(1);
}

// Copy archive to named alias and also to parent Downloads folder
fs.copyFileSync(ARCHIVE_ROOT, ARCHIVE_NAMED);

// Overwrite the stale archive in C:\Users\MSI\Downloads\hfm-deploy.zip
const parentZipPath = path.join(PARENT_DOWNLOADS, 'hfm-deploy.zip');
try {
  fs.copyFileSync(ARCHIVE_ROOT, parentZipPath);
  console.log(`  ✓ Updated root Downloads archive: ${parentZipPath}`);
} catch (err) {
  console.warn(`  ! Note: Could not copy to parent Downloads folder: ${err.message}`);
}

// Summary
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
const zipSizeMb = (fs.statSync(ARCHIVE_ROOT).size / (1024 * 1024)).toFixed(1);

console.log('\n===============================================================');
console.log('  LATEST BUILD AND DEPLOYMENT PACKAGES CREATED:');
console.log('===============================================================');
console.log(`  1. In Website V8:       ${ARCHIVE_ROOT} (${zipSizeMb} MB)`);
console.log(`  2. Versioned Name:      ${ARCHIVE_NAMED} (${zipSizeMb} MB)`);
console.log(`  3. In Downloads Root:   ${parentZipPath} (${zipSizeMb} MB)`);
console.log(`  4. Staged Folder:       ${OUT} (${totalFiles} files in ${totalDirs} dirs)`);
console.log('===============================================================\n');
