// ow-terrain.js: the land drawn as Mud Lab's open world draws its own: squares of 32 m round the camera, each made at the detail its
// distance needs (every 0.5 m close by, then 1, 2 and 4 m), made in a background worker from the same rules (land.js) so the page never
// waits for them, and swapped for a finer or coarser one as the camera moves. A skirt hangs from each square's edge to hide the seams.
// Past the map, one wide coarse ring carries the land and the sea on to the horizon.
(function (OW) {
  'use strict';
  const SIZE = 32, X0 = -384, Z0 = -256, NX = 24, NZ = 16;
  const LEVELS = [{ n: 64, d: 40 }, { n: 32, d: 100 }, { n: 16, d: 220 }, { n: 8, d: 1e9 }];
  // the moor's ground near her: Chris's painting (heather or turf) in its own colour, drawn a part of the way (uOwnK) toward the painted
  // map's colour there, so the map's broad changes still show; with distance it gives way to the map altogether. The pictures are painted
  // for night on the moor: toward the fair they warm by the same gain the map does (uGain over its moor value).
  const GROUND_GLSL = `uniform vec3 uGain; uniform vec3 mH, mG; uniform float uOwnK;
vec3 ground(vec3 macro, vec3 tex, vec3 tm, float near) {
  vec3 own = tm * uGain / vec3(0.62, 0.66, 0.56); float k = mix(uOwnK, 1.0, 1.0 - near);
  return pow(own, vec3(1.0 - k)) * pow(max(macro, vec3(1e-4)), vec3(k)) * mix(vec3(1.0), tex / tm, near);
}
`;
  OW.makeTerrain = function (scene, land, srcText) {
    const U = OW.U, I = window.OW_DATA.img;
    const T = { macro: OW.tex(I.macro), heather: OW.tex(I.heather, { repeat: true }), grass: OW.tex(I.grass, { repeat: true }), earth: OW.tex(I.earth, { repeat: true }), fair: OW.tex(I.fair, { repeat: true }), rock: OW.tex(I.rock, { repeat: true }),
      marsh: OW.tex(I.marsh || I.grass, { repeat: true }), field: OW.tex(I.field || I.grass, { repeat: true }) };
    T.macro.wrapS = T.macro.wrapT = THREE.ClampToEdgeWrapping;
    const mat = new THREE.ShaderMaterial({
      uniforms: Object.assign({ tMacro: { value: T.macro }, tH: { value: T.heather }, tG: { value: T.grass }, tE: { value: T.earth }, tF: { value: T.fair }, tR: { value: T.rock }, tM: { value: T.marsh }, tL: { value: T.field },
        mM: { value: new THREE.Vector3(0.022, 0.018, 0.019) }, mL: { value: new THREE.Vector3(0.118, 0.072, 0.022) },
        mH: { value: new THREE.Vector3(0.043, 0.025, 0.034) }, mG: { value: new THREE.Vector3(0.048, 0.040, 0.025) }, uOwnK: { value: 0.45 }, uTrackK: { value: 1.55 }, uFairK: { value: 1.05 }, uRockK: { value: 0.95 }, uBox: { value: new THREE.Vector4(-384, -256, 768, 512) }, uDetail: { value: 1 }, uGain: { value: new THREE.Vector3(1, 1, 1) }, uEarthK: { value: 1 } }, U),
      vertexShader: `attribute vec4 aW; attribute vec4 aW2; varying vec3 vP; varying vec3 vN; varying vec4 vW; varying vec2 vW2;
        void main() { vP = position; vN = normal; vW = aW; vW2 = aW2.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: OW.GLSL + GROUND_GLSL + `uniform sampler2D tMacro, tH, tG, tE, tF, tR, tM, tL; uniform vec3 mM, mL; uniform vec4 uBox; uniform float uDetail; uniform float uEarthK, uTrackK, uFairK, uRockK; varying vec3 vP; varying vec3 vN; varying vec4 vW; varying vec2 vW2;
        // each picture sampled twice, the second turned, a little larger and shifted, blended by a slow noise, so it does not repeat in rows
        vec3 two(sampler2D t, vec2 p, float sc) { vec3 a = texture2D(t, p / sc).rgb; vec3 b = texture2D(t, mat2(0.8, -0.6, 0.6, 0.8) * p / (sc * 1.19) + 0.37).rgb; return mix(a, b, smoothstep(0.25, 0.75, owNoise(p / (sc * 2.3) + 7.1))); }
        void main() {
          vec3 n = normalize(vN); float dist = length(vP - uCamPos);
          vec2 m = (vP.xz - uBox.xy) / uBox.zw; vec2 mc = clamp(m, vec2(0.001), vec2(0.999));
          // the painted map, softened near her (its brush strokes are metres wide); it gives the broad colour, and all of it far off
          float near0 = 1.0 - smoothstep(25.0, 120.0, dist);
          vec3 macro = s2l(texture2D(tMacro, vec2(mc.x, 1.0 - mc.y), 2.6 * near0).rgb);
          float off = length(max(abs(m - 0.5) - 0.5, 0.0)) * 8.0; macro = mix(macro, s2l(vec3(0.33, 0.30, 0.30)), smoothstep(0.0, 1.0, off));    // past the map: a plain colour, soon lost in the fog
          vec3 ms = pow(macro, vec3(1.0 / 2.2)); float purple = (ms.r + ms.b) * 0.5 - ms.g;
          macro *= uGain;                                                                                    // the painted map's evening colours, brought to the paintings' own (worked out from them, prep notes)
          float near = (1.0 - smoothstep(50.0, 170.0, dist)) * uDetail;
          // the moor: Chris's heather or turf, where the map paints each, in their own colours near her (ground() in GROUND_GLSL)
          float hk = smoothstep(-0.01, 0.07, purple);
          vec3 th = s2l(two(tH, vP.xz, 3.0)), tg = s2l(two(tG, vP.xz, 4.0));
          vec3 col = ground(macro, mix(tg, th, hk), mix(mG, mH, hk), near);
          // Chris's marsh on the marsh and the river's banks, his farm field in the fields of the settled country (the second weights, land.js)
          if (vW2.x + vW2.y > 0.004) {
            if (vW2.y > 0.002) col = mix(col, ground(macro, s2l(two(tL, vP.xz, 5.0)), mL, near), vW2.y);
            if (vW2.x > 0.002) col = mix(col, ground(macro, s2l(two(tM, vP.xz, 4.0)), mM, near), vW2.x);
          }
          // the fair's trampled ground round the tents, and the worn earth of the roads, in their own colours
          vec3 e = s2l(two(tE, vP.xz, 3.0)), fe = s2l(two(tF, vP.xz, 4.0));
          col = mix(col, fe * uFairK, vW.y * 0.8 * (1.0 - vW.x));
          col = mix(col, mix(e * uTrackK * uEarthK, macro * 1.25, 1.0 - near), vW.x);
          // rock where it is steep, on the cliffs, the crag and the tor: Chris's rock face, laid on from three sides, about 3 m across
          vec3 an = abs(n); an = an * an; an = an / (an.x + an.y + an.z);
          vec3 rk = s2l(texture2D(tR, vP.zy / 3.0).rgb) * an.x + s2l(texture2D(tR, vP.xz / 3.0 + 0.5).rgb) * an.y + s2l(texture2D(tR, vP.xy / 3.0).rgb) * an.z;
          float steep = smoothstep(0.30, 0.55, 1.0 - n.y), rock = max(vW.z, steep);
          col = mix(col, rk * uRockK * uEarthK, rock);
          col *= 1.0 - 0.32 * vW.w * (1.0 - rock) * (1.0 - 0.6 * vW2.x);                                                        // wet ground by the water, darker
          col *= owLight(n, vP, 0.25);
          col = owFog(col, vP);
          ` + OW.out + `
        }` });
    Promise.all(Object.values(T).map((t) => t.ready)).then(() => { mat.uniforms.mH.value = OW.meanOf(T.heather.image); mat.uniforms.mG.value = OW.meanOf(T.grass.image); mat.uniforms.mM.value = OW.meanOf(T.marsh.image); mat.uniforms.mL.value = OW.meanOf(T.field.image); });

    // ---- the squares ----
    const idx = {}; for (const L of LEVELS) idx[L.n] = new THREE.BufferAttribute(new Uint16Array(land.indices(L.n)), 1);
    const chunks = []; for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) chunks.push({ i, j, x: X0 + i * SIZE, z: Z0 + j * SIZE, cx: X0 + (i + 0.5) * SIZE, cz: Z0 + (j + 0.5) * SIZE, level: -1, want: -1, busy: false, mesh: null });
    const group = new THREE.Group(); scene.add(group);
    let worker = null, inflight = 0, made = 0; const queue = [];
    function take(c, lv, data) {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(data.pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(data.nrm, 4, true));
      g.setAttribute('aW', new THREE.BufferAttribute(data.w, 4, true)); g.setAttribute('aW2', new THREE.BufferAttribute(data.w2, 4, true)); g.setIndex(idx[LEVELS[lv].n]);
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(c.cx, data.cy, c.cz), data.r);
      if (c.mesh) { c.mesh.geometry.dispose(); c.mesh.geometry = g; } else { c.mesh = new THREE.Mesh(g, mat); c.mesh.matrixAutoUpdate = false; group.add(c.mesh); }
      c.level = lv; c.busy = false; made++;
    }
    const bounds = (pos) => { let lo = 1e9, hi = -1e9; for (let k = 1; k < pos.length; k += 3) { const y = pos[k]; if (y < lo) lo = y; if (y > hi) hi = y; } return [lo, hi]; };
    function done(c, lv, data) { const b = bounds(data.pos); data.cy = (b[0] + b[1]) / 2; data.r = Math.hypot(SIZE * 0.71, (b[1] - b[0]) / 2) + 1; take(c, lv, data); }
    try {
      if (/[?&]noworker/.test(location.search)) throw new Error('asked to work without the worker');
      const blob = new Blob([srcText + `
        let L = null;
        onmessage = (e) => { const m = e.data; if (m.init) { L = makeLand(m.F, m.R); return; }
          const d = L.chunk(m.x, m.z, ${SIZE}, m.n); postMessage({ id: m.id, lv: m.lv, pos: d.pos, nrm: d.nrm, w: d.w, w2: d.w2 }, [d.pos.buffer, d.nrm.buffer, d.w.buffer, d.w2.buffer]); };`], { type: 'text/javascript' });
      worker = new Worker(URL.createObjectURL(blob));
      worker.postMessage({ init: true, F: window.OW_DATA.F, R: window.OW_DATA.R });
      worker.onmessage = (e) => { const m = e.data, c = chunks[m.id]; inflight--; done(c, m.lv, m); };
      worker.onerror = () => { worker = null; inflight = 0; for (const c of chunks) c.busy = false; };
    } catch (e) { worker = null; }
    function ask(c, lv) {
      c.busy = true;
      if (worker) { inflight++; worker.postMessage({ id: chunks.indexOf(c), lv, x: c.x, z: c.z, n: LEVELS[lv].n }); }
      else queue.push([c, lv]);
    }
    const levelFor = (c, cam, cur) => { const d = Math.hypot(c.cx - cam.x, c.cz - cam.z); for (let k = 0; k < LEVELS.length; k++) { const lim = LEVELS[k].d * (cur >= 0 && cur <= k ? 1.12 : 0.92); if (d < lim) return k; } return LEVELS.length - 1; };

    // ---- past the map: a wide ring, coarse, made here once ----
    (function far() {
      const R0 = 0, R1 = 2600, NA = 96, NR = 40, pos = [], nrm = [], w = [], w2 = [], ix = [];
      for (let r = 0; r <= NR; r++) { const rr = R0 + (R1 - R0) * Math.pow(r / NR, 1.6); for (let a = 0; a < NA; a++) { const an = a / NA * Math.PI * 2, x = Math.cos(an) * rr, z = Math.sin(an) * rr * 0.9;
        const inMap = Math.abs(x) < 380 && Math.abs(z) < 252, g = land.at(x, z), h = inMap ? Math.min(g.h, 0.9) - 4 : g.h;           // under the map the squares are drawn; this ring sits well below them
        pos.push(x, h, z); const e = 6, hx = land.height(x + e, z) - land.height(x - e, z), hz = land.height(x, z + e) - land.height(x, z - e); const l = Math.hypot(hx, 2 * e, hz); nrm.push(-hx / l, 2 * e / l, -hz / l, 0);
        w.push(0, 0, g.rock, Math.max(g.wet, g.sea)); w2.push(g.marsh, g.field, 0, 0); } }
      for (let r = 0; r < NR; r++) for (let a = 0; a < NA; a++) { const p = r * NA + a, q = r * NA + (a + 1) % NA; ix.push(p, q, p + NA, q, q + NA, p + NA); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 4)); g.setAttribute('aW', new THREE.Float32BufferAttribute(w, 4)); g.setAttribute('aW2', new THREE.Float32BufferAttribute(w2, 4)); g.setIndex(ix);
      const m = new THREE.Mesh(g, mat); m.frustumCulled = false; scene.add(m);
    })();

    // the heather clumps near her are drawn with the land's own heather: the same patch, the same map colour, a little lighter on top
    const tuftMat = new THREE.ShaderMaterial({ uniforms: mat.uniforms,
      vertexShader: `varying vec3 vP; varying vec3 vN; varying float vUp;
        void main() { mat4 m = modelMatrix; 
          #ifdef USE_INSTANCING
            m = m * instanceMatrix;
          #endif
          vec4 w = m * vec4(position, 1.0); vP = w.xyz; vN = normalize(mat3(m) * normal); vUp = position.y; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: OW.GLSL + GROUND_GLSL + `uniform sampler2D tMacro, tH; uniform vec4 uBox; varying vec3 vP; varying vec3 vN; varying float vUp;
        void main() {
          vec2 m = clamp((vP.xz - uBox.xy) / uBox.zw, vec2(0.001), vec2(0.999)); vec3 macro = s2l(texture2D(tMacro, vec2(m.x, 1.0 - m.y), 2.6).rgb) * uGain;
          vec3 col = ground(macro, s2l(texture2D(tH, vP.xz / 1.6 + vP.y * 0.4).rgb), mH, 1.0) * (0.92 + 0.4 * vUp);
          vec3 n = normalize(vN); col *= owLight(n, vP, 0.5); col = owFog(col, vP);
          ` + OW.out + `
        }` });
    return {
      material: mat, tuftMat, group, LEVELS,
      // keep each square at the detail its distance needs; the nearest are asked for first
      update(cam, budgetMs) {
        const want = [];
        for (const c of chunks) { const lv = levelFor(c, cam, c.level); if (lv !== c.level && !c.busy) want.push([Math.hypot(c.cx - cam.x, c.cz - cam.z) - (c.level < 0 ? 1e4 : 0), c, lv]); }
        want.sort((a, b) => a[0] - b[0]);
        for (const [, c, lv] of want) { if (worker && inflight >= 6) break; if (!worker && queue.length > 2) break; ask(c, lv); }
        if (!worker) { const t0 = performance.now(); while (queue.length && performance.now() - t0 < (budgetMs || 8)) { const [c, lv] = queue.shift(); const d = land.chunk(c.x, c.z, SIZE, LEVELS[lv].n); done(c, lv, d); } }
      },
      // how much of the land round a point is drawn at its proper detail yet (for the loading screen)
      ready(cam, r) { let need = 0, have = 0; for (const c of chunks) { if (Math.hypot(c.cx - cam.x, c.cz - cam.z) > r) continue; need++; if (c.level >= 0) have++; } return need ? have / need : 1; },
      get usingWorker() { return !!worker; }, get made() { return made; },
      all() { return chunks.every((c) => c.level >= 0); },
    };
  };

  // ---- water: the sea, the river and the marsh pools at one height, and the moor's small pools each at their own ----
  OW.makeWater = function (scene, land) {
    const U = OW.U;
    // how deep the water is, every 2 m over the map (0 at the shore), worked out once, for the shallows and the white water at the shore
    const W = 400, H = 272, X0w = -400, Z0w = -272, E = 2, depth = new Uint8Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const d = land.WL - land.height(X0w + i * E, Z0w + j * E); depth[j * W + i] = Math.max(0, Math.min(255, Math.round((d + 1) / 9 * 255))); }
    const dt = new THREE.DataTexture(depth, W, H, THREE.LuminanceFormat, THREE.UnsignedByteType); dt.magFilter = dt.minFilter = THREE.LinearFilter; dt.needsUpdate = true;
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
      uniforms: Object.assign({ tDepth: { value: dt }, uDBox: { value: new THREE.Vector4(X0w, Z0w, W * E, H * E) }, uLevel: { value: land.WL } }, U),
      vertexShader: 'varying vec3 vP; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: OW.GLSL + `uniform sampler2D tDepth; uniform vec4 uDBox; uniform float uLevel; varying vec3 vP;
        void main() {
          vec2 m = (vP.xz - uDBox.xy) / uDBox.zw; float dep = 6.0;
          if (m.x > 0.0 && m.x < 1.0 && m.y > 0.0 && m.y < 1.0 && uLevel < 1.0) dep = texture2D(tDepth, m).r * 9.0 - 1.0;
          vec3 v = normalize(uCamPos - vP);
          // small moving ripples
          vec2 q = vP.xz * 0.9; float t = uTime * 0.35;
          vec3 nn = normalize(vec3((owNoise(q + t) - owNoise(q * 1.7 - t)) * 0.18, 1.0, (owNoise(q.yx * 1.3 + t * 0.8) - owNoise(q * 0.6 + 3.0 - t)) * 0.18));
          float fr = pow(1.0 - max(dot(v, nn), 0.0), 4.0);
          vec3 deep = s2l(vec3(0.05, 0.07, 0.15)), shallow = s2l(vec3(0.12, 0.16, 0.24));
          vec3 col = mix(shallow, deep, smoothstep(0.2, 3.5, dep));
          vec3 sky = mix(owFogCol(vP + vec3(0.0, 0.0, 0.0)), s2l(vec3(0.20, 0.19, 0.38)), 0.5);
          col = mix(col, sky, 0.15 + 0.6 * fr);
          vec3 r = reflect(-v, nn); float glint = pow(max(dot(r, uMoonDir), 0.0), 220.0) * 3.0 + pow(max(dot(r, uMoonDir), 0.0), 18.0) * 0.12;
          col += uMoonCol * glint;
          for (int i = 0; i < 8; i++) { vec3 d = uLampP[i] - vP; float r2 = dot(d, d); col += uLampC[i] * pow(max(dot(r, d * inversesqrt(r2)), 0.0), 60.0) * 2.0 / (1.0 + r2 * 0.05); }
          float foam = (1.0 - smoothstep(0.02, 0.35, dep)) * (0.55 + 0.45 * owNoise(vP.xz * 2.0 + uTime * 0.6));
          col = mix(col, s2l(vec3(0.62, 0.62, 0.72)), foam * 0.45 * step(uLevel, 1.0));
          float a = mix(0.80, 0.97, smoothstep(0.0, 1.2, dep)) * smoothstep(-0.05, 0.06, dep);
          col = owFog(col, vP);
          gl_FragColor = linearToOutputTexel(vec4(col, 0.0)); gl_FragColor.a = a;
        }` });
    mat.blendSrcAlpha = THREE.ZeroFactor; mat.blendDstAlpha = THREE.OneFactor; mat.blending = THREE.CustomBlending; mat.blendSrc = THREE.SrcAlphaFactor; mat.blendDst = THREE.OneMinusSrcAlphaFactor;
    // gl_FragColor.a is the water's see-through-ness here; the custom blending keeps the picture's own see-through channel as it was
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(7000, 7000, 1, 1), mat); sea.rotation.x = -Math.PI / 2; sea.position.y = land.WL; sea.renderOrder = 2; scene.add(sea);
    // the moor's own pools, each filled to just under its rim
    const pools = [];
    for (const p of land.POOLS) {
      let lo = 1e9, rim = 1e9; for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2; rim = Math.min(rim, land.height(p.x + Math.cos(an) * p.rx * 1.25, p.z + Math.sin(an) * p.rz * 1.25)); }
      lo = land.height(p.x, p.z); const lvl = Math.min(rim - 0.12, lo + 0.75); if (lvl <= lo + 0.05 || lvl < land.WL + 0.2) continue;
      const m2 = mat.clone(); m2.uniforms = Object.assign({}, mat.uniforms, { uLevel: { value: lvl } });
      const w = new THREE.Mesh(new THREE.CircleGeometry(1, 28), m2); w.rotation.x = -Math.PI / 2; w.scale.set(p.rx * 1.3, p.rz * 1.3, 1); w.position.set(p.x, lvl, p.z); w.renderOrder = 2; scene.add(w); pools.push({ x: p.x, z: p.z, rx: p.rx, rz: p.rz, level: lvl });
    }
    return { sea, pools, mat };
  };
})(window.OW);
