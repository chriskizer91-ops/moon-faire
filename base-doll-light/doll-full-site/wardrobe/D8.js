// D8, the dancer's dress (D8A.png, D8B.png): a sleeveless fitted teal bodice with a scoop neck front and back and wide straps; a wide
// gold sash wrapped round her waist and tied in a knot at her left front hip, its two ends hanging down over the skirt; a full skirt
// to her mid-calf in three gathered tiers (teal, gold, plum at the hem), each tier's top tucked under the tier above, made to twirl.
// Barefoot; the bun. The tiers, the knot and the ends hang on the skirt's soft chains, so they swing and flare when she turns.
// The paintings are read from a cleaned copy of D8A.png (made by /home/claude/agents/D8/clean.py; prep run with --img on it): the
// sash's hanging ends painted out of the front view (refilled from her other side, mirrored), the stray end at her left hip out of the
// back view, and her hand and the ends out of the side view; so the skirt under them reads cloth, and the ends read the gold tier.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.D8 = {
  name: "Dancer's dress", kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smax } = W;
    const F = W.F, Fs = W.Fsnug;

    // ----- materials: a soft cotton jersey bodice, a cotton skirt (both sides drawn: its inside shows when it swings), a cotton sash -----
    const jersey = W.paint({ rough: 0.88, emis: 0.28 });
    const cotton = W.paint({ rough: 0.90, emis: 0.28, double: true });
    const sashMat = W.paint({ rough: 0.80, emis: 0.28, env: 0.2 });
    const sashMatD = W.paint({ rough: 0.80, emis: 0.30, env: 0.2, double: true });

    // ----- small helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    function orient(g, rings, out) {                      // flip a loft's triangles if its middle ring faces inward (or away from 'out')
      const nor = W.computeNormals(g.pos, g.idx), m = Math.floor(rings.length / 2), r = rings[m], n = r.length, cols = n + 1;
      const c = out || r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]); let s = 0;
      for (let j = 0; j < n; j++) { const v = m * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    // a smooth curve through keys [[y, [values]], ...] (Catmull-Rom; keys from high y to low y)
    function cprof(K, x) {
      if (K[0][0] > K[K.length - 1][0]) K = K._r || (K._r = K.slice().reverse());
      const n = K.length; if (x <= K[0][0]) return K[0][1]; if (x >= K[n - 1][0]) return K[n - 1][1];
      let i = 1; while (K[i][0] < x) i++;
      const x0 = K[i - 1][0], x1 = K[i][0], u = (x - x0) / (x1 - x0), A = K[Math.max(0, i - 2)], B = K[i - 1], C = K[i], D = K[Math.min(n - 1, i + 1)];
      return B[1].map((b, j) => { const c = C[1][j], m0 = (c - A[1][j]) / (C[0] - A[0]) * (x1 - x0), m1 = (D[1][j] - b) / (D[0] - B[0]) * (x1 - x0), u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * b + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * c + (u3 - u2) * m1; });
    }

    // ======================= the bodice =======================
    // from under the sash to a scoop neckline front (lowest 1.228) and back (1.216); wide straps over her shoulders (from 8.3 cm to
    // 11.7 cm out from her middle); the armholes down to 1.215 at her sides
    const BOT = 0.988;
    const CZ = (() => { const t = W.trunkAt(1.30); return (t[1] + t[2]) / 2; })();
    const bodR = (x, y, z) => {
      const ax = Math.abs(x), fr = sm(CZ - 0.025, CZ + 0.025, z);
      const xo = lerp(0.118, 0.126, sm(1.34, 1.235, y));                       // the straps' outer edge, the armhole beyond it
      const arm = Math.min(ax - xo, y - 1.215);
      const hw = lerp(0.086, 0.083, fr) - 0.011 * sm(1.30, 1.36, y), yb = lerp(1.216, 1.228, fr), u = ax / hw;
      const yS = u >= 1 ? 9 : yb + 0.075 * (1 - Math.sqrt(1 - u * u));
      const neck = Math.min(hw - ax, y - yS);
      return Math.max(BOT - y, arm, neck, y - 1.362);
    };
    W.snug('d8Bodice', bodR, () => 0.0030, [-0.175, 0.175, 0.982, 1.372, -0.14, 0.13], 0.0046, { mat: jersey });

    // ======================= the skirt: three gathered tiers =======================
    const SKC = -0.006;
    // her body's outline round the skirt's middle line, by height and angle (from outside in, so her legs count as one)
    const NA = 72, YB0 = 1.10, YB1 = 0.66, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; let fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    // each tier: its top, its hem, its painted outline (half width, half depth from the middle line, at the folds' crests), its gathers
    const TIERS = [
      { key: 'd8SkirtTop', TOP: 1.030, HEM: 0.728, ph: 0.0, g0: 0.0016, g1: 0.011, nF: 48, nM: 30,
        FL: [[1.03, [0.090, 0.060, 0.060]], [1.00, [0.112, 0.078, 0.085]], [0.95, [0.150, 0.111, 0.126]], [0.90, [0.171, 0.126, 0.141]], [0.85, [0.188, 0.137, 0.149]], [0.80, [0.203, 0.145, 0.154]], [0.75, [0.216, 0.151, 0.159]], [0.728, [0.221, 0.155, 0.161]]] },
      { key: 'd8SkirtMid', TOP: 0.754, HEM: 0.553, ph: 1.7, g0: 0.0020, g1: 0.012, nF: 50, nM: 33,
        FL: [[0.754, [0.205, 0.145, 0.150]], [0.72, [0.233, 0.170, 0.174]], [0.68, [0.243, 0.178, 0.182]], [0.62, [0.255, 0.187, 0.191]], [0.553, [0.266, 0.196, 0.199]]] },
      { key: 'd8SkirtHem', TOP: 0.579, HEM: 0.335, ph: 3.1, g0: 0.0020, g1: 0.014, nF: 54, nM: 37,
        FL: [[0.579, [0.250, 0.182, 0.185]], [0.54, [0.277, 0.204, 0.206]], [0.47, [0.291, 0.215, 0.217]], [0.40, [0.302, 0.224, 0.226]], [0.335, [0.310, 0.231, 0.233]]] },
    ];
    const clear = (y) => lerp(0.0050, 0.010, sm(1.00, 0.90, y));
    TIERS.forEach((T, i) => {
      T.gAmp = (y) => lerp(T.g0, T.g1, Math.pow(sm(T.TOP, T.HEM, y), 0.7)) * (i === 0 ? sm(1.012, 0.985, y) : 1);      // no folds under the sash
      T.flareR = (y, a) => { const v = cprof(T.FL, y), s = Math.sin(a), c = Math.cos(a), k = 0.85 * T.gAmp(y), rx = v[0] - k, rz = (c >= 0 ? v[1] : v[2]) - k;
        return 1 / Math.sqrt((s / rx) * (s / rx) + (c / rz) * (c / rz)); };
      const up = i > 0 ? TIERS[i - 1] : null;
      T.baseR = (y, a) => {
        let r = smax(bodyR(y, a) + clear(y), T.flareR(y, a), 0.03);
        if (up) { const cap = up.baseR(Math.max(y, up.HEM), a) - 0.0085, t = sm(up.HEM + 0.007, up.HEM - 0.032, y); r = lerp(Math.min(r, cap), r, t); }
        return r;
      };
      // gathers: fine at the tier's top seam, broader and uneven toward its hem (the angle is warped so no two folds are quite alike)
      T.fold = (a, y) => { const t = sm(T.TOP, T.HEM, y), ph = 0.45 * t * Math.sin(2 * a + T.ph), aw = a + 0.035 * Math.sin(5 * a + T.ph) + 0.020 * Math.sin(11 * a + 2 * T.ph);
        const fine = Math.sin(aw * T.nF + T.ph), main = 0.62 * Math.sin(aw * T.nM + ph + T.ph + 0.7 * Math.sin(a * 3 + T.ph)) + 0.38 * Math.sin(aw * (T.nM * 0.55) + 1.3 + ph * 1.5);
        return lerp(fine, main, sm(0.0, 0.35, t)); };
      T.R = (y, a) => T.baseR(y, a) + T.gAmp(y) * (0.5 + 0.5 * T.fold(a, y));
      T.env = (y, a) => T.baseR(y, a) + T.gAmp(y);
      T.hemY = (a) => T.HEM + 0.0025 * Math.sin(a * 3 + 1 + T.ph) - 0.003 * (0.5 + 0.5 * T.fold(a, T.HEM));
    });
    // the outside of the skirt where it shows at height y (the lowest tier that reaches y)
    const tierAt = (y) => (y > TIERS[0].HEM ? TIERS[0] : y > TIERS[1].HEM ? TIERS[1] : TIERS[2]);
    const envR = (y, a) => tierAt(y).env(y, a);
    const skirtInfo = {};
    for (const T of TIERS) {
      const NU = 240, rings = [], ys = [], NV = Math.round((T.TOP - T.HEM) / 0.0115);
      for (let i = 0; i <= NV; i++) { const t = i / NV; ys.push(lerp(T.TOP, T.HEM, t * t * 0.25 + t * 0.75)); }
      const at = (y, a, dr) => { const r = T.R(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
      // the gathered top edge, rolled inward (under the sash, or under the tier above)
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(T.TOP + 0.002, a, -0.0025)); } rings.push(ring); }
      for (const y of ys) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, yy = y === T.HEM ? T.hemY(a) : lerp(y, T.hemY(a), sm(T.TOP, T.HEM, y) * sm(T.HEM + 0.10, T.HEM, y)); ring.push(at(yy, a)); } rings.push(ring); }
      // the hem: a rounded edge, then turned up inside 2.4 cm
      { const r0 = [], r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = T.hemY(a); r0.push(at(h - 0.0016, a, -0.0018)); r1.push(at(h + 0.0004, a, -0.0038)); r2.push(at(h + 0.024, a, -0.0042)); } rings.push(r0, r1, r2); }
      const g = orient(W.loft(rings, {}), rings);
      skirtInfo[T.key] = { rows: rings.length, cols: NU + 1 };
      W.part(T.key, g, (x, y, z) => W.wSkirt(x, y, z), { mat: cotton });
    }

    // ======================= the sash, its knot and its ends =======================
    const SA0 = 0.997, SA1 = 1.088;
    const sashTh = (x, y, z) => { const t = (y - SA0) / (SA1 - SA0), a = Math.atan2(x, z);
      return 0.0098 + 0.0024 * Math.pow(Math.max(0, Math.sin(t * PI * 3.2 + 0.4 + 0.7 * Math.sin(a * 2 + 0.5))), 2) + 0.0016 * sm(0.25, 0.0, t); };
    // the band: rings round her (her body's outline, finer than the skirt's, swollen by the sash's thickness), its edges rounded and
    // turned in a little under itself
    {
      const NA2 = 144, Y0 = 1.100, D2 = 0.006, NB2 = 20, BT2 = new Float32Array(NB2 * NA2);
      for (let i = 0; i < NB2; i++) { const y = Y0 - i * D2;
        for (let j = 0; j < NA2; j++) { const a = (j / NA2) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
          let r = 0.22; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; for (let k = 0; k < 13; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
          BT2[i * NA2 + j] = (lo + hi) / 2; } }
      const body2 = (y, j) => { const fi = cl((Y0 - y) / D2, 0, NB2 - 1.001), i = Math.floor(fi), u = fi - i; return lerp(BT2[i * NA2 + j], BT2[(i + 1) * NA2 + j], u) + 0.0006; };
      const rows = [[SA0 + 0.004, 0.0035], [SA0 + 0.0005, 0.62], [SA0 - 0.0003, 0.86]];
      const NV = 22; for (let i = 0; i <= NV; i++) rows.push([lerp(SA0 + 0.0022, SA1 - 0.0022, i / NV), 1]);
      rows.push([SA1 + 0.0003, 0.86], [SA1 - 0.0005, 0.62], [SA1 - 0.004, 0.0035]);
      const rings = [];
      for (const [y, f] of rows) { const ring = [];
        for (let j = 0; j < NA2; j++) { const a = (j / NA2) * TAU, x0 = Math.sin(a) * 0.1, z0 = SKC + Math.cos(a) * 0.1;
          const r = body2(y, j) + (f < 0.01 ? f : f * sashTh(x0, y, z0)); ring.push([r * Math.sin(a), y, SKC + r * Math.cos(a)]); }
        rings.push(ring); }
      const g = orient(W.loft(rings, {}), rings);
      W.part('d8Sash', g, (x, y, z) => { const a = Math.atan2(x, z - SKC), j = ((Math.round(a / TAU * NA2) % NA2) + NA2) % NA2, r = body2(y, j) - 0.004; return W.wBody(r * Math.sin(a), y, SKC + r * Math.cos(a)); }, { mat: sashMat });
    }
    // the knot at her left front hip: a lumpy, wrapped round knot standing out of the sash
    const KC = (() => { const x = 0.112, y = 1.033; let z = 0.16; while (z > -0.05 && F(x, y, z) > 0) z -= 0.001; return [x, y, z + 0.0105 + 0.020]; })();
    {
      const NR = 22, NU = 30, rings = [];
      for (let i = 0; i <= NR; i++) { const v = 0.04 + 0.92 * i / NR, th = PI * v, sv = Math.sin(th), cv = Math.cos(th), ring = [];
        for (let j = 0; j < NU; j++) { const ph = (j / NU) * TAU;
          const lump = 1 + 0.10 * Math.sin(3 * ph + 6 * v) + 0.07 * Math.sin(5 * ph - 4 * v + 1) + 0.06 * Math.cos(2 * ph + 9 * v);
          const rx = 0.030 * lump, ry = 0.034 * (1 + 0.05 * Math.sin(2 * ph)), rz = 0.026 * lump;
          ring.push([KC[0] + rx * sv * Math.sin(ph), KC[1] - ry * cv, KC[2] + rz * sv * Math.cos(ph) - 0.004 * (1 - Math.cos(ph))]); }
        rings.push(ring); }
      const g = W.loft(rings, { capA: true, capB: true }); orient(g, rings);
      const wk = W.wBody(KC[0] * 0.9, KC[1], KC[2] - 0.04);
      W.part('d8SashKnot', g, () => wk, { mat: sashMat });
    }
    // the two ends: hanging from under the knot over the skirt (the long one outside, to 0.665, cut on the slant; the short one inside)
    const tailInfo = [];
    {
      const parts = [], TH = 0.0026, NW = 9, NL = 40;
      const onSkirt = (x, y) => {           // the angle round her where the outside (skirt, or the sash above it) passes x, and its radius there
        const out = (y, a) => (y > 0.985 ? bodyR(y, a) + 0.0125 : Math.max(envR(y, a), bodyR(y, a) + 0.0125 * sm(0.96, 0.995, y)));
        // hanging cloth leaves the skirt a little above each tier's ruffle, and drapes over it
        const ride = (y, a) => { let m = out(y, a); for (let d = 0.008; d <= 0.048; d += 0.008) m = Math.max(m, out(y - d, a) - 0.30 * d); return m; };
        let a = 0.6, r = 0.2; for (let it = 0; it < 8; it++) { r = ride(y, a); a = Math.asin(cl(x / r, -0.99, 0.99)); }
        return [a, r]; };
      const TAILS = [
        { x0: 0.104, x1: 0.112, hw0: 0.018, hw1: 0.024, y0: 1.022, yEnd: (u) => 0.772 + 0.036 * (u + 1) / 2, off: 0.0040, ph: 0.4 },
        { x0: 0.120, x1: 0.160, hw0: 0.020, hw1: 0.036, y0: 1.020, yEnd: (u) => 0.666 + 0.030 * Math.abs(u + 0.25), off: 0.0085, ph: 2.1 },
      ];
      for (const Tl of TAILS) {
        const rings = [];
        for (let k = 0; k <= NL; k++) { const v = k / NL, ring = [];
          const sheet = (u, side) => {
            const y = lerp(Tl.y0, Tl.yEnd(u), v), q = sm(0, 1, v), x = lerp(Tl.x0, Tl.x1, q) + u * lerp(Tl.hw0, Tl.hw1, Math.pow(q, 0.6));
            const [a, r] = onSkirt(x, y), ripple = 0.0045 * Math.sin(v * 8 + u * 1.6 + Tl.ph) * sm(0.0, 0.25, v) + 0.0035 * (1 - u * u) * sm(0.1, 0.5, v);
            const rr = r + Tl.off + ripple + side * TH / 2, n = [Math.sin(a), 0, Math.cos(a)];
            // near the knot the end comes out of it: lifted off the sash toward the knot's front
            const lift = Math.max(0, (KC[2] - 0.006) - (SKC + rr * Math.cos(a))) * sm(0.10, 0.0, v);
            return [rr * n[0], y, SKC + rr * n[2] + lift]; };
          for (let j = 0; j < NW; j++) ring.push(sheet(-1 + 2 * j / (NW - 1), 1));
          for (let j = NW - 1; j >= 0; j--) ring.push(sheet(-1 + 2 * j / (NW - 1), -1));
          rings.push(ring); }
        const g = W.loft(rings, { capB: true });
        // the front sheet faces out (away from her middle)
        { const nor = W.computeNormals(g.pos, g.idx), cols = 2 * NW + 1, v0 = Math.floor(NL / 2) * cols + Math.floor(NW / 2); const px = g.pos[v0 * 3], pz = g.pos[v0 * 3 + 2] - SKC;
          if (nor[v0 * 3] * px + nor[v0 * 3 + 2] * pz < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; } }
        parts.push(g);
      }
      const m = merge(parts);
      W.part('d8SashEnds', m, (x, y, z) => W.mixW(W.wBody(x * 0.9, y, z - 0.04), W.wSkirt(x, y, z), sm(1.02, 0.95, y)), { mat: sashMatD });
    }

    // ======================= her legs keep out of the skirt =======================
    // (the method of the long winter dress, wardrobe/D6.js) On each of the skirt's twelve chains, joint by joint from the top, points of the
    // skirt where it hangs at that chain (at the joint's tip and halfway along) are tested against her thighs and shins (padded); a
    // point inside is moved the shorter way, out from her middle or up onto the leg, by turning that stretch of the chain about its top.
    // The stretch below is then turned back so it still hangs as it did: the cloth drapes over a knee and falls from it.
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.040, HEM = TIERS[2].HEM;
      const legs = [];
      for (const S of ['R', 'L']) legs.push({ a: 'thigh' + S, b: 'shin' + S, ra: 0.080, rb: 0.057 }, { a: 'shin' + S, b: 'foot' + S, ra: 0.057, rb: 0.044 });
      for (const L of legs) { L.A = new T3.Vector3(); L.B = new T3.Vector3(); L.A0 = W.SK[L.a].userData.rest.clone(); L.B0 = W.SK[L.b].userData.rest.clone(); }
      const V = new T3.Vector3();
      const restRD = (p) => { const out = []; for (const L of legs) for (let j = 0; j <= 6; j++) out.push(V.copy(L.A0).lerp(L.B0, j / 6).distanceTo(p)); return out; };
      const JT = CH.map((c) => c.names.map((nm, k) => {
        const p0 = c.pts[k], p1 = c.pts[k + 1], pr = [];
        for (const y of [p1.y, (p0.y + p1.y) / 2]) {
          if (y > 1.0) continue; const yy = Math.max(y, HEM), r = envR(yy, c.a);
          const q = new T3.Vector3(r * Math.sin(c.a), y, SKC + r * Math.cos(c.a));
          pr.push({ off: q.clone().sub(p0), rd: restRD(q) }); }
        return pr; }));
      const H = new T3.Vector3(), Pw = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), D = new T3.Vector3(), v1 = new T3.Vector3(), v2 = new T3.Vector3();
      const qb = new T3.Quaternion(), qr = new T3.Quaternion(), pq = new T3.Quaternion(), cq = new T3.Quaternion(), tq = new T3.Quaternion();
      let LEV = null;
      const U = new T3.Vector3(), Wl = new T3.Vector3(), Nl = new T3.Vector3(), Cc = new T3.Vector3(), UP = new T3.Vector3(0, 1, 0);
      const onTop = (L, H, p, out) => { const Lr = U.subVectors(L.B, L.A).length(); U.multiplyScalar(1 / Lr); Wl.crossVectors(U, UP).normalize(); Nl.crossVectors(Wl, U);
        const t = cl((Cc.subVectors(H, L.A).dot(U) + H.distanceTo(p)) / Lr, 0, 1.25), R = lerp(L.ra, L.rb, Math.min(t, 1)) + PAD, lat = cl(Cc.subVectors(p, L.A).dot(Wl), -0.95 * R, 0.95 * R);
        return out.copy(L.A).addScaledVector(U, t * Lr).addScaledVector(Wl, lat).addScaledVector(Nl, Math.sqrt(R * R - lat * lat)); };
      const need = (p, rd) => {
        E.set(p.x - Hc.x, 0, p.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return 0; E.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0, lev = null; LEV = null;
        legs.forEach((L, li) => { const ly = Math.abs(L.B.y - L.A.y) < 0.6 * L.A.distanceTo(L.B);
          for (let j = 0; j <= 6; j++) { const t = j / 6; V.copy(L.A).lerp(L.B, t); const R = Math.min(lerp(L.ra, L.rb, t) + PAD, rd[li * 7 + j] - 0.004); if (R <= 0) continue;
            const vx = p.x - V.x, vy = p.y - V.y, vz = p.z - V.z, cc = vx * vx + vy * vy + vz * vz - R * R; if (cc >= 0) continue; if (ly && !lev) lev = L;
            const b1 = vx * E.x + vz * E.z, q1 = b1 * b1 - cc; if (q1 > 0) sOut = Math.max(sOut, -b1 + Math.sqrt(q1)); const q2 = vy * vy - cc; if (q2 > 0) sUp = Math.max(sUp, -vy + Math.sqrt(q2)); } });
        if (sOut <= 1e-4 || sUp <= 1e-4) return 0;
        LEV = lev;
        if (sUp < sOut) { D.set(0, sUp, 0); return sUp; } D.copy(E).multiplyScalar(sOut); return sOut;
      };
      W.onFrame((SK) => {
        for (const L of legs) { SK[L.a].getWorldPosition(L.A); SK[L.b].getWorldPosition(L.B); }
        SK.hips.getWorldPosition(Hc);
        CH.forEach((c, ci) => { for (let k = 0; k < c.names.length; k++) {
          const b = SK[c.names[k]], child = k + 1 < c.names.length ? SK[c.names[k + 1]] : null;
          for (let it = 0; it < 2; it++) {
            b.getWorldPosition(H); b.getWorldQuaternion(qb);
            let best = 0, bp = null, bl = null; const bd = new T3.Vector3();
            for (const pr of JT[ci][k]) { Pw.copy(pr.off).applyQuaternion(qb).add(H); const m = need(Pw, pr.rd); if (m > best) { best = m; bd.copy(D); bp = Pw.clone(); bl = LEV; } }
            if (best <= 1e-4) break;
            if (bl) { onTop(bl, H, bp, Cc); bd.subVectors(Cc, bp); }
            if (child) child.getWorldQuaternion(cq);
            v1.subVectors(bp, H); const len = v1.length(); v2.copy(bp).add(bd).sub(H).setLength(len); v1.normalize(); v2.normalize();
            qr.setFromUnitVectors(v1, v2); b.parent.getWorldQuaternion(pq);
            b.quaternion.premultiply(tq.copy(pq).invert().multiply(qr).multiply(pq)); b.updateMatrixWorld(true);
            if (child) { b.getWorldQuaternion(qb); child.quaternion.copy(qb.invert().multiply(cq)); child.updateMatrixWorld(true); }
          }
        } });
      });
    }

    // ======================= paint corrections =======================
    W.afterPaint((parts) => {
      const copyRows = (mesh, info) => { const { rows, cols } = info, src = rows - 5;
        for (const key of ['aPP', 'aPN', 'aPE']) { const at = mesh.geometry.attributes[key]; if (!at) continue; const A = at.array;
          for (let r = rows - 3; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, j = src * cols + c; A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; }
          at.needsUpdate = true; } };
      for (const p of parts) {
        const g = p.mesh.geometry, PP = g.attributes.aPP, PN = g.attributes.aPN, PE = g.attributes.aPE; if (!PP) continue;
        const P = g.attributes.position.array, A = PP.array, N = PN.array, E = PE.array, n = P.length / 3;
        if (skirtInfo[p.key]) {
          const T = TIERS.find((t) => t.key === p.key);
          // its hem's turn-up takes the colour just above the hem
          copyRows(p.mesh, skirtInfo[p.key]);
          for (let i = 0; i < n; i++) { const y = P[i * 3 + 1];
            // keep each tier inside its own colour band of the paintings (the paintings' seams wander a little)
            A[i * 3 + 1] = cl(A[i * 3 + 1], T.HEM + 0.018, T === TIERS[0] ? 0.952 : Math.min(T.TOP, TIERS[TIERS.indexOf(T) - 1].HEM - 0.030));
            // every view sees the whole tier (one cloth, one colour): the tier above hides its top, which still reads its own band; all
            // three read a little inside the painted outline (the paintings are cleaned of the sash's ends and her hand: see the top)
            A[i * 3] *= 0.95; A[i * 3 + 2] = SKC + (A[i * 3 + 2] - SKC) * 0.96;
            E[i * 3] = 1; E[i * 3 + 1] = 1; E[i * 3 + 2] = 1;
          }
        }
        if (p.key === 'd8Sash') {
          // the painted sash is a little narrower than hers: read it inside its painted outline, from the front and back
          // (the side painting has her arm over it: not read; at her sides it reads the front or back painting, whichever it leans to)
          for (let i = 0; i < n; i++) { A[i * 3] *= 0.80; E[i * 3] = 1; E[i * 3 + 1] = 1; E[i * 3 + 2] = 0; const nz = N[i * 3 + 2]; N[i * 3 + 2] = nz >= 0 ? Math.max(nz, 0.4) : Math.min(nz, -0.4); }
        }
        if (p.key === 'd8SashEnds') {
          // the sash's ends read the gold of the (cleaned) front painting's middle tier, where nothing hangs over it
          for (let i = 0; i < n; i++) { const y = P[i * 3 + 1]; A[i * 3] = cl(P[i * 3], -0.2, 0.2); A[i * 3 + 1] = 0.585 + 0.12 * cl((y - 0.66) / 0.36, 0, 1); A[i * 3 + 2] = 0.2;
            N[i * 3] = 0; N[i * 3 + 1] = 0; N[i * 3 + 2] = 1; E[i * 3] = 1; E[i * 3 + 1] = 0; E[i * 3 + 2] = 0; }
        }
        if (p.key === 'd8Bodice') {
          // the neckline and armholes: the cloth's own colour, not her skin beside it
          // (each point within 1 cm of an edge reads the painting 1.2 cm further into the cloth, straight away from the edge)
          for (let i = 0; i < n; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], r = bodR(x, y, z); if (r < -0.010 || y < 1.15) continue;
            const e = 0.001, gx = (bodR(x + e, y, z) - bodR(x - e, y, z)) / (2 * e), gy = (bodR(x, y + e, z) - bodR(x, y - e, z)) / (2 * e), gz = (bodR(x, y, z + e) - bodR(x, y, z - e)) / (2 * e), L = Math.hypot(gx, gy, gz) || 1;
            const k = 0.016 * sm(-0.011, -0.004, r) + Math.max(0, r);
            A[i * 3] -= gx / L * k; A[i * 3 + 1] -= gy / L * k; A[i * 3 + 2] -= gz / L * k; E[i * 3 + 2] *= sm(-0.003, -0.012, r);
            // its edges and their cut faces read only the painting of their own side (the back painting sees her back's skin through the front scoop's place)
            if (r > -0.006) { const f = z > CZ ? 1 : 0; N[i * 3] = 0; N[i * 3 + 1] = 0; N[i * 3 + 2] = f ? 1 : -1; E[i * 3] = f; E[i * 3 + 1] = 1 - f; E[i * 3 + 2] = 0; } }
          // over the tops of her shoulders the straps read the painted straps just below (the paintings see the tops edge on)
          // her sides under the armholes read the painted bodice inside its outline (the paintings show her arm just beyond it)
          for (let i = 0; i < n; i++) { const y = P[i * 3 + 1], xa = Math.abs(A[i * 3]), lim = lerp(0.112, 0.104, sm(1.15, 1.22, y)); if (y > 1.10 && xa > lim) A[i * 3] = Math.sign(A[i * 3]) * (lim + 0.15 * (xa - lim)); }
          // and the straps read the middle of the painted straps (8 to 12 cm out), drawn in toward it
          for (let i = 0; i < n; i++) { const x = P[i * 3], y = P[i * 3 + 1], ax = Math.abs(x), w = sm(1.245, 1.285, y) * sm(0.05, 0.07, ax);
            if (w <= 0) continue; const tx = Math.sign(x) * (0.100 + cl((ax - 0.098) * 0.45, -0.012, 0.012));
            A[i * 3] = lerp(A[i * 3], tx, w); if (A[i * 3 + 1] > 1.336) A[i * 3 + 1] = 1.336 - 0.3 * (A[i * 3 + 1] - 1.336); E[i * 3 + 2] *= 1 - w; }
        }
        PP.needsUpdate = true; PN.needsUpdate = true; PE.needsUpdate = true;
      }
    });

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts']);
    W.hideSkin((x, y, z) => (y > BOT + 0.012 && bodR(x, y, z) < -0.012) || (y > 0.80 && y < BOT + 0.014), ['dollTrunk']);
    W.hideSkin((x, y, z) => y > 0.70, ['dollLeg']);
  },
};
