// field.js: one witch walking a painted scene. No spells here: she walks, runs and does her body moves.
// The scene's data says where she can walk; the grey-box shapes the painting was made from are drawn into depth only,
// so she goes behind the well, the lantern posts and the stalls; four fixed lights sit on the nearest painted lamps;
// and a live layer (lamp glow, moths, fireflies, bunting) moves over the painting.
function makeMFField(stage, S, H) {
  'use strict';
  const RAD = Math.PI / 180, L = S.layout, group = new THREE.Group(); group.visible = false; stage.cast.add(group);
  let rs = 20261113; const rnd = () => { rs ^= rs << 13; rs >>>= 0; rs ^= rs >>> 17; rs ^= rs << 5; rs >>>= 0; return rs / 4294967296; };      // seeded: the same every time

  // ---------- cut-outs: the things she walks behind, in depth only ----------
  const zNear = 12.42, cut = window.MF_GREYBOX.solids(L, zNear), hide = new THREE.MeshBasicMaterial({ colorWrite: false });
  cut.traverse((m) => { if (m.isMesh) { m.material = hide; m.castShadow = false; m.receiveShadow = false; m.renderOrder = -10; } });
  group.add(cut);

  // ---------- where she can walk ----------
  const lamps = L.posts.at.map((a, i) => ({ i, x: Math.cos(a * RAD) * L.posts.r, z: -Math.sin(a * RAD) * L.posts.r, seed: rnd() * 10 }));
  const blockers = S.blockers.concat(lamps.map((p) => ({ x: p.x, z: p.z, r: 0.32 })));
  function open(x, z) {
    let ok = false;
    for (const d of S.walk.discs) if (Math.hypot(x - d.x, z - d.z) <= d.r) ok = true;
    for (const b of S.walk.boxes) if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) ok = true;
    if (!ok) return false;
    for (const b of blockers) if (Math.hypot(x - b.x, z - b.z) < b.r) return false;
    return true;
  }

  // ---------- the live layer ----------
  const live = new THREE.Group(); group.add(live);
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const glowMat = (c, op) => new THREE.SpriteMaterial({ map: dot, color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const glows = lamps.map((p) => { const s = new THREE.Sprite(glowMat(0xffb060, 0.5)); s.position.set(p.x, S.lampLight.h, p.z); s.scale.setScalar(1.5); live.add(s); return s; });
  // the footlights along the two short sides of the floor cloth
  const foot = []; for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(glowMat(0xffc27a, 0.5)); s.position.set(L.cloth.x + sx * (L.cloth.w / 2 - 0.12), 0.12, L.cloth.z - L.cloth.d / 2 + 0.3 + i * (L.cloth.d - 0.6) / 3); s.scale.setScalar(0.42); live.add(s); foot.push([s, rnd() * 10]); }
  // moths round the lamps, fireflies over the grass at the edges
  const NM = 22, NF = 26, pts = new Float32Array((NM + NF) * 3), cols = new Float32Array((NM + NF) * 3), bug = [];
  for (let i = 0; i < NM; i++) bug.push({ lamp: lamps[i % lamps.length], r: 0.25 + rnd() * 0.55, sp: (1.4 + rnd() * 2.2) * (rnd() < 0.5 ? -1 : 1), ph: rnd() * 7, h: rnd() * 0.5 });
  for (let i = 0; i < NF; i++) { const a = rnd() * 6.283, r = 9.6 + rnd() * 6; bug.push({ fx: Math.cos(a) * r * 1.25, fz: Math.sin(a) * r * 0.8 - 1, ph: rnd() * 7, sp: 0.3 + rnd() * 0.5, h: 0.4 + rnd() * 1.1 }); }
  const bugGeo = new THREE.BufferGeometry(); bugGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3)); bugGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const bugs = new THREE.Points(bugGeo, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, map: dot, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); bugs.frustumCulled = false; live.add(bugs);
  // bunting: strings of small flags between lantern posts, swaying. The painting has none, so the game hangs its own.
  const FLAG = [0x6e2a35, 0xa89c88, 0x34365e, 0x94703a, 0x35574a].map((c) => new THREE.Color(c).convertSRGBToLinear().multiplyScalar(0.8));      // cloth colours already softened by the dusk
  const strings = []; { const pairs = [[1, 2], [2, 3], [0, 1], [4, 5], [6, 7]], NFL = 13, fpos = [], fcol = [], home = [];
    for (const [a, b] of pairs) { const A = lamps[a], B = lamps[b];
      for (let i = 0; i < NFL; i++) { const u = (i + 0.5) / NFL, x = A.x + (B.x - A.x) * u, z = A.z + (B.z - A.z) * u, y = 3.02 - 0.5 * Math.sin(Math.PI * u), dx = (B.x - A.x), dz = (B.z - A.z), n = Math.hypot(dx, dz), hx = dx / n * 0.12, hz = dz / n * 0.12, c = FLAG[(i + a) % FLAG.length];
        home.push([x, y, z, hx, hz, rnd() * 7]); for (let k = 0; k < 3; k++) { fpos.push(0, 0, 0); fcol.push(c.r, c.g, c.b); } } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(fpos), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(fcol), 3));
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, toneMapped: false })); m.frustumCulled = false; live.add(m); strings.push({ g, home });
    // the strings themselves
    const lp = []; for (const [a, b] of pairs) { const A = lamps[a], B = lamps[b]; for (let i = 0; i < 16; i++) for (const u of [i / 16, (i + 1) / 16]) lp.push(A.x + (B.x - A.x) * u, 3.02 - 0.5 * Math.sin(Math.PI * u) + 0.01, A.z + (B.z - A.z) * u); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lp), 3)); const ln = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x1c1418, toneMapped: false })); ln.frustumCulled = false; live.add(ln);
  }
  function liveStep(t) {
    for (let i = 0; i < lamps.length; i++) { const f = 0.82 + 0.1 * Math.sin(t * 7.3 + lamps[i].seed) + 0.08 * Math.sin(t * 13.1 + lamps[i].seed * 2.3); lamps[i].f = f; glows[i].material.opacity = 0.42 * f; glows[i].scale.setScalar(1.35 + 0.25 * f); }
    for (const [s, ph] of foot) s.material.opacity = 0.4 + 0.12 * Math.sin(t * 9 + ph);
    for (let i = 0; i < bug.length; i++) { const b = bug[i]; let x, y, z, k;
      if (b.lamp) { const a = t * b.sp + b.ph; x = b.lamp.x + Math.cos(a) * b.r * (1 + 0.3 * Math.sin(a * 2.7)); z = b.lamp.z + Math.sin(a) * b.r; y = S.lampLight.h - 0.1 + b.h * Math.sin(a * 1.9 + b.ph); k = 0.5 + 0.3 * Math.sin(a * 5); cols[i * 3] = 0.9 * k; cols[i * 3 + 1] = 0.8 * k; cols[i * 3 + 2] = 0.6 * k; }
      else { x = b.fx + Math.sin(t * b.sp + b.ph) * 0.9; z = b.fz + Math.cos(t * b.sp * 0.8 + b.ph) * 0.7; y = b.h + 0.3 * Math.sin(t * 0.9 + b.ph); k = Math.max(0, Math.sin(t * 1.3 + b.ph * 3)); cols[i * 3] = 0.7 * k; cols[i * 3 + 1] = 0.95 * k; cols[i * 3 + 2] = 0.45 * k; }
      pts[i * 3] = x; pts[i * 3 + 1] = y; pts[i * 3 + 2] = z; }
    bugGeo.attributes.position.needsUpdate = true; bugGeo.attributes.color.needsUpdate = true;
    for (const st of strings) { const p = st.g.attributes.position.array; st.home.forEach((h, i) => { const sw = 0.05 * Math.sin(t * 1.7 + h[5]) + 0.03 * Math.sin(t * 3.1 + h[5] * 2), o = i * 9;
      p[o] = h[0] - h[3]; p[o + 1] = h[1]; p[o + 2] = h[2] - h[4]; p[o + 3] = h[0] + h[3]; p[o + 4] = h[1]; p[o + 5] = h[2] + h[4]; p[o + 6] = h[0] + sw; p[o + 7] = h[1] - 0.26; p[o + 8] = h[2] + sw * 0.6; }); st.g.attributes.position.needsUpdate = true; }
  }

  // ---------- her ----------
  const me = { x: S.start.x, z: S.start.z, face: S.start.face, vx: 0, vz: 0, wb: 0, rb: 0, phase: 0, goal: null, stuck: 0, idleT: 0, idleNext: 5 };
  const keys = {}, patch = stage.footPatch(0.42); patch.visible = false;
  let J = null, viewX = null, viewY = null, near = null, toastT = 0;
  const api = {
    S, me, keys, group, open, live,
    enter(j) {
      J = j; group.visible = true; patch.visible = true; stage.setScene(S); viewX = viewY = null;
      J.root.position.set(me.x, 0, me.z); J.root.rotation.y = me.face; J.targetDist = 0; J.arena = 0; J.game.fates = []; J.game.catches = 0; J.reset();
      for (const l of stage.near) { l.color.setHex(S.lampLight.color); l.distance = S.lampLight.reach; }
    },
    leave() { group.visible = false; patch.visible = false; for (const l of stage.near) l.intensity = 0; me.goal = null; for (const k in keys) keys[k] = false; },
    // a click or a tap on the picture: walk there
    pointer(cx, cy) { const g = stage.groundAt(cx, cy); if (!g) return; me.goal = { x: g.x, z: g.z }; me.stuck = 0; },
    act() { if (!near || !J || J.action) return; if (near.act) { me.goal = null; J.play(near.act, true); } if (near.say) H.toast(near.say); },
    play(name) { if (!J) return; me.goal = null; J.play(name, true); },
    step(dt, t) {
      // what the player asks for: keys first, then a place that was clicked
      let ix = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), iz = (keys.d ? 1 : 0) - (keys.u ? 1 : 0), mag = Math.hypot(ix, iz), run = !!keys.run;
      if (mag > 0) { ix /= mag; iz /= mag; me.goal = null; }
      else if (me.goal) { const dx = me.goal.x - me.x, dz = me.goal.z - me.z, d = Math.hypot(dx, dz); if (d < 0.12) me.goal = null; else { ix = dx / d; iz = dz / d; mag = Math.min(1, d / 0.6); run = d > 6; } }
      const busy = J.action && !/^(look_around|settle)$/.test(J.action);
      if (mag > 0 && J.action && !busy) J.stop();
      const free = !busy && !J.stanceNow && !J.pending, speed = free && mag > 0 ? (run ? 2.3 : 0.84) * Math.min(1, mag) : 0;
      const k = Math.min(1, dt * 7); me.vx += (ix * speed - me.vx) * k; me.vz += (iz * speed - me.vz) * k;
      // move, sliding along whatever is in the way
      const nx = me.x + me.vx * dt, nz = me.z + me.vz * dt, was = [me.x, me.z];
      if (open(nx, nz)) { me.x = nx; me.z = nz; } else if (open(nx, me.z)) { me.x = nx; me.vz *= 0.5; } else if (open(me.x, nz)) { me.z = nz; me.vx *= 0.5; } else { me.vx = me.vz = 0; }
      const moved = Math.hypot(me.x - was[0], me.z - was[1]) / Math.max(dt, 1e-4), v = Math.min(moved, Math.hypot(me.vx, me.vz));
      if (me.goal) { me.stuck = v < 0.05 ? me.stuck + dt : 0; if (me.stuck > 0.5) me.goal = null; }
      if (v > 0.06) { let df = Math.atan2(me.vx, me.vz) - me.face; df = Math.atan2(Math.sin(df), Math.cos(df)); me.face += df * Math.min(1, dt * 9); }
      const wbTo = Math.min(1, v / 0.3), rbTo = Math.max(0, Math.min(1, (v - 1.0) / 1.0));
      me.wb += (wbTo - me.wb) * Math.min(1, dt * 8); me.rb += (rbTo - me.rb) * Math.min(1, dt * 5);
      if (me.wb > 0.001) me.phase += dt * Math.max(2.0, v * (7.66 * (1 - me.rb) + 4.2 * me.rb));      // her feet keep pace with the ground she covers (her own page's numbers)
      // the ends of the lanes: the next scenes are not painted yet
      for (const e of S.exits) if ((e.side === 'left' && me.x < e.x) || (e.side === 'right' && me.x > e.x)) { me.x = e.x; me.vx = 0; me.goal = null; if (t > toastT) { H.toast(e.say); toastT = t + 4; } }
      // left standing, she looks about or settles her weight now and then
      if (v < 0.05 && !J.action) { me.idleT += dt; if (me.idleT > me.idleNext) { me.idleT = 0; me.idleNext = 6 + rnd() * 7; J.play(rnd() < 0.5 ? 'look_around' : 'settle', false); } } else me.idleT = 0;
      J.root.position.set(me.x, 0, me.z); J.root.rotation.y = me.face + J.spin; stage.follow(me.x, me.z); patch.position.set(me.x, 0.006, me.z);
      // spots she can use
      near = null; for (const s of S.spots) if (Math.hypot(me.x - s.x, me.z - s.z) < s.r) near = s; H.prompt(near && !busy ? near.prompt : '');
      // the four fixed lights go to the four nearest painted lamps
      const by = lamps.slice().sort((a, b) => Math.hypot(a.x - me.x, a.z - me.z) - Math.hypot(b.x - me.x, b.z - me.z));
      stage.near.forEach((l, i) => { const p = by[i]; l.position.set(p.x, S.lampLight.h, p.z); l.intensity = H.liveOn() ? S.lampLight.k * (p.f || 1) : 0; });
      live.visible = H.liveOn(); if (live.visible) liveStep(t);
      // the screen shows a window of the painting that follows her
      const FW = S.frame[0], FH = S.frame[1], asp = H.aspect(); let w = FW * S.show, h = w / asp; if (h > FH) { h = FH; w = h * asp; if (w > FW) { w = FW; h = FH; } }
      const p = stage.toFrame(_v.set(me.x + me.vx * 0.6, 0.9, me.z + me.vz * 0.6)), tx = p[0] - w / 2, ty = p[1] - h * 0.52;
      if (viewX == null) { viewX = tx; viewY = ty; } else { viewX += (tx - viewX) * Math.min(1, dt * 2.6); viewY += (ty - viewY) * Math.min(1, dt * 2.6); }
      viewX = Math.max(0, Math.min(FW - w, viewX)); viewY = Math.max(0, Math.min(FH - h, viewY));
      stage.setWindow(viewX, viewY, w, h); stage.dim = 0; stage.dark = 0; stage.shakeX = stage.shakeY = 0;
      J.animate(me.phase, me.wb, t, dt, me.rb);
    },
  };
  const _v = new THREE.Vector3();
  return api;
}
