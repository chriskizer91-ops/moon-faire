
  // ---------- head: rings by height, shaped from her paintings; the face itself is painted on ----------
  // Heights: eye line 1.512 m, tip of the nose 1.4805, mouth 1.4494, under the chin 1.405. Forward distances are from the middle
  // line of her body, as the torso's are: the ear line is at -0.0215, the tip of the nose at 0.107 (B2 and the profile in C3).
  const HC = V3(0, 1.542, -0.012), HR = { x: 0.073, yT: 0.086, yB: 0.137, zF: 0.1036, zB: 0.082 };
  const FC = { eyeY: 1.512, eyeX: 0.0305, browY: 1.5252, noseY: 1.4805, mouthY: 1.4494, earZ: -0.0215 };
  const FACE = { x0: -0.1, x1: 0.1, y0: 1.380, y1: 1.580 };          // the face painting covers this window, seen from the front
  // MID is her profile: [height, metres forward] down the middle of her face, traced from C3 at 1837 pixels a metre (tools/prof_r.py)
  const MID = [[1.4074, 0.0740], [1.4086, 0.0827], [1.4102, 0.0856], [1.4118, 0.0874], [1.4135, 0.0888], [1.4151, 0.0897], [1.4167, 0.0906], [1.4184, 0.0911], [1.4200, 0.0914], [1.4216, 0.0918], [1.4233, 0.0918], [1.4249, 0.0914], [1.4265, 0.0912], [1.4282, 0.0909], [1.4298, 0.0905], [1.4314, 0.0899], [1.4331, 0.0893], [1.4347, 0.0894], [1.4363, 0.0900], [1.4380, 0.0910], [1.4396, 0.0920], [1.4412, 0.0932], [1.4429, 0.0938], [1.4445, 0.0939], [1.4461, 0.0937], [1.4478, 0.0932], [1.4494, 0.0928], [1.4510, 0.0938], [1.4527, 0.0950], [1.4543, 0.0958], [1.4559, 0.0961], [1.4576, 0.0957], [1.4592, 0.0950], [1.4608, 0.0946], [1.4625, 0.0945], [1.4641, 0.0945], [1.4657, 0.0945], [1.4674, 0.0951], [1.4690, 0.0976], [1.4706, 0.1013], [1.4723, 0.1041], [1.4739, 0.1059], [1.4755, 0.1071], [1.4772, 0.1078], [1.4788, 0.1081], [1.4804, 0.1081], [1.4821, 0.1079], [1.4837, 0.1071], [1.4853, 0.1062], [1.4870, 0.1049], [1.4886, 0.1036], [1.4902, 0.1021], [1.4919, 0.1008], [1.4935, 0.0997], [1.4951, 0.0987], [1.4968, 0.0979], [1.4984, 0.0969], [1.5000, 0.0960], [1.5017, 0.0950], [1.5033, 0.0938], [1.5049, 0.0926], [1.5066, 0.0915], [1.5082, 0.0906], [1.5098, 0.0899], [1.5115, 0.0900], [1.5131, 0.0900], [1.5147, 0.0896], [1.5164, 0.0893], [1.5180, 0.0891], [1.5196, 0.0894], [1.5213, 0.0899], [1.5229, 0.0903], [1.5245, 0.0913], [1.5262, 0.0926], [1.5278, 0.0933], [1.5294, 0.0933], [1.5311, 0.0927], [1.5327, 0.0923], [1.5343, 0.0923], [1.5360, 0.0923], [1.5376, 0.0923], [1.5392, 0.0921], [1.5409, 0.0918], [1.5425, 0.0915], [1.5441, 0.0912], [1.5458, 0.0909], [1.5474, 0.0905], [1.5490, 0.0901], [1.5506, 0.0901], [1.5523, 0.0898], [1.5539, 0.0896], [1.5555, 0.0893], [1.5572, 0.0888], [1.5588, 0.0883], [1.5604, 0.0877], [1.5621, 0.0872], [1.5637, 0.0869]];
  // half the width of her face at each height, read off the front painting C1 (4541 pixels a metre); above the eyes it is the skull under her hair
  const FACE_W = [[1.4050, 0], [1.4066, 0.0090], [1.4103, 0.0214], [1.4160, 0.0319], [1.4216, 0.0393], [1.4273, 0.0444], [1.4329, 0.0485], [1.4386, 0.0505], [1.4498, 0.0542], [1.4602, 0.0557], [1.4740, 0.0590], [1.4960, 0.0610], [1.5120, 0.0622], [1.5270, 0.0680], [1.5420, 0.0730]];
  const NOSE_W = [[1.4657, 0.0050], [1.4740, 0.0056], [1.4790, 0.0084], [1.4860, 0.0094], [1.4950, 0.0078], [1.5070, 0.0064], [1.5180, 0.0070]];
  // how the face turns back toward the ears at each height (0: round like an egg; more: straighter from chin to jaw; less than 0: flat across, like a brow)
  const FACE_V = [[1.4050, 0.30], [1.4200, 0.40], [1.4350, 0.44], [1.4494, 0.40], [1.4670, 0.22], [1.4870, 0.02], [1.5120, -0.12], [1.5280, -0.10], [1.5420, 0]];
  const GS = (dx, dy, wx, wy) => Math.exp(-Math.pow(dx / wx, 2) - Math.pow(dy / wy, 2));
  const noseLift = (Y) => (Y > 1.4657 && Y < 1.518 ? Math.max(0, spline(MID, Y) - (0.0940 - (Y - 1.4657) * 0.0937)) : 0);        // how far the nose stands off the face
  const lipLift = (Y) => 0.0022 * Math.exp(-Math.pow((Y - 1.4555) / 0.0045, 2)) + 0.0020 * Math.exp(-Math.pow((Y - 1.4440) / 0.0045, 2));
  const Y_LOW = MID[0][0], T_CHIN = (HC.y - Y_LOW) / HR.yB, W_CHIN = spline(FACE_W, Y_LOW), RZ_CHIN = MID[0][1] - HC.z - 0.050 * T_CHIN * T_CHIN * T_CHIN;
  function headPoint(a, ph, grow) {                 // a: angle from the front toward her left; ph: 0 at the crown, PI under the chin
    const yn = Math.cos(ph), s = Math.sin(a), c = Math.cos(a), g = grow || 0, t = Math.max(0, -yn), sp = Math.sin(ph);
    const Y = HC.y + (yn >= 0 ? HR.yT : HR.yB) * yn; let y = Y - HC.y + g * yn;
    const W = yn >= 0 ? HR.x * sp : spline(FACE_W, Y), sn = W / HR.x; let x = (W + g * Math.min(1, sn * 3)) * s;
    const zc = 0.050 * t * t * t;                   // the lower head sits forward, so the chin hangs under the mouth and the corners of the jaw stay back near the ears
    let z;
    if (c < 0) {
      z = zc * (1 - 0.95 * sm(0, -0.9, c)) + (HR.zB + g) * sn * c;      // only the face comes forward: the back of the head runs straight down into the nape
      const fb = yn < 0 ? sm(1.482, 1.444, Y) * sm(-0.05, -0.60, c) : 0;      // below the ears there is no skull behind the jaw, only neck: the ring tucks in to the neck there
      if (fb > 0) { x = lerp(x, (0.0440 + g) * s, fb); z = lerp(z, -0.028 - HC.z + (0.0465 + g) * c, fb); }
    }
    else {
      const base = yn >= 0 ? HR.zF * sp : t > T_CHIN ? RZ_CHIN * W / W_CHIN + zc : spline(MID, Y) - noseLift(Y) - lipLift(Y) - HC.z;
      const rz = base - zc + g * Math.min(1, sn * 3), v = yn >= 0 ? 0 : spline(FACE_V, Y), s2 = s * s;
      z = zc + rz * (c - v * s2 * Math.pow(c, 1.5));
      if (!g && yn < 0.35) {
        const ax = Math.abs(x), NT = FC.noseY, EY = FC.eyeY, EX = FC.eyeX, MY = FC.mouthY; let d = 0;
        if (yn < 0) d += noseLift(Y) * Math.exp(-Math.pow(x / spline(NOSE_W, Y), 2)) + lipLift(Y) * Math.exp(-Math.pow(x / 0.020, 2));     // the nose and lips, exactly as in her profile on the middle line
        // the wings of the nostrils, the folds where they meet the cheek, the hollows under the nose
        d += 0.0058 * GS(ax - 0.0108, Y - (NT - 0.0058), 0.0050, 0.0052) - 0.0014 * GS(ax - 0.0182, Y - (NT - 0.0044), 0.0030, 0.0066) - 0.0026 * GS(ax - 0.0060, Y - (NT - 0.0118), 0.0030, 0.0021);
        d -= 0.0064 * GS(ax - EX, Y - EY, 0.017, 0.0105) + 0.0026 * GS(ax - 0.014, Y - (EY - 0.002), 0.007, 0.010);   // eye sockets, deepest beside the bridge
        d += 0.0030 * (GS(ax - 0.027, Y - (FC.browY + 0.002), 0.026, 0.008) - GS(0.027, Y - (FC.browY + 0.002), 0.026, 0.008));        // brow (the middle line stays her profile)
        d += 0.0030 * GS(ax - EX, Y - EY, 0.0105, 0.0066) - 0.0010 * GS(ax - EX, Y - (EY + 0.0088), 0.014, 0.0024);   // the eyeball rounding out of its socket, and the crease of the lid above it
        d += 0.0040 * GS(ax - 0.043, Y - (EY - 0.027), 0.020, 0.016) - 0.0020 * GS(ax - 0.047, Y - (EY - 0.0576), 0.016, 0.014);       // cheekbones, and the hollow under them
        d -= 0.0009 * GS(x, Y - (MY + 0.0115), 0.0034, 0.0050) * 0;                                // the groove under the nose is already in her profile
        d -= 0.0016 * GS(ax - 0.0262, Y - MY, 0.006, 0.008);                                       // corners of the mouth
        z += d * c;
      }
    }
    if (t > 0.86) y += 0.12 * Math.max(0, 0.083 - z) * sm(0.86, 0.985, t);        // under the jaw the skin rises a little toward the throat
    return [HC.x + x, HC.y + y, HC.z + z];
  }
  const wHead = wOne('head'), faceMix = [], faceUvS = [];
  // her ear, read off the profile painting: its middle, half its width and height, and how far its top leans back
  const EAR = { z: -0.0226, y: 1.4913, a: 0.0158, b: 0.0299, tilt: 9 * DEG };
  const earR = (z, y) => { const c = Math.cos(EAR.tilt), sn = Math.sin(EAR.tilt), dz = z - EAR.z, dy = y - EAR.y, lz = dz * c + dy * sn, ly = dy * c - dz * sn; return Math.sqrt(lz * lz / (EAR.a * EAR.a) + ly * ly / (EAR.b * EAR.b)); };
  const SIDE_WIN = (BAKED && BAKED.faceSideWin) || [-0.075, 0.125, 1.380, 1.580];      // the side painting covers this window: forward from, to; height from, to
  (function buildHead() {
    const NU = Q(256, 84), NV = Q(176, 60), rings = [];        // most of the rings, and most of the columns, are spent on the face
    for (let i = 0; i <= NV; i++) {
      const u = i / NV, ph = u < 0.24 ? lerp(0.02, 1.45, u / 0.24) : lerp(1.45, PI - 0.012, (u - 0.24) / 0.76), ring = [];
      for (let j = 0; j < NU; j++) { const v = 2 * (j / NU) - 1; ring.push(headPoint(PI * (0.35 * v + 0.65 * v * v * v), ph)); }     // v = 0 is the middle of the face
      rings.push(ring);
    }
    const part = loft(rings, { capA: true, capB: true });
    for (let i = 0; i < part.pos.length / 3; i++) {   // the front painting is laid on straight from the front
      part.uv[i * 2] = (part.pos[i * 3] - FACE.x0) / (FACE.x1 - FACE.x0); part.uv[i * 2 + 1] = (part.pos[i * 3 + 1] - FACE.y0) / (FACE.y1 - FACE.y0);
    }
    const info = addPart('face', part, wHead, { out: HC });
    // which painting each point of the head wears: the front view where the skin faces forward, the profile view where it faces
    // sideways, and plain skin under the jaw and behind the ears, where neither painting can see
    const FB = buckets.face, Wn = SIDE_WIN;
    for (let i = info.start; i < info.start + info.count; i++) {
      const nx = FB.nor[i * 3], ny = FB.nor[i * 3 + 1], px = FB.pos[i * 3], py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2];
      const under = sm(-0.22, -0.66, ny) * sm(1.4345, 1.4185, py), plain = Math.max(under, sm(FC.earZ - 0.004, FC.earZ - 0.020, pz), Math.abs(px) > 0.03 ? sm(1.12, 0.92, earR(pz, py)) : 0);      // the painted ear is not wanted on the head under the real one
      const side = sm(0.70, 0.93, Math.abs(nx)) * sm(0.034, 0.050, Math.abs(px)) * sm(Wn[2] + 0.002, Wn[2] + 0.014, py) * sm(Wn[3] - 0.002, Wn[3] - 0.014, py) * (1 - plain);
      faceMix.push(side, plain, 1 - 0.40 * under); faceUvS.push((pz - Wn[0]) / (Wn[1] - Wn[0]), (py - Wn[2]) / (Wn[3] - Wn[2]));
    }
  })();
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
      let x = spline(FACE_W, Math.min(1.5419, y)) - 0.0015 + 0.0035 + 0.0165 * Math.pow(q, 0.9) * (0.50 + 0.50 * sm(1.466, 1.492, y));
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
        for (let j = 0; j < NT; j++) { const p = lat(r, (j / NT) * TAU), xin = spline(FACE_W, Math.min(1.5419, p[1])) - 0.006; ring.push([sg * Math.max(xin, lerp(p[0] - 0.0040, xin, u * u)), p[1], p[2]]); }
        rings.push(ring); kind.push(2);
      }
      const part = loft(rings, { capA: true }), cols = NT + 1, info = addPart('face', part, wHead, { out: V3(sg * 0.05, EAR.y, EAR.z) }), FB = buckets.face, Wn = SIDE_WIN;
      for (let i = info.start; i < info.start + info.count; i++) {
        const k = kind[Math.min(kind.length - 1, Math.floor((i - info.start) / cols))] || 0, py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2];
        if ((i - info.start) >= rings.length * cols || k === 0) faceMix.push(1, 0, 1); else if (k === 1) faceMix.push(0.5, 0.5, 0.95); else faceMix.push(0, 1, 0.82);
        faceUvS.push((pz - Wn[0]) / (Wn[1] - Wn[0]), (py - Wn[2]) / (Wn[3] - Wn[2]));
      }
    }
  })();
  // neck: from the top of the torso up inside the jaw
  (function buildNeck() {
    const NU = Q(40, 20), wNeck = (x, y) => { const u = sm(1.40, 1.47, y); return [BI.neck, 1 - u, BI.head, u]; }, nr = [];
    for (const [y, rx, zf, zb] of [[1.396, 0.0505, 0.0245, -0.0785], [1.412, 0.0486, 0.0240, -0.0770], [1.430, 0.0476, 0.0240, -0.0760], [1.450, 0.0476, 0.0240, -0.0765], [1.470, 0.0480, 0.0230, -0.0780], [1.490, 0.0470, 0.0200, -0.0790]])
      nr.push(ringXZ(0, y, (zf + zb) / 2, rx, (zf - zb) / 2, (zf - zb) / 2, NU));
    addPart('skin', loft(nr), wNeck, { out: V3(0, 1.44, -0.025) });
  })();
