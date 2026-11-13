const { measure } = require('./lib.js');
const p = x => Math.round(x*100)+'%';
const rows = [
 ['T1 square: 2 wisps L1','2w',[0]], ['T2 stall row: 3 wisps L1','3w',[0]], ['T3 mooring: 3 wisps L2','3w',[1]],
 ['ring: 2 wisps at level','2w',[0]],
 ['W4 walk 3w L2-3','3w',[0,1]], ['W4 walk 4w L2','4w',[0]], ['S1 4 wisps L3','4w',[1]],
 ['W5 walk 3w L3','3w',[0,1]], ['W5 K2w L3','K2w',[0,1]], ['W5 4w L4','4w',[1,2]],
 ['S2 stones: K2w L4','K2w',[1,2]],
 ['W6 K2w L4-5','K2w',[1,2]], ['W6 K4w L4','K4w',[0,1]], ['W6 5w L5','5w',[1,2]],
 ['S3 2K2w L5','2K2w',[1,2]],
 ['W7 hollow 5w L6','5w',[2,3,4]],
 ['W9 K2w L5','K2w',[0,1]], ['W9 K4w L5','K4w',[0,1]], ['W9 5w L6','5w',[1,2]], ['W9 2K2w L6','2K2w',[1,2]],
 ['BOSS B2K2w L5','B2K2w',[0,1]],
];
for (const [name, code, gaps] of rows) for (const g of gaps) {
  const r = ['careless','attentive','expert'].map(s => measure(code, g, s, 1000));
  console.log(name.padEnd(32), code.padEnd(6), '+'+g, r.map(x=>p(x.win)).join(' / ').padEnd(20), 'turns', (r[1].ht+r[1].ft).toFixed(0));
}
