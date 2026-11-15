// The eight pretend players (task board F10; Chris, November 15, 2026).
// Five levels of attentiveness: very careless, careless, attentive, focused, expert.
// The top three each come in two play styles, "careful" and "bold". Chris is less sure about the styles: a proposal.
//
// The approved engine is not changed. Three of the eight ARE the engine's own three players, move for move:
//   careless = the engine's careless;  attentive, careful = the engine's attentive;  expert, careful = the engine's expert.
// So every number measured before today still means what it meant. check.js proves the match fight by fight.
// The other five are new: "very careless" presses any lit button, and the rest are the same thinking with other habits.
const E = require('../sim/blob-battle-engine.js');
const pct = u => u.hp / u.max;
const heroes = B => B.fighters.filter(u => u.side === 'hero');
const jesterOf = B => B.fighters.find(u => u.id === 'jester');
function markedSingles(B, reach) {            // as in the engine: the Heavy and Crush blows showing on the turn bar
  const out = [];
  for (const e of E.bar(B).slice(0, reach || B.R.bar)) if (e.u.side === 'foe' && (e.move === 'crush' || e.move === 'heavy') && !e.u.cloth && e.u.conf === 0 && !out.some(x => x.u === e.u)) out.push(e);
  return out;
}
function focus(B) {                            // as in the engine: wisps first, then Shadow Wraiths, then the boss nearest its seal
  const o = { normal: 0, difficult: 1, boss: 2 };
  return E.foesUp(B).reduce((a, e) => {
    const ka = [o[a.tier], a.tier === 'boss' ? a.hp - a.fate : a.hp], ke = [o[e.tier], e.tier === 'boss' ? e.hp - e.fate : e.hp];
    return (ke[0] < ka[0] || (ke[0] === ka[0] && ke[1] < ka[1])) ? e : a;
  });
}

// What each thinking tester knows and how she likes to play. One line a habit.
const base = {
  foxLook: 3,          // how many turns of the bar the Fox reads for a Heavy or Crush to turn back (null = all of it)
  catchIt: false,      // lets the Jester take a boss's Crush on purpose when she can afford it, for the Fate
  decoy: false, decoyLow: 0.3, decoyMarked: 0.5,   // calls the Fox's ghost when the Jester is this low (or this low with a marked blow coming)
  quilt2: false,       // quilts two small foes when four or more foes stand
  reserve: 50,         // MP Io keeps back for healing before she will spend on Thorn or her Deity
  deityFoes: 3,        // how many foes it takes for Io to call her Deity
  jesterMend: false, jmMargin: 300, jmMissing: 200, // Io tops the Jester up before a marked blow she could not survive
  mendAt: 0.5,         // Io mends a friend under this share of HP
  bloomN: 2, bloomEclipse: false,                   // Bloom when this many are under 70%, or when an Eclipse shows and one is
  sealHold: false,     // holds a seal on a small foe so the Jester can catch a boss's marked blow first
  jHealAt: 0.5,        // the Jester heals herself under this share of HP
};
const K = {
  'attentive, careful': Object.assign({}, base),
  'attentive, bold': Object.assign({}, base, { mendAt: 0.35, jHealAt: 0.35, reserve: 20, bloomN: 3, deityFoes: 2 }),
  // focused reads three turns, as the attentive player does, but uses every tool. Measured on the last fight a level up,
  // this sits between attentive and expert; reading the whole bar as well made her as good as the expert there.
  'focused, careful': Object.assign({}, base, { decoy: true, quilt2: true, reserve: 45, bloomEclipse: true }),
  'focused, bold': Object.assign({}, base, { decoy: true, decoyLow: 0.2, decoyMarked: 0.35, quilt2: true, reserve: 15, bloomEclipse: true, mendAt: 0.35, jHealAt: 0.35, bloomN: 3, deityFoes: 2 }),
  'expert, careful': Object.assign({}, base, { foxLook: null, catchIt: true, decoy: true, quilt2: true, reserve: 40, jesterMend: true, mendAt: 0.45, bloomEclipse: true, sealHold: true, jHealAt: 0.55 }),
  'expert, bold': Object.assign({}, base, { foxLook: null, catchIt: true, decoy: true, decoyLow: 0.2, decoyMarked: 0.35, quilt2: true, reserve: 10, jesterMend: true, jmMargin: 150, mendAt: 0.32, bloomEclipse: true, bloomN: 3, sealHold: true, jHealAt: 0.4, deityFoes: 2 }),
};
const names = ['very careless', 'careless', 'attentive, careful', 'attentive, bold', 'focused, careful', 'focused, bold', 'expert, careful', 'expert, bold'];
const engineOwn = { 'careless': 'careless', 'attentive, careful': 'attentive', 'expert, careful': 'expert' };
const about = {
  'very careless': 'Presses any button that is lit, at any foe or friend. No plan at all. Never runs away.',
  'careless': 'Mostly hits things. Seals a foe when the game offers it, revives a fallen friend, sometimes heals. The same careless player as before.',
  'attentive, careful': 'Reads the next three turns. Turns a Heavy or Crush back with the Fox, mends anyone under half, keeps MP back for healing. The same attentive player as before.',
  'attentive, bold': 'The same reading, but she heals late (under about a third), spends her MP on hitting, and calls Io\'s Deity against two foes.',
  'focused, careful': 'Reads the next three turns, and uses every tool: calls the Fox\'s ghost when the Jester is low, quilts small foes in a crowd, and lays Bloom down when an Eclipse is coming.',
  'focused, bold': 'The same tools, but she heals late and spends freely on hitting.',
  'expert, careful': 'Reads the whole turn bar, uses every tool, and knows the fine points: lets the Jester take a Crush on purpose for the Fate, holds a seal for the right moment, tops the Jester up before a blow she could not survive. The same expert as before.',
  'expert, bold': 'The same fine points with thinner margins: heals later, keeps almost no MP back, and goes for the kill.',
};

function think(B, u, k) {
  const R = B.R, a = E.foesUp(B), J = jesterOf(B);
  const mv = (id, t) => ({ move: id, target: t ? (Array.isArray(t) ? t.map(x => x.id) : t.id) : null });
  if (u.id === 'ranger') { if (B.gem === 0) { const t = focus(B); return mv('r_gem', [t, t]); } return mv('r_plain', focus(B)); }
  if (u.id === 'fox') {
    const ms = markedSingles(B, k.foxLook);
    const small = a.filter(e => e.tier !== 'boss' && e.conf === 0);
    const can = { cloth: ms.length > 0 && !B.clothBlocked && u.mp >= R.f.clothMp, quilt: small.length > 0 && !B.quiltBlocked && u.mp >= R.f.quiltMp,
      decoy: B.decoy === 0 && u.mp >= R.f.decoyMp, needles: u.mp >= R.f.needlesMp, stitch: u.mp >= R.f.stitchMp };
    const big = () => ms.reduce((x, y) => (y.u.max > x.u.max ? y : x)).u;
    if (can.cloth) {
      const e = big();
      const catchIt = k.catchIt && J && J.hp > 0 && e.tier === 'boss' && J.hp > e.d.crush * B.kd * 1.25 + 300;
      if (!catchIt) return mv('f_cloth', e);
    }
    if (k.decoy && J && J.hp > 0 && can.decoy && (pct(J) < k.decoyLow || (ms.length && pct(J) < k.decoyMarked))) return mv('f_decoy');
    if (can.quilt && small.length >= 3) return mv('f_quilt');
    if (k.quilt2 && can.quilt && small.length >= 2 && a.length >= 4) return mv('f_quilt');
    if (a.length >= 3 && can.needles) return mv('f_needles');
    if (can.stitch) return mv('f_stitch', focus(B));
    return mv('f_plain', focus(B));
  }
  if (u.id === 'io') {
    const down = heroes(B).filter(h => h.hp <= 0), hs = E.heroesUp(B);
    const low = hs.reduce((x, y) => (pct(y) < pct(x) ? y : x)), nlow = hs.filter(h => pct(h) < 0.7).length;
    const atk = () => {
      if (!B.deityUsed && !B.deityPending && a.length >= k.deityFoes && u.mp >= R.i.deityMp + k.reserve) return mv('i_deity');
      if (u.mp >= R.i.thornMp + k.reserve) return mv('i_thorn', focus(B));
      return mv('i_plain', focus(B));
    };
    if (down.length && u.mp >= R.i.reviveMp) return mv('i_revive', down.find(h => h === J) || down[0]);
    if (u.mp >= R.i.mendMp) {
      if (k.jesterMend && J && J.hp > 0) {
        const ms = markedSingles(B);
        const need = k.jmMargin + (ms.length ? Math.max(...ms.map(x => (x.u.d.crush || x.u.d.heavy || 0))) * B.kd * 1.25 : 0);
        if (J.hp < need && J.max - J.hp >= k.jmMissing) return mv('i_mend', J);
      }
      if (pct(low) < k.mendAt) return mv('i_mend', low);
    }
    const eclipseShowing = E.bar(B).some(x => x.move === 'eclipse');
    if (B.bloom === 0 && u.mp >= R.i.bloomMp && (nlow >= k.bloomN || (k.bloomEclipse && eclipseShowing && nlow >= 1))) return mv('i_bloom');
    return atk();
  }
  // the Jester
  const sl0 = a.filter(E.sealed);
  const ends = sl0.filter(e => a.every(o => o === e || o.hp <= R.fate.splash * e.max));
  const sl = sl0.filter(e => e.tier !== 'normal').length ? sl0.filter(e => e.tier !== 'normal') : ends;
  const biggest = arr => arr.reduce((x, y) => (y.max > x.max ? y : x));
  if (ends.length) return mv('j_seal', biggest(ends));
  if (sl.length) {
    const e = biggest(sl);
    const hold = k.sealHold && e.tier !== 'boss' && pct(u) > 0.4 && markedSingles(B).some(x => x.u.tier === 'boss' && x.at < B.now + u.delay);
    if (!hold) return mv('j_seal', e);
  }
  if (pct(u) < k.jHealAt && u.mp >= R.j.healMp) return mv('j_heal');
  return mv('j_jab', focus(B));
}

// Very careless: any lit button but Slip Stitch, at anyone it can be aimed at.
function mash(B, u) {
  const rc = arr => arr[Math.floor(B.rng() * arr.length)];
  const lit = E.heroMoves(B, u).filter(m => m.ok && m.id !== 'f_flee');
  for (let tries = 0; tries < 20; tries++) {
    const m = rc(lit), ts = E.targetsFor(B, u, m.id);
    if (m.target === 'none' || !m.target) return { move: m.id, target: null };
    if (!ts.length) continue;
    if (m.target === 'foe2') return { move: m.id, target: [rc(ts).id, rc(ts).id] };
    return { move: m.id, target: rc(ts).id };
  }
  const f = E.foesUp(B); return { move: u.id[0] + '_plain', target: rc(f).id };
}

// useEngine: the three engine-own testers go through the engine's own code (the default). check.js turns it off to prove the copy.
function choose(B, u, tester, useEngine = true) {
  if (tester === 'very careless') return mash(B, u);
  if (useEngine && engineOwn[tester]) return E.choose(B, u, engineOwn[tester]);
  if (tester === 'careless') return E.choose(B, u, 'careless');
  return think(B, u, K[tester]);
}
function playOut(code, opts = {}) {
  const B = E.newBattle(code, opts);
  B.quiet = true;
  for (let i = 0; i < 4000 && !B.over; i++) {
    const r = E.step(B);
    if (r.hero) {
      E.heroTurnStart(B, r.hero);
      if (B.over) break;
      const c = choose(B, r.hero, opts.tester || 'attentive, careful', opts.useEngine !== false);
      E.doHero(B, r.hero, c.move, c.target);
    }
    B.log.length = 0; B.events.length = 0;
  }
  return B;
}
module.exports = { E, names, about, K, base, engineOwn, choose, playOut, think, mash };
