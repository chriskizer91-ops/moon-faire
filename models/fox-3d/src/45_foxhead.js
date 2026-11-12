
  // ---------- the Fox's head, first pass (November 12, 2026): a neck her size, hair, the costume ears, her glasses ----------
  // Everything here is set out in the head's own frame, before the head bone is scaled, so it shrinks with the head.
  // Still to come: the skull reshaped to her profile (C3), her own ears, curls that swing, fur that stands up.
  const HAIR_SEED = { s: 9173 };
  const hrnd = () => (HAIR_SEED.s = (HAIR_SEED.s * 16807) % 2147483647) / 2147483647, hrr = (a, b) => a + (b - a) * hrnd();   // its own stream, so adding hair moves nothing else
  (function foxNeck() {                              // the head shrinks about its joint, which would leave the Jester's neck too thin for her: her own, read off A1
    const rings = tubeRings([V3(0, 1.335, -0.008), V3(0, 1.356, -0.005), V3(0, 1.378, 0.000), V3(0, 1.398, 0.005), V3(0, 1.420, 0.008), V3(0, 1.450, 0.004), V3(0, 1.480, -0.004)], [[0.055, 0.051], [0.0445, 0.0462], [0.0418, 0.0450], [0.0408, 0.0445], [0.0412, 0.0448], [0.0440, 0.0470], [0.0430, 0.0455]], Q(28, 14), V3(0, 0, 1));      // from C3: about 9 cm through and 9.5 cm across, leaning forward to meet the jaw 4.5 cm behind the chin
    addPart('neck', loft(rings), (x, y) => { const v = sm(1.385, 1.43, y); return [BI.neck, 1 - 0.5 * v, BI.head, 0.5 * v]; }, { out: V3(0, 1.37, 0) });
  })();

  (function foxChoker() {                            // the rose leather collar at the foot of her neck, and its brass bell (F1). It also covers the join of neck and chest.
    const y0 = 1.3755, h = 0.0092, NU = Q(40, 24), rr = (d) => { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push([(0.0462 + d) * Math.sin(a), 0, -0.0040 + (0.0482 + d) * Math.cos(a)]); } return ring; };
    const lift = (ring, y) => ring.map((p) => [p[0], y + 0.010 * (0.5 - 0.5 * Math.cos(Math.atan2(p[0], p[2] + 0.0040))), p[2]]);      // it sits lower at the front than at the back
    addPart('choker', loft([lift(rr(-0.002), y0 - h), lift(rr(0.0024), y0 - h * 0.8), lift(rr(0.0030), y0), lift(rr(0.0024), y0 + h * 0.8), lift(rr(-0.002), y0 + h)]), () => [BI.neck, 1], { out: V3(0, y0, 0) });
    const zb = -0.0040 + 0.0482 + 0.0105, yb = y0 - h - 0.0125;
    addPart('bellm', spherePart(V3(0, yb, zb), 0.0112, 0.0112, 0.0112, Q(18, 12), Q(12, 8)), () => [BI.neck, 1], { out: V3(0, yb, zb) });
    addPart('bellm', spherePart(V3(0, yb + 0.0125, zb - 0.004), 0.0030, 0.0042, 0.0030, 8, 6), () => [BI.neck, 1], { out: V3(0, yb + 0.0125, zb - 0.004) });
  })();

  (function foxHumanEars() {                         // her own ears (C3, profile): top level with her eyes, lobe level with the foot of her nose, 3.2 cm front to back, the back edge standing off her head
    const NR = Q(14, 9), NU = Q(40, 24);
    for (const sx of [-1, 1]) {
      const O = V3(sx * 0.0685, 1.4975, -0.0065), U = V3(0, 0.985, -0.174), S = V3(sx * 0.42, 0, -0.908).normalize(), N = V3().crossVectors(S, U).multiplyScalar(sx).normalize();
      const pt = (r, th, back) => {
        const sn = Math.sin(th), a = 0.0160 * (1 + 0.16 * sn), s2 = r * a * Math.cos(th) + 0.0105, t2 = r * 0.0290 * sn, lobe = sm(-0.95, -0.35, sn);
        const h = back ? -0.0028 * (1 - 0.55 * r * r)
          : 0.0030 * Math.exp(-Math.pow((r - 0.86) / 0.11, 2)) * (0.35 + 0.65 * lobe) - 0.0040 * Math.exp(-Math.pow(r / 0.45, 2)) + 0.0014 * Math.exp(-Math.pow((r - 0.52) / 0.10, 2)) * Math.max(0, Math.sin(th - 0.5));      // the rolled rim, the bowl, the ridge inside the rim
        const p = O.clone().addScaledVector(S, s2).addScaledVector(U, t2).addScaledVector(N, h); return [p.x, p.y, p.z];
      };
      const ring = (r, back) => { const o = []; for (let j = 0; j < NU; j++) o.push(pt(r, (sx > 0 ? 1 : -1) * (j / NU) * TAU, back)); return o; };
      const rings = [];
      for (let i = 0; i <= NR; i++) rings.push(ring(lerp(1, 0.06, i / NR), false));
      for (let i = 0; i <= NR; i++) rings.push(ring(lerp(0.06, 1, i / NR), true));
      rings.push(ring(1, false));
      addPart('skin', loft(rings), wHead, { out: O.clone().addScaledVector(S, 0.0105).addScaledVector(N, -0.0012) });
    }
  })();

  // where her hair starts: the hairline as an angle down from the crown, for each direction round the head (front 0, back PI)
  const hairLine = (a) => { const c = Math.cos(a); return 1.24 + (1 - c) * 0.51 + Math.max(0, -c) * 0.60 + 0.05 * Math.sin(a * 9) * Math.max(0, c); };      // a high, uneven hairline at the front
  (function foxScalp() {                             // the hair lying on her head, drawn back and up to the bun
    const NU = Q(72, 36), NR = Q(22, 11), rings = [];
    for (let i = 0; i <= NR; i++) {
      const ring = [];
      for (let j = 0; j < NU; j++) {
        const a = (j / NU) * TAU, ph = lerp(0.03, hairLine(a), i / NR), lock = 0.0016 * Math.sin(j * 1.9 + i * 0.6) + 0.0012 * Math.sin(j * 0.63 + 1.1);
        ring.push(headPoint(a, ph, 0.0075 + lock - 0.0035 * sm(0.82, 1, i / NR)));     // thinning to nothing at the hairline
      }
      rings.push(ring);
    }
    addPart('scalp', loft(rings, { capA: true, uS: 10, vS: 1.6 }), wHead, { out: HC });
  })();


  // the body of her hair: a soft dark mass standing off her head at the sides and back, which the curls sit on. None of it over her face.
  const massGrow = (a, ph) => {
    const side = sm(1.20, 1.55, Math.abs(a)), v = sm(lerp(0.78, 0.40, sm(2.2, 2.8, Math.abs(a))), lerp(1.15, 0.85, sm(2.2, 2.8, Math.abs(a))), ph) * (1 - sm(lerp(1.22, 2.0, sm(1.9, 2.6, Math.abs(a))), lerp(1.50, 2.4, sm(1.9, 2.6, Math.abs(a))), ph)) * lerp(0.62, 1, sm(1.9, 2.6, Math.abs(a)));      // C3: her hair is drawn up off her ears and neck, so at the sides the mass stops above the ear; at the back it runs to the nape
    const lump = 0.008 * Math.sin(a * 5 + ph * 3.1) * Math.sin(ph * 6.3 - a * 2) + 0.005 * Math.sin(a * 11 + ph * 7);
    const full = 0.030 + 0.028 * sm(0.8, 1.7, ph) * (1 - 0.4 * sm(2.0, 2.4, ph));
    return lerp(-0.012, full + lump, side * v);
  };
  (function foxHairMass() {
    const NU = Q(84, 44), NR = Q(40, 22), rings = [];
    for (let i = 0; i <= NR; i++) {
      const ring = [], ph = lerp(0.20, 2.50, i / NR);
      for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU - PI; ring.push(headPoint(a, ph, massGrow(a, ph))); }
      rings.push(ring);
    }
    addPart('scalp', loft(rings, { uS: 14, vS: 3 }), wHead, { out: HC });
  })();

  // one ringlet: a tube wound round a path. path(t) -> Vector3 for t 0..1; hr: the ringlet's radius; turns; tr: the lock's own thickness
  function ringlet(path, hr, turns, tr, ph0) {
    const NS = Math.max(10, Math.round(Q(12, 7) * Math.max(1.2, turns))), pts = [], rad = [];
    let T0 = null, N = null;
    for (let i = 0; i <= NS; i++) {
      const t = i / NS, p = path(t), q = path(Math.min(1, t + 0.02)), q0 = path(Math.max(0, t - 0.02)), Tn = q.clone().sub(q0).normalize();
      if (!N) { N = Math.abs(Tn.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0); N.addScaledVector(Tn, -N.dot(Tn)).normalize(); }
      else { N.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(T0, Tn)); N.addScaledVector(Tn, -N.dot(Tn)).normalize(); }
      T0 = Tn; const B = V3().crossVectors(Tn, N), ang = ph0 + t * turns * TAU, grow = 0.45 + 0.55 * sm(0, 0.35, t);      // a ringlet opens out from its root
      pts.push(p.clone().addScaledVector(N, Math.cos(ang) * hr * grow).addScaledVector(B, Math.sin(ang) * hr * grow));
      const r = tr * (0.75 + 0.25 * Math.sin(t * 9 + ph0)) * (1 - 0.55 * sm(0.8, 1, t)); rad.push([r, r * 0.52]);
    }
    const rings = tubeRings(pts, rad, 6);
    addPart('curl', loft(rings, { capB: true, u0: hrnd(), uS: 0.22 }), wHead, { out: centroidOf(rings) });
  }
  (function foxBun() {                               // the messy ponytail bun: ringlets spilling every way out of one knot high on the back of her head
    const B0 = V3(0, 1.672, -0.074), lean = V3(0, 0.45, -0.89).normalize(), N = Q(210, 120);
    addPart('scalp', spherePart(B0, 0.062, 0.058, 0.058, Q(28, 14), Q(18, 10)), wHead, { out: B0 });
    for (let k = 0; k < N; k++) {
      let d; do { const u = hrr(-1, 1), th = hrr(0, TAU), s = Math.sqrt(1 - u * u); d = V3(s * Math.cos(th), u, s * Math.sin(th)); } while (d.dot(lean) < -0.25);
      const L = hrr(0.072, 0.128), droop = hrr(0.018, 0.050), start = B0.clone().addScaledVector(d, 0.016), side = V3(hrr(-1, 1), 0, hrr(-1, 1)).multiplyScalar(0.012);
      ringlet((t) => start.clone().addScaledVector(d, L * t).add(V3(side.x * t * t, -droop * t * t, side.z * t * t)), hrr(0.0095, 0.0150), hrr(1.7, 2.8), hrr(0.0050, 0.0066), hrr(0, TAU));
    }
  })();
  (function foxLooseCurls() {                        // the curls left out all round her face, and the soft halo of shorter ones
    const NH = Q(30, 20);
    for (let k = 0; k < NH; k++) {                   // hanging ringlets: short over the forehead, long in front of her ears
      const f = (k + hrr(0.15, 0.85)) / NH, a0 = lerp(-1, 1, f), wisp = k % 8 === 3, a = Math.sign(a0 || 1) * (wisp ? hrr(0.12, 0.62) : lerp(1.30, 2.30, Math.abs(a0))), aa = Math.abs(a), root = V3(...headPoint(a, hairLine(a) - hrr(0.02, 0.10), 0.006));
      const out = root.clone().sub(HC).setY(0).normalize(), L = wisp ? hrr(0.014, 0.026) : aa < 1.35 ? hrr(0.085, 0.130) : hrr(0.130, 0.200), stand = wisp ? hrr(0.006, 0.012) : hrr(0.040, 0.078);
      const swing = V3(-out.z, 0, out.x).multiplyScalar(wisp ? Math.sign(a || 1) * hrr(0.012, 0.024) : hrr(-0.012, 0.012));
      ringlet((t) => root.clone().addScaledVector(out, stand * sm(0, 0.4, t)).add(V3(swing.x * t, -L * t * (0.35 + 0.65 * t), swing.z * t)), wisp ? hrr(0.005, 0.007) : hrr(0.0110, 0.0150), wisp ? hrr(0.8, 1.3) : Math.max(1.5, L / 0.034), wisp ? hrr(0.0026, 0.0034) : hrr(0.0050, 0.0064), hrr(0, TAU));
    }

    const NS2 = Q(84, 46);
    for (let k = 0; k < NS2; k++) {                  // wavy locks lying down the mass, from the top of it to its hem
      const s = k % 2 ? 1 : -1, a0 = s * hrr(1.27, PI), ph0 = hrr(0.80, 1.25), ph1 = Math.min(hrr(1.9, 2.45), lerp(1.42, 2.3, sm(1.9, 2.6, Math.abs(a0)))), da = hrr(-0.18, 0.18), wob = hrr(0.03, 0.07), f = hrr(2, 4), p0 = hrr(0, TAU);
      ringlet((t) => { const ph = lerp(ph0, ph1, t), a = a0 + da * t + wob * Math.sin(t * f * PI + p0); return V3(...headPoint(a, ph, massGrow(a, ph) + 0.003 + 0.004 * t)); }, hrr(0.004, 0.008), hrr(2.5, 5), hrr(0.0060, 0.0085), hrr(0, TAU));
    }
    for (const s of [-1, 1]) for (let k = 0; k < 11; k++) {      // the hair swept off her parting to each side, over the corners of her forehead
      const u = (k + hrnd()) / 11, a1 = s * lerp(1.22, 1.50, hrnd()), ph0 = lerp(0.55, 1.18, u), ph1 = lerp(1.55, 2.15, hrnd()), a0 = s * hrr(0.03, 0.10), p0 = hrr(0, TAU);
      ringlet((t) => { const a = lerp(a0, a1, Math.pow(t, 0.75)), ph = lerp(ph0, ph1, Math.pow(t, 1.6)); return V3(...headPoint(a, ph, 0.0135 + Math.max(0, massGrow(a, ph)) * sm(0.5, 1, t) + 0.004 * Math.sin(t * 9 + p0))); }, hrr(0.003, 0.006), hrr(2, 3.5), hrr(0.0065, 0.009), p0);
    }
    const NF = Q(230, 110);
    for (let k = 0; k < NF; k++) {                   // the halo: shorter curls standing out from the hair itself, all round
      let a = hrr(-PI, PI); if (Math.abs(a) < 1.38) a = Math.sign(a || 1) * hrr(1.38, PI);     // none sprouting over her face
      const ph = lerp(Math.abs(a) < 2.3 ? 0.98 : 0.5, lerp(1.45, 2.2, sm(1.9, 2.6, Math.abs(a))), Math.pow(hrnd(), 0.8)), root = V3(...headPoint(a, ph, Math.max(0.006, massGrow(a, ph) - 0.006))), out = root.clone().sub(HC).normalize();
      const L = hrr(0.045, 0.095), droop = hrr(0.012, 0.040), tw = V3(hrr(-1, 1), 0, hrr(-1, 1)).multiplyScalar(0.012);
      ringlet((t) => root.clone().addScaledVector(out, L * t).add(V3(tw.x * t * t, -droop * t * t, tw.z * t * t)), hrr(0.0100, 0.0150), hrr(1.2, 2.2), hrr(0.0062, 0.0085), hrr(0, TAU));
    }
  })();

  (function foxEars() {                              // costume ears, clipped into her hair: a cupped leaf, russet behind and cream inside
    for (const sx of [-1, 1]) {
      const base = V3(sx * 0.079, 1.607, 0.030), up = V3(sx * 0.305, 0.951, -0.05).normalize(), fwd = V3(sx * 0.30, 0, 0.954).normalize(), right = V3().crossVectors(up, fwd).normalize();
      const H = 0.088, NV = Q(22, 12), NA = Q(26, 14), rings = [];
      for (let i = 0; i <= NV; i++) {
        const v = i / NV, w = 0.037 * Math.pow(1 - v, 0.86) * (0.55 + 0.45 * sm(0, 0.18, v)) + 0.0012, th = 0.0035 + 0.007 * (1 - v), c = base.clone().addScaledVector(up, H * v).addScaledVector(fwd, -0.012 * v * v), ring = [];
        for (let j = 0; j < NA; j++) {
          const ang = (j / NA) * TAU, sn = Math.sin(ang), cs = Math.cos(ang), cup = 0.010 * (1 - v) * (sn * sn);       // the edges come forward: the ear is a shallow cup
          ring.push(c.clone().addScaledVector(right, w * sn).addScaledVector(fwd, th * cs * (cs > 0 ? 0.35 : 1) + cup).toArray());
        }
        rings.push(ring);
      }
      addPart('ear', loft(rings, { capB: true }), wHead, { out: centroidOf(rings) });
    }
  })();

  (function foxGlasses() {                           // round wire glasses: two rims, a bridge, pads and arms; the lenses are their own thin discs
    const ey = FC.eyeY + 0.0005, ex = FC.eyeX + 0.0008, R = 0.0262, zf = 0.1065, wire = 0.00085, NS = Q(48, 28);
    for (const sx of [-1, 1]) {
      const rim = []; for (let i = 0; i <= NS; i++) { const a = (i / NS) * TAU; rim.push(V3(sx * ex + R * Math.cos(a), ey + R * Math.sin(a), zf - 0.004 * Math.pow(Math.abs(sx * ex + R * Math.cos(a)) / 0.06, 2))); }
      addPart('frame', loft(tubeRings(rim, rim.map(() => wire), 6)), wHead, { out: V3(sx * ex, ey, zf) });
      const hinge = V3(sx * (ex + R + 0.001), ey + 0.004, zf - 0.006), back = V3(sx * 0.0745, ey + 0.001, 0.012), tip = V3(sx * 0.0735, ey - 0.014, -0.014);
      addPart('frame', loft(tubeRings(curvePts([V3(sx * (ex + R), ey + 0.003, zf - 0.004), hinge, V3(sx * 0.0725, ey + 0.004, 0.060), back, tip], 16), new Array(16).fill(wire), 6)), wHead, { out: V3(sx * 0.07, ey, 0.05) });
      addPart('frame', spherePart(V3(sx * 0.0118, ey - 0.011, zf - 0.0115), 0.0022, 0.0034, 0.0012, 8, 6), wHead, { out: V3(sx * 0.0118, ey - 0.011, zf - 0.0115) });      // nose pad
      const disc = [[], []]; for (let i = 0; i < NS; i++) { const a = (i / NS) * TAU; disc[0].push([sx * ex, ey, zf - 0.0012]); disc[1].push([sx * ex + (R - wire) * Math.cos(a), ey + (R - wire) * Math.sin(a), zf - 0.0012 - 0.004 * Math.pow(Math.abs(sx * ex + R * Math.cos(a)) / 0.06, 2)]); }
      addPart('lens', loft(disc), wHead, { out: V3(sx * ex, ey, 0) });
    }
    const br = curvePts([V3(-(ex - R), ey + 0.004, zf - 0.001), V3(-0.004, ey + 0.0105, zf + 0.001), V3(0.004, ey + 0.0105, zf + 0.001), V3(ex - R, ey + 0.004, zf - 0.001)], 12);
    addPart('frame', loft(tubeRings(br, br.map(() => wire), 6)), wHead, { out: V3(0, ey - 0.02, zf) });
  })();
