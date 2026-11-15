// Builds testers.html from bigbad.json.
const fs = require('fs');
const { names, about, engineOwn } = require('./testers.js');
const D = JSON.parse(fs.readFileSync(__dirname + '/bigbad.json', 'utf8'));
const pc = x => Math.round(x * 100) + '%';
const shade = x => `style="background: color-mix(in srgb, var(--heat) ${Math.round(x * 55)}%, var(--card))"`;
const cap = s => s[0].toUpperCase() + s.slice(1);
const who = names.map(t => `<div class="t"><h4>${cap(t)}${engineOwn[t] ? '<span class="old">the same as before</span>' : ''}</h4><p>${about[t]}</p></div>`).join('');
let heat = '<div class="scroll"><table class="heat"><thead><tr><th>Tester</th><th class="num">Level 20</th><th class="num">Level 21</th><th class="num">Level 22</th><th class="num">Level 23</th></tr></thead><tbody>';
for (const t of names) heat += `<tr><th scope="row">${cap(t)}</th>` + D.last[t].map(c => `<td ${shade(c.all.win)}><b>${pc(c.all.win)}</b><span>${pc(c.none.win)} with nothing</span></td>`).join('') + '</tr>';
heat += '</tbody></table></div>';
const o = (t, i) => D.other[t][i].r;
let walk = '<div class="scroll"><table><thead><tr><th>Tester</th><th class="num">Three wisps, 1 level over</th><th class="num">Two Shadow Wraiths and two wisps, 2 over</th><th class="num">The worst walking fight, 4 over</th></tr></thead><tbody>';
for (const t of names) walk += `<tr><th scope="row">${cap(t)}</th>` + [0, 1, 2].map(i => `<td class="num"><b>${pc(o(t, i).win)}</b> won<span>${Math.round(o(t, i).turns)} turns; ${pc(o(t, i).hpLeft)} HP and ${pc(o(t, i).mpLeft)} MP left</span></td>`).join('') + '</tr>';
walk += '</tbody></table></div>';
const L = (t, lv) => D.last[t][lv - 20];
const ec = 'expert, careful', eb = 'expert, bold', fc = 'focused, careful', ac = 'attentive, careful', ab = 'attentive, bold';
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moon Faire testers</title>
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
</style></head>
<body><main>
<header>
 <p class="kicker">Moon Faire, task board F10</p>
 <h1>The eight testers</h1>
 <p>You asked for more pretend players than three: five levels of attentiveness, with the top three each in two play styles. Here they are, and here is the big-bad table again with all eight. Three of them are the old careless, attentive and expert players, move for move, so every earlier number still means what it meant.</p>
</header>

<section>
 <h2>The last fight, at levels 20 to 23</h2>
 <p>Today's last fight (the great wraith, two Shadow Wraiths and two wisps) with its foes moved up, against a party that stops at level 20. ${D.n.toLocaleString('en-US')} fights for every number, each fight started fresh.</p>
 <p class="key">The big number is with all eighteen finds. The small one is with nothing found. A darker square means more wins.</p>
 ${heat}
 <ul>
  <li><strong>Level 22 is an expert's fight, as you wanted.</strong> The careful expert wins ${pc(L(ec, 22).none.win)} with nothing and ${pc(L(ec, 22).all.win)} with everything. The bold expert wins ${pc(L(eb, 22).none.win)} and ${pc(L(eb, 22).all.win)}. The focused player gets ${pc(L(fc, 22).all.win)} with everything, and nobody else wins at all.</li>
  <li><strong>Level 21 sorts the players out.</strong> With everything found: attentive ${pc(L(ac, 21).all.win)}, focused ${pc(L(fc, 21).all.win)}, expert ${pc(L(ec, 21).all.win)}.</li>
  <li><strong>Level 23 is out of reach</strong> for everyone, finds or no finds.</li>
 </ul>
</section>

<section>
 <h2>Who they are</h2>
 <div class="who">${who}</div>
</section>

<section>
 <h2>Ordinary fights</h2>
 <p>No finds. "Left" is how much of the party's HP and MP remains after a won fight, which is what matters once fights stop starting fresh.</p>
 ${walk}
</section>

<section>
 <h2>What I found</h2>
 <ul>
  <li><strong>The two play styles only differ in the hard fights, and bold is simply the weaker one.</strong> At level 20 the bold attentive player wins the last fight ${pc(L(ab, 20).none.win)} of the time against ${pc(L(ac, 20).none.win)} for the careful one. In ordinary fights the two take the same number of turns and end with the same HP and MP. So today the styles are not a real second choice. I think they become one with the herbs: a thrifty player and a spender. I suggest we keep all eight for now and I rework the styles around herbs.</li>
  <li><strong>An ordinary fight is not free.</strong> After two Shadow Wraiths and two wisps two levels over, an attentive party has about ${pc(o(ac, 1).hpLeft)} of its HP and ${pc(o(ac, 1).mpLeft)} of its MP left. That is what the herbs will have to give back.</li>
  <li><strong>The focused player now uses the Fox's ghost,</strong> which the old attentive player never did. That is what lifts her from ${pc(L(ac, 21).none.win)} to ${pc(L(fc, 21).none.win)} at level 21.</li>
  <li><strong>Nobody runs away.</strong> None of the eight uses Slip Stitch, so a fight is won or lost. With herbs to protect, running may become worth testing.</li>
 </ul>
</section>

<footer>Made by the Levelling session on November 15, 2026. The testers are in <code>game/plan/testers/testers.js</code>; <code>check.js</code> proves the three old players are unchanged.</footer>
</main>
</body></html>`;
fs.writeFileSync(__dirname + '/testers.html', html);
console.log('wrote testers.html', (html.length / 1024).toFixed(0) + ' KB');
