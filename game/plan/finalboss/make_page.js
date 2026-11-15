// Builds two-forms.html, the page for Chris: the final boss in two forms, the measured ways of building its fight, and
// the picture prompts.   node make_page.js     Reads forms.json (from forms_run.js) and picture-prompts.md.
const fs = require('fs');
const D = JSON.parse(fs.readFileSync(__dirname + '/forms.json', 'utf8'));
const md = fs.readFileSync(__dirname + '/picture-prompts.md', 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pc = x => (x * 100).toFixed(x > 0 && x < 0.095 ? 1 : 0).replace(/\.0$/, '') + '%';
const both = c => `${pc(c.none)}<span class="all">${pc(c.all)}</span>`;
const SET = D.settings.map(([n, g]) => ({ name: n[0].toUpperCase() + n.slice(1), level: 20 + g }));
const head = `<thead><tr><th>Player</th>${SET.map(s => `<th class="num">${s.name}<span class="n">level ${s.level}</span></th>`).join('')}</tr></thead>`;
const table = (rows, names) => `<div class="scroll"><table>${head}<tbody>${(names || Object.keys(rows)).map(t => `<tr><th>${esc(t[0].toUpperCase() + t.slice(1))}</th>${rows[t].map(c => `<td class="num">${both(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const careful = ['attentive, careful', 'focused, careful', 'expert, careful'];
const F = D.fights, X = D.extra;
const mins = tt => { const a = Math.min(...tt), b = Math.max(...tt); return `${Math.round(a)} to ${Math.round(b)} party turns in a win, so about ${Math.round(a * 4 / 60)} to ${Math.round(b * 9 / 60)} minutes at 4 to 9 seconds a turn`; };
const life = (base, share) => D.settings.map(([n, g]) => Math.round(base * share * Math.pow(1.2, g) / 10) * 10);
const fmt = n => n.toLocaleString('en-US');

// the prompts: every "## F..." section of picture-prompts.md
const prompts = [];
md.replace(/\n## (F\d)\s+([^\n]+)\n\n([^\n]+)\n\n```\n([\s\S]*?)\n```/g, (_, id, title, shape, text) => { prompts.push({ id, title, shape, text }); });
if (prompts.length !== 3) throw new Error('expected three F prompts, found ' + prompts.length);
const promptHtml = prompts.map((p, i) => `<div class="prompt"><div class="phead"><div><strong>${esc(p.title)}</strong><span>${esc(p.shape.replace(/`/g, ''))}</span></div><button type="button" data-copy="p${i}">Copy the prompt</button></div><pre id="p${i}" tabindex="0">${esc(p.text)}</pre></div>`).join('\n');

const gw = F.gw.rows, al = F.alone.rows, bo = F.both.rows, lone = X.loneGw.rows;
const E = 'expert, careful', A = 'attentive, careful', Fo = 'focused, careful';
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moon Faire final boss in two forms</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Jacquard+24&display=swap" rel="stylesheet">
<style>
/* layout: one reading column; tables and prompts scroll inside their own box */
:root {
  --page: #eeedf4; --card: #fcfcfb; --ink: #1c1a2e; --ink-2: #55526a; --rule: #d9d7e4; --lantern: #8a5a00;
  --display: "Jacquard 24", "Atkinson Hyperlegible", Georgia, serif; --body: "Atkinson Hyperlegible", Verdana, "Segoe UI", sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --page: #121120; --card: #1a1a19; --ink: #f0efec; --ink-2: #b9b6c9; --rule: #33314a; --lantern: #e3b04b; color-scheme: dark; } }
:root[data-theme="dark"] { --page: #121120; --card: #1a1a19; --ink: #f0efec; --ink-2: #b9b6c9; --rule: #33314a; --lantern: #e3b04b; color-scheme: dark; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--page); color: var(--ink); font: 17px/1.55 var(--body); }
main { max-width: 860px; margin: 0 auto; padding: 28px 18px 64px; display: flex; flex-direction: column; gap: 34px; }
header p { max-width: 62ch; margin: 10px 0 0; }
h1 { font: 400 clamp(40px, 9vw, 60px)/1 var(--display); margin: 0; text-wrap: balance; letter-spacing: .01em; }
.kicker { color: var(--lantern); font-weight: 700; margin: 0 0 6px; }
h2 { font-size: 24px; line-height: 1.2; margin: 0 0 12px; text-wrap: balance; }
h3 { font-size: 19px; margin: 22px 0 8px; }
section > p, section > ul, section > ol, .ask > p, .ask > ul { max-width: 65ch; }
p { margin: 0 0 12px; } ul, ol { margin: 0 0 12px; padding-left: 22px; display: flex; flex-direction: column; gap: 8px; }
.ask { background: var(--card); border: 1px solid var(--rule); border-left: 5px solid var(--lantern); border-radius: 8px; padding: 16px 18px; }
.ask > :last-child { margin-bottom: 0; }
.scroll { overflow-x: auto; background: var(--card); border: 1px solid var(--rule); border-radius: 10px; margin-bottom: 14px; }
table { border-collapse: collapse; width: 100%; font-size: 15px; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--rule); vertical-align: top; }
tbody tr:last-child > * { border-bottom: 0; } tbody th { font-weight: 400; white-space: nowrap; }
thead th { font-size: 13px; color: var(--ink-2); font-weight: 700; }
.num { text-align: right; white-space: nowrap; } th span.n { display: block; color: var(--ink-2); font-size: 13px; font-weight: 400; }
.all { display: block; color: var(--ink-2); }
.key { color: var(--ink-2); font-size: 15px; margin: 0 0 8px; }
@media (max-width: 480px) { table { font-size: 14px; } th, td { padding: 8px 6px; } tbody th { white-space: normal; } thead th span.n { font-size: 12px; } }
.note { color: var(--ink-2); font-size: 15px; }
.prompt { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; margin-bottom: 14px; overflow: hidden; }
.phead { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--rule); }
.phead span { display: block; font-size: 14px; color: var(--ink-2); }
button { font: 700 15px var(--body); color: var(--page); background: var(--ink); border: 0; border-radius: 8px; padding: 9px 14px; cursor: pointer; }
button:focus-visible, pre:focus-visible { outline: 3px solid var(--lantern); outline-offset: 2px; }
pre { margin: 0; padding: 14px; max-height: 220px; overflow: auto; font: 13px/1.5 ui-monospace, Menlo, Consolas, monospace; white-space: pre-wrap; }
code { font-size: .92em; background: var(--card); border: 1px solid var(--rule); border-radius: 4px; padding: 0 4px; }
footer { color: var(--ink-2); font-size: 15px; border-top: 1px solid var(--rule); padding-top: 16px; }
</style></head>
<body><main>
<header>
 <p class="kicker">Moon Faire, task board F11</p>
 <h1>The final boss in two forms</h1>
 <p>You said the rough model is a good first draft of form one, that it should lose Life without showing damage, and that at zero it changes into a final form that is broken, larger and more vibrant. You asked for picture prompts for both forms, and whether the fight should be one body alone, harder than the gate fights, or the great wraith's numbers under new names with the same helpers. I played both with the eight testers.</p>
</header>

<section class="ask" aria-label="My answer">
 <h2>My answer: use both of your ideas, one after the other</h2>
 <ul>
  <li><strong>Form one is your second idea.</strong> The fire, whole, with the great wraith's own numbers under new names and the same four helpers.</li>
  <li><strong>The final form is your first idea.</strong> The fire, broken open, alone, with a quarter of the Life and the same blows, acting twice as often.</li>
  <li><strong>On hard, only an expert wins:</strong> ${pc(bo[E][2].none)} of the time with no finds and ${pc(bo[E][2].all)} with all 18. Today's last fight gives her ${pc(gw[E][2].none)} and ${pc(gw[E][2].all)}, so this is one notch harder at every setting.</li>
  <li><strong>It needs no new rule</strong> beyond "the second form starts with the HP and MP the party has left".</li>
 </ul>
 <p>It also plays the story out in the rules: the Jester gives the fire its ending, and it refuses.</p>
</section>

<section>
 <h2>What the testers showed</h2>
 <p>In every table the top number is how often that player wins with no finds, and the number under it is with all 18. The party is level 20 and arrives fresh from a rest spot.</p>

 <h3>1. The helpers are most of what makes the great wraith hard</h3>
 <p>Take the helpers away and leave the great wraith its own numbers, and an attentive player wins ${pc(lone[A][0].none)} on easy and ${pc(lone[A][1].none)} on medium. With the helpers she wins ${pc(gw[A][0].none)} and ${pc(gw[A][1].none)}. So one body alone has to be far stronger than the great wraith before it is harder than the gate fights.</p>
 ${table(lone, careful)}
 <p class="note">The great wraith alone, with its own numbers. Not a proposal, only the comparison.</p>

 <h3>2. One body alone can be made hard enough, but it is a narrower fight</h3>
 <p>I gave one body 30% more Life than the great wraith in form one, then a final form with 40% of the great wraith's Life that hits 10% harder. That lands hard in the right place (the expert wins ${pc(al[E][2].none)}, or ${pc(al[E][2].all)} with every find). Three things came with it:</p>
 <ul>
  <li><strong>Easy is easier than the gate before it.</strong> An attentive player wins ${pc(al[A][0].none)} on easy, where she wins about 80% against the great bramble.</li>
  <li><strong>Part of the party's kit has nothing to do.</strong> With one foe the Fox can never cast Crazy Quilt, Pins and Needles has nothing to spread to, Sealed Fate's splash hits nobody, and there is never a choice of whom to hit.</li>
  <li><strong>It swings on one trick.</strong> My testers spend their MP in form one as if it were the whole fight. An expert who knows the second form is coming and holds MP back wins ${pc(D.saving.alone[E][2].none)} on hard with no finds, up from ${pc(al[E][2].none)}. So it would be very hard the first time and much easier every time after.</li>
 </ul>
 ${table(al)}
 <p class="note">One body alone, in two forms. ${mins(F.alone.turns)}.</p>

 <h3>3. Helpers first, then alone, is a notch harder than the gate everywhere</h3>
 <p>Form one is today's last fight exactly. The short final form on top of it takes a little off every number, so each setting is harder than the same fight at the gate, and hard stays an expert's fight. Holding MP back does not crack it: the same saving habit made the expert a little worse here (${pc(D.saving.both[E][2].none)} on hard), because in a crowd the MP is better spent early.</p>
 ${table(bo)}
 <p class="note">Helpers in form one, alone in the final form. ${mins(F.both.turns)}.</p>

 <h3>For comparison: the great wraith's fight under new names, in one form</h3>
 <p>This is your second idea with nothing added, and it is the table you called a good balance. The trouble is only that it has no second Life bar, so the change of form could not happen at zero.</p>
 ${table(gw)}
 <p class="note">${mins(F.gw.turns)}.</p>
</section>

<section>
 <h2>The fight I would build</h2>
 <p>Numbers are on the fight simulator's scale, where the Jester has 1,000 HP. Names of blows are yours to choose.</p>
 <h3>Form one: the fire, whole</h3>
 <ul>
  <li><strong>Life:</strong> ${life(8000, 1).map(fmt).join(', ')} on easy, medium, hard and crazy. The great wraith's own.</li>
  <li><strong>Blows:</strong> the great wraith's three, renamed. A plain blow of 130, a marked blow of 440 at one witch, and a blow on everyone of 110 that grows by 25 each time. Each is 20% bigger for every level above 20.</li>
  <li><strong>Helpers:</strong> the same four the great wraith has, two of the Shadow Wraith's size and two of the wisp's size.</li>
  <li><strong>It shows no damage,</strong> however low its Life goes. Only the Life bar tells.</li>
  <li><strong>It ends as every boss ends now:</strong> its Life runs out or the Jester seals it, the Curtain Call falls, and anyone who fainted gets up for the bow with a quarter of her HP.</li>
 </ul>
 <h3>The final form: the fire, broken open</h3>
 <ul>
  <li><strong>The curtain tears open</strong> and it is back, alone, larger and brighter.</li>
  <li><strong>Life:</strong> ${life(8000, 0.25).map(fmt).join(', ')}. A quarter of form one's.</li>
  <li><strong>Blows:</strong> the same three at the same sizes, but it acts twice as often. That is already the rule for a boss left alone.</li>
  <li><strong>The party gets nothing back.</strong> It fights on with the HP and MP it has, Io's Deity does not return, and the fire starts with no Fate on it.</li>
  <li><strong>This one ends for good,</strong> in the real Curtain Call.</li>
 </ul>
 <h3>Two dials, if you want it harder</h3>
 ${table({ 'as proposed': bo[E], 'final form hits 20% harder': X.bothHarder.rows[E], 'nobody gets up when form one ends': X.bothNoBow.rows[E] })}
 <p class="note">The expert only: no finds on top, all 18 under it.</p>
</section>

<section>
 <h2>Herbs do not rescue it</h2>
 <p>I gave the party 20 HP herbs and 20 MP herbs for the fight, then 60 of each. Nobody did better. Eating a herb costs a turn, and the way my testers use them they did slightly worse (the expert on hard: ${pc(D.herbs.both20.rows[E][2].none)} and ${pc(D.herbs.both20.rows[E][2].all)}). So a very big bag does not break the last fight. A cleverer herb habit might gain a little; I have not built one.</p>
</section>

<section>
 <h2>Pictures to make</h2>
 <p>Make the first one first. If your picture maker takes a picture to work from, give it the first picture (or a screenshot of the model page) with the second prompt, so the final form is plainly the same thing. Both forms are the same parts, so the final form costs about the same to draw as the first.</p>
${promptHtml}
</section>

<section class="ask" aria-label="Questions for you">
 <h2>Three things for you to say</h2>
 <ol>
  <li><strong>Which fight?</strong> Helpers first and then alone (my pick), one body alone throughout, or the great wraith's fight in one form.</li>
  <li><strong>When form one ends, do the fallen get up?</strong> As measured they do, at a quarter HP, because that is what the Curtain Call does now. If they stay down, the expert wins hard ${pc(X.bothNoBow.rows[E][2].none)} of the time, or ${pc(X.bothNoBow.rows[E][2].all)} with every find.</li>
  <li><strong>Who are the helpers in form one?</strong> Wraiths and brambles it has called, or the four lanterns themselves. The numbers are the same either way.</li>
 </ol>
</section>

<footer>
 <p>What these numbers are: ${fmt(D.n)} fights for every cell of the big tables and ${fmt(D.nExtra)} for the rest, played by the eight pretend players through the approved fight rules, which are not changed. The helpers use the wraiths' numbers until the bramble foes have their own, and the finds are still to be tuned again for fights that carry HP and MP over.</p>
 <p>Made by the Levelling session on November 15, 2026. In the repo: <code>game/plan/finalboss/</code> (<code>forms.js</code>, <code>forms_run.js</code>, <code>forms.txt</code>, <code>picture-prompts.md</code>).</p>
</footer>
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
</body></html>
`;
fs.writeFileSync(__dirname + '/two-forms.html', html);
console.log('two-forms.html', html.length, 'bytes;', prompts.map(p => p.id).join(' '));
