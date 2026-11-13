
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

  // ---------- arms: bare, from the shoulder to the wrist (slimmer than the Ranger's above the elbow, the same at the wrist) ----------
  const ARM_R = [[-0.054, 0.003], [-0.050, 0.014], [-0.042, 0.026], [-0.030, 0.0345], [-0.015, 0.0405], [0, 0.0430], [0.04, 0.0430], [0.10, 0.0370], [0.165, 0.0335], [0.22, 0.0365], [0.275, 0.0375], [0.33, 0.0320], [0.39, 0.0262], [0.43, 0.0245], [0.449, 0.0240]];
  function wArm(S, sLen) {
    if (sLen < 0.05) { const u = sm(-0.045, 0.05, sLen); return [BI['clav' + S], (1 - u) * 0.6, BI.spine3, (1 - u) * 0.4, BI['uarm' + S], u]; }
    if (sLen < L_UARM + 0.05) { const u = sm(L_UARM - 0.05, L_UARM + 0.05, sLen); return [BI['uarm' + S], 1 - u, BI['farm' + S], u]; }
    const u = sm(L_UARM + L_FARM - 0.02, L_UARM + L_FARM + 0.012, sLen); return [BI['farm' + S], 1 - u, BI['hand' + S], u];
  }
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], NS = Q(44, 20), NU = Q(28, 14);
    const pts = [], rad = [], ss = [];
    for (let i = 0; i <= NS; i++) { const sl = -0.054 + (L_UARM + L_FARM + 0.059) * (i < 10 ? 0.07 * (i / 10) : 0.07 + 0.93 * (i - 10) / (NS - 10)); pts.push(sh.clone().addScaledVector(d, sl)); const r = prof(ARM_R, sl, true); rad.push([r, r * (sl > 0.3 ? 0.90 : 1)]); ss.push(sl); }   // the forearm is a little flat toward the wrist
    const rings = tubeRings(pts, rad, NU, V3(0, 0, 1)), part = loft(rings, { capA: true, vS: 3 }), cols = NU + 1;      // the first rings are close together: they round the shoulder
    addPart('skin', part, (x, y, z, i) => wArm(S, i < ss.length * cols ? ss[Math.floor(i / cols)] : ss[0]), { out: centroidOf(rings) });
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
    addPart('skin', loft(rings, { uS: 1, vS: 1 }), (x, y) => wLeg(S, y), { out: V3(s * 0.086, 0.6, 0) });
  }

  // ---------- the skirt: eight tiers of black lace over sheer black tulle, open in a slit over her left leg ----------
  // Stage one: it is stiff and turns with her hips. It becomes hanging cloth when the cloth is built.
  // A point of the skirt: a is the angle round her (0 at the front, a quarter turn at her left), k scales it out from its middle.
  const skirtPt = (y, a, k, dr) => { const [rx, rz, cz] = spline(IO_SKIRT_UP, cl(y, 0.15, 1.06)); return [(rx * k + (dr || 0)) * Math.sin(a), y, cz + (rz * k + (dr || 0)) * Math.cos(a)]; };
  const slitW = (y) => (y >= IO_SLIT_TOP ? 0 : prof(IO_SLIT_W, y, true));
  const wSkirt = () => [BI.hips, 1];
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
