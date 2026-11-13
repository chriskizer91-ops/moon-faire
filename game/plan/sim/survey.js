const { measure } = require('./lib.js');
const p = x => (Math.round(x*100)+'%').padStart(4);
const codes = process.argv[2].split(','); const gaps = process.argv[3].split(',').map(Number);
for (const c of codes) for (const g of gaps) {
  const r = ['careless','attentive','expert'].map(s => measure(c, g, s, +process.argv[4] || 500));
  console.log(c.padEnd(8), (g>=0?'+':'')+g, ' win', r.map(x=>p(x.win)).join(' /'), '  actions(att) hero', r[1].ht.toFixed(1), 'foe', r[1].ft.toFixed(1), ' faints', r[1].kos.toFixed(2), ' curtain', p(r[1].curtain));
}
