
  // ---------- the Ranger's body and base outfit (stage one): corset, lace top, denim shorts, lace leggings ----------
  // Shapes come from the tables in R05_tables.js. The torso wears one picture that wraps right round her (u runs round the body
  // from the middle of her back, v is height), baked from four paintings: B1 front and back, B2 both sides (bake_ranger.py).
  const SPINE_W = [['hips', 0.885], ['spine1', 1.03], ['spine2', 1.14], ['spine3', 1.255]];
  function wSpine(y) {
    if (y <= SPINE_W[0][1]) return [BI.hips, 1];
    for (let i = 1; i < SPINE_W.length; i++) if (y < SPINE_W[i][1]) {
      const u = sm(SPINE_W[i - 1][1], SPINE_W[i][1], y);
      return [BI[SPINE_W[i - 1][0]], 1 - u, BI[SPINE_W[i][0]], u];
    }
    return [BI.spine3, 1];
  }
  const SOFT = [];       // soft things that hang from a bone and swing: sleeves, headband tails, loose locks
  function wTorso(x, y, z) {
    const w = wSpine(y), ax = Math.abs(x), S = x < 0 ? 'R' : 'L';
    const k = 0.75 * sm(0.085, 0.15, ax) * sm(1.19, 1.27, y);       // the shoulder girdle follows the collarbone
    if (k > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - k; w.push(BI['clav' + S], k); }
    if (y > 1.33) { const n = sm(1.33, 1.40, y) * (1 - sm(0.05, 0.1, ax)); if (n > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - n; w.push(BI.neck, n); } }
    // Under each shoulder joint the skin goes a little way with the upper arm, so her armpit opens when she raises her arm.
    if (z !== undefined && ax > 0.085 && y > 1.20 && w.length <= 6) { const d = Math.hypot(ax - R_SHOULDER[0], y - R_SHOULDER[1], z - R_SHOULDER[2]), ku = 0.30 * sm(0.10, 0.04, d) * sm(0.085, 0.125, ax) * sm(R_SHOULDER[1] + 0.005, R_SHOULDER[1] - 0.03, y);       // only under the joint: the top of her shoulder stays, her armpit opens
      if (ku > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - ku; w.push(BI['uarm' + S], ku); } }
    return w;
  }

  // the torso surface: u 0..1 round the body (0 the middle of her back, 0.25 her right side, 0.5 the front), y height
  const R_E = 2 / R_TPW;
  function rTorso(u, y) {
    const [rx, zf, zb] = spline(R_TORSO, cl(y, R_TORSO[0][0], R_TY1)), cz = (zf + zb) / 2, rf = zf - cz, rb = cz - zb;
    const a = PI + u * TAU, s = Math.sin(a), c = Math.cos(a);
    const x = rx * Math.sign(s) * Math.pow(Math.abs(s), R_E); let z = cz + (c >= 0 ? rf : rb) * Math.sign(c) * Math.pow(Math.abs(c), R_E);
    if (c > 0) {
      const B = R_BUST, ax = Math.abs(x);
      z += c * B.amp * Math.exp(-Math.pow((ax - B.x) / B.sx, 2) - Math.pow((y - B.y) / B.sy, 2));
      z -= c * B.dip * Math.exp(-Math.pow(x / B.dipx, 2) - Math.pow((y - B.dipy) / B.dipsy, 2));
    }
    return [x, y, z];
  }
  // where a point near the hips sits on that picture (for the legs of the shorts, which carry on the same cloth)
  const R_AY0 = 0.715;                               // the picture runs a little below the torso itself, down to the hems of the shorts
  const rV = (y) => (y - R_AY0) / (R_TY1 - R_AY0);
  function rTorsoU(x, y, z) {
    const [rx, zf, zb] = spline(R_TORSO, cl(y, R_TORSO[0][0], R_TY1)), cz = (zf + zb) / 2;
    const q = cl(x / rx, -1, 1), s = Math.sign(q) * Math.pow(Math.abs(q), 1 / R_E), a0 = Math.asin(cl(s, -1, 1));   // sin(a) = s
    const a = z >= cz ? a0 : PI - a0;                                                                              // front: cos > 0; back: cos < 0
    let u = (a - PI) / TAU; u -= Math.floor(u); return u;
  }
  (function buildTorso() {
    const rings = [], vs = [], NR = Q(72, 34), NU = Q(84, 40);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(R_TY0, R_TY1, i / NR), ring = [];
      for (let j = 0; j < NU; j++) ring.push(rTorso(j / NU, y));
      rings.push(ring); vs.push(rV(y));
    }
    addPart('torso', loft(rings, { v: vs, capA: true }), wTorso, { out: V3(0, 1.1, 0) });
  })();

  // ---------- arms: bare, from the shoulder to the wrist ----------
  const ARM_R = [[-0.054, 0.003], [-0.050, 0.016], [-0.042, 0.030], [-0.030, 0.0405], [-0.015, 0.0480], [0, 0.0515], [0.04, 0.054], [0.11, 0.050], [0.19, 0.045], [0.245, 0.042], [0.30, 0.040], [0.39, 0.0318], [0.425, 0.0264], [0.447, 0.0235], [0.458, 0.0246], [0.470, 0.0262], [0.482, 0.0285], [0.493, 0.0290]];
  // The wrist, as her hand paintings D1 and D2 show it: 4.7 cm across (0.86 of the width across her knuckles; A1 gives 4.5 cm), in line with
  // the middle of her hand, which sits 6 mm to the thumb side of the wrist joint, so the forearm drifts that way from the elbow down (ARM_Z).
  // It covers the stub of the hand, meets the heel of the hand at the joint and runs on inside it. ARM_T is how thick the arm is as a share of
  // its width; ARM_PALM moves the end toward the palm. Both were set from slices through the hand (tools/wrist_sections.py), so the end
  // stays under the skin of the palm and of the back of the hand.
  const ARM_T = [[0.28, 1], [0.33, 0.92], [0.39, 0.89], [0.425, 0.80], [0.447, 0.740], [0.458, 0.671], [0.464, 0.610], [0.470, 0.519], [0.482, 0.416], [0.493, 0.350]];
  const ARM_PALM = [[0.43, 0], [0.447, 0.0002], [0.458, 0.0003], [0.464, 0.0003], [0.470, 0.0004], [0.482, 0.00065], [0.493, 0.00035]], ARM_Z = (sl) => 0.0062 * sm(0.25, 0.45, sl);
  function wArm(S, sLen) {
    if (sLen < -0.02) { const u = sm(-0.06, -0.02, sLen); return [BI['clav' + S], (1 - u) * 0.6, BI.spine3, (1 - u) * 0.4, BI['uarm' + S], u]; }       // The arm turns in her shoulder like a ball in a socket: all of it that shows moves as one piece, so nothing pinches at the joint. Only its hidden tip inside her body stays behind.
    if (sLen < L_UARM + 0.05) { const u = sm(L_UARM - 0.05, L_UARM + 0.05, sLen); return [BI['uarm' + S], 1 - u, BI['farm' + S], u]; }
    const u = sm(L_UARM + L_FARM - 0.02, L_UARM + L_FARM + 0.012, sLen); return [BI['farm' + S], 1 - u, BI['hand' + S], u];
  }
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], NU = Q(32, 16);
    const pts = [], rad = [], ss = [], sls = [], S1 = -0.054 + 0.547 * 0.07, NM = Q(30, 14), NW = Q(18, 9);
    for (let i = 0; i <= 10; i++) sls.push(-0.054 + 0.547 * 0.07 * (i / 10));           // the first rings are close together: they round the shoulder
    for (let i = 1; i <= NM; i++) sls.push(S1 + (0.43 - S1) * i / NM);
    for (let i = 1; i <= NW; i++) sls.push(0.43 + 0.063 * i / NW);                        // and the last are close together: they shape the wrist
    for (const sl of sls) { const pm = sl > 0.43 ? spline(ARM_PALM, Math.min(sl, 0.493)) : 0; pts.push(sh.clone().addScaledVector(d, sl).add(V3(s * d.y * pm, -s * d.x * pm, ARM_Z(sl)))); const r = prof(ARM_R, sl, true); rad.push([r, r * spline(ARM_T, cl(sl, 0.28, 0.493))]); ss.push(sl); }
    // Her arm wears its own painting (bake_hands_r.py), unrolled: once round the arm across the picture, with the back of the forearm in the
    // middle and the thumb side at three quarters; shoulder at the top, wrist at the bottom, the lower forearm on 60% of the rows.
    const vs = ss.map((sl) => sl <= 0.30 ? 1 - 0.4 * (sl + 0.054) / 0.354 : 0.6 * (1 - (sl - 0.30) / 0.193));
    const rings = tubeRings(pts, rad, NU, V3(0, 0, 1)), part = loft(rings, { capA: true, capB: true, u0: 0.75, uS: s < 0 ? -1 : 1, v: vs }), cols = NU + 1;
    const armKey = BAKED && BAKED['arm' + S] ? 'arm' + S : 'skin', info = addPart(armKey, part, (x, y, z, i) => wArm(S, i < ss.length * cols ? ss[Math.floor(i / cols)] : i === ss.length * cols ? ss[0] : ss[ss.length - 1]), { out: centroidOf(rings) });
    // where the arm leaves the shoulder it takes the shoulder's surface direction, so the light does not break along the join
    const AB = buckets[armKey], TB = buckets.torso, near = [];
    for (let k = 0; k < TB.n; k++) if (s * TB.pos[k * 3] > 0.07 && TB.pos[k * 3 + 1] > 1.2) near.push(k);
    for (let i = info.start; i < info.start + info.count; i++) {
      const ring = Math.floor((i - info.start) / cols); if (ring >= ss.length || ss[ring] > 0.075) continue;
      const px = AB.pos[i * 3], py = AB.pos[i * 3 + 1], pz = AB.pos[i * 3 + 2]; let best = -1, bd = 1e9;
      for (const k of near) { const dq = Math.hypot(TB.pos[k * 3] - px, TB.pos[k * 3 + 1] - py, TB.pos[k * 3 + 2] - pz); if (dq < bd) { bd = dq; best = k; } }
      const w = sm(0.028, 0.008, bd); if (best < 0 || w <= 0) continue;
      const nx = lerp(AB.nor[i * 3], TB.nor[best * 3], w), ny = lerp(AB.nor[i * 3 + 1], TB.nor[best * 3 + 1], w), nz = lerp(AB.nor[i * 3 + 2], TB.nor[best * 3 + 2], w), l = Math.hypot(nx, ny, nz) || 1;
      AB.nor[i * 3] = nx / l; AB.nor[i * 3 + 1] = ny / l; AB.nor[i * 3 + 2] = nz / l;
    }
  }

  // ---------- the lace sleeves: a wide bell of black lace from a band round the upper arm to ragged points near the elbow ----------
  // Stage one: they are part of her skin (they turn with the upper arm). They become hanging cloth when the cloth is built.
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], NU = Q(56, 28), NV = Q(18, 9), rings = [], vs = [];
    const out = V3(s, 0, 0), fwd = V3(0, 0, 1), down = V3(0, -1, 0);
    for (let i = 0; i <= NV; i++) {
      const t = i / NV, ring = [];
      for (let j = 0; j < NU; j++) {
        const a = (j / NU) * TAU, co = Math.cos(a), si = Math.sin(a);                 // co: outward from her body, si: forward
        const hem = 0.188 + 0.020 * Math.cos(a * 7) * Math.cos(a * 3 + 1) + 0.012 * co;   // ragged points; a little longer on the outside
        const len = 0.052 + t * hem, arm = prof(ARM_R, Math.min(len, 0.3), true);
        const flare = arm + 0.004 + (0.034 + 0.014 * co) * Math.pow(t, 0.8) + 0.005 * Math.sin(a * 9 + t * 7) * t;   // soft folds
        // the sleeve hangs more nearly straight down than the arm does
        const c = sh.clone().addScaledVector(d, 0.052).addScaledVector(d, t * hem * 0.62).addScaledVector(down, t * hem * 0.38);
        const p = c.addScaledVector(out, flare * co).addScaledVector(fwd, flare * si * 0.92);
        ring.push([p.x, p.y, p.z]);
      }
      rings.push(ring); vs.push(1 - t);
    }
    // The sleeve is soft: a bone at its band lets the cloth below hang and swing (SOFT, moved in R99_static.js). The top stays on the band.
    { const bc = sh.clone().addScaledVector(d, 0.052), ax = d.clone().multiplyScalar(0.62).addScaledVector(down, 0.38).normalize(); addBone('slv' + S, 'uarm' + S, bc.x, bc.y, bc.z);
      SOFT.push({ bone: 'slv' + S, parent: 'uarm' + S, root: bc.clone(), dir: ax.clone(), L: 0.17, grav: 0.45, maxA: 0.30, w2: 90, c: 6, flex: 'farm' + S });
      addPart('lacesl', loft(rings, { v: vs, uS: 4 }), (x, y, z) => { const t = cl(((x - bc.x) * ax.x + (y - bc.y) * ax.y + (z - bc.z) * ax.z) / 0.19, 0, 1), wb = sm(0.05, 0.7, t); return [BI['slv' + S], wb, BI['uarm' + S], (1 - wb) * 0.86, BI['clav' + S], (1 - wb) * 0.14]; }, { out: centroidOf(rings) }); }
    // the band it hangs from
    const bp = [], br = []; for (let k = 0; k <= 2; k++) { const sl = 0.046 + k * 0.006; bp.push(sh.clone().addScaledVector(d, sl)); br.push(prof(ARM_R, sl, true) + 0.0045 - Math.abs(k - 1) * 0.0015); }
    const band = tubeRings(bp, br, Q(24, 12), V3(0, 0, 1));
    addPart('laceband', loft(band, { uS: 6, vS: 0.25 }), () => [BI['uarm' + S], 0.86, BI['clav' + S], 0.14], { out: centroidOf(band) });
  }

  // ---------- legs in sheer black lace ----------
  function wLeg(S, y) {
    if (y > 0.78) { const u = sm(0.78, 0.87, y); return [BI['thigh' + S], 1 - u, BI.hips, u]; }
    const u = sm(R_KNEE_Y - 0.05, R_KNEE_Y + 0.05, y); return [BI['shin' + S], 1 - u, BI['thigh' + S], u];
  }
  const legRing = (s, y, k, n) => { const [rx, rzF, rzB, cx, cz] = prof(R_LEG, y, true), ring = []; for (let j = 0; j < n; j++) { const a = PI + (j / n) * TAU, c = Math.cos(a); ring.push([s * cx + rx * k * Math.sin(a), y, cz + (c >= 0 ? rzF : rzB) * k * c]); } return ring; };
  for (const [S, s] of SIDES) {
    const rings = [], vs = [], NR = Q(46, 22), NU = Q(36, 18);
    for (let i = 0; i <= NR; i++) { const y = lerp(0.800, 0.24, i / NR); rings.push(legRing(s, y, 1, NU)); vs.push((0.875 - y) / 0.30); }
    addPart('leggings', loft(rings, { v: vs, uS: 2 }), (x, y) => wLeg(S, y), { out: V3(s * 0.088, 0.55, 0) });
    // the leg of the shorts: the same black denim as the seat, carried down to a frayed hem
    const cr = [], NC = Q(12, 6), hemAt = (j) => lerp(0.750, 0.774, sm(-0.6, 0.9, s * Math.sin(PI + (j / NU) * TAU)));     // higher at the outside of the leg, as painted
    const cuffRing = (t, k, dy) => { const ring = []; for (let j = 0; j < NU; j++) { const y = lerp(0.845, hemAt(j), t) + (dy || 0), p = legRing(s, y, k, NU)[j]; ring.push(p); } return ring; };
    for (let i = 0; i <= NC; i++) { const t = i / NC; cr.push(cuffRing(t, lerp(1.012, 1.045, sm(0, 0.6, t)) + 0.012 * sm(0.75, 1, t))); }
    cr.push(cuffRing(1, 1.035, -0.001), cuffRing(1, 1.012, 0.004));                                   // the hem turns in
    const cuff = loft(cr);
    for (let i = 0; i < cuff.pos.length / 3; i++) { const x = cuff.pos[i * 3], y = cuff.pos[i * 3 + 1], z = cuff.pos[i * 3 + 2]; cuff.uv[i * 2] = rTorsoU(x, Math.max(y, R_TORSO[0][0]), z); cuff.uv[i * 2 + 1] = rV(y); }
    // the inner face of each leg has no place of its own on that picture (its two edges land at the front and back seams, half the picture apart):
    // those triangles get their own corners and wear the plain denim at her side seam instead
    { const idx = [], uFix = s < 0 ? 0.285 : 0.715;
      for (let i = 0; i < cuff.idx.length; i += 3) {
        const t = [cuff.idx[i], cuff.idx[i + 1], cuff.idx[i + 2]], us = t.map((k) => cuff.uv[k * 2]);
        if (Math.max(...us) - Math.min(...us) < 0.22) { idx.push(t[0], t[1], t[2]); continue; }
        for (const k of t) { const n = cuff.pos.length / 3; cuff.pos.push(cuff.pos[k * 3], cuff.pos[k * 3 + 1], cuff.pos[k * 3 + 2]); cuff.uv.push(uFix, cuff.uv[k * 2 + 1]); idx.push(n); }
      }
      cuff.idx = idx; }
    addPart('torso', cuff, (x, y) => wLeg(S, y), { out: V3(s * 0.09, 0.79, 0) });
  }
