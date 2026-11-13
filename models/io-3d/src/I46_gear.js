  // ---------- belt, pouch, crystal, necklaces, bracelets (stage five) ----------
  // Chris, November 13: "Let's move on to the belt pouch and Crystal the necklace and bracelets". Shapes from F1 (both necklaces, the
  // six bracelets), F2 (the moon pendant), F3 (belt, pouch, crystal) and D4 (bracelets on her wrists); where they sit from M1 and G8.
  // The pouch and the crystal each hang from the belt on one soft bone, so they swing. The rest is fixed to her body.
  (function buildGear() {
    if (opts.noGear) return;
    const tube = (key, pts, r, n, wf, up) => { const rings = tubeRings(pts, pts.map((p, i) => (typeof r === 'function' ? r(i / (pts.length - 1)) : r)), n, up || null); addPart(key, loft(rings, { capA: true, capB: true }), wf, { out: centroidOf(rings) }); };
    const ball = (key, c, r, wf, sy) => { const rings = []; for (let i = 1; i <= 4; i++) { const la = (PI * i) / 5, ring = []; for (let j = 0; j < 8; j++) ring.push([c.x + r * Math.sin(la) * Math.cos((j / 8) * TAU), c.y + r * (sy || 1) * Math.cos(la), c.z + r * Math.sin(la) * Math.sin((j / 8) * TAU)]); rings.push(ring); } addPart(key, loft(rings, { capA: true, capB: true }), wf, { out: c }); };
    const hoop = (key, c, R, r, wf, ax) => { const pts = []; for (let i = 0; i <= 20; i++) { const a = (i / 20) * TAU; pts.push(ax === 'y' ? V3(c.x + R * Math.cos(a), c.y, c.z + R * Math.sin(a)) : V3(c.x + R * Math.cos(a), c.y + R * Math.sin(a), c.z)); } tube(key, pts, r, 6, wf); };
    // a crescent moon, horns up, flat against her (F2)
    const crescent = (c, R, wf) => { const pts = [], rad = []; for (let i = 0; i <= 16; i++) { const t = i / 16, a = lerp(-2.75, -0.39, t); pts.push(V3(c.x + R * 0.82 * Math.cos(a), c.y + R * 0.82 * Math.sin(a), c.z)); rad.push([0.0021, Math.max(0.0006, R * 0.34 * Math.pow(Math.sin(PI * t), 0.75))]); } const rings = tubeRings(pts, rad, 8, V3(0, 0, 1)); addPart('gearGold', loft(rings, { capA: true, capB: true }), wf, { out: V3(c.x, c.y - R, c.z) }); };
    const frontZ = (x, y) => { let best = 0, bd = 9; for (let i = 0; i <= 80; i++) { const p = ioTorso(0.27 + 0.46 * (i / 80), y), dd = Math.abs(p[0] - x); if (dd < bd) { bd = dd; best = p[2]; } } return best; };
    const wT = (x, y, z) => wTorso(x, y, z), wHips = () => [BI.hips, 1];
    // ----- necklaces -----
    { const pts = []; for (let i = 0; i <= 28; i++) { const t = lerp(-1, 1, i / 28), x = 0.050 * t, y = 1.300 + 0.050 * Math.pow(Math.abs(t), 1.6); pts.push(V3(x, y, frontZ(x, y) + 0.0024)); }
      tube('gearSilver', pts, 0.0008, 5, wT); const zc = frontZ(0, 1.290) + 0.0045; ball('crystal', V3(0, 1.2885, zc), 0.0046, wT, 1.45); ball('gearSilver', V3(0, 1.2975, zc - 0.001), 0.0016, wT); }      // the fine silver chain and its clear drop
    { const pts = []; for (let i = 0; i <= 40; i++) { const t = lerp(-1, 1, i / 40), x = 0.052 * Math.sign(t) * Math.pow(Math.abs(t), 0.9), y = 1.222 + 0.128 * Math.pow(Math.abs(t), 1.25); pts.push(V3(x, y, frontZ(x, y) + 0.0032)); }
      tube('leather', pts, 0.0013, 5, wT);                                                                                         // the dark cord
      const z1 = frontZ(0, 1.20) + 0.0055, z2 = frontZ(0, 1.168) + 0.0055, z3 = frontZ(0, 1.135) + 0.0055;
      hoop('gearGold', V3(0, 1.2185, z1), 0.0034, 0.0009, wT); crescent(V3(0, 1.2035, z1), 0.0165, wT); crescent(V3(0, 1.1745, z2), 0.0105, wT);
      tube('gearGold', [V3(0, 1.160, z2), V3(0, 1.118, z3)], 0.0021, 6, wT); tube('gearGold', [V3(-0.0085, 1.1445, z3), V3(0.0085, 1.1445, z3)], 0.0021, 6, wT); }                // the cross under the two moons
    // ----- belt and its ring buckle -----
    { const pts = []; for (let i = 0; i <= 72; i++) { const p = skirtPt(1.056, (i / 72) * TAU, 1.0, 0.0085); pts.push(V3(p[0], 1.056, p[2])); }
      const rings = tubeRings(pts, pts.map(() => [0.0135, 0.0019]), 8, V3(0, 1, 0)); addPart('leather', loft(rings, {}), wHips, { out: V3(0, 1.056, IO_SKIRT_CZ) });
      const b = skirtPt(1.056, 0, 1.0, 0.0125); hoop('gearGold', V3(0, 1.056, b[2]), 0.0195, 0.0030, wHips); tube('gearGold', [V3(-0.019, 1.056, b[2] + 0.001), V3(0.012, 1.056, b[2] + 0.002)], 0.0016, 5, wHips); }
    // ----- the pouch on her right hip -----
    { const a = -0.66, t = [Math.cos(a), 0, -Math.sin(a)], top = V3(...skirtPt(1.040, a, 1.0, 0.030)), bot = V3(...skirtPt(0.925, a, 1.0, 0.036)), ax = bot.clone().sub(top), L = ax.length(); ax.normalize();
      const tv = V3(...t), nv = V3().crossVectors(tv, ax).normalize(); if (nv.x * Math.sin(a) + nv.z * Math.cos(a) < 0) nv.negate();
      addChain('gear', 'pouch', 'hips', [top.clone().add(V3(0, 0.012, 0)), bot], { yaw: 'hips', soft: { k: 0.10, d: 0.22, g: 0.55, col: 's', pad: 0.030 } }); const wP = () => [BI.pouch_0, 1];
      const rings = []; for (let i = 0; i <= 12; i++) { const s = i / 12, w = 0.044 * Math.pow(Math.sin(PI * Math.min(1, 0.16 + 0.84 * s) * 0.5 + (s > 0.62 ? (s - 0.62) * 1.9 : 0)), 0.7) * (s > 0.62 ? Math.sqrt(Math.max(0.02, 1 - Math.pow((s - 0.62) / 0.385, 2))) : 1), dp = 0.019 * (0.55 + 0.45 * Math.sin(PI * Math.min(1, s * 1.15))) * (s > 0.85 ? Math.sqrt(Math.max(0.03, 1 - Math.pow((s - 0.85) / 0.155, 2))) : 1), c = top.clone().addScaledVector(ax, L * s), ring = [];
        for (let j = 0; j < 16; j++) { const th = (j / 16) * TAU, e = 2 / 3.2, cx = Math.cos(th), sx = Math.sin(th), px = Math.sign(cx) * Math.pow(Math.abs(cx), e) * w, pz = Math.sign(sx) * Math.pow(Math.abs(sx), e) * dp; ring.push([c.x + tv.x * px + nv.x * (pz + dp * 0.5), c.y + tv.y * px + nv.y * (pz + dp * 0.5), c.z + tv.z * px + nv.z * (pz + dp * 0.5)]); } rings.push(ring); }
      addPart('leather', loft(rings, { capA: true, capB: true }), wP, { out: top.clone().lerp(bot, 0.5) });
      const face = (s, off) => top.clone().addScaledVector(ax, L * s).addScaledVector(nv, 0.019 * 1.5 + off);
      for (const [s, r] of [[0.30, 0.0125], [0.60, 0.0105]]) { const c = face(s, 0.002), pp = []; for (let i = 0; i <= 6; i++) pp.push(c.clone().addScaledVector(ax, lerp(-r, r, i / 6))); tube('gearGold', pp, (u) => [0.0015, Math.max(0.0008, r * 0.72 * Math.sin(PI * u))], 6, wP, nv); }      // the two gold filigree pieces, as plain gold lozenges
      tube('gearGold', [bot.clone().addScaledVector(nv, 0.012), bot.clone().addScaledVector(nv, 0.012).add(V3(0, -0.018, 0))], 0.0008, 4, wP); ball('gearGold', bot.clone().addScaledVector(nv, 0.012).add(V3(0, -0.026, 0)), 0.0078, wP);                    // the gold ball hanging under it
      for (const e of [-1, 1]) tube('leather', [top.clone().addScaledVector(tv, e * 0.022).add(V3(0, 0.034, 0)).addScaledVector(nv, -0.010), top.clone().addScaledVector(tv, e * 0.022).addScaledVector(nv, 0.016)], [0.0075, 0.0016], 6, wP); }      // its two belt loops
    // ----- the crystal on its chain, at the front of her left hip -----
    { const a = 0.36, top = V3(...skirtPt(1.044, a, 1.0, 0.012)), p1 = V3(...skirtPt(0.965, a, 1.0, 0.020)), tip = V3(...skirtPt(0.895, a, 1.0, 0.022));
      addChain('gear', 'cryst', 'hips', [top, tip], { yaw: 'hips', soft: { k: 0.05, d: 0.09, g: 0.90, col: 's', pad: 0.022 } }); const wC = () => [BI.cryst_0, 1];
      hoop('gearGold', top.clone().add(V3(0, -0.004, 0.002)), 0.0052, 0.0011, wC); tube('gearGold', [top.clone().add(V3(0, -0.009, 0.002)), p1.clone().add(V3(0, 0.006, 0))], 0.0011, 5, wC);
      tube('gearGold', [p1.clone().add(V3(0, 0.006, 0)), p1.clone().add(V3(0, -0.006, 0))], (u) => lerp(0.0045, 0.0088, u), 8, wC);
      for (let j = 0; j < 4; j++) ball('gearGold', p1.clone().add(V3(0.0092 * Math.cos(j * PI / 2 + 0.6), -0.003, 0.0092 * Math.sin(j * PI / 2 + 0.6))), 0.0026, wC);
      const d = tip.clone().sub(p1).normalize(), q = (s) => p1.clone().add(V3(0, -0.006, 0)).addScaledVector(d, s);
      const rings = tubeRings([q(0), q(0.004), q(0.046), q(0.060)], [0.0052, 0.0076, 0.0070, 0.0004], 6, null); addPart('crystal', loft(rings, { capA: true, capB: true }), wC, { out: q(0.03) }); }
    // ----- bracelets: black beads nearest her hand, then wood, then small gold (D4) -----
    for (const [S, s] of SIDES) { const wF = () => [BI['farm' + S], 1], ox = s * Math.cos(A_POSE), oy = Math.sin(A_POSE);
      for (const [key, sl, rb, N] of [['bead', 0.4285, 0.0042, 19], ['wood', 0.4175, 0.0046, 17], ['gearGold', 0.4085, 0.0022, 36]])
        for (let k = 0; k < N; k++) { const a = (k / N) * TAU + sl * 40, p = armPt(S, sl, a), e = rb * 0.8; ball(key, V3(p[0] + ox * Math.cos(a) * e, p[1] + oy * Math.cos(a) * e, p[2] + Math.sin(a) * e), rb, wF); } }
  })();
