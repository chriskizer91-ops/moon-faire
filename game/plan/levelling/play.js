// The playthrough itself, shared by run.js (the options) and check_chosen.js (the plan Chris chose).
// A plan P needs: fair (set fights), rings (table, foeLevels, gate), toReach (XP in all for each level), o.top.
// A party cannot pass the last level that toReach lists, so a plan with a top level simply stops its list there.
const { measure } = require('../sim/lib.js');
const { xpOf } = require('./options.js');
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
module.exports = { play, summary, q, mean };
