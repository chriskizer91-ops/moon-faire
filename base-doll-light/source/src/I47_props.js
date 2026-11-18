  // ---------- her book and her blades (stage seven) ----------
  // Chris, November 13: "let's continue on to the books and blades". From G1 (the book shut), G2 (open), G5 (the sickle), G6 (the dagger
  // and its sheath) and G8 (where she carries them: the book in her left arm, the dagger at her left hip).
  //   book    one bone of its own, set every frame (I99_static.js): shut in her left arm, open when she reads or when it floats beside her.
  //   dagger  in its sheath on her belt, on one soft bone.
  //   sickle  in her right hand, shown only while she holds it.
  const BOOK = { C: V3(0.6, 1.1, 0), w: 0.150, h: 0.205, t: 0.042 };
  addBone('book', null, BOOK.C.x, BOOK.C.y, BOOK.C.z);
  function bookCoverTexIo() {                      // back cover | spine | front cover, side by side (G1)
    const W = 640, H = 512, c = cvs(W, H), g = c.getContext('2d'), own = seed; seed = 9091;
    g.fillStyle = '#3a2418'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) { g.fillStyle = rnd() > 0.5 ? 'rgba(90,58,36,0.10)' : 'rgba(10,5,2,0.14)'; g.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 9, 1 + rnd() * 3); }
    g.strokeStyle = '#c99a3e'; g.fillStyle = '#c99a3e';
    for (const x0 of [0, 320]) { g.lineWidth = 2.2; g.strokeRect(x0 + 20, 22, 216, 468); g.lineWidth = 1; g.strokeRect(x0 + 28, 30, 200, 452);
      for (const [cx, cy, sx, sy] of [[x0 + 2, 2, 1, 1], [x0 + 254, 2, -1, 1], [x0 + 2, 510, 1, -1], [x0 + 254, 510, -1, -1]]) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sx * 46, cy); g.lineTo(cx, cy + sy * 46); g.closePath(); g.fill(); }
      if (x0) { const cx = x0 + 128, cy = 256; g.lineWidth = 1.6; g.beginPath(); g.arc(cx, cy, 44, 0, TAU); g.stroke(); g.beginPath(); g.arc(cx, cy, 30, 0, TAU); g.stroke();
        for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU, L = k % 2 ? 40 : 66; g.beginPath(); g.moveTo(cx + Math.cos(a - 0.16) * 9, cy + Math.sin(a - 0.16) * 9); g.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); g.lineTo(cx + Math.cos(a + 0.16) * 9, cy + Math.sin(a + 0.16) * 9); g.closePath(); g.fill(); } } }
    g.fillStyle = '#2c1a11'; g.fillRect(256, 0, 64, H); g.fillStyle = '#4a2f1f'; for (const y of [70, 160, 250, 340, 430]) g.fillRect(256, y, 64, 12); g.fillStyle = '#c99a3e'; for (const y of [118, 208, 298, 388]) { g.fillRect(285, y - 12, 6, 24); g.fillRect(276, y - 3, 24, 6); }
    seed = own; return ctex(c);
  }
  function bookPageTexIo() {                       // one page: handwriting, a pressed sprig, a green leaf (G2)
    const W = 384, H = 512, c = cvs(W, H), g = c.getContext('2d'), own = seed; seed = 4477;
    const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#cdbb96'); gr.addColorStop(0.18, '#e9dcba'); gr.addColorStop(1, '#e3d4ae'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(70,48,30,0.62)'; g.lineWidth = 1.5;
    for (let r = 0; r < 19; r++) { const y = 44 + r * 23; if (r > 9 && r < 16) continue; let x = 40; while (x < W - 44) { const l = 10 + rnd() * 30; g.beginPath(); g.moveTo(x, y + rnd() * 3); g.quadraticCurveTo(x + l / 2, y - 5 + rnd() * 9, x + l, y + rnd() * 3); g.stroke(); x += l + 6 + rnd() * 8; } }
    g.strokeStyle = '#5c6a2c'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(118, 398); g.quadraticCurveTo(132, 330, 120, 276); g.stroke(); g.fillStyle = '#6f8234';
    for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(124 + sd * 17, 380 - i * 19, 15, 5.5, -sd * 0.6, 0, TAU); g.fill(); }
    g.fillStyle = '#58762a'; g.beginPath(); g.ellipse(262, 334, 30, 54, 0.35, 0, TAU); g.fill(); g.strokeStyle = '#3f5a1d'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(244, 384); g.lineTo(280, 286); g.stroke();
    seed = own; return ctex(c);
  }
  (function buildProps() {
    if (opts.noProps) return;
    const wB = () => [BI.book, 1], C = BOOK.C, w = BOOK.w, h = BOOK.h, t = BOOK.t;
    const quad = (key, P, uv, wf) => addPart(key, { pos: [].concat(...P), uv, idx: [0, 1, 2, 0, 2, 3] }, wf, {});          // four corners in order round the face, seen from outside
    const box = (key, c, hx, hy, hz, wf, uvF) => { const f = (a, b, d, e) => quad(key, [a, b, d, e].map(([x, y, z]) => [c[0] + x * hx, c[1] + y * hy, c[2] + z * hz]), uvF || [0, 0, 1, 0, 1, 1, 0, 1], wf);
      f([-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]); f([1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]); f([1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]); f([-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]); f([-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]); f([-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]); };
    // shut: the spine is at -x, the front cover faces +z
    { const x0 = C.x - w / 2, x1 = C.x + w / 2, y0 = C.y - h / 2, y1 = C.y + h / 2, zf = C.z + t / 2, zb = C.z - t / 2;
      quad('bookShut', [[x0, y0, zf], [x1, y0, zf], [x1, y1, zf], [x0, y1, zf]], [0.5, 0, 0.9, 0, 0.9, 1, 0.5, 1], wB); quad('bookShut', [[x1, y0, zb], [x0, y0, zb], [x0, y1, zb], [x1, y1, zb]], [0, 0, 0.4, 0, 0.4, 1, 0, 1], wB);
      quad('bookShut', [[x0, y0, zb], [x0, y0, zf], [x0, y1, zf], [x0, y1, zb]], [0.4, 0, 0.5, 0, 0.5, 1, 0.4, 1], wB);
      box('bookShutPg', [C.x + 0.003, C.y, C.z], w / 2 - 0.006, h / 2 - 0.005, t / 2 - 0.004, wB, [0.02, 0.02, 0.06, 0.02, 0.06, 0.06, 0.02, 0.06]);
      quad('bookRibbon', [[C.x - 0.03, y0 - 0.035, C.z], [C.x - 0.018, y0 - 0.035, C.z], [C.x - 0.018, y0 + 0.004, C.z], [C.x - 0.03, y0 + 0.004, C.z]], [0, 0, 1, 0, 1, 1, 0, 1], wB); }
    // open: the spine runs up the middle, the pages face +z, each half lifted a little at its outer edge
    for (const e of [-1, 1]) { const ca = Math.cos(0.17), sa = Math.sin(0.17), P = (u, v, d) => [C.x + e * (u * ca - d * sa * 0), C.y + v, C.z + u * sa + d];
      const a = P(0, -h / 2, -0.004), b = P(w, -h / 2, -0.004), c2 = P(w, h / 2, -0.004), d2 = P(0, h / 2, -0.004), u0 = e > 0 ? 0.5 : 0.4, u1 = e > 0 ? 0.9 : 0;
      quad('bookOpen', e > 0 ? [b, a, d2, c2] : [a, b, c2, d2], e > 0 ? [u1, 0, u0, 0, u0, 1, u1, 1] : [u0, 0, u1, 0, u1, 1, u0, 1], wB);                                  // the cover, seen from behind
      const NP = 6, rows = [[], []]; for (let i = 0; i <= NP; i++) { const u = (i / NP) * (w - 0.008), lift = 0.004 + 0.013 * Math.sin(Math.min(1, u / 0.07) * PI / 2) - 0.004 * (u / w); rows[0].push(P(u, -h / 2 + 0.005, lift)); rows[1].push(P(u, h / 2 - 0.005, lift)); }
      const pos = [], uv = [], idx = []; for (let i = 0; i <= NP; i++) { pos.push(...rows[0][i], ...rows[1][i]); const uu = e > 0 ? i / NP : 1 - i / NP; uv.push(uu, 0, uu, 1); if (i < NP) { const k = i * 2; if (e > 0) idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); else idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
      addPart('bookOpenPg', { pos, uv, idx }, wB, {});
      quad('bookOpenPg', e > 0 ? [P(w - 0.008, -h / 2 + 0.005, 0.009), P(w - 0.008, -h / 2 + 0.005, -0.004), P(w - 0.008, h / 2 - 0.005, -0.004), P(w - 0.008, h / 2 - 0.005, 0.009)] : [P(w - 0.008, -h / 2 + 0.005, -0.004), P(w - 0.008, -h / 2 + 0.005, 0.009), P(w - 0.008, h / 2 - 0.005, 0.009), P(w - 0.008, h / 2 - 0.005, -0.004)], [0.02, 0.02, 0.06, 0.02, 0.06, 0.06, 0.02, 0.06], wB); }
    const tube = (key, pts, r, n, wf, up) => { const rings = tubeRings(pts, pts.map((p, i) => (typeof r === 'function' ? r(i / (pts.length - 1)) : r)), n, up || null); addPart(key, loft(rings, { capA: true, capB: true }), wf, { out: centroidOf(rings) }); };
    // ----- the dagger in its sheath, at her left hip (G6) -----
    { const a = 1.02, T = V3(...skirtPt(1.050, a, 1.0, 0.026)), B = V3(...skirtPt(0.845, a, 1.0, 0.030)).add(V3(0, 0, 0.05)), ax = B.clone().sub(T).normalize(), nv = V3(Math.sin(a), 0, Math.cos(a));
      addChain('gear', 'dagger', 'hips', [T.clone().addScaledVector(ax, -0.02), B], { yaw: 'hips', soft: { k: 0.10, d: 0.22, g: 0.55, col: 'sg', pad: 0.026 } }); const wD = () => [BI.dagger_0, 1], at = (s) => T.clone().addScaledVector(ax, s);
      tube('propLeather', [at(0), at(0.05), at(0.15), at(0.205)], (u) => [0.006, lerp(0.016, 0.006, u)], 8, wD, nv); tube('propGold', [at(-0.004), at(0.014)], [0.0072, 0.0175], 8, wD, nv); tube('propGold', [at(0.185), at(0.214)], (u) => [0.0062, lerp(0.0085, 0.002, u)], 8, wD, nv);
      tube('propWood', [at(-0.022), at(-0.050), at(-0.085), at(-0.108)], (u) => 0.0085 + 0.003 * Math.sin(PI * u), 8, wD); tube('propGold', [at(-0.108), at(-0.120)], 0.0095, 8, wD);
      const gp = []; for (let i = 0; i <= 10; i++) { const tt = lerp(-1, 1, i / 10); gp.push(at(-0.012 + 0.016 * tt * tt).add(V3().crossVectors(ax, nv).normalize().multiplyScalar(0.027 * tt))); } tube('propGold', gp, (u) => [0.0030, 0.0018 + 0.0058 * Math.sin(PI * u)], 6, wD, nv); }       // the crescent guard, horns toward the blade
    // ----- the sickle in her right hand (G5): a dark twisted grip, a golden crescent blade -----
    { const S = 'R', s = -1, wr = restPts.wrR, d0 = armDir.R, p0 = V3(-s * Math.cos(A_POSE), -Math.sin(A_POSE), 0), Z = V3(0, 0, 1), Pc = wr.clone().addScaledVector(d0, 0.073).addScaledVector(p0, 0.024), wS = () => [BI.handR, 1];
      tube('sickleGrip', [Pc.clone().addScaledVector(Z, -0.055), Pc.clone().addScaledVector(Z, 0.075)], 0.0105, 8, wS); tube('sickleGold', [Pc.clone().addScaledVector(Z, 0.070), Pc.clone().addScaledVector(Z, 0.090)], 0.0125, 8, wS); tube('sickleGold', [Pc.clone().addScaledVector(Z, -0.068), Pc.clone().addScaledVector(Z, -0.055)], 0.0125, 8, wS);
      const R = 0.088, Cb = Pc.clone().addScaledVector(Z, 0.088).addScaledVector(d0, R), bp = [], N = 26; for (let i = 0; i <= N; i++) { const tt = (i / N) * 4.05; bp.push(Cb.clone().addScaledVector(d0, -R * Math.cos(tt)).addScaledVector(Z, R * Math.sin(tt))); }
      tube('sickleGold', bp, (u) => [0.0020, 0.0022 + 0.0165 * Math.pow(Math.sin(PI * Math.min(1, 0.12 + u * 0.88)), 0.8)], 6, wS, p0); }
  })();
