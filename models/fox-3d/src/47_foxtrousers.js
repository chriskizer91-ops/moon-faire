  // ---------- her patchwork trousers (shape: F6 and the round 4 paintings; sizes: A1; cloth: the swatch sheets F9 and F10) ----------
  // First build. They are sewn shapes carried by her hips, thighs and shins; they do not yet fall and swing as cloth of their own.
  // In A1 each leg is about 33 cm across from the knee to mid-calf, the two meet at the middle, and the cloth is gathered in at the top of each boot.
  (function foxTrousers() {
    const NU = Q(56, 30), ZC = 0.012;
    const ell = (cx, y, cz, rx, rz, wob) => { const r = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, k = 1 + (wob ? wob(a) : 0); r.push([cx + rx * k * Math.sin(a), y, cz + rz * k * Math.cos(a)]); } return r; };
    // the yoke: one piece round her hips, from just under the corset's frill to the fork   [height, half-width, half-depth, how far forward its middle sits]
    const YOKE = [[0.992, 0.150, 0.108, 0.036], [0.955, 0.166, 0.120, 0.034], [0.920, 0.180, 0.130, 0.030], [0.870, 0.196, 0.138, 0.024], [0.810, 0.206, 0.140, 0.019], [0.745, 0.204, 0.136, 0.018]];
    addPart('patch', loft(YOKE.map((r) => ell(0, r[0], r[3], r[1], r[2], (a) => 0.016 * Math.sin(a * 9))), { uS: 4, vS: 1.0 }), () => [BI.hips, 1], { out: V3(0, 0.86, 0.02) });
    // each leg, top to bottom   [height, how far out its middle sits, half-width, half-depth]
    // Chris, 12 Nov: "far too baggy". Each leg was 30 cm across (A1's measure); it is now about 20: still a wide leg, no longer a balloon.
    const LEGT = [[0.820, 0.105, 0.098, 0.118], [0.720, 0.108, 0.099, 0.118], [0.610, 0.111, 0.100, 0.115], [0.490, 0.112, 0.100, 0.112], [0.390, 0.112, 0.100, 0.110], [0.315, 0.108, 0.092, 0.104], [0.268, 0.099, 0.075, 0.090], [0.240, 0.090, 0.056, 0.072]];
    const LEGA = LEGT.map((r) => [r[0], [r[1], r[2], r[3]]]).reverse(), legAt = (y) => spline(LEGA, cl(y, 0.240, 0.820));
    for (const [S, s] of SIDES) {
      const TH = BI['thigh' + S], SHN = BI['shin' + S];
      const wLeg = (x, y) => { if (y > 0.80) return [BI.hips, 1]; if (y > 0.70) { const u = sm(0.80, 0.70, y); return [BI.hips, 1 - u, TH, u]; } if (y > 0.51) return [TH, 1]; if (y > 0.43) { const u = sm(0.51, 0.43, y); return [TH, 1 - u, SHN, u]; } return [SHN, 1]; };
      const NR = Q(30, 16), rings = [];
      for (let i = 0; i <= NR; i++) {
        const y = lerp(0.820, 0.240, i / NR), [cxo, rx, rz] = legAt(y), gather = 1 - sm(0.245, 0.32, y);
        rings.push(ell(s * cxo, y, ZC, rx, rz, (a) => 0.016 * Math.sin(a * 11 + y * 30) * (1 - gather) + 0.050 * Math.sin(a * 17) * gather));
      }
      addPart('patch', loft(rings, { uS: 2, vS: 1.8 }), wLeg, { out: V3(s * 0.15, 0.5, ZC) });
      // two flounces over each leg, the upper one shorter, each with a dipping hem and its own waves
      for (const [yTop, yHem, g0, g1, key, ph, dip] of [[0.660, 0.375, 0.006, 0.046, 'patch', 1.3, 0.085], [0.815, 0.520, 0.012, 0.058, 'patch2', 0.4, 0.100]]) {
        const NT = Q(12, 7), tr = [];
        for (let i = 0; i <= NT; i++) {
          const t = i / NT, ring = [];
          for (let j = 0; j < NU; j++) {
            const a = (j / NU) * TAU, y = lerp(yTop, yHem - dip * Math.pow(0.5 + 0.5 * Math.sin(a * 3 + ph), 1.6), t), [cxo, rx, rz] = legAt(y), g = lerp(g0, g1, t) + 0.014 * t * Math.sin(a * 13 + ph * 3 + t * 5);
            ring.push([s * cxo + (rx + g) * Math.sin(a), y, ZC + (rz + g) * Math.cos(a)]);
          }
          tr.push(ring);
        }
        addPart(key, loft(tr, { uS: 2, vS: 0.8, u0: ph * 0.13 }), wLeg, { out: V3(s * 0.15, (yTop + yHem) / 2, ZC) });
      }
      // the magenta frill where each leg is gathered onto her boot
      const fr = [];
      for (let i = 0; i <= 4; i++) { const t = i / 4, ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, r = lerp(0.056, 0.086, t) + 0.011 * t * Math.sin(a * 15); ring.push([s * 0.089 + r * Math.sin(a), lerp(0.262, 0.212, t) + 0.004 * t * Math.sin(a * 15 + 1), -0.004 + r * 1.22 * Math.cos(a)]); } fr.push(ring); }
      addPart('frill', loft(fr), () => [SHN, 1], { out: V3(s * 0.089, 0.24, -0.004) });
    }
    // ---- her belt, slung lower on her left hip, with its buckle, the pouch on her left and the sheath for her shears on her right (F7, G4, and the standing painting) ----
    const YA = YOKE.map((r) => [r[0], [r[1], r[2], r[3]]]).reverse(), beltY = (a) => 0.958 - 0.020 * Math.sin(a);
    const onHip = (a, y, out) => { const [rx, rz, cz] = spline(YA, cl(y, 0.745, 0.992)); return V3((rx + out) * Math.sin(a), y, cz + (rz + out) * Math.cos(a)); };
    const wH = () => [BI.hips, 1], NB = Q(64, 36), band = (dy, out) => { const r = []; for (let j = 0; j < NB; j++) { const a = (j / NB) * TAU, q = onHip(a, beltY(a) + dy, out); r.push([q.x, q.y, q.z]); } return r; };
    addPart('belt', loft([band(-0.016, 0.001), band(-0.014, 0.0085), band(0, 0.0095), band(0.014, 0.0085), band(0.016, 0.001)]), wH, { out: V3(0, 0.955, 0.03) });
    for (let k = 0; k < 14; k++) { const a = 0.9 + k * 0.38, q = onHip(a, beltY(a), 0.0105); addPart('bellm', spherePart(q, 0.0030, 0.0030, 0.0022, 6, 5), wH, { out: q }); }      // studs
    { const a = 0.42, q = onHip(a, beltY(a), 0.0115); addPart('bellm', spherePart(q, 0.022, 0.019, 0.0050, 14, 8), wH, { out: q }); const q2 = onHip(a, beltY(a), 0.0150); addPart('belt', spherePart(q2, 0.013, 0.011, 0.0030, 10, 6), wH, { out: q2 }); }      // buckle
    { const a = 1.30, yb = beltY(a), c = onHip(a, yb - 0.070, 0.030), f = onHip(a, yb - 0.046, 0.034), st = onHip(a, yb - 0.066, 0.060);      // pouch, flap, stud
      addPart('pouch', spherePart(c, 0.050, 0.056, 0.030, 16, 10), wH, { out: c }); addPart('belt', spherePart(f, 0.052, 0.034, 0.031, 16, 10), wH, { out: f }); addPart('bellm', spherePart(st, 0.006, 0.006, 0.004, 8, 6), wH, { out: st });
      const lp = onHip(a, yb - 0.012, 0.014); addPart('belt', spherePart(lp, 0.016, 0.022, 0.008, 10, 6), wH, { out: lp }); }
    { const a = -0.95, yb = beltY(a), c = onHip(a, yb - 0.105, 0.020), lp = onHip(a, yb - 0.012, 0.014);      // sheath, and the two bows of her shears standing out of it
      addPart('pouch', spherePart(c, 0.024, 0.100, 0.013, 14, 12), wH, { out: c }); addPart('belt', spherePart(lp, 0.022, 0.024, 0.008, 10, 6), wH, { out: lp });
      for (const dx of [-0.013, 0.013]) { const q = onHip(a + dx / 0.17, yb + 0.012, 0.024); addPart('steel', spherePart(q, 0.0105, 0.0125, 0.0035, 10, 6), wH, { out: q }); } }
  })();
