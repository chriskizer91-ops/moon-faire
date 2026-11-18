// C2, the sky-pirate captain (C2A.png, C2B.png): a long navy wool frock coat worn open, with a standing collar, lapels, brass buttons
// down both front edges, long sleeves with deep turned-back cuffs (two buttons each), and flared skirts falling to mid-calf; under it a
// cream shirt open in a V at the throat with a ruffled jabot down both edges of the V; a deep-red silk sash wound round her waist and
// knotted at her left front, its two ends hanging to above her knee; fitted black breeches tucked into tall black leather boots with a
// wide turned-down cuff and a low block heel; a black felt tricorn hat edged with gold braid, sitting on the bun.
// Pieces: c2Coat (the body, shoulders to waist), c2Collar, c2CoatSkirt (the skirts, on the soft chains), c2SleeveR/L, c2CuffR/L,
// c2Buttons (all the brass buttons: fronts and cuffs), c2Shirt (only where it can be seen), c2Jabot, c2Sash (the band and its knot),
// c2SashEnds, c2Breeches, c2BootR/L, c2BootCuffR/L, c2Hat (crown and brim), c2HatTrim (the gold braid).
// The paintings' plum background is too close to the navy coat and the boots for the prep's outline: the prep reads a copy with the
// background lifted (/home/claude/agents/C2/clean.py):  python3 tools/outfit_prep.py C2 --img /home/claude/agents/C2/C2A_clean.png
// The prep's marks are set by hand in C2_prep.json (the collar hides her neck; the hat): neck rows just under the chin, the soles, and
// the middles. She stands on the boots' soles and heels: LIFT (C2_prep.json heel).
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.C2 = {
  name: 'Sky-pirate captain: navy frock coat, ruffled shirt, red sash, black breeches, tall cuffed boots, tricorn hat', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smin, smax, prof, DOLL } = W;
    const F = W.F, Fs = W.Fsnug;
    const LIFT = 0.020;                                   // the boots' soles and heels: she stands this much higher
    // ----- materials -----
    const wool = W.paint({ rough: 0.94, emis: 0.30, env: 0.10 });
    const woolD = W.paint({ rough: 0.94, emis: 0.30, env: 0.10, double: true });
    const linen = W.paint({ rough: 0.90, emis: 0.58, env: 0.10, color: '#ffffff' });
    const ruffle = W.std({ color: W.lin('#ddd2c2'), emissive: W.lin('#ddd2c2'), emissiveIntensity: 0.22, roughness: 0.9, envMapIntensity: 0.15, side: W.THREE.DoubleSide });
    const silk = W.paint({ rough: 0.50, emis: 0.30, env: 0.35 });
    const silkD = W.paint({ rough: 0.66, emis: 0.30, env: 0.20, double: true });
    const cloth = W.paint({ rough: 0.86, emis: 0.24, env: 0.15 });
    const leather = W.paint({ rough: 0.42, emis: 0.22, env: 0.60 });
    const brass = W.std({ color: W.lin('#b08a48'), metalness: 0.85, roughness: 0.32, envMapIntensity: 1.1 });
    const felt = W.std({ color: W.lin('#19181c'), emissive: W.lin('#19181c'), emissiveIntensity: 0.25, roughness: 0.93, envMapIntensity: 0.12, side: W.THREE.DoubleSide });
    const braid = W.std({ color: W.lin('#b8914a'), metalness: 0.70, roughness: 0.40, envMapIntensity: 0.9 });

    // ----- small geometry helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const perp = (n) => { const u = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])); return [u, cross(n, u)]; };
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    function orient(g, rings) {                           // flip a loft's triangles if its middle ring faces inward
      const nor = W.computeNormals(g.pos, g.idx), m = Math.floor(rings.length / 2), r = rings[m], n = r.length, cols = n + 1;
      const c = r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]); let s = 0;
      for (let j = 0; j < n; j++) { const v = m * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    const flip = (g) => { for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; } return g; };
    // make every triangle of g face away from the point c(p) (p: the triangle's middle), as a whole: flips all if most face in
    function faceOut(g, cOf) {
      const P = g.pos; let s = 0;
      for (let i = 0; i < g.idx.length; i += 3) { const a = g.idx[i] * 3, b = g.idx[i + 1] * 3, c = g.idx[i + 2] * 3;
        const u = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], v = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]], n = cross(u, v);
        const m = [(P[a] + P[b] + P[c]) / 3, (P[a + 1] + P[b + 1] + P[c + 1]) / 3, (P[a + 2] + P[b + 2] + P[c + 2]) / 3]; s += dot(n, sub(m, cOf(m))) > 0 ? 1 : -1; }
      return s < 0 ? flip(g) : g;
    }
    function hit(G, p, d, maxL) {                         // where a ray from p along d first meets G < 0
      let lo = 0, hi = -1; const st = 0.0015;
      for (let t = 0; t <= (maxL || 0.4); t += st) { if (G(p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t) < 0) { hi = t; lo = Math.max(0, t - st); break; } }
      if (hi < 0) return null;
      for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (G(p[0] + d[0] * m, p[1] + d[1] * m, p[2] + d[2] * m) < 0) hi = m; else lo = m; }
      return add(p, d, (lo + hi) / 2);
    }
    const grad = (G, p) => { const e = 0.0008; return norm([G(p[0] + e, p[1], p[2]) - G(p[0] - e, p[1], p[2]), G(p[0], p[1] + e, p[2]) - G(p[0], p[1] - e, p[2]), G(p[0], p[1], p[2] + e) - G(p[0], p[1], p[2] - e)]); };
    const snugG = (R, th) => (x, y, z) => { const r = R(x, y, z); return smax(Fs(x, y, z) - th(x, y, z) - 0.0011 * Math.exp(-r * r / 1.6e-5), r, 0.0022); };
    const wSkinAt = (x, y, z) => { const p = [x, y, z], f = F(x, y, z), n = grad(F, p); return W.wBody(x - n[0] * f, y - n[1] * f, z - n[2] * f); };
    // a slab: a grid of points (rows of columns) made into a closed sheet of thickness T, pushed in along dir(p) (unit, pointing out)
    function slab(grid, T, dir) {
      const R = grid.length, C = grid[0].length, pos = [], idx = [];
      for (const row of grid) for (const p of row) pos.push(p[0], p[1], p[2]);
      for (const row of grid) for (const p of row) { const d = dir(p); pos.push(p[0] - d[0] * T, p[1] - d[1] * T, p[2] - d[2] * T); }
      const O = 0, I = R * C, v = (base, i, j) => base + i * C + j;
      for (let i = 0; i < R - 1; i++) for (let j = 0; j < C - 1; j++) {
        idx.push(v(O, i, j), v(O, i + 1, j), v(O, i, j + 1), v(O, i, j + 1), v(O, i + 1, j), v(O, i + 1, j + 1));
        idx.push(v(I, i, j), v(I, i, j + 1), v(I, i + 1, j), v(I, i, j + 1), v(I, i + 1, j + 1), v(I, i + 1, j)); }
      const edge = (a0, a1, b0, b1) => idx.push(a0, b0, a1, a1, b0, b1);
      for (let i = 0; i < R - 1; i++) { edge(v(O, i, 0), v(O, i + 1, 0), v(I, i, 0), v(I, i + 1, 0)); edge(v(O, i + 1, C - 1), v(O, i, C - 1), v(I, i + 1, C - 1), v(I, i, C - 1)); }
      for (let j = 0; j < C - 1; j++) { edge(v(O, 0, j + 1), v(O, 0, j), v(I, 0, j + 1), v(I, 0, j)); edge(v(O, R - 1, j), v(O, R - 1, j + 1), v(I, R - 1, j), v(I, R - 1, j + 1)); }
      return { pos, idx };
    }
    // the outside of a slab faces along dir: check the first outer triangle and turn the whole slab over if it faces in
    function slabOut(g, grid, dir) {
      const P = g.pos, a = g.idx[0] * 3, b = g.idx[1] * 3, c = g.idx[2] * 3;
      const n = cross([P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]]);
      return dot(n, dir(grid[0][0])) < 0 ? flip(g) : g;
    }

    // ======================= layers (thickness off her body) and heights =======================
    const SHIRT_TH = 0.0032, BR_TH = 0.0050, SASH_LO = 0.984, SASH_HI = 1.066;
    const NCZ = -0.0225;                                  // the middle of her neck (z)
    // the coat's front edges: half the gap between them, by height (the paintings: the shirt shows between them, the breeches below)
    const XE = [[0.40, 0.166], [0.50, 0.160], [0.60, 0.152], [0.70, 0.142], [0.80, 0.129], [0.86, 0.118], [0.92, 0.102], [0.98, 0.086], [1.04, 0.074], [1.12, 0.067], [1.22, 0.069], [1.30, 0.076], [1.38, 0.080], [1.44, 0.080]];
    const xe = (y) => prof(XE, y, true);
    const coatTh = (x, y, z) => 0.0078 + 0.0062 * sm(SASH_HI + 0.03, SASH_HI + 0.005, y);       // over the sash at her waist
    const neckTop = (x, z) => { const a = Math.abs(Math.atan2(x, z - NCZ)); return lerp(1.346, 1.374, sm(0.9, 2.5, a)); };
    const COAT_BOT = 1.035;
    const opening = (x, y, z) => Math.min(xe(y) - Math.abs(x), (z - 0.030) * 0.8);
    const coatR = (x, y, z) => Math.max(COAT_BOT - y, y - neckTop(x, z), opening(x, y, z));
    const coatG = snugG(coatR, coatTh);

    // ======================= the coat's body: fitted wool from her shoulders to her waist, open down the front =======================
    W.snug('c2Coat', coatR, coatTh, [-0.215, 0.215, COAT_BOT - 0.01, 1.40, -0.16, 0.15], 0.0058, { mat: wool });

    // ======================= the shirt: cream linen, open in a deep V at her throat; only where it can be seen =======================
    const vEdge = (y) => Math.max(0, (y - 1.188) / 2.9);                   // half the V's width at height y
    const shirtTop = (x, z) => { const ax = Math.abs(x), front = sm(-0.01, 0.025, z); return lerp(1.375, Math.min(1.375, 1.188 + 2.9 * ax), front); };
    const shirtR = (x, y, z) => Math.max(0.965 - y, y - shirtTop(x, z), -(coatR(x, y, z) + 0.014));
    W.snug('c2Shirt', shirtR, () => SHIRT_TH, [-0.13, 0.13, 0.96, 1.385, 0.0, 0.14], 0.0050, { mat: linen });

    // ======================= the jabot: ruffles down both edges of the V, two tiers =======================
    {
      const shirtG = (x, y, z) => Fs(x, y, z) - SHIRT_TH;
      const parts = [];
      for (const s of [-1, 1]) for (const [tier, w0, amp, nw, dz] of [[0, 0.030, 0.0065, 7, 0.0], [1, 0.022, 0.0050, 6, 0.004]]) {
        const NS = 40, NW = 6, grid = [];
        for (let i = 0; i <= NS; i++) {
          const t = i / NS, y = lerp(1.362, 1.170 + tier * 0.02, t), xa = s * Math.max(0.004, vEdge(y) + 0.002);
          const p = hit(shirtG, [xa, y, 0.25], [0, 0, -1], 0.3) || [xa, y, 0.08], n = grad(shirtG, p);
          const out = norm([s * 0.20, -0.80, 0.50]);                       // the ruffle falls out over the shirt's front and a little down
          const row = [];
          for (let k = 0; k <= NW; k++) { const u = k / NW, wv = Math.sin((t * nw + u * 0.35 + tier * 0.5) * TAU) * amp * u, lift = 0.003 + dz + 0.010 * u * (1 - 0.5 * u);
            const q = add(add(add(p, out, w0 * u * (0.75 + 0.25 * Math.sin(t * PI))), n, lift + wv), [0, 1, 0], 0.003 * u);
            row.push(q); }
          grid.push(row);
        }
        const g = W.loft(grid, { open: true });
        parts.push(g);
      }
      W.part('c2Jabot', merge(parts), (x, y, z) => W.wBody(x, y, z - 0.012), { mat: ruffle });
    }

    // ======================= the collar: stands round her neck from the coat's neckline, open in front, its top flared out =======================
    {
      const PH0 = 0.70, NUC = 64, TH = 0.0018;
      const axis = (y) => [0, y, NCZ];
      const rh = (a) => [Math.sin(a), 0, Math.cos(a)];
      const onBody = (a, y, off) => { const d = rh(a), p = hit(F, add(axis(y), d, 0.2), [-d[0], 0, -d[2]], 0.25) || add(axis(y), d, 0.05); return add(p, d, off); };
      const yT = (a) => { const b = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))); return prof([[0.0, 1.383], [PI / 2, 1.398], [PI, 1.408]], b, true); };
      const rings = [];
      for (let i = 0; i <= NUC; i++) {
        const a = lerp(PH0, TAU - PH0, i / NUC), d = rh(a), fr = sm(1.5, 0.75, Math.abs(Math.atan2(Math.sin(a), Math.cos(a))));
        const B = onBody(a, neckTop(d[0], d[2]) - 0.008, 0.0105);
        const T0 = onBody(a, yT(a), 0.0095 + 0.010 * fr);
        const T = add(T0, d, 0.004);
        const path = []; for (let k = 0; k <= 6; k++) { const t = k / 6; path.push([lerp(B[0], T[0], t) + d[0] * 0.003 * Math.sin(t * PI), lerp(B[1], T[1], t), lerp(B[2], T[2], t) + d[2] * 0.003 * Math.sin(t * PI)]); }
        const ring = []; for (const p of path) ring.push(add(p, d, TH)); for (let k = path.length - 1; k >= 0; k--) ring.push(add(path[k], d, -TH));
        rings.push(ring);
      }
      const g = W.loft(rings, { capA: true, capB: true });
      faceOut(g, (m) => [0, m[1], NCZ]);
      W.part('c2Collar', g, (x, y, z) => wSkinAt(x, Math.min(y, 1.37), z), { mat: wool });
    }

    // ======================= the sleeves: roomy wool from over her shoulder to her wrist =======================
    const SL_END = 0.405;
    const slTop = (a) => lerp(-0.040, 0.075, Math.pow((1 - Math.cos(a)) / 2, 1.4));
    const slOff = (sl, a) => 0.0105 + 0.0060 * sm(0.0, 0.20, sl) - 0.0035 * sm(0.22, 0.34, sl) - 0.0040 * sm(0.03, -0.04, sl);
    const armRing = (S, sl, NU, offF) => { const ring = [];
      for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
        ring.push(add(p, norm(sub(p, ax)), offF(a))); }
      return ring; };
    for (const S of ['R', 'L']) {
      const NU = 40, rings = [], SLs = [];
      const N1 = 44; for (let i = 0; i <= N1; i++) { const t = Math.pow(i / N1, 1.1), ring = [], sls = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, sl = lerp(slTop(a), SL_END, t), p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
          ring.push(add(p, norm(sub(p, ax)), slOff(sl, a))); sls.push([sl, a]); }
        rings.push(ring); SLs.push(sls); }
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('c2Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, SL_END); const [sl, a] = SLs[r][j % NU];
        const wa = W.wArmSL(S, Math.max(sl, 0.0), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.35 * sm(0.03, -0.015, sl)) : wa; }, { mat: wool });
    }

    // ======================= the cuffs: deep turned-back wool cuffs from below her elbow to her wrist, closed in to the wrist =======================
    const CUFF0 = 0.333, CUFF1 = 0.447;
    const cuffOff = (sl) => lerp(0.0245, 0.0290, sm(CUFF0, CUFF1, sl));
    for (const S of ['R', 'L']) {
      const NU = 40, prof2 = [[CUFF0 + 0.016, 0.0130], [CUFF0 + 0.002, 0.0150], [CUFF0, 0.0185], [CUFF0 + 0.004, cuffOff(CUFF0 + 0.004)]];
      for (let k = 1; k <= 14; k++) { const sl = lerp(CUFF0 + 0.004, CUFF1 - 0.003, k / 14); prof2.push([sl, cuffOff(sl)]); }
      prof2.push([CUFF1, cuffOff(CUFF1) - 0.0022], [CUFF1 + 0.0005, cuffOff(CUFF1) - 0.006], [CUFF1 - 0.0005, 0.010], [CUFF1 - 0.002, 0.0045]);
      const rings = prof2.map(([sl, e]) => armRing(S, sl, NU, () => e));
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('c2Cuff' + S, g, (x, y, z, i) => { const r = Math.min(prof2.length - 1, Math.floor(i / cols)), j = i % cols; return W.wArmSL(S, prof2[r][0], ((j % NU) / NU) * TAU); }, { mat: wool });
    }

    // ======================= the sash: red silk wound round her waist over the shirt, under the coat; knotted at her left front =======================
    const sashTh = (x, y, z) => { const v = (y - SASH_LO) / (SASH_HI - SASH_LO); return 0.0088 + 0.0020 * Math.sin(v * PI * 3 + 0.6 * Math.sin(Math.atan2(x, z) * 3)) * sm(0.0, 0.15, v) * sm(1.0, 0.85, v); };
    const sashR = (x, y, z) => Math.max(SASH_LO - y, y - SASH_HI);
    const sashG = snugG(sashR, sashTh);
    const KN = [0.104, 1.008];
    const kp0 = hit(sashG, [KN[0], KN[1], 0.3], [0, 0, -1], 0.3), kn = grad(sashG, kp0), KC = add(kp0, kn, 0.016);
    {
      // the band and the knot together (one surface): the knot an uneven lump of gathered silk, a little twisted
      const knot = (x, y, z) => { const dx = x - KC[0], dy = y - KC[1], dz = z - KC[2];
        const r = Math.hypot(dx / 0.030, dy / 0.034, dz / 0.019) - 1, tw = 0.10 * Math.sin(Math.atan2(dy, dx) * 3 + dz * 90);
        return (r + tw) * 0.019; };
      const G = (x, y, z) => Math.min(sashG(x, y, z), knot(x, y, z));
      const wk = W.wBody(kp0[0], kp0[1], kp0[2] - 0.01);
      W.surface('c2Sash', G, [-0.20, 0.20, SASH_LO - 0.04, SASH_HI + 0.03, -0.02, 0.16], 0.0048, (x, y, z) => (Math.hypot(x - KC[0], y - KC[1]) < 0.04 && z > 0.06 ? wk : wSkinAt(x, y, z)), { mat: silk, keep: (x, y, z) => z > 0.0 && F(x, y, z) > -0.0012 });
    }

    // ======================= the breeches: fitted black cloth from under the sash down into the boots =======================
    const BOOT_TOP = 0.352;
    const brR = (x, y, z) => Math.max(y - 1.045, BOOT_TOP - 0.010 - y);
    const brTh = (x, y, z) => BR_TH + 0.0010 * sm(0.95, 0.85, y);
    W.snug('c2Breeches', brR, brTh, [-0.215, 0.215, BOOT_TOP - 0.02, 1.06, -0.16, 0.15], 0.0086, { mat: cloth });

    // ======================= the coat's skirts: from her waist to mid-calf, flaring, open in front, on the soft chains =======================
    const ZC = -0.020, TOPY = 1.085, HEM = 0.400;
    const NA = 72, YB0 = 1.10, YB1 = 0.62, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, ZC + ca * r);
        let r = 0.32; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; let fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    // the flare (half width, front and back from the middle line) read from the paintings
    const FL = [[1.09, [0.112, 0.100, 0.040]], [1.00, [0.150, 0.125, 0.090]], [0.90, [0.180, 0.150, 0.122]], [0.80, [0.200, 0.163, 0.142]], [0.70, [0.215, 0.172, 0.158]],
      [0.60, [0.232, 0.178, 0.170]], [0.50, [0.250, 0.184, 0.181]], [0.40, [0.270, 0.190, 0.192]], [0.30, [0.280, 0.195, 0.198]]];
    const flareR = (y, a) => { const v = prof(FL, y, true), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2]; return 1 / Math.sqrt((s / v[0]) * (s / v[0]) + (c / rz) * (c / rz)); };
    const clear = (y) => lerp(0.0150, 0.020, sm(1.07, 0.92, y));
    const baseR = (y, a) => y >= TOPY - 0.005 ? bodyR(y, a) + coatTh(0, y, 0) + 0.0016 : smax(bodyR(y, a) + clear(y), flareR(y, a), 0.020);
    const gAmp = (y, a) => lerp(0.0, 0.011, Math.pow(sm(1.04, HEM, y), 0.9)) * lerp(0.35, 1.0, sm(0.6, -0.4, Math.cos(a)));
    const fold = (a, y) => { const t = sm(TOPY, HEM, y), ph = 0.35 * t * Math.sin(2 * a + 0.4); return 0.7 * Math.sin(a * 12 + ph + 0.5 * Math.sin(a * 3)) + 0.3 * Math.sin(a * 23 + 1.3 + ph * 1.5); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y, a) * (0.5 + 0.5 * fold(a, y));
    const skirtPt = (y, a, dr) => { const r = skirtR(y, a) + (dr || 0); return [r * Math.sin(a), y, ZC + r * Math.cos(a)]; };
    const edgeA = (y) => { const X = xe(y); let lo = 0.02, hi = 1.7; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (skirtR(y, m) * Math.sin(m) < X) lo = m; else hi = m; } return (lo + hi) / 2; };
    const hemY = (a) => HEM + 0.004 * Math.sin(a * 3 + 1) + 0.010 * sm(0.4, 0.95, Math.cos(a));      // the fronts a little shorter... (raised at the front edges)
    const SKT = 0.0042;
    const skirtGrid = [], skirtA = [];
    {
      const NU = 128, NV = 46;
      for (let i = 0; i <= NV; i++) { const t = i / NV, yb = lerp(TOPY, HEM, t * t * 0.25 + t * 0.75), row = [], arow = [];
        const ae = edgeA(Math.max(yb, HEM + 0.01));
        for (let j = 0; j < NU; j++) { const a = lerp(ae, TAU - ae, j / (NU - 1)), y = i === NV ? hemY(a) : lerp(yb, hemY(a), sm(0.5, HEM, yb));
          row.push(skirtPt(y, a)); arow.push(a); }
        skirtGrid.push(row); skirtA.push(arow); }
      const dir = (p) => norm([p[0], 0, p[2] - ZC]);
      const g = slabOut(slab(skirtGrid, SKT, dir), skirtGrid, dir);
      const wSk = (x, y, z) => { const u = sm(TOPY, TOPY - 0.07, y); const w = W.wSkirt(x, y, z); return u >= 1 ? w : W.mixW(W.wBody(x * 0.94, y, ZC + (z - ZC) * 0.94), w, u); };
      W.part('c2CoatSkirt', g, (x, y, z) => wSk(x, y, z), { mat: woolD });
    }

    // ======================= the sash's ends: two lengths of silk hanging from the knot over the coat's left front edge =======================
    {
      const ends = [];
      for (const [x0, x1, y1, w0, w1, zo, ph] of [[0.098, 0.122, 0.655, 0.030, 0.072, 0.0, 0.0], [0.114, 0.090, 0.700, 0.026, 0.050, -0.006, 1.7]]) {
        const NS = 30, NW = 8, grid = [];
        for (let i = 0; i <= NS; i++) { const t = i / NS, y = lerp(KC[1] - 0.012, y1, t), xc = lerp(x0, x1, t * t * 0.5 + t * 0.5), w = lerp(w0, w1, Math.pow(t, 0.8)), row = [];
          for (let k = 0; k <= NW; k++) { const u = k / NW - 0.5, cut = t > 0.85 ? (t - 0.85) / 0.15 * 0.04 * (u + 0.5) : 0;
            const zz = 0.121 + zo + 0.004 * t + 0.0055 * Math.sin(u * TAU * 1.5 + ph + t * 4) * sm(0.0, 0.3, t) - 0.006 * (1 - sm(0.0, 0.12, t));
            row.push([xc + u * w, y + cut, zz]); }
          grid.push(row); }
        ends.push(slab(grid, 0.0016, () => [0, 0, 1]));
        const g = ends[ends.length - 1]; slabOut(g, grid, () => [0, 0, 1]);
      }
      W.part('c2SashEnds', merge(ends), (x, y, z) => W.mixW(W.wBody(x, Math.max(y, 0.99), 0.09), W.wSkirt(x, y, z), sm(0.985, 0.90, y)), { mat: silkD });
    }

    // ======================= the buttons: brass domes down both front edges and two on each cuff =======================
    {
      const PR = [[0.0090, 0.0], [0.0092, 0.0012], [0.0085, 0.0028], [0.0068, 0.0042], [0.0040, 0.0051], [0.0, 0.0055]];
      const dome = (c, n, sc) => { const [u, v] = perp(n), rings = [];
        for (const [r, h] of PR) { const ring = []; for (let j = 0; j < 14; j++) { const t = (j / 14) * TAU; ring.push(add(add(add(c, u, r * sc * Math.cos(t)), v, r * sc * Math.sin(t)), n, h * sc)); } rings.push(ring); }
        const g = W.loft(rings, { capA: true }); return faceOut(g, () => add(c, n, -0.01)); };
      const list = [], WT = [];
      const put = (g, w) => { list.push(g); for (let k = 0; k < g.pos.length / 3; k++) WT.push(w); };
      // on the coat's body (lapels and fronts above the waist)
      for (const s of [-1, 1]) for (const y of [1.282, 1.236, 1.180, 1.132, 1.085, 1.058]) {
        const x = s * (xe(y) + 0.026), p = hit(coatG, [x, y, 0.3], [0, 0, -1], 0.35); if (!p) continue; const n = grad(coatG, p);
        put(dome(add(p, n, -0.0006), n, 1), W.wBody(p[0], p[1], p[2] - 0.012)); }
      // on the skirts' fronts
      for (const s of [-1, 1]) for (const y of [1.018, 0.962, 0.912, 0.855, 0.790, 0.728, 0.666, 0.605, 0.545, 0.478]) { if (s > 0 && y > 0.94) continue;
        const X = xe(y) + 0.020; let lo = 0.05, hi = 1.6; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (skirtR(y, m) * Math.sin(m) < X) lo = m; else hi = m; }
        const a = s > 0 ? (lo + hi) / 2 : TAU - (lo + hi) / 2, p = skirtPt(y, a), q = skirtPt(y + 0.004, a), r2 = skirtPt(y, a + 0.01);
        const n = norm(cross(sub(r2, p), sub(q, p))), nn = dot(n, [Math.sin(a), 0, Math.cos(a)]) < 0 ? [-n[0], -n[1], -n[2]] : n;
        put(dome(add(p, nn, -0.0004), nn, 0.98), W.wSkirt(p[0], p[1], p[2])); }
      // on the cuffs: two on the front of each, near its upper edge
      for (const S of ['R', 'L']) for (const sl of [0.372, 0.412]) { const a = PI / 2 - 0.35, c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
        const p0 = W.armPt(S, sl, a), n = norm(sub(p0, ax)), p = add(p0, n, cuffOff(sl) - 0.0004); put(dome(p, n, 0.92), W.wArmSL(S, sl, a)); }
      W.part('c2Buttons', merge(list), (x, y, z, i) => WT[i], { mat: brass });
    }

    // ======================= the boots: tall black leather, a low block heel, a wide cuff turned down over the top =======================
    const LAST = [[-0.074, [-0.012, 0.012, 0.042]], [-0.066, [-0.028, 0.026, 0.058]], [-0.046, [-0.036, 0.034, 0.070]], [-0.020, [-0.038, 0.037, 0.079]], [0.010, [-0.040, 0.038, 0.089]],
      [0.040, [-0.041, 0.043, 0.088]], [0.070, [-0.043, 0.051, 0.072]], [0.100, [-0.046, 0.056, 0.052]], [0.118, [-0.047, 0.056, 0.046]], [0.133, [-0.046, 0.049, 0.042]],
      [0.147, [-0.042, 0.036, 0.038]], [0.160, [-0.032, 0.018, 0.034]], [0.172, [-0.014, -0.002, 0.030]]];
    const S0 = W.SOLE, L2 = [0, 0];
    const lastD = (X, Y, Z) => {
      const v0 = prof(LAST, Z - 0.007), v1 = prof(LAST, Z), v2 = prof(LAST, Z + 0.007), v = [0, 1, 2].map((k) => (v0[k] + 2 * v1[k] + v2[k]) / 4), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.012, ry = Math.max(0.004, v[2] - 0.012);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.016, q = Math.pow(Math.pow(ux, 2.6) + Math.pow(uy, 2.6), 1 / 2.6);
      return Math.max((q - 1) * Math.min(rx, Y > yc ? ry : 0.016), -0.076 - Z, Z - 0.175);
    };
    const archLift = (Z) => 0.0120 * sm(-0.032, -0.024, Z) * sm(0.080, 0.045, Z);
    const EX = (y) => prof([[0.08, 0.020], [0.16, 0.019], [0.26, 0.017], [0.36, 0.016], [0.44, 0.015]], y);
    const EZ = (y) => prof([[0.08, 0.014], [0.16, 0.013], [0.26, 0.012], [0.36, 0.011], [0.44, 0.011]], y);
    const shaft = (s, x, y, z) => {
      const L = W.legAt(cl(y, 0.10, 0.60)), cx = s * L[3], cz = L[4], rx = L[0] + EX(y), rf = L[1] + EZ(y), rb = L[2] + EZ(y);
      const dx = (x - cx) / rx, dz = (z - cz) / (z > cz ? rf : rb), q = Math.pow(Math.pow(Math.abs(dx), 2.4) + Math.pow(Math.abs(dz), 2.4), 1 / 2.4);
      return (q - 1) * Math.min(rx, rf, rb);
    };
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const leg = (x, y, z) => smin(shaft(s, x, y, z), DOLL.fLegOnly(s, x, y, z) - 0.0060, 0.008);
      const upper = (x, y, z) => {
        if (y > 0.16) { const sh = shaft(s, x, y, z); if (sh > 0.016) return smax(sh, y - BOOT_TOP, 0.0030); }
        DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const l = y > 0.040 ? leg(x, y, z) + 0.5 * Math.max(0, 0.11 - y) : 1, top = BOOT_TOP - 0.024 * sm(-0.0035, -0.0095, l);
        return smax(y > 0.16 ? l : smin(l, lastD(X, y, Z), 0.020), y - top, 0.0030); };
      const sole = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const plan = lastD(X, S0 + 0.012, Z) - 0.0030, yb = S0 - LIFT + archLift(Z), yt = S0 + 0.008;
        return smax(plan, Math.max(yb - y, y - yt), 0.0030); };
      const G = (x, y, z) => Math.min(upper(x, y, z), sole(x, y, z));
      const keep = (x, y, z) => !(y > 0.07 && DOLL.fLegOnly(s, x, y, z) < -0.002);
      const bx = s < 0 ? [-0.17, -0.005] : [0.005, 0.17];
      W.surface('c2Boot' + S, G, [bx[0], bx[1], S0 - LIFT - 0.006, BOOT_TOP + 0.010, -0.10, 0.22], 0.0060, (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z), { mat: leather, keep });
      // the cuff: the boot's top turned down, a wide flared band, higher over her knee than behind; its rim rolls over and turns down inside
      {
        const NU = 56, CB = 0.336, top = (a) => lerp(0.404, 0.446, (1 + Math.cos(a)) / 2), rings = [], ring = (fn) => { const r = []; for (let j = 0; j < NU; j++) r.push(fn((j / NU) * TAU)); rings.push(r); };
        const at = (a, y, ex) => { const L = W.legAt(cl(y, 0.10, 0.60)), cx = s * L[3], cz = L[4], sa = Math.sin(a), ca = Math.cos(a), rx = L[0] + ex, rz = (ca > 0 ? L[1] : L[2]) + ex;
          const k = 1 / Math.pow(Math.pow(Math.abs(sa), 2.4) + Math.pow(Math.abs(ca), 2.4), 1 / 2.4); return [cx + s * rx * sa * k, y, cz + rz * ca * k]; };
        const exO = (y, a) => lerp(EX(CB) + 0.0045, 0.0215, Math.pow(sm(CB, top(a), y), 0.8));
        ring((a) => at(a, CB + 0.012, EX(CB) - 0.0015)); ring((a) => at(a, CB + 0.0015, EX(CB) + 0.0010)); ring((a) => at(a, CB, EX(CB) + 0.0040));
        for (let k = 1; k <= 10; k++) ring((a) => { const y = lerp(CB, top(a), k / 10); return at(a, y, exO(y, a)); });
        ring((a) => at(a, top(a) + 0.0028, exO(top(a), a) - 0.0030));
        ring((a) => at(a, top(a), exO(top(a), a) - 0.0062));
        ring((a) => at(a, top(a) - 0.030, BR_TH + 0.0030));
        const g = orient(W.loft(rings, {}), rings);
        W.part('c2BootCuff' + S, g, (x, y, z) => W.wBody(x, Math.min(y, 0.43), z), { mat: leather });
      }
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // ======================= the tricorn: black felt, its brim cocked up on three sides into points at the front and the two back corners =======================
    // It sits on her hair and on the bun: the hat's base is a plane tipped forward (TILT) through HO; the hair (cap, locks and bun, as
    // the hairstyle built them) is measured round the hat's middle just above that plane, and the crown's opening follows it, a few
    // millimetres out, so the bun fills the back of the crown and the rest of the bun shows under the turned-up back brim.
    {
      const TILT = 11 * PI / 180, HO = [0, 1.578, -0.016];
      const EY = [0, Math.cos(TILT), Math.sin(TILT)], EZ2 = [0, -Math.sin(TILT), Math.cos(TILT)], EX2 = [1, 0, 0];
      const toW = (u, v, w) => [HO[0] + EX2[0] * u + EY[0] * v + EZ2[0] * w, HO[1] + EY[1] * v + EZ2[1] * w, HO[2] + EY[2] * v + EZ2[2] * w];
      const NBN = 72, RB = new Float32Array(NBN).fill(0.070); let vMax = 0.06;
      for (const m of W.hairParts().concat(W.meshes.face ? [W.meshes.face] : [])) { const P = m.geometry.attributes.position.array;
        for (let i = 0; i < P.length; i += 3) { const d = [P[i] - HO[0], P[i + 1] - HO[1], P[i + 2] - HO[2]], v = dot(d, EY); if (v < -0.006) continue;
          const u = d[0], w = dot(d, EZ2), r = Math.hypot(u, w), b = ((Math.round(Math.atan2(u, w) / TAU * NBN) % NBN) + NBN) % NBN;
          if (v < 0.07 && r > RB[b]) RB[b] = r; if (v > vMax) vMax = v; } }
      // smoothed and made a little rounder (each bin at least most of its neighbours' reach), symmetric
      let R0 = Array.from(RB);
      for (let b = 0; b < NBN; b++) R0[b] = Math.max(R0[b], R0[(NBN - b) % NBN]);
      for (let it = 0; it < 3; it++) R0 = R0.map((r, b) => Math.max(r, 0.96 * R0[(b + 1) % NBN], 0.96 * R0[(b + NBN - 1) % NBN]));
      R0 = R0.map((r, b) => (R0[(b + NBN - 2) % NBN] + 2 * R0[(b + NBN - 1) % NBN] + 3 * r + 2 * R0[(b + 1) % NBN] + R0[(b + 2) % NBN]) / 9 + 0.004);
      // an egg through the measured front, back and sides, so the crown is round where the bun would make it lumpy
      { const ax = Math.max(R0[NBN / 4], R0[3 * NBN / 4]), zf = R0[0], zb = R0[NBN / 2];
        R0 = R0.map((r, b) => { const ph = (b / NBN) * TAU, s = Math.sin(ph), c = Math.cos(ph), rz = c > 0 ? zf : zb; return Math.max(r, 1 / Math.sqrt((s / ax) * (s / ax) + (c / rz) * (c / rz))); }); }
      const rBase = (ph) => { const f = ((ph / TAU) * NBN % NBN + NBN) % NBN, b = Math.floor(f), u = f - b; return lerp(R0[b], R0[(b + 1) % NBN], u); };
      const HC = Math.max(0.092, vMax + 0.012);              // the crown's height over the base
      // the crown: from the base up, drawn in a little, then rounded over into a slightly domed top
      const NUH = 96, crownRings = [];
      const CP = [[0, 1.0], [0.25, 0.985], [0.55, 0.965], [0.78, 0.935], [0.90, 0.88], [0.965, 0.74], [0.995, 0.50], [1.0, 0.25], [1.0, 0.0]];
      for (const [hv, rk] of CP) { const ring = []; for (let j = 0; j < NUH; j++) { const ph = (j / NUH) * TAU, r = rBase(ph) * rk; ring.push(toW(r * Math.sin(ph), HC * (hv + 0.06 * (1 - rk) * 0) + 0.004 * (rk < 0.3 ? 1 : 0), r * Math.cos(ph))); } crownRings.push(ring); }
      const crown = W.loft(crownRings, {});
      faceOut(crown, () => toW(0, HC * 0.45, 0));
      // the brim: from the crown's foot out and up; a point at the front and at the two back corners (low, reaching far out), turned up
      // high against the crown between them
      const side = (ph) => (1 - Math.cos(3 * ph)) / 2;            // 0 at a point, 1 between two
      const NBR = 12, brimGrid = [], edge = [];
      for (let i = 0; i <= NBR; i++) {
        const t = i / NBR, row = [];
        for (let j = 0; j <= NUH; j++) { const ph = (j / NUH) * TAU, sd = Math.pow(side(ph), 0.8), r0 = rBase(ph);
          const C = [r0 + lerp(0.050, 0.030, sd), lerp(-0.004, 0.002, sd)], E = [r0 + lerp(0.082, 0.020, sd), lerp(0.020, HC * 0.92, sd) + (Math.cos(ph) > 0.9 ? -0.010 * (Math.cos(ph) - 0.9) * 10 : 0)];
          const q = (1 - t) * (1 - t), w = 2 * t * (1 - t), r = t * t, rr = q * r0 + w * C[0] + r * E[0], hh = q * 0 + w * C[1] + r * E[1];
          row.push(toW(rr * Math.sin(ph), hh, rr * Math.cos(ph))); }
        brimGrid.push(row);
      }
      for (let j = 0; j <= NUH; j++) edge.push(brimGrid[NBR][j]);
      const brim = W.loft(brimGrid, { open: true });
      const HEADB = W.wBone('head');
      W.part('c2Hat', merge([crown, brim]), () => HEADB, { mat: felt });
      // the gold braid along the brim's edge: a flat band folded over the edge
      {
        const rings = [];
        for (let j = 0; j <= NUH; j++) { const p = edge[j % NUH], pi = brimGrid[NBR - 1][j % NUH], tdir = norm(sub(edge[(j + 1) % NUH], edge[(j + NUH - 1) % NUH])), out = norm(sub(p, pi)), up = norm(cross(tdir, out));
          const ring = []; for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; ring.push(add(add(p, out, -0.0010 + 0.0022 * Math.cos(a)), up, 0.0034 * Math.sin(a))); } rings.push(ring); }
        const g = W.loft(rings, {});
        faceOut(g, (m) => { let best = edge[0], bd = 9; for (const e of edge) { const d = Math.hypot(m[0] - e[0], m[1] - e[1], m[2] - e[2]); if (d < bd) { bd = d; best = e; } } return add(best, [0, 0, 0], 0); });
        W.part('c2HatTrim', g, () => HEADB, { mat: braid });
      }
    }

    // ======================= her legs and arms keep out of the coat's skirts (as wardrobe/D6.js does it for a long skirt) =======================
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.040;
      const legs = [];
      for (const S of ['R', 'L']) legs.push({ a: 'thigh' + S, b: 'shin' + S, ra: 0.080, rb: 0.057 }, { a: 'shin' + S, b: 'foot' + S, ra: 0.060, rb: 0.050 });
      for (const L of legs) { L.A = new T3.Vector3(); L.B = new T3.Vector3(); L.A0 = W.SK[L.a].userData.rest.clone(); L.B0 = W.SK[L.b].userData.rest.clone(); }
      const V = new T3.Vector3();
      const restRD = (p) => { const out = []; for (const L of legs) for (let j = 0; j <= 6; j++) out.push(V.copy(L.A0).lerp(L.B0, j / 6).distanceTo(p)); return out; };
      const JT = CH.map((c) => c.names.map((nm, k) => {
        const p0 = c.pts[k], p1 = c.pts[k + 1], pr = [];
        for (const y of [p1.y, (p0.y + p1.y) / 2]) { if (y > 1.0) continue; const q = new T3.Vector3(...skirtPt(Math.max(y, HEM), c.a)); pr.push({ off: q.clone().sub(p0), rd: restRD(q) }); }
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
      // her forearms and hands keep out of the skirts' sides
      const PADA = 0.022, segs = [];
      for (const S of ['R', 'L']) { const el = W.restPts['el' + S], wr = W.restPts['wr' + S], d = W.armDir[S], tip = new T3.Vector3(wr.x + d.x * 0.17, wr.y + d.y * 0.17, wr.z + 0.012);
        segs.push({ a: 'farm' + S, b: 'hand' + S, ra: 0.040, rb: 0.034, A: new T3.Vector3(), B: new T3.Vector3(), A0: el.clone(), B0: wr.clone() },
                  { a: 'hand' + S, b: null, ra: 0.040, rb: 0.030, A: new T3.Vector3(), B: new T3.Vector3(), A0: wr.clone(), B0: tip, off: new T3.Vector3().subVectors(tip, wr) }); }
      const probes = [];
      CH.forEach((c) => { const a = c.a, sa = Math.sin(a); if (Math.abs(sa) < 0.55) return;
        c.names.forEach((nm, k) => { const y = c.pts[k + 1].y; if (y < 0.45) return; const pr = new T3.Vector3(...skirtPt(y, a));
          const rd = segs.map((sg) => { const ab = sg.B0.clone().sub(sg.A0), t = cl(pr.clone().sub(sg.A0).dot(ab) / ab.lengthSq(), 0, 1); return { t, d: pr.distanceTo(sg.A0.clone().addScaledVector(ab, t)) }; });
          probes.push({ nm, off: pr.clone().sub(c.pts[k]), rd }); }); });
      const Q = new T3.Vector3(), AB = new T3.Vector3(), qa = new T3.Quaternion();
      W.onFrame((SK) => {
        for (const sg of segs) { SK[sg.a].getWorldPosition(sg.A); if (sg.b) SK[sg.b].getWorldPosition(sg.B); else { SK[sg.a].getWorldQuaternion(qa); sg.B.copy(sg.off).applyQuaternion(qa).add(sg.A); } }
        for (const pb of probes) {
          const b = SK[pb.nm]; b.getWorldPosition(H); b.getWorldQuaternion(qa); Pw.copy(pb.off).applyQuaternion(qa).add(H);
          let best = 0; D.set(0, 0, 0);
          segs.forEach((sg, si) => { AB.subVectors(sg.B, sg.A); const t = cl(Q.subVectors(Pw, sg.A).dot(AB) / Math.max(1e-8, AB.lengthSq()), 0, 1); Q.copy(sg.A).addScaledVector(AB, t);
            const R = Math.min(lerp(sg.ra, sg.rb, t) + PADA, pb.rd[si].d - 0.004), dd = Pw.distanceTo(Q); if (dd >= R) return;
            v1.subVectors(Pw, Q); v1.y = 0; if (v1.lengthSq() < 1e-8) return; v1.normalize(); const nd = R - dd; if (nd > best) { best = nd; D.copy(v1).multiplyScalar(nd); } });
          if (best <= 1e-4) continue;
          v1.subVectors(Pw, H); const len = v1.length(); v2.copy(Pw).add(D).sub(H).setLength(len); v1.normalize(); v2.normalize();
          qa.setFromUnitVectors(v1, v2); b.parent.getWorldQuaternion(pq);
          b.quaternion.premultiply(pq.clone().invert().multiply(qa).multiply(pq)); b.updateMatrixWorld(true);
        }
      });
    }

    // ======================= the paint: what the paintings cannot show =======================
    W.afterPaint((parts) => {
      for (const pr of parts) {
        const g = pr.mesh.geometry, PP = g.attributes.aPP, PN = g.attributes.aPN, PE = g.attributes.aPE; if (!PP) continue;
        const A = PP.array, Nn = PN.array, E = PE.array, n = A.length / 3;
        if (pr.key === 'c2Breeches') {
          // the breeches show only between the coat's fronts: everywhere they read the front painting's black breeches (her right leg, as
          // the sash's ends hang over her left)
          for (let i = 0; i < n; i++) { const x = A[i * 3], y = A[i * 3 + 1];
            A[i * 3] = -cl(Math.abs(x), 0.012, 0.125); A[i * 3 + 1] = cl(y, 0.47, 0.96); A[i * 3 + 2] = 0.12; Nn[i * 3] = 0; Nn[i * 3 + 1] = 0; Nn[i * 3 + 2] = 1; E[i * 3] = 1; E[i * 3 + 1] = 0; E[i * 3 + 2] = 0; }
        }
        if (/^c2Boot[RL]$/.test(pr.key)) {
          // the paintings' legs stand further back than hers in the side view; the tops of the feet read the front painting's shaft
          for (let i = 0; i < n; i++) { A[i * 3 + 2] -= 0.030;
            if (A[i * 3 + 1] < 0.125 && Nn[i * 3 + 1] > 0.35) { A[i * 3 + 1] = 0.16 - 0.25 * (0.125 - A[i * 3 + 1]); Nn[i * 3] = 0; Nn[i * 3 + 1] = 0; Nn[i * 3 + 2] = 1; E[i * 3] = 1; E[i * 3 + 1] = 0; E[i * 3 + 2] = 0; } }
        }
        if (/^c2BootCuff/.test(pr.key)) for (let i = 0; i < n; i++) A[i * 3 + 2] -= 0.030;
        if (pr.key === 'c2CoatSkirt') {
          // the side painting's hand lies over the skirts' side: there they read the front and back paintings
          // and the front painting's sash ends hang over its left front edge: the left front reads the right front, mirrored
          for (let i = 0; i < n; i++) { const y = A[i * 3 + 1], z = A[i * 3 + 2]; if (y > 0.62 && y < 0.97 && z > -0.07) E[i * 3 + 2] = 0;
            if (y > 0.60 && y < 0.99 && A[i * 3] > 0.03) { A[i * 3] = -A[i * 3]; Nn[i * 3] = -Nn[i * 3]; } }
        }
        if (pr.key === 'c2SashEnds') for (let i = 0; i < n; i++) { Nn[i * 3] = 0; Nn[i * 3 + 1] = 0; Nn[i * 3 + 2] = 1; E[i * 3] = 1; E[i * 3 + 1] = 0; E[i * 3 + 2] = 0; }
        if (pr.key === 'c2Shirt') {
          // under the jabot the painting shows the V's shadow lower than the shirt's V here: read the shirt a little below it
          for (let i = 0; i < n; i++) { const y = A[i * 3 + 1]; if (y > 1.12 && y < 1.215 && Math.abs(A[i * 3]) < 0.03) A[i * 3 + 1] = 1.12 - 0.3 * (y - 1.12); }
        }
        PP.needsUpdate = true; PN.needsUpdate = true; PE.needsUpdate = true;
      }
    });

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'dollFoot', 'toenail']);
    W.hideSkin((x, y, z) => { if (y > neckTop(x, z) - 0.012 || y < 0.95) return y < 0.95; if (z > 0 && y > 1.172 && Math.abs(x) < vEdge(y) + 0.012) return false; return true; }, ['dollTrunk']);
    W.hideSkin((x, y, z) => y < 1.03, ['dollLeg']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl < CUFF1 - 0.012; }, ['arm']);
  },
};
