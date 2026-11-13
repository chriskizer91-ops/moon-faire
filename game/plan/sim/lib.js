// Starter-world measuring tools. Uses the approved engine unchanged; only adds encounter line-ups through opts.rules.
const E = require('./blob-battle-engine.js');
const T = { w: 'normal', K: 'difficult', B: 'boss' };
// code like "K2w" = one Shadow Wraith (knight numbers) and two wisps; a leading "t" = before the Jester joins
function parse(code) {
  const trio = code[0] === 't'; const s = trio ? code.slice(1) : code; const foes = [];
  s.replace(/(\d*)([wKB])/g, (_, n, k) => { for (let i = 0; i < (+n || 1); i++) foes.push(T[k]); });
  return { id: code, label: code, foes, noJester: trio };
}
const cache = {};
function rulesFor(code, tweak) {
  const R = JSON.parse(JSON.stringify(E.RULES));
  R.encounters = [parse(code)];
  if (tweak) tweak(R);
  return R;
}
function measure(code, gap, style, n = 600, tweak) {
  const key = [code, gap, style, n, tweak ? tweak.name : ''].join('|');
  if (cache[key]) return cache[key];
  const R = rulesFor(code, tweak);
  let won = 0, ht = 0, ft = 0, htAll = 0, ftAll = 0, kos = 0, cc = 0;
  for (let i = 0; i < n; i++) {
    const B = E.playOut(code, { rules: R, style, level: gap, seed: 977 + i * 7919 });
    htAll += B.heroTurns; ftAll += B.foeTurns;
    if (B.over === 'won') { won++; ht += B.heroTurns; ft += B.foeTurns; kos += B.kos; if (B.curtain) cc++; }
  }
  return cache[key] = { win: won / n, ht: won ? ht / won : 0, ft: won ? ft / won : 0, htAll: htAll / n, ftAll: ftAll / n, kos: won ? kos / won : 0, curtain: won ? cc / won : 0 };
}
module.exports = { E, parse, rulesFor, measure };
