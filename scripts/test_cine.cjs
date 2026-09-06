// Repro: hover reveals on the .cine section (js/cine.js)
const { chromium } = require('playwright');

const URL = 'http://localhost:8080/';

async function probe(page, label) {
  const rows = await page.$$('.cine-row');
  console.log(`\n=== ${label} — ${rows.length} rows ===`);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const word = (await row.$eval('.cine-word .base', el => el.textContent)).trim();
    // hover the button inside the row
    await row.hover();
    await page.waitForTimeout(400);
    const state = await row.evaluate(el => ({
      open: el.dataset.open,
      ariaExpanded: el.querySelector('button').getAttribute('aria-expanded'),
      detailVisible: (() => {
        const d = el.querySelector('.cine-detail');
        const cs = getComputedStyle(d);
        return cs.maxHeight !== '0px' && cs.opacity !== '0';
      })(),
      fillInset: el.querySelector('.cine-word .fill').style.getPropertyValue('--fill-inset'),
      clipPath: getComputedStyle(el.querySelector('.cine-word .fill')).clipPath,
    }));
    console.log(`${word.padEnd(8)} open=${state.open} aria=${state.ariaExpanded} ` +
      `detailVisible=${state.detailVisible} fillInset=${state.fillInset || '(unset)'} ` +
      `clip=${state.clipPath}`);
  }
}

(async () => {
  const browser = await chromium.launch();

  // Desktop hover mode (canHover = hover:hover and min-width:1025px)
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(URL, { waitUntil: 'load' });
  await desktop.evaluate(() => {
    sessionStorage.setItem('hfm-loaded-session', '1');
    document.getElementById('why-us').scrollIntoView({ block: 'start' });
  });
  await desktop.waitForTimeout(600);
  await probe(desktop, 'desktop 1440px');

  // Mid-size: hover-capable but narrower than the 1025px cut-off
  const mid = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await mid.goto(URL, { waitUntil: 'load' });
  await mid.evaluate(() => {
    sessionStorage.setItem('hfm-loaded-session', '1');
    document.getElementById('why-us').scrollIntoView({ block: 'start' });
  });
  await mid.waitForTimeout(600);
  await probe(mid, 'laptop 1000px (hover device, below 1025px cut-off)');

  await browser.close();
})();
