// The score: every sound cue in the film, built from script.js.

// ---------- the score ----------
const DRONE = [[20.5, 0], [26, 0.1], [36.55, 0.12], [36.62, 0], [39.6, 0], [42, 0.12], [47, 0.14], [56, 0.18], [60, 0.11],
  [70, 0.14], [74.9, 0.22], [74.97, 0]];

function buildCues() {
  const C = [];
  const at = (t, fn, end) => C.push({ t, end: end || t + 0.01, fn });
  const pan = x => clamp(x / W * 1.6 - 0.8, -0.85, 0.85);

  // beds
  C.push({ t: 0, end: DUR, bed: true, fn: (B, w, c, s) => bedNoise(B, w, c, s, { f: 420, keys: [[0, 0], [2.5, 0.09], [36.55, 0.09], [36.62, 0.03], [41, 0.08], [74.9, 0.06], [75.0, 0], [78, 0], [82, 0.09], [118, 0.08], [120, 0]], fWander: 0.3 }) });
  C.push({ t: 18, end: 76, bed: true, fn: (B, w, c, s) => bedNoise(B, w, c, s, { type: "bandpass", f: 480, q: 1.1, keys: [[18, 0], [21.5, 0.09], [24, 0.035], [36.55, 0.04], [36.62, 0], [42, 0], [43.5, 0.05], [54, 0.05], [57, 0.15], [59.7, 0.16], [60.6, 0.04], [70, 0.035], [74.9, 0.07], [75.0, 0]], fWander: 0.45, wet: 0.3 }) });
  C.push({ t: 20.5, end: 75, bed: true, keys: DRONE, fn: bedDrone });

  // crickets and drips while the night is calm
  const r = rng(101);
  for (let t = 0.8; t < DUR; t += 0.55 + r() * 0.7) {
    if ((t > 20.5 && t < 84) || t > 118) continue;
    const f = r() < 0.5 ? 4300 : 4700, p = (r() - 0.5) * 1.4, k = t < 3 ? t / 3 : 1;
    at(t, B => { for (let i = 0; i < 3; i++) { const [, g] = osc(B, "sine", f, t + i * 0.055, 0.04); hit(g.gain, t + i * 0.055, 0.004, 0.012 * k, 0.03); out(B, g, { pan: p, wet: 0.3 }); } });
  }
  for (let t = 1.3; t < DUR; t += 1.1 + r() * 2.2) {
    if (t > 75 && t < 79) continue;
    const f = 1100 + r() * 800, p = (r() - 0.5) * 1.4;
    at(t, B => { const [o, g] = osc(B, "sine", f, t, 0.12); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.06); hit(g.gain, t, 0.002, 0.025, 0.07); out(B, g, { pan: p, wet: 0.4 }); });
  }

  // the waltz from the airship: drifting in at the start, home again at the end
  for (const [beat, f, gain] of WALTZ) {
    const t1 = 1.0 + beat * BEAT, k1 = env(t1, [[1, 0.5], [18.5, 0.5], [23.5, 0]]);
    if (k1 > 0.02) at(t1, B => musicBox(B, t1, f, gain * k1, 2200, 0.35));
    const t2 = 85.2 + beat * BEAT;
    if (t2 < 119.4) at(t2, B => musicBox(B, t2, f, gain * env(t2, [[85, 0.6], [100, 0.9], [119, 0.8]]), 3800, 0.1));
  }
  at(94, B => voices(B, 94, 117.5, [NOTE.D3, NOTE.A3, NOTE.Fs4], 0.045, { attack: 4, release: 2.5, cutoff: 1400 }));

  // her bells announce her before she appears
  [6.0, 6.7, 7.3].forEach((t, i) => at(t, B => jingle(B, t, { n: 4, gain: 0.03 + i * 0.012, pan: -0.85, r: rng(200 + i) })));
  STEPS.forEach((s, i) => {
    const js = jesterAt(s.t), far = s.clip === "walk_away" ? 1 - clamp((s.t - 94) / 14) * 0.75 : 1;
    if (js) at(s.t, B => step(B, s.t, { pan: pan(js.x), gain: far * (s.t < 9 ? 0.6 : 1), r: rng(300 + i) }));
  });

  // the night turns: wind, lanterns gutter, shades rise
  at(20.0, B => whoosh(B, 20, 4.5, 300, 900, 0.12, 0.5));
  LANTERNS.forEach((L, i) => {
    at(L.out, B => puff(B, L.out, 0.12 * L.r + 0.03, pan(L.x), 500));
    at(L.on, B => { puff(B, L.on, 0.07, pan(L.x), 1200); musicBox(B, L.on, [NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.A5, NOTE.B5, NOTE.D6, NOTE.E6][i], 0.12, 6000, pan(L.x)); });
  });
  SHADES.forEach((sh, i) => {
    at(sh.rise, B => { puff(B, sh.rise, 0.2, pan(sh.path[0][1]), 1500); whisper(B, sh.rise + 0.2, sh.big ? 3 : 2.2, sh.big ? 0.08 : 0.05, pan(sh.path[0][1]), sh.big ? 500 : 1200, sh.big ? 1500 : 3400, rng(400 + i)); });
  });
  at(43.0, B => { boom(B, 43.0, 0.4, 44, 2.5); thunder(B, 43.4, 3.5, 0.3, rng(410)); });

  // Gilded Rebuke
  at(rebuke.t0 + 0.2, B => rattle(B, rebuke.t0 + 0.2, 0.6, 0.05, pan(P1[0]), rng(500)));
  at(frameAt("gilded_rebuke", rebuke.t0, 4), B => whoosh(B, frameAt("gilded_rebuke", rebuke.t0, 4), 0.35, 500, 2600, 0.22, -0.1));
  at(HIT_A, B => { clang(B, HIT_A, pan(700)); keen(B, HIT_A, HIT_A + 0.5, 560, { gain: 0.05, pan: pan(760), r: rng(501), cut: 0.15 }); });
  at(rebuke.t1 - 0.4, B => jingle(B, rebuke.t1 - 0.4, { n: 5, gain: 0.045, pan: pan(P1[0]), r: rng(502) }));

  // the keening, cut off by Hush
  SHADES.slice(0, 2).forEach((sh, i) => at(sh.keen[0], B => keen(B, sh.keen[0], sh.keen[1], sh.keenF, { gain: 0.055, pan: pan(path(sh.keen[0], sh.path)[0]), r: rng(600 + i) })));
  at(hush.t0 + 0.4, B => whisper(B, hush.t0 + 0.4, 1.3, 0.03, pan(P1[0]), 3500, 6500, rng(610)));        // "shh"
  at(frameAt("hush", hush.t0, 11), B => glass(B, frameAt("hush", hush.t0, 11), 880, 1760, 1.0, 0.05, pan(P1[0])));
  at(hush.release, B => whoosh(B, hush.release, 0.45, 1800, 600, 0.12, 0.3));
  HUSH_LAND.forEach((t, i) => at(t, B => { thud(B, t, 140, 0.15, 0.15, 0.4 + i * 0.2); bell(B, t, 2637, { partials: TINY, dur: 2.5, gain: 0.03, pan: 0.5, wet: 0.7 }); }));

  // the great shade, and Gravity
  at(gravity.t0 + 0.1, B => voices(B, gravity.t0 + 0.1, gravity.release, [38, 57], 0.12, { attack: 0.9, release: 0.05, cutoff: 200, wet: 0.1 }));
  at(gravity.release, B => whoosh(B, gravity.release, 0.35, 400, 1400, 0.16, 0.3));
  at(GRAV_HIT - 0.18, B => whoosh(B, GRAV_HIT - 0.18, 0.2, 3000, 300, 0.14, 0.5));
  at(GRAV_HIT, B => { boom(B, GRAV_HIT, 0.75, 62, 2.2); crack(B, GRAV_HIT, 0.35, 0.5); keen(B, GRAV_HIT + 0.05, GRAV_HIT + 1.3, 98, { gain: 0.06, pan: 0.5, r: rng(700), cut: 0.3 }); });

  // Sealed Fate: a secret from the pendant, a seal for each of them
  at(seal.t0 + 0.4, B => whisper(B, seal.t0 + 0.4, 2.0, 0.035, pan(P2[0]), 900, 2400, rng(800)));
  at(seal.t0 + 0.5, B => shimmer(B, seal.t0 + 0.5, 2.8, [1318.5, 1661.2, 1975.5], 0.012, pan(P2[0])));
  at(frameAt("sealed_fate", seal.t0, 7), B => glass(B, frameAt("sealed_fate", seal.t0, 7), 440, 1320, 2.2, 0.05, pan(P2[0])));
  at(seal.release, B => { for (let i = 0; i < 3; i++) whoosh(B, seal.release + i * 0.12, 0.5, 900, 3000, 0.08, 0.4); });
  SEAL_LAND.forEach((t, i) => at(t, B => { toll(B, t, 110, 0.11, 0.3 + i * 0.2); bell(B, t, 1760, { partials: TINY, dur: 1.2, gain: 0.04, pan: 0.4 }); }));

  // the surge, the retreat, Against All Odds
  at(54.4, B => { thunder(B, 54.6, 4, 0.28, rng(900)); swell(B, 56.4, WAVE.hit, 0.16, 0.4); });
  DOOM_TICKS.slice(0, 2).forEach(([t], i) => at(t, B => toll(B, t, [98, 87.31][i], 0.13, 0.4)));
  at(odds.t0 + 0.3, B => whoosh(B, odds.t0 + 0.3, 1.2, 300, 1800, 0.08, -0.2));
  at(odds.release, B => voices(B, odds.release, odds.t1 + 0.5, [NOTE.D3, NOTE.Fs3, NOTE.A3, NOTE.D4], 0.11, { choir: true, attack: 1.3, release: 3 }));
  at(odds.release, B => pings(B, odds.release, 40, 6.2, 0.022, rng(901), -0.3));
  at(WAVE.hit, B => { crack(B, WAVE.hit, 0.25, 0); whoosh(B, WAVE.hit, 1.2, 2500, 400, 0.16, 0.5); pings(B, WAVE.hit, 16, 0.6, 0.04, rng(902), 0.2); });
  for (let t = 66, i = 0; t < 74.9; i++) {
    const tt = t;
    at(tt, B => { thud(B, tt, 52, 0.28, 0.25); thud(B, tt + 0.2, 50, 0.18, 0.22); });
    t += 60 / lerp(62, 112, clamp((t - 66) / 8.5));
  }

  // Curtain Call
  at(curtain.t0 + 0.2, B => { thud(B, curtain.t0 + 0.2, 82, 0.35, 1.2); shimmer(B, curtain.t0 + 0.3, 1.6, [1046.5, 1568], 0.012, -0.2); });
  at(frameAt("curtain_call", curtain.t0, 10), B => glass(B, frameAt("curtain_call", curtain.t0, 10), 660, 1320, 1.3, 0.05, -0.3));
  const up = frameAt("curtain_call", curtain.t0, 18);
  at(up, B => { thud(B, up, 82, 0.35, 1.4); whoosh(B, up, 1.2, 400, 5000, 0.14, 0.4); });
  at(73.2, B => voices(B, 73.2, 74.95, [36.71, 55, 73.42], 0.12, { attack: 0.5, release: 0.04, cutoff: 260, wet: 0.2 }));
  for (let t = 71.0; t < 74.98;) {
    const tt = t, k = clamp((t - 71) / 4);
    at(tt, B => snare(B, tt, lerp(0.025, 0.13, k)));
    t += 1 / lerp(7, 26, k * k);
  }
  at(73.9, B => { whoosh(B, 73.9, 1.1, 300, 1500, 0.12, -0.9); whoosh(B, 73.95, 1.05, 320, 1600, 0.12, 0.9); swell(B, 74.1, 75.0, 0.12, 0); });
  at(CC, B => {
    [73.42, 110, 146.83, 185].forEach((f, i) => toll(B, CC + i * 0.015, f, 0.15, (i - 1.5) * 0.4));
    crash(B, CC, 0.22); boom(B, CC, 0.7, 58, 2.6);
    [2349.3, 1975.5, 1760, 1480, 1318.5, 1174.7, 987.8, 880, 740, 659.3, 587.3].forEach((f, i) =>
      bell(B, CC + 0.08 + i * 0.13, f, { partials: TINY, dur: 2.2, gain: 0.05, pan: (i % 2 ? 0.5 : -0.5), wet: 0.6 }));
    pings(B, CC + 0.02, 40, 1.2, 0.035, rng(1000));
  });
  at(CC + 0.15, B => voices(B, CC + 0.15, 80.6, [NOTE.D3, NOTE.A3, NOTE.D4, NOTE.Fs4, NOTE.A4], 0.13, { choir: true, attack: 0.25, release: 3.5 }));
  at(CC + 0.5, B => pings(B, CC + 0.5, 30, 4.5, 0.018, rng(1001)));
  at(78.6, B => glass(B, 78.6, 587, 1175, 2.0, 0.04, 0.4));

  // she leaves; the bells ring once more at the very end
  at(117.9, B => jingle(B, 117.9, { n: 5, gain: 0.03, pan: 0.2, r: rng(1100) }));

  return C.sort((a, b) => a.t - b.t);
}
