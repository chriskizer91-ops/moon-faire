
  // ---------- glasses: round lenses in dark bronze wire (placed as in C2, where she wears them; the shape from C14) ----------
  // In C2 each ring is 44 mm across, its middle 2.6 mm outside her pupil and 7 mm below her eye line; the hinges sit 6 mm above the
  // middle of the ring and the bridge 7.5 mm above it. Built like the Ranger's (models/ranger-3d/src/R42_glasses.js).
  (function buildGlasses() {
    const G = { cx: 0.0324, cy: 1.5030, rx: 0.0250, ry: 0.0250, z: 0.0915, wrap: 0.10, wire: 0.00115 };       // C2 has them 44 mm across; every whole-figure painting has them bigger and darker, so they are 50 mm here
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
      const px = sg * 0.0086, py = 1.4993, pz = G.z - 0.0078;
      tube('wire', curvePts([V3(sg * (G.cx - G.rx * 0.93), G.cy - G.ry * 0.36, zAt(G.cx - G.rx * 0.93)), V3(sg * 0.0100, 1.5003, G.z - 0.0035), V3(px, py, pz + 0.0012)], 8), 0.00055, 5);
      const pr = []; for (let i = 0; i <= 6; i++) { const ph = lerp(0.15, PI - 0.15, i / 6); pr.push(ringXZ(px, py + 0.0036 * Math.cos(ph), pz, 0.0010 * Math.sin(ph) + 0.0002, 0.0019 * Math.sin(ph) + 0.0002, 0.0019 * Math.sin(ph) + 0.0002, 8)); }
      addPart('pad', loft(pr, { capA: true, capB: true }), wHead, { out: V3(px, py, pz) });
      // end piece, then the arm back over the ear and down behind it
      const xo = sg * (G.cx + G.rx), yo = G.cy + 0.0068;
      tube('wire', curvePts([V3(sg * (G.cx + G.rx * 0.93), G.cy + G.ry * 0.37, zAt(G.cx + G.rx * 0.93)), V3(xo + sg * 0.0030, yo + 0.0008, zAt(xo) - 0.0006), V3(xo + sg * 0.0048, yo + 0.0010, zAt(xo) - 0.0050)], 8), 0.0010, 6);
      tube('wire', curvePts([V3(xo + sg * 0.0048, yo + 0.0010, zAt(xo) - 0.0050), V3(sg * (headHalfW(1.513) + 0.0030), 1.5130, 0.0450), V3(sg * (headHalfW(1.519) + 0.0030), 1.5190, 0.0050), V3(sg * (headHalfW(1.5225) + 0.0040), 1.5225, -0.0170), V3(sg * (headHalfW(1.519) + 0.0030), 1.5190, -0.0330), V3(sg * (headHalfW(1.507) + 0.0010), 1.5070, -0.0420), V3(sg * headHalfW(1.495), 1.4950, -0.0440)], Q(40, 20)), (t) => (t > 0.72 ? lerp(0.0008, 0.0014, sm(0.72, 0.86, t)) : 0.0008), 6);
    }
    // bridge
    const bx = G.cx - G.rx * Math.cos(0.36), by = G.cy + G.ry * Math.sin(0.36);
    tube('wire', curvePts([V3(-bx, by, zAt(bx)), V3(-bx * 0.5, by + 0.0022, G.z + 0.0012), V3(0, by + 0.0030, G.z + 0.0016), V3(bx * 0.5, by + 0.0022, G.z + 0.0012), V3(bx, by, zAt(bx))], 14), G.wire, 6);
  })();
