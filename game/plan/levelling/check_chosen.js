// Plays the chosen plan, read only from plan-chosen.js, 2,000 times per play style. The party cannot pass the top level.
const fs = require('fs');
const C = require('./plan-chosen.js');
const { play, summary } = require('./play.js');
const { xpOf } = require('./options.js');
// the plan's own helpers must agree with the ones the options were measured with
for (const r of C.rings) for (const m of r.meets) for (let f = r.foeLevels[0]; f <= r.foeLevels[1]; f++) if (C.xpOf(m.foes, f) !== xpOf(m.foes, f)) throw new Error('xpOf differs for ' + m.foes + ' ' + f);
if (C.levelOf(0) !== 1 || C.levelOf(C.toReach[C.top] * 9) !== C.top || C.levelOf(C.toReach[7]) !== 7 || C.levelOf(C.toReach[7] - 1) !== 6) throw new Error('levelOf is wrong');
const P = { o: { top: C.top, fights: C.fightsToFinish }, toReach: C.toReach, fair: C.fair.map(f => ({ code: f.foes, level: f.foeLevel })),
  rings: C.rings.map(r => ({ n: r.ring, enter: r.partyEnters, leave: r.partyLeaves, foeLevels: r.foeLevels, table: r.meets.map(m => [m.foes, m.weight]), gate: { code: r.gate.foes, level: r.gate.foeLevel } })) };
const N = +process.argv[2] || 2000, out = {};
console.log('Chosen: option ' + C.chosen.option + ', ' + C.chosen.fights + ' fights, top level ' + C.top + ' (' + C.chosen.by + ')');
for (const who of ['steady', 'explorer']) for (const style of ['careless', 'attentive', 'expert']) {
  const r = out[who + '/' + style] = summary(P, who, style, N);
  console.log(' ', (who + '/' + style).padEnd(20), 'wins', r.wins.join(' / '), ' lost', r.losses, ' last gate tries', r.lastGateTries, ' witch turns', r.heroTurns, ' foe turns', r.foeTurns, ' minutes', r.minutes.quick + '-' + r.minutes.middle + '-' + r.minutes.slow, ' end level', r.endLevel.join('/'));
}
const a = out['steady/attentive'];
console.log('  levels arrive on win number (steady, attentive):', Object.entries(a.ups).map(([L, w]) => 'L' + L + ':' + w).join(' '));
fs.writeFileSync(__dirname + '/results-chosen.json', JSON.stringify(out, null, 1));
