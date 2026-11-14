  // ---------- her two throwing knives and their sheath (painting G5; worn as in G6) ----------
  // Each knife is one piece of moonsteel, 20 cm long: a ring at the end with a crescent moon in it, a short handle bound in dark blue
  // cord between two collars, and a leaf-shaped blade. Like the bow and the sword, each is built in a place of its own and has one bone
  // ('knifeR', 'knifeL', children of 'root'): up the blade is +Y, the blade's width is along X and its flats face Z. The bone rests at
  // the middle of the handle. The sheath is black leather: two pockets side by side, a band across their mouths with a blue stud, and
  // two loops over her belt. It sits at the small of her back, handles up, on 'hips'.
  let KNK = null;
  (function () {
    const mid = (pts) => pts.reduce((m, p) => m.add(p), V3()).multiplyScalar(1 / pts.length), XU = V3(1, 0, 0), ZU = V3(0, 0, 1);
    const rod = (key, pts, radii, n, wf, up, closed) => { const P = closed ? pts.concat([pts[0].clone()]) : pts, Rr = closed ? radii.concat([radii[0]]) : radii;
      addPart(key, loft(tubeRings(P, Rr, n, up), closed ? {} : { capA: true, capB: true }), wf, { out: mid(pts) }); };
    const facets = (key, tris, c0, wf) => { const pos = [], nor = [], idx = [];
      for (const [a, b0, c1] of tris) { let b = b0, c = c1; const n = b.clone().sub(a).cross(c.clone().sub(a)); if (n.lengthSq() < 1e-18) continue; n.normalize(); if (n.dot(a.clone().add(b).add(c).multiplyScalar(1 / 3).sub(c0)) < 0) { n.negate(); const t = b; b = c; c = t; }
        for (const p of [a, b, c]) { idx.push(pos.length / 3); pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); } }
      addPart(key, { pos, idx }, wf, { nor }); };
    const names = ['knifeR', 'knifeL'], Y0 = 0.0262, Y1 = 0.145;
    names.forEach((nm, i) => {
      const G0 = V3(1.6 + 0.15 * i, 1.2, -0.6); addBone(nm, null, G0.x, G0.y, G0.z);
      const wK = () => [BI[nm], 1], at = (x, y, z) => V3(G0.x + x, G0.y + y, G0.z + (z || 0));
      // the handle, bound in cord, and a collar at each end of it
      { const n = 30, pts = [], rad = []; for (let j = 0; j <= n; j++) { const y = lerp(-0.019, 0.019, j / n), rip = 1 + 0.06 * Math.sin(y / 0.0044 * TAU); pts.push(at(0, y)); rad.push([0.0063 * rip, 0.0053 * rip]); } rod('knifeCord', pts, rad, 10, wK, XU);
        for (const sg of [1, -1]) { const prof = [[0.0178, 0.0066], [0.0198, 0.0079], [0.0236, 0.0079], [0.0264, 0.0062]]; rod('knifeSteel', prof.map(([y]) => at(0, sg * y)), prof.map(([, r]) => [r, r * 0.84]), 10, wK, XU); } }
      // the ring, with a crescent moon standing in it
      { const cy = -0.0398, ring = [], cres = [], cr = []; for (let j = 0; j < 26; j++) { const t = (j / 26) * TAU; ring.push(at(0.0118 * Math.cos(t), cy + 0.0118 * Math.sin(t))); }
        rod('knifeSteel', ring, ring.map(() => [0.0022, 0.0030]), 7, wK, ZU, true);
        for (let j = 0; j <= 16; j++) { const t = lerp(62, 298, j / 16) * DEG, k = Math.max(0.12, Math.sin(PI * j / 16)); cres.push(at(-0.0020 + 0.0070 * Math.cos(t), cy + 0.0070 * Math.sin(t))); cr.push([0.0016, 0.0024 * k]); }
        rod('knifeSteel', cres, cr, 6, wK, ZU); }
      // the blade: a leaf, widest a fifth of the way along, drawn out to a long point
      { const wAt = (u) => (u < 0.2 ? lerp(0.0112, 0.0262, sm(0, 0.2, u)) : 0.0262 * Math.pow(1 - (u - 0.2) / 0.8, 0.85)), tAt = (u) => 0.0044 * (1 - 0.5 * u);
        const us = [0, 0.07, 0.14, 0.2, 0.3, 0.45, 0.6, 0.75, 0.88, 0.96], rings = us.map((u) => { const y = lerp(Y0, Y1, u), w = wAt(u) / 2, t = tAt(u) / 2; return [at(w, y, 0), at(0, y, t), at(-w, y, 0), at(0, y, -t)]; }), tip = at(0, Y1), tris = [];
        for (let a = 0; a < rings.length - 1; a++) for (let j = 0; j < 4; j++) { const k = (j + 1) % 4; tris.push([rings[a][j], rings[a + 1][j], rings[a + 1][k]]); tris.push([rings[a][j], rings[a + 1][k], rings[a][k]]); }
        const last = rings[rings.length - 1]; for (let j = 0; j < 4; j++) tris.push([last[j], tip, last[(j + 1) % 4]]);
        facets('knifeBlade', tris, at(0, (Y0 + Y1) / 2), wK); }
    });

    // ---- the sheath, at the small of her back just under her belts ----
    const wH = () => [BI.hips, 1], yM = 0.930, zb = (y) => rTorso(0, y)[2], dn = V3(0, -1, -0.22).normalize(), nb = V3(0, 0.22, -1).normalize(), lat = V3(1, 0, 0);       // down the sheath (its foot a little further back, over her seat); out from her back; along her belt
    const Cm = V3(0, yM, Math.min(zb(yM), zb(yM + 0.03))).addScaledVector(nb, 0.005), sheath = [];
    for (const sg of [-1, 1]) {                                                    // -1: the knife for her right hand
      const M = Cm.clone().addScaledVector(lat, sg * 0.027), ax = dn.clone().addScaledVector(lat, -sg * 0.17).normalize(), pts = [], rad = [], n = 12;
      for (let j = 0; j <= n; j++) { const u = j / n, k = u < 0.22 ? 1 : Math.pow(Math.max(0.02, 1 - (u - 0.22) / 0.78), 0.9); pts.push(M.clone().addScaledVector(ax, -0.004 + 0.134 * u)); rad.push([0.0068 * (0.5 + 0.5 * k), 0.0180 * k]); }
      rod('sheath', pts, rad, 10, wH, nb);
      const xk = lat.clone().multiplyScalar(-sg).addScaledVector(ax, sg * lat.dot(ax)).normalize();       // each knife lies with this side toward her spine, so each hand finds its own
      sheath.push({ P: M.clone().addScaledVector(ax, 0.002 - Y0), Q: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xk, ax, V3().crossVectors(xk, ax))), ax });
    }
    { const pts = [], rad = [], n = 10; for (let j = 0; j <= n; j++) { const u = j / n - 0.5; pts.push(Cm.clone().addScaledVector(lat, u * 0.104).addScaledVector(dn, 0.010 + 0.008 * (1 - Math.abs(u) * 2)).addScaledVector(nb, 0.0035)); rad.push([0.0034, 0.0165]); }
      rod('sheath', pts, rad, 8, wH, nb);                                           // the band across the two mouths
      const edge = pts.map((p) => p.clone().addScaledVector(dn, -0.0165).addScaledVector(nb, 0.002)); rod('knifeSteel', edge, edge.map(() => 0.0011), 5, wH, nb);
      const g = Cm.clone().addScaledVector(dn, 0.016).addScaledVector(nb, 0.0075), bz = []; addPart('knifeGem', spherePart(g, 0.0058, 0.0058, 0.0040, 10, 7), wH, { out: g });
      for (let j = 0; j < 14; j++) { const t = (j / 14) * TAU; bz.push(g.clone().addScaledVector(lat, 0.0066 * Math.cos(t)).addScaledVector(dn, 0.0066 * Math.sin(t))); } rod('knifeSteel', bz, bz.map(() => 0.0012), 5, wH, nb, true);
      for (const sg of [-1, 1]) { const b = Cm.clone().addScaledVector(lat, sg * 0.047).addScaledVector(nb, 0.004), lp = [], m = 6; for (let j = 0; j <= m; j++) lp.push(b.clone().addScaledVector(dn, 0.020 - 0.066 * j / m).addScaledVector(nb, 0.004 * Math.sin(PI * j / m)));
        rod('sheath', lp, lp.map(() => [0.0022, 0.0095]), 8, wH, nb);                 // a loop over her belt, with a snap
        const sn = b.clone().addScaledVector(dn, 0.012).addScaledVector(nb, 0.0045); addPart('knifeSteel', spherePart(sn, 0.0042, 0.0042, 0.0022, 8, 5), wH, { out: sn }); } }
    KNK = { names, Y0, Y1, sheath, pull: 0.135 };
  })();
