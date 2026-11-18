// D5, the summer day dress (D5A.png, D5B.png): a mustard-yellow cotton dress with a fitted bodice (princess seams, from the paintings),
// a round neckline, short set-in sleeves with a turned-up cuff; a thin brown leather belt at her waist with a brass buckle at the front
// and its pointed end tucked toward her left; a full skirt gathered at the waist, falling in soft folds to just below her knees, its
// hem turned up and stitched. Flat brown leather sandals: a thin sole, a wide strap across her toes' roots, a strap round her ankle
// buckled on the outside, two thin straps from it down the back corners of her heel to the sole; her toes, toenails and heels show.
// Pieces: d5Bodice, d5SleeveR/L, d5Skirt, d5Belt (band and pointed end), d5Buckle, d5SandalR/L, d5SandalBuckleR/L. The bun.
// The skirt hangs on the twelve soft chains round her hips (it swings), and is kept off her legs as the dancer's dress (D8.js) does it.
// The paintings are read from a cleaned copy of D5A.png (/home/claude/agents/D5/clean.py; prep run with --img on it): her right arm
// and hand are painted out of the side view, where they hang over the bodice's and skirt's side. She stands on the sandals' 8 mm
// soles (D5_prep.json heel).
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.D5 = {
  name: 'Summer day dress', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smin, smax, DOLL } = W;
    const Fs = W.Fsnug;
    const LIFT = 0.008;                                   // the sandals' soles: she stands this much higher (D5_prep.json heel)

    // ----- materials -----
    const cotton = W.paint({ rough: 0.88, emis: 0.28, env: 0.15 });
    const cottonD = W.paint({ rough: 0.88, emis: 0.28, env: 0.15, double: true });
    const beltMat = W.paint({ rough: 0.55, emis: 0.24, env: 0.35 });
    const brass = W.phys({ color: W.lin('#b48a3c'), roughness: 0.32, metalness: 0.9, envMapIntensity: 1.0 });
    const leather = W.std({ color: W.lin('#5b3020'), roughness: 0.58, envMapIntensity: 0.35 });

    // ----- small helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    function orient(g, rings, out) {                      // flip a loft's triangles if its middle ring faces inward (or away from 'out')
      const nor = W.computeNormals(g.pos, g.idx), m = Math.floor(rings.length / 2), r = rings[m], n = r.length, cols = n + 1;
      const c = out || r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]); let s = 0;
      for (let j = 0; j < n; j++) { const v = m * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    // a smooth curve through keys [[y, [values]], ...] (Catmull-Rom)
    function cprof(K, x) {
      if (K[0][0] > K[K.length - 1][0]) K = K._r || (K._r = K.slice().reverse());
      const n = K.length; if (x <= K[0][0]) return K[0][1]; if (x >= K[n - 1][0]) return K[n - 1][1];
      let i = 1; while (K[i][0] < x) i++;
      const x0 = K[i - 1][0], x1 = K[i][0], u = (x - x0) / (x1 - x0), A = K[Math.max(0, i - 2)], B = K[i - 1], C = K[i], D = K[Math.min(n - 1, i + 1)];
      return B[1].map((b, j) => { const c = C[1][j], m0 = (c - A[1][j]) / (C[0] - A[0]) * (x1 - x0), m1 = (D[1][j] - b) / (D[0] - B[0]) * (x1 - x0), u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * b + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * c + (u3 - u2) * m1; });
    }
    // a tube along points P (radius r, nr sides), its ends capped
    function tube(P, r, nr) {
      const rings = [];
      for (let i = 0; i < P.length; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], t = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
        const u = norm(cross(t, Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), v = cross(t, u), ring = [];
        for (let j = 0; j < nr; j++) { const ph = (j / nr) * TAU; ring.push(add(add(P[i], u, r * Math.cos(ph)), v, r * Math.sin(ph))); }
        rings.push(ring); }
      return orient(W.loft(rings, { capA: true, capB: true }), rings);
    }
    // a buckle: a rounded-rectangle frame of round wire (half sizes hx, hy, corner radius rc, wire radius rw) and a prong across its
    // middle, centred at c, in the plane of unit directions ex (across) and ey (up), its face toward n; bent by 'bend(x)' toward -n
    function buckle(c, ex, ey, n, hx, hy, rc, rw, bend) {
      const at = (x, y, dn) => add(add(add(c, ex, x), ey, y), n, (dn || 0) - (bend ? bend(x) : 0));
      // the rounded rectangle walked by arc length: right side up, a corner, the top leftward, a corner, the left side down, ...
      const sx = hx - rc, sy = hy - rc, R = [], M = 64;
      const path = [
        (t) => [hx, -sy + t * 2 * sy], (t) => [sx + rc * Math.cos(t * PI / 2), sy + rc * Math.sin(t * PI / 2)], (t) => [sx - t * 2 * sx, hy],
        (t) => [-sx + rc * Math.cos(PI / 2 + t * PI / 2), sy + rc * Math.sin(PI / 2 + t * PI / 2)], (t) => [-hx, sy - t * 2 * sy],
        (t) => [-sx + rc * Math.cos(PI + t * PI / 2), -sy + rc * Math.sin(PI + t * PI / 2)], (t) => [-sx + t * 2 * sx, -hy],
        (t) => [sx + rc * Math.cos(1.5 * PI + t * PI / 2), -sy + rc * Math.sin(1.5 * PI + t * PI / 2)]];
      const lens = [2 * sy, rc * PI / 2, 2 * sx, rc * PI / 2, 2 * sy, rc * PI / 2, 2 * sx, rc * PI / 2], per = lens.reduce((a, b) => a + b, 0);
      for (let k = 0; k < M; k++) { let d = (k / M) * per, pt = null;
        for (let i = 0; i < 8; i++) { if (d <= lens[i] || i === 7) { pt = path[i](lens[i] > 0 ? Math.min(1, d / lens[i]) : 0); break; } d -= lens[i]; }
        R.push(at(pt[0], pt[1])); }
      R.push(R[0]); R.push(R[1]);                      // closed (the tube's caps meet inside the wire)
      const frame = tube(R, rw, 8);
      const prong = tube([at(-hx, 0, 0.0004), at(-hx * 0.3, 0, rw * 0.9), at(hx * 0.35, 0, rw * 1.3), at(hx + rw * 0.6, 0, rw * 0.9)], rw * 0.62, 6);
      return merge([frame, prong]);
    }

    // her body's outline round a vertical middle line (x 0, z zc), by height and angle (from outside in, so her legs count as one)
    function outlineTable(zc, y0, y1, dy, na, r0) {
      const nb = Math.round((y0 - y1) / dy) + 1, T = new Float32Array(nb * na);
      for (let i = 0; i < nb; i++) { const y = y0 - i * dy;
        for (let j = 0; j < na; j++) { const a = (j / na) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, zc + ca * r);
          let r = r0; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
          T[i * na + j] = r > 0 ? (lo + hi) / 2 : 0; } }
      return (y, a) => { const fi = cl((y0 - y) / dy, 0, nb - 1.001), i = Math.floor(fi), u = fi - i; const fa = ((a / TAU) % 1 + 1) % 1 * na; const j = Math.floor(fa) % na, v = fa - Math.floor(fa), j2 = (j + 1) % na;
        return lerp(lerp(T[i * na + j], T[i * na + j2], v), lerp(T[(i + 1) * na + j], T[(i + 1) * na + j2], v), u); };
    }

    // ======================= the bodice =======================
    // from inside the skirt's top (under the belt) up to a round neckline: lowest 1.318 at the front, 1.362 at the back; over her
    // shoulders beyond it. Cotton 3 mm off her skin; the neckline's binding stands a little proud.
    const BOT = 1.040, BELT0 = 1.050, BELT1 = 1.069;
    const CZ = (() => { const t = W.trunkAt(1.30); return (t[1] + t[2]) / 2; })();
    const neckR = (x, y, z) => {                           // < 0 below the neckline (cloth), > 0 inside the neck opening
      const ax = Math.abs(x), fr = sm(CZ - 0.030, CZ + 0.030, z);
      const hw = lerp(0.079, 0.083, fr), yb = lerp(1.362, 1.318, fr), d = lerp(0.020, 0.054, fr), u = ax / hw;
      if (u >= 1) return Math.max(hw - ax, -0.02);
      const yS = yb + d * (1 - Math.sqrt(1 - u * u));
      return Math.min(hw - ax, y - yS);
    };
    const bodR = (x, y, z) => Math.max(BOT - y, neckR(x, y, z), y - 1.47);
    const bodTh = (x, y, z) => { const e = -neckR(x, y, z); return 0.0030 + 0.0008 * sm(0.010, 0.003, e) * sm(1.25, 1.30, y); };
    W.snug('d5Bodice', bodR, bodTh, [-0.180, 0.180, BOT - 0.008, 1.47, -0.135, 0.125], 0.0046, { mat: cottonD });

    // ======================= the short sleeves =======================
    // set in over the ball of her shoulder, ending a third of the way down her upper arm (sl 0.112) in a turned-up cuff 1.8 cm deep;
    // standing a little off her arm, looser toward the cuff
    const SLE = (a) => 0.112 + 0.004 * Math.cos(a + 0.4);
    const sl0 = (a) => lerp(-0.052, 0.046, Math.pow((1 - Math.cos(a)) / 2, 2));
    const slOff = (sl, a) => 0.0028 + 0.0014 * sm(-0.03, 0.0, sl) + 0.0048 * sm(0.0, 0.10, sl) + 0.0010 * Math.max(0, Math.cos(a)) * sm(0.02, 0.10, sl)
      + 0.0016 * sm(SLE(a) - 0.0195, SLE(a) - 0.0170, sl);                     // the cuff stands proud
    const TH = 0.0028;
    const sleeveData = {};
    for (const S of ['R', 'L']) {
      const NU = 40, NR = 30, rings = [], SLs = [];
      const pt = (sl, a, e) => { const p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), c3 = W.armPt(S, sl, PI / 2), c4 = W.armPt(S, sl, 1.5 * PI);
        const ax = [(c1[0] + c2[0] + c3[0] + c4[0]) / 4, (c1[1] + c2[1] + c3[1] + c4[1]) / 4, (c1[2] + c2[2] + c3[2] + c4[2]) / 4];
        return add(p, norm([p[0] - ax[0], p[1] - ax[1], p[2] - ax[2]]), e); };
      const row = (f, dsl, de) => { const ring = [], sls = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, s0 = sl0(a), s1 = SLE(a), sl = (f == null ? s1 : lerp(s0, s1, f)) + (dsl || 0);
          ring.push(pt(sl, a, slOff(Math.min(sl, s1), a) + (de || 0))); sls.push([sl, a]); }
        rings.push(ring); SLs.push(sls); };
      for (let i = 0; i <= NR; i++) { const t = i / NR; row(1 - Math.pow(1 - t, 1.2)); }
      row(null, 0.0015, -TH / 2); row(null, 0, -TH); row(null, -0.018, -TH);        // the cuff's rounded edge, then its inside, 1.8 cm up
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      sleeveData[S] = { nRows: rings.length, cols };
      W.part('d5Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, 0.05); const [sl, a] = SLs[r][j % NU];
        const wa = W.wArmSL(S, cl(sl, 0.0, 0.2), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.5 * sm(0.03, -0.020, sl)) : wa; }, { mat: cottonD });
    }

    // ======================= the skirt =======================
    const SKC = -0.006, TOP = 1.062, HEM = 0.466;
    const bodyR = outlineTable(SKC, 1.10, 0.62, 0.02, 72, 0.30);
    // the painted outline (half width, front and back from the middle line), at the folds' crests: from the front, side and back paintings
    const FL = [[1.060, [0.100, 0.098, 0.060]], [1.028, [0.118, 0.112, 0.070]], [1.005, [0.131, 0.117, 0.083]], [0.985, [0.141, 0.122, 0.095]],
      [0.944, [0.157, 0.130, 0.114]], [0.903, [0.170, 0.135, 0.127]], [0.863, [0.178, 0.142, 0.132]], [0.802, [0.189, 0.149, 0.139]],
      [0.720, [0.203, 0.158, 0.145]], [0.639, [0.215, 0.168, 0.156]], [0.558, [0.225, 0.178, 0.167]], [0.496, [0.230, 0.185, 0.173]], [0.466, [0.231, 0.187, 0.175]]];
    // (below her hips a little fuller than the painted outline, 4 mm at the hem: her hips are wider than the painted figure's, and the
    // skirt keeps the painting's A-line from them rather than standing straight down)
    const gAmp = (y) => lerp(0.0016, 0.0150, Math.pow(sm(TOP, HEM, y), 0.6)) * (0.35 + 0.65 * sm(1.050, 1.030, y));
    const flareR = (y, a) => { const v = cprof(FL, y), s = Math.sin(a), c = Math.cos(a), k = 0.85 * gAmp(y), rx = v[0] - k, rz = (c >= 0 ? v[1] : v[2]) - k;
      return 1 / Math.sqrt((s / rx) * (s / rx) + (c / rz) * (c / rz)); };
    const clear = (y) => lerp(0.0048, 0.010, sm(1.04, 0.92, y));
    // the cloth drapes: from her waist it runs straight out to the widest of her hips and bottom (it cannot follow her in above them),
    // and below them it falls (coming in only a little): her body's outline, hulled up and down
    const HY0 = 1.10, HDY = 0.02, HNB = 25, HNA = 72, HULL = new Float32Array(HNB * HNA), KUP = 0.42, KDN = 0.12;
    for (let i = 0; i < HNB; i++) { const y = HY0 - i * HDY;
      for (let j = 0; j < HNA; j++) { const a = (j / HNA) * TAU; let m = 0;
        for (let k = 0; k < HNB; k++) { const yk = HY0 - k * HDY, v = bodyR(yk, a) + clear(yk) - (yk < y ? KUP * (y - yk) : KDN * (yk - y)); if (v > m) m = v; }
        HULL[i * HNA + j] = m; } }
    const hullR = (y, a) => { const fi = cl((HY0 - y) / HDY, 0, HNB - 1.001), i = Math.floor(fi), u = fi - i, fa = ((a / TAU) % 1 + 1) % 1 * HNA, j = Math.floor(fa) % HNA, v = fa - Math.floor(fa), j2 = (j + 1) % HNA;
      return lerp(lerp(HULL[i * HNA + j], HULL[i * HNA + j2], v), lerp(HULL[(i + 1) * HNA + j], HULL[(i + 1) * HNA + j2], v), u); };
    // under the belt it lies close round her (the belt holds it); just below, it stands out to the hull and the painted outline
    const baseR = (y, a) => { const b = bodyR(y, a) + clear(y), f = sm(1.050, 1.034, y);
      return lerp(b, smax(Math.max(hullR(y, a), b), flareR(y, a), 0.025), f); };
    // gathers: fine under the belt, broader and uneven toward the hem (the angle warped so no two folds are quite alike)
    const fold = (a, y) => { const t = sm(TOP, HEM, y), ph = 0.45 * t * Math.sin(2 * a + 0.6), aw = a + 0.035 * Math.sin(5 * a + 0.3) + 0.020 * Math.sin(11 * a + 1.1);
      const fine = Math.sin(aw * 52 + 0.2), main = 0.62 * Math.sin(aw * 24 + ph + 0.7 * Math.sin(a * 3 + 0.5)) + 0.38 * Math.sin(aw * 13 + 1.3 + ph * 1.5);
      return lerp(fine, main, sm(0.0, 0.30, t)); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    const envR = (y, a) => baseR(y, a) + gAmp(y);
    const hemY = (a) => HEM + 0.0025 * Math.sin(a * 3 + 1) - 0.0030 * (0.5 + 0.5 * fold(a, HEM));
    let skirtRows = 0, skirtCols = 0;
    {
      const NU = 240, rings = [], ys = [], NV = Math.round((TOP - HEM) / 0.0115);
      for (let i = 0; i <= NV; i++) { const t = i / NV; ys.push(lerp(TOP, HEM, t * t * 0.25 + t * 0.75)); }
      const at = (y, a, dr) => { const r = skirtR(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
      // the gathered top edge, rolled inward (under the belt)
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(TOP + 0.002, a, -0.0022)); } rings.push(ring); }
      for (const y of ys) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, yy = y === HEM ? hemY(a) : lerp(y, hemY(a), sm(TOP, HEM, y) * sm(HEM + 0.10, HEM, y)); ring.push(at(yy, a)); } rings.push(ring); }
      // the hem: a rounded edge, then turned up inside 3.5 cm
      { const r0 = [], r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemY(a); r0.push(at(h - 0.0016, a, -0.0018)); r1.push(at(h + 0.0004, a, -0.0038)); r2.push(at(h + 0.035, a, -0.0042)); } rings.push(r0, r1, r2); }
      const g = orient(W.loft(rings, {}), rings);
      skirtRows = rings.length; skirtCols = NU + 1;
      W.part('d5Skirt', g, (x, y, z) => W.wSkirt(x, y, z), { mat: cottonD });
    }

    // ======================= the belt, its pointed end and its buckle =======================
    const BTH = 0.0088;                                   // how far the belt's outside stands off her (over the skirt's gathered top)
    const NA2 = 160, Y0 = 1.076, D2 = 0.004, NB2 = 8, BT2 = new Float32Array(NB2 * NA2);
    for (let i = 0; i < NB2; i++) { const y = Y0 - i * D2;
      for (let j = 0; j < NA2; j++) { const a = (j / NA2) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.22; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; for (let k = 0; k < 13; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT2[i * NA2 + j] = (lo + hi) / 2; } }
    const belt2 = (y, a) => { const fi = cl((Y0 - y) / D2, 0, NB2 - 1.001), i = Math.floor(fi), u = fi - i, fa = ((a / TAU) % 1 + 1) % 1 * NA2, j = Math.floor(fa) % NA2, v = fa - Math.floor(fa), j2 = (j + 1) % NA2;
      return lerp(lerp(BT2[i * NA2 + j], BT2[i * NA2 + j2], v), lerp(BT2[(i + 1) * NA2 + j], BT2[(i + 1) * NA2 + j2], v), u); };
    const BY = (BELT0 + BELT1) / 2;
    {
      const parts = [];
      // the band: rings round her, its edges rounded and turned in a little under itself
      const rows = [[BELT0 + 0.004, -0.004], [BELT0 + 0.0004, 0.70], [BELT0 - 0.0002, 0.90]];
      const NV = 8; for (let i = 0; i <= NV; i++) rows.push([lerp(BELT0 + 0.0016, BELT1 - 0.0016, i / NV), 1]);
      rows.push([BELT1 + 0.0002, 0.90], [BELT1 - 0.0004, 0.70], [BELT1 - 0.004, -0.004]);
      const rings = [];
      for (const [y, f] of rows) { const ring = [];
        for (let j = 0; j < NA2; j++) { const a = (j / NA2) * TAU, r = belt2(y, a) + (f < 0 ? 0.0045 : 0.0045 + f * (BTH - 0.0045)); ring.push([r * Math.sin(a), y, SKC + r * Math.cos(a)]); }
        rings.push(ring); }
      parts.push(orient(W.loft(rings, {}), rings));
      // the pointed end: from under the buckle across to her left, lying on the band, 1.7 cm wide, its tip cut to a point
      const NL = 30, HW = 0.0085, HT = 0.0011, X0 = 0.008, X1 = 0.064, er = [];
      for (let k = 0; k <= NL; k++) { const t = k / NL, x = lerp(X0, X1, t), a = Math.asin(cl(x / (belt2(BY, 0.3) + BTH), -0.9, 0.9)), r = belt2(BY, a) + BTH + 0.0002 + HT + 0.0006 * sm(0.1, 0.0, t);
        const p = [r * Math.sin(a), BY, SKC + r * Math.cos(a)], n = [Math.sin(a), 0, Math.cos(a)], tip = sm(X1 - 0.0085, X1, x), hw = HW * (1 - 0.92 * tip);
        const ring = []; for (let j = 0; j < 12; j++) { const ph = (j / 12) * TAU, cx = Math.sign(Math.cos(ph)) * Math.pow(Math.abs(Math.cos(ph)), 0.35), sy = Math.sign(Math.sin(ph)) * Math.pow(Math.abs(Math.sin(ph)), 0.35);
          ring.push(add(add(p, [0, 1, 0], hw * cx), n, HT * sy)); }
        er.push(ring); }
      parts.push(orient(W.loft(er, { capA: true, capB: true }), er));
      W.part('d5Belt', merge(parts), (x, y, z) => { const a = Math.atan2(x, z - SKC), r = belt2(cl(y, BELT0, BELT1), a) - 0.004; return W.wBody(r * Math.sin(a), cl(y, BELT0, BELT1), SKC + r * Math.cos(a)); }, { mat: beltMat });
      // the buckle: a brass frame 3.6 by 2.3 cm, a little right of her middle, its prong over the belt's end
      const XC = 0.002, a0 = Math.asin(XC / (belt2(BY, 0) + BTH)), r0 = belt2(BY, a0) + BTH + 0.0028, c = [r0 * Math.sin(a0), BY, SKC + r0 * Math.cos(a0)];
      const nB = [Math.sin(a0), 0, Math.cos(a0)], ex = [Math.cos(a0), 0, -Math.sin(a0)];
      const curv = 1 / (belt2(BY, 0) + BTH);
      const g = buckle(c, ex, [0, 1, 0], nB, 0.018, 0.0115, 0.0035, 0.0017, (x) => 0.5 * curv * x * x);
      const wk = W.wBody(0, BY, W.trunkAt(BY)[1] - 0.02);
      W.part('d5Buckle', g, () => wk, { mat: brass });
    }

    // ======================= the sandals =======================
    // made once for her left foot, in the foot's own frame (X out to her little toe, Z forward from her ankle), and mirrored for her right
    const S0 = W.SOLE, L2 = [0, 0], P2 = [0, 0];
    const frontZ = (X) => 0.121 - 0.36 * (X + 0.0255);                 // where her toes begin (DOLL's own line), slanting back to the little toe
    // the sole's outline: her foot's outline a little above the floor, 4.5 mm wider, smoothed (a grid in the foot's frame)
    const PX0 = -0.075, PX1 = 0.085, PZ0 = -0.10, PZ1 = 0.215, PH = 0.002, PNX = Math.round((PX1 - PX0) / PH) + 1, PNZ = Math.round((PZ1 - PZ0) / PH) + 1;
    const PLAN = new Float32Array(PNX * PNZ);
    { const raw = new Float32Array(PNX * PNZ);
      for (let i = 0; i < PNX; i++) for (let k = 0; k < PNZ; k++) { DOLL.toWorld(1, PX0 + i * PH, PZ0 + k * PH, P2);
        raw[k * PNX + i] = Math.min(DOLL.fFoot(1, P2[0], S0 + 0.0065, P2[1]), DOLL.fFoot(1, P2[0], S0 + 0.012, P2[1]) + 0.002); }
      // smoothed: a few passes of a small blur (fills the notches between the toes and rounds the outline)
      let A = raw, B = new Float32Array(raw.length);
      for (let p = 0; p < 4; p++) { for (let i = 0; i < PNX; i++) for (let k = 0; k < PNZ; k++) { let s = 0, w = 0;
          for (let di = -1; di <= 1; di++) for (let dk = -1; dk <= 1; dk++) { const ii = i + di, kk = k + dk; if (ii < 0 || kk < 0 || ii >= PNX || kk >= PNZ) continue; const q = di || dk ? (di && dk ? 0.5 : 1) : 2; s += A[kk * PNX + ii] * q; w += q; }
          B[k * PNX + i] = s / w; } const t = A; A = B; B = t; }
      PLAN.set(A); }
    const plan = (X, Z) => { const fi = cl((X - PX0) / PH, 0, PNX - 1.001), fk = cl((Z - PZ0) / PH, 0, PNZ - 1.001), i = Math.floor(fi), k = Math.floor(fk), u = fi - i, v = fk - k;
      return lerp(lerp(PLAN[k * PNX + i], PLAN[k * PNX + i + 1], u), lerp(PLAN[(k + 1) * PNX + i], PLAN[(k + 1) * PNX + i + 1], u), v) - 0.0045; };
    const SOLE_B = S0 - LIFT, SOLE_T = S0 + 0.0006;
    const soleD = (X, y, Z) => smax(plan(X, Z), Math.max(SOLE_B - y, y - SOLE_T), 0.0016);
    // the straps: bands of a shell 2.6 mm thick round her foot and ankle
    const AY = 0.128, AHW = 0.0055;                                    // the ankle strap's middle and half width
    const toeBand = (X, y, Z) => Math.abs(Z - (frontZ(X) - 0.0125)) - 0.0095;
    const ankleBand = (X, y, Z) => Math.abs(y - AY) - AHW;
    const qZ = (y) => lerp(-0.047, -0.039, sm(S0, AY, y));
    const quarterBand = (X, y, Z) => Math.max(Math.abs(Z - qZ(y)) - 0.0042, 0.0095 - Math.abs(X + 0.002), y - AY);
    const bands = (X, y, Z) => Math.min(toeBand(X, y, Z), ankleBand(X, y, Z), quarterBand(X, y, Z));
    const footS = (s, x, y, z) => Math.min(DOLL.fFoot(s, x, y, z), y > 0.055 ? DOLL.fLegOnly(s, x, y, z) : 1);
    const TS = 0.0026, GAP = 0.0004;
    {
      const s = 1;
      const G = (x, y, z) => {
        if (y > AY + AHW + 0.012) return y - (AY + AHW);
        DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const so = soleD(X, y, Z), b = bands(X, y, Z);
        if (b > 0.005) return Math.min(so, b);
        const strap = smax(footS(s, x, y, z) - GAP - TS, b, 0.0010);
        return smin(so, strap, 0.0025);
      };
      const keep = (x, y, z) => footS(s, x, y, z) > -0.0012;
      const g = W.snets(G, [0.012, 0.150, SOLE_B - 0.004, AY + AHW + 0.008, -0.090, 0.215], 0.0027), pos = [], nor = [], idx = [], used = new Int32Array(g.nv).fill(-1);
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
      W.part('d5SandalR', { pos: posR, idx: idxR, nor: norR }, wf, { mat: leather });
      W.part('d5SandalL', { pos, idx, nor }, wf, { mat: leather });
      // the ankle strap's small brass buckle, on the outside of her ankle a little forward
      for (const [S, sg] of [['R', -1], ['L', 1]]) {
        const ang = 0.42, Xd = Math.cos(ang), Zd = Math.sin(ang);                // in the foot's frame: out, a little forward
        DOLL.toWorld(sg, 0, 0, P2); const cx0 = P2[0], cz0 = P2[1];
        DOLL.toWorld(sg, Xd * 0.1, Zd * 0.1, P2); const dx = (P2[0] - cx0) / 0.1, dz = (P2[1] - cz0) / 0.1;
        const L = W.legAt(AY), lc = [sg * L[3], L[4]];
        let r = 0.08; const Gs = (rr) => footS(sg, lc[0] + dx * rr, AY, lc[1] + dz * rr) - GAP - TS; while (r > 0.01 && Gs(r) > 0) r -= 0.0005;
        const c = [lc[0] + dx * (r + 0.0020), AY, lc[1] + dz * (r + 0.0020)], n = [dx, 0, dz], ex = [-dz, 0, dx];
        const g2 = buckle(c, ex, [0, 1, 0], n, 0.0062, 0.0072, 0.0016, 0.0010, (x) => 8 * x * x);
        const wk = W.wBody(lc[0] + dx * (r - 0.006), AY, lc[1] + dz * (r - 0.006));
        W.part('d5SandalBuckle' + S, g2, () => wk, { mat: brass });
      }
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // ======================= her legs keep out of the skirt =======================
    // (as the dancer's dress, wardrobe/D8.js, after the long winter dress D6.js) On each of the skirt's twelve chains, joint by joint from
    // the top, points of the skirt where it hangs at that chain (at the joint's tip and halfway along) are tested against her thighs and
    // shins (padded); a point inside is moved the shorter way, out from her middle or up onto the leg, by turning that stretch of the
    // chain about its top. The stretch below is then turned back so it still hangs as it did: the cloth drapes over a knee and falls from it.
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.044;
      const legs = [];
      for (const S of ['R', 'L']) legs.push({ a: 'thigh' + S, b: 'shin' + S, ra: 0.080, rb: 0.057 }, { a: 'shin' + S, b: 'foot' + S, ra: 0.057, rb: 0.044 });
      for (const L of legs) { L.A = new T3.Vector3(); L.B = new T3.Vector3(); L.A0 = W.SK[L.a].userData.rest.clone(); L.B0 = W.SK[L.b].userData.rest.clone(); }
      const V = new T3.Vector3();
      const restRD = (p) => { const out = []; for (const L of legs) for (let j = 0; j <= 6; j++) out.push(V.copy(L.A0).lerp(L.B0, j / 6).distanceTo(p)); return out; };
      const JT = CH.map((c) => c.names.map((nm, k) => {
        const p0 = c.pts[k], p1 = c.pts[k + 1], pr = [];
        const ys = [p1.y, (p0.y + p1.y) / 2]; if (HEM < p0.y && HEM > p1.y) ys.push(HEM + 0.002);       // and the hem itself, where it hangs
        for (const y of ys) {
          if (y > 1.0 || y < HEM - 0.03) continue; const yy = Math.max(y, HEM);
          // where the cloth hangs at this chain, and (below her hips) halfway to each neighbour: the cloth between two chains is
          // carried by both, so a leg pressing there turns both out
          for (const da of (y < 0.80 ? [0, -0.26, 0.26] : [0])) { const a = c.a + da, r = envR(yy, a);
            const q = new T3.Vector3(r * Math.sin(a), y, SKC + r * Math.cos(a));
            pr.push({ off: q.clone().sub(p0), rd: restRD(q) }); } }
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
          if (!JT[ci][k].length) continue;
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
      const copyRows = (mesh, rows, cols, n, back) => { const src = rows - n - back;
        for (const key of ['aPP', 'aPN', 'aPE']) { const at = mesh.geometry.attributes[key]; if (!at) continue; const A = at.array;
          for (let r = rows - n; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, j = src * cols + c; A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; }
          at.needsUpdate = true; } };
      for (const p of parts) {
        const g = p.mesh.geometry, PP = g.attributes.aPP, PN = g.attributes.aPN, PE = g.attributes.aPE; if (!PP) continue;
        const P = g.attributes.position.array, A = PP.array, N = PN.array, E = PE.array, n = P.length / 3;
        if (p.key === 'd5Skirt') {
          copyRows(p.mesh, skirtRows, skirtCols, 3, 2);           // the hem's turn-up takes the colour just above the hem
          for (let i = 0; i < n; i++) {
            // below the belt, above the painted legs; every view sees the whole skirt, read a little inside the painted outline (the
            // paintings are cleaned of her arms)
            A[i * 3 + 1] = cl(A[i * 3 + 1], HEM + 0.010, BELT0 - 0.008);
            const yp = cl(P[i * 3 + 1], HEM, TOP), v = cprof(FL, yp), mx = envR(yp, PI / 2), mz = A[i * 3 + 2] > SKC ? envR(yp, 0) : envR(yp, PI), pz = A[i * 3 + 2] > SKC ? v[1] : v[2];
            A[i * 3] *= Math.min(0.95, 0.93 * v[0] / mx); A[i * 3 + 2] = SKC + (A[i * 3 + 2] - SKC) * Math.min(0.96, 0.94 * pz / mz);
            E[i * 3] = 1; E[i * 3 + 1] = 1; E[i * 3 + 2] = 1;
          }
        }
        if (/^d5Sleeve/.test(p.key)) { const d = sleeveData[p.key.slice(-1)]; copyRows(p.mesh, d.nRows, d.cols, 3, 3); }
        if (p.key === 'd5Belt') {
          // the painted belt is a little narrower than hers: read inside its painted outline, from the front and back only (the side
          // painting has her arm over it); at her sides it reads whichever of the two it leans to
          for (let i = 0; i < n; i++) { A[i * 3] *= 0.86; A[i * 3 + 1] = cl(A[i * 3 + 1], BELT0 + 0.003, BELT1 - 0.003); E[i * 3] = 1; E[i * 3 + 1] = 1; E[i * 3 + 2] = 0;
            const nz = N[i * 3 + 2]; N[i * 3 + 2] = nz >= 0 ? Math.max(nz, 0.4) : Math.min(nz, -0.4); }
        }
        if (p.key === 'd5Bodice') {
          for (let i = 0; i < n; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
            // under the belt and the skirt's top: the bodice just above the belt
            if (A[i * 3 + 1] < BELT1 + 0.006) A[i * 3 + 1] = BELT1 + 0.006;
            // the neckline: its edge reads the cloth 1.2 cm further in, not her skin beside it
            if (y > 1.25) { const r = neckR(x, y, z); if (r > -0.010) {
              const e = 0.001, gx = (neckR(x + e, y, z) - neckR(x - e, y, z)) / (2 * e), gy = (neckR(x, y + e, z) - neckR(x, y - e, z)) / (2 * e), gz = (neckR(x, y, z + e) - neckR(x, y, z - e)) / (2 * e), L = Math.hypot(gx, gy, gz) || 1;
              const k = 0.014 * sm(-0.011, -0.004, r) + Math.max(0, r);
              A[i * 3] -= gx / L * k; A[i * 3 + 1] -= gy / L * k; A[i * 3 + 2] -= gz / L * k; E[i * 3 + 2] *= sm(-0.003, -0.012, r);
              if (r > -0.006) { const f = z > CZ ? 1 : 0; N[i * 3] = 0; N[i * 3 + 1] = 0; N[i * 3 + 2] = f ? 1 : -1; E[i * 3] = f; E[i * 3 + 1] = 1 - f; E[i * 3 + 2] = 0; } } }
          }
          // her sides under the sleeves read the painted bodice inside its outline (the paintings show her arm just beyond it)
          const LIM = [[1.05, [0.086]], [1.10, [0.089]], [1.15, [0.099]], [1.20, [0.110]], [1.24, [0.116]]];
          for (let i = 0; i < n; i++) { const y = P[i * 3 + 1], xa = Math.abs(A[i * 3]), lim = cprof(LIM, cl(A[i * 3 + 1], 1.05, 1.24))[0]; if (y < 1.25 && xa > lim) A[i * 3] = Math.sign(A[i * 3]) * (lim + 0.15 * (xa - lim)); }
        }
        PP.needsUpdate = true; PN.needsUpdate = true; PE.needsUpdate = true;
      }
    });

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts']);
    W.hideSkin((x, y, z) => (y > BOT + 0.012 && bodR(x, y, z) < -0.012) || (y > 0.86 && y < BOT + 0.014), ['dollTrunk']);
    W.hideSkin((x, y, z) => y > 0.86, ['dollLeg']);
    W.hideSkin((x, y, z) => { const S = x < 0 ? 'R' : 'L', f = W.armFrame(S, x, y, z); return f.sl < 0.085; }, ['arm']);
  },
};
