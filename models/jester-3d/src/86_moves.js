  // ---------- body moves: stances she holds (kneel, squat, sit), a jump, and talking with her hands ----------
  // Stances are keyed from standing (t = 0) to the held pose; standing up plays them backwards. Hands, feet and hips are in root space, in meters.

  // Kneel: a short step forward with the left foot, then down onto the right knee, left forearm across the raised knee
  defStance('kneel', 1.35, [
    { t: 0.22, hip: [-0.012, -0.02, 0.02], ftL: [0.01, 0.05, 0.12, 0.12, -0.15] },
    { t: 0.42, hip: [0, -0.06, 0.03], ftL: [0.02, 0, 0.26, 0.12, 0], ftR: [-0.01, 0.03, -0.06, -0.10, 0.45], sp: [0, 0.08, 0] },
    { t: 0.88, hip: [0, -0.30, -0.04], ftR: [-0.02, 0.045, -0.36, -0.08, 1.0], sp: [0, 0.16, 0], hd: [0, -0.06, 0], hL: [0.17, 0.70, 0.27], eL: [1, -0.4, -0.3], hR: [-0.29, 0.60, 0.04] },
    { t: 1.35, hip: [0, -0.375, -0.06], ftR: [-0.02, 0.04, -0.455, -0.08, 1.15], sp: [0, 0.05, 0], hd: [0, 0, 0], hL: [0.118, 0.590, 0.285], twL: 0.2, fL: FP.soft, wrL: [0.35, 0], hR: [-0.285, 0.50, 0.03], knR: [-0.10, 0, 1], knL: [0.10, 0, 1] }
  ]);

  // Squat: down on the balls of her feet, knees apart, forearms resting on her knees
  defStance('squat', 0.95, [
    { t: 0.40, hip: [0, -0.26, -0.07], sp: [0, 0.30, 0], hd: [0, -0.18, 0], ftR: [-0.02, 0.012, 0, -0.28, 0.2], ftL: [0.02, 0.012, 0, 0.28, 0.2], knR: [-0.45, 0, 1], knL: [0.45, 0, 1], hR: [-0.27, 0.68, 0.24], hL: [0.27, 0.68, 0.24] },
    { t: 0.95, hip: [0, -0.50, -0.10], sp: [0, 0.40, 0], hd: [0, -0.30, 0], ftR: [-0.04, 0.035, 0, -0.42, 0.5], ftL: [0.04, 0.035, 0, 0.42, 0.5], knR: [-0.55, 0, 1], knL: [0.55, 0, 1],
      hR: [-0.13, 0.43, 0.30], hL: [0.13, 0.43, 0.30], eR: [-1, -0.1, -0.2], eL: [1, -0.1, -0.2], wrR: [0.3, 0], wrL: [0.3, 0] }
  ]);

  // Sit on a stool: she folds forward, lowers herself back onto it, then sits up with her hands in her lap
  const STOOL_Z = -0.36, STOOL_TOP = 0.452;
  defStance('sit_chair', 1.55, [
    { t: 0.45, hip: [0, -0.10, -0.12], sp: [0, 0.34, 0], hd: [0, -0.16, 0], hR: [-0.27, 0.78, 0.12], hL: [0.27, 0.78, 0.12] },
    { t: 0.95, hip: [0, -0.29, -0.31], sp: [0, 0.36, 0], hd: [0, -0.20, 0], hR: [-0.17, 0.68, 0.10], hL: [0.17, 0.68, 0.10] },
    { t: 1.12, hip: [0, -0.315, -0.34], sp: [0, 0.22, 0] },
    { t: 1.55, sp: [0, -0.02, 0], hd: [0, 0, 0], hR: [-0.105, 0.615, -0.10], hL: [0.105, 0.615, -0.10], fR: FP.soft, fL: FP.soft, wrR: [0.2, 0], wrL: [0.2, 0], knR: [-0.03, 0, 1], knL: [0.03, 0, 1],
      ftR: [0.02, 0, 0.03, -0.04, 0], ftL: [-0.02, 0, 0.03, 0.04, 0] }
  ], { rise: 1.25 });

  // Sit on the ground, legs crossed: down through a squat, hands to the floor, then she settles and folds her legs
  defStance('sit_ground', 1.75, [
    { t: 0.45, hip: [0, -0.30, -0.08], sp: [0, 0.34, 0], hd: [0, -0.20, 0], knR: [-0.5, 0, 1], knL: [0.5, 0, 1], ftR: [-0.03, 0.02, 0, -0.35, 0.3], ftL: [0.03, 0.02, 0, 0.35, 0.3], hR: [-0.25, 0.60, 0.22], hL: [0.25, 0.60, 0.22] },
    { t: 0.85, hip: [0, -0.52, -0.14], sp: [0, 0.42, 0], hd: [0, -0.30, 0], knR: [-0.8, 0.1, 0.8], knL: [0.8, 0.1, 0.8], ftR: [-0.04, 0.035, 0.02, -0.5, 0.5], ftL: [0.04, 0.035, 0.02, 0.5, 0.5],
      hR: [-0.30, 0.20, -0.02], hL: [0.30, 0.20, -0.02], fR: FP.open, fL: FP.open },
    { t: 1.20, hip: [0, -0.725, -0.24], sp: [0, 0.30, 0], hd: [0, -0.20, 0], knR: [-1, 0.35, 0.3], knL: [1, 0.25, 0.3], ftR: [0.06, 0.02, 0.07, 0.2, 0.6, 0, 0.5], ftL: [-0.08, -0.03, 0.10, -0.2, 0.6, 0, 0.5],
      hR: [-0.32, 0.06, -0.20], hL: [0.32, 0.06, -0.20] },
    { t: 1.75, hip: [0, -0.725, -0.22], sp: [0, 0.08, 0], hd: [0, -0.04, 0], ftR: [0.15, 0.045, 0.10, 0, 0.8, 0, 1], ftL: [-0.17, -0.055, 0.12, 0, 0.8, 0, 1], knR: [-1, 0.4, 0.3], knL: [1, 0.2, 0.3],      // the right shin rests across the left; each foot follows its own shin
      hR: [-0.27, 0.27, 0.07], hL: [0.27, 0.27, 0.07], fR: FP.relax, fL: FP.relax, wrR: [0.3, 0], wrL: [0.3, 0], eR: [-1, -0.2, -0.4], eL: [1, -0.2, -0.4] }
  ], { rise: 1.1 });

  // Jump: a crouch, a leap with her arms thrown up, a soft landing. The flight follows a real arc.
  (function () {
    const T0 = 0.46, AIR = 0.62, H = 0.46, g = 8 * H / (AIR * AIR), v0 = g * AIR / 2, keys = [];
    keys.push({ t: 0.30, hip: [0, -0.21, -0.04], sp: [0, 0.36, 0], hd: [0, -0.22, 0], hR: [-0.30, 0.70, -0.20], hL: [0.30, 0.70, -0.20], eR: [-0.3, 0.2, -1], eL: [0.3, 0.2, -1], fR: FP.soft, fL: FP.soft, knR: [-0.2, 0, 1], knL: [0.2, 0, 1] });
    keys.push({ t: T0, hip: [0, 0.035, 0], sp: [0, -0.04, 0], hd: [0, -0.10, 0], hR: [-0.27, 1.32, 0.26], hL: [0.27, 1.32, 0.26], eR: [-0.6, -1, -0.3], eL: [0.6, -1, -0.3], ftR: [0, 0.075, 0, -0.10, 0.75], ftL: [0, 0.075, 0, 0.10, 0.75], mouth: 1 });
    for (let i = 1; i <= 6; i++) {
      const u = i / 7, ta = u * AIR, y = v0 * ta - 0.5 * g * ta * ta, tuck = Math.sin(PI * u), up = sm(0, 0.45, u), dn = sm(0.6, 1, u);
      const hx = lerp(0.27, 0.37, up) - 0.03 * dn, hy = lerp(1.32, 1.70, up) - 0.62 * dn + y, hz = lerp(0.26, 0.06, up) + 0.08 * dn;
      keys.push({ t: T0 + ta, hip: [0, 0.035 * (1 - u) - 0.03 * u + y, 0], sp: [0, -0.06 * tuck, 0], hd: [0, -0.10 - 0.16 * tuck, 0], hR: [-hx, hy, hz], hL: [hx, hy + 0.02, hz], fR: FP.open, fL: FP.open,
        ftR: [-0.015 * tuck, 0.075 * (1 - u) + y + 0.17 * tuck, -0.07 * tuck, -0.10, 0.80 - 0.45 * dn], ftL: [0.015 * tuck, 0.075 * (1 - u) + y + 0.13 * tuck, 0.03 * tuck, 0.10, 0.80 - 0.45 * dn] });
    }
    const TL = T0 + AIR;
    keys.push({ t: TL, hip: [0, -0.03, 0], sp: [0, 0.06, 0], hd: [0, -0.05, 0], hR: [-0.34, 1.02, 0.16], hL: [0.34, 1.02, 0.16], ftR: [0, 0, 0, -0.10, 0.12], ftL: [0, 0, 0, 0.10, 0.12], mouth: 2 });
    keys.push({ t: TL + 0.17, hip: [0, -0.20, -0.03], sp: [0, 0.30, 0], hd: [0, -0.18, 0], hR: [-0.32, 0.78, 0.18], hL: [0.32, 0.78, 0.18], fR: FP.soft, fL: FP.soft, ftR: 'rest', ftL: 'rest', eR: 'rest', eL: 'rest' });
    keys.push({ t: TL + 0.55, hip: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], hR: 'rest', hL: 'rest', knR: 'rest', knL: 'rest' });
    keys.push({ t: TL + 0.62, mouth: 0 });
    defAction('jump', TL + 0.78, keys, { stand: true, outro: 0.2, hits: [TL / (TL + 0.78)], cues: [0.30 / (TL + 0.78), T0 / (TL + 0.78)] });
  })();

  // Talk: ten seconds of chatter with her hands. Only her arms, head and face move, so it plays over any stance, or as she walks.
  (function () {
    const eD = (s) => [s * 0.6, -1, -0.3], keys = [
      { t: 0.40, hR: [-0.24, 1.08, 0.27], hL: [0.24, 1.08, 0.27], eR: eD(-1), eL: eD(1), twR: 1.25, twL: 1.25, fR: FP.soft, fL: FP.soft, wrR: [-0.1, 0], wrL: [-0.1, 0], hd: [0.05, 0.02, 0.06] },       // well, you see
      { t: 0.85, hR: [-0.26, 1.05, 0.28], hL: [0.26, 1.05, 0.28], hd: [0.02, 0.05, 0.03] },
      { t: 1.30, hR: [-0.19, 1.31, 0.25], fR: FP.point, twR: 0.45, wrR: [0.1, 0], hL: [0.25, 0.97, 0.13], twL: 0.3, fL: FP.relax, hd: [-0.06, -0.03, -0.04], sp: [-0.04, 0, 0] },                       // one thing
      { t: 1.55, hR: [-0.19, 1.28, 0.27] }, { t: 1.80, hR: [-0.19, 1.32, 0.25] },
      { t: 2.45, hR: [-0.50, 1.15, 0.17], fR: FP.open, twR: 1.35, wrR: [-0.2, 0], eR: [-0.5, -1, -0.4], hd: [-0.24, 0, 0.03], sp: [-0.10, 0, 0.02] },                                                // over there
      { t: 3.05, hR: [-0.47, 1.12, 0.18], hd: [-0.16, 0.03, 0.03] },
      { t: 3.55, hR: [-0.075, 1.20, 0.175], hL: [0.075, 1.165, 0.175], fR: FP.soft, fL: FP.soft, twR: 0.2, twL: 0.2, wrR: [0.35, 0], wrL: [0.35, 0], eR: eD(-1), sh: [0.08, 0.08], hd: [0.03, 0.06, -0.07], sp: [0, 0.03, 0] },   // me?
      { t: 4.10, hR: [-0.075, 1.19, 0.175], hL: [0.075, 1.16, 0.175], hd: [0.05, 0.03, -0.09] },
      { t: 4.55, hR: [-0.37, 1.10, 0.21], hL: [0.37, 1.10, 0.21], twR: 1.4, twL: 1.4, fR: FP.open, fL: FP.open, wrR: [-0.25, 0], wrL: [-0.25, 0], sh: [0.22, 0.22], hd: [0, 0.02, 0.13], sp: [0, 0, 0.03] },                       // who can say
      { t: 5.05, hR: [-0.36, 1.07, 0.21], hL: [0.36, 1.07, 0.21], sh: [0.05, 0.05], hd: [0, 0, 0.05] },
      { t: 5.55, hL: [0.30, 1.24, 0.25], twL: 0.5, fL: FP.soft, wrL: [-0.45, 0], hR: [-0.26, 0.98, 0.12], twR: 0.3, fR: FP.relax, wrR: [0.1, 0], sh: [0, 0], hd: [0.12, 0, 0], sp: [0.05, 0, 0] },                                   // never mind that
      { t: 5.80, wrL: [0.55, 0], hL: [0.33, 1.22, 0.27] }, { t: 6.05, wrL: [-0.4, 0], hL: [0.30, 1.24, 0.25] }, { t: 6.30, wrL: [0.5, 0], hL: [0.33, 1.21, 0.27] },
      { t: 6.85, hL: [0.085, 1.10, 0.27], twL: 1.35, fL: FP.open, wrL: [-0.15, 0], hR: [-0.015, 1.175, 0.275], fR: FP.point, twR: 0.2, wrR: [0.2, 0], hd: [0.04, 0.16, 0], sp: [0, 0.04, 0] },                                      // first, second, third
      { t: 7.05, hR: [-0.005, 1.145, 0.285] }, { t: 7.25, hR: [-0.03, 1.18, 0.275] }, { t: 7.45, hR: [0.02, 1.145, 0.29] }, { t: 7.65, hR: [-0.03, 1.18, 0.275] }, { t: 7.85, hR: [0.045, 1.145, 0.295] },
      { t: 8.45, hR: [-0.105, 1.395, 0.125], fR: FP.soft, twR: 0.9, wrR: [0.1, 0], eR: [-0.3, -1, 0.3], hL: [0.24, 0.98, 0.12], fL: FP.relax, twL: 0.2, wrL: [0.1, 0], sp: [0.06, 0.12, 0], hd: [0.16, 0.06, 0], eyes: 0.4 },    // a secret
      { t: 9.15, hR: [-0.105, 1.39, 0.13], sp: [0.06, 0.13, 0], eyes: 0.4 },
      { t: 9.75, hR: [-0.52, 1.21, 0.13], hL: [0.52, 1.21, 0.13], fR: FP.open, fL: FP.open, twR: 1.3, twL: 1.3, wrR: [-0.2, 0], wrL: [-0.2, 0], eR: [-0.5, -1, -0.4], eL: [0.5, -1, -0.4], sp: [0, -0.04, 0], hd: [0, -0.08, 0], eyes: 0 },   // and there you have it
      { t: 10.35, hR: [-0.50, 1.18, 0.14], hL: [0.50, 1.18, 0.14] }
    ];
    // her mouth: bursts of syllables, with a breath between phrases and a smile at the end of some
    const phrases = [[0.35, 1.15, 0], [1.3, 2.25, 0], [2.45, 3.3, 2], [3.55, 4.3, 0], [4.55, 5.3, 2], [5.55, 6.6, 0], [6.9, 8.0, 0], [8.5, 9.4, 2], [9.75, 10.3, 2]];
    let n = 0;
    for (const [a, b, endv] of phrases) {
      let t = a; keys.push({ t: t - 0.06, mouth: 0 });
      while (t < b - 0.12) { const d = 0.11 + 0.10 * h1(n * 3.7 + 1); keys.push({ t: t, mouth: 1 }); keys.push({ t: t + d * 0.55, mouth: 1 }); keys.push({ t: Math.min(b - 0.02, t + d), mouth: 0 }); t += d + 0.05 + 0.07 * h1(n * 5.3 + 2); n++; }
      keys.push({ t: b, mouth: endv }); keys.push({ t: b + 0.16, mouth: endv });
    }
    keys.push({ t: 10.9, mouth: 2 });
    defAction('talk', 11.4, keys, { outro: 0.7, cues: [1.3 / 11.4, 9.75 / 11.4] });
  })();

  // ---------- more moves for a performer: a wave, a deep bow, a twirl, a laugh, a jig, and two small things she does when left alone ----------
  defAction('wave', 2.7, [
    { t: 0.35, hR: [-0.36, 1.50, 0.12], eR: [-1, -0.5, -0.2], fR: FP.open, twR: -0.5, wrR: [-0.15, 0.35], hd: [-0.10, -0.04, -0.08], sp: [-0.05, 0, -0.03], mouth: 2 },
    { t: 0.62, hR: [-0.42, 1.52, 0.12], wrR: [-0.15, -0.4] }, { t: 0.89, hR: [-0.33, 1.52, 0.12], wrR: [-0.15, 0.4] }, { t: 1.16, hR: [-0.42, 1.52, 0.12], wrR: [-0.15, -0.4] },
    { t: 1.43, hR: [-0.33, 1.52, 0.12], wrR: [-0.15, 0.4] }, { t: 1.70, hR: [-0.42, 1.52, 0.12], wrR: [-0.15, -0.4] }, { t: 1.97, hR: [-0.36, 1.50, 0.12], wrR: [-0.15, 0.2], mouth: 2 },
    { t: 2.45, mouth: 0 }
  ], { outro: 0.6 });
  defAction('bow', 3.4, [
    { t: 0.45, hL: [0.52, 1.22, 0.10], eL: [0.4, -1, -0.5], fL: FP.open, twL: 1.2, hR: [-0.34, 1.16, 0.22], eR: [-0.6, -1, -0.3], fR: FP.open, twR: 1.2, ftR: [0.0, 0.03, -0.10, -0.2, 0.3], sp: [0, -0.05, 0], hd: [0, -0.08, 0], mouth: 2 },
    { t: 0.80, ftR: [0.02, 0.012, -0.26, -0.3, 0.4], hip: [0, -0.02, -0.02] },
    { t: 1.30, hip: [0, -0.07, -0.09], hipR: [0, 0.30, 0], sp: [0, 0.78, 0], hd: [0, 0.30, 0], hR: [0.07, 0.86, 0.33], eR: [-1, -0.2, 0.3], fR: FP.soft, twR: 0.2, wrR: [0.3, 0], hL: [0.60, 1.00, -0.16], eL: [0.6, 0.6, -1], twL: 0.6, knL: [0.14, 0, 1], eyes: 1, mouth: 0 },
    { t: 2.05, hip: [0, -0.07, -0.09], hipR: [0, 0.30, 0], sp: [0, 0.76, 0], hd: [0, 0.26, 0], hR: [0.07, 0.87, 0.33], hL: [0.60, 1.01, -0.16], eyes: 1 },
    { t: 2.65, hip: [0, 0, 0], hipR: [0, 0, 0], sp: [0, -0.04, 0], hd: [0, -0.06, 0], hR: [-0.40, 1.20, 0.16], eR: [-0.6, -1, -0.3], fR: FP.open, twR: 1.2, wrR: [-0.2, 0], hL: [0.40, 1.20, 0.16], eL: [0.6, -1, -0.3], twL: 1.2, ftR: [0, 0.02, -0.10, -0.15, 0.2], eyes: 0, mouth: 2 },
    { t: 3.05, ftR: 'rest', knL: 'rest', mouth: 2 }
  ], { outro: 0.4, stand: true });
  // Twirl: two full turns on the ball of her right foot, the left foot drawn up to her knee; her skirts and veils fly out on their own
  defAction('twirl', 2.7, [
    { t: 0.32, hip: [0.02, -0.05, 0], hR: [-0.50, 1.20, 0.10], hL: [0.50, 1.20, 0.10], eR: [-0.4, -1, -0.5], eL: [0.4, -1, -0.5], fR: FP.open, fL: FP.open, twR: 0.6, twL: 0.6, sp: [-0.14, 0.04, 0], hd: [0.15, 0, 0], knR: [-0.2, 0, 1], knL: [0.2, 0, 1] },
    { t: 0.52, hip: [-0.004, 0.035, 0], ftR: [0.077, 0.055, 0.012, 0.10, 0.62], ftL: [-0.085, 0.33, 0.07, 0.25, 0.95], knL: [1, 0, 0.7], knR: [0, 0, 1], hR: [-0.17, 1.24, 0.21], hL: [0.17, 1.22, 0.21], eR: [-1, -0.4, -0.2], eL: [1, -0.4, -0.2], fR: FP.soft, fL: FP.soft, sp: [0, -0.03, 0], hd: [0, -0.06, 0], mouth: 2 },
    { t: 1.62, hip: [-0.004, 0.035, 0], ftR: [0.077, 0.055, 0.012, 0.10, 0.62], ftL: [-0.085, 0.33, 0.07, 0.25, 0.95], hR: [-0.17, 1.24, 0.21], hL: [0.17, 1.22, 0.21] },
    { t: 1.95, hip: [0, -0.04, 0], ftR: 'rest', ftL: [0.03, 0, 0.05, 0.3, 0], knL: 'rest', knR: 'rest', hR: [-0.54, 1.30, 0.06], hL: [0.54, 1.30, 0.06], eR: [-0.4, -1, -0.5], eL: [0.4, -1, -0.5], fR: FP.open, fL: FP.open, twR: 1.2, twL: 1.2, sp: [0, -0.06, 0], hd: [0, -0.10, 0], mouth: 2 },
    { t: 2.35, hip: [0, 0, 0], hR: [-0.50, 1.24, 0.08], hL: [0.50, 1.24, 0.08], ftL: 'rest', mouth: 2 }
  ], { outro: 0.3, stand: true, spin: [[0, 0], [0.34, -0.5], [0.56, 0.6], [1.10, 6.9], [1.62, 12.0], [1.92, TAU * 2], [2.7, TAU * 2]] });
  (function () {
    const keys = [{ t: 0.25, hd: [0, -0.20, 0.05], sp: [0, -0.07, 0], hL: [0.09, 1.02, 0.17], eL: [1, -0.3, -0.2], fL: FP.soft, wrL: [0.3, 0], hR: [-0.20, 1.34, 0.20], eR: [-1, -0.6, -0.1], fR: FP.soft, twR: 0.7, eyes: 0.85, mouth: 1 }];
    for (let i = 0; i < 9; i++) { const t = 0.38 + i * 0.17, up = i % 2; keys.push({ t, sh: up ? [0.16, 0.16] : [0.02, 0.02], sp: [0, -0.07 + (up ? 0.035 : 0) + 0.012 * i, 0], hd: [0.03 * (up ? 1 : -1), -0.20 + 0.02 * i + (up ? 0.03 : 0), 0.05], mouth: up ? 1 : 2, eyes: 0.85 }); }
    keys.push({ t: 2.05, sh: [0, 0], sp: [0, 0.05, 0], hd: [0, 0.05, 0.03], hR: [-0.11, 1.40, 0.13], mouth: 2, eyes: 0.5 }, { t: 2.5, mouth: 2, eyes: 0 });
    defAction('laugh', 2.9, keys, { outro: 0.5 });
  })();
  // A jig: hop from foot to foot, the free foot kicking across, hands on her hips, then arms up to finish
  (function () {
    const keys = [], B = 0.34, N = 10, hipsR = [-0.20, 1.01, 0.05], hipsL = [0.20, 1.01, 0.05];
    keys.push({ t: 0.2, hR: hipsR, hL: hipsL, eR: [-1, -0.1, -0.5], eL: [1, -0.1, -0.5], fR: FP.loose || FP.soft, fL: FP.loose || FP.soft, wrR: [0.5, 0], wrL: [0.5, 0], hip: [0, -0.05, 0], mouth: 2 });
    for (let i = 0; i < N; i++) {
      const t = 0.36 + i * B, sd = i % 2 ? 1 : -1, hi = i % 4 >= 2 ? 1 : 0;           // sd: which foot kicks (−1 right)
      const kick = [sd * -0.07, 0.17 + 0.10 * hi, 0.20 + 0.06 * hi, sd * -0.2, 0.5], stand = [sd * -0.02, 0.0, -0.02, sd * -0.1, 0];
      keys.push({ t: t - B * 0.5, hip: [sd * -0.015, 0.045, 0], ftR: [0, 0.06, 0, -0.1, 0.55], ftL: [0, 0.06, 0, 0.1, 0.55] });            // in the air between steps
      keys.push({ t, hip: [sd * 0.03, -0.045, 0], hipR: [sd * -0.10, 0, sd * 0.05], sp: [sd * 0.14, 0.02, sd * -0.06], hd: [sd * -0.08, 0, sd * 0.07], ['ft' + (sd < 0 ? 'R' : 'L')]: kick, ['ft' + (sd < 0 ? 'L' : 'R')]: stand, ['kn' + (sd < 0 ? 'R' : 'L')]: [sd * -0.25, 0, 1] });
    }
    const te = 0.36 + N * B;
    keys.push({ t: te - B * 0.5, hip: [0, 0.05, 0], ftR: [0, 0.07, 0, -0.1, 0.55], ftL: [0, 0.07, 0, 0.1, 0.55] });
    keys.push({ t: te + 0.05, hip: [0, -0.06, 0], hipR: [0, 0, 0], sp: [0, -0.05, 0], hd: [0, -0.10, 0], ftR: [-0.05, 0, 0, -0.3, 0], ftL: [0.05, 0, 0, 0.3, 0], knR: 'rest', knL: 'rest', hR: [-0.46, 1.42, 0.08], hL: [0.46, 1.42, 0.08], eR: [-0.4, -1, -0.5], eL: [0.4, -1, -0.5], fR: FP.open, fL: FP.open, twR: 0.8, twL: 0.8, wrR: [0, 0], wrL: [0, 0], mouth: 2 });
    keys.push({ t: te + 0.55, hip: [0, 0, 0], hR: [-0.46, 1.40, 0.08], hL: [0.46, 1.40, 0.08], mouth: 2 });
    defAction('dance', te + 1.05, keys, { outro: 0.4, stand: true });
  })();
  defAction('look_around', 3.2, [
    { t: 0.5, hd: [0.45, -0.03, 0.03], sp: [0.10, 0, 0], eyes: 0.1 }, { t: 1.1, hd: [0.48, -0.05, 0.04], sp: [0.11, 0, 0] },
    { t: 1.8, hd: [-0.42, 0.02, -0.03], sp: [-0.10, 0, 0] }, { t: 2.4, hd: [-0.44, -0.02, -0.04], sp: [-0.10, 0, 0] }
  ], { outro: 0.7 });
  defAction('settle', 3.6, [
    { t: 0.8, hip: [0.035, -0.012, 0], hipR: [0, 0, -0.07], sp: [0, 0, 0.06], hd: [0.04, 0, -0.04], knL: [0.30, 0, 1], ftL: [0.02, 0.012, 0.03, 0.18, 0.18], hR: [-0.17, 1.03, 0.19], eR: [-1, -0.3, -0.3], fR: FP.soft, twR: 0.4 },
    { t: 1.5, hR: [-0.15, 1.05, 0.21], hL: [0.02, 1.06, 0.24], eL: [1, -0.5, -0.1], fL: FP.pinch || FP.soft, twL: 0.5, hd: [-0.06, 0.16, -0.03] },
    { t: 2.0, hL: [0.01, 1.03, 0.25] }, { t: 2.3, hL: [0.03, 1.07, 0.24] },
    { t: 2.9, hip: [0.035, -0.012, 0], hipR: [0, 0, -0.07], hd: [0.03, 0.02, -0.03] }
  ], { outro: 0.7 });

  // ---------- the stool she conjures to sit on ----------
  const stool = new THREE.Group(); stool.name = 'stool'; stool.visible = false; stool.position.set(0, 0, STOOL_Z); root.add(stool);
  (function () {
    const V2 = (x, y) => new THREE.Vector2(x, y), SEG = Q(48, 24);
    const wood = new THREE.MeshStandardMaterial({ color: lin(0x2e1c16), roughness: 0.46, envMapIntensity: 0.7 });
    const velvet = new THREE.MeshStandardMaterial({ map: fabricTex(256, '#6e1a3a', '#8e2a50', '#3c0c20', 3, false, 'wine'), roughness: 0.9 });
    const gold = new THREE.MeshStandardMaterial({ color: lin(0xd8a546), roughness: 0.3, metalness: 1, envMapIntensity: 1.6 });
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = m.receiveShadow = true; stool.add(m); return m; };
    add(new THREE.LatheGeometry([V2(0, 0.368), V2(0.150, 0.368), V2(0.176, 0.374), V2(0.186, 0.386), V2(0.186, 0.400), V2(0.176, 0.410), V2(0, 0.410)], SEG), wood);
    add(new THREE.LatheGeometry([V2(0.172, 0.408), V2(0.182, 0.416), V2(0.185, 0.428), V2(0.178, 0.440), V2(0.160, 0.448), V2(0.110, 0.452), V2(0, 0.4525)], SEG), velvet);
    add(new THREE.TorusGeometry(0.1815, 0.0048, 8, SEG), gold, 0, 0.411, 0).rotation.x = PI / 2;
    const leg = new THREE.LatheGeometry([V2(0, 0), V2(0.013, 0), V2(0.015, 0.02), V2(0.012, 0.05), V2(0.017, 0.12), V2(0.021, 0.16), V2(0.014, 0.19), V2(0.019, 0.25), V2(0.023, 0.30), V2(0.017, 0.345), V2(0.022, 0.375), V2(0, 0.375)], Q(14, 8));
    for (let k = 0; k < 3; k++) {
      const a = PI / 2 + k * TAU / 3, m = add(leg, wood, 0.172 * Math.cos(a), 0, 0.172 * Math.sin(a));
      m.rotation.set(-0.16 * Math.sin(a), 0, 0.16 * Math.cos(a));                 // splayed
      add(new THREE.SphereGeometry(0.0085, 10, 8), gold, 0.172 * Math.cos(a) + 0.0, 0.004, 0.172 * Math.sin(a));
    }
    add(new THREE.TorusGeometry(0.128, 0.0075, 8, SEG), wood, 0, 0.150, 0).rotation.x = PI / 2;
    add(new THREE.TorusGeometry(0.128, 0.0030, 6, SEG), gold, 0, 0.150, 0).rotation.x = PI / 2;
  })();
  let stoolWas = 0;
  function bodyTick(t, dt) {
    const on = !!stance && stance.name === 'sit_chair', k = on ? sm(0.02, 0.40, stance.t) : 0;
    stool.visible = k > 0.001;
    if (stool.visible) { const e = 1 - Math.pow(1 - k, 3), pop = 1 + 0.12 * Math.sin(PI * k) * (1 - k); stool.scale.set(e * pop, Math.max(0.02, e) * (2 - pop), e * pop); }
    SEAT.on = on && stance.t > 0.25;
    if (SEAT.on) { _va.set(0, 0, STOOL_Z).applyMatrix4(root.matrixWorld); SEAT.x = _va.x; SEAT.z = _va.z; SEAT.top = _va.y + STOOL_TOP + 0.006; SEAT.r = 0.196; }
    if (typeof burst === 'function' && ((k > 0.02 && stoolWas <= 0.02) || (k < 0.5 && stoolWas >= 0.5 && on && stanceTo !== 'sit_chair'))) {      // it arrives, and leaves, in a puff of violet
      _va.set(0, 0.30, STOOL_Z).applyMatrix4(root.matrixWorld); burst(_va, 46, 0.9, 0.9, 0.05, COL.violet, -0.2, 1.6, 0.3); burst(_va, 20, 0.5, 0.8, 0.06, COL.pale, 0, 1.4, 0.3); shock(_va, 0.05, 0.42, 0.45, COL.violet, true);
    }
    stoolWas = k;
  }
