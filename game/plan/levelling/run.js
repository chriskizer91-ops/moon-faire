// Whole playthroughs of each levelling option, 2,000 per play style, with the approved engine deciding every fight.
//   node run.js            the three options, usual fights
//   node run.js quick      the same with small packs as the usual fight
// A "playthrough" here: the three fights at the fair, then ring by ring. In a ring the party meets walking fights from
// the ring's table, against foes of the ring's levels, until it is the level the ring's gate asks for; then the gate fight.
// "steady" fights only what it must. "explorer" fights half as many again in every ring before the gate.
const fs = require('fs');
const { measure } = require('../sim/lib.js');
const { build, xpOf, options } = require('./options.js');
const mix = process.argv[2] === 'quick' ? 'quick' : 'full';
const N = +process.argv[3] || 2000;
const rng = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const clampGap = g => Math.max(-6, Math.min(6, g));

function play(P, seed, style, explorer) {
  const r = rng(seed);
  const S = { xp: 0, fights: 0, wins: 0, losses: 0, hero: 0, foe: 0, ups: {}, marks: [], gateTries: [], gaps: {} };
  const levelOf = x => { let L = 1; while (P.toReach[L + 1] !== undefined && x >= P.toReach[L + 1]) L++; return L; };
  function fight(code, foeLevel, isGate) {
    for (let tries = 1; tries <= 60; tries++) {
      const L = levelOf(S.xp); const gap = clampGap(foeLevel - L);
      const m = measure(code, gap, style, 300);
      S.fights++;
      if (!isGate) S.gaps[gap] = (S.gaps[gap] || 0) + 1;
      if (r() < m.win) {
        S.wins++; S.hero += m.ht; S.foe += m.ft;
        S.xp += xpOf(code, foeLevel);
        const a = levelOf(S.xp); for (let k = L + 1; k <= a; k++) S.ups[k] = S.wins;
        return tries;
      }
      S.losses++; S.hero += m.htAll; S.foe += m.ftAll;
      if (!isGate) return 0;          // a lost walking fight is just lost: wake at the rest spot and walk on
    }
    return 61;
  }
  const pick = table => { let w = table.reduce((a, t) => a + t[1], 0) * r(); for (const t of table) { if ((w -= t[1]) < 0) return t[0]; } return table[0][0]; };
  for (const f of P.fair) fight(f.code, f.level, true);
  S.marks.push({ name: 'Leaving the fair', level: levelOf(S.xp), wins: S.wins });
  for (const ring of P.rings) {
    const start = S.wins; let must = 0;
    while (levelOf(S.xp) < ring.gate.level) { const fl = ring.foeLevels[0] + Math.floor(r() * (ring.foeLevels[1] - ring.foeLevels[0] + 1)); fight(pick(ring.table), fl, false); }
    must = S.wins - start;
    if (explorer) for (let i = 0; i < Math.round(must * 0.5); i++) { const fl = ring.foeLevels[0] + Math.floor(r() * (ring.foeLevels[1] - ring.foeLevels[0] + 1)); fight(pick(ring.table), fl, false); }
    const before = levelOf(S.xp);
    const tries = fight(ring.gate.code, ring.gate.level, true);
    S.gateTries.push(tries);
    S.marks.push({ name: 'Ring ' + ring.n + ' gate (' + ring.gate.code + ', level ' + ring.gate.level + ')', level: before, wins: S.wins, tries });
  }
  S.endLevel = levelOf(S.xp);
  return S;
}

const q = (a, f) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * f))];
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
function summary(P, who, style, n) {
  const all = []; for (let i = 0; i < n; i++) all.push(play(P, 4321 + i * 7919, style, who === 'explorer'));
  const ups = {}; for (let L = 2; L <= P.o.top; L++) ups[L] = q(all.map(s => s.ups[L] || 0), 0.5);
  const marks = all[0].marks.map((m, i) => ({ name: m.name, level: q(all.map(s => s.marks[i].level), 0.5), wins: q(all.map(s => s.marks[i].wins), 0.5), tries: m.tries === undefined ? undefined : +mean(all.map(s => s.marks[i].tries)).toFixed(2) }));
  const gaps = {}; let gt = 0; for (const s of all) for (const g in s.gaps) { gaps[g] = (gaps[g] || 0) + s.gaps[g]; gt += s.gaps[g]; }
  for (const g in gaps) gaps[g] = +(gaps[g] / gt).toFixed(3);
  const hero = mean(all.map(s => s.hero)), foe = mean(all.map(s => s.foe)), fights = mean(all.map(s => s.fights));
  const mins = (h, f, k) => Math.round((hero * h + foe * f + fights * k) / 60);
  return {
    wins: [q(all.map(s => s.wins), 0.1), q(all.map(s => s.wins), 0.5), q(all.map(s => s.wins), 0.9)], meanWins: mean(all.map(s => s.wins)),
    fights: +fights.toFixed(1), losses: +mean(all.map(s => s.losses)).toFixed(1),
    lastGateTries: +mean(all.map(s => s.gateTries[s.gateTries.length - 1])).toFixed(2),
    heroTurns: Math.round(hero), foeTurns: Math.round(foe), minutes: { quick: mins(4, 2.5, 8), middle: mins(6, 3, 10), slow: mins(9, 4, 12) },
    endLevel: [q(all.map(s => s.endLevel), 0.1), q(all.map(s => s.endLevel), 0.5), q(all.map(s => s.endLevel), 0.9)],
    ups, marks, gaps,
  };
}
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
