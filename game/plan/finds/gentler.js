// The same 18 finds at half strength: every percentage halved (5% becomes 2.5%, Revive 35%, Sealed Fate 22.5%);
// the two finds that add a whole thing (a fourth Bloom, a third blow for the ghost) stay as they are.
const fs = require('fs');
const { measure } = require('./lib.js');
const F = require('./finds.js');
const N = +process.argv[2] || 4000;
const half = c => c.mul !== undefined ? { path: c.path, mul: 1 + (c.mul - 1) / 2 } : Number.isInteger(c.add) ? c : { path: c.path, add: c.add / 2 };
const styles = ['careless', 'attentive', 'expert'];
const kinds = [['nothing', []], ['what lies on the way', ['on the way']], ['and what is off the path', ['on the way', 'off the path']], ['everything', ['on the way', 'off the path', 'hidden']]];
const p = x => (x * 100).toFixed(0).padStart(3) + '%';
const out = { n: N, gates: [] };
for (const g of [{ ring: 5, code: 'BK2w' }, { ring: 6, code: 'B2K2w' }]) {
  console.log('\nring ' + g.ring + ' gate, ' + g.code + ', finds at half strength');
  const row = { gate: g, kinds: [] };
  for (const [label, hows] of kinds) {
    const have = F.filter(f => f.ring <= g.ring && hows.includes(f.how));
    const r = {}; for (const s of styles) r[s] = measure(g.code, 0, s, N, have.flatMap(f => f.changes.map(half)));
    row.kinds.push({ label, finds: have.length, r });
    console.log('  ' + label.padEnd(26), String(have.length).padStart(2), 'finds   wins', styles.map(s => p(r[s].win)).join(' /'));
  }
  out.gates.push(row);
}
fs.writeFileSync(__dirname + '/gentler.json', JSON.stringify(out, null, 1));
