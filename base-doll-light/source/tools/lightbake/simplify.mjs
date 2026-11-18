// simplify.mjs CODE [BUDGET] : thin every exported mesh of the outfit to one geometric error, the error found so the whole light model
// (with her face at its own fixed size) comes to BUDGET triangles. Thinning only drops points (meshoptimizer never moves one), so every
// kept point keeps its bone weights and the face keeps its painting. Writes out/CODE_simp/<mesh>.idx (triangles of the kept points,
// indexing the full mesh's points) and out/CODE_simp.json (per mesh: triangles, error).
import fs from 'fs';
import { MeshoptSimplifier as S } from './node_modules/meshoptimizer/meshopt_simplifier.js';
await S.ready;
const code = process.argv[2], BUDGET = +(process.argv[3] || 50000), D = `out/${code}_raw/`, O = `out/${code}_simp/`;
fs.mkdirSync(O, { recursive: true });
const meta = JSON.parse(fs.readFileSync(`out/${code}_full.json`));
const rd = (f, T) => { const b = fs.readFileSync(D + f); return new T(b.buffer, b.byteOffset, b.byteLength / T.BYTES_PER_ELEMENT); };
// what each part gets: her face a fixed share (it stays live: blinks, talks); small see-through films and her nails are not kept
// as shapes (their look is baked onto what is under them)
const FACE = 6000, DROP = new Set(['nail', 'hbEdge']);
const parts = [], keep = [];
let keepTris = 0;
for (const m of meta) {
  if (DROP.has(m.name) || m.tris < 1) continue;
  // a see-through piece (wings, a veil) keeps its own mesh and material on the light model too: a baked picture cannot see through
  if (m.transparent || m.alphaTest > 0) { keep.push(m.name); keepTris += m.tris; continue; }       // and a cut-out one (a lace mask, a feather)
  const pos = rd(m.name + '.pos', Float32Array), idx = rd(m.name + '.idx', Uint32Array);
  let nor = null; try { nor = rd(m.name + '.nor', Float32Array); } catch (e) {}
  parts.push({ name: m.name, pos, idx, nor, face: m.name === 'face' });
}
const run = (p, err, target) => {
  const flags = ['ErrorAbsolute'];
  if (p.nor) return S.simplifyWithAttributes(p.idx, p.pos, 3, p.nor, 3, [0.015, 0.015, 0.015], null, target, err, flags);
  return S.simplify(p.idx, p.pos, 3, target, err, flags);
};
const at = (err) => { let tot = 0; for (const p of parts) { if (p.face) continue; const [ix] = run(p, err, 0); p.out = ix; tot += ix.length / 3; } return tot; };
// the face: to its fixed size
for (const p of parts) if (p.face) { const [ix, e] = run(p, 0.05, FACE * 3); p.out = ix; p.err = e; }
const rest = BUDGET - keepTris - (parts.find((p) => p.face) ? parts.find((p) => p.face).out.length / 3 : 0);
let lo = 0.0001, hi = 0.05, tot = 0;
for (let k = 0; k < 22; k++) { const mid = Math.sqrt(lo * hi); tot = at(mid); if (tot > rest) lo = mid; else hi = mid; }
tot = at(hi);
const res = {}; let all = 0;
for (const p of parts) { fs.writeFileSync(O + p.name + '.idx', Buffer.from(p.out.buffer, p.out.byteOffset, p.out.byteLength)); res[p.name] = { tris: p.out.length / 3, full: p.idx.length / 3 }; all += p.out.length / 3; }
fs.writeFileSync(`out/${code}_simp.json`, JSON.stringify({ error: hi, total: all + keepTris, keep, keepTris, parts: res }, null, 1));
console.log(`${code}: error ${(hi * 1000).toFixed(2)} mm, ${all} triangles thinned + ${keepTris} kept see-through (${keep.join(', ')})`);
for (const p of parts) console.log(`  ${p.name.padEnd(14)} ${String(res[p.name].full).padStart(7)} -> ${res[p.name].tris}`);
