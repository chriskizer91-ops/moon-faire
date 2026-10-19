// The score: Chris's songs as the music (cut to the film by scene.json), with
// every sound effect built from script.js on top, tuned to the songs' keys.
// Moonlit Forest Path is in B-flat major, Herbal Decay in E minor: the fight's
// tolls and chimes sit in E minor, the release and the walk home in B-flat.

// How loud the songs play: under the opening, gone for the Hush, the band back
// in for the fight, silent for the Curtain Call drop, then home again.
const MUSIC_KEYS = [[0, 0.7], [20, 0.7], [22, 0.55], [24, 0.75], [HUSH_LAND[0] - 0.05, 0.75], [HUSH_LAND[0] + 0.1, 0],
  [40.6, 0], [41.0, 0.72], [GRAV_HIT - 0.05, 0.72], [GRAV_HIT + 0.1, 0.4], [GRAV_HIT + 1.6, 0.7], [75, 0.7], [77.5, 0.4],
  [79.9, 0.4], [79.95, 0], [83, 0], [83.5, 0.75], [118, 0.75], [120, 0]];

const N = { Bb1: 58.27, F2: 87.31, Bb2: 116.54, B2: 123.47, D3: 146.83, F3: 174.61, Fs3: 185, G3: 196, Bb3: 233.08, B3: 246.94, D4: 293.66,
  F4: 349.23, G4: 392, Bb4: 466.16, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, Bb5: 932.33, B5: 987.77, C6: 1046.5,
  D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, B6: 1975.53 };

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

// Left-right from where a thing is in the shot at time t: p is [x, z] or [x, y, z] in metres.
function panAt(p, t) {
  const s = shotAt(t), x = p[0], z = p.length > 2 ? p[2] : p[1];
  const f = s.look.clone().sub(s.pos).setY(0).normalize(), right = { x: -f.z, z: f.x };
  const dx = x - s.pos.x, dz = z - s.pos.z, d = Math.hypot(dx, dz) || 1;
  return clamp(((dx * right.x + dz * right.z) / d) * 1.3, -0.85, 0.85);
}
const at3 = (f, t) => { const p = path3(t, f.path); return [p.x, p.y, p.z]; };

function buildCues() {
  const C = [];
  const at = (t, fn) => C.push({ t, end: t + 0.01, fn });
  const r = rng(101);

  // beds: the songs, the night air, the wind the shades bring, the stolen fire
  C.push({ t: 0, end: DUR, bed: true, keys: MUSIC_KEYS, fn: bedMusic });
  C.push({ t: 0, end: DUR, bed: true, fn: (B, w, c, s) => bedNoise(B, w, c, s, { f: 520, q: 0.5, keys: [[0, 0], [2.4, 0.02], [HUSH_LAND[1], 0.02], [HUSH_LAND[1] + 0.06, 0.008], [41, 0.018], [79.95, 0.016], [80.0, 0], [83, 0], [86, 0.02], [118, 0.018], [120, 0]], fWander: 0.3, pan: -0.3 }) });
  C.push({ t: 18, end: 82, bed: true, fn: (B, w, c, s) => bedNoise(B, w, c, s, { type: "bandpass", f: 480, q: 1.1, keys: [[18, 0], [22, 0.045], [HUSH_LAND[1], 0.045], [HUSH_LAND[1] + 0.06, 0], [41, 0], [43, 0.04], [52.6, 0.08], [54.5, 0.05], [79.9, 0.07], [80.0, 0]], fWander: 0.45, wet: 0.3 }) });
  C.push({ t: 52.4, end: RELEASE_ALL + 0.4, bed: true, keys: [[52.4, 0], [54.4, 0.12], [BREATH[0], 0.14], [BREATH[0] + 0.3, 0.32], [BREATH[1], 0.32], [BREATH[1] + 0.3, 0.12], [79.9, 0.14], [RELEASE_ALL, 0]], fn: bedFire });

  // crickets and the owl while the town sleeps
  for (let t = 0.8; t < DUR; t += 0.6 + r() * 0.7) {
    if ((t > 21 && t < 86) || t > 118) continue;
    const f = r() < 0.5 ? 4300 : 4700, p = (r() - 0.5) * 1.4, k = t < 3 ? t / 3 : 1;
    at(t, B => { for (let i = 0; i < 3; i++) { const [, g] = osc(B, "sine", f, t + i * 0.055, 0.04); hit(g.gain, t + i * 0.055, 0.004, 0.009 * k, 0.03); out(B, g, { pan: p, wet: 0.3 }); } });
  }
  [[4.2, -0.6], [12.4, 0.7], [92.5, -0.5], [104, 0.6]].forEach(([t, p]) => at(t, B => owl(B, t, p)));

  // her bells, then her steps
  [7.6, 8.3, 8.9].forEach((t, i) => at(t, B => jingle(B, t, { n: 4, gain: 0.03 + i * 0.012, pan: -0.8, r: rng(200 + i) })));
  STEPS.forEach((s, i) => {
    const js = jesterAt(s.t), far = s.clip === "walk_away" ? 1 - clamp((s.t - 96) / 14) * 0.75 : 1;
    if (js) at(s.t, B => step(B, s.t, { pan: panAt([js.x, js.y], s.t), gain: far, r: rng(300 + i) }));
  });

  // the chapel bell: once at the start of the trouble (the song's home note), then the Doom count in E minor
  const bellPan = t => panAt([BELL3.x, BELL3.z], t);
  at(20.0, B => toll(B, 20.0, N.Bb2, 0.12, bellPan(20)));
  DOOM_TICKS.slice(0, 2).forEach(([t], i) => at(t, B => toll(B, t, [N.G3, N.Fs3][i], 0.13, bellPan(t))));

  // wisps: whispers as they come, the sputter of the lamps they cling to
  FOES.filter(f => f.kind === "wisp").forEach((f, i) => {
    at(f.rise, B => { const p = panAt(at3(f, f.rise), f.rise); whisper(B, f.rise, 2.0, 0.04, p, 1500, 3800, rng(400 + i)); glass(B, f.rise, [N.B5, N.D6, N.E6][i], [N.E6, N.G6, N.B6][i], 1.6, 0.022, p); });
  });
  LAMPS.forEach((L, i) => {
    if (L.gutter) for (let k = 0; k < 6; k++) { const t = L.gutter[0] + k * 0.45 + r() * 0.2; at(t, B => puff(B, t, 0.04, panAt(L.at, t), 900)); }
    at(L.gone, B => { const p = panAt(L.at, L.gone); whoosh(B, L.gone - 0.25, 0.6, 1800, 300, 0.07, p); puff(B, L.gone - 0.2, 0.08, p, 600); });
    // home again on the release: a chime each, climbing B-flat
    at(L.back, B => { const p = panAt(L.at, L.back); puff(B, L.back, 0.07, p, 1200); musicBox(B, L.back, [N.Bb4, N.C5, N.D5, N.F5, N.G5, N.Bb5][i], 0.12, 6000, p); });
  });

  // Gilded Rebuke, and the first one goes home
  const w3 = foe("w3"), w3Pan = panAt(at3(w3, HIT), HIT), herPan = t => { const js = jesterAt(t); return js ? panAt([js.x, js.y], t) : 0; };
  at(28.6, B => whoosh(B, 28.6, 1.6, 600, 1800, 0.08, w3Pan));
  at(rebuke.t0 + 0.2, B => rattle(B, rebuke.t0 + 0.2, 0.6, 0.05, herPan(rebuke.t0), rng(500)));
  at(frameAt("gilded_rebuke", rebuke.t0, 4), B => whoosh(B, frameAt("gilded_rebuke", rebuke.t0, 4), 0.35, 500, 2600, 0.2, herPan(HIT)));
  at(HIT, B => { bell(B, HIT, N.E5, { dur: 1.4, gain: 0.16, pan: w3Pan, wet: 0.35 }); crack(B, HIT, 0.32, w3Pan); thud(B, HIT, 80, 0.3, 0.3, w3Pan);
    keen(B, HIT, HIT + 0.5, 720, { gain: 0.04, pan: w3Pan, r: rng(501), cut: 0.15 }); });
  at(rebuke.t1 - 0.4, B => jingle(B, rebuke.t1 - 0.4, { n: 5, gain: 0.045, pan: herPan(rebuke.t1), r: rng(502) }));
  FOES.forEach(f => {
    const t = (f.release != null ? f.release : RELEASE_ALL) + 0.4, p = panAt(at3(f, t), t);
    const [f0, f1] = f.release != null ? [N.B5, N.B6] : [N.Bb5, N.Bb5 * 2];
    at(t, B => { flutter(B, t, 2.4, 0.03, p); glass(B, t, f0, f1, 2.2, 0.03, p); });
  });

  // the wail, and Hush (the music stops with it)
  [foe("w1"), foe("w2")].forEach((f, i) => at(f.wail[0], B => keen(B, f.wail[0], f.wail[1], [523.25, 554.37][i], { gain: 0.05, pan: panAt(at3(f, f.wail[0]), f.wail[0]), r: rng(600 + i) })));
  at(hush.t0 + 0.4, B => whisper(B, hush.t0 + 0.4, 1.3, 0.03, herPan(hush.t0), 3500, 6500, rng(610)));
  at(frameAt("hush", hush.t0, 11), B => glass(B, frameAt("hush", hush.t0, 11), N.B5, N.B6, 1.0, 0.05, herPan(hush.t0)));
  at(hush.release, B => whoosh(B, hush.release, 0.45, 1800, 600, 0.12, 0.3));
  HUSH_LAND.forEach((t, i) => at(t, B => { thud(B, t, 140, 0.12, 0.15, 0.3 + i * 0.2); bell(B, t, 2637, { partials: TINY, dur: 2.5, gain: 0.03, pan: 0.4, wet: 0.7 }); }));

  // the Shadow Wraith, and Gravity
  const wr = foe("wr"), wrPan = panAt(at3(wr, 44), 44);
  at(wr.rise, B => { whisper(B, wr.rise, 3, 0.06, wrPan, 400, 1300, rng(700)); boom(B, wr.rise + 0.3, 0.2, 48, 2); });
  at(44.9, B => { glass(B, 44.9, 1900, 900, 0.6, 0.04, wrPan); whoosh(B, 44.9, 0.5, 300, 900, 0.06, wrPan); });
  at(gravity.t0 + 0.1, B => voices(B, gravity.t0 + 0.1, gravity.release, [41.2, 61.74], 0.12, { attack: 0.9, release: 0.05, cutoff: 200, wet: 0.1 }));
  at(gravity.release, B => whoosh(B, gravity.release, 0.35, 400, 1400, 0.16, wrPan));
  at(GRAV_HIT - 0.18, B => whoosh(B, GRAV_HIT - 0.18, 0.2, 3000, 300, 0.14, wrPan));
  at(GRAV_HIT, B => { boom(B, GRAV_HIT, 0.7, 62, 2.2); crack(B, GRAV_HIT, 0.3, wrPan); keen(B, GRAV_HIT + 0.05, GRAV_HIT + 1.3, 98, { gain: 0.06, pan: wrPan, r: rng(701), cut: 0.3 }); });

  // the great wraith: chains, a rumble, and the lamplight swallowed
  const gw = foe("gw");
  at(gw.rise, B => { thunder(B, gw.rise + 0.2, 3.6, 0.26, rng(800)); boom(B, gw.rise + 0.5, 0.35, 40, 3); });
  [49.2, 50.4, 51.6].forEach((t, i) => at(t, B => rattle(B, t, 0.5, 0.035, panAt(at3(gw, t), t), rng(810 + i))));
  at(52.6, B => swell(B, 52.6, 54.3, 0.12, 0.4));

  // Sealed Fate: her pendant wakes in E minor, the seals land as B tolls
  at(seal.t0 + 0.4, B => whisper(B, seal.t0 + 0.4, 2.0, 0.035, herPan(seal.t0), 900, 2400, rng(900)));
  at(seal.t0 + 0.5, B => shimmer(B, seal.t0 + 0.5, 2.8, [N.E6, N.G6, N.B6], 0.012, herPan(seal.t0)));
  at(frameAt("sealed_fate", seal.t0, 7), B => glass(B, frameAt("sealed_fate", seal.t0, 7), 440, 1320, 2.2, 0.05, herPan(seal.t0)));
  at(seal.release, B => { for (let i = 0; i < 3; i++) whoosh(B, seal.release + i * 0.12, 0.5, 900, 3000, 0.08, 0.4); });
  SEAL_LAND.forEach((t, i) => at(t, B => { toll(B, t, N.B2, 0.1, 0.3 + i * 0.15); bell(B, t, N.B6, { partials: TINY, dur: 1.2, gain: 0.04, pan: 0.4 }); }));

  // the stolen fire, and Against All Odds
  at(BREATH[0], B => { swell(B, BREATH[0] - 0.6, BREATH[0], 0.1, 0.4); boom(B, BREATH[0], 0.25, 70, 1.4); });
  at(odds.t0 + 0.3, B => whoosh(B, odds.t0 + 0.3, 1.2, 300, 1800, 0.08, -0.2));
  at(odds.release, B => voices(B, odds.release, odds.t1 + 0.5, [N.G3, N.B3, N.D4, N.G4], 0.09, { choir: true, attack: 1.3, release: 3 }));
  at(odds.release, B => pings(B, odds.release, 40, 6.2, 0.022, rng(901), -0.3));
  at(BREATH[1], B => { crack(B, BREATH[1], 0.25, 0); whoosh(B, BREATH[1], 1.2, 2500, 400, 0.16, 0.3); pings(B, BREATH[1], 16, 0.6, 0.04, rng(902), 0.1); });
  for (let t = 71.5; t < 79.9;) {
    const tt = t;
    at(tt, B => { thud(B, tt, 52, 0.26, 0.25); thud(B, tt + 0.2, 50, 0.17, 0.22); });
    t += 60 / lerp(62, 112, clamp((t - 71.5) / 8.4));
  }

  // Curtain Call: an F drone pulls against the song, then everything lands in B-flat
  at(curtain.t0 + 0.2, B => { thud(B, curtain.t0 + 0.2, 82, 0.35, 1.2); shimmer(B, curtain.t0 + 0.3, 1.6, [N.B5, N.E6], 0.012, -0.2); });
  at(frameAt("curtain_call", curtain.t0, 10), B => glass(B, frameAt("curtain_call", curtain.t0, 10), N.E5, N.E6, 1.3, 0.05, -0.3));
  const up = frameAt("curtain_call", curtain.t0, 18);
  at(up, B => { thud(B, up, 82, 0.35, 1.4); whoosh(B, up, 1.2, 400, 5000, 0.14, -0.4); });
  at(78.2, B => voices(B, 78.2, 79.95, [43.65, 65.41, 87.31], 0.12, { attack: 0.5, release: 0.04, cutoff: 260, wet: 0.2 }));
  for (let t = 76.0; t < 79.98;) {
    const tt = t, kk = clamp((t - 76) / 4);
    at(tt, B => snare(B, tt, lerp(0.025, 0.13, kk)));
    t += 1 / lerp(7, 26, kk * kk);
  }
  at(78.9, B => { whoosh(B, 78.9, 1.1, 300, 1500, 0.12, -0.9); whoosh(B, 78.95, 1.05, 320, 1600, 0.12, 0.9); swell(B, 79.1, 80.0, 0.12, 0); });
  at(CC, B => {
    toll(B, CC, N.Bb2, 0.17, 0.05);                         // the chapel bell
    [N.Bb1, N.F2, N.D3].forEach((f, i) => toll(B, CC + 0.015 * (i + 1), f, 0.13, (i - 1) * 0.5));
    crash(B, CC, 0.22); boom(B, CC, 0.7, 58, 2.6);
    jingle(B, CC + 0.05, { n: 8, gain: 0.06, pan: herPan(CC), r: rng(1002) });   // her own bells
    [N.F6, N.D6, N.C6, N.Bb5, N.G5, N.F5, N.D5, N.C5, N.Bb4].forEach((f, i) =>
      bell(B, CC + 0.08 + i * 0.15, f, { partials: TINY, dur: 2.2, gain: 0.05, pan: i % 2 ? 0.5 : -0.5, wet: 0.6 }));
    pings(B, CC + 0.02, 40, 1.2, 0.035, rng(1000));
  });
  at(CC + 0.15, B => voices(B, CC + 0.15, 85.6, [N.Bb2, N.F3, N.Bb3, N.D4, N.F4], 0.12, { choir: true, attack: 0.25, release: 3.5 }));
  at(83.2, B => glass(B, 83.2, N.D5, N.D6, 2.0, 0.04, -0.4));
  at(117.9, B => jingle(B, 117.9, { n: 5, gain: 0.03, pan: 0.2, r: rng(1100) }));
  return C.sort((a, b) => a.t - b.t);
}
