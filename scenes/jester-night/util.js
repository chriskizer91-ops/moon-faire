// Small helpers shared by every part of the scene. Everything in the film is a
// pure function of time, so these are all deterministic: same t, same picture.

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = k => k * k * (3 - 2 * k);
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeIn = k => k * k * k;
const easeInOut = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

// Integer hash to [0, 1).
function hash(n) {
  n = n | 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const hash2 = (a, b) => hash(Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263));

// Seeded generator for things built once (crack lines, fog blobs).
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth 1D value noise in [-1, 1].
function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  return lerp(hash2(i, seed), hash2(i + 1, seed), smooth(f)) * 2 - 1;
}

// Piecewise envelope: keys = [[t, value], ...], eased between keys.
function env(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}

// 0 before t0, 1 at t0, falling off with time constant tau.
const decay = (t, t0, tau) => (t < t0 ? 0 : Math.exp(-(t - t0) / tau));
// 0 -> 1 -> 0 over [t0, t0 + dur].
const bump = (t, t0, dur) => { const k = (t - t0) / dur; return k < 0 || k > 1 ? 0 : Math.sin(Math.PI * k); };
// 0 before t0, eases to 1 over dur.
const ramp = (t, t0, dur) => smooth(clamp((t - t0) / dur));

// Position along keyed points [[t, x, y], ...], eased between keys.
function path(t, keys) {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const a = keys[i - 1], b = keys[i], k = easeInOut((t - a[0]) / (b[0] - a[0]));
      return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    }
  }
  const z = keys[keys.length - 1];
  return [z[1], z[2]];
}

// How big someone standing at ground height y is drawn (1 = native HD frame).
// The rail is about y 555 and the front of the deck about y 900.
const depthScale = y => 0.52 + 0.00114 * (y - 555);
