// The score: every sound cue in the film, built from script.js.

const DRONE = [[20.5, 0], [24, 0.07], [33.6, 0.1], [HUSH_LAND[1], 0.1], [HUSH_LAND[1] + 0.06, 0], [40.5, 0], [42.5, 0.1],
  [48.5, 0.12], [53, 0.18], [61, 0.2], [65.4, 0.12], [75, 0.15], [79.95, 0.22], [80.02, 0]];

// The fire the great wraith holds: a low roar with crackle, loudness following keys.
function bedFire(B, when, cue, skip) {
  bedNoise(B, when, cue, skip, { f: 260, q: 0.8, keys: cue.keys, fWander: 0.4, wet: 0.25, pan: 0.45 });
}
function owl(B, t, pan) {
  for (const [dt, f, d] of [[0, 410, 0.32], [0.45, 385, 0.55]]) {
    const [o, g] = osc(B, "sine", f, t + dt, d + 0.1);
    o.frequency.linearRampToValueAtTime(f * 0.94, t + dt + d);
    g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(0.05, t + dt + 0.06); g.gain.linearRampToValueAtTime(0, t + dt + d);
    out(B, chain(g, filt(B, "lowpass", 900)), { pan, wet: 0.6 });
  }
}
function flutter(B, t, dur, gain, pan) {
  const bp = filt(B, "bandpass", 1400, 1.5), g = B.ctx.createGain();
  chain(noise(B, t, dur), bp, g);
  g.gain.setValueAtTime(0, t);
  for (let u = 0; u < dur; u += 0.055) { g.gain.linearRampToValueAtTime(gain, t + u); g.gain.linearRampToValueAtTime(gain * 0.15, t + u + 0.03); }
  g.gain.linearRampToValueAtTime(0, t + dur);
  out(B, g, { pan, wet: 0.5 });
}

function buildCues() {
  const C = [];
  const at = (t, fn) => C.push({ t, end: t + 0.01, fn });
  const pan = x => clamp((x / W) * 1.6 - 0.8, -0.85, 0.85);
  const r = rng(101);

  // beds: a river under the bridge, the night wind, the drone of the threat, the stolen fire
  C.push({ t: 0, end: DUR, bed: true, fn: (B, w, c, s) => bedNoise(B, w, c, s, { f: 650, q: 0.5, keys: [[0, 0], [2.4, 0.032], [HUSH_LAND[1], 0.032], [HUSH_LAND[1] + 0.06, 0.01], [41, 0.028], [79.95, 0.024], [80.0, 0], [83, 0], [86, 0.032], [118, 0.028], [120, 0]], fWander: 0.3, pan: 0.5 }) });
  C.push({ t: 18, end: 82, bed: true, fn: (B, w, c, s) => bedNoise(B, w, c, s, { type: "bandpass", f: 480, q: 1.1, keys: [[18, 0], [22, 0.05], [HUSH_LAND[1], 0.05], [HUSH_LAND[1] + 0.06, 0], [41, 0], [43, 0.05], [52.6, 0.09], [54.5, 0.06], [79.9, 0.08], [80.0, 0]], fWander: 0.45, wet: 0.3 }) });
  C.push({ t: 20.5, end: 81, bed: true, keys: DRONE, fn: bedDrone });
  C.push({ t: 52.4, end: RELEASE_ALL + 0.4, bed: true, keys: [[52.4, 0], [54.4, 0.12], [BREATH[0], 0.14], [BREATH[0] + 0.3, 0.32], [BREATH[1], 0.32], [BREATH[1] + 0.3, 0.12], [79.9, 0.14], [RELEASE_ALL, 0]], fn: bedFire });

  // crickets and the owl while the town sleeps
  for (let t = 0.8; t < DUR; t += 0.6 + r() * 0.7) {
    if ((t > 21 && t < 86) || t > 118) continue;
    const f = r() < 0.5 ? 4300 : 4700, p = (r() - 0.5) * 1.4, k = t < 3 ? t / 3 : 1;
    at(t, B => { for (let i = 0; i < 3; i++) { const [, g] = osc(B, "sine", f, t + i * 0.055, 0.04); hit(g.gain, t + i * 0.055, 0.004, 0.011 * k, 0.03); out(B, g, { pan: p, wet: 0.3 }); } });
  }
  [[4.2, -0.6], [12.4, 0.7], [92.5, -0.5], [104, 0.6]].forEach(([t, p]) => at(t, B => owl(B, t, p)));

  // the Faire's waltz: the last tune of the night, and home again at the end
  for (const [beat, f, gain] of WALTZ) {
    const t1 = 0.6 + beat * BEAT, k1 = env(t1, [[0.6, 0.55], [7.4, 0.55], [9.5, 0.12], [16, 0]]);
    if (k1 > 0.02) at(t1, B => musicBox(B, t1, f, gain * k1, 2600, -0.4));
    const t2 = 86.4 + beat * BEAT;
    if (t2 < 119.4) at(t2, B => musicBox(B, t2, f, gain * env(t2, [[86, 0.55], [100, 0.85], [119, 0.8]]), 3800, 0.1));
  }
  at(95, B => voices(B, 95, 117.5, [NOTE.D3, NOTE.A3, NOTE.Fs4], 0.045, { attack: 4, release: 2.5, cutoff: 1400 }));

  // her bells, then her steps
  [7.6, 8.3, 8.9].forEach((t, i) => at(t, B => jingle(B, t, { n: 4, gain: 0.03 + i * 0.012, pan: -0.8, r: rng(200 + i) })));
  STEPS.forEach((s, i) => {
    const js = jesterAt(s.t), far = s.clip === "walk_away" ? 1 - clamp((s.t - 96) / 14) * 0.75 : 1;
    if (js) at(s.t, B => step(B, s.t, { pan: pan(js.x), gain: far, r: rng(300 + i) }));
  });

  // the chapel bell: once at the start of the trouble, then the Doom count
  at(20.0, B => toll(B, 20.0, 196, 0.12, 0.05));
  DOOM_TICKS.slice(0, 2).forEach(([t], i) => at(t, B => toll(B, t, [174.6, 164.8][i], 0.13, 0.05)));

  // wisps: whispers as they come, the sputter of the lamps they cling to
  FOES.filter(f => f.kind === "wisp").forEach((f, i) => {
    at(f.rise, B => { whisper(B, f.rise, 2.0, 0.04, pan(f.path[0][1]), 1500, 3800, rng(400 + i)); glass(B, f.rise, 1320 + 200 * i, 1760 + 200 * i, 1.6, 0.025, pan(f.path[0][1])); });
  });
  LAMPS.forEach((L, i) => {
    if (L.gutter) for (let k = 0; k < 6; k++) { const t = L.gutter[0] + k * 0.45 + r() * 0.2; at(t, B => puff(B, t, 0.04, pan(L.at[0]), 900)); }
    at(L.gone, B => { whoosh(B, L.gone - 0.25, 0.6, 1800, 300, 0.07, pan(L.at[0])); puff(B, L.gone - 0.2, 0.08, pan(L.at[0]), 600); });
    at(L.back, B => { puff(B, L.back, 0.07, pan(L.at[0]), 1200); musicBox(B, L.back, [NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.A5, NOTE.B5, NOTE.D6][i], 0.12, 6000, pan(L.at[0])); });
  });

  // Gilded Rebuke, and the first one goes home
  const w3 = foe("w3");
  at(28.6, B => whoosh(B, 28.6, 1.6, 600, 1800, 0.08, 0.4));
  at(rebuke.t0 + 0.2, B => rattle(B, rebuke.t0 + 0.2, 0.6, 0.05, pan(P2[0]), rng(500)));
  at(frameAt("gilded_rebuke", rebuke.t0, 4), B => whoosh(B, frameAt("gilded_rebuke", rebuke.t0, 4), 0.35, 500, 2600, 0.2, -0.1));
  at(HIT, B => { clang(B, HIT, pan(700)); keen(B, HIT, HIT + 0.5, 720, { gain: 0.04, pan: pan(760), r: rng(501), cut: 0.15 }); });
  at(rebuke.t1 - 0.4, B => jingle(B, rebuke.t1 - 0.4, { n: 5, gain: 0.045, pan: pan(P2[0]), r: rng(502) }));
  FOES.forEach((f, i) => {
    const t = (f.release != null ? f.release : RELEASE_ALL) + 0.4;
    at(t, B => { flutter(B, t, 2.4, 0.03, pan(path(t, f.path)[0])); glass(B, t, 880, 1760, 2.2, 0.03, pan(path(t, f.path)[0])); });
  });

  // the wail, and Hush
  [foe("w1"), foe("w2")].forEach((f, i) => at(f.wail[0], B => keen(B, f.wail[0], f.wail[1], [523, 554][i], { gain: 0.05, pan: pan(path(f.wail[0], f.path)[0]), r: rng(600 + i) })));
  at(hush.t0 + 0.4, B => whisper(B, hush.t0 + 0.4, 1.3, 0.03, pan(P2[0]), 3500, 6500, rng(610)));
  at(frameAt("hush", hush.t0, 11), B => glass(B, frameAt("hush", hush.t0, 11), 880, 1760, 1.0, 0.05, pan(P2[0])));
  at(hush.release, B => whoosh(B, hush.release, 0.45, 1800, 600, 0.12, 0.3));
  HUSH_LAND.forEach((t, i) => at(t, B => { thud(B, t, 140, 0.12, 0.15, 0.3 + i * 0.2); bell(B, t, 2637, { partials: TINY, dur: 2.5, gain: 0.03, pan: 0.4, wet: 0.7 }); }));

  // the Shadow Wraith, and Gravity
  const wr = foe("wr");
  at(wr.rise, B => { whisper(B, wr.rise, 3, 0.06, pan(760), 400, 1300, rng(700)); boom(B, wr.rise + 0.3, 0.2, 48, 2); });
  at(44.9, B => { glass(B, 44.9, 1900, 900, 0.6, 0.04, pan(880)); whoosh(B, 44.9, 0.5, 300, 900, 0.06, pan(880)); });
  at(gravity.t0 + 0.1, B => voices(B, gravity.t0 + 0.1, gravity.release, [38, 57], 0.12, { attack: 0.9, release: 0.05, cutoff: 200, wet: 0.1 }));
  at(gravity.release, B => whoosh(B, gravity.release, 0.35, 400, 1400, 0.16, 0.3));
  at(GRAV_HIT - 0.18, B => whoosh(B, GRAV_HIT - 0.18, 0.2, 3000, 300, 0.14, 0.3));
  at(GRAV_HIT, B => { boom(B, GRAV_HIT, 0.7, 62, 2.2); crack(B, GRAV_HIT, 0.3, 0.3); keen(B, GRAV_HIT + 0.05, GRAV_HIT + 1.3, 104, { gain: 0.06, pan: 0.3, r: rng(701), cut: 0.3 }); });

  // the great wraith: chains, a rumble, and the lamplight swallowed
  const gw = foe("gw");
  at(gw.rise, B => { thunder(B, gw.rise + 0.2, 3.6, 0.26, rng(800)); boom(B, gw.rise + 0.5, 0.35, 40, 3); });
  [49.2, 50.4, 51.6].forEach((t, i) => at(t, B => rattle(B, t, 0.5, 0.035, pan(1200 - i * 50), rng(810 + i))));
  at(52.6, B => swell(B, 52.6, 54.3, 0.12, 0.4));

  // Sealed Fate
  at(seal.t0 + 0.4, B => whisper(B, seal.t0 + 0.4, 2.0, 0.035, pan(P2[0]), 900, 2400, rng(900)));
  at(seal.t0 + 0.5, B => shimmer(B, seal.t0 + 0.5, 2.8, [1318.5, 1661.2, 1975.5], 0.012, pan(P2[0])));
  at(frameAt("sealed_fate", seal.t0, 7), B => glass(B, frameAt("sealed_fate", seal.t0, 7), 440, 1320, 2.2, 0.05, pan(P2[0])));
  at(seal.release, B => { for (let i = 0; i < 3; i++) whoosh(B, seal.release + i * 0.12, 0.5, 900, 3000, 0.08, 0.4); });
  SEAL_LAND.forEach((t, i) => at(t, B => { toll(B, t, 110, 0.1, 0.3 + i * 0.15); bell(B, t, 1760, { partials: TINY, dur: 1.2, gain: 0.04, pan: 0.4 }); }));

  // the stolen fire, and Against All Odds
  at(BREATH[0], B => { swell(B, BREATH[0] - 0.6, BREATH[0], 0.1, 0.4); boom(B, BREATH[0], 0.25, 70, 1.4); });
  at(odds.t0 + 0.3, B => whoosh(B, odds.t0 + 0.3, 1.2, 300, 1800, 0.08, -0.2));
  at(odds.release, B => voices(B, odds.release, odds.t1 + 0.5, [NOTE.D3, NOTE.Fs3, NOTE.A3, NOTE.D4], 0.11, { choir: true, attack: 1.3, release: 3 }));
  at(odds.release, B => pings(B, odds.release, 40, 6.2, 0.022, rng(901), -0.3));
  at(BREATH[1], B => { crack(B, BREATH[1], 0.25, 0); whoosh(B, BREATH[1], 1.2, 2500, 400, 0.16, 0.3); pings(B, BREATH[1], 16, 0.6, 0.04, rng(902), 0.1); });
  for (let t = 71.5; t < 79.9;) {
    const tt = t;
    at(tt, B => { thud(B, tt, 52, 0.26, 0.25); thud(B, tt + 0.2, 50, 0.17, 0.22); });
    t += 60 / lerp(62, 112, clamp((t - 71.5) / 8.4));
  }

  // Curtain Call
  at(curtain.t0 + 0.2, B => { thud(B, curtain.t0 + 0.2, 82, 0.35, 1.2); shimmer(B, curtain.t0 + 0.3, 1.6, [1046.5, 1568], 0.012, -0.2); });
  at(frameAt("curtain_call", curtain.t0, 10), B => glass(B, frameAt("curtain_call", curtain.t0, 10), 660, 1320, 1.3, 0.05, -0.3));
  const up = frameAt("curtain_call", curtain.t0, 18);
  at(up, B => { thud(B, up, 82, 0.35, 1.4); whoosh(B, up, 1.2, 400, 5000, 0.14, -0.4); });
  at(78.2, B => voices(B, 78.2, 79.95, [36.71, 55, 73.42], 0.12, { attack: 0.5, release: 0.04, cutoff: 260, wet: 0.2 }));
  for (let t = 76.0; t < 79.98;) {
    const tt = t, kk = clamp((t - 76) / 4);
    at(tt, B => snare(B, tt, lerp(0.025, 0.13, kk)));
    t += 1 / lerp(7, 26, kk * kk);
  }
  at(78.9, B => { whoosh(B, 78.9, 1.1, 300, 1500, 0.12, -0.9); whoosh(B, 78.95, 1.05, 320, 1600, 0.12, 0.9); swell(B, 79.1, 80.0, 0.12, 0); });
  at(CC, B => {
    toll(B, CC, 146.83, 0.17, 0.05);                         // the chapel bell
    [73.42, 110, 185].forEach((f, i) => toll(B, CC + 0.015 * (i + 1), f, 0.13, (i - 1) * 0.5));
    crash(B, CC, 0.22); boom(B, CC, 0.7, 58, 2.6);
    jingle(B, CC + 0.05, { n: 8, gain: 0.06, pan: pan(P3[0]), r: rng(1002) });   // her own bells
    [2349.3, 1975.5, 1760, 1480, 1318.5, 1174.7, 987.8, 880, 740, 659.3, 587.3].forEach((f, i) =>
      bell(B, CC + 0.08 + i * 0.13, f, { partials: TINY, dur: 2.2, gain: 0.05, pan: i % 2 ? 0.5 : -0.5, wet: 0.6 }));
    pings(B, CC + 0.02, 40, 1.2, 0.035, rng(1000));
  });
  at(CC + 0.15, B => voices(B, CC + 0.15, 85.6, [NOTE.D3, NOTE.A3, NOTE.D4, NOTE.Fs4, NOTE.A4], 0.13, { choir: true, attack: 0.25, release: 3.5 }));
  at(83.2, B => glass(B, 83.2, 587, 1175, 2.0, 0.04, -0.4));
  at(117.9, B => jingle(B, 117.9, { n: 5, gain: 0.03, pan: 0.2, r: rng(1100) }));
  return C.sort((a, b) => a.t - b.t);
}
