// fox.js: the Fox of the Moon Faire (chaos magic; a fabric artist whose shears split into two daggers).
// Code-built three.js r128 model (global THREE). Defines makeFox(opts) only. Forked from the Jester (models/jester-3d) on
// November 12, 2026: the engine (skeleton, part builders, cloth, pose and move system) is hers, unchanged; the body tables, the
// costume and the baked paintings are the Fox's. Parts of the Jester's costume are still in the source and are switched off by
// FOX_SKIP in 10_geom.js until each is replaced.
// Units are meters, Y up, feet on y = 0. She faces +Z (the audience); her left is +X, the side her spells fly to.
// The numbers in the tables are in the Jester's frame; the whole figure is then scaled by FOX_K (see 70_anim.js).
function makeFox(opts) {
  'use strict';
  opts = opts || {};
  // detail 0.5 to 1 scales segment counts and cloth resolution for slower phones
  const DET = Math.max(0.5, Math.min(1, opts.detail == null || !Number.isFinite(+opts.detail) ? 1 : +opts.detail));
  // Chris, 13 Nov: her head is 10% larger than the size measured off the standing painting (0.85), and the depth reshaping of her face is on.
  // Both can still be passed in (headScale; faceDepth 0 to 1) for comparing, but these are what she is.
  const HEAD_K = +opts.headScale > 0 ? +opts.headScale : 0.935;
  const FACE_DEPTH = opts.faceDepth === undefined || opts.faceDepth === null || opts.faceDepth === true ? 1 : Math.max(0, +opts.faceDepth || 0);
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
    const t = new THREE.CanvasTexture(c);
    if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); }
    t.anisotropy = 4; if (srgb !== false) t.encoding = THREE.sRGBEncoding; return t;
  };
  const TEXS = Math.max(0.5, Math.min(1, opts.textureScale == null ? 1 : +opts.textureScale)); // canvas size scale

  // ---------- palette, sampled from her sprite sheets ----------
  const PAL = {
    skin: '#fccfb0', skinSh: '#d39a84', blush: '#e88f88', lip: '#b02c46',
    black: '#141016', soft: '#231c26', char: '#2e2630',
    wine: '#7a1f43', wineDk: '#4c1029', magenta: '#b8407e', rose: '#d2617f',
    gold: '#d6a84e', goldHi: '#f5d98a', goldDk: '#8f6a25', orange: '#d98a3a',
    olive: '#6f5a2a', oliveHi: '#9a8040', oliveDk: '#3c3018',
    purple: '#7a4298', purpleHi: '#9c66ba', purpleDk: '#3c1e54', lace: '#63305e', laceHi: '#864a80',
    teal: '#3fc2b4', tealDk: '#1d7f86', white: '#e9e4ee', violet: '#b35cff', spell: '#d58bff',
    emerald: '#1e5a4b', emeraldHi: '#2f7d68', emeraldDk: '#0f3329', charcoal: '#3a393d', bootBrown: '#4b2a1b', laceTan: '#c98a34', brass: '#b89148', hair: '#7a5232', hairHi: '#d39a55', hairDk: '#3b2618', foxfire: '#4aa8ff'
  };

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
  const L_UARM = 0.245, L_FARM = 0.225, L_THIGH = 0.365, L_SHIN = 0.365;
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
    const sh = V3(s * 0.150, 1.300, -0.008), el = sh.clone().addScaledVector(d, L_UARM), wr = el.clone().addScaledVector(d, L_FARM);
    restPts['sh' + S] = sh; restPts['el' + S] = el; restPts['wr' + S] = wr;
    addBone('clav' + S, 'spine3', s * 0.035, 1.295, 0);
    addBone('uarm' + S, 'clav' + S, sh.x, sh.y, sh.z);
    addBone('farm' + S, 'uarm' + S, el.x, el.y, el.z);
    // Three bones along the forearm that only ever turn about its length: a third, two thirds and all of the wrist's turn. The skin between elbow and
    // wrist is shared out among them, so a turned hand twists the forearm along its whole length, as a real one does, instead of wringing it at the elbow.
    for (const [nm, f] of [['ftwA', 0.44], ['ftwB', 0.67], ['ftwC', 0.90]]) { const q = el.clone().addScaledVector(d, L_FARM * f); addBone(nm + S, 'farm' + S, q.x, q.y, q.z); }
    addBone('hand' + S, 'ftwC' + S, wr.x, wr.y, wr.z);
    addBone('wrm' + S, 'ftwC' + S, wr.x, wr.y, wr.z);      // at the wrist, turning half as far as the hand: the bracelet that lies on the join of arm and hand rides on it
    addBone('thigh' + S, 'hips', s * 0.085, 0.835, 0);
    addBone('shin' + S, 'thigh' + S, s * 0.083, 0.47, 0.006);
    addBone('foot' + S, 'shin' + S, s * 0.081, 0.105, -0.012);
    addBone('toe' + S, 'foot' + S, s * 0.081, 0.035, 0.088);
  }
  // a point of the canonical right hand (fingers along -Y, palm toward +X, thumb toward +Z), placed on either wrist
  const HAND_S = opts.handScale || 0.86;         // Chris: the hands a little smaller (November 11); everything of the hand is placed through handPt, so it all shrinks about the wrist
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
  // Chris, 13 Nov: her fingers "slightly too long". They were: these lengths are the Jester's, and her own painting (D1) was scaled to them by its
  // middle finger, so her palm was never checked. In D1 her middle finger, web to tip, is 0.88 to 0.91 of her palm (web to wrist); on the model it
  // was 0.94. At 0.95 of their length her fingers are 0.89 of her palm. The thumb's two free bones take the same.
  const FINGER_K = opts.fingerLen === undefined ? 0.95 : +opts.fingerLen;
  // The same day: with the length right, her fingers were still thinner than in D1 (about 12%, across all four at two heights), and thin reads as long.
  const FINGER_W = opts.fingerWide === undefined ? 1.12 : +opts.fingerWide;
  for (const f of FINGERS) { f[3] *= FINGER_K; f[4] *= FINGER_W; }
  const PHAL = [0.50, 0.255, 0.245];
  const fingerDir = (a) => [0, -Math.cos(a), Math.sin(a)];
  // the thumb's first bone lies inside the heel of the hand, from the wrist to where the thumb comes free
  const THUMB = { base: [0.008, -0.0062, 0.0286], dir: [0.12, -0.92, 0.37], len: [0.0432, 0.0310 * FINGER_K, 0.0256 * FINGER_K], r: 0.0077 * FINGER_W, roll: 60 * DEG };
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
  const FOX_SKIP = { wine: 1, cloth: 1, sock: 1, hair: 1, cap: 1, velvet: 1, fur: 1, ruffle: 1, gold: 1, gem: 1, leather: 1, bells: 1, bellslit: 1, pearl: 1 };   // the Jester's costume: sleeves, sock, cap, horns, pompoms, ruff and cuffs, pendant, belt, bells
  const FOX_BOOT = { boot: 1, sole: 1, stitch: 1, eyelet: 1, lace: 1, aglet: 1 };
  function addPart(key, part, wf, o) {
    o = o || {};
    if (FOX_SKIP[key]) return { key, start: 0, count: 0 };
    if (FOX_BOOT[key]) {                             // her boot's shape (painting E1, measured as fractions of its length): thinner sole, shorter shaft, deeper at the padded collar
      const p = part.pos;
      for (let i = 0; i < p.length; i += 3) { const y = p[i + 1]; if (y < 0.30) { p[i + 2] = -0.012 + (p[i + 2] + 0.012) * (1 + 0.28 * sm(0.09, 0.20, y)); p[i + 1] = y < 0.066 ? y * 0.757 : 0.050 + (y - 0.066) * 0.878; } }
    }
    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;
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
  const BAKED = (opts.textures !== undefined ? opts.textures : (typeof window !== 'undefined' ? window.FOX_TEX : null)) || null;
  const UPK = opts.upperScale || 1.0;             // scale of everything above the waist (applied to the first spine bone after the bind)
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
  // ---------- skin weights by region ----------
  const SPINE_W = [['hips', 0.885], ['spine1', 1.03], ['spine2', 1.14], ['spine3', 1.255]];
  function wSpine(y) {
    if (y <= SPINE_W[0][1]) return [BI.hips, 1];
    for (let i = 1; i < SPINE_W.length; i++) if (y < SPINE_W[i][1]) {
      const u = sm(SPINE_W[i - 1][1], SPINE_W[i][1], y);
      return [BI[SPINE_W[i - 1][0]], 1 - u, BI[SPINE_W[i][0]], u];
    }
    return [BI.spine3, 1];
  }
  function wTorso(x, y, z) {
    const w = wSpine(y), ax = Math.abs(x), S = x < 0 ? 'R' : 'L';
    const k = 0.75 * sm(0.085, 0.15, ax) * sm(1.19, 1.27, y);       // the shoulder girdle follows the collarbone
    if (k > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - k; w.push(BI['clav' + S], k); }
    if (y > 1.30) { const n = sm(1.30, 1.355, y) * (1 - sm(0.05, 0.1, ax)); if (n > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - n; w.push(BI.neck, n); } }
    return w;
  }

  // ---------- torso: emerald blouse under a red brocade corset, painted in one atlas ----------
  // The Fox's body, measured off her paintings (November 12, 2026) and written in the Jester's frame: a real height is this
  // number times FOX_K (1.045). Scales: B4 (legs) 851 pixels a metre, from the boot's sole taken as 27.5 cm; B1 and B2
  // (no belt) 572 and 575. Each row is [height, [half width, depth to the front, depth to the back, centre forward of the spine]].
  // Hips and seat are from B4's front and side views, waist to bust from B1 and B2, the shoulders from A1.
  const TY0 = 0.785, TY1 = 1.365;                   // the two lowest rows close the torso inside the tops of the thighs, so no edge shows between her legs
  const TORSO = [[0.785, [0.110, 0.030, 0.050, 0.030]], [0.796, [0.160, 0.066, 0.084, 0.032]], [0.808, [0.190, 0.098, 0.108, 0.030]], [0.816, [0.1975, 0.114, 0.117, 0.026]], [0.821, [0.1985, 0.1225, 0.1225, 0.021]], [0.855, [0.1934, 0.1237, 0.1237, 0.016]], [0.888, [0.1844, 0.122, 0.122, 0.021]],
    [0.922, [0.1732, 0.1186, 0.1186, 0.030]], [0.956, [0.160, 0.107, 0.107, 0.035]], [0.985, [0.146, 0.098, 0.098, 0.034]], [1.014, [0.129, 0.091, 0.091, 0.032]],
    [1.043, [0.113, 0.086, 0.086, 0.030]], [1.072, [0.1035, 0.083, 0.083, 0.029]], [1.100, [0.108, 0.088, 0.083, 0.028]], [1.129, [0.117, 0.092, 0.090, 0.026]],
    [1.158, [0.129, 0.098, 0.100, 0.024]], [1.187, [0.139, 0.100, 0.110, 0.020]], [1.215, [0.1435, 0.096, 0.114, 0.016]], [1.244, [0.1455, 0.091, 0.112, 0.012]],
    [1.273, [0.1450, 0.084, 0.104, 0.008]], [1.301, [0.142, 0.077, 0.094, 0.004]], [1.322, [0.134, 0.068, 0.084, 0]], [1.338, [0.114, 0.058, 0.072, -0.004]], [1.350, [0.082, 0.050, 0.060, -0.007]], [1.358, [0.058, 0.046, 0.052, -0.009]], [1.365, [0.046, 0.044, 0.046, -0.010]]];
  const WAIST = 1.072, PROJ = !!(BAKED && BAKED.body);     // PROJ: the bodice is the painting, projected from the front and from the back
  const TPW = 2.3;
  function torsoTex() {                              // only when nothing is baked: plain brocade red over charcoal
    const c = cvs(64, 64), g = c.getContext('2d'); g.fillStyle = '#8f2f2a'; g.fillRect(0, 0, 64, 64); g.fillStyle = PAL.charcoal; g.fillRect(0, 40, 64, 24); return ctex(c);
  }
  (function buildTorso() {
    const rings = [], vs = [], NR = Q(56, 26), NU = Q(64, 32);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(TY0, TY1, i / NR), [rx, rzF, rzB, cz] = spline(TORSO, y), ring = [], e = 2 / lerp(2.0, TPW, sm(0.88, 1.0, y));    // a plain oval at the hips, so the torso stays inside the tops of the two thighs
      for (let j = 0; j < NU; j++) {
        const a = (PROJ ? 1.5 * PI : PI) + (j / NU) * TAU, s = Math.sin(a), c = Math.cos(a);     // seam at the back and u = 0.5 the front; projected, the seam is at her right side
        const x = rx * Math.sign(s) * Math.pow(Math.abs(s), e); let z = cz + (c >= 0 ? rzF : rzB) * Math.sign(c) * Math.pow(Math.abs(c), e);
        if (c > 0) {                               // the bust under the corset, and the hollow between
          const ax = Math.abs(x);
          z += c * 0.046 * Math.exp(-Math.pow((ax - 0.060) / 0.050, 2) - Math.pow((y - 1.195) / 0.058, 2));
          z -= c * 0.006 * Math.exp(-Math.pow(x / 0.016, 2) - Math.pow((y - 1.215) / 0.045, 2));
        } else {                                   // the seat, fuller than a plain oval, with the cleft between
          const ax = Math.abs(x);
          z += -c * 0.010 * Math.exp(-Math.pow(x / 0.018, 2) - Math.pow((y - 0.83) / 0.06, 2));
        }
        ring.push([x, y, z]);
      }
      rings.push(ring); vs.push(i / NR);
    }
    const part = loft(rings, { v: vs, capA: true });
    if (PROJ) for (let i = 0; i <= NR; i++) {             // atlas: front view in the left half, back view in the right, each row spanning the torso's width
      const rx = spline(TORSO, lerp(TY0, TY1, i / NR))[0];
      for (let j = 0; j <= NU; j++) { const k = i * (NU + 1) + j, f = 0.5 + 0.5 * cl(part.pos[k * 3] / rx, -1, 1); part.uv[k * 2] = j <= NU / 2 ? 0.5 * f : 0.5 + 0.5 * (1 - f); }
    }
    addPart('torso', part, wTorso, { out: V3(0, 1.1, 0) });
  })();

  // ---------- arms: bare, with a short puffed linen sleeve gathered into a beaded band above the elbow ----------
  // The arm's shape along its length, from the shoulder joint (0) to the wrist (0.47): [distance, [half its width across, half its depth front to back]].
  // Read off A1 (arms hanging, 861 px a metre) and A5 (arms out): 7 cm at the elbow, 7.5 across the swell just below it, 4.8 two thirds of the way
  // down, then flattening into the wrist of her hand (4.4 by 2.8 cm). Above the sleeve's hem it is hidden, and sized to fit inside the band.
  const ARM_S = [[-0.022, [0.030, 0.030]], [0, [0.038, 0.040]], [0.04, [0.040, 0.042]], [0.11, [0.0345, 0.0360]], [0.17, [0.0332, 0.0352]], [0.205, [0.0325, 0.0340]], [0.232, [0.0322, 0.0322]], [0.245, [0.0335, 0.0316]],
    [0.2785, [0.0372, 0.0360]], [0.309, [0.0349, 0.0347]], [0.334, [0.0310, 0.0318]], [0.358, [0.0270, 0.0284]], [0.383, [0.0230, 0.0254]], [0.408, [0.0194, 0.0233]], [0.436, [0.0170, 0.0224]], [0.460, [0.0162, 0.0226]], [0.478, [0.0156, 0.0228]]];      // at the wrist it is a millimetre or two bigger than her hand's own wrist, which it sleeves
  // The sleeve, read off A1, A3 and the blouse sheet F5: [distance along the arm, radius, fine gathers, broad folds, how far into the ruffle].
  // A ball of linen from the shoulder seam (it stands 5 cm above the joint) to a shirred band 14 cm down, which it overhangs a little; then a 5 cm ruffle.
  const SLEEVE = [[-0.050, 0.006, 0, 0, 0], [-0.044, 0.016, 0.08, 0, 0], [-0.037, 0.024, 0.10, 0, 0], [-0.022, 0.040, 0.08, 0.010, 0], [-0.0085, 0.0517, 0.05, 0.020, 0], [0.012, 0.0610, 0.025, 0.030, 0],
    [0.035, 0.0672, 0.014, 0.045, 0], [0.062, 0.0690, 0.016, 0.050, 0], [0.090, 0.0668, 0.032, 0.045, 0], [0.110, 0.0638, 0.055, 0.035, 0], [0.124, 0.0600, 0.08, 0.025, 0], [0.133, 0.0535, 0.10, 0.010, 0],
    [0.1385, 0.0465, 0.10, 0, 0], [0.1392, 0.0410, 0.10, 0, 0], [0.1365, 0.0380, 0.08, 0, 0], [0.1340, 0.0372, 0.03, 0, 0], [0.1380, 0.0377, 0.03, 0, 0], [0.1420, 0.0372, 0.03, 0, 0], [0.1460, 0.0375, 0.03, 0, 0],
    [0.1490, 0.0398, 0.02, 0, 0.25], [0.1580, 0.0448, 0, 0, 0.55], [0.1720, 0.0505, 0, 0, 0.85], [0.1880, 0.0560, 0, 0, 1]];
  const SLEEVE_K = SLEEVE.map((p, i) => [i, p]), BAND_S = 0.1400, BAND_R = 0.0372, SLEEVE_IN = 0.122;      // SLEEVE_IN: the puff stops at the corset strap's outer edge
  const armAt = (sl) => spline(ARM_S, sl);
  function wArm(S, sLen) {
    if (sLen < 0.05) { const u = sm(-0.035, 0.05, sLen); return [BI['clav' + S], (1 - u) * 0.6, BI.spine3, (1 - u) * 0.4, BI['uarm' + S], u]; }
    const E1 = L_UARM + 0.05, W0 = L_UARM + L_FARM - 0.02;
    if (sLen < E1) { const u = sm(L_UARM - 0.05, E1, sLen); return [BI['uarm' + S], 1 - u, BI['farm' + S], u]; }
    if (sLen < W0) {                               // down the forearm the skin passes from one twist bone to the next
      const f = 3 * (sLen - E1) / (W0 - E1), k = Math.min(2, Math.floor(f)), u = f - k, nm = ['farm', 'ftwA', 'ftwB', 'ftwC'];
      return [BI[nm[k] + S], 1 - u, BI[nm[k + 1] + S], u];
    }
    const u = sm(W0, L_UARM + L_FARM + 0.012, sLen); return [BI['ftwC' + S], 1 - u, BI['hand' + S], u];
  }
  const braceletChains = [];                       // each strand of beads hangs on its own little spring, so the three knock about out of step
  const braceletLater = [];                        // the beads themselves are strung once her hands exist (33_bracelets.js), so a strand can lie on her hand
  // Both arms are built as her left one and mirrored, with each ring's points taken in the opposite order so the skin still faces out;
  // the picture's left-to-right is flipped to match (u), so front, back, inside and outside mean the same on both arms.
  const gsA = (x, w) => Math.exp(-x * x / (w * w));
  const mirrorRings = (rings) => rings.map((ring) => ring.map((p, j) => { const q = ring[(ring.length - j) % ring.length]; return [-q[0], q[1], q[2]]; }));
  const flipU = (part, uS) => { for (let k = 0; k < part.uv.length; k += 2) part.uv[k] = (uS || 1) - part.uv[k]; return part; };
  {
    const d = armDir.L, sh = restPts.shL, o = V3(Math.cos(A_POSE), Math.sin(A_POSE), 0), bz = V3(0, 0, 1);      // along the arm, out to her side, to her front
    const at = (sl, lat, fr) => [sh.x + d.x * sl + o.x * lat, sh.y + d.y * sl + o.y * lat, sh.z + fr];
    // --- the arm ---
    const NS = Q(72, 30), NU = Q(40, 18), aRings = [], aS = [];
    for (let i = 0; i <= NS; i++) {
      const sl = lerp(-0.022, 0.478, Math.pow(i / NS, 0.92)), [hx, hz] = armAt(sl), ring = [];
      const cLat = 0.0020 * gsA(sl - 0.285, 0.040), cFr = 0.0040 * sm(0.40, 0.47, sl);        // the swell below the elbow sits to the outside; the wrist meets the middle of her hand
      for (let j = 0; j < NU; j++) {
        const a = (j / NU) * TAU, ca = Math.cos(a), sa = Math.sin(a);
        const back = Math.max(0, -sa), front = Math.max(0, sa);
        let k = 1 + (0.0042 / hz) * gsA(sl - 0.2440, 0.0130) * Math.pow(back, 5)                // the point of the elbow
          - (0.0020 / hz) * gsA(sl - 0.2480, 0.0100) * Math.pow(front, 4)                      // the hollow of the inner elbow
          + (0.0016 / hz) * gsA(sl - 0.4560, 0.0080) * Math.pow(back, 6);                      // the wrist bone
        k -= (0.0012 / hz) * gsA(sl - 0.2440, 0.0090) * (gsA(a - 4.19, 0.30) + gsA(a - 5.24, 0.30));     // the two dimples beside the point of the elbow
        ring.push(at(sl, cLat + ca * hx * k, cFr + sa * hz * k));
      }
      aRings.push(ring); aS.push(sl);
    }
    // --- the sleeve ---
    const NP = Q(84, 34), NV = Q(108, 44), sRings = [], sS = [], COARSE = NV < 100;     // the phone build has fewer points round the sleeve (81), too few to carry the finest gathers, so it gets fewer, broader ones
    for (let i = 0; i <= NP; i++) {
      const [sl0, r, fine, broad, ruf] = spline(SLEEVE_K, (i / NP) * (SLEEVE.length - 1)), ring = [];
      for (let j = 0; j < NV; j++) {
        const a = (j / NV) * TAU;
        // gathers are never even: each fold has its own width and depth, and the broad folds of the puff run a little aslant
        const wob = 0.9 * Math.sin(a * 3 + 0.8) + 0.6 * Math.sin(a * 5 + 2.9), amp = 0.62 + 0.38 * Math.sin(a * 2 + 1.1 + sl0 * 9);
        const pl = COARSE ? 0.8 * amp * (0.7 * Math.sin(a * 12 + wob + 0.4) + 0.3 * Math.sin(a * 17 - wob + 2.2)) : amp * (0.55 * Math.sin(a * 21 + wob + 0.4) + 0.30 * Math.sin(a * 33 - 1.4 * wob + 2.2 + sl0 * 30) + 0.15 * Math.sin(a * 47 + 0.5 * wob));
        const bf = 0.9 * Math.sin(a * 5 + sl0 * 13 + 0.7 + 0.5 * wob) + 0.6 * Math.sin(a * 8 - sl0 * 17 + 2.1) + 0.35 * Math.sin(a * 13 + sl0 * 9 + 4.0 - wob);
        const flute = COARSE ? 0.64 * Math.sin(a * 8 + 0.5 + 0.7 * wob) + 0.30 * Math.sin(a * 13 + 1.9 - wob) : 0.60 * Math.sin(a * 8 + 0.5 + 0.7 * wob) + 0.30 * Math.sin(a * 13 + 1.9 - wob) + 0.16 * Math.sin(a * 21 + 3.3);
        const wave = ruf * ruf * 0.0165 * flute * (0.75 + 0.25 * Math.sin(a * 3 + 2)), sl = sl0 + ruf * (0.0030 * Math.sin(a * 8 + 2.1 + 0.7 * wob) + 0.0020 * Math.sin(a * 3 + 0.4));
        const rr2 = r * (1 + fine * pl + broad * bf) + wave, p = at(sl, Math.cos(a) * rr2, Math.sin(a) * rr2);
        if (ruf === 0 && sl0 < 0.133 && p[0] < SLEEVE_IN) p[0] = SLEEVE_IN + 0.30 * (p[0] - SLEEVE_IN);      // where the puff would cover the corset strap it is pressed flat against her side instead
        ring.push(p);
      }
      sRings.push(ring); sS.push(Math.max(0.02, sl0));
    }
    for (const [S, s] of SIDES) {
      const ar = s > 0 ? aRings : mirrorRings(aRings), sr = s > 0 ? sRings : mirrorRings(sRings), ac = NU + 1, sc = NV + 1;
      const arm = loft(ar, { capA: true }), slv = loft(sr, { capA: true, uS: 9, vS: 5 });
      if (s < 0) { flipU(arm, 1); flipU(slv, 9); }
      addPart('arm', arm, (x, y, z, i) => wArm(S, i < aS.length * ac ? aS[Math.floor(i / ac)] : aS[0]), { out: centroidOf(ar) });
      addPart('emerald', slv, (x, y, z, i) => wArm(S, i < sS.length * sc ? sS[Math.floor(i / sc)] : 0.02), { out: centroidOf(sr) });
      // the gold beads sewn round the band
      const NB = 21, wB = [BI['uarm' + S], 1];
      for (let k = 0; k < NB; k++) { const a = ((k + 0.5) / NB) * TAU, p = at(BAND_S, Math.cos(a) * (BAND_R + 0.0024), Math.sin(a) * (BAND_R + 0.0024)), q = V3(s * p[0], p[1], p[2]); addPart('bellm', spherePart(q, 0.0034, 0.0034, 0.0034, 9, 7), () => wB, { out: q }); }
      // her bracelets (F2), three strands stacked above each wrist: large dark wood beads, small gold ones, medium wood ones. Each lies on the wrist's
      // own flattened shape, and where her hand is wider than her wrist (the root of her thumb), on her hand: Chris, 13 Nov, the lowest strand "disappeared
      // inside ... her thumb". That strand sits on the line where arm meets hand, so it rides a bone that turns half as far as her hand does.
      for (const [sl, br, nb, key, ph] of [[0.4470, 0.0056, 13, 'woodbead', 0.0], [0.4630, 0.0031, 27, 'bellm', 0.3], [0.4775, 0.0040, 20, 'woodbead', 0.7]]) {
        const [hx, hz] = armAt(sl), cFr = 0.0040 * sm(0.40, 0.47, sl), ex = hx + br * 0.80, ez = hz + br * 0.80, c0 = at(sl, 0, cFr), c1 = at(sl + 0.035, 0, cFr), bn = 'br' + S + Math.round(sl * 1000);
        const on = sl > 0.47 && BI['wrm' + S] !== undefined ? 'wrm' + S : 'ftwC' + S;
        addBone(bn + 'a', on, s * c0[0], c0[1], c0[2]); addBone(bn + 'b', bn + 'a', s * c1[0], c1[1], c1[2]); braceletChains.push({ names: [bn + 'a', bn + 'b'], anchor: on, k: 0.14 + 0.5 * br * 20 });
        const wf = (() => { const w = [BI[bn + 'a'], 1]; return () => w; })();
        braceletLater.push(() => {
          // the ring's own frame: o its middle, ux across her wrist, uz toward her thumb side, ua down her arm
          const P3 = (p) => V3(s * p[0], p[1], p[2]), o = P3(c0), ux = P3(at(sl, 1, cFr)).sub(o).normalize(), uz = P3(at(sl, 0, cFr + 1)).sub(o).normalize(), ua = P3(at(sl + 0.01, 0, cFr)).sub(o).normalize();
          // how far her hand stands out from that middle in each direction, within the width of a bead of this ring
          const NB = 72, far = new Float32Array(NB), hp = (buckets.hand || { pos: [] }).pos, d = V3();
          for (let i = 0; i < hp.length; i += 3) { d.set(hp[i] - o.x, hp[i + 1] - o.y, hp[i + 2] - o.z); if (Math.abs(d.dot(ua)) > br + 0.003) continue; const x = d.dot(ux), z = d.dot(uz), r = Math.hypot(x, z); if (r > 0.06) continue;
            const b = ((Math.round(Math.atan2(z, x) / TAU * NB) % NB) + NB) % NB; if (r > far[b]) far[b] = r; }
          const wide = new Float32Array(NB); for (let b = 0; b < NB; b++) { let m = 0; for (let j = -2; j <= 2; j++) m = Math.max(m, far[(b + j + NB) % NB]); wide[b] = m; }
          const soft = new Float32Array(NB); for (let b = 0; b < NB; b++) { let m = 0; for (let j = -2; j <= 2; j++) m += wide[(b + j + NB) % NB]; soft[b] = m / 5; }
          const R = (th) => { const c = Math.cos(th), sn = Math.sin(th), oval = ex * ez / Math.hypot(ez * c, ex * sn), u = ((th / TAU) % 1 + 1) % 1 * NB, b0 = Math.floor(u) % NB, f = u - Math.floor(u);
            return Math.max(oval, lerp(soft[b0], soft[(b0 + 1) % NB], f) + br * 0.85); };
          const M = 360, cum = [0]; let px = R(0), pz = 0;                                          // equal steps round the ring, not equal angles
          for (let m = 1; m <= M; m++) { const a = (m / M) * TAU, r = R(a), x = Math.cos(a) * r, z = Math.sin(a) * r; cum.push(cum[m - 1] + Math.hypot(x - px, z - pz)); px = x; pz = z; }
          for (let k = 0, m = 0; k < nb; k++) {
            const want = ((k / nb + ph / TAU) % 1) * cum[M]; while (m < M && cum[m + 1] < want) m++; if (cum[m] > want) { m = 0; while (m < M && cum[m + 1] < want) m++; }
            const a = ((m + (want - cum[m]) / Math.max(1e-9, cum[m + 1] - cum[m])) / M) * TAU, r = R(a), q = P3(at(sl, Math.cos(a) * r, cFr + Math.sin(a) * r));
            addPart(key, spherePart(q, br, br, br, 8, 6), wf, { out: q });
          }
        });
      }
    }
  }

  // ---------- legs: what the trousers hide (charcoal for now, as in painting B4) ----------
  // each row is [height, [half width, depth to the front, depth to the back, centre out from the middle, centre forward]], off B4
  const LEG = [[0.875, [0.072, 0.084, 0.088, 0.090, 0.020]], [0.835, [0.0935, 0.1050, 0.1100, 0.0960, 0.0240]], [0.787, [0.0993, 0.114, 0.114, 0.0993, 0.032]], [0.753, [0.0967, 0.1057, 0.1057, 0.0967, 0.039]], [0.720, [0.0928, 0.103, 0.103, 0.0930, 0.0365]],
    [0.686, [0.088, 0.0995, 0.0995, 0.0900, 0.033]], [0.652, [0.079, 0.0928, 0.0928, 0.0880, 0.031]], [0.618, [0.072, 0.0832, 0.0832, 0.0870, 0.029]], [0.585, [0.066, 0.0731, 0.0731, 0.0860, 0.028]],
    [0.551, [0.0621, 0.0664, 0.0664, 0.0855, 0.0236]], [0.517, [0.0576, 0.0619, 0.0619, 0.0850, 0.0146]], [0.483, [0.057, 0.0602, 0.0602, 0.0845, 0.0018]], [0.450, [0.063, 0.0635, 0.0635, 0.0845, -0.0084]],
    [0.416, [0.0663, 0.067, 0.067, 0.0840, -0.0118]], [0.382, [0.0653, 0.0658, 0.0658, 0.0835, -0.014]], [0.348, [0.0596, 0.0613, 0.0613, 0.0830, -0.0152]], [0.315, [0.0522, 0.054, 0.054, 0.0825, -0.0146]],
    [0.281, [0.0455, 0.0475, 0.0475, 0.0820, -0.0129]], [0.247, [0.0400, 0.0430, 0.0430, 0.0815, -0.0118]], [0.200, [0.0385, 0.0415, 0.0420, 0.0815, -0.0118]]];
  const LEG_UP = LEG.slice().reverse();              // spline() wants heights rising
  function wLeg(S, y) {
    if (y > 0.78) { const u = sm(0.78, 0.87, y); return [BI['thigh' + S], 1 - u, BI.hips, u]; }
    const u = sm(0.42, 0.52, y); return [BI['shin' + S], 1 - u, BI['thigh' + S], u];
  }
  for (const [S, s] of SIDES) {
    const rings = [], vs = [], NR = Q(56, 24), NU = Q(36, 18);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(0.875, 0.247, i / NR), [rx0, rzF0, rzB0, cx, cz] = spline(LEG_UP, y), ring = [];
      const slim = lerp(1, 0.60, sm(0.27, 0.34, y)), rx = rx0 * slim, rzF = rzF0 * slim, rzB = rzB0 * slim;      // thinner inside the trousers, so a lifted thigh can't poke out through them (it did, in a jump)
      for (let j = 0; j < NU; j++) { const a = PI + (j / NU) * TAU; ring.push([s * cx + rx * Math.sin(a), y, cz + (Math.cos(a) >= 0 ? rzF : rzB) * Math.cos(a)]); }
      rings.push(ring); vs.push(1 - (0.875 - y) / (0.875 - 0.247));
    }
    addPart('leggings', loft(rings, { v: vs, uS: 2 }), (x, y) => wLeg(S, y), { out: V3(s * 0.085, 0.55, 0) });
  }

  // ---------- her boots, from the eight boot paintings (references/boots): tall lace-up boots in crinkled patent leather, yellow stitching,
  //            silver eyelets, a ridged platform sole with lugs and a block heel, and a ribbed cream sock with two stripes ----------
  // Measured from the side painting at 0.28 mm a pixel: the sole is 26 cm long, 4.5 cm deep at the toe and 6.6 cm at the heel; the collar is 26 cm up.
  function wBoot(S, y, z) {
    if (y > 0.10) { const u = sm(0.085, 0.165, y); return [BI['foot' + S], 1 - u, BI['shin' + S], u]; }
    const t = sm(0.085, 0.125, z) * (1 - sm(0.07, 0.11, y)); return [BI['foot' + S], 1 - t, BI['toe' + S], t];
  }
  const B_TOP = 0.262, B_E = 2 / 2.2;
  // shaft: height -> [half-width, front, back, centre z]; below the ankle the front runs out along the instep
  const B_SH = [[0.066, [0.0460, 0.118, 0.052, -0.008]], [0.092, [0.0445, 0.111, 0.053, -0.008]], [0.1044, [0.0430, 0.096, 0.052, -0.008]], [0.1184, [0.0410, 0.080, 0.046, -0.008]], [0.1344, [0.0398, 0.066, 0.042, -0.008]],
    [0.153, [0.0398, 0.056, 0.041, -0.008]], [0.20, [0.0415, 0.047, 0.047, -0.008]], [0.262, [0.0425, 0.047, 0.048, -0.008]], [0.280, [0.0425, 0.047, 0.048, -0.008]]];
  // foot: z -> [half-width, height above the sole]
  const B_FT = [[-0.066, [0.018, 0.030]], [-0.058, [0.032, 0.070]], [-0.035, [0.040, 0.098]], [0.0, [0.042, 0.108]], [0.049, [0.044, 0.103]], [0.066, [0.045, 0.084]], [0.088, [0.046, 0.057]], [0.112, [0.0465, 0.046]],
    [0.135, [0.0455, 0.042]], [0.155, [0.042, 0.039]], [0.168, [0.034, 0.032]], [0.176, [0.021, 0.021]], [0.1795, [0.008, 0.009]]];
  // sole: its top edge (the welt) by z, and its half-width in plan
  const B_YT = [[-0.080, 0.066], [-0.060, 0.064], [-0.021, 0.060], [0.021, 0.056], [0.063, 0.048], [0.105, 0.040], [0.147, 0.043], [0.192, 0.049]];
  const B_HW = [[-0.076, 0], [-0.0745, 0.014], [-0.070, 0.030], [-0.058, 0.041], [-0.035, 0.046], [0.0, 0.046], [0.035, 0.045], [0.07, 0.050], [0.11, 0.055], [0.145, 0.054], [0.170, 0.044], [0.182, 0.028], [0.1865, 0.014], [0.188, 0]];
  const B_Z0 = -0.076, B_Z1 = 0.188, B_LUG = 0.0126;
  const bTop = (z) => spline(B_YT, cl(z, -0.08, 0.192)), bHw = (z) => Math.max(0, spline(B_HW, cl(z, B_Z0, B_Z1)));
  const bBot = (z) => B_LUG + 0.025 * sm(0.014, 0.026, z) * (1 - sm(0.044, 0.058, z));      // the arch is cut up between the heel and the forefoot
  for (const [S, s] of SIDES) {
    const cx = s * 0.081, wf = (x, y, z) => wBoot(S, y, z), wShin = () => [BI['shin' + S], 1], NU = Q(36, 18), AX = V3(cx, 0.16, -0.008);
    const shaftPt = (y, a) => { const [rx, rzF, rzB, cz] = prof(B_SH, cl(y, 0.066, 0.280), true), sn = Math.sin(a), c = Math.cos(a); return V3(cx + rx * Math.sign(sn) * Math.pow(Math.abs(sn), B_E), y, cz + (c >= 0 ? rzF : rzB) * Math.sign(c) * Math.pow(Math.abs(c), B_E)); };
    const footPt = (z, a) => { const [w, h] = prof(B_FT, cl(z, -0.066, 0.1795), true), c = Math.cos(a), sn = Math.sin(a); return V3(cx + w * Math.sign(c) * Math.pow(Math.abs(c), 0.8), bTop(z) - 0.001 + (sn >= 0 ? h * Math.pow(sn, 0.85) : 0.004 * sn), z); };
    const nrm = (fn, u, v, du, dv, inside) => { const p = fn(u, v), n = fn(u + du, v).sub(fn(u - du, v)).cross(fn(u, v + dv).sub(fn(u, v - dv))).normalize(); if (n.dot(p.clone().sub(inside)) < 0) n.negate(); return { p, n }; };
    const onShaft = (y, a) => nrm(shaftPt, y, a, 0.002, 0.02, V3(cx, y, 0.0)), onFoot = (z, a) => nrm(footPt, z, a, 0.002, 0.02, V3(cx, bTop(z) + 0.02, z));
    // ---- the upper: shaft, then the foot from heel to toe ----
    const rings = [], NR = Q(30, 14);
    for (let i = 0; i <= NR; i++) { const y = lerp(B_TOP + 0.012, 0.066, Math.pow(i / NR, 0.9)), [rx, rzF, rzB, cz] = prof(B_SH, y, true); rings.push(ringXZ(cx, y, cz, rx, rzF, rzB, NU, 2.2)); }
    rings.unshift(ringXZ(cx, B_TOP + 0.004, -0.008, 0.0385, 0.043, 0.044, NU, 2.2), ringXZ(cx, B_TOP + 0.0145, -0.008, 0.0400, 0.0445, 0.0455, NU, 2.2));      // the bound edge of the collar, turned in
    addPart('boot', loft(rings, { uS: 2, vS: 1.7 }), wf, { out: AX });
    const fr = [], NF = Q(26, 12), NZ = Q(30, 14);
    for (let i = 0; i <= NZ; i++) { const u = i / NZ, z = lerp(-0.066, 0.1795, u * u * (3 - 2 * u) * 0.3 + u * 0.7), ring = []; for (let j = 0; j < NF; j++) { const p = footPt(z, (j / NF) * TAU); ring.push([p.x, p.y, p.z]); } fr.push(ring); }
    addPart('boot', loft(fr, { capA: true, capB: true, uS: 2, vS: 1.4 }), wf, { out: V3(cx, 0.08, 0.05) });
    // the tongue stands a little above the collar at the front
    { const tr = [], A0 = 0.62, NT = Q(12, 6);
      for (const [y, k, th] of [[B_TOP - 0.02, 1.0, 0.004], [B_TOP + 0.020, 1.0, 0.004], [B_TOP + 0.027, 0.86, 0.004], [B_TOP + 0.030, 0.6, 0.003]]) {
        const ring = []; for (let j = 0; j <= NT; j++) { const a = lerp(-A0, A0, j / NT) * k, p = shaftPt(Math.min(y, 0.279), a); ring.push([p.x, y, p.z - 0.0025]); }
        for (let j = NT; j >= 0; j--) { const a = lerp(-A0, A0, j / NT) * k, p = shaftPt(Math.min(y, 0.279), a); ring.push([cx + (p.x - cx) * 0.93, y, p.z - 0.0025 - th]); }
        tr.push(ring);
      }
      addPart('boot', loft(tr, { capB: true, uS: 0.6, vS: 0.2 }), wShin, { out: V3(cx, B_TOP, 0.02) });
    }
    // ---- the sole: a ridged wall from the lugs up to the welt, flaring a little toward the ground ----
    const NO = Q(64, 32), zm = (B_Z0 + B_Z1) / 2, half = (B_Z1 - B_Z0) / 2, plan = [];
    for (let j = 0; j < NO; j++) { const a = (j / NO) * TAU, c = Math.cos(a), z = zm + half * Math.sign(c) * Math.pow(Math.abs(c), 0.86); plan.push([Math.sin(a) >= 0 ? 1 : -1, z]); }
    const sring = (yf, k) => plan.map(([sd, z]) => [cx + sd * bHw(z) * (1 + k), yf(z), zm + (z - zm) * (1 + k * 0.32)]);
    const wall = loft([sring((z) => bBot(z) - 0.0015, 0.045), sring(bBot, 0.075), sring((z) => bBot(z) + 0.004, 0.082), sring((z) => bTop(z) - 0.0045, 0.012), sring(bTop, 0.0), sring((z) => bTop(z) + 0.0004, -0.035)], { capA: true, capB: true, uS: 6 });
    for (let i = 0; i < wall.pos.length / 3; i++) wall.uv[i * 2 + 1] = wall.pos[i * 3 + 1] / 0.07;
    addPart('sole', wall, wf, { out: V3(cx, 0.03, zm) });
    // lugs: blocks round the edge of the forefoot and the heel, and bars across the middle of each
    const lug = (x0, x1, z0, z1, x0b, x1b) => {       // a block from the ground up into the sole; its outer side can follow the outline (x at z0, x at z1)
      const q = (y, k) => [[cx + x0 * k, y, z0], [cx + (x0b == null ? x0 : x0b) * k, y, z1], [cx + (x1b == null ? x1 : x1b) * k, y, z1], [cx + x1 * k, y, z0]];
      const p = loft([q(0, 0.985), q(0.002, 1), q(Math.max(bBot(z0), bBot(z1)) + 0.002, 1)], { capA: true, uS: 0.4 }); for (let i = 0; i < p.pos.length / 3; i++) p.uv[i * 2 + 1] = 0.01;
      addPart('sole', p, wf, { out: V3(cx + (x0 + x1) / 2, 0.006, (z0 + z1) / 2) });
    };
    const side = (z0, z1) => { for (const sd of [-1, 1]) lug(sd * (bHw(z0) * 1.07), sd * (bHw(z0) * 1.07 - 0.019), z0, z1, sd * (bHw(z1) * 1.07), sd * (bHw(z1) * 1.07 - 0.019)); };
    for (let k = 0; k < 7; k++) side(0.060 + k * 0.0165, 0.060 + k * 0.0165 + 0.0122);
    for (let k = 0; k < 4; k++) side(-0.060 + k * 0.0185, -0.060 + k * 0.0185 + 0.0140);
    for (const x of [-0.021, 0, 0.021]) { lug(x - 0.0085, x + 0.0085, 0.174 - Math.abs(x) * 0.25, 0.1905 - Math.abs(x) * 0.5); lug(x - 0.0085, x + 0.0085, -0.0775 + Math.abs(x) * 0.35, -0.064 + Math.abs(x) * 0.2); }
    for (const z of [0.074, 0.099, 0.124, 0.149]) lug(-0.022, 0.022, z - 0.006, z + 0.006);
    for (const z of [-0.047, -0.024, -0.001]) lug(-0.019, 0.019, z - 0.006, z + 0.006);
    // ---- stitching: small yellow dashes lying on the leather, in double rows along every seam, and one row round the welt ----
    const ST = { pos: [], uv: [], idx: [], nor: [] }, PITCH = 0.0042 / Math.max(0.6, DET);
    const dash = (p, n, t, hl, hw) => {
      const sv = V3().crossVectors(n, t).normalize(), b = ST.pos.length / 3, c = p.clone().addScaledVector(n, 0.0005);
      for (const [a, w] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const v = c.clone().addScaledVector(t, a * hl).addScaledVector(sv, w * hw); ST.pos.push(v.x, v.y, v.z); ST.nor.push(n.x, n.y, n.z); ST.uv.push(0, 0); }
      ST.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    const stitch = (fn, n, hl, hw) => {               // fn(t in 0..1) -> { p, n }; n samples to measure the path
      const P = []; for (let i = 0; i <= n; i++) P.push(fn(i / n));
      let acc = PITCH / 2, L = 0;
      for (let i = 0; i < n; i++) { const d = P[i].p.distanceTo(P[i + 1].p), t = P[i + 1].p.clone().sub(P[i].p).normalize(); while (acc < L + d) { const u = (acc - L) / d; dash(P[i].p.clone().lerp(P[i + 1].p, u), P[i].n, t, hl || 0.0014, hw || 0.00045); acc += PITCH; } L += d; }
      return P;
    };
    const path = (fn, n) => { const P = []; for (let i = 0; i <= n; i++) P.push(fn(i / n)); return P; };
    const seam = (P, r) => addPart('boot', loft(tubeRings(P.map((e) => e.p.clone().addScaledVector(e.n, -r * 0.45)), P.map(() => r), 5)), wf, { out: AX });
    const ASTAY = 0.86;
    for (const sd of [-1, 1]) {
      for (const da of [0, 0.085]) stitch((t) => onShaft(lerp(B_TOP - 0.004, 0.112, t), sd * (ASTAY + da + 0.25 * sm(0.55, 1, t))), 40);                     // the edge of the eyelet stay
      seam(path((t) => onShaft(lerp(B_TOP + 0.004, 0.110, t), sd * (ASTAY - 0.07 + 0.25 * sm(0.55, 1, t))), 30), 0.0012);
      for (const da of [0.075, 0.125]) stitch((t) => onShaft(lerp(B_TOP - 0.004, 0.074, t), PI + sd * da), 40);                                               // the strap up the back
      seam(path((t) => onShaft(lerp(B_TOP + 0.004, 0.072, t), PI + sd * 0.165), 24), 0.0012);
      for (const dy of [0, 0.0042]) stitch((t) => onShaft(0.168 - dy - 0.098 * Math.pow(t, 1.6), PI - sd * (0.165 + 1.22 * Math.pow(t, 0.8))), 40);         // the heel counter
      seam(path((t) => onShaft(0.1725 - 0.098 * Math.pow(t, 1.6), PI - sd * (0.165 + 1.22 * Math.pow(t, 0.8))), 24), 0.0012);
      stitch((t) => onShaft(B_TOP - 0.0045, sd * lerp(ASTAY + 0.085, PI - 0.125, t)), 40);                                                                    // under the collar
    }
    for (const z of [0.1125, 0.1170]) stitch((t) => onFoot(z, lerp(0.03, PI - 0.03, t)), 40);                                                                   // the toe cap
    seam(path((t) => onFoot(0.1205, lerp(0.0, PI, t)), 24), 0.0014);
    { const q = (k) => { const [sd, z] = plan[((k % NO) + NO) % NO]; return V3(cx + sd * bHw(z) * 1.012, bTop(z) - 0.0032, zm + (z - zm) * 1.004); };            // the welt: bold stitches round the top edge of the sole
      stitch((t) => { const j = t * NO, j0 = Math.floor(j), f = j - j0, p = q(j0).lerp(q(j0 + 1), f), tg = q(j0 + 1).sub(q(j0)), n = V3(tg.z, 0, -tg.x).normalize(); if (n.dot(V3(p.x - cx, 0, p.z - zm)) < 0) n.negate(); return { p, n }; }, NO * 2, 0.0015, 0.0008); }
    addPart('stitch', ST, wf, { nor: ST.nor });
    // ---- eyelets and laces ----
    const NE = 10, EY = [0.2520, 0.2330, 0.2140, 0.1950, 0.1760, 0.1570, 0.1395, 0.1240, 0.1115, 0.1010], AE = 0.50;
    const eye = (k, sd) => { const e = onShaft(EY[k], sd * (AE + 0.10 * sm(0.16, 0.10, EY[k]))); e.p.addScaledVector(e.n, 0.0008); return e; };
    for (let k = 0; k < NE; k++) for (const sd of [-1, 1]) {
      const e = eye(k, sd), t1 = V3(0, 1, 0).cross(e.n).normalize(), t2 = V3().crossVectors(e.n, t1), ring = [];
      for (let j = 0; j <= 10; j++) { const a = (j / 10) * TAU; ring.push(e.p.clone().addScaledVector(t1, 0.0044 * Math.cos(a)).addScaledVector(t2, 0.0044 * Math.sin(a))); }
      addPart('eyelet', loft(tubeRings(ring, ring.map(() => 0.00155), 6)), wf, { out: e.p });
    }
    const lace = (a, b, lift, key) => { const m = a.p.clone().lerp(b.p, 0.5).addScaledVector(a.n.clone().add(b.n).normalize(), lift), pts = curvePts([a.p, m, b.p], 7); addPart(key || 'lace', loft(tubeRings(pts, pts.map(() => 0.0020), 6), { capA: true, capB: true }), wf, { out: m.clone().addScaledVector(a.n, -0.02) }); };
    for (let k = NE - 1; k > 0; k--) { lace(eye(k, -1), eye(k - 1, 1), 0.0125 + 0.0012 * (k % 2)); lace(eye(k, 1), eye(k - 1, -1), 0.0110 - 0.0012 * (k % 2)); }
    lace(eye(NE - 1, -1), eye(NE - 1, 1), 0.0075);
    // the bow at the top: a knot, two drooping loops and two tails with metal tips
    const K0 = onShaft(EY[0] + 0.003, 0), K = K0.p.clone().addScaledVector(K0.n, 0.007), tube = (key, pts, r, o) => addPart(key, loft(tubeRings(pts, pts.map(() => r), 6), o), wShin, { out: pts[Math.floor(pts.length / 2)].clone().add(V3(0, 0, -0.03)) });
    addPart('lace', spherePart(K, 0.0052, 0.0044, 0.0044, 10, 8), wShin, { out: K });
    for (const sd of [-1, 1]) {
      lace(eye(0, sd), { p: K, n: K0.n }, 0.003);
      const lp = []; for (let j = 0; j <= 14; j++) { const a = (j / 14) * TAU, w = (1 - Math.cos(a)) / 2; lp.push(V3(K.x + sd * (0.003 + 0.047 * w), K.y - 0.024 * w + 0.013 * Math.sin(a) * (1 - 0.3 * w), K.z + 0.004 + 0.012 * w - 0.02 * w * w)); }
      tube('lace', lp, 0.0020);
      const tl = curvePts([K.clone(), V3(K.x + sd * 0.016, K.y - 0.026, K.z + 0.010), V3(K.x + sd * (0.026 + 0.004 * s * sd), K.y - 0.058, K.z + 0.008), V3(K.x + sd * 0.030, K.y - 0.084, K.z + 0.004)], 10);
      tube('lace', tl, 0.0020);
      const e0 = tl[tl.length - 1], e1 = e0.clone().add(e0.clone().sub(tl[tl.length - 2]).normalize().multiplyScalar(0.013));
      tube('aglet', [e0, e1], 0.0026, { capA: true, capB: true });
    }
    // ---- the sock: a ribbed cuff showing above the collar ----
    const SK_Y = [[0.246, 0], [0.262, 0.0], [0.300, 0.0005], [0.3045, 0.0], [0.3060, -0.0016], [0.3040, -0.0034], [0.298, -0.0040]], sr = [];
    for (const [y, d] of SK_Y) sr.push(ringXZ(cx, y, -0.0065, 0.0396 + d, 0.0418 + d, 0.0478 + d, NU, 2.1));
    const sock = loft(sr, { uS: 1 }); for (let i = 0; i < sock.pos.length / 3; i++) sock.uv[i * 2 + 1] = cl((sock.pos[i * 3 + 1] - 0.246) / 0.060, 0, 1);
    addPart('sock', sock, wShin, { out: V3(cx, 0.28, -0.0065) });
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
    const h = (opts.handGrid || 0.00125) / (DET * DET);      // 1.25 mm cells at full detail, 2.2 mm on phones
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
      const nb = G.wB[v], nw = G.wW[v], w = []; for (let k = 0; k < nb.length; k++) w.push(BI[(nb[k] === 'farm' ? 'ftwC' : nb[k]) + S], nw[k]); wts[i] = w;      // above the wrist the hand's skin belongs to the last twist bone, which turns with it
    }
    let idx = G.idx;
    if (s > 0) { idx = idx.slice(); for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } }      // the mirrored hand winds the other way
    addPart(HANDP ? 'hand' : 'skin', { pos, uv: HANDP ? G.uv : null, idx }, (x, y, z, i) => wts[i], { nor });
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

  // ---------- her bracelets are strung now that her hands exist (see 30_body.js) ----------
  for (const f of braceletLater) f();

  // ---------- head: a sculpted oval with soft features; the face itself is painted (and repainted to blink) ----------
  const HC = V3(0, 1.555, 0.002), HR = { x: 0.0700, yT: 0.092, yB: 0.1414, zF: 0.0985, zB: 0.083 };     // skull: lower crown and shallower back, as in her profile
  const LAY = (BAKED && BAKED.layout) || {};          // where the features sit in the painted face
  const FC = { eyeY: LAY.eyeY || 1.5246, eyeX: LAY.eyeX || 0.0304, ew: 0.0135, eh: 0.0056, browY: LAY.browY || 1.5368, noseY: LAY.noseY || 1.4877, mouthY: LAY.mouthY || 1.4586 };
  const FACE = { x0: -0.1, x1: 0.1, y0: 1.385, y1: 1.585 };          // the face canvas covers this window, seen from the front
  // The face is set out from her paintings. Its outline comes from the front view (08): the half width at each height.
  // Its profile comes from the side view (07), read off at 1500 pixels a metre with the tip of the nose as the fixed point:
  // FACE_MID is the middle line with the nose and lips taken away [height, metres forward of the ear line], NOSE is how far the
  // nose stands out from it, and FACE_V says how the face turns back toward the ears at each height (0: round like an egg;
  // more: straighter from chin to jaw, the way a jaw is; less than 0: flat across, the way a brow is).
  const FACE_MID = [[1.4211, 0.0977], [1.4265, 0.0989], [1.4304, 0.0992], [1.4318, 0.0992], [1.4372, 0.0987], [1.4409, 0.0987], [1.4425, 0.0992], [1.4479, 0.1008], [1.4525, 0.1015], [1.4532, 0.1015], [1.4586, 0.1025], [1.4639, 0.1038], [1.4679, 0.1041], [1.4693, 0.1043], [1.4747, 0.1051], [1.4785, 0.1049], [1.4800, 0.1046], [1.4854, 0.1039], [1.4907, 0.1032], [1.4961, 0.1026], [1.5014, 0.1019], [1.5068, 0.1013], [1.5122, 0.1007], [1.5175, 0.1001], [1.5229, 0.0995], [1.5282, 0.0988], [1.5310, 0.0984], [1.5336, 0.0983], [1.5389, 0.0988], [1.5443, 0.0991], [1.5496, 0.0990], [1.5550, 0.0986]];
  const NOSE = [[1.4785, 0.0000], [1.4818, 0.0019], [1.4851, 0.0099], [1.4883, 0.0145], [1.4916, 0.0169], [1.4936, 0.0176], [1.4949, 0.0176], [1.4982, 0.0163], [1.5015, 0.0135], [1.5048, 0.0102], [1.5080, 0.0080], [1.5113, 0.0061], [1.5146, 0.0043], [1.5179, 0.0026], [1.5212, 0.0010], [1.5244, 0.0000], [1.5277, 0.0000], [1.5310, 0.0000]];
  const NOSE_W = [[1.4785, 0.0052], [1.4857, 0.0054], [1.4894, 0.0070], [1.4966, 0.0100], [1.5038, 0.0082], [1.5147, 0.0062], [1.5310, 0.0058]];
  const LIPS = {uy: 1.4679, ua: 0.003, ly: 1.4525, la: 0.0033, chinY: 1.4304, cheekY: 1.4975, hollowY: 1.4669999999999999};
  const FACE_V = [[1.4150, 0.20], [1.4300, 0.26], [1.4450, 0.26], [1.4586, 0.20], [1.4760, 0.06], [1.4975, -0.08], [1.5246, -0.14], [1.5400, -0.10], [1.5550, 0]];      // her face is rounder than the Jester's: fuller cheeks and jaw as it turns (C3 at 34 degrees)
  // how wide a ring of the lower head is, from 1 at the cheeks to 0 under the chin: the last tenth closes quickly, so the jaw has an edge and a flat underside
  const SIN9 = Math.sqrt(1 - 0.81), SN9 = Math.pow(SIN9, 0.42), snLow = (sp, t) => (t > 0.9 ? SN9 * Math.pow(sp / SIN9, 0.40) : Math.pow(sp, 0.42));
  const T_CHIN = (HC.y - FACE_MID[0][0]) / HR.yB, SN_CHIN = snLow(Math.sqrt(1 - T_CHIN * T_CHIN), T_CHIN), RZ_CHIN = FACE_MID[0][1] - 0.050 * T_CHIN * T_CHIN * T_CHIN;
  // Chris, 12 Nov: her forehead was a little tall. The top of the head comes down half an inch (12.7 mm on her, 13.1 here before the head is scaled):
  // everything above the brow slides down, the brow and all below it stay where they were. The hairline, hair and costume ears come down with it.
  const FORE_DROP = 0.0131;
  // the underside of her jaw by depth [metres forward of the ear line, height]: nape, under the ear lobe, the corner of the jaw, then the long run forward to the chin
  const JAW = [[-0.060, 1.490], [-0.030, 1.484], [0.004, 1.472], [0.022, 1.452], [0.040, 1.432], [0.052, 1.4200], [0.090, 1.4140], [0.130, 1.4100]];
  function headPoint(a, ph, grow) {                 // a: angle from the front toward her left; ph: 0 at the crown, PI at the chin
    const yn = Math.cos(ph), s = Math.sin(a), c = Math.cos(a), g = grow || 0, t = Math.max(0, -yn), sn = yn < 0 ? snLow(Math.sin(ph), t) : Math.sin(ph);
    let y = (yn >= 0 ? HR.yT : HR.yB) * yn + g * yn; const Y = HC.y + (yn >= 0 ? HR.yT : HR.yB) * yn;
    const x = ((HR.x * sn) * (1 - 0.08 * sm(0.5, 1.0, t)) + g * Math.min(1, sn * 3)) * s;      // the outline from the front, narrowing to the jaw
    const zc = 0.050 * t * t * t;                   // the lower head sits forward, so the chin hangs under the mouth; the corners of the jaw stay back near the ears
    let z;
    if (c < 0) z = zc * (1 - 0.95 * sm(0, -0.9, c)) + (HR.zB + g) * sn * c;      // only the face comes forward: the back of the head runs straight down into the nape
    else {
      const rz = (yn >= 0 ? HR.zF * sn : t > T_CHIN ? RZ_CHIN * sn / SN_CHIN : spline(FACE_MID, Y) - zc) + g * Math.min(1, sn * 3), v = yn >= 0 ? 0 : spline(FACE_V, Y), s2 = s * s;
      z = zc + rz * (c - v * s2 * Math.pow(c, 1.5));
      if (!g && yn < 0.35) {
        const f = c, ax = Math.abs(x), G = (dx, dy, wx, wy) => Math.exp(-Math.pow(dx / wx, 2) - Math.pow(dy / wy, 2));
        let d = 0; const NT = FC.noseY;
        // nose: the bridge and the ball of the tip, the wings of the nostrils, the folds where they meet the cheek, the hollows under it
        if (Y > NOSE[0][0] && Y < NOSE[NOSE.length - 1][0]) d += spline(NOSE, Y) * Math.exp(-Math.pow(x / spline(NOSE_W, Y), 2));
        d += 0.0062 * G(ax - 0.0116, Y - (NT - 0.0054), 0.0052, 0.0052) - 0.0014 * G(ax - 0.0186, Y - (NT - 0.0040), 0.0030, 0.0066) - 0.0030 * G(ax - 0.0062, Y - (NT - 0.0096), 0.0030, 0.0021);
        d -= 0.0064 * G(ax - FC.eyeX, Y - FC.eyeY, 0.017, 0.0105) + 0.0028 * G(ax - 0.014, Y - (FC.eyeY - 0.002), 0.007, 0.010);   // eye sockets, deepest beside the bridge
        d += 0.0034 * G(ax - 0.028, Y - (FC.browY + 0.002), 0.027, 0.0075);                        // brow
        d += 0.0036 * G(ax - FC.eyeX, Y - FC.eyeY, 0.0112, 0.0064) - 0.0012 * G(ax - FC.eyeX, Y - (FC.eyeY + 0.0088), 0.014, 0.0024) - 0.0008 * G(ax - FC.eyeX, Y - (FC.eyeY - 0.0090), 0.013, 0.0024);   // the eyeball rounding out of its socket, and the crease of the lid above it
        d += 0.0040 * G(ax - 0.046, Y - LIPS.cheekY, 0.020, 0.016) - 0.0022 * G(ax - 0.050, Y - LIPS.hollowY, 0.016, 0.014);   // cheekbones, and the hollow under them
        d -= 0.0010 * G(x, Y - (FC.mouthY + 0.0135), 0.0034, 0.0055);                             // the groove under the nose
        d += LIPS.ua * G(x, Y - LIPS.uy, 0.020, 0.0054) + LIPS.la * G(x, Y - LIPS.ly, 0.016, 0.0054);  // lips
        d -= 0.0016 * G(ax - 0.024, Y - FC.mouthY, 0.006, 0.008);                                 // corners of the mouth
        d += 0.0026 * G(x, Y - LIPS.chinY, 0.017, 0.0095);                                            // the ball of the chin
        z += d * f;
      }
    }
    if (t > 0.86) y += 0.10 * Math.max(0, 0.083 - z) * sm(0.86, 0.985, t);        // under the jaw the skin rises toward the throat
    if (!g && yn < 0) { const yb = spline(JAW, z) - HC.y, e = 0.0060; y = 0.5 * (y + yb + Math.sqrt((y - yb) * (y - yb) + e * e)); }     // her jawline (C3, profile): nothing of the head hangs below it
    const Yw = HC.y + y; return [HC.x + x, Yw - FORE_DROP * sm(1.545, 1.580, Yw), HC.z + z];
  }
  const wHead = wOne('head'), faceMix = [], faceUvS = [];
  (function buildHead() {
    const NU = Q(256, 84), NV = Q(168, 60), rings = [];        // most of the rings, and most of the columns, are spent on the face
    for (let i = 0; i <= NV; i++) {
      const u = i / NV, ph = u < 0.28 ? lerp(0.02, 1.45, u / 0.28) : lerp(1.45, PI - 0.02, (u - 0.28) / 0.72), ring = [];
      for (let j = 0; j < NU; j++) { const v = 2 * (j / NU) - 1; ring.push(headPoint(PI * (0.35 * v + 0.65 * v * v * v), ph)); }     // v = 0 is the middle of the face
      rings.push(ring);
    }
    const part = loft(rings, { capA: true, capB: true });
    // Depth only (Chris, 13 Nov: her face is perfect straight on and wrong from every other angle). Straight on, the painting does the work. Turned, the
    // shape under it shows, and it was too smooth: no eye sockets, a wide flat bridge to her nose, lips and chin that barely stood out, a flat shelf
    // under her jaw. Here each point of her face may move straight back or straight forward and nowhere else, so seen from in front nothing shifts and
    // the painting lands exactly where it did. (Under her jaw, which cannot be seen from in front, points also rise toward her neck.)
    // FACE_DEPTH (00_util.js): 1 is the full reshaping and what she wears since 13 Nov; 0 leaves her as she was before it.
    if (FACE_DEPTH) {
      const K = FACE_DEPTH, nor = computeNormals(part.pos, part.idx), EY = FC.eyeY, EX = FC.eyeX, NY = FC.noseY, MY = FC.mouthY, BY = FC.browY;
      const g = (a, b) => Math.exp(-a * a - b * b);
      for (let i = 0; i < part.pos.length / 3; i++) {
        const x = part.pos[i * 3], y = part.pos[i * 3 + 1], z = part.pos[i * 3 + 2], ax = Math.abs(x), nz = nor[i * 3 + 2], ny = nor[i * 3 + 1];
        if (z > 0.02 && nz > 0.12) {
          let d = 0;
          d -= 0.0055 * g((ax - EX) / 0.0165, (y - EY) / 0.0105);                                                   // the socket her eye sits in
          d -= 0.0065 * g((ax - 0.0165) / 0.0065, (y - (EY - 0.001)) / 0.0085);                                     // deepest at the inner corner, beside the bridge of her nose
          d += 0.0026 * g((ax - EX) / 0.0105, (y - EY) / 0.0062);                                                   // the round of the eye itself
          d -= 0.0018 * g((ax - 0.034) / 0.014, (y - (EY + 0.0095)) / 0.0035);                                      // the hollow under her brow
          d += 0.0016 * g(0, (y - (BY + 0.001)) / 0.0055) * sm(0.006, 0.018, ax) * (1 - sm(0.046, 0.060, ax));      // her brow
          d += 0.0030 * g(x / 0.0058, 0) * sm(NY - 0.004, NY + 0.004, y) * (1 - sm(EY - 0.004, EY + 0.008, y));     // the ridge of her nose
          d -= 0.0058 * g((ax - 0.0170) / 0.0062, 0) * sm(NY - 0.002, NY + 0.010, y) * (1 - sm(EY - 0.012, EY - 0.002, y));     // its sides, which were a wide low mound
          d += 0.0022 * g((ax - 0.0138) / 0.0042, (y - (NY - 0.0015)) / 0.0050);                                    // the wings of her nostrils
          d -= 0.0020 * g((ax - 0.0205) / 0.0035, (y - (NY - 0.001)) / 0.0060);                                     // and the crease behind them
          d += 0.0012 * g((ax - 0.036) / 0.012, (y - (NY + 0.006)) / 0.010);                                        // the apples of her cheeks
          { const x0 = 0.0200, y0 = NY - 0.002, x1 = 0.0310, y1 = MY - 0.006, t = cl(((ax - x0) * (x1 - x0) + (y - y0) * (y1 - y0)) / ((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)), 0, 1), ds = Math.hypot(ax - (x0 + t * (x1 - x0)), y - (y0 + t * (y1 - y0)));
            d -= 0.0016 * Math.exp(-(ds / 0.0034) * (ds / 0.0034)); }                                                // the fold from her nose to the corner of her mouth, which was only painted
          d -= 0.0015 * g((ax - 0.046) / 0.010, (y - (MY + 0.004)) / 0.012);                                        // the hollow under them
          d += 0.0020 * g(x / 0.0135, (y - (MY + 0.0052)) / 0.0042);                                                // her upper lip
          d += 0.0022 * g(x / 0.0120, (y - (MY - 0.0045)) / 0.0040);                                                // her lower lip
          d -= 0.0010 * g(x / 0.0200, (y - MY) / 0.0014);                                                           // the line between them
          d -= 0.0016 * g((ax - 0.0265) / 0.0050, (y - (MY + 0.0005)) / 0.0050);                                    // the corners of her mouth
          d -= 0.0018 * g(x / 0.0140, (y - (MY - 0.0145)) / 0.0042);                                                // the fold under her lower lip
          d += 0.0022 * g(x / 0.0130, (y - (MY - 0.0300)) / 0.0075);                                                // her chin
          part.pos[i * 3 + 2] = z + K * d * sm(0.12, 0.45, nz);
        }
        // Under her jaw: the flat shelf slopes up toward her neck. Nothing moves at the jaw's own edge (which is what shows from in front), and the rise
        // grows smoothly behind it, so there is no step.
        if (ny < -0.15 && y < 1.475 && z > -0.03) part.pos[i * 3 + 1] = y + K * 0.015 * sm(0, 0.036, (0.092 - 0.9 * ax) - z) * sm(-0.15, -0.65, ny) * (1 - sm(1.440, 1.475, y)) * sm(-0.03, 0.0, z);
      }
    }
    for (let i = 0; i < part.pos.length / 3; i++) {   // planar projection from the front
      part.uv[i * 2] = (part.pos[i * 3] - FACE.x0) / (FACE.x1 - FACE.x0); part.uv[i * 2 + 1] = (part.pos[i * 3 + 1] - FACE.y0) / (FACE.y1 - FACE.y0);
    }
    const info = addPart('face', part, wHead, { out: HC });
    // which painting each point of the head wears: the front view where the skin faces forward, the profile view where it faces
    // sideways, and plain skin under the jaw and behind the ears, where neither painting can see
    const FB = buckets.face, MIXED = !!(BAKED && BAKED.faceSide), Wn = (BAKED && BAKED.faceSideWin) || [-0.01, 0.13, 1.40, 1.58];
    for (let i = info.start; i < info.start + info.count; i++) {
      const nx = FB.nor[i * 3], ny = FB.nor[i * 3 + 1], px = FB.pos[i * 3], py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2];
      const jf = spline(JAW, pz - HC.z), under = sm(-0.22, -0.66, ny) * sm(jf + 0.014, jf + 0.004, py), plain = Math.max(under, sm(0.010, -0.006, pz - HC.z));      // only under the jaw: the nose and lips have undersides too, and keep their paint
      const side = sm(0.70, 0.93, Math.abs(nx)) * sm(0.034, 0.050, Math.abs(px)) * sm(Wn[0] + 0.004, Wn[0] + 0.022, pz) * sm(Wn[2] + 0.002, Wn[2] + 0.014, py) * sm(Wn[3] - 0.002, Wn[3] - 0.014, py) * (1 - plain);
      faceMix.push(side, plain, 1 - 0.40 * under); faceUvS.push((pz - Wn[0]) / (Wn[1] - Wn[0]), (py - Wn[2]) / (Wn[3] - Wn[2]));
    }
    // neck
    const np = [V3(0, 1.30, -0.014), V3(0, 1.345, -0.012), V3(0, 1.40, -0.006), V3(0, 1.45, 0)], nr = [0.050, 0.046, 0.043, 0.046];
    const nrings = tubeRings(curvePts(np, 8), [0.029, 0.028, 0.026, 0.025, 0.025, 0.025, 0.026, 0.028], Q(24, 12), V3(0, 0, 1));
    const nk = addPart(MIXED ? 'face' : 'skin', loft(nrings), (x, y) => { const u = sm(1.33, 1.37, y), v = sm(1.385, 1.43, y); return [BI.spine3, 1 - u, BI.neck, u * (1 - v), BI.head, u * v]; }, { out: V3(0, 1.38, -0.01) });
    if (MIXED) for (let i = nk.start; i < nk.start + nk.count; i++) { faceMix.push(0, 1, 1 - 0.38 * sm(1.330, 1.428, FB.pos[i * 3 + 1])); faceUvS.push(0, 0); }     // the neck is plain skin, dim where the jaw shades it
  })();

  // the face canvas: eyes (0 open .. 1 closed), mouth ('rest', 'open', 'smile'), glow (spell light in her eyes)
  const faceC = cvs(Math.round(1024 * TEXS), Math.round(1024 * TEXS)), faceT = ctex(faceC);
  const faceState = { eyes: -1, mouth: '', glow: -1 }, bakedFace = { base: null, parts: {} }, lastFace = [0, 'rest', 0];
  // her talking mouths, none showing teeth: each time her mouth opens it takes the next one
  const TALK = ['oh', 'oh2', 'oh', 'oh3'].filter((n) => BAKED && BAKED.faceParts && BAKED.faceParts[n]); if (!TALK.length) TALK.push('oh'); let talkN = 0;
  function paintFace(eyes, mouth, glow) {
    lastFace[0] = eyes; lastFace[1] = mouth; lastFace[2] = glow;
    const q = Math.round(eyes * 4) / 4, gq = Math.round((glow || 0) * 4) / 4;
    if (q === faceState.eyes && mouth === faceState.mouth && gq === faceState.glow) return;
    if (mouth === 'open' && faceState.mouth !== 'open') talkN++;
    faceState.eyes = q; faceState.mouth = mouth; faceState.glow = gq;
    const W = faceC.width, H = faceC.height, g = faceC.getContext('2d'), k = W / 0.2, u = k / 1000;     // k: pixels per meter; u: per millimeter
    const X = (x) => (x - FACE.x0) / (FACE.x1 - FACE.x0) * W, Y = (y) => (1 - (y - FACE.y0) / (FACE.y1 - FACE.y0)) * H;
    if (bakedFace.base) {                           // the painted face, with the painted eyes or mouth for this state set into it
      g.drawImage(bakedFace.base, 0, 0, W, H);
      const put = (n) => { const im = bakedFace.parts[n], r = BAKED.faceParts[n]; if (im) g.drawImage(im, r.x * W, r.y * H, r.w * W, r.h * H); };
      if (q >= 0.75) put('shut'); else if (q >= 0.25) put('half');
      if (mouth === 'open') put(TALK[talkN % TALK.length]); else if (mouth === 'smile') put('smile');
      if (gq > 0 && q < 0.75) for (const e of BAKED.faceEyes) {
        const r = 0.0078 * k, gg = g.createRadialGradient(e[0] * W, e[1] * H, 0, e[0] * W, e[1] * H, r);
        gg.addColorStop(0, rgba('#f0c8ff', 0.95 * gq)); gg.addColorStop(0.55, rgba(PAL.violet, 0.75 * gq)); gg.addColorStop(1, rgba(PAL.violet, 0));
        g.fillStyle = gg; g.beginPath(); g.arc(e[0] * W, e[1] * H, r, 0, TAU); g.fill();
      }
      faceT.needsUpdate = true; return;
    }
    g.fillStyle = PAL.skin; g.fillRect(0, 0, W, H);
    const soft = (x, y, rx, ry, col, a) => {
      g.save(); g.translate(X(x), Y(y)); g.scale(rx * k, ry * k);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore();
    };
    const EY = FC.eyeY, EX = FC.eyeX, NY = FC.noseY, MY = FC.mouthY;
    // warm light on the middle of the face, rose shade toward its edges, the cap's shadow across the brow
    soft(0, NY + 0.012, 0.058, 0.060, '#ffe0c6', 0.6); soft(0, 1.415, 0.07, 0.03, '#e0a088', 0.5);
    soft(0, 1.566, 0.14, 0.030, '#8a4a50', 0.7);
    for (const sx of [-1, 1]) { soft(sx * 0.094, NY + 0.02, 0.030, 0.10, '#c47a72', 0.6); soft(sx * 0.060, MY - 0.006, 0.034, 0.030, '#d08a7c', 0.4); soft(sx * 0.047, NY + 0.006, 0.027, 0.018, PAL.blush, 0.5); }
    soft(0, 1.400, 0.06, 0.018, '#c47a72', 0.55);
    soft(0, NY - 0.004, 0.0075, 0.0058, '#e8948a', 0.5);                    // a rosy nose tip, as in the sprite
    soft(0, NY - 0.0115, 0.0085, 0.0036, '#b06e66', 0.5);
    soft(0, MY - 0.0118, 0.012, 0.004, '#c08074', 0.4);
    soft(0, NY + 0.022, 0.004, 0.017, '#fff0e2', 0.45);
    for (const sx of [-1, 1]) {
      const ew = FC.ew * k, eh = FC.eh * (1 - q) * k, px = X(sx * EX), py = Y(EY);
      soft(sx * (EX + 0.001), EY - 0.001, 0.031, 0.021, '#4a2238', 0.62);   // smoked shadow all round the eye
      soft(sx * (EX + 0.004), EY - 0.011, 0.024, 0.012, '#3a1a2c', 0.5);
      g.save(); g.translate(px, py); g.scale(sx, 1);
      if (q < 0.99) {
        g.beginPath(); g.moveTo(-ew, 1.0 * u);       // a heavy-lidded almond: flat on top, outer corner lifted
        g.bezierCurveTo(-ew * 0.55, -eh * 1.05, ew * 0.4, -eh * 1.2, ew, -2.2 * u);
        g.bezierCurveTo(ew * 0.5, eh * 1.05, -ew * 0.5, eh * 0.95, -ew, 1.0 * u); g.closePath();
        g.save(); g.clip();
        g.fillStyle = '#b89c9c'; g.fillRect(-ew, -eh * 2, ew * 2, eh * 4);
        const ir = 14.5 * u, iy = -1.0 * u, ig = g.createRadialGradient(0, iy, ir * 0.1, 0, iy, ir);   // the lid cuts the top of a large dark iris
        ig.addColorStop(0, '#140a0e'); ig.addColorStop(0.55, '#2c151c'); ig.addColorStop(0.85, '#472229'); ig.addColorStop(1, '#12080b');
        g.fillStyle = ig; g.beginPath(); g.arc(0, iy, ir, 0, TAU); g.fill();
        dot(g, 0, iy, ir * 0.5, '#080405');
        if (gq > 0) { const gg = g.createRadialGradient(0, iy, 0, 0, iy, ir); gg.addColorStop(0, rgba('#f0c8ff', 0.95 * gq)); gg.addColorStop(0.6, rgba(PAL.violet, 0.8 * gq)); gg.addColorStop(1, rgba(PAL.violet, 0)); g.fillStyle = gg; g.beginPath(); g.arc(0, iy, ir, 0, TAU); g.fill(); }
        dot(g, -ir * 0.36, iy - ir * 0.05, ir * 0.2, 'rgba(255,255,255,0.95)');
        const sh = g.createLinearGradient(0, -eh * 1.2, 0, eh * 0.2); sh.addColorStop(0, 'rgba(24,8,20,0.8)'); sh.addColorStop(1, 'rgba(24,8,20,0)'); g.fillStyle = sh; g.fillRect(-ew, -eh * 1.4, ew * 2, eh * 1.6);
        g.restore();
      }
      const op = Math.max(eh, 0.6 * u);
      g.strokeStyle = '#0e070c'; g.lineCap = 'round'; g.lineJoin = 'round';
      g.lineWidth = 4.6 * u; g.beginPath(); g.moveTo(-ew * 1.04, 1.3 * u);            // the thick upper lash line and its wing
      if (q < 0.99) g.bezierCurveTo(-ew * 0.55, -op * 1.1, ew * 0.4, -op * 1.25, ew * 1.05, -2.6 * u);
      else g.bezierCurveTo(-ew * 0.5, 4.2 * u, ew * 0.45, 4.0 * u, ew * 1.05, -0.8 * u);
      g.lineTo(ew * 1.34, -5.4 * u); g.stroke();
      if (q < 0.99) { g.lineWidth = 1.7 * u; g.strokeStyle = 'rgba(20,8,16,0.9)'; g.beginPath(); g.moveTo(-ew * 0.8, op * 0.7); g.bezierCurveTo(-ew * 0.2, op * 1.08, ew * 0.5, op * 1.05, ew, -1.8 * u); g.stroke(); }
      // run mascara: three short drips from the lower lash, the middle one longest
      g.strokeStyle = 'rgba(20,8,16,0.88)';
      for (const [dx, y0, y1, lw] of [[-0.42, 9.5, 17, 2.6], [0.02, 10.5, 26, 3.4], [0.46, 9.5, 19.5, 2.7]]) { g.lineWidth = lw * u; g.beginPath(); g.moveTo(ew * dx, (q < 0.99 ? y0 : y0 - 4) * u); g.lineTo(ew * (dx + 0.03), y1 * u); g.stroke(); }
      soft(sx * EX, EY - 0.0125, 0.017, 0.007, '#3a1a2c', 0.4);
      // brow: thick, dark, close over the eye, falling a little toward the outside
      g.strokeStyle = '#1a0e12'; g.lineWidth = 5.4 * u; const by = -(FC.browY - EY) * k;
      g.beginPath(); g.moveTo(-ew * 0.95, by - 1.2 * u); g.quadraticCurveTo(ew * 0.1, by - 3.4 * u, ew * 1.12, by + 1.6 * u); g.stroke();
      g.restore();
    }
    // lips: small, rose, the lower one full
    const lw = 15.2 * u, up = mouth === 'smile' ? -2.0 * u : 0;
    g.save(); g.translate(X(0), Y(MY));
    g.fillStyle = PAL.lip; g.beginPath(); g.moveTo(-lw, up);
    g.bezierCurveTo(-lw * 0.5, -4.6 * u, -lw * 0.14, -5.6 * u, 0, -3.4 * u);
    g.bezierCurveTo(lw * 0.14, -5.6 * u, lw * 0.5, -4.6 * u, lw, up);
    g.bezierCurveTo(lw * 0.55, 10.2 * u, -lw * 0.55, 10.2 * u, -lw, up); g.closePath(); g.fill();
    const hg = g.createRadialGradient(0, 3.8 * u, 0, 0, 3.8 * u, lw * 0.62); hg.addColorStop(0, 'rgba(244,150,150,0.7)'); hg.addColorStop(1, 'rgba(244,150,150,0)'); g.fillStyle = hg; g.fill();
    g.strokeStyle = '#5a1c2a'; g.lineWidth = 1.4 * u; g.beginPath(); g.moveTo(-lw, up);
    if (mouth === 'open') { g.bezierCurveTo(-lw * 0.4, 0.5 * u, lw * 0.4, 0.5 * u, lw, up); g.stroke(); g.fillStyle = '#3a0f1c'; g.beginPath(); g.ellipse(0, 1.5 * u, lw * 0.5, 2.8 * u, 0, 0, TAU); g.fill(); }
    else { g.bezierCurveTo(-lw * 0.4, 1.6 * u - up * 0.2, lw * 0.4, 1.6 * u - up * 0.2, lw, up); g.stroke(); }
    g.restore();
    faceT.needsUpdate = true;
  }
  paintFace(0, 'rest', 0);
  const repaintFace = () => { faceState.eyes = -1; paintFace(lastFace[0], lastFace[1], lastFace[2]); };
  onBaked('face', (im) => { bakedFace.base = im; repaintFace(); });
  if (BAKED && BAKED.faceParts) for (const n in BAKED.faceParts) onBaked('facePart_' + n, (im) => { bakedFace.parts[n] = im; repaintFace(); }, BAKED.faceParts[n].src);

  // ---------- hair: black, framing the face beneath the cap and falling down the back under the veils ----------
  (function buildHair() {
    const NU = Q(84, 36), NR = Q(18, 10), rings = [];
    for (let i = 0; i <= NR; i++) {                 // a curtain round the sides and back of the head: out from under the cap, in against the neck, down to the ruff
      const u = i / NR, ring = [];
      for (let j = 0; j <= NU; j++) {
        const f = j / NU, a = lerp(0.50 * PI, 1.50 * PI, f), back = Math.pow(Math.sin(f * PI), 0.5), y = lerp(1.50, lerp(1.404, 1.390, back) + 0.004 * Math.sin(j * 1.7), u);
        const k = sm(1.398, 1.455, y), up = cl((y - 1.455) / 0.045, 0, 1), lock = (0.0014 * Math.sin(j * 2.1 + i * 0.35) + 0.0008 * Math.sin(j * 0.7)) * (1 - up);
        const rx = (y > 1.455 ? lerp(0.0570, 0.0695, up) : lerp(0.0490, 0.0570, k)) + lock, rz = (y > 1.455 ? lerp(0.0710, 0.0840, up) : lerp(0.0600, 0.0710, k)) + lock;
        ring.push([rx * Math.sin(a), y, 0.004 + rz * Math.cos(a)]);
      }
      rings.push(ring);
    }
    addPart('hair', loft(rings, { open: true, vS: 2, uS: 9 }), (x, y) => { const v = sm(1.40, 1.47, y); return [BI.head, v, BI.neck, (1 - v) * 0.5, BI.spine3, (1 - v) * 0.5]; }, { out: V3(0, 1.5, 0) });
  })();


  // ---------- the jester cap: quilted black velvet, two great stuffed horns ----------
  const CAP_EDGE = [[-1, 1.432], [-0.3, 1.440], [0, 1.452], [0.276, 1.482], [0.446, 1.5246], [0.62, 1.553], [0.78, 1.5615], [1, 1.5625]];   // [cos of the angle from the front, height]: level across the brow, down in front of the ears, low round the back
  const capEdge = (a) => { const c = Math.cos(a); for (let i = 1; i < CAP_EDGE.length; i++) if (c <= CAP_EDGE[i][0]) { const p = CAP_EDGE[i - 1], q = CAP_EDGE[i]; return lerp(p[1], q[1], (c - p[0]) / (q[0] - p[0])); } return 1.5625; };
  (function buildCap() {
    const NU = Q(96, 40), NV = Q(28, 12), rings = [], g = 0.0075;
    for (let i = 0; i <= NV; i++) {
      const ring = [];
      for (let j = 0; j < NU; j++) {
        const a = PI + (j / NU) * TAU, yE = capEdge(a), phE = Math.acos(cl((yE - HC.y) / (yE >= HC.y ? HR.yT : HR.yB), -1, 1));
        const ph = lerp(0.03, phE, Math.pow(i / NV, 0.9)), p = headPoint(a, ph, g + 0.0035 * Math.max(0, Math.sin((j / NU) * TAU * 6)) * Math.sin(ph) * 0.0);
        ring.push(p);
      }
      rings.push(ring);
    }
    // roll the edge under so the cap has thickness
    const last = rings[rings.length - 1];
    rings.push(last.map((p, j) => { const a = PI + (j / NU) * TAU; return [p[0] * 1.03, p[1] - 0.006, HC.z + (p[2] - HC.z) * 1.03]; }));
    rings.push(last.map((p, j) => [p[0] * 0.965, p[1] - 0.004, HC.z + (p[2] - HC.z) * 0.965]));
    addPart('cap', loft(rings, { capA: true }), wHead, { out: HC });
  })();
  function capTex() {
    const S = Math.round(1024 * TEXS), c = cvs(S, S), g = c.getContext('2d');
    g.fillStyle = '#2e252b'; g.fillRect(0, 0, S, S);
    blobs(g, S, S, 300, ['#4e404a'], S * 0.01, S * 0.06, 0.05, 0.18);
    blobs(g, S, S, 200, ['#000000'], S * 0.02, S * 0.08, 0.1, 0.3);
    g.strokeStyle = 'rgba(70,62,78,0.5)'; g.lineWidth = S / 300;
    for (let i = 0; i < 12; i++) { const x = (i / 12) * S; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }   // quilting seams
    // brim band
    const bg = g.createLinearGradient(0, S * 0.09, 0, 0); bg.addColorStop(0, 'rgba(60,52,68,0)'); bg.addColorStop(1, 'rgba(60,52,68,0.7)'); g.fillStyle = bg; g.fillRect(0, 0, S, S * 0.09);
    return ctex(c);
  }
  // horns: [x, y, z] control points for her left; the right is mirrored. Each has a chain of bones so it can sway.
  // They leave the head thick, arc over low and flop down, thinning to a point where the pompom hangs (Chris, November 11, after the flipbook).
  const HORN_CTRL = [[0.030, 1.610, -0.004], [0.078, 1.652, -0.012], [0.140, 1.672, -0.018], [0.206, 1.664, -0.020], [0.258, 1.630, -0.014], [0.288, 1.578, -0.008], [0.297, 1.528, -0.002], [0.295, 1.492, 0.0]];
  const HORN_R = [0.070, 0.066, 0.057, 0.045, 0.034, 0.024, 0.016, 0.011];
  const HORN_N = 6, hornChains = {};
  for (const [S, s] of SIDES) {
    const ctrl = HORN_CTRL.map((p) => V3(s * p[0], p[1], p[2])), N = Q(64, 32), pts = curvePts(ctrl, N);
    // bones along the curve; the last carries the pompom
    const chain = []; let par = 'head';
    for (let k = 0; k < HORN_N; k++) { const p = pts[Math.round((0.06 + 0.94 * k / HORN_N) * (N - 1))]; addBone('horn' + k + S, par, p.x, p.y, p.z); par = 'horn' + k + S; chain.push(par); }
    const tip = pts[N - 1], pc = V3(tip.x, tip.y - 0.058, tip.z + 0.002);        // the pompom hangs from the very tip
    addBone('pom' + S, par, tip.x, tip.y, tip.z); chain.push('pom' + S);
    hornChains[S] = { names: chain, pom: pc };
    const rad = pts.map((p, i) => { const u = i / (N - 1); return crom(HORN_R, u * (HORN_R.length - 1)) * (1 + 0.045 * Math.pow(Math.abs(Math.sin(u * PI * 11)), 1.5) - 0.02); });
    const NU = Q(28, 14), rings = tubeRings(pts, rad, NU, V3(0, 0, 1));
    const ts = pts.map((p, i) => i / (N - 1));
    const wf = (x, y, z, i) => {
      const u = ts[Math.min(N - 1, Math.floor(i / (NU + 1)))], f = cl((u - 0.06) / 0.94 * HORN_N, 0, HORN_N - 1e-4), k = Math.floor(f), fr = sm(0.15, 0.85, f - k);
      if (u < 0.10) { const b = sm(0.0, 0.10, u); return [BI.head, 1 - b, BI['horn0' + S], b]; }
      return k >= HORN_N - 1 ? [BI['horn' + (HORN_N - 1) + S], 1] : [BI['horn' + k + S], 1 - fr, BI['horn' + (k + 1) + S], fr];
    };
    addPart('velvet', loft(rings, { capB: true, vS: 5, uS: 2 }), wf, { out: centroidOf(rings) });
  }

  // ---------- fur: a dark core covered in short tufts (the pompoms and the collar) ----------
  function tufts(key, n, basePt, wf, len, wid) {     // basePt(i) -> { p: Vector3, n: Vector3 }
    const pos = [], uv = [], idx = [];
    for (let i = 0; i < n; i++) {
      const { p, n: nm } = basePt(i), t = V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5); t.addScaledVector(nm, -t.dot(nm)).normalize();
      const b = V3().crossVectors(nm, t), dir = nm.clone().addScaledVector(t, rr(-0.55, 0.55)).addScaledVector(b, rr(-0.55, 0.55)).normalize();
      const L = len * rr(0.6, 1.25), w = wid * rr(0.7, 1.2), k = pos.length / 3, tip = p.clone().addScaledVector(dir, L);
      for (let j = 0; j < 3; j++) { const a = (j / 3) * TAU, q = p.clone().addScaledVector(t, Math.cos(a) * w).addScaledVector(b, Math.sin(a) * w); pos.push(q.x, q.y, q.z); uv.push(j / 3, 0); }
      pos.push(tip.x, tip.y, tip.z); uv.push(0.5, 1);
      idx.push(k, k + 1, k + 3, k + 1, k + 2, k + 3, k + 2, k, k + 3);
    }
    addPart(key, { pos, uv, idx }, wf, { weld: false });
  }
  for (const [S, s] of SIDES) {
    const c = hornChains[S].pom, R = 0.066, wf = wOne('pom' + S);
    addPart('fur', spherePart(c, R * 0.86, R * 0.86, R * 0.86, 20, 14), wf, { out: c });
    tufts('fur', Q(2600, 1000), () => { const d = V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(); return { p: c.clone().addScaledVector(d, R * 0.86), n: d }; }, wf, 0.013, 0.0058);
    // the short cord that ties the pompom to the horn tip
    const tipB = SK['pom' + S].userData.rest;
    addPart('velvet', loft(tubeRings([tipB.clone(), c.clone().lerp(tipB, 0.5), c.clone()], [0.010, 0.008, 0.010], 8)), wf, { out: c.clone().lerp(tipB, 0.5).add(V3(0.05, 0, 0)) , weld: true });
  }
  (function buildCollar() {                           // the ruff at her throat: three stacked frills of pleated black organza
    const C = V3(0, 1.362, -0.006), wf = (x, y) => { const u = sm(1.33, 1.40, y); return [BI.neck, 0.6 + 0.4 * u, BI.spine3, 0.4 * (1 - u)]; };
    // each frill is a soft roll of gathered organza: a ring whose outer face is pleated into rounded folds
    const NP = 25, NA = NP * Q(8, 4), NS = Q(12, 8);
    for (const [yc, Rm, r0, phs] of [[1.3440, 0.0655, 0.0150, 0.0], [1.3670, 0.0630, 0.0143, 1.9], [1.3880, 0.0585, 0.0128, 3.7]]) {
      const rings = [];
      for (let i = 0; i < NS; i++) {
        const f = (i / NS) * TAU, cf = Math.cos(f), sf = Math.sin(f), ring = [];
        for (let j = 0; j < NA; j++) {
          const a = (j / NA) * TAU, th = a * NP + phs + 0.5 * Math.sin(a * 3 + phs), out = Math.max(0, cf);
          const rr = r0 * (1 + out * (0.34 * Math.sin(th) + 0.10 * Math.sin(2.3 * th + 1)) + 0.05 * Math.sin(a * 5 + phs)), R = Rm + rr * cf * 1.15;
          ring.push([C.x + R * 1.07 * Math.sin(a), yc + rr * sf * (1 + 0.25 * out * Math.cos(th)), C.z + R * 0.95 * Math.cos(a)]);
        }
        rings.push(ring);
      }
      rings.push(rings[0]);
      addPart('ruffle', loft(rings, { uS: 8, v0: 0.15, vS: 0.7 }), wf, { out: V3(0, yc, 0) });
    }
    addPart('cloth', loft(tubeRings([V3(0, 1.326, -0.008), V3(0, 1.362, -0.006), V3(0, 1.393, -0.005)], [0.050, 0.048, 0.0465], Q(24, 12), V3(0, 0, 1))), wf, { out: C });   // the band the frills are sewn to
    // a turquoise pendant on a fine gold chain
    const wc = () => [BI.spine3, 1], tp = prof(TORSO, 1.306, true), pc = V3(0, PROJ ? 1.306 : 1.268, PROJ ? tp[3] + tp[1] + 0.003 : 0.094);
    if (!PROJ) { const chain = curvePts([V3(-0.052, 1.332, 0.030), V3(-0.030, 1.296, 0.078), pc.clone().add(V3(0, 0.014, 0.002)), V3(0.030, 1.296, 0.078), V3(0.052, 1.332, 0.030)], 28);
      addPart('gold', loft(tubeRings(chain, chain.map(() => 0.0011), 5)), wc, { out: V3(0, 1.30, 0) }); }
    addPart('gold', spherePart(pc, 0.0128, 0.0150, 0.0050, 16, 10), wc, { out: pc });
    addPart('gem', spherePart(pc.clone().add(V3(0, 0, 0.0030)), 0.0100, 0.0122, 0.0058, 16, 10), wc, { out: pc });
  })();

  // ---------- the Fox's head, first pass (November 12, 2026): a neck her size, hair, the costume ears, her glasses ----------
  // Everything here is set out in the head's own frame, before the head bone is scaled, so it shrinks with the head.
  // Still to come: the skull reshaped to her profile (C3), her own ears, curls that swing, fur that stands up.
  const HAIR_SEED = { s: 9173 };
  const hrnd = () => (HAIR_SEED.s = (HAIR_SEED.s * 16807) % 2147483647) / 2147483647, hrr = (a, b) => a + (b - a) * hrnd();   // its own stream, so adding hair moves nothing else

  // ---- her hair moves (Chris, 12 Nov): seven short spring chains hang from her head, and each loose lock is carried by the nearest one.
  // Bangs each side, the hair over each ear, the hair down each side of her nape, and the bun. The first bone of a chain stays with her head; the rest swing.
  const hairChains = [], HCH = {};
  const hairChain = (key, pts) => { const names = []; let par = 'head'; pts.forEach((q, i) => { const nm = 'hair_' + key + i; addBone(nm, par, q[0], q[1], q[2]); names.push(nm); par = nm; }); HCH[key] = { names, y0: pts[0][1], y1: pts[pts.length - 1][1] }; hairChains.push(names); };
  for (const [sg, sx] of [['P', 1], ['N', -1]]) {
    hairChain('bang' + sg, [[sx * 0.035, 1.590, 0.085], [sx * 0.060, 1.550, 0.075], [sx * 0.072, 1.498, 0.060], [sx * 0.076, 1.445, 0.045]]);
    hairChain('side' + sg, [[sx * 0.075, 1.570, -0.005], [sx * 0.082, 1.512, -0.005], [sx * 0.086, 1.452, -0.005], [sx * 0.088, 1.390, -0.005]]);
    hairChain('back' + sg, [[sx * 0.035, 1.556, -0.085], [sx * 0.038, 1.498, -0.092], [sx * 0.040, 1.440, -0.092], [sx * 0.040, 1.380, -0.088]]);
  }
  hairChain('bun', [[0, 1.632, -0.066], [0, 1.662, -0.090], [0, 1.690, -0.110]]);
  const hairW = (key) => { const c = HCH[key], n = c.names.length; return (x, y) => { const t = cl((c.y0 - y) / (c.y0 - c.y1), 0, 0.999) * (n - 1), k = Math.floor(t), f = t - k; return [BI[c.names[k]], 1 - f, BI[c.names[k + 1]], f]; }; };
  const sideOf = (a) => (Math.abs(a) < 2.0 ? 'side' : 'back') + (a > 0 ? 'P' : 'N');
  let curW = null;                                   // which chain the next lock hangs from; null = it stays with her head
  (function foxNeck() {                              // the head shrinks about its joint, which would leave the Jester's neck too thin for her: her own, read off A1
    const rings = tubeRings([V3(0, 1.335, -0.008), V3(0, 1.356, -0.005), V3(0, 1.378, 0.000), V3(0, 1.398, 0.005), V3(0, 1.420, 0.008), V3(0, 1.450, 0.004), V3(0, 1.480, -0.004)], [[0.055, 0.051], [0.0445, 0.0462], [0.0418, 0.0450], [0.0408, 0.0445], [0.0412, 0.0448], [0.0440, 0.0470], [0.0430, 0.0455]], Q(28, 14), V3(0, 0, 1));      // from C3: about 9 cm through and 9.5 cm across, leaning forward to meet the jaw 4.5 cm behind the chin
    addPart('neck', loft(rings), (x, y) => { const v = sm(1.385, 1.43, y); return [BI.neck, 1 - 0.5 * v, BI.head, 0.5 * v]; }, { out: V3(0, 1.37, 0) });
  })();

  (function foxChoker() {                            // the rose leather collar at the foot of her neck, and its brass bell (F1). It also covers the join of neck and chest.
    const y0 = 1.3755, h = 0.0092, NU = Q(40, 24), rr = (d) => { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push([(0.0462 + d) * Math.sin(a), 0, -0.0040 + (0.0482 + d) * Math.cos(a)]); } return ring; };
    const lift = (ring, y) => ring.map((p) => [p[0], y + 0.010 * (0.5 - 0.5 * Math.cos(Math.atan2(p[0], p[2] + 0.0040))), p[2]]);      // it sits lower at the front than at the back
    addPart('choker', loft([lift(rr(-0.002), y0 - h), lift(rr(0.0024), y0 - h * 0.8), lift(rr(0.0030), y0), lift(rr(0.0024), y0 + h * 0.8), lift(rr(-0.002), y0 + h)]), () => [BI.neck, 1], { out: V3(0, y0, 0) });
    const zb = -0.0040 + 0.0482 + 0.0105, yb = y0 - h - 0.0125;
    addPart('bellm', spherePart(V3(0, yb, zb), 0.0112, 0.0112, 0.0112, Q(18, 12), Q(12, 8)), () => [BI.neck, 1], { out: V3(0, yb, zb) });
    addPart('bellm', spherePart(V3(0, yb + 0.0125, zb - 0.004), 0.0030, 0.0042, 0.0030, 8, 6), () => [BI.neck, 1], { out: V3(0, yb + 0.0125, zb - 0.004) });
  })();

  (function foxHumanEars() {                         // her own ears (C3, profile): top level with her eyes, lobe level with the foot of her nose, 3.2 cm front to back, the back edge standing off her head
    const NR = Q(14, 9), NU = Q(40, 24);
    for (const sx of [-1, 1]) {
      const O = V3(sx * 0.0685, 1.4975, -0.0065), U = V3(0, 0.985, -0.174), S = V3(sx * 0.42, 0, -0.908).normalize(), N = V3().crossVectors(S, U).multiplyScalar(sx).normalize();
      const pt = (r, th, back) => {
        const sn = Math.sin(th), a = 0.0160 * (1 + 0.16 * sn), s2 = r * a * Math.cos(th) + 0.0105, t2 = r * 0.0290 * sn, lobe = sm(-0.95, -0.35, sn);
        const h = back ? -0.0028 * (1 - 0.55 * r * r)
          : 0.0030 * Math.exp(-Math.pow((r - 0.86) / 0.11, 2)) * (0.35 + 0.65 * lobe) - 0.0040 * Math.exp(-Math.pow(r / 0.45, 2)) + 0.0014 * Math.exp(-Math.pow((r - 0.52) / 0.10, 2)) * Math.max(0, Math.sin(th - 0.5));      // the rolled rim, the bowl, the ridge inside the rim
        const p = O.clone().addScaledVector(S, s2).addScaledVector(U, t2).addScaledVector(N, h); return [p.x, p.y, p.z];
      };
      const ring = (r, back) => { const o = []; for (let j = 0; j < NU; j++) o.push(pt(r, (sx > 0 ? 1 : -1) * (j / NU) * TAU, back)); return o; };
      const rings = [];
      for (let i = 0; i <= NR; i++) rings.push(ring(lerp(1, 0.06, i / NR), false));
      for (let i = 0; i <= NR; i++) rings.push(ring(lerp(0.06, 1, i / NR), true));
      rings.push(ring(1, false));
      addPart('skin', loft(rings), wHead, { out: O.clone().addScaledVector(S, 0.0105).addScaledVector(N, -0.0012) });
    }
  })();

  // where her hair starts: the hairline as an angle down from the crown, for each direction round the head (front 0, back PI)
  const hairLine = (a) => { const c = Math.cos(a); return 1.24 + (1 - c) * 0.51 + Math.max(0, -c) * 0.60 + 0.05 * Math.sin(a * 9) * Math.max(0, c); };      // a high, uneven hairline at the front
  (function foxScalp() {                             // the hair lying on her head, drawn back and up to the bun
    const NU = Q(72, 36), NR = Q(22, 11), rings = [];
    for (let i = 0; i <= NR; i++) {
      const ring = [];
      for (let j = 0; j < NU; j++) {
        const a = (j / NU) * TAU, ph = lerp(0.03, hairLine(a), i / NR), lock = 0.0016 * Math.sin(j * 1.9 + i * 0.6) + 0.0012 * Math.sin(j * 0.63 + 1.1);
        ring.push(headPoint(a, ph, 0.0075 + lock - 0.0035 * sm(0.82, 1, i / NR)));     // thinning to nothing at the hairline
      }
      rings.push(ring);
    }
    addPart('scalp', loft(rings, { capA: true, uS: 10, vS: 1.6 }), wHead, { out: HC });
  })();


  // the body of her hair: a soft dark mass standing off her head at the sides and back, which the curls sit on. None of it over her face.
  const massGrow = (a, ph) => {
    const side = sm(1.20, 1.55, Math.abs(a)), v = sm(lerp(0.78, 0.40, sm(2.2, 2.8, Math.abs(a))), lerp(1.15, 0.85, sm(2.2, 2.8, Math.abs(a))), ph) * (1 - sm(lerp(1.22, 2.0, sm(1.9, 2.6, Math.abs(a))), lerp(1.50, 2.4, sm(1.9, 2.6, Math.abs(a))), ph)) * lerp(0.62, 1, sm(1.9, 2.6, Math.abs(a)));      // C3: her hair is drawn up off her ears and neck, so at the sides the mass stops above the ear; at the back it runs to the nape
    const lump = 0.008 * Math.sin(a * 5 + ph * 3.1) * Math.sin(ph * 6.3 - a * 2) + 0.005 * Math.sin(a * 11 + ph * 7);
    const full = 0.030 + 0.028 * sm(0.8, 1.7, ph) * (1 - 0.4 * sm(2.0, 2.4, ph));
    return -0.012;      // C10 (her hair alone): there is no body of hair at the sides or back. It is all drawn up, close and dark, into one tall pile of curls on top.
  };
  (function foxHairMass() {
    const NU = Q(84, 44), NR = Q(40, 22), rings = [];
    for (let i = 0; i <= NR; i++) {
      const ring = [], ph = lerp(0.20, 2.50, i / NR);
      for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU - PI; ring.push(headPoint(a, ph, massGrow(a, ph))); }
      rings.push(ring);
    }
    addPart('scalp', loft(rings, { uS: 14, vS: 3 }), wHead, { out: HC });
  })();

  // one ringlet: a tube wound round a path. path(t) -> Vector3 for t 0..1; hr: the ringlet's radius; turns; tr: the lock's own thickness
  function ringlet(path, hr, turns, tr, ph0) {
    const NS = Math.max(10, Math.round(Q(12, 7) * Math.max(1.2, turns))), pts = [], rad = [];
    let T0 = null, N = null;
    for (let i = 0; i <= NS; i++) {
      const t = i / NS, p = path(t), q = path(Math.min(1, t + 0.02)), q0 = path(Math.max(0, t - 0.02)), Tn = q.clone().sub(q0).normalize();
      if (!N) { N = Math.abs(Tn.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0); N.addScaledVector(Tn, -N.dot(Tn)).normalize(); }
      else { N.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(T0, Tn)); N.addScaledVector(Tn, -N.dot(Tn)).normalize(); }
      T0 = Tn; const B = V3().crossVectors(Tn, N), ang = ph0 + t * turns * TAU, grow = 0.45 + 0.55 * sm(0, 0.35, t);      // a ringlet opens out from its root
      pts.push(p.clone().addScaledVector(N, Math.cos(ang) * hr * grow).addScaledVector(B, Math.sin(ang) * hr * grow));
      const r = tr * (0.75 + 0.25 * Math.sin(t * 9 + ph0)) * (1 - 0.55 * sm(0.8, 1, t)); rad.push([r, r * 0.72]);
    }
    const rings = tubeRings(pts, rad, 6);
    addPart('curl', loft(rings, { capB: true, u0: hrnd(), uS: 0.22 }), curW || wHead, { out: centroidOf(rings) });
  }
  (function foxBun() {                               // the messy ponytail bun: ringlets spilling every way out of one knot high on the back of her head
    const B0 = V3(0, 1.648, -0.086), lean = V3(0, 0.60, -0.80).normalize(), N = Q(120, 64);      // C10: the pile's top stands about 11 cm above her skull and it spills back well behind her head
    addPart('scalp', spherePart(B0, 0.044, 0.038, 0.044, Q(28, 14), Q(18, 10)), wHead, { out: B0 });
    for (let k = 0; k < N; k++) {
      let d; do { const u = hrr(-1, 1), th = hrr(0, TAU), s = Math.sqrt(1 - u * u); d = V3(s * Math.cos(th), u, s * Math.sin(th)); } while (d.dot(lean) < -0.35 || d.z > 0.30);
      curW = hairW('bun'); const L = hrr(0.040, 0.085), droop = hrr(0.014, 0.045), start = B0.clone().addScaledVector(d, 0.024), side = V3(hrr(-1, 1), 0, hrr(-1, 1)).multiplyScalar(0.012);
      ringlet((t) => start.clone().addScaledVector(d, L * t).add(V3(side.x * t * t, -droop * t * t, side.z * t * t)), hrr(0.0095, 0.0150), hrr(1.7, 2.8), hrr(0.0050, 0.0066), hrr(0, TAU));
    }
  })();
  (function foxLooseCurls() {                        // the curls left out all round her face, and the soft halo of shorter ones
    curW = null; const NH = Q(46, 28);
    for (let k = 0; k < NH; k++) {                   // hanging ringlets: short over the forehead, long in front of her ears
      const f = (k + hrr(0.15, 0.85)) / NH, a0 = lerp(-1, 1, f), wisp = k % 8 === 3, a = Math.sign(a0 || 1) * (wisp ? hrr(0.12, 0.62) : lerp(0.95, 3.05, Math.abs(a0))), aa = Math.abs(a), root = V3(...headPoint(a, wisp ? hairLine(a) - hrr(0.02, 0.10) : Math.min(hairLine(a) - hrr(0.02, 0.10), hrr(1.0, 1.5)), 0.006));
      const out = root.clone().sub(HC).setY(0).normalize(), L = wisp ? hrr(0.014, 0.026) : hrr(0.100, 0.200), stand = wisp ? hrr(0.006, 0.012) : hrr(0.016, 0.034); curW = wisp ? null : hairW(sideOf(a));
      const swing = V3(-out.z, 0, out.x).multiplyScalar(wisp ? Math.sign(a || 1) * hrr(0.012, 0.024) : hrr(-0.012, 0.012));
      ringlet((t) => root.clone().addScaledVector(out, stand * sm(0, 0.4, t)).add(V3(swing.x * t, -L * t * (0.35 + 0.65 * t), swing.z * t)), wisp ? hrr(0.005, 0.007) : hrr(0.0110, 0.0150), wisp ? hrr(0.8, 1.3) : Math.max(1.5, L / 0.034), wisp ? hrr(0.0026, 0.0034) : hrr(0.0050, 0.0064), hrr(0, TAU));
    }

    const NS2 = 0;      // none: the sides are close to her head now
    for (let k = 0; k < NS2; k++) {                  // wavy locks lying down the mass, from the top of it to its hem
      const s = k % 2 ? 1 : -1, a0 = s * hrr(1.27, PI), ph0 = hrr(0.80, 1.25), ph1 = Math.min(hrr(1.9, 2.45), lerp(1.42, 2.3, sm(1.9, 2.6, Math.abs(a0)))), da = hrr(-0.18, 0.18), wob = hrr(0.03, 0.07), f = hrr(2, 4), p0 = hrr(0, TAU);
      ringlet((t) => { const ph = lerp(ph0, ph1, t), a = a0 + da * t + wob * Math.sin(t * f * PI + p0); return V3(...headPoint(a, ph, massGrow(a, ph) + 0.003 + 0.004 * t)); }, hrr(0.004, 0.008), hrr(2.5, 5), hrr(0.0060, 0.0085), hrr(0, TAU));
    }
    for (const s of [-1, 1]) for (let k = 0; k < 22; k++) {      // the hair swept off her parting to each side, over the corners of her forehead
      curW = hairW('bang' + (s > 0 ? 'P' : 'N')); const u = (k + hrnd()) / 22, a1 = s * lerp(0.95, 1.45, hrnd()), ph0 = lerp(0.80, 1.20, u), ph1 = lerp(1.55, 2.15, hrnd()), a0 = s * hrr(0.03, 0.10), p0 = hrr(0, TAU);
      ringlet((t) => { const a = lerp(a0, a1, Math.pow(t, 0.75)), ph = lerp(ph0, ph1, Math.pow(t, 1.6)); return V3(...headPoint(a, ph, 0.012 + 0.022 * t * t + 0.004 * Math.sin(t * 9 + p0))); }, hrr(0.004, 0.008), hrr(2, 3.5), hrr(0.0080, 0.0115), p0);
    }
    const NF = Q(300, 150);
    for (let k = 0; k < NF; k++) {                   // the halo: shorter curls standing out from the hair itself, all round
      let a = hrr(-PI, PI); if (Math.abs(a) < 1.05) a = Math.sign(a || 1) * hrr(1.05, PI);     // none sprouting over her face
      const ph = lerp(0.30, lerp(1.75, 2.35, sm(1.9, 2.6, Math.abs(a))), hrnd()), root = V3(...headPoint(a, ph, Math.max(0.006, massGrow(a, ph) - 0.006))), out = root.clone().sub(HC).normalize();
      curW = ph > 1.15 ? hairW(sideOf(a)) : null; const L = hrr(0.045, 0.110), droop = hrr(0.030, 0.090), tw = V3(hrr(-1, 1), 0, hrr(-1, 1)).multiplyScalar(0.012);
      ringlet((t) => root.clone().addScaledVector(out, L * t).add(V3(tw.x * t * t, -droop * t * t, tw.z * t * t)), hrr(0.0100, 0.0150), hrr(1.2, 2.2), hrr(0.0062, 0.0085), hrr(0, TAU));
    }
  })();

  (function foxEars() {                              // costume ears, clipped into her hair: a cupped leaf, russet behind and cream inside
    for (const sx of [-1, 1]) {
      const base = V3(sx * 0.079, 1.594, 0.030), up = V3(sx * 0.305, 0.951, -0.05).normalize(), fwd = V3(sx * 0.30, 0, 0.954).normalize(), right = V3().crossVectors(up, fwd).normalize();
      const H = 0.088, NV = Q(22, 12), NA = Q(26, 14), rings = [];
      for (let i = 0; i <= NV; i++) {
        const v = i / NV, w = 0.037 * Math.pow(1 - v, 0.86) * (0.55 + 0.45 * sm(0, 0.18, v)) + 0.0012, th = 0.0035 + 0.007 * (1 - v), c = base.clone().addScaledVector(up, H * v).addScaledVector(fwd, -0.012 * v * v), ring = [];
        for (let j = 0; j < NA; j++) {
          const ang = (j / NA) * TAU, sn = Math.sin(ang), cs = Math.cos(ang), cup = 0.010 * (1 - v) * (sn * sn);       // the edges come forward: the ear is a shallow cup
          ring.push(c.clone().addScaledVector(right, w * sn).addScaledVector(fwd, th * cs * (cs > 0 ? 0.35 : 1) + cup).toArray());
        }
        rings.push(ring);
      }
      addPart('ear', loft(rings, { capB: true }), wHead, { out: centroidOf(rings) });
    }
  })();

  (function foxGlasses() {                           // round wire glasses: two rims, a bridge, pads and arms; the lenses are their own thin discs
    const ey = FC.eyeY + 0.0005, ex = FC.eyeX + 0.0008, R = 0.0262, zf = 0.1065, wire = 0.00085, NS = Q(48, 28);
    for (const sx of [-1, 1]) {
      const rim = []; for (let i = 0; i <= NS; i++) { const a = (i / NS) * TAU; rim.push(V3(sx * ex + R * Math.cos(a), ey + R * Math.sin(a), zf - 0.004 * Math.pow(Math.abs(sx * ex + R * Math.cos(a)) / 0.06, 2))); }
      addPart('frame', loft(tubeRings(rim, rim.map(() => wire), 6)), wHead, { out: V3(sx * ex, ey, zf) });
      const hinge = V3(sx * (ex + R + 0.001), ey + 0.004, zf - 0.006), back = V3(sx * 0.0745, ey + 0.001, 0.012), tip = V3(sx * 0.0735, ey - 0.014, -0.014);
      addPart('frame', loft(tubeRings(curvePts([V3(sx * (ex + R), ey + 0.003, zf - 0.004), hinge, V3(sx * 0.0725, ey + 0.004, 0.060), back, tip], 16), new Array(16).fill(wire), 6)), wHead, { out: V3(sx * 0.07, ey, 0.05) });
      { const zp = zf - 0.0115 - 0.0043 * FACE_DEPTH; addPart('frame', spherePart(V3(sx * 0.0118, ey - 0.011, zp), 0.0022, 0.0034, 0.0012, 8, 6), wHead, { out: V3(sx * 0.0118, ey - 0.011, zp) }); }      // nose pad, resting on the side of her nose wherever that is
      const disc = [[], []]; for (let i = 0; i < NS; i++) { const a = (i / NS) * TAU; disc[0].push([sx * ex, ey, zf - 0.0012]); disc[1].push([sx * ex + (R - wire) * Math.cos(a), ey + (R - wire) * Math.sin(a), zf - 0.0012 - 0.004 * Math.pow(Math.abs(sx * ex + R * Math.cos(a)) / 0.06, 2)]); }
      addPart('lens', loft(disc), wHead, { out: V3(sx * ex, ey, 0) });
    }
    const br = curvePts([V3(-(ex - R), ey + 0.004, zf - 0.001), V3(-0.004, ey + 0.0105, zf + 0.001), V3(0.004, ey + 0.0105, zf + 0.001), V3(ex - R, ey + 0.004, zf - 0.001)], 12);
    addPart('frame', loft(tubeRings(br, br.map(() => wire), 6)), wHead, { out: V3(0, ey - 0.02, zf) });
  })();
  // ---------- her patchwork trousers (shape: F6 and the round 4 paintings; sizes: A1; cloth: the swatch sheets F9 and F10) ----------
  // First build. They are sewn shapes carried by her hips, thighs and shins; they do not yet fall and swing as cloth of their own.
  // In A1 each leg is about 33 cm across from the knee to mid-calf, the two meet at the middle, and the cloth is gathered in at the top of each boot.
  const FOXHIP = {};                                // the shape of her hips and trouser legs, for the things that hang on them
  const FLOUNCE = [];                               // the shapes of her flounces at rest; they are made into cloth in 67_foxcloth.js, once the cloth code exists
  (function foxTrousers() {
    const NU = Q(56, 30), ZC = 0.012;
    const ell = (cx, y, cz, rx, rz, wob) => { const r = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, k = 1 + (wob ? wob(a) : 0); r.push([cx + rx * k * Math.sin(a), y, cz + rz * k * Math.cos(a)]); } return r; };
    // the yoke: one piece round her hips, from just under the corset's frill to the fork   [height, half-width, half-depth, how far forward its middle sits]
    const YOKE = [[0.992, 0.150, 0.108, 0.036], [0.955, 0.166, 0.120, 0.034], [0.920, 0.180, 0.130, 0.030], [0.870, 0.196, 0.138, 0.024], [0.810, 0.206, 0.140, 0.019], [0.745, 0.204, 0.136, 0.018]];
    addPart('patch', loft(YOKE.map((r) => ell(0, r[0], r[3], r[1], r[2], (a) => 0.016 * Math.sin(a * 9))), { uS: 4, vS: 1.0 }), () => [BI.hips, 1], { out: V3(0, 0.86, 0.02) });
    // each leg, top to bottom   [height, how far out its middle sits, half-width, half-depth]
    // Chris, 12 Nov: "far too baggy". Each leg was 30 cm across (A1's measure); it is now about 20: still a wide leg, no longer a balloon.
    const LEGT = [[0.820, 0.105, 0.098, 0.118], [0.720, 0.108, 0.099, 0.118], [0.610, 0.111, 0.100, 0.115], [0.490, 0.112, 0.100, 0.112], [0.390, 0.112, 0.100, 0.110], [0.315, 0.108, 0.092, 0.104], [0.268, 0.099, 0.075, 0.090], [0.240, 0.090, 0.056, 0.072]];
    const LEGA = LEGT.map((r) => [r[0], [r[1], r[2], r[3]]]).reverse(), legAt = (y) => spline(LEGA, cl(y, 0.240, 0.820));
    for (const [S, s] of SIDES) {
      const TH = BI['thigh' + S], SHN = BI['shin' + S];
      const wLeg = (x, y) => { if (y > 0.80) return [BI.hips, 1]; if (y > 0.70) { const u = sm(0.80, 0.70, y); return [BI.hips, 1 - u, TH, u]; } if (y > 0.51) return [TH, 1]; if (y > 0.43) { const u = sm(0.51, 0.43, y); return [TH, 1 - u, SHN, u]; } return [SHN, 1]; };
      const NR = Q(30, 16), rings = [];
      for (let i = 0; i <= NR; i++) {
        const y = lerp(0.820, 0.240, i / NR), [cxo, rx, rz] = legAt(y), gather = 1 - sm(0.245, 0.32, y);
        rings.push(ell(s * cxo, y, ZC, rx, rz, (a) => 0.016 * Math.sin(a * 11 + y * 30) * (1 - gather) + 0.050 * Math.sin(a * 17) * gather));
      }
      addPart('patch', loft(rings, { uS: 2, vS: 1.8 }), wLeg, { out: V3(s * 0.15, 0.5, ZC) });
      // two flounces over each leg, the upper one shorter, each with a dipping hem and its own waves
      for (const [yTop, yHem, g0, g1, key, ph, dip] of [[0.660, 0.375, 0.006, 0.046, 'patch', 1.3, 0.085], [0.815, 0.520, 0.012, 0.058, 'patch2', 0.4, 0.100]]) {
        const NT = Q(12, 7), tr = [];
        for (let i = 0; i <= NT; i++) {
          const t = i / NT, ring = [];
          for (let j = 0; j < NU; j++) {
            const a = (j / NU) * TAU, y = lerp(yTop, yHem - dip * Math.pow(0.5 + 0.5 * Math.sin(a * 3 + ph), 1.6), t), [cxo, rx, rz] = legAt(y), g = lerp(g0, g1, t) + 0.014 * t * Math.sin(a * 13 + ph * 3 + t * 5);
            ring.push([s * cxo + (rx + g) * Math.sin(a), y, ZC + (rz + g) * Math.cos(a)]);
          }
          tr.push(ring);
        }
        FLOUNCE.push({ key, tr, wLeg, ph, side: s });
      }
      // the magenta frill where each leg is gathered onto her boot
      const fr = [];
      for (let i = 0; i <= 4; i++) { const t = i / 4, ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, r = lerp(0.056, 0.086, t) + 0.011 * t * Math.sin(a * 15); ring.push([s * 0.089 + r * Math.sin(a), lerp(0.262, 0.212, t) + 0.004 * t * Math.sin(a * 15 + 1), -0.004 + r * 1.22 * Math.cos(a)]); } fr.push(ring); }
      addPart('frill', loft(fr), () => [SHN, 1], { out: V3(s * 0.089, 0.24, -0.004) });
    }
    // her belt, pouch, sheath and shears are built in 48_foxgear.js, on the hip and leg shapes handed over here
    const YA = YOKE.map((r) => [r[0], [r[1], r[2], r[3]]]).reverse();
    FOXHIP.onHip = (a, y, out) => { const [rx, rz, cz] = spline(YA, cl(y, 0.745, 0.992)); return V3((rx + out) * Math.sin(a), y, cz + (rz + out) * Math.cos(a)); };
    FOXHIP.legAt = legAt; FOXHIP.ZC = ZC;
  })();
  // ---------- her belt, pouch, sheath and shears (shapes and leather: F7, G1, G3; how they are worn: A1, A2, G4 and the standing painting) ----------
  // Everything here is measured in the painting it comes from and turned into her size by one number each:
  //   belt   F7, 69 px across = 2.8 cm        pouch  F7, 342 px across = 11 cm
  //   sheath G3, 535 px long = 22.8 cm        shears G1, 1310 px long = 26 cm
  // The leather is the paintings themselves (bake_gear_fox.py): each face of each piece is looked at straight on and given the painting of that face.
  const FOXGEAR = {};
  (function foxGear() {
    const onHip = FOXHIP.onHip, legAt = FOXHIP.legAt, ZC = FOXHIP.ZC, GL = (BAKED && BAKED.gearLayout) || null;
    // a spot on a painting -> the same spot on the baked picture
    const guv = (name, sx, sy) => {
      if (!GL) return [0.5, 0.5];
      const s = GL[name].s, d = GL[name].d, fx = cl((sx - s[0]) / (s[2] - s[0]), 0.006, 0.994), fy = cl((sy - s[1]) / (s[3] - s[1]), 0.006, 0.994);
      return [(d[0] + fx * (d[2] - d[0])) / 1024, 1 - (d[1] + fy * (d[3] - d[1])) / 1024];
    };
    // a sheet of points: fn(u, v) -> [x, y, z, U, V], with u and v running from 0 to 1
    const sheet = (nu, nv, fn) => {
      const pos = [], uv = [], idx = [];
      for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const q = fn(i / nu, j / nv); pos.push(q[0], q[1], q[2]); uv.push(q[3], q[4]); }
      for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
      return { pos, uv, idx };
    };
    // rings of points with their own picture coordinates, joined into a tube (give each ring its first point again at the end)
    const ringLoft = (rings, uvs) => {
      const m = rings.length, n = rings[0].length, pos = [], uv = [], idx = [];
      for (let i = 0; i < m; i++) for (let k = 0; k < n; k++) { pos.push(rings[i][k][0], rings[i][k][1], rings[i][k][2]); uv.push(uvs[i][k][0], uvs[i][k][1]); }
      for (let i = 0; i < m - 1; i++) for (let k = 0; k < n - 1; k++) { const a = i * n + k, b = a + 1, c = a + n, d = c + 1; idx.push(a, c, b, b, c, d); }
      return { pos, uv, idx };
    };
    // a piece's own space: where its origin is and which way its across, up and outward run
    const frame = (O, X, Y, Z) => (x, y, z) => [O.x + X.x * x + Y.x * y + Z.x * z, O.y + X.y * x + Y.y * y + Z.y * z, O.z + X.z * x + Y.z * y + Z.z * z];
    const frameOn = (top, bot, nrm) => { const Y = top.clone().sub(bot).normalize(), X = V3().crossVectors(Y, nrm).normalize(), Z = V3().crossVectors(X, Y).normalize(); return { O: top, X, Y, Z, at: frame(top, X, Y, Z) }; };
    // a sheet given thickness: its face, its back (th behind, in the piece's own space) and the edge between
    const slab = (F, nu, nv, fn, th, buv) => {
      const fr = sheet(nu, nv, (u, v) => { const q = fn(u, v), w = F(q[0], q[1], q[2]); return [w[0], w[1], w[2], q[3], q[4]]; });
      const bk = sheet(nu, nv, (u, v) => { const q = fn(u, v), w = F(q[0], q[1], q[2] - th), t = buv ? buv(u, v, q) : [q[3], q[4]]; return [w[0], w[1], w[2], t[0], t[1]]; });
      const B = []; for (let i = 0; i <= nu; i++) B.push([i / nu, 0]); for (let j = 1; j <= nv; j++) B.push([1, j / nv]); for (let i = nu - 1; i >= 0; i--) B.push([i / nu, 1]); for (let j = nv - 1; j >= 1; j--) B.push([0, j / nv]);
      const ed = sheet(B.length, 1, (u, v) => { const k = Math.round(u * B.length) % B.length, q = fn(B[k][0], B[k][1]), w = F(q[0], q[1], q[2] - th * v); return [w[0], w[1], w[2], q[3], q[4]]; });
      return [fr, bk, ed];
    };
    const put = (key, parts, wf, out) => { for (const p of (Array.isArray(parts) ? parts : [parts])) addPart(key, p, wf, { out: Array.isArray(out) ? V3(out[0], out[1], out[2]) : out }); };
    const wHips = [BI.hips, 1], wH = () => wHips;
    const dome = (c, r, h, key, wf) => { const q = Array.isArray(c) ? V3(c[0], c[1], c[2]) : c; addPart(key || 'brass', spherePart(q, r, r, r, Q(12, 8), Q(8, 6)), wf || wH, { out: q }); };      // a stud; flattened afterwards by its caller where it matters
    const plainUV = (u, v) => guv('plain', 1074 + 112 * u, 644 + 212 * v);

    // ================= the belt =================
    // Worn loose: level round her back at her waist, sagging across the front from her right hip down to the pouch on her left (A1: 12 cm of drop),
    // then climbing steeply behind the pouch back up to her waist at her left side.
    const BW = 0.0268, BT = 0.0042, KB = BW / 69, AB = 0.24;      // width, thickness, metres to one F7 pixel, and where the buckle sits (a little to her left of the middle)
    const beltY = (a) => { const w = sm(-0.25, 0.35, Math.cos(a)); return w * (0.9395 - 0.43 * 0.18 * Math.sin(a)) + (1 - w) * 0.985; };
    const beltP = (a, out) => onHip(a, beltY(a), out);
    const UP = V3(0, 1, 0), hipN = (a, y) => onHip(a + 0.01, y, 0).sub(onHip(a - 0.01, y, 0)).cross(UP).normalize();      // which way her hip faces at that spot
    const beltF = (a, out) => { const p = beltP(a, out), T = beltP(a + 0.012, out).sub(beltP(a - 0.012, out)).normalize(), n0 = V3().crossVectors(T, UP).normalize(), B = V3().crossVectors(n0, T).normalize(), N = V3().crossVectors(T, B).normalize(); return { p, T, B, N }; };
    const PROF = [[-0.93, 1, 0.04], [0.93, 1, 0.96], [1, 0.6, 0.99], [1, -0.6, 1], [0.93, -1, 0.96], [-0.93, -1, 0.04], [-1, -0.6, 0], [-1, 0.6, 0.01], [-0.93, 1, 0.04]];      // across, through, and where across the leather's picture
    const strap = (a0, a1, n, out, hw, ht, uvf) => {
      const rings = [], uvs = []; let s = 0, prev = null;
      for (let i = 0; i <= n; i++) {
        const a = lerp(a0, a1, i / n), f = beltF(a, typeof out === 'function' ? out(i / n) : out); if (prev) s += f.p.distanceTo(prev); prev = f.p;
        rings.push(PROF.map((q) => [f.p.x + f.B.x * q[0] * hw + f.N.x * q[1] * ht, f.p.y + f.B.y * q[0] * hw + f.N.y * q[1] * ht, f.p.z + f.B.z * q[0] * hw + f.N.z * q[1] * ht]));
        uvs.push(PROF.map((q) => uvf(s, q[2], i / n)));
      }
      return ringLoft(rings, uvs);
    };
    const O0 = BT / 2 + 0.0018;                      // how far the belt's middle stands off her trousers
    put('beltm', strap(AB, AB + TAU, Q(180, 96), O0, BW / 2, BT / 2, (s, v) => [s / 0.0458, v]), wH, V3(0, 0.95, 0.02));
    // its holed tail, through the buckle and on toward the pouch, lying on top of the belt (F7's own tail, holes and all)
    put('gear', strap(AB - 0.02, AB + 0.74, Q(44, 24), (t) => O0 + BT * 1.05 + 0.0030 * Math.sin(Math.min(1, t * 6) * PI / 2), BW / 2, BT / 2, (s, v) => guv('tail', 1146 + s / KB, 139 + (1 - v) * 78)), wH, V3(0, 0.95, 0.02));
    // the keeper, a band of leather round both layers
    put('gear', strap(AB + 0.37, AB + 0.43, 4, O0 + BT * 0.55, BW / 2 + 0.0030, BT * 1.75, (s, v, t) => plainUV(v, t * 0.3)), wH, V3(0, 0.95, 0.02));
    // brass studs, 4 cm apart, from the buckle round her right side and her back
    { let a = AB - 0.20, s = 0, prev = beltP(a, O0);
      while (a > AB - TAU + 1.45) { a -= 0.004; const p = beltP(a, O0); s += p.distanceTo(prev); prev = p; if (s >= 0.040) { s = 0; const f = beltF(a, O0 + BT / 2 + 0.0006); dome(f.p, 0.0034); } } }
    // the buckle: a brass frame standing on the belt, its bar toward her left, its prong lying back across the tail
    { const f = beltF(AB, O0 + BT * 1.6 + 0.0026), pts = [], NPB = Q(40, 24);
      for (let i = 0; i <= NPB; i++) { const th = (i / NPB) * TAU, c = Math.cos(th), sn = Math.sin(th), t = 0.0005 + 0.0240 * Math.sign(c) * Math.pow(Math.abs(c), 0.62), b = 0.0218 * Math.sign(sn) * Math.pow(Math.abs(sn), 0.52); pts.push(f.p.clone().addScaledVector(f.T, t).addScaledVector(f.B, b)); }
      addPart('brass', loft(tubeRings(pts, pts.map(() => 0.0036), Q(10, 7), f.N)), wH, { out: f.p });
      const pr = []; for (let i = 0; i <= 8; i++) { const t = lerp(0.0240, -0.0255, i / 8); pr.push(f.p.clone().addScaledVector(f.T, t).addScaledVector(f.N, 0.0012 + 0.0016 * Math.sin((i / 8) * PI))); }
      addPart('brass', loft(tubeRings(pr, pr.map((q, i) => 0.0019 - 0.0006 * (i / 8)), Q(8, 6), f.B), { capA: true, capB: true }), wH, { out: f.p.clone().addScaledVector(f.N, -0.01) }); }
    FOXGEAR.belt = { beltY, beltP, AB };

    // ================= the pouch (F7), on the sag of the belt at her left hip =================
    { const AP = 0.92, W = 0.111, KP = W / 342, H = 447 * KP, RC = 70 * KP, DG = 0.034;       // angle round her hips, width, metres to one F7 pixel, height, corner radius, depth at the sides
      const top = onHip(AP, 0.939, BT + 0.0075), bot = onHip(AP, 0.939 - H, BT + 0.0075 + 0.016), nrm = hipN(AP, 0.87);
      const P = frameOn(top, bot, nrm), F = P.at, mid = V3(...F(0, -H / 2, DG / 2));
      const hwAt = (y) => { const yb = y + H; return yb >= RC ? W / 2 : W / 2 - RC + Math.sqrt(Math.max(0, RC * RC - (RC - yb) * (RC - yb))); };
      const dgAt = (y) => DG * (0.80 + 0.20 * sm(0, 0.03, y + H));                              // the sides are a little shallower round the bottom
      const zf = (x, y) => { const hw = hwAt(y), uu = cl(x / hw, -1, 1), v = cl(-y / H, 0, 1); return dgAt(y) + 0.0085 * (1 - uu * uu) * Math.pow(Math.sin(PI * (0.08 + 0.86 * v)), 0.7); };      // the face swells out between its edges
      const fuv = (x, y) => guv('pouchF', 318 + x / KP, 448 - y / KP);
      const NX = Q(18, 10), NY = Q(22, 12);
      // face, back and the strip of leather between them
      put('gear', sheet(NX, NY, (u, v) => { const y = -H * v, x = hwAt(y) * (2 * u - 1), w = F(x, y, zf(x, y)), t = fuv(x, y); return [w[0], w[1], w[2], t[0], t[1]]; }), wH, mid);
      put('gear', sheet(NX, NY, (u, v) => { const y = -H * v, x = hwAt(y) * (2 * u - 1), w = F(x, y, 0), t = guv('pouchB', 1222 - x / KP, 448 - y / KP); return [w[0], w[1], w[2], t[0], t[1]]; }), wH, mid);
      { const OUTL = [], NS = Q(14, 8), NA = Q(8, 5);                                            // the outline, from the top of her right-hand edge, round the bottom, up the other edge
        for (let i = 0; i <= NS; i++) OUTL.push([-W / 2, -(H - RC) * (i / NS), -1, 0]);
        for (let i = 1; i <= NA; i++) { const th = (i / NA) * PI / 2; OUTL.push([-W / 2 + RC - RC * Math.cos(th), -(H - RC) - RC * Math.sin(th), -Math.cos(th), -Math.sin(th)]); }
        for (let i = 1; i <= 4; i++) OUTL.push([lerp(-W / 2 + RC, W / 2 - RC, i / 4), -H, 0, -1]);
        for (let i = 1; i <= NA; i++) { const th = PI / 2 - (i / NA) * PI / 2; OUTL.push([W / 2 - RC + RC * Math.cos(th), -(H - RC) - RC * Math.sin(th), Math.cos(th), -Math.sin(th)]); }
        for (let i = 1; i <= NS; i++) OUTL.push([W / 2, -(H - RC) * (1 - i / NS), 1, 0]);
        put('gear', sheet(OUTL.length - 1, 4, (u, v) => { const o = OUTL[Math.round(u * (OUTL.length - 1))], dg = dgAt(o[1]), b = 0.0030 * Math.sin(PI * v), w = F(o[0] + o[2] * b, o[1] + o[3] * b, dg * v), t = guv('pouchS', 808 - (dg * v) / KP, Math.min(868, 452 - o[1] / KP)); return [w[0], w[1], w[2], t[0], t[1]]; }), wH, mid); }
      // the flap: over the top and down the face to its curved edge, standing a little proud, with its own thickness
      const FE = 0.0042, flapY = (uu) => -KP * (142 + 115 * Math.sqrt(Math.max(0, 1 - uu * uu))), FW = W / 2 + 0.0022;
      const flapPt = (u, v) => {                     // v: 0 at the back of the top, 0.22 at the front of the top, 1 at the flap's edge
        const uu = 2 * u - 1, x = FW * uu;
        if (v < 0.22) { const k = v / 0.22, zt = zf(x * 0.98, 0) + FE; return [x, 0.0010 + 0.0060 * Math.sin(PI * k * 0.5) * Math.cos(PI * k * 0.5) * 2 - 0.0002, lerp(-0.0012, zt, k), ...guv('pouchS', 808 - lerp(-0.001, zt, k) / KP, 454)]; }
        const k = (v - 0.22) / 0.78, y = flapY(uu) * k, xx = cl(x, -hwAt(y) * 1.0 - 0.0022, hwAt(y) + 0.0022);
        return [xx, y, zf(cl(xx, -hwAt(y), hwAt(y)), y) + FE * (1 - 0.25 * Math.pow(k, 6)), ...fuv(x, y)];
      };
      put('gear', slab(F, NX, Q(18, 10), flapPt, 0.0034, (u, v, q) => plainUV(u, v)), wH, V3(...F(0, -0.03, DG / 2)));
      // the strap down the middle of the face, and the brass snap that holds the flap
      put('gear', slab(F, 3, Q(10, 6), (u, v) => { const x = 28.5 * KP * (2 * u - 1), y = lerp(-232 * KP, -H + 0.0030, v); return [x, y, zf(x, y) + 0.0022, ...fuv(x, y)]; }, 0.0030), wH, V3(...F(0, -0.10, DG * 0.6)));
      { const y = -(665 - 448) * KP, c = V3(...F(0, y, zf(0, y) + FE + 0.0012)), part = spherePart(c, 0.0082, 0.0082, 0.0082, Q(14, 9), Q(9, 6));
        for (let i = 0; i < part.pos.length; i += 3) { const d = (part.pos[i] - c.x) * P.Z.x + (part.pos[i + 1] - c.y) * P.Z.y + (part.pos[i + 2] - c.z) * P.Z.z, sq = d * (0.42 - 1); part.pos[i] += P.Z.x * sq; part.pos[i + 1] += P.Z.y * sq; part.pos[i + 2] += P.Z.z * sq; }
        addPart('brass', part, wH, { out: c }); }
      // the loop it hangs by, standing up behind the flap with its stud, leaning in with her waist
      { const lean = (y) => 0.0030 - 0.16 * Math.max(0, y);
        put('gear', slab(F, 3, Q(8, 5), (u, v) => { const x = 45 * KP * (2 * u - 1), y = lerp(-0.012, 143 * KP, v); return [x, y, lean(y) + 0.0036, ...fuv(x, y)]; }, 0.0036, (u, v) => plainUV(u, v)), wH, V3(...F(0, 0.02, lean(0.02) + 0.0018)));
        const ys = (448 - 410) * KP, c = V3(...F(0, ys, lean(ys) + 0.0036 + 0.0008)); dome(c, 0.0042); }
      FOXGEAR.pouch = { F, W, H };
    }

    // ================= the sheath (G3) on her right hip, and her shears in it (G1) =================
    { const AS = -0.95, L = 0.218, KS = L / 535, HW = 76.5 * KS, DS = 0.0245;       // angle round her hips, length, metres to one G3 pixel, half the mouth's width, its depth at the mouth
      const M = onHip(AS, 0.935, 0.0100);            // the middle of the mouth's back edge
      // its tip rests on the upper flounce of her right leg, so it hangs a little outward, as in the standing painting
      const yT = 0.935 - L * 0.985, [cxo, rx, rz] = legAt(yT), g = 0.012 + 0.046 * (0.815 - yT) / 0.295 + 0.020, al = Math.atan2(M.x + cxo, M.z - ZC);
      const tip = V3(-cxo + (rx + g) * Math.sin(al), yT, ZC + (rz + g) * Math.cos(al)), nrm = hipN(AS, 0.90);
      const P = frameOn(M, tip, nrm), F = P.at;
      addBone('sheath', 'hips', M.x, M.y, M.z);
      const wS = [BI.sheath, 1], wSh = () => wS;
      const hwAt = (t) => HW * Math.pow(Math.max(0, 1 - t), 0.92) + 0.0012, dsAt = (t) => DS * Math.max(0, 1 - t) + 0.0030;
      const zfS = (uu, t) => dsAt(t) * Math.pow(Math.max(0, 1 - uu * uu), 0.55);
      const LIP = 24 * KS;                           // the front of the mouth dips this far in the middle
      const front = (inset) => (u, v) => { const uu = 2 * u - 1, t = v, x = hwAt(t) * uu, y = -L * t - LIP * (1 - uu * uu) * Math.pow(1 - t, 8), w = F(x, y, Math.max(0, zfS(uu, t) - inset)), q = guv('sheathF', 391.5 + x / KS, 448 - y / KS); return [w[0], w[1], w[2], q[0], q[1]]; };
      const NX = Q(14, 8), NY = Q(30, 16), midS = V3(...F(0, -L * 0.35, DS * 0.3));
      put('gear', sheet(NX, NY, front(0)), wSh, midS);
      put('gear', sheet(NX, NY, (u, v) => { const uu = 2 * u - 1, t = v, x = hwAt(t) * uu, y = -L * t, w = F(x, y, -0.0006), q = plainUV(u, v); return [w[0], w[1], w[2], q[0], q[1]]; }), wSh, midS);
      // its dark inside, seen through the mouth
      addPart('gearIn', sheet(NX, Q(8, 5), (u, v) => { const uu = 2 * u - 1, t = v * 0.30, x = hwAt(t) * uu * 0.97, y = -L * t - LIP * (1 - uu * uu) * Math.pow(1 - t, 8) - 0.0006, w = F(x, y, Math.max(0.0006, zfS(uu, t) - 0.0022)); return [w[0], w[1], w[2], 0.5, 0.5]; }), wSh, { out: V3(...F(0, -0.02, DS * 2)) });
      addPart('gearIn', sheet(NX, Q(8, 5), (u, v) => { const uu = 2 * u - 1, t = v * 0.30, x = hwAt(t) * uu * 0.97, w = F(x, -L * t + 0.0002, 0.0012); return [w[0], w[1], w[2], 0.5, 0.5]; }), wSh, { out: V3(...F(0, -0.02, -DS)) });
      // the two brass studs at the corners of the mouth
      for (const sx of [339, 444]) { const x = (sx - 391.5) * KS, y = -(496 - 448) * KS, t = -y / L; dome(F(x, y, zfS(x / hwAt(t), t) + 0.0006), 0.0036, 0, 'brass', wSh); }
      // the loop it hangs by: up behind the belt, over it and down its front to a stud. It stays with the belt while the sheath swings.
      { const SW = 33 * KS, lean = (y) => -0.20 * Math.max(0, y), wL = (x, y, z) => { const k = sm(M.y + 0.004, M.y + 0.030, y); return [BI.sheath, 1 - k, BI.hips, k]; };
        const yTop = 0.0880, zFront = BT * 2 + 0.0070;
        put('gear', slab(F, 3, Q(10, 6), (u, v) => { const x = SW * (2 * u - 1), y = lerp(-0.016, yTop, v); return [x, y, lean(y) + 0.0010, ...plainUV(u, v)]; }, 0.0030), wL, V3(...F(0, 0.04, lean(0.04) - 0.0005)));
        put('gear', slab(F, 3, Q(10, 6), (u, v) => { const x = SW * (2 * u - 1), y = lerp(0.0100, yTop, v), q = guv('sheathF', 391.5 + x / KS, 448 - y * (148 / yTop) ); return [x, y, lean(y) + zFront + 0.0030 * Math.sin(PI * v), q[0], q[1]]; }, 0.0030, (u, v) => plainUV(u, v)), wL, V3(...F(0, 0.05, lean(0.05) + zFront - 0.0015)));
        put('gear', slab(F, 3, 4, (u, v) => { const x = SW * (2 * u - 1), k = v, y = yTop + 0.0050 * Math.sin(PI * k); return [x, y, lean(yTop) + lerp(0.0010, zFront, k), ...plainUV(u, 0.4 + 0.2 * v)]; }, 0.0030), wL, V3(...F(0, yTop - 0.004, lean(yTop) + zFront / 2)));
        const ys = (448 - 408) * (yTop / 148), c = V3(...F(0, ys, lean(ys) + zFront + 0.0012)); dome(c, 0.0042, 0, 'brass', wL); }
      FOXGEAR.sheath = { M, tip, X: P.X, Y: P.Y, Z: P.Z, L, hwAt, F };

      // ---- her shears: two halves on one brass screw. Each half is its own piece on its own bone, so they can open, and come out of the sheath, later. ----
      const KG = 0.2488 / 1310, PV = [0, -0.034, 0];      // metres to one G1 pixel (26 cm long, in her frame); the screw sits 3.4 cm down inside the mouth
      const pv = V3(...F(PV[0], PV[1], 0.5 * (DS * (1 + PV[1] / L) + 0.0030)));
      addBone('shears', 'sheath', pv.x, pv.y, pv.z); addBone('shearB', 'shears', pv.x, pv.y, pv.z);
      const zMid = (yl) => 0.5 * (DS * (1 + yl / L) + 0.0030);       // half way through the sheath at that height: the blades lie down the middle of it, leaning back as it thins
      const G = (x, y, z) => F(PV[0] + x, PV[1] + y, zMid(PV[1] + y) + z);      // the shears' own space: the screw at the middle, blades pointing down, flat to the front
      const TIPY = -729 * KG, PLY = 111 * KG, PW = 37.5 * KG, TH = 0.0016;
      FOXGEAR.shears = { G, tipY: TIPY, bowA: [-58 * KG, 406 * KG], bowB: [87 * KG, 395 * KG] };      // for putting them in her hands (75_pose.js)
      for (const [nm, sgn, bow, wb] of [['A', -1, { c: [-58 * KG, 406 * KG], rx: 80 * KG - 0.0021, ry: 175 * KG - 0.0021 }, [BI.shears, 1]], ['B', 1, { c: [87 * KG, 395 * KG], rx: 60 * KG - 0.0021, ry: 94 * KG - 0.0021 }, [BI.shearB, 1]]]) {
        const wf = () => wb, z0 = sgn < 0 ? 0 : -TH;                          // half A lies in front, half B behind
        // the blade and the plate round the screw: spine on its own side, edge toward the other half
        const wAt = (y) => (y >= -8 * KG ? PW : PW * Math.pow(Math.max(0, 1 - (-8 * KG - y) / (-8 * KG - TIPY)), 0.92));
        const blade = (u, v) => { const y = lerp(PLY, TIPY, Math.pow(v, 0.9)), w = wAt(y), x = sgn * lerp(w, -0.62 * w, u), th = TH * lerp(1, 0.22, Math.pow(u, 1.4)) * (0.35 + 0.65 * sm(TIPY, TIPY + 0.03, y)); return [x, y, th]; };
        const NBL = Q(26, 14);
        addPart('steel', sheet(4, NBL, (u, v) => { const q = blade(u, v), w = G(q[0], q[1], z0 + (sgn < 0 ? q[2] : TH)); return [w[0], w[1], w[2], 0, 0]; }), wf, { out: V3(...G(0, -0.05, -0.02)) });
        addPart('steel', sheet(4, NBL, (u, v) => { const q = blade(u, v), w = G(q[0], q[1], z0 + (sgn < 0 ? 0 : TH - q[2])); return [w[0], w[1], w[2], 0, 0]; }), wf, { out: V3(...G(0, -0.05, 0.02)) });
        addPart('steel', sheet(NBL, 1, (u, v) => { const q = blade(0, u), w = G(q[0], q[1], z0 + (sgn < 0 ? q[2] * v : TH - q[2] * v)); return [w[0], w[1], w[2], 0, 0]; }), wf, { out: V3(...G(0, -0.05, z0 + TH / 2)) });      // the spine
        // the shank, from the plate up to the bow, and the bow itself: a round bar bent into an oval
        const cx = bow.c[0], cy = bow.c[1], pts = [], rad = [], NB2 = Q(40, 22);
        const j0 = [sgn * 0.0040, PLY - 0.0030], j1 = [cx, cy - bow.ry];
        for (let i = 0; i <= 6; i++) { const k = i / 6; pts.push(V3(...G(lerp(j0[0], j1[0], k * k * (3 - 2 * k)), lerp(j0[1], j1[1], k), z0 + TH / 2))); rad.push([lerp(0.0012, 0.0021, k), lerp(0.0036, 0.0024, k)]); }      // flat and wide where it leaves the plate, round where it meets the bow
        addPart('steel', loft(tubeRings(pts, rad, Q(10, 7), P.Z), { capA: true }), wf, { out: V3(...G(lerp(j0[0], j1[0], 0.5), lerp(j0[1], j1[1], 0.5), z0 + TH / 2)) });
        const bp = []; for (let i = 0; i <= NB2; i++) { const th = -PI / 2 + (i / NB2) * TAU; bp.push(V3(...G(cx + bow.rx * Math.cos(th), cy + bow.ry * Math.sin(th), z0 + TH / 2))); }
        addPart('steel', loft(tubeRings(bp, bp.map(() => [0.0021, 0.0024]), Q(10, 7), P.Z)), wf, { out: V3(...G(cx, cy, z0 + TH / 2)) });
      }
      // the brass screw, front and back, with its crossed slot
      for (const sg of [1, -1]) { const c = V3(...G(0, 0, sg > 0 ? TH + 0.0003 : -TH - 0.0003)), part = spherePart(c, 0.0059, 0.0059, 0.0059, Q(14, 9), Q(8, 6));
        for (let i = 0; i < part.pos.length; i += 3) { const d = (part.pos[i] - c.x) * P.Z.x + (part.pos[i + 1] - c.y) * P.Z.y + (part.pos[i + 2] - c.z) * P.Z.z, sq = d * (0.30 - 1); part.pos[i] += P.Z.x * sq; part.pos[i + 1] += P.Z.y * sq; part.pos[i + 2] += P.Z.z * sq; }
        addPart('brass', part, () => [BI.shears, 1], { out: c });
        if (sg > 0) for (const rot of [PI / 4, -PI / 4]) { const cs = Math.cos(rot), sn = Math.sin(rot); put('gearIn', slab((x, y, z) => G(x * cs - y * sn, x * sn + y * cs, TH + 0.0003 + 0.0019 + z), 1, 1, (u, v) => [0.0048 * (2 * u - 1), 0.00055 * (2 * v - 1), 0, 0.5, 0.5], 0.0004), () => [BI.shears, 1], V3(...G(0, 0, TH))); } }
      Object.assign(FOXGEAR.shears, { pivot: pv, KG });
    }
  })();

  // ---------- cloth: veils and skirts are sheets of particles, pinned to the skeleton and draped over body colliders ----------
  // colliders are capsules riding on bones; masks pick which sheets they touch (1 body, 2 arms, 4 legs, 8 skirt volume, 16 head)
  const COLL = [];
  function collider(bA, a, bB, b, r0, r1, mask) {
    const A = SK[bA].userData.rest, B = SK[bB].userData.rest;
    COLL.push({ ia: BI[bA], la: V3(a[0] - A.x, a[1] - A.y, a[2] - A.z), ib: BI[bB], lb: V3(b[0] - B.x, b[1] - B.y, b[2] - B.z), r0, r1: r1 == null ? r0 : r1, mask });
  }
  collider('head', [0, 1.500, 0.012], 'head', [0, 1.590, 0.000], 0.071, 0.071, 16);
  collider('neck', [0, 1.35, -0.008], 'neck', [0, 1.42, -0.004], 0.088, 0.086, 1);
  collider('spine3', [-0.075, 1.25, -0.004], 'spine3', [0.075, 1.25, -0.004], 0.112, 0.112, 1);
  collider('spine2', [-0.045, 1.15, 0.012], 'spine2', [0.045, 1.15, 0.012], 0.120, 0.120, 1);
  collider('spine1', [0, 0.99, 0], 'spine2', [0, 1.09, 0.004], 0.112, 0.118, 1);
  collider('hips', [-0.055, 0.875, 0], 'hips', [0.055, 0.875, 0], 0.132, 0.132, 1);
  collider('hips', [0, 0.86, 0.0], 'hips', [0, 0.40, 0.0], 0.185, 0.262, 8);      // the volume of the skirts, for the veils outside them
  for (const [S, s] of SIDES) {
    const sh = restPts['sh' + S], el = restPts['el' + S], wr = restPts['wr' + S], d = armDir[S], hd = wr.clone().addScaledVector(d, 0.11);
    collider('clav' + S, [s * 0.128, 1.295, -0.008], 'uarm' + S, [sh.x + s * 0.012, sh.y, sh.z], 0.070, 0.066, 2);
    collider('uarm' + S, [sh.x, sh.y, sh.z], 'farm' + S, [el.x, el.y, el.z], 0.064, 0.058, 2);
    collider('farm' + S, [el.x, el.y, el.z], 'hand' + S, [wr.x, wr.y, wr.z], 0.060, 0.078, 2);
    collider('hand' + S, [wr.x, wr.y, wr.z], 'hand' + S, [hd.x, hd.y, hd.z], 0.050, 0.036, 2);
    collider('thigh' + S, [s * 0.086, 0.815, 0], 'shin' + S, [s * 0.083, 0.47, 0.006], 0.092, 0.064, 4);
    collider('shin' + S, [s * 0.083, 0.47, 0.006], 'foot' + S, [s * 0.081, 0.13, -0.01], 0.066, 0.074, 4);
    collider('foot' + S, [s * 0.081, 0.06, -0.05], 'toe' + S, [s * 0.081, 0.055, 0.12], 0.058, 0.05, 4);
  }
  // the Fox's trouser legs and hips, for her flounces to lie on and swing against (mask 32)
  for (const [S, s] of SIDES) { collider('thigh' + S, [s * 0.106, 0.800, 0.012], 'thigh' + S, [s * 0.111, 0.520, 0.012], 0.104, 0.104, 32); collider('shin' + S, [s * 0.112, 0.460, 0.012], 'shin' + S, [s * 0.110, 0.330, 0.012], 0.103, 0.098, 32); }
  collider('hips', [-0.070, 0.865, 0.020], 'hips', [0.070, 0.865, 0.020], 0.146, 0.146, 32);
  const NCOLL = COLL.length, cW = new Float32Array(NCOLL * 6), cW0 = new Float32Array(NCOLL * 6), cS = new Float32Array(NCOLL * 8);
  const _v = V3(), _v2 = V3();
  function updateColliders(first) {
    for (let k = 0; k < NCOLL; k++) {
      const c = COLL[k], o = k * 6;
      if (!first) for (let i = 0; i < 6; i++) cW0[o + i] = cW[o + i];
      _v.copy(c.la).applyMatrix4(bones[c.ia].matrixWorld); cW[o] = _v.x; cW[o + 1] = _v.y; cW[o + 2] = _v.z;
      _v.copy(c.lb).applyMatrix4(bones[c.ib].matrixWorld); cW[o + 3] = _v.x; cW[o + 4] = _v.y; cW[o + 5] = _v.z;
      if (first) for (let i = 0; i < 6; i++) cW0[o + i] = cW[o + i];
    }
  }
  function lerpColliders(f) {                         // cS: ax, ay, az, abx, aby, abz, 1/|ab|^2, bounding radius
    for (let k = 0; k < NCOLL; k++) {
      const o = k * 6, q = k * 8;
      const ax = cW0[o] + (cW[o] - cW0[o]) * f, ay = cW0[o + 1] + (cW[o + 1] - cW0[o + 1]) * f, az = cW0[o + 2] + (cW[o + 2] - cW0[o + 2]) * f;
      const bx = cW0[o + 3] + (cW[o + 3] - cW0[o + 3]) * f, by = cW0[o + 4] + (cW[o + 4] - cW0[o + 4]) * f, bz = cW0[o + 5] + (cW[o + 5] - cW0[o + 5]) * f;
      cS[q] = ax; cS[q + 1] = ay; cS[q + 2] = az; cS[q + 3] = bx - ax; cS[q + 4] = by - ay; cS[q + 5] = bz - az;
      const l2 = cS[q + 3] * cS[q + 3] + cS[q + 4] * cS[q + 4] + cS[q + 5] * cS[q + 5];
      cS[q + 6] = l2 > 1e-10 ? 1 / l2 : 0; cS[q + 7] = Math.sqrt(l2) + Math.max(COLL[k].r0, COLL[k].r1);
    }
  }
  const cloths = [], clothGroup = new THREE.Group(); clothGroup.name = 'jester-cloth';
  // taking hold of a veil: the loose particles of the outer sheets nearest a point are carried by it until let go
  let grabbed = null;
  function grabCloth(p, reach, spread, n) {
    let best = null, bd = reach * reach;
    for (const c of cloths) { if (!c.outer) continue; for (let i = 0; i < c.n; i++) { if (c.pin[i] > 0.2) continue; const dx = c.pos[i * 3] - p.x, dy = c.pos[i * 3 + 1] - p.y, dz = c.pos[i * 3 + 2] - p.z, d = dx * dx + dy * dy + dz * dz; if (d < bd) { bd = d; best = c; best._gi = i; } } }
    if (!best) return false;
    const c = best, i0 = c._gi, cx = c.pos[i0 * 3], cy = c.pos[i0 * 3 + 1], cz = c.pos[i0 * 3 + 2], list = [];
    for (let i = 0; i < c.n; i++) { if (c.pin[i] > 0.2) continue; const d = Math.hypot(c.pos[i * 3] - cx, c.pos[i * 3 + 1] - cy, c.pos[i * 3 + 2] - cz); if (d < spread) list.push([d, i]); }
    list.sort((a, b) => a[0] - b[0]); list.length = Math.min(list.length, n || 8);
    c.grabI = new Int32Array(list.map((e) => e[1])); c.grabO = new Float32Array(list.length * 3); c.grabP = p.clone(); c.grabK = 0.5;
    list.forEach((e, m) => { c.grabO[m * 3] = (c.pos[e[1] * 3] - cx) * 0.45; c.grabO[m * 3 + 1] = (c.pos[e[1] * 3 + 1] - cy) * 0.45; c.grabO[m * 3 + 2] = (c.pos[e[1] * 3 + 2] - cz) * 0.45; });
    grabbed = c; return true;
  }
  function releaseGrab() { if (grabbed) { grabbed.grabI = null; grabbed = null; } }
  const SEAT = { on: false, x: 0, z: 0, r: 0.2, top: 0.45 };       // a round seat the cloth rests on while she sits (world space)
  const WIND = V3(0, 0, 0);                           // apparent wind in world space (the host or the walk sets it)
  // o: cols, rows, wrap, rest(c, r) -> [x,y,z], pin(c, r, p) -> 0..1, weights(c, r, p) -> [bone, w, ...], mask, margin,
  //    mat (material), uv(c, r) -> [u, v], grav, drag, bend, flutter
  function makeCloth(o) {
    const NC = o.cols, NR = o.rows, n = NC * NR, wrap = !!o.wrap;
    const pos = new Float32Array(n * 3), prev = new Float32Array(n * 3), tgt = new Float32Array(n * 3), tgt0 = new Float32Array(n * 3);
    const pin = new Float32Array(n), sI = new Uint16Array(n * 3), sW = new Float32Array(n * 3), sL = new Float32Array(n * 9), rowF = new Float32Array(n);
    const id = (c, r) => r * NC + ((c % NC) + NC) % NC;
    for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) {
      const i = id(c, r), p = o.rest(c, r); pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2];
      pin[i] = cl(o.pin(c, r, p), 0, 1); rowF[i] = r / (NR - 1);
      const w = o.weights(c, r, p); let s = 0; for (let k = 1; k < w.length && k < 6; k += 2) s += w[k];
      for (let k = 0; k < 3; k++) {
        const has = k * 2 < w.length, b = has ? w[k * 2] : 0, R = bones[b].userData.rest;
        sI[i * 3 + k] = b; sW[i * 3 + k] = has ? w[k * 2 + 1] / s : 0;
        sL[i * 9 + k * 3] = p[0] - R.x; sL[i * 9 + k * 3 + 1] = p[1] - R.y; sL[i * 9 + k * 3 + 2] = p[2] - R.z;
      }
    }
    prev.set(pos);
    // distance constraints: structure, shear and bend
    const ci = [], cj = [], cl0 = [], ck = [];
    const link = (i, j, k) => { const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2]; ci.push(i); cj.push(j); cl0.push(Math.hypot(dx, dy, dz)); ck.push(k); };
    const bendK = o.bend == null ? 0.12 : o.bend;
    for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) {
      const hasR = wrap || c < NC - 1, hasR2 = wrap || c < NC - 2;
      if (hasR) link(id(c, r), id(c + 1, r), 1);
      if (r < NR - 1) link(id(c, r), id(c, r + 1), 1);
      if (hasR && r < NR - 1) { link(id(c, r), id(c + 1, r + 1), 0.5); link(id(c + 1, r), id(c, r + 1), 0.5); }
      if (hasR2) link(id(c, r), id(c + 2, r), bendK);
      if (r < NR - 2) link(id(c, r), id(c, r + 2), bendK);
    }
    const CI = new Uint32Array(ci), CJ = new Uint32Array(cj), CL = new Float32Array(cl0), CK = new Float32Array(ck), NCON = CI.length;
    const colls = []; for (let k = 0; k < NCOLL; k++) if (COLL[k].mask & o.mask) colls.push(k);
    // render mesh: the seam column is doubled when the sheet wraps
    const VC = wrap ? NC + 1 : NC, nv = VC * NR, gpos = new Float32Array(nv * 3), gnor = new Float32Array(nv * 3), guv = new Float32Array(nv * 2), gi = [];
    for (let r = 0; r < NR; r++) for (let c = 0; c < VC; c++) { const uv = o.uv ? o.uv(c, r) : [c / (VC - 1), 1 - r / (NR - 1)]; guv[(r * VC + c) * 2] = uv[0]; guv[(r * VC + c) * 2 + 1] = uv[1]; }
    for (let r = 0; r < NR - 1; r++) for (let c = 0; c < VC - 1; c++) { const a = r * VC + c, b = a + 1, d = a + VC, e = d + 1; gi.push(a, d, b, b, d, e); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(gpos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(gnor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(guv, 2));
    geo.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(gi, 1) : new THREE.Uint16BufferAttribute(gi, 1));
    const out = { o, n, pos, prev, pin, geo, tris: gi.length / 3, meshes: [], NC, NR, id };
    // Pleats. The simulated sheet stays coarse; what is drawn is K times finer, each fine point pushed along the sheet's normal by a fixed pattern of
    // folds: gathers that deepen down the cloth, and a ripple along the hem. The pattern is worked out once; each frame only interpolates and adds.
    const PL = o.pleat, K = PL ? (PL.k || Q(3, 2)) : 1; let fine = null;
    if (K > 1) {
      const FC = (VC - 1) * K + 1, FR = (NR - 1) * K + 1, fn = FC * FR, fpos = new Float32Array(fn * 3), fnor = new Float32Array(fn * 3), fuv = new Float32Array(fn * 2), fi = [];
      const p0 = new Float32Array(fn * 3), tp = new Float32Array(NR * FC * 3), tn = new Float32Array(NR * FC * 3), dd = new Float32Array(fn), nP = PL.n || 40, amp = PL.amp || 0.007, hemA = PL.hem || 0;
      for (let fr = 0; fr < FR; fr++) for (let fc = 0; fc < FC; fc++) {
        const su = fc / (FC - 1), sv = fr / (FR - 1), k = fr * FC + fc, r0 = Math.min(NR - 2, Math.floor(fr / K)), c0 = Math.min(VC - 2, Math.floor(fc / K)), tr = fr / K - r0, tc = fc / K - c0;
        for (let q = 0; q < 2; q++) { const A = guv[(r0 * VC + c0) * 2 + q], B = guv[(r0 * VC + c0 + 1) * 2 + q], Cc = guv[((r0 + 1) * VC + c0) * 2 + q], D = guv[((r0 + 1) * VC + c0 + 1) * 2 + q]; fuv[k * 2 + q] = (A + (B - A) * tc) * (1 - tr) + (Cc + (D - Cc) * tc) * tr; }
        const env = sm(0.03, 0.30, sv) * (0.7 + 0.3 * sv);
        dd[k] = amp * env * (Math.sin(TAU * nP * su + 1.3 * Math.sin(TAU * 2 * sv) + (PL.ph || 0)) + 0.18 * Math.sin(TAU * 2 * nP * su + 2.1 + 3 * sv)) + hemA * Math.pow(sv, 5) * Math.sin(TAU * (nP + 7) * su + 0.6);
      }
      for (let fr = 0; fr < FR - 1; fr++) for (let fc = 0; fc < FC - 1; fc++) { const A = fr * FC + fc, B = A + 1, D = A + FC, E = D + 1; fi.push(A, D, B, B, D, E); }
      geo.setAttribute('position', new THREE.BufferAttribute(fpos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(fnor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(fuv, 2));
      geo.setIndex(fn > 65535 ? new THREE.Uint32BufferAttribute(fi, 1) : new THREE.Uint16BufferAttribute(fi, 1));
      out.tris = fi.length / 3; fine = { FC, FR, fpos, fnor, p0, tp, tn, dd };
    }
    const margin = o.margin || 0.01, grav = (o.grav == null ? 0.62 : o.grav) * 9.81, keep = 1 - (o.drag == null ? 0.014 : o.drag), flut = o.flutter == null ? 1 : o.flutter;
    // skinned targets: where each particle would sit if it were simply skinned to its bones
    function targets() {
      tgt0.set(tgt);
      for (let i = 0; i < n; i++) {
        let x = 0, y = 0, z = 0;
        for (let k = 0; k < 3; k++) {
          const w = sW[i * 3 + k]; if (w === 0) continue;
          const e = bones[sI[i * 3 + k]].matrixWorld.elements, lx = sL[i * 9 + k * 3], ly = sL[i * 9 + k * 3 + 1], lz = sL[i * 9 + k * 3 + 2];
          x += w * (e[0] * lx + e[4] * ly + e[8] * lz + e[12]); y += w * (e[1] * lx + e[5] * ly + e[9] * lz + e[13]); z += w * (e[2] * lx + e[6] * ly + e[10] * lz + e[14]);
        }
        tgt[i * 3] = x; tgt[i * 3 + 1] = y; tgt[i * 3 + 2] = z;
      }
    }
    out.reset = () => { targets(); tgt0.set(tgt); pos.set(tgt); prev.set(tgt); };
    out.begin = targets;
    out.step = (h, f, time, iters) => {
      const h2 = h * h, gy = -grav * h2, wx = WIND.x * h2, wy = WIND.y * h2, wz = WIND.z * h2;
      for (let i = 0; i < n; i++) {
        const a = i * 3, p = pin[i];
        const tx = tgt0[a] + (tgt[a] - tgt0[a]) * f, ty = tgt0[a + 1] + (tgt[a + 1] - tgt0[a + 1]) * f, tz = tgt0[a + 2] + (tgt[a + 2] - tgt0[a + 2]) * f;
        if (p >= 1) { prev[a] = pos[a]; prev[a + 1] = pos[a + 1]; prev[a + 2] = pos[a + 2]; pos[a] = tx; pos[a + 1] = ty; pos[a + 2] = tz; continue; }
        const x = pos[a], y = pos[a + 1], z = pos[a + 2], fr = rowF[i];
        const g = flut * fr * (0.55 * Math.sin(time * 1.7 + x * 5.1 + y * 3.3) + 0.45 * Math.sin(time * 2.9 + z * 6.3 - y * 2.1));
        let nx = x + (x - prev[a]) * keep + wx * (1 + g) * fr + g * 0.35 * h2, ny = y + (y - prev[a + 1]) * keep + gy + wy * fr, nz = z + (z - prev[a + 2]) * keep + wz * (1 + g) * fr + g * 0.25 * h2;
        if (p > 0) { nx += (tx - nx) * p; ny += (ty - ny) * p; nz += (tz - nz) * p; }
        prev[a] = x; prev[a + 1] = y; prev[a + 2] = z; pos[a] = nx; pos[a + 1] = ny; pos[a + 2] = nz;
      }
      for (let it = 0; it < iters; it++) {
        for (let k = 0; k < NCON; k++) {
          const i = CI[k], j = CJ[k], a = i * 3, b = j * 3;
          const dx = pos[b] - pos[a], dy = pos[b + 1] - pos[a + 1], dz = pos[b + 2] - pos[a + 2], d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < 1e-7) continue;
          const st = CK[k]; if (st < 1 && d < CL[k]) continue;             // shear and bend links only resist stretch
          const wi = pin[i] >= 1 ? 0 : 1, wj = pin[j] >= 1 ? 0 : 1, ws = wi + wj; if (ws === 0) continue;
          const s = (d - CL[k]) / d * (st < 1 ? st : 1) / ws;
          if (wi) { pos[a] += dx * s; pos[a + 1] += dy * s; pos[a + 2] += dz * s; }
          if (wj) { pos[b] -= dx * s; pos[b + 1] -= dy * s; pos[b + 2] -= dz * s; }
        }
      }
      // collisions
      for (let i = 0; i < n; i++) {
        if (pin[i] >= 1) continue;
        const a = i * 3; let x = pos[a], y = pos[a + 1], z = pos[a + 2], hit = false;
        for (let m = 0; m < colls.length; m++) {
          const k = colls[m], q = k * 8, C = COLL[k];
          const px = x - cS[q], py = y - cS[q + 1], pz = z - cS[q + 2], R = cS[q + 7] + margin;
          if (px * px + py * py + pz * pz > R * R) continue;
          let t = (px * cS[q + 3] + py * cS[q + 4] + pz * cS[q + 5]) * cS[q + 6]; t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = px - cS[q + 3] * t, dy = py - cS[q + 4] * t, dz = pz - cS[q + 5] * t, rr2 = C.r0 + (C.r1 - C.r0) * t + margin, d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < rr2 * rr2 && d2 > 1e-12) { const d = Math.sqrt(d2), s = rr2 / d; x = cS[q] + cS[q + 3] * t + dx * s; y = cS[q + 1] + cS[q + 4] * t + dy * s; z = cS[q + 2] + cS[q + 5] * t + dz * s; hit = true; }
        }
        if (y < 0.012) { y = 0.012; hit = true; }
        if (SEAT.on && y < SEAT.top) { const sx = x - SEAT.x, sz = z - SEAT.z, d2 = sx * sx + sz * sz; if (d2 < SEAT.r * SEAT.r) { if (y > SEAT.top - 0.07) y = SEAT.top; else { const d = Math.sqrt(d2) || 1e-6, q = SEAT.r / d; x = SEAT.x + sx * q; z = SEAT.z + sz * q; } hit = true; } }
        if (hit) { pos[a] = x; pos[a + 1] = y; pos[a + 2] = z; prev[a] += (x - prev[a]) * 0.35; prev[a + 1] += (y - prev[a + 1]) * 0.35; prev[a + 2] += (z - prev[a + 2]) * 0.35; }
      }
      if (out.grabI) {                                 // particles held in her fingers go where the fingers go
        const gi = out.grabI, go = out.grabO, gp = out.grabP, gk = out.grabK;
        for (let m = 0; m < gi.length; m++) { const a = gi[m] * 3; for (let q = 0; q < 3; q++) { const tv = (q === 0 ? gp.x : q === 1 ? gp.y : gp.z) + go[m * 3 + q]; pos[a + q] += (tv - pos[a + q]) * gk; prev[a + q] += (pos[a + q] - prev[a + q]) * 0.6; } }
      }
    };
    out.finish = () => {
      for (let r = 0; r < NR; r++) for (let c = 0; c < VC; c++) {
        const cc = c % NC, i = r * NC + cc, v = (r * VC + c) * 3;
        const il = r * NC + (wrap ? (cc + NC - 1) % NC : Math.max(0, cc - 1)), ir = r * NC + (wrap ? (cc + 1) % NC : Math.min(NC - 1, cc + 1));
        const iu = Math.max(0, r - 1) * NC + cc, idn = Math.min(NR - 1, r + 1) * NC + cc;
        const ax = pos[ir * 3] - pos[il * 3], ay = pos[ir * 3 + 1] - pos[il * 3 + 1], az = pos[ir * 3 + 2] - pos[il * 3 + 2];
        const bx = pos[idn * 3] - pos[iu * 3], by = pos[idn * 3 + 1] - pos[iu * 3 + 1], bz = pos[idn * 3 + 2] - pos[iu * 3 + 2];
        let nx = by * az - bz * ay, ny = bz * ax - bx * az, nz = bx * ay - by * ax; const l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        gpos[v] = pos[i * 3]; gpos[v + 1] = pos[i * 3 + 1]; gpos[v + 2] = pos[i * 3 + 2]; gnor[v] = nx / l; gnor[v + 1] = ny / l; gnor[v + 2] = nz / l;
      }
      if (fine) {
        const FC = fine.FC, FR = fine.FR, fpos = fine.fpos, fnor = fine.fnor, p0 = fine.p0, tp = fine.tp, tn = fine.tn, dd = fine.dd, W3 = FC * 3;
        for (let r = 0; r < NR; r++) for (let fc = 0; fc < FC; fc++) {              // along each simulated row
          const c0 = Math.min(VC - 2, (fc / K) | 0), t = fc / K - c0, a = (r * VC + c0) * 3, k = (r * FC + fc) * 3;
          tp[k] = gpos[a] + (gpos[a + 3] - gpos[a]) * t; tp[k + 1] = gpos[a + 1] + (gpos[a + 4] - gpos[a + 1]) * t; tp[k + 2] = gpos[a + 2] + (gpos[a + 5] - gpos[a + 2]) * t;
          tn[k] = gnor[a] + (gnor[a + 3] - gnor[a]) * t; tn[k + 1] = gnor[a + 1] + (gnor[a + 4] - gnor[a + 1]) * t; tn[k + 2] = gnor[a + 2] + (gnor[a + 5] - gnor[a + 2]) * t;
        }
        for (let fr = 0; fr < FR; fr++) {                                         // then down between the rows
          const r0 = Math.min(NR - 2, (fr / K) | 0), t = fr / K - r0, ra = r0 * W3, ko = fr * W3;
          for (let j = 0; j < W3; j++) { p0[ko + j] = tp[ra + j] + (tp[ra + W3 + j] - tp[ra + j]) * t; fnor[ko + j] = tn[ra + j] + (tn[ra + W3 + j] - tn[ra + j]) * t; }
        }
        for (let fr = 0; fr < FR; fr++) for (let fc = 0; fc < FC; fc++) {          // push each point out along the fold pattern and lean its normal with the fold
          const k = fr * FC + fc, k3 = k * 3, kl = fc > 0 ? k - 1 : k, kr = fc < FC - 1 ? k + 1 : k, d = dd[k];
          const ex = p0[kr * 3] - p0[kl * 3], ey = p0[kr * 3 + 1] - p0[kl * 3 + 1], ez = p0[kr * 3 + 2] - p0[kl * 3 + 2], sl = (dd[kr] - dd[kl]) / (ex * ex + ey * ey + ez * ez + 1e-9);
          const nx = fnor[k3], ny = fnor[k3 + 1], nz = fnor[k3 + 2];
          fpos[k3] = p0[k3] + nx * d; fpos[k3 + 1] = p0[k3 + 1] + ny * d; fpos[k3 + 2] = p0[k3 + 2] + nz * d;
          fnor[k3] = nx - sl * ex; fnor[k3 + 1] = ny - sl * ey; fnor[k3 + 2] = nz - sl * ez;
        }
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
    };
    cloths.push(out); return out;
  }
  let clothReady = false, clothAcc = 0;
  const H_SUB = 1 / 120;
  function stepCloth(dt, time) {
    if (!clothReady) {                                // first frame: lay every sheet on its bones, then let it settle
      updateColliders(true); for (const c of cloths) c.reset(); lerpColliders(1);
      for (let k = 0; k < 90; k++) for (const c of cloths) c.step(H_SUB, 1, time, 3);
      clothReady = true;
    }
    updateColliders(false); for (const c of cloths) c.begin();
    let nsub = Math.round(cl(dt, 0, 0.05) / H_SUB); nsub = cl(nsub, dt > 0 ? 1 : 0, 5);
    for (let s = 1; s <= nsub; s++) { const f = s / nsub; lerpColliders(f); for (const c of cloths) c.step(H_SUB, f, time, DET < 0.75 ? 2 : 3); }
    for (const c of cloths) c.finish();
  }
  function resetCloth() { clothReady = false; }

  // ---------- the sheets themselves ----------
  // Their resting shapes follow one envelope measured from her turnaround sprites: half-width (x) and half-depth (z) of the
  // whole costume at each height. The great veil lies on it; each layer beneath sits a little inside the one above.
  const ENV = [[1.30, [0.255, 0.17]], [1.20, [0.295, 0.22]], [1.10, [0.335, 0.24]], [1.00, [0.37, 0.27]], [0.90, [0.395, 0.285]], [0.80, [0.40, 0.305]], [0.70, [0.41, 0.325]],
    [0.60, [0.41, 0.34]], [0.50, [0.40, 0.34]], [0.40, [0.40, 0.335]], [0.30, [0.41, 0.34]], [0.20, [0.425, 0.345]], [0, [0.44, 0.35]]];
  const tri = (x) => Math.abs((((x % 1) + 1.5) % 1) - 0.5) * 2;      // 0 at whole numbers, 1 halfway between
  const ell = (rx, rz, a, y, zc) => V3(rx * Math.sin(a), y, (zc || 0) - rz * Math.cos(a));   // a: angle from the back toward her left
  const envPt = (a, y, inset, k) => { const e = prof(ENV, y, true); return ell((e[0] - inset) * (k || 1), (e[1] - inset) * (k || 1), a, y, 0); };
  // rows spaced evenly along a falling path, stopping where it reaches the hem height
  function dropRows(ctrl, hemY, NR, gamma) {
    const pts = curvePts(ctrl, 160), cum = [0]; let end = pts.length - 1, endF = 0;
    for (let i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
      if (pts[i].y <= hemY && pts[i - 1].y > hemY && i > 8) { end = i; endF = (pts[i - 1].y - hemY) / (pts[i - 1].y - pts[i].y); break; }
    }
    const L = end === pts.length - 1 && endF === 0 ? cum[end] : cum[end - 1] + (cum[end] - cum[end - 1]) * endF, rows = []; let k = 1;
    for (let r = 0; r < NR; r++) {
      const s = L * Math.pow(r / (NR - 1), gamma || 1);
      while (k < pts.length - 1 && cum[k] < s) k++;
      const u = cl((s - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1]), 0, 1), p = pts[k - 1].clone().lerp(pts[k], u);
      rows.push([p.x, p.y, p.z]);
    }
    return rows;
  }
  const wHang = (p) => {                              // bones for a hanging particle (used to lay the sheet out, not to drive it)
    const y = p[1]; if (y > 1.47) return [BI.head, 1];
    if (y > 1.33) { const u = sm(1.33, 1.47, y); return [BI.head, u, BI.spine3, 1 - u]; }
    return wSpine(y);
  };
  function sheerMat(tex, o) {
    const m = new THREE.MeshStandardMaterial({ map: tex.map, alphaMap: tex.alpha, transparent: true, depthWrite: false, roughness: o.rough == null ? 0.6 : o.rough, metalness: 0.05,
      emissive: lin(o.glow || '#ffffff'), emissiveMap: tex.map, emissiveIntensity: o.emi == null ? 0.2 : o.emi, opacity: o.opacity == null ? 1 : o.opacity });
    return sheen(m, o.sheen || '#ffb0d0', 2.2, o.sheenK == null ? 0.3 : o.sheenK, o.shot);
  }
  function addSheer(cloth, tex, o, order) {            // back faces first, then front faces, so a sheet sorts against itself
    for (const side of [THREE.BackSide, THREE.FrontSide]) {
      const m = sheerMat(tex, o); m.side = side;
      const mesh = new THREE.Mesh(cloth.geo, m); mesh.frustumCulled = false; mesh.renderOrder = order + (side === THREE.FrontSide ? 0.5 : 0);
      mesh.castShadow = side === THREE.FrontSide; mesh.receiveShadow = false; clothGroup.add(mesh); cloth.meshes.push(mesh);
    }
  }
  function addSolid(cloth, tex, o, order) {            // near-opaque cloth: depth-written, so tiers sort themselves and shade each other
    const m = new THREE.MeshStandardMaterial({ map: tex.map, alphaMap: tex.alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: o.rough == null ? 1 : o.rough, metalness: 0, envMapIntensity: 0.25,
      emissive: lin(o.glow || '#ffffff'), emissiveMap: tex.map, emissiveIntensity: o.emi == null ? 0.1 : o.emi });
    sheen(m, o.sheen || '#ffb0d0', 2.4, o.sheenK == null ? 0.2 : o.sheenK);
    const mesh = new THREE.Mesh(cloth.geo, m); mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true; mesh.renderOrder = order; clothGroup.add(mesh); cloth.meshes.push(mesh);
  }
  function addCut(cloth, mat, order) {
    const mesh = new THREE.Mesh(cloth.geo, mat); mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true; mesh.renderOrder = order; clothGroup.add(mesh); cloth.meshes.push(mesh);
  }
  // the black skirt is slim; the wide silhouette is the veils fanned out behind her
  const SKIRT_R = [[1.04, [0.108, 0.086]], [0.975, [0.132, 0.108]], [0.87, [0.158, 0.138]], [0.70, [0.198, 0.180]], [0.50, [0.250, 0.212]], [0.30, [0.262, 0.224]], [0, [0.266, 0.228]]];
  const skirtZc = (y) => 0;
  const skirtPath = (a, fold, nf, ph) => SKIRT_R.map(([y, [rx, rz]]) => { const k = 1 + fold * sm(0.98, 0.5, y) * Math.sin(a * nf + ph); return ell(rx * k, rz * k, a, y, 0); });
  let skirtCloth, overCloth, mantleCloth; const ribbonCloths = [];
  (function buildSkirt() {
    const NC = Q(84, 44), NR = Q(18, 10), cols = [];
    const hem = (a) => { const f = Math.abs(a) / PI; return lerp(0.24, 0.84, Math.pow(sm(0.62, 0.84, f), 1.1)) + 0.05 * tri(a / (TAU / 11)) - 0.02 + 0.03 * (h1(Math.round(a * 20)) - 0.5); };
    for (let c = 0; c < NC; c++) { const a = -PI + (c / NC) * TAU; cols.push(dropRows(skirtPath(a, 0.075, 19, 0.6), hem(a), NR, 1.06)); }
    skirtCloth = makeCloth({ pleat: { n: 30, amp: 0.010, hem: 0.022 }, cols: NC, rows: NR, wrap: true, mask: 1 | 4, margin: 0.007, bend: 0.25, grav: 0.8, drag: 0.02, flutter: 0.5,
      rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.5 : 0.05), weights: (c, r, p) => (r < 2 ? [BI.hips, 0.5, BI.spine1, 0.5] : [BI.hips, 1]),
      uv: (c, r) => [c / NC * 3, 1 - r / (NR - 1)] });
    const tex = raggedTex(1024, 512, '#2b2229', '#4a3d48', '#120d12', 'gauze'); tex.map.wrapS = tex.alpha.wrapS = THREE.RepeatWrapping;
    addCut(skirtCloth, sheen(new THREE.MeshStandardMaterial({ map: tex.map, alphaMap: tex.alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }), '#94848e', 2.2, 0.55), 1);
  })();

  // the olive overskirt: hung from the belt over the black, open in front, falling in gold-trimmed points
  (function buildOverskirt() {
    const A = 140 * DEG, NC = Q(53, 29), NR = Q(16, 10), cols = [];
    const hem = (a) => { const d = Math.abs(a) / DEG; return 0.40 + 0.10 * Math.pow(tri((d - 20) / 40), 0.9) + 0.14 * sm(120, 140, d); };
    for (let c = 0; c < NC; c++) { const a = lerp(-A, A, c / (NC - 1)); cols.push(dropRows(skirtPath(a, 0.07, 21, 2.1).map((p) => { p.x *= 1.07; p.z *= 1.07; return p; }), hem(a), NR, 1.05)); }
    overCloth = makeCloth({ pleat: { n: 20, amp: 0.009, hem: 0.008, ph: 1.1 }, cols: NC, rows: NR, mask: 1 | 4, margin: 0.02, bend: 0.2, grav: 0.7, flutter: 0.8,
      rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.5 : 0.045), weights: (c, r) => (r < 2 ? [BI.hips, 0.5, BI.spine1, 0.5] : [BI.hips, 1]) });
    const otex = raggedTex(1024, 512, '#4a3c1c', '#6e5a2a', '#241c0c', 'olive');
    addCut(overCloth, sheen(new THREE.MeshStandardMaterial({ map: otex.map, alphaMap: otex.alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }), '#b89048', 2.2, 0.3), 4);
  })();

  // two shorter tiers of ragged black gauze above them, as painted: each a little wider than the one beneath, open at the front
  (function buildTiers() {
    const tex = raggedTex(1024, 512, '#2e242b', '#52434e', '#140e13', 'gauze'); tex.map.wrapS = tex.alpha.wrapS = THREE.RepeatWrapping;
    for (const [k, A, hem0, amp, np, ph, NR, order] of [[1.03, 126, 0.36, 0.05, 9, 0.9, Q(18, 10), 4.2], [1.055, 130, 0.48, 0.05, 8, 2.9, Q(15, 9), 4.35], [1.085, 134, 0.60, 0.045, 9, 2.3, Q(12, 7), 4.6], [1.11, 138, 0.74, 0.04, 7, 4.1, Q(9, 6), 4.75]]) {
      const NC = Q(61, 33), cols = [], Ar = A * DEG;
      const hem = (a) => hem0 + amp * (tri(a / (TAU / np) + ph) - 0.4) + 0.035 * (h1(Math.round(a * 23 + ph * 7)) - 0.5) + 0.10 * sm(A - 22, A, Math.abs(a) / DEG);
      for (let c = 0; c < NC; c++) {
        const a = lerp(-Ar, Ar, c / (NC - 1));
        cols.push(dropRows(skirtPath(a, 0.10, 23, ph * 3).map((p) => { const f = 1 + (k - 1) * sm(1.04, 0.8, p.y) + 0.015 * sm(0.9, 0.5, p.y); p.x *= f; p.z *= f; return p; }), hem(a), NR, 1.05));
      }
      const cloth = makeCloth({ pleat: { n: 20, amp: 0.010, hem: 0.026, ph: ph }, cols: NC, rows: NR, mask: 1 | 4, margin: 0.012 + (k - 1) * 0.04, bend: 0.3, grav: 0.7, drag: 0.02, flutter: 0.7,
        rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.5 : 0.07), weights: (c, r) => (r < 2 ? [BI.hips, 0.5, BI.spine1, 0.5] : [BI.hips, 1]),
        uv: (c, r) => [c / (NC - 1) * 3, 1 - r / (NR - 1)] });
      addCut(cloth, sheen(new THREE.MeshStandardMaterial({ map: tex.map, alphaMap: tex.alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.92 }), '#94848e', 2.2, 0.5), order);
    }
  })();

  // olive shoulder kerchiefs: a small sheer point over each upper arm, gold-trimmed
  (function buildPanels() {
    const tex = veilTex(512, 512, { top: '#3a2c12', mid: '#443416', bottom: '#382a10', glow: '#5e4a20', dark: '#161006', mottle: ['#52401a', '#20170a'], motif: PAL.goldDk, a0: 1, folds: 0.5, stripes: 5, sequins: 120, trim: 0.08, sideTrim: 0.035, dotScale: 1.4, bake: 'olive', bakeTiles: [2, 2] });
    for (const [S, s] of SIDES) {
      const A0 = 66 * DEG, A1 = 132 * DEG, AM = 99 * DEG, NC = Q(17, 11), NR = Q(12, 8), cols = [];
      const hem = (a) => 1.05 + 0.24 * Math.pow(Math.abs(a - AM) / (33 * DEG), 1.1);
      for (let c = 0; c < NC; c++) {
        const a = lerp(A0, A1, c / (NC - 1)), sa = s * a;
        const ctrl = [ell(0.086, 0.080, sa, 1.374, -0.010), ell(0.132, 0.110, sa, 1.344, -0.010), envPt(sa, 1.28, -0.012), envPt(sa, 1.16, -0.014), envPt(sa, 1.02, -0.014), envPt(sa, 0.90, -0.014)];
        cols.push(dropRows(ctrl, hem(a), NR, 1));
      }
      const cloth = makeCloth({ pleat: { n: 5, amp: 0.004, hem: 0.004 }, cols: NC, rows: NR, mask: 1 | 2, margin: 0.020, bend: 0.25, grav: 0.7, flutter: 0.5,
        rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.5 : 0.03),
        weights: (c, r, p) => (p[1] > 1.33 ? [BI.spine3, 0.6, BI.neck, 0.4] : p[1] > 1.2 ? [BI['uarm' + S], 0.35, BI.spine3, 0.65] : [BI['uarm' + S], 0.75, BI.spine3, 0.25]) });
      addSolid(cloth, tex, { glow: '#8a7038', emi: 0.06, sheen: '#a88440', sheenK: 0.12 }, 9); cloth.outer = true;
    }
  })();

  // the great veil and the shorter tier beneath it: pinned over the back of the cap, falling past her shoulders, caught at each wrist
  (function buildMantles() {
    // the sheer veil is red shot with gold: one cloth that shows two colours as the light and the folds turn
    const SHEER = { glow: '#d8486e', emi: 0.22, sheen: '#f0b464', sheenK: 0.20, rough: 0.5, shot: { c: '#f0b450', k: 0.72, p: 1.25 } }, WINE = { glow: '#c83080', emi: 0.14, sheen: '#e0508c', sheenK: 0.16 }, OLIVE = { glow: '#8a7038', emi: 0.12, sheen: '#c8a050', sheenK: 0.2 };
    let mainTex = null;
    const TIERS = [
      // the innermost tier: wine in shadow, the face of the fan seen from the front
      { pleat: { n: 18, amp: 0.012, hem: 0.006 }, A: 114, inset: 0.020, ph: 9, up: 0, cap: 80, flat: 0.76, amp: 0.34, per: 38, shawl: true, order: 6, margin: 0.012, cols: Q(49, 27), rows: Q(40, 22), mat: WINE,
        tex: { top: '#3a061c', mid: '#500a2c', bottom: '#66103a', glow: '#941e58', dark: '#14020a', mottle: ['#7a143c', '#20040c', '#4a0e42'], a0: 1, folds: 0.9, stripes: 15, sequins: 400, trim: 0.03, sideTrim: 0.012, dotScale: 1.4, bake: 'wine', bakeTiles: [8, 4] } },
      // the great veil: deep wine, gold-dotted lines, a band of gold down the middle
      { pleat: { n: 30, amp: 0.010, hem: 0.012, ph: 0.7 }, A: 108, hk: 0.48, rise: 0.0010, inset: 0.012, ph: 0, up: 0, cap: 80, amp: 0.20, order: 8, margin: 0.008, cols: Q(73, 37), rows: Q(52, 28), main: true, sheer: true, mat: SHEER,
        tex: { top: '#5a0c3a', mid: '#78144e', bottom: '#8e2064', glow: '#c040a0', dark: '#2a0620', mottle: ['#a02468', '#3a0a2a', '#6a2090'], a0: 0.58, folds: 0.5, stripes: 17, center: true, sequins: 700, trim: 0.02, sideTrim: 0.008, dotScale: 1.6, whole: 'veil', wash: '#d2b4c8' } },
      // a short top tier over her shoulders and back, brighter
      { pleat: { n: 23, amp: 0.008, hem: 0.010, ph: 2.2 }, A: 108, hk: 0.48, inset: 0, ph: 9, up: 0.30, cap: 40, amp: 0.18, order: 9, margin: 0.014, cols: Q(57, 31), rows: Q(30, 18), sheer: true, mat: SHEER,
        tex: { top: '#64103e', mid: '#841a56', bottom: '#9c2870', glow: '#d050a8', dark: '#2e0822', mottle: ['#b02c74', '#40102e', '#7428a0'], a0: 0.55, folds: 0.5, stripes: 13, sequins: 420, trim: 0.03, sideTrim: 0.009, dotScale: 1.6, whole: 'veilTop', wash: '#d2b4c8' } }
    ];
    for (const T of TIERS) {
      const A = T.A * DEG, NC = T.cols, NR = T.rows, cols = [];
      const hem = (a) => { const d = Math.abs(a) / DEG + T.ph; return T.flat ? T.flat + T.amp * (tri(d / (T.per || 30)) - 0.5) : Math.max(0.07, T.up + 0.09 + (T.rise || 0.0062) * Math.min(d, T.cap) + T.amp * (tri(d / 30) - 0.5)); };
      for (let c = 0; c < NC; c++) {
        const a = lerp(-A, A, c / (NC - 1)), f = Math.abs(a) / A;
        const k = (y) => 1 + sm(1.32, 0.6, y) * (0.085 * Math.sin(a * 17 + 1.3 * Math.sin(a * 2.3) + T.ph) + 0.03 * Math.sin(a * 39 + 0.7));
        const hk = T.hk || 0.44, P0 = headPoint(PI - a * hk, 0.30 + 0.92 * Math.pow(f, 1.4), 0.016 - T.inset * 0.3), P1 = headPoint(PI - a * hk * 1.14, 1.74, 0.018 - T.inset * 0.3);
        const ctrl = T.shawl ? [ell(0.050, 0.048, a * 0.78, 1.404, -0.008), ell(0.098, 0.086, a * 0.78, 1.380, -0.012), ell(0.131, 0.111, a * 0.78, 1.349, -0.014)]
          : [V3(P0[0], P0[1], P0[2]), V3(P1[0], P1[1], P1[2]), ell(0.128, 0.108, a * 0.78, 1.345, -0.014)];
        for (const y of [1.26, 1.10, 0.90, 0.70, 0.50, 0.30, 0.10, 0]) ctrl.push(envPt(a, y, T.inset, k(y)));
        cols.push(dropRows(ctrl, hem(a), NR, 1));
      }
      const wristPin = (p) => { const S = p[0] < 0 ? 'R' : 'L', w = restPts['wr' + S]; return 1 - sm(0.05, 0.11, Math.hypot(p[0] - w.x * 1.33, p[1] - (w.y + 0.04), p[2] - w.z)); };
      const cloth = makeCloth({ pleat: T.pleat, cols: NC, rows: NR, mask: 1 | 2 | 8 | 16, margin: T.margin, bend: 0.14, grav: 0.6, drag: 0.016, flutter: 1,
        rest: (c, r) => cols[c][r],
        pin: (c, r, p) => { const u = r / (NR - 1); return Math.max(r === 0 ? 1 : u < 0.1 ? lerp(0.9, 0.12, u / 0.1) : lerp(0.06, 0.022, u), wristPin(p)); },
        weights: (c, r, p) => (wristPin(p) > 0.02 ? [BI['farm' + (p[0] < 0 ? 'R' : 'L')], 1] : T.shawl && p[1] > 1.25 ? [BI.spine3, 1] : wHang(p)) });
      const vt = veilTex(1024, T.rows > 24 ? 1024 : 512, T.tex); if (T.main) mainTex = vt;
      (T.sheer ? addSheer : addSolid)(cloth, vt, T.mat, T.order);
      cloth.outer = true;                           // the veils and the shawl: the layers worn over the base outfit
      if (T.main) mantleCloth = cloth;
    }
    // The veil's two front falls. It is one cloth: gathered at the knot on her crown, it comes forward in front of each horn, down past
    // her cheek, over the front of the shoulder and round to meet the great veil at her side. (These were fourteen separate ribbons;
    // Chris asked for one cloth and no strips, November 11.) Each fall wears the edge of the great veil's own painting, gold trim to the face.
    const HEMF = [0.80, 0.71, 0.63, 0.68, 0.60, 0.65, 0.57];
    for (const [S, s] of SIDES) {
      const NC = Q(15, 9), NR = Q(36, 20), cols = [];
      for (let c = 0; c < NC; c++) {
        const k = 6 * c / (NC - 1), P1 = headPoint(s * (38 + k * 10) * DEG, 0.72, 0.011), P2 = headPoint(s * (64 + k * 8) * DEG, 1.40, 0.015);
        const ctrl = [V3(s * 0.004 * (k + 1), 1.657, 0.010), V3(P1[0], P1[1], P1[2]), V3(P2[0], P2[1], P2[2]), V3(s * (0.088 + 0.008 * k), 1.435, 0.060 - 0.012 * k),
          V3(s * (0.094 + 0.019 * k), 1.30, 0.108 - 0.012 * k), V3(s * (0.092 + 0.024 * k), 1.12, 0.138 - 0.013 * k), V3(s * (0.112 + 0.024 * k), 0.90, 0.150 - 0.013 * k),
          V3(s * (0.115 + 0.025 * k), 0.70, 0.150 - 0.013 * k), V3(s * (0.118 + 0.025 * k), 0.50, 0.148 - 0.013 * k)];
        cols.push(dropRows(ctrl, crom(HEMF, k), NR, 1));
      }
      const cloth = makeCloth({ pleat: { n: 5, amp: 0.007, hem: 0.008, ph: s }, cols: NC, rows: NR, mask: 1 | 2 | 16, margin: 0.024, bend: 0.22, grav: 0.7, drag: 0.018, flutter: 0.8,
        rest: (c, r) => cols[c][r], pin: (c, r, p) => (r === 0 ? 1 : p[1] > 1.46 ? lerp(1, 0.5, sm(1.70, 1.46, p[1])) : 0.03), weights: (c, r, p) => wHang(p),
        uv: (c, r) => [s > 0 ? 0.27 * c / (NC - 1) : 1 - 0.27 * c / (NC - 1), 1 - r / (NR - 1)] });
      addSheer(cloth, mainTex, SHEER, 10 + (s > 0 ? 0.2 : 0)); cloth.outer = true;
    }
  })();

  // The veil is one sheet of sheer cloth. There were also fourteen ribbon strands from the knot on her crown, framing her face
  // and falling over the bodice; Chris had them taken away (November 11): they read as strips of cloth hanging down her front.
  (function buildKnot() {
    // the knot between the horns
    const kc = V3(0, 1.657, 0.004), wf = wOne('head');
    addPart('wine', spherePart(kc, 0.030, 0.017, 0.026, 14, 8), wf, { out: kc });
    for (const sx of [-1, 1]) { const c2 = V3(sx * 0.03, 1.664, 0.0); addPart('wine', spherePart(c2, 0.022, 0.013, 0.018, 12, 8), wf, { out: c2 }); }
  })();

  // ---------- belt and buckle ----------
  (function buildBelt() {
    const rings = [], NU = Q(48, 24), prof2 = [[WAIST - 0.025, 0.004], [WAIST - 0.020, 0.0095], [WAIST, 0.0108], [WAIST + 0.020, 0.0095], [WAIST + 0.025, 0.004]];
    for (const [y, g] of prof2) { const [rx, rzF, rzB, cz] = prof(TORSO, y, true); rings.push(ringXZ(0, y, cz, rx + g, rzF + g, rzB + g, NU, TPW)); }
    addPart('leather', loft(rings), (x, y) => [BI.hips, 0.5, BI.spine1, 0.5], { out: V3(0, WAIST, 0) });
    const wf = () => [BI.hips, 0.5, BI.spine1, 0.5], zf = prof(TORSO, WAIST, true)[1] + 0.012;
    // buckle: a rounded gold frame and its prong
    const fr = []; for (let j = 0; j < 16; j++) { const a = (j / 16) * TAU, c = Math.cos(a), s = Math.sin(a); fr.push(V3(0.029 * Math.sign(c) * Math.pow(Math.abs(c), 0.5), WAIST + 0.0215 * Math.sign(s) * Math.pow(Math.abs(s), 0.5), zf + 0.003)); }
    fr.push(fr[0].clone());
    addPart('gold', loft(tubeRings(fr, fr.map(() => 0.0042), 8, V3(0, 0, 1))), wf, { out: V3(0, WAIST, zf + 0.1), weld: true });
    addPart('gold', loft(tubeRings([V3(-0.027, WAIST, zf + 0.005), V3(0.016, WAIST, zf + 0.007)], [0.0028, 0.002], 6), { capB: true }), wf, { out: V3(0, WAIST + 0.005, zf + 0.1) });
    for (let k = 0; k < 14; k++) {                    // studs round the belt
      const a = (k + 0.5) / 14 * TAU; if (Math.abs(Math.sin(a)) < 0.25 && Math.cos(a) > 0) continue;
      const [rx, rzF, rzB] = prof(TORSO, WAIST, true), c = V3((rx + 0.0095) * Math.sin(a), WAIST, (Math.cos(a) >= 0 ? rzF : rzB) * Math.cos(a) + Math.sign(Math.cos(a)) * 0.0095);
      addPart('gold', spherePart(c, 0.0045, 0.0045, 0.0045, 8, 5), wf, { out: c });
    }
  })();

  (function buildPouch() {
    const a = -150 * DEG, y = WAIST - 0.072, [rx, rz] = prof(SKIRT_R, y, true), c = ell(rx + 0.020, rz + 0.020, a, y, 0), wf = () => [BI.hips, 0.6, BI.spine1, 0.4];
    const yaw = Math.atan2(c.x, c.z), R = (p) => { const x = p[0], z = p[2]; return [c.x + x * Math.cos(yaw) + z * Math.sin(yaw), c.y + p[1], c.z - x * Math.sin(yaw) + z * Math.cos(yaw)]; };
    const turn = (part) => { for (let i = 0; i < part.pos.length; i += 3) { const q = R([part.pos[i], part.pos[i + 1], part.pos[i + 2]]); part.pos[i] = q[0]; part.pos[i + 1] = q[1]; part.pos[i + 2] = q[2]; } return part; };
    addPart('leather', turn(spherePart(V3(0, -0.006, 0), 0.046, 0.054, 0.021, 22, 14)), wf, { out: c });                 // the bag
    addPart('leather', turn(spherePart(V3(0, 0.028, 0.005), 0.048, 0.026, 0.021, 22, 12)), wf, { out: c });            // its flap
    addPart('gold', turn(spherePart(V3(0, 0.008, 0.0255), 0.0090, 0.0070, 0.0034, 12, 8)), wf, { out: c });            // the buckle
    addPart('leather', turn(spherePart(V3(-0.075, 0.004, -0.030), 0.030, 0.036, 0.016, 16, 10)), wf, { out: c });    // a smaller pouch behind it
    addPart('gold', turn(spherePart(V3(-0.075, 0.010, -0.013), 0.0050, 0.0050, 0.0028, 10, 6)), wf, { out: c });
    addPart('leather', turn(loft(tubeRings([V3(-0.020, 0.044, 0.004), V3(-0.020, 0.078, -0.006)], [0.006, 0.006], 6))), wf, { out: c });   // two loops to the belt
    addPart('leather', turn(loft(tubeRings([V3(0.020, 0.044, 0.004), V3(0.020, 0.078, -0.006)], [0.006, 0.006], 6))), wf, { out: c });
  })();

  // ---------- the hip bells: a beaded gold chain from the belt at her left hip, ending in a cluster of bells ----------
  // the chain lies on the front of the skirt, so each joint rests just outside the cloth
  const skirtZ = (x, y) => { const [rx, rz] = prof(SKIRT_R, y, true); return skirtZc(y) + rz * Math.sqrt(Math.max(0.05, 1 - Math.pow(x / rx, 2))); };
  const BELL_X = 0.074, BELL_Y = [0.972, 0.914, 0.856, 0.798];
  const bellRest = BELL_Y.map((y) => V3(BELL_X, y, skirtZ(BELL_X, y) + 0.036));
  const bellGeo = { bells: [] };
  (function buildBells() {
    let par = 'hips';
    for (let k = 0; k < 4; k++) { addBone('bell' + k, par, bellRest[k].x, bellRest[k].y, bellRest[k].z); par = 'bell' + k; }
    for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) { const c = bellRest[k].clone().lerp(bellRest[k + 1], (i + 0.5) / 6); addPart('bells', spherePart(c, 0.0048, 0.0052, 0.0048, 8, 6), wOne('bell' + k), { out: c }); }
    const base = SK.bell3.userData.rest, wf = wOne('bell3');
    const CL = [[0, -0.014, 0, 0.0185], [-0.019, -0.030, 0.006, 0.0195], [0.019, -0.032, 0.004, 0.019], [-0.008, -0.056, 0.010, 0.0205], [0.014, -0.062, -0.002, 0.0185], [0.0, -0.040, -0.016, 0.018]];
    for (const [dx, dy, dz, r] of CL) {
      const c = V3(base.x + dx, base.y + dy, base.z + dz);
      addPart('bells', spherePart(c, r, r, r, 16, 12), wf, { out: c });
      const lp = []; for (let j = 0; j <= 8; j++) { const a = (j / 8) * PI; lp.push(V3(c.x + 0.005 * Math.cos(a), c.y + r + 0.006 * Math.sin(a), c.z)); }
      addPart('bells', loft(tubeRings(lp, lp.map(() => 0.0015), 5)), wf, { out: V3(c.x, c.y + r + 0.004, c.z + 0.05) });
      const sl = [V3(c.x - r * 0.6, c.y - r * 0.82, c.z + r * 0.02), V3(c.x, c.y - r * 1.005, c.z + r * 0.02), V3(c.x + r * 0.6, c.y - r * 0.82, c.z + r * 0.02)];
      addPart('bellslit', loft(tubeRings(sl, [0.0016, 0.0022, 0.0016], 5)), wf, { out: V3(c.x, c.y - r * 2, c.z) });
      bellGeo.bells.push([dx, dy, dz, r]);
    }
  })();

  // ---------- pendant and chains ----------
  (function buildJewels() {
    if (PROJ) return;                                 // the necklace is in the painted bodice
    const wf = wOne('spine3'), zs = (y) => { const t = prof(TORSO, y, true); return t[3] + t[1]; };
    const pc = V3(0, 1.268, zs(1.268) + 0.010);
    addPart('gem', spherePart(pc, 0.0135, 0.0175, 0.0075, 18, 12), wf, { out: pc });
    const bz = []; for (let j = 0; j <= 20; j++) { const a = (j / 20) * TAU; bz.push(V3(pc.x + 0.0155 * Math.cos(a), pc.y + 0.0195 * Math.sin(a), pc.z - 0.002)); }
    addPart('gold', loft(tubeRings(bz, bz.map(() => 0.0032), 8, V3(0, 0, 1))), wf, { out: V3(0, pc.y, pc.z + 0.1), weld: true });
    addPart('gold', spherePart(V3(pc.x, pc.y - 0.026, pc.z - 0.001), 0.0042, 0.0055, 0.004, 8, 6), wf, { out: V3(pc.x, pc.y - 0.026, pc.z) });
    const bead = (ctrl, n, r, key) => { const pts = curvePts(ctrl, n); for (const p of pts) addPart(key, spherePart(p, r, r, r, 7, 5), (x, y) => (y > 1.34 ? [BI.neck, 0.5, BI.spine3, 0.5] : wf()), { out: p }); };
    for (const sx of [-1, 1]) bead([V3(sx * 0.050, 1.352, 0.050), V3(sx * 0.030, 1.315, zs(1.315) + 0.004), V3(sx * 0.008, 1.290, zs(1.29) + 0.006)], 10, 0.0026, 'gold');
    // the long chain: a deep V of gold beads down to the corset
    for (const sx of [-1, 1]) bead([V3(sx * 0.074, 1.318, 0.058), V3(sx * 0.062, 1.26, zs(1.26) + 0.004), V3(sx * 0.040, 1.19, zs(1.19) + 0.022), V3(sx * 0.014, 1.125, zs(1.125) + 0.012), V3(0, 1.108, zs(1.108) + 0.008)], 26, 0.0031, 'gold');
  })();

  // ---------- ruffled black cuffs: four flared tiers of lace round each forearm ----------
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], side = V3(-d.y, d.x, 0).normalize(), fw = V3(0, 0, 1);
    { const pc = sh.clone().addScaledVector(d, 0.050); addPart('wine', spherePart(pc, 0.060, 0.074, 0.062, 22, 16), () => [BI['uarm' + S], 0.7, BI['clav' + S], 0.3], { out: pc }); }      // the puff at the top of the sleeve
    for (const [ax0, Rm, r0, phs, NP] of [[0.327, 0.0423, 0.0239, 0.0, 9], [0.357, 0.0534, 0.0294, 1.7, 11], [0.391, 0.0607, 0.0322, 3.1, 12], [0.423, 0.0570, 0.0285, 4.4, 11], [0.4474, 0.0460, 0.0202, 5.6, 10]]) {
      const NA = NP * Q(8, 4), NS = Q(12, 8), rings = [];
      for (let i = 0; i < NS; i++) {
        const f = (i / NS) * TAU, cf = Math.cos(f), sf = Math.sin(f), ring = [];
        for (let j = 0; j < NA; j++) {
          const a = (j / NA) * TAU, th = a * NP + phs + 0.5 * Math.sin(a * 3 + phs), out = Math.max(0, cf);
          const rr = r0 * (1 + out * (0.46 * Math.sin(th) + 0.20 * Math.sin(2.3 * th + 1 + phs)) + 0.12 * Math.sin(a * 3 + phs * 2) + 0.07 * Math.sin(a * 7 + f * 2)), R = Rm + rr * cf * 1.2, ax = ax0 + rr * sf * (1 + 0.25 * out * Math.cos(th));
          const c = sh.clone().addScaledVector(d, ax).addScaledVector(side, R * Math.cos(a)).addScaledVector(fw, R * Math.sin(a));
          ring.push([c.x, c.y, c.z]);
        }
        rings.push(ring);
      }
      rings.push(rings[0]);
      addPart('ruffle', loft(rings, { uS: 6, v0: 0.15, vS: 0.7 }), () => [BI['farm' + S], 1], { out: sh.clone().addScaledVector(d, ax0) });
    }
    for (const [ax, nb, rr0] of [[0.452, 15, 0.0300], [0.464, 14, 0.0286]]) for (let j = 0; j < nb; j++) {      // two strands of beads at the wrist
      const a = (j / nb) * TAU + ax * 40, c = sh.clone().addScaledVector(d, ax).addScaledVector(side, rr0 * Math.cos(a)).addScaledVector(fw, rr0 * 0.86 * Math.sin(a));
      addPart(j % 5 === 2 ? 'gold' : 'pearl', spherePart(c, 0.0060, 0.0060, 0.0060, 8, 6), () => [BI['farm' + S], 1], { out: c });
    }
  }

  // ---------- the front drape: a short black swag from the belt across her hips (a small sheet of its own) ----------
  let apronCloth;
  (function buildApron() {
    const NC = Q(33, 17), NR = Q(20, 10), cols = [];
    for (let c = 0; c < NC; c++) {
      const u = lerp(-1, 1, c / (NC - 1)), a = PI + u * 64 * DEG, col = [], drop = 0.075 + 0.27 * Math.pow(1 - u * u, 0.9);
      for (let r = 0; r < NR; r++) {
        const v = r / (NR - 1), y = WAIST - 0.007 - v * drop, [rx, rz] = prof(SKIRT_R, y, true), g = 0.030 + 0.016 * Math.sin(v * PI * 4.2 - 1.2 * u * u) * (1 - u * u) * (0.4 + 0.6 * v);
        const p = ell(rx + g, rz + g, a, y, skirtZc(y)); col.push([p.x, p.y, p.z]);
      }
      cols.push(col);
    }
    apronCloth = makeCloth({ cols: NC, rows: NR, mask: 1 | 4, margin: 0.033, bend: 0.25, grav: 0.8, drag: 0.03, flutter: 0.35,
      rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.4 : 0), weights: () => [BI.hips, 0.6, BI.spine1, 0.4] });
    addCut(apronCloth, sheen(new THREE.MeshStandardMaterial({ map: fabricTex(256, '#2a2228', '#41343e', '#141014', 2), side: THREE.DoubleSide, roughness: 0.95 }), '#94848e', 2.2, 0.4), 2);
    apronCloth.meshes.forEach((m) => { m.visible = false; });      // Chris: take the swag away (November 11)
  })();

  // ---------- the Jester's veils, skirts and drapes are not the Fox's: out of the simulation and out of the picture ----------
  // (their helpers stay, because the belt and the moves still read them; the Fox's own cloth is made after this line)
  for (const c of cloths) for (const m of c.meshes) { m.visible = false; if (m.parent) m.parent.remove(m); }
  cloths.length = 0;

  // ---------- bind: one skinned mesh per material ----------
  const tLeg = leggingsTex(); tLeg.wrapS = THREE.RepeatWrapping;
  const tLace = laceTex(); tLace.map.wrapS = tLace.alpha.wrapS = THREE.RepeatWrapping;
  const BLK = '#251d22', BLK_HI = '#40343c', BLK_LO = '#110b10', WARM = '#7a6470';
  const MATS = {
    torso: sheen(std({ map: PROJ ? bakedTex('body', 1024, 768, '#2c1e30') : torsoTex(), roughness: 0.78 }), '#b888b0', 3, PROJ ? 0.1 : 0.2),
    wine: sheen(std({ map: fabricTex(256, '#6e1a3a', '#8e2a50', '#3c0c20', 3, false, 'wine'), roughness: 0.92 }), '#e0608c', 2.6, 0.45),
    cloth: sheen(std({ map: fabricTex(256, BLK, BLK_HI, BLK_LO, 3), roughness: 0.94 }), WARM, 3, 0.3),
    leggings: sheen(std({ color: lin('#3a393d'), roughness: 0.78 }), '#b888b0', 3, 0.1),      // the same plain charcoal and the same finish as the hips in the torso's picture, so they read as one cloth
    emerald: sheen(std({ map: fabricTex(256, PAL.emerald, PAL.emeraldHi, PAL.emeraldDk, 3, false), roughness: 0.9, side: THREE.DoubleSide }), '#6fd0b0', 2.6, 0.38),
    boot: (() => { const n = crinkleTex(), k = new THREE.Vector2(0.6, 0.6); const lt = BAKED && BAKED.bootLeather ? bakedTex('bootLeather', 512, 512, '#4a2a1b') : null; if (lt) { lt.wrapS = lt.wrapT = THREE.RepeatWrapping; lt.repeat.set(2, 2); } return phys({ color: lt ? lin(0xfff0d6) : lin(0x4a2a1b), map: lt, roughness: 0.56, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 0.6, normalMap: n, normalScale: k, clearcoatNormalMap: n, clearcoatNormalScale: k }); })(),
    stitch: std({ color: lin(0xd9a24a), roughness: 0.7 }), eyelet: std({ color: lin(0xb89148), roughness: 0.32, metalness: 1, envMapIntensity: 1.5 }), aglet: std({ color: lin(0xb08a3e), roughness: 0.35, metalness: 0.9 }),
    sock: std({ map: sockTex(), roughness: 0.95 }), lace: std({ color: lin(0xc98a34), roughness: 0.82 }),
    sole: std({ map: soleTex(), color: lin(0xffd2a6), emissive: lin(0x2a1608), emissiveIntensity: 0.55, roughness: 0.82 }),      // her soles are dark brown rubber, not black
    leather: std({ color: lin(0x1a1418), roughness: 0.42, envMapIntensity: 0.8 }),
    gold: std({ color: lin(0xd8a546), roughness: 0.3, metalness: 1, envMapIntensity: 1.6 }),
    bells: std({ color: lin(0xe0ad48), roughness: 0.22, metalness: 1, envMapIntensity: 1.8 }),
    bellslit: std({ color: lin(0x1a1206), roughness: 0.9 }),
    cord: std({ color: lin(0x3a3038), roughness: 0.85 }),
    skin: sheen(std({ color: SKIN ? lin('#d8ccc6').multiply(lin(SKIN)) : lin('#dcb49c'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin(SKIN || PAL.skin), emissiveIntensity: SKIN ? 0.44 : 0.42 }), '#ffb49a', 3.2, 0.08),
    hand: (() => { const t = bakedTex('hands', 1024, 1024, SKIN || '#d99f91'); return sheen(std({ map: t, color: lin('#d8ccc6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.44 }), '#ffb49a', 3.2, 0.08); })(),
    nail: phys({ color: lin(0xd8a39a), roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    face: (() => {
      const m = sheen(std({ map: faceT, color: lin('#d8ccc6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: faceT, emissiveIntensity: 0.44 }), '#ffb49a', 3.2, 0.08);
      if (!(BAKED && BAKED.faceSide)) return m;
      // the head wears three pictures at once, mixed by which way the skin faces (see buildHead): the front painting, the profile painting, plain skin
      const ts = bakedTex('faceSide', 420, 540, SKIN || '#d99f91'), ta = bakedTex('faceSideA', 420, 540, '#000000'), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        first(sh); sh.uniforms.uSide = { value: ts }; sh.uniforms.uSideA = { value: ta }; sh.uniforms.uPlain = { value: lin((BAKED && BAKED.skinJaw) || SKIN || '#d99f91') };
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 faceMix; attribute vec2 uvSide; varying vec3 vFaceMix; varying vec2 vUvSide;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFaceMix = faceMix; vUvSide = uvSide;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSide; uniform sampler2D uSideA; uniform vec3 uPlain; varying vec3 vFaceMix; varying vec2 vUvSide; vec3 gFaceCol;')
          .replace('#include <map_fragment>', 'vec4 texelColor = mapTexelToLinear( texture2D( map, vUv ) );\n float fSide = texture2D( uSideA, vUvSide ).r * vFaceMix.x;\n vec3 sideCol = mapTexelToLinear( texture2D( uSide, vUvSide ) ).rgb;\n gFaceCol = ( texelColor.rgb * max( 0.0, 1.0 - fSide - vFaceMix.y ) + sideCol * fSide + uPlain * vFaceMix.y ) * vFaceMix.z;\n diffuseColor.rgb *= gFaceCol;')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gFaceCol;');
      };
      return m;
    })(),
    hair: sheen(std({ map: fabricTex(256, '#241a18', '#4a3830', '#0c0807', 2, true), roughness: 0.5, side: THREE.DoubleSide }), WARM, 3, 0.3),
    cap: sheen(std({ map: capTex(), roughness: 0.92 }), WARM, 2.6, 0.4),
    velvet: sheen(std({ map: fabricTex(256, BLK, BLK_HI, BLK_LO, 1, false, 'satin', 2, 'rgba(20,14,18,0.25)'), roughness: 0.86 }), WARM, 2.4, 0.42),
    fur: sheen(std({ color: lin(0x1a1418), roughness: 1, envMapIntensity: 0.3 }), WARM, 2.2, 0.4),
    gem: phys({ color: lin(PAL.teal), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, emissive: lin('#1c8a86'), emissiveIntensity: 0.6, envMapIntensity: 1.4 }),
    ruffle: sheen(std({ map: tLace.map, color: lin(BAKED && BAKED.ruffle ? '#b4a8b0' : '#9a8a92'), side: THREE.DoubleSide, roughness: 0.95, emissive: lin('#ffffff'), emissiveMap: tLace.map, emissiveIntensity: BAKED && BAKED.ruffle ? 0.14 : 0 }), WARM, 2.4, 0.14),
    pearl: phys({ color: lin(0x8f8a98), roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1.2 })
  };
  // The skin painted on her body (chest and back) is lit exactly as her face, neck, arms and hands are: the same tint, the same glow of its own, the same
  // dull finish, the same small share of the sky's light. The corset round it keeps its own cloth finish. 'bodySkin' says which is which, pixel by pixel.
  // Before this her chest was cloth-lit: brighter, shinier and paler than her face, and it made her face look wrong (Chris, 13 Nov).
  if (BAKED && BAKED.bodySkin) {
    const m = MATS.torso, mk = bakedTex('bodySkin', 512, 384, '#000000'), first = m.onBeforeCompile;
    m.onBeforeCompile = (sh) => {
      if (first) first(sh); sh.uniforms.uSkinM = { value: mk }; sh.uniforms.uSkinTint = { value: lin('#d8ccc6') };
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSkinM; uniform vec3 uSkinTint; float gSk; vec3 gSkEm;')
        .replace('#include <map_fragment>', 'vec4 texelColor = mapTexelToLinear( texture2D( map, vUv ) );\n gSk = texture2D( uSkinM, vUv ).r;\n gSkEm = texelColor.rgb * gSk * 0.44;\n diffuseColor *= texelColor;\n diffuseColor.rgb *= mix( vec3( 1.0 ), uSkinTint, gSk );')
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix( roughnessFactor, 0.66, gSk );')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += gSkEm;')
        .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\n iblIrradiance *= mix( 1.0, 0.2, gSk ); radiance *= mix( 1.0, 0.2, gSk );');
    };
  }
  // ---------- the Fox's own materials ----------
  const curlTex = (() => {                           // a lock of her hair from root (bottom) to tip (top): dark brown running out to honey gold
    const c = cvs(32, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 256, 0, 0);
    gr.addColorStop(0, '#24130a'); gr.addColorStop(0.40, '#4c2a11'); gr.addColorStop(0.74, '#96531f'); gr.addColorStop(1, '#d98f3e'); g.fillStyle = gr; g.fillRect(0, 0, 32, 256);
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(' + (i % 2 ? '255,220,160' : '30,15,5') + ',0.10)'; g.fillRect(Math.floor(h1(i + 3) * 32), 0, 1 + (i % 3), 256); }
    return ctex(c);
  })();
  const earTex = (() => {                            // round the ear: its inner face at the two side edges of the picture, its back in the middle; base at the bottom, tip at the top
    const W = 256, H = 256, c = cvs(W, H), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, '#b0602f'); gr.addColorStop(0.6, '#9a4d26'); gr.addColorStop(0.82, '#4a2a1c'); gr.addColorStop(1, '#1e1412'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 500; i++) { const x = h1(i * 3.1) * W, y = h1(i * 7.7 + 2) * H; g.strokeStyle = 'rgba(' + (i % 2 ? '235,150,90' : '40,18,8') + ',0.22)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (h1(i) - 0.5) * 4, y - 9 - h1(i + 9) * 10); g.stroke(); }
    for (const x0 of [0, W]) {                       // the cream fur inside: a soft-edged tongue up each side edge, which meet at the front seam
      for (let y = 0; y < H; y++) { const v = 1 - y / H, hw = W * 0.185 * Math.pow(Math.max(0, 1 - v / 0.84), 0.6); if (hw <= 0) continue;
        const gg = g.createLinearGradient(x0 ? x0 - hw : 0, 0, x0 ? x0 : hw, 0); const e0 = 'rgba(244,232,214,0)', e1 = 'rgba(244,232,214,1)';
        if (x0) { gg.addColorStop(0, e0); gg.addColorStop(0.3, e1); gg.addColorStop(1, e1); } else { gg.addColorStop(0, e1); gg.addColorStop(0.7, e1); gg.addColorStop(1, e0); }
        g.fillStyle = gg; g.fillRect(x0 ? x0 - hw : 0, y, hw, 1); }
    }
    for (let i = 0; i < 260; i++) { const side = i % 2, x = side ? W - h1(i * 1.7) * W * 0.17 : h1(i * 1.7) * W * 0.17, y = H * (0.2 + 0.8 * h1(i * 5.3 + 1)); g.strokeStyle = 'rgba(200,180,150,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (side ? 3 : -3), y - 14); g.stroke(); }
    return ctex(c);
  })();
  Object.assign(MATS, {
    belt: sheen(std({ color: lin('#4b2a18'), roughness: 0.58 }), '#ffc890', 3, 0.12),
    pouch: sheen(std({ color: lin('#5c3520'), roughness: 0.62 }), '#ffc890', 3, 0.12),
    steel: std({ color: lin('#c9ced6'), roughness: 0.26, metalness: 0.95, side: THREE.DoubleSide }),
    patch: (() => { const t = bakedTex('patch', 1024, 1024, '#a03c5c'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return sheen(std({ map: t, color: lin('#d2c8c2'), roughness: 0.86, side: THREE.DoubleSide }), '#ffd0a0', 3, 0.12); })(),      // her patchwork (F9)
    patch2: (() => { const t = bakedTex('patch2', 768, 768, '#a03c5c'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return sheen(std({ map: t, color: lin('#d2c8c2'), roughness: 0.86, side: THREE.DoubleSide }), '#ffd0a0', 3, 0.12); })(),     // the second sheet (F10), for the upper flounce
    frill: sheen(std({ color: lin('#a02f6c'), roughness: 0.80, side: THREE.DoubleSide }), '#ff9ad0', 3, 0.2),
    // her belt, pouch and sheath: the leather is the paintings themselves (F7, G3), baked by bake_gear_fox.py
    gear: (() => { const t = bakedTex('gear', 1024, 1024, '#4a2c1c'); return sheen(std({ map: t, color: lin('#d6ccc4'), roughness: 0.62, side: THREE.DoubleSide }), '#ffc890', 3, 0.10); })(),
    beltm: (() => { const t = bakedTex('beltTex', 128, 128, '#4a2c1c'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return sheen(std({ map: t, color: lin('#d6ccc4'), roughness: 0.62 }), '#ffc890', 3, 0.10); })(),
    gearIn: std({ color: lin('#1a100b'), roughness: 0.9, side: THREE.DoubleSide }),
    brass: std({ color: lin('#b8893a'), roughness: 0.36, metalness: 0.88 }),
    arm: (() => {                                    // the skin of her arms, painted from the forearms in the hand paintings (match_skin_fox.py). Across: outside, front, inside, back. Down: shoulder to wrist.
      const t = bakedTex('arm', 512, 1024, SKIN || '#d89780'); t.wrapS = THREE.RepeatWrapping;
      return sheen(std({ map: t, color: lin('#d8ccc6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.44 }), '#ffb49a', 3.2, 0.08);
    })(),
    emerald: (() => {                                // the blouse's dark green linen (A1, F5): a plain weave with slubs, uneven threads and a soft mottle
      const S = 256, c = cvs(S, S), g = c.getContext('2d'); g.fillStyle = '#283b39'; g.fillRect(0, 0, S, S); let sd = 9241;
      const rn = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 60; i++) { const x = rn() * S, y = rn() * S, r = 14 + rn() * 34, gr = g.createRadialGradient(x, y, 0, x, y, r), col = rn() < 0.5 ? '70,98,92' : '18,28,28'; gr.addColorStop(0, 'rgba(' + col + ',' + (0.10 + rn() * 0.12) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
        for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { g.save(); g.translate(dx, dy); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore(); } }
      for (let y = 0; y < S; y += 2) { g.fillStyle = 'rgba(' + (rn() < 0.5 ? '96,128,118' : '12,20,20') + ',' + (0.03 + rn() * 0.07) + ')'; g.fillRect(0, y, S, 1); }      // weft
      for (let x = 0; x < S; x += 2) { g.fillStyle = 'rgba(' + (rn() < 0.5 ? '96,128,118' : '12,20,20') + ',' + (0.03 + rn() * 0.07) + ')'; g.fillRect(x, 0, 1, S); }      // warp
      for (let i = 0; i < 70; i++) { const hz = rn() < 0.6, x = rn() * S, y = Math.floor(rn() * S), L = 6 + rn() * 30; g.fillStyle = 'rgba(128,160,146,' + (0.08 + rn() * 0.14) + ')'; if (hz) { g.fillRect(x, y, L, 1); g.fillRect(x - S, y, L, 1); } else { g.fillRect(y, x, 1, L); g.fillRect(y, x - S, 1, L); } }      // slubs
      const t = ctex(c, 1, 1);
      return sheen(std({ map: t, roughness: 0.94, side: THREE.DoubleSide }), '#9fc8b8', 2.8, 0.20);
    })(),
    neck: BAKED && BAKED.neck ? (() => {             // her neck, painted (match_skin_fox.py): round it from the front, to her left, the back, her right; from her collar up to under her jaw
      const t = bakedTex('neck', 256, 256, SKIN || '#d89780'); t.wrapS = THREE.RepeatWrapping;
      return sheen(std({ map: t, color: lin('#d8ccc6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.44 }), '#ffb49a', 3.2, 0.08);
    })() : (() => {                                  // (without the bake) the chest's tone where it leaves the collar, her face's tone above the choker, darkening into the shade under her jaw
      const c = cvs(8, 128), g = c.getContext('2d'), CH = (BAKED && BAKED.skinChest) || SKIN || '#e0a890', J = (BAKED && BAKED.skinJaw) || SKIN || '#c08068', F = SKIN || '#d89780';
      const ratio = (hex, k) => { const a = new THREE.Color(hex), b = new THREE.Color(CH); return 'rgb(' + [a.r / b.r, a.g / b.g, a.b / b.b].map((v) => Math.round(255 * Math.min(1, v * k))).join(',') + ')'; };
      const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.24, '#ffffff'); gr.addColorStop(0.34, ratio(F, 1.0)); gr.addColorStop(0.50, ratio(F, 0.93)); gr.addColorStop(0.62, ratio(J, 0.92)); gr.addColorStop(1, ratio(J, 0.85));
      g.fillStyle = gr; g.fillRect(0, 0, 8, 128); const t = ctex(c);
      return sheen(std({ color: lin('#d8ccc6').multiply(lin(CH)), map: t, emissive: lin(CH), emissiveMap: t, emissiveIntensity: 0.44, roughness: 0.66, envMapIntensity: 0.2 }), '#ffb49a', 3.2, 0.08);
    })(),
    choker: sheen(std({ color: lin('#b9506f'), roughness: 0.62 }), '#ffc0d0', 3, 0.15),
    bellm: std({ color: lin('#c9973a'), roughness: 0.28, metalness: 0.9 }),
    woodbead: std({ color: lin('#4a2416'), roughness: 0.34, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    scalp: (() => {                                  // the hair that lies close to her head and the body of hair under the curls: drawn strands, dark at the root with a few gold ones, running back toward the bun
      const c = cvs(256, 256), g = c.getContext('2d'); g.fillStyle = '#24150a'; g.fillRect(0, 0, 256, 256); let sd = 7;
      const rn = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }, tones = ['#170d06', '#2c1a0e', '#3e2612', '#553518', '#6f4720', '#8a5c2a', '#b07c3c'];
      for (let i = 0; i < 420; i++) {
        const x0 = rn() * 256, amp = 2 + rn() * 5, f = 1 + rn() * 2.5, p0 = rn() * 6.28, k = rn(); g.strokeStyle = tones[Math.floor(k * k * tones.length)]; g.globalAlpha = 0.35 + rn() * 0.5; g.lineWidth = 0.8 + rn() * 2.2; g.beginPath();
        for (let y = -4; y <= 260; y += 6) { const x = x0 + amp * Math.sin(y / 256 * 6.28 * f + p0); if (y < 0) g.moveTo(x, y); else g.lineTo(x, y); }
        g.stroke();
      }
      g.globalAlpha = 1; const t = ctex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return sheen(std({ map: t, roughness: 0.52 }), '#ffd9a0', 3, 0.34);
    })(),
    curl: sheen(std({ map: curlTex, roughness: 0.52 }), '#ffe0a8', 2.6, 0.34),
    ear: sheen(std({ map: earTex, roughness: 0.95 }), '#ffd2a8', 2.2, 0.45),
    frame: std({ color: lin(0x3b2b20), roughness: 0.34, metalness: 0.9, envMapIntensity: 1.3 }),
    lens: Object.assign(phys({ color: lin(0xffffff), roughness: 0.05, transparent: true, opacity: 0.02, depthWrite: false, envMapIntensity: 0.2 }), { visible: false })     // clear glass: any tint clouded her eyes, so the lenses are not drawn
  });
  const root = new THREE.Group(); root.name = 'fox';
  root.add(SK.hips); root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones), meshes = {};
  const FOX_K = opts.scale || 1.045;                 // the whole figure, against the Jester's frame: her legs, shoulders and chin all land on her paintings at this one number
  root.scale.setScalar(FOX_K);                       // set here, after the skeleton has taken its rest pose: set any earlier, the bones would grow and the skin would not
  SK.spine1.scale.setScalar(UPK); SK.head.scale.setScalar(HEAD_K); SK.head.position.y -= (opts.headDrop === undefined ? 0.0133 : opts.headDrop);      // Chris, 12 Nov: size her head to the standing painting with the raised finger (refs/R6_point.png): there, eye to lip is 50 px and eye to chin 83 px of 1344 px from soles to eyes, 8 to 9% smaller than A1's root.updateMatrixWorld(true);   // horns keep their size as the head shrinks       // after the bind, so head, cap, horns and their veils all shrink about the neck
  let triCount = 0;
  for (const key in buckets) {
    const B = buckets[key], g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(B.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(B.si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(B.sw, 4));
    if (key === 'face') { g.setAttribute('faceMix', new THREE.Float32BufferAttribute(faceMix, 3)); g.setAttribute('uvSide', new THREE.Float32BufferAttribute(faceUvS, 2)); }
    g.setIndex(B.n > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key; m.castShadow = key !== 'faceSide'; m.receiveShadow = true; m.frustumCulled = false; if (key === 'faceSide') m.renderOrder = 0.6;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }
  for (const c of cloths) triCount += c.tris;
  const fx = new THREE.Group(); fx.name = 'fox-fx'; fx.add(clothGroup);

  // ---------- motion: a pose is a flat set of channels; limbs are solved onto hand and foot targets ----------
  const Qt = () => new THREE.Quaternion(), _qa = Qt(), _qb = Qt(), _qc = Qt(), _qd = Qt(), _m4 = new THREE.Matrix4(), _va = V3(), _vb = V3(), _vc = V3(), _vd = V3(), _ve = V3();
  const X_AX = V3(1, 0, 0), Y_AX = V3(0, 1, 0), Z_AX = V3(0, 0, 1);
  function basisQ(x, z, out) { _vd.crossVectors(z, x).normalize(); _ve.crossVectors(x, _vd).normalize(); _m4.makeBasis(x, _vd, _ve); return out.setFromRotationMatrix(_m4); }
  const LIMB = {};
  for (const [S, s] of SIDES) {
    const ax = armDir[S].clone(), az = V3(0, 0, -1).cross(ax).normalize();
    // Limb lengths as the solver meets them, in the world: the whole figure is FOX_K times the frame its tables are written in. Without FOX_K here
    // every hand and foot target looked 4.5% too far away, so her arms hung dead straight and bent limbs overshot their marks.
    LIMB['arm' + S] = { inv: basisQ(ax, az, Qt()).invert(), l1: L_UARM * UPK * FOX_K, l2: L_FARM * UPK * FOX_K };
    const hip = SK['thigh' + S].userData.rest, kn = SK['shin' + S].userData.rest, an = SK['foot' + S].userData.rest;
    const lx = kn.clone().sub(hip).normalize(), lz = V3(0, 0, 1).cross(lx).normalize();
    const lx2 = an.clone().sub(kn).normalize(), lz2 = V3(0, 0, 1).cross(lx2).normalize();
    LIMB['leg' + S] = { inv: basisQ(lx, lz, Qt()).invert(), inv2: basisQ(lx2, lz2, Qt()).invert(), l1: hip.distanceTo(kn) * FOX_K, l2: kn.distanceTo(an) * FOX_K };
  }
  // two-bone IK: from joint a at world A to target T with the middle joint leaning toward pole; sets both bones' rotations
  function solveLimb(bA, bB, A, T, pole, L, twist, parentQ, outMidQ) {
    _va.subVectors(T, A); let d = _va.length(); const mx = (L.l1 + L.l2) * 0.9985, mn = Math.abs(L.l1 - L.l2) + 0.02;
    if (d < 1e-5) { _va.set(0, -1, 0); d = 1e-5; }
    _va.multiplyScalar(1 / d); d = cl(d, mn, mx);
    const a = (L.l1 * L.l1 - L.l2 * L.l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L.l1 * L.l1 - a * a));
    _vb.copy(pole).addScaledVector(_va, -pole.dot(_va)); if (_vb.lengthSq() < 1e-8) _vb.set(0, 0, -1).addScaledVector(_va, _va.z); _vb.normalize();
    const hinge = _vc.crossVectors(_vb, _va).normalize();                        // the axis the middle joint bends about
    const d1 = V3().copy(_va).multiplyScalar(a).addScaledVector(_vb, h).normalize();          // A -> middle
    const mid = V3().copy(A).addScaledVector(d1, L.l1), end = V3().copy(A).addScaledVector(_va, d), d2 = end.sub(mid).normalize();
    const hz = V3().copy(hinge);
    basisQ(d1, hz, _qa).multiply(L.inv);                                          // world rotation of the upper bone
    bA.quaternion.copy(_qb.copy(parentQ).invert()).multiply(_qa);
    basisQ(d2, hz, _qc).multiply(L.inv2 || L.inv);
    if (twist) { _qd.setFromAxisAngle(d2, twist); _qc.premultiply(_qd); }
    bB.quaternion.copy(_qb.copy(_qa).invert()).multiply(_qc);
    if (outMidQ) outMidQ.copy(_qc);
    return mid;
  }
  // finger poses: [thumb, index, middle, ring, little, spread]; 0 is straight, 1 is curled shut
  const FP = { relax: opts.fpRelax || [0.34, 0.33, 0.39, 0.45, 0.51, 0.04], open: [0.04, 0.03, 0.02, 0.05, 0.09, 0.95], soft: [0.14, 0.12, 0.17, 0.22, 0.28, 0.55], point: [0.62, 0.0, 0.86, 0.92, 0.94, 0.08],
    fist: [0.72, 0.95, 0.96, 0.96, 0.95, 0], cup: [0.18, 0.30, 0.36, 0.42, 0.48, 0.55], grip: [0.6, 0.8, 0.86, 0.88, 0.88, 0], weave: [0.36, 0.10, 0.46, 0.56, 0.62, 0.7] };
  const handAxes = {};
  for (const [S, s] of SIDES) {
    const c = Math.cos(s * A_POSE), sn = Math.sin(s * A_POSE);
    const palm = V3(-s * c, -s * sn, 0), along = V3(sn, -c, 0), td = V3(-s * THUMB.dir[0], THUMB.dir[1], THUMB.dir[2]).normalize();
    td.set(td.x * c - td.y * sn, td.x * sn + td.y * c, td.z);                     // the thumb's direction in the bind pose
    const tn = V3(1, 0, 0), tdc = V3(...THUMB.dir).normalize(); tn.addScaledVector(tdc, -tn.x).normalize(); const tb = V3().crossVectors(tdc, tn);
    tn.multiplyScalar(Math.cos(THUMB.roll)).addScaledVector(tb, -Math.sin(THUMB.roll));          // the way the thumb's pad faces (it is turned toward the fingers)
    handAxes[S] = { palm, along, curl: V3(0, 0, -s), thumbFlex: V3().crossVectors(td, handDir(s, tn.x, tn.y, tn.z)).normalize(), thumbOpp: along.clone() };
  }
  const SPREAD = [0, 1, 0.3, -0.45, -1.0];
  function poseFingers(S, f) {
    const A = handAxes[S];
    for (let k = 0; k < 4; k++) {
      const [fn] = FINGERS[k], c = f[k + 1], sp = SPREAD[k + 1] * (f[5] - 0.3) * 0.26 * (1 - c * 0.8);
      _qa.setFromAxisAngle(A.curl, c * 1.38); _qb.setFromAxisAngle(A.palm, sp); SK[fn + '0' + S].quaternion.copy(_qb).multiply(_qa);
      SK[fn + '1' + S].quaternion.setFromAxisAngle(A.curl, c * 1.62); SK[fn + '2' + S].quaternion.setFromAxisAngle(A.curl, c * 1.05);
    }
    const t = f[0];
    _qa.setFromAxisAngle(A.thumbOpp, (A.curl.z > 0 ? 1 : -1) * (0.15 + t * 0.9)); _qb.setFromAxisAngle(A.palm, (0.5 - f[5]) * 0.35); SK['thb0' + S].quaternion.copy(_qb).multiply(_qa);
    SK['thb1' + S].quaternion.setFromAxisAngle(A.thumbFlex, t * 0.7); SK['thb2' + S].quaternion.setFromAxisAngle(A.thumbFlex, t * 0.9);
  }
  // the resting pose: every channel a spell can move
  const REST_HX = opts.restHX === undefined ? 0.290 : opts.restHX, REST_HY = opts.restHY === undefined ? 0.882 : opts.restHY;      // her resting wrist, read off A1: 31 cm out from her middle, 92 cm up
  const REST = {
    hip: [0, 0, 0], hipR: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], sh: [0, 0],
    hR: [-REST_HX, REST_HY, 0.055], hL: [REST_HX, REST_HY, 0.055], eR: [-0.55, -0.1, -1], eL: [0.55, -0.1, -1], twR: 0, twL: 0, wrR: [0.1, 0], wrL: [0.1, 0],
    fR: FP.relax.slice(), fL: FP.relax.slice(),
    ftR: [0, 0, 0, -0.10, 0, 0, 0], ftL: [0, 0, 0, 0.10, 0, 0, 0], knR: [-0.12, 0, 1], knL: [0.12, 0, 1],
    eyes: 0, mouth: 0, glow: 0,
    shr: 0, shs: 0, sho: 0, shl: 0.44     // her shears: in her right hand (0 sheathed .. 1 held), split (1: the back half in her left hand), open (radians),
                                          // and how the blades lean in her fists (radians: 0.44 back toward her wrists, for carrying; below 0 forward, for a cut)
  };
  const CHANS = Object.keys(REST);
  const clonePose = (p) => { const o = {}; for (const k of CHANS) o[k] = typeof p[k] === 'number' ? p[k] : p[k].slice(); return o; };
  const cur = clonePose(REST), base = clonePose(REST);
  function blendPose(out, a, b, w) { for (const k of CHANS) { const x = a[k], y = b[k]; if (typeof x === 'number') out[k] = x + (y - x) * w; else { const o = out[k]; for (let i = 0; i < x.length; i++) o[i] = x[i] + (y[i] - x[i]) * w; } } }
  // actions: keys inherit the last value of every channel they leave out; values glide through keys on smooth curves
  const ACTS = {}, STANCES = {};
  function buildTracks(keys, dur, outro, hold) {
    const tracks = {};
    for (const k of CHANS) {
      const ts = [0], vs = [REST[k]], n = typeof REST[k] === 'number' ? 0 : REST[k].length;
      for (const key of keys) if (key[k] !== undefined) {
        let v = key[k] === 'rest' ? REST[k] : key[k]; if (n && v.length < n) v = v.concat(REST[k].slice(v.length));      // short lists (feet without a roll) are filled from rest
        if (key.t <= 0) vs[0] = v; else { ts.push(key.t); vs.push(v); }
      }
      if (ts.length === 1 && vs[0] === REST[k]) continue;
      const tl = ts[ts.length - 1], vl = vs[vs.length - 1];        // hold the last value, then settle back to rest at the end (a stance stays)
      if (hold) { if (tl < dur) { ts.push(dur); vs.push(vl); } }
      else { if (tl < dur - outro - 1e-3) { ts.push(dur - outro); vs.push(vl); } if (ts[ts.length - 1] < dur) { ts.push(dur); vs.push(REST[k]); } }
      tracks[k] = { ts, vs };
    }
    return tracks;
  }
  function defAction(name, dur, keys, o) {
    ACTS[name] = Object.assign({ dur, tracks: buildTracks(keys, dur, (o && o.outro) || 0.5, false), hits: [], cues: [] }, o || {});
    if (o && o.spin) ACTS[name].spinT = { ts: o.spin.map((e) => e[0]), vs: o.spin.map((e) => e[1]) };      // a turn of her whole body about the spot she stands on, [[time, angle], ...]
  }
  // a stance is a way of holding the body (kneeling, sitting): its keys run from standing to the held pose, and play backwards to stand up again
  function defStance(name, dur, keys, o) { STANCES[name] = Object.assign({ dur, tracks: buildTracks(keys, dur, 0, true) }, o || {}); }
  function evalTrack(tr, t, out) {
    const ts = tr.ts, vs = tr.vs, n = ts.length; let i = 1; while (i < n - 1 && ts[i] < t) i++;
    const t0 = ts[i - 1], t1 = ts[i], u = cl((t - t0) / (t1 - t0), 0, 1), u2 = u * u, u3 = u2 * u, dtt = t1 - t0;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    const comp = (a, b, pa, nb, ta, tb) => {
      let m0 = i - 1 > 0 ? (b - pa) / (t1 - ta) : 0, m1 = i < n - 1 ? (nb - a) / (tb - t0) : 0;
      if ((b - a) * (a - pa) <= 0) m0 = 0; if ((nb - b) * (b - a) <= 0) m1 = 0;       // rest at holds and turning points
      return h00 * a + h10 * dtt * m0 + h01 * b + h11 * dtt * m1;
    };
    const a = vs[i - 1], b = vs[i], pa = vs[Math.max(0, i - 2)], nb = vs[Math.min(n - 1, i + 1)], ta = ts[Math.max(0, i - 2)], tb = ts[Math.min(n - 1, i + 1)];
    if (typeof a === 'number') return comp(a, b, pa, nb, ta, tb);
    for (let k = 0; k < a.length; k++) out[k] = comp(a[k], b[k], pa[k], nb[k], ta, tb);
    return out;
  }
  let act = null, guardOn = false, stance = null, stanceTo = '', pending = '';
  const actPose = clonePose(REST), stPose = clonePose(REST);
  function evalPose(tracks, t, out) { for (const k of CHANS) { const tr = tracks[k]; if (tr) { const v = evalTrack(tr, t, out[k]); if (typeof v === 'number') out[k] = v; } else if (typeof REST[k] === 'number') out[k] = REST[k]; else for (let i = 0; i < REST[k].length; i++) out[k][i] = REST[k][i]; } return out; }
  function setStance(name) { if (name && !STANCES[name]) return false; stanceTo = name || ''; return true; }
  function play(name, force) {
    const def = ACTS[name]; if (!def) return false;
    if (act && !force) return false;
    if (def.stand && (stance || stanceTo)) { stanceTo = ''; pending = name; act = null; return true; }      // moves that need her feet (a jump) wait until she is standing
    pending = '';
    act = { type: name, t: 0, dur: def.dur, def, fired: {} };
    if (def.start) def.start(act);
    return true;
  }
  // ---------- springs: the horns and their pompoms, and the bell chain ----------
  function makeChain(names, anchor, o) {
    const n = names.length, rest = names.map((nm) => SK[nm].userData.rest.clone()), aRest = SK[anchor].userData.rest;
    const loc = rest.map((r) => r.clone().sub(aRest)), p = rest.map((r) => r.clone()), pv = rest.map((r) => r.clone()), len = [], dir = [];
    for (let i = 0; i < n - 1; i++) { len.push(rest[i].distanceTo(rest[i + 1])); dir.push(rest[i + 1].clone().sub(rest[i]).normalize()); }
    const tg = V3(), aQ = Qt(), pq = Qt(), wq = Qt(), d0 = V3(), d1 = V3(); let init = false;
    return { p, reset() { init = false; }, update(dt) {
      const A = SK[anchor]; A.matrixWorld.decompose(_va, aQ, _vb);
      const h = Math.min(dt, 0.033), steps = dt > 0 ? 2 : 0;
      for (let s = 0; s < (init ? steps : 1); s++) for (let i = 0; i < n; i++) {
        tg.copy(loc[i]).applyMatrix4(A.matrixWorld);
        if (i === 0 || !init) { p[i].copy(tg); pv[i].copy(tg); continue; }
        const hs = h / steps, k = o.stiff[i], damp = o.damp;
        d0.subVectors(p[i], pv[i]).multiplyScalar(damp); pv[i].copy(p[i]); p[i].add(d0); p[i].y -= o.grav * hs * hs * (o.gw ? o.gw[i] : 1);
        p[i].lerp(tg, 1 - Math.pow(1 - k, hs * 60));
        d0.subVectors(p[i], p[i - 1]); const L = d0.length() || 1e-6; p[i].copy(p[i - 1]).addScaledVector(d0, len[i - 1] / L);
        if (o.collide) o.collide(p[i], i);
      }
      init = true; pq.copy(aQ);
      for (let i = 0; i < n - 1; i++) {
        d0.copy(dir[i]).applyQuaternion(aQ); d1.subVectors(p[i + 1], p[i]).normalize();
        wq.setFromUnitVectors(d0, d1).multiply(aQ);
        SK[names[i]].quaternion.copy(_qa.copy(pq).invert()).multiply(wq); pq.copy(wq);
      }
    } };
  }
  const chains = [];
  for (const [S, s] of SIDES) chains.push(makeChain(hornChains[S].names, 'head', { stiff: [1, 0.55, 0.42, 0.33, 0.27, 0.22, 0.10], damp: 0.90, grav: 3.2, gw: [0, 0.2, 0.3, 0.4, 0.5, 0.6, 2.2] }));
  for (const names of hairChains) chains.push(makeChain(names, 'head', names.length === 3 ? { stiff: [1, 0.62, 0.46], damp: 0.88, grav: 1.4, gw: [0, 0.4, 0.7] } : { stiff: [1, 0.34, 0.22, 0.16], damp: 0.90, grav: 2.6, gw: [0, 0.6, 1.0, 1.4] }));      // her loose hair; the bun (three bones) is held firmer
  for (const c of braceletChains) {                // her bracelets: each strand tips and knocks on its own spring, but never more than 24 degrees, so it cannot swing through her arm
    const ch = makeChain(c.names, c.anchor, { stiff: [1, c.k], damp: 0.90, grav: 5.0, gw: [0, 1] }), b = SK[c.names[0]], inner = ch.update, qi = new THREE.Quaternion();
    ch.update = (dt) => { inner(dt); const a = 2 * Math.acos(Math.min(1, Math.abs(b.quaternion.w))); if (a > 0.42) b.quaternion.copy(qi.set(0, 0, 0, 1).slerp(b.quaternion, 0.42 / a)); };
    chains.push(ch);
  }
  const hipsInv = new THREE.Matrix4(), bellChain = makeChain(['bell0', 'bell1', 'bell2', 'bell3'], 'hips', { stiff: [1, 0.02, 0.012, 0.008], damp: 0.965, grav: 9.0, collide(p, i) {
    _va.copy(p).applyMatrix4(hipsInv); const y = cl(_va.y + SK.hips.userData.rest.y - (i === 3 ? 0.03 : 0), 0.3, 0.985), [rx, rz] = prof(SKIRT_R, y, true), m = 0.034 + (i === 3 ? 0.012 : 0), zc = skirtZc(y);
    const q = Math.pow(_va.x / (rx + m), 2) + Math.pow((_va.z - zc) / (rz + m), 2);
    if (q < 1 && _va.z > zc) { const k = 1 / Math.sqrt(q); _va.x *= k; _va.z = zc + (_va.z - zc) * k; p.copy(_va).applyMatrix4(SK.hips.matrixWorld); }
  } });
  chains.push(bellChain);

  // ---------- the Fox's own cloth: the flounces of her trousers ----------
  // Each flounce is a sheet sewn to the trouser leg along its top edge and free below. It falls under its own weight, lies on the leg,
  // swings when she moves and trails when she turns. The shapes come from 47_foxtrousers.js.
  // Cloth sheets are plain meshes, not skinned ones, so they need materials of their own: the body's materials are built for skinned meshes,
  // and drawing a sheet with one threw a stray strip of patchwork onto the floor.
  const clothMat = (key, W) => { const t = bakedTex(key, W, W, '#a03c5c'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return sheen(new THREE.MeshStandardMaterial({ map: t, color: lin('#d2c8c2'), side: THREE.DoubleSide, roughness: 0.86 }), '#ffd0a0', 3, 0.12); };
  const CLM = { patch: clothMat('patch', 1024), patch2: clothMat('patch2', 768) };
  // Under her sheath the flounce is held nearly still, so cloth and sheath do not pass through each other when she moves.
  const SH = FOXGEAR.sheath;
  const underSheath = (side, p) => {
    if (!SH || side > 0) return 0;
    const dx = p[0] - SH.M.x, dy = p[1] - SH.M.y, dz = p[2] - SH.M.z, yl = dx * SH.Y.x + dy * SH.Y.y + dz * SH.Y.z, xl = dx * SH.X.x + dy * SH.X.y + dz * SH.X.z, t = -yl / SH.L;
    if (t < -0.05 || t > 1.10) return 0;
    const hw = SH.hwAt(cl(t, 0, 1)); return 1 - sm(hw + 0.006, hw + 0.034, Math.abs(xl));
  };
  for (const f of FLOUNCE) {
    const NR = f.tr.length, NC = f.tr[0].length;
    const cloth = makeCloth({ pleat: { n: 9, amp: 0.006, hem: 0.012, ph: f.ph }, cols: NC, rows: NR, wrap: true, mask: 32, margin: 0.007, bend: 0.3, grav: 0.8, drag: 0.02, flutter: 0.6,
      rest: (c, r) => f.tr[r][c], pin: (c, r, p) => Math.max(r === 0 ? 1 : r === 1 ? 0.55 : 0.04, 0.6 * underSheath(f.side, p)), weights: (c, r, p) => f.wLeg(p[0], p[1], p[2]),
      uv: (c, r) => [f.ph * 0.13 + (c / NC) * 2, 1 - (r / (NR - 1)) * 0.8] });
    addCut(cloth, CLM[f.key], 1);
  }
  const _J = new THREE.Vector3();                  // the waist joint: hand targets shrink toward it with the upper body

  // ---------- applying a pose: spine by angles, arms and legs onto their targets, then springs and cloth ----------
  const SPF = [0.25, 0.35, 0.40], MOUTHS = ['rest', 'open', 'smile'];
  const _T = V3(), _A = V3(), _P = V3(), _pq = Qt(), _mq = Qt(), _rq = Qt(), _fq = Qt();
  const HANG_IN = opts.hangIn === undefined ? 1.0 : opts.hangIn, HANG_TW = opts.hangTw === undefined ? -0.85 : opts.hangTw, REST_WR = opts.restWr || [0.16, 0.0];
  // How her arms move (Chris, 13 Nov: "her arms and hands could use more work ... it's more of how they're moving"). Each can be turned off (0) to compare.
  //   SHOULDER   her collar bone goes with her arm: it lifts as the hand rises above the shoulder and comes forward as she reaches ahead or across.
  //   SOFT_FROM  past this share of the arm's full length the hand eases toward straight instead of locking: a locked arm snaps when it lets go.
  const SHOULDER = opts.shoulderFollow === undefined ? 1 : +opts.shoulderFollow, SOFT_FROM = opts.softReach === undefined ? 0.962 : +opts.softReach;
  // ---------- her shears in her hands (round 3) ----------
  // Each half is a rigid piece on its own bone, at rest in the sheath. Held, a half goes wherever a hand goes: its ring in her fist, its blade out of
  // the thumb side of the fist, leaning back toward her wrist the way a blade sits when the ring is held, flat to her palm. The front half (the bigger
  // ring) is her right hand's; split, the back half is her left hand's, and the two are her daggers. Pose channels: shr, shs, sho (see REST).
  const TOOL = (function () {
    if (!SK.shears || !SK.shearB || !FOXGEAR.shears) return null;
    const GS = FOXGEAR.shears, M4 = () => new THREE.Matrix4(), inv = (n) => skeleton.boneInverses[BI[n]], bind = (n) => M4().copy(inv(n)).invert(), g = (x, y, z) => V3(...GS.G(x, y, z));
    const o = g(0, 0, 0), bS = g(0, GS.tipY, 0).sub(o).normalize(), nS = g(0, 0, 1).sub(o); nS.addScaledVector(bS, -nS.dot(bS)).normalize();
    // a held half = the hand's own movement x where the ring sits in the fist (pre) x how the blade leans there (set each frame) x the half's own shape (post)
    const grip = (s, bow, hand, bone) => {
      const e3 = V3().crossVectors(bS, nS), h = g(bow[0], bow[1], 0), p = handPt(s, 0.020, -0.062, 0.006);
      return { s, pre: M4().copy(inv(hand)).multiply(M4().makeTranslation(p.x, p.y, p.z)), post: M4().makeBasis(bS, nS, e3).transpose().multiply(M4().makeTranslation(-h.x, -h.y, -h.z)).multiply(bind(bone)), t2: handDir(s, 1, 0, 0).normalize() };
    };
    return { A: grip(-1, GS.bowA, 'handR', 'shears'), B: grip(1, GS.bowB, 'handL', 'shearB'), axis: nS.clone(), a0: SK.shears.position.clone(), b0: SK.shearB.position.clone(), tip: g(0, GS.tipY, 0), mid: g(0, GS.tipY * 0.45, 0) };
  })();
  const _tmA = new THREE.Matrix4(), _tmB = new THREE.Matrix4(), _tmC = new THREE.Matrix4(), _tp1 = V3(), _tq1 = Qt(), _tsc = V3(), _t1 = V3(), _t3 = V3();
  // In her hands they are bigger than on her belt: in paintings H3 and H4 each dagger is about 45 cm, and the shears in the sheath (G1, G3) are 26.
  // "Her scissors become daggers" (lore): they grow as they leave the sheath and shrink as they go back. The ring stays in her fist as they do.
  const GROW = opts.shearsGrow === undefined ? 1.7 : +opts.shearsGrow, _tmS = new THREE.Matrix4(), _one = V3(1, 1, 1);
  const heldAt = (G, handBone, lean, k, out) => { handDir(G.s, 0, Math.sin(lean), Math.cos(lean), _t1).normalize(); _t3.crossVectors(_t1, G.t2); return out.multiplyMatrices(handBone.matrixWorld, G.pre).multiply(_tmC.makeBasis(_t1, G.t2, _t3)).multiply(_tmS.makeScale(k, k, k)).multiply(G.post); };
  function poseTools(P) {
    if (!TOOL) return;
    const A = SK.shears, B = SK.shearB, held = cl(P.shr || 0, 0, 1), split = cl(P.shs || 0, 0, 1), lean = P.shl === undefined ? 0.44 : P.shl, k = lerp(1, GROW, sm(0.25, 1, held));
    A.position.copy(TOOL.a0); A.quaternion.set(0, 0, 0, 1); A.scale.set(1, 1, 1);
    if (held > 0.001) { _tmA.copy(A.parent.matrixWorld).invert().multiply(heldAt(TOOL.A, SK.handR, lean, k, _tmB)); _tmA.decompose(_tp1, _tq1, _tsc); A.position.lerp(_tp1, held); A.quaternion.slerp(_tq1, held); A.scale.lerp(_tsc, held); }
    A.updateMatrixWorld(true);
    B.position.copy(TOOL.b0); B.quaternion.setFromAxisAngle(TOOL.axis, P.sho || 0); B.scale.set(1, 1, 1);
    if (split > 0.001) { _tmA.copy(A.matrixWorld).invert().multiply(heldAt(TOOL.B, SK.handL, lean, k, _tmB)); _tmA.decompose(_tp1, _tq1, _tsc); B.position.lerp(_tp1, split); B.quaternion.slerp(_tq1, split); B.scale.lerp(_tsc, split); }
    B.updateMatrixWorld(true);
  }
  // Two of the arm rules need to know how much time has passed, so they can change over time and not over distance. animate() sets poseDt for
  // its own call; a pose applied directly (the workbench, a still) has poseDt 0 and gets the plain, instant rule.
  //   - The elbow tuck and forearm turn of a hanging arm fade as the hand leaves her side. Tied to the hand's height alone, a quick hand crossed
  //     that fade in three frames and the forearm snapped round 49 degrees. Now the fade takes about a fifth of a second however fast the hand goes.
  //   - When the elbow's given direction lies almost along the arm, there is no telling which way the elbow should point and it could flip
  //     in one frame. Then the elbow keeps the direction it had.
  let poseDt = 0, poseQuiet = false;      // poseQuiet: a pose worked out for her ghost double; it must leave her own arm memory and her face alone
  const armSt = { R: { hang: -1, a: 0, perp: V3(), has: false }, L: { hang: -1, a: 0, perp: V3(), has: false } }, _AR = V3(), _dR = V3(), _pR = V3();
  function applyPose(P) {
    const hips = SK.hips, hh = hips.userData.home;
    hips.position.set(hh.x + P.hip[0], hh.y + P.hip[1], hh.z + P.hip[2]); hips.rotation.set(P.hipR[1], P.hipR[0], P.hipR[2], 'YXZ');
    for (let i = 0; i < 3; i++) SK['spine' + (i + 1)].rotation.set(P.sp[1] * SPF[i], P.sp[0] * SPF[i], P.sp[2] * SPF[i], 'YXZ');
    SK.neck.rotation.set(P.hd[1] * 0.35, P.hd[0] * 0.35, P.hd[2] * 0.35, 'YXZ'); SK.head.rotation.set(P.hd[1] * 0.65, P.hd[0] * 0.65, P.hd[2] * 0.65, 'YXZ');
    SK.clavR.rotation.set(0, 0, -P.sh[0]); SK.clavL.rotation.set(0, 0, P.sh[1]);
    root.updateMatrixWorld(true);
    root.getWorldQuaternion(_rq);
    for (const [S, s] of SIDES) {
      // arm
      SK['clav' + S].getWorldQuaternion(_pq); SK['uarm' + S].getWorldPosition(_A);
      const h = P['h' + S], e = P['e' + S];
      if (SHOULDER > 0) {                             // an arm hanging at her side leaves the shoulder exactly where it was, so her resting pose is unchanged
        _T.copy(_A); root.worldToLocal(_T); const dx = h[0] - _T.x, dy = h[1] - _T.y, dz = h[2] - _T.z, el = Math.atan2(dy, Math.hypot(dx, dz));
        const lift = 0.34 * sm(-0.25, 1.15, el) * SHOULDER, fwd = (0.20 * sm(0.14, 0.44, dz) + 0.14 * sm(0.02, 0.26, -s * h[0])) * SHOULDER, C = SK['clav' + S];
        C.rotation.set(0, -s * fwd, s * (P.sh[s < 0 ? 0 : 1] + lift)); C.updateMatrixWorld(true); C.getWorldQuaternion(_pq); SK['uarm' + S].getWorldPosition(_A);
      }
      // An arm hanging at her side carries its elbow in toward her waist and its forearm out and away, as in painting A1 (and as a real arm does).
      // The further a hand is lifted or swung from her side, the less of this there is, so every move keeps the elbow it was given.
      const hangT = HANG_IN * sm(1.02, 0.90, h[1]) * sm(0.34, 0.10, Math.abs(h[2] - 0.055)) * sm(0.50, 0.36, Math.abs(h[0])), AS = armSt[S]; let hang = hangT;
      if (poseDt > 0 && AS.hang >= 0) { const k = 1 - Math.exp(-poseDt / 0.075); AS.a += (hangT - AS.a) * k; AS.hang += (AS.a - AS.hang) * k; hang = AS.hang; } else if (!poseQuiet) AS.a = AS.hang = hangT;
      _T.set(h[0], h[1], h[2]).applyMatrix4(root.matrixWorld); SK.spine1.getWorldPosition(_J); _T.sub(_J).multiplyScalar(UPK).add(_J);
      _AR.copy(_A); root.worldToLocal(_AR); _dR.set(h[0] - _AR.x, h[1] - _AR.y, h[2] - _AR.z).normalize(); _pR.set(e[0] - s * hang, e[1], e[2]);
      { const pl = _pR.length() || 1; _pR.addScaledVector(_dR, -_pR.dot(_dR)); const m = _pR.length() / pl; if (m > 1e-4) _pR.multiplyScalar(1 / _pR.length()); else _pR.copy(AS.perp);
        if (poseDt > 0 && AS.has) { const w = sm(0.08, 0.38, m); if (w < 1) { _pR.lerp(AS.perp, 1 - w); _pR.addScaledVector(_dR, -_pR.dot(_dR)); if (_pR.lengthSq() > 1e-8) _pR.normalize(); else _pR.copy(AS.perp); } }
        if (!poseQuiet) { AS.perp.copy(_pR); AS.has = true; } }
      _P.copy(_pR).applyQuaternion(_rq);
      if (SOFT_FROM > 0) { const LA = LIMB['arm' + S], full = (LA.l1 + LA.l2) * 0.9985, da = (LA.l1 + LA.l2) * SOFT_FROM, z = full - da; _va.subVectors(_T, _A); const d = _va.length(); if (d > da && z > 0) _T.copy(_A).addScaledVector(_va, (da + z * (1 - Math.exp(-(d - da) / z))) / d); }
      solveLimb(SK['uarm' + S], SK['farm' + S], _A, _T, _P, LIMB['arm' + S], 0, _pq, _mq);
      { const tw = -s * (P['tw' + S] + hang * HANG_TW), ad = armDir[S]; SK['ftwA' + S].quaternion.setFromAxisAngle(ad, tw / 3); SK['ftwB' + S].quaternion.setFromAxisAngle(ad, tw * 2 / 3); SK['ftwC' + S].quaternion.setFromAxisAngle(ad, tw); }
      const HA = handAxes[S], w = P['wr' + S];
      _qa.setFromAxisAngle(HA.curl, w[0]); _qb.setFromAxisAngle(HA.palm, w[1]); SK['hand' + S].quaternion.copy(_qb).multiply(_qa);
      if (SK['wrm' + S]) SK['wrm' + S].quaternion.set(0, 0, 0, 1).slerp(SK['hand' + S].quaternion, 0.5);
      poseFingers(S, P['f' + S]);
      // leg
      hips.getWorldQuaternion(_pq); SK['thigh' + S].getWorldPosition(_A);
      const f = P['ft' + S], k = P['kn' + S], fr = SK['foot' + S].userData.rest;
      _T.set(fr.x + f[0], fr.y + f[1], fr.z + f[2]).applyMatrix4(root.matrixWorld); _P.set(k[0], k[1], k[2]).applyQuaternion(_rq);
      solveLimb(SK['thigh' + S], SK['shin' + S], _A, _T, _P, LIMB['leg' + S], 0, _pq, _mq);
      _fq.copy(_rq).multiply(_qa.setFromAxisAngle(Y_AX, f[3])).multiply(_qb.setFromAxisAngle(X_AX, f[4])); if (f[5]) _fq.multiply(_qa.setFromAxisAngle(Z_AX, f[5]));
      SK['foot' + S].quaternion.copy(_mq.invert()).multiply(_fq);
      // f[6]: how far the foot follows its shin instead of the ground (legs folded off the floor): then yaw, pitch and roll are the ankle's own
      const rel = f[6] || 0;
      if (rel > 0.001) { _qc.setFromAxisAngle(Y_AX, f[3]).multiply(_qa.setFromAxisAngle(X_AX, f[4])).multiply(_qb.setFromAxisAngle(Z_AX, f[5])); SK['foot' + S].quaternion.slerp(_qc, Math.min(1, rel)); }
      SK['toe' + S].quaternion.setFromAxisAngle(X_AX, -Math.max(0, f[4]) * 0.92 * (1 - Math.min(1, rel)));
    }
    if (SK.sheath) SK.sheath.quaternion.set(0, 0, 0, 1).slerp(SK.thighR.quaternion, 0.85);      // her sheath hangs from the belt but lies along her right thigh, and goes where it goes
    root.updateMatrixWorld(true);
    poseTools(P);
    if (!poseQuiet) paintFace(P.eyes, MOUTHS[Math.round(cl(P.mouth, 0, 2))], P.glow);
  }
  // ---------- base layer: the breathing stance and the walk ----------
  let blinkAt = 2.2, blinkT = -1;
  const walkPose = clonePose(REST), runPose = clonePose(REST);
  const RUN_PITCH = [[-0.125, 0.35], [0, -0.08], [0.125, -0.10], [0.25, 0.05], [0.375, 0.55], [0.5, 0.95], [0.67, 1.15], [0.875, 0.35], [1, -0.08], [1.125, -0.10]];
  function fillBase(t, ph, wb, dt, rb) {
    const br = Math.sin(t * 1.5), br2 = Math.sin(t * 1.5 - 0.9), sw = Math.sin(t * 0.47), sw2 = Math.sin(t * 0.31 + 1.3);
    const B = base, R = REST;
    B.hip[0] = 0.006 * sw; B.hip[1] = -0.004 + 0.003 * br; B.hip[2] = 0.004 * sw2;
    B.hipR[0] = 0.02 * sw2; B.hipR[1] = 0; B.hipR[2] = -0.012 * sw;
    B.sp[0] = -0.025 * sw2; B.sp[1] = 0.012 * br - 0.01; B.sp[2] = 0.016 * sw;
    B.hd[0] = 0.04 * Math.sin(t * 0.37 + 0.5); B.hd[1] = -0.015 + 0.012 * br2; B.hd[2] = -0.012 * sw;
    B.sh[0] = B.sh[1] = 0.025 * br + 0.01;
    for (const [S, s] of SIDES) {
      const h = B['h' + S], r = R['h' + S];
      h[0] = r[0] + s * 0.004 * br + 0.004 * sw; h[1] = r[1] + 0.006 * br2 - 0.002; h[2] = r[2] + 0.008 * sw2 * s + 0.004 * br;
      B['e' + S][0] = R['e' + S][0]; B['e' + S][1] = R['e' + S][1]; B['e' + S][2] = R['e' + S][2];
      B['tw' + S] = 0.05 * sw * s; B['wr' + S][0] = REST_WR[0] + 0.03 * br2; B['wr' + S][1] = REST_WR[1];
      for (let i = 0; i < 6; i++) B['f' + S][i] = R['f' + S][i] + 0.03 * Math.sin(t * 0.9 + i + s);
      for (let i = 0; i < 7; i++) B['ft' + S][i] = R['ft' + S][i];
      for (let i = 0; i < 3; i++) B['kn' + S][i] = R['kn' + S][i];
    }
    if (blinkT < 0 && t > blinkAt) { blinkT = 0; blinkAt = t + 2.4 + 3.2 * h1(Math.floor(t * 7.3)); }
    if (blinkT >= 0) { blinkT += dt; if (blinkT > 0.2) blinkT = -1; }
    B.eyes = blinkT >= 0 ? Math.sin(cl(blinkT / 0.2, 0, 1) * PI) : 0; B.mouth = 0; B.glow = 0;
    const lw = Math.max(wb, rb || 0), gait = cl(rb || 0, 0, 1);
    if (lw > 0.001) {
      const W = walkPose, c = Math.cos(ph), sn = Math.sin(ph), c2w = Math.cos(2 * ph), ST = 0.62, TOE = 0.78, yToe = Math.sin(TOE) * 0.085;
      // A walk, not a jog: one foot is always on the ground (each stays down for 62% of the stride), the heel lands first and the toe leaves last,
      // the swinging foot stays low, the hips are lowest when both feet are down, and the arms hang and swing from the shoulder.
      W.hip[0] = -0.020 * sn; W.hip[1] = -0.031 - 0.019 * c2w; W.hip[2] = 0.005;
      W.hipR[0] = 0.11 * c; W.hipR[1] = 0.02; W.hipR[2] = -0.030 * sn;
      W.sp[0] = -0.17 * c; W.sp[1] = 0.03; W.sp[2] = 0.035 * sn;
      W.hd[0] = 0.06 * c; W.hd[1] = -0.02; W.hd[2] = -0.01 * sn; W.sh[0] = W.sh[1] = 0;
      for (const [S, s] of SIDES) {
        const p = ph + (s < 0 ? 0 : PI), q = ((p / TAU) % 1 + 1) % 1, f = W['ft' + S], swing = -Math.cos(p); let z, y, pitch;      // the arm swings against its own leg
        if (q < ST) { const u = q / ST; z = lerp(0.24, -0.27, u); pitch = u < 0.16 ? lerp(-0.30, 0, u / 0.16) : TOE * Math.pow(sm(0.58, 1, u), 1.2); y = pitch < 0 ? -pitch * 0.04 : Math.sin(pitch) * 0.085; }
        else { const u = (q - ST) / (1 - ST); z = lerp(-0.27, 0.24, u * u * (3 - 2 * u)); pitch = TOE - (TOE + 0.30) * Math.pow(u, 0.8); y = yToe * (1 - u) * (1 - u) + 0.050 * Math.pow(Math.sin(PI * u), 0.8) + 0.012 * u; }
        f[0] = -s * 0.015; f[1] = y; f[2] = z; f[3] = s * 0.07; f[4] = pitch; f[5] = 0; f[6] = 0;
        W['kn' + S][0] = s * 0.05; W['kn' + S][1] = 0; W['kn' + S][2] = 1;
        const h = W['h' + S]; h[0] = s * (0.262 - 0.012 * swing); h[1] = 0.872 + 0.018 * swing + 0.016 * swing * swing; h[2] = 0.035 + 0.185 * swing;
        const e = W['e' + S]; e[0] = s * 0.4; e[1] = -0.2; e[2] = -1;
        W['tw' + S] = 0.10; W['wr' + S][0] = 0.10; W['wr' + S][1] = 0;
        for (let i = 0; i < 6; i++) W['f' + S][i] = lerp(FP.relax[i], FP.fist[i], 0.10);
      }
      W.eyes = B.eyes; W.mouth = 0; W.glow = 0;
      if (gait > 0.001) {                             // the run: a longer stride, both feet off the ground twice a stride, elbows bent and pumping
        const Rn = runPose, c2 = Math.cos(2 * ph), fl = 0.055 * Math.max(0, c2);
        Rn.hip[0] = -0.010 * sn; Rn.hip[1] = -0.045 + 0.040 * c2; Rn.hip[2] = 0.02;
        Rn.hipR[0] = 0.14 * c; Rn.hipR[1] = 0.05; Rn.hipR[2] = -0.05 * sn;
        Rn.sp[0] = -0.34 * c; Rn.sp[1] = 0.17; Rn.sp[2] = 0.04 * sn;
        Rn.hd[0] = 0.17 * c; Rn.hd[1] = -0.12; Rn.hd[2] = 0; Rn.sh[0] = Rn.sh[1] = 0.05;
        for (const [S, s] of SIDES) {
          const p = ph + (s < 0 ? 0 : PI), q = ((p / TAU) % 1 + 1) % 1, cz = Math.cos(p), swing = -cz;
          const u = ((q - 0.375 + 1) % 1) / 0.75, hs = u < 1 ? 0.26 * Math.pow(Math.sin(PI * Math.pow(u, 0.75)), 0.9) : 0, pitch = spline(RUN_PITCH, q);
          const f = Rn['ft' + S]; f[0] = -s * 0.012; f[1] = fl + hs + Math.max(0, Math.sin(pitch)) * 0.085; f[2] = 0.27 * cz - 0.03; f[3] = s * 0.03; f[4] = pitch; f[5] = 0;
          Rn['kn' + S][0] = s * 0.05; Rn['kn' + S][1] = 0; Rn['kn' + S][2] = 1;
          const h = Rn['h' + S]; h[0] = s * (0.205 - 0.055 * swing); h[1] = 1.05 + 0.10 * swing + 0.012 * c2; h[2] = 0.05 + 0.25 * swing;
          const e = Rn['e' + S]; e[0] = s * 0.45; e[1] = -0.35; e[2] = -1;
          Rn['tw' + S] = 0.5; Rn['wr' + S][0] = 0.05; Rn['wr' + S][1] = 0;
          for (let i = 0; i < 6; i++) Rn['f' + S][i] = lerp(FP.relax[i], FP.fist[i], 0.5);
        }
        Rn.eyes = B.eyes; Rn.mouth = 0; Rn.glow = 0;
        blendPose(W, W, Rn, sm(0, 1, gait));
      }
      blendPose(B, B, W, sm(0, 1, lw));
    }
  }

  // ---------- spell effects, in world space (the scene adds fx): sparks, glows, sigils, rings, the well, the flail ----------
  const COL = { violet: [0.58, 0.24, 1.0], magenta: [1.0, 0.30, 0.80], pale: [0.86, 0.72, 1.0], gold: [1.0, 0.74, 0.30], white: [1, 1, 1] };
  const glowOnly = (m, pre) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = pre ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; return m; };
  const NPART = 900, pPos = new Float32Array(NPART * 3), pCol = new Float32Array(NPART * 3), pSize = new Float32Array(NPART), pAlpha = new Float32Array(NPART);
  const pVel = new Float32Array(NPART * 3), pLife = new Float32Array(NPART), pMax = new Float32Array(NPART), pGrav = new Float32Array(NPART), pDrag = new Float32Array(NPART), pS0 = new Float32Array(NPART), pTw = new Float32Array(NPART), pKind = new Float32Array(NPART);
  let pNext = 0;
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3)); pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1)); pGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pAlpha, 1)); pGeo.setAttribute('aKind', new THREE.BufferAttribute(pKind, 1));
  const pMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uVH: { value: 800 } },
    vertexShader: 'attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aKind; uniform float uVH; varying vec3 vC; varying float vA; varying float vK;\nvoid main(){ vC = aColor; vA = aAlpha; vK = aKind; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(1.5, aSize * 1.6 * projectionMatrix[1][1] * uVH * 0.5 / max(0.05, -mv.z)); }',
    fragmentShader: 'varying vec3 vC; varying float vA; varying float vK;\nvoid main(){ vec2 p = gl_PointCoord * 2.0 - 1.0; float a = 1.0 - (sqrt(abs(p.x)) + sqrt(abs(p.y))); float star = pow(max(a, 0.0), 1.3) * 1.9 + exp(-dot(p, p) * 6.0) * 0.5; float mote = exp(-dot(p, p) * 3.2) * 0.9; gl_FragColor = vec4(vC * mix(star, mote, vK) * vA, 1.0); }' });
  glowOnly(pMat, true); const pPoints = new THREE.Points(pGeo, pMat); pPoints.frustumCulled = false; pPoints.renderOrder = 30;
  const _dbs = new THREE.Vector2();
  // sparks are sized by the height of the picture being drawn into: the screen, or the small picture of the Flipbook look, where a spark is a pixel or two
  pPoints.onBeforeRender = (r) => { const rt = r.getRenderTarget(); if (rt) pMat.uniforms.uVH.value = rt.height; else { r.getDrawingBufferSize(_dbs); pMat.uniforms.uVH.value = _dbs.y; } pMat.uniformsNeedUpdate = true; };
  fx.add(pPoints);
  function emit(x, y, z, vx, vy, vz, life, size, col, grav, drag) {
    const i = pNext; pNext = (pNext + 1) % NPART;
    pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z; pVel[i * 3] = vx; pVel[i * 3 + 1] = vy; pVel[i * 3 + 2] = vz;
    pLife[i] = pMax[i] = life; pS0[i] = size; pCol[i * 3] = col[0]; pCol[i * 3 + 1] = col[1]; pCol[i * 3 + 2] = col[2]; pGrav[i] = grav || 0; pDrag[i] = drag == null ? 1.2 : drag; pTw[i] = Math.random() * 20; pKind[i] = kindNext;
  }
  let kindNext = 0;
  const rs = () => Math.random() * 2 - 1;
  function burst(p, n, speed, life, size, col, grav, drag, up) {
    for (let i = 0; i < n; i++) { const d = _va.set(rs(), rs() + (up || 0), rs()).normalize(), sp = speed * (0.35 + 0.65 * Math.random()); emit(p.x, p.y, p.z, d.x * sp, d.y * sp, d.z * sp, life * (0.5 + 0.5 * Math.random()), size * (0.5 + Math.random()), col, grav, drag); }
  }
  function mist(p, n, rad, life, size, col, vy) {
    for (let i = 0; i < n; i++) emit(p.x + rs() * rad, p.y + rs() * rad, p.z + rs() * rad, rs() * 0.06, (vy || 0) + rs() * 0.05, rs() * 0.06, life * (0.6 + 0.4 * Math.random()), size * (0.5 + Math.random()), col, 0, 0.6);
  }
  function stepParticles(dt, t) {
    for (let i = 0; i < NPART; i++) {
      if (pLife[i] <= 0) { if (pAlpha[i] !== 0) { pAlpha[i] = 0; pSize[i] = 0; } continue; }
      pLife[i] -= dt; const a = i * 3, k = Math.max(0, 1 - pDrag[i] * dt);
      pVel[a] *= k; pVel[a + 1] = pVel[a + 1] * k - pGrav[i] * dt; pVel[a + 2] *= k;
      pPos[a] += pVel[a] * dt; pPos[a + 1] += pVel[a + 1] * dt; pPos[a + 2] += pVel[a + 2] * dt;
      const u = cl(pLife[i] / pMax[i], 0, 1), env = Math.min(1, (1 - u) * 8) * Math.pow(u, 0.6);
      pAlpha[i] = env * (0.65 + 0.35 * Math.sin(t * 17 + pTw[i])); pSize[i] = pS0[i] * (0.6 + 0.4 * u);
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.aSize.needsUpdate = true; pGeo.attributes.aAlpha.needsUpdate = true; pGeo.attributes.aColor.needsUpdate = true; pGeo.attributes.aKind.needsUpdate = true;
  }
  // glow and sigil sprites
  const glowTex = (function () { const c = cvs(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return ctex(c, 0, 0, false); })();
  const sigilTex = (function () {
    const S = 512, c = cvs(S, S), g = c.getContext('2d'), m = S / 2; g.translate(m, m); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineCap = 'round';
    g.shadowColor = '#fff'; g.shadowBlur = 14;
    g.lineWidth = 9; g.beginPath(); g.arc(0, 0, m * 0.86, 0, TAU); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.arc(0, 0, m * 0.74, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, m * 0.30, 0, TAU); g.stroke();
    g.lineWidth = 6; for (let k = 0; k < 4; k++) { g.rotate(TAU / 4); g.beginPath(); g.moveTo(0, m * 0.12); g.lineTo(0, m * 0.74); g.stroke(); }
    g.lineWidth = 3; g.rotate(TAU / 8); for (let k = 0; k < 4; k++) { g.rotate(TAU / 4); g.beginPath(); g.moveTo(0, m * 0.34); g.lineTo(0, m * 0.58); g.stroke(); g.beginPath(); g.arc(0, m * 0.64, m * 0.03, 0, TAU); g.fill(); }
    for (let k = 0; k < 12; k++) { g.rotate(TAU / 12); g.beginPath(); g.arc(0, m * 0.80, m * 0.018, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(0, 0, m * 0.07, 0, TAU); g.fill();
    return ctex(c, 0, 0, false);
  })();
  const colOf = (a, k) => new THREE.Color(a[0] * (k || 1), a[1] * (k || 1), a[2] * (k || 1));
  function sprite(tex, col, order) { const m = glowOnly(new THREE.SpriteMaterial({ map: tex, color: colOf(col), depthWrite: false, transparent: true, opacity: 0 })); const s = new THREE.Sprite(m); s.visible = false; s.renderOrder = order || 28; fx.add(s); return s; }
  function show(s, p, size, op, rot) { if (op <= 0.003) { s.visible = false; return; } s.visible = true; s.position.copy(p); s.scale.set(size, size, 1); s.material.opacity = Math.min(1, op * 0.62); if (rot != null) s.material.rotation = rot; }
  const gHandR = sprite(glowTex, COL.violet), gHandL = sprite(glowTex, COL.violet), gMain = sprite(glowTex, [0.8, 0.2, 0.7]), gCore = sprite(glowTex, COL.pale), gAux = sprite(glowTex, [0.45, 0.16, 0.85]);
  const sigil = sprite(sigilTex, [0.95, 0.45, 1.0], 29), sigil2 = sprite(sigilTex, [0.95, 0.45, 1.0], 29), gGold = sprite(glowTex, COL.gold), ringGold = sprite(sigilTex, COL.gold, 29);
  // rings: the Curtain Call sweep (flat round her waist) and the Hush ring (facing the target)
  const addMat = (col) => glowOnly(new THREE.MeshBasicMaterial({ color: colOf(col), transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide }));
  const sweep = new THREE.Mesh(new THREE.TorusGeometry(1, 0.016, 8, 96), addMat([1.0, 0.22, 0.7])); sweep.rotation.x = PI / 2 - 0.2; sweep.visible = false; sweep.renderOrder = 27; fx.add(sweep);
  const sweep2 = new THREE.Mesh(new THREE.RingGeometry(0.86, 1.0, 96, 1), addMat(COL.violet)); sweep2.rotation.x = -PI / 2 - 0.2; sweep2.visible = false; sweep2.renderOrder = 27; fx.add(sweep2);
  const hushRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 64), addMat(COL.violet)); hushRing.visible = false; hushRing.renderOrder = 27; fx.add(hushRing);
  // layers borrowed from how big spell effects are built: marks on the floor, shock rings, a shaft of light, soft motes
  const floorSig = [0, 1].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glowOnly(new THREE.MeshBasicMaterial({ map: sigilTex, color: colOf(COL.violet), transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide }))); m.rotation.x = -PI / 2; m.visible = false; m.renderOrder = 25; fx.add(m); return m; });
  function floorSigil(c, R, op, t, col) { floorSig.forEach((m, i) => { m.visible = op > 0.003; if (!m.visible) return; m.position.set(c.x, c.y + 0.014 + i * 0.004, c.z); m.scale.setScalar(R * (i ? 0.6 : 1)); m.rotation.z = (i ? -1.6 : 1) * t * 0.45; m.material.opacity = op * (i ? 0.6 : 0.8); m.material.color.copy(colOf(col || COL.violet)); }); }
  const shocks = []; let shockNext = 0;
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 72, 1), addMat(COL.violet)), r = { m, t: 1, dur: 1, r0: 0, r1: 1, flat: false };
    m.visible = false; m.renderOrder = 27; fx.add(m); shocks.push(r);
    m.onBeforeRender = (rn, sc, cam) => { if (!r.flat) { m.quaternion.copy(cam.quaternion); m.updateMatrixWorld(); } };
  }
  function shock(p, r0, r1, dur, col, flat) { const r = shocks[shockNext]; shockNext = (shockNext + 1) % shocks.length; r.t = 0; r.dur = dur; r.r0 = r0; r.r1 = r1; r.flat = !!flat; r.m.position.copy(p); if (flat) { r.m.position.y += 0.02; r.m.rotation.set(-PI / 2, 0, 0); } r.m.material.color.copy(colOf(col)); r.m.visible = true; }
  function stepShocks(dt) { for (const r of shocks) { if (r.t >= r.dur) { r.m.visible = false; continue; } r.t += dt; const u = Math.min(1, r.t / r.dur), e = 1 - Math.pow(1 - u, 3); r.m.scale.setScalar(Math.max(0.001, lerp(r.r0, r.r1, e))); r.m.material.opacity = (1 - u) * (1 - u); } }
  const shaftTex = (function () { const c = cvs(64, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    const gv = g.createLinearGradient(0, 0, 0, 256); gv.addColorStop(0, 'rgba(0,0,0,1)'); gv.addColorStop(0.3, 'rgba(0,0,0,0)'); gv.addColorStop(0.85, 'rgba(0,0,0,0)'); gv.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = gv; g.fillRect(0, 0, 64, 256); return ctex(c, 0, 0, false); })();
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowOnly(new THREE.MeshBasicMaterial({ map: shaftTex, color: colOf(COL.pale), transparent: true, depthWrite: false, depthTest: false, opacity: 0, side: THREE.DoubleSide }))); shaft.visible = false; shaft.renderOrder = 24; fx.add(shaft);
  shaft.onBeforeRender = (rn, sc, cam) => { shaft.rotation.set(0, Math.atan2(cam.position.x - shaft.position.x, cam.position.z - shaft.position.z), 0); shaft.updateMatrixWorld(); };
  function beam(c, w, h, op, col) { shaft.visible = op > 0.003; if (!shaft.visible) return; shaft.position.set(c.x, c.y + h / 2, c.z); shaft.scale.set(w, h, 1); shaft.material.opacity = op; shaft.material.color.copy(colOf(col)); }
  function motes(p, n, rad, life, size, col, vy) { kindNext = 1; mist(p, n, rad, life, size, col, vy); kindNext = 0; }
  let dimK = 0, dimNow = 0;
  const dim = (k) => { if (k > dimK) dimK = k; };
  // the gravity well: a black heart with a violet rim
  const well = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uA: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uA; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(mix(vec3(0.01,0.0,0.02), vec3(0.75,0.32,1.0), f) * (0.2 + f * 2.2), uA); }' }));
  well.visible = false; well.renderOrder = 26; fx.add(well);
  const spellLight = new THREE.PointLight(0xb060ff, 0, 3.2, 1.6); fx.add(spellLight);
  let lightK = 0; const lightP = V3(0, 1.2, 0.4);
  function light(p, k, hex) { if (k <= lightK) return; lightP.copy(p); lightK = k; spellLight.color.setHex(hex || 0xb060ff); }
  // the flail: the hip bells on their chain, loose in her hand
  const FL_N = 15, flP = [], flV = []; for (let i = 0; i < FL_N; i++) { flP.push(V3()); flV.push(V3()); }
  const flBeads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0085, 8, 6), new THREE.MeshStandardMaterial({ color: lin(0xe0ad48), roughness: 0.25, metalness: 1 }), FL_N - 1); flBeads.frustumCulled = false; flBeads.castShadow = true;
  const flHead = new THREE.Group(), bellMat = new THREE.MeshStandardMaterial({ color: lin(0xe6b24a), roughness: 0.2, metalness: 1, emissive: lin(0x7a4a08), emissiveIntensity: 0.25 });
  for (const [dx, dy, dz, r] of bellGeo.bells) { const b = new THREE.Mesh(new THREE.SphereGeometry(r * 2.0, 16, 12), bellMat); b.position.set(dx * 2.1, dy * 2.1 + 0.08, dz * 2.1); b.castShadow = true; flHead.add(b); }
  const flail = new THREE.Group(); flail.add(flBeads, flHead); flail.visible = false; fx.add(flail);
  const TRAIL_N = 26, trailPts = []; for (let i = 0; i < TRAIL_N; i++) trailPts.push(V3());
  const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_N * 6), 3));
  { const col = new Float32Array(TRAIL_N * 6), idx = []; for (let i = 0; i < TRAIL_N; i++) { const a = Math.pow(1 - i / (TRAIL_N - 1), 1.5); for (let k = 0; k < 6; k++) col[i * 6 + k] = [1.0, 0.72, 0.28][k % 3] * a; if (i < TRAIL_N - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); } trailGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); trailGeo.setIndex(idx); }
  const trail = new THREE.Mesh(trailGeo, glowOnly(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0 }))); trail.frustumCulled = false; trail.visible = false; fx.add(trail);
  let flLen = 0.6, flInit = false, trailOn = 0;
  const _im = new THREE.Matrix4(), _fa = V3(), _fb = V3();
  function stepFlail(dt, hand, len, drive, driveW) {       // a rope from her hand; drive pulls the bells toward a scripted point
    const seg = len / (FL_N - 1);
    if (!flInit) { for (let i = 0; i < FL_N; i++) { flP[i].copy(hand); flP[i].y -= i * seg; flV[i].copy(flP[i]); } flInit = true; for (let i = 0; i < TRAIL_N; i++) trailPts[i].copy(flP[FL_N - 1]); }
    const steps = dt > 0 ? 3 : 0, h = dt / 3;
    for (let s = 0; s < steps; s++) {
      for (let i = 1; i < FL_N; i++) { const p = flP[i], v = flV[i]; _fa.subVectors(p, v).multiplyScalar(0.985); v.copy(p); p.add(_fa); p.y -= 9.8 * h * h * (i === FL_N - 1 ? 1.6 : 1); if (p.y < 0.03) p.y = 0.03; }
      if (drive && driveW > 0) flP[FL_N - 1].lerp(drive, 1 - Math.pow(1 - driveW, h * 60));
      for (let it = 0; it < 6; it++) { flP[0].copy(hand); for (let i = 1; i < FL_N; i++) { _fa.subVectors(flP[i], flP[i - 1]); const L = _fa.length() || 1e-6, k = (L - seg) / L; if (i === 1) flP[i].addScaledVector(_fa, -k); else { flP[i - 1].addScaledVector(_fa, k * 0.5); flP[i].addScaledVector(_fa, -k * 0.5); } } }
    }
    flP[0].copy(hand);
    for (let i = 0; i < FL_N - 1; i++) { _fa.copy(flP[i]).lerp(flP[i + 1], 0.5); _im.makeTranslation(_fa.x, _fa.y, _fa.z); flBeads.setMatrixAt(i, _im); }
    flBeads.instanceMatrix.needsUpdate = true;
    const head = flP[FL_N - 1]; flHead.position.copy(head); _fa.subVectors(head, flP[FL_N - 2]).normalize(); flHead.quaternion.setFromUnitVectors(_fb.set(0, -1, 0), _fa);
    for (let i = TRAIL_N - 1; i > 0; i--) trailPts[i].copy(trailPts[i - 1]); trailPts[0].copy(head);
    const ta = trailGeo.attributes.position.array;
    for (let i = 0; i < TRAIL_N; i++) { const p = trailPts[i], w = 0.05 * (1 - i / TRAIL_N); ta[i * 6] = p.x; ta[i * 6 + 1] = p.y + w; ta[i * 6 + 2] = p.z; ta[i * 6 + 3] = p.x; ta[i * 6 + 4] = p.y - w; ta[i * 6 + 5] = p.z; }
    trailGeo.attributes.position.needsUpdate = true; trail.visible = trailOn > 0.01; trail.material.opacity = trailOn;
  }
  const fxHitP = V3();
  function fxHit(out) { return out.copy(fxHitP); }
  let tgtK = 1;                                       // how far off her target stands, as a share of the usual 2.6 m (hosts set targetDist)
  const toward = (out, p, d) => out.copy(p).addScaledVector(_tgt, d >= 2 ? d * tgtK : d);      // a point d meters toward the target
  const _tgt = V3(1, 0, 0), _h1 = V3(), _h2 = V3(), _h3 = V3(), _h4 = V3();
  const cue = (a, name, at) => { if (a.t >= at && !a.fired[name]) { a.fired[name] = true; return true; } return false; };
  const win = (t, a, b, fade) => sm(a, a + (fade || 0.15), t) * (1 - sm(b - (fade || 0.15), b, t));
  let aura = 0;
  const fxAuto = [];                                  // extra effect objects (later files add theirs): hidden at the start of every frame
  function flailSingle(on) { flHead.children.forEach((b, i) => { if (!b.userData.p0) b.userData.p0 = b.position.clone(); b.visible = !on || i === 0; if (on && i === 0) { b.position.set(0, 0.03, 0); b.scale.setScalar(1.35); } else { b.position.copy(b.userData.p0); b.scale.setScalar(1); } }); }
  let flailOne = false;
  function updateFx(t, dt, P) {
    _tgt.set(1, 0, 0).applyQuaternion(_rq);
    for (const s of [gHandR, gHandL, gMain, gCore, gAux, sigil, sigil2, gGold, ringGold]) s.visible = false;
    sweep.visible = sweep2.visible = hushRing.visible = well.visible = shaft.visible = false; floorSig[0].visible = floorSig[1].visible = false; lightK = 0; trailOn = 0; dimK = 0;
    for (const o of fxAuto) o.visible = false;
    let flailOn = false;
    if (act && act.def.fx) flailOn = act.def.fx(act, t, dt) === 'flail';
    if (stance && stance.def.fx) stance.def.fx(stance, t, dt);
    if (grabbed && !(act && act.def.grabs)) releaseGrab();
    const one = flailOn && !!act.def.oneBell; if (one !== flailOne) { flailOne = one; flailSingle(one); }
    if (!flailOn && flail.visible) { flail.visible = false; flInit = false; trail.visible = false; }
    if (meshes.bells) meshes.bells.visible = meshes.bellslit.visible = !flailOn;
    spellLight.position.copy(lightP); spellLight.intensity += (lightK * 2.4 - spellLight.intensity) * Math.min(1, dt * 14 + (dt === 0 ? 1 : 0));
    dimNow += (dimK - dimNow) * Math.min(1, dt * 4 + (dt === 0 ? 1 : 0)); stepShocks(dt);
    stepParticles(dt, t);
  }

  // ---------- her moves, keyed from the flipbook: times are (frame - 1) / fps of each clip; x is toward her left (screen right) ----------
  const UP = V3(0, 1, 0), _c1 = V3(), _c2 = V3(), _c3 = V3();
  const above = (out, p, d) => out.copy(p).addScaledVector(UP, d);

  // Curtain Call (48 frames at 6 fps; the ring sweeps on frame 32)
  defAction('curtain_call', 8.0, [
    { t: 0, hR: [-0.30, 0.85, 0.06], hL: [0.30, 0.85, 0.06], fR: FP.soft, fL: FP.soft, twR: 0.35, twL: 0.35 },
    { t: 0.67, hR: [-0.050, 1.085, 0.200], hL: [0.050, 1.085, 0.200], eR: [-1, -0.8, -0.2], eL: [1, -0.8, -0.2], twR: 0.5, twL: 0.5, fR: FP.cup, fL: FP.cup, hd: [0, 0.14, 0], sp: [0, 0.05, 0] },
    { t: 1.0, hR: [-0.235, 1.11, 0.22], hL: [0.235, 1.11, 0.22], fR: FP.weave, fL: FP.weave, twR: 0.1, twL: 0.1, hd: [0, 0.07, 0], sp: [0, 0.02, 0] },
    { t: 1.25, hR: [-0.285, 1.19, 0.20], hL: [0.295, 1.19, 0.20], hd: [0, 0, 0], ftL: [0.01, 0, 0.09, 0.12, 0], hip: [0, -0.012, 0.03] },
    { t: 1.55, hR: [-0.17, 1.12, 0.24], hL: [0.42, 0.90, 0.10], fL: FP.soft, twL: 0.2, sp: [-0.16, 0, 0.04], hd: [-0.12, 0, 0.02] },
    { t: 2.17, hR: [-0.27, 1.33, 0.16], hL: [0.46, 1.01, 0.06], twR: 1.35, fR: FP.cup, eR: [-1, -0.9, -0.1], sp: [-0.22, -0.02, 0.05], hd: [-0.28, -0.06, 0.05], wrR: [-0.2, 0] },
    { t: 2.83, hR: [-0.39, 1.55, 0.10], hL: [0.42, 0.92, 0.04], hd: [-0.32, -0.32, 0.08], sp: [-0.18, -0.08, 0.06] },
    { t: 3.17, hR: [-0.35, 1.70, 0.05], hL: [0.48, 0.80, 0.02], eR: [-1, -0.3, -0.4], fR: FP.open, wrR: [0, 0], hd: [-0.26, -0.46, 0.08], sp: [-0.1, -0.13, 0.08], ftR: [-0.10, 0, 0, -0.22, 0], ftL: [0.17, 0, 0.04, 0.26, 0], hip: [0.02, -0.03, 0.01] },
    { t: 3.5, hR: [-0.33, 1.58, 0.08], hL: [0.55, 1.33, 0.10], twL: 1.3, fL: FP.open, eL: [1, -0.6, -0.3], hd: [0, -0.46, 0], sp: [0, -0.13, 0] },
    { t: 3.83, hR: [-0.42, 1.62, 0.06], hL: [0.40, 1.63, 0.06], eL: [1, -0.4, -0.4], eR: [-1, -0.4, -0.4], twR: 0.9, twL: 0.9 },
    { t: 4.05, hR: [-0.355, 1.665, 0.05], hL: [0.355, 1.67, 0.05], hd: [0, -0.52, 0], eyes: 1, sp: [0, -0.17, 0], ftR: [0.03, 0, 0, -0.08, 0], ftL: [-0.03, 0, 0, 0.08, 0], hip: [0, 0.012, 0] },
    { t: 4.62, hR: [-0.365, 1.67, 0.05], hL: [0.365, 1.665, 0.05], hd: [0, -0.5, 0], eyes: 1 },
    { t: 4.86, hR: [-0.59, 1.36, 0.10], hL: [0.61, 1.30, 0.10], hd: [0.15, -0.05, 0], eyes: 0, sp: [0.05, -0.04, 0], twR: 0.9, twL: 0.9, eR: [-0.3, -1, -0.4], eL: [0.3, -1, -0.4] },
    { t: 5.08, hR: [-0.575, 1.15, 0.12], hL: [0.57, 1.14, 0.12], twR: 0.6, twL: 0.6, hd: [0.1, 0.13, 0], eyes: 0.7, sp: [0, 0.04, 0], ftL: [0, 0, 0.08, 0.1, 0], ftR: 'rest', hip: [0, -0.02, 0.02], mouth: 2 },
    { t: 5.67, hR: [-0.40, 0.94, 0.08], hL: [0.44, 0.88, 0.08], fR: FP.soft, fL: FP.soft, hd: [0, 0.05, 0], eyes: 0, sp: [0, 0, 0], eR: 'rest', eL: 'rest', hip: [0, 0, 0], ftL: 'rest' },
    { t: 6.05, hR: [-0.31, 0.84, 0.05], hL: [0.32, 0.84, 0.05], twR: 0.35, twL: 0.35, hd: [0, 0, 0], mouth: 2 },
    { t: 7.4, mouth: 0 }
  ], { hits: [5.17 / 8], cues: [1.0 / 8, 3.17 / 8, 4.86 / 8], outro: 0.6, fx(a, t, dt) {
    const T = a.t, hr = anchor('handR', _h1), hl = anchor('handL', _h2), mid = _h3.copy(hr).lerp(hl, 0.5);
    const ft = anchor('feet', _h4), stage1 = win(T, 0.5, 6.3, 0.7);
    dim(0.75 * win(T, 0.8, 5.25, 0.6));                                             // the house lights go down for the ultimate
    floorSigil(ft, lerp(0.5, 1.35, sm(0.5, 5.0, T)), stage1 * (0.7 + 0.3 * Math.sin(T * 5)), T, T > 4.9 ? COL.magenta : COL.violet);
    beam(ft, 1.7, 3.5, 0.22 * win(T, 3.2, 5.0, 0.4), COL.pale);
    if (stage1 > 0.1 && Math.random() < 30 * dt) { const an = Math.random() * TAU, r = 0.3 + Math.random() * 0.9; _c3.set(ft.x + r * Math.cos(an), 0.05, ft.z + r * Math.sin(an)); motes(_c3, 1, 0.02, 1.8, 0.05, Math.random() < 0.5 ? COL.violet : COL.magenta, 0.35); }
    if (cue(a, 'ring1', 3.15)) shock(above(_c1, hr, 0.13), 0.05, 1.0, 0.8, COL.pale);
    if (cue(a, 'ring2', 5.17)) { shock(ft, 0.3, 2.8, 1.1, COL.magenta, true); shock(anchor('chest', _c1), 0.1, 1.6, 0.7, COL.pale); }
    if (cue(a, 'ring3', 5.40)) shock(ft, 0.2, 2.2, 1.0, COL.violet, true);
    const g0 = win(T, 0, 0.95, 0.25) + 0.85 * win(T, 5.5, 7.9, 0.6);            // light gathers in her hands; at the end it ebbs from them
    if (g0 > 0.01) {
      show(gHandR, hr, 0.26, 0.85 * g0); show(gHandL, hl, 0.26, 0.85 * g0); light(mid, 0.3 * g0);
      if (Math.random() < 26 * dt * g0) mist(Math.random() < 0.5 ? hr : hl, 1, 0.05, 0.8, 0.032, COL.violet, 0.16);
    }
    const orb = win(T, 0.5, 1.15, 0.22);
    if (orb > 0.01) { show(gMain, mid, 0.26 + 0.3 * orb, orb); show(gCore, mid, 0.13, orb); light(mid, 0.7 * orb); }
    const sg = win(T, 0.95, 3.0, 0.22);                                             // the wheel of fate: between her hands, then riding her right palm
    if (sg > 0.01) {
      const ride = sm(1.35, 1.8, T), p = above(_c1, hr, 0.17).lerp(mid, 1 - ride); p.z += 0.05 * (1 - ride);
      const size = lerp(0.44, 0.27, ride) * (0.55 + 0.45 * sm(0.95, 1.25, T)) * (1 - 0.55 * sm(2.6, 3.0, T));
      show(sigil, p, size, sg, T * 1.5); show(gMain, p, size * 1.7, 0.5 * sg); light(p, 0.95 * sg);
      if (Math.random() < 34 * dt) mist(p, 1, size * 0.4, 0.8, 0.03, COL.magenta, 0.05);
    }
    const star = win(T, 2.6, 3.5, 0.22);
    if (star > 0.01) { const p = above(_c1, hr, 0.13); show(gCore, p, 0.12 + 0.2 * star, star); show(gAux, p, 0.7 * star, 0.6 * star); light(p, 1.5 * star); }
    if (cue(a, 'burst', 3.15)) { const p = above(_c1, hr, 0.13); burst(p, 120, 2.3, 1.7, 0.05, COL.pale, 1.3, 1.4, 0.5); burst(p, 70, 1.2, 1.3, 0.07, COL.magenta, 0.6, 1.2, 0.6); }
    if (T > 3.25 && T < 4.9) {                                                        // a canopy of sparks from hand to hand
      const reach = sm(3.25, 3.85, T), n = 80 * dt * (1 - sm(4.6, 4.9, T));
      for (let i = 0; i < n || (i === 0 && Math.random() < n); i++) {
        const u = Math.random() * reach, p = _c1.copy(hr).lerp(hl, u); p.y += 0.12 + 0.2 * Math.sin(u * PI) + rs() * 0.06; p.x += rs() * 0.06; p.z += rs() * 0.1;
        emit(p.x, p.y, p.z, rs() * 0.1, 0.05 + rs() * 0.1, rs() * 0.1, 0.9 + Math.random() * 0.7, 0.03 + Math.random() * 0.05, Math.random() < 0.5 ? COL.pale : COL.violet, 0.25, 0.8);
      }
      light(above(_c2, mid, 0.2), 0.9 * (1 - sm(4.6, 4.9, T)));
      if (reach >= 1) { show(gHandR, above(_c2, hr, 0.1), 0.3, 0.7); show(gHandL, above(_c3, hl, 0.1), 0.3, 0.7); }
    }
    const rg = win(T, 4.9, 6.1, 0.14);                                               // the curtain falls: a ring sweeps out from her
    if (rg > 0.01) {
      const k = sm(4.9, 6.0, T), R = lerp(0.28, 1.9, Math.pow(k, 0.75)), c = anchor('feet', _c1); c.y += 0.95 - 0.5 * k;
      sweep.visible = sweep2.visible = true; sweep.position.copy(c); sweep2.position.copy(c); sweep.scale.setScalar(R); sweep2.scale.setScalar(R);
      sweep.material.opacity = rg; sweep2.material.opacity = 0.3 * rg; light(_c2.copy(c).addScaledVector(Z_AX, 0.5), 1.2 * rg);
      const n = 260 * dt * rg;
      for (let i = 0; i < n; i++) { const an = Math.random() * TAU; emit(c.x + R * Math.cos(an), c.y + rs() * 0.03 - 0.2 * R * Math.sin(an), c.z + R * Math.sin(an), Math.cos(an) * 0.5, 0.15 + Math.random() * 0.3, Math.sin(an) * 0.5, 0.7 + Math.random() * 0.6, 0.045 + Math.random() * 0.06, Math.random() < 0.6 ? COL.magenta : COL.pale, 0.3, 1); }
    }
    if (cue(a, 'release', 5.17)) { toward(fxHitP, anchor('chest', _c1), 2.6); burst(anchor('chest', _c2), 50, 1.4, 1.0, 0.05, COL.pale, 0.2, 1.4, 0.2); }
  } });

  // Sealed Fate (24 frames at 5 fps; the mark is set on frame 16)
  defAction('sealed_fate', 4.8, [
    { t: 0.4, hR: [-0.150, 1.33, 0.15], eR: [-1, -1, 0], twR: 0.5, fR: FP.soft, wrR: [0.25, 0], hd: [0.08, 0.07, -0.05] },
    { t: 0.8, hR: [-0.145, 1.375, 0.14], hd: [0.1, 0.05, -0.07] },
    { t: 1.05, hR: [-0.27, 1.40, 0.12], twR: 1.4, fR: FP.cup, wrR: [-0.3, 0], hd: [-0.08, 0, 0.04] },
    { t: 1.4, hR: [-0.385, 1.40, 0.10], eyes: 1, hd: [0.07, 0.05, -0.06], sp: [0, 0, -0.02] },
    { t: 2.6, hR: [-0.335, 1.31, 0.10], eyes: 1 },
    { t: 3.0, hR: [-0.355, 1.38, 0.10], eyes: 1, hd: [0.07, 0.02, -0.06] },
    { t: 3.2, eyes: 0, mouth: 2 },
    { t: 3.6, hR: [-0.24, 1.34, 0.12], fR: FP.soft, twR: 0.9, wrR: [0, 0] },
    { t: 4.0, hR: [-0.19, 1.36, 0.14], twR: 0.5, hd: [0.08, 0.05, -0.04], wrR: [0.25, 0] },
    { t: 4.35, mouth: 0 }
  ], { hits: [3.0 / 4.8], cues: [1.05 / 4.8], outro: 0.45, fx(a, t, dt) {
    const T = a.t, hr = anchor('handR', _h1), k = win(T, 1.0, 3.7, 0.3);
    const ft = anchor('feet', _h4); dim(0.5 * win(T, 1.0, 3.3, 0.5)); floorSigil(ft, 0.8, 0.8 * win(T, 0.9, 3.7, 0.5), -T, COL.violet);
    const mk = win(T, 3.05, 4.6, 0.25);                                              // the Doom mark hangs on the target
    if (mk > 0.01) { show(sigil2, fxHitP, 0.36 + 0.04 * Math.sin(T * 9), mk, -T * 0.8); show(gMain, fxHitP, 0.7, 0.5 * mk); if (Math.random() < 20 * dt) motes(fxHitP, 1, 0.14, 0.8, 0.05, COL.magenta, -0.2); }
    if (cue(a, 'ringA', 3.0)) shock(above(_c1, hr, 0.19), 0.05, 0.7, 0.55, COL.pale);
    if (cue(a, 'ringB', 3.3)) shock(fxHitP, 0.6, 0.12, 0.45, COL.magenta);
    if (k > 0.01) {
      const p = above(_c1, hr, 0.19 + 0.02 * Math.sin(T * 3)), grow = sm(1.0, 1.5, T), pulse = 1 + 0.08 * Math.sin(T * 7), fade = 1 - 0.75 * sm(3.05, 3.6, T);
      show(sigil, p, 0.27 * grow * pulse * fade, k, -T * 1.2); show(gMain, p, 0.5 * grow * fade, 0.75 * k); show(gCore, p, 0.14 * grow * pulse, k); light(p, 1.1 * k);
      if (Math.random() < 30 * dt * k) { const an = Math.random() * TAU, r = 0.16; emit(p.x + r * Math.cos(an), p.y + r * Math.sin(an), p.z + rs() * 0.04, -Math.sin(an) * 0.25, Math.cos(an) * 0.25 + 0.05, 0, 0.8, 0.035, Math.random() < 0.5 ? COL.pale : COL.magenta, 0, 0.8); }
      const side = anchor('chest', _c2); side.addScaledVector(_tgt, 0.36); side.y -= 0.25; show(gAux, side, 1.2, 0.22 * k * win(T, 1.4, 3.3, 0.4));   // her veil takes the light
      const sp = win(T, 3.0, 3.55, 0.05);
      if (sp > 0.01) show(sigil2, p, 0.27 + 0.9 * sm(3.0, 3.55, T), 0.8 * sp, T);
      if (cue(a, 'release', 3.0)) { burst(p, 60, 1.3, 0.9, 0.05, COL.pale, 0, 1.6); toward(fxHitP, p, 2.6); for (let i = 0; i < 40; i++) { const u = i / 40; toward(_c3, p, 2.6 * u); emit(_c3.x, _c3.y + 0.12 * Math.sin(u * PI), _c3.z, rs() * 0.1, rs() * 0.1, rs() * 0.1, 0.35 + u * 0.5, 0.05, COL.magenta, 0, 1); } }
    }
  } });

  // Against All Odds (16 frames at 2 fps; the blessing lands on frame 4)
  const swayA = { hR: [-0.45, 1.50, 0.08], hL: [0.44, 1.61, 0.08], sp: [0.04, -0.10, 0.04], hd: [0.05, -0.42, 0.04], hip: [0.014, 0, 0] };
  const swayB = { hR: [-0.44, 1.60, 0.08], hL: [0.45, 1.52, 0.08], sp: [-0.04, -0.10, -0.04], hd: [-0.05, -0.42, -0.04], hip: [-0.014, 0, 0] };
  defAction('against_all_odds', 8.0, [
    { t: 0.5, hR: [-0.555, 1.13, 0.10], hL: [0.555, 1.15, 0.10], twR: 1.35, twL: 1.35, fR: FP.soft, fL: FP.soft, eR: [-0.5, -1, -0.3], eL: [0.5, -1, -0.3] },
    { t: 1.0, hR: [-0.47, 1.38, 0.10], hL: [0.50, 1.46, 0.10], hd: [0, -0.3, 0], sp: [0, -0.06, 0], eyes: 0.5, eR: [-1, -0.6, -0.3], eL: [1, -0.6, -0.3] },
    { t: 1.5, hR: [-0.44, 1.56, 0.08], hL: [0.40, 1.60, 0.08], hd: [0, -0.42, 0], eyes: 1, fR: FP.open, fL: FP.open, sp: [0, -0.10, 0], mouth: 1 },
    Object.assign({ t: 2.5 }, swayA), Object.assign({ t: 3.5 }, swayB), Object.assign({ t: 4.5 }, swayA), Object.assign({ t: 5.5 }, swayB),
    { t: 6.5, hR: [-0.42, 1.40, 0.10], hL: [0.46, 1.46, 0.10], hd: [0, -0.15, 0], eyes: 0.4, sp: [0, -0.03, 0], hip: [0, 0, 0], mouth: 0 },
    { t: 7.0, hR: [-0.555, 1.04, 0.10], hL: [0.555, 1.04, 0.10], hd: [0, 0, 0], eyes: 0, fR: FP.soft, fL: FP.soft, twR: 0.6, twL: 0.6, sp: [0, 0, 0], eR: [-0.5, -1, -0.3], eL: [0.5, -1, -0.3] },
    { t: 7.5, hR: [-0.44, 0.87, 0.06], hL: [0.45, 0.87, 0.06], twR: 0.2, twL: 0.2 }
  ], { hits: [1.5 / 8], cues: [0.5 / 8], outro: 0.5, fx(a, t, dt) {
    const T = a.t, hr = anchor('handR', _h1), hl = anchor('handL', _h2), k = win(T, 0.8, 6.9, 0.5);
    const ft = anchor('feet', _h4); floorSigil(ft, 1.05, 0.7 * k, T * 0.6, COL.gold); beam(ft, 2.0, 3.7, 0.3 * k * (0.85 + 0.15 * Math.sin(T * 3)), [1.0, 0.86, 0.6]);
    if (k > 0.1 && Math.random() < 22 * dt) { _c3.set(ft.x + rs() * 0.4, 2.2 + Math.random() * 0.6, ft.z + rs() * 0.4); motes(_c3, 1, 0.02, 2.4, 0.06, COL.gold, -0.45); }
    if (cue(a, 'ringA', 1.5)) { shock(ft, 0.2, 1.8, 1.0, COL.gold, true); shock(anchor('chest', _c1), 0.1, 1.2, 0.8, COL.pale); }
    if (k > 0.01) {
      const tw1 = 0.8 + 0.2 * Math.sin(T * 5.1), tw2 = 0.8 + 0.2 * Math.sin(T * 4.3 + 1);
      show(gHandR, above(_c1, hr, 0.15), 0.24 * tw1, k); show(gHandL, above(_c2, hl, 0.15), 0.24 * tw2, k);
      show(gCore, above(_c1, hr, 0.15), 0.09, k * tw1); show(sigil2, above(_c2, hl, 0.15), 0.001, 0);
      const c = anchor('feet', _c3); light(above(_c2, c, 1.9), 0.8 * k); show(gAux, above(_c2, c, 1.25), 2.3, 0.10 * k);
      const n = 34 * dt * k;                                                           // slow motes rising round her, gold among the violet
      for (let i = 0; i < n || (i === 0 && Math.random() < n); i++) { const an = Math.random() * TAU, r = 0.35 + Math.random() * 0.45; emit(c.x + r * Math.cos(an), c.y + 0.1 + Math.random() * 0.5, c.z + r * Math.sin(an), 0, 0.28 + Math.random() * 0.3, 0, 2.2 + Math.random(), 0.03 + Math.random() * 0.04, Math.random() < 0.35 ? COL.gold : Math.random() < 0.5 ? COL.pale : COL.violet, -0.02, 0.3); }
      if (Math.random() < 14 * dt * k) mist(above(_c1, Math.random() < 0.5 ? hr : hl, 0.15), 1, 0.06, 0.9, 0.04, COL.pale, 0.1);
    }
    if (cue(a, 'release', 1.5)) { burst(above(_c1, hr, 0.15), 40, 0.9, 1.2, 0.05, COL.pale, 0.1, 1.2, 0.5); burst(above(_c2, hl, 0.15), 40, 0.9, 1.2, 0.05, COL.gold, 0.1, 1.2, 0.5); anchor('chest', fxHitP); }
  } });

  // Gilded Rebuke (8 frames at 4 fps; the bells strike on frame 5)
  defAction('gilded_rebuke', 2.0, [
    { t: 0.25, hR: [0.045, 0.975, 0.215], eR: [-1, -0.5, -0.5], fR: FP.grip, twR: 0.2, hL: [0.17, 0.94, 0.18], hip: [-0.03, -0.035, 0], sp: [0.22, 0.09, 0], hd: [0.3, 0.06, 0], ftR: [-0.06, 0, 0, -0.2, 0], ftL: [0.06, 0, 0, 0.2, 0] },
    { t: 0.5, hR: [-0.50, 1.19, 0.02], eR: [-0.4, -1, -0.6], hL: [0.50, 1.06, 0.10], fL: FP.open, sp: [-0.36, 0, 0.05], hd: [0.42, 0, 0], hip: [-0.05, -0.05, 0], ftR: [-0.17, 0, 0, -0.3, 0], ftL: [0.17, 0, 0.02, 0.3, 0] },
    { t: 0.75, hR: [-0.15, 1.73, -0.05], eR: [-1, 0.3, -0.5], hL: [0.46, 0.92, 0.10], sp: [-0.2, -0.15, 0.06], hd: [0.45, -0.1, 0], hip: [-0.03, -0.02, -0.01] },
    { t: 1.0, hR: [0.47, 1.25, 0.16], eR: [0, -1, -0.2], twR: -0.3, hL: [0.20, 0.96, -0.06], fL: FP.fist, sp: [0.66, 0.11, 0], hipR: [0.24, 0, 0], hd: [0.32, 0, 0], hip: [0.07, -0.055, 0.02], mouth: 1 },
    { t: 1.25, hR: [0.42, 1.25, 0.16], sp: [0.58, 0.09, 0], hipR: [0.2, 0, 0] },
    { t: 1.5, hR: [-0.24, 1.01, 0.19], eR: [-1, -0.6, -0.4], twR: 0.2, hL: [0.30, 1.0, 0.15], fL: FP.soft, sp: [0.1, 0.03, 0], hipR: [0, 0, 0], hd: [0.15, 0, 0], hip: [0, -0.02, 0], ftR: 'rest', ftL: 'rest', mouth: 0 },
    { t: 1.76, hR: [0.03, 0.965, 0.215], hL: [0.24, 0.90, 0.10], sp: [0.1, 0.04, 0], hip: [0, 0, 0], hd: [0, 0, 0] }
  ], { hits: [1.0 / 2.0], cues: [0.25 / 2.0], outro: 0.2, fx(a, t, dt) {
    const T = a.t; if (T < 0.22 || T > 1.82) return;
    const hand = anchor('handR', _h1), len = lerp(0.14, 0.64, sm(0.25, 0.6, T)) * (1 - 0.78 * sm(1.52, 1.82, T));
    const strike = win(T, 0.9, 1.34, 0.05), whip = win(T, 0.58, 0.9, 0.08);
    let w = 0; const drive = _c1;
    if (strike > 0.01) { toward(drive, hand, len); drive.y += 0.01; w = 0.55 * strike; }
    else if (whip > 0.01) { toward(drive, hand, -0.55 * len); drive.y += len * 0.8; w = 0.2 * whip; }
    flail.visible = true; stepFlail(dt, hand, len, w > 0 ? drive : null, w); trailOn = win(T, 0.55, 1.45, 0.12);
    const head = flP[FL_N - 1], hit = win(T, 0.98, 1.4, 0.04);
    if (hit > 0.01) { show(gGold, head, 0.6 + 0.5 * hit, 0.9 * hit); show(ringGold, head, 0.2 + 0.7 * sm(0.98, 1.4, T), hit, T * 2); light(head, 1.3 * hit, 0xffc060); }
    else if (trailOn > 0.01) light(head, 0.35 * trailOn, 0xffc060);
    if (cue(a, 'hit', 1.0)) { fxHitP.copy(head); shock(head, 0.06, 0.9, 0.45, COL.gold); shock(head, 0.04, 0.5, 0.3, COL.white); burst(head, 70, 2.4, 0.8, 0.06, COL.gold, 2.0, 1.6); burst(head, 20, 1.0, 0.6, 0.09, COL.white, 0.5, 2); }
    if (T > 0.6 && T < 1.3 && Math.random() < 60 * dt) emit(head.x, head.y, head.z, rs() * 0.3, rs() * 0.3, rs() * 0.3, 0.45, 0.04, COL.gold, 0.8, 1.2);
    return 'flail';
  } });

  // Hush (29 frames at 6 fps; the ring goes on frame 17)
  defAction('hush', 29 / 6, [
    { t: 0.33, hR: [-0.03, 1.21, 0.175], eR: [-1, -1, -0.1], fR: FP.soft, twR: 0.4, hd: [0, 0.10, 0] },
    { t: 0.67, hR: [0.018, 1.306, 0.097], fR: FP.point, twR: 0.55, eR: [-1, -1, 0], wrR: [-0.48, -0.75], hd: [0, 0.03, 0], hL: [0.205, 0.925, 0.10], eL: [1, -0.1, -0.8], fL: FP.soft },
    { t: 1.0, eyes: 1, mouth: 2 }, { t: 1.36, eyes: 1, hR: [0.018, 1.306, 0.097] },
    { t: 1.67, hR: [-0.39, 1.34, 0.10], twR: 0.9, eyes: 0, hd: [-0.22, 0, 0.03], sp: [-0.1, 0, 0], eR: [-1, -0.8, -0.2], mouth: 0 },
    { t: 1.95, hR: [-0.39, 1.20, 0.12], hd: [-0.15, 0.03, 0], hL: [0.205, 0.925, 0.10], sp: [-0.1, 0, 0] },
    { t: 2.2, hR: [-0.30, 0.90, 0.06], fR: FP.relax, twR: 0.1, wrR: 'rest', hL: [0.49, 1.39, 0.16], eL: [0.3, -1, -0.4], fL: FP.open, twL: -0.4, wrL: [-0.5, 0], sp: [0.36, 0, 0], hipR: [0.12, 0, 0], hd: [0.42, 0, 0] },
    { t: 2.4, hL: [0.58, 1.44, 0.12] },
    { t: 2.67, hL: [0.42, 1.35, 0.14], wrL: [-0.95, 0] },
    { t: 3.33, hL: [0.36, 1.29, 0.14], sp: [0.28, 0, 0], hd: [0.4, 0, 0] },
    { t: 4.0, hR: [-0.11, 0.965, 0.17], eR: [-1, -0.5, -0.4], hL: [0.28, 0.85, 0.05], fL: FP.relax, wrL: [0.1, 0], twL: 0, sp: [0, 0, 0], hipR: [0, 0, 0], hd: [0, 0, 0], eL: 'rest' }
  ], { hits: [2.667 / (29 / 6)], cues: [0.67 / (29 / 6), 1.67 / (29 / 6)], outro: 0.45, fx(a, t, dt) {
    const T = a.t, tip = anchor('tipR', _h1), palm = anchor('handL', _h2);
    const pull = win(T, 0.55, 1.45, 0.2);                                            // sound drawn in to her fingertip
    if (pull > 0.05 && Math.random() < 40 * dt) { const d = _c3.set(rs(), rs(), rs()).normalize(); kindNext = 1; emit(tip.x + d.x * 0.3, tip.y + d.y * 0.3, tip.z + d.z * 0.3, -d.x * 0.6, -d.y * 0.6, -d.z * 0.6, 0.45, 0.04, COL.violet, 0, 0.2); kindNext = 0; }
    dim(0.35 * win(T, 0.6, 3.2, 0.5));
    const shh = win(T, 0.8, 1.62, 0.18);
    if (shh > 0.01) { show(gCore, tip, 0.09, shh); show(gHandR, tip, 0.24, 0.8 * shh); light(tip, 0.5 * shh); if (Math.random() < 12 * dt) mist(tip, 1, 0.02, 0.6, 0.025, COL.pale, 0.1); }
    const held = win(T, 1.5, 2.34, 0.14);                                            // the hush drawn out as a sigil over her right hand, then passed across
    if (held > 0.01) {
      const pass = sm(2.06, 2.32, T), p = above(_c1, tip, 0.14).lerp(toward(_c2, palm, 0.15), pass); p.y += 0.12 * Math.sin(pass * PI);
      show(sigil, p, 0.17 + 0.08 * sm(1.5, 2.0, T), held, T * 2); show(gMain, p, 0.4, 0.5 * held); light(p, 0.8 * held);
      if (Math.random() < 26 * dt) mist(p, 1, 0.06, 0.7, 0.03, COL.violet, 0.04);
    }
    const ring = win(T, 2.26, 3.3, 0.08);
    if (ring > 0.01) {
      const go = sm(2.667, 3.2, T), p = toward(_c1, palm, 0.15 + 2.3 * go * go), R = 0.13 + 0.10 * go;
      hushRing.visible = true; hushRing.position.copy(p); hushRing.quaternion.setFromUnitVectors(Z_AX, _tgt); hushRing.scale.setScalar(R); hushRing.material.opacity = ring * (1 - 0.6 * sm(2.95, 3.3, T));
      show(gAux, p, R * 4, 0.35 * ring); light(p, 0.9 * ring);
      if (Math.random() < 50 * dt) { const an = Math.random() * TAU; emit(p.x, p.y + R * Math.cos(an), p.z + R * Math.sin(an), -_tgt.x * 0.3, rs() * 0.1, rs() * 0.1, 0.6, 0.04, Math.random() < 0.5 ? COL.pale : COL.violet, 0, 1); }
      if (cue(a, 'release', 2.667)) { shock(p, 0.1, 0.6, 0.5, COL.violet); burst(p, 30, 0.8, 0.7, 0.04, COL.pale, 0, 1.6); toward(fxHitP, palm, 2.45); }
      if (cue(a, 'break', 3.12)) { shock(p, 0.15, 0.9, 0.6, COL.pale); shock(p, 0.7, 0.1, 0.5, COL.violet); }
      if (false) burst(p, 60, 1.1, 0.9, 0.05, COL.violet, 0.2, 1.4);
    }
  } });

  // Gravity (15 frames at 9 fps; the well is flung on frame 11)
  defAction('gravity', 15 / 9, [
    { t: 0.22, hL: [0.29, 1.12, 0.17], eL: [1, -0.8, -0.3], twL: 1.45, fL: FP.cup, wrL: [-0.25, 0], hd: [0.2, 0.09, 0], hR: [-0.28, 0.84, 0.04] },
    { t: 0.67, hL: [0.29, 1.20, 0.17], hd: [0.26, 0.06, 0], eyes: 0.4 },
    { t: 0.80, hL: [0.48, 1.31, 0.11], sp: [0.3, 0, 0], hd: [0.42, 0, 0], eyes: 0 },
    { t: 0.93, hL: [0.26, 1.04, -0.06], fL: FP.relax, twL: 0.3, wrL: [0, 0], hR: [0.30, 1.27, 0.20], eR: [-0.3, -1, -0.3], fR: FP.point, twR: -0.3, sp: [0.66, 0.06, 0], hipR: [0.22, 0, 0], hd: [0.32, 0, 0], hip: [0.04, -0.02, 0.02] },
    { t: 1.11, hR: [0.45, 1.29, 0.18] },
    { t: 1.3, hR: [0.38, 1.26, 0.18], sp: [0.56, 0.04, 0] }
  ], { hits: [1.111 / (15 / 9)], cues: [0.22 / (15 / 9)], outro: 0.34, fx(a, t, dt) {
    const T = a.t, palm = anchor('handL', _h1), tip = anchor('tipR', _h2);
    dim(0.4 * win(T, 0.2, 1.5, 0.25));
    const k = win(T, 0.14, 1.52, 0.08);
    if (k > 0.01) {
      const pass = sm(0.84, 0.98, T), go = sm(1.111, 1.5, T), p = above(_c1, palm, 0.15).lerp(toward(_c2, tip, 0.13), pass); toward(p, p, 2.7 * Math.pow(go, 0.8));
      const R = (0.03 + 0.06 * sm(0.14, 0.62, T)) * (1 + 0.5 * pass) * (1 - 0.9 * sm(1.4, 1.52, T));
      well.visible = true; well.position.copy(p); well.scale.setScalar(R); well.material.uniforms.uA.value = k;
      show(gAux, p, R * 6.5, 0.7 * k); light(p, 0.75 * k);
      const n = 90 * dt * k;                                                           // light falling into it
      for (let i = 0; i < n; i++) { const an = Math.random() * TAU, r = R * (2.5 + Math.random() * 2), cx = Math.cos(an), sy = Math.sin(an); emit(p.x + _tgt.x * 0 + r * cx * (1 - Math.abs(_tgt.x)) + rs() * 0.02, p.y + r * sy, p.z + r * cx * Math.abs(_tgt.x), (-cx * 1.2 - sy * 0.9) * r * 3 * (1 - Math.abs(_tgt.x)), (-sy * 1.2 + cx * 0.9) * r * 3, (-cx * 1.2 - sy * 0.9) * r * 3 * Math.abs(_tgt.x), 0.3, 0.03, Math.random() < 0.7 ? COL.violet : COL.pale, 0, 0.5); }
      if (go > 0 && go < 1) for (let i = 0; i < 4; i++) emit(p.x + rs() * 0.03, p.y + rs() * 0.03, p.z + rs() * 0.03, -_tgt.x * 0.6, rs() * 0.1, -_tgt.z * 0.6, 0.4, 0.05, COL.violet, 0, 1);
      if (cue(a, 'release', 1.111)) { shock(p, 0.05, 0.5, 0.35, COL.violet); burst(p, 46, 1.6, 0.5, 0.05, COL.violet, 0, 2); toward(fxHitP, p, 2.7); }
      if (cue(a, 'land', 1.46)) { shock(p, 1.0, 0.06, 0.4, COL.violet); shock(p, 0.1, 1.1, 0.7, COL.pale); burst(p, 80, 1.5, 0.7, 0.05, COL.violet, 0, 2.2); burst(p, 20, 0.6, 0.6, 0.08, COL.pale, 0, 2); }
    }
    const wind = win(T, 0.45, 0.95, 0.12);                                          // the pull stirs the air round her
    if (wind > 0.01) { const c = anchor('feet', _c3), n = 70 * dt * wind; for (let i = 0; i < n; i++) { const an = Math.random() * TAU, r = 0.42 + Math.random() * 0.15, y = 0.5 + Math.random() * 1.0; emit(c.x + r * Math.cos(an), c.y + y, c.z + r * Math.sin(an), -Math.sin(an) * 1.6, 0.25, Math.cos(an) * 1.6, 0.45, 0.035, COL.violet, 0, 0.4); } }
  } });
  // ---------- body moves: stances she holds (kneel, squat, sit), a jump, and talking with her hands ----------
  // Stances are keyed from standing (t = 0) to the held pose; standing up plays them backwards. Hands, feet and hips are in root space, in meters.

  // Kneel: a short step forward with the left foot, then down onto the right knee, left forearm across the raised knee
  defStance('kneel', 1.35, [
    { t: 0.22, hip: [-0.012, -0.02, 0.02], ftL: [0.01, 0.05, 0.12, 0.12, -0.15] },
    { t: 0.42, hip: [0, -0.06, 0.03], ftL: [0.02, 0, 0.26, 0.12, 0], ftR: [-0.01, 0.03, -0.06, -0.10, 0.45], sp: [0, 0.08, 0] },
    { t: 0.88, hip: [0, -0.30, -0.04], ftR: [-0.02, 0.045, -0.36, -0.08, 1.0], sp: [0, 0.16, 0], hd: [0, -0.06, 0], hL: [0.17, 0.70, 0.27], eL: [1, -0.4, -0.3], hR: [-0.29, 0.60, 0.04] },
    { t: 1.35, hip: [0, -0.375, -0.06], ftR: [-0.02, 0.04, -0.455, -0.08, 1.15], sp: [0, 0.05, 0], hd: [0, 0, 0], hL: [0.118, 0.590, 0.285], twL: 0.2, fL: FP.soft, wrL: [0.35, 0], hR: [-0.285, 0.50, 0.03], knR: [-0.10, 0, 1], knL: [0.10, 0, 1] }
  ]);

  // Squat: down on the balls of her feet, knees apart, forearms resting on her knees
  defStance('squat', 0.95, [
    { t: 0.40, hip: [0, -0.26, -0.07], sp: [0, 0.30, 0], hd: [0, -0.18, 0], ftR: [-0.02, 0.012, 0, -0.28, 0.2], ftL: [0.02, 0.012, 0, 0.28, 0.2], knR: [-0.45, 0, 1], knL: [0.45, 0, 1], hR: [-0.27, 0.68, 0.24], hL: [0.27, 0.68, 0.24] },
    { t: 0.95, hip: [0, -0.50, -0.10], sp: [0, 0.40, 0], hd: [0, -0.30, 0], ftR: [-0.04, 0.035, 0, -0.42, 0.5], ftL: [0.04, 0.035, 0, 0.42, 0.5], knR: [-0.55, 0, 1], knL: [0.55, 0, 1],
      hR: [-0.13, 0.43, 0.30], hL: [0.13, 0.43, 0.30], eR: [-1, -0.1, -0.2], eL: [1, -0.1, -0.2], wrR: [0.3, 0], wrL: [0.3, 0] }
  ]);

  // Sit on a stool: she folds forward, lowers herself back onto it, then sits up with her hands in her lap
  const STOOL_Z = -0.36, STOOL_TOP = 0.452;
  defStance('sit_chair', 1.55, [
    { t: 0.45, hip: [0, -0.10, -0.12], sp: [0, 0.34, 0], hd: [0, -0.16, 0], hR: [-0.27, 0.78, 0.12], hL: [0.27, 0.78, 0.12] },
    { t: 0.95, hip: [0, -0.29, -0.31], sp: [0, 0.36, 0], hd: [0, -0.20, 0], hR: [-0.17, 0.68, 0.10], hL: [0.17, 0.68, 0.10] },
    { t: 1.12, hip: [0, -0.315, -0.34], sp: [0, 0.22, 0] },
    { t: 1.55, sp: [0, -0.02, 0], hd: [0, 0, 0], hR: [-0.105, 0.615, -0.10], hL: [0.105, 0.615, -0.10], fR: FP.soft, fL: FP.soft, wrR: [0.2, 0], wrL: [0.2, 0], knR: [-0.03, 0, 1], knL: [0.03, 0, 1],
      ftR: [0.02, 0, 0.03, -0.04, 0], ftL: [-0.02, 0, 0.03, 0.04, 0] }
  ], { rise: 1.25 });

  // Sit on the ground, legs crossed: down through a squat, hands to the floor, then she settles and folds her legs
  defStance('sit_ground', 1.75, [
    { t: 0.45, hip: [0, -0.30, -0.08], sp: [0, 0.34, 0], hd: [0, -0.20, 0], knR: [-0.5, 0, 1], knL: [0.5, 0, 1], ftR: [-0.03, 0.02, 0, -0.35, 0.3], ftL: [0.03, 0.02, 0, 0.35, 0.3], hR: [-0.25, 0.60, 0.22], hL: [0.25, 0.60, 0.22] },
    { t: 0.85, hip: [0, -0.52, -0.14], sp: [0, 0.42, 0], hd: [0, -0.30, 0], knR: [-0.8, 0.1, 0.8], knL: [0.8, 0.1, 0.8], ftR: [-0.04, 0.035, 0.02, -0.5, 0.5], ftL: [0.04, 0.035, 0.02, 0.5, 0.5],
      hR: [-0.30, 0.20, -0.02], hL: [0.30, 0.20, -0.02], fR: FP.open, fL: FP.open },
    { t: 1.20, hip: [0, -0.725, -0.24], sp: [0, 0.30, 0], hd: [0, -0.20, 0], knR: [-1, 0.35, 0.3], knL: [1, 0.25, 0.3], ftR: [0.06, 0.02, 0.07, 0.2, 0.6, 0, 0.5], ftL: [-0.08, -0.03, 0.10, -0.2, 0.6, 0, 0.5],
      hR: [-0.32, 0.06, -0.20], hL: [0.32, 0.06, -0.20] },
    { t: 1.75, hip: [0, -0.725, -0.22], sp: [0, 0.08, 0], hd: [0, -0.04, 0], ftR: [0.15, 0.045, 0.10, 0, 0.8, 0, 1], ftL: [-0.17, -0.055, 0.12, 0, 0.8, 0, 1], knR: [-1, 0.4, 0.3], knL: [1, 0.2, 0.3],      // the right shin rests across the left; each foot follows its own shin
      hR: [-0.27, 0.27, 0.07], hL: [0.27, 0.27, 0.07], fR: FP.relax, fL: FP.relax, wrR: [0.3, 0], wrL: [0.3, 0], eR: [-1, -0.2, -0.4], eL: [1, -0.2, -0.4] }
  ], { rise: 1.1 });

  // Jump: a crouch, a leap with her arms thrown up, a soft landing. The flight follows a real arc.
  (function () {
    const T0 = 0.46, AIR = 0.62, H = 0.46, g = 8 * H / (AIR * AIR), v0 = g * AIR / 2, keys = [];
    keys.push({ t: 0.30, hip: [0, -0.21, -0.04], sp: [0, 0.36, 0], hd: [0, -0.22, 0], hR: [-0.30, 0.70, -0.20], hL: [0.30, 0.70, -0.20], eR: [-0.3, 0.2, -1], eL: [0.3, 0.2, -1], fR: FP.soft, fL: FP.soft, knR: [-0.2, 0, 1], knL: [0.2, 0, 1] });
    keys.push({ t: T0, hip: [0, 0.035, 0], sp: [0, -0.04, 0], hd: [0, -0.10, 0], hR: [-0.27, 1.32, 0.26], hL: [0.27, 1.32, 0.26], eR: [-0.6, -1, -0.3], eL: [0.6, -1, -0.3], ftR: [0, 0.075, 0, -0.10, 0.75], ftL: [0, 0.075, 0, 0.10, 0.75], mouth: 1 });
    for (let i = 1; i <= 6; i++) {
      const u = i / 7, ta = u * AIR, y = v0 * ta - 0.5 * g * ta * ta, tuck = Math.sin(PI * u), up = sm(0, 0.45, u), dn = sm(0.6, 1, u);
      const hx = lerp(0.27, 0.37, up) - 0.03 * dn, hy = lerp(1.32, 1.70, up) - 0.62 * dn + y, hz = lerp(0.26, 0.06, up) + 0.08 * dn;
      keys.push({ t: T0 + ta, hip: [0, 0.035 * (1 - u) - 0.03 * u + y, 0], sp: [0, -0.06 * tuck, 0], hd: [0, -0.10 - 0.16 * tuck, 0], hR: [-hx, hy, hz], hL: [hx, hy + 0.02, hz], fR: FP.open, fL: FP.open,
        ftR: [-0.015 * tuck, 0.075 * (1 - u) + y + 0.17 * tuck, -0.07 * tuck, -0.10, 0.80 - 0.45 * dn], ftL: [0.015 * tuck, 0.075 * (1 - u) + y + 0.13 * tuck, 0.03 * tuck, 0.10, 0.80 - 0.45 * dn] });
    }
    const TL = T0 + AIR;
    keys.push({ t: TL, hip: [0, -0.03, 0], sp: [0, 0.06, 0], hd: [0, -0.05, 0], hR: [-0.34, 1.02, 0.16], hL: [0.34, 1.02, 0.16], ftR: [0, 0, 0, -0.10, 0.12], ftL: [0, 0, 0, 0.10, 0.12], mouth: 2 });
    keys.push({ t: TL + 0.17, hip: [0, -0.20, -0.03], sp: [0, 0.30, 0], hd: [0, -0.18, 0], hR: [-0.32, 0.78, 0.18], hL: [0.32, 0.78, 0.18], fR: FP.soft, fL: FP.soft, ftR: 'rest', ftL: 'rest', eR: 'rest', eL: 'rest' });
    keys.push({ t: TL + 0.55, hip: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], hR: 'rest', hL: 'rest', knR: 'rest', knL: 'rest' });
    keys.push({ t: TL + 0.62, mouth: 0 });
    defAction('jump', TL + 0.78, keys, { stand: true, outro: 0.2, hits: [TL / (TL + 0.78)], cues: [0.30 / (TL + 0.78), T0 / (TL + 0.78)] });
  })();

  // Talk: ten seconds of chatter with her hands. Only her arms, head and face move, so it plays over any stance, or as she walks.
  (function () {
    const eD = (s) => [s * 0.6, -1, -0.3], keys = [
      { t: 0.40, hR: [-0.24, 1.08, 0.27], hL: [0.24, 1.08, 0.27], eR: eD(-1), eL: eD(1), twR: 1.25, twL: 1.25, fR: FP.soft, fL: FP.soft, wrR: [-0.1, 0], wrL: [-0.1, 0], hd: [0.05, 0.02, 0.06] },       // well, you see
      { t: 0.85, hR: [-0.26, 1.05, 0.28], hL: [0.26, 1.05, 0.28], hd: [0.02, 0.05, 0.03] },
      { t: 1.30, hR: [-0.19, 1.31, 0.25], fR: FP.point, twR: 0.45, wrR: [0.1, 0], hL: [0.25, 0.97, 0.13], twL: 0.3, fL: FP.relax, hd: [-0.06, -0.03, -0.04], sp: [-0.04, 0, 0] },                       // one thing
      { t: 1.55, hR: [-0.19, 1.28, 0.27] }, { t: 1.80, hR: [-0.19, 1.32, 0.25] },
      { t: 2.45, hR: [-0.50, 1.15, 0.17], fR: FP.open, twR: 1.35, wrR: [-0.2, 0], eR: [-0.5, -1, -0.4], hd: [-0.24, 0, 0.03], sp: [-0.10, 0, 0.02] },                                                // over there
      { t: 3.05, hR: [-0.47, 1.12, 0.18], hd: [-0.16, 0.03, 0.03] },
      { t: 3.55, hR: [-0.075, 1.20, 0.175], hL: [0.075, 1.165, 0.175], fR: FP.soft, fL: FP.soft, twR: 0.2, twL: 0.2, wrR: [0.35, 0], wrL: [0.35, 0], eR: eD(-1), sh: [0.08, 0.08], hd: [0.03, 0.06, -0.07], sp: [0, 0.03, 0] },   // me?
      { t: 4.10, hR: [-0.075, 1.19, 0.175], hL: [0.075, 1.16, 0.175], hd: [0.05, 0.03, -0.09] },
      { t: 4.55, hR: [-0.37, 1.10, 0.21], hL: [0.37, 1.10, 0.21], twR: 1.4, twL: 1.4, fR: FP.open, fL: FP.open, wrR: [-0.25, 0], wrL: [-0.25, 0], sh: [0.22, 0.22], hd: [0, 0.02, 0.13], sp: [0, 0, 0.03] },                       // who can say
      { t: 5.05, hR: [-0.36, 1.07, 0.21], hL: [0.36, 1.07, 0.21], sh: [0.05, 0.05], hd: [0, 0, 0.05] },
      { t: 5.55, hL: [0.30, 1.24, 0.25], twL: 0.5, fL: FP.soft, wrL: [-0.45, 0], hR: [-0.26, 0.98, 0.12], twR: 0.3, fR: FP.relax, wrR: [0.1, 0], sh: [0, 0], hd: [0.12, 0, 0], sp: [0.05, 0, 0] },                                   // never mind that
      { t: 5.80, wrL: [0.55, 0], hL: [0.33, 1.22, 0.27] }, { t: 6.05, wrL: [-0.4, 0], hL: [0.30, 1.24, 0.25] }, { t: 6.30, wrL: [0.5, 0], hL: [0.33, 1.21, 0.27] },
      { t: 6.85, hL: [0.085, 1.10, 0.27], twL: 1.35, fL: FP.open, wrL: [-0.15, 0], hR: [-0.015, 1.175, 0.275], fR: FP.point, twR: 0.2, wrR: [0.2, 0], hd: [0.04, 0.16, 0], sp: [0, 0.04, 0] },                                      // first, second, third
      { t: 7.05, hR: [-0.005, 1.145, 0.285] }, { t: 7.25, hR: [-0.03, 1.18, 0.275] }, { t: 7.45, hR: [0.02, 1.145, 0.29] }, { t: 7.65, hR: [-0.03, 1.18, 0.275] }, { t: 7.85, hR: [0.045, 1.145, 0.295] },
      { t: 8.45, hR: [-0.105, 1.395, 0.125], fR: FP.soft, twR: 0.9, wrR: [0.1, 0], eR: [-0.3, -1, 0.3], hL: [0.24, 0.98, 0.12], fL: FP.relax, twL: 0.2, wrL: [0.1, 0], sp: [0.06, 0.12, 0], hd: [0.16, 0.06, 0], eyes: 0.4 },    // a secret
      { t: 9.15, hR: [-0.105, 1.39, 0.13], sp: [0.06, 0.13, 0], eyes: 0.4 },
      { t: 9.75, hR: [-0.52, 1.21, 0.13], hL: [0.52, 1.21, 0.13], fR: FP.open, fL: FP.open, twR: 1.3, twL: 1.3, wrR: [-0.2, 0], wrL: [-0.2, 0], eR: [-0.5, -1, -0.4], eL: [0.5, -1, -0.4], sp: [0, -0.04, 0], hd: [0, -0.08, 0], eyes: 0 },   // and there you have it
      { t: 10.35, hR: [-0.50, 1.18, 0.14], hL: [0.50, 1.18, 0.14] }
    ];
    // her mouth: bursts of syllables, with a breath between phrases and a smile at the end of some
    const phrases = [[0.35, 1.15, 0], [1.3, 2.25, 0], [2.45, 3.3, 2], [3.55, 4.3, 0], [4.55, 5.3, 2], [5.55, 6.6, 0], [6.9, 8.0, 0], [8.5, 9.4, 2], [9.75, 10.3, 2]];
    let n = 0;
    for (const [a, b, endv] of phrases) {
      let t = a; keys.push({ t: t - 0.06, mouth: 0 });
      while (t < b - 0.12) { const d = 0.11 + 0.10 * h1(n * 3.7 + 1); keys.push({ t: t, mouth: 1 }); keys.push({ t: t + d * 0.55, mouth: 1 }); keys.push({ t: Math.min(b - 0.02, t + d), mouth: 0 }); t += d + 0.05 + 0.07 * h1(n * 5.3 + 2); n++; }
      keys.push({ t: b, mouth: endv }); keys.push({ t: b + 0.16, mouth: endv });
    }
    keys.push({ t: 10.9, mouth: 2 });
    defAction('talk', 11.4, keys, { outro: 0.7, cues: [1.3 / 11.4, 9.75 / 11.4] });
  })();

  // ---------- more moves for a performer: a wave, a deep bow, a twirl, a laugh, a jig, and two small things she does when left alone ----------
  defAction('wave', 2.7, [
    { t: 0.35, hR: [-0.36, 1.50, 0.12], eR: [-1, -0.5, -0.2], fR: FP.open, twR: -0.5, wrR: [-0.15, 0.35], hd: [-0.10, -0.04, -0.08], sp: [-0.05, 0, -0.03], mouth: 2 },
    { t: 0.62, hR: [-0.42, 1.52, 0.12], wrR: [-0.15, -0.4] }, { t: 0.89, hR: [-0.33, 1.52, 0.12], wrR: [-0.15, 0.4] }, { t: 1.16, hR: [-0.42, 1.52, 0.12], wrR: [-0.15, -0.4] },
    { t: 1.43, hR: [-0.33, 1.52, 0.12], wrR: [-0.15, 0.4] }, { t: 1.70, hR: [-0.42, 1.52, 0.12], wrR: [-0.15, -0.4] }, { t: 1.97, hR: [-0.36, 1.50, 0.12], wrR: [-0.15, 0.2], mouth: 2 },
    { t: 2.45, mouth: 0 }
  ], { outro: 0.6 });
  defAction('bow', 3.4, [
    { t: 0.45, hL: [0.52, 1.22, 0.10], eL: [0.4, -1, -0.5], fL: FP.open, twL: 1.2, hR: [-0.34, 1.16, 0.22], eR: [-0.6, -1, -0.3], fR: FP.open, twR: 1.2, ftR: [0.0, 0.03, -0.10, -0.2, 0.3], sp: [0, -0.05, 0], hd: [0, -0.08, 0], mouth: 2 },
    { t: 0.80, ftR: [0.02, 0.012, -0.26, -0.3, 0.4], hip: [0, -0.02, -0.02] },
    { t: 1.30, hip: [0, -0.07, -0.09], hipR: [0, 0.30, 0], sp: [0, 0.78, 0], hd: [0, 0.30, 0], hR: [0.07, 0.86, 0.33], eR: [-1, -0.2, 0.3], fR: FP.soft, twR: 0.2, wrR: [0.3, 0], hL: [0.60, 1.00, -0.16], eL: [0.6, 0.6, -1], twL: 0.6, knL: [0.14, 0, 1], eyes: 1, mouth: 0 },
    { t: 2.05, hip: [0, -0.07, -0.09], hipR: [0, 0.30, 0], sp: [0, 0.76, 0], hd: [0, 0.26, 0], hR: [0.07, 0.87, 0.33], hL: [0.60, 1.01, -0.16], eyes: 1 },
    { t: 2.65, hip: [0, 0, 0], hipR: [0, 0, 0], sp: [0, -0.04, 0], hd: [0, -0.06, 0], hR: [-0.40, 1.20, 0.16], eR: [-0.6, -1, -0.3], fR: FP.open, twR: 1.2, wrR: [-0.2, 0], hL: [0.40, 1.20, 0.16], eL: [0.6, -1, -0.3], twL: 1.2, ftR: [0, 0.02, -0.10, -0.15, 0.2], eyes: 0, mouth: 2 },
    { t: 3.05, ftR: 'rest', knL: 'rest', mouth: 2 }
  ], { outro: 0.4, stand: true });
  // Twirl: two full turns on the ball of her right foot, the left foot drawn up to her knee; her skirts and veils fly out on their own
  defAction('twirl', 2.7, [
    { t: 0.32, hip: [0.02, -0.05, 0], hR: [-0.50, 1.20, 0.10], hL: [0.50, 1.20, 0.10], eR: [-0.4, -1, -0.5], eL: [0.4, -1, -0.5], fR: FP.open, fL: FP.open, twR: 0.6, twL: 0.6, sp: [-0.14, 0.04, 0], hd: [0.15, 0, 0], knR: [-0.2, 0, 1], knL: [0.2, 0, 1] },
    { t: 0.52, hip: [-0.004, 0.035, 0], ftR: [0.077, 0.055, 0.012, 0.10, 0.62], ftL: [-0.085, 0.33, 0.07, 0.25, 0.95], knL: [1, 0, 0.7], knR: [0, 0, 1], hR: [-0.17, 1.24, 0.21], hL: [0.17, 1.22, 0.21], eR: [-1, -0.4, -0.2], eL: [1, -0.4, -0.2], fR: FP.soft, fL: FP.soft, sp: [0, -0.03, 0], hd: [0, -0.06, 0], mouth: 2 },
    { t: 1.62, hip: [-0.004, 0.035, 0], ftR: [0.077, 0.055, 0.012, 0.10, 0.62], ftL: [-0.085, 0.33, 0.07, 0.25, 0.95], hR: [-0.17, 1.24, 0.21], hL: [0.17, 1.22, 0.21] },
    { t: 1.95, hip: [0, -0.04, 0], ftR: 'rest', ftL: [0.03, 0, 0.05, 0.3, 0], knL: 'rest', knR: 'rest', hR: [-0.54, 1.30, 0.06], hL: [0.54, 1.30, 0.06], eR: [-0.4, -1, -0.5], eL: [0.4, -1, -0.5], fR: FP.open, fL: FP.open, twR: 1.2, twL: 1.2, sp: [0, -0.06, 0], hd: [0, -0.10, 0], mouth: 2 },
    { t: 2.35, hip: [0, 0, 0], hR: [-0.50, 1.24, 0.08], hL: [0.50, 1.24, 0.08], ftL: 'rest', mouth: 2 }
  ], { outro: 0.3, stand: true, spin: [[0, 0], [0.34, -0.5], [0.56, 0.6], [1.10, 6.9], [1.62, 12.0], [1.92, TAU * 2], [2.7, TAU * 2]] });
  (function () {
    const keys = [{ t: 0.25, hd: [0, -0.20, 0.05], sp: [0, -0.07, 0], hL: [0.09, 1.02, 0.17], eL: [1, -0.3, -0.2], fL: FP.soft, wrL: [0.3, 0], hR: [-0.20, 1.34, 0.20], eR: [-1, -0.6, -0.1], fR: FP.soft, twR: 0.7, eyes: 0.85, mouth: 1 }];
    for (let i = 0; i < 9; i++) { const t = 0.38 + i * 0.17, up = i % 2; keys.push({ t, sh: up ? [0.16, 0.16] : [0.02, 0.02], sp: [0, -0.07 + (up ? 0.035 : 0) + 0.012 * i, 0], hd: [0.03 * (up ? 1 : -1), -0.20 + 0.02 * i + (up ? 0.03 : 0), 0.05], mouth: up ? 1 : 2, eyes: 0.85 }); }
    keys.push({ t: 2.05, sh: [0, 0], sp: [0, 0.05, 0], hd: [0, 0.05, 0.03], hR: [-0.11, 1.40, 0.13], mouth: 2, eyes: 0.5 }, { t: 2.5, mouth: 2, eyes: 0 });
    defAction('laugh', 2.9, keys, { outro: 0.5 });
  })();
  // A jig: hop from foot to foot, the free foot kicking across, hands on her hips, then arms up to finish
  (function () {
    const keys = [], B = 0.34, N = 10, hipsR = [-0.20, 1.01, 0.05], hipsL = [0.20, 1.01, 0.05];
    keys.push({ t: 0.2, hR: hipsR, hL: hipsL, eR: [-1, -0.1, -0.5], eL: [1, -0.1, -0.5], fR: FP.loose || FP.soft, fL: FP.loose || FP.soft, wrR: [0.5, 0], wrL: [0.5, 0], hip: [0, -0.05, 0], mouth: 2 });
    for (let i = 0; i < N; i++) {
      const t = 0.36 + i * B, sd = i % 2 ? 1 : -1, hi = i % 4 >= 2 ? 1 : 0;           // sd: which foot kicks (−1 right)
      const kick = [sd * -0.07, 0.17 + 0.10 * hi, 0.20 + 0.06 * hi, sd * -0.2, 0.5], stand = [sd * -0.02, 0.0, -0.02, sd * -0.1, 0];
      keys.push({ t: t - B * 0.5, hip: [sd * -0.015, 0.045, 0], ftR: [0, 0.06, 0, -0.1, 0.55], ftL: [0, 0.06, 0, 0.1, 0.55] });            // in the air between steps
      keys.push({ t, hip: [sd * 0.03, -0.045, 0], hipR: [sd * -0.10, 0, sd * 0.05], sp: [sd * 0.14, 0.02, sd * -0.06], hd: [sd * -0.08, 0, sd * 0.07], ['ft' + (sd < 0 ? 'R' : 'L')]: kick, ['ft' + (sd < 0 ? 'L' : 'R')]: stand, ['kn' + (sd < 0 ? 'R' : 'L')]: [sd * -0.25, 0, 1] });
    }
    const te = 0.36 + N * B;
    keys.push({ t: te - B * 0.5, hip: [0, 0.05, 0], ftR: [0, 0.07, 0, -0.1, 0.55], ftL: [0, 0.07, 0, 0.1, 0.55] });
    keys.push({ t: te + 0.05, hip: [0, -0.06, 0], hipR: [0, 0, 0], sp: [0, -0.05, 0], hd: [0, -0.10, 0], ftR: [-0.05, 0, 0, -0.3, 0], ftL: [0.05, 0, 0, 0.3, 0], knR: 'rest', knL: 'rest', hR: [-0.46, 1.42, 0.08], hL: [0.46, 1.42, 0.08], eR: [-0.4, -1, -0.5], eL: [0.4, -1, -0.5], fR: FP.open, fL: FP.open, twR: 0.8, twL: 0.8, wrR: [0, 0], wrL: [0, 0], mouth: 2 });
    keys.push({ t: te + 0.55, hip: [0, 0, 0], hR: [-0.46, 1.40, 0.08], hL: [0.46, 1.40, 0.08], mouth: 2 });
    defAction('dance', te + 1.05, keys, { outro: 0.4, stand: true });
  })();
  defAction('look_around', 3.2, [
    { t: 0.5, hd: [0.45, -0.03, 0.03], sp: [0.10, 0, 0], eyes: 0.1 }, { t: 1.1, hd: [0.48, -0.05, 0.04], sp: [0.11, 0, 0] },
    { t: 1.8, hd: [-0.42, 0.02, -0.03], sp: [-0.10, 0, 0] }, { t: 2.4, hd: [-0.44, -0.02, -0.04], sp: [-0.10, 0, 0] }
  ], { outro: 0.7 });
  defAction('settle', 3.6, [
    { t: 0.8, hip: [0.035, -0.012, 0], hipR: [0, 0, -0.07], sp: [0, 0, 0.06], hd: [0.04, 0, -0.04], knL: [0.30, 0, 1], ftL: [0.02, 0.012, 0.03, 0.18, 0.18], hR: [-0.17, 1.03, 0.19], eR: [-1, -0.3, -0.3], fR: FP.soft, twR: 0.4 },
    { t: 1.5, hR: [-0.15, 1.05, 0.21], hL: [0.02, 1.06, 0.24], eL: [1, -0.5, -0.1], fL: FP.pinch || FP.soft, twL: 0.5, hd: [-0.06, 0.16, -0.03] },
    { t: 2.0, hL: [0.01, 1.03, 0.25] }, { t: 2.3, hL: [0.03, 1.07, 0.24] },
    { t: 2.9, hip: [0.035, -0.012, 0], hipR: [0, 0, -0.07], hd: [0.03, 0.02, -0.03] }
  ], { outro: 0.7 });

  // ---------- the stool she conjures to sit on ----------
  const stool = new THREE.Group(); stool.name = 'stool'; stool.visible = false; stool.position.set(0, 0, STOOL_Z); root.add(stool);
  (function () {
    const V2 = (x, y) => new THREE.Vector2(x, y), SEG = Q(48, 24);
    const wood = new THREE.MeshStandardMaterial({ color: lin(0x2e1c16), roughness: 0.46, envMapIntensity: 0.7 });
    const velvet = new THREE.MeshStandardMaterial({ map: fabricTex(256, '#6e1a3a', '#8e2a50', '#3c0c20', 3, false, 'wine'), roughness: 0.9 });
    const gold = new THREE.MeshStandardMaterial({ color: lin(0xd8a546), roughness: 0.3, metalness: 1, envMapIntensity: 1.6 });
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = m.receiveShadow = true; stool.add(m); return m; };
    add(new THREE.LatheGeometry([V2(0, 0.368), V2(0.150, 0.368), V2(0.176, 0.374), V2(0.186, 0.386), V2(0.186, 0.400), V2(0.176, 0.410), V2(0, 0.410)], SEG), wood);
    add(new THREE.LatheGeometry([V2(0.172, 0.408), V2(0.182, 0.416), V2(0.185, 0.428), V2(0.178, 0.440), V2(0.160, 0.448), V2(0.110, 0.452), V2(0, 0.4525)], SEG), velvet);
    add(new THREE.TorusGeometry(0.1815, 0.0048, 8, SEG), gold, 0, 0.411, 0).rotation.x = PI / 2;
    const leg = new THREE.LatheGeometry([V2(0, 0), V2(0.013, 0), V2(0.015, 0.02), V2(0.012, 0.05), V2(0.017, 0.12), V2(0.021, 0.16), V2(0.014, 0.19), V2(0.019, 0.25), V2(0.023, 0.30), V2(0.017, 0.345), V2(0.022, 0.375), V2(0, 0.375)], Q(14, 8));
    for (let k = 0; k < 3; k++) {
      const a = PI / 2 + k * TAU / 3, m = add(leg, wood, 0.172 * Math.cos(a), 0, 0.172 * Math.sin(a));
      m.rotation.set(-0.16 * Math.sin(a), 0, 0.16 * Math.cos(a));                 // splayed
      add(new THREE.SphereGeometry(0.0085, 10, 8), gold, 0.172 * Math.cos(a) + 0.0, 0.004, 0.172 * Math.sin(a));
    }
    add(new THREE.TorusGeometry(0.128, 0.0075, 8, SEG), wood, 0, 0.150, 0).rotation.x = PI / 2;
    add(new THREE.TorusGeometry(0.128, 0.0030, 6, SEG), gold, 0, 0.150, 0).rotation.x = PI / 2;
  })();
  let stoolWas = 0;
  function bodyTick(t, dt) {
    const on = !!stance && stance.name === 'sit_chair', k = on ? sm(0.02, 0.40, stance.t) : 0;
    stool.visible = k > 0.001;
    if (stool.visible) { const e = 1 - Math.pow(1 - k, 3), pop = 1 + 0.12 * Math.sin(PI * k) * (1 - k); stool.scale.set(e * pop, Math.max(0.02, e) * (2 - pop), e * pop); }
    SEAT.on = on && stance.t > 0.25;
    if (SEAT.on) { _va.set(0, 0, STOOL_Z).applyMatrix4(root.matrixWorld); SEAT.x = _va.x; SEAT.z = _va.z; SEAT.top = _va.y + STOOL_TOP + 0.006; SEAT.r = 0.196; }
    if (typeof burst === 'function' && ((k > 0.02 && stoolWas <= 0.02) || (k < 0.5 && stoolWas >= 0.5 && on && stanceTo !== 'sit_chair'))) {      // it arrives, and leaves, in a puff of violet
      _va.set(0, 0.30, STOOL_Z).applyMatrix4(root.matrixWorld); burst(_va, 46, 0.9, 0.9, 0.05, COL.violet, -0.2, 1.6, 0.3); burst(_va, 20, 0.5, 0.8, 0.06, COL.pale, 0, 1.4, 0.3); shock(_va, 0.05, 0.42, 0.45, COL.violet, true);
    }
    stoolWas = k;
  }
  // ---------- four more of her spells, from the move sheet (assets/design/moves_v03.json): Ill Omen, Stop, Royal Reversal, The Last Toll ----------
  FP.two = [0.62, 0.02, 0.05, 0.90, 0.93, 0.15]; FP.pinch = [0.52, 0.40, 0.44, 0.20, 0.12, 0.6]; FP.loose = FP.relax.map((v, i) => lerp(v, FP.fist[i], 0.55));
  COL.silver = [0.84, 0.88, 1.0]; COL.dusk = [0.36, 0.12, 0.70];
  const spriteN = (tex, order) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true, opacity: 0 })); s.visible = false; s.renderOrder = order || 27; fx.add(s); fxAuto.push(s); return s; };
  const showN = (s, p, size, op, rot) => { if (op <= 0.003) { s.visible = false; return; } s.visible = true; s.position.copy(p); s.scale.set(size, size, 1); s.material.opacity = Math.min(1, op); if (rot != null) s.material.rotation = rot; };
  const spriteA = (tex, col, order) => { const s = sprite(tex, col, order); fxAuto.push(s); return s; };
  // a crooked star: black at heart, violet at the rim
  const omenPath = (g, m, k) => { const R = [1.0, 0.34, 0.62, 0.26, 0.96, 0.42, 0.52, 0.30, 0.80, 0.30], A = [0.03, 0.12, 0.19, 0.30, 0.44, 0.50, 0.63, 0.72, 0.78, 0.92]; g.beginPath(); for (let i = 0; i < 10; i++) { const a = A[i] * TAU - PI / 2, r = R[i] * m * k; if (i) g.lineTo(r * Math.cos(a), r * Math.sin(a)); else g.moveTo(r * Math.cos(a), r * Math.sin(a)); } g.closePath(); };
  const omenTex = (function () {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'), m = S / 2; g.translate(m, m);
    g.shadowColor = 'rgba(150,70,255,0.9)'; g.shadowBlur = 22; omenPath(g, m, 0.80); g.fillStyle = 'rgba(40,10,80,1)'; g.fill(); g.fill();
    g.shadowBlur = 0; const gr = g.createRadialGradient(0, 0, 0, 0, 0, m * 0.8); gr.addColorStop(0, 'rgba(4,0,10,1)'); gr.addColorStop(0.55, 'rgba(14,2,34,1)'); gr.addColorStop(1, 'rgba(70,22,130,1)'); omenPath(g, m, 0.80); g.fillStyle = gr; g.fill();
    g.lineJoin = 'round'; g.lineWidth = 3.2; g.strokeStyle = 'rgba(206,150,255,0.95)'; g.stroke();
    return ctex(c, 0, 0, true);
  })();
  const omenGlowTex = (function () { const S = 256, c = cvs(S, S), g = c.getContext('2d'), m = S / 2; g.translate(m, m); g.shadowColor = '#fff'; g.shadowBlur = 18; g.lineJoin = 'round'; g.lineWidth = 5; g.strokeStyle = '#fff'; omenPath(g, m, 0.80); g.stroke(); return ctex(c, 0, 0, false); })();
  // a clock without numerals: a ring, a finer ring, twelve spokes
  const clockTex = (function () {
    const S = 512, c = cvs(S, S), g = c.getContext('2d'), m = S / 2; g.translate(m, m); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineCap = 'round'; g.shadowColor = '#fff'; g.shadowBlur = 12;
    g.lineWidth = 8; g.beginPath(); g.arc(0, 0, m * 0.88, 0, TAU); g.stroke();
    g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, m * 0.78, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, m * 0.20, 0, TAU); g.stroke();
    for (let k = 0; k < 12; k++) { g.lineWidth = k % 3 === 0 ? 4.5 : 2; g.beginPath(); g.moveTo(0, -m * (k % 3 === 0 ? 0.22 : 0.44)); g.lineTo(0, -m * 0.76); g.stroke(); g.rotate(TAU / 12); }
    for (let k = 0; k < 60; k++) { g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -m * 0.80); g.lineTo(0, -m * 0.86); g.stroke(); g.rotate(TAU / 60); }
    g.beginPath(); g.arc(0, 0, m * 0.045, 0, TAU); g.fill();
    return ctex(c, 0, 0, false);
  })();
  // a dark halo: night inside, a violet rim
  const haloTex = (function () {
    const S = 256, c = cvs(S, S), g = c.getContext('2d'), m = S / 2, gr = g.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, 'rgba(6,0,14,0.94)'); gr.addColorStop(0.58, 'rgba(10,2,26,0.90)'); gr.addColorStop(0.74, 'rgba(60,20,120,0.92)'); gr.addColorStop(0.80, 'rgba(170,96,255,0.95)'); gr.addColorStop(0.87, 'rgba(90,34,190,0.40)'); gr.addColorStop(1, 'rgba(60,20,140,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S); return ctex(c, 0, 0, true);
  })();
  const omenDark = spriteN(omenTex, 28), omenGlow = spriteA(omenGlowTex, [0.72, 0.36, 1.0], 29), clock = spriteA(clockTex, [0.74, 0.40, 1.0], 29), clock2 = spriteA(clockTex, [0.95, 0.80, 1.0], 29), halo = spriteN(haloTex, 26);
  const gX1 = spriteA(glowTex, COL.violet), gX2 = spriteA(glowTex, COL.pale), gX3 = spriteA(glowTex, COL.dusk);
  const ease = (u) => u * u * (3 - 2 * u);
  const _rx = V3(1, 0, 0), _fwd = V3(0, 0, 1);

  // Ill Omen (cast 1 s, recovery 1 s; one enemy): two fingers to her pendant, a black-violet spark that curls into a crooked star, flicked at the target
  const OMEN_TOUCH = [-0.061, 1.178, 0.153];
  defAction('ill_omen', 2.0, [
    { t: 0.10, hd: [0.06, -0.03, 0.05], eyes: 0.2 },
    { t: 0.27, hR: OMEN_TOUCH, eR: [-1, -1, 0], fR: FP.two, twR: 0.3, wrR: [0.3, -0.8], hd: [0.04, 0.07, 0.04], eyes: 0.2 },
    { t: 0.42, hR: OMEN_TOUCH },
    { t: 0.62, hR: [-0.19, 1.27, 0.25], twR: 1.0, wrR: [-0.25, 0], eR: [-0.6, -1, -0.2], hd: [-0.08, 0.02, 0.04], eyes: 0.45 },
    { t: 0.82, hR: [-0.23, 1.31, 0.21], sp: [-0.10, 0, 0], hd: [0.22, 0, 0.03], eyes: 0.3 },
    { t: 0.93, hR: [-0.27, 1.36, 0.14], sp: [-0.18, -0.02, 0], wrR: [0.3, 0] },
    { t: 1.03, hR: [0.37, 1.31, 0.21], eR: [0, -1, -0.2], twR: -0.2, wrR: [-0.55, 0], fR: FP.open, sp: [0.50, 0.05, 0], hipR: [0.16, 0, 0], hd: [0.34, 0, 0], eyes: 0, mouth: 2 },
    { t: 1.28, hR: [0.34, 1.28, 0.21] },
    { t: 1.58, hR: [0.12, 1.10, 0.20], fR: FP.loose, twR: 0.3, wrR: [0.1, 0], sp: [0.14, 0, 0], hipR: [0, 0, 0], hd: [0.14, 0, 0] },
    { t: 1.82, mouth: 0 }
  ], { hits: [1.0 / 2.0], cues: [0.27 / 2.0], outro: 0.3, fx(a, t, dt) {
    const T = a.t, tip = anchor('tipR', _h1), pen = anchor('pendant', _h2);
    dim(0.3 * win(T, 0.3, 1.5, 0.3));
    const glint = win(T, 0.24, 0.52, 0.08);                                          // the pendant answers her touch
    if (glint > 0.01) { show(gX2, pen, 0.10 + 0.05 * glint, glint); show(gX1, pen, 0.30, 0.6 * glint); light(pen, 0.5 * glint, 0x60e0d0); }
    if (cue(a, 'touch', 0.27)) { shock(pen, 0.02, 0.16, 0.35, COL.pale); burst(pen, 14, 0.4, 0.5, 0.03, COL.violet, 0, 2); }
    const held = win(T, 0.36, 1.02, 0.06);
    if (held > 0.01) {                                                                // the spark, then the star, riding above her fingertips
      const k = sm(0.44, 0.66, T), p = above(_c1, tip, 0.02 + 0.07 * k), size = lerp(0.03, 0.135, ease(k)) * (1 + 0.05 * Math.sin(T * 11)), rot = 4.2 * Math.pow(1 - k, 2) + 0.12 * Math.sin(T * 3.1);
      showN(omenDark, p, size, held * sm(0.40, 0.52, T), rot); show(omenGlow, p, size * 1.12, 0.9 * held * k, rot); show(gX3, p, size * 3.2, 0.8 * held); show(gX2, p, 0.05 * (1 - k) + 0.012, held * (1 - 0.7 * k)); light(p, 0.6 * held);
      if (Math.random() < 30 * dt) { const an = Math.random() * TAU, r = size * 0.9; kindNext = 1; emit(p.x + r * Math.cos(an), p.y + r * Math.sin(an), p.z, -Math.sin(an) * 0.3 - Math.cos(an) * 0.25, Math.cos(an) * 0.3 - Math.sin(an) * 0.25, 0, 0.5, 0.03, Math.random() < 0.6 ? COL.dusk : COL.violet, 0, 0.6); kindNext = 0; }
      a.from = (a.from || V3()).copy(p);
    }
    if (cue(a, 'release', 1.0)) { toward(fxHitP, anchor('chest', _c2), 2.6); fxHitP.y += 0.12; shock(a.from || tip, 0.03, 0.3, 0.3, COL.violet); }
    const fly = win(T, 1.0, 1.9, 0.04);
    if (fly > 0.01 && a.from) {                                                       // it crosses to the target and hangs over them
      const u = sm(1.0, 1.3, T), p = _c1.copy(a.from).lerp(fxHitP, u); p.y += 0.16 * Math.sin(u * PI);
      const hang = 1 - sm(1.55, 1.9, T), size = 0.135 + 0.16 * sm(1.28, 1.42, T);
      showN(omenDark, p, size, fly * hang, -T * 3.5 * (1 - u) + 0.3 * Math.sin(T * 2)); show(omenGlow, p, size * 1.12, 0.9 * fly * hang, omenDark.material.rotation); show(gX3, p, size * 3.4, 0.8 * fly * hang); light(p, 0.7 * fly * hang);
      if (u < 1) for (let i = 0; i < 3; i++) emit(p.x + rs() * 0.03, p.y + rs() * 0.03, p.z + rs() * 0.03, rs() * 0.1, rs() * 0.1, rs() * 0.1, 0.45, 0.04, Math.random() < 0.5 ? COL.dusk : COL.violet, 0, 1);
      else if (Math.random() < 18 * dt) motes(p, 1, 0.12, 0.8, 0.045, COL.dusk, -0.25);
      if (cue(a, 'land', 1.3)) { shock(p, 0.7, 0.10, 0.4, COL.violet); shock(p, 0.08, 0.55, 0.5, COL.dusk); burst(p, 46, 1.0, 0.7, 0.045, COL.violet, 0.4, 1.8); }
    }
  } });

  // Stop (cast 3 s, recovery 1 s): her palm comes up, a clock-ring turns before it, slows, stills, then locks round the target and breaks into hanging points
  defAction('stop', 4.0, [
    { t: 0.22, hL: [0.33, 1.14, 0.22], eL: [1, -0.8, -0.3], fL: FP.soft, twL: 0.6, hd: [0.2, 0.05, 0], sp: [0.12, 0, 0] },
    { t: 0.50, hL: [0.50, 1.38, 0.15], eL: [0.3, -1, -0.4], fL: FP.open, twL: -0.4, wrL: [-0.95, 0], sp: [0.36, 0, 0], hipR: [0.12, 0, 0], hd: [0.42, 0, 0], hR: [-0.27, 0.90, 0.02] },
    { t: 2.50, hL: [0.50, 1.38, 0.15] },
    { t: 2.62, hL: [0.44, 1.37, 0.16], sp: [0.32, 0, 0] },
    { t: 2.80, hL: [0.60, 1.40, 0.13], sp: [0.44, 0.02, 0] },
    { t: 3.00, hL: [0.55, 1.39, 0.14], fL: FP.grip, wrL: [-0.5, 0] },
    { t: 3.50, hL: [0.48, 1.33, 0.15] },
    { t: 3.78, hL: [0.31, 0.95, 0.10], fL: FP.relax, wrL: [0.1, 0], twL: 0, sp: [0, 0, 0], hipR: [0, 0, 0], hd: [0, 0, 0], eL: 'rest', hR: 'rest' }
  ], { hits: [3.0 / 4.0], cues: [0.5 / 4.0, 2.0 / 4.0], outro: 0.22, start(a) { a.rot = 0; }, fx(a, t, dt) {
    const T = a.t, palm = anchor('handL', _h1);
    dim(0.45 * win(T, 0.5, 3.3, 0.4));
    const w = 5.2 * (1 - sm(1.3, 2.05, T)); a.rot -= w * dt;                           // it turns, slower and slower, and is still by two seconds
    const k = sm(0.45, 0.55, T) * (1 - sm(3.05, 3.10, T));
    if (k > 0.01) {
      const go = ease(sm(2.5, 2.98, T)), near = toward(_c1, palm, 0.17); if (T < 2.5 || !a.near) a.near = (a.near || V3()).copy(near);
      if (go > 0 && !a.fired.aim) { a.fired.aim = true; toward(fxHitP, anchor('chest', _c2), 2.6); }
      const p = go > 0 ? _c1.copy(a.near).lerp(fxHitP, go) : near, grow = sm(0.45, 0.85, T), size = lerp(0.34 * grow, 1.0, go) * (1 - 0.10 * sm(2.98, 3.06, T));
      const still = sm(2.0, 2.1, T) * (1 - sm(2.5, 2.6, T));
      show(clock, p, size, k, a.rot); show(clock2, p, size * 0.46, 0.7 * k * (1 - still * 0.5), -a.rot * 0.5); show(gX1, p, size * 1.6, 0.45 * k); light(p, 0.8 * k);
      if (w > 0.4 && Math.random() < 6 * w * dt) { const an = Math.random() * TAU, r = size * 0.44; emit(p.x + r * Math.cos(an), p.y + r * Math.sin(an), p.z, Math.sin(an) * 0.08 * w, -Math.cos(an) * 0.08 * w, 0, 0.5, 0.03, Math.random() < 0.5 ? COL.pale : COL.violet, 0, 0.8); }
      a.at = (a.at || V3()).copy(p); a.size = size;
    }
    if (cue(a, 'still', 2.05)) shock(a.at || palm, 0.30, 0.05, 0.35, COL.pale);
    if (cue(a, 'lock', 3.0)) { const p = fxHitP; shock(p, 0.95, 0.42, 0.22, COL.pale); shock(p, 0.2, 0.9, 0.5, COL.violet); }
    if (cue(a, 'break', 3.08)) {                                                       // the ring comes apart into points that hang where they were
      const p = fxHitP, R = 0.44; _rx.set(1, 0, 0).applyQuaternion(_rq);
      for (let i = 0; i < 72; i++) { const an = i / 72 * TAU; emit(p.x + R * Math.cos(an) * _rx.x, p.y + R * Math.sin(an), p.z + R * Math.cos(an) * _rx.z, 0, 0, 0, 0.75 + 0.35 * Math.random(), 0.045 + 0.02 * Math.random(), i % 3 ? COL.violet : COL.pale, 0, 0); }
      for (let k2 = 0; k2 < 12; k2++) for (let j = 0; j < 4; j++) { const an = k2 / 12 * TAU, r = R * (0.30 + 0.17 * j); emit(p.x + r * Math.cos(an) * _rx.x, p.y + r * Math.sin(an), p.z + r * Math.cos(an) * _rx.z, 0, 0, 0, 0.55 + 0.4 * Math.random(), 0.035, COL.pale, 0, 0); }
    }
    const hang = win(T, 3.0, 3.8, 0.2); if (hang > 0.01) { show(gX1, fxHitP, 1.3, 0.35 * hang); light(fxHitP, 0.5 * hang); }
  } });

  // Royal Reversal (cast 2 s, recovery 1 s; one ally): she lifts an edge of her veil, bows, and a small mirror forms, turns its dark face out, lights, and goes to stand by her ally
  const mirror = new THREE.Group(), mirrorSpin = new THREE.Group(); mirror.add(mirrorSpin); mirror.visible = false; fx.add(mirror); fxAuto.push(mirror);
  const crescM = new THREE.MeshStandardMaterial({ color: lin(0x5a4a70), roughness: 0.35, metalness: 0.7, emissive: lin(0xd9b8ff), emissiveIntensity: 0 });
  (function () {
    const RX = 0.074, RY = 0.094, disc = new THREE.CircleGeometry(1, Q(48, 24));
    const silver = new THREE.MeshStandardMaterial({ color: lin(0xdcd4f4), roughness: 0.10, metalness: 1, envMapIntensity: 2.2, emissive: lin(0x7a5ac8), emissiveIntensity: 0.30 });
    const dark = new THREE.MeshStandardMaterial({ color: lin(0x0a0612), roughness: 0.22, metalness: 0.7, envMapIntensity: 0.7, emissive: lin(0x2a0a50), emissiveIntensity: 0.25 });
    const frameM = new THREE.MeshStandardMaterial({ color: lin(0xcac6dc), roughness: 0.26, metalness: 1, envMapIntensity: 1.7 });
    const f = new THREE.Mesh(disc, silver); f.scale.set(RX, RY, 1); f.position.z = 0.003; const b = new THREE.Mesh(disc, dark); b.scale.set(RX, RY, 1); b.rotation.y = PI; b.position.z = -0.003;
    const fr = new THREE.Mesh(new THREE.TorusGeometry(1, 0.085, 10, Q(56, 28)), frameM); fr.scale.set(RX, RY, 0.09);
    const R = 0.034, r = 0.0300, d = 0.0165, y0 = (r * r - R * R - d * d) / (2 * d), x0 = Math.sqrt(R * R - y0 * y0), a0 = Math.atan2(y0, x0), b0 = Math.atan2(y0 + d, x0), pts = [];
    for (let i = 0; i <= 24; i++) { const an = a0 + (PI - 2 * a0) * i / 24; pts.push(new THREE.Vector2(R * Math.cos(an), R * Math.sin(an))); }
    for (let i = 1; i < 24; i++) { const an = PI - b0 - (PI - 2 * b0) * i / 24; pts.push(new THREE.Vector2(r * Math.cos(an), r * Math.sin(an) - d)); }
    const cr = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.005, bevelEnabled: false }), crescM); cr.position.set(0, RY + 0.016, -0.0025);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.05, 8), frameM); stem.position.y = -RY - 0.022; const knob = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), frameM); knob.position.y = -RY - 0.05;
    for (const m of [f, b, fr, cr, stem, knob]) { m.castShadow = true; mirrorSpin.add(m); }
  })();
  defAction('royal_reversal', 3.0, [
    { t: 0.22, hL: [0.215, 1.02, 0.21], eL: [1, -0.6, -0.4], fL: FP.soft, twL: 0.3, hd: [0.12, 0.10, 0] },
    { t: 0.36, hL: [0.22, 1.00, 0.20], fL: FP.pinch },
    { t: 0.72, hL: [0.41, 1.13, 0.14], eL: [0.6, -1, -0.3], sp: [0, 0.24, 0], hd: [0, 0.16, 0], hip: [0, -0.03, -0.03], ftR: [-0.03, 0.012, -0.16, -0.25, 0.35], hR: [-0.24, 1.02, 0.26], eR: [-0.6, -1, -0.3], twR: 1.35, fR: FP.cup, wrR: [-0.2, 0], eyes: 0.7 },
    { t: 1.10, hR: [-0.25, 1.06, 0.27], sp: [0, 0.22, 0], hd: [-0.12, 0.10, 0], eyes: 0.2 },
    { t: 1.50, hR: [-0.26, 1.08, 0.27] },
    { t: 1.90, hR: [-0.30, 1.14, 0.24], hd: [-0.24, 0.04, 0], hL: [0.41, 1.13, 0.14] },
    { t: 2.12, hR: [-0.47, 1.23, 0.16], fR: FP.open, sp: [-0.10, 0.14, 0] },
    { t: 2.55, hL: [0.30, 0.95, 0.10], fL: FP.soft, eL: 'rest', twL: 0, hR: [-0.34, 0.98, 0.10], twR: 0.4, fR: FP.soft, wrR: 'rest', eR: 'rest', sp: [0, 0, 0], hd: [-0.06, 0, 0.03], hip: [0, 0, 0], ftR: 'rest', mouth: 2, eyes: 0 },
    { t: 2.85, mouth: 2 }
  ], { hits: [2.0 / 3.0], cues: [0.36 / 3.0, 1.125 / 3.0], outro: 0.3, grabs: true, fx(a, t, dt) {
    const T = a.t, palm = anchor('handR', _h1), tip = anchor('tipL', _h2);
    if (cue(a, 'take', 0.36)) a.held = grabCloth(tip, 0.16, 0.07, 9);                 // two fingers take the veil's edge
    if (grabbed) { if (T > 2.2) releaseGrab(); else { grabbed.grabP.copy(tip); grabbed.grabP.y -= 0.012; } }
    dim(0.3 * win(T, 0.7, 2.4, 0.3));
    const k = win(T, 0.72, 2.92, 0.12);
    if (k > 0.01) {
      const form = ease(sm(0.75, 1.12, T)), go = ease(sm(1.9, 2.4, T)), hov = above(_c1, palm, 0.20 + 0.012 * Math.sin(T * 3)); if (T < 1.9 || !a.hov) a.hov = (a.hov || V3()).copy(hov);
      if (!a.fired.aim) { a.fired.aim = true; toward(fxHitP, anchor('chest', _c2), -1.45); fxHitP.y += 0.10; fxHitP.addScaledVector(_fwd.set(0, 0, 1).applyQuaternion(_rq), 0.25); }
      const p = go > 0 ? _c1.copy(a.hov).lerp(fxHitP, go) : hov; if (go > 0) p.y += 0.14 * Math.sin(go * PI);
      const turn = ease(sm(1.125, 1.5, T)) * PI, lit = sm(1.5, 1.72, T), out = 1 - sm(2.7, 2.92, T), sc = form * (1 + 0.9 * go) * out * (1 + 0.16 * Math.sin(PI * sm(0.75, 1.12, T)) * (1 - form));
      mirror.visible = sc > 0.01; mirror.position.copy(p); mirror.quaternion.copy(_rq); mirror.scale.setScalar(Math.max(0.001, sc)); mirrorSpin.rotation.set(0.10 * Math.sin(T * 2.1), turn + 0.12 * Math.sin(T * 1.7), 0);
      crescM.emissiveIntensity = 2.6 * lit * (0.85 + 0.15 * Math.sin(T * 9));
      show(gX1, p, 0.34 * sc, 0.6 * k * form); light(p, 0.5 * k + 0.5 * lit * out, 0xc8b0ff);
      if (lit > 0.01) { _c3.copy(p); _c3.y += 0.118 * sc; show(gX2, _c3, 0.15 * sc * (0.9 + 0.1 * Math.sin(T * 9)), 0.42 * lit * out); }
      if (form < 1 && Math.random() < 60 * dt) { const an = Math.random() * TAU, r = 0.16; emit(p.x + r * Math.cos(an), p.y + r * Math.sin(an), p.z + rs() * 0.03, -Math.cos(an) * 0.45, -Math.sin(an) * 0.45, 0, 0.32, 0.03, Math.random() < 0.5 ? COL.silver : COL.violet, 0, 0.4); }
      if (cue(a, 'formed', 1.12)) shock(p, 0.03, 0.19, 0.35, COL.silver);
      if (cue(a, 'lit', 1.5)) { shock(p, 0.04, 0.25, 0.45, COL.pale); burst(_c3.copy(p).setY(p.y + 0.118), 24, 0.5, 0.7, 0.03, COL.silver, 0.3, 1.6, 0.4); }
      if (go > 0 && go < 1 && Math.random() < 40 * dt) emit(p.x + rs() * 0.05, p.y + rs() * 0.07, p.z + rs() * 0.03, rs() * 0.05, -0.05, rs() * 0.05, 0.7, 0.035, Math.random() < 0.6 ? COL.silver : COL.violet, 0.2, 0.8);
      if (cue(a, 'placed', 2.4)) { shock(p, 0.1, 0.7, 0.6, COL.silver); shock(p, 0.6, 0.15, 0.45, COL.violet); burst(p, 30, 0.6, 0.9, 0.035, COL.silver, 0.2, 1.5); }
      if (T > 2.4 && Math.random() < 14 * dt * out) motes(p, 1, 0.16, 0.9, 0.04, COL.silver, 0.08);
    }
  } });

  // The Last Toll (cast 4 s, recovery 1 s): one hip bell lifted on its chain, violet circles gathering, the bell still in a dark halo, then one swing and a heavy pulse
  defAction('last_toll', 5.0, [
    { t: 0.40, hR: [0.045, 0.975, 0.215], eR: [-1, -0.5, -0.5], fR: FP.open, twR: 0.2, hip: [-0.02, -0.03, 0], sp: [0.20, 0.09, 0], hd: [0.26, 0.10, 0] },
    { t: 0.58, fR: FP.grip },
    { t: 1.20, hR: [-0.11, 1.45, 0.30], eR: [-1, -0.6, -0.2], twR: 0.3, sp: [0, 0, 0], hip: [0, 0, 0], hd: [0, -0.03, 0] },
    { t: 1.85, hR: [-0.11, 1.45, 0.30], hd: [0, 0, 0], eyes: 0.5 },
    { t: 2.45, hR: [-0.25, 1.52, 0.13], eR: [-1, -0.3, -0.5], sp: [-0.18, -0.03, 0], hd: [0.10, 0, -0.05], eyes: 1 },
    { t: 3.25, hR: [-0.25, 1.52, 0.13], eyes: 1 },
    { t: 3.60, hR: [-0.31, 1.61, 0.04], sp: [-0.26, -0.05, 0], eyes: 0 },
    { t: 3.86, hR: [0.06, 1.36, 0.36], eR: [-0.6, -1, -0.2], sp: [0.24, 0.10, 0], hd: [0.10, 0.08, 0], mouth: 1 },
    { t: 4.25, hR: [0.04, 1.34, 0.34], mouth: 0 },
    { t: 4.62, hR: [0.03, 1.00, 0.215], sp: [0.12, 0.05, 0], hd: [0.2, 0.08, 0] },
    { t: 4.86, fR: FP.soft }
  ], { hits: [3.9 / 5.0], cues: [0.58 / 5.0, 2.45 / 5.0], outro: 0.14, oneBell: true, fx(a, t, dt) {
    const T = a.t; if (T < 0.5 || T > 4.84) return;
    const hand = anchor('handR', _h1), len = lerp(0.10, 0.30, sm(0.6, 1.2, T)) * (1 - 0.72 * sm(4.3, 4.75, T));
    const still = win(T, 2.5, 3.5, 0.2), strike = win(T, 3.66, 3.96, 0.05); let w = 0; const drive = _c1;
    if (strike > 0.01) { drive.copy(hand).addScaledVector(_fwd.set(0, 0, 1).applyQuaternion(_rq), len * 0.85); drive.y -= len * 0.35; w = 0.35 * strike; }
    else if (still > 0.01) { drive.copy(hand); drive.y -= len; w = 0.22 * still; }
    flail.visible = true; stepFlail(dt, hand, len, w > 0 ? drive : null, w);
    const bell = flP[FL_N - 1];
    dim(0.7 * win(T, 1.2, 4.3, 0.5));
    for (let i = 0; i < 4; i++) if (cue(a, 'c' + i, 1.25 + i * 0.3)) shock(bell, 0.62 - 0.06 * i, 0.07, 0.62, i % 2 ? COL.pale : COL.violet);      // violet circles gather round the bell
    const gather = win(T, 1.2, 3.9, 0.3);
    if (gather > 0.01) { show(gX1, bell, 0.36 + 0.06 * Math.sin(T * 5), 0.7 * gather); light(bell, 0.5 * gather); if (Math.random() < 30 * dt) { const d = _c3.set(rs(), rs(), rs()).normalize(); kindNext = 1; emit(bell.x + d.x * 0.34, bell.y + d.y * 0.34, bell.z + d.z * 0.34, -d.x * 0.6, -d.y * 0.6, -d.z * 0.6, 0.5, 0.035, COL.violet, 0, 0.2); kindNext = 0; } }
    const dk = win(T, 2.35, 3.93, 0.25);                                              // the dark halo, the bell hanging still at its heart
    if (dk > 0.01) { _c2.copy(bell).addScaledVector(_fwd.set(0, 0, 1).applyQuaternion(_rq), -0.03); showN(halo, _c2, (0.62 + 0.03 * Math.sin(T * 2.2)) * (0.7 + 0.3 * dk), dk); }
    if (cue(a, 'toll', 3.9)) {                                                         // one swing: the toll
      const ft = anchor('feet', _c3); anchor('chest', fxHitP); _rx.set(1, 0, 0).applyQuaternion(_rq);
      shock(bell, 0.08, 3.0, 1.3, COL.pale); shock(bell, 0.05, 1.3, 0.6, COL.gold); shock(ft, 0.3, 3.6, 1.5, COL.violet, true);
      burst(bell, 40, 1.6, 0.6, 0.05, COL.gold, 0.4, 2);
      for (let i = 0; i < 150; i++) { const an = Math.random() * TAU, r = 0.31 * Math.sqrt(Math.random()); emit(bell.x + r * Math.cos(an) * _rx.x, bell.y + r * Math.sin(an), bell.z + r * Math.cos(an) * _rx.z, rs() * 0.25, 0.1 + rs() * 0.25, rs() * 0.15, 1.0 + 0.8 * Math.random(), 0.03 + 0.03 * Math.random(), Math.random() < 0.75 ? COL.silver : COL.pale, 1.5, 0.7); }   // the halo falls as silver dust
    }
    if (cue(a, 'toll2', 4.06)) { shock(bell, 0.08, 2.4, 1.3, COL.violet); shock(anchor('feet', _c3), 0.3, 2.8, 1.4, COL.pale, true); }
    if (cue(a, 'toll3', 4.24)) shock(bell, 0.08, 1.9, 1.3, COL.dusk);
    const ring = win(T, 3.88, 4.5, 0.04); if (ring > 0.01) { show(gGold, bell, 0.5 + 0.5 * ring, 0.8 * ring); light(bell, 1.6 * ring, 0xe0c0ff); }
    return 'flail';
  } });

  // ---------- Hover: she folds her legs under her and floats, a slow wheel of light on the floor beneath (a stance, so she can talk or cast from it) ----------
  defStance('hover', 2.0, [
    { t: 0.35, hip: [0, -0.07, 0], sp: [0, 0.08, 0], hR: [-0.34, 0.84, 0.10], hL: [0.34, 0.84, 0.10], twR: 0.9, twL: 0.9, fR: FP.open, fL: FP.open, ftR: [0, 0, 0, -0.10, 0], ftL: [0, 0, 0, 0.10, 0] },
    { t: 0.75, hip: [0, 0.10, 0], sp: [0, -0.03, 0], hd: [0, -0.10, 0], ftR: [0, 0.16, 0, -0.10, 0.75], ftL: [0, 0.14, 0, 0.10, 0.75], hR: [-0.40, 0.98, 0.10], hL: [0.40, 0.98, 0.10], knR: [-0.5, 0, 1], knL: [0.5, 0, 1] },
    { t: 1.25, hip: [0, -0.02, -0.04], hd: [0, 0, 0], ftR: [0.06, 0.44, 0.12, 0.2, 0.75, 0, 0.5], ftL: [-0.08, 0.40, 0.16, -0.2, 0.75, 0, 0.5], knR: [-1, 0.3, 0.5], knL: [1, 0.2, 0.5], hR: [-0.34, 0.92, 0.12], hL: [0.34, 0.92, 0.12] },
    { t: 2.0, hip: [0, -0.13, -0.06], sp: [0, 0.02, 0], ftR: [0.15, 0.645, 0.26, 0, 0.8, 0, 1], ftL: [-0.17, 0.545, 0.28, 0, 0.8, 0, 1], knR: [-1, 0.4, 0.3], knL: [1, 0.2, 0.3],
      hR: [-0.285, 0.885, 0.215], hL: [0.285, 0.885, 0.215], twR: 1.35, twL: 1.35, fR: FP.cup, fL: FP.cup, wrR: [-0.1, 0], wrL: [-0.1, 0], eR: [-1, -0.3, -0.4], eL: [1, -0.3, -0.4], eyes: 0.35 }
  ], { rise: 1.0, live(B, t, k) {
    const up = sm(0.3, 1, k), bob = up * (0.022 * Math.sin(t * 1.25) + 0.006 * Math.sin(t * 2.9));         // she rides the air: a slow rise and fall
    B.hip[1] += bob; B.ftR[1] += bob; B.ftL[1] += bob; B.hR[1] += bob * 0.9; B.hL[1] += bob * 0.9; B.hipR[2] += up * 0.012 * Math.sin(t * 0.8); B.sp[2] += up * 0.01 * Math.sin(t * 0.8 + 1);
  }, fx(s, t, dt) {
    const k = sm(0.2, 0.9, s.t / s.def.dur), ft = anchor('feet', _h4), hp = anchor('hips', _c1);
    floorSigil(ft, lerp(0.3, 0.62, k), 0.75 * k * (0.85 + 0.15 * Math.sin(t * 2.5)), t * 0.7, COL.violet);
    show(gX3, _c2.copy(hp).setY(hp.y - 0.22), 0.9, 0.35 * k); light(_c3.copy(ft).setY(0.25), 0.55 * k);
    if (k > 0.05 && Math.random() < 26 * dt * k) { const an = Math.random() * TAU, r = 0.12 + Math.random() * 0.42; _c3.set(ft.x + r * Math.cos(an), 0.03, ft.z + r * Math.sin(an)); motes(_c3, 1, 0.015, 1.5, 0.04, Math.random() < 0.3 ? COL.pale : COL.violet, 0.32); }
  } });

  // how hard each move lands (0 to 1): hosts use it to shake the picture
  for (const [n, k] of [['last_toll', 1], ['gravity', 0.9], ['gilded_rebuke', 0.85], ['curtain_call', 0.7], ['stop', 0.7], ['sealed_fate', 0.6], ['ill_omen', 0.5], ['against_all_odds', 0.5], ['hush', 0.45], ['royal_reversal', 0.35], ['jump', 0.22]]) if (ACTS[n]) ACTS[n].impact = k;

  // ---------- the Fox's own everyday moves (13 Nov) ----------
  // Chris: "so it's like her talk and she's not the jester". She "would have different moves than bow twirl", and her own laugh and her own dance.
  // The Jester plays to the back row: big, even, both arms wide. The Fox is a trickster who sews. One hand is busy while the other idles on her pouch;
  // her moves are small and quick and close to her face, and then she is still; her head cocks like a fox listening; her fingers pinch a thread or snip it;
  // she never lets go of your eye; and she likes to make her bells ring. (Lore: lore/discussion-notes.md, "The Fox". The curtsey is the gesture of J4.)
  // Chris, 13 Nov, after trying them: her talk, laugh, dance, curtsey and pounce stay, and she keeps the Jester's bow and twirl as well (and the
  // Jester's wave and jump: "they're just waving"). The Jester's talk, laugh and dance are no longer on her page; they stay here under jester_
  // names only so the two can be played side by side while her moves are still being worked on.
  for (const n of ['talk', 'laugh', 'dance']) if (ACTS[n]) { ACTS['jester_' + n] = ACTS[n]; delete ACTS[n]; }
  (function foxMoves() {
    const SNIP_A = [0.62, 0.02, 0.05, 0.90, 0.93, 1.0], SNIP_B = [0.62, 0.07, 0.02, 0.90, 0.93, 0.0];       // two fingers as shears: open, shut
    const PINCH = [0.85, 0.72, 0.30, 0.16, 0.06, 0.9];                                                         // thumb and first finger closed on a thread, the others fanned
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr });      // everything about one arm
    const eD = (s) => [s * 0.7, -1, -0.2], mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    // Where a hand has to land on her (a fingertip on her glasses, her bell, her lips): worked out on the model with bench/contacts.js, for the lean and
    // head turn she has at that moment. If her head, neck or arms change size, run that again and paste the new numbers here.
    const POUCH_L = [0.20, 0.99, 0.19], GLASSES = [0.082, 1.396, 0.171], BELL = [-0.138, 1.381, 0.089], SHH = [0.075, 1.319, 0.171];
    const HIDE0 = [-0.036, 1.369, 0.220], HIDE1 = [-0.047, 1.325, 0.261], PEEK = [-0.114, 1.288, 0.165], DIP_SHH = [0.081, 1.153, 0.156];

    // Talk: she explains something with a thread that is not there. Only her arms, head and face move, so it plays over any stance, or as she walks.
    (function () {
      const LEAD = 0.10, keys = [], idleL = arm('L', POUCH_L, [1, -0.4, -0.3], FP.soft, 0.2, [0.3, 0]), idleR = arm('R', [-0.25, 1.00, 0.15], [-0.55, -0.1, -1], FP.relax, 0.2, [0.1, 0]);
      // A beat: she arrives in a pose at t and stays in it for len. Every beat names both arms, her head and her lean, so nothing starts drifting
      // toward the next beat early: quick, then still, is how she moves.
      const beat = (t, len, L, R, o) => { const k = Object.assign({ sp: [0, 0, 0], sh: [0, 0], eyes: 0 }, L, R, o); keys.push(Object.assign({ t }, k)); if (len > 0) keys.push(Object.assign({ t: t + len }, k)); };
      beat(0.35, 0.55, idleL, arm('R', [-0.20, 1.36, 0.19], eD(-1), FP.point, 0.5, [0.1, 0]), { hd: [0.06, 0.02, 0.14], sp: [0.04, 0, 0.02] });                       // now then: one finger up, head cocked
      keys.push({ t: 0.52, hR: [-0.21, 1.385, 0.20] }, { t: 0.70, hR: [-0.20, 1.35, 0.19] });
      beat(1.25, 0.10, idleL, arm('R', [-0.12, 1.33, 0.27], eD(-1), PINCH, 0.3, [-0.3, 0]), { hd: [-0.05, 0.06, 0.05], sp: [0, 0.03, 0] });                              // she finds a thread in the air
      beat(1.85, 0.20, idleL, arm('R', [-0.42, 1.28, 0.18], [-0.8, -0.8, -0.3], PINCH, 0.3, [-0.3, 0]), { hd: [-0.22, 0.03, -0.05], sp: [-0.07, 0.01, 0] });         // and draws it out
      const upL = arm('L', [0.26, 1.36, 0.28], eD(1), PINCH, 0.2, [0.5, 0]), look = { hd: [0.20, 0.04, -0.06], sp: [0.05, 0, 0] };
      beat(2.52, 0, upL, arm('R', [0.10, 1.25, 0.27], eD(-1), SNIP_A, 0.3, [0.25, 0.2]), look);                                                                       // holds it up by one end, off to her left
      keys.push({ t: 2.75, fR: SNIP_B }, { t: 2.92, fR: SNIP_A, hR: [0.10, 1.29, 0.27] }, { t: 3.09, fR: SNIP_B }, { t: 3.26, fR: SNIP_A });                           // snip, snip
      beat(3.38, 0, upL, arm('R', [0.10, 1.29, 0.27], eD(-1), SNIP_A, 0.3, [0.25, 0.2]), look);
      beat(3.92, 0.80, arm('L', [0.21, 1.10, 0.20], eD(1), FP.open, 1.35, [-0.25, 0]), arm('R', [-0.21, 1.10, 0.20], eD(-1), FP.open, 1.35, [-0.25, 0]), { sh: [0.20, 0.20], hd: [-0.03, 0.03, -0.16], eyes: 0.5 });   // who, me? small and close
      const push = (h) => arm('L', h, [0.8, -1, -0.2], FP.point, 0.5, [0.15, 0]);
      beat(5.15, 0, push([GLASSES[0], GLASSES[1] - 0.028, GLASSES[2] + 0.013]), idleR, { hd: [0, 0.08, 0.04] });                                                       // a fingertip under her glasses
      beat(5.40, 0.32, push(GLASSES), idleR, { hd: [0, 0.08, 0.04] });                                                                                                 // pushes them up
      beat(6.12, 0.58, idleL, idleR, { hd: [0.04, -0.02, 0.15] });                                                                                                     // and is still, looking at you
      const flick = (h) => arm('R', h, [-1, -0.3, 0.3], FP.point, 0.6, [0.6, 0.4]);
      beat(6.98, 0, idleL, flick([BELL[0] - 0.028, BELL[1], BELL[2] + 0.004]), { hd: [0, 0.05, -0.08] });                                                              // ding: a flick of her bell, twice
      keys.push({ t: 7.09, hR: BELL }, { t: 7.23, hR: [BELL[0] - 0.030, BELL[1] + 0.004, BELL[2] + 0.005] }, { t: 7.36, hR: BELL });
      beat(7.52, 0, idleL, flick([BELL[0] - 0.04, BELL[1] - 0.01, BELL[2] + 0.025]), { hd: [0, 0.05, -0.08] });
      const wag = (y) => arm('R', [-0.17, 1.37, 0.22], eD(-1), FP.point, 0.2, [0.1, y]);
      beat(8.00, 0, idleL, wag(0.35), { hd: [-0.05, 0.04, 0.06] });                                                                                                    // ah-ah-ah: a wagging finger
      keys.push({ t: 8.18, wrR: [0.1, -0.35], hd: [0.04, 0.04, 0.06] }, { t: 8.36, wrR: [0.1, 0.35], hd: [-0.04, 0.04, 0.06] }, { t: 8.54, wrR: [0.1, -0.35], hd: [0.04, 0.04, 0.06] });
      beat(8.72, 0, idleL, wag(0.2), { hd: [0, 0.04, 0.06] });
      beat(9.25, 0.75, arm('L', SHH, [0.8, -1, -0.2], FP.point, 0.4, [0.1, 0]), idleR, { sp: [0, 0.10, 0], hd: [0.04, -0.02, 0.08], eyes: 0.5 });                      // shh: a finger to her lips, leaning in
      beat(10.40, 0.40, arm('L', [0.34, 1.00, 0.15], [0.6, -1, -0.4], FP.open, 1.2, [-0.3, 0]), arm('R', [-0.34, 1.00, 0.15], [-0.6, -1, -0.4], FP.open, 1.2, [-0.3, 0]), { sp: [0, -0.02, 0], hd: [0, -0.04, -0.12] });   // and that is that
      // her mouth: quick bursts, and it stays shut while her hands do the talking (the glasses, the bell) and on the shh
      const mk = []; let n = 0;
      const say = (a, b, endv) => { let t = a; mk.push([t - 0.06, 0]); while (t < b - 0.12) { const d = 0.10 + 0.08 * h1(n * 4.1 + 3); mk.push([t, 1], [t + d * 0.55, 1], [Math.min(b - 0.02, t + d), 0]); t += d + 0.04 + 0.06 * h1(n * 6.7 + 5); n++; } mk.push([b, endv], [b + 0.16, endv]); };
      say(0.35, 1.0, 0); say(1.25, 2.2, 0); say(2.5, 2.72, 0);
      for (const t of [2.80, 3.16]) mk.push([t - 0.04, 0], [t, 1], [t + 0.12, 0]);                                // "snip"
      mk.push([3.50, 2]); say(3.95, 4.55, 2); mk.push([6.2, 2]); say(6.3, 6.8, 2); mk.push([7.6, 2]);
      for (const t of [7.98, 8.34, 8.70]) mk.push([t - 0.05, 0], [t, 1], [t + 0.13, 0]);                          // "ah, ah, ah"
      mk.push([9.20, 0], [9.30, 1], [9.70, 1], [9.85, 2]); say(10.40, 10.85, 2); mk.push([11.0, 2]);              // "shh"
      mk.sort((a, b) => a[0] - b[0]); let last = -1;
      for (const [t, v] of mk) if (t - last >= 0.03) { keys.push({ t, mouth: v }); last = t; }                     // two keys at one moment would stall the curve
      keys.sort((a, b) => a.t - b.t);
      for (const k of keys) k.t += LEAD;                                                                            // her first reach takes 0.45 s, not 0.35
      defAction('talk', 11.5 + LEAD, keys, { outro: 0.6, cues: [(2.75 + LEAD) / (11.5 + LEAD), (7.09 + LEAD) / (11.5 + LEAD)] });
    })();

    // Laugh: a snicker she tries to hide. Chin down and turned away, curled fingers over her mouth, the other arm across her middle; her shoulders
    // shake small and fast and she folds over it; she peeks to see how it landed, it gets away from her again, and she flicks it off with her fingers.
    (function () {
      const armL = { hL: [-0.06, 1.03, 0.17], eL: [1, -0.4, 0.3], fL: FP.soft, twL: 0.2 };
      const keys = [Object.assign({ t: 0.20, hd: [0.22, 0.14, -0.08], sp: [0.06, 0.06, 0], hR: HIDE0, eR: [-0.6, -1, -0.1], fR: FP.cup, twR: 0.6, wrR: [0.5, 0.3], eyes: 1, mouth: 2 }, armL)];
      for (let i = 0; i < 9; i++) {
        const t = 0.30 + i * 0.125, up = i % 2, k = i / 8;
        keys.push({ t, sh: up ? [0.13, 0.13] : [0.02, 0.02], sp: [0.06, lerp(0.06, 0.22, k) + (up ? 0.02 : 0), 0.03 * k + (up ? 0.012 : -0.012)], hd: [0.22, lerp(0.14, 0.24, k) + (up ? -0.02 : 0.015), -0.08],
          hR: mix3(HIDE0, HIDE1, k), hL: [-0.06, lerp(1.03, 1.01, k), lerp(0.17, 0.19, k)], eyes: 1, mouth: 2 });
      }
      keys.push({ t: 1.64, sh: [0, 0], sp: [0, 0.06, 0], hd: [-0.05, 0.02, 0.14], hR: PEEK, fR: FP.soft, twR: 0.9, wrR: [0.3, 0.2], hL: [-0.06, 1.03, 0.17], eyes: 0, mouth: 2 });       // the peek
      keys.push({ t: 1.98, hd: [-0.05, 0.02, 0.15], sp: [0, 0.06, 0], eyes: 0 });
      for (let i = 0; i < 4; i++) { const t = 2.08 + i * 0.125, up = i % 2; keys.push({ t, sh: up ? [0.11, 0.11] : [0.02, 0.02], sp: [0, 0.07 + (up ? 0.02 : 0), 0], hd: [-0.05, 0.05 + (up ? -0.02 : 0.02), 0.14], eyes: 0.9, mouth: 2 }); }
      keys.push({ t: 2.52, hR: PEEK, eR: [-0.6, -1, -0.1], fR: FP.soft, twR: 0.9, wrR: [0.3, 0.2] });
      keys.push({ t: 2.74, sh: [0, 0], sp: [0, 0, 0], hd: [0.03, -0.02, 0.08], hR: [-0.30, 1.20, 0.20], eR: [-0.7, -1, -0.3], fR: FP.open, twR: 0.3, wrR: [-0.35, 0.3], eyes: 0, mouth: 2 });   // oh, stop
      keys.push({ t: 2.90, wrR: [0.35, -0.2] }, { t: 3.05, mouth: 2 });
      for (const k of keys) k.t += 0.22;                                                                            // 0.42 s for her hand to reach her mouth: at 0.20 it was a whip (8 m/s)
      defAction('laugh', 3.62, keys, { outro: 0.45 });
    })();

    // Dance: she dances to ring her bells. Four slow swaying steps, her weight dropping onto one hip while the other foot points out and the far wrist
    // shakes up by her ear; a hop that turns her back to you, two bumps of her hips with a look over her shoulder; a hop back round into a pose.
    (function () {
      const keys = [], B = 0.48, T0 = 0.50, spin = [[0, 0]];
      const mid = (t, y) => keys.push({ t, hip: [0, y, 0], hipR: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest', hR: [-0.25, 1.30, 0.16], hL: [0.25, 1.30, 0.16], wrR: [0, 0], wrL: [0, 0] });
      // her weight on one hip (sd: −1 is her right), the other foot pointed out; the arm on the free side up, the other low and out
      const sway = (t, sd, deep) => {
        const W = sd < 0 ? 'R' : 'L', Fr = sd < 0 ? 'L' : 'R', k = { t, hip: [sd * 0.075, -0.05 * deep, 0], hipR: [sd * -0.08, 0, sd * 0.17 * deep], sp: [sd * 0.08, 0, -sd * 0.22 * deep], hd: [-sd * 0.18, -0.03, sd * 0.10] };
        k['ft' + Fr] = [-sd * 0.16, 0.035, 0.08, -sd * 0.35, 0.42]; k['kn' + Fr] = [-sd * 0.4, 0, 1]; k['ft' + W] = 'rest'; k['kn' + W] = 'rest';
        Object.assign(k, arm(Fr, [-sd * 0.19, 1.63, 0.05], [-sd * 1, 0.3, -0.3], FP.soft, 0.3, [0.1, 0.45]), arm(W, [sd * 0.36, 0.97, 0.12], [sd * 0.5, -0.4, -1], FP.open, 0.9, [-0.3, 0]));
        keys.push(k);
        for (let j = -1; j <= 2; j++) if (j) keys.push({ t: t + j * 0.10, ['wr' + Fr]: [0.1, j % 2 ? -0.5 : 0.5] });                         // the shake that rings her wrist
      };
      keys.push({ t: 0.38, hip: [0, -0.03, 0], hR: [-0.25, 1.30, 0.16], hL: [0.25, 1.30, 0.16], eR: [-1, -0.6, -0.3], eL: [1, -0.6, -0.3], fR: FP.soft, fL: FP.soft, twR: 0.4, twL: 0.4, mouth: 2 });
      for (let i = 0; i < 4; i++) { const t = T0 + i * B; if (i) mid(t, 0.006); sway(t + B * 0.5, i % 2 ? 1 : -1, 1); }
      // a hop that takes her half way round: down, up (she turns in the air), down
      const hop = (t, a0, a1) => {
        keys.push({ t, hip: [0, -0.085, 0], hipR: [0, 0, 0], sp: [0, 0.10, 0], hd: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: [-0.2, 0, 1], knL: [0.2, 0, 1], hR: [-0.24, 1.20, 0.16], hL: [0.24, 1.20, 0.16], eR: [-1, -0.6, -0.3], eL: [1, -0.6, -0.3], fR: FP.soft, fL: FP.soft, twR: 0.4, twL: 0.4, wrR: [0, 0], wrL: [0, 0] });
        keys.push({ t: t + 0.11, hip: [0, 0.02, 0], sp: [0, -0.03, 0], ftR: [0, 0.045, 0, -0.1, 0.5], ftL: [0, 0.045, 0, 0.1, 0.5], hR: [-0.30, 1.30, 0.12], hL: [0.30, 1.30, 0.12] });
        keys.push({ t: t + 0.23, hip: [0, 0.085, 0], ftR: [0.01, 0.12, 0, -0.1, 0.6], ftL: [-0.01, 0.12, 0, 0.1, 0.6], hR: [-0.33, 1.42, 0.08], hL: [0.33, 1.42, 0.08] });
        keys.push({ t: t + 0.35, hip: [0, 0.02, 0], ftR: [0, 0.04, 0, -0.1, 0.4], ftL: [0, 0.04, 0, 0.1, 0.4] });
        keys.push({ t: t + 0.46, hip: [0, -0.07, 0], sp: [0, 0.06, 0], ftR: 'rest', ftL: 'rest', hR: [-0.26, 1.20, 0.14], hL: [0.26, 1.20, 0.14] });
        spin.push([t + 0.09, a0], [t + 0.37, a1]);
        return t + 0.46;
      };
      let t = hop(T0 + 4 * B, 0, PI);
      // her back to you: hands on her hips, a look over her shoulder, and her hips bump one way and the other
      const onHips = { hR: [-0.215, 1.035, -0.02], hL: [0.215, 1.035, -0.02], eR: [-1, -0.1, -0.6], eL: [1, -0.1, -0.6], fR: FP.loose, fL: FP.loose, twR: 0.2, twL: 0.2, wrR: [0.5, 0], wrL: [0.5, 0] };
      keys.push(Object.assign({ t: t + 0.20, hip: [-0.08, -0.04, 0], hipR: [0.06, 0, -0.17], sp: [-0.22, 0, 0.20], hd: [-0.80, -0.02, 0.05], knR: 'rest', knL: [0.3, 0, 1], ftL: [0.03, 0.03, 0.02, 0.2, 0.35] }, onHips));
      keys.push({ t: t + 0.42, hip: [0, 0, 0], hipR: [0, 0, 0], sp: [-0.22, 0, 0], hd: [-0.80, -0.02, 0], ftL: 'rest', knL: 'rest' });
      keys.push({ t: t + 0.64, hip: [0.08, -0.04, 0], hipR: [-0.06, 0, 0.17], sp: [-0.22, 0, -0.20], hd: [-0.80, -0.02, -0.05], knR: [-0.3, 0, 1], ftR: [-0.03, 0.03, 0.02, -0.2, 0.35] });
      keys.push(Object.assign({ t: t + 0.74 }, onHips));                                                              // her hands stay on her hips through both bumps
      keys.push({ t: t + 0.86, hip: [0, 0, 0], hipR: [0, 0, 0], sp: [-0.10, 0, 0], hd: [-0.4, 0, 0], ftR: 'rest', knR: 'rest' });
      t = hop(t + 1.00, PI, TAU);
      // round again and into her pose: weight on her left hip, left hand on it, right wrist ringing by her ear, head cocked
      keys.push({ t: t + 0.22, hip: [0.075, -0.05, 0], hipR: [-0.08, 0, 0.17], sp: [0.08, 0, -0.22], hd: [-0.10, -0.03, 0.15], ftR: [-0.16, 0.035, 0.08, -0.35, 0.42], knR: [-0.4, 0, 1], ftL: 'rest', knL: 'rest',
        hL: [0.215, 1.035, -0.02], eL: [1, -0.1, -0.6], fL: FP.loose, twL: 0.2, wrL: [0.5, 0], hR: [-0.19, 1.63, 0.05], eR: [-1, 0.3, -0.3], fR: FP.soft, twR: 0.3, wrR: [0.1, -0.45], mouth: 2 });
      for (let j = 1; j <= 4; j++) keys.push({ t: t + 0.22 + j * 0.10, wrR: [0.1, j % 2 ? 0.5 : -0.5] });
      keys.push({ t: t + 0.95, hip: [0.075, -0.045, 0], hd: [-0.10, -0.03, 0.16], mouth: 2 });
      const dur = t + 1.45; spin.push([dur, TAU]);
      keys.sort((a, b) => a.t - b.t);
      defAction('dance', dur, keys, { outro: 0.45, stand: true, spin });
    })();

    // Curtsey (her own; she also keeps the Jester's bow): one foot slips behind, she dips, holds a fold of her trousers out at her side and puts a finger to her
    // lips. She does not lower her head: she watches you through it, with one slow blink. More cheek than respect.
    defAction('curtsey', 3.5, [
      { t: 0.42, ftR: [0.05, 0.03, -0.20, -0.40, 0.40], hip: [0.005, -0.02, 0], hR: [-0.275, 0.85, 0.04], eR: [-1, -0.2, -0.6], fR: PINCH, twR: 0.2, wrR: [0.2, 0], hL: [0.14, 1.12, 0.22], eL: [0.8, -1, -0.2], fL: FP.point, twL: 0.4, wrL: [0.1, 0], hd: [0.03, -0.02, 0.08], mouth: 2 },
      { t: 1.00, ftR: [0.05, 0.04, -0.24, -0.45, 0.50], hip: [0.01, -0.17, -0.02], knL: [0.40, 0, 1], knR: [-0.5, 0, 1], sp: [0, 0.12, 0], hd: [0.05, -0.08, 0.14], hR: [-0.30, 0.705, 0.05], hL: DIP_SHH },
      { t: 1.30, eyes: 0 }, { t: 1.48, eyes: 1 }, { t: 1.62, eyes: 1 }, { t: 1.80, eyes: 0 },
      { t: 2.05, hip: [0.01, -0.165, -0.02], sp: [0, 0.12, 0], hd: [0.05, -0.08, 0.15], hR: [-0.30, 0.71, 0.05], hL: [DIP_SHH[0], DIP_SHH[1] + 0.005, DIP_SHH[2]] },
      { t: 2.60, ftR: [0.02, 0.02, -0.08, -0.2, 0.2], hip: [0, 0, 0], knL: 'rest', knR: 'rest', sp: [0, -0.02, 0], hd: [0, -0.03, -0.10], hR: [-0.37, 0.93, 0.12], fR: FP.open, twR: 0.9, wrR: [-0.3, 0.2], hL: [0.20, 1.20, 0.22], fL: FP.soft, twL: 0.8 },
      { t: 3.00, ftR: 'rest', hR: [-0.32, 0.90, 0.08], hL: [0.27, 1.02, 0.14], mouth: 2 }
    ], { outro: 0.45, stand: true });

    // Pounce (her own; she also keeps the Jester's twirl): the way a fox takes a mouse. She sinks, her hips wind up with a wiggle while her head
    // stays dead still, she springs up and over and comes down with both hands cupped on her catch; a peek between her thumbs, a look up at you,
    // and she hops back. Her hands are always placed where her arms can reach (within nine tenths of their length from the shoulder at that
    // moment: bench/armdiag.js), because an arm pulled straight locks, and snaps when it lets go.
    (function () {
      const keys = [], both = (x, y, z, o) => Object.assign({ hR: [-x, y, z], hL: [x, y, z] }, o);
      const crouch = both(0.12, 0.58, 0.22, { hip: [0, -0.36, -0.10], sp: [0, 0.50, 0], hd: [0, -0.34, 0], eR: [-1, -0.1, -0.2], eL: [1, -0.1, -0.2], fR: FP.cup, fL: FP.cup, wrR: [0.3, 0], wrL: [0.3, 0],
        knR: [-0.40, 0, 1], knL: [0.40, 0, 1], ftR: [-0.03, 0.035, 0, -0.30, 0.45], ftL: [0.03, 0.035, 0, 0.30, 0.45] });
      keys.push(Object.assign({ t: 0.45, eyes: 0.3 }, crouch));
      for (let i = 0; i < 5; i++) { const s = i % 2 ? 1 : -1, a = i === 4 ? 0 : 1; keys.push({ t: 0.54 + i * 0.10, hip: [s * 0.02 * a, -0.36 - 0.012 * i, -0.10 - 0.008 * i], hipR: [s * 0.16 * a, 0, s * 0.05 * a], sp: [-s * 0.14 * a, 0.50, -s * 0.03 * a], hd: [0, -0.34, 0] }); }   // the wiggle
      // the spring: her arms swing back and then through as she pushes off, then she is up and over. 0.50 s in the air, 30 cm up, 40 cm forward,
      // tipped forward with her knees drawn up.
      const T0 = 1.34, AIR = 0.50, H = 0.30, FW = 0.40, g = 8 * H / (AIR * AIR), v0 = g * AIR / 2;
      keys.push(both(0.12, 0.58, 0.22, { t: 0.80, eR: crouch.eR, eL: crouch.eL, fR: FP.cup, fL: FP.cup }));
      keys.push(both(0.27, 0.64, -0.14, { t: 1.06, hip: [0, -0.40, -0.12], sp: [0, 0.56, 0], eR: [-0.5, 0.3, -1], eL: [0.5, 0.3, -1], fR: FP.soft, fL: FP.soft, eyes: 0 }));
      keys.push({ t: 1.14, hip: [0, -0.41, -0.12], sp: [0, 0.56, 0] });
      keys.push(both(0.20, 1.02, 0.30, { t: T0, hip: [0, 0.03, 0.02], hipR: [0, 0, 0], sp: [0, 0.10, 0], hd: [0, -0.10, 0], eR: [-0.6, -1, -0.3], eL: [0.6, -1, -0.3], ftR: [-0.02, 0.07, 0, -0.10, 0.75], ftL: [0.02, 0.07, 0, 0.10, 0.75], knR: [-0.2, 0, 1], knL: [0.2, 0, 1], mouth: 1 }));
      const HX = [0.20, 0.19, 0.16, 0.12, 0.08, 0.05, 0.034], HY = [1.02, 1.13, 1.22, 1.20, 1.10, 0.93, 0.74], HZ = [0.30, 0.36, 0.42, 0.50, 0.58, 0.61, 0.62];      // her hands through the leap: up with her, then down to the catch
      for (let i = 1; i <= 5; i++) {
        const u = i / 6, ta = u * AIR, y = v0 * ta - 0.5 * g * ta * ta, z = FW * u, tuck = Math.sin(PI * u), dn = sm(0.45, 1, u);
        keys.push(both(HX[i], HY[i], HZ[i], { t: T0 + ta, hip: [0, 0.03 * (1 - u) - 0.10 * dn + y, 0.02 + z - 0.05 * dn], hipR: [0, 0.28 * tuck, 0], sp: [0, 0.10 + 0.50 * tuck * (1 - dn) + 0.50 * dn, 0], hd: [0, -0.10 + 0.34 * tuck, 0],
          eR: [-1, lerp(-1, 0.1, u), -0.2], eL: [1, lerp(-1, 0.1, u), -0.2], fR: FP.open, fL: FP.open,
          ftR: [-0.02 - 0.02 * tuck, 0.07 * (1 - u) + y + 0.22 * tuck, z - 0.12 * tuck * (1 - dn) + 0.03 * dn, -0.15, 0.75 - 0.4 * dn], ftL: [0.02 + 0.02 * tuck, 0.07 * (1 - u) + y + 0.18 * tuck, z - 0.07 * tuck * (1 - dn) + 0.03 * dn, 0.15, 0.75 - 0.4 * dn] }));
      }
      const TL = T0 + AIR, cup = { eR: [-1, 0.1, -0.1], eL: [1, 0.1, -0.1], fR: FP.cup, fL: FP.cup, twR: 0.75, twL: 0.75, wrR: [0.2, 0], wrL: [0.2, 0] };
      keys.push(both(HX[6], HY[6], HZ[6], Object.assign({ t: TL, hip: [0, -0.20, FW - 0.06], hipR: [0, 0, 0], sp: [0, 0.52, 0], hd: [0, 0.10, 0], ftR: [-0.04, 0, FW, -0.30, 0.10], ftL: [0.04, 0, FW, 0.30, 0.10], knR: [-0.40, 0, 1], knL: [0.40, 0, 1], mouth: 0 }, cup)));     // got it
      keys.push(both(0.034, 0.47, 0.60, { t: TL + 0.16, hip: [0, -0.47, FW - 0.11], sp: [0, 0.60, 0], hd: [0, 0.12, 0], ftR: [-0.04, 0.035, FW, -0.36, 0.5], ftL: [0.04, 0.035, FW, 0.36, 0.5], knR: [-0.5, 0, 1], knL: [0.5, 0, 1] }));
      keys.push(both(0.034, 0.49, 0.60, { t: TL + 0.34, hip: [0, -0.43, FW - 0.11], sp: [0, 0.56, 0] }));
      // she lifts her cupped hands and peeks in between her thumbs
      keys.push(both(0.036, 0.56, 0.60, { t: TL + 0.70, sp: [0, 0.50, 0], hd: [0.05, 0.22, 0.12], eyes: 0.4, mouth: 0 }));
      keys.push(both(0.046, 0.57, 0.60, { t: TL + 0.95, hd: [0.05, 0.24, 0.13], eyes: 0.4, mouth: 2 }));
      // looks up at you, pleased with herself
      keys.push(both(0.036, 0.55, 0.60, { t: TL + 1.25, hd: [0, -0.36, -0.10], eyes: 0, mouth: 2 }));
      keys.push(Object.assign(both(0.045, 0.55, 0.60, { t: TL + 1.50, hd: [0, -0.36, -0.12], hip: [0, -0.45, FW - 0.12], sp: [0, 0.52, 0] }), cup));
      // and hops back to where she started: up out of the crouch in 0.3 s, 0.34 s in the air, 14 cm up. Her hands part and open on the way
      const T1 = TL + 1.80, AIR2 = 0.34, H2 = 0.14, g2 = 8 * H2 / (AIR2 * AIR2), w0 = g2 * AIR2 / 2, wide = { eR: [-0.6, -1, -0.3], eL: [0.6, -1, -0.3], fR: FP.open, fL: FP.open, twR: 0.9, twL: 0.9 };
      keys.push(both(0.20, 0.98, FW + 0.16, Object.assign({ t: T1, hip: [0, -0.02, FW - 0.02], sp: [0, 0.10, 0], hd: [0, -0.06, 0], ftR: [-0.02, 0.06, FW, -0.10, 0.7], ftL: [0.02, 0.06, FW, 0.10, 0.7], knR: [-0.2, 0, 1], knL: [0.2, 0, 1] }, wide)));
      for (let i = 1; i <= 3; i++) { const u = i / 4, ta = u * AIR2, y = w0 * ta - 0.5 * g2 * ta * ta, z = FW * (1 - u), k = { t: T1 + ta, hip: [0, -0.02 + y, z - 0.02 * (1 - u)], ftR: [-0.02, 0.06 * (1 - u) + y + 0.05, z, -0.10, 0.6], ftL: [0.02, 0.06 * (1 - u) + y + 0.05, z, 0.10, 0.6] };
        if (i === 2) Object.assign(k, both(0.30, 1.10, 0.30)); keys.push(k); }
      keys.push(both(0.38, 1.00, 0.14, { t: T1 + AIR2, hip: [0, -0.07, 0], sp: [0, 0.06, 0], hd: [0.04, -0.03, 0.12], ftR: 'rest', ftL: 'rest', knR: [-0.2, 0, 1], knL: [0.2, 0, 1], mouth: 2 }));
      keys.push(both(0.36, 0.98, 0.12, { t: T1 + AIR2 + 0.30, hip: [0, 0, 0], sp: [0, 0, 0], knR: 'rest', knL: 'rest', hd: [0.04, -0.03, 0.13], mouth: 2 }));
      const dur = T1 + AIR2 + 0.95;
      defAction('pounce', dur, keys, { outro: 0.4, stand: true, hits: [TL / dur], cues: [T0 / dur] });
    })();
  })();

  // ---------- the Fox's spells (round 3). First: her shears in her hands, and Hemline Fangs ----------
  // References: references/round3/H3.webp (the draw and the split), H4.webp (the two cuts), and the flipbook clip hemline_fangs (12 frames at 6 a
  // second, the blow on frame 7). Her magic is cold blue foxfire (lore/discussion-notes.md, "The Fox").
  COL.fox = [0.36, 0.78, 1.0]; COL.foxPale = [0.84, 0.95, 1.0]; COL.thread = [1.0, 0.82, 0.42];
  (function foxSpells() {
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr });
    // Hand keys for her shears. GRIP: her right palm on the ring of the sheathed shears (bench: T.reach of 'handR' onto the ring). The turns of her
    // forearms and wrists that point a blade where it should go were searched for on the model (bench/blades.js), pose by pose.
    const GRIP = arm('R', [-0.216, 1.015, 0.123], [-1, 0.2, -0.6], FP.grip, 0.2, [0.3, 0]);
    const upR = (y) => arm('R', [-0.13, y, 0.27], [-0.7, -1, -0.2], FP.grip, 0.2, [0.4, 0.3]), upL = (y) => arm('L', [-0.045, y - 0.01, 0.275], [0.7, -1, -0.2], FP.grip, 0.2, [0.4, -0.3]);      // held up in front of her right shoulder, clear of her face, blades up (H3)
    const outR = arm('R', [-0.40, 1.02, 0.08], [-0.2, -0.5, -1], FP.grip, 1.0, [0, 0.3]), outL = arm('L', [0.40, 1.02, 0.08], [0.2, -0.5, -1], FP.grip, 1.0, [0, -0.3]);                          // a dagger out at each side, blades up (H3)
    const restL = arm('L', [0.29, 0.882, 0.055], [0.55, -0.1, -1], FP.relax, 0, [0.1, 0]), restR = arm('R', [-0.29, 0.882, 0.055], [-0.55, -0.1, -1], FP.relax, 0, [0.1, 0]);
    const _f1 = V3(), _f2 = V3(), _f3 = V3(), _f4 = V3(), prev = { A: { tip: V3(), mid: V3(), on: false }, B: { tip: V3(), mid: V3(), on: false } };
    // foxfire off a moving blade: sparks strewn over the strip the blade swept since the last frame, so a fast cut leaves an unbroken arc
    function bladeTrail(W, k, dt) {
      const tip = anchor('blade' + W, _f1), mid = anchor('blade' + W + 'm', _f2), p = prev[W];
      if (p.on && k > 0.01) { const sp = tip.distanceTo(p.tip) / Math.max(dt, 1e-3), n = Math.min(40, (10 + sp * 14) * k * dt * 60 / 2.2);
        for (let i = 0; i < n || (i === 0 && Math.random() < n); i++) { const u = Math.random(), v = Math.pow(Math.random(), 0.6); _f3.copy(p.mid).lerp(p.tip, v); _f4.copy(mid).lerp(tip, v); _f3.lerp(_f4, u);
          emit(_f3.x, _f3.y, _f3.z, rs() * 0.05, 0.03 + rs() * 0.05, rs() * 0.05, 0.16 + Math.random() * 0.22, 0.022 + 0.034 * v, Math.random() < 0.3 ? COL.foxPale : COL.fox, 0.1, 0.6); } }
      p.tip.copy(tip); p.mid.copy(mid); p.on = true; return tip;
    }
    const glint = (W, dt, rate) => { if (Math.random() < rate * dt) { const t = anchor('blade' + W, _f1); emit(t.x, t.y, t.z, rs() * 0.08, 0.05 + Math.random() * 0.1, rs() * 0.08, 0.35 + Math.random() * 0.3, 0.03, COL.foxPale, 0.2, 0.8); } };

    // Shears: she takes them out to look at them. Draws them, holds them up, two snips, parts them into her two daggers and shows them, puts them
    // back together and away. For looking at the tools in her hands; not a spell.
    defAction('shears_out', 5.5, [
      Object.assign({ t: 0.32, hd: [-0.25, 0.18, 0], sp: [-0.08, 0.05, 0], shr: 0 }, GRIP),
      Object.assign({ t: 0.42, shr: 0 }, GRIP),
      Object.assign({ t: 0.80, shr: 1, hd: [0, 0.07, 0.05], sp: [0, 0, 0], sho: 0, mouth: 2 }, upR(1.17)),
      { t: 1.05, sho: 0 }, { t: 1.20, sho: 0.55 }, { t: 1.36, sho: 0.04 }, { t: 1.52, sho: 0.55 }, { t: 1.68, sho: 0 },                                        // snip, snip
      Object.assign({ t: 1.80, shs: 0 }, upR(1.17), restL),
      Object.assign({ t: 2.15, shs: 0, sho: 0 }, upL(1.17)),                                                                                                   // her left hand takes the back half
      { t: 2.30, shs: 1 },
      Object.assign({ t: 2.70, hd: [0, -0.03, 0.08], shl: 0.44 }, outR, outL),                                                                                 // two daggers
      { t: 3.10, twR: 0.7, twL: 1.3, hd: [0.2, -0.03, 0.08] }, { t: 3.50, twR: 1.3, twL: 0.7, hd: [-0.2, -0.03, 0.08] }, Object.assign({ t: 3.85, hd: [0, 0, 0.05], shs: 1 }, outR, outL),      // she turns them in the light
      Object.assign({ t: 4.25, shs: 1, hd: [0, 0.07, 0] }, upR(1.10), upL(1.10)),
      { t: 4.40, shs: 0 },
      Object.assign({ t: 4.60, shr: 1 }, upR(1.10), restL),
      Object.assign({ t: 4.95, shr: 1, hd: [-0.22, 0.16, 0], sp: [-0.06, 0.04, 0] }, GRIP),
      Object.assign({ t: 5.10, shr: 0, mouth: 2 }, GRIP),
      Object.assign({ t: 5.20, shr: 0, hd: [0, 0, 0], sp: [0, 0, 0] }, GRIP)
    ], { outro: 0.3, cues: [1.36 / 5.5, 1.68 / 5.5], fx(a, t, dt) { const T = a.t; if (T > 0.8 && T < 4.9) { glint('A', dt, 2.5); if (T > 2.3 && T < 4.4) glint('B', dt, 2.5); } } });

    // Hemline Fangs. Keyed on the flipbook's twelve frames, a little slower so no hand has to whip: time = (frame - 1) / 6 x TS.
    (function () {
      const TS = 1.22, K = (f, o) => Object.assign({ t: (f - 1) / 6 * TS }, o), keys = [], stand = { hip: [0, 0, 0], hipR: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest' };
      const lunge = (dz, dy) => ({ hip: [0.03, dy, dz], ftL: [0.12, 0, 0.30, 0.25, 0], ftR: [-0.10, 0.02, -0.16, -0.5, 0.25], knL: [0.30, 0, 1], knR: [-0.4, 0, 1] });
      const cutR = (h, wr) => arm('R', h, [-1, -0.6, -0.2], FP.grip, 0.8, wr), cutL = (h, wr) => arm('L', h, [1, -0.6, -0.2], FP.grip, 0.8, wr);
      keys.push(K(1.85, Object.assign({ hd: [-0.25, 0.18, 0], sp: [-0.08, 0.05, 0], shr: 0 }, GRIP, arm('L', [0.10, 1.04, 0.24], [0.7, -1, -0.2], FP.soft, 0.2, [0.2, 0]))));       // her hand on the ring
      keys.push(K(2.00, { shr: 0 }));
      keys.push(K(2.30, Object.assign({ shr: 1, shs: 0, sho: 0.3, shl: 0.44, hd: [0, 0.08, 0], sp: [0, 0, 0], mouth: 2 }, upR(1.10), upL(1.10))));                                   // out and up, and her left hand has the back half
      keys.push(K(2.50, { shs: 0 }));
      keys.push(K(3.20, Object.assign({ shs: 1, sho: 0, shl: 0.44, hd: [0, -0.03, 0.06] }, outR, outL, stand)));                                                                     // frame 3: a dagger at each side
      keys.push(K(3.70, Object.assign({ shl: 0.44 }, outR, outL, stand)));
      keys.push(K(4.65, Object.assign({ shl: -0.35, sp: [-0.35, 0.10, 0], hd: [0.25, 0, 0] }, lunge(0.10, -0.15),                                                                    // frames 4 and 5: the step, and she winds up to her right
        arm('R', [-0.40, 1.28, -0.03], [-1, -0.3, -0.6], FP.grip, 1.6, [-0.4, -0.3]), cutL([0.12, 1.08, 0.30], [0, 0]))));
      keys.push(K(5.30, Object.assign({ shl: -0.45, sp: [-0.37, 0.10, 0] }, lunge(0.10, -0.15), arm('R', [-0.41, 1.29, -0.05], [-1, -0.3, -0.6], FP.grip, 1.6, [-0.4, -0.3]))));
      keys.push(K(6.15, Object.assign({ shl: -0.7, sp: [0, 0.12, 0], hd: [0, 0.03, 0] }, lunge(0.14, -0.17), cutR([-0.05, 1.16, 0.43], [0, 0.3]), cutL([0.30, 1.28, 0.12], [-0.2, 0.2]))));   // the first cut, her right hand, high right to low left
      keys.push(K(7.00, Object.assign({ shl: -0.7, sp: [0.25, 0.14, 0], hd: [-0.2, 0.05, 0] }, lunge(0.15, -0.17), cutR([0.18, 0.93, 0.36], [0, 0.3]),                               // frame 7: it lands
        arm('L', [0.34, 1.40, 0.06], [1, -0.2, -0.6], FP.grip, 1.6, [-0.4, 0.3]))));
      keys.push(K(7.75, Object.assign({ sp: [0.05, 0.13, 0], hd: [0, 0.04, 0] }, lunge(0.15, -0.17), cutL([0.05, 1.14, 0.44], [0, 0]), cutR([0.21, 0.90, 0.28], [0, 0.3]))));        // the second, her left hand, down across the first
      keys.push(K(8.45, Object.assign({ shl: -0.7, sp: [-0.15, 0.12, 0], hd: [0.12, 0.05, 0] }, lunge(0.14, -0.16), cutL([-0.16, 0.91, 0.36], [0, -0.3]), cutR([0.20, 0.92, 0.25], [0, 0.3]))));
      keys.push(K(9.40, Object.assign({ shl: 0.1, shs: 1, sp: [0, 0.02, 0], hd: [0, 0, 0.05], mouth: 2 }, stand, arm('R', [-0.34, 0.98, 0.20], [-0.4, -0.6, -0.8], FP.grip, 1.0, [0, 0.3]),   // she comes up out of it, blades wide
        arm('L', [0.34, 0.98, 0.20], [0.4, -0.6, -0.8], FP.grip, 1.0, [0, -0.3]))));
      keys.push(K(10.30, Object.assign({ shl: 0.44, shs: 1, sho: 0.3, hd: [0, 0.07, 0] }, upR(1.10), upL(1.10))));                                                                 // and together again in front of her
      keys.push(K(10.65, { shs: 0, sho: 0.3 })); keys.push(K(10.90, { sho: 0 }));                                                                                                  // snip
      keys.push(K(11.00, Object.assign({ shr: 1 }, upR(1.10), restL)));
      keys.push(K(11.70, Object.assign({ shr: 1, hd: [-0.22, 0.16, 0], sp: [-0.06, 0.04, 0] }, GRIP)));                                                                           // and away
      keys.push(K(11.95, Object.assign({ shr: 0 }, GRIP)));
      keys.push(K(12.10, Object.assign({ shr: 0, hd: [0, 0, 0], sp: [0, 0, 0], mouth: 2 }, GRIP)));
      const dur = (12.9 - 1) / 6 * TS, tt = (f) => (f - 1) / 6 * TS, T_HIT = tt(7.0), T_HIT2 = tt(8.3), T_RING = tt(9.4);
      // Her spells act toward her left (screen right when she faces you, as on the sprite sheet), so for a blow struck forward she turns to face it.
      const spin = [[0, 0], [tt(2.2), 0], [tt(4.4), PI / 2], [tt(9.0), PI / 2], [tt(11.4), 0], [dur, 0]];
      defAction('hemline_fangs', dur, keys, { outro: 0.28, stand: true, spin, hits: [T_HIT / dur], cues: [tt(3) / dur, T_HIT2 / dur], impact: 0.6,
        start() { prev.A.on = prev.B.on = false; },
        fx(a, t, dt) {
          const T = a.t, out = T > tt(2.4) && T < tt(11.7), split = T > tt(2.8) && T < tt(10.6);
          const k1 = win(T, tt(5.5), tt(7.3), 0.08), k2 = win(T, tt(6.9), tt(8.7), 0.08), kr = win(T, tt(8.9), tt(10.0), 0.08);
          if (out) { const tip = bladeTrail('A', Math.max(k1, 0.5 * kr), dt); if (k1 > 0.2) light(tip, 0.9 * k1, 0x66c8ff); glint('A', dt, 3); } else prev.A.on = false;
          if (split) { const tip = bladeTrail('B', Math.max(k2, 0.5 * kr), dt); if (k2 > 0.2) light(tip, 0.9 * k2, 0x66c8ff); glint('B', dt, 3); } else prev.B.on = false;
          if (cue(a, 'split', tt(2.75))) { const p = anchor('bladeAm', _f1); burst(p, 26, 0.9, 0.5, 0.03, COL.foxPale, 0.3, 1.2, 0.2); }
          const X = anchor('chest', _f1); X.addScaledVector(_f2.set(0, 0, 1).applyQuaternion(root.getWorldQuaternion(_qa)), 0.62 * FOX_K); X.y -= 0.12 * FOX_K; fxHitP.copy(X);      // where the two cuts cross, in front of her (and where the page puts its own flash)
          if (cue(a, 'hit1', T_HIT)) { burst(X, 60, 2.2, 0.55, 0.04, COL.fox, 0.5, 1.4, 0.3); shock(X, 0.05, 0.42, 0.30, COL.foxPale); }
          if (cue(a, 'hit2', T_HIT2)) { burst(X, 46, 1.8, 0.5, 0.04, COL.foxPale, 0.5, 1.4, 0.3); shock(X, 0.04, 0.34, 0.26, COL.fox); }
          const fl = win(T, T_HIT - 0.03, T_HIT2 + 0.2, 0.06); if (fl > 0.01) light(X, 1.4 * fl, 0x8fd8ff);
          if (cue(a, 'ring', T_RING)) { const c = anchor('hips', _f1); c.y += 0.16 * FOX_K; shock(c, 0.22, 1.05, 0.55, COL.fox, true); }                              // the ring as she spins them back (H4)
          if (cue(a, 'snip', tt(10.9))) { const p = anchor('bladeAm', _f1); burst(p, 14, 0.6, 0.4, 0.025, COL.foxPale, 0.3, 1.2, 0.2); }
        } });
    })();
  })();

  // ---------- round 3, continued: her ghost double, her foxfire fox, Blue Mischief and Borrowed Face ----------
  // Flipbook clips blue_mischief (22 frames at 6 a second, release on frame 16) and borrowed_face (22 frames, release on frame 10); paintings H5 to H8.
  // Her spells act toward her left (+x in her own space: screen right when she faces you), as on the sprite sheet; the host turns her so that is her target.

  // A ghost double (lore: "if a ghost 3D copy of any character in the game can be made, that is the direction"). It is her own meshes drawn a
  // second time on a second set of bones, in one see-through blue material, so it costs no new geometry and no textures, only the drawing while it shows.
  // Each frame it is live, a pose is worked out for it on her bones, copied across, and her own pose is then laid back over them (animate, 90_api.js).
  const GHOST = (function () {
    const g = new THREE.Group(); g.name = 'ghost'; g.visible = false; root.add(g);
    const map = new Map(), gb = skeleton.bones.map((b) => { const n = new THREE.Bone(); n.name = b.name; n.position.copy(b.position); n.quaternion.copy(b.quaternion); n.scale.copy(b.scale); map.set(b, n); return n; });
    skeleton.bones.forEach((b, i) => { const p = map.get(b.parent); (p || g).add(gb[i]); });
    const gs = new THREE.Skeleton(gb, skeleton.boneInverses);
    const mat = new THREE.ShaderMaterial({ skinning: true, transparent: true, depthWrite: true, side: THREE.DoubleSide,
      uniforms: { cA: { value: new THREE.Color(0.10, 0.30, 0.85) }, cB: { value: new THREE.Color(0.70, 0.92, 1.0) }, uOp: { value: 0 } },
      vertexShader: '#include <common>\n#include <skinning_pars_vertex>\nvarying vec3 vN; varying vec3 vV;\nvoid main() {\n#include <beginnormal_vertex>\n#include <skinbase_vertex>\n#include <skinnormal_vertex>\n#include <defaultnormal_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\n#include <project_vertex>\nvN = normalize(transformedNormal); vV = normalize(-mvPosition.xyz); }',
      fragmentShader: 'uniform vec3 cA; uniform vec3 cB; uniform float uOp; varying vec3 vN; varying vec3 vV;\nvoid main() { float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6); gl_FragColor = vec4(mix(cA, cB, f), uOp * (0.34 + 0.6 * f)); }' });
    for (const key in meshes) { if (key === 'lens' || !meshes[key].isSkinnedMesh) continue; const m = new THREE.SkinnedMesh(meshes[key].geometry, mat); m.name = 'ghost_' + key; m.frustumCulled = false; m.renderOrder = 6; g.add(m); m.bind(gs, new THREE.Matrix4()); }
    const P = clonePose(REST), api = { live: false, asked: false, P, group: g, mat,      // asked: a spell called show() this frame; if none did, it goes (a move cut short must not leave it standing there)
      // the host of a spell sets P (the double's pose), place (where it stands, in her space) and turn, then calls show(opacity) each frame it should be seen
      show(op, x, y, z, turn) { api.asked = true; api.live = op > 0.004; g.visible = api.live; mat.uniforms.uOp.value = op; g.position.set(x || 0, y || 0, z || 0); g.rotation.y = turn || 0; },
      pose() { poseQuiet = true; applyPose(P); poseQuiet = false; for (let i = 0; i < gb.length; i++) { const a = skeleton.bones[i], b = gb[i]; b.position.copy(a.position); b.quaternion.copy(a.quaternion); b.scale.copy(a.scale); } },
      hide() { api.live = false; g.visible = false; } };
    return api;
  })();

  // A fox made of foxfire: a handful of simple shapes in one glowing material. Its body is one unit long, nose toward +x, feet on y = 0.
  // stretch 0 is sitting or standing, 1 is at full leap. It is light, not a thing: it is never inked in the Flipbook look.
  const FOXFIRE = (function () {
    const mat = glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.FrontSide, uniforms: { cA: { value: new THREE.Color(0.10, 0.36, 1.0) }, cB: { value: new THREE.Color(0.50, 0.84, 1.0) }, uOp: { value: 1 } },
      vertexShader: 'varying vec3 vN; varying vec3 vV;\nvoid main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 cA; uniform vec3 cB; uniform float uOp; varying vec3 vN; varying vec3 vV;\nvoid main() { float d = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(mix(cA, cB, d * d), uOp * (0.10 + 0.42 * d)); }' }));      // kept dim: the shapes overlap and add up, and a white blob has no legs
    const g = new THREE.Group(); g.visible = false; g.renderOrder = 28; fx.add(g); fxAuto.push(g);
    const sph = new THREE.SphereGeometry(0.5, 14, 10), cone = new THREE.ConeGeometry(0.5, 1, 10);
    const add = (geo, par, px, py, pz, sx, sy, sz, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); if (rz) m.rotation.z = rz; m.renderOrder = 28; m.frustumCulled = false; (par || g).add(m); return m; };
    const piv = (x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); g.add(p); return p; };
    add(sph, null, 0, 0.42, 0, 0.58, 0.22, 0.19); add(sph, null, 0.28, 0.48, 0, 0.24, 0.24, 0.19); add(sph, null, 0.48, 0.64, 0, 0.27, 0.24, 0.23);       // body, chest, head
    add(cone, null, 0.68, 0.60, 0, 0.12, 0.22, 0.11, -PI / 2);                                                                                           // snout
    for (const s of [-1, 1]) { const e = add(cone, null, 0.44, 0.86, s * 0.085, 0.12, 0.28, 0.07); e.rotation.x = s * 0.30; }                           // ears
    const legs = []; for (const [x, f] of [[0.27, 1], [-0.27, -1]]) for (const s of [-1, 1]) { const p = piv(x, 0.40, s * 0.075); add(cone, p, 0, -0.20, 0, 0.12, 0.40, 0.12, PI); legs.push([p, f]); }
    const tail = piv(-0.26, 0.47, 0); add(sph, tail, -0.30, 0.03, 0, 0.62, 0.24, 0.24); add(sph, tail, -0.56, 0.04, 0, 0.22, 0.15, 0.15);       // a big brush, and its pale tip
    const _x = V3(), _y = V3(), _z = V3(), _m = new THREE.Matrix4();
    return { group: g, mat,
      // put it at p (world), nose along dir, len metres long
      place(p, dir, len, stretch, op, t) {
        g.visible = op > 0.01 && len > 0.001; if (!g.visible) return; mat.uniforms.uOp.value = op;
        _x.copy(dir).normalize(); _z.crossVectors(_x, _y.set(0, 1, 0)).normalize(); _y.crossVectors(_z, _x).normalize(); g.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z)); g.position.copy(p); g.scale.setScalar(len);
        for (const [pv, f] of legs) pv.rotation.z = f * (1.2 * stretch) + 0.10 * Math.sin(t * 9 + f); tail.rotation.z = -0.75 + 0.85 * stretch + 0.16 * Math.sin(t * 7);      // forelegs reach ahead and hind legs trail in the leap; sitting, the brush stands up tail.rotation.y = 0.25 * Math.sin(t * 5);
      } };
  })();

  (function foxSpells2() {
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr }), eD = (s) => [s * 0.7, -1, -0.2], K6 = (f, o) => Object.assign({ t: (f - 1) / 6 }, o), tt = (f) => (f - 1) / 6;
    const BELL = [-0.138, 1.381, 0.089], SHH = [0.075, 1.319, 0.171], COVER = [-0.056, 1.491, 0.155];                  // fingertip on her bell, fingertip on her lips, palm over her right eye (bench/contacts.js)
    const idleL = arm('L', [0.20, 0.99, 0.19], [1, -0.4, -0.3], FP.soft, 0.2, [0.3, 0]), idleR = arm('R', [-0.25, 1.00, 0.15], [-0.55, -0.1, -1], FP.relax, 0.2, [0.1, 0]);
    const _a = V3(), _b = V3(), _c = V3(), _d = V3(), _e = V3(), UPV = V3(0, 1, 0); let spinWas = 0;
    // where her target really is: her left, undoing whatever turn the move itself has given her
    const tdir = (out) => out.set(1, 0, 0).applyQuaternion(root.getWorldQuaternion(_qa)).applyAxisAngle(UPV, -spinWas);
    const flame = (p, n, size, up) => { for (let i = 0; i < n || (i === 0 && Math.random() < n); i++) emit(p.x + rs() * size, p.y + rs() * size, p.z + rs() * size, rs() * 0.08, (up || 0.25) * (0.5 + Math.random()), rs() * 0.08, 0.25 + Math.random() * 0.3, size * (0.5 + Math.random() * 0.6), Math.random() < 0.35 ? COL.foxPale : COL.fox, -0.2, 0.9); };

    // Blue Mischief. She flicks her bell; the spark it gives jumps to her fingertip; she turns her hand over and it grows into a little fox of
    // foxfire sitting on her palm; she turns, winds up and throws, and it leaps at her target, full-size by the time it lands.
    (function () {
      const keys = [], palm = (h) => arm('R', h, eD(-1), FP.open, 1.35, [-0.25, 0]), T_REL = tt(16), FLY = 0.42, T_HIT = T_REL + FLY, dur = 22 / 6;
      keys.push(K6(3.0, Object.assign({ hd: [0, 0.05, -0.08], sp: [0, 0, 0] }, arm('R', [BELL[0] - 0.028, BELL[1], BELL[2] + 0.004], [-1, -0.3, 0.3], FP.point, 0.6, [0.6, 0.4]), idleL)));
      keys.push(K6(3.6, { hR: BELL })); keys.push(K6(4.2, { hR: [BELL[0] - 0.03, BELL[1] + 0.004, BELL[2] + 0.005] }));                                         // ding
      keys.push(K6(5.6, Object.assign({ hd: [-0.14, -0.02, 0.10], mouth: 2 }, arm('R', [-0.17, 1.37, 0.22], eD(-1), FP.point, 0.2, [0.1, 0]), idleL)));             // the spark on her fingertip
      keys.push(K6(6.8, Object.assign({ hd: [-0.14, -0.02, 0.10] }, arm('R', [-0.17, 1.37, 0.22], eD(-1), FP.point, 0.2, [0.1, 0.2]))));
      keys.push(K6(8.6, Object.assign({ hd: [-0.10, 0.12, 0.08], sp: [0, 0.03, 0] }, palm([-0.20, 1.14, 0.27]), idleL)));                                            // her hand turns over: a little fox on her palm
      keys.push(K6(10.4, Object.assign({ hd: [-0.08, 0.10, -0.10] }, palm([-0.19, 1.17, 0.27]))));
      keys.push(K6(11.6, Object.assign({ hd: [0.10, 0.02, 0.06], sp: [0, 0, 0] }, palm([-0.20, 1.15, 0.27]), stand())));
      keys.push(K6(14.2, Object.assign({ hd: [0.15, 0, 0], sp: [-0.32, 0.06, 0], hip: [-0.02, -0.07, -0.04], ftL: [0.04, 0, 0.16, 0.2, 0], knL: [0.2, 0, 1], ftR: 'rest', knR: [-0.3, 0, 1] },      // she turns to her target and winds up
        arm('R', [-0.38, 1.00, -0.10], [-0.6, -0.2, -1], FP.cup, 1.2, [-0.3, 0]), arm('L', [0.22, 1.16, 0.26], eD(1), FP.soft, 0.6, [0, 0]))));
      keys.push(K6(15.0, { sp: [-0.34, 0.06, 0] }));
      keys.push(K6(16.0, Object.assign({ hd: [0, 0.02, 0], sp: [0.22, 0.14, 0], hip: [0.02, -0.10, 0.10], ftL: [0.05, 0, 0.26, 0.2, 0], knL: [0.25, 0, 1], ftR: [-0.02, 0.03, -0.08, -0.3, 0.3], knR: [-0.3, 0, 1], mouth: 1 },   // and throws
        arm('R', [-0.06, 1.27, 0.44], [-1, -0.5, -0.3], FP.open, 0.5, [-0.3, 0]), arm('L', [0.30, 1.02, -0.02], [0.5, -0.4, -1], FP.soft, 0.4, [0, 0]))));
      keys.push(K6(17.6, Object.assign({ sp: [0.24, 0.15, 0], mouth: 2 }, arm('R', [-0.02, 1.20, 0.45], [-1, -0.5, -0.3], FP.open, 0.5, [0.2, 0]))));
      keys.push(K6(20.0, Object.assign({ hd: [0.05, 0, 0.10], sp: [0, 0, 0], mouth: 2 }, stand(), arm('R', [-0.22, 1.05, 0.20], eD(-1), FP.soft, 0.6, [0, 0]), idleL)));
      const spin = [[0, 0], [tt(11.4), 0], [tt(14.0), 1.25], [tt(18.2), 1.25], [tt(20.6), 0], [dur, 0]];
      let p0 = V3(), p1 = V3(), flew = false;
      defAction('blue_mischief', dur, keys, { outro: 0.3, stand: true, spin, hits: [T_HIT / dur], cues: [tt(3.6) / dur, T_REL / dur], impact: 0.8,
        start() { flew = false; },
        fx(a, t, dt) {
          const T = a.t, td = tdir(_e); spinWas = spinNow;
          if (cue(a, 'ding', tt(3.6))) { const p = anchor('tipR', _a); burst(p, 10, 0.5, 0.35, 0.02, COL.foxPale, 0.2, 1.2, 0.2); }
          if (T > tt(3.6) && T < tt(8.2)) { const p = anchor('tipR', _a), k = sm(tt(3.6), tt(5.6), T); flame(p, 2.2 * k * dt * 60 / 2, 0.012, 0.12); light(p, 0.5 * k, 0x66c8ff); }       // the spark on her fingertip
          if (T >= tt(7.6) && T < T_REL) {                                                                                                                                           // the little fox on her palm
            const p = anchor('handR', _a), grow = sm(tt(7.6), tt(9.6), T), len = 0.17 * (grow + 0.18 * Math.sin(Math.min(1, grow) * PI) ), wind = sm(tt(11.6), tt(14.2), T);
            p.y += 0.012 * FOX_K; _b.copy(td).applyAxisAngle(UPV, 0.5 * Math.sin(T * 2.4) * (1 - wind)); FOXFIRE.place(p, _b, len * FOX_K, 0.1 * wind, 0.95, t);
            flame(_c.copy(p).addScaledVector(UPV, 0.09 * grow), 1.6 * grow * dt * 60 / 2, 0.03, 0.18); light(p, 0.8 * grow, 0x66c8ff);
          }
          if (cue(a, 'throw', T_REL)) { anchor('handR', p0); p1.copy(anchor('chest', _a)).addScaledVector(td, 2.6 * tgtK); p1.y = p0.y - 0.25 * FOX_K; fxHitP.copy(p1); flew = true; burst(p0, 16, 1.0, 0.4, 0.03, COL.fox, 0.2, 1.2, 0.3); }
          if (flew && T >= T_REL && T < T_HIT + 0.12) {                                                                                                                             // the leap: it grows as it goes
            const u = cl((T - T_REL) / FLY, 0, 1), e = u * u * (3 - 2 * u), h = 0.55 * FOX_K, len = lerp(0.17, 0.95, e) * FOX_K;
            _a.lerpVectors(p0, p1, u); _a.y += h * 4 * u * (1 - u) - 0.42 * len * 0.5; _b.subVectors(p1, p0).normalize(); _b.y += (1 - 2 * u) * 0.9; _b.normalize();
            FOXFIRE.place(_a, _b, len, Math.sin(PI * Math.min(1, u * 1.1)), 1 - sm(0.98, 1.12, (T - T_REL) / FLY), t);
            _c.copy(_a).addScaledVector(UPV, 0.4 * len); flame(_c, 7 * dt * 60 / 2, 0.10 * len + 0.02, 0.2); light(_c, 1.3, 0x66c8ff);
          }
          if (cue(a, 'hit', T_HIT)) { burst(p1, 90, 2.6, 0.7, 0.05, COL.fox, 0.6, 1.3, 0.5); burst(p1, 40, 1.4, 0.9, 0.04, COL.foxPale, 0.3, 1.1, 0.8); shock(p1, 0.08, 0.7, 0.4, COL.foxPale); }
          const fl = win(T, T_HIT - 0.02, T_HIT + 0.35, 0.05); if (fl > 0.01) light(p1, 1.8 * fl, 0x8fd8ff);
        } });
      function stand() { return { hip: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest' }; }
    })();

    // Borrowed Face. She covers one eye; a ghost double of her steps out of her left side, toward whoever is watching her, and makes them a
    // deep mocking bow; behind it she leans away with a finger to her lips. The double is what they will look at now.
    (function () {
      const keys = [], dur = 22 / 6, T_OUT = tt(6.0), T_IN = tt(10), T_FADE = tt(19.5), gp = clonePose(REST), held = clonePose(REST), CUR = ACTS.bow;      // the double's bow is the Jester's bow she keeps: in H8 it is a deep, sweeping, mocking one
      const cover = arm('R', COVER, eD(-1), FP.soft, 0.9, [0.3, 0.2]);
      keys.push(K6(3.8, Object.assign({ hd: [0.08, 0.02, -0.10], sp: [0, 0, 0.02], mouth: 2 }, cover, idleL)));                                  // one eye covered
      keys.push(K6(6.4, Object.assign({ hd: [0.08, 0.02, -0.11], sp: [0, 0, 0.02] }, cover, idleL)));
      keys.push(K6(8.2, Object.assign({ hd: [-0.10, 0, -0.06], sp: [0.06, 0.03, 0.04], hip: [-0.03, -0.02, 0] }, arm('R', [-0.24, 1.16, 0.20], eD(-1), FP.soft, 0.6, [0, 0]), idleL)));   // she lets it go, and looks at what she has made
      keys.push(K6(10.6, Object.assign({ hd: [0.04, -0.02, 0.08], sp: [0, 0.10, 0], hip: [-0.05, -0.05, -0.02], eyes: 0.5 }, arm('L', SHH, [0.8, -1, -0.2], FP.point, 0.4, [0.1, 0]), idleR)));   // behind it: shh
      keys.push(K6(17.6, Object.assign({ hd: [0.04, -0.02, 0.08], sp: [0, 0.10, 0], hip: [-0.05, -0.05, -0.02], eyes: 0.5 }, arm('L', SHH, [0.8, -1, -0.2], FP.point, 0.4, [0.1, 0]), idleR)));
      keys.push(K6(20.2, Object.assign({ hd: [0, 0, 0.08], sp: [0, 0, 0], hip: [0, 0, 0], eyes: 0, mouth: 2 }, idleL, idleR)));
      defAction('borrowed_face', dur, keys, { outro: 0.3, stand: true, hits: [T_IN / dur], cues: [T_OUT / dur], impact: 0.3,
        start() { GHOST.hide(); }, end() { GHOST.hide(); },
        fx(a, t, dt) {
          const T = a.t;
          if (T > tt(2.4) && T < T_OUT + 0.3) { const p = anchor('head', _a), k = win(T, tt(2.4), T_OUT + 0.3, 0.25); flame(_b.set(p.x + rs() * 0.16, p.y - 0.35 * FOX_K * Math.random(), p.z + rs() * 0.12), 3.5 * k * dt * 60 / 2, 0.02, 0.3); light(p, 0.7 * k, 0x66c8ff); }
          if (T >= T_OUT && T < T_FADE + 0.5) {
            // the double starts as she is, covering her eye, and by the time it stands clear of her it is into its bow
            const u = sm(T_OUT, T_IN, T), w = sm(T_OUT + 0.1, T_IN - 0.1, T), op = sm(T_OUT, T_OUT + 0.35, T) * (1 - sm(T_FADE, T_FADE + 0.5, T));
            if (u < 0.02) for (const k of CHANS) { const x = cur[k]; if (typeof x === 'number') held[k] = x; else for (let i = 0; i < x.length; i++) held[k][i] = x[i]; }
            evalPose(CUR.tracks, cl((T - T_IN + 0.45) * 1.25, 0, CUR.dur - 0.45), gp); blendPose(GHOST.P, held, gp, w); GHOST.P.eyes = 0; GHOST.P.mouth = 2;
            GHOST.show(op, 0.82 * u, 0.02 * Math.sin(u * PI), 0.10 * u, 0.95 * u);
            if (op > 0.05 && Math.random() < 20 * dt) { _a.set(0.82 * u + rs() * 0.25, (0.3 + Math.random() * 1.3), 0.10 * u + rs() * 0.2); root.localToWorld(_a); emit(_a.x, _a.y, _a.z, rs() * 0.04, 0.08 + Math.random() * 0.1, rs() * 0.04, 0.5 + Math.random() * 0.4, 0.028, COL.foxPale, -0.05, 0.6); }
          } else GHOST.hide();
          if (cue(a, 'out', T_OUT)) { const p = anchor('chest', _a); burst(p, 30, 0.9, 0.6, 0.03, COL.fox, 0.1, 1.2, 0.4); }
          if (T < T_IN) { fxHitP.set(0.82, 1.05, 0.10); root.localToWorld(fxHitP); }
          if (cue(a, 'in', T_IN)) { _a.set(0.82, 0.02, 0.10); root.localToWorld(_a); shock(_a, 0.15, 0.7, 0.5, COL.fox, true); }
        } });
    })();
  })();

  // ---------- round 3, the last three: Same Cloth, Slip Stitch and Crazy Quilt ----------
  // New spells from her lore (no flipbook clips, so the timing is ours). Paintings H9 to H13, and her magic set: I4 (thread and stitches),
  // I6 (the cut in the air), I7 (patches of other places), I8 (the ghost double).
  // What this file adds for any spell to use: RIB (glowing thread), the place patches, SLIT (a cut in the air with other places behind it and a
  // needle to sew it shut), EGHOST (a ghost copy of whatever she is aiming at), QUILT (a quilt of light), and tipOf (any fingertip).
  let foxAway = false, foxAwayAsk = false, tgtObj = null;          // away: she has gone through a cut and is not to be drawn (a spell asks each frame; animate, 90_api.js)

  // any fingertip: S 'R' or 'L', i 0 thumb, 1 first finger ... 4 little finger
  const tipOf = (function () {
    const rest = { R: [], L: [] }, td = V3(THUMB.dir[0], THUMB.dir[1], THUMB.dir[2]).normalize(), TLEN = THUMB.len[0] + THUMB.len[1] + THUMB.len[2];
    for (const S of ['R', 'L']) { const s = S === 'R' ? -1 : 1;
      rest[S].push(['thb2' + S, handPt(s, THUMB.base[0] + td.x * TLEN, THUMB.base[1] + td.y * TLEN, THUMB.base[2] + td.z * TLEN)]);
      for (const F of FINGERS) rest[S].push([F[0] + '2' + S, handPt(s, 0, F[2] - F[3], F[1] + F[3] * Math.sin(F[5]))]); }
    return (S, i, out) => { const e = rest[S][i], B = SK[e[0]], r = B.userData.rest; return out.set(e[1].x - r.x, e[1].y - r.y, e[1].z - r.z).applyMatrix4(B.matrixWorld); };
  })();

  // Her thread (painting I4): a ribbon of light that always faces the eye, its colour running blue, teal, violet, rose, gold along its length.
  // All the threads of a frame are one mesh. A spell calls RIB.begin() once a frame, then RIB.path(...) for each thread it wants that frame.
  const RIB = (function () {
    const MAXR = 26, NS = 20, NP = NS + 1, NV = MAXR * NP * 2, pos = new Float32Array(NV * 3), dir = new Float32Array(NV * 3), sw = new Float32Array(NV * 2), col = new Float32Array(NV * 4), idx = [];
    for (let r = 0; r < MAXR; r++) for (let i = 0; i < NS; i++) { const a = (r * NP + i) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new THREE.BufferGeometry(), A = (arr, n) => { const b = new THREE.BufferAttribute(arr, n); b.setUsage(THREE.DynamicDrawUsage); return b; };
    geo.setAttribute('position', A(pos, 3)); geo.setAttribute('aDir', A(dir, 3)); geo.setAttribute('aSW', A(sw, 2)); geo.setAttribute('aCol', A(col, 4)); geo.setIndex(idx); geo.setDrawRange(0, 0);
    const mat = glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uVH: { value: 800 } },
      vertexShader: `attribute vec3 aDir; attribute vec2 aSW; attribute vec4 aCol; uniform float uVH; varying vec4 vC; varying float vS;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 d = normalize((modelViewMatrix * vec4(aDir, 0.0)).xyz); vec3 n = cross(d, normalize(mv.xyz)); float l = length(n); n = l > 1e-4 ? n / l : vec3(1.0, 0.0, 0.0);
  float px = -mv.z * 2.0 / (projectionMatrix[1][1] * uVH); float w = max(aSW.y, 0.75 * px); mv.xyz += n * aSW.x * w; gl_Position = projectionMatrix * mv; vC = aCol; vC.a *= min(1.0, aSW.y / (0.75 * px) + 0.35); vS = aSW.x; }`,
      fragmentShader: `varying vec4 vC; varying float vS;
void main() { float c = 1.0 - abs(vS); vec3 k = mix(vC.rgb, vec3(1.0), 0.4 * c * c); gl_FragColor = vec4(k * vC.a * (0.22 + 0.78 * c), 1.0); }` }), true);
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 29; mesh.visible = false; fx.add(mesh); fxAuto.push(mesh);
    const _d2 = new THREE.Vector2();
    const eye = V3(); let seen = false;             // where the picture was last taken from: a spell may turn a flat thing to face whoever is looking
    mesh.onBeforeRender = (r, sc, cam) => { const rt = r.getRenderTarget(); if (rt) mat.uniforms.uVH.value = rt.height; else { r.getDrawingBufferSize(_d2); mat.uniforms.uVH.value = _d2.y; } mat.uniformsNeedUpdate = true; if (cam) { eye.setFromMatrixPosition(cam.matrixWorld); seen = true; } };
    const TH = [[0.25, 0.62, 1.0], [0.20, 0.90, 0.85], [0.62, 0.42, 1.0], [1.0, 0.45, 0.72], [1.0, 0.80, 0.38]], pts = [], _t = V3(), c3 = [0, 0, 0]; for (let i = 0; i < NP; i++) pts.push(V3());
    const thCol = (u, out) => { const x = (((u % 1) + 1) % 1) * 5, i = Math.floor(x) % 5, f = x - Math.floor(x), a = TH[i], b = TH[(i + 1) % 5]; out[0] = lerp(a[0], b[0], f); out[1] = lerp(a[1], b[1], f); out[2] = lerp(a[2], b[2], f); return out; };
    let n = 0;
    return { thCol, eye, get seen() { return seen; },
      begin() { n = 0; geo.setDrawRange(0, 0); },
      // fn(u, out) gives the thread's path for u from 0 to 1. width in metres. hue: where on her colours it starts; span: how much of them it runs through.
      // ends: 0 as it is, 1 both ends fade and thin, 2 its start fades (a tail), 3 its end fades
      path(fn, width, alpha, hue, span, ends) {
        if (n >= MAXR || alpha <= 0.004) return; const r = n++;
        for (let i = 0; i < NP; i++) fn(i / NS, pts[i]);
        for (let i = 0; i < NP; i++) {
          _t.subVectors(pts[Math.min(NS, i + 1)], pts[Math.max(0, i - 1)]); if (_t.lengthSq() < 1e-12) _t.set(0, 1, 0); else _t.normalize();
          const u = i / NS, k = ends === 1 ? Math.sin(PI * u) : ends === 2 ? u : ends === 3 ? 1 - u : 1, ak = alpha * (ends ? Math.pow(k, 0.6) : 1), p = pts[i]; thCol((hue || 0) + (span === undefined ? 1 : span) * u, c3);
          for (let s = 0; s < 2; s++) { const v = (r * NP + i) * 2 + s; pos[v * 3] = p.x; pos[v * 3 + 1] = p.y; pos[v * 3 + 2] = p.z; dir[v * 3] = _t.x; dir[v * 3 + 1] = _t.y; dir[v * 3 + 2] = _t.z;
            sw[v * 2] = s ? 1 : -1; sw[v * 2 + 1] = width * (ends ? 0.45 + 0.55 * k : 1); col[v * 4] = c3[0]; col[v * 4 + 1] = c3[1]; col[v * 4 + 2] = c3[2]; col[v * 4 + 3] = ak; }
        }
        for (const a of ['position', 'aDir', 'aSW', 'aCol']) geo.attributes[a].needsUpdate = true;
        geo.setDrawRange(0, n * NS * 6); mesh.visible = true;
      } };
  })();

  // The patches of other places (painting I7): six squares in one small picture, three across and two down. Until it has loaded (or if her
  // paintings were not given), each place is a plain colour. placeCol picks a place and a turn for each square of a grid.
  const PLACES = (function () {
    const blank = new THREE.DataTexture(new Uint8Array([40, 60, 140, 255]), 1, 1, THREE.RGBAFormat); blank.needsUpdate = true;
    const u = { tP: { value: blank }, uHas: { value: 0 } };
    onBaked('places', (img) => { const t = new THREE.Texture(img); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; u.tP.value = t; u.uHas.value = 1; });
    const glsl = `uniform sampler2D tP; uniform float uHas; uniform float uOrd; uniform float uDash; uniform float uSeam;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec3 placeCol(vec2 q, float sh, out float seam) {
  vec2 id = floor(q), f = fract(q); float h = h21(id + sh * 7.13), k = floor(h21(id * 1.7 + 3.1 + sh * 3.7) * 5.999), r = floor(h * 3.999);
  vec2 g = f - 0.5; if (r > 2.5) g = vec2(-g.y, g.x); else if (r > 1.5) g = -g; else if (r > 0.5) g = vec2(g.y, -g.x); g = g * 0.96 + 0.5;
  k = mix(k, mod(id.x + 3.0 * mod(id.y, 2.0), 6.0), uOrd * step(sh, 0.5));
  vec2 cell = vec2(mod(k, 3.0), floor(k / 3.0));
  vec3 c = texture2D(tP, vec2((cell.x + g.x) / 3.0, (1.0 - cell.y + g.y) / 2.0)).rgb;
  vec3 pc = 0.55 + 0.45 * cos(6.2832 * (k / 6.0 + vec3(0.0, 0.33, 0.67))); pc *= 0.75 + 0.25 * step(0.5, fract((g.x + g.y) * 4.0));
  c = mix(pc, c, uHas);
  float ex = min(f.x, 1.0 - f.x), ey = min(f.y, 1.0 - f.y), al = ex < ey ? f.y : f.x;
  seam = smoothstep(uSeam, uSeam * 0.4, min(ex, ey)) * step(0.4, fract(al * uDash));
  return c; }
`;
    return { u, glsl };
  })();

  // The cut in the air (painting I6). A tall slit standing in the world: a line of light while it is being cut, a pointed opening with patches
  // of other places behind it once an edge is lifted, and big even stitches where a needle has sewn it shut again, from the top down.
  // The patches are a solid surface, so whoever steps in behind the lifted edge is hidden by it, as behind a tent flap.
  const SLIT = (function () {
    const NR = 56, H = 1.94, Y0 = 0.02, W = 0.38, BW = 0.07, g = new THREE.Group(); g.visible = false; fx.add(g); fxAuto.push(g);
    const U = { uOpen: { value: 0 }, uFlap: { value: 0 }, uSew: { value: 0 }, uCut: { value: 0 }, uH: { value: H }, uW: { value: W }, uBW: { value: BW }, uOp: { value: 1 }, uT: { value: 0 }, uFv: { value: 0.6 }, tP: PLACES.u.tP, uHas: PLACES.u.uHas, uOrd: { value: 0 }, uDash: { value: 9 }, uSeam: { value: 0.034 } };
    const SHAPE = `uniform float uOpen; uniform float uFlap; uniform float uSew; uniform float uH; uniform float uW; uniform float uFv;
float halfW(float v, float s) { float top = max(1.0 - uSew, 0.001), x = clamp(v / top, 0.0, 1.0);
  float w = uW * uOpen * sqrt(top) * pow(max(sin(3.14159 * x), 0.0), 0.30) * step(v, top);
  if (s < 0.0) w *= 1.0 + uFlap * exp(-pow((v - uFv) / 0.22, 2.0));
  return w; }
`;
    const lp = [], li = [], bp = [], bi = [];
    for (let r = 0; r <= NR; r++) { lp.push(-1, r / NR, 0, 1, r / NR, 0); if (r < NR) { const a = r * 2; li.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    for (const s of [-1, 1]) { const o = bp.length / 3; for (let r = 0; r <= NR; r++) { bp.push(s, r / NR, 0, s, r / NR, 1); if (r < NR) { const a = o + r * 2; bi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } } }
    const mk = (p, i) => { const q = new THREE.BufferGeometry(); q.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); q.setIndex(i); return q; };
    const leaf = new THREE.Mesh(mk(lp, li), new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: U,
      vertexShader: SHAPE + `varying vec2 vQ; varying float vS;
void main() { float w = halfW(position.y, position.x); vec3 p = vec3(position.x * w, position.y * uH, 0.0); vQ = p.xy; vS = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: PLACES.glsl + `varying vec2 vQ; varying float vS;
void main() { float seam; vec2 q = mat2(0.98, -0.2, 0.2, 0.98) * vQ / 0.36 + vec2(3.3, 1.7); vec3 c = placeCol(q, 0.0, seam); c = mix(c, vec3(1.0, 0.93, 0.72), seam * 0.9); c *= 0.70 + 0.30 * (1.0 - vS * vS); gl_FragColor = vec4(c, 1.0); }` }));
    const band = new THREE.Mesh(mk(bp, bi), glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: U,
      vertexShader: SHAPE + `uniform float uBW; varying float vV; varying float vO; varying float vS;
void main() { float v = position.y, s = position.x, w = halfW(v, s), bw = uBW * (v > 1.0 - uSew ? 1.3 : 0.45 + 0.55 * uOpen); vec3 p = vec3(s * (w + (position.z * 1.4 - 0.4) * bw), v * uH, 0.004); vV = v; vO = position.z; vS = s; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `uniform float uCut; uniform float uSew; uniform float uT; uniform float uOp; uniform float uH; varying float vV; varying float vO; varying float vS;
void main() { if (vV < 1.0 - uCut) discard;
  float d = abs(vO - 0.2857) / 0.7143, fray = 0.5 + 0.5 * sin(vV * uH * 90.0 + vS * 2.0 + uT * 3.0) * sin(vV * uH * 37.0 - uT * 5.0);
  float a = pow(1.0 - clamp(d, 0.0, 1.0), 1.2 + 7.0 * (1.0 - fray));
  vec3 c = mix(vec3(0.22, 0.52, 1.0), vec3(0.92, 0.97, 1.0), a * a), tipc = 0.6 + 0.4 * cos(6.2832 * (fract(vV * 3.0 + uT * 0.2) + vec3(0.0, 0.33, 0.67)));
  c = mix(tipc, c, smoothstep(0.0, 0.5, a));
  float sewn = step(1.0 - uSew, vV), st = step(0.5, fract(vV * uH / 0.12)); a *= mix(1.0, 0.18 + 0.82 * st, sewn);
  float head = exp(-pow((vV - (1.0 - uCut)) * uH / 0.10, 2.0)), ends = smoothstep(0.0, 0.03, vV) * smoothstep(1.0, 0.97, vV);
  gl_FragColor = vec4(c * a * uOp * ends * (1.0 + 1.5 * head), 1.0); }` }), true));
    leaf.frustumCulled = band.frustumCulled = false; leaf.renderOrder = 5; band.renderOrder = 28; g.add(leaf, band);
    // the needle (painting I4): a sliver of white light with an eye
    const nd = new THREE.Group(), nm = glowOnly(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, opacity: 1 }));
    { const a = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.13, 8), nm); a.position.y = 0.065; const b = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.05, 8), nm); b.rotation.x = PI; b.position.y = -0.025; const e = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.003, 6, 14), nm); e.position.y = -0.045; nd.add(a, b, e); }
    nd.visible = false; nd.renderOrder = 29; fx.add(nd); fxAuto.push(nd);
    const _x = V3(), _y = V3(0, 1, 0), _z = V3(), _m = new THREE.Matrix4(), _n = V3(), S = { cut: 0, open: 0, flap: 0, sew: 0, fv: 0.6 };
    const hw = (v, s) => { const top = Math.max(1 - S.sew, 0.001), x = cl(v / top, 0, 1); let w = v <= top ? W * S.open * Math.sqrt(top) * Math.pow(Math.max(Math.sin(PI * x), 0), 0.30) : 0; if (s < 0) w *= 1 + S.flap * Math.exp(-Math.pow((v - S.fv) / 0.22, 2)); return w; };
    return { H, Y0, W, group: g, S,
      // stand it at foot (a point on the ground, world), its face turned to n, its width running along r
      place(foot, r, n) { _x.copy(r).normalize(); _z.copy(n).normalize(); g.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z)); g.position.copy(foot); g.position.y += Y0; g.updateMatrixWorld(true); },
      // cut: how much of its height is cut, from the top down; open: how far it gapes; flap: how much further its near edge is lifted; sew: how much is sewn shut, from the top down
      show(cut, open, flap, sew, op, t) { S.cut = cut; S.open = open; S.flap = flap; S.sew = sew; U.uCut.value = cut; U.uOpen.value = open; U.uFlap.value = flap; U.uSew.value = sew; U.uOp.value = op; U.uT.value = t; g.visible = op > 0.004 && cut > 0.001; leaf.visible = open > 0.004; },
      // a point of it in the world: v its height (0 foot, 1 top), s -1 its near edge, 1 its far edge, 0 the line between
      pt(v, s, out) { return out.set(s * hw(v, s), v * H, 0.004).applyMatrix4(g.matrixWorld); },
      // how far the near edge must be lifted for it to pass through a point (world) at its own height: for a hand that holds it
      flapFor(p) { _n.copy(p); g.worldToLocal(_n); const v = cl(_n.y / H, 0.05, 0.95), w0 = hw(v, 1); S.fv = v; U.uFv.value = v; return w0 > 0.01 ? cl(-_n.x / w0 - 1, 0, 1.6) : 0; },
      needle(p, d, op) { nd.visible = op > 0.01; if (!nd.visible) return; nm.opacity = op; nd.position.copy(p); nd.quaternion.setFromUnitVectors(_y, _n.copy(d).normalize()); } };
  })();

  // A ghost copy of an enemy (painting I8, and the lore: "a ghost 3D copy of any character in the game"). The host hands her what she is aiming
  // at (fox.target = an Object3D); its meshes are drawn a second time in see-through blue with seams of light. If it gave her nothing, a plain
  // cloth doll on a post stands in. It can be unravelled from the top down.
  const EGHOST = (function () {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); g.visible = false; fx.add(g); fxAuto.push(g);
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: true, side: THREE.DoubleSide,
      uniforms: { cA: { value: new THREE.Color(0.10, 0.30, 0.85) }, cB: { value: new THREE.Color(0.70, 0.92, 1.0) }, uOp: { value: 0 }, uTop: { value: 99 }, uT: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vW; varying vec3 vL;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vL = position; vec4 mv = viewMatrix * w; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 cA; uniform vec3 cB; uniform float uOp; uniform float uTop; uniform float uT; varying vec3 vN; varying vec3 vV; varying vec3 vW; varying vec3 vL;
void main() { float n = sin(vW.x * 53.0 + uT * 7.0) * sin(vW.z * 47.0 - uT * 5.0) * 0.04; if (vW.y > uTop + n) discard;
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
  float seam = smoothstep(0.014, 0.005, abs(fract(vW.y / 0.31 + 0.5) - 0.5) * 0.31) * step(0.5, fract(atan(vL.x, vL.z) * 3.8));
  float edge = smoothstep(0.06, 0.0, uTop + n - vW.y); float k = max(f, max(seam * 0.9, edge));
  gl_FragColor = vec4(mix(cA, cB, k) + vec3(0.5, 0.7, 0.9) * edge, uOp * (0.34 + 0.6 * k)); }` });
    const box = new THREE.Box3(), _s = V3(), _s2 = V3(), _iv = new THREE.Matrix4(), NBIN = 44, MARG = 0.11, raw = new Float32Array(NBIN), prof = new Float32Array(NBIN); let yLo = -MARG, yHi = 1.8;
    const wAt = (y) => { const f = cl((y - yLo) / (yHi - yLo), 0, 1) * (NBIN - 1), i = Math.floor(f); return lerp(prof[i], prof[Math.min(NBIN - 1, i + 1)], f - i); };
    // How wide it is at each height, as seen from any side (its widest reach from its own middle), a hand's breadth added: the line she cuts round it.
    // Read off its triangles, a few thousand at most, walking down their edges so that a tall plain post still counts all the way up.
    function measure() {
      raw.fill(0); yHi = api.h + MARG; _iv.copy(inner.matrixWorld).invert(); const put = (p) => { const b = Math.floor((p.y - yLo) / (yHi - yLo) * NBIN); if (b >= 0 && b < NBIN) raw[b] = Math.max(raw[b], Math.hypot(p.x, p.z)); }, tri = [V3(), V3(), V3()];
      inner.traverse((o) => { if (!o.isMesh || !o.visible || !o.geometry || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position, ix = o.geometry.index, nt = Math.floor((ix ? ix.count : pa.count) / 3), st = Math.max(1, Math.floor(nt / 2500));
        for (let t = 0; t < nt; t += st) { for (let k = 0; k < 3; k++) tri[k].fromBufferAttribute(pa, ix ? ix.getX(t * 3 + k) : t * 3 + k).applyMatrix4(o.matrixWorld).applyMatrix4(_iv);
          for (let k = 0; k < 3; k++) { const a = tri[k], b = tri[(k + 1) % 3], n = Math.min(24, 1 + Math.ceil(Math.abs(a.y - b.y) / (yHi - yLo) * NBIN)); for (let i = 0; i <= n; i++) put(_s2.lerpVectors(a, b, i / n)); } } });
      const bh = (yHi - yLo) / (NBIN - 1), R = Math.ceil(MARG / bh);
      for (let i = 0; i < NBIN; i++) { let m = 0; for (let j = Math.max(0, i - R); j <= Math.min(NBIN - 1, i + R); j++) if (raw[j] > 0) { const dy = (i - j) * bh; if (Math.abs(dy) <= MARG) m = Math.max(m, raw[j] + Math.sqrt(MARG * MARG - dy * dy)); } prof[i] = m; }
      for (let pass = 0; pass < 2; pass++) { let prev = prof[0]; for (let i = 1; i < NBIN - 1; i++) { const c = prof[i]; prof[i] = 0.25 * prev + 0.5 * c + 0.25 * prof[i + 1]; prev = c; } }
    }
    const api = { group: g, mat, h: 1.65, w: 0.4, src: null, made: null,
      // its cut-out edge: u from 0 to 1 goes once round, from the top down one side, along the ground and up the other; gives [how far across, how high]
      edge(u, out) { u = ((u % 1) + 1) % 1; const side = u < 0.5 ? 1 : -1, v = u < 0.5 ? u * 2 : (1 - u) * 2, y = lerp(yHi, 0.012, v); out[0] = side * wAt(y); out[1] = y; return out; },
      // make it from what she aims at, or the stand-in
      from(obj) {
        if (api.made === (obj || 'doll')) return; api.made = obj || 'doll'; while (inner.children.length) inner.remove(inner.children[0]);
        let c;
        if (obj) { c = obj.clone(true); c.position.set(0, 0, 0); c.quaternion.identity(); c.scale.set(1, 1, 1); c.visible = true; c.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh) { o.material = mat; o.visible = true; o.castShadow = false; o.receiveShadow = false; o.renderOrder = 6; } else if (o.isMesh || o.isLine || o.isPoints || o.isSprite || o.isLight) o.visible = false; }); }
        else { c = new THREE.Group(); const add = (geo, x, y, z, sx, sy, sz, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); if (rz) m.rotation.z = rz; m.renderOrder = 6; c.add(m); }, sph = new THREE.SphereGeometry(1, 20, 14), cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
          add(cyl, 0, 0.035, 0, 0.26, 0.07, 0.26); add(cyl, 0, 0.45, 0, 0.04, 0.80, 0.04); add(sph, 0, 1.10, 0, 0.19, 0.30, 0.15); add(cyl, 0, 1.27, 0, 0.06, 0.80, 0.06, PI / 2); add(sph, 0, 1.53, 0, 0.115, 0.125, 0.115); }
        inner.add(c); g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.updateMatrixWorld(true); box.setFromObject(inner); _s.copy(box.max).applyMatrix4(_iv.copy(inner.matrixWorld).invert()); api.h = Math.max(0.5, _s.y); box.getSize(_s); api.w = Math.max(0.2, Math.max(_s.x, _s.z) * 0.5); measure();
      },
      // p: where its foot is (world); yaw: its own turn; tiltX, tiltZ: its lean; top: everything above this height (world) has unravelled
      show(op, p, yaw, tiltX, tiltZ, top, t) { g.visible = op > 0.004; if (!g.visible) return; mat.uniforms.uOp.value = op; mat.uniforms.uTop.value = top === undefined ? 99 : top; mat.uniforms.uT.value = t || 0; g.position.copy(p); g.rotation.set(tiltX || 0, yaw || 0, tiltZ || 0, 'YXZ'); g.updateMatrixWorld(true); } };
    return api;
  })();

  // A quilt of light (paintings H13 and I7): big squares of other places joined by bright stitches, some sewn in sideways or upside down.
  // It is cloth worked out afresh each frame: it leaves her two hands far end first, billows, and when she lets go it settles over her target.
  const QUILT = (function () {
    const NA = 30, NB = 18, NV = (NA + 1) * (NB + 1), pos = new Float32Array(NV * 3), uv = new Float32Array(NV * 2), idx = [];
    for (let i = 0; i <= NA; i++) for (let j = 0; j <= NB; j++) { const v = i * (NB + 1) + j; uv[v * 2] = i / NA; uv[v * 2 + 1] = j / NB * 2 - 1; if (i < NA && j < NB) idx.push(v, v + NB + 1, v + 1, v + 1, v + NB + 1, v + NB + 2); }
    const geo = new THREE.BufferGeometry(), pa = new THREE.BufferAttribute(pos, 3); pa.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('position', pa); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
    const U = { uOp: { value: 0 }, uT: { value: 0 }, uCrazy: { value: 0 }, uL: { value: 3 }, uWd: { value: 2.1 }, tP: PLACES.u.tP, uHas: PLACES.u.uHas, uOrd: { value: 1 }, uDash: { value: 24 }, uSeam: { value: 0.016 } };      // uOrd: each of the six places once, in order, until the squares start changing places
    const mat = glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: U,
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: PLACES.glsl + `uniform float uOp; uniform float uT; uniform float uCrazy; uniform float uL; uniform float uWd; varying vec2 vUv;
void main() { vec2 m = vec2(vUv.x * uL, (vUv.y * 0.5 + 0.5) * uWd), q = m / 1.05; float sh = uCrazy * floor(uT * 2.4 + h21(floor(q) + 9.0) * 4.0), seam; vec3 c = placeCol(q, sh, seam);
  float rim = min(min(vUv.x, 1.0 - vUv.x) * uL, (1.0 - abs(vUv.y)) * uWd * 0.5);
  vec3 rc = 0.6 + 0.4 * cos(6.2832 * (vUv.x * 2.0 + vUv.y * 0.7 + uT * 0.15 + vec3(0.0, 0.33, 0.67)));
  c = mix(c * 0.92, vec3(1.0, 0.93, 0.72), seam); c = mix(rc * 1.15, c, smoothstep(0.015, 0.075, rim));
  gl_FragColor = vec4(c * uOp * smoothstep(0.0, 0.03, rim), 1.0); }` }), true);
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 27; mesh.visible = false; fx.add(mesh); fxAuto.push(mesh);
    const _p = V3(), _c = V3();
    return { mesh, U, NA, NB,
      // o: the ground under her hands (world); X: the way it is thrown; Z: across it; hR, hL: her two hands (world); L, Wd: its length and width.
      // unf: how much of it has left her hands; rel: 0 held, 1 let go; settle: 0 flying, 1 lying over the target; sink: how far it has sunk after that; bil: how hard it billows;
      // bank: how much its far side is lifted and its near side dropped while it flies, so whoever stands on the Z side sees its face and not its edge (H13)
      shape(o, X, Z, hR, hL, L, Wd, unf, rel, settle, sink, bil, t, bank) {
        const yH = (hR.y + hL.y) * 0.5 - o.y, hw0 = 0.5 * hR.distanceTo(hL);
        for (let i = 0; i <= NA; i++) { const a = i / NA, d = Math.max(0, a - 1 + unf), u = unf > 0.001 ? d / unf : 0;
          for (let j = 0; j <= NB; j++) { const b = j / NB * 2 - 1, v = i * (NB + 1) + j;
            const wide = lerp(lerp(hw0, Wd * 0.5, sm(0, 0.18, d)), Wd * 0.5, rel), s = d * L + rel * 0.45 * (1 - 0.6 * d);
            let y = lerp(yH, 1.25, Math.pow(d, 1.15)) + 0.45 * Math.sin(PI * Math.min(1, d * 1.05)) * bil * (0.55 + 0.45 * (1 - b * b)) + 0.09 * Math.sin(9 * d - 10 * t + b * 1.3) * d * (1 - 0.6 * settle) + 0.05 * Math.sin(5 * b + 7 * t) * d * (1 - b * b);
            const e = 2 * a - 1, dome = 0.10 + (1.22 - sink) * Math.pow(Math.max(0, 1 - e * e), 0.6) * Math.pow(Math.max(0, 1 - b * b), 0.5) + 0.03 * Math.sin(8 * a + 6 * b - 5 * t);
            y -= b * (bank || 0) * wide * 0.62 * sm(0, 0.25, d); y = lerp(Math.max(0.05, y), Math.max(0.03, dome), settle);
            _p.copy(o).addScaledVector(X, s).addScaledVector(Z, b * wide); _p.y = o.y + y;
            if (rel < 1) { const hk = (1 - rel) * Math.pow(1 - Math.min(1, d * 3.2), 2); if (hk > 0) { _c.lerpVectors(hL, hR, (b + 1) * 0.5); _p.lerp(_c, hk); } }       // its near edge is in her two hands
            pos[v * 3] = _p.x; pos[v * 3 + 1] = _p.y; pos[v * 3 + 2] = _p.z; } }
        pa.needsUpdate = true; U.uL.value = L; U.uWd.value = Wd;
      },
      show(op, crazy, t) { mesh.visible = op > 0.004; U.uOp.value = op; U.uCrazy.value = crazy; U.uT.value = t; },
      // a point of it (world), for sparks: a 0 to 1 along, b -1 to 1 across
      pt(a, b, out) { const i = Math.round(cl(a, 0, 1) * NA), j = Math.round((cl(b, -1, 1) + 1) * 0.5 * NB), v = i * (NB + 1) + j; return out.set(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); } };
  })();

  (function foxSpells3() {
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr }), UPV = V3(0, 1, 0), _q3 = Qt();
    const _a = V3(), _b = V3(), _c = V3(), _d = V3(), _e = V3(), _f = V3(), _g = V3(), c3 = [0, 0, 0];
    const K = (t, ...o) => Object.assign({ t }, ...o), add3 = (h, d) => [h[0] + d[0], h[1] + d[1], h[2] + d[2]];
    const GRIP0 = [-0.216, 1.015, 0.123], gripAt = (hip) => arm('R', add3(GRIP0, hip || [0, 0, 0]), [-1, 0.2, -0.6], FP.grip, 0.2, [0.3, 0]);       // her right palm on the ring of the sheathed shears, wherever her hips are
    const restArm = (S) => ({ ['h' + S]: 'rest', ['e' + S]: 'rest', ['f' + S]: 'rest', ['tw' + S]: 'rest', ['wr' + S]: 'rest' });
    const stand = { hip: [0, 0, 0], hipR: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest' };
    const stride = { hip: [0, -0.03, 0.06], ftL: [0.02, 0, 0.22, 0.1, 0], knL: [0.2, 0, 1], ftR: [-0.04, 0, -0.10, -0.5, 0], knR: [-0.4, 0, 1] };
    const PUP = [0.20, 0.22, 0.20, 0.26, 0.32, 1.0];                                                    // a puppeteer's hand: fingers spread and hanging a little
    // The stage as she found it, whatever turn the move has given her since: X the way her spells go (her left), Z toward whoever is watching, O the ground under her.
    const FR = { X: V3(), Z: V3(), O: V3() }; let spinWas = 0;
    const frame = () => { root.getWorldQuaternion(_q3); FR.X.set(1, 0, 0).applyQuaternion(_q3).applyAxisAngle(UPV, -spinWas); FR.Z.set(0, 0, 1).applyQuaternion(_q3).applyAxisAngle(UPV, -spinWas); root.getWorldPosition(FR.O); spinWas = spinNow; };
    // a spark in one of her thread's colours
    const tspark = (p, spread, speed, life, size, up) => { RIB.thCol(Math.random(), c3); emit(p.x + rs() * spread, p.y + rs() * spread, p.z + rs() * spread, rs() * speed, (up || 0) + rs() * speed, rs() * speed, life * (0.6 + 0.8 * Math.random()), size * (0.6 + 0.8 * Math.random()), c3, 0.15, 0.9); };
    const many = (n, dt, f) => { const x = n * dt; for (let i = 0; i < x || (i === 0 && Math.random() < x); i++) f(); };

    // Crazy Quilt (painting H13). She gathers it at her hip, swings it up over her head and shakes it out like a bedsheet: a quilt of light
    // unrolls from her hands across the field. A second flick sends a wave down it, she lets go, and it settles over her target, where its
    // squares keep changing places.
    (function () {
      const dur = 4.6, T_SH = 1.08, T_REL = 2.12, T_HIT = 3.0, T_END = 4.25, keys = [];
      const hi = (S, h, f, wr) => arm(S, h, [S === 'R' ? -0.8 : 0.8, -0.5, -0.3], f, 0.8, wr), lo = (S, h, f, wr) => arm(S, h, [S === 'R' ? -0.9 : 0.9, -0.2, -0.4], f, 0.8, wr);
      const crouch = { hip: [0, -0.10, 0], ftL: [0.02, 0, 0.10, 0.1, 0], ftR: [-0.04, 0, -0.08, -0.4, 0], knL: [0.3, 0, 1], knR: [-0.4, 0, 1] }, toes = { hip: [0, 0.03, 0.02], ftL: [0.02, 0.05, 0.10, 0.1, 0.5], ftR: [-0.04, 0.05, -0.10, -0.4, 0.5], knL: [0.2, 0, 1], knR: [-0.4, 0, 1] };
      const gather = K(0, { sp: [-0.30, 0.16, 0], hd: [0.2, 0.1, 0], mouth: 0 }, arm('R', [-0.24, 0.96, 0.10], [-1, -0.2, -0.5], FP.grip, 0.6, [0, 0]), arm('L', [-0.04, 0.98, 0.24], [0.8, -0.6, -0.2], FP.grip, 0.6, [0, 0]), crouch);
      const over = K(0, { sp: [0, -0.12, 0], hd: [0, -0.2, 0], mouth: 1 }, arm('R', [-0.20, 1.74, 0.02], [-1, 0.2, 0.5], FP.grip, 0.6, [0, 0]), arm('L', [0.18, 1.76, 0.03], [1, 0.2, 0.5], FP.grip, 0.6, [0, 0]), toes);
      keys.push(Object.assign({}, gather, { t: 0.50 }), Object.assign({}, gather, { t: 0.60 }));
      keys.push(Object.assign({}, over, { t: 0.98 }), Object.assign({}, over, { t: 1.04 }));
      keys.push(K(1.32, { sp: [0, 0.16, 0], hd: [0, -0.1, 0.06], mouth: 2 }, hi('R', [-0.24, 1.38, 0.46], FP.grip, [0.2, 0]), hi('L', [0.22, 1.52, 0.44], FP.grip, [0.2, 0]), stride));                       // the shake: out it goes
      keys.push(K(1.60, { sp: [0, 0.22, 0], hd: [0, -0.12, 0.06] }, lo('R', [-0.24, 1.12, 0.42], FP.grip, [-0.2, 0]), lo('L', [0.22, 1.18, 0.42], FP.grip, [-0.2, 0]), stride));
      keys.push(K(1.90, { sp: [0, 0.08, 0], hd: [0, -0.14, 0.06] }, hi('R', [-0.26, 1.44, 0.40], FP.grip, [0.3, 0]), hi('L', [0.24, 1.54, 0.38], FP.grip, [0.3, 0]), stride));                                 // a second flick
      keys.push(K(2.14, { sp: [0, 0.20, 0], hd: [0, -0.08, 0.08] }, lo('R', [-0.28, 1.20, 0.44], FP.open, [-0.1, 0]), lo('L', [0.26, 1.26, 0.44], FP.open, [-0.1, 0]), stride));                                // and she lets it go
      keys.push(K(2.34, { sp: [0, 0.20, 0], hd: [0, -0.08, 0.08] }, lo('R', [-0.28, 1.18, 0.44], FP.open, [-0.1, 0]), lo('L', [0.26, 1.24, 0.44], FP.open, [-0.1, 0]), stride));
      const idle = [arm('R', [-0.25, 1.00, 0.15], [-0.55, -0.1, -1], FP.relax, 0.2, [0.1, 0]), arm('L', [0.20, 0.99, 0.19], [1, -0.4, -0.3], FP.soft, 0.2, [0.3, 0])];
      keys.push(K(2.95, { sp: [0, -0.05, 0], hd: [0, -0.16, 0.08], mouth: 2, sh: [0, 0] }, idle[0], idle[1], stand));                                                                                      // she watches it land, and laughs
      for (let i = 0; i < 3; i++) { keys.push(K(3.08 + i * 0.24, { sh: [0.5, 0.5], hd: [0, -0.20, 0.08] })); keys.push(K(3.20 + i * 0.24, { sh: [0, 0], hd: [0, -0.13, 0.08] })); }
      keys.push(K(3.90, { sp: [0, 0, 0], hd: [0, 0, 0.05], sh: [0, 0], mouth: 2 }, idle[0], idle[1], stand));
      const spin = [[0, 0], [0.10, 0], [0.62, PI / 2], [3.55, PI / 2], [4.25, 0], [dur, 0]];
      const o0 = V3(), X0 = V3(), Z0 = V3(), tg = V3(); let L = 3, froze = false;
      defAction('crazy_quilt', dur, keys, { outro: 0.3, stand: true, spin, hits: [T_HIT / dur], cues: [T_SH / dur, T_REL / dur], impact: 0.35,
        start() { froze = false; spinWas = 0; },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          const hR = anchor('handR', _a), hL = anchor('handL', _b);
          if (T > 0.3 && T < T_SH + 0.2) { const k = win(T, 0.3, T_SH + 0.2, 0.2); many(26 * k, dt, () => tspark(Math.random() < 0.5 ? hR : hL, 0.05, 0.12, 0.4, 0.03, 0.1)); light(hR, 0.6 * k, 0xa8c8ff); }      // it gathers in her hands
          if (T < T_SH) return;
          if (!froze) { o0.addVectors(hR, hL).multiplyScalar(0.5); o0.y = FR.O.y; X0.copy(FR.X); Z0.copy(FR.Z); L = cl(2 * (2.6 * tgtK - 0.85), 2.2, 3.4); tg.copy(o0).addScaledVector(X0, L * 0.5 + 0.3); if (T >= T_REL) froze = true; }
          const unf = sm(T_SH, T_SH + 0.55, T), rel = sm(T_REL, T_REL + 0.45, T), settle = sm(T_REL + 0.12, T_HIT, T), sink = 0.8 * sm(T_HIT + 0.3, T_END, T);
          const bil = Math.exp(-Math.max(0, T - 1.3) * 1.6) + 0.55 * win(T, 1.72, 2.3, 0.22), op = sm(T_SH, T_SH + 0.18, T) * (1 - sm(T_END - 0.7, T_END, T)) * (0.92 - 0.42 * settle);
          QUILT.shape(o0, X0, Z0, hR, hL, L, 2.1, unf, rel, settle, sink, bil, t, 1 - settle); QUILT.show(op, sm(T_HIT - 0.1, T_HIT + 0.1, T), t);
          if (op > 0.05) { many(30 * (1 - 0.6 * settle), dt, () => tspark(QUILT.pt(Math.random() < 0.5 ? 1 : Math.random(), Math.random() < 0.5 ? rs() : (Math.random() < 0.5 ? -1 : 1), _c), 0.03, 0.15, 0.5, 0.035, 0.05)); light(QUILT.pt(0.6, 0, _c), 1.0 * op, 0xc8b8ff); }
          fxHitP.copy(tg); fxHitP.y += 1.1 * FOX_K;
          if (cue(a, 'land', T_HIT)) { _c.copy(tg); shock(_c, 0.3, 1.5, 0.7, [0.75, 0.8, 1.0], true); for (let i = 0; i < 70; i++) { _d.copy(tg); _d.y += 0.3 + Math.random() * 1.0; tspark(_d, 0.5, 0.9, 0.8, 0.045, 0.3); } }
          if (T > T_HIT && T < T_END) { const k = win(T, T_HIT, T_END, 0.25); for (let i = 0; i < 5; i++) { const an = t * 5.5 + i * 1.2566; RIB.thCol(i / 5 + t * 0.2, c3); if (Math.random() < 30 * dt * k) emit(tg.x + 0.30 * Math.cos(an), tg.y + (1.78 + 0.05 * Math.sin(an * 2)) * FOX_K, tg.z + 0.30 * Math.sin(an), 0, 0, 0, 0.22, 0.06, c3, 0, 0.5); } }      // which way was I facing? stars go round its head
        } });
    })();

    // Slip Stitch (paintings H11, H12, I6). Up on her toes she puts the point of her shears as high as she can reach and drags it straight
    // down: the air is left cut behind it. She puts the shears away, takes the near edge and lifts it like the flap of a tent (other places
    // show through), waves, and steps in behind it. A needle of light sews the cut shut from the top. Nobody is left standing there.
    // On her own page she then has to come back, so she pops out where she began; in the game the move would end with her gone.
    (function () {
      const dur = 6.6, TC = 1.40, TS = 0.30, T_C0 = 1.00, T_C1 = 1.68, T_OP0 = 2.62, T_OP1 = 3.05, T_STEP = 3.30, T_GONE = 4.02, T_SEW0 = 3.86, T_SEW1 = 5.05, T_FADE = 5.42, T_BACK = 5.80, keys = [];
      const spin = [[0, 0], [0.12, 0], [0.72, TC], [1.80, TC], [2.35, TS], [4.40, TS], [5.30, 0], [dur, 0]], spinT = { ts: spin.map((e) => e[0]), vs: spin.map((e) => e[1]) };
      // a spot on the stage (metres to her left, metres toward the viewer, from where she began) as offsets in her own turned space at time t
      const w2r = (t, X, Z) => { const th = evalTrack(spinT, t), c = Math.cos(th), s = Math.sin(th); return [X * c - Z * s, X * s + Z * c]; };
      const hipAt = (t, P, y) => { const r = w2r(t, P[0], P[1]); return [r[0], y || 0, r[1]]; }, footAt = (t, P, y, yaw, pitch) => { const r = w2r(t, P[0], P[1]); return [r[0], y || 0, r[1], yaw || 0, pitch || 0]; };
      const handAt = (t, X, Z, y) => { const r = w2r(t, X, Z); return [r[0], y, r[1]]; };
      const lungeF = { ftL: [0.03, 0, 0.42, 0.1, 0], knL: [0.2, 0, 1], ftR: [-0.03, 0.03, -0.02, -0.3, 0.35], knR: [-0.3, 0, 1] }, backL = arm('L', [0.26, 1.02, 0.0], [0.6, -0.2, -1], FP.soft, 0.2, [0.1, 0]);
      // the cut: the point of her shears on one straight line, from 1.96 m down to 0.56 (poses.py with bench/stroke.poses.js)
      const ST = [[1.00, [-0.193, 1.631, 0.540], -1.6, [0, 0.2], [0, 0.03, 0.22], [0, 0.02, 0], [-0.5, -0.5, 0.4], -0.28], [1.17, [-0.282, 1.296, 0.576], -0.8, [0, 0.2], [0, 0, 0.22], [0, 0.06, 0], [-0.5, -0.8, 0.1], -0.12],
        [1.34, [-0.284, 1.025, 0.520], -0.4, [0, 0.2], [0, -0.07, 0.22], [0, 0.12, 0], [-0.5, -1, -0.2], 0.02], [1.51, [-0.295, 0.868, 0.420], -0.6, [0, 0.2], [0, -0.15, 0.22], [0, 0.20, 0], [-0.6, -0.8, -0.4], 0.14], [1.68, [-0.292, 0.812, 0.489], -1.4, [0.3, 0.2], [0, -0.24, 0.22], [0, 0.30, 0], [-0.7, -0.3, -0.6], 0.22]];
      const stk = (i, t) => { const s = ST[i]; return K(t === undefined ? s[0] : t, { shr: 1, shs: 0, sho: 0, shl: s[2], hip: s[4], sp: s[5], hd: [0, s[7], 0], mouth: 0 }, arm('R', s[1], s[6], FP.grip, 0, s[3]), lungeF, backL); };
      keys.push(K(0.30, { hd: [-0.25, 0.18, 0], sp: [-0.08, 0.05, 0], shr: 0 }, gripAt(), restArm('L'), stand)); keys.push(K(0.42, { shr: 0 }, gripAt()));
      keys.push(stk(0, 0.86)); for (let i = 0; i < 5; i++) keys.push(stk(i)); keys.push(stk(4, 1.80));
      const B = [0.10, 0.03], B1 = [0.26, 0.04], E0 = [0.73, 0.27], E1 = [0.42, 0.28], FL = [0.36, 0.05];              // B1: the step she takes toward the cut to reach it; FL: where her left foot goes for it              // B: where the cut leaves her standing. E0, E1: where her left hand takes the near edge of the cut, and where it lifts it to
      keys.push(K(2.06, { hip: hipAt(2.06, [0.16, 0.035], -0.08), sp: [0, 0.10, 0], hd: [0.1, 0.1, 0], shr: 1, shl: -0.6, ftR: footAt(2.06, B), ftL: footAt(2.06, [0.24, 0.07], 0.05), knR: 'rest', knL: 'rest' }, arm('R', add3([-0.26, 1.08, 0.22], hipAt(2.06, [0.16, 0.035])), [-0.8, -0.4, -0.5], FP.grip, 0.2, [0.2, 0])));
      const g1 = hipAt(2.30, B), g2 = hipAt(2.44, B);
      keys.push(K(2.30, { hip: g1, sp: [0.04, 0.04, 0], hd: [0.3, 0.05, 0], shr: 1, shl: 0.44, ftR: footAt(2.30, B), ftL: footAt(2.30, B, 0.04) }, gripAt(g1), backL));
      keys.push(K(2.44, { hip: g2, shr: 0, ftR: footAt(2.44, B), ftL: footAt(2.44, B) }, gripAt(g2)));
      const hold = (t, E, y, Bp, o) => K(t, { hip: hipAt(t, Bp, -0.02), ftR: footAt(t, B), ftL: footAt(t, FL) }, arm('L', handAt(t, E[0], E[1], y), [0.9, -0.5, -0.2], FP.cup, 0.9, [0.1, 0]), o);
      keys.push(K(2.52, { ftL: footAt(2.52, [0.24, 0.05], 0.04) }));
      keys.push(hold(T_OP0, E0, 1.27, B1, { sp: [0.14, 0.08, -0.06], hd: [0.35, 0.02, 0], mouth: 0 })); keys.push(hold(T_OP0 + 0.08, E0, 1.27, B1, { sp: [0.14, 0.08, -0.06], hd: [0.35, 0.02, 0] }));      // she steps in and takes hold of the cut
      keys.push(hold(T_OP1, E1, 1.42, [0.13, 0.03], { sp: [0.02, 0.0, -0.04], hd: [-0.30, 0.0, 0.08], mouth: 2 })); keys.push(hold(T_STEP - 0.02, E1, 1.42, [0.13, 0.03], { sp: [0.02, 0.0, -0.04], hd: [-0.30, 0, 0.08], mouth: 2 }));      // and draws its edge back and up, like a curtain
      // her right hand, free again, waves goodbye
      const wave = (t, d, hip) => arm('R', add3([-0.30, 1.42, 0.14], [hip[0], 0, hip[2]]), [-0.8, -0.8, 0.1], FP.open, 1.3, [0.1, d]);
      keys.push(K(2.70, {}, arm('R', add3([-0.26, 1.02, 0.14], g2), [-0.6, -0.2, -0.8], FP.relax, 0.2, [0.1, 0])));
      // she steps in behind the lifted edge, sideways, waving: left foot out, right foot joins it, twice
      const HX = [[3.30, 0.13], [3.44, 0.30], [3.58, 0.44], [3.72, 0.58], [3.86, 0.70], [4.00, 0.76]], FTL = [[0.36, 0], [0.36, 0], [0.48, 0.05], [0.62, 0], [0.72, 0.05], [0.84, 0]], FTR = [[0.10, 0], [0.20, 0.05], [0.30, 0], [0.42, 0.05], [0.56, 0], [0.68, 0.04]];
      keys.push(K(3.16, {}, wave(3.16, 0.3, hipAt(3.16, [0.13, 0.03]))));
      for (let i = 0; i < HX.length; i++) { const t = HX[i][0], hp = hipAt(t, [HX[i][1], 0.03 * (1 - i / 5)], i % 2 ? -0.03 : -0.015);
        keys.push(K(t, { hip: hp, ftL: footAt(t, [FTL[i][0], 0.03 * (1 - i / 5)], FTL[i][1]), ftR: footAt(t, [FTR[i][0], 0.03 * (1 - i / 5)], FTR[i][1]), sp: [0.03, 0, i % 2 ? 0.05 : -0.05], hd: [-0.30, 0, i % 2 ? -0.06 : 0.08] }, wave(t, i % 2 ? 0.35 : -0.35, hp),
          i >= 1 ? arm('L', add3([0.14, 1.12, 0.22], [hp[0], 0, hp[2]]), [0.9, -0.6, -0.2], FP.soft, 0.4, [0.2, 0]) : null)); }
      keys.push(K(4.30, { hip: hipAt(4.30, [0.76, 0]), ftL: footAt(4.30, [0.84, 0]), ftR: footAt(4.30, [0.70, 0]) }));
      // unseen, she comes back to where she began; then, on her own page, she is simply there again
      const tada = K(0, { hip: [0, -0.10, 0], sp: [0, 0.04, 0], hd: [0, -0.05, 0.06], mouth: 2, ftR: 'rest', ftL: 'rest', knR: [-0.4, 0, 1], knL: [0.4, 0, 1] }, arm('R', [-0.42, 1.02, 0.12], [-0.6, -0.8, -0.3], FP.open, 1.2, [0.2, 0]), arm('L', [0.42, 1.02, 0.12], [0.6, -0.8, -0.3], FP.open, 1.2, [0.2, 0]));
      keys.push(Object.assign({}, tada, { t: 5.40 }), Object.assign({}, tada, { t: T_BACK + 0.12 }));
      keys.push(K(6.25, { sp: [0, 0, 0], hd: [0, 0, 0.05], mouth: 2 }, stand, restArm('R'), restArm('L')));
      const foot = V3(), X0 = V3(), Z0 = V3(), nd = V3(), nd2 = V3(); let placed = false, cutMax = 0, flap = 0, topY = 0;
      const NST = Math.round(SLIT.H / 0.12), needleAt = (u, out) => { const ph = u * NST * PI; return out.set(0.085 * Math.cos(ph), (1 - u) * SLIT.H + 0.03 * Math.sin(ph * 2), 0.03 + 0.03 * Math.sin(ph)).applyMatrix4(SLIT.group.matrixWorld); };
      defAction('slip_stitch', dur, keys, { outro: 0.3, stand: true, spin, cues: [T_C0 / dur, T_OP1 / dur, T_GONE / dur, T_SEW1 / dur, T_BACK / dur],
        start() { placed = false; cutMax = 0; flap = 0; spinWas = 0; },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          if (T > T_GONE && T < T_BACK) foxAwayAsk = true;
          const tip = anchor('bladeA', _a);
          if (T > 0.6 && T < 2.3) { if (Math.random() < 4 * dt) emit(tip.x, tip.y, tip.z, rs() * 0.08, 0.05 + Math.random() * 0.1, rs() * 0.08, 0.35 + Math.random() * 0.3, 0.03, COL.foxPale, 0.2, 0.8); }
          if (cue(a, 'place', T_C0 - 0.03)) { foot.set(tip.x, FR.O.y, tip.z); X0.copy(FR.X); Z0.copy(FR.Z); SLIT.place(foot, X0, Z0); topY = foot.y + SLIT.Y0 + SLIT.H; placed = true; burst(tip, 18, 0.7, 0.4, 0.03, COL.foxPale, 0.2, 1.2, 0.2); }
          if (!placed) return;
          if (T < T_C1) cutMax = Math.max(cutMax, cl((topY - tip.y) / SLIT.H, 0, 1)); else cutMax = Math.max(cutMax, lerp(cutMax, 1, sm(T_C1, T_C1 + 0.25, T)));
          const open = 0.7 * sm(T_OP0, T_OP1, T) + 0.3 * sm(T_STEP, T_STEP + 0.4, T), sew = cl((T - T_SEW0) / (T_SEW1 - T_SEW0), 0, 1), flash = win(T, T_SEW1 - 0.05, T_SEW1 + 0.3, 0.1), op = (1 - sm(T_SEW1 + 0.08, T_FADE, T)) * (1 + 1.2 * flash);
          SLIT.show(cutMax, open, flap, sew, op, t);
          if (T >= T_OP0 && T < T_STEP) { tipOf('L', 1, _b); tipOf('L', 2, _c); _b.add(_c).multiplyScalar(0.5); const f = SLIT.flapFor(_b); flap += (f - flap) * Math.min(1, dt * 14); }                 // the near edge is in her fingers
          else if (T >= T_GONE - 0.15) flap *= Math.exp(-dt * 5);
          if (T < T_C1 + 0.25) { const p = SLIT.pt(1 - cutMax, 0, _b); many(70, dt, () => tspark(p, 0.02, 0.35, 0.35, 0.035, 0.1)); light(p, 1.3, 0x9fd0ff); }                                         // the cut's leading end
          else if (op > 0.05) { many(10 * op, dt, () => { const v = Math.random() * (1 - sew); tspark(SLIT.pt(v, Math.random() < 0.5 ? -1 : 1, _b), 0.02, 0.12, 0.5, 0.028, 0.06); }); light(SLIT.pt(0.5, 0, _b), 0.7 * op * (0.5 + open), 0xb8c8ff); }
          if (sew > 0 && sew < 1) {                                                                                                                                                              // the needle, and the thread it pulls
            needleAt(sew, nd); needleAt(Math.min(1, sew + 0.004), nd2); SLIT.needle(nd, _b.subVectors(nd2, nd), 1);
            RIB.path((u, o) => needleAt(Math.max(0, sew - 0.11 * (1 - u)), o), 0.007, 1, t * 0.6, 0.6, 2);
            many(24, dt, () => tspark(nd, 0.015, 0.2, 0.3, 0.03, 0.05)); light(nd, 0.9, 0xffffff);
          }
          if (cue(a, 'in', T_GONE)) { const c = anchor('chest', _b); for (let i = 0; i < 30; i++) tspark(c, 0.3, 0.5, 0.5, 0.04, 0.2); for (let i = 0; i < 26; i++) tspark(SLIT.pt(0.2 + 0.6 * Math.random(), rs(), _c), 0.03, 0.4, 0.5, 0.035, 0.1); }
          if (cue(a, 'sewn', T_SEW1)) { for (let i = 0; i < 60; i++) tspark(SLIT.pt(Math.random(), 0, _c), 0.02, 0.5, 0.6, 0.04, 0.15); shock(SLIT.pt(0.5, 0, _b), 0.05, 0.5, 0.4, COL.foxPale); }
          fxHitP.copy(SLIT.pt(0.55, 0, _b));
          if (cue(a, 'back', T_BACK)) { const c = anchor('chest', _b); burst(c, 70, 2.0, 0.6, 0.045, COL.foxPale, 0.3, 1.3, 0.4); for (let i = 0; i < 40; i++) tspark(c, 0.25, 0.8, 0.7, 0.04, 0.3); _c.copy(FR.O); shock(_c, 0.15, 0.9, 0.5, COL.fox, true); }
          const bl = win(T, T_BACK - 0.03, T_BACK + 0.35, 0.05); if (bl > 0.01) light(anchor('chest', _b), 1.8 * bl, 0xcfe8ff);
        } });
    })();
    // Same Cloth (paintings H9, H10, I8). She draws her shears, points them at her enemy and snips round its outline from where she stands: a
    // ghost copy of it peels away like a shape cut from cloth. Shears away, both hands up, a thread from every fingertip: she works the copy
    // like a puppet, draws it back, and throws it at the thing it was cut from. She laughs, takes the shears again, snips the threads, and the
    // copy unravels from the top. The copy is made from whatever the host says she is aiming at (fox.target); with nothing given, a cloth doll.
    (function () {
      const dur = 6.7, T_C0 = 0.86, SEG = 0.175, T_C1 = T_C0 + 8 * SEG, T_TL = 2.84, T_TR = 3.30, T_W0 = 3.42, T_W1 = 3.92, T_HIT = 4.20, T_GIVE = 4.95, T_SNIP = 5.70, keys = [], HS = stride.hip;
      const C = [-0.15, 1.30, 0.43], RAD = 0.075, cutArm = (ph) => arm('R', [C[0] - RAD * Math.cos(ph), C[1] + RAD * Math.sin(ph), C[2]], [-0.6, -1, -0.2], FP.grip, 0, [0, 0.3]);
      const trailL = arm('L', [0.30, 0.97, -0.10], [0.6, -0.2, -1], FP.soft, 0.2, [0.1, 0]), LH = [0.13, 1.44, 0.34];
      const pupL = (h, w) => arm('L', h, [0.9, 0.15, -0.3], PUP, 0.8, [w === undefined ? 0.25 : w, 0]), pupR = (h, w) => arm('R', h, [-0.9, 0.15, -0.3], PUP, 0.8, [w === undefined ? 0.25 : w, 0]);
      keys.push(K(0.30, { hd: [-0.25, 0.18, 0], sp: [-0.08, 0.05, 0], shr: 0, mouth: 0 }, gripAt(), restArm('L'), stand)); keys.push(K(0.42, { shr: 0 }, gripAt()));
      keys.push(K(0.80, { shr: 1, shs: 0, sho: 0.5, shl: -1.55, sp: [0, 0.08, 0], hd: [0, 0.02, 0.05] }, cutArm(PI / 2), trailL, stride));
      for (let k = 0; k <= 8; k++) keys.push(K(T_C0 + k * SEG, { sho: k % 2 ? 0.06 : 0.55, shl: -1.55, sp: [0, 0.08, 0], hd: [0.05 * Math.cos(PI / 2 - k * PI / 4), 0.02 - 0.04 * Math.sin(PI / 2 - k * PI / 4), 0.05] }, cutArm(PI / 2 - k * PI / 4)));      // round the outline: snip, snip, snip, snip
      keys.push(K(T_C1 - 0.10, {}, trailL)); keys.push(K(T_C1 + 0.10, { sho: 0, shr: 1 }, cutArm(PI / 2)));
      keys.push(K(2.72, { shr: 1, shl: 0.44, sho: 0, sp: [-0.04, 0.06, 0], hd: [0, -0.02, 0.05], mouth: 2 }, gripAt(HS)));                                    // shears away; her left hand is already up
      keys.push(K(2.86, { shr: 0 }, gripAt(HS), pupL([0.13, 1.46, 0.38])));
      const both = (t, sp, hd, hl, hr, w, o) => K(t, { sp, hd, mouth: 2 }, pupL(hl, w), pupR(hr, w), stride, o);
      keys.push(both(3.26, [0, 0.12, 0], [0, -0.06, 0.05], [0.13, 1.46, 0.38], [-0.19, 1.24, 0.42]));                                                                                    // a puppeteer's two hands (H10)
      keys.push(both(T_W0, [0, 0.12, 0], [0, -0.06, 0.05], [0.13, 1.46, 0.38], [-0.19, 1.24, 0.42]));
      keys.push(both(T_W1, [-0.22, 0.08, 0], [0.15, -0.04, 0.05], [0.02, 1.50, 0.32], [-0.30, 1.30, 0.30]));                                                                             // she draws it back
      keys.push(both(T_W1 + 0.07, [-0.23, 0.08, 0], [0.15, -0.04, 0.05], [0.02, 1.50, 0.32], [-0.30, 1.30, 0.30]));
      keys.push(both(T_HIT, [0.20, 0.16, 0], [-0.12, -0.02, 0.05], [0.22, 1.36, 0.42], [-0.08, 1.16, 0.46], 0.05));                                                                      // and throws it at the thing it was cut from
      keys.push(both(T_HIT + 0.12, [0.21, 0.16, 0], [-0.12, -0.02, 0.05], [0.22, 1.36, 0.42], [-0.08, 1.16, 0.46], 0.05));
      keys.push(both(4.55, [0.05, -0.02, 0], [0, -0.20, 0.08], [0.16, 1.48, 0.36], [-0.16, 1.28, 0.38], 0.25, { sh: [0, 0] }));                                                          // she laughs
      for (let i = 0; i < 2; i++) { keys.push(K(4.63 + i * 0.16, { sh: [0.5, 0.5] })); keys.push(K(4.71 + i * 0.16, { sh: [0, 0] })); }
      keys.push(both(T_GIVE, [0.05, 0.06, 0], [0, -0.06, 0.05], LH, [-0.10, 1.34, 0.38], 0.25, { sh: [0, 0] }));                                                                         // her right hand gives its threads to her left
      keys.push(K(5.22, { shr: 0, sp: [0.02, 0.08, 0], hd: [-0.15, 0.10, 0.03] }, gripAt(HS), pupL(LH)));
      keys.push(K(5.30, { shr: 0 }, gripAt(HS)));
      const snipArm = arm('R', [-0.257, 1.315, 0.369], [-0.8, -0.8, -0.2], FP.grip, -1, [0, 0]), snipB = { sp: [0.05, 0.10, 0], hd: [0.05, 0.03, 0.05] };
      keys.push(K(5.58, { shr: 1, shs: 0, shl: -0.5, sho: 0.55, mouth: 2 }, snipB, snipArm, pupL(LH)));
      keys.push(K(5.66, { sho: 0.55 }, snipArm)); keys.push(K(T_SNIP + 0.02, { sho: 0 }, snipArm)); keys.push(K(5.86, { sho: 0, shl: -0.5 }, snipB, snipArm, pupL(LH)));                 // snip
      keys.push(K(6.22, { shr: 1, shl: 0.44, hd: [-0.22, 0.16, 0], sp: [-0.06, 0.04, 0] }, gripAt(HS), arm('L', [0.22, 1.05, 0.20], [1, -0.4, -0.3], FP.soft, 0.2, [0.2, 0]), stride));
      keys.push(K(6.34, { shr: 0 }, gripAt(HS)));
      keys.push(K(6.52, { shr: 0, hd: [0, 0, 0.05], sp: [0, 0, 0], mouth: 2 }, gripAt(), stand, restArm('L')));
      const spin = [[0, 0], [0.15, 0], [0.72, PI / 2], [5.95, PI / 2], [6.52, 0], [dur, 0]];
      const tp = V3(), X0 = V3(), Z0 = V3(), AX = V3(), VW = V3(), gp = V3(), hitP = V3(), tq = Qt(), AT = []; let yaw0 = 0, delta = 0, has = false, peelD = 0.8, nearD = 0.5;
      // where each thread is tied to the copy: her left hand has its head and arms, her right its body
      const ATT = [[0, 0.99, 0], [0.9, 0.77, 0], [-0.9, 0.77, 0], [0.45, 0.77, 0], [-0.45, 0.77, 0], [0, 0.86, 0], [0.3, 0.62, 0], [-0.3, 0.62, 0], [0.2, 0.36, 0], [-0.2, 0.36, 0]]; for (let i = 0; i < 10; i++) AT.push(V3());
      // the outline she cuts: a rounded shape a hand's breadth outside the enemy. An outline is what the eye sees, so it stands facing whoever is looking (AX runs across their view)
      const e2 = [0, 0], outl = (u, o) => { EGHOST.edge(u, e2); o.copy(tp).addScaledVector(AX, e2[0]).addScaledVector(VW, -0.06); o.y = tp.y + e2[1]; return o; };
      defAction('same_cloth', dur, keys, { outro: 0.3, stand: true, spin, hits: [T_HIT / dur], cues: [T_C0 / dur, T_C1 / dur, T_SNIP / dur], impact: 0.75,
        start() { has = false; spinWas = 0; EGHOST.from(tgtObj); },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          if (!has || T < T_C0) {                                                                    // where her enemy is: what the host gave her, or the usual distance to her left
            if (tgtObj) { tgtObj.updateWorldMatrix(true, false); tgtObj.getWorldPosition(tp); tgtObj.getWorldQuaternion(tq); _a.set(1, 0, 0).applyQuaternion(tq); yaw0 = Math.atan2(-_a.z, _a.x); X0.subVectors(tp, FR.O); X0.y = 0; if (X0.lengthSq() < 0.01) X0.copy(FR.X); X0.normalize(); }
            else { tp.copy(FR.O).addScaledVector(FR.X, 2.6 * tgtK); X0.copy(FR.X); yaw0 = Math.atan2(-X0.z, X0.x); }
            Z0.set(-X0.z, 0, X0.x); const yh = Math.atan2(-X0.z, X0.x), D = Math.hypot(tp.x - FR.O.x, tp.z - FR.O.z); delta = (((yh - yaw0) % (2 * PI)) + 2 * PI) % (2 * PI); if (delta < PI) delta += 2 * PI;
            nearD = EGHOST.w + 0.10; peelD = cl(D - 1.15, nearD + 0.25, 0.85); has = true;
          }
          AX.copy(X0); VW.copy(Z0).negate(); if (RIB.seen) { _b.subVectors(tp, RIB.eye); _b.y = 0; if (_b.lengthSq() > 0.04) { VW.copy(_b).normalize(); AX.set(VW.z, 0, -VW.x); if (AX.dot(X0) < 0) AX.negate(); } }
          const tipB = anchor('bladeA', _a);
          if (T > 0.6 && T < 2.7 && Math.random() < 5 * dt) emit(tipB.x, tipB.y, tipB.z, rs() * 0.08, 0.05 + Math.random() * 0.1, rs() * 0.08, 0.35 + Math.random() * 0.3, 0.03, COL.foxPale, 0.2, 0.8);
          // the outline, drawn as she snips
          const uo = cl((T - T_C0) / (T_C1 - T_C0), 0, 1), oa = sm(T_C0, T_C0 + 0.05, T) * (1 - sm(T_C1 + 0.45, T_C1 + 1.0, T));
          if (oa > 0.01 && uo > 0.001) {
            for (let j = 0; j < 6; j++) { const u0 = j / 6 * uo, u1 = (j + 1) / 6 * uo; RIB.path((u, o) => outl(lerp(u0, u1, u), o), 0.016, oa, u0 * 2 + t * 0.3, (u1 - u0) * 2, 0); }
            if (T < T_C1) { outl(uo, _b); many(70, dt, () => tspark(_b, 0.02, 0.4, 0.4, 0.035, 0.05)); light(_b, 1.2, 0xa8d0ff); }
            else many(40 * oa, dt, () => tspark(outl(Math.random(), _b), 0.02, 0.25, 0.5, 0.03, 0.05));
          }
          if (cue(a, 'cut', T_C1)) { for (let i = 0; i < 50; i++) tspark(outl(Math.random(), _b), 0.03, 0.6, 0.6, 0.04, 0.1); }
          hitP.copy(tp).addScaledVector(X0, -0.14); hitP.y += EGHOST.h * 0.77; fxHitP.copy(hitP);
          if (T >= T_C1 && T < T_SNIP + 0.95) {
            // the copy: it peels away toward her, turns on its enemy, is drawn back, and whirls in
            const pk = sm(T_C1 + 0.05, T_C1 + 0.75, T), wh = cl((T - T_W1) / (T_HIT - T_W1), 0, 1), after = Math.max(0, T - T_HIT);
            const E = T < T_W1 ? 0.22 * sm(T_W0 - 0.5, T_W0 + 0.2, T) - 0.08 * sm(T_W0 + 0.2, T_W1, T) : lerp(0.14, 1, Math.pow(wh, 1.8));
            let dist = peelD * pk + 0.10 * sm(T_W0 + 0.2, T_W1, T) - (peelD + 0.10 - nearD) * wh * wh; if (T > T_HIT) dist = nearD + 0.24 * (1 - Math.exp(-after * 6));
            const yaw = yaw0 + delta * E + (T > T_HIT ? 0.30 * Math.exp(-after * 3) * Math.sin(after * 15) : 0), tilt = T > T_HIT ? 0.10 * Math.exp(-after * 3.5) * Math.sin(after * 13) : 0.05 * Math.sin(pk * PI);
            gp.copy(tp).addScaledVector(X0, -dist); gp.y += 0.03 * Math.sin(pk * PI);
            const un = sm(T_SNIP + 0.05, T_SNIP + 0.85, T), top = T < T_SNIP ? 99 : tp.y + EGHOST.h * 1.08 * (1 - un) - 0.06, op = 0.95 * sm(T_C1, T_C1 + 0.3, T);
            EGHOST.show(op, gp, yaw, tilt, 0, top, t); _b.copy(gp); _b.y += EGHOST.h * 0.6; light(_b, 0.9 * op * (1 - un), 0x66a8ff);
            for (let i = 0; i < 10; i++) { const q = ATT[i]; AT[i].set(q[0] * EGHOST.w, q[1] * EGHOST.h, q[2]); EGHOST.group.localToWorld(AT[i]); }
            if (T < T_C1 + 0.8) many(30, dt, () => { _b.copy(gp); _b.y += Math.random() * EGHOST.h; tspark(_b, EGHOST.w * 0.6, 0.2, 0.5, 0.03, 0.05); });
            if (T > T_SNIP && un < 1) many(120, dt, () => { _b.copy(gp); _b.y = top; _b.x += rs() * EGHOST.w * 0.7; _b.z += rs() * EGHOST.w * 0.7; tspark(_b, 0.03, 0.3, 0.7, 0.035, -0.15); });      // it comes apart into thread
            // her threads
            const give = sm(T_GIVE - 0.14, T_GIVE + 0.14, T), cutT = T - T_SNIP;
            for (let i = 0; i < 10; i++) {
              const S = i < 5 ? 'L' : 'R', f = i % 5, on = sm((i < 5 ? T_TL : T_TR) + f * 0.03, (i < 5 ? T_TL : T_TR) + 0.2 + f * 0.03, T); if (on <= 0.001) continue;
              tipOf(S, f, _c); if (i >= 5 && give > 0) _c.lerp(tipOf('L', f, _d), give);
              const A = AT[i], taut = T > T_W1 && T < T_HIT + 0.1 ? 1 : 0, sag = 0.07 - 0.04 * taut + 0.02 * Math.sin(t * 3 + i);
              if (cutT < 0) RIB.path((u, o) => { o.lerpVectors(_c, A, u * on); o.y -= sag * Math.sin(PI * u * on); }, 0.0055, 0.95, i * 0.11, 0.9, 0);
              else if (cutT < 0.7) {                                                                // cut: the long end falls away from the copy, the short end hangs from her fingers
                const k = 0.16, fall = 1.6 * cutT * cutT, fade = 1 - cutT / 0.7; _e.lerpVectors(_c, A, k); _f.copy(_e); _f.y -= fall; _f.addScaledVector(X0, 0.25 * cutT);
                RIB.path((u, o) => { o.lerpVectors(_f, A, u); o.y -= (sag + 0.5 * cutT) * Math.sin(PI * u); if (A.y > top) o.y = Math.min(o.y, lerp(_f.y, top, u)); }, 0.0055, 0.95 * fade, i * 0.11, 0.9, 0);
                _g.copy(_e); _g.y -= 0.9 * cutT * cutT + 0.06 * cutT; RIB.path((u, o) => { o.lerpVectors(_c, _g, u); }, 0.0055, 0.95 * fade, i * 0.11, 0.2, 0);
              }
            }
            if (cue(a, 'tl', T_TL + 0.1)) burst(tipOf('L', 2, _b), 14, 0.6, 0.35, 0.025, COL.foxPale, 0.2, 1.2, 0.2);
            if (cue(a, 'tr', T_TR + 0.1)) burst(tipOf('R', 2, _b), 14, 0.6, 0.35, 0.025, COL.foxPale, 0.2, 1.2, 0.2);
          }
          if (cue(a, 'hit', T_HIT)) { burst(hitP, 90, 2.6, 0.6, 0.05, COL.fox, 0.5, 1.4, 0.4); for (let i = 0; i < 40; i++) tspark(hitP, 0.05, 1.4, 0.7, 0.045, 0.3); shock(hitP, 0.06, 0.6, 0.35, COL.foxPale); }
          const fl = win(T, T_HIT - 0.02, T_HIT + 0.35, 0.05); if (fl > 0.01) light(hitP, 1.8 * fl, 0x8fd8ff);
          if (cue(a, 'snip', T_SNIP)) { const p = anchor('bladeAm', _b); burst(p, 22, 0.8, 0.4, 0.03, COL.foxPale, 0.3, 1.2, 0.2); }
        } });
    })();
  })();

  // ---------- round 4: two of its ten moves, When the Bell Falls Silent and The Moon's Little Lie ----------
  // Chris, 13 Nov: "do your two favorite and let's call it that". Paintings J6, J7, J8 and the magic set K1 (the nine tails), K2 (the coin and the moon).
  // The other eight (Switcheroo, Finders Keepers, Loose Thread, Ninefold Lie, Bellbound Bargain, Pins and Needles, Seam Ripper, Thimble) are not built.

  // Her nine tails of foxfire (K1): nine flames in a fan from one point behind her, each a flat strip worked out afresh every frame.
  // The fan always turns to face whoever is looking, so it is never seen edge-on.
  const TAILS = (function () {
    const NT = 9, NS = 22, NP = NS + 1, NV = NT * NP * 2, pos = new Float32Array(NV * 3), uvw = new Float32Array(NV * 3), idx = [];
    for (let i = 0; i < NT; i++) for (let k = 0; k < NP; k++) for (let s = 0; s < 2; s++) { const v = (i * NP + k) * 2 + s; uvw[v * 3] = k / NS; uvw[v * 3 + 1] = s ? 1 : -1; uvw[v * 3 + 2] = i / (NT - 1); if (k < NS && !s) { const a = (i * NP + k) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const geo = new THREE.BufferGeometry(), pa = new THREE.BufferAttribute(pos, 3); pa.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('position', pa); geo.setAttribute('aU', new THREE.BufferAttribute(uvw, 3)); geo.setIndex(idx);
    const mat = glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uOp: { value: 0 } },
      vertexShader: `attribute vec3 aU; varying vec3 vU; void main() { vU = aU; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uT; uniform float uOp; varying vec3 vU;
void main() { float u = vU.x, w = 1.0 - abs(vU.y), ph = vU.z * 37.0;
  float lick = 0.72 + 0.28 * sin(u * 26.0 - uT * 8.0 + ph) * sin(u * 9.0 + vU.y * 3.0 + uT * 4.0 + ph);
  float a = smoothstep(0.05, 0.75, w * lick) * smoothstep(0.0, 0.05, u);
  vec3 body = mix(vec3(0.04, 0.16, 0.95), vec3(0.55, 0.82, 1.0), pow(w, 3.0) * (1.0 - 0.5 * u));
  vec3 tip = mix(vec3(0.60, 0.32, 1.0), mix(vec3(1.0, 0.42, 0.70), vec3(1.0, 0.78, 0.36), smoothstep(0.88, 1.0, u)), smoothstep(0.74, 0.9, u));
  vec3 c = mix(body, tip, smoothstep(0.76, 0.93, u) * (1.0 - 0.5 * pow(w, 3.0)));
  gl_FragColor = vec4(c * a * uOp * (0.55 + 0.35 * u), 1.0); }` }), true);
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 26; mesh.visible = false; fx.add(mesh); fxAuto.push(mesh);
    const _p = V3();
    return { mesh,
      // base: the point they spring from (world); right: across the fan; back: away from whoever is looking. open 0 shut to 1; len: the longest tail, metres;
      // spread: how far the outermost tails lean from straight up, radians
      shape(base, right, back, open, len, spread, op, t) {
        mesh.visible = op > 0.004 && open > 0.004; if (!mesh.visible) return; mat.uniforms.uOp.value = op; mat.uniforms.uT.value = t;
        for (let i = 0; i < NT; i++) { const k = (i - 4) / 4, a0 = k * spread * open, L = len * (1 - 0.14 * Math.abs(k)) * (0.25 + 0.75 * open), sgn = k === 0 ? 0 : Math.sign(k); let px = 0, py = 0;
          for (let j = 0; j < NP; j++) { const s = j / NS, th = a0 * (0.30 + 0.70 * sm(0, 0.55, s)) + (sgn * 1.25 + (k === 0 ? 0.5 : 0)) * sm(0.72, 1, s) * open + 0.20 * Math.sin(s * 7 - t * 2.4 + i * 1.7) * Math.sin(PI * s);
            const w = 0.135 * len * Math.pow(Math.max(0, Math.sin(PI * Math.pow(s, 0.80))), 1.0) * (0.4 + 0.6 * open), sn = Math.sin(th), cs = Math.cos(th);
            for (let e = 0; e < 2; e++) { const q = e ? 1 : -1, v = (i * NP + j) * 2 + e; _p.copy(base).addScaledVector(right, px + q * cs * w).addScaledVector(back, 0.10 + 0.22 * s * L); pos[v * 3] = _p.x; pos[v * 3 + 1] = _p.y + py - q * sn * w; pos[v * 3 + 2] = _p.z; }
            px += sn * L / NS; py += cs * L / NS; } }
        pa.needsUpdate = true;
      } };
  })();

  // The coin and the moon (K2): one disc that is a thin bright crescent when small (phase 0) and the blue full moon when grown (phase 1), with a rim of
  // stitches that can be sewn on, and unpicked again, clockwise from the top. It always faces whoever is looking; as a coin it also spins.
  const MOON = (function () {
    const blank = new THREE.DataTexture(new Uint8Array([70, 120, 230, 255]), 1, 1, THREE.RGBAFormat); blank.needsUpdate = true;
    const U = { tM: { value: blank }, uHasM: { value: 0 }, uPhase: { value: 0 }, uSewn: { value: 0 }, uUn: { value: 0 }, uBright: { value: 1 } };
    onBaked('moon', (img) => { const t = new THREE.Texture(img); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; U.tM.value = t; U.uHasM.value = 1; });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: U,
      vertexShader: `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform sampler2D tM; uniform float uHasM; uniform float uPhase; uniform float uSewn; uniform float uUn; uniform float uBright; varying vec2 vP;
void main() { float r = length(vP), an = fract(atan(vP.x, vP.y) / 6.2832 + 1.0), on = step(uUn, an) * step(an, uSewn) * step(0.98, uPhase);
  float bar = on * step(abs(fract(an * 30.0) - 0.5), 0.15) * step(0.93, r) * step(r, 1.13), rope = on * step(0.985, r) * step(r, 1.03), st = max(bar, rope);
  vec3 sc = mix(0.62 + 0.38 * cos(6.2832 * (an + vec3(0.0, 0.33, 0.67))), vec3(1.0), 0.45), c;
  if (r < 1.0) { if (length(vP - vec2(0.42 + 2.2 * uPhase, 0.12 * (1.0 - uPhase))) < 0.92) discard;
    vec3 plain = vec3(0.30, 0.52, 0.95) * (0.75 + 0.25 * sin(vP.x * 9.0) * sin(vP.y * 7.0 + 1.0)), tex = mix(plain, texture2D(tM, vP * 0.46 + 0.5).rgb, uHasM);
    c = mix(vec3(0.85, 0.95, 1.0), tex, smoothstep(0.15, 0.9, uPhase)) * uBright * (1.0 - 0.25 * smoothstep(0.9, 1.0, r)); c = mix(c, sc, st); }
  else { if (st < 0.5) discard; c = sc; }
  gl_FragColor = vec4(c, 1.0); }` }));
    mesh.frustumCulled = false; mesh.renderOrder = 4; mesh.visible = false; fx.add(mesh); fxAuto.push(mesh);
    const halo = sprite(glowTex, [0.35, 0.55, 1.0], 3); fxAuto.push(halo); let spin = 0; const _qs = Qt(), UPY = V3(0, 1, 0);
    mesh.onBeforeRender = (r, sc, cam) => { mesh.quaternion.copy(cam.quaternion); if (spin) mesh.quaternion.multiply(_qs.setFromAxisAngle(UPY, spin)); mesh.updateMatrixWorld(); };
    return { mesh,
      // p: its middle (world); rad: its radius; phase 0 crescent to 1 full; sewn, un: the stitched part of its rim runs from un to sewn (0 to 1, clockwise from the top)
      show(p, rad, phase, sewn, un, bright, turn) { mesh.visible = rad > 0.002; if (!mesh.visible) return; mesh.position.copy(p); mesh.scale.setScalar(rad); U.uPhase.value = phase; U.uSewn.value = sewn; U.uUn.value = un; U.uBright.value = bright; spin = turn || 0; show(halo, p, rad * 3.6, 0.5 * bright * (0.4 + 0.6 * phase)); },
      // a point on its rim (world), for the needle: an 0 to 1 clockwise from the top as seen by whoever is looking
      rim(an, k, out) { const a = an * 2 * PI; return out.set(Math.sin(a) * k, Math.cos(a) * k, 0.02).applyMatrix4(mesh.matrixWorld); } };
  })();

  (function foxSpells4() {
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr }), K = (t, ...o) => Object.assign({ t }, ...o), UPV = V3(0, 1, 0), _q4 = Qt();
    const _a = V3(), _b = V3(), _c = V3(), _d = V3(), RT = V3(), BK = V3(), c3 = [0, 0, 0];
    const restArm = (S) => ({ ['h' + S]: 'rest', ['e' + S]: 'rest', ['f' + S]: 'rest', ['tw' + S]: 'rest', ['wr' + S]: 'rest' }), stand = { hip: [0, 0, 0], hipR: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest' };
    const FR = { X: V3(), Z: V3(), O: V3() }; let spinWas = 0;
    const frame = () => { root.getWorldQuaternion(_q4); FR.X.set(1, 0, 0).applyQuaternion(_q4).applyAxisAngle(UPV, -spinWas); FR.Z.set(0, 0, 1).applyQuaternion(_q4).applyAxisAngle(UPV, -spinWas); root.getWorldPosition(FR.O); spinWas = spinNow; };
    const many = (n, dt, f) => { const x = n * dt; for (let i = 0; i < x || (i === 0 && Math.random() < x); i++) f(); };
    const flame = (p, spread, size, up) => emit(p.x + rs() * spread, p.y + rs() * spread * 0.5, p.z + rs() * spread, rs() * 0.06, (up || 0.3) * (0.5 + Math.random()), rs() * 0.06, 0.3 + Math.random() * 0.35, size * (0.6 + 0.7 * Math.random()), Math.random() < 0.3 ? COL.foxPale : COL.fox, -0.2, 0.9);
    // her tails behind her as whoever is looking sees her: RT runs across their view, BK away from them
    const fan = (open, len, spread, op, t) => { const h = anchor('hips', _a); BK.copy(FR.Z).negate(); if (RIB.seen) { _b.subVectors(h, RIB.eye); _b.y = 0; if (_b.lengthSq() > 0.04) BK.copy(_b).normalize(); } RT.set(-BK.z, 0, BK.x); h.addScaledVector(BK, 0.14 * FOX_K); h.y += 0.04 * FOX_K; TAILS.shape(h, RT, BK, open, len * FOX_K, spread, op, t); return h; };
    const mantle = (k, dt) => { if (k < 0.02) return; SK.uarmR.getWorldPosition(_b); SK.uarmL.getWorldPosition(_c); many(46 * k, dt, () => { _d.lerpVectors(_b, _c, Math.random()); _d.y += 0.045 * FOX_K; flame(_d, 0.03, 0.03, 0.22); });       // a mantle of blue flame along her shoulders, and her ears lit
      const cr = anchor('crown', _d); many(18 * k, dt, () => { const s = Math.random() < 0.5 ? -1 : 1; emit(cr.x + s * RT.x * 0.085 + rs() * 0.02, cr.y + 0.02 + Math.random() * 0.05, cr.z + s * RT.z * 0.085 + rs() * 0.02, 0, 0.12, 0, 0.3, 0.022, COL.foxPale, -0.1, 0.8); }); };
    const BELLK = [-0.125, 1.28, 0.102], akL = arm('L', [0.215, 0.985, 0.03], [1, 0.05, -0.45], FP.soft, 0.3, [0.2, 0]), akR = arm('R', [-0.215, 0.985, 0.03], [-1, 0.05, -0.45], FP.soft, 0.3, [0.2, 0]);      // BELLK: two fingers on her bell, elbow down (poses.py, tipR onto the bell); akL, akR: a hand on her hip

    // When the Bell Falls Silent (J6). She lays two fingers on her bell and holds it still. Her smile goes. Nine tails of foxfire open behind her
    // like a peacock's fan, blue flame lies along her shoulders, the stage dims. Then she lets the bell go, it rings, and she is herself again.
    (function () {
      const dur = 6.0, T_ST = 0.95, T_OPEN = 1.5, T_SHUT = 4.4, T_GO = 4.9, keys = [], onBell = arm('R', BELLK, [-0.5, -1, 0.1], FP.two, 0.6, [0.6, 0.4]), tog = { hip: [0, 0, 0], ftR: [0.045, 0, 0, 0, 0], ftL: [-0.045, 0, 0, 0, 0], knR: 'rest', knL: 'rest' };
      keys.push(K(0.40, { hd: [0.10, 0, 0.12], sp: [0, 0, 0.03], mouth: 2, eyes: 0 }, restArm('L')));
      keys.push(K(T_ST, { hd: [0, 0.03, 0.04], sp: [0, 0, 0], mouth: 2 }, onBell, tog)); keys.push(K(1.15, { hd: [0, 0.03, 0.04], mouth: 2 }, onBell));
      keys.push(K(T_OPEN, { hd: [0, 0, 0], sp: [0, -0.03, 0], mouth: 0, eyes: 0 }, onBell, tog));                                                          // the smile goes
      keys.push(K(2.90, { eyes: 0 })); keys.push(K(3.02, { eyes: 1 })); keys.push(K(3.18, { eyes: 0 }));                                                   // one slow blink
      keys.push(K(T_SHUT, { hd: [0, 0, 0], sp: [0, -0.03, 0], mouth: 0, eyes: 0 }, onBell, tog));
      keys.push(K(T_GO, { hd: [0, 0.02, 0.03], mouth: 0 }, onBell)); keys.push(K(T_GO + 0.12, {}, arm('R', [BELLK[0] - 0.03, BELLK[1] - 0.012, BELLK[2] + 0.025], [-0.5, -1, 0.1], FP.two, 0.6, [0.4, 0.4])));
      keys.push(K(5.30, { hd: [-0.06, 0, 0.10], sp: [0, 0, 0.02], mouth: 2 })); keys.push(K(5.65, { hd: [-0.04, 0, 0.08], sp: [0, 0, 0], mouth: 2 }, restArm('R'), stand));
      defAction('bell_silent', dur, keys, { outro: 0.3, stand: true, cues: [T_ST / dur, T_GO / dur],
        start() { spinWas = 0; },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          const open = sm(T_OPEN, T_OPEN + 1.3, T) * (1 - sm(T_SHUT, T_SHUT + 0.75, T)), hush = win(T, T_ST, T_GO + 0.3, 0.5);
          dim(0.55 * hush); const h = fan(open, 1.8, 1.22, Math.min(1, open * 1.4), t); mantle(open, dt);
          if (open > 0.02) { _b.copy(h); _b.y += 0.7 * FOX_K; light(_b, 1.5 * open, 0x4f8cff); many(22 * open, dt, () => { _c.copy(h).addScaledVector(RT, rs() * 1.1 * open); _c.y += (0.3 + Math.random() * 1.6) * FOX_K; flame(_c, 0.05, 0.03, 0.15); }); }
          if (cue(a, 'still', T_ST)) burst(anchor('tipR', _b), 12, 0.35, 0.5, 0.02, COL.foxPale, -0.1, 1.6, 0.1);
          if (cue(a, 'ring', T_GO + 0.06)) { const p = anchor('tipR', _b); burst(p, 26, 0.9, 0.5, 0.028, COL.gold, 0.2, 1.3, 0.3); shock(p, 0.02, 0.22, 0.35, COL.gold); }
        } });
    })();

    // The Moon's Little Lie (J7, J8), her biggest spell. A crescent no bigger than a coin spins on her raised fingertip. She flicks it up: it climbs,
    // grows and fills into a huge blue moon, and a needle sews it onto the sky like a patch. Arms wide, head back, her nine tails out: its light falls
    // on her target. Then the stitches come undone, the moon drops back into her open hand as a coin, and she closes her fingers on it.
    (function () {
      const dur = 7.0, T_ON = 0.55, T_FL = 2.18, T_UP = 3.25, T_SEW = 4.15, T_HIT = 4.35, T_UN = 5.05, T_FALL = 5.65, T_CATCH = 6.25, keys = [];
      const up = (y, wr) => arm('R', [-0.33, y, 0.06], [-1, -0.45, -0.05], FP.point, 0.4, [wr || 0.1, 0]), wide = [arm('R', [-0.44, 1.40, 0.02], [-0.4, -1, -0.3], FP.open, 1.3, [0.2, 0]), arm('L', [0.44, 1.40, 0.02], [0.4, -1, -0.3], FP.open, 1.3, [0.2, 0])];
      const palm = (f) => arm('R', [-0.24, 1.13, 0.27], [-0.7, -1, -0.2], f, 1.35, [-0.25, 0]);
      keys.push(K(T_ON, { hd: [-0.22, -0.20, 0.06], sp: [0, 0, 0.03], hip: [0.02, 0, 0], mouth: 2 }, up(1.60), akL)); keys.push(K(1.85, { hd: [-0.22, -0.20, 0.06], sp: [0, 0, 0.03] }, up(1.60), akL));      // the coin on her fingertip (J7)
      keys.push(K(2.04, { hd: [-0.20, -0.16, 0.06] }, up(1.54, 0.3))); keys.push(K(T_FL + 0.04, { hd: [-0.16, -0.34, 0.04] }, up(1.69, -0.15))); keys.push(K(2.50, { hd: [-0.10, -0.36, 0.02] }, up(1.66)));     // and up it goes
      keys.push(K(3.05, { hd: [-0.08, -0.36, 0.02], sp: [0, -0.04, 0.02] }, up(1.62), akL));
      keys.push(K(3.50, { hd: [0, -0.30, 0], sp: [0, -0.10, 0], hip: [0, 0, 0], mouth: 2, sh: [0, 0] }, wide[0], wide[1]));                                                                                   // arms wide, head back (J8)
      for (let i = 0; i < 3; i++) { keys.push(K(4.50 + i * 0.2, { sh: [0.5, 0.5] })); keys.push(K(4.60 + i * 0.2, { sh: [0, 0] })); }
      keys.push(K(5.10, { hd: [0, -0.30, 0], sp: [0, -0.10, 0], sh: [0, 0] }, wide[0], wide[1]));
      keys.push(K(5.70, { hd: [-0.10, -0.12, 0.05], sp: [0, 0, 0.02], mouth: 2 }, palm(FP.open), akL)); keys.push(K(T_CATCH - 0.04, { hd: [-0.12, 0.10, 0.05] }, palm(FP.open)));                               // her hand out for what comes down
      keys.push(K(T_CATCH + 0.14, { hd: [-0.12, 0.10, 0.05], mouth: 2 }, palm(FP.fist))); keys.push(K(6.60, { hd: [0.05, 0, 0.10], sp: [0, 0, 0.02] }, palm(FP.fist), akL));
      keys.push(K(6.85, { hd: [0, 0, 0.05], sp: [0, 0, 0], mouth: 2 }, restArm('R'), restArm('L'), stand));
      const p0 = V3(), sky = V3(), tg = V3(), mp = V3(); let has = false;
      defAction('moons_little_lie', dur, keys, { outro: 0.3, stand: true, hits: [T_HIT / dur], cues: [T_FL / dur, T_UP / dur, T_CATCH / dur], impact: 0.9,
        start() { has = false; spinWas = 0; },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          tg.copy(FR.O).addScaledVector(FR.X, 2.6 * tgtK); fxHitP.copy(tg); fxHitP.y += 1.1 * FOX_K;
          if (!has || T < T_FL) { sky.copy(FR.O).addScaledVector(FR.X, 1.0 * tgtK).addScaledVector(FR.Z, -2.0); sky.y += 3.45 * FOX_K; has = true; }
          const tip = anchor('tipR', _a); tip.y += 0.045 * FOX_K;
          const RAD = 1.55 * FOX_K, g = sm(T_FL, T_UP, T), fall = sm(T_FALL, T_CATCH, T), sewn = cl((T - T_UP) / (T_SEW - T_UP), 0, 1), un = cl((T - T_UN) / (T_FALL - T_UN), 0, 1);
          if (T < T_FL) { p0.copy(tip); mp.copy(tip); } else if (T < T_FALL) { mp.lerpVectors(p0, sky, 1 - Math.pow(1 - g, 2.2)); } else { const hd = anchor('handR', _b); hd.y += 0.05 * FOX_K; mp.lerpVectors(sky, hd, fall * fall); }
          const rad = lerp(0.034 * FOX_K, RAD, T < T_FALL ? g * g * (3 - 2 * g) : Math.pow(1 - fall, 1.6)), phase = T < T_FALL ? sm(T_FL + 0.25, T_UP - 0.1, T) : 1 - sm(T_FALL + 0.1, T_CATCH - 0.08, T);
          const flash = win(T, T_HIT - 0.12, T_HIT + 0.7, 0.12), seen = sm(T_ON - 0.2, T_ON + 0.1, T) * (T < T_CATCH ? 1 : 0);
          if (seen > 0.01) MOON.show(mp, rad * seen, phase, sewn, un, 1 + 0.9 * flash, (1 - Math.max(g, 0)) * (t * 9 % (2 * PI)) * (T < T_FALL ? 1 : 0) + (T >= T_FALL ? fall * fall * 12 : 0));
          if (T < T_FL + 0.1) { many(8, dt, () => emit(mp.x + rs() * 0.03, mp.y + rs() * 0.03, mp.z + rs() * 0.03, 0, 0.05, 0, 0.3, 0.02, COL.foxPale, 0, 0.8)); light(mp, 0.5 * seen, 0xcfe4ff); }
          else if (T < T_CATCH) light(mp, 1.6 * phase * (1 + flash), 0x5f96ff);
          if (cue(a, 'flick', T_FL)) burst(tip, 16, 0.7, 0.4, 0.025, COL.foxPale, 0.2, 1.2, 0.5);
          if (sewn > 0 && sewn < 1) { MOON.rim(sewn, rad * 1.07, _b); MOON.rim(Math.min(1, sewn + 0.01), rad * 1.07, _c); SLIT.needle(_b, _c.sub(_b), 1);                                               // the needle goes round its rim
            RIB.path((u, o) => MOON.rim(Math.max(0, sewn - 0.10 * (1 - u)), rad * (1.07 + 0.05 * Math.sin(u * 40)), o), 0.02, 1, t * 0.5, 0.6, 2); many(30, dt, () => { RIB.thCol(Math.random(), c3); emit(_b.x, _b.y, _b.z, rs() * 0.3, rs() * 0.3, rs() * 0.3, 0.4, 0.05, c3, 0.2, 0.9); }); }
          const open = sm(T_UP - 0.15, T_UP + 0.55, T) * (1 - sm(T_UN + 0.2, T_FALL + 0.3, T)); fan(open, 2.0, 1.72, Math.min(1, open * 1.4), t); mantle(open * 0.7, dt);
          dim(0.6 * win(T, T_UP - 0.2, T_FALL, 0.4));
          const bm = win(T, T_HIT - 0.1, T_HIT + 0.75, 0.1); if (bm > 0.01) { _b.copy(tg); beam(_b, 0.95, mp.y - tg.y, 0.75 * bm, [0.42, 0.62, 1.0]); _c.copy(tg); _c.y += 1.0 * FOX_K; light(_c, 2.2 * bm, 0x6fa0ff); many(60 * bm, dt, () => { _d.copy(tg); _d.y += Math.random() * 2.2; flame(_d, 0.3, 0.04, -0.6); }); }
          if (cue(a, 'hit', T_HIT)) { _b.copy(tg); shock(_b, 0.2, 1.5, 0.6, [0.6, 0.78, 1.0], true); _b.y += 1.0 * FOX_K; burst(_b, 110, 2.8, 0.7, 0.05, COL.fox, 0.5, 1.3, 0.5); burst(_b, 50, 1.6, 0.9, 0.04, COL.foxPale, 0.3, 1.1, 0.8); }
          if (T > T_UN && T < T_FALL + 0.2) many(40, dt, () => { MOON.rim(un, rad * 1.07, _b); RIB.thCol(Math.random(), c3); emit(_b.x, _b.y, _b.z, rs() * 0.4, -0.2 + rs() * 0.3, rs() * 0.4, 0.5, 0.045, c3, 0.5, 0.9); });      // the stitches come undone
          if (cue(a, 'catch', T_CATCH)) { const hd = anchor('handR', _b); burst(hd, 30, 0.9, 0.5, 0.03, COL.foxPale, 0.2, 1.3, 0.4); shock(hd, 0.02, 0.2, 0.3, COL.foxPale); }
        } });
    })();
  })();

  // ---------- per-frame update ----------
  const st = { init: false, px: 0, py: 0, pz: 0, time: 0 };
  let fade = 1, userWind = V3(0, 0, 0);
  // where the chest sits for a pose, from the hips up the spine (root space): a stance carries the hands of any move played over it
  const _tm = new THREE.Matrix4(), _tm2 = new THREE.Matrix4(), _te = new THREE.Euler(), _tq = Qt(), _tp = V3(), _ts1 = V3(1, 1, 1), torsoD = new THREE.Matrix4(), torsoQ = Qt();
  function torsoM(P, out) {
    const hh = SK.hips.userData.home;
    _tq.setFromEuler(_te.set(P.hipR[1], P.hipR[0], P.hipR[2], 'YXZ')); out.compose(_tp.set(hh.x + P.hip[0], hh.y + P.hip[1], hh.z + P.hip[2]), _tq, _ts1);
    for (let i = 0; i < 3; i++) { const b = SK['spine' + (i + 1)]; _tq.setFromEuler(_te.set(P.sp[1] * SPF[i], P.sp[0] * SPF[i], P.sp[2] * SPF[i], 'YXZ')); out.multiply(_tm2.compose(b.position, _tq, b.scale)); }
    return out;
  }
  const torso0inv = torsoM(REST, new THREE.Matrix4()).invert();
  const LEGS = { hip: 1, hipR: 1, ftR: 1, ftL: 1, knR: 1, knL: 1 }; let spinNow = 0;
  // ---------- life in her hands (13 Nov) ----------
  // Keys say where a hand should be. Left at that, a hand is carried like a board, every finger moves at the same instant, and a key can snap the
  // wrist round faster than a wrist turns. Here, each frame, between the pose and the skeleton:
  //   - each finger follows its key a little late, and no two by the same amount;
  //   - wrist turns and bends are eased;
  //   - the hand drags behind the way it is travelling and swings through a little when it stops (a spring), as a loose wrist does.
  // A held pose settles to exactly what its key says, so a fingertip set on her lips still lands on her lips. opts.handLife: 0 turns it off.
  const HAND_LIFE = opts.handLife === undefined ? 1 : +opts.handLife, F_TAU = [0.050, 0.038, 0.052, 0.066, 0.080, 0.055], W_TAU = 0.032, DRAG = 0.11, DRAG_MAX = [0.40, 0.24], D_W = 16, D_Z = 0.60;
  const ARML = {}, lifePose = clonePose(REST), _lq = Qt(), _lr = Qt(), _ld = V3();
  for (const [S] of SIDES) ARML[S] = { init: false, hp: V3(), v: V3(), o: [0, 0], ov: [0, 0], f: [0, 0, 0, 0, 0, 0], tw: 0, wr: [0, 0] };
  function armLife(P, dt) {
    if (!(HAND_LIFE > 0) || !(dt > 0)) return P;
    const out = lifePose; for (const k of CHANS) { const x = P[k]; if (typeof x === 'number') out[k] = x; else { const o = out[k]; for (let i = 0; i < x.length; i++) o[i] = x[i]; } }
    root.getWorldQuaternion(_lr).invert();
    for (const [S] of SIDES) {
      const a = ARML[S], h = P['h' + S], f = out['f' + S], w = out['wr' + S];
      if (!a.init) { a.hp.set(h[0], h[1], h[2]); a.v.set(0, 0, 0); a.o[0] = a.o[1] = a.ov[0] = a.ov[1] = 0; for (let k = 0; k < 6; k++) a.f[k] = f[k]; a.tw = P['tw' + S]; a.wr[0] = w[0]; a.wr[1] = w[1]; a.init = true; }
      for (let k = 0; k < 6; k++) { a.f[k] += (f[k] - a.f[k]) * (1 - Math.exp(-dt / F_TAU[k])); f[k] = lerp(f[k], a.f[k], HAND_LIFE); }
      const kw = 1 - Math.exp(-dt / W_TAU); a.tw += (P['tw' + S] - a.tw) * kw; a.wr[0] += (w[0] - a.wr[0]) * kw; a.wr[1] += (w[1] - a.wr[1]) * kw;
      // how fast the hand is travelling (in her own space, so walking her about the stage does not count), smoothed over a few frames
      _ld.set(h[0], h[1], h[2]).sub(a.hp).multiplyScalar(1 / dt); a.hp.set(h[0], h[1], h[2]); if (_ld.lengthSq() > 400) _ld.set(0, 0, 0); a.v.lerp(_ld, 1 - Math.exp(-dt / 0.035));
      // the two ways the wrist can give: bending (fingertips toward the palm side) and tilting (toward the thumb or little-finger side)
      const HA = handAxes[S]; SK['ftwC' + S].getWorldQuaternion(_lq).premultiply(_lr);
      for (let i = 0; i < 2; i++) {
        _ld.crossVectors(i ? HA.palm : HA.curl, HA.along).applyQuaternion(_lq);
        const want = cl(-DRAG * a.v.dot(_ld), -DRAG_MAX[i], DRAG_MAX[i]);
        a.ov[i] += (-D_W * D_W * (a.o[i] - want) - 2 * D_Z * D_W * a.ov[i]) * dt; a.o[i] += a.ov[i] * dt; a.o[i] = cl(a.o[i], -0.55, 0.55);
      }
      out['tw' + S] = lerp(P['tw' + S], a.tw, HAND_LIFE); w[0] = lerp(w[0], a.wr[0] + a.o[0], HAND_LIFE); w[1] = lerp(w[1], a.wr[1] + a.o[1], HAND_LIFE);
    }
    return out;
  }
  function animate(phase, wb, t, dt, rb) {
    dt = dt > 0 ? Math.min(dt, 0.05) : 0; st.time = t; wb = wb || 0; rb = rb || 0;
    // the stance clock: forward to settle into a stance, backward to stand up out of it
    if (stance) {
      if (stanceTo !== stance.name) { stance.t -= dt * (stance.def.rise || 1.15); if (stance.t <= 0) { if (stance.def.leave) stance.def.leave(); stance = stanceTo ? { name: stanceTo, def: STANCES[stanceTo], t: 0 } : null; } }
      else stance.t = Math.min(stance.def.dur, stance.t + dt);
    } else if (stanceTo) stance = { name: stanceTo, def: STANCES[stanceTo], t: 0 };
    const sk = stance ? sm(0, 0.3, stance.t) : 0;
    fillBase(t, phase || 0, wb * (1 - sk), dt, rb * (1 - sk));
    if (stance) {
      evalPose(stance.def.tracks, stance.t, stPose);
      for (const k of CHANS) { if (typeof REST[k] === 'number') base[k] += stPose[k] - REST[k]; else for (let i = 0; i < REST[k].length; i++) base[k][i] += stPose[k][i] - REST[k][i]; }
      if (stance.def.live) stance.def.live(base, t, stance.t / stance.def.dur);
      torsoM(stPose, torsoD).multiply(torso0inv); torsoQ.setFromRotationMatrix(torsoD);
    }
    if (pending && !stance && !stanceTo) { const n = pending; pending = ''; play(n, true); }
    let P = base; spinNow = 0;
    if (act) {
      const tPrev = act.t; act.t += dt;
      for (const h of act.def.hits || []) { const th = h * act.dur; if (tPrev < th && act.t >= th) { state.hitN = (state.hitN || 0) + 1; state.hitK = act.def.impact || 0.55; state.hitName = act.type; } }      // a blow lands: hosts watch state.hitN to shake the picture or knock a target
      if (act.t >= act.dur && !act.def.hold) { if (act.def.end) act.def.end(act); act = null; }
      else {
        if (act.def.spinT) spinNow = evalTrack(act.def.spinT, Math.min(act.t, act.dur));
        const tt = Math.min(act.t, act.dur), tr = act.def.tracks, w = sm(0, 0.18, tt) * (act.def.hold ? 1 : 1 - sm(act.dur - 0.22, act.dur, tt));
        for (const k of CHANS) {
          if (tr[k] && !(stance && LEGS[k])) {
            const v = evalTrack(tr[k], tt, actPose[k]); if (typeof v === 'number') actPose[k] = v;
            if (stance) {                             // over a stance: hands ride with the chest, lean and gaze add to the stance's own
              const a = actPose[k];
              if (k === 'hR' || k === 'hL') { _va.set(a[0], a[1], a[2]).applyMatrix4(torsoD); a[0] = _va.x; a[1] = _va.y; a[2] = _va.z; }
              else if (k === 'eR' || k === 'eL') { _va.set(a[0], a[1], a[2]).applyQuaternion(torsoQ); a[0] = _va.x; a[1] = _va.y; a[2] = _va.z; }
              else if (k === 'sp' || k === 'hd') for (let i = 0; i < 3; i++) a[i] += stPose[k][i];
            }
          } else if (typeof base[k] === 'number') actPose[k] = base[k]; else for (let i = 0; i < base[k].length; i++) actPose[k][i] = base[k][i];
        }
        blendPose(cur, base, actPose, w); if (actPose.eyes < base.eyes) cur.eyes = base.eyes;
        P = cur;
      }
    }
    if (typeof GHOST !== 'undefined' && GHOST && GHOST.live) GHOST.pose();      // her ghost double takes its pose first; her own pose is then laid over the same bones
    poseDt = dt; applyPose(armLife(P, dt)); poseDt = 0;
    // a jump of the root (a teleport) lays the cloth and springs afresh instead of whipping them
    root.getWorldPosition(_va);
    if (!st.init || Math.hypot(_va.x - st.px, _va.y - st.py, _va.z - st.pz) > 1.0) { resetCloth(); for (const c of chains) c.reset(); st.init = true; }
    st.px = _va.x; st.py = _va.y; st.pz = _va.z;
    hipsInv.copy(SK.hips.matrixWorld).invert();
    for (const c of chains) c.update(dt);
    root.updateMatrixWorld(true);
    // walking in place still stirs the veils: an apparent wind from ahead
    _vb.set(0, 0, -1).applyQuaternion(_rq).multiplyScalar((2.6 * wb + 3.2 * rb) * (1 - sk) * (opts.treadmill === false ? 0 : 1)); WIND.copy(userWind).add(_vb);
    if (typeof bodyTick === 'function') bodyTick(t, dt);
    stepCloth(dt, t);
    if (typeof GHOST !== 'undefined' && GHOST) GHOST.asked = false;
    if (typeof foxAway !== 'undefined') foxAwayAsk = false;
    if (typeof updateFx === 'function') updateFx(t, dt, P);
    if (typeof foxAway !== 'undefined' && foxAway !== foxAwayAsk) { foxAway = foxAwayAsk; root.visible = fade > 0.001 && !foxAway; clothGroup.visible = !foxAway; state.away = foxAway; }      // she has stepped through a cut (Slip Stitch): gone only while a spell keeps asking
    if (typeof GHOST !== 'undefined' && GHOST && !GHOST.asked && GHOST.group.visible) GHOST.hide();
  }
  const ACTIONS = {};
  for (const n in ACTS) ACTIONS[n] = Object.freeze({ dur: ACTS[n].dur, hits: Object.freeze((ACTS[n].hits || []).slice()), cues: Object.freeze((ACTS[n].cues || []).slice()), hold: !!ACTS[n].hold });
  const STANCE_LIST = Object.freeze(Object.keys(STANCES));
  Object.freeze(ACTIONS);
  // named points in world space
  function anchor(name, out) {
    out = out || V3(); root.updateMatrixWorld(true);
    const at = (b, x, y, z) => { const B = SK[b], r = B.userData.rest; return out.set(x - r.x, y - r.y, z - r.z).applyMatrix4(B.matrixWorld); };
    switch (name) {
      case 'head': return at('head', 0, 1.50, 0.09);
      case 'crown': return at('head', 0, 1.70, 0);
      case 'handR': { const p = handPt(-1, 0.018, -0.06, 0.004); return at('handR', p.x, p.y, p.z); }
      case 'handL': { const p = handPt(1, 0.018, -0.06, 0.004); return at('handL', p.x, p.y, p.z); }
      case 'tipR': { const p = handPt(-1, 0, FINGERS[0][2] - FINGERS[0][3], 0.0315); return at('idx2R', p.x, p.y, p.z); }      // the tip of her first finger, whatever its length
      case 'tipL': { const p = handPt(1, 0, FINGERS[0][2] - FINGERS[0][3] - 0.001, 0.027); return at('idx2L', p.x, p.y, p.z); }
      case 'bladeA': return TOOL ? at('shears', TOOL.tip.x, TOOL.tip.y, TOOL.tip.z) : at('handR', 0, 0, 0);          // the points and middles of her two blades
      case 'bladeB': return TOOL ? at('shearB', TOOL.tip.x, TOOL.tip.y, TOOL.tip.z) : at('handL', 0, 0, 0);
      case 'bladeAm': return TOOL ? at('shears', TOOL.mid.x, TOOL.mid.y, TOOL.mid.z) : at('handR', 0, 0, 0);
      case 'bladeBm': return TOOL ? at('shearB', TOOL.mid.x, TOOL.mid.y, TOOL.mid.z) : at('handL', 0, 0, 0);
      case 'bells': return at('bell3', bellRest[3].x, bellRest[3].y - 0.035, bellRest[3].z);
      case 'feet': return out.set(0, 0, 0).applyMatrix4(root.matrixWorld);
      case 'pendant': { const tp = prof(TORSO, 1.306, true); return at('spine3', 0, 1.306, tp[3] + tp[1] + 0.012); }
      case 'chest': return at('spine3', 0, 1.22, 0.06);
      case 'hips': return at('hips', 0, 0.86, 0);
      case 'hit': if (typeof fxHit === 'function') return fxHit(out); return at('handL', restPts.wrL.x, restPts.wrL.y - 0.08, restPts.wrL.z);
      default: return at('spine3', 0, 1.22, 0.06);
    }
  }
  const state = {};
  function setFade(f) { const was = fade > 0.001; fade = cl(Number.isFinite(+f) ? +f : 1, 0, 1); const now = fade > 0.001; if (now !== was) { root.visible = now && !(typeof foxAway !== 'undefined' && foxAway); fx.visible = now; } }
  return {
    root, fx, skeleton, bones, animate, play, ACTIONS, anchor, setFade, state, setStance, STANCES: STANCE_LIST,
    stop() { act = null; pending = ''; },
    reset() { act = null; pending = ''; stance = null; stanceTo = ''; for (const S in ARML) { ARML[S].init = false; armSt[S].hang = -1; armSt[S].has = false; } resetCloth(); for (const c of chains) c.reset(); },
    get stance() { return stanceTo; }, set targetDist(v) { tgtK = v > 0 ? cl(v / 2.6, 0.4, 2.6) : 1; }, set target(o) { if (typeof tgtObj !== 'undefined') tgtObj = o || null; }, get target() { return typeof tgtObj !== 'undefined' ? tgtObj : null; },      // target: the Object3D she is aiming at, for spells that copy it (Same Cloth)
    get spin() { return spinNow; },      // spin: the host adds this to the root's turn (a twirl)
    get stanceNow() { return stance ? stance.name : ''; }, get stanceProgress() { return stance ? stance.t / stance.def.dur : 0; }, get pending() { return pending; },
    get fade() { return fade; }, get busy() { return !!act && !(act.def.hold && act.t >= act.dur); }, get action() { return act ? act.type : ''; },
    get progress() { return act ? Math.min(1, act.t / act.dur) : -1; }, get time() { return act ? act.t : -1; },
    get triangles() { return triCount; }, get dim() { return dimNow; }, set wind(v) { userWind.copy(v); }, get wind() { return userWind; },
    debug: { SK, cloths, cur, base, REST, FP, meshes, MATS, chains, applyPose, clonePose, fx3: typeof SLIT !== 'undefined' ? { RIB, SLIT, EGHOST, QUILT, tipOf } : null }
  };
}
