  // ---------- the base doll (November 14, 2026): Io's body as one bare skin, to dress ----------
  // Chris: "a new 3D model ... a base model and then be able to add clothes ... she is in a bra and bike shorts".
  // Trunk, neck and both legs are one soft solid, and the skin is found on a grid and cut into triangles (surface nets), the way the
  // Grey Hat's doll and every witch's hands are made, so hip, groin, waist and the foot of the neck have no joins. The feet are a second,
  // finer solid with five toes each. Io's own arms, hands, head, face and neck are kept as they were approved.
  // Every number of the trunk and legs is Io's (I05_tables.js, from B3, B5 and B2), with these changes for a bare body:
  //   the waist from 1.00 to 1.13 is a little fuller than her laced bodice (B5's bare waist at 1.08 is 0.211 across);
  //   below 0.88 the trunk closes into the groin between her thighs; below 0.30 (inside her boots in every painting) a woman's shin,
  //   ankle and bare foot; small shapes for navel, collarbones, breastbone, spine and shoulder blades.
  // She stands barefoot: her soles are DOLL_SOLE above the floor of her skeleton (her boot platforms), so the page lowers her by that much.
  const DOLL_SOLE = 0.038;
  function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * h * k / 6; }
  function smax(a, b, k) { return -smin(-a, -b, k); }
  const gs2 = (dx, dy, wx, wy) => Math.exp(-dx * dx / (wx * wx) - dy * dy / (wy * wy));
  // ----- surface nets: one point in each grid cell the skin passes through, joined to its neighbours; then slid onto the skin -----
  function snets(F, B, h) {
    const X0 = Math.floor(B[0] / h) * h, X1 = Math.ceil(B[1] / h) * h, Y0 = B[2], Y1 = B[3], Z0 = B[4], Z1 = B[5];
    const nx = Math.round((X1 - X0) / h) + 1, ny = Math.ceil((Y1 - Y0) / h) + 1, nz = Math.ceil((Z1 - Z0) / h) + 1, nxy = nx * ny;
    const val = new Float32Array(nxy * nz).fill(NaN);
    { const C = 3, band = 5.4 * h, mx = Math.ceil((nx - 1) / C), my = Math.ceil((ny - 1) / C), mz = Math.ceil((nz - 1) / C), cv = new Float32Array((mx + 1) * (my + 1) * (mz + 1));
      for (let k = 0; k <= mz; k++) for (let j = 0; j <= my; j++) for (let i = 0; i <= mx; i++) cv[(k * (my + 1) + j) * (mx + 1) + i] = Math.abs(F(X0 + Math.min(i * C, nx - 1) * h, Y0 + Math.min(j * C, ny - 1) * h, Z0 + Math.min(k * C, nz - 1) * h));
      for (let k = 0; k < mz; k++) for (let j = 0; j < my; j++) for (let i = 0; i < mx; i++) {
        let m = Infinity; for (let c = 0; c < 8; c++) { const v = cv[((k + (c >> 2)) * (my + 1) + j + ((c >> 1) & 1)) * (mx + 1) + i + (c & 1)]; if (v < m) m = v; }
        if (m > band) continue;
        const i1 = Math.min((i + 1) * C, nx - 1), j1 = Math.min((j + 1) * C, ny - 1), k1 = Math.min((k + 1) * C, nz - 1);
        for (let kk = k * C; kk <= k1; kk++) for (let jj = j * C; jj <= j1; jj++) for (let ii = i * C; ii <= i1; ii++) { const p = kk * nxy + jj * nx + ii; if (val[p] !== val[p]) val[p] = F(X0 + ii * h, Y0 + jj * h, Z0 + kk * h); }
      } }
    const cellV = new Int32Array(nxy * nz).fill(-1), P = [];
    { const OFF = [0, 1, nx, nx + 1, nxy, nxy + 1, nxy + nx, nxy + nx + 1], EA = [0, 2, 4, 6, 0, 1, 4, 5, 0, 1, 2, 3], EB = [1, 3, 5, 7, 2, 3, 6, 7, 4, 5, 6, 7], cvv = new Float32Array(8);
      for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const p = k * nxy + j * nx + i; let neg = 0, ok = true;
        for (let c = 0; c < 8; c++) { const v = val[p + OFF[c]]; if (v !== v) { ok = false; break; } cvv[c] = v; if (v < 0) neg++; }
        if (!ok || neg === 0 || neg === 8) continue;
        let sx = 0, sy = 0, sz = 0, n = 0;
        for (let e = 0; e < 12; e++) { const a = EA[e], b = EB[e], va = cvv[a], vb = cvv[b]; if ((va < 0) === (vb < 0)) continue;
          const t = va / (va - vb); sx += (a & 1) + ((b & 1) - (a & 1)) * t; sy += ((a >> 1) & 1) + (((b >> 1) & 1) - ((a >> 1) & 1)) * t; sz += (a >> 2) + ((b >> 2) - (a >> 2)) * t; n++; }
        cellV[p] = P.length / 3; P.push(X0 + (i + sx / n) * h, Y0 + (j + sy / n) * h, Z0 + (k + sz / n) * h);
      } }
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
    const nv = P.length / 3, pos = new Float32Array(P), nor = new Float32Array(nv * 3), e = Math.min(0.0015, h * 0.3);
    const grad = (x, y, z, o, i) => { const gx = F(x + e, y, z) - F(x - e, y, z), gy = F(x, y + e, z) - F(x, y - e, z), gz = F(x, y, z + e) - F(x, y, z - e), l = Math.hypot(gx, gy, gz) || 1; o[i] = gx / l; o[i + 1] = gy / l; o[i + 2] = gz / l; return l / (2 * e); };
    for (let it = 0; it < 4; it++) for (let v = 0; v < nv; v++) {
      const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], sl = Math.max(0.5, grad(x, y, z, nor, v * 3));
      const st = cl(F(x, y, z) / sl, -0.3 * h, 0.3 * h); pos[v * 3] = x - st * nor[v * 3]; pos[v * 3 + 1] = y - st * nor[v * 3 + 1]; pos[v * 3 + 2] = z - st * nor[v * 3 + 2];
    }
    for (let v = 0; v < nv; v++) grad(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2], nor, v * 3);
    // each quad as two triangles, wound to face out, cut along its shorter diagonal
    const tris = [];
    const d2 = (a, b) => { const dx = pos[a * 3] - pos[b * 3], dy = pos[a * 3 + 1] - pos[b * 3 + 1], dz = pos[a * 3 + 2] - pos[b * 3 + 2]; return dx * dx + dy * dy + dz * dz; };
    for (let q = 0; q < quads.length; q += 4) {
      const a = quads[q]; let b = quads[q + 1]; const c = quads[q + 2]; let d = quads[q + 3];
      const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2], vx = pos[d * 3] - pos[a * 3], vy = pos[d * 3 + 1] - pos[a * 3 + 1], vz = pos[d * 3 + 2] - pos[a * 3 + 2];
      const mx = nor[a * 3] + nor[c * 3], my = nor[a * 3 + 1] + nor[c * 3 + 1], mz = nor[a * 3 + 2] + nor[c * 3 + 2];
      if ((uy * vz - uz * vy) * mx + (uz * vx - ux * vz) * my + (ux * vy - uy * vx) * mz < 0) { const t = b; b = d; d = t; }
      if (d2(a, c) <= d2(b, d)) tris.push(a, b, c, a, c, d); else tris.push(a, b, d, b, c, d);
    }
    return { pos, nor, tris, nv };
  }

  const DOLL = (() => {
    // ----- tables, read once a millimetre and evened out along their length (no hoops of light on bare skin) -----
    const mkTab = (K, soft) => {
      const x0 = K[0][0], x1 = K[K.length - 1][0], st = 0.001, n = Math.ceil((x1 - x0) / st) + 1, nc = K[0][1].length, c = [], R = Math.max(1, Math.round(soft / st)), tmp = new Float64Array(n + 1);
      for (let k = 0; k < nc; k++) c.push(new Float64Array(n + 1));
      for (let i = 0; i <= n; i++) { const v = spline(K, Math.min(x1, x0 + i * st)); for (let k = 0; k < nc; k++) c[k][i] = v[k]; }
      for (let k = 0; k < nc; k++) for (let pass = 0; pass < 3; pass++) { for (let i = 0; i <= n; i++) { let a = 0; for (let j = -R; j <= R; j++) a += c[k][Math.max(0, Math.min(n, i + j))]; tmp[i] = a / (2 * R + 1); } c[k].set(tmp); }
      return { x0, x1, inv: 1 / st, n, c, v: new Float64Array(nc) };
    };
    const look = (T, x) => { const xc = x < T.x0 ? T.x0 : x > T.x1 ? T.x1 : x, fi = (xc - T.x0) * T.inv, i = Math.min(T.n - 1, Math.floor(fi)), u = fi - i; for (let k = 0; k < T.c.length; k++) T.v[k] = T.c[k][i] + (T.c[k][i + 1] - T.c[k][i]) * u; return xc; };
    // trunk: [height, [half width, front, back]], squareness IO_TPW
    const D_TRUNK = [[0.800, [0.010, 0.000, -0.012]], [0.812, [0.034, 0.020, -0.038]], [0.826, [0.074, 0.048, -0.074]], [0.842, [0.118, 0.072, -0.100]], [0.860, [0.158, 0.086, -0.114]],
      [0.880, [0.178, 0.093, -0.125]], [0.900, [0.177, 0.091, -0.128]], [0.920, [0.174, 0.088, -0.129]], [0.940, [0.169, 0.090, -0.126]], [0.960, [0.164, 0.093, -0.118]],
      [0.980, [0.158, 0.094, -0.106]], [1.000, [0.151, 0.094, -0.091]], [1.020, [0.1415, 0.0925, -0.077]], [1.040, [0.130, 0.091, -0.065]], [1.060, [0.118, 0.0895, -0.057]],
      [1.080, [0.1065, 0.0870, -0.052]], [1.100, [0.0985, 0.083, -0.049]], [1.130, [0.1000, 0.084, -0.051]], [1.160, [0.106, 0.086, -0.060]], [1.200, [0.114, 0.082, -0.073]],
      [1.250, [0.120, 0.078, -0.086]], [1.290, [0.128, 0.064, -0.089]], [1.320, [0.132, 0.046, -0.086]], [1.340, [0.098, 0.036, -0.080]], [1.356, [0.066, 0.031, -0.076]],
      [1.370, [0.050, 0.029, -0.074]], [1.385, [0.043, 0.027, -0.073]], [1.405, [0.040, 0.025, -0.072]]];
    // B5 (bike shorts only) is the waist and hips from 0.88 to 1.08: fuller than the laced bodice of B3, which is kept from 1.13 up
    // neck, 4 mm inside the painted neck of I40_head.js, so the painted one is what shows: [height, [half width, front, back]]
    const D_NECK = [[1.360, [0.041, 0.024, -0.071]], [1.396, [0.037, 0.021, -0.0685]], [1.424, [0.0398, 0.0305, -0.062]], [1.440, [0.0408, 0.034, -0.0585]], [1.465, [0.0415, 0.034, -0.0565]], [1.480, [0.040, 0.030, -0.056]]];
    // one leg, rising: [height, [half width, front, back, middle out from her centre line, middle front to back]]: IO_LEG from 0.30 up; below, a woman's shin and ankle
    const D_LEG = [[0.042, [0.0150, 0.0170, 0.0150, 0.0812, -0.0160]], [0.062, [0.0250, 0.0280, 0.0300, 0.0812, -0.0145]], [0.090, [0.0300, 0.0330, 0.0325, 0.0812, -0.0130]], [0.120, [0.0282, 0.0310, 0.0290, 0.0812, -0.0125]], [0.150, [0.0268, 0.0300, 0.0280, 0.0812, -0.0120]],
      [0.180, [0.0284, 0.0320, 0.0295, 0.0812, -0.0115]], [0.220, [0.0325, 0.0365, 0.0360, 0.0813, -0.0105]], [0.260, [0.0372, 0.0415, 0.0410, 0.0815, -0.0100]]].concat(IO_LEG.slice().reverse().map(([y, v]) => [y, v.slice()]));
    D_LEG.push([1.000, [0.045, 0.050, 0.050, 0.070, -0.012]]);       // the top of the thigh ends inside her hips
    const TT = mkTab(D_TRUNK, 0.006), TN = mkTab(D_NECK, 0.005), TL = mkTab(D_LEG, 0.007), FAR = 0.5, P_ = IO_TPW;
    const capped = (f, dy) => (dy <= 0 ? f : f > 0 ? Math.sqrt(f * f + dy * dy) : dy);
    // ----- the trunk's slice: distance to a superellipse at this height -----
    const sliceD = (ax, az, rx, rz, p) => {
      const a = Math.pow(ax / rx, p), b = Math.pow(az / rz, p), s = a + b;
      if (s < 0.03) return -0.6 * Math.min(rx, rz);
      const G = Math.pow(s, 1 / p), k = G / s, gx = ax > 1e-6 ? k * a / ax : 0, gz = az > 1e-6 ? k * b / az : 0;
      return (G - 1) / Math.sqrt(gx * gx + gz * gz);
    };
    // small shapes on the trunk (metres pushed out; negative in). 'snug' (clothes laid over her) leaves out the hollows cloth would bridge.
    const BU = IO_BUST;
    function bust(x, y, snug) {
      const ax = Math.abs(x), dy = y - (BU.y - 0.006), sy = dy > 0 ? 0.060 : 0.041, gy = Math.exp(-dy * dy / (sy * sy));
      const ex = snug ? (ax < BU.x ? 1 - 0.12 * Math.pow(1 - ax / BU.x, 2) : Math.exp(-Math.pow((ax - BU.x) / BU.sx, 2))) : Math.exp(-Math.pow((ax - BU.x) / BU.sx, 2));
      return BU.amp * 1.04 * ex * gy - (snug ? 0 : BU.dip * Math.exp(-Math.pow(x / BU.dipx, 2) - Math.pow((y - BU.dipy) / BU.dipsy, 2)));
    }
    function relief(x, y, fr, snug) {       // fr: 1 at the front, -1 at the back, 0 at the sides. Cloth ('snug') keeps the swells and bridges the hollows.
      const ax = Math.abs(x), k = Math.max(0, fr), kb = Math.max(0, -fr);
      let up = bust(x, y, snug) * k + k * (0.0026 * gs2(x, y - 1.025, 0.060, 0.040)                  // the low curve of her belly
          + 0.0024 * gs2(ax - lerp(0.020, 0.120, cl((ax - 0.02) / 0.10, 0, 1)), y - lerp(1.374, 1.336, cl((ax - 0.02) / 0.10, 0, 1)), 0.060, 0.0050) * sm(0.012, 0.03, ax))      // the collarbones
        + kb * 0.0032 * gs2(ax - 0.074, y - 1.27, 0.045, 0.060);                                      // shoulder blades
      if (snug) return up;
      return up + k * (-0.0042 * gs2(x, y - 1.083, 0.0055, 0.0075)         // the navel
          - 0.0011 * gs2(x, y - 1.15, 0.0065, 0.065) * (1 - sm(1.17, 1.20, y))       // the line down the middle of her belly
          - 0.0040 * gs2(x, y - 1.386, 0.011, 0.010)                                 // the notch at the top of her breastbone
          - 0.0018 * gs2(ax - 0.065, y - 1.362, 0.030, 0.008)                         // the hollow above her collarbones
          - 0.0010 * gs2(x, y - 1.30, 0.010, 0.04))                                  // between her breasts, high
        + kb * (-0.0030 * gs2(x, y - 1.18, 0.011, 0.20)                              // the groove of her spine
          - 0.0060 * gs2(x, y - 0.900, 0.010, 0.050) * (1 - sm(0.93, 0.96, y))         // the cleft of her seat
          - 0.0022 * gs2(ax - 0.035, y - 0.995, 0.012, 0.012));                      // two dimples low on her back
    }
    const fTrunkS = (x, y, z, snug) => {
      if (y < 0.78 || y > 1.47) return FAR;
      const yc = look(TT, y), v = TT.v, rx = v[0], cz = (v[1] + v[2]) / 2, rz = (v[1] - v[2]) / 2, dz = z - cz;
      let f = sliceD(Math.abs(x), Math.abs(dz), rx, rz, P_);
      if (f < 0.06 && f > -0.06) f -= relief(x, y, cl(dz / rz * 1.6, -1, 1), snug) * (1 - sm(0.045, 0.06, Math.abs(f)));
      return capped(f, y > yc ? y - yc : yc - y);
    };
    const fNeck = (x, y, z) => {
      if (y < 1.33 || y > 1.50) return FAR;
      const yc = look(TN, y), v = TN.v, rx = v[0], cz = (v[1] + v[2]) / 2, rz = (v[1] - v[2]) / 2;
      return capped(sliceD(Math.abs(x), Math.abs(z - cz), rx, rz, 2), y > yc ? y - yc : yc - y);
    };
    // ----- a leg: s is -1 for her right, 1 for her left -----
    const fLegOnly = (s, x, y, z) => {
      const yc = look(TL, y), v = TL.v, rx = v[0], dx = x - s * v[3], dz = z - v[4], rz = dz >= 0 ? v[1] : v[2];
      let f = sliceD(Math.abs(dx), Math.abs(dz), rx, rz, 2);
      if (f < 0.04 && f > -0.04) {
        const fr = cl(dz / rz * 1.5, -1, 1), sd = s * dx / rx;
        let d = 0;
        if (fr > 0) d += fr * (0.0024 * gs2(dx, y - (IO_KNEE_Y + 0.012), 0.024, 0.026) - 0.0016 * gs2(dx, y - (IO_KNEE_Y - 0.030), 0.020, 0.012));      // the kneecap and the dip under it
        if (fr < 0) d += -fr * (0.0030 * gs2(dx + s * 0.010, y - 0.445, 0.030, 0.060) - 0.0020 * gs2(dx, y - (IO_KNEE_Y + 0.005), 0.016, 0.018));       // the calf, the hollow behind the knee
        d += 0.0020 * gs2(sd + 0.95, y - 0.112, 0.25, 0.012) + 0.0018 * gs2(sd - 0.95, y - 0.100, 0.25, 0.012);                                         // the two knobs of her ankle, the inner one higher
        f -= d * (1 - sm(0.02, 0.04, Math.abs(f)));
      }
      return capped(f, y > yc ? y - yc : yc - y);
    };
    // ----- a bare foot, in the foot's own frame: X out to her little toe, Y up from the floor of her skeleton, Z forward from her ankle -----
    const TOE_OUT = 6 * DEG, cT = Math.cos(TOE_OUT), sT = Math.sin(TOE_OUT), S0 = DOLL_SOLE;
    const toLocal = (s, x, z, o) => { const dx = s * (x - s * 0.0812), dz = z + 0.0125; o[0] = dx * cT - dz * sT; o[1] = dx * sT + dz * cT; return o; };
    const toWorld = (s, X, Z, o) => { const dx = X * cT + Z * sT, dz = -X * sT + Z * cT; o[0] = s * 0.0812 + s * dx; o[1] = dz - 0.0125; return o; };
    // The foot is two things: its body, from heel to the knuckles of the toes, and five toes.
    // The body is read from tables like the legs: at each step along the foot (Z) its inner and outer edge seen from above, and its height.
    // Its cross-section is a rounded box, cut flat by the floor; the inner edge of the sole lifts into an arch. On top run the tendons to the toes.
    // Z: from the ankle forward. Heel back at -0.062, the knuckles of the big toe at 0.103, the tip of the big toe at 0.177: a 24 cm foot.
    const F_OUT = [[-0.060, [-0.010, 0.010, 0.010]], [-0.054, [-0.020, 0.020, 0.022]], [-0.043, [-0.0262, 0.0262, 0.030]], [-0.028, [-0.0285, 0.0290, 0.034]], [-0.010, [-0.0292, 0.0305, 0.040]],
      [0.010, [-0.0300, 0.0335, 0.050]], [0.030, [-0.0310, 0.0370, 0.056]], [0.055, [-0.0330, 0.0410, 0.050]], [0.078, [-0.0370, 0.0440, 0.041]], [0.095, [-0.0415, 0.0430, 0.033]],
      [0.108, [-0.0425, 0.0385, 0.028]], [0.120, [-0.0400, 0.0330, 0.024]]];          // [inner edge X, outer edge X, height above the sole]: the heel low, so the tendon above it shows
    const TF = mkTab(F_OUT, 0.004);
    const frontZ = (X) => 0.113 - 0.30 * (X + 0.0275);                                                   // the line of the toes' knuckles, slanting back to the little toe
    // tendons on top of the foot, from the front of the ankle to each toe: [X, Z at the ankle end, X, Z at the toe end, height]
    const TENDON = [[-0.012, 0.010, -0.027, 0.100, 0.0013], [-0.004, 0.018, -0.006, 0.106, 0.0007], [0.002, 0.020, 0.0095, 0.100, 0.0006], [0.007, 0.022, 0.0235, 0.091, 0.0006], [0.011, 0.024, 0.0365, 0.080, 0.0005]];
    const fBodyF = (X, Y, Z) => {
      const zc = look(TF, Z), v = TF.v, xm = v[0], xl = v[1], H = v[2], xc = (xm + xl) / 2, rx = (xl - xm) / 2 + 0.002, yc = S0 + 0.009, ry = Math.max(0.006, H - 0.009);      // a dome: widest at the floor, rising to the instep
      let f = sliceD(Math.abs(X - xc), Math.abs(Y - yc), rx, ry, Y > yc ? 2.25 : 3.0);
      f = capped(f, Z < zc ? zc - Z : Z > zc ? Z - zc : 0);
      f = smax(f, Z - frontZ(X), 0.010);                                                                 // the body stops where the toes begin
      if (f < 0.01 && Y > yc) {                                                                          // the tendons, on top only
        let d = 0; for (const T of TENDON) { const ex = T[2] - T[0], ez = T[3] - T[1], L2 = ex * ex + ez * ez, t = cl(((X - T[0]) * ex + (Z - T[1]) * ez) / L2, 0, 1), dx = X - T[0] - ex * t, dz = Z - T[1] - ez * t; d += T[4] * Math.exp(-(dx * dx + dz * dz) / 2.6e-6) * sm(0.0, 0.15, t) * sm(1.0, 0.75, t); }
        f -= d * sm(yc, yc + 0.6 * ry, Y);
      }
      return f;
    };
    // toes: [knuckle, middle knuckle, tip], each [X, height of its middle above the sole, Z, half width, half height]. They touch, and are not spread.
    // Each rises a little to its middle knuckle and comes down to a pad on the floor; the big toe stands a little apart from the rest.
    const TOES = [
      [[-0.0275, 0.0170, 0.101, 0.0130, 0.0118], [-0.0285, 0.0162, 0.137, 0.0123, 0.0104], [-0.0282, 0.0106, 0.1665, 0.0108, 0.0084]],
      [[-0.0058, 0.0148, 0.110, 0.0081, 0.0076], [-0.0042, 0.0152, 0.137, 0.0075, 0.0071], [-0.0027, 0.0082, 0.1615, 0.0065, 0.0059]],
      [[0.0093, 0.0140, 0.104, 0.0077, 0.0071], [0.0108, 0.0144, 0.128, 0.0072, 0.0067], [0.0124, 0.0078, 0.1505, 0.0062, 0.0056]],
      [[0.0233, 0.0132, 0.095, 0.0073, 0.0067], [0.0254, 0.0135, 0.117, 0.0068, 0.0063], [0.0274, 0.0074, 0.1375, 0.0059, 0.0053]],
      [[0.0362, 0.0122, 0.084, 0.0069, 0.0063], [0.0392, 0.0123, 0.103, 0.0064, 0.0059], [0.0422, 0.0070, 0.1205, 0.0055, 0.0049]]];
    // a toe segment: a tube, wider than tall, tapering from a to b
    const segD = (X, Y, Z, a, b) => {
      const ex = b[0] - a[0], ey = b[1] - a[1], ez = b[2] - a[2], L2 = ex * ex + ey * ey + ez * ez, t = cl(((X - a[0]) * ex + (Y - S0 - a[1]) * ey + (Z - a[2]) * ez) / L2, 0, 1);
      const px = X - (a[0] + ex * t), py = Y - S0 - (a[1] + ey * t), pz = Z - (a[2] + ez * t), rw = lerp(a[3], b[3], t), rh = lerp(a[4], b[4], t);
      return (Math.sqrt((px * px + pz * pz) / (rw * rw) + py * py / (rh * rh)) - 1) * Math.min(rw, rh);
    };
    const ellD = (X, Y, Z, cx, cy, cz, rx, ry, rz) => { const ux = (X - cx) / rx, uy = (Y - cy) / ry, uz = (Z - cz) / rz, q = Math.sqrt(ux * ux + uy * uy + uz * uz); return (q - 1) * Math.min(rx, ry, rz); };
    const toeD = (X, Y, Z, T) => {
      let f = smin(segD(X, Y, Z, T[0], T[1]), segD(X, Y, Z, T[1], T[2]), 0.004);
      const c = T[2], pad = ellD(X, Y, Z, c[0], S0 + c[1] - c[4] * 0.35, c[2] - c[4] * 0.6, c[3] * 0.92, c[4] * 0.62, c[4] * 1.05);          // the round pad under its tip
      f = smin(f, pad, 0.003);
      return f;
    };
    const _l = [0, 0];
    const fFoot = (s, x, y, z) => {
      if (y > 0.16) return FAR;
      toLocal(s, x, z, _l); const X = _l[0], Z = _l[1];
      if (Z < -0.10 || Z > 0.20 || X < -0.07 || X > 0.08) return FAR;
      let f = fBodyF(X, y, Z);
      let t = toeD(X, y, Z, TOES[0]); for (let i = 1; i < 5; i++) t = Math.min(t, toeD(X, y, Z, TOES[i]));
      f = smin(f, t, 0.0075);
      // the sole: flat on the floor, its inner edge lifted in an arch between heel and ball
      const arch = 0.019 * gs2(0, Z - 0.036, 1, 0.046) * sm(0.016, -0.028, X);
      f = smax(f, S0 + arch - y, 0.0045 + 0.45 * arch);                                                  // rounder where the arch lifts, so her inner side curves up into it
      return f;
    };
    // the whole leg with its foot (fine: for the feet), and without (for the body, which stops above the ankle)
    const fLegFoot = (s, x, y, z) => { let f = fLegOnly(s, x, y, z); if (y < 0.17) f = smin(f, fFoot(s, x, y, z), 0.011); return f; };
    const fLeg = (s, x, y, z) => (y > 1.10 || s * x < -0.05 ? FAR : fLegOnly(s, x, y, z) + 0.004 * sm(0.124, 0.104, y));       // below the ankle the body's leg draws in, hidden inside the finer foot
    const K_NECK = 0.018, K_LEG = 0.026, K_LEGS = 0.020;
    const Fx = (x, y, z, snug) => {
      const s = x < 0 ? -1 : 1;
      let f = y > 0.78 ? fTrunkS(x, y, z, snug) : FAR;
      if (y > 1.33) f = smin(f, fNeck(x, y, z), K_NECK);
      if (y < 1.10) { let g = fLeg(s, x, y, z); if (s * x < 0.05) g = smin(g, fLeg(-s, x, y, z), K_LEGS); f = smin(f, g, K_LEG); }
      return f;
    };
    const F = (x, y, z) => Fx(x, y, z, false), Fsnug = (x, y, z) => Fx(x, y, z, true);

    // ----- bone weights -----
    const wTrunkD = (x, y, z) => (y < 0.93 ? [BI.hips, 1] : wTorso(x, y, z));
    const wNeckD = (x, y, z) => { if (y < 1.395) return wTorso(x, y, z); const u = sm(1.395, 1.46, y); return [BI.neck, 1 - u, BI.head, u]; };
    const _w = [0, 0];
    const wLegD = (S, x, y, z) => {
      const s = S === 'R' ? -1 : 1;
      if (y < 0.15) {       // ankle, foot and toes
        toLocal(s, x, z, _w); const u = sm(0.095, 0.145, y), toe = sm(-0.010, 0.006, _w[1] - (0.104 - 0.30 * (_w[0] + 0.0275))) * (1 - sm(0.06, 0.09, y)), ft = 1 - u;
        return [BI['shin' + S], u, BI['foot' + S], ft * (1 - toe), BI['toe' + S], ft * toe];
      }
      if (y < IO_KNEE_Y + 0.07) { const u = sm(IO_KNEE_Y - 0.055, IO_KNEE_Y + 0.055, y); return [BI['shin' + S], 1 - u, BI['thigh' + S], u]; }
      const hp = sm(0.84, 0.99, y); return [BI['thigh' + S], 1 - hp, BI.hips, hp];
    };
    const KW = 0.026;
    function wAt(x, y, z) {
      const s = x < 0 ? -1 : 1, S = s < 0 ? 'R' : 'L';
      const ft = y > 0.78 ? fTrunkS(x, y, z, false) : FAR, fn = y > 1.33 ? fNeck(x, y, z) : FAR, fl = fLegFoot(s, x, y, z), fo = s * x < 0.05 ? fLegFoot(-s, x, y, z) : FAR, m0 = Math.min(ft, fn, fl, fo);
      const acc = new Map(), put = (w, m) => { for (let i = 0; i < w.length; i += 2) if (w[i + 1] * m > 1e-4) acc.set(w[i], (acc.get(w[i]) || 0) + w[i + 1] * m); };
      const mt = Math.exp(-(ft - m0) / KW), mn = Math.exp(-(fn - m0) / KW), ml = Math.exp(-(fl - m0) / KW), mo = Math.exp(-(fo - m0) / KW);
      if (mt > 1e-3) put(wTrunkD(x, y, z), mt);
      if (mn > 1e-3) put(wNeckD(x, y, z), mn);
      if (ml > 1e-3) put(wLegD(S, x, y, z), ml);
      if (mo > 1e-3) put(wLegD(s < 0 ? 'L' : 'R', x, y, z), mo);
      const ws = [...acc.entries()].sort((p, q) => q[1] - p[1]).slice(0, 4), flat = []; for (const [b, w] of ws) flat.push(b, w);
      return { w: flat, part: Math.max(mt, mn) >= Math.max(ml, mo) ? 0 : (ml >= mo ? (s < 0 ? 1 : 2) : (s < 0 ? 2 : 1)) };
    }
    // ----- where a point sits, for its paint: the trunk's picture runs round her as the bodice picture did (u from the middle of her back,
    // v from 0.86 to 1.405); a leg's runs round the leg (u 0 at the inside, 0.25 the front of the right leg ...) and up it (v = height) -----
    const E_ = 2 / P_;
    const uvTrunk = (x, y, z, o) => {
      const yy = look(TT, y), v = TT.v, rx = v[0], cz = (v[1] + v[2]) / 2, rz = (v[1] - v[2]) / 2, dz = z - cz;
      const sx = Math.sign(x) * Math.pow(Math.min(1, Math.abs(x) / rx), 1 / E_), cx = Math.sign(dz) * Math.pow(Math.min(1, Math.abs(dz) / rz), 1 / E_);
      let a = Math.atan2(sx, cx); o[0] = ((a - PI) / TAU % 1 + 1) % 1; o[1] = (y - 0.86) / (1.405 - 0.86); return o;
    };
    const uvLeg = (s, x, y, z, o) => { look(TL, y); const v = TL.v; o[0] = (Math.atan2(z - v[4], s * (x - s * v[3])) / TAU + 1.25) % 1; o[1] = y; return o; };       // 0.5 the outside, 0.25 the front, 0.75 the back; the seam on the inside
    return { F, Fsnug, fTrunkS, fNeck, fLegOnly, fLegFoot, fFoot, wAt, wLegD, uvTrunk, uvLeg, toLocal, toWorld, TOES, legAt: (y) => { look(TL, y); return Array.from(TL.v); }, trunkAt: (y) => { look(TT, y); return Array.from(TT.v); }, snets };
  })();

  // ---------- build the doll's skin ----------
  (function buildDoll() {
    const t0 = performance.now();
    const h = (opts.dollGrid || 0.0055) / DET;
    const G = snets(DOLL.F, [-0.22, 0.22, 0.098, 1.482, -0.165, 0.15], h);
    // parts: 0 trunk and neck, 1 right leg, 2 left leg. A triangle belongs to the part most of its corners do; its corners are given
    // that part's uv (points are doubled along the seams between parts, and where a leg's uv wraps round)
    const nv = G.nv, part = new Int8Array(nv), W = new Array(nv), UV = new Float32Array(nv * 2), tmp = [0, 0];
    for (let v = 0; v < nv; v++) { const r = DOLL.wAt(G.pos[v * 3], G.pos[v * 3 + 1], G.pos[v * 3 + 2]); W[v] = r.w; part[v] = r.part; }
    const uvOf = (P, v, o) => { const x = G.pos[v * 3], y = G.pos[v * 3 + 1], z = G.pos[v * 3 + 2]; return P === 0 ? DOLL.uvTrunk(x, y, z, o) : DOLL.uvLeg(P === 1 ? -1 : 1, x, y, z, o); };
    const outs = { 0: { pos: [], nor: [], uv: [], idx: [], w: [], map: new Map() }, 1: { pos: [], nor: [], uv: [], idx: [], w: [], map: new Map() } };
    for (let t = 0; t < G.tris.length; t += 3) {
      const a = G.tris[t], b = G.tris[t + 1], c = G.tris[t + 2], pa = part[a], pb = part[b], pc = part[c], P = pa === pb || pa === pc ? pa : pb === pc ? pb : pa;
      const O = outs[P === 0 ? 0 : 1], U = [], V = [];
      for (const v of [a, b, c]) { uvOf(P, v, tmp); U.push(tmp[0]); V.push(tmp[1]); }
      for (let i = 1; i < 3; i++) { if (U[i] - U[0] > 0.5) U[i] -= 1; else if (U[i] - U[0] < -0.5) U[i] += 1; }
      const m = (U[0] + U[1] + U[2]) / 3, sh = m > 1 ? -1 : m < 0 ? 1 : 0;
      [a, b, c].forEach((v, i) => {
        const u = U[i] + sh, key = v * 64 + P * 8 + (Math.floor(u) + 2); let o = O.map.get(key);
        if (o === undefined) { o = O.pos.length / 3; O.map.set(key, o); O.pos.push(G.pos[v * 3], G.pos[v * 3 + 1], G.pos[v * 3 + 2]); O.nor.push(G.nor[v * 3], G.nor[v * 3 + 1], G.nor[v * 3 + 2]); O.uv.push(u, V[i]); O.w.push(W[v]); }
        O.idx.push(o);
      });
    }
    // both legs wear one picture, mirrored (u runs round each leg the same way from its inside)
    const o0 = outs[0], o1 = outs[1];
    addPart('dollTrunk', { pos: o0.pos, uv: o0.uv, idx: o0.idx }, (x, y, z, i) => o0.w[i], { nor: new Float32Array(o0.nor) });
    addPart('dollLeg', { pos: o1.pos, uv: o1.uv, idx: o1.idx }, (x, y, z, i) => o1.w[i], { nor: new Float32Array(o1.nor) });
    // ---------- the feet: finer, from the floor to just above the ankle, 0.4 mm outside the leg so the leg's lowest edge stays hidden in them ----------
    const hf = (opts.footGrid || 0.0022) / DET, FP = [];
    for (const [S, s] of SIDES) {
      const Ff = (x, y, z) => DOLL.fLegFoot(s, x, y, z) - 0.0004 * (1 - sm(0.122, 0.134, y)) + 0.0003 * sm(0.130, 0.140, y);       // over the leg's lowest edge, then tucked just inside it
      const g = snets(Ff, s < 0 ? [-0.165, 0.005, DOLL_SOLE - 0.004, 0.142, -0.11, 0.205] : [-0.005, 0.165, DOLL_SOLE - 0.004, 0.142, -0.11, 0.205], hf);
      const uv = new Float32Array(g.nv * 2), w = new Array(g.nv), l = [0, 0];
      for (let v = 0; v < g.nv; v++) { const x = g.pos[v * 3], y = g.pos[v * 3 + 1], z = g.pos[v * 3 + 2]; DOLL.toLocal(s, x, z, l); uv[v * 2] = (l[0] + 0.07) / 0.14; uv[v * 2 + 1] = (l[1] + 0.10) / 0.30; w[v] = DOLL.wLegD(S, x, y, z); }
      addPart('dollFoot', { pos: Array.from(g.pos), uv: Array.from(uv), idx: g.tris }, (x, y, z, i) => w[i], { nor: g.nor });
      FP.push(g.nv);
    }
    // ---------- toenails: a thin plate on top of each toe's tip, laid on the skin from above, curved as the toe is ----------
    // [length, width as a share of the toe's width at its tip]; uv v runs from the back of the nail (0) to its free edge (1)
    const NAIL = [[0.0130, 1.48], [0.0078, 1.40], [0.0070, 1.40], [0.0063, 1.38], [0.0052, 1.30]], NR = 7, NTH = 28, wpt = [0, 0];
    for (const [S, s] of SIDES) {
      const pos = [], nor = [], uv = [], idx = [], W = [], e = 0.0004;
      DOLL.TOES.forEach((T, ti) => {
        const b = T[1], c = T[2], [nl, kw] = NAIL[ti], nw = c[3] * kw, dx = c[0] - b[0], dz = c[2] - b[2], L = Math.hypot(dx, dz), ax = dx / L, az = dz / L;
        const zc = -nl * 0.48 + 0.0012;                     // the nail's middle, back from the tip along the toe
        const base = pos.length / 3;
        for (let ri = 0; ri <= NR; ri++) for (let ti2 = 0; ti2 < (ri ? NTH : 1); ti2++) {
          const r = ri / NR, th = TAU * ti2 / NTH, ct = Math.cos(th), st = Math.sin(th), qx = Math.sign(ct) * Math.pow(Math.abs(ct), 0.55), qz = Math.sign(st) * Math.pow(Math.abs(st), 0.70);
          const u = 0.5 + 0.5 * r * qx, w = 0.5 + 0.5 * r * qz, lx = (u - 0.5) * nw, lz = zc + (w - 0.5) * nl;
          const X = c[0] + ax * lz + az * lx, Z = c[2] + az * lz - ax * lx;       // across the toe and along it
          DOLL.toWorld(s, X, Z, wpt); const x = wpt[0], z = wpt[1];
          let lo = DOLL_SOLE, hi = DOLL_SOLE + 0.045; for (let k = 0; k < 34; k++) { const m = (lo + hi) / 2; if (DOLL.fLegFoot(s, x, m, z) < 0) lo = m; else hi = m; }
          const y = (lo + hi) / 2, gx = DOLL.fLegFoot(s, x + e, y, z) - DOLL.fLegFoot(s, x - e, y, z), gy = DOLL.fLegFoot(s, x, y + e, z) - DOLL.fLegFoot(s, x, y - e, z), gz = DOLL.fLegFoot(s, x, y, z + e) - DOLL.fLegFoot(s, x, y, z - e), gl = Math.hypot(gx, gy, gz) || 1;
          const lift = 0.00045 + 0.00025 * (1 - r * r) + 0.0004 * sm(0.75, 1.0, w) * (1 - Math.abs(u - 0.5));      // a little domed, and the free edge stands off the skin
          pos.push(x + gx / gl * lift, y + gy / gl * lift, z + gz / gl * lift); nor.push(gx / gl, gy / gl, gz / gl); uv.push(u, w); W.push(DOLL.wLegD(S, x, y, z));
        }
        const at = (ri, k) => (ri === 0 ? base : base + 1 + (ri - 1) * NTH + ((k % NTH) + NTH) % NTH);
        for (let k = 0; k < NTH; k++) idx.push(at(0, 0), at(1, k + 1), at(1, k));
        for (let ri = 1; ri < NR; ri++) for (let k = 0; k < NTH; k++) { const a = at(ri, k), b2 = at(ri, k + 1), c2 = at(ri + 1, k), d = at(ri + 1, k + 1); idx.push(a, b2, d, a, d, c2); }
      });
      // wind each triangle to face away from the toe
      for (let t = 0; t < idx.length; t += 3) { const [a, b2, c2] = [idx[t], idx[t + 1], idx[t + 2]]; const P = (i) => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], A = P(a), B = P(b2), C = P(c2);
        const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2], cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
        if (cx * nor[a * 3] + cy * nor[a * 3 + 1] + cz * nor[a * 3 + 2] < 0) { idx[t + 1] = c2; idx[t + 2] = b2; } }
      addPart('toenail', { pos, uv, idx }, (x, y, z, i) => W[i], { nor: new Float32Array(nor) });
    }
    DOLL.stats = { ms: Math.round(performance.now() - t0), trunk: o0.idx.length / 3, legs: o1.idx.length / 3, h, hf, footVerts: FP };
  })();
