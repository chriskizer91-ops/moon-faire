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
  function footPatch(r) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.scale.set(r * 2, r * 1.5, 1); m.position.y = 0.006; m.renderOrder = 1; cast.add(m); return m; }

  // the painting: one flat picture behind everything
  const bgScene = new THREE.Scene(), bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, depthWrite: false, toneMapped: false });
  const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat); bgQuad.frustumCulled = false; bgScene.add(bgQuad);
  const THEATRE = new THREE.Color('#383043');
  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 400);
  const api = {
    renderer, cast, camera, near, catcher, footPatch, key,
    frame: [1, 1], win: { x: 0, y: 0, w: 1, h: 1 }, dim: 0, dark: 0, painting: true, shakeX: 0, shakeY: 0, rigK: { key: 1, rim: 1 },
    textures: {},
    // load a painting once; cb when it is ready to draw
    loadArt(id, src, cb) {
      if (api.textures[id]) return cb && cb(api.textures[id]);
      const im = new Image(); im.onload = () => { const t = new THREE.Texture(im); t.encoding = THREE.sRGBEncoding; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; api.textures[id] = t; if (cb) cb(t); }; im.src = src;
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
      const W = api.win, wx = Math.max(0, Math.min(FW - W.w, W.x + sx)), wy = Math.max(0, Math.min(FH - W.h, W.y + sy));
      renderer.setRenderTarget(null); renderer.setClearColor(THEATRE, 1); renderer.clear();
      if (api.painting && bgMat.map) {
        const t = bgMat.map; t.repeat.set(W.w / FW, W.h / FH); t.offset.set(wx / FW, 1 - (wy + W.h) / FH);
        const d = Math.min(1, Math.max(0, api.dark)); bgMat.color.setScalar(1 - 0.93 * d);
        renderer.render(bgScene, bgCam);
      }
      renderer.clearDepth();
      camera.setViewOffset(FW, FH, wx, wy, W.w, W.h);
      renderer.render(cast, camera);
    },
    info() { const i = renderer.info.render; return { triangles: i.triangles, calls: i.calls }; },
  };
  const _v = new THREE.Vector3();
  return api;
}
