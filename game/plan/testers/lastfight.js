// Chris, November 15 (12:56 pm): before the last fight the game offers easy, medium, hard and crazy, which set its
// foes at level 20, 21, 22 or 22.8 against a party that stops at 20. Today's last fight stands in for the big bad.
// The party meets it fresh, straight from a rest spot.   node lastfight.js [fights each, default 3000]
const fs = require('fs');
const { names, playOut } = require('./testers.js');
const { rulesWith } = require('../finds/lib.js');
const F = require('../finds/finds.js');
const N = +process.argv[2] || 3000;
const settings = [['easy', 0], ['medium', 1], ['hard', 2], ['crazy', 2.8]];
const win = (gap, t, changes) => { const rules = rulesWith(changes, 'B2K2w'); let w = 0; for (let i = 0; i < N; i++) if (playOut('B2K2w', { rules, tester: t, level: gap, seed: 977 + i * 7919 }).over === 'won') w++; return w / N; };
const all = F.flatMap(f => f.changes), p = x => (x * 100).toFixed(x > 0 && x < 0.095 ? 1 : 0).padStart(4) + '%';
const out = { n: N, settings, rows: {} };
console.log('The last fight: wins with no finds / with all 18.   ' + settings.map(([n, g]) => n + ' (level ' + (20 + g) + ')').join('   '));
for (const t of names) { out.rows[t] = settings.map(([n, g]) => ({ name: n, level: 20 + g, none: win(g, t, []), all: win(g, t, all) })); console.log('  ' + t.padEnd(20), out.rows[t].map(c => p(c.none) + ' /' + p(c.all)).join('     ')); }
fs.writeFileSync(__dirname + '/lastfight.json', JSON.stringify(out, null, 1));
