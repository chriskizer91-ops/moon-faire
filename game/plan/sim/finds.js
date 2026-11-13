const { measure } = require('./lib.js');
const p = x => (Math.round(x*100)+'%').padStart(4);
function heal5(R){ R.j.heal*=1.05; R.i.mend*=1.05; R.i.bloom*=1.05; }
function hp2(R){ for (const k in R.heroes) R.heroes[k].hp=Math.round(R.heroes[k].hp*1.02); }
function both(R){ heal5(R); hp2(R); }
for (const code of ['B2K2w','B2K','BK2w']) for (const [nm,tw] of [['as it is',null],['+5% healing',heal5],['+2% HP',hp2],['both finds',both]]) {
  const r = ['careless','attentive','expert'].map(s => measure(code, 0, s, 1500, tw));
  const u = ['careless','attentive','expert'].map(s => measure(code, 1, s, 1500, tw));
  console.log(code.padEnd(6), nm.padEnd(12), 'at level', r.map(x=>p(x.win)).join(' /'), '  one level under', u.map(x=>p(x.win)).join(' /'));
}
