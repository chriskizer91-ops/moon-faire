// app.js: the viewer. Builds the stage and the Jester, wires the move chips, orbit, the flipbook inset and pixel mode.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('stage'), box = $('stagebox'), hud = $('hud'), err = $('err');
  // What she can do. States are how she holds herself and stay until changed; moves and spells play once over whatever state she is in.
  // Each: [id, label, half-width in meters the camera must show, half-height (optional), camera by time (optional): t -> [half-width, shift toward the target]]
  const STATES = [['idle', 'Stand', 0.7], ['walk', 'Walk', 0.7], ['run', 'Run', 0.8], ['kneel', 'Kneel', 0.7], ['squat', 'Squat', 0.7], ['sit_chair', 'Sit on a stool', 0.7], ['sit_ground', 'Sit on the ground', 0.7], ['hover', 'Hover', 0.75]];
  // Her own moves (13 Nov): her talk, laugh and dance, a curtsey where the Jester bows and a pounce where the Jester twirls. Names are working names.
  const ACTS = [['jump', 'Jump', 0.9, 1.42], ['talk', 'Talk', 0.8], ['laugh', 'Laugh', 0.8], ['dance', 'Dance', 1.0], ['curtsey', 'Curtsey', 0.9], ['pounce', 'Pounce', 1.0, 1.32], ['wave', 'Wave', 0.8]];
  // The Jester's versions she was forked with, kept one row down to compare against until Chris says to drop them.
  const OLD = [['jester_talk', 'Talk', 0.8], ['jester_laugh', 'Laugh', 0.8], ['jester_dance', 'Dance', 0.95], ['jester_bow', 'Bow', 0.95], ['jester_twirl', 'Twirl', 1.15]];
  const QUIET = [['look_around', 'Stand', 0.7], ['settle', 'Stand', 0.7]];      // small things she does by herself when left standing
  const SPELLS = [];      // the Fox has no spells yet (pass 1): the row and the cast buttons stay hidden until she does
  const ALL = STATES.concat(ACTS, OLD, SPELLS, QUIET), find = (id) => ALL.find((x) => x[0] === id);
  const VIEWS = [['Front', 0, 0.10, 1], ['Three-quarter', -0.62, 0.14, 1], ['Side', -1.5708, 0.08, 1], ['Back', 3.1416, 0.12, 1], ['Face', 0.22, 0.02, 0.27]];
  const touchPhone = (navigator.maxTouchPoints > 0 || /Mobi|Android|iPhone/i.test(navigator.userAgent)) && Math.min(screen.width, screen.height) < 820;
  // The address after # says which build to show: lite or full (phones get the lighter model unless told otherwise). The switch below writes it and
  // reloads. Her head size and face reshaping were switches here while Chris chose (13 Nov); what he chose is now built into the model.
  const HASH = location.hash, small = /lite/.test(HASH) ? true : /full/.test(HASH) ? false : touchPhone;
  const goHash = (o) => { const v = Object.assign({ small }, o); location.hash = '#' + (v.small ? 'lite' : 'full'); location.reload(); };
  let stage, J, JO = null;
  try {
    if (!window.THREE) throw new Error('three.js did not load');
    JO = { detail: small ? 0.75 : 1, textureScale: small ? 0.75 : 1 };
    stage = makeStage(canvas, { shadow: small ? 1024 : 2048 });
    J = makeFox(JO);
    stage.scene.add(J.root, J.fx);
  } catch (e) { err.hidden = false; err.textContent = 'This page needs WebGL to draw her. ' + (e && e.message ? e.message : ''); return; }
  const orbit = stage.orbit; orbit.az = 0; orbit.el = 0.10; orbit.target.y = 0.95;
  let state = 'idle', move = '', wb = 0, wbTo = 0, rb = 0, rbTo = 0, phase = 0, time = 0, spin = false, slow = false, showBook = true;
  stage.look = 'smooth';      // the painted face and fabrics show in the smooth look; the flipbook look is a switch
  let needHalf = 0.86, needV = 1.12, camX = 0, zoomUser = 1, faceMode = 0, faceTo = 0, viewAz = null, viewEl = null, last = performance.now();

  // ---- chips ----
  const viewRow = $('views'), toggleRow = $('toggles');
  function chip(parent, label, on, pressed) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label; if (pressed != null) b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.addEventListener('click', () => on(b)); parent.appendChild(b); return b;
  }
  const moveChips = {};
  for (const [id, label] of STATES) moveChips[id] = chip($('states'), label, () => setState(id), id === 'idle');
  for (const [id, label] of ACTS) moveChips[id] = chip($('acts'), label, () => setMove(id), false);
  for (const [id, label] of OLD) moveChips[id] = chip($('olds'), label, () => setMove(id), false);
  for (const [id, label] of SPELLS) moveChips[id] = chip($('spells'), label, () => setMove(id), false);
  const press = () => { for (const k in moveChips) moveChips[k].setAttribute('aria-pressed', k === state || k === move ? 'true' : 'false'); };
  function setState(id) {
    state = id; faceTo = 0; wbTo = id === 'walk' || id === 'run' ? 1 : 0; rbTo = id === 'run' ? 1 : 0;
    J.setStance(J.STANCES.indexOf(id) >= 0 ? id : '');
    if (move === 'jump') { J.stop(); move = ''; }
    press(); bookT0 = time;
  }
  function setMove(id) {
    if (id === 'idle' || id === 'walk') { J.stop(); move = ''; return setState(id); }      // kept for older callers
    if (roam.on && dummy.visible && AIMED[id]) { const dx = dummy.position.x - roam.x, dz = dummy.position.z - roam.z; roam.aim = Math.atan2(-dz, dx); J.targetDist = Math.hypot(dx, dz); } else { roam.aim = null; J.targetDist = 0; }
    move = id; faceTo = 0; J.play(id, true);
    if (J.stance === '' && J.STANCES.indexOf(state) >= 0) state = 'idle';             // a jump stands her up first
    press(); bookT0 = time;
  }
  for (const [label, az, el, face] of VIEWS) chip(viewRow, label, () => { viewAz = az; viewEl = el; faceTo = face < 1 ? 1 : 0; spin = false; spinChip.setAttribute('aria-pressed', 'false'); });
  // ---- walking her around: a pad on the stage (or W A S D / arrows, Shift to run, Space to jump); she moves the way the pad points, as the camera sees it ----
  const ROAM_R = 2.85, WALKS = { talk: 1, jump: 1, wave: 1, laugh: 1, jester_talk: 1, jester_laugh: 1 };            // moves she can make while walking
  const roam = { on: false, x: 0, z: 0, face: 0, vx: 0, vz: 0, jx: 0, jy: 0, keys: {}, idleT: 0, idleNext: 7 };
  const joy = $('joy'), knob = $('knob'); let joyId = null;
  const joySet = (e) => { const r = joy.getBoundingClientRect(), R = r.width / 2; let x = (e.clientX - r.left - R) / (R * 0.72), y = (e.clientY - r.top - R) / (R * 0.72); const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; } roam.jx = x; roam.jy = -y; knob.style.transform = 'translate(' + (x * R * 0.72) + 'px,' + (y * R * 0.72) + 'px)'; };
  const joyEnd = (e) => { if (e.pointerId !== joyId) return; joyId = null; roam.jx = roam.jy = 0; knob.style.transform = ''; };
  joy.addEventListener('pointerdown', (e) => { joyId = e.pointerId; joy.setPointerCapture(e.pointerId); joySet(e); e.preventDefault(); e.stopPropagation(); });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === joyId) { joySet(e); e.preventDefault(); } });
  joy.addEventListener('pointerup', joyEnd); joy.addEventListener('pointercancel', joyEnd);
  const KEYS = { KeyW: 'u', ArrowUp: 'u', KeyS: 'd', ArrowDown: 'd', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', ShiftLeft: 'run', ShiftRight: 'run' };
  addEventListener('keydown', (e) => { if (e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey || e.repeat && !KEYS[e.code]) return; if (quickKey(e.code)) { e.preventDefault(); return; } if (!roam.on) return; const k = KEYS[e.code]; if (k) { roam.keys[k] = 1; e.preventDefault(); } });
  addEventListener('keyup', (e) => { const k = KEYS[e.code]; if (k) roam.keys[k] = 0; });
  addEventListener('blur', () => { roam.keys = {}; });
  const roamChip = chip(toggleRow, 'Walk around', (b) => {
    roam.on = !roam.on; b.setAttribute('aria-pressed', roam.on); joy.hidden = !roam.on; JO.treadmill = roam.on ? false : undefined; stage.lanterns.visible = roam.on; dummy.visible = roam.on && dummyOn; J.targetDist = 0;
    spin = false; spinChip.setAttribute('aria-pressed', 'false');
    if (roam.on) { if (state === 'walk' || state === 'run') setState('idle'); viewAz = orbit.az; viewEl = 0.22; }
    else { roam.x = roam.z = roam.face = roam.vx = roam.vz = roam.jx = roam.jy = 0; roam.keys = {}; J.root.position.set(0, 0, 0); J.root.rotation.y = 0; orbit.target.z = 0; stage.follow(0, 0); if (state === 'idle') { wbTo = rbTo = 0; } viewAz = 0; viewEl = 0.10; }
  }, false);
  $('states').prepend(roamChip);                    // first in the Body row, right under the stage
  function roamStep(dt) {
    let ix = roam.jx + (roam.keys.r ? 1 : 0) - (roam.keys.l ? 1 : 0), iy = roam.jy + (roam.keys.u ? 1 : 0) - (roam.keys.d ? 1 : 0), mag = Math.hypot(ix, iy);
    if (mag > 1) { ix /= mag; iy /= mag; mag = 1; }
    const keysOn = roam.keys.u || roam.keys.d || roam.keys.l || roam.keys.r; if (keysOn && !roam.keys.run && mag > 0.55) { ix *= 0.55 / mag; iy *= 0.55 / mag; mag = 0.55; }
    const a = J.action;
    if (mag > 0.08) {
      if (a && !WALKS[a] && find(a) && QUIET.indexOf(find(a)) >= 0) J.stop();          // a small idle thing gives way at once
      if (J.STANCES.indexOf(state) >= 0) setState('idle');                              // she gets up before she goes
    }
    const free = !J.stanceNow && !J.stance && !(J.action && !WALKS[J.action]) && !J.pending;
    if (!free) mag = 0;
    const run = Math.max(0, Math.min(1, (mag - 0.6) / 0.35)), speed = mag < 0.08 ? 0 : (0.32 + 0.52 * Math.min(1, mag / 0.6)) * (1 - run) + 2.3 * run;
    const fx = -Math.sin(orbit.az), fz = -Math.cos(orbit.az), rx = Math.cos(orbit.az), rz = -Math.sin(orbit.az), m = mag > 1e-4 ? speed / mag : 0;
    const tx = (rx * ix + fx * iy) * m, tz = (rz * ix + fz * iy) * m, k = Math.min(1, dt * 7);
    roam.vx += (tx - roam.vx) * k; roam.vz += (tz - roam.vz) * k;
    const v = Math.hypot(roam.vx, roam.vz);
    roam.x += roam.vx * dt; roam.z += roam.vz * dt;
    const d = Math.hypot(roam.x, roam.z); if (d > ROAM_R) { roam.x *= ROAM_R / d; roam.z *= ROAM_R / d; }      // the edge of the stage
    if (J.action && AIMED[J.action] && roam.aim != null) { let df = roam.aim - roam.face; df = Math.atan2(Math.sin(df), Math.cos(df)); roam.face += df * Math.min(1, dt * 10); }
    else if (v > 0.06) { let df = Math.atan2(roam.vx, roam.vz) - roam.face; df = Math.atan2(Math.sin(df), Math.cos(df)); roam.face += df * Math.min(1, dt * 9); }
    wbTo = Math.min(1, v / 0.3); rbTo = Math.max(0, Math.min(1, (v - 1.0) / 1.0));
    wb += (wbTo - wb) * Math.min(1, dt * 8); rb += (rbTo - rb) * Math.min(1, dt * 5);
    if (wb > 0.001) phase += dt * Math.max(2.0, v * (7.66 * (1 - rb) + 4.2 * rb));       // her feet keep pace with the ground she covers
    J.root.position.set(roam.x, 0, roam.z); J.root.rotation.y = roam.face + J.spin;
    const share = dummy.visible && J.action && AIMED[J.action] ? 0.42 : 0, cx = roam.x + (dummy.position.x - roam.x) * share, cz = roam.z + (dummy.position.z - roam.z) * share; roam.wide = share ? Math.hypot(dummy.position.x - roam.x, dummy.position.z - roam.z) * 0.62 + 0.7 : 0;
    orbit.target.x += (cx - orbit.target.x) * Math.min(1, dt * 5); orbit.target.z += (cz - orbit.target.z) * Math.min(1, dt * 5); stage.follow(roam.x, roam.z);
    return v;
  }
  const spinChip = chip(toggleRow, 'Turntable', (b) => { spin = !spin; viewAz = null; b.setAttribute('aria-pressed', spin); }, false);
  // the layers worn over the base outfit (veils, ribbon strands, shawl, shoulder kerchiefs) can be taken off, to work on the outfit beneath
  let outerOn = true;
  chip(toggleRow, 'Full detail', () => goHash({ small: !small }), !small);
  // two things Chris is choosing between by eye (13 Nov): the head's depth-only reshaping, and a larger head
  chip(toggleRow, 'Half speed', (b) => { slow = !slow; b.setAttribute('aria-pressed', slow); }, false);

  // ---- orbit: drag to turn, pinch or wheel to zoom ----
  const pts = new Map(); let pinch0 = 0, zoom0 = 1;
  canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const a = [...pts.values()]; pinch0 = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); zoom0 = zoomUser; } viewAz = null; });
  canvas.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1]; pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) { orbit.az -= dx * 0.008; orbit.el = Math.max(-0.25, Math.min(1.2, orbit.el + dy * 0.006)); }
    else if (pts.size === 2) { const a = [...pts.values()], d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pinch0 > 0) zoomUser = Math.max(0.3, Math.min(2.2, zoom0 * pinch0 / d)); }
  });
  const up = (e) => { pts.delete(e.pointerId); pinch0 = 0; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoomUser = Math.max(0.3, Math.min(2.2, zoomUser * Math.exp(e.deltaY * 0.0012))); }, { passive: false });

  // ---- size ----
  function fit() {
    const r = box.getBoundingClientRect(), w = Math.max(50, Math.round(r.width)), h = Math.max(50, Math.round(r.height));
    const pr = Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2);
    stage.resize(w, h, pr);
  }
  try { new ResizeObserver(fit).observe(box); } catch (e) { window.addEventListener('resize', fit); }
  fit();

  // ---- the flipbook inset: her drawn frame for the same moment of the same move ----
  const book = $('book'), bctx = book.getContext('2d'), imgs = {}; let bookT0 = 0, bookClip = '';
  function loadClip(id) { const c = FB.clips[id]; if (!c) return; for (const n of c.frames) if (!imgs[n]) { const im = new Image(); im.src = (window.FBDATA && window.FBDATA[n]) || ('fb/' + n + '.webp'); imgs[n] = im; } }
  function drawBook() {
    const id = move || state, c = FB.clips[id], want = !c; if (book.hidden !== want) book.hidden = want;       // only her drawn moves have a flipbook frame to show
    if (!c) return;
    if (bookClip !== id) { bookClip = id; loadClip(id); }
    const t = !move ? time : (J.action === id ? J.time : -1);
    let i = t < 0 ? 0 : Math.floor(t * c.fps); i = !move ? i % c.frames.length : Math.min(c.frames.length - 1, i);
    const n = c.frames[i], im = imgs[n], f = FB.frames[n], W = book.width, H = book.height;
    bctx.clearRect(0, 0, W, H); if (!im || !im.complete || !im.naturalWidth) return;
    const k = (H * 0.92) / 215, wide = id === 'gilded_rebuke' || id === 'hush' || id === 'gravity' ? 0.36 : 0.5;
    bctx.imageSmoothingEnabled = true; bctx.drawImage(im, W * wide - f[2] * k, H * 0.97 - f[3] * k, f[0] * k, f[1] * k);
  }

  // ---- quick buttons on the stage: cast the chosen spell, step through the spells, jump, and a flourish; keys: 1 to 0 cast, Q and E choose, F casts, R flourish, Space jumps ----
  const FLOUR = ['curtsey', 'pounce', 'laugh', 'dance', 'talk', 'wave']; let qi = 1, fi = 0;
  const qName = $('qName'), qShow = () => { qName.textContent = SPELLS.length ? SPELLS[qi][1] : ''; };
  const qStep = (d) => { if (!SPELLS.length) return; qi = (qi + d + SPELLS.length) % SPELLS.length; qShow(); };
  const qCast = () => { if (SPELLS.length) setMove(SPELLS[qi][0]); }, qFlour = () => { setMove(FLOUR[fi]); fi = (fi + 1) % FLOUR.length; };
  $('qPrev').addEventListener('click', () => qStep(-1)); $('qNext').addEventListener('click', () => qStep(1)); $('qCast').addEventListener('click', qCast); $('qJump').addEventListener('click', () => setMove('jump')); $('qMove').addEventListener('click', qFlour);
  for (const id of ['pad2', 'joy']) $(id).addEventListener('pointerdown', (e) => e.stopPropagation());
  const DIG = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
  function quickKey(code) {
    const d = DIG.indexOf(code); if (d >= 0 && d < SPELLS.length) { qi = d; qShow(); qCast(); return true; }
    if (code === 'KeyQ') { qStep(-1); return true; } if (code === 'KeyE') { qStep(1); return true; } if (code === 'KeyF' || code === 'Enter') { qCast(); return true; } if (code === 'KeyR') { qFlour(); return true; }
    if (code === 'Space') { setMove('jump'); return true; }
    return false;
  }
  qShow();
  // ---- a practice dummy to cast at (with Walk around): she turns to put it on her casting side, the spell goes to where it stands, and it rocks when struck ----
  const AIMED = { sealed_fate: 1, gilded_rebuke: 1, hush: 1, gravity: 1, ill_omen: 1, stop: 1, last_toll: 1 };
  const lin = (h) => new THREE.Color(h).convertSRGBToLinear(), dummy = new THREE.Group(), dBody = new THREE.Group(), dState = { rx: 0, rz: 0, vx: 0, vz: 0, flash: 0 }; let dummyOn = true;
  dummy.add(dBody); dummy.position.set(1.9, 0, -0.25); dummy.visible = false; stage.scene.add(dummy);
  const sackM = new THREE.MeshStandardMaterial({ color: lin(0x9a7d55), roughness: 0.95, emissive: lin(0xb070ff), emissiveIntensity: 0 });
  { const wood = new THREE.MeshStandardMaterial({ color: lin(0x4a3020), roughness: 0.7 }), rope = new THREE.MeshStandardMaterial({ color: lin(0x5e4a32), roughness: 0.9 }), mark = new THREE.MeshStandardMaterial({ color: lin(0x7a2a4a), roughness: 0.8 });
    const mk = (par, g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; par.add(o); return o; };
    mk(dummy, new THREE.CylinderGeometry(0.25, 0.30, 0.06, 24), wood, 0, 0.03, 0);
    mk(dBody, new THREE.CylinderGeometry(0.034, 0.046, 0.86, 12), wood, 0, 0.46, 0);
    mk(dBody, new THREE.SphereGeometry(1, 24, 18), sackM, 0, 1.10, 0).scale.set(0.19, 0.30, 0.15);
    mk(dBody, new THREE.CylinderGeometry(0.027, 0.027, 0.80, 10), wood, 0, 1.27, 0).rotation.z = Math.PI / 2;
    mk(dBody, new THREE.SphereGeometry(0.115, 20, 16), sackM, 0, 1.53, 0);
    for (const [y, r] of [[1.405, 0.062], [0.84, 0.10], [1.27, 0.045]]) mk(dBody, new THREE.TorusGeometry(r, 0.011, 8, 20), rope, 0, y, 0).rotation.x = Math.PI / 2;
    for (const r of [0.085, 0.045]) { const t = mk(dBody, new THREE.TorusGeometry(r, 0.008, 6, 24), mark, -0.19 * 0.96, 1.12, 0); t.rotation.y = Math.PI / 2; t.scale.z = 0.5; }      // a painted mark on the side she strikes
  }
  const dummyChip = chip(toggleRow, 'Dummy', (b) => { dummyOn = !dummyOn; b.setAttribute('aria-pressed', dummyOn); dummy.visible = roam.on && dummyOn; }, true);
  function dummyStep(dt) {
    const d = dState; d.vx += (-70 * d.rx - 5.5 * d.vx) * dt; d.vz += (-70 * d.rz - 5.5 * d.vz) * dt; d.rx += d.vx * dt; d.rz += d.vz * dt; d.flash *= Math.exp(-dt * 4.5);
    dBody.rotation.set(d.rx, 0, d.rz); sackM.emissiveIntensity = 1.6 * d.flash;
  }
  function dummyHit(k) { const dx = dummy.position.x - roam.x, dz = dummy.position.z - roam.z, L = Math.hypot(dx, dz) || 1, p = 2.2 + 4.2 * k; dState.vx += dz / L * p; dState.vz += -dx / L * p; dState.flash = Math.min(1, 0.4 + k); }
  // ---- what a spell does to the room: the picture jolts or sways, light flashes from where it lands, and motes cross the whole stage ----
  const sfx = $('sfx'), sg = sfx.getContext('2d'), MOTES = [], calm = matchMedia('(prefers-reduced-motion: reduce)').matches, _hp = new THREE.Vector3();
  const LOOK = { last_toll: ['214,222,255', 'rain', 1], gravity: ['176,116,255', 'fall', 1], stop: ['208,182,255', 'hold', 1], gilded_rebuke: ['255,206,112', 'burst', 0], curtain_call: ['255,206,112', 'confetti', 0], sealed_fate: ['192,124,255', 'burst', 0],
    hush: ['206,188,255', 'inward', 1], ill_omen: ['156,84,236', 'burst', 0], royal_reversal: ['216,222,255', 'rise', 0], against_all_odds: ['255,216,132', 'rise', 0], jump: ['226,210,255', 'dust', 0] };
  let shakeK = 0, swayK = 0, swayT = 9, flashK = 0, flashC = '200,150,255', flashX = 0.5, flashY = 0.5, hitSeen = 0;
  const R = Math.random, mote = (x, y, vx, vy, life, size, c, o) => { if (MOTES.length < 420) MOTES.push(Object.assign({ x, y, vx, vy, life, max: life, size, c, g: 0, drag: 0, kind: 0, a: R() * 6.28, w: 0 }, o || {})); };
  function roomHit(name, k) {
    const L = LOOK[name] || ['220,200,255', 'burst', 0], W = sfx.width, H = sfx.height, u = W / 400, c = L[0];
    let hx = 0.5, hy = 0.5; try { J.anchor(name === 'jump' ? 'feet' : 'hit', _hp).project(stage.camera); if (Math.abs(_hp.x) < 1.4 && Math.abs(_hp.y) < 1.4) { hx = _hp.x * 0.5 + 0.5; hy = -_hp.y * 0.5 + 0.5; } } catch (e) {}
    const x0 = hx * W, y0 = hy * H;
    if (!calm) { shakeK = Math.max(shakeK, k); if (L[2]) { swayK = k; swayT = 0; } }
    if (name !== 'jump') { flashK = 0.55 * k + 0.15; flashC = c; flashX = hx; flashY = hy; }
    const n = Math.round((L[1] === 'dust' ? 22 : 60 + 70 * k) * (small ? 0.7 : 1));
    for (let i = 0; i < n; i++) {
      const a = R() * 6.283, sp = (120 + 620 * R() * R()) * u * (0.6 + k);
      if (L[1] === 'burst') mote(x0, y0, Math.cos(a) * sp, Math.sin(a) * sp, 0.5 + 0.8 * R(), (1.2 + 2.6 * R()) * u, c, { drag: 2.4, g: 120 * u });
      else if (L[1] === 'rain') mote(R() * W, -R() * H * 0.9, (R() - 0.5) * 30 * u, (90 + 260 * R()) * u, 1.6 + 1.4 * R(), (0.9 + 1.8 * R()) * u, R() < 0.25 ? '255,255,255' : c, { w: 2 + 3 * R() });
      else if (L[1] === 'fall') mote(R() * W, R() * H * 0.8, 0, (500 + 700 * R()) * u, 0.45 + 0.4 * R(), (1 + 1.4 * R()) * u, c, { kind: 1, g: 900 * u });
      else if (L[1] === 'hold') mote(R() * W, R() * H, 0, 0, 0.9 + 0.7 * R(), (1 + 2.4 * R()) * u, R() < 0.3 ? '255,255,255' : c, { w: 6 + 6 * R() });
      else if (L[1] === 'inward') { const r0 = (0.5 + 0.5 * R()) * Math.hypot(W, H) * 0.6; mote(x0 + Math.cos(a) * r0, y0 + Math.sin(a) * r0, -Math.cos(a) * r0 * 1.5, -Math.sin(a) * r0 * 1.5, 0.55 + 0.25 * R(), (1 + 2 * R()) * u, c, { drag: 0.6 }); }
      else if (L[1] === 'rise') mote(R() * W, H * (0.45 + 0.6 * R()), (R() - 0.5) * 40 * u, -(60 + 190 * R()) * u, 1.3 + 1.2 * R(), (1 + 2.2 * R()) * u, R() < 0.3 ? '255,255,255' : c, { w: 2 + 2 * R() });
      else if (L[1] === 'confetti') mote(R() * W, -R() * H * 0.7, (R() - 0.5) * 70 * u, (60 + 130 * R()) * u, 2.2 + 1.6 * R(), (2.4 + 2.6 * R()) * u, R() < 0.5 ? '255,206,112' : R() < 0.5 ? '190,120,255' : '236,110,150', { kind: 2, w: 3 + 4 * R(), g: 40 * u });
      else mote(x0 + (R() - 0.5) * 60 * u, y0, (R() - 0.5) * 300 * u, -R() * 40 * u, 0.5 + 0.4 * R(), (1.4 + 2 * R()) * u, c, { drag: 3 });
    }
  }
  function roomStep(dt) {
    const hn = J.state.hitN || 0; if (hn !== hitSeen) { hitSeen = hn; const nm = J.state.hitName, k = J.state.hitK || 0.5; roomHit(nm, k); if (dummy.visible && AIMED[nm]) dummyHit(k); }
    dummyStep(dt);
    const bw = canvas.clientWidth, bh = canvas.clientHeight, pr = Math.min(1.5, devicePixelRatio || 1), W = Math.round(bw * pr), H = Math.round(bh * pr); if (sfx.width !== W || sfx.height !== H) { sfx.width = W; sfx.height = H; }
    shakeK *= Math.exp(-dt * 6.5); swayT += dt; flashK *= Math.exp(-dt * 5);
    const sw = swayK * Math.exp(-swayT * 2.0), rot = Math.sin(swayT * 7.5) * 0.9 * sw + (R() - 0.5) * 0.5 * shakeK, ox = (R() - 0.5) * 18 * shakeK, oy = (R() - 0.5) * 18 * shakeK, sc = 1 + 0.018 * shakeK + 0.03 * sw * (0.5 + 0.5 * Math.cos(swayT * 7.5));
    canvas.style.transform = shakeK > 0.004 || sw > 0.004 ? 'translate(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px) rotate(' + rot.toFixed(3) + 'deg) scale(' + sc.toFixed(4) + ')' : '';
    sg.clearRect(0, 0, W, H);
    if (flashK > 0.01) { const g = sg.createRadialGradient(flashX * W, flashY * H, 0, flashX * W, flashY * H, Math.max(W, H) * 0.8); g.addColorStop(0, 'rgba(' + flashC + ',' + (0.55 * flashK).toFixed(3) + ')'); g.addColorStop(0.5, 'rgba(' + flashC + ',' + (0.16 * flashK).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + flashC + ',0)'); sg.fillStyle = g; sg.fillRect(0, 0, W, H); }
    sg.globalCompositeOperation = 'lighter';
    for (let i = MOTES.length - 1; i >= 0; i--) {
      const m = MOTES[i]; m.life -= dt; if (m.life <= 0) { MOTES[i] = MOTES[MOTES.length - 1]; MOTES.pop(); continue; }
      m.vy += m.g * dt; if (m.drag) { const f = Math.exp(-m.drag * dt); m.vx *= f; m.vy *= f; } m.a += m.w * dt; m.x += (m.vx + (m.w ? Math.sin(m.a) * 14 : 0)) * dt; m.y += m.vy * dt;
      const al = Math.min(1, m.life / m.max * 2.2) * Math.min(1, (m.max - m.life) * 8) * (m.w > 5 ? 0.6 + 0.4 * Math.sin(m.a) : 1);
      sg.fillStyle = sg.strokeStyle = 'rgba(' + m.c + ',' + al.toFixed(3) + ')';
      if (m.kind === 1) { sg.lineWidth = m.size; sg.beginPath(); sg.moveTo(m.x, m.y); sg.lineTo(m.x, m.y - m.vy * 0.035); sg.stroke(); }
      else if (m.kind === 2) { sg.save(); sg.translate(m.x, m.y); sg.rotate(m.a); sg.fillRect(-m.size, -m.size * 0.45 * Math.cos(m.a * 1.7), m.size * 2, m.size * 0.9 * Math.cos(m.a * 1.7)); sg.restore(); }
      else { sg.beginPath(); sg.arc(m.x, m.y, m.size, 0, 6.283); sg.fill(); }
    }
    sg.globalCompositeOperation = 'source-over';
  }

  // ---- loop ----
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.05, (now - last) / 1000); last = now; if (slow) dt *= 0.5;
    time += dt; let going = 0;
    if (roam.on) going = roamStep(dt);
    else { wb += (wbTo - wb) * Math.min(1, dt * 5); rb += (rbTo - rb) * Math.min(1, dt * 3.5); if (wb > 0.001) phase += dt * (4.9 + 4.1 * rb); J.root.rotation.y = J.spin; }
    if (move && !J.action && !J.pending) { move = ''; press(); bookT0 = time; }
    // left standing, she looks about or settles her weight now and then
    if (state === 'idle' && !move && !J.action && going < 0.05 && wbTo === 0) { roam.idleT += dt; if (roam.idleT > roam.idleNext) { roam.idleT = 0; roam.idleNext = 6 + Math.random() * 7; J.play(Math.random() < 0.5 ? 'look_around' : 'settle', false); } } else roam.idleT = 0;
    J.animate(phase, wb, time, dt, rb);
    { const m = find(move || state), cam = m[4] && J.action === m[0] ? m[4](J.time) : null; needHalf = cam ? cam[0] : m[2]; needV = m[3] || 1.12; camX += ((cam ? cam[1] : 0) - camX) * Math.min(1, dt * 3); if (roam.on) needHalf = Math.max(roam.wide || 0, cam ? 1.05 : needHalf, 1.05); else orbit.target.x = camX; }
    // camera: fit the move, ease to a chosen view, or turn slowly
    if (spin) orbit.az += dt * 0.5;
    if (viewAz != null) { let d = viewAz - orbit.az; d = Math.atan2(Math.sin(d), Math.cos(d)); orbit.az += d * Math.min(1, dt * 5); orbit.el += (viewEl - orbit.el) * Math.min(1, dt * 5); if (Math.abs(d) < 0.003) viewAz = null; }
    faceMode += (faceTo - faceMode) * Math.min(1, dt * 4);
    const asp = stage.camera.aspect, th = Math.tan(orbit.fov * Math.PI / 360), fitDist = Math.max(needHalf / (th * asp), needV / th);
    const want = (fitDist * (1 - faceMode) + 1.75 * faceMode) * zoomUser;
    orbit.dist += (want - orbit.dist) * Math.min(1, dt * 3.5);
    orbit.target.y += ((0.95 * (1 - faceMode) + 1.5 * faceMode) - orbit.target.y) * Math.min(1, dt * 4);
    stage.dim = J.dim;
    stage.render(); roomStep(dt);
    if (showBook) drawBook();
    const a = J.action, m = find(move || state);
    hud.textContent = m[1] + (a ? '  ' + J.time.toFixed(1) + ' / ' + J.ACTIONS[a].dur.toFixed(1) + ' s' : '') + '  ·  ' + Math.round(J.triangles / 1000) + 'k triangles';
  }
  loadClip('idle');
  requestAnimationFrame((t) => { last = t; frame(t); });
  window.FOX = { J, stage, setMove, setState, STATES, ACTS, OLD, SPELLS };
  if (!SPELLS.length) { for (const id of ['qPrev', 'qNext', 'qName', 'qCast']) { const el = $(id); if (el) el.hidden = true; } const sp = $('spells'); if (sp && sp.parentElement) sp.parentElement.hidden = true; }
})();
