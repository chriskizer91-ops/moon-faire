// Sound. Everything is synthesized with Web Audio, so it costs no file size.
// CUES is a list of timed sound events built from the script; the same list
// plays live (scheduled a little ahead) and renders offline for the video.

function impulse(ctx, secs) {
  const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(2, n, ctx.sampleRate), r = rng(3);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / n, 3.2) * (i < 200 ? i / 200 : 1);
  }
  return b;
}
function noiseBuffer(ctx) {
  const n = ctx.sampleRate * 3, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), r = rng(5);
  for (let i = 0; i < n; i++) d[i] = r() * 2 - 1;
  return b;
}

// One output chain (master, compressor, reverb) per playback.
function makeBus(ctx, dest) {
  const master = ctx.createGain(); master.gain.value = 1.6;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.3;
  const limit = ctx.createDynamicsCompressor();     // keeps the big hits from clipping
  limit.threshold.value = -3; limit.knee.value = 0; limit.ratio.value = 20; limit.attack.value = 0.001; limit.release.value = 0.12;
  master.connect(comp); comp.connect(limit); limit.connect(dest);
  const verb = ctx.createConvolver(); verb.buffer = impulse(ctx, 3.4);
  const send = ctx.createGain(); send.connect(verb);
  const ret = ctx.createGain(); ret.gain.value = 0.55; verb.connect(ret); ret.connect(master);
  return { ctx, master, send, noise: noiseBuffer(ctx) };
}

// Route a node out with pan (number, or [from, to, t0, t1]) and reverb send.
function out(B, node, o = {}) {
  const ctx = B.ctx, p = ctx.createStereoPanner(), g = ctx.createGain();
  g.gain.value = o.gain == null ? 1 : o.gain;
  if (Array.isArray(o.pan)) { p.pan.setValueAtTime(o.pan[0], o.pan[2]); p.pan.linearRampToValueAtTime(o.pan[1], o.pan[3]); }
  else p.pan.value = clamp(o.pan || 0, -1, 1);
  node.connect(g); g.connect(p); p.connect(B.master);
  const wet = o.wet == null ? 0.25 : o.wet;
  if (wet > 0) { const s = ctx.createGain(); s.gain.value = wet; p.connect(s); s.connect(B.send); }
  return g;
}
function hit(param, t, a, peak, d) {
  param.setValueAtTime(0.0001, t);
  param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
  param.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function osc(B, type, f, t, dur) {
  const o = B.ctx.createOscillator(), g = B.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); g.gain.value = 0;
  o.connect(g); o.start(t); o.stop(t + dur + 0.05);
  return [o, g];
}
function noise(B, t, dur, rate = 1) {
  const s = B.ctx.createBufferSource();
  s.buffer = B.noise; s.loop = true; s.playbackRate.value = rate;
  s.start(t, (t * 7.31) % 2.5); s.stop(t + dur + 0.05);
  return s;
}
function filt(B, type, f, q = 1) {
  const b = B.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b;
}
function chain(...nodes) { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); return nodes[nodes.length - 1]; }

// ---------- instruments ----------
const BELL = [[0.5, 0.32, 1], [1, 0.5, 0.75], [1.19, 0.22, 0.55], [1.5, 0.2, 0.5], [2, 0.22, 0.42], [2.51, 0.12, 0.3], [2.66, 0.1, 0.26], [3.01, 0.08, 0.2], [4.17, 0.05, 0.14], [5.43, 0.035, 0.1]];
const TINY = [[1, 1, 1], [2.32, 0.5, 0.6], [4.25, 0.28, 0.35]];

function bell(B, t, f, o = {}) {
  const sum = B.ctx.createGain(), dur = o.dur || 3, gain = o.gain || 0.15, r = o.r || Math.random;
  out(B, sum, o);
  for (const [k, a, d] of o.partials || BELL) {
    const fr = f * k * (1 + (r() - 0.5) * 0.004);
    if (fr > 15000) continue;
    const [, g] = osc(B, "sine", fr, t, dur * d);
    hit(g.gain, t, 0.003, a * gain, dur * d);
    g.connect(sum);
  }
}
// Her hip bells: a few small gold bells, a hair apart.
function jingle(B, t, o = {}) {
  const r = o.r || Math.random, n = o.n || 4;
  for (let i = 0; i < n; i++)
    bell(B, t + i * (0.025 + r() * 0.04), 2500 + r() * 1800, { partials: TINY, dur: 0.38, gain: (o.gain || 0.05) * (0.7 + 0.6 * r()), pan: (o.pan || 0) + (r() - 0.5) * 0.2, wet: 0.3, r });
}
function step(B, t, o = {}) {
  const k = o.gain || 1;
  const [os, g] = osc(B, "sine", 120, t, 0.2);
  os.frequency.exponentialRampToValueAtTime(46, t + 0.12);
  hit(g.gain, t, 0.004, 0.2 * k, 0.14); out(B, g, { pan: o.pan, wet: 0.06 });
  const ng = B.ctx.createGain(); chain(noise(B, t, 0.1), filt(B, "lowpass", 900), ng);
  hit(ng.gain, t, 0.002, 0.1 * k, 0.06); out(B, ng, { pan: o.pan, wet: 0.05 });
  jingle(B, t + 0.02, { n: 3, gain: 0.032 * k, pan: o.pan, r: o.r });
}
function whoosh(B, t, dur, f0, f1, gain, pan = 0) {
  const bp = filt(B, "bandpass", f0, 1.1), g = B.ctx.createGain();
  chain(noise(B, t, dur), bp, g);
  bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  out(B, g, { pan, wet: 0.3 });
}
function puff(B, t, gain, pan = 0, f = 700) {
  const g = B.ctx.createGain(); chain(noise(B, t, 0.5), filt(B, "lowpass", f), g);
  hit(g.gain, t, 0.01, gain, 0.35); out(B, g, { pan, wet: 0.2 });
}
function crack(B, t, gain, pan = 0) {
  const g = B.ctx.createGain(); chain(noise(B, t, 0.12), filt(B, "highpass", 2200), g);
  hit(g.gain, t, 0.001, gain, 0.06); out(B, g, { pan, wet: 0.3 });
}
function thud(B, t, f, gain, d = 0.3, pan = 0) {
  const [o, g] = osc(B, "sine", f * 1.6, t, d + 0.1);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
  hit(g.gain, t, 0.004, gain, d); out(B, g, { pan, wet: 0.15 });
}
function clang(B, t, pan) {
  bell(B, t, 610, { dur: 1.4, gain: 0.16, pan, wet: 0.35 });
  crack(B, t, 0.32, pan); thud(B, t, 80, 0.3, 0.3, pan);
}
function rattle(B, t, dur, gain, pan, r) {
  for (let i = 0; i < 12; i++) {
    const tt = t + r() * dur;
    const [, g] = osc(B, "sine", 3400 + r() * 3000, tt, 0.06); hit(g.gain, tt, 0.001, gain * 0.5, 0.04); out(B, g, { pan, wet: 0.2 });
    const ng = B.ctx.createGain(); chain(noise(B, tt, 0.03), filt(B, "bandpass", 6000, 6), ng); hit(ng.gain, tt, 0.001, gain, 0.015); out(B, ng, { pan, wet: 0.1 });
  }
}
function boom(B, t, gain, f = 70, d = 1.8) {
  const [o, g] = osc(B, "sine", f, t, d);
  o.frequency.exponentialRampToValueAtTime(f * 0.38, t + d * 0.8);
  const sh = B.ctx.createWaveShaper(), curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(2.5 * x); }
  sh.curve = curve;
  hit(g.gain, t, 0.005, gain, d); out(B, chain(g, sh), { wet: 0.2 });
  const ng = B.ctx.createGain(); chain(noise(B, t, d + 0.5), filt(B, "lowpass", 160), ng); hit(ng.gain, t, 0.01, gain * 0.8, d + 0.4); out(B, ng, { wet: 0.3 });
}
function swell(B, t0, t1, gain, pan = 0) {
  const bp = filt(B, "bandpass", 700, 0.9), g = B.ctx.createGain();
  chain(noise(B, t0, t1 - t0 + 0.05), filt(B, "highpass", 500), bp, g);
  bp.frequency.setValueAtTime(700, t0); bp.frequency.exponentialRampToValueAtTime(5200, t1);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t1); g.gain.setValueAtTime(0, t1 + 0.01);
  out(B, g, { pan, wet: 0.35 });
}
// A shade's voice: two close, wavering tones through vowel formants.
function keen(B, t0, t1, f, o = {}) {
  const ctx = B.ctx, dur = t1 - t0, r = o.r || Math.random;
  const a = ctx.createOscillator(), b = ctx.createOscillator();
  a.type = "triangle"; b.type = "sawtooth";
  const n = 48, ca = new Float32Array(n), cb = new Float32Array(n);
  let w = 0;
  for (let i = 0; i < n; i++) { w = clamp(w + (r() - 0.5) * 0.06, -0.09, 0.09); ca[i] = f * (1 + w + (i / n) * 0.06); cb[i] = ca[i] * 1.059; }
  a.frequency.setValueCurveAtTime(ca, t0, dur); b.frequency.setValueCurveAtTime(cb, t0, dur);
  const lfo = ctx.createOscillator(), lg = ctx.createGain();
  lfo.frequency.value = 5.3; lg.gain.value = f * 0.025; lfo.connect(lg); lg.connect(a.frequency); lg.connect(b.frequency);
  const bg = ctx.createGain(); bg.gain.value = 0.35; b.connect(bg);
  const sum = ctx.createGain(); a.connect(sum); bg.connect(sum);
  const f1 = filt(B, "bandpass", 900, 4), f2 = filt(B, "bandpass", 1500, 5), mix = ctx.createGain();
  sum.connect(f1); sum.connect(f2); f1.connect(mix); f2.connect(mix);
  const breath = ctx.createGain(); breath.gain.value = 0.25; chain(noise(B, t0, dur), filt(B, "bandpass", 2300, 1.4), breath); breath.connect(mix);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(o.gain || 0.05, t0 + Math.min(1.2, dur * 0.4));
  g.gain.setValueAtTime(o.gain || 0.05, t1 - 0.02); g.gain.setTargetAtTime(0.0001, t1, o.cut || 0.012);
  mix.connect(g); out(B, g, { pan: o.pan, wet: 0.45 });
  for (const s of [a, b, lfo]) { s.start(t0); s.stop(t1 + 0.4); }
}
function whisper(B, t, dur, gain, pan = 0, lo = 1200, hi = 3400, r = Math.random) {
  const bp = filt(B, "bandpass", lo, 3), g = B.ctx.createGain();
  chain(noise(B, t, dur), bp, g);
  g.gain.setValueAtTime(0.0001, t);
  let tt = t;
  while (tt < t + dur) {
    const syl = 0.06 + r() * 0.1;
    bp.frequency.setValueAtTime(lo + r() * (hi - lo), tt);
    g.gain.setValueAtTime(0.0001, tt); g.gain.linearRampToValueAtTime(gain * (0.4 + 0.6 * r()), tt + syl * 0.3); g.gain.linearRampToValueAtTime(0.0001, tt + syl);
    tt += syl + r() * 0.06;
  }
  out(B, g, { pan, wet: 0.4 });
}
function shimmer(B, t, dur, freqs, gain, pan = 0) {
  for (const f of freqs) {
    const [o, g] = osc(B, "sine", f, t, dur);
    const lfo = B.ctx.createOscillator(), lg = B.ctx.createGain();
    lfo.frequency.value = 6 + (f % 3); lg.gain.value = gain * 0.4; lfo.connect(lg); lfo.start(t); lfo.stop(t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + dur * 0.3); g.gain.linearRampToValueAtTime(0, t + dur);
    lg.connect(g.gain);
    out(B, g, { pan, wet: 0.6 });
  }
}
function glass(B, t, f0, f1, dur, gain, pan = 0) {
  const [o, g] = osc(B, "sine", f0, t, dur);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + dur * 0.5); g.gain.linearRampToValueAtTime(0, t + dur);
  out(B, g, { pan, wet: 0.65 });
}
function toll(B, t, f, gain, pan = 0) {
  bell(B, t, f, { dur: 7, gain, pan, wet: 0.55 });
  const [, g] = osc(B, "sine", f * 0.5, t, 4); hit(g.gain, t, 0.01, gain * 0.6, 4); out(B, g, { pan, wet: 0.3 });
}
function thunder(B, t, dur, gain, r) {
  const lp = filt(B, "lowpass", 320), g = B.ctx.createGain();
  chain(noise(B, t, dur, 0.6), lp, g);
  lp.frequency.setValueAtTime(320, t); lp.frequency.exponentialRampToValueAtTime(80, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  let tt = t;
  for (let i = 0; i < 4; i++) { tt += 0.15 + r() * dur * 0.2; g.gain.linearRampToValueAtTime(gain * (0.5 + 0.5 * r()), tt); g.gain.linearRampToValueAtTime(gain * 0.2, tt + 0.3); }
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  out(B, g, { wet: 0.4 });
}
function snare(B, t, gain) {
  const g = B.ctx.createGain(); chain(noise(B, t, 0.09), filt(B, "bandpass", 2100, 0.8), g);
  hit(g.gain, t, 0.001, gain, 0.06); out(B, g, { wet: 0.2 });
}
function crash(B, t, gain) {
  const g = B.ctx.createGain(); chain(noise(B, t, 3.4), filt(B, "highpass", 3500), g); hit(g.gain, t, 0.002, gain, 3.2); out(B, g, { wet: 0.4 });
}
function pings(B, t, n, spread, gain, r, pan = 0) {
  for (let i = 0; i < n; i++) {
    const tt = t + r() * spread, [, g] = osc(B, "sine", 1800 + r() * 4400, tt, 0.5);
    hit(g.gain, tt, 0.002, gain * (0.5 + r() * 0.5), 0.1 + r() * 0.35); out(B, g, { pan: pan + (r() - 0.5) * 1.2, wet: 0.5 });
  }
}
function voices(B, t0, t1, notes, gain, o = {}) {
  const ctx = B.ctx, dur = t1 - t0, rel = o.release || 2;
  const lp = filt(B, "lowpass", o.cutoff || 2400), g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(gain, t0 + (o.attack || 1.5));
  g.gain.setValueAtTime(gain, t1); g.gain.linearRampToValueAtTime(0.0001, t1 + rel);
  if (o.choir) {
    const f1 = filt(B, "bandpass", 780, 2.5), f2 = filt(B, "bandpass", 1180, 3.5), dry = ctx.createGain(); dry.gain.value = 0.35;
    lp.connect(f1); lp.connect(f2); lp.connect(dry); f1.connect(g); f2.connect(g); dry.connect(g);
  } else lp.connect(g);
  for (const f of notes)
    for (const c of [-8, 0, 8]) {
      const o2 = ctx.createOscillator(), og = ctx.createGain();
      o2.type = "sawtooth"; o2.frequency.value = f; o2.detune.value = c; og.gain.value = 1 / (3 * notes.length);
      o2.connect(og); og.connect(lp); o2.start(t0); o2.stop(t1 + rel + 0.1);
    }
  out(B, g, { pan: o.pan, wet: o.wet == null ? 0.5 : o.wet });
}
function musicBox(B, t, f, gain, lp = 4000, pan = 0) {
  const sum = B.ctx.createGain(), f1 = filt(B, "lowpass", lp);
  sum.connect(f1); out(B, f1, { pan, wet: 0.55 });
  for (const [k, a, d] of [[1, 1, 1.6], [2, 0.35, 0.7], [3, 0.12, 0.4], [4.2, 0.06, 0.18]]) {
    const [, g] = osc(B, "sine", f * k, t, d); hit(g.gain, t, 0.003, gain * a, d); g.connect(sum);
  }
}

// Beds: long sounds whose loudness follows an envelope; skip = seconds already played.
function bedNoise(B, when, cue, skip, o) {
  const dur = cue.end - cue.t - skip;
  if (dur <= 0) return;
  const src = noise(B, when, dur, o.rate || 1);
  const f = filt(B, o.type || "lowpass", o.f, o.q || 0.7), g = B.ctx.createGain();
  chain(src, f, g);
  g.gain.setValueAtTime(0.0001, when);
  for (let u = 0; u <= dur; u += 0.25) {
    const tt = cue.t + skip + u;
    g.gain.linearRampToValueAtTime(Math.max(0.0001, env(tt, o.keys)), when + u);
    if (o.fWander) f.frequency.linearRampToValueAtTime(o.f * (1 + o.fWander * noise1(tt * 0.3, 9)), when + u);
  }
  out(B, g, { pan: o.pan, wet: o.wet == null ? 0.2 : o.wet });
}
function bedDrone(B, when, cue, skip) {
  const dur = cue.end - cue.t - skip;
  if (dur <= 0) return;
  const ctx = B.ctx, lp = filt(B, "lowpass", 300, 1.5), g = ctx.createGain();
  for (const f of [73.42, 110, 146.83 * 1.0]) for (const c of [-6, 6]) {
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = c;
    const og = ctx.createGain(); og.gain.value = f > 140 ? 0.12 : 0.25; o.connect(og); og.connect(lp); o.start(when); o.stop(when + dur + 0.1);
  }
  lp.connect(g);
  g.gain.setValueAtTime(0.0001, when);
  for (let u = 0; u <= dur; u += 0.1) {
    const tt = cue.t + skip + u;
    g.gain.linearRampToValueAtTime(Math.max(0.0001, env(tt, DRONE)), when + u);
    lp.frequency.linearRampToValueAtTime(260 + 260 * clamp((tt - 40) / 35), when + u);
  }
  out(B, g, { wet: 0.35 });
}

// ---------- the score ----------
const DRONE = [[20.5, 0], [26, 0.1], [36.55, 0.12], [36.62, 0], [39.6, 0], [42, 0.12], [47, 0.14], [56, 0.18], [60, 0.11],
  [70, 0.14], [74.9, 0.22], [74.97, 0]];
const NOTE = { D3: 146.83, Fs3: 185, A3: 220, B3: 246.94, Cs4: 277.18, D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392, A4: 440, B4: 493.88, Cs5: 554.37,
  D5: 587.33, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880, B5: 987.77, Cs6: 1108.73, D6: 1174.66, E6: 1318.51 };
// The Faire's waltz, played on the airship's music box. [beat, note, beats]
const WALTZ = (() => {
  const bars = [
    ["D5", 0, "Fs5", 2], ["A5", 0, "G5", 2], ["Fs5", 0, "E5", 1, "D5", 2], ["E5", 0],
    ["D5", 0, "Fs5", 2], ["A5", 0, "D6", 2], ["Cs6", 0, "B5", 1, "A5", 2], ["A5", 0],
    ["B5", 0, "A5", 2], ["G5", 0, "Fs5", 2], ["E5", 0, "Fs5", 1, "G5", 2], ["A5", 0],
    ["Fs5", 0, "D5", 2], ["E5", 0, "Cs5", 2], ["D5", 0], ["D5", 0],
  ];
  const bass = ["D3", "D3", "G4", "A3", "D3", "Fs3", "G4", "A3", "G4", "D3", "A3", "A3", "B3", "A3", "D3", "D3"];
  const out = [];
  bars.forEach((b, i) => {
    for (let k = 0; k < b.length; k += 2) out.push([i * 3 + b[k + 1], NOTE[b[k]], 0.11]);
    const lo = NOTE[bass[i]] / (bass[i] === "G4" ? 2 : 1);
    out.push([i * 3, lo, 0.07]); out.push([i * 3 + 1, lo * 1.5, 0.035]); out.push([i * 3 + 2, lo * 2, 0.035]);
  });
  return out;
})();
const BEAT = 60 / 84;

function buildCues() {
  const C = [];
  const at = (t, fn, end) => C.push({ t, end: end || t + 0.01, fn });
  const pan = x => clamp(x / W * 1.6 - 0.8, -0.85, 0.85);

  // beds
  C.push({ t: 0, end: DUR, bed: true, fn: (B, w, c, s) => bedNoise(B, w, c, s, { f: 420, keys: [[0, 0], [2.5, 0.09], [36.55, 0.09], [36.62, 0.03], [41, 0.08], [74.9, 0.06], [75.0, 0], [78, 0], [82, 0.09], [118, 0.08], [120, 0]], fWander: 0.3 }) });
  C.push({ t: 18, end: 76, bed: true, fn: (B, w, c, s) => bedNoise(B, w, c, s, { type: "bandpass", f: 480, q: 1.1, keys: [[18, 0], [21.5, 0.09], [24, 0.035], [36.55, 0.04], [36.62, 0], [42, 0], [43.5, 0.05], [54, 0.05], [57, 0.15], [59.7, 0.16], [60.6, 0.04], [70, 0.035], [74.9, 0.07], [75.0, 0]], fWander: 0.45, wet: 0.3 }) });
  C.push({ t: 20.5, end: 75, bed: true, fn: bedDrone });

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
let CUES = null;

// Live playback: schedules cues a second or two ahead of the audio clock.
class Playback {
  constructor(ctx, t0) {
    this.ctx = ctx; this.t0 = t0; this.c0 = ctx.currentTime + 0.06;
    this.gain = ctx.createGain(); this.gain.connect(ctx.destination);
    this.B = makeBus(ctx, this.gain);
    CUES = CUES || buildCues();
    this.i = 0;
    for (const c of CUES) {
      if (c.bed && c.t < t0 && c.end > t0) c.fn(this.B, this.c0, c, t0 - c.t);
    }
    while (this.i < CUES.length && CUES[this.i].t < t0) this.i++;
    this.timer = setInterval(() => this.pump(), 200);
    this.pump();
  }
  time() { return this.t0 + (this.ctx.currentTime - this.c0); }
  pump() {
    const until = this.time() + 1.5;
    while (this.i < CUES.length && CUES[this.i].t < until) {
      const c = CUES[this.i++];
      const when = this.c0 + (c.t - this.t0);
      if (c.bed) c.fn(this.B, when, c, 0);
      else c.fn(shiftBus(this.B, when - c.t));
    }
  }
  stop() {
    clearInterval(this.timer);
    const g = this.gain, now = this.ctx.currentTime;
    g.gain.setTargetAtTime(0, now, 0.03);
    setTimeout(() => g.disconnect(), 300);
  }
}

// Cue functions are written in film time; a shifted bus maps them to the
// audio clock by wrapping every scheduling call with an offset.
function shiftBus(B, dt) {
  if (Math.abs(dt) < 1e-9) return B;
  const ctx = B.ctx;
  const raw = x => (x && x.__raw) || x;
  const wrapParam = p => new Proxy(p, {
    get(target, k) {
      if (k === "__raw") return target;
      const v = target[k];
      if (typeof v !== "function") return v;
      if (k === "setValueAtTime" || k === "linearRampToValueAtTime" || k === "exponentialRampToValueAtTime") return (val, t) => target[k](val, t + dt);
      if (k === "setTargetAtTime") return (val, t, c) => target[k](val, t + dt, c);
      if (k === "setValueCurveAtTime") return (arr, t, d) => target[k](arr, t + dt, d);
      if (k === "cancelScheduledValues" || k === "cancelAndHoldAtTime") return t => target[k](t + dt);
      return v.bind(target);
    },
    set(target, k, val) { target[k] = val; return true; },
  });
  const wrapNode = n => new Proxy(n, {
    get(target, k) {
      if (k === "__raw") return target;
      const v = target[k];
      if (v instanceof AudioParam) return wrapParam(v);
      if (k === "start") return (t = 0, ...rest) => target.start(t + dt, ...rest);
      if (k === "stop") return (t = 0) => target.stop(t + dt);
      if (k === "connect") return (dest, ...rest) => { target.connect(raw(dest), ...rest); return dest; };
      if (k === "disconnect") return (...a) => target.disconnect(...a.map(raw));
      if (typeof v === "function") return v.bind(target);
      return v;
    },
    set(target, k, val) { target[k] = raw(val); return true; },
  });
  const ctxProxy = new Proxy(ctx, {
    get(target, k) {
      const v = target[k];
      if (typeof v === "function" && String(k).startsWith("create")) return (...a) => wrapNode(v.apply(target, a));
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
  return Object.assign({}, B, { ctx: ctxProxy });
}

// Offline: the whole soundtrack into a WAV for the video.
async function renderSoundtrack(rate = 48000) {
  const ctx = new OfflineAudioContext(2, Math.ceil(rate * DUR), rate);
  const B = makeBus(ctx, ctx.destination);
  CUES = CUES || buildCues();
  for (const c of CUES) c.bed ? c.fn(B, c.t, c, 0) : c.fn(B);
  const buf = await ctx.startRendering();
  return buf;
}
