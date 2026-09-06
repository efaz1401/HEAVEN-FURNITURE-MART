import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const models = [
  'carved_wooden_glass_display_showcase',
  'executive_black_leather_tufted_chair',
  'executive_brown_leather_tufted_chair',
  'luxury_cream_gold_glass_showcase',
  'majesty_glame_emerald_green_velvet_bed',
  'minimalist_black_gold_shoe_cabinet',
  'minimalist_cream_modular_sectional_sofa',
  'royal_gold_carved_dining_chair'
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8082/');

  console.log(`Beginning USDZ conversion for ${models.length} pieces...`);

  for (const id of models) {
    const glbRel = `assets/models/${id}.glb`;
    const usdzDest = path.join('assets/models', `${id}.usdz`);
    process.stdout.write(`  Converting ${id}... `);

    const res = await page.evaluate(async (glbUrl) => {
      try {
        const THREE = await import('https://esm.sh/three@0.160.0');
        const { GLTFLoader } = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
        const { USDZExporter } = await import('https://esm.sh/three@0.160.0/examples/jsm/exporters/USDZExporter.js');

        const loader = new GLTFLoader();
        const gltf = await new Promise((res, rej) => {
          loader.load(glbUrl, res, undefined, rej);
        });

        const exporter = new USDZExporter();
        const usdzArray = await exporter.parse(gltf.scene);

        // Base64 encode in chunks
        let binary = '';
        const bytes = new Uint8Array(usdzArray);
        const len = bytes.byteLength;
        const chunkSize = 0x8000;
        for (let i = 0; i < len; i += chunkSize) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return { ok: true, base64: btoa(binary), byteLength: len };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }, glbRel);

    if (res.ok) {
      const buffer = Buffer.from(res.base64, 'base64');
      fs.writeFileSync(usdzDest, buffer);
      console.log(`✓ ${(res.byteLength / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log(`✗ Failed: ${res.error}`);
    }
  }

  await browser.close();
  console.log('All USDZ conversions complete!');
}

main().catch(console.error);