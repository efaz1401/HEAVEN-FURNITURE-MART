import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const BASE = 'http://localhost:8082';
const PAGES = [
  { name: 'Home',        path: '/' },
  { name: 'Collection',  path: '/collections/living-room/' },
  { name: 'Piece (3D)',  path: '/piece/minimalist_cream_modular_sectional_sofa/' },
  { name: 'Checkout',    path: '/checkout/' },
];

const MOBILE_FLAGS = {
  formFactor: 'mobile',
  throttling: {
    rttMs: 150,
    throughputKbps: 1638.4,
    cpuSlowdownMultiplier: 4,
    requestLatencyMs: 562.5,
    downloadThroughputKbps: 1474.56,
    uploadThroughputKbps: 675,
  },
  screenEmulation: {
    mobile: true,
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    disabled: false,
  },
  emulatedUserAgent:
    'Mozilla/5.0 (Linux; Android 11; moto g power) AppleWebKit/537.36 Chrome/112.0 Mobile Safari/537.36',
};

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
const results = [];

for (const { name, path } of PAGES) {
  process.stdout.write('  Auditing ' + name + ' (' + path + ')...');
  const { lhr } = await lighthouse(BASE + path, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    ...MOBILE_FLAGS,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });

  const cats = lhr.categories;
  const perf = Math.round((cats.performance?.score ?? 0) * 100);
  const a11y = Math.round((cats.accessibility?.score ?? 0) * 100);
  const bp   = Math.round((cats['best-practices']?.score ?? 0) * 100);
  const seo  = Math.round((cats.seo?.score ?? 0) * 100);

  const a = lhr.audits;
  const fcp = a['first-contentful-paint']?.displayValue ?? '-';
  const lcp = a['largest-contentful-paint']?.displayValue ?? '-';
  const tbt = a['total-blocking-time']?.displayValue ?? '-';
  const cls = a['cumulative-layout-shift']?.displayValue ?? '-';
  const si  = a['speed-index']?.displayValue ?? '-';
  const tti = a['interactive']?.displayValue ?? '-';

  const ops = Object.values(a)
    .filter(x => x.details?.type === 'opportunity' && x.score !== null && x.score < 1)
    .sort((x, y) => (y.details?.overallSavingsMs ?? 0) - (x.details?.overallSavingsMs ?? 0))
    .slice(0, 6)
    .map(x => '  • ' + x.title + ': ~' + Math.round(x.details?.overallSavingsMs ?? 0) + 'ms');

  const diag = Object.values(a)
    .filter(x => x.details?.type === 'table' && x.score !== null && x.score < 0.9
      && cats.performance.auditRefs.some(r => r.id === x.id))
    .slice(0, 5)
    .map(x => '  • ' + x.title + (x.displayValue ? ' — ' + x.displayValue : ''));

  results.push({ name, path, perf, a11y, bp, seo, fcp, lcp, tbt, cls, si, tti, ops, diag });
  console.log(' done  P=' + perf + ' A=' + a11y + ' B=' + bp + ' S=' + seo);
}

await chrome.kill();

const grade = n => n >= 90 ? 'GOOD' : n >= 50 ? 'NEEDS-WORK' : 'POOR';

console.log('\n================================================================');
console.log('  MOBILE LIGHTHOUSE AUDIT — Heaven Furniture Mart');
console.log('  Emulation: Moto G Power  |  4G throttle  |  4x CPU slowdown');
console.log('================================================================\n');

for (const r of results) {
  console.log('=== ' + r.name.toUpperCase() + '  ' + r.path);
  console.log('  Scores:  Performance=' + r.perf + ' [' + grade(r.perf) + ']   A11y=' + r.a11y + '   Best-Practices=' + r.bp + '   SEO=' + r.seo);
  console.log('  Metrics: FCP=' + r.fcp + '  LCP=' + r.lcp + '  TBT=' + r.tbt + '  CLS=' + r.cls + '  SpeedIdx=' + r.si + '  TTI=' + r.tti);
  if (r.ops.length) {
    console.log('  Opportunities (savings):');
    r.ops.forEach(o => console.log(o));
  }
  if (r.diag.length) {
    console.log('  Diagnostics:');
    r.diag.forEach(d => console.log(d));
  }
  console.log('');
}