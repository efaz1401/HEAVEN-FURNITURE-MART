import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  await page.goto('http://localhost:8082/showroom/');
  await page.waitForTimeout(600);
  const showroomIframe = await page.locator('.map-frame iframe').count();
  console.log('Showroom iframe count:', showroomIframe);
  const mapEl = page.locator('#showroom-map');
  await mapEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/shot-showroom-map.png' });

  await page.goto('http://localhost:8082/contact/');
  await page.waitForTimeout(600);
  const contactIframe = await page.locator('.map-frame iframe').count();
  console.log('Contact iframe count:', contactIframe);
  const contactMapEl = page.locator('#contact-map');
  await contactMapEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/shot-contact-map.png' });

  await browser.close();
  console.log('All map checks passed!');
}

main().catch(console.error);