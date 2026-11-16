// ranger.js: the Ranger of the Moon Faire (bow, sword and knives; her magic strengthens her own attacks). Built on the code of the Jester (models/jester-3d).
// Code-built three.js r128 model (global THREE). Defines makeJester(opts) only.
// Units are meters, Y up, feet on y = 0. She faces +Z (the audience); her left is +X, which is also the side her
// spells fly to, as in her sprite sheets (the target stands at screen right).
// Interface (the same Model Build Spec as Io and Sol): root, fx, skeleton, bones, animate(phase, wb, t, dt),
// play(name, force), ACTIONS (dur, hits, cues), anchor(name, out), state, setFade(f), reset(), busy, action, progress.
function makeRanger(opts) {
  'use strict';
  opts = opts || {};
  // detail 0.5 to 1 scales segment counts and cloth resolution for slower phones
  const LOD = opts.lod || {};
  const DET = Math.max(LOD.minDetail || 0.5, Math.min(1, opts.detail == null || !Number.isFinite(+opts.detail) ? 1 : +opts.detail));
  const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));
  const TAU = Math.PI * 2, PI = Math.PI, DEG = Math.PI / 180;
  let seed = 4242;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + (b - a) * rnd();
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = (e0, e1, x) => { const u = cl((x - e0) / (e1 - e0), 0, 1); return u * u * (3 - 2 * u); };
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  // value noise (deterministic)
  const h1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const h2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(h2(xi, yi), h2(xi + 1, yi), u), lerp(h2(xi, yi + 1), h2(xi + 1, yi + 1), u), v);
  }
  const fbm = (x, y) => vnoise(x, y) * 0.5 + vnoise(x * 2.03, y * 2.03) * 0.25 + vnoise(x * 4.01, y * 4.01) * 0.125 + vnoise(x * 8.1, y * 8.1) * 0.0625;
  // piecewise-linear lookup through [[x, v], ...] (v a number or an array), smooth between keys
  function prof(keys, x, smooth) {
    if (keys[0][0] > keys[keys.length - 1][0]) keys = keys._rev || (keys._rev = keys.slice().reverse());
    if (x <= keys[0][0]) return keys[0][1];
    const n = keys.length;
    if (x >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 1; while (keys[i][0] < x) i++;
    let u = (x - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
    if (smooth) u = u * u * (3 - 2 * u);
    const a = keys[i - 1][1], b = keys[i][1];
    if (typeof a === 'number') return a + (b - a) * u;
    return a.map((v, k) => v + (b[k] - v) * u);
  }
  // Catmull-Rom through numbers at uniform spacing; ps = [p0, p1, ...], x in 0..n-1
  function crom(ps, x) {
    const n = ps.length; x = cl(x, 0, n - 1);
    const i = Math.min(n - 2, Math.floor(x)), u = x - i;
    const p0 = ps[Math.max(0, i - 1)], p1 = ps[i], p2 = ps[i + 1], p3 = ps[Math.min(n - 1, i + 2)];
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
  }
  const TEXLIST = [];
  const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  // a smooth curve through [[x, v], ...] (x rising; v a number or a list), with no flat spots at the keys
  const spline = (K, x) => {
    const n = K.length; let i = 0; while (i < n - 2 && K[i + 1][0] < x) i++;
    const x0 = K[i][0], x1 = K[i + 1][0], dx = x1 - x0, t = cl((x - x0) / dx, 0, 1), t2 = t * t, t3 = t2 * t;
    const one = (c) => { const g = (j) => (c == null ? K[j][1] : K[j][1][c]), v0 = g(i), v1 = g(i + 1);
      const m0 = i > 0 ? (v1 - g(i - 1)) / (x1 - K[i - 1][0]) : (v1 - v0) / dx, m1 = i < n - 2 ? (g(i + 2) - v0) / (K[i + 2][0] - x0) : (v1 - v0) / dx;
      return (2 * t3 - 3 * t2 + 1) * v0 + (t3 - 2 * t2 + t) * dx * m0 + (-2 * t3 + 3 * t2) * v1 + (t3 - t2) * dx * m1; };
    return typeof K[0][1] === 'number' ? one(null) : K[0][1].map((v, c) => one(c));
  };
  const ctex = (c, rx, ry, srgb) => {
    const t = new THREE.CanvasTexture(c); TEXLIST.push(t);
    if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); }
    t.anisotropy = 4; if (srgb !== false) t.encoding = THREE.sRGBEncoding; return t;
  };
  const TEXS = Math.max(0.25, Math.min(1, opts.textureScale == null ? 1 : +opts.textureScale)); // canvas size scale

  // ---------- palette, sampled from her sprite sheets ----------
  const PAL = {
    skin: '#fccfb0', skinSh: '#d39a84', blush: '#e88f88', lip: '#b02c46',
    black: '#141016', soft: '#231c26', char: '#2e2630',
    wine: '#7a1f43', wineDk: '#4c1029', magenta: '#b8407e', rose: '#d2617f',
    gold: '#d6a84e', goldHi: '#f5d98a', goldDk: '#8f6a25', orange: '#d98a3a',
    olive: '#6f5a2a', oliveHi: '#9a8040', oliveDk: '#3c3018',
    purple: '#7a4298', purpleHi: '#9c66ba', purpleDk: '#3c1e54', lace: '#63305e', laceHi: '#864a80',
    teal: '#3fc2b4', tealDk: '#1d7f86', white: '#e9e4ee', violet: '#b35cff', spell: '#d58bff'
  };
  // ---------- the Ranger's proportion tables (written by tools/tables.py from her paintings; edit them there) ----------
  const R_TY0 = 0.76, R_TY1 = 1.405, R_TPW = 2.3;
  const R_TORSO = [[0.76, [0.176, 0.08, -0.086]], [0.8, [0.187, 0.09, -0.118]], [0.85, [0.186, 0.0985, -0.1325]], [0.9, [0.177, 0.094, -0.1435]], [0.95, [0.16, 0.1035, -0.1315]], [1.0, [0.141, 0.1115, -0.099]], [1.05, [0.12, 0.107, -0.071]], [1.1, [0.102, 0.11, -0.0605]], [1.15, [0.113, 0.114, -0.071]], [1.2, [0.126, 0.109, -0.1035]], [1.25, [0.131, 0.099, -0.1085]], [1.29, [0.15, 0.078, -0.11]], [1.325, [0.16, 0.055, -0.102]], [1.342, [0.15, 0.042, -0.095]], [1.356, [0.112, 0.035, -0.089]], [1.37, [0.08, 0.03, -0.084]], [1.385, [0.062, 0.027, -0.08]], [1.405, [0.05, 0.024, -0.078]]];
  const R_BUST = {"amp": 0.034, "x": 0.062, "y": 1.215, "sx": 0.046, "sy": 0.052, "dip": 0.004, "dipx": 0.016, "dipy": 1.24, "dipsy": 0.045};
  const R_LEG = [[0.875, [0.092, 0.098, 0.104, 0.092, -0.01]], [0.8, [0.09, 0.096, 0.106, 0.092, -0.01]], [0.74, [0.083, 0.092, 0.092, 0.091, 0.0]], [0.7, [0.075, 0.087, 0.087, 0.09, -0.001]], [0.66, [0.067, 0.0805, 0.0805, 0.09, 0.0]], [0.62, [0.061, 0.0715, 0.0715, 0.089, 0.001]], [0.58, [0.0565, 0.0655, 0.0655, 0.088, 0.0]], [0.54, [0.054, 0.064, 0.064, 0.087, -0.002]], [0.51, [0.052, 0.0615, 0.0595, 0.086, -0.007]], [0.48, [0.054, 0.057, 0.061, 0.086, -0.015]], [0.45, [0.0575, 0.057, 0.066, 0.085, -0.02]], [0.42, [0.0595, 0.0585, 0.071, 0.085, -0.022]], [0.38, [0.055, 0.056, 0.067, 0.084, -0.022]], [0.34, [0.047, 0.05, 0.056, 0.083, -0.02]], [0.3, [0.042, 0.045, 0.047, 0.082, -0.018]], [0.24, [0.038, 0.041, 0.041, 0.082, -0.016]]];
  const R_KNEE_Y = 0.51, R_SHOULDER = [0.15, 1.3, -0.02];

  // ---------- skeleton: every bone rests unrotated, so a rest position is all a bone needs ----------
  const bones = [], BI = {}, SK = {};
  function addBone(name, parent, x, y, z) {
    const b = new THREE.Bone(); b.name = name; b.userData.rest = V3(x, y, z);
    const p = parent ? SK[parent] : null;
    if (p) { b.position.copy(b.userData.rest).sub(p.userData.rest); p.add(b); } else b.position.set(x, y, z);
    b.userData.home = b.position.clone();
    SK[name] = b; BI[name] = bones.length; bones.push(b); return b;
  }
  const A_POSE = 15 * DEG;                       // arms rest this far out from straight down
  const L_UARM = 0.245, L_FARM = 0.225, L_THIGH = 0.835 - R_KNEE_Y, L_SHIN = R_KNEE_Y - 0.105;      // her knee sits higher than the Jester knee (0.47)
  addBone('hips', null, 0, 0.86, 0);
  addBone('spine1', 'hips', 0, 0.975, 0.004);
  addBone('spine2', 'spine1', 0, 1.085, 0.004);
  addBone('spine3', 'spine2', 0, 1.20, -0.002);
  addBone('neck', 'spine3', 0, 1.335, -0.012);
  addBone('head', 'neck', 0, 1.405, -0.004);
  const SIDES = [['R', -1], ['L', 1]];
  const armDir = {}, restPts = {};
  for (const [S, s] of SIDES) {
    const d = V3(s * Math.sin(A_POSE), -Math.cos(A_POSE), 0); armDir[S] = d;
    const sh = V3(s * R_SHOULDER[0], R_SHOULDER[1], R_SHOULDER[2]), el = sh.clone().addScaledVector(d, L_UARM), wr = el.clone().addScaledVector(d, L_FARM);
    restPts['sh' + S] = sh; restPts['el' + S] = el; restPts['wr' + S] = wr;
    addBone('clav' + S, 'spine3', s * 0.035, 1.295, 0);
    addBone('uarm' + S, 'clav' + S, sh.x, sh.y, sh.z);
    addBone('farm' + S, 'uarm' + S, el.x, el.y, el.z);
    addBone('hand' + S, 'farm' + S, wr.x, wr.y, wr.z);
    addBone('thigh' + S, 'hips', s * 0.085, 0.835, 0);
    addBone('shin' + S, 'thigh' + S, s * 0.083, R_KNEE_Y, 0.006);
    addBone('foot' + S, 'shin' + S, s * 0.081, 0.105, -0.012);
    addBone('toe' + S, 'foot' + S, s * 0.081, 0.035, 0.088);
  }
  // a point of the canonical right hand (fingers along -Y, palm toward +X, thumb toward +Z), placed on either wrist
  const HAND_S = opts.handScale || 0.93;         // Chris: the hands a little smaller (November 11); everything of the hand is placed through handPt, so it all shrinks about the wrist
  function handPt(s, x, y, z, out) {
    x *= HAND_S; y *= HAND_S; z *= HAND_S;
    const c = Math.cos(s * A_POSE), sn = Math.sin(s * A_POSE), mx = -s * x;   // mirror for the left hand
    const w = restPts['wr' + (s < 0 ? 'R' : 'L')];
    return (out || V3()).set(w.x + mx * c - y * sn, w.y + mx * sn + y * c, w.z + z);
  }
  // a direction of the canonical hand, turned onto either wrist
  function handDir(s, x, y, z, out) {
    const c = Math.cos(s * A_POSE), sn = Math.sin(s * A_POSE), mx = -s * x;
    return (out || V3()).set(mx * c - y * sn, mx * sn + y * c, z);
  }
  // fingers: [name, knuckle z, knuckle y, length from the knuckle, radius, splay (radians toward the thumb), knuckle-to-web distance]
  // read off the young-hand painting: 1 pixel = 0.2366 mm, the middle finger's axis at z 0.0085, its web at y -0.089.
  // The knuckle joints sit inside the back of the hand, a little above the webs, as on a real hand.
  const FINGERS = [['idx', 0.0291, -0.0725, 0.0916, 0.0073, 1.5 * DEG, 0.013], ['mid', 0.0085, -0.0760, 0.0970, 0.0071, 0, 0.013], ['rng', -0.0100, -0.0725, 0.0897, 0.0067, -1.6 * DEG, 0.013], ['pnk', -0.0282, -0.0709, 0.0633, 0.0058, -5.0 * DEG, 0.011]];
  const PHAL = [0.50, 0.255, 0.245];
  const fingerDir = (a) => [0, -Math.cos(a), Math.sin(a)];
  // the thumb's first bone lies inside the heel of the hand, from the wrist to where the thumb comes free
  const THUMB = { base: [0.008, -0.0062, 0.0286], dir: [0.12, -0.92, 0.37], len: [0.0432, 0.0310, 0.0256], r: 0.0077, roll: 60 * DEG };
  for (const [S, s] of SIDES) {
    for (const [fn, fz, fy, fl, fr, fa] of FINGERS) {
      let par = 'hand' + S, t = 0; const fd = fingerDir(fa);
      for (let k = 0; k < 3; k++) { const p = handPt(s, 0, fy + fd[1] * t, fz + fd[2] * t); addBone(fn + k + S, par, p.x, p.y, p.z); par = fn + k + S; t += fl * PHAL[k]; }
    }
    const td = V3(...THUMB.dir).normalize(); let tp = V3(...THUMB.base), par = 'hand' + S;
    for (let k = 0; k < 3; k++) { const p = handPt(s, tp.x, tp.y, tp.z); addBone('thb' + k + S, par, p.x, p.y, p.z); par = 'thb' + k + S; tp = tp.clone().addScaledVector(td, THUMB.len[k]); }
  }

  // ---------- geometry buckets: every piece is weighted to bones, then merged into one skinned mesh per material ----------
  const buckets = {};
  const bucket = (key) => buckets[key] || (buckets[key] = { pos: [], nor: [], uv: [], si: [], sw: [], idx: [], n: 0 });
  const wOne = (name) => { const a = [BI[name], 1]; return () => a; };
  function computeNormals(pos, idx, weld) {
    const n = pos.length / 3, nor = new Float32Array(n * 3);
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
      const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      nor[a] += nx; nor[a + 1] += ny; nor[a + 2] += nz; nor[b] += nx; nor[b + 1] += ny; nor[b + 2] += nz; nor[c] += nx; nor[c + 1] += ny; nor[c + 2] += nz;
    }
    if (weld !== false) {                         // seams and caps share positions: share their normals too
      const map = new Map();
      for (let i = 0; i < n; i++) {
        const k = Math.round(pos[i * 3] * 20000) + ',' + Math.round(pos[i * 3 + 1] * 20000) + ',' + Math.round(pos[i * 3 + 2] * 20000);
        const e = map.get(k); if (e) e.push(i); else map.set(k, [i]);
      }
      for (const g of map.values()) if (g.length > 1) {
        let x = 0, y = 0, z = 0; for (const i of g) { x += nor[i * 3]; y += nor[i * 3 + 1]; z += nor[i * 3 + 2]; }
        for (const i of g) { nor[i * 3] = x; nor[i * 3 + 1] = y; nor[i * 3 + 2] = z; }
      }
    }
    for (let i = 0; i < n; i++) {
      const l = Math.hypot(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]) || 1;
      nor[i * 3] /= l; nor[i * 3 + 1] /= l; nor[i * 3 + 2] /= l;
    }
    return nor;
  }
  // part = { pos: [x,y,z,...], uv: [u,v,...], idx: [...] }; wf(x, y, z, i) -> [bone, weight, ...] (up to 4 pairs)
  // o.out: a point the surface should face away from (winding is fixed to match); o.flip: reverse the winding
  function addPart(key, part, wf, o) {
    o = o || {};
    if (LOD.skip && LOD.skip[key]) return { key, start: 0, count: 0 };
    const srcKey = key; if (LOD.merge && LOD.merge[key]) key = LOD.merge[key];
    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;
    (B.src || (B.src = [])).push([B.n, n, srcKey]);
    let nor = o.nor || computeNormals(pos, idx, o.weld);            // o.nor: normals worked out by the caller
    let flip = !!o.flip;
    if (o.out) {
      let s = 0; const c = o.out;
      for (let i = 0; i < n; i++) s += nor[i * 3] * (pos[i * 3] - c.x) + nor[i * 3 + 1] * (pos[i * 3 + 1] - c.y) + nor[i * 3 + 2] * (pos[i * 3 + 2] - c.z);
      if (s < 0) flip = !flip;
    }
    if (flip) { idx = idx.slice(); for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } for (let i = 0; i < nor.length; i++) nor[i] = -nor[i]; }
    const base = B.n;
    for (let i = 0; i < n; i++) {
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
      B.pos.push(x, y, z); B.nor.push(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]);
      B.uv.push(part.uv ? part.uv[i * 2] : 0, part.uv ? part.uv[i * 2 + 1] : 0);
      const w = wf(x, y, z, i); let s = 0;
      for (let k = 1; k < w.length; k += 2) s += w[k];
      for (let k = 0; k < 4; k++) { B.si.push(k * 2 < w.length ? w[k * 2] : 0); B.sw.push(k * 2 < w.length ? w[k * 2 + 1] / s : 0); }
    }
    for (let i = 0; i < idx.length; i++) B.idx.push(idx[i] + base);
    B.n += n;
    return { key, start: base, count: n };
  }
  // a loft through rings of points ([x,y,z] each); the seam column is doubled so u can run 0..1
  function loft(rings, o) {
    o = o || {};
    const m = rings.length, n = rings[0].length, open = !!o.open, cols = open ? n : n + 1;
    const pos = [], uv = [], idx = [];
    for (let i = 0; i < m; i++) for (let j = 0; j < cols; j++) {
      const p = rings[i][j % n]; pos.push(p[0], p[1], p[2]);
      uv.push((o.u0 || 0) + (o.uS == null ? 1 : o.uS) * (j / (cols - 1)), o.v ? o.v[i] : (o.v0 || 0) + (o.vS == null ? 1 : o.vS) * (i / (m - 1)));
    }
    for (let i = 0; i < m - 1; i++) for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j, b = a + 1, c = a + cols, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const cap = (i, rev) => {
      let cx = 0, cy = 0, cz = 0; for (const p of rings[i]) { cx += p[0]; cy += p[1]; cz += p[2]; }
      const k = pos.length / 3; pos.push(cx / n, cy / n, cz / n); uv.push(0.5, o.v ? o.v[i] : i / (m - 1));
      for (let j = 0; j < n; j++) { const a = i * cols + j, b = i * cols + (j + 1) % cols; if (rev) idx.push(k, b, a); else idx.push(k, a, b); }
    };
    if (o.capA) cap(0, false);
    if (o.capB) cap(m - 1, true);
    return { pos, uv, idx };
  }
  // a ring in a horizontal plane: angle 0 at the front (+Z), a quarter turn at her left (+X); pw > 2 squares it off
  function ringXZ(cx, y, cz, rx, rzF, rzB, n, pw, fn) {
    const out = [], e = 2 / (pw || 2);
    for (let j = 0; j < n; j++) {
      const a = (j / n) * TAU, s = Math.sin(a), c = Math.cos(a);
      let x = rx * Math.sign(s) * Math.pow(Math.abs(s), e), z = (c >= 0 ? rzF : (rzB == null ? rzF : rzB)) * Math.sign(c) * Math.pow(Math.abs(c), e);
      const p = [cx + x, y, cz + z];
      out.push(fn ? fn(p, a, j) : p);
    }
    return out;
  }
  // a tube along a polyline of centers with radii (number or [ra, rb]); returns rings (parallel-transported frames)
  function tubeRings(pts, radii, n, up0, twist) {
    const rings = [], m = pts.length; let N = null, Bv = null, T0 = null;
    for (let i = 0; i < m; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(m - 1, i + 1)];
      const T = V3(b.x - a.x, b.y - a.y, b.z - a.z).normalize();
      if (!N) { N = (up0 ? up0.clone() : (Math.abs(T.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0))); N.addScaledVector(T, -N.dot(T)).normalize(); }
      else { const q = new THREE.Quaternion().setFromUnitVectors(T0, T); N.applyQuaternion(q); N.addScaledVector(T, -N.dot(T)).normalize(); }
      Bv = V3().crossVectors(T, N); T0 = T.clone();
      const r = radii[i], ra = typeof r === 'number' ? r : r[0], rb = typeof r === 'number' ? r : r[1], ring = [], tw = twist ? twist * i / (m - 1) : 0;
      for (let j = 0; j < n; j++) {
        const ang = (j / n) * TAU + tw, c = Math.cos(ang) * ra, s = Math.sin(ang) * rb;
        ring.push([pts[i].x + N.x * c + Bv.x * s, pts[i].y + N.y * c + Bv.y * s, pts[i].z + N.z * c + Bv.z * s]);
      }
      rings.push(ring);
    }
    return rings;
  }
  const centroidOf = (rings) => { let x = 0, y = 0, z = 0, k = 0; for (const r of rings) for (const p of r) { x += p[0]; y += p[1]; z += p[2]; k++; } return V3(x / k, y / k, z / k); };
  // smooth points through control points (Catmull-Rom), returning n Vector3
  function curvePts(ctrl, n) {
    const c = new THREE.CatmullRomCurve3(ctrl.map((p) => (p.isVector3 ? p : V3(p[0], p[1], p[2]))), false, 'centripetal');
    return c.getPoints(n - 1);
  }
  // a UV sphere as a part (optionally squashed), centered at c
  function spherePart(c, rx, ry, rz, nu, nv) {
    const rings = [];
    for (let i = 0; i <= nv; i++) {
      const ph = (i / nv) * PI, y = Math.cos(ph), r = Math.max(1e-4, Math.sin(ph));
      rings.push(ringXZ(c.x, c.y + y * ry, c.z, rx * r, rz * r, rz * r, nu));
    }
    return loft(rings);
  }

  // ---------- textures painted in code, in her palette ----------
  const hex = (c) => { const v = parseInt(c.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  const rgba = (c, a) => { const [r, g, b] = hex(c); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
  // ---------- the painted references, baked: window.JESTER_TEX (or opts.textures) holds them as images ----------
  const BAKED = (opts.textures !== undefined ? opts.textures : (typeof window !== 'undefined' ? window.RANGER_TEX : null)) || null;
  const UPK = opts.upperScale || 0.97;             // scale of everything above the waist (applied to the first spine bone after the bind)
  const bakedImgs = {}, SKIN = (BAKED && BAKED.skin) || null;
  if (SKIN) PAL.skin = '#' + hex(SKIN).map((v) => Math.min(255, Math.round(v * 1.14)).toString(16).padStart(2, '0')).join('');   // lit cloth-side skin (the open neckline) is painted a little lighter than the self-lit face
  function onBaked(key, cb, url) {                 // cb(image) once it has decoded; false when nothing is baked under that name
    url = url || (BAKED && key && BAKED[key]);
    if (!BAKED || !url || typeof url !== 'string') return false;
    let e = bakedImgs[key];
    if (!e) { e = bakedImgs[key] = { img: new Image(), cbs: [], ok: false }; e.img.onload = () => { e.ok = true; const l = e.cbs; e.cbs = []; l.forEach((f) => f(e.img)); }; e.img.src = url; }
    if (e.ok) cb(e.img); else e.cbs.push(cb);
    return true;
  }
  function soleTex() {                               // ridged rubber: fine level grooves all the way up the wall of the sole (v is height, 0 to 7 cm)
    const W = Math.round(256 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), N = 30, seed0 = seed; seed = 4711;      // its own dice, so nothing else's pattern shifts
    g.fillStyle = '#1d1a1c'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < N; i++) { const y = (i + 0.5) / N * H, h = H / N; g.fillStyle = '#070607'; g.fillRect(0, y - h * 0.5, W, h * 0.34); g.fillStyle = 'rgba(92,86,90,0.55)'; g.fillRect(0, y - h * 0.10, W, h * 0.22); }
    for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '120,112,116' : '0,0,0') + ',' + rr(0.03, 0.10) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(8, 60) * TEXS, rr(1, 2.2) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
  }
  function sockTex() {                               // a ribbed cream sock with two grey stripes near its top
    const W = Math.round(512 * TEXS), H = Math.round(128 * TEXS), c = cvs(W, H), g = c.getContext('2d'), N = 46, seed0 = seed; seed = 9001;
    g.fillStyle = '#d6cfc2'; g.fillRect(0, 0, W, H);
    for (const [v0, v1] of [[0.685, 0.735], [0.785, 0.835]]) { g.fillStyle = '#4b484d'; g.fillRect(0, (1 - v1) * H, W, (v1 - v0) * H); }
    for (let i = 0; i < N; i++) { const x = (i + 0.5) / N * W, w = W / N; g.fillStyle = 'rgba(40,34,30,0.42)'; g.fillRect(x - w * 0.5, 0, w * 0.22, H); g.fillStyle = 'rgba(255,250,240,0.20)'; g.fillRect(x - w * 0.08, 0, w * 0.30, H); }
    for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '255,255,250' : '60,52,46') + ',' + rr(0.03, 0.09) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(1, 3) * TEXS, rr(1, 4) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
  }
  function crinkleTex() {                            // the creases of patent leather, as a normal map that tiles
    const S = Math.round(256 * TEXS), h = new Float32Array(S * S), c = cvs(S, S), g = c.getContext('2d'), im = g.createImageData(S, S), d = im.data, seed0 = seed; seed = 2026;
    for (let k = 0; k < 44; k++) {
      const cx = rnd() * S, cy = rnd() * S, th = rr(-0.55, 0.55) + (rnd() < 0.12 ? PI / 2 : 0), L = rr(22, 70) * TEXS, w = rr(5, 11) * TEXS, amp = rr(0.5, 1.3) * (rnd() < 0.6 ? 1 : -1), ct = Math.cos(th), st = Math.sin(th), R = Math.ceil(L * 2.2);
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const al = dx * ct + dy * st, ac = -dx * st + dy * ct + 0.6 * w * Math.sin(al / L * 2.2); if (Math.abs(ac) > w * 3 || Math.abs(al) > L * 2.2) continue;
        const x = ((Math.round(cx) + dx) % S + S) % S, y = ((Math.round(cy) + dy) % S + S) % S; h[y * S + x] += amp * Math.exp(-ac * ac / (w * w)) * Math.exp(-al * al / (L * L));
      }
    }
    for (let k = 0; k < 30; k++) { const cx = rnd() * S, cy = rnd() * S, r = rr(14, 40) * TEXS, amp = rr(-1.2, 1.2), R = Math.ceil(r * 2.2); for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const x = ((Math.round(cx) + dx) % S + S) % S, y = ((Math.round(cy) + dy) % S + S) % S; h[y * S + x] += amp * Math.exp(-(dx * dx + dy * dy) / (r * r)); } }
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const gx = h[y * S + (x + 1) % S] - h[y * S + (x + S - 1) % S], gy = h[((y + 1) % S) * S + x] - h[((y + S - 1) % S) * S + x], k = 0.62 / TEXS, nx = -gx * k, ny = gy * k, l = Math.hypot(nx, ny, 1), o = (y * S + x) * 4;
      d[o] = 127.5 + 127.5 * nx / l; d[o + 1] = 127.5 + 127.5 * ny / l; d[o + 2] = 127.5 + 127.5 / l; d[o + 3] = 255;
    }
    g.putImageData(im, 0, 0); seed = seed0; return ctex(c, 1, 1, false);
  }
  function bakedTex(key, W, H, fill) {             // a canvas that becomes the baked image once it has decoded
    W = Math.round(W * TEXS); H = Math.round(H * TEXS);
    const c = cvs(W, H), g = c.getContext('2d'); g.fillStyle = fill; g.fillRect(0, 0, W, H);
    const t = ctex(c); onBaked(key, (im) => { g.drawImage(im, 0, 0, W, H); t.needsUpdate = true; }); return t;
  }
  function tileBaked(g, im, W, H, nx, ny) {        // mirrored tiles, so a painted swatch repeats without a seam
    const tw = W / nx, th = H / ny;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      g.save(); g.translate(i * tw + (i % 2 ? tw : 0), j * th + (j % 2 ? th : 0)); g.scale(i % 2 ? -1 : 1, j % 2 ? -1 : 1);
      g.drawImage(im, 0, 0, tw + 0.6, th + 0.6); g.restore();
    }
  }
  function blobs(g, W, H, n, cols, rmin, rmax, amin, amax, mode) {
    g.save(); if (mode) g.globalCompositeOperation = mode;
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = rnd() * H, r = rr(rmin, rmax), c = cols[(rnd() * cols.length) | 0], a = rr(amin, amax);
      for (const dx of [0, -W, W]) {
        if (x + dx + r < 0 || x + dx - r > W) continue;
        const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r); gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.fillRect(x + dx - r, y - r, r * 2, r * 2);
      }
    }
    g.restore();
  }
  function dot(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  function star4(g, x, y, r) {
    g.beginPath(); g.moveTo(x, y - r);
    g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r);
    g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  }
  // woven fabric with a soft nap: used for velvet and plain cloth
  function fabricTex(S, base, hi, lo, rep, streak, bake, tiles, wash) {
    if (bake && BAKED && BAKED[bake]) S = Math.max(S, 512);
    S = Math.round(S * TEXS); const c = cvs(S, S), g = c.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    blobs(g, S, S, 260, [hi], S * 0.02, S * 0.09, 0.03, 0.10);
    blobs(g, S, S, 200, [lo], S * 0.02, S * 0.10, 0.05, 0.16);
    g.globalAlpha = 0.07;
    for (let i = 0; i < S * 5; i++) { g.fillStyle = rnd() < 0.5 ? hi : lo; const x = rnd() * S, y = rnd() * S; g.fillRect(x, y, streak ? 1 : rr(1, 3), streak ? rr(4, S * 0.06) : 1); }
    g.globalAlpha = 1;
    const t = ctex(c, rep || 1, rep || 1);
    onBaked(bake, (im) => { tileBaked(g, im, S, S, tiles || 2, tiles || 2); if (wash) { g.fillStyle = wash; g.fillRect(0, 0, S, S); } t.needsUpdate = true; });
    return t;
  }
  // sheer veil: color and alpha canvases. o: { top, bottom, stripes, stripeCols, trim, a0, sequins, center, motif }
  function veilTex(W, H, o) {
    W = Math.round(W * TEXS); H = Math.round(H * TEXS);
    const c = cvs(W, H), g0 = c.getContext('2d'), ca = cvs(W, H), ga = ca.getContext('2d'); let g = g0;
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, o.top); gr.addColorStop(0.55, o.mid || o.bottom); gr.addColorStop(1, o.bottom);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 220, o.mottle || [o.top, o.bottom], W * 0.03, W * 0.12, 0.05, 0.22);
    blobs(g, W, H, 60, [o.glow || o.top], W * 0.02, W * 0.07, 0.08, 0.25, 'lighter');
    // long soft streaks that follow the fall of the cloth
    for (let i = 0; i < 160; i++) {
      const x = rnd() * W, w = rr(1, W * 0.012), y0 = rnd() * H * 0.8, l = rr(H * 0.1, H * 0.5);
      const sg = g.createLinearGradient(0, y0, 0, y0 + l), col = rnd() < 0.5 ? (o.glow || o.top) : o.dark || o.bottom;
      sg.addColorStop(0, rgba(col, 0)); sg.addColorStop(0.5, rgba(col, rr(0.08, 0.25))); sg.addColorStop(1, rgba(col, 0));
      g.fillStyle = sg; g.fillRect(x, y0, w, l);
    }
    const folds = (g, kf) => {                    // soft dark valleys between the gold lines, as cloth gathers
      const nf = o.stripes || 12;
      for (let i = 0; i < nf; i++) { const x0 = (i / nf) * W, fg = g.createLinearGradient(x0, 0, x0 + W / nf, 0); fg.addColorStop(0, rgba(o.glow || o.top, 0.16 * kf)); fg.addColorStop(0.5, rgba(o.dark || '#000000', 0.55 * kf)); fg.addColorStop(1, rgba(o.glow || o.top, 0.16 * kf)); g.fillStyle = fg; g.fillRect(x0, 0, W / nf + 1, H); }
    };
    if (o.folds) folds(g, o.folds);
    const cd = cvs(W, H); g = cd.getContext('2d');   // the gold work is painted on its own layer
    const a0 = Math.round(255 * o.a0);
    ga.fillStyle = 'rgb(' + a0 + ',' + a0 + ',' + a0 + ')'; ga.fillRect(0, 0, W, H);
    blobs(ga, W, H, 160, ['#ffffff'], W * 0.02, W * 0.1, 0.03, 0.14);
    blobs(ga, W, H, 160, ['#000000'], W * 0.02, W * 0.1, 0.03, 0.16);
    const both = (fn) => { fn(g, false); fn(ga, true); };
    const gold = [PAL.gold, PAL.goldHi, PAL.orange];
    if (o.motif) {                                // faint brocade diamonds
      g.strokeStyle = rgba(o.motif, 0.35); g.lineWidth = Math.max(1, W / 512);
      const st = W / 14;
      for (let y = -st; y < H + st; y += st) for (let x = -st; x < W + st; x += st) {
        const ox = (Math.round(y / st) % 2) * st / 2;
        g.beginPath(); g.moveTo(x + ox, y - st * 0.3); g.lineTo(x + ox + st * 0.22, y); g.lineTo(x + ox, y + st * 0.3); g.lineTo(x + ox - st * 0.22, y); g.closePath(); g.stroke();
        dot(g, x + ox, y, W / 420, rgba(o.motif, 0.6));
      }
    }
    // dotted gold lines running down the cloth
    const ns = o.stripes || 0;
    for (let i = 0; i <= ns; i++) {
      const x = (i / ns) * W, heavy = o.center && i === ns / 2, col = gold[i % 3];
      const lines = heavy ? [-W * 0.018, -W * 0.006, W * 0.006, W * 0.018] : (i % 2 ? [0] : [-W * 0.004, W * 0.004]);
      for (const dx of lines) {
        const step = heavy ? H / 150 : H / (110 + (i % 3) * 20), r = (heavy ? W / 330 : W / 480) * (o.dotScale || 1);
        for (let y = rnd() * step; y < H; y += step) {
          const jx = (rnd() - 0.5) * r * 0.6, rr2 = r * rr(0.7, 1.25);
          both((q, al) => dot(q, x + dx + jx, y, rr2, al ? '#fff' : (rnd() < 0.25 ? PAL.goldHi : col)));
        }
      }
      if (heavy) {                                // little diamonds down the middle
        for (let y = H * 0.02; y < H; y += H / 28) both((q, al) => { q.fillStyle = al ? '#fff' : PAL.goldHi; star4(q, x, y, W / 110); });
      }
    }
    // scattered sequins
    for (let i = 0; i < (o.sequins || 0); i++) {
      const x = rnd() * W, y = rnd() * H, r = rr(W / 900, W / 420), col = gold[(rnd() * 3) | 0];
      both((q, al) => dot(q, x, y, r, al ? '#eee' : col));
    }
    // hem and side trims: a solid cord, a row of beads, and small scallops
    const tw = H * (o.trim || 0.02);
    both((q, al) => {
      q.fillStyle = al ? '#fff' : PAL.gold; q.fillRect(0, H - tw * 0.35, W, tw * 0.35);
      for (let x = 0; x < W; x += tw * 0.7) { dot(q, x, H - tw * 0.72, tw * 0.22, al ? '#fff' : PAL.goldHi); }
      q.fillStyle = al ? '#fff' : PAL.orange; q.fillRect(0, H - tw * 1.15, W, tw * 0.12);
      const sw = W * (o.sideTrim || 0.008);
      for (const x0 of [0, W - sw]) { q.fillStyle = al ? '#fff' : PAL.gold; q.fillRect(x0, 0, sw, H); }
      for (let y = 0; y < H; y += sw * 1.8) { dot(q, sw * 1.9, y, sw * 0.5, al ? '#fff' : PAL.goldHi); dot(q, W - sw * 1.9, y, sw * 0.5, al ? '#fff' : PAL.goldHi); }
    });
    g0.drawImage(cd, 0, 0);
    const map = ctex(c), alpha = ctex(ca, 0, 0, false);
    if (o.whole) onBaked(o.whole, (im) => onBaked(o.whole + 'A', (ia) => {       // a whole painted cloth: its colours, its gold, its cut hem
      g0.drawImage(im, 0, 0, W, H); ga.drawImage(ia, 0, 0, W, H);
      if (o.wash) { g0.save(); g0.globalCompositeOperation = 'multiply'; g0.fillStyle = o.wash; g0.fillRect(0, 0, W, H); g0.restore(); }
      map.needsUpdate = alpha.needsUpdate = true;
    }));
    else if (o.bake) onBaked(o.bake, (im) => {                                   // a painted swatch under the gold work
      const n = o.bakeTiles || [4, 2]; tileBaked(g0, im, W, H, n[0], n[1]);
      const sh = g0.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, rgba(o.dark || '#000000', 0.45)); sh.addColorStop(0.5, rgba(o.dark || '#000000', 0.12)); sh.addColorStop(1, rgba(o.dark || '#000000', 0)); g0.fillStyle = sh; g0.fillRect(0, 0, W, H);
      if (o.folds) folds(g0, o.folds * 0.7); g0.drawImage(cd, 0, 0); map.needsUpdate = true;
    });
    return { map, alpha };
  }
  // ragged black cloth for the skirt: color and a cut-out alpha with a torn hem and worn holes
  function raggedTex(W, H, base, hi, lo, bake) {
    W = Math.round(W * TEXS); H = Math.round(H * TEXS);
    const c = cvs(W, H), g = c.getContext('2d'), ca = cvs(W, H), ga = ca.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 200, [hi], W * 0.02, W * 0.08, 0.04, 0.14);
    blobs(g, W, H, 200, [lo], W * 0.02, W * 0.1, 0.1, 0.3);
    for (let i = 0; i < 420; i++) {                // gathers
      const x = rnd() * W, y0 = rnd() * H * 0.6, l = rr(H * 0.2, H * 0.8), col = rnd() < 0.45 ? hi : lo;
      const sg = g.createLinearGradient(0, y0, 0, y0 + l); sg.addColorStop(0, rgba(col, 0)); sg.addColorStop(0.5, rgba(col, rr(0.1, 0.3))); sg.addColorStop(1, rgba(col, 0));
      g.fillStyle = sg; g.fillRect(x, y0, rr(1, W * 0.008), l);
    }
    const eg = g.createLinearGradient(0, H * 0.8, 0, H); eg.addColorStop(0, rgba(hi, 0)); eg.addColorStop(1, rgba(hi, 0.35)); g.fillStyle = eg; g.fillRect(0, H * 0.8, W, H * 0.2);
    ga.fillStyle = '#fff'; ga.fillRect(0, 0, W, H); ga.fillStyle = '#000';
    for (let x = 0; x < W;) {                      // torn notches along the hem
      const w = rr(W * 0.006, W * 0.03), d = rr(H * 0.01, H * 0.07);
      ga.beginPath(); ga.moveTo(x, H); ga.lineTo(x + w * rr(0.3, 0.7), H - d); ga.lineTo(x + w, H); ga.closePath(); ga.fill(); x += w * rr(0.6, 1.3);
    }
    for (let i = 0; i < 90; i++) { const x = rnd() * W, y = H * rr(0.72, 0.98); ga.beginPath(); ga.ellipse(x, y, rr(1, W * 0.006), rr(2, H * 0.02), rr(-0.3, 0.3), 0, TAU); ga.fill(); }
    const map = ctex(c);
    onBaked(bake, (im) => {                          // the painted cloth, in shadow under the tier above and catching light along its own hem, so each tier reads
      tileBaked(g, im, W, H, 6, 2);
      const sh = g.createLinearGradient(0, 0, 0, H * 0.45); sh.addColorStop(0, 'rgba(8,5,8,0.62)'); sh.addColorStop(1, 'rgba(8,5,8,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, H * 0.45);
      const e2 = g.createLinearGradient(0, H * 0.84, 0, H); e2.addColorStop(0, rgba(hi, 0)); e2.addColorStop(0.75, rgba(hi, 0.5)); e2.addColorStop(1, rgba(hi, 0.75)); g.fillStyle = e2; g.fillRect(0, H * 0.84, W, H * 0.16);
      map.needsUpdate = true;
    });
    return { map, alpha: ctex(ca, 0, 0, false) };
  }
  // purple leggings with a black flocked floral pattern; the white striped sock band sits at the boot top
  function leggingsTex() {
    const W = Math.round(512 * TEXS), H = Math.round(1024 * TEXS), c = cvs(W, H), g = c.getContext('2d');
    g.fillStyle = PAL.purple; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 140, [PAL.purpleHi], W * 0.04, W * 0.16, 0.08, 0.25);
    blobs(g, W, H, 100, [PAL.purpleDk], W * 0.04, W * 0.14, 0.08, 0.22);
    const ink = '#150c1c';
    for (let i = 0; i < 230; i++) {
      const x = rnd() * W, y = rnd() * H * 0.93, s = rr(W * 0.024, W * 0.056), rot = rnd() * TAU, k = rnd();
      for (const dx of [0, -W, W]) {
        g.save(); g.translate(x + dx, y); g.rotate(rot); g.fillStyle = ink;
        if (k < 0.55) { for (let p = 0; p < 4; p++) { g.rotate(TAU / 4); g.beginPath(); g.ellipse(0, s * 0.62, s * 0.3, s * 0.52, 0, 0, TAU); g.fill(); } dot(g, 0, 0, s * 0.22, ink); }
        else if (k < 0.8) { g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * 0.8, 0, 0, s); g.quadraticCurveTo(-s * 0.8, 0, 0, -s); g.fill(); }
        else { for (let p = 0; p < 5; p++) dot(g, rr(-s, s), rr(-s, s), s * rr(0.1, 0.25), ink); }
        g.restore();
      }
    }
    for (let i = 0; i < 500; i++) dot(g, rnd() * W, rnd() * H * 0.93, rr(0.8, 2.4) * TEXS, ink);
    const y0 = H * 0.930;                             // the leggings run down into the sock, which is its own part now (31_boots.js)
    g.fillStyle = '#0d0a10'; g.fillRect(0, y0, W, H - y0);
    const t = ctex(c);
    onBaked('leggings', (im) => { g.save(); g.beginPath(); g.rect(0, 0, W, y0); g.clip(); tileBaked(g, im, W, y0, 2, 5); g.restore(); t.needsUpdate = true; });
    return t;
  }
  // black ruffle lace: opaque cloth that breaks into a scalloped lace edge (v = 1 is the edge)
  function laceTex() {
    const W = Math.round(512 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), ca = cvs(W, H), ga = ca.getContext('2d');
    g.fillStyle = '#2a2127'; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 120, ['#463a42'], W * 0.02, W * 0.08, 0.08, 0.3);
    for (let i = 0; i < 200; i++) { g.fillStyle = rgba(rnd() < 0.5 ? '#40344a' : '#000000', 0.25); g.fillRect(rnd() * W, 0, rr(1, 3), H); }
    const eg = g.createLinearGradient(0, H * 0.6, 0, H); eg.addColorStop(0, 'rgba(70,58,82,0)'); eg.addColorStop(1, 'rgba(92,78,104,0.55)'); g.fillStyle = eg; g.fillRect(0, H * 0.6, W, H * 0.4);
    ga.fillStyle = '#fff'; ga.fillRect(0, 0, W, H); ga.fillStyle = '#000';
    const n = 16, sw = W / n;
    for (let i = 0; i < n; i++) {
      ga.beginPath(); ga.moveTo(i * sw, H); ga.quadraticCurveTo(i * sw, H * 0.86, i * sw + sw * 0.08, H * 0.86); ga.lineTo(i * sw - sw * 0.08, H * 0.86); ga.closePath(); ga.fill();
      ga.beginPath(); ga.moveTo(i * sw - sw * 0.2, H); ga.quadraticCurveTo(i * sw, H * 0.8, i * sw + sw * 0.2, H); ga.fill();
      for (let k = 0; k < 3; k++) dot(ga, i * sw + sw * (0.3 + 0.2 * k), H * 0.82, sw * 0.055, '#000');
      dot(ga, i * sw + sw * 0.5, H * 0.68, sw * 0.07, '#000');
    }
    const map = ctex(c);
    onBaked('ruffle', (im) => { tileBaked(g, im, W, H, 2, 1); const e2 = g.createLinearGradient(0, H * 0.45, 0, H); e2.addColorStop(0, 'rgba(104,92,112,0)'); e2.addColorStop(1, 'rgba(112,98,120,0.34)'); g.fillStyle = e2; g.fillRect(0, H * 0.45, W, H * 0.55);
      const e3 = g.createLinearGradient(0, 0, 0, H * 0.5); e3.addColorStop(0, 'rgba(0,0,0,0.5)'); e3.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = e3; g.fillRect(0, 0, W, H * 0.5); map.needsUpdate = true; });
    return { map, alpha: ctex(ca, 0, 0, false) };
  }

  // ---------- material helpers ----------
  const lin = (c) => new THREE.Color(c).convertSRGBToLinear();     // r128 takes material colours as linear values
  function sheen(mat, col, pw, k, shot) {            // a soft rim, the way velvet and sheer cloth catch light at a glancing angle
    mat.userData.sheen = { c: lin(col), p: pw, k: k };
    // shot: { c, k, p } makes the cloth two-toned, like silk woven from two colours: it keeps its own colour where you look straight
    // at it and turns toward the second colour where it turns away from you, so every fold shows both
    const sh2 = shot ? { c: lin(shot.c), k: shot.k, p: shot.p || 1.4 } : { c: lin('#000000'), k: 0, p: 1 };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uSheenC = { value: mat.userData.sheen.c }; sh.uniforms.uSheenP = { value: mat.userData.sheen.p }; sh.uniforms.uSheenK = { value: mat.userData.sheen.k };
      sh.uniforms.uShotC = { value: sh2.c }; sh.uniforms.uShotK = { value: sh2.k }; sh.uniforms.uShotP = { value: sh2.p };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSheenC; uniform float uSheenP; uniform float uSheenK; uniform vec3 uShotC; uniform float uShotK; uniform float uShotP;')
        .replace('#include <tonemapping_fragment>', 'float sNV = saturate(abs(dot(normalize(vViewPosition), normal)));\n float sFr = pow(1.0 - sNV, uSheenP);\n if (uShotK > 0.0) { float sT = smoothstep(0.10, 0.85, pow(1.0 - sNV, uShotP)) * uShotK; float sL = dot(gl_FragColor.rgb, vec3(0.3, 0.59, 0.11)); gl_FragColor.rgb = mix(gl_FragColor.rgb, uShotC * (sL * 2.6 + 0.015), sT); }\n gl_FragColor.rgb += uSheenC * (sFr * uSheenK * (0.35 + 0.65 * saturate(normal.y * 0.5 + 0.5)));\n#include <tonemapping_fragment>');
    };
    return mat;
  }
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ skinning: true }, o));
  const phys = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ skinning: true }, o));

  // ---------- the Ranger's own code-drawn textures ----------
  function sockTexR() {                              // thick grey knit, as in E1 and E8: soft upright ribs, a little heather, a faint mauve cast
    const W = Math.round(512 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), N = 44, seed0 = seed; seed = 7301;
    g.fillStyle = '#878175'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < N; i++) { const x = (i + 0.5) / N * W, w = W / N; g.fillStyle = 'rgba(40,34,36,0.42)'; g.fillRect(x - w * 0.5, 0, w * 0.26, H); g.fillStyle = 'rgba(236,230,232,0.22)'; g.fillRect(x - w * 0.08, 0, w * 0.36, H); }
    for (let j = 0; j < 52; j++) { g.fillStyle = 'rgba(36,30,34,0.20)'; g.fillRect(0, (j + 0.5) / 52 * H, W, 1.3 * TEXS); }          // the rows of the knit
    for (let i = 0; i < 2600; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.55 ? '244,240,242' : '52,44,48') + ',' + rr(0.05, 0.17) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(1, 3) * TEXS, rr(1, 5) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
  }
  function leatherTexR() {                           // worn charcoal-brown leather, as in E1: matte, mottled, rubbed paler where it wears
    const S = Math.round(512 * TEXS), c = cvs(S, S), g = c.getContext('2d'), seed0 = seed; seed = 7302;
    g.fillStyle = '#453d38'; g.fillRect(0, 0, S, S);
    blobs(g, S, S, 240, ['#4f463f'], S * 0.03, S * 0.12, 0.06, 0.22);
    blobs(g, S, S, 210, ['#1f1a18'], S * 0.03, S * 0.15, 0.08, 0.27);
    blobs(g, S, S, 130, ['#877868'], S * 0.010, S * 0.06, 0.06, 0.22);
    for (let i = 0; i < 700; i++) { g.strokeStyle = 'rgba(' + (rnd() < 0.55 ? '26,20,18' : '150,128,112') + ',' + rr(0.04, 0.13) + ')'; g.lineWidth = rr(0.5, 1.3) * TEXS; const x = rnd() * S, y = rnd() * S, a = rnd() * TAU, l = rr(3, 18) * TEXS; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    seed = seed0; return ctex(c, 2, 2);
  }
  function soleTexR() {                              // the sole in E1: dark warm grey, built up in level layers
    const W = Math.round(256 * TEXS), H = Math.round(256 * TEXS), c = cvs(W, H), g = c.getContext('2d'), seed0 = seed; seed = 7303;
    g.fillStyle = '#443d3a'; g.fillRect(0, 0, W, H);
    for (let j = 0; j < 30; j++) { const y = rnd() * H; g.fillStyle = 'rgba(' + (rnd() < 0.6 ? '22,18,18' : '112,102,96') + ',' + rr(0.08, 0.24) + ')'; g.fillRect(0, y, W, rr(1, 3.5) * TEXS); }
    for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '18,15,15' : '120,110,104') + ',' + rr(0.05, 0.14) + ')'; g.fillRect(rnd() * W, rnd() * H, rr(2, 14) * TEXS, rr(1, 2) * TEXS); }
    seed = seed0; return ctex(c, 1, 1);
  }

  // loose curls: fine strands in her three hair colours, running along the lock
  function lockTexR(cols) {
    const W = 256, H = 256, c = cvs(W, H), g = c.getContext('2d'); let sd = 733; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#463434'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 420; i++) { const x = r() * W, k = r(); g.strokeStyle = rgba(k < 0.30 ? cols[0] : k < 0.62 ? cols[1] : k < 0.90 ? cols[2] : '#cdc0c4', 0.35 + 0.5 * r()); g.lineWidth = 0.6 + 1.6 * r(); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6 * (r() - 0.5), H * 0.33, x + 6 * (r() - 0.5), H * 0.66, x + 4 * (r() - 0.5), H); g.stroke(); }
    const t = ctex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  // the turquoise: blue-green stone with darker veins and a few pale clouds
  function gemTexR() {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'); let sd = 9157; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#1a86ad'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 70; i++) { const x = r() * S, y = r() * S, q = 14 + 44 * r(), gr = g.createRadialGradient(x, y, 0, x, y, q), col = r() < 0.5 ? '#35b3cf' : r() < 0.6 ? '#0d5f86' : '#1c9bb8'; gr.addColorStop(0, rgba(col, 0.55)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(x - q, y - q, 2 * q, 2 * q); }
    g.strokeStyle = 'rgba(9,52,78,0.55)'; g.lineWidth = 1.1;
    for (let i = 0; i < 9; i++) { let x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += 26 * (r() - 0.5); y += 26 * (r() - 0.5); g.lineTo(x, y); } g.stroke(); }
    return ctex(c);
  }

  // where a lock has hair: separate strands of different lengths, so its edges and its tip are wispy (root at the bottom of the picture)
  function lockAlphaR() {
    const W = 256, H = 512, c = cvs(W, H), g = c.getContext('2d'); let sd = 4409; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.strokeStyle = '#fff'; g.lineCap = 'round';
    for (let i = 0; i < 64; i++) { const x = r() * W, top = H * (1 - (0.55 + 0.45 * r())); g.lineWidth = 2.2 + 3.2 * r(); g.beginPath(); g.moveTo(x, H); g.bezierCurveTo(x + 10 * (r() - 0.5), H * 0.66, x + 10 * (r() - 0.5), H * 0.4, x + 12 * (r() - 0.5), top); g.stroke(); }
    const t = ctex(c); t.wrapS = THREE.RepeatWrapping; t.encoding = THREE.LinearEncoding; return t;
  }

  // ---------- the Ranger's body and base outfit (stage one): corset, lace top, denim shorts, lace leggings ----------
  // Shapes come from the tables in R05_tables.js. The torso wears one picture that wraps right round her (u runs round the body
  // from the middle of her back, v is height), baked from four paintings: B1 front and back, B2 both sides (bake_ranger.py).
  const SPINE_W = [['hips', 0.885], ['spine1', 1.03], ['spine2', 1.14], ['spine3', 1.255]];
  function wSpine(y) {
    if (y <= SPINE_W[0][1]) return [BI.hips, 1];
    for (let i = 1; i < SPINE_W.length; i++) if (y < SPINE_W[i][1]) {
      const u = sm(SPINE_W[i - 1][1], SPINE_W[i][1], y);
      return [BI[SPINE_W[i - 1][0]], 1 - u, BI[SPINE_W[i][0]], u];
    }
    return [BI.spine3, 1];
  }
  const SOFT = [], SLEEVES = [];       // soft things: headband tails and loose locks hang from a bone and swing; sleeves are loops of cloth round her arms
  function wTorso(x, y, z) {
    const w = wSpine(y), ax = Math.abs(x), S = x < 0 ? 'R' : 'L';
    const k = 0.75 * sm(0.085, 0.15, ax) * sm(1.19, 1.27, y);       // the shoulder girdle follows the collarbone
    if (k > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - k; w.push(BI['clav' + S], k); }
    if (y > 1.33) { const n = sm(1.33, 1.40, y) * (1 - sm(0.05, 0.1, ax)); if (n > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - n; w.push(BI.neck, n); } }
    // Under each shoulder joint the skin goes a little way with the upper arm, so her armpit opens when she raises her arm.
    if (z !== undefined && ax > 0.085 && y > 1.20 && w.length <= 6) { const d = Math.hypot(ax - R_SHOULDER[0], y - R_SHOULDER[1], z - R_SHOULDER[2]), ku = 0.30 * sm(0.10, 0.04, d) * sm(0.085, 0.125, ax) * sm(R_SHOULDER[1] + 0.005, R_SHOULDER[1] - 0.03, y);       // only under the joint: the top of her shoulder stays, her armpit opens
      if (ku > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - ku; w.push(BI['uarm' + S], ku); } }
    return w;
  }

  // the torso surface: u 0..1 round the body (0 the middle of her back, 0.25 her right side, 0.5 the front), y height
  const R_E = 2 / R_TPW;
  function rTorso(u, y) {
    const [rx, zf, zb] = spline(R_TORSO, cl(y, R_TORSO[0][0], R_TY1)), cz = (zf + zb) / 2, rf = zf - cz, rb = cz - zb;
    const a = PI + u * TAU, s = Math.sin(a), c = Math.cos(a);
    const x = rx * Math.sign(s) * Math.pow(Math.abs(s), R_E); let z = cz + (c >= 0 ? rf : rb) * Math.sign(c) * Math.pow(Math.abs(c), R_E);
    if (c > 0) {
      const B = R_BUST, ax = Math.abs(x);
      z += c * B.amp * Math.exp(-Math.pow((ax - B.x) / B.sx, 2) - Math.pow((y - B.y) / B.sy, 2));
      z -= c * B.dip * Math.exp(-Math.pow(x / B.dipx, 2) - Math.pow((y - B.dipy) / B.dipsy, 2));
    }
    return [x, y, z];
  }
  // where a point near the hips sits on that picture (for the legs of the shorts, which carry on the same cloth)
  const R_AY0 = 0.715;                               // the picture runs a little below the torso itself, down to the hems of the shorts
  const rV = (y) => (y - R_AY0) / (R_TY1 - R_AY0);
  function rTorsoU(x, y, z) {
    const [rx, zf, zb] = spline(R_TORSO, cl(y, R_TORSO[0][0], R_TY1)), cz = (zf + zb) / 2;
    const q = cl(x / rx, -1, 1), s = Math.sign(q) * Math.pow(Math.abs(q), 1 / R_E), a0 = Math.asin(cl(s, -1, 1));   // sin(a) = s
    const a = z >= cz ? a0 : PI - a0;                                                                              // front: cos > 0; back: cos < 0
    let u = (a - PI) / TAU; u -= Math.floor(u); return u;
  }
  (function buildTorso() {
    const rings = [], vs = [], NR = Q(72, 34), NU = Q(84, 40);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(R_TY0, R_TY1, i / NR), ring = [];
      for (let j = 0; j < NU; j++) ring.push(rTorso(j / NU, y));
      rings.push(ring); vs.push(rV(y));
    }
    addPart('torso', loft(rings, { v: vs, capA: true }), wTorso, { out: V3(0, 1.1, 0) });
  })();

  // ---------- arms: bare, from the shoulder to the wrist ----------
  const ARM_R = [[-0.054, 0.003], [-0.050, 0.016], [-0.042, 0.030], [-0.030, 0.0405], [-0.015, 0.0480], [0, 0.0515], [0.04, 0.054], [0.11, 0.050], [0.19, 0.045], [0.245, 0.042], [0.30, 0.040], [0.39, 0.0318], [0.425, 0.0264], [0.447, 0.0235], [0.458, 0.0246], [0.470, 0.0262], [0.482, 0.0285], [0.493, 0.0290]];
  // The wrist, as her hand paintings D1 and D2 show it: 4.7 cm across (0.86 of the width across her knuckles; A1 gives 4.5 cm), in line with
  // the middle of her hand, which sits 6 mm to the thumb side of the wrist joint, so the forearm drifts that way from the elbow down (ARM_Z).
  // It covers the stub of the hand, meets the heel of the hand at the joint and runs on inside it. ARM_T is how thick the arm is as a share of
  // its width; ARM_PALM moves the end toward the palm. Both were set from slices through the hand (tools/wrist_sections.py), so the end
  // stays under the skin of the palm and of the back of the hand.
  const ARM_T = [[0.28, 1], [0.33, 0.92], [0.39, 0.89], [0.425, 0.80], [0.447, 0.740], [0.458, 0.671], [0.464, 0.610], [0.470, 0.519], [0.482, 0.416], [0.493, 0.350]];
  const ARM_PALM = [[0.43, 0], [0.447, 0.0002], [0.458, 0.0003], [0.464, 0.0003], [0.470, 0.0004], [0.482, 0.00065], [0.493, 0.00035]], ARM_Z = (sl) => 0.0062 * sm(0.25, 0.45, sl);
  function wArm(S, sLen) {
    if (sLen < -0.02) { const u = sm(-0.06, -0.02, sLen); return [BI['clav' + S], (1 - u) * 0.6, BI.spine3, (1 - u) * 0.4, BI['uarm' + S], u]; }       // The arm turns in her shoulder like a ball in a socket: all of it that shows moves as one piece, so nothing pinches at the joint. Only its hidden tip inside her body stays behind.
    if (sLen < L_UARM + 0.05) { const u = sm(L_UARM - 0.05, L_UARM + 0.05, sLen); return [BI['uarm' + S], 1 - u, BI['farm' + S], u]; }
    const u = sm(L_UARM + L_FARM - 0.02, L_UARM + L_FARM + 0.012, sLen); return [BI['farm' + S], 1 - u, BI['hand' + S], u];
  }
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], NU = Q(32, 16);
    const pts = [], rad = [], ss = [], sls = [], S1 = -0.054 + 0.547 * 0.07, NM = Q(30, 14), NW = Q(18, 9);
    for (let i = 0; i <= 10; i++) sls.push(-0.054 + 0.547 * 0.07 * (i / 10));           // the first rings are close together: they round the shoulder
    for (let i = 1; i <= NM; i++) sls.push(S1 + (0.43 - S1) * i / NM);
    for (let i = 1; i <= NW; i++) sls.push(0.43 + 0.063 * i / NW);                        // and the last are close together: they shape the wrist
    for (const sl of sls) { const pm = sl > 0.43 ? spline(ARM_PALM, Math.min(sl, 0.493)) : 0; pts.push(sh.clone().addScaledVector(d, sl).add(V3(s * d.y * pm, -s * d.x * pm, ARM_Z(sl)))); const r = prof(ARM_R, sl, true); rad.push([r, r * spline(ARM_T, cl(sl, 0.28, 0.493))]); ss.push(sl); }
    // Her arm wears its own painting (bake_hands_r.py), unrolled: once round the arm across the picture, with the back of the forearm in the
    // middle and the thumb side at three quarters; shoulder at the top, wrist at the bottom, the lower forearm on 60% of the rows.
    const vs = ss.map((sl) => sl <= 0.30 ? 1 - 0.4 * (sl + 0.054) / 0.354 : 0.6 * (1 - (sl - 0.30) / 0.193));
    const rings = tubeRings(pts, rad, NU, V3(0, 0, 1)), part = loft(rings, { capA: true, capB: true, u0: 0.75, uS: s < 0 ? -1 : 1, v: vs }), cols = NU + 1;
    const armKey = BAKED && BAKED['arm' + S] ? 'arm' + S : 'skin', info = addPart(armKey, part, (x, y, z, i) => wArm(S, i < ss.length * cols ? ss[Math.floor(i / cols)] : i === ss.length * cols ? ss[0] : ss[ss.length - 1]), { out: centroidOf(rings) });
    // where the arm leaves the shoulder it takes the shoulder's surface direction, so the light does not break along the join
    const AB = buckets[armKey], TB = buckets.torso, near = [];
    for (let k = 0; k < TB.n; k++) if (s * TB.pos[k * 3] > 0.07 && TB.pos[k * 3 + 1] > 1.2) near.push(k);
    for (let i = info.start; i < info.start + info.count; i++) {
      const ring = Math.floor((i - info.start) / cols); if (ring >= ss.length || ss[ring] > 0.075) continue;
      const px = AB.pos[i * 3], py = AB.pos[i * 3 + 1], pz = AB.pos[i * 3 + 2]; let best = -1, bd = 1e9;
      for (const k of near) { const dq = Math.hypot(TB.pos[k * 3] - px, TB.pos[k * 3 + 1] - py, TB.pos[k * 3 + 2] - pz); if (dq < bd) { bd = dq; best = k; } }
      const w = sm(0.028, 0.008, bd); if (best < 0 || w <= 0) continue;
      const nx = lerp(AB.nor[i * 3], TB.nor[best * 3], w), ny = lerp(AB.nor[i * 3 + 1], TB.nor[best * 3 + 1], w), nz = lerp(AB.nor[i * 3 + 2], TB.nor[best * 3 + 2], w), l = Math.hypot(nx, ny, nz) || 1;
      AB.nor[i * 3] = nx / l; AB.nor[i * 3 + 1] = ny / l; AB.nor[i * 3 + 2] = nz / l;
    }
  }

  // ---------- the lace sleeves: a wide bell of black lace from a band round the upper arm to ragged points near the elbow ----------
  // Stage one: they are part of her skin (they turn with the upper arm). They become hanging cloth when the cloth is built.
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], NU = Q(56, 28), NV = Q(18, 9), rings = [], vs = [];
    const out = V3(s, 0, 0), fwd = V3(0, 0, 1), down = V3(0, -1, 0);
    for (let i = 0; i <= NV; i++) {
      const t = i / NV, ring = [];
      for (let j = 0; j < NU; j++) {
        const a = (j / NU) * TAU, co = Math.cos(a), si = Math.sin(a);                 // co: outward from her body, si: forward
        const hem = 0.188 + 0.020 * Math.cos(a * 7) * Math.cos(a * 3 + 1) + 0.012 * co;   // ragged points; a little longer on the outside
        const len = 0.052 + t * hem, arm = prof(ARM_R, Math.min(len, 0.3), true);
        const flare = arm + 0.004 + (0.034 + 0.014 * co) * Math.pow(t, 0.8) + 0.005 * Math.sin(a * 9 + t * 7) * t;   // soft folds
        // the sleeve hangs more nearly straight down than the arm does
        const c = sh.clone().addScaledVector(d, 0.052).addScaledVector(d, t * hem * 0.62).addScaledVector(down, t * hem * 0.38);
        const p = c.addScaledVector(out, flare * co).addScaledVector(fwd, flare * si * 0.92);
        ring.push([p.x, p.y, p.z]);
      }
      rings.push(ring); vs.push(1 - t);
    }
    // The sleeve is cloth looped round her arm. Two bones at its band carry its middle and its hem; R99_static.js slides them across
    // the arm so the loop hangs from the top of her arm and is pushed aside by her forearm, and her arm always stays inside it.
    { const bc = sh.clone().addScaledVector(d, 0.052), ax = d.clone().multiplyScalar(0.62).addScaledVector(down, 0.38).normalize(); addBone('slm' + S, 'uarm' + S, bc.x, bc.y, bc.z); addBone('slv' + S, 'uarm' + S, bc.x, bc.y, bc.z);
      SLEEVES.push({ S, d: d.clone(), g0: V3(0, -1, 0).addScaledVector(d, d.y), mid: 'slm' + S, hem: 'slv' + S });
      addPart('lacesl', loft(rings, { v: vs, uS: 4 }), (x, y, z) => { const t = cl(((x - bc.x) * ax.x + (y - bc.y) * ax.y + (z - bc.z) * ax.z) / 0.19, 0, 1); return t < 0.5 ? [BI['slm' + S], 2 * t, BI['uarm' + S], (1 - 2 * t) * 0.86, BI['clav' + S], (1 - 2 * t) * 0.14] : [BI['slm' + S], 2 - 2 * t, BI['slv' + S], 2 * t - 1]; }, { out: centroidOf(rings) }); }
    // the band it hangs from
    const bp = [], br = []; for (let k = 0; k <= 2; k++) { const sl = 0.046 + k * 0.006; bp.push(sh.clone().addScaledVector(d, sl)); br.push(prof(ARM_R, sl, true) + 0.0045 - Math.abs(k - 1) * 0.0015); }
    const band = tubeRings(bp, br, Q(24, 12), V3(0, 0, 1));
    addPart('laceband', loft(band, { uS: 6, vS: 0.25 }), () => [BI['uarm' + S], 0.86, BI['clav' + S], 0.14], { out: centroidOf(band) });
  }

  // ---------- legs in sheer black lace ----------
  function wLeg(S, y) {
    if (y > 0.78) { const u = sm(0.78, 0.87, y); return [BI['thigh' + S], 1 - u, BI.hips, u]; }
    const u = sm(R_KNEE_Y - 0.05, R_KNEE_Y + 0.05, y); return [BI['shin' + S], 1 - u, BI['thigh' + S], u];
  }
  const legRing = (s, y, k, n) => { const [rx, rzF, rzB, cx, cz] = prof(R_LEG, y, true), ring = []; for (let j = 0; j < n; j++) { const a = PI + (j / n) * TAU, c = Math.cos(a); ring.push([s * cx + rx * k * Math.sin(a), y, cz + (c >= 0 ? rzF : rzB) * k * c]); } return ring; };
  for (const [S, s] of SIDES) {
    const rings = [], vs = [], NR = Q(46, 22), NU = Q(36, 18);
    for (let i = 0; i <= NR; i++) { const y = lerp(0.800, 0.24, i / NR); rings.push(legRing(s, y, 1, NU)); vs.push((0.875 - y) / 0.30); }
    addPart('leggings', loft(rings, { v: vs, uS: 2 }), (x, y) => wLeg(S, y), { out: V3(s * 0.088, 0.55, 0) });
    // the leg of the shorts: the same black denim as the seat, carried down to a frayed hem
    const cr = [], NC = Q(12, 6), hemAt = (j) => lerp(0.750, 0.774, sm(-0.6, 0.9, s * Math.sin(PI + (j / NU) * TAU)));     // higher at the outside of the leg, as painted
    const cuffRing = (t, k, dy) => { const ring = []; for (let j = 0; j < NU; j++) { const y = lerp(0.845, hemAt(j), t) + (dy || 0), p = legRing(s, y, k, NU)[j]; ring.push(p); } return ring; };
    for (let i = 0; i <= NC; i++) { const t = i / NC; cr.push(cuffRing(t, lerp(1.012, 1.045, sm(0, 0.6, t)) + 0.012 * sm(0.75, 1, t))); }
    cr.push(cuffRing(1, 1.035, -0.001), cuffRing(1, 1.012, 0.004));                                   // the hem turns in
    const cuff = loft(cr);
    for (let i = 0; i < cuff.pos.length / 3; i++) { const x = cuff.pos[i * 3], y = cuff.pos[i * 3 + 1], z = cuff.pos[i * 3 + 2]; cuff.uv[i * 2] = rTorsoU(x, Math.max(y, R_TORSO[0][0]), z); cuff.uv[i * 2 + 1] = rV(y); }
    // the inner face of each leg has no place of its own on that picture (its two edges land at the front and back seams, half the picture apart):
    // those triangles get their own corners and wear the plain denim at her side seam instead
    { const idx = [], uFix = s < 0 ? 0.285 : 0.715;
      for (let i = 0; i < cuff.idx.length; i += 3) {
        const t = [cuff.idx[i], cuff.idx[i + 1], cuff.idx[i + 2]], us = t.map((k) => cuff.uv[k * 2]);
        if (Math.max(...us) - Math.min(...us) < 0.22) { idx.push(t[0], t[1], t[2]); continue; }
        for (const k of t) { const n = cuff.pos.length / 3; cuff.pos.push(cuff.pos[k * 3], cuff.pos[k * 3 + 1], cuff.pos[k * 3 + 2]); cuff.uv.push(uFix, cuff.uv[k * 2 + 1]); idx.push(n); }
      }
      cuff.idx = idx; }
    addPart('torso', cuff, (x, y) => wLeg(S, y), { out: V3(s * 0.09, 0.79, 0) });
  }
  // ---------- the Ranger's boots (stage four), built to her boot paintings E1 to E8: lace-up combat boots in worn charcoal-brown leather, tan laces,
  //            nine pairs of brass eyelets, a stitched welt, a lug sole with a block heel, and a grey knitted sock pushed down over the collar ----------
  // The builder began as the Jester's (31_boots.js). Every table below was read off the paintings with tools/cmp_boot.py, which lays the model
  // over each painting at one scale (the sole of E1 as long as the model's: 1 painting pixel = 0.27 mm) and prints both outlines in millimetres.
  //   Side (E1, E2): collar edge 23.2 cm up, sock top 29.1 cm; welt 4.4 cm up under the heel, 2.7 at the ball, 4.2 at the toe; heel block 7.8 cm long.
  //   Front, back, sole (E3, E4, E7): sole 9.6 cm across at the ball, 8.6 at the heel; shaft 7.3 to 8 cm across.
  //   Places along the side are given as [z, y] in metres (z forward from the ankle line, y up from the ground), read straight off E1.
  function wBoot(S, y, z) {
    if (y > 0.10) { const u = sm(0.085, 0.165, y); return [BI['foot' + S], 1 - u, BI['shin' + S], u]; }
    const t = sm(0.085, 0.125, z) * (1 - sm(0.07, 0.11, y)); return [BI['foot' + S], 1 - t, BI['toe' + S], t];
  }
  const B_TOP = 0.2175, B_E = 2 / 2.2, B_EF = 2 / 1.3, B_ZS = 0.95, bz = (z) => -0.012 + (z + 0.012) * B_ZS, bzi = (z) => (z + 0.012) / B_ZS - 0.012, B_Y0 = 0.048, B_Y1 = 0.252;
  // shaft: height -> [half-width, front, back, centre z]; below the ankle the front runs out along the instep.
  // Seen from above the back half is a rounded box and the front half comes to a rounded nose, so the eyelets sit well back from the front edge, as in E1.
  const B_SH = [[0.048, [0.0390, 0.118, 0.062, -0.010]], [0.072, [0.0390, 0.108, 0.062, -0.010]], [0.086, [0.0385, 0.095, 0.059, -0.010]], [0.100, [0.0374, 0.079, 0.054, -0.010]], [0.120, [0.0364, 0.063, 0.050, -0.010]],
    [0.140, [0.0362, 0.050, 0.046, -0.010]], [0.180, [0.0368, 0.043, 0.043, -0.013]], [0.232, [0.0400, 0.044, 0.048, -0.013]], [0.252, [0.0400, 0.044, 0.048, -0.013]]];
  // foot: z -> [half-width, height above the sole]
  const B_FT = [[-0.066, [0.016, 0.030]], [-0.058, [0.028, 0.070]], [-0.035, [0.0365, 0.098]], [0.0, [0.0365, 0.108]], [0.030, [0.0325, 0.104]], [0.049, [0.0330, 0.092]], [0.066, [0.0372, 0.076]], [0.080, [0.0400, 0.0665]],
    [0.088, [0.0410, 0.060]], [0.101, [0.0420, 0.053]], [0.112, [0.0420, 0.049]], [0.122, [0.0415, 0.048]], [0.135, [0.0398, 0.0445]], [0.155, [0.0340, 0.041]], [0.168, [0.0275, 0.034]], [0.176, [0.0190, 0.024]], [0.1795, [0.0085, 0.012]]];
  // sole: its top edge (the welt) by z, and its half-width in plan
  const B_YT = [[-0.080, 0.0438], [-0.040, 0.0438], [0.000, 0.0438], [0.016, 0.0432], [0.032, 0.0387], [0.046, 0.0332], [0.061, 0.0294], [0.075, 0.0278], [0.097, 0.0271], [0.118, 0.0280], [0.132, 0.0300], [0.147, 0.0327],
    [0.161, 0.0360], [0.176, 0.0392], [0.192, 0.0425]];
  const B_HW = [[-0.076, 0], [-0.0745, 0.012], [-0.070, 0.025], [-0.058, 0.0350], [-0.035, 0.0402], [-0.012, 0.0400], [0.012, 0.0365], [0.032, 0.0340], [0.052, 0.0360], [0.074, 0.0412], [0.095, 0.0448], [0.116, 0.0453],
    [0.137, 0.0425], [0.158, 0.0360], [0.172, 0.0285], [0.182, 0.0190], [0.1865, 0.0100], [0.188, 0]];
  const B_Z0 = -0.076, B_Z1 = 0.188, B_LUG = 0.009;
  const bTop = (z) => spline(B_YT, cl(z, -0.08, 0.192)), bHw = (z) => Math.max(0, spline(B_HW, cl(z, B_Z0, B_Z1)));
  const bBot = (z) => B_LUG + 0.012 * sm(0.001, 0.006, z) * (1 - sm(0.008, 0.0435, z));      // the arch is cut up in front of the heel block and slopes down to the forefoot
  // eyelets, outer row as E1 shows them: [z, y]. The top seven are on the shaft, the last two out on the instep.
  const B_EYE = [[0.0163, 0.2187], [0.0168, 0.1982], [0.0176, 0.1773], [0.0195, 0.1566], [0.0236, 0.1356], [0.0332, 0.1187], [0.0460, 0.1035], [0.0617, 0.0893], [0.0789, 0.0776]];
  for (const [S, s] of SIDES) {
    const cx = s * 0.081, wf = (x, y, z) => wBoot(S, y, z), wShin = () => [BI['shin' + S], 1], NU = Q(40, 20), AX = V3(cx, 0.16, -0.012);
    const shaftPt = (y, a) => { const [rx, rzF, rzB, cz] = prof(B_SH, cl(y, B_Y0, B_Y1), true), sn = Math.sin(a), c = Math.cos(a);
      return c >= 0 ? V3(cx + rx * sn, y, cz + rzF * Math.pow(c, B_EF)) : V3(cx + rx * Math.sign(sn) * Math.pow(Math.abs(sn), B_E), y, cz - rzB * Math.pow(-c, B_E)); };
    const footPt = (z, a) => { const [w, h] = prof(B_FT, cl(z, -0.066, 0.1795), true), c = Math.cos(a), sn = Math.sin(a); return V3(cx + w * Math.sign(c) * Math.pow(Math.abs(c), 0.8), bTop(z) - 0.001 + (sn >= 0 ? h * Math.pow(sn, 0.85) : 0.004 * sn), bz(z)); };
    const nrm = (fn, u, v, du, dv, inside) => { const p = fn(u, v), n = fn(u + du, v).sub(fn(u - du, v)).cross(fn(u, v + dv).sub(fn(u, v - dv))).normalize(); if (n.dot(p.clone().sub(inside)) < 0) n.negate(); return { p, n }; };
    const onShaft = (y, a) => nrm(shaftPt, y, a, 0.002, 0.02, V3(cx, y, -0.012)), onFoot = (z, a) => nrm(footPt, z, a, 0.002, 0.02, V3(cx, bTop(z) + 0.02, z));
    // the leather of the boot's side as seen from the side: how far out from the boot's middle line it is at [z, y], on the shaft or on the foot, whichever is outside
    const sideX = (z, y) => {
      let xs = 0, xf = 0;
      if (y >= B_Y0 - 0.002) { const [rx, rzF, rzB, cz] = prof(B_SH, cl(y, B_Y0, B_Y1), true), dz = z - cz, q = Math.abs(dz) / (dz >= 0 ? rzF : rzB); if (q < 1) { const e = dz >= 0 ? B_EF : B_E, c = Math.pow(q, 1 / e), sn = Math.sqrt(1 - c * c); xs = rx * (dz >= 0 ? sn : Math.pow(sn, e)); } }
      const zp = bzi(z); if (zp > -0.066 && zp < 0.1795) { const [w, h] = prof(B_FT, zp, true), t = (y - (bTop(zp) - 0.001)) / h; if (t >= 0 && t < 1) { const sn = Math.pow(t, 1 / 0.85); xf = w * Math.pow(Math.sqrt(1 - sn * sn), 0.8); } }
      return Math.max(xs, xf);
    };
    const onSide = (z, y, sd) => { const e = 0.0015, x = sideX(z, y), fz = (sideX(z + e, y) - sideX(z - e, y)) / (2 * e), fy = (sideX(z, y + e) - sideX(z, y - e)) / (2 * e); return { p: V3(cx + sd * x, y, z), n: V3(sd, -cl(fy, -4, 4), -cl(fz, -4, 4)).normalize() }; };
    // a point over the front of the boot between two points on its sides (f from 0 to 1), lifted off the leather: laces run over these
    const over = (a, b, f, lift) => {
      const base = a.p.clone().lerp(b.p, f), d = a.n.clone().add(b.n); d.x = 0; d.normalize(); const ax = Math.abs(base.x - cx); let sOut = 0;
      for (let k = 0; k <= 70; k++) { const sv = k * 0.001; if (sideX(base.z + d.z * sv, base.y + d.y * sv) > ax) sOut = sv + 0.001; }
      return base.addScaledVector(d, sOut + (lift == null ? 0.0026 : lift));
    };
    // ---- the upper: shaft, then the foot from heel to toe ----
    const ringS = (y, k) => { const [, , , cz] = prof(B_SH, cl(y, B_Y0, B_Y1), true), tilt = 0.003 * sm(0.170, 0.225, y), ring = [];      // the collar stands a little higher at the front than at the back
      for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, p = shaftPt(Math.min(y, B_Y1), a); ring.push([cx + (p.x - cx) * k, y + tilt * Math.cos(a), cz + (p.z - cz) * k]); } return ring; };
    const rings = [ringS(B_TOP + 0.004, 0.86), ringS(B_TOP + 0.0145, 0.955)], NR = Q(34, 16);                                                // the bound edge of the collar, turned in
    for (let i = 0; i <= NR; i++) rings.push(ringS(lerp(B_TOP + 0.012, B_Y0, Math.pow(i / NR, 0.9)), 1));
    addPart('boot', loft(rings, { uS: 2, vS: 1.7 }), wf, { out: AX });
    const fr = [], NF = Q(26, 12), NZ = Q(34, 16);
    for (let i = 0; i <= NZ; i++) { const u = i / NZ, z = lerp(-0.066, 0.1795, u * u * (3 - 2 * u) * 0.3 + u * 0.7), ring = []; for (let j = 0; j < NF; j++) { const p = footPt(z, (j / NF) * TAU); ring.push([p.x, p.y, p.z]); } fr.push(ring); }
    addPart('boot', loft(fr, { capA: true, capB: true, uS: 2, vS: 1.4 }), wf, { out: V3(cx, 0.08, 0.05) });
    // the tongue stands a little above the collar at the front
    { const tr = [], A0 = 0.60, NT = Q(12, 6);
      for (const [y, k, th] of [[B_TOP - 0.02, 1.0, 0.004], [B_TOP + 0.016, 1.0, 0.004], [B_TOP + 0.022, 0.86, 0.004], [B_TOP + 0.025, 0.6, 0.003]]) {
        const ring = []; for (let j = 0; j <= NT; j++) { const a = lerp(-A0, A0, j / NT) * k, p = shaftPt(Math.min(y, B_Y1 - 0.001), a); ring.push([p.x, y, p.z - 0.0025]); }
        for (let j = NT; j >= 0; j--) { const a = lerp(-A0, A0, j / NT) * k, p = shaftPt(Math.min(y, B_Y1 - 0.001), a); ring.push([cx + (p.x - cx) * 0.93, y, p.z - 0.0025 - th]); }
        tr.push(ring);
      }
      addPart('boot', loft(tr, { capB: true, uS: 0.6, vS: 0.2 }), wShin, { out: V3(cx, B_TOP, 0.0) });
    }
    // the pull loop at the back: a strap that stands up from the collar against the sock
    { const lr = [];
      for (const [y, z] of [[B_TOP - 0.006, -0.0635], [B_TOP + 0.010, -0.0640], [B_TOP + 0.020, -0.0705], [B_TOP + 0.030, -0.0762], [B_TOP + 0.0375, -0.0768], [B_TOP + 0.0400, -0.0735]])
        lr.push([[cx - 0.0078, y, z], [cx + 0.0078, y, z], [cx + 0.0078, y, z + 0.0042], [cx - 0.0078, y, z + 0.0042]]);
      addPart('boot', loft(lr, { capA: true, capB: true, uS: 0.3, vS: 0.3 }), wShin, { out: V3(cx, B_TOP + 0.02, -0.07) });
    }
    // ---- the sole: a wall from the lugs up to the welt, whose edge stands out a little all round ----
    const NO = Q(72, 36), zm = (B_Z0 + B_Z1) / 2, half = (B_Z1 - B_Z0) / 2, plan = [];
    for (let j = 0; j < NO; j++) { const a = (j / NO) * TAU, c = Math.cos(a), z = zm + half * Math.sign(c) * Math.pow(Math.abs(c), 0.86); plan.push([Math.sin(a) >= 0 ? 1 : -1, z]); }
    const sring = (yf, k) => plan.map(([sd, z]) => [cx + sd * bHw(z) * (1 + k), yf(z), bz(zm + (z - zm) * (1 + k * 0.32))]);
    const wall = loft([sring((z) => bBot(z) - 0.0015, 0.020), sring(bBot, 0.045), sring((z) => bBot(z) + 0.004, 0.050), sring((z) => bTop(z) - 0.0096, 0.036), sring((z) => bTop(z) - 0.0088, 0.058), sring((z) => bTop(z) - 0.0012, 0.060),
      sring(bTop, 0.040), sring((z) => bTop(z) + 0.0004, -0.035)], { capA: true, capB: true, uS: 6 });
    for (let i = 0; i < wall.pos.length / 3; i++) wall.uv[i * 2 + 1] = wall.pos[i * 3 + 1] / 0.05;
    addPart('sole', wall, wf, { out: V3(cx, 0.025, zm) });
    // lugs: blocks round the edge of the forefoot and the heel, and bars across the middle of each
    const lug = (x0, x1, z0, z1, x0b, x1b) => {       // a block from the ground up into the sole; its outer side can follow the outline (x at z0, x at z1)
      const q = (y, k) => [[cx + x0 * k, y, bz(z0)], [cx + (x0b == null ? x0 : x0b) * k, y, bz(z1)], [cx + (x1b == null ? x1 : x1b) * k, y, bz(z1)], [cx + x1 * k, y, bz(z0)]];
      const p = loft([q(0, 0.985), q(0.002, 1), q(Math.max(bBot(z0), bBot(z1)) + 0.002, 1)], { capA: true, uS: 0.4 }); for (let i = 0; i < p.pos.length / 3; i++) p.uv[i * 2 + 1] = 0.01;
      addPart('sole', p, wf, { out: V3(cx + (x0 + x1) / 2, 0.006, (z0 + z1) / 2) });
    };
    const side = (z0, z1) => { for (const sd of [-1, 1]) lug(sd * (bHw(z0) * 1.045), sd * (bHw(z0) * 1.045 - 0.017), z0, z1, sd * (bHw(z1) * 1.045), sd * (bHw(z1) * 1.045 - 0.017)); };
    for (let k = 0; k < 7; k++) side(0.0435 + k * 0.0200, 0.0435 + k * 0.0200 + 0.0147);
    for (let k = 0; k < 3; k++) side(-0.0518 + k * 0.0205, -0.0518 + k * 0.0205 + (k === 2 ? 0.0150 : 0.0160));
    for (const x of [-0.016, 0, 0.016]) { lug(x - 0.0068, x + 0.0068, 0.172 - Math.abs(x) * 0.3, 0.1895 - Math.abs(x) * 0.62); lug(x - 0.0068, x + 0.0068, -0.0775 + Math.abs(x) * 0.42, -0.0585 + Math.abs(x) * 0.2); }
    for (const z of [0.068, 0.093, 0.118, 0.143]) lug(-0.019, 0.019, z - 0.006, z + 0.006);
    for (const z of [-0.040, -0.016]) lug(-0.017, 0.017, z - 0.006, z + 0.006);
    // ---- stitching: small tan dashes lying on the leather along every seam, and bold ones round the welt ----
    const ST = { pos: [], uv: [], idx: [], nor: [] }, PITCH = 0.0042 / Math.max(0.6, DET);
    const dash = (p, n, t, hl, hw) => {
      const sv = V3().crossVectors(n, t).normalize(), b = ST.pos.length / 3, c = p.clone().addScaledVector(n, 0.0005);
      for (const [a, w] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const v = c.clone().addScaledVector(t, a * hl).addScaledVector(sv, w * hw); ST.pos.push(v.x, v.y, v.z); ST.nor.push(n.x, n.y, n.z); ST.uv.push(0, 0); }
      ST.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    const stitch = (fn, n, hl, hw, pitch) => {        // fn(t in 0..1) -> { p, n }; n samples to measure the path
      const P = [], pt = pitch || PITCH; for (let i = 0; i <= n; i++) P.push(fn(i / n));
      let acc = pt / 2, L = 0;
      for (let i = 0; i < n; i++) { const d = P[i].p.distanceTo(P[i + 1].p); if (d < 1e-6) continue; const t = P[i + 1].p.clone().sub(P[i].p).normalize(); while (acc < L + d) { const u = (acc - L) / d; dash(P[i].p.clone().lerp(P[i + 1].p, u), P[i].n, t, hl || 0.0012, hw || 0.00036); acc += pt; } L += d; }
      return P;
    };
    const path = (fn, n) => { const P = []; for (let i = 0; i <= n; i++) P.push(fn(i / n)); return P; };
    const seam = (P, r) => addPart('boot', loft(tubeRings(P.map((e) => e.p.clone().addScaledVector(e.n, -r * 0.45)), P.map(() => r), 5)), wf, { out: AX });
    // a smooth line through places [z, y] on one side of the boot, moved sideways by off (metres, positive is down and back)
    const sideLine = (pts, sd, off) => {
      const c = curvePts(pts.map(([z, y]) => V3(z, y, 0)), 40);
      return (t) => { const f = t * (c.length - 1), i = Math.min(c.length - 2, Math.floor(f)), q = c[i].clone().lerp(c[i + 1], f - i), tg = c[i + 1].clone().sub(c[i]).normalize(); return onSide(q.x + tg.y * (off || 0), q.y - tg.x * (off || 0), sd); };
    };
    // the back, by angle from the back seam: a smooth line through [angle, y]
    const backLine = (pts, sd, da, dy) => { const c = curvePts(pts.map(([a, y]) => V3(a, y, 0)), 40); return (t) => { const f = t * (c.length - 1), i = Math.min(c.length - 2, Math.floor(f)), q = c[i].clone().lerp(c[i + 1], f - i); return onShaft(q.y + (dy || 0), PI - sd * (q.x + (da || 0))); }; };
    const STAY = [[B_EYE[0][0], B_TOP + 0.0105]].concat(B_EYE), COUNTER = [[0.21, 0.112], [0.52, 0.1090], [0.85, 0.1030], [1.15, 0.0930], [1.36, 0.0780], [1.48, 0.0620], [1.55, 0.0485]];
    const VAMP = [[0.0845, 0.0640], [0.0645, 0.0620], [0.0515, 0.0595], [0.0365, 0.0545], [0.0285, 0.0505], [0.0205, 0.0480]];
    for (const sd of [-1, 1]) {
      for (const off of [0.0080, 0.0106]) stitch(sideLine(STAY, sd, off), 60);                                                                // behind the eyelets, the edge of the piece they are set in
      seam(path(sideLine(STAY, sd, 0.0128), 40), 0.0011);
      for (const off of [0, 0.0026]) stitch(sideLine(VAMP, sd, off), 40);                                                                      // the seam that runs from the last eyelet back down to the welt
      seam(path(sideLine(VAMP, sd, -0.0022), 30), 0.0011);
      for (const da of [0.125, 0.170]) stitch((t) => onShaft(lerp(B_TOP + 0.010, 0.114, t), PI + sd * da), 40);                                  // the strap up the back
      seam(path((t) => onShaft(lerp(B_TOP + 0.012, 0.113, t), PI + sd * 0.205), 24), 0.0011);
      for (const [da, dy] of [[0, 0], [-0.03, -0.0030]]) stitch(backLine(COUNTER, sd, da, dy), 50);                                              // the heel counter: a dome up the back of the heel
      seam(path(backLine(COUNTER, sd, 0.035, 0.0036), 30), 0.0012);
      stitch((t) => onShaft(B_TOP + 0.002, sd * lerp(1.02, PI - 0.215, t)), 40);                                                               // under the padded collar
    }
    { const yb = B_TOP - 0.006, yt = B_TOP + 0.008, w = 0.105, bx = (y, a) => onShaft(y, PI + a);                                               // the stitched box with a cross that holds the pull loop
      for (const [a0, y0, a1, y1] of [[-w, yb, w, yb], [-w, yt, w, yt], [-w, yb, w, yt], [-w, yt, w, yb], [-w, yb, -w, yt], [w, yb, w, yt]]) stitch((t) => bx(lerp(y0, y1, t), lerp(a0, a1, t)), 8, 0.0011, 0.0004, 0.0032); }
    const capZ = (a, d) => 0.1135 + d + 0.0063 * Math.sin(a);                                                                                  // the toe cap leans forward toward the top
    for (const d of [0, 0.0045]) stitch((t) => { const a = lerp(0.03, PI - 0.03, t); return onFoot(capZ(a, d), a); }, 40);
    seam(path((t) => { const a = lerp(0.0, PI, t); return onFoot(capZ(a, -0.0034), a); }, 24), 0.0013);
    { const q = (k) => { const [sd, z] = plan[((k % NO) + NO) % NO]; return V3(cx + sd * bHw(z) * 1.062, bTop(z) - 0.0036, bz(zm + (z - zm) * 1.019)); };            // the welt: bold stitches round the edge of the sole
      stitch((t) => { const j = t * NO, j0 = Math.floor(j), f = j - j0, p = q(j0).lerp(q(j0 + 1), f), tg = q(j0 + 1).sub(q(j0)), n = V3(tg.z, 0, -tg.x).normalize(); if (n.dot(V3(p.x - cx, 0, p.z - zm)) < 0) n.negate(); return { p, n }; }, NO * 2, 0.0019, 0.0009, 0.0058 / Math.max(0.6, DET)); }
    addPart('stitch', ST, wf, { nor: ST.nor });
    // ---- eyelets and laces ----
    const NE = B_EYE.length, eye = (k, sd) => { const e = onSide(B_EYE[k][0], B_EYE[k][1], sd); e.p.addScaledVector(e.n, 0.0007); return e; };
    for (let k = 0; k < NE; k++) for (const sd of [-1, 1]) {
      const e = eye(k, sd), t1 = V3(0, 1, 0).cross(e.n).normalize(), t2 = V3().crossVectors(e.n, t1), ring = [];
      for (let j = 0; j <= 10; j++) { const a = (j / 10) * TAU; ring.push(e.p.clone().addScaledVector(t1, 0.0038 * Math.cos(a)).addScaledVector(t2, 0.0038 * Math.sin(a))); }
      addPart('eyelet', loft(tubeRings(ring, ring.map(() => 0.0015), 6)), wf, { out: e.p });
      const hole = (r) => { const q = []; for (let j = 0; j < 10; j++) { const a = (j / 10) * TAU; q.push(e.p.clone().addScaledVector(t1, r * Math.cos(a)).addScaledVector(t2, r * Math.sin(a)).addScaledVector(e.n, -0.0002).toArray()); } return q; };
      addPart('hole', loft([hole(0.0030), hole(0.0004)], { capB: true }), wf, { out: e.p.clone().addScaledVector(e.n, -0.01) });      // the dark of the hole
    }
    const LR = 0.0019, lace = (a, b, key) => { const c = [a.p.clone(), over(a, b, 0.22), over(a, b, 0.5), over(a, b, 0.78), b.p.clone()], pts = curvePts(c, 11);
      addPart(key || 'lace', loft(tubeRings(pts, pts.map(() => LR), 6), { capA: true, capB: true }), wf, { out: V3(cx, c[2].y, c[2].z - 0.03) }); };
    for (let k = NE - 1; k > 0; k--) { lace(eye(k, -1), eye(k - 1, 1)); lace(eye(k, 1), eye(k - 1, -1)); }
    lace(eye(NE - 1, -1), eye(NE - 1, 1));
    // the bow at the top: a knot, two loops that droop to the sides, and two tails with metal tips hanging down the front
    const K = over(eye(0, -1), eye(0, 1), 0.5, 0.0055); K.y += 0.003;
    const tube = (key, pts, r, o) => addPart(key, loft(tubeRings(pts, pts.map(() => r), 6), o), wShin, { out: pts[Math.floor(pts.length / 2)].clone().add(V3(0, 0, -0.03)) });
    addPart('lace', spherePart(K, 0.0046, 0.0040, 0.0040, 10, 8), wShin, { out: K });
    for (const sd of [-1, 1]) {
      { const e = eye(0, sd), pts = curvePts([e.p.clone(), over(e, { p: K, n: V3(0, 0, 1) }, 0.55), K.clone()], 7); tube('lace', pts, LR, { capA: true, capB: true }); }
      const lp = []; for (let j = 0; j <= 16; j++) { const a = (j / 16) * TAU, w = (1 - Math.cos(a)) / 2; lp.push(V3(K.x + sd * (0.003 + 0.035 * w), K.y - 0.019 * w + 0.0105 * Math.sin(a) * (1 - 0.3 * w), K.z + 0.002 + 0.014 * w - 0.004 * w * w)); }
      tube('lace', lp, LR);
      const tl = curvePts([K.clone(), V3(K.x + sd * 0.008, K.y - 0.018, K.z + 0.010), V3(K.x + sd * (0.012 + 0.002 * s * sd), K.y - 0.040, K.z + 0.0095), V3(K.x + sd * 0.014, K.y - 0.056, K.z + 0.008)], 10);
      tube('lace', tl, LR);
      const e0 = tl[tl.length - 1], e1 = e0.clone().add(e0.clone().sub(tl[tl.length - 2]).normalize().multiplyScalar(0.011));
      tube('aglet', [e0, e1], 0.0022, { capA: true, capB: true });
    }
    // ---- the sock: thick grey knit pushed down over the collar in three soft rolls, its top 29.1 cm up ----
    const SK0 = 0.226, SK1 = 0.2915, SK_Y = [[0.2260, -0.0100], [0.2300, -0.0040], [0.2335, 0.0015], [0.2385, 0.0050], [0.2435, 0.0060], [0.2480, 0.0046], [0.2505, 0.0030], [0.2535, 0.0048], [0.2610, 0.0072], [0.2680, 0.0054],
      [0.2715, 0.0032], [0.2750, 0.0048], [0.2820, 0.0058], [0.2880, 0.0046], [0.2910, 0.0016], [0.2915, -0.0030], [0.2885, -0.0085]], sr = [];
    for (const [y, d] of SK_Y) { const t = cl((y - SK0) / (SK1 - SK0), 0, 1); sr.push(ringXZ(cx, y, lerp(-0.013, -0.016, t), 0.0400 + d, 0.0495 + d, 0.0495 + d, NU, 2.1, (p, a) => [p[0], p[1] + 0.0028 * Math.sin(a * 2 + 0.7 + s) * sm(0.236, 0.262, y) * (1 - sm(0.280, 0.291, y)) + 0.0014 * Math.sin(a * 5 + y * 70), p[2]])); }
    const sock = loft(sr, { uS: 1 }); for (let i = 0; i < sock.pos.length / 3; i++) sock.uv[i * 2 + 1] = cl((sock.pos[i * 3 + 1] - SK0) / (SK1 - SK0), 0, 1);
    addPart('sock', sock, wShin, { out: V3(cx, 0.26, -0.015) });
  }
  // ---------- hands: one continuous skin, grown from a soft solid and cut into triangles ----------
  // The hand is described as a solid: a palm slab, the two mounds at its heel, four fingers and a thumb, blended where they meet.
  // Its surface is then found on a fine grid, so the webs between the fingers, the root of the thumb and the knuckles are one piece
  // of skin with no joins. Canonical hand space: fingers along -Y, palm toward +X, thumb toward +Z, the wrist joint at the origin;
  // metres. Sizes are read off the young-hand painting (see FINGERS). The left hand is the mirror of the right.
  const HAND_GEO = (() => {
    const gs = (d, w) => Math.exp(-d * d / (w * w));
    const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
    // --- a digit: a bent-free tube with its own width, pad and crease tables, one entry every quarter millimetre ---
    const LS = 0.00025, LT0 = -0.03;
    const mkDigit = (name, base, dir, nrm, len, r0, j1, j2, web, o) => {
      const d = V3(...dir).normalize(), n = V3(...nrm); n.addScaledVector(d, -n.dot(d)).normalize(); const sd = V3().crossVectors(d, n);
      const N = Math.ceil((len + 0.05) / LS) + 2, rb = new Float32Array(N), rd = new Float32Array(N), rp = new Float32Array(N);
      const rt = o.tipLen * r0 * o.taper[o.taper.length - 1][1], tc = len - rt;
      for (let i = 0; i < N; i++) {
        const tt = LT0 + i * LS, r = r0 * spline(o.taper, cl(tt / len, 0, 1)) * (1 + (o.bulge1 || 0.035) * gs(tt - j1, 0.0050) + 0.028 * gs(tt - j2, 0.0040));
        const seg = tt < j1 ? cl((tt - web) / Math.max(1e-6, j1 - web), 0, 1) : tt < j2 ? (tt - j1) / (j2 - j1) : cl((tt - j2) / (len - j2), 0, 1);
        const pad = Math.pow(Math.sin(seg * PI), 0.8) * (tt > j2 ? 1.3 : 1) * (tt < web ? 0 : 1);       // the fleshy pads between the creases, fullest at the fingertip
        const crease = gs(tt - j1, 0.0013) + gs(tt - j2, 0.0012) + (o.baseCrease == null ? 0.8 : o.baseCrease) * gs(tt - web - 0.003, 0.0014);
        const wrinkle = gs(tt - j1, 0.0030) + 0.6 * gs(tt - j2, 0.0026);                               // the folds of skin over each joint, on the back
        const bed = sm(len - 0.0125, len - 0.008, tt);                                                 // the nail bed is a little flatter
        rb[i] = r * (1 - 0.02 * crease);
        rp[i] = r * (0.90 + 0.115 * pad) - 0.00048 * crease;
        rd[i] = r * (0.905 + 0.034 * wrinkle - 0.05 * bed);
      }
      return { name, bx: base[0], by: base[1], bz: base[2], dx: d.x, dy: d.y, dz: d.z, nx: n.x, ny: n.y, nz: n.z, sx: sd.x, sy: sd.y, sz: sd.z,
        len, r0, j1, j2, web, tc, rt, up: 0.42 * r0 * o.taper[o.taper.length - 1][1], rcap: 1.2 * r0, rb, rd, rp, texRot: o.texRot || 0, t0: o.t0, Lp: len - o.t0, start: o.start, tt: 0, a: 0, b: 0, f: 0 };
    };
    const digitF = (D, x, y, z) => {
      const qx = x - D.bx, qy = y - D.by, qz = z - D.bz;
      const tt = qx * D.dx + qy * D.dy + qz * D.dz, a = qx * D.nx + qy * D.ny + qz * D.nz, b = qx * D.sx + qy * D.sy + qz * D.sz;
      D.tt = tt; D.a = a; D.b = b;
      if (tt < -0.028 || tt > D.len + 0.018 || a * a + b * b > 0.00081) return (D.f = 0.03);
      const fi = (tt - LT0) / LS, i0 = Math.floor(fi), u = fi - i0;
      const rb = D.rb[i0] + (D.rb[i0 + 1] - D.rb[i0]) * u, ra = a > 0 ? D.rp[i0] + (D.rp[i0 + 1] - D.rp[i0]) * u : D.rd[i0] + (D.rd[i0 + 1] - D.rd[i0]) * u;
      const ax = tt > D.tc ? (tt - D.tc) / D.rt : tt < 0 ? -tt / D.rcap : 0, as = tt > D.tc ? a + D.up * ax * ax : a;      // the end of the finger turns up to meet the nail
      return (D.f = (Math.sqrt(as * as / (ra * ra) + b * b / (rb * rb) + ax * ax) - 1) * Math.min(ra, rb));
    };
    // where a digit's skin lies, at a distance tt along it and an angle th round it (0 on the palm side, PI on the back)
    const digitR = (D, tt, th) => {
      const fi = cl((tt - LT0) / LS, 0, D.rb.length - 2), i0 = Math.floor(fi), u = fi - i0, c = Math.cos(th), s = Math.sin(th);
      const rb = D.rb[i0] + (D.rb[i0 + 1] - D.rb[i0]) * u, ra = c > 0 ? D.rp[i0] + (D.rp[i0 + 1] - D.rp[i0]) * u : D.rd[i0] + (D.rd[i0 + 1] - D.rd[i0]) * u;
      const ax = tt > D.tc ? Math.min(1, (tt - D.tc) / D.rt) : 0;
      return Math.sqrt(Math.max(0, 1 - ax * ax)) / Math.sqrt(c * c / (ra * ra) + s * s / (rb * rb));
    };
    const digitUp = (D, tt) => (tt > D.tc ? D.up * Math.pow(Math.min(1, (tt - D.tc) / D.rt), 2) : 0);
    const digitP = (D, tt, a, b) => [D.bx + D.dx * tt + D.nx * a + D.sx * b, D.by + D.dy * tt + D.ny * a + D.sy * b, D.bz + D.dz * tt + D.nz * a + D.sz * b];
    const FTAPER = [[0, 1.10], [0.14, 1.03], [0.30, 0.995], [0.50, 0.975], [0.62, 0.905], [0.755, 0.885], [0.88, 0.85], [1, 0.83]];
    const DG = FINGERS.map(([fn, fz, fy, fl, fr, fa, dk]) => mkDigit(fn, [0, fy, fz], fingerDir(fa), [1, 0, 0], fl, fr, fl * PHAL[0], fl * (PHAL[0] + PHAL[1]), dk, { taper: FTAPER, tipLen: 1.16, t0: dk, start: dk + 0.003 }));
    // the thumb is turned on its own axis: its pad faces the fingers, its nail faces out to the side
    const TD = V3(...THUMB.dir).normalize(), TN0 = V3(1, 0, 0); TN0.addScaledVector(TD, -TN0.dot(TD)).normalize(); const TB0 = V3().crossVectors(TD, TN0);
    const TNP = TN0.clone().multiplyScalar(Math.cos(THUMB.roll)).addScaledVector(TB0, -Math.sin(THUMB.roll));
    const TL = THUMB.len[0] + THUMB.len[1] + THUMB.len[2];
    DG.push(mkDigit('thb', THUMB.base, THUMB.dir, [TNP.x, TNP.y, TNP.z], TL, THUMB.r, THUMB.len[0], THUMB.len[0] + THUMB.len[1], THUMB.len[0],
      { taper: [[0, 1.30], [0.2, 1.24], [0.433, 1.07], [0.59, 1.0], [0.744, 0.985], [0.87, 0.93], [1, 0.86]], tipLen: 1.08, bulge1: 0.085, baseCrease: 0, texRot: -THUMB.roll, t0: THUMB.len[0], start: THUMB.len[0] + 0.010 }));
    // --- the palm: a rounded slab whose outline is the painted one: [y, [centre z, half width, half thickness to the back, to the palm]] ---
    const SLAB = [[0.040, [0.0070, 0.0230, 0.0165, 0.0165]], [0.018, [0.0066, 0.0234, 0.0162, 0.0165]], [0.000, [0.0059, 0.0249, 0.0150, 0.0158]], [-0.010, [0.0052, 0.0268, 0.0136, 0.0146]],
      [-0.020, [0.0041, 0.0299, 0.0124, 0.0132]], [-0.035, [0.0030, 0.0325, 0.0115, 0.0120]], [-0.050, [0.0029, 0.0341, 0.0111, 0.0115]], [-0.065, [0.0027, 0.0358, 0.0103, 0.0112]],
      [-0.078, [0.0022, 0.0358, 0.0092, 0.0106]], [-0.090, [0.0020, 0.0352, 0.0080, 0.0094]], [-0.100, [0.0020, 0.0340, 0.0074, 0.0086]]];
    SLAB.reverse();
    const SY0 = -0.112, SYS = 0.0005, SN = Math.ceil((0.046 - SY0) / SYS) + 2, sC = new Float32Array(SN), sW = new Float32Array(SN), sD = new Float32Array(SN), sP = new Float32Array(SN);
    for (let i = 0; i < SN; i++) { const p = spline(SLAB, cl(SY0 + i * SYS, -0.100, 0.040)); sC[i] = p[0]; sW[i] = p[1]; sD[i] = p[2]; sP[i] = p[3]; }
    const WEB_Y = -0.0875;
    const slabF = (x, y, z) => {
      const fi = cl((y - SY0) / SYS, 0, SN - 2), i0 = Math.floor(fi), u = fi - i0;
      const cz = sC[i0] + (sC[i0 + 1] - sC[i0]) * u, hz = sW[i0] + (sW[i0 + 1] - sW[i0]) * u, hd = sD[i0] + (sD[i0 + 1] - sD[i0]) * u, hp = sP[i0] + (sP[i0 + 1] - sP[i0]) * u;
      const dz = z - cz, t = dz / hz, hx = x > 0 ? hp : hd * (1 - 0.10 * t * t), rc = 0.80 * Math.min(hd, hp);       // the back of the hand arches a little from side to side
      const qx = Math.abs(x) - (hx - rc), qz = Math.abs(dz) - (hz - rc), ox = qx > 0 ? qx : 0, oz = qz > 0 ? qz : 0;
      const f = Math.sqrt(ox * ox + oz * oz) + Math.min(Math.max(qx, qz), 0) - rc;
      const e = WEB_Y + 5.5 * (z - 0.008) * (z - 0.008) - y, k = 0.006, h = Math.max(k - Math.abs(f - e), 0) / k;    // the far end follows the line of the webs
      return Math.max(f, e) + h * h * k * 0.25;
    };
    const mkEll = (c, e1, r1, e2, r2, e3, r3) => ({ c, e1, e2, e3, r1, r2, r3, rm: Math.min(r1, r2, r3) });
    const ellF = (E, x, y, z) => {
      const qx = x - E.c[0], qy = y - E.c[1], qz = z - E.c[2];
      const u = (qx * E.e1.x + qy * E.e1.y + qz * E.e1.z) / E.r1, v = (qx * E.e2.x + qy * E.e2.y + qz * E.e2.z) / E.r2, w = (qx * E.e3.x + qy * E.e3.y + qz * E.e3.z) / E.r3;
      return (Math.sqrt(u * u + v * v + w * w) - 1) * E.rm;
    };
    const TH = mkEll([0.0120, -0.0270, 0.0310], TD, 0.0260, TN0, 0.0125, TB0, 0.0165);                 // the mound at the root of the thumb
    const HY = mkEll([0.0035, -0.0360, -0.0185], V3(0, 1, 0), 0.0300, V3(1, 0, 0), 0.0125, V3(0, 0, 1), 0.0125);   // the mound on the little-finger side
    const KZ = FINGERS.map((f) => f[1]), KY = FINGERS.map((f) => f[2]), KW = FINGERS.map((f) => f[2] - f[6]);
    const relief = (x, y, z) => {
      let b = 0;
      if (x < 0.003) {                                  // the back: a knuckle at the root of each finger, its tendon, the wrist bone
        const wd = sm(0.003, -0.003, x);
        if (y < -0.045 && y > -0.098) for (let k = 0; k < 4; k++) { const dy = y - KY[k] - 0.001, dz = z - KZ[k]; b += wd * 0.0013 * Math.exp(-dy * dy / 5.2e-5 - dz * dz / 3.2e-5); }
        if (y < -0.012 && y > -0.072) { const s01 = cl(-y / 0.072, 0, 1), al = sm(-0.012, -0.028, y) * sm(-0.072, -0.058, y); for (let k = 0; k < 4; k++) { const dz = z - (0.005 + (KZ[k] - 0.005) * lerp(0.42, 1, s01)); b += wd * 0.00026 * al * Math.exp(-dz * dz / 7e-6); } }
        if (y > -0.012) { const dy = y - 0.010, dz = z + 0.0165; b += wd * 0.0016 * Math.exp(-dy * dy / 6.4e-5 - dz * dz / 3.6e-5); }
      }
      if (x > -0.003) {                                 // the palm: a pad under each finger, a hollow in the middle
        const wp = sm(-0.003, 0.003, x);
        if (y < -0.055) for (let k = 0; k < 4; k++) { const dy = y - KW[k] - 0.009, dz = z - KZ[k]; b += wp * 0.0010 * Math.exp(-dy * dy / 4.2e-5 - dz * dz / 4.5e-5); }
        const dy = y + 0.047, dz = z - 0.004; b -= wp * 0.0021 * Math.exp(-dy * dy / 4.0e-4 - dz * dz / 1.5e-4);
      }
      return b;
    };
    // the web of skin between the thumb and the first finger: a thin bar from one knuckle to the other
    const WA = [0.004, -0.052, 0.0355], WB = [0.011, -0.044, 0.0425], WR = 0.0036, WSX = 1.5;
    const wbx = (WB[0] - WA[0]) * WSX, wby = WB[1] - WA[1], wbz = WB[2] - WA[2], wbb = wbx * wbx + wby * wby + wbz * wbz;
    const webF = (x, y, z) => {
      const px = (x - WA[0]) * WSX, py = y - WA[1], pz = z - WA[2], h = cl((px * wbx + py * wby + pz * wbz) / wbb, 0, 1);
      const ex = px - wbx * h, ey = py - wby * h, ez = pz - wbz * h; return Math.sqrt(ex * ex + ey * ey + ez * ez) - WR;
    };
    const F = (x, y, z) => {
      let f = slabF(x, y, z);
      f = smin(f, ellF(TH, x, y, z), 0.010); f = smin(f, ellF(HY, x, y, z), 0.010);
      if (f < 0.012) f -= relief(x, y, z);
      let ff = digitF(DG[0], x, y, z), g = digitF(DG[1], x, y, z); if (g < ff) ff = g;
      g = digitF(DG[2], x, y, z); if (g < ff) ff = g; g = digitF(DG[3], x, y, z); if (g < ff) ff = g;
      f = smin(f, ff, 0.0045);
      f = smin(f, digitF(DG[4], x, y, z), 0.0042);              // a tight blend: the notch between thumb and first finger is a narrow V
      return smin(f, webF(x, y, z), 0.0040);
    };
    // --- the surface: one point in every grid cell the skin passes through, joined to its neighbours (surface nets) ---
    const h = LOD.handCell || (opts.handGrid || 0.00125) / (DET * DET);      // 1.25 mm cells at full detail, 2.2 mm on phones
    const X0 = -0.026, X1 = 0.038, Y0 = -0.184, Y1 = 0.034, Z0 = -0.052, Z1 = 0.082;
    const nx = Math.ceil((X1 - X0) / h) + 1, ny = Math.ceil((Y1 - Y0) / h) + 1, nz = Math.ceil((Z1 - Z0) / h) + 1, nxy = nx * ny;
    const val = new Float32Array(nxy * nz).fill(NaN);
    {                                                   // a coarse look first, so the fine grid is only worked out near the skin
      const C = 3, band = 4.8 * h, mx = Math.ceil((nx - 1) / C), my = Math.ceil((ny - 1) / C), mz = Math.ceil((nz - 1) / C), cv = new Float32Array((mx + 1) * (my + 1) * (mz + 1));
      for (let k = 0; k <= mz; k++) for (let j = 0; j <= my; j++) for (let i = 0; i <= mx; i++) cv[(k * (my + 1) + j) * (mx + 1) + i] = Math.abs(F(X0 + Math.min(i * C, nx - 1) * h, Y0 + Math.min(j * C, ny - 1) * h, Z0 + Math.min(k * C, nz - 1) * h));
      for (let k = 0; k < mz; k++) for (let j = 0; j < my; j++) for (let i = 0; i < mx; i++) {
        let m = Infinity;
        for (let c = 0; c < 8; c++) { const v = cv[((k + (c >> 2)) * (my + 1) + j + ((c >> 1) & 1)) * (mx + 1) + i + (c & 1)]; if (v < m) m = v; }
        if (m > band) continue;
        const i1 = Math.min((i + 1) * C, nx - 1), j1 = Math.min((j + 1) * C, ny - 1), k1 = Math.min((k + 1) * C, nz - 1);
        for (let kk = k * C; kk <= k1; kk++) for (let jj = j * C; jj <= j1; jj++) for (let ii = i * C; ii <= i1; ii++) { const p = kk * nxy + jj * nx + ii; if (val[p] !== val[p]) val[p] = F(X0 + ii * h, Y0 + jj * h, Z0 + kk * h); }
      }
    }
    const cellV = new Int32Array(nxy * nz).fill(-1), P = [];
    {
      const OFF = [0, 1, nx, nx + 1, nxy, nxy + 1, nxy + nx, nxy + nx + 1], EA = [0, 2, 4, 6, 0, 1, 4, 5, 0, 1, 2, 3], EB = [1, 3, 5, 7, 2, 3, 6, 7, 4, 5, 6, 7], cvv = new Float32Array(8);
      for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const p = k * nxy + j * nx + i; let neg = 0, ok = true;
        for (let c = 0; c < 8; c++) { const v = val[p + OFF[c]]; if (v !== v) { ok = false; break; } cvv[c] = v; if (v < 0) neg++; }
        if (!ok || neg === 0 || neg === 8) continue;
        let sx = 0, sy = 0, sz = 0, n = 0;
        for (let e = 0; e < 12; e++) {
          const a = EA[e], b = EB[e], va = cvv[a], vb = cvv[b]; if ((va < 0) === (vb < 0)) continue;
          const t = va / (va - vb); sx += (a & 1) + ((b & 1) - (a & 1)) * t; sy += ((a >> 1) & 1) + (((b >> 1) & 1) - ((a >> 1) & 1)) * t; sz += (a >> 2) + ((b >> 2) - (a >> 2)) * t; n++;
        }
        cellV[p] = P.length / 3; P.push(X0 + (i + sx / n) * h, Y0 + (j + sy / n) * h, Z0 + (k + sz / n) * h);
      }
    }
    const quads = [];
    for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
      const p = k * nxy + j * nx + i, v0 = val[p]; if (v0 !== v0) continue;
      const n0 = v0 < 0; let v1 = val[p + 1], a, b, c, d;
      if (v1 === v1 && n0 !== (v1 < 0)) { a = cellV[p - nx - nxy]; b = cellV[p - nxy]; c = cellV[p]; d = cellV[p - nx]; if (a >= 0 && b >= 0 && c >= 0 && d >= 0) quads.push(a, b, c, d); }
      v1 = val[p + nx];
      if (v1 === v1 && n0 !== (v1 < 0)) { a = cellV[p - 1 - nxy]; b = cellV[p - nxy]; c = cellV[p]; d = cellV[p - 1]; if (a >= 0 && b >= 0 && c >= 0 && d >= 0) quads.push(a, b, c, d); }
      v1 = val[p + nxy];
      if (v1 === v1 && n0 !== (v1 < 0)) { a = cellV[p - 1 - nx]; b = cellV[p - nx]; c = cellV[p]; d = cellV[p - 1]; if (a >= 0 && b >= 0 && c >= 0 && d >= 0) quads.push(a, b, c, d); }
    }
    // --- settle every point onto the true skin, and take its facing from the solid itself (so creases and knuckles shade) ---
    const nv = P.length / 3, pos = new Float32Array(P), nor = new Float32Array(nv * 3), part = new Int8Array(nv), tq = new Float32Array(nv), tv = new Float32Array(nv), wB = new Array(nv), wW = new Array(nv);
    const e = 0.0003, lim = 0.7 * h;
    for (let v = 0; v < nv; v++) {
      let x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], gx = 0, gy = 0, gz = 0;
      for (let it = 0; it < 3; it++) {
        gx = (F(x + e, y, z) - F(x - e, y, z)) / (2 * e); gy = (F(x, y + e, z) - F(x, y - e, z)) / (2 * e); gz = (F(x, y, z + e) - F(x, y, z - e)) / (2 * e);
        if (it === 2) break;
        const f = F(x, y, z), g2 = gx * gx + gy * gy + gz * gz + 1e-9; let s = f / g2; const st = Math.abs(s) * Math.sqrt(g2); if (st > lim) s *= lim / st;
        x -= gx * s; y -= gy * s; z -= gz * s;
      }
      if (y > Y1 - 0.5 * h) y = Y1 - 0.5 * h;
      const gl = Math.hypot(gx, gy, gz) || 1; pos[v * 3] = x; pos[v * 3 + 1] = y; pos[v * 3 + 2] = z; nor[v * 3] = gx / gl; nor[v * 3 + 1] = gy / gl; nor[v * 3 + 2] = gz / gl;
      // which bones carry this point: the hand, and any digit it lies on or near
      const uf = sm(-0.006, 0.02, y), acc = []; let tot = 0, pk = -1, best = 0.0030;
      for (let k = 0; k < 5; k++) {
        const D = DG[k], f = digitF(D, x, y, z), m = sm(0.007, 0.001, f); if (f < best && D.tt > D.start) { best = f; pk = k; }
        if (m <= 0) continue;
        const tt = D.tt, b0 = k < 4 ? 0.004 : 0.006, bj = 0.005;
        if (tt < b0) { const u = sm(-0.008, b0, tt) * m; if (u > 0) { acc.push([D.name + '0', u]); tot += u; } }
        else if (tt < D.j1 + bj) { const u = sm(D.j1 - bj, D.j1 + bj, tt); acc.push([D.name + '0', m * (1 - u)], [D.name + '1', m * u]); tot += m; }
        else { const u = sm(D.j2 - bj, D.j2 + bj, tt); acc.push([D.name + '1', m * (1 - u)], [D.name + '2', m * u]); tot += m; }
      }
      const sc = tot > 1 ? 1 / tot : 1, rest = Math.max(0, 1 - tot * sc), ws = acc.map(([n, w]) => [n, w * sc]); ws.push(['hand', rest * (1 - uf)], ['farm', rest * uf]);
      ws.sort((p, q) => q[1] - p[1]); ws.length = Math.min(4, ws.length);
      wB[v] = ws.map((w) => w[0]); wW[v] = ws.map((w) => w[1]);
      // which picture it wears: its own finger's strip, or the flat back / palm paintings
      part[v] = pk;
      if (pk >= 0) { const D = DG[pk]; digitF(D, x, y, z); const th = Math.atan2(D.b, D.a) + D.texRot; tq[v] = ((th / TAU) % 1 + 1) % 1; tv[v] = ((D.tt - D.t0) / D.Lp + 0.10) / 1.10; }
    }
    // --- triangles, each facing out; points are doubled only where two pictures meet ---
    const PZ0 = -0.042, PZ1 = 0.064, PY0 = 0.034, PY1 = -0.100, CW = 204 / 1024;
    const src = [], uv = [], idx = [], keys = new Map();
    const emit = (v, code, u, w) => { const key = v * 16 + code; let o = keys.get(key); if (o === undefined) { o = src.length; keys.set(key, o); src.push(v); uv.push(u, w); } return o; };
    const tri = (a, b, c) => {
      const pa = part[a];
      if (pa >= 0 && pa === part[b] && pa === part[c]) {
        const qa = tq[a]; let qb = tq[b], qc = tq[c]; if (qb - qa > 0.5) qb -= 1; else if (qb - qa < -0.5) qb += 1; if (qc - qa > 0.5) qc -= 1; else if (qc - qa < -0.5) qc += 1;
        const m = (qa + qb + qc) / 3, sh = m > 1 ? -1 : m < 0 ? 1 : 0, Q3 = [qa + sh, qb + sh, qc + sh], V = [a, b, c];
        for (let i = 0; i < 3; i++) { const v = V[i], q = Q3[i]; idx.push(emit(v, 2 + pa * 2 + (Math.abs(q - tq[v]) > 1e-6 ? 1 : 0), (pa + cl(q, 0.010, 0.990)) * CW, 0.5 + cl(tv[v], 0.004, 0.996) * 0.5)); }
      } else {
        const side = nor[a * 3] + nor[b * 3] + nor[c * 3] < 0 ? 0 : 1;
        for (const v of [a, b, c]) idx.push(emit(v, side, side * 0.5 + cl((pos[v * 3 + 2] - PZ0) / (PZ1 - PZ0), 0.004, 0.996) * 0.5, cl((PY0 - pos[v * 3 + 1]) / (PY0 - PY1), 0.004, 0.996) * 0.5));
      }
    };
    const d2 = (a, b) => { const dx = pos[a * 3] - pos[b * 3], dy = pos[a * 3 + 1] - pos[b * 3 + 1], dz = pos[a * 3 + 2] - pos[b * 3 + 2]; return dx * dx + dy * dy + dz * dz; };
    for (let q = 0; q < quads.length; q += 4) {
      const a = quads[q]; let b = quads[q + 1]; const c = quads[q + 2]; let d = quads[q + 3];
      const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2], vx = pos[d * 3] - pos[a * 3], vy = pos[d * 3 + 1] - pos[a * 3 + 1], vz = pos[d * 3 + 2] - pos[a * 3 + 2];
      const mx = nor[a * 3] + nor[c * 3], my = nor[a * 3 + 1] + nor[c * 3 + 1], mz = nor[a * 3 + 2] + nor[c * 3 + 2];
      if ((uy * vz - uz * vy) * mx + (uz * vx - ux * vz) * my + (ux * vy - uy * vx) * mz < 0) { const t = b; b = d; d = t; }
      if (d2(a, c) <= d2(b, d)) { tri(a, b, c); tri(a, c, d); } else { tri(a, b, d); tri(b, c, d); }
    }
    return { DG, pos, nor, src, uv, idx, wB, wW, digitR, digitP, digitUp, h, F };
  })();
  for (const [S, s] of SIDES) {
    const G = HAND_GEO, HANDP = !!(BAKED && BAKED.hands), n = G.src.length, pos = new Array(n * 3), nor = new Float32Array(n * 3), wts = new Array(n), p = V3(), d = V3();
    for (let i = 0; i < n; i++) {
      const v = G.src[i]; handPt(s, G.pos[v * 3], G.pos[v * 3 + 1], G.pos[v * 3 + 2], p); handDir(s, G.nor[v * 3], G.nor[v * 3 + 1], G.nor[v * 3 + 2], d);
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z; nor[i * 3] = d.x; nor[i * 3 + 1] = d.y; nor[i * 3 + 2] = d.z;
      const nb = G.wB[v], nw = G.wW[v], w = []; for (let k = 0; k < nb.length; k++) w.push(BI[nb[k] + S], nw[k]); wts[i] = w;
    }
    let idx = G.idx;
    if (s > 0) { idx = idx.slice(); for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } }      // the mirrored hand winds the other way
    addPart(HANDP ? (S === 'R' && BAKED.handsR ? 'handR' : 'hand') : 'skin', { pos, uv: HANDP ? G.uv : null, idx }, (x, y, z, i) => wts[i], { nor });
    // nails: a thin curved plate on the back of each fingertip, rounded at the cuticle and at the free edge
    for (const D of G.DG) {
      const L = D.name === 'thb' ? 0.0132 : D.name === 'pnk' ? 0.0102 : 0.0120, t0 = D.len - L + 0.0008, tf = D.tc + 0.80 * D.rt, NS = Q(18, 8), NW = Q(10, 5), rings = [];
      for (let i = 0; i <= NS; i++) {
        const u = i / NS, tt = t0 + L * u, shape = Math.max(0.28, u < 0.30 ? Math.pow(1 - Math.pow(1 - u / 0.30, 2), 0.5) : u > 0.84 ? Math.pow(Math.max(0, 1 - Math.pow((u - 0.84) / 0.16, 2)), 0.30) : 1), ring = [];
        const PH = lerp(42, 52, sm(0.05, 0.75, u)) * DEG;               // the nail is narrow at the cuticle and as wide as the fingertip at its free edge
        const droop = 0.0004 * Math.pow(Math.max(0, (tt - tf) / (D.len - tf)), 2), root = 0.0009 * (1 - sm(0, 0.12, u));    // the free edge dips a little; the root sinks under the cuticle
        for (let pass = 0; pass < 2; pass++) for (let j = 0; j <= NW; j++) {
          const w = (pass ? 1 - j / NW : j / NW) * 2 - 1, ph = w * PH * shape, th = PI + ph;
          const r = G.digitR(D, Math.min(tt, tf), th) + (pass ? -0.0003 : 0.00042 - 0.00030 * w * w) - droop - root;
          const q = G.digitP(D, tt, Math.cos(th) * r - G.digitUp(D, Math.min(tt, tf)), Math.sin(th) * r), wp = handPt(s, q[0], q[1], q[2]); ring.push([wp.x, wp.y, wp.z]);
        }
        rings.push(ring);
      }
      const c = G.digitP(D, D.len - 0.006, 0, 0);
      addPart('nail', loft(rings, { capA: true, capB: true }), wOne(D.name + '2' + S), { out: handPt(s, c[0], c[1], c[2]) });
    }
  }

  // ---------- head: the Jester's face model, worn at the Ranger's size ----------
  // Chris, November 12: "just use the jester witch 3d face model", with her own face painted on it. So the shape below is the
  // Jester's head exactly as in models/jester-3d/src/40_head.js (her tables and her headPoint, word for word, in her own frame:
  // eyes at 1.5246 m, lip line 0.066 m below). It is then scaled by HS and moved onto the Ranger's body: her eye line at 1.512 m
  // and the tip of the nose 0.107 m forward, as her paintings have them. HS = 0.94 puts the chin at 1.409 m and makes the face
  // 6.4 cm wide at the eyes, both as painted. The method is the project doc claude/HOW-TO-3d-witch-faces.md.
  // The Ranger's own head shape (from her profile in C3) is kept in variants/ownhead/.
  const JH = (function () {
    const HC = V3(0, 1.555, 0.002), HR = { x: 0.070, yT: 0.092, yB: 0.140, zF: 0.0985, zB: 0.083 };
    const LAY = (BAKED && BAKED.layout) || {};          // where the features sit in the painted face: the sculpted eye and the painted eye are placed from one number
    const FC = { eyeY: LAY.eyeY || 1.5246, eyeX: LAY.eyeX || 0.0304, browY: LAY.browY || 1.5368, noseY: LAY.noseY || 1.4877, mouthY: LAY.mouthY || 1.4586 };
    // TUCK is the one thing added to her head. The Jester's cap and ruff hide what lies behind her jaw; the Ranger's hair is up, so
    // below the ears the back of each ring is drawn in to the neck: [from height, to height, neck half-width, neck middle, neck half-depth] in the head's frame
    const TUCK = [1.4927, 1.4523, 0.0468, -0.0115, 0.0535];
    const FACE_MID = [[1.4174, 0.0825], [1.4200, 0.0861], [1.4240, 0.0887], [1.4300, 0.0884], [1.4380, 0.0891], [1.4454, 0.0908], [1.4520, 0.0921], [1.4586, 0.0941], [1.4630, 0.0952], [1.4680, 0.0954],
    [1.4747, 0.0956], [1.4800, 0.0956], [1.4900, 0.0947], [1.5000, 0.0943], [1.5100, 0.0948], [1.5220, 0.0946], [1.5300, 0.0964], [1.5387, 0.1000], [1.5500, 0.0989], [1.5550, 0.0985]];
  const NOSE = [[1.4680, 0], [1.4700, 0.0019], [1.4720, 0.0031], [1.4747, 0.0035], [1.4760, 0.0040], [1.4774, 0.0052], [1.4787, 0.0104], [1.4800, 0.0135], [1.4840, 0.0172], [1.4880, 0.0189], [1.4920, 0.0171], [1.4980, 0.0125], [1.5040, 0.0092], [1.5100, 0.0059], [1.5160, 0.0023], [1.5220, 0.0004], [1.5260, 0]];
  const NOSE_W = [[1.4680, 0.0050], [1.4760, 0.0050], [1.4800, 0.0064], [1.4880, 0.0094], [1.4960, 0.0078], [1.5080, 0.0060], [1.5260, 0.0056]];
  const FACE_V = [[1.4150, 0.30], [1.4300, 0.40], [1.4450, 0.44], [1.4586, 0.40], [1.4760, 0.22], [1.4975, 0.02], [1.5246, -0.12], [1.5400, -0.10], [1.5550, 0]];
  // how wide a ring of the lower head is, from 1 at the cheeks to 0 under the chin: the last tenth closes quickly, so the jaw has an edge and a flat underside
  const SIN9 = Math.sqrt(1 - 0.81), SN9 = Math.pow(SIN9, 0.60), snLow = (sp, t) => (t > 0.9 ? SN9 * Math.pow(sp / SIN9, 0.40) : Math.pow(sp, 0.60));
  const T_CHIN = (HC.y - FACE_MID[0][0]) / HR.yB, SN_CHIN = snLow(Math.sqrt(1 - T_CHIN * T_CHIN), T_CHIN), RZ_CHIN = FACE_MID[0][1] - 0.050 * T_CHIN * T_CHIN * T_CHIN;
    function headPoint(a, ph, grow) {                 // a: angle from the front toward her left; ph: 0 at the crown, PI at the chin
    const yn = Math.cos(ph), s = Math.sin(a), c = Math.cos(a), g = grow || 0, t = Math.max(0, -yn), sn = yn < 0 ? snLow(Math.sin(ph), t) : Math.sin(ph);
    let y = (yn >= 0 ? HR.yT : HR.yB) * yn + g * yn; const Y = HC.y + (yn >= 0 ? HR.yT : HR.yB) * yn;
    const x = ((HR.x * sn) * (1 - 0.16 * sm(0.5, 1.0, t)) + g * Math.min(1, sn * 3)) * s;      // the outline from the front, narrowing to the jaw
    const zc = 0.050 * t * t * t;                   // the lower head sits forward, so the chin hangs under the mouth; the corners of the jaw stay back near the ears
    let z, xk = 0;
    if (c < 0) z = zc * (1 - 0.95 * sm(0, -0.9, c)) + (HR.zB + g) * sn * c;      // only the face comes forward: the back of the head runs straight down into the nape
    else {
      const rz = (yn >= 0 ? HR.zF * sn : t > T_CHIN ? RZ_CHIN * sn / SN_CHIN : spline(FACE_MID, Y) - zc) + g * Math.min(1, sn * 3), v = yn >= 0 ? 0 : spline(FACE_V, Y), s2 = s * s;
      z = zc + rz * (c - v * s2 * Math.pow(c, 1.5));
      if (!g && yn < 0.35) {
        const f = c, ax = Math.abs(x), G = (dx, dy, wx, wy) => Math.exp(-Math.pow(dx / wx, 2) - Math.pow(dy / wy, 2));
        let d = 0; const NT = FC.noseY;
        // nose: the bridge and the ball of the tip, the wings of the nostrils, the folds where they meet the cheek, the hollows under it
        if (Y > 1.468 && Y < 1.526) d += spline(NOSE, Y) * Math.exp(-Math.pow(x / spline(NOSE_W, Y), 2));
        d += 0.0062 * G(ax - 0.0116, Y - (NT - 0.0054), 0.0052, 0.0052) - 0.0014 * G(ax - 0.0186, Y - (NT - 0.0040), 0.0030, 0.0066) - 0.0030 * G(ax - 0.0062, Y - (NT - 0.0096), 0.0030, 0.0021);
        d -= 0.0064 * G(ax - FC.eyeX, Y - FC.eyeY, 0.017, 0.0105) + 0.0026 * G(ax - 0.014, Y - (FC.eyeY - 0.002), 0.007, 0.010);   // eye sockets, deepest beside the bridge
        d += 0.0030 * G(ax - 0.027, Y - (FC.browY + 0.002), 0.026, 0.008);                        // brow
        d += 0.0030 * G(ax - FC.eyeX, Y - FC.eyeY, 0.0105, 0.0066) - 0.0010 * G(ax - FC.eyeX, Y - (FC.eyeY + 0.0088), 0.014, 0.0024);   // the eyeball rounding out of its socket, and the crease of the lid above it
        d += 0.0040 * G(ax - 0.043, Y - 1.4975, 0.020, 0.016) - 0.0022 * G(ax - 0.047, Y - 1.4670, 0.016, 0.014);   // cheekbones, and the hollow under them
        d -= 0.0010 * G(x, Y - (FC.mouthY + 0.0135), 0.0034, 0.0055);                             // the groove under the nose
        d += 0.0056 * G(x, Y - (FC.mouthY + 0.0058), 0.020, 0.0054) + 0.0044 * G(x, Y - (FC.mouthY - 0.0074), 0.016, 0.0054);  // lips
        d -= 0.0016 * G(ax - 0.024, Y - FC.mouthY, 0.006, 0.008);                                 // corners of the mouth
        d += 0.0026 * G(x, Y - 1.4300, 0.017, 0.0095);                                            // the ball of the chin
        z += d * f;
      }
    }
    if (c < 0 && yn < 0) { const fb = sm(TUCK[0], TUCK[1], Y) * sm(-0.05, -0.60, c); if (fb > 0) { xk = lerp(x, (TUCK[2] + g) * s, fb) - x; z = lerp(z, TUCK[3] + (TUCK[4] + g) * c, fb); } }      // the Ranger's one addition: see TUCK
    if (t > 0.86) y += 0.30 * Math.max(0, 0.083 - z) * sm(0.86, 0.985, t);        // under the jaw the skin rises toward the throat
    return [HC.x + x + xk, HC.y + y, HC.z + z];
  }
    const halfW = (Y) => { if (Y >= HC.y) return HR.x * Math.sqrt(Math.max(0, 1 - Math.pow((Y - HC.y) / HR.yT, 2))); const t = Math.min(1, (HC.y - Y) / HR.yB); return HR.x * snLow(Math.sqrt(1 - t * t), t) * (1 - 0.16 * sm(0.5, 1.0, t)); };
    return { HC, HR, FC, headPoint, halfW };
  })();
  const HS = 0.94, J_EYE = 1.5246, J_TIP = 0.1158, R_EYE = 1.512, R_TIP = 0.107;
  const jy = (Y) => R_EYE + (Y - J_EYE) * HS, jz = (Z) => R_TIP + (Z - J_TIP) * HS, toJy = (y) => J_EYE + (y - R_EYE) / HS, toJz = (z) => J_TIP + (z - R_TIP) / HS;      // between the head's own frame and her body
  const HC = V3(0, jy(JH.HC.y), jz(JH.HC.z)), HR = { x: JH.HR.x * HS, yT: JH.HR.yT * HS, yB: JH.HR.yB * HS, zF: JH.HR.zF * HS, zB: JH.HR.zB * HS };
  const FC = { eyeY: R_EYE, eyeX: JH.FC.eyeX * HS, browY: jy(JH.FC.browY), noseY: jy(JH.FC.noseY), mouthY: jy(JH.FC.mouthY), earZ: -0.0215 };
  const FACE = { x0: -0.1 * HS, x1: 0.1 * HS, y0: jy(1.385), y1: jy(1.585) };          // the face painting covers this window, seen from the front
  const GS = (dx, dy, wx, wy) => Math.exp(-Math.pow(dx / wx, 2) - Math.pow(dy / wy, 2));
  function headPoint(a, ph, grow) { const p = JH.headPoint(a, ph, (grow || 0) / HS); return [p[0] * HS, jy(p[1]), jz(p[2])]; }
  const headHalfW = (y) => JH.halfW(toJy(y)) * HS;        // half the width of her head at a height
  const wHead = wOne('head'), faceMix = [], faceUvS = [];
  // her ear, read off the profile in J3: its middle, half its width and height, and how far its top leans back. J3 paints the ear a little
  // larger than her front view (J1) allows, so the ear is built 6% smaller than its picture and the picture is drawn in to fit (texK)
  const EAR = { z: -0.0254, y: 1.4906, a: 0.0165, b: 0.0302, tilt: 11 * DEG, texK: 1.066 };
  const earR = (z, y) => { const c = Math.cos(EAR.tilt), sn = Math.sin(EAR.tilt), dz = z - EAR.z, dy = y - EAR.y, lz = dz * c + dy * sn, ly = dy * c - dz * sn; return Math.sqrt(lz * lz / (EAR.a * EAR.a) + ly * ly / (EAR.b * EAR.b)); };
  const SIDE_WIN = (BAKED && BAKED.faceSideWin) || [jz(-0.075), jz(0.125), jy(1.385), jy(1.585)];      // the side painting covers this window: forward from, to; height from, to
  (function buildHead() {
    const NU = Q(256, 84), NV = Q(168, 60), rings = [];        // most of the rings, and most of the columns, are spent on the face
    for (let i = 0; i <= NV; i++) {
      const u = i / NV, ph = u < 0.28 ? lerp(0.02, 1.45, u / 0.28) : lerp(1.45, PI - 0.02, (u - 0.28) / 0.72), ring = [];
      for (let j = 0; j < NU; j++) { const v = 2 * (j / NU) - 1; ring.push(headPoint(PI * (0.35 * v + 0.65 * v * v * v), ph)); }     // v = 0 is the middle of the face
      rings.push(ring);
    }
    const part = loft(rings, { capA: true, capB: true });
    for (let i = 0; i < part.pos.length / 3; i++) {   // the front painting is laid on flat from the front
      part.uv[i * 2] = (part.pos[i * 3] - FACE.x0) / (FACE.x1 - FACE.x0); part.uv[i * 2 + 1] = (part.pos[i * 3 + 1] - FACE.y0) / (FACE.y1 - FACE.y0);
    }
    const info = addPart('face', part, wHead, { out: HC });
    // Which painting each point wears, by the Jester's rules: the front painting wherever it can see; the profile painting only where
    // the skin faces sideways and lies more than 34 to 50 mm from the middle line; plain skin under the jaw (facing down and below
    // the jaw line) and behind the ear line. The Ranger adds one thing: the painted ear is blanked under her real one.
    const FB = buckets.face, Wn = SIDE_WIN;
    for (let i = info.start; i < info.start + info.count; i++) {
      const nx = FB.nor[i * 3], ny = FB.nor[i * 3 + 1], px = FB.pos[i * 3], py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2], pyJ = toJy(py), pzJ = toJz(pz), pxJ = Math.abs(px) / HS;
      const under = sm(-0.22, -0.66, ny) * sm(1.444, 1.428, pyJ), plain = Math.max(under, sm(0.010, -0.006, pzJ - JH.HC.z), pxJ > 0.03 ? sm(1.12, 0.92, earR(pz, py)) : 0);
      const side = sm(0.70, 0.93, Math.abs(nx)) * sm(0.034, 0.050, pxJ) * sm(Wn[2] + 0.002, Wn[2] + 0.014, py) * sm(Wn[3] - 0.002, Wn[3] - 0.014, py) * (1 - plain);
      faceMix.push(side, plain, 1 - 0.17 * under, 1); faceUvS.push((pz - Wn[0]) / (Wn[1] - Wn[0]), (py - Wn[2]) / (Wn[3] - Wn[2]));
    }
  })();
  // Her painted face is kept on a canvas, so the painted eyes or mouth of another state can be set into it: her blink, her talking
  // mouths, her smile (J2). The states and their names are stored as the Jester's are, so her blink and talk code will work here unchanged.
  const faceC = cvs(1024, 1024), faceT = ctex(faceC), bakedFace = { base: null, parts: {} }, faceNow = { eyes: 0, mouth: 'rest' };
  { const g0 = faceC.getContext('2d'); g0.fillStyle = (BAKED && BAKED.skinChest) || '#dc9e81'; g0.fillRect(0, 0, 1024, 1024); }
  // Faces she can try on (bake_looks_r.py): 'own' is hers; 'young' is hers with the lines of age taken out; 'fox' is the Fox's painted face.
  const LOOKS = { own: bakedFace }; bakedFace.rects = (BAKED && BAKED.faceParts) || {}; let lookNow = (BAKED && BAKED.faceYoung) ? 'young' : 'own';       // Chris, November 13: "I like the younger face"
  function setLook(name) { lookNow = LOOKS[name] ? name : 'own'; paintFace(faceNow.eyes, faceNow.mouth); return lookNow; }
  function paintFace(eyes, mouth) {                 // eyes: 0 open .. 1 shut; mouth: 'rest', 'open', 'oo' or 'smile'
    faceNow.eyes = eyes; faceNow.mouth = mouth; const L = LOOKS[lookNow] && LOOKS[lookNow].base ? LOOKS[lookNow] : LOOKS.own; if (!L.base) return;
    const W = faceC.width, H = faceC.height, g = faceC.getContext('2d'), put = (n) => { const im = L.parts[n], r = L.rects[n]; if (im && r) g.drawImage(im, r.x * W, r.y * H, r.w * W, r.h * H); };
    g.drawImage(L.base, 0, 0, W, H);
    if (eyes >= 0.75) put('shut'); else if (eyes >= 0.25) put('half');
    if (mouth === 'open') put('oh'); else if (mouth === 'oo') put('oo'); else if (mouth === 'smile') put('smile');
    faceT.needsUpdate = true;
  }
  onBaked('face', (im) => { bakedFace.base = im; paintFace(faceNow.eyes, faceNow.mouth); });
  for (const [nm, fk, pk] of [['young', 'faceYoung', 'facePartsYoung'], ['fox', 'faceFox', 'facePartsFox']]) if (BAKED && BAKED[fk]) { const L = LOOKS[nm] = { base: null, parts: {}, rects: BAKED[pk] || {} };
    onBaked(fk, (im) => { L.base = im; if (lookNow === nm) paintFace(faceNow.eyes, faceNow.mouth); });
    for (const n in L.rects) onBaked(pk + '_' + n, (im) => { L.parts[n] = im; if (lookNow === nm) paintFace(faceNow.eyes, faceNow.mouth); }, L.rects[n].src); }
  if (BAKED && BAKED.faceParts) for (const n in BAKED.faceParts) onBaked('facePart_' + n, (im) => { bakedFace.parts[n] = im; paintFace(faceNow.eyes, faceNow.mouth); }, BAKED.faceParts[n].src);
  // ---------- ears: a dished shell standing off the side of the head, wearing the profile painting ----------
  (function buildEars() {
    const NT = Q(72, 30), N1 = Q(16, 8), N2 = Q(7, 4), c0 = Math.cos(EAR.tilt), s0 = Math.sin(EAR.tilt);
    const zy = (r, th) => {                         // th: 0 at the top, a quarter turn at the back, half a turn at the lobe
      const ct = Math.cos(th), st = Math.sin(th), lz = -EAR.a * st * (1 - 0.20 * sm(0.3, 1, -ct)) * r, ly = EAR.b * ct * r;
      return [EAR.z + lz * c0 - ly * s0, EAR.y + ly * c0 + lz * s0];
    };
    const zF = EAR.z + EAR.a, zB = EAR.z - EAR.a;
    const lat = (r, th) => {                        // the outer face: [distance out from the middle of the head, height, forward]
      const [z, y] = zy(r, th), ct = Math.cos(th), st = Math.sin(th), q = cl((zF - z) / (zF - zB), 0, 1);
      let x = headHalfW(y) - 0.0015 + 0.0035 + 0.0165 * Math.pow(q, 0.9) * (0.50 + 0.50 * sm(1.466, 1.492, y));
      const rim = 1 - 0.75 * sm(0.15, 0.5, -st) * sm(-0.9, -0.2, ct) * sm(0.95, 0.2, ct);      // the rim fades along the front, where the ear joins the cheek
      x += 0.0022 * Math.exp(-Math.pow((r - 0.90) / 0.085, 2)) * rim;                              // helix
      x -= 0.0016 * Math.exp(-Math.pow((r - 0.72) / 0.07, 2)) * sm(-0.3, 0.3, st) * sm(-0.5, 0.1, ct);     // the groove inside it
      x += 0.0020 * Math.exp(-Math.pow((r - 0.50) / 0.10, 2)) * sm(-0.35, 0.25, st);               // antihelix
      x -= 0.0085 * GS(z - (EAR.z + 0.0040), y - (EAR.y - 0.0045), 0.0062, 0.0088);                // the bowl of the ear
      x += 0.0030 * GS(z - (EAR.z + 0.0118), y - (EAR.y - 0.0050), 0.0036, 0.0050);                // tragus
      return [x, y, z];
    };
    for (const [S, sg] of SIDES) {
      const rings = [], kind = [];
      for (let i = 0; i <= N1; i++) { const r = lerp(0.07, 1, Math.pow(i / N1, 0.85)), ring = []; for (let j = 0; j < NT; j++) { const p = lat(r, (j / NT) * TAU); ring.push([sg * p[0], p[1], p[2]]); } rings.push(ring); kind.push(0); }
      { const ring = []; for (let j = 0; j < NT; j++) { const p = lat(1.03, (j / NT) * TAU); ring.push([sg * (p[0] - 0.0020), p[1], p[2]]); } rings.push(ring); kind.push(1); }     // round the edge
      for (let i = 0; i <= N2; i++) {               // the back face, running in under the ear to the head
        const u = i / N2, r = lerp(1.0, 0.42, u), ring = [];
        for (let j = 0; j < NT; j++) { const p = lat(r, (j / NT) * TAU), xin = headHalfW(p[1]) - 0.006; ring.push([sg * Math.max(xin, lerp(p[0] - 0.0040, xin, u * u)), p[1], p[2]]); }
        rings.push(ring); kind.push(2);
      }
      const part = loft(rings, { capA: true }), cols = NT + 1, info = addPart('face', part, wHead, { out: V3(sg * 0.05, EAR.y, EAR.z) }), FB = buckets.face, Wn = SIDE_WIN;
      for (let i = info.start; i < info.start + info.count; i++) {
        const k = kind[Math.min(kind.length - 1, Math.floor((i - info.start) / cols))] || 0, py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2];
        if ((i - info.start) >= rings.length * cols || k === 0) faceMix.push(1, 0, 1, 1); else if (k === 1) faceMix.push(0.5, 0.5, 0.97, 1); else faceMix.push(0, 1, 0.92, 1);
        faceUvS.push((EAR.z + (pz - EAR.z) * EAR.texK - Wn[0]) / (Wn[1] - Wn[0]), (EAR.y + (py - EAR.y) * EAR.texK - Wn[2]) / (Wn[3] - Wn[2]));
      }
    }
  })();
  // neck: from the top of the torso up inside the jaw. It leans forward as it rises, front and back, as in the side view in J3,
  // so the throat meets the underside of the jaw about 4 cm behind the chin. Its sides wear the profile in J3; its front and back
  // are her neck's own tone (darker and warmer than her chest, as painted), darker again under the jaw.
  (function buildNeck() {
    const NU = Q(56, 24), wNeck = (x, y) => { const u = sm(1.40, 1.47, y); return [BI.neck, 1 - u, BI.head, u]; }, nr = [];
    for (const [y, rx, zf, zb] of [[1.396, 0.0505, 0.0245, -0.0785], [1.410, 0.0492, 0.0305, -0.0735], [1.424, 0.0480, 0.0355, -0.0675], [1.440, 0.0470, 0.0390, -0.0625], [1.460, 0.0468, 0.0395, -0.0600], [1.490, 0.0460, 0.0320, -0.0600]])
      nr.push(ringXZ(0, y, (zf + zb) / 2, rx, (zf - zb) / 2, (zf - zb) / 2, NU));
    const info = addPart('face', loft(nr), wNeck, { out: V3(0, 1.44, -0.012) }), FB = buckets.face, Wn = SIDE_WIN;
    for (let i = info.start; i < info.start + info.count; i++) {
      const nx = FB.nor[i * 3], py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2], sd = sm(0.50, 0.85, Math.abs(nx)) * sm(1.398, 1.422, py);
      faceMix.push(sd, 1 - sd, 1 - 0.17 * sm(1.403, 1.432, py) * sm(-0.030, 0.015, pz), 1); faceUvS.push((pz - Wn[0]) / (Wn[1] - Wn[0]), (py - Wn[2]) / (Wn[3] - Wn[2]));
    }
    // the foot of the neck takes the chest's surface direction where the two meet, so the light does not break along the join
    const TB = buckets.torso, rim = [];
    for (let i = 0; i < TB.n; i++) { const y = TB.pos[i * 3 + 1]; if (y > 1.386 && y < 1.4055 && Math.abs(TB.pos[i * 3]) < 0.08 && Math.abs(TB.nor[i * 3 + 1]) < 0.85) rim.push(i); }
    for (let i = info.start; i < info.start + info.count && rim.length; i++) {
      const px = FB.pos[i * 3], py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2], k = sm(1.432, 1.404, py); if (k <= 0) continue;
      let best = rim[0], bd = 1e9;
      for (const j of rim) { const d = Math.hypot(TB.pos[j * 3] - px, TB.pos[j * 3 + 2] - pz) + 0.5 * Math.abs(TB.pos[j * 3 + 1] - 1.400); if (d < bd) { bd = d; best = j; } }
      const nx = lerp(FB.nor[i * 3], TB.nor[best * 3], k), ny = lerp(FB.nor[i * 3 + 1], TB.nor[best * 3 + 1], k), nz = lerp(FB.nor[i * 3 + 2], TB.nor[best * 3 + 2], k), l = Math.hypot(nx, ny, nz) || 1;
      FB.nor[i * 3] = nx / l; FB.nor[i * 3 + 1] = ny / l; FB.nor[i * 3 + 2] = nz / l;
    }
  })();

  // ---------- hair, headband and gem ----------
  // Her hair is one shell over the skull, swelling into the bun behind the crown. It wears four paintings at once (side, front,
  // back, top), mixed by which way the hair faces (the hair material). The headband is a strip wrapped round the hair in a tilted
  // plane: high on the forehead, down behind the ears to the knot at the nape (heights and slope read off the profile in C3).
  const phOfY = (Y) => Math.acos(cl((Y - HC.y) / (Y >= HC.y ? HR.yT : HR.yB), -1, 1));
  const HAIR_EDGE = [[0, 1.591], [0.5, 1.587], [0.95, 1.566], [1.25, 1.534], [1.57, 1.528], [1.92, 1.505], [2.36, 1.470], [PI, 1.452]];     // [angle round from the front, height of the hairline]
  const BUN_D = V3(0, 0.292, -0.956), BUN = { amp: 0.052, sig: 33 * DEG };       // Chris, November 13: the bun on the back of her head, not up high (it pointed 35 degrees up; now 17)
  const BAND = { yF: 1.589, zF: 0.080, slope: 0.514, w: 0.032 }, bandY = (z) => BAND.yF - (BAND.zF - z) * BAND.slope;
  // Chris, November 13: "her hair is too big above the hairband": the swell over her forehead is lowered so the hair climbs from the band to the
  // crown on the slope of C3's side view (measured with tools/cmp_head.py: it stood 25 to 46 mm too high just behind the band). Nothing else moved.
  const FRONT_LOW = 0.70;
  function hairPt(a, ph, u, phB, add, plain) {      // u: 0 at the crown .. 1 at the hairline; phB: where the band presses the hair; add: extra metres out
    const rise = phB == null ? 1 : sm(phB - 0.02, phB - 0.46, ph);       // the band holds the hair flat; behind it the hair lifts as it is swept back to the bun
    let g = (0.0070 + 0.011 * sm(0.1, -0.6, Math.cos(a)) * sm(1.88, 2.08, ph)) * (phB == null ? 1 : 1 - 0.45 * Math.exp(-Math.pow((ph - phB) / 0.16, 2))) + (0.011 * sm(1.50, 0.50, ph) * (0.55 + 0.45 * Math.cos(a) * Math.cos(a)) * (1 - FRONT_LOW * sm(-0.05, 0.62, Math.cos(a)) * sm(0.15, 0.55, ph)) + 0.009 * sm(0.9, 1.5, ph) * sm(2.1, 1.5, ph) + 0.016 * sm(1.15, 1.6, ph) * sm(2.25, 1.75, ph) * sm(0.2, -0.5, Math.cos(a))) * rise;      // rounder on top, fuller at the back of the head (J3's side view)
    g *= 0.30 + 0.70 * sm(1.0, 0.72, u);
    const p = headPoint(a, ph, g + (add || 0)), dx = p[0] - HC.x, dy = p[1] - HC.y, dz = p[2] - HC.z, L = Math.hypot(dx, dy, dz) || 1;
    const Lv = Math.hypot(dy, dz) || 1, av = Math.acos(cl((dy * BUN_D.y + dz * BUN_D.z) / Lv, -1, 1)), al = Math.asin(cl(Math.abs(dx) / L, 0, 1)), ang = Math.hypot(av, 1.32 * al);      // the bun is narrower from side to side than it is tall
    let b = BUN.amp * Math.exp(-Math.pow(ang / BUN.sig, 3));
    if (phB != null) b *= sm(phB - 0.03, phB - 0.30, ph);       // the bun stops above the band, so the band is never buried
    if (!plain) {                                   // curls on the bun, combed ridges elsewhere
      const k = Math.exp(-Math.pow(ang / (BUN.sig * 1.15), 3));
      b += k * 0.0032 * (fbm(Math.sin(a) * 4 + 20, ph * 7 + Math.cos(a) * 4) - 0.47) * 2 + (1 - k) * 0.0008 * Math.sin(a * 46 + 5 * fbm(Math.sin(a) * 3 + 7, ph * 4)) * sm(1.0, 0.8, u);
    }
    const s = 1 + b / L;
    return [HC.x + dx * s, HC.y + dy * s, HC.z + dz * s];
  }
  // The band lies on her skin where there is no hair under it (her forehead, below the hairline) and on her hair everywhere else,
  // pressing it flat. add: metres out from that surface.
  const phEdgeOf = (a) => phOfY(spline(HAIR_EDGE, Math.abs(a)));
  function bandPt(a, ph, add) { const e = phEdgeOf(a), cover = sm(e + 0.015, e - 0.05, ph); return headPoint(a, ph, 0.0042 * cover + add + (add > 0.001 ? 0.0012 * cover : 0)); }
  function bandPh(a) { let ph = 1.4; for (let k = 0; k < 12; k++) { const p = bandPt(a, ph, 0.002); ph = lerp(ph, phOfY(bandY(p[2])), 0.8); } return ph; }
  (function buildHair() {
    const NU = Q(168, 64), NV = Q(76, 28), rings = [], phE = [], phB = [], aOf = (j) => -PI + (j / NU) * TAU;
    for (let j = 0; j < NU; j++) { const a = aOf(j); phE.push(phOfY(spline(HAIR_EDGE, Math.abs(a)))); phB.push(bandPh(a)); }
    for (let i = 0; i <= NV; i++) { const u = i / NV, ring = []; for (let j = 0; j < NU; j++) ring.push(hairPt(aOf(j), lerp(0.03, phE[j], Math.pow(u, 0.92)), u, phB[j])); rings.push(ring); }
    rings.push(rings[NV].map((p, j) => headPoint(aOf(j), phE[j] + 0.012, 0.0004)));          // the rim closes onto the skin
    addPart('hair', loft(rings, { capA: true }), wHead, { out: HC });
  })();
  const blob = (key, O, R, U, N, c, rad, nu, nv) => {       // a small rounded solid in a local frame: across R, up U, out N
    const rings = [];
    for (let i = 0; i <= nv; i++) {
      const ph = lerp(0.12, PI - 0.12, i / nv), ring = [];
      for (let j = 0; j < nu; j++) { const th = (j / nu) * TAU, r = c[0] + rad[0] * Math.sin(ph) * Math.cos(th), u = c[1] + rad[1] * Math.cos(ph), n = c[2] + rad[2] * Math.sin(ph) * Math.sin(th); ring.push([O[0] + R.x * r + U.x * u + N.x * n, O[1] + R.y * r + U.y * u + N.y * n, O[2] + R.z * r + U.z * u + N.z * n]); }
      rings.push(ring);
    }
    return addPart(key, loft(rings, { capA: true, capB: true }), wHead, { out: V3(O[0] + R.x * c[0] + U.x * c[1] + N.x * c[2], O[1] + R.y * c[0] + U.y * c[1] + N.y * c[2], O[2] + R.z * c[0] + U.z * c[1] + N.z * c[2]) });
  };
  (function buildBand() {
    const NU = Q(132, 52), rings = [], K = [-1, -0.55, 0, 0.55, 1], cs = []; let s = 0, prev = null, knot = null;
    for (let j = 0; j <= NU; j++) {                 // from the knot at the nape, round her right side to the forehead and back by her left
      const a = -PI + (j / NU) * TAU, pb = bandPh(a), pc = bandPt(a, pb, 0.003);
      // the band is a strip of even width: how far to step up and down the head for half its width is worked out on each side separately
      const step = (sgn) => { let lo = 0, hi = 0.6; for (let it = 0; it < 18; it++) { const m = (lo + hi) / 2, q = bandPt(a, pb + sgn * m, 0); if (Math.hypot(q[0] - pc0[0], q[1] - pc0[1], q[2] - pc0[2]) < BAND.w / 2) lo = m; else hi = m; } return (lo + hi) / 2; };
      const pc0 = bandPt(a, pb, 0), dUp = step(-1), dDn = step(1), ring = [];
      for (const k of K) ring.push(bandPt(a, pb + k * (k < 0 ? dUp : dDn), 0.0018 + 0.0012 * (1 - k * k)));
      for (const k of [0.8, 0, -0.8]) ring.push(bandPt(a, pb + k * (k < 0 ? dUp : dDn), 0.0003));
      rings.push(ring);
      if (prev) s += Math.hypot(pc[0] - prev[0], pc[1] - prev[1], pc[2] - prev[2]);
      prev = pc; cs.push(s); if (j === 0) knot = pc;
    }
    const part = loft(rings), cols = 9;
    for (let i = 0; i <= NU; i++) for (let j = 0; j < cols; j++) {
      const q = i * cols + j, jj = j % 8, v = jj < 5 ? (K[jj] + 1) / 2 : jj === 5 ? 0.95 : jj === 6 ? 0.5 : 0.05;
      part.uv[q * 2] = 0.5 + (cs[i] - s / 2) / 0.45; part.uv[q * 2 + 1] = 1 - v;
    }
    addPart('band', part, wHead, { out: HC });
    // the knot, and its two tails hanging down the back of her neck (stiff until the cloth stage)
    const R = V3(1, 0, 0), U = V3(0, 1, 0), N = V3(0, 0, -1), O = [knot[0], knot[1], knot[2] - 0.006];
    for (const [c, rad] of [[[0, 0, 0], [0.0125, 0.0105, 0.0085]], [[-0.012, 0.002, -0.002], [0.010, 0.009, 0.006]], [[0.012, 0.002, -0.002], [0.010, 0.009, 0.006]]]) {
      const info = blob('band', O, R, U, N, c, rad, Q(14, 8), Q(8, 5)), FB = buckets.band;
      for (let i = info.start; i < info.start + info.count; i++) { FB.uv[i * 2] = 0.16 + 0.05 * FB.uv[i * 2]; FB.uv[i * 2 + 1] = 0.25 + 0.5 * FB.uv[i * 2 + 1]; }
    }
    for (const [dx, len, dz, u0] of [[-0.034, 0.112, 0.010, 0.60], [0.027, 0.100, 0.006, 0.86]]) {
      const NT = Q(18, 9), tr = [], vs = [];
      for (let i = 0; i <= NT; i++) {
        const t = i / NT, w = 0.0150 * (1 - 0.12 * t) * Math.pow(sm(1.0, 0.86, t), 0.8) + 0.0004, cx = O[0] + dx * (0.25 * t + 0.75 * t * t), cy = O[1] - 0.004 - len * t, cz = O[2] + 0.004 + dz * t - 0.006 * Math.sin(t * PI) , tw = 0.25 * Math.sign(dx) * (1 - t);
        const ax = Math.cos(tw) * w, az = Math.sin(tw) * w, th = 0.0009;
        tr.push([[cx - ax, cy, cz - az - th], [cx + ax, cy, cz + az - th], [cx + ax, cy, cz + az + th], [cx - ax, cy, cz - az + th]]); vs.push(t);
      }
      const tp = loft(tr, { capB: true });
      for (let i = 0; i <= NT; i++) for (let j = 0; j < 5; j++) { const q = i * 5 + j, jj = j % 4; tp.uv[q * 2] = u0 + vs[i] * len / 0.45; tp.uv[q * 2 + 1] = jj === 0 || jj === 3 ? 0.04 : 0.96; }
      { const nm = 'tail' + (dx < 0 ? 0 : 1), root = V3(O[0], O[1] - 0.004, O[2] + 0.004), tip = V3(O[0] + dx, O[1] - 0.004 - len, O[2] + 0.004 + dz); addBone(nm, 'head', root.x, root.y, root.z);
        SOFT.push({ bone: nm, parent: 'head', root, dir: tip.clone().sub(root).normalize(), L: len, grav: 0.8, maxA: 1.3, w2: 70, c: 3.5 });
        addPart('band', tp, (x, y) => { const wb = sm(0.05, 0.6, (root.y - y) / len); return [BI[nm], wb, BI.head, 1 - wb]; }, { out: V3(O[0] + dx * 0.5, O[1] - len / 2, O[2] + 0.05) }); }
    }
  })();
  (function buildGem() {                            // the turquoise in its gold setting, at the middle of the band on her forehead
    const pb = bandPh(0), O = bandPt(0, pb, 0.0036), u1 = bandPt(0, pb - 0.02, 0.0036), u2 = bandPt(0, pb + 0.02, 0.0036);
    const U = V3(u1[0] - u2[0], u1[1] - u2[1], u1[2] - u2[2]).normalize(), R = V3(1, 0, 0), N = V3().crossVectors(R, U).normalize();
    const at = (r, u, n) => V3(O[0] + R.x * r + U.x * u + N.x * n, O[1] + R.y * r + U.y * u + N.y * n, O[2] + R.z * r + U.z * u + N.z * n);
    blob('gem', O, R, U, N, [0, 0, 0.0012], [0.0086, 0.0119, 0.0046], Q(28, 14), Q(14, 8));
    const ep = []; for (let i = 0; i <= 40; i++) { const t = (i / 40) * TAU; ep.push(at(0.0099 * Math.cos(t), 0.0132 * Math.sin(t), 0.0012)); }
    addPart('gold', loft(tubeRings(ep, ep.map(() => 0.0015), Q(8, 5), N)), wHead, { out: at(0, 0, -0.02), flip: true });
    blob('gold', O, R, U, N, [0, 0, -0.0006], [0.0112, 0.0146, 0.0012], Q(24, 12), 4);                                // the plate behind
    const NB = Q(26, 14); for (let i = 0; i < NB; i++) { const t = (i / NB) * TAU; blob('gold', O, R, U, N, [0.0121 * Math.cos(t), 0.0154 * Math.sin(t), 0.0010], [0.00115, 0.00115, 0.00115], 6, 4); }
    for (const sx of [-1, 1]) { blob('gold', O, R, U, N, [sx * 0.0162, 0.0030, 0.0008], [0.0044, 0.0019, 0.0014], 8, 5); blob('gold', O, R, U, N, [sx * 0.0160, -0.0030, 0.0008], [0.0040, 0.0018, 0.0014], 8, 5); blob('gold', O, R, U, N, [sx * 0.0132, 0, 0.0012], [0.0017, 0.0017, 0.0015], 6, 4); }
    blob('gold', O, R, U, N, [0, 0.0176, 0.0012], [0.0022, 0.0022, 0.0020], 8, 5); for (const sx of [-1, 1]) blob('gold', O, R, U, N, [sx * 0.0040, 0.0166, 0.0010], [0.0016, 0.0016, 0.0015], 6, 4);
    blob('gold', O, R, U, N, [0, -0.0176, 0.0012], [0.0023, 0.0023, 0.0021], 8, 5); blob('gold', O, R, U, N, [0, -0.0208, 0.0008], [0.0012, 0.0012, 0.0012], 6, 4);
    // the drop hangs straight down from under the gem and rests on her forehead
    const top = at(0, -0.0222, 0.0008), dr = [];
    for (const [t, r] of [[0, 0.0005], [0.18, 0.0011], [0.42, 0.0024], [0.66, 0.0035], [0.84, 0.0033], [0.95, 0.0021], [1, 0.0006]]) dr.push(ringXZ(top.x, top.y - 0.0105 * t, top.z + 0.0042 * t, r, r, r, Q(12, 8)));
    addPart('gold', loft(dr, { capA: true, capB: true }), wHead, { out: V3(top.x, top.y - 0.006, top.z) });
  })();
  // loose hair: soft wavy locks that have slipped the bun, at her temples, round her ears and at the nape. Each is a flat, twisting
  // ribbon wearing fine strands with gaps between them, so it reads as a wisp of hair and not a cord.
  (function buildLocks() {
    const LOCKS = [[0.058, 1.556, 0.046, 0.095, 0.0060, 1.6, 0.006, 0.008], [0.064, 1.545, 0.026, 0.150, 0.0080, 2.0, 0.004, 0.010], [0.069, 1.530, 0.004, 0.120, 0.0070, 1.8, 0.006, 0.004],
      [0.070, 1.512, -0.046, 0.140, 0.0090, 2.1, 0.004, -0.002], [0.058, 1.490, -0.066, 0.118, 0.0080, 1.8, 0.004, -0.004], [0.040, 1.470, -0.082, 0.105, 0.0070, 1.6, 0.000, -0.006],
      [0.016, 1.462, -0.090, 0.085, 0.0060, 1.4, 0.002, -0.004], [0.047, 1.568, 0.060, 0.050, 0.0040, 1.0, 0.010, 0.008]];     // root x, y, z, length, wave size, waves, drift out, drift forward
    let n = 0;
    for (const [S, sg] of SIDES) for (const [x, y, z, len, cr, turns, ox, oz] of LOCKS) {
      const NS = Q(30, 14), pts = [], rad = [], ph0 = 2.3 * n + (sg > 0 ? 0.9 : 0), L = len * (sg > 0 ? 1 : 0.88); n++;
      for (let i = 0; i <= NS; i++) { const t = i / NS, k = cr * Math.pow(t, 0.6), w = ph0 + t * turns * TAU; pts.push(V3(sg * (x + ox * t + k * 0.5 * Math.cos(w * 0.93)), y - L * t, z + oz * t + k * Math.sin(w))); rad.push([lerp(0.0050, 0.0022, t), lerp(0.0010, 0.0005, t)]); }
      const lp = loft(tubeRings(pts, rad, 8, V3(sg, 0, 0.3), 1.6 + 0.5 * Math.sin(n)), { uS: 1, vS: 1 });
      for (let i = 0; i < lp.uv.length; i += 2) lp.uv[i] = lp.uv[i] * 0.5 + 0.137 * n;
      { const nm = 'lock' + n, root = V3(sg * x, y, z), tip = V3(sg * (x + ox), y - L, z + oz); addBone(nm, 'head', root.x, root.y, root.z);
        SOFT.push({ bone: nm, parent: 'head', root, dir: tip.clone().sub(root).normalize(), L, grav: 0.5, maxA: 1.0, w2: 110, c: 5 });
        addPart('lock', lp, (px, py) => { const wb = sm(0.05, 0.6, (y - py) / L); return [BI[nm], wb, BI.head, 1 - wb]; }, { out: V3(sg * x, y - L / 2, z) }); }
    }
  })();

  // ---------- glasses: thin dark wire, lenses a little wider than tall, a faint lilac tint (sizes read off C2, the shape from C12) ----------
  (function buildGlasses() {
    const G = { cx: 0.0329, cy: 1.5036, rx: 0.0229, ry: 0.0197, z: 0.0905, wrap: 0.11, wire: 0.00085 };
    const zAt = (x) => G.z - G.wrap * Math.max(0, Math.abs(x) - 0.012);                       // the front bows back a little toward the temples
    const tube = (key, pts, r, n) => addPart(key, loft(tubeRings(pts, pts.map((p, i) => (typeof r === 'function' ? r(i / (pts.length - 1)) : r)), n || Q(7, 5)), { capA: true, capB: true }), wHead, { out: pts[Math.floor(pts.length / 2)].clone().add(V3(0, 0, -0.01)), flip: true });
    for (const [S, sg] of SIDES) {
      const rim = [], NR = Q(56, 28), fan = [[], []];
      for (let i = 0; i <= NR; i++) { const t = (i / NR) * TAU, x = sg * (G.cx + G.rx * Math.cos(t)), y = G.cy + G.ry * Math.sin(t); rim.push(V3(x, y, zAt(x))); }
      addPart('wire', loft(tubeRings(rim, rim.map(() => G.wire), Q(7, 5), V3(0, 0, 1))), wHead, { out: V3(sg * G.cx, G.cy, G.z - 0.02), flip: true });
      // the lens: a thin disc just inside the rim
      const lr = [];
      for (const k of [0.02, 0.35, 0.68, 0.985]) { const ring = []; for (let i = 0; i < NR; i++) { const t = (i / NR) * TAU, x = sg * (G.cx + G.rx * k * Math.cos(t)); ring.push([x, G.cy + G.ry * k * Math.sin(t), zAt(x) + 0.0009 * (1 - k * k)]); } lr.push(ring); }
      addPart('lens', loft(lr, { capA: true }), wHead, { out: V3(sg * G.cx, G.cy, G.z - 0.05) , flip: true });
      // nose pad and its little arm
      const px = sg * 0.0088, py = 1.4990, pz = G.z - 0.0075;
      tube('wire', curvePts([V3(sg * (G.cx - G.rx * 0.93), G.cy - G.ry * 0.36, zAt(G.cx - G.rx * 0.93)), V3(sg * 0.0100, 1.5000, G.z - 0.0035), V3(px, py, pz + 0.0012)], 8), 0.00055, 5);
      const pr = []; for (let i = 0; i <= 6; i++) { const ph = lerp(0.15, PI - 0.15, i / 6); pr.push(ringXZ(px, py + 0.0036 * Math.cos(ph), pz, 0.0010 * Math.sin(ph) + 0.0002, 0.0019 * Math.sin(ph) + 0.0002, 0.0019 * Math.sin(ph) + 0.0002, 8)); }
      addPart('pad', loft(pr, { capA: true, capB: true }), wHead, { out: V3(px, py, pz) });
      // end piece, then the arm back over the ear and down behind it
      const xo = sg * (G.cx + G.rx), yo = G.cy + 0.0068;
      tube('wire', curvePts([V3(sg * (G.cx + G.rx * 0.93), G.cy + G.ry * 0.37, zAt(G.cx + G.rx * 0.93)), V3(xo + sg * 0.0030, yo + 0.0008, zAt(xo) - 0.0006), V3(xo + sg * 0.0048, yo + 0.0010, zAt(xo) - 0.0050)], 8), 0.0010, 6);
      tube('wire', curvePts([V3(xo + sg * 0.0048, yo + 0.0010, zAt(xo) - 0.0050), V3(sg * 0.0655, 1.5140, 0.0450), V3(sg * 0.0690, 1.5200, 0.0050), V3(sg * 0.0705, 1.5235, -0.0170), V3(sg * 0.0690, 1.5200, -0.0330), V3(sg * 0.0660, 1.5080, -0.0420), V3(sg * 0.0640, 1.4960, -0.0440)], Q(40, 20)), (t) => (t > 0.72 ? lerp(0.0008, 0.0014, sm(0.72, 0.86, t)) : 0.0008), 6);
    }
    // bridge
    const bx = G.cx - G.rx * Math.cos(0.62), by = G.cy + G.ry * Math.sin(0.62);
    tube('wire', curvePts([V3(-bx, by, zAt(bx)), V3(-bx * 0.5, by + 0.0022, G.z + 0.0012), V3(0, by + 0.0030, G.z + 0.0016), V3(bx * 0.5, by + 0.0022, G.z + 0.0012), V3(bx, by, zAt(bx))], 14), G.wire, 6);
  })();
  // ---------- her belts, satchel, pouch and strap hooks as real objects (stage five) ----------
  const BAGBOX = {};       // each bag as a plain box in its own frame, for keeping her hands out of it (R99, clearHands)
  // Sizes and places are read off A1 (front, 898 px a metre), A2 (back) and A3 (sides); the leather is cut from F6 (bake_gear_r.py).
  //   Belts: two, 2.2 cm wide. Each lies in a tilted plane round her hips. A (ring buckle, front right) is high on her right hip and low on
  //   her left; B (square buckle, front left) is the other way. They cross at the middle, front and back, 96 cm up. In A1 they run from
  //   103 cm at the high hip to 92 cm at the low one: a slope of 0.38.
  //   Satchel: 20 cm across, 19 tall, 6.5 deep at the foot. It hangs by two loops from belt A on her right hip, a little forward of her side.
  //   Pouch: 9.3 cm across, 14 tall. It hangs from belt B behind her left hip.
  //   Strap hooks: where each shoulder strap comes over, front and back (133 and 134 cm up, 11.5 cm out): a brass buckle and two black
  //   iron curls, each curl 2.6 cm across and 3.9 tall, in rod 6 mm thick.
  let gearTick = null, gearKick = null, gearSettle = null;       // set below: swing the bags and charms, give them a push, let them come to rest
  (function buildGear() {
    if (!BAKED || !BAKED.gearLayout) return;
    const HANG = [];
    const GL = BAKED.gearLayout, P3 = (a) => V3(a[0], a[1], a[2]), wHip = () => [BI.hips, 1];
    const gUV = (name, px, py) => { const L = GL[name]; return [(L[0] + (px - L[4]) / (L[6] - L[4]) * L[2]) / 1024, 1 - (L[1] + (py - L[5]) / (L[7] - L[5]) * L[3]) / 1024]; };
    // the surface of her body and the way it faces
    const surf = (u, y) => { const p = P3(rTorso(u, y)), du = P3(rTorso(u + 0.003, y)).sub(P3(rTorso(u - 0.003, y))), dv = P3(rTorso(u, y + 0.004)).sub(P3(rTorso(u, y - 0.004))), n = du.cross(dv).normalize(); if (n.x * p.x + n.z * (p.z + 0.02) < 0) n.negate(); return { p, n }; };
    const onBody = (p, lift) => { const e = surf(rTorsoU(p.x, p.y, p.z), p.y); return e.p.addScaledVector(e.n, lift); };
    // small builders
    const tube = (key, pts, r, wf, closed) => { const P = closed ? pts.concat([pts[0].clone()]) : pts, c = P.reduce((a, p) => a.add(p), V3()).multiplyScalar(1 / P.length); addPart(key, loft(tubeRings(P, P.map((p, i) => (typeof r === 'function' ? r(i / (P.length - 1)) : r)), 7), closed ? {} : { capA: true, capB: true }), wf, { out: c }); };
    const dome = (key, c, n, r, h, wf) => { const t1 = (Math.abs(n.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0)).cross(n).normalize(), t2 = V3().crossVectors(n, t1), rings = [];
      for (let i = 0; i <= 4; i++) { const ph = (i / 4) * PI / 2 * 0.96, ring = []; for (let j = 0; j < 9; j++) { const a = (j / 9) * TAU; ring.push(c.clone().addScaledVector(t1, r * Math.cos(ph) * Math.cos(a)).addScaledVector(t2, r * Math.cos(ph) * Math.sin(a)).addScaledVector(n, h * Math.sin(ph)).toArray()); } rings.push(ring); }
      addPart(key, loft(rings, { capB: true }), wf, { out: c.clone().addScaledVector(n, -0.002) }); };
    const roundRect = (c, t, w, a, b, rc, n) => { const pts = []; for (let k = 0; k < 4; k++) { const sx = k === 0 || k === 3 ? 1 : -1, sy = k < 2 ? 1 : -1, cx0 = sx * (a - rc), cy0 = sy * (b - rc); for (let j = 0; j <= n; j++) { const ang = (k + j / n) * PI / 2; pts.push(c.clone().addScaledVector(t, cx0 + rc * Math.cos(ang)).addScaledVector(w, cy0 + rc * Math.sin(ang))); } } return pts; };

    // ---- the two belts ----
    const BELT = { hw: 0.012, th: 0.0036, off: 0.0018, y0: 0.962, k: 0.38 };
    const beltPt = (sgn, u) => { let y = BELT.y0; for (let i = 0; i < 7; i++) y = BELT.y0 + sgn * BELT.k * rTorso(u, y)[0]; return surf(u, y); };
    const mkBelt = (sgn, over) => {
      const N = Q(220, 120), F = [];
      for (let i = 0; i < N; i++) F.push(beltPt(sgn, i / N));
      let L = 0; const Ls = [0];
      for (let i = 0; i < N; i++) {
        const a = F[(i + N - 1) % N].p, b = F[(i + 1) % N].p, e = F[i]; e.t = b.clone().sub(a).normalize(); e.n.addScaledVector(e.t, -e.n.dot(e.t)).normalize(); e.w = V3().crossVectors(e.n, e.t); if (e.w.y < 0) e.w.negate();
        e.off = BELT.off + (over ? (BELT.th + 0.0007) * sm(0.070, 0.034, Math.abs(e.p.x)) : 0);       // where the belts cross, this one lies on top
        L += e.p.distanceTo(F[(i + 1) % N].p); Ls.push(L);
      }
      const nT = Math.round(L / ((BAKED.beltPitch || 0.0204) * BELT.hw / 0.011)), pitch = L / nT, r = 0.0014, VV = [0.06, 0.02, 0.07, 0.93, 0.98, 0.94], rings = [];
      const sect = (e) => { const b = e.p.clone().addScaledVector(e.n, e.off), q = (s, d) => b.clone().addScaledVector(e.w, s).addScaledVector(e.n, d).toArray(); return [q(-BELT.hw + r, 0), q(-BELT.hw, BELT.th / 2), q(-BELT.hw + r, BELT.th), q(BELT.hw - r, BELT.th), q(BELT.hw, BELT.th / 2), q(BELT.hw - r, 0)]; };
      for (let i = 0; i <= N; i++) rings.push(sect(F[i % N]));
      const part = loft(rings);
      for (let i = 0; i <= N; i++) for (let j = 0; j <= 6; j++) { part.uv[(i * 7 + j) * 2] = Ls[i] / pitch; part.uv[(i * 7 + j) * 2 + 1] = VV[j % 6]; }
      addPart('belt', part, (x, y, z) => wTorso(x, y, z), { out: V3(0, BELT.y0, -0.02) });
      const at = (s) => { s = ((s % L) + L) % L; let i = 0; while (i < N - 1 && Ls[i + 1] < s) i++; const f = (s - Ls[i]) / (Ls[i + 1] - Ls[i]), a = F[i], b = F[(i + 1) % N];
        return { p: a.p.clone().lerp(b.p, f), n: a.n.clone().lerp(b.n, f).normalize(), t: a.t.clone().lerp(b.t, f).normalize(), w: a.w.clone().lerp(b.w, f).normalize(), off: lerp(a.off, b.off, f), s }; };
      const sOfX = (x, front) => { let best = 0, bd = 1e9; for (let i = 0; i < N; i++) { const p = F[i].p; if ((p.z > -0.02) !== front) continue; const dd = Math.abs(p.x - x); if (dd < bd) { bd = dd; best = i; } } return Ls[best]; };
      const sOfU = (u) => Ls[Math.round((((u % 1) + 1) % 1) * N) % N];
      const above = (O, ex, X, s0) => { let bs = s0, bd = 1e9; for (let k = -160; k <= 160; k++) { const s = s0 + k * 0.0012, d = Math.abs(at(s).p.clone().sub(O).dot(ex) - X); if (d < bd) { bd = d; bs = s; } } return at(bs); };
      return { F, L, Ls, pitch, nT, at, sOfX, sOfU, sgn, above };
    };
    const beltA = mkBelt(-1, false), beltB = mkBelt(1, true);
    const studs = (B, skip) => { for (let k = 0; k < B.nT; k++) { const s = (k + 0.5) * B.pitch; if (skip.some(([c, d]) => Math.abs(((s - c + B.L * 1.5) % B.L) - B.L / 2) < d)) continue; const e = B.at(s); dome('steel', e.p.clone().addScaledVector(e.n, e.off + BELT.th - 0.0002), e.n, 0.0029, 0.0019, (x, y, z) => wTorso(x, y, z)); } };
    const keeper = (B, s, key, more) => { const rings = []; for (const ds of [-0.004, 0.004]) { const e = B.at(s + ds), b = e.p.clone().addScaledVector(e.n, e.off - 0.0004), hw = BELT.hw + 0.0013, th = BELT.th + 0.0018 + (more || 0), q = (a, d) => b.clone().addScaledVector(e.w, a).addScaledVector(e.n, d).toArray(); rings.push([q(-hw, 0), q(-hw, th), q(hw, th), q(hw, 0)]); }
      const part = loft(rings, { capA: true, capB: true }), uv0 = gUV('plain', 960, 800); for (let i = 0; i < part.uv.length / 2; i++) { part.uv[i * 2] = uv0[0] + 0.02 * ((i % 5) / 5); part.uv[i * 2 + 1] = uv0[1] + 0.01 * (i % 2); }
      addPart(key || 'gear', part, (x, y, z) => wTorso(x, y, z), { out: B.at(s).p }); };
    // the end of a belt past its buckle: a second layer lying on the belt, with a round tip and punched holes
    const tail = (B, s0, dir, len) => { const n = Q(22, 12), rows = [], hwT = BELT.hw - 0.0005, tip = 0.013, wf = (x, y, z) => wTorso(x, y, z);
      for (let i = 0; i <= n; i++) { const d = len * i / n, e = B.at(s0 + dir * d), k = d > len - tip ? Math.sqrt(Math.max(0.0004, 1 - Math.pow((d - (len - tip)) / tip, 2))) : 1, c = e.p.clone().addScaledVector(e.n, e.off + BELT.th), row = [];
        for (const q of [-1, -0.86, 0, 0.86, 1]) row.push(c.clone().addScaledVector(e.w, q * hwT * k * dir).addScaledVector(e.n, Math.abs(q) === 1 ? 0.0006 : BELT.th * (i === n ? 0.5 : 1)).toArray());
        rows.push(row); }
      const part = loft(rows, { open: true });
      for (let i = 0; i <= n; i++) for (let j = 0; j < 5; j++) { const tw = (len * i / n) / B.pitch * 0.5, tri = Math.abs(((tw % 1) + 1) % 1 - 0.5) * 2; part.uv[(i * 5 + j) * 2] = 0.80 + 0.40 * tri; part.uv[(i * 5 + j) * 2 + 1] = [0.05, 0.10, 0.5, 0.90, 0.95][dir > 0 ? j : 4 - j]; }
      addPart('belt', part, wf, { out: B.at(s0 + dir * len / 2).p });
      for (let d = 0.034; d < len - 0.012; d += 0.024) { const e = B.at(s0 + dir * d); dome('beltHole', e.p.clone().addScaledVector(e.n, e.off + BELT.th * 2 + 0.0001), e.n, 0.0019, 0.0003, wf); } };
    // belt A: a ring buckle at her front right, with its prong
    { const s = beltA.sOfX(-0.077, true), e = beltA.at(s), c = e.p.clone().addScaledVector(e.n, e.off + BELT.th * 2 + 0.0022), ring = [];
      for (let j = 0; j < 24; j++) { const a = (j / 24) * TAU; ring.push(c.clone().addScaledVector(e.t, 0.0140 * Math.cos(a)).addScaledVector(e.w, 0.0152 * Math.sin(a))); }
      tube('steel', ring, 0.0024, (x, y, z) => wTorso(x, y, z), true);
      tube('steel', [c.clone().addScaledVector(e.t, -0.0140).addScaledVector(e.n, 0.0012), c.clone().addScaledVector(e.n, 0.0024), c.clone().addScaledVector(e.t, 0.0138).addScaledVector(e.n, 0.0014)], 0.0015, (x, y, z) => wTorso(x, y, z));
      keeper(beltA, s + 0.027, null, BELT.th); tail(beltA, s - 0.012, 1, 0.050); beltA.buckle = s; }
    // belt B: a square buckle at her front left
    { const s = beltB.sOfX(0.090, true), e = beltB.at(s), c = e.p.clone().addScaledVector(e.n, e.off + BELT.th * 2 + 0.0020);
      tube('steel', roundRect(c, e.t, e.w, 0.0150, 0.0160, 0.0038, 4), 0.0022, (x, y, z) => wTorso(x, y, z), true);
      tube('steel', [c.clone().addScaledVector(e.t, 0.0150).addScaledVector(e.n, 0.0010), c.clone().addScaledVector(e.n, 0.0022), c.clone().addScaledVector(e.t, -0.0147).addScaledVector(e.n, 0.0012)], 0.0015, (x, y, z) => wTorso(x, y, z));
      keeper(beltB, s + 0.034, 'keeperB'); tail(beltB, s + 0.012, -1, 0.114); beltB.buckle = s; }

    // ---- satchel and pouch: each built to its painting in F6 and wearing it ----
    // S: the painting's numbers in F6 pixels. f: front view (left, right, top, bottom), b: back view, sd: side view (front edge, back edge, top, bottom).
    const bag = (S, B, uAnchor, drop) => {
      const sAnchor = B.sOfU(uAnchor);
      const m = S.W / (S.f[1] - S.f[0]), cxF = (S.f[0] + S.f[1]) / 2, H = (S.f[3] - S.f[2]) * m, hw0 = S.W / 2, rc = S.rc * m;
      // It hangs from the belt like a hinge: gravity swings it in until its back rests on her hip, and it turns until both halves touch.
      const e = B.at(sAnchor), UP = V3(0, 1, 0), nh = V3(e.n.x, 0, e.n.z).normalize(), hinge = e.p.clone().addScaledVector(nh, e.off + BELT.th + 0.0022);
      const body = []; for (let i = 0; i <= 80; i++) for (let j = 0; j <= 30; j++) body.push(P3(rTorso(uAnchor - 0.19 + 0.38 * i / 80, hinge.y - drop - 0.004 - (H + 0.004) * j / 30)));
      for (let j = 0; j <= 6; j++) for (const p of legRing(hinge.x < 0 ? -1 : 1, lerp(0.845, 0.775, j / 6), 1.04, 30)) body.push(P3(p));
      const lean = (yaw) => { const z0 = nh.clone().applyAxisAngle(UP, yaw), x0 = V3().crossVectors(UP, z0); let a = -1, b = -1;
        for (const p of body) { const d = p.clone().sub(hinge), X = d.dot(x0), Yd = d.y; if (Math.abs(X) > hw0 * 0.94 || Yd > -drop - 0.004 || Yd < -drop - H) continue; const t = Math.atan2(d.dot(z0), -Yd); if (X < 0) a = Math.max(a, t); else b = Math.max(b, t); }
        return [a, b, z0, x0]; };
      let best = null; for (let k = -30; k <= 30; k++) { const r = lean(k * 0.02); if (r[0] < -0.9 || r[1] < -0.9) continue; const sc = Math.abs(r[0] - r[1]) + 0.15 * Math.abs(k * 0.02); if (!best || sc < best.sc) best = { sc, r, yaw: k * 0.02 }; }
      const th = Math.min(S.maxLean || 0.2, Math.max(0, Math.max(best.r[0], best.r[1]) - (S.sink || 0.004) / (H * 0.6))), ez0 = best.r[2], ex = best.r[3];
      { let push = 0; const tn = Math.tan(th);       // where she is rounder than that lean allows, the loop lets it stand off the belt instead
        for (const p of body) { const d = p.clone().sub(hinge), X = d.dot(ex), Yd = d.y; if (Math.abs(X) > hw0 * 0.94 || Yd > -drop - 0.004 || Yd < -drop - H) continue; push = Math.max(push, d.dot(ez0) + Yd * tn - (S.sink || 0.004)); }
        hinge.addScaledVector(ez0, push); }
      const ey = UP.clone().multiplyScalar(Math.cos(th)).addScaledVector(ez0, -Math.sin(th)), ez = ez0.clone().multiplyScalar(Math.cos(th)).addScaledVector(UP, Math.sin(th));
      const O = hinge.clone().addScaledVector(ey, -drop);
      const bn = 'bag' + S.name; addBone(bn, 'hips', hinge.x, hinge.y, hinge.z); const wB = () => [BI[bn], 1]; BAGBOX[bn] = { O: O.clone(), ex: ex.clone(), ey: ey.clone(), ez: ez.clone(), H, W: S.W, D: Math.max(S.D[0], S.D[1]), drop };       // its own bone, at the hinge, so it can swing and be pushed out by her thigh
      { const sd = hinge.x < 0 ? 'R' : 'L', inFoot = (p) => { const d = p.clone().sub(hinge); return Math.abs(d.dot(ex)) < hw0 * 0.94 && d.y < -drop - 0.004 && d.y > -drop - H - 0.01; }, ang = (p) => Math.atan2(p.clone().sub(hinge).dot(ez0), hinge.y - p.y);
        let needT = -1; for (const p of body) if (inFoot(p)) needT = Math.max(needT, ang(p));
        const pts = []; for (let j = 0; j <= 18; j++) { const y = lerp(0.87, 0.69, j / 18); for (const q of legRing(sd === 'R' ? -1 : 1, y, 1.04, 30)) { const p = P3(q); if (inFoot(p)) pts.push({ p, w: 1 - sm(0.78, 0.87, y) }); } }
        HANG.push({ kind: 'bag', bone: bn, side: sd, hinge: hinge.clone(), ex: ex.clone(), ez: ez0.clone(), th0: th, clear: 0, needT, need0: pts.reduce((m, q) => Math.max(m, ang(q.p)), needT), pts, L: drop + H * 0.55, damp: 3.0, bMax: 0.05, lean: true, a: 0, b: 0, va: 0, vb: 0 }); }
      if (typeof window !== 'undefined') (window.__gear = window.__gear || {})[S.name] = { yaw: best.yaw, lean: th, O: O.toArray(), ex: ex.toArray(), ez: ez.toArray(), box: [[-hw0, 0, 0], [hw0, 0, 0], [-hw0, -H, 0], [hw0, -H, 0], [-hw0, 0, S.D[1]], [hw0, 0, S.D[1]], [-hw0, -H, S.D[0]], [hw0, -H, S.D[0]]].map(([X, Y, Z]) => O.clone().addScaledVector(ex, X).addScaledVector(ey, Y).addScaledVector(ez, Z).toArray()) };
      const W3 = (X, Y, Z) => O.clone().addScaledVector(ex, X).addScaledVector(ey, Y).addScaledVector(ez, Z), A = (X, Y, Z) => W3(X, Y, Z).toArray();
      const halfW = (Y) => { const h = Y + H; return h < rc ? hw0 - rc + Math.sqrt(Math.max(0, rc * rc - (rc - h) * (rc - h))) : hw0; };
      const depth = (Y) => lerp(S.D[0], S.D[1], cl((Y + H) / H, 0, 1)) * (0.55 + 0.45 * Math.sqrt(sm(0, 0.03, Y + H)));
      const zF = (X, Y) => depth(Y) * (1 - 0.10 * Math.pow(X / hw0, 2)) * (1 - 0.30 * sm(0.80, 1.0, Math.abs(X) / Math.max(1e-6, halfW(Y))));
      // the painted bag has round shoulders: near its top the picture is read a little narrower, so no background comes in at the corners
      const uvF = (X, Y) => { const py = S.f[2] - Y / m; return gUV(S.name + 'Front', cxF + (X / m) * 0.975 * lerp(S.topK, 1, sm(S.f[2] - 5, S.f[2] + S.topR, py)), py); }, inside = W3(0, -H / 2, S.D[0] / 2);
      const sheet = (rows, uvs, key) => { const part = loft(rows, { open: true }); for (let i = 0; i < uvs.length; i++) { part.uv[i * 2] = uvs[i][0]; part.uv[i * 2 + 1] = uvs[i][1]; } addPart(key || 'gear', part, wB, { out: inside }); };
      const NX = Q(14, 8), NY = Q(16, 9);
      // back and front
      { const rb = [], ub = [], rf = [], uf = [], cxB = (S.b[0] + S.b[1]) / 2, mB = S.W / (S.b[1] - S.b[0]);
        for (let i = 0; i <= NY; i++) { const Y = -H * i / NY, hw = halfW(Y), r1 = [], r2 = [];
          for (let j = 0; j <= NX; j++) { const X = lerp(-hw, hw, j / NX); r1.push(A(X, Y, 0)); ub.push(S.b.length ? gUV(S.name + 'Back', cxB - X / mB, S.b[2] + (-Y / H) * (S.b[3] - S.b[2])) : gUV('plain', 900 + 150 * (j / NX), 730 + 170 * (i / NY))); r2.push(A(X, Y, zF(X, Y))); uf.push(uvF(X, Y)); }
          rb.push(r1); rf.push(r2); }
        sheet(rb, ub); sheet(rf, uf); }
      // the strip between them, down one side, across the foot and up the other
      { const path = [], n1 = Q(8, 5), n2 = Q(7, 4);
        for (let i = 0; i <= n1; i++) path.push([-hw0, lerp(0, -H + rc, i / n1)]);
        for (let i = 1; i <= n2; i++) { const a = (i / n2) * PI / 2; path.push([-hw0 + rc - rc * Math.cos(a), -H + rc - rc * Math.sin(a)]); }
        for (let i = 1; i <= n2; i++) { const a = (i / n2) * PI / 2; path.push([hw0 - rc + rc * Math.sin(a), -H + rc - rc * Math.cos(a)]); }
        for (let i = 1; i <= n1; i++) path.push([hw0, lerp(-H + rc, 0, i / n1)]);
        const rows = [], uvs = [];
        for (const [X, Y] of path) { const zf = zF(X, Y), row = []; for (let k = 0; k <= 3; k++) { const Z = zf * k / 3, bow = 0.004 * Math.sin(PI * k / 3) * Math.sign(X) * sm(0.6, 1, Math.abs(X) / hw0); row.push(A(X + bow, Y, Z));
            uvs.push(S.sd.length ? gUV(S.name + 'Side', S.sd[1] - (Z / S.D[0]) * (S.sd[1] - S.sd[0]), S.sd[2] + cl(-Y / H, 0, 1) * (S.sd[3] - S.sd[2])) : gUV('plain', 900 + 150 * (k / 3), 730 + 170 * cl(-Y / H, 0, 1))); } rows.push(row); }
        sheet(rows, uvs); }
      // the flap: from the back, over the top and down the front to its curved edge, standing a little proud
      { const hwF = hw0 + 0.002, fe = (X) => -(S.flap[0] - 0.5 * (S.flap[0] - S.flap[1]) * 2 * Math.pow(sm(0.74, 1.0, Math.abs(X) / hwF), 1.6) - S.f[2]) * m;       // how far down the flap comes at X
        const NTOP = 6, NF = Q(9, 6), rows = [], uvs = [];
        const col = (X) => { const zt = zF(X, 0), pts = [[-0.012, -0.0022], [0.003, -0.0018], [0.0085, 0.004], [0.0105, zt * 0.5], [0.0075, zt + 0.001], [0.0, zt + 0.0048]].map(([Y, Z]) => [X, Y, Z, 0]), end = fe(X); for (let i = 1; i <= NF; i++) { const Y = end * i / NF; pts.push([X, Y, zF(X, Y) + 0.0048, 1]); } return pts; };
        const cols = []; for (let j = 0; j <= NX; j++) cols.push(col(lerp(-hwF, hwF, j / NX)));
        for (let i = 0; i < cols[0].length; i++) { const row = []; for (let j = 0; j <= NX; j++) { const [X, Y, Z, fr] = cols[j][i]; row.push(A(X, Y, Z)); let arc = 0; if (!fr) for (let k = i; k < NTOP - 1; k++) arc += Math.hypot(cols[j][k + 1][1] - cols[j][k][1], cols[j][k + 1][2] - cols[j][k][2]); uvs.push(fr ? uvF(X * hw0 / hwF, Y) : uvF(X * hw0 / hwF, -0.0015 - 0.55 * arc)); } rows.push(row); }
        sheet(rows, uvs);
        const edge = [], eu = []; for (let i = NTOP - 1; i < cols[0].length; i++) edge.push(cols[0][i]); for (let j = 1; j <= NX; j++) edge.push(cols[j][cols[j].length - 1]); for (let i = cols[NX].length - 2; i >= NTOP - 1; i--) edge.push(cols[NX][i]);
        const r1 = [], r2 = []; edge.forEach(([X, Y, Z], i) => { r1.push(A(X, Y, Z)); r2.push(A(X * 0.985, Y + 0.0012, Z - 0.0040)); eu.push(gUV('plain', 905 + 140 * (i / edge.length), 800)); });
        sheet([r1, r2], eu.concat(eu.map(([a, b]) => [a, b - 0.004]))); }
      // straps and the tab that lie on the front: [left, right, top, point at the top, start of the point at the bottom, bottom], lifted off the leather
      const slab = ([x0, x1, y0, yA, yB, y1], lift) => { const rows = [], uvs = [], n = Q(12, 7), xc = (x0 + x1) / 2, hw = (x1 - x0) / 2;
        for (let i = 0; i <= n; i++) { const py = lerp(y0, y1, i / n), k = Math.min(yA > y0 ? sm(y0, yA, py) : 1, sm(y1, yB, py)), Y = -(py - S.f[2]) * m, row = [];
          for (const q of [-1, -0.82, 0, 0.82, 1]) { const px = xc + q * hw * Math.max(0.02, k), X = (px - cxF) * m; row.push(A(X, Y, zF(X, Y) + lift - (Math.abs(q) === 1 ? 0.0016 : 0))); uvs.push(gUV(S.name + 'Front', px, py)); } rows.push(row); }
        sheet(rows, uvs); };
      for (const sp of S.straps) slab(sp, 0.0030);
      for (const tb of S.tabs) slab(tb, 0.0048 + 0.0032);
      // buckles on the straps: a steel frame and its prong
      for (const [px, py, hwp, hhp] of S.buckles) { const X = (px - cxF) * m, Y = -(py - S.f[2]) * m, c = W3(X, Y, zF(X, Y) + S.bz);
        tube('steel', roundRect(c, ex, ey, hwp * m, hhp * m, 0.0034, 3), 0.0021, wB, true);
        tube('steel', [c.clone().addScaledVector(ey, hhp * m).addScaledVector(ez, 0.0008), c.clone().addScaledVector(ez, 0.0018), c.clone().addScaledVector(ey, -hhp * m).addScaledVector(ez, 0.0010)], 0.0014, wB); }
      for (const [px, py, lift] of S.studs) { const X = (px - cxF) * m, Y = -(py - S.f[2]) * m; dome('gearBrass', W3(X, Y, zF(X, Y) + lift), ez, 0.0027, 0.0018, wB); }
      // the loops it hangs by: up the back, out over the belt and down behind it
      for (const [lx0, lx1, bx0, bx1] of S.loops) { const X0 = (lx0 - cxF) * m, X1 = (lx1 - cxF) * m, span = S.loopPy[1] - S.loopPy[0], colsL = [], hw = BELT.hw, th = BELT.th;
        for (const q of [0, 0.5, 1]) { const X = lerp(X0, X1, q), b = B.above(O, ex, X, sAnchor), c = b.p.clone().addScaledVector(b.n, b.off), bq = (a, d) => c.clone().addScaledVector(b.w, a).addScaledVector(b.n, d);
          colsL.push([W3(X, -0.060, -0.0016), W3(X, -0.022, -0.0016), W3(X, -0.001, -0.0014), bq(-hw - 0.0016, th + 0.0010), bq(-hw * 0.4, th + 0.0016), bq(hw * 0.4, th + 0.0016), bq(hw + 0.0012, th + 0.0012), bq(hw + 0.0030, th * 0.4), bq(hw + 0.0008, -0.0010), bq(-hw * 0.5, -0.0010)]); }
        const rows = [], uvs = []; let acc = 0;
        for (let i = 0; i < colsL[1].length; i++) { if (i) acc += colsL[1][i].distanceTo(colsL[1][i - 1]); rows.push(colsL.map((cp) => cp[i].toArray())); for (const q of [0, 0.5, 1]) uvs.push(gUV('satBack', lerp(bx0, bx1, q), S.loopPy[1] - cl(acc / 0.13, 0, 1) * span)); }
        const part = loft(rows, { open: true }); for (let i = 0; i < uvs.length; i++) { part.uv[i * 2] = uvs[i][0]; part.uv[i * 2 + 1] = uvs[i][1]; }
        addPart('gear', part, wB, { out: B.above(O, ex, (X0 + X1) / 2, sAnchor).p.clone().addScaledVector(ey, -0.004) });
        if (typeof window !== 'undefined') (window.__gear[S.name].loops = window.__gear[S.name].loops || []).push([B.above(O, ex, X0, sAnchor).p.x, B.above(O, ex, X1, sAnchor).p.x]); }
      return { O, ex, ey, ez, ez0, H, W3, bn, D: S.D };
    };
    const SAT = { name: 'sat', W: 0.200, D: [0.065, 0.044], rc: 70, topK: 0.86, topR: 52, f: [60, 482, 512, 910], b: [757, 1203, 542, 909], sd: [546, 692, 530, 915], flap: [686, 648],
      straps: [[164, 218, 690, 690, 874, 902], [340, 392, 690, 690, 874, 902]], tabs: [[245, 308, 604, 634, 834, 864]], buckles: [[190, 779, 36, 36], [366, 779, 36, 36]], bz: 0.0030 + 0.0030,
      studs: [[277, 630, 0.0085], [269, 682, 0.0085], [286, 682, 0.0085]], loops: [[176, 226, 828, 875], [316, 366, 1072, 1119]], loopPy: [448, 675] };       // the loops sit 2 cm nearer the middle than painted, to hang clear of the ring buckle
    const POU = { name: 'pouch', W: 0.093, D: [0.040, 0.030], rc: 48, topK: 0.80, topR: 40, maxLean: 0.2, f: [1278, 1474, 564, 862], b: [], sd: [], flap: [692, 668],
      straps: [], tabs: [[1352, 1402, 648, 672, 866, 890]], buckles: [[1377, 775, 32, 33]], bz: 0.0085,
      studs: [[1376, 655, 0.0062], [1368, 690, 0.0062], [1385, 690, 0.0062]], loops: [[1347, 1402, 828, 875]], loopPy: [448, 675] };
    if (typeof window !== 'undefined') { window.__gear = window.__gear || {}; window.__gear.belts = { ring: beltA.at(beltA.buckle).p.toArray(), square: beltB.at(beltB.buckle).p.toArray(), lenA: beltA.L, lenB: beltB.L, studsA: beltA.nT, pitch: beltA.pitch, hiA: beltA.at(beltA.sOfU(0.25)).p.toArray(), loA: beltA.at(beltA.sOfU(0.75)).p.toArray(), crossF: beltA.at(beltA.sOfU(0.5)).p.toArray(), crossB: beltA.at(beltA.sOfU(0)).p.toArray() }; }
    const uSat = 0.300, uPou = 0.815, sSat = beltA.sOfU(uSat), sPou = beltB.sOfU(uPou);
    const sat = bag(SAT, beltA, uSat, 0.043), pou = bag(POU, beltB, uPou, 0.045);
    studs(beltA, [[beltA.buckle + 0.006, 0.050], [beltA.sOfU(0.5), 0.026], [beltA.sOfU(0), 0.026]]);       // none under its buckle and tail, nor where the other belt lies over it studs(beltB, [[beltB.buckle - 0.042, 0.086]]);

    // ---- charms (F7): six strings of beads. Each has its own bone at its clasp, so it can swing. ----
    // Sizes come from F7 (0.33 mm to a pixel of the sheet as shown, set by the bead string being 19 cm in A1). Three crystals hang under
    // the satchel, the bead string from the ring buckle, the cluster of gold balls from the square buckle, the amber string under the pouch.
    const UPV = V3(0, 1, 0);
    const flat = (key, tris, c0, wf) => { const pos = [], nor = [], idx = [];       // flat faces, so stones look cut
      for (const [a, b0, c1] of tris) { let b = b0, c = c1; const n = b.clone().sub(a).cross(c.clone().sub(a)).normalize(); if (n.dot(a.clone().add(b).add(c).multiplyScalar(1 / 3).sub(c0)) < 0) { n.negate(); const t = b; b = c; c = t; }
        for (const p of [a, b, c]) { idx.push(pos.length / 3); pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); } }
      addPart(key, { pos, idx }, wf, { nor }); };
    let nCharm = 0;
    const charm = (parent, top, nh0, items, free, K) => {
      const name = 'charm' + (++nCharm), nh = V3(nh0.x, 0, nh0.z).normalize(), exC = V3().crossVectors(UPV, nh), side = top.x < 0 ? 'R' : 'L';
      const LEN = { clasp: () => 0.0185, ring: () => 0.0042, link: (n) => n * 0.0034 + 0.001, bead: (r) => 1.84 * r, sp: () => 0.0026, facet: (r, h) => h, cap: (r, h) => h * 0.55, crystal: (rx, rz, h) => h, drop: (r, h) => h, cluster: (r, d) => 2 * r + 2 * d };
      const len = K * items.reduce((m, it) => m + LEN[it[0]](it[1], it[2], it[3]), 0);
      // one that hangs against her leans out just far enough to clear her
      let th = 0, needT = -9; const pts = [], ang = (p) => Math.atan2(p.clone().sub(top).dot(nh) + 0.008 * K, top.y - p.y);
      if (!free) { const u0 = rTorsoU(top.x, top.y, top.z);
        for (let i = -6; i <= 6; i++) for (let j = 0; j <= 24; j++) { const y = top.y - 0.012 - (len - 0.012) * j / 24; if (y < R_TY0) continue; needT = Math.max(needT, ang(P3(rTorso(u0 + i * 0.004, y)))); }
        for (let j = 0; j <= 16; j++) { const y = lerp(0.87, top.y - len - 0.01, j / 16); if (y > top.y - 0.012) continue; for (const q of legRing(side === 'R' ? -1 : 1, y, 1.04, 30)) { const p = P3(q); if (Math.abs(p.clone().sub(top).dot(exC)) < 0.016 && p.clone().sub(top).dot(nh) > -0.08) pts.push({ p, w: 1 - sm(0.78, 0.87, y) }); } }
        th = Math.max(0, pts.reduce((m, q) => Math.max(m, ang(q.p)), needT)); }
      const ey = UPV.clone().multiplyScalar(Math.cos(th)).addScaledVector(nh, -Math.sin(th)), ez = nh.clone().multiplyScalar(Math.cos(th)).addScaledVector(UPV, Math.sin(th));
      addBone(name, parent, top.x, top.y, top.z); const wC = () => [BI[name], 1], P = (sd, a, b) => top.clone().addScaledVector(ey, -sd * K).addScaledVector(exC, (a || 0) * K).addScaledVector(ez, (b || 0) * K);
      const ball = (key, c, r, ry) => addPart(key, spherePart(c, r * K, (ry || r) * K, r * K, 10, 7), wC, { out: c });
      const hoop = (sc, ra, rs, rod, turned, n) => { const pts2 = []; for (let j = 0; j < n; j++) { const t = (j / n) * TAU; pts2.push(turned ? P(sc - rs * Math.cos(t), 0, ra * Math.sin(t)) : P(sc - rs * Math.cos(t), ra * Math.sin(t), 0)); } tube('charmGold', pts2, rod * K, wC, true); };
      const prism = (key, s0, rings, n, rx, rz, h) => { const Rg = rings.map(([f, k]) => { const ring = []; for (let j = 0; j < n; j++) { const t = ((j + 0.5) / n) * TAU; ring.push(P(s0 + f * h, rx * k * Math.cos(t), rz * k * Math.sin(t))); } return ring; }), tris = [], A = P(s0), Z = P(s0 + h), last = Rg.length - 1;
        for (let j = 0; j < n; j++) { const k = (j + 1) % n; tris.push([A, Rg[0][j], Rg[0][k]]); for (let i = 0; i < last; i++) { tris.push([Rg[i][j], Rg[i + 1][j], Rg[i + 1][k]]); tris.push([Rg[i][j], Rg[i + 1][k], Rg[i][k]]); } tris.push([Z, Rg[last][k], Rg[last][j]]); }
        flat(key, tris, P(s0 + h * 0.4), wC); };
      let s = 0;
      for (const it of items) { const k = it[0];
        if (k === 'clasp') { const pts2 = []; for (let j = 0; j < 14; j++) { const t = (j / 14) * TAU; pts2.push(P(s + 0.0088 - 0.0080 * Math.cos(t), 0.0033 * Math.sin(t) * (1 - 0.22 * Math.cos(t)), 0)); } tube('charmGold', pts2, 0.0009 * K, wC, true); ball('charmGold', P(s + 0.0176), 0.0017); }
        else if (k === 'ring') hoop(s + 0.0021, 0.0026, 0.0026, 0.0007, false, 10);
        else if (k === 'link') for (let i = 0; i < it[1]; i++) hoop(s + 0.0022 + i * 0.0034, 0.0013, 0.0024, 0.00045, i % 2 === 0, 8);
        else if (k === 'bead') ball(it[2], P(s + 0.92 * it[1]), it[1]);
        else if (k === 'sp') ball('charmGold', P(s + 0.0013), 0.0017, 0.0014);
        else if (k === 'facet') prism(it[3], s, [[0.07, 0.55], [0.3, 1], [0.7, 1], [0.93, 0.55]], 8, it[1], it[1], it[2]);
        else if (k === 'cap') { const rings = [[0, 0.22], [0.25, 0.5], [0.6, 0.86], [1, 1.04]].map(([f, q]) => { const ring = []; for (let j = 0; j < 12; j++) { const t = (j / 12) * TAU; ring.push(P(s + f * it[2], it[1] * q * Math.cos(t), it[1] * q * Math.sin(t) * (it[3] || 1)).toArray()); } return ring; }); addPart('charmGold', loft(rings, { capA: true }), wC, { out: P(s + it[2] * 0.6) }); }
        else if (k === 'crystal') prism('crystal', s, [[0.10, 0.60], [0.30, 1]], 6, it[1], it[2], it[3]);
        else if (k === 'drop') prism(it[3], s, [[0.05, 0.42], [0.20, 0.86], [0.42, 1], [0.70, 0.60]], 8, it[1], it[1], it[2]);
        else if (k === 'cluster') { const r = it[1], d = it[2]; ball('charmGold', P(s + r), r); ball('charmGold', P(s + r + d, -d), r); ball('charmGold', P(s + r + d, d), r); ball('charmGold', P(s + r + 2 * d), r); }
        s += LEN[k](it[1], it[2], it[3]); }
      HANG.push({ kind: 'charm', bone: name, side, hinge: top.clone(), ex: exC, ez: nh, th0: th, clear: 0.008 * K, needT, need0: th, pts, L: Math.max(0.05, len * 0.62), damp: 2.2, bMax: 0.9, lean: !free, a: 0, b: 0, va: 0, vb: 0 });
    };
    const G = 'charmGold';
    const CRYSTAL = (links, rb, rx, h) => [['clasp'], ['ring'], ['link', links], ['bead', rb, G], ['sp'], ['bead', 0.0038, 'teal'], ['sp'], ['link', 2], ['cap', rx * 0.98, 0.016, 0.62], ['crystal', rx, rx * 0.56, h]];
    { const bot = (X, Zf) => sat.W3(X, -sat.H + (Math.abs(X) > 0.06 ? 0.006 : 0.001), sat.D[0] * Zf);       // three crystals under the satchel, toward her back as in A1
      charm(sat.bn, bot(-0.074, 0.55), sat.ez0, CRYSTAL(4, 0.0062, 0.0130, 0.042), true, 1.1);
      charm(sat.bn, bot(-0.046, 0.62), sat.ez0, CRYSTAL(6, 0.0056, 0.0118, 0.038), true, 1.1);
      charm(sat.bn, bot(-0.020, 0.52), sat.ez0, CRYSTAL(3, 0.0058, 0.0112, 0.040), true, 1.1); }
    { const e = beltA.at(beltA.buckle), top = e.p.clone().addScaledVector(e.n, e.off + BELT.th * 2 + 0.0040).addScaledVector(e.w, -0.0170);       // the bead string, from the ring buckle
      charm('hips', top, e.n, [['clasp'], ['ring'], ['link', 3], ['bead', 0.0024, G], ['facet', 0.0055, 0.018, 'amber'], ['bead', 0.0024, G], ['bead', 0.0040, 'teal'], ['bead', 0.0024, G], ['bead', 0.0024, G], ['bead', 0.0050, 'pearl'], ['bead', 0.0024, G], ['bead', 0.0040, 'teal'], ['bead', 0.0024, G], ['link', 4], ['cap', 0.0072, 0.008], ['drop', 0.0095, 0.030, 'amber'], ['bead', 0.0024, G], ['bead', 0.0024, G], ['bead', 0.0055, 'pearl']], false, 1.1); }
    { const e = beltB.at(beltB.buckle), top = e.p.clone().addScaledVector(e.n, e.off + BELT.th * 2 + 0.0040).addScaledVector(e.w, -0.0180);       // the cluster of gold balls, from the square buckle
      charm('hips', top, e.n, [['clasp'], ['ring'], ['link', 9], ['cluster', 0.0088, 0.0095], ['link', 6], ['bead', 0.0040, 'teal'], ['bead', 0.0024, G], ['link', 2], ['cap', 0.0062, 0.007], ['drop', 0.0078, 0.032, 'amber']], false, 1.12); }
    charm(pou.bn, pou.W3(0.014, -pou.H + 0.001, pou.D[0] * 0.6), pou.ez0, [['clasp'], ['link', 5], ['bead', 0.0036, G], ['bead', 0.0038, 'teal'], ['bead', 0.0024, G], ['facet', 0.0058, 0.020, 'amber'], ['bead', 0.0024, G], ['link', 4], ['cap', 0.0060, 0.007], ['drop', 0.0068, 0.028, 'amber']], true, 1.1);       // the amber string, under the pouch

    // ---- how the hanging things move ----
    // Each is a weight on a hinge. Gravity pulls it in against her; her thigh can push it out; a push or her own movement sets it swinging.
    { const qb = new THREE.Quaternion(), Mrel = new THREE.Matrix4(), tv = V3(), tw = V3(), ta = V3();
      const needNow = (h) => { let a = h.needT; if (!h.pts.length) return a; const tb = SK['thigh' + h.side], hp = SK.hips; Mrel.copy(hp.matrixWorld).invert().multiply(tb.matrixWorld);
        for (const q of h.pts) { tv.copy(q.p).sub(tb.userData.rest).applyMatrix4(Mrel).add(hp.userData.rest).sub(q.p).multiplyScalar(q.w).add(q.p).sub(h.hinge); if (-tv.y < 0.012) continue; a = Math.max(a, Math.atan2(tv.dot(h.ez) + h.clear, -tv.y)); } return a; };
      const floor = (h) => (h.lean ? Math.max(0, needNow(h) - h.need0) : -0.7);
      const apply = (h) => { SK[h.bone].quaternion.setFromAxisAngle(h.ex, -h.a).multiply(qb.setFromAxisAngle(h.ez, h.b)); };
      gearSettle = () => { for (const h of HANG) { h.a = h.lean ? floor(h) : 0; h.b = 0; h.va = 0; h.vb = 0; h.pw = null; h.pv = null; apply(h); } };
      gearKick = () => { HANG.forEach((h, i) => { h.va += h.kind === 'bag' ? 4.0 : 2.6; h.vb += h.kind === 'bag' ? 0 : (i % 2 ? 1.9 : -1.9); }); };
      gearTick = (dt) => { if (!(dt > 0)) return; dt = Math.min(dt, 0.05); const n = Math.ceil(dt / 0.008), st = dt / n;
        for (const h of HANG) { const bone = SK[h.bone]; bone.getWorldPosition(tw); let ia = 0, ib = 0;
          if (h.pw) { tv.copy(tw).sub(h.pw).multiplyScalar(1 / dt); if (h.pv) { ta.copy(tv).sub(h.pv).multiplyScalar(1 / dt); const pm = bone.parent.matrixWorld; ia = cl(-ta.dot(tw.copy(h.ez).transformDirection(pm)) / h.L, -80, 80); ib = cl(-ta.dot(tw.copy(h.ex).transformDirection(pm)) / h.L, -80, 80); bone.getWorldPosition(tw); } (h.pv || (h.pv = V3())).copy(tv); }
          (h.pw || (h.pw = V3())).copy(tw);
          const lo = floor(h), w2 = 9.8 / h.L;
          for (let k = 0; k < n; k++) { h.va += (-w2 * Math.sin(h.th0 + h.a) - h.damp * h.va + ia) * st; h.a += h.va * st; if (h.a < lo) { h.a = lo; if (h.va < 0) h.va *= -0.12; h.vb *= Math.max(0, 1 - 8 * st); }
            h.vb += (-w2 * (h.kind === 'bag' ? 6 : 1) * Math.sin(h.b) - h.damp * h.vb + ib) * st; h.b = cl(h.b + h.vb * st, -h.bMax, h.bMax); }
          apply(h); } };
      if (typeof window !== 'undefined') window.__gear.hang = HANG.map((h) => ({ bone: h.bone, th0: +h.th0.toFixed(3), pts: h.pts.length, L: +h.L.toFixed(3) })); }

    // ---- strap hooks: a brass buckle on each shoulder strap and a black iron curl either side of it, front and back ----
    // Each sits where the flat painted one was on her body picture (bake_ranger.py paints those out). Shapes are read off A1 (front) and
    // A2 (back): in front an oval ring with an upright prong, behind a narrow bar with a tooth; the outer curl is the bigger one.
    // They are laid on the real outer skin of chest and shoulder, found by looking straight at her from the front or the back.
    const TRI = [];
    for (const k of ['torso', 'armL', 'armR']) { const Bk = buckets[k]; if (!Bk) continue; const P = Bk.pos, I = Bk.idx;
      for (let i = 0; i < I.length; i += 3) { const a = I[i] * 3, b = I[i + 1] * 3, c = I[i + 2] * 3; if (Math.max(P[a + 1], P[b + 1], P[c + 1]) < 1.27 || Math.min(P[a + 1], P[b + 1], P[c + 1]) > 1.39) continue; TRI.push([P[a], P[a + 1], P[a + 2], P[b], P[b + 1], P[b + 2], P[c], P[c + 1], P[c + 2]]); } }
    const castZ = (x, y, front) => { let best = null;
      for (const t of TRI) { const d = (t[4] - t[7]) * (t[0] - t[6]) + (t[6] - t[3]) * (t[1] - t[7]); if (Math.abs(d) < 1e-13) continue;
        const l1 = ((t[4] - t[7]) * (x - t[6]) + (t[6] - t[3]) * (y - t[7])) / d, l2 = ((t[7] - t[1]) * (x - t[6]) + (t[0] - t[6]) * (y - t[7])) / d, l3 = 1 - l1 - l2; if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        const z = l1 * t[2] + l2 * t[5] + l3 * t[8]; if (best === null || (front ? z > best : z < best)) best = z; }
      return best === null ? rTorso(rTorsoU(x, y, front ? 0.1 : -0.1), y)[2] : best; };
    const skin = (x, y, front, lift) => { const h = 0.005, xa = castZ(x + h, y, front), xb = castZ(x - h, y, front), ya = castZ(x, y + h, front), yb = castZ(x, y - h, front), z = (2 * castZ(x, y, front) + xa + xb + ya + yb) / 6, zx = (xa - xb) / (2 * h), zy = (ya - yb) / (2 * h);       // a little smoothed, so the rod does not kink where arm meets chest
      const n = V3(-zx, -zy, 1).normalize(); if (!front) n.set(zx, zy, -1).normalize(); n.x = cl(n.x, -0.75, 0.75); n.y = cl(n.y, -0.75, 0.75); n.normalize(); return V3(x, y, z).addScaledVector(n, lift); };
    // curls as [out from the middle of the buckle, up], in metres
    const CURLS = { front: { out: [[0.0128, 0.0050], [0.0180, 0.0100], [0.0255, 0.0120], [0.0345, 0.0070], [0.0398, -0.0030], [0.0392, -0.0130], [0.0335, -0.0195], [0.0265, -0.0210]], inn: [[0.0128, 0.0055], [0.0170, 0.0100], [0.0230, 0.0118], [0.0315, 0.0070], [0.0362, -0.0020], [0.0350, -0.0100], [0.0290, -0.0140], [0.0232, -0.0130]] },
      back: { out: [[0.0125, 0.0000], [0.0180, 0.0012], [0.0245, 0.0005], [0.0325, -0.0035], [0.0372, -0.0120], [0.0360, -0.0215], [0.0300, -0.0275], [0.0250, -0.0273]], inn: [[0.0125, 0.0000], [0.0180, 0.0012], [0.0240, 0.0005], [0.0315, -0.0035], [0.0364, -0.0115], [0.0348, -0.0198], [0.0295, -0.0236], [0.0250, -0.0223]] } };
    const VTX = []; for (const k of ['torso', 'armL', 'armR']) { const Bk = buckets[k]; if (!Bk) continue; for (let i = 0; i < Bk.n; i++) { const x = Math.abs(Bk.pos[i * 3]), y = Bk.pos[i * 3 + 1]; if (y < 1.25 || y > 1.41 || x < 0.05 || x > 0.21) continue; VTX.push([Bk.pos[i * 3], y, Bk.pos[i * 3 + 2], Bk.si.slice(i * 4, i * 4 + 4), Bk.sw.slice(i * 4, i * 4 + 4)]); } }
    const wNear = (X, Y, Z) => { const best = []; for (const v of VTX) { const d = (v[0] - X) * (v[0] - X) + (v[1] - Y) * (v[1] - Y) + (v[2] - Z) * (v[2] - Z); if (best.length < 6) { best.push([d, v]); best.sort((p, q) => p[0] - q[0]); } else if (d < best[5][0]) { best[5] = [d, v]; best.sort((p, q) => p[0] - q[0]); } }
      const acc = {}; for (const [d, v] of best) { const k = 1 / (d + 2e-5); for (let j = 0; j < 4; j++) if (v[4][j] > 0) acc[v[3][j]] = (acc[v[3][j]] || 0) + k * v[4][j]; }
      const out = []; for (const [bi, w] of Object.entries(acc).sort((p, q) => q[1] - p[1]).slice(0, 4)) out.push(+bi, w); return out.length ? out : wTorso(X, Y, Z); };
    const HOOKS = [[0.5 - 0.117, 1.321, true], [0.5 + 0.117, 1.321, true], [0.1115, 1.337, false], [1 - 0.1115, 1.337, false]];
    for (const [u, y, front] of HOOKS) {
      const cx = rTorso(u, y)[0], sOut = cx < 0 ? -1 : 1, wf = (X, Y, Z) => wNear(X, Y, Z), at = (a, b, lift) => skin(cx + sOut * a, y + b, front, lift);
      const loop = (pts, r, key) => tube(key || 'hookBrass', pts, r, wf, true);
      if (front) { const ring = []; for (let j = 0; j < 26; j++) { const a = (j / 26) * TAU; ring.push(at(0.0135 * Math.cos(a), 0.0110 * Math.sin(a), 0.0030)); } loop(ring, 0.0013);
        tube('hookBrass', [at(0, 0.0125, 0.0036), at(0, 0.004, 0.0046), at(0, -0.005, 0.0046), at(0, -0.0130, 0.0036)], 0.0010, wf);
        for (const b of [0.0128, -0.0133]) { const c = at(0, b, 0.0038); addPart('hookBrass', spherePart(c, 0.0017, 0.0017, 0.0017, 8, 6), wf, { out: c }); } }
      else { const bar = []; for (let j = 0; j < 22; j++) { const a = (j / 22) * TAU; bar.push(at(0.0150 * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.5), 0.0030 * Math.sin(a), 0.0030)); } loop(bar, 0.0014);
        const c = at(0, 0.0012, 0.0042); addPart('hookBrass', spherePart(c, 0.0021, 0.0024, 0.0021, 8, 6), wf, { out: c }); tube('hookBrass', [at(0, 0.0005, 0.0042), at(0, -0.0045, 0.0040), at(0, -0.0085, 0.0030)], (q) => 0.0012 - 0.0006 * q, wf); }
      for (const [tbl, sd] of [[CURLS[front ? 'front' : 'back'].out, 1], [CURLS[front ? 'front' : 'back'].inn, -1]]) {
        const ctrl = tbl.map(([a, b]) => V3(sd * a, b, 0)), pts2 = curvePts(ctrl, 30), rod = (q) => 0.0028 - 0.0005 * q, pts = pts2.map((p, i) => at(p.x, p.y, rod(i / 29) * 0.80));
        tube('iron', pts, rod, wf); const e = pts[pts.length - 1]; addPart('iron', spherePart(e, 0.0031, 0.0031, 0.0031, 9, 7), wf, { out: e });
      }
    }
  })();
  // ---------- her bow (painting G1 open, G2 folded): moonsteel, open filigree limbs, a string of light ----------
  // The bow is built open and upright in a place of its own beside her. There, up the grip is +Y, the way the arrow flies is +X and
  // the bow's thin side is Z. Every bow bone rests there unrotated, so the turn given to the bone 'bow' is the bow's turn in the world
  // and its place is the middle of the grip.
  // Each limb is a chain of twelve bones along its length. Turning each a little about Z rolls the limb up toward its tip, the way a
  // fern frond is rolled: that is how the bow folds. It unrolls from the grip outward, so the tight curl rides out on a stem that is
  // already straight and never sweeps across her hand.
  // Sizes: 96 cm from tip to tip (read off her figure in H2), 37 cm folded. The grip fits her fist.
  let BOWK = null;
  (function () {
    const G0 = V3(1.6, 1.2, 0), K = 12, wB = () => [BI.bow, 1];
    addBone('bow', null, G0.x, G0.y, G0.z);
    const at = (a, f, z) => V3(G0.x + f, G0.y + a, G0.z + (z || 0));
    const mid = (pts) => pts.reduce((m, p) => m.add(p), V3()).multiplyScalar(1 / pts.length);
    // a tube through points; radii are [across the bow's thin side, in the bow's own plane]
    const rod = (key, pts, radii, n, wf, closed, up) => { const P = closed ? pts.concat([pts[0].clone()]) : pts, Rr = closed ? radii.concat([radii[0]]) : radii;
      addPart(key, loft(tubeRings(P, Rr, n, up || V3(0, 0, 1)), closed ? {} : { capA: true, capB: true }), wf, { out: mid(pts) }); };

    // ---- the grip: dark blue leather wound round it, a moonsteel collar at each end ----
    { const n = 64, pts = [], rad = [];
      for (let i = 0; i <= n; i++) { const a = lerp(-0.0485, 0.0485, i / n), waist = 1 - 0.07 * Math.cos(a / 0.0485 * PI / 2), wind = 1 + 0.035 * Math.sin(a / 0.0058 * TAU); pts.push(at(a, 0)); rad.push([0.0142 * waist * wind, 0.0120 * waist * wind]); }
      rod('bowWrap', pts, rad, 14, wB, false, V3(1, 0, 0));
      for (const sg of [1, -1]) { const prof = [[0.0455, 0.0146], [0.0475, 0.0166], [0.0515, 0.0166], [0.0535, 0.0148], [0.0555, 0.0160], [0.0575, 0.0142], [0.0610, 0.0096]];
        rod('moon', prof.map(([a]) => at(sg * a, 0)), prof.map(([, r]) => [r, r * 0.86]), 14, wB, false, V3(1, 0, 0)); } }

    // ---- a crescent at each end of the grip, holding a round blue gem ----
    for (const sg of [1, -1]) {
      const Hc = [sg * 0.082, 0.004], gem = at(sg * 0.0765, 0.004), ring = [], rr = [];
      for (let j = 0; j < 30; j++) { const t = (j / 30) * TAU; ring.push(at(Hc[0] + sg * 0.026 * Math.cos(t), Hc[1] + 0.026 * Math.sin(t))); rr.push([0.0048, 0.0052 - 0.0026 * Math.cos(t)]); }      // thick toward the grip, thin at the far side
      rod('moon', ring, rr, 8, wB, true);
      const bez = []; for (let j = 0; j < 20; j++) { const t = (j / 20) * TAU; bez.push(at(sg * 0.0765 + 0.0140 * Math.cos(t), 0.004 + 0.0140 * Math.sin(t))); }
      rod('moon', bez, bez.map(() => [0.0034, 0.0021]), 6, wB, true);
      addPart('bowGem', spherePart(gem, 0.0124, 0.0124, 0.0088, 14, 9), wB, { out: gem });
    }

    // ---- the limbs ----
    // The middle line of a limb, in the bow's own measure: [along the bow, toward the target]. It leaves the crescent going forward,
    // sweeps back to the string, and ends in a small curl.
    const CTRL = [[0.098, 0.020], [0.135, 0.050], [0.180, 0.060], [0.235, 0.046], [0.290, 0.014], [0.345, -0.028], [0.400, -0.068], [0.440, -0.094], [0.466, -0.104], [0.482, -0.096], [0.487, -0.080], [0.477, -0.069], [0.466, -0.074], [0.464, -0.084]];
    const NS = 300, CL = curvePts(CTRL.map(([a, f]) => V3(f, a, 0)), NS), arc = [0];
    for (let i = 1; i < NS; i++) arc.push(arc[i - 1] + CL[i].distanceTo(CL[i - 1]));
    let iLow = 0; for (let i = 1; i < NS; i++) if (CL[i].x < CL[iLow].x) iLow = i;
    const Lm = arc[iLow], Lt = arc[NS - 1];
    const cAt = (t) => { t = cl(t, 0, Lt); let i = 1; while (i < NS - 1 && arc[i] < t) i++; const u = (t - arc[i - 1]) / Math.max(1e-9, arc[i] - arc[i - 1]);
      const p = CL[i - 1].clone().lerp(CL[i], u), tg = CL[Math.min(NS - 1, i + 1)].clone().sub(CL[Math.max(0, i - 2)]).normalize(); return { p, tg, nn: V3(tg.y, -tg.x, 0) }; };
    // near the grip a limb is two rails with a vine between them; they close into one stem six tenths of the way out
    const W0 = 0.040, tm = 0.60 * Lm, wid = (t) => (t >= tm ? 0 : W0 * Math.pow(Math.cos(0.5 * PI * t / tm), 0.8));
    const tips = {}, chains = {};
    for (const [nm, sg] of [['U', 1], ['D', -1]]) {
      const Rp = (p) => V3(G0.x + p.x, G0.y + sg * p.y, G0.z + p.z), names = [];
      for (let k = 0; k < K; k++) { const r = Rp(cAt(Lm * k / K).p); addBone('bow' + nm + k, k ? 'bow' + nm + (k - 1) : 'bow', r.x, r.y, r.z); names.push(BI['bow' + nm + k]); }
      chains[nm] = names;
      // a point at arc length t follows the joint nearest it and its neighbour, shared evenly at the joint, so a bend is a smooth arc
      const wAt = (t) => { const q = cl(t / Lm, 0, 1) * K, m = Math.min(K - 1, Math.round(q)), w = sm(-0.5, 0.5, q - m); return w > 0.999 ? [names[m], 1] : [m ? names[m - 1] : BI.bow, 1 - w, names[m], w]; };
      const run = (ts, off, rad, n) => { const pts = ts.map((t) => { const c = cAt(t); return Rp(c.p.addScaledVector(c.nn, off(t))); }), cols = n + 1, m = ts.length;
        addPart('moon', loft(tubeRings(pts, ts.map(rad), n, V3(0, 0, 1)), { capA: true, capB: true }), (x, y, z, i) => wAt(ts[i < m * cols ? Math.floor(i / cols) : (i === m * cols ? 0 : m - 1)]), { out: mid(pts) }); };
      const span = (a, b, n) => { const o = []; for (let i = 0; i <= n; i++) o.push(lerp(a, b, i / n)); return o; };
      const rA = (t) => { const r = t < tm ? lerp(0.0050, 0.0058, sm(0.6 * tm, tm, t)) : lerp(0.0058, 0.0026, (t - tm) / (Lt - tm)); return [r * 0.85, r]; };
      run(span(0, Lt, 84), (t) => wid(t) / 2, rA, 7);                                    // the outer rail, which carries on as the stem and the curl
      run(span(0, tm, 34), (t) => -wid(t) / 2, (t) => [0.0038, 0.0045], 6);             // the inner rail
      run(span(0.02 * Lm, tm - 0.012, 40), (t) => 0.34 * wid(t) * Math.sin(TAU * 2.25 * t / tm + 0.6), () => [0.0021, 0.0022], 5);      // the vine
      { const e = Rp(CL[NS - 1].clone()); addPart('moon', spherePart(e, 0.0044, 0.0044, 0.0038, 8, 6), () => [names[K - 1], 1], { out: e }); }
      // small blade-shaped leaves: four on the vine, five along the stem
      const leaf = (t, off, side, len, wd, tilt) => { const c = cAt(t), base = c.p.clone().addScaledVector(c.nn, off), ang = side * 42 * DEG, cs = Math.cos(ang), sn = Math.sin(ang);
        const d = V3(c.tg.x * cs - c.tg.y * sn, c.tg.x * sn + c.tg.y * cs, tilt).normalize(), perp = V3(-d.y, d.x, 0).normalize(), pts = [], rad = [], n = 7, w = wAt(t);
        for (let i = 0; i <= n; i++) { const u = i / n, g = Math.pow(u, 0.6) * Math.pow(1 - u, 0.9) / 0.40; pts.push(Rp(base.clone().addScaledVector(d, len * u).addScaledVector(perp, -side * 0.18 * len * u * u))); rad.push([0.0016, Math.max(0.0005, wd * Math.min(1, g))]); }
        addPart('moon', loft(tubeRings(pts, rad, 6, V3(0, 0, 1)), { capA: true, capB: true }), () => w, { out: mid(pts) }); };
      const vineOff = (t) => 0.34 * wid(t) * Math.sin(TAU * 2.25 * t / tm + 0.6);
      [[0.13, 1], [0.27, -1], [0.40, 1], [0.52, -1]].forEach(([f, sd], i) => leaf(f * Lm, vineOff(f * Lm), sd, 0.027, 0.0062, 0.10 * (i % 2 ? -1 : 1)));
      [[0.60, 1], [0.68, -1], [0.76, 1], [0.84, -1], [0.92, 1]].forEach(([f, sd], i) => leaf(f * Lm, sd * 0.004, sd, lerp(0.040, 0.026, i / 4), lerp(0.0078, 0.0054, i / 4), 0.16 * (i % 2 ? 1 : -1)));
      tips[nm] = Rp(CL[iLow].clone());
    }
    const th = (k) => (20 + 36 * k / (K - 1)) * DEG;
    // open: 0 rolled up, 1 open. flex: how far the string is drawn (the limbs give a little). shake: a small wobble, in radians.
    const set = (open, flex, shake) => {
      for (const [nm, sg] of [['U', 1], ['D', -1]]) for (let k = 0; k < K; k++) { const b = SK['bow' + nm + k], e0 = 0.55 * k / K, fk = 1 - sm(e0, e0 + 0.45, open);
        b.rotation.set(0, 0, sg * (th(k) * fk + (k >= 3 ? 1.5 * DEG * (flex || 0) : 0) + (shake || 0) * (k / K)));
        if (k === 0) { b.position.copy(b.userData.home); b.position.z += sg * 0.0105 * fk; } }       // rolled up, the two curls lie one each side of the crescents
    };
    BOWK = { G0, K, at, tips, tipBone: { U: 'bow' + 'U' + (K - 1), D: 'bow' + 'D' + (K - 1) }, set, stringF: CL[iLow].x, nockA: 0.045, hubA: 0.085 };
  })();
  // ---------- her sword and its scabbard (painting G4; worn as in G6) ----------
  // A slim, straight court sword of moonsteel, 74 cm long: a narrow two-edged blade, a guard like a crescent moon with its horns toward
  // the blade, a grip of dark blue leather bound with silver wire, and an oval blue gem in a gold setting for a pommel.
  // Like the bow, the sword is built in a place of its own beside her and has one bone, 'sword', a child of 'root': up the blade is +Y,
  // its edges are along X and its flats face Z. The bone rests at the middle of the grip, so placing the bone places the sword.
  // The scabbard is built where it hangs, at the front of her left hip with its tip down and back, on its own bone 'scab' so it swings.
  let SWK = null;
  (function () {
    const G1 = V3(1.6, 1.2, 0.6), wS = () => [BI.sword, 1];
    addBone('sword', null, G1.x, G1.y, G1.z);
    const at = (x, y, z) => V3(G1.x + x, G1.y + y, G1.z + (z || 0));
    const mid = (pts) => pts.reduce((m, p) => m.add(p), V3()).multiplyScalar(1 / pts.length);
    const rod = (key, pts, radii, n, wf, up, closed) => { const P = closed ? pts.concat([pts[0].clone()]) : pts, Rr = closed ? radii.concat([radii[0]]) : radii;
      addPart(key, loft(tubeRings(P, Rr, n, up), closed ? {} : { capA: true, capB: true }), wf, { out: mid(pts) }); };
    const facets = (key, tris, c0, wf) => { const pos = [], nor = [], idx = [];       // flat faces, so the blade has a true ridge and true edges
      for (const [a, b0, c1] of tris) { let b = b0, c = c1; const n = b.clone().sub(a).cross(c.clone().sub(a)); if (n.lengthSq() < 1e-16) continue; n.normalize(); if (n.dot(a.clone().add(b).add(c).multiplyScalar(1 / 3).sub(c0)) < 0) { n.negate(); const t = b; b = c; c = t; }
        for (const p of [a, b, c]) { idx.push(pos.length / 3); pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); } }
      addPart(key, { pos, idx }, wf, { nor }); };
    const XU = V3(1, 0, 0);

    // ---- the grip: leather, with a silver wire wound round it; a collar below it ----
    { const n = 40, pts = [], rad = [];
      for (let i = 0; i <= n; i++) { const y = lerp(-0.040, 0.040, i / n), swell = 1 + 0.07 * Math.cos(y / 0.040 * PI / 2); pts.push(at(0, y)); rad.push([0.0118 * swell, 0.0100 * swell]); }
      rod('swordGrip', pts, rad, 12, wS, XU);
      const wire = []; for (let i = 0; i <= 96; i++) { const t = i / 96, y = lerp(-0.038, 0.038, t), swell = 1 + 0.07 * Math.cos(y / 0.040 * PI / 2), a = t * TAU * 6.5; wire.push(at(0.0122 * swell * Math.cos(a), y, 0.0104 * swell * Math.sin(a))); }
      rod('swordSteel', wire, wire.map(() => 0.00085), 5, wS, XU);
      const prof = [[-0.0385, 0.0126], [-0.0420, 0.0138], [-0.0465, 0.0128], [-0.0515, 0.0137], [-0.0560, 0.0120], [-0.0610, 0.0092]];
      rod('swordSteel', prof.map(([y]) => at(0, y)), prof.map(([, r]) => [r, r * 0.86]), 12, wS, XU); }

    // ---- the pommel: an oval blue gem in a gold setting with a ring of gold beads ----
    { const c = at(0, -0.0865);
      addPart('swordGold', spherePart(c, 0.0180, 0.0260, 0.0090, 18, 10), wS, { out: c });
      addPart('swordGem', spherePart(c, 0.0128, 0.0200, 0.0122, 16, 10), wS, { out: c });
      for (let j = 0; j < 18; j++) { const t = (j / 18) * TAU, b = at(0.0186 * Math.cos(t), -0.0865 + 0.0266 * Math.sin(t)); addPart('swordGold', spherePart(b, 0.0026, 0.0026, 0.0026, 7, 5), wS, { out: b }); }
      const b = at(0, -0.1150); addPart('swordGold', spherePart(b, 0.0034, 0.0034, 0.0034, 8, 6), wS, { out: b }); }

    // ---- the guard: one crescent, thick in the middle and drawn out to two points that curve toward the blade ----
    { const R = 0.040, yg = 0.0455, pts = [], rad = [], N = 34;
      for (let i = 0; i <= N; i++) { const th = lerp(-112, 112, i / N) * DEG, k = Math.max(0.10, Math.pow(Math.max(0, Math.cos(th * 0.80)), 0.8)); pts.push(at(R * Math.sin(th), yg + R * (1 - Math.cos(th)))); rad.push([0.0050 * (0.35 + 0.65 * k), 0.0080 * k]); }
      rod('swordSteel', pts, rad, 8, wS, V3(0, 0, 1));
      const c = at(0, 0.0460); addPart('swordSteel', spherePart(c, 0.0155, 0.0095, 0.0088, 12, 8), wS, { out: c }); }

    // ---- the blade: a flat diamond in section, 57.5 cm long, 2.4 cm wide at the guard, with a long point ----
    const Y0 = 0.050, Y1 = 0.625;
    { const wAt = (u) => (u < 0.80 ? 0.0242 * (1 - 0.20 * u) : 0.0242 * 0.84 * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.80) / 0.20, 2)))), tAt = (u) => 0.0050 * (1 - 0.45 * u);
      const us = [0, 0.12, 0.25, 0.38, 0.50, 0.62, 0.72, 0.80, 0.86, 0.91, 0.95, 0.98], rings = us.map((u) => { const y = lerp(Y0, Y1, u), w = wAt(u) / 2, t = tAt(u) / 2; return [at(w, y, 0), at(0, y, t), at(-w, y, 0), at(0, y, -t)]; }), tip = at(0, Y1), tris = [];
      for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < 4; j++) { const k = (j + 1) % 4; tris.push([rings[i][j], rings[i + 1][j], rings[i + 1][k]]); tris.push([rings[i][j], rings[i + 1][k], rings[i][k]]); }
      const last = rings[rings.length - 1]; for (let j = 0; j < 4; j++) tris.push([last[j], tip, last[(j + 1) % 4]]);
      facets('blade', tris, at(0, (Y0 + Y1) / 2), wS); }

    // ---- the scabbard, where it hangs ----
    // It hangs from the front of her left hip, a little below her belts, tip down and back along the outside of her thigh. Its wide
    // side lies along her hip, so the crescent guard shows from the front, as in G6.
    const uS = 0.665, yH = 0.955, P3s = (a) => V3(a[0], a[1], a[2]);
    const s0 = P3s(rTorso(uS, yH)), t0 = P3s(rTorso(uS + 0.012, yH)).sub(P3s(rTorso(uS - 0.012, yH))); t0.y = 0; t0.normalize();      // along her hip, toward her back
    const n0 = V3(-t0.z, 0, t0.x); if (n0.dot(V3(s0.x, 0, s0.z)) < 0) n0.negate();                                                    // out from her hip
    const ds = V3(0, -Math.cos(24 * DEG), 0).addScaledVector(V3(0.22, 0, -0.975).normalize(), Math.sin(24 * DEG)).addScaledVector(n0, 0.03).normalize();     // the way the scabbard points: down, and back by 24 degrees
    const ws = t0.clone().addScaledVector(ds, -t0.dot(ds)).normalize(), ns = V3().crossVectors(ws, ds).normalize(); if (ns.dot(n0) < 0) ns.negate();
    const Pm = s0.clone().addScaledVector(n0, 0.030); Pm.y -= 0.075;                                                                    // the mouth of the scabbard
    const pivot = s0.clone().addScaledVector(n0, 0.022);                                                                                // it swings from here, at her belt
    addBone('scab', 'hips', pivot.x, pivot.y, pivot.z);
    const wC = () => [BI.scab, 1], LEN = 0.605, sAt = (d, a, b) => Pm.clone().addScaledVector(ds, d).addScaledVector(ws, a || 0).addScaledVector(ns, b || 0);
    const body = (key, d0, d1, k0, k1, n) => { const pts = [], rad = []; for (let i = 0; i <= n; i++) { const d = lerp(d0, d1, i / n), f = d / LEN, tp = 1 - 0.34 * f; pts.push(sAt(d)); rad.push([0.0080 * tp * lerp(k0, k1, i / n), 0.0172 * tp * lerp(k0, k1, i / n)]); } rod(key, pts, rad, 12, wC, ns); };
    body('swordSteel', -0.002, 0.050, 1.10, 1.08, 4);                    // the silver mouth
    body('scab', 0.046, 0.535, 1, 1, 12);                                // black leather
    { const pts = [], rad = [], n = 9; for (let i = 0; i <= n; i++) { const u = i / n, d = lerp(0.530, LEN, u), tp = 1 - 0.34 * d / LEN, k = 1.08 * Math.sqrt(Math.max(0.02, 1 - Math.pow(u, 2.2))); pts.push(sAt(d)); rad.push([0.0080 * tp * k, 0.0172 * tp * k]); } rod('swordSteel', pts, rad, 12, wC, ns);
      const e = sAt(LEN + 0.004); addPart('swordSteel', spherePart(e, 0.0036, 0.0036, 0.0036, 8, 6), wC, { out: e }); }                 // the silver tip
    // two bands with a ring each, and a strap from each ring up to her belt
    const rings = [0.034, 0.170], belt = [P3s(rTorso(uS + 0.045, 0.962)), P3s(rTorso(uS + 0.105, 0.957))];
    rings.forEach((d, i) => { const f = d / LEN, tp = 1 - 0.34 * f; body('swordSteel', d - 0.006, d + 0.006, 1.16, 1.16, 2);
      const c = sAt(d, 0.0172 * tp * 1.16 + 0.0068), hoop = []; for (let j = 0; j < 14; j++) { const t = (j / 14) * TAU; hoop.push(c.clone().addScaledVector(ws, 0.0068 * Math.cos(t)).addScaledVector(ds, 0.0068 * Math.sin(t))); }
      rod('swordSteel', hoop, hoop.map(() => 0.0013), 6, wC, ns, true);
      const top = belt[i].clone().addScaledVector(V3(belt[i].x, 0, belt[i].z).normalize(), 0.006), bot = c.clone().addScaledVector(ws, 0.0068), pts = [], n = 8; for (let j = 0; j <= n; j++) pts.push(bot.clone().lerp(top, j / n));
      const cols = 7, m = n + 1; addPart('scabStrap', loft(tubeRings(pts, pts.map(() => [0.0013, 0.0052]), 6, n0), { capA: true, capB: true }), (x, y, z, k) => { const t = k < m * cols ? Math.floor(k / cols) / n : (k === m * cols ? 0 : 1); return t > 0.999 ? [BI.hips, 1] : t < 0.001 ? [BI.scab, 1] : [BI.scab, 1 - t, BI.hips, t]; }, { out: mid(pts) }); });
    // the sword at rest in the scabbard: the foot of the blade at the mouth, the blade down the scabbard, its width along the scabbard's width
    const Qsh = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ws, ds, V3().crossVectors(ws, ds)));
    const Psh = Pm.clone().addScaledVector(ds, 0.004 - Y0);
    SWK = { G1, Y0, Y1, ds, ws, ns, Pm, pivot, Qsh, Psh, LEN };
  })();
  // ---------- her two throwing knives and their sheath (painting G5; worn as in G6) ----------
  // Each knife is one piece of moonsteel, 20 cm long: a ring at the end with a crescent moon in it, a short handle bound in dark blue
  // cord between two collars, and a leaf-shaped blade. Like the bow and the sword, each is built in a place of its own and has one bone
  // ('knifeR', 'knifeL', children of 'root'): up the blade is +Y, the blade's width is along X and its flats face Z. The bone rests at
  // the middle of the handle. The sheath is black leather: two pockets side by side, a band across their mouths with a blue stud, and
  // two loops over her belt. It sits at the small of her back, handles up, on 'hips'.
  let KNK = null;
  (function () {
    const mid = (pts) => pts.reduce((m, p) => m.add(p), V3()).multiplyScalar(1 / pts.length), XU = V3(1, 0, 0), ZU = V3(0, 0, 1);
    const rod = (key, pts, radii, n, wf, up, closed) => { const P = closed ? pts.concat([pts[0].clone()]) : pts, Rr = closed ? radii.concat([radii[0]]) : radii;
      addPart(key, loft(tubeRings(P, Rr, n, up), closed ? {} : { capA: true, capB: true }), wf, { out: mid(pts) }); };
    const facets = (key, tris, c0, wf) => { const pos = [], nor = [], idx = [];
      for (const [a, b0, c1] of tris) { let b = b0, c = c1; const n = b.clone().sub(a).cross(c.clone().sub(a)); if (n.lengthSq() < 1e-18) continue; n.normalize(); if (n.dot(a.clone().add(b).add(c).multiplyScalar(1 / 3).sub(c0)) < 0) { n.negate(); const t = b; b = c; c = t; }
        for (const p of [a, b, c]) { idx.push(pos.length / 3); pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); } }
      addPart(key, { pos, idx }, wf, { nor }); };
    const names = ['knifeR', 'knifeL'], Y0 = 0.0262, Y1 = 0.145;
    names.forEach((nm, i) => {
      const G0 = V3(1.6 + 0.15 * i, 1.2, -0.6); addBone(nm, null, G0.x, G0.y, G0.z);
      const wK = () => [BI[nm], 1], at = (x, y, z) => V3(G0.x + x, G0.y + y, G0.z + (z || 0));
      // the handle, bound in cord, and a collar at each end of it
      { const n = 30, pts = [], rad = []; for (let j = 0; j <= n; j++) { const y = lerp(-0.019, 0.019, j / n), rip = 1 + 0.06 * Math.sin(y / 0.0044 * TAU); pts.push(at(0, y)); rad.push([0.0063 * rip, 0.0053 * rip]); } rod('knifeCord', pts, rad, 10, wK, XU);
        for (const sg of [1, -1]) { const prof = [[0.0178, 0.0066], [0.0198, 0.0079], [0.0236, 0.0079], [0.0264, 0.0062]]; rod('knifeSteel', prof.map(([y]) => at(0, sg * y)), prof.map(([, r]) => [r, r * 0.84]), 10, wK, XU); } }
      // the ring, with a crescent moon standing in it
      { const cy = -0.0398, ring = [], cres = [], cr = []; for (let j = 0; j < 26; j++) { const t = (j / 26) * TAU; ring.push(at(0.0118 * Math.cos(t), cy + 0.0118 * Math.sin(t))); }
        rod('knifeSteel', ring, ring.map(() => [0.0022, 0.0030]), 7, wK, ZU, true);
        for (let j = 0; j <= 16; j++) { const t = lerp(62, 298, j / 16) * DEG, k = Math.max(0.12, Math.sin(PI * j / 16)); cres.push(at(-0.0020 + 0.0070 * Math.cos(t), cy + 0.0070 * Math.sin(t))); cr.push([0.0016, 0.0024 * k]); }
        rod('knifeSteel', cres, cr, 6, wK, ZU); }
      // the blade: a leaf, widest a fifth of the way along, drawn out to a long point
      { const wAt = (u) => (u < 0.2 ? lerp(0.0112, 0.0262, sm(0, 0.2, u)) : 0.0262 * Math.pow(1 - (u - 0.2) / 0.8, 0.85)), tAt = (u) => 0.0044 * (1 - 0.5 * u);
        const us = [0, 0.07, 0.14, 0.2, 0.3, 0.45, 0.6, 0.75, 0.88, 0.96], rings = us.map((u) => { const y = lerp(Y0, Y1, u), w = wAt(u) / 2, t = tAt(u) / 2; return [at(w, y, 0), at(0, y, t), at(-w, y, 0), at(0, y, -t)]; }), tip = at(0, Y1), tris = [];
        for (let a = 0; a < rings.length - 1; a++) for (let j = 0; j < 4; j++) { const k = (j + 1) % 4; tris.push([rings[a][j], rings[a + 1][j], rings[a + 1][k]]); tris.push([rings[a][j], rings[a + 1][k], rings[a][k]]); }
        const last = rings[rings.length - 1]; for (let j = 0; j < 4; j++) tris.push([last[j], tip, last[(j + 1) % 4]]);
        facets('knifeBlade', tris, at(0, (Y0 + Y1) / 2), wK); }
    });

    // ---- the sheath, at the small of her back just under her belts ----
    const wH = () => [BI.hips, 1], yM = 0.930, zb = (y) => rTorso(0, y)[2], dn = V3(0, -1, -0.22).normalize(), nb = V3(0, 0.22, -1).normalize(), lat = V3(1, 0, 0);       // down the sheath (its foot a little further back, over her seat); out from her back; along her belt
    const Cm = V3(0, yM, Math.min(zb(yM), zb(yM + 0.03))).addScaledVector(nb, 0.005), sheath = [];
    for (const sg of [-1, 1]) {                                                    // -1: the knife for her right hand
      const M = Cm.clone().addScaledVector(lat, sg * 0.027), ax = dn.clone().addScaledVector(lat, -sg * 0.17).normalize(), pts = [], rad = [], n = 12;
      for (let j = 0; j <= n; j++) { const u = j / n, k = u < 0.22 ? 1 : Math.pow(Math.max(0.02, 1 - (u - 0.22) / 0.78), 0.9); pts.push(M.clone().addScaledVector(ax, -0.004 + 0.134 * u)); rad.push([0.0068 * (0.5 + 0.5 * k), 0.0180 * k]); }
      rod('sheath', pts, rad, 10, wH, nb);
      const xk = lat.clone().multiplyScalar(-sg).addScaledVector(ax, sg * lat.dot(ax)).normalize();       // each knife lies with this side toward her spine, so each hand finds its own
      sheath.push({ P: M.clone().addScaledVector(ax, 0.002 - Y0), Q: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xk, ax, V3().crossVectors(xk, ax))), ax });
    }
    { const pts = [], rad = [], n = 10; for (let j = 0; j <= n; j++) { const u = j / n - 0.5; pts.push(Cm.clone().addScaledVector(lat, u * 0.104).addScaledVector(dn, 0.010 + 0.008 * (1 - Math.abs(u) * 2)).addScaledVector(nb, 0.0035)); rad.push([0.0034, 0.0165]); }
      rod('sheath', pts, rad, 8, wH, nb);                                           // the band across the two mouths
      const edge = pts.map((p) => p.clone().addScaledVector(dn, -0.0165).addScaledVector(nb, 0.002)); rod('knifeSteel', edge, edge.map(() => 0.0011), 5, wH, nb);
      const g = Cm.clone().addScaledVector(dn, 0.016).addScaledVector(nb, 0.0075), bz = []; addPart('knifeGem', spherePart(g, 0.0058, 0.0058, 0.0040, 10, 7), wH, { out: g });
      for (let j = 0; j < 14; j++) { const t = (j / 14) * TAU; bz.push(g.clone().addScaledVector(lat, 0.0066 * Math.cos(t)).addScaledVector(dn, 0.0066 * Math.sin(t))); } rod('knifeSteel', bz, bz.map(() => 0.0012), 5, wH, nb, true);
      for (const sg of [-1, 1]) { const b = Cm.clone().addScaledVector(lat, sg * 0.047).addScaledVector(nb, 0.004), lp = [], m = 6; for (let j = 0; j <= m; j++) lp.push(b.clone().addScaledVector(dn, 0.020 - 0.066 * j / m).addScaledVector(nb, 0.004 * Math.sin(PI * j / m)));
        rod('sheath', lp, lp.map(() => [0.0022, 0.0095]), 8, wH, nb);                 // a loop over her belt, with a snap
        const sn = b.clone().addScaledVector(dn, 0.012).addScaledVector(nb, 0.0045); addPart('knifeSteel', spherePart(sn, 0.0042, 0.0042, 0.0022, 8, 5), wH, { out: sn }); } }
    KNK = { names, Y0, Y1, sheath, pull: 0.135 };
  })();
  // ---------- the light that runs down her arms when she touches her gem (painting H9) ----------
  // Thin lines laid just over her skin from each shoulder to her knuckles, moving with her arms. Each is two tubes, a fine bright one
  // and a wider faint one round it. Along a line the picture coordinate v runs 0 at her shoulder to 1 at her knuckles, so the light can
  // be made to run down it by sliding one small picture (see MATS.veins and gemStage). u picks the fine tube (0.25) or the faint one (0.75).
  (function () {
    for (const [S, s] of SIDES) {
      const d = armDir[S], sh = restPts['sh' + S], out = V3(s * Math.cos(A_POSE), Math.sin(A_POSE), 0), fw = V3(0, 0, 1), SL0 = -0.02, SL1 = 0.47, UA = 0.80;
      const cAt = (sl) => { const pm = sl > 0.43 ? spline(ARM_PALM, Math.min(sl, 0.493)) : 0; return sh.clone().addScaledVector(d, sl).add(V3(s * d.y * pm, -s * d.x * pm, ARM_Z(sl))); };
      // a point just above her arm's skin at arm-length sl, turned by ang round the arm from its outer side toward the front
      const skinAt = (sl, ang) => { const r = prof(ARM_R, sl, true), t = sl < 0.28 ? 1 : spline(ARM_T, cl(sl, 0.28, 0.493)), ca = Math.cos(ang), sa = Math.sin(ang), rho = 1 / Math.sqrt(Math.pow(ca / (r * t), 2) + Math.pow(sa / r, 2));
        return cAt(sl).addScaledVector(out, ca * (rho + 0.0034)).addScaledVector(fw, sa * (rho + 0.0034)); };
      const tube = (pts, us, wts, rad, row) => { const n = 5, cols = n + 1, m = pts.length, c = pts.reduce((a, p) => a.add(p), V3()).multiplyScalar(1 / m);
        addPart('veins', loft(tubeRings(pts, pts.map((p, i) => rad * (0.55 + 0.45 * Math.sin(PI * Math.min(1, (i + 0.5) / m * 1.02)))), n), { capA: true, capB: true, u0: row, uS: 0, v: us }), (x, y, z, i) => wts[i < m * cols ? Math.floor(i / cols) : (i === m * cols ? 0 : m - 1)], { out: c }); };
      const line = (pts, us, wts) => { tube(pts, us, wts, 0.0017, 0.25); tube(pts, us, wts, 0.0052, 0.75); };
      // down the outside of her arm, wandering a little, and on over the back of her hand to her middle knuckle
      { const pts = [], us = [], wts = [], n = 46;
        for (let i = 0; i <= n; i++) { const f = i / n, sl = lerp(SL0, SL1, f); pts.push(skinAt(sl, (1.05 + 0.30 * Math.sin(f * 7.3 + (s > 0 ? 0.4 : 1.9))) * (1 - sm(0.41, 0.47, sl)))); us.push(UA * f); wts.push(wArm(S, sl)); }
        for (let i = 1; i <= 8; i++) { const f = i / 8, p = handPt(s, -0.0150, -0.006 - 0.070 * f, 0.010 * f); pts.push(p); us.push(lerp(UA, 1, f)); wts.push([BI['hand' + S], 1]); }
        line(pts, us, wts); }
      // two short side branches on her forearm, and one each to her index and ring knuckles
      for (const [a0, a1, g0, g1] of [[0.10, 0.24, 1.0, 1.75], [0.27, 0.40, 0.95, 1.70], [0.30, 0.43, 0.75, 0.05]]) { const pts = [], us = [], wts = [], n = 12;
        for (let i = 0; i <= n; i++) { const f = i / n, sl = lerp(a0, a1, f); pts.push(skinAt(sl, lerp(g0, g1, f * f))); us.push(UA * (sl - SL0) / (SL1 - SL0)); wts.push(wArm(S, sl)); } line(pts, us, wts); }
      for (const zk of [0.026, -0.012]) { const pts = [], us = [], wts = [], n = 7; for (let i = 0; i <= n; i++) { const f = i / n; pts.push(handPt(s, -0.0150, -0.020 - 0.052 * f, lerp(0.004, zk, f))); us.push(lerp(UA + 0.06, 1, f)); wts.push([BI['hand' + S], 1]); } line(pts, us, wts); }
    }
  })();

  // ---------- materials (stage one) ----------
  const tBody = bakedTex('body', 2048, 1408, '#3a2c36'); tBody.wrapS = THREE.RepeatWrapping;
  const tLegs = bakedTex('legs', 1024, 1024, '#3a2a26'); tLegs.wrapS = tLegs.wrapT = THREE.RepeatWrapping;
  const tLaceC = bakedTex('lace', 1024, 1024, '#141114'), tLaceA = bakedTex('laceA', 1024, 1024, '#808080'); for (const t of [tLaceC, tLaceA]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } tLaceA.encoding = THREE.LinearEncoding;
  const SKIN_C = (BAKED && BAKED.skinChest) || SKIN || '#c99a80', lit = (o) => Object.assign({ roughness: 0.70, envMapIntensity: 0.2 }, o);
  const skinPainted = (key, W, H, wrap) => { const t = bakedTex(key, W, H, SKIN_C); if (wrap) t.wrapS = THREE.RepeatWrapping; return sheen(std({ map: t, color: lin('#b9b2b6'), roughness: 0.68, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.06); };
  const MATS = {
    // the wrapped painting carries its own soft studio light, so most of it is shown as it was painted and only a little is lit again
    torso: sheen(std({ map: tBody, color: lin('#b9b2b6'), roughness: 0.74, envMapIntensity: 0.25, emissive: lin('#ffffff'), emissiveMap: tBody, emissiveIntensity: 0.34 }), '#8fa4d8', 3, 0.06),
    skin: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_C)), emissive: lin(SKIN_C), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    form: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_C)), emissive: lin(SKIN_C), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    // the head wears three pictures at once, mixed by which way the skin faces (see buildHead): the front painting, the profile painting, plain skin
    face: (() => {
      const t = faceT;
      const m = sheen(std({ map: t, color: lin('#b9b2b6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.06);
      const ts = bakedTex(BAKED && BAKED.faceSideYoung ? 'faceSideYoung' : 'faceSide', 512, 512, SKIN_C), ta = bakedTex('faceSideA', 512, 512, '#000000'), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        sh.uniforms.uSide = { value: ts }; sh.uniforms.uSideA = { value: ta }; sh.uniforms.uPlain = { value: lin(SKIN_C) }; sh.uniforms.uPlain2 = { value: lin((BAKED && BAKED.skinNeck) || '#be7f62') };       // plain skin is her chest tone, so neck and chest are one colour; the shade under the jaw comes from faceMix
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 faceMix; attribute vec2 uvSide; varying vec4 vFaceMix; varying vec2 vUvSide;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFaceMix = faceMix; vUvSide = uvSide;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSide; uniform sampler2D uSideA; uniform vec3 uPlain; uniform vec3 uPlain2; varying vec4 vFaceMix; varying vec2 vUvSide; vec3 gFaceCol;')
          .replace('#include <map_fragment>', 'vec4 texelColor = mapTexelToLinear( texture2D( map, vUv ) );\n float fSide = texture2D( uSideA, vUvSide ).r * vFaceMix.x;\n vec3 sideCol = mapTexelToLinear( texture2D( uSide, vUvSide ) ).rgb;\n gFaceCol = ( texelColor.rgb * max( 0.0, 1.0 - fSide - vFaceMix.y ) + sideCol * fSide + mix( uPlain, uPlain2, vFaceMix.w ) * vFaceMix.y ) * vFaceMix.z;\n diffuseColor.rgb *= gFaceCol;')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gFaceCol;');
      };
      return m;
    })(),
    // her hair wears four paintings at once: each is laid on from its own side, and they are mixed by which way the hair faces
    hair: (() => {
      const hk = (k) => (BAKED && BAKED[k + 'Soft'] ? k + 'Soft' : k), tS = bakedTex(hk('hairSide'), 512, 512, '#3e282a'), tF = bakedTex(hk('hairFront'), 512, 512, '#3e282a'), tB = bakedTex(hk('hairBack'), 512, 512, '#3e282a'), tT = bakedTex(hk('hairTop'), 512, 512, '#3e282a');
      const HW = (BAKED && BAKED.hairWin) || { side: [-0.16, 0.11, 1.43, 1.70], fb: [-0.135, 0.135, 1.43, 1.70], top: [-0.135, 0.135, -0.17, 0.10] };
      const m = sheen(std({ map: tS, color: lin('#b9b2b6'), roughness: 0.62, envMapIntensity: 0.25, emissive: lin('#ffffff'), emissiveIntensity: 0.36 }), '#c9b6c4', 3, 0.10), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        Object.assign(sh.uniforms, { uHF: { value: tF }, uHB: { value: tB }, uHT: { value: tT }, uHC: { value: new THREE.Vector3(0, 1.565, -0.030) },
          uWS: { value: new THREE.Vector4(HW.side[0], HW.side[1], HW.side[2], HW.side[3]) }, uWF: { value: new THREE.Vector4(HW.fb[0], HW.fb[1], HW.fb[2], HW.fb[3]) }, uWT: { value: new THREE.Vector4(HW.top[0], HW.top[1], HW.top[2], HW.top[3]) } });
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRest;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = position;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uHF; uniform sampler2D uHB; uniform sampler2D uHT; uniform vec3 uHC; uniform vec4 uWS; uniform vec4 uWF; uniform vec4 uWT; varying vec3 vRest; vec3 gHairCol;')
          .replace('#include <map_fragment>', 'vec3 hd = normalize( vRest - uHC );\n float ws = pow( abs( hd.x ), 3.0 ), wf = pow( max( 0.0, hd.z ), 4.0 ), wb = pow( max( 0.0, -hd.z ), 3.0 ), wt = pow( max( 0.0, hd.y ), 1.6 ) * 2.2 * smoothstep( -0.10, 0.02, hd.z ) + pow( max( 0.0, hd.y ), 3.0 ) * 0.5;\n vec2 uvs = vec2( ( vRest.z - uWS.x ) / ( uWS.y - uWS.x ), ( vRest.y - uWS.z ) / ( uWS.w - uWS.z ) );\n vec2 uvf = vec2( ( vRest.x - uWF.x ) / ( uWF.y - uWF.x ), ( vRest.y - uWF.z ) / ( uWF.w - uWF.z ) );\n vec2 uvt = vec2( ( vRest.x - uWT.x ) / ( uWT.y - uWT.x ), 1.0 - ( vRest.z - uWT.z ) / ( uWT.w - uWT.z ) );\n gHairCol = ( mapTexelToLinear( texture2D( map, uvs ) ).rgb * ws + mapTexelToLinear( texture2D( uHF, uvf ) ).rgb * wf + mapTexelToLinear( texture2D( uHB, uvf ) ).rgb * wb + mapTexelToLinear( texture2D( uHT, uvt ) ).rgb * wt ) / ( ws + wf + wb + wt + 0.0001 );\n diffuseColor.rgb *= gHairCol;')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gHairCol;');
      };
      return m;
    })(),
    lock: std({ map: lockTexR((BAKED && BAKED.hairCols) || ['#170e0d', '#3e282a', '#816962']), alphaMap: lockAlphaR(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6, envMapIntensity: 0.3 }),
    band: (() => { const t = bakedTex('band', 1024, 64, '#27408c'); t.wrapS = THREE.MirroredRepeatWrapping; return std({ map: t, color: lin('#d6d2d8'), roughness: 0.86, envMapIntensity: 0.2, side: THREE.DoubleSide }); })(),
    gold: std({ color: lin('#c9963c'), metalness: 1, roughness: 0.34, envMapIntensity: 1.5 }),
    gem: phys({ map: gemTexR(), roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 }),
    wire: std({ color: lin('#1b191d'), metalness: 0.85, roughness: 0.36, envMapIntensity: 1.3 }),
    pad: phys({ color: lin('#d8d2cc'), transparent: true, opacity: 0.55, roughness: 0.2 }),
    lens: phys({ color: lin('#b6a8e8'), transparent: true, opacity: 0.12, roughness: 0.04, metalness: 0, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide }),
    // her hands and arms wear her own paintings, D1 on the left and D2 on the right (bake_hands_r.py); they are lit as her chest is, so skin meets skin
    hand: skinPainted('hands', 1024, 1024, false), handR: skinPainted('handsR', 1024, 1024, false),
    armL: skinPainted('armL', 512, 1024, true), armR: skinPainted('armR', 512, 1024, true),
    nail: phys({ color: lin('#ecc9c0'), transparent: true, opacity: 0.20, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15, depthWrite: false }),      // her nails are painted on her fingers; this is only their gloss
    leggings: sheen(std({ map: tLegs, color: lin('#cfc6c6'), roughness: 0.78, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: tLegs, emissiveIntensity: 0.30 }), '#7a6470', 3, 0.10),
    lacesl: std({ map: tLaceC, alphaMap: tLaceA, alphaTest: 0.30, transparent: false, side: THREE.DoubleSide, roughness: 0.9, color: lin('#8d868c') }),
    laceband: std({ color: lin('#17131a'), roughness: 0.95 }),
    boot: (() => { const n = crinkleTex(), k = new THREE.Vector2(0.36, 0.36); return std({ map: leatherTexR(), color: lin('#c4b8ac'), roughness: 0.58, envMapIntensity: 0.55, normalMap: n, normalScale: k }); })(),
    sole: std({ map: soleTexR(), color: lin('#aaa29c'), roughness: 0.86 }),
    stitch: std({ color: lin('#a98459'), roughness: 0.8 }), eyelet: std({ color: lin('#b08a4e'), roughness: 0.36, metalness: 1, envMapIntensity: 1.4 }), aglet: std({ color: lin('#a8823e'), roughness: 0.35, metalness: 1 }),
    lace: std({ color: lin('#7d5a38'), roughness: 0.92 }), hole: std({ color: lin('#0c0a0a'), roughness: 1 }),
    // belts, satchel and pouch wear the leather of painting F6 (bake_gear_r.py); their buckles and studs are steel, the strap hooks black iron
    gear: std({ map: bakedTex('gear', 1024, 1024, '#3a2c2a'), color: lin('#d6cac2'), roughness: 0.60, envMapIntensity: 0.4 }),
    belt: (() => { const t = bakedTex('beltTex', 128, 128, '#4a3830'); t.wrapS = THREE.RepeatWrapping; return std({ map: t, color: lin('#d6cac2'), roughness: 0.62, envMapIntensity: 0.4 }); })(),
    keeperB: std({ color: lin('#2f5aa6'), roughness: 0.85 }),
    // charms (F7): gold, turquoise and pearl beads, cut amber, cut turquoise crystal
    charmGold: std({ color: lin('#c9a04a'), metalness: 1, roughness: 0.3, envMapIntensity: 1.5 }), teal: std({ color: lin('#2a8f9c'), roughness: 0.22, metalness: 0.15, envMapIntensity: 1.2 }), pearl: std({ color: lin('#d9c6c2'), roughness: 0.3, envMapIntensity: 1.0 }),
    amber: std({ color: lin('#e08a1c'), roughness: 0.1, envMapIntensity: 1.6, transparent: true, opacity: 0.9, emissive: lin('#7a3200'), emissiveIntensity: 0.28 }),
    crystal: std({ color: lin('#2fb0c4'), roughness: 0.1, metalness: 0.25, envMapIntensity: 2.2, transparent: true, opacity: 0.93, emissive: lin('#0b5a68'), emissiveIntensity: 0.14 }),
    gearBrass: std({ color: lin('#b08a4e'), roughness: 0.36, metalness: 1, envMapIntensity: 1.4 }), hookBrass: std({ color: lin('#b08a4e'), roughness: 0.34, metalness: 1, envMapIntensity: 1.4 }), beltHole: std({ color: lin('#0c0a0a'), roughness: 1 }),
    steel: std({ color: lin('#bcb8b0'), metalness: 1, roughness: 0.36, envMapIntensity: 1.3 }),
    // her bow (G1): moonsteel is a pale silver-white metal; the grip is dark blue leather; the two gems are the blue of her headband gem
    moon: std({ color: lin('#e2e6ee'), metalness: 1, roughness: 0.30, envMapIntensity: 1.7 }),
    bowWrap: std({ color: lin('#263c8a'), roughness: 0.74, envMapIntensity: 0.3 }),
    // her sword (G4): a bright blade, moonsteel guard and fittings, the same blue leather on the grip, a turquoise-blue gem in gold; black leather scabbard
    blade: std({ color: lin('#f0f3f8'), metalness: 1, roughness: 0.17, envMapIntensity: 2.1 }), swordSteel: std({ color: lin('#e2e6ee'), metalness: 1, roughness: 0.30, envMapIntensity: 1.7 }),
    swordGrip: std({ color: lin('#263c8a'), roughness: 0.74, envMapIntensity: 0.3 }), swordGold: std({ color: lin('#c9963c'), metalness: 1, roughness: 0.32, envMapIntensity: 1.5 }),
    swordGem: phys({ color: lin('#1f9ec4'), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, emissive: lin('#0c6f9a'), emissiveIntensity: 0.4 }),
    scab: std({ color: lin('#17141a'), roughness: 0.58, envMapIntensity: 0.5 }), scabStrap: std({ color: lin('#2a2020'), roughness: 0.8 }),
    // her knives (G5): each one piece of moonsteel with a handle of dark blue cord; a black leather sheath with a blue stud
    knifeBlade: std({ color: lin('#eef1f6'), metalness: 1, roughness: 0.20, envMapIntensity: 2.0 }), knifeSteel: std({ color: lin('#e2e6ee'), metalness: 1, roughness: 0.30, envMapIntensity: 1.7 }),
    knifeCord: std({ color: lin('#24397f'), roughness: 0.85, envMapIntensity: 0.2 }), sheath: std({ color: lin('#17141a'), roughness: 0.58, envMapIntensity: 0.5 }),
    // the light that runs down her arms (R49_veins.js): a picture two wide and 256 long that is lit for its first half, brightest at the
    // leading edge; sliding it along makes the light run. Light only.
    veins: (() => { const n = 256, d = new Uint8Array(2 * n * 4); for (let j = 0; j < n; j++) { const sv = (j + 0.5) / n, lit = sv < 0.5 ? 0.45 + 0.55 * Math.exp(-(0.5 - sv) / 0.035) : 0;
        for (let i = 0; i < 2; i++) { const k = (j * 2 + i) * 4, v = Math.round(255 * lit * (i ? 0.24 : 1)); d[k] = Math.round(v * 0.78); d[k + 1] = Math.round(v * 0.90); d[k + 2] = v; d[k + 3] = 255; } }
      const t = new THREE.DataTexture(d, 2, n, THREE.RGBAFormat); t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true;
      const m = new THREE.MeshBasicMaterial({ skinning: true, map: t, color: new THREE.Color('#b4d6ff'), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false });
      m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; return m; })(),
    knifeGem: phys({ color: lin('#2191c8'), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, emissive: lin('#0c5fa8'), emissiveIntensity: 0.4 }),
    bowGem: phys({ color: lin('#2191c8'), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, emissive: lin('#0c5fa8'), emissiveIntensity: 0.45 }),
    iron: std({ color: lin('#1b1a1e'), metalness: 0.75, roughness: 0.48, envMapIntensity: 1.0 }),
    sock: std({ map: sockTexR(), color: lin('#d2cbc8'), roughness: 0.97 }),
    cloth: std({ color: lin('#1a1518'), roughness: 0.9 })
  };

  // ---------- bind: one skinned mesh per material ----------
  const root = new THREE.Group(); root.name = 'ranger';
  root.add(SK.hips); if (SK.bow) root.add(SK.bow); if (SK.sword) root.add(SK.sword); if (SK.knifeR) root.add(SK.knifeR, SK.knifeL); root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  const meshes = {};
  let triCount = 0;
  for (const key in buckets) {
    const B = buckets[key], g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(B.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(B.sw, 4));
    if (key === 'face') { g.setAttribute('faceMix', new THREE.Float32BufferAttribute(faceMix, 4)); g.setAttribute('uvSide', new THREE.Float32BufferAttribute(faceUvS, 2)); }
    g.setIndex(B.n > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
    if (LOD.onGeometry) LOD.onGeometry(key, g, B, { MATS, lin, sheen, std, phys });
    const m = new THREE.SkinnedMesh(g, (LOD.material && LOD.material(key, B, { MATS, lin, sheen, std, phys })) || MATS[key] || MATS.cloth);
    m.name = key; m.castShadow = !/^(lens|pad|lock)$/.test(key); m.receiveShadow = true; m.frustumCulled = false;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += g.index.count / 3; if (LOD.onMesh) LOD.onMesh(key, m);
  }
  // Lace and arms. A sleeve is a bell of lace and her forearm swings through where the bell is. Instead of bending the lace out of the
  // way, the picture is drawn so it can never show: the lace is drawn after her body and leaves no mark in the depth picture, then her
  // forearms and hands are drawn once more on top. Wherever the two cross, her forearm is whole and the lace lies behind it.
  if (meshes.lacesl) { meshes.lacesl.material.depthWrite = false; meshes.lacesl.renderOrder = 5;
    const lower = new Set(); for (const k in BI) if (/^(farm|hand)/.test(k) || (bones[BI[k]].parent && /^(hand)/.test(bones[BI[k]].parent.name || ''))) lower.add(BI[k]);
    for (const k in BI) { let b = bones[BI[k]]; while (b && b.isBone) { if (/^hand/.test(b.name || '')) { lower.add(BI[k]); break; } b = b.parent; } }
    for (const key of ['armL', 'armR', 'hand', 'handR', 'nail', 'skin']) { const src = meshes[key]; if (!src) continue; const g = src.geometry, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, ix = g.index.array, keep = [];
      const low = (v) => { let w = 0; for (let j = 0; j < 4; j++) if (lower.has(si.array[v * 4 + j])) w += sw.array[v * 4 + j]; return w; };
      for (let i = 0; i < ix.length; i += 3) if (low(ix[i]) + low(ix[i + 1]) + low(ix[i + 2]) > 1.2) keep.push(ix[i], ix[i + 1], ix[i + 2]);
      if (!keep.length) continue; const g2 = new THREE.BufferGeometry(); for (const n in g.attributes) g2.setAttribute(n, g.attributes[n]); g2.setIndex(keep);
      const o = new THREE.SkinnedMesh(g2, src.material); o.name = key + 'Over'; o.renderOrder = 6; o.frustumCulled = false; o.castShadow = false; o.receiveShadow = true; root.add(o); o.bind(skeleton, new THREE.Matrix4()); meshes[key + 'Over'] = o; } }
  // stage one has no motion yet: pose() sets a few bone turns by hand, for checking her against the paintings
  // ---------- her moves (a first set, written for her: she is the quick, sporty one) ----------
  // pose() holds her still for checking against the paintings. play(name) starts a move: 'idle' (ready, light on her feet), 'walk',
  // 'jog', 'talk' (her own: one quick hand, weight on one hip), and three short ones that end by themselves: 'aim' (she draws a bow
  // that is not built yet), 'cheer' (a jump with an arm thrown up) and 'limber' (she shakes out and bounces). Every frame the bones
  // are set back to rest and the layers are added on top. The Jester's moves are the reference for what a full set holds, not copied.
  let lastPose = { arm: 15, leg: 0 }, mv = { name: 'pose', t: 0 }, wk = 0, jg = 0, gph = 0, clock = 0, blinkAt = 2.4, blinkT = -1, mouthAt = 0, mouthNow = 'rest', facePainted = '';
  const SHOTS = { shots: 9.6, draw: 5.5, sword: 4.5, knives: 3.2, gem: 3.4, glass: 3.9, cheer: 1.5, limber: 3.9, hit: 1.3, hard: 2.4, dodge: 1.3, win: 3.6, bow: 3.2, wave: 2.7 }, SLOW = { draw: 1.22, sword: 1.25, knives: 1.3, gem: 1.3, glass: 1.3, limber: 1.5, hit: 1.25, hard: 1.2, dodge: 1.2, win: 1.2, bow: 1.2, wave: 1.2 },
    MOVES = ['pose', 'idle', 'walk', 'jog', 'talk', 'draw', 'sword', 'knives', 'gem', 'shots', 'glass', 'cheer', 'limber', 'hit', 'hard', 'dodge', 'win', 'fall', 'bow', 'wave', 'kneel', 'squat', 'sit', 'hover'];
  const add = (b, x, y, z) => { const r = SK[b].rotation; r.x += x; r.y += y; r.z += z; };
  function restAll() { for (const k in SK) if (!/^(bag|charm|slv|tail|lock)/.test(k)) SK[k].rotation.set(0, 0, 0); SK.hips.position.copy(SK.hips.userData.home); }
  // ---------- fingers ----------
  // A hand shape is [thumb, index, middle, ring, little, spread]: 0 is straight, 1 is curled shut. A finger may also be three numbers,
  // the bend at each of its joints from the knuckle out, for shapes like the hook that holds a bowstring. Her hands ease from one
  // shape to the next. (The angles and axes are the Jester's; the shapes are hers.)
  const HOOK = [0.30, 1.30, 0.70];
  const FP = { relax: [0.30, 0.26, 0.32, 0.38, 0.44, 0.15], soft: [0.14, 0.12, 0.17, 0.22, 0.28, 0.55], open: [0.04, 0.03, 0.02, 0.05, 0.09, 0.95], fist: [0.72, 0.95, 0.96, 0.96, 0.95, 0],
    two: [0.62, 0.04, 0.07, 0.92, 0.94, 0.12], flat: [0.10, 0.02, 0.02, 0.04, 0.08, 0.50],
    grip: [0.62, 0.72, 0.76, 0.79, 0.80, 0.05], hold: [0.58, 0.76, 0.80, 0.83, 0.84, 0], hook: [0.50, HOOK, HOOK, HOOK, 0.84, 0], mudra: [0.46, 0.56, 0.08, 0.10, 0.14, 0.45] };
  const handAxes = {}, _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), SPREAD = [0, 1, 0.3, -0.45, -1.0];
  for (const [S, s] of SIDES) {
    const c = Math.cos(s * A_POSE), sn = Math.sin(s * A_POSE), palm = V3(-s * c, -s * sn, 0), along = V3(sn, -c, 0), td = V3(-s * THUMB.dir[0], THUMB.dir[1], THUMB.dir[2]).normalize();
    td.set(td.x * c - td.y * sn, td.x * sn + td.y * c, td.z);
    const tn = V3(1, 0, 0), tdc = V3(...THUMB.dir).normalize(); tn.addScaledVector(tdc, -tn.x).normalize(); const tb = V3().crossVectors(tdc, tn);
    tn.multiplyScalar(Math.cos(THUMB.roll)).addScaledVector(tb, -Math.sin(THUMB.roll));
    handAxes[S] = { palm, along, curl: V3(0, 0, -s), thumbFlex: V3().crossVectors(td, handDir(s, tn.x, tn.y, tn.z)).normalize(), thumbOpp: along.clone() };
  }
  const fingerNums = (f, o) => { o[0] = f[0]; for (let k = 0; k < 4; k++) { const c = f[k + 1]; if (typeof c === 'number') { o[1 + k * 3] = c * 1.38; o[2 + k * 3] = c * 1.62; o[3 + k * 3] = c * 1.05; } else { o[1 + k * 3] = c[0]; o[2 + k * 3] = c[1]; o[3 + k * 3] = c[2]; } } o[13] = f[5]; return o; };
  const fNow = { R: fingerNums(FP.relax, []), L: fingerNums(FP.relax, []) }, fWant = { R: FP.relax, L: FP.relax }, _fn = [];
  let snapNow = false;
  function fingersTick(dt, snap) {
    for (const [S] of SIDES) { const v = fNow[S], w = fingerNums(fWant[S], _fn), k = snap ? 1 : 1 - Math.exp(-dt * 16), A = handAxes[S];
      for (let i = 0; i < 14; i++) v[i] += (w[i] - v[i]) * k;
      for (let j = 0; j < 4; j++) { const fn = FINGERS[j][0], c0 = v[1 + j * 3], sp = SPREAD[j + 1] * (v[13] - 0.3) * 0.26 * (1 - cl(c0 / 1.38, 0, 1) * 0.8);
        _qa.setFromAxisAngle(A.curl, c0); _qb.setFromAxisAngle(A.palm, sp); SK[fn + '0' + S].quaternion.copy(_qb).multiply(_qa);
        SK[fn + '1' + S].quaternion.setFromAxisAngle(A.curl, v[2 + j * 3]); SK[fn + '2' + S].quaternion.setFromAxisAngle(A.curl, v[3 + j * 3]); }
      const t = v[0]; _qa.setFromAxisAngle(A.thumbOpp, (A.curl.z > 0 ? 1 : -1) * (0.15 + t * 0.9)); _qb.setFromAxisAngle(A.palm, (0.5 - v[13]) * 0.35); SK['thb0' + S].quaternion.copy(_qb).multiply(_qa);
      SK['thb1' + S].quaternion.setFromAxisAngle(A.thumbFlex, t * 0.7); SK['thb2' + S].quaternion.setFromAxisAngle(A.thumbFlex, t * 0.9); }
  }

  // ---------- reach: a hand is put where it is wanted and the arm is worked out from it ----------
  // Everything here is measured in her own space (the space of 'root'), so it holds wherever she stands and whichever way she faces.
  const rInv = new THREE.Matrix4(), _m = new THREE.Matrix4(), _mb = new THREE.Matrix4(), _dp = V3(), _ds = V3(), _ba = V3(), _bb = V3(), _bc = V3(), XAX = V3(1, 0, 0), YAX = V3(0, 1, 0), ZAX = V3(0, 0, 1);
  const Qn = () => new THREE.Quaternion();
  const inRoot = () => { root.updateMatrixWorld(true); rInv.copy(root.matrixWorld).invert(); };
  const rp = (b, out) => out.setFromMatrixPosition(b.matrixWorld).applyMatrix4(rInv);                                          // where a bone is
  const rq = (b, out) => { _m.multiplyMatrices(rInv, b.matrixWorld); _m.decompose(_dp, out, _ds); return out; };               // how a bone is turned
  const rpt = (b, restPt, out) => out.copy(restPt).sub(b.userData.rest).applyMatrix4(b.matrixWorld).applyMatrix4(rInv);        // where a point that rides on a bone is now
  const basisQ = (a, b, out) => { _ba.copy(a).normalize(); _bb.copy(b).addScaledVector(_ba, -b.dot(_ba)).normalize(); _bc.crossVectors(_ba, _bb); _mb.makeBasis(_ba, _bb, _bc); return out.setFromRotationMatrix(_mb); };
  const ARM = {};
  for (const [S] of SIDES) { const u = SK['uarm' + S].userData.rest, f = SK['farm' + S].userData.rest, h = SK['hand' + S].userData.rest, ru = f.clone().sub(u).normalize(), rf = h.clone().sub(f).normalize(), A = handAxes[S];
    ARM[S] = { U: SK['uarm' + S], F: SK['farm' + S], H: SK['hand' + S], share: 0.6, l1: u.distanceTo(f), l2: f.distanceTo(h), rf, qU0: basisQ(ru, ZAX, Qn()).invert(), qF0: basisQ(rf, ZAX, Qn()).invert(), qH0: basisQ(A.along, A.palm, Qn()).invert() }; }
  // how a hand is turned when its fingers point along F and its palm faces P
  const handQ = (S, F, P, out) => basisQ(F, P, out).multiply(ARM[S].qH0);
  const ik = { p0: V3(), d: V3(), pole: V3(), u1: V3(), u2: V3(), E: V3(), b1: V3(), b2: V3(), qP: Qn(), qU: Qn(), qF: Qn(), qL: Qn(), qT: Qn(), lU: Qn(), lF: Qn(), lH: Qn() };
  // Put the wrist of arm S at W, with the hand turned to qH (or carried by the forearm when qH is null). hint is the way her elbow
  // leans. k mixes this with the pose her arm already has: 0 leaves it, 1 takes it whole. Her elbow is a hinge; six tenths of any
  // turn of her wrist about her forearm is given to the forearm itself, as a real forearm turns.
  const reach = (S, W, qH, hint, k) => solve(ARM[S], W, qH, hint, k);
  function solve(A, W, qH, hint, k) {
    if (k <= 0.0005) return 0; const U = A.U, Fb = A.F, H = A.H;
    const p0 = rp(U, ik.p0), qP = rq(U.parent, ik.qP), d = ik.d.copy(W).sub(p0), far = d.length(), dist = cl(far, Math.abs(A.l1 - A.l2) + 0.004, A.l1 + A.l2 - 0.0008); d.multiplyScalar(1 / Math.max(1e-6, far));
    const a = (A.l1 * A.l1 - A.l2 * A.l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, A.l1 * A.l1 - a * a));
    const pole = ik.pole.copy(hint).addScaledVector(d, -hint.dot(d)); if (pole.lengthSq() < 1e-8) pole.set(0, -1, 0).addScaledVector(d, d.y); pole.normalize();
    const u1 = ik.u1.copy(d).multiplyScalar(a).addScaledVector(pole, h).normalize(), E = ik.E.copy(p0).addScaledVector(u1, A.l1), u2 = ik.u2.copy(d).multiplyScalar(dist).add(p0).sub(E).normalize();
    const b1 = ik.b1.copy(pole).multiplyScalar(-1).addScaledVector(u1, pole.dot(u1)).normalize(), qU = basisQ(u1, b1, ik.qU).multiply(A.qU0);
    const c = u2.dot(u1), sn = u2.dot(b1), b2 = ik.b2.copy(b1).multiplyScalar(c).addScaledVector(u1, -sn), qF = basisQ(u2, b2, ik.qF).multiply(A.qF0);
    if (qH && A.share) { const qL = ik.qL.copy(qF).invert().multiply(qH); if (qL.w < 0) qL.set(-qL.x, -qL.y, -qL.z, -qL.w);
      const tw = cl(2 * Math.atan2(qL.x * A.rf.x + qL.y * A.rf.y + qL.z * A.rf.z, qL.w), -2.4, 2.4) * A.share; qF.multiply(ik.qT.setFromAxisAngle(A.rf, tw)); }
    U.quaternion.slerp(ik.lU.copy(qP).invert().multiply(qU), k); Fb.quaternion.slerp(ik.lF.copy(qU).invert().multiply(qF), k);
    if (qH) H.quaternion.slerp(ik.lH.copy(qF).invert().multiply(qH), k);
    U.updateMatrixWorld(true); return far - dist;       // more than zero: the place asked for is further than her arm
  }

  // which way the forearm of chain A will run, elbow to wrist, when its wrist is put at W (the same working as solve, without moving her)
  const forearmDir = (A, W, hint, out) => { const p0 = rp(A.U, ik.p0), d = ik.d.copy(W).sub(p0), far = d.length(), dist = cl(far, Math.abs(A.l1 - A.l2) + 0.004, A.l1 + A.l2 - 0.0008); d.multiplyScalar(1 / Math.max(1e-6, far));
    const a = (A.l1 * A.l1 - A.l2 * A.l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, A.l1 * A.l1 - a * a)), pole = ik.pole.copy(hint).addScaledVector(d, -hint.dot(d)); if (pole.lengthSq() < 1e-8) pole.set(0, -1, 0).addScaledVector(d, d.y); pole.normalize();
    const E = ik.E.copy(d).multiplyScalar(a).addScaledVector(pole, h).normalize().multiplyScalar(A.l1).add(p0); return out.copy(d).multiplyScalar(dist).add(p0).sub(E).normalize(); };
  // A wrist bends only so far. If the way a hand is asked to point (F) is more than lim from her forearm, it is brought back to lim, and
  // the turn that did it is handed back (qFix) so whatever she holds can turn with her hand. Returns true when it had to.
  const _wl = { fd: V3(), v: V3(), n: V3() };
  const wristLimit = (A, W, hint, F, P, lim, qFix) => { const fd = forearmDir(A, W, hint, _wl.fd), c = cl(F.dot(fd), -1, 1); qFix.identity(); if (Math.acos(c) <= lim) return false;
    const v = _wl.v.copy(F).addScaledVector(fd, -c); if (v.lengthSq() < 1e-10) return false; v.normalize(); const n = _wl.n.copy(fd).multiplyScalar(Math.cos(lim)).addScaledVector(v, Math.sin(lim));
    qFix.setFromUnitVectors(F, n); F.copy(n); P.applyQuaternion(qFix); return true; };

  // ---------- light: her bowstring, her arrow (I1) and the sparks where the string is about to be ----------
  // These only ever add light to the picture (HOW-TO-flipbook-look, section 6), so in the Flipbook look they are neither inked nor
  // snapped to her colours. They are made of small solid shapes, sized in metres, so they are the same at any picture size.
  const glowOnly = (m, pre) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = pre ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; return m; };
  const FX = new THREE.Group(); FX.name = 'rangerLight'; root.add(FX);
  const lightMat = (hex) => glowOnly(new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide }));
  const cylG = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true); cylG.translate(0, 0.5, 0);
  const coneG = new THREE.CylinderGeometry(0, 1, 1, 8, 1, true); coneG.translate(0, 0.5, 0);
  const octG = new THREE.OctahedronGeometry(1, 0);
  const lightMesh = (g, hex) => { const m = new THREE.Mesh(g, lightMat(hex)); m.frustumCulled = false; m.visible = false; m.renderOrder = 8; FX.add(m); return m; };
  const _lv = V3();
  // a line of light from a to b: a bright core and two wider, fainter coats round it
  const beam = () => [lightMesh(cylG, '#eaf4ff'), lightMesh(cylG, '#7fb4ff'), lightMesh(cylG, '#4a7dff')];
  const setBeam = (B, a, b, r, op, g) => { _lv.copy(b).sub(a); const L = _lv.length(); if (L > 1e-5) _lv.multiplyScalar(1 / L);
    for (let i = 0; i < 3; i++) { const m = B[i], o = op * [1, 0.26, 0.09][i]; m.visible = o > 0.004 && L > 1e-5; if (!m.visible) continue; const rr = r * [1, 2.8, 6][i] * (i ? (g || 1) : 1); m.position.copy(a); m.scale.set(rr, L, rr); m.quaternion.setFromUnitVectors(YAX, _lv); m.material.opacity = o; } };
  const LT = { strU: beam(), strD: beam(), shaft: beam(), trail: beam(), head: [lightMesh(coneG, '#f4f9ff'), lightMesh(coneG, '#7fb4ff')], fl: [lightMesh(coneG, '#9cc6ff'), lightMesh(coneG, '#5a8cff')], sparks: [] };
  for (let i = 0; i < 11; i++) LT.sparks.push(lightMesh(octG, i % 3 ? '#bcd9ff' : '#f4f9ff'));
  const lightsOff = () => { FX.traverse((o) => { if (o.isMesh) o.visible = false; }); };

  // ---------- her bow: on her back, in her hands, drawn ----------
  // Where the folded bow rides (G6): flat and upright against the middle of her back, following the slope of her back.
  const BACK = (() => { const z = (y) => rTorso(0, y)[2], y0 = 1.205, h = 0.12, tilt = Math.atan2(z(y0 + h) - z(y0 - h), 2 * h);
    return { p: V3(0.012, y0, Math.min(z(y0), (z(y0 + h) + z(y0 - h)) / 2) - 0.019), q: Qn().setFromAxisAngle(XAX, tilt) }; })();
  const GRIP = [0.064 * HAND_S, 0.0235 * HAND_S, 0], HOOKP = [0.112 * HAND_S, 0.021 * HAND_S, 0.019 * HAND_S];      // where a held rod, and a hooked string, sit in her hand: [along her fingers, out from her palm, toward her thumb]
  const ANCH = V3(-0.060, 1.418, 0.040);                // the corner of her jaw on her right side, where the string comes back to (it rides on her head)
  // The gem's two shots use the bow move with a second arrow. Its clock (drawClock): up to the first release it runs as it is. Then
  // her body and the bow hold while her string hand comes forward again (the bow arm bends in to meet it, as at the first draw), she
  // draws and lets go a second time at TR2; after that the move runs on, late by DL. GEM_CUT is where the gem touch hands over to it.
  const drawClock = (T, two, o) => { o.T = T; o.ren = 1; o.arw = 1;
    if (two && T >= TR2) o.T = T - DL;
    else if (two && T >= TR) { const u = T - TR; o.aft = 0; o.loosed = false; o.dr = 0;
      if (u < 0.45) { o.T = TR - 0.02; o.loosed = true; o.aft = u; } else if (u < 0.75) { o.ren = sm(0.45, 0.75, u); o.T = lerp(1.86, 1.30, o.ren); o.arw = 0; }
      else if (u < 1.25) { o.T = lerp(1.30, 1.86, (u - 0.75) / 0.5); o.dr = sm(1.28, 1.86, o.T); } else { o.T = 1.86 + (u - 1.25); o.dr = 1; }
      return o; }
    o.loosed = o.T >= TR; o.aft = Math.max(0, o.T - TR); o.dr = o.loosed ? 0 : sm(1.28, 1.86, o.T); return o; }, DCK = {}, DCB = {}, GEM_CUT = 1.75;
  const TR = 2.45;                                       // the moment she lets go, in the move's own seconds
  const K1 = V3(-0.40, 1.17, -0.04), K2 = V3(0.07, 1.20, 0.31);      // the bow's way round her: out past her right side, then in front of her chest
  const D = { pBack: V3(), qBack: Qn(), p: V3(), q: Qn(), qS: Qn(), qt: Qn(), a: V3(), b: V3(), c: V3(), K3: V3(), shL: V3(), anch: V3(), F: V3(), P: V3(), Th: V3(), W: V3(), g: V3(), qH: Qn(), qG: Qn(), qFK: Qn(), pFK: V3(), hint: V3(),
    missL: 0, missR: 0, missLeg: 0, clip: 0, clipLeft: 0, clipLeg: 0, clipAt: '', tU: V3(), tD: V3(), nock: V3(), nock0: V3(), pass: V3(), dir: V3(), tail: V3(), tip: V3(), rel: V3(), relDir: V3(), e1: V3(), e2: V3() };
  const bez = (a, b, c, u, out) => out.copy(a).multiplyScalar((1 - u) * (1 - u)).addScaledVector(b, 2 * u * (1 - u)).addScaledVector(c, u * u);
  // the wrist that puts point g of the bow at the place GP of her hand, the hand turned by yaw about the bow's length
  const onBow = (S, a, f, yaw, GP, outW, outQ) => { const s = S === 'L' ? 1 : -1, cy = Math.cos(yaw), sy = Math.sin(yaw);
    D.F.set(cy, 0, -sy).applyQuaternion(D.q); D.P.set(s * sy, 0, s * cy).applyQuaternion(D.q); D.Th.crossVectors(D.F, D.P).multiplyScalar(-s);
    outW.set(f, a, 0).applyQuaternion(D.q).add(D.p).addScaledVector(D.F, -GP[0]).addScaledVector(D.P, -GP[1]).addScaledVector(D.Th, -GP[2]); return handQ(S, D.F, D.P, outQ); };
  let lastRel = -1;
  const TR2 = TR + 1.50, DL = TR2 - TR;
  function armsAndBow(T, dt, two) {
    inRoot();
    rpt(SK.spine3, BACK.p, D.pBack); rq(SK.spine3, D.qBack).multiply(BACK.q);
    if (T < 0) { SK.bow.position.copy(D.pBack); SK.bow.quaternion.copy(D.qBack); BOWK.set(0, 0, 0); SK.bow.updateMatrixWorld(true); lightsOff(); MATS.bowGem.emissiveIntensity = 0.45; return; }
    const CK = drawClock(T, two, DCK), big = two ? 1.4 : 1; T = CK.T;
    // --- the beats of the move. She pulls the folded bow from her back with her right hand and brings it round to the front; her left
    // hand takes the grip and starts it out to her left while the limbs unroll; sparks, then the string; her right hand hooks the
    // string while it is still in reach, and she pushes the bow out and pulls the string back together. She holds, lets go, the bow
    // dips, and it all runs back: rolled up, passed to her right hand, and put away.
    const bring = sm(0.28, 0.80, T) * (1 - sm(3.46, 3.98, T)), lift = sm(0.20, 0.32, T) * (1 - sm(3.95, 4.08, T)), open = sm(0.84, 1.26, T) * (1 - sm(2.94, 3.36, T));
    const pres = (0.45 * sm(0.84, 1.24, T) + 0.55 * sm(1.28, 1.84, T)) * (1 - sm(2.95, 3.40, T));
    const wR = sm(0.02, 0.27, T) * (1 - sm(4.06, 4.3, T)), wRs = sm(0.86, 1.24, T) * (1 - sm(2.78, 3.22, T)), wLb = sm(0.58, 0.84, T) * (1 - sm(3.42, 3.64, T));
    const loosed = CK.loosed, aft = CK.aft, dr = CK.dr, fol = sm(2.50, 2.80, T) * (1 - sm(2.95, 3.3, T));
    // --- the bow's own way: off her back, round her right side, to the front, then out to her left at full reach
    D.a.set(0, 0, -0.045 * lift).applyQuaternion(D.qBack).add(D.pBack); bez(D.a, K1, K2, bring, D.p);
    rp(SK.uarmL, D.shL); rpt(SK.head, ANCH, D.anch); D.anch.z += 0.030;                                 // the string stands a little clear of her cheek
    { const r = ARM.L.l1 + ARM.L.l2 - 0.004, dy = 0.085, dz = D.anch.z - GRIP[1] - D.shL.z, dx = Math.sqrt(Math.max(0.01, r * r - dy * dy - dz * dz)); D.K3.set(D.shL.x + dx + GRIP[0], D.shL.y + dy, D.anch.z); }
    D.p.lerp(D.K3, pres); D.p.y += 0.05 * Math.sin(PI * pres) - 0.11 * fol; D.p.x -= 0.02 * fol;
    const yaw = (290 * bring * bring - 345 * bring) * DEG * (1 - pres), tz = (-100 * bring * bring + 94 * bring) * DEG * (1 - pres) - 36 * DEG * fol, px = 14 * DEG * bring * bring * (1 - pres);
    D.qS.setFromAxisAngle(ZAX, tz).multiply(D.qt.setFromAxisAngle(XAX, px)).multiply(D.qt.setFromAxisAngle(YAX, yaw)); D.q.copy(D.qBack).slerp(D.qS, sm(0, 0.3, bring));
    const shake = (T > 1.24 && T < TR ? 0.05 * Math.exp(-(T - 1.24) / 0.12) * Math.sin((T - 1.24) * 40) : 0) + (loosed ? 0.07 * Math.exp(-aft / 0.10) * Math.sin(aft * 55) : 0);
    SK.bow.position.copy(D.p); SK.bow.quaternion.copy(D.q); BOWK.set(open, dr, shake); SK.bow.updateMatrixWorld(true);
    // --- the string's ends, and where the arrow sits on it
    rpt(SK[BOWK.tipBone.U], BOWK.tips.U, D.tU); rpt(SK[BOWK.tipBone.D], BOWK.tips.D, D.tD);
    D.nock0.set(BOWK.stringF, BOWK.nockA, 0).applyQuaternion(D.q).add(D.p); D.pass.set(0.012, BOWK.nockA, 0).applyQuaternion(D.q).add(D.p);
    D.c.copy(D.anch); D.c.y = lerp(D.c.y, D.pass.y, 0.15); D.nock.copy(D.nock0).lerp(D.c, dr);
    if (loosed) D.nock.addScaledVector(D.e1.set(1, 0, 0).applyQuaternion(D.q), 0.035 * Math.exp(-aft / 0.07) * Math.sin(aft * 62));      // the string sings
    // --- her left hand: takes the grip in front of her and carries the bow out
    if (wLb > 0) { rp(SK.handL, D.pFK); rq(SK.handL, D.qFK); onBow('L', 0, 0, -45 * DEG * (1 - pres), GRIP, D.W, D.qG);
      D.W.lerp(D.pFK, 1 - wLb); const arc = 4 * wLb * (1 - wLb); D.W.x += 0.07 * arc; D.W.z += 0.10 * arc; D.qH.copy(D.qFK).slerp(D.qG, wLb);
      const miss = reach('L', D.W, D.qH, D.hint.set(lerp(0.5, 0.15, pres), lerp(-1, -0.55, pres), lerp(-0.3, -1, pres)), sm(0, 0.25, wLb)); if (miss > D.missL) D.missL = miss; }
    // --- her right hand: pulls the bow free by the lower crescent; later goes to the string, draws, and springs back when she lets go
    if (wR > 0) { rp(SK.handR, D.pFK); rq(SK.handR, D.qFK); onBow('R', -BOWK.hubA, 0, -40 * DEG, GRIP, D.W, D.qG); D.qH.copy(D.qG);
      if (wRs > 0) { D.F.set(1, 0, 0).applyQuaternion(D.q); D.P.set(0, 0, -1).applyQuaternion(D.q); D.Th.crossVectors(D.F, D.P);
        D.g.copy(loosed ? D.c : D.nock); if (loosed) { const e = 1 - Math.exp(-aft / 0.06); D.g.addScaledVector(D.F, -0.19 * e); D.g.y += 0.045 * e; } else if (CK.ren < 1) { D.e1.copy(D.c).addScaledVector(D.F, -0.19); D.e1.y += 0.045; D.g.lerp(D.e1, 1 - CK.ren); }
        D.g.addScaledVector(D.F, -HOOKP[0]).addScaledVector(D.P, -HOOKP[1]).addScaledVector(D.Th, -HOOKP[2]); D.W.lerp(D.g, wRs); D.qH.slerp(handQ('R', D.F, D.P, D.qG), wRs); }
      D.W.lerp(D.pFK, 1 - wR); const arc = 4 * wR * (1 - wR); D.W.x -= 0.07 * arc; D.W.z -= 0.05 * arc; D.qG.copy(D.qH); D.qH.copy(D.qFK).slerp(D.qG, wR);
      D.hint.set(lerp(-0.6, -0.9, bring), lerp(-0.2, -0.45, bring), lerp(-1, 0.05, bring)).lerp(D.e1.set(-0.9, lerp(-0.25, 0.5, loosed ? 1 : dr), lerp(0.1, -0.2, loosed ? 1 : dr)), wRs);
      const miss = reach('R', D.W, D.qH, D.hint, sm(0, 0.25, wR)); if (miss > D.missR) D.missR = miss; }
    fWant.L = wLb > 0.7 ? FP.grip : FP.relax;
    fWant.R = wRs > 0.85 ? (loosed ? (aft < 0.45 ? FP.open : FP.relax) : FP.hook) : wR > 0.75 && wRs < 0.15 ? FP.hold : FP.relax;
    // --- light
    const strOn = sm(1.20, 1.32, T) * (1 - sm(2.80, 2.95, T)), flick = 0.92 + 0.08 * Math.sin(T * 47);
    setBeam(LT.strU, D.tU, D.nock, 0.0012, strOn * flick, 1 + 0.5 * dr); setBeam(LT.strD, D.nock, D.tD, 0.0012, strOn * flick, 1 + 0.5 * dr);
    MATS.bowGem.emissiveIntensity = 0.45 + 1.5 * strOn * (0.3 + 0.7 * (loosed ? Math.exp(-aft / 0.3) : dr));
    const spk = sm(1.02, 1.12, T) * (1 - sm(1.26, 1.40, T)); D.e1.copy(BOWK.tips.U).sub(BOWK.G0).applyQuaternion(D.q).add(D.p); D.e2.copy(BOWK.tips.D).sub(BOWK.G0).applyQuaternion(D.q).add(D.p);
    for (let i = 0; i < LT.sparks.length; i++) { const m = LT.sparks[i], tw = 0.5 + 0.5 * Math.sin(T * (23 + i * 3.1) + i * 1.7), o = spk * tw; m.visible = o > 0.02; if (!m.visible) continue;
      const u = (i + 0.5) / LT.sparks.length; m.position.copy(D.e1).lerp(D.e2, u); m.position.x += 0.012 * Math.sin(i * 2.3 + T * 9); m.position.y += 0.010 * Math.sin(i * 1.3 + T * 7); m.scale.setScalar(0.0022 + 0.0042 * tw); m.rotation.set(T * 3 + i, T * 2, 0); m.material.opacity = o; }
    // the arrow: it forms on the string as she draws, and flies when she lets go
    if (!loosed) { lastRel = -1; D.dir.copy(D.pass).sub(D.nock).normalize(); D.tail.copy(D.nock); }
    else { if (lastRel !== mv) { lastRel = mv; D.rel.copy(D.c); D.relDir.copy(D.pass).sub(D.c).normalize(); } D.dir.copy(D.relDir); D.tail.copy(D.rel).addScaledVector(D.dir, 26 * aft); }
    const aOn = (loosed ? 1 - sm(0.7, 0.95, aft) : sm(1.34, 1.62, T)) * CK.arw, La = (loosed ? 0.76 : 0.26 + 0.50 * dr) * (two ? 1.15 : 1);
    D.tip.copy(D.tail).addScaledVector(D.dir, La); D.e1.copy(D.tip).addScaledVector(D.dir, -0.062);
    setBeam(LT.shaft, D.tail, D.e1, 0.0021 * big, aOn, 1.15);
    for (let i = 0; i < 2; i++) { const m = LT.head[i], o = aOn * (i ? 0.26 : 1); m.visible = o > 0.004; if (m.visible) { const r = i ? 0.024 : 0.0105, L = i ? 0.10 : 0.062; m.position.copy(D.tip).addScaledVector(D.dir, -L + (i ? 0.02 : 0)); m.scale.set(r, L, r); m.quaternion.setFromUnitVectors(YAX, D.dir); m.material.opacity = o; } }
    for (let i = 0; i < 2; i++) { const m = LT.fl[i], o = aOn * (i ? 0.10 : 0.30); m.visible = o > 0.004; if (m.visible) { const r = i ? 0.020 : 0.009, L = i ? 0.15 : 0.10; m.position.copy(D.tail); m.scale.set(r, L, r); m.quaternion.setFromUnitVectors(YAX, D.dir); m.material.opacity = o; } }
    setBeam(LT.trail, D.rel, D.tail, 0.0016 * big, loosed ? 0.8 * Math.exp(-aft / 0.22) * (1 - sm(0.7, 0.95, aft)) : 0, 1.6);
  }
  // ---------- planted feet: her legs are worked out the same way as her arms. Her knee folds backward and her shin does not twist ----------
  const NZ = V3(0, 0, -1), LEG = {}, FOOT_Y = SK.footR.userData.rest.y;
  for (const [S] of SIDES) { const u = SK['thigh' + S].userData.rest, f = SK['shin' + S].userData.rest, h = SK['foot' + S].userData.rest, ru = f.clone().sub(u).normalize(), rf = h.clone().sub(f).normalize();
    LEG[S] = { U: SK['thigh' + S], F: SK['shin' + S], H: SK['foot' + S], l1: u.distanceTo(f), l2: f.distanceTo(h), rf, share: 0, qU0: basisQ(ru, NZ, Qn()).invert(), qF0: basisQ(rf, NZ, Qn()).invert() }; }
  // Put the ankle of leg S at W with the foot turned to qF; hint is the way her knee points
  const plant = (S, W, qF, hint, k) => solve(LEG[S], W, qF, hint, k);

  // ---------- her sword: in its scabbard, drawn, on guard, the cut ----------
  // The scabbard hangs from her belt and swings: its far end is a weight on a spring, pulled to where it would hang. It is kept clear
  // of her left thigh. When she draws, her left hand tips its mouth forward and turns it flat to her, so her right hand can take the grip
  // from above (tilt 0 to 1).
  const SC = { tip: null, vel: V3(), L: 0.36, axis: V3(1, 0, -0.25).normalize() };
  const W = { qh: Qn(), qi: Qn(), qt: Qn(), qr: Qn(), piv: V3(), rest: V3(), tgt: V3(), dir: V3(), tl: V3(), a: V3(), b: V3(), e: V3(), d: V3(), p: V3(), q: Qn(), q2: Qn(), qs: Qn(), sh: V3(), shL: V3(), fk: V3(), qfk: Qn(), ft: V3(), qf: Qn(), hint: V3(),
    F: V3(), P: V3(), Th: V3(), W: V3(), g: V3(), qG: Qn(), qH: Qn(), foot: V3(), tip: V3(), v1: V3(), v2: V3(), shP: V3() };
  function scabTick(dt, settle, tilt) {
    const Hb = SK.hips, B = SK.scab; rq(Hb, W.qh); rpt(Hb, SWK.pivot, W.piv);
    const rest = W.rest.copy(SWK.ds).applyQuaternion(W.qh), tgt = W.tgt.copy(rest); tgt.y -= 0.30; tgt.normalize().multiplyScalar(SC.L).add(W.piv);
    if (!SC.tip || settle) { SC.tip = tgt.clone(); SC.vel.set(0, 0, 0); }
    else { const n = Math.max(1, Math.ceil(dt / 0.012)), st = dt / n; for (let k = 0; k < n; k++) { SC.vel.x += ((tgt.x - SC.tip.x) * 60 - SC.vel.x * 6) * st; SC.vel.y += ((tgt.y - SC.tip.y) * 60 - SC.vel.y * 6) * st; SC.vel.z += ((tgt.z - SC.tip.z) * 60 - SC.vel.z * 6) * st; SC.tip.addScaledVector(SC.vel, st); } }
    const dir = W.dir.copy(SC.tip).sub(W.piv).normalize(), c = cl(dir.dot(rest), -1, 1);
    if (Math.acos(c) > 0.45) { dir.addScaledVector(rest, -c).normalize().multiplyScalar(Math.sin(0.45)).addScaledVector(rest, Math.cos(0.45)); SC.vel.multiplyScalar(0.6); }
    SC.tip.copy(dir).multiplyScalar(SC.L).add(W.piv);
    W.qi.copy(W.qh).invert(); dir.applyQuaternion(W.qi);                                           // into her hips' own space
    const tl = W.tl.copy(rp(SK.shinL, W.a)).sub(rp(SK.thighL, W.b)).normalize().applyQuaternion(W.qi), need = tl.x + 0.035; if (dir.x < need) { dir.x = need; dir.normalize(); }
    { const low = (0.03 - W.piv.y) / (SWK.LEN + 0.05); dir.applyQuaternion(W.qh); if (dir.y < low && low < 1) { const hz = Math.hypot(dir.x, dir.z), k = Math.sqrt(Math.max(0, 1 - low * low)); if (hz > 1e-4) { dir.x *= k / hz; dir.z *= k / hz; } else { dir.x = 0.3 * k; dir.z = -0.95 * k; } dir.y = low; dir.normalize(); } dir.applyQuaternion(W.qi); }       // nor the floor: when she is low it lies back along the ground      // her thigh pushes it out, never through it
    B.quaternion.setFromUnitVectors(SWK.ds, dir); if (tilt) B.quaternion.multiply(W.qr.setFromAxisAngle(SWK.ds, 0.70 * tilt)).premultiply(W.qt.setFromAxisAngle(SC.axis, 0.40 * tilt));
    B.updateMatrixWorld(true);
  }
  // The beats of the sword move, in its own seconds: her right hand crosses to the grip while her left tips the scabbard (to 0.26); the
  // blade slides out as she hops round into her guard, right foot leading toward screen right (to 0.6); guard; the blade goes back over
  // her shoulder (1.02 to 1.24); the cut comes over the top with a long step (1.27 to 1.40); she holds the lunge, recovers to guard
  // (1.9 to 2.3), turns back and puts the sword away (from 2.56).
  const SWB = {};
  const swordBeats = (T, o) => { o.T = T; o.st = sm(0.26, 0.58, T) * (1 - sm(2.74, 3.08, T)); o.hop = Math.sin(PI * sm(0.26, 0.58, T)) + Math.sin(PI * sm(2.74, 3.08, T));
    o.lun = sm(1.20, 1.40, T) * (1 - sm(1.90, 2.28, T)); o.step = Math.sin(PI * sm(1.20, 1.38, T)) + Math.sin(PI * sm(1.90, 2.28, T)); o.a = sm(1.02, 1.24, T); o.b = sm(1.27, 1.39, T); o.c = sm(1.95, 2.30, T);
    o.slide = sm(0.24, 0.48, T) * (1 - sm(2.86, 3.12, T)); o.free = sm(0.34, 0.58, T) * (1 - sm(2.60, 2.92, T)); o.tilt = sm(0.04, 0.26, T) * (1 - sm(0.46, 0.66, T)) + sm(2.56, 2.80, T) * (1 - sm(3.12, 3.32, T));
    o.wR = sm(0.02, 0.26, T) * (1 - sm(3.14, 3.42, T)); return o; };
  // Where the grip is and how the blade is turned once it is in her hand, measured from her right shoulder. The blade turns in the
  // plane of the picture: phi is how far its point is raised from pointing straight at screen right. Guard 50 degrees, back over her
  // shoulder 118, the end of the cut 2 (it dips a little past and comes back).
  const HP = { p: V3(), phi: 0, beta: 0 }, HQ = { p: V3(), phi: 0, beta: 0 }, OQ = {};
  const swordHand = (o, sh, out) => { const ph = lerp(lerp(lerp(50, 118, o.a), 2, o.b), 50, o.c) - 7 * o.b * (1 - o.c) * Math.exp(-Math.max(0, o.T - 1.39) / 0.07), arc = Math.sin(PI * o.b);
    out.p.set(sh.x + lerp(lerp(lerp(0.40, -0.02, o.a), 0.455, o.b), 0.40, o.c) + 0.10 * arc, sh.y + lerp(lerp(lerp(-0.14, 0.26, o.a), -0.03, o.b), -0.14, o.c) + 0.10 * arc, sh.z + lerp(0.03, 0.05, o.a * (1 - o.b)));
    out.phi = ph * DEG; out.beta = lerp(35, 50, o.b * (1 - o.c)) * DEG; return out; };
  // the crescent of light the cut leaves (I5): bright and sharp along its outer edge, fading to nothing on the inside and behind
  const NT = 44, trailG = new THREE.BufferGeometry(), trailP = new Float32Array((NT + 1) * 12), trailC = new Float32Array((NT + 1) * 12);
  trailG.setAttribute('position', new THREE.BufferAttribute(trailP, 3)); trailG.setAttribute('color', new THREE.BufferAttribute(trailC, 3));
  { const ix = []; for (let j = 0; j < NT; j++) { const a = j * 4, b = a + 4; ix.push(a, a + 1, b, a + 1, b + 1, b, a + 2, a + 3, b + 2, a + 3, b + 3, b + 2); } trailG.setIndex(ix); }
  const trailM = new THREE.Mesh(trailG, glowOnly(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide })));
  trailM.frustumCulled = false; trailM.visible = false; trailM.renderOrder = 8; FX.add(trailM); LT.swGlow = beam();
  const swordLightOff = () => { trailM.visible = false; for (const m of LT.swGlow) m.visible = false; MATS.swordGem.emissiveIntensity = 0.4; };
  function swordStage(T, dt, settle) {
    inRoot();
    if (T < 0) { scabTick(dt, settle, 0); rpt(SK.scab, SWK.Psh, W.p); rq(SK.scab, W.q).multiply(SWK.Qsh); SK.sword.position.copy(W.p); SK.sword.quaternion.copy(W.q); SK.sword.updateMatrixWorld(true); swordLightOff(); return; }
    const o = swordBeats(T, SWB);
    // --- her feet: planted. Her right foot leads toward screen right; her left is set back and stays where it is through the lunge
    const kLeg = sm(0, 0.2, o.st);
    if (kLeg > 0) for (const [Sd] of SIDES) { const lead = Sd === 'R', yaw = (lead ? 80 : 12) * DEG * o.st;
      W.ft.set(lead ? 0.26 + 0.34 * o.lun : -0.22, FOOT_Y, lead ? 0.06 : -0.07).lerp(SK['foot' + Sd].userData.rest, 1 - o.st); W.ft.y = FOOT_Y + 0.07 * o.hop * (lead ? 1 : 0.8) + (lead ? 0.055 * o.step : 0);
      const miss = plant(Sd, W.ft, W.qf.setFromAxisAngle(YAX, yaw), W.hint.set(Math.sin(yaw), 0.25, Math.cos(yaw)), kLeg); if (miss > D.missLeg) D.missLeg = miss; }
    // --- the scabbard, then the sword: it slides out along the scabbard and is handed over to her sword hand's own path
    scabTick(dt, settle, o.tilt);
    rq(SK.scab, W.qs); W.d.copy(SWK.ds).applyQuaternion(W.qs); rpt(SK.scab, SWK.Psh, W.p).addScaledVector(W.d, -0.585 * o.slide); W.q.copy(W.qs).multiply(SWK.Qsh);
    rp(SK.uarmR, W.sh); swordHand(o, W.sh, HP); W.p.lerp(HP.p, o.free); W.q.slerp(W.q2.setFromAxisAngle(ZAX, HP.phi - PI / 2), o.free);
    SK.sword.position.copy(W.p); SK.sword.quaternion.copy(W.q); SK.sword.updateMatrixWorld(true);
    // --- her right hand: the grip lies a little across her palm, more so at full reach, so her wrist never has to bend further than a wrist can
    const beta = lerp(35 * DEG, HP.beta, o.free), a = W.a.set(0, 1, 0).applyQuaternion(W.q), e = W.e.set(1, 0, 0).applyQuaternion(W.q);
    W.F.copy(e).multiplyScalar(Math.cos(beta)).addScaledVector(a, Math.sin(beta)); W.Th.copy(a).multiplyScalar(Math.cos(beta)).addScaledVector(e, -Math.sin(beta)); W.P.crossVectors(W.Th, W.F);
    W.W.copy(W.p).addScaledVector(W.F, -GRIP[0]).addScaledVector(W.P, -GRIP[1]); handQ('R', W.F, W.P, W.qG);
    rp(SK.handR, W.fk); rq(SK.handR, W.qfk); W.W.lerp(W.fk, 1 - o.wR); { const arc = 4 * o.wR * (1 - o.wR); W.W.z += 0.10 * arc; } W.qH.copy(W.qfk).slerp(W.qG, o.wR);
    W.hint.set(lerp(-0.7, -0.1, o.free), lerp(-0.6, -1, o.free), 0.5).lerp(W.v1.set(0.2, -0.4, 1), o.a * (1 - o.b));
    { const miss = reach('R', W.W, W.qH, W.hint, sm(0, 0.25, o.wR)); if (miss > D.missR) D.missR = miss; }
    // --- her left hand: steadies the scabbard while the blade leaves it and comes back; in between it is held low and back, thrown back in the lunge
    const wLs = o.tilt, wLb = o.free * (1 - o.tilt), kLh = Math.max(wLs, wLb);
    if (kLh > 0) { rp(SK.handL, W.fk); rp(SK.uarmL, W.shL); W.b.set(lerp(-0.18, -0.40, o.lun), lerp(-0.30, -0.10, o.lun), -0.10).add(W.shL);
      rpt(SK.scab, W.v1.copy(SWK.Pm).addScaledVector(SWK.ns, 0.034).addScaledVector(SWK.ds, -0.02), W.g); W.g.y += 0.05;
      W.W.copy(W.fk).lerp(W.b, wLb).lerp(W.g, wLs); { const bell = 4 * wLs * (1 - wLs), ar = W.arc || (W.arc = V3()); rp(SK.hips, ar); ar.subVectors(W.W, ar); ar.y = 0; if (bell > 0.001 && ar.lengthSq() > 1e-6) W.W.addScaledVector(ar.normalize(), 0.17 * bell); } const miss = reach('L', W.W, null, W.hint.set(0.3, -0.5, -1), sm(0, 0.25, kLh)); if (miss > D.missL) D.missL = miss; }
    fWant.R = o.wR > 0.75 ? FP.hold : FP.relax; fWant.L = o.tilt > 0.6 ? FP.hold : o.free > 0.5 ? (o.lun > 0.5 ? FP.open : FP.soft) : FP.relax;
    // --- light: the blade shines as she cuts, and leaves its crescent
    const glow = sm(1.20, 1.30, T) * (1 - sm(1.45, 1.80, T)); W.foot.copy(W.p).addScaledVector(a, SWK.Y0); W.tip.copy(W.p).addScaledVector(a, SWK.Y1);
    setBeam(LT.swGlow, W.foot, W.tip, 0.0042, 0.5 * glow, 1.3); MATS.swordGem.emissiveIntensity = 0.4 + 1.4 * glow;
    let most = 0;
    for (let j = 0; j <= NT; j++) { const Tq = T - j * 0.006, q = swordBeats(Tq, OQ), dl = o.lun - q.lun; W.shP.set(W.sh.x - 0.31 * dl, W.sh.y + 0.10 * dl, W.sh.z); swordHand(q, W.shP, HQ);
      const w = sm(1.262, 1.30, Tq) * (1 - sm(1.40, 1.47, Tq)) * Math.pow(1 - j / NT, 2.2), ca = Math.cos(HQ.phi), sa = Math.sin(HQ.phi), k = j * 12; most = Math.max(most, w);
      for (let v = 0; v < 4; v++) { const r = [SWK.Y0 + 0.50 * (SWK.Y1 - SWK.Y0), SWK.Y1, SWK.Y1 - 0.022, SWK.Y1 + 0.003][v], c = [0, 0.30, 0.55, 0.85][v] * w; trailP[k + v * 3] = HQ.p.x + ca * r; trailP[k + v * 3 + 1] = HQ.p.y + sa * r; trailP[k + v * 3 + 2] = HQ.p.z;
        trailC[k + v * 3] = c * 0.72; trailC[k + v * 3 + 1] = c * 0.86; trailC[k + v * 3 + 2] = c; } }
    trailM.visible = most > 0.01 && o.free > 0.99; if (trailM.visible) { trailG.attributes.position.needsUpdate = true; trailG.attributes.color.needsUpdate = true; }
  }
  // ---------- her knives: in their sheath, in her hands, thrown ----------
  // The beats, in the move's own seconds: both hands go behind her to the handles (to 0.24); the knives come up out of the sheath and
  // round her sides as she hops her feet wide, left foot toward screen right (to 0.6). Her right hand is up by her head, her left low
  // in front (H8). She coils, throws the first with her right hand (let go at 0.88) while the second is already coming up, and
  // throws that with her left as her body unwinds (let go at 1.20). She watches them go, stands up, and the knives come back to
  // their sheath in a glint of light (from 1.95).
  const KNB = {}, KNQ = {}, TK = [0.88, 1.20], KH = { p: V3(), phi: 0 }, KR = { p: V3(), phi: 0 };
  const knifeBeats = (T, o) => { o.T = T; o.on = sm(0.02, 0.24, T) * (1 - sm(1.50, 1.90, T)); o.st = sm(0.30, 0.58, T) * (1 - sm(1.62, 1.96, T)); o.hop = Math.sin(PI * sm(0.30, 0.58, T)) + Math.sin(PI * sm(1.62, 1.96, T));
    o.slide = sm(0.22, 0.38, T); o.free = sm(0.30, 0.60, T); o.coil = sm(0.56, 0.76, T) * (1 - sm(0.78, 0.88, T)); o.t1 = sm(0.78, 0.90, T); o.f1 = sm(0.88, 1.06, T); o.up2 = sm(0.82, 1.04, T); o.t2 = sm(1.10, 1.22, T); o.f2 = sm(1.20, 1.38, T);
    o.y1 = sm(0.74, 0.88, T); o.y2 = sm(1.06, 1.20, T); o.onH = [o.on * (1 - sm(1.08, 1.42, T)), o.on * (1 - sm(1.40, 1.72, T))]; o.out = sm(1.50, 1.90, T); o.back = sm(1.95, 2.25, T); return o; };
  // where each knife is held and how it is turned once it is in her hand, measured from that hand's shoulder. It turns in the plane of
  // the picture: phi is how far its point is raised from pointing straight at screen right. The wrist snaps late in each throw.
  const knifeHand = (i, o, sh, out) => {
    if (i === 0) { const up = Math.sin(PI * o.t1) * (1 - o.f1); out.phi = lerp(lerp(112 + 10 * o.coil, 6, o.t1 * o.t1), -45, o.f1) * DEG;
      out.p.set(sh.x + lerp(lerp(-0.10 - 0.04 * o.coil, 0.40, o.t1), 0.34, o.f1) + 0.06 * up, sh.y + lerp(lerp(0.22, 0.04, o.t1), -0.22, o.f1) + 0.03 * up, sh.z + lerp(lerp(0.03, 0.07, o.t1), 0.14, o.f1)); }
    else { const up = Math.sin(PI * o.t2) * (1 - o.f2); out.phi = lerp(lerp(lerp(20, 108, o.up2), 6, o.t2 * o.t2), -45, o.f2) * DEG;
      out.p.set(sh.x + lerp(lerp(lerp(0.12, -0.02, o.up2), 0.42, o.t2), 0.36, o.f2) + 0.06 * up, sh.y + lerp(lerp(lerp(-0.32, 0.21, o.up2), 0.04, o.t2), -0.20, o.f2) + 0.03 * up, sh.z + lerp(lerp(lerp(0.22, 0.06, o.up2), 0.06, o.t2), 0.16, o.f2)); }
    return out; };
  const KW = { qfix: Qn(), qh: Qn(), ps: V3(), qs: Qn(), ax: V3(), sh: V3(), p: V3(), q: Qn(), q2: Qn(), a: V3(), e: V3(), F: V3(), P: V3(), W: V3(), fk: V3(), qfk: Qn(), qG: Qn(), qH: Qn(), hint: V3(), ft: V3(), qf: Qn(), dir: V3(), v1: V3(), v2: V3() };
  const KGRIP = [0.060 * HAND_S, 0.0195 * HAND_S], FLY = V3(Math.cos(3 * DEG), Math.sin(3 * DEG), 0);
  LT.kTrail = [beam(), beam()]; LT.kGlint = [[beam(), beam()], [beam(), beam()]];
  const knifeLightOff = () => { for (const B of LT.kTrail) for (const m of B) m.visible = false; for (const G of LT.kGlint) for (const B of G) for (const m of B) m.visible = false; };
  function knifeStage(T) {
    inRoot();
    const drawn = T >= 0, o = drawn ? knifeBeats(T, KNB) : null;
    if (!drawn) knifeLightOff();
    else { const kLeg = sm(0, 0.2, o.st);       // her feet: hopped wide and planted, her left toward screen right
      if (kLeg > 0) for (const [Sd] of SIDES) { const lead = Sd === 'L', yaw = (lead ? 50 : -5) * DEG * o.st;
        KW.ft.set(lead ? 0.27 : -0.25, FOOT_Y, lead ? 0.03 : -0.02).lerp(SK['foot' + Sd].userData.rest, 1 - o.st); KW.ft.y = FOOT_Y + 0.06 * o.hop;
        const miss = plant(Sd, KW.ft, KW.qf.setFromAxisAngle(YAX, yaw), KW.hint.set(Math.sin(yaw), 0.25, Math.cos(yaw)), kLeg); if (miss > D.missLeg) D.missLeg = miss; } }
    rq(SK.hips, KW.qh);
    for (let i = 0; i < 2; i++) { const B = SK[KNK.names[i]], S = i ? 'L' : 'R', s8 = KNK.sheath[i];
      rpt(SK.hips, s8.P, KW.ps); KW.qs.copy(KW.qh).multiply(s8.Q); KW.ax.copy(s8.ax).applyQuaternion(KW.qh);
      if (!drawn) { B.position.copy(KW.ps); B.quaternion.copy(KW.qs); B.scale.setScalar(1); B.updateMatrixWorld(true); continue; }
      // the knife as her hand holds it: up out of its pocket, round her side, then on that hand's own path
      rp(SK['uarm' + S], KW.sh); knifeHand(i, o, KW.sh, KH);
      const arc = 4 * o.free * (1 - o.free); KW.p.copy(KW.ps).addScaledVector(KW.ax, -KNK.pull * o.slide).lerp(KH.p, o.free); KW.p.x += (i ? 0.14 : -0.16) * arc; KW.p.z -= 0.03 * arc;
      KW.q.copy(KW.qs).slerp(KW.q2.setFromAxisAngle(ZAX, KH.phi - PI / 2), o.free);
      // her hand, from the knife: the handle in her fist, the blade out past her thumb
      const cb = Math.cos(15 * DEG), sb = Math.sin(15 * DEG), a = KW.a.set(0, 1, 0).applyQuaternion(KW.q), e = KW.e.set(1, 0, 0).applyQuaternion(KW.q);
      KW.F.copy(e).multiplyScalar(cb).addScaledVector(a, sb); KW.v1.copy(a).multiplyScalar(cb).addScaledVector(e, -sb); if (i) KW.P.crossVectors(KW.F, KW.v1); else KW.P.crossVectors(KW.v1, KW.F);
      KW.W.copy(KW.p).addScaledVector(KW.F, -KGRIP[0]).addScaledVector(KW.P, -KGRIP[1]);
      KW.hint.set((i ? 1 : -1) * lerp(0.6, 0.8, o.free), lerp(-0.3, -0.5, o.free), lerp(-1, 0.3, o.free));
      // Her wrist: cocked back a little in the wind-up, snapped forward at the throw, never past what a wrist can do. Once the knife has
      // gone her open hand follows her forearm. The knife turns with her hand, so its point is still high when she lets go.
      { const aft0 = T - TK[i], lim = lerp(34, 12, sm(0, 0.10, aft0)) * DEG;
        for (let it = 0; it < 2; it++) { if (!wristLimit(ARM[S], KW.W, KW.hint, KW.F, KW.P, lim, KW.qfix)) break; KW.q.premultiply(KW.q2.identity().slerp(KW.qfix, o.free)); KW.W.copy(KW.p).addScaledVector(KW.F, -KGRIP[0]).addScaledVector(KW.P, -KGRIP[1]); } }
      handQ(S, KW.F, KW.P, KW.qG);
      const on = o.onH[i]; rp(SK['hand' + S], KW.fk); rq(SK['hand' + S], KW.qfk); KW.W.lerp(KW.fk, 1 - on); if (T < 0.5) { const ar = 4 * on * (1 - on); KW.W.x += (i ? 0.06 : -0.06) * ar; KW.W.z -= 0.08 * ar; } KW.qH.copy(KW.qfk).slerp(KW.qG, on);
      { const miss = reach(S, KW.W, KW.qH, KW.hint, sm(0, 0.25, on)); if (i) { if (miss > D.missL) D.missL = miss; } else if (miss > D.missR) D.missR = miss; }
      // the knife itself: in her hand until she lets go, then flying point first, then back in its pocket
      const aft = T - TK[i], G = LT.kGlint[i]; let trail = 0, glint = 0;
      if (aft < 0) { B.position.copy(KW.p); B.quaternion.copy(KW.q); B.scale.setScalar(1); }
      else if (o.back <= 0) { knifeHand(i, knifeBeats(TK[i], KNQ), KW.sh, KR); B.position.copy(KR.p).addScaledVector(FLY, 0.02 + 19 * aft); B.quaternion.setFromAxisAngle(ZAX, lerp(40, 3, sm(0, 0.07, aft)) * DEG - PI / 2); B.scale.setScalar(aft < 0.5 ? 1 : 0.0001);
        trail = 0.75 * Math.exp(-aft / 0.16) * (1 - sm(0.35, 0.5, aft)); KW.v2.copy(B.position).addScaledVector(FLY, -Math.min(19 * aft, 1.6)); }
      else { B.position.copy(KW.ps); B.quaternion.copy(KW.qs); B.scale.setScalar(Math.max(0.0001, o.back)); glint = Math.sin(PI * o.back); }
      B.updateMatrixWorld(true);
      setBeam(LT.kTrail[i], KW.v2, B.position, 0.0018, trail, 1.5);
      KW.v1.copy(KW.ps).addScaledVector(XAX, -0.045 * glint); KW.v2.copy(KW.ps).addScaledVector(XAX, 0.045 * glint); setBeam(G[0], KW.v1, KW.v2, 0.0008, glint, 1);
      KW.v1.copy(KW.ps).addScaledVector(YAX, -0.065 * glint); KW.v2.copy(KW.ps).addScaledVector(YAX, 0.065 * glint); setBeam(G[1], KW.v1, KW.v2, 0.0008, glint, 1);
      const held = aft < 0 && on > 0.8; if (i) fWant.L = held ? FP.fist : aft >= 0 && aft < 0.35 ? FP.open : FP.relax; else fWant.R = held ? FP.fist : aft >= 0 && aft < 0.35 ? FP.open : FP.relax; }
  }
  // ---------- her magic: the gem (H9) and Silverglass (H6), with their light (I2, I3, I4, I6) ----------
  // Small pictures of light, drawn once: a soft round glow, a star with four long rays, a thin ring, and the pane of glass.
  const cvTex = (n, draw) => { const c = document.createElement('canvas'); c.width = c.height = n; draw(c.getContext('2d'), n); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; };
  const TXG = cvTex(128, (g, n) => { const r = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.55)'); r.addColorStop(0.6, 'rgba(255,255,255,0.12)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, n, n); });
  const TXS = cvTex(256, (g, n) => { for (const [sx, sy] of [[1, 0.035], [0.035, 1], [0.16, 0.16]]) { g.save(); g.translate(n / 2, n / 2); g.scale(sx, sy); const r = g.createRadialGradient(0, 0, 0, 0, 0, n / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); g.arc(0, 0, n / 2, 0, TAU); g.fill(); g.restore(); } });
  const TXR = cvTex(256, (g, n) => { g.strokeStyle = 'rgba(255,255,255,1)'; g.shadowColor = 'rgba(255,255,255,1)'; g.shadowBlur = n * 0.03; g.lineWidth = n * 0.012; g.beginPath(); g.arc(n / 2, n / 2, n * 0.42, 0, TAU); g.stroke(); g.stroke(); });
  // The pane (I2): a round window of thin petal-shaped facets, made of circles laid over one another, with a crescent moon at its centre
  const TXP = cvTex(768, (g, n) => { const c = n / 2, R = n * 0.455; g.globalCompositeOperation = 'lighter'; g.save(); g.beginPath(); g.arc(c, c, R, 0, TAU); g.clip();
    for (const [k, q, rr] of [[12, 0.5, 0.5], [12, 0.75, 0.25], [6, 0.5, 0.25]]) for (let i = 0; i < k; i++) { const a = (i / k) * TAU + (rr < 0.3 ? 0.26 : 0), x = c + R * q * Math.cos(a), y = c + R * q * Math.sin(a);
      g.beginPath(); g.arc(x, y, R * rr, 0, TAU); g.fillStyle = i % 3 ? 'rgba(60,110,255,0.055)' : 'rgba(120,90,240,0.065)'; g.fill(); g.strokeStyle = 'rgba(205,228,255,0.50)'; g.lineWidth = n * 0.0032; g.shadowColor = 'rgba(150,190,255,0.9)'; g.shadowBlur = n * 0.008; g.stroke(); }
    g.restore(); g.shadowColor = 'rgba(160,200,255,1)'; g.shadowBlur = n * 0.02; g.strokeStyle = 'rgba(235,245,255,0.95)'; g.lineWidth = n * 0.008; g.beginPath(); g.arc(c, c, R, 0, TAU); g.stroke(); g.stroke();
    g.globalCompositeOperation = 'destination-out'; g.shadowBlur = 0; g.fillStyle = 'rgba(0,0,0,0.85)'; g.beginPath(); g.arc(c, c, R * 0.235, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter'; g.save(); g.beginPath(); g.arc(c - R * 0.02, c, R * 0.20, 0, TAU); g.clip(); g.beginPath(); g.rect(0, 0, n, n); g.arc(c + R * 0.075, c - R * 0.03, R * 0.175, 0, TAU, true); g.fillStyle = 'rgba(232,242,255,0.96)'; g.fill('evenodd'); g.restore(); });
  const sprite = (tex, hex) => { const sp = new THREE.Sprite(glowOnly(new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(hex), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false }))); sp.visible = false; sp.renderOrder = 8; FX.add(sp); return sp; };
  const setSprite = (sp, p, size, op) => { sp.visible = op > 0.004 && size > 1e-4; if (!sp.visible) return; sp.position.copy(p); sp.scale.set(size, size, 1); sp.material.opacity = op; };
  const rndK = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };       // the same scatter every time
  const MG = { gGlow: sprite(TXG, '#9fd0ff'), gStar: sprite(TXS, '#eaf4ff'), gRing: sprite(TXR, '#a8d4ff'), flash: sprite(TXG, '#cfe4ff'), sparks: [], rim: [], shards: [] };
  for (let i = 0; i < 18; i++) MG.sparks.push(sprite(i % 3 ? TXS : TXG, i % 2 ? '#cfe4ff' : '#f4f9ff'));
  for (let i = 0; i < 12; i++) MG.rim.push(sprite(TXS, '#dcebff'));
  MG.pane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowOnly(new THREE.MeshBasicMaterial({ map: TXP, color: new THREE.Color('#ffffff'), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide })));
  MG.pane.frustumCulled = false; MG.pane.visible = false; MG.pane.renderOrder = 7; FX.add(MG.pane);
  // shards (I3): long diamonds, thin slivers and crescents
  { const flatG = (pts, tris) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(tris); return g; };
    const dia = (w) => flatG([0, 1, 0, w, 0, 0, 0, -1, 0, -w, 0, 0], [0, 3, 1, 1, 3, 2]), cres = (() => { const p = [], ix = [], n = 10; for (let i = 0; i <= n; i++) { const a = lerp(-1.25, 1.25, i / n), k = Math.cos(a / 1.25 * PI / 2); p.push(Math.cos(a) - 0.55, Math.sin(a), 0, Math.cos(a) - 0.55 - 0.42 * k, Math.sin(a), 0); } for (let i = 0; i < n; i++) { const a = i * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } return flatG(p, ix); })();
    const GS = [dia(0.34), cres, dia(0.15)]; for (let i = 0; i < 20; i++) MG.shards.push(lightMesh(GS[i % 3], i % 4 === 0 ? '#eaf2ff' : i % 2 ? '#a9c8ff' : '#b9b0ff')); }
  const magicOff = () => { for (const k of ['gGlow', 'gStar', 'gRing', 'flash']) MG[k].visible = false; for (const a of [MG.sparks, MG.rim, MG.shards]) for (const m of a) m.visible = false; MG.pane.visible = false; if (meshes.veins) meshes.veins.visible = false; MATS.gem.emissiveIntensity = 0; MATS.lens.emissiveIntensity = 0; };
  MATS.gem.emissive = lin('#7fc4ff'); MATS.gem.emissiveIntensity = 0; MATS.lens.emissive = lin('#9fc8ff'); MATS.lens.emissiveIntensity = 0; if (meshes.veins) { meshes.veins.visible = false; meshes.veins.castShadow = false; meshes.veins.renderOrder = 7; }
  // The hover: a round of pale light on the ground under her that turns slowly, a soft glow at her gem, and a few sparks that hang round her.
  const HV = { p: V3(), g: V3(), s: V3(), q: Qn(), q2: Qn() };
  function hoverLight() { const a = PE.hover; if (a <= 0.01) return; inRoot(); rp(SK.hips, HV.p); rpt(SK.head, GEMP, HV.g);
    MG.pane.visible = true; MG.pane.position.set(HV.p.x, 0.014, HV.p.z + 0.14); MG.pane.quaternion.copy(HV.q.setFromAxisAngle(XAX, -PI / 2)).multiply(HV.q2.setFromAxisAngle(ZAX, clock * 0.22)); MG.pane.scale.setScalar(0.5 + 0.55 * a); MG.pane.material.opacity = 0.50 * a;
    setSprite(MG.gGlow, HV.g, 0.15 + 0.02 * Math.sin(clock * 1.5), 0.55 * a); MATS.gem.emissiveIntensity = 0.9 * a;
    for (let i = 0; i < 10; i++) { const an = i * TAU / 10 + clock * 0.22 + 2 * rndK(i, 1), r = 0.40 + 0.16 * rndK(i, 2); HV.s.set(HV.p.x + r * Math.cos(an), HV.p.y - 0.12 + 0.75 * rndK(i, 3) + 0.035 * Math.sin(clock * 1.3 + i), HV.p.z + 0.12 + r * Math.sin(an)); setSprite(MG.sparks[i], HV.s, 0.022 + 0.022 * rndK(i, 4), a * (0.35 + 0.45 * (0.5 + 0.5 * Math.sin(clock * 2.1 + i * 1.7)))); } }
  // While she looses the gem's two shots her gem and the light on her arms stay lit, and the gem flares as each arrow goes.
  function gemGlow(Tb, ck) { inRoot(); rpt(SK.head, GEMP, HV.g); const k = lerp(0.70, 1, sm(0, 0.4, Tb)) * (1 - sm(TR2 + 0.25, TR2 + 1.2, Tb)), fl = ck.loosed ? Math.exp(-ck.aft / 0.18) : 0;
    setSprite(MG.gGlow, HV.g, 0.07 + 0.07 * k + 0.14 * fl, 0.45 * k + 0.4 * fl); setSprite(MG.gStar, HV.g, 0.16 + 0.42 * fl + 0.05 * k * Math.sin(Tb * 9), Math.max(fl, 0.35 * k)); MATS.gem.emissiveIntensity = 2.2 * k + 1.5 * fl; MATS.lens.emissiveIntensity = 0.55 * k;
    if (meshes.veins) { meshes.veins.visible = k > 0.01; MATS.veins.opacity = k; MATS.veins.map.offset.y = 0; } }
  const GEMP = (() => { const O = bandPt(0, bandPh(0), 0.0036); return V3(O[0], O[1], O[2] + 0.012); })();       // just in front of the gem on her headband (it rides on her head)
  const MW = { gw: V3(), F: V3(), P: V3(), W: V3(), qG: Qn(), qH: Qn(), fk: V3(), qfk: Qn(), hint: V3(), sh: V3(), n: V3(), side: V3(), C: V3(), v: V3(), palm: V3(), ft: V3(), qf: Qn(), q: Qn(), q2: Qn() };
  // The gem, in its own seconds: her right hand rises and two fingers touch the gem (0.45); it flares, a ring of light opens from it, and
  // light runs down both her arms to her knuckles (to 1.05). For one breath (0.55 to 1.15) everything hangs still: sparks in the air
  // round her, her sleeves, hair and charms. Then it all lets go at once, her eyes open and her hand comes down. Her arms stay lit a while.
  const GMB = {}; let stillK = 0, gemWas = 9;
  const gemBeats = (T, o) => { o.T = T; o.up = sm(0.05, 0.45, T) * (1 - sm(1.20, 1.65, T)); o.touch = sm(0.42, 0.50, T); o.run = sm(0.46, 1.05, T); o.still = sm(0.55, 0.66, T) * (1 - sm(1.15, 1.19, T)); o.lit = o.touch * (1 - sm(1.35, 2.45, T)); o.eyes = sm(0.30, 0.42, T) * (1 - sm(1.18, 1.30, T)); o.burst = sm(1.15, 1.55, T); return o; };
  function gemStage(T) {
    if (T < 0) { gemWas = 9; return false; }
    inRoot(); const o = gemBeats(T, GMB); rpt(SK.head, GEMP, MW.gw);
    // her right hand: first two fingers straight, the others folded, their tips on the gem
    if (o.up > 0) { MW.F.set(0.50, 0.80, -0.35).normalize(); MW.P.set(-0.10, -0.35, -0.93); MW.W.copy(MW.gw).addScaledVector(MW.F, -0.150).addScaledVector(MW.P.normalize(), -0.004); handQ('R', MW.F, MW.P, MW.qG);
      rp(SK.handR, MW.fk); rq(SK.handR, MW.qfk); MW.W.lerp(MW.fk, 1 - o.up); { const arc = 4 * o.up * (1 - o.up); MW.W.z += 0.10 * arc; MW.W.x -= 0.05 * arc; } MW.qH.copy(MW.qfk).slerp(MW.qG, o.up);
      const miss = reach('R', MW.W, MW.qH, MW.hint.set(-0.8, -0.3, 0.5), sm(0, 0.25, o.up)); if (miss > D.missR) D.missR = miss; }
    fWant.R = o.up > 0.5 ? FP.two : FP.relax;
    // the gem's light (I6): a soft glow, a star with four rays when she touches it, a ring that opens and fades
    const since = Math.max(0, T - 0.46), flare = o.touch * Math.exp(-since / 0.28), ru = cl(since / 0.55, 0, 1);
    setSprite(MG.gGlow, MW.gw, 0.07 + 0.07 * o.lit + 0.14 * flare, 0.45 * o.lit + 0.4 * flare); setSprite(MG.gStar, MW.gw, 0.16 + 0.42 * flare + 0.05 * o.lit * Math.sin(T * 9), Math.max(flare, 0.35 * o.lit));
    setSprite(MG.gRing, MW.gw, 0.05 + 0.85 * ru, o.touch * Math.pow(1 - ru, 1.6)); MATS.gem.emissiveIntensity = 2.2 * o.lit; MATS.lens.emissiveIntensity = 0.55 * o.lit;
    // the light down her arms: the picture slides so the lit part grows from her shoulders to her knuckles
    if (meshes.veins) { meshes.veins.visible = o.lit > 0.01; MATS.veins.opacity = o.lit; MATS.veins.map.offset.y = 0.5 * (1 - o.run); }
    // the moment: sparks hang where they are, then drift up and out and fade
    for (let i = 0; i < MG.sparks.length; i++) { const a = rndK(i, 1) * TAU, r = 0.28 + 0.42 * rndK(i, 2), y = 0.35 + 1.45 * rndK(i, 3), on = sm(0.52 + 0.1 * rndK(i, 4), 0.66 + 0.1 * rndK(i, 4), T) * (1 - sm(0.1, 1, o.burst));
      MW.v.set(Math.cos(a) * r * (1 + 0.5 * o.burst), y + 0.22 * o.burst * o.burst, 0.10 + Math.sin(a) * r * 0.55 * (1 + 0.5 * o.burst)); setSprite(MG.sparks[i], MW.v, (0.035 + 0.06 * rndK(i, 5)) * (i % 3 ? 1.5 : 0.6), on * (0.55 + 0.45 * rndK(i, 6))); }
    if (gemWas < 1.17 && T >= 1.17 && gearKick) gearKick(); gemWas = T;       // everything lets go at once
    return true;
  }
  // Silverglass, in its own seconds: she hops her feet wide and draws her left hand back (to 0.36), pushes her palm out flat toward screen
  // right and a little toward us (0.36 to 0.60), and the pane opens in front of it (0.52 to 0.92): a round window of glass a metre
  // across, with loose shards floating at its rim. She holds it (to 1.90), then it breaks into shards that scatter and fade.
  const GLB = {}, PN = V3(0.80, 0, 0.60).normalize(), PSIDE = V3(0.60, 0, -0.80), PQ = Qn().setFromUnitVectors(ZAX, PN);
  const glassBeats = (T, o) => { o.T = T; o.st = sm(0.05, 0.36, T) * (1 - sm(2.15, 2.55, T)); o.hop = Math.sin(PI * sm(0.05, 0.36, T)) + Math.sin(PI * sm(2.15, 2.55, T)); o.back = sm(0.10, 0.34, T) * (1 - sm(0.36, 0.56, T)); o.push = sm(0.36, 0.60, T) * (1 - sm(2.02, 2.40, T));
    o.arms = sm(0.08, 0.36, T) * (1 - sm(2.05, 2.50, T)); o.form = sm(0.52, 0.92, T); o.brk = sm(1.90, 2.00, T); return o; };
  function glassStage(T) {
    if (T < 0) return false;
    inRoot(); const o = glassBeats(T, GLB), kLeg = sm(0, 0.2, o.st);
    if (kLeg > 0) for (const [Sd] of SIDES) { const lead = Sd === 'L', yaw = (lead ? 35 : -8) * DEG * o.st; MW.ft.set(lead ? 0.25 : -0.24, FOOT_Y, lead ? 0.04 : -0.03).lerp(SK['foot' + Sd].userData.rest, 1 - o.st); MW.ft.y = FOOT_Y + 0.05 * o.hop;
      const miss = plant(Sd, MW.ft, MW.qf.setFromAxisAngle(YAX, yaw), MW.hint.set(Math.sin(yaw), 0.25, Math.cos(yaw)), kLeg); if (miss > D.missLeg) D.missLeg = miss; }
    // her left palm, flat, fingers up, pushed out along the way the pane faces; her right hand raised open behind it
    rp(SK.uarmL, MW.sh); MW.F.set(0.06, 1, 0).normalize(); MW.P.copy(PN); MW.W.copy(MW.sh).addScaledVector(PN, 0.20 - 0.08 * o.back + 0.235 * o.push); MW.W.y += 0.04; handQ('L', MW.F, MW.P, MW.qG); MW.palm.copy(MW.W).addScaledVector(MW.F, 0.085);
    rp(SK.handL, MW.fk); rq(SK.handL, MW.qfk); MW.W.lerp(MW.fk, 1 - o.arms); MW.qH.copy(MW.qfk).slerp(MW.qG, o.arms); { const miss = reach('L', MW.W, MW.qH, MW.hint.set(0.3, -1, -0.4), sm(0, 0.25, o.arms)); if (miss > D.missL) D.missL = miss; }
    rp(SK.uarmR, MW.sh); MW.F.set(0.25, 0.95, 0.10).normalize(); MW.P.copy(PN); MW.W.copy(MW.sh).add(MW.v.set(0.17, 0.02 + 0.03 * o.push, 0.24)); handQ('R', MW.F, MW.P, MW.qG);
    rp(SK.handR, MW.fk); rq(SK.handR, MW.qfk); MW.W.lerp(MW.fk, 1 - o.arms); { const arc = 4 * o.arms * (1 - o.arms); MW.W.z += 0.08 * arc; } MW.qH.copy(MW.qfk).slerp(MW.qG, o.arms); { const miss = reach('R', MW.W, MW.qH, MW.hint.set(-0.7, -0.7, 0.2), sm(0, 0.25, o.arms)); if (miss > D.missR) D.missR = miss; }
    fWant.L = o.arms > 0.5 ? FP.flat : FP.relax; fWant.R = o.arms > 0.5 ? FP.soft : FP.relax;
    // the pane: in front of her palm, its centre a little below and beyond it
    const R = 0.50, grow = o.form < 1 ? o.form * (1 + 0.35 * Math.sin(PI * o.form) * (1 - o.form)) : 1, alive = o.form * (1 - o.brk);
    MW.C.copy(MW.palm).addScaledVector(PN, 0.07).addScaledVector(PSIDE, 0.10); MW.C.y -= 0.13;
    MG.pane.visible = alive > 0.01; if (MG.pane.visible) { MG.pane.position.copy(MW.C); MG.pane.quaternion.copy(PQ).multiply(MW.q2.setFromAxisAngle(ZAX, 0.9 * (1 - o.form) + 0.05 * Math.sin(T * 1.7))); MG.pane.scale.setScalar(2 * R / 0.91 * Math.max(0.02, grow)); MG.pane.material.opacity = alive * (0.86 + 0.14 * Math.sin(T * 13)); }
    const fl = Math.sin(PI * sm(1.86, 2.12, T)) + 0.6 * Math.sin(PI * sm(0.50, 0.80, T)); setSprite(MG.flash, MW.C, 0.5 + 0.9 * fl, 0.55 * fl);
    for (let i = 0; i < MG.rim.length; i++) { const a = (i / MG.rim.length) * TAU + T * 0.5, tw = 0.5 + 0.5 * Math.sin(T * (17 + i * 2.3) + i), on = sm(0.50, 0.70, T) * (1 - o.brk) * tw; MW.v.copy(MW.C).addScaledVector(PSIDE, Math.cos(a) * R * grow).addScaledVector(YAX, Math.sin(a) * R * grow); setSprite(MG.rim[i], MW.v, 0.03 + 0.05 * tw, on); }
    // shards: six float at the rim while the pane stands; when it breaks, all of them fly out from where the glass was, turn, slow and fade
    const e = T < 1.92 ? 0 : 1 - Math.exp(-(T - 1.92) / 0.30), gone = 1 - sm(2.25, 2.95, T);
    for (let i = 0; i < MG.shards.length; i++) { const m = MG.shards[i], loose = i < 6, a = rndK(i, 7) * TAU, r0 = loose ? R * (1.08 + 0.12 * rndK(i, 8)) : R * Math.sqrt(0.08 + 0.9 * rndK(i, 8)), op = (loose ? sm(0.62, 0.95, T) : o.brk) * gone * (0.30 + 0.35 * rndK(i, 9));
      m.visible = op > 0.01; if (!m.visible) continue; const rr = r0 * (1 + 0.85 * e * (0.5 + rndK(i, 10))), bob = loose ? 0.02 * Math.sin(T * 2.1 + i) * (1 - o.brk) : 0, sz = (loose ? 0.045 : 0.035) + 0.06 * rndK(i, 11);
      m.position.copy(MW.C).addScaledVector(PSIDE, Math.cos(a) * rr).addScaledVector(YAX, Math.sin(a) * rr + bob - 0.22 * e * e).addScaledVector(PN, (rndK(i, 12) - 0.35) * 0.45 * e + (loose ? 0.02 : 0));
      m.quaternion.copy(PQ).multiply(MW.q2.setFromAxisAngle(MW.v.set(rndK(i, 13) - 0.5, rndK(i, 14) - 0.5, 0.6).normalize(), a + T * (loose ? 0.6 : 0.3) + 5 * e * (rndK(i, 15) - 0.5))); m.scale.setScalar(sz); m.material.opacity = op; }
    return true;
  }
  // ---------- nothing passes through anything: her hands and forearms are kept out of her bags and her legs ----------
  // Each thing to keep out of is a simple shape that rides on a bone. A thigh or a shin is a rod with round ends, thicker at one end.
  // A bag is a dome on her hip: an egg shape whose middle is 5 cm inside her, a little wider and taller than the bag and as deep,
  // so an arm swinging by slides up over its face and down again without a jump. Each hand is six balls (wrist, palm, knuckles, fingers) and
  // its forearm two more. After everything else has placed her arms, any ball found inside a shape is pushed out the short way, her
  // wrist is moved by the worst push, and her arm is worked out again; a few rounds settle it. Moves that hold a weapon place her
  // hands exactly, so there a hand is only moved while it holds nothing (CLR.free eases between the two). D.clip is the deepest a
  // ball was this frame before the fix (metres), D.clipAt which hand and shape, D.clipLeg the deepest into a leg, D.clipLeft what was
  // left after the fix. D.clearOff = true turns the fix off. "Stand still" is left as posed, to compare with the paintings.
  const CLR = { balls: {}, rods: [], bags: [], free: { R: 1, L: 1 }, hit: '', n: V3(), p: V3(), q: V3(), c: V3(), ab: V3(), l: V3(), push: V3(), best: V3(), W: V3(), E: V3(), S0: V3(), hint: V3(), qH: Qn() };
  for (const [S, s] of SIDES) { const H = SK['hand' + S], Fa = SK['farm' + S], fr = Fa.userData.rest, hr = H.userData.rest;
    CLR.balls[S] = [[H, handPt(s, 0, 0, 0), 0.021], [H, handPt(s, 0, -0.045, 0.020), 0.017], [H, handPt(s, 0, -0.045, -0.020), 0.017], [H, handPt(s, 0, -0.088, 0.020), 0.014], [H, handPt(s, 0, -0.088, -0.022), 0.014], [H, handPt(s, 0, -0.125, 0), 0.011],
      [Fa, fr.clone().lerp(hr, 0.55), 0.030], [Fa, fr.clone().lerp(hr, 0.80), 0.026]]; }
  { const rad = (y) => { const p = prof(R_LEG, y, true); return Math.max(p[0], (p[1] + p[2]) / 2); };
    for (const [S] of SIDES) { CLR.rods.push({ name: 'thigh' + S, A: SK['thigh' + S], B: SK['shin' + S], rA: rad(0.775), rB: rad(0.525), a: V3(), b: V3() }); CLR.rods.push({ name: 'shin' + S, A: SK['shin' + S], B: SK['foot' + S], rA: rad(0.50), rB: 0.052, a: V3(), b: V3() }); } }
  for (const bn in BAGBOX) if (SK[bn]) { const B = BAGBOX[bn]; CLR.bags.push(Object.assign({ name: bn, bone: SK[bn], rest: SK[bn].userData.rest, bp: V3(), qn: Qn(), qi: Qn(), C: B.O.clone().addScaledVector(B.ey, (B.drop - B.H) / 2).addScaledVector(B.ez, -0.05), a: B.W / 2 + 0.05, b: (B.H + B.drop) / 2 + 0.03, c: B.D + 0.05 }, B)); }
  const legRod = (S) => CLR.rods.find((R) => R.name === 'thigh' + S);
  // The way out of a shape is straight through its skin when a ball is only just inside. The deeper it is, the more the way out leans
  // toward one fixed side (out from her hip for a bag; out to that hand's own side and up for a leg), so a ball that goes right
  // through the middle is still carried out the same side and never flips across.
  function clrPush(p, r, out, legsOnly, s) { let dep = 0; out.set(0, 0, 0);
    for (const R of CLR.rods) { const ab = CLR.ab.copy(R.b).sub(R.a), L2 = ab.lengthSq(), t = cl(CLR.q.copy(p).sub(R.a).dot(ab) / L2, 0, 1), c = CLR.c.copy(R.a).addScaledVector(ab, t), rr = lerp(R.rA, R.rB, t) + r, v = CLR.q.copy(p).sub(c), d0 = v.length(); if (d0 >= rr) continue;
      const k = 1 - d0 / rr, pref = CLR.n.set(s * 0.6, 0.8, 0.15); pref.addScaledVector(ab, -pref.dot(ab) / L2).normalize(); if (d0 > 1e-6) pref.multiplyScalar(k).addScaledVector(v, (1 - k) / d0).normalize();
      const b = v.dot(pref), d = -b + Math.sqrt(Math.max(0, b * b - (d0 * d0 - rr * rr))); if (d > dep) { dep = d; out.copy(pref).multiplyScalar(d); CLR.hit = R.name; } }
    if (!legsOnly) for (const B of CLR.bags) { const l = CLR.l.copy(p).sub(B.bp).applyQuaternion(B.qi).add(B.rest).sub(B.C), a = B.a + r, b = B.b + r, c = B.c + r, x = l.dot(B.ex), y = l.dot(B.ey), z = l.dot(B.ez), F = x * x / (a * a) + y * y / (b * b) + z * z / (c * c); if (F >= 1) continue;
      let ux = x / (a * a), uy = y / (b * b), uz = z / (c * c); const g = Math.hypot(ux, uy, uz), k = 1 - Math.sqrt(F); if (g > 1e-6) { ux *= (1 - k) / g; uy *= (1 - k) / g; uz = uz * (1 - k) / g + k; } else { ux = uy = 0; uz = 1; } const gn = Math.hypot(ux, uy, uz); ux /= gn; uy /= gn; uz /= gn;
      const qa = ux * ux / (a * a) + uy * uy / (b * b) + uz * uz / (c * c), qb = 2 * (x * ux / (a * a) + y * uy / (b * b) + z * uz / (c * c)), d = (-qb + Math.sqrt(Math.max(0, qb * qb - 4 * qa * (F - 1)))) / (2 * qa);
      if (d > dep) { dep = d; out.set(0, 0, 0).addScaledVector(B.ex, ux).addScaledVector(B.ey, uy).addScaledVector(B.ez, uz).applyQuaternion(B.qn).multiplyScalar(d); CLR.hit = B.name; } }
    return dep; }
  function clrDepth(S, legsOnly) { let dep = 0; const s = S === 'R' ? -1 : 1; CLR.best.set(0, 0, 0); for (const [bone, pt, r] of CLR.balls[S]) { rpt(bone, pt, CLR.p); const d = clrPush(CLR.p, r, CLR.push, legsOnly, s); if (d > dep) { dep = d; CLR.best.copy(CLR.push); CLR.at = CLR.hit; } } return dep; }
  const HOLDS = [FP.hook, FP.hold, FP.grip, FP.fist];
  function clearHands(N, dt, snap) { D.clip = 0; D.clipLeft = 0; D.clipLeg = 0; D.clipAt = ''; inRoot(); const weapon = /^(draw|sword|knives)$/.test(N);
    for (const R of CLR.rods) { rp(R.A, R.a); rp(R.B, R.b); } for (const B of CLR.bags) { rp(B.bone, B.bp); rq(B.bone, B.qn); B.qi.copy(B.qn).invert(); }
    for (const [S] of SIDES) { const want = weapon && HOLDS.includes(fWant[S]) ? 0 : 1; CLR.free[S] = snap ? want : CLR.free[S] + (want - CLR.free[S]) * Math.min(1, dt * 7);
      const leg = clrDepth(S, true); if (leg > D.clipLeg) D.clipLeg = leg; let dep = clrDepth(S); if (dep > D.clip) { D.clip = dep; D.clipAt = S + ' ' + CLR.at; } const kf = D.clearOff ? 0 : sm(0, 0.006, dep) * CLR.free[S];
      for (let it = 0; it < 4 && dep > 0.0008 && kf > 0.001; it++) { rp(SK['hand' + S], CLR.W); rq(SK['hand' + S], CLR.qH); rp(SK['farm' + S], CLR.E); rp(SK['uarm' + S], CLR.S0); CLR.hint.copy(CLR.E).sub(CLR.S0.lerp(CLR.W, 0.5)); CLR.W.add(CLR.best);
        reach(S, CLR.W, CLR.qH, CLR.hint, kf); inRoot(); dep = clrDepth(S); }
      if (dep > D.clipLeft) D.clipLeft = dep; } }
  // ---------- postures she holds, and her short fight moves and emotes ----------
  // Postures (kneel, squat, sit, hover, down) each have a weight that eases to 1 while that posture is chosen and back to 0 when it is
  // not, so she slides in and out of them and from one to another. A posture is a place for her hips (set in animate), a place and
  // turn for each foot, and somewhere for each hand to rest. Her legs and arms are then worked out from those, as in the weapon moves.
  // Each foot: [x, y, z, turn out (degrees), toes down (degrees), then the way her knee points]. The hover's feet are measured from
  // her hips, and follow her shins.
  const PW = { kneel: 0, squat: 0, sit: 0, hover: 0, down: 0 }, PE = { kneel: 0, squat: 0, sit: 0, hover: 0, down: 0, all: 0 };
  const PST = { kneel: { R: [-0.09, 0.075, -0.40, 0, 165, 0, -1, 0.3], L: [0.10, FOOT_Y, 0.36, 5, 0, 0.1, 0.5, 1] },
    squat: { R: [-0.15, FOOT_Y, 0.0, -22, 0, -0.45, 0.3, 1], L: [0.15, FOOT_Y, 0.0, 22, 0, 0.45, 0.3, 1] },
    sit: { R: [-0.18, 0.075, 0.66, -15, -70, -0.2, 1, 0.3], L: [0.13, FOOT_Y, 0.37, 8, 0, 0.15, 1, 0.5] },
    hover: { R: [0.13, -0.08, 0.36, 0, 0, -1, -0.25, 0.35], L: [-0.11, -0.10, 0.30, 0, 0, 1, -0.25, 0.35] },
    down: { R: [-0.10, 0.075, -0.205, 0, 170, -0.15, -0.6, 1], L: [0.10, 0.075, -0.205, 0, 170, 0.15, -0.6, 1] } };
  const OS = { R: V3(), L: V3(), yawR: 0, yawL: 0, plant: 0 };       // what a short move asks of her feet: how far each is from its resting spot, its turn, and how firmly both are planted
  const EW = { hv: V3(), ft: V3(), hint: V3(), q: Qn(), qk: Qn(), qx: Qn(), qy: Qn(), qfol: Qn(), W: V3(), fk: V3(), qfk: Qn(), kn: V3(), v: V3(), sh: V3(), F: V3(), P: V3(), qG: Qn(), qH: Qn(), hp: V3() };
  const hardBeats = (T, o) => { o.j = sm(0, 0.08, T) * (1 - sm(0.15, 0.6, T)); o.back = sm(0.04, 0.46, T) * (1 - sm(1.18, 1.68, T)); o.fold = sm(0.05, 0.30, T) * (1 - sm(0.85, 1.25, T)); o.sR = sm(0.05, 0.26, T); o.sL = sm(0.24, 0.46, T); o.rL = sm(1.18, 1.44, T); o.rR = sm(1.40, 1.66, T); return o; }, HDB = {};
  function emoteStage(N, T) {
    const a = PE, any = a.all > 0.001 || OS.plant > 0.001; if (!any && !/^(hard|win|bow|wave)$/.test(N)) return;
    inRoot();
    // --- her feet
    if (any) { rp(SK.hips, EW.hp);
      for (const [Sd] of SIDES) { const rest = SK['foot' + Sd].userData.rest, off = OS[Sd]; EW.ft.copy(rest).multiplyScalar(1 - a.all); EW.hint.set(0, 0.25, 1).multiplyScalar(1 - a.all); EW.q.identity(); let wAcc = 0;
        for (const k in PST) { const w = a[k]; if (w <= 0) continue; const f = PST[k][Sd]; if (k === 'hover') EW.ft.x += w * (EW.hp.x + f[0]), EW.ft.y += w * (EW.hp.y + f[1]), EW.ft.z += w * (EW.hp.z + f[2]); else EW.ft.x += w * f[0], EW.ft.y += w * f[1], EW.ft.z += w * f[2];
          EW.hint.x += w * f[5]; EW.hint.y += w * f[6]; EW.hint.z += w * f[7];
          if (k !== 'hover') { EW.qk.copy(EW.qy.setFromAxisAngle(YAX, f[3] * DEG)).multiply(EW.qx.setFromAxisAngle(XAX, f[4] * DEG)); wAcc += w; EW.q.slerp(EW.qk, w / wAcc); } }
        EW.q.copy(EW.qk.identity().slerp(EW.q, Math.min(1, wAcc))); EW.ft.add(off); if (Sd === 'R' ? OS.yawR : OS.yawL) EW.q.premultiply(EW.qy.setFromAxisAngle(YAX, Sd === 'R' ? OS.yawR : OS.yawL));
        const kL = Math.max(sm(0, 0.15, a.all), OS.plant);
        if (a.hover > 0.001) { plant(Sd, EW.ft, null, EW.hint, 1); rq(SK['foot' + Sd], EW.qfol); EW.q.slerp(EW.qfol, a.hover / Math.max(a.all, 1e-4)); }       // floating, her feet go where her shins point
        const miss = plant(Sd, EW.ft, EW.q, EW.hint, kL); if (miss > D.missLeg) D.missLeg = miss; } }
    // --- her hands in a posture: on a knee, on her thigh, or limp on the ground
    if (a.all > 0.001) for (const [Sd, s] of SIDES) { rp(SK['hand' + Sd], EW.fk); rp(SK['shin' + Sd], EW.kn); let w = 0, ay = 0.05, az = 0.06; EW.W.set(0, 0, 0);
      const onKnee = a.squat + (Sd === 'L' ? a.kneel + a.sit : 0); if (onKnee > 0) { EW.W.addScaledVector(EW.v.copy(EW.kn).add(EW.sh.set(-s * 0.01, 0.048, 0.04)), onKnee); w += onKnee; }
      if (a.hover > 0) { const R = legRod(Sd), A = ARM[Sd]; rp(SK['thigh' + Sd], EW.v); EW.F.copy(EW.kn).sub(EW.v); const Lt = EW.F.length(); EW.F.multiplyScalar(1 / Lt); EW.P.set(0, 1, 0).addScaledVector(EW.F, -EW.F.y).normalize(); rp(SK['uarm' + Sd], EW.sh);       // floating, the backs of her hands rest on her thighs just above her knees, palms up
        let t = 0.82; for (let i = 0; i < 9; i++) { EW.hv.copy(EW.v).addScaledVector(EW.F, Lt * t).addScaledVector(EW.P, lerp(R.rA, R.rB, t) + 0.024); if (EW.hv.distanceTo(EW.sh) < A.l1 + A.l2 - 0.012) break; t -= 0.05; }
        EW.W.addScaledVector(EW.hv, a.hover); w += a.hover; EW.F.y -= 0.10; handQ(Sd, EW.F.normalize(), EW.P, EW.qG); }
      if (Sd === 'R' && a.sit > 0) { rp(SK.shinL, EW.v).lerp(rp(SK.footL, EW.hv), 0.22); EW.v.z += 0.062; EW.v.x -= 0.035; EW.W.addScaledVector(EW.v, a.sit); w += a.sit; ay += 0.27 * a.sit; az += 0.12 * a.sit; }       // sitting, her right hand comes across to the shin of her raised knee
      if (a.down > 0) { EW.W.addScaledVector(EW.v.set(s * 0.21, 0.150, SK.hips.position.z + 0.31), a.down); w += a.down; }
      if (w > 0.001) { const wc = Math.min(1, w), bell = 4 * wc * (1 - wc); EW.W.multiplyScalar(1 / w).lerp(EW.fk, 1 - wc); EW.W.x += s * 0.07 * bell; EW.W.y += ay * bell; EW.W.z += az * bell; let q = null; /* on its way to its resting place a hand goes round, not through: a small arc out, up and forward */ if (a.hover > 0.001) { rq(SK['hand' + Sd], EW.qfk); q = EW.qH.copy(EW.qfk).slerp(EW.qG, sm(0.15, 0.85, a.hover)); } const miss = reach(Sd, EW.W, q, EW.hint.set(s * 0.8, -0.5, -0.4), sm(0, 0.12, w)); if (Sd === 'L') { if (miss > D.missL) D.missL = miss; } else if (miss > D.missR) D.missR = miss; }
      if (a.hover > 0.5) fWant[Sd] = FP.mudra; }
    // --- her hands in the short moves
    const hand = (Sd, W, w, hint, F, P) => { if (w <= 0.001) return; const bell = 4 * w * (1 - w); rp(SK['hand' + Sd], EW.fk); EW.W.copy(W).lerp(EW.fk, 1 - w); EW.W.x += (Sd === 'R' ? -1 : 1) * 0.05 * bell; EW.W.z += 0.13 * bell; /* out and forward on the way, round her hip and bag */ let q = null; if (F) { rq(SK['hand' + Sd], EW.qfk); handQ(Sd, F, P, EW.qG); q = EW.qH.copy(EW.qfk).slerp(EW.qG, w); }
      const miss = reach(Sd, EW.W, q, hint, sm(0, 0.25, w)); if (Sd === 'L') { if (miss > D.missL) D.missL = miss; } else if (miss > D.missR) D.missR = miss; };
    if (N === 'hard') { const o = hardBeats(T, HDB); rpt(SK.spine1, EW.v.set(0.03, 1.06, 0.135), EW.kn); hand('R', EW.kn, o.fold, EW.hint.set(-0.9, -0.5, 0.1), EW.F.set(0.9, -0.2, 0.3).normalize(), EW.P.set(0, 0, -1)); if (o.fold > 0.5) fWant.R = FP.soft; }
    if (N === 'win') { const p = sm(1.0, 1.35, T) * (1 - sm(2.5, 2.9, T)), sl = sm(1.42, 1.62, T); rpt(SK.hips, EW.v.set(0.172, 0.975, 0.02), EW.kn); hand('L', EW.kn, p, EW.hint.set(1, -0.2, -0.7));
      rpt(SK.head, EW.v.set(-0.075, 1.580, 0.095), EW.kn); rp(SK.uarmR, EW.sh); EW.sh.x += 0.04; EW.sh.y += 0.34; EW.sh.z += 0.28; EW.kn.lerp(EW.sh, sl);
      EW.F.set(0.50, 0.82, -0.20).lerp(EW.v.set(0.30, 0.70, 0.60), sl).normalize(); EW.P.set(0.25, -0.55, 0.80); EW.W.copy(EW.kn).addScaledVector(EW.F, -0.150); hand('R', EW.W, p, EW.hint.set(-0.9, -0.2, 0.4), EW.F, EW.P); if (p > 0.5) { fWant.R = FP.two; fWant.L = FP.soft; } }
    if (N === 'bow') { const b = sm(0.10, 0.90, T) * (1 - sm(1.50, 2.30, T)); rpt(SK.spine3, EW.v.set(0.035, 1.235, 0.128), EW.kn); EW.F.set(0.85, 0.45, -0.2).normalize(); EW.P.set(0, -0.2, -1); EW.W.copy(EW.kn).addScaledVector(EW.F, -0.085); hand('R', EW.W, b, EW.hint.set(-0.8, -0.6, 0.2), EW.F, EW.P);
      rp(SK.uarmL, EW.sh); EW.sh.x += 0.30; EW.sh.y -= 0.16; EW.sh.z -= 0.14; hand('L', EW.sh, b, EW.hint.set(0.4, -0.3, -1)); if (b > 0.4) { fWant.R = FP.flat; fWant.L = FP.soft; } }
    if (N === 'wave') { const k = sm(0, 0.35, T) * (1 - sm(1.7, 2.1, T)), sw = Math.sin(T * 11), sw2 = Math.sin(T * 11 - 0.7); rpt(SK.hips, EW.v.set(0.172, 0.975, 0.02), EW.kn); hand('L', EW.kn, k, EW.hint.set(1, -0.2, -0.7));
      rp(SK.uarmR, EW.sh); EW.sh.x += -0.20 - 0.12 * sw; EW.sh.y += 0.33 - 0.03 * Math.abs(sw); EW.sh.z += 0.10; EW.F.set(-0.12 - 0.50 * sw2, 1, 0.05).normalize(); EW.P.set(0, 0.05, 1); hand('R', EW.sh, k, EW.hint.set(-0.7, -1, 0.1), EW.F, EW.P); if (k > 0.4) { fWant.R = FP.open; fWant.L = FP.soft; } }
  }
  // Soft things (SOFT): each hangs from its root and its tip is a weight on a spring. It is pulled to where it would rest (its built
  // direction, bent toward straight down), it lags when its root moves, and it cannot swing past a set angle. A sleeve may hang
  // further the more her elbow folds, so her forearm does not pass through it.
  const sv = { a: V3(), b: V3(), c: V3(), q: new THREE.Quaternion() };
  // Sleeves: each is a loop of cloth round her upper arm. Its hem slides across the arm toward the ground until the top of the loop
  // rests on the top of her arm, and away from her forearm when her elbow folds, which also gathers the cloth up toward her
  // shoulder. The slide is held short of the loop's own slack, so her arm stays inside the cloth. It follows on a spring, so it sways.
  const DOWN0 = V3(0, -1, 0), slq = new THREE.Quaternion(), sl1 = V3(), sl2 = V3(), sl3 = V3();
  function sleeveTick(dt, settle) {
    for (const it of SLEEVES) { const U = SK['uarm' + it.S], F = SK['farm' + it.S], H = SK[it.hem], M = SK[it.mid], d = it.d;
      U.getWorldQuaternion(slq); const g = sl1.copy(DOWN0).applyQuaternion(slq.invert()); g.addScaledVector(d, -g.dot(d)).sub(it.g0);
      const fl = sl2.copy(d).applyQuaternion(F.quaternion), c = fl.dot(d), fold = sm(0.35, -0.6, c); fl.addScaledVector(d, -c); const sl = fl.length();
      // A folded elbow gathers the cloth small and close round her upper arm, well short of her forearm; the smaller the loop, the less it may slide.
      // As soon as her elbow bends past a quarter of the way, the cloth is pushed up her arm: shorter (to 35%) and closer (to 55%), so its hem
      // always ends well above her elbow and her forearm has nothing to pass through.
      const up = sm(0.2, -0.7, c), kR = 1 - 0.12 * up, kL = 1 - 0.22 * up, cap = Math.max(0.003, 0.085 * kR - 0.044);
      const tgt = sl3.copy(g).multiplyScalar(0.017); if (sl > 1e-4) tgt.addScaledVector(fl, -0.040 * fold / sl); if (tgt.length() > cap) tgt.setLength(cap);
      if (!it.off || settle) { it.off = tgt.clone(); it.vel = V3(); }
      else { const n = Math.max(1, Math.ceil(dt / 0.012)), st = dt / n; for (let k = 0; k < n; k++) { it.vel.x += ((tgt.x - it.off.x) * 110 - it.vel.x * 7) * st; it.vel.y += ((tgt.y - it.off.y) * 110 - it.vel.y * 7) * st; it.vel.z += ((tgt.z - it.off.z) * 110 - it.vel.z * 7) * st; it.off.addScaledVector(it.vel, st); } if (it.off.length() > cap + 0.003) it.off.setLength(cap + 0.003); }
      H.position.copy(H.userData.home).add(it.off); M.position.copy(M.userData.home).addScaledVector(it.off, 0.5); H.scale.set(kR, kL, kR); M.scale.set(kR, kL, kR); }
  }
  function softTick(dt, settle) {
    sleeveTick(dt, settle);
    for (const it of SOFT) { const P = SK[it.parent], B = SK[it.bone], fx = it.flex ? cl(-SK[it.flex].rotation.x / 2.2, 0, 1) : 0, maxA = it.maxA + 1.15 * fx;
      const root = sv.a.copy(it.root).sub(P.userData.rest).applyMatrix4(P.matrixWorld), rest = sv.b.copy(it.dir).transformDirection(P.matrixWorld);
      const tgt = sv.c.copy(rest); tgt.y -= it.grav + 2.4 * fx; tgt.normalize().multiplyScalar(it.L).add(root);
      if (!it.tip || settle) { it.tip = tgt.clone(); it.vel = V3(); }
      else { const n = Math.max(1, Math.ceil(dt / 0.012)), st = dt / n; for (let k = 0; k < n; k++) { it.vel.x += ((tgt.x - it.tip.x) * it.w2 - it.vel.x * it.c) * st; it.vel.y += ((tgt.y - it.tip.y) * it.w2 - it.vel.y * it.c) * st; it.vel.z += ((tgt.z - it.tip.z) * it.w2 - it.vel.z * it.c) * st; it.tip.addScaledVector(it.vel, st); } }
      const dir = tgt.copy(it.tip).sub(root).normalize(), dt2 = cl(dir.dot(rest), -1, 1), ang = Math.acos(dt2);
      if (ang > maxA) { dir.addScaledVector(rest, -dt2).normalize().multiplyScalar(Math.sin(maxA)).addScaledVector(rest, Math.cos(maxA)); it.vel.multiplyScalar(0.6); }
      it.tip.copy(dir).multiplyScalar(it.L).add(root);
      P.getWorldQuaternion(sv.q); B.quaternion.setFromUnitVectors(it.dir, dir.applyQuaternion(sv.q.invert())); }
  }
  function pose(o) {
    o = o || {}; mv = { name: 'pose', t: 0 }; wk = 0; jg = 0; lastPose = { arm: o.arm == null ? 15 : o.arm, leg: o.leg || 0 }; const arm = lastPose.arm * DEG - A_POSE, leg = lastPose.leg * DEG;
    restAll(); for (const [S, s] of SIDES) { SK['uarm' + S].rotation.z = s * arm; SK['thigh' + S].rotation.z = s * leg; SK['foot' + S].rotation.z = -s * leg; }
    armsAndBow(-1, 0); swordStage(-1, 0, true); knifeStage(-1); magicOff(); stillK = 0; for (const k in PW) PW[k] = PE[k] = 0; PE.all = 0; root.updateMatrixWorld(true);
    if (gearSettle) { gearSettle(); root.updateMatrixWorld(true); }       // the bags come to rest against her in the new pose
    softTick(0, true); root.updateMatrixWorld(true);
  }
  function play(name) { if (name === 'aim') name = 'draw'; if (name === 'down') name = 'fall'; if (!MOVES.includes(name) || name === 'pose') { pose(lastPose); return 'pose'; } mv = { name, t: 0 }; return name; }
  // for checking a move in stills: put her at one moment of it, with her hands and soft things settled
  function seek(name, t) { play(name); mv.t = t * (SLOW[mv.name] || 1); snapNow = true; animate(0); snapNow = false; root.updateMatrixWorld(true); if (gearSettle) { gearSettle(); root.updateMatrixWorld(true); } softTick(0, true); root.updateMatrixWorld(true); return mv.t; }
  function walk(on) { return play(on ? 'walk' : 'pose') === 'walk'; }
  function animate(dt) {
    dt = dt > 0 ? Math.min(dt, 0.05) : 0; clock += dt;
    if (mv.name === 'pose') { if (gearTick) gearTick(dt); softTick(dt); return; }
    mv.t += dt; if (SHOTS[mv.name] && mv.t >= SHOTS[mv.name] + 1.2) mv.t = 0;       // a short move plays again after a pause, for as long as it is the one chosen
    let N = SHOTS[mv.name] && mv.t >= SHOTS[mv.name] ? 'idle' : mv.name, T = mv.t / (SLOW[N] || 1), two = 0, Tbow = T; restAll();
    if (N === 'shots') { const cut = GEM_CUT * SLOW.gem; if (mv.t < cut) { N = 'gem'; T = Tbow = mv.t / SLOW.gem; } else { N = 'draw'; two = 1; Tbow = (mv.t - cut) / SLOW.draw; T = drawClock(Tbow, 1, DCB).T; } }       // the gem's two shots: the touch, then the bow with two arrows
    fWant.R = N === 'talk' ? FP.soft : N === 'cheer' && T > 0.25 && T < 1.2 ? FP.fist : FP.relax; fWant.L = FP.relax;
    wk += ((N === 'walk' ? 1 : 0) - wk) * Math.min(1, dt * 4.5); jg += ((N === 'jog' ? 1 : 0) - jg) * Math.min(1, dt * 4.5);
    { const P = N === 'fall' ? 'down' : N; let Wt = 0; for (const k in PW) { PW[k] = snapNow ? (P === k ? 1 : 0) : PW[k] + ((P === k ? 1 : 0) - PW[k]) * Math.min(1, dt * (k === 'down' ? 2.0 : 3.4)); PE[k] = sm(0, 1, PW[k]); Wt += PE[k]; } if (Wt > 1) for (const k in PW) PE[k] /= Wt; PE.all = Math.min(1, Wt); }
    OS.R.set(0, 0, 0); OS.L.set(0, 0, 0); OS.yawR = OS.yawL = 0; OS.plant = 0;
    const go = Math.min(1, wk + jg), g = wk + jg > 1e-4 ? jg / (wk + jg) : 0, L = (a, b) => a + (b - a) * g, still = 1 - go;
    for (const [S, s] of SIDES) SK['uarm' + S].rotation.z = s * (9 * DEG - A_POSE);       // arms hang close
    const bounce = (h) => { if (h <= 0) return; const a = h / 0.10; SK.hips.position.y += h; for (const [S] of SIDES) { add('foot' + S, a, 0, 0); add('toe' + S, -a, 0, 0); } };       // up on the balls of her feet
    // always: breath, and a small shift of weight when she stands
    const br = Math.sin(clock * 1.7), sway = Math.sin(clock * 0.9);
    add('spine2', 0.012 * br, 0, 0); add('spine3', 0.010 * br, 0, 0); for (const [S, s] of SIDES) add('clav' + S, 0, 0, s * 0.014 * br);
    SK.hips.position.x += 0.007 * sway * still; add('hips', 0, 0, 0.012 * sway * still); add('spine1', 0, 0, -0.012 * sway * still);
    if (N === 'idle') { const lk = Math.sin(clock * 0.37) + 0.5 * Math.sin(clock * 0.83 + 1); add('neck', 0, 0.07 * lk, 0); add('head', 0.02 * Math.sin(clock * 0.6), 0.10 * lk, 0.02 * Math.sin(clock * 0.45)); add('spine2', 0, 0.03 * lk, 0);
      for (const [S, s] of SIDES) { add('uarm' + S, 0.03 * Math.sin(clock * 0.9 + s), 0, 0); add('farm' + S, -0.10 - 0.03 * br, 0, 0); add('shin' + S, 0.03 + 0.02 * br, 0, 0); add('thigh' + S, -0.015 - 0.01 * br, 0, 0); add('foot' + S, -0.015 - 0.01 * br, 0, 0); }
      const c = clock % 4.2; if (c < 0.7) bounce(0.024 * Math.pow(Math.sin(c / 0.35 * PI), 2) * (c < 0.35 ? 1 : 0.6)); }       // light on her feet: a quick double bounce now and then
    // walking and jogging share one cycle; g slides from one to the other
    if (go > 0.001) { gph += dt * TAU / L(1.02, 0.72); const A = L(0.40, 0.50), sn = Math.sin(gph), cs = Math.cos(gph);
      for (const [S, s] of SIDES) { const p = gph + (s < 0 ? 0 : PI), si = Math.sin(p), co = Math.cos(p), sw = Math.max(0, co), st = Math.max(0, -co);
        const th = -(A * si + L(0.05, 0.12)) * go, kn = (L(1.05, 1.50) * Math.pow(sw, 1.3) + L(0.20, 0.38) * Math.pow(Math.max(0, Math.sin(p - 0.5)), 3) * st + L(0.04, 0.22)) * go;       // thigh; knee folding in the swing and giving a little as the foot lands
        // Her ankle bends only as far as an ankle can. On the ground the sole lies flat until the leg is too far back, then the heel
        // lifts. In the air the foot hangs loose, toes down, and comes up to land on the heel. Her boots are stiff: the toe never folds.
        const onG = sm(-0.2, 0.2, -co), ank = cl(-(th + kn), -0.26, 0.30) * onG + lerp(L(0.32, 0.45), -0.12, (si + 1) / 2) * (1 - onG);
        add('thigh' + S, th, 0, 0); add('shin' + S, kn, 0, 0); add('foot' + S, ank * go, 0, 0);
        // arms hang loose: forearm and hand trail the upper arm, the shoulder rides with it, the hand comes a little across her body
        const sl = Math.sin(p - 0.45), sl2 = Math.sin(p - 0.9);
        add('uarm' + S, (L(0.40, 0.52) * si + L(0, 0.10)) * go, -s * L(0.10, 0.24) * Math.max(0, -si) * go, 0); add('farm' + S, -(L(0.30, 1.20) + L(0.28, 0.38) * Math.max(0, -sl)) * go, 0, 0);
        add('hand' + S, 0.20 * sl2 * go, 0, 0); add('clav' + S, 0, -s * 0.05 * si * go, s * 0.035 * Math.max(0, -si) * go); }
      const lag = Math.sin(gph - 0.5), lag2 = Math.sin(gph - 0.9), bob2 = Math.cos(2 * gph - 0.7), drift = Math.sin(clock * 0.53);       // each part a beat behind the one below it, so she is not one stiff block
      SK.hips.position.y += (-L(0.045, 0) * sn * sn - L(0, 0.045) * cs * cs + L(0, 0.03)) * go; SK.hips.position.x += L(0.014, 0.010) * cs * go;
      add('hips', L(0.02, 0.04) * go, L(0.10, 0.13) * sn * go, L(0.045, 0.035) * cs * go);
      add('spine1', L(0.02, 0.035) * go, -0.06 * lag * go, -L(0.035, 0.03) * cs * go); add('spine2', 0.012 * bob2 * go, -L(0.10, 0.15) * lag * go, -0.02 * cs * go); add('spine3', 0.012 * bob2 * go, -0.06 * lag2 * go, 0.012 * cs * go);
      add('neck', (-L(0.03, 0.05) + 0.015 * bob2) * go, (L(0.11, 0.16) * lag + 0.04 * drift) * go, 0.01 * cs * go); add('head', 0.02 * Math.cos(2 * gph - 1.3) * go, (0.05 * lag2 + 0.05 * drift) * go, 0.012 * drift * go); }
    // talking: weight on one hip, one quick hand at chest height, small nods
    if (N === 'talk') { const k = sm(0, 0.4, T), a1 = Math.sin(T * 4.4), a2 = Math.sin(T * 2.3 + 1), a3 = Math.sin(T * 6.1);
      SK.hips.position.x += 0.016 * k; add('hips', 0, 0.10 * k, 0.03 * k); add('spine1', 0, -0.06 * k, -0.035 * k);
      add('uarmR', -(0.55 + 0.12 * a2) * k, 0, -0.10 * k); add('farmR', -(1.55 + 0.28 * a1) * k, 0, 0); add('handR', 0.25 * a3 * k, 0.5 * a2 * k, 0);
      add('uarmL', 0.06 * a2 * k, 0, 0); add('farmL', -0.22 * k, 0, 0);
      add('head', (0.05 * a1 + 0.03) * k, 0.10 * a2 * k, 0.05 * Math.sin(T * 1.3) * k); add('neck', 0, 0.06 * a2 * k, 0);
      if (clock > mouthAt) { mouthAt = clock + 0.10 + 0.09 * Math.abs(Math.sin(clock * 37.7)); const r = Math.abs(Math.sin(clock * 91.3)); mouthNow = r < 0.28 ? 'rest' : r < 0.62 ? 'open' : r < 0.86 ? 'oo' : 'smile'; }
    } else mouthNow = N === 'cheer' && T > 0.2 && T < 1.3 ? 'smile' : 'rest';
    let squint = 0;
    // Moonsteel Draw (H1, H2, H4): the bow from her back, the full draw, the arrow loosed toward her left (screen right), the bow put
    // away. Her body does this much here; her arms, her hands and the bow itself are worked out in armsAndBow, from where the bow is.
    if (N === 'draw') { const st = sm(0.30, 1.05, T) * (1 - sm(2.95, 3.5, T)), tw = sm(0.0, 0.24, T) * (1 - sm(0.42, 0.85, T)) + sm(3.5, 3.9, T) * (1 - sm(4.05, 4.4, T)), lk = sm(0.80, 1.22, T) * (1 - sm(2.95, 3.35, T));
      const hold = T < TR ? sm(1.28, 1.86, T) : 0, aft = Math.max(0, T - TR), kick = T >= TR ? Math.exp(-aft / 0.14) : 0, easeIn = 1 - sm(0, 0.2, T) + sm(4.25, 4.5, T);
      add('hips', 0, 0.10 * st, 0); add('spine1', 0, -0.08 * tw, 0); add('spine2', 0, 0.12 * st - 0.22 * tw, -0.04 * hold + 0.004 * Math.sin(T * 31) * hold); add('spine3', -0.03 * hold - 0.02 * kick, 0.04 * st - 0.10 * tw + 0.03 * kick, 0);
      add('neck', 0.05 * tw, 0.46 * lk - 0.18 * tw, 0); add('head', 0.10 * tw, 0.56 * lk - 0.22 * tw, 0.03 * hold);
      for (const [S, s] of SIDES) { add('thigh' + S, -0.03 * st - 0.015 * easeIn, 0, s * 0.23 * st); add('shin' + S, 0.06 * st + 0.03 * easeIn, 0, 0); add('foot' + S, -0.03 * st - 0.015 * easeIn, 0, -s * 0.23 * st); add('farm' + S, -0.10 * easeIn, 0, 0); }
      SK.hips.position.y -= 0.024 * st; bounce(0.026 * Math.pow(Math.sin(PI * cl((T - 0.26) / 0.5, 0, 1)), 2));       // she comes up on her toes as her feet go wide
      squint = hold > 0.7 ? 0.5 : 0; }
    // Sword (G4, H7): drawn from her left hip as she hops round to face screen right, a guard, one full cut with a long step, back to
    // guard, and away. Her body does this much here; her feet, her arms, the sword and its scabbard are worked out in swordStage.
    if (N === 'sword') { const o = swordBeats(T, SWB), easeIn = 1 - sm(0, 0.2, T) + sm(3.3, 3.55, T);
      add('hips', 0, (62 + 8 * o.lun) * DEG * o.st, 0); SK.hips.position.x += 0.24 * o.lun * o.st; SK.hips.position.y += 0.05 * o.hop - (0.11 + 0.10 * o.lun) * o.st;
      add('spine1', 0.07 * o.st + 0.13 * o.lun, 0.03 * o.st, 0); add('spine2', 0.03 * o.st + 0.05 * o.lun, 0.04 * o.st - 0.12 * o.a * (1 - o.b) + 0.08 * o.b * (1 - o.c), 0);
      add('neck', -0.06 * o.lun, 0.04 * o.st, 0); add('head', -0.05 * o.st - 0.08 * o.lun, 0.06 * o.st, 0);
      for (const [S] of SIDES) { add('farm' + S, -0.10 * easeIn, 0, 0); add('shin' + S, 0.03 * easeIn, 0, 0); add('thigh' + S, -0.015 * easeIn, 0, 0); add('foot' + S, -0.015 * easeIn, 0, 0); } }
    // Knives (G5, H8): both from the back of her belt, a wide stance with her chest to us, the first thrown with her right hand as her
    // body turns toward screen right, the second with her left as it turns back. Her feet, arms and the knives are worked out in knifeStage.
    if (N === 'knives') { const o = knifeBeats(T, KNB), yaw = (4 * o.st - 14 * o.coil + 62 * o.y1 * (1 - o.y2) + 6 * o.y2) * (1 - o.out) * DEG, lean = 0.10 * (o.t1 * (1 - 0.5 * o.f1) + 0.5 * o.t2 * (1 - o.f2)) * (1 - o.out);
      const look = sm(0.45, 0.70, T) * (1 - sm(1.55, 1.85, T)), hy = (62 * DEG - yaw) * look, easeIn = 1 - sm(0, 0.2, T) + sm(2.2, 2.45, T);
      add('hips', 0, 0.40 * yaw, 0); add('spine1', Math.sin(0.5 * yaw) * lean, 0.10 * yaw, -Math.cos(0.5 * yaw) * lean); add('spine2', 0, 0.28 * yaw, 0); add('spine3', 0, 0.22 * yaw, 0);
      add('neck', 0, 0.45 * hy, 0); add('head', 0, 0.55 * hy, 0); SK.hips.position.x += (-0.03 * o.coil + 0.07 * o.t1) * o.st; SK.hips.position.y += 0.05 * o.hop - 0.07 * o.st;
      for (const [S] of SIDES) { add('farm' + S, -0.10 * easeIn, 0, 0); add('shin' + S, 0.03 * easeIn, 0, 0); add('thigh' + S, -0.015 * easeIn, 0, 0); add('foot' + S, -0.015 * easeIn, 0, 0); } }
    // The gem (H9): she stands straight and still, eyes closed, a small smile. Her hand and the light are worked out in gemStage.
    stillK = 0;
    if (N === 'gem') { const o = gemBeats(T, GMB); stillK = o.still; add('head', 0.05 * o.up, 0, 0); add('neck', 0.03 * o.up, 0, 0); add('spine3', -0.02 * o.up, 0, 0); for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0);
      squint = Math.max(squint, o.eyes); if (o.eyes > 0.5) mouthNow = 'smile'; }
    // Silverglass (H6): feet wide, her body turned a little toward screen right and leaning into her palm. The rest is in glassStage.
    if (N === 'glass') { const o = glassBeats(T, GLB), easeIn = 1 - sm(0, 0.15, T) + sm(2.6, 2.9, T);
      add('hips', 0, 8 * DEG * o.st, 0); add('spine1', 0.05 * o.push, 0, -0.03 * o.push); add('spine2', 0, (12 * o.st + 6 * o.push - 8 * o.back) * DEG, 0); add('neck', 0, 0.20 * o.st, 0); add('head', 0, 0.26 * o.st, 0);
      SK.hips.position.x += 0.03 * o.push * o.st; SK.hips.position.y += 0.04 * o.hop - 0.06 * o.st; for (const [S] of SIDES) add('farm' + S, -0.10 * easeIn, 0, 0); }
    // ---- postures: where her hips go and how her back and head are held. Her feet and hands are in emoteStage ----
    if (PE.all > 0.001) { const a = PE, bob = 0.025 * Math.sin(clock * 1.5), stag = N === 'fall' ? sm(0, 0.08, T) * (1 - sm(0.15, 0.5, T)) : 0;
      SK.hips.position.y += -0.43 * a.kneel - 0.535 * a.squat - 0.745 * a.sit + (-0.38 + bob) * a.hover - 0.595 * a.down; SK.hips.position.z += 0.02 * a.kneel - 0.20 * a.squat - 0.05 * a.sit - 0.10 * a.down; SK.hips.position.x -= 0.05 * stag;
      add('hips', 0.30 * a.squat + 0.25 * a.down, 0, 0.05 * stag); add('spine1', 0.04 * a.kneel + 0.25 * a.squat + 0.16 * a.sit + 0.35 * a.down - 0.10 * stag, 0, 0.10 * stag); add('spine2', 0.15 * a.squat + 0.14 * a.sit + 0.30 * a.down, 0.15 * stag + 0.10 * a.sit, 0.08 * stag); add('spine3', 0.15 * a.down - 0.03 * a.hover, 0, 0);
      add('neck', -0.20 * a.squat - 0.10 * a.sit + 0.30 * a.down - 0.15 * stag, 0, 0); add('head', -0.15 * a.squat - 0.10 * a.sit + 0.20 * a.down, -0.08 * a.sit, 0.08 * a.down);
      if (a.hover > 0.5 || a.down > 0.4) squint = 1; if (a.hover > 0.5) mouthNow = 'smile'; if (stag > 0.3) mouthNow = 'oo'; }
    // ---- a blow from screen right: she rocks away from it, flinches, then rolls her shoulder and is ready again ----
    if (N === 'hit') { const j = sm(0, 0.07, T) * (1 - sm(0.13, 0.58, T)), j2 = sm(0.02, 0.12, T) * (1 - sm(0.20, 0.62, T)), sh = sm(0.60, 0.74, T) * (1 - sm(0.86, 1.04, T));
      SK.hips.position.x -= 0.085 * j2; SK.hips.position.y -= 0.035 * j2; add('hips', 0, -0.10 * j2, 0.07 * j2); add('spine1', -0.05 * j, 0, 0.15 * j2); add('spine2', -0.06 * j, -0.14 * j2, 0.17 * j2); add('spine3', 0, 0, 0.06 * j2); add('neck', -0.10 * j, 0, -0.12 * j); add('head', -0.10 * j, -0.16 * j2, -0.20 * j);
      add('clavL', 0, 0, 0.22 * j); add('uarmL', -0.35 * j2, 0, 0.42 * j2); add('farmL', -1.25 * j2, 0, 0); add('uarmR', 0.20 * j2, 0, -0.50 * j2); add('farmR', -0.45 * j2, 0, 0);
      add('clavR', 0, 0, -0.16 * sh); add('clavL', 0, 0, 0.10 * sh); add('head', 0, 0, 0.10 * sh); add('spine2', 0, 0.08 * sh, 0); bounce(0.012 * sh);
      for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0); if (j > 0.3 || j2 > 0.45) { squint = 1; mouthNow = 'oo'; } fWant.L = j2 > 0.3 ? FP.fist : FP.relax; OS.plant = sm(0, 0.03, T) * (1 - sm(0.62, 0.8, T)); }
    // ---- a hard blow: knocked two steps back, turned from it and folded over, an arm across her middle; she straightens and steps back in ----
    if (N === 'hard') { const o = hardBeats(T, HDB); SK.hips.position.x -= 0.30 * o.back + 0.03 * o.j; SK.hips.position.y -= 0.09 * o.fold + 0.02 * o.back; SK.hips.position.z += 0.03 * o.fold; add('hips', 0.14 * o.fold, -0.30 * o.fold + 0.10 * o.j, 0.05 * o.fold);
      add('spine1', 0.30 * o.fold - 0.08 * o.j, -0.08 * o.fold, 0.12 * o.fold + 0.08 * o.j); add('spine2', 0.24 * o.fold, -0.08 * o.fold, 0.10 * o.fold + 0.06 * o.j); add('neck', 0.14 * o.fold - 0.12 * o.j, 0, 0); add('head', 0.12 * o.fold, 0.12 * o.fold, -0.14 * o.j); add('uarmL', -0.15 * o.fold, 0, 0.50 * o.fold); add('farmL', -0.7 * o.fold, 0, 0);
      OS.R.set(-0.34 * (o.sR - o.rR), 0.05 * (Math.sin(PI * o.sR) + Math.sin(PI * o.rR)), -0.05 * (o.sR - o.rR)); OS.L.set(-0.27 * (o.sL - o.rL), 0.05 * (Math.sin(PI * o.sL) + Math.sin(PI * o.rL)), 0.03 * (o.sL - o.rL)); OS.yawR = -0.38 * (o.sR - o.rR); OS.yawL = -0.20 * (o.sL - o.rL); OS.plant = sm(0, 0.06, T) * (1 - sm(1.66, 1.9, T));
      for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0); if (o.fold > 0.3) { squint = Math.max(squint, T < 0.55 ? 1 : 0.5); mouthNow = 'oo'; } }
    // ---- a dodge: she drops and slips away from screen right on a bent right leg, one arm up as a guard, and springs back ----
    if (N === 'dodge') { const d = sm(0, 0.16, T) * (1 - sm(0.42, 0.85, T)), stepK = Math.sin(PI * sm(0, 0.16, T)) + Math.sin(PI * sm(0.42, 0.85, T));
      SK.hips.position.x -= 0.36 * d; SK.hips.position.y -= 0.23 * d; add('hips', 0, 0.14 * d, 0.10 * d); add('spine1', 0.06 * d, 0, 0.26 * d); add('spine2', 0.08 * d, 0.12 * d, 0.22 * d); add('neck', 0, 0.16 * d, -0.16 * d); add('head', 0, 0.22 * d, -0.20 * d);
      add('uarmL', -0.6 * d, 0, 0.20 * d); add('farmL', -1.7 * d, 0, 0); add('uarmR', 0, 0, -0.85 * d); add('farmR', -0.25 * d, 0, 0); OS.R.set(-0.52 * d, 0.05 * stepK, -0.03 * d); OS.yawR = -0.45 * d; OS.yawL = 0.15 * d; OS.plant = sm(0, 0.05, T) * (1 - sm(0.85, 1.0, T));
      for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0); fWant.L = d > 0.3 ? FP.fist : FP.relax; if (d > 0.4) squint = Math.max(squint, 0.5); }
    // ---- a win: a low pump of both fists, a hop with one thrown up, then her weight on one hip, a hand on it, and a two-finger salute from her brow ----
    if (N === 'win') { const c = sm(0, 0.25, T) * (1 - sm(0.42, 0.55, T)), u = cl((T - 0.5) / 0.45, 0, 1), air = 4 * u * (1 - u), c2 = sm(0.93, 1.0, T) * (1 - sm(1.0, 1.3, T)), cc = c + 0.7 * c2, jk = sm(0.45, 0.60, T) * (1 - sm(0.88, 1.05, T)), p = sm(1.0, 1.35, T) * (1 - sm(2.5, 2.9, T));
      for (const [S] of SIDES) { add('thigh' + S, -0.42 * cc - 0.2 * air, 0, 0); add('shin' + S, 0.84 * cc + 0.4 * air, 0, 0); add('foot' + S, -0.42 * cc + 0.25 * air, 0, 0); add('uarm' + S, 0.45 * c, 0, 0); add('farm' + S, -1.7 * c - 0.10, 0, 0); }
      SK.hips.position.y += -0.07 * cc + 0.18 * air; add('uarmR', -2.6 * jk, 0, 0); add('farmR', -0.5 * jk, 0, 0); add('spine2', -0.06 * jk, 0, 0); add('head', -0.12 * jk, 0, 0);
      SK.hips.position.x -= 0.025 * p; add('hips', 0, 0, -0.06 * p); add('spine1', 0, 0, 0.07 * p); add('head', 0, 0.12 * p, 0.05 * p); if (c > 0.3 || jk > 0.3) fWant.R = fWant.L = FP.fist; if (T > 0.45 && T < 2.7) mouthNow = 'smile'; }
    // ---- a court bow: her right foot drawn back, her right hand to her heart, her left arm swept out, and she bends from the hips ----
    if (N === 'bow') { const b = sm(0.10, 0.90, T) * (1 - sm(1.50, 2.30, T)), st = Math.sin(PI * sm(0.10, 0.50, T)) + Math.sin(PI * sm(1.75, 2.25, T));
      SK.hips.position.z -= 0.10 * b; SK.hips.position.y -= 0.05 * b; add('hips', 0.28 * b, 0, 0); add('spine1', 0.26 * b, 0, 0); add('spine2', 0.16 * b, 0, 0); add('neck', 0.14 * b, 0, 0); add('head', 0.10 * b, 0, 0);
      OS.R.set(-0.03 * b, 0.035 * st, -0.27 * b); OS.yawR = -0.5 * b; OS.plant = sm(0, 0.1, T) * (1 - sm(2.3, 2.6, T)); for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0); if (b > 0.7) squint = Math.max(squint, 0.5); if (T > 1.6 && T < 2.5) mouthNow = 'smile'; }
    // ---- a wave: up on her toes, her right hand high and going from side to side (emoteStage), her left hand on her hip ----
    if (N === 'wave') { const k = sm(0, 0.35, T) * (1 - sm(1.7, 2.1, T)), sw = Math.sin(T * 11);
      add('clavR', 0, 0, -0.16 * k); add('spine2', 0, 0, 0.05 * k + 0.02 * sw * k); add('head', 0, 0, -0.08 * k); bounce(0.022 * Math.abs(Math.sin(T * 5.5)) * k);
      for (const [S] of SIDES) add('farm' + S, -0.10 * (1 - k), 0, 0); if (k > 0.3) mouthNow = 'smile'; }
    // a cheer: she dips, jumps, throws an arm up, lands soft
    if (N === 'cheer') { const c1 = sm(0, 0.22, T) * (1 - sm(0.22, 0.36, T)), u = cl((T - 0.36) / 0.5, 0, 1), air = Math.sin(PI * u), c2 = sm(0.84, 0.94, T) * (1 - sm(0.94, 1.3, T)), c = c1 + 0.8 * c2, k = sm(0.2, 0.45, T) * (1 - sm(1.0, 1.45, T));
      for (const [S] of SIDES) { add('thigh' + S, -0.45 * c - 0.25 * air, 0, 0); add('shin' + S, 0.9 * c + 0.5 * air, 0, 0); add('foot' + S, -0.45 * c + 0.2 * air, 0, 0); }
      SK.hips.position.y += -0.075 * c + 0.20 * 4 * u * (1 - u);
      add('uarmR', -2.7 * k, 0, 0); add('farmR', -0.45 * k, 0, 0); add('uarmL', -1.1 * k, 0, 0); add('farmL', -1.9 * k, 0, 0); add('head', -0.18 * k, 0, 0); add('spine2', -0.08 * k, 0, 0); }
    // limbering up: bouncing on her toes, shoulders rolling, arms shaken loose, her head from side to side
    if (N === 'limber') { const k = sm(0, 0.3, T) * (1 - sm(2.2, 2.6, T));
      bounce(0.020 * Math.abs(Math.sin(T * 9.5)) * k); for (const [S, s] of SIDES) { add('clav' + S, 0, 0, s * 0.16 * Math.sin(T * 5 + (s > 0 ? 1.6 : 0)) * k); add('uarm' + S, 0.14 * Math.sin(T * 9 + s) * k, 0, s * 0.06 * k); add('farm' + S, -(0.5 + 0.2 * Math.sin(T * 11 + s)) * k, 0, 0); add('shin' + S, 0.10 * k, 0, 0); add('thigh' + S, -0.05 * k, 0, 0); }
      add('head', 0, 0, 0.22 * Math.sin(T * 2.4) * k); add('neck', 0.04 * k, 0, 0.08 * Math.sin(T * 2.4) * k); }
    armsAndBow(N === 'draw' ? Tbow : -1, dt, two); swordStage(N === 'sword' ? T : -1, dt * (1 - stillK), snapNow); knifeStage(N === 'knives' ? T : -1); { const g1 = gemStage(N === 'gem' ? T : -1), g2 = glassStage(N === 'glass' ? T : -1); if (!g1 && !g2) magicOff(); else { if (!g1) { for (const k of ['gGlow', 'gStar', 'gRing']) MG[k].visible = false; for (const m of MG.sparks) m.visible = false; if (meshes.veins) meshes.veins.visible = false; MATS.gem.emissiveIntensity = 0; MATS.lens.emissiveIntensity = 0; } if (!g2) { MG.pane.visible = false; MG.flash.visible = false; for (const a of [MG.rim, MG.shards]) for (const m of a) m.visible = false; } } } emoteStage(N, T); hoverLight(); if (two) gemGlow(Tbow, DCB); clearHands(N, dt, snapNow); fingersTick(dt, snapNow);
    // her face: she blinks; her mouth moves when she talks
    if (clock > blinkAt) { blinkT = clock; blinkAt = clock + 2.2 + 2.6 * Math.abs(Math.sin(clock * 12.9)); }
    const bt = clock - blinkT, eyes = Math.max(squint, bt < 0.05 ? 0.5 : bt < 0.10 ? 1 : bt < 0.15 ? 0.5 : 0), key = eyes + '|' + mouthNow;
    if (key !== facePainted) { paintFace(eyes, mouthNow); facePainted = key; }
    if (gearTick) gearTick(dt * (1 - stillK));       // the bags and charms swing with her (and hang still for the breath of the gem)
    softTick(dt * (1 - stillK));       // and her sleeves, the tails of her headband and her loose locks
  }
  return { root, skeleton, bones, SK, animate, pose, play, seek, moves: MOVES, shots: SHOTS, slow: SLOW, get move() { return mv; }, walk, bow: BOWK, sword: SWK, knives: KNK, light: FX, swing: () => { if (gearKick) gearKick(); }, setLook, meshes, spin: 0, time: 0, stanceProgress: 1, setStance() {}, setFace: (eyes, mouth) => paintFace(eyes || 0, mouth || 'rest'), debug: { textures: TEXLIST, SK, meshes, D, cloths: [], headPoint, JH, hairPt, phOfY }, get triangles() { return triCount; } };
}
