  // ---------- the blank doll: his body under the clothes, as one skin ----------
  // Chris (November 13): "I think it would be better to use one of the witches like blank dolls for their body and then adjust from
  // there into a man shape, then put the clothes over the doll."
  // What is taken from the Ranger's doll (models/ranger-3d/src/R30_body.js, R05_tables.js): the way a body is written down, as tables of
  // half width, front and back by height for the trunk and each leg, and width and thickness along the arm; her bone weights for the
  // spine, shoulder girdle, elbow, wrist and knee; her way of running the forearm on inside the heel of the hand.
  // What is different: her trunk, arms and legs are separate tubes pushed into each other, and the joins are hidden by her clothes. His
  // doll has to look right bare, so the same tables describe one soft solid (trunk, neck, two arms, two legs, two feet, blended where they
  // meet) and its skin is found on a grid and cut into triangles. That is how her hands are made (32_hands.js). So shoulder, armpit,
  // crotch and the foot of the neck are one piece of skin with no joins.
  // The numbers are his: tools/doll_measure.py reads them off B5 (bare legs, hips, seat), B3 (waist, shoulders, forearm) and D3 (wrist).
  // Chest, back and upper arm are under cloth in every painting: those are a man of his size, kept inside his clothes as B1 and B2 paint them.
  // He rests as his skeleton rests (10_geom.js): arms 27 degrees out, feet apart, soles of the BOOTS on y = 0, so his bare soles are 4.8 cm up.

  // trunk: [height, [half width, front, back, squareness of the plan (2 is an ellipse)]]
  //   0.86 to 1.06 from B5 at 900 px/m, less 3 mm for the cloth of the shorts; 1.06 to 1.20 inside the corset of B1 (half width 0.149 at 1.16);
  //   above that a man's chest, inside the shirt of B1 and B2. The line of his shoulders runs from the foot of his neck to 1.45 m over the
  //   shoulder joint (the shirt in B1 and B3 is at 1.46 there; nearer the neck his hair hides it). That is up to 1.5 cm ABOVE the trunk of the
  //   old skin, which is cut low there and leaves the top of the shoulder to its sleeves. The top closes inside his neck.
  const D_TRUNK = [[0.800, [0.0472, 0.0425, -0.0283, 2]], [0.830, [0.0944, 0.0803, -0.0567, 2]], [0.860, [0.1322, 0.0982, -0.0793, 2.1]], [0.900, [0.1587, 0.1067, -0.0973, 2.2]],
    [0.923, [0.1624, 0.1067, -0.1086, 2.2]], [0.946, [0.1634, 0.1077, -0.1143, 2.2]], [0.969, [0.1596, 0.1077, -0.1133, 2.2]], [0.992, [0.1549, 0.1058, -0.1058, 2.2]],
    [1.015, [0.1492, 0.1048, -0.0916, 2.2]], [1.037, [0.1426, 0.1039, -0.0774, 2.2]], [1.060, [0.142, 0.104, -0.076, 2.2]], [1.100, [0.14, 0.103, -0.076, 2.2]],
    [1.160, [0.139, 0.104, -0.077, 2.25]], [1.200, [0.143, 0.108, -0.084, 2.25]], [1.240, [0.151, 0.113, -0.092, 2.3]], [1.280, [0.16, 0.118, -0.100, 2.3]],
    [1.320, [0.166, 0.119, -0.106, 2.3]], [1.360, [0.171, 0.112, -0.108, 2.25]], [1.400, [0.178, 0.094, -0.107, 2.2]], [1.420, [0.184, 0.082, -0.105, 2.2]],
    [1.436, [0.185, 0.070, -0.103, 2.2]], [1.448, [0.181, 0.060, -0.101, 2.2]], [1.458, [0.168, 0.051, -0.099, 2.15]], [1.468, [0.150, 0.042, -0.096, 2.1]], [1.478, [0.127, 0.034, -0.093, 2]],
    [1.492, [0.094, 0.022, -0.086, 2]], [1.504, [0.066, 0.01, -0.072, 2]], [1.514, [0.04, -0.01, -0.055, 2]], [1.520, [0.012, -0.025, -0.045, 2]]];
  // neck: [height, [half width, front, back]]. From 1.455 up these are the rings of the neck he already has (buildNeck in N40_head.js), 4 mm
  // smaller, so the doll's neck runs up hidden inside his own. His own (painted) neck is the one that shows: it stands in the doll's shoulders,
  // which close over its foot steeply, so the line where the two skins cross is a crisp one all the way round.
  // If the neck in N40_head.js is reshaped, change these rows with it.
  const D_NECK = [[1.380, [0.060, 0.006, -0.088]], [1.420, [0.060, 0.014, -0.090]], [1.455, [0.060, 0.022, -0.092]], [1.480, [0.056, 0.029, -0.086]], [1.505, [0.0535, 0.036, -0.081]], [1.530, [0.052, 0.041, -0.076]]];
  // one leg: [height, [middle out from his centre line, middle front to back, half width, half depth]]
  //   0.37 to 0.86 from B5 at 900 px/m, each landmark of B5 set at its height on his skeleton (knee joint 0.53, calf widest 0.414);
  //   below 0.37 the leg is inside the boot in every painting: a man's shin and ankle, inside the boot of B1.
  const D_LEG = [[0.070, [0.153, -0.046, 0.034, 0.04]], [0.110, [0.152, -0.045, 0.036, 0.043]], [0.160, [0.15, -0.045, 0.034, 0.039]], [0.220, [0.147, -0.046, 0.037, 0.041]], [0.300, [0.143, -0.047, 0.043, 0.047]],
    [0.366, [0.14, -0.048, 0.0482, 0.0515]], [0.390, [0.138, -0.048, 0.056, 0.0571]], [0.414, [0.136, -0.0465, 0.059, 0.0619]], [0.438, [0.134, -0.043, 0.058, 0.0633]], [0.462, [0.132, -0.0365, 0.0543, 0.0628]],
    [0.486, [0.129, -0.0255, 0.0524, 0.0619]], [0.511, [0.126, -0.013, 0.0538, 0.0614]], [0.540, [0.122, -0.007, 0.0571, 0.0652]], [0.580, [0.117, -0.003, 0.0595, 0.0661]], [0.620, [0.113, 0.001, 0.0623, 0.0722]],
    [0.660, [0.109, 0.002, 0.0661, 0.0779]], [0.700, [0.106, 0.004, 0.0722, 0.0845]], [0.740, [0.103, 0.008, 0.0779, 0.0892]], [0.780, [0.099, 0.013, 0.0826, 0.0921]], [0.821, [0.096, 0.016, 0.0855, 0.0945]],
    [0.860, [0.095, 0.017, 0.083, 0.0944]], [0.900, [0.094, 0.017, 0.0822, 0.0935]], [0.940, [0.093, 0.014, 0.0746, 0.0793]], [0.980, [0.091, 0.012, 0.0623, 0.0642]], [1.020, [0.089, 0.012, 0.0434, 0.051]],
    [1.050, [0.088, 0.011, 0.017, 0.0198]]];
  // one arm: [distance from the shoulder joint, [half size along e1, half size along e2, shift of the middle up and out (down and in if negative), shift forward]]
  //   At the shoulder e1 is front to back and e2 is up and out. Down the forearm the two turn with his hand (which rests with its back
  //   forward, HAND_TW), so at the wrist e1 is across the wrist and e2 is its thickness. Elbow at 0.285, wrist joint at 0.530.
  //   D3 gives the wrist 5.5 cm across; B3 gives the forearm 7.0 cm across at 0.46 from the shoulder. The doll's wrist is 5.7 (the stub of the hand
  //   model, which it has to cover) and its forearm 6.4 at 0.46: 6 mm slimmer than painted, so that it stays inside the forearm of the old skin.
  //   The upper arm is a man's, inside the sleeve of B1.
  //   From 0.50 on it covers the stub of the hand model, and past the joint it thins and runs on inside the heel of the hand, as the Ranger's does.
  //   The table starts 3.5 cm below the shoulder joint, where the shoulder muscle is at its fullest. Above that the arm ends in half an egg
  //   D_ARM_CAP long (the ball of the shoulder), most of it inside the trunk.
  const D_ARM = [[0.035, [0.0475, 0.045, -0.012, 0.004]], [0.060, [0.0485, 0.046, -0.008, 0.004]], [0.080, [0.049, 0.047, -0.005, 0.004]], [0.130, [0.0485, 0.046, -0.005, 0.003]], [0.180, [0.0465, 0.0435, -0.005, 0.002]],
    [0.230, [0.0425, 0.0395, -0.004, 0.001]], [0.265, [0.040, 0.0375, -0.003, 0]], [0.285, [0.0392, 0.0368, -0.002, 0]], [0.310, [0.0395, 0.038, -0.001, 0]], [0.340, [0.0397, 0.0385, 0, 0]], [0.380, [0.0385, 0.036, 0, 0]],
    [0.430, [0.035, 0.0315, 0, 0]], [0.465, [0.0335, 0.0275, 0, 0]], [0.498, [0.031, 0.0235, 0, 0]], [0.510, [0.0295, 0.0215, 0, 0]], [0.520, [0.0286, 0.0202, 0, 0]], [0.530, [0.0283, 0.0180, 0, 0]], [0.543, [0.029, 0.0138, 0, 0]], [0.556, [0.029, 0.012, 0, 0]]];
  // the foot inside the boot: three soft lumps (heel, instep, ball and toes), cut flat where the boot's insole is. [middle x, y, z, half sizes x, y, z]
  const D_FOOT = [[0.152, 0.084, -0.060, 0.033, 0.038, 0.046], [0.158, 0.086, 0.012, 0.038, 0.037, 0.072], [0.166, 0.070, 0.086, 0.046, 0.023, 0.070]], D_SOLE = 0.048;
  const D_KNEE = N_KNEE_Y, D_ARM_END = D_ARM[D_ARM.length - 1][0], D_ARM_CAP = 0.034, D_ARM_0 = D_ARM[0][0];

  const DOLL = (() => {
    // --- each table, read once every millimetre, then evened out along its length ---
    // The rows are measurements, a few millimetres out here and there, and a curve drawn exactly through them changes its bend at every row.
    // On bare skin that shows as faint hoops of light. So each column is smoothed along the limb (a bell about 'soft' metres wide), which
    // moves nothing by more than a millimetre or so but leaves one even curve.
    const mkTab = (K, soft) => {
      const x0 = K[0][0], x1 = K[K.length - 1][0], st = 0.001, n = Math.ceil((x1 - x0) / st) + 1, nc = K[0][1].length, c = [], R = Math.round(soft / st), tmpc = new Float64Array(n + 1);
      for (let k = 0; k < nc; k++) c.push(new Float64Array(n + 1));
      for (let i = 0; i <= n; i++) { const v = spline(K, Math.min(x1, x0 + i * st)); for (let k = 0; k < nc; k++) c[k][i] = v[k]; }
      for (let k = 0; k < nc; k++) for (let pass = 0; pass < 3; pass++) {              // three passes of a moving mean come out very near a bell curve
        for (let i = 0; i <= n; i++) { let a = 0; for (let j = -R; j <= R; j++) a += c[k][Math.max(0, Math.min(n, i + j))]; tmpc[i] = a / (2 * R + 1); }
        c[k].set(tmpc);
      }
      return { x0, x1, inv: 1 / st, n, c, v: new Float64Array(nc) };
    };
    const look = (T, x) => {                              // fills T.v with the table's row at x; returns x held inside the table
      const xc = x < T.x0 ? T.x0 : x > T.x1 ? T.x1 : x, fi = (xc - T.x0) * T.inv, i = Math.min(T.n - 1, Math.floor(fi)), u = fi - i;
      for (let k = 0; k < T.c.length; k++) T.v[k] = T.c[k][i] + (T.c[k][i + 1] - T.c[k][i]) * u;
      return xc;
    };
    // Each part's field is the distance to its skin measured IN ITS OWN SLICE (level for the trunk, neck and legs; square across for the arm).
    // Where a part narrows fast that is a little more than the true distance, never less, so the soft joins below can only come out
    // tighter than asked, never as a fin. (Dividing by the full slope, the first try, made fins where the shoulder closes.)
    const TT = mkTab(D_TRUNK, 0.008), TN = mkTab(D_NECK, 0.006), TL = mkTab(D_LEG, 0.008), TA = mkTab(D_ARM, 0.004);
    const FAR = 0.5;
    // a cap on the end of a tube: outside the table's range the distance to the end is added
    const capped = (f, dy) => (dy <= 0 ? f : f > 0 ? Math.sqrt(f * f + dy * dy) : dy);
    const gs2 = (dx, dy, wx, wy) => Math.exp(-dx * dx / (wx * wx) - dy * dy / (wy * wy));

    // --- trunk ---
    // small shapes on the trunk, in metres of skin pushed out (or in, negative): chest muscles, the furrow of the breastbone and the spine,
    // the two halves of the seat and the cleft between them, the shoulder blades. Kept shallow: he is a doll, not an anatomy chart.
    const trunkRelief = (x, y, front) => {
      const ax = Math.abs(x);
      if (front > 0) return front * (0.0065 * gs2(ax - 0.074, y - 1.318, 0.058, 0.046) - 0.0030 * gs2(x, y - 1.25, 0.014, 0.13));
      const k = -front;
      return k * (0.0050 * gs2(ax - 0.088, y - 0.925, 0.062, 0.062) - 0.0120 * gs2(x, y - 0.905, 0.015, 0.060) - 0.0035 * gs2(x, y - 1.20, 0.020, 0.17) + 0.0035 * gs2(ax - 0.090, y - 1.355, 0.050, 0.055));
    };
    const fTrunk = (x, y, z) => {
      if (y < 0.72 || y > 1.58) return FAR;
      const yc = look(TT, y), v = TT.v, rx = v[0], cz = (v[1] + v[2]) / 2, rz = (v[1] - v[2]) / 2, p = v[3], dz = z - cz, ax = Math.abs(x), az = Math.abs(dz);
      const a = Math.pow(ax / rx, p), b = Math.pow(az / rz, p), s = a + b; let f;
      if (s < 0.03) f = -0.6 * Math.min(rx, rz);
      else {
        const G = Math.pow(s, 1 / p), k = G / s, gx = ax > 1e-6 ? k * a / ax : 0, gz = az > 1e-6 ? k * b / az : 0;
        f = (G - 1) / Math.sqrt(gx * gx + gz * gz);
        if (f < 0.05 && f > -0.05) f -= trunkRelief(x, y, cl(dz / rz * 1.6, -1, 1)) * (1 - sm(0.008, 0.05, Math.abs(f)));      // fades out away from the skin, so the soft joins (which feel the field a few centimetres out) get no edge from it
      }
      return capped(f, y > yc ? y - yc : yc - y);
    };
    // --- neck ---
    const fNeck = (x, y, z) => {
      if (y < 1.33 || y > 1.60) return FAR;
      const yc = look(TN, y), v = TN.v, rx = v[0], cz = (v[1] + v[2]) / 2, rz = (v[1] - v[2]) / 2, dz = z - cz;
      const a = x * x / (rx * rx), b = dz * dz / (rz * rz), s = a + b;
      if (s < 0.03) return capped(-0.6 * Math.min(rx, rz), y > yc ? y - yc : yc - y);
      const G = Math.sqrt(s), gx = x / (rx * rx * G), gz = dz / (rz * rz * G);
      return capped((G - 1) / Math.sqrt(gx * gx + gz * gz), y > yc ? y - yc : yc - y);
    };
    // --- a leg, with its foot; s is -1 for his right, 1 for his left ---
    const LG = { y: 0, dx: 0, dz: 0 };                    // where the last point asked about sits on the leg (for the weights and the uv)
    const fLegOnly = (s, x, y, z) => {
      const yc = look(TL, y), v = TL.v, rx = v[2], rz = v[3], dx = x - s * v[0], dz = z - v[1];
      LG.y = y; LG.dx = dx; LG.dz = dz;
      const a = dx * dx / (rx * rx), b = dz * dz / (rz * rz), sq = a + b; let f;
      if (sq < 0.03) f = -0.6 * Math.min(rx, rz);
      else {
        const G = Math.sqrt(sq), gx = dx / (rx * rx * G), gz = dz / (rz * rz * G);
        f = (G - 1) / Math.sqrt(gx * gx + gz * gz);
        if (f < 0.05 && f > -0.05 && dz > 0) f -= 0.0020 * (dz / rz) * gs2(dx, y - (D_KNEE + 0.008), 0.030, 0.034) * (1 - sm(0.008, 0.05, Math.abs(f)));      // the kneecap
      }
      return capped(f, y > yc ? y - yc : yc - y);
    };
    const fFoot = (s, x, y, z) => {
      let f = FAR;
      for (let i = 0; i < 3; i++) {
        const E = D_FOOT[i], ux = (x - s * E[0]) / E[3], uy = (y - E[1]) / E[4], uz = (z - E[2]) / E[5], q = ux * ux + uy * uy + uz * uz;
        let g;
        if (q < 0.03) g = -0.6 * E[4];
        else { const G = Math.sqrt(q), gx = ux / E[3], gy = uy / E[4], gz = uz / E[5]; g = (G - 1) * G / Math.sqrt(gx * gx + gy * gy + gz * gz); }
        f = i ? smin(f, g, 0.030) : g;
      }
      return f;
    };
    const fLeg = (s, x, y, z) => {
      if (y > 1.12 || s * x < -0.06) return FAR;
      let f = fLegOnly(s, x, y, z);
      if (y < 0.20) { f = smin(f, fFoot(s, x, y, z), 0.022); f = -smin(-f, y - D_SOLE, 0.012); }      // the sole is flat, with a rounded edge
      return f;
    };
    // --- an arm ---
    const AR = { sl: 0, an: 0, az: 0 }, ARMS = {};
    for (const [S, s] of SIDES) { const d = armDir[S], sh = restPts['sh' + S]; ARMS[s] = { S, sx: sh.x, sy: sh.y, sz: sh.z, dx: d.x, dy: d.y, nx: s * Math.cos(A_POSE), ny: Math.sin(A_POSE) }; }
    const armTurn = (sl) => HAND_TW * sm(0.30, 0.50, sl), armDrift = (sl) => 0.0065 * sm(0.44, 0.535, sl);      // the forearm turns with the hand, and drifts to the thumb side, where the middle of the hand is
    const fArm = (s, x, y, z) => {
      const A = ARMS[s], qx = x - A.sx, qy = y - A.sy, sl = qx * A.dx + qy * A.dy, qn = qx * A.nx + qy * A.ny, qz = z - A.sz;
      AR.sl = sl; AR.an = qn; AR.az = qz;
      if (sl < -0.12 || sl > D_ARM_END + 0.08 || qn * qn + qz * qz > 0.0144) return FAR;
      const slc = look(TA, sl), v = TA.v, ra = v[0], rb = v[1], ph = armTurn(slc), c = Math.cos(ph), sn = Math.sin(ph), an = qn - v[2], az = qz - v[3];
      const a = c * az - sn * an - armDrift(slc), b = -c * an - sn * az, ea = a * a / (ra * ra), eb = b * b / (rb * rb), sq = ea + eb; let f;
      if (sl < D_ARM_0) {                                 // the ball of the shoulder: half an egg, so the skin round it has no edge to catch the light
        const t = sl - D_ARM_0, el = t * t / (D_ARM_CAP * D_ARM_CAP), q = ea + eb + el; if (q < 0.03) return -0.6 * rb;
        const Q_ = Math.sqrt(q), ga = a / (ra * ra * Q_), gb = b / (rb * rb * Q_), gl = t / (D_ARM_CAP * D_ARM_CAP * Q_); return (Q_ - 1) / Math.sqrt(ga * ga + gb * gb + gl * gl);
      }
      if (sq < 0.03) f = -0.6 * Math.min(ra, rb);
      else { const G = Math.sqrt(sq), ga = a / (ra * ra * G), gb = b / (rb * rb * G); f = (G - 1) / Math.sqrt(ga * ga + gb * gb); }
      return capped(f, sl > slc ? sl - slc : slc - sl);
    };
    // --- soft joins: the smaller of two, rounded over a width k where they meet (smooth to the second derivative, so light does not break there) ---
    function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * h * k / 6; }
    // The arm joins the trunk with much more skin over the top of the shoulder (where a man's shoulder muscle runs up onto the collarbone and
    // the shoulder blade) than underneath, where the armpit stays a hollow. sminQ fills more than smin for the same width: up to a quarter of k.
    function sminQ(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k / 4; }
    const kArm = (y) => 0.030 + 0.065 * sm(1.355, 1.435, y);
    const K_NECK = 0.022, K_LEG = 0.024, K_LEGS = 0.020;
    const F = (x, y, z) => {
      const s = x < 0 ? -1 : 1;
      let f = y > 0.72 ? fTrunk(x, y, z) : FAR;
      if (y > 1.33) f = smin(f, fNeck(x, y, z), K_NECK);
      if (y > 0.85) f = sminQ(f, fArm(s, x, y, z), kArm(y));
      if (y < 1.12) { let g = fLeg(s, x, y, z); if (s * x < 0.06) g = smin(g, fLeg(-s, x, y, z), K_LEGS); f = smin(f, g, K_LEG); }
      return f;
    };

    // --- the skin: one point in every grid cell it passes through, joined to its neighbours (surface nets, as for the hands) ---
    const h = (opts.dollGrid || 0.009) / DET;
    const X1 = Math.ceil(0.50 / h) * h, X0 = -X1, Y0 = 0.02, Y1 = 1.56, Z0 = -0.20, Z1 = 0.20;      // the grid has a plane of points on his centre line, so both halves come out alike
    const nx = Math.round((X1 - X0) / h) + 1, ny = Math.ceil((Y1 - Y0) / h) + 1, nz = Math.ceil((Z1 - Z0) / h) + 1, nxy = nx * ny;
    const val = new Float32Array(nxy * nz).fill(NaN);
    {                                                   // a coarse look first, so the fine grid is only worked out near the skin
      const C = 3, band = 5.4 * h, mx = Math.ceil((nx - 1) / C), my = Math.ceil((ny - 1) / C), mz = Math.ceil((nz - 1) / C), cv = new Float32Array((mx + 1) * (my + 1) * (mz + 1));
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
    // --- each point is slid onto the skin itself (the grid only gets it to within a part of a cell), then given the skin's own direction ---
    const nv = P.length / 3, pos = new Float32Array(P), nor = new Float32Array(nv * 3), e = 0.0015;
    const grad = (x, y, z, o, i) => { const gx = F(x + e, y, z) - F(x - e, y, z), gy = F(x, y + e, z) - F(x, y - e, z), gz = F(x, y, z + e) - F(x, y, z - e), l = Math.hypot(gx, gy, gz) || 1; o[i] = gx / l; o[i + 1] = gy / l; o[i + 2] = gz / l; return l / (2 * e); };
    for (let it = 0; it < 3; it++) for (let v = 0; v < nv; v++) {
      const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], sl = Math.max(0.5, grad(x, y, z, nor, v * 3));
      const st = cl(F(x, y, z) / sl, -0.3 * h, 0.3 * h); pos[v * 3] = x - st * nor[v * 3]; pos[v * 3 + 1] = y - st * nor[v * 3 + 1]; pos[v * 3 + 2] = z - st * nor[v * 3 + 2];
    }
    for (let v = 0; v < nv; v++) { grad(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2], nor, v * 3); if (Math.abs(pos[v * 3]) < 1e-5) { pos[v * 3] = 0; nor[v * 3] = 0; const l = Math.hypot(nor[v * 3 + 1], nor[v * 3 + 2]) || 1; nor[v * 3 + 1] /= l; nor[v * 3 + 2] /= l; } }

    // --- which bones carry each point ---
    // Every part has its own rule (the Ranger's and his own: spine by height, shoulder girdle, elbow, wrist, hip, knee, ankle as his boot bends),
    // and where two parts run into each other a point takes some of each, by how near it is to either one's own skin.
    const KW = 0.028;
    const wTrunkD = (x, y, z) => (y < 0.93 ? [BI.hips, 1] : wTrunk(x, y, z));
    const wNeckD = (y) => { const n = sm(1.42, 1.47, y), u = sm(1.50, 1.585, y); return [BI.spine3, 1 - n, BI.neck, n * (1 - u), BI.head, n * u]; };
    const wLegD = (S, x, y, z) => {
      if (y < 0.26) return wBoot(S, x, y, z);                                    // inside the boot he moves exactly as the boot does
      if (y < D_KNEE + 0.07) { const u = sm(D_KNEE - 0.06, D_KNEE + 0.06, y); return [BI['shin' + S], 1 - u, BI['thigh' + S], u]; }
      const hp = sm(0.83, 0.99, y); return [BI['thigh' + S], 1 - hp, BI.hips, hp];
    };
    const wB = new Array(nv), part = new Int8Array(nv), pu = new Float32Array(nv), pv = new Float32Array(nv), tone = new Float32Array(nv);
    // the uv of a point as part P sees it: [how far round (0 to 1), metres along]. Parts: 0 trunk and neck, 1 right leg, 2 left leg, 3 right arm, 4 left arm.
    const uvOf = (P_, x, y, z, o) => {
      if (P_ === 0) { look(TT, y); o[0] = Math.atan2(x, z - (TT.v[1] + TT.v[2]) / 2) / TAU + 0.5; o[1] = y; }                       // 0 and 1 at the middle of his back, 0.5 at the front
      else if (P_ < 3) { const s = P_ === 1 ? -1 : 1; look(TL, y); o[0] = Math.atan2(z - TL.v[1], s * (x - s * TL.v[0])) / TAU + 0.5; o[1] = y; }      // the seam runs down the inside of the leg; 0.5 is the outside, 0.75 the front
      else { const s = P_ === 3 ? -1 : 1; fArm(s, x, y, z); o[0] = Math.atan2(AR.az, AR.an) / TAU + 0.5; o[1] = AR.sl; }             // the seam runs along the under side of the arm; 0.75 is the front
    };
    const tmp = [0, 0];
    for (let v = 0; v < nv; v++) {
      const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], s = x < 0 ? -1 : 1, S = s < 0 ? 'R' : 'L';
      const ft = fTrunk(x, y, z), fn = fNeck(x, y, z), fa = y > 0.85 ? fArm(s, x, y, z) : FAR, sl = AR.sl, fl = fLeg(s, x, y, z), fo = fLeg(-s, x, y, z), m0 = Math.min(ft, fn, fa, fl, fo);
      const acc = new Map(), put = (w, m) => { for (let i = 0; i < w.length; i += 2) if (w[i + 1] * m > 1e-4) acc.set(w[i], (acc.get(w[i]) || 0) + w[i + 1] * m); };
      const mt = Math.exp(-(ft - m0) / KW), mn = Math.exp(-(fn - m0) / KW), ma = Math.exp(-(fa - m0) / KW), ml = Math.exp(-(fl - m0) / KW), mo = Math.exp(-(fo - m0) / KW);
      if (mt > 1e-3) put(wTrunkD(x, y, z), mt);
      if (mn > 1e-3) put(wNeckD(y), mn);
      if (ma > 1e-3) put(wArm(S, sl), ma);
      if (ml > 1e-3) put(wLegD(S, x, y, z), ml);
      if (mo > 1e-3) put(wLegD(s < 0 ? 'L' : 'R', x, y, z), mo);
      const ws = [...acc.entries()].sort((p, q) => q[1] - p[1]).slice(0, 4), flat = []; for (const [b, w] of ws) flat.push(b, w);
      wB[v] = flat;
      const mb = Math.max(mt, mn), mm = Math.max(mb, ma, ml, mo);
      part[v] = mm === mb ? 0 : mm === ma ? (s < 0 ? 3 : 4) : mm === ml ? (s < 0 ? 1 : 2) : (s < 0 ? 2 : 1);
      uvOf(part[v], x, y, z, tmp); pu[v] = tmp[0]; pv[v] = tmp[1];
      tone[v] = ma / (mt + mn + ma + ml + mo) * sm(0.30, 0.50, sl);              // 0: the tone of his neck; 1: the tone of his hands (toward the wrist)
    }
    // --- triangles, each facing out. uv.x = part number + how far round, uv.y = metres along; points are doubled only along the seams ---
    const src = [], uv = [], idx = [], reg = [], keys = new Map();      // reg: for every triangle, 0 trunk and neck, 1 a leg, 2 an arm (N99_static.js draws the doll by region)
    const emit = (v, P_, wrap, u, w) => { const key = (v * 8 + P_) * 4 + wrap; let o = keys.get(key); if (o === undefined) { o = src.length; keys.set(key, o); src.push(v); uv.push(P_ + cl(u, 0.002, 0.998), w); } return o; };
    const tri = (a, b, c) => {
      const pa = part[a], pb = part[b], pc = part[c], P_ = pa === pb || pa === pc ? pa : pb === pc ? pb : pa, V = [a, b, c], U = [0, 0, 0], W = [0, 0, 0];
      for (let i = 0; i < 3; i++) { const v = V[i]; if (part[v] === P_) { U[i] = pu[v]; W[i] = pv[v]; } else { uvOf(P_, pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2], tmp); U[i] = tmp[0]; W[i] = tmp[1]; } }
      const own = [U[0], U[1], U[2]]; reg.push(P_ === 0 ? 0 : P_ < 3 ? 1 : 2);
      for (let i = 1; i < 3; i++) { if (U[i] - U[0] > 0.5) U[i] -= 1; else if (U[i] - U[0] < -0.5) U[i] += 1; }
      const m = (U[0] + U[1] + U[2]) / 3, sh = m > 1 ? -1 : m < 0 ? 1 : 0;
      for (let i = 0; i < 3; i++) { const q = U[i] + sh, v = V[i]; idx.push(emit(v, P_, part[v] !== P_ ? 3 : Math.abs(q - own[i]) < 1e-6 ? 0 : q < own[i] ? 1 : 2, q, W[i])); }
    };
    const d2 = (a, b) => { const dx = pos[a * 3] - pos[b * 3], dy = pos[a * 3 + 1] - pos[b * 3 + 1], dz = pos[a * 3 + 2] - pos[b * 3 + 2]; return dx * dx + dy * dy + dz * dz; };
    for (let q = 0; q < quads.length; q += 4) {
      const a = quads[q]; let b = quads[q + 1]; const c = quads[q + 2]; let d = quads[q + 3];
      const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2], vx = pos[d * 3] - pos[a * 3], vy = pos[d * 3 + 1] - pos[a * 3 + 1], vz = pos[d * 3 + 2] - pos[a * 3 + 2];
      const mx = nor[a * 3] + nor[c * 3], my = nor[a * 3 + 1] + nor[c * 3 + 1], mz = nor[a * 3 + 2] + nor[c * 3 + 2];
      if ((uy * vz - uz * vy) * mx + (uz * vx - ux * vz) * my + (ux * vy - uy * vx) * mz < 0) { const t = b; b = d; d = t; }
      if (d2(a, c) <= d2(b, d)) { tri(a, b, c); tri(a, c, d); } else { tri(a, b, d); tri(b, c, d); }
    }
    return { F, h, pos, nor, src, uv, idx, reg, wB, tone, fTrunk, fNeck, fLeg, fArm, tables: { trunk: D_TRUNK, neck: D_NECK, leg: D_LEG, arm: D_ARM, foot: D_FOOT } };
  })();
  // his skin tone runs from the tone of his neck (trunk, legs, upper arms) to the tone of his hands (at the wrists), so neither join shows as a change of colour
  const dollCol = [];
  (function buildDoll() {
    const G = DOLL, n = G.src.length, pos = new Array(n * 3), nor = new Float32Array(n * 3), wts = new Array(n);
    const cN = lin((BAKED && BAKED.skinNeck) || '#c5815e'), cH = lin((BAKED && BAKED.skinHand) || SKIN || '#c07a54');
    for (let i = 0; i < n; i++) {
      const v = G.src[i], t = G.tone[v];
      pos[i * 3] = G.pos[v * 3]; pos[i * 3 + 1] = G.pos[v * 3 + 1]; pos[i * 3 + 2] = G.pos[v * 3 + 2]; nor[i * 3] = G.nor[v * 3]; nor[i * 3 + 1] = G.nor[v * 3 + 1]; nor[i * 3 + 2] = G.nor[v * 3 + 2];
      wts[i] = G.wB[v]; dollCol.push(lerp(cN.r, cH.r, t), lerp(cN.g, cH.g, t), lerp(cN.b, cH.b, t));
    }
    addPart('doll', { pos, uv: G.uv, idx: G.idx }, (x, y, z, i) => wts[i], { nor });
  })();
