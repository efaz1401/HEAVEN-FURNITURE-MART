import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'http://localhost:8082';
const OUT_DIR = path.resolve('scratch/audit');
await fs.mkdir(OUT_DIR, { recursive: true });

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'collections', path: '/collections/' },
  { name: 'living-room', path: '/collections/living-room/' },
  { name: 'piece-model', path: '/piece/minimalist_cream_modular_sectional_sofa/' },
  { name: 'piece-nomodel', path: '/piece/luxury_wooden_bed_teal_velvet_headboard/' },
  { name: 'materials', path: '/materials/' },
  { name: 'showroom', path: '/showroom/' },
  { name: 'about', path: '/about/' },
  { name: 'contact', path: '/contact/' },
  { name: 'cart', path: '/cart/' },
  { name: 'checkout', path: '/checkout/' },
  { name: 'ar', path: '/ar/' },
  { name: '404', path: '/404.html' }
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1
  });

  for (const route of ROUTES) {
    for (const lang of ['en', 'bn']) {
      const page = await context.newPage();
      const consoleErrors = [];
      const failedRequests = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('response', res => {
        if (res.status() >= 400 && !route.path.includes('404')) {
          failedRequests.push(`${res.status()} ${res.url()}`);
        }
      });

      try {
        await page.goto(BASE + route.path, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(400);

        if (lang === 'bn') {
          await page.evaluate(() => {
            localStorage.setItem('hfm_lang', 'bn');
            document.documentElement.lang = 'bn';
            window.dispatchEvent(new CustomEvent('hfm:lang', { detail: { lang: 'bn' } }));
            document.dispatchEvent(new CustomEvent('hfm:lang', { detail: { lang: 'bn' }, bubbles: true }));
          });
          await page.waitForTimeout(300);
        }

        // Measure horizontal overflow
        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
          const innerW = window.innerWidth;
          let overflowingElements = [];
          if (scrollW > innerW + 1) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > innerW + 1) {
                overflowingElements.push({
                  tag: el.tagName,
                  id: el.id,
                  cls: el.className,
                  right: Math.round(r.right),
                  width: Math.round(r.width)
                });
              }
            }
          }
          return {
            hasOverflow: scrollW > innerW + 1,
            scrollW,
            innerW,
            overflowingElements: overflowingElements.slice(0, 5)
          };
        });

        // Screenshot for visual inspection
        const shotPath = path.join(OUT_DIR, `${vp.name}-${route.name}-${lang}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });

        results.push({
          viewport: vp.name,
          route: route.name,
          lang,
          overflow,
          consoleErrors,
          failedRequests
        });
      } catch (err) {
        results.push({
          viewport: vp.name,
          route: route.name,
          lang,
          error: err.message
        });
      } finally {
        await page.close();
      }
    }
  }
  await context.close();
}

await browser.close();

console.log(JSON.stringify(results, null, 2));
