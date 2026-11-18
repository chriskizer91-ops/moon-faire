// Whole playthroughs of each levelling option, 2,000 per play style, with the approved engine deciding every fight.
//   node run.js            the three options, usual fights
//   node run.js quick      the same with small packs as the usual fight
// A "playthrough" here: the three fights at the fair, then ring by ring. In a ring the party meets walking fights from
// the ring's table, against foes of the ring's levels, until it is the level the ring's gate asks for; then the gate fight.
// "steady" fights only what it must. "explorer" fights half as many again in every ring before the gate.
const fs = require('fs');
const { build, options } = require('./options.js');
const mix = process.argv[2] === 'quick' ? 'quick' : 'full';
const N = +process.argv[3] || 2000;
const { play, summary, q, mean } = require('./play.js');
// Fine tuning: nudge the XP so a steady, attentive party finishes on the number of wins aimed for.
function tuned(key, tweak) {
  let cal = 1, P;
  for (let i = 0; i < 4; i++) { P = build(key, mix, Object.assign({}, tweak, { cal })); const m = summary(P, 'steady', 'attentive', 500).meanWins; cal *= 1 + (P.o.fights - m) / (P.o.fights - 3 - P.o.rings); }
  return build(key, mix, Object.assign({}, tweak, { cal: +cal.toFixed(3) }));
}
const out = {};
for (const key of Object.keys(options)) {
  const P = tuned(key);
  const res = { title: P.o.title, top: P.o.top, aim: P.o.fights, cal: P.o.cal, mix, rings: P.rings, toReach: P.toReach, step: P.step, perLevel: P.perLevel, runs: {} };
  for (const who of ['steady', 'explorer']) for (const style of ['careless', 'attentive', 'expert']) res.runs[who + '/' + style] = summary(P, who, style, N);
  out[key] = res;
}
// The two dials on their own: any number of levels with any number of fights (steady, attentive).
const grid = [];
for (const key of Object.keys(options)) for (const fights of [120, 180, 240]) {
  const P = tuned(key, { fights }); const r = summary(P, 'steady', 'attentive', 800);
  grid.push({ top: P.o.top, aim: fights, wins: r.wins[1], perLevel: +(r.wins[1] / (P.o.top - 1)).toFixed(1), firstLevels: r.ups[5], minutes: r.minutes, heroTurns: r.heroTurns });
}
out.grid = grid;
fs.writeFileSync(__dirname + '/results-' + mix + '.json', JSON.stringify(out, null, 1));
const fmt = n => Math.round(n).toLocaleString('en-US');
for (const key of Object.keys(options)) {
  const o = out[key]; console.log('\n===== Option ' + key + ': ' + o.title + ' (' + mix + ' fights; fine tuning ' + o.cal + ')');
  console.log('rings:'); for (const r of o.rings) console.log('  ring', r.n, ' party', r.enter + ' to ' + r.leave, ' foes level', r.foeLevels.join(' to '), ' meets', r.table.map(t => t[0]).join(' '), ' gate', r.gate.code, 'at level', r.gate.level);
  console.log('XP to reach each level:', Object.entries(o.toReach).filter(([L]) => +L <= o.top).map(([L, x]) => 'L' + L + ' ' + fmt(x)).join(', '));
  for (const k in o.runs) { const r = o.runs[k];
    console.log(' ', k.padEnd(20), 'wins', r.wins.join(' / '), ' lost', r.losses, ' last gate tries', r.lastGateTries, ' witch turns', r.heroTurns, ' foe turns', r.foeTurns, ' minutes', r.minutes.quick + '-' + r.minutes.middle + '-' + r.minutes.slow, ' end level', r.endLevel.join('/'));
  }
  const a = o.runs['steady/attentive'];
  console.log('  levels arrive on win number (steady, attentive):', Object.entries(a.ups).map(([L, w]) => 'L' + L + ':' + w).join(' '));
  for (const who of ['steady/attentive', 'explorer/attentive', 'steady/careless']) { console.log('  gates (' + who + '):'); for (const m of o.runs[who].marks) console.log('    ', m.name.padEnd(36), 'party level', m.level, ' wins so far', m.wins, m.tries === undefined ? '' : ' tries ' + m.tries); }
  console.log('  how far above the party the walking foes were (steady, attentive):', Object.keys(a.gaps).map(Number).sort((x, y) => x - y).map(g => (g >= 0 ? '+' : '') + g + ' ' + Math.round(a.gaps[g] * 100) + '%').join(', '));
}
console.log('\n===== The two dials (steady, attentive): levels, wins aimed for, wins, wins a level, win on which level 5 comes, minutes quick-middle-slow');
for (const g of grid) console.log('  ', String(g.top).padStart(2), 'levels ', String(g.aim).padStart(3), ' wins', g.wins, ' a level', g.perLevel, ' L5 on win', g.firstLevels, ' minutes', g.minutes.quick + '-' + g.minutes.middle + '-' + g.minutes.slow);
