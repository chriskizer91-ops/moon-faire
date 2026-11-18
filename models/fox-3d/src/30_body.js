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

