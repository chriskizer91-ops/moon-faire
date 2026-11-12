// Play the turn-based fight through in headless Chrome and report how it went and any errors.
// Frames are stepped by hand (#test), because software rendering here is far slower than a real screen.
// usage: node tools/smoke_battle.mjs [WxH] [stills dir] [well|attack|slow] [pixel] [levels]
//   well: Doom at once, then stay alive. attack: only attacks. slow: no Doom or Curtain Call, to see the long fight
//   stills dir: saves a picture the first time each command and each wraith move plays, and at the end
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright-core';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'viewer');
const [W, H] = (process.argv[2] || '390x800').split('x').map(Number), dir = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null;
const how = process.argv[4] || 'well', pixel = process.argv[5] === 'pixel', levels = +(process.argv[6] || 1);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: W < 600 });
const logs = [];
page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) logs.push('console: ' + m.text()); });
page.on('pageerror', e => logs.push('pageerror: ' + e.message));
await page.goto(`http://localhost:${server.address().port}/battle.html#test`);
await page.waitForFunction(() => window.J && window.J.ready, null, { timeout: 90000 });
if (dir) fs.mkdirSync(dir, { recursive: true });
let nth = 0;
const snap = async name => { if (!dir) return; await page.evaluate(() => window.J.frame(0)); await page.screenshot({ path: path.join(dir, String(nth++).padStart(2, '0') + '-' + name + '.png') }); };
await snap('title');
if (pixel) await page.click('#bPixel');
await page.click('#go');

// the same careful player as tools/sim_battle.mjs, reading the page's own state
const choose = (s, how) => {
  const h = s.hero, f = s.foe, can = id => s.menuAll.includes(id);
  if (how === 'attack') return 'attack';
  if (how === 'slow') return h.hp <= 0.4 * h.maxHp && can('odds') ? 'odds' : s.turn === 1 && can('gravity') ? 'gravity' : can('hush') && s.turn % 3 === 2 ? 'hush' : s.turn % 2 ? 'attack' : 'defend';
  if (can('curtain')) return 'curtain';
  if (can('fate')) return 'fate';
  if (h.hp <= 0.4 * h.maxHp && can('odds')) return 'odds';
  if (f.doom > 0) return can('hush') ? 'hush' : 'defend';
  return 'attack';
};
const seen = new Set(), used = {}, foeUsed = {}, results = [], trace = [];
let pending = null, lastAct = '', turn = 0;
for (let level = 1; level <= levels; level++) {
  turn = 0;
  for (let step = 0; step < 3000; step++) {
    const s = await page.evaluate(() => { const J = window.J, l = J.look(), R = J.RULES, S = J.B.S; return { ...l, k: S ? S.k : 1, menuAll: S && l.choosing ? Object.keys(R.CMD).filter(id => !R.why(S, id)) : [] }; });
    if (s.state === 'over' && s.tasks === 0) { results.push(s); break; }
    if (s.choosing) {
      if (pending && pending.t > 0) pending = null;
      turn++; const id = choose({ ...s, turn }, how);
      used[id] = (used[id] || 0) + 1; trace.push(`${id}(she ${s.hero.hp}hp ${s.hero.mp}mp, it ${s.foe.hp}${s.foe.doom ? ' doom' + s.foe.doom : ''}${s.foe.silence ? ' sil' + s.foe.silence : ''})`);
      if (!seen.has('menu')) { seen.add('menu'); await snap('menu'); }
      if (id !== 'attack' && id !== 'defend' && !seen.has('magic')) { seen.add('magic'); await page.evaluate(() => window.J.choose('magic')); await snap('magic'); await page.evaluate(() => window.J.choose('back')); }
      if (id === 'attack' && !seen.has('tap')) { seen.add('tap'); await page.click('#cmd button:first-of-type'); }     // once, by a real tap on the menu
      else await page.evaluate(id => window.J.choose(id), id);
      if (!seen.has(id)) { seen.add(id); pending = { name: id, at: [0.9, 2.2, 3.4, 4.6, 5.8], t: 0 }; }
    }
    const act = s.wraith ? s.wraith.action : '';
    if (act !== lastAct) { lastAct = act; if (['sweep', 'cast', 'grasp', 'eclipse', 'die'].includes(act)) { foeUsed[act] = (foeUsed[act] || 0) + 1; if (!seen.has(act)) { seen.add(act); pending = { name: act, at: act === 'die' ? [1.0, 2.4, 3.6] : [0.7, 1.2, 1.8, 2.4], t: 0 }; } } }
    const dt = 0.1;
    await page.evaluate(dt => window.J.run(dt, 1 / 30, false), dt);
    if (pending) { pending.t += dt; if (pending.t >= pending.at[0] - 1e-6) { await snap(pending.name + '-' + pending.at.shift().toFixed(1)); if (!pending.at.length) pending = null; } }
  }
  const r = results[results.length - 1];
  if (!r) { console.log('did not finish'); break; }
  await snap('end-level' + level);
  console.log(`${W}x${H}${pixel ? ' pixel finish' : ''}, level ${level}, ${how}: ${r.over} after ${r.time.toFixed(0)} s of game time, ${turn} of her turns, HP ${r.hero.hp}/${r.hero.maxHp}, MP ${r.hero.mp}, wraith ${r.foe.hp}/${r.foe.maxHp}`);
  if (level < levels && r.over === 'won') await page.click('#endCard .go'); else break;
}
console.log('  turn by turn: ' + trace.join(' > '));
console.log('  her commands: ' + JSON.stringify(used) + '   its moves: ' + JSON.stringify(foeUsed));
const errs = await page.evaluate(() => window.J.errors());
console.log(logs.length || errs ? ['ERRORS', ...logs, errs].join('\n') : 'no errors');
await browser.close(); server.close();
