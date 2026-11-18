// D1, the Moonlit festival gown (D1A.png, D1B.png): a fitted bodice of matte midnight-blue velvet with a wide, gentle square neckline
// edged in silver braid; long fitted sleeves to her wrists, each ending in a small flare over the back of her hand; a full skirt from
// her natural waist falling in soft, heavy folds to her ankles, a band of silver embroidery (crescent moons and stars) round its hem;
// a narrow silver ribbon round her waist tied in a small bow at the back, its two ends hanging to her hips; dark-blue velvet slippers
// with round toes. The braid and the embroidery come from the paintings; the folds are real shape.
// The back painting's figure stands on a higher row than the front's and side's (its feet are drawn foreshortened): its sole mark is
// set in D1_prep.json so its neckline, ribbon and hem land at the same heights as in the front and side paintings.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.D1 = {
  name: 'Moonlit festival gown', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smin, smax, prof, DOLL } = W;
    const F = W.F, Fs = W.Fsnug;
    const LIFT = 0.004;                                   // the slippers' soles: she stands this much higher

    // ----- materials: velvet (soft, low sheen, deep colour), satin ribbon -----
    const VC = '#ccd2ff';
    const velvet = W.paint({ rough: 0.93, emis: 0.32, env: 0.10, color: VC });
    const velvetD = W.paint({ rough: 0.93, emis: 0.34, env: 0.10, color: VC, double: true });
    const velvetS = W.paint({ rough: 0.90, emis: 0.32, env: 0.10, color: VC, double: true });
    const slipperMat = W.std({ color: W.lin('#262c4a'), roughness: 0.88, envMapIntensity: 0.15 });
    const satin = W.std({ color: W.lin('#b9bac4'), roughness: 0.34, metalness: 0.35, envMapIntensity: 0.75 });

    // ----- small geometry helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    function orient(g, rings) {                           // flip a loft's triangles if its middle ring faces inward
      const nor = W.computeNormals(g.pos, g.idx), m = Math.floor(rings.length / 2), r = rings[m], n = r.length, cols = n + 1;
      const c = r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]); let s = 0;
      for (let j = 0; j < n; j++) { const v = m * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    // a ribbon: points with a width direction w and a face direction n; a flat rounded box in section
    function ribbon(P) {
      const rings = [], NV = 12;
      for (const q of P) { const ring = [];
        for (let j = 0; j < NV; j++) { const a = (j / NV) * TAU, ca = Math.cos(a), sa = Math.sin(a), cx = Math.sign(ca) * Math.pow(Math.abs(ca), 0.35), sy = Math.sign(sa) * Math.pow(Math.abs(sa), 0.35);
          ring.push(add(add(q.p, q.w, q.hw * cx), q.n, q.ht * sy)); } rings.push(ring); }
      return orient(W.loft(rings, { capA: true, capB: true }), rings);
    }

    // a smooth curve through keys [[x, [values]], ...] (Catmull-Rom; the shared prof() eases to a stop at every key, which shows as ridges)
    function cprof(K, x) {
      if (K[0][0] > K[K.length - 1][0]) K = K._r || (K._r = K.slice().reverse());
      const n = K.length; if (x <= K[0][0]) return K[0][1]; if (x >= K[n - 1][0]) return K[n - 1][1];
      let i = 1; while (K[i][0] < x) i++;
      const x0 = K[i - 1][0], x1 = K[i][0], u = (x - x0) / (x1 - x0), A = K[Math.max(0, i - 2)], B = K[i - 1], C = K[i], D = K[Math.min(n - 1, i + 1)];
      return B[1].map((b, j) => { const c = C[1][j], m0 = (c - A[1][j]) / (C[0] - A[0]) * (x1 - x0), m1 = (D[1][j] - b) / (D[0] - B[0]) * (x1 - x0), u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * b + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * c + (u3 - u2) * m1; });
    }

    // ======================= the bodice =======================
    // from her waist (under the ribbon) to a wide square neckline, front and back; over her shoulders between the two
    const WAIST = 1.064;
    const NX = (z) => lerp(0.1125, 0.1055, sm(-0.04, 0.03, z));          // the neckline's straight sides (half width)
    const NY = (z) => lerp(1.247, 1.255, sm(-0.04, 0.03, z));            // its straight bottom, back and front
    const topB = (x, z) => {
      const ax = Math.abs(x), X = NX(z), Y = NY(z);
      const corner = 0.010 * Math.pow(sm(X - 0.012, X, ax), 2);         // the corners a little rounded
      return lerp(Y + corner, 1.62, sm(X - 0.0015, X + 0.0015, ax));
    };
    const bodR = (x, y, z) => Math.max(WAIST - y, y - topB(x, z));
    const bodTh = (x, y, z) => { const e = topB(x, z) - y; return 0.0034 + 0.0010 * sm(0.010, 0.003, e); };   // the braided edge stands a little proud
    W.snug('d1Bodice', bodR, bodTh, [-0.185, 0.185, 1.050, 1.425, -0.135, 0.125], 0.0034, { mat: velvetD });

    // ======================= the sleeves =======================
    // fitted tubes from over the ball of her shoulder to her wrist, flaring a little at the cuff, longest over the back of her hand;
    // the cuff turned in, so it has thickness
    const SLE = (a) => 0.452 + 0.016 * Math.pow(Math.max(0, Math.cos(a)), 1.5);       // where the cuff ends (a 0: the back of her hand)
    const sl0 = (a) => lerp(-0.052, 0.046, Math.pow((1 - Math.cos(a)) / 2, 2));
    const slOff = (sl, a) => {
      const fl = Math.pow(sm(0.345, 0.465, sl), 1.3);
      return 0.0026 + 0.0014 * sm(-0.03, 0.0, sl) + 0.0016 * sm(0.0, 0.08, sl) + 0.0010 * sm(0.30, 0.10, sl) * Math.max(0, Math.cos(a))
        + fl * (0.017 + 0.008 * Math.max(0, Math.cos(a)) + 0.004 * Math.max(0, -Math.sin(a)));
    };
    const TH = 0.0030;
    const sleeveData = {};
    for (const S of ['R', 'L']) {
      const NU = 44, NR = 46, rings = [], SLs = [];
      const pt = (sl, a, e) => { const p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), c3 = W.armPt(S, sl, PI / 2), c4 = W.armPt(S, sl, 1.5 * PI);
        const ax = [(c1[0] + c2[0] + c3[0] + c4[0]) / 4, (c1[1] + c2[1] + c3[1] + c4[1]) / 4, (c1[2] + c2[2] + c3[2] + c4[2]) / 4];
        return add(p, norm([p[0] - ax[0], p[1] - ax[1], p[2] - ax[2]]), e); };
      const row = (f, dsl, de) => { const ring = [], sls = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, s0 = sl0(a), s1 = SLE(a), sl = (f == null ? s1 : lerp(s0, s1, f)) + (dsl || 0);
          ring.push(pt(sl, a, slOff(Math.min(sl, s1), a) + (de || 0))); sls.push([sl, a]); }
        rings.push(ring); SLs.push(sls); };
      for (let i = 0; i <= NR; i++) { const t = i / NR; row(1 - Math.pow(1 - t, 1.25)); }
      row(null, 0.0016, -TH / 2); row(null, 0, -TH); row(null, -0.022, -TH);        // the cuff's rounded edge, then its inside turned up 2.2 cm
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      sleeveData[S] = { nRows: rings.length, cols };
      W.part('d1Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, 0.2); const [sl, a] = SLs[r][j % NU];
        const wa = W.wArmSL(S, cl(sl, 0.0, 0.446), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.5 * sm(0.03, -0.020, sl)) : wa; }, { mat: velvetS });
    }

    // ======================= the skirt =======================
    const SKC = -0.006, TOP = 1.074, HEM = 0.150;
    // her body's outline round the skirt's middle line, by height and angle (from outside in, so her legs count as one)
    const NA = 72, YB0 = 1.10, YB1 = 0.62, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; let fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    // the painted outline (half width, front and back from the middle line), less the folds that stand out of it
    const FL = [[1.06, [0.100, 0.070, 0.060]], [1.00, [0.132, 0.098, 0.100]], [0.96, [0.148, 0.110, 0.116]], [0.90, [0.177, 0.124, 0.128]], [0.85, [0.190, 0.133, 0.135]],
      [0.80, [0.201, 0.142, 0.142]], [0.70, [0.221, 0.156, 0.152]], [0.60, [0.242, 0.170, 0.166]], [0.50, [0.260, 0.182, 0.180]], [0.40, [0.280, 0.192, 0.191]],
      [0.30, [0.294, 0.201, 0.200]], [0.20, [0.300, 0.214, 0.208]], [0.15, [0.300, 0.216, 0.210]]];
    const gAmp = (y) => lerp(0.0022, 0.022, Math.pow(sm(TOP, HEM, y), 0.75));
    const flareR = (y, a) => { const v = cprof(FL, y), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2], k = 0.85 * gAmp(y);
      return 1 / Math.sqrt((s / (v[0] - k)) * (s / (v[0] - k)) + (c / (rz - k)) * (c / (rz - k))); };
    const clear = (y) => lerp(0.0040, 0.009, sm(1.07, 0.92, y));
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), 0.035);
    // soft, heavy folds: few and deep toward the hem, finer gathers under the ribbon
    const fold = (a, y) => { const t = sm(TOP, HEM, y), ph = 0.45 * t * Math.sin(2 * a + 0.4);
      const fine = Math.sin(a * 44 + 0.3), main = 0.70 * Math.sin(a * 22 + ph + 0.7 * Math.sin(a * 3)) + 0.30 * Math.sin(a * 35 + 1.3 + ph * 1.5);
      return lerp(fine, main, sm(0.0, 0.22, t)); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    const envR = (y, a) => baseR(y, a) + gAmp(y);
    const hemY = (a) => HEM + 0.003 * Math.sin(a * 3 + 1) - 0.004 * (0.5 + 0.5 * fold(a, HEM));
    let skirtRows = 0, skirtCols = 0;
    {
      const NU = 176, ys = [];
      const NV = 56; for (let i = 0; i <= NV; i++) { const t = i / NV; ys.push(lerp(TOP, HEM, t * t * 0.35 + t * 0.65)); }
      const rings = [];
      const at = (y, a, dr) => { const r = skirtR(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
      // the gathered top edge, rolled inward (under the ribbon)
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(TOP + 0.002, a, -0.0025)); } rings.push(ring); }
      for (const y of ys) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, yy = y === HEM ? hemY(a) : lerp(y, hemY(a), sm(TOP, HEM, y) * sm(0.40, HEM, y)); ring.push(at(yy, a)); } rings.push(ring); }
      // the hem: a rounded edge, then turned up inside 3 cm
      { const r0 = [], r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemY(a); r0.push(at(h - 0.0015, a, -0.0018)); r1.push(at(h + 0.0005, a, -0.0040)); r2.push(at(h + 0.030, a, -0.0045)); } rings.push(r0, r1, r2); }
      const g = W.loft(rings, {});
      skirtRows = rings.length; skirtCols = NU + 1;
      W.part('d1Skirt', g, (x, y, z) => W.wSkirt(x, y, z), { mat: velvetD });
    }

    // ======================= the ribbon, its bow and its ends =======================
    const RB0 = 1.067, RB1 = 1.080;
    W.snug('d1Ribbon', (x, y, z) => Math.max(RB0 - y, y - RB1), () => 0.0074, [-0.175, 0.175, 1.056, 1.091, -0.135, 0.125], 0.0032, { mat: satin });
    {
      const yk = (RB0 + RB1) / 2, zk = SKC - (bodyR(yk, PI) + 0.0074 + 0.004), wk = W.wBody(0, yk, -0.07), parts = [];
      const RW = 0.0062, RT = 0.0010;                     // the ribbon's half width and half thickness
      // the knot: a short band wrapped round
      { const P = []; for (let k = 0; k <= 16; k++) { const ph = (k / 16) * TAU, c = [0, yk + 0.0065 * Math.sin(ph), zk - 0.0035 + 0.0045 * Math.cos(ph)]; P.push({ p: c, w: [1, 0, 0], n: norm([0, Math.sin(ph), Math.cos(ph)]), hw: 0.0075, ht: RT }); } parts.push(ribbon(P)); }
      // two loops, lying out to the sides and a little up
      for (const s of [-1, 1]) { const P = [], L = 0.036;
        const loopPt = (ph) => [s * (0.006 + L * (1 - Math.cos(ph)) / 2), yk + 0.001 + 0.004 * (1 - Math.cos(ph)) / 2, zk - 0.004 - 0.0060 * Math.sin(ph) * s];
        for (let k = 0; k <= 26; k++) { const ph = (k / 26) * TAU, p = loopPt(ph), q = loopPt(ph + 0.01), t = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), w = norm(cross(t, [0, 0, 1])), n = cross(t, w);
          P.push({ p, w, n, hw: RW + 0.0060 * Math.pow((1 - Math.cos(ph)) / 2, 1.5), ht: RT }); }
        parts.push(ribbon(P)); }
      W.part('d1Bow', merge(parts), () => wk, { mat: satin });
      // the two ends, hanging down the back of the skirt to her hips, cut on the slant
      const ends = [];
      for (const [s, yEnd] of [[-1, 0.806], [1, 0.792]]) { const P = [], N = 26;
        for (let k = 0; k <= N; k++) { const t = k / N, y = lerp(yk - 0.004, yEnd, t), x = s * (0.004 + 0.016 * sm(0, 0.6, t)), a = PI - x / 0.16;
          const r = (y > 1.0 ? Math.max(bodyR(y, a) + 0.0074 + 0.004, envR(y, a) + 0.0025) : envR(y, a) + 0.0028) + 0.0015 * Math.sin(t * 6 + s);
          P.push({ p: [x, y, SKC + r * Math.cos(a)], w: [Math.cos(a), 0, -Math.sin(a) * 0], n: [0, 0, -1], hw: RW, ht: RT }); }
        const last = P[P.length - 1]; last.p = [last.p[0], last.p[1] - 0.005 * s, last.p[2]];
        ends.push(ribbon(P)); }
      W.part('d1RibbonEnds', merge(ends), (x, y, z) => W.mixW(W.wBody(x, y, z + 0.03), W.wSkirt(x, y, z), sm(1.06, 0.98, y)), { mat: satin });
    }

    // ======================= the slippers =======================
    // velvet ballet slippers: a thin shell round her foot, its toe a smooth round box over her toes (they do not show through), cut low
    // round the opening, which shows the top of her foot; a thin flat sole the shape of her foot under it
    // the toe box in the foot's own frame (X out to her little toe, Z forward from her ankle): inner edge, outer edge, height above her sole
    const TOE = [[0.060, [-0.036, 0.048, 0.066]], [0.090, [-0.043, 0.053, 0.056]], [0.110, [-0.046, 0.052, 0.047]], [0.130, [-0.044, 0.050, 0.040]],
      [0.150, [-0.043, 0.041, 0.035]], [0.165, [-0.041, 0.030, 0.031]], [0.178, [-0.038, 0.017, 0.027]], [0.188, [-0.032, 0.004, 0.024]], [0.196, [-0.020, -0.006, 0.021]]];
    const S0 = W.SOLE, L2 = [0, 0];
    const toeD = (X, Y, Z) => {
      const v = cprof(TOE, Z), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.008, ry = Math.max(0.004, v[2] - 0.008);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.012, q = Math.pow(Math.pow(ux, 2.4) + Math.pow(uy, 2.4), 1 / 2.4);
      return smax((q - 1) * Math.min(rx, Y > yc ? ry : 0.012), smax(0.07 - Z, Z - 0.1995, 0.006), 0.004);
    };
    // the opening's edge: a low heel counter, low sides, and the vamp over her toes (rounded in plan)
    const cutY = (X, Z) => S0 + lerp(0.036, 0.025, sm(-0.06, -0.02, Z)) + 0.10 * sm(0.092, 0.128, Z + 1.6 * X * X);
    // made once for her left foot, and mirrored for her right (her feet are mirror images)
    {
      const s = 1;
      const G = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const cy = y - cutY(X, Z); if (cy > 0.006) return cy; if (Z < -0.085 || Z > 0.215 || X < -0.075 || X > 0.085) return 0.01;
        const foot = Math.min(DOLL.fFoot(s, x, y, z), y > 0.06 ? DOLL.fLegOnly(s, x, y, z) : 1) - 0.0026;
        const plan = DOLL.fFoot(s, x, S0 + 0.007, z) - 0.0030, sole = smax(plan, Math.max(S0 - LIFT - y, y - S0 - 0.004), 0.0015);
        const up = smax(smin(smin(foot, toeD(X, y, Z), 0.008), sole, 0.004), cy, 0.0025);
        return smax(up, S0 - LIFT - y, 0.0015); };
      const keep = (x, y, z) => !(DOLL.fFoot(s, x, y, z) < -0.0015 || (y > 0.06 && DOLL.fLegOnly(s, x, y, z) < -0.0015));
      const g = W.snets(G, [0.015, 0.150, S0 - LIFT - 0.004, 0.115, -0.085, 0.205], 0.0029), pos = [], nor = [], idx = [], used = new Int32Array(g.nv).fill(-1);
      for (let t = 0; t < g.tris.length; t += 3) {
        let ok = false; for (let k = 0; k < 3; k++) { const v = g.tris[t + k]; if (keep(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2])) { ok = true; break; } } if (!ok) continue;
        for (let k = 0; k < 3; k++) { const v = g.tris[t + k];
          if (used[v] < 0) { used[v] = pos.length / 3; pos.push(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]); nor.push(g.nor[v * 3], g.nor[v * 3 + 1], g.nor[v * 3 + 2]); }
          idx.push(used[v]); }
      }
      const posR = pos.slice(), norR = nor.slice(), idxR = idx.slice();
      for (let i = 0; i < posR.length; i += 3) { posR[i] = -posR[i]; norR[i] = -norR[i]; }
      for (let i = 0; i < idxR.length; i += 3) { const t = idxR[i + 1]; idxR[i + 1] = idxR[i + 2]; idxR[i + 2] = t; }
      const wf = (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z);
      W.part('d1SlipperR', { pos: posR, idx: idxR, nor: norR }, wf, { mat: slipperMat });
      W.part('d1SlipperL', { pos, idx, nor }, wf, { mat: slipperMat });
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // ======================= her legs keep out of the skirt =======================
    // The skirt's chains are pushed out past (or up onto) her legs (as the peasant dress, wardrobe/D2.js, does it), level by level down
    // the chains: each bone is turned so that its end and its middle clear her padded thighs and shins. A floor-length skirt is cloth
    // between chains 30 degrees apart, so each chain also goes at least most of the way its neighbours go: the cloth between two chains
    // cannot cut a corner through a knee.
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.085, NC = CH.length, NL = CH[0].names.length;
      const tipOff = CH.map((c) => c.names.map((nm, k) => new T3.Vector3().subVectors(c.pts[k + 1], c.pts[k])));
      const A = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), V = new T3.Vector3(), M = new T3.Vector3();
      const q = new T3.Quaternion(), pq = new T3.Quaternion(), v1 = new T3.Vector3(), v2 = new T3.Vector3();
      const legs = [];
      for (const S of ['R', 'L']) legs.push([new T3.Vector3(), new T3.Vector3(), 0.078, 0.056, 'thigh' + S, 'shin' + S], [new T3.Vector3(), new T3.Vector3(), 0.056, 0.042, 'shin' + S, 'foot' + S]);
      // her legs' points at rest, and how far each chain's ends and middles stand from them then (no push is ever asked at rest)
      const restOf = (p) => { const out = []; for (const L of legs) { const a = W.SK[L[4]].userData.rest, b = W.SK[L[5]].userData.rest;
        for (let j = 0; j <= 5; j++) out.push(V.copy(a).lerp(b, j / 5).distanceTo(p)); } return out; };
      const restT = CH.map((c) => c.names.map((nm, k) => restOf(c.pts[k + 1])));
      const restM = CH.map((c) => c.names.map((nm, k) => restOf(M.copy(c.pts[k]).add(c.pts[k + 1]).multiplyScalar(0.5))));
      const push = (p, RD, out) => {      // how far p must move (out from her middle, or up: the shorter) to clear her padded legs; false if clear
        E.set(p.x - Hc.x, 0, p.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return false; E.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0;
        legs.forEach((L, li) => { for (let k = 0; k <= 5; k++) { const t = k / 5; V.copy(L[0]).lerp(L[1], t); const R = Math.min(L[2] + (L[3] - L[2]) * t + PAD, RD[li * 6 + k] - 0.004);
          const vx = p.x - V.x, vy = p.y - V.y, vz = p.z - V.z, cc = vx * vx + vy * vy + vz * vz - R * R; if (cc >= 0) continue;
          const b1 = vx * E.x + vz * E.z, q1 = b1 * b1 - cc; if (q1 > 0) sOut = Math.max(sOut, -b1 + Math.sqrt(q1)); const q2 = vy * vy - cc; if (q2 > 0) sUp = Math.max(sUp, -vy + Math.sqrt(q2)); } });
        if (sOut <= 1e-4 && sUp <= 1e-4) return false;
        if (sUp < sOut) out.set(0, sUp, 0); else out.copy(E).multiplyScalar(sOut); return true;
      };
      const P = CH.map(() => new T3.Vector3()), Tp = CH.map(() => new T3.Vector3()), Q = CH.map(() => new T3.Quaternion()), ANG = new Float32Array(NC), dm = new T3.Vector3();
      const DIR0 = CH.map((c) => c.names.map(() => new T3.Vector3())), dT = new T3.Vector3(), dM = new T3.Vector3(), cur = new T3.Vector3(), qa = new T3.Quaternion();
      const turn = (b, qw) => { b.parent.getWorldQuaternion(pq); b.quaternion.premultiply(pq.clone().invert().multiply(qw).multiply(pq)); b.updateMatrixWorld(true); };
      const tipOf = (ci, k, b, out) => out.copy(tipOff[ci][k]).applyMatrix4(b.matrixWorld).sub(A.setFromMatrixPosition(b.matrixWorld)).add(b.getWorldPosition(V));
      W.onFrame((SK) => {
        for (const L of legs) { SK[L[4]].getWorldPosition(L[0]); SK[L[5]].getWorldPosition(L[1]); }
        SK.hips.getWorldPosition(Hc);
        // where each bone of the chains points as her move (and the cloth's swing) left it
        for (let ci = 0; ci < NC; ci++) for (let k = 0; k < NL; k++) { const b = SK[CH[ci].names[k]]; b.getWorldPosition(M); tipOf(ci, k, b, DIR0[ci][k]).sub(M).normalize(); }
        for (let k = 0; k < NL; k++) {
          for (let ci = 0; ci < NC; ci++) {
            const b = SK[CH[ci].names[k]];
            // a bone below one that was turned hangs again as it did before (the cloth falls from the knee, it does not stand out with it)
            if (k > 0) { b.getWorldPosition(P[ci]); cur.copy(tipOf(ci, k, b, Tp[ci])).sub(P[ci]).normalize(); if (cur.dot(DIR0[ci][k]) < 0.99999) turn(b, qa.setFromUnitVectors(cur, DIR0[ci][k])); }
            b.getWorldPosition(P[ci]); tipOf(ci, k, b, Tp[ci]); cur.copy(Tp[ci]).sub(P[ci]); const len = cur.length(); cur.multiplyScalar(1 / len);
            ANG[ci] = 0; Q[ci].identity();
            let best = 0;
            if (push(Tp[ci], restT[ci][k], dm)) { dT.copy(Tp[ci]).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dT), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dT); } }
            M.copy(P[ci]).add(Tp[ci]).multiplyScalar(0.5);
            if (push(M, restM[ci][k], dm)) { dM.copy(M).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dM), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dM); } }
            ANG[ci] = best;
          }
          // neighbours: a chain turns at least 60% as far as the chain beside it (the same way, about its own place)
          for (let ci = 0; ci < NC; ci++) {
            let qq = Q[ci], a0 = ANG[ci];
            for (const cj of [(ci + 1) % NC, (ci + NC - 1) % NC]) if (ANG[cj] * 0.6 > a0) { a0 = ANG[cj] * 0.6; qq = new T3.Quaternion().slerp(Q[cj], 0.6); }
            if (a0 > 1e-4) turn(SK[CH[ci].names[k]], qq === Q[ci] ? Q[ci] : qq);
          }
        }
      });
    }

    // ======================= paint corrections =======================
    // the sleeves' turned-in cuffs and the skirt's turned-up hem take the colour of the cloth just outside their edge
    W.afterPaint((parts) => {
      const fix = (mesh, pairs) => { for (const key of ['aPP', 'aPN', 'aPE']) { const at = mesh.geometry.attributes[key]; if (!at) continue; const A = at.array;
        for (const [i, j] of pairs) { A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; } at.needsUpdate = true; } };
      for (const p of parts) {
        if (/^d1Sleeve/.test(p.key)) { const d = sleeveData[p.key.slice(-1)], pairs = [], src = d.nRows - 6;
          for (let r = d.nRows - 3; r < d.nRows; r++) for (let c = 0; c < d.cols; c++) pairs.push([r * d.cols + c, src * d.cols + c]); fix(p.mesh, pairs); }
        if (p.key === 'd1Skirt') { const pairs = [], src = skirtRows - 5;
          for (let r = skirtRows - 3; r < skirtRows; r++) for (let c = 0; c < skirtCols; c++) pairs.push([r * skirtCols + c, src * skirtCols + c]); fix(p.mesh, pairs); }
        const P = p.mesh.geometry.attributes.position.array, PP = p.mesh.geometry.attributes.aPP;
        if (p.key === 'd1Bodice') { for (let i = 0; i < PP.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], y1 = z < 0 && Math.abs(x) < 0.075 ? 1.118 : 1.100;
          if (y < y1) PP.array[i * 3 + 1] += (y1 - y) * 0.75; } PP.needsUpdate = true; }
        if (p.key === 'd1Skirt') { for (let i = 0; i < PP.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]; if (z > -0.02) continue;
          if (y > 1.03) PP.array[i * 3 + 1] = Math.min(PP.array[i * 3 + 1], 1.03 - 0.3 * (y - 1.03));                 // under the bow: the cloth below it
          if (y > 0.72 && Math.abs(x) < 0.045) PP.array[i * 3] += (x < 0 ? -1 : 1) * (0.045 - Math.abs(x)) * sm(0.72, 0.76, y);   // behind the painted ends
        } PP.needsUpdate = true; }
      }
    });


    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'toenail']);
    W.hideSkin((x, y, z) => (y > WAIST + 0.012 && y < topB(x, z) - 0.035) || (y > 0.80 && y < WAIST + 0.014), ['dollTrunk']);
    W.hideSkin((x, y, z) => y > 0.45, ['dollLeg']);           // her thighs and knees: always under the skirt, so a knee pressing into the cloth in a deep bend never shows
    W.hideSkin((x, y, z) => { const s = x < 0 ? -1 : 1; DOLL.toLocal(s, x, z, L2); return y < cutY(L2[0], L2[1]) - 0.010; }, ['dollFoot']);
    W.hideSkin((x, y, z) => { const S = x < 0 ? 'R' : 'L', f = W.armFrame(S, x, y, z); return f.sl < 0.39; }, ['arm']);         // her arms inside the sleeves (the top of her arm too: in a reach it would press out through the sleeve's cap)
  },
};
