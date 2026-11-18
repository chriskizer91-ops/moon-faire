
  // ---------- hair: long, loose and wavy, dark brown with lighter strands, from under her hat to below her hips ----------
  // C11 shows it without the hat (front, side, back), C4 and C5 with the hat, C13 its waves from behind, C12 the parting.
  // It is built as tresses: flat wavy ribbons of strands, a hundred and sixty or so, in layers. Each hangs straight down from its
  // root under the hat and is kept clear of what lies under it (her head, neck, back, chest, arms and skirt), then given its wave.
  // Three groups: the curtain down her back (to about 0.72 m), a bunch over the front of each shoulder (to her waist and hips),
  // and the fringe: curtain bangs parted in the middle, swept to each side of her forehead. Under the tresses lies a plain dark
  // sheet of hair, so no skin shows between them. Nothing moves yet; the tresses are weighted to her head and spine by height.
  const HAIRC = (BAKED && BAKED.hairCols) || ['#231512', '#36221c', '#4d332a', '#6b4b3e', '#987260'];
  let hseed = 90210; const hrnd = () => (hseed = (hseed * 16807) % 2147483647) / 2147483647, hrr = (a, b) => a + (b - a) * hrnd();       // its own dice, so nothing else shifts
  const HB = opts.doll ? { c: V3(0, 1.532, -0.006), rx: 0.077, ry: 0.108, rzF: 0.100, rzB: 0.104 } : { c: V3(0, 1.548, -0.012), rx: 0.074, ry: 0.100, rzF: 0.094, rzB: 0.128 };
  // ---- the doll (no hat): her skull as a radius in every direction from a point inside it, read off the head's own shape, and the
  // surface of the hair lying on it: thin at her parting, fuller toward the sides and fullest at the back (C11, C12) ----
  const HCX = V3(0, 1.530, -0.004), NT_ = 72, NP_ = 56;
  const SKR = (function () {
    const m = new Float32Array(NT_ * NP_).fill(0);
    for (let i = 0; i <= 400; i++) for (let j = 0; j <= 320; j++) {
      const p = headPoint(-PI + TAU * i / 400, PI * j / 320), dx = p[0] - HCX.x, dy = p[1] - HCX.y, dz = p[2] - HCX.z, r = Math.hypot(dx, dy, dz);
      const it = Math.round(((Math.atan2(dx, dz) + PI) / TAU) * NT_) % NT_, ip = Math.round(Math.acos(cl(dy / r, -1, 1)) / PI * (NP_ - 1)); if (r > m[ip * NT_ + it]) m[ip * NT_ + it] = r;
    }
    for (let k = 0; k < 12; k++) for (let ip = 0; ip < NP_; ip++) for (let it = 0; it < NT_; it++) if (!m[ip * NT_ + it]) { let s2 = 0, n = 0; for (const [a, b] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const q = Math.min(NP_ - 1, Math.max(0, ip + a)) * NT_ + (it + b + NT_) % NT_; if (m[q]) { s2 += m[q]; n++; } } if (n) m[ip * NT_ + it] = s2 / n; }
    return (th, ph) => { const ft = ((th + PI) / TAU) * NT_, fp = cl(ph / PI * (NP_ - 1), 0, NP_ - 1.001), i0 = Math.floor(ft), j0 = Math.floor(fp), u = ft - i0, v = fp - j0, I = (a) => ((a % NT_) + NT_) % NT_;
      return lerp(lerp(m[j0 * NT_ + I(i0)], m[j0 * NT_ + I(i0 + 1)], u), lerp(m[(j0 + 1) * NT_ + I(i0)], m[(j0 + 1) * NT_ + I(i0 + 1)], u), v); };
  })();
  const hairT = (th, ph) => 0.0045 + 0.010 * sm(0.20, 1.05, ph) * (0.55 - 0.45 * Math.cos(th)) + 0.010 * sm(0.5, 1.4, ph) * sm(0.2, -0.8, Math.cos(th));       // thickness of hair on the skull
  const hvDir = (th, ph) => V3(Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.sin(ph) * Math.cos(th));
  const HV = (th, ph, extra) => hvDir(th, ph).multiplyScalar(SKR(th, ph) + hairT(th, ph) + (extra || 0)).add(HCX);       // a point of the hair's surface
  const hvAngles = (P) => { const d = P.clone().sub(HCX), r = d.length(); return [Math.atan2(d.x, d.z), Math.acos(cl(d.y / r, -1, 1))]; };
  // her body (trunk and legs) as depth maps, front and back, for the hair to hang against: the doll's skin, with the clothes' thickness
  const DMAP = (function () {
    if (!opts.doll) return null;
    const X0 = -0.26, DX = 0.005, NX = 105, Y0 = 0.50, DY = 0.005, NY = 183, fr = new Float32Array(NX * NY).fill(-9), bk = new Float32Array(NX * NY).fill(9);
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const x = X0 + i * DX, y = Y0 + j * DY;
      let lo = -0.25, hi = 0.25; if (DOLL.Fsnug(x, y, 0) > 0 && DOLL.Fsnug(x, y, -0.03) > 0 && DOLL.Fsnug(x, y, 0.03) > 0) continue;
      const zc = DOLL.Fsnug(x, y, 0) < 0 ? 0 : DOLL.Fsnug(x, y, -0.03) < 0 ? -0.03 : 0.03;
      let a = zc, b = 0.25; for (let k = 0; k < 22; k++) { const m = (a + b) / 2; if (DOLL.Fsnug(x, y, m) < 0) a = m; else b = m; } fr[j * NX + i] = a + 0.003;
      a = zc; b = -0.25; for (let k = 0; k < 22; k++) { const m = (a + b) / 2; if (DOLL.Fsnug(x, y, m) < 0) a = m; else b = m; } bk[j * NX + i] = a - 0.003;
    }
    const at = (M, x, y, miss) => { const fx = (x - X0) / DX, fy = (y - Y0) / DY; if (fx < 0 || fy < 0 || fx > NX - 1.001 || fy > NY - 1.001) return miss; const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j, q = [M[j * NX + i], M[j * NX + i + 1], M[(j + 1) * NX + i], M[(j + 1) * NX + i + 1]];
      if (q.some((t) => Math.abs(t) > 8)) { let b = miss; for (const t of q) if (Math.abs(t) < 8) b = miss > 0 ? Math.min(b, t) : Math.max(b, t); return b; } return lerp(lerp(q[0], q[1], u), lerp(q[2], q[3], u), v); };
    return { front: (x, y) => at(fr, x, y, -9), back: (x, y) => at(bk, x, y, 9) };
  })();       // her head with the bulk of hair on it, under the hat
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
    if (DMAP) { if (y < 1.405) for (const dx of [-o, 0, o]) { const b = DMAP.back(x + dx, y); if (b < 8) z = Math.min(z, b - o); } return z; }
    if (y > 0.86 && y < 1.405) { const [rx0, zf, zb] = spline(IO_TORSO, y), rx = rx0 + o, cz = (zf + zb) / 2; if (ax < rx) z = Math.min(z, cz - (cz - zb + o) * Math.pow(1 - Math.pow(ax / rx, IO_TPW), 1 / IO_TPW)); }
    if (y > 0.15 && y < 1.06) { const [rx0, rz0, cz] = spline(IO_SKIRT_UP, y), rx = rx0 + o; if (ax < rx) z = Math.min(z, cz - (rz0 + o) * Math.sqrt(1 - (ax / rx) * (ax / rx))); }
    return z;
  }
  function zFront(x, y, o, noHead) {
    let z = -9; const ax = Math.abs(x), S = x < 0 ? 'R' : 'L';
    if (!noHead) { const f = FMAP(x, y); if (f > -8) z = Math.max(z, f + o);
      const rx = HB.rx + o, ry = HB.ry + o, q = 1 - (x * x) / (rx * rx) - Math.pow((y - HB.c.y) / ry, 2); if (q > 0) z = Math.max(z, HB.c.z + (HB.rzF * 0.80 + o) * Math.sqrt(q)); }
    if (y > 1.33 && y < 1.50 && ax < 0.046 + o) z = Math.max(z, -0.012 + Math.sqrt(Math.pow(0.046 + o, 2) - x * x));
    if (DMAP) { if (y < 1.405) for (const dx of [-o, 0, o]) { const f = DMAP.front(x + dx, y); if (f > -8) z = Math.max(z, f + o); } }
    else if (y > 0.86 && y < 1.405) { const [rx0, zf, zb] = spline(IO_TORSO, y), rx = rx0 + o, cz = (zf + zb) / 2;
      if (ax < rx) { const B = IO_BUST; z = Math.max(z, cz + (zf - cz + o) * Math.pow(1 - Math.pow(ax / rx, IO_TPW), 1 / IO_TPW) + B.amp * Math.exp(-Math.pow((ax - B.x) / B.sx, 2) - Math.pow((y - B.y) / B.sy, 2))); } }
    z = Math.max(z, capFront(x, y, restPts['sh' + S], restPts['el' + S], 0.046 + o), capFront(x, y, restPts['el' + S], restPts['wr' + S], 0.036 + o));
    if (!DMAP && y > 0.15 && y < 1.06) { const [rx0, rz0, cz] = spline(IO_SKIRT_UP, y), rx = rx0 + o; if (ax < rx) z = Math.max(z, cz + (rz0 + o) * Math.sqrt(1 - (ax / rx) * (ax / rx))); }
    return z;
  }
  const wHair = (x, y) => { if (y > 1.46) return [BI.head, 1]; if (y > 1.36) { const u = sm(1.36, 1.46, y); return [BI.spine3, 1 - u, BI.head, u]; } return wSpine(y); };
  // the middle line of one tress, hanging: lat(y) gives its x at each height; back: it hangs behind her (else in front)
  function hang(o, y0, y1, lat, back, zStart, oRoot, lead) {       // lead(y): for hair in front, a depth it is led to before it meets her
    const pts = [], DY = 0.011, n = Math.max(4, Math.round((y0 - y1) / DY)); let z = null;
    for (let i = 0; i <= n; i++) {
      const y = lerp(y0, y1, i / n), x = lat(y), oo = lerp(oRoot == null ? o : oRoot, o, opts.doll ? sm(y0 - 0.02, y0 - 0.17, y) : sm(y0 - 0.01, y0 - 0.085, y)), s = back ? zBack(x, y, oo) : zFront(x, y, oo);
      if (i === 0) z = zStart == null ? s : (back ? Math.min(zStart, s) : Math.max(zStart, s));
      else z = back ? Math.min(z + 0.0012, s) : Math.max(z - 0.0012, s, lead ? lead(y) : -9);       // it hangs straight, drifting back toward her a little, and rests on whatever it meets
      pts.push(V3(x, y, z));
    }
    for (let k = 0; k < 3; k++) for (let i = 1; i < pts.length - 1; i++) pts[i].z = (pts[i - 1].z + 2 * pts[i].z + pts[i + 1].z) / 4;       // take the corners out
    return pts;
  }
  // a tress: a flat ribbon of strands along a middle line, waving from side to side and a little in and out, turning as it waves
  let tressN = 0;
  function tress(key, mid, o) {                     // o: { w, th, amp, lam, ph, out: +1 or -1 (which way is away from her), tip, sway, wisp }
    const n = mid.length, len = [0]; for (let i = 1; i < n; i++) len.push(len[i - 1] + mid[i].distanceTo(mid[i - 1]));
    const L = len[n - 1], NC = 6, rings = [], vs = [], w0 = o.w, sub = Q(2, 1), M = (n - 1) * sub, q1 = o.ph * 1.7, q2 = o.ph * 0.9, T0 = 1 - (o.wisp || 0.14);       // wisp: how much of its length thins out into separate strands
    for (let k = 0; k <= M; k++) {
      const f = k / sub, i0 = Math.min(n - 2, Math.floor(f)), u = f - i0, P = mid[i0].clone().lerp(mid[i0 + 1], u), s = lerp(len[i0], len[i0 + 1], u), t = s / L;
      const a = mid[Math.max(0, i0 - 1)], b = mid[Math.min(n - 1, i0 + 2)], T = V3(b.x - a.x, b.y - a.y, b.z - a.z).normalize();
      const N = o.nrm ? o.nrm(P) : V3(0, 0, o.out); N.addScaledVector(T, -N.dot(T)).normalize(); const Bv = V3().crossVectors(T, N);       // N: away from her; Bv: across
      const env = sm(o.flat || 0, (o.flat || 0) + 0.13, s) * (1 - 0.25 * sm(0.8, 1, t)) * (0.78 + 0.22 * Math.sin(s * 11 + q1)), ph = o.ph + (s / o.lam) * TAU + 0.9 * Math.sin(s * 6.5 + q2) + 0.4 * Math.sin(s * 17 + q1);       // the waves are not all one length or one size
      P.addScaledVector(Bv, o.amp * env * Math.sin(ph) + (o.sway || 0) * t * t).addScaledVector(N, o.amp * 0.42 * env * (0.5 + 0.5 * Math.cos(ph * 1.0 + 0.9)));
      const tau = 0.75 * env * Math.cos(ph), ct = Math.cos(tau), st = Math.sin(tau), wd = w0 * (0.30 + 0.70 * sm(0.01, 0.08, s)) * (1 - (1 - (o.tip == null ? 0.25 : o.tip)) * Math.pow(t, 2.2)), th = o.th * (1 - 0.5 * t), ring = [];
      for (let j = 0; j < NC; j++) { const an = (j / NC) * TAU, cx = Math.cos(an) * wd, cy = Math.sin(an) * th; ring.push([P.x + (Bv.x * ct + N.x * st) * cx + (N.x * ct - Bv.x * st) * cy, P.y + (Bv.y * ct + N.y * st) * cx + (N.y * ct - Bv.y * st) * cy, P.z + (Bv.z * ct + N.z * st) * cx + (N.z * ct - Bv.z * st) * cy]); }
      rings.push(ring); vs.push(t < T0 ? 0.5 * t / T0 : 0.5 + 0.5 * (t - T0) / (1 - T0));
    }
    const part = loft(rings, { v: vs }); tressN++;
    for (let i = 0; i < part.uv.length; i += 2) part.uv[i] = part.uv[i] * 0.075 + 0.0917 * tressN;       // each tress takes its own strip of the strand picture, so some are darker and some lighter
    addPart(key, part, o.wf || wHair, { out: mid[Math.floor(n / 2)].clone().add(V3(0, 0, -o.out * 0.5)) });
  }
  (function buildHair() {
    const sgn = (v) => (v < 0 ? -1 : 1);
    // ----- the doll: each long tress starts at her parting or her crown and lies on her head down to where it begins to hang -----
    const plen = (P) => { let L = 0; for (let i = 1; i < P.length; i++) L += P[i].distanceTo(P[i - 1]); return L; };
    function backPrefix(P0, ex, u) {             // from round her crown straight down the back of her head
      const [th0, ph0] = hvAngles(P0), pTop = 0.30 + 0.25 * Math.abs(u) + hrr(0, 0.12), out = [], R0 = P0.distanceTo(HCX);
      for (let i = 0; i < 14; i++) { const t = i / 14, q = HV(th0, lerp(pTop, ph0, t), ex), d = q.clone().sub(HCX), r = d.length(); out.push(d.multiplyScalar(lerp(r, R0, sm(0.45, 1.0, t)) / r).add(HCX)); }
      return out;
    }
    function sidePrefix(P0, s, ex) {             // from just off her parting, down the side of her head on a great circle, drifting back
      const d = P0.clone().sub(HCX).normalize(), g = Math.asin(cl(d.z, -1, 1)), bR = Math.atan2(s * d.x, d.y), b0 = hrr(0.02, 0.06), dr = hrr(0.15, 0.30), out = [];
      const R0 = P0.distanceTo(HCX);
      for (let i = 0; i < 16; i++) { const t = i / 16, b = lerp(b0, bR, t), gg = g + dr * (bR - b) * (1 - sm(0.6, 1.0, t)); const dd = V3(s * Math.sin(b) * Math.cos(gg), Math.cos(b) * Math.cos(gg), Math.sin(gg)).normalize(); const q = HV(Math.atan2(dd.x, dd.z), Math.acos(cl(dd.y, -1, 1)), ex), r = q.distanceTo(HCX); out.push(dd.multiplyScalar(lerp(r, R0, sm(0.45, 1.0, t))).add(HCX)); }
      return out;
    }
    const radialUntil = (yR, out) => (P) => P.clone().sub(HCX).normalize().lerp(V3(0, 0, out), sm(yR + 0.02, yR - 0.10, P.y)).normalize();       // the ribbon turns slowly from lying on her head to hanging
    // ----- the curtain down her back -----
    const WB = [[0.60, 0.120], [0.75, 0.140], [0.95, 0.160], [1.15, 0.166], [1.30, 0.160], [1.40, 0.134], [1.47, 0.108], [1.56, 0.074]];       // its half-width by height
    const backLat = (u, y0) => { const w0 = spline(WB, y0); return (y) => u * spline(WB, cl(y, 0.60, 1.56)) * (1 + 0.0 * w0); };
    const backRootY = opts.doll ? (u) => HV(PI - u * 1.08, 1.66).y : (u) => hatOpenY(HB.c.z - HB.rzB * Math.sqrt(Math.max(0.05, 1 - u * u * 0.92))) + 0.006;
    const backRootZ = opts.doll ? (u) => HV(PI - u * 1.08, 1.66).z : (u, y0) => { const x = u * 0.070, a = Math.atan2(x, -1), zo = HAT.oc[2] - (HAT.ob - 0.008) * Math.sqrt(Math.max(0, 1 - Math.pow(x / (HAT.oa - 0.006), 2))); return Math.max(zo, zBack(x, y0, 0.004)); };
    // The chains her hair hangs from (November 13: it moves with her now). Above her shoulders it still goes with her head; from the foot of
    // her neck down, each tress follows the two chains nearest to it: five down her back, two down the front of each shoulder.
    const hairHead = (w, y) => { const uh = sm(1.36, 1.46, y); return uh >= 0.999 ? [BI.head, 1] : uh <= 0.001 ? w : mixW(w, [BI.head, 1], uh); };
    const HB_Y = [1.40, 1.28, 1.16, 1.04, 0.92, 0.80, 0.68], HB_U = [-0.9, -0.45, 0, 0.45, 0.9];
    const hcB = HB_U.map((u, j) => { let z = null; return addChain('hair', 'hb' + j, 'spine3', HB_Y.map((y) => { const x = u * spline(WB, cl(y, 0.60, 1.56)), sf = zBack(x, y, 0.028); z = z == null ? (sf > 8 ? -0.10 : sf) : Math.min(z + 0.004, sf > 8 ? z : sf); return V3(x, y, z); }), { back: 1 }); });
    const wBack = (u) => { const f = cl((u - HB_U[0]) / (HB_U[1] - HB_U[0]), 0, HB_U.length - 1 - 1e-6), j = Math.floor(f); return (x, y) => hairHead(mixW(chainW(hcB[j], y), chainW(hcB[j + 1], y), f - j), y); };
    const LAYB = opts.doll ? [[0.005, 16, 0.80, 'tressIn'], [0.016, 17, 0.74, 'tress'], [0.027, 16, 0.70, 'tress'], [0.037, 11, 0.86, 'tress']] : [[0.006, 16, 0.80, 'tressIn'], [0.024, 17, 0.74, 'tress'], [0.042, 16, 0.70, 'tress'], [0.056, 11, 0.86, 'tress']];       // clearance, how many, where they end, which shade
    for (const [off, cnt, yEnd, key] of LAYB) for (let k = 0; k < cnt; k++) {
      const u = 0.975 * Math.sin(lerp(-1, 1, (k + 0.5 + hrr(-0.3, 0.3)) / cnt) * PI / 2), y0 = backRootY(u), lat0 = backLat(u, y0), y1 = yEnd + hrr(-0.05, 0.07) + 0.06 * u * u;
      let mid = hang(off + hrr(-0.003, 0.004), y0, y1, (y) => lat0(y), true, backRootZ(u, y0), 0.004), flat = 0;
      if (opts.doll) { const pre = backPrefix(mid[0], 0.0012 + off * 0.03, u); flat = plen(pre.concat([mid[0]])); mid = pre.concat(mid); }
      tress(key, mid, { w: hrr(0.017, 0.024), th: 0.0055, amp: hrr(0.014, 0.021), lam: hrr(0.115, 0.150), ph: u * 5.0 + hrr(0, 2.4), out: -1, tip: 0.2, sway: hrr(-0.012, 0.012), wf: wBack(u), flat, nrm: opts.doll ? radialUntil(y0, -1) : null });
    }
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) {      // more at its two edges, where it turns the corner behind her shoulders
      const u = s * lerp(0.86, 0.99, (k + 0.5) / 5), y0 = backRootY(u), lat0 = backLat(u, y0); let mid = hang(lerp(0.006, 0.030, hrnd()), y0, 0.80 + hrr(-0.05, 0.12), (y) => lat0(y) * (1 + 0.03 * k * sm(1.5, 1.3, y)), true, backRootZ(u, y0), 0.004), flat = 0;
      if (opts.doll) { const pre = backPrefix(mid[0], 0.0015, u); flat = plen(pre.concat([mid[0]])); mid = pre.concat(mid); }
      tress(k % 2 ? 'tress' : 'tressIn', mid, { w: hrr(0.017, 0.023), th: 0.0055, amp: hrr(0.013, 0.019), lam: hrr(0.115, 0.150), ph: u * 5.0 + hrr(0, 2.4), out: -1, tip: 0.2, sway: s * hrr(0, 0.012), wf: wBack(u), flat, nrm: opts.doll ? radialUntil(y0, -1) : null });
    }
    // ----- a bunch over the front of each shoulder -----
    // Rooted along the side of her head from her temple to behind her ear, each tress lies on the side of her head (clear of her cheek,
    // over her ear), so her profile stays clear as in C4. As it passes her neck it is led forward, and from there it lies on the
    // front of her shoulder and chest and hangs to her waist or hips. The middle of her chest stays bare.
    function bunchPts(s, v, off, y1, jit, n) {       // v: 0 the tress nearest her face .. 1 the one furthest back
      const a = lerp(1.14, 1.98, v), ca = Math.cos(a), hvp = opts.doll ? HV(s * lerp(1.00, 1.95, v), 1.38) : null, zr = hvp ? hvp.z : HB.c.z + (ca >= 0 ? HB.rzF : HB.rzB) * ca * 0.92, y0 = hvp ? hvp.y : hatOpenY(zr) + 0.004, xc = lerp(0.086, 0.174, Math.pow(v, 0.9)) + (jit || 0), pts = [], yT = 1.49 + 14 * (jit || 0) * 0.5;
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
    const HF_Y = [1.40, 1.28, 1.16, 1.04, 0.92], HF_V = [0.25, 0.75], hcF = {};
    for (const s of [-1, 1]) hcF[s] = HF_V.map((v, j) => { const pts = bunchPts(s, v, 0.022, 0.90, 0, 150); return addChain('hair', 'hf' + (s < 0 ? 'R' : 'L') + j, 'spine3', HF_Y.map((y) => { let b = pts[0]; for (const p of pts) if (Math.abs(p.y - y) < Math.abs(b.y - y)) b = p; return V3(b.x, y, b.z); }), { front: 1 }); });
    const wBunch = (s, v) => { const f = cl((v - HF_V[0]) / (HF_V[1] - HF_V[0]), 0, 1); return (x, y) => hairHead(mixW(chainW(hcF[s][0], y), chainW(hcF[s][1], y), f), y); };
    const LAYF = opts.doll ? [[0.003, 9, 0.98, 'tressIn'], [0.011, 9, 0.90, 'tress'], [0.019, 7, 0.86, 'tress']] : [[0.004, 9, 0.98, 'tressIn'], [0.017, 9, 0.90, 'tress'], [0.031, 7, 0.86, 'tress']];
    for (const s of [-1, 1]) for (const [off, cnt, yEnd, key] of LAYF) for (let k = 0; k < cnt; k++) {
      const v = (k + 0.5 + hrr(-0.3, 0.3)) / cnt, y1 = yEnd + hrr(-0.06, 0.08) + (v < 0.25 ? 0.08 : 0); let mid = bunchPts(s, v, off + hrr(-0.002, 0.004), y1, hrr(-0.006, 0.006)), flat = 0;
      if (opts.doll) { const pre = sidePrefix(mid[0], s, 0.0012 + off * 0.06); flat = plen(pre.concat([mid[0]])); mid = pre.concat(mid); }
      const nr = sm(0.0, 0.28, v);       // the tresses nearest her face are slimmer and wave less, so they frame it and do not cross it
      tress(key, mid, { w: hrr(0.016, 0.022) * (0.62 + 0.38 * nr), th: 0.0055, amp: hrr(0.013, 0.019) * (0.45 + 0.55 * nr), lam: hrr(0.110, 0.145), ph: s * v * 3.0 + hrr(0, 2.4), out: 1, tip: 0.2, sway: s * hrr(0.002, 0.014), wf: wBunch(s, v), flat, nrm: opts.doll ? radialUntil(mid[flat ? 16 : 0].y, 1) : null });
    }
    // ----- the fringe: curtain bangs, parted in the middle, swept back to frame her face -----
    // Chris, November 13: nothing of her hair is painted on her face; "the hair that's in front of her face is actually like 3D
    // rendered hair hanging in front of her face". Then, the same day: "her bangs should frame her face, not obscure her face ...
    // slide them back so that there's no gap between her bangs and the rest of her hair. And her face is more open".
    // So each lock is a small tress that leaves her parting under the hat, sweeps out across the top of her forehead above her brows,
    // reaches her temple, and from there lies along the side of her face with the tresses of the bunch. Nothing of it crosses her
    // brows, eyes, glasses or cheeks. [start x, how far down the side of her face it runs (height), clearance, half-width, wave]
    const FR = [[0.003, 1.500, 0.0050, 0.0085, 0.0030], [0.007, 1.468, 0.0065, 0.0095, 0.0035], [0.012, 1.530, 0.0045, 0.0085, 0.0025], [0.017, 1.440, 0.0080, 0.0100, 0.0040],
      [0.022, 1.486, 0.0055, 0.0095, 0.0035], [0.028, 1.522, 0.0045, 0.0085, 0.0025], [0.034, 1.455, 0.0070, 0.0100, 0.0040], [0.040, 1.505, 0.0050, 0.0090, 0.0030],
      [0.046, 1.425, 0.0085, 0.0100, 0.0045], [0.010, 1.538, 0.0090, 0.0075, 0.0020], [0.024, 1.412, 0.0100, 0.0100, 0.0045], [0.050, 1.476, 0.0060, 0.0090, 0.0035]];
    for (const s of [-1, 1]) FR.forEach(([x0, yE, off, w, amp], k) => {
      const yB = opts.doll ? 1.578 : hatOpenY(HAT.oc[2] + HAT.ob), y0 = yB + 0.004, yBrow = FC.browY + 0.007, pts = [], NA = 12;
      // across her forehead: from the parting out to her temple, dropping from under the brim to just above her brow
      const xT = headHalfW(yBrow) - 0.004, yT = opts.doll ? Math.max(yBrow + 0.012, 1.560 - 0.006 * (k % 3)) : Math.max(yBrow, yB - 0.016 - 0.004 * (k % 3));
      if (opts.doll) { x0 = 0.003 + 0.0015 * (k % 4); }
      const yS = opts.doll ? y0 + 0.004 + 0.0018 * k : y0;
      for (let i = 0; i <= NA; i++) { const t = i / NA, x = lerp(x0, xT, Math.pow(t, opts.doll ? 0.70 : 0.85)), y = lerp(yS, yT, Math.pow(t, opts.doll ? 1.25 : 1.6)), f = FMAP(Math.min(x, 0.088), y); pts.push(V3(s * x, y, (f > -8 ? f : HB.c.z + 0.04) + 0.003 + (off - 0.003) * sm(0, 0.4, t) + (opts.doll ? 0.0050 * (1 - sm(0.25, 0.7, t)) : 0))); }
      // down the side of her face: outside her cheek all the way, drawing back a little as it hangs
      let wide = xT, z = pts[NA].z; const NB = Math.max(2, Math.round((yT - yE) / 0.009));
      for (let i = 1; i <= NB && yE < yT - 0.004; i++) { const y = lerp(yT, yE, i / NB); wide = Math.max(wide, y > 1.44 ? headHalfW(y) : 0); z = Math.max(z - 0.0030, HB.c.z + 0.030 + 0.004 * (k % 4)); pts.push(V3(s * (wide + off + 0.003 + 0.006 * sm(yT, yT - 0.05, y)), y, z)); }
      for (let q = 0; q < 3; q++) for (let i = 1; i < pts.length - 1; i++) { pts[i].x = (pts[i - 1].x + 2 * pts[i].x + pts[i + 1].x) / 4; pts[i].z = (pts[i - 1].z + 2 * pts[i].z + pts[i + 1].z) / 4; }
      tress(k % 4 === 3 ? 'tressIn' : 'tress', pts, { w, th: 0.0034, amp, lam: 0.070 + 0.005 * (k % 4), ph: k * 1.9 + (s > 0 ? 0.7 : 0), out: 1, tip: 0.35, sway: s * 0.003, wisp: 0.30, wf: () => [BI.head, 1] });       // the fringe goes with her head
    });
    // ----- the plain dark sheet under the tresses: down her back, and down the front of each shoulder -----
    { const NU = 30, NY = 84, rings = [];
      for (let i = 0; i <= NY; i++) { const ring = [], t = i / NY; for (let j = 0; j <= NU; j++) { const u = lerp(-1, 1, j / NU), y0 = opts.doll ? 1.455 : backRootY(u), y = lerp(y0, 0.80 + 0.05 * u * u, t), x = u * spline(WB, cl(y, 0.60, 1.56)) * lerp(0.985, 0.76, sm(1.52, 1.40, y)); ring.push([x, y, 0]); } rings.push(ring); }
      for (let j = 0; j <= NU; j++) { let z = null; for (let i = 0; i <= NY; i++) { const p = rings[i][j], sf = zBack(p[0], p[1], 0.0015 + 0.004 * sm(0, 0.1, i / NY)); z = z == null ? (sf > 8 ? HB.c.z - 0.05 : sf) : Math.min(z + 0.0012, sf); p[2] = z; } }
      const wc = []; for (let j = 0; j <= NU; j++) wc.push(wBack(lerp(-1, 1, j / NU)));
      addPart('hairmass', loft(rings, { open: true, uS: 5, vS: 4 }), (x, y, z, i) => wc[i % (NU + 1)](x, y), { out: V3(0, 1.2, 0.3) });
    }
    for (const s of [-1, 1]) { const NU = 12, NY = 56, cols = [], rings = [];
      for (let j = 0; j <= NU; j++) { const c = bunchPts(s, j / NU, 0.0012, 1.00, 0, NY * (opts.doll ? 2 : 1)); cols.push(opts.doll ? c.filter((p, i) => i % 2 === 0 && true).map((p, i, A) => A[i]) : c); }
      if (opts.doll) for (const c of cols) { const k0 = c.findIndex((p) => p.y < 1.46); const keep = c.slice(Math.max(0, k0)); while (keep.length < NY + 1) keep.push(keep[keep.length - 1].clone()); c.length = 0; for (let i = 0; i <= NY; i++) c.push(keep[Math.round(i * (keep.length - 1) / NY)]); }
      for (let i = 0; i <= NY; i++) rings.push(cols.map((c) => [c[i].x, c[i].y, c[i].z]));
      const wc = []; for (let j = 0; j <= NU; j++) wc.push(wBunch(s, j / NU));
      addPart('hairmass', loft(rings, { open: true, uS: 3, vS: 4 }), (x, y, z, i) => wc[i % (NU + 1)](x, y), { out: V3(0, 1.2, -0.4) });
    }
    // ----- the doll (no hat): a cap of hair over her skull, and locks lying on it from her parting (C12) -----
    if (opts.doll) {
      const wHead = () => [BI.head, 1];
      // where her hair ends on her head, as an angle down from the top: her hairline at the front, above her ears, down to her nape
      const phEdge = (th) => prof([[0, 1.06], [0.40, 1.09], [0.75, 1.25], [1.15, 1.44], [1.45, 1.57], [1.75, 1.70], [2.20, 2.02], [PI, 2.22]], Math.abs(th), true);
      // the cap: the hair's surface itself, 1.5 mm under the locks, dark, with strands running down from the parting
      { const NU = 120, NV = 48, rings = [];
        for (let i = 0; i <= NV; i++) { const ring = []; for (let j = 0; j < NU; j++) { const th = -PI + TAU * j / NU, ph = Math.max(0.0001, phEdge(th) * i / NV), P = HV(th, ph, -0.0015 - 0.0025 * sm(0.75, 1.0, i / NV) * sm(0.6, 0.1, Math.abs(th))); ring.push([P.x, P.y, P.z]); } rings.push(ring); }
        addPart('hairmass', loft(rings, { uS: 14, vS: 3 }), wHead, { out: HCX.clone() });
      }
      const nrm = (P) => P.clone().sub(HCX).normalize();
      // a lock: from a ray direction function d(t), t from 0 to 1, laid on the hair's surface (plus a layer's height) and cut where it leaves the head
      const lockPts = (dirAt, n, extra, yStop) => { const pts = []; for (let i = 0; i <= n; i++) { const d = dirAt(i / n), th = Math.atan2(d.x, d.z), ph = Math.acos(cl(d.y, -1, 1)), P = HV(th, ph, extra); if (pts.length > 2 && P.y < yStop) break; pts.push(P); } return pts; };
      // over the top and down each side: from just off the parting, a great circle down the side of her head, drifting back as it goes
      for (const s of [-1, 1]) for (const [ex, key, cnt] of [[0.0008, 'tressIn', 22]]) for (let k = 0; k < cnt; k++) {
        const g0 = lerp(0.70, -0.95, (k + 0.5 + hrr(-0.35, 0.35)) / cnt), b0 = hrr(0.02, 0.07), drift = hrr(0.18, 0.32);
        const yStop = lerp(1.535, 1.500, sm(0.2, -0.6, g0)) + hrr(-0.008, 0.006);
        const dirAt = (t) => { const b = lerp(b0, 1.95, t), g = g0 - drift * (b - b0) * (g0 > 0.35 ? 0.5 : 1); return V3(s * Math.sin(b) * Math.cos(g), Math.cos(b) * Math.cos(g), Math.sin(g)).normalize(); };
        const pts = lockPts(dirAt, 40, ex, yStop); if (pts.length < 4) continue;
        tress(key, pts, { w: hrr(0.008, 0.012), th: 0.0022, amp: hrr(0.0015, 0.0035), lam: hrr(0.06, 0.09), ph: k * 1.7 + s, nrm, tip: 0.55, wisp: 0.20, wf: wHead });
      }
      // down the back of her head, from round her crown
      for (const [ex, key, cnt] of [[0.0008, 'tressIn', 14]]) for (let k = 0; k < cnt; k++) {
        const th = PI + lerp(-1.05, 1.05, (k + 0.5 + hrr(-0.3, 0.3)) / cnt), p0 = hrr(0.30, 0.55);
        const dirAt = (t) => hvDir(th + 0.08 * Math.sin(t * 3 + k), lerp(p0, 2.15, t));
        const pts = lockPts(dirAt, 36, ex, 1.455 + hrr(-0.01, 0.01)); if (pts.length < 4) continue;
        tress(key, pts, { w: hrr(0.009, 0.013), th: 0.0022, amp: hrr(0.002, 0.004), lam: hrr(0.07, 0.10), ph: k * 2.3, nrm, tip: 0.55, wisp: 0.22, wf: wHead });
      }
    }
  })();
