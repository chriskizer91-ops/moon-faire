// Finds, measured. A find changes numbers in the approved engine's RULES and nothing else; the rules code is untouched.
// A change is { path: 'i.mend', mul: 1.05 } or { path: 'j.catches', add: 1 }. Several finds stack by applying each in turn.
const E = require('../sim/blob-battle-engine.js');
const T = { w: 'normal', K: 'difficult', B: 'boss' };
function parse(code) { const foes = []; code.replace(/(\d*)([wKB])/g, (_, n, k) => { for (let i = 0; i < (+n || 1); i++) foes.push(T[k]); }); return { id: code, label: code, foes }; }
function rulesWith(changes, code) {
  const R = JSON.parse(JSON.stringify(E.RULES));
  for (const c of changes || []) {
    const keys = c.path.split('.'); let o = R; for (const k of keys.slice(0, -1)) o = o[k];
    const last = keys[keys.length - 1];
    if (typeof o[last] !== 'number') throw new Error('no such number in RULES: ' + c.path);
    o[last] = c.mul !== undefined ? o[last] * c.mul : o[last] + c.add;
  }
  if (code) R.encounters = [parse(code)];
  return R;
}
// the same seeds for every set of changes, so two rows differ by the find and not by luck as far as that is possible
function measure(code, gap, style, n, changes) {
  const R = rulesWith(changes, code);
  let won = 0, turns = 0, kos = 0;
  for (let i = 0; i < n; i++) { const B = E.playOut(code, { rules: R, style, level: gap, seed: 977 + i * 7919 }); if (B.over === 'won') { won++; turns += B.heroTurns; kos += B.kos; } }
  return { win: won / n, turns: won ? turns / won : 0, kos: won ? kos / won : 0 };
}
const all = (paths, mul) => paths.map(path => ({ path, mul }));
const HP = ['heroes.jester.hp', 'heroes.ranger.hp', 'heroes.fox.hp', 'heroes.io.hp'];
const MP = ['heroes.jester.mp', 'heroes.fox.mp', 'heroes.io.mp'];
const HEAL = ['j.heal', 'i.mend', 'i.bloom'];
const FOXMP = ['f.stitchMp', 'f.needlesMp', 'f.clothMp', 'f.quiltMp', 'f.decoyMp'];
const IOMP = ['i.thornMp', 'i.deityMp', 'i.mendMp', 'i.bloomMp', 'i.reviveMp'];
module.exports = { E, parse, rulesWith, measure, all, HP, MP, HEAL, FOXMP, IOMP };
