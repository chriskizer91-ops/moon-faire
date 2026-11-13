// Grey-box layouts for the pilot paintings, drawn from the camera the game will use. three.js r128, global THREE.
// MF_GREYBOX.render(id, mode) returns a canvas: mode 'guide' is the picture to attach to the painting prompt (no words on
// it, one 1.70 m marker for scale); mode 'key' adds labels and every fight place, for people to read, never for the prompt.
(function () {
  'use strict';
  const P = window.MF_PILOT, RAD = Math.PI / 180;
  const GREY = { earth: 0x5a5656, square: 0x969088, lane: 0x8a857e, cloth: 0x7a6f78, canvas: 0xbdb8b2, wood: 0x8d8780, dark: 0x3f3b3d, stone: 0x8a8785, moor: 0x5e625e, clear: 0x747972, road: 0x8b8882, bush: 0x4d524d };
  const MARK = 0xff00c8;                                             // the scale marker: a colour no painting uses
  const lam = (c) => new THREE.MeshLambertMaterial({ color: c });

  function rig(scene, reach) {
    const R = P.rig, add = (L, cast) => {
      const d = new THREE.DirectionalLight(L.color, L.k); d.position.set(L.from[0] * 12, L.from[1] * 12, L.from[2] * 12); scene.add(d);
      if (cast) { d.castShadow = true; d.shadow.mapSize.set(4096, 4096); const c = d.shadow.camera; c.left = -reach; c.right = reach; c.top = reach; c.bottom = -reach; c.near = 1; c.far = 160; d.shadow.bias = -0.0004; d.shadow.normalBias = 0.03; d.shadow.radius = 3; }
      return d;
    };
    scene.add(new THREE.HemisphereLight(R.hemi.sky, R.hemi.ground, R.hemi.k));
    add(R.key, true); add(R.rim); add(R.back); add(R.fill);
  }
  function mesh(geo, mat, x, y, z, o) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !(o && o.flat); m.receiveShadow = true; return m; }
  function flat(geo, color, x, y, z, rotY) { const m = new THREE.Mesh(geo, lam(color)); m.rotation.x = -Math.PI / 2; if (rotY) m.rotation.z = rotY; m.position.set(x, y, z); m.receiveShadow = true; return m; }
  function marker(x, z) {
    const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: MARK });
    g.add(mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.42, 16), m, 0, 0.71, 0), mesh(new THREE.SphereGeometry(0.14, 16, 12), m, 0, 1.56, 0));
    g.position.set(x, 0, z); g.children.forEach((c) => { c.castShadow = true; }); return g;
  }
  function door(w, h) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ color: GREY.dark })); m.receiveShadow = true; return m; }
  const faceCentre = (x, z) => Math.atan2(-x, -z);

  function tent(t) {
    const g = new THREE.Group(), c = lam(GREY.canvas), a = faceCentre(t.x, t.z);
    if (t.kind === 'round') {
      g.add(mesh(new THREE.CylinderGeometry(t.r, t.r, t.wall, 28), c, 0, t.wall / 2, 0), mesh(new THREE.ConeGeometry(t.r * 1.08, t.top - t.wall, 28), c, 0, t.wall + (t.top - t.wall) / 2, 0));
      const d = door(1.2, 2.0); d.position.set(Math.sin(a) * (t.r + 0.02), 1.0, Math.cos(a) * (t.r + 0.02)); d.rotation.y = a; g.add(d);
    } else if (t.kind === 'square') {
      g.add(mesh(new THREE.BoxGeometry(t.w, t.wall, t.d), c, 0, t.wall / 2, 0));
      const roof = mesh(new THREE.ConeGeometry(Math.max(t.w, t.d) * 0.76, t.top - t.wall, 4), c, 0, t.wall + (t.top - t.wall) / 2, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(t.w / Math.max(t.w, t.d), 1, t.d / Math.max(t.w, t.d)); g.add(roof);
      const side = Math.abs(Math.sin(a)) > Math.abs(Math.cos(a)), d = door(1.2, 2.1);
      if (side) { d.position.set(Math.sign(Math.sin(a)) * (t.w / 2 + 0.02), 1.05, 0); d.rotation.y = Math.sign(Math.sin(a)) * Math.PI / 2; } else { d.position.set(0, 1.05, Math.sign(Math.cos(a)) * (t.d / 2 + 0.02)); d.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI; }
      g.add(d);
    } else {                                                          // a stall: counter, four posts, a sloping awning, an open front toward the square
      const w = lam(GREY.wood), s = new THREE.Group();
      s.add(mesh(new THREE.BoxGeometry(t.w, 0.95, 0.6), w, 0, 0.475, t.d / 2 - 0.3), mesh(new THREE.BoxGeometry(t.w, 2.0, 0.08), w, 0, 1.0, -t.d / 2));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) s.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, sz > 0 ? t.h - 0.25 : t.h + 0.1, 8), w, sx * (t.w / 2 - 0.06), (sz > 0 ? t.h - 0.25 : t.h + 0.1) / 2, sz * (t.d / 2 - 0.06)));
      const aw = mesh(new THREE.BoxGeometry(t.w + 0.5, 0.06, t.d + 0.9), c, 0, t.h, 0.15); aw.rotation.x = 0.2; s.add(aw);
      s.rotation.y = a; g.add(s);
    }
    g.position.set(t.x, 0, t.z); return g;
  }

  // everything that stands up in the walking scene: the well, the lantern posts, the tents, the stalls and the props.
  // The game uses the same shapes, drawn into depth only, as the things a witch walks behind.
  function solids(S, zNear) {
    const scene = new THREE.Group();
    const W = S.well, st = lam(GREY.stone), wd = lam(GREY.wood);
    scene.add(mesh(new THREE.CylinderGeometry(W.r, W.r, 0.8, 24), st, W.x, 0.4, W.z), mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), wd, W.x - W.r + 0.1, 1.1, W.z), mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), wd, W.x + W.r - 0.1, 1.1, W.z), mesh(new THREE.BoxGeometry(W.r * 2 + 0.5, 0.1, 1.1), wd, W.x, 2.25, W.z));
    for (const a of S.posts.at) {
      const x = Math.cos(a * RAD) * S.posts.r, z = -Math.sin(a * RAD) * S.posts.r;
      scene.add(mesh(new THREE.CylinderGeometry(0.05, 0.07, S.posts.h, 8), lam(GREY.dark), x, S.posts.h / 2, z));
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.24), new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); l.position.set(x, S.posts.h - 0.25, z); scene.add(l);
    }
    for (const t of S.tents) scene.add(tent(t));
    for (const sx of [-1, 1]) scene.add(tent({ kind: 'round', x: sx * 13.6, z: zNear + 1.6, r: 2.6, wall: 2.1, top: 4.6 }));    // tent tops that frame the bottom corners
    for (const p of S.props) { const b = mesh(new THREE.BoxGeometry(p.w, p.h, p.d), lam(GREY.wood), p.x, p.h / 2 + (p.name === 'wagon' ? 0.45 : 0), p.z); b.rotation.y = (p.turn || 0) * RAD; scene.add(b);
      if (p.name === 'wagon') for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16), lam(GREY.dark), 0, 0, 0); w.rotation.x = Math.PI / 2; w.position.set(p.x + sx * (p.w / 2 - 0.5), 0.5, p.z + sz * (p.d / 2 + 0.08)); scene.add(w); } }
    return scene;
  }

  // ---------- the walking scene ----------
  function buildWalk(S, mode) {
    const scene = new THREE.Scene(), C = S.camera, [FW, FH] = S.frame;
    const cam = new THREE.PerspectiveCamera(C.fov, FW / FH, 1, 400), d = (C.span / 2) / Math.tan(C.fov / 2 * RAD), T = C.target;
    cam.position.set(T[0], T[1] + d * Math.sin(C.pitch * RAD), T[2] + d * Math.cos(C.pitch * RAD)); cam.lookAt(T[0], T[1], T[2]); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    // the ground stops where the backdrop band begins
    const downAt = (v) => C.pitch * RAD - Math.atan(Math.tan(C.fov / 2 * RAD) * (1 - 2 * v)), zAt = (v) => cam.position.z - cam.position.y / Math.tan(downAt(v));
    const zFar = zAt(S.skyBand), zNear = zAt(1);
    rig(scene, 34);
    const gz0 = zFar, gz1 = zNear + 12;
    scene.add(flat(new THREE.PlaneGeometry(90, gz1 - gz0), GREY.earth, 0, 0, (gz0 + gz1) / 2));
    for (const L of S.lanes) { const dx = L.b[0] - L.a[0], dz = L.b[1] - L.a[1], len = Math.hypot(dx, dz); scene.add(flat(new THREE.PlaneGeometry(len, L.w), GREY.lane, (L.a[0] + L.b[0]) / 2, 0.01, (L.a[1] + L.b[1]) / 2, -Math.atan2(dz, dx))); }
    scene.add(flat(new THREE.CircleGeometry(S.square.r, 64), GREY.square, 0, 0.02, 0), flat(new THREE.RingGeometry(S.square.r - 0.7, S.square.r, 64), GREY.stone, 0, 0.03, 0));
    scene.add(flat(new THREE.PlaneGeometry(S.cloth.w, S.cloth.d), GREY.cloth, S.cloth.x, 0.04, S.cloth.z));
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe2b0 })); m.position.set(S.cloth.x + sx * (S.cloth.w / 2 - 0.2 - i * 0.02) * (1 - i * 0.0), 0.08, S.cloth.z + S.cloth.d / 2 - i * (S.cloth.d / 3)); scene.add(m); }
    scene.add(solids(S, zNear));
    scene.add(marker(S.figure[0], S.figure[1]));
    return { scene, cam, zFar, zNear, d };
  }

  // ---------- the fight backdrop ----------
  function buildFight(S, mode) {
    const scene = new THREE.Scene(), C = S.camera, [FW, FH] = S.frame;
    const cam = new THREE.PerspectiveCamera(C.fov, FW / FH, 0.1, 4000);
    cam.position.set(0, C.h, C.z); cam.lookAt(0, C.h - Math.tan(C.pitch * RAD) * 100, C.z - 100); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    rig(scene, 40);
    scene.add(flat(new THREE.PlaneGeometry(6000, 3200), GREY.moor, 0, 0, -1560));
    const cl = flat(new THREE.CircleGeometry(1, 64), GREY.clear, S.clear.x, 0.01, S.clear.z); cl.scale.set(S.clear.rx, S.clear.rz, 1); scene.add(cl);
    // an old road well behind the clearing, running off to the right
    const pts = [[-70, -30], [-30, -24], [0, -26], [22, -34], [40, -52], [58, -90], [70, -150], [76, -260]], road = new THREE.Shape();
    const side = (k) => pts.map(([x, z], i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz); return [x - dz / n * 1.6 * k, z + dx / n * 1.6 * k]; });
    const L = side(1), Rr = side(-1).reverse(); road.moveTo(L[0][0], -L[0][1]); for (const p of L.slice(1).concat(Rr)) road.lineTo(p[0], -p[1]);
    scene.add(flat(new THREE.ShapeGeometry(road), GREY.road, 0, 0.02, 0));
    // a low dry-stone wall, some gorse, one wind-bent tree, a far waymark stone
    for (let i = 0; i < 9; i++) scene.add(mesh(new THREE.BoxGeometry(3.6, 0.9, 0.7), lam(GREY.stone), -44 + i * 3.7, 0.45, -19 - i * 0.35));
    const bush = lam(GREY.bush), seeded = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
    for (let i = 0; i < 26; i++) { const x = -60 + seeded(i) * 120, z = -15 - seeded(i + 50) * 60; if (Math.abs(x) < 9 && z > -18) continue; const b = mesh(new THREE.SphereGeometry(1, 12, 8), bush, x, 0.35, z); b.scale.set(1.2 + seeded(i + 9) * 1.6, 0.6 + seeded(i + 3) * 0.5, 1.1 + seeded(i + 5)); scene.add(b); }
    scene.add(mesh(new THREE.CylinderGeometry(0.25, 0.4, 4.2, 8), lam(GREY.dark), 17, 2.1, -36)); const crown = mesh(new THREE.SphereGeometry(1, 14, 10), bush, 15.6, 5.2, -36); crown.scale.set(3.6, 1.9, 2.6); scene.add(crown);
    scene.add(mesh(new THREE.BoxGeometry(0.9, 2.4, 0.6), lam(GREY.stone), 30, 1.2, -44));
    if (mode === 'key') { for (const [, x, z] of S.party) scene.add(marker(x, z)); for (const [n, x, z] of S.foes) { const m = marker(x, z); if (n === 'boss') m.scale.setScalar(2.6); m.children.forEach((c) => { c.material = new THREE.MeshBasicMaterial({ color: 0x00c8ff }); }); scene.add(m); } }
    else scene.add(marker(S.figure[0], S.figure[1]));
    return { scene, cam };
  }

  // ---------- the flat parts: sky, moon, far skyline ----------
  function backdrop(g, S, FW, FH) {
    const moon = () => { const r = S.moon.d * FH / 2, x = S.moon.u * FW, y = S.moon.v * FH; const halo = g.createRadialGradient(x, y, r, x, y, r * 2.6); halo.addColorStop(0, 'rgba(226,216,240,0.5)'); halo.addColorStop(1, 'rgba(226,216,240,0)'); g.fillStyle = halo; g.beginPath(); g.arc(x, y, r * 2.6, 0, 7); g.fill(); g.fillStyle = '#ece6dc'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    if (S.kind === 'walk') {
      const h = S.skyBand * FH, sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#3b3a52'); sky.addColorStop(1, '#7d6a73'); g.fillStyle = sky; g.fillRect(0, 0, FW, h + 2);
      moon();
      g.fillStyle = '#4f4a55'; g.beginPath(); g.moveTo(0, h + 2);                                   // far hills
      for (let i = 0; i <= 40; i++) g.lineTo(i / 40 * FW, h - FH * (0.018 + 0.012 * Math.sin(i * 0.9) + 0.01 * Math.sin(i * 0.37 + 1)));
      g.lineTo(FW, h + 2); g.fill();
      g.fillStyle = '#3a363d';                                                                       // the big top and more tent tops, far off
      const top = (u, w, hh, peaks) => { const x = u * FW, ww = w * FW, y = h + 2, ph = hh * FH; g.beginPath(); g.moveTo(x - ww / 2, y); g.lineTo(x - ww / 2, y - ph * 0.35); for (let i = 0; i < peaks; i++) { const px = x - ww / 2 + ww * (i + 0.5) / peaks; g.lineTo(px - ww / peaks * 0.2, y - ph * 0.62); g.lineTo(px, y - ph); g.lineTo(px + ww / peaks * 0.2, y - ph * 0.62); } g.lineTo(x + ww / 2, y - ph * 0.35); g.lineTo(x + ww / 2, y); g.fill(); };
      top(0.535, 0.17, 0.105, 2); top(0.40, 0.04, 0.045, 1); top(0.655, 0.04, 0.04, 1); top(0.93, 0.05, 0.045, 1); top(0.035, 0.04, 0.04, 1);
    } else {
      const hz = S.horizon * FH, sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#24233a'); sky.addColorStop(1, '#5a5568'); g.fillStyle = sky; g.fillRect(0, 0, FW, hz + 2);
      moon();
      const band = (base, amp, col, k) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, hz + 2); for (let i = 0; i <= 80; i++) { const u = i / 80; g.lineTo(u * FW, FH * (base - amp * (0.5 + 0.5 * Math.sin(u * 7 * k + k) * Math.cos(u * 3.1 * k)) - amp * 0.3 * Math.sin(u * 19 + k))); } g.lineTo(FW, hz + 2); g.fill(); };
      band(0.50, 0.07, '#464358', 1.3); band(0.56, 0.045, '#3b3a49', 2.1); band(0.60, 0.02, '#33333d', 3.3);
      // the fair, small and glowing, far off on the left
      const fx = 0.12 * FW, fy = hz - FH * 0.012, glow = g.createRadialGradient(fx, fy, 2, fx, fy, FW * 0.07); glow.addColorStop(0, 'rgba(255,214,150,0.75)'); glow.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = glow; g.fillRect(fx - FW * 0.08, fy - FW * 0.07, FW * 0.16, FW * 0.08);
      g.fillStyle = '#2b2930'; g.beginPath(); g.moveTo(fx - 34, hz + 1); g.lineTo(fx - 34, hz - 9); g.lineTo(fx - 20, hz - 16); g.lineTo(fx - 12, hz - 30); g.lineTo(fx - 4, hz - 16); g.lineTo(fx + 4, hz - 16); g.lineTo(fx + 12, hz - 30); g.lineTo(fx + 20, hz - 16); g.lineTo(fx + 34, hz - 9); g.lineTo(fx + 34, hz + 1); g.fill();
      for (const [dx, w] of [[-58, 14], [50, 12], [72, 10], [-80, 9]]) { g.beginPath(); g.moveTo(fx + dx - w, hz + 1); g.lineTo(fx + dx, hz - w * 1.1); g.lineTo(fx + dx + w, hz + 1); g.fill(); }
    }
  }

  function render(id, mode) {
    const S = P.scenes[id], [FW, FH] = S.frame, B = S.kind === 'walk' ? buildWalk(S, mode) : buildFight(S, mode);
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setPixelRatio(1); r.setSize(FW, FH, false); r.setClearColor(0x000000, 0);
    r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.NoToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.render(B.scene, B.cam);
    const out = document.createElement('canvas'); out.width = FW; out.height = FH; const g = out.getContext('2d');
    backdrop(g, S, FW, FH); g.drawImage(r.domElement, 0, 0);
    const px = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(B.cam); return [(v.x + 1) / 2 * FW, (1 - v.y) / 2 * FH]; };
    const info = { id, frame: S.frame, camera: { position: B.cam.position.toArray().map((n) => +n.toFixed(3)), fov: B.cam.fov }, ppm: +(Math.hypot(px(0, 0, 0)[0] - px(1, 0, 0)[0], px(0, 0, 0)[1] - px(1, 0, 0)[1])).toFixed(2), zFar: B.zFar, zNear: B.zNear, figure: { foot: px(S.figure[0], 0, S.figure[1]), head: px(S.figure[0], 1.7, S.figure[1]) } };
    if (mode === 'key') {
      const fs = Math.round(FH / 46); g.font = `600 ${fs}px sans-serif`; g.textBaseline = 'middle';
      const tag = (text, x, y, z, dx, dy) => { const [u, v] = px(x, y, z), w = g.measureText(text).width + fs * 0.7, tx = Math.min(FW - w / 2 - 6, Math.max(w / 2 + 6, u + (dx || 0) * fs)), ty = Math.max(fs, v + (dy || 0) * fs); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(u, v); g.lineTo(tx, ty); g.stroke(); g.fillStyle = 'rgba(24,18,28,0.86)'; g.fillRect(tx - w / 2, ty - fs * 0.75, w, fs * 1.5); g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.fillText(text, tx, ty); };
      if (S.kind === 'walk') {
        tag('1.70 m', S.figure[0], 1.7, S.figure[1], -3.5, -1.6); tag(S.cloth.name, S.cloth.x, 0, S.cloth.z, 0, 0); tag(S.well.name, S.well.x, 2.2, S.well.z, 6, -1.5);
        for (const L of S.lanes) tag('lane ' + L.name, L.b[0] * 0.62, 0, L.b[1], 0, 1.6);
        S.tents.forEach((t) => tag(t.name, t.x, t.top || t.h, t.z, 0, -1.4)); S.props.slice(0, 2).forEach((p) => tag(p.name, p.x, p.h, p.z, 0, -1.6));
        tag('lantern post, 3.3 m', Math.cos(118 * RAD) * S.posts.r, 3.3, -Math.sin(118 * RAD) * S.posts.r, -1, -1.6);
        g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.fillText('backdrop band: ' + S.skyline, FW * 0.56, FH * 0.02); g.fillText('Auros', S.moon.u * FW, S.moon.v * FH + S.moon.d * FH * 0.85);
      } else {
        for (const [n, x, z] of S.party) tag(n, x, 1.7, z, 0, -1.3); for (const [n, x, z] of S.foes) tag(n, x, n === 'boss' ? 4.4 : 1.7, z, 0, -1.3);
        tag('the clearing: flat, nothing on it', 0, 0, 3.2, 0, 1.2); tag('old road, far behind', 22, 0, -34, 4, 2); tag('dry-stone wall', -30, 0.9, -20, 0, -1.6); g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.fillText('the fair, far off', 0.12 * FW, S.horizon * FH - fs * 4.2);
        g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.fillText('Auros', S.moon.u * FW, S.moon.v * FH + S.moon.d * FH * 0.72); g.fillText('horizon, 61% down', FW * 0.86, S.horizon * FH - fs);
      }
    }
    r.dispose();
    return { canvas: out, info };
  }
  window.MF_GREYBOX = { render, solids };
})();
