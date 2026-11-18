// What Chris chose on November 15 (12:56 pm), measured: "top everybody up" after every fight, MP herb 20, steady plants
// (1 HP + 2 MP picked between fights), a bag with no limit, and stocking up in a safer ring before a harder one.
//   node chosen.js [stretches each, default 300]
const fs = require('fs');
const { stretch, TOP_UP, HERBS } = require('./journey.js');
const N = +process.argv[2] || 300;
const q = (a, f) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * f))];
const steady = { hp: 1, mp: 2 }, out = { n: N, herbs: HERBS, steady, rings: {} };
const testers = ['careless', 'attentive, careful', 'focused, careful', 'expert, careful'];
const show = v => (v >= 40 ? '40+' : String(v)).padStart(3);
console.log('Fights won from a rest spot before the first loss: the unlucky 1 in 10 / the usual run. Steady plants unless said.');
console.log('ring  tester               never tops up | tops up, bag empty at the start | arrives with 10 HP + 20 MP herbs | with 20 + 40 | with 40 + 80   | eats a fight (HP, MP)');
for (const ring of [1, 2, 3, 4, 5, 6]) {
  out.rings[ring] = {};
  for (const t of testers) {
    const cell = o => { const w = []; for (let i = 0; i < N; i++) w.push(stretch(ring, t, 101 + i * 7919, o).won); return { low: q(w, 0.1), mid: q(w, 0.5) }; };
    const careless = t === 'careless', after = careless ? undefined : TOP_UP;
    const never = cell({ plants: steady, after: null });
    const empty = cell({ plants: steady, after }), s1 = cell({ plants: steady, after, start: { hp: 10, mp: 20 } }), s2 = cell({ plants: steady, after, start: { hp: 20, mp: 40 } }), s3 = cell({ plants: steady, after, start: { hp: 40, mp: 80 } });
    let f = 0, uh = 0, um = 0; for (let i = 0; i < N; i++) { const s = stretch(ring, t, 101 + i * 7919, { after, start: { hp: 1e6, mp: 1e6 } }); f += s.won; uh += s.used.hp; um += s.used.mp; }
    out.rings[ring][t] = { never, empty, s1, s2, s3, eats: { hp: +(uh / f).toFixed(2), mp: +(um / f).toFixed(2) } };
    const c = x => show(x.low) + '/' + show(x.mid);
    console.log('  ' + ring + '   ' + t.padEnd(20), c(never).padEnd(14), '|', c(empty).padEnd(31), '|', c(s1).padEnd(32), '|', c(s2).padEnd(12), '|', c(s3).padEnd(14), '|', (uh / f).toFixed(1), (um / f).toFixed(1));
  }
}
fs.writeFileSync(__dirname + '/chosen.json', JSON.stringify(out, null, 1));
