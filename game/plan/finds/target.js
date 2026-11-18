// Chris's target (November 15): the last fight's foes stand two levels above the party, and only an expert who has
// found everything can just barely win it. Where do the finds stand against that, at each strength?
//   node target.js [fights each, default 3000]
const fs = require('fs');
const { measure } = require('./lib.js');
const F = require('./finds.js');
const N = +process.argv[2] || 3000;
const scale = k => c => c.mul !== undefined ? { path: c.path, mul: 1 + (c.mul - 1) * k } : Number.isInteger(c.add) ? c : { path: c.path, add: c.add * k };
const styles = ['careless', 'attentive', 'expert'];
const p = x => (x * 100).toFixed(0).padStart(3) + '%';
const out = { n: N, rows: [] };
// finds.js holds the chosen strength; "k" is a multiple of it
for (const gap of [0, 1, 2, 3]) {
  console.log('\nThe last fight (B2K2w), its foes ' + gap + ' level' + (gap === 1 ? '' : 's') + ' above the party');
  for (const [label, k, which] of [['no finds', 0, []], ['every find, at the chosen strength', 1, F], ['every find, at twice that', 2, F], ['every find, at half that', 0.5, F]]) {
    const ch = which.flatMap(f => f.changes.map(scale(k)));
    const r = {}; for (const s of styles) r[s] = measure('B2K2w', gap, s, N, ch).win;
    out.rows.push({ gap, label, k, r });
    console.log('  ' + label.padEnd(38), styles.map(s => p(r[s])).join(' /'));
  }
}
fs.writeFileSync(__dirname + '/target.json', JSON.stringify(out, null, 1));
