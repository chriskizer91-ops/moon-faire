// Play the game through with a simple bot and report how it went and any errors.
// Frames are stepped by hand (#test), because software rendering here is far slower than a real screen.
// usage: node tools/smoke_game.mjs [WxH] [screenshot.png] [careless]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright-core';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'viewer');
const [W, H] = (process.argv[2] || '390x800').split('x').map(Number), careless = process.argv[4] === 'careless';
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
await page.goto(`http://localhost:${server.address().port}/game.html#test`);
await page.waitForFunction(() => window.J && window.J.ready, null, { timeout: 90000 });
await page.click('#go');
const out = await page.evaluate(careless => {
  const J = window.J, used = {}, log = [];
  let wave = -1;
  for (let step = 0; step < 4000; step++) {
    const s = J.look();
    if (s.mode !== 'play') break;
    if (s.wave !== wave) { wave = s.wave; log.push(`wave ${wave + 1} at ${s.time.toFixed(0)} s, HP ${Math.round(s.hp)}`); }
    const live = s.foes.filter(f => !f.dead), near = live.sort((a, b) => a.dist - b.dist)[0], t = s.target >= 0 ? s.foes[s.target] : null;
    // step away from whatever is closest (the pad is relative to the camera, which starts behind her looking along +z)
    const keep = { wisp: 0, wraith: 3.6, great: 6 }, threat = careless ? null : live.filter(f => f.dist < keep[f.kind]).sort((a, b) => a.dist - b.dist)[0];
    if (threat) { let dx = s.x - threat.x, dz = s.z - threat.z; const d = Math.hypot(dx, dz) || 1, r = Math.hypot(s.x, s.z); dx /= d; dz /= d; if (r > 6.5) { dx += -s.z / r * 1.2; dz += s.x / r * 1.2; } const m = Math.hypot(dx, dz); J.stick.x = -dx / m; J.stick.y = dz / m; } else { J.stick.x = 0; J.stick.y = 0; }   // near the kerb, slide round it
    if (!s.locked && t) {
      const ready = n => !(s.cds[n] > 0);
      const boss = live.find(f => f.kind === 'great');
      let pick = 'GildedRebuke';
      if (!careless) {
        if (s.curtain >= 100 && !s.usedUlt && s.mp >= 54 && (boss || live.length >= 4)) pick = 'CurtainCall';
        else if (boss && boss.state === 'breath' && ready('Hush') && s.mp >= 12) pick = 'Hush';
        else if (s.hp < 400 && ready('AgainstAllOdds') && s.mp >= 26) pick = 'AgainstAllOdds';
        else if (t.hp > 500 && ready('Gravity') && s.mp >= 24) pick = 'Gravity';
        else if (t.hp > 170 && !(t.doom > 0) && ready('SealedFate') && s.mp >= 18) pick = 'SealedFate';
      }
      if (J.cast(pick)) used[pick] = (used[pick] || 0) + 1;
    }
    J.run(0.2, 1 / 30, false);
  }
  const s = J.look();
  return { mode: s.mode, time: s.time, hp: s.hp, released: s.released, wave: s.wave + 1, used, log, tally: s.tally };
}, careless);
await page.evaluate(() => window.J.frame(0));
if (process.argv[3]) await page.screenshot({ path: process.argv[3] });
const errs = await page.evaluate(() => window.J.errors());
console.log(`${W}x${H}${careless ? ' (careless bot)' : ''}: ${out.mode} after ${out.time.toFixed(0)} s, wave ${out.wave}, HP ${Math.round(out.hp)}, released ${out.released}`);
console.log('  ' + out.log.join('; ')); console.log('  casts: ' + JSON.stringify(out.used)); console.log('  damage she took, by source: ' + JSON.stringify(out.tally));
console.log(logs.length || errs ? ['ERRORS', ...logs, errs].join('\n') : 'no errors');
await browser.close(); server.close();
