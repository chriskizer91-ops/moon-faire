// guide2.js: the grey-box painting guide for any walking scene, from its data (world/scenes/<id>.json). three.js r128, global THREE.
// The same idea as pilot/greybox.js (which only knows the fair square): the scene's shapes in plain greys, drawn through the exact camera
// the game will use, with a 1.70 m magenta marker for scale, the sky band and Auros. mode 'key' adds labels, exits and where people stand.
window.MF_GUIDE2 = (function () {
  'use strict';
  const RAD = Math.PI / 180, TONE = { base: 0x67625c, walk: 0xbab2a6, path: 0xa99f92, water: 0x55617b, cloth: 0x8a5656, dark: 0x494543, stone: 0x9b978f, grass: 0x6d7364, solid: 0x8d877f, wood: 0x84796b, tree: 0x596657, tent: 0xa89d8d, roof: 0x8e8272, hull: 0x7b6f63 };
  let R = null;
  const lin = (c) => new THREE.Color(c).convertSRGBToLinear();
  function camera(S, FW, FH) {
    const C = S.camera, cam = new THREE.PerspectiveCamera(C.fov, FW / FH, 1, 600), d = (C.span / 2) / Math.tan(C.fov / 2 * RAD), T = C.target;
    cam.position.set(T[0], T[1] + d * Math.sin(C.pitch * RAD), T[2] + d * Math.cos(C.pitch * RAD)); cam.lookAt(T[0], T[1], T[2]); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return cam;
  }
  function render(S, mode) {
    const FW = S.frame[0], FH = S.frame[1];
    if (!R) { R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.outputEncoding = THREE.sRGBEncoding; }
    R.setPixelRatio(1); R.setSize(FW, FH, false);
    const sc = new THREE.Scene(); sc.background = lin(TONE.base); const cam = camera(S, FW, FH);
    sc.add(new THREE.HemisphereLight(0xffffff, 0x8a8480, 0.78));
    const key = new THREE.DirectionalLight(0xffffff, 0.62); key.position.set(1.7 * 14, 2.7 * 14, 3.2 * 14 - 2); key.target.position.set(0, 0, -2); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
    const k = key.shadow.camera; k.left = -34; k.right = 34; k.top = 34; k.bottom = -34; k.near = 1; k.far = 200; key.shadow.bias = -0.0005; key.shadow.radius = 4; sc.add(key, key.target);
    const lam = (c) => new THREE.MeshLambertMaterial({ color: lin(c) });
    const put = (geo, c, x, y, z, turn) => { const m = new THREE.Mesh(geo, lam(c)); m.position.set(x, y, z); m.rotation.y = (turn || 0) * RAD; m.castShadow = m.receiveShadow = true; sc.add(m); return m; };
    const flat = (geo, c, x, y, z, turn) => { const m = new THREE.Mesh(geo, lam(c)); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, (turn || 0) * RAD, 0); m.position.set(x, y, z); m.receiveShadow = true; sc.add(m); return m; };
    flat(new THREE.PlaneGeometry(400, 400), TONE.base, 0, 0, 0);
    const lay = (g, c, y) => { if (g.kind === 'disc') flat(new THREE.CircleGeometry(g.r, 56), c, g.x, y, g.z); else if (g.kind === 'path') { const dx = g.b[0] - g.a[0], dz = g.b[1] - g.a[1]; flat(new THREE.PlaneGeometry(Math.hypot(dx, dz), g.w), c, (g.a[0] + g.b[0]) / 2, y, (g.a[1] + g.b[1]) / 2, -Math.atan2(dz, dx) / RAD); }
      else flat(new THREE.PlaneGeometry(g.w, g.d), c, g.x, y, g.z, g.turn); };
    (S.ground || []).forEach((g, i) => lay(g, g.kind === 'path' ? TONE.path : TONE.walk, 0.01 + i * 0.001));
    (S.flats || []).forEach((g, i) => lay(g, TONE[g.tone] || TONE.stone, 0.03 + i * 0.001));
    for (const s of S.solids || []) {
      const y = s.y || 0, c = TONE[s.tone] || null;
      if (s.kind === 'cyl') put(new THREE.CylinderGeometry(s.r, s.r, s.h, 24), c || TONE.stone, s.x, y + s.h / 2, s.z);
      else if (s.kind === 'cone') put(new THREE.ConeGeometry(s.r, s.h, 18), c || TONE.tree, s.x, y + s.h / 2, s.z);
      else if (s.kind === 'tent-round') { put(new THREE.CylinderGeometry(s.r, s.r, s.wall, 24), TONE.tent, s.x, s.wall / 2, s.z); put(new THREE.ConeGeometry(s.r * 1.08, s.top - s.wall, 24), TONE.roof, s.x, s.wall + (s.top - s.wall) / 2, s.z); }
      else if (s.kind === 'tent-square') { put(new THREE.BoxGeometry(s.w, s.wall, s.d), TONE.tent, s.x, s.wall / 2, s.z, s.turn); put(new THREE.ConeGeometry(Math.max(s.w, s.d) * 0.74, s.top - s.wall, 4), TONE.roof, s.x, s.wall + (s.top - s.wall) / 2, s.z, (s.turn || 0) + 45); }
      else if (s.kind === 'stall') { const h = s.h || 2.3, g = new THREE.Group(), a = (s.turn || 0) * RAD; g.position.set(s.x, 0, s.z); g.rotation.y = a; sc.add(g);
        const add = (geo, col, px, py, pz) => { const m = new THREE.Mesh(geo, lam(col)); m.position.set(px, py, pz); m.castShadow = m.receiveShadow = true; g.add(m); };
        add(new THREE.BoxGeometry(s.w, 1.0, s.d * 0.45), TONE.wood, 0, 0.5, s.d * 0.2); add(new THREE.BoxGeometry(s.w + 0.4, 0.12, s.d + 0.5), TONE.roof, 0, h, 0);
        for (const px of [-1, 1]) for (const pz of [-1, 1]) add(new THREE.CylinderGeometry(0.05, 0.05, h, 6), TONE.dark, px * s.w / 2, h / 2, pz * s.d / 2); }
      else if (s.kind === 'post') { const h = s.h || 3.3; put(new THREE.CylinderGeometry(0.05, 0.07, h, 8), TONE.dark, s.x, h / 2, s.z); const l = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.26), new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); l.position.set(s.x, h - 0.25, s.z); sc.add(l); }
      else if (s.kind === 'fire') { put(new THREE.CylinderGeometry(s.r || 0.5, s.r || 0.5, 0.25, 16), TONE.stone, s.x, 0.125, s.z); const l = new THREE.Mesh(new THREE.ConeGeometry((s.r || 0.5) * 0.6, 0.7, 10), new THREE.MeshBasicMaterial({ color: 0xffc070 })); l.position.set(s.x, 0.6, s.z); sc.add(l); }
      else put(new THREE.BoxGeometry(s.w, s.h, s.d), c || TONE.solid, s.x, y + s.h / 2, s.z, s.turn);
    }
    const fig = S.figure || [0, 0], mk = new THREE.MeshBasicMaterial({ color: 0xff2bd6 });
    if (mode !== 'bare') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.48, 12), mk); b.position.set(fig[0], 0.74, fig[1]); const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), mk); h.position.set(fig[0], 1.58, fig[1]); sc.add(b, h); }
    R.render(sc, cam);
    const cv = document.createElement('canvas'); cv.width = FW; cv.height = FH; const g = cv.getContext('2d'); g.drawImage(R.domElement, 0, 0);
    const band = (S.skyBand == null ? 0.15 : S.skyBand) * FH, sky = g.createLinearGradient(0, 0, 0, band); sky.addColorStop(0, '#3b3a52'); sky.addColorStop(1, '#7d6a73'); g.fillStyle = sky; g.fillRect(0, 0, FW, band);
    const M = S.moon || { u: 0.105, v: 0.072, d: 0.085 }, mr = M.d * FH / 2, mx = M.u * FW, my = M.v * FH, halo = g.createRadialGradient(mx, my, mr, mx, my, mr * 2.6); halo.addColorStop(0, 'rgba(226,216,240,0.5)'); halo.addColorStop(1, 'rgba(226,216,240,0)');
    g.fillStyle = halo; g.beginPath(); g.arc(mx, my, mr * 2.6, 0, 7); g.fill(); g.fillStyle = '#e9e2f2'; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill();
    const px = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(cam); return [(v.x + 1) / 2 * FW, (1 - v.y) / 2 * FH]; };
    if (mode === 'key') {
      g.font = '600 21px Arial'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(20,16,24,0.85)';
      const tag = (t, x, y, z, col, dy) => { const p = px(x, y, z), X = Math.max(70, Math.min(FW - 70, p[0])), Y = Math.max(band + 22, Math.min(FH - 8, p[1] + (dy || 0))); g.strokeText(t, X, Y); g.fillStyle = col || '#ffffff'; g.fillText(t, X, Y); };
      for (const q of S.ground || []) tag(q.name || '', q.kind === 'path' ? (q.a[0] + q.b[0]) / 2 : q.x, 0, q.kind === 'path' ? (q.a[1] + q.b[1]) / 2 : q.z, '#fff7d6');
      for (const q of S.flats || []) tag(q.name || '', q.kind === 'path' ? (q.a[0] + q.b[0]) / 2 : q.x, 0, q.kind === 'path' ? (q.a[1] + q.b[1]) / 2 : q.z, '#d6e6ff');
      for (const s of S.solids || []) if (s.name && s.kind !== 'post') tag(s.name, s.x, (s.y || 0) + (s.top || s.h || 1), s.z, '#ffffff', -8);
      for (const e of S.exits || []) tag('EXIT to ' + e.to, e.x, 0, e.z, '#9dffb0');
      for (const p of S.people || []) { const q = px(p.x, 0, p.z); g.fillStyle = '#58b7ff'; g.beginPath(); g.arc(q[0], q[1], 9, 0, 7); g.fill(); tag(p.who + (p.seat ? ' (sits)' : ''), p.x, 1.9, p.z, '#bfe3ff'); }
      tag('1.70 m', fig[0], 1.9, fig[1], '#ff9be9'); g.fillStyle = '#ffffff'; g.fillText('sky band: ' + (S.painting && S.painting.top ? S.painting.top.slice(0, 110) : ''), FW * 0.56, 24);
    }
    // what ground the frame shows, for whoever lays the scene out
    const gz = (v) => { const a = new THREE.Vector3(0, 1 - 2 * v, -1).unproject(cam), b = new THREE.Vector3(0, 1 - 2 * v, 1).unproject(cam), t = a.y / (a.y - b.y); return a.z + (b.z - a.z) * t; };
    const gx = (v) => { const a = new THREE.Vector3(1, 1 - 2 * v, -1).unproject(cam), b = new THREE.Vector3(1, 1 - 2 * v, 1).unproject(cam), t = a.y / (a.y - b.y); return a.x + (b.x - a.x) * t; };
    return { canvas: cv, info: { farZ: +gz(band / FH).toFixed(2), nearZ: +gz(1).toFixed(2), halfWidthFar: +gx(band / FH).toFixed(2), halfWidthMid: +gx(0.55).toFixed(2), halfWidthNear: +gx(1).toFixed(2), hide: +(1 / Math.tan(S.camera.pitch * RAD)).toFixed(2) } };
  }
  return { render };
})();
