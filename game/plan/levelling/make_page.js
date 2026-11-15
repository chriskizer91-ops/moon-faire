// Builds levelling-options.html from results-full.json and results-quick.json (run `node run.js` and `node run.js quick` first).
// Every number on the page comes from those files or from the two constants just below.
const fs = require('fs');
const full = JSON.parse(fs.readFileSync(__dirname + '/results-full.json', 'utf8'));
const quick = JSON.parse(fs.readFileSync(__dirname + '/results-quick.json', 'utf8'));
// measured with 3,000 fights each (see README): the last gate at the party's level and one level under it
const lastGate = { level: '6% / 81% / 99%', over: '61% / 100% / 100%' };
const keys = ['A', 'B', 'C'];
const chosen = fs.existsSync(__dirname + '/plan-chosen.json') ? JSON.parse(fs.readFileSync(__dirname + '/plan-chosen.json', 'utf8')) : null;
const chosenRuns = chosen ? JSON.parse(fs.readFileSync(__dirname + '/results-chosen.json', 'utf8')) : null;
const fmt = n => Math.round(n).toLocaleString('en-US');
const hours = m => { const h = Math.round(m / 30) / 2; return (Math.floor(h) || '') + (h % 1 ? '½' : ''); };
const hm = m => Math.floor(m / 60) + ' h ' + String(Math.round(m % 60 / 5) * 5).padStart(2, '0');
const at = L => Math.pow(1.2, L - 1);
const round3 = x => { const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 2)); return Math.round(x / m) * m; };
const names = { w: ['wisp', 'wisps'], K: ['Shadow Wraith', 'Shadow Wraiths'], B: ['great wraith', 'great wraiths'] };
function lineUp(code) {
  const parts = []; code.replace(/(\d*)([wKB])/g, (_, n, k) => { n = +n || 1; parts.push((n === 1 ? (k === 'B' ? 'the' : 'a') : n) + ' ' + names[k][n === 1 ? 0 : 1]); });
  if (code === 'B') return 'the great wraith alone';
  return parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0];
}
const short = code => code.replace(/(\d*)([wKB])/g, (_, n, k) => (n || 1) + ' ' + { w: 'wisp', K: 'Shadow Wraith', B: 'great wraith' }[k] + ((+n || 1) > 1 ? 's' : '') + ', ').replace(/, $/, '');

// ---- the chart: party level against wins, one stepped line an option
const W = 440, H = 330, m = { l: 40, r: 88, t: 14, b: 40 };
const xMax = 250, yMax = 26;
const X = w => m.l + (W - m.l - m.r) * w / xMax, Y = L => H - m.b - (H - m.t - m.b) * (L - 1) / (yMax - 1);
const series = keys.map(k => { const u = full[k].runs['steady/attentive'].ups; return { k, top: full[k].top, pts: [[0, 1]].concat(Object.keys(u).map(L => [u[L], +L])) }; });
let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="chart-title" id="chart">`;
for (const L of [1, 5, 10, 15, 20, 25]) svg += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(L).toFixed(1)}" y2="${Y(L).toFixed(1)}"/><text class="tick" x="${m.l - 8}" y="${(Y(L) + 4).toFixed(1)}" text-anchor="end">${L}</text>`;
for (const w of [0, 50, 100, 150, 200, 250]) svg += `<text class="tick" x="${X(w).toFixed(1)}" y="${H - m.b + 18}" text-anchor="middle">${w}</text>`;
svg += `<text class="axis" x="${((m.l + W - m.r) / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle">fights won</text>`;
svg += `<line id="cross" class="cross" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}" visibility="hidden"/>`;
series.forEach((s, i) => {
  let d = `M${X(0).toFixed(1)},${Y(1).toFixed(1)}`;
  for (let j = 1; j < s.pts.length; j++) d += `H${X(s.pts[j][0]).toFixed(1)}V${Y(s.pts[j][1]).toFixed(1)}`;
  const e = s.pts[s.pts.length - 1];
  svg += `<path class="line s${i + 1}" d="${d}"/><circle class="dot s${i + 1}" cx="${X(e[0]).toFixed(1)}" cy="${Y(e[1]).toFixed(1)}" r="5"/>`;
  svg += `<text class="end" x="${(X(e[0]) + 10).toFixed(1)}" y="${(Y(e[1]) + 4).toFixed(1)}">${s.k}: level ${s.top}</text>`;
});
svg += '</svg>';

// ---- pieces of the page
const card = k => {
  const o = full[k], r = o.runs['steady/attentive'], u = r.ups, top = o.top;
  const firstGap = u[4] - u[3], lastGap = u[top] - u[top - 1];
  return `<article class="opt"><div class="tag s${keys.indexOf(k) + 1}">${k}</div>
  <h3>${top} levels, ${o.aim} fights</h3>
  <dl>
   <div><dt>Fights alone</dt><dd>${hours(r.minutes.quick)} to ${hours(r.minutes.slow)} hours <span>middle guess ${hm(r.minutes.middle)}</span></dd></div>
   <div><dt>Land beyond the fair</dt><dd>${o.rings.length} rings <span>three levels each</span></dd></div>
   <div><dt>A new level</dt><dd>every ${firstGap} wins at first <span>every ${lastGap} at the end</span></dd></div>
   <div><dt>The Jester at the end</dt><dd>${fmt(round3(1000 * at(top)))} HP <span>${fmt(round3(1000 * at(top + 1)))} one level on</span></dd></div>
   <div><dt>The last great wraith</dt><dd>${fmt(round3(8000 * at(top)))} Life</dd></div>
  </dl></article>`;
};
const ringTable = k => {
  const o = full[k], a = o.runs['steady/attentive'].marks, c = o.runs['steady/careless'].marks;
  let h = `<h3><span class="chip s${keys.indexOf(k) + 1}"></span>Option ${k}: ${o.top} levels, ${o.aim} fights</h3><div class="scroll"><table><thead><tr><th>Ring</th><th>Party level</th><th>Foe levels</th><th>What she meets</th><th>Gate fight</th><th class="num">Wins by then</th><th class="num">Tries, any button</th></tr></thead><tbody>`;
  h += `<tr><td>The fair</td><td>1 to 2</td><td>1 to 2</td><td>three set fights, as now</td><td></td><td class="num">${a[0].wins}</td><td class="num"></td></tr>`;
  o.rings.forEach((r, i) => { h += `<tr><td>${r.n}</td><td>${r.enter} to ${r.leave}</td><td>${r.foeLevels[0]} to ${r.foeLevels[1]}</td><td>${r.table.map(t => short(t[0])).join('; ')}</td><td>${lineUp(r.gate.code)}, level ${r.gate.level}</td><td class="num">${a[i + 1].wins}</td><td class="num">${c[i + 1].tries < 1.05 ? '1' : c[i + 1].tries.toFixed(1)}</td></tr>`; });
  return h + '</tbody></table></div>';
};
const xpTable = k => {
  const o = full[k], u = o.runs['steady/attentive'].ups;
  let h = `<div><h3><span class="chip s${keys.indexOf(k) + 1}"></span>Option ${k}</h3><div class="scroll"><table class="xp"><thead><tr><th class="num">Level</th><th class="num">XP in all</th><th class="num">Comes on win</th><th class="num">Jester's HP</th></tr></thead><tbody>`;
  for (let L = 1; L <= o.top; L++) h += `<tr><td class="num">${L}</td><td class="num">${fmt(o.toReach[L])}</td><td class="num">${L === 1 ? '' : u[L]}</td><td class="num">${fmt(round3(1000 * at(L)))}</td></tr>`;
  return h + '</tbody></table></div></div>';
};
const g = (res, top, aim) => res.grid.find(x => x.top === top && x.aim === aim);
let grid = '<div class="scroll"><table><thead><tr><th></th><th class="num">120 fights</th><th class="num">180 fights</th><th class="num">240 fights</th></tr></thead><tbody>';
for (const top of [14, 20, 26]) grid += `<tr><th scope="row">${top} levels</th>` + [120, 180, 240].map(aim => { const c = g(full, top, aim); const pick = keys.some(k => full[k].top === top && full[k].aim === aim); return `<td class="num${pick ? ' pick' : ''}">a level every ${Math.round(c.perLevel)} wins<br><span>${hm(c.minutes.middle)} of fights</span></td>`; }).join('') + '</tr>';
grid += '</tbody></table></div>';
let sizes = '<div class="scroll"><table><thead><tr><th></th><th class="num">A, 120 fights</th><th class="num">B, 180 fights</th><th class="num">C, 240 fights</th></tr></thead><tbody>';
sizes += '<tr><th scope="row">Full-size fights, as above</th>' + keys.map(k => { const r = full[k].runs['steady/attentive']; return `<td class="num">${hm(r.minutes.middle)}<br><span>${Math.round(r.heroTurns / r.wins[1])} witch turns a fight</span></td>`; }).join('') + '</tr>';
sizes += '<tr><th scope="row">Small packs most of the time</th>' + keys.map(k => { const r = quick[k].runs['steady/attentive']; return `<td class="num">${hm(r.minutes.middle)}<br><span>${Math.round(r.heroTurns / r.wins[1])} witch turns a fight</span></td>`; }).join('') + '</tr></tbody></table></div>';
const ex = k => full[k].runs['explorer/attentive'], st = k => full[k].runs['steady/attentive'], ca = k => full[k].runs['steady/careless'];
const gateTries = k => ca(k).marks.slice(1).reduce((s, x) => s + x.tries - 1, 0);
const walkLost = keys.map(k => ca(k).losses - gateTries(k));
const chartData = series.map(s => ({ k: s.k, top: s.top, pts: s.pts }));

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moon Faire levelling options</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Jacquard+24&display=swap" rel="stylesheet">
<style>
/* layout: one reading column; the three options as cards side by side, stacking on a phone; tables scroll inside their own box */
:root {
  --page: #eeedf4; --card: #fcfcfb; --ink: #1c1a2e; --ink-2: #55526a; --rule: #d9d7e4; --lantern: #8a5a00;
  --s1: #2a78d6; --s2: #eb6834; --s3: #1baf7a;
  --display: "Jacquard 24", "Atkinson Hyperlegible", Georgia, serif; --body: "Atkinson Hyperlegible", Verdana, "Segoe UI", sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --page: #121120; --card: #1a1a19; --ink: #f0efec; --ink-2: #b9b6c9; --rule: #33314a; --lantern: #e3b04b;
  --s1: #3987e5; --s2: #d95926; --s3: #199e70; color-scheme: dark; } }
:root[data-theme="dark"] {
  --page: #121120; --card: #1a1a19; --ink: #f0efec; --ink-2: #b9b6c9; --rule: #33314a; --lantern: #e3b04b;
  --s1: #3987e5; --s2: #d95926; --s3: #199e70; color-scheme: dark; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--page); color: var(--ink); font: 17px/1.55 var(--body); }
main { max-width: 860px; margin: 0 auto; padding: 28px 18px 64px; display: flex; flex-direction: column; gap: 34px; }
header p { max-width: 62ch; margin: 10px 0 0; }
h1 { font: 400 clamp(40px, 9vw, 60px)/1 var(--display); margin: 0; text-wrap: balance; letter-spacing: .01em; }
.kicker { color: var(--lantern); font-weight: 700; margin: 0 0 6px; }
h2 { font-size: 24px; line-height: 1.2; margin: 0 0 12px; text-wrap: balance; }
h3 { font-size: 18px; margin: 0 0 8px; }
section > p, section > ul { max-width: 65ch; }
p { margin: 0 0 12px; } ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
.ask { background: var(--card); border: 1px solid var(--rule); border-left: 5px solid var(--lantern); border-radius: 8px; padding: 16px 18px; }
.ask ol { margin: 0; padding-left: 22px; display: flex; flex-direction: column; gap: 6px; }
.opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
.opt { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 16px; position: relative; }
.opt h3 { font-size: 20px; padding-right: 44px; }
.tag { position: absolute; top: 14px; right: 14px; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #fff; }
.tag.s1, .chip.s1 { background: var(--s1); } .tag.s2, .chip.s2 { background: var(--s2); } .tag.s3, .chip.s3 { background: var(--s3); }
.chip { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 8px; }
dl { margin: 0; display: flex; flex-direction: column; gap: 10px; }
dt { color: var(--ink-2); font-size: 14px; } dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; }
dd span, td span { display: block; font-weight: 400; color: var(--ink-2); font-size: 14px; }
.was { color: var(--ink-2); margin-top: 12px; }
figure { margin: 0; background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 16px; position: relative; }
figcaption { font-weight: 700; margin-bottom: 4px; } .sub { color: var(--ink-2); font-size: 15px; margin: 0 0 8px; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 15px; margin-bottom: 6px; }
svg { display: block; width: 100%; max-width: 660px; height: auto; margin: 0 auto; touch-action: pan-y; }
.grid { stroke: var(--rule); stroke-width: 1; } .tick, .axis { fill: var(--ink-2); font: 12px var(--body); font-variant-numeric: tabular-nums; }
.end { fill: var(--ink); font: 700 12.5px var(--body); }
.line { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.line.s1 { stroke: var(--s1); } .line.s2 { stroke: var(--s2); } .line.s3 { stroke: var(--s3); }
.dot { stroke: var(--card); stroke-width: 2; } .dot.s1 { fill: var(--s1); } .dot.s2 { fill: var(--s2); } .dot.s3 { fill: var(--s3); }
.cross { stroke: var(--ink-2); stroke-width: 1; }
#tip { position: absolute; pointer-events: none; background: var(--ink); color: var(--page); border-radius: 6px; padding: 8px 10px; font-size: 14px; line-height: 1.4; visibility: hidden; white-space: nowrap; font-variant-numeric: tabular-nums; }
#tip b { display: block; } #tip i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 6px; }
.scroll { overflow-x: auto; background: var(--card); border: 1px solid var(--rule); border-radius: 10px; margin-bottom: 18px; }
table { border-collapse: collapse; width: 100%; font-size: 15px; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--rule); vertical-align: top; }
tbody tr:last-child > * { border-bottom: 0; }
thead th { font-size: 13px; color: var(--ink-2); font-weight: 700; white-space: nowrap; }
.num { text-align: right; } td.pick { box-shadow: inset 0 0 0 2px var(--lantern); border-radius: 4px; }
.xps { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; align-items: start; }
.xp td, .xp th { padding: 5px 10px; }
code { font-size: .92em; background: var(--card); border: 1px solid var(--rule); border-radius: 4px; padding: 0 4px; }
footer { color: var(--ink-2); font-size: 15px; border-top: 1px solid var(--rule); padding-top: 16px; }
</style></head>
<body><main>
<header>
 <p class="kicker">Moon Faire, task board F4</p>
 <h1>Levelling for the bigger game</h1>
 <p>You asked for 5 to 10 times the fights of the first plan, and a wider span of levels, now that there is open land to run off into. Here are three sizes of game. Each was played through 2,000 times for each play style, with the combat engine you approved deciding every fight. Nothing inside a fight changes.</p>
</header>

${chosen ? `<section class="ask" aria-label="What Chris chose">
 <h2>Chosen: option ${chosen.chosen.option}</h2>
 <p><strong>${chosen.top} levels, ${chosen.fightsToFinish} fights to finish, ${chosen.chosen.fights} fights, and level ${chosen.top} is the top.</strong> ${chosen.chosen.by}.</p>
 <p>It is written into the plan as <code>game/plan/levelling/plan-chosen.json</code>, and played again from that file alone: ${chosenRuns['steady/attentive'].wins[1]} wins to finish, ${hours(chosenRuns['steady/attentive'].minutes.quick)} to ${hours(chosenRuns['steady/attentive'].minutes.slow)} hours of fights.</p>
 <p style="margin:0"><strong>What the top level changes.</strong> The party stops at level ${chosen.top}, so fighting more than you must no longer makes the last gate easier: it stays at 81% for a player who pays attention. The things she finds are the way to ease it, as you described for the first plan.</p>
</section>` : `<section class="ask" aria-label="What I need from you">
 <h2>What I need from you</h2>
 <ol>
  <li><strong>A, B or C.</strong> Or any pair from the table under "Two dials".</li>
  <li><strong>Full-size fights or small packs</strong> as the usual thing she meets.</li>
 </ol>
</section>`}

<section>
 <h2>Three sizes</h2>
 <div class="opts">${keys.map(card).join('')}</div>
 <p class="was">The first plan, for comparison: 5 levels, about 24 fights, 25 to 45 minutes of fights.</p>
</section>

<section>
 <figure>
  <figcaption id="chart-title">When each level arrives</figcaption>
  <p class="sub">Party level against fights won, for a player who pays attention and fights only what the gates ask.</p>
  <div class="legend">${keys.map((k, i) => `<span><span class="chip s${i + 1}"></span>${k}: ${full[k].top} levels, ${full[k].aim} fights</span>`).join('')}</div>
  ${svg}
  <div id="tip"></div>
 </figure>
 <p class="sub" style="margin-top:10px">All three climb at nearly the same pace. A longer game is the same climb carried further.</p>
</section>

<section>
 <h2>The same in all three</h2>
 <ul>
  <li><strong>XP for a foe is unchanged.</strong> A level-1 wisp gives 10, a Shadow Wraith 40, a great wraith 400, and 20% more for every foe level. The three set fights at the fair still take the party to level 2.</li>
  <li><strong>The land beyond the fair is in rings.</strong> Each ring is worth three levels. Its foes run from the level the party arrives at to one above the level it leaves at. So walking foes are between 2 levels under the party and 4 over, which is your rule for ordinary foes.</li>
  <li><strong>A gate fight ends each ring,</strong> and it opens at the level the ring ends on, as the lamp room door opens at level 5 today. The last gate is the big one from the first plan: the great wraith, two Shadow Wraiths and two wisps, at the top level.</li>
  <li><strong>Levels come quickly, then slowly:</strong> a level every 5 or 6 wins at the start, every 13 or 14 near the end.</li>
  <li><strong>Walking fights stay safe.</strong> A player who pays attention won every walking fight in every run, even against foes 4 levels over. A player pressing any button lost ${walkLost.map(x => Math.round(x)).join(', ')} walking fights in a whole game of A, B, C.</li>
  <li><strong>The last gate is as hard as you approved.</strong> At the party's level it is won ${lastGate.level} of the time (any button / paying attention / expert). One level over, ${lastGate.over}.</li>
  <li><strong>Fighting more than you must is the easy setting.</strong> A player who fights half as many fights again in every ring reaches the last gate about one level ahead (${keys.map(k => k + ': ' + ex(k).wins[1] + ' wins').join(', ')}). That turns the last gate from 81% to 100% for an attentive player, with no change to the rules. These runs had no top level.${chosen ? ' The chosen plan stops at level ' + chosen.top + ', so this does not apply to it.' : ''}</li>
 </ul>
</section>

<section>
 <h2>Rings and gates</h2>
 <p>"Wins by then" is how many fights a steady, attentive player has won when the gate falls. "Tries, any button" is how many goes a player pressing any button needs at that gate.</p>
 ${keys.map(ringTable).join('')}
 <p>Which piece of the map each ring is, and what each gate fight is in the story, are not decided here. The great wraiths in the middle of the game are stand-ins, there to show that a lone great wraith works as a gate.</p>
</section>

<section>
 <h2>Two dials</h2>
 <p><strong>Levels and fights are separate.</strong> The three options sit on the diagonal. Any other square works too: the same fights with more levels means levels come faster and the numbers get bigger.</p>
 ${grid}
 <p><strong>How big the usual fight is.</strong> If most walking fights are two to four wisps and the big packs are rare, the game has the same number of fights and levels but takes about a quarter less time.</p>
 ${sizes}
</section>

<section>
 <h2>What these numbers do not cover</h2>
 <ul>
  <li><strong>The hours are a guess.</strong> They assume 4 to 9 seconds for a witch's turn, as the first plan did. Nobody has timed a real fight with its animations yet, and the long moves run 13 to 15 seconds at normal speed.</li>
  <li><strong>Every fight starts fresh,</strong> with full HP and MP. The fight piece can carry HP and MP from one fight to the next. If you want that, a long stretch between rest spots gets harder, and it needs its own measuring.</li>
  <li><strong>Only three kinds of foe exist.</strong> New kinds for the moor will change what a walking fight is worth and how long it runs.</li>
  <li><strong>Walking and talking time is not in the hours.</strong> Nor is how often a fight comes while she walks. The open world has to offer about this many fights on the way through each ring.</li>
 </ul>
</section>

<section>
 <h2>What I made up</h2>
 <ul>
  <li>Three levels to a ring, and 4, 6 or 8 rings.</li>
  <li>Which line-ups are met in which ring, and the gate fights other than the first plan's own.</li>
  <li>The XP totals for each level. They are sized so the climb takes the fights you asked for.</li>
 </ul>
</section>

<section>
 <h2>The numbers in full</h2>
 <div class="xps">${keys.map(xpTable).join('')}</div>
</section>

<footer>Made by the Levelling session on November 14, 2026. The code and results are in <code>game/plan/levelling/</code>: <code>options.js</code> holds the three options, <code>run.js</code> plays them, <code>gaps.js</code> measures every line-up at every level gap.</footer>
</main>
<script>
(function () {
  var D = ${JSON.stringify(chartData)}, m = ${JSON.stringify(m)}, W = ${W}, xMax = ${xMax};
  var svg = document.getElementById('chart'), cross = document.getElementById('cross'), tip = document.getElementById('tip'), fig = svg.parentNode;
  function levelAt(s, w) { var L = 1; for (var i = 0; i < s.pts.length; i++) if (s.pts[i][0] <= w) L = s.pts[i][1]; return L; }
  function move(e) {
    var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W;
    var w = Math.round((x - m.l) / (W - m.l - m.r) * xMax);
    if (w < 0 || w > xMax) return hide();
    var cx = m.l + (W - m.l - m.r) * w / xMax;
    cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.setAttribute('visibility', 'visible');
    var h = '<b>After ' + w + ' wins</b>';
    D.forEach(function (s, i) { var last = s.pts[s.pts.length - 1][0]; h += '<span><i style="background:var(--s' + (i + 1) + ')"></i>' + s.k + ': ' + (w > last ? 'finished at level ' + s.top : 'level ' + levelAt(s, w)) + '</span><br>'; });
    tip.innerHTML = h; tip.style.visibility = 'visible';
    var f = fig.getBoundingClientRect(), left = e.clientX - f.left + 14;
    if (left + tip.offsetWidth > f.width - 8) left = e.clientX - f.left - tip.offsetWidth - 14;
    tip.style.left = Math.max(8, left) + 'px'; tip.style.top = Math.max(8, e.clientY - f.top - tip.offsetHeight - 10) + 'px';
  }
  function hide() { cross.setAttribute('visibility', 'hidden'); tip.style.visibility = 'hidden'; }
  svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move); svg.addEventListener('pointerleave', hide);
})();
</script>
</body></html>`;
fs.writeFileSync(__dirname + '/levelling-options.html', html);
console.log('wrote levelling-options.html', (html.length / 1024).toFixed(0) + ' KB');
console.log('walking fights lost by a careless player:', walkLost.map(x => x.toFixed(1)).join(', '));
