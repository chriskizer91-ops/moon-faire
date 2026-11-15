// First look: how far does each tester get from a rest spot, with no herbs at all, and with all the herbs she wants?
const { stretch } = require('./journey.js');
const { names } = require('../testers/testers.js');
const N = +process.argv[2] || 200;
const q = (a, f) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * f))];
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
for (const ring of [1, 2, 3, 4, 5, 6]) {
  console.log('\nRing ' + ring + '   no herbs: fights won before the first loss (1 in 10 / middle / 9 in 10), HP and MP left after a fight   |   all the herbs she wants: fights, HP herbs and MP herbs a fight');
  for (const t of names) {
    const a = [], b = []; for (let i = 0; i < N; i++) { a.push(stretch(ring, t, 101 + i * 7919)); b.push(stretch(ring, t, 101 + i * 7919, { start: { hp: 1e6, mp: 1e6 } })); }
    const wa = a.map(x => x.won), wb = b.map(x => x.won), fb = b.reduce((s, x) => s + x.won, 0);
    console.log('  ' + t.padEnd(20), String(q(wa, 0.1)).padStart(3), String(q(wa, 0.5)).padStart(3), String(q(wa, 0.9)).padStart(3), '  ', Math.round(mean(a.map(x => x.leftHp)) * 100) + '% ' + Math.round(mean(a.map(x => x.leftMp)) * 100) + '%',
      '  |  ', String(q(wb, 0.1)).padStart(3), String(q(wb, 0.5)).padStart(3), String(q(wb, 0.9)).padStart(3), '  ', (b.reduce((s, x) => s + x.used.hp, 0) / fb).toFixed(1).padStart(5), (b.reduce((s, x) => s + x.used.mp, 0) / fb).toFixed(1).padStart(5));
  }
}
