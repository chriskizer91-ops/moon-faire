// Levelling for the bigger game (task board F4): the options, as data.
// Every number here is a suggestion for Chris. Nothing in the approved combat engine is touched.
//
// What stays as it was in ../sim/plan.js:
//   XP for a level-1 foe: wisp 10, Shadow Wraith 40, great wraith 400, growing 20% a foe level.
//   The three set fights at the fair, which take the party to level 2.
//   The party shares XP and levels together. Losing costs nothing.
// What is new: more levels, more fights, and the land beyond the fair in rings, each ring with its own foe levels
// and a gate fight at its end. Which land each ring is, and what its gate fight is in the story, are not decided here.

const xp = { w: 10, K: 40, B: 400, slope: 1.2 };

// The fair: three set fights, as in the starter plan.
const fair = [{ id: 'T1', code: '2w', level: 1 }, { id: 'T2', code: '3w', level: 1 }, { id: 'T3', code: '3w', level: 2 }];

// What the party meets, by how far through the game the ring is (0 = the first ring, 1 = the last).
// Each entry is [line-up, how often]. "full" is the usual mix; "quick" leans on small packs.
const tables = {
  full: [
    [['2w', 2], ['3w', 4], ['4w', 2]],
    [['3w', 3], ['4w', 2], ['K', 1], ['K2w', 2]],
    [['4w', 2], ['5w', 1], ['K2w', 3], ['2K', 1], ['K4w', 1]],
    [['5w', 2], ['K2w', 2], ['K4w', 2], ['2K2w', 2]],
    [['6w', 2], ['K4w', 2], ['2K2w', 2], ['3K', 1], ['2K4w', 1]],
  ],
  quick: [
    [['2w', 4], ['3w', 4]],
    [['2w', 2], ['3w', 4], ['4w', 1], ['K', 1]],
    [['3w', 4], ['4w', 2], ['K', 1], ['K2w', 1]],
    [['3w', 3], ['4w', 2], ['5w', 1], ['K', 1], ['K2w', 1]],
    [['3w', 2], ['4w', 2], ['5w', 2], ['K2w', 1], ['2K', 1]],
  ],
};

// Gate fights, in order from the first ring outward, by how many rings the game has. The last is always the big boss.
// 4w, K2w and 2K2w are the starter plan's own set fights (S1, S2, S3). The lone great wraiths are stand-ins.
const gates = {
  4: ['K2w', '2K2w', 'B', 'B2K2w'],
  6: ['4w', 'K2w', '2K2w', 'B', 'BK2w', 'B2K2w'],
  8: ['4w', 'K2w', '2K2w', 'B', '2K4w', 'B3w', 'BK2w', 'B2K2w'],
};

// name, top level, wins aimed for, rings beyond the fair (each three levels wide), fights a level at the start and end
const options = {
  A: { name: 'A', title: 'Fourteen levels, about 120 fights', top: 14, fights: 120, rings: 4, first: 5.5, last: 15 },
  B: { name: 'B', title: 'Twenty levels, about 180 fights', top: 20, fights: 180, rings: 6, first: 5, last: 15 },
  C: { name: 'C', title: 'Twenty-six levels, about 240 fights', top: 26, fights: 240, rings: 8, first: 5, last: 15 },
};

const nice = x => { const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1)); return Math.round(x / m) * m; };   // two figures
const parse = code => { const f = []; code.replace(/(\d*)([wKB])/g, (_, n, k) => { for (let i = 0; i < (+n || 1); i++) f.push(k); }); return f; };
const xpOf = (code, foeLevel) => Math.round(parse(code).reduce((s, k) => s + xp[k], 0) * Math.pow(xp.slope, foeLevel - 1));

// Build one option into a full plan: rings, tables, gates, and the XP to reach each level.
function build(key, mix = 'full', tweak = {}) {
  const o = Object.assign({}, options[key], tweak);
  const width = (o.top - 2) / o.rings;
  if (width !== Math.floor(width)) throw new Error('rings must divide the levels evenly');
  const rings = [];
  for (let i = 0; i < o.rings; i++) {
    const enter = 2 + i * width, leave = enter + width;
    const t = o.rings === 1 ? 0 : i / (o.rings - 1);
    const tier = Math.min(4, Math.round(t * 4));
    const gate = gates[o.rings][i];
    rings.push({ n: i + 1, enter, leave, foeLevels: [enter, leave + 1], table: tables[mix][tier], tier: tier + 1, gate: { code: gate, level: leave } });
  }
  // fights aimed for at each level: a straight line from "first" to "last", scaled so the whole game comes to o.fights
  const ups = o.top - 2;                                   // level-ups earned beyond the fair
  const raw = []; for (let i = 0; i < ups; i++) raw.push(o.first + (o.last - o.first) * (ups === 1 ? 0 : i / (ups - 1)));
  const want = (o.fights - fair.length - o.rings) * (o.cal || 1);   // the walking fights (the gates are fights too); cal is run.js's fine tuning
  const k = want / raw.reduce((a, b) => a + b, 0);
  const perLevel = {}; raw.forEach((r, i) => perLevel[2 + i] = r * k);
  // what a walking fight is worth on average, for a party of level L in its ring
  const ringOf = L => rings.find(r => L >= r.enter && L < r.leave) || rings[rings.length - 1];
  const meanXp = L => {
    const r = ringOf(Math.min(L, o.top - 1)); let s = 0, w = 0;
    for (const [code, n] of r.table) for (let f = r.foeLevels[0]; f <= r.foeLevels[1]; f++) { s += n * xpOf(code, f); w += n; }
    return s / w;
  };
  // XP to reach each level. Level 2 keeps the starter plan's 80.
  // A gate fight is worth a lot (a great wraith is worth 40 wisps), so the level after a gate asks for that much more:
  // the gate fills a good piece of the bar at once, and the walking fights still come to the number aimed for.
  const toReach = { 1: 0, 2: 80 }; const step = {};
  for (let L = 2; L < o.top; L++) {
    const g = rings.find(r => r.leave === L);
    step[L] = nice(perLevel[L] * meanXp(L) + (g ? xpOf(g.gate.code, g.gate.level) : 0)); toReach[L + 1] = toReach[L] + step[L];
  }
  // past the top level the same curve carries on, for a party that fights more than it must
  for (let L = o.top; L < o.top + 8; L++) { step[L] = nice(step[L - 1] * xp.slope * 1.03); toReach[L + 1] = toReach[L] + step[L]; }
  return { key, mix, o, rings, perLevel, toReach, step, fair, xp };
}

module.exports = { xp, fair, tables, options, build, xpOf, parse, gates };
