// stage.js: how a painted scene and the 3D cast are drawn together. three.js r128, global THREE.
// The painting is one flat picture drawn first. Everyone who moves is in one scene (cast) with one light rig, drawn over it
// through a hidden camera fitted to the painting. The camera never moves: the screen shows a window of the painting's frame
// (a pan or a closer shot is a different window), and the 3D is drawn through the same window with setViewOffset.
// The rig and the studio reflections are copied from the witches' own stage (models/jester-3d/viewer/stage.js on branch
// claude/jester-3d-model), numbers unchanged, so a witch looks here as she does in her theatre.
function makeMFStage(canvas, o) {
  'use strict';
  o = o || {};
  const RAD = Math.PI / 180;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: !!o.preserve });
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.autoClear = false;
  const cast = new THREE.Scene();
  // a soft studio for reflections (as on the witches' stage)
  (function env() {
    const es = new THREE.Scene(), g = new THREE.SphereGeometry(10, 32, 16), col = [];
    const top = new THREE.Color(0.26, 0.23, 0.38), mid = new THREE.Color(0.10, 0.08, 0.13), bot = new THREE.Color(0.03, 0.022, 0.035), c = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 10; if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.7)); else c.copy(mid).lerp(bot, Math.pow(-y, 0.5)); col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    es.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const panel = (x, y, z, w, h, r, gg, b) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(r, gg, b), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 1, 0); es.add(m); };
    panel(4, 6, 5, 4, 3, 5.0, 4.2, 3.4); panel(-6, 3, 2, 2, 4, 0.8, 0.9, 1.6); panel(-2, 5, -7, 5, 2.5, 2.4, 1.1, 3.6); panel(6, 1.5, -3, 1.5, 3, 1.4, 0.7, 1.2);
    const pm = new THREE.PMREMGenerator(renderer); cast.environment = pm.fromScene(es, 0.03).texture; pm.dispose();
  })();
  // the witches' rig
  const hemi = new THREE.HemisphereLight(0xc8bcc4, 0x4a3438, 0.40); cast.add(hemi);
  const key = new THREE.DirectionalLight(0xffeedd, 0.72); key.position.set(1.7, 3.6, 3.2); key.castShadow = true;
  key.shadow.mapSize.set(o.shadow || 2048, o.shadow || 2048); const sc = key.shadow.camera; sc.left = -1.9; sc.right = 1.9; sc.top = 2.4; sc.bottom = -0.6; sc.near = 0.5; sc.far = 14;
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.018; key.shadow.radius = 3.5; key.target.position.set(0, 0.9, 0); cast.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xd8b8ff, 0.30); rim.position.set(-1.8, 2.6, -3.2); cast.add(rim);
  const rim2 = new THREE.DirectionalLight(0xffc8d8, 0.16); rim2.position.set(2.6, 1.6, -2.6); cast.add(rim2);
  const backKey = new THREE.DirectionalLight(0xffeedd, 0.42); backKey.position.set(-1.2, 3.0, -3.4); cast.add(backKey);
  const fill = new THREE.DirectionalLight(0xc8ccff, 0.26); fill.position.set(-2.6, 1.2, 2.4); cast.add(fill);
  const LIT = [[hemi, 0.40, 0.7], [key, 0.72, 0.6], [fill, 0.26, 0.7], [backKey, 0.42, 0.6]];
  // four lights for nearby things (painted lamps, a foe's glow, a spell), made once and never added or removed
  const near = []; for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xffb768, 0, 7, 2); l.position.set(0, -50, 0); cast.add(l); near.push(l); }
  // her shadow falls on a plane nobody sees, laid on the painted ground, with a soft dark patch at her feet
  const catcher = new THREE.Mesh(new THREE.CircleGeometry(4.2, 40), new THREE.ShadowMaterial({ opacity: 0.42, color: 0x120a18 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = 0.004; catcher.receiveShadow = true; catcher.renderOrder = 1; cast.add(catcher);
  const pc = document.createElement('canvas'); pc.width = pc.height = 128; { const g = pc.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(14,8,18,0.55)'); gr.addColorStop(0.55, 'rgba(14,8,18,0.22)'); gr.addColorStop(1, 'rgba(14,8,18,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  const patchTex = new THREE.CanvasTexture(pc);
  const patches = [];
  function footPatch(r) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false, toneMapped: false })); patches.push(m.material); m.rotation.x = -Math.PI / 2; m.scale.set(r * 2, r * 1.5, 1); m.position.y = 0.006; m.renderOrder = 1; cast.add(m); return m; }

  // the painting: one flat picture behind everything
  const bgScene = new THREE.Scene(), bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, depthWrite: false, toneMapped: false });
  const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat); bgQuad.frustumCulled = false; bgScene.add(bgQuad);
  const THEATRE = new THREE.Color('#383043');
  // ---- the Flipbook look (the same technique as on the witches' own stages, models/jester-3d/viewer/stage.js) ----
  // The cast is drawn small into a picture of its own, every solid pixel takes the nearest of the flipbook's colours, and the figure
  // gets an inked outline. Then it is laid over the painting. Four things are this stage's own:
  //  - the pixel grid is a number of rows down the screen (flip.rows), any number: a slider. On the witches' stages a pixel is 4.75 mm of
  //    her, which at this game's distances is smaller than a pixel of the screen, so nothing would show;
  //  - the small picture is enlarged with hard pixels whose edges are one screen pixel soft, so any size of pixel is clean, not only whole ones;
  //  - flip.snap goes from 1 (every pixel one of the flipbook's colours) to 0 (the smooth colours, still pixelled and inked);
  //  - the painting is put on the same grid, in its own colours (worked out once from the painting), in the witches' colours, or left smooth;
  //  - the window of the painting moves a whole pixel of the grid at a time, so the painting's pixels do not swim as she walks.
  const WITCH_PAL = (o.palette || window.JESTER_PALETTE || []).slice(0, 64), NPW = Math.max(1, WITCH_PAL.length);
  const toV = (list) => { const v = [], n = Math.max(1, list.length); for (let i = 0; i < 64; i++) { const p = list[i % n] || [0, 0, 0]; v.push(new THREE.Vector3(p[0] / 255, p[1] / 255, p[2] / 255)); } return v; };
  const rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat }); rt.texture.encoding = THREE.sRGBEncoding;
  const postMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    uniforms: { tD: { value: rt.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uPal: { value: toV(WITCH_PAL) }, uBg: { value: new THREE.Vector3(0.10, 0.075, 0.13) }, uSnap: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tD; uniform vec2 uRes; uniform vec3 uPal[64]; uniform vec3 uBg; uniform float uSnap; varying vec2 vUv;\n' +
      'void main(){ vec2 px = 1.0 / uRes; vec2 uv = (floor(vUv * uRes) + 0.5) * px; vec4 c = texture2D(tD, uv);\n' +
      ' float n = max(max(texture2D(tD, uv + vec2(px.x, 0.0)).a, texture2D(tD, uv - vec2(px.x, 0.0)).a), max(texture2D(tD, uv + vec2(0.0, px.y)).a, texture2D(tD, uv - vec2(0.0, px.y)).a));\n' +
      ' float m = min(min(texture2D(tD, uv + vec2(px.x, 0.0)).a, texture2D(tD, uv - vec2(px.x, 0.0)).a), min(texture2D(tD, uv + vec2(0.0, px.y)).a, texture2D(tD, uv - vec2(0.0, px.y)).a));\n' +
      ' if (c.a < 0.5) { if (n > 0.6) gl_FragColor = vec4(0.075, 0.05, 0.065, 1.0); else gl_FragColor = vec4(c.rgb, c.a); return; }\n' +                          // the inked outline; elsewhere only shadow, and what light the cast and its spells add
      ' vec3 col = c.rgb + uBg * (1.0 - c.a); float l = dot(col, vec3(0.30, 0.59, 0.11)); col = clamp(l + (col - l) * (1.0 + 0.4 * uSnap), 0.0, 1.0); col = clamp((col - 0.42) * (1.0 + 0.14 * uSnap) + 0.42, 0.0, 1.0); if (m < 0.4) col *= 0.45;\n' +                       // colours pushed toward painted pixels (less so as the snap is turned down); the rim of the figure, inked
      ' float best = 1e9; vec3 pick = col; for (int i = 0; i < ' + NPW + '; i++) { vec3 d = col - uPal[i]; float e = dot(d * d, vec3(0.30, 0.59, 0.11)); if (e < best) { best = e; pick = uPal[i]; } }\n' +
      ' gl_FragColor = vec4(mix(col, pick, uSnap), 1.0); }' });
  const postScene = new THREE.Scene(), postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat); postQuad.frustumCulled = false; postScene.add(postQuad);
  // the painting on the same grid: each pixel of the grid is the average of the painting under it, then takes the nearest colour of its list
  const paintMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: { tP: { value: null }, uRes: { value: new THREE.Vector2(4, 4) }, uWin: { value: new THREE.Vector4(0, 0, 1, 1) }, uPal: { value: toV([]) }, uN: { value: 1 }, uSnap: { value: 1 }, uDim: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tP; uniform vec2 uRes; uniform vec4 uWin; uniform vec3 uPal[64]; uniform float uN; uniform float uSnap; uniform float uDim; varying vec2 vUv;\n' +
      'void main(){ vec2 px = 1.0 / uRes; vec2 c0 = vUv; vec3 col = vec3(0.0);\n' +
      ' for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) { vec2 q = c0 + (vec2(float(i), float(j)) - 0.5) * 0.5 * px; col += texture2D(tP, uWin.xy + q * uWin.zw).rgb; }\n' +
      ' col *= 0.25; float best = 1e9; vec3 pick = col;\n' +
      ' for (int i = 0; i < 64; i++) { if (float(i) >= uN) break; vec3 d = col - uPal[i]; float e = dot(d, d); if (e < best) { best = e; pick = uPal[i]; } }\n' +
      ' gl_FragColor = vec4(mix(col, pick, uSnap) * uDim, 1.0); }' });      // darkening comes after the colours are chosen, so a spell dims the pixels without making them change colour
  // the finished small picture (painting and cast together, or the cast alone), and the pass that enlarges it onto the screen
  const rt2 = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: false });
  const upMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    uniforms: { tU: { value: rt2.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uScale: { value: new THREE.Vector2(1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tU; uniform vec2 uRes; uniform vec2 uScale; varying vec2 vUv;\n' +
      'void main(){ vec2 p = vUv * uRes; vec2 i = floor(p); vec2 x = (p - i) * uScale;\n' +                 // x: where this screen pixel sits inside its pixel of the grid, in screen pixels
      ' vec2 sh = clamp(x - (uScale - 0.5), 0.0, 0.5) - clamp(0.5 - x, 0.0, 0.5);\n' +                        // within half a screen pixel of an edge, lean toward the neighbour
      ' gl_FragColor = texture2D(tU, (i + 0.5 + sh) / uRes); }' });
  const upScene = new THREE.Scene(), upQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), upMat); upQuad.frustumCulled = false; upScene.add(upQuad);
  const paintScene = new THREE.Scene(), paintQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), paintMat); paintQuad.frustumCulled = false; paintScene.add(paintQuad);
  // A painting's own colours, worked out once when it loads: 64 of them. Each colour counts for far less than its share of the picture, so
  // small bright things (a lamp, a flag) keep a place. Counting plain pixels gives a washed-out list: the big dull areas take every slot.
  function ownColours(im) {
    const k = document.createElement('canvas'), W = 192, Hh = Math.max(1, Math.round(W * im.height / im.width)); k.width = W; k.height = Hh;
    const g = k.getContext('2d'); g.drawImage(im, 0, 0, W, Hh); const d = g.getImageData(0, 0, W, Hh).data, seen = new Map();
    for (let i = 0; i < d.length; i += 4) { const key = (d[i] >> 3) << 10 | (d[i + 1] >> 3) << 5 | (d[i + 2] >> 3); seen.set(key, (seen.get(key) || 0) + 1); }
    const pts = []; seen.forEach((n, key) => { const r = ((key >> 10) & 31) * 8 + 4, gr = ((key >> 5) & 31) * 8 + 4, b = (key & 31) * 8 + 4; pts.push([r, gr, b, Math.pow(n, 0.6) * (1 + (Math.max(r, gr, b) - Math.min(r, gr, b)) / 255)]); });      // strong colours count a little more
    let boxes = [pts];
    const span = (b) => { let best = 0, ax = 0, wsum = 0; for (let a = 0; a < 3; a++) { let lo = 255, hi = 0; for (const p of b) { if (p[a] < lo) lo = p[a]; if (p[a] > hi) hi = p[a]; } if (hi - lo > best) { best = hi - lo; ax = a; } } for (const p of b) wsum += p[3]; return [best * Math.sqrt(wsum), ax]; };
    while (boxes.length < 64) {
      let bi = -1, bs = 0, bax = 0; boxes.forEach((b, i) => { if (b.length < 2) return; const [s, ax] = span(b); if (s > bs) { bs = s; bi = i; bax = ax; } });
      if (bi < 0) break;
      const b = boxes[bi].sort((p, q) => p[bax] - q[bax]); let half = 0, tot = 0, cut = 1; for (const p of b) tot += p[3]; for (let i = 0; i < b.length - 1; i++) { half += b[i][3]; if (half >= tot / 2) { cut = i + 1; break; } }
      boxes.splice(bi, 1, b.slice(0, cut), b.slice(cut));
    }
    const pal = boxes.map((b) => { let r = 0, gg = 0, bl = 0, w = 0; for (const p of b) { r += p[0] * p[3]; gg += p[1] * p[3]; bl += p[2] * p[3]; w += p[3]; } return [r / w, gg / w, bl / w]; });
    for (let round = 0; round < 4; round++) {            // then each colour moves to the middle of the pixels nearest it, four times over
      const sum = pal.map(() => [0, 0, 0, 0]);
      for (const p of pts) { let best = 1e9, bi = 0; for (let i = 0; i < pal.length; i++) { const q = pal[i], e = (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]) + (p[2] - q[2]) * (p[2] - q[2]); if (e < best) { best = e; bi = i; } } const a = sum[bi]; a[0] += p[0] * p[3]; a[1] += p[1] * p[3]; a[2] += p[2] * p[3]; a[3] += p[3]; }
      sum.forEach((a, i) => { if (a[3] > 0) pal[i] = [a[0] / a[3], a[1] / a[3], a[2] / a[3]]; });
    }
    return pal;
  }
  // Light that is added (lamp glow, moths, a wisp) must leave the picture's see-through channel alone, or the look takes the air round it for
  // something solid and inks it. On the screen the two ways of adding look the same, so a material is changed once and stays changed.
  const _pts = [];
  function tameGlows() {
    _pts.length = 0;
    cast.traverse((ob) => {
      const ms = ob.material ? (Array.isArray(ob.material) ? ob.material : [ob.material]) : [];
      for (const m of ms) {
        if (m.blending === THREE.AdditiveBlending) { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = m.premultipliedAlpha ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; }
        if (ob.isPoints && m.isPointsMaterial && !m.sizeAttenuation) { if (m.userData.mfSize == null) m.userData.mfSize = m.size; _pts.push(m); }      // specks sized in screen pixels shrink with the grid
      }
    });
  }
  const _buf = new THREE.Vector2(), _cc = new THREE.Color(); let glowT = 0;

  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 400);
  const api = {
    renderer, cast, camera, near, catcher, footPatch, key,
    frame: [1, 1], win: { x: 0, y: 0, w: 1, h: 1 }, dim: 0, dark: 0, painting: true, shakeX: 0, shakeY: 0, rigK: { key: 1, rim: 1 },
    textures: {}, ownPal: {},
    flip: { on: false, rows: 540, snap: 1, painting: 'own' },      // the Flipbook look: on or off; rows of pixels down the screen; how far colours go to the flipbook's (0 to 1); the painting 'own' (its own colours), 'witch' (the witches' colours) or 'smooth'
    // load a painting once; cb when it is ready to draw
    loadArt(id, src, cb) {
      if (api.textures[id]) return cb && cb(api.textures[id]);
      const im = new Image(); im.onload = () => { const t = new THREE.Texture(im); t.encoding = THREE.sRGBEncoding; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; api.textures[id] = t; try { api.ownPal[id] = toV(ownColours(im)); } catch (e) { api.ownPal[id] = null; } if (cb) cb(t); }; im.src = src;
    },
    // fit the hidden camera to a scene's painting
    setScene(S) {
      const C = S.camera, FW = S.frame[0], FH = S.frame[1]; api.scene = S; api.frame = [FW, FH];
      camera.fov = C.fov; camera.aspect = FW / FH;
      if (S.kind === 'walk') {
        const d = (C.span / 2) / Math.tan(C.fov / 2 * RAD), T = C.target;
        camera.near = 1; camera.far = 400; camera.position.set(T[0], T[1] + d * Math.sin(C.pitch * RAD), T[2] + d * Math.cos(C.pitch * RAD)); camera.lookAt(T[0], T[1], T[2]);
      } else {
        camera.near = 0.1; camera.far = 4000; camera.position.set(0, C.h, C.z); camera.lookAt(0, C.h - Math.tan(C.pitch * RAD) * 100, C.z - 100);
      }
      camera.updateMatrixWorld(); camera.clearViewOffset(); camera.updateProjectionMatrix();
      api.fullProj = camera.projectionMatrix.clone(); api.fullInv = camera.projectionMatrixInverse.clone();
      bgMat.map = api.textures[S.art] || null; bgMat.needsUpdate = true;
      api.rigK = S.rig || { key: 1, rim: 1 };
      api.win = { x: 0, y: 0, w: FW, h: FH };
    },
    // the window of the painting the screen shows, in painting pixels (kept inside the frame)
    setWindow(x, y, w, h) { const FW = api.frame[0], FH = api.frame[1]; w = Math.min(w, FW); h = Math.min(h, FH); api.win.x = Math.max(0, Math.min(FW - w, x)); api.win.y = Math.max(0, Math.min(FH - h, y)); api.win.w = w; api.win.h = h; },
    resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight, pr = Math.min(window.devicePixelRatio || 1, o.maxPixelRatio || 2);
      if (w && h && (canvas.width !== Math.round(w * pr) || canvas.height !== Math.round(h * pr))) { renderer.setPixelRatio(pr); renderer.setSize(w, h, false); }
      return w / Math.max(1, h);
    },
    // her key light and the shadow plane go where she goes
    follow(x, z) { key.position.set(x + 1.7, 3.6, z + 3.2); key.target.position.set(x, 0.9, z); key.target.updateMatrixWorld(); catcher.position.set(x, 0.004, z); },
    // a point in the world, to pixels of the painting and to CSS pixels of the canvas
    toFrame(v, out) { const p = _v.copy(v).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(api.fullProj); out = out || [0, 0]; out[0] = (p.x + 1) / 2 * api.frame[0]; out[1] = (1 - p.y) / 2 * api.frame[1]; return out; },
    toScreen(v, out) { out = api.toFrame(v, out); out[0] = (out[0] - api.win.x) / api.win.w * canvas.clientWidth; out[1] = (out[1] - api.win.y) / api.win.h * canvas.clientHeight; return out; },
    // a point of the canvas (CSS pixels), to the ground it shows (y = 0)
    groundAt(cx, cy, out) {
      const fx = api.win.x + cx / canvas.clientWidth * api.win.w, fy = api.win.y + cy / canvas.clientHeight * api.win.h;
      _v.set(fx / api.frame[0] * 2 - 1, 1 - fy / api.frame[1] * 2, 0.5).applyMatrix4(api.fullInv).applyMatrix4(camera.matrixWorld);
      const o3 = camera.position, dx = _v.x - o3.x, dy = _v.y - o3.y, dz = _v.z - o3.z; if (dy > -1e-6) return null;
      const t = -o3.y / dy; out = out || {}; out.x = o3.x + dx * t; out.z = o3.z + dz * t; return out;
    },
    render() {
      const S = api.scene; if (!S) return;
      for (const [l, base, k] of LIT) l.intensity = base * (1 - k * api.dim) * (l === key ? api.rigK.key : 1);
      rim.intensity = 0.30 * api.rigK.rim;
      const FW = api.frame[0], FH = api.frame[1], sx = api.shakeX, sy = api.shakeY;
      const W = api.win, F = api.flip; let wx = Math.max(0, Math.min(FW - W.w, W.x + sx)), wy = Math.max(0, Math.min(FH - W.h, W.y + sy)), gw = 0, gh = 0;
      if (F.on) {                                        // the grid: whole screen pixels to each of its pixels, and the window on a whole step of it
        renderer.getDrawingBufferSize(_buf); gh = Math.max(48, Math.min(_buf.y, Math.round(F.rows))); gw = Math.max(16, Math.round(_buf.x * gh / _buf.y));
        const cx = W.w / gw, cy = W.h / gh; wx = Math.min(FW - W.w, Math.round(wx / cx) * cx); wy = Math.min(FH - W.h, Math.round(wy / cy) * cy);
      }
      for (const m of patches) m.opacity = F.on ? 0.85 : 1;      // the soft patch at her feet stays under half strength in the look, so it is shadow and not a solid thing to ink
      renderer.setRenderTarget(null); renderer.setClearColor(THEATRE, 1); renderer.clear();
      const pixPaint = F.on && F.painting !== 'smooth' && api.painting && bgMat.map;
      if (F.on) {                                        // the small finished picture starts clear, or as the painting on the grid
        if (rt.width !== gw || rt.height !== gh) { rt.setSize(gw, gh); rt2.setSize(gw, gh); postMat.uniforms.uRes.value.set(gw, gh); upMat.uniforms.uRes.value.set(gw, gh); }
        upMat.uniforms.uScale.value.set(_buf.x / gw, _buf.y / gh); postMat.uniforms.uSnap.value = F.snap;
        renderer.getClearColor(_cc); const oc = renderer.getClearAlpha(); renderer.setClearColor(0x000000, 0); renderer.setRenderTarget(rt2); renderer.clear(); renderer.setClearColor(_cc, oc);
      }
      if (pixPaint) {
        const u = paintMat.uniforms, own = F.painting === 'own' && api.ownPal[S.art]; u.tP.value = bgMat.map; u.uRes.value.set(gw, gh); bgMat.map.repeat.set(1, 1); bgMat.map.offset.set(0, 0);
        u.uWin.value.set(wx / FW, 1 - (wy + W.h) / FH, W.w / FW, W.h / FH); u.uPal.value = own || postMat.uniforms.uPal.value; u.uN.value = own ? 64 : NPW; u.uSnap.value = F.snap; u.uDim.value = 1 - 0.93 * Math.min(1, Math.max(0, api.dark));
        renderer.render(paintScene, bgCam); renderer.setRenderTarget(null);
      } else if (api.painting && bgMat.map) {
        renderer.setRenderTarget(null);
        const t = bgMat.map; t.repeat.set(W.w / FW, W.h / FH); t.offset.set(wx / FW, 1 - (wy + W.h) / FH);
        const d = Math.min(1, Math.max(0, api.dark)); bgMat.color.setScalar(1 - 0.93 * d);
        renderer.render(bgScene, bgCam);
      }
      renderer.clearDepth();
      camera.setViewOffset(FW, FH, wx, wy, W.w, W.h);
      if (!F.on) { for (const m of _pts) m.size = m.userData.mfSize; _pts.length = 0; renderer.render(cast, camera); api.last = { triangles: renderer.info.render.triangles, calls: renderer.info.render.calls }; return; }
      if (--glowT <= 0) { tameGlows(); glowT = 20; }
      for (const m of _pts) m.size = Math.max(1, m.userData.mfSize * gh / _buf.y);
      const oc = renderer.getClearAlpha(); renderer.getClearColor(_cc); renderer.setClearColor(0x000000, 0);
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(cast, camera); renderer.setClearColor(_cc, oc); api.last = { triangles: renderer.info.render.triangles, calls: renderer.info.render.calls + 3 };
      renderer.setRenderTarget(rt2); renderer.render(postScene, bgCam);             // the cast as inked pixels, over the painting's pixels or over nothing
      renderer.setRenderTarget(null); renderer.render(upScene, bgCam);              // and the small picture onto the screen
    },
    info() { return api.last || { triangles: 0, calls: 0 }; },      // the cast's own count (the look adds three small passes)
    flipColours(list) { postMat.uniforms.uPal.value = toV((list || WITCH_PAL).slice(0, NPW)); }, ownColours,      // the look's list of colours can be swapped (never more than the stage was made with)
  };
  const _v = new THREE.Vector3();
  return api;
}
