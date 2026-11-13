
  // ---------- hair: long, loose and wavy, dark brown with lighter strands, from under her hat to below her hips ----------
  // C11 shows it without the hat (front, side, back), C4 and C5 with the hat, C13 its waves from behind, C12 the parting.
  // It is built as tresses: flat wavy ribbons of strands, a hundred and sixty or so, in layers. Each hangs straight down from its
  // root under the hat and is kept clear of what lies under it (her head, neck, back, chest, arms and skirt), then given its wave.
  // Three groups: the curtain down her back (to about 0.72 m), a bunch over the front of each shoulder (to her waist and hips),
  // and the fringe: curtain bangs parted in the middle, swept to each side of her forehead. Under the tresses lies a plain dark
  // sheet of hair, so no skin shows between them. Nothing moves yet; the tresses are weighted to her head and spine by height.
  const HAIRC = (BAKED && BAKED.hairCols) || ['#231512', '#36221c', '#4d332a', '#6b4b3e', '#987260'];
  let hseed = 90210; const hrnd = () => (hseed = (hseed * 16807) % 2147483647) / 2147483647, hrr = (a, b) => a + (b - a) * hrnd();       // its own dice, so nothing else shifts
  const HB = { c: V3(0, 1.548, -0.012), rx: 0.074, ry: 0.100, rzF: 0.094, rzB: 0.128 };       // her head with the bulk of hair on it, under the hat
  const hatOpenY = (z) => HAT.oc[1] + (z - HAT.oc[2]) * HAT.slope;
  // the front of her head as a height map (how far forward the skin is at each x and height), from the head's own shape
  const FMAP = (function () {
    const X0 = -0.09, Y0 = 1.39, D = 0.002, NX = 91, NY = 126, m = new Float32Array(NX * NY).fill(-9);
    for (let i = 0; i <= 420; i++) for (let j = 0; j <= 360; j++) { const p = headPoint(-PI / 2 + PI * j / 360, 0.35 + (PI - 0.37) * i / 420), ix = Math.round((p[0] - X0) / D), iy = Math.round((p[1] - Y0) / D); if (ix >= 0 && ix < NX && iy >= 0 && iy < NY && p[2] > m[iy * NX + ix]) m[iy * NX + ix] = p[2]; }
    for (let k = 0; k < 2; k++) for (let iy = 1; iy < NY - 1; iy++) for (let ix = 1; ix < NX - 1; ix++) if (m[iy * NX + ix] < -8) { let b = -9; for (const q of [iy * NX + ix - 1, iy * NX + ix + 1, (iy - 1) * NX + ix, (iy + 1) * NX + ix]) if (m[q] > b) b = m[q]; m[iy * NX + ix] = b; }
    return (x, y) => { const fx = cl((x - X0) / D, 0, NX - 1.001), fy = cl((y - Y0) / D, 0, NY - 1.001), ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
      if (y < Y0 || y > Y0 + D * (NY - 1) || Math.abs(x) > 0.09) return -9;
      const a = m[iy * NX + ix], b = m[iy * NX + ix + 1], c = m[(iy + 1) * NX + ix], d = m[(iy + 1) * NX + ix + 1]; if (Math.min(a, b, c, d) < -8) return Math.max(a, b, c, d);
      return lerp(lerp(a, b, u), lerp(c, d, u), v); };
  })();
  const capFront = (x, y, A, B, r) => {            // the front of a round limb from A to B (both at one depth), at this x and height; -9 where it is not
    const ex = B.x - A.x, ey = B.y - A.y, t = cl(((x - A.x) * ex + (y - A.y) * ey) / (ex * ex + ey * ey), 0, 1), d = Math.hypot(x - A.x - ex * t, y - A.y - ey * t);
    return d < r ? A.z + Math.sqrt(r * r - d * d) : -9;
  };
  // how far back her body reaches at this x and height (the hair hangs behind it), and how far forward (the hair hangs in front of it); o: clearance
  function zBack(x, y, o) {
    let z = 9; const ax = Math.abs(x);
    { const rx = HB.rx + o, ry = HB.ry + o, q = 1 - (x * x) / (rx * rx) - Math.pow((y - HB.c.y) / ry, 2); if (q > 0) z = Math.min(z, HB.c.z - (HB.rzB + o) * Math.sqrt(q)); }
    if (y > 1.33 && y < 1.50 && ax < 0.050 + o) z = Math.min(z, -0.020 - Math.sqrt(Math.pow(0.050 + o, 2) - x * x));
    if (y > 0.86 && y < 1.405) { const [rx0, zf, zb] = spline(IO_TORSO, y), rx = rx0 + o, cz = (zf + zb) / 2; if (ax < rx) z = Math.min(z, cz - (cz - zb + o) * Math.pow(1 - Math.pow(ax / rx, IO_TPW), 1 / IO_TPW)); }
    if (y > 0.15 && y < 1.06) { const [rx0, rz0, cz] = spline(IO_SKIRT_UP, y), rx = rx0 + o; if (ax < rx) z = Math.min(z, cz - (rz0 + o) * Math.sqrt(1 - (ax / rx) * (ax / rx))); }
    return z;
  }
  function zFront(x, y, o, noHead) {
    let z = -9; const ax = Math.abs(x), S = x < 0 ? 'R' : 'L';
    if (!noHead) { const f = FMAP(x, y); if (f > -8) z = Math.max(z, f + o);
      const rx = HB.rx + o, ry = HB.ry + o, q = 1 - (x * x) / (rx * rx) - Math.pow((y - HB.c.y) / ry, 2); if (q > 0) z = Math.max(z, HB.c.z + (HB.rzF * 0.80 + o) * Math.sqrt(q)); }
    if (y > 1.33 && y < 1.50 && ax < 0.046 + o) z = Math.max(z, -0.012 + Math.sqrt(Math.pow(0.046 + o, 2) - x * x));
    if (y > 0.86 && y < 1.405) { const [rx0, zf, zb] = spline(IO_TORSO, y), rx = rx0 + o, cz = (zf + zb) / 2;
      if (ax < rx) { const B = IO_BUST; z = Math.max(z, cz + (zf - cz + o) * Math.pow(1 - Math.pow(ax / rx, IO_TPW), 1 / IO_TPW) + B.amp * Math.exp(-Math.pow((ax - B.x) / B.sx, 2) - Math.pow((y - B.y) / B.sy, 2))); } }
    z = Math.max(z, capFront(x, y, restPts['sh' + S], restPts['el' + S], 0.046 + o), capFront(x, y, restPts['el' + S], restPts['wr' + S], 0.036 + o));
    if (y > 0.15 && y < 1.06) { const [rx0, rz0, cz] = spline(IO_SKIRT_UP, y), rx = rx0 + o; if (ax < rx) z = Math.max(z, cz + (rz0 + o) * Math.sqrt(1 - (ax / rx) * (ax / rx))); }
    return z;
  }
  const wHair = (x, y) => { if (y > 1.46) return [BI.head, 1]; if (y > 1.36) { const u = sm(1.36, 1.46, y); return [BI.spine3, 1 - u, BI.head, u]; } return wSpine(y); };
  // the middle line of one tress, hanging: lat(y) gives its x at each height; back: it hangs behind her (else in front)
  function hang(o, y0, y1, lat, back, zStart, oRoot, lead) {       // lead(y): for hair in front, a depth it is led to before it meets her
    const pts = [], DY = 0.011, n = Math.max(4, Math.round((y0 - y1) / DY)); let z = null;
    for (let i = 0; i <= n; i++) {
      const y = lerp(y0, y1, i / n), x = lat(y), oo = lerp(oRoot == null ? o : oRoot, o, sm(y0 - 0.01, y0 - 0.085, y)), s = back ? zBack(x, y, oo) : zFront(x, y, oo);
      if (i === 0) z = zStart == null ? s : (back ? Math.min(zStart, s) : Math.max(zStart, s));
      else z = back ? Math.min(z + 0.0012, s) : Math.max(z - 0.0012, s, lead ? lead(y) : -9);       // it hangs straight, drifting back toward her a little, and rests on whatever it meets
      pts.push(V3(x, y, z));
    }
    for (let k = 0; k < 3; k++) for (let i = 1; i < pts.length - 1; i++) pts[i].z = (pts[i - 1].z + 2 * pts[i].z + pts[i + 1].z) / 4;       // take the corners out
    return pts;
  }
  // a tress: a flat ribbon of strands along a middle line, waving from side to side and a little in and out, turning as it waves
  let tressN = 0;
  function tress(key, mid, o) {                     // o: { w, th, amp, lam, ph, out: +1 or -1 (which way is away from her), tip, sway }
    const n = mid.length, len = [0]; for (let i = 1; i < n; i++) len.push(len[i - 1] + mid[i].distanceTo(mid[i - 1]));
    const L = len[n - 1], NC = 6, rings = [], vs = [], w0 = o.w, sub = Q(2, 1), M = (n - 1) * sub, q1 = o.ph * 1.7, q2 = o.ph * 0.9;
    for (let k = 0; k <= M; k++) {
      const f = k / sub, i0 = Math.min(n - 2, Math.floor(f)), u = f - i0, P = mid[i0].clone().lerp(mid[i0 + 1], u), s = lerp(len[i0], len[i0 + 1], u), t = s / L;
      const a = mid[Math.max(0, i0 - 1)], b = mid[Math.min(n - 1, i0 + 2)], T = V3(b.x - a.x, b.y - a.y, b.z - a.z).normalize();
      const N = V3(0, 0, o.out); N.addScaledVector(T, -N.dot(T)).normalize(); const Bv = V3().crossVectors(T, N);       // N: away from her; Bv: across
      const env = sm(0.0, 0.13, s) * (1 - 0.25 * sm(0.8, 1, t)) * (0.78 + 0.22 * Math.sin(s * 11 + q1)), ph = o.ph + (s / o.lam) * TAU + 0.9 * Math.sin(s * 6.5 + q2) + 0.4 * Math.sin(s * 17 + q1);       // the waves are not all one length or one size
      P.addScaledVector(Bv, o.amp * env * Math.sin(ph) + (o.sway || 0) * t * t).addScaledVector(N, o.amp * 0.42 * env * (0.5 + 0.5 * Math.cos(ph * 1.0 + 0.9)));
      const tau = 0.75 * env * Math.cos(ph), ct = Math.cos(tau), st = Math.sin(tau), wd = w0 * (0.30 + 0.70 * sm(0.01, 0.08, s)) * (1 - (1 - (o.tip == null ? 0.25 : o.tip)) * Math.pow(t, 2.2)), th = o.th * (1 - 0.5 * t), ring = [];
      for (let j = 0; j < NC; j++) { const an = (j / NC) * TAU, cx = Math.cos(an) * wd, cy = Math.sin(an) * th; ring.push([P.x + (Bv.x * ct + N.x * st) * cx + (N.x * ct - Bv.x * st) * cy, P.y + (Bv.y * ct + N.y * st) * cx + (N.y * ct - Bv.y * st) * cy, P.z + (Bv.z * ct + N.z * st) * cx + (N.z * ct - Bv.z * st) * cy]); }
      rings.push(ring); vs.push(t < 0.86 ? 0.5 * t / 0.86 : 0.5 + 0.5 * (t - 0.86) / 0.14);
    }
    const part = loft(rings, { v: vs }); tressN++;
    for (let i = 0; i < part.uv.length; i += 2) part.uv[i] = part.uv[i] * 0.075 + 0.0917 * tressN;       // each tress takes its own strip of the strand picture, so some are darker and some lighter
    addPart(key, part, wHair, { out: mid[Math.floor(n / 2)].clone().add(V3(0, 0, -o.out * 0.5)) });
  }
  (function buildHair() {
    const sgn = (v) => (v < 0 ? -1 : 1);
    // ----- the curtain down her back -----
    const WB = [[0.60, 0.120], [0.75, 0.140], [0.95, 0.160], [1.15, 0.166], [1.30, 0.160], [1.40, 0.134], [1.47, 0.108], [1.56, 0.074]];       // its half-width by height
    const backLat = (u, y0) => { const w0 = spline(WB, y0); return (y) => u * spline(WB, cl(y, 0.60, 1.56)) * (1 + 0.0 * w0); };
    const backRootY = (u) => hatOpenY(HB.c.z - HB.rzB * Math.sqrt(Math.max(0.05, 1 - u * u * 0.92))) + 0.006;
    const backRootZ = (u, y0) => { const x = u * 0.070, a = Math.atan2(x, -1), zo = HAT.oc[2] - (HAT.ob - 0.008) * Math.sqrt(Math.max(0, 1 - Math.pow(x / (HAT.oa - 0.006), 2))); return Math.max(zo, zBack(x, y0, 0.004)); };
    const LAYB = [[0.006, 16, 0.80, 'tressIn'], [0.024, 17, 0.74, 'tress'], [0.042, 16, 0.70, 'tress'], [0.056, 11, 0.86, 'tress']];       // clearance, how many, where they end, which shade
    for (const [off, cnt, yEnd, key] of LAYB) for (let k = 0; k < cnt; k++) {
      const u = 0.975 * Math.sin(lerp(-1, 1, (k + 0.5 + hrr(-0.3, 0.3)) / cnt) * PI / 2), y0 = backRootY(u), lat0 = backLat(u, y0), y1 = yEnd + hrr(-0.05, 0.07) + 0.06 * u * u;
      const mid = hang(off + hrr(-0.003, 0.004), y0, y1, (y) => lat0(y), true, backRootZ(u, y0), 0.004);
      tress(key, mid, { w: hrr(0.017, 0.024), th: 0.0055, amp: hrr(0.014, 0.021), lam: hrr(0.115, 0.150), ph: u * 5.0 + hrr(0, 2.4), out: -1, tip: 0.2, sway: hrr(-0.012, 0.012) });
    }
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) {      // more at its two edges, where it turns the corner behind her shoulders
      const u = s * lerp(0.86, 0.99, (k + 0.5) / 5), y0 = backRootY(u), lat0 = backLat(u, y0), mid = hang(lerp(0.006, 0.030, hrnd()), y0, 0.80 + hrr(-0.05, 0.12), (y) => lat0(y) * (1 + 0.03 * k * sm(1.5, 1.3, y)), true, backRootZ(u, y0), 0.004);
      tress(k % 2 ? 'tress' : 'tressIn', mid, { w: hrr(0.017, 0.023), th: 0.0055, amp: hrr(0.013, 0.019), lam: hrr(0.115, 0.150), ph: u * 5.0 + hrr(0, 2.4), out: -1, tip: 0.2, sway: s * hrr(0, 0.012) });
    }
    // ----- a bunch over the front of each shoulder -----
    // Rooted along the side of her head from above the ear to behind it, each tress lies on the side of her head (clear of her cheek,
    // over her ear), so her profile stays clear as in C4. As it passes her neck it is led forward, and from there it lies on the
    // front of her shoulder and chest and hangs to her waist or hips. The middle of her chest stays bare.
    function bunchPts(s, v, off, y1, jit, n) {       // v: 0 the tress nearest her face .. 1 the one furthest back
      const a = lerp(1.38, 1.98, v), ca = Math.cos(a), zr = HB.c.z + (ca >= 0 ? HB.rzF : HB.rzB) * ca * 0.92, y0 = hatOpenY(zr) + 0.004, xc = lerp(0.086, 0.174, Math.pow(v, 0.9)) + (jit || 0), pts = [], yT = 1.49 + 14 * (jit || 0) * 0.5;
      n = n || Math.max(4, Math.round((y0 - y1) / 0.011)); let z = zr, wide = 0;
      for (let i = 0; i <= n; i++) {
        const y = lerp(y0, y1, i / n), down = sm(yT, 1.22, y), of = lerp(Math.min(off, 0.004), off, sm(y0 - 0.012, y0 - 0.085, y));
        wide = Math.max(wide, y > 1.44 ? headHalfW(Math.min(y, 1.615)) : 0);       // the side of her head, as wide as it has been so far on the way down
        const onHead = wide + of + 0.004 + 0.017 * sm(1.455, 1.475, y) * sm(1.530, 1.512, y) * sm(-0.050, -0.040, z) * sm(0.000, -0.008, z);       // ... and out over her ear
        const x = lerp(onHead, Math.max(xc, onHead), down) + 0.014 * sm(1.30, 0.95, y) * (v - 0.4);
        if (y <= yT) z = Math.max(z - 0.0012, zFront(s * x, y, of, y > 1.40), y > 1.27 ? lerp(zr, 0.034 - 0.022 * v, sm(yT, 1.31, y)) : -9);
        pts.push(V3(s * x, y, z));
      }
      for (let k = 0; k < 6; k++) for (let i = 1; i < pts.length - 1; i++) pts[i].z = (pts[i - 1].z + 2 * pts[i].z + pts[i + 1].z) / 4;
      return pts;
    }
    const LAYF = [[0.004, 7, 0.98, 'tressIn'], [0.017, 7, 0.90, 'tress'], [0.031, 6, 0.86, 'tress']];
    for (const s of [-1, 1]) for (const [off, cnt, yEnd, key] of LAYF) for (let k = 0; k < cnt; k++) {
      const v = (k + 0.5 + hrr(-0.3, 0.3)) / cnt, y1 = yEnd + hrr(-0.06, 0.08) + (v < 0.25 ? 0.08 : 0), mid = bunchPts(s, v, off + hrr(-0.002, 0.004), y1, hrr(-0.006, 0.006));
      tress(key, mid, { w: hrr(0.016, 0.022), th: 0.0055, amp: hrr(0.013, 0.019), lam: hrr(0.110, 0.145), ph: s * v * 3.0 + hrr(0, 2.4), out: 1, tip: 0.2, sway: s * hrr(-0.004, 0.014) });
    }
    // ----- the fringe: curtain bangs, parted in the middle. Flat wisps of separate strands lie on her forehead, sweeping out to each
    // temple; the longest run on down the edge of her cheek to her jaw. [start x, end x, end height, clearance, half-width]
    const FR = [[0.004, 0.056, 1.500, 0.0030, 0.0130, 1], [0.010, 0.058, 1.462, 0.0045, 0.0125, 1], [0.002, 0.044, 1.522, 0.0026, 0.0115, 1], [0.012, 0.036, 1.530, 0.0022, 0.0100, 1], [0.018, 0.058, 1.418, 0.0060, 0.0110, 0],
      [0.006, 0.050, 1.510, 0.0052, 0.0105, 1], [0.022, 0.057, 1.440, 0.0075, 0.0105, 0], [0.001, 0.026, 1.540, 0.0020, 0.0085, 0], [0.008, 0.040, 1.516, 0.0064, 0.0095, 0], [0.003, 0.052, 1.482, 0.0070, 0.0105, 0],
      [0.026, 0.054, 1.520, 0.0034, 0.0120, 1], [0.016, 0.048, 1.506, 0.0080, 0.0100, 0], [0.030, 0.056, 1.488, 0.0056, 0.0110, 1]];      // the last number: 1 for a full lock, 0 for a wisp
    let frN = 0;
    for (const s of [-1, 1]) FR.forEach(([x0, x1, yE, off, w, full], k) => {
      const NP = Q(30, 14), y0 = 1.578, rows = [], vs = [], ph = k * 1.9 + (s > 0 ? 0.7 : 0);
      const at = (t) => { const x = s * (x0 + (x1 - x0) * Math.pow(t, 0.72)) + 0.0025 * Math.sin(t * 9 + ph) * t, y = y0 - (y0 - yE) * Math.pow(t, 1.28); return V3(x, y, 0); };
      const lift = (P, o) => { const lim = headHalfW(P.y) - 0.0015; P.x = cl(P.x, -lim, lim); let f = FMAP(P.x, P.y); if (f < -8) f = FMAP(P.x * 0.9, P.y); if (f < -8) f = HB.c.z + 0.03; P.z = f + o; return P; };
      for (let i = 0; i <= NP; i++) {
        const t = i / NP, P = lift(at(t), off), Pn = lift(at(Math.min(1, t + 0.02)), off), T = Pn.clone().sub(P).normalize(), Bv = V3().crossVectors(T, V3(s * 0.5, 0, 1).normalize()).normalize(), ww = w * (0.45 + 0.55 * sm(0, 0.12, t)) * (1 - 0.35 * t);
        const L = lift(P.clone().addScaledVector(Bv, -ww), off), R = lift(P.clone().addScaledVector(Bv, ww), off), C = lift(P.clone(), off + 0.0012);
        rows.push([[L.x, L.y, L.z], [C.x, C.y, C.z], [R.x, R.y, R.z]]); vs.push(t);
      }
      for (let q = 0; q < 2; q++) for (let i = 1; i < rows.length - 1; i++) for (let j = 0; j < 3; j++) rows[i][j][2] = (rows[i - 1][j][2] + 2 * rows[i][j][2] + rows[i + 1][j][2]) / 4;
      const part = loft(rows, { open: true, v: vs }); frN++;
      for (let i = 0; i < part.uv.length; i += 2) part.uv[i] = part.uv[i] * 0.05 + 0.137 * frN;
      addPart(full ? 'lock' : 'wisp', part, wHair, { out: V3(0, 1.5, -0.2) });
    });
    // ----- the plain dark sheet under the tresses: down her back, and down the front of each shoulder -----
    { const NU = 30, NY = 84, rings = [];
      for (let i = 0; i <= NY; i++) { const ring = [], t = i / NY; for (let j = 0; j <= NU; j++) { const u = lerp(-1, 1, j / NU), y0 = backRootY(u), y = lerp(y0, 0.80 + 0.05 * u * u, t), x = u * spline(WB, cl(y, 0.60, 1.56)) * lerp(0.985, 0.76, sm(1.52, 1.40, y)); ring.push([x, y, 0]); } rings.push(ring); }
      for (let j = 0; j <= NU; j++) { let z = null; for (let i = 0; i <= NY; i++) { const p = rings[i][j], sf = zBack(p[0], p[1], 0.0015 + 0.004 * sm(0, 0.1, i / NY)); z = z == null ? (sf > 8 ? HB.c.z - 0.05 : sf) : Math.min(z + 0.0012, sf); p[2] = z; } }
      addPart('hairmass', loft(rings, { open: true, uS: 5, vS: 4 }), wHair, { out: V3(0, 1.2, 0.3) });
    }
    for (const s of [-1, 1]) { const NU = 12, NY = 56, cols = [], rings = [];
      for (let j = 0; j <= NU; j++) cols.push(bunchPts(s, j / NU, 0.0012, 1.00, 0, NY));
      for (let i = 0; i <= NY; i++) rings.push(cols.map((c) => [c[i].x, c[i].y, c[i].z]));
      addPart('hairmass', loft(rings, { open: true, uS: 3, vS: 4 }), wHair, { out: V3(0, 1.2, -0.4) });
    }
  })();
