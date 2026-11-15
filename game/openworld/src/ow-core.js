// ow-core.js: the open world's drawing set-up, shared by the land, the places and the props. three.js r128, global THREE.
// Two scenes drawn into one picture: the world (land, water, sky, the places and everything that stands still), drawn with this file's
// own light and fog, then the cast (the Jester and the fair folk) drawn over it with the witches' own light rig, sharing the depth, so a
// tent hides her as it should. Every world surface writes 0 into the picture's see-through channel and the cast writes 1: the Flipbook
// look uses that to ink only the cast, as the witches' stages do.
window.OW = window.OW || {};
(function (OW) {
  'use strict';
  const D = () => window.OW_DATA;
  // ---- light and fog, the same numbers for every world surface (one set of uniforms, shared by reference) ----
  const MOON_DIR = new THREE.Vector3(-0.52, 0.6, -0.61).normalize();      // Auros stands in the north-west, as in every painting and on the map
  const U = OW.U = {
    uMoonDir: { value: MOON_DIR.clone() }, uMoonCol: { value: new THREE.Color(0.56, 0.56, 0.62) },
    uSky: { value: new THREE.Color(0.54, 0.52, 0.58) }, uGround: { value: new THREE.Color(0.28, 0.24, 0.26) },      // nearly white: the painted colours already carry the night; the light only gives the land its shape
    uFogW: { value: new THREE.Color('#6a4d63') }, uFogE: { value: new THREE.Color('#29274a') }, uFogD: { value: 0.0042 },
    uCamPos: { value: new THREE.Vector3() }, uTime: { value: 0 }, uExpo: { value: 1.0 },
    uLampP: { value: Array.from({ length: 8 }, () => new THREE.Vector3(0, -999, 0)) }, uLampC: { value: Array.from({ length: 8 }, () => new THREE.Vector3()) },
  };
  for (const k of ['uFogW', 'uFogE']) U[k].value.convertSRGBToLinear();
  OW.MOON_DIR = MOON_DIR;
  // the GLSL every world surface shares: light from Auros, the sky and the ground, the lamps, and fog that is warmer toward the west
  OW.GLSL = `
uniform vec3 uMoonDir; uniform vec3 uMoonCol; uniform vec3 uSky; uniform vec3 uGround; uniform vec3 uFogW; uniform vec3 uFogE; uniform float uFogD;
uniform vec3 uCamPos; uniform float uTime; uniform float uExpo; uniform vec3 uLampP[8]; uniform vec3 uLampC[8];
vec3 s2l(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
vec3 owLight(vec3 n, vec3 p, float wrap) {
  vec3 L = uMoonCol * max((dot(n, uMoonDir) + wrap) / (1.0 + wrap), 0.0) + mix(uGround, uSky, n.y * 0.5 + 0.5);
  for (int i = 0; i < 8; i++) { vec3 d = uLampP[i] - p; float r2 = dot(d, d); L += uLampC[i] * (0.35 + 0.65 * max(dot(n, d * inversesqrt(r2 + 1e-4)), 0.0)) / (1.0 + r2 * 0.45); }
  return L * uExpo;
}
vec3 owFogCol(vec3 p) { vec3 v = normalize(p - uCamPos); return mix(uFogE, uFogW, smoothstep(0.35, -0.85, v.x)); }
vec3 owFog(vec3 c, vec3 p) { float d = length(p - uCamPos); float f = 1.0 - exp(-uFogD * uFogD * d * d); return mix(c, owFogCol(p), f); }
float owHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float owNoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f); return mix(mix(owHash(i), owHash(i + vec2(1, 0)), u.x), mix(owHash(i + vec2(0, 1)), owHash(i + vec2(1, 1)), u.x), u.y); }
`;
  OW.out = 'gl_FragColor = linearToOutputTexel(vec4(col, 0.0));';
  // a picture from the page's data, ready to draw with (sRGB, mipmapped, repeating if asked)
  const texCache = new Map();                                              // one copy of each picture on the graphics card, however many surfaces use it
  OW.tex = function (src, o) {
    o = o || {}; const key = src + (o.repeat ? '#r' : ''); if (texCache.has(key)) return texCache.get(key); const t = new THREE.Texture(); texCache.set(key, t); const im = new Image();
    t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; if (o.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.ready = new Promise((ok, bad) => { im.onload = () => { t.image = im; t.needsUpdate = true; ok(t); }; im.onerror = () => bad(new Error('a picture did not load')); });
    im.src = src; return t;
  };
  // the average colour of a picture, linear, for the land's detail (each patch is used for its grain, not its colour)
  OW.meanOf = function (im) { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 32, 32); const d = g.getImageData(0, 0, 32, 32).data; let r = 0, gg = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += Math.pow(d[i] / 255, 2.2); gg += Math.pow(d[i + 1] / 255, 2.2); b += Math.pow(d[i + 2] / 255, 2.2); } const n = d.length / 4; return new THREE.Vector3(r / n, gg / n, b / n); };

  // ---- the sky: dusk still warm low in the west, night overhead and in the east, stars, Auros with her halo ----
  OW.makeSky = function (scene) {
    const mat = new THREE.ShaderMaterial({ depthWrite: false, side: THREE.BackSide, fog: false,
      uniforms: { uMoonDir: U.uMoonDir, uTime: U.uTime, tMoon: { value: null } },
      vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
      fragmentShader: `uniform vec3 uMoonDir; uniform float uTime; uniform sampler2D tMoon; varying vec3 vD;
        vec3 s2l(vec3 c) { return pow(c, vec3(2.2)); }
        float h(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
        void main() {
          vec3 d = normalize(vD); float el = d.y, west = smoothstep(0.2, -0.9, d.x) * (0.55 + 0.45 * smoothstep(0.6, -0.2, d.z * 0.6 + d.x * 0.2));
          vec3 zen = s2l(vec3(0.07, 0.07, 0.19)), mid = s2l(vec3(0.17, 0.16, 0.34)), hzE = s2l(vec3(0.17, 0.16, 0.30)), hzW = s2l(vec3(0.62, 0.38, 0.40)), glow = s2l(vec3(0.86, 0.52, 0.38));
          vec3 hz = mix(hzE, hzW, west);
          vec3 col = mix(hz, mid, smoothstep(0.0, 0.22, el)); col = mix(col, zen, smoothstep(0.18, 0.75, el));
          col += glow * west * west * exp(-max(el, 0.0) * 18.0) * 0.55;                                    // the last of the sunset, right on the western edge
          col = mix(col, s2l(vec3(0.10, 0.09, 0.14)), smoothstep(0.0, -0.08, el));                           // below the horizon (far off, past the land)
          // a few long thin clouds low in the west
          float cl = smoothstep(0.55, 0.85, sin(d.x * 9.0 + d.z * 4.0) * 0.5 + 0.5) * smoothstep(0.02, 0.07, el) * smoothstep(0.2, 0.08, el) * west;
          col = mix(col, s2l(vec3(0.34, 0.22, 0.30)), cl * 0.55);
          // stars: one in some cells of a fine grid on the sky, brighter overhead and away from the west
          vec3 g = floor(d * 260.0); float s = h(g); float star = step(0.9965, s) * smoothstep(0.04, 0.35, el) * (1.0 - west * 0.8);
          float tw = 0.75 + 0.25 * sin(uTime * (1.5 + s * 3.0) + s * 40.0); col += vec3(0.85, 0.85, 1.0) * star * tw * 0.9 * (0.4 + 0.6 * fract(s * 97.0));
          // Auros: her painted face and a soft halo
          float m = dot(d, uMoonDir); float halo = smoothstep(0.93, 0.9995, m); col += s2l(vec3(0.72, 0.68, 0.86)) * (halo * halo * 0.22 + pow(max(m, 0.0), 300.0) * 0.12);
          vec3 up = abs(uMoonDir.y) > 0.99 ? vec3(1, 0, 0) : vec3(0, 1, 0), ax = normalize(cross(up, uMoonDir)), ay = cross(uMoonDir, ax);
          float R = 0.052; vec2 q = vec2(dot(d, ax), dot(d, ay)) / R;
          if (m > 0.0 && abs(q.x) < 1.0 && abs(q.y) < 1.0) { vec4 mt = texture2D(tMoon, q * 0.5 + 0.5); col = mix(col, s2l(mt.rgb) * 1.15, mt.a); }
          gl_FragColor = linearToOutputTexel(vec4(col, 0.0));
        }` });
    const m = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), mat); m.frustumCulled = false; m.renderOrder = -100; scene.add(m);
    OW.tex(D().img.moon).ready.then((t) => { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; mat.uniforms.tMoon.value = t; });
    return m;
  };

  // ---- the cast's light: the witches' own rig (copied from game/src/stage.js, numbers unchanged), turned with the camera so the key
  // always comes from the viewer's side, as in her theatre; the colour and strength move from dusk at the fair to night on the moor ----
  OW.makeRig = function (renderer, cast) {
    (function env() {
      const es = new THREE.Scene(), g = new THREE.SphereGeometry(10, 32, 16), col = [];
      const top = new THREE.Color(0.26, 0.23, 0.38), mid = new THREE.Color(0.10, 0.08, 0.13), bot = new THREE.Color(0.03, 0.022, 0.035), c = new THREE.Color();
      for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 10; if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.7)); else c.copy(mid).lerp(bot, Math.pow(-y, 0.5)); col.push(c.r, c.g, c.b); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); es.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
      const panel = (x, y, z, w, h, r, gg, b) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(r, gg, b), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 1, 0); es.add(m); };
      panel(4, 6, 5, 4, 3, 5.0, 4.2, 3.4); panel(-6, 3, 2, 2, 4, 0.8, 0.9, 1.6); panel(-2, 5, -7, 5, 2.5, 2.4, 1.1, 3.6); panel(6, 1.5, -3, 1.5, 3, 1.4, 0.7, 1.2);
      const pm = new THREE.PMREMGenerator(renderer); cast.environment = pm.fromScene(es, 0.03).texture; pm.dispose();
    })();
    const hemi = new THREE.HemisphereLight(0xc8bcc4, 0x4a3438, 0.40); cast.add(hemi);
    const key = new THREE.DirectionalLight(0xffeedd, 0.72); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera; sc.left = -1.9; sc.right = 1.9; sc.top = 2.4; sc.bottom = -0.6; sc.near = 0.5; sc.far = 14; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.018; key.shadow.radius = 3.5; cast.add(key, key.target);
    const rim = new THREE.DirectionalLight(0xd8b8ff, 0.30), rim2 = new THREE.DirectionalLight(0xffc8d8, 0.16), back = new THREE.DirectionalLight(0xffeedd, 0.42), fill = new THREE.DirectionalLight(0xc8ccff, 0.26);
    for (const l of [rim, rim2, back, fill]) { cast.add(l, l.target); }
    const near = []; for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xffb768, 0, 7, 2); l.position.set(0, -50, 0); cast.add(l); near.push(l); }
    const OFF = [[key, 1.7, 3.6, 3.2], [rim, -1.8, 2.6, -3.2], [rim2, 2.6, 1.6, -2.6], [back, -1.2, 3.0, -3.4], [fill, -2.6, 1.2, 2.4]];
    const FAIR = { key: new THREE.Color(0xffeedd), keyK: 1.0, rimK: 1.0, dim: 0.0 }, MOOR = { key: new THREE.Color(0xc9d2ff), keyK: 0.9, rimK: 1.5, dim: 0.22 };
    const BASE = [[hemi, 0.40, 0.7], [key, 0.72, 0.6], [fill, 0.26, 0.7], [back, 0.42, 0.6]];
    return { key, near, hemi,
      // place the rig round a point, turned to the camera's heading (yaw: the way the camera looks, 0 = north); moor: 0 at the fair, 1 out on the moor
      place(p, yaw, moor) {
        const c = Math.cos(yaw), s = Math.sin(yaw);
        for (const [l, x, y, z] of OFF) { const wx = x * c + z * s, wz = -x * s + z * c; l.position.set(p.x + wx, p.y + y, p.z + wz); l.target.position.set(p.x, p.y + 0.9, p.z); l.target.updateMatrixWorld(); }
        const dim = FAIR.dim + (MOOR.dim - FAIR.dim) * moor; key.color.copy(FAIR.key).lerp(MOOR.key, moor);
        for (const [l, b, k] of BASE) l.intensity = b * (1 - k * dim) * (l === key ? FAIR.keyK + (MOOR.keyK - FAIR.keyK) * moor : 1);
        rim.intensity = 0.30 * (FAIR.rimK + (MOOR.rimK - FAIR.rimK) * moor);
      } };
  };
  // light that is added (a lamp's glow, a spell) leaves the see-through channel alone, so the Flipbook look does not ink the air
  OW.glowOnly = (m) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = m.premultipliedAlpha ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; return m; };
  // a soft round glow, for lamps and fires
  OW.glowTex = (function () { let t = null; return () => { if (t) return t; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,236,200,1)'); gr.addColorStop(0.25, 'rgba(255,190,110,0.55)'); gr.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); t = new THREE.CanvasTexture(c); return t; }; })();
})(window.OW);
