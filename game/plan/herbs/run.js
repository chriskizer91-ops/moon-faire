// How far each tester gets from a rest spot, ring by ring, for a range of plants picked between fights.
//   node run.js [stretches each, default 200] [MP in one MP herb, default 20]
const fs = require('fs');
const { stretch, HERBS, PLAN } = require('./journey.js');
const { names } = require('../testers/testers.js');
const N = +process.argv[2] || 200, mpHerb = +process.argv[3] || 20;
const herbs = Object.assign({}, HERBS, { mp: mpHerb });
const q = (a, f) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * f))];
const rates = [[0, 0], [0.5, 1], [1, 2], [1.5, 3], [2, 4], [3, 6]];
const out = { n: N, herbs, most: 40, rates, rings: {}, want: {} };
for (const ring of [1, 2, 3, 4, 5, 6]) {
  out.rings[ring] = {}; out.want[ring] = {};
  console.log('\nRing ' + ring + ' (party level ' + (PLAN.rings[ring - 1].partyEnters + 1) + '). Fights won from a rest spot before the first loss: the unlucky 1 in 10 / the middle. Plants picked between fights (HP, MP): ' + rates.map(r => r.join('+')).join('  '));
  for (const t of names) {
    out.rings[ring][t] = [];
    let line = '  ' + t.padEnd(20);
    for (const [hp, mp] of rates) {
      const w = []; for (let i = 0; i < N; i++) w.push(stretch(ring, t, 101 + i * 7919, { herbs, plants: { hp, mp } }).won);
      out.rings[ring][t].push({ hp, mp, low: q(w, 0.1), mid: q(w, 0.5) });
      line += '   ' + String(q(w, 0.1)).padStart(2) + '/' + String(q(w, 0.5)).padStart(2);
    }
    // all the herbs she wants: what she eats a fight
    let f = 0, uh = 0, um = 0; for (let i = 0; i < N; i++) { const s = stretch(ring, t, 101 + i * 7919, { herbs, start: { hp: 1e6, mp: 1e6 } }); f += s.won; uh += s.used.hp; um += s.used.mp; }
    out.want[ring][t] = { hp: +(uh / f).toFixed(2), mp: +(um / f).toFixed(2) };
    console.log(line + '    eats ' + (uh / f).toFixed(1) + ' HP and ' + (um / f).toFixed(1) + ' MP herbs a fight when she has all she wants');
  }
}
fs.writeFileSync(__dirname + '/results-mp' + mpHerb + '.json', JSON.stringify(out, null, 1));
