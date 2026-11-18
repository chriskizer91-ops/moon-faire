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
