  // ---------- the light that runs down her arms when she touches her gem (painting H9) ----------
  // Thin lines laid just over her skin from each shoulder to her knuckles, moving with her arms. Each is two tubes, a fine bright one
  // and a wider faint one round it. Along a line the picture coordinate v runs 0 at her shoulder to 1 at her knuckles, so the light can
  // be made to run down it by sliding one small picture (see MATS.veins and gemStage). u picks the fine tube (0.25) or the faint one (0.75).
  (function () {
    for (const [S, s] of SIDES) {
      const d = armDir[S], sh = restPts['sh' + S], out = V3(s * Math.cos(A_POSE), Math.sin(A_POSE), 0), fw = V3(0, 0, 1), SL0 = -0.02, SL1 = 0.47, UA = 0.80;
      const cAt = (sl) => { const pm = sl > 0.43 ? spline(ARM_PALM, Math.min(sl, 0.493)) : 0; return sh.clone().addScaledVector(d, sl).add(V3(s * d.y * pm, -s * d.x * pm, ARM_Z(sl))); };
      // a point just above her arm's skin at arm-length sl, turned by ang round the arm from its outer side toward the front
      const skinAt = (sl, ang) => { const r = prof(ARM_R, sl, true), t = sl < 0.28 ? 1 : spline(ARM_T, cl(sl, 0.28, 0.493)), ca = Math.cos(ang), sa = Math.sin(ang), rho = 1 / Math.sqrt(Math.pow(ca / (r * t), 2) + Math.pow(sa / r, 2));
        return cAt(sl).addScaledVector(out, ca * (rho + 0.0034)).addScaledVector(fw, sa * (rho + 0.0034)); };
      const tube = (pts, us, wts, rad, row) => { const n = 5, cols = n + 1, m = pts.length, c = pts.reduce((a, p) => a.add(p), V3()).multiplyScalar(1 / m);
        addPart('veins', loft(tubeRings(pts, pts.map((p, i) => rad * (0.55 + 0.45 * Math.sin(PI * Math.min(1, (i + 0.5) / m * 1.02)))), n), { capA: true, capB: true, u0: row, uS: 0, v: us }), (x, y, z, i) => wts[i < m * cols ? Math.floor(i / cols) : (i === m * cols ? 0 : m - 1)], { out: c }); };
      const line = (pts, us, wts) => { tube(pts, us, wts, 0.0017, 0.25); tube(pts, us, wts, 0.0052, 0.75); };
      // down the outside of her arm, wandering a little, and on over the back of her hand to her middle knuckle
      { const pts = [], us = [], wts = [], n = 46;
        for (let i = 0; i <= n; i++) { const f = i / n, sl = lerp(SL0, SL1, f); pts.push(skinAt(sl, (1.05 + 0.30 * Math.sin(f * 7.3 + (s > 0 ? 0.4 : 1.9))) * (1 - sm(0.41, 0.47, sl)))); us.push(UA * f); wts.push(wArm(S, sl)); }
        for (let i = 1; i <= 8; i++) { const f = i / 8, p = handPt(s, -0.0150, -0.006 - 0.070 * f, 0.010 * f); pts.push(p); us.push(lerp(UA, 1, f)); wts.push([BI['hand' + S], 1]); }
        line(pts, us, wts); }
      // two short side branches on her forearm, and one each to her index and ring knuckles
      for (const [a0, a1, g0, g1] of [[0.10, 0.24, 1.0, 1.75], [0.27, 0.40, 0.95, 1.70], [0.30, 0.43, 0.75, 0.05]]) { const pts = [], us = [], wts = [], n = 12;
        for (let i = 0; i <= n; i++) { const f = i / n, sl = lerp(a0, a1, f); pts.push(skinAt(sl, lerp(g0, g1, f * f))); us.push(UA * (sl - SL0) / (SL1 - SL0)); wts.push(wArm(S, sl)); } line(pts, us, wts); }
      for (const zk of [0.026, -0.012]) { const pts = [], us = [], wts = [], n = 7; for (let i = 0; i <= n; i++) { const f = i / n; pts.push(handPt(s, -0.0150, -0.020 - 0.052 * f, lerp(0.004, zk, f))); us.push(lerp(UA + 0.06, 1, f)); wts.push([BI['hand' + S], 1]); } line(pts, us, wts); }
    }
  })();
