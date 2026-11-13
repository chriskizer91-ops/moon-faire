  // ---------- his glasses: thick black frames, lenses wider than tall with rounded corners, clear glass (sizes read off B1 and C4, the shape from C14) ----------
  (function buildGlasses() {
    const G = { cx: 0.0345, cy: R_EYE - 0.0015, hw: 0.0262, hh: 0.0152, z: R_TIP - 0.021, wrap: 0.10, rim: [0.0027, 0.0021] };
    const zAt = (x) => G.z - G.wrap * Math.max(0, Math.abs(x) - 0.012);                       // the front bows back a little toward the temples
    const sq = (v) => sgnPow(v, 2 / 4.6);                                                     // a rectangle with rounded corners
    const tube = (key, pts, r, n, up) => addPart(key, loft(tubeRings(pts, pts.map((p, i) => (typeof r === 'function' ? r(i / (pts.length - 1)) : r)), n || Q(10, 6), up), { capA: true, capB: true }), wHead, { out: pts[Math.floor(pts.length / 2)].clone().add(V3(0, 0, -0.01)), flip: true });
    for (const [S, sg] of SIDES) {
      const rim = [], NR = Q(72, 36);
      for (let i = 0; i <= NR; i++) { const t = (i / NR) * TAU, x = sg * (G.cx + G.hw * sq(Math.cos(t))), y = G.cy + G.hh * sq(Math.sin(t)) + 0.0012 * Math.cos(t); rim.push(V3(x, y, zAt(x))); }      // the outer corners sit a touch higher, as painted
      addPart('frame', loft(tubeRings(rim, rim.map(() => G.rim), Q(10, 6), V3(0, 0, 1))), wHead, { out: V3(sg * G.cx, G.cy, G.z - 0.02), flip: true });
      const lr = [];                                                                          // the lens: a thin pane just inside the rim
      for (const k of [0.02, 0.35, 0.68, 0.97]) { const ring = []; for (let i = 0; i < NR; i++) { const t = (i / NR) * TAU, x = sg * (G.cx + G.hw * k * sq(Math.cos(t))); ring.push([x, G.cy + G.hh * k * sq(Math.sin(t)) + 0.0012 * k * Math.cos(t), zAt(x) + 0.0006 * (1 - k * k)]); } lr.push(ring); }
      addPart('lens', loft(lr, { capA: true }), wHead, { out: V3(sg * G.cx, G.cy, G.z - 0.05), flip: true });
      // the arm: from the hinge at the outer top corner straight back over his ear, then down behind it
      const xo = G.cx + G.hw + 0.0015, yo = G.cy + G.hh * 0.62, xe = headHalfW(EAR.y + 0.02) + 0.0045;
      tube('frame', curvePts([V3(sg * xo, yo, zAt(xo) - 0.001), V3(sg * (xo + 0.004), yo, zAt(xo) - 0.012), V3(sg * (xe + 0.002), yo - 0.001, 0.020), V3(sg * xe, EAR.y + 0.026, EAR.z + 0.012), V3(sg * (xe - 0.001), EAR.y + 0.022, EAR.z - 0.004)], Q(36, 18)), (t) => [lerp(0.0030, 0.0018, sm(0.1, 0.8, t)), 0.0012], Q(8, 6), V3(0, 1, 0));      // it ends over his ear, under his hair
    }
    const bx = G.cx - G.hw * 0.96, by = G.cy + G.hh * 0.42;                                    // the bridge
    tube('frame', curvePts([V3(-bx, by, zAt(bx)), V3(-bx * 0.5, by + 0.0015, G.z + 0.0008), V3(0, by + 0.0020, G.z + 0.0012), V3(bx * 0.5, by + 0.0015, G.z + 0.0008), V3(bx, by, zAt(bx))], 14), [0.0030, 0.0021], Q(10, 6), V3(0, 0, 1));
  })();
