
  // ---------- hair, headband and gem ----------
  // Her hair is one shell over the skull, swelling into the bun behind the crown. It wears four paintings at once (side, front,
  // back, top), mixed by which way the hair faces (the hair material). The headband is a strip wrapped round the hair in a tilted
  // plane: high on the forehead, down behind the ears to the knot at the nape (heights and slope read off the profile in C3).
  const phOfY = (Y) => Math.acos(cl((Y - HC.y) / (Y >= HC.y ? HR.yT : HR.yB), -1, 1));
  const HAIR_EDGE = [[0, 1.591], [0.5, 1.587], [0.95, 1.566], [1.25, 1.534], [1.57, 1.528], [1.92, 1.505], [2.36, 1.470], [PI, 1.452]];     // [angle round from the front, height of the hairline]
  const BUN_D = V3(0, 0.292, -0.956), BUN = { amp: 0.052, sig: 33 * DEG };       // Chris, November 13: the bun on the back of her head, not up high (it pointed 35 degrees up; now 17)
  const BAND = { yF: 1.589, zF: 0.080, slope: 0.514, w: 0.032 }, bandY = (z) => BAND.yF - (BAND.zF - z) * BAND.slope;
  // Chris, November 13: "her hair is too big above the hairband": the swell over her forehead is lowered so the hair climbs from the band to the
  // crown on the slope of C3's side view (measured with tools/cmp_head.py: it stood 25 to 46 mm too high just behind the band). Nothing else moved.
  const FRONT_LOW = 0.70;
  function hairPt(a, ph, u, phB, add, plain) {      // u: 0 at the crown .. 1 at the hairline; phB: where the band presses the hair; add: extra metres out
    const rise = phB == null ? 1 : sm(phB - 0.02, phB - 0.46, ph);       // the band holds the hair flat; behind it the hair lifts as it is swept back to the bun
    let g = (0.0070 + 0.011 * sm(0.1, -0.6, Math.cos(a)) * sm(1.88, 2.08, ph)) * (phB == null ? 1 : 1 - 0.45 * Math.exp(-Math.pow((ph - phB) / 0.16, 2))) + (0.011 * sm(1.50, 0.50, ph) * (0.55 + 0.45 * Math.cos(a) * Math.cos(a)) * (1 - FRONT_LOW * sm(-0.05, 0.62, Math.cos(a)) * sm(0.15, 0.55, ph)) + 0.009 * sm(0.9, 1.5, ph) * sm(2.1, 1.5, ph) + 0.016 * sm(1.15, 1.6, ph) * sm(2.25, 1.75, ph) * sm(0.2, -0.5, Math.cos(a))) * rise;      // rounder on top, fuller at the back of the head (J3's side view)
    g *= 0.30 + 0.70 * sm(1.0, 0.72, u);
    const p = headPoint(a, ph, g + (add || 0)), dx = p[0] - HC.x, dy = p[1] - HC.y, dz = p[2] - HC.z, L = Math.hypot(dx, dy, dz) || 1;
    const Lv = Math.hypot(dy, dz) || 1, av = Math.acos(cl((dy * BUN_D.y + dz * BUN_D.z) / Lv, -1, 1)), al = Math.asin(cl(Math.abs(dx) / L, 0, 1)), ang = Math.hypot(av, 1.32 * al);      // the bun is narrower from side to side than it is tall
    let b = BUN.amp * Math.exp(-Math.pow(ang / BUN.sig, 3));
    if (phB != null) b *= sm(phB - 0.03, phB - 0.30, ph);       // the bun stops above the band, so the band is never buried
    if (!plain) {                                   // curls on the bun, combed ridges elsewhere
      const k = Math.exp(-Math.pow(ang / (BUN.sig * 1.15), 3));
      b += k * 0.0032 * (fbm(Math.sin(a) * 4 + 20, ph * 7 + Math.cos(a) * 4) - 0.47) * 2 + (1 - k) * 0.0008 * Math.sin(a * 46 + 5 * fbm(Math.sin(a) * 3 + 7, ph * 4)) * sm(1.0, 0.8, u);
    }
    const s = 1 + b / L;
    return [HC.x + dx * s, HC.y + dy * s, HC.z + dz * s];
  }
  // The band lies on her skin where there is no hair under it (her forehead, below the hairline) and on her hair everywhere else,
  // pressing it flat. add: metres out from that surface.
  const phEdgeOf = (a) => phOfY(spline(HAIR_EDGE, Math.abs(a)));
  function bandPt(a, ph, add) { const e = phEdgeOf(a), cover = sm(e + 0.015, e - 0.05, ph); return headPoint(a, ph, 0.0042 * cover + add + (add > 0.001 ? 0.0012 * cover : 0)); }
  function bandPh(a) { let ph = 1.4; for (let k = 0; k < 12; k++) { const p = bandPt(a, ph, 0.002); ph = lerp(ph, phOfY(bandY(p[2])), 0.8); } return ph; }
  (function buildHair() {
    const NU = Q(168, 64), NV = Q(76, 28), rings = [], phE = [], phB = [], aOf = (j) => -PI + (j / NU) * TAU;
    for (let j = 0; j < NU; j++) { const a = aOf(j); phE.push(phOfY(spline(HAIR_EDGE, Math.abs(a)))); phB.push(bandPh(a)); }
    for (let i = 0; i <= NV; i++) { const u = i / NV, ring = []; for (let j = 0; j < NU; j++) ring.push(hairPt(aOf(j), lerp(0.03, phE[j], Math.pow(u, 0.92)), u, phB[j])); rings.push(ring); }
    rings.push(rings[NV].map((p, j) => headPoint(aOf(j), phE[j] + 0.012, 0.0004)));          // the rim closes onto the skin
    addPart('hair', loft(rings, { capA: true }), wHead, { out: HC });
  })();
  const blob = (key, O, R, U, N, c, rad, nu, nv) => {       // a small rounded solid in a local frame: across R, up U, out N
    const rings = [];
    for (let i = 0; i <= nv; i++) {
      const ph = lerp(0.12, PI - 0.12, i / nv), ring = [];
      for (let j = 0; j < nu; j++) { const th = (j / nu) * TAU, r = c[0] + rad[0] * Math.sin(ph) * Math.cos(th), u = c[1] + rad[1] * Math.cos(ph), n = c[2] + rad[2] * Math.sin(ph) * Math.sin(th); ring.push([O[0] + R.x * r + U.x * u + N.x * n, O[1] + R.y * r + U.y * u + N.y * n, O[2] + R.z * r + U.z * u + N.z * n]); }
      rings.push(ring);
    }
    return addPart(key, loft(rings, { capA: true, capB: true }), wHead, { out: V3(O[0] + R.x * c[0] + U.x * c[1] + N.x * c[2], O[1] + R.y * c[0] + U.y * c[1] + N.y * c[2], O[2] + R.z * c[0] + U.z * c[1] + N.z * c[2]) });
  };
  (function buildBand() {
    const NU = Q(132, 52), rings = [], K = [-1, -0.55, 0, 0.55, 1], cs = []; let s = 0, prev = null, knot = null;
    for (let j = 0; j <= NU; j++) {                 // from the knot at the nape, round her right side to the forehead and back by her left
      const a = -PI + (j / NU) * TAU, pb = bandPh(a), pc = bandPt(a, pb, 0.003);
      // the band is a strip of even width: how far to step up and down the head for half its width is worked out on each side separately
      const step = (sgn) => { let lo = 0, hi = 0.6; for (let it = 0; it < 18; it++) { const m = (lo + hi) / 2, q = bandPt(a, pb + sgn * m, 0); if (Math.hypot(q[0] - pc0[0], q[1] - pc0[1], q[2] - pc0[2]) < BAND.w / 2) lo = m; else hi = m; } return (lo + hi) / 2; };
      const pc0 = bandPt(a, pb, 0), dUp = step(-1), dDn = step(1), ring = [];
      for (const k of K) ring.push(bandPt(a, pb + k * (k < 0 ? dUp : dDn), 0.0018 + 0.0012 * (1 - k * k)));
      for (const k of [0.8, 0, -0.8]) ring.push(bandPt(a, pb + k * (k < 0 ? dUp : dDn), 0.0003));
      rings.push(ring);
      if (prev) s += Math.hypot(pc[0] - prev[0], pc[1] - prev[1], pc[2] - prev[2]);
      prev = pc; cs.push(s); if (j === 0) knot = pc;
    }
    const part = loft(rings), cols = 9;
    for (let i = 0; i <= NU; i++) for (let j = 0; j < cols; j++) {
      const q = i * cols + j, jj = j % 8, v = jj < 5 ? (K[jj] + 1) / 2 : jj === 5 ? 0.95 : jj === 6 ? 0.5 : 0.05;
      part.uv[q * 2] = 0.5 + (cs[i] - s / 2) / 0.45; part.uv[q * 2 + 1] = 1 - v;
    }
    addPart('band', part, wHead, { out: HC });
    // the knot, and its two tails hanging down the back of her neck (stiff until the cloth stage)
    const R = V3(1, 0, 0), U = V3(0, 1, 0), N = V3(0, 0, -1), O = [knot[0], knot[1], knot[2] - 0.006];
    for (const [c, rad] of [[[0, 0, 0], [0.0125, 0.0105, 0.0085]], [[-0.012, 0.002, -0.002], [0.010, 0.009, 0.006]], [[0.012, 0.002, -0.002], [0.010, 0.009, 0.006]]]) {
      const info = blob('band', O, R, U, N, c, rad, Q(14, 8), Q(8, 5)), FB = buckets.band;
      for (let i = info.start; i < info.start + info.count; i++) { FB.uv[i * 2] = 0.16 + 0.05 * FB.uv[i * 2]; FB.uv[i * 2 + 1] = 0.25 + 0.5 * FB.uv[i * 2 + 1]; }
    }
    for (const [dx, len, dz, u0] of [[-0.034, 0.112, 0.010, 0.60], [0.027, 0.100, 0.006, 0.86]]) {
      const NT = Q(18, 9), tr = [], vs = [];
      for (let i = 0; i <= NT; i++) {
        const t = i / NT, w = 0.0150 * (1 - 0.12 * t) * Math.pow(sm(1.0, 0.86, t), 0.8) + 0.0004, cx = O[0] + dx * (0.25 * t + 0.75 * t * t), cy = O[1] - 0.004 - len * t, cz = O[2] + 0.004 + dz * t - 0.006 * Math.sin(t * PI) , tw = 0.25 * Math.sign(dx) * (1 - t);
        const ax = Math.cos(tw) * w, az = Math.sin(tw) * w, th = 0.0009;
        tr.push([[cx - ax, cy, cz - az - th], [cx + ax, cy, cz + az - th], [cx + ax, cy, cz + az + th], [cx - ax, cy, cz - az + th]]); vs.push(t);
      }
      const tp = loft(tr, { capB: true });
      for (let i = 0; i <= NT; i++) for (let j = 0; j < 5; j++) { const q = i * 5 + j, jj = j % 4; tp.uv[q * 2] = u0 + vs[i] * len / 0.45; tp.uv[q * 2 + 1] = jj === 0 || jj === 3 ? 0.04 : 0.96; }
      { const nm = 'tail' + (dx < 0 ? 0 : 1), root = V3(O[0], O[1] - 0.004, O[2] + 0.004), tip = V3(O[0] + dx, O[1] - 0.004 - len, O[2] + 0.004 + dz); addBone(nm, 'head', root.x, root.y, root.z);
        SOFT.push({ bone: nm, parent: 'head', root, dir: tip.clone().sub(root).normalize(), L: len, grav: 0.8, maxA: 1.3, w2: 70, c: 3.5 });
        addPart('band', tp, (x, y) => { const wb = sm(0.05, 0.6, (root.y - y) / len); return [BI[nm], wb, BI.head, 1 - wb]; }, { out: V3(O[0] + dx * 0.5, O[1] - len / 2, O[2] + 0.05) }); }
    }
  })();
  (function buildGem() {                            // the turquoise in its gold setting, at the middle of the band on her forehead
    const pb = bandPh(0), O = bandPt(0, pb, 0.0036), u1 = bandPt(0, pb - 0.02, 0.0036), u2 = bandPt(0, pb + 0.02, 0.0036);
    const U = V3(u1[0] - u2[0], u1[1] - u2[1], u1[2] - u2[2]).normalize(), R = V3(1, 0, 0), N = V3().crossVectors(R, U).normalize();
    const at = (r, u, n) => V3(O[0] + R.x * r + U.x * u + N.x * n, O[1] + R.y * r + U.y * u + N.y * n, O[2] + R.z * r + U.z * u + N.z * n);
    blob('gem', O, R, U, N, [0, 0, 0.0012], [0.0086, 0.0119, 0.0046], Q(28, 14), Q(14, 8));
    const ep = []; for (let i = 0; i <= 40; i++) { const t = (i / 40) * TAU; ep.push(at(0.0099 * Math.cos(t), 0.0132 * Math.sin(t), 0.0012)); }
    addPart('gold', loft(tubeRings(ep, ep.map(() => 0.0015), Q(8, 5), N)), wHead, { out: at(0, 0, -0.02), flip: true });
    blob('gold', O, R, U, N, [0, 0, -0.0006], [0.0112, 0.0146, 0.0012], Q(24, 12), 4);                                // the plate behind
    const NB = Q(26, 14); for (let i = 0; i < NB; i++) { const t = (i / NB) * TAU; blob('gold', O, R, U, N, [0.0121 * Math.cos(t), 0.0154 * Math.sin(t), 0.0010], [0.00115, 0.00115, 0.00115], 6, 4); }
    for (const sx of [-1, 1]) { blob('gold', O, R, U, N, [sx * 0.0162, 0.0030, 0.0008], [0.0044, 0.0019, 0.0014], 8, 5); blob('gold', O, R, U, N, [sx * 0.0160, -0.0030, 0.0008], [0.0040, 0.0018, 0.0014], 8, 5); blob('gold', O, R, U, N, [sx * 0.0132, 0, 0.0012], [0.0017, 0.0017, 0.0015], 6, 4); }
    blob('gold', O, R, U, N, [0, 0.0176, 0.0012], [0.0022, 0.0022, 0.0020], 8, 5); for (const sx of [-1, 1]) blob('gold', O, R, U, N, [sx * 0.0040, 0.0166, 0.0010], [0.0016, 0.0016, 0.0015], 6, 4);
    blob('gold', O, R, U, N, [0, -0.0176, 0.0012], [0.0023, 0.0023, 0.0021], 8, 5); blob('gold', O, R, U, N, [0, -0.0208, 0.0008], [0.0012, 0.0012, 0.0012], 6, 4);
    // the drop hangs straight down from under the gem and rests on her forehead
    const top = at(0, -0.0222, 0.0008), dr = [];
    for (const [t, r] of [[0, 0.0005], [0.18, 0.0011], [0.42, 0.0024], [0.66, 0.0035], [0.84, 0.0033], [0.95, 0.0021], [1, 0.0006]]) dr.push(ringXZ(top.x, top.y - 0.0105 * t, top.z + 0.0042 * t, r, r, r, Q(12, 8)));
    addPart('gold', loft(dr, { capA: true, capB: true }), wHead, { out: V3(top.x, top.y - 0.006, top.z) });
  })();
  // loose hair: soft wavy locks that have slipped the bun, at her temples, round her ears and at the nape. Each is a flat, twisting
  // ribbon wearing fine strands with gaps between them, so it reads as a wisp of hair and not a cord.
  (function buildLocks() {
    const LOCKS = [[0.058, 1.556, 0.046, 0.095, 0.0060, 1.6, 0.006, 0.008], [0.064, 1.545, 0.026, 0.150, 0.0080, 2.0, 0.004, 0.010], [0.069, 1.530, 0.004, 0.120, 0.0070, 1.8, 0.006, 0.004],
      [0.070, 1.512, -0.046, 0.140, 0.0090, 2.1, 0.004, -0.002], [0.058, 1.490, -0.066, 0.118, 0.0080, 1.8, 0.004, -0.004], [0.040, 1.470, -0.082, 0.105, 0.0070, 1.6, 0.000, -0.006],
      [0.016, 1.462, -0.090, 0.085, 0.0060, 1.4, 0.002, -0.004], [0.047, 1.568, 0.060, 0.050, 0.0040, 1.0, 0.010, 0.008]];     // root x, y, z, length, wave size, waves, drift out, drift forward
    let n = 0;
    for (const [S, sg] of SIDES) for (const [x, y, z, len, cr, turns, ox, oz] of LOCKS) {
      const NS = Q(30, 14), pts = [], rad = [], ph0 = 2.3 * n + (sg > 0 ? 0.9 : 0), L = len * (sg > 0 ? 1 : 0.88); n++;
      for (let i = 0; i <= NS; i++) { const t = i / NS, k = cr * Math.pow(t, 0.6), w = ph0 + t * turns * TAU; pts.push(V3(sg * (x + ox * t + k * 0.5 * Math.cos(w * 0.93)), y - L * t, z + oz * t + k * Math.sin(w))); rad.push([lerp(0.0050, 0.0022, t), lerp(0.0010, 0.0005, t)]); }
      const lp = loft(tubeRings(pts, rad, 8, V3(sg, 0, 0.3), 1.6 + 0.5 * Math.sin(n)), { uS: 1, vS: 1 });
      for (let i = 0; i < lp.uv.length; i += 2) lp.uv[i] = lp.uv[i] * 0.5 + 0.137 * n;
      { const nm = 'lock' + n, root = V3(sg * x, y, z), tip = V3(sg * (x + ox), y - L, z + oz); addBone(nm, 'head', root.x, root.y, root.z);
        SOFT.push({ bone: nm, parent: 'head', root, dir: tip.clone().sub(root).normalize(), L, grav: 0.5, maxA: 1.0, w2: 110, c: 5 });
        addPart('lock', lp, (px, py) => { const wb = sm(0.05, 0.6, (y - py) / L); return [BI[nm], wb, BI.head, 1 - wb]; }, { out: V3(sg * x, y - L / 2, z) }); }
    }
  })();
