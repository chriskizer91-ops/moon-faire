// C6, the bard (C6A.png, C6B.png): a dark green velvet doublet with a short stand collar, eight round gold buttons down the front
// and a little split at the front of its hem, fitted to her waist and flaring a little over her hips; its sleeves fitted to her
// wrists, with round puffs at the tops of her arms, the velvet cut in strips over gold satin; a brown leather belt with a brass
// buckle at her waist; a short burgundy half-cape over her LEFT shoulder, fastened in front with a round gold brooch (a short brown
// strap from it toward her collar) and at the back with a small gold pin, covering her left upper arm and hanging to her waist in
// front, over her hips behind; fitted tan breeches tucked into tall brown leather riding boots; a burgundy velvet beret worn tilted
// on the bun, a long white plume sweeping back from it over her right side.
// Pieces: c6Doublet, c6Collar, c6SleeveR/L, c6PuffSatin (the gold under the strips, both arms), c6Puffs (the velvet strips, both
// arms), c6Buttons, c6Belt, c6Buckle, c6Cape, c6Brooch, c6CapePin, c6CapeStrap, c6Breeches, c6BootR/L, c6Beret, c6Feather.
// The cape: its top lies on her shoulder (her chest, back and upper arm carry it); its front and back halves each hang from a hinge
// (the base doll's spare cloak-sleeve bones slL0_0 and slL0_1, set every frame here): they swing as she moves, hang away from her when
// she leans, and are pushed out of the way by her left arm, thigh and hips, so neither passes through her.
// She stands on the boots' soles: LIFT (C6_prep.json heel).
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.C6 = {
  name: 'Bard: velvet doublet with puffed sleeves, half-cape, breeches, riding boots, plumed beret', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { THREE, sm, lerp, PI, TAU, cl, smin, smax, prof, DOLL } = W;
    const F = W.F, Fs = W.Fsnug, BI = W.BI;
    const LIFT = 0.016;
    const LOG = (window.__c6log = []);

    // ======================= materials =======================
    // velvet: a soft sheen where the cloth turns away from the eye
    const velvetize = (mat, key, k, tint) => { const ob = mat.onBeforeCompile;
      mat.onBeforeCompile = (sh, r) => { if (ob) ob.call(mat, sh, r);
        sh.fragmentShader = sh.fragmentShader.replace('#include <tonemapping_fragment>', `{ float vN = clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0);
          gl_FragColor.rgb += vec3(${tint}) * ${k.toFixed(2)} * pow(1.0 - vN, 2.0) * (0.55 + 0.45 * clamp(normal.y * 0.5 + 0.6, 0.0, 1.0)); }
          #include <tonemapping_fragment>`); };
      mat.customProgramCacheKey = () => key; return mat; };
    const velvetG = velvetize(W.paint({ rough: 0.88, emis: 0.30, env: 0.12 }), 'c6VelG', 1.0, '0.050, 0.060, 0.040');
    const velvetGD = velvetize(W.paint({ rough: 0.88, emis: 0.30, env: 0.12, double: true }), 'c6VelGD', 1.0, '0.050, 0.060, 0.040');
    const capeM = velvetize(W.paint({ rough: 0.90, emis: 0.28, env: 0.12 }), 'c6VelR', 1.0, '0.080, 0.030, 0.035');
    const tan = W.paint({ rough: 0.92, emis: 0.27, env: 0.10 });
    const bootM = W.paint({ rough: 0.46, emis: 0.24, env: 0.55 });
    const beltM = W.paint({ rough: 0.55, emis: 0.24, env: 0.45 });
    const strapM = W.std({ color: W.lin('#5b3524'), roughness: 0.55, envMapIntensity: 0.45 });
    const brass = W.std({ color: W.lin('#c8984c'), metalness: 0.9, roughness: 0.30, envMapIntensity: 1.25 });
    const stripM = velvetize(W.std({ color: W.lin('#2e3020'), roughness: 0.9, envMapIntensity: 0.12, side: THREE.DoubleSide }), 'c6Strip', 1.1, '0.050, 0.060, 0.040');
    const satin = W.phys({ color: W.lin('#b07a22'), emissive: W.lin('#3a2406'), emissiveIntensity: 0.5, roughness: 0.30, metalness: 0.15, clearcoat: 0.4, envMapIntensity: 1.0 });
    const beretM = velvetize(W.std({ color: W.lin('#420b14'), emissive: W.lin('#1c0408'), emissiveIntensity: 0.30, roughness: 0.92, envMapIntensity: 0.12 }), 'c6Beret', 1.4, '0.085, 0.025, 0.035');

    // ======================= small geometry helpers =======================
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const perp = (n) => { const u = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])); return [u, cross(n, u)]; };
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    function orient(g, rings) {
      const nor = W.computeNormals(g.pos, g.idx), m = Math.floor(rings.length / 2), r = rings[m], n = r.length, cols = n + 1;
      const c = r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]); let s = 0;
      for (let j = 0; j < n; j++) { const v = m * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    function faceOut(g, c) {
      const nor = W.computeNormals(g.pos, g.idx); let s = 0;
      for (let v = 0; v < g.pos.length / 3; v++) { const p = [g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]], q = c(p); s += nor[v * 3] * (p[0] - q[0]) + nor[v * 3 + 1] * (p[1] - q[1]) + nor[v * 3 + 2] * (p[2] - q[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    function tube(pts, r, NV, closed) {
      NV = NV || 6; const rings = [], N = pts.length;
      for (let i = 0; i < N; i++) { const a = closed ? pts[(i - 1 + N) % N] : pts[Math.max(0, i - 1)], b = closed ? pts[(i + 1) % N] : pts[Math.min(N - 1, i + 1)], t = norm(sub(b, a)), [u, v] = perp(t), ring = [];
        for (let j = 0; j < NV; j++) { const p = (j / NV) * TAU; ring.push(add(add(pts[i], u, r * Math.cos(p)), v, r * Math.sin(p))); } rings.push(ring); }
      if (closed) rings.push(rings[0]);
      return orient(W.loft(rings, closed ? {} : { capA: true, capB: true }), rings);
    }
    function frame(c, n, t, w, h, r) {
      const up = norm(cross(n, t)), pts = [], rc = Math.min(w, h) * 0.22, NC = 5;
      const cs = [[w / 2 - rc, h / 2 - rc, 0], [-(w / 2 - rc), h / 2 - rc, PI / 2], [-(w / 2 - rc), -(h / 2 - rc), PI], [w / 2 - rc, -(h / 2 - rc), 1.5 * PI]];
      for (const [cx, cy, a0] of cs) for (let k = 0; k <= NC; k++) { const a = a0 + (PI / 2) * k / NC; pts.push(add(add(c, t, cx + rc * Math.cos(a)), up, cy + rc * Math.sin(a))); }
      return tube(pts, r, 6, true);
    }
    // a dome (a button, a brooch): centre c on a surface of direction n, radius R, height H, a lip of height L round its foot
    function dome(c, n, R, H, NU, lip) {
      const [u, v] = perp(n), rings = [], prof0 = [[0, -0.0008], [0.0, 0.0], [0.15, lip || 0.0], [0.30, (lip || 0) + H * 0.35], [0.55, (lip || 0) + H * 0.70], [0.78, (lip || 0) + H * 0.92], [1.0, (lip || 0) + H]];
      const rad = [1.0, 1.0, 1.0, 0.95, 0.80, 0.55, 0.0];
      for (let k = 0; k < prof0.length; k++) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, rr = R * rad[k]; ring.push(add(add(add(c, n, prof0[k][1]), u, rr * Math.cos(a)), v, rr * Math.sin(a))); } rings.push(ring); }
      return faceOut(W.loft(rings, { capA: true }), () => add(c, n, -0.01));
    }
    function hit(G, p, d, maxL) {
      let lo = 0, hi = -1; const st = 0.0015;
      for (let t = 0; t <= (maxL || 0.4); t += st) { if (G(p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t) < 0) { hi = t; lo = Math.max(0, t - st); break; } }
      if (hi < 0) return null;
      for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (G(p[0] + d[0] * m, p[1] + d[1] * m, p[2] + d[2] * m) < 0) hi = m; else lo = m; }
      return add(p, d, (lo + hi) / 2);
    }
    const grad = (G, p) => { const e = 0.0008; return norm([G(p[0] + e, p[1], p[2]) - G(p[0] - e, p[1], p[2]), G(p[0], p[1] + e, p[2]) - G(p[0], p[1] - e, p[2]), G(p[0], p[1], p[2] + e) - G(p[0], p[1], p[2] - e)]); };
    const snugG = (R, th) => (x, y, z) => { const r = R(x, y, z); return smax(Fs(x, y, z) - th(x, y, z) - 0.0011 * Math.exp(-r * r / 1.6e-5), r, 0.0022); };
    // a sheet G[i][j] (rows i, columns j) made thick: the outside, the inside th further in, and a rim round its edges
    function thickSheet(G, th, outRef) {
      const m = G.length, n = G[0].length, pos = [], N = [];
      for (let i = 0; i < m; i++) { const row = []; for (let j = 0; j < n; j++) {
        const a = G[Math.max(0, i - 1)][j], b = G[Math.min(m - 1, i + 1)][j], c = G[i][Math.max(0, j - 1)], d = G[i][Math.min(n - 1, j + 1)];
        let q = norm(cross(sub(b, a), sub(d, c))); if (dot(q, sub(G[i][j], outRef(i, j))) < 0) q = [-q[0], -q[1], -q[2]]; row.push(q); } N.push(row); }
      for (let L = 0; L < 2; L++) for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) { const p = G[i][j], q = N[i][j], t = L ? (typeof th === 'function' ? th(i, j) : th) : 0; pos.push(p[0] - q[0] * t, p[1] - q[1] * t, p[2] - q[2] * t); }
      const nOut = m * n, outer = [], inner = [];
      for (let i = 0; i < m - 1; i++) for (let j = 0; j < n - 1; j++) { const a = i * n + j, b = a + 1, c = a + n + 1, d = a + n;
        outer.push(a, d, c, a, c, b); inner.push(nOut + a, nOut + c, nOut + d, nOut + a, nOut + b, nOut + c); }
      { const nor = W.computeNormals(pos.slice(0, nOut * 3), outer); let s = 0; for (let v = 0; v < nOut; v++) { const [i, j] = [Math.floor(v / n), v % n]; s += dot([nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]], N[i][j]); }
        if (s < 0) for (const L of [outer, inner]) for (let t = 0; t < L.length; t += 3) { const x = L[t + 1]; L[t + 1] = L[t + 2]; L[t + 2] = x; } }
      const idx = outer.concat(inner), rimSrc = [];
      // a rim along an edge: its faces turned away from the sheet (from the grid point next in from the edge)
      const rim = (list, inward) => { const k0 = pos.length / 3, L = list.length;
        for (const v of list) { pos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); rimSrc.push(v); }
        for (const v of list) { const w = nOut + v; pos.push(pos[w * 3], pos[w * 3 + 1], pos[w * 3 + 2]); rimSrc.push(v); }
        for (let k = 0; k < L - 1; k++) { const a = k0 + k, b = a + 1, c = k0 + L + k + 1, d = k0 + L + k, v = list[k];
          const P = (q) => [pos[q * 3], pos[q * 3 + 1], pos[q * 3 + 2]], fn = cross(sub(P(b), P(a)), sub(P(c), P(a))), dir = sub(P(a), P(inward(v)));
          if (dot(fn, dir) >= 0) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c); } };
      const row = (i) => { const l = []; for (let j = 0; j < n; j++) l.push(i * n + j); return l; };
      const col = (j) => { const l = []; for (let i = 0; i < m; i++) l.push(i * n + j); return l; };
      rim(row(0), (v) => v + n); rim(row(m - 1), (v) => v - n); rim(col(0), (v) => v + 1); rim(col(n - 1), (v) => v - 1);
      return { pos, idx, nOut, ncol: n, src: (v) => { const k = v < nOut ? v : v < 2 * nOut ? v - nOut : rimSrc[v - 2 * nOut]; return [Math.floor(k / n), k % n]; } };
    }

    // ======================= heights and layers =======================
    const NCZ = -0.020;                                     // the middle of her neck (z)
    const D_TH = 0.0058;                                    // the doublet over her body
    const HEM = (x, z) => lerp(0.928, 0.908, sm(-0.06, 0.06, z)) + 0.010 * sm(0.0, 0.12, Math.abs(x)) * sm(-0.02, 0.06, z);
    const BELT_LO = 1.029, BELT_HI = 1.052, beltUp = (z) => 0.008 * sm(0.02, -0.06, z);
    const BOOT_TOP = 0.442;

    // ======================= the doublet =======================
    const neckTop = (x, z) => { const a = Math.abs(Math.atan2(x, z - NCZ)); const t = lerp(1.364, 1.376, sm(0.4, PI, a)); return lerp(t, 1.56, sm(0.062, 0.080, Math.abs(x))); };
    // the split at the front of the hem: a narrow V from the last button down
    const slit = (x, y, z) => z > 0.03 ? 0.013 * sm(0.962, 0.905, y) - 0.002 - Math.abs(x) : -1;
    const dblR = (x, y, z) => Math.max(HEM(x, z) - y, y - neckTop(x, z), slit(x, y, z));
    // over her hips it stands off a little more (the skirt of the doublet), most at its hem
    const dblTh = (x, y, z) => D_TH + 0.0030 * sm(1.0, 0.92, y) + 0.0020 * sm(0.02, 0.08, z) * Math.exp(-Math.pow((y - 1.215) / 0.06, 2));
    const dblG = snugG(dblR, dblTh);
    W.snug('c6Doublet', dblR, dblTh, [-0.21, 0.21, 0.89, 1.42, -0.17, 0.17], 0.0058, { mat: velvetGD });

    // ======================= the stand collar =======================
    let collarG = null;
    {
      const A0 = 0.085, NUC = 64, NRC = 9;
      const yBot = 1.350, yTopC = (a) => lerp(1.402, 1.414, sm(0.4, PI, Math.abs(a))) - 0.006 * sm(0.45, 0.0, Math.abs(a));      // its front corners rounded off
      const Fg = (p) => grad(F, p);
      const onNeck = (a, y, off) => { const d = [Math.sin(a), 0, Math.cos(a)], o = [0, y, NCZ], p = hit(F, add(o, d, 0.2), [-d[0], 0, -d[2]], 0.25) || add(o, d, 0.05); return add(p, Fg(p), off); };
      const G = [];
      for (let i = 0; i <= NRC; i++) { const row = []; const t = i / NRC;
        for (let j = 0; j <= NUC; j++) { const u = j / NUC, a = -(PI - A0) + 2 * (PI - A0) * u, aa = a, y = lerp(yBot, yTopC(aa), t);
          row.push(onNeck(aa, y, lerp(0.0062, 0.0085, t))); }
        G.push(row); }
      const g = thickSheet(G, 0.0030, (i, j) => [0, G[i][j][1], NCZ]); collarG = g;
      const wSkin = (x, y, z) => { const p = [x, y, z], f = F(x, y, z), n = Fg(p); return W.wBody(x - n[0] * f, y - n[1] * f, z - n[2] * f); };
      W.part('c6Collar', g, wSkin, { mat: velvetG });
    }

    // ======================= the sleeves: fitted velvet to her wrists =======================
    const SL_END = 0.452;
    for (const S of ['R', 'L'])
      W.sleeve('c6Sleeve' + S, S, -0.046, SL_END, (sl, a) => (0.0042 + 0.0022 * sm(0.0, 0.10, sl) + 0.0010 * sm(0.30, 0.44, sl)) * (1 - 0.75 * sm(SL_END - 0.006, SL_END, sl)), { mat: velvetG, nu: 32, ns: 60 });

    // ======================= the puffs: velvet strips over gold satin, round the tops of her arms =======================
    const P0 = -0.050, P1 = 0.150, NSTRIP = 8;
    const puffB = (sl) => { const t = cl((sl - P0) / (P1 - P0), 0, 1); return Math.pow(Math.sin(PI * t), 0.75); };
    // how far the puff stands off her arm: most on the outside and the front and back, less toward her body (her armpit)
    // the left puff lies under the cape: less full, so the cape over it stays clear of it as her arm moves
    const puffOff = (sl, a, S) => 0.0058 + 0.026 * (S === 'L' ? 0.6 : 1) * puffB(sl) * (0.62 + 0.38 * Math.cos(a)) * (1 - 0.25 * sm(-0.02, -0.05, sl));
    const puffMax = (sl) => 0.0058 + 0.026 * puffB(sl);
    {
      const NS = 24, NU = 48, satinParts = [], stripParts = [], satW = [], stripW = [];
      const armC = (S, sl) => { const c0 = W.armPt(S, sl, 0), c1 = W.armPt(S, sl, PI); return [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2, (c0[2] + c1[2]) / 2]; };
      const at = (S, sl, a, e) => { const p = W.armPt(S, sl, a), c = armC(S, sl); return add(p, norm(sub(p, c)), e); };
      const slOf = (i) => P0 + (P1 - P0) * (0.5 - 0.5 * Math.cos(PI * i / NS));
      for (const S of ['R', 'L']) {
        // the satin: a tube that bulges out between the strips
        const rings = [], sls = [];
        for (let i = 0; i <= NS; i++) { const sl = slOf(i), ring = [], t = puffB(sl);
          for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, ph = (a * NSTRIP / TAU) % 1, gap = Math.pow(Math.sin(PI * ph), 2);
            ring.push(at(S, sl, a, puffOff(sl, a, S) * (0.80 + 0.17 * gap * t) - 0.0018)); }
          rings.push(ring); sls.push(sl); }
        const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
        const b0 = satW.length; for (let v = 0; v < g.pos.length / 3; v++) { const i = Math.min(NS, Math.floor(v / cols)), j = v % cols; satW.push(W.wArmSL(S, Math.max(sls[i], -0.046), (j / NU) * TAU)); }
        satinParts.push(g); void b0;
        // the strips: NSTRIP bands of velvet, each from the top of the puff to its foot, narrow in the middle where the satin shows
        for (let k = 0; k < NSTRIP; k++) {
          const ac = (k + 0.5) / NSTRIP * TAU + PI / NSTRIP, NK = 7, srings = [], ssl = [];
          for (let i = 0; i <= NS; i++) { const sl = slOf(i), t = puffB(sl), half = (PI / NSTRIP) * lerp(1.04, 0.50, Math.pow(t, 0.7)), ring = [];
            for (let q = 0; q <= NK; q++) { const u = -1 + 2 * q / NK, a = ac + half * u; ring.push(at(S, sl, a, puffOff(sl, a, S) + 0.0016 * (1 - u * u) * t)); }
            srings.push(ring); ssl.push(sl); }
          // a ribbon (open rings), drawn both sides
          const pos = [], idx = [];
          for (const r of srings) for (const p of r) pos.push(p[0], p[1], p[2]);
          for (let i = 0; i < NS; i++) for (let q = 0; q < NK; q++) { const a = i * (NK + 1) + q, b = a + 1, c = a + NK + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
          const sg = faceOut({ pos, idx }, (p) => { const sl = W.armFrame(S, p[0], p[1], p[2]).sl; return armC(S, cl(sl, P0, P1)); });
          stripParts.push(sg);
          for (let i = 0; i <= NS; i++) for (let q = 0; q <= NK; q++) stripW.push(W.wArmSL(S, Math.max(ssl[i], -0.046), ac + (PI / NSTRIP) * (-1 + 2 * q / NK)));
        }
      }
      W.part('c6PuffSatin', merge(satinParts), (x, y, z, i) => satW[i], { mat: satin });
      W.part('c6Puffs', merge(stripParts), (x, y, z, i) => stripW[i], { mat: stripM });
    }

    // ======================= the belt and its buckle =======================
    const beltR = (x, y, z) => Math.max(BELT_LO + beltUp(z) - y, y - BELT_HI - beltUp(z));
    const beltTh = () => D_TH + 0.0048;
    const beltG = snugG(beltR, beltTh);
    W.snug('c6Belt', beltR, beltTh, [-0.21, 0.21, BELT_LO - 0.01, BELT_HI + 0.02, -0.17, 0.16], 0.0044, { mat: beltM });
    {
      const yc = (BELT_LO + BELT_HI) / 2, bc = hit(beltG, [0.000, yc, 0.3], [0, 0, -1]), n = grad(beltG, bc), t = norm(cross([0, 1, 0], n));
      const parts = [frame(add(bc, n, 0.0024), n, t, 0.036, 0.030, 0.0026),
        tube([add(add(bc, n, 0.0012), t, -0.0125), add(add(bc, n, 0.0046), t, -0.002), add(add(bc, n, 0.0040), t, 0.010)], 0.0011, 6)];
      // the belt's tongue, through the buckle and on to a keeper a little to her left
      const tg = []; for (let k = 0; k <= 10; k++) { const x = lerp(0.006, 0.050, k / 10), p = hit(beltG, [x, yc, 0.3], [0, 0, -1]); if (p) tg.push(add(p, grad(beltG, p), 0.0012)); }
      W.part('c6Buckle', merge(parts), (x, y, z) => W.wBody(x, y, z - 0.012), { mat: brass });
      if (tg.length > 3) { const rings = tg.map((p, k) => { const nn = grad(beltG, p), up = [0, 1, 0], ring = [], hw = 0.0088, ht = 0.0010;
        for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) ring.push(add(add(p, up, a * hw), nn, b * ht)); return ring; });
        W.part('c6BeltTongue', orient(W.loft(rings, { capA: true, capB: true }), rings), (x, y, z) => W.wBody(x, y, z - 0.012), { mat: strapM }); }
    }

    // ======================= the buttons: round gold domes down the front =======================
    {
      const BY = [1.312, 1.267, 1.222, 1.177, 1.132, 1.087, 0.987], list = [];
      for (const y of BY) { const p = hit(dblG, [0.003, y, 0.3], [0, 0, -1]); if (!p) continue; const n = grad(dblG, p); list.push(dome(add(p, n, -0.0005), n, 0.0060, 0.0042, 16, 0.0008)); }
      W.part('c6Buttons', merge(list), (x, y, z) => W.wBody(x, y, z - 0.012), { mat: brass });
    }

    // ======================= the breeches: fitted, from under the doublet down into the boots =======================
    const BR_TOP = 1.075;
    const brR = (x, y, z) => Math.max(y - BR_TOP, BOOT_TOP - 0.042 - y);
    const brTh = (x, y, z) => 0.0040 + 0.0012 * sm(0.62, 0.80, y) * sm(1.0, 0.90, y);
    W.snug('c6Breeches', brR, brTh, [-0.22, 0.22, BOOT_TOP - 0.05, BR_TOP + 0.012, -0.17, 0.16], 0.0078, { mat: tan });

    // ======================= the boots: tall brown riding boots to just below her knees =======================
    const LAST = [[-0.074, [-0.012, 0.012, 0.042]], [-0.066, [-0.028, 0.026, 0.058]], [-0.046, [-0.036, 0.034, 0.070]], [-0.020, [-0.038, 0.037, 0.079]], [0.010, [-0.040, 0.038, 0.089]],
      [0.040, [-0.041, 0.043, 0.088]], [0.070, [-0.043, 0.051, 0.072]], [0.100, [-0.046, 0.056, 0.052]], [0.118, [-0.047, 0.056, 0.046]], [0.133, [-0.046, 0.049, 0.042]],
      [0.147, [-0.042, 0.036, 0.038]], [0.160, [-0.032, 0.018, 0.034]], [0.172, [-0.014, -0.002, 0.030]]];
    const S0 = W.SOLE, L2 = [0, 0];
    const lastD = (X, Y, Z) => {
      const v0 = prof(LAST, Z - 0.007), v1 = prof(LAST, Z), v2 = prof(LAST, Z + 0.007), v = [0, 1, 2].map((k) => (v0[k] + 2 * v1[k] + v2[k]) / 4), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.012, ry = Math.max(0.004, v[2] - 0.012);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.016, q = Math.pow(Math.pow(ux, 2.6) + Math.pow(uy, 2.6), 1 / 2.6);
      return Math.max((q - 1) * Math.min(rx, Y > yc ? ry : 0.016), -0.076 - Z, Z - 0.175);
    };
    // the heel: a block under her heel; in front of it the sole lifts off the floor a little (the waist of the sole)
    const archLift = (Z) => 0.0085 * sm(-0.028, -0.020, Z) * sm(0.088, 0.055, Z);
    const EX = (y) => prof([[0.08, 0.016], [0.16, 0.014], [0.26, 0.012], [0.36, 0.012], [0.44, 0.013]], y);
    const EZ = (y) => prof([[0.08, 0.013], [0.16, 0.011], [0.26, 0.010], [0.36, 0.010], [0.44, 0.011]], y);
    const shaft = (s, x, y, z) => {
      const L = W.legAt(cl(y, 0.10, 0.60)), cx = s * L[3], cz = L[4], rx = L[0] + EX(y), rf = L[1] + EZ(y), rb = L[2] + EZ(y);
      const dx = (x - cx) / rx, dz = (z - cz) / (z > cz ? rf : rb), q = Math.pow(Math.pow(Math.abs(dx), 2.4) + Math.pow(Math.abs(dz), 2.4), 1 / 2.4);
      return (q - 1) * Math.min(rx, rf, rb);
    };
    const bootTop = (s, x, z) => BOOT_TOP + 0.004 * sm(0.0, -0.05, z - W.legAt(BOOT_TOP)[4]);
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const leg = (x, y, z) => smin(shaft(s, x, y, z), DOLL.fLegOnly(s, x, y, z) - 0.0060, 0.008);
      const upper = (x, y, z) => {
        if (y > 0.16) { const sh = shaft(s, x, y, z); if (sh > 0.016) return smax(sh, y - bootTop(s, x, z), 0.0030); }
        DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const l = y > 0.040 ? leg(x, y, z) + 0.5 * Math.max(0, 0.11 - y) : 1, top = bootTop(s, x, z) - 0.024 * sm(-0.0035, -0.0095, l);
        return smax(y > 0.16 ? l : smin(l, lastD(X, y, Z), 0.020), y - top, 0.0030); };
      const sole = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const plan = lastD(X, S0 + 0.012, Z) - 0.0030, yb = S0 - LIFT + archLift(Z), yt = S0 + 0.008;
        return smax(plan, Math.max(yb - y, y - yt), 0.0035); };
      const G = (x, y, z) => Math.min(upper(x, y, z), sole(x, y, z));
      const keep = (x, y, z) => !(y > 0.07 && DOLL.fLegOnly(s, x, y, z) < -0.002);
      const bx = s < 0 ? [-0.17, -0.005] : [0.005, 0.17];
      W.surface('c6Boot' + S, G, [bx[0], bx[1], S0 - LIFT - 0.006, BOOT_TOP + 0.010, -0.10, 0.22], 0.0066, (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z), { mat: bootM, keep });
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // =====================================================================================================================
    // the cape. A sheet round her left shoulder from its front edge (under the brooch, straight down her chest) over her shoulder and
    // upper arm to its back edge (from the pin, down beside her spine). At each height y and angle th round the line x = 0, z = ZC
    // (th 0 her front, PI/2 her left, PI her back) it lies at radius rC(th, y): over what it covers (the doublet, and her arm with its
    // puff), hanging (it cannot come in faster than it falls), with soft folds toward its hem.
    // =====================================================================================================================
    const ZC = -0.020, C_CLR = 0.0045, C_TH = 0.0042;
    const armSD = (S, x, y, z) => {
      const f = W.armFrame(S, x, y, z), sl = cl(f.sl, -0.046, 0.456), p = W.armPt(S, sl, f.a), sh = W.restPts['sh' + S], d = W.armDir[S];
      const cx = sh.x + d.x * sl, cy = sh.y + d.y * sl, cz = sh.z + d.z * sl;
      return Math.hypot(x - cx, y - cy, z - cz) - Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz) + Math.max(0, -0.046 - f.sl);
    };
    const armCover = (x, y, z) => { const f = W.armFrame('L', x, y, z), sl = cl(f.sl, -0.046, 0.456); return armSD('L', x, y, z) - (sl < P1 + 0.01 ? puffOff(sl, f.a, 'L') + 0.004 : 0.0075 + 0.0060 * sm(0.17, 0.22, sl)); };      // more room round her elbow, which bulges as it bends
    const bodyCover = (x, y, z) => Fs(x, y, z) - dblTh(x, y, z) - 0.0040 - 0.0050 * sm(BELT_LO - 0.010, BELT_LO, y) * sm(BELT_HI + 0.016, BELT_HI + 0.006, y);
    const CY0 = 1.44, CDY = 0.004, CNY = Math.round((CY0 - 0.86) / CDY) + 1, CNA = 72;
    const ENV = new Float32Array(CNY * CNA);
    const march = (G) => { let r = 0.42, g = G(r), st = 0.002; while (g > 0 && r > 0) { st = Math.max(0.7 * g, 0.0015); r -= st; g = G(r); }
      if (r <= 0) return 0; let lo = r, hi = r + st; for (let k = 0; k < 10; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };
    for (let ai = 0; ai < CNA; ai++) {
      const th = (ai / (CNA - 1)) * PI, sa = Math.sin(th), ca = Math.cos(th);
      for (let yi = 0; yi < CNY; yi++) { const y = CY0 - yi * CDY;
        ENV[yi * CNA + ai] = march((r) => { const x = sa * r, z = ZC + ca * r; return Math.min(bodyCover(x, y, z), armCover(x, y, z)); }); }
      for (let yi = 1; yi < CNY; yi++) ENV[yi * CNA + ai] = Math.max(ENV[yi * CNA + ai], ENV[(yi - 1) * CNA + ai] - 0.16 * CDY);      // it hangs
    }
    const envAt = (th, y) => { const fy = cl((CY0 - y) / CDY, 0, CNY - 1.001), i = Math.floor(fy), u = fy - i, fa = cl(th / PI * (CNA - 1), 0, CNA - 1.001), j = Math.floor(fa), v = fa - j;
      return lerp(lerp(ENV[i * CNA + j], ENV[i * CNA + j + 1], v), lerp(ENV[(i + 1) * CNA + j], ENV[(i + 1) * CNA + j + 1], v), u); };
    // soft folds, deeper toward the hem; the back half stands a little off her back
    const foldA = (y) => 0.013 * sm(1.24, 0.98, y);
    const fold = (th, y) => foldA(y) * Math.pow(0.5 + 0.5 * Math.sin(th * 10.5 + 0.8 + 0.5 * Math.sin(th * 3.1)), 1.4);
    const flareB = (th, y) => 0.030 * sm(1.30, 1.02, y) * sm(1.80, 2.35, th) * (1 - 0.4 * sm(2.6, 3.0, th));
    const flareL = (th, y) => 0.020 * sm(1.24, 1.00, y) * sm(0.9, 1.3, th) * (1 - sm(2.0, 2.4, th));
    const rC = (th, y) => envAt(th, y) + C_CLR + fold(th, y) + flareB(th, y) + flareL(th, y);
    // its front and back edges (x), its top on her shoulder and its hem (y), by angle round her
    const XF = (y) => prof([[1.32, 0.070], [1.22, 0.074], [1.00, 0.079]], y, true);
    const XB = (y) => prof([[1.34, 0.050], [1.24, 0.036], [1.10, 0.026], [0.90, 0.020]], y, true);
    const thF = (y) => { let lo = 0.05, hi = PI / 2; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (rC(m, y) * Math.sin(m) < XF(y)) lo = m; else hi = m; } return (lo + hi) / 2; };
    const thB = (y) => { let lo = PI / 2, hi = PI - 0.01; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (rC(m, y) * Math.sin(m) > XB(y)) lo = m; else hi = m; } return (lo + hi) / 2; };
    const yTopC = (th) => prof([[0.50, 1.302], [0.90, 1.330], [1.25, 1.356], [1.57, 1.364], [2.0, 1.360], [2.4, 1.344], [2.8, 1.334]], th, true);
    const yHemC = (th) => prof([[0.50, 0.990], [0.95, 0.996], [1.35, 1.010], [1.75, 1.014], [2.05, 0.995], [2.35, 0.955], [2.65, 0.918], [2.95, 0.902]], th, true) + 0.004 * Math.sin(th * 13.0);
    const NCC = 64, NRC = 64, CG = [], CTH = [];
    for (let k = 0; k <= NCC; k++) {
      const s = k / NCC, thAt = (y) => lerp(thF(y), thB(y), s);
      const y0 = yTopC(thAt(1.30)), y1 = yHemC(thAt(1.0));
      const pts = [], ths = [];
      for (let y = y0; y > y1; y -= 0.0015) { const th = thAt(y), r = rC(th, y); pts.push([r * Math.sin(th), y, ZC + r * Math.cos(th)]); ths.push(th); }
      { const th = thAt(y1), r = rC(th, y1); pts.push([r * Math.sin(th), y1, ZC + r * Math.cos(th)]); ths.push(th); }
      const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(...sub(pts[i], pts[i - 1])));
      const L = cum[cum.length - 1], col = [], cth = []; let q = 1;
      for (let i = 0; i <= NRC; i++) { const u = L * (i / NRC); while (q < cum.length - 1 && cum[q] < u) q++; const f = cl((u - cum[q - 1]) / Math.max(1e-9, cum[q] - cum[q - 1]), 0, 1);
        col.push([lerp(pts[q - 1][0], pts[q][0], f), lerp(pts[q - 1][1], pts[q][1], f), lerp(pts[q - 1][2], pts[q][2], f)]); cth.push(lerp(ths[q - 1], ths[q], f)); }
      CG.push(col); CTH.push(cth);
    }
    // rows i (top to hem), columns k (front edge to back edge)
    const CGr = []; for (let i = 0; i <= NRC; i++) { const row = []; for (let k = 0; k <= NCC; k++) row.push(CG[k][i]); CGr.push(row); }
    const cape = thickSheet(CGr, C_TH, (i, k) => [0, CGr[i][k][1], ZC]);
    // ----- the weights. Her chest and back (above the hinges), her upper arm (over her arm), the two hinges below -----
    const HINGE = { F: { bone: 'slL0_0', P: [0.0, 1.292, 0.082], d: [0, -1, 0], o: [0, 0, 1] }, B: { bone: 'slL0_1', P: [0.0, 1.270, -0.098], d: [0, -1, 0], o: [0, 0, -1] } };
    for (const [key, h] of Object.entries(HINGE)) { if (BI[h.bone] == null) throw new Error('C6: no bone ' + h.bone); h.ax = cross(h.d, h.o); h.key = key; }
    const capeW = [], capeSw = [];
    for (let i = 0; i <= NRC; i++) for (let k = 0; k <= NCC; k++) {
      const p = CGr[i][k], th = CTH[k][i], y = p[1], r = Math.hypot(p[0], p[2] - ZC), re = Math.max(0.02, r - 0.016);
      const q = [re * Math.sin(th), y, ZC + re * Math.cos(th)];
      let w = W.wBody(q[0], q[1], q[2]);
      const f = W.armFrame('L', p[0], p[1], p[2]), dA = armCover(p[0], p[1], p[2]);
      const lat = sm(0.86, 1.32, th) * (1 - sm(1.95, 2.25, th));
      const sF = (1 - lat) * (th < PI / 2 ? 1 : 0) * sm(HINGE.F.P[1] + 0.006, HINGE.F.P[1] - 0.050, y);
      const sB = (1 - lat) * (th >= PI / 2 ? 1 : 0) * sm(HINGE.B.P[1] + 0.005, HINGE.B.P[1] - 0.070, y);
      const arm = Math.max(lat * sm(-0.060, 0.030, f.sl), sm(0.034, 0.012, dA) * sm(-0.078, -0.025, f.sl)) * (1 - Math.max(sF, sB));
      if (sF > 0.001) w = W.mixW(w, [BI[HINGE.F.bone], 1], sF);
      if (sB > 0.001) w = W.mixW(w, [BI[HINGE.B.bone], 1], sB);
      if (arm > 0.001) w = W.mixW(w, W.wArmSL('L', cl(f.sl, -0.046, 0.40), f.a), arm);      // as her sleeve is carried: past her elbow, her forearm
      capeW.push(w); capeSw.push([sF, sB, arm]);
    }
    const NCOL = NCC + 1;
    W.part('c6Cape', cape, (x, y, z, v) => { const [i, k] = cape.src(v); return capeW[i * NCOL + k]; }, { mat: capeM, occluder: false });
    // ----- the brooch, the pin at the back, the strap from the brooch toward her collar -----
    {
      const pF = CGr[1][0], pB = CGr[1][NCC];
      const nF = norm([0.15, 0.25, 1]), nB = norm([0.1, 0.3, -1]);
      const cF = add(add(pF, nF, 0.0030), [1, 0, 0], 0.004);
      const brooch = [dome(cF, nF, 0.0150, 0.0050, 32, 0.0018), tube((() => { const [u, v] = perp(nF), l = []; for (let j = 0; j < 32; j++) { const a = (j / 32) * TAU; l.push(add(add(add(cF, nF, 0.0020), u, 0.0150 * Math.cos(a)), v, 0.0150 * Math.sin(a))); } return l; })(), 0.0016, 6, true)];
      W.part('c6Brooch', merge(brooch), (x, y, z) => W.wBody(cF[0], cF[1], cF[2] - 0.02), { mat: brass });
      const cB = add(pB, nB, 0.0030);
      W.part('c6CapePin', merge([dome(cB, nB, 0.0050, 0.0035, 16, 0.0010)]), (x, y, z) => W.wBody(cB[0], cB[1], cB[2] + 0.02), { mat: brass });
      // the strap: a flat leather band lying on the doublet from under the brooch toward the top button
      const pts = []; for (let k = 0; k <= 12; k++) { const t = k / 12, x = lerp(cF[0] - 0.004, 0.022, t), y = lerp(cF[1] - 0.003, 1.290, t), p = hit(dblG, [x, y, 0.3], [0, 0, -1]); if (p) pts.push({ p, n: grad(dblG, p) }); }
      if (pts.length > 3) { const rings = pts.map((q, k) => { const a = pts[Math.max(0, k - 1)].p, b = pts[Math.min(pts.length - 1, k + 1)].p, t = norm(sub(b, a)), wv = norm(cross(q.n, t)), c = add(q.p, q.n, 0.0016), ring = [];
          for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) ring.push(add(add(c, wv, u * 0.0052), q.n, v * 0.0011)); return ring; });
        W.part('c6CapeStrap', orient(W.loft(rings, { capA: true, capB: true }), rings), (x, y, z) => W.wBody(x, y, z - 0.015), { mat: strapM }); }
    }
    // ----- the hinges every frame: each half of the cape swings about its hinge (carried by her chest), hangs toward the ground when
    // she leans, lags as she moves, never goes in through her, and is pushed out by her arm, thigh and hips -----
    {
      const skel = (Object.values(W.meshes).find((m) => m && m.isSkinnedMesh && m.skeleton) || {}).skeleton;
      const T3 = THREE, M4 = () => new T3.Matrix4(), vA = new T3.Vector3(), mB = M4(), mC = M4(), mA = M4(), scl = new T3.Vector3();
      const binv = (name) => skel.boneInverses[BI[name]];
      const boneM = (SK, name, out) => out.multiplyMatrices(SK[name].matrixWorld, binv(name));
      const apply = (m, p) => { vA.set(p[0], p[1], p[2]).applyMatrix4(m); return [vA.x, vA.y, vA.z]; };
      const applyD = (m, p) => { vA.set(p[0], p[1], p[2]).transformDirection(m); return [vA.x, vA.y, vA.z]; };
      const setBone = (SK, name, D) => { const b = SK[name]; mB.copy(binv(name)).invert(); mC.multiplyMatrices(D, mB); mA.copy(b.parent.matrixWorld).invert().multiply(mC);
        mA.decompose(b.position, b.quaternion, scl); b.scale.set(1, 1, 1); b.updateMatrixWorld(true); };
      // points of each half's inside (rest, seen from its hinge: x along it, distance rho and angle al out from straight down), with how much the hinge carries them
      for (const [key, h] of Object.entries(HINGE)) {
        const wi = key === 'F' ? 0 : 1; h.pts = [];
        for (let v = 0; v < cape.nOut; v++) { const [i, k] = cape.src(v); if (i % 2 || k % 2) continue; const w = capeSw[i * NCOL + k][wi]; if (w < 0.45) continue;
          const p = [cape.pos[(cape.nOut + v) * 3], cape.pos[(cape.nOut + v) * 3 + 1], cape.pos[(cape.nOut + v) * 3 + 2]], rel = sub(p, h.P), u = dot(rel, h.d), o = dot(rel, h.o);
          if (Math.hypot(u, o) > 0.035) h.pts.push({ x: dot(rel, h.ax), rho: Math.hypot(u, o), al: Math.atan2(o, u), w }); }
        h.phi = 0; h.vel = 0; h.hist = [];
      }
      // what pushes: spheres on her bones (rest centre, radius)
      const PUSH = [];
      for (let sl = 0.04; sl <= 0.44; sl += 0.04) { const c = W.armPt('L', sl, 0), c2 = W.armPt('L', sl, PI), ctr = [(c[0] + c2[0]) / 2, (c[1] + c2[1]) / 2, (c[2] + c2[2]) / 2];
        const r = Math.max(Math.hypot(...sub(W.armPt('L', sl, PI / 2), ctr)), Math.hypot(...sub(W.armPt('L', sl, -PI / 2), ctr)));      // front to back (the cloth's halves lie in front of and behind her arm)
        PUSH.push({ bone: sl < W.L_UARM ? 'uarmL' : 'farmL', c: ctr, r: r + (sl < P1 ? 0.0058 + 0.6 * 0.016 * puffB(sl) : 0.0055) }); }
      PUSH.push({ bone: 'handL', c: [W.restPts.wrL.x + W.armDir.L.x * 0.07, W.restPts.wrL.y + W.armDir.L.y * 0.07, W.restPts.wrL.z + 0.01], r: 0.040 });
      for (const y of [0.90, 0.82, 0.74]) { const L = W.legAt(y); PUSH.push({ bone: 'thighL', c: [L[3], y, L[4]], r: L[0] + 0.012 }); }
      PUSH.push({ bone: 'spine1', c: [0.07, 1.00, -0.005], r: 0.092 }, { bone: 'hips', c: [0.08, 0.93, -0.02], r: 0.100 });
      // her left shoulder blade (it moves out as she reaches forward)
      for (const [x, y] of [[0.075, 1.27], [0.110, 1.25], [0.110, 1.19], [0.075, 1.21]]) { const tt = W.trunkAt(y); let z = (tt[1] + tt[2]) / 2; if (F(x, y, z) > -0.01) continue; for (let k = 0; k < 150; k++) { if (F(x, y, z) > 0) break; z -= 0.001; }
        PUSH.push({ bone: 'clavL', c: [x, y, z + 0.0005 + 0.05], r: 0.05 + D_TH + 0.0015, only: 'B' }); }
      // her back and her front, from under her shoulder blades to her hips: spheres just inside the doublet (and the belt)
      for (const y of [1.14, 1.08, 1.02, 0.96]) for (const x of [0.035, 0.085, 0.130]) {      // (not on her chest: that carries the hinges, so it never moves against them)
        const t = W.trunkAt(y), bone = y > 1.07 ? 'spine2' : y > 0.99 ? 'spine1' : 'hips', R = 0.06, belt = y > 1.0 && y < 1.08 ? 0.005 : 0;
        const fb = (zz, dir) => { let z = zz; for (let k = 0; k < 120; k++) { if (F(x, y, z) > 0) break; z += dir * 0.001; } return z - dir * 0.0005; };
        if (Math.abs(x) > t[0] - 0.03) continue;
        const zb = fb(t[2] + 0.04, -1), zf = fb(t[1] - 0.04, 1);
        PUSH.push({ bone, c: [x, y, zb + R], r: R + D_TH + 0.0015 + belt, only: 'B' }, { bone, c: [x, y, zf - R], r: R + D_TH + 0.0015 + belt, only: 'F' });
      }
      // how far the hinge must turn out so that no point of the cloth is inside a sphere: in the plane of each point (square to the
      // hinge) a sphere is a disc; the point goes round the hinge on a circle, and must be past the disc's far side. A sphere whose middle
      // lies outside the cloth at rest (further from her than the cloth) is left alone: turning out would not help.
      const needOf = (h, Minv, SKm, only) => {
        let need = -9; const sp = [];
        for (const ps of (only || PUSH)) { if (ps.only && ps.only !== h.key) continue; const q = apply(Minv, apply(SKm[ps.bone], ps.c)), rel = sub(q, h.P), u = dot(rel, h.d), o = dot(rel, h.o);
          sp.push({ x: dot(rel, h.ax), rc: Math.hypot(u, o), ac: Math.atan2(o, u), r: ps.r + 0.002 }); }
        for (const c of h.pts) for (const s of sp) {
          const dx = c.x - s.x; if (Math.abs(dx) >= s.r) continue; const r2 = s.r * s.r - dx * dx, rr = Math.sqrt(r2);
          if (Math.abs(c.rho - s.rc) >= rr || s.rc < 1e-4) continue;
          if (s.ac > c.al + 0.02) continue;
          const cb = (c.rho * c.rho + s.rc * s.rc - r2) / (2 * c.rho * s.rc), be = Math.acos(cl(cb, -1, 1));
          need = Math.max(need, (s.ac + be - c.al) / c.w); }
        return Math.min(need, 1.3);
      };
      { const I = M4(), SKi = {}; for (const ps of PUSH) SKi[ps.bone] = I; for (const [key, h] of Object.entries(HINGE)) { h.base = Math.max(0, needOf(h, I, SKi)); let wi = -1, wv = -9; PUSH.forEach((ps, i) => { const v = needOf(h, I, SKi, [ps]); if (v > wv) { wv = v; wi = i; } });
          LOG.push('rest need ' + key + ' ' + h.base.toFixed(3) + ' worst ' + (wi >= 0 ? PUSH[wi].bone + ' ' + PUSH[wi].c.map((v) => v.toFixed(3)).join(',') : '')); } }
      const K = 55, C = 7.5, LEN = 0.14, DT = 1 / 60, qq = new T3.Quaternion(), Rm = M4(), Tm = M4(), Tm2 = M4(), Dm = M4();
      const SKm = {}, Mp = M4(), MpI = M4();
      W.onFrame((SK, API) => {
        const root = SK.hips.parent; root.updateMatrixWorld(true);
        for (const ps of PUSH) if (!SKm[ps.bone]) SKm[ps.bone] = M4();
        for (const b in SKm) boneM(SK, b, SKm[b]);
        boneM(SK, 'spine3', Mp); MpI.copy(Mp).invert();
        const still = !API || API.move === 'pose';
        for (const h of Object.values(HINGE)) {
          const Pw = apply(Mp, h.P), dw = applyD(Mp, h.d), ow = applyD(Mp, h.o);
          const gW = [0, -1, 0];
          const phiG = Math.atan2(dot(gW, ow), dot(gW, dw)), target = Math.max(0, 0.85 * phiG), need = needOf(h, MpI, SKm) - h.base;      // what touches already at rest is not a push
          h.hist.push(Pw); if (h.hist.length > 3) h.hist.shift();
          const jump = h.hist.length > 1 ? Math.hypot(...sub(h.hist[h.hist.length - 1], h.hist[h.hist.length - 2])) : 9;
          if (still || jump > 0.08 || h.hist.length < 3) { h.phi = Math.max(target, need, 0); h.vel = 0; if (jump > 0.08) h.hist = [Pw]; }
          else {
            const [a0, a1, a2] = h.hist, acc = [(a2[0] - 2 * a1[0] + a0[0]) / (DT * DT), (a2[1] - 2 * a1[1] + a0[1]) / (DT * DT), (a2[2] - 2 * a1[2] + a0[2]) / (DT * DT)];
            const aL = Math.hypot(...acc), ac = aL > 25 ? 25 / aL : 1;
            const f = K * (target - h.phi) - C * h.vel - dot(acc, ow) * ac / LEN;
            h.vel += f * DT; h.phi += h.vel * DT;
            if (h.phi < need) { h.phi = need; if (h.vel < 0) h.vel = 0; }
            if (h.phi < 0) { h.phi = 0; if (h.vel < 0) h.vel = 0; }
            if (h.phi > 1.3) { h.phi = 1.3; if (h.vel > 0) h.vel = 0; }
          }
          // D: rest point -> world: carried by her chest, turned by phi about the hinge
          qq.setFromAxisAngle(vA.set(h.ax[0], h.ax[1], h.ax[2]), h.phi); Rm.makeRotationFromQuaternion(qq);
          Tm.makeTranslation(h.P[0], h.P[1], h.P[2]); Tm2.makeTranslation(-h.P[0], -h.P[1], -h.P[2]);
          Dm.copy(Mp).multiply(Tm).multiply(Rm).multiply(Tm2);
          setBone(SK, h.bone, Dm); (window.__c6phi = window.__c6phi || {})[h.bone] = [h.phi.toFixed(3), need.toFixed(3), target.toFixed(3)];
        }
      });
    }

    // ======================= the beret: burgundy velvet, tilted on the bun =======================
    const HEAD = W.wBone('head');
    {
      // the hair's outer surface, measured on the bun's meshes: the farthest hair in each direction from the middle of her head
      const HC = [W.hair.HCX.x, W.hair.HCX.y, W.hair.HCX.z], NA = 72, NP = 40, RT = new Float32Array(NA * NP);
      for (const m of W.hairParts()) { if (!/hbCap|hbLock|hbBun|hbEdge/.test(m.name)) continue; const P = m.geometry.attributes.position.array;
        for (let i = 0; i < P.length; i += 3) { const dx = P[i] - HC[0], dy = P[i + 1] - HC[1], dz = P[i + 2] - HC[2], r = Math.hypot(dx, dy, dz); if (r < 1e-4) continue;
          const az = Math.atan2(dx, dz), po = Math.acos(cl(dy / r, -1, 1)), ia = ((Math.floor((az + PI) / TAU * NA) % NA) + NA) % NA, ip = Math.min(NP - 1, Math.floor(po / PI * NP));
          if (r > RT[ip * NA + ia]) RT[ip * NA + ia] = r; } }
      if (!RT.some((v) => v > 0)) { const b = W.hair.SKR; for (let ip = 0; ip < NP; ip++) for (let ia = 0; ia < NA; ia++) RT[ip * NA + ia] = b((ia + 0.5) / NA * TAU - PI, (ip + 0.5) / NP * PI) + 0.012; }
      for (let pass = 0; pass < 40; pass++) { let left = 0; const c = RT.slice();
        for (let ip = 0; ip < NP; ip++) for (let ia = 0; ia < NA; ia++) { if (c[ip * NA + ia] > 0) continue; let s = 0, n = 0;
          for (const [a, b] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const jp = ip + a, ja = (ia + b + NA) % NA; if (jp < 0 || jp >= NP) continue; const v = c[jp * NA + ja]; if (v > 0) { s += v; n++; } }
          if (n) RT[ip * NA + ia] = s / n; else left++; }
        if (!left) break; }
      { const c = RT.slice(); for (let ip = 0; ip < NP; ip++) for (let ia = 0; ia < NA; ia++) { let m = 0;            // fuller: the largest of each bin's neighbours (locks stand proud of the cap)
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const jp = cl(ip + a, 0, NP - 1), ja = (ia + b + NA) % NA; m = Math.max(m, c[jp * NA + ja]); } RT[ip * NA + ia] = m; } }
      for (let pass = 0; pass < 2; pass++) { const c = RT.slice(); for (let ip = 0; ip < NP; ip++) for (let ia = 0; ia < NA; ia++) { let s = 0, n = 0;
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const jp = cl(ip + a, 0, NP - 1), ja = (ia + b + NA) % NA; s += c[jp * NA + ja]; n++; } RT[ip * NA + ia] = Math.max(c[ip * NA + ia] - 0.002, s / n); } }
      const hairR = (dx, dy, dz, r) => { const az = Math.atan2(dx, dz), po = Math.acos(cl(dy / r, -1, 1)), fa = (az + PI) / TAU * NA - 0.5, fp = cl(po / PI * NP - 0.5, 0, NP - 1.001);
        const ia = Math.floor(fa), u = fa - ia, ip = Math.floor(fp), v = fp - ip, a0 = (ia % NA + NA) % NA, a1 = (a0 + 1) % NA;
        return lerp(lerp(RT[ip * NA + a0], RT[ip * NA + a1], u), lerp(RT[(ip + 1) * NA + a0], RT[(ip + 1) * NA + a1], u), v); };
      const hairSD = (x, y, z) => { const dx = x - HC[0], dy = y - HC[1], dz = z - HC[2], r = Math.hypot(dx, dy, dz) || 1e-6; return r - hairR(dx, dy, dz, r); };
      // its band lies on her hair in a plane nearly level (the bun is high on the back of her head and the crown must cover it), a little
      // lower on her right; the band's back rests on the bun, the bun's lower part showing under it, as in the paintings
      const nB = norm([-0.36, 1, -0.08]), CB = [0, 1.576, -0.020], e1 = norm(cross([0, 0, 1], nB)), e2 = cross(nB, e1);   // e1 toward her left, e2 toward her front
      const loc = (x, y, z) => { const d = [x - CB[0], y - CB[1], z - CB[2]]; return [dot(d, e1), dot(d, e2), dot(d, nB)]; };
      // the crown: a soft, full cushion above the band, its middle a little to her left and back, its edge drooping on her right and in front
      const CR = { a: 0.014, b: -0.026, R1: 0.132, R2: 0.136, ht: 0.064, hb: 0.034, c0: 0.050 };
      const crown = (x, y, z) => { const [a, b, c] = loc(x, y, z), da = (a - CR.a) / CR.R1, db = (b - CR.b) / CR.R2, rho = Math.pow(Math.pow(Math.abs(da), 2.2) + Math.pow(Math.abs(db), 2.2), 1 / 2.2);
        const ang = Math.atan2(db, da), wav = 0.006 * Math.sin(ang * 5 + 0.7) * sm(0.5, 1.0, rho);
        const droop = (0.052 * sm(0.0, -0.9, da) + 0.014 * sm(0.0, 0.9, db)) * sm(0.35, 1.0, rho), cc = c - CR.c0 + droop + wav;
        const f = Math.max(0, 1 - rho * rho), top = CR.ht * Math.pow(f, 0.62) * (1 + 0.10 * sm(0.0, -0.8, da)), bot = CR.hb * Math.pow(f, 0.55);
        return Math.max(cc - top, -cc - bot, (rho - 1) * 0.10); };
      const band = (x, y, z) => { const [, , c] = loc(x, y, z); return Math.max(hairSD(x, y, z) - 0.0120, -c, c - 0.050); };
      const G = (x, y, z) => smax(smin(crown(x, y, z), band(x, y, z), 0.014), -(hairSD(x, y, z) - 0.0012), 0.002);
      const box = [-0.18, 0.18, 1.48, 1.77, -0.22, 0.17];
      W.surface('c6Beret', G, box, 0.0054, () => HEAD, { mat: beretM });
      // checking: how much of the bun is left outside the beret
      { let out = 0, tot = 0; for (const m of W.hairParts()) { if (m.name !== 'hbBun') continue; const P = m.geometry.attributes.position.array; for (let i = 0; i < P.length; i += 30) { tot++; if (G(P[i], P[i + 1], P[i + 2]) > -0.001 && crown(P[i], P[i + 1], P[i + 2]) > 0) out++; } }
        LOG.push('bun outside beret ' + out + '/' + tot); }
      // ======================= the plume: a long white ostrich feather sweeping back over her right side =======================
      // it rises from the top of the crown, a little right of and behind its middle, arcs out over the crown to her right and back, and droops
      const base = hit(G, [-0.020, 1.85, -0.030], [0, -1, 0], 0.4) || [-0.02, 1.70, -0.03];
      const B0 = add(base, [0.002, -0.012, 0.004], 1), B1 = add(base, [-0.040, 0.055, -0.035], 1), B2 = add(base, [-0.190, 0.048, -0.150], 1), B3 = add(base, [-0.240, -0.165, -0.225], 1);
      const bez = (t) => { const s = 1 - t; return [0, 1, 2].map((k) => s * s * s * B0[k] + 3 * s * s * t * B1[k] + 3 * s * t * t * B2[k] + t * t * t * B3[k]); };
      const Np = norm(cross(sub(B3, B0), sub(B1, B0)));
      const NT = 48, NK = 10, pos = [], uv = [], idx = [];
      for (let i = 0; i <= NT; i++) { const t = i / NT, c = bez(t), T = norm(sub(bez(Math.min(1, t + 0.01)), bez(Math.max(0, t - 0.01)))), Wd = norm(cross(Np, T));
        const hw = 0.030 * Math.pow(Math.sin(PI * Math.min(1, Math.pow(t, 0.85) * 1.0)), 0.55) * sm(0.0, 0.10, t) + 0.0015;
        for (let q = 0; q <= NK; q++) { const k = -1 + 2 * q / NK, p = add(add(add(c, Wd, hw * k), [0, -1, 0], 0.010 * k * k * sm(0.05, 0.3, t)), Np, 0.004 * (1 - k * k)); pos.push(p[0], p[1], p[2]); uv.push(q / NK, t); } }
      for (let i = 0; i < NT; i++) for (let q = 0; q < NK; q++) { const a = i * (NK + 1) + q, b = a + 1, c = a + NK + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
      const TX = window.__c6FeatherTex || (window.__c6FeatherTex = (() => {
        const cv = document.createElement('canvas'); cv.width = 256; cv.height = 1024; const g = cv.getContext('2d');
        let sd = 4242; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        g.clearRect(0, 0, 256, 1024); g.lineCap = 'round';
        for (let n = 0; n < 2600; n++) {           // the barbs: from the shaft out toward the edge, curving toward the tip, wispy at their ends
          const v0 = rnd() * 1024, side = rnd() < 0.5 ? -1 : 1, len = 105 + 25 * rnd(), cols = ['#f4efe6', '#ebe3d6', '#ddd2c2', '#fbf8f2', '#d4c8b6'];
          g.strokeStyle = cols[Math.floor(rnd() * cols.length)]; g.globalAlpha = 0.35 + 0.5 * rnd(); g.lineWidth = 0.8 + 1.6 * rnd();
          g.beginPath(); g.moveTo(128, v0); const bend = 40 + 50 * rnd(), wob = (rnd() - 0.5) * 20;
          g.bezierCurveTo(128 + side * len * 0.35, v0 + bend * 0.25, 128 + side * len * 0.75, v0 + bend * 0.7 + wob, 128 + side * len, v0 + bend + wob); g.stroke(); }
        g.globalAlpha = 1; g.strokeStyle = '#efe7da'; g.lineWidth = 5; g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 1024); g.stroke();
        const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; })());
      const featherM = W.std({ color: W.lin('#ece4d8'), map: TX, alphaTest: 0.30, transparent: false, side: THREE.DoubleSide, roughness: 0.85, emissive: W.lin('#3a362f'), emissiveIntensity: 0.6, envMapIntensity: 0.2 });
      { let inside = 0; for (let i = 0; i < pos.length; i += 3) if (G(pos[i], pos[i + 1], pos[i + 2]) < 0) inside++; LOG.push('feather base ' + base.map((v) => v.toFixed(3)).join(',') + ' points inside beret ' + inside + '/' + pos.length / 3); }
      W.part('c6Feather', { pos, idx, uv }, () => HEAD, { mat: featherM, occluder: false });      // its picture is kept for the next wearing (disposing a material leaves its map)
    }

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'dollFoot', 'toenail']);
    W.hideSkin((x, y, z) => (y < neckTop(x, z) - 0.012 && !(z > 0.02 && Math.abs(x) < 0.016 && y > 1.33)) || (y < 1.392 && !(z > 0.02 && Math.abs(x) < 0.016)), ['dollTrunk']);
    W.hideSkin(() => true, ['dollLeg']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl < SL_END - 0.016; }, ['arm']);

    // ======================= reading the paintings =======================
    const DEG = PI / 180;
    function LEGX(y) { return prof([[0.05, 0.018], [0.20, 0.016], [0.40, 0.008], [0.53, 0.0]], y, true); }
    function LEGZ(y) { return prof([[0.05, -0.024], [0.21, -0.024], [0.53, -0.018], [0.80, -0.008], [0.95, 0.0]], y, true); }
    W.afterPaint((parts) => {
      const byKey = {}; for (const p of parts) byKey[p.key] = p.mesh;
      // ----- the cape: where it lies in the paintings' pose (her arm 15 degrees further out carries the part over it), and what sees it -----
      const capeG = byKey.c6Cape.geometry, CP = capeG.attributes.position.array, CN = capeG.attributes.normal.array, nV = CP.length / 3;
      const sh = W.restPts.shL, an = 15 * DEG, ca = Math.cos(an), sa = Math.sin(an);
      const turn = (p) => { const x = p[0] - sh.x, y = p[1] - sh.y; return [sh.x + x * ca - y * sa, sh.y + x * sa + y * ca, p[2]]; };
      const turnV = (v) => [v[0] * ca - v[1] * sa, v[0] * sa + v[1] * ca, v[2]];
      const out = new Float32Array(nV * 3), on = new Float32Array(nV * 3);
      for (let v = 0; v < nV; v++) { const [i, k] = cape.src(v), wa = capeSw[i * NCOL + k][2], p = [CP[v * 3], CP[v * 3 + 1], CP[v * 3 + 2]], n = [CN[v * 3], CN[v * 3 + 1], CN[v * 3 + 2]];
        const q = turn(p), qn = turnV(n); out.set([lerp(p[0], q[0], wa), lerp(p[1], q[1], wa), lerp(p[2], q[2], wa)], v * 3); on.set(norm([lerp(n[0], qn[0], wa), lerp(n[1], qn[1], wa), lerp(n[2], qn[2], wa)]), v * 3); }
      const Cs = 0.006, keyOf = (a, b) => (Math.floor(a / Cs) + 600) * 2000 + Math.floor(b / Cs) + 600;
      const mk = () => ({ maxZ: new Map(), minZ: new Map(), minX: new Map(), maxX: new Map() });
      const up = (M, k, v, f) => { const q = M.get(k); if (q === undefined || f(v, q)) M.set(k, v); };
      const addPts = (D, p) => { for (let i = 0; i < p.length; i += 3) { const x = p[i], y = p[i + 1], z = p[i + 2];
        up(D.maxZ, keyOf(x, y), z, (a, b) => a > b); up(D.minZ, keyOf(x, y), z, (a, b) => a < b); up(D.minX, keyOf(z, y), x, (a, b) => a < b); up(D.maxX, keyOf(z, y), x, (a, b) => a > b); } };
      const near = (M, a, b, f, d) => { let v = d; const ia = Math.floor(a / Cs) + 600, ib = Math.floor(b / Cs) + 600;
        for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) { const q = M.get((ia + da) * 2000 + ib + db); if (q !== undefined) v = f(v, q); } return v; };
      const ex = (d) => 1 - sm(0.004, 0.012, d);
      const vis = (D, x, y, z, nx) => [ex(near(D.maxZ, x, y, Math.max, z) - z), ex(z - near(D.minZ, x, y, Math.min, z)), nx < 0 ? ex(x - near(D.minX, z, y, Math.min, x)) : ex(near(D.maxX, z, y, Math.max, x) - x)];
      const Dall = mk(), Dc = mk();
      addPts(Dall, out); addPts(Dc, out);
      for (const p of parts) { if (p.key === 'c6Cape' || p.key === 'c6Feather') continue; const A = p.mesh.geometry.attributes.aPP; if (A) addPts(Dall, A.array); }
      { const E = new Float32Array(nV * 3);
        for (let v = 0; v < nV; v++) { const [ii, kk] = cape.src(v), o = ii * NCOL + kk;          // inside and rims read where the outside does (lowered a little at the top edge, where the paintings' cape lies lower)
          if (v >= cape.nOut) { out.set(out.slice(o * 3, o * 3 + 3), v * 3); on.set(on.slice(o * 3, o * 3 + 3), v * 3); }
          out[v * 3 + 1] -= 0.016 * (1 - sm(0, 7, ii)); }
        for (let v = 0; v < nV; v++) { const e = vis(Dall, out[v * 3], out[v * 3 + 1], out[v * 3 + 2], on[v * 3]);
          // the side painting shows her right side: the cape only where it stands out behind her back
          e[2] *= sm(-0.105, -0.125, out[v * 3 + 2]);
          E.set(e, v * 3); }
        capeG.setAttribute('aPP', new THREE.Float32BufferAttribute(out, 3)); capeG.setAttribute('aPN', new THREE.Float32BufferAttribute(on, 3)); capeG.setAttribute('aPE', new THREE.Float32BufferAttribute(E, 3)); }
      // everything the cape hides in a painting does not read that painting
      for (const p of parts) { if (p.key === 'c6Cape') continue; const g = p.mesh.geometry; if (!g.attributes.aPE) continue;
        const P = g.attributes.aPP.array, N = g.attributes.aPN.array, E = g.attributes.aPE.array;
        for (let i = 0; i < P.length / 3; i++) { const v = vis(Dc, P[i * 3], P[i * 3 + 1], P[i * 3 + 2], N[i * 3]); E[i * 3] *= v[0]; E[i * 3 + 1] *= v[1]; E[i * 3 + 2] *= v[2]; }
        g.attributes.aPE.needsUpdate = true; }
      // ----- what the cape covers in the paintings (her left chest, shoulder, arm and back) reads the same place on her right -----
      const mirror = (key, test) => { const m = byKey[key]; if (!m) return; const g = m.geometry, A = g.attributes.aPP, N = g.attributes.aPN, E = g.attributes.aPE, P = g.attributes.position.array;
        for (let i = 0; i < A.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]; const t = test(x, y, z); if (!t) continue;
          A.array[i * 3] = -A.array[i * 3]; N.array[i * 3] = -N.array[i * 3];
          if (t & 1) E.array[i * 3] = 1; if (t & 2) E.array[i * 3 + 1] = 1; }
        A.needsUpdate = true; N.needsUpdate = true; E.needsUpdate = true; };
      const underCape = (x, y, z) => z > 0 ? (x > 0.012 && y > 0.97 && (x > 0.064 || (y > 1.272 && y < 1.336)) ? 1 : 0) : (x > 0.002 && y > 0.885 ? 2 : 0);
      mirror('c6Doublet', underCape); mirror('c6Belt', underCape); mirror('c6Breeches', (x, y, z) => z < 0 && x > 0.002 && y > 0.86 ? 2 : 0); mirror('c6Collar', (x, y, z) => x > 0.002 && z < 0 ? 2 : 0);
      // her left sleeve reads her right sleeve's paintings (it was made point for point the same, mirrored)
      { const R = byKey.c6SleeveR.geometry, L = byKey.c6SleeveL.geometry;
        for (const k of ['aPP', 'aPN', 'aPE']) { const a = R.attributes[k].array, b = new Float32Array(a); if (k !== 'aPE') for (let i = 0; i < b.length; i += 3) b[i] = -b[i]; L.setAttribute(k, new THREE.Float32BufferAttribute(b, 3)); } }
      for (const pr of parts) {
        const g = pr.mesh.geometry, A = g.attributes.aPP; if (!A) continue;
        const P = g.attributes.position.array, E = g.attributes.aPE;
        if (/^c6(Boot[RL]|Breeches)$/.test(pr.key)) {
          for (let i = 0; i < A.count; i++) { const y = P[i * 3 + 1], k = sm(0.86, 0.74, y), x = A.array[i * 3];
            A.array[i * 3] += Math.sign(x) * LEGX(y) * k; A.array[i * 3 + 2] += LEGZ(y); }
          A.needsUpdate = true; }
        // the side painting has her right arm and hand hanging down her side (puff, sleeve, hand against her thigh: the shared cleaning
        // takes out her hand where the model's hand is in the paint pose, not where the painting has it): her sides read that painting just
        // in front of or behind the painted arm instead, where it shows the doublet and the breeches
        if (/^c6(Doublet|Belt|Breeches)$/.test(pr.key)) {
          const ARMZ = [[0.64, [0.044, 0.048]], [0.70, [0.040, 0.054]], [0.78, [0.032, 0.056]], [0.86, [0.012, 0.044]], [0.96, [-0.012, 0.032]], [1.08, [-0.022, 0.032]], [1.17, [-0.030, 0.040]], [1.25, [-0.040, 0.064]], [1.33, [-0.040, 0.060]]];
          for (let i = 0; i < A.count; i++) { const y = A.array[i * 3 + 1]; if (y < 0.62 || y > 1.36 || E.array[i * 3 + 2] < 0.05) continue;
            const [zc, hw] = prof(ARMZ, y, true), z = A.array[i * 3 + 2], d = z - zc, need = hw + 0.012 - Math.abs(d);
            if (need > 0) A.array[i * 3 + 2] += (d < 0 ? -1 : 1) * need; }
          A.needsUpdate = true; }
        // the belt's rounded edges read the belt, not the doublet above and below it
        if (pr.key === 'c6Belt') { for (let i = 0; i < A.count; i++) { const y = P[i * 3 + 1] - beltUp(P[i * 3 + 2]); A.array[i * 3 + 1] += 0.004 * sm(BELT_LO + 0.005, BELT_LO, y) - 0.004 * sm(BELT_HI - 0.005, BELT_HI, y); } A.needsUpdate = true; }
        // the hem's edge reads the doublet just above it; the collar's top edge the collar just below it
        if (pr.key === 'c6Doublet') { for (let i = 0; i < A.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]; A.array[i * 3 + 1] += 0.005 * sm(HEM(x, z) + 0.008, HEM(x, z), y); } A.needsUpdate = true; }
        if (pr.key === 'c6Collar' && collarG) {          // its inside and top edge read where its outside does (not her neck through the opening)
          const Nn = g.attributes.aPN.array, ncol = collarG.ncol;
          for (let v = collarG.nOut; v < A.count; v++) { const [i, j] = collarG.src(v), o = i * ncol + j; for (let c = 0; c < 3; c++) { A.array[v * 3 + c] = A.array[o * 3 + c]; Nn[v * 3 + c] = Nn[o * 3 + c]; E.array[v * 3 + c] = E.array[o * 3 + c]; } }
          g.attributes.aPN.needsUpdate = true; }
        if (pr.key === 'c6Collar') { for (let i = 0; i < A.count; i++) { const y = P[i * 3 + 1]; A.array[i * 3 + 1] -= 0.004 * sm(1.396, 1.41, y); E.array[i * 3 + 2] *= sm(0.0, -0.03, P[i * 3 + 2]); } A.needsUpdate = true; E.needsUpdate = true; }
      }
    });
  },
};
