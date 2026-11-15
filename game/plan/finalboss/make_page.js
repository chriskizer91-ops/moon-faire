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
const life = (base, share) => D.settings.map(([n, g]) => Math.round(base * share * Math.pow(1.2, g)));
const fmt = n => n.toLocaleString('en-US');

// the prompts: every "## F..." section of picture-prompts.md
const prompts = [];
md.replace(/\n## (F\d)\s+([^\n]+)\n\n([^\n]+)\n\n```\n([\s\S]*?)\n```/g, (_, id, title, shape, text) => { prompts.push({ id, title, shape, text }); });
if (prompts.length !== 3) throw new Error('expected three F prompts, found ' + prompts.length);
const promptHtml = prompts.map((p, i) => `<div class="prompt"><div class="phead"><div><strong>${esc(p.title)}</strong><span>${esc(p.shape.replace(/`/g, ''))}</span></div><button type="button" data-copy="p${i}">Copy the prompt</button></div><pre id="p${i}" tabindex="0">${esc(p.text)}</pre></div>`).join('\n');

const gw = F.gw.rows, al = F.alone.rows, bo = F.both.rows, ch = F.chosen.rows, lone = X.loneGw.rows;
const blow = (base, mul) => D.settings.map(([n, g]) => Math.round(base * mul * Math.pow(1.2, g)));
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
@media (max-width: 480px) { table { font-size: 14px; } th, td { padding: 8px 6px; } tbody th { white-space: normal; } thead th span.n { font-size: 12px; } .ask { padding: 16px 12px; } .ask .scroll { margin-left: -4px; margin-right: -4px; } }
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
 <p>You chose helpers first and then alone, with wraiths and brambles as the helpers and the fallen getting up at the Jester's Curtain Call. You also wondered about the whole party coming back to full HP and MP when the boss falls the first time, with a harder second round, if the balance still works out the same. I played that with the eight testers, and it does.</p>
</header>

<section class="ask" aria-label="The fight as you chose it">
 <h2>The fight as you chose it</h2>
 <ul>
  <li><strong>Form one, the fire, whole.</strong> The great wraith's own numbers under new names, with four helpers: wraiths and brambles it has called. It shows no damage.</li>
  <li><strong>It falls, and the Curtain Call comes down.</strong> Every witch gets up with full HP and MP, and Io's Deity is ready again.</li>
  <li><strong>The final form, the fire, broken open.</strong> Alone, with 20% more Life than form one and blows 10% bigger, acting twice as often.</li>
  <li><strong>On hard, only an expert wins:</strong> ${pc(ch[E][2].none)} of the time with no finds and ${pc(ch[E][2].all)} with all 18. Without the refill it was ${pc(bo[E][2].none)} and ${pc(bo[E][2].all)}, so the balance is the same.</li>
 </ul>
 <p>The top number is how often that player wins with no finds, and the number under it is with all 18. The party is level 20 and arrives fresh from a rest spot.</p>
 ${table(ch)}
 <p class="note">${mins(F.chosen.turns)}.</p>
</section>

<section>
 <h2>What the refill changes</h2>
 <ul>
  <li><strong>Hard and crazy come out the same</strong> as the version with no refill. The stronger final form takes back what the refill gives.</li>
  <li><strong>Easy and medium are a touch kinder to a player who thinks.</strong> For her they are now about as hard as the great wraith's fight on its own (medium, focused player: ${pc(ch[Fo][1].none)}, against ${pc(bo[Fo][1].none)} with no refill).</li>
  <li><strong>Nobody is punished for spending everything in form one.</strong> There is nothing to save for, so the fight is as hard on the tenth try as on the first.</li>
  <li><strong>It is a longer fight.</strong> About ${Math.round(Math.min(...F.chosen.turns))} to ${Math.round(Math.max(...F.chosen.turns))} party turns in a win, against ${Math.round(Math.min(...F.both.turns))} to ${Math.round(Math.max(...F.both.turns))} with no refill.</li>
  <li><strong>The careless player does worse.</strong> On easy she wins ${pc(ch['careless'][0].none)} of the time, or ${pc(ch['careless'][0].all)} with every find. With no refill it was ${pc(bo['careless'][0].none)} and ${pc(bo['careless'][0].all)}. The final form alone is a long fight, and she does not last it.</li>
 </ul>
</section>

<section>
 <h2>The numbers</h2>
 <p>These are on the fight rules' scale, where the Jester has 1,000 HP, for easy, medium, hard and crazy. Names of blows are yours to choose.</p>
 <div class="scroll"><table><thead><tr><th>Thing</th>${SET.map(s => `<th class="num">${s.name}<span class="n">level ${s.level}</span></th>`).join('')}</tr></thead><tbody>
  <tr><th>Form one: Life</th>${life(8000, 1).map(x => `<td class="num">${fmt(x)}</td>`).join('')}</tr>
  <tr><th>Form one: plain blow</th>${blow(130, 1).map(x => `<td class="num">${x}</td>`).join('')}</tr>
  <tr><th>Form one: marked blow at one witch</th>${blow(440, 1).map(x => `<td class="num">${x}</td>`).join('')}</tr>
  <tr><th>Form one: blow on everyone, growing each time</th>${blow(110, 1).map(x => `<td class="num">${x}</td>`).join('')}</tr>
  <tr><th>Final form: Life</th>${life(8000, 1.2).map(x => `<td class="num">${fmt(x)}</td>`).join('')}</tr>
  <tr><th>Final form: plain blow</th>${blow(130, 1.1).map(x => `<td class="num">${x}</td>`).join('')}</tr>
  <tr><th>Final form: marked blow at one witch</th>${blow(440, 1.1).map(x => `<td class="num">${x}</td>`).join('')}</tr>
  <tr><th>Final form: blow on everyone, growing each time</th>${blow(110, 1.1).map(x => `<td class="num">${x}</td>`).join('')}</tr>
 </tbody></table></div>
 <ul>
  <li><strong>The helpers</strong> are two of the Shadow Wraith's size and two of the wisp's size. They use the wraiths' numbers until the bramble foes have their own.</li>
  <li><strong>Form one acts every 10</strong> while a helper stands. Alone, in either form, the fire acts every 5. That is already the rule for a boss left alone.</li>
  <li><strong>The final form starts with no Fate on it</strong> and ends for good, in the real Curtain Call.</li>
 </ul>
 <p>All of this is in <code>game/plan/finalboss/final-fight.json</code> for the fight piece to read.</p>
</section>

<section>
 <h2>If you would rather not refill</h2>
 <p>This is the version I first proposed: the fallen get up with a quarter of their HP, nothing else comes back, and the final form has a quarter of form one's Life with the same blows. It is shorter and kinder to the careless player, but an expert who spends everything in form one pays for it.</p>
 ${table(bo)}
 <p class="note">${mins(F.both.turns)}.</p>
</section>

<section>
 <h2>Pictures to make</h2>
 <p>Make the first one first. If your picture maker takes a picture to work from, give it the first picture (or a screenshot of the model page) with the second prompt, so the final form is plainly the same thing. Both forms are the same parts, so the final form costs about the same to draw as the first.</p>
${promptHtml}
</section>

<section class="ask" aria-label="Questions for you">
 <h2>Three things for you to say</h2>
 <ol>
  <li><strong>Is the full refill in?</strong> I have written it into the plan as the one to build, since the balance holds. Say if you would rather keep the shorter version.</li>
  <li><strong>If the party falls in the final form, where does it start again?</strong> I measured it starting again from form one. Starting again from the final form would make the whole fight easier to finish, mostly for the players who struggle.</li>
  <li><strong>What is the story reason for the party coming back to full?</strong> That one is yours. I can have Opus 5.5 bring you a few to choose from.</li>
 </ol>
</section>

<section>
 <h2>How we got here</h2>
 <p>Before you chose, I played three ways of building the fight. The short version:</p>
 <ul>
  <li><strong>The helpers are most of what makes the great wraith hard.</strong> Alone with its own numbers, an attentive player beats it ${pc(lone[A][0].none)} of the time on easy and ${pc(lone[A][1].none)} on medium. With the helpers she wins ${pc(gw[A][0].none)} and ${pc(gw[A][1].none)}.</li>
  <li><strong>One body alone in both forms</strong> could be made hard enough with more Life, but easy became a walkover (${pc(al[A][0].none)} for an attentive player), the Fox could never cast Crazy Quilt, and an expert who saved MP for the second form won hard ${pc(D.saving.alone[E][2].none)} of the time, up from ${pc(al[E][2].none)}.</li>
  <li><strong>Herbs do not rescue the last fight.</strong> With 20 or 60 of each herb in the bag my testers did slightly worse, because eating one costs a turn. A cleverer herb habit might gain a little; I have not built one.</li>
 </ul>
 <h3>The great wraith's fight under new names, in one form</h3>
 ${table(gw)}
 <p class="note">The table you called a good balance, for comparison. ${mins(F.gw.turns)}.</p>
 <h3>One body alone, in two forms</h3>
 ${table(al)}
 <p class="note">${mins(F.alone.turns)}.</p>
</section>

<footer>
 <p>What these numbers are: ${fmt(D.n)} fights for every cell of the big tables and ${fmt(D.nExtra)} for the rest, played by the eight pretend players through the approved fight rules, which are not changed. The helpers use the wraiths' numbers until the bramble foes have their own, and the finds are still to be tuned again for fights that carry HP and MP over.</p>
 <p>Made by the Levelling session on November 15, 2026. In the repo: <code>game/plan/finalboss/</code> (<code>forms.js</code>, <code>forms_run.js</code>, <code>final-fight.json</code>, <code>forms.txt</code>, <code>picture-prompts.md</code>).</p>
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
