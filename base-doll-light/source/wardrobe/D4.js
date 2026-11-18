// D4, the court gown (D4A.png, D4B.png): a floor-length deep red damask gown. A fitted bodice with princess seams, a low square
// neckline edged in gold braid front and back, a point at the front waist; long fitted sleeves to her wrists, each ending in a gold
// braid cuff; a full gathered overskirt that opens at the front in an inverted V from the waist's point over a gold satin underskirt;
// a gold chain girdle along the waist seam, dipping to the point in front, with a long chain hanging from the point to a gold drop at
// her knees; black suede court shoes with a curved heel. The damask, the braid and the satin come from the paintings; the folds are
// real shape. She stands in the shoes' heels: the frame hook lifts her by HEEL and tips her feet (as wardrobe/M1.js does), so the
// paintings are lined up for the heel (D4_prep.json).
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.D4 = {
  name: 'Court gown', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { THREE, sm, lerp, PI, TAU, cl, smin, smax, DOLL } = W;
    const F = W.F, Fs = W.Fsnug;
    const TT = [], t00 = performance.now(), tick = (n) => TT.push(n + ' ' + Math.round(performance.now() - t00));

    // ----- materials -----
    const DC = '#ccb0b6';
    const damask = W.paint({ rough: 0.80, emis: 0.30, env: 0.12, color: DC });
    const damaskD = W.paint({ rough: 0.80, emis: 0.30, env: 0.12, color: DC, double: true });
    const satinD = W.paint({ rough: 0.58, emis: 0.68, env: 0.08, color: '#f4e4c4', double: true });
    const braid = W.paint({ rough: 0.50, env: 0.25, emis: 0.42, color: '#fff2dc' });
    const gold = W.std({ color: W.lin('#c99a45'), metalness: 0.95, roughness: 0.30, envMapIntensity: 1.2 });
    const suede = W.std({ color: W.lin('#151214'), roughness: 0.86, envMapIntensity: 0.15 });
    const soleMat = W.std({ color: W.lin('#1f1714'), roughness: 0.6, envMapIntensity: 0.3 });

    // ----- small geometry helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
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
    // a sheet with thickness from a grid of points (rows i, columns j): outer surface, inner surface th further in, rims along the
    // open borders (after wardrobe/M1.js). outRef(i, j): a point the sheet faces away from.
    function thickSheet(G, th, o) {
      const m = G.length, n = G[0].length, pos = [], idx = [], N = [];
      for (let i = 0; i < m; i++) { const row = []; for (let j = 0; j < n; j++) {
        const a = G[Math.max(0, i - 1)][j], b = G[Math.min(m - 1, i + 1)][j], c = G[i][Math.max(0, j - 1)], d = G[i][Math.min(n - 1, j + 1)];
        const u = sub(b, a), v = sub(d, c); let q = cross(u, v); const L = Math.hypot(q[0], q[1], q[2]); row.push(L > 1e-12 ? [q[0] / L, q[1] / L, q[2] / L] : [0, 0, 1]); } N.push(row); }
      let sg = 0; for (let i = 0; i < m; i += 2) for (let j = 0; j < n; j += 2) { const p = G[i][j], q = N[i][j], c = o.outRef(i, j); sg += q[0] * (p[0] - c[0]) + q[1] * (p[1] - c[1]) + q[2] * (p[2] - c[2]); }
      const s = sg < 0 ? -1 : 1, fo = s < 0, base = m * n;
      for (let L = 0; L < 2; L++) for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) { const p = G[i][j], q = N[i][j], t = L ? th : 0; pos.push(p[0] - s * q[0] * t, p[1] - s * q[1] * t, p[2] - s * q[2] * t); }
      const quad = (a, b, c, d, flip) => { if (flip) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c); };
      const inner = o.inner || 0;
      for (let i = 0; i < m - 1; i++) for (let j = 0; j < n - 1; j++) {
        const a = i * n + j, b = a + 1, c = a + n + 1, d = a + n; quad(a, b, c, d, fo);
        if (!inner || i < inner || i >= m - 1 - inner || j < inner || j >= n - 1 - inner) quad(base + a, base + b, base + c, base + d, !fo);
      }
      const rim = (list, flip) => { const k0 = pos.length / 3, L = list.length;
        for (const v of list) pos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
        for (const v of list) { const w = base + v; pos.push(pos[w * 3], pos[w * 3 + 1], pos[w * 3 + 2]); }
        for (let k = 0; k < L - 1; k++) quad(k0 + k, k0 + k + 1, k0 + L + k + 1, k0 + L + k, flip !== fo); };
      const row = (i) => { const l = []; for (let j = 0; j < n; j++) l.push(i * n + j); return l; };
      const col = (j) => { const l = []; for (let i = 0; i < m; i++) l.push(i * n + j); return l; };
      rim(row(0), true); rim(row(m - 1), false); rim(col(0), false); rim(col(n - 1), true);
      return { pos, idx, nOut: base };
    }
    // an oval chain link round c: t along the chain, w across the link's plane
    function link(c, t, w, L, Wd, r, NU, NV) {
      NU = NU || 8; NV = NV || 4; const m = cross(t, w), rings = [];
      for (let i = 0; i <= NU; i++) { const ph = (i / NU) * TAU, cp = Math.cos(ph), sp = Math.sin(ph), d = add(add([0, 0, 0], t, cp * L / 2), w, sp * Wd / 2), e = norm(add(add([0, 0, 0], t, cp * Wd / L), w, sp)), ring = [];
        for (let j = 0; j < NV; j++) { const ps = (j / NV) * TAU; ring.push(add(add(add(c, d, 1), e, r * Math.cos(ps)), m, r * Math.sin(ps))); } rings.push(ring); }
      const g = W.loft(rings, {});
      // the tube faces outward from its own centre line
      const nor = W.computeNormals(g.pos, g.idx), cols = NV + 1; let s = 0;
      for (let j = 0; j < NV; j++) { const v = 2 * cols + j, ph = (2 / NU) * TAU, cc = add(add(c, t, Math.cos(ph) * L / 2), w, Math.sin(ph) * Wd / 2);
        s += nor[v * 3] * (g.pos[v * 3] - cc[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - cc[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - cc[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const q = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = q; }
      return g;
    }
    // links along a path of points (with their outward directions), every `pitch` metres, turned a quarter between neighbours
    function chainAlong(P, Nn, pitch, L, Wd, r) {
      const out = [], seg = []; let tot = 0; for (let i = 0; i < P.length - 1; i++) { const d = Math.hypot(...sub(P[i + 1], P[i])); seg.push(d); tot += d; }
      const nl = Math.floor(tot / pitch);
      for (let k = 0; k <= nl; k++) { let d = k * pitch, i = 0; while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
        const f = cl(d / seg[i], 0, 1), c = add(P[i], sub(P[i + 1], P[i]), f), t = norm(sub(P[i + 1], P[i])), n0 = norm(add(Nn[i], sub(Nn[i + 1], Nn[i]), f));
        const flat = norm(cross(n0, t)), w = k % 2 ? n0 : flat, cc = k % 2 ? add(c, n0, 0) : add(c, n0, -r * 0.4);
        out.push(link(cc, t, w, L, Wd, r)); }
      return merge(out);
    }

    // ======================= the heels: how far she is lifted and her feet tipped (as wardrobe/M1.js) =======================
    // The heel seat (back of her foot) HS above the floor, the ball of her foot on a sole PLAT thick. Her foot: heel point (y 0.038,
    // z -0.045), ankle (0.105, -0.012), toe joint (0.054, 0.088), 1.6 cm above her sole.
    const FLOOR = W.SOLE, S0 = W.SOLE, HS = 0.042, PLAT = 0.0075;
    const A_R = { y: 0.105, z: -0.012 }, T_R = { y: 0.054, z: 0.088 };
    let TH = 0.25; for (let i = 0; i < 40; i++) { const f = -0.016 * Math.cos(TH) + 0.133 * Math.sin(TH) + 0.016 - (HS - PLAT); TH -= f / (0.016 * Math.sin(TH) + 0.133 * Math.cos(TH)); }
    const HEEL = FLOOR + PLAT + 0.016 - A_R.y + 0.051 * Math.cos(TH) + 0.100 * Math.sin(TH);      // about 0.031
    const cT = Math.cos(TH), sT = Math.sin(TH);
    const A_P = { y: A_R.y + HEEL, z: A_R.z };
    const T_P = { y: A_P.y + (T_R.y - A_R.y) * cT - (T_R.z - A_R.z) * sT, z: A_P.z + (T_R.y - A_R.y) * sT + (T_R.z - A_R.z) * cT };

    // ======================= the bodice =======================
    // the waist seam: a point at the front (0.985 at the middle, 1.045 at the sides), a shallow dip at the back
    const wl = (x, z) => z > 0 ? 1.045 - 0.060 * Math.max(0, 1 - Math.abs(x) / 0.100) : 1.045 - 0.013 * Math.pow(Math.max(0, 1 - Math.abs(x) / 0.085), 1.3);
    const NX = (z) => lerp(0.1005, 0.0995, sm(-0.04, 0.03, z));          // the neckline's straight sides (half width)
    const NY = (z) => lerp(1.262, 1.251, sm(-0.04, 0.03, z));            // its straight bottom, back and front
    const topB = (x, z) => { const ax = Math.abs(x), X = NX(z), Y = NY(z); return lerp(Y + 0.004 * Math.pow(sm(X - 0.008, X, ax), 2), 1.62, sm(X - 0.0015, X + 0.0015, ax)); };
    const botB = (x, z) => wl(x, z) - 0.012;                              // under the skirt's top
    const bodR = (x, y, z) => Math.max(botB(x, z) - y, y - topB(x, z));
    const bodTh = () => 0.0036;
    W.snug('d4Bodice', bodR, bodTh, [-0.19, 0.19, 0.965, 1.43, -0.14, 0.13], 0.0039, { mat: damask });
    tick('bodice');
    // the braid round the neckline: a band 1.3 cm wide inside its edge, standing a little proud
    const BW = 0.0128;
    const trimR = (x, y, z) => Math.max(bodR(x, y, z), Math.abs(x) - (NX(z) + BW), NY(z) - BW - y);
    W.snug('d4NeckTrim', trimR, () => 0.0056, [-0.128, 0.128, 1.228, 1.44, -0.125, 0.115], 0.0029, { mat: braid });

    tick('trim');
    // ======================= the sleeves and cuffs =======================
    const SLE = 0.4525;
    const sl0 = (a) => lerp(-0.052, 0.046, Math.pow((1 - Math.cos(a)) / 2, 2));
    const slOff = (sl, a) => 0.0030 + 0.0014 * sm(-0.03, 0.0, sl) + 0.0016 * sm(0.0, 0.08, sl) + 0.0010 * sm(0.30, 0.10, sl) * Math.max(0, Math.cos(a)) - 0.0006 * sm(0.38, 0.45, sl);
    const TH_S = 0.0028, sleeveData = {};
    const armP = (S, sl, a, e) => { const p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), c3 = W.armPt(S, sl, PI / 2), c4 = W.armPt(S, sl, 1.5 * PI);
      const ax = [(c1[0] + c2[0] + c3[0] + c4[0]) / 4, (c1[1] + c2[1] + c3[1] + c4[1]) / 4, (c1[2] + c2[2] + c3[2] + c4[2]) / 4];
      return add(p, norm(sub(p, ax)), e); };
    for (const S of ['R', 'L']) {
      const NU = 40, NR = 44, rings = [], SLs = [];
      const row = (slf, ef) => { const ring = [], sls = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, sl = slf(a); ring.push(armP(S, sl, a, ef(sl, a))); sls.push([sl, a]); } rings.push(ring); SLs.push(sls); };
      for (let i = 0; i <= NR; i++) { const t = 1 - Math.pow(1 - i / NR, 1.25); row((a) => lerp(sl0(a), SLE, t), (sl, a) => slOff(sl, a)); }
      row(() => SLE + 0.0012, (sl, a) => slOff(SLE, a) - TH_S / 2); row(() => SLE, (sl, a) => slOff(SLE, a) - TH_S); row(() => SLE - 0.02, (sl, a) => slOff(SLE, a) - TH_S);
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      sleeveData[S] = { nRows: rings.length, cols };
      W.part('d4Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, 0.2); const [sl, a] = SLs[r][j % NU];
        const wa = W.wArmSL(S, cl(sl, 0.0, 0.446), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.5 * sm(0.03, -0.020, sl)) : wa; }, { mat: damaskD });
    }
    // the cuffs: a braid band over the end of each sleeve, its edge rolled under
    const C0 = 0.434, C1 = 0.4555, cuffData = {};
    for (const S of ['R', 'L']) {
      const NU = 44, rings = [], SLs = [];
      const e0 = (a) => slOff(SLE, a) + 0.0006;
      const row = (sl, e) => { const ring = [], sls = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(armP(S, sl, a, e(a))); sls.push(sl); } rings.push(ring); SLs.push(sls); };
      row(C0 - 0.0005, (a) => e0(a) - 0.0012);
      for (let i = 0; i <= 10; i++) { const t = i / 10, sl = lerp(C0, C1, t); row(sl, (a) => e0(a) + 0.0024 * Math.sqrt(Math.max(0, Math.sin(PI * (0.08 + 0.84 * t))))); }
      row(C1 + 0.0008, (a) => e0(a) + 0.0006); row(C1 + 0.0004, (a) => e0(a) - 0.0022); row(C1 - 0.012, (a) => e0(a) - 0.0026);
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      cuffData[S] = { nRows: rings.length, cols };
      W.part('d4Cuff' + S, g, (x, y, z, i) => { const r = Math.min(rings.length - 1, Math.floor(i / cols)), j = i % cols; return W.wArmSL(S, cl(SLs[r][0], 0, 0.446), (j / NU) * TAU); }, { mat: braid });
    }

    tick('sleeves');
    // ======================= the skirts =======================
    const SKC = -0.012, HEM = 0.046;
    // her body's outline round the skirt's middle line, by height and angle (from outside in, so her legs count as one)
    const NA = 72, YB0 = 1.10, YB1 = 0.62, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; let fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    // the painted outline (half width, front and back from the middle line), less the folds that stand out of it
    const FL = [[1.05, [0.104, 0.108, 0.072]], [1.00, [0.142, 0.122, 0.106]], [0.95, [0.166, 0.134, 0.131]], [0.90, [0.186, 0.144, 0.146]], [0.80, [0.217, 0.162, 0.173]],
      [0.70, [0.243, 0.181, 0.196]], [0.60, [0.266, 0.198, 0.218]], [0.50, [0.290, 0.212, 0.236]], [0.40, [0.310, 0.224, 0.253]], [0.30, [0.330, 0.236, 0.266]],
      [0.20, [0.345, 0.249, 0.280]], [0.10, [0.360, 0.261, 0.291]], [0.05, [0.365, 0.264, 0.293]]];
    const gAmp = (y) => lerp(0.0024, 0.024, Math.pow(sm(1.05, HEM, y), 0.7));
    const flareR = (y, a) => { const v = cprof(FL, y), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2], k = 0.85 * gAmp(y);
      return 1 / Math.sqrt((s / (v[0] - k)) * (s / (v[0] - k)) + (c / (rz - k)) * (c / (rz - k))); };
    const clear = (y) => lerp(0.0085, 0.014, sm(1.04, 0.90, y));
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), 0.035);
    // deep gathered folds, many and narrow under the waist, fewer and deeper toward the hem
    const fold = (a, y) => { const t = sm(1.04, HEM, y), ph = 0.45 * t * Math.sin(2 * a + 0.4);
      const fine = Math.sin(a * 52 + 0.3), main = 0.70 * Math.sin(a * 30 + ph + 0.7 * Math.sin(a * 3)) + 0.30 * Math.sin(a * 47 + 1.3 + ph * 1.5);
      return lerp(fine, main, sm(0.0, 0.22, t)); };
    // the front opening: its half width (seen from the front) by height, from the waist's point to the hem
    const XO = [[0.991, [0.0]], [0.95, [0.010]], [0.90, [0.020]], [0.85, [0.029]], [0.80, [0.039]], [0.75, [0.051]], [0.70, [0.063]], [0.60, [0.080]],
      [0.50, [0.093]], [0.40, [0.106]], [0.30, [0.119]], [0.20, [0.133]], [0.10, [0.148]], [0.05, [0.157]]];
    // the overskirt's fronts fall back toward the opening's edges (the satin stands forward between them: the side painting)
    const PULL = (y) => 0.032 * sm(0.97, 0.25, y), pull = (y, d) => PULL(y) * (1 - sm(0.0, 0.42, d));
    const a0Raw = (y) => { if (y >= 0.991) return 0; const xo = cprof(XO, y)[0]; let a = 0.1; for (let k = 0; k < 6; k++) a = Math.asin(cl(xo / (baseR(y, a) + 0.5 * gAmp(y) - PULL(y)), 0, 0.99)); return a; };
    const A0T = []; for (let k = 0; k <= 240; k++) A0T.push(a0Raw(lerp(0.0, 1.0, k / 240)));
    const a0Of = (y) => { if (y >= 0.991) return 0; const f = cl(y, 0, 1) * 240, k = Math.min(239, Math.floor(f)); return lerp(A0T[k], A0T[k + 1], f - k); };
    const wlA = (a) => { const r = 0.125; return wl(r * Math.sin(a), Math.cos(a)); };            // the waist seam by angle round her
    // the overskirt's surface: the folds calm toward the opening's edges, which turn in a little
    const overR = (y, a, a0) => { const d = Math.min(Math.abs(a - a0), Math.abs(TAU - a0 - a)), calm = sm(0.0, 0.10, d);
      return baseR(y, a) - pull(y, d) + gAmp(y) * (0.5 + 0.5 * fold(a, y)) * lerp(0.55, 1, calm) - 0.003 * (1 - sm(0.0, 0.03, d)) * sm(0.97, 0.85, y); };
    const ptA = (y, a, r) => [r * Math.sin(a), y, SKC + r * Math.cos(a)];
    // both skirts take the chains' weights of the same place on one surface (by height and angle round the middle line), so the two
    // layers move as one and the satin never slides out past the overskirt's edges
    const wSk = (x, y, z) => { const a = Math.atan2(x, z - SKC), r = baseR(Math.min(y, 1.06), a); return W.wSkirt(r * Math.sin(a), y, SKC + r * Math.cos(a)); };
    const hemY = (a) => HEM + 0.003 * Math.sin(a * 3 + 1) - 0.004 * (0.5 + 0.5 * fold(a, HEM));
    let over = null;
    {
      const NU = 236, NV = 58, G = [], A = [];
      for (let i = 0; i <= NV; i++) { const t = i / NV, f = t * t * 0.35 + t * 0.65, row = [], arow = [];
        for (let j = 0; j < NU; j++) { const u = j / (NU - 1);
          let y = lerp(1.03, HEM, f), a = 0, a0 = 0;
          for (let it = 0; it < 4; it++) { a0 = a0Of(y); a = lerp(a0, TAU - a0, u); y = lerp(wlA(a) + 0.005, hemY(a), f); }
          row.push(ptA(y, a, overR(y, a, a0))); arow.push(a); }
        G.push(row); A.push(arow); }
      const g = thickSheet(G, 0.0026, { inner: 3, outRef: (i, j) => [0, G[i][j][1], SKC] });
      over = { rows: NV + 1, cols: NU, nOut: g.nOut, A };
      W.part('d4Skirt', g, wSk, { mat: damaskD });
    }
    tick('over');
    // the gold underskirt: under the overskirt, standing forward between the opening's edges
    // (only its front: round her back it could never be seen, and in a deep bend it would come through the overskirt there)
    const AU = 1.40;
    const gap = (y, d) => lerp(0.0035, 0.008, sm(1.03, 0.85, y)) * (1 + 1.2 * sm(0.5, 1.2, d));
    const foldU = (a, y) => 0.6 * Math.sin(a * 14 + 0.5 + 0.3 * Math.sin(a * 2)) + 0.4 * Math.sin(a * 23 + 1.7);
    const underR = (y, a) => { const a0 = a0Of(y), d = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))), bulge = a0 > 0.01 ? sm(a0 * 0.88, a0 * 0.45, d) : 0, gu = 0.45 * gAmp(y), gp = gap(y, d);
      const outside = baseR(y, a) - gp - pull(y, Math.max(0, d - a0)) - 0.007 * sm(0.97, 0.80, y) * (1 - sm(0.0, 0.25, Math.abs(d - a0))), inside = baseR(y, a) + 0.45 * gAmp(y) + gu * (0.5 + 0.5 * foldU(a, y));
      return lerp(outside, inside, bulge) - 0.0004; };
    const hemU = (a) => HEM - 0.004 + 0.002 * Math.sin(a * 5 + 0.4) + 0.012 * sm(0.75, 1.3, Math.abs(a));
    let underRows = 0, underCols = 0;
    {
      const NU = 112, NV = 46, rings = [], aj = (j) => lerp(-AU, AU, j / (NU - 1));
      for (let i = 0; i <= NV; i++) { const t = i / NV, f = t * t * 0.35 + t * 0.65, ring = [];
        for (let j = 0; j < NU; j++) { const a = aj(j), y = lerp(wlA(a) + 0.003, hemU(a), f); ring.push(ptA(y, a, underR(y, a))); }
        rings.push(ring); }
      { const r0 = [], r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = aj(j), h = hemU(a), R0 = underR(h, a); r0.push(ptA(h - 0.0015, a, R0 - 0.0018)); r1.push(ptA(h + 0.0005, a, R0 - 0.0040)); r2.push(ptA(h + 0.030, a, underR(h + 0.03, a) - 0.0045)); } rings.push(r0, r1, r2); }
      const g = W.loft(rings, { open: true });
      underRows = rings.length; underCols = NU;
      W.part('d4Underskirt', g, wSk, { mat: satinD });
    }

    tick('under');
    // ======================= the chain girdle, the hanging chain and its drop =======================
    {
      const P = [], Nn = [], NP = 360;
      for (let k = 0; k <= NP; k++) { const a = (k / NP) * TAU, y = wlA(a) + 0.003, r = bodyR(y, a) + clear(y) + gAmp(y) + 0.0032;
        P.push(ptA(y, a, r)); Nn.push([Math.sin(a), 0, Math.cos(a)]); }
      W.part('d4Girdle', chainAlong(P, Nn, 0.0066, 0.0088, 0.0056, 0.00105), (x, y, z) => W.wBody(x, Math.max(y, 1.0), z - 0.01), { mat: gold });
    }
    const YD = 0.521;
    const dropZ = (y) => { let r = 0; for (const da of [-0.03, 0, 0.03]) r = Math.max(r, underR(y, da)); return SKC + r + 0.0032; };
    {
      const P = [], Nn = [], y0 = wlA(0) + 0.001;
      for (let k = 0; k <= 60; k++) { const y = lerp(y0, YD + 0.004, k / 60); P.push([0, y, Math.max(dropZ(y), k < 4 ? SKC + bodyR(y, 0) + clear(y) + gAmp(y) + 0.003 : 0)]); Nn.push([0, 0, 1]); }
      W.part('d4ChainDrop', chainAlong(P, Nn, 0.0066, 0.0086, 0.0052, 0.0010), (x, y, z) => wSk(0, y, z), { mat: gold });
    }
    {
      // the drop: a small cap, a bead, an acorn-shaped body with a point
      const PR = [[0.000, 0.0], [0.0015, 0.0012], [0.0030, 0.0030], [0.0045, 0.0034], [0.0060, 0.0030], [0.0072, 0.0052], [0.0090, 0.0068], [0.0130, 0.0074],
        [0.0170, 0.0068], [0.0210, 0.0050], [0.0240, 0.0028], [0.0262, 0.0010], [0.0270, 0.0]];
      const zc = dropZ(YD - 0.012) + 0.0045, rings = [], NV = 16;
      for (const [d, r] of PR) { const ring = []; for (let j = 0; j < NV; j++) { const ph = (j / NV) * TAU; ring.push([r * Math.cos(ph), YD - d, zc + r * Math.sin(ph) * 0.92]); } rings.push(ring); }
      const g = orient(W.loft(rings, {}), rings), wd = wSk(0, YD - 0.012, zc);
      W.part('d4Pendant', g, () => wd, { mat: gold });
    }

    tick('chains');
    // ======================= the shoes: black suede court shoes, a curved heel =======================
    // Modelled as she stands in them (lifted by HEEL, each foot tipped by TH about its ankle, the forefoot flat), then carried back to
    // her rest pose through the bones that carry each point (shin, foot, toes). Made for her left foot and mirrored.
    const BI = W.BI, L2 = [0, 0];
    const fwd = (ry, rz) => [A_P.y + (ry - A_R.y) * cT - (rz - A_R.z) * sT, A_P.z + (ry - A_R.y) * sT + (rz - A_R.z) * cT];
    const toRest = (y, z) => {
      const wS = sm(A_P.y + 0.006, A_P.y + 0.050, y), wT = (1 - wS) * sm(T_P.z - 0.012, T_P.z + 0.018, z), wF = 1 - wS - wT;
      const Mi = (ry, rz) => { const f = fwd(ry, rz); return [wS * (ry + HEEL) + wF * f[0] + wT * (ry - T_R.y + T_P.y), wS * rz + wF * f[1] + wT * (rz - T_R.z + T_P.z)]; };
      let ry = wS * (y - HEEL) + wF * (A_R.y + (y - A_P.y) * cT + (z - A_P.z) * sT) + wT * (y - T_P.y + T_R.y), rz = wS * z + wF * (A_R.z - (y - A_P.y) * sT + (z - A_P.z) * cT) + wT * (z - T_P.z + T_R.z);
      for (let it = 0; it < 4; it++) { const q = Mi(ry, rz); ry += y - q[0]; rz += z - q[1]; }
      return [ry, rz, wS, wF, wT];
    };
    // a toe box over her toes (foot frame: X out to the little toe, Z forward from the ankle): inner edge, outer edge, height
    const TOE = [[0.060, [-0.036, 0.048, 0.064]], [0.090, [-0.042, 0.052, 0.054]], [0.110, [-0.045, 0.050, 0.046]], [0.130, [-0.043, 0.046, 0.039]],
      [0.150, [-0.040, 0.036, 0.033]], [0.165, [-0.035, 0.024, 0.029]], [0.180, [-0.027, 0.010, 0.025]], [0.192, [-0.017, -0.002, 0.021]], [0.200, [-0.010, -0.006, 0.018]]];
    const toeD = (X, Y, Z) => {
      const v = cprof(TOE, Z), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.008, ry = Math.max(0.004, v[2] - 0.008);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.012, q = Math.pow(Math.pow(ux, 2.4) + Math.pow(uy, 2.4), 1 / 2.4);
      return smax((q - 1) * Math.min(rx, Y > yc ? ry : 0.012), smax(0.07 - Z, Z - 0.2035, 0.006), 0.004);
    };
    // the opening's edge (rest, foot frame): the heel counter, low sides, the vamp over her toes and the top of her instep
    const cutY = (X, Z) => S0 + lerp(0.048, 0.031, sm(-0.07, 0.02, Z)) + 0.10 * sm(0.068, 0.108, Z + 1.4 * X * X);
    const s = 1;
    const H_R = [s * 0.0775, -0.044], H_P = fwd(S0 - PLAT, H_R[1]);      // the heel seat, rest (x, z) and posed (y, z)
    const shoeG = (x, y, z) => {
      // the heel (posed): a curved block from the heel seat to the floor, narrowing and set forward as it goes down
      const t = cl((H_P[0] + 0.004 - y) / (H_P[0] + 0.004 - FLOOR), 0, 1), zc = H_P[1] - 0.004 + 0.012 * Math.pow(t, 1.6), hx = lerp(0.0205, 0.0078, Math.pow(t, 0.7)), hz = lerp(0.024, 0.0085, Math.pow(t, 0.6));
      const hxz = (Math.hypot((x - H_R[0]) / hx, (z - zc) / hz) - 1) * Math.min(hx, hz);
      const heel = smax(hxz, Math.max(FLOOR - y, y - H_P[0] - 0.010), 0.0012);
      const [ry, rz] = toRest(y, z);
      DOLL.toLocal(s, x, rz, L2); const X = L2[0], Z = L2[1];
      // far from the upper and the sole (beside her foot, above the shoe's top, under its sole): only the heel can be near
      if (Math.max(-0.075 - X, X - 0.085, -0.095 - Z, Z - 0.212) > 0.006 || ry > S0 + 0.078 || ry < S0 - PLAT - 0.006) return Math.min(heel, 0.007);
      // the upper: her foot (and ankle) 2.4 mm out, a toe box over her toes, cut along the opening
      let up = 1;
      const cy = ry - cutY(X, Z);
      if (cy < 0.008) { const foot = Math.min(DOLL.fFoot(s, x, ry, rz), ry > 0.06 ? DOLL.fLegOnly(s, x, ry, rz) : 1) - 0.0024; up = smax(smin(foot, toeD(X, ry, Z), 0.008), cy, 0.0016); }
      // the sole, under her foot (rest): its plan her foot's, 3 mm wider
      const slab = Math.max(S0 - PLAT - ry, ry - S0 - 0.002);
      let sole = slab;
      if (slab < 0.006) { const plan = Math.max(smin(DOLL.fFoot(s, x, S0 + 0.007, rz), toeD(X, S0 + 0.008, Z), 0.006) - 0.0030, -0.090 - Z); sole = smax(plan, slab, 0.0015); }
      return Math.min(smin(up, sole, 0.003), heel);
    };
    const SHOE = {};
    {
      const g = W.snets(shoeG, [0.028, 0.136, FLOOR - 0.003, 0.141, -0.101, 0.197], 0.0036), pos = [], idx = [], used = new Int32Array(g.nv).fill(-1), Wt = [], solv = [];
      for (let t = 0; t < g.tris.length; t += 3) {
        
        for (let k = 0; k < 3; k++) { const v = g.tris[t + k];
          if (used[v] < 0) { used[v] = pos.length / 3; const x = g.pos[v * 3], y = g.pos[v * 3 + 1], z = g.pos[v * 3 + 2], r = toRest(y, z); pos.push(x, r[0], r[1]); Wt.push([r[2], r[3], r[4]]);
            DOLL.toLocal(s, x, r[1], L2); solv.push(r[0] < S0 + 0.0005 || y < H_P[0] + 0.006 && L2[1] < -0.02 ? 1 : 0); }
          idx.push(used[v]); }
      }
      for (const [S, sg] of [['L', 1], ['R', -1]]) {
        const P = pos.slice(), I = idx.slice();
        if (sg < 0) { for (let i = 0; i < P.length; i += 3) P[i] = -P[i]; for (let i = 0; i < I.length; i += 3) { const q = I[i + 1]; I[i + 1] = I[i + 2]; I[i + 2] = q; } }
        // the sole and the heel (by their triangles) in a dark brown leather; the upper in black suede
        const iS = [], iU = []; for (let i = 0; i < I.length; i += 3) (solv[I[i]] && solv[I[i + 1]] && solv[I[i + 2]] ? iS : iU).push(I[i], I[i + 1], I[i + 2]);
        const wf = (x, y, z, v) => { const w = Wt[v]; return [BI['shin' + S], w[0], BI['foot' + S], w[1], BI['toe' + S], w[2]]; };
        const up = W.part('d4Shoe' + S, { pos: P, idx: iU }, wf, { mat: suede });
        W.part('d4ShoeSole' + S, { pos: P, idx: iS }, wf, { mat: soleMat });
        const contact = []; for (let v = 0; v < P.length / 3; v++) { const z = P[v * 3 + 2], y = P[v * 3 + 1]; if (solv[v] && (y < S0 - PLAT + 0.002 || fwd(y, z)[0] < FLOOR + 0.004)) contact.push(v); }
        const st = Math.max(1, Math.ceil(contact.length / 48));
        SHOE[S] = { mesh: up.mesh, contact: contact.filter((v, k) => k % st === 0) };
      }
    }

    tick('shoes');
    // ======================= standing in heels: lift her, tip her feet, keep her forefeet flat (wardrobe/M1.js) =======================
    {
      const AXX = new THREE.Vector3(1, 0, 0), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), vk = new THREE.Vector3(), mInv = new THREE.Matrix4();
      const fw = new THREE.Vector3(), qw = new THREE.Quaternion(), qr = new THREE.Quaternion();
      const _H = new THREE.Vector3(), _K = new THREE.Vector3(), _A = new THREE.Vector3(), _T = new THREE.Vector3(), _d = new THREE.Vector3(), _p = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qf = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _up = new THREE.Vector3();
      let done = null;
      const rotBone = (b, from, to) => { _q1.setFromUnitVectors(from.clone().normalize(), to.clone().normalize()); b.parent.getWorldQuaternion(_qp); b.getWorldQuaternion(_q2);
        b.quaternion.copy(_qp.clone().invert().multiply(_q1).multiply(_q2)); b.updateMatrixWorld(true); };
      const liftLeg = (SK, S, dh) => {
        const th = SK['thigh' + S], sh = SK['shin' + S], ft = SK['foot' + S], root = SK.hips.parent;
        root.getWorldQuaternion(_qp); _up.set(0, 1, 0).applyQuaternion(_qp);
        th.getWorldPosition(_H); sh.getWorldPosition(_K); ft.getWorldPosition(_A); ft.getWorldQuaternion(_qf); const qFoot = _qf.clone();
        const a = _K.distanceTo(_H), b = _A.distanceTo(_K); _T.copy(_A).addScaledVector(_up, dh);
        let c = _T.distanceTo(_H); c = cl(c, Math.abs(a - b) + 1e-4, a + b - 1e-4);
        const d0 = _A.clone().sub(_H).normalize(); _d.copy(_T).sub(_H).normalize();
        const m0 = _K.clone().sub(_H); m0.addScaledVector(d0, -m0.dot(d0)); _p.copy(m0).addScaledVector(_d, -m0.dot(_d));
        if (_p.lengthSq() < 1e-10) return; _p.normalize();
        const al = Math.acos(cl((a * a + c * c - b * b) / (2 * a * c), -1, 1));
        const K2 = _H.clone().addScaledVector(_d, a * Math.cos(al)).addScaledVector(_p, a * Math.sin(al));
        rotBone(th, _K.clone().sub(_H), K2.clone().sub(_H));
        sh.getWorldPosition(_K); ft.getWorldPosition(_A);
        rotBone(sh, _A.clone().sub(_K), _T.clone().sub(_K));
        sh.getWorldQuaternion(_qp); ft.quaternion.copy(_qp.invert().multiply(qFoot)); ft.updateMatrixWorld(true);
      };
      W.onFrame((SK) => {
        if (done && SK.hips.position.y === done.y && SK.footR.quaternion.equals(done.qR) && SK.footL.quaternion.equals(done.qL)) return;     // a held pose: not twice
        const root = SK.hips.parent; root.updateMatrixWorld(true); mInv.copy(root.matrixWorld).invert(); root.getWorldQuaternion(qr).invert();
        let kneeLo = 9; for (const S of ['R', 'L']) { SK['shin' + S].getWorldPosition(vk).applyMatrix4(mInv); kneeLo = Math.min(kneeLo, vk.y); }
        const kn = sm(0.30, 0.15, kneeLo);
        SK.hips.position.y += HEEL * (1 - kn);
        for (const S of ['R', 'L']) {
          SK['foot' + S].getWorldQuaternion(qw); qw.premultiply(qr); fw.set(0, 0, 1).applyQuaternion(qw);
          const already = -Math.asin(cl(fw.y, -1, 1)), th = TH * (1 - sm(0.25, 0.9, already));
          SK['foot' + S].quaternion.multiply(qa.setFromAxisAngle(AXX, th));
          SK['toe' + S].quaternion.multiply(qb.setFromAxisAngle(AXX, -th));
        }
        root.updateMatrixWorld(true); const lows = {};
        for (const S of ['R', 'L']) {
          const B = SHOE[S], m = B.mesh; m.updateMatrixWorld(true); let lo = 9;
          for (const v of B.contact) { m.boneTransform(v, vk); lo = Math.min(lo, vk.y); }
          const need = FLOOR - lo;
          if (need > 0.001) { liftLeg(SK, S, need); root.updateMatrixWorld(true); lows[S] = FLOOR; } else lows[S] = lo;
        }
        const fl = Math.min(lows.R, lows.L) - FLOOR;
        if (fl > 0.002 && fl < 0.03) { SK.hips.position.y -= fl; root.updateMatrixWorld(true); }
        done = { y: SK.hips.position.y, qR: SK.footR.quaternion.clone(), qL: SK.footL.quaternion.clone() };
      });
    }

    // ======================= her legs keep out of the skirts (wardrobe/D1.js) =======================
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
      // the floor-length cloth goes on past the chains' ends (0.18) to the hem: a point that far along the last bone keeps clear too
      const EXT = 0.11, restH = CH.map((c) => { const n = c.pts.length; return restOf(M.copy(c.pts[n - 1]).sub(c.pts[n - 2]).setLength(EXT).add(c.pts[n - 1])); }), Hp = new T3.Vector3(), dH = new T3.Vector3();
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
            if (k === NL - 1) { Hp.copy(cur).multiplyScalar(len + EXT).add(P[ci]);
              if (push(Hp, restH[ci], dm)) { dH.copy(Hp).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dH), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dH); } } }
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

    // ======================= paint corrections =======================
    W.afterPaint((parts) => {
      W.D4.tris = parts.map((p) => p.key + ' ' + p.mesh.geometry.index.count / 3);
      const copyRows = (mesh, pairs) => { for (const key of ['aPP', 'aPN', 'aPE']) { const at = mesh.geometry.attributes[key]; if (!at) continue; const A = at.array;
        for (const [i, j] of pairs) { A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; } at.needsUpdate = true; } };
      for (const p of parts) {
        const P = p.mesh.geometry.attributes.position.array, PP = p.mesh.geometry.attributes.aPP;
        // the turned-in ends of the sleeves, cuffs and underskirt take the colour just outside them
        if (/^d4Sleeve/.test(p.key)) { const d = sleeveData[p.key.slice(-1)], pairs = [], src = d.nRows - 5;
          for (let r = d.nRows - 3; r < d.nRows; r++) for (let c = 0; c < d.cols; c++) pairs.push([r * d.cols + c, src * d.cols + c]); copyRows(p.mesh, pairs); }
        if (/^d4Cuff/.test(p.key)) { const d = cuffData[p.key.slice(-1)], pairs = [];
          for (let c = 0; c < d.cols; c++) { pairs.push([c, 3 * d.cols + c]); for (let r = d.nRows - 3; r < d.nRows; r++) pairs.push([r * d.cols + c, (d.nRows - 6) * d.cols + c]); } copyRows(p.mesh, pairs); }
        // the braid reads its own middle: not the skin inside its edge, nor the shoulder above it
        if (p.key === 'd4NeckTrim') {
          for (let i = 0; i < PP.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], X = NX(z), Y = NY(z);
            const my = Y - BW / 2, mx = X + BW / 2, ax = Math.abs(x);
            if (y < Y + 0.004) PP.array[i * 3 + 1] += (my + (y - my) * 0.55) - y;
            if (ax < X + BW + 0.004 && y > Y - BW) PP.array[i * 3] += (x < 0 ? -1 : 1) * ((mx + (ax - mx) * 0.55) - ax);
            PP.array[i * 3 + 1] = Math.min(PP.array[i * 3 + 1], 1.318); }
          PP.needsUpdate = true; }
        if (p.key === 'd4Underskirt') { const pairs = [], src = underRows - 5;
          for (let r = underRows - 3; r < underRows; r++) for (let c = 0; c < underCols; c++) pairs.push([r * underCols + c, src * underCols + c]); copyRows(p.mesh, pairs);
          // the painted hanging chain runs down the middle: read the satin beside it; and the edges of the opening read a little inward
          for (let i = 0; i < PP.count; i++) { const x = PP.array[i * 3], z = P[i * 3 + 2]; if (z < 0) continue;
            if (Math.abs(x) < 0.013) PP.array[i * 3] = (x < 0 ? -1 : 1) * lerp(0.013, 0.018, Math.abs(x) / 0.013);
            const y = P[i * 3 + 1], xo = y < 0.99 ? cprof(XO, y)[0] : 0; PP.array[i * 3] = (x < 0 ? -1 : 1) * Math.min(Math.abs(PP.array[i * 3]), Math.max(0.014, xo - 0.012)); }
          // behind the overskirt's edges the side painting shows the red: there it reads the front painting's satin only
          { const E = p.mesh.geometry.attributes.aPE; for (let i = 0; i < PP.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], a = Math.abs(Math.atan2(x, z - SKC)), a0 = a0Of(y);
            E.array[i * 3 + 2] *= sm(a0 + 0.02, a0 - 0.03, a); if (z > SKC) E.array[i * 3] = 1; } E.needsUpdate = true; }
          PP.needsUpdate = true; }
        // the side painting's arm and hand hang over the skirts' side: that view does not see them there
        if (p.key === 'd4Skirt' || p.key === 'd4Underskirt') { const E = p.mesh.geometry.attributes.aPE;
          for (let i = 0; i < PP.count; i++) { const y = PP.array[i * 3 + 1], z = PP.array[i * 3 + 2]; if (y > 0.60 && y < 1.10) E.array[i * 3 + 2] *= z > 0.02 ? sm(0.105, 0.125, z) : sm(-0.095, -0.115, z); }
          E.needsUpdate = true;
          // the hem, its rim and its inside read the cloth a little above the painted hem (not the shoes and the floor below it)
          for (let i = 0; i < PP.count; i++) PP.array[i * 3 + 1] = Math.max(PP.array[i * 3 + 1], 0.080);
          // under the girdle: the top of the skirts reads the cloth just below the painted chain
          for (let i = 0; i < PP.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], w = wl(x, z), y0 = w - 0.026;
            if (y > y0) PP.array[i * 3 + 1] = Math.min(PP.array[i * 3 + 1], lerp(y0, w - 0.013, cl((y - y0) / 0.034, 0, 1))); }
          PP.needsUpdate = true; }
        if (p.key === 'd4Skirt') { const EE = p.mesh.geometry.attributes.aPE;
          // its edges at the opening read the red a little further out (not the satin beside them); its inside reads its outside
          for (let i = 0; i < PP.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]; let a = Math.atan2(x, z - SKC); if (a < 0) a += TAU;
            const a0 = a0Of(y), d = Math.min(Math.abs(a - a0), Math.abs(TAU - a0 - a));
            if (d < 0.14 && Math.cos(a) > 0) { const sx = Math.sin(a) < 0 ? -1 : 1; PP.array[i * 3] += sx * 0.016 * (1 - d / 0.14); }
            // the front painting sees the cloth by the opening's edges (the satin beside them, further forward, does not hide them)
            if (d < 0.30 && Math.cos(a) > 0) EE.array[i * 3] = Math.max(EE.array[i * 3], sm(0.30, 0.20, d)); }
          PP.needsUpdate = true; EE.needsUpdate = true; }
      }
    });

    tick('hooks');
    // (her skin where the sports bra was comes back by itself when the bra is hidden: no patch needed)

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'toenail']);
    W.hideSkin((x, y, z) => (y > botB(x, z) + 0.014 && y < topB(x, z) - 0.035) || (y > 0.80 && y < botB(x, z) + 0.016), ['dollTrunk']);
    W.hideSkin((x, y, z) => y > 0.25, ['dollLeg']);
    W.hideSkin((x, y, z) => { const sg = x < 0 ? -1 : 1; DOLL.toLocal(sg, x, z, L2); return y < cutY(L2[0], L2[1]) - 0.010; }, ['dollFoot']);
    W.hideSkin((x, y, z) => { const S = x < 0 ? 'R' : 'L', f = W.armFrame(S, x, y, z); return f.sl < 0.425; }, ['arm']);
    tick('end'); W.D4 = { HEEL, TH, TT };
  },
};
