
  // ---------- the Fox's head, first pass (November 12, 2026): a neck her size, hair, the costume ears, her glasses ----------
  // Everything here is set out in the head's own frame, before the head bone is scaled, so it shrinks with the head.
  // Still to come: the skull reshaped to her profile (C3), her own ears, curls that swing, fur that stands up.
  const HAIR_SEED = { s: 9173 };
  const hrnd = () => (HAIR_SEED.s = (HAIR_SEED.s * 16807) % 2147483647) / 2147483647, hrr = (a, b) => a + (b - a) * hrnd();   // its own stream, so adding hair moves nothing else
  (function foxNeck() {                              // the head shrinks about its joint, which would leave the Jester's neck too thin for her: her own, read off A1
    const rings = tubeRings([V3(0, 1.335, -0.010), V3(0, 1.356, -0.009), V3(0, 1.378, -0.006), V3(0, 1.400, -0.002), V3(0, 1.420, 0.003)], [[0.056, 0.050], [0.0455, 0.0445], [0.0425, 0.0415], [0.0410, 0.0405], [0.0385, 0.0385]], Q(28, 14), V3(0, 0, 1));
    addPart('skin', loft(rings), (x, y) => { const v = sm(1.385, 1.43, y); return [BI.neck, 1 - 0.5 * v, BI.head, 0.5 * v]; }, { out: V3(0, 1.37, 0) });
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
    const B0 = V3(0, 1.668, -0.066), lean = V3(0, 0.45, -0.89).normalize(), N = Q(210, 120);
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
      const f = (k + hrr(0.15, 0.85)) / NH, a0 = lerp(-1, 1, f), wisp = k % 8 === 3, a = Math.sign(a0 || 1) * (wisp ? hrr(0.12, 0.62) : lerp(1.02, 2.05, Math.abs(a0))), aa = Math.abs(a), root = V3(...headPoint(a, hairLine(a) - hrr(0.02, 0.10), 0.006));
      const out = root.clone().sub(HC).setY(0).normalize(), L = wisp ? hrr(0.014, 0.026) : aa < 1.35 ? hrr(0.075, 0.120) : hrr(0.110, 0.175), stand = wisp ? hrr(0.006, 0.012) : hrr(0.040, 0.078);
      const swing = V3(-out.z, 0, out.x).multiplyScalar(wisp ? Math.sign(a || 1) * hrr(0.012, 0.024) : hrr(-0.012, 0.012));
      ringlet((t) => root.clone().addScaledVector(out, stand * sm(0, 0.4, t)).add(V3(swing.x * t, -L * t * (0.35 + 0.65 * t), swing.z * t)), wisp ? hrr(0.005, 0.007) : hrr(0.0110, 0.0150), wisp ? hrr(0.8, 1.3) : Math.max(1.5, L / 0.034), wisp ? hrr(0.0026, 0.0034) : hrr(0.0050, 0.0064), hrr(0, TAU));
    }
    const NF = Q(120, 70);
    for (let k = 0; k < NF; k++) {                   // the halo: shorter curls standing out from the hair itself, all round
      let a = hrr(-PI, PI); if (Math.abs(a) < 1.25) a = Math.sign(a || 1) * hrr(1.25, PI);     // none sprouting over her face
      const ph = lerp(0.45, Math.min(hairLine(a) - 0.05, 2.1), Math.pow(hrnd(), 0.7)), root = V3(...headPoint(a, ph, 0.006)), out = root.clone().sub(HC).normalize();
      const L = hrr(0.070, 0.135), droop = hrr(0.012, 0.040), tw = V3(hrr(-1, 1), 0, hrr(-1, 1)).multiplyScalar(0.012);
      ringlet((t) => root.clone().addScaledVector(out, L * t).add(V3(tw.x * t * t, -droop * t * t, tw.z * t * t)), hrr(0.0090, 0.0140), hrr(1.4, 2.4), hrr(0.0048, 0.0062), hrr(0, TAU));
    }
  })();

  (function foxEars() {                              // costume ears, clipped into her hair: a cupped leaf, russet behind and cream inside
    for (const sx of [-1, 1]) {
      const base = V3(sx * 0.056, 1.652, 0.010), up = V3(sx * 0.30, 0.954, -0.02).normalize(), fwd = V3(sx * 0.30, 0, 0.954).normalize(), right = V3().crossVectors(up, fwd).normalize();
      const H = 0.118, NV = Q(22, 12), NA = Q(26, 14), rings = [];
      for (let i = 0; i <= NV; i++) {
        const v = i / NV, w = 0.039 * Math.pow(1 - v, 0.78) * (0.55 + 0.45 * sm(0, 0.18, v)) + 0.0012, th = 0.0035 + 0.007 * (1 - v), c = base.clone().addScaledVector(up, H * v).addScaledVector(fwd, -0.012 * v * v), ring = [];
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
