import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8082/piece/majesty_glame_emerald_green_velvet_bed/', { waitUntil: 'networkidle2' });
  
  const cfg = await page.$('.cfg-actions');
  if (cfg) {
    await cfg.screenshot({ path: 'C:/Users/MSI/.gemini/antigravity/brain/4cd29627-bb75-4372-8554-5207579ee577/verified-cfg-wa-btn.png' });
  }

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8082', { waitUntil: 'networkidle2' });
  const fab = await page.$('.quote-fab');
  if (fab) {
    await fab.screenshot({ path: 'C:/Users/MSI/.gemini/antigravity/brain/4cd29627-bb75-4372-8554-5207579ee577/verified-mobile-fab.png' });
  }

  await browser.close();
  console.log('Screenshots captured');
})();
