// world.js: the walk-through. One witch walks all nine painted places, goes from one to the next by its ways out, and talks to the fair folk.
// No fights and no story triggers yet: this is the ground the rest of the game stands on.
//
// Every place's shapes are in the form Chris's map editor reads and writes, in the painting's own 1774 x 887 pixels:
//   walk  [[x, y], ...] polygons she can stand in          block  polygons cut out of them
//   front { pts, base }: a piece of the painting that is drawn over a walker whose feet are above its base line (they are behind it)
//   exits { rect [x0, y0, x1, y1], to, at [x, y] where she arrives there }     people { id, name, at }     spots { kind, at, label }
// The scene's camera is fixed and the ground is flat, so a pixel of the painting is one point on the ground. Walking is done in metres on
// the ground (so a step is the same length near and far) and checked against the shapes in pixels (so what Chris traces is what she obeys).
// A front becomes a flat upright sheet standing at its base line's distance, drawn into depth only: anyone behind it is hidden by the painting.
function makeMFWorld(stage, DATA, H) {
  'use strict';
  const FW = 1774, FH = 887, CELL = 12, GW = Math.ceil(FW / CELL), GH = Math.ceil(FH / CELL);
  const group = new THREE.Group(); stage.cast.add(group);
  const hide = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _f = [0, 0];
  let rs = 20261114; const rnd = () => { rs ^= rs << 13; rs >>>= 0; rs ^= rs >>> 17; rs ^= rs << 5; rs >>>= 0; return rs / 4294967296; };

  // ---------- pixels and ground (for the scene the stage is set to) ----------
  function ray(fx, fy) { _a.set(fx / FW * 2 - 1, 1 - fy / FH * 2, 0.5).applyMatrix4(stage.fullInv).applyMatrix4(stage.camera.matrixWorld); return _a.sub(stage.camera.position); }
  function groundPx(fx, fy) { const d = ray(fx, fy), o = stage.camera.position, t = -o.y / d.y; return { x: o.x + d.x * t, z: o.z + d.z * t }; }
  function onSheet(fx, fy, z0) { const d = ray(fx, fy), o = stage.camera.position, t = (z0 - o.z) / d.z; return [o.x + d.x * t, o.y + d.y * t]; }
  function px(x, z, out) { return stage.toFrame(_b.set(x, 0, z), out || [0, 0]); }
  function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  const inRect = (x, y, r, g) => x >= r[0] - g && x <= r[2] + g && y >= r[1] - g && y <= r[3] + g;

  // ---------- a place, built the first time she walks into it ----------
  const places = {}; let cur = null;
  function standIn(name) {      // someone whose model is not built yet (the captain): a plain grey figure, so there is somebody to walk up to
    const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color: 0x2c2636 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.5, 12), m); body.position.y = 0.75; const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), m); head.position.y = 1.66;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 16), m); brim.position.y = 1.78; const crown = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.42, 12), m); crown.position.y = 2.0; g.add(body, head, brim, crown); return g;
  }
  function build(id) {
    const M = DATA.maps[id], L = DATA.lines[id] || { people: {} }, P = { id, M, L, g: new THREE.Group(), people: [], spots: [], lamps: (M.lamps || []).map((l) => ({ x: l[0], z: l[1], h: l[2], seed: rnd() * 10, f: 1 })), ready: false };
    P.S = { id, kind: 'walk', name: M.name, art: id, frame: [FW, FH], camera: M.camera, rig: { key: 1, rim: 1 } };
    stage.setScene(P.S);
    // where a foot may be: inside a walk area and outside every block. A grid of the same answer, for finding a way round things.
    P.free = (x, y) => { let ok = false; for (const w of M.walk) if (inPoly(x, y, w)) { ok = true; break; } if (!ok) return false; for (const b of M.block || []) if (inPoly(x, y, b)) return false; return true; };
    // fronts: upright sheets in depth only
    for (const F of M.front || []) {
      if (!F.pts || F.pts.length < 3) continue; let cx = 0; for (const p of F.pts) cx += p[0]; cx /= F.pts.length;
      const z0 = groundPx(cx, Math.min(FH - 1, F.base)).z, sh = new THREE.Shape(); F.pts.forEach((p, i) => { const q = onSheet(p[0], p[1], z0); if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); });
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), hide); m.position.z = z0; m.renderOrder = -10; m.frustumCulled = false; P.g.add(m);
    }
    // the people who stand here
    for (const p of M.people || []) {
      const at = groundPx(p.at[0], p.at[1]), words = (L.people[p.id] || {}), who = { id: p.id, name: words.name || p.name || p.id, says: words.says || [], x: at.x, z: at.z, npc: null, root: null, said: 0, patch: stage.footPatch(0.4) };
      who.patch.position.set(at.x, 0.006, at.z); P.g.add(who.patch); P.people.push(who);
      if (window.MF_NPC && window.MF_NPCS.people[p.id]) window.MF_NPC.make(p.id).then((n) => { who.npc = n; who.root = n.root; n.root.position.set(at.x, 0, at.z); n.root.rotation.y = Math.atan2(-at.x * 0.25, 6); P.g.add(n.root); }).catch((e) => { H.toast('Could not build ' + who.name + ': ' + e.message); });
      else { who.root = standIn(who.name); who.root.position.set(at.x, 0, at.z); who.standIn = true; P.g.add(who.root); }
    }
    // for finding a way: the same answer, but with room left round each person, so a route goes past them and not through them
    const round = P.people.map((w) => { const c = px(w.x, w.z), rx = Math.abs(px(w.x + 0.62, w.z)[0] - c[0]), ry = Math.abs(px(w.x, w.z + 0.62)[1] - c[1]); return [c[0], c[1], rx, ry]; });
    P.way = (x, y) => { if (!P.free(x, y)) return false; for (const r of round) { const dx = (x - r[0]) / r[2], dy = (y - r[1]) / r[3]; if (dx * dx + dy * dy < 1) return false; } return true; };
    P.grid = new Uint8Array(GW * GH); for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) P.grid[j * GW + i] = P.way(i * CELL + CELL / 2, j * CELL + CELL / 2) ? 1 : 0;
    for (const s of M.spots || []) { const at = groundPx(s.at[0], s.at[1]); P.spots.push({ kind: s.kind, label: s.label, note: s.note, x: at.x, z: at.z }); }
    P.exits = (M.exits || []).map((e) => ({ rect: e.rect, to: e.to, at: e.at, label: e.label, say: e.say }));
    P.start = groundPx(M.start[0], M.start[1]); P.g.visible = false; group.add(P.g); places[id] = P; return P;
  }

  // ---------- finding a way: over the grid of free cells, then pulled straight where nothing is in the way ----------
  const cellOf = (x, y) => [Math.max(0, Math.min(GW - 1, Math.floor(x / CELL))), Math.max(0, Math.min(GH - 1, Math.floor(y / CELL)))];
  function nearestFree(P, i, j) { if (P.grid[j * GW + i]) return [i, j]; for (let r = 1; r < 40; r++) { let best = null, bd = 1e9; for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= GW || b >= GH || !P.grid[b * GW + a]) continue; const d = di * di + dj * dj; if (d < bd) { bd = d; best = [a, b]; } } if (best) return best; } return null; }
  function clear(P, x0, y0, x1, y1) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 5); for (let k = 1; k < n; k++) { const t = k / n; if (!P.way(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false; } return true; }
  function route(P, fx, fy, tx, ty) {
    const s = nearestFree(P, ...cellOf(fx, fy)), e = nearestFree(P, ...cellOf(tx, ty)); if (!s || !e) return null;
    const N = GW * GH, cost = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), open = [[0, s[1] * GW + s[0]]], goal = e[1] * GW + e[0]; cost[open[0][1]] = 0;
    const hx = (c) => Math.hypot(c % GW - e[0], Math.floor(c / GW) - e[1]);
    while (open.length) {
      let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k; const c = open.splice(bi, 1)[0][1]; if (c === goal) break;
      const ci = c % GW, cj = Math.floor(c / GW);
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const a = ci + di, b = cj + dj; if (a < 0 || b < 0 || a >= GW || b >= GH) continue; const n = b * GW + a; if (!P.grid[n]) continue;
        if (di && dj && (!P.grid[cj * GW + a] || !P.grid[b * GW + ci])) continue;      // no cutting a corner
        const g = cost[c] + (di && dj ? 1.414 : 1); if (g < cost[n]) { cost[n] = g; from[n] = c; open.push([g + hx(n), n]); } }
    }
    if (from[goal] < 0 && goal !== s[1] * GW + s[0]) return null;
    let pts = []; for (let c = goal; c >= 0; c = from[c]) pts.push([c % GW * CELL + CELL / 2, Math.floor(c / GW) * CELL + CELL / 2]); pts.reverse();
    if (P.way(tx, ty)) pts.push([tx, ty]);
    const out = []; let i = 0, hx0 = fx, hy0 = fy;      // pull the string tight
    while (i < pts.length) { let k = pts.length - 1; while (k > i && !clear(P, hx0, hy0, pts[k][0], pts[k][1])) k--; out.push(pts[k]); hx0 = pts[k][0]; hy0 = pts[k][1]; i = k + 1; }
    return out.map((p) => groundPx(p[0], p[1]));
  }

  // ---------- her ----------
  const me = { x: 0, z: 0, face: 0, vx: 0, vz: 0, wb: 0, rb: 0, phase: 0, path: null, stuck: 0, idleT: 0, idleNext: 5 };
  const keys = {}, patch = stage.footPatch(0.42); let J = null, viewX = null, viewY = null, near = null, talk = null, busy = false, toastT = 0, clock = 0;
  function open(x, z) {
    px(x, z, _f); if (!cur.free(_f[0], _f[1])) return false;
    for (const p of cur.people) if (Math.hypot(x - p.x, z - p.z) < 0.42) return false;
    return true;
  }
  function endTalk() { if (!talk) return; if (talk.npc) talk.npc.talk(false); talk = null; H.say(null); }
  function show(id, at, face) {
    if (cur) { cur.g.visible = false; endTalk(); }
    const P = places[id] || build(id); stage.setScene(P.S); cur = P; P.g.visible = true; api.id = id;
    const g = at ? groundPx(at[0], at[1]) : P.start; me.x = g.x; me.z = g.z; me.vx = me.vz = 0; me.path = null; if (face != null) me.face = face; viewX = viewY = null;
    if (!open(me.x, me.z)) { const c = nearestFree(P, ...cellOf(...px(me.x, me.z))); if (c) { const q = groundPx(c[0] * CELL + CELL / 2, c[1] * CELL + CELL / 2); me.x = q.x; me.z = q.z; } }      // a traced map may put the arriving spot a step outside the walk area
    const Z = DATA.zones[P.M.zone] || DATA.zones[1]; stage.key.color.setHex(Z.key); P.S.rig.key = Z.keyK; P.S.rig.rim = Z.rimK; stage.rigK = P.S.rig; api.dimBase = Z.dim;
    for (const l of stage.near) { l.color.setHex(0xffb768); l.distance = 7; }
    J.root.position.set(me.x, 0, me.z); J.root.rotation.y = me.face; H.place(P);
  }
  const FACE = { e: Math.PI / 2, w: -Math.PI / 2, n: Math.PI, s: 0 };
  function go(id, at, dir, card) {
    if (busy) return; busy = true; endTalk(); H.prompt('');
    const land = () => { show(id, at, FACE[dir]); busy = false; H.fade(false); };
    H.fade(true); setTimeout(() => { if (card) H.card(card, land); else land(); }, 260);
  }

  const api = {
    me, keys, places, id: '', dimBase: 0,
    get place() { return cur; }, get talking() { return !!talk; }, get busy() { return busy; },
    enter(j, id) { J = j; J.targetDist = 0; J.arena = 0; J.game.fates = []; J.game.catches = 0; J.reset(); me.face = 0.4; patch.visible = true; show(id || 'W1'); },
    jump(id) { if (DATA.maps[id] && !busy) go(id, null, 's'); },
    // a click or a tap on the picture: walk there, round whatever is in the way
    pointer(cx, cy) {
      if (busy || !cur) return; if (talk) endTalk();
      const c = H.size(), fx = stage.win.x + cx / c[0] * stage.win.w, fy = stage.win.y + cy / c[1] * stage.win.h, p = px(me.x, me.z);
      me.path = route(cur, p[0], p[1], fx, fy); me.stuck = 0;
    },
    act() {
      if (busy || !cur || !J) return;
      if (talk) { talk.i++; if (talk.i >= talk.who.says.length) { talk.who.said = 0; endTalk(); } else H.say(talk.who.name, talk.who.says[talk.i], talk.i, talk.who.says.length); return; }
      if (!near) return; me.path = null;
      if (near.kind === 'person') { const w = near.who; if (!w.says.length) return H.toast(w.name + ' has nothing to say yet.'); talk = { who: w, npc: w.npc, i: 0 }; if (w.npc) { w.npc.face(me.x, me.z); if (!w.met) w.npc.greet(); w.npc.talk(true); } w.met = true; H.say(w.name, w.says[0], 0, w.says.length); }
      else if (near.kind === 'rest') H.toast('Rested at ' + near.label.charAt(0).toLowerCase() + near.label.slice(1) + '. Saving comes with the rest of the game.');
    },
    step(dt, t) {
      clock = t; if (!cur || !J) return;
      let ix = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), iz = (keys.d ? 1 : 0) - (keys.u ? 1 : 0), mag = Math.hypot(ix, iz), run = !!keys.run;
      if (busy) { ix = iz = mag = 0; }
      if (mag > 0) { ix /= mag; iz /= mag; me.path = null; }
      else if (me.path && me.path.length) { const g = me.path[0], dx = g.x - me.x, dz = g.z - me.z, d = Math.hypot(dx, dz); if (d < (me.path.length > 1 ? 0.3 : 0.1)) { me.path.shift(); } else { let rest = d; for (let k = 1; k < me.path.length; k++) rest += Math.hypot(me.path[k].x - me.path[k - 1].x, me.path[k].z - me.path[k - 1].z); ix = dx / d; iz = dz / d; mag = Math.min(1, rest / 0.6); run = rest > 6; } }
      if (mag > 0 && talk) endTalk();
      const act = J.action && !/^(look_around|settle)$/.test(J.action);
      if (mag > 0 && J.action && !act) J.stop();
      const can = !act && !J.stanceNow && !J.pending && !talk, speed = can && mag > 0 ? (run ? 2.3 : 0.84) * Math.min(1, mag) : 0;
      const k = Math.min(1, dt * 7); me.vx += (ix * speed - me.vx) * k; me.vz += (iz * speed - me.vz) * k;
      const nx = me.x + me.vx * dt, nz = me.z + me.vz * dt, was = [me.x, me.z];
      if (open(nx, nz)) { me.x = nx; me.z = nz; } else if (open(nx, me.z)) { me.x = nx; me.vz *= 0.5; } else if (open(me.x, nz)) { me.z = nz; me.vx *= 0.5; } else { me.vx = me.vz = 0; }
      const moved = Math.hypot(me.x - was[0], me.z - was[1]) / Math.max(dt, 1e-4), v = Math.min(moved, Math.hypot(me.vx, me.vz));
      if (me.path) { me.stuck = v < 0.05 && mag > 0 ? me.stuck + dt : 0; if (me.stuck > 0.6 || !me.path.length) me.path = null; }
      if (talk) { let df = Math.atan2(talk.who.x - me.x, talk.who.z - me.z) - me.face; df = Math.atan2(Math.sin(df), Math.cos(df)); me.face += df * Math.min(1, dt * 6); }
      else if (v > 0.06) { let df = Math.atan2(me.vx, me.vz) - me.face; df = Math.atan2(Math.sin(df), Math.cos(df)); me.face += df * Math.min(1, dt * 9); }
      const wbTo = Math.min(1, v / 0.3), rbTo = Math.max(0, Math.min(1, (v - 1.0) / 1.0));
      me.wb += (wbTo - me.wb) * Math.min(1, dt * 8); me.rb += (rbTo - me.rb) * Math.min(1, dt * 5);
      if (me.wb > 0.001) me.phase += dt * Math.max(2.0, v * (7.66 * (1 - me.rb) + 4.2 * me.rb));
      if (v < 0.05 && !J.action && !talk) { me.idleT += dt; if (me.idleT > me.idleNext) { me.idleT = 0; me.idleNext = 6 + rnd() * 7; J.play(rnd() < 0.5 ? 'look_around' : 'settle', false); } } else me.idleT = 0;
      J.root.position.set(me.x, 0, me.z); J.root.rotation.y = me.face + J.spin; stage.follow(me.x, me.z); patch.position.set(me.x, 0.006, me.z);
      // a way out: her feet are inside its box
      if (!busy) { px(me.x, me.z, _f); for (const e of cur.exits) if (inRect(_f[0], _f[1], e.rect, 16)) {      // a little generous, so someone standing by a narrow way out does not shut it
        if (!DATA.maps[e.to]) { if (t > toastT) { H.toast('The way to ' + (e.label || e.to) + ' is not built yet.'); toastT = t + 4; } me.path = null; break; }
        const back = (DATA.maps[e.to].exits || []).find((b) => b.to === cur.id), dirOf = (r) => r[0] <= 2 ? 'e' : r[2] >= FW - 2 ? 'w' : r[3] >= FH - 2 ? 'n' : 's';
        go(e.to, e.at, back ? dirOf(back.rect) : 's', DATA.flights[cur.id + '>' + e.to] || null); break; } }
      // the people here: they turn to her when she is near, and stand as they were when she is not
      near = null; let nd = 2.4;
      for (const p of cur.people) { const d = Math.hypot(p.x - me.x, p.z - me.z); if (p.npc) { if (d < 3.4 || talk && talk.who === p) p.npc.face(me.x, me.z); else p.npc.face(p.x - p.x * 0.25, p.z + 6); p.npc.update(dt); } else if (p.standIn && d < 3.4) p.root.rotation.y = Math.atan2(me.x - p.x, me.z - p.z); if (d < nd) { nd = d; near = { kind: 'person', who: p }; } }
      for (const s of cur.spots) { const d = Math.hypot(s.x - me.x, s.z - me.z); if (d < Math.min(nd, 2.0)) { nd = d; near = { kind: s.kind, label: s.label }; } }
      H.prompt(busy || act || talk ? '' : near ? (near.kind === 'person' ? 'Talk to ' + near.who.name.charAt(0).toLowerCase() + near.who.name.slice(1) : 'Rest at ' + near.label.charAt(0).toLowerCase() + near.label.slice(1)) : '');
      // the four near lights go to the nearest painted lamps and fires
      const by = cur.lamps.slice().sort((a, b) => Math.hypot(a.x - me.x, a.z - me.z) - Math.hypot(b.x - me.x, b.z - me.z));
      stage.near.forEach((l, i) => { const p = by[i]; if (!p) { l.intensity = 0; return; } p.f = 0.82 + 0.1 * Math.sin(t * 7.3 + p.seed) + 0.08 * Math.sin(t * 13.1 + p.seed * 2.3); l.position.set(p.x, p.h, p.z); l.intensity = 0.55 * p.f; });
      // the screen shows a window of the painting that follows her
      const asp = H.aspect(), span = cur.M.camera.span || 10.7; let w = FW * 0.4433 * (15 / span) / (H.close() || 1), h = w / asp; if (h > FH) { h = FH; w = h * asp; if (w > FW) { w = FW; h = FH; } }      // the same size on screen in every place: about 13 m across, as in the pilot's fair square at "40% larger"
      const p = stage.toFrame(_b.set(me.x + me.vx * 0.6, 0.9, me.z + me.vz * 0.6)), tx = p[0] - w / 2, ty = p[1] - h * 0.52;
      if (viewX == null) { viewX = tx; viewY = ty; } else { viewX += (tx - viewX) * Math.min(1, dt * 2.6); viewY += (ty - viewY) * Math.min(1, dt * 2.6); }
      viewX = Math.max(0, Math.min(FW - w, viewX)); viewY = Math.max(0, Math.min(FH - h, viewY));
      stage.setWindow(viewX, viewY, w, h); stage.dim = api.dimBase; stage.dark = 0; stage.shakeX = stage.shakeY = 0;
      J.animate(me.phase, me.wb, t, dt, me.rb);
    },
  };
  return api;
}
