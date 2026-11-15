// Proves that "attentive, careful" and "expert, careful" written out here play exactly as the engine's own attentive
// and expert: the same result and the same number of turns, fight by fight. Then checks very careless never breaks a rule.
const { E, playOut, names } = require('./testers.js');
const T = { w: 'normal', K: 'difficult', B: 'boss' };
const parse = code => { const foes = []; code.replace(/(\d*)([wKB])/g, (_, n, k) => { for (let i = 0; i < (+n || 1); i++) foes.push(T[k]); }); return { id: code, label: code, foes }; };
let bad = 0, n = 0;
for (const code of ['3w', 'K2w', '2K4w', 'B', 'BK2w', 'B2K2w', '2B2K3w']) {
  const rules = JSON.parse(JSON.stringify(E.RULES)); rules.encounters = [parse(code)];
  for (const gap of [0, 2]) for (const [mine, theirs] of [['attentive, careful', 'attentive'], ['expert, careful', 'expert']]) for (let i = 0; i < 150; i++) {
    const seed = 977 + i * 7919;
    const a = E.playOut(code, { rules, style: theirs, level: gap, seed });
    const b = playOut(code, { rules, tester: mine, useEngine: false, level: gap, seed });
    n++; if (a.over !== b.over || a.heroTurns !== b.heroTurns || a.foeTurns !== b.foeTurns || a.kos !== b.kos) bad++;
  }
  for (const t of names) for (let i = 0; i < 40; i++) { const b = playOut(code, { rules, tester: t, level: 0, seed: 5 + i * 31 }); if (!b.over) { bad++; console.log('did not finish:', t, code); } }
}
console.log(bad ? 'FAILED: ' + bad + ' of ' + n + ' fights differ' : 'ok: ' + n + ' fights, the written-out attentive and expert match the engine\'s own, turn for turn; all eight finish every fight');
process.exit(bad ? 1 : 0);
