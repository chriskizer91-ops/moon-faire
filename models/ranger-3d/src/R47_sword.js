  // ---------- her sword and its scabbard (painting G4; worn as in G6) ----------
  // A slim, straight court sword of moonsteel, 74 cm long: a narrow two-edged blade, a guard like a crescent moon with its horns toward
  // the blade, a grip of dark blue leather bound with silver wire, and an oval blue gem in a gold setting for a pommel.
  // Like the bow, the sword is built in a place of its own beside her and has one bone, 'sword', a child of 'root': up the blade is +Y,
  // its edges are along X and its flats face Z. The bone rests at the middle of the grip, so placing the bone places the sword.
  // The scabbard is built where it hangs, at the front of her left hip with its tip down and back, on its own bone 'scab' so it swings.
  let SWK = null;
  (function () {
    const G1 = V3(1.6, 1.2, 0.6), wS = () => [BI.sword, 1];
    addBone('sword', null, G1.x, G1.y, G1.z);
    const at = (x, y, z) => V3(G1.x + x, G1.y + y, G1.z + (z || 0));
    const mid = (pts) => pts.reduce((m, p) => m.add(p), V3()).multiplyScalar(1 / pts.length);
    const rod = (key, pts, radii, n, wf, up, closed) => { const P = closed ? pts.concat([pts[0].clone()]) : pts, Rr = closed ? radii.concat([radii[0]]) : radii;
      addPart(key, loft(tubeRings(P, Rr, n, up), closed ? {} : { capA: true, capB: true }), wf, { out: mid(pts) }); };
    const facets = (key, tris, c0, wf) => { const pos = [], nor = [], idx = [];       // flat faces, so the blade has a true ridge and true edges
      for (const [a, b0, c1] of tris) { let b = b0, c = c1; const n = b.clone().sub(a).cross(c.clone().sub(a)); if (n.lengthSq() < 1e-16) continue; n.normalize(); if (n.dot(a.clone().add(b).add(c).multiplyScalar(1 / 3).sub(c0)) < 0) { n.negate(); const t = b; b = c; c = t; }
        for (const p of [a, b, c]) { idx.push(pos.length / 3); pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); } }
      addPart(key, { pos, idx }, wf, { nor }); };
    const XU = V3(1, 0, 0);

    // ---- the grip: leather, with a silver wire wound round it; a collar below it ----
    { const n = 40, pts = [], rad = [];
      for (let i = 0; i <= n; i++) { const y = lerp(-0.040, 0.040, i / n), swell = 1 + 0.07 * Math.cos(y / 0.040 * PI / 2); pts.push(at(0, y)); rad.push([0.0118 * swell, 0.0100 * swell]); }
      rod('swordGrip', pts, rad, 12, wS, XU);
      const wire = []; for (let i = 0; i <= 96; i++) { const t = i / 96, y = lerp(-0.038, 0.038, t), swell = 1 + 0.07 * Math.cos(y / 0.040 * PI / 2), a = t * TAU * 6.5; wire.push(at(0.0122 * swell * Math.cos(a), y, 0.0104 * swell * Math.sin(a))); }
      rod('swordSteel', wire, wire.map(() => 0.00085), 5, wS, XU);
      const prof = [[-0.0385, 0.0126], [-0.0420, 0.0138], [-0.0465, 0.0128], [-0.0515, 0.0137], [-0.0560, 0.0120], [-0.0610, 0.0092]];
      rod('swordSteel', prof.map(([y]) => at(0, y)), prof.map(([, r]) => [r, r * 0.86]), 12, wS, XU); }

    // ---- the pommel: an oval blue gem in a gold setting with a ring of gold beads ----
    { const c = at(0, -0.0865);
      addPart('swordGold', spherePart(c, 0.0180, 0.0260, 0.0090, 18, 10), wS, { out: c });
      addPart('swordGem', spherePart(c, 0.0128, 0.0200, 0.0122, 16, 10), wS, { out: c });
      for (let j = 0; j < 18; j++) { const t = (j / 18) * TAU, b = at(0.0186 * Math.cos(t), -0.0865 + 0.0266 * Math.sin(t)); addPart('swordGold', spherePart(b, 0.0026, 0.0026, 0.0026, 7, 5), wS, { out: b }); }
      const b = at(0, -0.1150); addPart('swordGold', spherePart(b, 0.0034, 0.0034, 0.0034, 8, 6), wS, { out: b }); }

    // ---- the guard: one crescent, thick in the middle and drawn out to two points that curve toward the blade ----
    { const R = 0.040, yg = 0.0455, pts = [], rad = [], N = 34;
      for (let i = 0; i <= N; i++) { const th = lerp(-112, 112, i / N) * DEG, k = Math.max(0.10, Math.pow(Math.max(0, Math.cos(th * 0.80)), 0.8)); pts.push(at(R * Math.sin(th), yg + R * (1 - Math.cos(th)))); rad.push([0.0050 * (0.35 + 0.65 * k), 0.0080 * k]); }
      rod('swordSteel', pts, rad, 8, wS, V3(0, 0, 1));
      const c = at(0, 0.0460); addPart('swordSteel', spherePart(c, 0.0155, 0.0095, 0.0088, 12, 8), wS, { out: c }); }

    // ---- the blade: a flat diamond in section, 57.5 cm long, 2.4 cm wide at the guard, with a long point ----
    const Y0 = 0.050, Y1 = 0.625;
    { const wAt = (u) => (u < 0.80 ? 0.0242 * (1 - 0.20 * u) : 0.0242 * 0.84 * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.80) / 0.20, 2)))), tAt = (u) => 0.0050 * (1 - 0.45 * u);
      const us = [0, 0.12, 0.25, 0.38, 0.50, 0.62, 0.72, 0.80, 0.86, 0.91, 0.95, 0.98], rings = us.map((u) => { const y = lerp(Y0, Y1, u), w = wAt(u) / 2, t = tAt(u) / 2; return [at(w, y, 0), at(0, y, t), at(-w, y, 0), at(0, y, -t)]; }), tip = at(0, Y1), tris = [];
      for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < 4; j++) { const k = (j + 1) % 4; tris.push([rings[i][j], rings[i + 1][j], rings[i + 1][k]]); tris.push([rings[i][j], rings[i + 1][k], rings[i][k]]); }
      const last = rings[rings.length - 1]; for (let j = 0; j < 4; j++) tris.push([last[j], tip, last[(j + 1) % 4]]);
      facets('blade', tris, at(0, (Y0 + Y1) / 2), wS); }

    // ---- the scabbard, where it hangs ----
    // It hangs from the front of her left hip, a little below her belts, tip down and back along the outside of her thigh. Its wide
    // side lies along her hip, so the crescent guard shows from the front, as in G6.
    const uS = 0.665, yH = 0.955, P3s = (a) => V3(a[0], a[1], a[2]);
    const s0 = P3s(rTorso(uS, yH)), t0 = P3s(rTorso(uS + 0.012, yH)).sub(P3s(rTorso(uS - 0.012, yH))); t0.y = 0; t0.normalize();      // along her hip, toward her back
    const n0 = V3(-t0.z, 0, t0.x); if (n0.dot(V3(s0.x, 0, s0.z)) < 0) n0.negate();                                                    // out from her hip
    const ds = V3(0, -Math.cos(24 * DEG), 0).addScaledVector(V3(0.22, 0, -0.975).normalize(), Math.sin(24 * DEG)).addScaledVector(n0, 0.03).normalize();     // the way the scabbard points: down, and back by 24 degrees
    const ws = t0.clone().addScaledVector(ds, -t0.dot(ds)).normalize(), ns = V3().crossVectors(ws, ds).normalize(); if (ns.dot(n0) < 0) ns.negate();
    const Pm = s0.clone().addScaledVector(n0, 0.030); Pm.y -= 0.075;                                                                    // the mouth of the scabbard
    const pivot = s0.clone().addScaledVector(n0, 0.022);                                                                                // it swings from here, at her belt
    addBone('scab', 'hips', pivot.x, pivot.y, pivot.z);
    const wC = () => [BI.scab, 1], LEN = 0.605, sAt = (d, a, b) => Pm.clone().addScaledVector(ds, d).addScaledVector(ws, a || 0).addScaledVector(ns, b || 0);
    const body = (key, d0, d1, k0, k1, n) => { const pts = [], rad = []; for (let i = 0; i <= n; i++) { const d = lerp(d0, d1, i / n), f = d / LEN, tp = 1 - 0.34 * f; pts.push(sAt(d)); rad.push([0.0080 * tp * lerp(k0, k1, i / n), 0.0172 * tp * lerp(k0, k1, i / n)]); } rod(key, pts, rad, 12, wC, ns); };
    body('swordSteel', -0.002, 0.050, 1.10, 1.08, 4);                    // the silver mouth
    body('scab', 0.046, 0.535, 1, 1, 12);                                // black leather
    { const pts = [], rad = [], n = 9; for (let i = 0; i <= n; i++) { const u = i / n, d = lerp(0.530, LEN, u), tp = 1 - 0.34 * d / LEN, k = 1.08 * Math.sqrt(Math.max(0.02, 1 - Math.pow(u, 2.2))); pts.push(sAt(d)); rad.push([0.0080 * tp * k, 0.0172 * tp * k]); } rod('swordSteel', pts, rad, 12, wC, ns);
      const e = sAt(LEN + 0.004); addPart('swordSteel', spherePart(e, 0.0036, 0.0036, 0.0036, 8, 6), wC, { out: e }); }                 // the silver tip
    // two bands with a ring each, and a strap from each ring up to her belt
    const rings = [0.034, 0.170], belt = [P3s(rTorso(uS + 0.045, 0.962)), P3s(rTorso(uS + 0.105, 0.957))];
    rings.forEach((d, i) => { const f = d / LEN, tp = 1 - 0.34 * f; body('swordSteel', d - 0.006, d + 0.006, 1.16, 1.16, 2);
      const c = sAt(d, 0.0172 * tp * 1.16 + 0.0068), hoop = []; for (let j = 0; j < 14; j++) { const t = (j / 14) * TAU; hoop.push(c.clone().addScaledVector(ws, 0.0068 * Math.cos(t)).addScaledVector(ds, 0.0068 * Math.sin(t))); }
      rod('swordSteel', hoop, hoop.map(() => 0.0013), 6, wC, ns, true);
      const top = belt[i].clone().addScaledVector(V3(belt[i].x, 0, belt[i].z).normalize(), 0.006), bot = c.clone().addScaledVector(ws, 0.0068), pts = [], n = 8; for (let j = 0; j <= n; j++) pts.push(bot.clone().lerp(top, j / n));
      const cols = 7, m = n + 1; addPart('scabStrap', loft(tubeRings(pts, pts.map(() => [0.0013, 0.0052]), 6, n0), { capA: true, capB: true }), (x, y, z, k) => { const t = k < m * cols ? Math.floor(k / cols) / n : (k === m * cols ? 0 : 1); return t > 0.999 ? [BI.hips, 1] : t < 0.001 ? [BI.scab, 1] : [BI.scab, 1 - t, BI.hips, t]; }, { out: mid(pts) }); });
    // the sword at rest in the scabbard: the foot of the blade at the mouth, the blade down the scabbard, its width along the scabbard's width
    const Qsh = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ws, ds, V3().crossVectors(ws, ds)));
    const Psh = Pm.clone().addScaledVector(ds, 0.004 - Y0);
    SWK = { G1, Y0, Y1, ds, ws, ns, Pm, pivot, Qsh, Psh, LEN };
  })();
