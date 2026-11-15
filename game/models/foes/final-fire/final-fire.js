// final-fire.js: "The fire that would not end" (stand-in name), the final foe of Moon Faire. three.js r128 (global THREE).
// Defines makeFinalFire(opts) only. A FIRST ROUGH model, to judge the idea.
// It is the old beacon fire itself, which calls every flame on the moor to it: a black sphere like an eclipse inside a corona of
// 32 flame blades, three engraved old-gold rings turning round it, the two iron-bladed hands of its keeper still tending it,
// ash-grey streamers hanging down into its iron cradle, and four stolen lanterns hanging from the cradle's rim.
// About 8 m tall and 4.8 m wide. It stands still. Its own light is crimson and rose-white; only the four lanterns are amber.
// Everything moves as plain functions of time (no skeleton): the corona, the streamers and the iron pieces are rebuilt on the CPU
// each frame from their rest shapes. Moves: idle, blow, call, hurt, ending (ending holds; reset() starts again).
// opts: { detail 0.5 to 1 }
function makeFinalFire(opts) {
 'use strict';
 // Units are meters, Y up, facing +Z. The party stands on its -X side.
 opts = opts || {};
 const DET = Math.max(.5, Math.min(1, opts.detail === undefined ? 1 : +opts.detail || 1));
 const Q = (n, m) => Math.max(m || 3, Math.round(n * DET));
 const TAU = Math.PI * 2, PI = Math.PI;
 let seed = 77017;
 const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
 const sm = (a, b, x) => { const t = cl((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
 const lerp = (a, b, t) => a + (b - a) * t;
 const win = (u, a, b, e) => sm(a - e, a + e, u) * (1 - sm(b - e, b + e, u));
 const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
 const V3 = (x, y, z) => new THREE.Vector3(x || 0, y || 0, z || 0);
 const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
 const tex = (c) => { const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };
 const ZAX = V3(0, 0, 1), ONE = V3(1, 1, 1);
 const EUL = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'ZYX')); // x first, then y, then z
 const mk = (x, y, z, rx, ry, rz) => new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), ONE);

 // ---------- colours ----------
 const CRIM = new THREE.Color(0xd42a48), ROSE = new THREE.Color(0xffc9d2), AMB = new THREE.Color(0xffb768), WARM = new THREE.Color(0xff9c52);
 const GOLD = new THREE.Color(0xa8843f), ASH = new THREE.Color(0x6e6770), C1 = new THREE.Color();
 const gold = (k) => GOLD.clone().multiplyScalar(k);
 const SC = 5.4, SR = 1.1;                                 // the eclipse: centre height and radius

 const root = new THREE.Group(); root.name = 'FinalFire';
 const fx = new THREE.Group(); fx.name = 'FinalFireFX';  // world-space sparks and embers

 // ---------- painted textures ----------
 function radial(stops, s) { const c = cvs(s, s), g = c.getContext('2d'), h = s / 2, gr = g.createRadialGradient(h, h, 0, h, h, h); for (const [o, col] of stops) gr.addColorStop(o, col); g.fillStyle = gr; g.fillRect(0, 0, s, s); return tex(c); }
 const dotT = radial([[0, 'rgba(255,255,255,1)'], [.25, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']], 64);
 // the eclipse's rim: dark inside, a thin rose-white ring at the sphere's edge, then a crimson haze
 const rimT = radial([[0, 'rgba(0,0,0,0)'], [.44, 'rgba(255,201,210,0)'], [.468, 'rgba(255,236,240,1)'], [.49, 'rgba(255,201,210,.8)'], [.53, 'rgba(212,42,72,.5)'], [.7, 'rgba(212,42,72,.16)'], [1, 'rgba(212,42,72,0)']], 512);
 // a warm flame: for the lanterns and the last small fire
 const flameT = (() => { const c = cvs(64, 64), g = c.getContext('2d'); g.translate(32, 42); for (const [s, col] of [[1, 'rgba(255,140,60,.5)'], [.72, 'rgba(255,183,104,.85)'], [.46, 'rgba(255,226,170,1)'], [.24, 'rgba(255,250,236,1)']]) { g.fillStyle = col; g.beginPath(); g.moveTo(0, -32 * s); g.bezierCurveTo(9 * s, -15 * s, 13 * s, 2 * s, 0, 14 * s); g.bezierCurveTo(-13 * s, 2 * s, -9 * s, -15 * s, 0, -32 * s); g.fill(); } return tex(c); })();
 // the coals in the bowl
 const coalT = (() => {
  const c = cvs(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,190,200,1)'); gr.addColorStop(.35, 'rgba(255,110,130,.85)'); gr.addColorStop(.8, 'rgba(160,30,55,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 100, x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r, s = 3 + rnd() * 7, q = g.createRadialGradient(x, y, 0, x, y, s); q.addColorStop(0, 'rgba(255,240,240,.8)'); q.addColorStop(1, 'rgba(255,200,210,0)'); g.fillStyle = q; g.fillRect(x - s, y - s, s * 2, s * 2); }
  return tex(c);
 })();
 // the iron atlas: an engraved band for the rings on top (rows 0..128), hammered old-gold iron below.
 // The emissive atlas holds the same runes in crimson, so the engraving glows faintly with the fire.
 const MW = 1024, MH = 512, MC = cvs(MW, MH), M2 = MC.getContext('2d'), EC = cvs(MW / 2, MH / 2), E2 = EC.getContext('2d');
 {
  M2.fillStyle = '#a8843f'; M2.fillRect(0, 0, MW, MH); E2.fillStyle = '#000'; E2.fillRect(0, 0, MW / 2, MH / 2);
  for (let i = 0; i < 1600; i++) { const x = rnd() * MW, y = 128 + rnd() * (MH - 128), s = 3 + rnd() * 14, lt = rnd() < .4, q = M2.createRadialGradient(x, y, 0, x, y, s); q.addColorStop(0, lt ? 'rgba(235,205,140,.22)' : 'rgba(40,24,10,.3)'); q.addColorStop(1, 'rgba(0,0,0,0)'); M2.fillStyle = q; M2.fillRect(x - s, y - s, s * 2, s * 2); }
  M2.lineCap = 'round';
  for (let i = 0; i < 260; i++) { const x = rnd() * MW, y = 128 + rnd() * (MH - 128); M2.strokeStyle = rnd() < .5 ? 'rgba(30,18,8,.35)' : 'rgba(240,215,160,.18)'; M2.lineWidth = 1 + rnd() * 1.5; M2.beginPath(); M2.moveTo(x, y); M2.lineTo(x + (rnd() - .5) * 40, y + (rnd() - .5) * 20); M2.stroke(); }
  const bg = M2.createLinearGradient(0, 0, 0, 128); bg.addColorStop(0, '#5a431c'); bg.addColorStop(.12, '#c9a35a'); bg.addColorStop(.5, '#b48e48'); bg.addColorStop(.88, '#c9a35a'); bg.addColorStop(1, '#5a431c'); M2.fillStyle = bg; M2.fillRect(0, 0, MW, 128);
  M2.strokeStyle = '#3a2a12'; M2.lineWidth = 3; for (const y of [16, 24, 104, 112]) { M2.beginPath(); M2.moveTo(0, y); M2.lineTo(MW, y); M2.stroke(); }
  for (let x = 10; x < MW - 20; x += 24 + rnd() * 10) { // runes: a few strokes each
   const strokes = 2 + (rnd() * 3 | 0), pts = [];
   for (let k = 0; k < strokes; k++) pts.push([[x + rnd() * 18, 34 + rnd() * 60], [x + rnd() * 18, 34 + rnd() * 60], rnd() < .3]);
   for (const [g, sc, col, lw] of [[M2, 1, '#2e2010', 3.2], [E2, .5, 'rgba(212,42,72,1)', 1.8]]) {
    g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
    for (const [a, b, arc] of pts) { g.beginPath(); if (arc) g.arc((a[0] + b[0]) / 2 * sc, (a[1] + b[1]) / 2 * sc, 7 * sc, rnd() * TAU, rnd() * TAU + 2.5); else { g.moveTo(a[0] * sc, a[1] * sc); g.lineTo(b[0] * sc, b[1] * sc); } g.stroke(); }
   }
  }
 }
 const ironMap = tex(MC), runeMap = tex(EC);
 const uvIron = () => [.02 + rnd() * .55, .02 + rnd() * .3, .4, .4]; // a window in the iron part of the atlas
 // the streamers: four torn ash-grey strips side by side, scorched at the top
 const streamMap = (() => {
  const c = cvs(512, 512), g = c.getContext('2d');
  for (let k = 0; k < 4; k++) {
   const x0 = k * 128, L = [], Rr = [];
   for (let y = 0; y <= 440; y += 16) { const ins = 6 + y / 440 * 26; L.push([x0 + ins + rnd() * 10, y]); Rr.push([x0 + 128 - ins - rnd() * 10, y]); }
   g.save(); g.beginPath(); L.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
   const xl = L[L.length - 1][0], xr = Rr[Rr.length - 1][0], nT = 3 + (rnd() * 3 | 0);
   for (let i = 0; i < nT; i++) { const a = lerp(xl, xr, i / nT), b = lerp(xl, xr, (i + 1) / nT); g.lineTo((a + b) / 2 + (rnd() - .5) * 8, 470 + rnd() * 40); g.lineTo(b, 432 + rnd() * 18); }
   for (let i = Rr.length - 1; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]);
   g.closePath(); g.clip();
   g.fillStyle = '#6e6770'; g.fillRect(x0, 0, 128, 512);
   for (let i = 0; i < 40; i++) { const x = x0 + rnd() * 128; g.fillStyle = rnd() < .6 ? 'rgba(20,16,22,.28)' : 'rgba(190,182,192,.12)'; g.fillRect(x, 0, 1 + rnd() * 4, 512); }
   const sc = g.createLinearGradient(0, 0, 0, 120); sc.addColorStop(0, 'rgba(14,11,16,1)'); sc.addColorStop(1, 'rgba(14,11,16,0)'); g.fillStyle = sc; g.fillRect(x0, 0, 128, 120);
   const ed = g.createLinearGradient(x0, 0, x0 + 128, 0); ed.addColorStop(0, 'rgba(0,0,0,.45)'); ed.addColorStop(.3, 'rgba(0,0,0,0)'); ed.addColorStop(.7, 'rgba(0,0,0,0)'); ed.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = ed; g.fillRect(x0, 0, 128, 512);
   g.globalCompositeOperation = 'destination-out';
   for (let i = 0, n = 2 + (rnd() * 3 | 0); i < n; i++) { g.beginPath(); g.ellipse(x0 + 40 + rnd() * 48, 120 + rnd() * 300, 4 + rnd() * 9, 8 + rnd() * 22, 0, 0, TAU); g.fill(); }
   g.restore();
  }
  return tex(c);
 })();

 // ---------- the merged iron: rings, hands, cradle, lanterns and chains in one mesh, the lantern glass in another ----------
 // Each piece is put in its rest place with a part number; every frame each moving part's vertices are moved by its matrix.
 function Builder() { return { pos: [], uv: [], col: [], idx: [], part: [], nv: 0 }; }
 function addG(B, g, m, col, part, uvR) {
  if (m) g.applyMatrix4(m);
  const p = g.attributes.position, uv = g.attributes.uv, n = p.count, base = B.nv;
  for (let i = 0; i < n; i++) {
   B.pos.push(p.getX(i), p.getY(i), p.getZ(i));
   let u = uv ? uv.getX(i) : .5, v = uv ? uv.getY(i) : .5;
   if (uvR) { u = uvR[0] + cl(u, 0, 1) * uvR[2]; v = uvR[1] + cl(v, 0, 1) * uvR[3]; }
   B.uv.push(u, v); B.col.push(col.r, col.g, col.b); B.part.push(part);
  }
  if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i++) B.idx.push(a[i] + base); } else for (let i = 0; i < n; i++) B.idx.push(base + i);
  B.nv += n; g.dispose();
 }
 function finish(B, mat) {
  const g = new THREE.BufferGeometry(), pos = new Float32Array(B.pos);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(B.col, 3));
  g.setIndex(B.nv > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
  g.computeVertexNormals();
  const lists = {}; B.part.forEach((p, i) => { if (p >= 0) (lists[p] = lists[p] || []).push(i); });
  const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false;
  return { mesh, g, pos, base: pos.slice(), parts: Object.keys(lists).map((p) => ({ p: +p, v: Int32Array.from(lists[p]) })) };
 }
 function applyParts(R, mats) {
  const pos = R.pos, b = R.base;
  for (const { p, v } of R.parts) {
   const e = mats[p].elements;
   for (let k = 0; k < v.length; k++) { const i = v[k] * 3, x = b[i], y = b[i + 1], z = b[i + 2]; pos[i] = e[0] * x + e[4] * y + e[8] * z + e[12]; pos[i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; pos[i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14]; }
  }
  R.g.attributes.position.needsUpdate = true;
 }
 const MB = Builder(), GB = Builder();
 const NPART = 9, mats = []; for (let i = 0; i < NPART; i++) mats.push(new THREE.Matrix4());
 const P_RING = 0, P_HAND = 3, P_LANT = 5;

 // three engraved bands, each in its own XY plane (axis +Z), with raised lips along both edges; the outer face carries the runes
 function ringGeo(R, h, t, segs) {
  const L = .03, hh = h / 2, prof = [[-t, -hh], [t, -hh], [t + L, -hh + .02], [t + L, -hh + .045], [t, -hh + .055], [t, hh - .055], [t + L, hh - .045], [t + L, hh - .02], [t, hh], [-t, hh]];
  const pos = [], uv = [], idx = []; let nv = 0;
  for (let e = 0; e < prof.length; e++) {
   const a = prof[e], b = prof[(e + 1) % prof.length], face = e === 4;
   for (let s = 0; s <= segs; s++) {
    const an = s / segs * TAU, c = Math.cos(an), si = Math.sin(an);
    for (const [q, w] of [[a, 0], [b, 1]]) { const r = R + q[0]; pos.push(r * c, r * si, q[1]); if (face) uv.push(s / segs, 1 - (8 + w * 112) / MH); else uv.push(.3 + .4 * s / segs, .3 + .02 * w); }
   }
   for (let s = 0; s < segs; s++) { const i = nv + s * 2; idx.push(i, i + 2, i + 1, i + 1, i + 2, i + 3); }
   nv += (segs + 1) * 2;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
 }
 const RINGS = [
  { R: 1.7, tilt: EUL(.32, .5, .12), spin: .22, prec: .05 },
  { R: 1.85, tilt: EUL(.1, 1.3, .38), spin: -.15, prec: -.035 },
  { R: 2.0, tilt: EUL(1.3, .05, -.3), spin: .09, prec: .025 }
 ];
 RINGS.forEach((r, i) => { addG(MB, ringGeo(r.R, .2, .035, Q(128, 48)), null, gold(1), P_RING + i, null); r.jolt = V3((rnd() - .5) * 1.1, (rnd() - .5) * 1.1, (rnd() - .5) * 1.1); r.ang = rnd() * TAU; });

 // a blade of beaten iron along +Y: a diamond section, edges along +-X, ridges along +-Z, a pointed tip
 function bladeGeo(len, wid, th, segs) {
  const pos = [], uv = [], idx = [];
  for (let s = 0; s <= segs; s++) { const f = s / segs, w = wid * (.6 + .4 * sm(0, .25, f)) * Math.pow(1 - f, .65) + 1e-4, d = th * (1 - .6 * f) + 1e-4, y = len * f; pos.push(w, y, 0, 0, y, d, -w, y, 0, 0, y, -d); for (let k = 0; k < 4; k++) uv.push(k / 4, f); }
  for (let s = 0; s < segs; s++) for (let k = 0; k < 4; k++) { const a = s * 4 + k, b = s * 4 + (k + 1) % 4; idx.push(a, b, a + 4, b, b + 4, a + 4); }
  const n0 = (segs + 1) * 4; pos.push(0, 0, 0); uv.push(.5, 0); for (let k = 0; k < 4; k++) idx.push(n0, (k + 1) % 4, k);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
 }
 // the keeper's hand: wrist at the origin, fingers up +Y, palm toward +Z, thumb toward +X (sx = -1 mirrors it)
 function buildHand(part, sx) {
  const S = new THREE.Matrix4().makeScale(sx, 1, 1), put = (g, m, k) => addG(MB, g, S.clone().multiply(m), gold(k), part, uvIron());
  const bs = Q(8, 4), fs = Q(6, 3);
  for (let k = 0; k < 6; k++) { const x = lerp(-.25, .25, k / 5); put(bladeGeo(.82, .125, .035, bs), mk(x * .5, -.12, -.03 + .03 * (k % 2), .05, 0, -x * .45), .55 + .3 * rnd()); }
  for (let k = 0; k < 5; k++) put(bladeGeo(.38, .075, .03, fs), mk(lerp(-.2, .2, k / 4), .06, -.04, PI + .25 * (rnd() - .5), 0, .25 * (rnd() - .5)), .35 + .2 * rnd());
  const FX = [-.2, -.068, .068, .2], FL = [.85, 1, .95, .75];
  for (let f = 0; f < 4; f++) {
   let m = mk(FX[f], .6, .02, .18, 0, -FX[f] * .5); const seg = [.3, .25, .2].map((v) => v * FL[f]);
   for (let j = 0; j < 3; j++) { put(bladeGeo(seg[j] + .06, .064 - .008 * j, .04, fs), m.clone(), .7 + .28 * rnd()); m.multiply(mk(0, seg[j], 0, .34, 0, 0)); }
   put(bladeGeo(.2, .078, .05, fs), mk(FX[f], .48, .05, .12, 0, -FX[f] * .5), .95);
  }
  let m = mk(.24, .1, .05, .35, 0, -.85);
  for (let j = 0; j < 2; j++) { put(bladeGeo(.3, .072, .04, fs), m.clone(), .75 + .2 * rnd()); m.multiply(mk(0, .26, 0, .28, 0, .1)); }
 }
 buildHand(P_HAND, 1); buildHand(P_HAND + 1, -1);
 const HAND_TIP = V3(0, 1.25, .1), HAND_WRIST = V3(0, -.04, -.02);

 // the cradle: a brazier bowl on three legs, 1.4 m tall and 2.6 m across, with four hooks for the stolen lanterns
 const DARK = gold(.42), MID = gold(.75);
 {
  const prof = [[.02, .7], [.3, .7], [.62, .78], [.95, .95], [1.17, 1.16], [1.27, 1.35], [1.3, 1.4], [1.22, 1.41], [1.1, 1.24], [.87, 1.04], [.55, .9], [.02, .86]].map((p) => new THREE.Vector2(p[0], p[1]));
  addG(MB, new THREE.LatheGeometry(prof, Q(48, 20)), null, DARK, -1, uvIron());
  addG(MB, new THREE.TorusGeometry(1.27, .055, 6, Q(48, 20)), mk(0, 1.4, 0, PI / 2, 0, 0), MID, -1, uvIron());
  for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + .1; addG(MB, new THREE.ConeGeometry(.06, .3, 5), new THREE.Matrix4().makeRotationY(-a).multiply(mk(1.27, 1.52, 0, 0, 0, -.35)), MID, -1, uvIron()); }
  addG(MB, new THREE.CylinderGeometry(.13, .22, .34, 8), mk(0, .55, 0), DARK, -1, uvIron());
  addG(MB, new THREE.SphereGeometry(.17, 8, 6), mk(0, .38, 0), MID, -1, uvIron());
  for (let k = 0; k < 3; k++) {
   const a = PI / 2 + k * TAU / 3, c = Math.cos(a), s = Math.sin(a), P = (r, y) => V3(c * r, y, s * r);
   const curve = new THREE.CatmullRomCurve3([P(.45, .84), P(.9, .66), P(1.12, .36), P(1.13, .12), P(1.24, .05)]);
   addG(MB, new THREE.TubeGeometry(curve, Q(16, 8), .075, 6, false), null, DARK, -1, uvIron());
   addG(MB, new THREE.ConeGeometry(.11, .3, 6), new THREE.Matrix4().makeRotationY(-a).multiply(mk(1.32, .06, 0, 0, 0, -PI / 2)), MID, -1, uvIron());
   addG(MB, new THREE.TorusGeometry(.1, .03, 4, 8), new THREE.Matrix4().makeRotationY(-a).multiply(mk(1.05, .5, 0, PI / 2, 0, .5)), MID, -1, uvIron());
  }
 }
 const LANT = [{ a: PI - .44, len: .3 }, { a: PI + .62, len: .55 }, { a: .44, len: .45 }, { a: -.62, len: .26 }].map((l, i) => {
  const c = Math.cos(l.a), s = Math.sin(l.a), P = (r, y) => V3(c * r, y, s * r);
  addG(MB, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([P(1.24, 1.36), P(1.6, 1.5), P(1.86, 1.56), P(1.96, 1.5), P(1.95, 1.42)]), Q(10, 5), .03, 5, false), null, DARK, -1, uvIron());
  return Object.assign(l, { hook: P(1.95, 1.42), side: Math.sign(c), i });
 });
 // a stolen lantern hangs from the origin on its chain
 function buildLantern(part, Lc) {
  const n = Math.max(3, Math.round(Lc / .07));
  for (let k = 0; k < n; k++) addG(MB, new THREE.TorusGeometry(.032, .009, 4, Q(8, 5)), mk(0, -.032 - k * (Lc / n), 0, 0, (k % 2) * PI / 2, 0), DARK, part, uvIron());
  const y0 = -Lc - .02, F = gold(.55);
  addG(MB, new THREE.TorusGeometry(.065, .012, 4, Q(10, 6)), mk(0, y0 - .05, 0), F, part, uvIron());
  addG(MB, new THREE.ConeGeometry(.17, .14, 8), mk(0, y0 - .17, 0), F, part, uvIron());
  addG(MB, new THREE.CylinderGeometry(.16, .16, .03, 8), mk(0, y0 - .25, 0), gold(.8), part, uvIron());
  for (let k = 0; k < 4; k++) { const a = k * PI / 2 + PI / 4; addG(MB, new THREE.BoxGeometry(.025, .3, .025), mk(Math.cos(a) * .125, y0 - .41, Math.sin(a) * .125), F, part, uvIron()); }
  addG(MB, new THREE.CylinderGeometry(.155, .13, .05, 8), mk(0, y0 - .58, 0), gold(.8), part, uvIron());
  addG(MB, new THREE.ConeGeometry(.05, .11, 6), mk(0, y0 - .66, 0, PI, 0, 0), F, part, uvIron());
  addG(GB, new THREE.CylinderGeometry(.12, .12, .3, 8, 1, true), mk(0, y0 - .41, 0), AMB, part, null);
  return V3(0, y0 - .41, 0);
 }
 LANT.forEach((l) => { l.centre = buildLantern(P_LANT + l.i, l.len); });

 const ironMat = new THREE.MeshPhongMaterial({ map: ironMap, vertexColors: true, flatShading: true, shininess: 26, specular: 0x5a4020, emissive: 0xffffff, emissiveMap: runeMap, emissiveIntensity: .9, side: THREE.DoubleSide });
 const IRON = finish(MB, ironMat); IRON.mesh.name = 'Iron'; root.add(IRON.mesh);
 const glassMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .92, depthWrite: false, side: THREE.DoubleSide });
 const GLASS = finish(GB, glassMat); GLASS.mesh.name = 'LanternGlass'; GLASS.mesh.renderOrder = 5; root.add(GLASS.mesh);

 // ---------- the eclipse ----------
 const sphMat = new THREE.MeshPhongMaterial({ color: 0x0e0b10, specular: 0x160a0e, shininess: 6 });
 const sphere = new THREE.Mesh(new THREE.SphereGeometry(SR, Q(64, 24), Q(40, 16)), sphMat); sphere.position.y = SC; sphere.name = 'Eclipse'; root.add(sphere);
 const rim = new THREE.Sprite(new THREE.SpriteMaterial({ map: rimT, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
 const RIM_S = 2 * SR / .468; rim.scale.setScalar(RIM_S); rim.position.y = SC; rim.renderOrder = 3; rim.name = 'EclipseRim'; root.add(rim);

 // ---------- the corona: 32 flame blades in one mesh, rebuilt each frame ----------
 const NB = 32, BS = Q(20, 8), BCOL = 4, BV = (BS + 1) * (BCOL + 1);
 const BL = [];
 for (let i = 0; i < NB; i++) {
  const th = (i + (rnd() - .5) * .35) / NB * TAU, back = i % 2 === 1;
  const d = V3(Math.sin(th), Math.cos(th), (back ? -.3 : .22) + (rnd() - .5) * .25).normalize();
  const w = new THREE.Vector3().crossVectors(d, ZAX).normalize().applyAxisAngle(d, (rnd() - .5) * .6), n = new THREE.Vector3().crossVectors(w, d);
  const reach = 2.42 + .18 * Math.max(0, Math.cos(th)) + .08 * Math.max(0, -Math.cos(th)), R0 = SR * .9;
  BL.push({ th, d, w, n, R0, L: (reach - R0) * (back ? 1 : .7) * (.92 + .08 * rnd()), W: back ? .21 : .16, br: back ? 1 : .85, f1: 2.1 + rnd() * 1.6, f2: 2.2 + rnd() * 1.2, p1: rnd() * 9, p2: rnd() * 9, p3: rnd() * 9, puffed: false });
 }
 BL.map((b, i) => [Math.abs(wrapA(b.th)), i]).sort((a, b) => b[0] - a[0]).forEach(([, i], r) => { BL[i].outU = .04 + .46 * r / (NB - 1); }); // bottom first, the top one last
 const BG = new THREE.BufferGeometry();
 BG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NB * BV * 3), 3).setUsage(THREE.DynamicDrawUsage));
 BG.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NB * BV * 3), 3).setUsage(THREE.DynamicDrawUsage));
 { const idx = []; for (let i = 0; i < NB; i++) for (let s = 0; s < BS; s++) for (let c = 0; c < BCOL; c++) { const a = i * BV + s * (BCOL + 1) + c, b = a + BCOL + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); } BG.setIndex(idx); }
 const blades = new THREE.Mesh(BG, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
 blades.frustumCulled = false; blades.renderOrder = 4; blades.name = 'Corona'; root.add(blades);

 // ---------- the streamers: twelve torn ash-grey strips in one mesh, rebuilt each frame ----------
 const NS = 12, SS = Q(24, 10), SCOL = 3, SV = (SS + 1) * (SCOL + 1);
 const ST = [];
 for (let k = 0; k < NS; k++) {
  const a = k / NS * TAU + (rnd() - .5) * .3, o = V3(Math.cos(a), 0, Math.sin(a)), y = SC - .72;
  ST.push({ A: V3(o.x * .82, y, o.z * .82), o, tg: V3(-o.z, 0, o.x), len: y - 1.4 - rnd() * .55, ph: rnd() * 9, v: k % 4 });
 }
 const SG = new THREE.BufferGeometry();
 SG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * SV * 3), 3).setUsage(THREE.DynamicDrawUsage));
 { const uv = [], idx = []; for (let k = 0; k < NS; k++) { for (let s = 0; s <= SS; s++) for (let c = 0; c <= SCOL; c++) uv.push((ST[k].v + .06 + .88 * c / SCOL) / 4, 1 - s / SS); for (let s = 0; s < SS; s++) for (let c = 0; c < SCOL; c++) { const a = k * SV + s * (SCOL + 1) + c, b = a + SCOL + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); } } SG.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); SG.setIndex(idx); }
 const streamMat = new THREE.MeshLambertMaterial({ map: streamMap, alphaTest: .45, transparent: true, side: THREE.DoubleSide, color: 0x77727a, emissive: 0x302b33 }); // dimmer under the crimson light, so it stays ash grey
 const streamers = new THREE.Mesh(SG, streamMat); streamers.frustumCulled = false; streamers.name = 'Streamers'; root.add(streamers);

 // ---------- the coals in the bowl and the one light ----------
 const coalMat = new THREE.MeshBasicMaterial({ map: coalT, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: CRIM.clone() });
 const coal = new THREE.Mesh(new THREE.CircleGeometry(1.12, Q(24, 12)), coalMat); coal.rotation.x = -PI / 2; coal.position.y = 1.25; coal.renderOrder = 4; coal.name = 'Coals'; root.add(coal);
 const light = new THREE.PointLight(CRIM.clone(), 2.4, 18, 1.4); light.position.set(0, SC, 2.6); light.name = 'FireLight'; root.add(light);

 // ---------- points: world-sized soft sprites with their own colour and size (as in the wraith) ----------
 const PV = 'attribute vec4 aCol; attribute float aSize; uniform float uScale; varying vec4 vC;\nvoid main(){ vC = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aCol.a > 0.002 ? aSize * uScale * projectionMatrix[1][1] / -mv.z : 0.0; }';
 const PF = 'uniform sampler2D uMap; varying vec4 vC;\nvoid main(){ vec4 t = texture2D(uMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)); gl_FragColor = vec4(vC.rgb * t.rgb, vC.a * t.a); }';
 const _v2 = new THREE.Vector2();
 function points(n, map, order) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 4), size = new Float32Array(n), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('aCol', new THREE.BufferAttribute(col, 4).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  const m = new THREE.ShaderMaterial({ uniforms: { uMap: { value: map }, uScale: { value: 400 } }, vertexShader: PV, fragmentShader: PF, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(g, m); p.frustumCulled = false; p.renderOrder = order || 8;
  p.onBeforeRender = (r) => { r.getDrawingBufferSize(_v2); m.uniforms.uScale.value = _v2.y * .5; };
  return { p, pos, col, size, g, n, m, vel: new Float32Array(n * 3), life: new Float32Array(n), max: new Float32Array(n).fill(1), base: new Float32Array(n * 4), sz: new Float32Array(n * 2), drag: new Float32Array(n), up: new Float32Array(n), next: 0, live: 2 };
 }
 const GL = points(10, dotT, 6); root.add(GL.p);   // glows: 0-3 lantern halos, 4 eclipse flash, 5 bowl, 6-7 the keeper's wrists, 8 the last flame, 9 the blow
 const FP = points(5, flameT, 9); root.add(FP.p);  // flames: 0-3 inside the lanterns, 4 the last small fire
 const MO = points(Q(420, 240), dotT, 8); fx.add(MO.p); // embers, the called flames, sparks
 function setP(P, i, p, c, a, s) { P.pos[i * 3] = p.x; P.pos[i * 3 + 1] = p.y; P.pos[i * 3 + 2] = p.z; P.col[i * 4] = c.r; P.col[i * 4 + 1] = c.g; P.col[i * 4 + 2] = c.b; P.col[i * 4 + 3] = cl(a, 0, 1); P.size[i] = s; }
 function flushP(P) { P.g.attributes.position.needsUpdate = true; P.g.attributes.aCol.needsUpdate = true; P.g.attributes.aSize.needsUpdate = true; }
 function emit(P, x, y, z, vx, vy, vz, life, c, a, s0, s1, drag, up) {
  const i = P.next; P.next = (i + 1) % P.n; P.live = 2;
  P.pos[i * 3] = x; P.pos[i * 3 + 1] = y; P.pos[i * 3 + 2] = z; P.vel[i * 3] = vx; P.vel[i * 3 + 1] = vy; P.vel[i * 3 + 2] = vz;
  P.life[i] = P.max[i] = life; P.base[i * 4] = c.r; P.base[i * 4 + 1] = c.g; P.base[i * 4 + 2] = c.b; P.base[i * 4 + 3] = a; P.sz[i * 2] = s0; P.sz[i * 2 + 1] = s1; P.drag[i] = drag || 0; P.up[i] = up || 0;
 }
 function stepP(P, dt, fadeIn) {
  if (P.live <= 0) return;
  const pos = P.pos, vel = P.vel, col = P.col; let alive = 0;
  for (let i = 0; i < P.n; i++) {
   if (P.life[i] <= 0) { if (col[i * 4 + 3] !== 0) { col[i * 4 + 3] = 0; P.size[i] = 0; } continue; }
   alive++; P.life[i] -= dt; const age = 1 - Math.max(0, P.life[i]) / P.max[i], dr = Math.exp(-P.drag[i] * dt);
   vel[i * 3] *= dr; vel[i * 3 + 1] = vel[i * 3 + 1] * dr + P.up[i] * dt; vel[i * 3 + 2] *= dr;
   pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
   const k = Math.min(1, age / (fadeIn || .15)) * (1 - age);
   col[i * 4] = P.base[i * 4]; col[i * 4 + 1] = P.base[i * 4 + 1]; col[i * 4 + 2] = P.base[i * 4 + 2]; col[i * 4 + 3] = P.base[i * 4 + 3] * k;
   P.size[i] = lerp(P.sz[i * 2], P.sz[i * 2 + 1], age);
  }
  if (!alive) P.live--;
  flushP(P);
 }
 function clearP(P) { P.life.fill(0); P.col.fill(0); P.size.fill(0); P.live = 0; flushP(P); }

 // ---------- moves ----------
 const ACTS = {
  idle: { dur: .01, hits: [], cues: [], hold: false, interrupt: true },
  blow: { dur: 1.6, hits: [.5], cues: [.28], hold: false, interrupt: false },          // the hit lands at 0.8 s
  call: { dur: 4, hits: [.78], cues: [.14], hold: false, interrupt: false },          // the flames stream in from 0.56 s, the burst at 3.1 s
  hurt: { dur: .8, hits: [], cues: [], hold: false, interrupt: true },
  ending: { dur: 7, hits: [], cues: [.6], hold: true, interrupt: true }               // holds at its end; reset() starts again
 };
 // the keeper's hands: rest, the blow (the -X hand only), the call, and where they lie at the end
 const HB = [{ p: V3(2.3, 2.75, .3), q: EUL(.25, -PI / 2 + .8, .35) }, { p: V3(-2.3, 2.75, .3), q: EUL(.25, PI / 2 - .8, -.35) }]; // palms half toward the fire, half toward us
 const HS = V3(1.15, 1.15, 1.15);
 const HC = [{ p: V3(2.8, 4.0, .7), q: EUL(.1, -.6, .55) }, { p: V3(-2.8, 4.0, .7), q: EUL(.1, .6, -.55) }];
 const HR = [{ p: V3(2.8, .32, 1.3), q: EUL(-PI / 2 + .15, PI / 2, 0) }, { p: V3(-2.8, .32, 1.3), q: EUL(-PI / 2 + .15, -PI / 2, 0) }];
 const BLOWK = [[0, HB[1].p, HB[1].q], [.28, V3(-2.7, 4.6, .7), EUL(PI / 2, -PI / 2, -.9)], [.5, V3(-4.1, 1.15, .9), EUL(PI / 2, -PI / 2, .45)], [.66, V3(-4.0, 1.05, .9), EUL(PI / 2, -PI / 2, .4)], [1, HB[1].p, HB[1].q]];
 function poseAt(keys, u, p, q) {
  let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1], f = sm(a[0], b[0], u);
  p.copy(a[1]).lerp(b[1], f); q.copy(a[2]).slerp(b[2], f);
 }
 const ALIGN = EUL(.1, -.5, 0);                 // the disc the rings line up into, turned toward the party
 const FLAT = RINGS.map((r, i) => EUL(-PI / 2 + (rnd() - .5) * .12, i * 1.1, (rnd() - .5) * .12));

 const state = { glow: 1 };
 let actv = null, fadeE = 1, lastName = '', lastU = 0, snap = true;
 const S = { lean: 0, align: 0, flare: 0, flash: 0, blowFlash: 0, acc: { ember: 0, pull: 0, ash: 0, spark: 0 } };
 const HP = [V3(), V3()], HQ = [new THREE.Quaternion(), new THREE.Quaternion()], RQ = RINGS.map(() => new THREE.Quaternion());
 const _a = V3(), _b = V3(), _c = V3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler(), tp = V3(), tq = new THREE.Quaternion();
 const W = (v) => root.localToWorld(v);

 function play(name, force) {
  const def = ACTS[name]; if (!def) return false;
  if (actv && actv.name === 'ending') return false;                  // it stays ended until reset()
  if (name === 'idle') { actv = null; return true; }
  if (actv && !force && !def.interrupt) return false;
  actv = { name, def, t: 0 };
  if (name === 'ending') for (const b of BL) b.puffed = false;
  return true;
 }
 function reset() {
  actv = null; lastName = ''; lastU = 0; snap = true;
  S.lean = S.align = S.flare = S.flash = S.blowFlash = 0;
  for (const b of BL) b.puffed = false;
  sphMat.transparent = false; sphMat.opacity = 1; sphMat.needsUpdate = true; streamMat.opacity = 1;
  clearP(MO);
 }

 function animate(phase, walk, t, dt) {
  // phase and walk are kept for the same call as the other foes; this one stands still
  dt = dt > 0 ? Math.min(dt, .05) : 0;
  let u = 0, name = '';
  if (actv) { actv.t += dt; u = Math.min(1, actv.t / actv.def.dur); name = actv.name; if (u >= 1 && !actv.def.hold) actv = null; }
  const ended = name === 'ending', eU = ended ? u : 0, eT = ended ? actv.t : 0, fresh = name !== lastName || u < lastU;
  const kk = (r) => (snap || dt <= 0 ? 1 : 1 - Math.exp(-dt * r));
  const sg = (state.glow === undefined ? 1 : +state.glow) * fadeE;
  // the envelopes of each move, all zero at its ends
  const callU = name === 'call' ? u : -1;
  S.align += ((callU >= 0 ? sm(.04, .3, callU) * (1 - sm(.84, 1, callU)) : 0) - S.align) * kk(10);
  S.lean += ((callU >= 0 ? sm(.12, .42, callU) * (1 - sm(.74, .79, callU)) : 0) - S.lean) * kk(14);
  S.flare += ((callU >= 0 ? sm(.76, .79, callU) * (1 - sm(.8, 1, callU)) : 0) - S.flare) * kk(25);
  const pull = callU >= 0 ? win(callU, .14, .74, .03) : 0;
  const hurtK = name === 'hurt' ? sm(0, .05, u) * (1 - sm(.1, 1, u)) : 0, hurtS = hurtK * (.7 + .3 * Math.sin(u * 55));
  const blowK = name === 'blow' ? win(u, .25, .7, .1) : 0;
  const endK = ended ? sm(.48, .86, eU) : 0, finalK = ended ? sm(.6, .86, eU) : 0, crimK = ended ? 1 - sm(.38, .72, eU) : 1;
  if (name === 'call' && (fresh ? 0 : lastU) < ACTS.call.hits[0] && u >= ACTS.call.hits[0]) {
   S.flash = 1; // the burst
   for (let i = 0; i < 170; i++) { _c.set(rnd() - .5, rnd() - .5, (rnd() - .5) * .5).normalize(); W(_a.set(_c.x * SR, SC + _c.y * SR, _c.z * SR)); const sp = 3 + rnd() * 5; emit(MO, _a.x, _a.y, _a.z, _c.x * sp, _c.y * sp, _c.z * sp, 1 + rnd() * .6, rnd() < .5 ? ROSE : CRIM, 1, .22, .05, 1.4); }
  }
  S.flash = Math.max(0, S.flash - dt * 1.4);
  S.blowFlash = Math.max(0, S.blowFlash - dt * 2.5);

  // the rings: three slow speeds; in the call they line up into one disc and whirl; hurt jolts them; at the end they slow and sink
  const spinK = ended ? 1 - sm(.05, .5, eU) : 1 + 6 * S.align;
  RINGS.forEach((r, i) => {
   r.ang += dt * r.spin * spinK;
   tq.setFromAxisAngle(_a.set(0, 1, 0), t * r.prec).multiply(r.tilt);
   tq.slerp(ALIGN, S.align); if (endK > 0) tq.slerp(FLAT[i], sm(.3, .8, eU));
   RQ[i].slerp(tq, kk(8)); if (snap) RQ[i].copy(tq);
   _q.setFromEuler(_e.set(r.jolt.x * hurtS * .5, r.jolt.y * hurtS * .5, r.jolt.z * hurtS * .5));
   _q.multiply(RQ[i]).multiply(_q2.setFromAxisAngle(ZAX, r.ang));
   const sink = ended ? Math.pow(sm(.32, .82, eU), 1.6) : 0;
   mats[P_RING + i].compose(_a.set(.04 * hurtS * r.jolt.x, lerp(SC, .11 + .05 * i, sink), 0), _q, ONE);
  });
  // the keeper's hands
  for (let h = 0; h < 2; h++) {
   const sx = h ? -1 : 1, calm = 1 - endK;
   tp.copy(HB[h].p).add(_a.set(.06 * Math.sin(t * .6 + h * 2) * calm, .1 * Math.sin(t * .8 + h) * calm, .05 * Math.sin(t * .5 + h * 3) * calm)); tq.copy(HB[h].q);
   if (name === 'blow' && h === 1) { poseAt(BLOWK, u, tp, tq); }
   tq.multiply(_q.setFromEuler(_e.set(.06 * Math.sin(t * .7 + h) * calm, .08 * Math.sin(t * .5 + h * 2) * calm, .05 * Math.sin(t * .9 + h) * calm)));
   if (S.align > 0) { tp.lerp(HC[h].p, S.align); tq.slerp(HC[h].q, S.align); tp.x += sx * .5 * S.flash; }
   if (hurtK > 0) { tp.x += sx * .35 * hurtS; tp.y += .2 * hurtS; tq.multiply(_q.setFromEuler(_e.set(.35 * hurtS, 0, -sx * .3 * hurtS))); }
   if (endK > 0) { tp.lerp(HR[h].p, endK); tq.slerp(HR[h].q, endK); }
   const r = name === 'blow' ? 16 : 9;
   HP[h].lerp(tp, kk(r)); HQ[h].slerp(tq, kk(r)); if (snap) { HP[h].copy(tp); HQ[h].copy(tq); }
   mats[P_HAND + h].compose(HP[h], HQ[h], HS);
  }
  if (name === 'blow' && (fresh ? 0 : lastU) < ACTS.blow.hits[0] && u >= ACTS.blow.hits[0]) {
   S.blowFlash = 1; _b.copy(HAND_TIP).multiplyScalar(.6).applyMatrix4(mats[P_HAND + 1]); W(_b);
   for (let i = 0; i < 50; i++) emit(MO, _b.x, _b.y, _b.z, -2 - rnd() * 3, rnd() * 2.5, (rnd() - .5) * 3, .5 + rnd() * .4, rnd() < .6 ? CRIM : ROSE, 1, .14, .03, 2, -4);
  }
  // the stolen lanterns swing on their chains; at the end they drift up and away
  LANT.forEach((l, i) => {
   const sw = 1 + 2.5 * blowK + 3 * hurtK + 1.5 * S.flare, tau = ended ? eT - (4.4 + .5 * i) : -1;
   let ax = (.08 * Math.sin(t * 1.4 + i * 1.3)) * sw, az = (.1 * Math.sin(t * 1.1 + i * 2.1)) * sw, ry = 0;
   _a.copy(l.hook);
   if (tau > 0) { _a.x += l.side * .3 * tau + .12 * Math.sin(tau * 1.5 + i); _a.y += .8 * tau + .15 * tau * tau; _a.z += .25 * Math.sin(tau * .8 + i); ry = tau * .5; ax *= .5; az *= .5; }
   mats[P_LANT + i].compose(_a, _q.setFromEuler(_e.set(ax, ry, az)), _a.y > 30 ? _b.set(0, 0, 0) : ONE);
  });
  applyParts(IRON, mats); applyParts(GLASS, mats);
  ironMat.emissiveIntensity = (.9 + .7 * S.lean + 1.6 * S.flash + .5 * hurtK) * (ended ? 1 - sm(.1, .5, eU) : 1) * sg;

  // the corona
  const bp = BG.attributes.position.array, bc = BG.attributes.color.array, waveC = name === 'hurt' ? u * TAU * 1.1 : 0, waveK = name === 'hurt' ? 1 - sm(.6, 1, u) : 0;
  for (let i = 0; i < NB; i++) {
   const b = BL[i], fl = 1 + .07 * Math.sin(t * b.f1 + b.p1) + .05 * Math.sin(t * 6.3 + b.p2);
   const wv = waveK * Math.exp(-Math.pow(wrapA(b.th - waveC), 2) * 5);
   const out = ended ? 1 - sm(b.outU, b.outU + .045, eU) : 1;
   const L = b.L * fl * (1 + .4 * wv + .45 * S.flare) * (.12 + .88 * out);
   const br = b.br * (1 + .9 * wv + .6 * S.flare + .25 * S.lean + .5 * S.flash) * Math.pow(out, .8) * sg;
   if (ended && !b.puffed && eU >= b.outU + .02) { // a blade goes out with a puff of embers at its tip
    b.puffed = true; W(_a.copy(b.d).multiplyScalar(b.R0 + b.L * .7).add(_b.set(0, SC, 0)));
    for (let k = 0; k < 10; k++) emit(MO, _a.x, _a.y, _a.z, (rnd() - .5) * .8 + b.d.x * .5, .3 + rnd() * .6, (rnd() - .5) * .8, 1 + rnd() * .8, rnd() < .5 ? ROSE : CRIM, .9, .09, .02, .8);
   }
   for (let s = 0; s <= BS; s++) {
    const f = s / BS, ff = f * f;
    const lick = .1 * L * Math.pow(f, 1.5) * Math.sin(t * b.f2 + b.p3 - f * 5), lick2 = .06 * L * f * Math.sin(t * 1.9 + b.p2 + f * 2);
    const r = b.R0 + f * L * (1 - .45 * S.lean * f);
    const cx = b.d.x * r + b.w.x * lick + b.n.x * lick2 - .35 * blowK * L * ff;
    const cy = SC + b.d.y * r + b.w.y * lick + b.n.y * lick2;
    const cz = b.d.z * r + b.w.z * lick + b.n.z * lick2 + .9 * S.lean * L * ff;
    const hw = b.W * Math.pow(Math.sin(PI * Math.pow(f, .7)), .9) * (1 + .2 * S.flare) + .002;
    const cf = Math.pow(f, 1.1), cr = lerp(CRIM.r * .75, ROSE.r, cf), cg = lerp(CRIM.g * .6, ROSE.g, cf), cb = lerp(CRIM.b * .7, ROSE.b, cf), bf = br * (.75 + .5 * f);
    for (let c = 0; c <= BCOL; c++) {
     const a = c / BCOL * 2 - 1, j = (i * BV + s * (BCOL + 1) + c) * 3, e = (1 - .72 * Math.pow(Math.abs(a), 1.6)) * bf;
     bp[j] = cx + b.w.x * hw * a; bp[j + 1] = cy + b.w.y * hw * a; bp[j + 2] = cz + b.w.z * hw * a;
     bc[j] = cr * e; bc[j + 1] = cg * e; bc[j + 2] = cb * e;
    }
   }
  }
  BG.attributes.position.needsUpdate = true; BG.attributes.color.needsUpdate = true;

  // the streamers
  const drop = ended ? sm(.3, .62, eU) : 0, sp = SG.attributes.position.array, swK = 1 + 1.5 * S.flare + 2.5 * hurtK;
  streamMat.opacity = 1 - sm(.42, .62, eU); streamers.visible = streamMat.opacity > .01;
  for (let k = 0; k < NS; k++) {
   const st = ST[k];
   for (let s = 0; s <= SS; s++) {
    const f = s / SS, f15 = Math.pow(f, 1.5);
    const sx = (.2 * Math.sin(t * .9 + st.ph) + .08 * Math.sin(t * 2.1 + st.ph * 2 + f * 4)) * f15 * swK - .5 * blowK * f * f + .4 * pull * f * f + st.o.x * .18 * f;
    const sz = (.15 * Math.cos(t * .7 + st.ph * 1.3) + .06 * Math.sin(t * 1.7 + f * 3)) * f15 * swK + st.o.z * .18 * f;
    const y = st.A.y - f * st.len - drop * (1.2 + 2.2 * Math.sqrt(f)) * drop, hw = .16 * (1 - .35 * f);
    const tw = .5 * Math.sin(t * .8 + st.ph + f * 2.5) * f, tx = st.tg.x * Math.cos(tw) + st.o.x * Math.sin(tw), tz = st.tg.z * Math.cos(tw) + st.o.z * Math.sin(tw);
    for (let c = 0; c <= SCOL; c++) { const a = c / SCOL * 2 - 1, j = (k * SV + s * (SCOL + 1) + c) * 3; sp[j] = st.A.x + sx + tx * hw * a; sp[j + 1] = y; sp[j + 2] = st.A.z + sz + tz * hw * a; }
   }
  }
  SG.attributes.position.needsUpdate = true; SG.computeVertexNormals();

  // the eclipse, its rim, the coals and the light
  const sOp = ended ? 1 - sm(.42, .72, eU) : 1;
  if ((sOp < 1) !== sphMat.transparent) { sphMat.transparent = sOp < 1; sphMat.needsUpdate = true; }
  sphMat.opacity = sOp; sphere.visible = sOp > .005;
  sphere.scale.setScalar((1 + .012 * Math.sin(t * 1.3) + .05 * S.flash) * (ended ? lerp(1, .55, sm(.42, .72, eU)) : 1));
  sphere.position.set(.06 * hurtS, SC + .04 * hurtS, 0); rim.position.copy(sphere.position);
  const rk = (1 + 1.2 * S.flash + .6 * hurtK + .25 * S.lean) * (ended ? 1 - sm(.36, .66, eU) : 1) * sg;
  rim.material.color.setRGB(rk, rk, rk); rim.scale.setScalar(RIM_S * sphere.scale.x * (1 + .3 * S.flash)); rim.visible = rk > .005;
  coalMat.color.copy(CRIM).multiplyScalar(.9 * crimK * (1 + .5 * S.flash) * sg).add(C1.copy(WARM).multiplyScalar(.4 * finalK * sg));
  const pulse = .86 + .1 * Math.sin(t * 2.2) + .04 * Math.sin(t * 5.7), lowK = ended ? sm(.45, .7, eU) : 0;
  light.color.copy(CRIM).lerp(WARM, ended ? sm(.55, .7, eU) : 0);
  light.intensity = (2.4 * pulse * (1 + .4 * S.lean + 2.2 * S.flash + 1.5 * hurtK) * crimK + 1.3 * finalK * (.9 + .1 * Math.sin(t * 9) * Math.sin(t * 5.3))) * sg;
  light.position.set(0, lerp(SC, 1.9, lowK), lerp(2.6, 1.3, lowK)); light.distance = lerp(18, 7, lowK);

  // glows and flames
  LANT.forEach((l, i) => {
   _a.copy(l.centre).applyMatrix4(mats[P_LANT + i]); const f = .8 + .12 * Math.sin(t * (6 + i) + i * 2) + .08 * Math.sin(t * 13.7 + i), on = _a.y < 30 ? 1 : 0;
   setP(GL, i, _a, AMB, .5 * f * on * sg, .95); setP(FP, i, _a, C1.setRGB(1, 1, 1), f * on * sg, .22 * (.9 + .1 * f));
  });
  setP(GL, 4, sphere.position, C1.copy(ROSE).lerp(CRIM, .4), (S.flash * .9 + .35 * hurtK) * sg, 3.2 + 3 * (1 - S.flash));
  setP(GL, 5, _a.set(0, 1.5, 0), C1.copy(CRIM).lerp(WARM, finalK * .8), (.5 * crimK + .35 * finalK) * sg, 3.0 - 1.2 * finalK);
  for (let h = 0; h < 2; h++) { _a.copy(HAND_WRIST).applyMatrix4(mats[P_HAND + h]); setP(GL, 6 + h, _a, CRIM, .55 * crimK * sg, .7); }
  const ff = .9 + .06 * Math.sin(t * 11) + .04 * Math.sin(t * 17.3);
  setP(GL, 8, _a.set(0, 1.55, 0), WARM, .5 * finalK * sg, 1.7 * finalK + .01);
  setP(FP, 4, _a.set(0, 1.62, 0), C1.setRGB(1, 1, 1), finalK * sg, .62 * finalK * ff + .01);
  _a.copy(HAND_TIP).multiplyScalar(.6).applyMatrix4(mats[P_HAND + 1]); setP(GL, 9, _a, C1.copy(CRIM).lerp(ROSE, .3), S.blowFlash * sg, 1.2 + 1.5 * (1 - S.blowFlash));
  flushP(GL); flushP(FP);

  // embers, the called flames, ash and sparks
  const emK = ended ? 1 - sm(.2, .55, eU) : 1;
  S.acc.ember += dt * 16 * emK * fadeE;
  while (S.acc.ember >= 1) {
   S.acc.ember -= 1;
   if (rnd() < .55) { const a = rnd() * TAU, r = 1.3 + rnd() * 1.1; W(_a.set(Math.sin(a) * r, SC + Math.cos(a) * r, (rnd() - .5) * .6)); emit(MO, _a.x, _a.y, _a.z, Math.sin(a) * .15, .45 + rnd() * .4, (rnd() - .5) * .1, 2.5 + rnd(), rnd() < .5 ? CRIM : ROSE, .9, .08, .02, .3, .1); }
   else { const x = (rnd() - .5) * 1.6, z = (rnd() - .5) * 1.6; W(_a.set(x, 1.45, z)); emit(MO, _a.x, _a.y, _a.z, -x * .25, 1.1 + rnd() * .4, -z * .25, 2.6, CRIM, .85, .09, .04, .1); }
  }
  S.acc.pull += dt * 170 * pull;
  while (S.acc.pull >= 1) { // every flame on the moor, called in from the party's side
   S.acc.pull -= 1; W(_a.set(-5.5 - rnd() * 4, .2 + Math.pow(rnd(), 1.6) * 7, (rnd() - .5) * 5)); W(_b.set((rnd() - .5) * .5, SC + (rnd() - .5) * .5, (rnd() - .5) * .5));
   const tm = .6 + rnd() * .5; emit(MO, _a.x, _a.y, _a.z, (_b.x - _a.x) / tm, (_b.y - _a.y) / tm, (_b.z - _a.z) / tm, tm * .95, rnd() < .55 ? ROSE : CRIM, 1, .17, .08, 0);
  }
  if (name === 'hurt' && fresh) for (let i = 0; i < 36; i++) { const a = rnd() * TAU; W(_a.set(Math.cos(a) * SR, SC + Math.sin(a) * SR, .3)); emit(MO, _a.x, _a.y, _a.z, Math.cos(a) * (2 + rnd() * 2), Math.sin(a) * (2 + rnd() * 2), (rnd() - .5) * 2, .5 + rnd() * .3, rnd() < .5 ? ROSE : CRIM, 1, .12, .03, 2); }
  if (ended) {
   S.acc.ash += dt * 40 * win(eU, .3, .62, .03);
   while (S.acc.ash >= 1) { S.acc.ash -= 1; const st = ST[(rnd() * NS) | 0], f = rnd(); W(_a.set(st.A.x + st.o.x * .18 * f, st.A.y - f * st.len - drop * 2, st.A.z + st.o.z * .18 * f)); emit(MO, _a.x, _a.y, _a.z, (rnd() - .5) * .3, -.3 - rnd() * .4, (rnd() - .5) * .3, 1.4, ASH, .5, .07, .03, .5); }
   S.acc.spark += dt * 3 * finalK;
   while (S.acc.spark >= 1) { S.acc.spark -= 1; W(_a.set((rnd() - .5) * .2, 1.75, (rnd() - .5) * .2)); emit(MO, _a.x, _a.y, _a.z, (rnd() - .5) * .2, .5 + rnd() * .3, (rnd() - .5) * .2, 1.2, WARM, .8, .05, .02, .2); }
  }
  stepP(MO, dt);
  lastName = name; lastU = u; snap = false;
 }

 // ---------- interface ----------
 const ACTIONS = {};
 for (const n in ACTS) { const d = ACTS[n]; ACTIONS[n] = Object.freeze({ dur: d.dur, hits: d.hits.slice(), cues: d.cues.slice(), hold: d.hold, interrupt: d.interrupt }); }
 Object.freeze(ACTIONS);
 function anchor(name, out) {
  out = out || V3();
  switch (name) {
   case 'hit': case 'hand': return W(out.copy(HAND_TIP).applyMatrix4(mats[P_HAND + 1]));
   case 'hand2': return W(out.copy(HAND_TIP).applyMatrix4(mats[P_HAND]));
   case 'cradle': case 'flame': return W(out.set(0, 1.6, 0));
   case 'top': return W(out.set(0, 8, 0));
   default: return W(out.set(0, SC, 0)); // 'heart', 'core', 'sun'
  }
 }
 animate(0, 0, 0, 0);
 let tri = 0, draws = 0; const texs = new Set();
 root.traverse((o) => { if (o.isMesh || o.isPoints || o.isSprite) { draws++; if (o.isMesh) tri += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; if (o.isSprite) tri += 2; for (const k of ['map', 'emissiveMap']) if (o.material[k]) texs.add(o.material[k].image); if (o.material.uniforms && o.material.uniforms.uMap) texs.add(o.material.uniforms.uMap.value.image); } });
 fx.traverse((o) => { if (o.isPoints) draws++; });
 return {
  root, fx, animate, play, ACTIONS, anchor, reset,
  get busy() { return !!actv && !(actv.def.hold && actv.t >= actv.def.dur - 1e-6); },
  get action() { return actv ? actv.name : ''; },
  get progress() { return actv ? Math.min(1, actv.t / actv.def.dur) : -1; },
  get state() { return state; }, set state(v) { if (v) Object.assign(state, v); },
  setFade(f) { fadeE = cl(+f, 0, 1); },
  get gone() { return !!actv && actv.name === 'ending' && actv.t >= actv.def.dur; },
  height: 8, width: 4.8,
  stats: { triangles: Math.round(tri), drawCalls: draws, textures: texs.size, bones: 0 }
 };
}
