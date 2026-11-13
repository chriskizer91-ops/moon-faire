// at which fight (counting wins on the shortest sensible route) each level arrives, attentive player
const fs = require('fs'); let src = fs.readFileSync('./route.js', 'utf8');
src = src.replace("S.xp += xpOf(c, lvl);", "{ const b = levelOf(S.xp); S.xp += xpOf(c, lvl); const a = levelOf(S.xp); if (a > b) (S.ups = S.ups || {})[a] = S.fights - S.losses; }");
src = src.replace(/const styles = [\s\S]*$/, `
const N = 2000, ups = {2:[],3:[],4:[],5:[]}, tot = [];
for (let i = 0; i < N; i++) { const S = play(1234 + i * 7919, 'attentive'); for (const k in ups) ups[k].push(S.ups[k]); tot.push(S.fights - S.losses); }
const q = (a, f) => a.slice().sort((x, y) => x - y)[Math.floor(a.length * f)];
for (const k in ups) console.log('level', k, 'arrives with win number: 10th', q(ups[k], .1), 'median', q(ups[k], .5), '90th', q(ups[k], .9));
console.log('wins in all: 10th', q(tot, .1), 'median', q(tot, .5), '90th', q(tot, .9));`);
fs.writeFileSync('./pace_gen.js', src); require('./pace_gen.js');
