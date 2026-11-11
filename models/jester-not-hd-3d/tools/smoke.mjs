// Open the viewer the way a person does (no test mode), press every button, and report any errors.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright-core';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', process.argv[4] || 'viewer');
const [W, H] = (process.argv[2] || '390x800').split('x').map(Number);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: W < 600 });
const logs = [];
page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) logs.push('console: ' + m.text()); });
page.on('pageerror', e => logs.push('pageerror: ' + e.message));
await page.goto(`http://localhost:${server.address().port}/index.html`);
await page.waitForFunction(() => window.J && window.J.ready, null, { timeout: 60000 });
const buttons = await page.$$eval('#bar button', bs => bs.map(b => b.textContent));
let pressed = 0;
for (const b of await page.$$('#bar button')) { await b.click(); await page.waitForTimeout(450); pressed++; }
for (const name of await page.evaluate(() => window.J.clipNames())) {       // let every clip run right through once
  await page.evaluate(n => window.J.play(n), name);
  await page.waitForTimeout(Math.min(1500, 1000 * await page.evaluate(n => window.J.dur(n), name)));
}
await page.evaluate(() => { window.J.toggle('sheet', false); window.J.toggle('bones', false); window.J.toggle('turn', false); window.J.toggle('roam', false); window.J.toggle('veil', true); window.J.setView('free'); window.J.play('Walk'); });
const t0 = Date.now(); const f0 = await page.evaluate(() => window.__frames = 0);
await page.waitForTimeout(600);
if (process.argv[3]) await page.screenshot({ path: process.argv[3] });
const errs = await page.evaluate(() => window.J.errors());
console.log(`${W}x${H}: pressed ${pressed} buttons [${buttons.join(', ')}]`);
console.log(logs.length || errs ? ['ERRORS', ...logs, errs].join('\n') : 'no errors');
await browser.close(); server.close();
