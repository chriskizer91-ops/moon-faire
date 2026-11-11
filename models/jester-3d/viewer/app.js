// app.js: the viewer. Builds the stage and the Jester, wires the move chips, orbit, the flipbook inset and pixel mode.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('stage'), box = $('stagebox'), hud = $('hud'), err = $('err');
  const MOVES = [
    ['idle', 'Idle', 0.7], ['walk', 'Walk', 0.7], ['curtain_call', 'Curtain Call', 1.0], ['sealed_fate', 'Sealed Fate', 0.8], ['against_all_odds', 'Against All Odds', 0.82],
    ['gilded_rebuke', 'Gilded Rebuke', 1.28], ['hush', 'Hush', 1.05], ['gravity', 'Gravity', 1.1]
  ];
  const VIEWS = [['Front', 0, 0.10, 1], ['Three-quarter', -0.62, 0.14, 1], ['Side', -1.5708, 0.08, 1], ['Back', 3.1416, 0.12, 1], ['Face', 0.22, 0.02, 0.27]];
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  let stage, J;
  try {
    if (!window.THREE) throw new Error('three.js did not load');
    stage = makeStage(canvas, { shadow: small ? 1024 : 2048 });
    J = makeJester({ detail: small ? 0.75 : 1, textureScale: small ? 0.75 : 1 });
    stage.scene.add(J.root, J.fx);
  } catch (e) { err.hidden = false; err.textContent = 'This page needs WebGL to draw her. ' + (e && e.message ? e.message : ''); return; }
  const orbit = stage.orbit; orbit.az = 0; orbit.el = 0.10; orbit.target.y = 0.95;
  let move = 'idle', wb = 0, wbTo = 0, phase = 0, time = 0, spin = false, slow = false, showBook = true;
  stage.look = 'smooth';      // the painted face and fabrics show in the smooth look; the flipbook look is a switch
  let needHalf = 0.86, zoomUser = 1, faceMode = 0, faceTo = 0, viewAz = null, viewEl = null, last = performance.now();

  // ---- chips ----
  const chipRow = $('moves'), viewRow = $('views'), toggleRow = $('toggles');
  function chip(parent, label, on, pressed) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label; if (pressed != null) b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.addEventListener('click', () => on(b)); parent.appendChild(b); return b;
  }
  const moveChips = {};
  for (const [id, label, half] of MOVES) moveChips[id] = chip(chipRow, label, () => setMove(id), id === 'idle');
  function setMove(id) {
    move = id; const m = MOVES.find((x) => x[0] === id); needHalf = m[2]; faceTo = 0;
    for (const k in moveChips) moveChips[k].setAttribute('aria-pressed', k === id ? 'true' : 'false');
    wbTo = id === 'walk' ? 1 : 0;
    if (id !== 'idle' && id !== 'walk') J.play(id, true); else J.stop();
    bookT0 = time;
  }
  for (const [label, az, el, face] of VIEWS) chip(viewRow, label, () => { viewAz = az; viewEl = el; faceTo = face < 1 ? 1 : 0; spin = false; spinChip.setAttribute('aria-pressed', 'false'); });
  const spinChip = chip(toggleRow, 'Turntable', (b) => { spin = !spin; viewAz = null; b.setAttribute('aria-pressed', spin); }, false);
  chip(toggleRow, 'Flipbook', (b) => { showBook = !showBook; b.setAttribute('aria-pressed', showBook); $('book').hidden = !showBook; }, true);
  chip(toggleRow, 'Flipbook look', (b) => { stage.look = stage.look === 'flipbook' ? 'smooth' : 'flipbook'; b.setAttribute('aria-pressed', stage.look === 'flipbook'); }, false);
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
    const c = FB.clips[move]; if (!c) return;
    if (bookClip !== move) { bookClip = move; loadClip(move); }
    const t = (move === 'idle' || move === 'walk') ? time : (J.action === move ? J.time : -1);
    let i = t < 0 ? 0 : Math.floor(t * c.fps); i = (move === 'idle' || move === 'walk') ? i % c.frames.length : Math.min(c.frames.length - 1, i);
    const n = c.frames[i], im = imgs[n], f = FB.frames[n], W = book.width, H = book.height;
    bctx.clearRect(0, 0, W, H); if (!im || !im.complete || !im.naturalWidth) return;
    const k = (H * 0.92) / 215, wide = move === 'gilded_rebuke' || move === 'hush' || move === 'gravity' ? 0.36 : 0.5;
    bctx.imageSmoothingEnabled = true; bctx.drawImage(im, W * wide - f[2] * k, H * 0.97 - f[3] * k, f[0] * k, f[1] * k);
  }

  // ---- loop ----
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.05, (now - last) / 1000); last = now; if (slow) dt *= 0.5;
    time += dt; wb += (wbTo - wb) * Math.min(1, dt * 5); if (wb > 0.001) phase += dt * 4.9;
    if (move !== 'idle' && move !== 'walk' && !J.action) setMove('idle');
    J.animate(phase, wb, time, dt);
    // camera: fit the move, ease to a chosen view, or turn slowly
    if (spin) orbit.az += dt * 0.5;
    if (viewAz != null) { let d = viewAz - orbit.az; d = Math.atan2(Math.sin(d), Math.cos(d)); orbit.az += d * Math.min(1, dt * 5); orbit.el += (viewEl - orbit.el) * Math.min(1, dt * 5); if (Math.abs(d) < 0.003) viewAz = null; }
    faceMode += (faceTo - faceMode) * Math.min(1, dt * 4);
    const asp = stage.camera.aspect, th = Math.tan(orbit.fov * Math.PI / 360), fitDist = Math.max(needHalf / (th * asp), 1.12 / th);
    const want = (fitDist * (1 - faceMode) + 1.75 * faceMode) * zoomUser;
    orbit.dist += (want - orbit.dist) * Math.min(1, dt * 3.5);
    orbit.target.y += ((0.95 * (1 - faceMode) + 1.5 * faceMode) - orbit.target.y) * Math.min(1, dt * 4);
    stage.dim = J.dim;
    stage.render();
    if (showBook) drawBook();
    const a = J.action, m = MOVES.find((x) => x[0] === move);
    hud.textContent = m[1] + (a ? '  ' + J.time.toFixed(1) + ' / ' + J.ACTIONS[a].dur.toFixed(1) + ' s' : '') + '  ·  ' + Math.round(J.triangles / 1000) + 'k triangles';
  }
  loadClip('idle');
  requestAnimationFrame((t) => { last = t; frame(t); });
  window.JESTER = { J, stage, setMove };
})();
