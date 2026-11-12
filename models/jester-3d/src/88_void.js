  // ---------- the look of her power under the lore: holes in the world with the night sky inside, thin cold light, slow star dust ----------
  // Brought over from the not-HD model (branch claude/jester-not-hd-3d-model, viewer/fx.js) and rewritten for three.js r128.
  // Everything here is drawn afresh each frame from the move's own clock: VF.thing(name, ...) shows the object of that name (made the
  // first time it is asked for), and whatever is not asked for again is hidden at the start of the next frame. Colours go brighter
  // than white on purpose: a host with a glow pass makes that shine. Rules for the look are in the project doc claude/jester-game-model.md:
  // black comes first, light is thin and cold, dust is round star dust, gold is only a thread.
  const VBLEND = { transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor };
  const V_END = '\n gl_FragColor = linearToOutputTexel(gl_FragColor); }';
  const V_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  // a magic circle that draws itself: rings, rune ticks, a hexagram and a turning square
  const V_RUNE = `varying vec2 vUv; uniform float uT, uDraw, uAlpha, uSeed; uniform vec3 uColor;
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
      gl_FragColor = vec4(uColor * (v + halo), uAlpha * sweep * step(r, 1.0));` + V_END;
  // a column of light with streaks running up (or down) it
  const V_PILLAR = `varying vec2 vUv; uniform float uT, uAlpha, uDir; uniform vec3 uColor;
    void main(){
      float n = fract(sin(floor(vUv.x * 56.0) * 12.9898) * 43758.5453);
      float f = fract(vUv.y * (0.8 + n) - uT * uDir * (0.35 + 0.6 * n) + n * 7.0);
      float streak = smoothstep(0.0, 0.2, f) * smoothstep(1.0, 0.3, f) * step(0.4, n);
      float v = (0.16 + 0.9 * streak) * pow(1.0 - vUv.y, 1.5) + 0.2 * exp(-vUv.y * 14.0);
      gl_FragColor = vec4(uColor * v, uAlpha);` + V_END;
  // a shock ring: a bright edge with light trailing inside it
  const V_WAVE = `varying vec2 vUv; uniform float uAlpha; uniform vec3 uColor;
    void main(){
      float r = length(vUv * 2.0 - 1.0);
      float v = smoothstep(0.035, 0.0, abs(r - 0.94)) * 1.3 + smoothstep(0.6, 0.94, r) * step(r, 0.94) * 0.22;
      gl_FragColor = vec4(uColor * v, uAlpha * step(r, 1.0));` + V_END;
  // a shell that shows only at its rim
  const V_SHELL_V = 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }';
  const V_SHELL = 'varying vec3 vN; varying vec3 vV; uniform float uAlpha, uPow; uniform vec3 uColor; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow); gl_FragColor = vec4(uColor * f, uAlpha);' + V_END;
  // hundreds of points of dust from one draw call; each one's whole life is worked out from the move's clock
  const V_MOTE_V = `attribute vec4 aSeed; uniform vec3 uOrigin; uniform float uAge, uLife, uEmit, uSpread, uRise, uSize, uInward, uSwirl, uFlat, uH; varying float vA;
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
  const V_MOTE_F = `varying float vA; uniform vec3 uColor; uniform float uSpark;
    void main(){
      vec2 p = gl_PointCoord * 2.0 - 1.0; float r = length(p);
      float s = mix(exp(-r * r * 9.0) * 1.5, (0.012 / (abs(p.x) * abs(p.y) + 0.012)) * max(0.0, 1.0 - r) + exp(-r * r * 7.0) * 0.8, uSpark);
      gl_FragColor = vec4(uColor * s, vA);` + V_END;
  // the night sky seen in a direction: three depths of stars and a faint river of dust
  const V_SKY = `
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
      return col + vec3(0.0015, 0.0012, 0.006) + vec3(0.012, 0.005, 0.034) * smoothstep(0.1, 1.0, n) + vec3(0.003, 0.010, 0.022) * smoothstep(0.3, 1.0, m);
    }`;
  const V_VOID_V = 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }';
  // a ball of nothing with the sky inside it and a thin rim of light
  const V_VOID_BALL = V_SKY + `varying vec3 vN; varying vec3 vV; varying vec3 vW; uniform float uT, uAlpha, uPow, uStars; uniform vec3 uRim;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow);
      gl_FragColor = vec4(sky(normalize(vW - cameraPosition), uT) * uStars * (1.0 - f) + uRim * f, uAlpha);` + V_END;
  // a flat hole in the world: a disc (shape 0), or a drape with a bright hem on its right (1) or left (2) edge
  const V_VOID_FLAT = V_SKY + `varying vec2 vUv; varying vec3 vW; uniform float uT, uAlpha, uShape, uStars; uniform vec3 uRim;
    void main(){ vec2 p = vUv * 2.0 - 1.0; float e, k = 1.0;
      if (uShape < 0.5) { float r = length(p); if (r > 1.0) discard; e = smoothstep(0.016, 0.0, abs(r - 0.978)) + 0.16 * exp(-(1.0 - r) * 22.0); }
      else { float x = uShape < 1.5 ? p.x : -p.x; e = exp(-(1.0 - x) * 90.0) + exp(-(1.0 - x) * 12.0) * 0.025; k = 0.7 + 0.3 * sin(p.x * 16.0 + sin(p.y * 3.0 + uT) * 1.3); }
      gl_FragColor = vec4(sky(normalize(vW - cameraPosition), uT) * uStars * k + uRim * e, uAlpha);` + V_END;
  // a thin hoop with graduations, like a ring of an armillary sphere
  const V_HOOP = `varying vec2 vUv; uniform float uAlpha; uniform vec3 uColor;
    void main(){ float r = length(vUv * 2.0 - 1.0), a = atan(vUv.y - 0.5, vUv.x - 0.5);
      float v = smoothstep(0.009, 0.0, abs(r - 0.965)) + step(0.5, fract(a * 36.0 / 6.28318)) * smoothstep(0.012, 0.0, abs(r - 0.925)) * 0.35 + exp(-abs(r - 0.965) * 30.0) * 0.05;
      gl_FragColor = vec4(uColor * v, uAlpha * step(r, 1.0));` + V_END;
  // the disc of light falling into a black hole: streaks that wind faster the nearer they are
  const V_ACCRETE = `varying vec2 vUv; uniform float uT, uAlpha; uniform vec3 uColor;
    void main(){ vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x);
      float band = smoothstep(0.40, 0.50, r) * smoothstep(1.0, 0.70, r), w = a + uT * (1.3 / (r + 0.15));
      float st = (0.55 + 0.45 * sin(w * 7.0 + r * 31.0)) * (0.6 + 0.4 * sin(w * 3.0 - r * 13.0));
      vec3 col = mix(uColor, vec3(1.0), smoothstep(0.80, 0.44, r));
      gl_FragColor = vec4(col * band * (0.25 + 0.75 * st) * (1.15 - 0.55 * r), uAlpha * step(r, 1.0));` + V_END;
  // darkness around a point: it takes light away from whatever is behind it
  const V_SHADE = 'varying vec2 vUv; uniform float uAlpha; void main(){ float r = length(vUv * 2.0 - 1.0); gl_FragColor = vec4(vec3(pow(1.0 - uAlpha * smoothstep(1.0, 0.12, r), 0.4545)), 1.0); }';      // the picture is kept in screen values, so the share of light left is put into screen values too

  const V_VIOLET = 0xd070ff, V_GOLD = 0xffb040, V_DUSK = 0x8f6cff, V_STAR = 0xdfe6ff, V_ICE = 0x9fb4ff, V_EMBER = 0xffdcae;      // V_STAR is starlight, V_ICE the cold light it casts, V_EMBER the warm light round a black hole
  let vCam = null, arenaR = 0, spinHost = 0, vNs = '';
  const vCamSpare = new THREE.PerspectiveCamera(30, 1, 0.1, 100); vCamSpare.position.set(0, 1.3, 6.5); vCamSpare.lookAt(0, 1, 0);
  const camNow = () => vCam || vCamSpare;
  const vPool = new Map(), vPlane = new THREE.PlaneGeometry(1, 1), vTube = new THREE.CylinderGeometry(1, 1, 1, 56, 1, true).translate(0, 0.5, 0), vBall = new THREE.SphereGeometry(1, 40, 24);
  const vSoft = (function () { const c = cvs(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return ctex(c, 0, 0, true); })();
  const vSeeds = (n) => { const g = new THREE.BufferGeometry(), a = new Float32Array(n * 4); let s = 9001 + n; for (let i = 0; i < a.length; i++) { s = (s * 16807) % 2147483647; a[i] = s / 2147483647; } g.setAttribute('aSeed', new THREE.BufferAttribute(a, 4)); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return g; };
  const vMoteGeo = {}, _vsz = new THREE.Vector2();
  const vC = (hex, gain) => new THREE.Color(hex).convertSRGBToLinear().multiplyScalar(gain);
  const vBasic = (map, color, gain) => new THREE.MeshBasicMaterial(Object.assign({ map, color: vC(color, gain), toneMapped: false }, VBLEND));
  const vShader = (frag, uniforms, vert) => new THREE.ShaderMaterial(Object.assign({ vertexShader: vert || V_VERT, fragmentShader: frag, uniforms }, VBLEND));
  const vFlatQ = new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), -PI / 2), _vtq = Qt(), _vsq = Qt(), V_ID = Qt();
  function vGet(id, make) {
    id = vNs + id; let o = vPool.get(id);
    if (!o) { o = make(); o.renderOrder = 30; o.frustumCulled = false; fx.add(o); fxAuto.push(o); vPool.set(id, o); }
    o.visible = true; return o;
  }
  // tilt 0 stands the picture up facing the way rootQ faces, 1 lays it flat; or pass a quaternion of your own
  function vPlace(m, pos, rootQ, size, spin, tilt) {
    if (tilt && tilt.isQuaternion) _vtq.copy(tilt); else { _vtq.copy(rootQ); _vsq.copy(rootQ).multiply(vFlatQ); _vtq.slerp(_vsq, tilt || 0); }
    m.quaternion.copy(_vtq).multiply(_vsq.setFromAxisAngle(Z_AX, spin || 0));
    m.position.copy(pos); m.scale.set(size, size, 1);
  }
  const VF = {
    rune(id, pos, rootQ, size, t, draw, alpha, tilt, color, gain, seed) {
      if (alpha <= 0.003 || size <= 0 || draw <= 0) return;
      const m = vGet(id, () => new THREE.Mesh(vPlane, vShader(V_RUNE, { uT: { value: 0 }, uDraw: { value: 1 }, uAlpha: { value: 1 }, uSeed: { value: seed || 1 }, uColor: { value: vC(color == null ? V_VIOLET : color, gain == null ? 2.2 : gain) } })));
      vPlace(m, pos, rootQ, size, 0, tilt == null ? 1 : tilt); const u = m.material.uniforms; u.uT.value = t; u.uDraw.value = draw; u.uAlpha.value = Math.min(1, alpha);
    },
    wave(id, pos, rootQ, size, alpha, tilt, color, gain) {
      if (alpha <= 0.003 || size <= 0) return;
      const m = vGet(id, () => new THREE.Mesh(vPlane, vShader(V_WAVE, { uAlpha: { value: 1 }, uColor: { value: vC(color == null ? V_VIOLET : color, gain == null ? 1.9 : gain) } })));
      vPlace(m, pos, rootQ, size, 0, tilt == null ? 1 : tilt); m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    pillar(id, base, radius, height, t, alpha, dir, color, gain) {
      if (alpha <= 0.003) return;
      const m = vGet(id, () => new THREE.Mesh(vTube, vShader(V_PILLAR, { uT: { value: 0 }, uAlpha: { value: 1 }, uDir: { value: 1 }, uColor: { value: vC(color == null ? V_VIOLET : color, gain == null ? 1.8 : gain) } })));
      m.position.copy(base); m.quaternion.identity(); m.scale.set(radius, height, radius);
      const u = m.material.uniforms; u.uT.value = t; u.uAlpha.value = Math.min(1, alpha); u.uDir.value = dir == null ? 1 : dir;
    },
    shell(id, pos, radius, alpha, color, gain, pow) {
      if (alpha <= 0.003 || radius <= 0) return;
      const m = vGet(id, () => new THREE.Mesh(vBall, vShader(V_SHELL, { uAlpha: { value: 1 }, uPow: { value: pow || 2.5 }, uColor: { value: vC(color == null ? V_DUSK : color, gain == null ? 2.2 : gain) } }, V_SHELL_V)));
      m.position.copy(pos); m.scale.setScalar(radius); m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    orb(id, pos, size, alpha, color, gain) {                // a plain soft light, facing the camera
      if (alpha <= 0.003 || size <= 0) return;
      const m = vGet(id, () => new THREE.Mesh(vPlane, vBasic(vSoft, color == null ? V_STAR : color, gain == null ? 2.6 : gain)));
      m.quaternion.copy(camNow().quaternion); m.position.copy(pos); m.scale.set(size, size, 1); m.material.opacity = Math.min(1, alpha);
    },
    hoop(id, pos, rootQ, size, spin, alpha, tilt, color, gain) {
      if (alpha <= 0.003 || size <= 0) return;
      const m = vGet(id, () => new THREE.Mesh(vPlane, vShader(V_HOOP, { uAlpha: { value: 1 }, uColor: { value: vC(color == null ? V_STAR : color, (gain == null ? 2.0 : gain) * 0.75) } })));
      vPlace(m, pos, rootQ, size, spin, tilt == null ? 1 : tilt); m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    accrete(id, pos, size, t, alpha, tilt, color, gain) {
      if (alpha <= 0.003 || size <= 0) return;
      const m = vGet(id, () => new THREE.Mesh(vPlane, vShader(V_ACCRETE, { uT: { value: 0 }, uAlpha: { value: 1 }, uColor: { value: vC(color == null ? V_EMBER : color, gain == null ? 1.15 : gain) } })));
      vPlace(m, pos, V_ID, size, 0, tilt == null ? 0.84 : tilt); m.material.uniforms.uT.value = t; m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    // ---- the void: these hide and darken, where everything else here adds light ----
    voidBall(id, pos, radius, alpha, rim, gain, pow, stars, t) {
      if (alpha <= 0.01 || radius <= 0.002) return;
      const m = vGet(id, () => new THREE.Mesh(vBall, new THREE.ShaderMaterial({ vertexShader: V_VOID_V, fragmentShader: V_VOID_BALL, transparent: true, depthWrite: true,
        uniforms: { uT: { value: 0 }, uAlpha: { value: 1 }, uPow: { value: pow || 4.0 }, uStars: { value: stars == null ? 1 : stars }, uRim: { value: vC(rim == null ? V_STAR : rim, (gain == null ? 3.0 : gain) * 0.7) } } })));
      m.renderOrder = 29; m.position.copy(pos); m.scale.setScalar(radius); m.quaternion.identity();
      const u = m.material.uniforms; u.uT.value = t || 0; u.uAlpha.value = Math.min(1, alpha);
    },
    // size is the width across, or [width, height] for a drape. shape: 0 disc, 1 drape with its hem on the right, 2 on the left.
    voidFlat(id, pos, quat, size, t, alpha, shape, rim, gain, stars) {
      const w = Array.isArray(size) ? size[0] : size, h = Array.isArray(size) ? size[1] : size;
      if (alpha <= 0.01 || w <= 0.01) return;
      const m = vGet(id, () => new THREE.Mesh(vPlane, new THREE.ShaderMaterial({ vertexShader: V_VOID_V, fragmentShader: V_VOID_FLAT, transparent: true, depthWrite: true, side: THREE.DoubleSide,
        uniforms: { uT: { value: 0 }, uAlpha: { value: 1 }, uShape: { value: shape || 0 }, uStars: { value: stars == null ? 1 : stars }, uRim: { value: vC(rim == null ? V_STAR : rim, (gain == null ? 2.6 : gain) * 0.6) } } })));
      m.renderOrder = 29; m.position.copy(pos); m.quaternion.copy(quat); m.scale.set(w, h, 1);
      const u = m.material.uniforms; u.uT.value = t; u.uAlpha.value = Math.min(1, alpha); u.uShape.value = shape || 0;
    },
    shade(id, pos, size, alpha) {              // always faces the camera
      if (alpha <= 0.01 || size <= 0) return;
      const m = vGet(id, () => new THREE.Mesh(vPlane, new THREE.ShaderMaterial({ vertexShader: V_VERT, fragmentShader: V_SHADE, transparent: true, depthWrite: false, uniforms: { uAlpha: { value: 0 } },
        blending: THREE.CustomBlending, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor })));
      m.renderOrder = 28; m.quaternion.copy(camNow().quaternion); m.position.copy(pos); m.scale.set(size, size, 1); m.material.uniforms.uAlpha.value = Math.min(1, alpha);
    },
    // a black hole as films draw it: a ball of nothing, a thin ring of light bent round it, a disc of light spinning into it, and the dark it casts
    hole(id, pos, radius, t, alpha, stars) {
      if (alpha == null) alpha = 1; if (alpha <= 0.01 || radius <= 0.002) return;
      VF.shade(id + 's', pos, radius * 8, 0.8 * alpha);
      VF.voidBall(id + 'b', pos, radius, alpha, V_STAR, 3.2, 5.0, stars == null ? 0.6 : stars, t);
      VF.wave(id + 'h', pos, V_ID, radius * 2.42, 0.8 * alpha, camNow().quaternion, V_EMBER, 0.85);
      VF.accrete(id + 'd', pos, radius * 4.4, t * 4, 0.9 * alpha, 0.84, V_EMBER, 0.8);      // kept lower than the not-HD numbers: here light is added in screen values, which runs brighter
    },
    // a picture stretched from one point to another and turned to face the camera (a streak of light)
    strip(id, from, to, width, alpha, color, gain) {
      const dir = _vd1.copy(to).sub(from), len = dir.length();
      if (alpha <= 0.003 || len < 0.02) return;
      const m = vGet(id, () => new THREE.Mesh(vPlane, vBasic(vSoft, color == null ? 0xffffff : color, gain == null ? 1.8 : gain)));
      const x = _vd2.copy(dir).normalize(), view = _vd3.copy(camNow().position).sub(from).normalize(), y = _vd4.copy(view).cross(x).normalize(), z = _vd5.copy(x).cross(y);
      m.quaternion.setFromRotationMatrix(_m4.makeBasis(x, y, z));
      m.position.copy(from).addScaledVector(dir, 0.5); m.scale.set(len, width, 1); m.material.opacity = Math.min(1, alpha);
    },
    flare(id, pos, len, width, alpha, color, gain, upright) {      // a thin line of light across the picture
      if (alpha <= 0.003 || len <= 0.02) return;
      const r = _vd6.set(upright ? 0 : 1, upright ? 1 : 0, 0).applyQuaternion(camNow().quaternion).multiplyScalar(len / 2);
      VF.strip(id, _vd7.copy(pos).sub(r), _vd8.copy(pos).add(r), width, alpha, color == null ? V_STAR : color, gain == null ? 3.0 : gain);
    },
    // n points of dust born over 'emit' seconds from origin, each living about 'life' seconds. age is seconds since the first was born.
    motes(id, origin, n, age, o) {
      o = o || {}; const emit = o.emit == null ? 0.3 : o.emit, life = o.life == null ? 0.9 : o.life;
      if (age <= 0 || age > emit + life) return;
      n = Q(n, 40); const color = o.color == null ? V_VIOLET : o.color;
      const m = vGet(id, () => { const p = new THREE.Points(vMoteGeo[n] || (vMoteGeo[n] = vSeeds(n)), new THREE.ShaderMaterial(Object.assign({ vertexShader: V_MOTE_V, fragmentShader: V_MOTE_F,
        uniforms: { uOrigin: { value: V3() }, uAge: { value: 0 }, uLife: { value: 1 }, uEmit: { value: 0 }, uSpread: { value: 1 }, uRise: { value: 0 }, uSize: { value: 0.07 }, uInward: { value: 0 }, uSwirl: { value: 0 }, uFlat: { value: 1 }, uSpark: { value: 0 }, uH: { value: 800 }, uColor: { value: vC(color, o.gain == null ? 2.6 : o.gain) } } }, VBLEND)));
        p.onBeforeRender = (r) => { const rt = r.getRenderTarget(); p.material.uniforms.uH.value = rt ? rt.height : r.getDrawingBufferSize(_vsz).y; }; return p; });
      const u = m.material.uniforms; u.uOrigin.value.copy(origin); u.uAge.value = age; u.uLife.value = life; u.uEmit.value = emit; u.uSpread.value = o.spread == null ? 0.6 : o.spread; u.uRise.value = o.rise == null ? 0.2 : o.rise; u.uSize.value = o.size == null ? 0.07 : o.size;
      u.uInward.value = o.inward ? 1 : 0; u.uSwirl.value = o.swirl || 0; u.uFlat.value = o.flatten == null ? 1 : o.flatten; u.uSpark.value = o.spark == null ? (color === V_STAR ? 0 : 1) : o.spark;
    }
  };
  const _vd1 = V3(), _vd2 = V3(), _vd3 = V3(), _vd4 = V3(), _vd5 = V3(), _vd6 = V3(), _vd7 = V3(), _vd8 = V3();
  const vcl = (x, a, b) => Math.min(b == null ? 1 : b, Math.max(a == null ? 0 : a, x));
  const vramp = (t, a, b) => vcl((t - a) / (b - a));
  const vease = (x) => { x = vcl(x); return x * x * (3 - 2 * x); };
  const vwin = (t, a, b, c, d) => Math.min(vramp(t, a, b), 1 - vramp(t, c, d));       // fades in over a..b and out over c..d
  const vgyro = (q, ax, ang) => q.clone().multiply(Qt().setFromAxisAngle(ax, ang));
  const V_SKEW = V3(0.6, 0.8, 0).normalize();
  const camRight = (out) => out.set(1, 0, 0).applyQuaternion(camNow().quaternion), camFwd = (out) => out.set(0, 0, -1).applyQuaternion(camNow().quaternion);
