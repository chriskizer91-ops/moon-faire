// Measures the ways of building the final boss fight (see forms.js).   node forms_run.js [fights each, default 2000]
// Writes forms.json and forms.txt. The party arrives fresh from a rest spot, at level 20, with no herbs unless said.
const fs = require('fs');
const { names } = require('../testers/testers.js');
const F = require('../finds/finds.js');
const M = require('./forms.js');
const N = +process.argv[2] || 2000, NX = Math.round(N / 2);
const all = F.flatMap(f => f.changes);
const settings = [['easy', 0], ['medium', 1], ['hard', 2], ['crazy', 2.8]];
// Life and blows are multiples of the great wraith's own (8,000 Life, Blow 130, Crush 440, Eclipse 110 growing by 25, at
// the fight's level). A body with no helpers acts twice as fast (every 5 instead of every 10): the approved rule.
const FIGHTS = {
  gw:    { name: "The great wraith's fight under new names, one form", forms: [{ code: 'B2K2w' }] },
  alone: { name: 'One body alone, in two forms', forms: [{ code: 'B', life: 1.3 }, { code: 'B', life: 0.4, dmg: 1.1 }] },
  both:  { name: 'Helpers in form one, alone in form two', forms: [{ code: 'B2K2w' }, { code: 'B', life: 0.25 }] },
};
const EXTRA = {
  loneGw:      { name: 'The great wraith alone, its own numbers, one form (to show what the helpers are worth)', forms: [{ code: 'B' }] },
  aloneHarder: { name: 'One body alone, the final form hitting 25% harder instead of 10%', forms: [{ code: 'B', life: 1.3 }, { code: 'B', life: 0.4, dmg: 1.25 }] },
  bothHarder:  { name: 'Helpers then alone, the final form hitting 20% harder', forms: [{ code: 'B2K2w' }, { code: 'B', life: 0.25, dmg: 1.2 }] },
  bothNoBow:   { name: 'Helpers then alone, but nobody gets up when form one ends', forms: [{ code: 'B2K2w', bow: false }, { code: 'B', life: 0.25 }] },
};
const careful = ['attentive, careful', 'focused, careful', 'expert, careful'];
const cell = (forms, g, t, n, herbs, saver) => { const a = M.measure(forms, g, t, [], n, herbs, saver), b = M.measure(forms, g, t, all, n, herbs, saver); return { none: a.win, all: b.win, turns: a.turns || b.turns, lostInFormOne: a.lostInFormOne }; };
const p = x => (x * 100).toFixed(x > 0 && x < 0.095 ? 1 : 0).padStart(4) + '%';
const out = { n: N, nExtra: NX, settings, fights: {}, extra: {}, saving: {}, herbs: {} };
const lines = [];
const say = s => { console.log(s); lines.push(s); };
say(`Wins with no finds / with all 18, over ${N} fights each.   ` + settings.map(([n, g]) => `${n} (level ${20 + g})`).join('   '));
for (const [key, f] of Object.entries(FIGHTS)) {
  say('\n' + f.name + '   ' + JSON.stringify(f.forms));
  out.fights[key] = { name: f.name, forms: f.forms, rows: {} };
  for (const t of names) { const row = settings.map(([n, g]) => cell(f.forms, g, t, N)); out.fights[key].rows[t] = row; say('  ' + t.padEnd(20) + row.map(c => p(c.none) + ' /' + p(c.all)).join('     ')); }
  const tt = settings.map(([n, g]) => M.measure(f.forms, g, 'expert, careful', all, 400).turns);
  out.fights[key].turns = tt; say('  party turns in a win (expert, all finds): ' + tt.map(x => x.toFixed(0)).join(', '));
}
say(`\nOther versions, the three careful thinking testers, ${NX} fights each.`);
for (const [key, f] of Object.entries(EXTRA)) {
  say('\n' + f.name + '   ' + JSON.stringify(f.forms));
  out.extra[key] = { name: f.name, forms: f.forms, rows: {} };
  for (const t of careful) { const row = settings.map(([n, g]) => cell(f.forms, g, t, NX)); out.extra[key].rows[t] = row; say('  ' + t.padEnd(20) + row.map(c => p(c.none) + ' /' + p(c.all)).join('     ')); }
}
say('\nA player who knows the second form is coming and saves MP in the first.');
for (const key of ['alone', 'both']) {
  say('\n' + FIGHTS[key].name);
  out.saving[key] = {};
  for (const t of careful) { const row = settings.map(([n, g]) => cell(FIGHTS[key].forms, g, t, NX, null, true)); out.saving[key][t] = row; say('  ' + t.padEnd(20) + row.map(c => p(c.none) + ' /' + p(c.all)).join('     ')); }
}
say('\nWith herbs in the bag, eaten in the fight when Io cannot mend (20 HP herbs and 20 MP herbs; then 60 and 60).');
for (const key of ['gw', 'alone', 'both']) for (const bag of [{ hp: 20, mp: 20 }, { hp: 60, mp: 60 }]) {
  say('\n' + FIGHTS[key].name + ', ' + bag.hp + ' and ' + bag.mp + ' herbs');
  out.herbs[key + bag.hp] = { bag, rows: {} };
  for (const t of careful) { const row = settings.map(([n, g]) => cell(FIGHTS[key].forms, g, t, NX, bag)); out.herbs[key + bag.hp].rows[t] = row; say('  ' + t.padEnd(20) + row.map(c => p(c.none) + ' /' + p(c.all)).join('     ')); }
}
fs.writeFileSync(__dirname + '/forms.json', JSON.stringify(out, null, 1));
fs.writeFileSync(__dirname + '/forms.txt', lines.join('\n') + '\n');
