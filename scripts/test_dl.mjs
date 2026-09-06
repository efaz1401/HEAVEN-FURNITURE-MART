import fs from 'fs';
import path from 'path';

async function downloadFirst(pieceId) {
  const tp = await import('file:///C:/Users/MSI/AppData/Roaming/npm/node_modules/chrome-devtools-mcp/build/src/third_party/index.js');
  const devToolsFile = fs.readFileSync('C:/Users/MSI/AppData/Local/Google/Chrome/User Data/DevToolsActivePort', 'utf8');
  const [port, wsPath] = devToolsFile.split('\n').map(l => l.trim()).filter(Boolean);
  const browser = await tp.puppeteer.connect({ browserWSEndpoint: 'ws://127.0.0.1:' + port + wsPath, defaultViewport: null });
  const page = (await browser.pages()).find(p => p.url().includes('meshy.ai'));

  const downloadsFolder = 'C:/Users/MSI/Downloads';
  const beforeFiles = new Set(fs.readdirSync(downloadsFolder).filter(f => f.endsWith('.glb')));

  // Click the 3-dots menu on the card corresponding to index 0 or 1
  console.log('Clicking card menu button in history...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[aria-haspopup="menu"]'));
    const targetBtn = btns.find(b => {
      const r = b.getBoundingClientRect();
      return r.x > 800 && r.y > 400 && r.y < 600;
    });
    if (targetBtn) targetBtn.click();
  });

  await new Promise(r => setTimeout(r, 1500));

  console.log('Clicking Download menuitem...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[role="menuitem"], button'));
    const dl = items.find(i => i.innerText && i.innerText.trim() === 'Download');
    if (dl) dl.click();
  });

  await new Promise(r => setTimeout(r, 1500));

  console.log('Confirming Download dialog...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('dialog button, [role="dialog"] button, button'));
    const confirm = btns.find(b => b.innerText && b.innerText.trim() === 'Download');
    if (confirm) confirm.click();
  });

  console.log('Waiting for downloaded file...');
  let downloadedFile = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const currentFiles = fs.readdirSync(downloadsFolder).filter(f => f.endsWith('.glb'));
    const newFiles = currentFiles.filter(f => !beforeFiles.has(f) && !f.endsWith('.crdownload'));
    if (newFiles.length > 0) {
      newFiles.sort((a, b) => fs.statSync(path.join(downloadsFolder, b)).mtimeMs - fs.statSync(path.join(downloadsFolder, a)).mtimeMs);
      downloadedFile = path.join(downloadsFolder, newFiles[0]);
      break;
    }
  }

  if (downloadedFile) {
    console.log('Downloaded:', downloadedFile);
    const targetPath = path.resolve(`c:/Users/MSI/Downloads/website V5/assets/models/new_models/${pieceId}.glb`);
    fs.copyFileSync(downloadedFile, targetPath);
    console.log('Saved to:', targetPath);
  } else {
    console.log('No new file appeared.');
  }

  await browser.disconnect();
}

downloadFirst(process.argv[2] || 'test').catch(console.error);
