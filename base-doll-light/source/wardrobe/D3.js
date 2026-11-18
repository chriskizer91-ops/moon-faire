// D3, the elven gown (D3A.png, D3B.png): a flowing sage-green floor-length gown of soft matte jersey. A deep V neckline edged with
// gold leaf embroidery, a round neckline at the back; a high (empire) waist under her bust with a thin twisted gold cord; a long soft
// skirt gathered under the cord, falling straight in gentle folds to the floor, clinging a little over her hips and ending in a slight
// train at the back; fitted sleeves to just above her elbows, then long bell sleeves that hang open from the elbow in long points well
// below her wrists, their edges embroidered in gold; gold ballet slippers. The embroidery comes from the paintings; the folds are shape.
// Pieces: d3Bodice, d3Band (the gold cord), d3Skirt, d3SleeveR/L (fitted, shoulder to elbow), d3BellR/L (the hanging bell sleeves),
// d3SlipperR/L.
// The bell sleeves: their top (the gathered seam just above her elbow) goes with her arm; below it the cloth is carried by two bones of
// the doll's own sleeve rig (slS2_0 and slS2_1, made for her cloak's sleeves in src/I45_robe.js and unused while she wears this),
// which a frame hook here sets every frame from a small hanging chain of its own (two stretches from her elbow, the long point the
// second): it hangs toward the ground however she holds her arm, lags and swings a little, and keeps out of her skirt (where the skirt's
// chains have carried it), her legs, her body, her own forearm and the floor.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.D3 = {
  name: 'Elven gown', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { THREE, sm, lerp, PI, TAU, cl, smin, smax, DOLL } = W;
    const F = W.F, Fs = W.Fsnug;
    const LIFT = 0.004;                                   // the slippers' soles: she stands this much higher

    // ----- materials: soft matte jersey, gold cord, gold leather -----
    const CC = '#d4d2cc';
    const jersey = W.paint({ rough: 0.88, emis: 0.30, env: 0.12, color: CC });
    const jerseyD = W.paint({ rough: 0.88, emis: 0.32, env: 0.12, color: CC, double: true });
    const gold = W.std({ color: W.lin('#c9a24a'), metalness: 0.80, roughness: 0.33, envMapIntensity: 1.0 });
    const goldLeather = W.std({ color: W.lin('#c7a352'), metalness: 0.55, roughness: 0.36, envMapIntensity: 0.9 });

    // ----- small geometry helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    function orient(g, rings) {                           // flip a loft's triangles if its middle ring faces inward
      const nor = W.computeNormals(g.pos, g.idx), m = Math.floor(rings.length / 2), r = rings[m], n = r.length, cols = n + 1;
      const c = r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]); let s = 0;
      for (let j = 0; j < n; j++) { const v = m * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    // a smooth curve through keys [[x, [values]], ...] (Catmull-Rom)
    function cprof(K, x) {
      if (K[0][0] > K[K.length - 1][0]) K = K._r || (K._r = K.slice().reverse());
      const n = K.length; if (x <= K[0][0]) return K[0][1]; if (x >= K[n - 1][0]) return K[n - 1][1];
      let i = 1; while (K[i][0] < x) i++;
      const x0 = K[i - 1][0], x1 = K[i][0], u = (x - x0) / (x1 - x0), A = K[Math.max(0, i - 2)], B = K[i - 1], C = K[i], D = K[Math.min(n - 1, i + 1)];
      return B[1].map((b, j) => { const c = C[1][j], m0 = (c - A[1][j]) / (C[0] - A[0]) * (x1 - x0), m1 = (D[1][j] - b) / (D[0] - B[0]) * (x1 - x0), u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * b + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * c + (u3 - u2) * m1; });
    }

    // ======================= her body's outline round the skirt's middle line =======================
    const SKC = -0.012;
    const NA = 72, YB0 = 1.16, YB1 = 0.62, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.246; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; let fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };

    // ======================= the bodice =======================
    // from under the cord up to a deep V in front (its point between her breasts, 1.19 m) and a round neckline at the back of her neck
    const BAND0 = 1.131, BAND1 = 1.147, BOT = 1.124;
    const topB = (x, z) => {
      const ax = Math.abs(x), u = Math.min(ax / 0.096, 1), f = sm(-0.055, 0.02, z);
      const front = 1.190 + 0.155 * Math.pow(u, 0.92), back = 1.352 + 0.010 * u * u;
      return lerp(lerp(back, front, f), 1.62, sm(0.093, 0.101, ax));
    };
    const bodR = (x, y, z) => Math.max(BOT - y, y - topB(x, z));
    const bodTh = (x, y, z) => {
      const e = topB(x, z) - y, a = Math.atan2(x, z + 0.01);
      const gath = 0.0011 * sm(1.215, 1.165, y) * sm(1.128, 1.150, y) * (0.5 + 0.5 * Math.sin(a * 40 + 0.5 * Math.sin(a * 7)));   // soft gathers under her bust
      return 0.0034 + 0.0010 * sm(0.010, 0.003, e) + gath;
    };
    W.snug('d3Bodice', bodR, bodTh, [-0.195, 0.195, 1.112, 1.43, -0.135, 0.13], 0.0042, { mat: jerseyD });

    // ======================= the fitted sleeves (shoulder to just above her elbow, under the bells' gathered tops) =======================
    const SEAM = 0.200, SLV1 = 0.214;
    const sl0 = (a) => lerp(-0.052, 0.046, Math.pow((1 - Math.cos(a)) / 2, 2));
    for (const S of ['R', 'L']) {
      const NU = 40, NR = 30, rings = [], SLs = [];
      const pt = (sl, a, e) => { const p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), c3 = W.armPt(S, sl, PI / 2), c4 = W.armPt(S, sl, 1.5 * PI);
        const ax = [(c1[0] + c2[0] + c3[0] + c4[0]) / 4, (c1[1] + c2[1] + c3[1] + c4[1]) / 4, (c1[2] + c2[2] + c3[2] + c4[2]) / 4];
        return add(p, norm([p[0] - ax[0], p[1] - ax[1], p[2] - ax[2]]), e); };
      const off = (sl) => 0.0030 + 0.0012 * sm(-0.03, 0.0, sl) + 0.0010 * sm(0.0, 0.06, sl);
      for (let i = 0; i <= NR; i++) { const t = i / NR, ring = [], sls = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, sl = lerp(sl0(a), SLV1, 1 - Math.pow(1 - t, 1.25)); ring.push(pt(sl, a, off(sl))); sls.push([sl, a]); }
        rings.push(ring); SLs.push(sls); }
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('d3Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, 0.1); const [sl, a] = SLs[r][j % NU];
        const wa = W.wArmSL(S, cl(sl, 0.0, 0.446), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.5 * sm(0.03, -0.020, sl)) : wa; }, { mat: jersey });
    }

    // ======================= the skirt =======================
    const TOP = 1.142, HEM = 0.041;
    // the painted outline (half width, front and back from the middle line), read from D3A.png; her hips are wider than the painted
    // ones, so there the skirt follows her body
    const FL = [[1.14, [0.100, 0.108, 0.056]], [1.10, [0.106, 0.110, 0.061]], [1.04, [0.120, 0.112, 0.075]], [1.00, [0.134, 0.114, 0.092]], [0.95, [0.145, 0.115, 0.114]],
      [0.90, [0.152, 0.116, 0.124]], [0.85, [0.156, 0.119, 0.121]], [0.80, [0.158, 0.121, 0.114]], [0.70, [0.160, 0.126, 0.110]], [0.60, [0.162, 0.129, 0.115]],
      [0.50, [0.165, 0.133, 0.125]], [0.40, [0.170, 0.134, 0.135]], [0.30, [0.176, 0.136, 0.143]], [0.20, [0.183, 0.141, 0.153]], [0.10, [0.194, 0.146, 0.166]], [0.04, [0.198, 0.149, 0.178]]];
    const gAmp = (y) => lerp(0.0016, 0.0125, Math.pow(sm(TOP - 0.02, HEM, y), 0.7));
    const flareR = (y, a) => { const v = cprof(FL, y), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2], k = 0.7 * gAmp(y);
      return 1 / Math.sqrt((s / (v[0] - k)) * (s / (v[0] - k)) + (c / (rz - k)) * (c / (rz - k))); };
    const clear = (y) => lerp(0.0042, 0.0085, sm(1.12, 0.92, y));
    const train = (y, a) => 0.022 * Math.pow(sm(0.17, HEM, y), 1.5) * Math.pow(Math.max(0, -Math.cos(a)), 2);       // a slight train at the back
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), 0.030) + train(y, a);
    // gentle folds: fine gathers under the cord, a few long soft folds below
    const fold = (a, y) => { const t = sm(TOP, HEM, y), ph = 0.4 * t * Math.sin(2 * a + 0.4);
      const fine = Math.sin(a * 46 + 0.3 + 0.4 * Math.sin(a * 5)), main = 0.66 * Math.sin(a * 17 + ph + 0.7 * Math.sin(a * 3)) + 0.34 * Math.sin(a * 29 + 1.3 + ph * 1.5);
      return lerp(fine, main, sm(0.02, 0.26, t)); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    const envR = (y, a) => baseR(y, a) + gAmp(y);
    const hemY = (a) => HEM + 0.021 * Math.pow((1 + Math.cos(a)) / 2, 1.4) + 0.0025 * Math.sin(a * 3 + 1) * sm(0.2, 1, (1 + Math.cos(a)) / 2);
    let skirtRows = 0, skirtCols = 0;
    {
      const NU = 176, ys = [], NV = 60;
      for (let i = 0; i <= NV; i++) { const t = i / NV; ys.push(lerp(TOP, HEM, t * t * 0.30 + t * 0.70)); }
      const rings = [];
      const at = (y, a, dr) => { const r = skirtR(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(TOP + 0.002, a, -0.0025)); } rings.push(ring); }      // the gathered top, rolled in under the cord
      for (const y of ys) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, yy = y === HEM ? hemY(a) : lerp(y, hemY(a), sm(0.30, HEM, y)); ring.push(at(Math.max(yy, HEM), a)); } rings.push(ring); }
      // the hem: a rounded edge, then turned up inside 2.5 cm
      { const r0 = [], r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemY(a); r0.push(at(h - 0.0012, a, -0.0016)); r1.push(at(h + 0.0004, a, -0.0034)); r2.push(at(h + 0.025, a, -0.0038)); } rings.push(r0, r1, r2); }
      const g = W.loft(rings, {});
      skirtRows = rings.length; skirtCols = NU + 1;
      // above her hips it moves with her body (her waist bends); below, it hangs from the skirt's soft chains
      const wf = (x, y, z) => { const ws = W.wSkirt(x, y, z); if (y < 1.03) return ws; const r = Math.hypot(x, z - SKC) || 1, k = Math.max(0, r - 0.022) / r;
        return W.mixW(ws, W.wBody(x * k, y, SKC + (z - SKC) * k), sm(1.03, 1.11, y)); };
      W.part('d3Skirt', g, wf, { mat: jerseyD });
    }

    // ======================= the gold cord under her bust (a twisted cord: two strands round each other) =======================
    {
      const NU = 300, NV = 12, yc = (BAND0 + BAND1) / 2, hw = (BAND1 - BAND0) / 2, rings = [];
      const yAt = (a) => yc - 0.004 * sm(0.3, -0.6, Math.cos(a));                       // a little lower at the back, as painted
      const base = (a, y) => bodyR(y, a) + 0.0050;
      // arc length round the cord, for the twist's even pitch
      const sArc = [0]; for (let j = 1; j <= NU; j++) { const a0 = ((j - 1) / NU) * TAU, a1 = (j / NU) * TAU, r0 = base(a0, yc), r1 = base(a1, yc);
        sArc.push(sArc[j - 1] + Math.hypot(r1 * Math.sin(a1) - r0 * Math.sin(a0), r1 * Math.cos(a1) - r0 * Math.cos(a0))); }
      const P = sArc[NU] / Math.round(sArc[NU] / 0.0085);                                // the twist's pitch, a whole number of turns round her
      for (let i = 0; i <= NV; i++) { const q = -1 + 2 * i / NV, ring = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, y = yAt(a) + q * hw * 0.98, ridge = Math.abs(Math.cos(PI * (sArc[j] / P + q * 0.5)));
          const r = base(a, y) + 0.0024 * Math.sqrt(Math.max(0, 1 - q * q)) * (0.55 + 0.45 * Math.pow(ridge, 0.7)) - 0.0012 * (1 - Math.sqrt(Math.max(0, 1 - q * q)));
          ring.push([r * Math.sin(a), y, SKC + r * Math.cos(a)]); }
        rings.push(ring); }
      const g = W.loft(rings, {});
      W.part('d3Band', g, (x, y, z) => { const r = Math.hypot(x, z - SKC) || 1, k = Math.max(0, r - 0.02) / r; return W.wBody(x * k, y, SKC + (z - SKC) * k); }, { mat: gold });
    }

    // ======================= the bell sleeves =======================
    // Built at rest hanging straight down from a gathered seam round her arm just above her elbow (sl 0.20). The opening's edge is cut
    // on the slant: highest at the front of her forearm on its outer side (where her forearm and hand come out), falling round both
    // ways to a long point at the back, on the side toward her body, well below her wrist.
    const BELL = {}, A15 = W.A_POSE;
    const B_TOP = 0.118, B_PT = 0.490, A_TOP = 0.30, A_PT = A_TOP + PI;   // drop of the opening's top and of the point below the seam; the top's angle round her arm
    const tHem = (a) => B_TOP + (B_PT - B_TOP) * Math.pow((1 - Math.cos(a - A_TOP)) / 2, 0.85);
    const R_OUT = 0.068, R_IN = 0.036, R_F = 0.052, R_B = 0.056;   // the bell's half widths: outer side, toward her body, front, back
    const L1 = 0.24, L2 = 0.26;                                    // the hanging chain: elbow to mid, mid to the point
    for (const S of ['R', 'L']) {
      const s = S === 'L' ? 1 : -1, sh = W.restPts['sh' + S], d = W.armDir[S], c15 = Math.cos(A15), s15 = Math.sin(A15);
      const C0 = [sh.x + d.x * SEAM, sh.y + d.y * SEAM, sh.z];
      const fr = W.SK['farm' + S].userData.rest, E0 = [fr.x, fr.y, fr.z];
      const seamR = (a) => { const p = W.armPt(S, SEAM, a); return Math.hypot(p[0] - C0[0], p[1] - C0[1], p[2] - C0[2]) + 0.0090; };
      // the axis drifts along her arm at first, then hangs straight down
      const GD = []; { let g = 0; for (let k = 0; k <= 400; k++) { GD.push(g); g += 0.002 * (1 - sm(0.0, 0.12, k * 0.002)); } }
      const drift = (t) => { const f = cl(t / 0.002, 0, 399.999), k = Math.floor(f); return lerp(GD[k], GD[k + 1], f - k); };
      const axis = (t) => [C0[0] + (d.x / -d.y) * drift(t), C0[1] - t, C0[2] - 0.026 * sm(0.0, 0.32, t)];
      const radius = (t, a) => {
        const ca = Math.cos(a), sa = Math.sin(a), ex = ca >= 0 ? R_OUT : lerp(R_IN, 0.062, sm(0.24, 0.42, t)), ez = sa >= 0 ? R_F : R_B, rT = 1 / Math.sqrt((ca / ex) * (ca / ex) + (sa / ez) * (sa / ez));
        const f = 1 - Math.exp(-t / 0.075);
        const flute = 0.0025 * Math.sin(a * 16 + 0.4) * sm(0.0, 0.025, t) * sm(0.14, 0.03, t)            // the gathers at the seam
          + 0.0065 * Math.sin(a * 5 + 1.1 + 0.5 * Math.sin(a * 2)) * sm(0.04, 0.30, t);                     // soft folds below
        return lerp(seamR(a), rT, f) + flute;
      };
      const pt = (t, a, dr) => { const c = axis(t), r = radius(t, a) + (dr || 0), k = sm(0.0, 0.10, t);
        const O = norm([lerp(s * c15, s, k), lerp(s15, 0, k), 0]);
        return [c[0] + O[0] * Math.cos(a) * r, c[1] + O[1] * Math.cos(a) * r, c[2] + Math.sin(a) * r]; };
      const NU = 72, NV = 46, rings = [], TA = [];
      for (let i = 0; i <= NV; i++) { const v = i / NV, ring = [], ta = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, t = tHem(a) * v; ring.push(pt(t, a)); ta.push([t, a]); }
        rings.push(ring); TA.push(ta); }
      // the opening's edge: rounded, then turned up inside 1.5 cm (so the cloth has thickness at its edge)
      { const r0 = [], r1 = [], r2 = [], t0 = [], t1 = [], t2 = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = tHem(a);
          r0.push(pt(h + 0.0012, a, -0.0015)); r1.push(pt(h - 0.0004, a, -0.0030)); r2.push(pt(h - 0.015, a, -0.0034)); t0.push([h, a]); t1.push([h, a]); t2.push([h - 0.015, a]); }
        rings.push(r0, r1, r2); TA.push(t0, t1, t2); }
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      const b1 = 'sl' + S + '2_0', b2 = 'sl' + S + '2_1', has = W.BI[b1] != null && W.BI[b2] != null;
      // weights: the seam goes with her arm; below it the cloth goes over to the hanging chain, later near the top of the opening
      // (it stays with her forearm there), and the long point goes to the chain's second stretch
      const wHang = (t, a) => sm(0.020 + 0.050 * Math.max(0, Math.cos(a - A_TOP)), 0.10 + 0.07 * Math.max(0, Math.cos(a - A_TOP)), t);
      const w2 = (t) => sm(0.22, 0.36, t);
      const WA = [], WB = [], AX = [];                           // per point: how much her arm, how much the chain carries it, its axis point (for the paint)
      const wf = (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; const [t, a] = TA[Math.min(r, TA.length - 1)][j % NU];
        AX[i] = axis(t); const arm = W.wArmSL(S, cl(SEAM + t / c15, 0.0, 0.44), a); if (!has) { WA[i] = 1; WB[i] = 0; return arm; }
        const h = wHang(t, a), hang = W.mixW([W.BI[b1], 1], [W.BI[b2], 1], w2(t)); WA[i] = 1 - h; WB[i] = h;
        return h <= 0 ? arm : h >= 1 ? hang : W.mixW(arm, hang, h); };
      const rec = W.part('d3Bell' + S, g, wf, { mat: jerseyD, occluder: false });
      // points of the cloth tested against what it may not pass into: on the first stretch and on the long point
      const samples = [];
      for (const [tt, bone] of [[0.12, 1], [0.17, 1], [0.23, 1], [0.30, 2], [0.38, 2], [0.45, 2]])
        for (let j = 0; j < 16; j++) { const a = (j / 16) * TAU; if (tt > tHem(a) - 0.012) continue; if (bone === 1 && wHang(tt, a) < 0.85) continue; samples.push({ bone, p: pt(tt, a) }); }
      samples.push({ bone: 2, p: pt(tHem(A_PT) - 0.004, A_PT) });
      BELL[S] = { s, rec, has, b1, b2, E0, J0: [E0[0], E0[1] - L1, E0[2]], K0: [E0[0], E0[1] - L1 - L2, E0[2]], samples, WA, WB, AX, TT: TA, rings: rings.length, cols };
    }

    // ======================= the slippers (gold leather ballet flats, as D1's) =======================
    const TOE = [[0.060, [-0.036, 0.048, 0.066]], [0.090, [-0.043, 0.053, 0.056]], [0.110, [-0.046, 0.052, 0.047]], [0.130, [-0.044, 0.050, 0.040]],
      [0.150, [-0.043, 0.041, 0.035]], [0.165, [-0.041, 0.030, 0.031]], [0.178, [-0.038, 0.017, 0.027]], [0.188, [-0.032, 0.004, 0.024]], [0.196, [-0.020, -0.006, 0.021]]];
    const S0 = W.SOLE, L2v = [0, 0];
    const toeD = (X, Y, Z) => {
      const v = cprof(TOE, Z), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.008, ry = Math.max(0.004, v[2] - 0.008);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.012, q = Math.pow(Math.pow(ux, 2.4) + Math.pow(uy, 2.4), 1 / 2.4);
      return smax((q - 1) * Math.min(rx, Y > yc ? ry : 0.012), smax(0.07 - Z, Z - 0.1995, 0.006), 0.004);
    };
    const cutY = (X, Z) => S0 + lerp(0.036, 0.025, sm(-0.06, -0.02, Z)) + 0.10 * sm(0.092, 0.128, Z + 1.6 * X * X);
    {
      const s = 1;
      const G = (x, y, z) => { DOLL.toLocal(s, x, z, L2v); const X = L2v[0], Z = L2v[1];
        const cy = y - cutY(X, Z); if (cy > 0.006) return cy; if (Z < -0.085 || Z > 0.215 || X < -0.075 || X > 0.085) return 0.01;
        const foot = Math.min(DOLL.fFoot(s, x, y, z), y > 0.06 ? DOLL.fLegOnly(s, x, y, z) : 1) - 0.0026;
        const plan = DOLL.fFoot(s, x, S0 + 0.007, z) - 0.0030, sole = smax(plan, Math.max(S0 - LIFT - y, y - S0 - 0.004), 0.0015);
        const up = smax(smin(smin(foot, toeD(X, y, Z), 0.008), sole, 0.004), cy, 0.0025);
        return smax(up, S0 - LIFT - y, 0.0015); };
      const keep = (x, y, z) => !(DOLL.fFoot(s, x, y, z) < -0.0015 || (y > 0.06 && DOLL.fLegOnly(s, x, y, z) < -0.0015));
      const g = W.snets(G, [0.015, 0.150, S0 - LIFT - 0.004, 0.115, -0.085, 0.205], 0.0046), pos = [], nor = [], idx = [], used = new Int32Array(g.nv).fill(-1);
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
      W.part('d3SlipperR', { pos: posR, idx: idxR, nor: norR }, wf, { mat: goldLeather });
      W.part('d3SlipperL', { pos, idx, nor }, wf, { mat: goldLeather });
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // ======================= her legs keep out of the skirt (as D1 and D2) =======================
    // The skirt's chains are pushed out past (or up onto) her padded legs, level by level down the chains; each chain goes at least
    // most of the way its neighbours go, so the cloth between two chains cannot cut a corner through a knee.
    {
      const T3 = THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.085, NC = CH.length, NL = CH[0].names.length;
      const tipOff = CH.map((c) => c.names.map((nm, k) => new T3.Vector3().subVectors(c.pts[k + 1], c.pts[k])));
      const A = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), V = new T3.Vector3(), M = new T3.Vector3();
      const pq = new T3.Quaternion();
      const legs = [];
      for (const S of ['R', 'L']) legs.push([new T3.Vector3(), new T3.Vector3(), 0.078, 0.056, 'thigh' + S, 'shin' + S], [new T3.Vector3(), new T3.Vector3(), 0.056, 0.042, 'shin' + S, 'foot' + S]);
      const restOf = (p) => { const out = []; for (const L of legs) { const a = W.SK[L[4]].userData.rest, b = W.SK[L[5]].userData.rest;
        for (let j = 0; j <= 5; j++) out.push(V.copy(a).lerp(b, j / 5).distanceTo(p)); } return out; };
      // The chains hang where her own (wider) lace skirt was; this skirt lies inside them by DL (out from her middle). Each chain point is
      // tested where this skirt's cloth is: moved in by DL, against her legs as they lie from that cloth when she stands.
      const onMine = (p) => { const a = Math.atan2(p.x, p.z - SKC), r = baseR(cl(p.y, HEM, TOP), a); return new T3.Vector3(r * Math.sin(a), p.y, SKC + r * Math.cos(a)); };
      const dl = (p) => Math.hypot(p.x, p.z - SKC) - baseR(cl(p.y, HEM, TOP), Math.atan2(p.x, p.z - SKC));
      const restT = CH.map((c) => c.names.map((nm, k) => restOf(onMine(c.pts[k + 1]))));
      const midOf = (c, k) => new T3.Vector3().copy(c.pts[k]).add(c.pts[k + 1]).multiplyScalar(0.5);
      const restM = CH.map((c) => c.names.map((nm, k) => restOf(onMine(midOf(c, k)))));
      const DLT = CH.map((c) => c.names.map((nm, k) => dl(c.pts[k + 1]))), DLM = CH.map((c) => c.names.map((nm, k) => dl(midOf(c, k))));
      const Pq = new T3.Vector3();
      const push = (p0, RD, out, DL) => {
        E.set(p0.x - Hc.x, 0, p0.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return false; E.multiplyScalar(1 / rl);
        const p = Pq.copy(p0).addScaledVector(E, -DL);
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
        for (let ci = 0; ci < NC; ci++) for (let k = 0; k < NL; k++) { const b = SK[CH[ci].names[k]]; b.getWorldPosition(M); tipOf(ci, k, b, DIR0[ci][k]).sub(M).normalize(); }
        for (let k = 0; k < NL; k++) {
          for (let ci = 0; ci < NC; ci++) {
            const b = SK[CH[ci].names[k]];
            if (k > 0) { b.getWorldPosition(P[ci]); cur.copy(tipOf(ci, k, b, Tp[ci])).sub(P[ci]).normalize(); if (cur.dot(DIR0[ci][k]) < 0.99999) turn(b, qa.setFromUnitVectors(cur, DIR0[ci][k])); }
            b.getWorldPosition(P[ci]); tipOf(ci, k, b, Tp[ci]); cur.copy(Tp[ci]).sub(P[ci]); const len = cur.length(); cur.multiplyScalar(1 / len);
            ANG[ci] = 0; Q[ci].identity();
            let best = 0;
            if (push(Tp[ci], restT[ci][k], dm, DLT[ci][k])) { dT.copy(Tp[ci]).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dT), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dT); } }
            M.copy(P[ci]).add(Tp[ci]).multiplyScalar(0.5);
            if (push(M, restM[ci][k], dm, DLM[ci][k])) { dM.copy(M).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dM), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dM); } }
            ANG[ci] = best;
          }
          for (let ci = 0; ci < NC; ci++) {
            let qq = Q[ci], a0 = ANG[ci];
            for (const cj of [(ci + 1) % NC, (ci + NC - 1) % NC]) if (ANG[cj] * 0.6 > a0) { a0 = ANG[cj] * 0.6; qq = new T3.Quaternion().slerp(Q[cj], 0.6); }
            if (a0 > 1e-4) turn(SK[CH[ci].names[k]], qq === Q[ci] ? Q[ci] : qq);
          }
        }
      });
    }

    // ======================= the bell sleeves hang: a small chain of their own, every frame =======================
    {
      const T3 = THREE, V = (x, y, z) => new T3.Vector3(x || 0, y || 0, z || 0);
      const CH = W.chains.filter((c) => c.grp === 'skirt'), NC = CH.length, NJ = CH[0].pts.length;
      const HR = W.SK.hips.userData.rest.clone();
      const inv = new T3.Matrix4(), mh = new T3.Matrix4(), mhI = new T3.Matrix4(), qH = new T3.Quaternion(), qF = new T3.Quaternion(), mF = new T3.Matrix4();
      const tv = V(), tw = V(), tu = V(), tq = new T3.Quaternion(), m4 = new T3.Matrix4(), m4b = new T3.Matrix4(), sc = V(1, 1, 1);
      const DOWN = V(0, -1, 0);
      // her body above the skirt: balls carried by her spine (as her hair's), padded by the bodice
      const BALLS = [['spine3', 0, 1.300, -0.030, 0.078], ['spine3', -0.058, 1.245, 0.002, 0.086], ['spine3', 0.058, 1.245, 0.002, 0.086], ['spine2', 0, 1.165, 0.002, 0.092], ['spine1', 0, 1.075, -0.004, 0.082]]
        .map(([b, x, y, z, r]) => ({ bone: W.SK[b], off: V(x, y, z).sub(W.SK[b].userData.rest), r: r + 0.012, p: V() }));
      const LEGS = []; for (const S of ['R', 'L']) LEGS.push({ a: 'thigh' + S, b: 'shin' + S, r0: 0.096, r1: 0.068, A: V(), B: V() }, { a: 'shin' + S, b: 'foot' + S, r0: 0.066, r1: 0.054, A: V(), B: V() });
      const LPAD = 0.022;
      const ARMS = {}; for (const S of ['R', 'L']) ARMS[S] = { el: V(), wr: V(), tip: V() };
      // the skirt's surface where it is now: a grid of points on this skirt's cloth, each lying a fixed way in (DLG) from a point of the
      // skirt's chains (their joints and the middles between), with the way out of the cloth there
      const NG = 2 * NJ - 1, DLG = [], GJ = [], GS = [], GN = [];
      for (let c = 0; c < NC; c++) { const ch = CH[c]; DLG.push([]); GJ.push([]); GS.push([]); GN.push([]);
        for (let g = 0; g < NG; g++) { const k = g >> 1, pr = g % 2 ? V().copy(ch.pts[k]).add(ch.pts[k + 1]).multiplyScalar(0.5) : ch.pts[k].clone();
          const a = Math.atan2(pr.x, pr.z - SKC); DLG[c].push(Math.hypot(pr.x, pr.z - SKC) - envR(cl(pr.y, HEM, TOP), a)); GJ[c].push(V()); GS[c].push(V()); GN[c].push(V()); } }
      const Hc = V(), ta = V(), tb = V();
      const skirtPush = (p, pad, out) => {
        let best = 1e9, bc = 0, bg = 0;
        for (let c = 0; c < NC; c++) for (let g = 0; g < NG; g++) { const q = GS[c][g], d2 = (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y) + (p.z - q.z) * (p.z - q.z); if (d2 < best) { best = d2; bc = c; bg = g; } }
        if (best > 0.15 * 0.15) return false;
        const q = GS[bc][bg], n = GN[bc][bg]; tv.subVectors(p, q); const d = tv.dot(n);
        if (bg === 0 && tv.dot(ta.subVectors(GS[bc][0], GS[bc][1]).normalize()) > 0.03) return false;     // above the skirt's chains (her body's balls are there)
        if (d >= pad) return false;
        out.copy(n).multiplyScalar(Math.min(pad - d, 0.12)); return true;
      };
      const capPush = (p, A, B, r0, r1, levelUp, out) => {      // out of a tapered tube (or up onto it, if it lies level)
        tu.subVectors(B, A); const L2 = tu.lengthSq(), t = cl(tw.subVectors(p, A).dot(tu) / L2, 0, 1), R = lerp(r0, r1, t);
        tw.copy(A).addScaledVector(tu, t); tv.subVectors(p, tw); const dd = tv.length(); if (dd >= R) return false;
        if (levelUp && Math.abs(tu.y) < 0.6 * Math.sqrt(L2)) { const vy = tv.y, cc = dd * dd - R * R, q2 = vy * vy - cc; out.set(0, Math.min(0.12, -vy + Math.sqrt(Math.max(0, q2))), 0); return true; }
        if (dd < 1e-5) return false; out.copy(tv).multiplyScalar((R - dd) / dd); return true;
      };
      const pushAll = (S, p, out) => {                            // everything a point of the cloth may not be inside, one after another
        out.set(0, 0, 0); const q = V().copy(p), d = V(); let hit = false;
        for (let it = 0; it < 2; it++) {
          if (skirtPush(q, 0.011, d)) { q.add(d); out.add(d); hit = true; }
          for (const L of LEGS) if (capPush(q, L.A, L.B, L.r0 + LPAD, L.r1 + LPAD, true, d)) { q.add(d); out.add(d); hit = true; }
          for (const b of BALLS) { tv.subVectors(q, b.p); const dd = tv.length(); if (dd < b.r && dd > 1e-5) { d.copy(tv).multiplyScalar((b.r - dd) / dd); q.add(d); out.add(d); hit = true; } }
          const A = ARMS[S]; if (capPush(q, A.el, A.wr, 0.040, 0.034, false, d)) { q.add(d); out.add(d); hit = true; } if (capPush(q, A.wr, A.tip, 0.036, 0.030, false, d)) { q.add(d); out.add(d); hit = true; }
          if (q.y < 0.046) { d.set(0, 0.046 - q.y, 0); q.add(d); out.add(d); hit = true; }
          if (!hit) break;
        }
        return hit;
      };
      // the turn that carries the rest frame (hanging straight down, its front +z) to hang along u, its front following her forearm's
      const rest3 = new T3.Matrix4().makeBasis(V(-1, 0, 0), V(0, -1, 0), V(0, 0, 1)), rest3T = rest3.clone().transpose();
      const frameQ = (u, out) => {
        const f1 = V(0, 0, 1).applyQuaternion(qF), f2 = V(0, -1, 0).applyQuaternion(qF), fr = f1.clone().addScaledVector(f2, Math.max(0, f1.y));
        fr.addScaledVector(u, -fr.dot(u)); if (fr.lengthSq() < 1e-6) fr.set(0, 0, 1).addScaledVector(u, -u.z); fr.normalize();
        const sd = V().crossVectors(u, fr);
        m4.makeBasis(sd, u, fr).multiply(rest3T); return out.setFromRotationMatrix(m4);
      };
      const st = {}; for (const S of ['R', 'L']) { const b = BELL[S]; st[S] = { J: V(...b.J0), Jp: V(...b.J0), K: V(...b.K0), Kp: V(...b.K0), q1: new T3.Quaternion(), q2: new T3.Quaternion(), init: false }; }
      const E = V(), Er = V(), tmp = V(), dsum = V(), dd = V(), nn = V(), tgt = V(), uu = V(), sp_ = V();
      // one stretch: its end hangs toward the ground (a little along her forearm), swings on a spring, and is kept out of everything
      // how far the cloth of a stretch hanging from P along dir is inside anything (the sum over its test points)
      const penAt = (S, P, Pr, dir, bone, q) => { frameQ(dir, q); let sum = 0;
        for (const sp of BELL[S].samples) { if (sp.bone !== bone) continue;
          const p = sp_.set(sp.p[0] - Pr.x, sp.p[1] - Pr.y, sp.p[2] - Pr.z).applyQuaternion(q).add(P); if (pushAll(S, p, dsum)) sum += dsum.length(); }
        return sum; };
      const CAND = []; for (const th of [12, 24, 36, 50, 65, 80, 95]) for (let k = 0; k < 8; k++) CAND.push([th * W.DEG, k * PI / 4]);
      const hOut = V(), hFw = V(), cdir = V(), bdir = V();
      // one stretch: its end hangs toward the ground (a little along her forearm) and swings on a spring. If its cloth would then be
      // inside her skirt, her legs or her body, it hangs instead the nearest way that is clear (swung out, forward or back), as cloth
      // slides off a knee; what is left is pushed out.
      const stretch = (S, P, Pr, cur, prev, L, bone, q, still) => {
        const b = BELL[S];
        tgt.copy(DOWN).multiplyScalar(0.88).addScaledVector(V(0, -1, 0).applyQuaternion(qF), 0.12).normalize().multiplyScalar(L).add(P);
        if (still) nn.copy(tgt); else { nn.copy(cur).sub(prev).multiplyScalar(0.86).add(cur); nn.addScaledVector(tmp.subVectors(tgt, cur), 0.085); }
        nn.sub(P).setLength(L).add(P);
        uu.subVectors(nn, P).normalize(); let pen = penAt(S, P, Pr, uu, bone, q);
        hOut.set(P.x - Hc.x, 0, P.z - Hc.z); if (hOut.lengthSq() < 1e-6) hOut.set(1, 0, 0); hOut.normalize(); hFw.set(-hOut.z, 0, hOut.x);
        if (pen > 0.05) {
          let best = pen * 6; bdir.copy(uu);
          for (const [th, ph] of CAND) { const sh = Math.sin(th);
            cdir.set(0, -Math.cos(th), 0).addScaledVector(hOut, sh * Math.cos(ph)).addScaledVector(hFw, sh * Math.sin(ph)).normalize();
            const sc2 = th * 0.05 + 0.02 * (1 - Math.cos(ph)) + cdir.distanceTo(uu) * 0.04; if (sc2 >= best) continue;
            const pc = penAt(S, P, Pr, cdir, bone, q), score = pc * 6 + sc2; if (score < best) { best = score; bdir.copy(cdir); } }
          nn.copy(bdir).multiplyScalar(L).add(P);
        }
        for (let it = 0; it < (still ? 6 : 3); it++) {
          uu.subVectors(nn, P).normalize(); frameQ(uu, q); let moved = false;
          for (const sp of b.samples) { if (sp.bone !== bone) continue;
            const p = sp_.set(sp.p[0] - Pr.x, sp.p[1] - Pr.y, sp.p[2] - Pr.z).applyQuaternion(q).add(P);
            const along = dd.copy(p).sub(P).dot(uu);
            if (pushAll(S, p, dsum)) { nn.addScaledVector(dsum, 0.5 / Math.max(0.35, along / L)); uu.subVectors(nn, P).normalize(); if (uu.y > -0.08) { uu.y = 0; if (uu.lengthSq() < 1e-8) uu.copy(hOut); uu.setLength(Math.sqrt(1 - 0.0064)); uu.y = -0.08; }
              nn.copy(uu).multiplyScalar(L).add(P); frameQ(uu, q); moved = true; } }
          if (!moved) break;
        }
        if (still) prev.copy(nn); else prev.copy(cur); cur.copy(nn);
        uu.subVectors(cur, P).normalize(); frameQ(uu, q);
      };
      const place = (bone, P, Pr, q, ROOT) => {                 // put a bone so a point of its rest pose at Pr lands at P, turned by q (in her own space)
        const br = bone.userData.rest; tmp.set(br.x - Pr.x, br.y - Pr.y, br.z - Pr.z).applyQuaternion(q).add(P);
        m4.compose(tmp, q, sc); m4b.copy(ROOT.matrixWorld).multiply(m4); m4.copy(bone.parent.matrixWorld).invert().multiply(m4b);
        m4.decompose(bone.position, bone.quaternion, bone.scale); bone.updateMatrixWorld(true);
      };
      W.onFrame((SK, API) => {
        const ROOT = SK.hips.parent; ROOT.updateMatrixWorld(true); inv.copy(ROOT.matrixWorld).invert();
        mh.multiplyMatrices(inv, SK.hips.matrixWorld); mhI.copy(mh).invert(); qH.setFromRotationMatrix(mh);
        Hc.setFromMatrixPosition(mh);
        for (let c = 0; c < NC; c++) { const ch = CH[c];
          for (let k = 0; k < NJ; k++) { const bn = SK[ch.names[Math.min(k, ch.names.length - 1)]];
            tv.set(0, 0, 0); if (k === ch.names.length) tv.subVectors(ch.pts[k], ch.pts[k - 1]);
            GJ[c][2 * k].copy(tv.applyMatrix4(bn.matrixWorld).applyMatrix4(inv)); }
          for (let g = 1; g < NG; g += 2) GJ[c][g].copy(GJ[c][g - 1]).add(GJ[c][g + 1]).multiplyScalar(0.5);
          for (let g = 0; g < NG; g++) { const j = GJ[c][g]; tv.set(j.x - Hc.x, 0, j.z - Hc.z); const L = tv.length() || 1; GS[c][g].copy(j).addScaledVector(tv, -DLG[c][g] / L); } }
        for (let c = 0; c < NC; c++) for (let g = 0; g < NG; g++) {
          ta.subVectors(GS[(c + 1) % NC][g], GS[(c + NC - 1) % NC][g]); tb.subVectors(GS[c][Math.min(NG - 1, g + 1)], GS[c][Math.max(0, g - 1)]);
          GN[c][g].crossVectors(tb, ta).normalize(); }       // down the chain, then round her: out of the cloth (as at rest)
        for (const b of BALLS) b.p.copy(b.off).applyMatrix4(b.bone.matrixWorld).applyMatrix4(inv);
        for (const L of LEGS) { L.A.setFromMatrixPosition(SK[L.a].matrixWorld).applyMatrix4(inv); L.B.setFromMatrixPosition(SK[L.b].matrixWorld).applyMatrix4(inv); }
        for (const S of ['R', 'L']) { const A = ARMS[S]; A.el.setFromMatrixPosition(SK['farm' + S].matrixWorld).applyMatrix4(inv); A.wr.setFromMatrixPosition(SK['hand' + S].matrixWorld).applyMatrix4(inv);
          A.tip.subVectors(A.wr, A.el).setLength(0.085).add(A.wr); }
        const still = API.move === 'pose';
        for (const S of ['R', 'L']) { const b = BELL[S]; if (!b.has) continue; const s2 = st[S], still2 = still || !s2.init; s2.init = true;
          mF.multiplyMatrices(inv, SK['farm' + S].matrixWorld); qF.setFromRotationMatrix(mF); E.setFromMatrixPosition(mF);
          Er.set(...b.E0);
          stretch(S, E, Er, s2.J, s2.Jp, L1, 1, s2.q1, still2);
          place(SK[b.b1], E, Er, s2.q1, ROOT);
          const Jr = V(...b.J0), Jn = V().copy(Jr).sub(Er).applyQuaternion(s2.q1).add(E);       // where the first stretch's end is
          stretch(S, Jn, Jr, s2.K, s2.Kp, L2, 2, s2.q2, still2);
          place(SK[b.b2], Jn, Jr, s2.q2, ROOT);
        }
      });
      // the paintings' pose (arms 30 degrees out): the bells hang straight down from her elbows there, so their painted look is read
      // from where they hang then (the rig the paint is worked out with does not run this hook)
      W.afterPaint((parts) => {
        for (const p of parts) { const S = p.key === 'd3BellR' ? 'R' : p.key === 'd3BellL' ? 'L' : null; if (!S) continue;
          const b = BELL[S], g = p.mesh.geometry, P = g.attributes.position.array, N = g.attributes.normal.array, n = P.length / 3;
          const sh = W.SK['uarm' + S].userData.rest, ang = b.s * (30 * W.DEG - W.A_POSE), ca = Math.cos(ang), sa = Math.sin(ang);
          const rot = (x, y) => [ca * x - sa * y, sa * x + ca * y];
          const e = rot(b.E0[0] - sh.x, b.E0[1] - sh.y), dE = [e[0] + sh.x - b.E0[0], e[1] + sh.y - b.E0[1]];
          const PP = new Float32Array(n * 3), PN = new Float32Array(n * 3), PE = new Float32Array(n * 3);
          for (let i = 0; i < n; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], wa = b.WA[i] == null ? 1 : b.WA[i], wb = 1 - wa;
            const r = rot(x - sh.x, y - sh.y), rn = rot(N[i * 3], N[i * 3 + 1]);
            PP[i * 3] = wa * (r[0] + sh.x) + wb * (x + dE[0]); PP[i * 3 + 1] = wa * (r[1] + sh.y) + wb * (y + dE[1]); PP[i * 3 + 2] = z;
            const nx = wa * rn[0] + wb * N[i * 3], ny = wa * rn[1] + wb * N[i * 3 + 1], nz = N[i * 3 + 2], L = Math.hypot(nx, ny, nz) || 1;
            PN[i * 3] = nx / L; PN[i * 3 + 1] = ny / L; PN[i * 3 + 2] = nz / L;
            // her forearm and hand stand in front of the bell in the side painting: there it is read from the front and back paintings
            // the paintings are read a little in toward the bell's middle (the painted bells are a little narrower near the elbow)
            const ax = b.AX[i], rA = rot(ax[0] - sh.x, ax[1] - sh.y), cx = wa * (rA[0] + sh.x) + wb * (ax[0] + dE[0]), cz = ax[2];
            const tt = b.TT[Math.min(Math.floor(i / b.cols), b.TT.length - 1)][(i % b.cols) % (b.cols - 1)][0], k = lerp(0.62, 0.94, sm(0.0, 0.25, tt));
            PP[i * 3] = cx + (PP[i * 3] - cx) * k; PP[i * 3 + 2] = cz + (PP[i * 3 + 2] - cz) * k;
            const py = PP[i * 3 + 1], pz = PP[i * 3 + 2];
            PE[i * 3] = 1; PE[i * 3 + 1] = 1; PE[i * 3 + 2] = 1 - sm(-0.055, -0.03, pz) * sm(0.70, 0.74, py) * sm(1.0, 0.97, py); }
          g.setAttribute('aPP', new THREE.Float32BufferAttribute(PP, 3)); g.setAttribute('aPN', new THREE.Float32BufferAttribute(PN, 3)); g.setAttribute('aPE', new THREE.Float32BufferAttribute(PE, 3));
        }
      });
    }

    // ======================= paint corrections =======================
    W.afterPaint((parts) => {
      const fix = (mesh, pairs) => { for (const key of ['aPP', 'aPN', 'aPE']) { const at = mesh.geometry.attributes[key]; if (!at) continue; const A = at.array;
        for (const [i, j] of pairs) { A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; } at.needsUpdate = true; } };
      for (const p of parts) {
        if (p.key === 'd3Bodice') {
          // under her arms (hidden from the side painting by her arm) the front and back paintings are read inside the painted bodice,
          // not in the gap between her arm and her body
          const PP = p.mesh.geometry.attributes.aPP, PE = p.mesh.geometry.attributes.aPE;
          for (let i = 0; i < PP.count; i++) { const x = PP.array[i * 3], y = PP.array[i * 3 + 1], lim = lerp(0.098, 0.125, sm(1.13, 1.27, y));
            if (y < 1.30 && Math.abs(x) > lim) PP.array[i * 3] = Math.sign(x) * lerp(Math.abs(x), lim, 1 - PE.array[i * 3 + 2]); }
          PP.needsUpdate = true;
        }
        if (p.key === 'd3Skirt') {
          // the turned-up hem takes the colour of the cloth just outside it
          const pairs = [], src = skirtRows - 5;
          for (let r = skirtRows - 3; r < skirtRows; r++) for (let c = 0; c < skirtCols; c++) pairs.push([r * skirtCols + c, src * skirtCols + c]); fix(p.mesh, pairs);
          // her hips are wider than the painted ones: the front and back paintings are read a little further in, inside the painted
          // skirt (not on the bell sleeves beside it); the side painting, where the bell sleeve hangs over the skirt, is not used there
          const PP = p.mesh.geometry.attributes.aPP, PE = p.mesh.geometry.attributes.aPE;
          for (let i = 0; i < PP.count; i++) { const x = PP.array[i * 3], y = PP.array[i * 3 + 1], z = PP.array[i * 3 + 2];
            if (y < 1.14) { const hw = cprof(FL, y)[0] - 0.016, my = envR(y, PI / 2); if (Math.abs(x) > 0.6 * hw) { const k = Math.min(1, hw / my); PP.array[i * 3] = x * lerp(1, k, sm(0.6 * hw, 0.9 * hw, Math.abs(x))); } }
            const hide = sm(0.56, 0.62, y) * sm(1.01, 0.98, y) * sm(0.095, 0.07, z) * sm(-0.16, -0.13, z);
            PE.array[i * 3 + 2] *= 1 - hide; }
          PP.needsUpdate = true; PE.needsUpdate = true;
        }
      }
    });

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'toenail']);
    W.hideSkin((x, y, z) => y > 0.80 && y < topB(x, z) - 0.030, ['dollTrunk']);
    W.hideSkin((x, y, z) => y > 0.45, ['dollLeg']);
    W.hideSkin((x, y, z) => { const s = x < 0 ? -1 : 1; DOLL.toLocal(s, x, z, L2v); return y < cutY(L2v[0], L2v[1]) - 0.010; }, ['dollFoot']);
    W.hideSkin((x, y, z) => { const S = x < 0 ? 'R' : 'L', f = W.armFrame(S, x, y, z); return f.sl < 0.205; }, ['arm']);
  },
};
