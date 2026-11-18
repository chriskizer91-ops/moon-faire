// The Grey Hat captain as one of the fair folk: his light version, made on the fair folk kit (game/people/kit on the
// claude/moon-faire-starter-world branch), which reuses the Jester's skeleton, body, hands, head, moves and emotes.
// Every shape is measured off his finished model (npc/sheet.py draws it in the kit's frame). Sizes are in the TEMPLATE's
// metres: she is 1.65 m, and `height` scales him up to his 1.80 m. His paint is his finished model, drawn flat-on, so it is
// read onto these shapes by position (npc/body.webp) and needs no fitting.
const PERSON = {
  name: 'The Grey Hat',
  height: 1.0885, build: [1, 1],
  skin: '#b98468',
  colors: { torso: '#e0cfb0', sleeve: '#e0cfb0', forearm: 'skin', legs: '#6e2028', boots: '#2b2420' },
  parts: { shirt: '#e0cfb0', corset: '#2e2a28', trousers: '#6e2028', belt: '#1e1a18', hat: '#77736f', brim: '#554d4e', hair: '#4a3324', beard: '#3a2a20',
           sleeves: '#e0cfb0', lace: '#d9c7a4', boot: '#2b2420', cuff: '#2a2422', glove: '#1b1a1a', pouch: '#5b3a24', scroll: '#e6d3a8', glasses: { color: '#141414', rough: 0.35 } },
  face(F) { F.beard('#2c2018', 0.8, 'beard'); },
  make(K) {
    const B = K.BI, sm = K.sm, rad = Math.PI / 180;
    // ---- his trunk: shirt and corset as one shell, the paint tells them apart. A man's straight trunk over the template's waist ----
    K.shell('shirt', [[1.352, 0.094, 0.062, 0.080], [1.325, 0.158, 0.090, 0.096], [1.290, 0.182, 0.112, 0.103], [1.235, 0.178, 0.130, 0.105],
      [1.180, 0.166, 0.130, 0.101], [1.125, 0.150, 0.122, 0.092], [1.070, 0.141, 0.121, 0.086], [1.010, 0.147, 0.121, 0.092], [0.960, 0.158, 0.121, 0.112]], K.w.torso, { n: 28 });
    // the ruffled front of the shirt, standing off his chest
    K.panel('shirt', [[1.348, 0.085, 0.085], [1.300, 0.128, 0.150], [1.240, 0.124, 0.172], [1.190, 0.098, 0.178], [1.160, 0.060, 0.150]], -62, 62, K.w.torso, { n: 14 });
    // ---- the seat of his trousers, from under the corset to below the crotch, swinging with both legs ----
    K.shell('trousers', [[1.000, 0.141, 0.112, 0.086], [0.940, 0.168, 0.121, 0.122], [0.880, 0.182, 0.123, 0.130], [0.820, 0.192, 0.121, 0.124],
      [0.760, 0.198, 0.117, 0.112], [0.700, 0.200, 0.112, 0.104]], K.w.skirt, { n: 28 });
    // each trouser leg, baggy, gathered into the boot top. It follows the thigh above the knee and the shin below it
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const leg = (x, y) => { const t = sm(0.80, 0.70, y), k = sm(0.53, 0.43, y); return [B.hips, 1 - t, B['thigh' + S], t * (1 - k), B['shin' + S], t * k]; };
      K.shell('trousers', [[0.800, 0.092, 0.106, 0.106, s * 0.097, 0.008], [0.700, 0.096, 0.108, 0.108, s * 0.100, 0.004], [0.600, 0.098, 0.105, 0.106, s * 0.100, -0.004],
        [0.500, 0.097, 0.100, 0.104, s * 0.100, -0.012], [0.420, 0.094, 0.094, 0.104, s * 0.098, -0.026], [0.365, 0.082, 0.078, 0.092, s * 0.096, -0.030], [0.335, 0.064, 0.062, 0.074, s * 0.095, -0.030]], leg, { n: 22 });
      // the boot shaft, wider than the template's boot, on the shin
      K.shell('boot', [[0.360, 0.084, 0.072, 0.088, s * 0.094, -0.032], [0.300, 0.080, 0.068, 0.084, s * 0.093, -0.032], [0.230, 0.064, 0.060, 0.074, s * 0.092, -0.030],
        [0.160, 0.058, 0.060, 0.070, s * 0.090, -0.026], [0.110, 0.060, 0.072, 0.074, s * 0.089, -0.010]], K.w.bone('shin' + S), { n: 18 });
      // a full sleeve, gathered at a band below the elbow: it follows the upper arm, then the forearm from the elbow down
      const ax = (y) => s * (0.150 + (1.300 - y) * 0.266), arm = (x, y) => { const t = sm(1.105, 1.035, y); return [B['uarm' + S], 1 - t, B['farm' + S], t]; };
      K.shell('sleeves', [[1.325, 0.052, 0.070, 0.080, ax(1.325), -0.012], [1.275, 0.068, 0.080, 0.086, ax(1.275), -0.012], [1.200, 0.082, 0.086, 0.090, ax(1.200), -0.012],
        [1.130, 0.084, 0.086, 0.090, ax(1.130), -0.012], [1.075, 0.073, 0.076, 0.080, ax(1.075), -0.010], [1.048, 0.054, 0.058, 0.060, ax(1.048), -0.008]], arm, { n: 20 });
      // the lace ruffle hanging from the band over the forearm (open at the bottom)
      const fx = (y) => s * (0.213 + (1.063 - y) * 0.272);
      K.shell('lace', [[1.055, 0.056, 0.058, 0.060, fx(1.055), -0.008], [1.025, 0.074, 0.076, 0.078, fx(1.025), -0.008], [0.992, 0.088, 0.088, 0.090, fx(0.992), -0.008]], K.w.bone('farm' + S), { n: 22 });
      // his black fingerless glove: the back and palm of the hand to the knuckles (measured off the template's hand), on the hand bone
      K.shell('glove', [[0.852, 0.020, 0.031, 0.032, s * 0.271, -0.002], [0.815, 0.022, 0.044, 0.044, s * 0.274, 0.000], [0.780, 0.022, 0.052, 0.052, s * 0.284, 0.005],
        [0.757, 0.021, 0.051, 0.050, s * 0.286, 0.009]], K.w.bone('hand' + S), { n: 16 });
      // his leather wrist cuff
      K.shell('cuff', [[0.912, 0.036, 0.036, 0.036, fx(0.912), -0.008], [0.858, 0.034, 0.034, 0.034, fx(0.858), -0.008]], K.w.bone('farm' + S), { n: 14 });
    }
    // ---- the belt, over the bottom of the corset and the top of the trousers ----
    K.shell('belt', [[0.998, 0.153, 0.126, 0.117], [0.948, 0.173, 0.129, 0.126]], K.w.hips, { n: 28 });
    // the pouch on his right hip, and the scroll strapped beside it, pointing forward (it moves with his right thigh)
    K.ball('pouch', [-0.168, 0.872, 0.088], [0.048, 0.058, 0.036], K.w.hips);
    K.tube('scroll', [[-0.150, 0.815, 0.100], [-0.095, 0.792, 0.190], [-0.040, 0.770, 0.278]], [0.021, 0.021, 0.021], K.w.bone('thighR'), 10);
    // ---- his head: long hair falling past his shoulders, and the hat (his beard is in his face picture) ----
    K.shell('hair', [[1.656, 0.012, 0.014, 0.014, 0, -0.004], [1.646, 0.046, 0.056, 0.058, 0, -0.004], [1.626, 0.069, 0.086, 0.084], [1.604, 0.078, 0.097, 0.095], [1.585, 0.081, 0.097, 0.099]], K.w.head, { n: 22 });      // a cap of hair over his skull, which shows under the brim from behind
    K.panel('hair', [[1.592, 0.082, 0.094, 0.099], [1.540, 0.086, 0.094, 0.105], [1.490, 0.092, 0.086, 0.112], [1.440, 0.099, 0.075, 0.118], [1.400, 0.106, 0.066, 0.122]], 76, 284, K.w.hair, { n: 20 });      // tucked behind his ears, as he wears it
    K.panel('hair', [[1.420, 0.108, 0.062, 0.122], [1.360, 0.116, 0.060, 0.136], [1.310, 0.112, 0.060, 0.150], [1.270, 0.096, 0.060, 0.156]], 100, 260, K.w.hair, { n: 16 });
    // the hat: tipped back 20 degrees on his head, about a point just above his brows. Rings are made in the hat's own frame
    // (u across, v up its middle, w forward) and turned into place
    const T = 20 * rad, HC = [0, 1.560, -0.010], at = (u, v, w) => [HC[0] + u, HC[1] + v * Math.cos(T) + w * Math.sin(T), HC[2] - v * Math.sin(T) + w * Math.cos(T)];
    const ring = (v, hw, df, db, n, droop, cu, cw) => { const r = []; for (let j = 0; j < n; j++) { const a = (j / n) * 2 * Math.PI, sa = Math.sin(a), ca = Math.cos(a); r.push(at((cu || 0) + hw * sa, v - (droop || 0) * sa * sa, (cw || 0) + (ca >= 0 ? df : db) * ca)); } return r; };
    const HN = 30, hatPart = (key, rings, o) => K.addPart('p_' + key, K.loft(rings, o || {}), K.w.head, { out: K.V3(HC[0], HC[1] + 0.06, HC[2]) });
    hatPart('brim', [ring(0.000, 0.093, 0.113, 0.113, HN, 0), ring(-0.004, 0.140, 0.150, 0.138, HN, 0.012), ring(-0.010, 0.198, 0.192, 0.162, HN, 0.034)]);      // the brim, drooping at the sides. One plain felt colour: read off the sheet its underside picked up whatever is behind it
    hatPart('hat', [ring(0.000, 0.093, 0.113, 0.113, HN, 0), ring(0.032, 0.088, 0.106, 0.106, HN, 0), ring(0.065, 0.077, 0.092, 0.092, HN, 0, 0.004), ring(0.095, 0.062, 0.073, 0.073, HN, 0, 0.012),
      ring(0.118, 0.046, 0.054, 0.054, HN, 0, 0.022)], { capB: false });
    // the point of the crown, bent over to his left
    K.tube('hat', [at(0.022, 0.116, 0), at(0.040, 0.142, 0.004), at(0.072, 0.150, 0.006), at(0.106, 0.134, 0.006), at(0.132, 0.104, 0.004)], [0.046, 0.034, 0.024, 0.014, 0.006], K.w.head, 12);
    // his short beard along the jaw, ear to ear. The face picture has his beard round the mouth and on the chin, but the template's
    // face stops at the jaw, so this shell carries it round. Each row is the template's own jaw (measured, npc/README) a few mm out;
    // in front, above the chin, the shell sinks just inside the face so his mouth stays open. Angles -105 to 105 degrees, 0 his front
    const BEARD = [[1.5, [0.0693, 0.0703, 0.0714, 0.062, 0.0712, 0.0779, 0.0816, 0.0964, 0.0816, 0.0779, 0.0712, 0.062, 0.0714, 0.0703, 0.0693]], [1.475, [0.0633, 0.0661, 0.0696, 0.0718, 0.0653, 0.0753, 0.0853, 0.0922, 0.0853, 0.0753, 0.0653, 0.0718, 0.0696, 0.0661, 0.0633]], [1.45, [0.055, 0.051, 0.0567, 0.0629, 0.0703, 0.0815, 0.0798, 0.0864, 0.0798, 0.0815, 0.0703, 0.0629, 0.0567, 0.051, 0.055]], [1.425, [0.0491, 0.0491, 0.0484, 0.0477, 0.0581, 0.0684, 0.0915, 0.099, 0.0915, 0.0684, 0.0581, 0.0477, 0.0484, 0.0491, 0.0491]], [1.405, [0.048, 0.048, 0.049, 0.051, 0.057, 0.066, 0.076, 0.08, 0.076, 0.066, 0.057, 0.051, 0.049, 0.048, 0.048]], [1.392, [0.047, 0.0464, 0.0459, 0.0453, 0.0447, 0.0441, 0.0436, 0.043, 0.0436, 0.0441, 0.0447, 0.0453, 0.0459, 0.0464, 0.047]]];
    const brings = BEARD.map(([y, rr]) => rr.map((r, j) => { const a = (-105 + 15 * j) * rad; return [r * Math.sin(a), y, r * Math.cos(a)]; }));
    K.addPart('p_beard', K.loft(brings, { open: true }), K.w.head, { out: K.V3(0, 1.44, 0) });
    // ---- his glasses: black rectangular frames, on the template's face (the template head is the Jester's, his is the same head) ----
    const G = { cx: 0.0325, cy: 1.5232, hw: 0.0247, hh: 0.0143, z: 0.096, wrap: 0.10, r: 0.0026 };
    const gz = (x) => G.z - G.wrap * Math.max(0, Math.abs(x) - 0.012);
    for (const sg of [-1, 1]) {
      const rim = []; for (let i = 0; i <= 12; i++) { const t = (i / 12) * 2 * Math.PI, c = Math.cos(t), sn = Math.sin(t), q = (v) => Math.sign(v) * Math.pow(Math.abs(v), 0.43);
        const x = sg * (G.cx + G.hw * q(c)); rim.push([x, G.cy + G.hh * q(sn), gz(x) + 0.001]); }
      K.tube('glasses', rim, rim.map(() => G.r), K.w.head, 4);
      const xo = G.cx + G.hw + 0.0015;
      K.tube('glasses', [[sg * xo, G.cy + 0.009, gz(xo)], [sg * 0.068, G.cy + 0.008, 0.040], [sg * 0.074, G.cy + 0.004, 0.004]], [0.0024, 0.0022, 0.0020], K.w.head, 4);
    }
    K.tube('glasses', [[-0.009, G.cy + 0.006, G.z + 0.001], [0, G.cy + 0.008, G.z + 0.003], [0.009, G.cy + 0.006, G.z + 0.001]], [0.0026, 0.0026, 0.0026], K.w.head, 4);
  },
};
