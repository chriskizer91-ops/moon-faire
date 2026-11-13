
  // ---------- hat: wine-red felt, a wide floppy brim, a tall soft crown that slumps to HER RIGHT and hangs behind her shoulder ----------
  // Measured off C4 (front: 1370 px a metre; profile: 1290 px a metre, the tip of her nose at x 1432) and C5, with the details in C15 to C17.
  //   the opening: an ellipse 17 cm across and 25 cm front to back, lying on a plane that rises toward the front (at her hairline in
  //     front, 1.556 m; at the back, 1.497 m);
  //   the brim: 33 cm across and 39 cm front to back, level in front, drooping 4.5 cm at the sides and 9 cm at the back;
  //   the band: black lace 4.6 cm high, a silver chain round it, three small gold crosses in front, the big ringed cross toward her
  //     left, a cream horn at each side;
  //   the crown: up 15 cm, over to her right and back, then down behind her right shoulder to the height of her chin.
  const HAT = { oc: [0, 1.5266, -0.030], oa: 0.084, ob: 0.127, slope: 0.056 / 0.234, bandH: 0.046, ec: -0.015, ea: 0.166, eb: 0.186 };
  const hatOpen = (a, grow) => { const g = grow || 0, x = (HAT.oa + g) * Math.sin(a), z = HAT.oc[2] + (HAT.ob + g) * Math.cos(a); return [x, HAT.oc[1] + (z - HAT.oc[2]) * HAT.slope, z]; };
  const hatDrop = (a) => 0.004 - 0.092 * Math.pow((1 - Math.cos(a)) / 2, 0.9);            // how far the brim's edge hangs below the opening, by direction
  function brimPt(a, t) {                            // t: 0 at the opening .. 1 at the edge
    const p0 = crown.pt(0, a, 0.001, true), x1 = HAT.ea * Math.sin(a), z1 = HAT.ec + HAT.eb * Math.cos(a), tt = t * t;
    const rip = 0.010 * Math.sin(3 * a + 0.6) + 0.006 * Math.sin(5 * a + 2.0) + 0.004 * Math.sin(8 * a + 0.9);
    return [lerp(p0[0], x1, t), p0[1] + hatDrop(a) * Math.pow(t, 1.7) + rip * tt + 0.009 * Math.sin(a) * t, lerp(p0[2], z1, t)];
  }
  // the crown's middle line and its half-widths (across, front to back) at each station
  // Read off both views of C4: a dome as wide as the band, 1.72 m at its top; the rest of the crown comes off the back of the dome on
  // her right, 10 cm thick where it starts, and hangs down behind her right shoulder, thinning to its tip at 1.40 m.
  // Chris, November 13: the hat down by 15% of the way from its bottom edge in front to the top of her glasses (7 mm), and later the
  // same day by another 30% of that way (14.4 mm more). The way was 4.81 cm; the hat now sits 45% of it lower, 21.4 mm. Every height
  // below has that taken off.
  const CROWN = [[0, 1.5266, -0.030, 0.084, 0.125], [0, 1.5746, -0.042, 0.083, 0.120], [-0.004, 1.6146, -0.054, 0.078, 0.108], [-0.026, 1.6426, -0.082, 0.068, 0.086], [-0.074, 1.6446, -0.128, 0.058, 0.062],
    [-0.118, 1.6126, -0.160, 0.050, 0.051], [-0.140, 1.5546, -0.172, 0.043, 0.044], [-0.150, 1.4946, -0.171, 0.034, 0.035], [-0.158, 1.4386, -0.176, 0.024, 0.025], [-0.172, 1.3986, -0.190, 0.012, 0.012], [-0.178, 1.3786, -0.200, 0.004, 0.004]];
  const crown = (function () {
    const NS = Q(96, 40), ctr = curvePts(CROWN.map((c) => V3(c[0], c[1], c[2])), NS + 1), fr = [], len = [0];
    const al = Math.atan(HAT.slope); let T0 = V3(0, Math.cos(al), -Math.sin(al)), N = V3(1, 0, 0);
    for (let i = 0; i <= NS; i++) {
      const a = ctr[Math.max(0, i - 1)], b = ctr[Math.min(NS, i + 1)]; let T = V3(b.x - a.x, b.y - a.y, b.z - a.z).normalize(); if (i === 0) T = T0.clone();
      N.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(T0, T)); N.addScaledVector(T, -N.dot(T)).normalize(); T0 = T.clone();
      fr.push({ C: ctr[i], T, N: N.clone(), F: V3().crossVectors(N, T) });
      if (i) len.push(len[i - 1] + ctr[i].distanceTo(ctr[i - 1]));
    }
    // half-widths by station, read at the same fraction of the control points as the curve
    const rad = (i) => { const u = (i / NS) * (CROWN.length - 1), k = Math.min(CROWN.length - 2, Math.floor(u)), f = u - k, sf = f * f * (3 - 2 * f); return [lerp(CROWN[k][3], CROWN[k + 1][3], sf), lerp(CROWN[k][4], CROWN[k + 1][4], sf)]; };
    const pt = (i, a, grow, plain) => {             // a: 0 toward the front of the section, a quarter turn toward her left
      const f = fr[i], [ra, rb] = rad(i), s = i / NS, L = len[i];
      let k = 1;
      if (!plain) {                                 // soft felt: creases round it where it slumps, a few long folds, and its own weight flattening the tail
        const env = sm(0.11, 0.26, s) * (1 - 0.5 * sm(0.85, 1, s));
        k += env * (0.105 * Math.sin(L * 50 + 1.8 * Math.sin(a + 2 * s * 6) + 4 * fbm(a * 0.7 + 3, L * 9)) + 0.060 * Math.sin(3 * a + L * 14 + 1) + 0.12 * (fbm(Math.cos(a) * 1.4 + 9, L * 16 + Math.sin(a)) - 0.47));
        k += 0.035 * sm(0.02, 0.12, s) * (1 - env) * Math.sin(2 * a + 1.2);
      }
      // Lower on her head the hat meets her forehead where it is wider, so the foot of the crown is squarer than an ellipse at its
      // four corners (and sits 11 mm further forward than first built): her forehead and the roots of her fringe stay inside it.
      const e = 2 / lerp(2.45, 2, sm(0.0, 0.22, s)), sa = Math.sin(a), ca = Math.cos(a);
      const cx = (ra * k + (grow || 0)) * Math.sign(sa) * Math.pow(Math.abs(sa), e), cz = (rb * k + (grow || 0)) * Math.sign(ca) * Math.pow(Math.abs(ca), e);
      return [f.C.x + f.N.x * cx + f.F.x * cz, f.C.y + f.N.y * cx + f.F.y * cz, f.C.z + f.N.z * cx + f.F.z * cz];
    };
    let iBand = 1; while (iBand < NS && len[iBand] < HAT.bandH) iBand++;
    return { NS, pt, len, iBand, fr };
  })();
  (function buildHat() {
    const wHat = wOne('head'), NA = Q(120, 48), aOf = (j) => (j / NA) * TAU;
    // the crown
    { const rings = [], vs = [];
      for (let i = 0; i <= crown.NS; i++) { const ring = []; for (let j = 0; j < NA; j++) ring.push(crown.pt(i, aOf(j))); rings.push(ring); vs.push(crown.len[i] / 0.115); }
      const part = loft(rings, { capB: true, v: vs, uS: 6 }); addPart('felt', part, wHat, { out: V3(0, 1.62, -0.05) });
    }
    // the brim: one sheet of felt, seen from both sides, with a rolled edge
    { const NT = Q(22, 10), rings = [], vs = [];
      for (let i = 0; i <= NT; i++) { const t = i / NT, ring = []; for (let j = 0; j < NA; j++) ring.push(brimPt(aOf(j), t)); rings.push(ring); vs.push(t); }
      addPart('brim', loft(rings, { v: vs }), wHat, { out: V3(0, 1.30, -0.02) });
      const ep = []; for (let j = 0; j <= NA; j++) { const p = brimPt(aOf(j), 1); ep.push(V3(p[0], p[1], p[2])); }
      addPart('felt', loft(tubeRings(ep, ep.map(() => 0.0024), 6, V3(0, 1, 0)), { uS: 0.3, vS: 9 }), wHat, { out: V3(0, 1.5, -0.02), flip: true });
    }
    // the band of black lace round the foot of the crown
    { const rings = [], vs = [];
      for (let i = 0; i <= crown.iBand; i++) { const ring = []; for (let j = 0; j < NA; j++) ring.push(crown.pt(i, aOf(j), 0.0035, true)); rings.push(ring); vs.push(0.06 + 0.88 * crown.len[i] / crown.len[crown.iBand]); }
      { const ring = []; for (let j = 0; j < NA; j++) ring.push(crown.pt(crown.iBand, aOf(j), 0.0005, true)); rings.push(ring); vs.push(0.97); }
      addPart('hatband', loft(rings, { v: vs, uS: 16 }), wHat, { out: V3(0, 1.58, -0.045) });
    }
    // where things sit on the band: a point on it, and the directions out from it, up it and along it
    const bandAt = (a, h, off) => {                 // h: 0 at the brim .. 1 at the top of the band
      const fi = h * crown.iBand, i0 = Math.min(crown.iBand - 1, Math.floor(fi)), f = fi - i0, p0 = crown.pt(i0, a, off || 0, true), p1 = crown.pt(i0 + 1, a, off || 0, true), q0 = crown.pt(i0, a + 0.01, off || 0, true);
      const P = V3(lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f), lerp(p0[2], p1[2], f)), U = V3(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]).normalize(), R = V3(q0[0] - p0[0], q0[1] - p0[1], q0[2] - p0[2]).normalize();
      return { P, U, R, O: V3().crossVectors(R, U).normalize() };
    };
    const rod = (key, a, b, r, n) => { const pts = [a, a.clone().lerp(b, 0.5), b]; addPart(key, loft(tubeRings(pts, pts.map(() => r), n || 6), { capA: true, capB: true }), wHat, { out: a.clone().lerp(b, 0.5), flip: false }); };
    const hoop = (key, C, X, Y, rx, ry, r, n, m) => { const pts = []; for (let k = 0; k <= n; k++) { const t = (k / n) * TAU; pts.push(C.clone().addScaledVector(X, rx * Math.cos(t)).addScaledVector(Y, ry * Math.sin(t))); }
      addPart(key, loft(tubeRings(pts, pts.map(() => r), m || 5, V3().crossVectors(X, Y))), wHat, { out: C }); };
    // the chain: links of silver wire, hung in shallow swags round the upper half of the band
    { const NL = Q(108, 54), chainH = (a) => 0.92 - 0.24 * Math.pow(Math.abs(Math.sin(a * 3.5 + 0.35)), 0.7);
      for (let k = 0; k < NL; k++) { const a = (k / NL) * TAU, B = bandAt(a, chainH(a), 0.0058), B2 = bandAt(a + TAU / NL, chainH(a + TAU / NL), 0.0058), Tn = B2.P.clone().sub(B.P).normalize(), W = k % 2 ? B.O : V3().crossVectors(Tn, B.O).normalize();
        hoop('silver', B.P, Tn, W, 0.0042, 0.0024, 0.00075, 8, 4); }
      // three small crosses hang from it in front, toward her right; the big ringed cross hangs toward her left
      const cross = (a, s) => { const B = bandAt(a, chainH(a) - 0.10, 0.0075), top = B.P.clone(), bot = top.clone().addScaledVector(B.U, -0.026 * s), mid = top.clone().addScaledVector(B.U, -0.008 * s);
        hoop('gold', top.clone().addScaledVector(B.U, 0.0028), B.R, B.U, 0.0020, 0.0024, 0.0006, 8, 4); rod('gold', top, bot, 0.0012 * s); rod('gold', mid.clone().addScaledVector(B.R, -0.0068 * s), mid.clone().addScaledVector(B.R, 0.0068 * s), 0.0012 * s); };
      cross(-0.70, 0.95); cross(-0.33, 1.05); cross(0.08, 0.95);
      const B = bandAt(0.70, 0.60, 0.0095), C = B.P, tilt = B.R.clone().multiplyScalar(0.10).add(B.U).normalize();
      hoop('gold', C, B.R, B.U, 0.0195, 0.0195, 0.0031, Q(40, 20), 8);
      rod('gold', C.clone().addScaledVector(tilt, 0.050), C.clone().addScaledVector(tilt, -0.036).addScaledVector(B.O, 0.016), 0.0028, 8);       // its foot rests on the brim
      rod('gold', C.clone().addScaledVector(tilt, 0.008).addScaledVector(B.R, -0.0130), C.clone().addScaledVector(tilt, 0.008).addScaledVector(B.R, 0.0130), 0.0025, 8);
      hoop('gold', C.clone().addScaledVector(tilt, 0.0555), B.R, tilt, 0.0050, 0.0055, 0.0017, 14, 6);
    }
    // the horns: cream, ridged, standing out of the band at each side and curving up
    for (const sg of [-1, 1]) {
      const B = bandAt(sg * 1.50, 0.45, -0.002), O = B.O, U = V3(0, 1, 0), Fw = V3(0, 0, 1);
      const ctl = [B.P.clone().addScaledVector(O, -0.004), B.P.clone().addScaledVector(O, 0.018).addScaledVector(U, 0.002), B.P.clone().addScaledVector(O, 0.037).addScaledVector(U, 0.018).addScaledVector(Fw, 0.006),
        B.P.clone().addScaledVector(O, 0.046).addScaledVector(U, 0.044).addScaledVector(Fw, 0.007), B.P.clone().addScaledVector(O, 0.041).addScaledVector(U, 0.070).addScaledVector(Fw, 0.002)];
      const NH = Q(34, 16), pts = curvePts(ctl, NH + 1), rr = [], vs = [];
      for (let i = 0; i <= NH; i++) { const t = i / NH, r = 0.0175 * Math.pow(1 - t, 0.72) * (1 + 0.045 * Math.sin(t * 46)) + 0.0006; rr.push(r); vs.push(t * 1.6); }
      addPart('horn', loft(tubeRings(pts, rr, Q(20, 10), U), { capB: true, v: vs }), wHat, { out: pts[Math.floor(NH / 3)] });
    }
  })();
