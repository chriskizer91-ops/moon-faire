// game.js: the page for her moves in the game. The same stage, square and model as app.js (the night square page), with only the five spells the game
// gives her, every move and every way she holds herself, and two practice foes that carry Life and Fate so the rules can be watched.
// The rules and numbers are from the claude.ai Project "Flip Book Art", lore/combat-balance.md (the combat system Chris approved on November 13, 2026).
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('stage'), box = $('stagebox'), hud = $('hud'), err = $('err');
  // What she can do. States are how she holds herself and stay until changed; moves and spells play once over whatever state she is in.
  // Each: [id, label, half-width in meters the camera must show, half-height (optional), camera by time (optional): t -> [half-width, shift toward the target, half-height, height of the middle]]
  const STATES = [['idle', 'Stand', 0.7], ['walk', 'Walk', 0.7], ['run', 'Run', 0.8], ['kneel', 'Kneel', 0.7], ['squat', 'Squat', 0.7], ['sit_chair', 'Sit on a stool', 0.7], ['sit_ground', 'Sit on the ground', 0.7], ['hover', 'Hover', 0.75]];
  const ACTS = [['jump', 'Jump', 0.9, 1.42], ['talk', 'Talk', 0.8], ['wave', 'Wave', 0.8], ['bow', 'Bow', 0.95], ['twirl', 'Twirl', 1.15], ['laugh', 'Laugh', 0.8], ['dance', 'Dance', 0.95],
    ['caper', 'Caper', 1.2, 1.3], ['prance', 'Prance', 0.95, 1.2], ['juggle', 'Juggle', 0.95, 1.3], ['hit', 'Take a hit', 0.95, 1.2]];
  const QUIET = [['look_around', 'Stand', 0.7], ['settle', 'Stand', 0.7]];      // small things she does by herself when left standing
  const HITS = [['hit_laugh', 'Take a hit', 0.95, 1.2], ['hit_dust', 'Take a hit', 0.95, 1.2]];      // the ways she takes a blow; the button goes through them in turn
  // The five moves the game gives her. Names are still open, so they are kept here as words, not in the model.
  const GAME = [['g_rebuke', 'Gilded Rebuke', 1.28],
    ['taunt_attack', 'Attack taunt', 1.2, 0, (t) => t > 2.9 ? [2.4, 1.2, 1.6, 1.15] : [1.25, 0, 1.4, 1.1]],
    ['taunt_heal', 'Heal taunt', 1.3, 0, (t) => t > 0.9 && t < 6.9 ? [2.0, 0, 2.0, 1.5] : [1.2, 0, 1.3, 1.05]],
    ['g_seal', 'Sealed Fate', 1.0, 0, (t) => t > 2.7 ? [2.3, 1.2, 1.5, 1.15] : [1.0, 0, 1.25, 1.0]],
    ['g_curtain', 'Curtain Call', 1.0, 0, (t) => t < 2.7 ? [1.0, 0, 1.25, 1.0] : t < 5.2 ? [2.3, 1.2, 1.5, 1.15] : t < 7.4 ? [1.3, 0, 1.5, 1.2] : [2.6, 0.5, 2.3, 1.75]]];
  // The numbers, from lore/combat-balance.md. Damage and heals are shown flat here; in the game they swing up to a quarter either way.
  const RULES = { hp: 1000, mp: 60, rebuke: 40, taunt: 50, catches: 3, healCost: 10, heal: 120, fate: 500, fateHeavy: 1000, splash: 0.20, peril: 0.05, perils: 3 };
  // Two practice foes with a knight's and a wisp's numbers. Each: where it stands and how big it is, in the square and in the little theatre: [x, z, scale]
  const FOES = [{ label: 'Knight', life: 1000, blow: 100, heavy: 200, square: [2.8, -0.4, 0.9], theatre: [1.9, -0.25, 0.74] },
    { label: 'Wisp', life: 300, blow: 50, heavy: 0, square: [3.6, -1.9, 0.6], theatre: [2.45, -1.15, 0.5] }];
  const FRIENDS = [[-0.7, -1.4], [0.4, -2.2], [1.4, -1.5]];             // where her three fainted friends lie: meters toward her target, and meters in front of her (so these are behind her)
  const WORDS = { fate: 'Fate', sealed: 'sealed', ended: 'Ended', stands: 'Stands at 25%', full: 'Full', target: 'Target: ' };
  const ALL = STATES.concat(ACTS, GAME, HITS, QUIET), find = (id) => ALL.find((x) => x[0] === id) || ALL[0];
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
  for (const [id, label] of GAME) moveChips[id] = chip($('spells'), label, () => setMove(id), false);
  const press = () => { for (const k in moveChips) moveChips[k].setAttribute('aria-pressed', k === state || k === move || (k === 'hit' && /^hit_/.test(move)) ? 'true' : 'false'); };
  function setState(id) {
    state = id; faceTo = 0; wbTo = id === 'walk' || id === 'run' ? 1 : 0; rbTo = id === 'run' ? 1 : 0;
    J.setStance(J.STANCES.indexOf(id) >= 0 ? id : '');
    if (move === 'jump') { J.stop(); move = ''; }
    press(); bookT0 = time;
  }
  for (const [label, az, el, face] of VIEWS) chip(viewRow, label, () => { viewAz = az + (roam.on ? roam.face : 0); viewEl = el; faceTo = face < 1 ? 1 : 0; spin = false; spinChip.setAttribute('aria-pressed', 'false'); });
  // ---- walking her around: a pad on the stage (or W A S D / arrows, Shift to run, Space to jump); she moves the way the pad points, as the camera sees it ----
  const WALKS = { talk: 1, jump: 1, wave: 1, laugh: 1 };            // moves she can make while walking
  const roamR = () => stage.square ? 6.0 : 2.85;                     // how far from the middle she can go
  const roam = { on: false, x: 0, z: 0, face: 0, vx: 0, vz: 0, jx: 0, jy: 0, keys: {}, idleT: 0, idleNext: 7, aim: null };
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
    for (const f of foes) if (foeUp(f)) { const p = f.D.g.position, ex = roam.x - p.x, ez = roam.z - p.z, ed = Math.hypot(ex, ez), keep = 0.62 * f.D.g.scale.x; if (ed < keep && ed > 1e-4) { roam.x = p.x + ex / ed * keep; roam.z = p.z + ez / ed * keep; } }      // she walks round a foe, not through it
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
  // the flipbook look is a switch on every model: she is made to look right without it first, and it can then be laid over her
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
  const BOOK = { g_rebuke: 'gilded_rebuke' };          // the game's Gilded Rebuke keeps her flipbook's timing, so its frames still match
  const book = $('book'), bctx = book.getContext('2d'), imgs = {}; let bookT0 = 0, bookClip = '';
  function loadClip(id) { const c = FB.clips[id]; if (!c) return; for (const n of c.frames) if (!imgs[n]) { const im = new Image(); im.src = (window.FBDATA && window.FBDATA[n]) || ('fb/' + n + '.webp'); imgs[n] = im; } }
  function drawBook() {
    const id0 = move || state, id = BOOK[id0] || id0, c = FB.clips[id], want = !c; if (book.hidden !== want) book.hidden = want;       // only her drawn moves have a flipbook frame to show
    if (!c) return;
    if (bookClip !== id) { bookClip = id; loadClip(id); }
    const t = !move ? time : (J.action === id0 ? J.time : -1);
    let i = t < 0 ? 0 : Math.floor(t * c.fps); i = !move ? i % c.frames.length : Math.min(c.frames.length - 1, i);
    const n = c.frames[i], im = imgs[n], f = FB.frames[n], W = book.width, H = book.height;
    bctx.clearRect(0, 0, W, H); if (!im || !im.complete || !im.naturalWidth) return;
    const k = (H * 0.92) / 215, wide = id === 'gilded_rebuke' ? 0.36 : 0.5;
    bctx.imageSmoothingEnabled = true; bctx.drawImage(im, W * wide - f[2] * k, H * 0.97 - f[3] * k, f[0] * k, f[1] * k);
  }

  // ---- the practice foes: sacks on posts from the training square. She turns to put her target on her casting side, the spell goes to where it stands, and it rocks when struck ----
  const AIMED = { g_rebuke: 1, taunt_attack: 1, g_seal: 1, g_curtain: 1, hit_laugh: 1, hit_dust: 1 };
  const CASTS = {}; for (const g of GAME) CASTS[g[0]] = 1;
  const lin = (h) => new THREE.Color(h).convertSRGBToLinear();
  const DM = (function () {              // what every dummy shares
    const R = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; };
    const weave = cv(128, 128, (g) => { g.fillStyle = '#8a7350'; g.fillRect(0, 0, 128, 128); for (let y = 0; y < 128; y += 4) for (let x = 0; x < 128; x += 4) { g.fillStyle = 'rgba(' + (40 + R() * 50) + ',' + (30 + R() * 40) + ',' + (10 + R() * 20) + ',.35)'; g.fillRect(x + ((y / 4) % 2) * 2, y, 3, 3); } }); weave.wrapS = weave.wrapT = THREE.RepeatWrapping; weave.repeat.set(3, 3);
    const face = cv(256, 128, (g) => { g.fillStyle = '#93794f'; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#2a1c14'; g.lineWidth = 5; g.lineCap = 'round';
      for (const x of [104, 152]) { g.beginPath(); g.moveTo(x - 9, 46); g.lineTo(x + 9, 64); g.moveTo(x + 9, 46); g.lineTo(x - 9, 64); g.stroke(); }
      g.beginPath(); g.moveTo(98, 88); g.quadraticCurveTo(128, 104, 158, 88); g.stroke(); g.lineWidth = 3; for (let x = 104; x <= 152; x += 12) { g.beginPath(); g.moveTo(x, 84); g.lineTo(x, 100); g.stroke(); } });
    const board = cv(128, 128, (g) => { ['#3a2a1e', '#d8c9a8', '#7a2140', '#d8c9a8', '#c8922e'].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(64, 64, 62 - i * 13, 0, 7); g.fill(); }); });
    return { weave, wood: new THREE.MeshStandardMaterial({ color: lin(0x4a3526), roughness: 0.85 }), straw: new THREE.MeshStandardMaterial({ color: lin(0xb89a4a), roughness: 0.9 }),
      faceM: new THREE.MeshStandardMaterial({ map: face, roughness: 0.95 }), hatM: new THREE.MeshStandardMaterial({ color: lin(0x5a4c24), roughness: 0.8 }), boardM: new THREE.MeshStandardMaterial({ map: board, roughness: 0.8 }) };
  })();
  function makeDummy() {
    const g = new THREE.Group(), body = new THREE.Group(), hinge = new THREE.Group(), top = new THREE.Group();
    const S = { rx: 0, rz: 0, vx: 0, vz: 0, flash: 0, squash: 0, slump: 0, slumpTo: 0, pull: -1 };
    g.add(body); body.add(hinge); hinge.add(top); hinge.position.y = 0.98; top.position.y = -0.98; g.visible = false; stage.scene.add(g);      // the sack hangs from the top of the post
    const sackM = new THREE.MeshStandardMaterial({ roughness: 0.95, emissive: lin(0xb070ff), emissiveIntensity: 0, map: DM.weave });
    const mk = (par, geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; par.add(o); return o; };
    mk(g, new THREE.CylinderGeometry(0.34, 0.4, 0.1, 16), DM.wood, 0, 0.05, 0);
    mk(body, new THREE.CylinderGeometry(0.055, 0.065, 1.0, 10), DM.wood, 0, 0.55, 0);
    mk(top, new THREE.SphereGeometry(1, 24, 18), sackM, 0, 1.2, 0).scale.set(0.25, 0.5, 0.25);
    mk(top, new THREE.CylinderGeometry(0.035, 0.035, 1.25, 8), DM.wood, 0, 1.45, 0).rotation.z = Math.PI / 2;
    for (const s of [1, -1]) mk(top, new THREE.ConeGeometry(0.11, 0.3, 9), DM.straw, s * 0.72, 1.45, 0).rotation.z = s * Math.PI / 2;
    mk(top, new THREE.ConeGeometry(0.3, 0.16, 12), DM.straw, 0, 0.9, 0).rotation.x = Math.PI;
    mk(top, new THREE.SphereGeometry(0.2, 20, 14), DM.faceM, 0, 1.84, 0).rotation.y = -Math.PI / 2;
    mk(top, new THREE.ConeGeometry(0.15, 0.34, 10), DM.hatM, 0.03, 2.13, 0).rotation.z = -0.25;
    mk(top, new THREE.CylinderGeometry(0.2, 0.2, 0.03, 20), [DM.wood, DM.boardM, DM.wood], 0, 1.25, 0.26).rotation.x = Math.PI / 2;
    const blob = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ color: 0x06040a, transparent: true, opacity: 0.4, depthWrite: false, toneMapped: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.006; g.add(blob);
    return { g, body, hinge, S, sackM };
  }
  // a foe on this page: its numbers from the rules, the dummy that stands for it, and what the model is told about its Fate
  const foes = FOES.map((def, i) => ({ def, i, life: def.life, fate: 0, out: false, gone: false, D: makeDummy(), mark: { x: 0, y: 0, z: 0, r: 0.4, h: 2, k: 0, sealed: false } }));
  let foesOn = true;
  const foesShown = () => foesOn && (stage.square || roam.on), foeUp = (f) => f.D.g.visible && !f.gone;
  const standing = () => foes.filter((f) => !f.out), isSealed = (f) => !f.out && f.fate >= f.life;
  // where things stand: in the square the foes are on her casting side of the medallion; in the little theatre they only come out with Walk around
  function place() {
    const shown = foesShown();
    for (const f of foes) { const p = stage.square ? f.def.square : f.def.theatre, g = f.D.g; g.position.set(p[0], 0, p[1]); g.scale.setScalar(p[2]); g.visible = shown && !f.gone; g.rotation.y = Math.atan2(-p[0], -p[1]); }      // each faces the middle
    stage.lanterns.visible = !stage.square && roam.on;
    const R = roamR(), d = Math.hypot(roam.x, roam.z); if (d > R) { roam.x *= R / d; roam.z *= R / d; }
    stage.follow(roam.x, roam.z);
  }
  chip(toggleRow, 'Foes', (b) => { foesOn = !foesOn; b.setAttribute('aria-pressed', foesOn); place(); }, true);
  function dummyStep(f, dt) {
    const d = f.D.S; d.vx += (-70 * d.rx - 5.5 * d.vx) * dt; d.vz += (-70 * d.rz - 5.5 * d.vz) * dt; d.rx += d.vx * dt; d.rz += d.vz * dt; d.flash *= Math.exp(-dt * 4.5); d.squash *= Math.exp(-dt * 6);
    d.slump += (d.slumpTo - d.slump) * Math.min(1, dt * 5);
    const c = (v) => Math.max(-0.7, Math.min(0.7, v));
    f.D.body.rotation.set(c(d.rx), 0, c(d.rz)); f.D.hinge.rotation.set(0.42 * d.slump, 0, 0.14 * d.slump);      // beaten, it hangs forward on its post
    let s = 1, lift = 0;
    if (d.pull >= 0) { d.pull += dt; const p = Math.min(1, d.pull / 0.95); s = 1 - 0.55 * p * p; lift = 0.5 * p * p; }                                 // the seal, or the hole, draws it up and in
    f.D.body.scale.set(s * (1 + 0.25 * d.squash), s * (1 - 0.45 * d.squash), s * (1 + 0.25 * d.squash)); f.D.body.position.y = lift;
    f.D.sackM.emissiveIntensity = 0.8 * d.flash;
  }
  // a push on a foe, as hard as k says (0 to 1): away from her, or toward her when it is the foe that strikes
  function knock(f, k, toward) {
    const g = f.D.g, dx = g.position.x - roam.x, dz = g.position.z - roam.z, L = Math.hypot(dx, dz) || 1, p = toward ? -3.4 : 2.2 + 4.2 * k, d = f.D.S;
    const ca = Math.cos(g.rotation.y), sa = Math.sin(g.rotation.y), lx = (dx * ca - dz * sa) / L, lz = (dx * sa + dz * ca) / L;          // the push, as the dummy sees it
    d.vx += lz * p; d.vz += -lx * p; if (!toward) d.flash = Math.min(1, 0.4 + k);
  }

  // ---- the fight: Life and Fate on each foe, her own HP and MP, and what each of her moves does. Only what the rules say; nothing here is tuned. ----
  const her = { hp: RULES.hp, mp: RULES.mp }; let tgt = 0, turn = 0, hitTurn = 0, perils = 0, blow = null, cast = null, restAt = -1, watchTil = 0, watchF = null, friendPts = [];      // watch: the camera takes in the foes for a while after something happens to them
  const bars = $('bars'), fightNote = $('fightNote'), _pv = new THREE.Vector3(), num = (n) => Math.round(n).toLocaleString('en-US');
  for (const f of foes) { const el = document.createElement('div'); el.className = 'fbar'; el.innerHTML = '<i class="life"></i><i class="fate"></i><b></b>'; el.hidden = true; bars.appendChild(el); f.bar = el; f.barKey = ''; }
  function toScreen(v) { _pv.copy(v).project(stage.camera); if (_pv.z > 1 || Math.abs(_pv.x) > 1.3 || Math.abs(_pv.y) > 1.3) return null; return [(_pv.x * 0.5 + 0.5) * canvas.clientWidth, (-_pv.y * 0.5 + 0.5) * canvas.clientHeight]; }
  const _fp = new THREE.Vector3(), foeTop = (f, out) => out.set(f.D.g.position.x, 3.25 * f.D.g.scale.x, f.D.g.position.z), foeMid = (f, out) => out.set(f.D.g.position.x, 1.3 * f.D.g.scale.x, f.D.g.position.z);
  // a number or a word that rises from a place in the square and fades
  function floatAt(v, text, kind) {
    const p = toScreen(v); if (!p) return;
    const el = document.createElement('span'); el.className = 'pop ' + (kind || ''); el.textContent = text; el.style.left = Math.max(64, Math.min(canvas.clientWidth - 64, p[0])).toFixed(0) + 'px'; el.style.top = Math.max(40, p[1]).toFixed(0) + 'px';
    bars.appendChild(el); setTimeout(() => el.remove(), 1500);
  }
  function hurt(f, n) {
    n = Math.round(n); f.life = Math.max(0, f.life - n); floatAt(foeMid(f, _fp), '−' + num(n), 'dmg');
    if (f.life <= 0 && !f.out) { f.out = true; f.fate = 0; f.D.S.slumpTo = 1; f.D.S.squash = Math.max(f.D.S.squash, 0.35); }
  }
  function addFate(f, n) { if (f.out) return; f.fate += n; floatAt(foeTop(f, _fp), '+' + num(n) + ' ' + WORDS.fate, 'fate'); }
  function pickTarget() { if (foes[tgt].out) { const s = standing(); if (s.length) tgt = s[0].i; } tgtChip.textContent = WORDS.target + foes[tgt].def.label; return foes[tgt]; }
  function newFight() {
    for (const f of foes) { f.life = f.def.life; f.fate = 0; f.out = f.gone = false; const d = f.D.S; d.pull = -1; d.slump = d.slumpTo = 0; d.squash = 0.9; }
    her.hp = RULES.hp; her.mp = RULES.mp; tgt = 0; turn = 0; perils = 0; blow = null; cast = null; restAt = -1; J.game.catches = 0; J.charge = 0; place(); watchF = pickTarget(); watchTil = time + 2.6;
  }
  // a foe strikes her. Which foe: they take turns. A heavy blow comes only from a foe that has one.
  function foeBlow(heavy) {
    const s = standing(); let f = null;
    if (s.length) { if (heavy) { const hs = s.filter((o) => o.def.heavy); f = hs.length ? hs[turn % hs.length] : null; heavy = !!f; } if (!f) f = s[turn % s.length]; turn++; }
    blow = f ? { f, dmg: heavy ? f.def.heavy : f.def.blow, fate: heavy ? RULES.fateHeavy : RULES.fate } : null;
    if (f && foeUp(f)) knock(f, 0, true);
    play(HITS[hitTurn++ % HITS.length][0], f); watchF = f; watchTil = time + 3.0;
  }
  // the first time each of her friends drops below half, every foe gains Fate ("peril dust")
  function peril() { if (perils >= RULES.perils) return; perils++; for (const f of standing()) addFate(f, RULES.peril * f.def.life); watchF = pickTarget(); watchTil = time + 2.4; }
  // a cast that is cut short leaves nothing half done on a foe
  function settle() { for (const f of foes) if (!f.gone && f.D.S.pull >= 0) { f.D.S.pull = -1; f.D.S.squash = 0.5; } cast = null; }
  function play(id, f) {
    settle();
    if (f && foeUp(f) && AIMED[id]) { const p = f.D.g.position, dx = p.x - roam.x, dz = p.z - roam.z; roam.aim = Math.atan2(-dz, dx); J.targetDist = Math.hypot(dx, dz); } else { roam.aim = null; J.targetDist = 0; }
    if (CASTS[id]) {
      J.game.catches = 0;                             // she catches blows only until her next turn
      const others = f && (id === 'g_seal' || id === 'g_curtain') ? standing().filter((o) => o !== f) : [];
      cast = { id, f: f && foeUp(f) ? f : null, others };
      J.game.others = others.filter(foeUp).map((o) => ({ x: o.D.g.position.x, z: o.D.g.position.z, h: 2.25 * o.D.g.scale.x }));
      const th = roam.aim != null ? roam.aim : roam.face, cs = Math.cos(th), sn = Math.sin(th); friendPts = FRIENDS.map((p) => ({ x: roam.x + p[0] * cs + p[1] * sn, z: roam.z - p[0] * sn + p[1] * cs })); J.game.friends = friendPts;
    }
    move = id; faceTo = 0; J.play(id, true);
    if (J.stance === '' && J.STANCES.indexOf(state) >= 0) state = 'idle';             // a jump stands her up first
    press(); bookT0 = time;
  }
  function setMove(id) {
    if (id === 'idle' || id === 'walk') { J.stop(); move = ''; return setState(id); }      // kept for older callers
    if (id === 'hit') return foeBlow(false);
    let f = null;
    if (AIMED[id] && standing().length) {
      f = pickTarget();
      if (id === 'g_seal' || id === 'g_curtain') {
        const s = standing().filter(isSealed).sort((a, b) => b.def.life - a.def.life); if (s.length && !isSealed(f)) { f = s[0]; tgt = f.i; pickTarget(); }      // Sealed Fate goes to a sealed foe if there is one
        const cut = RULES.splash * f.def.life; if (standing().every((o) => o === f || o.life <= cut)) id = 'g_curtain';      // it would leave no foe standing: the same cast is Curtain Call
      }
    }
    play(id, f);
  }
  // what each blow of hers does, by the name the model gives it
  function onTag(nm, k, tag) {
    if (tag === 'struck') {                              // a foe's blow lands on her: she is hurt, that foe gains Fate, and one catch is used
      const b = blow; blow = null; if (!b) return;
      her.hp = Math.max(1, her.hp - b.dmg); floatAt(J.anchor('head', _fp), '−' + num(b.dmg), 'dmg'); addFate(b.f, b.fate);
      if (J.game.catches > 0) J.game.catches = J.game.catches - 1;
      return;
    }
    const c = cast; if (!c || c.id !== nm) return;
    const f = c.f;
    if (nm === 'taunt_heal') { if (tag === 'heal') { const was = her.hp; her.mp = Math.max(0, her.mp - RULES.healCost); her.hp = Math.min(RULES.hp, her.hp + RULES.heal); floatAt(J.anchor('head', _fp), her.hp > was ? '+' + num(her.hp - was) : WORDS.full, 'heal'); J.game.catches = RULES.catches; } return; }
    if (nm === 'taunt_attack' && tag === 'burst') J.game.catches = RULES.catches;
    if (!f) return;
    if (nm === 'g_rebuke') { hurt(f, RULES.rebuke); knock(f, k); }
    else if (nm === 'taunt_attack') { if (tag === 'press') f.D.S.squash = Math.max(f.D.S.squash, 0.5); else { hurt(f, RULES.taunt); knock(f, k); } }
    else if (tag === 'land') { if (f.fate < f.life) { f.fate = f.life; floatAt(foeTop(f, _fp), WORDS.sealed, 'fate'); } knock(f, k); }      // the button always works here: a foe that was not sealed is sealed as the seal lands
    else if (tag === 'zero') { f.life = 0; f.fate = 0; f.out = true; knock(f, k); f.D.S.slumpTo = 1; f.D.S.squash = Math.max(f.D.S.squash, 0.35); floatAt(foeMid(f, _fp), WORDS.ended, 'end'); }
    else if (tag === 'doom') { for (const o of nm === 'g_curtain' ? [f].concat(c.others) : [f]) if (!o.gone) o.D.S.pull = 0; }
    else if (tag === 'gone') {
      for (const o of nm === 'g_curtain' ? [f].concat(c.others) : [f]) { if (!o.out) floatAt(foeMid(o, _fp), WORDS.ended, 'end'); o.life = 0; o.fate = 0; o.out = o.gone = true; o.D.S.pull = -1; o.D.g.visible = false; }
    }
    else if (tag === 'splash') { const cut = RULES.splash * f.def.life; for (const o of c.others) if (!o.out) { hurt(o, nm === 'g_curtain' ? Math.max(cut, o.life) : cut); knock(o, k); } }      // Curtain Call leaves no foe standing
    else if (tag === 'rise') { friendPts.forEach((p, i) => setTimeout(() => floatAt(_fp.set(p.x, 1.55 + 0.25 * i, p.z), WORDS.stands, 'heal'), 180 * i)); }
  }
  const tgtChip = chip($('fight'), WORDS.target, () => { const s = standing(); if (!s.length) return; const at = s.findIndex((f) => f.i === tgt); tgt = s[(at + 1) % s.length].i; pickTarget(); }, null);
  chip($('fight'), 'A foe hits her', () => foeBlow(false), null);
  chip($('fight'), 'A heavy blow', () => foeBlow(true), null);
  chip($('fight'), 'A friend in peril', () => peril(), null);
  chip($('fight'), 'Stand the foes up', () => newFight(), null);
  function fightStep() {
    // what the model is told: Fate on each foe, her own dust following the foe nearest its seal, and where her friends lie
    let best = 0;
    foes.forEach((f, i) => {
      const m = f.mark, g = f.D.g, on = foeUp(f) && !f.out; m.x = g.position.x; m.z = g.position.z; m.r = 0.5 * g.scale.x; m.h = 2.25 * g.scale.x; m.k = on ? Math.min(1, f.fate / Math.max(1, f.life)) : 0; m.sealed = on && f.fate >= f.life;
      J.game.fates[i] = on ? m : null; if (on) best = Math.max(best, m.k);
      // its bar: the Life it has left, with Fate growing over it from the other end. When Fate covers all the Life that is left, it is sealed.
      const p = foeUp(f) ? toScreen(foeTop(f, _fp)) : null; f.bar.hidden = !p;
      if (p) { f.bar.style.left = Math.max(58, Math.min(canvas.clientWidth - 58, p[0])).toFixed(0) + 'px'; f.bar.style.top = Math.max(30, p[1] - 6).toFixed(0) + 'px';
        const key = f.life + '/' + f.fate + '/' + f.out; if (key !== f.barKey) { f.barKey = key; const L = f.life / f.def.life, F = Math.min(L, f.fate / f.def.life);
          f.bar.children[0].style.width = (100 * L).toFixed(1) + '%'; f.bar.children[1].style.width = (100 * F).toFixed(1) + '%';
          f.bar.children[2].textContent = f.out ? f.def.label + ' · ' + WORDS.ended.toLowerCase() : f.def.label + ' ' + num(f.life) + (m.sealed ? ' · ' + WORDS.sealed : f.fate ? ' · ' + WORDS.fate + ' ' + num(f.fate) : '');
          f.bar.classList.toggle('sealed', m.sealed); f.bar.classList.toggle('out', f.out); } }
    });
    const casting = J.action === 'g_seal' || J.action === 'g_curtain';
    if (!casting && Math.abs(J.charge - best) > 1e-3) J.charge = best;
    // when no foe is left and she has finished, a new pair is stood up
    if (!standing().length && !J.action) { if (restAt < 0) restAt = time + 3.2; else if (time >= restAt) newFight(); } else restAt = -1;
    const note = 'Her HP ' + num(her.hp) + ' of ' + num(RULES.hp) + ' · MP ' + her.mp + ' of ' + RULES.mp + (J.game.catches ? ' · catching ' + J.game.catches + ' more blow' + (J.game.catches > 1 ? 's' : '') : '') + (perils ? ' · friends in peril ' + perils + ' of ' + RULES.perils : '');
    if (note !== fightNote.textContent) fightNote.textContent = note;
  }

  // ---- quick buttons on the stage: cast the chosen spell, step through the spells, jump, and a flourish; keys: 1 to 5 cast, Q and E choose, F casts, R flourish, Space jumps ----
  const FLOUR = ['wave', 'bow', 'twirl', 'laugh', 'dance', 'caper', 'prance', 'juggle', 'talk']; let qi = 0, fi = 0;
  const qName = $('qName'), qShow = () => { qName.textContent = GAME[qi][1]; };
  const qStep = (d) => { qi = (qi + d + GAME.length) % GAME.length; qShow(); };
  const qCast = () => setMove(GAME[qi][0]), qFlour = () => { setMove(FLOUR[fi]); fi = (fi + 1) % FLOUR.length; };
  $('qPrev').addEventListener('click', () => qStep(-1)); $('qNext').addEventListener('click', () => qStep(1)); $('qCast').addEventListener('click', qCast); $('qJump').addEventListener('click', () => setMove('jump')); $('qMove').addEventListener('click', qFlour);
  $('qHit').addEventListener('click', () => foeBlow(false));
  for (const id of ['pad2', 'joy']) $(id).addEventListener('pointerdown', (e) => e.stopPropagation());
  const DIG = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'];
  function quickKey(code) {
    const d = DIG.indexOf(code); if (d >= 0 && d < GAME.length) { qi = d; qShow(); qCast(); return true; }
    if (code === 'KeyH') { foeBlow(false); return true; } if (code === 'KeyG') { foeBlow(true); return true; } if (code === 'KeyP') { peril(); return true; }
    if (code === 'KeyQ') { qStep(-1); return true; } if (code === 'KeyE') { qStep(1); return true; } if (code === 'KeyF' || code === 'Enter') { qCast(); return true; } if (code === 'KeyR') { qFlour(); return true; }
    if (code === 'Space') { setMove('jump'); return true; }
    return false;
  }
  qShow();

  // ---- what a spell does to the room: the picture jolts or sways, light flashes from where it lands, and motes cross the whole stage ----
  const sfx = $('sfx'), sg = sfx.getContext('2d'), MOTES = [], calm = matchMedia('(prefers-reduced-motion: reduce)').matches, _hp = new THREE.Vector3();
  // her power is cold and pale: star dust, not confetti. Only the gold of Gilded Rebuke scatters.
  const LOOK = { jump: ['226,210,255', 'dust', 0], g_rebuke: ['255,206,112', 'burst', 0], g_seal: ['222,228,255', 'none', 1], 'g_seal:splash': ['200,206,255', 'none', 0], g_curtain: ['222,228,255', 'none', 1], 'g_curtain:splash': ['200,206,255', 'none', 0], 'g_curtain:gone': ['226,232,255', 'rain', 1],
    taunt_attack: ['222,228,255', 'none', 1], 'taunt_attack:press': ['200,206,255', 'none', 0], taunt_heal: ['236,230,214', 'none', 0], hit_laugh: ['255,222,150', 'none', 0], hit_dust: ['255,222,150', 'none', 0] };
  const QUIETHIT = { land: 1, doom: 1, rise: 1 };                           // blows that only touch a foe, and her friends getting up: the room does not answer
  let shakeK = 0, swayK = 0, swayT = 9, flashK = 0, flashC = '200,150,255', flashX = 0.5, flashY = 0.5, hitSeen = 0;
  const R = Math.random, mote = (x, y, vx, vy, life, size, c, o) => { if (MOTES.length < 420) MOTES.push(Object.assign({ x, y, vx, vy, life, max: life, size, c, g: 0, drag: 0, kind: 0, a: R() * 6.28, w: 0 }, o || {})); };
  function roomHit(name, k, tag) {
    const L = LOOK[name + ':' + tag] || LOOK[name] || ['220,200,255', 'burst', 0], W = sfx.width, H = sfx.height, u = W / 400, c = L[0], self = /^hit_/.test(name);
    let hx = 0.5, hy = 0.5; try { J.anchor(name === 'jump' ? 'feet' : 'hit', _hp).project(stage.camera); if (Math.abs(_hp.x) < 1.4 && Math.abs(_hp.y) < 1.4) { hx = _hp.x * 0.5 + 0.5; hy = -_hp.y * 0.5 + 0.5; } } catch (e) {}
    const x0 = hx * W, y0 = hy * H;
    if (!calm) { shakeK = Math.max(shakeK, k); if (L[2]) { swayK = k; swayT = 0; } }
    if (name !== 'jump') { flashK = (0.55 * k + 0.15) * (self ? 0.6 : L[1] === 'none' ? 0.5 : 1); flashC = c; flashX = hx; flashY = hy; }
    const n = L[1] === 'none' ? 0 : Math.round((L[1] === 'dust' ? 22 : 60 + 70 * k) * (small ? 0.7 : 1));      // her darker moves bring their own dust
    for (let i = 0; i < n; i++) {
      const a = R() * 6.283, sp = (120 + 620 * R() * R()) * u * (0.6 + k);
      if (L[1] === 'burst') mote(x0, y0, Math.cos(a) * sp, Math.sin(a) * sp, 0.5 + 0.8 * R(), (1.2 + 2.6 * R()) * u, c, { drag: 2.4, g: 120 * u });
      else if (L[1] === 'rain') mote(R() * W, -R() * H * 0.9, (R() - 0.5) * 30 * u, (90 + 260 * R()) * u, 1.6 + 1.4 * R(), (0.9 + 1.8 * R()) * u, R() < 0.25 ? '255,255,255' : c, { w: 2 + 3 * R() });
      else mote(x0 + (R() - 0.5) * 60 * u, y0, (R() - 0.5) * 300 * u, -R() * 40 * u, 0.5 + 0.4 * R(), (1.4 + 2 * R()) * u, c, { drag: 3 });
    }
  }
  function roomStep(dt) {
    const hn = J.state.hitN || 0; if (hn !== hitSeen) { hitSeen = hn; const nm = J.state.hitName, k = J.state.hitK || 0.5, tag = J.state.hitTag || ''; onTag(nm, k, tag); if (!QUIETHIT[tag]) roomHit(nm, k, tag); }
    for (const f of foes) dummyStep(f, dt);
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
      sg.beginPath(); sg.arc(m.x, m.y, m.size, 0, 6.283); sg.fill();
    }
    sg.globalCompositeOperation = 'source-over';
  }

  // ---- loop ----
  let manual = false;
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
      const to = J.action && AIMED[J.action] && roam.aim != null ? roam.aim : 0; let df = to - roam.face; df = Math.atan2(Math.sin(df), Math.cos(df)); roam.face += df * Math.min(1, dt * 8);      // she turns her casting side to her target, then back to the audience
      J.root.rotation.y = roam.face + J.spin;
    }
    if (move && !J.action && !J.pending) { if (cast && cast.f) { watchF = cast.f; watchTil = time + 1.8; } move = ''; cast = null; press(); bookT0 = time; }      // the camera stays on the foes a moment after a cast, so what it did can be read
    // left standing, she looks about or settles her weight now and then
    if (state === 'idle' && !move && !J.action && going < 0.05 && wbTo === 0) { roam.idleT += dt; if (roam.idleT > roam.idleNext) { roam.idleT = 0; roam.idleNext = 6 + Math.random() * 7; J.play(Math.random() < 0.5 ? 'look_around' : 'settle', false); } } else roam.idleT = 0;
    // the camera is settled first, so effects that face it or hang before it are drawn for this frame's view
    const sq = stage.square;
    { const m = find(move || state), cam = m[4] && J.action === m[0] ? m[4](J.time) : null; needHalf = cam ? cam[0] : m[2]; needV = (cam && cam[2]) || m[3] || 1.12; tyWant = (cam && cam[3]) || 0.95; camX += ((cam ? cam[1] : 0) - camX) * Math.min(1, dt * 3);
      // when she casts at a foe the camera takes in her, her target and any foe the cast will reach; after a blow or a cast it stays on the foes for a moment
      const casting = cast && cast.f && J.action === cast.id && AIMED[cast.id], wf = casting ? cast.f : time < watchTil && watchF && foeUp(watchF) ? watchF : time < watchTil ? foes.find(foeUp) : null;
      const c = wf || null, tp = c ? wf.D.g.position : null, share = c ? 0.5 : 0, ddx = c ? tp.x - roam.x : 0, ddz = c ? tp.z - roam.z : 0;
      let far = c ? Math.hypot(ddx, ddz) : 0; if (c) for (const o of casting ? cast.others : foes) if (foeUp(o)) far = Math.max(far, Math.hypot(o.D.g.position.x - roam.x, o.D.g.position.z - roam.z));
      const wide = c ? far * 0.62 + 0.7 : 0;
      let cx = roam.x + ddx * share, cz = roam.z + ddz * share;
      if (roam.on) needHalf = Math.max(wide, cam ? Math.max(1.05, cam[0]) : needHalf, 1.05); else { needHalf = Math.max(needHalf, wide); if (!c) cx = camX; }
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
    fightStep();
    J.animate(phase, wb, time, dt, rb);
    // the square: fireflies drift, the lamps and the night answer her spells, and her spell light falls on the flagstones too
    if (sq) { SQ.flies(time); const k = Math.max(J.dark || 0, 0.55 * J.dim); stage.dark = 1 - Math.pow(1 - 0.97 * k, 2); const sl = J.spellLight; SQ.spell.position.copy(sl.position); SQ.spell.color.copy(sl.color); SQ.spell.intensity = sl.intensity * 1.3; }
    stage.dim = J.dim;
    if (draw) stage.render(); roomStep(dt);
    if (showBook && draw) drawBook();
    const a = J.action, m = find(move || state);
    hud.textContent = m[1] + (a ? '  ' + J.time.toFixed(1) + ' / ' + J.ACTIONS[a].dur.toFixed(1) + ' s' : '') + '  ·  ' + Math.round(J.triangles / 1000) + 'k triangles';
  }
  J.game.fates = foes.map(() => null);
  loadClip('idle');
  newFight();
  if (stage.square && QS.get('walk') !== '0') setRoam(true); else if (stage.square) { viewEl = 0.14; viewAz = 0; }
  requestAnimationFrame((t) => { last = t; frame(t); });
  window.JESTER = { J, stage, SQ, setMove, setState, setRoam, STATES, ACTS, GAME, RULES, roam, foes, her, orbit, foeBlow, peril, newFight,
    // for checks: step the page by hand (n frames of dt seconds, drawing the last), or hand it back to the clock
    set zoom(v) { zoomUser = v; }, view(az, el) { viewAz = az; viewEl = el; },
    step(n, dt) { manual = true; for (let i = 0; i < n; i++) advance(dt || 1 / 30, i === n - 1); }, run() { manual = false; last = performance.now(); } };
})();
