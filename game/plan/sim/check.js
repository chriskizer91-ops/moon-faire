const E = require('./blob-battle-engine.js');
const p = x => Math.round(x*100)+'%';
for (const id of ['pack','standard','boss1','boss2','grand','trioPack','trioStd']) {
  const r = ['careless','attentive','expert'].map(s => E.runMany(id, 1500, {style:s}));
  console.log(id.padEnd(9), r.map(x=>p(x.win)).join(' / '), ' moment', r.map(x=>p(x.moment)).join(' / '), ' turns', r.map(x=>x.turns.toFixed(1)).join(' / '));
}
console.log('--- level rules (1000)');
const t = [['pack',4],['standard',4],['trioStd',4],['boss1',0],['boss1',1],['boss1',2],['grand',1]];
for (const [id,g] of t) console.log(id.padEnd(9), '+'+g, ['careless','attentive','expert'].map(s => p(E.runMany(id, 1000, {style:s, level:g}).win)).join(' / '));
