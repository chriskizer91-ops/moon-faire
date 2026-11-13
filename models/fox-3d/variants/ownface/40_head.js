
  // ---------- head: a sculpted oval with soft features; the face itself is painted (and repainted to blink) ----------
  const HC = V3(0, 1.555, 0.002), HR = { x: 0.0700, yT: 0.092, yB: 0.1414, zF: 0.0985, zB: 0.083 };     // skull: lower crown and shallower back, as in her profile
  const LAY = (BAKED && BAKED.layout) || {};          // where the features sit in the painted face
  const FC = { eyeY: LAY.eyeY || 1.5246, eyeX: LAY.eyeX || 0.0304, ew: 0.0135, eh: 0.0056, browY: LAY.browY || 1.5368, noseY: LAY.noseY || 1.4877, mouthY: LAY.mouthY || 1.4586 };
  const FACE = { x0: -0.1, x1: 0.1, y0: 1.385, y1: 1.585 };          // the face canvas covers this window, seen from the front
  // The face is set out from her paintings. Its outline comes from the front view (08): the half width at each height.
  // Its profile comes from the side view (07), read off at 1500 pixels a metre with the tip of the nose as the fixed point:
  // FACE_MID is the middle line with the nose and lips taken away [height, metres forward of the ear line], NOSE is how far the
  // nose stands out from it, and FACE_V says how the face turns back toward the ears at each height (0: round like an egg;
  // more: straighter from chin to jaw, the way a jaw is; less than 0: flat across, the way a brow is).
  const FACE_MID = [[1.4211, 0.0977], [1.4265, 0.0989], [1.4304, 0.0992], [1.4318, 0.0992], [1.4372, 0.0987], [1.4409, 0.0987], [1.4425, 0.0992], [1.4479, 0.1008], [1.4525, 0.1015], [1.4532, 0.1015], [1.4586, 0.1025], [1.4639, 0.1038], [1.4679, 0.1041], [1.4693, 0.1043], [1.4747, 0.1051], [1.4785, 0.1049], [1.4800, 0.1046], [1.4854, 0.1039], [1.4907, 0.1032], [1.4961, 0.1026], [1.5014, 0.1019], [1.5068, 0.1013], [1.5122, 0.1007], [1.5175, 0.1001], [1.5229, 0.0995], [1.5282, 0.0988], [1.5310, 0.0984], [1.5336, 0.0983], [1.5389, 0.0988], [1.5443, 0.0991], [1.5496, 0.0990], [1.5550, 0.0986]];
  const NOSE = [[1.4785, 0.0000], [1.4818, 0.0019], [1.4851, 0.0099], [1.4883, 0.0145], [1.4916, 0.0169], [1.4936, 0.0176], [1.4949, 0.0176], [1.4982, 0.0163], [1.5015, 0.0135], [1.5048, 0.0102], [1.5080, 0.0080], [1.5113, 0.0061], [1.5146, 0.0043], [1.5179, 0.0026], [1.5212, 0.0010], [1.5244, 0.0000], [1.5277, 0.0000], [1.5310, 0.0000]];
  const NOSE_W = [[1.4785, 0.0052], [1.4857, 0.0054], [1.4894, 0.0070], [1.4966, 0.0100], [1.5038, 0.0082], [1.5147, 0.0062], [1.5310, 0.0058]];
  const LIPS = {uy: 1.4679, ua: 0.003, ly: 1.4525, la: 0.0033, chinY: 1.4304, cheekY: 1.4975, hollowY: 1.4669999999999999};
  const FACE_V = [[1.4150, 0.20], [1.4300, 0.26], [1.4450, 0.26], [1.4586, 0.20], [1.4760, 0.06], [1.4975, -0.08], [1.5246, -0.14], [1.5400, -0.10], [1.5550, 0]];      // her face is rounder than the Jester's: fuller cheeks and jaw as it turns (C3 at 34 degrees)
  // how wide a ring of the lower head is, from 1 at the cheeks to 0 under the chin: the last tenth closes quickly, so the jaw has an edge and a flat underside
  const SIN9 = Math.sqrt(1 - 0.81), SN9 = Math.pow(SIN9, 0.42), snLow = (sp, t) => (t > 0.9 ? SN9 * Math.pow(sp / SIN9, 0.40) : Math.pow(sp, 0.42));
  const T_CHIN = (HC.y - FACE_MID[0][0]) / HR.yB, SN_CHIN = snLow(Math.sqrt(1 - T_CHIN * T_CHIN), T_CHIN), RZ_CHIN = FACE_MID[0][1] - 0.050 * T_CHIN * T_CHIN * T_CHIN;
  // Chris, 12 Nov: her forehead was a little tall. The top of the head comes down half an inch (12.7 mm on her, 13.1 here before the head is scaled):
  // everything above the brow slides down, the brow and all below it stay where they were. The hairline, hair and costume ears come down with it.
  const FORE_DROP = 0.0131;
  // the underside of her jaw by depth [metres forward of the ear line, height]: nape, under the ear lobe, the corner of the jaw, then the long run forward to the chin
  const JAW = [[-0.060, 1.490], [-0.030, 1.484], [0.004, 1.472], [0.022, 1.452], [0.040, 1.432], [0.052, 1.4200], [0.090, 1.4140], [0.130, 1.4100]];
  function headPoint(a, ph, grow) {                 // a: angle from the front toward her left; ph: 0 at the crown, PI at the chin
    const yn = Math.cos(ph), s = Math.sin(a), c = Math.cos(a), g = grow || 0, t = Math.max(0, -yn), sn = yn < 0 ? snLow(Math.sin(ph), t) : Math.sin(ph);
    let y = (yn >= 0 ? HR.yT : HR.yB) * yn + g * yn; const Y = HC.y + (yn >= 0 ? HR.yT : HR.yB) * yn;
    const x = ((HR.x * sn) * (1 - 0.08 * sm(0.5, 1.0, t)) + g * Math.min(1, sn * 3)) * s;      // the outline from the front, narrowing to the jaw
    const zc = 0.050 * t * t * t;                   // the lower head sits forward, so the chin hangs under the mouth; the corners of the jaw stay back near the ears
    let z;
    if (c < 0) z = zc * (1 - 0.95 * sm(0, -0.9, c)) + (HR.zB + g) * sn * c;      // only the face comes forward: the back of the head runs straight down into the nape
    else {
      const rz = (yn >= 0 ? HR.zF * sn : t > T_CHIN ? RZ_CHIN * sn / SN_CHIN : spline(FACE_MID, Y) - zc) + g * Math.min(1, sn * 3), v = yn >= 0 ? 0 : spline(FACE_V, Y), s2 = s * s;
      z = zc + rz * (c - v * s2 * Math.pow(c, 1.5));
      if (!g && yn < 0.35) {
        const f = c, ax = Math.abs(x), G = (dx, dy, wx, wy) => Math.exp(-Math.pow(dx / wx, 2) - Math.pow(dy / wy, 2));
        let d = 0; const NT = FC.noseY;
        // nose: the bridge and the ball of the tip, the wings of the nostrils, the folds where they meet the cheek, the hollows under it
        if (Y > NOSE[0][0] && Y < NOSE[NOSE.length - 1][0]) d += spline(NOSE, Y) * Math.exp(-Math.pow(x / spline(NOSE_W, Y), 2));
        d += 0.0062 * G(ax - 0.0116, Y - (NT - 0.0054), 0.0052, 0.0052) - 0.0014 * G(ax - 0.0186, Y - (NT - 0.0040), 0.0030, 0.0066) - 0.0030 * G(ax - 0.0062, Y - (NT - 0.0096), 0.0030, 0.0021);
        d -= 0.0064 * G(ax - FC.eyeX, Y - FC.eyeY, 0.017, 0.0105) + 0.0028 * G(ax - 0.014, Y - (FC.eyeY - 0.002), 0.007, 0.010);   // eye sockets, deepest beside the bridge
        d += 0.0034 * G(ax - 0.028, Y - (FC.browY + 0.002), 0.027, 0.0075);                        // brow
        d += 0.0036 * G(ax - FC.eyeX, Y - FC.eyeY, 0.0112, 0.0064) - 0.0012 * G(ax - FC.eyeX, Y - (FC.eyeY + 0.0088), 0.014, 0.0024) - 0.0008 * G(ax - FC.eyeX, Y - (FC.eyeY - 0.0090), 0.013, 0.0024);   // the eyeball rounding out of its socket, and the crease of the lid above it
        d += 0.0040 * G(ax - 0.046, Y - LIPS.cheekY, 0.020, 0.016) - 0.0022 * G(ax - 0.050, Y - LIPS.hollowY, 0.016, 0.014);   // cheekbones, and the hollow under them
        d -= 0.0010 * G(x, Y - (FC.mouthY + 0.0135), 0.0034, 0.0055);                             // the groove under the nose
        d += LIPS.ua * G(x, Y - LIPS.uy, 0.020, 0.0054) + LIPS.la * G(x, Y - LIPS.ly, 0.016, 0.0054);  // lips
        d -= 0.0016 * G(ax - 0.024, Y - FC.mouthY, 0.006, 0.008);                                 // corners of the mouth
        d += 0.0026 * G(x, Y - LIPS.chinY, 0.017, 0.0095);                                            // the ball of the chin
        z += d * f;
      }
    }
    if (t > 0.86) y += 0.10 * Math.max(0, 0.083 - z) * sm(0.86, 0.985, t);        // under the jaw the skin rises toward the throat
    if (!g && yn < 0) { const yb = spline(JAW, z) - HC.y, e = 0.0060; y = 0.5 * (y + yb + Math.sqrt((y - yb) * (y - yb) + e * e)); }     // her jawline (C3, profile): nothing of the head hangs below it
    const Yw = HC.y + y; return [HC.x + x, Yw - FORE_DROP * sm(1.545, 1.580, Yw), HC.z + z];
  }
  const wHead = wOne('head'), faceMix = [], faceUvS = [];
  (function buildHead() {
    const NU = Q(256, 84), NV = Q(168, 60), rings = [];        // most of the rings, and most of the columns, are spent on the face
    for (let i = 0; i <= NV; i++) {
      const u = i / NV, ph = u < 0.28 ? lerp(0.02, 1.45, u / 0.28) : lerp(1.45, PI - 0.02, (u - 0.28) / 0.72), ring = [];
      for (let j = 0; j < NU; j++) { const v = 2 * (j / NU) - 1; ring.push(headPoint(PI * (0.35 * v + 0.65 * v * v * v), ph)); }     // v = 0 is the middle of the face
      rings.push(ring);
    }
    const part = loft(rings, { capA: true, capB: true });
    // Depth only (Chris, 13 Nov: her face is perfect straight on and wrong from every other angle). Straight on, the painting does the work. Turned, the
    // shape under it shows, and it was too smooth: no eye sockets, a wide flat bridge to her nose, lips and chin that barely stood out, a flat shelf
    // under her jaw. Here each point of her face may move straight back or straight forward and nowhere else, so seen from in front nothing shifts and
    // the painting lands exactly where it did. (Under her jaw, which cannot be seen from in front, points also rise toward her neck.)
    // FACE_DEPTH (00_util.js): 1 is the full reshaping and what she wears since 13 Nov; 0 leaves her as she was before it.
    if (FACE_DEPTH) {
      const K = FACE_DEPTH, nor = computeNormals(part.pos, part.idx), EY = FC.eyeY, EX = FC.eyeX, NY = FC.noseY, MY = FC.mouthY, BY = FC.browY;
      const g = (a, b) => Math.exp(-a * a - b * b);
      for (let i = 0; i < part.pos.length / 3; i++) {
        const x = part.pos[i * 3], y = part.pos[i * 3 + 1], z = part.pos[i * 3 + 2], ax = Math.abs(x), nz = nor[i * 3 + 2], ny = nor[i * 3 + 1];
        if (z > 0.02 && nz > 0.12) {
          let d = 0;
          d -= 0.0055 * g((ax - EX) / 0.0165, (y - EY) / 0.0105);                                                   // the socket her eye sits in
          d -= 0.0065 * g((ax - 0.0165) / 0.0065, (y - (EY - 0.001)) / 0.0085);                                     // deepest at the inner corner, beside the bridge of her nose
          d += 0.0026 * g((ax - EX) / 0.0105, (y - EY) / 0.0062);                                                   // the round of the eye itself
          d -= 0.0018 * g((ax - 0.034) / 0.014, (y - (EY + 0.0095)) / 0.0035);                                      // the hollow under her brow
          d += 0.0016 * g(0, (y - (BY + 0.001)) / 0.0055) * sm(0.006, 0.018, ax) * (1 - sm(0.046, 0.060, ax));      // her brow
          d += 0.0030 * g(x / 0.0058, 0) * sm(NY - 0.004, NY + 0.004, y) * (1 - sm(EY - 0.004, EY + 0.008, y));     // the ridge of her nose
          d -= 0.0058 * g((ax - 0.0170) / 0.0062, 0) * sm(NY - 0.002, NY + 0.010, y) * (1 - sm(EY - 0.012, EY - 0.002, y));     // its sides, which were a wide low mound
          d += 0.0022 * g((ax - 0.0138) / 0.0042, (y - (NY - 0.0015)) / 0.0050);                                    // the wings of her nostrils
          d -= 0.0020 * g((ax - 0.0205) / 0.0035, (y - (NY - 0.001)) / 0.0060);                                     // and the crease behind them
          d += 0.0012 * g((ax - 0.036) / 0.012, (y - (NY + 0.006)) / 0.010);                                        // the apples of her cheeks
          { const x0 = 0.0200, y0 = NY - 0.002, x1 = 0.0310, y1 = MY - 0.006, t = cl(((ax - x0) * (x1 - x0) + (y - y0) * (y1 - y0)) / ((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)), 0, 1), ds = Math.hypot(ax - (x0 + t * (x1 - x0)), y - (y0 + t * (y1 - y0)));
            d -= 0.0016 * Math.exp(-(ds / 0.0034) * (ds / 0.0034)); }                                                // the fold from her nose to the corner of her mouth, which was only painted
          d -= 0.0015 * g((ax - 0.046) / 0.010, (y - (MY + 0.004)) / 0.012);                                        // the hollow under them
          d += 0.0020 * g(x / 0.0135, (y - (MY + 0.0052)) / 0.0042);                                                // her upper lip
          d += 0.0022 * g(x / 0.0120, (y - (MY - 0.0045)) / 0.0040);                                                // her lower lip
          d -= 0.0010 * g(x / 0.0200, (y - MY) / 0.0014);                                                           // the line between them
          d -= 0.0016 * g((ax - 0.0265) / 0.0050, (y - (MY + 0.0005)) / 0.0050);                                    // the corners of her mouth
          d -= 0.0018 * g(x / 0.0140, (y - (MY - 0.0145)) / 0.0042);                                                // the fold under her lower lip
          d += 0.0022 * g(x / 0.0130, (y - (MY - 0.0300)) / 0.0075);                                                // her chin
          part.pos[i * 3 + 2] = z + K * d * sm(0.12, 0.45, nz);
        }
        // Under her jaw: the flat shelf slopes up toward her neck. Nothing moves at the jaw's own edge (which is what shows from in front), and the rise
        // grows smoothly behind it, so there is no step.
        if (ny < -0.15 && y < 1.475 && z > -0.03) part.pos[i * 3 + 1] = y + K * 0.015 * sm(0, 0.036, (0.092 - 0.9 * ax) - z) * sm(-0.15, -0.65, ny) * (1 - sm(1.440, 1.475, y)) * sm(-0.03, 0.0, z);
      }
    }
    for (let i = 0; i < part.pos.length / 3; i++) {   // planar projection from the front
      part.uv[i * 2] = (part.pos[i * 3] - FACE.x0) / (FACE.x1 - FACE.x0); part.uv[i * 2 + 1] = (part.pos[i * 3 + 1] - FACE.y0) / (FACE.y1 - FACE.y0);
    }
    const info = addPart('face', part, wHead, { out: HC });
    // which painting each point of the head wears: the front view where the skin faces forward, the profile view where it faces
    // sideways, and plain skin under the jaw and behind the ears, where neither painting can see
    const FB = buckets.face, MIXED = !!(BAKED && BAKED.faceSide), Wn = (BAKED && BAKED.faceSideWin) || [-0.01, 0.13, 1.40, 1.58];
    for (let i = info.start; i < info.start + info.count; i++) {
      const nx = FB.nor[i * 3], ny = FB.nor[i * 3 + 1], px = FB.pos[i * 3], py = FB.pos[i * 3 + 1], pz = FB.pos[i * 3 + 2];
      const jf = spline(JAW, pz - HC.z), under = sm(-0.22, -0.66, ny) * sm(jf + 0.014, jf + 0.004, py), plain = Math.max(under, sm(0.010, -0.006, pz - HC.z));      // only under the jaw: the nose and lips have undersides too, and keep their paint
      const side = sm(0.70, 0.93, Math.abs(nx)) * sm(0.034, 0.050, Math.abs(px)) * sm(Wn[0] + 0.004, Wn[0] + 0.022, pz) * sm(Wn[2] + 0.002, Wn[2] + 0.014, py) * sm(Wn[3] - 0.002, Wn[3] - 0.014, py) * (1 - plain);
      faceMix.push(side, plain, 1 - 0.40 * under); faceUvS.push((pz - Wn[0]) / (Wn[1] - Wn[0]), (py - Wn[2]) / (Wn[3] - Wn[2]));
    }
    // neck
    const np = [V3(0, 1.30, -0.014), V3(0, 1.345, -0.012), V3(0, 1.40, -0.006), V3(0, 1.45, 0)], nr = [0.050, 0.046, 0.043, 0.046];
    const nrings = tubeRings(curvePts(np, 8), [0.029, 0.028, 0.026, 0.025, 0.025, 0.025, 0.026, 0.028], Q(24, 12), V3(0, 0, 1));
    const nk = addPart(MIXED ? 'face' : 'skin', loft(nrings), (x, y) => { const u = sm(1.33, 1.37, y), v = sm(1.385, 1.43, y); return [BI.spine3, 1 - u, BI.neck, u * (1 - v), BI.head, u * v]; }, { out: V3(0, 1.38, -0.01) });
    if (MIXED) for (let i = nk.start; i < nk.start + nk.count; i++) { faceMix.push(0, 1, 1 - 0.38 * sm(1.330, 1.428, FB.pos[i * 3 + 1])); faceUvS.push(0, 0); }     // the neck is plain skin, dim where the jaw shades it
  })();

  // the face canvas: eyes (0 open .. 1 closed), mouth ('rest', 'open', 'smile'), glow (spell light in her eyes)
  const faceC = cvs(Math.round(1024 * TEXS), Math.round(1024 * TEXS)), faceT = ctex(faceC);
  const faceState = { eyes: -1, mouth: '', glow: -1 }, bakedFace = { base: null, parts: {} }, lastFace = [0, 'rest', 0];
  // her talking mouths, none showing teeth: each time her mouth opens it takes the next one
  const TALK = ['oh', 'oh2', 'oh', 'oh3'].filter((n) => BAKED && BAKED.faceParts && BAKED.faceParts[n]); if (!TALK.length) TALK.push('oh'); let talkN = 0;
  function paintFace(eyes, mouth, glow) {
    lastFace[0] = eyes; lastFace[1] = mouth; lastFace[2] = glow;
    const q = Math.round(eyes * 4) / 4, gq = Math.round((glow || 0) * 4) / 4;
    if (q === faceState.eyes && mouth === faceState.mouth && gq === faceState.glow) return;
    if (mouth === 'open' && faceState.mouth !== 'open') talkN++;
    faceState.eyes = q; faceState.mouth = mouth; faceState.glow = gq;
    const W = faceC.width, H = faceC.height, g = faceC.getContext('2d'), k = W / 0.2, u = k / 1000;     // k: pixels per meter; u: per millimeter
    const X = (x) => (x - FACE.x0) / (FACE.x1 - FACE.x0) * W, Y = (y) => (1 - (y - FACE.y0) / (FACE.y1 - FACE.y0)) * H;
    if (bakedFace.base) {                           // the painted face, with the painted eyes or mouth for this state set into it
      g.drawImage(bakedFace.base, 0, 0, W, H);
      const put = (n) => { const im = bakedFace.parts[n], r = BAKED.faceParts[n]; if (im) g.drawImage(im, r.x * W, r.y * H, r.w * W, r.h * H); };
      if (q >= 0.75) put('shut'); else if (q >= 0.25) put('half');
      if (mouth === 'open') put(TALK[talkN % TALK.length]); else if (mouth === 'smile') put('smile');
      if (gq > 0 && q < 0.75) for (const e of BAKED.faceEyes) {
        const r = 0.0078 * k, gg = g.createRadialGradient(e[0] * W, e[1] * H, 0, e[0] * W, e[1] * H, r);
        gg.addColorStop(0, rgba('#f0c8ff', 0.95 * gq)); gg.addColorStop(0.55, rgba(PAL.violet, 0.75 * gq)); gg.addColorStop(1, rgba(PAL.violet, 0));
        g.fillStyle = gg; g.beginPath(); g.arc(e[0] * W, e[1] * H, r, 0, TAU); g.fill();
      }
      faceT.needsUpdate = true; return;
    }
    g.fillStyle = PAL.skin; g.fillRect(0, 0, W, H);
    const soft = (x, y, rx, ry, col, a) => {
      g.save(); g.translate(X(x), Y(y)); g.scale(rx * k, ry * k);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore();
    };
    const EY = FC.eyeY, EX = FC.eyeX, NY = FC.noseY, MY = FC.mouthY;
    // warm light on the middle of the face, rose shade toward its edges, the cap's shadow across the brow
    soft(0, NY + 0.012, 0.058, 0.060, '#ffe0c6', 0.6); soft(0, 1.415, 0.07, 0.03, '#e0a088', 0.5);
    soft(0, 1.566, 0.14, 0.030, '#8a4a50', 0.7);
    for (const sx of [-1, 1]) { soft(sx * 0.094, NY + 0.02, 0.030, 0.10, '#c47a72', 0.6); soft(sx * 0.060, MY - 0.006, 0.034, 0.030, '#d08a7c', 0.4); soft(sx * 0.047, NY + 0.006, 0.027, 0.018, PAL.blush, 0.5); }
    soft(0, 1.400, 0.06, 0.018, '#c47a72', 0.55);
    soft(0, NY - 0.004, 0.0075, 0.0058, '#e8948a', 0.5);                    // a rosy nose tip, as in the sprite
    soft(0, NY - 0.0115, 0.0085, 0.0036, '#b06e66', 0.5);
    soft(0, MY - 0.0118, 0.012, 0.004, '#c08074', 0.4);
    soft(0, NY + 0.022, 0.004, 0.017, '#fff0e2', 0.45);
    for (const sx of [-1, 1]) {
      const ew = FC.ew * k, eh = FC.eh * (1 - q) * k, px = X(sx * EX), py = Y(EY);
      soft(sx * (EX + 0.001), EY - 0.001, 0.031, 0.021, '#4a2238', 0.62);   // smoked shadow all round the eye
      soft(sx * (EX + 0.004), EY - 0.011, 0.024, 0.012, '#3a1a2c', 0.5);
      g.save(); g.translate(px, py); g.scale(sx, 1);
      if (q < 0.99) {
        g.beginPath(); g.moveTo(-ew, 1.0 * u);       // a heavy-lidded almond: flat on top, outer corner lifted
        g.bezierCurveTo(-ew * 0.55, -eh * 1.05, ew * 0.4, -eh * 1.2, ew, -2.2 * u);
        g.bezierCurveTo(ew * 0.5, eh * 1.05, -ew * 0.5, eh * 0.95, -ew, 1.0 * u); g.closePath();
        g.save(); g.clip();
        g.fillStyle = '#b89c9c'; g.fillRect(-ew, -eh * 2, ew * 2, eh * 4);
        const ir = 14.5 * u, iy = -1.0 * u, ig = g.createRadialGradient(0, iy, ir * 0.1, 0, iy, ir);   // the lid cuts the top of a large dark iris
        ig.addColorStop(0, '#140a0e'); ig.addColorStop(0.55, '#2c151c'); ig.addColorStop(0.85, '#472229'); ig.addColorStop(1, '#12080b');
        g.fillStyle = ig; g.beginPath(); g.arc(0, iy, ir, 0, TAU); g.fill();
        dot(g, 0, iy, ir * 0.5, '#080405');
        if (gq > 0) { const gg = g.createRadialGradient(0, iy, 0, 0, iy, ir); gg.addColorStop(0, rgba('#f0c8ff', 0.95 * gq)); gg.addColorStop(0.6, rgba(PAL.violet, 0.8 * gq)); gg.addColorStop(1, rgba(PAL.violet, 0)); g.fillStyle = gg; g.beginPath(); g.arc(0, iy, ir, 0, TAU); g.fill(); }
        dot(g, -ir * 0.36, iy - ir * 0.05, ir * 0.2, 'rgba(255,255,255,0.95)');
        const sh = g.createLinearGradient(0, -eh * 1.2, 0, eh * 0.2); sh.addColorStop(0, 'rgba(24,8,20,0.8)'); sh.addColorStop(1, 'rgba(24,8,20,0)'); g.fillStyle = sh; g.fillRect(-ew, -eh * 1.4, ew * 2, eh * 1.6);
        g.restore();
      }
      const op = Math.max(eh, 0.6 * u);
      g.strokeStyle = '#0e070c'; g.lineCap = 'round'; g.lineJoin = 'round';
      g.lineWidth = 4.6 * u; g.beginPath(); g.moveTo(-ew * 1.04, 1.3 * u);            // the thick upper lash line and its wing
      if (q < 0.99) g.bezierCurveTo(-ew * 0.55, -op * 1.1, ew * 0.4, -op * 1.25, ew * 1.05, -2.6 * u);
      else g.bezierCurveTo(-ew * 0.5, 4.2 * u, ew * 0.45, 4.0 * u, ew * 1.05, -0.8 * u);
      g.lineTo(ew * 1.34, -5.4 * u); g.stroke();
      if (q < 0.99) { g.lineWidth = 1.7 * u; g.strokeStyle = 'rgba(20,8,16,0.9)'; g.beginPath(); g.moveTo(-ew * 0.8, op * 0.7); g.bezierCurveTo(-ew * 0.2, op * 1.08, ew * 0.5, op * 1.05, ew, -1.8 * u); g.stroke(); }
      // run mascara: three short drips from the lower lash, the middle one longest
      g.strokeStyle = 'rgba(20,8,16,0.88)';
      for (const [dx, y0, y1, lw] of [[-0.42, 9.5, 17, 2.6], [0.02, 10.5, 26, 3.4], [0.46, 9.5, 19.5, 2.7]]) { g.lineWidth = lw * u; g.beginPath(); g.moveTo(ew * dx, (q < 0.99 ? y0 : y0 - 4) * u); g.lineTo(ew * (dx + 0.03), y1 * u); g.stroke(); }
      soft(sx * EX, EY - 0.0125, 0.017, 0.007, '#3a1a2c', 0.4);
      // brow: thick, dark, close over the eye, falling a little toward the outside
      g.strokeStyle = '#1a0e12'; g.lineWidth = 5.4 * u; const by = -(FC.browY - EY) * k;
      g.beginPath(); g.moveTo(-ew * 0.95, by - 1.2 * u); g.quadraticCurveTo(ew * 0.1, by - 3.4 * u, ew * 1.12, by + 1.6 * u); g.stroke();
      g.restore();
    }
    // lips: small, rose, the lower one full
    const lw = 15.2 * u, up = mouth === 'smile' ? -2.0 * u : 0;
    g.save(); g.translate(X(0), Y(MY));
    g.fillStyle = PAL.lip; g.beginPath(); g.moveTo(-lw, up);
    g.bezierCurveTo(-lw * 0.5, -4.6 * u, -lw * 0.14, -5.6 * u, 0, -3.4 * u);
    g.bezierCurveTo(lw * 0.14, -5.6 * u, lw * 0.5, -4.6 * u, lw, up);
    g.bezierCurveTo(lw * 0.55, 10.2 * u, -lw * 0.55, 10.2 * u, -lw, up); g.closePath(); g.fill();
    const hg = g.createRadialGradient(0, 3.8 * u, 0, 0, 3.8 * u, lw * 0.62); hg.addColorStop(0, 'rgba(244,150,150,0.7)'); hg.addColorStop(1, 'rgba(244,150,150,0)'); g.fillStyle = hg; g.fill();
    g.strokeStyle = '#5a1c2a'; g.lineWidth = 1.4 * u; g.beginPath(); g.moveTo(-lw, up);
    if (mouth === 'open') { g.bezierCurveTo(-lw * 0.4, 0.5 * u, lw * 0.4, 0.5 * u, lw, up); g.stroke(); g.fillStyle = '#3a0f1c'; g.beginPath(); g.ellipse(0, 1.5 * u, lw * 0.5, 2.8 * u, 0, 0, TAU); g.fill(); }
    else { g.bezierCurveTo(-lw * 0.4, 1.6 * u - up * 0.2, lw * 0.4, 1.6 * u - up * 0.2, lw, up); g.stroke(); }
    g.restore();
    faceT.needsUpdate = true;
  }
  paintFace(0, 'rest', 0);
  const repaintFace = () => { faceState.eyes = -1; paintFace(lastFace[0], lastFace[1], lastFace[2]); };
  onBaked('face', (im) => { bakedFace.base = im; repaintFace(); });
  if (BAKED && BAKED.faceParts) for (const n in BAKED.faceParts) onBaked('facePart_' + n, (im) => { bakedFace.parts[n] = im; repaintFace(); }, BAKED.faceParts[n].src);

  // ---------- hair: black, framing the face beneath the cap and falling down the back under the veils ----------
  (function buildHair() {
    const NU = Q(84, 36), NR = Q(18, 10), rings = [];
    for (let i = 0; i <= NR; i++) {                 // a curtain round the sides and back of the head: out from under the cap, in against the neck, down to the ruff
      const u = i / NR, ring = [];
      for (let j = 0; j <= NU; j++) {
        const f = j / NU, a = lerp(0.50 * PI, 1.50 * PI, f), back = Math.pow(Math.sin(f * PI), 0.5), y = lerp(1.50, lerp(1.404, 1.390, back) + 0.004 * Math.sin(j * 1.7), u);
        const k = sm(1.398, 1.455, y), up = cl((y - 1.455) / 0.045, 0, 1), lock = (0.0014 * Math.sin(j * 2.1 + i * 0.35) + 0.0008 * Math.sin(j * 0.7)) * (1 - up);
        const rx = (y > 1.455 ? lerp(0.0570, 0.0695, up) : lerp(0.0490, 0.0570, k)) + lock, rz = (y > 1.455 ? lerp(0.0710, 0.0840, up) : lerp(0.0600, 0.0710, k)) + lock;
        ring.push([rx * Math.sin(a), y, 0.004 + rz * Math.cos(a)]);
      }
      rings.push(ring);
    }
    addPart('hair', loft(rings, { open: true, vS: 2, uS: 9 }), (x, y) => { const v = sm(1.40, 1.47, y); return [BI.head, v, BI.neck, (1 - v) * 0.5, BI.spine3, (1 - v) * 0.5]; }, { out: V3(0, 1.5, 0) });
  })();


  // ---------- the jester cap: quilted black velvet, two great stuffed horns ----------
  const CAP_EDGE = [[-1, 1.432], [-0.3, 1.440], [0, 1.452], [0.276, 1.482], [0.446, 1.5246], [0.62, 1.553], [0.78, 1.5615], [1, 1.5625]];   // [cos of the angle from the front, height]: level across the brow, down in front of the ears, low round the back
  const capEdge = (a) => { const c = Math.cos(a); for (let i = 1; i < CAP_EDGE.length; i++) if (c <= CAP_EDGE[i][0]) { const p = CAP_EDGE[i - 1], q = CAP_EDGE[i]; return lerp(p[1], q[1], (c - p[0]) / (q[0] - p[0])); } return 1.5625; };
  (function buildCap() {
    const NU = Q(96, 40), NV = Q(28, 12), rings = [], g = 0.0075;
    for (let i = 0; i <= NV; i++) {
      const ring = [];
      for (let j = 0; j < NU; j++) {
        const a = PI + (j / NU) * TAU, yE = capEdge(a), phE = Math.acos(cl((yE - HC.y) / (yE >= HC.y ? HR.yT : HR.yB), -1, 1));
        const ph = lerp(0.03, phE, Math.pow(i / NV, 0.9)), p = headPoint(a, ph, g + 0.0035 * Math.max(0, Math.sin((j / NU) * TAU * 6)) * Math.sin(ph) * 0.0);
        ring.push(p);
      }
      rings.push(ring);
    }
    // roll the edge under so the cap has thickness
    const last = rings[rings.length - 1];
    rings.push(last.map((p, j) => { const a = PI + (j / NU) * TAU; return [p[0] * 1.03, p[1] - 0.006, HC.z + (p[2] - HC.z) * 1.03]; }));
    rings.push(last.map((p, j) => [p[0] * 0.965, p[1] - 0.004, HC.z + (p[2] - HC.z) * 0.965]));
    addPart('cap', loft(rings, { capA: true }), wHead, { out: HC });
  })();
  function capTex() {
    const S = Math.round(1024 * TEXS), c = cvs(S, S), g = c.getContext('2d');
    g.fillStyle = '#2e252b'; g.fillRect(0, 0, S, S);
    blobs(g, S, S, 300, ['#4e404a'], S * 0.01, S * 0.06, 0.05, 0.18);
    blobs(g, S, S, 200, ['#000000'], S * 0.02, S * 0.08, 0.1, 0.3);
    g.strokeStyle = 'rgba(70,62,78,0.5)'; g.lineWidth = S / 300;
    for (let i = 0; i < 12; i++) { const x = (i / 12) * S; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }   // quilting seams
    // brim band
    const bg = g.createLinearGradient(0, S * 0.09, 0, 0); bg.addColorStop(0, 'rgba(60,52,68,0)'); bg.addColorStop(1, 'rgba(60,52,68,0.7)'); g.fillStyle = bg; g.fillRect(0, 0, S, S * 0.09);
    return ctex(c);
  }
  // horns: [x, y, z] control points for her left; the right is mirrored. Each has a chain of bones so it can sway.
  // They leave the head thick, arc over low and flop down, thinning to a point where the pompom hangs (Chris, November 11, after the flipbook).
  const HORN_CTRL = [[0.030, 1.610, -0.004], [0.078, 1.652, -0.012], [0.140, 1.672, -0.018], [0.206, 1.664, -0.020], [0.258, 1.630, -0.014], [0.288, 1.578, -0.008], [0.297, 1.528, -0.002], [0.295, 1.492, 0.0]];
  const HORN_R = [0.070, 0.066, 0.057, 0.045, 0.034, 0.024, 0.016, 0.011];
  const HORN_N = 6, hornChains = {};
  for (const [S, s] of SIDES) {
    const ctrl = HORN_CTRL.map((p) => V3(s * p[0], p[1], p[2])), N = Q(64, 32), pts = curvePts(ctrl, N);
    // bones along the curve; the last carries the pompom
    const chain = []; let par = 'head';
    for (let k = 0; k < HORN_N; k++) { const p = pts[Math.round((0.06 + 0.94 * k / HORN_N) * (N - 1))]; addBone('horn' + k + S, par, p.x, p.y, p.z); par = 'horn' + k + S; chain.push(par); }
    const tip = pts[N - 1], pc = V3(tip.x, tip.y - 0.058, tip.z + 0.002);        // the pompom hangs from the very tip
    addBone('pom' + S, par, tip.x, tip.y, tip.z); chain.push('pom' + S);
    hornChains[S] = { names: chain, pom: pc };
    const rad = pts.map((p, i) => { const u = i / (N - 1); return crom(HORN_R, u * (HORN_R.length - 1)) * (1 + 0.045 * Math.pow(Math.abs(Math.sin(u * PI * 11)), 1.5) - 0.02); });
    const NU = Q(28, 14), rings = tubeRings(pts, rad, NU, V3(0, 0, 1));
    const ts = pts.map((p, i) => i / (N - 1));
    const wf = (x, y, z, i) => {
      const u = ts[Math.min(N - 1, Math.floor(i / (NU + 1)))], f = cl((u - 0.06) / 0.94 * HORN_N, 0, HORN_N - 1e-4), k = Math.floor(f), fr = sm(0.15, 0.85, f - k);
      if (u < 0.10) { const b = sm(0.0, 0.10, u); return [BI.head, 1 - b, BI['horn0' + S], b]; }
      return k >= HORN_N - 1 ? [BI['horn' + (HORN_N - 1) + S], 1] : [BI['horn' + k + S], 1 - fr, BI['horn' + (k + 1) + S], fr];
    };
    addPart('velvet', loft(rings, { capB: true, vS: 5, uS: 2 }), wf, { out: centroidOf(rings) });
  }

  // ---------- fur: a dark core covered in short tufts (the pompoms and the collar) ----------
  function tufts(key, n, basePt, wf, len, wid) {     // basePt(i) -> { p: Vector3, n: Vector3 }
    const pos = [], uv = [], idx = [];
    for (let i = 0; i < n; i++) {
      const { p, n: nm } = basePt(i), t = V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5); t.addScaledVector(nm, -t.dot(nm)).normalize();
      const b = V3().crossVectors(nm, t), dir = nm.clone().addScaledVector(t, rr(-0.55, 0.55)).addScaledVector(b, rr(-0.55, 0.55)).normalize();
      const L = len * rr(0.6, 1.25), w = wid * rr(0.7, 1.2), k = pos.length / 3, tip = p.clone().addScaledVector(dir, L);
      for (let j = 0; j < 3; j++) { const a = (j / 3) * TAU, q = p.clone().addScaledVector(t, Math.cos(a) * w).addScaledVector(b, Math.sin(a) * w); pos.push(q.x, q.y, q.z); uv.push(j / 3, 0); }
      pos.push(tip.x, tip.y, tip.z); uv.push(0.5, 1);
      idx.push(k, k + 1, k + 3, k + 1, k + 2, k + 3, k + 2, k, k + 3);
    }
    addPart(key, { pos, uv, idx }, wf, { weld: false });
  }
  for (const [S, s] of SIDES) {
    const c = hornChains[S].pom, R = 0.066, wf = wOne('pom' + S);
    addPart('fur', spherePart(c, R * 0.86, R * 0.86, R * 0.86, 20, 14), wf, { out: c });
    tufts('fur', Q(2600, 1000), () => { const d = V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(); return { p: c.clone().addScaledVector(d, R * 0.86), n: d }; }, wf, 0.013, 0.0058);
    // the short cord that ties the pompom to the horn tip
    const tipB = SK['pom' + S].userData.rest;
    addPart('velvet', loft(tubeRings([tipB.clone(), c.clone().lerp(tipB, 0.5), c.clone()], [0.010, 0.008, 0.010], 8)), wf, { out: c.clone().lerp(tipB, 0.5).add(V3(0.05, 0, 0)) , weld: true });
  }
  (function buildCollar() {                           // the ruff at her throat: three stacked frills of pleated black organza
    const C = V3(0, 1.362, -0.006), wf = (x, y) => { const u = sm(1.33, 1.40, y); return [BI.neck, 0.6 + 0.4 * u, BI.spine3, 0.4 * (1 - u)]; };
    // each frill is a soft roll of gathered organza: a ring whose outer face is pleated into rounded folds
    const NP = 25, NA = NP * Q(8, 4), NS = Q(12, 8);
    for (const [yc, Rm, r0, phs] of [[1.3440, 0.0655, 0.0150, 0.0], [1.3670, 0.0630, 0.0143, 1.9], [1.3880, 0.0585, 0.0128, 3.7]]) {
      const rings = [];
      for (let i = 0; i < NS; i++) {
        const f = (i / NS) * TAU, cf = Math.cos(f), sf = Math.sin(f), ring = [];
        for (let j = 0; j < NA; j++) {
          const a = (j / NA) * TAU, th = a * NP + phs + 0.5 * Math.sin(a * 3 + phs), out = Math.max(0, cf);
          const rr = r0 * (1 + out * (0.34 * Math.sin(th) + 0.10 * Math.sin(2.3 * th + 1)) + 0.05 * Math.sin(a * 5 + phs)), R = Rm + rr * cf * 1.15;
          ring.push([C.x + R * 1.07 * Math.sin(a), yc + rr * sf * (1 + 0.25 * out * Math.cos(th)), C.z + R * 0.95 * Math.cos(a)]);
        }
        rings.push(ring);
      }
      rings.push(rings[0]);
      addPart('ruffle', loft(rings, { uS: 8, v0: 0.15, vS: 0.7 }), wf, { out: V3(0, yc, 0) });
    }
    addPart('cloth', loft(tubeRings([V3(0, 1.326, -0.008), V3(0, 1.362, -0.006), V3(0, 1.393, -0.005)], [0.050, 0.048, 0.0465], Q(24, 12), V3(0, 0, 1))), wf, { out: C });   // the band the frills are sewn to
    // a turquoise pendant on a fine gold chain
    const wc = () => [BI.spine3, 1], tp = prof(TORSO, 1.306, true), pc = V3(0, PROJ ? 1.306 : 1.268, PROJ ? tp[3] + tp[1] + 0.003 : 0.094);
    if (!PROJ) { const chain = curvePts([V3(-0.052, 1.332, 0.030), V3(-0.030, 1.296, 0.078), pc.clone().add(V3(0, 0.014, 0.002)), V3(0.030, 1.296, 0.078), V3(0.052, 1.332, 0.030)], 28);
      addPart('gold', loft(tubeRings(chain, chain.map(() => 0.0011), 5)), wc, { out: V3(0, 1.30, 0) }); }
    addPart('gold', spherePart(pc, 0.0128, 0.0150, 0.0050, 16, 10), wc, { out: pc });
    addPart('gem', spherePart(pc.clone().add(V3(0, 0, 0.0030)), 0.0100, 0.0122, 0.0058, 16, 10), wc, { out: pc });
  })();
