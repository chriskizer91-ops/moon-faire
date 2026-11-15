// Builds finds.html from finds.json, each.json, profiles.json and target.json.
const fs = require('fs');
const { execFileSync } = require('child_process');
const rd = f => JSON.parse(fs.readFileSync(__dirname + '/' + f, 'utf8'));
const J = rd('finds.json'), E = rd('each.json'), P = rd('profiles.json'), T = rd('target.json');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pc = x => Math.round(x * 100) + '%';
const pts = x => { const v = Math.round(x * 100); return (v > 0 ? '+' : '') + v; };
// small copies of the painted cards, made by the Python beside this file
const thumbs = JSON.parse(execFileSync('python3', ['-I', __dirname + '/thumbs.py', __dirname + '/../../art/items'].concat(J.finds.map(f => f.id)), { maxBuffer: 1 << 26 }).toString());
const howClass = { 'on the way': 'h1', 'off the path': 'h2', 'hidden': 'h3' };
const card = f => {
  const a = f.aloneAtTheLastGate;
  const worth = Math.abs(a.attentive) < 0.01 && Math.abs(a.careless) < 0.01 ? 'too small for the runs to see' : `${pts(a.attentive)} points paying attention, ${pts(a.careless)} pressing any button`;
  const img = thumbs[f.id] ? `<img alt="" src="${thumbs[f.id]}">` : '<div class="topaint">to paint</div>';
  return `<article class="find">${img}<div>
   <h4>${esc(f.name)}${f.new ? ' <span class="new">new</span>' : ''}</h4>
   <p class="does">${esc(f.does)}</p>
   <p class="card">${esc(f.card)}</p>
   <p class="meta"><span class="how ${howClass[f.how]}">${f.how}</span>${f.witch ? ' for ' + (f.witch === 'Io' ? 'Io' : 'the ' + f.witch) + '.' : ''} Alone at the last gate: ${worth}.</p>
  </div></article>`;
};
const ringNames = { 1: 'party level 2 to 5', 2: 'party level 5 to 8', 3: 'party level 8 to 11', 4: 'party level 11 to 14', 5: 'party level 14 to 17', 6: 'party level 17 to 20' };
const rings = [1, 2, 3, 4, 5, 6].map(r => `<h3>Ring ${r} <span class="lvl">${ringNames[r]}</span></h3><div class="finds">${J.finds.filter(f => f.ring === r).map(card).join('')}</div>`).join('');
const last = P.gates[2], r5 = P.gates[1], r4 = P.gates[0];
const tries = x => (1 / Math.max(x, 0.001)).toFixed(x > 0.5 ? 1 : 0);
let strength = '<div class="scroll"><table><thead><tr><th>She has found</th><th class="num">Paying attention</th><th class="num">Pressing any button</th></tr></thead><tbody>';
last.kinds.forEach(k => { strength += `<tr><th scope="row">${k.label}<span class="n">${k.finds} finds</span></th><td class="num"><b>${pc(k.r.attentive.win)}</b></td><td class="num">${pc(k.r.careless.win)}<span>${tries(k.r.careless.win)} tries</span></td></tr>`; });
strength += '</tbody></table></div>';
const tg = (gap, k) => T.rows.find(r => r.gap === gap && r.k === k).r;
let bigbad = '<div class="scroll"><table><thead><tr><th>The last fight\'s foes are</th><th class="num">With no finds</th><th class="num">With all eighteen</th></tr></thead><tbody>';
for (const [gap, name] of [[0, 'level 20, the party\'s own'], [1, 'level 21'], [2, 'level 22'], [3, 'level 23']]) {
  const a = tg(gap, 0), b = tg(gap, 1);
  bigbad += `<tr><th scope="row">${name}</th><td class="num"><b>${pc(a.attentive)}</b> paying attention<span>${pc(a.expert)} expert</span></td><td class="num"><b>${pc(b.attentive)}</b> paying attention<span>${pc(b.expert)} expert</span></td></tr>`;
}
bigbad += '</tbody></table></div>';
let earlier = '<div class="scroll"><table><thead><tr><th>She has found</th><th class="num">The great wraith alone, level 14</th><th class="num">The level-17 gate</th></tr></thead><tbody>';
r4.kinds.forEach((k, i) => { earlier += `<tr><th scope="row">${k.label}</th><td class="num">${pc(k.r.careless.win)}<span>${k.finds} finds</span></td><td class="num">${pc(r5.kinds[i].r.careless.win)}<span>${r5.kinds[i].finds} finds</span></td></tr>`; });
earlier += '</tbody></table></div>';
const each = id => E.each[id].r.B2K2w, base = E.base.B2K2w, dd = (id, s) => pts(each(id)[s].win - base[s].win);
const e2 = tg(2, 0), a2 = tg(2, 1), e1 = tg(1, 0), a1 = tg(1, 1), e3 = tg(3, 0), a3 = tg(3, 1);

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moon Faire finds</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Jacquard+24&display=swap" rel="stylesheet">
<style>
/* layout: one reading column; the finds as a list of cards, picture left and words right; tables and prompts scroll inside their own box */
:root {
  --page: #eeedf4; --card: #fcfcfb; --ink: #1c1a2e; --ink-2: #55526a; --rule: #d9d7e4; --lantern: #8a5a00; --cloth: #241c2b;
  --way: #2f6f4f; --off: #8a5a00; --hid: #6a3fa0;
  --display: "Jacquard 24", "Atkinson Hyperlegible", Georgia, serif; --body: "Atkinson Hyperlegible", Verdana, "Segoe UI", sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --page: #121120; --card: #1a1a19; --ink: #f0efec; --ink-2: #b9b6c9; --rule: #33314a; --lantern: #e3b04b; --cloth: #241c2b;
  --way: #6fc79a; --off: #e3b04b; --hid: #b99be8; color-scheme: dark; } }
:root[data-theme="dark"] {
  --page: #121120; --card: #1a1a19; --ink: #f0efec; --ink-2: #b9b6c9; --rule: #33314a; --lantern: #e3b04b; --cloth: #241c2b;
  --way: #6fc79a; --off: #e3b04b; --hid: #b99be8; color-scheme: dark; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--page); color: var(--ink); font: 17px/1.55 var(--body); }
main { max-width: 860px; margin: 0 auto; padding: 28px 18px 64px; display: flex; flex-direction: column; gap: 34px; }
header p { max-width: 62ch; margin: 10px 0 0; }
h1 { font: 400 clamp(40px, 9vw, 60px)/1 var(--display); margin: 0; text-wrap: balance; letter-spacing: .01em; }
.kicker { color: var(--lantern); font-weight: 700; margin: 0 0 6px; }
h2 { font-size: 24px; line-height: 1.2; margin: 0 0 12px; text-wrap: balance; }
h3 { font-size: 19px; margin: 22px 0 10px; } h3 .lvl { font-weight: 400; color: var(--ink-2); font-size: 15px; margin-left: 6px; }
h4 { font-size: 17px; margin: 0 0 2px; }
section > p, section > ul, section > ol { max-width: 65ch; }
p { margin: 0 0 12px; } ul, ol { margin: 0; padding-left: 22px; display: flex; flex-direction: column; gap: 8px; }
.ask { background: var(--card); border: 1px solid var(--rule); border-left: 5px solid var(--lantern); border-radius: 8px; padding: 16px 18px; }
.finds { display: flex; flex-direction: column; gap: 10px; }
.find { display: grid; grid-template-columns: 84px 1fr; gap: 14px; background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 12px; align-items: start; }
.find img, .topaint { width: 84px; height: 84px; border-radius: 8px; background: var(--cloth); display: block; }
.topaint { display: grid; place-items: center; color: #b9b6c9; font-size: 13px; border: 1px dashed #6b6480; }
.new { font-size: 12px; font-weight: 400; color: var(--ink-2); border: 1px solid var(--rule); border-radius: 20px; padding: 1px 8px; margin-left: 6px; white-space: nowrap; }
.does { font-weight: 700; margin: 0 0 4px; } .card { margin: 0 0 6px; color: var(--ink-2); font-style: italic; } .meta { margin: 0; font-size: 14px; color: var(--ink-2); }
.how { font-weight: 700; } .how.h1 { color: var(--way); } .how.h2 { color: var(--off); } .how.h3 { color: var(--hid); }
.scroll { overflow-x: auto; background: var(--card); border: 1px solid var(--rule); border-radius: 10px; margin-bottom: 14px; }
table { border-collapse: collapse; width: 100%; font-size: 15px; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--rule); vertical-align: top; }
tbody tr:last-child > * { border-bottom: 0; } tbody th { font-weight: 400; }
thead th { font-size: 13px; color: var(--ink-2); font-weight: 700; } .grp { border-left: 1px solid var(--rule); }
.num { text-align: right; } td span, th span.n { display: block; color: var(--ink-2); font-size: 13px; }
.prompt { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; margin-bottom: 14px; overflow: hidden; }
.phead { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--rule); }
.phead span { display: block; font-size: 14px; color: var(--ink-2); }
button { font: 700 15px var(--body); color: var(--page); background: var(--ink); border: 0; border-radius: 8px; padding: 9px 14px; cursor: pointer; }
button:focus-visible, pre:focus-visible { outline: 3px solid var(--lantern); outline-offset: 2px; }
pre { margin: 0; padding: 14px; max-height: 220px; overflow: auto; font: 13px/1.5 ui-monospace, Menlo, Consolas, monospace; white-space: pre-wrap; }
code { font-size: .92em; background: var(--card); border: 1px solid var(--rule); border-radius: 4px; padding: 0 4px; }
footer { color: var(--ink-2); font-size: 15px; border-top: 1px solid var(--rule); padding-top: 16px; }
@media (max-width: 420px) { .find { grid-template-columns: 64px 1fr; } .find img, .topaint { width: 64px; height: 64px; } }
</style></head>
<body><main>
<header>
 <p class="kicker">Moon Faire, task board S5</p>
 <h1>Finds for the bigger game</h1>
 <p>Eighteen finds, three in each of the six rings: one on the way, one off the path, one hidden. Five are the cards the game already had and thirteen are new. All eighteen are painted now.</p>
</header>

<section class="ask" aria-label="What you decided">
 <h2>What you decided on November 15</h2>
 <ul>
  <li><strong>Half strength.</strong> Every percentage on this page is half of what I first proposed.</li>
  <li><strong>The names and cards work.</strong> They are no longer stand-ins.</li>
  <li><strong>The two MP finds stay,</strong> because fights will start with the MP she has, and she will have to refill it.</li>
  <li><strong>A big bad at level 21 or 22,</strong> against a party that stops at 20, so anyone can see the whole game but winning it takes real effort. Only an expert who has found everything should just barely win.</li>
 </ul>
</section>

<section>
 <h2>Against a big bad at level 21 or 22</h2>
 <p>This is today's last fight (the great wraith, two Shadow Wraiths and two wisps) with its foes moved up, since the big bad itself is not designed yet. ${T.n.toLocaleString('en-US')} fights for every number.</p>
 ${bigbad}
 <p><strong>At level 21</strong> a player paying attention wins ${pc(e1.attentive)} of the time with nothing and ${pc(a1.attentive)} with every find. An expert hardly notices: ${pc(e1.expert)} and ${pc(a1.expert)}.</p>
 <p><strong>At level 22</strong> nobody but an expert wins at all, which is what you asked for. But an expert already wins ${pc(e2.expert)} with nothing and ${pc(a2.expert)} with every find, and that is well past "just barely". At level 23 even an expert with everything wins ${pc(a3.expert)}.</p>
 <p>So your aim sits between 22 and 23 for this line-up. A big bad at level 22 that is a little tougher than today's last fight would put the expert with everything at "just barely". That is a number to set when the big bad is designed, and when fights carry HP and MP over, which will change all of this.</p>
</section>

<section>
 <h2>At the party's own level, as the last gate stands today</h2>
 <p>${P.n.toLocaleString('en-US')} fights for every number.</p>
 ${strength}
 <h3>The two gates before it, for a player pressing any button</h3>
 <p>A player paying attention never loses these.</p>
 ${earlier}
</section>

<section>
 <h2>The eighteen finds</h2>
 <p>"Alone at the last gate" is what one find is worth by itself there, in points of winning. Which piece of the map each ring is, and exactly where each find lies, are not decided here.</p>
 ${rings}
</section>

<section>
 <h2>What the measuring found</h2>
 <ul>
  <li><strong>HP is the strongest thing a find can give.</strong> At the sizes first proposed, 2% more HP was worth ${dd('hp2', 'attentive')} points at the last gate and 5% was worth ${dd('hp5', 'attentive')}; 5% stronger healing was worth ${dd('heal5', 'attentive')}. This is what your combat notes said.</li>
  <li><strong>MP finds do nothing while every fight starts with full MP.</strong> Once fights start with the MP she has, they will matter. That is not measured yet.</li>
  <li><strong>The curtain weight is the big one.</strong> At 25% it was worth ${dd('splash', 'attentive')} points alone. It is the hidden find of ring 5, and it is meant to feel like a prize.</li>
  <li><strong>Two finds are worth more than the runs show.</strong> The pretend player who pays attention never calls the Fox's ghost and seldom leans on Bloom, so The spare outline and The fourth seed barely register. A real player who uses them will get more. The new testers you asked for should fix this.</li>
  <li><strong>Left out on purpose.</strong> The Ranger's gem ready a turn sooner was worth ${dd('gem1', 'attentive')} points alone, which is too much. The Jester catching a fourth blow helped nobody. Getting up for the bow at 50% changed no result.</li>
 </ul>
</section>

<footer>Made by the Levelling session on November 14 and 15, 2026. The finds as data, the measurements and the pictures' prompts are in <code>game/plan/finds/</code>; the pictures are in <code>game/art/items/</code>.</footer>
</main>
</body></html>`;
fs.writeFileSync(__dirname + '/finds.html', html);
console.log('wrote finds.html', (html.length / 1024).toFixed(0) + ' KB;', Object.keys(thumbs).length, 'pictures');
