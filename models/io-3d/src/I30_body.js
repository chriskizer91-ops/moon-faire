
  // ---------- Io's body and base outfit (stage one): black bodice, bare arms and legs, the tiered lace skirt (stiff for now) ----------
  // Shapes come from the tables in I05_tables.js. The torso wears one picture that wraps right round her (u runs round the body
  // from the middle of her back, v is height), baked from four paintings: B3 front and back, B2 both sides (bake_io.py).
  const SPINE_W = [['hips', 0.975], ['spine1', 1.055], ['spine2', 1.145], ['spine3', 1.255]];
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
    const k = 0.75 * sm(0.070, 0.125, ax) * sm(1.19, 1.27, y);       // the shoulder girdle follows the collarbone
    if (k > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - k; w.push(BI['clav' + S], k); }
    const ku = 0.30 * sm(0.080, 0.118, ax) * sm(1.15, 1.225, y) * (1 - sm(1.262, 1.300, y)) * (1 - sm(0.022, 0.050, Math.abs(z + 0.018)));       // under the joint her skin goes part of the way with the arm, so her armpit opens as the arm lifts
    if (ku > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - ku; w.push(BI['uarm' + S], ku); }
    if (y > 1.33) { const n = sm(1.33, 1.40, y) * (1 - sm(0.05, 0.1, ax)); if (n > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - n; w.push(BI.neck, n); } }
    return w;
  }

  // the torso surface: u 0..1 round the body (0 the middle of her back, 0.25 her right side, 0.5 the front), y height
  const IO_E = 2 / IO_TPW;
  function ioTorso(u, y) {
    const [rx, zf, zb] = spline(IO_TORSO, cl(y, IO_TORSO[0][0], IO_TY1)), cz = (zf + zb) / 2, rf = zf - cz, rb = cz - zb;
    const a = PI + u * TAU, s = Math.sin(a), c = Math.cos(a);
    const x = rx * Math.sign(s) * Math.pow(Math.abs(s), IO_E); let z = cz + (c >= 0 ? rf : rb) * Math.sign(c) * Math.pow(Math.abs(c), IO_E);
    if (c > 0) {
      const B = IO_BUST, ax = Math.abs(x);
      z += c * B.amp * Math.exp(-Math.pow((ax - B.x) / B.sx, 2) - Math.pow((y - B.y) / B.sy, 2));
      z -= c * B.dip * Math.exp(-Math.pow(x / B.dipx, 2) - Math.pow((y - B.dipy) / B.dipsy, 2));
    }
    return [x, y, z];
  }
  const IO_AY0 = 0.86;                               // the picture's lowest row; below the waistband it is plain black (the skirt hides it)
  const ioV = (y) => (y - IO_AY0) / (IO_TY1 - IO_AY0);
  (function buildTorso() {
    const rings = [], vs = [], NR = Q(72, 34), NU = Q(84, 40);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(IO_TY0, IO_TY1, i / NR), ring = [];
      for (let j = 0; j < NU; j++) ring.push(ioTorso(j / NU, y));
      rings.push(ring); vs.push(ioV(y));
    }
    addPart('torso', loft(rings, { v: vs, capA: true }), wTorso, { out: V3(0, 1.15, 0) });
  })();

  // ---------- arms: bare, from the shoulder to the wrist ----------
  // Her own outline, measured off D3 (her arm held straight out, seen from the front and from behind; tools/arm_d3.py, tools/arm_fit.py).
  // Each row: [distance down the arm from the shoulder joint, outer side, inner side, front, back], the last four as distances from the bone.
  // Outer and inner are what D3 shows (her arm held out is her hanging arm turned up: the top line is the outer side). Front and back are
  // not painted anywhere, so they follow a slim arm: biceps in front, triceps behind, the point of the elbow at the back, the crease in front,
  // and a wrist that is flat the way her palm faces.
  const ARM_X = [[0, 0.0440, 0.0430, 0.0400, 0.0410], [0.02, 0.0444, 0.0428, 0.0396, 0.0404], [0.04, 0.0434, 0.0424, 0.0388, 0.0396], [0.06, 0.0404, 0.0418, 0.0374, 0.0386], [0.08, 0.0360, 0.0410, 0.0362, 0.0376],
    [0.10, 0.0322, 0.0400, 0.0356, 0.0368], [0.12, 0.0300, 0.0388, 0.0353, 0.0361], [0.14, 0.0290, 0.0373, 0.0348, 0.0353], [0.16, 0.0286, 0.0356, 0.0339, 0.0344], [0.18, 0.0282, 0.0337, 0.0325, 0.0335],
    [0.20, 0.0279, 0.0315, 0.0305, 0.0328], [0.218, 0.0288, 0.0306, 0.0284, 0.0330], [0.232, 0.0310, 0.0316, 0.0270, 0.0338], [0.246, 0.0328, 0.0332, 0.0280, 0.0322], [0.262, 0.0337, 0.0338, 0.0293, 0.0302],
    [0.28, 0.0333, 0.0335, 0.0296, 0.0288], [0.30, 0.0316, 0.0327, 0.0290, 0.0277], [0.32, 0.0292, 0.0316, 0.0280, 0.0268], [0.34, 0.0266, 0.0298, 0.0270, 0.0260], [0.36, 0.0243, 0.0273, 0.0261, 0.0252],
    [0.38, 0.0225, 0.0249, 0.0258, 0.0245], [0.40, 0.0207, 0.0223, 0.0270, 0.0234], [0.41, 0.0200, 0.0212, 0.0284, 0.0224], [0.42, 0.0192, 0.0200, 0.0290, 0.0214], [0.436, 0.0170, 0.0176, 0.0297, 0.0196], [0.449, 0.0128, 0.0146, 0.0300, 0.0178], [0.458, 0.0110, 0.0134, 0.0290, 0.0168]];
  // Above the joint the arm ends in a ball that sits on the joint itself, so however the arm turns the ball stays where it is, inside her shoulder.
  // At the wrist the arm narrows to the hand's own wrist (the hand sits a little toward the thumb side) and ends hidden just inside the hand.
  const ARM_CAP = 0.047; for (const t of [0.22, 0.45, 0.66, 0.84, 0.955, 0.998]) { const f = Math.sqrt(1 - t * t), r = ARM_X.find((q) => q[0] === 0); ARM_X.unshift([-ARM_CAP * t, r[1] * f, r[2] * f, r[3] * f, r[4] * f]); }
  ARM_X.sort((p, q) => p[0] - q[0]);
  const ARM_K = [1, 2, 3, 4].map((c) => ARM_X.map((r) => [r[0], r[c]]));
  const ARM_S0 = ARM_X[0][0], ARM_S1 = 0.458;
  // one point of the arm's skin at rest: a is the angle round the arm (0 the outer side, a quarter turn the front, half the inner side)
  function armPt(S, sl, a) {
    const s = S === 'L' ? 1 : -1, d = armDir[S], sh = restPts['sh' + S], ca = Math.cos(a), sa = Math.sin(a);
    const ex = prof(ARM_K[ca >= 0 ? 0 : 1], sl, true), ez = prof(ARM_K[sa >= 0 ? 2 : 3], sl, true), n = 2 + 1.3 * sm(0.35, 0.42, sl);       // round above; toward the wrist it squares off, flat on the back and on the palm side
    const r = Math.pow(Math.pow(Math.abs(ca) / ex, n) + Math.pow(Math.abs(sa) / ez, n), -1 / n);
    const ox = s * Math.cos(A_POSE), oy = Math.sin(A_POSE);                 // the outer side: square to the arm, away from her body
    return [sh.x + d.x * sl + ox * r * ca, sh.y + d.y * sl + oy * r * ca, sh.z + r * sa];
  }
  // the point of the elbow is the forearm's bone, so at the back the skin goes over to the forearm a little above the joint; in front it folds at the crease
  function wArm(S, sLen, a) {
    if (sLen < 0.02) return [BI['uarm' + S], 1];       // the arm turns in her shoulder like a ball in a socket: all of it moves as one piece about the joint
    if (sLen < L_UARM + 0.07) { const bk = a == null ? 0 : Math.max(0, -Math.sin(a)), c = L_UARM - 0.016 * bk, h = 0.046 - 0.010 * bk, u = sm(c - h, c + h, sLen); return [BI['uarm' + S], 1 - u, BI['farm' + S], u]; }
    const u = sm(L_UARM + L_FARM - 0.02, L_UARM + L_FARM + 0.012, sLen); return [BI['farm' + S], 1 - u, BI['hand' + S], u];
  }
  for (const [S, s] of SIDES) {
    const NS = Q(60, 24), NU = Q(32, 14), rings = [], ss = [], vs = [];
    for (let i = 0; i <= NS; i++) {
      const t = i < 12 ? 0.5 * (1 - Math.cos(PI * i / 24)) * 2 * 0.093 : 0.093 + 0.907 * (i - 12) / (NS - 12), sl = ARM_S0 + (ARM_S1 - ARM_S0) * t, ring = [];   // the first rings are close together: they round the ball of the shoulder
      for (let j = 0; j < NU; j++) ring.push(armPt(S, sl, (j / NU) * TAU));
      rings.push(ring); ss.push(sl); vs.push((sl - ARM_S0) / (ARM_S1 - ARM_S0));
    }
    const part = loft(rings, { capA: true, v: vs }), cols = NU + 1;
    addPart(BAKED && BAKED.arms ? 'arm' : 'skin', part, (x, y, z, i) => i < ss.length * cols ? wArm(S, ss[Math.floor(i / cols)], ((i % cols) / NU) * TAU) : wArm(S, ss[0]), { out: centroidOf(rings) });
  }

  // ---------- legs: bare skin from the hip down into the boots ----------
  function wLeg(S, y) {
    if (y > 0.88) { const u = sm(0.88, 0.975, y); return [BI['thigh' + S], 1 - u, BI.hips, u]; }
    const u = sm(IO_KNEE_Y - 0.05, IO_KNEE_Y + 0.05, y); return [BI['shin' + S], 1 - u, BI['thigh' + S], u];
  }
  const IO_LEG_UP = IO_LEG.slice().reverse(), IO_SKIRT_UP = IO_SKIRT.slice().reverse();      // spline() reads its keys from low to high
  const legRing = (s, y, k, n) => { const [rx, rzF, rzB, cx, cz] = spline(IO_LEG_UP, y), ring = []; for (let j = 0; j < n; j++) { const a = PI + (j / n) * TAU, c = Math.cos(a); ring.push([s * cx + rx * k * Math.sin(a), y, cz + (c >= 0 ? rzF : rzB) * k * c]); } return ring; };
  for (const [S, s] of SIDES) {
    const rings = [], NR = Q(56, 26), NU = Q(40, 20);
    for (let i = 0; i <= NR; i++) { const y = lerp(0.935, 0.30, i / NR); rings.push(legRing(s, y, 1, NU)); }
    // Above mid-thigh she wears plain black shorts under the skirt (my choice, November 13: the top of a moving thigh can press through
    // the skirt's lace, and black on black does not show; the slit never opens that high when she stands).
    const cut = rings.findIndex((r) => r[0][1] < 0.845);
    addPart('cloth', loft(rings.slice(0, cut + 1), { uS: 1, vS: 1 }), (x, y) => wLeg(S, y), { out: V3(s * 0.086, 0.9, 0) });
    addPart('skin', loft(rings.slice(cut), { uS: 1, vS: 1 }), (x, y) => wLeg(S, y), { out: V3(s * 0.086, 0.6, 0) });
  }

  // ---------- the skirt: eight tiers of black lace over sheer black tulle, open in a slit over her left leg ----------
  // Stage one: it is stiff and turns with her hips. It becomes hanging cloth when the cloth is built.
  // A point of the skirt: a is the angle round her (0 at the front, a quarter turn at her left), k scales it out from its middle.
  const skirtPt = (y, a, k, dr) => { const [rx, rz, cz] = spline(IO_SKIRT_UP, cl(y, 0.15, 1.06)); return [(rx * k + (dr || 0)) * Math.sin(a), y, cz + (rz * k + (dr || 0)) * Math.cos(a)]; };
  const slitW = (y) => (y >= IO_SLIT_TOP ? 0 : prof(IO_SLIT_W, y, true));
  // The skirt hangs from twelve chains round her hips (November 13: "the fabric that's on her" moves with her). Above the first joint it is fixed to her hips.
  const SK_N = 12, SK_Y = [1.02, 0.90, 0.78, 0.66, 0.54, 0.42, 0.30, 0.18], skChains = [];
  for (let c = 0; c < SK_N; c++) { const a = (c / SK_N) * TAU; skChains.push(addChain('skirt', 'sk' + c, 'hips', SK_Y.map((y) => V3(...skirtPt(y, a, 0.96, 0))), { a })); }
  function wSkirt(x, y, z) {
    if (y >= SK_Y[0]) return [BI.hips, 1];
    const [rx, rz, cz] = spline(IO_SKIRT_UP, cl(y, 0.15, 1.06)); let a = Math.atan2(x / rx, (z - cz) / rz); if (a < 0) a += TAU;
    const f = (a / TAU) * SK_N, c0 = Math.floor(f) % SK_N;
    return mixW(chainW(skChains[c0], y), chainW(skChains[(c0 + 1) % SK_N], y), f - Math.floor(f));
  }
  // hems come down in points: a ragged zigzag, different on every tier
  const hemDrop = (a, ph, n) => { const t = ((a * n / TAU + ph) % 1 + 1) % 1, tri = 1 - Math.abs(t * 2 - 1); return 0.040 * tri * tri * (3 - 2 * tri) + 0.012 * Math.sin(a * 3 + ph * 9); };
  function skirtLayer(key, yTop, yHem, k0, k1, ph, np, rag, uRep) {
    const NU = Q(150, 72), NV = Q(16, 8), rings = [], vs = [];
    for (let i = 0; i <= NV; i++) {
      const t = i / NV, ring = [];
      for (let j = 0; j < NU; j++) {
        const f = j / (NU - 1), hem = yHem - rag * hemDrop(f * TAU, ph, np), y = lerp(yTop, hem, t), w = slitW(y);
        const a = IO_SLIT_MID + w / 2 + (TAU - w) * f;                                        // the ring runs from one edge of the slit round her back to the other
        const fold = 0.007 * Math.sin(a * 13 + ph * 20) * t + 0.003 * Math.sin(a * 29 + ph * 7) * t * t;     // soft upright folds that deepen toward the hem
        ring.push(skirtPt(y, a, lerp(k0, k1, t), fold + 0.006 * t * t));
      }
      rings.push(ring); vs.push(t);
    }
    addPart(key, loft(rings, { open: true, v: vs, uS: uRep }), wSkirt, { out: V3(0, (yTop + yHem) / 2, IO_SKIRT_CZ) });
  }
  const TIER_HEM = [0.945, 0.830, 0.715, 0.600, 0.485, 0.370, 0.255, 0.165];
  // a plain black lining, so nothing shows between the tiers; under it the tulle, which shows below the last tier as a soft ragged edge
  skirtLayer('band', 0.930, 0.300, 0.890, 0.900, 0.5, 9, 0, 4);
  skirtLayer('tulle', 0.900, 0.150, 0.910, 0.945, 0.37, 11, 1.2, 6);
  for (let i = 0; i < TIER_HEM.length; i++) {
    const top = i === 0 ? 1.058 : TIER_HEM[i - 1] + 0.070;
    skirtLayer('skirt', top, TIER_HEM[i], i === 0 ? 1.0 : 0.950, i === 0 ? 1.0 : 0.985, 0.13 + i * 0.29, 6 + (i * 3) % 4, 1, 5);
  }
  // the waistband
  (function waistband() {
    const rings = []; for (const [y, k, d] of [[1.040, 1.0, 0.004], [1.050, 1.0, 0.006], [1.064, 1.0, 0.006], [1.070, 1.0, 0.003]]) { const ring = [], NU = Q(96, 48); for (let j = 0; j < NU; j++) ring.push(skirtPt(Math.min(y, 1.06), (j / NU) * TAU, k, d + (y > 1.06 ? -0.004 : 0))); for (const p of ring) p[1] = y; rings.push(ring); }
    addPart('band', loft(rings, { uS: 8, vS: 0.2 }), wSkirt, { out: V3(0, 1.055, IO_SKIRT_CZ) });
  })();
