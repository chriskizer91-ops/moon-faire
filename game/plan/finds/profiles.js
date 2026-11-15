// The finds a player is likely to be carrying at each gate, and what they do there.
// Four kinds of player: finds nothing; picks up what lies on the way; also goes off the path; finds everything.
// node profiles.js [fights each, default 4000]
const fs = require('fs');
const { measure } = require('./lib.js');
const F = require('./finds.js');
const N = +process.argv[2] || 4000;
const styles = ['careless', 'attentive', 'expert'];
const gates = [{ ring: 4, code: 'B', name: 'ring 4: the great wraith alone, level 14' }, { ring: 5, code: 'BK2w', name: 'ring 5: the great wraith, a Shadow Wraith and 2 wisps, level 17' }, { ring: 6, code: 'B2K2w', name: 'ring 6: the last gate, level 20' }];
const kinds = [['nothing', []], ['what lies on the way', ['on the way']], ['and what is off the path', ['on the way', 'off the path']], ['everything', ['on the way', 'off the path', 'hidden']]];
const p = x => (x * 100).toFixed(0).padStart(3) + '%';
const out = { n: N, gates: [] };
for (const g of gates) {
  console.log('\n' + g.name);
  const row = { gate: g, kinds: [] };
  for (const [label, hows] of kinds) {
    const have = F.filter(f => f.ring <= g.ring && hows.includes(f.how));
    const changes = have.flatMap(f => f.changes);
    const r = {}; for (const s of styles) r[s] = measure(g.code, 0, s, N, changes);
    row.kinds.push({ label, finds: have.length, r });
    console.log('  ' + label.padEnd(26), String(have.length).padStart(2), 'finds   wins', styles.map(s => p(r[s].win)).join(' /'), '  tries for a careless player', (1 / Math.max(r.careless.win, 0.001)).toFixed(1));
  }
  out.gates.push(row);
}
// the two fights from lore/combat-balance.md that are harder than anything in the game, with every find
const allChanges = F.flatMap(f => f.changes); out.extra = [];
console.log('\nHarder than anything in the game (lore/combat-balance.md), at the party\'s level');
for (const [code, name] of [['2BKw', 'two great wraiths, a Shadow Wraith and a wisp'], ['2B2K3w', 'the hardest fight: two great wraiths, two Shadow Wraiths, three wisps']]) {
  const a = {}, b = {}; for (const s of styles) { a[s] = measure(code, 0, s, N, []); b[s] = measure(code, 0, s, N, allChanges); }
  out.extra.push({ code, name, none: a, all: b });
  console.log('  ' + name.padEnd(70), 'no finds', styles.map(s => p(a[s].win)).join(' /'), '  all 18', styles.map(s => p(b[s].win)).join(' /'));
}
fs.writeFileSync(__dirname + '/profiles.json', JSON.stringify(out, null, 1));
