  // ---------- the Ranger's boots (stage four), built to her boot paintings E1 to E8: lace-up combat boots in worn charcoal-brown leather, tan laces,
  //            nine pairs of brass eyelets, a stitched welt, a lug sole with a block heel, and a grey knitted sock pushed down over the collar ----------
  // The builder began as the Jester's (31_boots.js). Every table below was read off the paintings with tools/cmp_boot.py, which lays the model
  // over each painting at one scale (the sole of E1 as long as the model's: 1 painting pixel = 0.27 mm) and prints both outlines in millimetres.
  //   Side (E1, E2): collar edge 23.2 cm up, sock top 29.1 cm; welt 4.4 cm up under the heel, 2.7 at the ball, 4.2 at the toe; heel block 7.8 cm long.
  //   Front, back, sole (E3, E4, E7): sole 9.6 cm across at the ball, 8.6 at the heel; shaft 7.3 to 8 cm across.
  //   Places along the side are given as [z, y] in metres (z forward from the ankle line, y up from the ground), read straight off E1.
  function wBoot(S, y, z) {
    if (y > 0.10) { const u = sm(0.085, 0.165, y); return [BI['foot' + S], 1 - u, BI['shin' + S], u]; }
    const t = sm(0.085, 0.125, z) * (1 - sm(0.07, 0.11, y)); return [BI['foot' + S], 1 - t, BI['toe' + S], t];
  }
  const B_TOP = 0.2175, B_E = 2 / 2.2, B_EF = 2 / 1.3, B_ZS = 0.95, bz = (z) => -0.012 + (z + 0.012) * B_ZS, bzi = (z) => (z + 0.012) / B_ZS - 0.012, B_Y0 = 0.048, B_Y1 = 0.252;
  // shaft: height -> [half-width, front, back, centre z]; below the ankle the front runs out along the instep.
  // Seen from above the back half is a rounded box and the front half comes to a rounded nose, so the eyelets sit well back from the front edge, as in E1.
  const B_SH = [[0.048, [0.0390, 0.118, 0.062, -0.010]], [0.072, [0.0390, 0.108, 0.062, -0.010]], [0.086, [0.0385, 0.095, 0.059, -0.010]], [0.100, [0.0374, 0.079, 0.054, -0.010]], [0.120, [0.0364, 0.063, 0.050, -0.010]],
    [0.140, [0.0362, 0.050, 0.046, -0.010]], [0.180, [0.0368, 0.043, 0.043, -0.013]], [0.232, [0.0400, 0.044, 0.048, -0.013]], [0.252, [0.0400, 0.044, 0.048, -0.013]]];
  // foot: z -> [half-width, height above the sole]
  const B_FT = [[-0.066, [0.016, 0.030]], [-0.058, [0.028, 0.070]], [-0.035, [0.0365, 0.098]], [0.0, [0.0365, 0.108]], [0.030, [0.0325, 0.104]], [0.049, [0.0330, 0.092]], [0.066, [0.0372, 0.076]], [0.080, [0.0400, 0.0665]],
    [0.088, [0.0410, 0.060]], [0.101, [0.0420, 0.053]], [0.112, [0.0420, 0.049]], [0.122, [0.0415, 0.048]], [0.135, [0.0398, 0.0445]], [0.155, [0.0340, 0.041]], [0.168, [0.0275, 0.034]], [0.176, [0.0190, 0.024]], [0.1795, [0.0085, 0.012]]];
  // sole: its top edge (the welt) by z, and its half-width in plan
  const B_YT = [[-0.080, 0.0438], [-0.040, 0.0438], [0.000, 0.0438], [0.016, 0.0432], [0.032, 0.0387], [0.046, 0.0332], [0.061, 0.0294], [0.075, 0.0278], [0.097, 0.0271], [0.118, 0.0280], [0.132, 0.0300], [0.147, 0.0327],
    [0.161, 0.0360], [0.176, 0.0392], [0.192, 0.0425]];
  const B_HW = [[-0.076, 0], [-0.0745, 0.012], [-0.070, 0.025], [-0.058, 0.0350], [-0.035, 0.0402], [-0.012, 0.0400], [0.012, 0.0365], [0.032, 0.0340], [0.052, 0.0360], [0.074, 0.0412], [0.095, 0.0448], [0.116, 0.0453],
    [0.137, 0.0425], [0.158, 0.0360], [0.172, 0.0285], [0.182, 0.0190], [0.1865, 0.0100], [0.188, 0]];
  const B_Z0 = -0.076, B_Z1 = 0.188, B_LUG = 0.009;
  const bTop = (z) => spline(B_YT, cl(z, -0.08, 0.192)), bHw = (z) => Math.max(0, spline(B_HW, cl(z, B_Z0, B_Z1)));
  const bBot = (z) => B_LUG + 0.012 * sm(0.001, 0.006, z) * (1 - sm(0.008, 0.0435, z));      // the arch is cut up in front of the heel block and slopes down to the forefoot
  // eyelets, outer row as E1 shows them: [z, y]. The top seven are on the shaft, the last two out on the instep.
  const B_EYE = [[0.0163, 0.2187], [0.0168, 0.1982], [0.0176, 0.1773], [0.0195, 0.1566], [0.0236, 0.1356], [0.0332, 0.1187], [0.0460, 0.1035], [0.0617, 0.0893], [0.0789, 0.0776]];
  for (const [S, s] of SIDES) {
    const cx = s * 0.081, wf = (x, y, z) => wBoot(S, y, z), wShin = () => [BI['shin' + S], 1], NU = Q(40, 20), AX = V3(cx, 0.16, -0.012);
    const shaftPt = (y, a) => { const [rx, rzF, rzB, cz] = prof(B_SH, cl(y, B_Y0, B_Y1), true), sn = Math.sin(a), c = Math.cos(a);
      return c >= 0 ? V3(cx + rx * sn, y, cz + rzF * Math.pow(c, B_EF)) : V3(cx + rx * Math.sign(sn) * Math.pow(Math.abs(sn), B_E), y, cz - rzB * Math.pow(-c, B_E)); };
    const footPt = (z, a) => { const [w, h] = prof(B_FT, cl(z, -0.066, 0.1795), true), c = Math.cos(a), sn = Math.sin(a); return V3(cx + w * Math.sign(c) * Math.pow(Math.abs(c), 0.8), bTop(z) - 0.001 + (sn >= 0 ? h * Math.pow(sn, 0.85) : 0.004 * sn), bz(z)); };
    const nrm = (fn, u, v, du, dv, inside) => { const p = fn(u, v), n = fn(u + du, v).sub(fn(u - du, v)).cross(fn(u, v + dv).sub(fn(u, v - dv))).normalize(); if (n.dot(p.clone().sub(inside)) < 0) n.negate(); return { p, n }; };
    const onShaft = (y, a) => nrm(shaftPt, y, a, 0.002, 0.02, V3(cx, y, -0.012)), onFoot = (z, a) => nrm(footPt, z, a, 0.002, 0.02, V3(cx, bTop(z) + 0.02, z));
    // the leather of the boot's side as seen from the side: how far out from the boot's middle line it is at [z, y], on the shaft or on the foot, whichever is outside
    const sideX = (z, y) => {
      let xs = 0, xf = 0;
      if (y >= B_Y0 - 0.002) { const [rx, rzF, rzB, cz] = prof(B_SH, cl(y, B_Y0, B_Y1), true), dz = z - cz, q = Math.abs(dz) / (dz >= 0 ? rzF : rzB); if (q < 1) { const e = dz >= 0 ? B_EF : B_E, c = Math.pow(q, 1 / e), sn = Math.sqrt(1 - c * c); xs = rx * (dz >= 0 ? sn : Math.pow(sn, e)); } }
      const zp = bzi(z); if (zp > -0.066 && zp < 0.1795) { const [w, h] = prof(B_FT, zp, true), t = (y - (bTop(zp) - 0.001)) / h; if (t >= 0 && t < 1) { const sn = Math.pow(t, 1 / 0.85); xf = w * Math.pow(Math.sqrt(1 - sn * sn), 0.8); } }
      return Math.max(xs, xf);
    };
    const onSide = (z, y, sd) => { const e = 0.0015, x = sideX(z, y), fz = (sideX(z + e, y) - sideX(z - e, y)) / (2 * e), fy = (sideX(z, y + e) - sideX(z, y - e)) / (2 * e); return { p: V3(cx + sd * x, y, z), n: V3(sd, -cl(fy, -4, 4), -cl(fz, -4, 4)).normalize() }; };
    // a point over the front of the boot between two points on its sides (f from 0 to 1), lifted off the leather: laces run over these
    const over = (a, b, f, lift) => {
      const base = a.p.clone().lerp(b.p, f), d = a.n.clone().add(b.n); d.x = 0; d.normalize(); const ax = Math.abs(base.x - cx); let sOut = 0;
      for (let k = 0; k <= 70; k++) { const sv = k * 0.001; if (sideX(base.z + d.z * sv, base.y + d.y * sv) > ax) sOut = sv + 0.001; }
      return base.addScaledVector(d, sOut + (lift == null ? 0.0026 : lift));
    };
    // ---- the upper: shaft, then the foot from heel to toe ----
    const ringS = (y, k) => { const [, , , cz] = prof(B_SH, cl(y, B_Y0, B_Y1), true), tilt = 0.003 * sm(0.170, 0.225, y), ring = [];      // the collar stands a little higher at the front than at the back
      for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, p = shaftPt(Math.min(y, B_Y1), a); ring.push([cx + (p.x - cx) * k, y + tilt * Math.cos(a), cz + (p.z - cz) * k]); } return ring; };
    const rings = [ringS(B_TOP + 0.004, 0.86), ringS(B_TOP + 0.0145, 0.955)], NR = Q(34, 16);                                                // the bound edge of the collar, turned in
    for (let i = 0; i <= NR; i++) rings.push(ringS(lerp(B_TOP + 0.012, B_Y0, Math.pow(i / NR, 0.9)), 1));
    addPart('boot', loft(rings, { uS: 2, vS: 1.7 }), wf, { out: AX });
    const fr = [], NF = Q(26, 12), NZ = Q(34, 16);
    for (let i = 0; i <= NZ; i++) { const u = i / NZ, z = lerp(-0.066, 0.1795, u * u * (3 - 2 * u) * 0.3 + u * 0.7), ring = []; for (let j = 0; j < NF; j++) { const p = footPt(z, (j / NF) * TAU); ring.push([p.x, p.y, p.z]); } fr.push(ring); }
    addPart('boot', loft(fr, { capA: true, capB: true, uS: 2, vS: 1.4 }), wf, { out: V3(cx, 0.08, 0.05) });
    // the tongue stands a little above the collar at the front
    { const tr = [], A0 = 0.60, NT = Q(12, 6);
      for (const [y, k, th] of [[B_TOP - 0.02, 1.0, 0.004], [B_TOP + 0.016, 1.0, 0.004], [B_TOP + 0.022, 0.86, 0.004], [B_TOP + 0.025, 0.6, 0.003]]) {
        const ring = []; for (let j = 0; j <= NT; j++) { const a = lerp(-A0, A0, j / NT) * k, p = shaftPt(Math.min(y, B_Y1 - 0.001), a); ring.push([p.x, y, p.z - 0.0025]); }
        for (let j = NT; j >= 0; j--) { const a = lerp(-A0, A0, j / NT) * k, p = shaftPt(Math.min(y, B_Y1 - 0.001), a); ring.push([cx + (p.x - cx) * 0.93, y, p.z - 0.0025 - th]); }
        tr.push(ring);
      }
      addPart('boot', loft(tr, { capB: true, uS: 0.6, vS: 0.2 }), wShin, { out: V3(cx, B_TOP, 0.0) });
    }
    // the pull loop at the back: a strap that stands up from the collar against the sock
    { const lr = [];
      for (const [y, z] of [[B_TOP - 0.006, -0.0635], [B_TOP + 0.010, -0.0640], [B_TOP + 0.020, -0.0705], [B_TOP + 0.030, -0.0762], [B_TOP + 0.0375, -0.0768], [B_TOP + 0.0400, -0.0735]])
        lr.push([[cx - 0.0078, y, z], [cx + 0.0078, y, z], [cx + 0.0078, y, z + 0.0042], [cx - 0.0078, y, z + 0.0042]]);
      addPart('boot', loft(lr, { capA: true, capB: true, uS: 0.3, vS: 0.3 }), wShin, { out: V3(cx, B_TOP + 0.02, -0.07) });
    }
    // ---- the sole: a wall from the lugs up to the welt, whose edge stands out a little all round ----
    const NO = Q(72, 36), zm = (B_Z0 + B_Z1) / 2, half = (B_Z1 - B_Z0) / 2, plan = [];
    for (let j = 0; j < NO; j++) { const a = (j / NO) * TAU, c = Math.cos(a), z = zm + half * Math.sign(c) * Math.pow(Math.abs(c), 0.86); plan.push([Math.sin(a) >= 0 ? 1 : -1, z]); }
    const sring = (yf, k) => plan.map(([sd, z]) => [cx + sd * bHw(z) * (1 + k), yf(z), bz(zm + (z - zm) * (1 + k * 0.32))]);
    const wall = loft([sring((z) => bBot(z) - 0.0015, 0.020), sring(bBot, 0.045), sring((z) => bBot(z) + 0.004, 0.050), sring((z) => bTop(z) - 0.0096, 0.036), sring((z) => bTop(z) - 0.0088, 0.058), sring((z) => bTop(z) - 0.0012, 0.060),
      sring(bTop, 0.040), sring((z) => bTop(z) + 0.0004, -0.035)], { capA: true, capB: true, uS: 6 });
    for (let i = 0; i < wall.pos.length / 3; i++) wall.uv[i * 2 + 1] = wall.pos[i * 3 + 1] / 0.05;
    addPart('sole', wall, wf, { out: V3(cx, 0.025, zm) });
    // lugs: blocks round the edge of the forefoot and the heel, and bars across the middle of each
    const lug = (x0, x1, z0, z1, x0b, x1b) => {       // a block from the ground up into the sole; its outer side can follow the outline (x at z0, x at z1)
      const q = (y, k) => [[cx + x0 * k, y, bz(z0)], [cx + (x0b == null ? x0 : x0b) * k, y, bz(z1)], [cx + (x1b == null ? x1 : x1b) * k, y, bz(z1)], [cx + x1 * k, y, bz(z0)]];
      const p = loft([q(0, 0.985), q(0.002, 1), q(Math.max(bBot(z0), bBot(z1)) + 0.002, 1)], { capA: true, uS: 0.4 }); for (let i = 0; i < p.pos.length / 3; i++) p.uv[i * 2 + 1] = 0.01;
      addPart('sole', p, wf, { out: V3(cx + (x0 + x1) / 2, 0.006, (z0 + z1) / 2) });
    };
    const side = (z0, z1) => { for (const sd of [-1, 1]) lug(sd * (bHw(z0) * 1.045), sd * (bHw(z0) * 1.045 - 0.017), z0, z1, sd * (bHw(z1) * 1.045), sd * (bHw(z1) * 1.045 - 0.017)); };
    for (let k = 0; k < 7; k++) side(0.0435 + k * 0.0200, 0.0435 + k * 0.0200 + 0.0147);
    for (let k = 0; k < 3; k++) side(-0.0518 + k * 0.0205, -0.0518 + k * 0.0205 + (k === 2 ? 0.0150 : 0.0160));
    for (const x of [-0.016, 0, 0.016]) { lug(x - 0.0068, x + 0.0068, 0.172 - Math.abs(x) * 0.3, 0.1895 - Math.abs(x) * 0.62); lug(x - 0.0068, x + 0.0068, -0.0775 + Math.abs(x) * 0.42, -0.0585 + Math.abs(x) * 0.2); }
    for (const z of [0.068, 0.093, 0.118, 0.143]) lug(-0.019, 0.019, z - 0.006, z + 0.006);
    for (const z of [-0.040, -0.016]) lug(-0.017, 0.017, z - 0.006, z + 0.006);
    // ---- stitching: small tan dashes lying on the leather along every seam, and bold ones round the welt ----
    const ST = { pos: [], uv: [], idx: [], nor: [] }, PITCH = 0.0042 / Math.max(0.6, DET);
    const dash = (p, n, t, hl, hw) => {
      const sv = V3().crossVectors(n, t).normalize(), b = ST.pos.length / 3, c = p.clone().addScaledVector(n, 0.0005);
      for (const [a, w] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const v = c.clone().addScaledVector(t, a * hl).addScaledVector(sv, w * hw); ST.pos.push(v.x, v.y, v.z); ST.nor.push(n.x, n.y, n.z); ST.uv.push(0, 0); }
      ST.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    const stitch = (fn, n, hl, hw, pitch) => {        // fn(t in 0..1) -> { p, n }; n samples to measure the path
      const P = [], pt = pitch || PITCH; for (let i = 0; i <= n; i++) P.push(fn(i / n));
      let acc = pt / 2, L = 0;
      for (let i = 0; i < n; i++) { const d = P[i].p.distanceTo(P[i + 1].p); if (d < 1e-6) continue; const t = P[i + 1].p.clone().sub(P[i].p).normalize(); while (acc < L + d) { const u = (acc - L) / d; dash(P[i].p.clone().lerp(P[i + 1].p, u), P[i].n, t, hl || 0.0012, hw || 0.00036); acc += pt; } L += d; }
      return P;
    };
    const path = (fn, n) => { const P = []; for (let i = 0; i <= n; i++) P.push(fn(i / n)); return P; };
    const seam = (P, r) => addPart('boot', loft(tubeRings(P.map((e) => e.p.clone().addScaledVector(e.n, -r * 0.45)), P.map(() => r), 5)), wf, { out: AX });
    // a smooth line through places [z, y] on one side of the boot, moved sideways by off (metres, positive is down and back)
    const sideLine = (pts, sd, off) => {
      const c = curvePts(pts.map(([z, y]) => V3(z, y, 0)), 40);
      return (t) => { const f = t * (c.length - 1), i = Math.min(c.length - 2, Math.floor(f)), q = c[i].clone().lerp(c[i + 1], f - i), tg = c[i + 1].clone().sub(c[i]).normalize(); return onSide(q.x + tg.y * (off || 0), q.y - tg.x * (off || 0), sd); };
    };
    // the back, by angle from the back seam: a smooth line through [angle, y]
    const backLine = (pts, sd, da, dy) => { const c = curvePts(pts.map(([a, y]) => V3(a, y, 0)), 40); return (t) => { const f = t * (c.length - 1), i = Math.min(c.length - 2, Math.floor(f)), q = c[i].clone().lerp(c[i + 1], f - i); return onShaft(q.y + (dy || 0), PI - sd * (q.x + (da || 0))); }; };
    const STAY = [[B_EYE[0][0], B_TOP + 0.0105]].concat(B_EYE), COUNTER = [[0.21, 0.112], [0.52, 0.1090], [0.85, 0.1030], [1.15, 0.0930], [1.36, 0.0780], [1.48, 0.0620], [1.55, 0.0485]];
    const VAMP = [[0.0845, 0.0640], [0.0645, 0.0620], [0.0515, 0.0595], [0.0365, 0.0545], [0.0285, 0.0505], [0.0205, 0.0480]];
    for (const sd of [-1, 1]) {
      for (const off of [0.0080, 0.0106]) stitch(sideLine(STAY, sd, off), 60);                                                                // behind the eyelets, the edge of the piece they are set in
      seam(path(sideLine(STAY, sd, 0.0128), 40), 0.0011);
      for (const off of [0, 0.0026]) stitch(sideLine(VAMP, sd, off), 40);                                                                      // the seam that runs from the last eyelet back down to the welt
      seam(path(sideLine(VAMP, sd, -0.0022), 30), 0.0011);
      for (const da of [0.125, 0.170]) stitch((t) => onShaft(lerp(B_TOP + 0.010, 0.114, t), PI + sd * da), 40);                                  // the strap up the back
      seam(path((t) => onShaft(lerp(B_TOP + 0.012, 0.113, t), PI + sd * 0.205), 24), 0.0011);
      for (const [da, dy] of [[0, 0], [-0.03, -0.0030]]) stitch(backLine(COUNTER, sd, da, dy), 50);                                              // the heel counter: a dome up the back of the heel
      seam(path(backLine(COUNTER, sd, 0.035, 0.0036), 30), 0.0012);
      stitch((t) => onShaft(B_TOP + 0.002, sd * lerp(1.02, PI - 0.215, t)), 40);                                                               // under the padded collar
    }
    { const yb = B_TOP - 0.006, yt = B_TOP + 0.008, w = 0.105, bx = (y, a) => onShaft(y, PI + a);                                               // the stitched box with a cross that holds the pull loop
      for (const [a0, y0, a1, y1] of [[-w, yb, w, yb], [-w, yt, w, yt], [-w, yb, w, yt], [-w, yt, w, yb], [-w, yb, -w, yt], [w, yb, w, yt]]) stitch((t) => bx(lerp(y0, y1, t), lerp(a0, a1, t)), 8, 0.0011, 0.0004, 0.0032); }
    const capZ = (a, d) => 0.1135 + d + 0.0063 * Math.sin(a);                                                                                  // the toe cap leans forward toward the top
    for (const d of [0, 0.0045]) stitch((t) => { const a = lerp(0.03, PI - 0.03, t); return onFoot(capZ(a, d), a); }, 40);
    seam(path((t) => { const a = lerp(0.0, PI, t); return onFoot(capZ(a, -0.0034), a); }, 24), 0.0013);
    { const q = (k) => { const [sd, z] = plan[((k % NO) + NO) % NO]; return V3(cx + sd * bHw(z) * 1.062, bTop(z) - 0.0036, bz(zm + (z - zm) * 1.019)); };            // the welt: bold stitches round the edge of the sole
      stitch((t) => { const j = t * NO, j0 = Math.floor(j), f = j - j0, p = q(j0).lerp(q(j0 + 1), f), tg = q(j0 + 1).sub(q(j0)), n = V3(tg.z, 0, -tg.x).normalize(); if (n.dot(V3(p.x - cx, 0, p.z - zm)) < 0) n.negate(); return { p, n }; }, NO * 2, 0.0019, 0.0009, 0.0058 / Math.max(0.6, DET)); }
    addPart('stitch', ST, wf, { nor: ST.nor });
    // ---- eyelets and laces ----
    const NE = B_EYE.length, eye = (k, sd) => { const e = onSide(B_EYE[k][0], B_EYE[k][1], sd); e.p.addScaledVector(e.n, 0.0007); return e; };
    for (let k = 0; k < NE; k++) for (const sd of [-1, 1]) {
      const e = eye(k, sd), t1 = V3(0, 1, 0).cross(e.n).normalize(), t2 = V3().crossVectors(e.n, t1), ring = [];
      for (let j = 0; j <= 10; j++) { const a = (j / 10) * TAU; ring.push(e.p.clone().addScaledVector(t1, 0.0038 * Math.cos(a)).addScaledVector(t2, 0.0038 * Math.sin(a))); }
      addPart('eyelet', loft(tubeRings(ring, ring.map(() => 0.0015), 6)), wf, { out: e.p });
      const hole = (r) => { const q = []; for (let j = 0; j < 10; j++) { const a = (j / 10) * TAU; q.push(e.p.clone().addScaledVector(t1, r * Math.cos(a)).addScaledVector(t2, r * Math.sin(a)).addScaledVector(e.n, -0.0002).toArray()); } return q; };
      addPart('hole', loft([hole(0.0030), hole(0.0004)], { capB: true }), wf, { out: e.p.clone().addScaledVector(e.n, -0.01) });      // the dark of the hole
    }
    const LR = 0.0019, lace = (a, b, key) => { const c = [a.p.clone(), over(a, b, 0.22), over(a, b, 0.5), over(a, b, 0.78), b.p.clone()], pts = curvePts(c, 11);
      addPart(key || 'lace', loft(tubeRings(pts, pts.map(() => LR), 6), { capA: true, capB: true }), wf, { out: V3(cx, c[2].y, c[2].z - 0.03) }); };
    for (let k = NE - 1; k > 0; k--) { lace(eye(k, -1), eye(k - 1, 1)); lace(eye(k, 1), eye(k - 1, -1)); }
    lace(eye(NE - 1, -1), eye(NE - 1, 1));
    // the bow at the top: a knot, two loops that droop to the sides, and two tails with metal tips hanging down the front
    const K = over(eye(0, -1), eye(0, 1), 0.5, 0.0055); K.y += 0.003;
    const tube = (key, pts, r, o) => addPart(key, loft(tubeRings(pts, pts.map(() => r), 6), o), wShin, { out: pts[Math.floor(pts.length / 2)].clone().add(V3(0, 0, -0.03)) });
    addPart('lace', spherePart(K, 0.0046, 0.0040, 0.0040, 10, 8), wShin, { out: K });
    for (const sd of [-1, 1]) {
      { const e = eye(0, sd), pts = curvePts([e.p.clone(), over(e, { p: K, n: V3(0, 0, 1) }, 0.55), K.clone()], 7); tube('lace', pts, LR, { capA: true, capB: true }); }
      const lp = []; for (let j = 0; j <= 16; j++) { const a = (j / 16) * TAU, w = (1 - Math.cos(a)) / 2; lp.push(V3(K.x + sd * (0.003 + 0.035 * w), K.y - 0.019 * w + 0.0105 * Math.sin(a) * (1 - 0.3 * w), K.z + 0.002 + 0.014 * w - 0.004 * w * w)); }
      tube('lace', lp, LR);
      const tl = curvePts([K.clone(), V3(K.x + sd * 0.008, K.y - 0.018, K.z + 0.010), V3(K.x + sd * (0.012 + 0.002 * s * sd), K.y - 0.040, K.z + 0.0095), V3(K.x + sd * 0.014, K.y - 0.056, K.z + 0.008)], 10);
      tube('lace', tl, LR);
      const e0 = tl[tl.length - 1], e1 = e0.clone().add(e0.clone().sub(tl[tl.length - 2]).normalize().multiplyScalar(0.011));
      tube('aglet', [e0, e1], 0.0022, { capA: true, capB: true });
    }
    // ---- the sock: thick grey knit pushed down over the collar in three soft rolls, its top 29.1 cm up ----
    const SK0 = 0.226, SK1 = 0.2915, SK_Y = [[0.2260, -0.0100], [0.2300, -0.0040], [0.2335, 0.0015], [0.2385, 0.0050], [0.2435, 0.0060], [0.2480, 0.0046], [0.2505, 0.0030], [0.2535, 0.0048], [0.2610, 0.0072], [0.2680, 0.0054],
      [0.2715, 0.0032], [0.2750, 0.0048], [0.2820, 0.0058], [0.2880, 0.0046], [0.2910, 0.0016], [0.2915, -0.0030], [0.2885, -0.0085]], sr = [];
    for (const [y, d] of SK_Y) { const t = cl((y - SK0) / (SK1 - SK0), 0, 1); sr.push(ringXZ(cx, y, lerp(-0.013, -0.016, t), 0.0400 + d, 0.0495 + d, 0.0495 + d, NU, 2.1, (p, a) => [p[0], p[1] + 0.0028 * Math.sin(a * 2 + 0.7 + s) * sm(0.236, 0.262, y) * (1 - sm(0.280, 0.291, y)) + 0.0014 * Math.sin(a * 5 + y * 70), p[2]])); }
    const sock = loft(sr, { uS: 1 }); for (let i = 0; i < sock.pos.length / 3; i++) sock.uv[i * 2 + 1] = cl((sock.pos[i * 3 + 1] - SK0) / (SK1 - SK0), 0, 1);
    addPart('sock', sock, wShin, { out: V3(cx, 0.26, -0.015) });
  }
