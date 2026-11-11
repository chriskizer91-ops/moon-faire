
  // ---------- skin weights by region ----------
  const SPINE_W = [['hips', 0.885], ['spine1', 1.03], ['spine2', 1.14], ['spine3', 1.255]];
  function wSpine(y) {
    if (y <= SPINE_W[0][1]) return [BI.hips, 1];
    for (let i = 1; i < SPINE_W.length; i++) if (y < SPINE_W[i][1]) {
      const u = sm(SPINE_W[i - 1][1], SPINE_W[i][1], y);
      return [BI[SPINE_W[i - 1][0]], 1 - u, BI[SPINE_W[i][0]], u];
    }
    return [BI.spine3, 1];
  }
  function wTorso(x, y, z) {
    const w = wSpine(y), ax = Math.abs(x), S = x < 0 ? 'R' : 'L';
    const k = 0.75 * sm(0.085, 0.15, ax) * sm(1.19, 1.27, y);       // the shoulder girdle follows the collarbone
    if (k > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - k; w.push(BI['clav' + S], k); }
    if (y > 1.30) { const n = sm(1.30, 1.355, y) * (1 - sm(0.05, 0.1, ax)); if (n > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - n; w.push(BI.neck, n); } }
    return w;
  }

  // ---------- torso: purple lace bodice with a V neck, black corset, painted in one atlas ----------
  const TY0 = 0.79, TY1 = 1.352;
  const TORSO = [[0.79, [0.150, 0.095, 0.110, 0]], [0.87, [0.165, 0.100, 0.118, 0]], [0.95, [0.148, 0.095, 0.106, 0]], [1.04, [0.106, 0.082, 0.082, 0.002]],
    [1.095, [0.110, 0.088, 0.084, 0.003]], [1.14, [0.120, 0.095, 0.088, 0.004]], [1.215, [0.134, 0.106, 0.094, 0.004]], [1.255, [0.140, 0.100, 0.097, 0]],
    [1.29, [0.146, 0.088, 0.096, -0.004]], [1.315, [0.138, 0.074, 0.088, -0.008]], [1.337, [0.094, 0.058, 0.070, -0.010]], [1.352, [0.052, 0.046, 0.050, -0.012]]];
  const WAIST = 1.04, PROJ = !!(BAKED && BAKED.body);      // PROJ: the bodice is the painting, projected from the front and from the back
  const TPW = 2.3;
  function torsoTex() {
    const W = Math.round(1024 * TEXS), H = Math.round(1024 * TEXS), c = cvs(W, H), g = c.getContext('2d');
    const ty = (y) => (1 - (y - TY0) / (TY1 - TY0)) * H, mm = H / (TY1 - TY0) / 1000;   // pixels per millimeter, vertically
    const xOf = (u, y) => { const a = (u - 0.5) * TAU, s = Math.sin(a), rx = prof(TORSO, y, true)[0]; return rx * Math.sign(s) * Math.pow(Math.abs(s), 2 / TPW); };
    const uOf = (x, y) => { const rx = prof(TORSO, y, true)[0], q = cl(x / rx, -1, 1); return 0.5 + Math.asin(Math.sign(q) * Math.pow(Math.abs(q), TPW / 2)) / TAU; };
    // purple lace everywhere first
    g.fillStyle = PAL.lace; g.fillRect(0, 0, W, H);
    blobs(g, W, H, 200, [PAL.laceHi], W * 0.02, W * 0.07, 0.10, 0.3);
    blobs(g, W, H, 120, ['#3a1838'], W * 0.02, W * 0.08, 0.15, 0.4);
    for (let i = 0; i < 900; i++) {                // lace flowers and scrolls
      const x = rnd() * W, y = rnd() * H, s = rr(5, 13) * TEXS, col = rnd() < 0.5 ? rgba('#a868a0', 0.5) : rgba('#2a1030', 0.55);
      g.strokeStyle = col; g.lineWidth = 1.4 * TEXS; g.beginPath();
      if (rnd() < 0.5) { for (let p = 0; p < 5; p++) { const a = p * TAU / 5; g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a - 0.5) * s, y + Math.sin(a - 0.5) * s, x + Math.cos(a) * s, y + Math.sin(a) * s); } }
      else g.arc(x, y, s, rnd() * TAU, rnd() * TAU);
      g.stroke();
    }
    // skin above the neckline, column by column (front V, straight across the back)
    const neck = (u) => {
      const a = (u - 0.5) * TAU, front = Math.cos(a) > 0, x = xOf(u, 1.2);
      if (!front) return 1.262;
      const ax = Math.abs(x); if (ax > 0.090) return 1.36;
      return 1.176 + 0.150 * Math.pow(ax / 0.090, 0.85);
    };
    for (let X = 0; X < W; X++) {
      const u = (X + 0.5) / W, yn = neck(u); if (yn > 1.355) continue;
      const Y = ty(yn), sg = g.createLinearGradient(0, 0, 0, Y);
      sg.addColorStop(0, PAL.skin); sg.addColorStop(0.75, PAL.skin); sg.addColorStop(1, '#e4b49a');
      g.fillStyle = sg; g.fillRect(X, 0, 1, Y);
    }
    // soft shading on the chest: collarbones and the hollow between
    const shade = (x0, y0, x1, y1, w, a) => { g.strokeStyle = rgba(PAL.skinSh, a); g.lineWidth = w * mm; g.lineCap = 'round'; g.beginPath(); g.moveTo(uOf(x0, y0) * W, ty(y0)); g.lineTo(uOf(x1, y1) * W, ty(y1)); g.stroke(); };
    g.save(); g.filter = 'blur(' + (3 * TEXS) + 'px)';
    shade(0.012, 1.318, 0.075, 1.330, 5, 0.5); shade(-0.012, 1.318, -0.075, 1.330, 5, 0.5); shade(0, 1.20, 0, 1.25, 6, 0.42);
    g.restore();
    // gold beaded trim along the neckline
    for (let X = 0; X < W; X += 2) {
      const u = (X + 0.5) / W, yn = neck(u); if (yn > 1.355) continue;
      const Y = ty(yn); g.fillStyle = '#2a1242'; g.fillRect(X, Y, 2, 5 * mm); g.fillStyle = PAL.gold; g.fillRect(X, Y - 1.2 * mm, 2, 2.6 * mm);
      if (X % Math.round(7 * TEXS) < 2) dot(g, X, Y + 0.2 * mm, 1.9 * mm, PAL.goldHi);
    }
    // black corset under the bust, the waist and everything below
    const cTop = (u) => { const x = xOf(u, 1.1), f = Math.cos((u - 0.5) * TAU) > 0; return f ? 1.098 + 0.012 * Math.cos(cl(Math.abs(x) / 0.12, 0, 1) * PI) : 1.105; };
    for (let X = 0; X < W; X++) {
      const u = (X + 0.5) / W, Y = ty(cTop(u));
      const sg = g.createLinearGradient(0, Y, 0, H); sg.addColorStop(0, '#221a26'); sg.addColorStop(0.3, '#17121a'); sg.addColorStop(1, '#0e0a10');
      g.fillStyle = sg; g.fillRect(X, Y, 1, H - Y);
      if (X % 2 === 0) { g.fillStyle = PAL.goldDk; g.fillRect(X, Y - 1 * mm, 2, 1.6 * mm); }
    }
    for (let i = -6; i <= 6; i++) {                // boning
      if (i === 0) continue; const x = i * 0.021;
      g.strokeStyle = 'rgba(86,72,96,0.55)'; g.lineWidth = 1.2 * mm; g.beginPath(); g.moveTo(uOf(x, 1.095) * W, ty(1.098)); g.lineTo(uOf(x * 0.9, 0.99) * W, ty(0.985)); g.stroke();
    }
    for (let k = 0; k < 7; k++) {                  // front lacing with gold eyelets
      const y0 = 1.004 + k * 0.0135, y1 = y0 + 0.0135, xl = uOf(-0.013, y0) * W, xr = uOf(0.013, y0) * W;
      g.strokeStyle = '#8d82a0'; g.lineWidth = 1.5 * mm; g.beginPath(); g.moveTo(xl, ty(y0)); g.lineTo(xr, ty(y1)); g.moveTo(xr, ty(y0)); g.lineTo(xl, ty(y1)); g.stroke();
      dot(g, xl, ty(y0), 2.1 * mm, PAL.gold); dot(g, xr, ty(y0), 2.1 * mm, PAL.gold);
    }
    for (const sx of [-1, 1]) { dot(g, uOf(sx * 0.016, 1.105) * W, ty(1.107), 2.6 * mm, PAL.goldHi); dot(g, uOf(sx * 0.07, 1.1) * W, ty(1.101), 2.2 * mm, PAL.gold); }
    return ctex(c);
  }
  (function buildTorso() {
    const rings = [], vs = [], NR = Q(40, 20), NU = Q(56, 28);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(TY0, TY1, i / NR), [rx, rzF, rzB, cz] = prof(TORSO, y, true), ring = [], e = 2 / TPW;
      for (let j = 0; j < NU; j++) {
        const a = (PROJ ? 1.5 * PI : PI) + (j / NU) * TAU, s = Math.sin(a), c = Math.cos(a);     // seam at the back and u = 0.5 the front; projected, the seam is at her right side
        const x = rx * Math.sign(s) * Math.pow(Math.abs(s), e); let z = cz + (c >= 0 ? rzF : rzB) * Math.sign(c) * Math.pow(Math.abs(c), e);
        if (c > 0) {
          const ax = Math.abs(x);
          z += c * 0.031 * Math.exp(-Math.pow((ax - 0.056) / 0.040, 2) - Math.pow((y - 1.215) / 0.046, 2));
          z -= c * 0.004 * Math.exp(-Math.pow(x / 0.014, 2) - Math.pow((y - 1.240) / 0.04, 2));
        }
        ring.push([x, y, z]);
      }
      rings.push(ring); vs.push(i / NR);
    }
    const part = loft(rings, { v: vs, capA: true });
    if (PROJ) for (let i = 0; i <= NR; i++) {             // atlas: front view in the left half, back view in the right, each row spanning the torso's width
      const rx = prof(TORSO, lerp(TY0, TY1, i / NR), true)[0];
      for (let j = 0; j <= NU; j++) { const k = i * (NU + 1) + j, f = 0.5 + 0.5 * cl(part.pos[k * 3] / rx, -1, 1); part.uv[k * 2] = j <= NU / 2 ? 0.5 * f : 0.5 + 0.5 * (1 - f); }
    }
    addPart('torso', part, wTorso, { out: V3(0, 1.1, 0) });
  })();

  // ---------- arms: wine velvet sleeves to the elbow, black sleeves beneath the cuffs ----------
  const ARM_R = [[-0.035, 0.030], [0, 0.050], [0.04, 0.056], [0.11, 0.054], [0.19, 0.051], [0.245, 0.047], [0.30, 0.040], [0.39, 0.033], [0.455, 0.027], [0.475, 0.0255]];
  function wArm(S, sLen) {
    if (sLen < 0.05) { const u = sm(-0.035, 0.05, sLen); return [BI['clav' + S], (1 - u) * 0.6, BI.spine3, (1 - u) * 0.4, BI['uarm' + S], u]; }
    if (sLen < L_UARM + 0.05) { const u = sm(L_UARM - 0.05, L_UARM + 0.05, sLen); return [BI['uarm' + S], 1 - u, BI['farm' + S], u]; }
    const u = sm(L_UARM + L_FARM - 0.02, L_UARM + L_FARM + 0.012, sLen); return [BI['farm' + S], 1 - u, BI['hand' + S], u];
  }
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], NS = Q(30, 14), NU = Q(24, 12);
    const mk = (s0, s1, n) => {
      const pts = [], rad = [], ss = [];
      for (let i = 0; i <= n; i++) { const sl = lerp(s0, s1, i / n); pts.push(sh.clone().addScaledVector(d, sl)); rad.push(prof(ARM_R, sl, true)); ss.push(sl); }
      const rings = tubeRings(pts, rad, NU, V3(0, 0, 1)), part = loft(rings, { capA: s0 < 0, vS: 3 });
      const cols = NU + 1;
      return [part, (x, y, z, i) => wArm(S, i < ss.length * cols ? ss[Math.floor(i / cols)] : ss[0]), centroidOf(rings)];
    };
    const [pa, wa, ca] = mk(-0.035, 0.285, Math.round(NS * 0.62)); addPart('wine', pa, wa, { out: ca });
    const [pb, wb, cb] = mk(0.27, 0.475, Math.round(NS * 0.4)); addPart('cloth', pb, wb, { out: cb });
  }

  // ---------- legs in the flocked leggings ----------
  const LEG = [[0.875, [0.080, 0.090, 0.094, 0.086, 0]], [0.80, [0.072, 0.080, 0.084, 0.086, 0]], [0.70, [0.060, 0.066, 0.070, 0.085, 0.002]], [0.58, [0.050, 0.054, 0.057, 0.084, 0.004]],
    [0.47, [0.043, 0.046, 0.045, 0.083, 0.008]], [0.40, [0.041, 0.042, 0.052, 0.082, 0.002]], [0.33, [0.038, 0.039, 0.047, 0.082, -0.004]], [0.26, [0.035, 0.037, 0.041, 0.081, -0.008]]];
  function wLeg(S, y) {
    if (y > 0.78) { const u = sm(0.78, 0.87, y); return [BI['thigh' + S], 1 - u, BI.hips, u]; }
    const u = sm(0.42, 0.52, y); return [BI['shin' + S], 1 - u, BI['thigh' + S], u];
  }
  for (const [S, s] of SIDES) {
    const rings = [], vs = [], NR = Q(34, 16), NU = Q(28, 14);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(0.875, 0.26, i / NR), [rx, rzF, rzB, cx, cz] = prof(LEG, y, true), ring = [];
      for (let j = 0; j < NU; j++) { const a = PI + (j / NU) * TAU; ring.push([s * cx + rx * 1.07 * Math.sin(a), y, cz + (Math.cos(a) >= 0 ? rzF : rzB) * 1.07 * Math.cos(a)]); }
      rings.push(ring); vs.push(1 - (0.875 - y) / (0.875 - 0.26));
    }
    addPart('leggings', loft(rings, { v: vs, uS: 2 }), (x, y) => wLeg(S, y), { out: V3(s * 0.085, 0.55, 0) });
  }

  // ---------- chunky lace-up boots: patent toe, platform sole, block heel, gold eyelets ----------
  function wBoot(S, y, z) {
    if (y > 0.10) { const u = sm(0.085, 0.165, y); return [BI['foot' + S], 1 - u, BI['shin' + S], u]; }
    const t = sm(0.085, 0.125, z) * (1 - sm(0.07, 0.11, y)); return [BI['foot' + S], 1 - t, BI['toe' + S], t];
  }
  for (const [S, s] of SIDES) {
    const cx = s * 0.081, wf = (x, y, z) => wBoot(S, y, z), NU = Q(28, 14), BW = 0.97, BZ = 0.94;
    // shaft
    const SH = [[0.345, [0.047, 0.050, 0.053, -0.006]], [0.33, [0.047, 0.050, 0.053, -0.006]], [0.27, [0.045, 0.049, 0.052, -0.008]], [0.20, [0.043, 0.049, 0.050, -0.010]], [0.145, [0.041, 0.052, 0.048, -0.010]], [0.095, [0.045, 0.062, 0.052, -0.008]], [0.06, [0.048, 0.07, 0.056, -0.006]]];
    const rings = [], NR = Q(18, 9);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(0.345, 0.06, i / NR), [rx, rzF, rzB, cz] = prof(SH, y, true);
      rings.push(ringXZ(cx, y, cz * BZ, rx * BW, rzF * BZ, rzB * BZ, NU, 2.2));
    }
    // a rolled cuff at the top
    rings.unshift(ringXZ(cx, 0.338, -0.006, 0.040 * BW, 0.043 * BZ, 0.046 * BZ, NU, 2.2), ringXZ(cx, 0.352, -0.006, 0.043 * BW, 0.046 * BZ, 0.049 * BZ, NU, 2.2));
    addPart('boot', loft(rings), wf, { out: V3(cx, 0.2, -0.008) });
    // foot: D-shaped sections from the heel to the toe
    const FT = [[-0.088, [0.020, 0.030]], [-0.078, [0.034, 0.062]], [-0.05, [0.043, 0.088]], [-0.01, [0.046, 0.098]], [0.035, [0.048, 0.086]], [0.08, [0.052, 0.060]], [0.12, [0.053, 0.048]], [0.148, [0.048, 0.041]], [0.166, [0.035, 0.032]], [0.176, [0.016, 0.019]]];
    const fr = [], NF = Q(20, 10), NZ = Q(22, 11), base = 0.044;
    for (let i = 0; i <= NZ; i++) {
      const u = i / NZ, z = lerp(-0.088, 0.176, u * u * (3 - 2 * u) * 0.35 + u * 0.65), [w, h] = prof(FT, z, true), ring = [];
      for (let j = 0; j < NF; j++) {
        const a = (j / NF) * TAU, c = Math.cos(a), sn = Math.sin(a);
        ring.push([cx + w * BW * Math.sign(c) * Math.pow(Math.abs(c), 0.8), base + (sn >= 0 ? h * Math.pow(sn, 0.85) : 0.006 * sn), z * BZ]);
      }
      fr.push(ring);
    }
    addPart('boot', loft(fr, { capA: true, capB: true }), wf, { out: V3(cx, 0.08, 0.04) });
    // sole: forefoot platform, block heel, and a midsole plate that joins them
    const outline = (y, zc, lz, wF, wB, pw, grow) => ringXZ(cx, y, zc, 1, 1, 1, NU, 2).map((p, j) => {
      const a = (j / NU) * TAU, c = Math.cos(a), sn = Math.sin(a), e = 2 / pw;
      return [cx + ((c >= 0 ? wF : wB) + grow) * Math.sign(sn) * Math.pow(Math.abs(sn), e), y, zc + (lz + grow) * Math.sign(c) * Math.pow(Math.abs(c), e)];
    });
    const block = (zc, lz, wF, wB, y0, y1, pw) => {
      const r = [outline(y0, zc, lz, wF, wB, pw, -0.004), outline(y0 + 0.006, zc, lz, wF, wB, pw, 0), outline(y1 - 0.004, zc, lz, wF, wB, pw, 0.001), outline(y1, zc, lz, wF, wB, pw, -0.002)];
      addPart('sole', loft(r, { capA: true, capB: true }), wf, { out: V3(cx, (y0 + y1) / 2, zc) });
    };
    block(0.086 * BZ, 0.092 * BZ, 0.056 * BW, 0.054 * BW, 0, 0.040, 3.2);
    block(-0.052 * BZ, 0.040 * BZ, 0.047 * BW, 0.047 * BW, 0, 0.044, 3.6);
    block(0.044 * BZ, 0.136 * BZ, 0.055 * BW, 0.048 * BW, 0.034, 0.048, 2.8);
    // toe-cap seam and laces
    const seam = []; for (let j = 0; j <= 12; j++) { const a = lerp(-0.1, PI + 0.1, j / 12); seam.push(V3(cx + 0.052 * BW * Math.cos(a), base + 0.054 * Math.pow(Math.max(0, Math.sin(a)), 0.85) + 0.001, (0.112 - 0.012 * Math.sin(a)) * BZ)); }
    addPart('boot', loft(tubeRings(seam, seam.map(() => 0.0032), 6)), wf, { out: V3(cx, 0.05, 0.11) });
    const front = (k) => { const u = k / 8, y = lerp(0.112, 0.325, Math.pow(u, 0.85)), sp = prof(SH, Math.max(0.06, y), true), zs = (sp[3] + sp[1]) * BZ + 0.0035; return V3(cx, y, lerp(0.078 * BZ, zs, sm(0.02, 0.30, u))); };
    for (let k = 0; k <= 8; k++) {
      const p = front(k), ex = 0.0165 * BW;
      for (const sx of [-1, 1]) {
        const c = V3(p.x + sx * ex, p.y, p.z - 0.004);
        addPart('pearl', spherePart(c, 0.0048, 0.0048, 0.003, 8, 5), wf, { out: c });
      }
      if (k < 8) {
        const q = front(k + 1);
        for (const sx of [-1, 1]) {
          const a = V3(p.x + sx * ex, p.y, p.z), b = V3(q.x - sx * ex, q.y, q.z), mid = a.clone().lerp(b, 0.5); mid.z += 0.0045;
          addPart('cord', loft(tubeRings([a, mid, b], [0.0022, 0.0022, 0.0022], 5), { capA: true, capB: true }), wf, { out: mid });
        }
      }
    }
    // a small bow at the top of the lacing
    const bt = front(8);
    for (const sx of [-1, 1]) {
      const lp = []; for (let j = 0; j <= 8; j++) { const a = (j / 8) * TAU; lp.push(V3(bt.x + sx * (0.004 + 0.016 * (1 - Math.cos(a)) * 0.5), bt.y + 0.008 * Math.sin(a) + 0.004, bt.z + 0.006)); }
      addPart('cord', loft(tubeRings(lp, lp.map(() => 0.002), 5)), wf, { out: V3(bt.x + sx * 0.012, bt.y, bt.z) });
      const tail = [V3(bt.x, bt.y, bt.z + 0.006), V3(bt.x + sx * 0.012, bt.y - 0.02, bt.z + 0.006), V3(bt.x + sx * 0.016, bt.y - 0.042, bt.z + 0.002)];
      addPart('cord', loft(tubeRings(curvePts(tail, 6), [0.002, 0.002, 0.002, 0.002, 0.002, 0.002], 5), { capB: true }), wf, { out: V3(bt.x + sx * 0.012, bt.y - 0.02, bt.z) });
    }
  }

  // ---------- hands: a soft palm and jointed fingers with dark polish ----------
  const fingerW = (S, name, tt, fl) => {              // tt: distance along the finger from the knuckle
    const j1 = fl * PHAL[0], j2 = fl * (PHAL[0] + PHAL[1]), b = 0.005;
    if (tt < 0.004) { const u = sm(-0.008, 0.004, tt); return [BI['hand' + S], 1 - u, BI[name + '0' + S], u]; }
    if (tt < j1 + b) { const u = sm(j1 - b, j1 + b, tt); return [BI[name + '0' + S], 1 - u, BI[name + '1' + S], u]; }
    const u = sm(j2 - b, j2 + b, tt); return [BI[name + '1' + S], 1 - u, BI[name + '2' + S], u];
  };
  for (const [S, s] of SIDES) {
    const HP = (x, y, z) => { const p = handPt(s, x, y, z); return [p.x, p.y, p.z]; };
    const wH = wOne('hand' + S), NU = Q(72, 16), HANDP = !!(BAKED && BAKED.hands), HKEY = HANDP ? 'hand' : 'skin';
    const HCELL = { idx: [0, 64], mid: [64, 64], rng: [128, 64], pnk: [192, 64], thb: [256, 64], palm: [320, 192] };   // columns of the hands atlas (512 wide): each cell wraps once round its finger
    const cellUV = (part, key) => { if (HANDP) { const c = HCELL[key]; for (let k = 0; k < part.uv.length; k += 2) part.uv[k] = (c[0] + 0.5 + (c[1] - 1) * cl(part.uv[k], 0, 1)) / 512; } return part; };
    // palm
    const PM = [[0.03, [0.0235, 0.0245, 0]], [0.012, [0.0200, 0.0250, 0]], [-0.012, [0.0135, 0.031, 0.001]], [-0.04, [0.0128, 0.038, 0.002]], [-0.07, [0.0118, 0.0405, 0.002]], [-0.088, [0.0100, 0.039, 0.002]], [-0.096, [0.0060, 0.034, 0.002]]];
    const pr = [], NP = Q(64, 12), G2 = (dy, dz, wy, wz) => Math.exp(-dy * dy / (wy * wy) - dz * dz / (wz * wz));
    for (let i = 0; i <= NP; i++) {
      const y = lerp(0.03, -0.096, i / NP), [tx, tz, cz] = prof(PM, y, true), ring = [];
      for (let j = 0; j < NU; j++) {
        const a = (j / NU) * TAU, c = Math.cos(a), sn = Math.sin(a), e = 2 / 2.8, z = cz + tz * Math.sign(sn) * Math.pow(Math.abs(sn), e);
        let x = tx * Math.sign(c) * Math.pow(Math.abs(c), e);
        if (c < 0) {                                  // the back: a knuckle at the root of each finger, and its tendon running to the wrist
          let b = 0; const along = sm(0.0, -0.03, y) * sm(-0.094, -0.072, y), s01 = cl(-y / 0.086, 0, 1);
          for (const [fn, fz, fy] of FINGERS) b += 0.0021 * G2(y - (fy + 0.005), z - fz, 0.0080, 0.0066) + 0.0003 * G2(0, z - fz * lerp(0.5, 1, s01), 1, 0.0032) * along;
          x -= b * Math.pow(-c, 0.6);
        } else {                                      // the palm: the thumb's mound, the heel, the pads under the fingers, a hollow in the middle
          const b = 0.0056 * G2(y + 0.030, z - 0.019, 0.024, 0.014) + 0.0034 * G2(y + 0.040, z + 0.024, 0.028, 0.010) + 0.0024 * G2(y + 0.082, z, 0.008, 0.030) - 0.0026 * G2(y + 0.054, z - 0.002, 0.020, 0.012);
          x += b * Math.pow(c, 0.6);
        }
        ring.push(HP(x, y, z));
      }
      pr.push(ring);
    }
    addPart(HKEY, cellUV(loft(pr, { capB: true }), 'palm'), (x, y, z, i) => { const row = Math.min(NP, Math.floor(i / (NU + 1))), yy = lerp(0.03, -0.096, row / NP), u = sm(-0.006, 0.02, yy); return [BI['hand' + S], 1 - u, BI['farm' + S], u]; }, { out: handPt(s, 0, -0.04, 0) });
    // fingers
    const NFU = Q(32, 10), finger = (name, base, dir, fl, r0, wfn) => {
      const n = Q(72, 14), pts = [], rad = [], tts = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n, tt = lerp(-0.008, fl, u); pts.push(base.clone().addScaledVector(dir, tt)); tts.push(tt);
        const tip = Math.sqrt(Math.max(0, 1 - Math.pow(sm(fl - r0 * 1.25, fl, tt), 2)));
        const knuckle = 1 + 0.07 * (Math.exp(-Math.pow((tt - fl * PHAL[0]) / 0.004, 2)) + Math.exp(-Math.pow((tt - fl * (PHAL[0] + PHAL[1])) / 0.004, 2)));
        rad.push(Math.max(0.0006, lerp(r0, r0 * 0.78, cl(tt / fl, 0, 1)) * knuckle * (0.12 + 0.88 * tip)));
      }
      // each ring is shaped, not round: fleshy pads between the creases on the palm side, a flatter back with a wrinkled knuckle
      const dn = dir.clone().normalize(), Nv = V3(1, 0, 0).addScaledVector(dn, -dn.x).normalize(), Bv = V3().crossVectors(dn, Nv);
      const j1 = fl * PHAL[0], j2 = fl * (PHAL[0] + PHAL[1]), gs = (x, w) => Math.exp(-x * x / (w * w));
      const rings = pts.map((p, i) => {
        const tt = tts[i], r = rad[i], ring = [], seg = tt < j1 ? tt / j1 : tt < j2 ? (tt - j1) / (j2 - j1) : (tt - j2) / (fl - j2);
        const pad = Math.sin(cl(seg, 0, 1) * PI), crease = gs(tt - j1, 0.0022) + gs(tt - j2, 0.0020) + gs(tt, 0.0025), wr = gs(tt - j1, 0.0036) + 0.7 * gs(tt - j2, 0.0030);
        for (let j = 0; j < NFU; j++) {
          const th = (j / NFU) * TAU, c = Math.cos(th), sn = Math.sin(th);
          const rn = r * (c > 0 ? 0.90 + 0.15 * pad * c - 0.11 * crease * c : 0.92 + 0.045 * wr * -c), q = p.clone().addScaledVector(Nv, c * rn).addScaledVector(Bv, sn * r * 1.04);
          ring.push(HP(q.x, q.y, q.z));
        }
        return ring;
      });
      addPart(HKEY, cellUV(loft(rings, { capB: true }), name), (x, y, z, i) => wfn(tts[Math.min(n, Math.floor(i / (NFU + 1)))]), { out: centroidOf(rings) });
      // nail: a flat glossy oval on the back of the fingertip
      const back = V3(-1, 0, 0), nc = base.clone().addScaledVector(dir, fl - r0 * 1.05).addScaledVector(back, r0 * 0.62), wc = handPt(s, nc.x, nc.y, nc.z);
      const nr = [];
      for (let i = 0; i <= 4; i++) { const ph = (i / 4) * PI * 0.5, ring = []; for (let j = 0; j < 8; j++) { const a = (j / 8) * TAU; const q = nc.clone().addScaledVector(dir, Math.cos(a) * r0 * 0.9 * Math.sin(ph + 0.001)).add(V3(0, 0, Math.sin(a) * r0 * 0.62 * Math.sin(ph + 0.001))).addScaledVector(back, r0 * 0.22 * Math.cos(ph)); const w = handPt(s, q.x, q.y, q.z); ring.push([w.x, w.y, w.z]); } nr.push(ring); }
      nr.reverse();
      addPart('nail', loft(nr, { capB: true }), wOne(name + '2' + S), { out: handPt(s, nc.x + 0.004, nc.y, nc.z) });
    };
    for (const [fn, fz, fy, fl, fr] of FINGERS) finger(fn, V3(0, fy, fz), V3(0, -1, 0), fl, fr, (tt) => fingerW(S, fn, tt, fl));
    const tl = THUMB.len[0] + THUMB.len[1] + THUMB.len[2], j1 = THUMB.len[0], j2 = THUMB.len[0] + THUMB.len[1];
    finger('thb', V3(...THUMB.base), V3(...THUMB.dir).normalize(), tl, THUMB.r, (tt) => {
      if (tt < 0.006) { const u = sm(-0.008, 0.006, tt); return [BI['hand' + S], 1 - u, BI['thb0' + S], u]; }
      if (tt < j1 + 0.005) { const u = sm(j1 - 0.005, j1 + 0.005, tt); return [BI['thb0' + S], 1 - u, BI['thb1' + S], u]; }
      const u = sm(j2 - 0.005, j2 + 0.005, tt); return [BI['thb1' + S], 1 - u, BI['thb2' + S], u];
    });
  }
