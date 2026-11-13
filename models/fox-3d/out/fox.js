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
    addBone('hand' + S, 'farm' + S, wr.x, wr.y, wr.z);
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

  // ---------- arms: bare, with a short puffed emerald sleeve gathered above the elbow ----------
  // radius along the arm, from the shoulder joint (0) to the wrist (0.47), read off B1 and A5
  const ARM_R = [[-0.035, 0.028], [0, 0.043], [0.04, 0.046], [0.11, 0.042], [0.19, 0.0365], [0.245, 0.0345], [0.30, 0.0355], [0.39, 0.030], [0.455, 0.0245], [0.475, 0.0235]];
  // the sleeve: [distance along the arm, radius, how deep the gathers are]
  const PUFF = [[-0.060, 0.030, 0], [-0.046, 0.056, 0.02], [-0.022, 0.072, 0.03], [0.012, 0.082, 0.025], [0.052, 0.086, 0.02], [0.092, 0.081, 0.03], [0.122, 0.067, 0.05], [0.140, 0.050, 0.07], [0.150, 0.0445, 0.07], [0.158, 0.0445, 0.07], [0.166, 0.051, 0.10], [0.180, 0.060, 0.15], [0.194, 0.066, 0.18]];
  const PUFF_K = PUFF.map((p) => [p[0], [p[1], p[2]]]);
  function wArm(S, sLen) {
    if (sLen < 0.05) { const u = sm(-0.035, 0.05, sLen); return [BI['clav' + S], (1 - u) * 0.6, BI.spine3, (1 - u) * 0.4, BI['uarm' + S], u]; }
    if (sLen < L_UARM + 0.05) { const u = sm(L_UARM - 0.05, L_UARM + 0.05, sLen); return [BI['uarm' + S], 1 - u, BI['farm' + S], u]; }
    const u = sm(L_UARM + L_FARM - 0.02, L_UARM + L_FARM + 0.012, sLen); return [BI['farm' + S], 1 - u, BI['hand' + S], u];
  }
  const braceletChains = [];                       // each strand of beads hangs on its own little spring, so the three knock about out of step
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], NS = Q(40, 18), NU = Q(28, 14);
    {                                              // the arm
      const pts = [], rad = [], ss = [];
      for (let i = 0; i <= NS; i++) { const sl = lerp(-0.035, 0.475, i / NS); pts.push(sh.clone().addScaledVector(d, sl)); const r = spline(ARM_R, sl); rad.push([r, r * 0.94]); ss.push(sl); }
      const rings = tubeRings(pts, rad, NU, V3(0, 0, 1)), cols = NU + 1;
      addPart('skin', loft(rings, { capA: true }), (x, y, z, i) => wArm(S, i < ss.length * cols ? ss[Math.floor(i / cols)] : ss[0]), { out: centroidOf(rings) });
    }
    {                                              // her bracelets (F2), three strands stacked above each wrist: large dark wood beads, small gold ones, medium wood ones
      const bz = V3(0, 0, 1), by = V3().crossVectors(bz, d).normalize(), bx = V3().crossVectors(d, by).normalize();
      for (const [sl, br, nb, key, ph] of [[0.4130, 0.0056, 13, 'woodbead', 0.0], [0.4285, 0.0031, 27, 'bellm', 0.3], [0.4420, 0.0040, 20, 'woodbead', 0.7]]) {
        const c = sh.clone().addScaledVector(d, sl), R = spline(ARM_R, sl) + br * 0.80, c2 = c.clone().addScaledVector(d, 0.035), bn = 'br' + S + Math.round(sl * 1000);
        addBone(bn + 'a', 'farm' + S, c.x, c.y, c.z); addBone(bn + 'b', bn + 'a', c2.x, c2.y, c2.z); braceletChains.push({ names: [bn + 'a', bn + 'b'], anchor: 'farm' + S, k: 0.14 + 0.5 * br * 20 });
        const wf = (() => { const w = [BI[bn + 'a'], 1]; return () => w; })();
        for (let k = 0; k < nb; k++) {
          const a = ph + (k / nb) * TAU, q = c.clone().addScaledVector(bx, Math.cos(a) * R).addScaledVector(by, Math.sin(a) * R * 0.94);
          addPart(key, spherePart(q, br, br, br, 8, 6), wf, { out: q });
        }
      }
    }
    {                                              // the sleeve: one gathered sheet, open at the ruffle
      const NP = Q(34, 16), NV = Q(72, 36), rings = [], ss = [], GATH = 15;
      const ax = d.clone(), bz = V3(0, 0, 1), by = V3().crossVectors(bz, ax).normalize();
      for (let i = 0; i <= NP; i++) {
        const sl = lerp(PUFF[0][0], PUFF[PUFF.length - 1][0], i / NP), [r, gd] = spline(PUFF_K, sl), c = sh.clone().addScaledVector(ax, sl), ring = [];
        for (let j = 0; j < NV; j++) {
          const a = (j / NV) * TAU, rr2 = r * (1 + gd * Math.sin(a * GATH + sl * 40) + 0.5 * gd * Math.sin(a * 7 + 1.3));
          // the puff sits a little above and outside the arm's line, as cloth held up by its own gathers does
          const lift = 0.010 * Math.exp(-Math.pow((sl - 0.05) / 0.06, 2));
          ring.push([c.x + (bz.x * Math.cos(a) + by.x * Math.sin(a)) * rr2 + s * lift * 0.6, c.y + (bz.y * Math.cos(a) + by.y * Math.sin(a)) * rr2 + lift, c.z + (bz.z * Math.cos(a) + by.z * Math.sin(a)) * rr2]);
        }
        rings.push(ring); ss.push(sl);
      }
      const cols = NV + 1;
      addPart('emerald', loft(rings, { capA: true, uS: 6, vS: 2 }), (x, y, z, i) => wArm(S, i < ss.length * cols ? Math.max(0.02, ss[Math.floor(i / cols)]) : 0.02), { out: centroidOf(rings) });
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
      const y = lerp(0.875, 0.247, i / NR), [rx, rzF, rzB, cx, cz] = spline(LEG_UP, y), ring = [];
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
      const nb = G.wB[v], nw = G.wW[v], w = []; for (let k = 0; k < nb.length; k++) w.push(BI[nb[k] + S], nw[k]); wts[i] = w;
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
      addPart('frame', spherePart(V3(sx * 0.0118, ey - 0.011, zf - 0.0115), 0.0022, 0.0034, 0.0012, 8, 6), wHead, { out: V3(sx * 0.0118, ey - 0.011, zf - 0.0115) });      // nose pad
      const disc = [[], []]; for (let i = 0; i < NS; i++) { const a = (i / NS) * TAU; disc[0].push([sx * ex, ey, zf - 0.0012]); disc[1].push([sx * ex + (R - wire) * Math.cos(a), ey + (R - wire) * Math.sin(a), zf - 0.0012 - 0.004 * Math.pow(Math.abs(sx * ex + R * Math.cos(a)) / 0.06, 2)]); }
      addPart('lens', loft(disc), wHead, { out: V3(sx * ex, ey, 0) });
    }
    const br = curvePts([V3(-(ex - R), ey + 0.004, zf - 0.001), V3(-0.004, ey + 0.0105, zf + 0.001), V3(0.004, ey + 0.0105, zf + 0.001), V3(ex - R, ey + 0.004, zf - 0.001)], 12);
    addPart('frame', loft(tubeRings(br, br.map(() => wire), 6)), wHead, { out: V3(0, ey - 0.02, zf) });
  })();
  // ---------- her patchwork trousers (shape: F6 and the round 4 paintings; sizes: A1; cloth: the swatch sheets F9 and F10) ----------
  // First build. They are sewn shapes carried by her hips, thighs and shins; they do not yet fall and swing as cloth of their own.
  // In A1 each leg is about 33 cm across from the knee to mid-calf, the two meet at the middle, and the cloth is gathered in at the top of each boot.
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
      for (const [yTop, yHem, g0, g1, key, ph, dip] of [[0.700, 0.435, 0.005, 0.020, 'patch', 1.3, 0.050], [0.815, 0.585, 0.010, 0.028, 'patch2', 0.4, 0.060]]) {
        const NT = Q(12, 7), tr = [];
        for (let i = 0; i <= NT; i++) {
          const t = i / NT, ring = [];
          for (let j = 0; j < NU; j++) {
            const a = (j / NU) * TAU, y = lerp(yTop, yHem - dip * (0.5 + 0.5 * Math.sin(a * 4 + ph)), t), [cxo, rx, rz] = legAt(y), g = lerp(g0, g1, t) + 0.014 * t * Math.sin(a * 13 + ph * 3 + t * 5);
            ring.push([s * cxo + (rx + g) * Math.sin(a), y, ZC + (rz + g) * Math.cos(a)]);
          }
          tr.push(ring);
        }
        addPart(key, loft(tr, { uS: 2, vS: 0.8, u0: ph * 0.13 }), wLeg, { out: V3(s * 0.15, (yTop + yHem) / 2, ZC) });
      }
      // the magenta frill where each leg is gathered onto her boot
      const fr = [];
      for (let i = 0; i <= 4; i++) { const t = i / 4, ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, r = lerp(0.056, 0.086, t) + 0.011 * t * Math.sin(a * 15); ring.push([s * 0.089 + r * Math.sin(a), lerp(0.262, 0.212, t) + 0.004 * t * Math.sin(a * 15 + 1), -0.004 + r * 1.22 * Math.cos(a)]); } fr.push(ring); }
      addPart('frill', loft(fr), () => [SHN, 1], { out: V3(s * 0.089, 0.24, -0.004) });
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
    skin: sheen(std({ color: SKIN ? lin('#d8ccc6').multiply(lin(SKIN)) : lin('#dcb49c'), roughness: 0.64, envMapIntensity: 0.2, emissive: lin(SKIN || PAL.skin), emissiveIntensity: SKIN ? 0.44 : 0.42 }), '#ffb49a', 3.2, 0.1),
    hand: (() => { const t = bakedTex('hands', 1024, 1024, SKIN || '#d99f91'); return sheen(std({ map: t, color: lin('#d8ccc6'), roughness: 0.62, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.44 }), '#ffb49a', 3.2, 0.08); })(),
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
    patch: (() => { const t = bakedTex('patch', 1024, 1024, '#a03c5c'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return sheen(std({ map: t, color: lin('#d2c8c2'), roughness: 0.86, side: THREE.DoubleSide }), '#ffd0a0', 3, 0.12); })(),      // her patchwork (F9)
    patch2: (() => { const t = bakedTex('patch2', 768, 768, '#a03c5c'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return sheen(std({ map: t, color: lin('#d2c8c2'), roughness: 0.86, side: THREE.DoubleSide }), '#ffd0a0', 3, 0.12); })(),     // the second sheet (F10), for the upper flounce
    frill: sheen(std({ color: lin('#a02f6c'), roughness: 0.80, side: THREE.DoubleSide }), '#ff9ad0', 3, 0.2),
    neck: (() => {                                   // her neck: the chest's tone where it leaves the collar, her face's tone above the choker, darkening into the shade under her jaw
      const c = cvs(8, 128), g = c.getContext('2d'), CH = (BAKED && BAKED.skinChest) || SKIN || '#e0a890', J = (BAKED && BAKED.skinJaw) || SKIN || '#c08068', F = SKIN || '#d89780';
      const ratio = (hex, k) => { const a = new THREE.Color(hex), b = new THREE.Color(CH); return 'rgb(' + [a.r / b.r, a.g / b.g, a.b / b.b].map((v) => Math.round(255 * Math.min(1, v * k))).join(',') + ')'; };
      const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.24, '#ffffff'); gr.addColorStop(0.34, ratio(F, 1.0)); gr.addColorStop(0.50, ratio(F, 0.93)); gr.addColorStop(0.62, ratio(J, 0.92)); gr.addColorStop(1, ratio(J, 0.85));
      g.fillStyle = gr; g.fillRect(0, 0, 8, 128); const t = ctex(c);
      return sheen(std({ color: lin('#d8ccc6').multiply(lin(CH)), map: t, emissive: lin(CH), emissiveMap: t, emissiveIntensity: 0.44, roughness: 0.64, envMapIntensity: 0.2 }), '#ffb49a', 3.2, 0.1);
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
  SK.spine1.scale.setScalar(UPK); SK.head.scale.setScalar(opts.headScale || 0.93); SK.head.position.y -= (opts.headDrop === undefined ? 0.0233 : opts.headDrop); root.updateMatrixWorld(true);   // horns keep their size as the head shrinks       // after the bind, so head, cap, horns and their veils all shrink about the neck
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
    LIMB['arm' + S] = { inv: basisQ(ax, az, Qt()).invert(), l1: L_UARM * UPK, l2: L_FARM * UPK };
    const hip = SK['thigh' + S].userData.rest, kn = SK['shin' + S].userData.rest, an = SK['foot' + S].userData.rest;
    const lx = kn.clone().sub(hip).normalize(), lz = V3(0, 0, 1).cross(lx).normalize();
    const lx2 = an.clone().sub(kn).normalize(), lz2 = V3(0, 0, 1).cross(lx2).normalize();
    LIMB['leg' + S] = { inv: basisQ(lx, lz, Qt()).invert(), inv2: basisQ(lx2, lz2, Qt()).invert(), l1: hip.distanceTo(kn), l2: kn.distanceTo(an) };
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
  const FP = { relax: [0.32, 0.30, 0.36, 0.42, 0.48, 0.12], open: [0.04, 0.03, 0.02, 0.05, 0.09, 0.95], soft: [0.14, 0.12, 0.17, 0.22, 0.28, 0.55], point: [0.62, 0.0, 0.86, 0.92, 0.94, 0.08],
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
  const REST = {
    hip: [0, 0, 0], hipR: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], sh: [0, 0],
    hR: [-0.300, 0.868, 0.055], hL: [0.300, 0.868, 0.055], eR: [-0.55, -0.1, -1], eL: [0.55, -0.1, -1], twR: 0, twL: 0, wrR: [0.1, 0], wrL: [0.1, 0],
    fR: FP.relax.slice(), fL: FP.relax.slice(),
    ftR: [0, 0, 0, -0.10, 0, 0, 0], ftL: [0, 0, 0, 0.10, 0, 0, 0], knR: [-0.12, 0, 1], knL: [0.12, 0, 1],
    eyes: 0, mouth: 0, glow: 0
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
  const _J = new THREE.Vector3();                  // the waist joint: hand targets shrink toward it with the upper body

  // ---------- applying a pose: spine by angles, arms and legs onto their targets, then springs and cloth ----------
  const SPF = [0.25, 0.35, 0.40], MOUTHS = ['rest', 'open', 'smile'];
  const _T = V3(), _A = V3(), _P = V3(), _pq = Qt(), _mq = Qt(), _rq = Qt(), _fq = Qt();
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
      _T.set(h[0], h[1], h[2]).applyMatrix4(root.matrixWorld); SK.spine1.getWorldPosition(_J); _T.sub(_J).multiplyScalar(UPK).add(_J); _P.set(e[0], e[1], e[2]).applyQuaternion(_rq);
      solveLimb(SK['uarm' + S], SK['farm' + S], _A, _T, _P, LIMB['arm' + S], -s * P['tw' + S], _pq, _mq);
      const HA = handAxes[S], w = P['wr' + S];
      _qa.setFromAxisAngle(HA.curl, w[0]); _qb.setFromAxisAngle(HA.palm, w[1]); SK['hand' + S].quaternion.copy(_qb).multiply(_qa);
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
    root.updateMatrixWorld(true);
    paintFace(P.eyes, MOUTHS[Math.round(cl(P.mouth, 0, 2))], P.glow);
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
      B['tw' + S] = 0.05 * sw * s; B['wr' + S][0] = 0.1 + 0.03 * br2; B['wr' + S][1] = 0;
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
  pPoints.onBeforeRender = (r) => { r.getDrawingBufferSize(_dbs); pMat.uniforms.uVH.value = _dbs.y; };
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
    applyPose(P);
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
    if (typeof updateFx === 'function') updateFx(t, dt, P);
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
      case 'tipR': { const p = handPt(-1, 0, -0.164, 0.0315); return at('idx2R', p.x, p.y, p.z); }
      case 'tipL': { const p = handPt(1, 0, -0.165, 0.027); return at('idx2L', p.x, p.y, p.z); }
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
  function setFade(f) { const was = fade > 0.001; fade = cl(Number.isFinite(+f) ? +f : 1, 0, 1); const now = fade > 0.001; if (now !== was) { root.visible = now; fx.visible = now; } }
  return {
    root, fx, skeleton, bones, animate, play, ACTIONS, anchor, setFade, state, setStance, STANCES: STANCE_LIST,
    stop() { act = null; pending = ''; },
    reset() { act = null; pending = ''; stance = null; stanceTo = ''; resetCloth(); for (const c of chains) c.reset(); },
    get stance() { return stanceTo; }, set targetDist(v) { tgtK = v > 0 ? cl(v / 2.6, 0.4, 2.6) : 1; }, get spin() { return spinNow; },      // spin: the host adds this to the root's turn (a twirl)
    get stanceNow() { return stance ? stance.name : ''; }, get stanceProgress() { return stance ? stance.t / stance.def.dur : 0; }, get pending() { return pending; },
    get fade() { return fade; }, get busy() { return !!act && !(act.def.hold && act.t >= act.dur); }, get action() { return act ? act.type : ''; },
    get progress() { return act ? Math.min(1, act.t / act.dur) : -1; }, get time() { return act ? act.t : -1; },
    get triangles() { return triCount; }, get dim() { return dimNow; }, set wind(v) { userWind.copy(v); }, get wind() { return userWind; },
    debug: { SK, cloths, cur, base, REST, FP, meshes, MATS, chains, applyPose, clonePose }
  };
}
