// D6, the winter dress and hooded cloak (D6A.png, D6B.png): a long-sleeved charcoal-grey wool dress with a high round neck, fitted to
// her waist, its skirt falling to her ankles; over it a deep-red wool cloak lined with cream wool, fastened at the base of her neck
// with a round brass clasp, falling from her shoulders to mid-calf, open down the front; her arms come out through it (a slit each
// side, below the part that drapes over her shoulders and upper arms); its hood down, lying in soft folds on her upper back;
// tall brown leather boots to just below her knees.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.D6 = {
  name: 'Winter dress and hooded cloak', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smin, smax, prof, DOLL } = W;
    const F = W.F, Fs = W.Fsnug;
    const LIFT = 0.010;                                   // the boots' soles: she stands this much higher
    const DEG = PI / 180;
    // ----- materials -----
    const wool = W.paint({ rough: 0.95, emis: 0.26 }), woolD = W.paint({ rough: 0.95, double: true, emis: 0.26 });
    const red = W.paint({ rough: 0.97, emis: 0.24, env: 0.12 });
    const cream = W.std({ color: W.lin('#d6bc9c'), roughness: 0.95, envMapIntensity: 0.15 });
    const leather = W.paint({ rough: 0.55, env: 0.3 });
    const brass = W.std({ color: W.lin('#c09450'), metalness: 0.85, roughness: 0.30 });

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
    const flipAll = (idx) => { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } };

    // =====================================================================================================================
    // the dress: a fitted bodice with a high round neck (her body swollen), long fitted sleeves, and an A-line skirt from her waist to
    // her ankles on the soft chains
    // =====================================================================================================================
    const NECK = (x, z) => lerp(1.352, 1.372, sm(0.3, 2.4, Math.abs(Math.atan2(x, z + 0.012))));
    const B_BOT = 0.995;
    const bodR = (x, y, z) => Math.max(B_BOT - y, y - NECK(x, z));
    const bodTh = (x, y, z) => { const nk = NECK(x, z); return 0.0034 + 0.0014 * sm(nk - 0.013, nk - 0.006, y); };
    W.snug('d6Bodice', bodR, bodTh, [-0.185, 0.185, 0.985, 1.392, -0.13, 0.118], 0.0058, { mat: wool });

    // the sleeves: from round her shoulder (the top edge over the bodice's shoulder) to her wrist, a cuff turned in at the wrist
    const SLC = 0.444;
    const slTop = (a) => lerp(-0.036, 0.072, Math.pow((1 - Math.cos(a)) / 2, 1.4));
    const slOff = (sl, a) => 0.0040 + 0.0016 * sm(0.06, -0.03, sl) + 0.0010 * sm(0.40, SLC, sl) + 0.0012 * sm(0.0, 0.12, sl) * sm(0.30, 0.18, sl) * Math.max(0, -Math.sin(a));
    for (const S of ['R', 'L']) {
      const NU = 40, rings = [], SLs = [];
      const ringAt = (f, e0, slFix) => { const ring = [], sls = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, sl = slFix != null ? slFix : lerp(slTop(a), SLC, f);
          const p = W.armPt(S, sl, a), c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
          const d = norm(sub(p, ax)); ring.push(add(p, d, e0 != null ? e0 : slOff(sl, a))); sls.push([sl, a]); }
        rings.push(ring); SLs.push(sls); };
      const N1 = 46; for (let i = 0; i <= N1; i++) { const t = i / N1; ringAt(Math.pow(t, 1.15)); }
      ringAt(1, 0.0028, SLC + 0.0016); ringAt(1, 0.0016, SLC); ringAt(1, 0.0016, SLC - 0.020);
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('d6Sleeve' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, SLC); const [sl, a] = SLs[r][j % NU];
        const wa = W.wArmSL(S, Math.max(sl, 0.0), a); return sl < 0.03 ? W.mixW(wa, W.wBody(x, y, z), 0.35 * sm(0.03, -0.015, sl)) : wa; }, { mat: wool });
    }

    // ----- the skirt -----
    const ZC = -0.024, SKC = ZC, TOP = 1.050, HEM = 0.245;
    // her body's outline round the skirt's middle line, by height and angle (from outside in, so her legs count as one)
    const NA = 72, YB0 = 1.08, YB1 = 0.64, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; let fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    // the flare (half width, front and back from the middle line) read from the paintings
    const FL = [[1.05, [0.120, 0.100, 0.040]], [0.95, [0.172, 0.128, 0.112]], [0.85, [0.190, 0.142, 0.134]], [0.75, [0.202, 0.152, 0.150]], [0.60, [0.214, 0.163, 0.165]],
      [0.45, [0.222, 0.172, 0.172]], [0.40, [0.226, 0.176, 0.176]], [0.32, [0.232, 0.182, 0.182]], [0.245, [0.237, 0.187, 0.187]]];
    const flareR = (y, a) => { const v = prof(FL, y, true), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2]; return 1 / Math.sqrt((s / v[0]) * (s / v[0]) + (c / rz) * (c / rz)); };
    const clear = (y) => lerp(0.0075, 0.012, sm(1.03, 0.90, y));
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), 0.025);
    const gAmp = (y) => lerp(0.0018, 0.010, Math.pow(sm(TOP, HEM, y), 0.8));
    const fold = (a, y) => { const t = sm(TOP, HEM, y), ph = 0.4 * t * Math.sin(2 * a + 0.4);
      return 0.75 * Math.sin(a * 16 + ph + 0.6 * Math.sin(a * 3)) + 0.25 * Math.sin(a * 27 + 1.3 + ph * 1.5); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    {
      const NU = 120, ys = [], NV = 46; for (let i = 0; i <= NV; i++) { const t = i / NV; ys.push(lerp(TOP, HEM, t * t * 0.3 + t * 0.7)); }
      const rings = [];
      const at = (y, a, dr) => { const r = skirtR(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
      const hemY = (a) => HEM + 0.003 * Math.sin(a * 3 + 1);
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(TOP + 0.002, a, -0.003)); } rings.push(ring); }
      for (const y of ys) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, yy = y === HEM ? hemY(a) : lerp(y, hemY(a), sm(0.45, HEM, y)); ring.push(at(yy, a)); } rings.push(ring); }
      { const r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hemY(a); r1.push(at(h - 0.002, a, -0.0032)); r2.push(at(h + 0.026, a, -0.0042)); } rings.push(r1, r2); }
      const g = orient(W.loft(rings, {}), rings);
      // its front above her knees goes most of the way with her thighs, so a raised thigh carries the cloth on top of it (squat, kneel)
      const wSk = (x, y, z) => { const w = W.wSkirt(x, y, z), ca = Math.cos(Math.atan2(x, z - SKC)), fr = sm(0.20, 0.70, ca) * sm(0.98, 0.86, y) * sm(0.50, 0.63, y);
        if (fr < 0.001) return w; const t = sm(-0.05, 0.05, x); return W.mixW(w, [W.BI.thighR, 1 - t, W.BI.thighL, t], 0.85 * fr); };
      W.part('d6Skirt', g, (x, y, z) => wSk(x, y, z), { mat: woolD });
    }

    // =====================================================================================================================
    // the cloak. Its outside is a sheet round her from one front edge, over her shoulders and round her back, to the other; at each
    // height and angle round her (theta: 0 her front, +PI/2 her left) it lies at radius rC(theta, y) from the line x = 0, z = ZC:
    // over what it covers (her dress, and her arms where it drapes over them), hanging (it cannot come in faster than it falls), and
    // flared out below. Each side has a slit her arm comes out through, from just under the drape over her upper arm to below her hand.
    // The lining (cream) is the same sheet 4.5 mm inside, turned round each front edge onto the outside as the cream edge band.
    // =====================================================================================================================
    const Y_ST = 1.215, Y_SB = 0.585, TH = 0.0045, AP = W.A_POSE;
    const armSD = (S, x, y, z) => {                      // her rest arm: roughly how far a point is outside its skin
      const f = W.armFrame(S, x, y, z), sl = cl(f.sl, -0.046, 0.456), p = W.armPt(S, sl, f.a), sh = W.restPts['sh' + S], d = W.armDir[S];
      const cx = sh.x + d.x * sl, cy = sh.y + d.y * sl, cz = sh.z + d.z * sl;
      return Math.hypot(x - cx, y - cy, z - cz) - Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz);
    };
    const limbSD = (S, x, y, z) => {                     // her arm and, roughly, her hand: below the wrist a flat oval, palm toward her, 18 cm long
      const f = W.armFrame(S, x, y, z); if (f.sl <= 0.456) return armSD(S, x, y, z);
      const sh = W.restPts['sh' + S], d = W.armDir[S], s = S === 'L' ? 1 : -1, sl = Math.min(f.sl, 0.635), cx = sh.x + d.x * sl, cy = sh.y + d.y * sl, cz = sh.z + 0.012;
      const dx = (x - cx) * s * Math.cos(AP) + (y - cy) * Math.sin(AP), dz = z - cz, rx = 0.016, rz = 0.046 * (1 - 0.35 * sm(0.55, 0.635, sl));
      return (Math.hypot(dx / rx, dz / rz) - 1) * Math.min(rx, rz) + Math.max(0, f.sl - 0.635);
    };
    const TY0 = 1.40, TDY = 0.005, TNY = Math.round((TY0 - 0.37) / TDY) + 1, TNA = 73, ENV = new Float32Array(TNY * TNA);
    const AH0 = new Float32Array(TNY).fill(9), AH1 = new Float32Array(TNY).fill(-9);
    const ENVD = new Float32Array(TNY * TNA);            // the same without her arms: her dress alone
    const march = (G) => { let r = 0.40, g = G(r), st = 0.002; while (g > 0 && r > 0) { st = Math.max(0.7 * g, 0.0015); r -= st; g = G(r); }
      if (r <= 0) return 0; let lo = r, hi = r + st; for (let k = 0; k < 10; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };
    for (let ai = 0; ai < TNA; ai++) {
      const th = (ai / (TNA - 1)) * PI, sa = Math.sin(th), ca = Math.cos(th);
      for (let yi = 0; yi < TNY; yi++) {
        const y = TY0 - yi * TDY, withArm = y > 1.03;
        const GD = (r) => y > 0.93 ? Fs(sa * r, y, ZC + ca * r) - 0.0040 : 1;
        const GA = (r) => Math.min(GD(r), armSD('L', sa * r, y, ZC + ca * r) - 0.0050 - 0.004 * sm(1.25, 1.15, y));
        let rd = march(GD); if (y < TOP + 0.01) rd = Math.max(rd, baseR(y, th) + gAmp(y));
        ENVD[yi * TNA + ai] = rd; ENV[yi * TNA + ai] = withArm ? Math.max(rd, march(GA)) : rd;
      }
      for (let yi = 1; yi < TNY; yi++) for (const E of [ENV, ENVD]) E[yi * TNA + ai] = Math.max(E[yi * TNA + ai], E[(yi - 1) * TNA + ai] - 0.12 * TDY);      // it hangs
    }
    const tabAt = (E, th, y) => { const fy = cl((TY0 - y) / TDY, 0, TNY - 1.001), i = Math.floor(fy), u = fy - i, fa = cl(Math.abs(th) / PI * (TNA - 1), 0, TNA - 1.001), j = Math.floor(fa), v = fa - j;
      return lerp(lerp(E[i * TNA + j], E[i * TNA + j + 1], v), lerp(E[(i + 1) * TNA + j], E[(i + 1) * TNA + j + 1], v), u); };
    const envAt = (th, y) => tabAt(ENV, th, y), dressAt = (th, y) => tabAt(ENVD, th, y);
    // the slit's lips: a little in front of and behind her arm and hand (their widest reach over 2 cm up or down, smoothed), closing below her hand
    const LF = new Float32Array(TNY), LB = new Float32Array(TNY);
    {
      const put = (p) => { const yi = Math.round((TY0 - p[1]) / TDY); if (yi < 0 || yi >= TNY) return; const th = Math.atan2(p[0], p[2] - ZC); AH0[yi] = Math.min(AH0[yi], th); AH1[yi] = Math.max(AH1[yi], th); };
      for (let sl = 0.0; sl <= 0.456; sl += 0.003) for (let j = 0; j < 36; j++) put(W.armPt('L', sl, (j / 36) * TAU));
      { const sh = W.restPts.shL, d = W.armDir.L; for (let sl = 0.456; sl <= 0.635; sl += 0.004) { const rz = 0.046 * (1 - 0.35 * sm(0.55, 0.635, sl));
        for (let j = 0; j < 28; j++) { const t = (j / 28) * TAU, o = 0.016 * Math.cos(t); put([sh.x + d.x * sl + o * Math.cos(AP), sh.y + d.y * sl + o * Math.sin(AP), sh.z + 0.012 + rz * Math.sin(t)]); } } }
      const i0 = Math.round((TY0 - Y_ST) / TDY), A0 = new Float32Array(TNY), A1 = new Float32Array(TNY); let l0 = 1.2, l1 = 1.8;
      for (let yi = TNY - 1; yi >= 0; yi--) { if (AH0[yi] < 9) { l0 = AH0[yi]; l1 = AH1[yi]; } }
      for (let yi = 0; yi < TNY; yi++) { let a = 9, b = -9; for (let k = -4; k <= 4; k++) { const q = cl(yi + k, 0, TNY - 1); if (AH0[q] < 9) { a = Math.min(a, AH0[q]); b = Math.max(b, AH1[q]); } }
        if (a < 9) { l0 = a; l1 = b; } A0[yi] = l0; A1[yi] = l1; }
      for (let yi = 0; yi < i0; yi++) { A0[yi] = A0[i0]; A1[yi] = A1[i0]; }
      for (let pass = 0; pass < 12; pass++) for (const A of [A0, A1]) { const c = A.slice(); for (let yi = 1; yi < TNY - 1; yi++) A[yi] = (c[yi - 1] + 2 * c[yi] + c[yi + 1]) / 4; }
      for (let yi = 0; yi < TNY; yi++) { const y = TY0 - yi * TDY, t = sm(Y_SB - 0.01, 0.665, y), f = A0[yi] - 5 * DEG, b = A1[yi] + 6 * DEG, m = (f + b) / 2;
        LF[yi] = lerp(m - 5 * DEG, f, t); LB[yi] = lerp(m + 5 * DEG, b, t); }
    }
    const lipAt = (L, y) => { const fy = cl((TY0 - y) / TDY, 0, TNY - 1.001), i = Math.floor(fy); return lerp(L[i], L[i + 1], fy - i); };
    // its flare: half width, depth in front and behind the middle line, by height (rest pose)
    const CXW = [[1.36, 0.05], [1.30, 0.10], [1.24, 0.156], [1.18, 0.180], [1.10, 0.202], [1.00, 0.226], [0.90, 0.246], [0.80, 0.258], [0.70, 0.270], [0.60, 0.281], [0.50, 0.292], [0.40, 0.302]];
    const CZB = [[1.36, 0.05], [1.30, 0.07], [1.22, 0.09], [1.15, 0.104], [1.10, 0.112], [1.00, 0.128], [0.90, 0.144], [0.80, 0.157], [0.70, 0.170], [0.60, 0.182], [0.50, 0.193], [0.40, 0.203]];
    const CZF = 0.045, CPW = 2.4, CLR = 0.0065;
    const cFlare = (th, y) => { const s = Math.abs(Math.sin(th)), c = Math.cos(th), xw = prof(CXW, y, true), rz = c >= 0 ? CZF : prof(CZB, y, true);
      return 1 / Math.pow(Math.pow(s / xw, CPW) + Math.pow(Math.abs(c) / rz, CPW), 1 / CPW); };
    const rC = (th, y) => smax(envAt(th, y) + CLR, cFlare(th, y), 0.02);
    // the front edges (x of the edge, the paintings' cream band's inner side) and the band's width
    const XE = [[1.338, 0.008], [1.32, 0.017], [1.30, 0.030], [1.28, 0.044], [1.26, 0.058], [1.24, 0.069], [1.20, 0.082], [1.15, 0.092], [1.10, 0.101], [1.05, 0.110],
      [1.00, 0.119], [0.95, 0.127], [0.90, 0.133], [0.85, 0.138], [0.75, 0.144], [0.65, 0.148], [0.55, 0.150], [0.40, 0.150]];
    const BW = [[1.33, 0.006], [1.20, 0.009], [1.00, 0.012], [0.80, 0.015], [0.60, 0.017], [0.40, 0.019]];
    const thE = (y) => { const xe = prof(XE, y, true); let lo = 0.005, hi = 1.4; for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2; if (rC(m, y) * Math.sin(m) < xe) lo = m; else hi = m; } return (lo + hi) / 2; };
    const N0 = 8, N1 = 10, N2 = 25, NC = N0 + N1 + N2, SF = 0.17, SB = 0.36;
    const sOf = (k) => k <= N0 ? SF * k / N0 : k <= N0 + N1 ? SF + (SB - SF) * (k - N0) / N1 : SB + (1 - SB) * (k - N0 - N1) / N2;
    const thOf = (s, y) => { const a = thE(y), b = lipAt(LF, y), c = lipAt(LB, y);
      return s <= SF ? lerp(a, b, s / SF) : s <= SB ? lerp(b, c, (s - SF) / (SB - SF)) : lerp(c, PI, (s - SB) / (1 - SB)); };
    const yTop = (th) => 1.336 + 0.032 * sm(0.15, 2.2, th);
    const yHem = (th) => 0.416 - 0.013 * sm(1.2, 2.8, th) + 0.002 * Math.sin(th * 9);
    // the left half's columns: dense points down each, then the same number of rows on each, spaced by length along it
    const YK = 1.25, NT = 34, NBR = 108, NR = NT + NBR, COLS = [];
    // the slit's top: high in front of her arm, down to her elbow behind it (the drape over her upper arm); the rows bend to meet it
    const ySTk = (k) => lerp(1.225, 1.080, Math.pow(cl((k - N0) / N1, 0, 1), 1.15));
    const IS = Math.round(NBR * (YK - 1.152) / (YK - 0.42)), IB = Math.round(NBR * (YK - Y_SB) / (YK - 0.42));
    const RS = NT + IS, RB = NT + IB;                    // rows of the slit's top and bottom
    for (let k = 0; k <= NC; k++) {
      const s = sOf(k), y0 = yTop(thOf(s, 1.33)), y1 = yHem(thOf(s, 0.42)), pts = [], ths = [], col = [], cth = [];
      const at = (yy) => { const th = thOf(s, yy), r = rC(th, yy); return { p: [r * Math.sin(th), yy, ZC + r * Math.cos(th)], th }; };
      for (let y = y0; y > YK; y -= 0.00125) { const q = at(y); pts.push(q.p); ths.push(q.th); }
      { const q = at(YK); pts.push(q.p); ths.push(q.th); }
      const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
      const L = cum[cum.length - 1]; let q = 1;
      for (let i = 0; i < NT; i++) { const u = L * i / NT; while (q < cum.length - 1 && cum[q] < u) q++; const f = (u - cum[q - 1]) / Math.max(1e-9, cum[q] - cum[q - 1]);
        const a = pts[q - 1], b = pts[q]; col.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)]); cth.push(lerp(ths[q - 1], ths[q], f)); }
      const yb = (i) => lerp(YK, y1, i / NBR), dl = ySTk(k) - yb(IS);
      for (let i = 0; i <= NBR; i++) { const g = i <= IS ? i / IS : Math.max(0, 1 - (i - IS) / (IB - IS)), q2 = at(yb(i) + dl * g); col.push(q2.p); cth.push(q2.th); }
      COLS.push({ s, pts: col, th: cth });
    }
    // the whole sheet: columns from her right front edge round her back to her left front edge
    const CW = 2 * NC + 1, colOf = (c) => c <= NC ? { k: c, sg: -1 } : { k: 2 * NC - c, sg: 1 };
    const P = [], Th = [], Kk = [];
    for (let i = 0; i <= NR; i++) for (let c = 0; c < CW; c++) { const { k, sg } = colOf(c), p = COLS[k].pts[i]; P.push([sg * p[0], p[1], p[2]]); Th.push(sg * COLS[k].th[i]); Kk.push(k); }
    const vid = (i, c) => i * CW + c;
    // which quads are there: none in the slits between the lips, from under the drape to below her hand
    const quadOn = (i, c) => { const k0 = Math.min(Kk[vid(i, c)], Kk[vid(i, c + 1)]), k1 = Math.max(Kk[vid(i, c)], Kk[vid(i, c + 1)]);
      if (k0 < N0 || k1 > N0 + N1) return true; return !(i >= RS && i < RB); };
    const ON = []; for (let i = 0; i < NR; i++) for (let c = 0; c < CW - 1; c++) ON.push(quadOn(i, c));
    const on = (i, c) => i >= 0 && i < NR && c >= 0 && c < CW - 1 && ON[i * (CW - 1) + c];
    const oPos = [], oIdx = [];
    for (const p of P) oPos.push(p[0], p[1], p[2]);
    for (let i = 0; i < NR; i++) for (let c = 0; c < CW - 1; c++) if (on(i, c)) { const a = vid(i, c), b = a + 1, d = vid(i + 1, c), e = d + 1; oIdx.push(a, d, b, b, d, e); }
    // face outward (the back middle: away from her)
    { const nor = W.computeNormals(oPos, oIdx), v = vid(NR >> 1, NC); if (nor[v * 3 + 2] > 0) flipAll(oIdx); }
    const oNor = W.computeNormals(oPos, oIdx);
    const Nv = (v) => norm([oNor[v * 3], oNor[v * 3 + 1], oNor[v * 3 + 2]]);
    const PIN = P.map((p, v) => add(p, Nv(v), -TH));
    // ----- the weights: her chest and back above, the skirt's chains below; round her arm (the drape over it and the slit's lips) her upper arm -----
    const wCloakAt = (v) => {
      const p = P[v], th = Th[v], y = p[1], at = Math.abs(th), S = th < 0 ? 'R' : 'L', sg = th < 0 ? -1 : 1;
      const re = Math.max(0.02, envAt(at, y) - 0.012), q = [sg * re * Math.sin(at), y, ZC + re * Math.cos(at)];
      let w = y > 1.13 ? W.wBody(q[0], q[1], q[2]) : y < 0.95 ? W.wSkirt(p[0], p[1], p[2]) : W.mixW(W.wBody(q[0], q[1], q[2]), W.wSkirt(p[0], p[1], p[2]), sm(1.13, 0.95, y));
      // how much her upper arm carries it
      const thF = lipAt(LF, y), thB = lipAt(LB, y), f = W.armFrame(S, p[0], p[1], p[2]), up = sm(-0.065, 0.035, f.sl);
      // over her shoulder and upper arm (above the slit) her upper arm carries it, less toward her front and back; beside the slit a
      // little of it, fading out by her elbow (below that the skirt's chains carry it, and a frame hook keeps them off her forearm)
      const ang = at < thF ? sm(thF - 0.40, thF - 0.02, at) : at <= thB ? 1 : 1 - sm(thB + 0.05, thB + 0.55, at);
      const yst = ySTk(Kk[v]), side = at < thF ? 0.35 : at > thB ? 0.55 : 1, vert = y >= yst - 0.002 ? 1 : lerp(side, 1, sm(yst - 0.10, yst, y)) * sm(0.97, 1.10, y);
      const wa = cl(ang * up * vert, 0, 1);
      if (wa > 0.002) w = W.mixW(w, [W.BI['uarm' + S], 1], wa);
      return w;
    };
    const WC = P.map((p, v) => wCloakAt(v));
    // ----- the outside, with a rounded rim along every open edge but the front edges (the lining turns round those) and the neckline -----
    {
      const pos = oPos.slice(), idx = oIdx.slice(), wts = WC.slice();
      // In each slit, behind her arm, a gusset: the cloth goes in round the inside of her arm, close over her dress, from one lip to
      // the other; so from the side and the front there is red behind her arm. Its top is open under the drape (her arm goes in there).
      { const GT = 1.14;
        for (const sg of [-1, 1]) {
          const gi = [], cols = [];
          for (let kk = N0; kk <= N0 + N1; kk++) cols.push(sg < 0 ? kk : 2 * NC - kk);
          for (let i = RS; i <= RB; i++) { const row = [];
            for (let q = 0; q < cols.length; q++) { const c = cols[q], v = vid(i, c), p = P[v], th = Math.abs(Th[v]), kk = N0 + q;
              const bl = sm(0, 2.6, Math.min(kk - N0, N0 + N1 - kk)) * sm(RB, RB - 7, i);
              const rIn = dressAt(th, p[1]) + 0.0035, rOut = Math.hypot(p[0], p[2] - ZC), r = lerp(rOut, Math.min(rOut, rIn), bl);
              const b = pos.length / 3; pos.push(sg * r * Math.sin(th), p[1], ZC + r * Math.cos(th));
              wts.push(bl > 0.5 ? (p[1] > 1.13 ? W.wBody(sg * (r - 0.012) * Math.sin(th), p[1], ZC + (r - 0.012) * Math.cos(th)) : p[1] < 0.95 ? W.wSkirt(sg * r * Math.sin(th), p[1], ZC + r * Math.cos(th)) : W.mixW(W.wBody(sg * (r - 0.012) * Math.sin(th), p[1], ZC + (r - 0.012) * Math.cos(th)), W.wSkirt(sg * r * Math.sin(th), p[1], ZC + r * Math.cos(th)), sm(1.13, 0.95, p[1]))) : WC[v]);
              row.push({ b, y: p[1] }); }
            gi.push(row); }
          const gIdx = [];
          for (let i = 0; i < gi.length - 1; i++) for (let q = 0; q < cols.length - 1; q++) {
            const A = gi[i][q], B = gi[i][q + 1], C = gi[i + 1][q], D = gi[i + 1][q + 1]; if (Math.max(A.y, B.y) > GT) continue;
            gIdx.push(A.b, C.b, B.b, B.b, C.b, D.b); }
          // face out (away from her middle)
          { let sgn = 0; for (let t = 0; t < gIdx.length; t += 3) { const a = gIdx[t] * 3, b = gIdx[t + 1] * 3, c = gIdx[t + 2] * 3;
              const n = cross([pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]]); sgn += n[0] * pos[a] + n[2] * (pos[a + 2] - ZC); }
            if (sgn < 0) flipAll(gIdx); }
          for (const t of gIdx) idx.push(t);
        } }
      const rim = (v1, v2, outDir) => {             // a rim from outside to inside along edge v1-v2
        const b = pos.length / 3, mk = (v) => { const m = add(add(P[v], Nv(v), -TH / 2), outDir, TH * 0.55); pos.push(m[0], m[1], m[2], PIN[v][0], PIN[v][1], PIN[v][2]); wts.push(WC[v], WC[v]); };
        mk(v1); mk(v2);
        // v1 -> m1 -> in1 ; v2 -> m2 -> in2
        const m1 = b, i1 = b + 1, m2 = b + 2, i2 = b + 3, tri = [[v1, v2, m1], [m1, v2, m2], [m1, m2, i1], [i1, m2, i2]];
        const c = add(add(P[v1], P[v2], 1), outDir, 0); const n0 = norm(cross(sub(P[v2], P[v1]), sub([pos[m1 * 3], pos[m1 * 3 + 1], pos[m1 * 3 + 2]], P[v1])));
        const flip = dot(n0, outDir) < 0;
        for (const t of tri) { if (flip) idx.push(t[0], t[2], t[1]); else idx.push(t[0], t[1], t[2]); }
      };
      const dirOut = (va, vb, vIn) => { const m = [(P[va][0] + P[vb][0]) / 2, (P[va][1] + P[vb][1]) / 2, (P[va][2] + P[vb][2]) / 2]; return norm(sub(m, P[vIn])); };
      for (let i = 0; i < NR; i++) for (let c = 0; c < CW - 1; c++) { if (!on(i, c)) continue;
        if (i + 1 === NR || !on(i + 1, c)) { const a = vid(i + 1, c), b = a + 1; rim(a, b, dirOut(a, b, vid(i, c))); }
        if (i > 0 && i !== RB && !on(i - 1, c)) { const a = vid(i, c), b = a + 1; rim(a, b, dirOut(a, b, vid(i + 1, c))); }
        if (c > 0 && !on(i, c - 1)) { const a = vid(i, c), b = vid(i + 1, c); rim(a, b, dirOut(a, b, vid(i, c + 1))); }
        if (c + 1 < CW - 1 && !on(i, c + 1)) { const a = vid(i, c + 1), b = vid(i + 1, c + 1); rim(a, b, dirOut(a, b, vid(i, c))); }
      }
      W.part('d6Cloak', { pos, idx }, (x, y, z, i) => wts[i], { mat: red });
    }
    // ----- the lining: the inside, turned round each front edge onto the outside as the cream band -----
    {
      const KB = 5, rowPts = [], rowW = [];
      for (let i = 0; i <= NR; i++) {
        const y = P[vid(i, 0)][1], bw = prof(BW, y, true), row = [], rw = [];
        const band = (cEdge, dc) => {                   // points on the outside from the band's inner side to the edge
          const cum = [0], cs = [cEdge]; for (let k = 1; k < 8; k++) { const a = P[vid(i, cEdge + dc * (k - 1))], b = P[vid(i, cEdge + dc * k)]; cum.push(cum[k - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])); cs.push(cEdge + dc * k); }
          const out = [];
          for (let k = 0; k <= KB; k++) { const u = bw * (1 - k / KB); let q = 1; while (q < cum.length - 1 && cum[q] < u) q++; const f = cl((u - cum[q - 1]) / Math.max(1e-9, cum[q] - cum[q - 1]), 0, 1);
            const va = vid(i, cs[q - 1]), vb = vid(i, cs[q]), p = [lerp(P[va][0], P[vb][0], f), lerp(P[va][1], P[vb][1], f), lerp(P[va][2], P[vb][2], f)], n = norm(add(Nv(va), Nv(vb), 1));
            out.push({ p: add(p, n, 0.0025 * (1 - 0.4 * Math.pow(k / KB, 4))), w: WC[va] }); }
          return out;
        };
        const roll = (c, dc) => { const v = vid(i, c), n = Nv(v), t = norm(sub(P[v], P[vid(i, c + dc)])), ctr = add(P[v], n, -TH / 2 + 0.0006);
          return [{ p: add(add(ctr, n, TH / 2 + 0.0004), t, TH * 0.45), w: WC[v] }, { p: add(ctr, t, TH * 0.75), w: WC[v] }, { p: add(add(ctr, n, -TH / 2), t, TH * 0.40), w: WC[v] }]; };
        for (const q of band(0, 1)) { row.push(q.p); rw.push(q.w); }
        for (const q of roll(0, 1)) { row.push(q.p); rw.push(q.w); }
        for (let c = 0; c < CW; c++) { row.push(PIN[vid(i, c)]); rw.push(WC[vid(i, c)]); }
        for (const q of roll(CW - 1, -1).reverse()) { row.push(q.p); rw.push(q.w); }
        for (const q of band(CW - 1, -1).reverse()) { row.push(q.p); rw.push(q.w); }
        rowPts.push(row); rowW.push(rw);
      }
      const LW = rowPts[0].length, OFF = KB + 1 + 3, pos = [], idx = [], wts = [];
      for (let i = 0; i <= NR; i++) for (let c = 0; c < LW; c++) { const p = rowPts[i][c]; pos.push(p[0], p[1], p[2]); wts.push(rowW[i][c]); }
      for (let i = 0; i < NR; i++) for (let c = 0; c < LW - 1; c++) {
        const ci = c - OFF; if (ci >= 0 && ci < CW - 1 && !on(i, ci)) continue;
        const a = i * LW + c, b = a + 1, d = a + LW, e = d + 1; idx.push(a, b, d, b, e, d);
      }
      // face inward (toward her) at the back middle
      { const nor = W.computeNormals(pos, idx), v = (NR >> 1) * LW + OFF + NC; if (nor[v * 3 + 2] < 0) flipAll(idx); }
      W.part('d6CloakLining', { pos, idx }, (x, y, z, i) => wts[i], { mat: cream });
    }
    // ----- the hood's rolled edge round her neck, from the clasp round her back -----
    {
      const rings = [], ws = [];
      for (let c = 0; c < CW; c += 1) {
        const v = vid(0, c), p = P[v], n = Nv(v), t = norm(sub(P[vid(0, Math.min(CW - 1, c + 1))], P[vid(0, Math.max(0, c - 1))])), b = norm(cross(t, n));
        const e = Math.min(c, CW - 1 - c), tp = 0.35 + 0.65 * sm(0, 10, e), hn = 0.0095 * tp, hb = 0.012 * tp, up = b[1] > 0 ? b : [-b[0], -b[1], -b[2]];
        const ctr = add(add(p, n, hn * 0.8), up, 0.004), ring = [];
        for (let j = 0; j < 14; j++) { const a = (j / 14) * TAU; ring.push(add(add(ctr, n, hn * Math.cos(a)), up, hb * Math.sin(a) + 0.002 * Math.sin(2 * a))); }
        rings.push(ring); ws.push(WC[v]);
      }
      const g = orient(W.loft(rings, { capA: true, capB: true }), rings), cols = 15;
      W.part('d6HoodRoll', g, (x, y, z, i) => ws[Math.min(ws.length - 1, Math.floor(i / cols))] || ws[0], { mat: red });
    }
    // ----- the hood, down: a soft pouch lying on her upper back -----
    {
      // the cloak's back: z of its outside at (x, y), from the sheet itself
      const zBack = (x, y) => { const tC = (th) => rC(th, y) * Math.sin(th); let lo = PI / 2, hi = PI; const ax = Math.abs(x);
        for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if (tC(m) > ax) lo = m; else hi = m; } const th = (lo + hi) / 2; return ZC + rC(th, y) * Math.cos(th); };
      const ZB = [], HX0 = -0.14, HDX = 0.01, HNX = 29, HY0 = 1.40, HDY = 0.01, HNY = 28;
      for (let i = 0; i < HNY; i++) for (let j = 0; j < HNX; j++) ZB.push(zBack(HX0 + j * HDX, HY0 - i * HDY));
      const zb = (x, y) => { const fi = cl((HY0 - y) / HDY, 0, HNY - 1.001), i = Math.floor(fi), u = fi - i, fj = cl((x - HX0) / HDX, 0, HNX - 1.001), j = Math.floor(fj), v = fj - j;
        return lerp(lerp(ZB[i * HNX + j], ZB[i * HNX + j + 1], v), lerp(ZB[(i + 1) * HNX + j], ZB[(i + 1) * HNX + j + 1], v), u); };
      const HW = [[1.395, 0.058], [1.375, 0.092], [1.345, 0.112], [1.30, 0.118], [1.26, 0.110], [1.22, 0.090], [1.19, 0.064], [1.165, 0.036], [1.142, 0.008]];
      const HT = [[1.395, 0.016], [1.37, 0.034], [1.33, 0.054], [1.28, 0.068], [1.24, 0.072], [1.20, 0.054], [1.17, 0.034], [1.142, 0.012]];
      const G = (x, y, z) => {
        const hw = Math.max(0.006, prof(HW, y, true)), t0 = prof(HT, y, true), d = zb(x, y) - z;
        const t = t0 * (1 + 0.07 * Math.sin(x * 70 + y * 25) * sm(1.36, 1.30, y)) * (1 - 0.07 * Math.exp(-x * x / 4e-5));
        const qx = Math.pow(Math.abs(x) / hw, 2.4), qd = Math.pow(Math.max(d, 0) / t, 2), q = Math.pow(qx + qd, 0.5);
        let g = (q - 1) * Math.min(hw, t) * 0.8;
        g = smax(g, -d - 0.0035, 0.004);
        g = smax(g, Math.max(1.140 - y, y - 1.398), 0.008);
        return g;
      };
      W.surface('d6Hood', G, [-0.14, 0.14, 1.125, 1.41, -0.26, -0.03], 0.0056, (x, y, z) => { const re = Math.max(0.02, envAt(PI - Math.abs(x) * 3, y) - 0.012); return W.wBody(x * 0.6, y, ZC - re); }, { mat: red });
    }
    // ----- the clasp: a round brass boss at the base of her neck where the front edges meet -----
    {
      const yC = 1.327, th0 = thE(yC), r0 = rC(th0, yC), c0 = [0, yC, ZC + r0 * Math.cos(th0) + 0.0015], n = norm([0, 0.28, 1]), [u, vv] = perp(n);
      const PR = [[0, 0.0082], [0.0035, 0.0080], [0.0062, 0.0071], [0.0082, 0.0056], [0.0098, 0.0047], [0.0118, 0.0049], [0.0138, 0.0056], [0.0158, 0.0051], [0.0172, 0.0036], [0.0177, 0.0016], [0.0168, 0.0], [0.0001, 0.0]];
      const rings = PR.map(([r, h]) => { const ring = []; for (let j = 0; j < 32; j++) { const a = (j / 32) * TAU; ring.push(add(add(add(c0, n, h), u, r * Math.cos(a)), vv, r * Math.sin(a))); } return ring; });
      const g = W.loft(rings, {}); { const nor = W.computeNormals(g.pos, g.idx); if (dot([nor[0], nor[1], nor[2]], n) < 0) flipAll(g.idx); }
      W.part('d6Clasp', g, () => W.wBone('spine3'), { mat: brass });
    }

    // =====================================================================================================================
    // the boots: tall pull-on leather boots to just below her knees, wider at the top
    // =====================================================================================================================
    const BOOT_TOP = 0.462;
    const LAST = [[-0.072, [-0.010, 0.010, 0.040]], [-0.064, [-0.026, 0.024, 0.056]], [-0.046, [-0.035, 0.032, 0.068]], [-0.020, [-0.037, 0.036, 0.077]], [0.010, [-0.039, 0.037, 0.087]],
      [0.040, [-0.040, 0.042, 0.089]], [0.070, [-0.041, 0.050, 0.075]], [0.100, [-0.046, 0.056, 0.061]], [0.130, [-0.048, 0.056, 0.051]], [0.155, [-0.046, 0.047, 0.045]],
      [0.172, [-0.042, 0.033, 0.041]], [0.186, [-0.032, 0.013, 0.035]], [0.196, [-0.012, -0.004, 0.029]]];
    const S0 = W.SOLE, L2 = [0, 0];
    const lastD = (X, Y, Z) => {
      const v = prof(LAST, Z, true), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.012, ry = Math.max(0.004, v[2] - 0.012);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.016, q = Math.pow(Math.pow(ux, 2.6) + Math.pow(uy, 2.6), 1 / 2.6);
      return Math.max((q - 1) * Math.min(rx, Y > yc ? ry : 0.016), -0.074 - Z, Z - 0.199);
    };
    const archLift = (Z) => 0.0065 * sm(-0.026, -0.019, Z) * sm(0.085, 0.048, Z);
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const upper = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const leg = y > 0.06 ? DOLL.fLegOnly(s, x, y, z) - 0.0046 - 0.0045 * sm(0.30, 0.45, y) - 0.0018 * Math.exp(-((y - BOOT_TOP) * (y - BOOT_TOP)) / 2.5e-5) : 1;
        return smax(smin(leg, lastD(X, y, Z), 0.014), y - BOOT_TOP, 0.002); };
      const sole = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const plan = lastD(X, S0 + 0.012, Z) - 0.0028, yb = S0 - LIFT + archLift(Z), yt = S0 + 0.007;
        return smax(plan, Math.max(yb - y, y - yt), 0.0016); };
      const G = (x, y, z) => Math.min(upper(x, y, z), sole(x, y, z));
      const keep = (x, y, z) => !(y > 0.07 && DOLL.fLegOnly(s, x, y, z) < -0.0015);
      const bx = s < 0 ? [-0.16, -0.012] : [0.012, 0.16];
      W.surface('d6Boot' + S, G, [bx[0], bx[1], S0 - LIFT - 0.006, BOOT_TOP + 0.008, -0.10, 0.215], 0.0054, (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z), { mat: leather, keep });
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });

    // Her knees and thighs keep out of the long skirt and the cloak. On each of the skirt's twelve chains, joint by joint from the top,
    // points of the cloth itself (the skirt where it hangs at that chain, at the joint's tip and halfway along; the cloak's outside at
    // the tip) are tested against her thighs and shins (padded); a point inside is moved the shorter way, out from her middle or up
    // onto the leg (the rule the chains themselves use), by turning that stretch of the chain about its top. The stretch below is then
    // turned back so it still hangs as it did: the cloth drapes over a knee and falls from it, it does not stand out stiff.
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.042;
      const legs = [];
      for (const S of ['R', 'L']) legs.push({ a: 'thigh' + S, b: 'shin' + S, ra: 0.080, rb: 0.057 }, { a: 'shin' + S, b: 'foot' + S, ra: 0.057, rb: 0.044 });
      for (const L of legs) { L.A = new T3.Vector3(); L.B = new T3.Vector3(); L.A0 = W.SK[L.a].userData.rest.clone(); L.B0 = W.SK[L.b].userData.rest.clone(); }
      const V = new T3.Vector3();
      const restRD = (p) => { const out = []; for (const L of legs) for (let j = 0; j <= 6; j++) out.push(V.copy(L.A0).lerp(L.B0, j / 6).distanceTo(p)); return out; };
      const JT = CH.map((c) => { const ca = c.a > PI ? c.a - TAU : c.a; return c.names.map((nm, k) => {
        const p0 = c.pts[k], p1 = c.pts[k + 1], pr = [];
        for (const [y, kind] of [[p1.y, 's'], [(p0.y + p1.y) / 2, 's'], [p1.y, 'c']]) {
          if (y > 1.0) continue;
          const r = kind === 's' ? skirtR(Math.max(y, HEM), c.a) : (y > 0.43 ? rC(ca, y) : 0); if (!r) continue;
          const q = new T3.Vector3(r * Math.sin(c.a), y, (kind === 's' ? SKC : ZC) + r * Math.cos(c.a));
          pr.push({ off: q.clone().sub(p0), rd: restRD(q) }); }
        return pr; }); });
      const H = new T3.Vector3(), Pw = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), D = new T3.Vector3(), v1 = new T3.Vector3(), v2 = new T3.Vector3();
      const qb = new T3.Quaternion(), qr = new T3.Quaternion(), pq = new T3.Quaternion(), cq = new T3.Quaternion(), tq = new T3.Quaternion();
      let LEV = null;
      const U = new T3.Vector3(), Wl = new T3.Vector3(), Nl = new T3.Vector3(), Cc = new T3.Vector3(), UP = new T3.Vector3(0, 1, 0);
      // over a level leg (a thigh held forward) the point goes onto the top of the padded leg, one stretch further toward its far end
      // from the stretch's top, at its own distance to the side: so the chain lies along the thigh and falls past the knee
      const onTop = (L, H, p, out) => { const Lr = U.subVectors(L.B, L.A).length(); U.multiplyScalar(1 / Lr); Wl.crossVectors(U, UP).normalize(); Nl.crossVectors(Wl, U);
        const t = cl((Cc.subVectors(H, L.A).dot(U) + H.distanceTo(p)) / Lr, 0, 1.25), R = lerp(L.ra, L.rb, Math.min(t, 1)) + PAD, lat = cl(Cc.subVectors(p, L.A).dot(Wl), -0.95 * R, 0.95 * R);
        return out.copy(L.A).addScaledVector(U, t * Lr).addScaledVector(Wl, lat).addScaledVector(Nl, Math.sqrt(R * R - lat * lat)); };
      const need = (p, rd) => {           // how far p must move (into D), out or up past the padded legs; 0 if clear
        E.set(p.x - Hc.x, 0, p.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return 0; E.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0, lev = null;
        LEV = null;
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

    // her forearms and hands keep out of the cloak's sides (and the skirt's): on each of the skirt's chains beside her arms, a point of the
    // cloak at each joint is kept out of her forearm and hand (capsules, padded), by turning the chain's stretch above it
    {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PADA = 0.022;
      const segs = []; for (const S of ['R', 'L']) { const el = W.restPts['el' + S], wr = W.restPts['wr' + S], d = W.armDir[S], tip = new T3.Vector3(wr.x + d.x * 0.17, wr.y + d.y * 0.17, wr.z + 0.012);
        segs.push({ S, a: 'farm' + S, b: 'hand' + S, ra: 0.036, rb: 0.026, A: new T3.Vector3(), B: new T3.Vector3(), A0: el.clone(), B0: wr.clone() },
                  { S, a: 'hand' + S, b: null, ra: 0.040, rb: 0.030, A: new T3.Vector3(), B: new T3.Vector3(), A0: wr.clone(), B0: tip, off: new T3.Vector3().subVectors(tip, wr) }); }
      const probes = [];
      CH.forEach((c) => { const a = c.a, sa = Math.sin(a), side = Math.abs(sa); if (side < 0.55) return;
        c.names.forEach((nm, k) => { const y = c.pts[k + 1].y; if (y < 0.45) return; const r = rC(a > PI ? a - TAU : a, y), pr = new T3.Vector3(r * sa, y, ZC + r * Math.cos(a));
          const rd = segs.map((sg) => { const ab = sg.B0.clone().sub(sg.A0), t = cl(pr.clone().sub(sg.A0).dot(ab) / ab.lengthSq(), 0, 1); return { t, d: pr.distanceTo(sg.A0.clone().addScaledVector(ab, t)) }; });
          probes.push({ nm, off: pr.clone().sub(c.pts[k]), rd }); }); });
      const H = new T3.Vector3(), Pw = new T3.Vector3(), Q = new T3.Vector3(), AB = new T3.Vector3(), D = new T3.Vector3(), v1 = new T3.Vector3(), v2 = new T3.Vector3(), qa = new T3.Quaternion(), pq = new T3.Quaternion(), M3 = new T3.Matrix4();
      W.onFrame((SK) => {
        for (const sg of segs) { SK[sg.a].getWorldPosition(sg.A); if (sg.b) SK[sg.b].getWorldPosition(sg.B); else { SK[sg.a].getWorldQuaternion(qa); sg.B.copy(sg.off).applyQuaternion(qa).add(sg.A); } }
        for (const pb of probes) {
          const b = SK[pb.nm]; b.getWorldPosition(H); b.getWorldQuaternion(qa); Pw.copy(pb.off).applyQuaternion(qa).add(H);
          let best = 0; D.set(0, 0, 0);
          segs.forEach((sg, si) => { AB.subVectors(sg.B, sg.A); const t = cl(Q.subVectors(Pw, sg.A).dot(AB) / Math.max(1e-8, AB.lengthSq()), 0, 1); Q.copy(sg.A).addScaledVector(AB, t);
            const R = Math.min(lerp(sg.ra, sg.rb, t) + PADA, pb.rd[si].d - 0.004), dd = Pw.distanceTo(Q); if (dd >= R) return;
            v1.subVectors(Pw, Q); v1.y = 0; if (v1.lengthSq() < 1e-8) return; v1.normalize(); const need = R - dd; if (need > best) { best = need; D.copy(v1).multiplyScalar(need); } });
          if (best <= 1e-4) continue;
          v1.subVectors(Pw, H); const len = v1.length(); v2.copy(Pw).add(D).sub(H).setLength(len); v1.normalize(); v2.normalize();
          qa.setFromUnitVectors(v1, v2); b.parent.getWorldQuaternion(pq);
          b.quaternion.premultiply(pq.clone().invert().multiply(qa).multiply(pq)); b.updateMatrixWorld(true);
        }
      });
    }

    // =====================================================================================================================
    // the paint: what the paintings cannot show
    // =====================================================================================================================
    W.afterPaint((parts) => {
      for (const pr of parts) {
        const g = pr.mesh.geometry, PP = g.attributes.aPP, PN = g.attributes.aPN, PE = g.attributes.aPE; if (!PP) continue;
        const pos = g.attributes.position.array, A = PP.array, Nn = PN.array, E = PE.array, n = pos.length / 3;
        if (/^d6(Bodice|Sleeve|Skirt)/.test(pr.key)) {
          // The dress under the cloak (and its sleeves, which the cleaned paintings no longer show) reads the paintings' dress where all
          // three see it, just above its hem, at the same angle round her; between the cloak's front edges and below its hem it reads where it is.
          const slv = /Sleeve/.test(pr.key);
          for (let i = 0; i < n; i++) { const x = A[i * 3], y = A[i * 3 + 1], z = A[i * 3 + 2];
            if (!slv && y < 0.435) continue;
            if (!slv && y < 1.30 && Math.abs(x) < prof(XE, cl(y, 0.44, 1.30), true) - 0.006 && Nn[i * 3 + 2] > 0.3) continue;
            if (slv) { A[i * 3] = cl(x * 0.25, -0.07, 0.07); A[i * 3 + 1] = 0.62 + 0.25 * (y - 0.85); A[i * 3 + 2] = 0.10; Nn[i * 3] = 0; Nn[i * 3 + 1] = 0; Nn[i * 3 + 2] = 1; E[i * 3] = 1; E[i * 3 + 1] = 0; E[i * 3 + 2] = 0; continue; }
            const th = Math.atan2(x, z - SKC), yr = 0.345 + 0.02 * Math.sin(y * 9), rS = skirtR(yr, th);
            A[i * 3] = rS * Math.sin(th); A[i * 3 + 1] = yr; A[i * 3 + 2] = SKC + rS * Math.cos(th); E[i * 3] = 1; E[i * 3 + 1] = 1; E[i * 3 + 2] = 1; }
        }
        if (pr.key === 'd6Hood' || pr.key === 'd6HoodRoll') for (let i = 0; i < n; i++) if (A[i * 3 + 1] > 1.355) A[i * 3 + 1] = 1.355;
        if (/^d6Boot/.test(pr.key)) {
          // the tops of the feet read the front painting's boot shaft (the paintings see them edge on: their shine would be stretched into stripes)
          for (let i = 0; i < n; i++) if (A[i * 3 + 1] < 0.125 && Nn[i * 3 + 1] > 0.35) { A[i * 3 + 1] = 0.16 - 0.25 * (0.125 - A[i * 3 + 1]); Nn[i * 3] = 0; Nn[i * 3 + 1] = 0; Nn[i * 3 + 2] = 1; E[i * 3] = 1; E[i * 3 + 1] = 0; E[i * 3 + 2] = 0; }
          // the boots' shafts under the skirt: the leather just below the hem
          for (let i = 0; i < n; i++) { if (A[i * 3 + 1] > 0.228) { A[i * 3 + 1] = 0.228 - 0.02 * sm(0.228, 0.46, A[i * 3 + 1]); E[i * 3] = Math.max(E[i * 3], 0.6); E[i * 3 + 1] = Math.max(E[i * 3 + 1], 0.6); E[i * 3 + 2] = Math.max(E[i * 3 + 2], 0.6); } }
        }
        if (pr.key === 'd6Cloak') {
          // its front panels read the painting outside the painted cream band (the band is its own cream cloth here)
          for (let i = 0; i < n && i < P.length; i++) { if (Kk[i] >= N0) continue; const y = cl(A[i * 3 + 1], 0.42, 1.33), lim = prof(XE, y, true) + prof(BW, y, true) + 0.012;
            if (Math.abs(A[i * 3]) < lim) A[i * 3] = Math.sign(pos[i * 3]) * lim;
            const zl = prof([[1.25, 0.048], [1.10, 0.056], [0.85, 0.058], [0.60, 0.064], [0.45, 0.068]], y, true); if (A[i * 3 + 2] > zl) A[i * 3 + 2] = zl; }
        }
        PP.needsUpdate = true; PN.needsUpdate = true; PE.needsUpdate = true;
      }
    });

    // =====================================================================================================================
    // what cannot be seen
    // =====================================================================================================================
    W.hideMeshes(['wearBra', 'wearShorts', 'dollFoot', 'toenail']);
    W.hideSkin((x, y, z) => y > 1.005 && bodR(x, y, z) < -0.012, ['dollTrunk']);
    W.hideSkin((x, y, z) => y < BOOT_TOP - 0.016, ['dollLeg']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl < SLC - 0.025; }, ['arm']);
  },
};
