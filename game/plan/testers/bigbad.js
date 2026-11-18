// The table Chris asked to see with all eight testers: today's last fight with its foes at levels 20 to 23
// (the party stops at 20), with no finds and with all eighteen. Also the two gates before it and a hard walking fight.
//   node bigbad.js [fights each, default 2000]
const fs = require('fs');
const { names, playOut } = require('./testers.js');
const { rulesWith } = require('../finds/lib.js');
const F = require('../finds/finds.js');
const N = +process.argv[2] || 2000;
function measure(code, gap, tester, n, changes) {
  const rules = rulesWith(changes, code);
  let won = 0, turns = 0, kos = 0, hp = 0, mp = 0;
  for (let i = 0; i < n; i++) {
    const B = playOut(code, { rules, tester, level: gap, seed: 977 + i * 7919 });
    if (B.over !== 'won') continue;
    won++; turns += B.heroTurns; kos += B.kos;
    const hs = B.fighters.filter(u => u.side === 'hero');
    hp += hs.reduce((s, u) => s + Math.max(0, u.hp), 0) / hs.reduce((s, u) => s + u.max, 0);
    mp += hs.reduce((s, u) => s + u.mp, 0) / hs.reduce((s, u) => s + rules.heroes[u.id].mp, 0);
  }
  return { win: won / n, turns: won ? turns / won : 0, kos: won ? kos / won : 0, hpLeft: won ? hp / won : 0, mpLeft: won ? mp / won : 0 };
}
const all = F.flatMap(f => f.changes);
const p = x => (x * 100).toFixed(0).padStart(3) + '%';
const out = { n: N, last: {}, other: {} };
console.log('The last fight (B2K2w). Wins with no finds / with all 18, its foes at level 20, 21, 22, 23');
for (const t of names) {
  out.last[t] = [];
  let line = '  ' + t.padEnd(20);
  for (const gap of [0, 1, 2, 3]) { const a = measure('B2K2w', gap, t, N, []), b = measure('B2K2w', gap, t, N, all); out.last[t].push({ level: 20 + gap, none: a, all: b }); line += '   ' + p(a.win) + ' /' + p(b.win); }
  console.log(line);
}
console.log('\nOther fights, no finds: wins; witch turns, HP left and MP left after a won fight');
const others = [['3w', 1, 'three wisps, 1 level over'], ['2K2w', 2, 'two Shadow Wraiths and two wisps, 2 over'], ['2K4w', 4, 'the worst walking fight, 4 over'], ['B', 0, 'the great wraith alone, the level-14 gate'], ['BK2w', 0, 'the level-17 gate']];
for (const t of names) {
  out.other[t] = [];
  let line = '  ' + t.padEnd(20);
  for (const [code, gap, name] of others) { const a = measure(code, gap, t, N, []); out.other[t].push({ code, gap, name, r: a }); line += '   ' + code.padEnd(5) + p(a.win) + ' ' + a.turns.toFixed(1).padStart(5) + p(a.hpLeft) + p(a.mpLeft); }
  console.log(line);
}
fs.writeFileSync(__dirname + '/bigbad.json', JSON.stringify(out, null, 1));
