// lodpage_io.js: the page that shows Io at four weights side by side, and tries four of her at once with a crowd of foes.
// Made from the Fox's page script by tools/build_io_page.py. Levels are in lod_io.js; nothing here changes how she looks at Full.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('stage'), box = $('stagebox'), hud = $('hud'), err = $('err'), tags = $('tags');
  const touchPhone = (navigator.maxTouchPoints > 0 || /Mobi|Android|iPhone/i.test(navigator.userAgent)) && Math.min(screen.width, screen.height) < 820;
  const small = /#lite/.test(location.hash) ? true : /#full/.test(location.hash) ? false : touchPhone;
  const QS = new URLSearchParams(location.search), manual = QS.has('shot');
  const LV = WITCH_LOD.LEVELS, byId = {}; LV.forEach((L) => { byId[L.id] = L; });
  if (small) LV[0].opts = { detail: 0.75, textureScale: 0.75 };          // Full is what this device gets on her other pages: phones get the three-quarter model there
  // [id, label, half-width in meters the camera must show, half-height, camera by time: t -> [half-width, shift toward the target, half-height, height of the middle]]
  const STATES = [['idle', 'Standing', 0.55], ['walk', 'Walk', 0.55], ['run', 'Jog', 0.62]];
  // her spells and reactions, then her other moves, as on her own page. A spell is seen from her side, so she casts toward the right.
  const GAME = [['crescent', 'Harvest Crescent', 1.5, 1.2, () => [1.5, 0.6, 1.2, 0.92]], ['salve', 'Silverleaf Salve', 1.5, 1.2, () => [1.5, 0.6, 1.2, 0.92]], ['guardian', 'Elderwood Guardian', 2.0, 1.7, (t) => (t < 8.3 ? [1.5, -0.39, 1.25, 0.92] : t < 12.05 ? [2.0, -1.03, 1.7, 1.15] : [1.8, 0.74, 1.5, 0.97])],
    ['garden', 'Moonflower Garden', 2.0, 1.6, () => [2.0, 0, 1.6, 0.76]], ['thorn', 'Thornwake', 1.5, 1.2, () => [1.5, 0.6, 1.2, 0.92]], ['revive', 'Rootbound Return', 1.5, 1.2, () => [1.5, -0.42, 1.2, 0.62]], ['cradle', 'Bramble Cradle', 1.7, 1.45, () => [1.7, 0.3, 1.45, 1.12]],
    ['hit', 'Hit', 0.7], ['down', 'Down', 1.1, 1.1, () => [1.1, 0, 1.1, 0.72]], ['win', 'Win', 0.75, 1.2, () => [0.75, 0, 1.2, 0.98]]];
  const ACTS = [['talk', 'Talk', 0.58], ['read', 'Read her book', 0.6], ['glasses', 'Push up glasses', 0.6], ['hat', 'Tip her hat', 0.62], ['curtsey', 'Curtsey', 0.75], ['twirl', 'Twirl', 0.9], ['herb', 'Pick a herb', 0.8], ['wave', 'Wave', 0.65, 1.2, () => [0.65, 0, 1.2, 1.02]],
    ['look', 'Look round', 0.6], ['sickle', 'Hold her sickle', 0.7], ['squat', 'Squat', 0.8, 0.95, () => [0.8, 0, 0.95, 0.5]], ['kneel', 'Kneel', 0.8, 1.0, () => [0.8, 0, 1.0, 0.62]], ['hover', 'Hover', 0.8, 1.1, () => [0.8, 0, 1.1, 0.95]]];
  const ALL = STATES.concat(GAME, ACTS), find = (id) => ALL.find((x) => x[0] === id) || ALL[0];
  const SPELLS = { crescent: 1, salve: 1, guardian: 1, garden: 1, thorn: 1, revive: 1, cradle: 1 }, AIMED = { crescent: 1, guardian: 1, thorn: 1, cradle: 1 };

  let stage, SQ = null;
  try {
    if (!window.THREE) throw new Error('three.js did not load');
    stage = makeStage(canvas, { shadow: small ? 1024 : 2048, });      // the 56 colours every witch shares: her own page's note says she needs no more
    SQ = buildSquare(stage, { small });
  } catch (e) { err.hidden = false; err.textContent = 'This page needs WebGL to draw her. ' + (e && e.message ? e.message : ''); return; }
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); err.hidden = false; err.textContent = 'The graphics chip gave up on that much at once. That is the answer for that level on this device. Reload the page to go on.'; });
  const orbit = stage.orbit; orbit.az = 0; orbit.el = 0.10; orbit.target.y = 0.95;
  stage.look = 'smooth'; stage.square = false; stage.glow = false;
  stage.renderer.info.autoReset = false;
  // one light for every witch's spells: each copy of her has her own, and a scene with four of them would pay for four lights on every surface
  const spell = new THREE.PointLight(0xb060ff, 0, 3.2, 1.6); stage.scene.add(spell);

  // ---- the witches on stage ----
  const pool = {};                                   // level id -> the copies of her that exist at that level
  const stats = {};                                  // level id -> what one of her costs
  let units = [];                                    // who is in the picture now: { J, L, x, z, face, aim, cpu }
  let mode = { kind: 'four', id: 'lightest' }, state = 'idle', move = '', wb = 0, wbTo = 0, rb = 0, rbTo = 0, phase = 0, time = 0, building = '', slow = false, spin = false;
  function measure(J) {
    let calls = 0, sent = 0, shadowCalls = 0, shadowSent = 0, bytes = 0, pts = 0;
    const count = (o) => { if (!o.isMesh || !o.visible || !o.geometry || !o.geometry.index || (o.material && o.material.visible === false)) return; const n = Math.min(o.geometry.index.count, o.geometry.drawRange.count) / 3; if (!(n > 0)) return; for (let p = o.parent; p; p = p.parent) if (p.visible === false) return; calls++; sent += n; if (o.castShadow) { shadowCalls++; shadowSent += n; } };
    J.root.traverse(count); for (const c of J.debug.cloths) c.meshes.forEach(count);
    for (const t of J.debug.textures) { const im = t.image; if (im && im.width) bytes += im.width * im.height * 4 * 1.33; }
    for (const c of J.debug.cloths) pts += c.n;
    let tris = 0; for (const k in J.debug.meshes) tris += J.debug.meshes[k].geometry.index.count / 3; for (const c of J.debug.cloths) tris += c.tris;      // her own count leaves her flounces out
    return { tris, calls, shadowCalls, sent: sent + shadowSent, mb: bytes / 1048576, pts, cpu: 0, cpuN: 0 };
  }
  function build(id) {
    const L = byId[id], J = WITCH_LOD.make(L);
    J.fx.remove(J.spellLight); J.camera = stage.camera;
    stage.scene.add(J.root, J.fx);
    if (!stats[id]) stats[id] = measure(J); else { const m = measure(J); Object.assign(stats[id], { tris: m.tris, calls: m.calls, shadowCalls: m.shadowCalls, sent: m.sent, mb: m.mb, pts: m.pts }); }
    (pool[id] || (pool[id] = [])).push(J);
    return J;
  }
  function dispose(J) {
    stage.scene.remove(J.root, J.fx);
    const seen = new Set();
    for (const r of [J.root, J.fx]) r.traverse((o) => {
      if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
      const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of ms) { if (seen.has(m)) continue; seen.add(m); for (const k in m) { const v = m[k]; if (v && v.isTexture) v.dispose(); } if (m.uniforms) for (const u in m.uniforms) { const v = m.uniforms[u] && m.uniforms[u].value; if (v && v.isTexture) v.dispose(); } m.dispose(); }
    });
    for (const t of J.debug.textures) t.dispose();
    if (J.skeleton && J.skeleton.dispose) J.skeleton.dispose();
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // who the current mode needs: [level id, how many]
  function needs() { return mode.kind === 'fight' ? [[mode.id, 4]] : LV.map((L) => [L.id, 1]).reverse(); }
  let ensuring = 0;
  async function ensure() {
    const my = ++ensuring, want = needs(), keep = {}; want.forEach(([id, n]) => { keep[id] = n; });
    // on a phone, copies the picture no longer needs are let go, so four of one level never sit on top of all the others
    for (const id in pool) { const max = keep[id] != null ? keep[id] : (small ? 0 : 1); while (pool[id].length > max) dispose(pool[id].pop()); }
    layout();
    for (const [id, n] of want) {
      while ((pool[id] || []).length < n) {
        building = byId[id].name; paintTags(); await sleep(manual ? 0 : 30); if (my !== ensuring) return;
        try { build(id); } catch (e) { err.hidden = false; err.textContent = 'Could not build ' + byId[id].name + ': ' + (e && e.message ? e.message : e); building = ''; return; }
        layout(); fillTable();
      }
    }
    building = ''; layout(); fillTable();
  }
  // ---- foes for the fight test: plain hooded shades, about 2,000 triangles and three draws each (real foes will cost more) ----
  const foes = [], foeGroup = new THREE.Group(); stage.scene.add(foeGroup); foeGroup.visible = false;
  const foeParts = (() => {
    const lin = (h) => new THREE.Color(h).convertSRGBToLinear();
    const prof = [[0.02, 1.52], [0.13, 1.50], [0.19, 1.40], [0.21, 1.28], [0.24, 1.12], [0.25, 0.95], [0.27, 0.75], [0.31, 0.55], [0.36, 0.34], [0.42, 0.16], [0.44, 0.06], [0.40, 0.02]].map((p) => new THREE.Vector2(p[0], p[1]));
    const cloak = new THREE.LatheGeometry(prof, 40), hood = new THREE.SphereGeometry(0.2, 24, 16), eyes = new THREE.BufferGeometry();
    { const a = new THREE.SphereGeometry(0.022, 8, 6), p = [], ix = []; for (const sx of [-1, 1]) { const b = p.length / 3; for (let i = 0; i < a.attributes.position.count; i++) p.push(a.attributes.position.getX(i) + sx * 0.062, a.attributes.position.getY(i) + 1.62, a.attributes.position.getZ(i) + 0.165); for (let i = 0; i < a.index.count; i++) ix.push(a.index.array[i] + b); }
      eyes.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); eyes.setIndex(ix); eyes.computeVertexNormals(); }
    return { cloak, hood, eyes, mCloak: new THREE.MeshStandardMaterial({ color: lin('#2a2436'), roughness: 0.9, side: THREE.DoubleSide }), mHood: new THREE.MeshStandardMaterial({ color: lin('#1b1624'), roughness: 0.85 }),
      mEyes: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.3, 2.4), toneMapped: false }), tris: (cloak.index.count + hood.index.count + eyes.index.count) / 3 };
  })();
  function setFoes(n) {
    while (foes.length > n) { foeGroup.remove(foes.pop().g); }
    while (foes.length < n) {
      const i = foes.length, g = new THREE.Group(), c = new THREE.Mesh(foeParts.cloak, foeParts.mCloak), h = new THREE.Mesh(foeParts.hood, foeParts.mHood), e = new THREE.Mesh(foeParts.eyes, foeParts.mEyes);
      h.position.y = 1.6; c.castShadow = h.castShadow = true; c.receiveShadow = true; g.add(c, h, e);
      const col = i % 6, row = Math.floor(i / 6), k = 0.86 + 0.3 * ((i * 37) % 10) / 10;
      const x = 2.0 + row * 1.25 + ((i * 53) % 7) * 0.07, z = 1.3 - col * 1.05 + (row % 2) * 0.5 - ((i * 29) % 5) * 0.08;
      g.position.set(x, 0, z); g.scale.setScalar(k); g.rotation.y = -Math.PI / 2 + 0.3 * Math.sin(i * 2.1);
      foeGroup.add(g); foes.push({ g, x, z, k, ph: i * 1.7, hit: 0 });
    }
  }
  let foeN = 12;
  // ---- where everyone stands ----
  const SPOTS = [[-1.7, 1.3], [-3.1, 0.3], [-1.9, -1.0], [-3.4, -2.2]];
  function layout() {
    units = [];
    if (mode.kind === 'fight') { (pool[mode.id] || []).slice(0, 4).forEach((J, i) => units.push({ J, L: byId[mode.id], x: SPOTS[i][0], z: SPOTS[i][1], face: 0, aim: null, slot: i })); }
    else for (const L of LV) { const J = (pool[L.id] || [])[0]; if (J) units.push({ J, L, x: 0, z: 0, face: 0, aim: null, slot: 0 }); }
    for (const id in pool) pool[id].forEach((J) => { const on = units.some((u) => u.J === J); J.root.visible = on && J.fade > 0.001; J.fx.visible = on && J.fade > 0.001; if (!on) J.stop(); });
    for (const u of units) { u.J.root.position.set(u.x, 0, u.z); u.J.targetDist = 0; u.J.target = null; }
    const fight = mode.kind === 'fight'; foeGroup.visible = fight; if (fight) setFoes(foeN);
    const sc = stage.key.shadow.camera;
    if (fight) { sc.left = -7.5; sc.right = 9; sc.top = 6; sc.bottom = -5; sc.far = 24; stage.follow(0.6, -0.4); } else { sc.left = -1.7; sc.right = 1.7; sc.top = 2.3; sc.bottom = -0.5; sc.far = 12; stage.follow(0, 0); }
    sc.updateProjectionMatrix();
    paintTags(); press();
  }
  // which units a panel shows
  function panels() {
    const w = box.clientWidth, h = box.clientHeight;
    const only = (list) => () => { for (const u of units) { const on = list.indexOf(u) >= 0; u.J.root.visible = on; u.J.fx.visible = on; } };
    if (mode.kind === 'fight') return [{ x: 0, y: 0, w, h, show: only(units), units }];
    if (mode.kind === 'solo') { const u = units.filter((q) => q.L.id === mode.id); return [{ x: 0, y: 0, w, h, show: only(u), units: u, L: byId[mode.id] }]; }
    const wide = w / h > 1.3, out = [];
    LV.forEach((L, i) => {
      const u = units.filter((q) => q.L.id === L.id);
      const p = wide ? { x: Math.round(i * w / 4), y: 0, w: Math.round((i + 1) * w / 4) - Math.round(i * w / 4), h } : { x: (i % 2) * Math.round(w / 2), y: i < 2 ? Math.round(h / 2) : 0, w: i % 2 ? w - Math.round(w / 2) : Math.round(w / 2), h: i < 2 ? h - Math.round(h / 2) : Math.round(h / 2) };
      p.show = only(u); p.units = u; p.L = L; out.push(p);
    });
    return out;
  }
  const num = (n) => n >= 1e6 ? (n / 1e6).toFixed(2) + ' million' : n >= 1000 ? Math.round(n / 1000) + 'k' : String(Math.round(n));
  function paintTags() {
    const ps = panels(); let html = '';
    for (const p of ps) {
      if (!p.L) continue; const s = stats[p.L.id], top = box.clientHeight - p.y - p.h;
      html += '<div class="tag" style="left:' + (p.x + 6) + 'px;top:' + (top + 6) + 'px;max-width:' + (p.w - 12) + 'px"><b>' + p.L.name + '</b>' + (s ? '<span>' + num(s.tris) + ' triangles</span>' : '<span>' + (building === p.L.name ? 'building' : 'waiting') + '</span>') + '</div>';
      if (ps.length > 1) html += '<i class="rule" style="left:' + p.x + 'px;top:' + top + 'px;width:' + p.w + 'px;height:' + p.h + 'px"></i>';
    }
    if (mode.kind === 'fight') html += '<div class="tag" style="left:6px;top:6px"><b>Four at ' + byId[mode.id].name + '</b><span>' + (building ? 'building ' + (pool[mode.id] || []).length + ' of 4' : foes.length + ' foes') + '</span></div>';
    tags.innerHTML = html;
  }

  // ---- chips ----
  function chip(parent, label, on, pressed) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label; if (pressed != null) b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.addEventListener('click', () => on(b)); parent.appendChild(b); return b;
  }
  const showChips = {}, fightChips = {}, moveChips = {}, foeChips = {}, distChips = {};
  showChips.four = chip($('show'), 'All four', () => setMode({ kind: 'four' }), true);
  for (const L of LV) showChips[L.id] = chip($('show'), L.name, () => setMode({ kind: 'solo', id: L.id }), false);
  for (const L of LV) fightChips[L.id] = chip($('fight'), 'Four at ' + L.name, () => setMode({ kind: 'fight', id: L.id }), false);
  for (const n of [0, 12, 30]) foeChips[n] = chip($('foes'), n ? n + ' foes' : 'No foes', () => { foeN = n; if (mode.kind === 'fight') setFoes(n); press(); paintTags(); }, n === foeN);
  chip($('foes'), 'All cast at once', () => { if (mode.kind === 'fight') units.forEach((u, i) => castAt(u, 'crescent', i)); });
  for (const [id, label] of STATES) moveChips[id] = chip($('states'), label, () => setState(id), id === 'idle');
  for (const [id, label] of GAME) moveChips[id] = chip($('spells'), label, () => setMove(id), false);
  for (const [id, label] of ACTS) moveChips[id] = chip($('acts'), label, () => setMove(id), false);
  let zoomUser = 1, faceTo = 0, faceMode = 0, dist = 'close';
  const DIST = [['close', 'Close', 1, 0], ['fight', 'Fight distance', 2.6, 0], ['face', 'Face', 1, 1]];
  for (const [id, label, z, f] of DIST) distChips[id] = chip($('dist'), label, () => { dist = id; zoomUser = z; faceTo = f; press(); }, id === dist);
  function press() {
    for (const k in moveChips) moveChips[k].setAttribute('aria-pressed', k === state || k === move ? 'true' : 'false');
    showChips.four.setAttribute('aria-pressed', mode.kind === 'four'); for (const L of LV) { showChips[L.id].setAttribute('aria-pressed', mode.kind === 'solo' && mode.id === L.id); fightChips[L.id].setAttribute('aria-pressed', mode.kind === 'fight' && mode.id === L.id); }
    for (const n in foeChips) foeChips[n].setAttribute('aria-pressed', +n === foeN);
    for (const k in distChips) distChips[k].setAttribute('aria-pressed', k === dist);
    $('foes').classList.toggle('off', mode.kind !== 'fight');
  }
  let squareWas = false;
  function setMode(m) {
    const was = mode; mode = m;
    if (m.kind === 'fight' && was.kind !== 'fight') { squareWas = stage.square; setSquare(true); viewAz = -0.5; viewEl = 0.24; nextTurn = time + 1.2; }
    if (m.kind !== 'fight' && was.kind === 'fight') { setSquare(squareWas); viewAz = 0; viewEl = 0.10; }
    if (m.kind !== 'fight') { state = 'idle'; wbTo = rbTo = 0; }
    move = ''; for (const id in pool) pool[id].forEach((J) => { J.stop(); });
    ensure();
  }
  function setState(id) { if (mode.kind === 'fight') return; state = id; move = ''; wbTo = id === 'idle' ? 0 : 1; rbTo = id === 'run' ? 1 : 0; for (const u of units) u.J.stop(); press(); }
  function setMove(id) {
    if (mode.kind === 'fight') { const u = units[turn % Math.max(1, units.length)]; if (u) castAt(u, id, turn++); nextTurn = time + 2.4; return; }
    state = 'idle'; wbTo = rbTo = 0; move = id; for (const u of units) { u.J.standIns = true; u.J.play(id, true); } press();
    if (SPELLS[id]) { viewAz = id === 'garden' ? 0.10 : id === 'cradle' ? -0.6 : -1.02; viewEl = id === 'garden' ? 0.20 : 0.08; sideOn = true; } else if (sideOn) { viewAz = 0; viewEl = 0.10; sideOn = false; }
  }
  // ---- the fight test: the four take turns, each casting at a foe ----
  let FAZ = -0.6, turn = 0, nextTurn = 0; const TURN_MOVES = ['crescent', 'thorn', 'salve', 'crescent', 'cradle', 'thorn', 'garden'];
  function castAt(u, id, k) {
    const f = foes.length ? foes[(k * 7 + 3) % foes.length] : null;
    if (f && AIMED[id]) { const dx = f.x - u.x, dz = f.z - u.z; u.aim = Math.atan2(dx, dz); /* Io casts straight ahead */ u.J.targetDist = Math.hypot(dx, dz); u.foe = f; u.J.target = f.g; }
    else { u.aim = null; u.J.targetDist = 0; u.foe = null; u.J.target = null; }
    u.hitSeen = u.J.state.hitN || 0; u.J.standIns = false; u.J.play(id, true, true);      // in a fight a move plays once, and her training dummy and friends stay away
  }
  function fightStep(dt) {
    if (mode.kind !== 'fight' || building) return;
    if (time > nextTurn && units.length) { const u = units[turn % units.length]; if (!u.J.busy) { castAt(u, TURN_MOVES[turn % TURN_MOVES.length], turn); turn++; nextTurn = time + 5.2; } }
    for (const u of units) { const hn = u.J.state.hitN || 0; if (hn !== (u.hitSeen || 0)) { u.hitSeen = hn; if (u.foe) u.foe.hit = 1; } }
    for (const f of foes) { f.hit = Math.max(0, f.hit - dt * 2.2); f.g.position.y = 0.05 + 0.05 * Math.sin(time * 1.3 + f.ph); f.g.rotation.z = 0.05 * Math.sin(time * 0.9 + f.ph * 2) + 0.22 * f.hit * Math.sin(time * 30); f.g.scale.setScalar(f.k * (1 - 0.12 * f.hit)); }
  }
  // ---- switches ----
  const toggleRow = $('toggles');
  function setSquare(on) { stage.square = !!on; sqChip.setAttribute('aria-pressed', stage.square); }
  chip(toggleRow, 'Flipbook look', (b) => { stage.look = stage.look === 'flipbook' ? 'smooth' : 'flipbook'; b.setAttribute('aria-pressed', stage.look === 'flipbook'); box.classList.toggle('px', stage.look === 'flipbook'); fineSet(); }, false);
  const sqChip = chip(toggleRow, 'Night square', () => setSquare(!stage.square), false);
  chip(toggleRow, 'Glow', (b) => { stage.glow = !stage.glow && stage.glowOk; b.setAttribute('aria-pressed', stage.glow); }, false);
  chip(toggleRow, 'Shadows', (b) => { stage.key.castShadow = !stage.key.castShadow; b.setAttribute('aria-pressed', stage.key.castShadow); }, true);
  chip(toggleRow, 'Slow motion', (b) => { slow = !slow; b.setAttribute('aria-pressed', slow); }, false);
  chip(toggleRow, 'Turn the view', (b) => { spin = !spin; b.setAttribute('aria-pressed', spin); }, false);

  // The finer look. Pixel size slides from the flipbook's own (4.75 mm of her to a pixel, in whole screen pixels: the look as it has always
  // been) down to as fine as the screen. Colours slides from the smooth colours to the flipbook's own.
  function fineSet() {
    const v = +$('pix').value, mm = 4.75 * Math.pow(0.8 / 4.75, v / 100); stage.pixelWhole = v === 0; stage.mmPerPixel = v === 0 ? 4.75 : mm; stage.snap = +$('snap').value / 100;
    $('pixout').textContent = (v === 0 ? '4.75' : mm.toFixed(1)) + ' mm of her to a pixel' + (v === 0 ? ' (the flipbook look as it was)' : ''); $('snapout').textContent = $('snap').value + '%'; $('fine').hidden = stage.look !== 'flipbook';
  }
  $('pix').addEventListener('input', fineSet); $('snap').addEventListener('input', fineSet);
  // ---- orbit: drag to turn, pinch or wheel to zoom ----
  let viewAz = null, viewEl = null, sideOn = false;
  const pts = new Map(); let pinch0 = 0, zoom0 = 1;
  canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const a = [...pts.values()]; pinch0 = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); zoom0 = zoomUser; } viewAz = null; });
  canvas.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1]; pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) { orbit.az -= dx * 0.008; orbit.el = Math.max(-0.25, Math.min(1.2, orbit.el + dy * 0.006)); }
    else if (pts.size === 2) { const a = [...pts.values()], d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pinch0 > 0) zoomUser = Math.max(0.3, Math.min(4, zoom0 * pinch0 / d)); }
  });
  const up = (e) => { pts.delete(e.pointerId); pinch0 = 0; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoomUser = Math.max(0.3, Math.min(4, zoomUser * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
  function fit() {
    const r = box.getBoundingClientRect(), w = Math.max(50, Math.round(r.width)), h = Math.max(50, Math.round(r.height));
    stage.resize(w, h, Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2)); paintTags();
  }
  try { new ResizeObserver(fit).observe(box); } catch (e) { window.addEventListener('resize', fit); }
  fit();

  // ---- the table of what each level costs ----
  const tbody = $('costs'), thead = $('costhead');
  const big = (n) => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1000 ? Math.round(n / 1000) + 'k' : String(Math.round(n));
  const ROWS = [['Triangles in her', (s) => big(s.tris)], ['Triangles drawn each picture, with her shadow', (s) => big(s.sent)], ['Separate draws each picture', (s) => String(s.calls + s.shadowCalls)],
    ['Memory for her painted surfaces', (s) => Math.round(s.mb) + ' MB'], ['Time to work out her pose, each picture, on this device', (s) => (s.cpuN ? s.cpu.toFixed(s.cpu < 10 ? 2 : 1) + ' ms' : ''), 'cpu']];
  function fillTable() {
    thead.innerHTML = '<tr><th></th>' + LV.map((L) => '<th scope="col">' + L.name + '</th>').join('') + '</tr>';
    tbody.innerHTML = ROWS.map(([label, f, id]) => '<tr><th scope="row">' + label + '</th>' + LV.map((L) => { const st = stats[L.id]; return '<td' + (id ? ' id="' + id + '_' + L.id + '"' : '') + '>' + (st ? f(st) : building === L.name ? '…' : '') + '</td>'; }).join('') + '</tr>').join('');
  }
  fillTable();

  // ---- a frame ----
  let last = performance.now(), fpsMs = 16.7, hudT = 0, needHalf = 0.86, needV = 1.12, tyWant = 0.95, camX = 0;
  function frame(now) {
    requestAnimationFrame(frame); if (manual) return;
    const raw = now - last; last = now; if (raw < 500) fpsMs += (raw - fpsMs) * 0.08;
    let dt = Math.min(0.05, raw / 1000); if (slow) dt *= 0.5;
    advance(dt, true);
  }
  function advance(dt, draw) {
    time += dt;
    wb += (wbTo - wb) * Math.min(1, dt * 5); rb += (rbTo - rb) * Math.min(1, dt * 3.5); if (wb > 0.001) phase += dt * (4.9 + 4.1 * rb);
    const fight = mode.kind === 'fight', ps = panels();
    const live = []; for (const p of ps) for (const u of p.units) live.push(u);
    if (move && !fight && !live.some((u) => u.J.action || u.J.pending)) { move = ''; press(); }
    // camera: fit the move (or the whole field), ease to a chosen view, or turn slowly
    const lead = live[0] || null, sq = stage.square, pw = ps[0] ? ps[0].w : box.clientWidth, ph = ps[0] ? ps[0].h : box.clientHeight, asp = pw / ph;
    if (fight) { needHalf = 4.7; needV = 2.4; tyWant = 0.8; orbit.target.x += ((asp < 1 ? -0.9 : -0.1) - orbit.target.x) * Math.min(1, dt * 4); orbit.target.z += (-0.5 - orbit.target.z) * Math.min(1, dt * 4); if (viewAz != null) viewAz = asp < 1 ? FAZ : -0.5; if (asp < 1) needHalf = 3.9; }
    else { const m = find(move || state), cam = m[4] && lead && lead.J.action === m[0] ? m[4](lead.J.time) : null; const four = ps.length > 1;      // side by side the picture stays on her; alone, it opens out to take in the whole spell
      needHalf = cam ? cam[0] : m[2]; needV = (cam && cam[2]) || m[3] || 1.12; tyWant = (cam && cam[3]) || 0.95; if (four) { needHalf = Math.min(needHalf, 1.25); needV = Math.min(needV, 1.45); tyWant = Math.min(tyWant, 1.1); }
      camX += ((cam ? cam[1] * (four ? 0.35 : 1) : 0) - camX) * Math.min(1, dt * 3);
      orbit.target.x += (0 - orbit.target.x) * Math.min(1, dt * 5); orbit.target.z += (camX - orbit.target.z) * Math.min(1, dt * 5); }      // her spells reach forward, not sideways
    if (spin) orbit.az += dt * 0.5;
    if (viewAz != null) { let d = viewAz - orbit.az; d = Math.atan2(Math.sin(d), Math.cos(d)); orbit.az += d * Math.min(1, dt * 5); orbit.el += (viewEl - orbit.el) * Math.min(1, dt * 5); if (Math.abs(d) < 0.003) viewAz = null; }
    const fm = fight ? 0 : faceTo; faceMode += (fm - faceMode) * Math.min(1, dt * 4);
    const baseFov = sq ? 30 - 8 * faceMode : 22, th = Math.tan(baseFov * Math.PI / 360), fitDist = Math.max(needHalf / (th * asp), needV / th);
    let want = (fitDist * (1 - faceMode) + 2.05 * (22 / baseFov) * faceMode) * (fight ? Math.max(0.5, Math.min(1.6, zoomUser)) : zoomUser), fovTo = baseFov;
    orbit.target.y += ((tyWant * (1 - faceMode) + 1.53 * faceMode) - orbit.target.y) * Math.min(1, dt * 4);      // her face under her hat
    if (sq) {
      // the camera stays inside the ring of lanterns: where it cannot back away, it widens its lens instead
      const LIM = 7.5, ce = Math.cos(orbit.el), ux = Math.sin(orbit.az) * ce, uz = Math.cos(orbit.az) * ce, px = orbit.target.x, pz = orbit.target.z, uu = ux * ux + uz * uz;
      if (uu > 1e-5) { const b = px * ux + pz * uz, cc = px * px + pz * pz - LIM * LIM, disc = b * b - uu * cc, dmax = disc > 0 ? Math.max(0.6, (-b + Math.sqrt(disc)) / uu) : 0.6;
        if (want > dmax) { fovTo = Math.min(58, 2 * Math.atan(th * want / dmax) * 180 / Math.PI); want = dmax; } }
      const lowest = Math.asin(Math.max(-1, Math.min(1, (0.2 - orbit.target.y) / Math.max(0.5, orbit.dist)))); if (orbit.el < lowest) orbit.el = lowest;
    }
    orbit.dist += (want - orbit.dist) * Math.min(1, dt * 3.5); orbit.fov += (fovTo - orbit.fov) * Math.min(1, dt * 3.5);
    stage.camera.aspect = asp; stage.placeCamera();
    fightStep(dt);
    // every witch in the picture thinks for herself: her pose, her cloth, her spell. Each one's time is kept, to show what a level costs.
    let dim = 0, dark = 0, best = null;
    for (const u of live) {
      const J = u.J, s = stats[u.L.id];
      const to = J.action && AIMED[J.action] && u.aim != null ? u.aim : 0; let df = to - u.face; df = Math.atan2(Math.sin(df), Math.cos(df)); u.face += df * Math.min(1, dt * 8);
      J.root.rotation.y = u.face + J.spin;
      const t0 = performance.now();
      J.animate(fight ? 0 : phase, fight ? 0 : wb, time, dt, fight ? 0 : rb);
      const ms = performance.now() - t0; s.cpuN++; s.cpu += (ms - s.cpu) * (s.cpuN < 20 ? 1 / s.cpuN : 0.04);
      dim = Math.max(dim, J.dim || 0); dark = Math.max(dark, J.dark || 0);
      if (!best || J.spellLight.intensity > best.intensity) best = J.spellLight;
    }
    if (best) { spell.position.copy(best.position); spell.color.copy(best.color); spell.intensity = best.intensity; } else spell.intensity = 0;
    if (sq) { SQ.flies(time); const k = Math.max(dark, 0.55 * dim); stage.dark = 1 - Math.pow(1 - 0.97 * k, 2); SQ.spell.position.copy(spell.position); SQ.spell.color.copy(spell.color); SQ.spell.intensity = spell.intensity * 1.3; }
    stage.dim = dim;
    if (draw) { const info = stage.renderer.info; info.reset(); stage.renderPanels(ps); lastCalls = info.render.calls; lastTris = info.render.triangles; }
    hudT += dt;
    if (hudT > 0.4 || !draw) { hudT = 0;
      hud.textContent = (building ? 'Building ' + building + ' · ' : '') + Math.round(1000 / fpsMs) + ' pictures a second';
      $('frameNote').textContent = 'In the picture now: ' + num(lastTris) + ' triangles drawn in ' + lastCalls + ' separate draws, ' + Math.round(1000 / fpsMs) + ' times a second.';
      for (const L of LV) { const c = $('cpu_' + L.id), s = stats[L.id]; if (c && s && s.cpuN) c.textContent = s.cpu.toFixed(s.cpu < 10 ? 2 : 1) + ' ms'; } }
  }
  let lastCalls = 0, lastTris = 0;
  press();
  const start = () => { ensure(); requestAnimationFrame((t) => { last = t; frame(t); }); };
  // the lighter levels need the thinning step; if a browser will not run it they still build, heavier, and the page says so
  const noThin = () => { WITCH_LOD.thin = false; $('thinNote').hidden = false; start(); };
  if (window.MeshoptSimplifier && MeshoptSimplifier.supported && MeshoptSimplifier.ready) MeshoptSimplifier.ready.then(start, noThin); else noThin();
  // for checking the page from a script: step time by hand, change what is shown, read the numbers
  window.LODPAGE = { advance(n, dt) { for (let i = 0; i < n; i++) advance(dt || 1 / 30, i === n - 1); }, setMode, setMove, setState, stats, get building() { return building; }, get units() { return units; }, stage, orbit,
    set(o) { if (o.zoom != null) zoomUser = o.zoom; if (o.face != null) faceTo = o.face; if (o.az != null) { orbit.az = o.az; viewAz = null; } if (o.el != null) orbit.el = o.el; if (o.look) { stage.look = o.look; box.classList.toggle('px', o.look === 'flipbook'); fineSet(); } if (o.pix != null) { $('pix').value = o.pix; fineSet(); } if (o.snap != null) { $('snap').value = o.snap; fineSet(); } if (o.square != null) setSquare(o.square); if (o.glow != null) stage.glow = o.glow && stage.glowOk; if (o.faz != null) { FAZ = o.faz; viewAz = FAZ; } if (o.foes != null) { foeN = o.foes; if (mode.kind === 'fight') setFoes(foeN); paintTags(); } },
    info() { return { calls: lastCalls, tris: lastTris }; } };
})();
