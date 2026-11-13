
  // ---------- the Fox's own everyday moves (13 Nov) ----------
  // Chris: "so it's like her talk and she's not the jester". She "would have different moves than bow twirl", and her own laugh and her own dance.
  // The Jester plays to the back row: big, even, both arms wide. The Fox is a trickster who sews. One hand is busy while the other idles on her pouch;
  // her moves are small and quick and close to her face, and then she is still; her head cocks like a fox listening; her fingers pinch a thread or snip it;
  // she never lets go of your eye; and she likes to make her bells ring. (Lore: lore/discussion-notes.md, "The Fox". The curtsey is the gesture of J4.)
  // Chris, 13 Nov, after trying them: her talk, laugh, dance, curtsey and pounce stay, and she keeps the Jester's bow and twirl as well (and the
  // Jester's wave and jump: "they're just waving"). The Jester's talk, laugh and dance are no longer on her page; they stay here under jester_
  // names only so the two can be played side by side while her moves are still being worked on.
  for (const n of ['talk', 'laugh', 'dance']) if (ACTS[n]) { ACTS['jester_' + n] = ACTS[n]; delete ACTS[n]; }
  (function foxMoves() {
    const SNIP_A = [0.62, 0.02, 0.05, 0.90, 0.93, 1.0], SNIP_B = [0.62, 0.07, 0.02, 0.90, 0.93, 0.0];       // two fingers as shears: open, shut
    const PINCH = [0.85, 0.72, 0.30, 0.16, 0.06, 0.9];                                                         // thumb and first finger closed on a thread, the others fanned
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr });      // everything about one arm
    const eD = (s) => [s * 0.7, -1, -0.2], mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    // Where a hand has to land on her (a fingertip on her glasses, her bell, her lips): worked out on the model with bench/contacts.js, for the lean and
    // head turn she has at that moment. If her head, neck or arms change size, run that again and paste the new numbers here.
    const POUCH_L = [0.20, 0.99, 0.19], GLASSES = [0.082, 1.396, 0.171], BELL = [-0.138, 1.381, 0.089], SHH = [0.075, 1.319, 0.171];
    const HIDE0 = [-0.036, 1.369, 0.220], HIDE1 = [-0.047, 1.325, 0.261], PEEK = [-0.114, 1.288, 0.165], DIP_SHH = [0.081, 1.153, 0.156];

    // Talk: she explains something with a thread that is not there. Only her arms, head and face move, so it plays over any stance, or as she walks.
    (function () {
      const LEAD = 0.10, keys = [], idleL = arm('L', POUCH_L, [1, -0.4, -0.3], FP.soft, 0.2, [0.3, 0]), idleR = arm('R', [-0.25, 1.00, 0.15], [-0.55, -0.1, -1], FP.relax, 0.2, [0.1, 0]);
      // A beat: she arrives in a pose at t and stays in it for len. Every beat names both arms, her head and her lean, so nothing starts drifting
      // toward the next beat early: quick, then still, is how she moves.
      const beat = (t, len, L, R, o) => { const k = Object.assign({ sp: [0, 0, 0], sh: [0, 0], eyes: 0 }, L, R, o); keys.push(Object.assign({ t }, k)); if (len > 0) keys.push(Object.assign({ t: t + len }, k)); };
      beat(0.35, 0.55, idleL, arm('R', [-0.20, 1.36, 0.19], eD(-1), FP.point, 0.5, [0.1, 0]), { hd: [0.06, 0.02, 0.14], sp: [0.04, 0, 0.02] });                       // now then: one finger up, head cocked
      keys.push({ t: 0.52, hR: [-0.21, 1.385, 0.20] }, { t: 0.70, hR: [-0.20, 1.35, 0.19] });
      beat(1.25, 0.10, idleL, arm('R', [-0.12, 1.33, 0.27], eD(-1), PINCH, 0.3, [-0.3, 0]), { hd: [-0.05, 0.06, 0.05], sp: [0, 0.03, 0] });                              // she finds a thread in the air
      beat(1.85, 0.20, idleL, arm('R', [-0.42, 1.28, 0.18], [-0.8, -0.8, -0.3], PINCH, 0.3, [-0.3, 0]), { hd: [-0.22, 0.03, -0.05], sp: [-0.07, 0.01, 0] });         // and draws it out
      const upL = arm('L', [0.26, 1.36, 0.28], eD(1), PINCH, 0.2, [0.5, 0]), look = { hd: [0.20, 0.04, -0.06], sp: [0.05, 0, 0] };
      beat(2.52, 0, upL, arm('R', [0.10, 1.25, 0.27], eD(-1), SNIP_A, 0.3, [0.25, 0.2]), look);                                                                       // holds it up by one end, off to her left
      keys.push({ t: 2.75, fR: SNIP_B }, { t: 2.92, fR: SNIP_A, hR: [0.10, 1.29, 0.27] }, { t: 3.09, fR: SNIP_B }, { t: 3.26, fR: SNIP_A });                           // snip, snip
      beat(3.38, 0, upL, arm('R', [0.10, 1.29, 0.27], eD(-1), SNIP_A, 0.3, [0.25, 0.2]), look);
      beat(3.92, 0.80, arm('L', [0.21, 1.10, 0.20], eD(1), FP.open, 1.35, [-0.25, 0]), arm('R', [-0.21, 1.10, 0.20], eD(-1), FP.open, 1.35, [-0.25, 0]), { sh: [0.20, 0.20], hd: [-0.03, 0.03, -0.16], eyes: 0.5 });   // who, me? small and close
      const push = (h) => arm('L', h, [0.8, -1, -0.2], FP.point, 0.5, [0.15, 0]);
      beat(5.15, 0, push([GLASSES[0], GLASSES[1] - 0.028, GLASSES[2] + 0.013]), idleR, { hd: [0, 0.08, 0.04] });                                                       // a fingertip under her glasses
      beat(5.40, 0.32, push(GLASSES), idleR, { hd: [0, 0.08, 0.04] });                                                                                                 // pushes them up
      beat(6.12, 0.58, idleL, idleR, { hd: [0.04, -0.02, 0.15] });                                                                                                     // and is still, looking at you
      const flick = (h) => arm('R', h, [-1, -0.3, 0.3], FP.point, 0.6, [0.6, 0.4]);
      beat(6.98, 0, idleL, flick([BELL[0] - 0.028, BELL[1], BELL[2] + 0.004]), { hd: [0, 0.05, -0.08] });                                                              // ding: a flick of her bell, twice
      keys.push({ t: 7.09, hR: BELL }, { t: 7.23, hR: [BELL[0] - 0.030, BELL[1] + 0.004, BELL[2] + 0.005] }, { t: 7.36, hR: BELL });
      beat(7.52, 0, idleL, flick([BELL[0] - 0.04, BELL[1] - 0.01, BELL[2] + 0.025]), { hd: [0, 0.05, -0.08] });
      const wag = (y) => arm('R', [-0.17, 1.37, 0.22], eD(-1), FP.point, 0.2, [0.1, y]);
      beat(8.00, 0, idleL, wag(0.35), { hd: [-0.05, 0.04, 0.06] });                                                                                                    // ah-ah-ah: a wagging finger
      keys.push({ t: 8.18, wrR: [0.1, -0.35], hd: [0.04, 0.04, 0.06] }, { t: 8.36, wrR: [0.1, 0.35], hd: [-0.04, 0.04, 0.06] }, { t: 8.54, wrR: [0.1, -0.35], hd: [0.04, 0.04, 0.06] });
      beat(8.72, 0, idleL, wag(0.2), { hd: [0, 0.04, 0.06] });
      beat(9.25, 0.75, arm('L', SHH, [0.8, -1, -0.2], FP.point, 0.4, [0.1, 0]), idleR, { sp: [0, 0.10, 0], hd: [0.04, -0.02, 0.08], eyes: 0.5 });                      // shh: a finger to her lips, leaning in
      beat(10.40, 0.40, arm('L', [0.34, 1.00, 0.15], [0.6, -1, -0.4], FP.open, 1.2, [-0.3, 0]), arm('R', [-0.34, 1.00, 0.15], [-0.6, -1, -0.4], FP.open, 1.2, [-0.3, 0]), { sp: [0, -0.02, 0], hd: [0, -0.04, -0.12] });   // and that is that
      // her mouth: quick bursts, and it stays shut while her hands do the talking (the glasses, the bell) and on the shh
      const mk = []; let n = 0;
      const say = (a, b, endv) => { let t = a; mk.push([t - 0.06, 0]); while (t < b - 0.12) { const d = 0.10 + 0.08 * h1(n * 4.1 + 3); mk.push([t, 1], [t + d * 0.55, 1], [Math.min(b - 0.02, t + d), 0]); t += d + 0.04 + 0.06 * h1(n * 6.7 + 5); n++; } mk.push([b, endv], [b + 0.16, endv]); };
      say(0.35, 1.0, 0); say(1.25, 2.2, 0); say(2.5, 2.72, 0);
      for (const t of [2.80, 3.16]) mk.push([t - 0.04, 0], [t, 1], [t + 0.12, 0]);                                // "snip"
      mk.push([3.50, 2]); say(3.95, 4.55, 2); mk.push([6.2, 2]); say(6.3, 6.8, 2); mk.push([7.6, 2]);
      for (const t of [7.98, 8.34, 8.70]) mk.push([t - 0.05, 0], [t, 1], [t + 0.13, 0]);                          // "ah, ah, ah"
      mk.push([9.20, 0], [9.30, 1], [9.70, 1], [9.85, 2]); say(10.40, 10.85, 2); mk.push([11.0, 2]);              // "shh"
      mk.sort((a, b) => a[0] - b[0]); let last = -1;
      for (const [t, v] of mk) if (t - last >= 0.03) { keys.push({ t, mouth: v }); last = t; }                     // two keys at one moment would stall the curve
      keys.sort((a, b) => a.t - b.t);
      for (const k of keys) k.t += LEAD;                                                                            // her first reach takes 0.45 s, not 0.35
      defAction('talk', 11.5 + LEAD, keys, { outro: 0.6, cues: [(2.75 + LEAD) / (11.5 + LEAD), (7.09 + LEAD) / (11.5 + LEAD)] });
    })();

    // Laugh: a snicker she tries to hide. Chin down and turned away, curled fingers over her mouth, the other arm across her middle; her shoulders
    // shake small and fast and she folds over it; she peeks to see how it landed, it gets away from her again, and she flicks it off with her fingers.
    (function () {
      const armL = { hL: [-0.06, 1.03, 0.17], eL: [1, -0.4, 0.3], fL: FP.soft, twL: 0.2 };
      const keys = [Object.assign({ t: 0.20, hd: [0.22, 0.14, -0.08], sp: [0.06, 0.06, 0], hR: HIDE0, eR: [-0.6, -1, -0.1], fR: FP.cup, twR: 0.6, wrR: [0.5, 0.3], eyes: 1, mouth: 2 }, armL)];
      for (let i = 0; i < 9; i++) {
        const t = 0.30 + i * 0.125, up = i % 2, k = i / 8;
        keys.push({ t, sh: up ? [0.13, 0.13] : [0.02, 0.02], sp: [0.06, lerp(0.06, 0.22, k) + (up ? 0.02 : 0), 0.03 * k + (up ? 0.012 : -0.012)], hd: [0.22, lerp(0.14, 0.24, k) + (up ? -0.02 : 0.015), -0.08],
          hR: mix3(HIDE0, HIDE1, k), hL: [-0.06, lerp(1.03, 1.01, k), lerp(0.17, 0.19, k)], eyes: 1, mouth: 2 });
      }
      keys.push({ t: 1.64, sh: [0, 0], sp: [0, 0.06, 0], hd: [-0.05, 0.02, 0.14], hR: PEEK, fR: FP.soft, twR: 0.9, wrR: [0.3, 0.2], hL: [-0.06, 1.03, 0.17], eyes: 0, mouth: 2 });       // the peek
      keys.push({ t: 1.98, hd: [-0.05, 0.02, 0.15], sp: [0, 0.06, 0], eyes: 0 });
      for (let i = 0; i < 4; i++) { const t = 2.08 + i * 0.125, up = i % 2; keys.push({ t, sh: up ? [0.11, 0.11] : [0.02, 0.02], sp: [0, 0.07 + (up ? 0.02 : 0), 0], hd: [-0.05, 0.05 + (up ? -0.02 : 0.02), 0.14], eyes: 0.9, mouth: 2 }); }
      keys.push({ t: 2.52, hR: PEEK, eR: [-0.6, -1, -0.1], fR: FP.soft, twR: 0.9, wrR: [0.3, 0.2] });
      keys.push({ t: 2.74, sh: [0, 0], sp: [0, 0, 0], hd: [0.03, -0.02, 0.08], hR: [-0.30, 1.20, 0.20], eR: [-0.7, -1, -0.3], fR: FP.open, twR: 0.3, wrR: [-0.35, 0.3], eyes: 0, mouth: 2 });   // oh, stop
      keys.push({ t: 2.90, wrR: [0.35, -0.2] }, { t: 3.05, mouth: 2 });
      for (const k of keys) k.t += 0.22;                                                                            // 0.42 s for her hand to reach her mouth: at 0.20 it was a whip (8 m/s)
      defAction('laugh', 3.62, keys, { outro: 0.45 });
    })();

    // Dance: she dances to ring her bells. Four slow swaying steps, her weight dropping onto one hip while the other foot points out and the far wrist
    // shakes up by her ear; a hop that turns her back to you, two bumps of her hips with a look over her shoulder; a hop back round into a pose.
    (function () {
      const keys = [], B = 0.48, T0 = 0.50, spin = [[0, 0]];
      const mid = (t, y) => keys.push({ t, hip: [0, y, 0], hipR: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest', hR: [-0.25, 1.30, 0.16], hL: [0.25, 1.30, 0.16], wrR: [0, 0], wrL: [0, 0] });
      // her weight on one hip (sd: −1 is her right), the other foot pointed out; the arm on the free side up, the other low and out
      const sway = (t, sd, deep) => {
        const W = sd < 0 ? 'R' : 'L', Fr = sd < 0 ? 'L' : 'R', k = { t, hip: [sd * 0.075, -0.05 * deep, 0], hipR: [sd * -0.08, 0, sd * 0.17 * deep], sp: [sd * 0.08, 0, -sd * 0.22 * deep], hd: [-sd * 0.18, -0.03, sd * 0.10] };
        k['ft' + Fr] = [-sd * 0.16, 0.035, 0.08, -sd * 0.35, 0.42]; k['kn' + Fr] = [-sd * 0.4, 0, 1]; k['ft' + W] = 'rest'; k['kn' + W] = 'rest';
        Object.assign(k, arm(Fr, [-sd * 0.19, 1.63, 0.05], [-sd * 1, 0.3, -0.3], FP.soft, 0.3, [0.1, 0.45]), arm(W, [sd * 0.36, 0.97, 0.12], [sd * 0.5, -0.4, -1], FP.open, 0.9, [-0.3, 0]));
        keys.push(k);
        for (let j = -1; j <= 2; j++) if (j) keys.push({ t: t + j * 0.10, ['wr' + Fr]: [0.1, j % 2 ? -0.5 : 0.5] });                         // the shake that rings her wrist
      };
      keys.push({ t: 0.38, hip: [0, -0.03, 0], hR: [-0.25, 1.30, 0.16], hL: [0.25, 1.30, 0.16], eR: [-1, -0.6, -0.3], eL: [1, -0.6, -0.3], fR: FP.soft, fL: FP.soft, twR: 0.4, twL: 0.4, mouth: 2 });
      for (let i = 0; i < 4; i++) { const t = T0 + i * B; if (i) mid(t, 0.006); sway(t + B * 0.5, i % 2 ? 1 : -1, 1); }
      // a hop that takes her half way round: down, up (she turns in the air), down
      const hop = (t, a0, a1) => {
        keys.push({ t, hip: [0, -0.085, 0], hipR: [0, 0, 0], sp: [0, 0.10, 0], hd: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: [-0.2, 0, 1], knL: [0.2, 0, 1], hR: [-0.24, 1.20, 0.16], hL: [0.24, 1.20, 0.16], eR: [-1, -0.6, -0.3], eL: [1, -0.6, -0.3], fR: FP.soft, fL: FP.soft, twR: 0.4, twL: 0.4, wrR: [0, 0], wrL: [0, 0] });
        keys.push({ t: t + 0.11, hip: [0, 0.02, 0], sp: [0, -0.03, 0], ftR: [0, 0.045, 0, -0.1, 0.5], ftL: [0, 0.045, 0, 0.1, 0.5], hR: [-0.30, 1.30, 0.12], hL: [0.30, 1.30, 0.12] });
        keys.push({ t: t + 0.23, hip: [0, 0.085, 0], ftR: [0.01, 0.12, 0, -0.1, 0.6], ftL: [-0.01, 0.12, 0, 0.1, 0.6], hR: [-0.33, 1.42, 0.08], hL: [0.33, 1.42, 0.08] });
        keys.push({ t: t + 0.35, hip: [0, 0.02, 0], ftR: [0, 0.04, 0, -0.1, 0.4], ftL: [0, 0.04, 0, 0.1, 0.4] });
        keys.push({ t: t + 0.46, hip: [0, -0.07, 0], sp: [0, 0.06, 0], ftR: 'rest', ftL: 'rest', hR: [-0.26, 1.20, 0.14], hL: [0.26, 1.20, 0.14] });
        spin.push([t + 0.09, a0], [t + 0.37, a1]);
        return t + 0.46;
      };
      let t = hop(T0 + 4 * B, 0, PI);
      // her back to you: hands on her hips, a look over her shoulder, and her hips bump one way and the other
      const onHips = { hR: [-0.215, 1.035, -0.02], hL: [0.215, 1.035, -0.02], eR: [-1, -0.1, -0.6], eL: [1, -0.1, -0.6], fR: FP.loose, fL: FP.loose, twR: 0.2, twL: 0.2, wrR: [0.5, 0], wrL: [0.5, 0] };
      keys.push(Object.assign({ t: t + 0.20, hip: [-0.08, -0.04, 0], hipR: [0.06, 0, -0.17], sp: [-0.22, 0, 0.20], hd: [-0.80, -0.02, 0.05], knR: 'rest', knL: [0.3, 0, 1], ftL: [0.03, 0.03, 0.02, 0.2, 0.35] }, onHips));
      keys.push({ t: t + 0.42, hip: [0, 0, 0], hipR: [0, 0, 0], sp: [-0.22, 0, 0], hd: [-0.80, -0.02, 0], ftL: 'rest', knL: 'rest' });
      keys.push({ t: t + 0.64, hip: [0.08, -0.04, 0], hipR: [-0.06, 0, 0.17], sp: [-0.22, 0, -0.20], hd: [-0.80, -0.02, -0.05], knR: [-0.3, 0, 1], ftR: [-0.03, 0.03, 0.02, -0.2, 0.35] });
      keys.push(Object.assign({ t: t + 0.74 }, onHips));                                                              // her hands stay on her hips through both bumps
      keys.push({ t: t + 0.86, hip: [0, 0, 0], hipR: [0, 0, 0], sp: [-0.10, 0, 0], hd: [-0.4, 0, 0], ftR: 'rest', knR: 'rest' });
      t = hop(t + 1.00, PI, TAU);
      // round again and into her pose: weight on her left hip, left hand on it, right wrist ringing by her ear, head cocked
      keys.push({ t: t + 0.22, hip: [0.075, -0.05, 0], hipR: [-0.08, 0, 0.17], sp: [0.08, 0, -0.22], hd: [-0.10, -0.03, 0.15], ftR: [-0.16, 0.035, 0.08, -0.35, 0.42], knR: [-0.4, 0, 1], ftL: 'rest', knL: 'rest',
        hL: [0.215, 1.035, -0.02], eL: [1, -0.1, -0.6], fL: FP.loose, twL: 0.2, wrL: [0.5, 0], hR: [-0.19, 1.63, 0.05], eR: [-1, 0.3, -0.3], fR: FP.soft, twR: 0.3, wrR: [0.1, -0.45], mouth: 2 });
      for (let j = 1; j <= 4; j++) keys.push({ t: t + 0.22 + j * 0.10, wrR: [0.1, j % 2 ? 0.5 : -0.5] });
      keys.push({ t: t + 0.95, hip: [0.075, -0.045, 0], hd: [-0.10, -0.03, 0.16], mouth: 2 });
      const dur = t + 1.45; spin.push([dur, TAU]);
      keys.sort((a, b) => a.t - b.t);
      defAction('dance', dur, keys, { outro: 0.45, stand: true, spin });
    })();

    // Curtsey (her own; she also keeps the Jester's bow): one foot slips behind, she dips, holds a fold of her trousers out at her side and puts a finger to her
    // lips. She does not lower her head: she watches you through it, with one slow blink. More cheek than respect.
    defAction('curtsey', 3.5, [
      { t: 0.42, ftR: [0.05, 0.03, -0.20, -0.40, 0.40], hip: [0.005, -0.02, 0], hR: [-0.275, 0.85, 0.04], eR: [-1, -0.2, -0.6], fR: PINCH, twR: 0.2, wrR: [0.2, 0], hL: [0.14, 1.12, 0.22], eL: [0.8, -1, -0.2], fL: FP.point, twL: 0.4, wrL: [0.1, 0], hd: [0.03, -0.02, 0.08], mouth: 2 },
      { t: 1.00, ftR: [0.05, 0.04, -0.24, -0.45, 0.50], hip: [0.01, -0.17, -0.02], knL: [0.40, 0, 1], knR: [-0.5, 0, 1], sp: [0, 0.12, 0], hd: [0.05, -0.08, 0.14], hR: [-0.30, 0.705, 0.05], hL: DIP_SHH },
      { t: 1.30, eyes: 0 }, { t: 1.48, eyes: 1 }, { t: 1.62, eyes: 1 }, { t: 1.80, eyes: 0 },
      { t: 2.05, hip: [0.01, -0.165, -0.02], sp: [0, 0.12, 0], hd: [0.05, -0.08, 0.15], hR: [-0.30, 0.71, 0.05], hL: [DIP_SHH[0], DIP_SHH[1] + 0.005, DIP_SHH[2]] },
      { t: 2.60, ftR: [0.02, 0.02, -0.08, -0.2, 0.2], hip: [0, 0, 0], knL: 'rest', knR: 'rest', sp: [0, -0.02, 0], hd: [0, -0.03, -0.10], hR: [-0.37, 0.93, 0.12], fR: FP.open, twR: 0.9, wrR: [-0.3, 0.2], hL: [0.20, 1.20, 0.22], fL: FP.soft, twL: 0.8 },
      { t: 3.00, ftR: 'rest', hR: [-0.32, 0.90, 0.08], hL: [0.27, 1.02, 0.14], mouth: 2 }
    ], { outro: 0.45, stand: true });

    // Pounce (her own; she also keeps the Jester's twirl): the way a fox takes a mouse. She sinks, her hips wind up with a wiggle while her head
    // stays dead still, she springs up and over and comes down with both hands cupped on her catch; a peek between her thumbs, a look up at you,
    // and she hops back. Her hands are always placed where her arms can reach (within nine tenths of their length from the shoulder at that
    // moment: bench/armdiag.js), because an arm pulled straight locks, and snaps when it lets go.
    (function () {
      const keys = [], both = (x, y, z, o) => Object.assign({ hR: [-x, y, z], hL: [x, y, z] }, o);
      const crouch = both(0.12, 0.58, 0.22, { hip: [0, -0.36, -0.10], sp: [0, 0.50, 0], hd: [0, -0.34, 0], eR: [-1, -0.1, -0.2], eL: [1, -0.1, -0.2], fR: FP.cup, fL: FP.cup, wrR: [0.3, 0], wrL: [0.3, 0],
        knR: [-0.40, 0, 1], knL: [0.40, 0, 1], ftR: [-0.03, 0.035, 0, -0.30, 0.45], ftL: [0.03, 0.035, 0, 0.30, 0.45] });
      keys.push(Object.assign({ t: 0.45, eyes: 0.3 }, crouch));
      for (let i = 0; i < 5; i++) { const s = i % 2 ? 1 : -1, a = i === 4 ? 0 : 1; keys.push({ t: 0.54 + i * 0.10, hip: [s * 0.02 * a, -0.36 - 0.012 * i, -0.10 - 0.008 * i], hipR: [s * 0.16 * a, 0, s * 0.05 * a], sp: [-s * 0.14 * a, 0.50, -s * 0.03 * a], hd: [0, -0.34, 0] }); }   // the wiggle
      // the spring: her arms swing back and then through as she pushes off, then she is up and over. 0.50 s in the air, 30 cm up, 40 cm forward,
      // tipped forward with her knees drawn up.
      const T0 = 1.34, AIR = 0.50, H = 0.30, FW = 0.40, g = 8 * H / (AIR * AIR), v0 = g * AIR / 2;
      keys.push(both(0.12, 0.58, 0.22, { t: 0.80, eR: crouch.eR, eL: crouch.eL, fR: FP.cup, fL: FP.cup }));
      keys.push(both(0.27, 0.64, -0.14, { t: 1.06, hip: [0, -0.40, -0.12], sp: [0, 0.56, 0], eR: [-0.5, 0.3, -1], eL: [0.5, 0.3, -1], fR: FP.soft, fL: FP.soft, eyes: 0 }));
      keys.push({ t: 1.14, hip: [0, -0.41, -0.12], sp: [0, 0.56, 0] });
      keys.push(both(0.20, 1.02, 0.30, { t: T0, hip: [0, 0.03, 0.02], hipR: [0, 0, 0], sp: [0, 0.10, 0], hd: [0, -0.10, 0], eR: [-0.6, -1, -0.3], eL: [0.6, -1, -0.3], ftR: [-0.02, 0.07, 0, -0.10, 0.75], ftL: [0.02, 0.07, 0, 0.10, 0.75], knR: [-0.2, 0, 1], knL: [0.2, 0, 1], mouth: 1 }));
      const HX = [0.20, 0.19, 0.16, 0.12, 0.08, 0.05, 0.034], HY = [1.02, 1.13, 1.22, 1.20, 1.10, 0.93, 0.74], HZ = [0.30, 0.36, 0.42, 0.50, 0.58, 0.61, 0.62];      // her hands through the leap: up with her, then down to the catch
      for (let i = 1; i <= 5; i++) {
        const u = i / 6, ta = u * AIR, y = v0 * ta - 0.5 * g * ta * ta, z = FW * u, tuck = Math.sin(PI * u), dn = sm(0.45, 1, u);
        keys.push(both(HX[i], HY[i], HZ[i], { t: T0 + ta, hip: [0, 0.03 * (1 - u) - 0.10 * dn + y, 0.02 + z - 0.05 * dn], hipR: [0, 0.28 * tuck, 0], sp: [0, 0.10 + 0.50 * tuck * (1 - dn) + 0.50 * dn, 0], hd: [0, -0.10 + 0.34 * tuck, 0],
          eR: [-1, lerp(-1, 0.1, u), -0.2], eL: [1, lerp(-1, 0.1, u), -0.2], fR: FP.open, fL: FP.open,
          ftR: [-0.02 - 0.02 * tuck, 0.07 * (1 - u) + y + 0.22 * tuck, z - 0.12 * tuck * (1 - dn) + 0.03 * dn, -0.15, 0.75 - 0.4 * dn], ftL: [0.02 + 0.02 * tuck, 0.07 * (1 - u) + y + 0.18 * tuck, z - 0.07 * tuck * (1 - dn) + 0.03 * dn, 0.15, 0.75 - 0.4 * dn] }));
      }
      const TL = T0 + AIR, cup = { eR: [-1, 0.1, -0.1], eL: [1, 0.1, -0.1], fR: FP.cup, fL: FP.cup, twR: 0.75, twL: 0.75, wrR: [0.2, 0], wrL: [0.2, 0] };
      keys.push(both(HX[6], HY[6], HZ[6], Object.assign({ t: TL, hip: [0, -0.20, FW - 0.06], hipR: [0, 0, 0], sp: [0, 0.52, 0], hd: [0, 0.10, 0], ftR: [-0.04, 0, FW, -0.30, 0.10], ftL: [0.04, 0, FW, 0.30, 0.10], knR: [-0.40, 0, 1], knL: [0.40, 0, 1], mouth: 0 }, cup)));     // got it
      keys.push(both(0.034, 0.47, 0.60, { t: TL + 0.16, hip: [0, -0.47, FW - 0.11], sp: [0, 0.60, 0], hd: [0, 0.12, 0], ftR: [-0.04, 0.035, FW, -0.36, 0.5], ftL: [0.04, 0.035, FW, 0.36, 0.5], knR: [-0.5, 0, 1], knL: [0.5, 0, 1] }));
      keys.push(both(0.034, 0.49, 0.60, { t: TL + 0.34, hip: [0, -0.43, FW - 0.11], sp: [0, 0.56, 0] }));
      // she lifts her cupped hands and peeks in between her thumbs
      keys.push(both(0.036, 0.56, 0.60, { t: TL + 0.70, sp: [0, 0.50, 0], hd: [0.05, 0.22, 0.12], eyes: 0.4, mouth: 0 }));
      keys.push(both(0.046, 0.57, 0.60, { t: TL + 0.95, hd: [0.05, 0.24, 0.13], eyes: 0.4, mouth: 2 }));
      // looks up at you, pleased with herself
      keys.push(both(0.036, 0.55, 0.60, { t: TL + 1.25, hd: [0, -0.36, -0.10], eyes: 0, mouth: 2 }));
      keys.push(Object.assign(both(0.045, 0.55, 0.60, { t: TL + 1.50, hd: [0, -0.36, -0.12], hip: [0, -0.45, FW - 0.12], sp: [0, 0.52, 0] }), cup));
      // and hops back to where she started: up out of the crouch in 0.3 s, 0.34 s in the air, 14 cm up. Her hands part and open on the way
      const T1 = TL + 1.80, AIR2 = 0.34, H2 = 0.14, g2 = 8 * H2 / (AIR2 * AIR2), w0 = g2 * AIR2 / 2, wide = { eR: [-0.6, -1, -0.3], eL: [0.6, -1, -0.3], fR: FP.open, fL: FP.open, twR: 0.9, twL: 0.9 };
      keys.push(both(0.20, 0.98, FW + 0.16, Object.assign({ t: T1, hip: [0, -0.02, FW - 0.02], sp: [0, 0.10, 0], hd: [0, -0.06, 0], ftR: [-0.02, 0.06, FW, -0.10, 0.7], ftL: [0.02, 0.06, FW, 0.10, 0.7], knR: [-0.2, 0, 1], knL: [0.2, 0, 1] }, wide)));
      for (let i = 1; i <= 3; i++) { const u = i / 4, ta = u * AIR2, y = w0 * ta - 0.5 * g2 * ta * ta, z = FW * (1 - u), k = { t: T1 + ta, hip: [0, -0.02 + y, z - 0.02 * (1 - u)], ftR: [-0.02, 0.06 * (1 - u) + y + 0.05, z, -0.10, 0.6], ftL: [0.02, 0.06 * (1 - u) + y + 0.05, z, 0.10, 0.6] };
        if (i === 2) Object.assign(k, both(0.30, 1.10, 0.30)); keys.push(k); }
      keys.push(both(0.38, 1.00, 0.14, { t: T1 + AIR2, hip: [0, -0.07, 0], sp: [0, 0.06, 0], hd: [0.04, -0.03, 0.12], ftR: 'rest', ftL: 'rest', knR: [-0.2, 0, 1], knL: [0.2, 0, 1], mouth: 2 }));
      keys.push(both(0.36, 0.98, 0.12, { t: T1 + AIR2 + 0.30, hip: [0, 0, 0], sp: [0, 0, 0], knR: 'rest', knL: 'rest', hd: [0.04, -0.03, 0.13], mouth: 2 }));
      const dur = T1 + AIR2 + 0.95;
      defAction('pounce', dur, keys, { outro: 0.4, stand: true, hits: [TL / dur], cues: [T0 / dur] });
    })();
  })();
