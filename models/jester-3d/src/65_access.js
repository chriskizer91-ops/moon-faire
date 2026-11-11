
  // ---------- belt and buckle ----------
  (function buildBelt() {
    const rings = [], NU = Q(48, 24), prof2 = [[WAIST - 0.025, 0.004], [WAIST - 0.020, 0.0095], [WAIST, 0.0108], [WAIST + 0.020, 0.0095], [WAIST + 0.025, 0.004]];
    for (const [y, g] of prof2) { const [rx, rzF, rzB, cz] = prof(TORSO, y, true); rings.push(ringXZ(0, y, cz, rx + g, rzF + g, rzB + g, NU, TPW)); }
    addPart('leather', loft(rings), (x, y) => [BI.hips, 0.5, BI.spine1, 0.5], { out: V3(0, WAIST, 0) });
    const wf = () => [BI.hips, 0.5, BI.spine1, 0.5], zf = prof(TORSO, WAIST, true)[1] + 0.012;
    // buckle: a rounded gold frame and its prong
    const fr = []; for (let j = 0; j < 16; j++) { const a = (j / 16) * TAU, c = Math.cos(a), s = Math.sin(a); fr.push(V3(0.029 * Math.sign(c) * Math.pow(Math.abs(c), 0.5), WAIST + 0.0215 * Math.sign(s) * Math.pow(Math.abs(s), 0.5), zf + 0.003)); }
    fr.push(fr[0].clone());
    addPart('gold', loft(tubeRings(fr, fr.map(() => 0.0042), 8, V3(0, 0, 1))), wf, { out: V3(0, WAIST, zf + 0.1), weld: true });
    addPart('gold', loft(tubeRings([V3(-0.027, WAIST, zf + 0.005), V3(0.016, WAIST, zf + 0.007)], [0.0028, 0.002], 6), { capB: true }), wf, { out: V3(0, WAIST + 0.005, zf + 0.1) });
    for (let k = 0; k < 14; k++) {                    // studs round the belt
      const a = (k + 0.5) / 14 * TAU; if (Math.abs(Math.sin(a)) < 0.25 && Math.cos(a) > 0) continue;
      const [rx, rzF, rzB] = prof(TORSO, WAIST, true), c = V3((rx + 0.0095) * Math.sin(a), WAIST, (Math.cos(a) >= 0 ? rzF : rzB) * Math.cos(a) + Math.sign(Math.cos(a)) * 0.0095);
      addPart('gold', spherePart(c, 0.0045, 0.0045, 0.0045, 8, 5), wf, { out: c });
    }
  })();

  (function buildPouch() {
    const a = -150 * DEG, y = WAIST - 0.072, [rx, rz] = prof(SKIRT_R, y, true), c = ell(rx + 0.020, rz + 0.020, a, y, 0), wf = () => [BI.hips, 0.6, BI.spine1, 0.4];
    const yaw = Math.atan2(c.x, c.z), R = (p) => { const x = p[0], z = p[2]; return [c.x + x * Math.cos(yaw) + z * Math.sin(yaw), c.y + p[1], c.z - x * Math.sin(yaw) + z * Math.cos(yaw)]; };
    const turn = (part) => { for (let i = 0; i < part.pos.length; i += 3) { const q = R([part.pos[i], part.pos[i + 1], part.pos[i + 2]]); part.pos[i] = q[0]; part.pos[i + 1] = q[1]; part.pos[i + 2] = q[2]; } return part; };
    addPart('leather', turn(spherePart(V3(0, -0.006, 0), 0.046, 0.054, 0.021, 22, 14)), wf, { out: c });                 // the bag
    addPart('leather', turn(spherePart(V3(0, 0.028, 0.005), 0.048, 0.026, 0.021, 22, 12)), wf, { out: c });            // its flap
    addPart('gold', turn(spherePart(V3(0, 0.008, 0.0255), 0.0090, 0.0070, 0.0034, 12, 8)), wf, { out: c });            // the buckle
    addPart('leather', turn(spherePart(V3(-0.075, 0.004, -0.030), 0.030, 0.036, 0.016, 16, 10)), wf, { out: c });    // a smaller pouch behind it
    addPart('gold', turn(spherePart(V3(-0.075, 0.010, -0.013), 0.0050, 0.0050, 0.0028, 10, 6)), wf, { out: c });
    addPart('leather', turn(loft(tubeRings([V3(-0.020, 0.044, 0.004), V3(-0.020, 0.078, -0.006)], [0.006, 0.006], 6))), wf, { out: c });   // two loops to the belt
    addPart('leather', turn(loft(tubeRings([V3(0.020, 0.044, 0.004), V3(0.020, 0.078, -0.006)], [0.006, 0.006], 6))), wf, { out: c });
  })();

  // ---------- the hip bells: a beaded gold chain from the belt at her left hip, ending in a cluster of bells ----------
  // the chain lies on the front of the skirt, so each joint rests just outside the cloth
  const skirtZ = (x, y) => { const [rx, rz] = prof(SKIRT_R, y, true); return skirtZc(y) + rz * Math.sqrt(Math.max(0.05, 1 - Math.pow(x / rx, 2))); };
  const BELL_X = 0.074, BELL_Y = [0.972, 0.914, 0.856, 0.798];
  const bellRest = BELL_Y.map((y) => V3(BELL_X, y, skirtZ(BELL_X, y) + 0.036));
  const bellGeo = { bells: [] };
  (function buildBells() {
    let par = 'hips';
    for (let k = 0; k < 4; k++) { addBone('bell' + k, par, bellRest[k].x, bellRest[k].y, bellRest[k].z); par = 'bell' + k; }
    for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) { const c = bellRest[k].clone().lerp(bellRest[k + 1], (i + 0.5) / 6); addPart('bells', spherePart(c, 0.0048, 0.0052, 0.0048, 8, 6), wOne('bell' + k), { out: c }); }
    const base = SK.bell3.userData.rest, wf = wOne('bell3');
    const CL = [[0, -0.014, 0, 0.0185], [-0.019, -0.030, 0.006, 0.0195], [0.019, -0.032, 0.004, 0.019], [-0.008, -0.056, 0.010, 0.0205], [0.014, -0.062, -0.002, 0.0185], [0.0, -0.040, -0.016, 0.018]];
    for (const [dx, dy, dz, r] of CL) {
      const c = V3(base.x + dx, base.y + dy, base.z + dz);
      addPart('bells', spherePart(c, r, r, r, 16, 12), wf, { out: c });
      const lp = []; for (let j = 0; j <= 8; j++) { const a = (j / 8) * PI; lp.push(V3(c.x + 0.005 * Math.cos(a), c.y + r + 0.006 * Math.sin(a), c.z)); }
      addPart('bells', loft(tubeRings(lp, lp.map(() => 0.0015), 5)), wf, { out: V3(c.x, c.y + r + 0.004, c.z + 0.05) });
      const sl = [V3(c.x - r * 0.6, c.y - r * 0.82, c.z + r * 0.02), V3(c.x, c.y - r * 1.005, c.z + r * 0.02), V3(c.x + r * 0.6, c.y - r * 0.82, c.z + r * 0.02)];
      addPart('bellslit', loft(tubeRings(sl, [0.0016, 0.0022, 0.0016], 5)), wf, { out: V3(c.x, c.y - r * 2, c.z) });
      bellGeo.bells.push([dx, dy, dz, r]);
    }
  })();

  // ---------- pendant and chains ----------
  (function buildJewels() {
    if (PROJ) return;                                 // the necklace is in the painted bodice
    const wf = wOne('spine3'), zs = (y) => { const t = prof(TORSO, y, true); return t[3] + t[1]; };
    const pc = V3(0, 1.268, zs(1.268) + 0.010);
    addPart('gem', spherePart(pc, 0.0135, 0.0175, 0.0075, 18, 12), wf, { out: pc });
    const bz = []; for (let j = 0; j <= 20; j++) { const a = (j / 20) * TAU; bz.push(V3(pc.x + 0.0155 * Math.cos(a), pc.y + 0.0195 * Math.sin(a), pc.z - 0.002)); }
    addPart('gold', loft(tubeRings(bz, bz.map(() => 0.0032), 8, V3(0, 0, 1))), wf, { out: V3(0, pc.y, pc.z + 0.1), weld: true });
    addPart('gold', spherePart(V3(pc.x, pc.y - 0.026, pc.z - 0.001), 0.0042, 0.0055, 0.004, 8, 6), wf, { out: V3(pc.x, pc.y - 0.026, pc.z) });
    const bead = (ctrl, n, r, key) => { const pts = curvePts(ctrl, n); for (const p of pts) addPart(key, spherePart(p, r, r, r, 7, 5), (x, y) => (y > 1.34 ? [BI.neck, 0.5, BI.spine3, 0.5] : wf()), { out: p }); };
    for (const sx of [-1, 1]) bead([V3(sx * 0.050, 1.352, 0.050), V3(sx * 0.030, 1.315, zs(1.315) + 0.004), V3(sx * 0.008, 1.290, zs(1.29) + 0.006)], 10, 0.0026, 'gold');
    // the long chain: a deep V of gold beads down to the corset
    for (const sx of [-1, 1]) bead([V3(sx * 0.074, 1.318, 0.058), V3(sx * 0.062, 1.26, zs(1.26) + 0.004), V3(sx * 0.040, 1.19, zs(1.19) + 0.022), V3(sx * 0.014, 1.125, zs(1.125) + 0.012), V3(0, 1.108, zs(1.108) + 0.008)], 26, 0.0031, 'gold');
  })();

  // ---------- ruffled black cuffs: four flared tiers of lace round each forearm ----------
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], side = V3(-d.y, d.x, 0).normalize(), fw = V3(0, 0, 1);
    { const pc = sh.clone().addScaledVector(d, 0.050); addPart('wine', spherePart(pc, 0.060, 0.074, 0.062, 22, 16), () => [BI['uarm' + S], 0.7, BI['clav' + S], 0.3], { out: pc }); }      // the puff at the top of the sleeve
    for (const [ax0, Rm, r0, phs, NP] of [[0.318, 0.046, 0.026, 0.0, 9], [0.350, 0.058, 0.032, 1.7, 11], [0.386, 0.066, 0.035, 3.1, 12], [0.420, 0.062, 0.031, 4.4, 11], [0.446, 0.050, 0.022, 5.6, 10]]) {
      const NA = NP * Q(8, 4), NS = Q(12, 8), rings = [];
      for (let i = 0; i < NS; i++) {
        const f = (i / NS) * TAU, cf = Math.cos(f), sf = Math.sin(f), ring = [];
        for (let j = 0; j < NA; j++) {
          const a = (j / NA) * TAU, th = a * NP + phs + 0.5 * Math.sin(a * 3 + phs), out = Math.max(0, cf);
          const rr = r0 * (1 + out * (0.46 * Math.sin(th) + 0.20 * Math.sin(2.3 * th + 1 + phs)) + 0.12 * Math.sin(a * 3 + phs * 2) + 0.07 * Math.sin(a * 7 + f * 2)), R = Rm + rr * cf * 1.2, ax = ax0 + rr * sf * (1 + 0.25 * out * Math.cos(th));
          const c = sh.clone().addScaledVector(d, ax).addScaledVector(side, R * Math.cos(a)).addScaledVector(fw, R * Math.sin(a));
          ring.push([c.x, c.y, c.z]);
        }
        rings.push(ring);
      }
      rings.push(rings[0]);
      addPart('ruffle', loft(rings, { uS: 6, v0: 0.15, vS: 0.7 }), () => [BI['farm' + S], 1], { out: sh.clone().addScaledVector(d, ax0) });
    }
    for (const [ax, nb, rr0] of [[0.452, 15, 0.0320], [0.464, 14, 0.0305]]) for (let j = 0; j < nb; j++) {      // two strands of beads at the wrist
      const a = (j / nb) * TAU + ax * 40, c = sh.clone().addScaledVector(d, ax).addScaledVector(side, rr0 * Math.cos(a)).addScaledVector(fw, rr0 * 0.86 * Math.sin(a));
      addPart(j % 5 === 2 ? 'gold' : 'pearl', spherePart(c, 0.0060, 0.0060, 0.0060, 8, 6), () => [BI['farm' + S], 1], { out: c });
    }
  }

  // ---------- the front drape: a short black swag from the belt across her hips (a small sheet of its own) ----------
  let apronCloth;
  (function buildApron() {
    const NC = Q(33, 17), NR = Q(20, 10), cols = [];
    for (let c = 0; c < NC; c++) {
      const u = lerp(-1, 1, c / (NC - 1)), a = PI + u * 64 * DEG, col = [], drop = 0.075 + 0.27 * Math.pow(1 - u * u, 0.9);
      for (let r = 0; r < NR; r++) {
        const v = r / (NR - 1), y = WAIST - 0.007 - v * drop, [rx, rz] = prof(SKIRT_R, y, true), g = 0.030 + 0.016 * Math.sin(v * PI * 4.2 - 1.2 * u * u) * (1 - u * u) * (0.4 + 0.6 * v);
        const p = ell(rx + g, rz + g, a, y, skirtZc(y)); col.push([p.x, p.y, p.z]);
      }
      cols.push(col);
    }
    apronCloth = makeCloth({ cols: NC, rows: NR, mask: 1 | 4, margin: 0.033, bend: 0.25, grav: 0.8, drag: 0.03, flutter: 0.35,
      rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.4 : 0), weights: () => [BI.hips, 0.6, BI.spine1, 0.4] });
    addCut(apronCloth, sheen(new THREE.MeshStandardMaterial({ map: fabricTex(256, '#2a2228', '#41343e', '#141014', 2), side: THREE.DoubleSide, roughness: 0.95 }), '#94848e', 2.2, 0.4), 2);
    apronCloth.meshes.forEach((m) => { m.visible = false; });      // Chris: take the swag away (November 11)
  })();
