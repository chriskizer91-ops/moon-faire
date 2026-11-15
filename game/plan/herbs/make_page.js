// Builds herbs.html from results-mp20.json.
const fs = require('fs');
const D = JSON.parse(fs.readFileSync(__dirname + '/results-mp20.json', 'utf8'));
const { HERBS, HABIT, PLAN } = require('./journey.js');
const CH = JSON.parse(fs.readFileSync(__dirname + '/chosen.json', 'utf8'));
const LF = JSON.parse(fs.readFileSync(__dirname + '/../testers/lastfight.json', 'utf8'));
const ringFights = [17, 22, 27, 32, 37, 42];          // the walking fights each ring asks for, from the chosen levelling plan
const A = 'attentive, careful', C = 'careless', X = 'expert, careful', AB = 'attentive, bold';
const shade = x => `style="background: color-mix(in srgb, var(--heat) ${Math.round(Math.min(1, x / 40) * 55)}%, var(--card))"`;
const show = v => v >= D.most ? '40+' : String(v);
const settings = [[0, 'No plants'], [1, 'A few'], [2, 'Some'], [3, 'Plenty'], [4, 'Lots']];
const rate = i => D.rates[i];
const far = t => { let h = '<div class="scroll"><table class="heat"><thead><tr><th>Ring</th>' + settings.map(([i, n]) => `<th class="num">${n}<span class="n">${rate(i)[0]} HP + ${rate(i)[1]} MP</span></th>`).join('') + '</tr></thead><tbody>';
  for (const r of [1, 2, 3, 4, 5, 6]) h += `<tr><th scope="row">Ring ${r}<span class="n">level ${PLAN.rings[r - 1].partyEnters + 1}</span></th>` + settings.map(([i]) => { const c = D.rings[r][t][i]; return `<td ${shade(c.low)}><b>${show(c.low)}</b><span>${show(c.mid)} usually</span></td>`; }).join('') + '</tr>';
  return h + '</tbody></table></div>'; };
let eats = '<div class="scroll"><table><thead><tr><th>Ring</th><th class="num">HP herbs a fight</th><th class="num">MP herbs a fight</th><th class="num">Fights in the ring</th><th class="num">Herbs for the whole ring</th></tr></thead><tbody>';
let totH = 0, totM = 0;
for (const r of [1, 2, 3, 4, 5, 6]) { const w = D.want[r][A], f = ringFights[r - 1]; totH += w.hp * f; totM += w.mp * f; eats += `<tr><th scope="row">Ring ${r}</th><td class="num">${w.hp.toFixed(1)}</td><td class="num">${w.mp.toFixed(1)}</td><td class="num">${f}</td><td class="num">${Math.round(w.hp * f)} HP, ${Math.round(w.mp * f)} MP</td></tr>`; }
eats += `<tr><th scope="row"><b>The whole game</b></th><td></td><td></td><td class="num">177</td><td class="num"><b>${Math.round(totH)} HP, ${Math.round(totM)} MP</b></td></tr></tbody></table></div>`;
// the options: rest spots a ring needs so that even the unlucky 1 in 10 careful attentive player reaches the next one
const opt = i => { let spots = 0, per = []; for (const r of [1, 2, 3, 4, 5, 6]) { const L = D.rings[r][A][i].low, f = ringFights[r - 1]; const n = L >= D.most ? 0 : Math.max(0, Math.ceil(f / L) - 1); spots += n; per.push({ r, L, n }); } return { spots, per, plants: Math.round((rate(i)[0] + rate(i)[1]) * 177) }; };
const O = [1, 2, 3].map(opt);
const optCard = (o, i, name, word) => `<article class="opt"><h3>${name}</h3><dl>
  <div><dt>Plants between fights</dt><dd>${rate(i)[0]} HP and ${rate(i)[1]} MP <span>about ${o.plants} to pick in the whole game</span></dd></div>
  <div><dt>Rest spots inside the rings</dt><dd>${o.spots} <span>${o.per.filter(p => p.n).map(p => 'ring ' + p.r + ': ' + p.n).join(', ') || 'none needed'}</span></dd></div>
  <div><dt>Furthest apart, last ring</dt><dd>${show(o.per[5].L)} fights</dd></div>
  <div><dt>How it plays</dt><dd><span>${word}</span></dd></div></dl></article>`;
const cap = t => t[0].toUpperCase() + t.slice(1);
const cc = x => `<td ${shade(x.low)}><b>${show(x.low)}</b><span>${show(x.mid)} usually</span></td>`;
let stock = '<div class="scroll"><table class="heat"><thead><tr><th>Ring</th><th class="num">Bag empty</th><th class="num">10 HP + 20 MP herbs</th><th class="num">20 + 40</th><th class="num">40 + 80</th></tr></thead><tbody>';
for (const r of [3, 4, 5, 6]) { const c = CH.rings[r][A]; stock += `<tr><th scope="row">Ring ${r}<span class="n">level ${PLAN.rings[r - 1].partyEnters + 1}</span></th>${cc(c.empty)}${cc(c.s1)}${cc(c.s2)}${cc(c.s3)}</tr>`; }
stock += '</tbody></table></div>';
const pcs = x => (x > 0 && x < 0.095 ? (x * 100).toFixed(1) : Math.round(x * 100)) + '%';
const shadeP = x => `style="background: color-mix(in srgb, var(--heat) ${Math.round(x * 55)}%, var(--card))"`;
let lastT = '<div class="scroll"><table class="heat"><thead><tr><th>Tester</th>' + LF.settings.map(([n, g]) => `<th class="num">${cap(n)}<span class="n">level ${20 + g}</span></th>`).join('') + '</tr></thead><tbody>';
for (const t of Object.keys(LF.rows)) lastT += `<tr><th scope="row">${cap(t)}</th>` + LF.rows[t].map(c => `<td ${shadeP(c.all)}><b>${pcs(c.all)}</b><span>${pcs(c.none)} with nothing</span></td>`).join('') + '</tr>';
lastT += '</tbody></table></div>';
const ex = LF.rows['expert, careful'], c6s = CH.rings[6][A], c5s = CH.rings[5][A];
const w6 = D.want[6][A], c6 = D.rings[6][C], a6 = D.rings[6][A], b6 = D.rings[6][AB];
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moon Faire herbs</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Jacquard+24&display=swap" rel="stylesheet">
<style>
/* layout: one reading column; the finds as a list of cards, picture left and words right; tables and prompts scroll inside their own box */
:root {
  --page: #eeedf4; --card: #fcfcfb; --ink: #1c1a2e; --ink-2: #55526a; --rule: #d9d7e4; --lantern: #8a5a00; --cloth: #241c2b;
  --heat: #2a78d6; --way: #2f6f4f; --off: #8a5a00; --hid: #6a3fa0;
  --display: "Jacquard 24", "Atkinson Hyperlegible", Georgia, serif; --body: "Atkinson Hyperlegible", Verdana, "Segoe UI", sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --page: #121120; --card: #1a1a19; --ink: #f0efec; --ink-2: #b9b6c9; --rule: #33314a; --lantern: #e3b04b; --cloth: #241c2b;
  --heat: #3987e5; --way: #6fc79a; --off: #e3b04b; --hid: #b99be8; color-scheme: dark; } }
:root[data-theme="dark"] {
  --page: #121120; --card: #1a1a19; --ink: #f0efec; --ink-2: #b9b6c9; --rule: #33314a; --lantern: #e3b04b; --cloth: #241c2b;
  --heat: #3987e5; --way: #6fc79a; --off: #e3b04b; --hid: #b99be8; color-scheme: dark; }
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

.who { display: flex; flex-direction: column; gap: 10px; }
.t { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 12px 14px; }
.t h4 { margin: 0 0 4px; } .t p { margin: 0; color: var(--ink-2); } .t .old { font-size: 12px; font-weight: 400; color: var(--ink-2); border: 1px solid var(--rule); border-radius: 20px; padding: 1px 8px; margin-left: 6px; white-space: nowrap; }
.heat td { text-align: center; padding: 8px 6px; } .heat th[scope=row] { white-space: normal; min-width: 96px; }
.heat td b { display: block; font-size: 16px; } .heat td span { font-size: 12px; }
.key { font-size: 14px; color: var(--ink-2); margin: 0 0 10px; }
.opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
.opt { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 16px; }
.opt h3 { margin: 0 0 10px; font-size: 20px; }
dl { margin: 0; display: flex; flex-direction: column; gap: 10px; }
dt { color: var(--ink-2); font-size: 14px; } dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; }
dd span { display: block; font-weight: 400; color: var(--ink-2); font-size: 14px; }
.was { color: var(--ink-2); margin-top: 12px; }
thead th span.n { font-weight: 400; }
</style></head>
<body><main>
<header>
 <p class="kicker">Moon Faire, task board F9</p>
 <h1>Herbs and rest spots</h1>
 <p>Fights now start with the HP and MP the party has. She picks wild plants on the moor, Io makes them into herbs, and a rest spot refills everything for free. I played ${(D.n * 6 * 8 * 7).toLocaleString('en-US')} stretches of fights from a rest spot, with all eight testers, to see how many plants the moor needs and how far apart the rest spots can be.</p>
</header>

<section class="ask" aria-label="What you decided">
 <h2>What you decided on November 15</h2>
 <ul>
  <li><strong>Steady</strong> for the plants: about one HP plant and two MP plants to pick for every fight.</li>
  <li><strong>An MP herb gives 20 MP.</strong></li>
  <li><strong>"Top everybody up"</strong> outside a fight, in one press, for the whole party. Herbs are how the party heals between fights.</li>
  <li><strong>A very big bag,</strong> so she can pick more in a safer place and carry it into a harder one.</li>
  <li><strong>Easy, medium, hard and crazy</strong> offered before the last fight: its foes at level 20, 21, 22 or 22.8.</li>
 </ul>
</section>

<section>
 <h2>The last fight at your four settings</h2>
 <p>Today's last fight stands in for the big bad. The party is level 20 and meets it fresh, straight from a rest spot. ${LF.n.toLocaleString('en-US')} fights for every number. The big number is with all eighteen finds, the small one with nothing found.</p>
 ${lastT}
 <p><strong>Crazy at 22.8 is "just barely".</strong> A careful expert who has found everything wins ${pcs(ex[3].all)} of the time, about one try in ${Math.round(1 / ex[3].all)}. With nothing found it is ${pcs(ex[3].none)}. The bold expert with everything wins ${pcs(LF.rows['expert, bold'][3].all)}, and nobody below an expert wins it at all. At a flat 23 the careful expert won 1%.</p>
</section>

<section>
 <h2>Stocking up before a hard ring</h2>
 <p>A careful, attentive player with steady plants who tops everybody up after every fight. How many fights she wins from a rest spot on an unlucky run, by what is in her bag when she sets out.</p>
 ${stock}
 <p>With an empty bag the last ring is a run of ${show(c6s.empty.low)} fights at a time. If she arrives with 40 HP herbs and 80 MP herbs she can go ${show(c6s.s3.low)} without a rest spot, which is most of the ring. So picking ahead in a safe place works the way you pictured.</p>
</section>

<section class="ask" aria-label="What is still open">
 <h2>What is still open</h2>
 <ol>
  <li><strong>A witch who fainted.</strong> As built she gets up after a won fight with 10% of her HP. Yes, or something else?</li>
  <li><strong>Where the game teaches topping up.</strong> It will not happen by itself early on. A party that never eats a herb still wins about ${D.rings[1][A][0].mid} fights in a row in the first ring and ${D.rings[2][A][0].mid} in the second; it only bites in the third (${D.rings[3][A][0].mid}). I suggest a taught moment at the fair: the three set fights there do not refill her, and after the second the game shows "Top everybody up".</li>
  <li><strong>The careless player in the far rings.</strong> Herbs do not save her: about ${D.rings[6][C][0].mid} fights from a rest spot in the last ring whatever she carries. Is that the game being hard, or should the main path there be gentler?</li>
  <li><strong>A rest spot right before the last fight?</strong> The numbers above assume she meets it with everything full.</li>
  <li><strong>The two play styles.</strong> "Bold" is still only a weaker player. Drop to five testers?</li>
 </ol>
</section>

<section>
 <h2>The three ways it could be set</h2>
 <p>You chose Steady. Each is sized so that a careful, attentive player reaches the next rest spot even on an unlucky run (the worst 1 in 10).</p>
 <div class="opts">
  ${optCard(O[0], 1, 'Sparing', 'Herbs are precious. The last two rings are a string of short runs between rest spots.')}
  ${optCard(O[1], 2, 'Steady', 'The first four rings need no rest spot inside them. The last two ask her to plan.')}
  ${optCard(O[2], 3, 'Generous', 'Only the last ring makes her think about where the next rest spot is.')}
 </div>
 <p class="was">Every ring also has a rest spot where it begins. These are the extra ones inside it.</p>
</section>

<section>
 <h2>How far she gets from a rest spot</h2>
 <p>A careful, attentive player. The big number is how many fights she wins in a row on an unlucky run before one is lost. The small one is the usual run. "40+" means she never ran dry. Darker is further.</p>
 ${far(A)}
 <h3>A careless player</h3>
 <p>Herbs do not save her in the far rings. She loses those fights outright, with HP and MP to spare.</p>
 ${far(C)}
</section>

<section>
 <h2>What she eats when she has all she wants</h2>
 <p>A careful, attentive player who tops everyone up after each fight. An HP herb gives ${HERBS.hp} HP on the scale where the Jester has 1,000; an MP herb gives ${D.herbs.mp} MP.</p>
 ${eats}
 <p>In the last ring that is about ${w6.hp.toFixed(1).replace(/\.0$/, '')} HP herbs and ${w6.mp.toFixed(1).replace(/\.0$/, '')} MP herbs after a fight, close to the "six of those and four of those" you pictured, the other way round.</p>
</section>

<section>
 <h2>How herbs work, as I built them</h2>
 <ul>
  <li><strong>An HP herb gives ${HERBS.hp} HP.</strong> That is half the Jester's own heal of 120, the weakest heal in the game, by your rule. Io's Mend gives 250.</li>
  <li><strong>After a fight</strong> she eats as many as she likes, on whoever needs them.</li>
  <li><strong>In a fight</strong> eating a herb takes that witch's turn. The testers only do it when a friend is in trouble and Io cannot mend.</li>
  <li><strong>Spells are for fights.</strong> Io cannot Mend between fights. If she could, MP herbs would be worth far more than HP herbs.</li>
  <li><strong>A rest spot</strong> refills all HP and MP. It gives no herbs.</li>
  <li><strong>Losing</strong> still costs nothing: she wakes at the last rest spot.</li>
 </ul>
</section>

<section>
 <h2>What I found</h2>
 <ul>
  <li><strong>MP runs out, not HP.</strong> Mend turns 10 MP into 250 HP, so a party with MP is a party with HP. With no herbs at all, a careful player wins ${D.rings[1][A][0].mid} fights in a row in the first ring, ${D.rings[3][A][0].mid} in the third and ${a6[0].mid} in the last. This is why your two MP finds matter now.</li>
  <li><strong>The far rings are hard on a careless player.</strong> In the last ring she wins about ${c6[0].mid} fights from a rest spot whatever she is carrying. Before, with fresh fights, she lost two or three walking fights in the whole game. If anyone is to see the whole game, the far rings want rest spots close together, or gentler foes on the main path.</li>
  <li><strong>The second play style still is not a real choice.</strong> I made "bold" a player who only tops up to 60% HP and 40% MP. She saves almost no herbs and is much less safe: in the last ring with lots of plants she wins ${show(b6[4].low)} fights on an unlucky run against ${show(a6[4].low)} for the careful one. Topping up fully is simply right. I would drop the two styles and keep five testers, unless you want "a player who under-heals" as a tester in her own right.</li>
  <li><strong>The earlier numbers were the best case.</strong> The levelling hours, the finds and the big-bad table all assumed fresh fights. They need running again once you have picked, and the big bad should be met straight from a rest spot.</li>
 </ul>
</section>

<footer>Made by the Levelling session on November 15, 2026. The code and results are in <code>game/plan/herbs/</code>. ${D.n} stretches for every number.</footer>
</main>
</body></html>`;
fs.writeFileSync(__dirname + '/herbs.html', html);
console.log('wrote herbs.html', (html.length / 1024).toFixed(0) + ' KB');
console.log('options:', JSON.stringify(O.map(o => ({ spots: o.spots, plants: o.plants, per: o.per.map(p => p.L + ':' + p.n).join(' ') }))));
