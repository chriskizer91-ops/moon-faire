// Writes the option Chris chose as the game's levelling plan: plan-chosen.json, and plan-chosen.js for a page to load.
//   node choose.js B full "Chris, November 14, 2026, 7:30 pm"
// "top" is the highest level the party can reach: the XP list stops there.
const fs = require('fs');
const { build, xp, fair } = require('./options.js');
const key = process.argv[2], mix = process.argv[3] || 'full', by = process.argv[4] || '';
const res = JSON.parse(fs.readFileSync(__dirname + '/results-' + mix + '.json', 'utf8'))[key];
const P = build(key, mix, { cal: res.cal });
const toReach = {}; for (let L = 1; L <= P.o.top; L++) toReach[L] = P.toReach[L];
const plan = {
  what: 'Moon Faire: levels, XP and what is met where, for the open-world game. Made by game/plan/levelling/choose.js; do not edit by hand.',
  chosen: { option: key, fights: mix === 'full' ? 'full-size' : 'small packs', by },
  top: P.o.top,                                   // the highest level; the party stops gaining levels here
  fightsToFinish: P.o.fights,                      // wins for a steady player, measured
  xp: { wisp: xp.w, shadowWraith: xp.K, greatWraith: xp.B, perFoeLevel: xp.slope, codes: { w: 'wisp', K: 'shadowWraith', B: 'greatWraith' } },
  toReach,                                         // XP in all to be each level
  fair: fair.map(f => ({ id: f.id, foes: f.code, foeLevel: f.level })),
  rings: P.rings.map(r => ({ ring: r.n, partyEnters: r.enter, partyLeaves: r.leave, foeLevels: r.foeLevels,
    meets: r.table.map(t => ({ foes: t[0], weight: t[1] })), gate: { foes: r.gate.code, foeLevel: r.gate.level, opensAtLevel: r.gate.level } })),
  notes: [
    'A line-up is written as in game/plan/sim: w wisp, K Shadow Wraith, B great wraith; "K2w" is one Shadow Wraith and two wisps.',
    'XP for a won fight: each foe gives its kind\'s XP times perFoeLevel to the power (foe level - 1), rounded for the whole line-up.',
    'The party shares XP and levels together. Losing costs nothing.',
    'Which piece of the map each ring is, and what each gate fight is in the story, are not decided here (task board F5, S3). Gates other than 4w, K2w, 2K2w and B2K2w are stand-ins.',
  ],
};
fs.writeFileSync(__dirname + '/plan-chosen.json', JSON.stringify(plan, null, 1));
fs.writeFileSync(__dirname + '/plan-chosen.js', '// Made by game/plan/levelling/choose.js from plan-chosen.json. Do not edit by hand.\n(function (root) {\n  var P = ' + JSON.stringify(plan) + ';\n' +
`  P.levelOf = function (xp) { var L = 1; while (L < P.top && xp >= P.toReach[L + 1]) L++; return L; };
  P.xpOf = function (foes, foeLevel) { var s = 0; String(foes).replace(/(\\d*)([wKB])/g, function (_, n, k) { s += (+n || 1) * P.xp[P.xp.codes[k]]; }); return Math.round(s * Math.pow(P.xp.perFoeLevel, foeLevel - 1)); };
  P.ringOf = function (level) { for (var i = 0; i < P.rings.length; i++) if (level < P.rings[i].partyLeaves) return P.rings[i]; return P.rings[P.rings.length - 1]; };
  if (typeof module !== 'undefined' && module.exports) module.exports = P; else root.MF_LEVELS = P;
})(typeof window !== 'undefined' ? window : this);
`);
console.log('wrote plan-chosen.json and plan-chosen.js: option', key, mix, 'top level', plan.top);
