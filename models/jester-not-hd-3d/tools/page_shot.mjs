// Stills of any page in viewer/ by running a line of script before each one.
// usage: node tools/page_shot.mjs <page.html> <outdir> <width>x<height> '<json [{name, js}]>'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright-core';
const [pageName, outdir, size, shotsJson] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number), shots = JSON.parse(shotsJson);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'viewer');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].split('#')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: W < 600 });
const logs = [];
page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) logs.push('console: ' + m.text()); });
page.on('pageerror', e => logs.push('pageerror: ' + e.message));
await page.goto(`http://localhost:${server.address().port}/${pageName}#test`);
await page.waitForFunction(() => window.J && window.J.ready, null, { timeout: 90000 });
fs.mkdirSync(outdir, { recursive: true });
for (const s of shots) {
  await page.evaluate(js => { (0, eval)(js); }, s.js || 'J.frame(0)');
  for (let k = 0; k < 3; k++) { try { await page.screenshot({ path: path.join(outdir, s.name + '.png'), timeout: 90000 }); break; } catch (e) { if (k === 2) throw e; } }
}
const errs = await page.evaluate(() => window.J.errors());
console.log(logs.length || errs ? ['ERRORS', ...logs, errs].join('\n') : 'no errors');
await browser.close(); server.close();
