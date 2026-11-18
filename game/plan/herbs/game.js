// A whole game under the rules Chris chose on November 15: the v2 levelling plan (walking foes one below to two above
// the party, gates at 10 and 20), HP and MP carried from fight to fight, plants picked as she goes, "top everybody up"
// after a fight, rest spots that refill everything, and waking at the last rest spot after a loss.
//   node game.js [games each, default 150]
const fs = require('fs');
const { fight, after, full, HERBS, TOP_UP, HABIT, parse } = require('./journey.js');
const { names } = require('../testers/testers.js');
const { rulesWith } = require('../finds/lib.js');
const P2 = require('../levelling/plan2.js');
const { xpOf } = require('../levelling/options.js');
const rng = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const PLANTS = { hp: 1, mp: 2 };

// cfg.rest: a rest spot every this many walking fights inside a band (0 = only where the band begins); cfg.cal: XP fine tuning
function playGame(tester, seed, cfg) {
  const P = cfg.plan, rules = rulesWith(cfg.changes || []), r = rng(seed), bag = { hp: 0, mp: 0 };
  const habit = tester === 'very careless' ? null : tester === 'careless' ? undefined : (cfg.topUp === false ? undefined : TOP_UP);
  const S = { wins: 0, losses: 0, turns: 0, foeTurns: 0, fights: 0, used: { hp: 0, mp: 0 }, band: {}, gateTries: {}, rests: 0 };
  let xp = 0, state = full();
  const levelOf = x => { let L = 1; while (L < P.TOP && x >= P.toReach[L + 1]) L++; return L; };
  const one = (code, foeLevel, fresh) => {
    const L = levelOf(xp), R = Object.assign({}, rules, { encounters: [{ id: code, label: code, foes: parse(code) }] });
    if (fresh) state = full();
    const f = fight(code, foeLevel - L, tester, Math.floor(r() * 1e9), R, state, bag);
    S.fights++; S.turns += f.turns; S.foeTurns += f.foeTurns; S.used.hp += f.used.hp; S.used.mp += f.used.mp;
    if (f.won) { S.wins++; xp += xpOf(code, foeLevel); state = f.state; } else { S.losses++; state = full(); }
    return f.won;
  };
  for (const f of P.fair) for (let t = 0; t < 60 && !one(f.code, f.level, true); t++);       // the fair is a rest spot
  for (const b of P.bands) {
    const B = S.band[b.band] = { wins: 0, losses: 0, rests: 0 }; let since = 0; state = full(); S.rests++;
    const tw = b.meets.reduce((s, m) => s + m.weight, 0), every = (cfg.rest && cfg.rest[b.band]) || 0;
    while (levelOf(xp) < b.to) {
      if (every && since >= every) { state = full(); since = 0; B.rests++; S.rests++; }
      let w = r() * tw, code = b.meets[0].foes; for (const m of b.meets) { if ((w -= m.weight) < 0) { code = m.foes; break; } }
      const L = levelOf(xp), foeLevel = Math.max(1, L - P.WALK.below + Math.floor(r() * (P.WALK.below + P.WALK.above + 1)));
      if (one(code, foeLevel, false)) { B.wins++; since++; bag.hp += PLANTS.hp; bag.mp += PLANTS.mp; const u = after(state, tester, rules, bag, HERBS, habit); S.used.hp += u.hp; S.used.mp += u.mp; }
      else { B.losses++; since = 0; }
    }
    const g = P.gates.find(x => x.opensAtLevel === b.to);
    if (g) { let tries = 1; while (!one(g.foes, g.foeLevel, true) && tries < 200) tries++; S.gateTries[g.id] = tries; }
  }
  S.level = levelOf(xp); S.herbsLeft = { hp: bag.hp, mp: bag.mp };
  return S;
}
module.exports = { playGame, PLANTS };
if (require.main === module) {
  const N = +process.argv[2] || 150, q = (a, f) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * f))], mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  // fine tuning: nudge the XP so a careful attentive party finishes on about 180 wins
  let cal = 1; for (let i = 0; i < 3; i++) { const plan = P2.build(cal); const m = mean(Array.from({ length: 60 }, (_, k) => playGame('attentive, careful', 11 + k * 7919, { plan, rest: { 5: 10, 6: 6 } }).wins)); cal *= 1 + (P2.FIGHTS - m) / (P2.FIGHTS - 5); }
  cal = +cal.toFixed(3); const plan = P2.build(cal); P2.write(plan);
  const out = { n: N, cal, plants: PLANTS, runs: {} };
  for (const [label, rest] of [['rest spots only where a band begins', {}], ['and inside band 5 every 10 fights, band 6 every 6', { 5: 10, 6: 6 }]]) {
    console.log('\n' + label + '   (fine tuning ' + cal + ')');
    console.log('  tester                wins   lost   lost in bands 1..6            tries at the great wraith / great bramble   hours of fights (quick-middle-slow)   herbs eaten HP/MP');
    out.runs[label] = {};
    for (const t of names) {
      const G = []; for (let i = 0; i < N; i++) G.push(playGame(t, 101 + i * 7919, { plan, rest }));
      const hrs = (h, f, k) => (mean(G.map(g => g.turns * h + g.foeTurns * f + g.fights * k)) / 3600).toFixed(1);
      const row = { wins: q(G.map(g => g.wins), 0.5), losses: +mean(G.map(g => g.losses)).toFixed(1), bandLosses: [1, 2, 3, 4, 5, 6].map(b => +mean(G.map(g => g.band[b].losses)).toFixed(1)),
        gw: +mean(G.map(g => g.gateTries['great-wraith'])).toFixed(1), gb: +mean(G.map(g => g.gateTries['great-bramble'])).toFixed(1), hours: [hrs(4, 2.5, 8), hrs(6, 3, 10), hrs(9, 4, 12)], herbs: [Math.round(mean(G.map(g => g.used.hp))), Math.round(mean(G.map(g => g.used.mp)))] };
      out.runs[label][t] = row;
      console.log('  ' + t.padEnd(20), String(row.wins).padStart(5), String(row.losses).padStart(6), '  ', row.bandLosses.map(x => String(x).padStart(4)).join(' '), '   ', String(row.gw).padStart(5), '/', String(row.gb).padStart(5), '                       ', row.hours.join(' - '), '        ', row.herbs.join(' / '));
    }
  }
  fs.writeFileSync(__dirname + '/game.json', JSON.stringify(out, null, 1));
}
