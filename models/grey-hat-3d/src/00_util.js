// noiz.js: Noiz (a maybe-name), the Grey Hat: the man the four witches of the Moon Faire meet. Built on the code of the Ranger
// (models/ranger-3d), which is built on the Jester's (models/jester-3d).
// Code-built three.js r128 model (global THREE). Defines makeNoiz(opts) only.
// Units are metres, Y up, the soles of his boots on y = 0. He faces +Z (the audience); his left is +X.
// Interface: root, fx (his gold dust: add it to the scene beside root), skeleton, bones, SK, animate(dt), pose(o), play(name), moves, meshes, dust.
function makeNoiz(opts) {
  'use strict';
  opts = opts || {};
  // detail 0.5 to 1 scales segment counts and cloth resolution for slower phones
  const DET = Math.max(0.5, Math.min(1, opts.detail == null || !Number.isFinite(+opts.detail) ? 1 : +opts.detail));
  const Q = (n, min) => (DET >= 1 ? n : Math.max(min || 3, Math.round(n * DET)));
  const TAU = Math.PI * 2, PI = Math.PI, DEG = Math.PI / 180;
  let seed = 4242;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + (b - a) * rnd();
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = (e0, e1, x) => { const u = cl((x - e0) / (e1 - e0), 0, 1); return u * u * (3 - 2 * u); };
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  // value noise (deterministic)
  const h1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const h2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(h2(xi, yi), h2(xi + 1, yi), u), lerp(h2(xi, yi + 1), h2(xi + 1, yi + 1), u), v);
  }
  const fbm = (x, y) => vnoise(x, y) * 0.5 + vnoise(x * 2.03, y * 2.03) * 0.25 + vnoise(x * 4.01, y * 4.01) * 0.125 + vnoise(x * 8.1, y * 8.1) * 0.0625;
  // piecewise-linear lookup through [[x, v], ...] (v a number or an array), smooth between keys
  function prof(keys, x, smooth) {
    if (keys[0][0] > keys[keys.length - 1][0]) keys = keys._rev || (keys._rev = keys.slice().reverse());
    if (x <= keys[0][0]) return keys[0][1];
    const n = keys.length;
    if (x >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 1; while (keys[i][0] < x) i++;
    let u = (x - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
    if (smooth) u = u * u * (3 - 2 * u);
    const a = keys[i - 1][1], b = keys[i][1];
    if (typeof a === 'number') return a + (b - a) * u;
    return a.map((v, k) => v + (b[k] - v) * u);
  }
  // Catmull-Rom through numbers at uniform spacing; ps = [p0, p1, ...], x in 0..n-1
  function crom(ps, x) {
    const n = ps.length; x = cl(x, 0, n - 1);
    const i = Math.min(n - 2, Math.floor(x)), u = x - i;
    const p0 = ps[Math.max(0, i - 1)], p1 = ps[i], p2 = ps[i + 1], p3 = ps[Math.min(n - 1, i + 2)];
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
  }
  const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  // a smooth curve through [[x, v], ...] (x rising; v a number or a list), with no flat spots at the keys
  const spline = (K, x) => {
    const n = K.length; let i = 0; while (i < n - 2 && K[i + 1][0] < x) i++;
    const x0 = K[i][0], x1 = K[i + 1][0], dx = x1 - x0, t = cl((x - x0) / dx, 0, 1), t2 = t * t, t3 = t2 * t;
    const one = (c) => { const g = (j) => (c == null ? K[j][1] : K[j][1][c]), v0 = g(i), v1 = g(i + 1);
      const m0 = i > 0 ? (v1 - g(i - 1)) / (x1 - K[i - 1][0]) : (v1 - v0) / dx, m1 = i < n - 2 ? (g(i + 2) - v0) / (K[i + 2][0] - x0) : (v1 - v0) / dx;
      return (2 * t3 - 3 * t2 + 1) * v0 + (t3 - 2 * t2 + t) * dx * m0 + (-2 * t3 + 3 * t2) * v1 + (t3 - t2) * dx * m1; };
    return typeof K[0][1] === 'number' ? one(null) : K[0][1].map((v, c) => one(c));
  };
  const ctex = (c, rx, ry, srgb) => {
    const t = new THREE.CanvasTexture(c);
    if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); }
    t.anisotropy = 4; if (srgb !== false) t.encoding = THREE.sRGBEncoding; return t;
  };
  const TEXS = Math.max(0.5, Math.min(1, opts.textureScale == null ? 1 : +opts.textureScale)); // canvas size scale

  // ---------- palette, sampled from her sprite sheets ----------
  const PAL = {
    skin: '#fccfb0', skinSh: '#d39a84', blush: '#e88f88', lip: '#b02c46',
    black: '#141016', soft: '#231c26', char: '#2e2630',
    wine: '#7a1f43', wineDk: '#4c1029', magenta: '#b8407e', rose: '#d2617f',
    gold: '#d6a84e', goldHi: '#f5d98a', goldDk: '#8f6a25', orange: '#d98a3a',
    olive: '#6f5a2a', oliveHi: '#9a8040', oliveDk: '#3c3018',
    purple: '#7a4298', purpleHi: '#9c66ba', purpleDk: '#3c1e54', lace: '#63305e', laceHi: '#864a80',
    teal: '#3fc2b4', tealDk: '#1d7f86', white: '#e9e4ee', violet: '#b35cff', spell: '#d58bff'
  };
