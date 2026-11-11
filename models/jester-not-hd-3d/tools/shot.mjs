// Render stills of the viewer in headless Chrome.
// usage: node tools/shot.mjs <outdir> <width>x<height> '<json list of shots>'
// shot: {name, view?, clip?, t?, bones?, sheet?, fade?, cam?:[px,py,pz,tx,ty,tz], js?}
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const [outdir, size, shotsJson] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
const shots = JSON.parse(shotsJson);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'viewer');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].split('#')[0]));
  const f = fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, 'index.html') : p;
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => logs.push('pageerror: ' + e.message));
await page.goto(`http://localhost:${port}/index.html#test`);
await page.waitForFunction(() => window.J && window.J.ready, null, { timeout: 60000 });
fs.mkdirSync(outdir, { recursive: true });
for (const s of shots) {
  await page.evaluate(s => {
    const J = window.J;
    J.toggle('bones', !!s.bones); J.toggle('sheet', !!s.sheet);
    if (s.fade !== undefined) { J.state.fade = s.fade; }
    J.setView(s.view || 'free');
    if (s.cam) J.cam(...s.cam);
    J.pose(s.clip || 'Stand', s.t || 0);
    J.frame(0); J.frame(0);
  }, s);
  const hide = s.ui ? '#nothing{}' : '#bar,#top{display:none!important}';
  const st = await page.addStyleTag({ content: hide });
  await page.evaluate(s => { window.dispatchEvent(new Event('resize')); if (s.js) (0, eval)(s.js); window.J.frame(0); }, s);
  await page.screenshot({ path: path.join(outdir, s.name + '.png') });
  await st.evaluate(n => n.remove());
}
const errs = await page.evaluate(() => window.J.errors());
if (errs) logs.push('page: ' + errs);
console.log(logs.length ? logs.join('\n') : 'no errors');
await browser.close(); server.close();
