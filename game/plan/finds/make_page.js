// Builds finds.html from finds.json, each.json, profiles.json, gentler.json and picture-prompts.md.
const fs = require('fs');
const { execFileSync } = require('child_process');
const rd = f => JSON.parse(fs.readFileSync(__dirname + '/' + f, 'utf8'));
const J = rd('finds.json'), E = rd('each.json'), P = rd('profiles.json'), G = rd('gentler.json');
const prompts = fs.readFileSync(__dirname + '/picture-prompts.md', 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pc = x => Math.round(x * 100) + '%';
const pts = x => { const v = Math.round(x * 100); return (v > 0 ? '+' : '') + v; };
// small copies of the five painted cards, made by the Python beside this file
const thumbs = JSON.parse(execFileSync('python3', ['-I', __dirname + '/thumbs.py', __dirname + '/../../art/items'], { maxBuffer: 1 << 26 }).toString());
const howClass = { 'on the way': 'h1', 'off the path': 'h2', 'hidden': 'h3' };
const card = f => {
  const a = f.aloneAtTheLastGate;
  const worth = Math.abs(a.attentive) < 0.01 && Math.abs(a.careless) < 0.01 ? 'no help that the runs can see' : `${pts(a.attentive)} points paying attention, ${pts(a.careless)} pressing any button`;
  const img = thumbs[f.id] ? `<img alt="" src="${thumbs[f.id]}">` : '<div class="topaint">to paint</div>';
  return `<article class="find">${img}<div>
   <h4>${esc(f.name)}${f.new ? ' <span class="new">new, stand-in</span>' : ''}</h4>
   <p class="does">${esc(f.does)}</p>
   <p class="card">${esc(f.card)}</p>
   <p class="meta"><span class="how ${howClass[f.how]}">${f.how}</span>${f.witch ? ' for ' + (f.witch === 'Io' ? 'Io' : 'the ' + f.witch) + '.' : ''} Alone at the last gate: ${worth}.</p>
  </div></article>`;
};
const ringNames = { 1: 'party level 2 to 5', 2: 'party level 5 to 8', 3: 'party level 8 to 11', 4: 'party level 11 to 14', 5: 'party level 14 to 17', 6: 'party level 17 to 20' };
const rings = [1, 2, 3, 4, 5, 6].map(r => `<h3>Ring ${r} <span class="lvl">${ringNames[r]}</span></h3><div class="finds">${J.finds.filter(f => f.ring === r).map(card).join('')}</div>`).join('');
const last = P.gates[2], lastG = G.gates[1], r5 = P.gates[1], r5G = G.gates[0], r4 = P.gates[0];
const tries = x => (1 / Math.max(x, 0.001)).toFixed(x > 0.5 ? 1 : 0);
let strength = '<div class="scroll"><table><thead><tr><th>She has found</th><th class="num">Full strength, as written</th><th class="num">Half strength</th></tr></thead><tbody>';
const cell = r => `<td class="num"><b>${pc(r.attentive.win)}</b> paying attention<span>${pc(r.careless.win)} pressing any button, ${tries(r.careless.win)} tries</span></td>`;
last.kinds.forEach((k, i) => { strength += `<tr><th scope="row">${k.label}<span class="n">${k.finds} finds</span></th>${cell(k.r)}${cell(lastG.kinds[i].r)}</tr>`; });
strength += '</tbody></table></div>';
let earlier = '<div class="scroll"><table><thead><tr><th>She has found</th><th class="num">The great wraith alone, level 14</th><th class="num">The level-17 gate</th></tr></thead><tbody>';
r4.kinds.forEach((k, i) => { earlier += `<tr><th scope="row">${k.label}</th><td class="num">${pc(k.r.careless.win)}<span>${k.finds} finds</span></td><td class="num">${pc(r5.kinds[i].r.careless.win)}<span>${r5.kinds[i].finds} finds; ${pc(r5G.kinds[i].r.careless.win)} at half strength</span></td></tr>`; });
earlier += '</tbody></table></div>';
const each = id => E.each[id].r.B2K2w, base = E.base.B2K2w, dd = (id, s) => pts(each(id)[s].win - base[s].win);
const hardest = P.extra[1];
// the three prompts, each in its own box with a Copy button
const blocks = []; prompts.replace(/## (I\d  [^\n]+)\n([\s\S]*?)```\n([\s\S]*?)```/g, (_, title, intro, body) => { blocks.push({ title: title.replace(/^I\d  /, ''), attach: (intro.match(/Attach:[^\n]+/) || [''])[0], body: body.trim() }); });
const promptHtml = blocks.map((b, i) => `<div class="prompt"><div class="phead"><div><strong>${esc(b.title)}</strong><span>${esc(b.attach)}</span></div><button type="button" data-copy="p${i}">Copy the prompt</button></div><pre id="p${i}" tabindex="0">${esc(b.body)}</pre></div>`).join('');

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
 <p>Level 20 is the top, so what she finds is now the only thing that makes the last gate easier. Here are 18 finds, three in each of the six rings: one on the way, one off the path, one hidden. Five are the cards the game already has. Thirteen are new, and every new name and card is a stand-in for you to change.</p>
</header>

<section class="ask" aria-label="What I need from you">
 <h2>What I need from you</h2>
 <ol>
  <li><strong>Full strength or half strength.</strong> The table just below shows both.</li>
  <li><strong>The two MP finds.</strong> Cold lantern glass and The cut thread do nothing the runs can see, because every fight starts with full MP. Keep them as they are, or shall I give them a new job and measure it?</li>
  <li><strong>The names and cards.</strong> Say what to change, or have them rewritten. The pictures to paint are at the bottom.</li>
 </ol>
</section>

<section>
 <h2>What the finds do at the last gate</h2>
 <p>The great wraith, two Shadow Wraiths and two wisps, at level 20. ${P.n.toLocaleString('en-US')} fights for every number.</p>
 ${strength}
 <p>With nothing found it is the fight you approved: ${pc(last.kinds[0].r.attentive.win)} for a player paying attention. At full strength, the six finds that lie on the way are enough to make it ${pc(last.kinds[1].r.attentive.win)}, and everything makes it certain. At half strength it takes all eighteen to do that. An expert wins ${pc(last.kinds[0].r.expert.win)} of the time with nothing.</p>
 <h3>The two gates before it, for a player pressing any button</h3>
 <p>A player paying attention never loses these. For anyone else the finds are the difference between two tries and six.</p>
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
  <li><strong>HP is the strongest thing a find can give.</strong> 2% more HP is worth ${dd('hp2', 'attentive')} points at the last gate, and 5% is worth ${dd('hp5', 'attentive')}. 5% stronger healing is worth ${dd('heal5', 'attentive')}. This is what your combat notes said, so the HP finds stay small.</li>
  <li><strong>MP finds do nothing in one fight.</strong> 5% more MP: ${dd('mp5', 'attentive')} points. The Fox's spells 5% cheaper: ${dd('foxmp5', 'attentive')}. Nobody runs out of MP in a single fight.</li>
  <li><strong>The curtain weight is the big one.</strong> Sealed Fate taking 25% from the other foes is worth ${dd('splash', 'attentive')} points alone. It is the hidden find of ring 5, and it is meant to feel like a prize.</li>
  <li><strong>Two finds are worth more than the runs show.</strong> The pretend player who pays attention never calls the Fox's ghost and seldom leans on Bloom, so The spare outline and The fourth seed only show up for the any-button player. A real player who uses them will get more.</li>
  <li><strong>Left out on purpose.</strong> The Ranger's gem ready a turn sooner was worth ${dd('gem1', 'attentive')} points alone, which is too much. The Jester catching a fourth blow helped nobody. Getting up for the bow at 50% changed no result.</li>
  <li><strong>If the story ever adds a fight harder than the last gate,</strong> the full set is what makes it winnable. The hardest fight in your combat notes goes from ${pc(hardest.none.attentive.win)} to ${pc(hardest.all.attentive.win)} for a player paying attention with all eighteen.</li>
 </ul>
</section>

<section>
 <h2>Pictures to paint</h2>
 <p>Thirteen new cards: two sheets of six and one on its own. Each prompt follows the first item sheet's, so the new cards match the old. Attach the files named, paste the prompt, and save the result under the name given.</p>
 ${promptHtml}
</section>

<footer>Made by the Levelling session on November 14, 2026. The finds as data, the measurements and these prompts are in <code>game/plan/finds/</code>.</footer>
</main>
<script>
document.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-copy]'); if (!b) return;
  var pre = document.getElementById(b.getAttribute('data-copy')), was = b.textContent;
  function done(ok) { b.textContent = ok ? 'Copied' : 'Select the text below and copy it'; setTimeout(function () { b.textContent = was; }, 2500); }
  function select() { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); done(false); }
  try { navigator.clipboard.writeText(pre.textContent).then(function () { done(true); }, select); } catch (err) { select(); }
});
</script>
</body></html>`;
fs.writeFileSync(__dirname + '/finds.html', html);
console.log('wrote finds.html', (html.length / 1024).toFixed(0) + ' KB;', blocks.length, 'prompts;', Object.keys(thumbs).length, 'pictures');
