
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
  function handPt(s, x, y, z, out) {
    const c = Math.cos(s * A_POSE), sn = Math.sin(s * A_POSE), mx = -s * x;   // mirror for the left hand
    const w = restPts['wr' + (s < 0 ? 'R' : 'L')];
    return (out || V3()).set(w.x + mx * c - y * sn, w.y + mx * sn + y * c, w.z + z);
  }
  // fingers: [name, knuckle z, knuckle y, length, radius]
  const FINGERS = [['idx', 0.0275, -0.088, 0.070, 0.0086], ['mid', 0.0085, -0.091, 0.078, 0.0088], ['rng', -0.0105, -0.088, 0.072, 0.0083], ['pnk', -0.028, -0.080, 0.056, 0.0074]];
  const PHAL = [0.45, 0.30, 0.25];
  const THUMB = { base: [0.006, -0.028, 0.030], dir: [0.22, -0.62, 0.75], len: [0.036, 0.030, 0.024], r: 0.0105 };
  for (const [S, s] of SIDES) {
    for (const [fn, fz, fy, fl] of FINGERS) {
      let par = 'hand' + S, y = fy;
      for (let k = 0; k < 3; k++) { const p = handPt(s, 0, y, fz); addBone(fn + k + S, par, p.x, p.y, p.z); par = fn + k + S; y -= fl * PHAL[k]; }
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
    const B = bucket(key), pos = part.pos, n = pos.length / 3; let idx = part.idx;
    let nor = computeNormals(pos, idx, o.weld);
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
