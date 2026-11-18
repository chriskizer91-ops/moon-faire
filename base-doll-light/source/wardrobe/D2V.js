// D2V, Chris's own variant of the Faire peasant dress (D2VA.png, D2VB.png): a cream chemise worn off the shoulders with frilled
// gathered edges at the neckline and at the elbow cuffs of its puffed sleeves, a burgundy leather corset laced up the front with gold
// piping along its edges and a waistband at the bottom, a dark green gathered skirt to just below her knees, a cream linen apron with
// two small gold wheat sprigs near its hem tied at the back with a big bow and long ties, and brown lace-up ankle boots with a stacked heel.
// Built from the same construction as D2 (wardrobe/D2.js).
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.D2V = {
  name: 'Faire peasant dress (Chris\'s variant)', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smin, smax, prof, DOLL } = W;
    const F = W.F, Fs = W.Fsnug;
    const LIFT = 0.012;                                   // the boots' soles and stacked heels: she stands this much higher
    // ----- materials -----
    const linen = W.paint({ rough: 0.9, emis: 1.6, color: '#fff6ec' }), linenD = W.paint({ rough: 0.9, double: true, emis: 1.65, color: '#fff6ec' });
    const wool = W.paint({ rough: 0.95, double: true, emis: 0.26 }), corsetM = W.paint({ rough: 0.5, env: 0.45, emis: 0.24 });
    const leather = W.paint({ rough: 0.52, env: 0.45 });
    const brass = W.std({ color: W.lin('#b8924a'), metalness: 0.85, roughness: 0.32 });
    const gold = W.std({ color: W.lin('#c39a45'), metalness: 0.75, roughness: 0.35 });
    const cord = W.std({ color: W.lin('#5e3320'), roughness: 0.7 });
    const bootCord = W.std({ color: W.lin('#5a3520'), roughness: 0.7 });

    // ----- small geometry helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const perp = (n) => { const u = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])); return [u, cross(n, u)]; };
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    // flip a loft's triangles if its middle ring faces inward
    function orient(g, rings) {
      const nor = W.computeNormals(g.pos, g.idx), m = Math.floor(rings.length / 2), r = rings[m], n = r.length, cols = n + 1;
      const c = r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]); let s = 0;
      for (let j = 0; j < n; j++) { const v = m * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    function torus(c, n, R, r, NU, NV) {
      NU = NU || 12; NV = NV || 6; const [u, v] = perp(n), rings = [];
      for (let i = 0; i <= NU; i++) { const t = (i / NU) * TAU, d = [u[0] * Math.cos(t) + v[0] * Math.sin(t), u[1] * Math.cos(t) + v[1] * Math.sin(t), u[2] * Math.cos(t) + v[2] * Math.sin(t)], cc = add(c, d, R), ring = [];
        for (let j = 0; j < NV; j++) { const p = (j / NV) * TAU; ring.push(add(add(cc, d, r * Math.cos(p)), n, r * Math.sin(p))); } rings.push(ring); }
      return orient(W.loft(rings, {}), rings);
    }
    function tube(pts, r, NV) {                           // a thin round cord along points, closed at both ends
      NV = NV || 6; const rings = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], t = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]), [u, v] = perp(t), ring = [];
        for (let j = 0; j < NV; j++) { const p = (j / NV) * TAU; ring.push(add(add(pts[i], u, r * Math.cos(p)), v, r * Math.sin(p))); } rings.push(ring); }
      return orient(W.loft(rings, { capA: true, capB: true }), rings);
    }
    // a ribbon: points with a width direction w and a face direction n; a flat rounded box in section
    function ribbon(P) {
      const rings = [], NV = 12;
      for (const q of P) { const ring = [];
        for (let j = 0; j < NV; j++) { const a = (j / NV) * TAU, ca = Math.cos(a), sa = Math.sin(a), cx = Math.sign(ca) * Math.pow(Math.abs(ca), 0.35), sy = Math.sign(sa) * Math.pow(Math.abs(sa), 0.35);
          ring.push(add(add(q.p, q.w, q.hw * cx), q.n, q.ht * sy)); } rings.push(ring); }
      return orient(W.loft(rings, { capA: true, capB: true }), rings);
    }
    // where a ray from p along d first meets G < 0
    function hit(G, p, d, maxL) {
      let lo = 0, hi = -1; const st = 0.002;
      for (let t = 0; t <= (maxL || 0.4); t += st) { if (G(p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t) < 0) { hi = t; lo = Math.max(0, t - st); break; } }
      if (hi < 0) return null;
      for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (G(p[0] + d[0] * m, p[1] + d[1] * m, p[2] + d[2] * m) < 0) hi = m; else lo = m; }
      return add(p, d, (lo + hi) / 2);
    }
    const grad = (G, p) => { const e = 0.0008; return norm([G(p[0] + e, p[1], p[2]) - G(p[0] - e, p[1], p[2]), G(p[0], p[1] + e, p[2]) - G(p[0], p[1] - e, p[2]), G(p[0], p[1], p[2] + e) - G(p[0], p[1], p[2] - e)]); };

    // ======================= the corset =======================
    // strapless: a sweetheart top edge in front (dipping at the laced opening, rising over each breast), straight across the back;
    // down to a separate waistband at the bottom
    const C_BOT = 1.022, C_TH = 0.0060;
    const topC = (x, z) => {
      const ax = Math.abs(x), front = 1.203 + 0.006 * sm(0.0, 0.03, ax) + 0.016 * sm(0.06, 0.105, ax) - 0.008 * sm(0.115, 0.14, ax), back = 1.204 + 0.022 * sm(0.05, 0.115, ax);
      return lerp(back, front, sm(-0.04, 0.04, z));
    };
    const gapW = (y) => lerp(0.0028, 0.0065, sm(1.04, 1.205, y));            // half the laced opening's width
    const corMain = (x, y, z) => Math.max(C_BOT - y, y - topC(x, z));
    const corR = (x, y, z) => { const m = corMain(x, y, z); return z > 0.02 ? Math.max(m, gapW(y) - Math.abs(x)) : m; };
    W.snug('d2vCorset', corR, () => C_TH, [-0.165, 0.165, 1.008, 1.25, -0.135, 0.125], 0.0046, { mat: corsetM });
    // the waistband at its foot
    const WB0 = 0.993, WB1 = 1.036, WB_TH = 0.0140;
    W.snug('d2vWaistband', (x, y, z) => Math.max(WB0 - y, y - WB1), () => WB_TH, [-0.20, 0.20, 0.978, 1.05, -0.15, 0.15], 0.0050, { mat: corsetM });
    const GC = (x, y, z) => Fs(x, y, z) - C_TH, GW = (x, y, z) => Fs(x, y, z) - WB_TH;
    // gold piping: round the top edge (from one side of the opening, round her back, to the other) and both edges of the waistband
    {
      const P0 = [], loops = [];
      const ring = (G, yOf, a0, a1, N, lift) => { const pts = [];
        for (let k = 0; k <= N; k++) { const a = lerp(a0, a1, k / N), d = [-Math.sin(a), 0, -Math.cos(a)]; let y = yOf(0.1 * Math.sin(a), 0.1 * Math.cos(a)), p = null;
          for (let it = 0; it < 2; it++) { p = hit(G, [Math.sin(a) * 0.3, y, -0.005 + Math.cos(a) * 0.3], d, 0.4); if (!p) break; y = yOf(p[0], p[2]); }
          if (!p) continue; p = hit(G, [Math.sin(a) * 0.3, y, -0.005 + Math.cos(a) * 0.3], d, 0.4); if (p) pts.push(add(p, grad(G, p), lift)); }
        return pts; };
      const a0 = 0.07;
      const top = ring(GC, (x, z) => topC(x, z) - 0.0016, a0, TAU - a0, 120, 0.0008);
      loops.push(tube(top, 0.0021, 6));
      loops.push(tube(ring(GW, () => WB1 - 0.0015, 0, TAU, 120, 0.0008), 0.0021, 6));
      loops.push(tube(ring(GW, () => WB0 + 0.0015, 0, TAU, 120, 0.0008), 0.0021, 6));
      W.part('d2vPiping', merge(loops), (x, y, z) => W.wBody(x, y, z - (z > 0 ? 0.01 : -0.01)), { mat: gold });
    }

    // ======================= the chemise =======================
    // worn off the shoulders: the neckline runs across her chest and round her upper arms, edged with a standing frill
    const NECK = (x, z) => 1.289 + 0.009 * sm(0.0, 0.12, Math.abs(x)) + 0.006 * sm(0.02, -0.04, z);
    const chemLo = (x, y, z) => (z > 0.02 && Math.abs(x) < gapW(y) + 0.012 ? 1.020 : Math.min(1.20, topC(x, z) - 0.016));
    const chemR = (x, y, z) => Math.max(y - NECK(x, z), chemLo(x, y, z) - y);
    const chemTh = (x, y, z) => { const a = Math.atan2(x, z + 0.005), nk = NECK(x, z);
      return 0.0022 + 0.0042 * sm(nk - 0.030, nk - 0.010, y) * (0.5 + 0.5 * Math.sin(a * 48)) + 0.0010 * sm(1.23, 1.26, y) * (0.5 + 0.5 * Math.sin(a * 48 + 1.1)); };
    W.snug('d2vChemise', (x, y, z) => Math.max(chemR(x, y, z), 1.172 - y), chemTh, [-0.17, 0.17, 1.162, 1.32, -0.13, 0.12], 0.0034, { mat: linen });
    // the chemise seen through the laced opening, below that
    W.snug('d2vChemiseGap', (x, y, z) => Math.max(chemR(x, y, z), y - 1.177, -z), chemTh, [-0.035, 0.035, 1.010, 1.19, 0.0, 0.13], 0.0030, { mat: linen });
    // the puffed sleeves: their top edge is the neckline round her upper arm; puffed, gathered into a band at the elbow, then a frill
    const SL1 = 0.234, SL2 = 0.256, SL3 = 0.298;
    const sl0 = (a) => lerp(0.004, 0.050, Math.pow((1 - Math.cos(a)) / 2, 2));
    const slOff = (sl, a, s0) => {
      const t = cl((sl - s0) / (SL1 - s0), 0, 1), side = 0.55 + 0.45 * (1 + Math.cos(a)) / 2;
      const puff = 0.031 * Math.pow(Math.sin(PI * Math.pow(t, 0.8)), 0.65) * side * (1 + 0.16 * Math.sin(a * 9 + 0.6) * Math.sin(PI * t));
      const frill = 0.0045 * sm(0.07, 0.0, t) * (0.5 + 0.5 * Math.sin(a * 16));
      return 0.0035 + puff + frill;
    };
    for (const S of ['R', 'L']) {
      const NU = 48, rows = [], rings = [];
      // rows along the arm: the puff, the band, then the frill flaring out below it, and its rolled edge back inside
      const N1 = 28; for (let i = 0; i <= N1; i++) rows.push({ f: i / N1 });
      rows.push({ sl: SL1 + 0.004, e: 0.0062 }); rows.push({ sl: SL1 + 0.012, e: 0.0065 }); rows.push({ sl: SL2 - 0.004, e: 0.0065 }); rows.push({ sl: SL2, e: 0.0062 });
      for (let i = 1; i <= 8; i++) { const t = i / 8; rows.push({ sl: lerp(SL2, SL3, t), e: 0.0062 + 0.016 * Math.pow(t, 1.3), ruf: t }); }
      rows.push({ sl: SL3 + 0.001, e: 0.0062 + 0.016 - 0.002, ruf: 1 });
      const SLs = [];
      for (const rw of rows) {
        const ring = [], sls = [];
        for (let j = 0; j < NU; j++) {
          const a = (j / NU) * TAU, s0 = sl0(a), sl = rw.sl != null ? rw.sl : lerp(s0, SL1, rw.f);
          const p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
          const d = norm([p[0] - ax[0], p[1] - ax[1], p[2] - ax[2]]);
          const e = rw.e != null ? rw.e + (rw.ruf ? 0.0055 * rw.ruf * Math.sin(a * 14 + 0.4) : 0) : slOff(sl, a, s0);
          ring.push(add(p, d, e)); sls.push([sl, a]);
        }
        rings.push(ring); SLs.push(sls);
      }
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('d2vSleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, SL1); const [sl, a] = SLs[r][j % NU];
        const wa = W.wArmSL(S, Math.max(sl, 0.0), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.35 * sm(0.03, -0.012, sl)) : wa; }, { mat: linenD });
    }

    // ======================= the skirt =======================
    const SKC = -0.012, TOP = 1.010, HEM = 0.458;
    // her body's outline round the skirt's middle line, by height and angle (from outside in, so her legs count as one)
    const NA = 72, YB0 = 1.08, YB1 = 0.64, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; let fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    // the flare (half width, front and back from the middle line) read from the paintings
    const FL = [[1.04, [0.140, 0.085, 0.085]], [0.95, [0.180, 0.110, 0.125]], [0.85, [0.212, 0.142, 0.155]], [0.75, [0.232, 0.165, 0.175]], [0.62, [0.246, 0.182, 0.186]],
      [0.50, [0.254, 0.190, 0.190]], [0.44, [0.257, 0.193, 0.192]]];
    const flareR = (y, a) => { const v = prof(FL, y, true), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2]; return 1 / Math.sqrt((s / v[0]) * (s / v[0]) + (c / rz) * (c / rz)); };
    const clear = (y) => lerp(0.0075, 0.014, sm(1.03, 0.90, y));
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), 0.025);
    const gAmp = (y) => lerp(0.0026, 0.020, Math.pow(sm(TOP, HEM, y), 0.8));
    const fold = (a, y) => { const t = sm(TOP, HEM, y), ph = 0.5 * t * Math.sin(2 * a + 0.4);
      const fine = Math.sin(a * 46 + 0.3), main = 0.70 * Math.sin(a * 30 + ph + 0.8 * Math.sin(a * 3)) + 0.30 * Math.sin(a * 47 + 1.3 + ph * 1.5);
      return lerp(fine, main, sm(0.0, 0.25, t)); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    {
      const NU = 160, ys = [];
      const NV = 36; for (let i = 0; i <= NV; i++) { const t = i / NV; ys.push(lerp(TOP, HEM, t * t * 0.35 + t * 0.65)); }
      const rings = [];
      const at = (y, a, dr) => { const r = skirtR(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
      const hemY = (a) => HEM + 0.003 * Math.sin(a * 3 + 1) - 0.003 * (0.5 + 0.5 * fold(a, HEM));
      // the waistband's rolled top edge, inward
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(TOP + 0.002, a, -0.003)); } rings.push(ring); }
      for (const y of ys) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, yy = y === HEM ? hemY(a) : lerp(y, hemY(a), sm(TOP, HEM, y) * sm(0.62, HEM, y)); ring.push(at(yy, a)); } rings.push(ring); }
      // the hem, turned up inside
      { const r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemY(a); r1.push(at(h - 0.002, a, -0.0035)); r2.push(at(h + 0.022, a, -0.0045)); } rings.push(r1, r2); }
      const g = W.loft(rings, {});
      W.part('d2vSkirt', g, (x, y, z) => W.wSkirt(x, y, z), { mat: wool });
    }

    // ======================= the apron =======================
    const A_TOP = 1.000, A_HEM = 0.572;
    const AHW = [[1.000, 0.112], [0.95, 0.130], [0.85, 0.152], [0.75, 0.160], [0.65, 0.163], [0.572, 0.165]];
    const envR = (y, a) => baseR(y, a) + gAmp(y) + 0.0025;
    const angFor = (y, X) => { let lo = 0, hi = PI * 0.62; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (envR(y, m) * Math.sin(m) < X) lo = m; else hi = m; } return (lo + hi) / 2; };
    {
      const NUa = 56, NV = 40, rings = [];
      const apronPt = (y, u, inner) => {
        const hw = prof(AHW, y, true), X = Math.abs(u) * hw, a = Math.sign(u) * angFor(y, X), t = sm(A_TOP, A_HEM, y);
        const gath = 0.0045 * (0.4 + 0.6 * t) * (0.5 + 0.5 * Math.sin(u * 15 + 0.5 + 1.2 * t)) * sm(1.0, 0.8, Math.abs(u)) + 0.004 * t * (0.5 + 0.5 * Math.sin(u * 5 - 0.7));
        const r = lerp(envR(y, a) + 0.003 + gath, baseR(y, a) + gAmp(y) + 0.0016, sm(0.972, 0.995, y)) - (inner ? 0.0016 : 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)];
      };
      const rowAt = (y, mid) => { const ring = [];
        for (let j = 0; j <= NUa; j++) ring.push(apronPt(y, -1 + 2 * j / NUa, false));
        for (let j = NUa; j >= 0; j--) { const p = apronPt(y, -1 + 2 * j / NUa, true); if (mid) { const q = ring[j]; ring.push([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]); } else ring.push(p); }
        if (mid) for (let j = 0; j <= NUa; j++) ring[j] = ring[2 * NUa + 1 - j];
        return ring; };
      for (let i = 0; i <= NV; i++) rings.push(rowAt(lerp(A_TOP, A_HEM, i / NV), false));
      rings.push(rowAt(A_HEM - 0.0016, true));
      const g = W.loft(rings, {});
      W.part('d2vApron', g, (x, y, z) => W.wSkirt(x, y, z), { mat: linen });
    }
    // the big bow at the back, on the corset's waistband, and its two long ties
    {
      const zk = SKC - (bodyR(1.012, PI) + WB_TH + 0.003), yk = 1.012, wk = W.wBody(0, 1.012, -0.07), parts = [];
      { const P = []; for (let k = 0; k <= 16; k++) { const ph = (k / 16) * TAU, c = [0, yk + 0.0085 * Math.sin(ph), zk - 0.003 + 0.006 * Math.cos(ph)]; P.push({ p: c, w: [1, 0, 0], n: norm([0, Math.sin(ph), Math.cos(ph)]), hw: 0.010, ht: 0.0015 }); } parts.push(ribbon(P)); }
      for (const s of [-1, 1]) { const P = [], X = (ph) => s * (0.008 + 0.0215 * (1 - Math.cos(ph))), Z = (ph) => zk - 0.005 - 0.006 * Math.sin(ph) * s, Y = (ph) => yk + 0.003 + 0.007 * (1 - Math.cos(ph)) / 2;
        for (let k = 0; k <= 24; k++) { const ph = (k / 24) * TAU, ph2 = ph + 0.01, x = X(ph), y = Y(ph), z = Z(ph);
          const t = norm([X(ph2) - x, Y(ph2) - y, Z(ph2) - z]), w = norm(cross(t, [0, 0, 1])), n = cross(t, w);
          P.push({ p: [x, y, z], w, n, hw: 0.0105 + 0.003 * (1 - Math.cos(ph)) / 2, ht: 0.0015 }); }
        parts.push(ribbon(P)); }
      W.part('d2vApronBow', merge(parts), () => wk, { mat: linen });
      const ties = [];
      for (const [s, yEnd] of [[-1, 0.806], [1, 0.790]]) { const P = [], N = 24;
        for (let k = 0; k <= N; k++) { const t = k / N, y = lerp(yk - 0.005, yEnd, t), x = s * (0.005 + 0.016 * sm(0, 0.5, t)), a = PI - x / 0.2;
          const r = (y > WB0 - 0.002 ? bodyR(y, a) + WB_TH + 0.004 : envR(y, a) + 0.004) + 0.0025 * Math.sin(t * 7 + s);
          P.push({ p: [x, y, SKC + r * Math.cos(a)], w: [1, 0, 0], n: [0, 0, -1], hw: 0.0115, ht: 0.0014 }); }
        const last = P[P.length - 1]; last.p = [last.p[0], last.p[1] - 0.004, last.p[2]];
        ties.push(ribbon(P)); }
      W.part('d2vApronTies', merge(ties), (x, y, z) => W.wSkirt(x, y, z), { mat: linen });
    }

    // ======================= the lacing up the corset's front =======================
    {
      const NE = 7, EY = [], parts = [], cparts = [];
      for (let k = 0; k < NE; k++) { const y = lerp(1.192, 1.042, k / (NE - 1)), ex = gapW(y) + 0.0075;
        for (const s of [-1, 1]) { const p = hit(GC, [s * ex, y, 0.25], [0, 0, -1]); const n = grad(GC, p); EY.push({ p: add(p, n, 0.0006), n, s, k });
          parts.push(torus(add(p, n, 0.0006), n, 0.0028, 0.0010, 12, 6)); } }
      W.part('d2vEyelets', merge(parts), (x, y, z) => W.wBody(x, y, z - 0.008), { mat: brass });
      const E = (k, s) => EY.find((e) => e.k === k && e.s === s), lift = (e, h) => add(e.p, e.n, h);
      for (let k = 0; k < NE - 1; k++) for (const s of [-1, 1]) {
        const a = E(k, s), b = E(k + 1, -s), m = [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2, (a.p[2] + b.p[2]) / 2 + (s > 0 ? 0.0030 : 0.0018)];
        cparts.push(tube([lift(a, -0.001), lift(a, 0.0015), m, lift(b, 0.0015), lift(b, -0.001)], 0.0012, 6));
      }
      for (const k of [0, NE - 1]) { const a = E(k, -1), b = E(k, 1); cparts.push(tube([lift(a, -0.001), lift(a, 0.0015), lift(b, 0.0015), lift(b, -0.001)], 0.0012, 6)); }
      W.part('d2vLace', merge(cparts), (x, y, z) => W.wBody(x, y, z - 0.010), { mat: cord });
    }

    // ======================= the boots =======================
    const BOOT_TOP = 0.205;
    // the boot's last in the foot's own frame (X out to the little toe, Z forward from the ankle): inner edge, outer edge, height above the sole
    const LAST = [[-0.072, [-0.010, 0.010, 0.040]], [-0.064, [-0.026, 0.024, 0.056]], [-0.046, [-0.035, 0.032, 0.068]], [-0.020, [-0.037, 0.036, 0.077]], [0.010, [-0.039, 0.037, 0.087]],
      [0.040, [-0.040, 0.042, 0.089]], [0.070, [-0.041, 0.050, 0.075]], [0.100, [-0.046, 0.056, 0.061]], [0.130, [-0.048, 0.056, 0.051]], [0.155, [-0.046, 0.047, 0.045]],
      [0.172, [-0.042, 0.033, 0.041]], [0.186, [-0.032, 0.013, 0.035]], [0.196, [-0.012, -0.004, 0.029]]];
    const S0 = W.SOLE, L2 = [0, 0];
    const lastD = (X, Y, Z) => {
      const v = prof(LAST, Z, true), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.012, ry = Math.max(0.004, v[2] - 0.012);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.016, q = Math.pow(Math.pow(ux, 2.6) + Math.pow(uy, 2.6), 1 / 2.6);
      return Math.max((q - 1) * Math.min(rx, Y > yc ? ry : 0.016), -0.074 - Z, Z - 0.199);
    };
    const archLift = (Z) => 0.0085 * sm(-0.026, -0.019, Z) * sm(0.085, 0.048, Z);
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const upper = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const leg = y > 0.06 ? DOLL.fLegOnly(s, x, y, z) - 0.0048 - 0.0035 * sm(0.13, BOOT_TOP, y) - 0.0016 * Math.exp(-((y - BOOT_TOP) * (y - BOOT_TOP)) / 2.5e-5) : 1;
        return smax(smin(leg, lastD(X, y, Z), 0.014), y - BOOT_TOP, 0.002); };
      const sole = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const plan = lastD(X, S0 + 0.012, Z) - 0.0028, yb = S0 - LIFT + archLift(Z), yt = S0 + 0.007;
        return smax(plan, Math.max(yb - y, y - yt), 0.0016); };
      const G = (x, y, z) => Math.min(upper(x, y, z), sole(x, y, z));
      const keep = (x, y, z) => !(y > 0.07 && DOLL.fLegOnly(s, x, y, z) < -0.0015);
      const bx = s < 0 ? [-0.16, -0.015] : [0.015, 0.16];
      W.surface('d2vBoot' + S, G, [bx[0], bx[1], S0 - LIFT - 0.006, BOOT_TOP + 0.008, -0.10, 0.215], 0.0045, (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z), { mat: leather, keep });
      // eyelets and laces up the front
      const fw = [s * Math.sin(6 * PI / 180), 0, Math.cos(6 * PI / 180)], EYb = [], ep = [], lp = [];
      const NE = 7;
      for (let k = 0; k < NE; k++) { const y = lerp(0.194, 0.094, k / (NE - 1));
        for (const side of [-1, 1]) { const W2 = [0, 0]; DOLL.toWorld(s, side * 0.0115, 0.16, W2);
          const p = hit(G, [W2[0], y, W2[1]], [-fw[0], 0, -fw[2]], 0.3); if (!p) continue; const n = grad(G, p);
          EYb.push({ p: add(p, n, 0.0005), n, side, k }); ep.push(torus(add(p, n, 0.0005), n, 0.0024, 0.0009, 10, 6)); } }
      const E = (k, side) => EYb.find((e) => e.k === k && e.side === side);
      for (let k = 0; k < NE - 1; k++) for (const side of [-1, 1]) { const a = E(k, side), b = E(k + 1, -side); if (!a || !b) continue;
        const m = add([(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2, (a.p[2] + b.p[2]) / 2], norm(add(a.n, b.n, 1)), side > 0 ? 0.003 : 0.002);
        lp.push(tube([add(a.p, a.n, -0.001), add(a.p, a.n, 0.0013), m, add(b.p, b.n, 0.0013), add(b.p, b.n, -0.001)], 0.0009, 5)); }
      { const a = E(0, -1), b = E(0, 1); if (a && b) lp.push(tube([add(a.p, a.n, -0.001), add(a.p, a.n, 0.0013), add(b.p, b.n, 0.0013), add(b.p, b.n, -0.001)], 0.0009, 5)); }
      W.part('d2vBootEyelets' + S, merge(ep), (x, y, z) => W.wBody(x, y, z), { mat: brass });
      W.part('d2vBootLaces' + S, merge(lp), (x, y, z) => W.wBody(x, y, z), { mat: bootCord });
    }
    // she stands on the soles
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });
    // her knees and thighs keep out of the long skirt: the skirt's chains are pushed out past (or up onto) her legs, with room
    // enough that the cloth between two chains clears a knee too (the chains already keep 3 cm off her legs; the cloth between
    // them, 30 degrees apart, needs more)
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.085;
      const tipOff = CH.map((c) => c.names.map((nm, k) => new T3.Vector3().subVectors(c.pts[k + 1], c.pts[k])));
      const A = new T3.Vector3(), B = new T3.Vector3(), Hc = new T3.Vector3(), P = new T3.Vector3(), Tp = new T3.Vector3(), N = new T3.Vector3(), E = new T3.Vector3(), V = new T3.Vector3();
      const q = new T3.Quaternion(), pq = new T3.Quaternion(), v1 = new T3.Vector3(), v2 = new T3.Vector3();
      const legs = [];       // [a, b, ra, rb] capsules: thigh and shin of each leg
      for (const S of ['R', 'L']) legs.push([new T3.Vector3(), new T3.Vector3(), 0.078, 0.056, 'thigh' + S, 'shin' + S], [new T3.Vector3(), new T3.Vector3(), 0.056, 0.042, 'shin' + S, 'foot' + S]);
      const restD = CH.map((c) => c.names.map((nm, k) => { const out = []; for (const L of legs) { const a = W.SK[L[4]].userData.rest, b = W.SK[L[5]].userData.rest;
        for (let j = 0; j <= 5; j++) out.push(V.copy(a).lerp(b, j / 5).distanceTo(c.pts[k + 1])); } return out; }));
      let RD = null;
      const push = (p) => {         // how far p must move: out from her middle, or up, past the padded legs (the shorter); 0 if clear
        let best = null;
        E.set(p.x - Hc.x, 0, p.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return null; E.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0;
        legs.forEach((L, li) => { for (let k = 0; k <= 5; k++) { const t = k / 5; V.copy(L[0]).lerp(L[1], t); const R = Math.min(L[2] + (L[3] - L[2]) * t + PAD, RD[li * 6 + k] - 0.004);
          const vx = p.x - V.x, vy = p.y - V.y, vz = p.z - V.z, cc = vx * vx + vy * vy + vz * vz - R * R; if (cc >= 0) continue;
          const b1 = vx * E.x + vz * E.z, q1 = b1 * b1 - cc; if (q1 > 0) sOut = Math.max(sOut, -b1 + Math.sqrt(q1)); const q2 = vy * vy - cc; if (q2 > 0) sUp = Math.max(sUp, -vy + Math.sqrt(q2)); } });
        if (sOut <= 1e-4 && sUp <= 1e-4) return null;
        best = sUp < sOut ? N.set(0, sUp, 0) : N.copy(E).multiplyScalar(sOut); return best;
      };
      W.onFrame((SK) => {
        for (const L of legs) { SK[L[4]].getWorldPosition(L[0]); SK[L[5]].getWorldPosition(L[1]); }
        SK.hips.getWorldPosition(Hc);
        CH.forEach((c, ci) => { for (let k = 0; k < c.names.length; k++) {
          const b = SK[c.names[k]]; b.getWorldPosition(P); Tp.copy(tipOff[ci][k]).applyMatrix4(b.matrixWorld); Tp.sub(A.setFromMatrixPosition(b.matrixWorld)).add(P);
          RD = restD[ci][k]; const d = push(Tp); if (!d) continue;
          v1.subVectors(Tp, P); const len = v1.length(); v2.copy(Tp).add(d).sub(P).setLength(len); v1.normalize(); v2.normalize();
          q.setFromUnitVectors(v1, v2); b.parent.getWorldQuaternion(pq);
          b.quaternion.premultiply(pq.clone().invert().multiply(q).multiply(pq)); b.updateMatrixWorld(true); } });
      });
    }

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'dollFoot', 'toenail']);
    W.hideSkin((x, y, z) => y > 1.008 && (corR(x, y, z) < -0.012 || chemR(x, y, z) < -0.012), ['dollTrunk']);
    W.hideSkin((x, y, z) => y < BOOT_TOP - 0.014, ['dollLeg']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl > 0.02 && f.sl < SL2 - 0.014; }, ['arm']);
  },
};
