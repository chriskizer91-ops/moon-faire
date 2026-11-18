
  // ---------- glasses: thin dark wire, lenses a little wider than tall, a faint lilac tint (sizes read off C2, the shape from C12) ----------
  (function buildGlasses() {
    const G = { cx: 0.0329, cy: 1.5036, rx: 0.0229, ry: 0.0197, z: 0.0905, wrap: 0.11, wire: 0.00085 };
    const zAt = (x) => G.z - G.wrap * Math.max(0, Math.abs(x) - 0.012);                       // the front bows back a little toward the temples
    const tube = (key, pts, r, n) => addPart(key, loft(tubeRings(pts, pts.map((p, i) => (typeof r === 'function' ? r(i / (pts.length - 1)) : r)), n || Q(7, 5)), { capA: true, capB: true }), wHead, { out: pts[Math.floor(pts.length / 2)].clone().add(V3(0, 0, -0.01)), flip: true });
    for (const [S, sg] of SIDES) {
      const rim = [], NR = Q(56, 28), fan = [[], []];
      for (let i = 0; i <= NR; i++) { const t = (i / NR) * TAU, x = sg * (G.cx + G.rx * Math.cos(t)), y = G.cy + G.ry * Math.sin(t); rim.push(V3(x, y, zAt(x))); }
      addPart('wire', loft(tubeRings(rim, rim.map(() => G.wire), Q(7, 5), V3(0, 0, 1))), wHead, { out: V3(sg * G.cx, G.cy, G.z - 0.02), flip: true });
      // the lens: a thin disc just inside the rim
      const lr = [];
      for (const k of [0.02, 0.35, 0.68, 0.985]) { const ring = []; for (let i = 0; i < NR; i++) { const t = (i / NR) * TAU, x = sg * (G.cx + G.rx * k * Math.cos(t)); ring.push([x, G.cy + G.ry * k * Math.sin(t), zAt(x) + 0.0009 * (1 - k * k)]); } lr.push(ring); }
      addPart('lens', loft(lr, { capA: true }), wHead, { out: V3(sg * G.cx, G.cy, G.z - 0.05) , flip: true });
      // nose pad and its little arm
      const px = sg * 0.0088, py = 1.4990, pz = G.z - 0.0075;
      tube('wire', curvePts([V3(sg * (G.cx - G.rx * 0.93), G.cy - G.ry * 0.36, zAt(G.cx - G.rx * 0.93)), V3(sg * 0.0100, 1.5000, G.z - 0.0035), V3(px, py, pz + 0.0012)], 8), 0.00055, 5);
      const pr = []; for (let i = 0; i <= 6; i++) { const ph = lerp(0.15, PI - 0.15, i / 6); pr.push(ringXZ(px, py + 0.0036 * Math.cos(ph), pz, 0.0010 * Math.sin(ph) + 0.0002, 0.0019 * Math.sin(ph) + 0.0002, 0.0019 * Math.sin(ph) + 0.0002, 8)); }
      addPart('pad', loft(pr, { capA: true, capB: true }), wHead, { out: V3(px, py, pz) });
      // end piece, then the arm back over the ear and down behind it
      const xo = sg * (G.cx + G.rx), yo = G.cy + 0.0068;
      tube('wire', curvePts([V3(sg * (G.cx + G.rx * 0.93), G.cy + G.ry * 0.37, zAt(G.cx + G.rx * 0.93)), V3(xo + sg * 0.0030, yo + 0.0008, zAt(xo) - 0.0006), V3(xo + sg * 0.0048, yo + 0.0010, zAt(xo) - 0.0050)], 8), 0.0010, 6);
      tube('wire', curvePts([V3(xo + sg * 0.0048, yo + 0.0010, zAt(xo) - 0.0050), V3(sg * 0.0655, 1.5140, 0.0450), V3(sg * 0.0690, 1.5200, 0.0050), V3(sg * 0.0705, 1.5235, -0.0170), V3(sg * 0.0690, 1.5200, -0.0330), V3(sg * 0.0660, 1.5080, -0.0420), V3(sg * 0.0640, 1.4960, -0.0440)], Q(40, 20)), (t) => (t > 0.72 ? lerp(0.0008, 0.0014, sm(0.72, 0.86, t)) : 0.0008), 6);
    }
    // bridge
    const bx = G.cx - G.rx * Math.cos(0.62), by = G.cy + G.ry * Math.sin(0.62);
    tube('wire', curvePts([V3(-bx, by, zAt(bx)), V3(-bx * 0.5, by + 0.0022, G.z + 0.0012), V3(0, by + 0.0030, G.z + 0.0016), V3(bx * 0.5, by + 0.0022, G.z + 0.0012), V3(bx, by, zAt(bx))], 14), G.wire, 6);
  })();
