// M2, at home (M2A.png, M2B.png): an oversized T-shirt of washed purple cotton with a ribbed crew neck, dropped shoulders and wide
// half sleeves, hanging loose to the top of her thighs, a small embroidered crescent moon on her left chest; black bike shorts just
// showing under its hem; cream ribbed knee socks with two thin purple stripes; a closed silver laptop in her right hand.
// The paintings' laptop was painted out of the tee (agents/M2/clean.py: the prep was run with --img on the cleaned painting), so the
// cloth behind it is cloth in the model.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.M2 = {
  name: 'At home: oversized tee, bike shorts and knee socks', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, prof, PI, TAU } = W;
    const F = W.F, Fs = W.Fsnug;
    const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * h * k / 6; };
    const smax = (a, b, k) => -smin(-a, -b, k);
    const nrm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const add = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s];
    const cotton = W.paint({ rough: 0.93, double: true, emis: 0.24, env: 0.10 });

    // =====================================================================================================================
    // the tee's body: a closed surface G < 0 (her shoulders and chest with the cloth's thickness, joined to a loose hanging drape),
    // read off along rays from inside her chest, one meridian for each angle round her, from the neckline to the hem. The neck rib
    // and the hem are turned in, so both have thickness and the inside of the hem shows from below.
    // =====================================================================================================================
    const ZC = -0.006, YC = 1.16;
    const HEM = (a) => 0.726;
    const NECK = (a) => { const b = Math.abs(a); return b < PI / 2 ? 1.336 + 0.030 * Math.pow(1 - Math.cos(b), 0.8) : 1.366 + 0.006 * sm(PI / 2, PI, b); };
    // the hanging drape: [half width, front z, back z] by height (the painting's outline, eased round her hips and seat)
    const DR = [[0.70, [0.197, 0.152, -0.166]], [0.80, [0.195, 0.146, -0.164]], [0.90, [0.190, 0.138, -0.158]], [0.98, [0.180, 0.128, -0.149]],
      [1.06, [0.171, 0.120, -0.139]], [1.14, [0.166, 0.112, -0.128]], [1.22, [0.161, 0.102, -0.115]], [1.30, [0.150, 0.090, -0.100]]];
    const PW = 2.8;
    const drapeTop = (x, z) => lerp(1.228, 1.272, sm(0.07, -0.04, z));
    function drape(x, y, z) {
      const d = prof(DR, y, true), hw = d[0], cz = (d[1] + d[2]) / 2, rz = (d[1] - d[2]) / 2;
      const r = Math.pow(Math.pow(Math.abs(x) / hw, PW) + Math.pow(Math.abs(z - cz) / rz, PW), 1 / PW);
      return smax((r - 1) * Math.min(hw, rz), y - drapeTop(x, z), 0.03);
    }
    const OFF = 0.0065;
    const G = (x, y, z) => { const dr = drape(x, y, z); if (y < 1.05) return dr; return smin(smax(Fs(x, y, z) - OFF - 0.0015 * sm(1.30, 1.345, y), 1.10 - y, 0.03), dr, 0.03); };
    const grad = (p) => { const e = 0.001; return nrm([G(p[0] + e, p[1], p[2]) - G(p[0] - e, p[1], p[2]), G(p[0], p[1] + e, p[2]) - G(p[0], p[1] - e, p[2]), G(p[0], p[1], p[2] + e) - G(p[0], p[1], p[2] - e)]); };
    function exitT(ox, oy, oz, dx, dy, dz) {          // the first crossing out of G along a ray from inside
      let t = 0, t0 = 0, v = G(ox, oy, oz);
      for (let k = 0; k < 300; k++) { t0 = t; t += Math.max(0.0015, -v * 0.8); v = G(ox + dx * t, oy + dy * t, oz + dz * t); if (v > 0 || t > 0.7) break; }
      let lo = t0, hi = t;
      for (let k = 0; k < 16; k++) { const m = (lo + hi) / 2; if (G(ox + dx * m, oy + dy * m, oz + dz * m) > 0) hi = m; else lo = m; }
      return (lo + hi) / 2;
    }
    const NU = 128;
    // where the rings fall along each meridian (metres from the neckline): close together at the neck rib and the hem
    function arcStops(L) {
      const s = []; let u = 0;
      while (u < L - 1e-6) { s.push(u); const dn = Math.min(u, L - u); u += dn < 0.03 ? 0.0035 : dn < 0.05 ? 0.0055 : 0.0075; }
      s.push(L); return s;
    }
    const mer = [];                                       // per angle: { pts (dense, neckline to hem), cum (arc length) }
    for (let j = 0; j < NU; j++) {
      const a = (j / NU) * TAU, sa = Math.sin(a), ca = Math.cos(a), pts = [];
      for (let i = 0; i <= 84; i++) {
        const th = 0.05 + (PI / 2 - 0.05) * (i / 84), dx = Math.sin(th) * sa, dy = Math.cos(th), dz = Math.sin(th) * ca, t = exitT(0, YC, ZC, dx, dy, dz);
        pts.push([dx * t, YC + dy * t, ZC + dz * t]);
      }
      for (let y = YC - 0.005; y > HEM(a) + 0.001; y -= 0.005) { const t = exitT(0, y, ZC, sa, 0, ca); pts.push([sa * t, y, ZC + ca * t]); }
      { const y = HEM(a), t = exitT(0, y, ZC, sa, 0, ca); pts.push([sa * t, y, ZC + ca * t]); }
      // start at the neckline
      const yn = NECK(a > PI ? a - TAU : a); let k = 1; while (k < pts.length && pts[k][1] > yn) k++;
      const p0 = pts[k - 1], p1 = pts[k], f = (p0[1] - yn) / Math.max(1e-6, p0[1] - p1[1]);
      const P = [[lerp(p0[0], p1[0], f), yn, lerp(p0[2], p1[2], f)]].concat(pts.slice(k)), cum = [0];
      for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]));
      mer.push({ P, cum, L: cum[cum.length - 1] });
    }
    const at = (m, u) => { let i = 1; while (i < m.cum.length - 1 && m.cum[i] < u) i++; const f = (u - m.cum[i - 1]) / Math.max(1e-9, m.cum[i] - m.cum[i - 1]), a = m.P[i - 1], b = m.P[i]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)]; };
    // every meridian gets the same number of rings: spaced on the shortest one's pattern, stretched to each one's length
    const Lmin = Math.min(...mer.map((m) => m.L)), stops = arcStops(Lmin), NV = stops.length;
    const frac = (i) => stops[i] / Lmin;
    const RIB = 0.020, RIBT = 0.0024, HEMB = 0.022, TH = 0.0034;
    const outer = [];                                     // outer[i][j]
    for (let i = 0; i < NV; i++) outer.push([]);
    for (let j = 0; j < NU; j++) {
      const m = mer[j];
      for (let i = 0; i < NV; i++) {
        // near the ends keep metres (so the rib and hem bands are the same width all round); between, stretch
        const s = stops[i], u = s < 0.05 ? s : (Lmin - s < 0.05 ? m.L - (Lmin - s) : lerp(0.05, m.L - 0.05, (s - 0.05) / (Lmin - 0.1)));
        let p = at(m, u);
        if (u < RIB + 0.003) p = add(p, grad(p), RIBT * (1 - sm(RIB - 0.003, RIB + 0.001, u)));      // the neck rib stands a little proud
        outer[i].push(p);
      }
    }
    // the turned-in edges: the neck rib folds inside and runs down 1.8 cm; the hem turns up 2.2 cm inside
    const ring = (f) => { const r = []; for (let j = 0; j < NU; j++) r.push(f(j)); return r; };
    const nAt = (i, j) => grad(outer[i][j]);
    const iOf = (u, fromEnd) => { let best = 0, bd = 9; for (let i = 0; i < NV; i++) { const d = Math.abs((fromEnd ? Lmin - stops[i] : stops[i]) - u); if (d < bd) { bd = d; best = i; } } return best; };
    const iRib = iOf(0.018, false), iHem = iOf(HEMB, true);
    const n0 = ring((j) => nAt(0, j)), nE = ring((j) => nAt(NV - 1, j));
    const tang = (i0, i1, j) => nrm([outer[i0][j][0] - outer[i1][j][0], outer[i0][j][1] - outer[i1][j][1], outer[i0][j][2] - outer[i1][j][2]]);
    const neckIn = [
      ring((j) => add(outer[iRib][j], nAt(iRib, j), -(OFF * 0.30))),
      ring((j) => add(outer[0][j], n0[j], -(RIBT + OFF * 0.30))),
      ring((j) => add(add(outer[0][j], n0[j], -(RIBT + OFF * 0.30) / 2), tang(0, 1, j), 0.0022)),
    ];
    const hemOut = [
      ring((j) => add(add(outer[NV - 1][j], nE[j], -TH / 2), tang(NV - 1, NV - 2, j), 0.0017)),
      ring((j) => add(outer[NV - 1][j], nE[j], -TH)),
      ring((j) => add(outer[iHem][j], nAt(iHem, j), -TH)),
    ];
    const rings = neckIn.concat(outer, hemOut);
    const body = W.loft(rings, {});
    // face outward: in the middle ring the triangles should face away from her middle line
    function orient(g, iMid, cols, cx, cz) {
      const nor = W.computeNormals(g.pos, g.idx); let sgn = 0;
      for (let j = 0; j < cols - 1; j++) { const v = iMid * cols + j; sgn += nor[v * 3] * (g.pos[v * 3] - cx) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - cz); }
      if (sgn < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
    }
    orient(body, neckIn.length + Math.floor(NV / 2), NU + 1, 0, ZC);

    // =====================================================================================================================
    // the sleeves: wide tubes round her upper arms from over the ball of her shoulder to just above her elbow, roomier underneath and
    // in front (they hang); each cuff turned in. Where a sleeve goes into the tee's body is its dropped shoulder seam.
    // =====================================================================================================================
    const SLC = 0.248, NS_U = 56;
    function sleeveRings(S) {
      const out = [], sls = [];
      const ease = (sl, a) => {
        const lo = sm(0.0, 0.14, sl), ca = Math.cos(a), sa = Math.sin(a);
        return 0.0045 + 0.016 * sm(-0.03, 0.03, sl) + 0.012 * sm(-0.01, 0.05, sl) * Math.max(0, ca) * (1 - 0.5 * lo)    // the dropped shoulder stands out to the side
          + 0.008 * lo + 0.012 * lo * Math.max(0, -ca)                                  // roomier down the arm, and most underneath (it hangs)
          + 0.012 * lo * Math.max(0, sa) + 0.020 * lo * Math.max(0, -sa);              // it billows, more behind than in front
      };
      const pt = (sl, a, extra) => {
        const p = W.armPt(S, sl, a), c0 = W.armPt(S, sl, 0), c1 = W.armPt(S, sl, PI), c2 = W.armPt(S, sl, PI / 2), c3 = W.armPt(S, sl, 3 * PI / 2);
        const c = [(c0[0] + c1[0] + c2[0] + c3[0]) / 4, (c0[1] + c1[1] + c2[1] + c3[1]) / 4, (c0[2] + c1[2] + c2[2] + c3[2]) / 4];
        const d = nrm([p[0] - c[0], p[1] - c[1], p[2] - c[2]]);
        return add(p, d, ease(sl, a) + (extra || 0));
      };
      const N0 = 14, SL0 = -0.046;
      for (let i = 0; i <= N0; i++) sls.push(SL0 + (0.03 - SL0) * (1 - Math.cos(PI / 2 * i / N0)));
      for (let sl = 0.03 + 0.008; sl < SLC - 0.012; sl += 0.008) sls.push(sl);
      for (let sl = SLC - 0.012; sl < SLC - 1e-6; sl += 0.003) sls.push(sl);
      sls.push(SLC);
      const ringAt = (sl, extra) => { const r = []; for (let j = 0; j < NS_U; j++) r.push(pt(sl, (j / NS_U) * TAU, extra)); return r; };
      for (const sl of sls) { out.push(ringAt(sl)); }
      const meta = sls.slice();
      // the cuff: a rounded edge, then the inside turned up 2.2 cm
      out.push(ringAt(SLC + 0.0016, -TH / 2)); meta.push(SLC + 0.0016);
      out.push(ringAt(SLC, -TH)); meta.push(SLC);
      out.push(ringAt(SLC - 0.022, -TH)); meta.push(SLC - 0.022);
      return { rings: out, sls: meta };
    }
    // weights: the sleeve rides on her upper arm; at the cuff a little of her forearm
    const wSleeve = (S, sl, a) => { const w = W.wArmSL(S, Math.max(sl, 0.03), a); return W.mixW([W.BI['uarm' + S], 1], w, 0.55); };

    // ----- one mesh for the tee: body + both sleeves -----
    const pos = [], idx = [], wts = [];
    // high up (over her shoulders and round her neck) a point is carried as the skin right under it is, so the rib cannot part from her neck
    const onSkin = (x, y, z) => { const e = 0.001, f = F(x, y, z), g = nrm([F(x + e, y, z) - F(x - e, y, z), F(x, y + e, z) - F(x, y - e, z), F(x, y, z + e) - F(x, y, z - e)]); return [x - g[0] * f, y - g[1] * f, z - g[2] * f]; };
    const wTee = (x, y, z) => {
      if (y > 1.25) { const q = onSkin(x, y, z), f = F(x, y, z); if (f < 0.02) return W.wBody(q[0], q[1], q[2]); }
      const wb = W.wBody(x, y, z);
      if (y > 1.10) return wb;
      const w = W.mixW(wb, W.wSkirt(x, y, z), 0.9 * sm(1.10, 0.92, y));
      // its front, low down, goes part of the way with her thighs, so a lifted thigh carries the cloth up on top of it
      const fr = sm(0.02, 0.09, z) * sm(1.0, 0.84, y);
      if (fr < 0.001) return w;
      const t = sm(-0.07, 0.07, x), th = sm(0.99, 0.86, y), wTh = [W.BI.thighR, (1 - t) * th, W.BI.thighL, t * th, W.BI.hips, 1 - th];
      return W.mixW(w, wTh, 0.9 * fr);
    };
    const append = (g, wf) => { const base = pos.length / 3; for (let i = 0; i < g.pos.length; i += 3) { pos.push(g.pos[i], g.pos[i + 1], g.pos[i + 2]); wts.push(wf(g.pos[i], g.pos[i + 1], g.pos[i + 2], i / 3)); } for (const v of g.idx) idx.push(v + base); };
    append(body, (x, y, z) => wTee(x, y, z));
    // The turned-in edges take their paint from the cloth just outside them (the rib, the hem band, the cuff), not from what the
    // paintings show beyond the edge (her neck, her shorts, her arm): pairs [point, the point it copies].
    const foldMap = [], C1 = NU + 1;
    { const nN = neckIn.length, rN = nN + iOf(0.008, false), rH = nN + iOf(0.009, true);
      for (let c = 0; c < C1; c++) {
        for (let r = 0; r <= nN; r++) foldMap.push([r * C1 + c, rN * C1 + c]);
        for (let r = nN + NV - 1; r < rings.length; r++) foldMap.push([r * C1 + c, rH * C1 + c]);
      } }
    const nBody = pos.length / 3;
    for (const S of ['R', 'L']) {
      const sr = sleeveRings(S), g = W.loft(sr.rings, { capA: true }), cols = NS_U + 1, nR = sr.rings.length;
      // face outward (the middle ring away from the arm's middle)
      { const iM = Math.floor(nR / 2), c = sr.rings[iM].reduce((s, p) => [s[0] + p[0] / NS_U, s[1] + p[1] / NS_U, s[2] + p[2] / NS_U], [0, 0, 0]);
        const nor = W.computeNormals(g.pos, g.idx); let sgn = 0;
        for (let j = 0; j < NS_U; j++) { const v = iM * cols + j; sgn += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
        if (sgn < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; } }
      { const base = pos.length / 3; let rs = 0, bd = 9; for (let r = 0; r < nR - 3; r++) { const dd = Math.abs(sr.sls[r] - (SLC - 0.008)); if (dd < bd) { bd = dd; rs = r; } }
        for (let c = 0; c < cols; c++) for (let r = nR - 4; r < nR; r++) foldMap.push([base + r * cols + c, base + rs * cols + c]); }
      append(g, (x, y, z, i) => i < nR * cols ? wSleeve(S, sr.sls[Math.floor(i / cols)], ((i % cols) / NS_U) * TAU) : wSleeve(S, sr.sls[0], 0));
    }
    W.part('m2Tee', { pos, idx }, (x, y, z, i) => wts[i], { mat: cotton });

    // =====================================================================================================================
    // the bike shorts: her own black ones (wearShorts) end at 0.758, under the tee's hem; the painted ones show 3 cm below it. So her
    // own shorts stay, and their legs are carried on down to 0.700: a band of the same cloth from just above their hem, a hair thicker,
    // so it covers their hem.
    // =====================================================================================================================
    const SH_HEM = 0.700, SH_TOP = 0.772;
    const shR = (x, y, z) => Math.max(y - SH_TOP, SH_HEM - y);
    const shTh = (x, y, z) => 0.0024 + 0.0008 * sm(SH_HEM + 0.018, SH_HEM + 0.012, y);
    W.snug('m2ShortsLeg', shR, shTh, [-0.21, 0.21, 0.685, 0.79, -0.12, 0.13], 0.0040, { mat: W.meshes.wearShorts.material, keepMat: true });
    W.hideMeshes(['wearBra']);

    // =====================================================================================================================
    // the knee socks: thick cream rib from her toes to 11 cm under her knee, the foot one soft shape (toes together); the purple
    // stripes and the rib come with the paint. Under her sole the knit is pressed thin, so she still stands on the floor.
    // =====================================================================================================================
    const knit = W.paint({ rough: 0.97, emis: 0.30, env: 0.06, color: '#ece5e3' });
    const SOCK_TOP = (z) => 0.444 + 0.008 * sm(0.02, -0.05, z);       // 2 mm under the painted top, so its rim takes no knee
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const R = (x, y, z) => Math.max(y - SOCK_TOP(z), -s * x - 0.004, W.SOLE - 0.0008 - y);       // flat under her sole, on the floor
      const th = (x, y, z) => lerp(0.0012, 0.0046, sm(0.041, 0.052, y)) + 0.0012 * sm(SOCK_TOP(z) - 0.030, SOCK_TOP(z) - 0.022, y)
        + 0.0032 * sm(0.085, 0.115, z) * sm(0.085, 0.065, y);       // over her toes the knit is one soft shape, toes together
      W.snug('m2Sock' + S, R, th, s < 0 ? [-0.17, 0.0, 0.02, 0.48, -0.10, 0.22] : [0.0, 0.17, 0.02, 0.48, -0.10, 0.22], 0.0040, { mat: knit, feet: true });
    }
    W.hideSkin((x, y, z) => y < SOCK_TOP(z) - 0.012, ['dollLeg', 'dollFoot', 'toenail']);
    // After finish() has worked out each painted point's place in the paintings' pose and which views see it, some corrections that only
    // this outfit's paintings need (run once, on the first frame after finish).
    let mended = false;
    W.onFrame(() => {
      if (mended) return;
      const recs = W.meshes.dollTrunk.parent.children.filter((m) => /^m2(Tee|Sock[RL])$/.test(m.name));
      const sock = recs.find((m) => m.name === 'm2SockR'); if (!sock || !sock.geometry.attributes.aPP) return;
      mended = true;
      // The side painting shows the sleeve hanging over her side from 1.04 to 1.29: the tee's body there takes its paint from the front and
      // back. Below, her forearm and the laptop were painted out of the side painting, so it shows the tee's side everywhere, even where
      // the model's own arm stands in front of it in the paintings' pose.
      const tee = recs.find((m) => m.name === 'm2Tee');
      { const Pt = tee.geometry.attributes.position.array, E = tee.geometry.attributes.aPE;
        for (let i = 0; i < nBody; i++) { const y = Pt[i * 3 + 1], e = E.array[i * 3 + 2], lo = 1 - sm(1.01, 1.035, y);
          E.array[i * 3 + 2] = lo + (1 - lo) * e * (1 - sm(1.03, 1.055, y) * (1 - sm(1.275, 1.30, y))); }
        E.needsUpdate = true; }
      for (const key of ['aPP', 'aPN', 'aPE']) { const at = tee.geometry.attributes[key], A = at.array;
        for (const [i, j] of foldMap) { A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; } at.needsUpdate = true; }
      // The painted legs stand 1.5 cm further apart than hers: the socks read the front and back paintings 1.5 cm further out, so their
      // inner sides read sock, not the gap between her legs; the side painting's stripes are 6 mm lower than the front's and back's, so the
      // socks leave it out (the front and back paintings meet at their sides).
      for (const m of recs) { if (!/Sock/.test(m.name)) continue; const a = m.geometry.attributes.aPP, E = m.geometry.attributes.aPE;
        const P = m.geometry.attributes.position.array;
        for (let i = 0; i < a.array.length; i += 3) { const ax = Math.abs(P[i]), cm = W.legAt(Math.max(0.1, P[i + 1]))[3]; a.array[i] += Math.sign(a.array[i]) * (0.015 - 0.15 * (ax - cm)); E.array[i + 2] = 0; }
        a.needsUpdate = true; E.needsUpdate = true; }
    });
    // =====================================================================================================================
    // the laptop: closed, silver, held against her right hip. Her hand is not posed to grip it, so it lies where her open right hand
    // meets it: pressed flat between her palm and her hip, parallel to her palm, its lower half under her fingers. A rigid piece on
    // her right hand's bone (it can be hidden on its own: 'm2Laptop').
    // =====================================================================================================================
    {
      const LW = 0.252, LH = 0.170, LT = 0.0130, RC = 0.013;          // front to back, height, thickness, corner radius
      const d = W.armDir.R, vA = nrm([-d.x, -d.y, -d.z]), wA = [vA[1], -vA[0], 0], uA = [0, 0, 1], Wp = W.restPts.wrR;
      // how far toward her body her hand and wrist come, over the laptop's face
      const loc = (p) => { const q = [p[0] - Wp.x, p[1] - Wp.y, p[2] - Wp.z]; return [q[0] * uA[0] + q[1] * uA[1] + q[2] * uA[2], q[0] * vA[0] + q[1] * vA[1] + q[2] * vA[2], q[0] * wA[0] + q[1] * wA[1] + q[2] * wA[2]]; };
      const HP = W.meshes.handR.geometry.attributes.position.array, hand = [];
      for (let i = 0; i < HP.length; i += 3) hand.push(loc([HP[i], HP[i + 1], HP[i + 2]]));
      for (let sl = 0.36; sl <= 0.458; sl += 0.006) for (let k = 0; k < 24; k++) hand.push(loc(W.armPt('R', sl, (k / 24) * TAU)));
      let vMin = 9, uLo = 9, uHi = -9; for (const h of hand) { vMin = Math.min(vMin, h[1]); if (h[1] < -0.02) { uLo = Math.min(uLo, h[0]); uHi = Math.max(uHi, h[0]); } }
      const v0 = vMin + 0.026, v1 = v0 + LH, uc = (uLo + uHi) / 2 + 0.018;
      let wIn = -9; for (const h of hand) if (h[1] > v0 - 0.005 && h[1] < v1 + 0.005 && Math.abs(h[0] - uc) < LW / 2 + 0.005) wIn = Math.max(wIn, h[2]);
      const wc = wIn + 0.0025 + LT / 2, vc = (v0 + v1) / 2;
      const toW = (u, v, w) => [Wp.x + uA[0] * (uc + u) + vA[0] * (vc + v) + wA[0] * (wc + w), Wp.y + uA[1] * (uc + u) + vA[1] * (vc + v) + wA[1] * (wc + w), Wp.z + uA[2] * (uc + u) + vA[2] * (vc + v) + wA[2] * (wc + w)];
      // the outline: a rounded rectangle, the same points on every ring
      const NCo = 10, outl = [];
      const cs = [[LW / 2 - RC, LH / 2 - RC, 0], [-(LW / 2 - RC), LH / 2 - RC, PI / 2], [-(LW / 2 - RC), -(LH / 2 - RC), PI], [LW / 2 - RC, -(LH / 2 - RC), 1.5 * PI]];
      for (const [cx, cy, a0] of cs) for (let k = 0; k <= NCo; k++) { const a = a0 + (PI / 2) * k / NCo; outl.push([cx, cy, Math.cos(a), Math.sin(a)]); }
      const ringW = (w, inset) => outl.map(([cx, cy, ca, sa]) => toW(cx + ca * (RC - inset), cy + sa * (RC - inset), w));
      // through its thickness: a soft round edge, and the thin line where the lid closes on the base (2/5 of the way from her palm)
      const wl = -LT / 2 + 0.4 * LT, rr = [];
      for (let k = 0; k <= 14; k++) { const ph = -PI / 2 + PI * k / 14, w = (LT / 2) * Math.sin(ph); rr.push([w, 0.0035 * (1 - Math.cos(ph)) + 0.0008 * Math.exp(-Math.pow((w - wl) / 0.00035, 2))]); }
      for (const dw of [-0.0004, 0, 0.0004]) rr.push([wl + dw, 0.0035 * (1 - Math.sqrt(Math.max(0, 1 - Math.pow((wl + dw) / (LT / 2), 2)))) + 0.0008 * Math.exp(-Math.pow(dw / 0.00035, 2))]);
      rr.sort((p, q) => p[0] - q[0]);
      const lr = rr.map(([w, ins]) => ringW(w, ins));
      const lg = W.loft(lr, { capA: true, capB: true });
      orient(lg, Math.floor(lr.length / 2), outl.length + 1, toW(0, 0, 0)[0], toW(0, 0, 0)[2]);
      const alu = W.std({ color: W.lin('#c9c9cc'), metalness: 0.45, roughness: 0.34, envMapIntensity: 0.6 });
      W.part('m2Laptop', lg, () => W.wBone('handR'), { mat: alu });
    }

    // her upper arms inside the sleeves (all but the last 6 cm before the cuff, which can be seen up the sleeve) are not drawn: in a reach
    // the ball of her shoulder would otherwise press out through the sleeve's top
    W.hideSkin((x, y, z) => W.armFrame(x < 0 ? 'R' : 'L', x, y, z).sl < SLC - 0.06, ['arm']);
    // skin always under the tee and the shorts
    W.hideSkin((x, y, z) => {
      if (y > 0.86) { const a = Math.atan2(x, z - ZC); return y < NECK(a) - 0.010 && y > 0.74; }
      return y > SH_HEM + 0.012 && y < 0.77;
    }, ['dollTrunk', 'dollLeg']);
  },
};
