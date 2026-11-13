  // ---------- her bow (painting G1 open, G2 folded): moonsteel, open filigree limbs, a string of light ----------
  // The bow is built open and upright in a place of its own beside her. There, up the grip is +Y, the way the arrow flies is +X and
  // the bow's thin side is Z. Every bow bone rests there unrotated, so the turn given to the bone 'bow' is the bow's turn in the world
  // and its place is the middle of the grip.
  // Each limb is a chain of twelve bones along its length. Turning each a little about Z rolls the limb up toward its tip, the way a
  // fern frond is rolled: that is how the bow folds. It unrolls from the grip outward, so the tight curl rides out on a stem that is
  // already straight and never sweeps across her hand.
  // Sizes: 96 cm from tip to tip (read off her figure in H2), 37 cm folded. The grip fits her fist.
  let BOWK = null;
  (function () {
    const G0 = V3(1.6, 1.2, 0), K = 12, wB = () => [BI.bow, 1];
    addBone('bow', null, G0.x, G0.y, G0.z);
    const at = (a, f, z) => V3(G0.x + f, G0.y + a, G0.z + (z || 0));
    const mid = (pts) => pts.reduce((m, p) => m.add(p), V3()).multiplyScalar(1 / pts.length);
    // a tube through points; radii are [across the bow's thin side, in the bow's own plane]
    const rod = (key, pts, radii, n, wf, closed, up) => { const P = closed ? pts.concat([pts[0].clone()]) : pts, Rr = closed ? radii.concat([radii[0]]) : radii;
      addPart(key, loft(tubeRings(P, Rr, n, up || V3(0, 0, 1)), closed ? {} : { capA: true, capB: true }), wf, { out: mid(pts) }); };

    // ---- the grip: dark blue leather wound round it, a moonsteel collar at each end ----
    { const n = 64, pts = [], rad = [];
      for (let i = 0; i <= n; i++) { const a = lerp(-0.0485, 0.0485, i / n), waist = 1 - 0.07 * Math.cos(a / 0.0485 * PI / 2), wind = 1 + 0.035 * Math.sin(a / 0.0058 * TAU); pts.push(at(a, 0)); rad.push([0.0142 * waist * wind, 0.0120 * waist * wind]); }
      rod('bowWrap', pts, rad, 14, wB, false, V3(1, 0, 0));
      for (const sg of [1, -1]) { const prof = [[0.0455, 0.0146], [0.0475, 0.0166], [0.0515, 0.0166], [0.0535, 0.0148], [0.0555, 0.0160], [0.0575, 0.0142], [0.0610, 0.0096]];
        rod('moon', prof.map(([a]) => at(sg * a, 0)), prof.map(([, r]) => [r, r * 0.86]), 14, wB, false, V3(1, 0, 0)); } }

    // ---- a crescent at each end of the grip, holding a round blue gem ----
    for (const sg of [1, -1]) {
      const Hc = [sg * 0.082, 0.004], gem = at(sg * 0.0765, 0.004), ring = [], rr = [];
      for (let j = 0; j < 30; j++) { const t = (j / 30) * TAU; ring.push(at(Hc[0] + sg * 0.026 * Math.cos(t), Hc[1] + 0.026 * Math.sin(t))); rr.push([0.0048, 0.0052 - 0.0026 * Math.cos(t)]); }      // thick toward the grip, thin at the far side
      rod('moon', ring, rr, 8, wB, true);
      const bez = []; for (let j = 0; j < 20; j++) { const t = (j / 20) * TAU; bez.push(at(sg * 0.0765 + 0.0140 * Math.cos(t), 0.004 + 0.0140 * Math.sin(t))); }
      rod('moon', bez, bez.map(() => [0.0034, 0.0021]), 6, wB, true);
      addPart('bowGem', spherePart(gem, 0.0124, 0.0124, 0.0088, 14, 9), wB, { out: gem });
    }

    // ---- the limbs ----
    // The middle line of a limb, in the bow's own measure: [along the bow, toward the target]. It leaves the crescent going forward,
    // sweeps back to the string, and ends in a small curl.
    const CTRL = [[0.098, 0.020], [0.135, 0.050], [0.180, 0.060], [0.235, 0.046], [0.290, 0.014], [0.345, -0.028], [0.400, -0.068], [0.440, -0.094], [0.466, -0.104], [0.482, -0.096], [0.487, -0.080], [0.477, -0.069], [0.466, -0.074], [0.464, -0.084]];
    const NS = 300, CL = curvePts(CTRL.map(([a, f]) => V3(f, a, 0)), NS), arc = [0];
    for (let i = 1; i < NS; i++) arc.push(arc[i - 1] + CL[i].distanceTo(CL[i - 1]));
    let iLow = 0; for (let i = 1; i < NS; i++) if (CL[i].x < CL[iLow].x) iLow = i;
    const Lm = arc[iLow], Lt = arc[NS - 1];
    const cAt = (t) => { t = cl(t, 0, Lt); let i = 1; while (i < NS - 1 && arc[i] < t) i++; const u = (t - arc[i - 1]) / Math.max(1e-9, arc[i] - arc[i - 1]);
      const p = CL[i - 1].clone().lerp(CL[i], u), tg = CL[Math.min(NS - 1, i + 1)].clone().sub(CL[Math.max(0, i - 2)]).normalize(); return { p, tg, nn: V3(tg.y, -tg.x, 0) }; };
    // near the grip a limb is two rails with a vine between them; they close into one stem six tenths of the way out
    const W0 = 0.040, tm = 0.60 * Lm, wid = (t) => (t >= tm ? 0 : W0 * Math.pow(Math.cos(0.5 * PI * t / tm), 0.8));
    const tips = {}, chains = {};
    for (const [nm, sg] of [['U', 1], ['D', -1]]) {
      const Rp = (p) => V3(G0.x + p.x, G0.y + sg * p.y, G0.z + p.z), names = [];
      for (let k = 0; k < K; k++) { const r = Rp(cAt(Lm * k / K).p); addBone('bow' + nm + k, k ? 'bow' + nm + (k - 1) : 'bow', r.x, r.y, r.z); names.push(BI['bow' + nm + k]); }
      chains[nm] = names;
      // a point at arc length t follows the joint nearest it and its neighbour, shared evenly at the joint, so a bend is a smooth arc
      const wAt = (t) => { const q = cl(t / Lm, 0, 1) * K, m = Math.min(K - 1, Math.round(q)), w = sm(-0.5, 0.5, q - m); return w > 0.999 ? [names[m], 1] : [m ? names[m - 1] : BI.bow, 1 - w, names[m], w]; };
      const run = (ts, off, rad, n) => { const pts = ts.map((t) => { const c = cAt(t); return Rp(c.p.addScaledVector(c.nn, off(t))); }), cols = n + 1, m = ts.length;
        addPart('moon', loft(tubeRings(pts, ts.map(rad), n, V3(0, 0, 1)), { capA: true, capB: true }), (x, y, z, i) => wAt(ts[i < m * cols ? Math.floor(i / cols) : (i === m * cols ? 0 : m - 1)]), { out: mid(pts) }); };
      const span = (a, b, n) => { const o = []; for (let i = 0; i <= n; i++) o.push(lerp(a, b, i / n)); return o; };
      const rA = (t) => { const r = t < tm ? lerp(0.0050, 0.0058, sm(0.6 * tm, tm, t)) : lerp(0.0058, 0.0026, (t - tm) / (Lt - tm)); return [r * 0.85, r]; };
      run(span(0, Lt, 84), (t) => wid(t) / 2, rA, 7);                                    // the outer rail, which carries on as the stem and the curl
      run(span(0, tm, 34), (t) => -wid(t) / 2, (t) => [0.0038, 0.0045], 6);             // the inner rail
      run(span(0.02 * Lm, tm - 0.012, 40), (t) => 0.34 * wid(t) * Math.sin(TAU * 2.25 * t / tm + 0.6), () => [0.0021, 0.0022], 5);      // the vine
      { const e = Rp(CL[NS - 1].clone()); addPart('moon', spherePart(e, 0.0044, 0.0044, 0.0038, 8, 6), () => [names[K - 1], 1], { out: e }); }
      // small blade-shaped leaves: four on the vine, five along the stem
      const leaf = (t, off, side, len, wd, tilt) => { const c = cAt(t), base = c.p.clone().addScaledVector(c.nn, off), ang = side * 42 * DEG, cs = Math.cos(ang), sn = Math.sin(ang);
        const d = V3(c.tg.x * cs - c.tg.y * sn, c.tg.x * sn + c.tg.y * cs, tilt).normalize(), perp = V3(-d.y, d.x, 0).normalize(), pts = [], rad = [], n = 7, w = wAt(t);
        for (let i = 0; i <= n; i++) { const u = i / n, g = Math.pow(u, 0.6) * Math.pow(1 - u, 0.9) / 0.40; pts.push(Rp(base.clone().addScaledVector(d, len * u).addScaledVector(perp, -side * 0.18 * len * u * u))); rad.push([0.0016, Math.max(0.0005, wd * Math.min(1, g))]); }
        addPart('moon', loft(tubeRings(pts, rad, 6, V3(0, 0, 1)), { capA: true, capB: true }), () => w, { out: mid(pts) }); };
      const vineOff = (t) => 0.34 * wid(t) * Math.sin(TAU * 2.25 * t / tm + 0.6);
      [[0.13, 1], [0.27, -1], [0.40, 1], [0.52, -1]].forEach(([f, sd], i) => leaf(f * Lm, vineOff(f * Lm), sd, 0.027, 0.0062, 0.10 * (i % 2 ? -1 : 1)));
      [[0.60, 1], [0.68, -1], [0.76, 1], [0.84, -1], [0.92, 1]].forEach(([f, sd], i) => leaf(f * Lm, sd * 0.004, sd, lerp(0.040, 0.026, i / 4), lerp(0.0078, 0.0054, i / 4), 0.16 * (i % 2 ? 1 : -1)));
      tips[nm] = Rp(CL[iLow].clone());
    }
    const th = (k) => (20 + 36 * k / (K - 1)) * DEG;
    // open: 0 rolled up, 1 open. flex: how far the string is drawn (the limbs give a little). shake: a small wobble, in radians.
    const set = (open, flex, shake) => {
      for (const [nm, sg] of [['U', 1], ['D', -1]]) for (let k = 0; k < K; k++) { const b = SK['bow' + nm + k], e0 = 0.55 * k / K, fk = 1 - sm(e0, e0 + 0.45, open);
        b.rotation.set(0, 0, sg * (th(k) * fk + (k >= 3 ? 1.5 * DEG * (flex || 0) : 0) + (shake || 0) * (k / K)));
        if (k === 0) { b.position.copy(b.userData.home); b.position.z += sg * 0.0105 * fk; } }       // rolled up, the two curls lie one each side of the crescents
    };
    BOWK = { G0, K, at, tips, tipBone: { U: 'bow' + 'U' + (K - 1), D: 'bow' + 'D' + (K - 1) }, set, stringF: CL[iLow].x, nockA: 0.045, hubA: 0.085 };
  })();
