// stage.js: the little theatre the Jester stands in: renderer, lights, floor, and an orbiting camera.
function makeStage(canvas, o) {
  'use strict';
  o = o || {};
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: !!o.preserve || /[?&]shot/.test(location.search) });
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), BG = new THREE.Color('#383043');
  scene.background = BG;
  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 60);
  // a soft studio for reflections: plum dark below, lilac above, two warm panels and one violet
  (function env() {
    const es = new THREE.Scene(), g = new THREE.SphereGeometry(10, 32, 16), col = [];
    const top = new THREE.Color(0.26, 0.23, 0.38), mid = new THREE.Color(0.10, 0.08, 0.13), bot = new THREE.Color(0.03, 0.022, 0.035), c = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 10; if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.7)); else c.copy(mid).lerp(bot, Math.pow(-y, 0.5)); col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    es.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const panel = (x, y, z, w, h, r, gg, b) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(r, gg, b), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 1, 0); es.add(m); };
    panel(4, 6, 5, 4, 3, 5.0, 4.2, 3.4); panel(-6, 3, 2, 2, 4, 0.8, 0.9, 1.6); panel(-2, 5, -7, 5, 2.5, 2.4, 1.1, 3.6); panel(6, 1.5, -3, 1.5, 3, 1.4, 0.7, 1.2);
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(es, 0.03).texture; pm.dispose();
  })();
  const hemi = new THREE.HemisphereLight(0xc8bcc4, 0x4a3438, 0.40); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffeedd, 0.72); key.position.set(1.7, 3.6, 3.2); key.castShadow = true;
  key.shadow.mapSize.set(o.shadow || 2048, o.shadow || 2048); const sc = key.shadow.camera; sc.left = -1.7; sc.right = 1.7; sc.top = 2.3; sc.bottom = -0.5; sc.near = 0.5; sc.far = 12;
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.018; key.shadow.radius = 3.5; key.target.position.set(0, 0.9, 0); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xd8b8ff, 0.30); rim.position.set(-1.8, 2.6, -3.2); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xffc8d8, 0.16); const backKey = new THREE.DirectionalLight(0xffeedd, 0.42); backKey.position.set(-1.2, 3.0, -3.4); scene.add(backKey); rim2.position.set(2.6, 1.6, -2.6); scene.add(rim2);
  const fill = new THREE.DirectionalLight(0xc8ccff, 0.26); fill.position.set(-2.6, 1.2, 2.4); scene.add(fill);
  // floor: a worn stage disc that takes her shadow and fades into the dark
  const fc = document.createElement('canvas'); fc.width = fc.height = 512; const fg = fc.getContext('2d');
  const gr = fg.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, '#463c54'); gr.addColorStop(0.5, '#3c3248'); gr.addColorStop(1, '#383043');
  fg.fillStyle = gr; fg.fillRect(0, 0, 512, 512);
  fg.strokeStyle = 'rgba(214,168,78,0.20)'; fg.lineWidth = 2; for (const r of [70, 74, 150]) { fg.beginPath(); fg.arc(256, 256, r, 0, 7); fg.stroke(); }
  fg.strokeStyle = 'rgba(214,168,78,0.13)'; fg.lineWidth = 1.5; fg.setLineDash([7, 9]); fg.beginPath(); fg.arc(256, 256, 216, 0, 7); fg.stroke(); fg.setLineDash([]);       // the edge she can walk to
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r0 = k % 2 ? 150 : 74, r1 = 216; fg.strokeStyle = 'rgba(214,168,78,' + (k % 2 ? 0.07 : 0.11) + ')'; fg.beginPath(); fg.moveTo(256 + r0 * Math.cos(a), 256 + r0 * Math.sin(a)); fg.lineTo(256 + r1 * Math.cos(a), 256 + r1 * Math.sin(a)); fg.stroke(); }
  fg.fillStyle = 'rgba(214,168,78,0.22)'; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; fg.save(); fg.translate(256 + 150 * Math.cos(a), 256 + 150 * Math.sin(a)); fg.rotate(a + Math.PI / 4); fg.fillRect(-3.5, -3.5, 7, 7); fg.restore(); }
  const ft = new THREE.CanvasTexture(fc); ft.encoding = THREE.sRGBEncoding;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3.4, 64), new THREE.MeshBasicMaterial({ map: ft, toneMapped: false }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const shadowCatcher = new THREE.Mesh(new THREE.CircleGeometry(3.4, 32), new THREE.ShadowMaterial({ opacity: 0.42, color: 0x120a18 }));
  shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = 0.002; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);
  // lanterns round the edge, lit when she is free to walk about
  const lanterns = new THREE.Group(); lanterns.visible = false; scene.add(lanterns);
  { const post = new THREE.MeshBasicMaterial({ color: 0x06040a, toneMapped: false }), glow = new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false }), halo = new THREE.MeshBasicMaterial({ color: 0xc88cff, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false });
    for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2, x = 3.12 * Math.sin(a), z = 3.12 * Math.cos(a);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.022, 1.0, 8), post); p.position.set(x, 0.5, z); const g = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), glow); g.position.set(x, 1.06, z); const h = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), halo); h.position.copy(g.position); lanterns.add(p, g, h); } }
  // orbit: azimuth 0 looks at her face (the camera sits on +Z)
  const orbit = { az: 0, el: 0.06, dist: 6.4, target: new THREE.Vector3(0, 0.93, 0), fov: 22 };
  function placeCamera() {
    const ce = Math.cos(orbit.el);
    camera.position.set(orbit.target.x + orbit.dist * Math.sin(orbit.az) * ce, orbit.target.y + orbit.dist * Math.sin(orbit.el), orbit.target.z + orbit.dist * Math.cos(orbit.az) * ce);
    camera.fov = orbit.fov; camera.lookAt(orbit.target); camera.updateProjectionMatrix();
  }
  function resize(w, h, pr) { renderer.setPixelRatio(pr || 1); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  // The Flipbook look: draw her at the sprites' pixel size (4.75 mm a pixel), snap to her palette, ink the outline.
  const PALETTE = (o.palette || window.JESTER_PALETTE || []).slice(0, 64), NP = Math.max(1, PALETTE.length);
  const palV = []; for (let i = 0; i < 64; i++) { const p = PALETTE[i % NP] || [0, 0, 0]; palV.push(new THREE.Vector3(p[0] / 255, p[1] / 255, p[2] / 255)); }
  const rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat }); rt.texture.encoding = THREE.sRGBEncoding;
  const postMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: { tD: { value: rt.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uPal: { value: palV }, uBg: { value: new THREE.Vector3(BG.r, BG.g, BG.b) }, uSnap: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tD; uniform vec2 uRes; uniform vec3 uPal[64]; uniform vec3 uBg; uniform float uSnap; varying vec2 vUv;\n' +
      'void main(){ vec2 px = 1.0 / uRes; vec2 uv = (floor(vUv * uRes) + 0.5) * px; vec4 c = texture2D(tD, uv);\n' +
      ' float n = max(max(texture2D(tD, uv + vec2(px.x, 0.0)).a, texture2D(tD, uv - vec2(px.x, 0.0)).a), max(texture2D(tD, uv + vec2(0.0, px.y)).a, texture2D(tD, uv - vec2(0.0, px.y)).a));\n' +
      ' float m = min(min(texture2D(tD, uv + vec2(px.x, 0.0)).a, texture2D(tD, uv - vec2(px.x, 0.0)).a), min(texture2D(tD, uv + vec2(0.0, px.y)).a, texture2D(tD, uv - vec2(0.0, px.y)).a));\n' +
      ' if (c.a < 0.5) { gl_FragColor = vec4(n > 0.6 ? vec3(0.075, 0.05, 0.065) : uBg * (1.0 - c.a) + c.rgb, 1.0); return; }\n' +
      ' vec3 col = c.rgb + uBg * (1.0 - c.a); float l = dot(col, vec3(0.30, 0.59, 0.11)); col = clamp(l + (col - l) * 1.4, 0.0, 1.0); col = clamp((col - 0.42) * 1.14 + 0.42, 0.0, 1.0); if (m < 0.4) col *= 0.45;\n' +                       // the rim of the figure, inked
      ' float best = 1e9; vec3 pick = col; for (int i = 0; i < ' + NP + '; i++) { vec3 d = col - uPal[i]; float e = dot(d * d, vec3(0.30, 0.59, 0.11)); if (e < best) { best = e; pick = uPal[i]; } }\n' +
      ' gl_FragColor = vec4(mix(col, pick, uSnap), 1.0); }' });
  const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat); postQuad.frustumCulled = false; postScene.add(postQuad);
  const api = { look: 'smooth', mmPerPixel: 4.75, dim: 0 }, _sz = new THREE.Vector2();
  const LIT = [[hemi, hemi.intensity, 0.7], [key, key.intensity, 0.6], [fill, fill.intensity, 0.7], [backKey, backKey.intensity, 0.6]];
  function render() {
    placeCamera();
    for (const [l, base, k] of LIT) l.intensity = base * (1 - k * api.dim);
    if (api.look !== 'flipbook') { floor.visible = !api.noFloor; scene.background = api.bg || BG; renderer.render(scene, camera); return; }
    renderer.getDrawingBufferSize(_sz);
    const vis = 2 * orbit.dist * Math.tan(orbit.fov * Math.PI / 360);
    const want = vis / (api.mmPerPixel / 1000), div = Math.max(1, Math.round(_sz.y / want)), h = Math.max(48, Math.round(_sz.y / div)), w = Math.max(16, Math.round(_sz.x / div));
    if (rt.width !== w || rt.height !== h) { rt.setSize(w, h); postMat.uniforms.uRes.value.set(w, h); }
    floor.visible = false; scene.background = null; const oc = renderer.getClearAlpha(); renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null);
    renderer.setClearColor(0x000000, oc); renderer.render(postScene, postCam);
  }
  const follow = (x, z) => { key.position.set(x + 1.7, 3.6, z + 3.2); key.target.position.set(x, 0.9, z); key.target.updateMatrixWorld(); };      // the light and its shadow go where she goes
  return Object.assign(api, { renderer, scene, camera, orbit, key, rim, rim2, hemi, fill, floor, shadowCatcher, lanterns, follow, resize, render, placeCamera, BG });
}
