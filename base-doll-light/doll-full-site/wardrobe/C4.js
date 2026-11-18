// C4, the shieldmaiden (C4A.png, C4B.png): a blue wool tunic to mid-thigh with long sleeves, a round neck and a woven red-and-cream
// trim at the neck, cuffs and hem; over it a fitted brown leather bodice laced up both sides, ending in a rounded edge over her hips;
// a wide brown leather belt with a brass buckle; a grey wool shawl-cowl over her shoulders, gathered round the back of her neck like a
// laid-down hood, its left side brought across her chest and pinned with a round brass brooch at her right collarbone, hanging to her
// elbows at the sides and a little lower behind; leather bracers on her forearms; loose dark-grey wool trousers tucked into tall brown
// leather boots with crossed straps, flat soles and low heels.
// Pieces: c4Tunic (the tunic's body, under everything above the belt), c4SleeveR/L, c4TunicSkirt (below the belt, on the soft chains),
// c4Vest, c4Belt, c4BeltBuckle, c4Cowl, c4Brooch, c4BracerR/L, c4Trousers, c4BootR/L (their crossed straps, the bodice's side lacing and
// the woven trims are the paintings' own).
// She stands on the boots' soles and heels: LIFT (C4_prep.json heel).
// The paintings' plum background is too close to the dark-grey trousers for the prep's outline: the prep reads agents/C4/C4A_clean.png,
// a copy with its background lifted (agents/C4/clean.py, from C1's), so run it as
//   python3 tools/outfit_prep.py C4 --img /home/claude/agents/C4/C4A_clean.png
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.C4 = {
  name: 'Shieldmaiden: wool tunic, laced leather bodice, belt, grey cowl, bracers, trousers, tall boots', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smin, smax, prof, DOLL } = W;
    const F = W.F, Fs = W.Fsnug;
    const LIFT = 0.014;
    // ----- materials -----
    const wool = W.paint({ rough: 0.95, emis: 0.26, env: 0.12 });
    const woolD = W.paint({ rough: 0.95, emis: 0.26, env: 0.12, double: true });
    const grey = W.paint({ rough: 0.97, emis: 0.26, env: 0.10 });
    const leather = W.paint({ rough: 0.55, emis: 0.24, env: 0.40 });
    const bootL = W.paint({ rough: 0.50, emis: 0.22, env: 0.50 });
    const trouW = W.paint({ rough: 0.96, emis: 0.24, env: 0.10 });
    const brass = W.std({ color: W.lin('#b8914a'), metalness: 0.85, roughness: 0.32, envMapIntensity: 1.1 });

    // ----- small geometry helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const perp = (n) => { const u = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])); return [u, cross(n, u)]; };
    const flipAll = (idx) => { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } };
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    function orient(g, rings) {                           // flip a loft's triangles if its middle ring faces inward
      const nor = W.computeNormals(g.pos, g.idx), m = Math.floor(rings.length / 2), r = rings[m], n = r.length, cols = n + 1;
      const c = r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]); let s = 0;
      for (let j = 0; j < n; j++) { const v = m * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) flipAll(g.idx);
      return g;
    }
    function tube(pts, r, NV, closed) {                   // a round bar along points (closed: a loop)
      NV = NV || 6; const rings = [], N = pts.length;
      for (let i = 0; i < N; i++) { const a = closed ? pts[(i - 1 + N) % N] : pts[Math.max(0, i - 1)], b = closed ? pts[(i + 1) % N] : pts[Math.min(N - 1, i + 1)], t = norm(sub(b, a)), [u, v] = perp(t), ring = [];
        for (let j = 0; j < NV; j++) { const p = (j / NV) * TAU; ring.push(add(add(pts[i], u, r * Math.cos(p)), v, r * Math.sin(p))); } rings.push(ring); }
      if (closed) rings.push(rings[0]);
      return orient(W.loft(rings, closed ? {} : { capA: true, capB: true }), rings);
    }
    // a rounded-rectangle frame (a buckle): centre c, face direction n, width direction t, outer width w, height h, bar radius r
    function frame(c, n, t, w, h, r) {
      const up = norm(cross(n, t)), pts = [], rc = Math.min(w, h) * 0.22, NC = 5;
      const cs = [[w / 2 - rc, h / 2 - rc, 0], [-(w / 2 - rc), h / 2 - rc, PI / 2], [-(w / 2 - rc), -(h / 2 - rc), PI], [w / 2 - rc, -(h / 2 - rc), 1.5 * PI]];
      for (const [cx, cy, a0] of cs) for (let k = 0; k <= NC; k++) { const a = a0 + (PI / 2) * k / NC; pts.push(add(add(c, t, cx + rc * Math.cos(a)), up, cy + rc * Math.sin(a))); }
      return tube(pts, r, 8, true);
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
    // Her body is the same on both sides: a piece that is too can be found on her left half only (half the time) and mirrored.
    // The half is cut at x = 0 and the points of its cut edge put on that plane, so the two halves meet exactly.
    function halfMesh(G, box, h, keep) {
      const g = W.snets(G, [-h * 1.01, box[1], box[2], box[3], box[4], box[5]], h), used = new Int32Array(g.nv).fill(-1), pos = [], nor = [], idx = [];
      const cut = new Uint8Array(g.nv);                   // the points of the triangles left out (beyond the middle): the cut edge
      for (let t = 0; t < g.tris.length; t += 3) if (g.pos[g.tris[t] * 3] + g.pos[g.tris[t + 1] * 3] + g.pos[g.tris[t + 2] * 3] < 0) for (let k = 0; k < 3; k++) cut[g.tris[t + k]] = 1;
      for (let t = 0; t < g.tris.length; t += 3) {
        const a = g.tris[t], b = g.tris[t + 1], c = g.tris[t + 2];
        if (g.pos[a * 3] + g.pos[b * 3] + g.pos[c * 3] < 0) continue;
        if (keep && !keep(a, b, c, g)) continue;
        for (const v of [a, b, c]) { if (used[v] < 0) { used[v] = pos.length / 3; const x = cut[v] ? 0 : Math.max(0, g.pos[v * 3]), nx = x === 0 ? 0 : g.nor[v * 3], L = Math.hypot(nx, g.nor[v * 3 + 1], g.nor[v * 3 + 2]) || 1;
          pos.push(x, g.pos[v * 3 + 1], g.pos[v * 3 + 2]); nor.push(nx / L, g.nor[v * 3 + 1] / L, g.nor[v * 3 + 2] / L); } idx.push(used[v]); }
      }
      return { pos, nor, idx };
    }
    const mirror = (g) => { const pos = g.pos.slice(), nor = g.nor.slice(), idx = g.idx.slice(); for (let i = 0; i < pos.length; i += 3) { pos[i] = -pos[i]; nor[i] = -nor[i]; } flipAll(idx); return { pos, nor, idx }; };
    const mergeN = (a, b) => { const n = a.pos.length / 3; return { pos: a.pos.concat(b.pos), nor: a.nor.concat(b.nor), idx: a.idx.concat(b.idx.map((i) => i + n)) }; };
    // a close-fitting piece (as W.snug makes it), found on her left half and mirrored
    function snugSym(key, R, th, box, h, o) {
      const G = snugG(R, th);
      const g = halfMesh(G, box, h, (a, b, c, g) => { let inside = 0; for (const v of [a, b, c]) if (F(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]) < -0.0012) inside++; return inside < 3; });
      const all = mergeN(g, mirror(g)), P = all.pos, Nn = all.nor, Wt = [];
      for (let v = 0; v < P.length / 3; v++) { const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2], f = F(x, y, z); Wt.push(W.wBody(x - Nn[v * 3] * f, y - Nn[v * 3 + 1] * f, z - Nn[v * 3 + 2] * f)); }
      return W.part(key, all, (x, y, z, i) => Wt[i], o);
    }

    // ======================= layers and heights =======================
    // thickness off her body: tunic 3.5 mm < trousers at her hips 5.5 mm < the tunic's skirt 9 mm < bodice 9.5 (13.5 over the skirt) < belt 18.5
    const TUN_TH = 0.0035, BELT_LO = 0.975, BELT_HI = 1.029, TROU_TOP = 1.000, BOOT_TOP = 0.334;

    // ======================= the tunic's body: a round neck with its woven band; under the bodice down to her hips =======================
    const NCZ = -0.016;
    const angN = (x, z) => Math.abs(Math.atan2(x, z - NCZ));             // 0 at the front, PI at the back
    const NECK = (x, z) => prof([[0, 1.350], [0.6, 1.353], [1.15, 1.362], [PI / 2, 1.368], [PI, 1.374]], angN(x, z), true);
    const tunTop = (x, z) => lerp(NECK(x, z), 1.56, sm(0.062, 0.080, Math.abs(x)));
    const tunR = (x, y, z) => Math.max(0.955 - y, y - tunTop(x, z));
    const tunTh = (x, y, z) => { const nk = NECK(x, z); return TUN_TH + 0.0016 * sm(nk - 0.016, nk - 0.006, y) * (1 - sm(0.062, 0.080, Math.abs(x))); };
    // below the bodice's top it is never seen: made only from 3.5 cm under it
    snugSym('c4Tunic', (x, y, z) => Math.max(tunR(x, y, z), 1.165 - y), tunTh, [-0.19, 0.19, 1.155, 1.40, -0.135, 0.12], 0.0055, { mat: wool });

    // ======================= the sleeves: from round her shoulder to her wrist, a cuff turned in at the wrist =======================
    const SLC = 0.452;
    const slTop = (a) => lerp(-0.036, 0.072, Math.pow((1 - Math.cos(a)) / 2, 1.4));
    const slOff = (sl, a) => 0.0042 + 0.0016 * sm(0.06, -0.03, sl) + 0.0014 * sm(0.0, 0.12, sl) * sm(0.30, 0.18, sl) * Math.max(0, -Math.sin(a)) + 0.0012 * sm(0.42, SLC, sl);
    for (const S of ['R', 'L']) {
      const NU = 40, rings = [], SLs = [];
      const ringAt = (f, e0, slFix) => { const ring = [], sls = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, sl = slFix != null ? slFix : lerp(slTop(a), SLC, f);
          const p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
          const d = norm(sub(p, ax)); ring.push(add(p, d, e0 != null ? e0 : slOff(sl, a))); sls.push([sl, a]); }
        rings.push(ring); SLs.push(sls); };
      const N1 = 46; for (let i = 0; i <= N1; i++) { const t = i / N1; ringAt(Math.pow(t, 1.15)); }
      ringAt(1, 0.0030, SLC + 0.0016); ringAt(1, 0.0016, SLC); ringAt(1, 0.0016, SLC - 0.020);
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('c4Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, SLC); const [sl, a] = SLs[r][j % NU];
        const wa = W.wArmSL(S, Math.max(sl, 0.0), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.35 * sm(0.03, -0.015, sl)) : wa; }, { mat: wool });
    }

    // ======================= the bracers: stiff leather round her forearms, standing over the sleeves =======================
    const BR0 = 0.288, BR1 = 0.430;
    for (const S of ['R', 'L']) {
      const NU = 40, rings = [], SLs = [];
      const off = (sl, a) => slOff(sl, a) + 0.0055 + 0.0035 * sm(0.40, 0.30, sl) + 0.0010 * Math.max(0, Math.cos(a));
      const ringAt = (sl, e) => { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI);
        const ax = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2]; ring.push(add(p, norm(sub(p, ax)), e(a))); } rings.push(ring); SLs.push(sl); };
      ringAt(BR0 + 0.004, (a) => slOff(BR0, a) + 0.0012);
      ringAt(BR0 + 0.0005, (a) => off(BR0, a) - 0.0022);
      ringAt(BR0, (a) => off(BR0, a) - 0.0008);
      const N = 30; for (let i = 0; i <= N; i++) { const sl = lerp(BR0 + 0.0015, BR1 - 0.0015, i / N); ringAt(sl, (a) => off(sl, a)); }
      ringAt(BR1, (a) => off(BR1, a) - 0.0008);
      ringAt(BR1 - 0.0005, (a) => off(BR1, a) - 0.0022);
      ringAt(BR1 - 0.004, (a) => slOff(BR1, a) + 0.0012);
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('c4Bracer' + S, g, (x, y, z, i) => W.wArmSL(S, SLs[Math.min(SLs.length - 1, Math.floor(i / cols))], ((i % cols) / NU) * TAU), { mat: leather });
    }

    // ======================= the bodice: fitted leather from under her arms to a rounded edge over her hips =======================
    const vestHem = (x, z) => { const ax = Math.abs(x), fr = sm(-0.05, 0.03, z); return lerp(0.913 + 0.022 * sm(0.0, 0.15, ax), 0.924 + 0.022 * sm(0.02, 0.16, ax), fr); };
    const vestTop = (x, z) => { const ax = Math.abs(x), fr = sm(-0.03, 0.03, z); return lerp(1.205, lerp(1.283, 1.200, sm(0.080, 0.112, ax)), fr); };
    const vestR = (x, y, z) => Math.max(vestHem(x, z) - y, y - vestTop(x, z));
    const bustAdd = (x, y, z) => 0.004 * sm(0.02, 0.07, z) * Math.exp(-Math.pow((y - 1.215) / 0.06, 2));
    const vestTh = (x, y, z) => 0.0095 + 0.0062 * sm(1.005, 0.985, y) + bustAdd(x, y, z);
    snugSym('c4Vest', vestR, vestTh, [-0.21, 0.21, 0.895, 1.30, -0.16, 0.16], 0.0058, { mat: leather });

    // ======================= the belt: wide leather over the bodice, a brass buckle a little left of her middle =======================
    const beltR = (x, y, z) => Math.max(BELT_LO - y, y - BELT_HI);
    const beltTh = () => 0.0185;
    const beltG = snugG(beltR, beltTh);
    snugSym('c4Belt', beltR, beltTh, [-0.22, 0.22, BELT_LO - 0.01, BELT_HI + 0.01, -0.17, 0.16], 0.0050, { mat: leather });
    const HIPS = W.wBone('hips');
    {
      const yc = (BELT_LO + BELT_HI) / 2, bc = hit(beltG, [0.013, yc, 0.3], [0, 0, -1]), n = grad(beltG, bc), t = norm(cross([0, 1, 0], n));
      const parts = [frame(add(bc, n, 0.0030), n, t, 0.064, 0.052, 0.0034),
        tube([add(add(bc, n, 0.0022), t, -0.0020), add(add(bc, n, 0.0060), t, 0.010), add(add(bc, n, 0.0048), t, 0.0285)], 0.0016, 6)];
      W.part('c4BeltBuckle', merge(parts), () => HIPS, { mat: brass });
    }

    // ======================= the trousers: loose wool, from her hips into the boots, bunched a little over the boot tops =======================
    const trouTh = (x, y, z) => lerp(0.0055, lerp(0.0120, 0.0150, sm(0.66, 0.60, y)), sm(0.86, 0.78, y)) + 0.0035 * Math.exp(-Math.pow((y - (BOOT_TOP + 0.040)) / 0.035, 2)) - 0.0110 * sm(BOOT_TOP + 0.004, BOOT_TOP - 0.016, y);
    const trouR = (x, y, z) => Math.max(y - TROU_TOP, BOOT_TOP - 0.040 - y);
    snugSym('c4Trousers', trouR, trouTh, [-0.23, 0.23, BOOT_TOP - 0.05, TROU_TOP + 0.012, -0.18, 0.17], 0.0084, { mat: trouW });

    // ======================= the tunic's skirt: from under the bodice to mid-thigh, flaring a little, on the soft chains =======================
    const SKC = -0.014, SK_TOP = 1.000, HEM = 0.606;
    const NA = 72, YB0 = 1.02, YB1 = 0.60, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; const fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    const FL = [[1.00, [0.100, 0.060, 0.060]], [0.95, [0.140, 0.080, 0.090]], [0.88, [0.182, 0.120, 0.132]], [0.85, [0.188, 0.128, 0.136]], [0.75, [0.198, 0.143, 0.144]], [0.65, [0.207, 0.153, 0.150]], [0.60, [0.210, 0.156, 0.152]]];
    const flareR = (y, a) => { const v = prof(FL, y, true), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2]; return 1 / Math.sqrt((s / v[0]) * (s / v[0]) + (c / rz) * (c / rz)); };
    const clear = (y) => lerp(0.0080, 0.0140, sm(0.93, 0.85, y));
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), 0.020);
    const gAmp = (y) => lerp(0.0010, 0.0065, Math.pow(sm(SK_TOP - 0.05, HEM, y), 0.9));
    const fold = (a, y) => { const t = sm(SK_TOP, HEM, y), ph = 0.4 * t * Math.sin(2 * a + 0.4); return 0.7 * Math.sin(a * 15 + ph + 0.6 * Math.sin(a * 3)) + 0.3 * Math.sin(a * 26 + 1.3 + ph * 1.5); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    {
      const NU = 128, NV = 34, rings = [];
      const at = (y, a, dr) => { const r = skirtR(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(SK_TOP + 0.002, a, -0.003)); } rings.push(ring); }
      for (let i = 0; i <= NV; i++) { const t = i / NV, y = lerp(SK_TOP, HEM, t * t * 0.25 + t * 0.75), ring = []; for (let j = 0; j < NU; j++) ring.push(at(y, (j / NU) * TAU)); rings.push(ring); }
      { const r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; r1.push(at(HEM - 0.0015, a, -0.0030)); r2.push(at(HEM + 0.022, a, -0.0040)); } rings.push(r1, r2); }
      const g = orient(W.loft(rings, {}), rings);
      W.part('c4TunicSkirt', g, (x, y, z) => W.wSkirt(x, y, z), { mat: woolD });
    }

    // Her thighs and knees keep out of the skirt (squat, kneel, a long stride). On each of the skirt's twelve chains, joint by joint from the
    // top, points of the cloth (where it hangs at that chain, at the joint's tip and halfway along) are tested against her thighs and
    // shins (capsules, padded for the trousers); a point inside is moved the shorter way, out from her middle or up onto the leg, by
    // turning that stretch of the chain about its top, and the stretch below is turned back so it still hangs as it did. (As D6 does it.)
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.040;
      const legs = [];
      for (const S of ['R', 'L']) legs.push({ a: 'thigh' + S, b: 'shin' + S, ra: 0.084, rb: 0.058 }, { a: 'shin' + S, b: 'foot' + S, ra: 0.058, rb: 0.046 });
      for (const L of legs) { L.A = new T3.Vector3(); L.B = new T3.Vector3(); L.A0 = W.SK[L.a].userData.rest.clone(); L.B0 = W.SK[L.b].userData.rest.clone(); }
      const V = new T3.Vector3();
      const restRD = (p) => { const out = []; for (const L of legs) for (let j = 0; j <= 6; j++) out.push(V.copy(L.A0).lerp(L.B0, j / 6).distanceTo(p)); return out; };
      const JT = CH.map((c) => c.names.map((nm, k) => {
        const p0 = c.pts[k], p1 = c.pts[k + 1], pr = [];
        if (p0.y < HEM + 0.01) return pr;
        for (const y of [Math.max(p1.y, HEM), Math.max((p0.y + p1.y) / 2, HEM)]) {
          if (y > 0.98) continue;
          const r = skirtR(y, c.a), q = new T3.Vector3(r * Math.sin(c.a), y, SKC + r * Math.cos(c.a));
          pr.push({ off: q.clone().sub(p0), rd: restRD(q) }); }
        return pr; }));
      const H = new T3.Vector3(), Pw = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), D = new T3.Vector3(), v1 = new T3.Vector3(), v2 = new T3.Vector3();
      const qb = new T3.Quaternion(), qr = new T3.Quaternion(), pq = new T3.Quaternion(), cq = new T3.Quaternion(), tq = new T3.Quaternion();
      let LEV = null;
      const U = new T3.Vector3(), Wl = new T3.Vector3(), Nl = new T3.Vector3(), Cc = new T3.Vector3(), UP = new T3.Vector3(0, 1, 0);
      // over a level leg (a thigh held forward) the point goes onto the top of the padded leg, one stretch further toward its far end
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

    // ======================= the boots: tall brown leather to below her calves, flat soles, low heels =======================
    const LAST = [[-0.076, [-0.012, 0.012, 0.042]], [-0.068, [-0.028, 0.026, 0.058]], [-0.046, [-0.037, 0.035, 0.070]], [-0.020, [-0.039, 0.038, 0.079]], [0.010, [-0.041, 0.039, 0.089]],
      [0.040, [-0.042, 0.044, 0.088]], [0.070, [-0.044, 0.052, 0.072]], [0.100, [-0.047, 0.057, 0.052]], [0.120, [-0.048, 0.057, 0.046]], [0.137, [-0.047, 0.050, 0.042]],
      [0.152, [-0.043, 0.037, 0.038]], [0.166, [-0.033, 0.019, 0.034]], [0.177, [-0.014, -0.002, 0.030]]];
    const S0 = W.SOLE, L2 = [0, 0];
    const lastD = (X, Y, Z) => {
      const v0 = prof(LAST, Z - 0.007), v1 = prof(LAST, Z), v2 = prof(LAST, Z + 0.007), v = [0, 1, 2].map((k) => (v0[k] + 2 * v1[k] + v2[k]) / 4), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.012, ry = Math.max(0.004, v[2] - 0.012);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.016, q = Math.pow(Math.pow(ux, 2.6) + Math.pow(uy, 2.6), 1 / 2.6);
      return Math.max((q - 1) * Math.min(rx, Y > yc ? ry : 0.016), -0.078 - Z, Z - 0.180);
    };
    const archLift = (Z) => 0.0070 * sm(-0.030, -0.022, Z) * sm(0.085, 0.050, Z);
    const EX = (y) => prof([[0.08, 0.020], [0.16, 0.020], [0.26, 0.019], [0.34, 0.019]], y);
    const EZ = (y) => prof([[0.08, 0.014], [0.16, 0.014], [0.26, 0.014], [0.34, 0.014]], y);
    const shaft = (s, x, y, z) => {
      const L = W.legAt(cl(y, 0.10, 0.60)), cx = s * L[3], cz = L[4], rx = L[0] + EX(y), rf = L[1] + EZ(y), rb = L[2] + EZ(y);
      const dx = (x - cx) / rx, dz = (z - cz) / (z > cz ? rf : rb), q = Math.pow(Math.pow(Math.abs(dx), 2.4) + Math.pow(Math.abs(dz), 2.4), 1 / 2.4);
      return (q - 1) * Math.min(rx, rf, rb);
    };
    const bootTop = (s, x, z) => BOOT_TOP + 0.003 * sm(0.0, 0.05, z - W.legAt(BOOT_TOP)[4]);
    // the left boot is found on a grid, the right one is its mirror image
    {
      const s = 1, S = 'L';
      const leg = (x, y, z) => smin(shaft(s, x, y, z), DOLL.fLegOnly(s, x, y, z) - 0.0060, 0.008);
      const upper = (x, y, z) => {
        if (y > 0.16) { const sh = shaft(s, x, y, z); if (sh > 0.016) return smax(sh, y - bootTop(s, x, z), 0.0030); }
        DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const l = y > 0.040 ? leg(x, y, z) + 0.5 * Math.max(0, 0.11 - y) : 1, top = bootTop(s, x, z) - 0.024 * sm(-0.0035, -0.0095, l);
        return smax(y > 0.16 ? l : smin(l, lastD(X, y, Z), 0.020), y - top, 0.0030); };
      const sole = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const plan = lastD(X, S0 + 0.012, Z) - 0.0030, yb = S0 - LIFT + archLift(Z), yt = S0 + 0.008;
        return smax(plan, Math.max(yb - y, y - yt), 0.0040); };
      const G = (x, y, z) => Math.min(upper(x, y, z), sole(x, y, z));
      const g = W.snets(G, [0.014, 0.150, S0 - LIFT - 0.006, BOOT_TOP + 0.008, -0.098, 0.205], 0.0071), used = new Int32Array(g.nv).fill(-1), half = { pos: [], nor: [], idx: [] };
      for (let t = 0; t < g.tris.length; t += 3) { let ok = false; for (let k = 0; k < 3; k++) { const v = g.tris[t + k], y = g.pos[v * 3 + 1]; if (!(y > 0.07 && DOLL.fLegOnly(s, g.pos[v * 3], y, g.pos[v * 3 + 2]) < -0.002)) { ok = true; break; } } if (!ok) continue;
        for (let k = 0; k < 3; k++) { const v = g.tris[t + k]; if (used[v] < 0) { used[v] = half.pos.length / 3; half.pos.push(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]); half.nor.push(g.nor[v * 3], g.nor[v * 3 + 1], g.nor[v * 3 + 2]); } half.idx.push(used[v]); } }
      const wB = (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z);
      W.part('c4BootL', half, wB, { mat: bootL });
      W.part('c4BootR', mirror(half), wB, { mat: bootL });
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // ======================= the cowl =======================
    // A sheet of thick grey wool round her shoulders. At each angle round her (th: 0 her front, +PI/2 her left, +-PI her back) and height
    // it lies at radius rC(th, y) from the line x = 0, z = ZC: over what it covers (her tunic and bodice, and her arms where it drapes over
    // them), hanging (it cannot come in faster than it falls), with soft folds deepening toward its edge. Its top edge runs round her neck
    // (high at the back, where it is gathered like a laid-down hood); its lower edge crosses her chest from her left shoulder up to the
    // brooch at her right collarbone, where the cloth's front edge falls straight down beside her bodice, and hangs to her elbows at the
    // sides and a little lower behind. It is a closed band of cloth: each column's outline runs down its outside, round the lower edge,
    // and up its inside, round the top roll.
    const ZC = -0.020, TH = 0.0045;
    const armSD = (S, x, y, z) => {                      // her rest arm: roughly how far a point is outside its skin
      const f = W.armFrame(S, x, y, z), sl = cl(f.sl, -0.046, 0.456), p = W.armPt(S, sl, f.a), sh = W.restPts['sh' + S], d = W.armDir[S];
      const cx = sh.x + d.x * sl, cy = sh.y + d.y * sl, cz = sh.z + d.z * sl;
      return Math.hypot(x - cx, y - cy, z - cz) - Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz) + Math.max(0, f.sl - 0.456, -0.046 - f.sl);
    };
    const bodyOff = (y) => lerp(0.0110, 0.0200, sm(1.335, 1.295, y));
    const TY0 = 1.42, TDY = 0.005, TNY = Math.round((TY0 - 0.94) / TDY) + 1, TNA = 145, ENV = new Float32Array(TNY * TNA), ENVD = new Float32Array(TNY * TNA);
    const march = (G) => { let r = 0.40, g = G(r), st = 0.002; while (g > 0 && r > 0) { st = Math.max(0.7 * g, 0.0015); r -= st; g = G(r); }
      if (r <= 0) return 0; let lo = r, hi = r + st; for (let k = 0; k < 10; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };
    const thA = (ai) => -PI + (ai / (TNA - 1)) * TAU;
    for (let ai = 0; ai < TNA; ai++) {
      const th = thA(ai), sa = Math.sin(th), ca = Math.cos(th), S = sa < 0 ? 'R' : 'L';
      for (let yi = 0; yi < TNY; yi++) {
        const y = TY0 - yi * TDY, bo = bodyOff(y);
        const GD = (r) => Fs(sa * r, y, ZC + ca * r) - bo;
        const GA = (r) => Math.min(GD(r), armSD(S, sa * r, y, ZC + ca * r) - 0.0110);
        const rd = march(GD); ENVD[yi * TNA + ai] = rd; ENV[yi * TNA + ai] = Math.abs(sa) > 0.30 && y > 0.99 ? Math.max(rd, march(GA)) : rd;
      }
      for (let yi = 1; yi < TNY; yi++) for (const E of [ENV, ENVD]) E[yi * TNA + ai] = Math.max(E[yi * TNA + ai], E[(yi - 1) * TNA + ai] - 0.16 * TDY);      // it hangs
    }
    // where it goes out over a shoulder or her bust (wider below than above), a row is never narrower than the row under it: the table's
    // rows are 5 mm apart, and the cloth drawn straight from one to the next would otherwise cut the corner into what it covers
    for (let ai = 0; ai < TNA; ai++) for (let yi = 0; yi < TNY - 1; yi++) for (const E of [ENV, ENVD]) E[yi * TNA + ai] = Math.max(E[yi * TNA + ai], E[(yi + 1) * TNA + ai]);
    // smooth round her a little (the arms' edges), keeping it outside what it covers
    { const c = ENV.slice(); for (let yi = 0; yi < TNY; yi++) for (let ai = 0; ai < TNA; ai++) { let m = 0; for (let k = -2; k <= 2; k++) { const aj = (ai + k + TNA - 1) % (TNA - 1); m = Math.max(m, c[yi * TNA + aj] - 0.012 * Math.abs(k)); } ENV[yi * TNA + ai] = m; } }
    const tabAt = (E, th, y) => { const fy = cl((TY0 - y) / TDY, 0, TNY - 1.001), i = Math.floor(fy), u = fy - i; let t = ((th + PI) / TAU) % 1; if (t < 0) t += 1; const fa = t * (TNA - 1), j = Math.min(TNA - 2, Math.floor(fa)), v = fa - j;
      return lerp(lerp(E[i * TNA + j], E[i * TNA + j + 1], v), lerp(E[(i + 1) * TNA + j], E[(i + 1) * TNA + j + 1], v), u); };
    const envAt = (th, y) => tabAt(ENV, th, y), dressAt = (th, y) => tabAt(ENVD, th, y);
    // its edges, by angle round her (periodic keys from -PI to PI)
    const YTOP = [[-PI, 1.386], [-2.3, 1.380], [-1.6, 1.370], [-1.0, 1.352], [-0.62, 1.338], [-0.30, 1.326], [0.0, 1.316], [0.40, 1.332], [0.80, 1.350], [1.20, 1.358], [1.6, 1.370], [2.3, 1.380], [PI, 1.386]];
    const YHEM = [[-PI, 1.074], [-2.75, 1.065], [-2.40, 1.000], [-2.00, 0.985], [-1.75, 1.030], [-1.57, 1.105], [-1.42, 1.235], [-1.20, 1.268], [-0.85, 1.268], [-0.70, 1.280], [-0.60, 1.296],
      [-0.30, 1.276], [0.0, 1.255], [0.30, 1.250], [0.50, 1.245], [0.68, 1.238], [0.83, 1.230], [0.95, 1.222], [1.08, 1.210], [1.20, 1.175], [1.35, 1.125], [1.57, 1.115], [2.0, 1.125], [2.40, 1.075], [2.75, 1.072], [PI, 1.074]];
    const per = (K, th) => { let t = th; while (t > PI) t -= TAU; while (t < -PI) t += TAU; return prof(K, t, true); };
    const yTop = (th) => per(YTOP, th), yHem = (th) => per(YHEM, th);
    // folds: soft upright ones round her, deeper toward the edge; across her chest diagonal ones from the brooch to her left shoulder
    const foldAt = (th, y) => {
      const t = cl((yTop(th) - y) / Math.max(0.03, yTop(th) - yHem(th)), 0, 1);
      const up = (0.0024 + 0.0090 * t * t) * (0.5 + 0.5 * (0.6 * Math.sin(th * 13 + 0.8 * Math.sin(th * 3)) + 0.4 * Math.sin(th * 23 + 1.1)));      // folds only stand out: never into what it covers
      const chest = Math.exp(-Math.pow((th - 0.35) / 0.75, 2)), x = Math.sin(th) * 0.12, dg = 0.0050 * (0.5 + 0.5 * Math.sin((y + 0.45 * x) * 150 + 0.5)) * chest * sm(0.0, 0.35, t);
      return up * (1 - 0.7 * chest) + dg;
    };
    // how far it stands out from her: the paintings' outline (rest pose), wider than her arms and standing off her back, most behind her right arm
    const CXW = [[1.38, 0.05], [1.34, 0.10], [1.30, 0.150], [1.26, 0.182], [1.22, 0.195], [1.16, 0.200], [1.10, 0.204], [0.98, 0.206]];
    const CZB = [[1.40, 0.06], [1.36, 0.095], [1.32, 0.125], [1.28, 0.145], [1.22, 0.160], [1.14, 0.168], [1.04, 0.172], [0.98, 0.175]];
    const cFlare = (th, y) => { const s = Math.abs(Math.sin(th)), c = Math.cos(th), xw = prof(CXW, y, true), rz = c >= 0 ? 0.035 : prof(CZB, y, true) + 0.016 * sm(-1.4, -2.2, th) * sm(-3.0, -2.6, th) * sm(1.25, 1.10, y);
      return 1 / Math.pow(Math.pow(s / xw, 2.3) + Math.pow(Math.abs(c) / rz, 2.3), 1 / 2.3); };
    const rC = (th, y) => smax(envAt(th, y) + lerp(0.0040, 0.0018, sm(1.33, 1.37, y)) + 0.0030 * sm(1.30, 1.20, y), cFlare(th, y), 0.02) + foldAt(th, y);
    // the gathered top: thicker toward the back, a roll round her neck
    const rollT = (th) => lerp(0.0075, 0.019, Math.pow(sm(0.6, 2.6, Math.abs(th)), 1.2));
    const NUC = 150, NRO = 38;
    const wTrunkAt = (th, y) => { const re = Math.max(0.02, dressAt(th, y) - bodyOff(y) - 0.002), q = [re * Math.sin(th), y, ZC + re * Math.cos(th)]; return W.wBody(q[0], q[1], q[2]); };
    const wCowl = (p, th) => {
      let w = wTrunkAt(th, Math.max(p[1], 0.98));
      // over her shoulder and upper arm, her upper arm carries it
      const S = p[0] < 0 ? 'R' : 'L', f = W.armFrame(S, p[0], p[1], p[2]), dA = armSD(S, p[0], p[1], p[2]);
      // (all of it near her arm, on its outer side and over its front and back, wherever it stands off it: a raised arm lifts it with it)
      const wa = Math.max(sm(0.050, 0.022, dA), sm(0.115, 0.085, f.r) * sm(-0.75, -0.35, Math.cos(f.a))) * sm(-0.075, 0.000, f.sl) * 0.95;
      if (wa > 0.002) w = W.mixW(w, [W.BI['uarm' + S], 1], wa);
      return w;
    };
    const sections = []; let cowlN = 0;
    for (let j = 0; j < NUC; j++) {
      const th = -PI + (j / NUC) * TAU, y0 = yTop(th), y1 = yHem(th), sa = Math.sin(th), ca = Math.cos(th);
      const at = (y) => { const r = rC(th, y); return [r * sa, y, ZC + r * ca]; };
      const dense = []; for (let y = y0; y > y1; y -= 0.00125) dense.push(at(y)); dense.push(at(y1));
      const cum = [0]; for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1], dense[i][2] - dense[i - 1][2]));
      const L = cum[cum.length - 1], O = [], ss = [];
      let q = 1;
      for (let i = 0; i <= NRO; i++) { const u = L * Math.pow(i / NRO, 1.0); while (q < cum.length - 1 && cum[q] < u) q++; const f = cl((u - cum[q - 1]) / Math.max(1e-9, cum[q] - cum[q - 1]), 0, 1);
        const a = dense[q - 1], b = dense[q]; O.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)]); ss.push(u); }
      // the section's inward direction at each point (in the plane of the column): perpendicular to the cloth, toward her
      const hz = [sa, 0, ca], inw = O.map((p, i) => { const a = O[Math.max(0, i - 1)], b = O[Math.min(NRO, i + 1)], tr = (b[0] - a[0]) * sa + (b[2] - a[2]) * ca, ty = b[1] - a[1], n = Math.hypot(tr, ty) || 1;
        return [ty / n, -tr / n]; });                     // (radial, vertical) components, pointing in
      const R = rollT(th), ring = [], wr = [];
      const pt = (i, k) => { const p = O[i], [nr, ny] = inw[i]; return [p[0] + sa * nr * k, p[1] + ny * k, p[2] + ca * nr * k]; };
      // the outside, from the top down (the top roll stands out from the cloth)
      const rollOut = (s) => R * Math.pow(sm(0.045, 0.0, s), 1.0) - 0.0;
      for (let i = 0; i <= NRO; i++) ring.push(pt(i, -rollOut(ss[i]) + 0.0));
      // round the lower edge (a half circle the cloth's thickness across), then up the inside
      const arc = (i, k0, k1, dir, n) => { const [nr, ny] = inw[i], tr = dir * ny, ty = -dir * nr, rr = (k1 - k0) / 2, mk = (k0 + k1) / 2, p = O[i];      // (tr, ty): along the cloth, toward the edge
        for (let k = 1; k < n; k++) { const ang = PI * k / n, c = Math.cos(ang), s2 = Math.sin(ang), kk = mk - rr * c, kr = nr * kk + tr * Math.abs(rr) * s2 * 0.9, ky = ny * kk + ty * Math.abs(rr) * s2 * 0.9;
          ring.push([p[0] + sa * kr, p[1] + ky, p[2] + ca * kr]); } };
      arc(NRO, 0, TH, -1, 4);
      for (let i = NRO; i >= 0; i--) ring.push(pt(i, TH));
      // round the top roll: from the inside's top over to the outside's top
      arc(0, TH, -R, 1, 6);
      sections.push(ring);
    }
    sections.push(sections[0]);
    {
      const g = W.loft(sections, {}), n = sections[0].length, cols = n + 1; cowlN = n;
      // face outward: at the back middle the outside should face away from her
      { const nor = W.computeNormals(g.pos, g.idx), v = 0 * cols + Math.round(NRO / 2); if (nor[v * 3 + 2] > 0) flipAll(g.idx); }
      const N = g.pos.length / 3, wts = [];
      for (let v = 0; v < N; v++) { const p = [g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]], th = Math.atan2(p[0], p[2] - ZC); wts.push(wCowl(p, th)); }
      W.part('c4Cowl', g, (x, y, z, i) => wts[i], { mat: grey });
    }
    // the brooch: a round brass boss pinning the cowl at her right collarbone
    {
      const yB = 1.318, xB = -0.088; let th = Math.atan2(xB, 0.08); for (let k = 0; k < 6; k++) { const r = rC(th, yB); th = Math.asin(cl(xB / r, -1, 1)); }
      const r0 = rC(th, yB), c0 = [r0 * Math.sin(th), yB, ZC + r0 * Math.cos(th)], n = norm([Math.sin(th) * 0.6, 0.15, Math.cos(th)]), [u, vv] = perp(n);
      const PR = [[0, 0.0070], [0.0040, 0.0068], [0.0070, 0.0058], [0.0090, 0.0046], [0.0110, 0.0040], [0.0135, 0.0046], [0.0160, 0.0054], [0.0185, 0.0050], [0.0203, 0.0034], [0.0210, 0.0014], [0.0200, -0.001], [0.0001, -0.001]];
      const rings = PR.map(([r, h]) => { const ring = []; for (let j = 0; j < 36; j++) { const a = (j / 36) * TAU; ring.push(add(add(add(c0, n, h + 0.0022), u, r * Math.cos(a)), vv, r * Math.sin(a))); } return ring; });
      const g = W.loft(rings, {}); { const nor = W.computeNormals(g.pos, g.idx); if (dot([nor[0], nor[1], nor[2]], n) < 0) flipAll(g.idx); }
      const wb = wCowl(c0, th);
      W.part('c4Brooch', g, () => wb, { mat: brass });
    }

    // ======================= reading the paintings =======================
    // the painted legs stand further apart than hers (front and back) and further back (side)
    const LEGX = (y) => prof([[0.05, 0.036], [0.30, 0.035], [0.50, 0.033], [0.62, 0.026], [0.80, 0.0]], y, true);
    const LEGZ = (y) => prof([[0.05, -0.034], [0.30, -0.032], [0.45, -0.020], [0.60, -0.010], [0.80, 0.0]], y, true);
    // where the side painting has her arm, bracer and hand hanging over her side: [middle z, half width] by height
    const VESTW = [[0.92, 0.150], [0.96, 0.150], [1.00, 0.136], [1.06, 0.122], [1.12, 0.118], [1.20, 0.128], [1.28, 0.122]];
    const SKW = [[0.98, 0.160], [0.94, 0.168], [0.90, 0.176], [0.80, 0.189], [0.70, 0.200], [0.62, 0.207], [0.60, 0.208]];
    const ARMZ = [[0.70, [0.040, 0.046]], [0.80, [0.040, 0.046]], [0.86, [0.020, 0.040]], [0.95, [-0.010, 0.046]], [1.05, [-0.030, 0.050]], [1.25, [-0.035, 0.045]]];
    W.afterPaint((parts) => {
      for (const pr of parts) {
        const g = pr.mesh.geometry, A = g.attributes.aPP, E = g.attributes.aPE; if (!A) continue;
        const P = g.attributes.position.array, n = A.count;
        if (/^c4(Boot[RL]|Trousers)$/.test(pr.key)) {
          for (let i = 0; i < n; i++) { const y = P[i * 3 + 1], x = A.array[i * 3]; A.array[i * 3] += Math.sign(x) * LEGX(y); A.array[i * 3 + 2] += LEGZ(y); }
          A.needsUpdate = true; }
        if (pr.key === 'c4Vest' || pr.key === 'c4TunicSkirt') {      // the painted bodice and skirt are a little narrower than hers: read them within their painted width
          const K = pr.key === 'c4Vest' ? VESTW : SKW;
          for (let i = 0; i < n; i++) { const y = A.array[i * 3 + 1], w = prof(K, y, true), x = A.array[i * 3], f = Math.abs(x) / w; if (f > 0.8) A.array[i * 3] = Math.sign(x) * w * (0.8 + 0.2 * Math.tanh((f - 0.8) / 0.2)); }
          A.needsUpdate = true; }
        if (/^c4(Vest|Belt)$/.test(pr.key)) {      // the side painting has the cowl's tail hanging over her back hip: the bodice and belt read the back painting there
          for (let i = 0; i < n; i++) { const y = A.array[i * 3 + 1], z = A.array[i * 3 + 2], k = sm(-0.10, -0.125, z) * sm(0.875, 0.89, y) * sm(1.07, 1.05, y); if (k > 0) E.array[i * 3 + 2] *= 1 - k; }
          E.needsUpdate = true; }
        if (pr.key === 'c4TunicSkirt') {
          // The side painting's skirt is crossed by her hand, wrist and bracer, and by the cowl's tail above them; the clear stretch is behind her
          // hand, below the tail (the wardrobe's own cleaning of bare hands misses the painted hand: it hangs further forward than hers).
          // Above the hand's tips the skirt reads the side painting there, its whole depth drawn into that stretch.
          const PN = g.attributes.aPN;
          for (let i = 0; i < n; i++) { const y = A.array[i * 3 + 1], z = A.array[i * 3 + 2], k = sm(0.70, 0.725, y);
            if (k <= 0) continue; A.array[i * 3 + 1] = lerp(y, Math.min(y, 0.860), sm(0.35, 0.75, Math.abs(PN.array[i * 3]))); A.array[i * 3 + 2] = lerp(z, lerp(-0.105, -0.025, cl((z + 0.17) / 0.34, 0, 1)), k); }
          A.needsUpdate = true; }
        if (/^c4(Vest|Belt)$/.test(pr.key)) {      // the back painting sees her waist clear below the cowl
          const PN = g.attributes.aPN;
          for (let i = 0; i < n; i++) { const y = A.array[i * 3 + 1]; if (y < 1.062 && PN.array[i * 3 + 2] < -0.2) E.array[i * 3 + 1] = 1; }
          E.needsUpdate = true; }
        if (pr.key === 'c4Tunic') {                // the woven band round the neck reads the front painting's band, which runs right round
          const PN = g.attributes.aPN;
          for (let i = 0; i < n; i++) { const x = A.array[i * 3], y = A.array[i * 3 + 1], z = A.array[i * 3 + 2], nk = NECK(x, z); if (y < nk - 0.036 || z < -0.025 || Math.abs(x) > 0.085) continue;
            A.array[i * 3] = cl(x, -0.074, 0.074); A.array[i * 3 + 1] = 1.350 + (y - nk); PN.array[i * 3] = 0; PN.array[i * 3 + 1] = 0; PN.array[i * 3 + 2] = 1; E.array[i * 3] = 1; E.array[i * 3 + 1] = 0; E.array[i * 3 + 2] = 0; }
          A.needsUpdate = true; PN.needsUpdate = true; E.needsUpdate = true; }
        if (pr.key === 'c4Tunic') {                // over her shoulders, between the cowl and her neck, it reads the painted cowl (the paintings have no gap there)
          for (let i = 0; i < n; i++) { const x = A.array[i * 3], y = A.array[i * 3 + 1], z = A.array[i * 3 + 2]; if (y < 1.30 || y < NECK(x, z) - 0.002) continue;
            const k = Math.max(sm(0.062, 0.075, Math.abs(x)), sm(-0.035, -0.055, z)); A.array[i * 3 + 1] = lerp(y, 1.295 - 0.5 * (y - 1.30), k); }
          A.needsUpdate = true; }
        if (pr.key === 'c4Cowl') {                 // its top roll reads the painted cowl, not her neck above it
          for (let i = 0; i < n; i++) { const x = A.array[i * 3], z = A.array[i * 3 + 2], th = Math.atan2(x, z - ZC), lim = Math.min(yTop(th) - 0.010, Math.abs(th) < 1.3 ? NECK(x * 0.8, 0.05) - 0.036 : 9); if (A.array[i * 3 + 1] > lim) A.array[i * 3 + 1] = lim;
            // across her chest its lower edge reads the painted cowl, not the bodice just under it
            const lo = yHem(th) + 0.012, f = sm(-0.75, -0.55, th) * sm(1.45, 1.2, th); if (f > 0 && A.array[i * 3 + 1] < lo) A.array[i * 3 + 1] = lerp(A.array[i * 3 + 1], lo, f); 
            // beside her left breast the painted cowl falls a little further out than this one: it reads the painting there
            const g2 = sm(0.62, 0.80, th) * sm(1.40, 1.15, th) * sm(1.235, 1.215, A.array[i * 3 + 1]); if (g2 > 0) A.array[i * 3] += 0.024 * g2;
            // over her chest the side painting has the bodice where this cowl is: only the front painting is read there
            E.array[i * 3 + 2] *= sm(0.95, 1.25, Math.abs(th)); }
          A.needsUpdate = true; }
        if (/^c4(Vest|Tunic|Belt|Trousers)$/.test(pr.key)) {
          // they read the side painting just in front of or just behind it
          for (let i = 0; i < n; i++) { const y = A.array[i * 3 + 1]; if (y < 0.70 || y > 1.28) continue; const q = prof(ARMZ, y, true), z = A.array[i * 3 + 2], d = z - q[0], w = q[1] + 0.014;
            if (Math.abs(d) < w) A.array[i * 3 + 2] = lerp(z, q[0] + (d >= 0 && y > 0.92 ? w : -w), sm(0.69, 0.71, y)); }
          A.needsUpdate = true; }
        if (pr.key === 'c4Cowl') {                 // its inside, its edges and its top roll read the painting as its outside does there
          const PN = g.attributes.aPN, nn = cowlN + 1;
          for (let c = 0; c < A.count / nn; c++) for (let j = NRO + 1; j < cowlN; j++) {
            const src = j <= NRO + 3 ? NRO : j <= 2 * NRO + 4 ? 2 * NRO + 4 - j : 0, a = c * nn + j, b = c * nn + src;
            for (let k = 0; k < 3; k++) { A.array[a * 3 + k] = A.array[b * 3 + k]; PN.array[a * 3 + k] = PN.array[b * 3 + k]; E.array[a * 3 + k] = E.array[b * 3 + k]; } }
          A.needsUpdate = true; PN.needsUpdate = true; E.needsUpdate = true; }
      }
    });

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'dollFoot', 'toenail']);
    W.hideSkin((x, y, z) => y < NECK(x, z) - 0.012 || Math.abs(x) > 0.075 && y < 1.40, ['dollTrunk']);
    W.hideSkin(() => true, ['dollLeg']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl < SLC - 0.016; }, ['arm']);
  },
};
