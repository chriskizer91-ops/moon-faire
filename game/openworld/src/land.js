// land.js: the open world's land, made from rules, the way Mud Lab's world is (its src/ml-world.js): a height for every spot and what the
// ground is there, worked out from the painted map's own lines (the coast, the crag, the river, the roads, the woods, the fields, the
// marsh, the rises) and some soft noise. Nothing is stored: the same answer comes back for the same spot, so the background worker that
// builds the land round the camera and the page that walks the Jester on it agree to the millimetre.
// makeLand(F, R) is sent to the worker as text, so it uses nothing from outside itself.
//   F: the map's features (data/features.json)   R: { places, roads } (data/places.json)
function makeLand(F, R) {
  'use strict';
  const WL = 0.9;                                                     // the water: the sea, the river and the marsh pools all stand at this height
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;
  // ---- noise: value noise on a hashed lattice, in octaves ----
  function hash(i, j) { let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function vn(x, z) {
    const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
  }
  function fbm(x, z, o) { let s = 0, a = 0.5, f = 1, n = 0; for (let k = 0; k < o; k++) { s += a * vn(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= 0.5; f *= 2.03; } return s / n; }

  // ---- lines and outlines, cut into short runs each with its own box, so a far run costs one test ----
  function prep(pts, closed) {
    const P = closed && (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) ? pts.concat([pts[0]]) : pts, runs = [];
    for (let a = 0; a < P.length - 1; a += 12) {
      const b = Math.min(P.length - 1, a + 12), xs = [], zs = []; let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
      for (let k = a; k <= b; k++) { xs.push(P[k][0]); zs.push(P[k][1]); x0 = Math.min(x0, P[k][0]); x1 = Math.max(x1, P[k][0]); z0 = Math.min(z0, P[k][1]); z1 = Math.max(z1, P[k][1]); }
      runs.push({ x: Float64Array.from(xs), z: Float64Array.from(zs), x0, z0, x1, z1 });
    }
    let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const r of runs) { x0 = Math.min(x0, r.x0); z0 = Math.min(z0, r.z0); x1 = Math.max(x1, r.x1); z1 = Math.max(z1, r.z1); }
    return { runs, x0, z0, x1, z1 };
  }
  const boxGap = (b, x, z) => Math.max(b.x0 - x, x - b.x1, b.z0 - z, z - b.z1, 0);
  function dist(L, x, z, cap) {                                        // distance to a line, or cap if it is farther than that
    if (boxGap(L, x, z) > cap) return cap; let best = cap * cap;
    for (const r of L.runs) {
      const g = boxGap(r, x, z); if (g * g > best) continue;
      for (let k = 0; k < r.x.length - 1; k++) {
        const ax = r.x[k], az = r.z[k], dx = r.x[k + 1] - ax, dz = r.z[k + 1] - az, l2 = dx * dx + dz * dz;
        let t = l2 > 0 ? ((x - ax) * dx + (z - az) * dz) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = ax + dx * t - x, ez = az + dz * t - z, d2 = ex * ex + ez * ez; if (d2 < best) best = d2;
      }
    }
    return Math.sqrt(best);
  }
  function sd(P, x, z, cap) {                                          // signed distance to an outline: less than 0 inside
    const g = boxGap(P, x, z); if (g > cap) return cap;
    let inside = false;
    for (const r of P.runs) { if (z < r.z0 || z > r.z1) continue; for (let k = 0; k < r.x.length - 1; k++) { const az = r.z[k], bz = r.z[k + 1]; if ((az > z) !== (bz > z) && x < (r.x[k + 1] - r.x[k]) * (z - az) / (bz - az) + r.x[k]) inside = !inside; } }
    const d = dist(P, x, z, cap); return inside ? -d : d;
  }

  // ---- the map's lines ----
  const SEA = prep(F.sea, true), CRAG = prep(F.crag, true), LEDGE = prep(F.crag_ledge, true), TOP = prep(F.crag_top, true), STAIR = prep(F.crag_stair, true);
  const WOODS = prep(F.woods, true), FIELDS = prep(F.fields, true), MARSH = prep(F.marsh, true);
  const RIVER = prep(F.river[0], false), STREAM = prep(F.stream[0], false);
  const ROADS = R.roads.map((r) => Object.assign(prep(r.pts, false), { w: r.w, k: r.k }));
  const WALLS = F.walls.map((p) => prep(p, false));
  const RISE_K = [3.2, 1.2, 5.0, 3.5, 2.0, 1.0];                    // how high each painted rise stands (the stones, the pool, the tor, the north rise, two by the road)
  const RISES = F.rises.map((r, i) => ({ x: r[0], z: r[1], rx: r[2] * 1.5, rz: r[3] * 1.5, a: RISE_K[i] || 2 }));
  const POOLS = F.pools.filter((p) => p[1] < 180).map((p) => ({ x: p[0], z: p[1], rx: p[2] * 1.15, rz: p[3] * 1.4 }));
  const ROCKS = F.sea_rocks.map((p) => ({ x: p[0], z: p[1], r: 3.2 })).concat(F.piers.map((p) => ({ x: p[0], z: p[1], r: 2.2, pier: true })));
  const TOR = { x: -39, z: -116 };
  // the fairground round the fair's three places (its outline, level and lanes are ow-dressing.js's tables, handed in as R.fairground):
  // its ground level and trampled, blending into the land round it over 'blend' metres, and its lanes worn earth like the roads
  const FGR = R.fairground, FG = FGR ? { P: prep(FGR.outline, true), level: FGR.level, blend: FGR.blend || 18,
    lanes: (FGR.lanes || []).map((l) => Object.assign(prep(l.pts, false), { w: l.w || 4, k: l.k == null ? 1.0 : l.k })) } : null;
  // the places: the ground each painting shows, flat at the place's own height, with a margin, and a soft slope into the moor round it
  const BLEND = { W1: 24, W2: 24, W3: 26, W4: 26, W5: 22, W6: 22, W7: 11 };
  const PLACES = Object.values(R.places).map((p) => {
    const cx = p.foot.reduce((s, q) => s + q[0], 0) / 4, cz = p.foot.reduce((s, q) => s + q[1], 0) / 4;
    const grow = p.foot.map((q) => { const dx = q[0] - cx, dz = q[1] - cz, l = Math.hypot(dx, dz); return [p.at[0] + q[0] + dx / l * 3, p.at[1] + q[1] + dz / l * 3]; });
    return { id: p.id, base: p.base, fair: p.zone === 1, P: prep(grow, true), blend: BLEND[p.id] || 22 };
  });
  // where the land is lifted or lowered as a whole: soft heights pulled toward these spots (x, z, height)
  const CP = [[-190, 96, 3], [-260, 96, 2.6], [-330, 100, 2], [-300, -220, 12], [-200, -150, 9], [-39, -116, 15], [40, 10, 8.5], [-60, 30, 6], [-110, 150, 3.4], [32, 100, 5], [100, 70, 7.5], [161, 37, 9.2], [161, 97, 8.2],
    [230, 75, 8], [289, 97, 6.5], [180, -60, 11], [100, -170, 11], [0, 235, 1.2], [200, 200, 3.2], [370, 130, 7.5], [-120, -40, 8.5], [260, 40, 9]];
  function idw(x, z) { let s = 0, w = 0; for (let i = 0; i < CP.length; i++) { const c = CP[i], d2 = (x - c[0]) * (x - c[0]) + (z - c[1]) * (z - c[1]) + 1600, k = 1 / (d2 * d2); s += k * c[2]; w += k; } return s / w; }

  // ---- the height, and what the ground is ----
  const out = { h: 0, road: 0, fair: 0, rock: 0, wet: 0, place: 0, sea: 0, marsh: 0, field: 0 };
  function at(x, z) {
    let h = idw(x, z) + 2.0 * fbm(x / 95, z / 95, 4) + 0.75 * fbm(x / 31, z / 31, 3), rock = 0, wet = 0, marsh = 0, field = 0;
    for (const r of RISES) { const dx = (x - r.x) / r.rx, dz = (z - r.z) / r.rz, e = dx * dx + dz * dz; if (e < 6) h += r.a * Math.exp(-2 * e); }
    { const d = Math.hypot(x - TOR.x, z - TOR.z); if (d < 60) { h += 4.5 * Math.exp(-d * d / (2 * 15 * 15)); rock = Math.max(rock, 1 - smooth(9, 17, d + 3 * vn(x / 4, z / 4))); } }
    { const d = sd(WOODS, x, z, 60); if (d < 60) h += 6 * smooth(30, -50, d) * (0.65 + 0.45 * fbm(x / 45, z / 45, 3)); }
    for (const b of F.bare_tops) { const dx = (x - b[0]) / b[2], dz = (z - b[1]) / b[3], e = dx * dx + dz * dz; if (e < 6) h += 3.5 * Math.exp(-1.5 * e); }
    { const d = sd(FIELDS, x, z, 40); if (d < 40) { h = mix(h, 2.15 + 0.45 * fbm(x / 50, z / 50, 2), smooth(30, -12, d)); field = smooth(4, -6, d + 2 * vn(x / 6, z / 6)); } }
    { const d = sd(MARSH, x, z, 50); if (d < 50) { const k = smooth(36, -6, d); h = mix(h, 1.02 + 0.5 * fbm(x / 13, z / 13, 3) + 0.15 * vn(x / 3, z / 3), k); wet = Math.max(wet, k * 0.7); marsh = smooth(8, -6, d + 3 * vn(x / 7, z / 7)); } }
    { const d = dist(RIVER, x, z, 90); if (d < 90) {                // the river's valley, then its banks and bed
      h = mix(h, Math.min(h, 2.1 + d * 0.07 + 0.4 * fbm(x / 30, z / 30, 2)), 1 - smooth(12, 85, d));
      const bed = WL - 0.75; h = Math.min(h, mix(bed, h, smooth(2.0, 9, d))); wet = Math.max(wet, 1 - smooth(2, 5.5, d)); marsh = Math.max(marsh, 1 - smooth(7, 16, d + 2.5 * vn(x / 5, z / 5))); } }
    { const d = dist(STREAM, x, z, 6); if (d < 6) { h -= 0.55 * (1 - smooth(0.4, 2.2, d)); wet = Math.max(wet, 1 - smooth(0.3, 1.6, d)); } }
    for (const p of POOLS) { const dx = (x - p.x) / p.rx, dz = (z - p.z) / p.rz, e = Math.sqrt(dx * dx + dz * dz); if (e < 2.2) { h -= 1.1 * (1 - smooth(0.55, 1.35, e)); wet = Math.max(wet, 1 - smooth(0.9, 1.7, e)); } }
    // the coast: the moor lifts to a cliff top along the sea, then drops sheer to the sea floor
    let sea = 0;
    { let d = sd(SEA, x, z, 90); if (d < 90) {
      d += 2.2 * fbm(x / 11, z / 11, 2);
      const top = 13.5 + 2.5 * fbm(x / 40, z / 40, 2); h = mix(h, Math.max(h, top), smooth(70, 6, d));
      const bed = -4.5 - Math.min(9, Math.max(0, -d) * 0.12) + 1.2 * fbm(x / 25, z / 25, 2), t = smooth(-7.5, 0.2, d);
      const step = 0.82 + 0.18 * smooth(-4.4, -3.2, d);                // a little ledge part-way down
      h = mix(bed, h * step + (1 - step) * (h - 3), t); sea = 1 - t; rock = Math.max(rock, smooth(4, -1, d) * (1 - smooth(-9, -7, d)));
    } }
    // the beacon crag: sheer sides out of the sea, a ledge for the airship on its south-west, a high shelf under the dead tower
    { const c = sd(CRAG, x, z, 30); if (c < 4) {
      const ins = -c + 1.5 * fbm(x / 9, z / 9, 2); let hc = 25 + 20 * smooth(0, 75, ins) + 2.5 * fbm(x / 14, z / 14, 3);
      const l = sd(LEDGE, x, z, 20); if (l < 6) hc = mix(hc, 12.5, smooth(5, -3, l));
      const t2 = sd(TOP, x, z, 20); if (t2 < 8) hc = mix(hc, 47, smooth(6, -5, t2));
      const t = smooth(-0.5, 4.5, ins); h = mix(h, hc, t); rock = Math.max(rock, t * (1 - smooth(-6, 4, l) * 0.8) * (1 - smooth(-5, 3, t2) * 0.6)); sea *= 1 - t;
    } }
    for (const r of ROCKS) { const d = Math.hypot(x - r.x, z - r.z); if (d < r.r * 2.2) { const k = 1 - smooth(r.r * 0.5, r.r * 1.6, d + 0.6 * vn(x / 1.7, z / 1.7)); h = Math.max(h, mix(h, r.pier ? 3.2 : 2.4 + 1.2 * vn(x / 2.3, z / 2.3), k)); rock = Math.max(rock, k); } }
    // the fairground: level, and trampled all over (worn enough everywhere inside its outline that no encounter starts in it)
    let fg = 0;
    if (FG) { const d = sd(FG.P, x, z, FG.blend + 2); if (d < FG.blend + 2) { h = mix(h, FG.level, 1 - smooth(-2, FG.blend, d)); fg = 1 - smooth(-4, 4, d + 2 * vn(x / 5, z / 5)); } }
    // the places: their painted ground is flat, at their own height
    let place = 0, fair = fg * (0.45 + 0.4 * smooth(-0.15, 0.25, fbm(x / 16, z / 16, 2)));
    for (const P of PLACES) { const d = sd(P.P, x, z, P.blend + 2); if (d < P.blend + 2) { const k = 1 - smooth(-1, P.blend, d); h = mix(h, P.base, k); place = Math.max(place, 1 - smooth(-1, 2, d)); if (P.fair) fair = Math.max(fair, 1 - smooth(-3, 5, d + 1.5 * vn(x / 3, z / 3))); } }
    // roads: worn earth, and the bumps taken out of them
    let road = 0;
    for (const L of ROADS) { if (boxGap(L, x, z) > L.w) continue; const d = dist(L, x, z, L.w) + 0.45 * vn(x / 1.8, z / 1.8); road = Math.max(road, (1 - smooth(L.w / 2 - 0.5, L.w / 2 + 0.9, d)) * L.k); }
    if (FG && fg > 0) for (const L of FG.lanes) { if (boxGap(L, x, z) > L.w) continue; const d = dist(L, x, z, L.w) + 0.45 * vn(x / 1.8, z / 1.8); road = Math.max(road, (1 - smooth(L.w / 2 - 0.5, L.w / 2 + 0.9, d)) * L.k); }
    // the small bumps of rough ground, but not on the roads, in the places or under water
    h += 0.22 * fbm(x / 4.5, z / 4.5, 2) * (1 - road) * (1 - place) * (1 - sea) * (1 - 0.7 * fg);
    out.h = h; out.road = road; out.fair = fair; out.rock = rock; out.wet = wet; out.place = place; out.sea = sea; out.marsh = marsh * (1 - place) * (1 - sea); out.field = field * (1 - place) * (1 - road); return out;
  }
  function height(x, z) { return at(x, z).h; }

  // ---- a square of land, for drawing: (n+1) x (n+1) points every size/n metres, and a skirt hanging from its edge to hide the seams
  // where a neighbour is drawn at another level of detail ----
  function chunk(x0, z0, size, n) {
    const e = size / n, N = n + 3, H = new Float32Array(N * N);            // heights with one extra ring, for the normals
    const nv = (n + 1) * (n + 1) + 4 * (n + 1), pos = new Float32Array(nv * 3), nrm = new Int8Array(nv * 4), w = new Uint8Array(nv * 4), w2 = new Uint8Array(nv * 4);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) H[j * N + i] = height(x0 + (i - 1) * e, z0 + (j - 1) * e);
    let v = 0; const put = (i, j, drop) => {
      const x = x0 + i * e, z = z0 + j * e, g = at(x, z), c = (j + 1) * N + i + 1;
      pos[v * 3] = x; pos[v * 3 + 1] = g.h - drop; pos[v * 3 + 2] = z;
      const nx = H[c - 1] - H[c + 1], nz = H[c - N] - H[c + N], ny = 2 * e, l = Math.hypot(nx, ny, nz);
      nrm[v * 4] = Math.round(nx / l * 127); nrm[v * 4 + 1] = Math.round(ny / l * 127); nrm[v * 4 + 2] = Math.round(nz / l * 127);
      w[v * 4] = Math.round(g.road * 255); w[v * 4 + 1] = Math.round(g.fair * 255); w[v * 4 + 2] = Math.round(g.rock * 255); w[v * 4 + 3] = Math.round(Math.max(g.wet, g.sea) * 255);
      w2[v * 4] = Math.round(g.marsh * 255); w2[v * 4 + 1] = Math.round(g.field * 255); v++;                      // the second weights: marsh (and the river's banks), farm fields
    };
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) put(i, j, 0);
    const drop = 1.5 + e * 1.5;
    for (let i = 0; i <= n; i++) put(i, 0, drop); for (let i = 0; i <= n; i++) put(i, n, drop); for (let j = 0; j <= n; j++) put(0, j, drop); for (let j = 0; j <= n; j++) put(n, j, drop);
    return { pos, nrm, w, w2 };
  }
  // the triangles of a square of n x n, the same for every square of that detail
  function indices(n) {
    const g = (i, j) => j * (n + 1) + i, s0 = (n + 1) * (n + 1), sk = (k, i) => s0 + k * (n + 1) + i, idx = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = g(i, j), b = g(i + 1, j), c = g(i, j + 1), d = g(i + 1, j + 1); if ((i + j) & 1) idx.push(a, c, b, b, c, d); else idx.push(a, c, d, a, d, b); }
    for (let i = 0; i < n; i++) { idx.push(g(i, 0), g(i + 1, 0), sk(0, i), g(i + 1, 0), sk(0, i + 1), sk(0, i)); idx.push(g(i, n), sk(1, i), g(i + 1, n), g(i + 1, n), sk(1, i), sk(1, i + 1)); }
    for (let j = 0; j < n; j++) { idx.push(g(0, j), sk(2, j), g(0, j + 1), g(0, j + 1), sk(2, j), sk(2, j + 1)); idx.push(g(n, j), g(n, j + 1), sk(3, j), g(n, j + 1), sk(3, j + 1), sk(3, j)); }
    return idx;
  }
  return { WL, at, height, chunk, indices, vn, fbm, smooth, dist, sd, prep, POOLS, ROADS, WALLS, PLACES, TOR, FG };
}
if (typeof module !== 'undefined') module.exports = { makeLand };
