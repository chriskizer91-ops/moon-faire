  // ---------- the Ranger's boots (stage one), from E1 to E8 and B3: mid-calf lace-up combat boots in worn brown-charcoal leather, tan laces,
  //            nine rows of brass eyelets, a lug sole with a low block heel, and a thick grey knitted sock pushed down over the collar ----------
  // The builder is the Jester's (31_boots.js) with her own tables: the sole is 3 cm deep at the ball and 4.6 cm at the heel, the collar is 23.6 cm up,
  // and the whole boot is 5% shorter. Measured from B3 at 898 px a meter.
  function wBoot(S, y, z) {
    if (y > 0.10) { const u = sm(0.085, 0.165, y); return [BI['foot' + S], 1 - u, BI['shin' + S], u]; }
    const t = sm(0.085, 0.125, z) * (1 - sm(0.07, 0.11, y)); return [BI['foot' + S], 1 - t, BI['toe' + S], t];
  }
  const B_TOP = 0.236, B_E = 2 / 2.2, B_ZS = 0.95, bz = (z) => -0.012 + (z + 0.012) * B_ZS, B_Y0 = 0.048, B_Y1 = 0.252;
  // shaft: height -> [half-width, front, back, centre z]; below the ankle the front runs out along the instep
  const B_SH = [[0.048, [0.0465, 0.124, 0.064, -0.010]], [0.072, [0.0460, 0.116, 0.065, -0.010]], [0.086, [0.0450, 0.104, 0.063, -0.010]], [0.100, [0.0435, 0.092, 0.060, -0.010]], [0.120, [0.0425, 0.074, 0.055, -0.010]],
    [0.140, [0.0405, 0.062, 0.050, -0.008]], [0.180, [0.0385, 0.055, 0.053, -0.004]], [0.236, [0.0405, 0.052, 0.054, -0.008]], [0.252, [0.0405, 0.052, 0.054, -0.008]]];
  // foot: z -> [half-width, height above the sole]
  const B_FT = [[-0.066, [0.018, 0.030]], [-0.058, [0.032, 0.070]], [-0.035, [0.040, 0.098]], [0.0, [0.042, 0.108]], [0.049, [0.044, 0.103]], [0.066, [0.045, 0.084]], [0.088, [0.046, 0.057]], [0.112, [0.0465, 0.046]],
    [0.135, [0.0455, 0.042]], [0.155, [0.042, 0.039]], [0.168, [0.034, 0.032]], [0.176, [0.021, 0.021]], [0.1795, [0.008, 0.009]]];
  // sole: its top edge (the welt) by z, and its half-width in plan
  const B_YT = [[-0.080, 0.047], [-0.060, 0.046], [-0.021, 0.043], [0.021, 0.039], [0.063, 0.034], [0.105, 0.031], [0.147, 0.033], [0.192, 0.037]];
  const B_HW = [[-0.076, 0], [-0.0745, 0.014], [-0.070, 0.030], [-0.058, 0.041], [-0.035, 0.046], [0.0, 0.046], [0.035, 0.045], [0.07, 0.050], [0.11, 0.055], [0.145, 0.054], [0.170, 0.044], [0.182, 0.028], [0.1865, 0.014], [0.188, 0]];
  const B_Z0 = -0.076, B_Z1 = 0.188, B_LUG = 0.0120;
  const bTop = (z) => spline(B_YT, cl(z, -0.08, 0.192)), bHw = (z) => Math.max(0, spline(B_HW, cl(z, B_Z0, B_Z1)));
  const bBot = (z) => B_LUG + 0.013 * sm(0.020, 0.030, z) * (1 - sm(0.040, 0.052, z));      // the arch is cut up between the heel and the forefoot
  for (const [S, s] of SIDES) {
    const cx = s * 0.081, wf = (x, y, z) => wBoot(S, y, z), wShin = () => [BI['shin' + S], 1], NU = Q(36, 18), AX = V3(cx, 0.16, -0.008);
    const shaftPt = (y, a) => { const [rx, rzF, rzB, cz] = prof(B_SH, cl(y, B_Y0, B_Y1), true), sn = Math.sin(a), c = Math.cos(a); return V3(cx + rx * Math.sign(sn) * Math.pow(Math.abs(sn), B_E), y, cz + (c >= 0 ? rzF : rzB) * Math.sign(c) * Math.pow(Math.abs(c), B_E)); };
    const footPt = (z, a) => { const [w, h] = prof(B_FT, cl(z, -0.066, 0.1795), true), c = Math.cos(a), sn = Math.sin(a); return V3(cx + w * Math.sign(c) * Math.pow(Math.abs(c), 0.8), bTop(z) - 0.001 + (sn >= 0 ? h * Math.pow(sn, 0.85) : 0.004 * sn), bz(z)); };
    const nrm = (fn, u, v, du, dv, inside) => { const p = fn(u, v), n = fn(u + du, v).sub(fn(u - du, v)).cross(fn(u, v + dv).sub(fn(u, v - dv))).normalize(); if (n.dot(p.clone().sub(inside)) < 0) n.negate(); return { p, n }; };
    const onShaft = (y, a) => nrm(shaftPt, y, a, 0.002, 0.02, V3(cx, y, 0.0)), onFoot = (z, a) => nrm(footPt, z, a, 0.002, 0.02, V3(cx, bTop(z) + 0.02, z));
    // ---- the upper: shaft, then the foot from heel to toe ----
    const rings = [], NR = Q(30, 14);
    for (let i = 0; i <= NR; i++) { const y = lerp(B_TOP + 0.012, B_Y0, Math.pow(i / NR, 0.9)), [rx, rzF, rzB, cz] = prof(B_SH, y, true); rings.push(ringXZ(cx, y, cz, rx, rzF, rzB, NU, 2.2)); }
    rings.unshift(ringXZ(cx, B_TOP + 0.004, -0.008, 0.0385, 0.043, 0.044, NU, 2.2), ringXZ(cx, B_TOP + 0.0145, -0.008, 0.0400, 0.0445, 0.0455, NU, 2.2));      // the bound edge of the collar, turned in
    addPart('boot', loft(rings, { uS: 2, vS: 1.7 }), wf, { out: AX });
    const fr = [], NF = Q(26, 12), NZ = Q(30, 14);
    for (let i = 0; i <= NZ; i++) { const u = i / NZ, z = lerp(-0.066, 0.1795, u * u * (3 - 2 * u) * 0.3 + u * 0.7), ring = []; for (let j = 0; j < NF; j++) { const p = footPt(z, (j / NF) * TAU); ring.push([p.x, p.y, p.z]); } fr.push(ring); }
    addPart('boot', loft(fr, { capA: true, capB: true, uS: 2, vS: 1.4 }), wf, { out: V3(cx, 0.08, 0.05) });
    // the tongue stands a little above the collar at the front
    { const tr = [], A0 = 0.62, NT = Q(12, 6);
      for (const [y, k, th] of [[B_TOP - 0.02, 1.0, 0.004], [B_TOP + 0.020, 1.0, 0.004], [B_TOP + 0.027, 0.86, 0.004], [B_TOP + 0.030, 0.6, 0.003]]) {
        const ring = []; for (let j = 0; j <= NT; j++) { const a = lerp(-A0, A0, j / NT) * k, p = shaftPt(Math.min(y, B_Y1 - 0.001), a); ring.push([p.x, y, p.z - 0.0025]); }
        for (let j = NT; j >= 0; j--) { const a = lerp(-A0, A0, j / NT) * k, p = shaftPt(Math.min(y, B_Y1 - 0.001), a); ring.push([cx + (p.x - cx) * 0.93, y, p.z - 0.0025 - th]); }
        tr.push(ring);
      }
      addPart('boot', loft(tr, { capB: true, uS: 0.6, vS: 0.2 }), wShin, { out: V3(cx, B_TOP, 0.02) });
    }
    // ---- the sole: a ridged wall from the lugs up to the welt, flaring a little toward the ground ----
    const NO = Q(64, 32), zm = (B_Z0 + B_Z1) / 2, half = (B_Z1 - B_Z0) / 2, plan = [];
    for (let j = 0; j < NO; j++) { const a = (j / NO) * TAU, c = Math.cos(a), z = zm + half * Math.sign(c) * Math.pow(Math.abs(c), 0.86); plan.push([Math.sin(a) >= 0 ? 1 : -1, z]); }
    const sring = (yf, k) => plan.map(([sd, z]) => [cx + sd * bHw(z) * (1 + k), yf(z), bz(zm + (z - zm) * (1 + k * 0.32))]);
    const wall = loft([sring((z) => bBot(z) - 0.0015, 0.045), sring(bBot, 0.075), sring((z) => bBot(z) + 0.004, 0.082), sring((z) => bTop(z) - 0.0045, 0.012), sring(bTop, 0.0), sring((z) => bTop(z) + 0.0004, -0.035)], { capA: true, capB: true, uS: 6 });
    for (let i = 0; i < wall.pos.length / 3; i++) wall.uv[i * 2 + 1] = wall.pos[i * 3 + 1] / 0.05;
    addPart('sole', wall, wf, { out: V3(cx, 0.03, zm) });
    // lugs: blocks round the edge of the forefoot and the heel, and bars across the middle of each
    const lug = (x0, x1, z0, z1, x0b, x1b) => {       // a block from the ground up into the sole; its outer side can follow the outline (x at z0, x at z1)
      const q = (y, k) => [[cx + x0 * k, y, bz(z0)], [cx + (x0b == null ? x0 : x0b) * k, y, bz(z1)], [cx + (x1b == null ? x1 : x1b) * k, y, bz(z1)], [cx + x1 * k, y, bz(z0)]];
      const p = loft([q(0, 0.985), q(0.002, 1), q(Math.max(bBot(z0), bBot(z1)) + 0.002, 1)], { capA: true, uS: 0.4 }); for (let i = 0; i < p.pos.length / 3; i++) p.uv[i * 2 + 1] = 0.01;
      addPart('sole', p, wf, { out: V3(cx + (x0 + x1) / 2, 0.006, (z0 + z1) / 2) });
    };
    const side = (z0, z1) => { for (const sd of [-1, 1]) lug(sd * (bHw(z0) * 1.07), sd * (bHw(z0) * 1.07 - 0.019), z0, z1, sd * (bHw(z1) * 1.07), sd * (bHw(z1) * 1.07 - 0.019)); };
    for (let k = 0; k < 7; k++) side(0.060 + k * 0.0165, 0.060 + k * 0.0165 + 0.0122);
    for (let k = 0; k < 4; k++) side(-0.060 + k * 0.0185, -0.060 + k * 0.0185 + 0.0140);
    for (const x of [-0.021, 0, 0.021]) { lug(x - 0.0085, x + 0.0085, 0.174 - Math.abs(x) * 0.25, 0.1905 - Math.abs(x) * 0.5); lug(x - 0.0085, x + 0.0085, -0.0775 + Math.abs(x) * 0.35, -0.064 + Math.abs(x) * 0.2); }
    for (const z of [0.074, 0.099, 0.124, 0.149]) lug(-0.022, 0.022, z - 0.006, z + 0.006);
    for (const z of [-0.047, -0.024, -0.001]) lug(-0.019, 0.019, z - 0.006, z + 0.006);
    // ---- stitching: small yellow dashes lying on the leather, in double rows along every seam, and one row round the welt ----
    const ST = { pos: [], uv: [], idx: [], nor: [] }, PITCH = 0.0042 / Math.max(0.6, DET);
    const dash = (p, n, t, hl, hw) => {
      const sv = V3().crossVectors(n, t).normalize(), b = ST.pos.length / 3, c = p.clone().addScaledVector(n, 0.0005);
      for (const [a, w] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const v = c.clone().addScaledVector(t, a * hl).addScaledVector(sv, w * hw); ST.pos.push(v.x, v.y, v.z); ST.nor.push(n.x, n.y, n.z); ST.uv.push(0, 0); }
      ST.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    const stitch = (fn, n, hl, hw) => {               // fn(t in 0..1) -> { p, n }; n samples to measure the path
      const P = []; for (let i = 0; i <= n; i++) P.push(fn(i / n));
      let acc = PITCH / 2, L = 0;
      for (let i = 0; i < n; i++) { const d = P[i].p.distanceTo(P[i + 1].p), t = P[i + 1].p.clone().sub(P[i].p).normalize(); while (acc < L + d) { const u = (acc - L) / d; dash(P[i].p.clone().lerp(P[i + 1].p, u), P[i].n, t, hl || 0.0014, hw || 0.00045); acc += PITCH; } L += d; }
      return P;
    };
    const path = (fn, n) => { const P = []; for (let i = 0; i <= n; i++) P.push(fn(i / n)); return P; };
    const seam = (P, r) => addPart('boot', loft(tubeRings(P.map((e) => e.p.clone().addScaledVector(e.n, -r * 0.45)), P.map(() => r), 5)), wf, { out: AX });
    const ASTAY = 0.86;
    for (const sd of [-1, 1]) {
      for (const da of [0, 0.085]) stitch((t) => onShaft(lerp(B_TOP - 0.004, 0.094, t), sd * (ASTAY + da + 0.25 * sm(0.55, 1, t))), 40);                     // the edge of the eyelet stay
      seam(path((t) => onShaft(lerp(B_TOP + 0.004, 0.092, t), sd * (ASTAY - 0.07 + 0.25 * sm(0.55, 1, t))), 30), 0.0012);
      for (const da of [0.075, 0.125]) stitch((t) => onShaft(lerp(B_TOP - 0.004, 0.056, t), PI + sd * da), 40);                                               // the strap up the back
      seam(path((t) => onShaft(lerp(B_TOP + 0.004, 0.054, t), PI + sd * 0.165), 24), 0.0012);
      for (const dy of [0, 0.0042]) stitch((t) => onShaft(0.150 - dy - 0.094 * Math.pow(t, 1.6), PI - sd * (0.165 + 1.22 * Math.pow(t, 0.8))), 40);         // the heel counter
      seam(path((t) => onShaft(0.1545 - 0.094 * Math.pow(t, 1.6), PI - sd * (0.165 + 1.22 * Math.pow(t, 0.8))), 24), 0.0012);
      stitch((t) => onShaft(B_TOP - 0.0045, sd * lerp(ASTAY + 0.085, PI - 0.125, t)), 40);                                                                    // under the collar
    }
    for (const z of [0.1125, 0.1170]) stitch((t) => onFoot(z, lerp(0.03, PI - 0.03, t)), 40);                                                                   // the toe cap
    seam(path((t) => onFoot(0.1205, lerp(0.0, PI, t)), 24), 0.0014);
    { const q = (k) => { const [sd, z] = plan[((k % NO) + NO) % NO]; return V3(cx + sd * bHw(z) * 1.012, bTop(z) - 0.0032, bz(zm + (z - zm) * 1.004)); };            // the welt: bold stitches round the top edge of the sole
      stitch((t) => { const j = t * NO, j0 = Math.floor(j), f = j - j0, p = q(j0).lerp(q(j0 + 1), f), tg = q(j0 + 1).sub(q(j0)), n = V3(tg.z, 0, -tg.x).normalize(); if (n.dot(V3(p.x - cx, 0, p.z - zm)) < 0) n.negate(); return { p, n }; }, NO * 2, 0.0015, 0.0008); }
    addPart('stitch', ST, wf, { nor: ST.nor });
    // ---- eyelets and laces ----
    const NE = 9, EY = [0.2260, 0.2090, 0.1920, 0.1750, 0.1580, 0.1415, 0.1260, 0.1120, 0.1000], AE = 0.50;
    const eye = (k, sd) => { const e = onShaft(EY[k], sd * (AE + 0.10 * sm(0.145, 0.095, EY[k]))); e.p.addScaledVector(e.n, 0.0008); return e; };
    for (let k = 0; k < NE; k++) for (const sd of [-1, 1]) {
      const e = eye(k, sd), t1 = V3(0, 1, 0).cross(e.n).normalize(), t2 = V3().crossVectors(e.n, t1), ring = [];
      for (let j = 0; j <= 10; j++) { const a = (j / 10) * TAU; ring.push(e.p.clone().addScaledVector(t1, 0.0044 * Math.cos(a)).addScaledVector(t2, 0.0044 * Math.sin(a))); }
      addPart('eyelet', loft(tubeRings(ring, ring.map(() => 0.00155), 6)), wf, { out: e.p });
    }
    const lace = (a, b, lift, key) => { const m = a.p.clone().lerp(b.p, 0.5).addScaledVector(a.n.clone().add(b.n).normalize(), lift), pts = curvePts([a.p, m, b.p], 7); addPart(key || 'lace', loft(tubeRings(pts, pts.map(() => 0.0020), 6), { capA: true, capB: true }), wf, { out: m.clone().addScaledVector(a.n, -0.02) }); };
    for (let k = NE - 1; k > 0; k--) { lace(eye(k, -1), eye(k - 1, 1), 0.0125 + 0.0012 * (k % 2)); lace(eye(k, 1), eye(k - 1, -1), 0.0110 - 0.0012 * (k % 2)); }
    lace(eye(NE - 1, -1), eye(NE - 1, 1), 0.0075);
    // the bow at the top: a knot, two drooping loops and two tails with metal tips
    const K0 = onShaft(EY[0] + 0.003, 0), K = K0.p.clone().addScaledVector(K0.n, 0.007), tube = (key, pts, r, o) => addPart(key, loft(tubeRings(pts, pts.map(() => r), 6), o), wShin, { out: pts[Math.floor(pts.length / 2)].clone().add(V3(0, 0, -0.03)) });
    addPart('lace', spherePart(K, 0.0052, 0.0044, 0.0044, 10, 8), wShin, { out: K });
    for (const sd of [-1, 1]) {
      lace(eye(0, sd), { p: K, n: K0.n }, 0.003);
      const lp = []; for (let j = 0; j <= 14; j++) { const a = (j / 14) * TAU, w = (1 - Math.cos(a)) / 2; lp.push(V3(K.x + sd * (0.003 + 0.047 * w), K.y - 0.024 * w + 0.013 * Math.sin(a) * (1 - 0.3 * w), K.z + 0.004 + 0.012 * w - 0.02 * w * w)); }
      tube('lace', lp, 0.0020);
      const tl = curvePts([K.clone(), V3(K.x + sd * 0.016, K.y - 0.026, K.z + 0.010), V3(K.x + sd * (0.026 + 0.004 * s * sd), K.y - 0.058, K.z + 0.008), V3(K.x + sd * 0.030, K.y - 0.084, K.z + 0.004)], 10);
      tube('lace', tl, 0.0020);
      const e0 = tl[tl.length - 1], e1 = e0.clone().add(e0.clone().sub(tl[tl.length - 2]).normalize().multiplyScalar(0.013));
      tube('aglet', [e0, e1], 0.0026, { capA: true, capB: true });
    }
    // ---- the sock: thick grey knit pushed down over the collar in three soft rolls ----
    const SK_Y = [[0.204, -0.0050], [0.208, 0.0005], [0.216, 0.0050], [0.228, 0.0070], [0.239, 0.0050], [0.2455, 0.0012], [0.252, 0.0046], [0.262, 0.0066], [0.272, 0.0050], [0.2785, 0.0014], [0.285, 0.0040], [0.295, 0.0056],
      [0.305, 0.0042], [0.312, 0.0010], [0.3175, -0.0040], [0.3195, -0.0090], [0.3160, -0.0130]], sr = [];
    for (const [y, d] of SK_Y) { const t = cl((y - 0.204) / 0.115, 0, 1); sr.push(ringXZ(cx, y, lerp(-0.008, -0.017, t), 0.0445 + d, 0.0560 + d - 0.005 * t, 0.0585 + d - 0.005 * t, NU, 2.1, (p, a) => [p[0], p[1] + 0.0045 * Math.sin(a * 2 + 0.7 + s) * sm(0.208, 0.25, y) * (1 - sm(0.30, 0.318, y)) + 0.002 * Math.sin(a * 5 + y * 70), p[2]])); }
    const sock = loft(sr, { uS: 1 }); for (let i = 0; i < sock.pos.length / 3; i++) sock.uv[i * 2 + 1] = cl((sock.pos[i * 3 + 1] - 0.204) / 0.116, 0, 1);
    addPart('sock', sock, wShin, { out: V3(cx, 0.26, -0.012) });
  }
