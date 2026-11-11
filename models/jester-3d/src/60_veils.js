
  // ---------- the sheets themselves ----------
  // Their resting shapes follow one envelope measured from her turnaround sprites: half-width (x) and half-depth (z) of the
  // whole costume at each height. The great veil lies on it; each layer beneath sits a little inside the one above.
  const ENV = [[1.30, [0.255, 0.17]], [1.20, [0.295, 0.22]], [1.10, [0.335, 0.24]], [1.00, [0.37, 0.27]], [0.90, [0.395, 0.285]], [0.80, [0.40, 0.305]], [0.70, [0.41, 0.325]],
    [0.60, [0.41, 0.34]], [0.50, [0.40, 0.34]], [0.40, [0.40, 0.335]], [0.30, [0.41, 0.34]], [0.20, [0.425, 0.345]], [0, [0.44, 0.35]]];
  const tri = (x) => Math.abs((((x % 1) + 1.5) % 1) - 0.5) * 2;      // 0 at whole numbers, 1 halfway between
  const ell = (rx, rz, a, y, zc) => V3(rx * Math.sin(a), y, (zc || 0) - rz * Math.cos(a));   // a: angle from the back toward her left
  const envPt = (a, y, inset, k) => { const e = prof(ENV, y, true); return ell((e[0] - inset) * (k || 1), (e[1] - inset) * (k || 1), a, y, 0); };
  // rows spaced evenly along a falling path, stopping where it reaches the hem height
  function dropRows(ctrl, hemY, NR, gamma) {
    const pts = curvePts(ctrl, 160), cum = [0]; let end = pts.length - 1, endF = 0;
    for (let i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
      if (pts[i].y <= hemY && pts[i - 1].y > hemY && i > 8) { end = i; endF = (pts[i - 1].y - hemY) / (pts[i - 1].y - pts[i].y); break; }
    }
    const L = end === pts.length - 1 && endF === 0 ? cum[end] : cum[end - 1] + (cum[end] - cum[end - 1]) * endF, rows = []; let k = 1;
    for (let r = 0; r < NR; r++) {
      const s = L * Math.pow(r / (NR - 1), gamma || 1);
      while (k < pts.length - 1 && cum[k] < s) k++;
      const u = cl((s - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1]), 0, 1), p = pts[k - 1].clone().lerp(pts[k], u);
      rows.push([p.x, p.y, p.z]);
    }
    return rows;
  }
  const wHang = (p) => {                              // bones for a hanging particle (used to lay the sheet out, not to drive it)
    const y = p[1]; if (y > 1.47) return [BI.head, 1];
    if (y > 1.33) { const u = sm(1.33, 1.47, y); return [BI.head, u, BI.spine3, 1 - u]; }
    return wSpine(y);
  };
  function sheerMat(tex, o) {
    const m = new THREE.MeshStandardMaterial({ map: tex.map, alphaMap: tex.alpha, transparent: true, depthWrite: false, roughness: o.rough == null ? 0.6 : o.rough, metalness: 0.05,
      emissive: lin(o.glow || '#ffffff'), emissiveMap: tex.map, emissiveIntensity: o.emi == null ? 0.2 : o.emi, opacity: o.opacity == null ? 1 : o.opacity });
    return sheen(m, o.sheen || '#ffb0d0', 2.2, o.sheenK == null ? 0.3 : o.sheenK);
  }
  function addSheer(cloth, tex, o, order) {            // back faces first, then front faces, so a sheet sorts against itself
    for (const side of [THREE.BackSide, THREE.FrontSide]) {
      const m = sheerMat(tex, o); m.side = side;
      const mesh = new THREE.Mesh(cloth.geo, m); mesh.frustumCulled = false; mesh.renderOrder = order + (side === THREE.FrontSide ? 0.5 : 0);
      mesh.castShadow = side === THREE.FrontSide; mesh.receiveShadow = false; clothGroup.add(mesh); cloth.meshes.push(mesh);
    }
  }
  function addSolid(cloth, tex, o, order) {            // near-opaque cloth: depth-written, so tiers sort themselves and shade each other
    const m = new THREE.MeshStandardMaterial({ map: tex.map, alphaMap: tex.alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: o.rough == null ? 1 : o.rough, metalness: 0, envMapIntensity: 0.25,
      emissive: lin(o.glow || '#ffffff'), emissiveMap: tex.map, emissiveIntensity: o.emi == null ? 0.1 : o.emi });
    sheen(m, o.sheen || '#ffb0d0', 2.4, o.sheenK == null ? 0.2 : o.sheenK);
    const mesh = new THREE.Mesh(cloth.geo, m); mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true; mesh.renderOrder = order; clothGroup.add(mesh); cloth.meshes.push(mesh);
  }
  function addCut(cloth, mat, order) {
    const mesh = new THREE.Mesh(cloth.geo, mat); mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true; mesh.renderOrder = order; clothGroup.add(mesh); cloth.meshes.push(mesh);
  }
  // the black skirt is slim; the wide silhouette is the veils fanned out behind her
  const SKIRT_R = [[1.04, [0.108, 0.086]], [0.975, [0.132, 0.108]], [0.87, [0.158, 0.138]], [0.70, [0.198, 0.180]], [0.50, [0.250, 0.212]], [0.30, [0.262, 0.224]], [0, [0.266, 0.228]]];
  const skirtZc = (y) => 0;
  const skirtPath = (a, fold, nf, ph) => SKIRT_R.map(([y, [rx, rz]]) => { const k = 1 + fold * sm(0.98, 0.5, y) * Math.sin(a * nf + ph); return ell(rx * k, rz * k, a, y, 0); });
  let skirtCloth, overCloth, mantleCloth; const ribbonCloths = [];
  (function buildSkirt() {
    const NC = Q(84, 44), NR = Q(18, 10), cols = [];
    const hem = (a) => { const f = Math.abs(a) / PI; return lerp(0.15, 0.82, Math.pow(sm(0.70, 0.90, f), 1.1)) + 0.07 * tri(a / (TAU / 11)) - 0.02 + 0.03 * (h1(Math.round(a * 20)) - 0.5); };
    for (let c = 0; c < NC; c++) { const a = -PI + (c / NC) * TAU; cols.push(dropRows(skirtPath(a, 0.075, 19, 0.6), hem(a), NR, 1.06)); }
    skirtCloth = makeCloth({ pleat: { n: 34, amp: 0.010, hem: 0.014 }, cols: NC, rows: NR, wrap: true, mask: 1 | 4, margin: 0.007, bend: 0.25, grav: 0.8, drag: 0.02, flutter: 0.5,
      rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.5 : 0.05), weights: (c, r, p) => (r < 2 ? [BI.hips, 0.5, BI.spine1, 0.5] : [BI.hips, 1]),
      uv: (c, r) => [c / NC * 3, 1 - r / (NR - 1)] });
    const tex = raggedTex(1024, 512, '#2b2229', '#4a3d48', '#120d12', 'gauze'); tex.map.wrapS = tex.alpha.wrapS = THREE.RepeatWrapping;
    addCut(skirtCloth, sheen(new THREE.MeshStandardMaterial({ map: tex.map, alphaMap: tex.alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }), '#94848e', 2.2, 0.55), 1);
  })();

  // the olive overskirt: hung from the belt over the black, open in front, falling in gold-trimmed points
  (function buildOverskirt() {
    const A = 140 * DEG, NC = Q(53, 29), NR = Q(16, 10), cols = [];
    const hem = (a) => { const d = Math.abs(a) / DEG; return 0.40 + 0.10 * Math.pow(tri((d - 20) / 40), 0.9) + 0.14 * sm(120, 140, d); };
    for (let c = 0; c < NC; c++) { const a = lerp(-A, A, c / (NC - 1)); cols.push(dropRows(skirtPath(a, 0.07, 21, 2.1).map((p) => { p.x *= 1.07; p.z *= 1.07; return p; }), hem(a), NR, 1.05)); }
    overCloth = makeCloth({ pleat: { n: 20, amp: 0.009, hem: 0.008, ph: 1.1 }, cols: NC, rows: NR, mask: 1 | 4, margin: 0.02, bend: 0.2, grav: 0.7, flutter: 0.8,
      rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.5 : 0.045), weights: (c, r) => (r < 2 ? [BI.hips, 0.5, BI.spine1, 0.5] : [BI.hips, 1]) });
    const otex = raggedTex(1024, 512, '#4a3c1c', '#6e5a2a', '#241c0c', 'olive');
    addCut(overCloth, sheen(new THREE.MeshStandardMaterial({ map: otex.map, alphaMap: otex.alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }), '#b89048', 2.2, 0.3), 4);
  })();

  // two shorter tiers of ragged black gauze above them, as painted: each a little wider than the one beneath, open at the front
  (function buildTiers() {
    const tex = raggedTex(1024, 512, '#2e242b', '#52434e', '#140e13', 'gauze'); tex.map.wrapS = tex.alpha.wrapS = THREE.RepeatWrapping;
    for (const [k, A, hem0, amp, np, ph, NR, order] of [[1.03, 140, 0.30, 0.08, 9, 0.9, Q(18, 10), 4.2], [1.055, 144, 0.44, 0.08, 8, 2.9, Q(15, 9), 4.35], [1.085, 150, 0.58, 0.07, 9, 2.3, Q(12, 7), 4.6], [1.11, 156, 0.73, 0.06, 7, 4.1, Q(9, 6), 4.75]]) {
      const NC = Q(61, 33), cols = [], Ar = A * DEG;
      const hem = (a) => hem0 + amp * (tri(a / (TAU / np) + ph) - 0.4) + 0.035 * (h1(Math.round(a * 23 + ph * 7)) - 0.5) + 0.10 * sm(A - 22, A, Math.abs(a) / DEG);
      for (let c = 0; c < NC; c++) {
        const a = lerp(-Ar, Ar, c / (NC - 1));
        cols.push(dropRows(skirtPath(a, 0.10, 23, ph * 3).map((p) => { const f = 1 + (k - 1) * sm(1.04, 0.8, p.y) + 0.015 * sm(0.9, 0.5, p.y); p.x *= f; p.z *= f; return p; }), hem(a), NR, 1.05));
      }
      const cloth = makeCloth({ pleat: { n: np > 10 ? 25 : 22, amp: 0.010, hem: 0.016, ph: ph }, cols: NC, rows: NR, mask: 1 | 4, margin: 0.012 + (k - 1) * 0.04, bend: 0.3, grav: 0.7, drag: 0.02, flutter: 0.7,
        rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.5 : 0.07), weights: (c, r) => (r < 2 ? [BI.hips, 0.5, BI.spine1, 0.5] : [BI.hips, 1]),
        uv: (c, r) => [c / (NC - 1) * 3, 1 - r / (NR - 1)] });
      addCut(cloth, sheen(new THREE.MeshStandardMaterial({ map: tex.map, alphaMap: tex.alpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.92 }), '#94848e', 2.2, 0.5), order);
    }
  })();

  // olive shoulder kerchiefs: a small sheer point over each upper arm, gold-trimmed
  (function buildPanels() {
    const tex = veilTex(512, 512, { top: '#3a2c12', mid: '#443416', bottom: '#382a10', glow: '#5e4a20', dark: '#161006', mottle: ['#52401a', '#20170a'], motif: PAL.goldDk, a0: 1, folds: 0.5, stripes: 5, sequins: 120, trim: 0.08, sideTrim: 0.035, dotScale: 1.4, bake: 'olive', bakeTiles: [2, 2] });
    for (const [S, s] of SIDES) {
      const A0 = 66 * DEG, A1 = 132 * DEG, AM = 99 * DEG, NC = Q(17, 11), NR = Q(12, 8), cols = [];
      const hem = (a) => 1.05 + 0.24 * Math.pow(Math.abs(a - AM) / (33 * DEG), 1.1);
      for (let c = 0; c < NC; c++) {
        const a = lerp(A0, A1, c / (NC - 1)), sa = s * a;
        const ctrl = [ell(0.086, 0.080, sa, 1.374, -0.010), ell(0.132, 0.110, sa, 1.344, -0.010), envPt(sa, 1.28, -0.012), envPt(sa, 1.16, -0.014), envPt(sa, 1.02, -0.014), envPt(sa, 0.90, -0.014)];
        cols.push(dropRows(ctrl, hem(a), NR, 1));
      }
      const cloth = makeCloth({ pleat: { n: 5, amp: 0.004, hem: 0.004 }, cols: NC, rows: NR, mask: 1 | 2, margin: 0.020, bend: 0.25, grav: 0.7, flutter: 0.5,
        rest: (c, r) => cols[c][r], pin: (c, r) => (r === 0 ? 1 : r === 1 ? 0.5 : 0.03),
        weights: (c, r, p) => (p[1] > 1.33 ? [BI.spine3, 0.6, BI.neck, 0.4] : p[1] > 1.2 ? [BI['uarm' + S], 0.35, BI.spine3, 0.65] : [BI['uarm' + S], 0.75, BI.spine3, 0.25]) });
      addSolid(cloth, tex, { glow: '#8a7038', emi: 0.06, sheen: '#a88440', sheenK: 0.12 }, 9); cloth.outer = true;
    }
  })();

  // the great veil and the shorter tier beneath it: pinned over the back of the cap, falling past her shoulders, caught at each wrist
  (function buildMantles() {
    const SHEER = { glow: '#d040a0', emi: 0.22, sheen: '#f070b0', sheenK: 0.3, rough: 0.5 }, WINE = { glow: '#c83080', emi: 0.14, sheen: '#e0508c', sheenK: 0.16 }, OLIVE = { glow: '#8a7038', emi: 0.12, sheen: '#c8a050', sheenK: 0.2 };
    const TIERS = [
      // the innermost tier: wine in shadow, the face of the fan seen from the front
      { pleat: { n: 18, amp: 0.012, hem: 0.006 }, A: 114, inset: 0.020, ph: 9, up: 0, cap: 80, flat: 0.76, amp: 0.34, per: 38, shawl: true, order: 6, margin: 0.012, cols: Q(49, 27), rows: Q(40, 22), mat: WINE,
        tex: { top: '#3a061c', mid: '#500a2c', bottom: '#66103a', glow: '#941e58', dark: '#14020a', mottle: ['#7a143c', '#20040c', '#4a0e42'], a0: 1, folds: 0.9, stripes: 15, sequins: 400, trim: 0.03, sideTrim: 0.012, dotScale: 1.4, bake: 'wine', bakeTiles: [8, 4] } },
      // the great veil: deep wine, gold-dotted lines, a band of gold down the middle
      { pleat: { n: 30, amp: 0.010, hem: 0.012, ph: 0.7 }, A: 108, hk: 0.48, rise: 0.0010, inset: 0.012, ph: 0, up: 0, cap: 80, amp: 0.20, order: 8, margin: 0.008, cols: Q(73, 37), rows: Q(52, 28), main: true, sheer: true, mat: SHEER,
        tex: { top: '#5a0c3a', mid: '#78144e', bottom: '#8e2064', glow: '#c040a0', dark: '#2a0620', mottle: ['#a02468', '#3a0a2a', '#6a2090'], a0: 0.58, folds: 0.5, stripes: 17, center: true, sequins: 700, trim: 0.02, sideTrim: 0.008, dotScale: 1.6, whole: 'veil', wash: '#d2b4c8' } },
      // a short top tier over her shoulders and back, brighter
      { pleat: { n: 23, amp: 0.008, hem: 0.010, ph: 2.2 }, A: 108, hk: 0.48, inset: 0, ph: 9, up: 0.30, cap: 40, amp: 0.18, order: 9, margin: 0.014, cols: Q(57, 31), rows: Q(30, 18), sheer: true, mat: SHEER,
        tex: { top: '#64103e', mid: '#841a56', bottom: '#9c2870', glow: '#d050a8', dark: '#2e0822', mottle: ['#b02c74', '#40102e', '#7428a0'], a0: 0.55, folds: 0.5, stripes: 13, sequins: 420, trim: 0.03, sideTrim: 0.009, dotScale: 1.6, whole: 'veilTop', wash: '#d2b4c8' } }
    ];
    for (const T of TIERS) {
      const A = T.A * DEG, NC = T.cols, NR = T.rows, cols = [];
      const hem = (a) => { const d = Math.abs(a) / DEG + T.ph; return T.flat ? T.flat + T.amp * (tri(d / (T.per || 30)) - 0.5) : Math.max(0.07, T.up + 0.09 + (T.rise || 0.0062) * Math.min(d, T.cap) + T.amp * (tri(d / 30) - 0.5)); };
      for (let c = 0; c < NC; c++) {
        const a = lerp(-A, A, c / (NC - 1)), f = Math.abs(a) / A;
        const k = (y) => 1 + sm(1.32, 0.6, y) * (0.085 * Math.sin(a * 17 + 1.3 * Math.sin(a * 2.3) + T.ph) + 0.03 * Math.sin(a * 39 + 0.7));
        const hk = T.hk || 0.44, P0 = headPoint(PI - a * hk, 0.30 + 0.92 * Math.pow(f, 1.4), 0.016 - T.inset * 0.3), P1 = headPoint(PI - a * hk * 1.14, 1.74, 0.018 - T.inset * 0.3);
        const ctrl = T.shawl ? [ell(0.050, 0.048, a * 0.78, 1.404, -0.008), ell(0.098, 0.086, a * 0.78, 1.380, -0.012), ell(0.131, 0.111, a * 0.78, 1.349, -0.014)]
          : [V3(P0[0], P0[1], P0[2]), V3(P1[0], P1[1], P1[2]), ell(0.128, 0.108, a * 0.78, 1.345, -0.014)];
        for (const y of [1.26, 1.10, 0.90, 0.70, 0.50, 0.30, 0.10, 0]) ctrl.push(envPt(a, y, T.inset, k(y)));
        cols.push(dropRows(ctrl, hem(a), NR, 1));
      }
      const wristPin = (p) => { const S = p[0] < 0 ? 'R' : 'L', w = restPts['wr' + S]; return 1 - sm(0.05, 0.11, Math.hypot(p[0] - w.x * 1.33, p[1] - (w.y + 0.04), p[2] - w.z)); };
      const cloth = makeCloth({ pleat: T.pleat, cols: NC, rows: NR, mask: 1 | 2 | 8 | 16, margin: T.margin, bend: 0.14, grav: 0.6, drag: 0.016, flutter: 1,
        rest: (c, r) => cols[c][r],
        pin: (c, r, p) => { const u = r / (NR - 1); return Math.max(r === 0 ? 1 : u < 0.1 ? lerp(0.9, 0.12, u / 0.1) : lerp(0.06, 0.022, u), wristPin(p)); },
        weights: (c, r, p) => (wristPin(p) > 0.02 ? [BI['farm' + (p[0] < 0 ? 'R' : 'L')], 1] : T.shawl && p[1] > 1.25 ? [BI.spine3, 1] : wHang(p)) });
      (T.sheer ? addSheer : addSolid)(cloth, veilTex(1024, T.rows > 24 ? 1024 : 512, T.tex), T.mat, T.order);
      cloth.outer = true;                           // the veils and the shawl: the layers worn over the base outfit
      if (T.main) mantleCloth = cloth;
    }
  })();

  // ribbon veils from the knot on her crown, framing her face and falling over the bodice
  function ribbonTex() {
    const W = Math.round(512 * TEXS), H = Math.round(1024 * TEXS), c = cvs(W, H), g = c.getContext('2d'), ca = cvs(W, H), ga = ca.getContext('2d');
    const styles = [['#8a2050', '#5e1236'], ['#5a1230', '#3c0a20'], ['#b84482', '#84285a'], ['#40091c', '#2a0612'], ['#70183e', '#4c0e28']], sw = W / styles.length;
    styles.forEach(([a, b], i) => {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(i * sw, 0, sw, H);
      ga.fillStyle = '#a8a8a8'; ga.fillRect(i * sw, 0, sw, H);
      for (let y = 0; y < H; y += sw * 0.2) for (const x of [i * sw + sw * 0.1, i * sw + sw * 0.9]) { dot(g, x, y, sw * 0.075, rnd() < 0.3 ? PAL.goldHi : PAL.gold); dot(ga, x, y, sw * 0.08, '#fff'); }
      for (let k = 0; k < 26; k++) { const x = i * sw + rr(0.25, 0.75) * sw, y = rnd() * H; dot(g, x, y, sw * 0.028, PAL.gold); dot(ga, x, y, sw * 0.028, '#fff'); }
      g.fillStyle = rgba('#000000', 0.22); g.fillRect(i * sw + sw * 0.44, 0, sw * 0.12, H);
      g.fillStyle = PAL.gold; g.fillRect(i * sw, H - sw * 0.12, sw, sw * 0.12); ga.fillStyle = '#fff'; ga.fillRect(i * sw, H - sw * 0.12, sw, sw * 0.12);
    });
    const map = ctex(c), alpha = ctex(ca, 0, 0, false);
    onBaked('veil', (im) => onBaked('veilA', (ia) => {         // each ribbon is a strip of the painted veil
      [0.10, 0.28, 0.455, 0.64, 0.82].forEach((u, i) => { const w = im.width * 0.09; g.drawImage(im, u * im.width, 0, w, im.height * 0.66, i * sw, 0, sw, H); ga.drawImage(ia, u * ia.width, 0, ia.width * 0.09, ia.height * 0.66, i * sw, 0, sw, H); });
      g.fillStyle = PAL.gold; g.fillRect(0, H - sw * 0.035, W, sw * 0.035); ga.fillStyle = '#fff'; ga.fillRect(0, H - sw * 0.035, W, sw * 0.035);
      map.needsUpdate = alpha.needsUpdate = true;
    }));
    return { map, alpha };
  }
  (function buildRibbons() {
    const tex = ribbonTex(), NR = Q(30, 18), NK = 7, ENDS = [0.99, 0.84, 1.06, 0.78, 0.93, 0.88, 1.02], WID = [0.040, 0.030, 0.044, 0.032, 0.040, 0.036, 0.030];
    for (const [S, s] of SIDES) for (let k = 0; k < NK; k++) {
      const P1 = headPoint(s * (38 + k * 10) * DEG, 0.72, 0.016), P2 = headPoint(s * (64 + k * 8) * DEG, 1.40, 0.022);
      const ctrl = [V3(s * 0.005 * (k + 1), 1.664, 0.010), V3(P1[0], P1[1], P1[2]), V3(P2[0], P2[1], P2[2]), V3(s * (0.088 + 0.008 * k), 1.435, 0.060 - 0.012 * k),
        V3(s * (0.094 + 0.019 * k), 1.30, 0.108 - 0.012 * k), V3(s * (0.092 + 0.024 * k), 1.12, 0.138 - 0.013 * k), V3(s * (0.112 + 0.024 * k), 0.90, 0.150 - 0.013 * k), V3(s * (0.115 + 0.025 * k), 0.70, 0.150 - 0.013 * k)];
      const mid = dropRows(ctrl, ENDS[(k + (s > 0 ? 2 : 0)) % NK], NR, 1), w = WID[k], st = (k + (s > 0 ? 1 : 0)) % 5;
      const rows = mid.map((p, r) => {
        const a = V3(...mid[Math.max(0, r - 1)]), b = V3(...mid[Math.min(NR - 1, r + 1)]), T = b.sub(a).normalize(), out = V3(p[0], 0, p[2] + 0.02).normalize();
        const side = V3().crossVectors(T, out).normalize();
        return [-1, 0, 1].map((q) => [p[0] + side.x * q * w * 0.5, p[1] + side.y * q * w * 0.5, p[2] + side.z * q * w * 0.5 + (q === 0 ? 0.002 : 0)]);
      });
      const cloth = makeCloth({ cols: 3, rows: NR, mask: 1 | 2 | 16, margin: 0.030 + 0.002 * k, bend: 0.3, grav: 0.75, drag: 0.02, flutter: 0.7,
        rest: (c, r) => rows[r][c], pin: (c, r, p) => (r === 0 ? 1 : p[1] > 1.46 ? lerp(1, 0.5, sm(1.70, 1.46, p[1])) : 0.02), weights: (c, r, p) => wHang(p),
        uv: (c, r) => [(st + 0.04 + 0.92 * c / 2) / 5, 1 - r / (NR - 1)] });
      addSheer(cloth, tex, { glow: '#d04890', emi: 0.22, sheen: '#f070b0', sheenK: 0.26 }, 10 + k * 0.1);
      ribbonCloths.push(cloth);
    }
    // the knot that gathers them, between the horns
    const kc = V3(0, 1.660, 0.004), wf = wOne('head');
    addPart('wine', spherePart(kc, 0.030, 0.017, 0.026, 14, 8), wf, { out: kc });
    for (const sx of [-1, 1]) { const c2 = V3(sx * 0.03, 1.664, 0.0); addPart('wine', spherePart(c2, 0.022, 0.013, 0.018, 12, 8), wf, { out: c2 }); }
  })();
