  // ---------- head: the Jester's face model, worn at his size ----------
  // The same head every witch wears (Chris, November 12: "just use the jester witch 3d face model"; method: the project doc
  // claude/HOW-TO-3d-witch-faces.md), with his own face painted on it. JH below is the Jester's head as in the Ranger's R40_head.js,
  // word for word, in its own frame (eyes at 1.5246 m). It is scaled by HS and moved onto his body: his eye line R_EYE up and the
  // tip of his nose R_TIP forward, as B1 and B2 have them. HS is 1.06, a man's head: 14.8 cm wide. bake_face.py holds the numbers
  // (BAKED.head) and the landmarks of his painted face (BAKED.layout), so paint and shape are placed from one set.
  const JH = (function () {
    const HC = V3(0, 1.555, 0.002), HR = { x: 0.070, yT: 0.062, yB: 0.140, zF: 0.0985, zB: 0.083 };      // his one change to her head: the crown is 3 cm lower (yT 0.092 on the Jester), so his skull ends under his hair as B1 paints it
    const LAY = (BAKED && BAKED.layout) || {};          // where the features sit in the painted face: the sculpted eye and the painted eye are placed from one number
    const FC = { eyeY: LAY.eyeY || 1.5246, eyeX: LAY.eyeX || 0.0304, browY: LAY.browY || 1.5368, noseY: LAY.noseY || 1.4877, mouthY: LAY.mouthY || 1.4586 };
    // TUCK is the one thing added to her head. The Jester's cap and ruff hide what lies behind her jaw; the Ranger's hair is up, so
    // below the ears the back of each ring is drawn in to the neck: [from height, to height, neck half-width, neck middle, neck half-depth] in the head's frame
    const TUCK = [1.4927, 1.4523, 0.0468, -0.0115, 0.0535];
    const FACE_MID = [[1.4174, 0.0825], [1.4200, 0.0861], [1.4240, 0.0887], [1.4300, 0.0884], [1.4380, 0.0891], [1.4454, 0.0908], [1.4520, 0.0921], [1.4586, 0.0941], [1.4630, 0.0952], [1.4680, 0.0954],
    [1.4747, 0.0956], [1.4800, 0.0956], [1.4900, 0.0947], [1.5000, 0.0943], [1.5100, 0.0948], [1.5220, 0.0946], [1.5300, 0.0964], [1.5387, 0.1000], [1.5500, 0.0989], [1.5550, 0.0985]];
  const NOSE = [[1.4680, 0], [1.4700, 0.0019], [1.4720, 0.0031], [1.4747, 0.0035], [1.4760, 0.0040], [1.4774, 0.0052], [1.4787, 0.0104], [1.4800, 0.0135], [1.4840, 0.0172], [1.4880, 0.0189], [1.4920, 0.0171], [1.4980, 0.0125], [1.5040, 0.0092], [1.5100, 0.0059], [1.5160, 0.0023], [1.5220, 0.0004], [1.5260, 0]];
  const NOSE_W = [[1.4680, 0.0050], [1.4760, 0.0050], [1.4800, 0.0064], [1.4880, 0.0094], [1.4960, 0.0078], [1.5080, 0.0060], [1.5260, 0.0056]];
  const FACE_V = [[1.4150, 0.30], [1.4300, 0.40], [1.4450, 0.44], [1.4586, 0.40], [1.4760, 0.22], [1.4975, 0.02], [1.5246, -0.12], [1.5400, -0.10], [1.5550, 0]];
  // how wide a ring of the lower head is, from 1 at the cheeks to 0 under the chin: the last tenth closes quickly, so the jaw has an edge and a flat underside
  const SIN9 = Math.sqrt(1 - 0.81), SN9 = Math.pow(SIN9, 0.42), snLow = (sp, t) => (t > 0.9 ? SN9 * Math.pow(sp / SIN9, 0.40) : Math.pow(sp, 0.42));      // his second change: a man's jaw. The lower face keeps its width further down (0.60 on the Jester)
  const T_CHIN = (HC.y - FACE_MID[0][0]) / HR.yB, SN_CHIN = snLow(Math.sqrt(1 - T_CHIN * T_CHIN), T_CHIN), RZ_CHIN = FACE_MID[0][1] - 0.050 * T_CHIN * T_CHIN * T_CHIN;
    function headPoint(a, ph, grow) {                 // a: angle from the front toward her left; ph: 0 at the crown, PI at the chin
    const yn = Math.cos(ph), s = Math.sin(a), c = Math.cos(a), g = grow || 0, t = Math.max(0, -yn), sn = yn < 0 ? snLow(Math.sin(ph), t) : Math.sin(ph);
    let y = (yn >= 0 ? HR.yT : HR.yB) * yn + g * yn; const Y = HC.y + (yn >= 0 ? HR.yT : HR.yB) * yn;
    const x = ((HR.x * sn) * (1 - 0.04 * sm(0.5, 1.0, t)) + g * Math.min(1, sn * 3)) * s;      // the outline from the front, narrowing to the jaw
    const zc = 0.050 * t * t * t;                   // the lower head sits forward, so the chin hangs under the mouth; the corners of the jaw stay back near the ears
    let z, xk = 0;
    if (c < 0) z = zc * (1 - 0.95 * sm(0, -0.9, c)) + (HR.zB + g) * sn * c;      // only the face comes forward: the back of the head runs straight down into the nape
    else {
      const rz = (yn >= 0 ? HR.zF * sn : t > T_CHIN ? RZ_CHIN * sn / SN_CHIN : spline(FACE_MID, Y) - zc) + g * Math.min(1, sn * 3), v = yn >= 0 ? 0 : spline(FACE_V, Y), s2 = s * s;
      z = zc + rz * (c - v * s2 * Math.pow(c, 1.5));
      if (!g && yn < 0.35) {
        const f = c, ax = Math.abs(x), G = (dx, dy, wx, wy) => Math.exp(-Math.pow(dx / wx, 2) - Math.pow(dy / wy, 2));
        let d = 0; const NT = FC.noseY;
        // nose: the bridge and the ball of the tip, the wings of the nostrils, the folds where they meet the cheek, the hollows under it
        if (Y > 1.468 && Y < 1.526) d += spline(NOSE, Y) * Math.exp(-Math.pow(x / spline(NOSE_W, Y), 2));
        d += 0.0062 * G(ax - 0.0116, Y - (NT - 0.0054), 0.0052, 0.0052) - 0.0014 * G(ax - 0.0186, Y - (NT - 0.0040), 0.0030, 0.0066) - 0.0030 * G(ax - 0.0062, Y - (NT - 0.0096), 0.0030, 0.0021);
        d -= 0.0064 * G(ax - FC.eyeX, Y - FC.eyeY, 0.017, 0.0105) + 0.0026 * G(ax - 0.014, Y - (FC.eyeY - 0.002), 0.007, 0.010);   // eye sockets, deepest beside the bridge
        d += 0.0030 * G(ax - 0.027, Y - (FC.browY + 0.002), 0.026, 0.008);                        // brow
        d += 0.0030 * G(ax - FC.eyeX, Y - FC.eyeY, 0.0105, 0.0066) - 0.0010 * G(ax - FC.eyeX, Y - (FC.eyeY + 0.0088), 0.014, 0.0024);   // the eyeball rounding out of its socket, and the crease of the lid above it
        d += 0.0040 * G(ax - 0.043, Y - 1.4975, 0.020, 0.016) - 0.0022 * G(ax - 0.047, Y - 1.4670, 0.016, 0.014);   // cheekbones, and the hollow under them
        d -= 0.0010 * G(x, Y - (FC.mouthY + 0.0135), 0.0034, 0.0055);                             // the groove under the nose
        d += 0.0056 * G(x, Y - (FC.mouthY + 0.0058), 0.020, 0.0054) + 0.0044 * G(x, Y - (FC.mouthY - 0.0074), 0.016, 0.0054);  // lips
        d -= 0.0016 * G(ax - 0.024, Y - FC.mouthY, 0.006, 0.008);                                 // corners of the mouth
        d += 0.0026 * G(x, Y - 1.4300, 0.017, 0.0095);                                            // the ball of the chin
        z += d * f;
      }
    }
    if (c < 0 && yn < 0) { const fb = sm(TUCK[0], TUCK[1], Y) * sm(-0.05, -0.60, c); if (fb > 0) { xk = lerp(x, (TUCK[2] + g) * s, fb) - x; z = lerp(z, TUCK[3] + (TUCK[4] + g) * c, fb); } }      // the Ranger's one addition: see TUCK
    if (t > 0.86) y += 0.30 * Math.max(0, 0.083 - z) * sm(0.86, 0.985, t);        // under the jaw the skin rises toward the throat
    return [HC.x + x + xk, HC.y + y, HC.z + z];
  }
    const halfW = (Y) => { if (Y >= HC.y) return HR.x * Math.sqrt(Math.max(0, 1 - Math.pow((Y - HC.y) / HR.yT, 2))); const t = Math.min(1, (HC.y - Y) / HR.yB); return HR.x * snLow(Math.sqrt(1 - t * t), t) * (1 - 0.04 * sm(0.5, 1.0, t)); };
    return { HC, HR, FC, headPoint, halfW };
  })();
  const HD = (BAKED && BAKED.head) || { HS: 1.06, R_EYE: 1.660, R_TIP: 0.096 };
  const HS = HD.HS, J_EYE = 1.5246, J_TIP = 0.1158, R_EYE = HD.R_EYE, R_TIP = HD.R_TIP;
  const jy = (Y) => R_EYE + (Y - J_EYE) * HS, jz = (Z) => R_TIP + (Z - J_TIP) * HS, toJy = (y) => J_EYE + (y - R_EYE) / HS, toJz = (z) => J_TIP + (z - R_TIP) / HS;      // between the head's own frame and his body
  const HC = V3(0, jy(JH.HC.y), jz(JH.HC.z)), HR = { x: JH.HR.x * HS, yT: JH.HR.yT * HS, yB: JH.HR.yB * HS, zF: JH.HR.zF * HS, zB: JH.HR.zB * HS };
  const FC = { eyeY: R_EYE, eyeX: JH.FC.eyeX * HS, browY: jy(JH.FC.browY), noseY: jy(JH.FC.noseY), mouthY: jy(JH.FC.mouthY) };
  const FACE = { x0: -0.1 * HS, x1: 0.1 * HS, y0: jy(1.385), y1: jy(1.585) };          // the face painting covers this window, seen from the front
  const GS = (dx, dy, wx, wy) => Math.exp(-Math.pow(dx / wx, 2) - Math.pow(dy / wy, 2));
  function headPoint(a, ph, grow) { const p = JH.headPoint(a, ph, (grow || 0) / HS); return [p[0] * HS, jy(p[1]), jz(p[2])]; }
  const headHalfW = (y) => JH.halfW(toJy(y)) * HS;        // half the width of his head at a height
  const wHead = wOne('head'), faceMix = [], faceUvS = [];
  // his ear, read off the profile in C3: its middle, half its width and height, and how far its top leans back
  const EAR = { z: R_TIP - 0.1366, y: R_EYE - 0.0263, a: 0.0150, b: 0.0285, tilt: 11 * DEG, texK: 1.0 };
  const earR = (z, y) => { const c = Math.cos(EAR.tilt), sn = Math.sin(EAR.tilt), dz = z - EAR.z, dy = y - EAR.y, lz = dz * c + dy * sn, ly = dy * c - dz * sn; return Math.sqrt(lz * lz / (EAR.a * EAR.a) + ly * ly / (EAR.b * EAR.b)); };
  const SIDE_WIN = (BAKED && BAKED.faceSideWin) || [jz(-0.075), jz(0.125), jy(1.385), jy(1.585)];      // the side painting covers this window: forward from, to; height from, to
  (function buildHead() {
    const NU = Q(256, 84), NV = Q(168, 60), rings = [];        // most of the rings, and most of the columns, are spent on the face
    for (let i = 0; i <= NV; i++) {
      const u = i / NV, ph = u < 0.28 ? lerp(0.02, 1.45, u / 0.28) : lerp(1.45, PI - 0.02, (u - 0.28) / 0.72), ring = [];
      for (let j = 0; j < NU; j++) { const v = 2 * (j / NU) - 1; ring.push(headPoint(PI * (0.35 * v + 0.65 * v * v * v), ph)); }     // v = 0 is the middle of the face
      rings.push(ring);
    }
    const part = loft(rings, { capA: true, capB: true });
    for (let i = 0; i < part.pos.length / 3; i++) {   // the front painting is laid on flat from the front
      part.uv[i * 2] = (part.pos[i * 3] - FACE.x0) / (FACE.x1 - FACE.x0); part.uv[i * 2 + 1] = (part.pos[i * 3 + 1] - FACE.y0) / (FACE.y1 - FACE.y0);
    }
    const info = addPart('face', part, wHead, { out: HC });
    // Which painting each point wears, by the Jester's rules: the front painting wherever it can see; the profile painting only where
    // the skin faces sideways and lies more than 34 to 50 mm from the middle line; plain skin under the jaw (facing down and below
    // the jaw line) and behind the ear line. The Ranger adds one thing: the painted ear is blanked under her real one.
    const FB = buckets.face, Wn = SIDE_WIN;
    for (let i = info.start; i < info.start + info.count; i++) {
      const nx = FB.nor[i * 3], ny = FB.nor[i * 3 + 1], px = FB.pos[i * 3], py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2], pyJ = toJy(py), pzJ = toJz(pz), pxJ = Math.abs(px) / HS;
      const under = sm(-0.22, -0.66, ny) * sm(1.444, 1.428, pyJ), plain = Math.max(under, sm(0.010, -0.006, pzJ - JH.HC.z), pxJ > 0.03 ? sm(1.12, 0.92, earR(pz, py)) : 0);
      const side = sm(0.70, 0.93, Math.abs(nx)) * sm(0.034, 0.050, pxJ) * sm(Wn[2] + 0.002, Wn[2] + 0.014, py) * sm(Wn[3] - 0.002, Wn[3] - 0.014, py) * (1 - plain);
      faceMix.push(side, plain, 1 - 0.17 * under, 1 - under); faceUvS.push((pz - Wn[0]) / (Wn[1] - Wn[0]), (py - Wn[2]) / (Wn[3] - Wn[2]));      // under his jaw the plain colour is his beard's, not skin
    }
  })();
  // His painted face. Its blink and talking mouths (C2) are not baked yet, so for now it is one picture.
  const faceT = bakedTex('face', 1024, 1024, (BAKED && BAKED.skinCheek) || '#c9815f');
  // ---------- ears: a dished shell standing off the side of the head, wearing the profile painting ----------
  (function buildEars() {
    const NT = Q(72, 30), N1 = Q(16, 8), N2 = Q(7, 4), c0 = Math.cos(EAR.tilt), s0 = Math.sin(EAR.tilt);
    const zy = (r, th) => {                         // th: 0 at the top, a quarter turn at the back, half a turn at the lobe
      const ct = Math.cos(th), st = Math.sin(th), lz = -EAR.a * st * (1 - 0.20 * sm(0.3, 1, -ct)) * r, ly = EAR.b * ct * r;
      return [EAR.z + lz * c0 - ly * s0, EAR.y + ly * c0 + lz * s0];
    };
    const zF = EAR.z + EAR.a, zB = EAR.z - EAR.a;
    const lat = (r, th) => {                        // the outer face: [distance out from the middle of the head, height, forward]
      const [z, y] = zy(r, th), ct = Math.cos(th), st = Math.sin(th), q = cl((zF - z) / (zF - zB), 0, 1);
      let x = headHalfW(y) - 0.0015 + 0.0035 + 0.0165 * Math.pow(q, 0.9) * (0.50 + 0.50 * sm(EAR.y - 0.025, EAR.y + 0.002, y));
      const rim = 1 - 0.75 * sm(0.15, 0.5, -st) * sm(-0.9, -0.2, ct) * sm(0.95, 0.2, ct);      // the rim fades along the front, where the ear joins the cheek
      x += 0.0022 * Math.exp(-Math.pow((r - 0.90) / 0.085, 2)) * rim;                              // helix
      x -= 0.0016 * Math.exp(-Math.pow((r - 0.72) / 0.07, 2)) * sm(-0.3, 0.3, st) * sm(-0.5, 0.1, ct);     // the groove inside it
      x += 0.0020 * Math.exp(-Math.pow((r - 0.50) / 0.10, 2)) * sm(-0.35, 0.25, st);               // antihelix
      x -= 0.0085 * GS(z - (EAR.z + 0.0040), y - (EAR.y - 0.0045), 0.0062, 0.0088);                // the bowl of the ear
      x += 0.0030 * GS(z - (EAR.z + 0.0118), y - (EAR.y - 0.0050), 0.0036, 0.0050);                // tragus
      return [x, y, z];
    };
    for (const [S, sg] of SIDES) {
      const rings = [], kind = [];
      for (let i = 0; i <= N1; i++) { const r = lerp(0.07, 1, Math.pow(i / N1, 0.85)), ring = []; for (let j = 0; j < NT; j++) { const p = lat(r, (j / NT) * TAU); ring.push([sg * p[0], p[1], p[2]]); } rings.push(ring); kind.push(0); }
      { const ring = []; for (let j = 0; j < NT; j++) { const p = lat(1.03, (j / NT) * TAU); ring.push([sg * (p[0] - 0.0020), p[1], p[2]]); } rings.push(ring); kind.push(1); }     // round the edge
      for (let i = 0; i <= N2; i++) {               // the back face, running in under the ear to the head
        const u = i / N2, r = lerp(1.0, 0.42, u), ring = [];
        for (let j = 0; j < NT; j++) { const p = lat(r, (j / NT) * TAU), xin = headHalfW(p[1]) - 0.006; ring.push([sg * Math.max(xin, lerp(p[0] - 0.0040, xin, u * u)), p[1], p[2]]); }
        rings.push(ring); kind.push(2);
      }
      const part = loft(rings, { capA: true }), cols = NT + 1, info = addPart('face', part, wHead, { out: V3(sg * 0.05, EAR.y, EAR.z) }), FB = buckets.face, Wn = SIDE_WIN;
      for (let i = info.start; i < info.start + info.count; i++) {
        const k = kind[Math.min(kind.length - 1, Math.floor((i - info.start) / cols))] || 0, py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2];
        if ((i - info.start) >= rings.length * cols || k === 0) faceMix.push(1, 0, 1, 1); else if (k === 1) faceMix.push(0.5, 0.5, 0.97, 1); else faceMix.push(0, 1, 0.92, 1);
        faceUvS.push((EAR.z + (pz - EAR.z) * EAR.texK - Wn[0]) / (Wn[1] - Wn[0]), (EAR.y + (py - EAR.y) * EAR.texK - Wn[2]) / (Wn[3] - Wn[2]));
      }
    }
  })();
  // neck: from inside the collar up inside the jaw, leaning forward as it rises. Its sides wear the profile in C3; its front and back
  // are his neck's own tone, darker under the jaw. Most of it is behind his beard and under his hair.
  (function buildNeck() {
    const NU = Q(56, 24), wNeck = (x, y) => { const u = sm(1.50, 1.585, y); return [BI.neck, 1 - u, BI.head, u]; }, nr = [];
    for (const [y, rx, zf, zb] of [[1.455, 0.0640, 0.0260, -0.0960], [1.480, 0.0600, 0.0330, -0.0900], [1.505, 0.0575, 0.0400, -0.0850], [1.530, 0.0560, 0.0450, -0.0800], [1.555, 0.0550, 0.0480, -0.0770], [1.580, 0.0545, 0.0470, -0.0750], [1.610, 0.0540, 0.0400, -0.0730]])
      nr.push(ringXZ(0, y, (zf + zb) / 2, rx, (zf - zb) / 2, (zf - zb) / 2, NU));
    const info = addPart('face', loft(nr), wNeck, { out: V3(0, 1.53, -0.025) }), FB = buckets.face, Wn = SIDE_WIN;
    for (let i = info.start; i < info.start + info.count; i++) {
      const nx = FB.nor[i * 3], py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2], sd = sm(0.50, 0.85, Math.abs(nx)) * sm(Wn[2] + 0.004, Wn[2] + 0.028, py);
      faceMix.push(sd, 1 - sd, (0.70 + 0.30 * sm(1.575, 1.47, py)) * (1 - 0.10 * sm(0.2, 0.9, Math.abs(nx))), 1);      // his beard and jaw shade the top of his neck faceUvS.push((pz - Wn[0]) / (Wn[1] - Wn[0]), (py - Wn[2]) / (Wn[3] - Wn[2]));
    }
  })();
