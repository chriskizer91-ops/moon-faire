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

