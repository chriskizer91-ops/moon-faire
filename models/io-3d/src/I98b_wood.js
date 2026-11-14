  // ===== I98b_wood.js: living wood (stage twelve): the seed, its roots of light, the sapling, and the Elderwood Guardian =====
  // Chris, November 14: "Let's continue to the Elderwood Guardian and the Moonflower" Garden.
  // Paintings H7 to H10 and I4. The magic rules: "ROOTS AND VINES of living wood: pale brown, smooth, with small green leaves opening
  // along them"; her spirits are "made of living wood, roots and leaves, with eyes of green-gold light".
  // Everything here is made of BRAIDS: a handful of round strands wound round a shape, every other one wound the other way and a
  // little deeper, so the thing reads as roots twisted together (H9) and not as a smooth statue.
  const wLin = (hex) => { const c = new THREE.Color(hex).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
  const wMix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const wHash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const WOODC = { light: wLin(0xa98350), mid: wLin(0x7d5c38), dark: wLin(0x4b3421), bark: wLin(0x6a4e31), vine: wLin(0x5f6a2c), moss: wLin(0x6f8c32), leafA: wLin(0xa6d052), leafB: wLin(0x7cab3a), white: wLin(0xf6f2e2), hoof: wLin(0x3b2b1d), seed: wLin(0xd8a53e), seedD: wLin(0x9a6a22) };
  const woodMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0, side: THREE.DoubleSide });
  const wBag = () => ({ pos: [], col: [], idx: [], key: [] });
  const wCrom = (K, u, out) => { const n = K.length - 1, x = cl(u, 0, 1) * n, i = Math.min(n - 1, Math.floor(x)), t = x - i, p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(n, i + 2)], t2 = t * t, t3 = t2 * t;
    return out.set(0, 0, 0).addScaledVector(p0, -0.5 * t3 + t2 - 0.5 * t).addScaledVector(p1, 1.5 * t3 - 2.5 * t2 + 1).addScaledVector(p2, -1.5 * t3 + 2 * t2 + 0.5 * t).addScaledVector(p3, 0.5 * t3 - 0.5 * t2); };
  // a round strand along points. rad(i): how thick; colAt(i, a): its colour; keyAt(i): a number its triangles are sorted by (for growing and unravelling); squash(i): [across, up] for a strand that is not round
  function wTube(bag, pts, rad, sides, colAt, keyAt, squash) {
    const n = pts.length, base = bag.pos.length / 3, T = V3(), B = V3(); let N = null;
    for (let i = 0; i < n; i++) { T.copy(pts[Math.min(n - 1, i + 1)]).sub(pts[Math.max(0, i - 1)]).normalize();
      if (!N) { N = V3(1, 0, 0); if (Math.abs(T.x) > 0.8) N.set(0, 0, 1); } N.addScaledVector(T, -N.dot(T)).normalize(); B.crossVectors(T, N);
      const r = rad(i), q = squash ? squash(i) : null, ra = q ? r * q[0] : r, rb = q ? r * q[1] : r;
      for (let s = 0; s < sides; s++) { const a = (s / sides) * TAU, c = Math.cos(a) * ra, d = Math.sin(a) * rb, cc = colAt(i, a); bag.pos.push(pts[i].x + N.x * c + B.x * d, pts[i].y + N.y * c + B.y * d, pts[i].z + N.z * c + B.z * d); bag.col.push(cc[0], cc[1], cc[2]); } }
    for (let i = 0; i < n - 1; i++) for (let s = 0; s < sides; s++) { const a = base + i * sides + s, b = base + i * sides + (s + 1) % sides, c = a + sides, d = b + sides; bag.idx.push(a, b, c, b, d, c); const k = keyAt ? keyAt(i) : 0; bag.key.push(k, k); }
  }
  // a braid: centre(t) the line it follows, rx(t) and ry(t) its half-widths, K strands, turns: how many times they wind
  function wBraid(bag, centre, rx, ry, K, turns, rings, sides, fat, tone, keyAt) {
    const C = [], Ns = [], Bs = [], T = V3(), sK = K <= 2 ? 1 : Math.sin(TAU / K), fK = sK / (1 + sK); let N = null; for (let i = 0; i <= rings; i++) C.push(centre(i / rings).clone());       // rx, ry are the outside of the braid; its strands lie inside that
    for (let i = 0; i <= rings; i++) { T.copy(C[Math.min(rings, i + 1)]).sub(C[Math.max(0, i - 1)]).normalize(); if (!N) { N = V3(1, 0, 0); if (Math.abs(T.x) > 0.8) N.set(0, 0, 1); } N = N.clone().addScaledVector(T, -N.dot(T)).normalize(); Ns.push(N); Bs.push(V3().crossVectors(T, N)); }
    for (let k = 0; k < K; k++) { const sg = k % 2 ? -1 : 1, deep = k % 2 ? 0.84 : 1, ph = (k / K) * TAU + (k % 2 ? 0.45 : 0), pts = [], shade = 0.84 + 0.30 * wHash(k * 3.7 + K), base = wMix(WOODC.dark, WOODC.light, 0.25 + 0.75 * wHash(k * 1.3 + K * 0.7));
      const rs = (t) => Math.max(0.0012, fat * Math.min(rx(t), ry(t)) * fK * (0.90 + 0.20 * Math.sin(k * 2.3 + t * 9)));
      for (let i = 0; i <= rings; i++) { const t = i / rings, a = ph + sg * turns * TAU * t, r = rs(t); pts.push(C[i].clone().addScaledVector(Ns[i], Math.cos(a) * Math.max(0, rx(t) - r) * deep).addScaledVector(Bs[i], Math.sin(a) * Math.max(0, ry(t) - r) * deep)); }
      wTube(bag, pts, (i) => rs(i / rings), sides,
        (i, a) => { const t = i / rings, g = (0.90 + 0.14 * Math.sin(t * 46 + k * 5 + a * 2)) * shade * (k % 2 ? 0.80 : 1), c = tone ? tone(t, k) : base; return [c[0] * g, c[1] * g, c[2] * g]; }, keyAt ? (i) => keyAt(i / rings, pts[i]) : null); }
  }
  // a leaf: a pointed blade folded a little down its middle
  function wLeaf(bag, p, dir, nrm, len, wid, ca, cb, key) { const b = bag.pos.length / 3, d = dir.clone().normalize(), n = nrm.clone().addScaledVector(d, -nrm.dot(d)).normalize(), s = V3().crossVectors(d, n), P = (a, w, h) => { bag.pos.push(p.x + d.x * a + s.x * w + n.x * h, p.y + d.y * a + s.y * w + n.y * h, p.z + d.z * a + s.z * w + n.z * h); };
    P(0, 0, 0); P(len * 0.42, -wid / 2, wid * 0.18); P(len * 0.5, 0, 0); P(len * 0.42, wid / 2, wid * 0.18); P(len, 0, wid * 0.10); for (const c of [cb, ca, cb, ca, ca]) bag.col.push(c[0], c[1], c[2]);
    bag.idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 4, b, b + 3, b + 2, b + 2, b + 3, b + 4); const k = key || 0; bag.key.push(k, k, k, k); }
  // a small white flower: five petals
  function wStar(bag, p, nrm, r, key) { const b = bag.pos.length / 3, n = nrm.clone().normalize(), u = V3(1, 0, 0); if (Math.abs(n.x) > 0.8) u.set(0, 0, 1); u.addScaledVector(n, -u.dot(n)).normalize(); const v = V3().crossVectors(n, u);
    bag.pos.push(p.x, p.y, p.z); bag.col.push(0.95, 0.80, 0.30); for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU, q = i % 2 ? r * 0.36 : r; bag.pos.push(p.x + (u.x * Math.cos(a) + v.x * Math.sin(a)) * q + n.x * r * 0.15, p.y + (u.y * Math.cos(a) + v.y * Math.sin(a)) * q + n.y * r * 0.15, p.z + (u.z * Math.cos(a) + v.z * Math.sin(a)) * q + n.z * r * 0.15); bag.col.push(WOODC.white[0], WOODC.white[1], WOODC.white[2]); }
    for (let i = 0; i < 10; i++) { bag.idx.push(b, b + 1 + i, b + 1 + (i + 1) % 10); bag.key.push(key || 0); } }
  function wMesh(bag, mat, sorted) {
    let idx = bag.idx; if (sorted) { const n = idx.length / 3, o = []; for (let i = 0; i < n; i++) o.push(i); o.sort((a, b) => bag.key[a] - bag.key[b]); const out = new Array(idx.length); for (let i = 0; i < n; i++) { const t = o[i] * 3; out[i * 3] = idx[t]; out[i * 3 + 1] = idx[t + 1]; out[i * 3 + 2] = idx[t + 2]; } idx = out; bag.keys = o.map((t) => bag.key[t]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(bag.pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(bag.col, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat || woodMat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; m.userData.keys = bag.keys || null; return m; }
  // show only the triangles of a sorted mesh whose key lies in lo..hi
  function wRange(m, lo, hi) { const k = m.userData.keys; if (!k) return; let a = 0, b = k.length, x = 0, y = k.length; while (a < b) { const c = (a + b) >> 1; if (k[c] < lo) a = c + 1; else b = c; } while (x < y) { const c = (x + y) >> 1; if (k[c] <= hi) x = c + 1; else y = c; } m.geometry.setDrawRange(a * 3, Math.max(0, x - a) * 3); }

  // ----- the seed (G7, H7, I4): the size of a hen's egg, gold-brown with a spiral on it; it glows from inside like a small lantern -----
  const SEED = new THREE.Group(); SEED.visible = false; fxG.add(SEED);
  const seedMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, side: THREE.DoubleSide, emissive: new THREE.Color(1.0, 0.62, 0.16), emissiveIntensity: 0 }), SHOOT = new THREE.Group();
  { const bag = wBag(), NR = 12, NS = 16; for (let i = 0; i <= NR; i++) { const t = i / NR, y = -0.030 + 0.062 * t, r = 0.0225 * Math.pow(Math.sin(PI * (0.03 + 0.94 * t)), 0.62) * (1 - 0.22 * t);
      for (let s = 0; s < NS; s++) { const a = (s / NS) * TAU, sp = Math.sin(a * 2 + t * 13), c = wMix(WOODC.seed, WOODC.seedD, sm(0.55, 0.95, sp)); bag.pos.push(r * Math.cos(a), y, r * Math.sin(a)); bag.col.push(c[0], c[1], c[2]); } }
    for (let i = 0; i < NR; i++) for (let s = 0; s < NS; s++) { const a = i * NS + s, b = i * NS + (s + 1) % NS, c = a + NS, d = b + NS; bag.idx.push(a, c, b, b, c, d); }
    SEED.add(wMesh(bag, seedMat)); SEED.children[0].castShadow = false;
    const sh = wBag(); wTube(sh, [V3(0, 0.030, 0), V3(0.002, 0.042, 0), V3(0, 0.054, 0.001)], () => 0.0013, 5, () => WOODC.leafB); wLeaf(sh, V3(0, 0.053, 0), V3(0.8, 0.7, 0.1), V3(-0.5, 0.8, 0), 0.026, 0.013, WOODC.leafA, WOODC.leafB); wLeaf(sh, V3(0, 0.053, 0), V3(-0.75, 0.65, -0.15), V3(0.5, 0.8, 0), 0.021, 0.011, WOODC.leafA, WOODC.leafB);
    SHOOT.add(wMesh(sh)); SEED.add(SHOOT); }
  // its roots of light, spreading over the ground from where it sinks in (H7, right)
  const ROOTS = (() => { const pos = [], uv = [], idx = [], key = []; let q = 20261114; const rnd = () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; };
    const run = (x, z, a, len, w, d0) => { const n = Math.max(4, Math.round(len / 0.02)); let px = x, pz = z, d = d0; const b0 = pos.length / 3;
      for (let i = 0; i <= n; i++) { const t = i / n, ww = w * (1 - 0.85 * t), sx = -Math.sin(a), sz = Math.cos(a); pos.push(px + sx * ww, 0.006, pz + sz * ww, px - sx * ww, 0.006, pz - sz * ww); const u = 1 - 0.55 * (d / 0.5); uv.push(u, 0, u, 1);
        if (i < n) { const b = b0 + i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); key.push(d, d); if (len > 0.14 && i > 2 && rnd() < 0.16) run(px, pz, a + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.5), len * (1 - t) * 0.7, ww * 0.75, d); }
        a += (rnd() - 0.5) * 0.5; px += Math.cos(a) * len / n; pz += Math.sin(a) * len / n; d += len / n; } };
    for (let i = 0; i < 9; i++) run(0, 0, (i / 9) * TAU + rnd() * 0.5, 0.24 + rnd() * 0.22, 0.0055, 0);
    const bag = { pos, col: pos.map(() => 1), idx, key }, m = wMesh(bag, ribMat([1.0, 0.92, 0.55], [0.75, 0.95, 0.35]), true); m.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); m.castShadow = false; m.receiveShadow = false; m.renderOrder = 18; m.visible = false; fxG.add(m);
    m.userData.set = (grow, a) => { m.visible = a > 0.01 && grow > 0.01; wRange(m, -1, 0.5 * grow); m.material.uniforms.uK.value = a; }; return m; })();

  // ----- the sapling (H8, I4): twisting living wood as high as her waist, with new leaves opening along it -----
  const SAP = new THREE.Group(); SAP.visible = false; fxG.add(SAP); const SAP_LEAVES = [];
  { const line = (t) => V3(0.055 * Math.sin(t * 5.4) * Math.pow(t, 0.6), t * 1.0, 0.045 * Math.sin(t * 4.1 + 1.2) * Math.pow(t, 0.6)), bag = wBag();
    wBraid(bag, line, (t) => lerp(0.056, 0.010, Math.pow(t, 0.8)), (t) => lerp(0.056, 0.010, Math.pow(t, 0.8)), 3, 2.4, 44, 6, 1.0);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + 0.3, L = 0.13 + 0.07 * wHash(i + 5), pts = []; for (let j = 0; j <= 6; j++) { const t = j / 6; pts.push(V3(Math.cos(a + 0.5 * t * Math.sin(i * 2.1)) * (0.02 + L * t), 0.045 * (1 - t) * (1 - t) + 0.004, Math.sin(a + 0.5 * t * Math.sin(i * 2.1)) * (0.02 + L * t))); } wTube(bag, pts, (j) => 0.014 * (1 - j / 6) + 0.002, 5, () => wMix(WOODC.mid, WOODC.dark, 0.3)); }       // its roots, spread on the ground
    SAP.add(wMesh(bag));
    const lg = wBag(); wLeaf(lg, V3(0, 0, 0), V3(1, 0.25, 0), V3(0, 1, 0), 0.085, 0.040, WOODC.leafA, WOODC.leafB); const leafGeo = wMesh(lg).geometry;
    for (let i = 0; i < 15; i++) { const t = 0.20 + 0.78 * (i / 14), p = line(t), a = i * 2.4 + 0.6, m = new THREE.Mesh(leafGeo, woodMat); m.castShadow = true; m.position.set(p.x + Math.cos(a) * 0.02, p.y, p.z + Math.sin(a) * 0.02); m.rotation.set(0, -a, 0.35 + 0.3 * wHash(i)); m.userData.t = t; m.userData.s = 0.75 + 0.5 * wHash(i * 7 + 1) + (i > 12 ? 0.2 : 0); SAP.add(m); SAP_LEAVES.push(m); } }
  // g: how far it has grown (0.5 knee-high, 1 waist-high); tw: how far it has twisted itself away into the fawn
  function sapSet(p, g, tw) { SAP.visible = g > 0.005 && tw < 0.995; if (!SAP.visible) return; const e = Math.pow(g, 0.85), w = lerp(0.25, 1, Math.pow(g, 0.6));
    SAP.position.copy(p); SAP.rotation.y = 0.9 + tw * tw * 5.5; SAP.scale.set(w * (1 + 0.9 * tw) * (1 - sm(0.7, 1, tw)), Math.max(0.01, e * (1 - 0.72 * sm(0, 0.9, tw))), w * (1 + 0.9 * tw) * (1 - sm(0.7, 1, tw)));
    for (const m of SAP_LEAVES) { const k = sm(m.userData.t * 0.80, m.userData.t * 0.80 + 0.22, g) * (1 - sm(0.1, 0.6, tw)); m.visible = k > 0.01; m.scale.setScalar(Math.max(0.001, k * m.userData.s) / Math.max(0.3, w)); } }

  // ----- the Elderwood Guardian (H9, H10): a stag of living wood. Its shoulder is level with hers; its antlers are boughs that rise well above her hat. -----
  // It is built facing +z, standing, and held together as a little puppet: body > neck > head > antlers, and four legs of two or
  // three pieces. A pose is a handful of angles; the fawn (H8) is the same creature made small, lying down, with small antlers.
  const STAG = (() => {
    const G = new THREE.Group(); G.name = 'guardian'; G.visible = false; fxG.add(G); const all = [];
    const grp = (parent, x, y, z) => { const g = new THREE.Group(), pp = parent.userData.piv || V3(); g.userData.piv = V3(x, y, z); g.position.set(x - pp.x, y - pp.y, z - pp.z); g.userData.home = g.position.clone(); parent.add(g); return g; };
    const put = (g, bag, sorted) => { const m = wMesh(bag, woodMat, sorted), p = g.userData.piv; m.geometry.translate(-p.x, -p.y, -p.z); g.add(m); all.push(m); return m; };
    const bodyG = grp(G, 0, 1.04, 0), neckG = grp(bodyG, 0, 1.20, 0.50), headG = grp(neckG, 0, 1.66, 0.84), antG = grp(headG, 0, 1.75, 0.83);
    // its body: fourteen thick roots braided from rump to chest, deeper at the chest, moss and small white flowers along its back
    const E = (t) => Math.pow(Math.sin(PI * (0.04 + 0.92 * t)), 0.5), cy = (t) => 1.035 + 0.035 * sm(0.4, 0.9, t), bz = (t) => lerp(-0.66, 0.64, t), brx = (t) => 0.228 * E(t) * (0.92 + 0.08 * Math.sin(PI * t)), bry = (t) => E(t) * (0.235 + 0.085 * sm(0.45, 0.85, t) - 0.03 * sm(0.5, 0.15, t));
    { const bag = wBag(), kz = (t, p) => p.z; wBraid(bag, (t) => V3(0, cy(t), bz(t)), brx, bry, 14, 0.55, 40, 6, 1.0, null, kz);
      wBraid(bag, (t) => V3(0, cy(t), bz(t)), (t) => brx(t) * 1.035, (t) => bry(t) * 1.035, 6, 1.7, 56, 5, 0.17, (t, k) => wMix(WOODC.vine, WOODC.mid, 0.25 + 0.5 * wHash(k)), kz);
      const core = []; for (let i = 0; i <= 20; i++) core.push(V3(0, cy(i / 20), bz(i / 20))); wTube(bag, core, (i) => 0.87 * brx(i / 20), 12, (i, a) => { const g = 0.80 + 0.2 * Math.sin(a * 7 + i * 1.9); return [WOODC.dark[0] * g, WOODC.dark[1] * g, WOODC.dark[2] * g]; }, (i) => core[i].z, (i) => [1, bry(i / 20) / Math.max(0.001, brx(i / 20))]);
      for (let v = 0; v < bag.pos.length / 3; v++) { const x = bag.pos[v * 3], y = bag.pos[v * 3 + 1], z = bag.pos[v * 3 + 2], t = (z + 0.66) / 1.30, up = (y - cy(t)) / Math.max(0.01, bry(t)), k = sm(0.52, 0.86, up) * (0.45 + 0.55 * sm(-0.3, 0.5, Math.sin(z * 17 + x * 9) + Math.sin(z * 7.3 - x * 13))) * sm(0.02, 0.2, t) * (1 - sm(0.8, 0.98, t));
        if (k > 0) { const c = wMix([bag.col[v * 3], bag.col[v * 3 + 1], bag.col[v * 3 + 2]], WOODC.moss, 0.85 * k); bag.col[v * 3] = c[0]; bag.col[v * 3 + 1] = c[1]; bag.col[v * 3 + 2] = c[2]; } }       // moss along its back
      for (let i = 0; i < 9; i++) { const t = 0.14 + 0.70 * wHash(i * 3.1), s = wHash(i * 5.7) * 2 - 1, a = s * 0.9, p = V3(Math.sin(a) * brx(t) * 1.04, cy(t) + Math.cos(a) * bry(t) * 1.04, bz(t)); wStar(bag, p, V3(Math.sin(a), Math.cos(a), 0), 0.017 + 0.006 * wHash(i), p.z); }
      for (let i = 0; i < 26; i++) { const t = 0.08 + 0.84 * wHash(i * 2.3 + 1), a = (wHash(i * 4.1) * 2 - 1) * 1.5, p = V3(Math.sin(a) * brx(t) * 1.03, cy(t) + Math.cos(a) * bry(t) * 1.03, bz(t)); wLeaf(bag, p, V3(Math.sin(a) * 0.6, 0.5 + 0.4 * Math.cos(a), wHash(i) - 0.7), V3(Math.sin(a), Math.cos(a), 0.3), 0.055 + 0.03 * wHash(i * 9), 0.028, WOODC.leafA, WOODC.leafB, p.z); }
      G.userData.torso = put(bodyG, bag, true); }
    // its neck, and the small leaves down the back of it
    { const bag = wBag(), A = V3(0, 1.12, 0.42), B = V3(0, 1.69, 0.85), line = (t) => V3(0, lerp(A.y, B.y, t) + 0.03 * Math.sin(PI * t), lerp(A.z, B.z, t) - 0.035 * Math.sin(PI * t));
      wBraid(bag, line, (t) => lerp(0.150, 0.080, Math.pow(t, 0.8)), (t) => lerp(0.215, 0.090, Math.pow(t, 0.8)), 9, 0.7, 16, 6, 1.0);
      wBraid(bag, line, (t) => lerp(0.155, 0.083, Math.pow(t, 0.8)), (t) => lerp(0.22, 0.093, Math.pow(t, 0.8)), 4, 1.6, 22, 5, 0.22, (t, k) => wMix(WOODC.vine, WOODC.mid, 0.3 + 0.4 * wHash(k)));
      const core = []; for (let i = 0; i <= 8; i++) core.push(line(i / 8)); wTube(bag, core, (i) => 0.88 * lerp(0.150, 0.080, Math.pow(i / 8, 0.8)), 10, (i, a) => { const g = 0.80 + 0.2 * Math.sin(a * 7 + i * 1.9); return [WOODC.dark[0] * g, WOODC.dark[1] * g, WOODC.dark[2] * g]; }, null, (i) => [1, lerp(0.215, 0.090, Math.pow(i / 8, 0.8)) / lerp(0.150, 0.080, Math.pow(i / 8, 0.8))]);
      for (let i = 0; i < 12; i++) { const t = 0.12 + 0.8 * (i / 11), p = line(t).add(V3((wHash(i) - 0.5) * 0.09, lerp(0.11, 0.06, t), -lerp(0.12, 0.06, t))); wLeaf(bag, p, V3((wHash(i * 3) - 0.5) * 1.2, 0.5, -0.8), V3(0, 0.8, 0.6), 0.06 + 0.03 * wHash(i * 5), 0.03, WOODC.leafA, WOODC.leafB); }
      put(neckG, bag); }
    // its head: bark, a long muzzle, two ears like leaves
    const HA = V3(0, 1.675, 0.80), HB = V3(0, 1.575, 1.215), eyeP = [];
    { const bag = wBag(), pts = [], R = [[0, 0.034, 1, 1], [0.10, 0.088, 1, 1.05], [0.26, 0.099, 0.98, 1.08], [0.46, 0.083, 0.92, 1.0], [0.66, 0.059, 0.9, 1.0], [0.84, 0.045, 0.95, 0.95], [0.95, 0.038, 1, 0.85], [1.0, 0.013, 1, 0.8]], prof = [];
      for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push(HA.clone().lerp(HB, t).add(V3(0, 0.012 * Math.sin(PI * t), 0))); let j = 0; while (j < R.length - 2 && R[j + 1][0] < t) j++; const u = cl((t - R[j][0]) / (R[j + 1][0] - R[j][0]), 0, 1); prof.push([lerp(R[j][1], R[j + 1][1], u), lerp(R[j][2], R[j + 1][2], u), lerp(R[j][3], R[j + 1][3], u)]); }
      wTube(bag, pts, (i) => prof[i][0], 12, (i, a) => { const t = i / 14, g = 0.84 + 0.18 * Math.sin(a * 5 + t * 21) + 0.08 * Math.sin(a * 11), c = t > 0.92 ? WOODC.hoof : wMix(WOODC.bark, WOODC.light, 0.45 + 0.45 * Math.sin(a * 3 + t * 8)); return [c[0] * g, c[1] * g, c[2] * g]; }, null, (i) => [prof[i][1], prof[i][2]]);
      for (const s of [-1, 1]) { wLeaf(bag, V3(s * 0.058, 1.735, 0.815), V3(s * 0.85, 0.42, -0.42), V3(s * 0.2, 0.3, 0.95), 0.155, 0.052, WOODC.light, WOODC.bark); wLeaf(bag, V3(s * 0.05, 1.70, 0.80), V3(s * 0.5, -0.2, -0.8), V3(s, 0.2, 0), 0.05, 0.03, WOODC.leafA, WOODC.leafB); }
      put(headG, bag);
      const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.80, 1.0, 0.36) }); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.0125, 10, 8), eyeMat); e.position.set(s * 0.080, 1.670 - 1.66, 0.945 - 0.84); headG.add(e); eyeP.push(e); } }
    // its antlers: two boughs sweeping back and up, each with five branches, twigs, and leaves at the tips
    { const bag = wBag(), tw = (a, b, r0, r1, bend, n) => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push(a.clone().lerp(b, t).add(bend.clone().multiplyScalar(Math.sin(PI * t)))); } wTube(bag, pts, (i) => lerp(r0, r1, Math.pow(i / n, 0.8)), 5, (i, k) => { const g = 0.86 + 0.16 * Math.sin(i * 1.7 + k * 3); return [WOODC.light[0] * g, WOODC.light[1] * g, WOODC.light[2] * g]; }); return pts; };
      const leaves = (p, d, n, seed) => { for (let i = 0; i < n; i++) { const q = V3(wHash(seed + i) - 0.5, wHash(seed + i * 3 + 1) - 0.2, wHash(seed + i * 7 + 2) - 0.5).normalize().multiplyScalar(0.8).add(d.clone().normalize()); wLeaf(bag, p, q, V3(wHash(seed + i * 11) - 0.5, 1, wHash(seed + i * 13) - 0.5), 0.085 + 0.045 * wHash(seed + i * 5), 0.042, WOODC.leafA, WOODC.leafB); } };
      for (const s of [-1, 1]) { const K = [V3(s * 0.045, 1.755, 0.83), V3(s * 0.15, 1.95, 0.68), V3(s * 0.27, 2.14, 0.44), V3(s * 0.37, 2.29, 0.14), V3(s * 0.41, 2.40, -0.16)], beam = []; for (let i = 0; i <= 22; i++) beam.push(wCrom(K, i / 22, V3()));
        wTube(bag, beam, (i) => lerp(0.040, 0.011, Math.pow(i / 22, 0.75)), 6, (i, k) => { const g = 0.84 + 0.18 * Math.sin(i * 1.3 + k * 2); return [WOODC.light[0] * g, WOODC.light[1] * g, WOODC.light[2] * g]; }); leaves(beam[22], V3(0, 0.6, -0.8), 5, s * 3 + 40);
        const tines = [[0.10, V3(s * 0.10, 2.00, 1.05), 0.022], [0.30, V3(s * 0.20, 2.36, 0.74), 0.022], [0.50, V3(s * 0.37, 2.54, 0.46), 0.020], [0.72, V3(s * 0.52, 2.58, 0.14), 0.017], [0.88, V3(s * 0.47, 2.60, -0.18), 0.013]];
        tines.forEach(([t, tip, r], j) => { const a = wCrom(K, t, V3()), pts = tw(a, tip, r, 0.0045, V3(s * 0.02, -0.03, 0.03 * (j % 2 ? -1 : 1)), 9), d = tip.clone().sub(a); leaves(tip, d, 5, s * 5 + j * 9); leaves(pts[7], d, 2, s * 9 + j * 5);
          const m = pts[5], t2 = m.clone().add(V3(s * (0.10 + 0.04 * j), 0.13, (j % 2 ? 0.12 : -0.10))); tw(m, t2, 0.009, 0.003, V3(0, 0.01, 0), 5); leaves(t2, t2.clone().sub(m), 4, s * 7 + j * 13 + 3);
          if (j === 1 || j === 2) { const m2 = pts[7], t3 = m2.clone().add(V3(-s * 0.07, 0.11, 0.08)); tw(m2, t3, 0.007, 0.003, V3(0, 0.01, 0), 4); leaves(t3, t3.clone().sub(m2), 3, s * 11 + j * 17); } }); }
      put(antG, bag); }
    // its legs: roots twisted together, a knot at each joint, a dark hoof
    const legs = {}, legBraid = (bag, a, b, r0, r1, K, turns) => wBraid(bag, (t) => a.clone().lerp(b, t).add(V3(0, 0, 0.012 * Math.sin(PI * t))), (t) => lerp(r0, r1, t) * (1 + 0.10 * Math.sin(PI * t)), (t) => lerp(r0, r1, t) * (1 + 0.10 * Math.sin(PI * t)), K, turns, 10, 5, 1.0);
    const knot = (bag, p, r) => wTube(bag, [p.clone().add(V3(0, r, 0)), p.clone().add(V3(0, r * 0.5, 0)), p.clone(), p.clone().add(V3(0, -r * 0.5, 0)), p.clone().add(V3(0, -r, 0))], (i) => r * [0.25, 0.85, 1, 0.85, 0.25][i], 7, () => wMix(WOODC.mid, WOODC.dark, 0.35));
    const hoof = (bag, f, g) => wTube(bag, [f.clone().add(V3(0, 0.02, 0)), f.clone().lerp(g, 0.45), g.clone().add(V3(0, 0.012, 0)), g.clone()], (i) => [0.030, 0.036, 0.040, 0.030][i], 7, (i) => i > 0 ? WOODC.hoof : WOODC.dark);
    const sprig = (bag, p, s, n, seed) => { for (let i = 0; i < n; i++) wLeaf(bag, p.clone().add(V3(0, -0.06 * i, 0)), V3(s * (0.5 + wHash(seed + i)), 0.4, wHash(seed + i * 3) - 0.5), V3(s * 0.3, 0.3, 1), 0.05 + 0.02 * wHash(seed + i * 7), 0.026, WOODC.leafA, WOODC.leafB); };
    for (const s of [-1, 1]) { const x = s * 0.125, sh = V3(x, 1.03, 0.44), kn = V3(x, 0.54, 0.455), fe = V3(x, 0.105, 0.44), gr = V3(x, 0, 0.465), up = grp(bodyG, sh.x, sh.y, sh.z), lo = grp(up, kn.x, kn.y, kn.z);
      let bag = wBag(); legBraid(bag, sh.clone().add(V3(0, 0.05, 0)), kn, 0.080, 0.040, 4, 0.9); sprig(bag, sh.clone().lerp(kn, 0.4).add(V3(s * 0.05, 0, 0)), s, 2, s * 3 + 1); put(up, bag);
      bag = wBag(); knot(bag, kn, 0.043); legBraid(bag, kn, fe, 0.038, 0.029, 3, 1.1); hoof(bag, fe, gr); sprig(bag, kn.clone().lerp(fe, 0.5).add(V3(s * 0.03, 0, 0)), s, 2, s * 5 + 2); put(lo, bag); legs['F' + (s < 0 ? 'R' : 'L')] = [up, lo]; }
    for (const s of [-1, 1]) { const x = s * 0.135, hp = V3(x, 1.03, -0.50), st = V3(x + s * 0.005, 0.74, -0.36), hk = V3(x, 0.47, -0.60), fe = V3(x, 0.105, -0.545), gr = V3(x, 0, -0.515), th = grp(bodyG, hp.x, hp.y, hp.z), ga = grp(th, st.x, st.y, st.z), ca = grp(ga, hk.x, hk.y, hk.z);
      let bag = wBag(); legBraid(bag, hp.clone().add(V3(0, 0.06, -0.03)), st, 0.125, 0.070, 5, 0.6); put(th, bag);
      bag = wBag(); knot(bag, st, 0.058); legBraid(bag, st, hk, 0.062, 0.036, 4, 0.9); sprig(bag, st.clone().lerp(hk, 0.5).add(V3(s * 0.04, 0, 0)), s, 2, s * 7 + 4); put(ga, bag);
      bag = wBag(); knot(bag, hk, 0.039); legBraid(bag, hk, fe, 0.034, 0.028, 3, 1.1); hoof(bag, fe, gr); put(ca, bag); legs['H' + (s < 0 ? 'R' : 'L')] = [th, ga, ca]; }
    { const bag = wBag(); wTube(bag, [V3(0, 1.21, -0.58), V3(0, 1.15, -0.68), V3(0, 1.02, -0.71)], (i) => [0.04, 0.034, 0.008][i], 6, () => WOODC.mid); wLeaf(bag, V3(0, 1.04, -0.71), V3(0, -0.9, -0.2), V3(0, 0.2, -1), 0.09, 0.05, WOODC.leafA, WOODC.leafB); G.userData.tail = put(bodyG, bag); }
    const mark = new THREE.Object3D(); mark.position.set(0.118 - 0, 1.40 - 1.20, 0.60 - 0.50); neckG.add(mark); const cheek = new THREE.Object3D(); cheek.position.set(0.088, 1.650 - 1.66, 0.915 - 0.84); headG.add(cheek);       // where her hand rests on its neck (H9)
    // poses: by how far its body is let down; bp its pitch (+ nose down); nk, hd its neck and head (+ down); fU, fL its forelegs; hT, hG, hC its hind legs (+ swings a piece back)
    const POSE = { stand: { by: 0, bp: 0, nk: 0, hd: 0, fU: 0, fL: 0, hT: 0, hG: 0, hC: 0 }, lie: { by: -0.71, bp: 0, nk: -0.10, hd: 0.12, fU: -1.35, fL: 2.55, hT: -1.0, hG: 2.0, hC: -1.9 },
      gather: { by: -0.17, bp: -0.13, nk: 0.36, hd: -0.18, fU: -0.22, fL: 0.46, hT: -0.55, hG: 1.0, hC: -0.52 }, leap: { by: 0, bp: -0.17, nk: 0.40, hd: -0.22, fU: -1.0, fL: 1.5, hT: 0.95, hG: -0.5, hC: 0.35 }, land: { by: -0.04, bp: 0.14, nk: 0.48, hd: -0.20, fU: -0.72, fL: 0.25, hT: 1.05, hG: -0.4, hC: 0.5 } };
    const cur = {};
    function pose(a, b, t, extra) { const A = POSE[a], B = POSE[b || a]; for (const k in A) cur[k] = lerp(A[k], B[k], t || 0); cur.fd = 0; cur.ny = 0; cur.hy = 0; if (extra) for (const k in extra) cur[k] += extra[k];
      bodyG.position.set(0, bodyG.userData.home.y + cur.by, 0); bodyG.rotation.x = cur.bp; neckG.rotation.x = cur.nk; neckG.rotation.y = cur.ny; headG.rotation.x = cur.hd; headG.rotation.y = cur.hy;
      for (const S of ['R', 'L']) { const d = S === 'L' ? (cur.fd || 0) : -(cur.fd || 0); legs['F' + S][0].rotation.x = cur.fU + d; legs['F' + S][1].rotation.x = cur.fL - d * 0.6; legs['H' + S][0].rotation.x = cur.hT - d; legs['H' + S][1].rotation.x = cur.hG; legs['H' + S][2].rotation.x = cur.hC; } }
    // unravel(u): from its rump forward to its shoulders it comes apart (H10); 1: everything behind the shoulders is gone
    function unravel(u) { const zc = lerp(-0.70, 0.34, u); wRange(G.userData.torso, u <= 0 ? -9 : zc, 9); const k = Math.max(0.001, 1 - sm(0.02, 0.34, u)); for (const S of ['R', 'L']) legs['H' + S][0].scale.setScalar(k); G.userData.tail.visible = u < 0.03; return zc; }
    const tmp = V3();
    return { G, pose, unravel, mark, cheek, eyeP, antG, neckG, headG, bodyG, set(p, yaw, scale, antler) { G.position.copy(p); G.rotation.y = yaw; G.scale.setScalar(Math.max(0.001, scale)); antG.scale.setScalar(Math.max(0.001, antler)); },
      pt(obj, out) { G.updateMatrixWorld(true); return obj.getWorldPosition(out).applyMatrix4(_inv); },       // a point of it, in her own frame
      local(x, y, z, out) { G.updateMatrixWorld(true); return out.set(x, y - 1.04, z).applyMatrix4(bodyG.matrixWorld).applyMatrix4(_inv); } };
  })();

  // ----- vines that trail behind something rushing (H10): thin strands of wood laid along the way it went, thinning as they age -----
  function makeVine(N, life, w0, ca, cb) {
    const pos = new THREE.BufferAttribute(new Float32Array(N * 12), 3), col = new Float32Array(N * 12), nor = new Float32Array(N * 12), idx = []; pos.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < N; i++) for (let q = 0; q < 4; q++) { const c = wMix(ca, cb, wHash(i * 0.37 + q)); col.set(c, (i * 4 + q) * 3); nor[(i * 4 + q) * 3 + 1] = 1; }
    for (let i = 0; i < N - 1; i++) { const a = i * 4, b = a + 4; idx.push(a, a + 1, b, a + 1, b + 1, b, a + 2, a + 3, b + 2, a + 3, b + 3, b + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', pos); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setIndex(idx);
    const mesh = new THREE.Mesh(g, woodMat); mesh.frustumCulled = false; mesh.visible = false; mesh.castShadow = true; fxG.add(mesh);
    const R = { mesh, pts: [], life, push(c, side, up) { R.pts.unshift({ c: c.clone(), s: side.clone(), u: up.clone(), age: 0 }); if (R.pts.length > N) R.pts.length = N; },
      tick(dt) { for (const t of R.pts) t.age += dt; while (R.pts.length && R.pts[R.pts.length - 1].age >= R.life) R.pts.pop(); const n = R.pts.length; mesh.visible = n > 2; if (n < 3) return;
        for (let i = 0; i < N; i++) { const t = R.pts[Math.min(i, n - 1)], w = i < n ? w0 * Math.pow(Math.max(0, 1 - t.age / R.life), 0.7) * Math.min(1, i / 2) * Math.min(1, (n - 1 - i) / 2) : 0, a = i * 4;
          pos.setXYZ(a, t.c.x + t.s.x * w, t.c.y + t.s.y * w, t.c.z + t.s.z * w); pos.setXYZ(a + 1, t.c.x - t.s.x * w, t.c.y - t.s.y * w, t.c.z - t.s.z * w); pos.setXYZ(a + 2, t.c.x + t.u.x * w, t.c.y + t.u.y * w, t.c.z + t.u.z * w); pos.setXYZ(a + 3, t.c.x - t.u.x * w, t.c.y - t.u.y * w, t.c.z - t.u.z * w); }
        pos.needsUpdate = true; } };
    return R;
  }
  const VINES = [0, 1, 2, 3, 4].map((i) => makeVine(70, 0.85 + 0.1 * i, 0.011 + 0.003 * (i % 2), i % 2 ? WOODC.mid : WOODC.leafB, i % 2 ? WOODC.light : WOODC.mid));
  function woodHide() { SEED.visible = false; SAP.visible = false; STAG.G.visible = false; ROOTS.visible = false; }
  function woodClear() { woodHide(); for (const v of VINES) { v.pts.length = 0; v.mesh.visible = false; } STAG.unravel(0); STAG.pose('stand'); }
