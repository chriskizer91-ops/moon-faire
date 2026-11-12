// Spell effects for the Jester. Everything is a pure function of the clip's time, so a spell
// can be paused or scrubbed and always looks the same at the same moment.
// Colours here go brighter than white on purpose: the bloom pass makes that glow.
// The drawn pictures (circle, ring, glows, bell chain) come from reference set F.
import * as THREE from 'three';
import { FXL } from './pipeline.js';

const CHAIN_ASPECT = 184 / 1024;
const BLEND = { transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending,
  blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor };
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

// a magic circle that draws itself: rings, rune ticks, a hexagram and a turning square
const RUNE = `varying vec2 vUv; uniform float uT, uDraw, uAlpha, uSeed; uniform vec3 uColor;
  float ring(float r, float r0, float w){ return smoothstep(w, 0.0, abs(r - r0)); }
  float poly(float a, float n){ return cos(3.14159 / n) / cos(mod(a, 6.28318 / n) - 3.14159 / n); }
  void main(){
    vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x);
    float sweep = step(fract(a / 6.28318 + 0.5), uDraw * 1.02);
    float v = ring(r, 0.965, 0.010) + ring(r, 0.895, 0.006) + ring(r, 0.47, 0.007) + ring(r, 0.43, 0.004);
    float ta = (a + uT * 0.30) * 30.0 / 6.28318, h = fract(sin(floor(ta) * 91.7 + uSeed) * 43758.5);
    v += step(0.35, h) * smoothstep(0.10, 0.0, abs(fract(ta) - 0.5) - 0.10 - 0.22 * h) * step(0.905, r) * step(r, 0.955);
    v += ring(r, 0.885 * poly(a - uT * 0.20 + 1.5708, 3.0), 0.007) + ring(r, 0.885 * poly(a - uT * 0.20 - 1.5708, 3.0), 0.007);
    v += ring(r, 0.44 * poly(a + uT * 0.6, 4.0), 0.006) * step(r, 0.47);
    float sp = abs(sin((a - uT * 0.20) * 3.0));
    v += smoothstep(0.03, 0.0, sp) * step(0.47, r) * step(r, 0.62) * 0.8;
    float halo = exp(-abs(r - 0.93) * 9.0) * 0.30 + exp(-abs(r - 0.45) * 12.0) * 0.18;
    gl_FragColor = vec4(uColor * (v + halo), uAlpha * sweep * step(r, 1.0));
  }`;
// a column of light with streaks running up (or down) it
const PILLAR = `varying vec2 vUv; uniform float uT, uAlpha, uDir; uniform vec3 uColor;
  void main(){
    float n = fract(sin(floor(vUv.x * 56.0) * 12.9898) * 43758.5453);
    float f = fract(vUv.y * (0.8 + n) - uT * uDir * (0.35 + 0.6 * n) + n * 7.0);
    float streak = smoothstep(0.0, 0.2, f) * smoothstep(1.0, 0.3, f) * step(0.4, n);
    float v = (0.16 + 0.9 * streak) * pow(1.0 - vUv.y, 1.5) + 0.2 * exp(-vUv.y * 14.0);
    gl_FragColor = vec4(uColor * v, uAlpha);
  }`;
// a shock ring: a bright edge with light trailing inside it
const WAVE = `varying vec2 vUv; uniform float uAlpha; uniform vec3 uColor;
  void main(){
    float r = length(vUv * 2.0 - 1.0);
    float v = smoothstep(0.035, 0.0, abs(r - 0.94)) * 1.3 + smoothstep(0.6, 0.94, r) * step(r, 0.94) * 0.22;
    gl_FragColor = vec4(uColor * v, uAlpha * step(r, 1.0));
  }`;
// a curtain of light, hanging in folds
const CURTAIN = `varying vec2 vUv; uniform float uT, uAlpha; uniform vec3 uColor;
  void main(){
    float fold = 0.5 + 0.5 * sin(vUv.x * 46.0 + sin(vUv.y * 5.0 + uT * 1.3) * 1.4 + sin(vUv.y * 13.0 - uT) * 0.4);
    float v = (0.18 + 0.82 * fold * fold) * smoothstep(0.0, 0.10, vUv.y) * (0.35 + 0.65 * vUv.y);
    float hem = smoothstep(0.035, 0.0, abs(vUv.y - 0.06 - 0.02 * sin(vUv.x * 46.0))) * 1.6;
    float side = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
    gl_FragColor = vec4((uColor * v + vec3(1.0, 0.72, 0.30) * hem) * side, uAlpha);
  }`;
// a shell that shows only at its rim
const SHELL_V = 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }';
const SHELL = 'varying vec3 vN; varying vec3 vV; uniform float uAlpha, uPow; uniform vec3 uColor; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow); gl_FragColor = vec4(uColor * f, uAlpha); }';
// thousands of sparkles from one draw call; each one's whole life is worked out from the spell's time
const MOTE_V = `attribute vec4 aSeed; uniform vec3 uOrigin; uniform float uAge, uLife, uEmit, uSpread, uRise, uSize, uInward, uSwirl, uFlat, uH; varying float vA;
  void main(){
    float la = uAge - aSeed.x * uEmit, u = la / (uLife * (0.6 + 0.4 * aSeed.w));
    if (la < 0.0 || u >= 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vA = 0.0; return; }
    float th = aSeed.y * 6.28318 + uSwirl * la, ph = acos(2.0 * aSeed.z - 1.0);
    float k = mix(1.0 - (1.0 - u) * (1.0 - u), (1.0 - u) * (1.0 - u), uInward);
    float d = uSpread * (0.3 + 0.7 * fract(aSeed.w * 7.31)) * k;
    vec3 p = uOrigin + vec3(d * sin(ph) * cos(th), d * cos(ph) * uFlat + uRise * la, d * sin(ph) * sin(th));
    vec4 mv = viewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float persp = projectionMatrix[3][3] == 1.0 ? 1.0 : 1.0 / max(0.1, -mv.z);
    gl_PointSize = uSize * (0.5 + fract(aSeed.x * 13.7)) * sin(u * 3.14159) * uH * 0.5 * projectionMatrix[1][1] * persp;
    vA = sin(u * 3.14159) * (0.55 + 0.45 * sin(la * 23.0 + aSeed.y * 40.0));
  }`;
const MOTE_F = `varying float vA; uniform vec3 uColor;
  void main(){
    vec2 p = gl_PointCoord * 2.0 - 1.0; float r = length(p);
    float s = (0.012 / (abs(p.x) * abs(p.y) + 0.012)) * max(0.0, 1.0 - r) + exp(-r * r * 7.0) * 0.8;
    gl_FragColor = vec4(uColor * s, vA);
  }`;

export function makeFx(scene, base = 'fx/') {
  const L = new THREE.TextureLoader();
  const load = n => { const t = L.load(base + n + '.png'); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t; };
  const T = { sigil: load('sigil'), ring: load('ring'), glows: load('glows'), chain: load('chain') };
  const cell = (tex, cols, rows, i) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(1 / cols, 1 / rows); t.offset.set((i % cols) / cols, 1 - (Math.floor(i / cols) + 1) / rows); return t; };
  const glowTex = [0, 1, 2, 3].map(i => cell(T.glows, 2, 2, i));
  const group = new THREE.Group(); scene.add(group);
  const light = new THREE.PointLight(0xc070ff, 0, 11, 1.4); light.layers.enableAll(); scene.add(light);
  const uH = { value: 800 };                 // height in pixels of whatever is being drawn into, for sparkle sizes
  const pool = new Map();
  const plane = new THREE.PlaneGeometry(1, 1), tube = new THREE.CylinderGeometry(1, 1, 1, 56, 1, true).translate(0, 0.5, 0), ball = new THREE.SphereGeometry(1, 40, 24);
  const seeds = n => { const g = new THREE.BufferGeometry(), a = new Float32Array(n * 4); for (let i = 0; i < a.length; i++) a[i] = Math.random(); g.setAttribute('aSeed', new THREE.BufferAttribute(a, 4)); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return g; };
  const moteGeo = {};
  const C = (hex, gain) => new THREE.Color(hex).multiplyScalar(gain);
  const basic = (map, color, gain) => new THREE.MeshBasicMaterial({ map, color: C(color, gain), ...BLEND });
  const shader = (frag, uniforms, vert = VERT) => new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, ...BLEND });
  let cam = null;
  const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), tq = new THREE.Quaternion(), sq = new THREE.Quaternion(), zAxis = new THREE.Vector3(0, 0, 1);

  let ns = '';                              // each running spell draws under its own name, so two can be alight at once
  function get(id, make) {
    id = ns + id;
    let o = pool.get(id);
    if (!o) { o = make(); o.layers.set(FXL); o.renderOrder = 30; o.frustumCulled = false; group.add(o); pool.set(id, o); }
    o.visible = true; return o;
  }
  // tilt 0 stands the picture up facing the way she faces, 1 lays it flat; or pass a quaternion of your own
  function place(m, pos, rootQ, size, spin, tilt) {
    if (tilt && tilt.isQuaternion) tq.copy(tilt); else { tq.copy(rootQ); sq.copy(rootQ).multiply(flat); tq.slerp(sq, tilt || 0); }
    m.quaternion.copy(tq).multiply(sq.setFromAxisAngle(zAxis, spin || 0));
    m.position.copy(pos); m.scale.set(size, size, 1);
  }
  const VIOLET = 0xd070ff, GOLD = 0xffb040, DUSK = 0x8f6cff, ROSE = 0xff5fa8, WINE = 0xc02868;

  const F = {
    begin(camera) { cam = camera; for (const o of pool.values()) o.visible = false; light.intensity = 0; },
    light(pos, color, intensity) { if (intensity > light.intensity) { light.position.copy(pos); light.color.set(color); light.intensity = intensity; } },   // the strongest wins
    pic(id, map, pos, rootQ, size, spin, alpha, tilt, color = 0xffffff, gain = 1.7) {
      if (alpha <= 0.003 || size <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, basic(map, color, gain)));
      place(m, pos, rootQ, size, spin, tilt); m.material.opacity = Math.min(1, alpha);
    },
    sigil(id, pos, rootQ, size, spin, alpha, tilt, color) { F.pic(id, T.sigil, pos, rootQ, size, spin, alpha, tilt, color); },
    ring(id, pos, rootQ, size, spin, alpha, tilt = 1, color, gain) { F.pic(id, T.ring, pos, rootQ, size, spin, alpha, tilt, color, gain); },
    rune(id, pos, rootQ, size, t, draw, alpha, tilt = 1, color = VIOLET, gain = 2.2, seed = 1) {
      if (alpha <= 0.003 || size <= 0 || draw <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, shader(RUNE, { uT: { value: 0 }, uDraw: { value: 1 }, uAlpha: { value: 1 }, uSeed: { value: seed }, uColor: { value: C(color, gain) } })));
      place(m, pos, rootQ, size, 0, tilt); const u = m.material.uniforms; u.uT.value = t; u.uDraw.value = draw; u.uAlpha.value = Math.min(1, alpha);
    },
    wave(id, pos, rootQ, size, alpha, tilt = 1, color = VIOLET, gain = 1.9) {
      if (alpha <= 0.003 || size <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, shader(WAVE, { uAlpha: { value: 1 }, uColor: { value: C(color, gain) } })));
      place(m, pos, rootQ, size, 0, tilt); m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    pillar(id, base, radius, height, t, alpha, dir = 1, color = VIOLET, gain = 1.8) {
      if (alpha <= 0.003) return;
      const m = get(id, () => new THREE.Mesh(tube, shader(PILLAR, { uT: { value: 0 }, uAlpha: { value: 1 }, uDir: { value: 1 }, uColor: { value: C(color, gain) } })));
      m.position.copy(base); m.quaternion.identity(); m.scale.set(radius, height, radius);
      const u = m.material.uniforms; u.uT.value = t; u.uAlpha.value = Math.min(1, alpha); u.uDir.value = dir;
    },
    curtain(id, pos, rootQ, width, height, t, alpha, color = WINE, gain = 2.0) {
      if (alpha <= 0.003 || width <= 0.01) return;
      const m = get(id, () => new THREE.Mesh(plane, shader(CURTAIN, { uT: { value: 0 }, uAlpha: { value: 1 }, uColor: { value: C(color, gain) } })));
      m.quaternion.copy(rootQ); m.position.copy(pos); m.position.y += height / 2; m.scale.set(width, height, 1);
      m.material.uniforms.uT.value = t; m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    shell(id, pos, radius, alpha, color = DUSK, gain = 2.2, pow = 2.5) {
      if (alpha <= 0.003 || radius <= 0) return;
      const m = get(id, () => new THREE.Mesh(ball, shader(SHELL, { uAlpha: { value: 1 }, uPow: { value: pow }, uColor: { value: C(color, gain) } }, SHELL_V)));
      m.position.copy(pos); m.scale.setScalar(radius); m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    dark(id, pos, radius) {                   // a ball of nothing: it only hides what is behind it
      if (radius <= 0) return;
      const m = get(id, () => new THREE.Mesh(ball, new THREE.MeshBasicMaterial({ color: 0x000000 })));
      m.renderOrder = 29; m.position.copy(pos); m.scale.setScalar(radius);
    },
    glow(id, kind, pos, size, alpha, color = 0xffffff, gain = 1.8) {       // kind: 0 orb, 1 flame, 2 curl, 3 burst. Always faces the camera.
      if (alpha <= 0.003 || size <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, basic(glowTex[kind], color, gain)));
      m.quaternion.copy(cam.quaternion); m.position.copy(pos); m.scale.set(size, size, 1); m.material.opacity = Math.min(1, alpha);
    },
    // n sparkles born over 'emit' seconds from origin, each living about 'life' seconds. age is seconds since the first was born.
    motes(id, origin, n, age, o = {}) {
      if (age <= 0 || age > (o.emit ?? 0.3) + (o.life ?? 0.9)) return;
      const { emit = 0.3, life = 0.9, spread = 0.6, rise = 0.2, size = 0.07, color = VIOLET, gain = 2.6, inward = false, flatten = 1, swirl = 0 } = o;
      const m = get(id, () => new THREE.Points(moteGeo[n] || (moteGeo[n] = seeds(n)), new THREE.ShaderMaterial({ vertexShader: MOTE_V, fragmentShader: MOTE_F, ...BLEND,
        uniforms: { uOrigin: { value: new THREE.Vector3() }, uAge: { value: 0 }, uLife: { value: 1 }, uEmit: { value: 0 }, uSpread: { value: 1 }, uRise: { value: 0 }, uSize: { value: 0.07 }, uInward: { value: 0 }, uSwirl: { value: 0 }, uFlat: { value: 1 }, uH, uColor: { value: C(color, gain) } } })));
      const u = m.material.uniforms; u.uOrigin.value.copy(origin); u.uAge.value = age; u.uLife.value = life; u.uEmit.value = emit; u.uSpread.value = spread; u.uRise.value = rise; u.uSize.value = size; u.uInward.value = inward ? 1 : 0; u.uSwirl.value = swirl; u.uFlat.value = flatten;
    },
    // a picture stretched from one point to another and turned to face the camera (the bell chain, or a streak of light)
    strip(id, map, from, to, width, alpha, color = 0xffffff, gain = 1.8) {
      const dir = to.clone().sub(from), len = dir.length();
      if (alpha <= 0.003 || len < 0.02) return;
      const m = get(id, () => new THREE.Mesh(plane, basic(map, color, gain)));
      const x = dir.clone().normalize(), view = cam.position.clone().sub(from).normalize(), y = view.clone().cross(x).normalize(), z = x.clone().cross(y);
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
      m.position.copy(from).addScaledVector(dir, 0.5); m.scale.set(len, width, 1); m.material.opacity = Math.min(1, alpha);
    },
    chain(id, from, to, alpha) { const len = to.distanceTo(from); F.strip(id, T.chain, from, to, Math.max(0.2, len * CHAIN_ASPECT), alpha, 0xffffff, 2.0); },
  };

  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ramp = (t, a, b) => cl((t - a) / (b - a));
  const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const win = (t, a, b, c, d) => Math.min(ramp(t, a, b), 1 - ramp(t, c, d));       // fades in over a..b and out over c..d
  const up = new THREE.Vector3(0, 1, 0);
  const gyro = (q, ax, ang) => q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(ax, ang));

  const SPELLS = {
    // Her show-stopper. A circle is raised into a chandelier of three, the stage dims, a curtain of light closes behind her, and the house comes down.
    CurtainCall(t, c) {
      const Lh = c.hand('Left'), Rh = c.hand('Right'), q = c.q, mid = Lh.clone().add(Rh).multiplyScalar(0.5), r = t - c.release;
      c.out.dim = 0.8 * win(t, 1.0, 4.4, c.release + 0.1, 6.6);
      const g = win(t, 0, 0.8, 4.6, 5.2) + win(t, 6.4, 6.9, 7.5, 8.0);
      F.glow('gl', 0, Lh, 0.26, g, VIOLET); F.glow('gr', 0, Rh, 0.26, g, VIOLET);
      F.motes('gather', mid, 260, t - 0.3, { emit: 1.5, life: 0.8, spread: 1.4, size: 0.05, inward: true, rise: 0 });
      const rise = ease(ramp(t, 1.9, 3.3)), open = ease(ramp(t, 3.3, 4.7)), a = win(t, 1.1, 1.7, c.release + 0.5, c.release + 1.6);
      const p = mid.clone().add(c.dir(0, 0, 0.06)).lerp(Rh.clone().add(c.dir(0, 0.12, 0)), rise).lerp(c.at(0, 2.25, 0), open);
      const tilt = Math.max(rise * 0.6, open);
      F.sigil('s', p, q, 0.30 * ease(ramp(t, 1.1, 1.9)) + 0.2 * rise + 0.7 * open, t * 0.9, a, tilt);
      F.rune('c1', p, q, 0.5 * ease(ramp(t, 1.3, 2.0)) + 0.3 * rise + 2.3 * open, t, ramp(t, 1.3, 2.4), a, tilt);
      F.rune('c2', p.clone().add(c.dir(0, 0.32 * open, 0)), q, 2.0 * open, -t * 1.3, open, a * open, 1, ROSE, 2.0, 5);
      F.rune('c3', p.clone().add(c.dir(0, 0.60 * open, 0)), q, 1.1 * open, t * 1.9, open, a * open, 1, GOLD, 2.0, 9);
      F.rune('floor', c.at(0, 0.03, 0), q, 5.2, t * 0.6, ramp(t, 3.2, 4.6), 0.85 * win(t, 3.2, 3.6, 7.0, 7.8), 1, VIOLET, 1.8, 3);
      F.pillar('col', c.at(0, 0, 0), 1.15, 2.3, t, 0.55 * win(t, 3.4, 4.4, c.release, c.release + 0.5));
      F.motes('lift', c.at(0, 0.1, 0), 420, t - 3.3, { emit: 1.9, life: 1.5, spread: 1.2, rise: 1.3, size: 0.06, flatten: 0.15, swirl: 1.6 });
      // the curtains of light: they hang open at the wings, sweep shut behind her on the release, then part and fade
      const shut = ease(ramp(r, -0.05, 0.38)), part = ease(ramp(r, 1.1, 2.3)), ca = win(t, 4.1, 4.9, c.release + 1.3, c.release + 2.4), x = 4.2 - 2.7 * shut + 3.0 * part;
      F.curtain('cL', c.at(x, 0, -1.1), q, 3.4, 4.6, t, ca); F.curtain('cR', c.at(-x, 0, -1.1), q, 3.4, 4.6, t + 2.0, ca);
      // the release
      for (let k = 0; k < 3; k++) F.wave('w' + k, c.at(0, 0.04 + 0.5 * k, 0), q, 1 + 13 * ease((r - 0.12 * k) / 1.3), win(r - 0.12 * k, 0, 0.06, 0.5, 1.3), 1, [VIOLET, ROSE, GOLD][k]);
      F.glow('fl', 3, c.at(0, 1.5, 0.15), 1.2 + 3.6 * ramp(r, 0, 0.2), win(r, 0, 0.04, 0.15, 0.55), VIOLET, 2.2);
      F.motes('burst', c.at(0, 1.3, 0), 1200, r, { emit: 0.12, life: 1.6, spread: 5.0, rise: 0.25, size: 0.09, flatten: 0.55 });
      F.motes('gold', c.at(0, 3.6, 0), 600, r - 0.25, { emit: 1.6, life: 2.4, spread: 3.2, rise: -1.25, size: 0.07, flatten: 0.2, color: GOLD, swirl: 0.5 });
      F.motes('rose', c.at(0, 3.4, 0), 400, r - 0.5, { emit: 1.6, life: 2.4, spread: 3.0, rise: -1.1, size: 0.08, flatten: 0.2, color: ROSE, swirl: -0.4 });
      F.light(c.at(0, 1.6, 0.6), VIOLET, 3.0 * win(t, 1.2, 4.6, 6.6, 7.6) + 14 * win(r, 0, 0.05, 0.2, 0.9));
      c.out.shake = win(r, 0, 0.05, 0.1, 0.8);
    },
    // A seal is drawn in her hand, thrown, and locks round her target in three turning rings that clamp shut.
    SealedFate(t, c) {
      const Rh = c.hand('Right'), Lh = c.hand('Left'), q = c.q, r = t - c.release, tg = c.target;
      F.glow('g', 0, Lh.clone().add(Rh).multiplyScalar(0.5), 0.3, win(t, 0.3, 0.7, 1.0, 1.4), VIOLET);
      const held = Rh.clone().add(c.dir(0, 0.02, 0.08)), grow = ease(ramp(t, 1.0, 1.9));
      c.out.dim = 0.35 * win(t, 1.0, 2.6, c.release + 1.0, c.release + 1.7);
      if (r < 0) {
        F.rune('seal', held, q, 0.62 * grow, t * 1.4, ramp(t, 1.0, 2.2), 1, 0);
        F.sigil('s', held, q, 0.30 * grow, -t * 1.4, grow, 0);
        for (let k = 0; k < 3; k++) { const a = t * 5 + k * 2.094; F.glow('o' + k, 0, held.clone().add(c.dir(0.36 * Math.cos(a) * grow, 0.36 * Math.sin(a) * grow, 0)), 0.11, grow, ROSE); }
        F.motes('draw', held, 220, t - 1.0, { emit: 1.9, life: 0.6, spread: 0.9, size: 0.045, inward: true, rise: 0 });
        F.light(held, VIOLET, 3.0 * grow);
      } else {
        const fly = ease(r / 0.32), from = c.releaseR.clone().add(c.dir(0, 0.02, 0.08)), at = from.clone().lerp(tg, fly);
        if (r < 0.34) { F.rune('seal', at, q, 0.62, t * 1.4, 1, 1, 0); F.strip('trail', glowTex[0], from.clone().lerp(tg, Math.max(0, fly - 0.35)), at, 0.5, 0.9, VIOLET, 2.4); }
        const lock = ease(ramp(r, 0.34, 0.60)), clamp = ease(ramp(r, 0.95, 1.12)), fade = 1 - ramp(r, 1.35, 1.75);
        F.rune('stamp', tg, q, 2.4 * lock - 0.9 * clamp, t * 0.8, ramp(r, 0.32, 0.6), fade * lock, 0, VIOLET, 2.4, 7);
        F.sigil('s', tg, q, 1.0 * lock - 0.3 * clamp, r * 3, fade * lock, 0);
        const spin = r * (7 - 6.5 * clamp), size = 2.0 - 1.05 * clamp;
        F.ring('gy0', tg, q, size * lock, spin, fade * lock, gyro(q, up, spin * 0.9), ROSE, 2.2);
        F.ring('gy1', tg, q, size * 0.9 * lock, -spin, fade * lock, gyro(q, new THREE.Vector3(1, 0, 0), 1.2 + spin * 0.7), VIOLET, 2.2);
        F.ring('gy2', tg, q, size * 0.8 * lock, spin, fade * lock, gyro(q, new THREE.Vector3(0.6, 0.8, 0).normalize(), 2.2 - spin * 0.8), GOLD, 2.2);
        F.motes('pull', tg, 420, r - 0.34, { emit: 0.55, life: 0.5, spread: 2.2, size: 0.06, inward: true, rise: 0 });
        F.glow('hit', 3, tg, 0.8 + 2.6 * ramp(r, 0.95, 1.1), win(r, 0.95, 1.0, 1.1, 1.5), VIOLET, 2.6);
        F.wave('w', c.ground, q, 0.6 + 5 * ease((r - 1.0) / 0.7), win(r, 1.0, 1.05, 1.3, 1.7));
        F.motes('snap', tg, 500, r - 1.0, { emit: 0.06, life: 0.8, spread: 2.4, size: 0.07, rise: 0.1 });
        F.light(tg, VIOLET, 4 * lock * fade + 12 * win(r, 0.95, 1.0, 1.1, 1.5));
        c.out.shake = 0.6 * win(r, 0.98, 1.02, 1.08, 1.5);
      }
    },
    // A long blessing: a great circle under her, a column of light, rings climbing her and embers spiralling up.
    AgainstAllOdds(t, c) {
      const Lh = c.hand('Left'), Rh = c.hand('Right'), q = c.q, r = t - c.release, a = win(t, 1.0, 1.6, 6.8, 7.7), end = t - 6.8;
      c.out.dim = 0.55 * a;
      F.rune('floor', c.at(0, 0.03, 0), q, 4.4, t * 0.5, ramp(t, 0.5, 1.5), 0.95 * win(t, 0.5, 0.8, 6.9, 7.8), 1);
      F.rune('floor2', c.at(0, 0.04, 0), q, 2.7, -t * 0.9, ramp(t, 0.9, 1.5), 0.9 * a, 1, GOLD, 1.8, 4);
      F.sigil('fs', c.at(0, 0.05, 0), q, 1.5 * ease(ramp(t, 1.0, 1.7)), t * 0.35, 0.9 * a, 1);
      F.pillar('col', c.at(0, 0, 0), 1.3 + 0.05 * Math.sin(t * 3), 5.5, t, (0.5 * win(r, 0, 0.15, 0.5, 1.2) + 0.3) * a);
      F.pillar('core', c.at(0, 0, -0.5), 0.5, 9.0, t * 1.7, 0.4 * a, 1, GOLD, 1.5);
      F.glow('gl', 1, Lh.clone().add(c.dir(0, 0.12, 0)), 0.42, a, VIOLET, 2.2); F.glow('gr', 1, Rh.clone().add(c.dir(0, 0.12, 0)), 0.42, a, VIOLET, 2.2);
      for (let k = 0; k < 5; k++) {                           // rings of light climb her, one after another
        const u = (r / 1.6 - k * 0.2) % 1;
        if (r > k * 0.32 && t < 6.9 && u >= 0) F.ring('up' + k, c.at(0, 0.1 + 2.2 * u, 0), q, 1.5 - 0.6 * u, t * 1.5 + k, 0.9 * Math.sin(u * Math.PI), 1, k % 2 ? GOLD : VIOLET, 2.0);
      }
      for (let k = 0; k < 4; k++) {                           // four lights circle her
        const ang = t * 2.2 + k * 1.5708, h = 0.6 + 0.5 * k + 0.2 * Math.sin(t * 2 + k);
        F.glow('orb' + k, 0, c.at(1.05 * Math.cos(ang), h, 1.05 * Math.sin(ang)), 0.2, a, GOLD, 2.2);
      }
      F.motes('embers', c.at(0, 0.1, 0), 900, r, { emit: 5.2, life: 1.6, spread: 1.3, rise: 1.9, size: 0.06, flatten: 0.1, swirl: 2.6 });
      F.motes('glints', c.at(0, 0.1, 0), 300, r, { emit: 5.2, life: 1.4, spread: 1.0, rise: 2.3, size: 0.05, flatten: 0.1, swirl: -3.0, color: GOLD });
      F.glow('start', 3, c.at(0, 1.2, 0.1), 1 + 2.2 * ramp(r, 0, 0.25), 0.8 * win(r, 0, 0.05, 0.15, 0.5), VIOLET, 2.0);
      F.wave('w0', c.at(0, 0.05, 0), q, 1 + 9 * ease(r / 1.0), win(r, 0, 0.05, 0.4, 1.0));
      F.wave('w1', c.at(0, 0.05, 0), q, 1 + 8 * ease(end / 0.9), win(end, 0, 0.05, 0.4, 0.9), 1, GOLD);
      F.light(c.at(0, 1.4, 0.9), 0xd9a0ff, 2.6 * a + 6 * win(r, 0, 0.05, 0.2, 0.7));
      c.out.shake = 0.4 * win(r, 0, 0.05, 0.1, 0.6);
    },
    // Her hip bells unfold into a gold chain: drawn, whirled overhead in a ring of gold, and lashed out.
    GildedRebuke(t, c) {
      const Lh = c.hand('Left'), q = c.q, r = t - c.release, tg = c.target;
      let to;
      if (t < 0.55) to = Lh.clone().add(c.dir(0.05, -0.45 * ramp(t, 0.3, 0.55), 0.02));
      else if (r < 0) { const a = (t - 0.55) * 20; to = Lh.clone().add(c.dir(0.6 * Math.cos(a), 0.22, 0.6 * Math.sin(a))); }
      else to = Lh.clone().lerp(tg, ease(r / 0.12) - ease((r - 0.32) / 0.4));
      F.chain('ch', Lh, to, win(t, 0.3, 0.4, 1.75, 1.97));
      const whirl = win(t, 0.5, 0.7, c.release, c.release + 0.12), wp = Lh.clone().add(c.dir(0, 0.22, 0));
      F.ring('halo', wp, q, 1.45, -t * 20, whirl, 1, GOLD, 2.4); F.ring('halo2', wp, q, 1.0, t * 26, whirl * 0.7, 1, GOLD, 2.0);
      F.motes('spin', wp, 240, t - 0.5, { emit: 0.5, life: 0.4, spread: 0.8, size: 0.05, flatten: 0.1, swirl: 14, color: GOLD, rise: 0 });
      const h = r - 0.12;
      F.glow('hit', 3, tg, 1 + 2.4 * ramp(h, 0, 0.12), win(h, 0, 0.03, 0.1, 0.45), GOLD, 2.8);
      F.wave('w', tg, q, 0.4 + 3.2 * ease(h / 0.45), win(h, 0, 0.03, 0.2, 0.45), 0, GOLD);
      F.wave('wg', c.ground, q, 0.4 + 4.5 * ease(h / 0.6), win(h, 0, 0.03, 0.3, 0.6), 1, GOLD);
      F.motes('sp', tg, 700, h, { emit: 0.05, life: 0.8, spread: 2.6, rise: -0.6, size: 0.08, color: GOLD });
      F.light(r < 0 ? wp : tg, GOLD, 4 * whirl + 14 * win(h, 0, 0.03, 0.1, 0.5));
      c.out.shake = 0.7 * win(h, 0, 0.02, 0.06, 0.4);
    },
    // Silence. The air stills, a thin ring leaves her fingertip, and the sound around her target is drawn in and shut inside a shell.
    Hush(t, c) {
      const tip = c.bone('RightHandIndex3'), q = c.q, r = t - c.release, tg = c.target, face = c.at(0, 1.5, 0.15);
      c.out.dim = 0.5 * win(t, 0.4, 1.6, c.release + 1.4, c.release + 2.0);
      F.motes('motes', face, 160, Math.min(t - 0.2, 0.8), { emit: 0.5, life: 1.6, spread: 1.0, rise: 0.04, size: 0.035, color: DUSK });      // they drift, then hang still
      if (r < 0) {
        const p = tip.clone().add(c.dir(0, 0, 0.05)), g = ease(ramp(t, 1.5, 2.6));
        F.ring('r', p, q, 0.12 + 0.14 * g, t * 3, ramp(t, 1.5, 1.9), 0, DUSK, 2.2);
        F.rune('rr', p, q, 0.34 * g, -t * 2, g, g, 0, DUSK, 1.8, 6);
        F.light(p, DUSK, 1.5 * g);
      } else {
        const fly = ease(r / 0.3), at = c.releaseTip.clone().lerp(tg, fly);
        if (r < 0.32) F.ring('r', at, q, 0.26 + 0.5 * fly, t * 3 + r * 5, 1, 0, DUSK, 2.4);
        const on = ramp(r, 0.28, 0.4), off = 1 - ramp(r, 1.6, 2.1), shut = ease(ramp(r, 0.3, 0.95));
        F.shell('bub', tg, 1.5 - 0.75 * shut, on * off, DUSK, 2.0); F.shell('bub2', tg, 1.35 - 0.7 * shut, 0.6 * on * off, 0x5040c0, 2.0, 1.5);
        for (let k = 0; k < 4; k++) { const u = (r - 0.3 - k * 0.17) / 0.7; if (u > 0 && u < 1) F.wave('in' + k, tg, q, 3.4 * (1 - ease(u)) + 0.3, 0.8 * Math.sin(u * Math.PI), 0, DUSK, 1.8); }   // sound being drawn in
        for (let k = 0; k < 3; k++) { const u = (r - 0.35 - k * 0.2) / 0.7; if (u > 0 && u < 1) F.wave('ing' + k, c.ground, q, 4.2 * (1 - ease(u)) + 0.3, 0.6 * Math.sin(u * Math.PI), 1, DUSK, 1.8); }
        F.motes('pull', tg, 380, r - 0.3, { emit: 0.7, life: 0.6, spread: 2.4, size: 0.05, inward: true, rise: 0, color: DUSK });
        F.rune('lock', tg, q, 1.0 * shut, r, ramp(r, 0.9, 1.1), off * ramp(r, 0.9, 1.0), 0, DUSK, 2.0, 8);
        F.glow('th', 2, tg, 0.7, win(r, 1.5, 1.7, 1.9, 2.15), DUSK);
        F.light(tg, DUSK, 3.5 * on * off);
      }
    },
    // A ball of nothing gathers over her hand, drinking the light, and is dropped on her target with the weight of the sky.
    Gravity(t, c) {
      const Lh = c.hand('Left'), q = c.q, r = t - c.release, tg = c.target, gr = c.ground;
      if (r < 0) {
        const p = Lh.clone().add(c.dir(0, 0.15, 0)), s = ease(ramp(t, 0.15, 0.95));
        F.dark('hole', p, 0.05 + 0.07 * s); F.shell('rim', p, 0.075 + 0.10 * s, ramp(t, 0.15, 0.4), VIOLET, 3.0, 2.0);
        F.ring('disk', p, q, 0.36 + 0.42 * s, t * 11, 0.95 * ramp(t, 0.25, 0.5), 0.78, VIOLET, 2.6);
        F.ring('disk2', p, q, 0.26 + 0.3 * s, -t * 15, 0.7 * ramp(t, 0.25, 0.5), 0.78, ROSE, 2.2);
        F.motes('pull', p, 420, t - 0.2, { emit: 0.75, life: 0.42, spread: 1.3, size: 0.05, inward: true, rise: 0, swirl: 9 });
        F.light(p, VIOLET, 4 * s);
        c.out.dim = 0.4 * s;
      } else {
        const drop = ease(r / 0.13), mid = tg.clone().lerp(gr, 0.35), p = c.releaseL.clone().add(c.dir(0, 0.15, 0)).lerp(mid, drop), grow = ease(ramp(r, 0.1, 0.28)), gone = ease(ramp(r, 0.34, 0.44));
        F.dark('hole', p, (0.12 + 0.5 * grow) * (1 - gone)); F.shell('rim', p, (0.19 + 0.62 * grow) * (1 - gone), 1 - gone, VIOLET, 3.2, 2.0);
        F.ring('disk', p, q, (0.8 + 2.0 * grow) * (1 - gone), t * 13, 1 - gone, 0.9, VIOLET, 2.6);
        F.pillar('press', gr, 1.3 - 0.5 * grow, 6.5, t * 2.2, 0.9 * win(r, 0.02, 0.1, 0.32, 0.5), -1);
        F.wave('imp', gr, q, 5.0 - 4.6 * ease(r / 0.36), win(r, 0.02, 0.08, 0.3, 0.4));
        F.rune('crush', gr, q, 3.2, t * 3, 1, win(r, 0.05, 0.12, 0.36, 0.55), 1, VIOLET, 2.0, 2);
        F.motes('in', mid, 800, r, { emit: 0.12, life: 0.34, spread: 3.2, size: 0.07, inward: true, flatten: 0.5, rise: 0, swirl: 7 });
        const b = r - 0.4;
        F.glow('hit', 3, mid, 1 + 3.2 * ramp(b, 0, 0.12), win(b, 0, 0.02, 0.08, 0.4), VIOLET, 2.8);
        F.wave('out', gr, q, 0.5 + 7 * ease(b / 0.5), win(b, 0, 0.02, 0.2, 0.5));
        F.motes('pop', mid, 600, b, { emit: 0.04, life: 0.6, spread: 2.6, size: 0.07, rise: 0.4 });
        F.light(mid, VIOLET, 6 * (1 - gone) + 14 * win(b, 0, 0.02, 0.1, 0.4));
        c.out.dim = 0.4 * (1 - ramp(r, 0.3, 0.5)); c.out.shake = 0.5 * win(r, 0.02, 0.1, 0.3, 0.4) + 0.9 * win(b, 0, 0.02, 0.06, 0.35);
      }
    },
  };

  // Draw one spell at clip time t. 'slot' tells two casts of the same spell apart.
  function cast(name, t, c, slot = '') { ns = name + slot + ':'; SPELLS[name](t, c); ns = ''; }
  // Draw anything else with the same building blocks, under a name of its own.
  function draw(name, fn) { ns = name + ':'; fn(F, { cl, ramp, ease, win, glowTex, VIOLET, GOLD, DUSK, ROSE }); ns = ''; }
  return { F, SPELLS, cast, draw, group, light, uH };
}
