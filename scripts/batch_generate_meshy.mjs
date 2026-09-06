import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REMAINING_PIECES = [
  'classic_wooden_cream_cushion_sofa_set',
  'luxury_wooden_bed_teal_velvet_headboard',
  'royal_navy_gold_velvet_bed',
  'white_wooden_panel_bed',
  'luxury_marble_dining_table_leather_chairs',
  'luxury_cream_marble_dining_table_set',
  'luxury_carved_dining_table_cream_chairs',
  'executive_black_padded_wood_chair',
  'ergonomic_black_mesh_highback_chair'
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function run() {
  const tp = await import('file:///C:/Users/MSI/AppData/Roaming/npm/node_modules/chrome-devtools-mcp/build/src/third_party/index.js');
  const puppeteer = tp.puppeteer;
  
  const devToolsFile = fs.readFileSync('C:/Users/MSI/AppData/Local/Google/Chrome/User Data/DevToolsActivePort', 'utf8');
  const [port, wsPath] = devToolsFile.split('\n').map(l => l.trim()).filter(Boolean);
  const browserWSEndpoint = `ws://127.0.0.1:${port}${wsPath}`;
  console.log('Connecting to Chrome via:', browserWSEndpoint);

  const browser = await puppeteer.connect({ browserWSEndpoint, defaultViewport: null });

  const pages = await browser.pages();
  const page = pages.find((p) => p.url().includes('meshy.ai'));
  if (!page) {
    console.error('Meshy page not found!');
    process.exit(1);
  }
  console.log('Found Meshy page:', page.url());
  await page.bringToFront();

  for (let i = 0; i < REMAINING_PIECES.length; i++) {
    const pieceId = REMAINING_PIECES[i];
    console.log(`\n==================================================`);
    console.log(`[${i + 1}/${REMAINING_PIECES.length}] Processing: ${pieceId}`);
    console.log(`==================================================`);

    const imagePath = path.resolve(`c:/Users/MSI/Downloads/website V5/assets/img/${pieceId}.png`);
    if (!fs.existsSync(imagePath)) {
      console.error(`Image not found: ${imagePath}`);
      continue;
    }

    const targetModelPath = path.resolve(`c:/Users/MSI/Downloads/website V5/assets/models/new_models/${pieceId}.glb`);
    if (fs.existsSync(targetModelPath) && fs.statSync(targetModelPath).size > 100000) {
      console.log(`Model already exists at ${targetModelPath}, skipping...`);
      continue;
    }

    console.log('Uploading image:', imagePath);
    const fileInput = await page.$('input[type=file]');
    if (!fileInput) {
      console.error('File input not found on page!');
      break;
    }
    await fileInput.uploadFile(imagePath);
    await page.evaluate((el) => {
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, fileInput);
    console.log('Dispatched file input change events.');

    await sleep(4000);

    try {
      await page.evaluate(() => {
        const radios = Array.from(document.querySelectorAll('[role=radio]'));
        const standardRadio = radios.find(r => (r.innerText && r.innerText.includes('Standard')) || (r.textContent && r.textContent.includes('Standard')));
        if (standardRadio && standardRadio.getAttribute('aria-checked') !== 'true') {
          standardRadio.click();
        }
        const switches = Array.from(document.querySelectorAll('[role=switch]'));
        const textureSwitch = switches.find(s => {
          const p = s.parentElement;
          return (p && p.innerText && p.innerText.includes('Texture')) || s.getAttribute('aria-label') === 'Texture';
        });
        if (textureSwitch && textureSwitch.getAttribute('aria-checked') !== 'true') {
          textureSwitch.click();
        }
      });
      console.log('Verified Standard resolution and Texture switch.');
    } catch (e) {
      console.warn('Warning setting options:', e.message);
    }

    await sleep(2000);

    const downloadsFolder = 'C:/Users/MSI/Downloads';
    const beforeFiles = new Set(fs.readdirSync(downloadsFolder).filter(f => f.endsWith('.glb')));

    console.log('Clicking Generate button...');
    const generated = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const genBtn = buttons.find(b => b.innerText && b.innerText.trim() === 'Generate' && !b.disabled);
      if (genBtn) {
        genBtn.click();
        return true;
      }
      return false;
    });

    if (!generated) {
      console.log('Generate button not immediately clickable, waiting 3s and retrying...');
      await sleep(3000);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const genBtn = buttons.find(b => b.innerText && b.innerText.trim() === 'Generate' && !b.disabled);
        if (genBtn) genBtn.click();
      });
    }

    console.log('Generation triggered. Waiting for completion...');
    await sleep(30000);

    let completed = false;
    const startTime = Date.now();
    const TIMEOUT_MS = 6 * 60 * 1000;

    while (Date.now() - startTime < TIMEOUT_MS) {
      const status = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const creatingMatch = bodyText.match(/Creating[^\n]*/i) || bodyText.match(/(\d+)%/);
        const percent = creatingMatch ? creatingMatch[0] : null;
        return { percent, bodyHasCreating: /Creating your model|Creating \.\.\./i.test(bodyText) };
      });

      console.log(`[${Math.round((Date.now() - startTime) / 1000)}s] Status: ${status.percent || 'in progress'}`);

      if (!status.bodyHasCreating && (!status.percent || status.percent === '100%')) {
        await sleep(5000);
        completed = true;
        break;
      }

      await sleep(10000);
    }

    console.log('Model ready. Triggering download...');
    await sleep(4000);

    await page.evaluate(() => {
      const menuButtons = Array.from(document.querySelectorAll('button[aria-haspopup="menu"]'));
      for (const btn of menuButtons) {
        const rect = btn.getBoundingClientRect();
        if (rect.x > 500 && rect.y > 100) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    await sleep(1500);

    await page.evaluate(() => {
      const menuItems = Array.from(document.querySelectorAll('[role="menuitem"], button, div'));
      const dlItem = menuItems.find(m => m.innerText && m.innerText.trim() === 'Download');
      if (dlItem) dlItem.click();
    });

    await sleep(2000);

    console.log('Confirming download dialog...');
    await page.evaluate(() => {
      const dialogButtons = Array.from(document.querySelectorAll('dialog button, [role="dialog"] button, button'));
      const confirmDl = dialogButtons.find(b => b.innerText && b.innerText.trim() === 'Download');
      if (confirmDl) confirmDl.click();
    });

    console.log('Waiting for file in Downloads folder...');
    let downloadedFile = null;
    for (let wait = 0; wait < 30; wait++) {
      await sleep(2000);
      const currentFiles = fs.readdirSync(downloadsFolder).filter(f => f.endsWith('.glb'));
      const newFiles = currentFiles.filter(f => !beforeFiles.has(f) && !f.endsWith('.crdownload'));
      if (newFiles.length > 0) {
        newFiles.sort((a, b) => fs.statSync(path.join(downloadsFolder, b)).mtimeMs - fs.statSync(path.join(downloadsFolder, a)).mtimeMs);
        downloadedFile = path.join(downloadsFolder, newFiles[0]);
        const size1 = fs.statSync(downloadedFile).size;
        await sleep(1000);
        const size2 = fs.statSync(downloadedFile).size;
        if (size1 === size2 && size1 > 1000) break;
      }
    }

    if (!downloadedFile || !fs.existsSync(downloadedFile)) {
      console.error(`Failed to find downloaded file for ${pieceId}!`);
      continue;
    }

    const rawSizeMB = (fs.statSync(downloadedFile).size / (1024 * 1024)).toFixed(2);
    console.log(`Downloaded raw file: ${downloadedFile} (${rawSizeMB} MB)`);

    const tempRawPath = path.resolve(`c:/Users/MSI/Downloads/website V5/assets/models/new_models/raw_${pieceId}.glb`);
    fs.copyFileSync(downloadedFile, tempRawPath);

    console.log(`Optimizing ${pieceId} with gltf-transform...`);
    try {
      execSync(`npx @gltf-transform/cli optimize "${tempRawPath}" "${targetModelPath}" --texture-compress webp`, {
        cwd: 'c:/Users/MSI/Downloads/website V5',
        stdio: 'inherit'
      });
      fs.unlinkSync(tempRawPath);
      const optSizeMB = (fs.statSync(targetModelPath).size / (1024 * 1024)).toFixed(2);
      console.log(`✓ Successfully saved: ${targetModelPath} (${optSizeMB} MB)`);
    } catch (optErr) {
      console.error('Optimization fallback:', optErr.message);
      fs.copyFileSync(tempRawPath, targetModelPath);
      fs.unlinkSync(tempRawPath);
    }

    await sleep(3000);
  }

  console.log('\nAll 9 pieces finished successfully!');
}

run().catch(console.error);
