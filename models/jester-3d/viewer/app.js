// app.js: the viewer. Builds the stage, the night square and the Jester, wires the move chips, orbit, the flipbook inset and pixel mode.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('stage'), box = $('stagebox'), hud = $('hud'), err = $('err');
  // What she can do. States are how she holds herself and stay until changed; moves and spells play once over whatever state she is in.
  // Each: [id, label, half-width in meters the camera must show, half-height (optional), camera by time (optional): t -> [half-width, shift toward the target, half-height, height of the middle]]
  const STATES = [['idle', 'Stand', 0.7], ['walk', 'Walk', 0.7], ['run', 'Run', 0.8], ['kneel', 'Kneel', 0.7], ['squat', 'Squat', 0.7], ['sit_chair', 'Sit on a stool', 0.7], ['sit_ground', 'Sit on the ground', 0.7], ['hover', 'Hover', 0.75]];
  const ACTS = [['jump', 'Jump', 0.9, 1.42], ['talk', 'Talk', 0.8], ['wave', 'Wave', 0.8], ['bow', 'Bow', 0.95], ['twirl', 'Twirl', 1.15], ['laugh', 'Laugh', 0.8], ['dance', 'Dance', 0.95],
    ['caper', 'Caper', 1.2, 1.3], ['prance', 'Prance', 0.95, 1.2], ['juggle', 'Juggle', 0.95, 1.3]];
  const QUIET = [['look_around', 'Stand', 0.7], ['settle', 'Stand', 0.7]];      // small things she does by herself when left standing
  const SPELLS = [['curtain_call', 'Curtain Call', 1.0], ['sealed_fate', 'Sealed Fate', 0.8], ['against_all_odds', 'Against All Odds', 0.82], ['gilded_rebuke', 'Gilded Rebuke', 1.28], ['hush', 'Hush', 1.05], ['gravity', 'Gravity', 1.1],
    ['ill_omen', 'Ill Omen', 0.8, 0, (t) => t > 0.95 ? [1.75, 1.0] : [0.8, 0]], ['stop', 'Stop', 1.0, 0, (t) => t > 2.35 ? [1.8, 1.05] : [1.0, 0.25]],
    ['royal_reversal', 'Royal Reversal', 0.85, 0, (t) => t > 1.8 ? [1.45, -0.55] : [0.85, -0.1]], ['last_toll', 'The Last Toll', 0.9, 0, (t) => t > 3.85 ? [2.0, 0] : [0.9, 0]]];
  // Her moves under the lore (project doc lore/jester-3d-and-lore.md). Names are still open, so they are kept here as words, not in the model.
  const LORE = [['doom', 'Big spell', 1.0, 0, (t) => t > 2.7 ? [2.3, 1.2, 1.5, 1.15] : [1.0, 0, 1.25, 1.0]],
    ['doom_end', 'Big spell: the ending', 1.0, 0, (t) => t < 2.7 ? [1.0, 0, 1.25, 1.0] : t < 5.2 ? [2.3, 1.2, 1.5, 1.15] : t < 7.4 ? [1.3, 0, 1.5, 1.2] : [2.6, 0.5, 2.3, 1.75]],
    ['taunt_attack', 'Attack taunt', 1.2, 0, (t) => t > 2.9 ? [2.4, 1.2, 1.6, 1.15] : [1.25, 0, 1.4, 1.1]],
    ['taunt_heal', 'Heal taunt', 1.3, 0, (t) => t > 0.9 && t < 6.9 ? [2.0, 0, 2.0, 1.5] : [1.2, 0, 1.3, 1.05]],
    ['hit', 'Take a hit', 0.95, 1.2]];
  const HITS = [['hit_laugh', 'Take a hit', 0.95, 1.2], ['hit_dust', 'Take a hit', 0.95, 1.2]];      // the ways she takes a blow; the button goes through them in turn
  const ALL = STATES.concat(ACTS, SPELLS, LORE, HITS, QUIET), find = (id) => ALL.find((x) => x[0] === id) || ALL[0];
  const VIEWS = [['Front', 0, 0.10, 1], ['Three-quarter', -0.62, 0.14, 1], ['Side', -1.5708, 0.08, 1], ['Back', 3.1416, 0.12, 1], ['Face', 0.22, 0.02, 0.27]];
  const touchPhone = (navigator.maxTouchPoints > 0 || /Mobi|Android|iPhone/i.test(navigator.userAgent)) && Math.min(screen.width, screen.height) < 820;
  const small = /#lite/.test(location.hash) ? true : /#full/.test(location.hash) ? false : touchPhone;      // phones get the lighter model; the Full detail switch overrides
  const QS = new URLSearchParams(location.search);
  let stage, J, JO = null, SQ = null;
  try {
    if (!window.THREE) throw new Error('three.js did not load');
    JO = { detail: small ? 0.75 : 1, textureScale: small ? 0.75 : 1 };
    stage = makeStage(canvas, { shadow: small ? 1024 : 2048 });
    J = makeJester(JO);
    stage.scene.add(J.root, J.fx);
    J.camera = stage.camera;
    SQ = buildSquare(stage, { small });
  } catch (e) { err.hidden = false; err.textContent = 'This page needs WebGL to draw her. ' + (e && e.message ? e.message : ''); return; }
  const orbit = stage.orbit; orbit.az = 0; orbit.el = 0.10; orbit.target.y = 0.95;
  let state = 'idle', move = '', wb = 0, wbTo = 0, rb = 0, rbTo = 0, phase = 0, time = 0, spin = false, slow = false, showBook = true;
  stage.look = 'smooth';      // the painted face and fabrics show in the smooth look; the flipbook look is a switch
  stage.square = QS.get('square') !== '0'; stage.glow = QS.get('glow') !== '0' && stage.glowOk; J.arena = stage.square ? SQ.R : 0;
  let needHalf = 0.86, needV = 1.12, tyWant = 0.95, camX = 0, zoomUser = 1, faceMode = 0, faceTo = 0, viewAz = null, viewEl = null, last = performance.now();

  // ---- chips ----
  const viewRow = $('views'), toggleRow = $('toggles');
  function chip(parent, label, on, pressed) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label; if (pressed != null) b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.addEventListener('click', () => on(b)); parent.appendChild(b); return b;
  }
  const moveChips = {};
  for (const [id, label] of STATES) moveChips[id] = chip($('states'), label, () => setState(id), id === 'idle');
  for (const [id, label] of ACTS) moveChips[id] = chip($('acts'), label, () => setMove(id), false);
  for (const [id, label] of SPELLS) moveChips[id] = chip($('spells'), label, () => setMove(id), false);
  for (const [id, label] of LORE) moveChips[id] = chip($('lore'), label, () => setMove(id), false);
  const press = () => { for (const k in moveChips) moveChips[k].setAttribute('aria-pressed', k === state || k === move || (k === 'hit' && /^hit_/.test(move)) ? 'true' : 'false'); };
  // What charges her big spell (Chris, November 12; lore/discussion-notes.md): the damage aimed at her, whether or not she drew it by taunting.
  // It is full when that adds up to three-quarters of her own HP. Her HP and the size of a blow here are stand-ins, so the charge can be watched;
  // balance comes later. The button always works, so the move can be watched at any charge; a game would make her wait.
  const HER_HP = 1000, FULL = 0.75 * HER_HP, BLOW = [160, 320];          // a blow on this page is somewhere between these
  let hitTurn = 0, blowNext = 0, blowLast = 0; const ringNote = $('ringNote');
  chip($('lore'), 'Empty the charge', () => { J.charge = 0; blowLast = 0; }, null);
  function setState(id) {
    state = id; faceTo = 0; wbTo = id === 'walk' || id === 'run' ? 1 : 0; rbTo = id === 'run' ? 1 : 0;
    J.setStance(J.STANCES.indexOf(id) >= 0 ? id : '');
    if (move === 'jump') { J.stop(); move = ''; }
    press(); bookT0 = time;
  }
  function setMove(id) {
    if (id === 'idle' || id === 'walk') { J.stop(); move = ''; return setState(id); }      // kept for older callers
    if (id === 'hit') { id = HITS[hitTurn % HITS.length][0]; hitTurn++; blowNext = Math.round((BLOW[0] + (BLOW[1] - BLOW[0]) * Math.random()) / 10) * 10; }
    if (dummyUp() && AIMED[id]) { const dx = dummy.position.x - roam.x, dz = dummy.position.z - roam.z; roam.aim = Math.atan2(-dz, dx); J.targetDist = Math.hypot(dx, dz); } else { roam.aim = null; J.targetDist = 0; }
    move = id; faceTo = 0; J.play(id, true);
    if (J.stance === '' && J.STANCES.indexOf(state) >= 0) state = 'idle';             // a jump stands her up first
    press(); bookT0 = time;
  }
  for (const [label, az, el, face] of VIEWS) chip(viewRow, label, () => { viewAz = az + (roam.on ? roam.face : 0); viewEl = el; faceTo = face < 1 ? 1 : 0; spin = false; spinChip.setAttribute('aria-pressed', 'false'); });
  // ---- walking her around: a pad on the stage (or W A S D / arrows, Shift to run, Space to jump); she moves the way the pad points, as the camera sees it ----
  const WALKS = { talk: 1, jump: 1, wave: 1, laugh: 1 };            // moves she can make while walking
  const roamR = () => stage.square ? 6.0 : 2.85;                     // how far from the middle she can go
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
  function setRoam(on) {
    roam.on = on; roamChip.setAttribute('aria-pressed', on); joy.hidden = !on; JO.treadmill = on ? false : undefined; J.targetDist = 0;
    spin = false; spinChip.setAttribute('aria-pressed', 'false');
    if (on) { if (!stage.square && (state === 'walk' || state === 'run')) setState('idle'); viewAz = orbit.az; viewEl = 0.22; }
    else { roam.x = roam.z = roam.face = roam.vx = roam.vz = roam.jx = roam.jy = 0; roam.keys = {}; J.root.position.set(0, 0, 0); J.root.rotation.y = 0; orbit.target.z = 0; stage.follow(0, 0); if (state === 'idle') { wbTo = rbTo = 0; } viewAz = 0; viewEl = 0.10; }
    place();
  }
  const roamChip = chip(toggleRow, 'Walk around', () => setRoam(!roam.on), false);
  $('states').prepend(roamChip);                    // first in the Body row, right under the stage
  function roamStep(dt) {
    let ix = roam.jx + (roam.keys.r ? 1 : 0) - (roam.keys.l ? 1 : 0), iy = roam.jy + (roam.keys.u ? 1 : 0) - (roam.keys.d ? 1 : 0), mag = Math.hypot(ix, iy);
    if (mag > 1) { ix /= mag; iy /= mag; mag = 1; }
    const keysOn = roam.keys.u || roam.keys.d || roam.keys.l || roam.keys.r; if (keysOn && !roam.keys.run && mag > 0.55) { ix *= 0.55 / mag; iy *= 0.55 / mag; mag = 0.55; }
    const a = J.action, lap = (state === 'walk' || state === 'run') && mag <= 0.08;      // Walk and Run with the pad at rest: she takes a lap of the square by herself
    if (mag > 0.08) {
      if (a && !WALKS[a] && find(a) && QUIET.indexOf(find(a)) >= 0) J.stop();          // a small idle thing gives way at once
      if (J.STANCES.indexOf(state) >= 0 || state === 'walk' || state === 'run') setState('idle');      // she gets up before she goes; the pad takes over from a lap
    }
    const free = !J.stanceNow && !J.stance && !(J.action && !WALKS[J.action]) && !J.pending;
    let tx = 0, tz = 0;
    if (lap && free) {
      const r = Math.hypot(roam.x, roam.z), want = stage.square ? 2.15 : 1.7, sp = state === 'run' ? 2.3 : 0.80;
      const ux = r > 0.05 ? roam.x / r : Math.sin(roam.face), uz = r > 0.05 ? roam.z / r : Math.cos(roam.face), out = Math.max(-1, Math.min(1, (want - r) * 1.6));
      let dx = -uz + ux * out, dz = ux + uz * out; const m = Math.hypot(dx, dz) || 1; tx = dx / m * sp; tz = dz / m * sp;
    } else if (free && mag >= 0.08) {
      const run = Math.max(0, Math.min(1, (mag - 0.6) / 0.35)), speed = (0.32 + 0.52 * Math.min(1, mag / 0.6)) * (1 - run) + 2.3 * run;
      const fx = -Math.sin(orbit.az), fz = -Math.cos(orbit.az), rx = Math.cos(orbit.az), rz = -Math.sin(orbit.az), m = speed / mag;
      tx = (rx * ix + fx * iy) * m; tz = (rz * ix + fz * iy) * m;
    }
    const k = Math.min(1, dt * 7);
    roam.vx += (tx - roam.vx) * k; roam.vz += (tz - roam.vz) * k;
    const v = Math.hypot(roam.vx, roam.vz);
    roam.x += roam.vx * dt; roam.z += roam.vz * dt;
    const R = roamR(), d = Math.hypot(roam.x, roam.z); if (d > R) { roam.x *= R / d; roam.z *= R / d; }      // the edge of where she can go
    if (dummy.visible && !dS.away) { const ex = roam.x - dummy.position.x, ez = roam.z - dummy.position.z, ed = Math.hypot(ex, ez), keep = 0.62 * dummy.scale.x; if (ed < keep && ed > 1e-4) { roam.x = dummy.position.x + ex / ed * keep; roam.z = dummy.position.z + ez / ed * keep; } }      // she walks round the dummy, not through it
    if (J.action && AIMED[J.action] && roam.aim != null) { let df = roam.aim - roam.face; df = Math.atan2(Math.sin(df), Math.cos(df)); roam.face += df * Math.min(1, dt * 10); }
    else if (v > 0.06) { let df = Math.atan2(roam.vx, roam.vz) - roam.face; df = Math.atan2(Math.sin(df), Math.cos(df)); roam.face += df * Math.min(1, dt * 9); }
    wbTo = Math.min(1, v / 0.3); rbTo = Math.max(0, Math.min(1, (v - 1.0) / 1.0));
    wb += (wbTo - wb) * Math.min(1, dt * 8); rb += (rbTo - rb) * Math.min(1, dt * 5);
    if (wb > 0.001) phase += dt * Math.max(2.0, v * (7.66 * (1 - rb) + 4.2 * rb));       // her feet keep pace with the ground she covers
    J.root.position.set(roam.x, 0, roam.z); J.root.rotation.y = roam.face + J.spin;
    stage.follow(roam.x, roam.z);
    return v;
  }
  const spinChip = chip(toggleRow, 'Turntable', (b) => { spin = !spin; viewAz = null; b.setAttribute('aria-pressed', spin); }, false);
  chip(toggleRow, 'Flipbook', (b) => { showBook = !showBook; b.setAttribute('aria-pressed', showBook); if (!showBook) $('book').hidden = true; }, true);
  chip(toggleRow, 'Flipbook look', (b) => { stage.look = stage.look === 'flipbook' ? 'smooth' : 'flipbook'; b.setAttribute('aria-pressed', stage.look === 'flipbook'); }, false);
  // the layers worn over the base outfit (veils, ribbon strands, shawl, shoulder kerchiefs) can be taken off, to work on the outfit beneath
  let outerOn = true;
  chip(toggleRow, 'Veil and shawl', (b) => { outerOn = !outerOn; J.debug.cloths.forEach((c) => { if (c.outer || (c.meshes[0] && c.meshes[0].material.transparent)) c.meshes.forEach((m) => { m.visible = outerOn; }); }); b.setAttribute('aria-pressed', outerOn); }, true);
  chip(toggleRow, 'Full detail', () => { location.hash = small ? '#full' : '#lite'; location.reload(); }, !small);
  chip(toggleRow, 'Half speed', (b) => { slow = !slow; b.setAttribute('aria-pressed', slow); }, false);
  // where she stands: the night square, or the little theatre she was first shown in
  chip(toggleRow, 'Night square', (b) => { stage.square = !stage.square; b.setAttribute('aria-pressed', stage.square); J.arena = stage.square ? SQ.R : 0; if (!stage.square && (state === 'walk' || state === 'run') && roam.on) setState('idle'); place(); }, stage.square);
  // glow: light brighter than white spreads round itself (lanterns, her spells). It costs speed on a slow phone, so it is a switch.
  chip(toggleRow, 'Glow', (b) => { stage.glow = !stage.glow && stage.glowOk; b.setAttribute('aria-pressed', stage.glow); }, stage.glow);

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
  const FLOUR = ['wave', 'bow', 'twirl', 'laugh', 'dance', 'caper', 'prance', 'juggle', 'talk']; let qi = 1, fi = 0;
  const CASTS = SPELLS.concat(LORE.filter((x) => x[0] !== 'hit'));          // the arrows step through her ten spells, then the lore's
  const qName = $('qName'), qShow = () => { qName.textContent = CASTS[qi][1]; };
  const qStep = (d) => { qi = (qi + d + CASTS.length) % CASTS.length; qShow(); };
  const qCast = () => setMove(CASTS[qi][0]), qFlour = () => { setMove(FLOUR[fi]); fi = (fi + 1) % FLOUR.length; };
  $('qPrev').addEventListener('click', () => qStep(-1)); $('qNext').addEventListener('click', () => qStep(1)); $('qCast').addEventListener('click', qCast); $('qJump').addEventListener('click', () => setMove('jump')); $('qMove').addEventListener('click', qFlour);
  $('qHit').addEventListener('click', () => setMove('hit'));
  for (const id of ['pad2', 'joy']) $(id).addEventListener('pointerdown', (e) => e.stopPropagation());
  const DIG = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
  const LKEY = { KeyB: 'doom', KeyN: 'doom_end', KeyT: 'taunt_attack', KeyY: 'taunt_heal', KeyH: 'hit' };
  function quickKey(code) {
    const d = DIG.indexOf(code); if (d >= 0 && d < SPELLS.length) { qi = d; qShow(); qCast(); return true; }
    if (LKEY[code]) { setMove(LKEY[code]); return true; }
    if (code === 'KeyQ') { qStep(-1); return true; } if (code === 'KeyE') { qStep(1); return true; } if (code === 'KeyF' || code === 'Enter') { qCast(); return true; } if (code === 'KeyR') { qFlour(); return true; }
    if (code === 'Space') { setMove('jump'); return true; }
    return false;
  }
  qShow();
  // ---- the practice dummy from the training square: she turns to put it on her casting side, the spell goes to where it stands, and it rocks when struck ----
  const AIMED = { sealed_fate: 1, gilded_rebuke: 1, hush: 1, gravity: 1, ill_omen: 1, stop: 1, last_toll: 1, doom: 1, doom_end: 1, taunt_attack: 1 };
  const lin = (h) => new THREE.Color(h).convertSRGBToLinear(), dummy = new THREE.Group(), dBody = new THREE.Group(), dHinge = new THREE.Group(), dTop = new THREE.Group();
  const dS = { rx: 0, rz: 0, vx: 0, vz: 0, flash: 0, squash: 0, slump: 0, slumpTo: 0, pull: -1, away: false, back: 0 }; let dummyOn = true;
  dummy.add(dBody); dBody.add(dHinge); dHinge.add(dTop); dHinge.position.y = 0.98; dTop.position.y = -0.98; dummy.visible = false; stage.scene.add(dummy);      // the sack hangs from the top of the post
  const sackM = new THREE.MeshStandardMaterial({ roughness: 0.95, emissive: lin(0xb070ff), emissiveIntensity: 0 });
  { const R = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; };
    const weave = cv(128, 128, (g) => { g.fillStyle = '#8a7350'; g.fillRect(0, 0, 128, 128); for (let y = 0; y < 128; y += 4) for (let x = 0; x < 128; x += 4) { g.fillStyle = 'rgba(' + (40 + R() * 50) + ',' + (30 + R() * 40) + ',' + (10 + R() * 20) + ',.35)'; g.fillRect(x + ((y / 4) % 2) * 2, y, 3, 3); } }); weave.wrapS = weave.wrapT = THREE.RepeatWrapping; weave.repeat.set(3, 3);
    sackM.map = weave;
    const wood = new THREE.MeshStandardMaterial({ color: lin(0x4a3526), roughness: 0.85 }), straw = new THREE.MeshStandardMaterial({ color: lin(0xb89a4a), roughness: 0.9 });
    const mk = (par, g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; par.add(o); return o; };
    mk(dummy, new THREE.CylinderGeometry(0.34, 0.4, 0.1, 16), wood, 0, 0.05, 0);
    mk(dBody, new THREE.CylinderGeometry(0.055, 0.065, 1.0, 10), wood, 0, 0.55, 0);
    mk(dTop, new THREE.SphereGeometry(1, 24, 18), sackM, 0, 1.2, 0).scale.set(0.25, 0.5, 0.25);
    mk(dTop, new THREE.CylinderGeometry(0.035, 0.035, 1.25, 8), wood, 0, 1.45, 0).rotation.z = Math.PI / 2;
    for (const s of [1, -1]) mk(dTop, new THREE.ConeGeometry(0.11, 0.3, 9), straw, s * 0.72, 1.45, 0).rotation.z = s * Math.PI / 2;
    mk(dTop, new THREE.ConeGeometry(0.3, 0.16, 12), straw, 0, 0.9, 0).rotation.x = Math.PI;
    const face = cv(256, 128, (g) => { g.fillStyle = '#93794f'; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#2a1c14'; g.lineWidth = 5; g.lineCap = 'round';
      for (const x of [104, 152]) { g.beginPath(); g.moveTo(x - 9, 46); g.lineTo(x + 9, 64); g.moveTo(x + 9, 46); g.lineTo(x - 9, 64); g.stroke(); }
      g.beginPath(); g.moveTo(98, 88); g.quadraticCurveTo(128, 104, 158, 88); g.stroke(); g.lineWidth = 3; for (let x = 104; x <= 152; x += 12) { g.beginPath(); g.moveTo(x, 84); g.lineTo(x, 100); g.stroke(); } });
    mk(dTop, new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshStandardMaterial({ map: face, roughness: 0.95 }), 0, 1.84, 0).rotation.y = -Math.PI / 2;
    mk(dTop, new THREE.ConeGeometry(0.15, 0.34, 10), new THREE.MeshStandardMaterial({ color: lin(0x5a4c24), roughness: 0.8 }), 0.03, 2.13, 0).rotation.z = -0.25;
    const board = cv(128, 128, (g) => { ['#3a2a1e', '#d8c9a8', '#7a2140', '#d8c9a8', '#c8922e'].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(64, 64, 62 - i * 13, 0, 7); g.fill(); }); });
    mk(dTop, new THREE.CylinderGeometry(0.2, 0.2, 0.03, 20), [wood, new THREE.MeshStandardMaterial({ map: board, roughness: 0.8 }), wood], 0, 1.25, 0.26).rotation.x = Math.PI / 2;
    const blob = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ color: 0x06040a, transparent: true, opacity: 0.4, depthWrite: false, toneMapped: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.006; dummy.add(blob);
  }
  const dummyUp = () => dummy.visible && !dS.away;
  // where things stand: in the square the dummy is on her casting side of the medallion; in the little theatre it only comes out with Walk around
  function place() {
    if (stage.square) { dummy.position.set(2.8, 0, -0.4); dummy.scale.setScalar(0.9); dummy.visible = dummyOn && !dS.away; stage.lanterns.visible = false; }
    else { dummy.position.set(1.9, 0, -0.25); dummy.scale.setScalar(0.74); dummy.visible = roam.on && dummyOn && !dS.away; stage.lanterns.visible = roam.on; }
    dummy.rotation.y = Math.atan2(-dummy.position.x, -dummy.position.z);          // it faces the middle
    const R = roamR(), d = Math.hypot(roam.x, roam.z); if (d > R) { roam.x *= R / d; roam.z *= R / d; }
    stage.follow(roam.x, roam.z);
  }
  const dummyChip = chip(toggleRow, 'Dummy', (b) => { dummyOn = !dummyOn; b.setAttribute('aria-pressed', dummyOn); place(); }, true);
  function dummyStep(dt) {
    const d = dS; d.vx += (-70 * d.rx - 5.5 * d.vx) * dt; d.vz += (-70 * d.rz - 5.5 * d.vz) * dt; d.rx += d.vx * dt; d.rz += d.vz * dt; d.flash *= Math.exp(-dt * 4.5); d.squash *= Math.exp(-dt * 6);
    d.slump += (d.slumpTo - d.slump) * Math.min(1, dt * 5);
    const c = (v) => Math.max(-0.7, Math.min(0.7, v));
    dBody.rotation.set(c(d.rx), 0, c(d.rz)); dHinge.rotation.set(0.42 * d.slump, 0, 0.14 * d.slump);      // beaten, it hangs forward on its post
    let s = 1, lift = 0;
    if (d.pull >= 0) { d.pull += dt; const p = Math.min(1, d.pull / 0.95); s = 1 - 0.55 * p * p; lift = 0.5 * p * p; }                                 // the hole draws it up and in
    dBody.scale.set(s * (1 + 0.25 * d.squash), s * (1 - 0.45 * d.squash), s * (1 + 0.25 * d.squash)); dBody.position.y = lift;
    sackM.emissiveIntensity = 0.8 * d.flash;
    if (d.away && time >= d.back) { d.away = false; d.pull = -1; d.slump = d.slumpTo = 0; d.squash = 0.9; place(); }      // a new one is stood up
  }
  // tag: what kind of blow it is (the model names them): press flattens it, clamp and burst knock it back, zero leaves it hanging, doom draws it in, gone takes it
  function dummyHit(k, tag) {
    const dx = dummy.position.x - roam.x, dz = dummy.position.z - roam.z, L = Math.hypot(dx, dz) || 1, p = 2.2 + 4.2 * k, d = dS;
    const ca = Math.cos(dummy.rotation.y), sa = Math.sin(dummy.rotation.y), lx = (dx * ca - dz * sa) / L, lz = (dx * sa + dz * ca) / L;          // the push, as the dummy sees it
    if (tag === 'press') { d.squash = Math.max(d.squash, 0.5); return; }
    if (tag === 'doom') { d.pull = 0; return; }
    if (tag === 'gone') { d.away = true; d.back = time + 3.8; d.pull = -1; dummy.visible = false; return; }
    d.vx += lz * p; d.vz += -lx * p; d.flash = Math.min(1, 0.4 + k);
    if (tag === 'zero') { d.slumpTo = 1; d.squash = Math.max(d.squash, 0.35); }
  }
  // ---- what a spell does to the room: the picture jolts or sways, light flashes from where it lands, and motes cross the whole stage ----
  const sfx = $('sfx'), sg = sfx.getContext('2d'), MOTES = [], calm = matchMedia('(prefers-reduced-motion: reduce)').matches, _hp = new THREE.Vector3();
  const LOOK = { last_toll: ['214,222,255', 'rain', 1], gravity: ['176,116,255', 'fall', 1], stop: ['208,182,255', 'hold', 1], gilded_rebuke: ['255,206,112', 'burst', 0], curtain_call: ['255,206,112', 'confetti', 0], sealed_fate: ['192,124,255', 'burst', 0],
    hush: ['206,188,255', 'inward', 1], ill_omen: ['156,84,236', 'burst', 0], royal_reversal: ['216,222,255', 'rise', 0], against_all_odds: ['255,216,132', 'rise', 0], jump: ['226,210,255', 'dust', 0],
    // the lore's moves are cold and pale: star dust, not confetti
    doom: ['222,228,255', 'none', 1], doom_end: ['222,228,255', 'none', 1], 'doom_end:gone': ['226,232,255', 'rain', 1], taunt_attack: ['222,228,255', 'none', 1], 'taunt_attack:press': ['200,206,255', 'none', 0],
    taunt_heal: ['236,230,214', 'none', 0], hit_laugh: ['255,222,150', 'none', 0], hit_dust: ['255,222,150', 'none', 0] };
  const QUIETHIT = { land: 1, doom: 1 };                                    // blows that only touch the dummy: the room does not answer
  let shakeK = 0, swayK = 0, swayT = 9, flashK = 0, flashC = '200,150,255', flashX = 0.5, flashY = 0.5, hitSeen = 0;
  const R = Math.random, mote = (x, y, vx, vy, life, size, c, o) => { if (MOTES.length < 420) MOTES.push(Object.assign({ x, y, vx, vy, life, max: life, size, c, g: 0, drag: 0, kind: 0, a: R() * 6.28, w: 0 }, o || {})); };
  function roomHit(name, k, tag) {
    const L = LOOK[name + ':' + tag] || LOOK[name] || ['220,200,255', 'burst', 0], W = sfx.width, H = sfx.height, u = W / 400, c = L[0], self = /^hit_/.test(name);
    let hx = 0.5, hy = 0.5; try { J.anchor(name === 'jump' ? 'feet' : 'hit', _hp).project(stage.camera); if (Math.abs(_hp.x) < 1.4 && Math.abs(_hp.y) < 1.4) { hx = _hp.x * 0.5 + 0.5; hy = -_hp.y * 0.5 + 0.5; } } catch (e) {}
    const x0 = hx * W, y0 = hy * H;
    if (!calm) { shakeK = Math.max(shakeK, k); if (L[2]) { swayK = k; swayT = 0; } }
    if (name !== 'jump') { flashK = (0.55 * k + 0.15) * (self ? 0.6 : L[1] === 'none' ? 0.5 : 1); flashC = c; flashX = hx; flashY = hy; }
    const n = L[1] === 'none' ? 0 : Math.round((L[1] === 'dust' ? 22 : 60 + 70 * k) * (small ? 0.7 : 1));      // the lore's moves bring their own dust
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
    const hn = J.state.hitN || 0; if (hn !== hitSeen) { hitSeen = hn; const nm = J.state.hitName, k = J.state.hitK || 0.5, tag = J.state.hitTag || ''; if (tag === 'struck') { blowLast = blowNext; J.charge = Math.min(1, J.charge + blowNext / FULL); }      // the blow lands on her: all of it goes to her charge
      if (!QUIETHIT[tag]) roomHit(nm, k, tag); if (dummy.visible && AIMED[nm]) dummyHit(k, tag); }
    dummyStep(dt);
    if (!calm && J.shake > 0.01) shakeK = Math.max(shakeK, 0.7 * J.shake);        // the long rumbles her darker spells ask for
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
  let ringShown = '', manual = false;
  function frame(now) {
    requestAnimationFrame(frame); if (manual) return;
    let dt = Math.min(0.05, (now - last) / 1000); last = now; if (slow) dt *= 0.5;
    advance(dt, true);
  }
  function advance(dt, draw) {
    time += dt; let going = 0;
    if (roam.on) going = roamStep(dt);
    else {
      wb += (wbTo - wb) * Math.min(1, dt * 5); rb += (rbTo - rb) * Math.min(1, dt * 3.5); if (wb > 0.001) phase += dt * (4.9 + 4.1 * rb);
      const to = J.action && AIMED[J.action] && roam.aim != null ? roam.aim : 0; let df = to - roam.face; df = Math.atan2(Math.sin(df), Math.cos(df)); roam.face += df * Math.min(1, dt * 8);      // she turns her casting side to the dummy, then back to the audience
      J.root.rotation.y = roam.face + J.spin;
    }
    if (move && !J.action && !J.pending) { move = ''; press(); bookT0 = time; }
    // left standing, she looks about or settles her weight now and then
    if (state === 'idle' && !move && !J.action && going < 0.05 && wbTo === 0) { roam.idleT += dt; if (roam.idleT > roam.idleNext) { roam.idleT = 0; roam.idleNext = 6 + Math.random() * 7; J.play(Math.random() < 0.5 ? 'look_around' : 'settle', false); } } else roam.idleT = 0;
    // the camera is settled first, so effects that face it or hang before it are drawn for this frame's view
    const sq = stage.square;
    { const m = find(move || state), cam = m[4] && J.action === m[0] ? m[4](J.time) : null; needHalf = cam ? cam[0] : m[2]; needV = (cam && cam[2]) || m[3] || 1.12; tyWant = (cam && cam[3]) || 0.95; camX += ((cam ? cam[1] : 0) - camX) * Math.min(1, dt * 3);
      // when she casts at the dummy the camera takes both in
      const aimed = dummyUp() && J.action && AIMED[J.action], share = aimed ? 0.42 : 0, ddx = dummy.position.x - roam.x, ddz = dummy.position.z - roam.z, wide = aimed ? Math.hypot(ddx, ddz) * 0.62 + 0.7 : 0;
      let cx = roam.x + ddx * share, cz = roam.z + ddz * share;
      if (roam.on) needHalf = Math.max(wide, cam ? Math.max(1.05, cam[0]) : needHalf, 1.05); else { needHalf = Math.max(needHalf, wide); if (!aimed) cx = camX; }
      orbit.target.x += (cx - orbit.target.x) * Math.min(1, dt * 5); orbit.target.z += (cz - orbit.target.z) * Math.min(1, dt * 5); }
    // camera: fit the move, ease to a chosen view, or turn slowly
    if (spin) orbit.az += dt * 0.5;
    if (viewAz != null) { let d = viewAz - orbit.az; d = Math.atan2(Math.sin(d), Math.cos(d)); orbit.az += d * Math.min(1, dt * 5); orbit.el += (viewEl - orbit.el) * Math.min(1, dt * 5); if (Math.abs(d) < 0.003) viewAz = null; }
    faceMode += (faceTo - faceMode) * Math.min(1, dt * 4);
    const baseFov = sq ? 30 - 8 * faceMode : 22;                    // the square is seen through a slightly wider lens than the theatre, so the tents and lanterns come into the picture
    const asp = stage.camera.aspect, th = Math.tan(baseFov * Math.PI / 360), fitDist = Math.max(needHalf / (th * asp), needV / th);
    let want = (fitDist * (1 - faceMode) + 1.75 * (22 / baseFov) * faceMode) * zoomUser, fovTo = baseFov;
    orbit.target.y += ((tyWant * (1 - faceMode) + 1.5 * faceMode) - orbit.target.y) * Math.min(1, dt * 4);
    if (sq) {
      // the camera stays inside the ring of lanterns: where it cannot back away, it widens its lens instead
      const LIM = 7.5, ce = Math.cos(orbit.el), ux = Math.sin(orbit.az) * ce, uz = Math.cos(orbit.az) * ce, px = orbit.target.x, pz = orbit.target.z, uu = ux * ux + uz * uz;
      if (uu > 1e-5) { const b = px * ux + pz * uz, cc = px * px + pz * pz - LIM * LIM, disc = b * b - uu * cc, dmax = disc > 0 ? Math.max(0.6, (-b + Math.sqrt(disc)) / uu) : 0.6;
        if (want > dmax) { fovTo = Math.min(58, 2 * Math.atan(th * want / dmax) * 180 / Math.PI); want = dmax; } }
      const lowest = Math.asin(Math.max(-1, Math.min(1, (0.2 - orbit.target.y) / Math.max(0.5, orbit.dist)))); if (orbit.el < lowest) orbit.el = lowest;      // and above the ground
    }
    orbit.dist += (want - orbit.dist) * Math.min(1, dt * 3.5); orbit.fov += (fovTo - orbit.fov) * Math.min(1, dt * 3.5);
    stage.placeCamera();
    J.animate(phase, wb, time, dt, rb);
    // the square: fireflies drift, the lamps and the night answer her spells, and her spell light falls on the flagstones too
    if (sq) { SQ.flies(time); const k = Math.max(J.dark || 0, 0.55 * J.dim); stage.dark = 1 - Math.pow(1 - 0.97 * k, 2); const sl = J.spellLight; SQ.spell.position.copy(sl.position); SQ.spell.color.copy(sl.color); SQ.spell.intensity = sl.intensity * 1.3; }
    stage.dim = J.dim;
    if (draw) stage.render(); roomStep(dt);
    if (showBook && draw) drawBook();
    const a = J.action, m = find(move || state), got = Math.round(J.charge * FULL / 10) * 10;
    hud.textContent = m[1] + (a ? '  ' + J.time.toFixed(1) + ' / ' + J.ACTIONS[a].dur.toFixed(1) + ' s' : '') + '  ·  ' + Math.round(J.triangles / 1000) + 'k triangles';
    const rs = got + '/' + blowLast; if (rs !== ringShown) { ringShown = rs; const full = J.charge >= 0.999; ringNote.textContent = full ? 'Charged: ' + FULL + ' of ' + FULL + ' absorbed' : 'Absorbed ' + got + ' of ' + FULL + (blowLast && got ? ' (last blow ' + blowLast + ')' : ''); ringNote.classList.toggle('full', full); }
  }
  loadClip('idle');
  place();
  if (stage.square && QS.get('walk') !== '0') setRoam(true); else if (stage.square) { viewEl = 0.14; viewAz = 0; }
  requestAnimationFrame((t) => { last = t; frame(t); });
  window.JESTER = { J, stage, SQ, setMove, setState, setRoam, STATES, ACTS, SPELLS, LORE, roam, dummy, dS, orbit,
    // for checks: step the page by hand (n frames of dt seconds, drawing the last), or hand it back to the clock
    set zoom(v) { zoomUser = v; }, view(az, el) { viewAz = az; viewEl = el; },
    step(n, dt) { manual = true; for (let i = 0; i < n; i++) advance(dt || 1 / 30, i === n - 1); }, run() { manual = false; last = performance.now(); } };
})();
