// ow-main.js: the open world page. The Jester (her Lightest weight) walks the land between the fair and the pool with a camera behind her
// that can be turned; the land is made round her as she goes; the painted places stand where the map has them, their fair folk with them.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id), D = window.OW_DATA, OW = window.OW, QS = new URLSearchParams(location.search);
  const canvas = $('stage'), box = $('stagebox');
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TEST = !!window.OW_TEST, others = []; let weight = QS.get('w') || 'lightest';      // Chris, November 14: Lightest is right for walking, on the laptop and the phone
  let renderer, world, cast, camera, land, terrain, water, places, props, fires, tufts, flora, rig, J = null, ready = false, time = 0, last = performance.now();
  const manual = /[?&]shot/.test(location.search);
  function fail(e) { $('err').hidden = false; $('errtext').textContent = 'This page needs WebGL to draw. ' + (e && e.message ? e.message : e); $('loading').hidden = true; console.error(e); }

  // ---- her, and how she moves ----
  const me = { x: 0, z: 0, y: 0, face: 0, vx: 0, vz: 0, wb: 0, rb: 0, phase: 0, goal: null, stuck: 0, idleT: 0, idleNext: 6 };
  const VIEWS = [2.3, 6.5];
  const ZOOM_WALK = 1.15, ZOOM_RUN = 2.75, ZOOM_FAR = 14; const cam = { yaw: 0, pitch: 0.30, dist: VIEWS[0], d: VIEWS[0], view: 0, yawTo: null, lastDrag: -10, y: 0 };
  const keys = {}, lastTap = {}; let runLatch = false, near = null, talk = null, moorK = 0, paused = false;
  const blockIndex = new Map(); let allBlockers = [];
  function indexBlockers() { blockIndex.clear(); for (const b of allBlockers) { const r = b.r || Math.hypot(b.w, b.d); for (let i = Math.floor((b.x - r) / 8); i <= Math.floor((b.x + r) / 8); i++) for (let j = Math.floor((b.z - r) / 8); j <= Math.floor((b.z + r) / 8); j++) { const k = i + ',' + j; if (!blockIndex.has(k)) blockIndex.set(k, []); blockIndex.get(k).push(b); } } }
  function hits(x, z, pad) {
    const L = blockIndex.get(Math.floor(x / 8) + ',' + Math.floor(z / 8)); if (!L) return false;
    for (const b of L) { const dx = x - b.x, dz = z - b.z; if (b.r) { if (dx * dx + dz * dz < (b.r + pad) * (b.r + pad)) return true; } else { const c = Math.cos(b.a || 0), s = Math.sin(b.a || 0), lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < b.w + pad && Math.abs(lz) < b.d + pad) return true; } }
    return false;
  }
  function ground(x, z, pad) {                                                                    // can a body stand here, people not counted (the fair folk find their way by this)
    if (Math.abs(x) > 378 || Math.abs(z) > 250 || hits(x, z, pad == null ? 0.22 : pad)) return false;      // the cheap test first: this is asked for many spots at once
    const h = land.height(x, z); if (h < land.WL + 0.25) return false;
    for (const p of water.pools) { const dx = (x - p.x) / (p.rx * 1.15), dz = (z - p.z) / (p.rz * 1.15); if (dx * dx + dz * dz < 1) return false; }
    const e = 0.45, s = Math.max(Math.abs(land.height(x + e, z) - land.height(x - e, z)), Math.abs(land.height(x, z + e) - land.height(x, z - e))) / (2 * e); return s <= 0.95;
  }
  function free(x, z) {
    if (Math.abs(x) > 378 || Math.abs(z) > 250) return false;
    const h = land.height(x, z); if (h < land.WL + 0.25) return false;                            // the sea, the river, the marsh pools: too deep
    for (const p of water.pools) { const dx = (x - p.x) / (p.rx * 1.15), dz = (z - p.z) / (p.rz * 1.15); if (dx * dx + dz * dz < 1) return false; }
    const e = 0.45, s = Math.max(Math.abs(land.height(x + e, z) - land.height(x - e, z)), Math.abs(land.height(x, z + e) - land.height(x, z - e))) / (2 * e); if (s > 0.95) return false;      // too steep to climb
    for (const p of places.people) if (Math.hypot(x - p.x, z - p.z) < 0.45) return false;
    return !hits(x, z, 0.22);
  }
  const WALK = 2.0, RUN = 4.4;            // metres a second (Chris: the old run as the walk, and the run about twice that)
  function stepHer(dt, t) {
    let ix = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), iz = (keys.u ? 1 : 0) - (keys.d ? 1 : 0), mag = Math.hypot(ix, iz), run = runLatch || !!keys.shift;
    if (talk) { ix = iz = mag = 0; }
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
    let dx = 0, dz = 0;
    if (mag > 0) { dx = (rx * ix + fx * iz) / mag; dz = (rz * ix + fz * iz) / mag; me.goal = null; }
    else if (me.goal) { const gx = me.goal.x - me.x, gz = me.goal.z - me.z, d = Math.hypot(gx, gz); if (d < 0.25) me.goal = null; else { dx = gx / d; dz = gz / d; mag = Math.min(1, d / 0.6); run = !!me.goal.run || d > 12; } }
    const act = J.action && !/^(look_around|settle)$/.test(J.action);
    if (mag > 0 && J.action && !act) J.stop();
    const can = !act && !J.stanceNow && !J.pending && !talk, speed = can && mag > 0 ? (run ? RUN : WALK) * Math.min(1, mag) : 0;
    const k = Math.min(1, dt * 7); me.vx += (dx * speed - me.vx) * k; me.vz += (dz * speed - me.vz) * k;
    const nx = me.x + me.vx * dt, nz = me.z + me.vz * dt, was = [me.x, me.z];
    if (free(nx, nz)) { me.x = nx; me.z = nz; } else if (free(nx, me.z)) { me.x = nx; me.vz *= 0.5; } else if (free(me.x, nz)) { me.z = nz; me.vx *= 0.5; } else { me.vx = me.vz = 0; }
    const v = Math.min(Math.hypot(me.x - was[0], me.z - was[1]) / Math.max(dt, 1e-4), Math.hypot(me.vx, me.vz));
    if (me.goal) { me.stuck = v < 0.05 && mag > 0 ? me.stuck + dt : 0; if (me.stuck > 0.6) me.goal = null; }
    if (talk) { let df = Math.atan2(talk.who.x - me.x, talk.who.z - me.z) - me.face; df = Math.atan2(Math.sin(df), Math.cos(df)); me.face += df * Math.min(1, dt * 6); }
    else if (v > 0.06) { let df = Math.atan2(me.vx, me.vz) - me.face; df = Math.atan2(Math.sin(df), Math.cos(df)); me.face += df * Math.min(1, dt * 9); }
    me.wb += (Math.min(1, v / 0.3) - me.wb) * Math.min(1, dt * 8); me.rb += (Math.max(0, Math.min(1, (v - 1.0) / 1.0)) - me.rb) * Math.min(1, dt * 5);
    if (me.wb > 0.001) me.phase += dt * Math.max(2.0, v * (7.66 * (1 - me.rb) + 4.2 * me.rb) / (1 + 0.55 * THREE.MathUtils.smoothstep(v, 2.2, 4.4)));      // a longer stride as she speeds up
    if (v < 0.05 && !J.action && !talk) { me.idleT += dt; if (me.idleT > me.idleNext) { me.idleT = 0; me.idleNext = 7 + Math.random() * 8; J.play(Math.random() < 0.5 ? 'look_around' : 'settle', false); } } else me.idleT = 0;
    const gy = land.height(me.x, me.z); me.y += (gy - me.y) * Math.min(1, dt * 14); if (Math.abs(gy - me.y) > 0.6) me.y = gy;
    J.root.position.set(me.x, me.y, me.z); J.root.rotation.y = me.face + (J.spin || 0);
    J.animate(me.phase, me.wb, t, dt, me.rb);
    return v;
  }

  // ---- the camera: behind her, turned by dragging or with Q and E, closer or farther with the wheel; it follows her round as she walks ----
  const camT = new THREE.Vector3();
  function stepCam(dt, v) {
    const moving = v > 0.3 && !talk, sinceDrag = time - cam.lastDrag;
    if (keys.q) { cam.yaw += dt * 1.6; cam.lastDrag = time; } if (keys.e) { cam.yaw -= dt * 1.6; cam.lastDrag = time; }
    if (moving && sinceDrag > 1.5) {                                // ease round behind her while she goes forward (not when she turns to come back toward the camera)
      const behind = me.face + Math.PI; let d = behind - cam.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      if (Math.abs(d) < 1.9) cam.yaw += d * Math.min(1, dt * 0.9 * Math.min(1, v / 1.2));
    }
    camT.set(me.x, me.y + 1.25, me.z);
    { const want = talk ? cam.dist : Math.max(cam.dist, Math.min(ZOOM_FAR, cam.dist * (1 + ZOOM_WALK * THREE.MathUtils.smoothstep(v, 0.15, 1.6) + ZOOM_RUN * THREE.MathUtils.smoothstep(v, 2.4, 4.2)))); cam.d += (want - cam.d) * Math.min(1, dt * (want < cam.d ? 1.8 : 2.4)); }
    let dist = cam.d; const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    // keep the camera out of the ground: pull it in if a hill is between it and her, and lift it over the ground under it
    for (let i = 1; i <= 8; i++) { const t2 = dist * i / 8, x = camT.x + Math.sin(cam.yaw) * cp * t2, z = camT.z + Math.cos(cam.yaw) * cp * t2, y = camT.y + sp * t2; if (land.height(x, z) + 0.3 > y && i > 2) { dist = Math.max(1.6, dist * (i - 1) / 8); break; } }
    const x = camT.x + Math.sin(cam.yaw) * cp * dist, z = camT.z + Math.cos(cam.yaw) * cp * dist; let y = camT.y + sp * dist; y = Math.max(y, land.height(x, z) + 0.45);
    cam.y = y; camera.position.set(x, y, z); camera.lookAt(camT); camera.updateMatrixWorld();
  }

  // ---- talking: the fair folk near her ----
  function stepPeople(dt) {
    near = null; let nd = 2.4;
    if (OW.folk) OW.folk.step(dt, talk && talk.who);                    // the fair folk's minds and their small talk (ow-folk.js); a person with a mind turns and walks by it
    for (const p of places.people) {
      const d = Math.hypot(p.x - me.x, p.z - me.z);
      if (p.root) p.root.visible = d < 90;
      if (p.npc) { if (!p.mind) { if (d < 3.4 || (talk && talk.who === p)) p.npc.face(me.x, me.z); else p.npc.face(p.x + Math.sin(p.home) * 6, p.z + Math.cos(p.home) * 6); } p.asleep = d >= 90; if (!p.asleep) p.npc.update(dt); }      // far out of sight they stand still, minds and all
      else if (p.standIn && p.root && d < 3.4) p.root.rotation.y = Math.atan2(me.x - p.x, me.z - p.z);
      if (d < nd) { nd = d; near = p; }
    }
    prompt(talk ? '' : near ? 'Talk to ' + near.name.charAt(0).toLowerCase() + near.name.slice(1) : '');
  }
  function act() {
    if (!ready) return;
    if (talk) { if (!bub.done) { revealAll(); return; } talk.i++; if (talk.i >= talk.says.length) endTalk(); else { say(talk.who.name, talk.says[talk.i], talk.i, talk.says.length); if (talk.lines) OW.folk.line(talk.who, talk.lines[talk.i]); } return; }      // the first press shows the whole line, the next goes on
    if (!near) return; me.goal = null; const w = near;
    const lines = OW.folk ? OW.folk.lines(w) : null, says = lines ? lines.map((l) => l.text) : w.says;      // from the written bank, chosen by what has happened (people/talk); the place's own few lines if the bank has none
    if (!says.length) return toast(w.name + ' has nothing to say yet.');
    talk = { who: w, i: 0, says, lines }; if (w.npc) { w.npc.face(me.x, me.z); if (!w.met) w.npc.greet(); w.npc.talk(true); } w.met = true; say(w.name, says[0], 0, says.length); if (lines && w.met2) OW.folk.line(w, lines[0]); w.met2 = true;
  }
  function endTalk() { if (!talk) return; if (talk.who.npc) talk.who.npc.talk(false); if (OW.folk) OW.folk.ended(talk.who); talk = null; say(null); }
  // a line arrives a few letters at a time: every letter is laid out at once (so the bubble keeps its size) and shown by its opacity, so typing never moves anything
  const CPS = 42, REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function say(name, line, i, n) {
    const e = $('say'); if (!name) { e.hidden = true; if (bub.el === e) hideBubble(); return; }
    $('sayname').textContent = name; const L = $('sayline'), frag = document.createDocumentFragment(); L.textContent = ''; bub.chars = [];
    for (const ch of line) { const s = document.createElement('span'); s.textContent = ch; frag.appendChild(s); bub.chars.push(s); }
    L.appendChild(frag); bub.shown = 0; bub.typed = 0; bub.done = false;
    e.classList.remove('done'); e.classList.toggle('last', i + 1 >= n); $('saynext').setAttribute('aria-label', i + 1 < n ? 'Next (' + (i + 1) + ' of ' + n + ')' : 'Done');
    $('saysr').textContent = name + ': ' + line;
    e.hidden = false; showBubble(e, talk.who); if (REDUCED) revealAll();
  }
  function revealAll() { for (const s of bub.chars) s.className = 'on'; bub.shown = bub.chars.length; bub.done = true; $('say').classList.add('done'); }
  function stepType(dt) {
    if (bub.done || bub.el !== $('say')) return;
    bub.typed += dt * CPS; const k = Math.min(bub.chars.length, Math.floor(bub.typed));
    while (bub.shown < k) { const s = bub.chars[bub.shown++]; s.className = 'on'; const c = s.textContent; if (c === ',') bub.typed -= 3; else if (/[.!?]/.test(c)) bub.typed -= 7; }      // a breath at a comma, a longer one at a full stop
    if (bub.shown >= bub.chars.length) revealAll();
  }
  // near someone and not talking: a small bubble over them is the invitation (tap it, or E, Space or Enter)
  function prompt(t) { const e = $('prompt'); if (e._t !== t) { e._t = t; e.hidden = !t; e.querySelector('.sr').textContent = t; if (t) showBubble(e, near); else if (bub.el === e) hideBubble(); } }
  function toast(t) { const e = $('toast'); e.textContent = t; e.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => { e.hidden = true; }, 3800); }

  // ---- the bubble over a speaker's head: the top of the head through the camera each frame; one transform moves the bubble, one its tail ----
  // Above the head when there is room; beside it (away from her, in the middle) when the head is near the top; kept inside the picture,
  // with the tail leaving whichever edge faces the head, so it still points the right way when the speaker is at an edge or out of the picture.
  const bub = { el: null, who: null, w: 0, h: 0, mW: 0, placeR: 0, barL: 1e9, rib: 0, mB: 30, x: 0, y: 0, pick: -1, snap: true, chars: [], shown: 0, typed: 0, done: true };
  const headV = new THREE.Vector3(), tail = $('tail');
  function headOf(p, out) { if (p.npc && p.npc.headTop) return p.npc.headTop(out); const y = p.root ? p.root.position.y : p.y; return out.set(p.x, y + (p.standIn ? 2.3 : 1.9), p.z); }
  function measure(el) { bub.w = el.offsetWidth; bub.h = el.offsetHeight; bub.mW = canvas.clientWidth; bub.placeR = 8 + $('place').offsetWidth + 6; bub.barL = bub.mW - 8 - $('bar').offsetWidth - 6; bub.rib = el.id === 'say' ? 12 + $('sayname').offsetWidth + 8 : 0; bub.mB = $('meter').hidden ? 10 : $('meter').offsetHeight + 12; }      // once a line, not every frame
  function showBubble(el, who) { if (bub.el && bub.el !== el) bub.el.hidden = true; bub.el = el; bub.who = who; measure(el); bub.snap = true; bub.pick = -1; tail.removeAttribute('hidden'); if (ready) placeBubble(0); }
  function hideBubble() { bub.el = null; bub.who = null; tail.setAttribute('hidden', ''); }      // (an SVG element has no .hidden of its own)
  // Where it goes: a few places round the head (above it, above and to either side, beside it) are each scored: covering her head or the speaker's
  // face costs most, a tail that cannot reach costs some, beside costs a little more than above, and staying where it was saves a little (so it
  // does not flit between two). The winner is clamped inside the picture, below the corner mark and the buttons where they are.
  const herV = new THREE.Vector3();
  function placeBubble(dt) {
    const el = bub.el; if (!el || !bub.who || !camera) return;
    const W = canvas.clientWidth, H = canvas.clientHeight; if (W !== bub.mW) measure(el);
    const tanH = Math.tan(camera.fov * Math.PI / 360), ppm = (v) => H / (2 * Math.max(0.3, camera.position.distanceTo(v)) * tanH);      // screen pixels to a metre, that far off
    headOf(bub.who, headV); headV.y -= 0.08; const sk = ppm(headV); headV.project(camera);
    let hx = (headV.x + 1) / 2 * W, hy = (1 - headV.y) / 2 * H; if (headV.z > 1) { hx = headV.x > 0 ? -60 : W + 60; hy = H * 0.45; }      // behind the camera: the projection comes out mirrored
    herV.set(me.x, me.y + 1.68, me.z); const hk = ppm(herV); herV.project(camera); const herOn = herV.z < 1, jx = (herV.x + 1) / 2 * W, jy = (1 - herV.y) / 2 * H;
    const w = bub.w, h = bub.h, lift = el.id === 'say' ? 16 : 0, mB = bub.mB, mS = 14, G = 4, TL = 18;      // mS: room at the sides for a tail pointing out of the picture; lift: room for the name ribbon; mB: the speed line
    const mT = (x) => (x < bub.placeR || x + w > bub.barL ? 56 : 8) + lift;                      // the top margin: under the corner mark and the buttons, where they are
    const clampX = (x) => Math.max(mS, Math.min(W - mS - w, x)), clampY = (y, x) => Math.max(mT(x), Math.min(H - mB - h, y));
    const tx = Math.max(-40, Math.min(W + 40, hx)), ty = Math.max(-40, Math.min(H + 40, hy - G));
    const sBox = [hx - 0.22 * sk, hy, hx + 0.22 * sk, hy + 0.5 * sk], jBox = [jx - 0.36 * hk, jy - 4, jx + 0.36 * hk, jy + 0.6 * hk], bBox = [jx - 0.3 * hk, jy + 0.6 * hk, jx + 0.3 * hk, jy + 1.7 * hk];
    const ov = (x, y, B) => Math.max(0, Math.min(x + w, B[2]) - Math.max(x, B[0])) * Math.max(0, Math.min(y + h, B[3]) - Math.max(y, B[1]));
    const up = hy - G - TL - h, mid = hy - h * 0.5;
    const C = [[hx - w / 2, up, 0], [hx - w + 44, up, 20], [hx - 44, up, 20], [hx - G - TL - w, mid, 250], [hx + G + TL, mid, 250], [hx - w / 2, H, 700]];      // the last: down at the foot of the picture, for a small picture with no room round the head
    let bx = 0, by = 0, best = 1e18, pick = 0;
    for (let i = 0; i < C.length; i++) {
      const x = clampX(C[i][0]), y = clampY(C[i][1], x);
      const ex = tx < x ? x - tx : tx > x + w ? tx - x - w : 0, ey = ty < y ? y - ty : ty > y + h ? ty - y - h : 0, gap = Math.hypot(ex, ey);
      const sc = (herOn ? ov(x, y, jBox) + 0.25 * ov(x, y, bBox) : 0) + 1.5 * ov(x, y, sBox) + 25 * Math.min(400, Math.max(0, gap - TL - 6)) + (gap === 0 ? 5e4 : 0) + C[i][2] - (i === bub.pick ? 300 : 0);
      if (sc < best) { best = sc; bx = x; by = y; pick = i; }
    }
    bub.pick = pick;
    if (bub.snap || dt <= 0) { bub.x = bx; bub.y = by; bub.snap = false; } else { const k = 1 - Math.exp(-dt * 16); bub.x += (bx - bub.x) * k; bub.y += (by - bub.y) * k; }
    bx = Math.round(bub.x); by = Math.round(bub.y);
    el.style.transform = 'translate3d(' + bx + 'px,' + by + 'px,0)';
    // the tail: from the edge that faces the head (clear of the rounded corners), aimed at it
    const ex = tx < bx ? bx - tx : tx > bx + w ? tx - bx - w : 0, ey = ty < by ? by - ty : ty > by + h ? ty - by - h : 0;
    if (ex === 0 && ey === 0) { tail.style.visibility = 'hidden'; return; }      // the bubble is over the head itself: no tail
    tail.style.visibility = '';
    let px, py; if (ey >= ex) { py = ty > by ? by + h : by; px = Math.max(bx + (py === by ? Math.max(18, bub.rib) : 18), Math.min(bx + w - 18, tx)); }      // (a tail off the top edge keeps clear of the name ribbon) else { py = Math.max(by + 15, Math.min(by + h - 15, ty)); px = tx > bx ? bx + w : bx; }
    const ang = Math.atan2(ty - py, tx - px) - Math.PI / 2;
    tail.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) rotate(' + ang.toFixed(3) + 'rad)';
  }

  // ---- unseen encounters (Chris: no foes to be seen roaming; a chance meeting, only outside the lit places and away from people) ----
  const enc = { on: true, left: 35 + Math.random() * 50, wild: false, n: 0, last: [0, 0] };
  function wildAt(x, z) {
    for (const l of places.lamps) if ((l.x - x) * (l.x - x) + (l.z - z) * (l.z - z) < 18 * 18) return false;
    for (const p of places.people) if ((p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) < 16 * 16) return false;
    for (const P of land.PLACES) if (P.fair && land.sd(P.P, x, z, 30) < 22) return false;
    return land.at(x, z).fair < 0.05;
  }
  function stepEnc() {
    const d = Math.hypot(me.x - enc.last[0], me.z - enc.last[1]); enc.last = [me.x, me.z]; enc.wild = wildAt(me.x, me.z);
    if (paused || !enc.on || !enc.wild || talk || d > 3 || manual && !enc.test) return;
    enc.left -= d; if (enc.left <= 0) encounter();
  }
  function encounter() {
    paused = true; enc.n++; for (const k in keys) keys[k] = false; runLatch = false; me.goal = null; me.vx = me.vz = 0; if (document.pointerLockElement === canvas) document.exitPointerLock();
    const stones = D.R.places.W5, nearStones = Math.hypot(me.x - stones.at[0], me.z - stones.at[1]) < 75;
    $('cardimg').src = nearStones ? D.img.F3 : D.img.F1; $('cardline').textContent = 'Something stirs in the dark.'; $('card').hidden = false;
  }
  function encDone() { if (!paused) return; paused = false; $('card').hidden = true; enc.left = 40 + Math.random() * 60; last = performance.now(); }

  // ---- where she is, in words: a small mark in the corner; somewhere new arrives first as a title (once it has held half a second, and not
  // again for half a minute, so walking the edge of a road does not keep announcing it); a quiet sign beside the mark when foes may be near ----
  let SEA = null; const plc = { name: null, t: 0, titled: '', when: {}, foe: null, tmr: 0 };
  function stepPlace(dt) {
    const n = where(); if (n !== plc.name) { plc.name = n; plc.t = 0; $('placename').textContent = n; } else plc.t += dt;
    if (plc.t >= 0.5 && n !== plc.titled && time - (plc.when[n] == null ? -1e9 : plc.when[n]) > 30) { plc.titled = n; plc.when[n] = time; showTitle(n); }
    const foe = !!(enc.wild && enc.on); if (foe !== plc.foe) { plc.foe = foe; $('placefoe').hidden = !foe; }
  }
  function showTitle(n) {
    const e = $('placetitle'); e.firstChild.textContent = n; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show');
    $('place').classList.add('away'); clearTimeout(plc.tmr); plc.tmr = setTimeout(() => { $('place').classList.remove('away'); }, 2600);
  }
  function where() {
    for (const P of places.list) { const lx = me.x - P.at[0], lz = me.z - P.at[1]; if (land.sd(land.PLACES.find((q) => q.id === P.id).P, me.x, me.z, 30) < 4) return P.name; }
    const g = land.at(me.x, me.z); let rd = ''; for (const r of D.R.roads) { const L = land.ROADS[D.R.roads.indexOf(r)]; if (land.dist(L, me.x, me.z, 6) < r.w / 2 + 1.5) { rd = r.name; break; } }
    if (rd) return rd.charAt(0).toUpperCase() + rd.slice(1);
    if (me.x < -110 && me.x > -260 && Math.abs(me.z - 96) < 50) return 'The Moon Faire grounds';
    if (land.sd(SEA, me.x, me.z, 50) < 40) return 'The cliff coast';
    if (me.z > 185) return 'The river marsh';
    if (Math.hypot(me.x - land.TOR.x, me.z - land.TOR.z) < 40) return 'The high tor';
    if (me.x < -230) return 'The settled country';
    return g.h > 9 ? 'The open moor, up high' : 'The open moor';
  }

  // ---- the lamps: the eight nearest the camera light the land, the four nearest her light her ----
  const lampBuf = [];
  function stepLamps(t) {
    const L = places.lamps; for (const l of L) { l.f = 0.82 + 0.1 * Math.sin(t * 7.3 + l.seed) + 0.08 * Math.sin(t * 13.1 + l.seed * 2.3); l.d = (l.x - camera.position.x) ** 2 + (l.z - camera.position.z) ** 2; l.dh = (l.x - me.x) ** 2 + (l.z - me.z) ** 2; }
    lampBuf.length = 0; for (const l of L) lampBuf.push(l); lampBuf.sort((a, b) => a.d - b.d);
    for (let i = 0; i < 8; i++) { const l = lampBuf[i], P = OW.U.uLampP.value[i], C = OW.U.uLampC.value[i]; if (!l) { P.set(0, -999, 0); C.set(0, 0, 0); continue; } P.set(l.x, l.y, l.z); const k = 0.55 * l.f * l.k; C.set(1.0 * k, 0.62 * k, 0.32 * k); }
    lampBuf.sort((a, b) => a.dh - b.dh);
    rig.near.forEach((nl, i) => { const l = lampBuf[i]; if (!l || l.dh > 400) { nl.intensity = 0; return; } nl.position.set(l.x, l.y, l.z); nl.intensity = 0.55 * l.f * l.k; });
  }

  // one witch at a weight, ready for the cast
  function makeWitch(w, still) { const j = window.WITCH_LOD.make(w, { treadmill: false }); if (still) { j.root.traverse((o) => { o.castShadow = false; }); for (const c of (j.debug && j.debug.cloths) || []) c.meshes.forEach((m) => { m.castShadow = false; }); } j.fx.remove(j.spellLight); cast.add(j.root, j.fx); j.camera = camera; j.targetDist = 0; j.arena = 0; if (j.game) { j.game.fates = []; j.game.catches = 0; } j.reset(); return j; }
  function dropWitch(j) { cast.remove(j.root, j.fx); const seen = new Set(); for (const r of [j.root, j.fx]) r.traverse((o) => { if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); } const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) m.dispose(); }); for (const t of (j.debug && j.debug.textures) || []) t.dispose(); }
  function setWeight(w) { if (!ready || w === weight) return; weight = w; dropWitch(J); J = makeWitch(w); for (const o of others) { dropWitch(o.J); o.J = makeWitch(w, true); o.J.root.position.set(o.x, o.y, o.z); o.J.root.rotation.y = o.face; } lastCatch = [1e9, 1e9]; }
  // the other witches in the test stand where they are, and now and then do something
  const IDLE = ['look_around', 'settle', 'wave', 'laugh', 'bow', 'twirl', 'talk'];
  function stepOthers(dt, t) { for (const o of others) { o.t -= dt; if (o.t <= 0 && !o.J.action) { o.J.play(IDLE[Math.floor(Math.random() * IDLE.length)], false); o.t = 6 + Math.random() * 8; } o.J.root.rotation.y = o.face + (o.J.spin || 0); o.J.animate(0, 0, t + o.face * 3, dt, 0); } }
  let patchTex = null;
  function footPatch(x, y, z) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.63).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false, toneMapped: false, fog: false })); m.position.set(x, y + 0.03, z); m.renderOrder = 1; cast.add(m); return m; }

  // ---- her shadow: a small piece of ground under her that only catches shadow, shaped to the land each time she moves ----
  let catcher, patch, lastCatch = [1e9, 1e9];
  function makeCatcher() {
    catcher = new THREE.Mesh(new THREE.PlaneGeometry(5, 5, 20, 20).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.42, color: 0x120a18 })); catcher.receiveShadow = true; catcher.renderOrder = 1; cast.add(catcher);
    const pc = document.createElement('canvas'); pc.width = pc.height = 128; { const g = pc.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(14,8,18,0.55)'); gr.addColorStop(0.55, 'rgba(14,8,18,0.22)'); gr.addColorStop(1, 'rgba(14,8,18,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
    patchTex = new THREE.CanvasTexture(pc);
    patch = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.63, 6, 6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false, toneMapped: false, fog: false })); patch.renderOrder = 1; cast.add(patch);
  }
  function stepCatcher() {
    if (Math.hypot(me.x - lastCatch[0], me.z - lastCatch[1]) < 0.08) return; lastCatch = [me.x, me.z];
    for (const [m, lift] of [[catcher, 0.03], [patch, 0.035]]) { const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, land.height(me.x + p.getX(i), me.z + p.getZ(i)) + lift); p.needsUpdate = true; m.position.set(me.x, 0, me.z); m.geometry.computeBoundingSphere(); }
  }

  // ---- the Flipbook look: the picture drawn small, the land in its own 64 colours (the paintings' and the map's), her and the fair folk
  // in the witches' 56 with the inked outline, then laid on the screen with hard pixels (the witches' stage's own way, game/src/stage.js) ----
  const flip = { on: false, rows: 600 };
  let fl = null;
  function makeFlip() {
    const toV = (list) => { const v = []; for (let i = 0; i < 64; i++) { const p = list[i % list.length]; v.push(new THREE.Vector3(p[0] / 255, p[1] / 255, p[2] / 255)); } return v; };
    const WP = (window.JESTER_PALETTE || [[0, 0, 0]]).slice(0, 64), NW = WP.length;
    const mkRT = (w, h) => { const r = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }); r.texture.encoding = THREE.sRGBEncoding; r.depthTexture = new THREE.DepthTexture(w, h); r.depthTexture.type = THREE.UnsignedIntType; return r; };
    const rt = mkRT(4, 4);
    const rt2 = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
    const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
    const post = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: { tD: { value: rt.texture }, tZ: { value: rt.depthTexture }, uNF: { value: new THREE.Vector2(0.1, 3600) }, uRes: { value: new THREE.Vector2(4, 4) }, uWP: { value: toV(WP) }, uLP: { value: toV(D.palette) } }, vertexShader: VS,
      fragmentShader: `precision highp float; uniform sampler2D tD; uniform sampler2D tZ; uniform vec2 uNF; uniform vec2 uRes; uniform vec3 uWP[64]; uniform vec3 uLP[64]; varying vec2 vUv;
        float lin(vec2 uv) { float z = texture2D(tZ, uv).r * 2.0 - 1.0; return 2.0 * uNF.x * uNF.y / (uNF.y + uNF.x - z * (uNF.y - uNF.x)); }
        float bayer(vec2 p) { vec2 q = mod(p, 4.0); float x = q.x, y = q.y; float v = mod(x, 2.0) * 2.0 + mod(y, 2.0) * 3.0 - mod(x, 2.0) * mod(y, 2.0) * 4.0; float w = floor(x / 2.0) * 2.0 + floor(y / 2.0) * 3.0 - floor(x / 2.0) * floor(y / 2.0) * 4.0; return (v * 4.0 + w + 0.5) / 16.0; }
        void main() {
          vec2 px = 1.0 / uRes; vec2 uv = (floor(vUv * uRes) + 0.5) * px; vec4 c = texture2D(tD, uv);
          float n = max(max(texture2D(tD, uv + vec2(px.x, 0.0)).a, texture2D(tD, uv - vec2(px.x, 0.0)).a), max(texture2D(tD, uv + vec2(0.0, px.y)).a, texture2D(tD, uv - vec2(0.0, px.y)).a));
          float m = min(min(texture2D(tD, uv + vec2(px.x, 0.0)).a, texture2D(tD, uv - vec2(px.x, 0.0)).a), min(texture2D(tD, uv + vec2(0.0, px.y)).a, texture2D(tD, uv - vec2(0.0, px.y)).a));
          if (c.a < 0.5) {                                      // the land: its own colours; next to her, the ink of her outline
            if (n > 0.6) { gl_FragColor = vec4(0.075, 0.05, 0.065, 1.0); return; }
            // the land, the sky and the places: lifted a little so the night stays readable, dithered between its colours so nothing bands,
            // and inked where one thing ends in front of another (a tent against the field, a stone against the sky)
            vec3 lc = pow(c.rgb, vec3(0.88)) * 1.06; float ll = dot(lc, vec3(0.30, 0.59, 0.11)); lc = clamp(ll + (lc - ll) * 1.15, 0.0, 1.0);
            lc += (bayer(floor(vUv * uRes)) - 0.5) * 0.085;
            float best = 1e9; vec3 pick = lc; for (int k = 0; k < 64; k++) { vec3 d = lc - uLP[k]; float e = dot(d * d, vec3(0.30, 0.59, 0.11)); if (e < best) { best = e; pick = uLP[k]; } }
            float z0 = lin(uv), zm = min(min(lin(uv + vec2(px.x, 0.0)), lin(uv - vec2(px.x, 0.0))), min(lin(uv + vec2(0.0, px.y)), lin(uv - vec2(0.0, px.y))));
            float edge = smoothstep(0.10, 0.22, (z0 - zm) / z0) * (1.0 - smoothstep(60.0, 140.0, zm));      // this pixel is well behind a neighbour: the neighbour's outline falls here
            gl_FragColor = vec4(mix(pick, vec3(0.075, 0.05, 0.065), edge * 0.8), 1.0); return;
          }
          vec3 col = c.rgb; float l = dot(col, vec3(0.30, 0.59, 0.11)); col = clamp(l + (col - l) * 1.4, 0.0, 1.0); col = clamp((col - 0.42) * 1.14 + 0.42, 0.0, 1.0); if (m < 0.4) col *= 0.45;
          float best = 1e9; vec3 pick = col; for (int k = 0; k < ${NW}; k++) { vec3 d = col - uWP[k]; float e = dot(d * d, vec3(0.30, 0.59, 0.11)); if (e < best) { best = e; pick = uWP[k]; } }
          gl_FragColor = vec4(pick, 1.0);
        }` });
    const up = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: { tU: { value: rt2.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uScale: { value: new THREE.Vector2(1, 1) } }, vertexShader: VS,
      fragmentShader: `precision highp float; uniform sampler2D tU; uniform vec2 uRes; uniform vec2 uScale; varying vec2 vUv;
        void main(){ vec2 p = vUv * uRes; vec2 i = floor(p); vec2 x = (p - i) * uScale; vec2 sh = clamp(x - (uScale - 0.5), 0.0, 0.5) - clamp(0.5 - x, 0.0, 0.5); gl_FragColor = texture2D(tU, (i + 0.5 + sh) / uRes); }` });
    const mk = (m) => { const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); q.frustumCulled = false; sc.add(q); return sc; };
    fl = { mkRT, rt, rt2, post, up, scPost: mk(post), scUp: mk(up), cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }

  // ---- drawing ----
  const sz = new THREE.Vector2();
  function render() {
    renderer.info.reset();
    if (flip.on) {
      renderer.getDrawingBufferSize(sz); const gh = Math.max(90, Math.min(sz.y, Math.round(flip.rows))), gw = Math.max(32, Math.round(sz.x * gh / sz.y));
      if (fl.rt.width !== gw || fl.rt.height !== gh) { fl.rt.depthTexture.dispose(); fl.rt.dispose(); fl.rt = fl.mkRT(gw, gh); fl.post.uniforms.tD.value = fl.rt.texture; fl.post.uniforms.tZ.value = fl.rt.depthTexture; fl.rt2.setSize(gw, gh); fl.post.uniforms.uRes.value.set(gw, gh); fl.up.uniforms.uRes.value.set(gw, gh); }
      fl.post.uniforms.uNF.value.set(camera.near, camera.far);
      fl.up.uniforms.uScale.value.set(sz.x / gw, sz.y / gh);
      renderer.setRenderTarget(fl.rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(world, camera); renderer.render(cast, camera);
      renderer.setRenderTarget(fl.rt2); renderer.render(fl.scPost, fl.cam);
      renderer.setRenderTarget(null); renderer.render(fl.scUp, fl.cam);
    } else { renderer.setRenderTarget(null); renderer.setClearColor(0x15121c, 1); renderer.clear(); renderer.render(world, camera); renderer.render(cast, camera); }
  }
  const meter = { n: 0, t: 0, real: 0, upd: 0, drw: 0 };
  function advance(dt, draw) {
    time += dt; OW.U.uTime.value = time; const a = performance.now();
    resize();
    const v = stepHer(dt, time); stepCam(dt, v); stepPeople(dt); stepOthers(dt, time); stepLamps(time); stepCatcher(); fires.step(time);
    moorK = THREE.MathUtils.smoothstep(me.x, -135, -60); rig.place(new THREE.Vector3(me.x, me.y, me.z), cam.yaw, moorK);
    // the land's colours: the fair's paintings are warm with lamp-light, the moor's are cool and dark (gains measured from the paintings against the map)
    terrain.material.uniforms.uGain.value.set(0.92 - 0.30 * moorK, 0.80 - 0.14 * moorK, 0.70 - 0.14 * moorK); terrain.material.uniforms.uEarthK.value = 1.0 - 0.36 * moorK; OW.U.uExpo.value = 1.0 - 0.1 * moorK;
    world.fog = null; cast.fog.color.copy(OW.U.uFogW.value).lerp(OW.U.uFogE.value, 0.5);
    OW.U.uCamPos.value.copy(camera.position);
    terrain.update(camera.position, 6); tufts.update(me); flora.update(me, time);
    stepEnc(); stepPlace(dt); stepType(dt); placeBubble(dt); if (OW.folk) OW.folk.place();
    const b = performance.now(); if (draw) render(); const c = performance.now();
    meter.n++; meter.t += dt; meter.upd += b - a; meter.drw += c - b;
    if (meter.t >= 0.5) { const i = renderer.info.render; $('meter').textContent = (TEST ? (1 + others.length) + ' witches at ' + weight + ', ' + places.people.filter((p) => p.npc).length + ' fair folk · ' : '') + Math.round(meter.n / (meter.real || meter.t)) + ' pictures a second · ' + Math.round(i.triangles / 1000) + 'k triangles · ' + renderer.info.render.calls + ' draws · moving ' + (meter.upd / meter.n).toFixed(1) + ' ms · drawing ' + (meter.drw / meter.n).toFixed(1) + ' ms'; meter.n = 0; meter.t = 0; meter.real = 0; meter.upd = 0; meter.drw = 0; }
  }
  function frame(now) { requestAnimationFrame(frame); if (manual || !ready || paused) return; const real = (now - last) / 1000, dt = Math.min(0.05, real); last = now; meter.real += real; advance(dt, true); }
  let detail = Math.min(window.devicePixelRatio || 1, 1.5);
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (w && h && (canvas.width !== Math.round(w * detail) || canvas.height !== Math.round(h * detail))) { renderer.setPixelRatio(detail); renderer.setSize(w, h, false); } camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); }

  // ---- going somewhere at once (the map, or the start) ----
  function placeAt(x, z, face) {
    let bx = x, bz = z; outer: for (let r = 0; r < 12; r += 0.5) for (let a = 0; a < 16; a++) { const tx = x + Math.cos(a / 16 * 6.283) * r, tz = z + Math.sin(a / 16 * 6.283) * r; if (free(tx, tz)) { bx = tx; bz = tz; break outer; } }
    me.x = bx; me.z = bz; me.y = land.height(bx, bz); me.vx = me.vz = 0; me.goal = null; if (face != null) me.face = face; cam.yaw = me.face + Math.PI; lastCatch = [1e9, 1e9]; endTalk();
  }
  function goPlace(id) { const P = D.R.places[id]; if (!P) return; const f = P.figure || [0, 2]; placeAt(P.at[0] + f[0], P.at[1] + f[1], Math.PI); $('mapbox').hidden = true; }

  // ---- start ----
  async function start() {
    try {
      if (!window.THREE) throw new Error('three.js did not load');
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: manual });
      renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.NoToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.autoClear = false; renderer.info.autoReset = false;
      world = new THREE.Scene(); cast = new THREE.Scene(); cast.fog = new THREE.FogExp2(0x403850, OW.U.uFogD.value); OW._scene = world;
      camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 3600);
      land = makeLand(D.F, D.R); SEA = land.prep(D.F.sea, true);
      OW.makeSky(world);
      setLoad('Making the land round the fair…');
      terrain = OW.makeTerrain(world, land, D.landSrc);
      water = OW.makeWater(world, land);
      rig = OW.makeRig(renderer, cast);
      setLoad('Building the fair and the moor’s places from their paintings…');
      const paints = {}; await Promise.all(Object.keys(D.R.places).map((id) => { const t = OW.tex(D.img['paint_' + id]); paints[id] = t; return t.ready; }));
      places = OW.makePlaces(renderer, world, land, cast, paints);
      if (TEST) {                                           // the test: every one of the fair folk stands somewhere in the fair square
        const W1 = D.R.places.W1, SPOT = { 'ballad-singer': [0, -3.6], 'old-lamp-seller': [-5.6, 7.4], 'ribbon-dyer': [2.6, -8.2], 'fortune-teller': [6.6, -6.2], 'fair-baker': [-4.5, -7.5], 'old-night-watchman': [-6.2, -1.0],
          'pie-seller': [6.0, 5.8], 'gate-keeper': [-2.5, 4.9], 'chestnut-roaster': [1.5, 6.2], 'old-lamplighter': [-4.8, -3.2], 'farm-lad': [5.8, -1.5] };
        for (const p of places.people) { const q = SPOT[p.id]; if (!q) continue; p.x = W1.at[0] + q[0]; p.z = W1.at[1] + q[1]; p.y = W1.base; p.home = Math.atan2(-q[0], -q[1] + 1.5); p.place = 'W1'; if (p.root) { p.root.position.set(p.x, p.y, p.z); p.root.rotation.y = p.home; } }
      }
      if (OW.makeDressing) OW.makeDressing(world, land, places);      // the fairground and the moor places' dressing (ow-dressing.js): joins the places' pieces, blockers, lamps, fires and bushes
      props = OW.makeProps(world, land, places.bushes); fires = OW.makeFires(world, places.fires);
      const mac = OW.tex(D.img.macro); await mac.ready; tufts = OW.makeTufts(world, land, mac.image, terrain.tuftMat); flora = OW.makeFlora(world, land, mac.image);
      allBlockers = places.blockers.concat(props.blockers, flora.blockers); indexBlockers();
      if (OW.folk) OW.folk.start({ places, me, others, scene: world, canvas, camera: () => camera, ground, height: (x, z) => land.height(x, z), talking: () => !!talk, block: (b) => { allBlockers.push(b); indexBlockers(); } });
      makeCatcher(); makeFlip();
      setLoad('Building the Jester…');
      J = makeWitch(weight);
      if (TEST) { const W1 = D.R.places.W1; for (const q of [[-3.4, -0.4, 0.9], [2.6, -0.2, -0.8], [0.7, 2.9, 3.0]]) { const o = { J: makeWitch(weight, true), x: W1.at[0] + q[0], z: W1.at[1] + q[1], y: W1.base, face: q[2], t: 3 + Math.random() * 6 }; o.J.root.position.set(o.x, o.y, o.z); o.J.root.rotation.y = o.face; others.push(o); allBlockers.push({ x: o.x, z: o.z, r: 0.38 }); } indexBlockers(); for (const o of others) footPatch(o.x, o.y, o.z); for (const p of places.people) footPatch(p.x, p.y, p.z); }
      const at = QS.get('at'); if (at && D.R.places[at]) goPlace(at); else goPlace('W1');
      if (QS.get('x')) placeAt(+QS.get('x'), +QS.get('z'), +(QS.get('face') || 0));
      resize(); stepCam(0, 0); OW.U.uCamPos.value.copy(camera.position);
      // wait for the land round her and the paintings, then go
      const imgs = []; world.traverse((o) => { const u = o.material && o.material.uniforms; if (u) for (const k in u) { const t = u[k].value; if (t && t.isTexture && t.ready) imgs.push(t.ready); } });
      await Promise.all(imgs).catch(() => {});
      let tries = 0; while (terrain.ready(camera.position, 140) < 1 && tries++ < 600) { terrain.update(camera.position, 30); setLoad('Making the land round her… ' + Math.round(terrain.ready(camera.position, 140) * 100) + '%'); await new Promise((r) => setTimeout(r, 30)); }
      $('loading').hidden = true; ready = true; last = performance.now(); advance(0, true); requestAnimationFrame(frame); window.OWP.ready = true;
    } catch (e) { fail(e); }
  }
  function setLoad(t) { $('loadtext').textContent = t; }
  const S = window.MeshoptSimplifier; if (S && S.ready && S.ready.then) S.ready.then(start, start); else start();

  // ---- the page's own parts ----
  const KEY = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ShiftLeft: 'shift', ShiftRight: 'shift', KeyQ: 'q', KeyE: 'e' };
  addEventListener('keydown', (e) => {
    if (e.code === 'Escape') { if (!$('mapbox').hidden) $('mapbox').hidden = true; else setMenu(menu.hidden, true); e.preventDefault(); return; }      // Esc: closes the map, or opens and closes the menu
    if (!menu.hidden) return;                                                                        // while the menu is open its own controls have the keys
    if (!ready || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.target.tagName === 'BUTTON' && (e.code === 'Space' || e.code === 'Enter')) return;          // a button reached with Tab presses itself
    if (e.code === 'KeyE' && (near || talk)) { act(); e.preventDefault(); return; }
    if (paused) { if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') { encDone(); e.preventDefault(); } return; }
    if (KEY[e.code]) { const k = KEY[e.code]; if (!e.repeat && 'udlr'.indexOf(k) >= 0) { const now = performance.now(); if (now - (lastTap[k] || 0) < 330) runLatch = true; lastTap[k] = now; } keys[k] = true; e.preventDefault(); }      // press a direction twice, quickly: she runs
    else if (e.code === 'Enter' || e.code === 'Space') { act(); e.preventDefault(); }
    else if (e.code === 'KeyM') toggleMap(); else if (e.code === 'KeyF') toggleFlip(); else if (e.code === 'KeyZ') toggleView(); else if (e.code === 'KeyC') toggleLook();
  });
  addEventListener('keyup', (e) => { if (KEY[e.code]) keys[KEY[e.code]] = false; if (!(keys.u || keys.d || keys.l || keys.r)) runLatch = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; runLatch = false; });
  // drag to turn the camera; a tap on the ground walks her there
  const pts = new Map(), drag = { moved: 0, t: 0, lastTap: 0, pinch: 0 };
  canvas.addEventListener('pointerdown', (e) => { if (!menu.hidden) { setMenu(false); return; } if (paused) return; pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 1) { drag.moved = 0; drag.t = performance.now(); } else drag.pinch = 0; try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } });
  canvas.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId); if (!p || document.pointerLockElement === canvas) return; const dx = e.clientX - p[0], dy = e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY;
    if (pts.size >= 2) { const q = [...pts.values()], d = Math.hypot(q[0][0] - q[1][0], q[0][1] - q[1][1]); if (drag.pinch > 0) cam.dist = Math.max(2.0, Math.min(18, cam.dist * drag.pinch / Math.max(20, d))); drag.pinch = d; drag.moved = 99; return; }
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved > 5) { cam.yaw -= dx * 0.006; cam.pitch = Math.max(-0.12, Math.min(1.15, cam.pitch + dy * 0.004)); cam.lastDrag = time; } });
  const lift = (e) => { const had = pts.delete(e.pointerId); if (!had || pts.size) { drag.pinch = 0; return; } if (document.pointerLockElement === canvas || paused) return;
    if (drag.moved < 6 && performance.now() - drag.t < 400 && ready) { const now = performance.now(), twice = now - drag.lastTap < 380; drag.lastTap = now; walkTo(e, twice); } };
  canvas.addEventListener('pointerup', lift); canvas.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); drag.pinch = 0; });
  canvas.addEventListener('wheel', (e) => { cam.dist = Math.max(2.0, Math.min(18, cam.dist * Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0012)))); e.preventDefault(); }, { passive: false });      // the wheel, or a pinch on a touchpad (which arrives as a wheel with Ctrl)
  const ray = new THREE.Raycaster();
  function walkTo(e, run) {
    const r = canvas.getBoundingClientRect(); ray.setFromCamera({ x: (e.clientX - r.left) / r.width * 2 - 1, y: 1 - (e.clientY - r.top) / r.height * 2 }, camera);
    const o = ray.ray.origin, d = ray.ray.direction; let t0 = 0, hit = null;
    for (let t = 0.5; t < 220; t *= 1.04) { const p = o.clone().addScaledVector(d, t); if (p.y < land.height(p.x, p.z)) { let a = t0, b = t; for (let k = 0; k < 18; k++) { const m = (a + b) / 2, q = o.clone().addScaledVector(d, m); if (q.y < land.height(q.x, q.z)) b = m; else a = m; } hit = o.clone().addScaledVector(d, b); break; } t0 = t; }
    if (hit) { me.goal = { x: hit.x, z: hit.z, run: !!run }; me.stuck = 0; endTalk(); }
  }
  $('use').addEventListener('click', act); $('say').addEventListener('click', act);      // the whole bubble goes on (its moon mark is the button for the keyboard)
  function toggleFlip() { flip.on = !flip.on; $('flipsw').setAttribute('aria-pressed', flip.on); $('fliprow').hidden = !flip.on; }
  $('flipsw').addEventListener('click', toggleFlip);
  function toggleView() { cam.view = 1 - cam.view; cam.dist = VIEWS[cam.view]; const b = $('viewsw'); b.querySelector('.lbl').textContent = cam.view ? 'Far' : 'Near'; b.setAttribute('aria-label', cam.view ? 'View: far' : 'View: near'); const r = b.querySelector('.vi'); for (const [k, v] of Object.entries(cam.view ? { x: 8.5, y: 8.5, width: 3, height: 3 } : { x: 6.5, y: 7, width: 7, height: 6 })) r.setAttribute(k, v); }
  $('viewsw').addEventListener('click', toggleView);
  // mouse-look: the mouse turns the camera without a button held (Esc lets it go)
  function toggleLook() { try { if (document.pointerLockElement === canvas) document.exitPointerLock(); else canvas.requestPointerLock(); } catch (e) { /* not offered here */ } }
  $('looksw').addEventListener('click', toggleLook); if (!canvas.requestPointerLock || matchMedia('(pointer: coarse)').matches) $('looksw').hidden = true;
  document.addEventListener('pointerlockchange', () => { $('looksw').setAttribute('aria-pressed', document.pointerLockElement === canvas); });
  document.addEventListener('mousemove', (e) => { if (document.pointerLockElement !== canvas) return; cam.yaw -= e.movementX * 0.0032; cam.pitch = Math.max(-0.12, Math.min(1.15, cam.pitch + e.movementY * 0.0024)); cam.lastDrag = time; });
  $('encsw').addEventListener('click', () => { enc.on = !enc.on; $('encsw').setAttribute('aria-pressed', enc.on); });
  $('card').addEventListener('click', () => encDone());
  $('fliprows').addEventListener('input', () => { flip.rows = +$('fliprows').value; $('fliprowsv').textContent = flip.rows; });
  $('detail').addEventListener('change', () => { detail = +$('detail').value; });
  if ($('weight')) { $('weight').value = weight; $('weight').addEventListener('change', () => { setWeight($('weight').value); }); }
  if (window.innerWidth < 700) { detail = 1; $('detail').value = '1'; }
  $('full').addEventListener('click', () => { try { const p = document.fullscreenElement ? document.exitFullscreen() : box.requestFullscreen(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not allowed here */ } });
  if (!box.requestFullscreen) $('full').hidden = true;                                                // an iPhone cannot make one part of a page full screen
  document.addEventListener('fullscreenchange', () => { $('full').firstChild.textContent = document.fullscreenElement ? 'Leave full screen' : 'Full screen'; });
  $('speedsw').addEventListener('click', () => { const on = $('meter').hidden; $('meter').hidden = !on; $('speedsw').setAttribute('aria-pressed', on); bub.mW = 0; });
  // the menu: the Menu button or Esc; a tap on the picture closes it too
  const menu = $('menu'), menuBtn = $('menubtn');
  function setMenu(open, byKey) {
    if (open === !menu.hidden) return; menu.hidden = !open; menuBtn.setAttribute('aria-expanded', open);
    if (open) { for (const k in keys) keys[k] = false; runLatch = false; me.goal = null; if (byKey) $('flipsw').focus(); }
    else if (menu.contains(document.activeElement)) { if (byKey) menuBtn.focus(); else document.activeElement.blur(); }
  }
  menuBtn.addEventListener('click', (e) => setMenu(menu.hidden, e.detail === 0)); $('menuclose').addEventListener('click', (e) => setMenu(false, e.detail === 0));
  // a button pressed with the mouse or a finger lets go of the focus, so Space and Enter go back to talking
  $('hud').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && e.detail > 0 && b !== document.body) b.blur(); });
  // the map: her place on it, the seven places as pins; tap a pin, or anywhere on the land, to go there
  $('mapimg').src = D.img.mapPainted;
  const toMap = (x, z) => [(x / 0.5 + 768) / 1536 * 100, (z / 0.5 + 512) / 1024 * 100];
  $('mappins').innerHTML = Object.values(D.R.places).map((p) => { const q = toMap(p.at[0], p.at[1]); return '<button type="button" data-id="' + p.id + '" style="left:' + q[0].toFixed(2) + '%;top:' + q[1].toFixed(2) + '%" title="' + esc(p.name) + '" aria-label="' + esc(p.id + ', ' + p.name) + '">' + p.id + '</button>'; }).join('');
  function toggleMap() { const m = $('mapbox'); m.hidden = !m.hidden; if (!m.hidden) { const q = toMap(me.x, me.z); $('mapme').style.left = q[0] + '%'; $('mapme').style.top = q[1] + '%'; } }
  $('mapbtn').addEventListener('click', toggleMap); $('mapclose').addEventListener('click', () => { $('mapbox').hidden = true; });
  $('mapwrap').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (b && b.dataset.id) return goPlace(b.dataset.id);
    if (e.target.id !== 'mapimg' && e.target.id !== 'mappins') return; const r = $('mapimg').getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width * 1536 - 768) * 0.5, z = ((e.clientY - r.top) / r.height * 1024 - 512) * 0.5;
    if (Math.abs(x) < 375 && Math.abs(z) < 248 && land.height(x, z) > land.WL + 0.3) { placeAt(x, z, me.face); $('mapbox').hidden = true; } else toast('That is water. Pick somewhere on the land.');
  });
  // for checking: step the page by hand (?shot=1)
  window.OWP = { enc, encounter, encDone, toggleFlip, toggleView, get paused() { return paused; }, setWeight, get others() { return others; }, get cast() { return cast; }, get me() { return me; }, get cam() { return cam; }, get keys() { return keys; }, get places() { return places; }, ground: (x, z, pad) => ground(x, z, pad), get terrain() { return terrain; }, get land() { return land; }, get renderer() { return renderer; }, get J() { return J; }, flip, placeAt, goPlace, act, toast, setMenu, bub,
    step(dt, n) { for (let i = 0; i < (n || 1); i++) advance(dt, i === (n || 1) - 1); }, ready: false };
})();
