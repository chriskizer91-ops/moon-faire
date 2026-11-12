// Plays the turn-based fight thousands of times with a few kinds of player, to check that choices matter.
// It uses the page's own rules (viewer/rules.js), so what it measures is what Chris plays.
// usage: node tools/sim_battle.mjs [fights] [level]
import * as R from '../viewer/rules.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

const ok = (S, id) => !R.why(S, id);
export const PLAYERS = {
  // plans: marks it with Doom at once, then stays alive while the bell counts: Hush so it can only swing its scythe,
  // Defend, a heal if she is low; and Curtain Call the moment it is ready, because that lands the Doom at once
  'plays well': S => {
    const h = S.hero, f = S.foe;
    if (ok(S, 'curtain')) return 'curtain';
    if (ok(S, 'fate')) return 'fate';
    if (h.hp <= 0.4 * h.maxHp && ok(S, 'odds')) return 'odds';
    if (f.doom > 0) return ok(S, 'hush') ? 'hush' : 'defend';
    return 'attack';
  },
  // knows Doom ends it, but does nothing to stay alive while it counts
  'dooms, then attacks': S => (ok(S, 'curtain') ? 'curtain' : ok(S, 'fate') ? 'fate' : 'attack'),
  // heals and attacks, never plans
  'heals and hits': S => (S.hero.hp <= 0.4 * S.hero.maxHp && ok(S, 'odds') ? 'odds' : ok(S, 'curtain') ? 'curtain' : 'attack'),
  'only attacks': () => 'attack',
  'picks at random': S => { const all = Object.keys(R.CMD).filter(id => ok(S, id)); return all[Math.floor(S.rng() * all.length)]; },
  'spends MP badly': S => (ok(S, 'hush') ? 'hush' : ok(S, 'gravity') && S.foe.hp < 0.5 * S.foe.maxHp ? 'gravity' : ok(S, 'odds') && S.hero.hp > 0.8 * S.hero.maxHp ? 'odds' : 'attack'),
};

export function fight(player, seed, level = 1) {
  const S = R.newBattle(level, rng(seed)); let guard = 0;
  while (!S.over && guard++ < 400) {
    let who = R.tick(S, 0); if (!who) who = R.tick(S, R.timeToNext(S) + 1e-9);
    if (who === 'hero') { R.beginHeroTurn(S); const id = player(S); for (const step of R.heroSteps(S, id)) { step(); if (S.over) break; } R.endHeroTurn(S); }
    else if (who === 'foe') { const id = R.pickFoeMove(S); for (const step of R.foeSteps(S, id)) { step(); if (S.over) break; } R.endFoeTurn(S); }
  }
  return S;
}
export function rate(player, n, level = 1) {
  let won = 0, turns = 0, hpLeft = 0, foeLeft = 0;
  for (let i = 0; i < n; i++) { const S = fight(player, 1000 + i * 7919, level); if (S.over === 'won') { won++; hpLeft += S.hero.hp / S.hero.maxHp; } else foeLeft += S.foe.hp / S.foe.maxHp; turns += S.turns; }
  return { win: won / n, turns: turns / n, hpLeft: won ? hpLeft / won : 0, foeLeft: won < n ? foeLeft / (n - won) : 0 };
}

if (process.argv[1] && process.argv[1].endsWith('sim_battle.mjs')) {
  const N = +(process.argv[2] || 4000), LEVEL = +(process.argv[3] || 1);
  { const S = R.newBattle(LEVEL); console.log(`${N} fights each: Jester level ${S.level}, ${S.hero.maxHp} HP; ${R.FOE.name} level ${S.foeLevel}, ${S.foe.maxHp} HP`); }
  for (const [name, player] of Object.entries(PLAYERS)) {
    const r = rate(player, N, LEVEL);
    console.log(`  ${name.padEnd(20)} wins ${(100 * r.win).toFixed(0).padStart(3)}%   ${r.turns.toFixed(1)} of her turns   ${r.win ? 'HP left when she wins ' + (100 * r.hpLeft).toFixed(0) + '%' : ''}${r.win < 1 ? '   wraith HP left when she loses ' + (100 * r.foeLeft).toFixed(0) + '%' : ''}`);
  }
}
