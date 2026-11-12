// Spell effects for the Jester. Everything is a pure function of the clip's time, so a spell
// can be paused or scrubbed and always looks the same at the same moment.
// Colours here go brighter than white on purpose: the bloom pass makes that glow.
//
// The look (Chris, November 12): her power is drawn from the idea of interstellar space, the infinity of the universe.
// Of the four witches the themes are the moment, then nature, then chaos, then infinity, and she is infinity.
// So her big spells are dark and cold: holes in the world with the night sky inside them, light being swallowed,
// thin white rims, slow dust. Gold is kept for her bells, as a thread on the black.
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
const MOTE_F = `varying float vA; uniform vec3 uColor; uniform float uSpark;
  void main(){
    vec2 p = gl_PointCoord * 2.0 - 1.0; float r = length(p);
    float s = mix(exp(-r * r * 9.0) * 1.5, (0.012 / (abs(p.x) * abs(p.y) + 0.012)) * max(0.0, 1.0 - r) + exp(-r * r * 7.0) * 0.8, uSpark);     // round dust, or a four-pointed sparkle
    gl_FragColor = vec4(uColor * s, vA);
  }`;

// the night sky seen in a direction: three depths of stars and a faint river of dust
const SKY = `
  float h31(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
  vec3 sky(vec3 d, float t){
    vec3 col = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      float fi = float(i), s = 16.0 + fi * 19.0;
      vec3 g = d * s + fi * 7.7, id = floor(g), f = fract(g) - 0.5;
      float h = h31(id);
      vec3 o = (vec3(h31(id + 1.3), h31(id + 2.7), h31(id + 4.1)) - 0.5) * 0.7;
      float r = length(f - o), tw = 0.65 + 0.35 * sin(t * (1.0 + 5.0 * h) + h * 40.0);
      float b = step(0.58, h) * tw * smoothstep(0.11, 0.0, r) * (0.7 + 3.4 * h * h);
      col += b * mix(vec3(0.72, 0.80, 1.0), vec3(1.0, 0.92, 0.80), h31(id + 9.1)) * (1.0 - 0.22 * fi);
    }
    float n = sin(d.x * 3.1 + sin(d.y * 2.3 + t * 0.05) * 1.7) * sin(d.y * 4.3 + d.z * 2.9), m = sin(d.z * 5.3 + d.x * 2.1 + 1.0) * sin(d.y * 3.7 - d.x * 1.9);
    return col + vec3(0.0015, 0.0012, 0.006) + vec3(0.012, 0.005, 0.034) * smoothstep(0.1, 1.0, n) + vec3(0.003, 0.010, 0.022) * smoothstep(0.3, 1.0, m);     // linear light: small numbers already show
  }`;
const VOID_V = 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }';
// a ball of nothing with the sky inside it and a thin rim of light
const VOID_BALL = SKY + `varying vec3 vN; varying vec3 vV; varying vec3 vW; uniform float uT, uAlpha, uPow, uStars; uniform vec3 uRim;
  void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow);
    gl_FragColor = vec4(sky(normalize(vW - cameraPosition), uT) * uStars * (1.0 - f) + uRim * f, uAlpha); }`;
// a flat hole in the world: a disc (shape 0), or a drape with a bright hem on its right (1) or left (2) edge
const VOID_FLAT = SKY + `varying vec2 vUv; varying vec3 vW; uniform float uT, uAlpha, uShape, uStars; uniform vec3 uRim;
  void main(){ vec2 p = vUv * 2.0 - 1.0; float e, k = 1.0;
    if (uShape < 0.5) { float r = length(p); if (r > 1.0) discard; e = smoothstep(0.016, 0.0, abs(r - 0.978)) + 0.16 * exp(-(1.0 - r) * 22.0); }
    else { float x = uShape < 1.5 ? p.x : -p.x; e = exp(-(1.0 - x) * 90.0) + exp(-(1.0 - x) * 12.0) * 0.025; k = 0.7 + 0.3 * sin(p.x * 16.0 + sin(p.y * 3.0 + uT) * 1.3); }
    gl_FragColor = vec4(sky(normalize(vW - cameraPosition), uT) * uStars * k + uRim * e, uAlpha); }`;
// a thin hoop with graduations, like a ring of an armillary sphere
const HOOP = `varying vec2 vUv; uniform float uAlpha; uniform vec3 uColor;
  void main(){ float r = length(vUv * 2.0 - 1.0), a = atan(vUv.y - 0.5, vUv.x - 0.5);
    float v = smoothstep(0.009, 0.0, abs(r - 0.965)) + step(0.5, fract(a * 36.0 / 6.28318)) * smoothstep(0.012, 0.0, abs(r - 0.925)) * 0.35 + exp(-abs(r - 0.965) * 30.0) * 0.05;
    gl_FragColor = vec4(uColor * v, uAlpha * step(r, 1.0)); }`;
// the disc of light falling into a black hole: streaks that wind faster the nearer they are
const ACCRETE = `varying vec2 vUv; uniform float uT, uAlpha; uniform vec3 uColor;
  void main(){ vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x);
    float band = smoothstep(0.40, 0.50, r) * smoothstep(1.0, 0.70, r), w = a + uT * (1.3 / (r + 0.15));
    float st = (0.55 + 0.45 * sin(w * 7.0 + r * 31.0)) * (0.6 + 0.4 * sin(w * 3.0 - r * 13.0));
    vec3 col = mix(uColor, vec3(1.0), smoothstep(0.80, 0.44, r));
    gl_FragColor = vec4(col * band * (0.25 + 0.75 * st) * (1.15 - 0.55 * r), uAlpha * step(r, 1.0)); }`;
// darkness around a point: it takes light away from whatever is behind it
const SHADE = 'varying vec2 vUv; uniform float uAlpha; void main(){ float r = length(vUv * 2.0 - 1.0); gl_FragColor = vec4(vec3(1.0 - uAlpha * smoothstep(1.0, 0.12, r)), 1.0); }';

export function makeFx(scene, base = 'fx/') {
  const L = new THREE.TextureLoader();
  const load = n => { const t = L.load(base + n + '.png'); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t; };
  const T = { sigil: load('sigil'), ring: load('ring'), glows: load('glows'), chain: load('chain') };
  const cell = (tex, cols, rows, i) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(1 / cols, 1 / rows); t.offset.set((i % cols) / cols, 1 - (Math.floor(i / cols) + 1) / rows); return t; };
  const glowTex = [0, 1, 2, 3].map(i => cell(T.glows, 2, 2, i));
  const soft = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
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
  const STAR = 0xdfe6ff, ICE = 0x9fb4ff, EMBER = 0xffdcae;          // starlight, the cold light it casts, and the warm light round a black hole
  const ID = new THREE.Quaternion();

  let edge = 0;                                                   // how far the open ground runs from the middle, when the page says (fx.arena)
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
    orb(id, pos, size, alpha, color = STAR, gain = 2.6) {                // a plain soft light, facing the camera
      if (alpha <= 0.003 || size <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, basic(soft, color, gain)));
      m.quaternion.copy(cam.quaternion); m.position.copy(pos); m.scale.set(size, size, 1); m.material.opacity = Math.min(1, alpha);
    },
    hoop(id, pos, rootQ, size, spin, alpha, tilt = 1, color = STAR, gain = 2.0) {
      if (alpha <= 0.003 || size <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, shader(HOOP, { uAlpha: { value: 1 }, uColor: { value: C(color, gain * 0.75) } })));
      place(m, pos, rootQ, size, spin, tilt); m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    accrete(id, pos, size, t, alpha, tilt = 0.84, color = EMBER, gain = 1.15) {
      if (alpha <= 0.003 || size <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, shader(ACCRETE, { uT: { value: 0 }, uAlpha: { value: 1 }, uColor: { value: C(color, gain) } })));
      place(m, pos, ID, size, 0, tilt); m.material.uniforms.uT.value = t; m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    // ---- the void: these hide and darken, where everything else here adds light
    voidBall(id, pos, radius, alpha = 1, rim = STAR, gain = 3.0, pow = 4.0, stars = 1, t = 0) {
      if (alpha <= 0.01 || radius <= 0.002) return;
      const m = get(id, () => new THREE.Mesh(ball, new THREE.ShaderMaterial({ vertexShader: VOID_V, fragmentShader: VOID_BALL, transparent: true, depthWrite: true,
        uniforms: { uT: { value: 0 }, uAlpha: { value: 1 }, uPow: { value: pow }, uStars: { value: stars }, uRim: { value: C(rim, gain * 0.7) } } })));     // rims are kept low: the bloom spreads anything bright across the black
      m.renderOrder = 29; m.position.copy(pos); m.scale.setScalar(radius); m.quaternion.identity();
      const u = m.material.uniforms; u.uT.value = t; u.uAlpha.value = Math.min(1, alpha);
    },
    // size is the width across, or [width, height] for a drape. shape: 0 disc, 1 drape with its hem on the right, 2 on the left.
    voidFlat(id, pos, quat, size, t, alpha = 1, shape = 0, rim = STAR, gain = 2.6, stars = 1) {
      const w = Array.isArray(size) ? size[0] : size, h = Array.isArray(size) ? size[1] : size;
      if (alpha <= 0.01 || w <= 0.01) return;
      const m = get(id, () => new THREE.Mesh(plane, new THREE.ShaderMaterial({ vertexShader: VOID_V, fragmentShader: VOID_FLAT, transparent: true, depthWrite: true, side: THREE.DoubleSide,
        uniforms: { uT: { value: 0 }, uAlpha: { value: 1 }, uShape: { value: shape }, uStars: { value: stars }, uRim: { value: C(rim, gain * 0.6) } } })));
      m.renderOrder = 29; m.position.copy(pos); m.quaternion.copy(quat); m.scale.set(w, h, 1);
      const u = m.material.uniforms; u.uT.value = t; u.uAlpha.value = Math.min(1, alpha); u.uShape.value = shape;
    },
    shade(id, pos, size, alpha) {              // always faces the camera
      if (alpha <= 0.01 || size <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SHADE, transparent: true, depthWrite: false, uniforms: { uAlpha: { value: 0 } },
        blending: THREE.CustomBlending, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor })));
      m.renderOrder = 28; m.quaternion.copy(cam.quaternion); m.position.copy(pos); m.scale.set(size, size, 1); m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    // a black hole as films draw it: a ball of nothing, a thin ring of light bent round it, a disc of light spinning into it, and the dark it casts
    hole(id, pos, radius, t, alpha = 1, stars = 0.6) {
      if (alpha <= 0.01 || radius <= 0.002) return;
      F.shade(id + 's', pos, radius * 8, 0.8 * alpha);
      F.voidBall(id + 'b', pos, radius, alpha, STAR, 3.2, 5.0, stars, t);
      F.wave(id + 'h', pos, ID, radius * 2.42, 0.85 * alpha, cam.quaternion, EMBER, 1.1);
      F.accrete(id + 'd', pos, radius * 4.4, t * 4, alpha);
    },
    flare(id, pos, len, width, alpha, color = STAR, gain = 3.0, upright = false) {      // a thin line of light across the picture
      if (alpha <= 0.003 || len <= 0.02) return;
      const r = new THREE.Vector3(upright ? 0 : 1, upright ? 1 : 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(len / 2);
      F.strip(id, soft, pos.clone().sub(r), pos.clone().add(r), width, alpha, color, gain);
    },
    glow(id, kind, pos, size, alpha, color = 0xffffff, gain = 1.8) {       // kind: 0 orb, 1 flame, 2 curl, 3 burst. Always faces the camera.
      if (alpha <= 0.003 || size <= 0) return;
      const m = get(id, () => new THREE.Mesh(plane, basic(glowTex[kind], color, gain)));
      m.quaternion.copy(cam.quaternion); m.position.copy(pos); m.scale.set(size, size, 1); m.material.opacity = Math.min(1, alpha);
    },
    // n sparkles born over 'emit' seconds from origin, each living about 'life' seconds. age is seconds since the first was born.
    motes(id, origin, n, age, o = {}) {
      if (age <= 0 || age > (o.emit ?? 0.3) + (o.life ?? 0.9)) return;
      const { emit = 0.3, life = 0.9, spread = 0.6, rise = 0.2, size = 0.07, color = VIOLET, gain = 2.6, inward = false, flatten = 1, swirl = 0, spark = color === STAR ? 0 : 1 } = o;
      const m = get(id, () => new THREE.Points(moteGeo[n] || (moteGeo[n] = seeds(n)), new THREE.ShaderMaterial({ vertexShader: MOTE_V, fragmentShader: MOTE_F, ...BLEND,
        uniforms: { uOrigin: { value: new THREE.Vector3() }, uAge: { value: 0 }, uLife: { value: 1 }, uEmit: { value: 0 }, uSpread: { value: 1 }, uRise: { value: 0 }, uSize: { value: 0.07 }, uInward: { value: 0 }, uSwirl: { value: 0 }, uFlat: { value: 1 }, uSpark: { value: spark }, uH, uColor: { value: C(color, gain) } } })));
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

  const X = new THREE.Vector3(1, 0, 0), SKEW = new THREE.Vector3(0.6, 0.8, 0).normalize();
  const camRight = () => new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), camFwd = () => new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);

  const SPELLS = {
    // Her show-stopper, and the darkest thing she does. Every lamp gutters. A new moon no bigger than a coin is lit between
    // her hands and lifted in an armillary of thin rings; the ground under her becomes the night sky; behind the square the
    // new moon itself rises and swells until it fills the sky. On the release two curtains of night sweep shut across
    // everything, a line of light runs through the dark, and when they part the cold rings are already going out.
    CurtainCall(t, c) {
      const Lh = c.hand('Left'), Rh = c.hand('Right'), q = c.q, mid = Lh.clone().add(Rh).multiplyScalar(0.5), r = t - c.release;
      c.out.dim = 0.95 * win(t, 0.6, 3.6, c.release + 1.7, 7.5);
      F.motes('gather', mid, 260, t - 0.3, { emit: 2.2, life: 1.3, spread: 2.2, size: 0.04, inward: true, rise: 0, swirl: 1.2, color: STAR });
      const rise = ease(ramp(t, 1.9, 3.3)), open = ease(ramp(t, 3.3, 4.7)), a = win(t, 1.0, 1.6, c.release + 0.15, c.release + 0.5);
      const p = mid.clone().add(c.dir(0, 0.02, 0.06)).lerp(c.at(0, 2.55, 0), rise), rad = 0.07 * ease(ramp(t, 1.0, 1.9)) + 0.15 * rise + 0.2 * open;
      F.shade('sh', p, 1.2 + 4.5 * open, 0.8 * a);
      F.voidBall('moon', p, rad, a, STAR, 2.2, 5.0, 1, t);
      F.wave('halo', p, ID, rad * 2.5, 0.7 * a, cam.quaternion, STAR, 1.4);
      const ar = a * ramp(t, 1.3, 2.0);
      F.hoop('a0', p, q, rad * 4.4, t * 0.9, ar, gyro(q, up, t * 0.7), STAR, 2.0);
      F.hoop('a1', p, q, rad * 3.8, -t * 0.7, ar, gyro(q, X, 1.1 + t * 0.5), VIOLET, 2.0);
      F.hoop('a2', p, q, rad * 3.2, t * 0.5, ar, gyro(q, SKEW, 2.2 - t * 0.6), GOLD, 1.8);
      // she stands on the night sky
      F.voidFlat('floor', c.at(0, 0.02, 0), flat, 5.4 * ease(ramp(t, 2.6, 4.4)) * (1 - ease(ramp(t, 6.6, 7.6))), t, 1, 0, STAR, 1.3);
      F.rune('circle', c.at(0, 0.035, 0), q, 6.2, t * 0.3, ramp(t, 3.0, 4.6), 0.13 * win(t, 3.0, 3.6, 7.0, 7.8), 1, STAR, 0.8, 3);
      F.motes('lift', c.at(0, 0.1, 0), 420, t - 3.0, { emit: 2.2, life: 2.0, spread: 1.7, rise: 0.7, size: 0.035, flatten: 0.15, swirl: 0.8, color: STAR });
      // the new moon rises beyond the square
      const away = c.at(0, 0, 0).sub(cam.position).setY(0).normalize(), sw = ease(ramp(t, 3.4, c.release + 0.3));
      const o = c.at(0, 0, 0), b = o.dot(away), far = edge ? Math.min(16, -b + Math.sqrt(Math.max(0, b * b - o.dot(o) + (edge - 0.5) * (edge - 0.5)))) : 16;   // at the far edge of the open ground, in front of whatever stands round it
      const moon = o.addScaledVector(away, far); moon.y = 3.0 + 5.0 * sw;
      F.voidFlat('sky', moon, cam.quaternion, (5 + 19 * sw) * (0.5 + far / 32), t, win(t, 3.4, 4.1, c.release + 1.9, 7.6), 0, STAR, 1.4);
      // the curtains of night, close to the eye
      const shut = ease(ramp(r, -0.14, 0.2)), part = ease(ramp(r, 0.48, 0.95));
      if (r > -0.16 && r < 0.98) {
        const base = cam.position.clone().addScaledVector(camFwd(), 1.2), x = 1.25 + 1.3 * (1 - shut) + 1.6 * part, rt = camRight();
        F.voidFlat('cL', base.clone().addScaledVector(rt, -x), cam.quaternion, [2.5, 3.2], t, 1, 1, STAR, 3.0);
        F.voidFlat('cR', base.clone().addScaledVector(rt, x), cam.quaternion, [2.5, 3.2], t + 9, 1, 2, STAR, 3.0);
      }
      // the release
      F.flare('line', c.at(0, 1.2, 0), 30 * ease(ramp(r, 0.2, 0.6)), 0.05 + 0.2 * (1 - ramp(r, 0.25, 0.9)), win(r, 0.2, 0.25, 0.6, 1.2), STAR, 2.4);
      for (let k = 0; k < 3; k++) { const u = r - 0.25 - 0.3 * k; F.wave('w' + k, c.at(0, 0.04 + 0.4 * k, 0), q, 1 + 15 * ease(u / 1.1), win(u, 0, 0.06, 0.45, 1.1), 1, k === 1 ? VIOLET : STAR, 1.3); }
      F.motes('fall', c.at(0, 4.2, 0), 700, r - 0.6, { emit: 1.8, life: 2.6, spread: 4.5, rise: -1.0, size: 0.04, flatten: 0.2, color: STAR, swirl: 0.3 });
      F.motes('gold', c.at(0, 3.8, 0), 160, r - 0.8, { emit: 1.6, life: 2.4, spread: 3.0, rise: -1.1, size: 0.05, flatten: 0.2, color: GOLD });
      F.light(c.at(0, 2.6, -0.9), ICE, 9.0 * win(t, 1.2, 3.0, 6.6, 7.6) + 8 * win(r, 0.2, 0.26, 0.5, 1.1));
      c.out.shake = 0.3 * win(t, 3.6, 5.0, c.release, c.release + 0.1) + win(r, 0.2, 0.25, 0.35, 1.0);
    },
    // Doom. A hole is opened in her hand, ringed with a tally, and thrown. It lands as an eclipse over her target's heart;
    // three thin rings clamp shut on it, and for a moment the ground beneath shows what is waiting.
    SealedFate(t, c) {
      const Rh = c.hand('Right'), q = c.q, r = t - c.release, tg = c.target;
      const held = Rh.clone().add(c.dir(0, 0.02, 0.08)), grow = ease(ramp(t, 1.0, 1.9));
      c.out.dim = 0.4 * win(t, 0.8, 2.4, c.release + 1.2, c.release + 1.8);
      if (r < 0) {
        F.shade('sh', held, 0.6 + 1.8 * grow, 0.85 * grow);
        F.voidFlat('seal', held, q, 0.46 * grow, t, 1, 0, STAR, 2.8);
        F.rune('tally', held, q, 0.68 * grow, t * 0.8, ramp(t, 1.0, 2.2), 0.9, 0, STAR, 1.0, 7);
        for (let k = 0; k < 3; k++) { const a = t * 1.6 + k * 2.094; F.orb('o' + k, held.clone().add(c.dir(0.38 * Math.cos(a) * grow, 0.38 * Math.sin(a) * grow, 0)), 0.09, grow, STAR, 2.4); }
        F.motes('draw', held, 220, t - 1.0, { emit: 1.9, life: 0.9, spread: 1.7, size: 0.035, inward: true, rise: 0, swirl: 3, color: STAR });
        F.light(held, ICE, 2.5 * grow);
      } else {
        const fly = ease(r / 0.32), from = c.releaseR.clone().add(c.dir(0, 0.02, 0.08)), at = from.clone().lerp(tg, fly);
        if (r < 0.34) {
          F.shade('sh', at, 2.4, 0.8); F.voidFlat('seal', at, q, 0.46 + 0.5 * fly, t, 1, 0, STAR, 2.8);
          F.strip('trail', soft, from.clone().lerp(tg, Math.max(0, fly - 0.35)), at, 0.16, 0.9, STAR, 2.4);
        }
        const lock = ease(ramp(r, 0.34, 0.60)), clamp = ease(ramp(r, 0.95, 1.12)), fade = 1 - ramp(r, 1.35, 1.75);
        F.shade('sh2', tg, 5.5 * lock, 0.9 * lock * fade);
        F.voidFlat('stamp', tg, cam.quaternion, 2.3 * lock - 1.55 * clamp, t, fade * lock, 0, STAR, 2.0);
        const spin = r * (5 - 4.6 * clamp), size = 2.9 - 1.9 * clamp;
        F.hoop('gy0', tg, q, size * lock, spin, fade * lock, gyro(q, up, spin * 0.9), STAR, 2.0);
        F.hoop('gy1', tg, q, size * 0.9 * lock, -spin, fade * lock, gyro(q, X, 1.2 + spin * 0.7), VIOLET, 2.0);
        F.hoop('gy2', tg, q, size * 0.8 * lock, spin, fade * lock, gyro(q, SKEW, 2.2 - spin * 0.8), STAR, 1.8);
        F.voidFlat('pit', c.ground, flat, 3.6 * win(r, 0.5, 0.95, 1.05, 1.5), t, 1, 0, VIOLET, 2.0);
        F.motes('pull', tg, 420, r - 0.34, { emit: 0.55, life: 0.6, spread: 2.6, size: 0.045, inward: true, rise: 0, swirl: 5, color: STAR });
        F.flare('fl', tg, 8 * win(r, 0.95, 1.0, 1.05, 1.4), 0.2, win(r, 0.95, 1.0, 1.1, 1.4));
        F.wave('w', c.ground, q, 0.6 + 6 * ease((r - 1.0) / 0.7), 0.7 * win(r, 1.0, 1.05, 1.3, 1.7), 1, VIOLET, 1.6);
        F.light(tg, ICE, 3 * lock * fade + 12 * win(r, 0.95, 1.0, 1.1, 1.5));
        c.out.shake = 0.7 * win(r, 0.98, 1.02, 1.08, 1.5);
      }
    },
    // The odds turn. She stands on the night sky; seven stars come out round her one by one and lines join them into a
    // figure that turns slowly overhead, and their light runs down into her.
    AgainstAllOdds(t, c) {
      const q = c.q, r = t - c.release, a = win(t, 1.0, 1.6, 6.8, 7.7), end = t - 6.8;
      c.out.dim = 0.5 * a;
      F.voidFlat('floor', c.at(0, 0.02, 0), flat, 4.6 * ease(ramp(t, 0.5, 1.5)) * (1 - ease(ramp(t, 6.9, 7.8))), t, 1, 0, STAR, 2.2);
      F.rune('floor2', c.at(0, 0.035, 0), q, 2.9, -t * 0.5, ramp(t, 0.9, 1.5), 0.7 * a, 1, GOLD, 1.5, 4);
      let last = null;
      for (let k = 0; k < 7; k++) {
        const ang = k * 2.399 + 0.6 + 0.22 * t, rad = 1.5 + 0.5 * ((k * 37) % 5) / 5, h = 0.8 + 2.3 * ((k * 53) % 7) / 7, t0 = 1.2 + 0.28 * k;
        const P = c.at(rad * Math.cos(ang), h, rad * Math.sin(ang));
        F.orb('st' + k, P, 0.2 * (1 + 0.25 * Math.sin(t * 5 + k)), a * ramp(t, t0, t0 + 0.2), STAR, 2.4);
        if (last) F.strip('ln' + k, soft, last, last.clone().lerp(P, ramp(t, t0, t0 + 0.28)), 0.03, 0.8 * a, STAR, 1.6);
        F.strip('dn' + k, soft, P, P.clone().lerp(c.at(0, 1.3, 0), ramp(r, 0.1 + 0.05 * k, 0.5 + 0.05 * k)), 0.022, 0.5 * a * win(r, 0.1, 0.3, 1.2, 2.0), EMBER, 1.6);
        last = P;
      }
      F.pillar('col', c.at(0, 0, 0), 0.9, 6.0, t * 0.6, (0.2 * win(r, 0, 0.15, 0.5, 1.2) + 0.07) * a, 1, ICE, 1.3);
      for (let k = 0; k < 5; k++) {                           // rings of light climb her, one after another
        const u = (r / 1.6 - k * 0.2) % 1;
        if (r > k * 0.32 && t < 6.9 && u >= 0) F.hoop('up' + k, c.at(0, 0.1 + 2.2 * u, 0), q, 1.5 - 0.6 * u, t * 1.5 + k, 0.8 * Math.sin(u * Math.PI), 1, k % 2 ? GOLD : STAR, 1.7);
      }
      F.motes('embers', c.at(0, 0.1, 0), 700, r, { emit: 5.2, life: 2.2, spread: 1.5, rise: 1.0, size: 0.035, flatten: 0.1, swirl: 1.2, color: STAR });
      F.motes('glints', c.at(0, 0.1, 0), 200, r, { emit: 5.2, life: 1.8, spread: 1.0, rise: 1.4, size: 0.04, flatten: 0.1, swirl: -2.0, color: GOLD });
      F.flare('hz', c.at(0, 1.2, 0), 10 * win(r, 0, 0.08, 0.1, 0.5), 0.2, win(r, 0, 0.04, 0.15, 0.5));
      F.wave('w0', c.at(0, 0.05, 0), q, 1 + 9 * ease(r / 1.0), 0.6 * win(r, 0, 0.05, 0.4, 1.0), 1, VIOLET, 1.5);
      F.wave('w1', c.at(0, 0.05, 0), q, 1 + 8 * ease(end / 0.9), win(end, 0, 0.05, 0.4, 0.9), 1, GOLD);
      F.light(c.at(0, 2.2, 0.6), ICE, 2.4 * a + 6 * win(r, 0, 0.05, 0.2, 0.7));
      c.out.shake = 0.4 * win(r, 0, 0.05, 0.1, 0.6);
    },
    // Her hip bells unfold into a gold chain: drawn, whirled overhead in a ring of gold, and lashed out. The lash cuts the air,
    // and the cut hangs there a moment.
    GildedRebuke(t, c) {
      const Lh = c.hand('Left'), q = c.q, r = t - c.release, tg = c.target;
      let to;
      if (t < 0.55) to = Lh.clone().add(c.dir(0.05, -0.45 * ramp(t, 0.3, 0.55), 0.02));
      else if (r < 0) { const a = (t - 0.55) * 20; to = Lh.clone().add(c.dir(0.6 * Math.cos(a), 0.22, 0.6 * Math.sin(a))); }
      else to = Lh.clone().lerp(tg, ease(r / 0.12) - ease((r - 0.32) / 0.4));
      F.chain('ch', Lh, to, win(t, 0.3, 0.4, 1.75, 1.97));
      const whirl = win(t, 0.5, 0.7, c.release, c.release + 0.12), wp = Lh.clone().add(c.dir(0, 0.22, 0));
      F.shade('sh', wp, 3.2, 0.6 * whirl);
      F.ring('halo', wp, q, 1.45, -t * 20, whirl, 1, GOLD, 2.4); F.ring('halo2', wp, q, 1.0, t * 26, whirl * 0.7, 1, STAR, 2.0);
      F.motes('spin', wp, 240, t - 0.5, { emit: 0.5, life: 0.4, spread: 0.8, size: 0.05, flatten: 0.1, swirl: 14, color: GOLD, rise: 0 });
      const h = r - 0.12;
      F.strip('cut', soft, c.releaseL, tg, 0.09, win(r, 0.06, 0.12, 0.3, 0.7), STAR, 2.6);
      F.shade('sh2', tg, 3.4, 0.75 * win(h, 0, 0.03, 0.15, 0.5));
      F.glow('hit', 3, tg, 1 + 2.4 * ramp(h, 0, 0.12), win(h, 0, 0.03, 0.1, 0.45), GOLD, 2.8);
      F.flare('hz', tg, 7 * win(h, 0, 0.04, 0.06, 0.4), 0.2, win(h, 0, 0.03, 0.1, 0.4), GOLD);
      F.wave('w', tg, q, 0.4 + 3.2 * ease(h / 0.45), win(h, 0, 0.03, 0.2, 0.45), 0, GOLD);
      F.wave('wg', c.ground, q, 0.4 + 4.5 * ease(h / 0.6), win(h, 0, 0.03, 0.3, 0.6), 1, GOLD);
      F.motes('sp', tg, 700, h, { emit: 0.05, life: 0.8, spread: 2.6, rise: -0.6, size: 0.07, color: GOLD });
      F.light(r < 0 ? wp : tg, GOLD, 4 * whirl + 14 * win(h, 0, 0.03, 0.1, 0.5));
      c.out.shake = 0.9 * win(h, 0, 0.02, 0.06, 0.4);
    },
    // Silence, as it is between the stars. The air stills, a thin ring leaves her fingertip, and the space round her target
    // goes dark and dead: its sound is drawn in and shut inside a shell.
    Hush(t, c) {
      const tip = c.bone('RightHandIndex3'), q = c.q, r = t - c.release, tg = c.target, face = c.at(0, 1.5, 0.15);
      c.out.dim = 0.4 * win(t, 0.4, 1.6, c.release + 1.4, c.release + 2.0);
      F.motes('motes', face, 160, Math.min(t - 0.2, 0.8), { emit: 0.5, life: 1.6, spread: 1.0, rise: 0.04, size: 0.03, color: STAR });      // they drift, then hang still
      if (r < 0) {
        const p = tip.clone().add(c.dir(0, 0, 0.05)), g = ease(ramp(t, 1.5, 2.6));
        F.shade('sh', p, 1.6 * g, 0.7 * g);
        F.hoop('r', p, q, 0.12 + 0.14 * g, t * 3, ramp(t, 1.5, 1.9), 0, STAR, 2.0);
        F.rune('rr', p, q, 0.34 * g, -t * 2, g, g, 0, STAR, 1.5, 6);
        F.light(p, ICE, 1.2 * g);
      } else {
        const fly = ease(r / 0.3), at = c.releaseTip.clone().lerp(tg, fly);
        if (r < 0.32) F.hoop('r', at, q, 0.26 + 0.5 * fly, t * 3 + r * 5, 1, 0, STAR, 2.2);
        const on = ramp(r, 0.28, 0.4), off = 1 - ramp(r, 1.6, 2.1), shut = ease(ramp(r, 0.3, 0.95));
        F.shade('veil', tg, 6.5 - 2.6 * shut, 0.96 * on * off);
        F.shell('bub', tg, 1.5 - 0.75 * shut, on * off, STAR, 1.3, 6.0);
        for (let k = 0; k < 4; k++) { const u = (r - 0.3 - k * 0.17) / 0.7; if (u > 0 && u < 1) F.wave('in' + k, tg, q, 3.4 * (1 - ease(u)) + 0.3, 0.45 * Math.sin(u * Math.PI), cam.quaternion, DUSK, 1.2); }   // sound being drawn in
        for (let k = 0; k < 3; k++) { const u = (r - 0.35 - k * 0.2) / 0.7; if (u > 0 && u < 1) F.wave('ing' + k, c.ground, q, 4.2 * (1 - ease(u)) + 0.3, 0.4 * Math.sin(u * Math.PI), 1, DUSK, 1.2); }
        F.motes('pull', tg, 380, r - 0.3, { emit: 0.7, life: 0.6, spread: 2.4, size: 0.04, inward: true, rise: 0, color: STAR });
        F.rune('lock', tg, q, 1.0 * shut, r, ramp(r, 0.9, 1.1), off * ramp(r, 0.9, 1.0), cam.quaternion, STAR, 1.8, 8);
        F.flare('fl', tg, 3.5 * win(r, 0.9, 0.95, 1.0, 1.3), 0.1, win(r, 0.9, 0.95, 1.05, 1.3));
        F.light(tg, ICE, 2.5 * on * off);
      }
    },
    // A black hole gathers over her hand, drinking the light, and is dropped on her target with the weight of the sky.
    Gravity(t, c) {
      const Lh = c.hand('Left'), q = c.q, r = t - c.release, tg = c.target, gr = c.ground;
      if (r < 0) {
        const p = Lh.clone().add(c.dir(0, 0.17, 0)), s = ease(ramp(t, 0.15, 0.95));
        F.hole('g', p, 0.05 + 0.09 * s, t, ramp(t, 0.15, 0.4));
        F.motes('pull', p, 420, t - 0.2, { emit: 0.75, life: 0.42, spread: 1.5, size: 0.04, inward: true, rise: 0, swirl: 9, color: STAR });
        F.light(p, EMBER, 3 * s);
        c.out.dim = 0.5 * s;
      } else {
        const drop = ease(r / 0.13), mid = tg.clone().lerp(gr, 0.35), p = c.releaseL.clone().add(c.dir(0, 0.17, 0)).lerp(mid, drop), grow = ease(ramp(r, 0.1, 0.28)), gone = ease(ramp(r, 0.34, 0.44));
        F.hole('g', p, (0.14 + 0.72 * grow) * (1 - gone), t, 1 - gone);
        F.voidFlat('pit', gr, flat, 4.6 * win(r, 0.02, 0.2, 0.4, 0.7), t, 1, 0, STAR, 2.2);
        F.wave('imp', gr, q, 5.0 - 4.6 * ease(r / 0.36), 0.7 * win(r, 0.02, 0.08, 0.3, 0.4), 1, VIOLET, 1.5);
        F.motes('in', mid, 800, r, { emit: 0.12, life: 0.34, spread: 3.4, size: 0.05, inward: true, flatten: 0.5, rise: 0, swirl: 7, color: STAR });
        const b = r - 0.4;
        F.flare('hz', mid, 13 * win(b, 0, 0.05, 0.08, 0.4), 0.25, win(b, 0, 0.03, 0.1, 0.4));
        F.flare('vt', mid, 5 * win(b, 0, 0.05, 0.08, 0.3), 0.12, win(b, 0, 0.03, 0.1, 0.3), STAR, 3.0, true);
        F.orb('hit', mid, 0.5 + 1.5 * ramp(b, 0, 0.12), win(b, 0, 0.02, 0.06, 0.3), STAR, 1.8);
        F.wave('out', gr, q, 0.5 + 8 * ease(b / 0.5), 0.8 * win(b, 0, 0.02, 0.2, 0.5), 1, VIOLET, 1.6);
        F.motes('pop', mid, 500, b, { emit: 0.04, life: 0.9, spread: 2.6, size: 0.045, rise: 0.2, color: STAR });
        F.light(mid, ICE, 6 * (1 - gone) + 14 * win(b, 0, 0.02, 0.1, 0.4));
        c.out.dim = 0.5 * (1 - ramp(r, 0.4, 0.7)); c.out.shake = 0.5 * win(r, 0.02, 0.1, 0.3, 0.4) + 0.9 * win(b, 0, 0.02, 0.06, 0.35);
      }
    },
  };

  // Things that are hers but are not one of her clips.
  const EXTRA = {
    // The mark Doom leaves over a foe's head while the bell counts: a small black sun with one star left for each turn. c: { pos, count }
    DoomMark(t, c) {
      F.hole('m', c.pos, 0.17 + 0.012 * Math.sin(t * 3), t, 1, 0);
      for (let k = 0; k < (c.count || 0); k++) { const a = t * 1.3 + k * 2.094; F.orb('p' + k, c.pos.clone().addScaledVector(camRight(), 0.52 * Math.cos(a)).add(new THREE.Vector3(0, 0.52 * Math.sin(a), 0)), 0.11, 1, STAR, 2.6); }
    },
    // Doom landing, about 2.3 seconds; the foe is gone at 1.0. The ground opens on the night sky, the mark falls into the foe
    // and grows into a black hole that swallows it, everything near is pulled in, and it collapses to a line of light.
    // c: { top (where the mark was), target (its heart), ground }
    DoomLands(t, c) {
      const fall = ease(ramp(t, 0, 0.35)), grow = ease(ramp(t, 0.08, 0.85)), gone = ease(ramp(t, 0.9, 1.02)), p = c.top.clone().lerp(c.target, fall);
      c.out.dim = 0.92 * win(t, 0, 0.3, 1.3, 2.2);
      F.voidFlat('pit', c.ground, flat, 4.6 * ease(ramp(t, 0, 0.5)) * (1 - ease(ramp(t, 1.15, 1.7))), t, 1, 0, STAR, 2.0);
      F.hole('h', p, (0.16 + 0.95 * grow) * (1 - gone), t, 1, 0.8);
      F.motes('in', p, 900, t - 0.05, { emit: 0.8, life: 0.5, spread: 4.8, size: 0.05, inward: true, rise: 0, swirl: 8, color: STAR });
      F.flare('hz', p, 12 * win(t, 0.9, 1.0, 1.02, 1.5), 0.14, win(t, 0.9, 0.98, 1.1, 1.5), STAR, 2.4);
      F.flare('vt', p, 4.5 * win(t, 0.92, 1.0, 1.02, 1.3), 0.09, win(t, 0.92, 0.98, 1.05, 1.3), STAR, 2.2, true);
      F.orb('pt', p, 0.5 + 1.8 * ramp(t, 1.0, 1.15), win(t, 1.0, 1.03, 1.1, 1.5), STAR, 2.2);
      for (let k = 0; k < 3; k++) { const u = t - 1.05 - 0.14 * k; F.wave('w' + k, c.ground.clone().add(new THREE.Vector3(0, 0.3 * k, 0)), ID, 0.8 + 10 * ease(u / 1.1), 0.8 * win(u, 0, 0.05, 0.4, 1.1), 1, k === 1 ? VIOLET : STAR, 1.3); }
      F.motes('dust', p, 500, t - 1.05, { emit: 0.1, life: 1.8, spread: 4.0, size: 0.04, rise: 0.15, color: STAR });
      F.light(p, ICE, 5 * grow * (1 - gone) + 10 * win(t, 1.0, 1.03, 1.15, 1.6));
      c.out.shake = 0.5 * win(t, 0.1, 0.8, 0.9, 1.0) + win(t, 1.0, 1.03, 1.1, 1.6);
    },
  };

  // Draw one spell at clip time t. 'slot' tells two casts of the same spell apart.
  function cast(name, t, c, slot = '') { ns = name + slot + ':'; SPELLS[name](t, c); ns = ''; }
  // Draw anything else with the same building blocks, under a name of its own.
  function draw(name, fn) { ns = name + ':'; fn(F, { cl, ramp, ease, win, glowTex, VIOLET, GOLD, DUSK, ROSE, STAR, ICE, EMBER }); ns = ''; }
  // Draw one of the EXTRA effects (the Doom mark, Doom landing). c: { pos or target, ground, count, out }.
  function extra(name, key, t, c) { ns = name + key + ':'; if (!c.out) c.out = { dim: 0, shake: 0 }; EXTRA[name](t, c); ns = ''; return c.out; }
  return { F, SPELLS, EXTRA, cast, draw, extra, group, light, uH, pool, arena(r) { edge = r; } };
}
