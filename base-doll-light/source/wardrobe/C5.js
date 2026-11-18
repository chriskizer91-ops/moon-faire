// C5, the fortune teller (C5A.png, C5B.png): a cream linen peasant blouse worn off the shoulders, its wide neckline gathered on an
// elastic with a little standing frill, loose and gathered over her bust and bloused over the waistband; puffed sleeves gathered into
// an elastic band at the elbow with a frill below it. A teal hip scarf wrapped round her hips over the skirts, its lower edge in a
// point at the front and at the back, knotted on her left hip with two ends hanging, a row of gold coins hanging all along its edge.
// A mustard overskirt with a waistband, hitched up on her right hip (ruched there) so it falls in swags across the front and back and
// in a cascade down her right side; it is longest at the back. A long gathered plum skirt to her ankles under it. A teal headscarf
// wrapped over her bun, knotted low at the back of her head, its two ends hanging behind her neck. Gold bangles on both wrists, small
// gold hoops in her ears, flat brown leather loafers.
// Pieces: c5Blouse, c5SleeveR/L, c5Skirt (plum), c5Overskirt, c5Shawl, c5ShawlKnot (knot and its two ends), c5Coins, c5Scarf,
// c5ScarfKnot, c5ScarfTails, c5Bangles, c5Earrings, c5ShoeR/L.
// The skirts, the hip scarf and its coins hang on the skirt chains (W.wSkirt), which a frame hook keeps out of her legs (as D1/X2).
// The headscarf is rigid on her head bone, laid over the bun as measured on the doll (W.hairParts()); its two hanging ends swing on
// their own: a frame hook turns them about the knot (their bind matrix, as C3 turns its wings) after a small damped pendulum that
// lags the head and keeps hanging down when she bends her head, never swinging forward into her neck.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.C5 = {
  name: 'Fortune teller', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { THREE, sm, lerp, PI, TAU, cl, smin, smax, DOLL } = W;
    const F = W.F, Fs = W.Fsnug, DEG = PI / 180;
    const LIFT = 0.008;                                   // the loafers' soles: she stands this much higher

    // ----- materials -----
    const linen = W.paint({ rough: 0.92, emis: 0.40, color: '#ffffff' }), linenD = W.paint({ rough: 0.92, double: true, emis: 0.42, color: '#ffffff' });
    const teal = W.paint({ rough: 0.84, double: true, emis: 0.28 }), tealS = W.paint({ rough: 0.84, emis: 0.28 });
    const mustard = W.paint({ rough: 0.90, double: true, emis: 0.27 }), plum = W.paint({ rough: 0.94, double: true, emis: 0.27 });
    const leather = W.std({ color: W.lin('#5e321b'), roughness: 0.48, envMapIntensity: 0.5 });          // plain: her feet stand differently in the paintings
    const gold = W.std({ color: W.lin('#c49b4c'), metalness: 0.85, roughness: 0.30, envMapIntensity: 1.0 });

    // ----- small geometry helpers -----
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const perp = (n) => { const u = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])); return [u, cross(n, u)]; };
    const sq = (v) => v * v;
    const wrapA = (a) => ((a + PI) % TAU + TAU) % TAU - PI;
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    // flip a loft's triangles if its middle ring faces toward ref (a point inside)
    function orientTo(g, ring, cols, ref) {
      const nor = W.computeNormals(g.pos, g.idx); let s = 0;
      for (let j = 0; j < cols; j++) { const v = ring * cols + j; s += nor[v * 3] * (g.pos[v * 3] - ref[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - ref[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - ref[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    function orient(g, rings) {
      const m = Math.floor(rings.length / 2), r = rings[m], n = r.length;
      const c = r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0]);
      return orientTo(g, m, n + 1, c);
    }
    function torus(c, n, R, r, NU, NV) {
      NU = NU || 12; NV = NV || 6; const [u, v] = perp(n), rings = [];
      for (let i = 0; i < NU; i++) { const t = (i / NU) * TAU, d = [u[0] * Math.cos(t) + v[0] * Math.sin(t), u[1] * Math.cos(t) + v[1] * Math.sin(t), u[2] * Math.cos(t) + v[2] * Math.sin(t)], cc = add(c, d, R), ring = [];
        for (let j = 0; j < NV; j++) { const p = (j / NV) * TAU; ring.push(add(add(cc, d, r * Math.cos(p)), n, r * Math.sin(p))); } rings.push(ring); }
      rings.push(rings[0]);
      return orient(W.loft(rings, {}), rings);
    }
    // a flat disc (a coin): centre c, facing n, radius R, thickness th
    function disc(c, n, R, th, NS) {
      NS = NS || 16; const [u, v] = perp(n), pos = [], idx = [];
      const f = add(c, n, th / 2), b = add(c, n, -th / 2);
      pos.push(...f, ...b);
      for (let j = 0; j < NS; j++) { const a = (j / NS) * TAU, d = add([0, 0, 0], u, Math.cos(a)); const dd = add(d, v, Math.sin(a)); pos.push(...add(f, dd, R), ...add(b, dd, R)); }
      for (let j = 0; j < NS; j++) { const j2 = (j + 1) % NS, a = 2 + j * 2, b2 = 2 + j2 * 2;
        idx.push(0, a, b2); idx.push(1, b2 + 1, a + 1); idx.push(a, a + 1, b2); idx.push(b2, a + 1, b2 + 1); }
      // face out: the front cap toward n
      const g = { pos, idx }, nor = W.computeNormals(pos, idx);
      if (nor[0] * n[0] + nor[1] * n[1] + nor[2] * n[2] < 0) for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
      return g;
    }
    // a ribbon: points with a width direction w and a face direction n; a flat rounded box in section
    function ribbon(P, NV) {
      const rings = []; NV = NV || 10;
      for (const q of P) { const ring = [];
        for (let j = 0; j < NV; j++) { const a = (j / NV) * TAU, ca = Math.cos(a), sa = Math.sin(a), cx = Math.sign(ca) * Math.pow(Math.abs(ca), 0.35), sy = Math.sign(sa) * Math.pow(Math.abs(sa), 0.35);
          ring.push(add(add(q.p, q.w, q.hw * cx), q.n, q.ht * sy)); } rings.push(ring); }
      return orient(W.loft(rings, { capA: true, capB: true }), rings);
    }
    // a periodic smooth curve through [angle, value] knots (angles ascending in -PI..PI)
    function per(K, a) {
      a = wrapA(a); const n = K.length; let aa = a < K[0][0] ? a + TAU : a;
      for (let i = 0; i < n; i++) { const k0 = K[i], k1 = K[(i + 1) % n], a0 = k0[0], a1 = i === n - 1 ? k1[0] + TAU : k1[0];
        if (aa >= a0 && aa <= a1) { const u = (aa - a0) / (a1 - a0); return lerp(k0[1], k1[1], u * u * (3 - 2 * u)); } }
      return K[0][1];
    }
    // a smooth curve through [x, value] knots (Catmull-Rom, x ascending or descending)
    function crv(K, x) {
      if (K[0][0] > K[K.length - 1][0]) K = K._r || (K._r = K.slice().reverse());
      const n = K.length; if (x <= K[0][0]) return K[0][1]; if (x >= K[n - 1][0]) return K[n - 1][1];
      let i = 1; while (K[i][0] < x) i++;
      const x1 = K[i - 1][0], x2 = K[i][0], u = (x - x1) / (x2 - x1), P0 = K[Math.max(0, i - 2)][1], P1 = K[i - 1][1], P2 = K[i][1], P3 = K[Math.min(n - 1, i + 1)][1];
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      if (typeof P1 === 'number') return f(P0, P1, P2, P3);
      return P1.map((v, k) => f(P0[k], P1[k], P2[k], P3[k]));
    }

    // ======================= her body's outline round the skirts' middle line, by height and angle =======================
    // (from outside in, so her legs count as one; her arms are not in it)
    const SKC = -0.012, NA = 96, YB0 = 1.32, YB1 = 0.60, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT_ = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT_[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; let fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT_[i * NA + j], BT_[i * NA + j2], v), lerp(BT_[(i + 1) * NA + j], BT_[(i + 1) * NA + j2], v), u); };
    const at = (r, y, a) => [r * Math.sin(a), y, SKC + r * Math.cos(a)];

    // ======================= the blouse =======================
    // From the gathered neckline (1.288, straight round her chest and back below her shoulders) to its hem tucked into the waistband
    // (1.016). Loose: it hangs from her bust (standing ~4 cm off her front, as painted), 1.3 cm off her sides, and blouses out over the
    // waistband at 1.05.
    const BT = 1.270, BB = 1.016;
    const looseA = (a) => { const c = Math.cos(a), f = Math.max(0, c), b = Math.max(0, -c); return 0.008 + 0.008 * f * f + 0.010 * b * b; };
    const hangK = (a) => { const f = Math.max(0, Math.cos(a)); return lerp(0.22, 0.10, f * f); };
    const blouseR = (y, a) => {
      const rb = bodyR(y, a), L = looseA(a), k = hangK(a);
      let hang = rb + 0.004; for (let y2 = y; y2 <= BT - 0.010; y2 += 0.006) hang = Math.max(hang, bodyR(y2, a) + L - k * (y2 - y));
      const e = sm(BT - 0.010, BT - 0.050, y), tuck = sm(1.040, 1.021, y);
      let r = lerp(rb + 0.0045, hang, e);
      r = lerp(r + 0.004 * Math.exp(-sq((y - 1.052) / 0.017)) * (0.4 + 0.6 * Math.max(0, Math.cos(a))), rb + 0.0035, tuck);
      const gE = 0.0028 * (0.5 + 0.5 * Math.sin(a * 46 + 0.7 * Math.sin(a * 7))) * (1 - e);
      const gB = 0.0035 * (0.5 + 0.5 * Math.sin(a * 19 + 1.3 * Math.sin(a * 3) + y * 9)) * e * (1 - tuck);
      return r + gE + gB;
    };
    {
      const NU = 176, NV = 52, rings = [], skin = [];
      const ringAt = (y, dr, ry) => { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(blouseR(ry == null ? y : ry, a) + dr, y, a)); } return ring; };
      // the standing frill above the elastic: its rolled edge turned in, then the frill
      { const r0 = [], r1 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, rb = bodyR(BT, a), g = 0.0030 * (0.5 + 0.5 * Math.sin(a * 46 + 0.7 * Math.sin(a * 7)));
          r0.push(at(rb + 0.0040 + g * 0.6, BT + 0.0065, a)); r1.push(at(rb + 0.0085 + g, BT + 0.0080, a)); } rings.push(r0, r1); }
      for (let i = 0; i <= NV; i++) { const t = i / NV; rings.push(ringAt(lerp(BT, BB, t * t * 0.25 + t * 0.75), 0)); }
      rings.push(ringAt(BB - 0.001, -0.003, BB));
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('c5Blouse', g, (x, y, z, i) => { const j = i % cols, a = ((j % NU) / NU) * TAU, yy = Math.min(y, 1.29), r = bodyR(yy, a) - 0.002; const p = at(r, yy, a); return W.wBody(p[0], p[1], p[2]); }, { mat: linenD });
    }

    // ----- the puffed sleeves: their top edge on the neckline round her upper arm; puffed, gathered into a band at her elbow, a frill below -----
    const SL1 = 0.214, SL2 = 0.234, SL3 = 0.256;
    const NYs = (a) => BT + 0.010 * sq((1 + Math.cos(a)) / 2);          // the neckline round her arm: a little higher over its outside
    const s0Of = (S, a) => { let lo = -0.046, hi = 0.09; const yAt = (sl) => W.armPt(S, sl, a)[1], NY = NYs(a);
      if (yAt(lo) <= NY) return lo; if (yAt(hi) >= NY) return hi;
      for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (yAt(m) > NY) lo = m; else hi = m; } return (lo + hi) / 2; };
    const slOff = (sl, a, s0) => {
      const u = sl - s0, side = 0.60 + 0.40 * (1 + Math.cos(a)) / 2;
      const t = cl((u - 0.024) / (SL1 - s0 - 0.024), 0, 1);
      const puff = 0.029 * Math.pow(Math.sin(PI * Math.pow(t, 0.92)), 0.90) * side * (1 + 0.15 * Math.sin(a * 9 + 0.6) * Math.sin(PI * t));
      const gath = 0.0026 * (0.5 + 0.5 * Math.sin(a * 22 + 0.4)) * (1 - 0.6 * Math.sin(PI * t));
      return 0.0045 + puff + gath;
    };
    for (const S of ['R', 'L']) {
      const NU = 52, rows = [];
      const N1 = 34;
      rows.push({ k: 'lip' }, { k: 'frill' });
      for (let i = 0; i <= N1; i++) rows.push({ f: i / N1 });
      rows.push({ sl: SL1 + 0.003, e: 0.0060 }, { sl: SL1 + 0.010, e: 0.0060 }, { sl: SL2 - 0.003, e: 0.0060 }, { sl: SL2, e: 0.0062 },
        { sl: SL2 + 0.007, e: 0.0088, g: 0.0025 }, { sl: SL3 - 0.004, e: 0.0118, g: 0.0038 }, { sl: SL3, e: 0.0124, g: 0.0040 }, { sl: SL3 - 0.0015, e: 0.0086, g: 0.0030 });
      const rings = [], SLs = [], s0s = []; for (let j = 0; j < NU; j++) s0s.push(s0Of(S, (j / NU) * TAU));
      for (const rw of rows) {
        const ring = [], sls = [];
        for (let j = 0; j < NU; j++) {
          const a = (j / NU) * TAU, s0 = s0s[j];
          let sl, e;
          if (rw.k === 'lip') { sl = Math.max(-0.047, s0 - 0.0055); e = 0.0040; }
          else if (rw.k === 'frill') { sl = Math.max(-0.047, s0 - 0.0075); e = 0.0085 + 0.0030 * (0.5 + 0.5 * Math.sin(a * 22 + 0.4)); }
          else if (rw.sl != null) { sl = rw.sl; e = rw.e + (rw.g || 0) * (0.5 + 0.5 * Math.sin(a * 18 + 1.1)); }
          else { sl = lerp(s0, SL1, rw.f); e = slOff(sl, a, s0); }
          const p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
          const d = norm(sub(p, ax)); ring.push(add(p, d, e)); sls.push([sl, a]);
        }
        rings.push(ring); SLs.push(sls);
      }
      const g = W.loft(rings, {}), cols = NU + 1;
      { const m = Math.floor(rings.length / 2), sl = SLs[m][0][0], c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI); orientTo(g, m, cols, [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2]); }
      W.part('c5Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; const [sl, a] = SLs[Math.min(r, SLs.length - 1)][j % NU];
        const wa = W.wArmSL(S, Math.max(sl, 0.0), a); return sl < 0.035 ? W.mixW(wa, W.wBody(x, y, z), 0.35 * sm(0.035, -0.010, sl)) : wa; }, { mat: linenD });
    }

    // ======================= the plum skirt =======================
    const TOP = 1.032, HEM = 0.145;
    const FLp = [[1.032, [0.135, 0.095, 0.090]], [0.95, [0.180, 0.110, 0.120]], [0.85, [0.192, 0.124, 0.126]], [0.75, [0.193, 0.130, 0.124]], [0.60, [0.196, 0.138, 0.128]],
      [0.45, [0.210, 0.148, 0.140]], [0.30, [0.238, 0.161, 0.157]], [0.20, [0.251, 0.169, 0.167]], [0.145, [0.256, 0.172, 0.170]]];
    const ell = (v, a) => { const s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2]; return 1 / Math.sqrt((s / v[0]) * (s / v[0]) + (c / rz) * (c / rz)); };
    const clear = (y) => lerp(0.0060, 0.013, sm(1.00, 0.85, y));
    const baseR = (y, a) => smax(bodyR(Math.max(y, YB1), a) * (y < YB1 ? 0 : 1) + clear(y), ell(crv(FLp, y), a), 0.025);
    const gAmp = (y) => lerp(0.0026, 0.019, Math.pow(sm(TOP, HEM, y), 0.8));
    const fold = (a, y) => { const t = sm(TOP, HEM, y), ph = 0.5 * t * Math.sin(2 * a + 0.4);
      const fine = Math.sin(a * 46 + 0.3), main = 0.72 * Math.sin(a * 28 + ph + 0.8 * Math.sin(a * 3)) + 0.28 * Math.sin(a * 43 + 1.3 + ph * 1.5);
      return lerp(fine, main, sm(0.0, 0.25, t)); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    const plumEnv = (y, a) => baseR(y, a) + gAmp(y) + 0.0015;
    {
      const NU = 168, ys = [], NV = 50; for (let i = 0; i <= NV; i++) { const t = i / NV; ys.push(lerp(TOP, HEM, t * t * 0.35 + t * 0.65)); }
      const rings = [], P = (y, a, dr) => at(skirtR(y, a) + (dr || 0), y, a);
      const hemY = (a) => HEM + 0.004 * Math.sin(a * 3 + 1) - 0.003 * (0.5 + 0.5 * fold(a, HEM));
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(P(TOP + 0.002, a, -0.003)); } rings.push(ring); }
      for (const y of ys) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, yy = y === HEM ? hemY(a) : lerp(y, hemY(a), sm(TOP, HEM, y) * sm(0.45, HEM, y)); ring.push(P(yy, a)); } rings.push(ring); }
      { const r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemY(a); r1.push(P(h - 0.002, a, -0.0035)); r2.push(P(h + 0.026, a, -0.0045)); } rings.push(r1, r2); }
      W.part('c5Skirt', W.loft(rings, {}), (x, y, z) => W.wSkirt(x, y, z), { mat: plum });
    }

    // ======================= the mustard overskirt =======================
    // Its hem by angle round her (0 front, -PI/2 her right side, PI/2 her left): 0.62 across the front, falling at the edge of the
    // cascade on her right front to 0.51, 0.48 at the back, 0.57 on her left side. Hitched up on her right hip (HA, HY): ruched there,
    // with swags falling away from the hitch across the front and the back, and a cascade of deep folds down her right side.
    const TOPO = 1.038, HA = -1.30, HY = 0.825;
    const HEMO = [[-PI, 0.478], [-2.6, 0.488], [-2.0, 0.498], [-1.5, 0.505], [-1.15, 0.515], [-0.93, 0.560], [-0.80, 0.622], [-0.45, 0.640], [0.0, 0.626], [0.6, 0.602],
      [1.2, 0.578], [1.6, 0.566], [2.2, 0.526], [2.7, 0.492]];
    const hemO = (a) => per(HEMO, a) + 0.006 * Math.sin(a * 7 + 0.5);
    const FLo = [[1.038, [0.140, 0.098, 0.092]], [0.95, [0.185, 0.115, 0.118]], [0.88, [0.195, 0.130, 0.118]], [0.80, [0.198, 0.145, 0.112]], [0.70, [0.200, 0.150, 0.122]],
      [0.60, [0.203, 0.152, 0.134]], [0.50, [0.208, 0.154, 0.140]], [0.44, [0.210, 0.156, 0.142]]];
    const oClear = (y) => lerp(0.0040, 0.007, sm(0.98, 0.85, y));
    const oBase = (y, a) => smax(plumEnv(y, a) + oClear(y), ell(crv(FLo, y), a), 0.02);
    // the cascade (her right side), the ruching at the hitch, swags radiating from it
    const wCas = (a) => { a = wrapA(a); return sm(-0.72, -0.98, a) * sm(-1.85, -1.55, a); };
    const wRu = (y, a) => Math.exp(-sq(wrapA(a - HA) / 0.11)) * sm(0.95, 0.90, y) * sm(0.72, 0.77, y);
    const oFold = (y, a) => {
      a = wrapA(a); const t = Math.pow(sm(TOPO, 0.50, y), 0.8);
      let f = lerp(0.0018, 0.011, t) * (0.5 + 0.5 * Math.sin(a * 17 + 0.9 * Math.sin(a * 3) + 0.4 * t * Math.sin(2 * a)));
      const wc = wCas(a);
      f += wc * sm(0.88, 0.68, y) * (0.004 + 0.015 * (0.5 + 0.5 * Math.sin(a * 27 + 2.0 + 3 * (0.8 - y))));
      const wr = wRu(y, a); f += wr * (0.004 + 0.007 * (0.5 + 0.5 * Math.sin(y * 300)));
      // swags: folds fanning out from the hitch, across the front (a > HA) and round the back (a < HA)
      const dyH = HY - y;
      if (dyH > -0.03) {
        const dA = wrapA(a - HA), dx = Math.abs(dA) * 0.21, phi = Math.atan2(dx, dyH + 0.035), dist = Math.hypot(dx, dyH);
        const fade = dA > 0 ? sm(1.85, 0.6, dA) : sm(-1.9, -0.7, dA);
        f += 0.013 * fade * sm(0.0, 0.10, dist) * (0.5 + 0.5 * Math.sin(phi * 13 + 0.5)) * (1 - wc * 0.6);
      }
      return f;
    };
    const oFoldMax = (y, a) => { a = wrapA(a); const t = Math.pow(sm(TOPO, 0.50, y), 0.8), dyH = HY - y;
      return lerp(0.0018, 0.011, t) + wCas(a) * sm(0.88, 0.68, y) * 0.019 + wRu(y, a) * 0.011 + (dyH > -0.03 ? 0.013 : 0); };
    const oskR = (y, a) => oBase(y, a) + oFold(y, a);
    const oskEnv = (y, a) => oBase(y, a) + oFoldMax(y, a) + 0.0015;
    {
      const NU = 220, NV = 46, rings = [];
      const P = (y, a, dr) => at(oskR(y, a) + (dr || 0), y, a);
      // the waistband: its rolled top edge turned in, the band (1.008 to 1.038), then the gathered skirt
      { const r0 = [], r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, rb = oBase(TOPO, a);
          r0.push(at(rb - 0.0035, TOPO + 0.0015, a)); r1.push(at(rb + 0.0004, TOPO + 0.001, a)); r2.push(at(oBase(1.010, a) + 0.0006, 1.010, a)); } rings.push(r0, r1, r2); }
      for (let i = 1; i <= NV; i++) { const t = i / NV, ring = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemO(a) - 0.004 * (0.5 + 0.5 * Math.sin(a * 17)), y = lerp(1.004, h, t * t * 0.3 + t * 0.7); ring.push(P(y, a)); }
        rings.push(ring); }
      { const r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemO(a) - 0.004 * (0.5 + 0.5 * Math.sin(a * 17)); r1.push(P(h - 0.0015, a, -0.003)); r2.push(P(h + 0.020, a, -0.0042)); } rings.push(r1, r2); }
      W.part('c5Overskirt', W.loft(rings, {}), (x, y, z) => W.wSkirt(x, y, z), { mat: mustard });
    }

    // ======================= the hip scarf =======================
    // Wrapped round her hips over the overskirt's waistband (its top 1.012), its lower edge in a point at the front and at the back
    // (0.80), 0.905 on her right side, rising to the knot on her left hip (KA, KY).
    const STOP = 1.012, KA = 1.32, KY = 0.928;
    const eY = (a) => { a = wrapA(a); const A = Math.abs(a), vf = 0.800 + 0.165 * A, vb = 0.800 + 0.165 * (PI - A);
      const cap = a < 0 ? 0.905 : lerp(0.905, 0.948, sm(0.55, 0.95, a) * sm(2.45, 2.05, a)); return smin(smin(vf, vb, 0.03), cap, 0.035); };
    const shR = (y, a) => oskEnv(y, a) + 0.0042 + 0.0016 * (0.5 + 0.5 * Math.sin(y * 150 + 1.5 * Math.sin(a * 2) + a * 3));
    {
      const NU = 220, NV = 30, rings = [];
      for (let i = 0; i <= NV; i++) { const t = i / NV, ring = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, y = lerp(STOP, eY(a), t); ring.push(at(shR(y, a), y, a)); } rings.push(ring); }
      // the hem's thickness: turned in under the edge
      { const r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, y = eY(a); r1.push(at(shR(y, a) - 0.0025, y - 0.001, a)); r2.push(at(shR(y + 0.012, a) - 0.0032, y + 0.012, a)); } rings.push(r1, r2); }
      // and at the top: rolled over
      { const r0 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; r0.push(at(shR(STOP, a) - 0.003, STOP + 0.001, a)); } rings.unshift(r0); }
      W.part('c5Shawl', W.loft(rings, {}), (x, y, z) => W.wSkirt(x, y, z), { mat: teal });
    }
    // the knot on her left hip and its two hanging ends
    {
      const parts = [], nA = [Math.sin(KA), 0, Math.cos(KA)], tA = [Math.cos(KA), 0, -Math.sin(KA)], c = at(shR(KY, KA) + 0.013, KY, KA);
      { // the knot: a lumpy round bundle
        const NU = 20, NV = 14, rings = [];
        for (let i = 0; i <= NV; i++) { const v = (i / NV) * PI, ring = [];
          for (let j = 0; j < NU; j++) { const u = (j / NU) * TAU, lump = 1 + 0.16 * Math.sin(u * 3 + v * 2) * Math.sin(v) + 0.10 * Math.sin(u * 5 - 1.0);
            const dx = Math.sin(v) * Math.cos(u), dy = Math.cos(v), dz = Math.sin(v) * Math.sin(u);
            ring.push(add(add(add(c, tA, 0.026 * dx * lump), [0, 1, 0], 0.032 * dy * lump), nA, 0.015 * dz * lump)); }
          rings.push(ring); }
        parts.push(orient(W.loft(rings, {}), rings));
      }
      // the two ends: one forward and longer (to 0.765), one back (to 0.790), narrowing to their points
      for (const [a1, yEnd, hw0] of [[1.12, 0.765, 0.024], [1.52, 0.792, 0.021]]) {
        const P = [], N = 20;
        for (let k = 0; k <= N; k++) { const t = k / N, y = lerp(KY - 0.012, yEnd, t), a = lerp(KA, a1, sm(0, 0.7, t));
          const r = oskEnv(y, a) + 0.010 + 0.006 * Math.sin(t * PI), n = [Math.sin(a), 0, Math.cos(a)], w = norm(add([Math.cos(a), 0, -Math.sin(a)], [0, 1, 0], 0.25 * (a1 - KA)));
          P.push({ p: at(r, y, a), w, n, hw: lerp(hw0, 0.0015, Math.pow(t, 1.4)) + 0.004 * Math.sin(t * PI), ht: 0.0016 }); }
        parts.push(ribbon(P));
      }
      W.part('c5ShawlKnot', merge(parts), (x, y, z) => W.wSkirt(x, y, z), { mat: tealS });
    }
    // the coins along its edge: a small ring and a coin, every 2.3 cm (none under the knot)
    {
      const parts = [], step = 0.023; let acc = step / 2, prev = null;
      for (let k = 0; k <= 1440; k++) {
        const a = -PI + (k / 1440) * TAU, y = eY(a), p = at(shR(y, a), y, a);
        if (prev) acc += Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]); prev = p;
        if (acc < step) continue; acc -= step;
        const dk = wrapA(a - KA); if (dk > -0.20 && dk < 0.17) continue;
        const n = [Math.sin(a), 0, Math.cos(a)], tg = [Math.cos(a), 0, -Math.sin(a)];
        const ring = add(add(p, n, 0.0012), [0, 1, 0], -0.0035);
        parts.push(torus(ring, tg, 0.0026, 0.0007, 8, 4));
        const yc = y - 0.0035 - 0.0026 - 0.0076, rc = Math.max(shR(y, a) + 0.0028, oskEnv(yc, a) + 0.0035);
        const cc = at(rc, yc, a), nn = norm(add(n, [0, 1, 0], -0.12));
        parts.push(disc(cc, nn, 0.0076, 0.0012, 16));
      }
      W.part('c5Coins', merge(parts), (x, y, z) => W.wSkirt(x, y, z), { mat: gold });
    }

    // ======================= the headscarf =======================
    // Over her bun: the outer surface of her hair (and the top of her head where no hair is) measured by direction from HC, made
    // smooth as cloth stretched over it, then the scarf a few millimetres outside it, from its crown down to its edge: across her
    // forehead at 1.567, above her ears (1.53), down behind them to the knot low at the back of her head (1.462).
    const HC = [0, 1.535, -0.030], NAZ = 72, NEL = 56, EL0 = -75 * DEG, EL1 = 90 * DEG, RT = new Float32Array(NAZ * NEL);
    const binOf = (x, y, z) => { const dx = x - HC[0], dy = y - HC[1], dz = z - HC[2], r = Math.hypot(dx, dy, dz) || 1e-6;
      const az = Math.atan2(dx, dz), el = Math.asin(cl(dy / r, -1, 1));
      const i = Math.round(((az + PI) / TAU) * NAZ) % NAZ, j = Math.round((el - EL0) / (EL1 - EL0) * (NEL - 1)); return [i, j, r]; };
    const put = (x, y, z) => { const [i, j, r] = binOf(x, y, z); if (j < 0 || j >= NEL) return; if (r > RT[j * NAZ + i]) RT[j * NAZ + i] = r; };
    for (const m of W.hairParts()) { const P = m.geometry.attributes.position.array; for (let i = 0; i < P.length; i += 3) put(P[i], P[i + 1], P[i + 2]); }
    if (W.meshes.face) { const P = W.meshes.face.geometry.attributes.position.array; for (let i = 0; i < P.length; i += 3) if (P[i + 1] > 1.528) put(P[i], P[i + 1], P[i + 2]); }
    {
      // empty directions take their neighbours' radius; then a stretched-cloth hull (never inside the hair), then smoothed
      for (let pass = 0; pass < 60; pass++) { let left = 0;
        for (let j = 0; j < NEL; j++) for (let i = 0; i < NAZ; i++) { if (RT[j * NAZ + i] > 0) continue; let s = 0, n = 0;
          for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const jj = j + dj; if (jj < 0 || jj >= NEL) continue; const v = RT[jj * NAZ + (i + di + NAZ) % NAZ]; if (v > 0) { s += v; n++; } }
          if (n) RT[j * NAZ + i] = -s / n; else left++; }
        for (let k = 0; k < RT.length; k++) if (RT[k] < 0) RT[k] = -RT[k];
        if (!left) break; }
      const R0 = RT.slice(), T2 = new Float32Array(RT.length);
      const avg = (A, i, j) => { let s = 0, n = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const jj = cl(j + dj, 0, NEL - 1); s += A[jj * NAZ + (i + di + NAZ) % NAZ]; n++; } return s / n; };
      for (let it = 0; it < 40; it++) { for (let j = 0; j < NEL; j++) for (let i = 0; i < NAZ; i++) T2[j * NAZ + i] = Math.max(R0[j * NAZ + i], avg(RT, i, j)); RT.set(T2); }
      for (let it = 0; it < 2; it++) { for (let j = 0; j < NEL; j++) for (let i = 0; i < NAZ; i++) T2[j * NAZ + i] = Math.max(R0[j * NAZ + i] - 0.0015, avg(RT, i, j)); RT.set(T2); }
    }
    const Rh = (az, el) => { const fi = ((az + PI) / TAU) * NAZ, fj = cl((el - EL0) / (EL1 - EL0) * (NEL - 1), 0, NEL - 1.001), i = Math.floor(fi), j = Math.floor(fj), u = fi - i, v = fj - j;
      const g = (ii, jj) => RT[jj * NAZ + ((ii % NAZ) + NAZ) % NAZ];
      return lerp(lerp(g(i, j), g(i + 1, j), u), lerp(g(i, j + 1), g(i + 1, j + 1), u), v); };
    const dirOf = (az, el) => [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
    const SEDGE = [[0, 1.567], [0.5, 1.562], [0.95, 1.549], [1.35, 1.536], [1.85, 1.527], [2.2, 1.503], [2.6, 1.479], [2.9, 1.466], [PI, 1.462]];
    const sEdge = (az) => crv(SEDGE, Math.abs(wrapA(az)));
    const elAtY = (az, y) => { let lo = EL0, hi = 80 * DEG; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (HC[1] + Rh(az, m) * Math.sin(m) > y) hi = m; else lo = m; } return (lo + hi) / 2; };
    const sOff = (az, el, y) => { const fr = sm(1.25, 0.55, Math.abs(az)) * sm(1.64, 1.60, y) * sm(1.555, 1.565, y);
      const bk = Math.exp(-sq(wrapA(az - PI) / 0.55)) * sm(1.550, 1.485, y);          // gathered into the knot at the back: it stands off her nape
      return 0.0050 + 0.0034 * fr * (0.5 + 0.5 * Math.sin((y - 1.566) * 240)) + 0.0016 * (0.5 + 0.5 * Math.sin(az * 9 + el * 7)) * (1 - fr) + 0.026 * bk * (1 + 0.12 * Math.sin(az * 14)); };
    const sPt = (az, el, dr) => { const R = Rh(az, el), d = dirOf(az, el), y = HC[1] + R * d[1]; return add(HC, d, R + sOff(az, el, y) + (dr || 0)); };
    const HEAD = W.wBone('head');
    {
      const NUs = 104, NVs = 44, rings = [], elE = [];
      for (let j = 0; j < NUs; j++) elE.push(elAtY(-PI + (j / NUs) * TAU, sEdge(-PI + (j / NUs) * TAU)));
      const pt = sPt;
      for (let i = 0; i <= NVs; i++) { const t = i / NVs, ring = [];
        for (let j = 0; j < NUs; j++) { const az = -PI + (j / NUs) * TAU; ring.push(pt(az, lerp(86 * DEG, elE[j], Math.pow(t, 0.9)))); } rings.push(ring); }
      // its edge: rolled under
      { const r1 = [], r2 = []; for (let j = 0; j < NUs; j++) { const az = -PI + (j / NUs) * TAU; r1.push(pt(az, elE[j] - 0.4 * DEG, -0.0028)); r2.push(pt(az, elE[j] + 5 * DEG, -0.0042)); } rings.push(r1, r2); }
      const g = W.loft(rings, { capA: true });
      orientTo(g, Math.floor(NVs / 2), NUs + 1, HC);
      W.part('c5Scarf', g, () => HEAD, { mat: tealS });
    }
    // the knot low at the back of her head, and its two ends hanging behind her neck
    const KEL = elAtY(PI, 1.478), KS = sPt(PI, KEL), KC = [0, KS[1] - 0.004, KS[2] - 0.013];
    {
      const NU = 18, NV = 12, rings = [], nB = [0, 0, -1];
      for (let i = 0; i <= NV; i++) { const v = (i / NV) * PI, ring = [];
        for (let j = 0; j < NU; j++) { const u = (j / NU) * TAU, lump = 1 + 0.14 * Math.sin(u * 3 + v * 2) * Math.sin(v) + 0.08 * Math.sin(u * 4 - 0.7);
          const dx = Math.sin(v) * Math.cos(u), dy = Math.cos(v), dz = Math.sin(v) * Math.sin(u);
          ring.push(add(add(add(KC, [1, 0, 0], 0.024 * dx * lump), [0, 1, 0], 0.019 * dy * lump), nB, 0.015 * dz * lump)); }
        rings.push(ring); }
      W.part('c5ScarfKnot', orient(W.loft(rings, {}), rings), () => HEAD, { mat: tealS });
    }
    const TAIL_L = 0.13, TAIL_DIR = norm([0.004, -1, -0.26]);
    const tails = (() => {
      const parts = [];
      for (const [dx, yEnd, dz, hw0, tw] of [[-0.006, 1.334, -0.030, 0.029, 0.20], [0.018, 1.368, -0.040, 0.023, -0.35]]) {
        const P = [], N = 18, p0 = add(KC, [dx * 0.3, -0.010, -0.004], 1);
        for (let k = 0; k <= N; k++) { const t = k / N, y = lerp(p0[1], yEnd, t), x = lerp(p0[0], KC[0] + dx, sm(0, 0.8, t)), z = lerp(p0[2], KC[2] + dz, t) - 0.016 * Math.sin(t * PI);
          const ang = tw * t, w = [Math.cos(ang), 0, Math.sin(ang)], n = [-Math.sin(ang), 0.15, -Math.cos(ang)];
          P.push({ p: [x, y, z], w, n: norm(n), hw: lerp(hw0, 0.0012, Math.pow(t, 1.5)) + 0.005 * Math.sin(t * PI) * (1 - t), ht: 0.0015 }); }
        parts.push(ribbon(P));
      }
      return W.part('c5ScarfTails', merge(parts), () => HEAD, { mat: tealS });
    })();
    // the ends swing: a damped pendulum from the knot, lagging the head and hanging down when she bends her head (never forward into her neck)
    {
      const skel = (Object.values(W.meshes).find((m) => m && m.isSkinnedMesh && m.skeleton) || {}).skeleton, hb = W.SK.head, bi = W.BI.head;
      const binv = skel ? skel.boneInverses[bi] : new THREE.Matrix4();
      const M = new THREE.Matrix4(), Qd = new THREE.Quaternion(), Qi = new THREE.Quaternion(), Qy = new THREE.Quaternion(), qP = new THREE.Quaternion(), vs = new THREE.Vector3(), vp = new THREE.Vector3();
      const K0 = new THREE.Vector3(...KC), D0 = new THREE.Vector3(...TAIL_DIR), Y = new THREE.Vector3(0, 1, 0);
      const X = new THREE.Vector3(), Xp = new THREE.Vector3(), Pv = new THREE.Vector3(), Tg = new THREE.Vector3(), tmp = new THREE.Vector3(), f = new THREE.Vector3(), db = new THREE.Vector3();
      const T1 = new THREE.Matrix4().makeTranslation(-KC[0], -KC[1], -KC[2]), T2 = new THREE.Matrix4().makeTranslation(KC[0], KC[1], KC[2]), R = new THREE.Matrix4();
      let lastT = -1, live = false;
      W.onFrame((SK, API) => {
        hb.updateWorldMatrix(true, false); M.multiplyMatrices(hb.matrixWorld, binv); M.decompose(vp, Qd, vs);
        Pv.copy(K0).applyMatrix4(M);
        f.set(0, 0, 1).applyQuaternion(Qd); Qy.setFromAxisAngle(Y, Math.atan2(f.x, f.z));
        Tg.copy(D0).applyQuaternion(Qd).multiplyScalar(0.35).add(tmp.copy(D0).applyQuaternion(Qy).multiplyScalar(0.65)).normalize();
        const mt = API && API.moveT != null ? API.moveT : -1, d = lastT >= 0 ? mt - lastT : 0; lastT = mt;
        if (!(d > 0 && d < 0.1) || !live) { X.copy(Pv).addScaledVector(Tg, TAIL_L); Xp.copy(X); live = d > 0 && d < 0.1; }
        else { const dt = d, k = 110, c = 0.10; tmp.copy(X).sub(Xp).multiplyScalar(1 - c); Xp.copy(X);
          X.add(tmp).add(f.copy(Pv).addScaledVector(Tg, TAIL_L).sub(X).multiplyScalar(Math.min(0.9, k * dt * dt)));
          X.sub(Pv).setLength(TAIL_L).add(Pv); }
        // into the head's own (bind) space; never forward of a slight lean toward her neck
        Qi.copy(Qd).invert(); db.copy(X).sub(Pv).normalize().applyQuaternion(Qi);
        if (db.z > -0.06) { db.z = -0.06; db.normalize(); }
        qP.setFromUnitVectors(D0, db); R.makeRotationFromQuaternion(qP);
        tails.mesh.bindMatrix.copy(T2).multiply(R).multiply(T1);
      });
    }

    // ======================= the jewellery: bangles and hoops =======================
    {
      const parts = [], W8 = [];
      for (const S of ['R', 'L']) {
        for (let k = 0; k < 4; k++) {
          const sl = 0.404 + 0.0115 * k, c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), c = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
          let R = 0; for (let j = 0; j < 24; j++) { const p = W.armPt(S, sl + 0.006, (j / 24) * TAU); R = Math.max(R, Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])); }
          const ad = W.armDir[S], n = norm([ad.x + 0.06 * Math.sin(k * 2.1), ad.y, ad.z + 0.06 * Math.cos(k * 1.7)]);
          const g = torus(c, n, R + 0.0042 + 0.0006 * k, 0.0017, 30, 6); parts.push(g); for (let v = 0; v < g.pos.length / 3; v++) W8.push(W.wArmSL(S, sl));
        }
      }
      W.part('c5Bangles', merge(parts), (x, y, z, i) => W8[i], { mat: gold });
      const ep = [];
      for (const s of [-1, 1]) { const hw = W.headHalfW ? W.headHalfW(1.468) : 0.070, x = s * (hw + 0.0065);
        ep.push(torus([x, 1.4585, -0.0205], norm([s * 0.55, 0, 0.84]), 0.0072, 0.0010, 22, 5)); }
      W.part('c5Earrings', merge(ep), () => HEAD, { mat: gold });
    }

    // ======================= the loafers =======================
    // the shoe's last in the foot's own frame (X out to the little toe, Z forward from the ankle): inner edge, outer edge, height above the sole
    const LAST = [[-0.072, [-0.010, 0.010, 0.040]], [-0.064, [-0.025, 0.023, 0.054]], [-0.046, [-0.034, 0.031, 0.066]], [-0.020, [-0.036, 0.035, 0.075]], [0.010, [-0.038, 0.036, 0.084]],
      [0.040, [-0.039, 0.041, 0.086]], [0.070, [-0.040, 0.049, 0.072]], [0.100, [-0.045, 0.055, 0.058]], [0.130, [-0.047, 0.055, 0.048]], [0.155, [-0.045, 0.046, 0.042]],
      [0.172, [-0.041, 0.032, 0.038]], [0.186, [-0.031, 0.013, 0.032]], [0.196, [-0.012, -0.004, 0.027]]];
    const S0 = W.SOLE, L2 = [0, 0];
    const lastD = (X, Y, Z) => {
      const v = W.prof(LAST, Z, true), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.012, ry = Math.max(0.004, v[2] - 0.012);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.016, q = Math.pow(Math.pow(ux, 2.6) + Math.pow(uy, 2.6), 1 / 2.6);
      return Math.max((q - 1) * Math.min(rx, Y > yc ? ry : 0.016), -0.074 - Z, Z - 0.199);
    };
    // the top of the shoe: low round the heel and sides, the vamp covering her toes and the front of her instep
    const shoeTop = (Z) => S0 + 0.040 + 0.008 * sm(-0.025, -0.072, Z) + 0.004 * sm(0.02, 0.062, Z) + 0.2 * sm(0.060, 0.086, Z);
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const upper = (x, y, z) => { DOLL.toLocal(s, x, z, L2); return smax(lastD(L2[0], y, L2[1]), y - shoeTop(L2[1]), 0.002); };
      const sole = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const plan = lastD(L2[0], S0 + 0.012, L2[1]) - 0.0025, yb = S0 - LIFT, yt = S0 + 0.005; return smax(plan, Math.max(yb - y, y - yt), 0.0015); };
      const G = (x, y, z) => Math.min(upper(x, y, z), sole(x, y, z));
      const keep = (x, y, z) => !(y > S0 + 0.02 && DOLL.fLegOnly(s, x, y, z) < -0.0012);
      const bx = s < 0 ? [-0.16, -0.015] : [0.015, 0.16];
      W.surface('c5Shoe' + S, G, [bx[0], bx[1], S0 - LIFT - 0.005, S0 + 0.10, -0.10, 0.215], 0.0042, (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z), { mat: leather, keep });
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // ======================= her legs keep out of the skirts (wardrobe/X2.js) =======================
    // The skirt's chains are pushed out past her legs, level by level down the chains; each chain goes at least most of the way its
    // neighbours go, so the cloth between two chains cannot cut a corner through a knee.
    {
      const T3 = THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.085, NC = CH.length, NL = CH[0].names.length;
      const tipOff = CH.map((c) => c.names.map((nm, k) => new T3.Vector3().subVectors(c.pts[k + 1], c.pts[k])));
      const A = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), V = new T3.Vector3(), M = new T3.Vector3();
      const pq = new T3.Quaternion(), legs = [];
      for (const S of ['R', 'L']) legs.push([new T3.Vector3(), new T3.Vector3(), 0.080, 0.060, 'thigh' + S, 'shin' + S], [new T3.Vector3(), new T3.Vector3(), 0.060, 0.050, 'shin' + S, 'foot' + S]);
      const restOf = (p) => { const out = []; for (const L of legs) { const a = W.SK[L[4]].userData.rest, b = W.SK[L[5]].userData.rest;
        for (let j = 0; j <= 5; j++) out.push(V.copy(a).lerp(b, j / 5).distanceTo(p)); } return out; };
      const restT = CH.map((c) => c.names.map((nm, k) => restOf(c.pts[k + 1])));
      const restM = CH.map((c) => c.names.map((nm, k) => restOf(M.copy(c.pts[k]).add(c.pts[k + 1]).multiplyScalar(0.5))));
      const push = (p, RD, out) => {
        E.set(p.x - Hc.x, 0, p.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return false; E.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0;
        legs.forEach((L, li) => { for (let k = 0; k <= 5; k++) { const t = k / 5; V.copy(L[0]).lerp(L[1], t); const Rr = Math.min(L[2] + (L[3] - L[2]) * t + PAD, RD[li * 6 + k] - 0.004);
          const vx = p.x - V.x, vy = p.y - V.y, vz = p.z - V.z, cc = vx * vx + vy * vy + vz * vz - Rr * Rr; if (cc >= 0) continue;
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
            ANG[ci] = 0; Q[ci].identity(); let best = 0;
            if (push(Tp[ci], restT[ci][k], dm)) { dT.copy(Tp[ci]).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dT), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dT); } }
            M.copy(P[ci]).add(Tp[ci]).multiplyScalar(0.5);
            if (push(M, restM[ci][k], dm)) { dM.copy(M).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dM), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dM); } }
            ANG[ci] = best;
          }
          for (let ci = 0; ci < NC; ci++) {
            let qq = Q[ci], a0 = ANG[ci];
            for (const cj of [(ci + 1) % NC, (ci + NC - 1) % NC]) if (ANG[cj] * 0.6 > a0) { a0 = ANG[cj] * 0.6; qq = new T3.Quaternion().slerp(Q[cj], 0.6); }
            if (a0 > 1e-4) turn(SK[CH[ci].names[k]], qq);
          }
        }
      });
    }

    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts']);
    // her thighs and knees can never be seen under the long skirts: not drawn, so a raised knee (kneel, squat) cannot come through them
    W.hideSkin((x, y, z) => y > 0.42, ['dollLeg']);
    W.hideSkin((x, y, z) => y < BT - 0.016, ['dollTrunk']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl > 0.035 && f.sl < SL2 - 0.012; }, ['arm']);
    W.hideSkin((x, y, z) => { const s = x < 0 ? -1 : 1; DOLL.toLocal(s, x, z, L2); return y < shoeTop(L2[1]) - 0.008; }, ['dollFoot', 'toenail']);

    // ======================= the paintings: edges take the cloth just outside them =======================
    W.afterPaint((parts) => {
      for (const p of parts) {
        if (p.key === 'c5Scarf' || p.key === 'c5ScarfKnot') {        // the bun stands higher than the painted one: the scarf reads the painted scarf's height
          const A = p.mesh.geometry.attributes.aPP; for (let i = 0; i < A.count; i++) { const y = A.getY(i); if (y > HC[1]) A.setY(i, HC[1] + (y - HC[1]) * 0.85); } A.needsUpdate = true; continue; }
        // the back of the blouse beside her arms: the side painting shows background between her arm and back there (dark), so the
        // blouse behind her side reads the back painting
        if (p.key === 'c5Blouse') {
          const g = p.mesh.geometry, A = g.attributes.aPP, E = g.attributes.aPE;
          for (let i = 0; i < A.count; i++) { const z = A.getZ(i); E.setZ(i, E.getZ(i) * sm(-0.075, -0.045, z)); }
          E.needsUpdate = true;
        }
        // the side painting has her right forearm and hand over her hip (forward of where her own arm is in the paint pose, so the
        // shared clean-up of painted arms misses it); cloth there reads the front and back paintings (her left side reads the same
        // side painting, mirrored)
        if (p.key === 'c5Blouse' || p.key === 'c5Overskirt' || p.key === 'c5Shawl') {
          const g = p.mesh.geometry, A = g.attributes.aPP, E = g.attributes.aPE;
          for (let i = 0; i < A.count; i++) { const x = A.getX(i), y = A.getY(i), z = A.getZ(i); if (Math.abs(x) < 0.02) continue;
            const zc = lerp(-0.045, 0.040, cl((1.06 - y) / 0.30, 0, 1)), k = sm(1.13, 1.10, y) * sm(0.68, 0.71, y) * sm(zc - 0.085, zc - 0.060, z) * sm(zc + 0.100, zc + 0.075, z);
            if (k > 0) E.setZ(i, E.getZ(i) * (1 - k)); }
          E.needsUpdate = true;
        }
        if (p.key !== 'c5Blouse') continue;
        // the frill and elastic at the neckline: read a little lower, on the elastic, not on her skin above it
        const g = p.mesh.geometry, A = g.attributes.aPP, P = g.attributes.position;
        for (let i = 0; i < A.count; i++) { const y = P.getY(i); if (y > BT - 0.004) A.setY(i, A.getY(i) - 0.006); }
        A.needsUpdate = true;
      }
    });
  },
};
