// C1, the airship deckhand (C1A.png, C1B.png): a loose cream linen shirt, its sleeves rolled up in thick rolls to just below her elbows
// and its collar open at the throat; a fitted brown leather vest laced up the front, ending at her waist; high-waisted fitted
// dark-brown canvas trousers tucked into tall black leather boots (flat heels, three buckled straps up the outside of each); a wide
// black belt with a brass buckle and two small leather pouches on her right hip; fingerless brown leather gloves; brass goggles with
// round amber lenses pushed up on her forehead, their strap round her head.
// Pieces: c1Shirt (only where it can be seen), c1Collar (a folded loft), c1SleeveR/L (with the rolls), c1Vest, c1VestEyelets, c1VestLace,
// c1Trousers, c1Belt, c1BeltBuckle, c1Pouches, c1PouchSnaps, c1BootR/L, c1BootStrapsR/L, c1BootBucklesR/L, c1GloveCuffR/L (and her
// hands lend a two-tone glove material), c1GoggleRims, c1GoggleCups, c1GoggleLenses, c1GoggleStrap, c1GoggleBuckle.
// The paintings' plum background is too close to the dark boots for the prep's outline: the prep reads agents/C1/C1A_clean.png, a copy
// with its background lifted (agents/C1/clean.py), so run it as  python3 tools/outfit_prep.py C1 --img /home/claude/agents/C1/C1A_clean.png
// She stands on the boots' soles: LIFT (C1_prep.json heel).
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.C1 = {
  name: 'Airship deckhand: linen shirt, laced leather vest, canvas trousers, tall buckled boots, goggles', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smin, smax, prof, DOLL } = W;
    const F = W.F, Fs = W.Fsnug;
    const LIFT = 0.016;                                   // the boots' soles and heels: she stands this much higher
    // ----- materials -----
    const linen = W.paint({ rough: 0.92, emis: 0.32, env: 0.10, color: '#f4ede8' });
    const linenD = W.paint({ rough: 0.92, emis: 0.32, env: 0.10, color: '#f4ede8', double: true });
    const vestL = W.paint({ rough: 0.62, emis: 0.24, env: 0.35 });
    const canvas = W.paint({ rough: 0.93, emis: 0.24, env: 0.10 });
    const bootL = W.paint({ rough: 0.48, emis: 0.22, env: 0.55 });
    const beltL = W.paint({ rough: 0.55, emis: 0.22, env: 0.45 });
    const pouchL = W.paint({ rough: 0.60, emis: 0.24, env: 0.40 });
    const brass = W.std({ color: W.lin('#b48a40'), metalness: 0.85, roughness: 0.34, envMapIntensity: 1.1 });
    const cord = W.std({ color: W.lin('#3a2216'), roughness: 0.75 });
    const glovePlain = W.std({ color: W.lin('#4f3121'), emissive: W.lin('#4f3121'), emissiveIntensity: 0.30, roughness: 0.55, envMapIntensity: 0.4 });
    const strapM = W.std({ color: W.lin('#4a2e1e'), roughness: 0.6, envMapIntensity: 0.4 });
    const amber = W.phys({ color: W.lin('#d08a1c'), emissive: W.lin('#5c3004'), emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.12, clearcoat: 1.0, envMapIntensity: 1.4 });

    // ----- small geometry helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
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
    function torus(c, n, R, r, NU, NV) {
      NU = NU || 16; NV = NV || 8; const [u, v] = perp(n), rings = [];
      for (let i = 0; i <= NU; i++) { const t = (i / NU) * TAU, d = [u[0] * Math.cos(t) + v[0] * Math.sin(t), u[1] * Math.cos(t) + v[1] * Math.sin(t), u[2] * Math.cos(t) + v[2] * Math.sin(t)], cc = add(c, d, R), ring = [];
        for (let j = 0; j < NV; j++) { const p = (j / NV) * TAU; ring.push(add(add(cc, d, r * Math.cos(p)), n, r * Math.sin(p))); } rings.push(ring); }
      return orient(W.loft(rings, {}), rings);
    }
    function tube(pts, r, NV, closed) {                   // a round cord along points (closed: a loop)
      NV = NV || 6; const rings = [], N = pts.length;
      for (let i = 0; i < N; i++) { const a = closed ? pts[(i - 1 + N) % N] : pts[Math.max(0, i - 1)], b = closed ? pts[(i + 1) % N] : pts[Math.min(N - 1, i + 1)], t = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]), [u, v] = perp(t), ring = [];
        for (let j = 0; j < NV; j++) { const p = (j / NV) * TAU; ring.push(add(add(pts[i], u, r * Math.cos(p)), v, r * Math.sin(p))); } rings.push(ring); }
      if (closed) rings.push(rings[0]);
      return orient(W.loft(rings, closed ? {} : { capA: true, capB: true }), rings);
    }
    // a rounded-rectangle frame (a buckle): centre c, face direction n, width direction t, outer width w, height h, bar radius r
    function frame(c, n, t, w, h, r) {
      const up = norm(cross(n, t)), pts = [], rc = Math.min(w, h) * 0.22, NC = 5;
      const cs = [[w / 2 - rc, h / 2 - rc, 0], [-(w / 2 - rc), h / 2 - rc, PI / 2], [-(w / 2 - rc), -(h / 2 - rc), PI], [w / 2 - rc, -(h / 2 - rc), 1.5 * PI]];
      for (const [cx, cy, a0] of cs) for (let k = 0; k <= NC; k++) { const a = a0 + (PI / 2) * k / NC; pts.push(add(add(c, t, cx + rc * Math.cos(a)), up, cy + rc * Math.sin(a))); }
      return tube(pts, r, 6, true);
    }
    // where a ray from p along d first meets G < 0
    function hit(G, p, d, maxL) {
      let lo = 0, hi = -1; const st = 0.0015;
      for (let t = 0; t <= (maxL || 0.4); t += st) { if (G(p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t) < 0) { hi = t; lo = Math.max(0, t - st); break; } }
      if (hi < 0) return null;
      for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (G(p[0] + d[0] * m, p[1] + d[1] * m, p[2] + d[2] * m) < 0) hi = m; else lo = m; }
      return add(p, d, (lo + hi) / 2);
    }
    const grad = (G, p) => { const e = 0.0008; return norm([G(p[0] + e, p[1], p[2]) - G(p[0] - e, p[1], p[2]), G(p[0], p[1] + e, p[2]) - G(p[0], p[1] - e, p[2]), G(p[0], p[1], p[2] + e) - G(p[0], p[1], p[2] - e)]); };
    const snugG = (R, th) => (x, y, z) => { const r = R(x, y, z); return smax(Fs(x, y, z) - th(x, y, z) - 0.0011 * Math.exp(-r * r / 1.6e-5), r, 0.0022); };

    // ======================= layers (thickness off her body) and heights =======================
    const SHIRT_TH = 0.0035, TROU_TOP = 1.030, VEST_HEM_C = 0.992, BELT_LO = 0.952, BELT_HI = 0.986;
    const trouTh = (x, y, z) => lerp(0.0048, 0.0062, sm(1.0, 0.90, y)) * sm(0.40, 0.46, y) + 0.0042 * (1 - sm(0.40, 0.46, y)) + 0.0010 * sm(TROU_TOP - 0.020, TROU_TOP - 0.014, y);
    const VEST_TH = 0.0090;

    // ======================= the shirt's body: tucked into the trousers, open in a V at her throat =======================
    const NCZ = -0.020;                                    // the middle of her neck (z)
    const angN = (x, z) => Math.atan2(x, z - NCZ);         // 0 at the front, PI at the back
    const seam = (a) => { const b = Math.abs(a); return lerp(1.374, 1.366, sm(PI / 2, PI, b)); };       // where the collar is sewn on
    const shirtTop = (x, y, z) => {
      const a = angN(x, z), ax = Math.abs(x), front = sm(-0.01, 0.02, z);
      const v = 1.236 + 4.0 * ax;                          // the open V at her throat
      const t = Math.min(seam(a), lerp(seam(a), v, front));
      return lerp(t, 1.56, sm(0.064, 0.082, ax));          // beyond her neck it covers her shoulders
    };
    const shirtR = (x, y, z) => Math.max(0.945 - y, y - shirtTop(x, y, z));

    // ======================= the collar: stands round her neck and falls over onto her shoulders, open in front =======================
    {
      // a loft round her neck: each section runs from the seam up the stand, folds over, and falls out over her shoulders to the edge;
      // the section is a thin closed outline (the cloth's thickness), its ends the collar's points in front
      const CA0 = 0.60, NUC = 72, TH = 0.0011;
      const axis = (y) => [0, y, NCZ];
      const rh = (a) => [Math.sin(a), 0, Math.cos(a)];
      const Fg = (p) => grad(F, p);
      const onNeck = (a, y, off) => { const d = rh(a), p = hit(F, add(axis(y), d, 0.2), [-d[0], 0, -d[2]], 0.25) || add(axis(y), d, 0.05); return add(p, Fg(p), off); };
      const hs = (a) => lerp(0.010, 0.016, sm(PI / 2, PI, Math.abs(a)));
      const yE = (a) => prof([[0.0, 1.318], [0.95, 1.326], [PI / 2, 1.336], [PI, 1.343]], Math.abs(a));
      const rings = [], wts = [], uvs = [];
      for (let i = 0; i <= NUC; i++) {
        const u = -1 + 2 * i / NUC, sg = u < 0 ? -1 : 1, au = Math.abs(u), a = sg * (PI - (PI - CA0) * au), aE = a + sg * 0.34 * sm(0.55, 1.0, au);
        const d = rh(a), B = onNeck(a, seam(a) - 0.002, 0.0040), T = onNeck(a, seam(a) + hs(a), 0.0040);
        const K = add(add(T, d, 0.0045), [0, 1, 0], 0.0028);
        const dE = rh(aE), pE = hit(F, add(axis(yE(aE)), dE, 0.25), [-dE[0], 0, -dE[2]], 0.3), E = add(pE, Fg(pE), 0.0118);
        const C = [K[0] + (E[0] - K[0]) * 0.55, K[1] - 0.002, K[2] + (E[2] - K[2]) * 0.55];
        const path = [B, add(B, T, 1).map((v) => v / 2), T, K];
        for (let k = 1; k <= 9; k++) { const t = k / 9, q = (1 - t) * (1 - t), w = 2 * t * (1 - t), r = t * t; path.push([q * K[0] + w * C[0] + r * E[0], q * K[1] + w * C[1] + r * E[1], q * K[2] + w * C[2] + r * E[2]]); }
        // the section's thickness: offset each point along the section's left normal (in the plane of d and up)
        const L = path.map((p, k) => { const pa = path[Math.max(0, k - 1)], pb = path[Math.min(path.length - 1, k + 1)];
          const tr = (pb[0] - pa[0]) * d[0] + (pb[2] - pa[2]) * d[2], ty = pb[1] - pa[1], n = Math.hypot(tr, ty) || 1; return [-ty / n, tr / n]; });
        const ring = [];
        for (let k = 0; k < path.length; k++) { const [nr, ny] = L[k]; ring.push([path[k][0] + d[0] * nr * TH, path[k][1] + ny * TH, path[k][2] + d[2] * nr * TH]); }
        for (let k = path.length - 1; k >= 0; k--) { const [nr, ny] = L[k]; ring.push([path[k][0] - d[0] * nr * TH, path[k][1] - ny * TH, path[k][2] - d[2] * nr * TH]); }
        rings.push(ring);
      }
      const g = orient(W.loft(rings, { capA: true, capB: true }), rings);
      const wSkin = (x, y, z) => { const p = [x, y, z], f = F(x, y, z), n = Fg(p); return W.wBody(x - n[0] * f, y - n[1] * f, z - n[2] * f); };
      W.part('c1Collar', g, wSkin, { mat: linenD });
    }

    // ======================= the sleeves: loose linen from her shoulder, rolled up in two thick rolls just below her elbow =======================
    const SLC = 0.226, CE = 0.274, NSU = 40;
    function sleeveRings(S) {
      const out = [], sls = [];
      const ease = (sl, a) => {
        const ca = Math.cos(a), sa = Math.sin(a), lo = sm(0.0, 0.12, sl);
        let e = 0.0045 + 0.012 * sm(-0.03, 0.03, sl) * Math.max(0, ca) * (1 - 0.5 * lo)
          + 0.010 * lo + 0.008 * lo * Math.max(0, -ca) + 0.006 * lo * Math.max(0, sa) + 0.011 * lo * Math.max(0, -sa);
        if (sl > SLC - 0.04) e = lerp(e, 0.0065, sm(SLC - 0.04, SLC, sl));        // gathered into the roll
        if (sl > SLC) { const u = (sl - SLC) / (CE - SLC); e = 0.0060 + 0.0080 * Math.pow(Math.abs(Math.sin(PI * 2 * u)), 0.55); }
        return e;
      };
      const pt = (sl, a, e) => {
        const p = W.armPt(S, sl, a), c0 = W.armPt(S, sl, 0), c1 = W.armPt(S, sl, PI), c2 = W.armPt(S, sl, PI / 2), c3 = W.armPt(S, sl, 3 * PI / 2);
        const c = [(c0[0] + c1[0] + c2[0] + c3[0]) / 4, (c0[1] + c1[1] + c2[1] + c3[1]) / 4, (c0[2] + c1[2] + c2[2] + c3[2]) / 4];
        return add(p, norm([p[0] - c[0], p[1] - c[1], p[2] - c[2]]), e);
      };
      const N0 = 12, SL0 = -0.046;
      for (let i = 0; i <= N0; i++) sls.push(SL0 + (0.03 - SL0) * (1 - Math.cos(PI / 2 * i / N0)));
      for (let sl = 0.038; sl < SLC - 0.001; sl += 0.008) sls.push(sl);
      for (let sl = SLC; sl < CE - 1e-6; sl += 0.0024) sls.push(sl);
      sls.push(CE);
      for (const sl of sls) { const r = []; for (let j = 0; j < NSU; j++) { const a = (j / NSU) * TAU; r.push(pt(sl, a, ease(sl, a))); } out.push(r); }
      // the roll's lower edge turns in to her arm
      const meta = sls.slice();
      for (const [dsl, e] of [[0.0016, 0.0032], [0.0018, 0.0012]]) { const sl = CE + dsl, r = []; for (let j = 0; j < NSU; j++) r.push(pt(sl, (j / NSU) * TAU, e)); out.push(r); meta.push(sl); }
      return { rings: out, sls: meta };
    }
    const wSleeve = (S, sl, a) => sl < SLC - 0.03 ? W.mixW([W.BI['uarm' + S], 1], W.wArmSL(S, Math.max(sl, 0.03), a), 0.55 * sm(-0.01, 0.06, sl) + 0.45 * sm(SLC - 0.10, SLC - 0.03, sl)) : W.wArmSL(S, sl, a);
    for (const S of ['R', 'L']) {
      const sr = sleeveRings(S), g = W.loft(sr.rings, { capA: true }), cols = NSU + 1, nR = sr.rings.length;
      orient(g, sr.rings);
      W.part('c1Sleeve' + S, g, (x, y, z, i) => i < nR * cols ? wSleeve(S, sr.sls[Math.floor(i / cols)], ((i % cols) / NSU) * TAU) : wSleeve(S, sr.sls[0], 0), { mat: linen });
    }

    // ======================= the vest: fitted leather, laced up the front, ending at her waist; deep armholes =======================
    const vestHem = (x, z) => { const ax = Math.abs(x), front = sm(0.0, 0.05, z); return lerp(1.002, VEST_HEM_C + 0.010 * sm(0.0, 0.045, ax), front); };
    const vestTop = (x, z) => {
      const ax = Math.abs(x), front = sm(-0.03, 0.01, z);
      const fv = ax < 0.012 ? 1.205 : 1.205 + (ax - 0.012) * 1.65 + 0.010 * Math.sin(PI * cl((ax - 0.012) / 0.072, 0, 1));    // the V, a little scooped
      const bk = 1.352 + 0.012 * sm(0.05, 0.085, ax);
      const t = lerp(bk, fv, front);
      return lerp(t, 1.56, sm(0.080, 0.088, ax));
    };
    const armhole = (x, y, z) => {                        // > 0 inside the armhole
      const e = 1 - Math.pow((z + 0.014) / 0.064, 2) - Math.pow((y - 1.278) / 0.108, 2);
      return Math.min(e * 0.05, Math.abs(x) - 0.106);
    };
    const vestR = (x, y, z) => Math.max(vestHem(x, z) - y, y - vestTop(x, z), armhole(x, y, z), z > 0.02 ? 0.0115 - Math.abs(x) : -1);
    // the painted vest stands further out over her bust than her body does: a little more leather there
    const bustAdd = (x, y, z) => 0.006 * sm(0.02, 0.07, z) * Math.exp(-Math.pow((y - 1.215) / 0.06, 2));
    const vestTh = (x, y, z) => VEST_TH + bustAdd(x, y, z);
    const vestG = snugG(vestR, vestTh);
    W.snug('c1Vest', vestR, vestTh, [-0.20, 0.20, 0.97, 1.42, -0.16, 0.17], 0.0060, { mat: vestL });
    // the shirt is made only where it can be seen: not where the vest or the trousers always cover it
    W.snug('c1Shirt', (x, y, z) => Math.max(shirtR(x, y, z), 1.016 - y, -(vestR(x, y, z) + 0.013)), () => SHIRT_TH, [-0.21, 0.21, 1.0, 1.42, -0.15, 0.15], 0.0046, { mat: linen });
    // the lacing: brass eyelets either side of the opening, a cord crossing between them
    {
      const NE = 7, eps = [], cords = [], EY = [];
      for (let k = 0; k < NE; k++) { const y = lerp(1.198, 1.024, k / (NE - 1));
        for (const s of [-1, 1]) { const p = hit(vestG, [s * 0.020, y, 0.25], [0, 0, -1], 0.3); if (!p) continue; const n = grad(vestG, p);
          EY.push({ p: add(p, n, 0.0004), n, s, k }); eps.push(torus(add(p, n, 0.0004), n, 0.0026, 0.0009, 12, 6)); } }
      const E = (k, s) => EY.find((e) => e.k === k && e.s === s);
      const mid = (a, b, lift) => add([(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2, (a.p[2] + b.p[2]) / 2], norm(add(a.n, b.n, 1)), lift);
      for (let k = 0; k < NE - 1; k++) for (const s of [-1, 1]) { const a = E(k, s), b = E(k + 1, -s); if (!a || !b) continue;
        cords.push(tube([add(a.p, a.n, -0.0015), add(a.p, a.n, 0.0012), mid(a, b, s > 0 ? 0.0032 : 0.0022), add(b.p, b.n, 0.0012), add(b.p, b.n, -0.0015)], 0.0011, 5)); }
      { const a = E(0, -1), b = E(0, 1); if (a && b) cords.push(tube([add(a.p, a.n, -0.0015), add(a.p, a.n, 0.0012), mid(a, b, 0.0016), add(b.p, b.n, 0.0012), add(b.p, b.n, -0.0015)], 0.0011, 5)); }
      const wl = (x, y, z) => W.wBody(x, y, z - 0.012);
      W.part('c1VestEyelets', merge(eps), wl, { mat: brass });
      W.part('c1VestLace', merge(cords), wl, { mat: cord });
    }

    // ======================= the trousers: high-waisted, fitted, from under the vest into the boots =======================
    const BOOT_TOP = 0.436;
    const trouR = (x, y, z) => Math.max(y - TROU_TOP, BOOT_TOP - 0.040 - y);
    W.snug('c1Trousers', trouR, trouTh, [-0.22, 0.22, BOOT_TOP - 0.05, TROU_TOP + 0.012, -0.17, 0.16], 0.0070, { mat: canvas });

    // ======================= the belt: wide black leather, brass buckle; two pouches on her right hip =======================
    const beltUp = (z) => 0.026 * sm(0.04, -0.07, z);       // the painted belt rides higher behind her
    const beltR = (x, y, z) => Math.max(BELT_LO + beltUp(z) - y, y - BELT_HI - beltUp(z));
    const beltTh = () => 0.0108;
    const beltG = snugG(beltR, beltTh);
    W.snug('c1Belt', beltR, beltTh, [-0.22, 0.22, BELT_LO - 0.01, BELT_HI + 0.036, -0.17, 0.16], 0.0042, { mat: beltL });
    const HIPS = W.wBone('hips');
    {
      const bc = hit(beltG, [0.004, (BELT_LO + BELT_HI) / 2, 0.3], [0, 0, -1]), n = grad(beltG, bc), t = norm(cross([0, 1, 0], n));
      const parts = [frame(add(bc, n, 0.0022), n, t, 0.056, 0.040, 0.0030), tube([add(add(bc, n, 0.0022), t, -0.0012), add(add(bc, n, 0.0050), t, 0.008), add(add(bc, n, 0.0040), t, 0.0255)], 0.0012, 6)];
      W.part('c1BeltBuckle', merge(parts), () => HIPS, { mat: brass });
    }
    // a pouch: a rounded box standing on the belt, its back against her hip, a flap over its top with a brass snap
    {
      const box = [], snaps = [];
      const P = [{ x: -0.136, w: 0.064, top: 0.978, bot: 0.882, d: 0.034 }, { x: -0.078, w: 0.050, top: 0.972, bot: 0.893, d: 0.030 }];
      const pG = [], recs = [];
      for (const q of P) {
        const yc = (q.top + q.bot) / 2, back = hit(beltG, [q.x, (BELT_LO + BELT_HI) / 2, 0.3], [0, 0, -1]), n0 = grad(beltG, back);
        const n = norm([n0[0], 0, n0[2]]), t = norm(cross([0, 1, 0], n)), c = add(back, n, q.d / 2 - 0.004);
        const hw = q.w / 2, hh = (q.top - q.bot) / 2, hd = q.d / 2, cy = q.bot + hh;
        const G = (x, y, z) => { const dx = x - c[0], dz = z - c[2], u = dx * t[0] + dz * t[2], v = y - cy, w = dx * n[0] + dz * n[2];
          const qx = Math.abs(u) - (hw - 0.007), qy = Math.abs(v) - (hh - 0.007), qz = Math.abs(w) - (hd - 0.007);
          const box = Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - 0.007;
          // the flap: a slightly thicker lid over the top third, its edge a step
          const flap = Math.max(hh - 0.034 - v, w - hd - 0.0018, -hd - w, Math.abs(u) - hw - 0.0012, v - hh - 0.0015);
          return Math.min(box, flap); };
        recs.push({ G, c, n, t, cy, hh, hd, q });
        pG.push(G);
      }
      const GG = (x, y, z) => Math.min(pG[0](x, y, z), pG[1](x, y, z));
      W.surface('c1Pouches', GG, [-0.21, -0.03, 0.87, 0.99, 0.0, 0.17], 0.0038, () => HIPS, { mat: pouchL });
      for (const r of recs) { const p = add(add([r.c[0], r.cy + r.hh - 0.024, r.c[2]], r.n, r.hd + 0.0018), [0, 0, 0], 0);
        snaps.push(torus(p, r.n, 0.0030, 0.0018, 12, 6)); }
      W.part('c1PouchSnaps', merge(snaps), () => HIPS, { mat: brass });
    }

    // ======================= the boots: tall black leather to just below her knees, flat heels, three buckled straps outside =======================
    const LAST = [[-0.074, [-0.012, 0.012, 0.042]], [-0.066, [-0.028, 0.026, 0.058]], [-0.046, [-0.036, 0.034, 0.070]], [-0.020, [-0.038, 0.037, 0.079]], [0.010, [-0.040, 0.038, 0.089]],
      [0.040, [-0.041, 0.043, 0.088]], [0.070, [-0.043, 0.051, 0.072]], [0.100, [-0.046, 0.056, 0.052]], [0.118, [-0.047, 0.056, 0.046]], [0.133, [-0.046, 0.049, 0.042]],
      [0.147, [-0.042, 0.036, 0.038]], [0.160, [-0.032, 0.018, 0.034]], [0.170, [-0.014, -0.002, 0.030]]];     // the toe drawn in to the painted boots' length
    const S0 = W.SOLE, L2 = [0, 0];
    const lastD = (X, Y, Z) => {
      const v0 = prof(LAST, Z - 0.007), v1 = prof(LAST, Z), v2 = prof(LAST, Z + 0.007), v = [0, 1, 2].map((k) => (v0[k] + 2 * v1[k] + v2[k]) / 4), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.012, ry = Math.max(0.004, v[2] - 0.012);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.016, q = Math.pow(Math.pow(ux, 2.6) + Math.pow(uy, 2.6), 1 / 2.6);
      return Math.max((q - 1) * Math.min(rx, Y > yc ? ry : 0.016), -0.076 - Z, Z - 0.173);
    };
    const archLift = (Z) => 0.0080 * sm(-0.030, -0.022, Z) * sm(0.085, 0.050, Z);
    const EX = (y) => prof([[0.08, 0.020], [0.16, 0.020], [0.26, 0.018], [0.36, 0.016], [0.44, 0.014]], y);
    const EZ = (y) => prof([[0.08, 0.014], [0.16, 0.014], [0.26, 0.012], [0.36, 0.011], [0.44, 0.010]], y);
    const shaft = (s, x, y, z) => {
      const L = W.legAt(cl(y, 0.10, 0.60)), cx = s * L[3], cz = L[4], rx = L[0] + EX(y), rf = L[1] + EZ(y), rb = L[2] + EZ(y);
      const dx = (x - cx) / rx, dz = (z - cz) / (z > cz ? rf : rb), q = Math.pow(Math.pow(Math.abs(dx), 2.4) + Math.pow(Math.abs(dz), 2.4), 1 / 2.4);
      return (q - 1) * Math.min(rx, rf, rb);
    };
    const bootTop = (s, x, z) => BOOT_TOP + 0.004 * sm(0.0, -0.05, z - W.legAt(BOOT_TOP)[4]);
    const bootG = {};
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const leg = (x, y, z) => smin(shaft(s, x, y, z), DOLL.fLegOnly(s, x, y, z) - 0.0060, 0.008);
      const upper = (x, y, z) => {
        if (y > 0.16) { const sh = shaft(s, x, y, z); if (sh > 0.016) return smax(sh, y - bootTop(s, x, z), 0.0030); }      // far from her leg and above the foot: the shaft alone
        DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const l = y > 0.040 ? leg(x, y, z) + 0.5 * Math.max(0, 0.11 - y) : 1, top = bootTop(s, x, z) - 0.024 * sm(-0.0035, -0.0095, l);       // the opening: the rim rounds over and drops inside
        return smax(y > 0.16 ? l : smin(l, lastD(X, y, Z), 0.020), y - top, 0.0030); };
      const sole = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const plan = lastD(X, S0 + 0.012, Z) - 0.0030, yb = S0 - LIFT + archLift(Z), yt = S0 + 0.008;
        return smax(plan, Math.max(yb - y, y - yt), 0.0040); };
      const G = (x, y, z) => Math.min(upper(x, y, z), sole(x, y, z));
      bootG[S] = upper;
      const keep = (x, y, z) => !(y > 0.07 && DOLL.fLegOnly(s, x, y, z) < -0.002);
      const bx = s < 0 ? [-0.17, -0.005] : [0.005, 0.17];
      W.surface('c1Boot' + S, G, [bx[0], bx[1], S0 - LIFT - 0.006, BOOT_TOP + 0.010, -0.10, 0.22], 0.0058, (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z), { mat: bootL, keep });
      // three straps round the outside of the shaft, each with a brass buckle
      const SY = [0.368, 0.300, 0.232], AC = -0.42, AW = 0.60, HB = 0.0068;
      const angOf = (x, y, z) => { const L = W.legAt(cl(y, 0.10, 0.60)); return Math.atan2(z - L[4], s * (x - s * L[3])); };
      const strapR = (x, y, z) => { let best = 9; for (const yk of SY) best = Math.min(best, Math.abs(y - yk) - HB); return Math.max(best, (Math.abs(angOf(x, y, z) - AC) - AW) * 0.055); };
      const GS = (x, y, z) => { const r = strapR(x, y, z); return r > 0.005 ? r : smax(upper(x, y, z) - 0.0026, r, 0.0012); };
      W.surface('c1BootStraps' + S, GS, s < 0 ? [-0.175, -0.07, 0.215, 0.385, -0.10, 0.03] : [0.07, 0.175, 0.215, 0.385, -0.10, 0.03], 0.0030, (x, y, z) => W.wBody(x, y, z), { mat: bootL, keep: (x, y, z) => upper(x, y, z) > -0.0015 });
      const bk = [];
      for (const yk of SY) {
        const L = W.legAt(yk), d = [s * Math.cos(AC), 0, Math.sin(AC)], c0 = [s * L[3] + d[0] * 0.12, yk, L[4] + d[2] * 0.12];
        const p = hit(GS, c0, [-d[0], 0, -d[2]], 0.2); if (!p) continue; const n = grad(GS, p), t = norm(cross([0, 1, 0], n));
        bk.push(frame(add(p, n, 0.0016), n, t, 0.019, 0.017, 0.0016));
        bk.push(tube([add(add(p, n, 0.0010), t, -0.0075), add(add(p, n, 0.0034), t, 0.0), add(add(p, n, 0.0024), t, 0.0065)], 0.0009, 5));
      }
      W.part('c1BootBuckles' + S, merge(bk), (x, y, z) => W.wBody(x, y, z), { mat: brass });
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // ======================= the gloves: fingerless brown leather =======================
    // Her hands are fine meshes that cannot be reshaped: each hand lends a two-tone material while worn, leather over her palm, the back
    // of her hand, her thumb to its middle and her fingers to halfway along their first joints, her own skin beyond (decided per point by
    // the bones that carry it and how far along her hand it lies). A real leather cuff round her wrist gives the glove its edge there.
    for (const [S, key] of [['R', 'handR'], ['L', 'hand']]) {
      const m = W.meshes[key]; if (!m) continue;
      const base = m.material, mat = base.clone(), ob = base.onBeforeCompile;
      const d = W.armDir[S], wr = W.restPts['wr' + S], D = new W.THREE.Vector3(d.x, d.y, d.z), WR = new W.THREE.Vector3(wr.x, wr.y, wr.z);
      const al = (b) => { const r = W.SK[b + S].userData.rest; return (r.x - wr.x) * d.x + (r.y - wr.y) * d.y + (r.z - wr.z) * d.z; };
      const fb = [], fc = [];
      for (const f of ['idx', 'mid', 'rng', 'pnk']) { fb.push(W.BI[f + '0' + S]); fc.push(al(f + '0') + 0.42 * (al(f + '1') - al(f + '0'))); }
      fb.push(W.BI['thb1' + S]); fc.push(al('thb1') + 0.45 * (al('thb2') - al('thb1')));
      const full = [W.BI['hand' + S], W.BI['farm' + S], W.BI['ftw' + S], W.BI['thb0' + S]];
      const U = { uGB: { value: new W.THREE.Vector4(...full) }, uFB: { value: fb }, uFC: { value: fc }, uD: { value: D }, uWr: { value: WR }, uGC: { value: W.lin('#4f3121') } };
      mat.onBeforeCompile = (sh, r) => {
        if (ob) ob.call(base, sh, r);
        Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform vec4 uGB; uniform float uFB[5]; uniform float uFC[5]; uniform vec3 uD; uniform vec3 uWr; varying float vGB; varying float vGF; varying float vGC; varying float vAl;')
          .replace('#include <begin_vertex>', `#include <begin_vertex>
            { float gB = 0.0, gF = 0.0, gC = 0.0;
              for (int k = 0; k < 4; k++) { float bi = skinIndex[k], w = skinWeight[k];
                if (abs(bi - uGB.x) < 0.5 || abs(bi - uGB.y) < 0.5 || abs(bi - uGB.z) < 0.5 || abs(bi - uGB.w) < 0.5) gB += w;
                for (int f = 0; f < 5; f++) if (abs(bi - uFB[f]) < 0.5) { gF += w; gC += w * uFC[f]; } }
              vGB = gB; vGF = gF; vGC = gF > 0.001 ? gC / gF : 0.0; vAl = dot(position - uWr, uD); }`);
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uGC; varying float vGB; varying float vGF; varying float vGC; varying float vAl;')
          .replace('#include <map_fragment>', `#include <map_fragment>
            float gCov = vGB + vGF * (1.0 - smoothstep(vGC - 0.0012, vGC + 0.0012, vAl));
            float gM = smoothstep(0.40, 0.60, gCov);
            float gEdge = 1.0 - 0.35 * smoothstep(0.78, 0.55, gCov) * gM;
            vec3 gLeather = uGC * gEdge;
            diffuseColor.rgb = mix(diffuseColor.rgb, gLeather, gM);`)
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance = mix(totalEmissiveRadiance, uGC * 0.30, gM);')
          .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.55, gM);');
      };
      mat.customProgramCacheKey = () => 'c1glove' + S;
      W.swapMat(key, mat);
      // the cuff: leather round her wrist, from 3 cm above it, its upper edge lying on her skin
      W.sleeve('c1GloveCuff' + S, S, 0.392, 0.462, (sl, a) => 0.0004 + 0.0022 * sm(0.392, 0.400, sl), { mat: glovePlain, nu: 32, ns: 18 });
    }

    // ======================= the goggles: brass rims, amber lenses, pushed up on her forehead; the strap round her head =======================
    {
      const H = W.hair, HC = [H.HCX.x, H.HCX.y, H.HCX.z], HAIR = 0.012;
      const surfR = (dir) => { const ph = Math.acos(cl(dir[1], -1, 1)), th = Math.atan2(dir[0], dir[2]); return H.SKR(th, ph) + HAIR; };
      const headG = (x, y, z) => { const v = [x - HC[0], y - HC[1], z - HC[2]], L = Math.hypot(v[0], v[1], v[2]) || 1e-6; return L - surfR([v[0] / L, v[1] / L, v[2] / L]); };
      const HEAD = W.wBone('head'), rims = [], lens = [], cups = [], LX = 0.034, LY = 1.586, LZ = 0.074, RR = 0.0215;
      const cupsAt = [];
      for (const s of [-1, 1]) {
        const dir = norm([s * LX - HC[0], LY - HC[1], LZ - HC[2]]), base = add(HC, dir, surfR(dir)), n = norm(add(dir, [s * 0.12, 0.02, 0.45], 1)), c = add(base, n, 0.013);
        cupsAt.push({ s, base, n, c });
        rims.push(torus(c, n, RR, 0.0034, 28, 8));
        // the cup: a short tube from her hair to the rim, a little narrower at the back
        const [u, v] = perp(n), rings = [];
        for (const [k, rr] of [[-0.004, 0.0170], [0.004, 0.0195], [0.012, 0.0205], [0.0135, 0.0185]]) { const ring = []; for (let j = 0; j < 24; j++) { const a = (j / 24) * TAU; ring.push(add(add(add(base, n, k), u, rr * Math.cos(a)), v, rr * Math.sin(a))); } rings.push(ring); }
        cups.push(orient(W.loft(rings, { capA: true }), rings));
        // the lens: a shallow dome inside the rim
        const lr = []; for (const [k, rr] of [[0.0, 0.0195], [0.0016, 0.0170], [0.0027, 0.0120], [0.0033, 0.0060], [0.0035, 0.0008]]) { const ring = []; for (let j = 0; j < 24; j++) { const a = (j / 24) * TAU; ring.push(add(add(add(c, n, k), u, rr * Math.cos(a)), v, rr * Math.sin(a))); } lr.push(ring); }
        lens.push(orient(W.loft(lr, { capB: true }), lr));
      }
      // the bridge between the lenses
      { const a = cupsAt[0], b = cupsAt[1], ia = add(a.c, norm([b.c[0] - a.c[0], b.c[1] - a.c[1], b.c[2] - a.c[2]]), RR), ib = add(b.c, norm([a.c[0] - b.c[0], a.c[1] - b.c[1], a.c[2] - b.c[2]]), RR);
        const m = add([(ia[0] + ib[0]) / 2, (ia[1] + ib[1]) / 2, (ia[2] + ib[2]) / 2], norm(add(a.n, b.n, 1)), -0.002); rims.push(tube([ia, m, ib], 0.0022, 6)); }
      W.part('c1GoggleRims', merge(rims), () => HEAD, { mat: brass });
      W.part('c1GoggleCups', merge(cups), () => HEAD, { mat: W.std({ color: W.lin('#3b2a1e'), roughness: 0.55, metalness: 0.2 }) });
      W.part('c1GoggleLenses', merge(lens), () => HEAD, { mat: amber });
      // the strap: a leather band round her head in a tilted ring, from the rims at her forehead to under the bun at the back
      const YF = 1.590, YB = 1.498, YM = (YF + YB) / 2, YA = (YF - YB) / 2, BW = 0.0068, BT = 0.0011;
      const ringPt = (t) => { const y = YM + YA * Math.cos(t), dir0 = [Math.sin(t), 0, Math.cos(t)], o = [0, y, HC[2]];
        const p = hit(headG, add(o, dir0, 0.2), [-dir0[0], 0, -dir0[2]], 0.2) || add(o, dir0, 0.08); return add(p, dir0, 0.0060 + 0.0030 * Math.pow(Math.sin(t), 2)); };
      const pts = [], t0 = 0.95;
      for (let k = 0; k <= 60; k++) pts.push(ringPt(t0 + (TAU - 2 * t0) * k / 60));
      // join the ends to the outer sides of the cups
      for (const cu of cupsAt) { const out = add(cu.c, [cu.s, 0, 0], RR + 0.002), end = cu.s > 0 ? pts[0] : pts[pts.length - 1];
        const seg = [out, add([(out[0] + end[0]) / 2, (out[1] + end[1]) / 2, (out[2] + end[2]) / 2], [cu.s, 0, 0], 0.002)];
        if (cu.s > 0) pts.unshift(seg[0], seg[1]); else pts.push(seg[1], seg[0]); }
      const P = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tg = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
        const out = norm([p[0] - HC[0], 0, p[2] - HC[2]]), w = norm(cross(tg, out)), n = norm(cross(w, tg)); return { p, w, n }; });
      const rings = P.map((q) => { const ring = []; for (let j = 0; j < 10; j++) { const a = (j / 10) * TAU, ca = Math.cos(a), sa = Math.sin(a);
        ring.push(add(add(q.p, q.w, BW * Math.sign(ca) * Math.pow(Math.abs(ca), 0.3)), q.n, BT * Math.sign(sa) * Math.pow(Math.abs(sa), 0.3))); } return ring; });
      W.part('c1GoggleStrap', orient(W.loft(rings, { capA: true, capB: true }), rings), () => HEAD, { mat: strapM });
      { const q = P[Math.round(P.length / 2)], t = norm(cross(q.w, q.n)); W.part('c1GoggleBuckle', frame(add(q.p, q.n, 0.0016), q.n, t, 0.017, 0.016, 0.0013), () => HEAD, { mat: brass }); }
    }

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'dollFoot', 'toenail']);
    W.hideSkin((x, y, z) => shirtR(x, y, z) < -0.012 || (y < 1.0 && y > BOOT_TOP - 0.03), ['dollTrunk', 'dollLeg']);
    W.hideSkin((x, y, z) => y < BOOT_TOP - 0.014, ['dollLeg']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl < SLC - 0.035; }, ['arm']);

    // ======================= reading the paintings =======================
    W.afterPaint((parts) => {
      for (const pr of parts) {
        const g = pr.mesh.geometry, A = g.attributes.aPP; if (!A) continue;
        const P = g.attributes.position.array;
        if (/^c1(Boot[RL]|BootStraps[RL]|Trousers)$/.test(pr.key)) {
          // the painted legs stand further apart than hers: below her crotch, the front and back paintings are read further out
          for (let i = 0; i < A.count; i++) { const y = P[i * 3 + 1], k = sm(0.86, 0.74, y); const x = A.array[i * 3];
            A.array[i * 3] += Math.sign(x) * LEGX(y) * k; A.array[i * 3 + 2] += LEGZ(y); }
          A.needsUpdate = true;
        }
        const E = g.attributes.aPE;
        if (pr.key === 'c1Shirt' || pr.key === 'c1Vest') {    // the edges of the open V read a little away from the opening (not her skin, not the shirt)
          const sh = pr.key === 'c1Shirt';
          for (let i = 0; i < A.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]; if (z < 0.0 || y < 1.19) continue;
            const ax = Math.abs(x), edge = sh ? (y - 1.236) / 4.0 : 0.012 + (y - 1.205) / 1.65, k = sm(0.014, 0.0, ax - edge) * sm(1.19, 1.21, y);
            A.array[i * 3] += Math.sign(x) * 0.007 * k; if (!sh) A.array[i * 3 + 1] -= 0.004 * k; }
          A.needsUpdate = true; }
        if (pr.key === 'c1Vest') {                    // the side painting has her sleeve over the vest's top: the front and back paint it there
          for (let i = 0; i < A.count; i++) { const y = P[i * 3 + 1]; E.array[i * 3 + 2] *= 1 - sm(1.20, 1.25, y); } E.needsUpdate = true; }
        if (pr.key === 'c1Collar') {                  // in front, the side painting has her neck where the collar is
          for (let i = 0; i < A.count; i++) { E.array[i * 3 + 2] *= sm(0.0, -0.03, P[i * 3 + 2]);
            // it reads the painting a little nearer her neck and higher, where the painted collar is
            const x = P[i * 3], z = P[i * 3 + 2]; A.array[i * 3] -= x * 0.18; A.array[i * 3 + 2] -= (z - NCZ) * 0.18; A.array[i * 3 + 1] += 0.004; }
          A.needsUpdate = true; E.needsUpdate = true; }
        // the side painting has her arm and hand hanging down her side, from her shoulder to her thigh: nothing else reads it there
        if (/^c1(Vest|Shirt|Trousers|Belt|Pouches|Collar)$/.test(pr.key)) {
          for (let i = 0; i < A.count; i++) { const y = P[i * 3 + 1], z = P[i * 3 + 2], zc = prof([[0.80, 0.025], [1.00, 0.005], [1.25, -0.020], [1.32, -0.025]], y), hw = prof([[0.80, 0.055], [1.00, 0.040], [1.25, 0.060]], y);
            const k = sm(0.98, 1.01, y) * sm(hw + 0.012, hw, Math.abs(z - zc)); E.array[i * 3 + 2] *= 1 - k; }
          E.needsUpdate = true; }
        // the back painting has a pouch at the back of her right hip that the front and side paintings do not: the trousers and belt behind
        // her right hip read the back painting a little nearer her middle
        if (/^c1(Trousers|Belt)$/.test(pr.key)) {
          for (let i = 0; i < A.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], k = sm(0.0, -0.03, z) * sm(-0.085, -0.105, x) * sm(0.865, 0.885, y) * sm(1.0, 0.99, y);
            A.array[i * 3] += 0.085 * k; }
          A.needsUpdate = true; }
        if (pr.key === 'c1Belt') {                    // its rounded edges read the belt, not what lies above and below it
          for (let i = 0; i < A.count; i++) { const y = P[i * 3 + 1] - beltUp(P[i * 3 + 2]); A.array[i * 3 + 1] += 0.004 * sm(BELT_LO + 0.005, BELT_LO, y) - 0.004 * sm(BELT_HI - 0.005, BELT_HI, y); }
          A.needsUpdate = true; }
        if (/^c1(Trousers|Belt)$/.test(pr.key)) {     // below her waist the side painting has her forearm, glove and the pouches over her hip: her sides read the painting behind them
          for (let i = 0; i < A.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], k = sm(0.09, 0.12, Math.abs(x)) * sm(0.62, 0.66, y) * sm(1.02, 0.99, y), z = A.array[i * 3 + 2];
            if (k > 0 && z > -0.11) A.array[i * 3 + 2] = lerp(z, -0.11 + (z + 0.11) * 0.2, k); }
          A.needsUpdate = true; }
        if (/^c1Sleeve[RL]$/.test(pr.key)) {           // the rolls read the painting a little further up her arm; the side painting's arm hangs elsewhere
          const S = pr.key.slice(-1), s = S === 'R' ? -1 : 1, up = [-s * Math.sin(30 * PI / 180), Math.cos(30 * PI / 180)];
          for (let i = 0; i < A.count; i++) { const f = W.armFrame(S, P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); E.array[i * 3 + 2] *= sm(-0.5, -0.1, Math.cos(f.a));
            // and read a little nearer the arm's middle, inside the painted sleeve
            const sl = Math.max(0.03, f.sl), c0 = W.armPt(S, sl, 0), c1 = W.armPt(S, sl, PI), k = 0.22 * sm(0.0, 0.05, f.sl);
            A.array[i * 3] += ((c0[0] + c1[0]) / 2 - P[i * 3]) * k; A.array[i * 3 + 1] += ((c0[1] + c1[1]) / 2 - P[i * 3 + 1]) * k; A.array[i * 3 + 2] += ((c0[2] + c1[2]) / 2 - P[i * 3 + 2]) * k; }
          E.needsUpdate = true;
          for (let i = 0; i < A.count; i++) { const sl = W.armFrame(S, P[i * 3], P[i * 3 + 1], P[i * 3 + 2]).sl, k = CUFF_UP * sm(SLC - 0.03, SLC, sl);
            A.array[i * 3] += up[0] * k; A.array[i * 3 + 1] += up[1] * k; } A.needsUpdate = true; }
      }
    });
    const CUFF_UP = 0.012;
    // the painted legs: their feet further apart than hers (front and back), and further back (side)
    function LEGX(y) { return prof([[0.05, 0.026], [0.21, 0.023], [0.40, 0.010], [0.53, 0.0]], y, true); }
    function LEGZ(y) { return prof([[0.05, -0.030], [0.21, -0.030], [0.53, -0.028], [0.80, -0.012], [0.95, 0.0]], y, true); }
  },
};
