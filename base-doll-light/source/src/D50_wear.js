  // ---------- the doll's clothes: close-fitting pieces made from her own skin (November 14, 2026) ----------
  // A close-fitting piece is the doll's body, swollen by the cloth's thickness, kept only inside the piece's outline:
  //   G = max(Fsnug - thickness, outline)
  // (Fsnug is her skin with the hollows a cloth would bridge left out: the navel, the cleft of her seat, the valley between her breasts.)
  // Its surface is found on a grid as her skin was, and the cut through her body is thrown away, so what is left is the cloth and its
  // edge. Every point is carried by the bones that carry her skin at the place it lies over, so it moves exactly as she does and she
  // cannot come through it. Each piece has its own colour, which the page can change: the start of the wardrobe.
  const WEAR = {};
  (function buildWear() {
    const t0 = performance.now();
    const F = DOLL.F, Fs = DOLL.Fsnug;
    // a point on her skin: from (x, y, z0) march along d until the skin is crossed, then home in on it
    function onSkin(x, y, z, dx, dy, dz) {
      const f0 = F(x, y, z); let lo = 0, hi = -1;
      for (let i = 1; i <= 400; i++) { const t = i * 0.0015; if (F(x + dx * t, y + dy * t, z + dz * t) * f0 <= 0) { hi = t; lo = t - 0.0015; break; } }
      if (hi < 0) return V3(x, y, z);
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (F(x + dx * m, y + dy * m, z + dz * m) * f0 > 0) lo = m; else hi = m; }
      const t = (lo + hi) / 2; return V3(x + dx * t, y + dy * t, z + dz * t);
    }
    // distance from p to a path of points (for straps)
    function pathD(x, y, z, P) {
      let best = 9;
      for (let i = 0; i < P.length - 1; i++) {
        const a = P[i], b = P[i + 1], ex = b.x - a.x, ey = b.y - a.y, ez = b.z - a.z, L2 = ex * ex + ey * ey + ez * ez, t = cl(((x - a.x) * ex + (y - a.y) * ey + (z - a.z) * ez) / L2, 0, 1);
        const d = Math.hypot(x - a.x - ex * t, y - a.y - ey * t, z - a.z - ez * t); if (d < best) best = d;
      }
      return best;
    }
    // a piece: outline R(x, y, z) < 0 inside; th(x, y, z) its thickness; box to look in
    function piece(key, R, th, box, h) {
      // the edge: rounded (a soft max), and the cloth is a little thicker within a few millimetres of it, as a bound edge is
      const G = (x, y, z) => { const r = R(x, y, z); return smax(Fs(x, y, z) - th(x, y, z) - 0.0011 * Math.exp(-r * r / 1.6e-5), r, 0.0022); };
      const g = DOLL.snets(G, box, h || 0.0045);
      // keep a triangle unless all three corners lie well inside her (the cut through her body)
      const keep = [], used = new Int32Array(g.nv).fill(-1), pos = [], nor = [], uv = [], W = [], tmp = [0, 0];
      for (let t = 0; t < g.tris.length; t += 3) {
        let inside = 0; for (let k = 0; k < 3; k++) { const v = g.tris[t + k]; if (F(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]) < -0.0012) inside++; }
        if (inside < 3) keep.push(g.tris[t], g.tris[t + 1], g.tris[t + 2]);
      }
      const idx = [];
      for (const v of keep) {
        if (used[v] < 0) {
          used[v] = pos.length / 3; const x = g.pos[v * 3], y = g.pos[v * 3 + 1], z = g.pos[v * 3 + 2];
          pos.push(x, y, z); nor.push(g.nor[v * 3], g.nor[v * 3 + 1], g.nor[v * 3 + 2]);
          // the cloth is carried as the skin under it is: step back along the surface direction to the skin, and take its weights there
          const f = F(x, y, z), bx = x - g.nor[v * 3] * f, by = y - g.nor[v * 3 + 1] * f, bz = z - g.nor[v * 3 + 2] * f;
          W.push(DOLL.wAt(bx, by, bz).w);
          // uv in metres: round her (u, by the angle about her middle line at that height, times a typical girth) and up (v = height)
          const s = x < 0 ? -1 : 1, onLeg = y < 0.86 && Math.abs(x) > 0.02;
          if (onLeg) { DOLL.uvLeg(s, x, y, z, tmp); uv.push(tmp[0] * 0.50 + (s < 0 ? 0 : 0.5), y); }
          else { DOLL.uvTrunk(x, y, z, tmp); uv.push(tmp[0] * 0.80, y); }
        }
        idx.push(used[v]);
      }
      addPart(key, { pos, uv, idx }, (x, y, z, i) => W[i], { nor: new Float32Array(nor) });
      return { key, tris: idx.length / 3 };
    }

    // ----- bike shorts: from just under her navel to the middle of her thigh (B5 is the cloth: black, close, a matte knit) -----
    // B5's shorts end at 0.86; bike shorts come further down, to 0.76, ten centimetres above her knee.
    const SH_TOP = (x, z) => 1.056 + 0.012 * sm(0.0, -0.08, z),          // a little higher at the back
      SH_HEM = 0.758;
    const shR = (x, y, z) => Math.max(y - SH_TOP(x, z), SH_HEM - y);
    const shTh = (x, y, z) => 0.0013 + 0.0013 * sm(SH_TOP(x, z) - 0.040, SH_TOP(x, z) - 0.034, y) + 0.0007 * sm(SH_HEM + 0.018, SH_HEM + 0.012, y);      // the waistband and the hem are thicker
    WEAR.shorts = piece('wearShorts', shR, shTh, [-0.21, 0.21, 0.74, 1.09, -0.165, 0.135], 0.0044);

    // ----- the sports bra: a band under her bust, two cups that bridge the middle, a scoop at the front, and two straps over her shoulders -----
    const BR_LO = 1.128;
    const CZ = (DOLL.trunkAt(1.22)[1] + DOLL.trunkAt(1.22)[2]) / 2;
    const topAt = (x, z) => {                    // how high the bra comes, by the way round her (0 at the front, PI at the back): a round scoop between the straps
      const a = Math.abs(Math.atan2(x, z - CZ));
      if (a < 0.60) return 1.246 + 0.050 * Math.pow(a / 0.60, 2.2);
      return prof([[0.60, 1.296], [0.78, 1.284], [1.05, 1.252], [1.35, 1.236], [1.70, 1.206], [2.05, 1.172], [PI, 1.170]], a, true);
    };
    const strap = {};
    for (const s of [-1, 1]) {                   // a path over each shoulder, laid on her skin, between her neck and the ball of her shoulder
      const pts = [], front = [[0.058, 1.272], [0.062, 1.300], [0.066, 1.328]], back = [[0.068, 1.328], [0.069, 1.290], [0.068, 1.250], [0.066, 1.205], [0.064, 1.160]];
      for (const [x, y] of front) pts.push(onSkin(s * x, y, 0.25, 0, 0, -1));
      for (let k = 1; k < 16; k++) {             // over the top of her shoulder: points round an arc, each laid on her skin
        const ph = lerp(0.30, PI - 0.30, k / 16), dy = Math.sin(ph), dz = Math.cos(ph), C = V3(s * 0.067, 1.300, -0.028);
        pts.push(onSkin(C.x, C.y + 0.25 * dy, C.z + 0.25 * dz, 0, -dy, -dz));
      }
      for (const [x, y] of back) pts.push(onSkin(s * x, y, -0.25, 0, 0, 1));
      strap[s] = pts;
    }
    WEAR.strapPts = strap;
    const brR = (x, y, z) => {
      const main = Math.max(BR_LO - y, y - topAt(x, z));
      const st = pathD(x, y, z, strap[x < 0 ? -1 : 1]) - 0.0090;
      return smin(main, st, 0.010);              // the straps run into the cups with a soft curve
    };
    const brTh = (x, y, z) => 0.0018 + 0.0012 * sm(BR_LO + 0.032, BR_LO + 0.026, y);       // the band under her bust is thicker
    WEAR.bra = piece('wearBra', brR, brTh, [-0.16, 0.16, 1.11, 1.36, -0.13, 0.14], 0.0030);
    // skin that is always under the bra or the shorts is not drawn: it can never be seen, and in a deep bend it could come through the cloth.
    // A centimetre of skin is kept inside every edge, so nothing opens at a hem.
    // The skin cut is kept as two lists (under the bra, under the shorts) and applied when the meshes are made (D99_static.js), so the
    // wardrobe can give the skin back when an outfit hides the bra or the shorts and does not cover where they were.
    { WEAR.cut = {}; let cut = 0;
      for (const key of ['dollTrunk', 'dollLeg']) { const B = buckets[key], bra = [], sho = [];
        for (let t = 0; t < B.idx.length; t += 3) { let ab = true, as = true;
          for (let k = 0; k < 3; k++) { const v = B.idx[t + k], x = B.pos[v * 3], y = B.pos[v * 3 + 1], z = B.pos[v * 3 + 2]; if (ab && !(brR(x, y, z) < -0.010)) ab = false; if (as && !(shR(x, y, z) < -0.012)) as = false; if (!ab && !as) break; }
          if (ab) bra.push(t / 3); if (as) sho.push(t / 3); if (ab || as) cut++; }
        WEAR.cut[key] = { wearBra: bra, wearShorts: sho }; }
      WEAR.skinCut = cut; }
    WEAR.ms = Math.round(performance.now() - t0);
    WEAR.colors = { wearShorts: '#151317', wearBra: '#151317' };
  })();
