// The levelling plan after Chris's words of November 15, 2026 (1:06 pm). It replaces plan-chosen.json's rings and gates:
//   "When exploring and running around, you can run into one level below to two levels above in the broad open area."
//   "There should be a gate around level 10, that is the final great wraith fight. Then there's a gate at level 20 that
//    is the great bramble fight. And then the final boss after that."
// Still his earlier choices: 20 levels, about 180 fights to finish, level 20 the top; wraiths for levels 1 to 10 and
// Envoi's two bramble foes with wraiths mixed in for 11 to 20; the last fight at level 20, 21, 22 or 22.8.
//   node plan2.js            writes plan-v2.json and plan-v2.js (window.MF_LEVELS)
const fs = require('fs');
const { xp, fair, tables, xpOf } = require('./options.js');
const TOP = 20, FIGHTS = 180, WALK = { below: 1, above: 2 };
// Six bands of land, by the party's level. A band says what line-ups are met, and is where finds and rest spots are counted.
// Bands 1 to 3 are wraith country and 4 to 6 bramble country. Until the bramble foes have fight numbers, 4 to 6 use
// wraith-family line-ups as stand-ins.
const bands = [
  { band: 1, from: 2, to: 5, tier: 1, country: 'wraith' }, { band: 2, from: 5, to: 8, tier: 2, country: 'wraith' }, { band: 3, from: 8, to: 10, tier: 3, country: 'wraith' },
  { band: 4, from: 10, to: 14, tier: 3, country: 'bramble' }, { band: 5, from: 14, to: 17, tier: 4, country: 'bramble' }, { band: 6, from: 17, to: 20, tier: 5, country: 'bramble' },
];
const gates = [
  { id: 'great-wraith', name: 'The final great wraith fight', opensAtLevel: 10, foes: 'B2K2w', foeLevel: 10, note: 'The first plan\'s own last fight: the great wraith, two Shadow Wraiths and two wisps.' },
  { id: 'great-bramble', name: 'The great bramble fight', opensAtLevel: 20, foes: 'B2K2w', foeLevel: 20, note: 'A stand-in line-up with the great wraith\'s numbers until the bramble foes have their own.' },
];
const lastFight = { note: 'The final boss, after the great bramble. The game offers four settings. Today\'s B2K2w stands in for it.', easy: 20, medium: 21, hard: 22, crazy: 22.8 };
const nice = x => { const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1)); return Math.round(x / m) * m; };
function build(cal = 1) {
  const bandOf = L => bands.find(b => L >= b.from && L < b.to) || bands[bands.length - 1];
  const ups = TOP - 2, raw = []; for (let i = 0; i < ups; i++) raw.push(5 + (15 - 5) * i / (ups - 1));
  const k = (FIGHTS - fair.length - gates.length) * cal / raw.reduce((a, b) => a + b, 0);
  const meanXp = L => { const t = tables.full[bandOf(L).tier - 1]; let s = 0, w = 0; for (const [code, n] of t) for (let g = -WALK.below; g <= WALK.above; g++) { s += n * xpOf(code, Math.max(1, L + g)); w += n; } return s / w; };
  const toReach = { 1: 0, 2: 80 }, step = {};
  for (let L = 2; L < TOP; L++) { const g = gates.find(x => x.opensAtLevel === L); step[L] = nice(raw[L - 2] * k * meanXp(L) + (g ? xpOf(g.foes, g.foeLevel) : 0)); toReach[L + 1] = toReach[L] + step[L]; }
  return { TOP, FIGHTS, WALK, bands: bands.map(b => Object.assign({}, b, { meets: tables.full[b.tier - 1].map(t => ({ foes: t[0], weight: t[1] })) })), gates, lastFight, toReach, fair, xp, cal };
}
function write(P) {
  const plan = {
    what: 'Moon Faire: levels, XP, what is met where, the two gates and the last fight. Made by game/plan/levelling/plan2.js; do not edit by hand. It replaces plan-chosen.json.',
    chosen: 'Chris: option B (November 14); walking foes one below to two above, gates at 10 and 20, then the final boss (November 15, 1:06 pm).',
    top: P.TOP, fightsToFinish: P.FIGHTS,
    walking: { foeLevel: 'the party\'s level, from ' + P.WALK.below + ' below to ' + P.WALK.above + ' above, each as likely as the others', below: P.WALK.below, above: P.WALK.above },
    xp: { wisp: xp.w, shadowWraith: xp.K, greatWraith: xp.B, perFoeLevel: xp.slope, codes: { w: 'wisp', K: 'shadowWraith', B: 'greatWraith' } },
    toReach: P.toReach, fair: fair.map(f => ({ id: f.id, foes: f.code, foeLevel: f.level })), bands: P.bands, gates: P.gates, lastFight: P.lastFight,
    notes: ['A line-up is written as in game/plan/sim: w wisp, K Shadow Wraith, B great wraith.', 'Bands 4 to 6 are bramble country. Their line-ups here are wraith-family stand-ins until the bramble foes have fight numbers (task board F3).', 'The party shares XP and levels together. Losing costs nothing: she wakes at the last rest spot.'],
  };
  fs.writeFileSync(__dirname + '/plan-v2.json', JSON.stringify(plan, null, 1));
  fs.writeFileSync(__dirname + '/plan-v2.js', '// Made by game/plan/levelling/plan2.js from plan-v2.json. Do not edit by hand.\n(function (root) {\n  var P = ' + JSON.stringify(plan) + ';\n' +
`  P.levelOf = function (xp) { var L = 1; while (L < P.top && xp >= P.toReach[L + 1]) L++; return L; };
  P.xpOf = function (foes, foeLevel) { var s = 0; String(foes).replace(/(\\d*)([wKB])/g, function (_, n, k) { s += (+n || 1) * P.xp[P.xp.codes[k]]; }); return Math.round(s * Math.pow(P.xp.perFoeLevel, foeLevel - 1)); };
  P.bandOf = function (level) { for (var i = 0; i < P.bands.length; i++) if (level < P.bands[i].to) return P.bands[i]; return P.bands[P.bands.length - 1]; };
  if (typeof module !== 'undefined' && module.exports) module.exports = P; else root.MF_LEVELS = P;
})(typeof window !== 'undefined' ? window : this);
`);
}
module.exports = { build, write, bands, gates, lastFight, TOP, FIGHTS, WALK };
if (require.main === module) { const cal = +process.argv[2] || 1; write(build(cal)); console.log('wrote plan-v2.json and plan-v2.js, fine tuning', cal); }
