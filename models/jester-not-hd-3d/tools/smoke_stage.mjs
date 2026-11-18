// Frames are stepped by hand (#test), because software rendering here is far slower than a real screen.
// Open the training square the way a person does: drag the pad, look around, cast every spell, flip the switches. Report any errors.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright-core';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'viewer');
const [W, H] = (process.argv[2] || '390x800').split('x').map(Number);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) logs.push('console: ' + m.text()); });
page.on('pageerror', e => logs.push('pageerror: ' + e.message));
await page.goto(`http://localhost:${server.address().port}/stage.html#test`);
await page.waitForFunction(() => window.J && window.J.ready, null, { timeout: 90000 });
const pad = await (await page.$('#pad')).boundingBox(), cx = pad.x + pad.width / 2, cy = pad.y + pad.height / 2;
const start = await page.evaluate(() => [window.J.me.x, window.J.me.z]);
await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 20, cy - 50, { steps: 4 }); await page.evaluate(() => window.J.run(1.5)); await page.mouse.up(); await page.evaluate(() => window.J.run(0.5));
const moved = await page.evaluate(() => [window.J.me.x, window.J.me.z]);
await page.mouse.move(W / 2, H * 0.3); await page.mouse.down(); await page.mouse.move(W / 2 + 80, H * 0.3 + 20, { steps: 5 }); await page.mouse.up();
const cast = [];
for (const name of await page.evaluate(() => window.J.spellNames())) {
  await page.click(`#spells button[data-spell="${name}"]`);
  if (!(await page.evaluate(() => window.J.busy()))) throw new Error(name + ' did not start');
  if (name === 'Gravity') { await page.click('#bPixel'); await page.click('#bVeil'); }
  for (let k = 0; k < 40 && await page.evaluate(() => window.J.busy()); k++) await page.evaluate(() => window.J.run(0.5));
  if (await page.evaluate(() => window.J.busy())) throw new Error(name + ' never finished');
  cast.push(name);
}
// the whole of Doom on the dummy: Sealed Fate marks it, the mark counts down, Doom takes it, a new dummy is stood up
await page.evaluate(() => window.J.run(12));
const doom = [];
await page.click('#spells button[data-spell="SealedFate"]');
for (let k = 0; k < 80; k++) { await page.evaluate(() => window.J.run(0.25)); const f = await page.evaluate(() => { const f = window.J.fate; return (f.away ? 'gone' : f.doom ? 'falling' : f.count ? 'marked ' + f.count : 'clear'); }); if (doom[doom.length - 1] !== f) doom.push(f); if (doom.length > 3 && f === 'clear') break; }
await page.click('#bSlow'); await page.evaluate(() => window.J.run(0.5)); await page.click('#bSlow');
if (process.argv[3]) await page.screenshot({ path: process.argv[3] });
const errs = await page.evaluate(() => window.J.errors());
console.log('  Doom on the dummy: ' + doom.join(' > '));
console.log(`${W}x${H}: walked ${Math.hypot(moved[0] - start[0], moved[1] - start[1]).toFixed(2)} m, cast ${cast.join(', ')}`);
console.log(logs.length || errs ? ['ERRORS', ...logs, errs].join('\n') : 'no errors');
await browser.close(); server.close();
