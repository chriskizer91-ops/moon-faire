// Every line-up the bigger game might use, at every level gap: wins by play style, length, faints.
// Uses the approved engine unchanged, through ../sim/lib.js.
const { measure } = require('../sim/lib.js');
const fs = require('fs');
const codes = ['2w','3w','4w','5w','6w','K','K2w','K4w','2K','2K2w','2K4w','3K','3K2w','B','B3w','BK2w','B2K2w','2BKw'];
const gaps = [-4,-3,-2,-1,0,1,2,3,4];
const N = +process.argv[2] || 400;
const out = {};
for (const c of codes) { out[c] = {}; for (const g of gaps) {
  const r = {}; for (const s of ['careless','attentive','expert']) { const m = measure(c, g, s, N); r[s] = { win: +m.win.toFixed(3), ht: +m.ht.toFixed(1), ft: +m.ft.toFixed(1), htAll: +m.htAll.toFixed(1), ftAll: +m.ftAll.toFixed(1), kos: +m.kos.toFixed(2) }; }
  out[c][g] = r;
} }
fs.writeFileSync(__dirname + '/gaps.json', JSON.stringify(out));
const p = x => (Math.round(x * 100) + '%').padStart(4);
for (const c of codes) { console.log('\n' + c); for (const g of gaps) { const r = out[c][g]; console.log('  ' + (g >= 0 ? '+' : '') + g, ' win', ['careless','attentive','expert'].map(s => p(r[s].win)).join(' /'), '  witch turns', String(r.attentive.ht).padStart(5), ' foe turns', String(r.attentive.ft).padStart(5), ' faints', r.attentive.kos); } }
