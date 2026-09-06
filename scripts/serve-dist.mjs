#!/usr/bin/env node
/* =============================================================================
   Serve the built dist/ folder so the deploy payload can be tested before it
   ships. Distinct from serve.mjs, which serves the working tree on :8082 —
   testing the source is not the same as testing the archive, and the difference
   is exactly where a missing file hides.

     node scripts/serve-dist.mjs            # dist/ on http://localhost:8082
     node scripts/serve-dist.mjs dist 8083

   Directory requests resolve to index.html, which is how the site's clean URLs
   work on Apache/LiteSpeed via DirectoryIndex.
   ============================================================================= */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';

const ROOT = resolve(process.argv[2] || 'dist');
const PORT = Number(process.argv[3] || 8082);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(req.url.split('?')[0]);
    /* resolve() collapses any ../ segments, then the prefix test rejects
       anything that escaped ROOT. Cheaper and harder to get wrong than trying
       to strip traversal sequences with a regex. */
    let file = resolve(ROOT, '.' + path);
    if (file !== ROOT && !file.startsWith(ROOT + sep)) {
      res.writeHead(403).end('403');
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    } catch { /* fall through to the read, which produces the 404 */ }

    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404');
  }
}).listen(PORT, () => {
  console.log(`serving ${ROOT}`);
  console.log(`  http://localhost:${PORT}`);
});
