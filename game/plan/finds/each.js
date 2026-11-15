// Each kind of find alone, against the fights that can be lost. node each.js [fights each, default 4000]
const fs = require('fs');
const { measure } = require('./lib.js');
const C = require('./candidates.js');
const N = +process.argv[2] || 4000;
const tests = [['B2K2w', 0, 'the last gate'], ['BK2w', 0, 'the level-17 gate'], ['B', 0, 'the lone great wraith'], ['2K4w', 4, 'the worst walking fight']];
const styles = ['careless', 'attentive', 'expert'];
const base = {}; for (const [c, g] of tests) { base[c] = {}; for (const s of styles) base[c][s] = measure(c, g, s, N, []); }
const p = x => (x * 100).toFixed(1).padStart(5);
const d = x => ((x >= 0 ? '+' : '') + (x * 100).toFixed(1)).padStart(6);
console.log('as it is'.padEnd(10), tests.map(([c]) => c.padEnd(6) + styles.map(s => p(base[c][s].win)).join(' ')).join('  |  '));
const out = { n: N, tests, base, each: {} };
for (const f of C) {
  const r = {}; for (const [c, g] of tests) { r[c] = {}; for (const s of styles) r[c][s] = measure(c, g, s, N, f.changes); }
  out.each[f.id] = { does: f.does, r };
  console.log(f.id.padEnd(10), tests.map(([c]) => c.padEnd(6) + styles.map(s => d(r[c][s].win - base[c][s].win)).join('')).join('  |  '), ' ', f.does);
}
fs.writeFileSync(__dirname + '/each.json', JSON.stringify(out, null, 1));
