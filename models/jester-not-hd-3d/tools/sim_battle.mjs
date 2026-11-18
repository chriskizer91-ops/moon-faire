// Plays the turn-based fight thousands of times with a few kinds of player. It uses the page's own rules
// (viewer/rules.js). Balance is not the point yet (Chris, November 12): this only checks the fight can be played and lost.
// usage: node tools/sim_battle.mjs [fights] [level]
import * as R from '../viewer/rules.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const ok = (S, id, f) => !R.why(S, id, f);
const first = (S, id) => R.living(S).find(f => ok(S, id, f));

// each player answers with [command, target]
export const PLAYERS = {
  // marks each wraith with Doom, then stays alive while the bell counts; takes Curtain Call the moment it is ready
  'plays well': S => {
    const h = S.hero, next = [...R.living(S)].sort((a, b) => b.atb - a.atb)[0];
    if (ok(S, 'curtain')) return ['curtain'];
    if (h.hp <= 0.4 * h.maxHp && ok(S, 'odds')) return ['odds'];
    if (first(S, 'fate')) return ['fate', first(S, 'fate')];
    if (ok(S, 'hush', next) && h.mp - R.CMD.hush.mp >= R.CMD.odds.mp) return ['hush', next];
    return ['defend'];
  },
  'dooms, then attacks': S => (ok(S, 'curtain') ? ['curtain'] : first(S, 'fate') ? ['fate', first(S, 'fate')] : ['attack', R.living(S)[0]]),
  'only attacks': S => ['attack', R.living(S)[0]],
  'picks at random': S => { const all = Object.keys(R.CMD).filter(id => ok(S, id)), id = all[Math.floor(S.rng() * all.length)], ts = R.living(S).filter(f => ok(S, id, f)); return [id, ts[Math.floor(S.rng() * ts.length)]]; },
};

export function fight(player, seed, level = 1) {
  const S = R.newBattle(level, rng(seed)); let guard = 0;
  const run = ev => { for (const e of ev) if (e.k === 'due') R.landDoom(S, S.foes[e.i]); };
  while (!S.over && guard++ < 600) {
    let who = R.tick(S, 0); if (!who) who = R.tick(S, R.timeToNext(S) + 1e-9);
    if (who === 'hero') { R.beginHeroTurn(S); const [id, f] = player(S); for (const step of R.heroSteps(S, id, f)) { run(step()); if (S.over) break; } R.endHeroTurn(S); }
    else if (who) { const id = R.pickFoeMove(S, who); for (const step of R.foeSteps(S, who, id)) { step(); if (S.over) break; } if (!S.over) run(R.endFoeTurn(S, who)); }
  }
  return S;
}
export function rate(player, n, level = 1) {
  let won = 0, turns = 0, hpLeft = 0;
  for (let i = 0; i < n; i++) { const S = fight(player, 1000 + i * 7919, level); if (S.over === 'won') { won++; hpLeft += S.hero.hp / S.hero.maxHp; } turns += S.turns; }
  return { win: won / n, turns: turns / n, hpLeft: won ? hpLeft / won : 0 };
}

if (process.argv[1] && process.argv[1].endsWith('sim_battle.mjs')) {
  const N = +(process.argv[2] || 4000), LEVEL = +(process.argv[3] || 1), S = R.newBattle(LEVEL);
  console.log(`${N} fights each: Jester level ${S.level}, ${S.hero.maxHp} HP; ${S.foes.length} x ${R.FOE.name} level ${S.foeLevel}, ${S.foes[0].maxHp} HP`);
  for (const [name, player] of Object.entries(PLAYERS)) {
    const r = rate(player, N, LEVEL);
    console.log(`  ${name.padEnd(20)} wins ${(100 * r.win).toFixed(0).padStart(3)}%   ${r.turns.toFixed(1)} of her turns${r.win ? '   HP left when she wins ' + (100 * r.hpLeft).toFixed(0) + '%' : ''}`);
  }
}
