// D7, the nightgown (D7A.png, D7B.png): a long, loose white linen nightgown. A wide round neckline gathered on a drawstring casing,
// tied in a small bow at the front with two thin ends hanging over her chest; from the gathers the cloth falls in soft folds over her
// shoulders, bust and shoulder blades and hangs loose, an easy A-line to just above her ankles. Full raglan-like sleeves, gathered at
// the shoulder, billowing below the elbow and gathered into a narrow elastic cuff at each wrist. She is barefoot, hair in the bun.
// Pieces: d7Gown (neckline to hem, one piece), d7Neckband (the gathered casing round the neckline), d7SleeveR/L, d7CuffR/L, d7Tie.
// The gown hugs her (a few millimetres off) from the neckline over her shoulders, bust and shoulder blades, and below her bust stands
// out as a tent read from the paintings' outline; it is carried by her body above her waist and by the skirt chains below, which a
// frame hook keeps off her legs (as D1/D2 do it). The folds are real shape; their light and the linen's weave come from the paintings.
// Her hands are kept resting on the gown, not sunk into it: a frame hook turns her upper arm out when her hand would be inside it.
// Paintings: the prep was run on agents/D7/D7A_notie.png (made by agents/D7/notie.py): the painted tie taken out of the front and
// side views (the tie is its own piece), and the side view's hand, cuff and lowest billow of the sleeve replaced by the gown's cloth
// from lower down (the painted arm is shorter than hers, so on her the gown shows where the painting has a hand).
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.D7 = {
  name: 'Linen nightgown', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smax } = W;
    const Fs = W.Fsnug;

    // ----- materials: white linen (kept bright: a pale tint multiplied on the painting, a little more of it shown in shade) -----
    const LC = '#eaf1f1';
    const linen = W.paint({ rough: 0.93, emis: 0.34, env: 0.12, color: LC, double: true });
    const linenS = W.paint({ rough: 0.93, emis: 0.34, env: 0.12, color: LC, double: true });
    const linenB = W.paint({ rough: 0.90, emis: 0.36, env: 0.12, color: LC });
    const tieMat = W.std({ color: W.lin('#ece8e4'), roughness: 0.62, envMapIntensity: 0.3 });

    // ----- small helpers -----
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
    function ribbon(P, NV) {                              // a flat cord: points with a width direction w and a face direction n
      const rings = []; NV = NV || 8;
      for (const q of P) { const ring = [];
        for (let j = 0; j < NV; j++) { const a = (j / NV) * TAU, ca = Math.cos(a), sa = Math.sin(a), cx = Math.sign(ca) * Math.pow(Math.abs(ca), 0.4), sy = Math.sign(sa) * Math.pow(Math.abs(sa), 0.4);
          ring.push(add(add(q.p, q.w, q.hw * cx), q.n, q.ht * sy)); } rings.push(ring); }
      return orient(W.loft(rings, { capA: true, capB: true }), rings);
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

    // ======================= her body's outline round the gown's middle line =======================
    // by height and angle (a 0 at the front, PI/2 her left), found from outside in (so her legs count as one); finer over her shoulders
    const SKC = -0.015, NA = 96;
    const YS = []; for (let y = 1.380; y > 1.199; y -= 0.004) YS.push(+y.toFixed(4)); for (let y = 1.19; y > 0.615; y -= 0.01) YS.push(+y.toFixed(4));
    const NB = YS.length, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YS[i];
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = y > 1.2 ? 0.22 : 0.32;                     // marched in from outside by her (signed) distance: it never steps past her
        for (let k = 0; k < 60 && r > 0; k++) { const g = G(r); if (g < 0.0003) break; r -= Math.max(g * 0.95, 0.0004); }
        BT[i * NA + j] = Math.max(r, 0); } }
    const rowOf = (y) => { if (y >= YS[0]) return 0; if (y <= YS[NB - 1]) return NB - 1.001; if (y >= 1.2) return (YS[0] - y) / 0.004; let i = YS.findIndex((v) => v < 1.2) - 1; return i + (YS[i] - y) / (YS[i] - YS[i + 1]) * 1; };
    const rowOf2 = (y) => { if (y >= YS[0]) return 0; if (y <= YS[NB - 1]) return NB - 1.001; let i = 0; while (i < NB - 2 && YS[i + 1] > y) i++; return i + (YS[i] - y) / (YS[i] - YS[i + 1]); };
    const bodyR = (y, a) => { const fi = cl(rowOf2(y), 0, NB - 1.001), i = Math.floor(fi), u = fi - i; const fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    void rowOf;

    // ======================= the gown =======================
    // the neckline: wide and round, lowest at the front (1.318), level over her shoulders and across the back of her neck
    // (the casing's top edge sits 2 mm above it: 1.313 across the front, rising over her shoulders to 1.347, 1.335 across the back)
    const neckY = (a) => { const c = Math.cos(a); return c >= 0 ? lerp(1.311, 1.343, sm(0.80, 0.12, c)) : lerp(1.343, 1.333, sm(-0.25, -0.80, c)); };
    const HEM = 0.146, YB = 1.235;                        // the hem; the height below which the rings are level
    // the paintings' outline below her bust (half width, front and back from the middle line), less the folds standing out of it
    const FL = [[1.30, [0.100, 0.090, 0.084]], [1.26, [0.112, 0.124, 0.092]], [1.20, [0.120, 0.130, 0.104]], [1.15, [0.130, 0.134, 0.113]], [1.10, [0.140, 0.138, 0.121]], [1.05, [0.151, 0.141, 0.128]],
      [1.00, [0.161, 0.145, 0.135]], [0.95, [0.169, 0.148, 0.142]], [0.90, [0.176, 0.151, 0.148]], [0.80, [0.185, 0.157, 0.157]], [0.70, [0.190, 0.161, 0.162]], [0.60, [0.194, 0.165, 0.166]],
      [0.50, [0.198, 0.168, 0.170]], [0.40, [0.202, 0.172, 0.173]], [0.30, [0.205, 0.175, 0.176]], [0.20, [0.208, 0.178, 0.179]], [0.14, [0.209, 0.180, 0.180]]];
    const gAmp = (y) => y > 1.22 ? lerp(0.0024, 0.0036, sm(1.33, 1.22, y)) : lerp(0.0036, 0.017, Math.pow(sm(1.22, HEM, y), 1.15));
    const flareR = (y, a) => { const v = cprof(FL, y), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2], k = 0.80 * gAmp(y);
      return 1 / Math.sqrt((s / (v[0] - k)) * (s / (v[0] - k)) + (c / (rz - k)) * (c / (rz - k))); };
    const clear = (y) => y > 1.22 ? 0.0032 : lerp(0.0032, 0.0065, sm(1.22, 0.95, y));
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), 0.022);
    // folds: fine gathers radiating from the neckline, merging into fewer, deeper soft folds toward the hem
    const fold = (a, y) => {
      const t = sm(1.26, 0.70, y), ph = 0.35 * sm(1.0, HEM, y) * Math.sin(2 * a + 0.4);
      const fine = 0.55 * Math.sin(a * 52 + 0.6 * Math.sin(a * 7)) + 0.30 * Math.sin(a * 31 + 1.7 + 0.5 * Math.sin(a * 4)) + 0.15 * Math.sin(a * 17 + 0.8);
      const main = 0.50 * Math.sin(a * 21 + ph + 0.8 * Math.sin(a * 3 + 0.5)) + 0.32 * Math.sin(a * 13 + 1.3 + ph * 1.5 + 0.6 * Math.sin(a * 2)) + 0.18 * Math.sin(a * 34 + 2.1 + ph);
      return lerp(fine, main, t);
    };
    const gownR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    const hemY = (a) => HEM + 0.003 * Math.sin(a * 3 + 1) - 0.004 * (0.5 + 0.5 * fold(a, HEM));
    const at = (y, a, dr) => { const r = gownR(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
    const NU = 288, cols = NU + 1;
    let gownRows = 0;
    {
      const rings = [], NT = 30, NL = 78;
      // the top edge, turned under the casing
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(neckY(a) - 0.003, a, -0.0020)); } rings.push(ring); }
      // from the neckline to YB: rings sloping from the neckline's shape to level, close together over her shoulders
      for (let i = 0; i <= NT; i++) { const u = i / NT, f = 0.65 * u + 0.35 * u * u, ring = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, y = lerp(neckY(a) - 0.004, YB, f); ring.push(at(y, a)); } rings.push(ring); }
      // level rings down to the hem (closer together near the top)
      for (let i = 1; i <= NL; i++) { const u = i / NL, f = 0.25 * u * u + 0.75 * u, y0 = lerp(YB, HEM, f), ring = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, y = i === NL ? hemY(a) : lerp(y0, hemY(a), f * sm(0.40, HEM, y0)); ring.push(at(y, a)); } rings.push(ring); }
      // the hem: a rounded edge, then turned up inside 2.5 cm
      { const r0 = [], r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemY(a); r0.push(at(h - 0.0015, a, -0.0016)); r1.push(at(h + 0.0005, a, -0.0034)); r2.push(at(h + 0.025, a, -0.0038)); } rings.push(r0, r1, r2); }
      const g = W.loft(rings, {});
      gownRows = rings.length;
      W.part('d7Gown', g, (x, y, z, i) => {
        const a = ((i % cols) % NU) / NU * TAU, yb = Math.max(y, 0.90), rb = bodyR(yb, a) - 0.004, wb = W.wBody(rb * Math.sin(a), yb, SKC + rb * Math.cos(a));
        if (y > 1.10) return wb;
        return W.mixW(wb, W.wSkirt(x, y, z), sm(1.10, 1.00, y));
      }, { mat: linen });
    }

    // ======================= the casing round the neckline =======================
    // a gathered band 1.3 cm deep standing 4 mm off the gown, rounded at its top and bottom, with tiny ruffles
    {
      const NC = 360, NS = 12, secs = [];
      for (let j = 0; j <= NC; j++) {
        const a = ((j % NC) / NC) * TAU, y0 = neckY(a) + 0.0025, y1 = neckY(a) - 0.011;
        const rip = 0.0011 * Math.sin(a * 96 + 0.4 * Math.sin(a * 11)), sec = [];
        for (let k = 0; k < NS; k++) { const ph = (k / NS) * TAU, cy = Math.cos(ph), sx = Math.sin(ph);
          // section: a rounded slot, y from y1 to y0, from just inside the gown to 4 mm out
          const yy = lerp(y1, y0, 0.5 + 0.5 * Math.sign(cy) * Math.pow(Math.abs(cy), 0.55)), out = 0.5 + 0.5 * Math.sign(sx) * Math.pow(Math.abs(sx), 0.55);
          const r = bodyR(yy, a) + 0.0024 + out * (0.0042 + rip) + 0.0008 * sm(y1 + 0.004, y1, yy);
          sec.push([r * Math.sin(a), yy + 0.0007 * Math.sin(a * 96 + 1.1) * out, SKC + r * Math.cos(a)]); }
        secs.push(sec);
      }
      const g = W.loft(secs, {});
      W.part('d7Neckband', orient(g, secs), (x, y, z) => { const a = Math.atan2(x, z - SKC), y2 = y - 0.004, rb = bodyR(y2, a) - 0.004; return W.wBody(rb * Math.sin(a), y2, SKC + rb * Math.cos(a)); }, { mat: linenB });
    }

    // ======================= the sleeves =======================
    // full from the shoulder (gathered into the gown's top), billowing below the elbow (most on the outer side and the back),
    // drawn in to the cuff just above her wrist; their lower edge tucks inside the cuff
    const C0 = 0.414, C1 = 0.444;                         // the cuff, metres down her arm
    const sl0 = (a) => lerp(-0.050, 0.046, Math.pow((1 - Math.cos(a)) / 2, 2));
    const sOff = (sl, a) => {
      const side = 0.78 + 0.22 * Math.cos(a) + 0.22 * Math.max(0, -Math.sin(a)) - 0.10 * Math.max(0, -Math.cos(a));
      const up = 0.006 + 0.008 * sm(-0.05, 0.03, sl) + 0.008 * sm(0.05, 0.22, sl);                  // the gathered shoulder and upper arm
      const puff = 0.017 * Math.pow(sm(0.18, 0.355, sl), 1.2) * sm(C0 + 0.004, 0.372, sl);              // the billow over her forearm
      const inn = sm(0.392, C0 - 0.002, sl);                                                             // drawn in to the cuff
      return lerp((up + puff) * side + 0.0016 * Math.sin(a * 13 + sl * 20) * sm(0.0, 0.1, sl), 0.0045, inn);
    };
    const ARMC = (S, sl) => { const c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), c3 = W.armPt(S, sl, PI / 2), c4 = W.armPt(S, sl, 1.5 * PI);
      return [(c1[0] + c2[0] + c3[0] + c4[0]) / 4, (c1[1] + c2[1] + c3[1] + c4[1]) / 4, (c1[2] + c2[2] + c3[2] + c4[2]) / 4]; };
    const aPt = (S, sl, a, e) => { const p = W.armPt(S, sl, a), ax = ARMC(S, sl); return add(p, norm([p[0] - ax[0], p[1] - ax[1], p[2] - ax[2]]), e); };
    const sleeveData = {};
    for (const S of ['R', 'L']) {
      const SN = 64, NR = 54, rings = [], SLs = [];
      const row = (f, slF, de) => { const ring = [], sls = [];
        for (let j = 0; j < SN; j++) { const a = (j / SN) * TAU, s0 = sl0(a), sl = slF != null ? slF : lerp(s0, C0 + 0.010, f);
          ring.push(aPt(S, sl, a, sOff(sl, a) + (de || 0))); sls.push([sl, a]); }
        rings.push(ring); SLs.push(sls); };
      for (let i = 0; i <= NR; i++) { const t = i / NR; row(1 - Math.pow(1 - t, 1.2)); }
      const g = orient(W.loft(rings, {}), rings), sc = SN + 1;
      sleeveData[S] = { nRows: rings.length, cols: sc };
      W.part('d7Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / sc), j = i % sc; if (r >= rings.length) return W.wArmSL(S, 0.2); const [sl, a] = SLs[r][j % SN];
        const wa = W.wArmSL(S, cl(sl, 0.0, 0.446), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.5 * sm(0.03, -0.020, sl)) : wa; }, { mat: linenS });
      // the cuff: a gathered band, its edges rounded and turned in
      { const CN = 72, rr = [], cs = [];
        const crow = (sl, e) => { const ring = []; for (let j = 0; j < CN; j++) { const a = (j / CN) * TAU; ring.push(aPt(S, sl, a, e + 0.0009 * Math.sin(a * 22 + sl * 300))); } rr.push(ring); cs.push(sl); };
        crow(C0 + 0.004, 0.0028); crow(C0 + 0.001, 0.0050); crow(C0 + 0.003, 0.0068); crow(C0 + 0.009, 0.0074); crow((C0 + C1) / 2, 0.0072); crow(C1 - 0.008, 0.0074);
        crow(C1 - 0.002, 0.0068); crow(C1 + 0.0005, 0.0048); crow(C1 - 0.002, 0.0026); crow(C1 - 0.014, 0.0022);
        const gc = orient(W.loft(rr, {}), rr), ccols = CN + 1;
        W.part('d7Cuff' + S, gc, (x, y, z, i) => W.wArmSL(S, cs[Math.min(cs.length - 1, Math.floor(i / ccols))], ((i % ccols) / CN) * TAU), { mat: linenB });
      }
    }

    // ======================= the tie =======================
    // a thin white cord bow at the middle of the neckline in front; its two ends hang over her chest
    {
      const parts = [], aF = 0, yk = neckY(aF) - 0.008, rk = bodyR(yk, aF) + 0.0075, zk = SKC + rk, wk = W.wBody(0, yk, SKC + bodyR(yk, 0) - 0.004);
      const CW = 0.0026, CT = 0.0009;                     // the tape's half width and half thickness
      const onCloth = (x, y, e) => { const a = Math.atan2(x, 0.1); return SKC + (gownR(y, a) + e) * Math.cos(a); };
      // the knot
      { const P = []; for (let k = 0; k <= 14; k++) { const ph = (k / 14) * TAU; P.push({ p: [0, yk + 0.0040 * Math.sin(ph), zk + 0.0028 * Math.cos(ph)], w: [1, 0, 0], n: norm([0, Math.sin(ph), Math.cos(ph)]), hw: 0.0038, ht: CT }); } parts.push(ribbon(P)); }
      // two loops drooping from the knot, out to the sides (as painted: their tips 4 cm below it)
      for (const [s, tx, ty] of [[-1, -0.025, yk - 0.039], [1, 0.032, yk - 0.041]]) { const P = [], N = 30;
        const ax = [tx, ty - yk], L = Math.hypot(ax[0], ax[1]), u0 = [ax[0] / L, ax[1] / L], pn = [-u0[1] * s, u0[0] * s];
        const lp = (ph) => { const u = (1 - Math.cos(ph)) / 2, wd = 0.0068 * Math.sin(ph) * Math.pow(Math.max(u, 0), 0.35), x = s * 0.002 + ax[0] * u + pn[0] * wd, y = yk + ax[1] * u + pn[1] * wd;
          return [x, y, Math.max(zk + 0.001, onCloth(x, y, 0.0045)) + 0.0025 * Math.sin(ph * 0.5)]; };
        for (let k = 0; k <= N; k++) { const ph = (k / N) * TAU, p = lp(ph), q = lp(ph + 0.01), t = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), n = [0, 0, 1], w = norm(cross(n, t));
          P.push({ p, w, n, hw: CW, ht: CT }); }
        parts.push(ribbon(P)); }
      // the ends: down from the knot, resting on the gown where it stands out (her bust), then hanging straight
      for (const [x0, x1, yEnd] of [[-0.003, -0.007, 1.170], [0.004, 0.019, 1.156]]) { const P = [], N = 40; let zmax = zk - 0.001;
        for (let k = 0; k <= N; k++) { const t = k / N, y = lerp(yk - 0.003, yEnd, t), x = lerp(x0, x1, Math.pow(t, 0.8));
          zmax = Math.max(zmax, onCloth(x, y, 0.0030)); P.push({ p: [x, y, zmax], w: [1, 0, 0], n: [0, 0, 1], hw: CW, ht: CT }); }
        parts.push(ribbon(P)); }
      W.part('d7Tie', merge(parts), (x, y, z) => y > 1.26 ? wk : W.wBody(x, y, SKC + bodyR(y, Math.atan2(x, 0.1)) - 0.004), { mat: tieMat, occluder: false });
    }

    // ======================= her legs keep out of the gown =======================
    // As D1 (wardrobe/D1.js) does it: each frame the skirt chains are turned, level by level, so that each bone's end and middle clear
    // her padded thighs and shins; each chain goes at least 60% as far as the chain beside it, so the cloth between them cannot cut a corner.
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.085, NC = CH.length, NL = CH[0].names.length;
      const tipOff = CH.map((c) => c.names.map((nm, k) => new T3.Vector3().subVectors(c.pts[k + 1], c.pts[k])));
      const A = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), V = new T3.Vector3(), M = new T3.Vector3();
      const pq = new T3.Quaternion();
      const legs = [];
      for (const S of ['R', 'L']) legs.push([new T3.Vector3(), new T3.Vector3(), 0.078, 0.056, 'thigh' + S, 'shin' + S], [new T3.Vector3(), new T3.Vector3(), 0.056, 0.042, 'shin' + S, 'foot' + S]);
      const restOf = (p) => { const out = []; for (const L of legs) { const a = W.SK[L[4]].userData.rest, b = W.SK[L[5]].userData.rest;
        for (let j = 0; j <= 5; j++) out.push(V.copy(a).lerp(b, j / 5).distanceTo(p)); } return out; };
      const restT = CH.map((c) => c.names.map((nm, k) => restOf(c.pts[k + 1])));
      const restM = CH.map((c) => c.names.map((nm, k) => restOf(M.copy(c.pts[k]).add(c.pts[k + 1]).multiplyScalar(0.5))));
      const push = (p, RD, out) => {
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
        for (let ci = 0; ci < NC; ci++) for (let k = 0; k < NL; k++) { const b = SK[CH[ci].names[k]]; b.getWorldPosition(M); tipOf(ci, k, b, DIR0[ci][k]).sub(M).normalize(); }
        for (let k = 0; k < NL; k++) {
          for (let ci = 0; ci < NC; ci++) {
            const b = SK[CH[ci].names[k]];
            if (k > 0) { b.getWorldPosition(P[ci]); cur.copy(tipOf(ci, k, b, Tp[ci])).sub(P[ci]).normalize(); if (cur.dot(DIR0[ci][k]) < 0.99999) turn(b, qa.setFromUnitVectors(cur, DIR0[ci][k])); }
            b.getWorldPosition(P[ci]); tipOf(ci, k, b, Tp[ci]); cur.copy(Tp[ci]).sub(P[ci]); const len = cur.length(); cur.multiplyScalar(1 / len);
            ANG[ci] = 0; Q[ci].identity();
            let best = 0;
            if (push(Tp[ci], restT[ci][k], dm)) { dT.copy(Tp[ci]).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dT), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dT); } }
            M.copy(P[ci]).add(Tp[ci]).multiplyScalar(0.5);
            if (push(M, restM[ci][k], dm)) { dM.copy(M).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dM), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dM); } }
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

    // ======================= her hands keep outside the gown =======================
    // With her arms straight down (as most moves hold them) her hands and the billow of her sleeves would sink into the gown's sides:
    // each frame, if her fingertips, wrist or forearm are inside the gown's outline (its shape at rest, in her hips' frame), her upper
    // arm is turned out about her forward line just far enough that they rest on the cloth (a hand brushing a full skirt).
    {
      const T3 = W.THREE, hipsR = W.SK.hips.userData.rest, Mi = new T3.Matrix4(), pw = new T3.Vector3(), fw = new T3.Vector3(), q = new T3.Quaternion(), pq = new T3.Quaternion(), hq = new T3.Quaternion();
      const envOut = (p, margin) => {                    // > 0 outside the gown's outline (rest shape, folds included) by that much
        const y = p.y; if (y > 1.12 || y < 0.12) return 1;
        const v = cprof(FL, y), x = p.x, z = p.z - SKC, rz = z >= 0 ? v[1] : v[2], k = gAmp(y) * 0.2 + margin;
        return Math.sqrt((x / (v[0] + k)) * (x / (v[0] + k)) + (z / (rz + k)) * (z / (rz + k))) - 1;
      };
      const pts = {};
      for (const S of ['R', 'L']) { const ar = (sl) => { const c = ARMC(S, sl); return new T3.Vector3(c[0], c[1], c[2]); };
        pts[S] = [['hand' + S, ar(0.458).add(new T3.Vector3(W.armDir[S].x, W.armDir[S].y, W.armDir[S].z).multiplyScalar(0.085)), 0.012], ['hand' + S, ar(0.458), 0.016], ['farm' + S, ar(0.36), 0.030], ['farm' + S, ar(0.28), 0.030]]; }
      const worst = (SK, S) => { let m = 9; Mi.copy(SK.hips.matrixWorld).invert();
        for (const [bn, rp, mg] of pts[S]) { const b = SK[bn]; pw.copy(rp).sub(b.userData.rest).applyMatrix4(b.matrixWorld).applyMatrix4(Mi).add(hipsR); m = Math.min(m, envOut(pw, mg)); } return m; };
      W.onFrame((SK) => {
        SK.hips.getWorldQuaternion(hq); fw.set(0, 0, 1).applyQuaternion(hq);
        for (const S of ['R', 'L']) {
          if (worst(SK, S) >= 0) continue;
          const b = SK['uarm' + S], sg = S === 'L' ? 1 : -1, st = 0.026;
          for (let k = 0; k < 22; k++) {
            b.parent.getWorldQuaternion(pq); q.setFromAxisAngle(fw, sg * st);
            b.quaternion.premultiply(pq.clone().invert().multiply(q).multiply(pq)); b.updateMatrixWorld(true);
            if (worst(SK, S) >= 0) break;
          }
        }
      });
    }

    // ======================= paint corrections =======================
    W.afterPaint((parts) => {
      const fix = (mesh, pairs) => { for (const key of ['aPP', 'aPN', 'aPE']) { const at2 = mesh.geometry.attributes[key]; if (!at2) continue; const A = at2.array;
        for (const [i, j] of pairs) { A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; } at2.needsUpdate = true; } };
      for (const p of parts) {
        const PP = p.mesh.geometry.attributes.aPP; if (!PP) continue;
        if (p.key === 'd7Gown') {
          // where the gown is wider than the painted one (over her hips), the front and back paintings are read squeezed in to their
          // own outline, so its sides never read the background beside it (filled with the colours of her painted hands)
          const EDGE = [[1.12, [0.130]], [1.10, [0.131]], [1.05, [0.137]], [1.00, [0.146]], [0.95, [0.156]], [0.90, [0.165]], [0.85, [0.172]], [0.80, [0.177]],
            [0.70, [0.182]], [0.60, [0.186]], [0.50, [0.189]], [0.40, [0.192]], [0.30, [0.195]], [0.20, [0.195]], [0.10, [0.195]]];
          const mx = new Float32Array(200);
          for (let i = 0; i < PP.count; i++) { const b = cl(Math.round(PP.array[i * 3 + 1] * 100), 0, 199); mx[b] = Math.max(mx[b], Math.abs(PP.array[i * 3])); }
          for (let i = 0; i < PP.count; i++) { const y = PP.array[i * 3 + 1]; if (y > 1.12) continue; const b = cl(Math.round(y * 100), 0, 199);
            const m = Math.max(mx[Math.max(0, b - 1)], mx[b], mx[Math.min(199, b + 1)]), e = cprof(EDGE, y)[0]; if (m > e) PP.array[i * 3] *= lerp(1, e / m, sm(1.12, 1.08, y)); }
          PP.needsUpdate = true;
          const pairs = [], src = gownRows - 5;                    // the turned-up hem takes the cloth just above the hem
          for (let r = gownRows - 3; r < gownRows; r++) for (let c = 0; c < cols; c++) pairs.push([r * cols + c, src * cols + c]);
          for (let c = 0; c < cols; c++) pairs.push([c, 2 * cols + c]);                    // the turned-under top edge: the cloth below it
          fix(p.mesh, pairs);
          // below her arms nothing but her own arm hides the gown's sides from the side painting in its pose, and her arm is not there
          // when she moves: the sides take the side painting there (its hand painted out: see the note at the top); under her arms
          // too (in its pose all three views had her arm in front of them there), where it shows the painted sleeve's white cloth
          const E = p.mesh.geometry.attributes.aPE;
          const N = p.mesh.geometry.attributes.aPN.array;
          for (let i = 0; i < PP.count; i++) { const y = PP.array[i * 3 + 1], nx = Math.abs(N[i * 3]);
            E.array[i * 3 + 2] = Math.max(E.array[i * 3 + 2], y < 1.12 ? 1 : sm(1.31, 1.25, y) * sm(0.25, 0.5, nx)); }
          E.needsUpdate = true; }
        if (/^d7Sleeve/.test(p.key)) {                 // her sleeves' inner sides: the side painting (the sleeve seen from her side) rather than a patchwork
          const E = p.mesh.geometry.attributes.aPE; for (let i = 0; i < PP.count; i++) E.array[i * 3 + 2] = 1; E.needsUpdate = true; }
        if (p.key === 'd7Neckband') { for (let i = 0; i < PP.count; i++) PP.array[i * 3 + 1] -= 0.003; PP.needsUpdate = true; }   // read the casing a little low: its top edge, not her neck
        if (/^d7Cuff/.test(p.key)) { const s = p.key.endsWith('L') ? 1 : -1, d = [s * Math.sin(32 * W.DEG), -Math.cos(32 * W.DEG)];     // read the cuff a little up her arm: not her hand
          for (let i = 0; i < PP.count; i++) { PP.array[i * 3] -= d[0] * 0.006; PP.array[i * 3 + 1] -= d[1] * 0.006; } PP.needsUpdate = true; }
      }
    });

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts']);
    W.hideSkin((x, y, z) => y > 0.80 && y < neckY(Math.atan2(x, z - SKC)) - 0.018, ['dollTrunk']);
    W.hideSkin((x, y, z) => y > 0.30, ['dollLeg']);           // her thighs, knees and upper shins: always under the gown, so a knee pressing into the cloth never shows
    W.hideSkin((x, y, z) => { const S = x < 0 ? 'R' : 'L', f = W.armFrame(S, x, y, z); return f.sl < C0 - 0.016; }, ['arm']);
  },
};
