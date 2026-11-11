
  // ---------- cloth: veils and skirts are sheets of particles, pinned to the skeleton and draped over body colliders ----------
  // colliders are capsules riding on bones; masks pick which sheets they touch (1 body, 2 arms, 4 legs, 8 skirt volume, 16 head)
  const COLL = [];
  function collider(bA, a, bB, b, r0, r1, mask) {
    const A = SK[bA].userData.rest, B = SK[bB].userData.rest;
    COLL.push({ ia: BI[bA], la: V3(a[0] - A.x, a[1] - A.y, a[2] - A.z), ib: BI[bB], lb: V3(b[0] - B.x, b[1] - B.y, b[2] - B.z), r0, r1: r1 == null ? r0 : r1, mask });
  }
  collider('head', [0, 1.505, 0.010], 'head', [0, 1.585, 0.004], 0.088, 0.088, 16);
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
        if (hit) { pos[a] = x; pos[a + 1] = y; pos[a + 2] = z; prev[a] += (x - prev[a]) * 0.35; prev[a + 1] += (y - prev[a + 1]) * 0.35; prev[a + 2] += (z - prev[a + 2]) * 0.35; }
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
