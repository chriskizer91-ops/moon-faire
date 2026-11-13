  // ---------- stage one: his whole figure as measured forms, wearing four paintings laid on from four sides ----------
  // Every shape here comes from the tables in N05_tables.js (tools/tables.py reads them off paintings B1 and B2). Nothing has its own
  // picture yet. The material 'proj' (N99_static.js) lays painting B1 on from the front and from behind and painting B2 on from each
  // side, by where each point RESTS, and mixes them by which way the surface faces. So the uv of these parts is not a place on a
  // picture: uv.x says how far the two side paintings may be used at that point (0 to 1).
  // uv.y (0 to 1) keeps the side paintings to surfaces that face more squarely sideways.
  const projUV = (part, side, sharp) => {
    const n = part.pos.length / 3; part.uv = new Array(n * 2);
    for (let i = 0; i < n; i++) { part.uv[i * 2] = typeof side === 'function' ? side(part.pos[i * 3], part.pos[i * 3 + 1], part.pos[i * 3 + 2]) : side; part.uv[i * 2 + 1] = sharp ? sharp(part.pos[i * 3], part.pos[i * 3 + 1], part.pos[i * 3 + 2]) : 0; }
    return part;
  };
  const sgnPow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);

  // ---------- the trunk: seat of the trousers, corset, shirt and shoulders, in one skin up to the foot of his neck ----------
  const T_Y0 = N_TRUNK[0][0], T_Y1 = N_TRUNK[N_TRUNK.length - 1][0];
  const trunkPw = (y) => lerp(2.45, 2.0, sm(1.44, 1.58, y)) - 0.25 * sm(1.02, 0.80, y);      // the corset and chest are squarer in plan; the seat and the head rounder
  function trunkPt(u, y) {                            // u 0..1 round him from the middle of his back; y height
    const [rx, zf, zb] = spline(N_TRUNK, cl(y, T_Y0, T_Y1)), cz = (zf + zb) / 2, e = 2 / trunkPw(y);
    const a = PI + u * TAU, s = Math.sin(a), c = Math.cos(a);
    return [rx * sgnPow(s, e), y, cz + (c >= 0 ? zf - cz : cz - zb) * sgnPow(c, e)];
  }
  const SPINE_W = [['hips', 0.99], ['spine1', 1.11], ['spine2', 1.23], ['spine3', 1.35]];
  function wSpine(y) {
    if (y <= SPINE_W[0][1]) return [BI.hips, 1];
    for (let i = 1; i < SPINE_W.length; i++) if (y < SPINE_W[i][1]) {
      const u = sm(SPINE_W[i - 1][1], SPINE_W[i][1], y);
      return [BI[SPINE_W[i - 1][0]], 1 - u, BI[SPINE_W[i][0]], u];
    }
    return [BI.spine3, 1];
  }
  function wTrunk(x, y, z) {
    const ax = Math.abs(x), S = x < 0 ? 'R' : 'L';
    if (y < 0.93) { const k = 0.85 * sm(0.93, 0.70, y) * sm(0.012, 0.085, ax); return [BI.hips, 1 - k, BI['thigh' + S], k]; }      // the seat follows each thigh, more so lower down and further from the middle seam
    const w = wSpine(y);
    const k = 0.7 * sm(0.115, 0.19, ax) * sm(1.30, 1.40, y);                       // the shoulder girdle follows the collarbone
    if (k > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - k; w.push(BI['clav' + S], k); }
    if (y > 1.43) { const n = sm(1.43, 1.52, y) * (1 - 0.6 * sm(0.09, 0.17, ax)); if (n > 0.001) { for (let i = 1; i < w.length; i += 2) w[i] *= 1 - n; w.push(BI.neck, n); } }
    return w;
  }
  // The side paintings were made with his arms held out, so at shoulder height they show a hand end on where his side should be:
  // between 1.27 and 1.47 m the trunk takes its paint from the front and back paintings only.
  const trunkSide = (x, y) => 1 - sm(1.25, 1.30, y) * (1 - sm(1.44, 1.49, y));
  (function buildTrunk() {
    const rings = [], NR = Q(120, 60), NU = Q(104, 52);
    for (let i = 0; i <= NR; i++) {
      const y = lerp(T_Y0, T_Y1, i / NR), ring = [];
      for (let j = 0; j < NU; j++) ring.push(trunkPt(j / NU, y));
      rings.push(ring);
    }
    addPart('proj', projUV(loft(rings, { capA: true, capB: true }), trunkSide), wTrunk, { out: V3(0, 1.2, 0) });
  })();

  // ---------- the legs of the trousers: baggy, gathered at the hem and tucked into the boots ----------
  const L_Y0 = N_LEG[0][0], L_Y1 = N_LEG[N_LEG.length - 1][0];
  function legPt(s, y, a, k) {                        // a round the leg from its back; k scales the ring about its own middle
    const [hw, c, zf, zb] = spline(N_LEG, cl(y, L_Y0, L_Y1)), cz = (zf + zb) / 2, e = 2 / 2.15, sn = Math.sin(a), co = Math.cos(a); k = k == null ? 1 : k;
    const inner = s * sn < 0, ex = inner ? 2 / 4.2 : e, ez = inner ? 2 / 2.6 : e;                    // the inner side is flatter: the two legs lie against each other, as the cloth does
    return [s * c + k * hw * sgnPow(sn, ex), y, cz + k * (co >= 0 ? zf - cz : cz - zb) * sgnPow(co, ez)];
  }
  function wLeg(S, y) {
    if (y > N_KNEE_Y + 0.06) { const u = 0.5 * sm(0.74, 0.92, y); return [BI['thigh' + S], 1 - u, BI.hips, u]; }
    const u = sm(N_KNEE_Y - 0.06, N_KNEE_Y + 0.06, y); return [BI['shin' + S], 1 - u, BI['thigh' + S], u];
  }
  for (const [S, s] of SIDES) {
    const rings = [], NR = Q(56, 28), NU = Q(64, 32), ring = (y, k) => { const r = []; for (let j = 0; j < NU; j++) r.push(legPt(s, y, PI + (j / NU) * TAU, k)); return r; };
    for (let i = 0; i <= NR; i++) rings.push(ring(lerp(L_Y1, L_Y0, i / NR), 1));
    rings.push(ring(L_Y0 - 0.006, 0.93), ring(L_Y0 - 0.014, 0.80), ring(L_Y0 - 0.018, 0.62));      // the gathered hem turns in under the cloth and goes down into the boot
    addPart('proj', projUV(loft(rings, { capB: true }), 1), (x, y) => wLeg(S, y), { out: V3(s * 0.13, 0.56, -0.01) });
  }

  // ---------- the boots, as one form each: sole, foot, shaft and cuff are all in the outline; the straps, studs and seams are paint for now ----------
  const B_Y1 = N_BOOT[N_BOOT.length - 1][0];
  function bootPt(s, y, a) {
    const [hw, c, zf, zb] = spline(N_BOOT, cl(y, 0, B_Y1)), cz = (zf + zb) / 2, e = 2 / 2.4, sn = Math.sin(a), co = Math.cos(a);
    return [s * c + hw * sgnPow(sn, e), y, cz + (co >= 0 ? zf - cz : cz - zb) * sgnPow(co, e)];
  }
  function wBoot(S, x, y, z) {
    if (y > 0.21) return [BI['shin' + S], 1];
    const a = sm(0.10, 0.21, y), t = sm(0.04, 0.10, z) * sm(0.11, 0.05, y);          // the ankle; the front of the foot bends with the toes
    return [BI['shin' + S], a, BI['foot' + S], (1 - a) * (1 - t), BI['toe' + S], (1 - a) * t];
  }
  for (const [S, s] of SIDES) {
    const rings = [], NR = Q(72, 36), NU = Q(64, 32);
    for (let i = 0; i <= NR; i++) { const t = i / NR, y = t < 0.3 ? lerp(0, 0.14, t / 0.3) : lerp(0.14, B_Y1, (t - 0.3) / 0.7), ring = []; for (let j = 0; j < NU; j++) ring.push(bootPt(s, y, PI + (j / NU) * TAU)); rings.push(ring); }      // closer rows over the sole and foot
    addPart('proj', projUV(loft(rings, { capA: true, capB: true }), 1), (x, y, z) => wBoot(S, x, y, z), { out: V3(s * 0.16, 0.2, -0.03) });
  }

  // ---------- the arms: the full sleeve, its lace ruffle, the bare forearm and the leather cuff, as one form down to the wrist ----------
  // N_ARM gives a radius and how far the middle sits from the straight line shoulder to wrist (the sleeve hangs below the arm).
  const ARM_END = L_UARM + L_FARM + 0.014;
  // Where sleeve meets arm (Chris, November 13: "the transition from his arms to his sleeves could be better"). The sleeve is gathered
  // into a band just below the elbow (A_BAND along the arm) and ends there. From the band a lace ruffle in two tiers hangs over the
  // forearm to a free edge (A_EDGE), and the bare forearm runs on inside it and out to the leather cuff (A_CUFF). Before this the
  // ruffle was only a swelling of the arm itself, so the forearm seemed to grow out of a funnel.
  const A_BAND = 0.318, A_EDGE = 0.405, A_CUFF = 0.462;
  const armAt = (sl) => {                           // [radius, how far the middle sits off the shoulder-to-wrist line]
    const [r0, o0] = spline(N_ARM, cl(sl, 0, 0.74));
    if (sl <= A_BAND - 0.012) return [r0, o0];
    const [rb, ob] = spline(N_ARM, A_BAND - 0.012), fore = lerp(0.0405, 0.0345, sm(0.34, 0.45, sl)), k = sm(A_BAND - 0.012, A_BAND + 0.022, sl), c = sm(A_CUFF, A_CUFF + 0.02, sl);
    return [lerp(lerp(rb, fore, k), r0, c), lerp(lerp(ob, 0, k), o0, c)];
  };
  function wArm(S, sl) {
    if (sl < 0.06) { const u = sm(-0.04, 0.06, sl); return [BI['clav' + S], (1 - u) * 0.6, BI.spine3, (1 - u) * 0.4, BI['uarm' + S], u]; }
    if (sl < L_UARM + 0.05) { const u = sm(L_UARM - 0.05, L_UARM + 0.05, sl); return [BI['uarm' + S], 1 - u, BI['farm' + S], u]; }
    const u = sm(L_UARM + L_FARM - 0.02, L_UARM + L_FARM + 0.012, sl); return [BI['farm' + S], 1 - u, BI['hand' + S], u];
  }
  for (const [S, s] of SIDES) {
    const d = armDir[S], sh = restPts['sh' + S], nrm = V3(s * Math.cos(A_POSE), Math.sin(A_POSE), 0), NU = Q(48, 24), pts = [], rad = [], ss = [];
    const N1 = Q(8, 5), N2 = Q(84, 40);
    for (let i = 0; i <= N1; i++) ss.push(-0.045 + 0.045 * i / N1);                    // the first rings round the shoulder off
    for (let i = 1; i <= N2; i++) ss.push(ARM_END * i / N2);
    for (const sl of ss) {
      const [r, off] = armAt(sl), dome = sl < 0 ? Math.sqrt(Math.max(0.02, 1 - Math.pow(sl / -0.047, 2))) : 1;
      pts.push(sh.clone().addScaledVector(d, sl).addScaledVector(nrm, off * sm(-0.02, 0.06, sl))); rad.push(r * dome);
    }
    const rings = tubeRings(pts, rad, NU, V3(0, 0, 1)), part = projUV(loft(rings, { capA: true, capB: true }), 1), cols = NU + 1;
    addPart('projArm', part, (x, y, z, i) => wArm(S, i < ss.length * cols ? ss[Math.floor(i / cols)] : i === ss.length * cols ? ss[0] : ss[ss.length - 1]), { out: centroidOf(rings) });
    // the ruffle: fluted cloth flaring from the band, its hem rising and dipping with the folds. Sizes from B1: about 9 cm out from the
    // arm at its widest, hanging 2 cm below the arm's own line. Both faces show, so it is drawn from both sides.
    const off0 = spline(N_ARM, A_BAND - 0.012)[1];
    const tier = (s0, s1, r0, r1, off1, flutes, amp, ph) => {
      const NR = Q(14, 8), NA = Q(132, 66), tr = [];
      for (let i = 0; i <= NR; i++) {
        const t = i / NR, ring = [];
        for (let j = 0; j < NA; j++) {
          const a = (j / NA) * TAU, r = lerp(r0, r1, Math.pow(t, 0.8)) + amp * t * Math.cos(a * flutes + ph) + 0.35 * amp * t * Math.cos(a * (flutes * 2 + 1) + 2 * ph);
          const c = sh.clone().addScaledVector(d, lerp(s0, s1, t) + 0.004 * t * Math.cos(a * flutes + ph + 1.3)).addScaledVector(nrm, lerp(off0, off1, t));
          ring.push([c.x + nrm.x * Math.cos(a) * r, c.y + nrm.y * Math.cos(a) * r, c.z + Math.sin(a) * r]);
        }
        tr.push(ring);
      }
      addPart('projRuffle', projUV(loft(tr), 0.3), () => [BI['farm' + S], 1], { out: sh.clone().addScaledVector(d, (s0 + s1) / 2) });
    };
    tier(A_BAND - 0.004, 0.376, 0.071, 0.089, -0.014, 11, 0.0055, s);
    tier(A_BAND + 0.010, A_EDGE, 0.062, 0.095, -0.019, 13, 0.0075, 1.7 * s);
  }

  // his gloves on the Jester's hand model: black leather over the palm, the back of the hand, and the root of each finger and of the
  // thumb. x, y, z are a point of the canonical hand (fingers along -Y, thumb toward +Z, before the hand is scaled). 1: leather, 0: skin.
  const gloveAt = (() => {
    const td = V3(THUMB.dir[0], THUMB.dir[1], THUMB.dir[2]).normalize(), tb = THUMB.base, q = V3();
    return (x, y, z) => {
      q.set(x - tb[0], y - tb[1], z - tb[2]); const ts = q.dot(td), perp = Math.sqrt(Math.max(0, q.lengthSq() - ts * ts));
      if (z > 0.036 && ts > 0.034 && perp < 0.017) return ts < 0.060 ? 1 : 0;        // on the thumb: covered to the middle of its first free bone
      return y > -0.100 ? 1 : 0;                                                      // the fingers: covered to a centimetre past the webs
    };
  })();
