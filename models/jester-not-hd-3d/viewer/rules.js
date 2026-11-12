// The rules of the turn-based fight, with nothing about pictures or sound in them, so the page and the balance
// simulator (tools/sim_battle.mjs) play exactly the same game.
//
// The shape is Envoi's first fight (envoi-on-the-longest-night, reference/demos/night-square-shadow-wraith.html and
// docs/design-decisions.md): each side has a turn gauge, time stands still while anyone acts or chooses, there are no
// dice, every amount is set and swings up to 25% either way, taking hits fills a Trance gauge, and everything grows
// 20% a level. The Shadow Wraith's numbers are Envoi's level 1 table as they stand.
// The Jester's moves are hers from assets/design/moves_v03.json.
//
// Chris, November 11: the Jester is the most powerful of the four, overwhelmingly so: her power ends fights.
// So Doom does not wound an ordinary foe, it releases it, and Curtain Call lands every Doom at once. What holds her
// back is that she is the frailest of the four, Doom takes three of the foe's turns, and her MP does not come back.
// To make that a fight, the wraith she meets alone is two levels above her: one the others would not face alone.

export const GROW = 1.2, SWING = 0.25, TOP_LEVEL = 20;

export const HERO = {
  name: 'Jester',
  hp: 1000,          // 850 on her move sheet; raised a little to stand beside Envoi's numbers, and tuned with the simulator
  mp: 100,           // as on the move sheet
  turn: 2.4,         // seconds for her turn gauge to fill (Io's)
  start: 0.6,        // how full her gauge starts
};
export const FOE = { name: 'Shadow Wraith', hp: 4200, turn: 3.2, start: 0.15, eclipseAt: 0.35, ahead: 4, boss: false };     // ahead: how many levels above her it is

// Her commands. 'clip' is the move she plays. Amounts are level 1.
export const CMD = {
  attack:  { label: 'Attack', name: 'Gilded Rebuke', clip: 'GildedRebuke', mp: 0, amount: 220, help: 'Her bell chain. Free.' },
  fate:    { label: 'Sealed Fate', clip: 'SealedFate', mp: 18, amount: 1040, turns: 3, help: 'Doom: ends it after its 3rd turn' },     // amount is only for a boss, which Doom wounds instead of releasing
  hush:    { label: 'Hush', clip: 'Hush', mp: 12, turns: 2, push: 0.4, help: 'It cannot cast for 2 turns' },
  gravity: { label: 'Gravity', clip: 'Gravity', mp: 24, part: 0.25, cap: 0, push: 0.3, help: 'A quarter of the HP it has left' },
  odds:    { label: 'Against All Odds', clip: 'AgainstAllOdds', mp: 26, heal: 0.2, low: 0.4, haste: 2, hasteK: 1.5, help: 'Heal and haste. Double when low' },
  defend:  { label: 'Defend', mp: 0, cut: 0.5, help: 'Halves hits until her next turn' },
  curtain: { label: 'Curtain Call', clip: 'CurtainCall', mp: 0, trance: true, amounts: [1040, 1040, 1040], ward: 250, help: 'Doom lands now. If none, three great blows' },
};
export const MAGIC = ['fate', 'hush', 'gravity', 'odds'];

// The wraith's moves: Envoi's, with Envoi's numbers. 'spell' ones are what Hush stops.
export const FOE_MOVES = {
  sweep:   { label: 'Soul Reaper', hits: [190], weight: 0.4 },
  bolts:   { label: 'Soul Bolts', hits: [70, 70, 70], weight: 0.35, spell: true },
  grasp:   { label: 'Shadow Grasp', hits: [250], weight: 0.25, spell: true },
  eclipse: { label: 'Eclipse', hits: [480], spell: true },      // once, when it is below 35% HP
};
const TRANCE_PER_HIT = 0.02, TRANCE_PER_HP = 1.9;                 // a little for each blow she lands, most from what she takes (Envoi's is 1.35: hers fills sooner)

export function newBattle(level = 1, rng = Math.random) {
  level = Math.max(1, Math.min(TOP_LEVEL, Math.round(level)));
  const foeLevel = Math.min(TOP_LEVEL, level + FOE.ahead);
  const k = GROW ** (level - 1), fk = GROW ** (foeLevel - 1), hp = Math.round(HERO.hp * k), fhp = Math.round(FOE.hp * fk);
  return {
    level, foeLevel, k, fk, rng, over: null, dealt: 0, taken: 0, turns: 0,
    hero: { hp, maxHp: hp, mp: HERO.mp, maxMp: HERO.mp, atb: HERO.start, trance: 0, defending: false, haste: 0, ward: 0 },
    foe: { hp: fhp, maxHp: fhp, atb: FOE.start, usedEclipse: false, last: [], doom: 0, silence: 0 },
  };
}
const amount = (S, base, k = S.k) => Math.round(base * k * (1 + (S.rng() * 2 - 1) * SWING));
const fixed = (S, base) => Math.round(base * S.k);

// ---- what happens to each side. Each returns a list of events for the page to show.
function hitFoe(S, n, o = {}) {
  const f = S.foe; if (f.hp <= 0) return [];
  n = Math.min(Math.max(0, Math.round(n)), o.spare ? f.hp - 1 : f.hp);
  f.hp -= n; S.dealt += n;
  if (S.hero.trance < 1 && !o.quiet) S.hero.trance = Math.min(1, S.hero.trance + TRANCE_PER_HIT);
  const ev = [{ k: 'dmg', to: 'foe', n, big: !!o.big, tag: o.tag }];
  if (f.hp <= 0) { S.over = 'won'; ev.push({ k: 'down', who: 'foe' }); }
  return ev;
}
function hitHero(S, base) {
  const h = S.hero; if (h.hp <= 0) return [];
  let n = amount(S, base, S.fk); const ev = [];
  if (h.defending) n = Math.round(n * CMD.defend.cut);
  if (h.ward > 0) { const w = Math.min(h.ward, n); h.ward -= w; n -= w; ev.push({ k: 'ward', n: w, left: h.ward }); }
  if (n > 0) {
    n = Math.min(n, h.hp); h.hp -= n; S.taken += n;
    h.trance = Math.min(1, h.trance + n / h.maxHp * TRANCE_PER_HP);
    ev.push({ k: 'dmg', to: 'hero', n, blocked: h.defending });
    if (h.hp <= 0) { S.over = 'lost'; ev.push({ k: 'down', who: 'hero' }); }
  }
  return ev;
}

// Doom releases an ordinary foe outright. A boss is only wounded by it.
const doomAmount = S => (FOE.boss ? amount(S, CMD.fate.amount) : S.foe.hp);

// ---- the turn gauges. Call with the time that passed while nobody was acting. Returns who may act: she goes first on a tie.
export function tick(S, dt) {
  if (S.over) return null;
  const h = S.hero, f = S.foe;
  h.atb = Math.min(1, h.atb + dt / HERO.turn * (h.haste > 0 ? CMD.odds.hasteK : 1));
  f.atb = Math.min(1, f.atb + dt / FOE.turn);
  return h.atb >= 1 ? 'hero' : f.atb >= 1 ? 'foe' : null;
}
export function timeToNext(S) {                                    // for the simulator: jump straight to the next turn
  const h = S.hero, f = S.foe;
  return Math.max(0, Math.min((1 - h.atb) * HERO.turn / (h.haste > 0 ? CMD.odds.hasteK : 1), (1 - f.atb) * FOE.turn));
}

// ---- her turn
export function why(S, id) {                                       // '' if she can do it now, or the reason she cannot
  const c = CMD[id], h = S.hero, f = S.foe;
  if (!c) return 'no such command';
  if (c.trance) return h.trance >= 1 ? '' : 'Trance not full';
  if (h.mp < c.mp) return 'not enough MP';
  if (id === 'fate' && f.doom > 0) return 'already marked';
  if (id === 'gravity' && f.hp <= 1) return 'nothing left to take';
  if (id === 'hush' && f.silence > 0) return 'already silenced';
  return '';
}
export function beginHeroTurn(S) { S.hero.defending = false; S.turns++; }
// The steps of a command, in order. The page runs each at the moment it lands; the simulator runs them straight through.
export function heroSteps(S, id) {
  const c = CMD[id], h = S.hero, f = S.foe;
  h.mp -= c.mp;
  switch (id) {
    case 'attack': return [() => hitFoe(S, amount(S, c.amount))];
    case 'fate': return [() => { f.doom = c.turns; return [{ k: 'mark', what: 'doom', n: c.turns }]; }];
    case 'hush': return [() => { f.silence = c.turns; f.atb = Math.max(0, f.atb - c.push); return [{ k: 'mark', what: 'silence', n: c.turns }]; }];
    case 'gravity': return [() => { f.atb = Math.max(0, f.atb - c.push); return hitFoe(S, Math.min(c.part * f.hp, c.cap ? fixed(S, c.cap) : Infinity), { big: true, spare: true, tag: 'gravity' }); }];
    case 'odds': return [() => {
      const low = h.hp <= c.low * h.maxHp, n = Math.min(h.maxHp - h.hp, Math.round((low ? 2 : 1) * c.heal * h.maxHp * (1 + (S.rng() * 2 - 1) * SWING)));
      h.hp += n; h.haste = c.haste + 1;                              // + 1 because this turn's end takes one off
      return [{ k: 'heal', n, low }, { k: 'mark', what: 'haste', n: c.haste }];
    }];
    case 'defend': return [() => { h.defending = true; return [{ k: 'mark', what: 'defend' }]; }];
    case 'curtain': return [
      () => { h.trance = 0; if (f.doom > 0) { f.doom = 0; return [{ k: 'doom' }, ...hitFoe(S, doomAmount(S), { big: true, tag: 'doom', quiet: true })]; } return []; },
      ...c.amounts.map(a => () => hitFoe(S, amount(S, a), { big: true, quiet: true })),
      () => { h.ward = fixed(S, c.ward); return [{ k: 'mark', what: 'ward', n: h.ward }]; },
    ];
  }
  return [];
}
export function endHeroTurn(S) { const h = S.hero; h.atb = 0; if (h.haste > 0) h.haste--; }

// ---- the wraith's turn
export function pickFoeMove(S) {
  const f = S.foe;
  if (!f.usedEclipse && f.hp < f.maxHp * FOE.eclipseAt && f.silence <= 0) { f.usedEclipse = true; return 'eclipse'; }
  if (f.silence > 0) return 'sweep';
  const l = f.last, opts = ['sweep', 'bolts', 'grasp'].filter(m => !(l[0] === m && l[1] === m));
  let r = S.rng() * opts.reduce((s, m) => s + FOE_MOVES[m].weight, 0), pick = opts[0];
  for (const m of opts) { r -= FOE_MOVES[m].weight; if (r <= 0) { pick = m; break; } }
  f.last = [pick, l[0]]; return pick;
}
export function foeSteps(S, id) { return FOE_MOVES[id].hits.map(a => () => hitHero(S, a)); }
// After its move: silence wears off a turn, and Doom counts down and strikes.
export function endFoeTurn(S) {
  const f = S.foe, ev = []; f.atb = 0;
  if (f.silence > 0) { f.silence--; if (f.silence === 0) ev.push({ k: 'unmark', what: 'silence' }); }
  if (f.doom > 0 && !S.over) {
    f.doom--;
    if (f.doom > 0) ev.push({ k: 'count', n: f.doom });
    else ev.push({ k: 'doom' }, ...hitFoe(S, doomAmount(S), { big: true, tag: 'doom' }));
  }
  return ev;
}
