// minds.js: a small mind for each of the fair folk, so the fair is alive when she walks up.
// Each person has a few needs that rise and fall (their stall wants minding, their legs get tired, the night gets cold, they want company,
// they get restless, and tonight's wrongness makes them want to go and look). Every so often a person weighs what each thing they could do
// is worth to them right now and does the best one: mind the stall, sit down, warm at a fire, go and talk to a friend, take a turn about,
// stand and watch the east. The pull of the night (set by the stage and the lamps home) raises the cold and the worry.
// No drawing: it drives the people through MF_NPC's own calls (walkTo, sit, stand, face, talk, emote) and finds its way round things on a grid.
//
//   const minds = MF_MINDS.make(world);     // world: { walk(x, z, pad) -> can a body stand here, pad metres clear of solid things (people not counted), height(x, z),
//                                           //          fires: [{x, z}], lamps: [{x, z}], her() -> {x, z}, bodies() -> [{x, z}] others to keep clear of,
//                                           //          seat(x, z, turn) -> put something to sit on there (optional) }
//   minds.add(person);                      // person: the page's own { id, x, z, y, home, npc }; minds keeps x, z and y true as they move
//   minds.set({ stage, lamps });            // the evening
//   minds.on = { pair(a, b), notice(p), blocked(p) };   // two have met to talk; someone has seen her pass; she is standing in someone's way
//   minds.step(dt);                         // every frame, before the people's own update
//   minds.hold(person, true | false);       // while she is talking to them
//   minds.doing(person)                     // 'work', 'rest', 'warm', 'walk', 'watch' or 'chat', for MF_TALK
(function (root) {
  'use strict';
  // Who they are, as numbers (stand-ins, like their names): how much the stall matters, how much they like company, how fidgety they are,
  // how much the night gets to them, how soon their legs tire. roam: how far from their place they will go, in metres. friends: whom they seek out.
  const T = {
    'old-lamp-seller':    { dutiful: 0.9, sociable: 0.5, lively: 0.3, worrier: 0.8, old: 0.8, roam: 48, seat: true, workSeated: true, friends: { 'ribbon-dyer': 1, 'fortune-teller': 0.7, 'ballad-singer': 0.6, 'old-night-watchman': 0.5, 'gate-keeper': 0.2 } },
    'ribbon-dyer':        { dutiful: 0.8, sociable: 0.3, lively: 0.2, worrier: 0.5, old: 1.0, roam: 48, seat: true, friends: { 'old-lamp-seller': 1, 'fortune-teller': 0.6, 'ballad-singer': 0.5, 'fair-baker': 0.4, 'chestnut-roaster': 0.2 } },
    'fortune-teller':     { dutiful: 0.5, sociable: 0.5, lively: 0.5, worrier: 0.9, old: 0.2, roam: 96, seat: true, friends: { 'ballad-singer': 0.8, 'old-lamp-seller': 0.7, 'ribbon-dyer': 0.6, 'fair-baker': 0.5, 'gate-keeper': 0.4, 'chestnut-roaster': 0.3 } },
    'ballad-singer':      { dutiful: 0.6, sociable: 0.9, lively: 0.9, worrier: 0.6, old: 0, roam: 96, seat: true, friends: { 'fortune-teller': 0.8, 'fair-baker': 0.7, 'old-lamp-seller': 0.6, 'ribbon-dyer': 0.6, 'chestnut-roaster': 0.5, 'pie-seller': 0.4 } },
    'fair-baker':         { dutiful: 0.8, sociable: 0.9, lively: 0.6, worrier: 0.4, old: 0.3, roam: 52, seat: true, friends: { 'pie-seller': 1, 'old-night-watchman': 0.7, 'ballad-singer': 0.6, 'chestnut-roaster': 0.6, 'fortune-teller': 0.5, 'gate-keeper': 0.4 } },
    'old-night-watchman': { dutiful: 0.6, sociable: 0.4, lively: 0.8, worrier: 0.5, old: 0.7, roam: 100, round: true, friends: { 'fair-baker': 0.7, 'gate-keeper': 0.8, 'old-lamp-seller': 0.6 } },
    'pie-seller':         { dutiful: 0.9, sociable: 0.8, lively: 0.6, worrier: 0.5, old: 0.3, roam: 60, seat: true, friends: { 'fair-baker': 1, 'chestnut-roaster': 0.7, 'ribbon-dyer': 0.5, 'gate-keeper': 0.4 } },
    'gate-keeper':        { dutiful: 1.0, sociable: 0.2, lively: 0.3, worrier: 0.7, old: 0.3, roam: 14, friends: { 'chestnut-roaster': 0.6, 'old-night-watchman': 0.8 } },
    'chestnut-roaster':   { dutiful: 0.7, sociable: 1.0, lively: 0.8, worrier: 0.5, old: 0.3, roam: 96, friends: { 'gate-keeper': 0.9, 'pie-seller': 0.8, 'fair-baker': 0.6, 'ballad-singer': 0.5, 'fortune-teller': 0.4, 'ribbon-dyer': 0.4 } },
    // out on the moor, alone: no friends to visit, and they do not go far from their light
    'old-lamplighter':    { dutiful: 1.0, sociable: 0, lively: 0.4, worrier: 1.0, old: 0.9, roam: 9, friends: {} },
    'farm-lad':           { dutiful: 1.0, sociable: 0, lively: 0.9, worrier: 1.0, old: 0, roam: 7, seat: true, workSeated: true, friends: {} },
  };
  const DEF = { dutiful: 0.7, sociable: 0.5, lively: 0.5, worrier: 0.5, old: 0.3, roam: 20, friends: {} };
  // how hard the night pulls, 0 to 1: nothing much at dusk, worst when the lamps have just gone, easing as each comes home, gone after the end
  function pull(stage, lamps) { return [0.15, 0.7, 0.8 - 0.4 * Math.min(1, (lamps || 0) / 12), 0.35, 0.5, 0][Math.max(0, Math.min(5, stage | 0))]; }
  const CELL = 0.5, clamp = (v) => Math.max(0, Math.min(1, v));

  function make(world) {
    const minds = [], byId = {}, cells = new Map(); let P = 0.15, clock = 0, seed = 987654321;
    const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
    const between = (a, b) => a + (b - a) * rnd();
    const api = { on: {}, list: minds, pull: () => P };

    // ---- finding a way: a grid of half-metre cells, each asked once whether a body fits there ----
    function open(i, j) {
      const k = i + ',' + j; let v = cells.get(k);
      if (v === undefined) { v = world.walk(i * CELL, j * CELL, 0.5); cells.set(k, v); }      // 0.5: a body's half-width and a little room, kept clear of every solid thing
      return v;
    }
    const clear = (x, z) => open(Math.round(x / CELL), Math.round(z / CELL));
    function sight(ax, az, bx, bz) { const d = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(d / 0.25)); for (let s = 0; s <= n; s++) { const t = s / n; if (!clear(ax + (bx - ax) * t, az + (bz - az) * t)) return false; } return true; }
    function nearestOpen(x, z, max) {
      const i0 = Math.round(x / CELL), j0 = Math.round(z / CELL); if (open(i0, j0)) return [i0, j0];
      for (let r = 1; r <= (max || 6); r++) for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; if (open(i0 + di, j0 + dj)) return [i0 + di, j0 + dj]; }
      return null;
    }
    // A* from a to b, then pulled straight. Returns points to walk to in turn (the last is b), or null if there is no way
    function path(ax, az, bx, bz) {
      if (sight(ax, az, bx, bz)) return [[bx, bz]];
      const s = nearestOpen(ax, az), g = nearestOpen(bx, bz); if (!s || !g) return null;
      const key = (i, j) => i * 100003 + j, h = (i, j) => { const dx = Math.abs(i - g[0]), dz = Math.abs(j - g[1]); return 1.5 * (Math.max(dx, dz) + 0.414 * Math.min(dx, dz)); };      // leaning on the straight-line guess (1.5) looks at far fewer cells; the way is pulled straight afterwards anyway
      const gs = new Map(), from = new Map(), done = new Set(), heap = [[h(s[0], s[1]), s[0], s[1]]]; gs.set(key(s[0], s[1]), 0);
      const push = (n) => { heap.push(n); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
      const pop = () => { const t = heap[0], l = heap.pop(); if (heap.length) { heap[0] = l; let c = 0; for (;;) { let m = c; const a = 2 * c + 1, b = a + 1; if (a < heap.length && heap[a][0] < heap[m][0]) m = a; if (b < heap.length && heap[b][0] < heap[m][0]) m = b; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return t; };
      let found = false, n = 0;
      while (heap.length && n++ < 9000) {
        const [, i, j] = pop(), k = key(i, j); if (done.has(k)) continue; done.add(k);
        if (i === g[0] && j === g[1]) { found = true; break; }
        for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
          if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (!open(ni, nj)) continue; if (di && dj && (!open(i + di, j) || !open(i, j + dj))) continue;      // no cutting corners
          const nk = key(ni, nj), c = gs.get(k) + (di && dj ? 1.414 : 1); if (gs.has(nk) && gs.get(nk) <= c) continue; gs.set(nk, c); from.set(nk, [i, j]); push([c + h(ni, nj), ni, nj]);
        }
      }
      if (!found) return null;
      const pts = []; let c = g; while (c) { pts.push([c[0] * CELL, c[1] * CELL]); c = from.get(key(c[0], c[1])); } pts.reverse();
      if (Math.hypot(pts[pts.length - 1][0] - bx, pts[pts.length - 1][1] - bz) < 2) pts.push([bx, bz]);      // the last step is to the spot itself (a stall's own standing place may be tight against its counter)
      const out = []; let at = [ax, az], i = 0;                                         // pull it straight: from where they stand, the farthest point still in sight
      while (i < pts.length) { let far = i; for (let j = pts.length - 1; j > i; j--) if (sight(at[0], at[1], pts[j][0], pts[j][1])) { far = j; break; } out.push(pts[far]); at = pts[far]; i = far + 1; }
      return out;
    }
    // a free spot on a ring round a point, nearest the side the person is coming from
    function beside(cx, cz, r, fromX, fromZ, taken) {
      const a0 = Math.atan2(fromX - cx, fromZ - cz); let pick = null;
      for (let k = 0; k < 12 && !pick; k++) { const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 6, x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r; if (clear(x, z) && !crowded(x, z, 0.75, taken)) pick = { x, z, face: Math.atan2(cx - x, cz - z) }; }
      return pick;
    }
    function crowded(x, z, r, but) { for (const m of minds) { if (m === but) continue; const t = m.goal && m.phase === 'go' ? m.goal : m.p; if (Math.hypot(t.x - x, t.z - z) < r) return true; } return false; }

    // ---- what each thing is worth, and where it happens ----
    function fireNear(m) { let best = null, bd = 1e9; for (const f of world.fires || []) { const d = Math.hypot(f.x - m.home.x, f.z - m.home.z); if (d < Math.min(m.t.roam, 40) && d < bd && d > 0.2) { bd = d; best = f; } } return best; }
    function friendFor(m) {
      // a friend a long walk off is worth less, and the same friend twice running less again
      let best = null, top = 0;
      for (const id in m.t.friends) { const f = byId[id]; if (!f || f.held || f.phase === 'go' || f.partner || f.act === 'visit') continue; const d = Math.hypot(f.p.x - m.p.x, f.p.z - m.p.z), dh = Math.hypot(f.p.x - m.home.x, f.p.z - m.home.z); if (dh > m.t.roam || d < 0.9) continue; const v = m.t.friends[id] * (1 - 0.65 * d / m.t.roam) * (m.lastFriend === id ? 0.5 : 1); if (v > top) { top = v; best = f; } }
      return best ? { f: best, v: top } : null;
    }
    function worth(m) {
      const n = m.need, t = m.t, u = { work: 0.3 + 0.6 * n.duty };
      if (m.seat && !t.workSeated) u.rest = n.tired;
      if (m.fire) u.warm = n.cold * 0.9;
      const fr = friendFor(m); if (fr) u.visit = n.lonely * (0.45 + 0.55 * fr.v);
      u.stroll = n.restless * 0.8;
      if (P > 0.05) u.watch = n.watch;
      if (t.round) u.round = 0.4 + 0.6 * n.restless;
      for (const k in u) { u[k] += (rnd() - 0.5) * 0.1; if (k === m.act && k !== 'work' && k !== 'round') u[k] *= 0.5; if (m.failed[k] > clock) u[k] = -1; }
      return { u, fr };
    }
    function unpair(m) { const o = m.partner; if (!o) return; if (m.p.npc) m.p.npc.talk(false); if (o.p.npc && !o.held) o.p.npc.talk(false); o.partner = null; m.partner = null; m.script = o.script = false; m.turnIn = o.turnIn = null; }
    function decide(m) {
      const { u, fr } = worth(m); let pick = 'work', top = -1e9; for (const k in u) if (u[k] > top) { top = u[k]; pick = k; }
      begin(m, pick, fr);
    }
    function begin(m, act, fr) {
      const p = m.p, t = m.t; let goal = null, dur = 0;
      unpair(m);
      if (act === 'work') { goal = { x: m.home.x, z: m.home.z, face: m.home.face, sit: !!(t.workSeated && m.seat) }; dur = between(30, 75); }
      else if (act === 'rest') { goal = { x: m.seat.x, z: m.seat.z, face: m.seat.face, sit: true }; dur = between(30, 70); }
      else if (act === 'warm') { goal = beside(m.fire.x, m.fire.z, 1.25, p.x, p.z, m); dur = between(20, 45); }
      else if (act === 'visit') { const f = fr.f; goal = beside(f.p.x, f.p.z, 1.15, p.x, p.z, m); if (goal) { goal.friend = f; m.lastFriend = f.p.id; } dur = between(14, 24); }
      else if (act === 'stroll') { for (let k = 0; k < 8 && !goal; k++) { const a = rnd() * Math.PI * 2, d = between(4, Math.min(11, t.roam)), x = p.x + Math.sin(a) * d, z = p.z + Math.cos(a) * d; if (Math.hypot(x - m.home.x, z - m.home.z) < t.roam && clear(x, z) && !crowded(x, z, 1.2, m)) goal = { x, z, face: a + between(-1, 1) }; } dur = between(4, 9); }
      else if (act === 'watch') { for (let k = 0; k < 8 && !goal; k++) { const d = between(1.5, Math.min(5, t.roam)), a = between(-0.9, 0.9) + Math.PI / 2, x = m.home.x + Math.sin(a) * d, z = m.home.z + Math.cos(a) * d; if (clear(x, z) && !crowded(x, z, 1.0, m)) goal = { x, z, face: Math.PI / 2 + between(-0.25, 0.25) }; } dur = between(12, 24); }      // +x is east: the gate, the moor, the crag
      else if (act === 'round') { const L = (world.lamps || []).filter((l) => Math.hypot(l.x - m.home.x, l.z - m.home.z) < t.roam); if (L.length) { const l = L[m.roundAt++ % L.length]; goal = beside(l.x, l.z, 1.1, p.x, p.z, m); } dur = between(3, 6); }
      const way = goal ? path(p.x, p.z, goal.x, goal.z) : null;
      if (!goal || !way) { m.failed[act] = clock + 60; if (act === 'work') { m.act = 'work'; m.phase = 'be'; m.left = 8; m.goal = null; return; } return begin(m, 'work'); }      // no way there: back to the stall, and leave that idea alone for a minute
      m.was = m.act; m.act = act; m.goal = goal; m.way = way; m.wp = 0; m.dur = dur; m.phase = 'go'; m.wait = 0; m.stuck = 0; m.emoteIn = between(4, 9);
      if (Math.hypot(goal.x - p.x, goal.z - p.z) < 0.12) arrive(m); else walk(m);
    }
    function walk(m) { const w = m.way[m.wp], npc = m.p.npc; m.walking = true; m.stuck = 0; if (npc) npc.walkTo(w[0], w[1]); }      // the step below sees them get there (no waiting on the walk's own promise, so it works however the frames are run)
    function arrive(m) {
      const g = m.goal, npc = m.p.npc; m.walking = false; m.phase = 'be'; m.left = m.dur; m.face = g.face;
      if (npc) { npc.face(m.p.x + Math.sin(g.face) * 5, m.p.z + Math.cos(g.face) * 5); if (g.sit) m.sitIn = 0.5; }
      if (g.friend) { const f = g.friend; if (!f.held && f.phase !== 'go' && !f.partner) { m.partner = f; f.partner = m; f.left = Math.max(f.left || 0, m.dur + 1); f.turnIn = null; m.turn = 0; m.turnIn = 0.8; if (api.on.pair) api.on.pair(m.p, f.p); } else m.left = 2; }
    }

    // ---- every frame ----
    api.step = function (dt) {
      clock += dt; const her = world.her ? world.her() : null;
      for (const m of minds) {
        const p = m.p, npc = p.npc, n = m.need, t = m.t; if (!npc || p.asleep) continue;
        p.x = npc.root.position.x; p.z = npc.root.position.z; if (npc.moving) { p.y = world.height(p.x, p.z); npc.root.position.y = p.y; }
        const dHer = her ? Math.hypot(her.x - p.x, her.z - p.z) : 1e9;
        // the needs
        const seated = npc.sitting, atFire = m.act === 'warm' && m.phase === 'be', chatting = !!m.partner || m.held, moving = m.phase === 'go';
        n.tired = clamp(n.tired + (seated ? -dt / 45 : dt / 260 * (0.6 + t.old)));
        n.cold = clamp(n.cold + (atFire ? -dt / 35 : dt * (0.25 + P) / 220));
        n.lonely = clamp(n.lonely + (chatting ? -dt / 25 : dt * t.sociable / 200));
        n.restless = clamp(n.restless + (moving ? -dt / 20 : dt * t.lively / 170));
        n.watch = clamp(n.watch + (m.act === 'watch' && m.phase === 'be' ? -dt / 25 : dt * P * t.worrier / 100));
        n.duty = clamp(n.duty + (m.act === 'work' && m.phase === 'be' ? -dt / 70 : dt * t.dutiful / 150));
        if (m.held) { if (her) npc.face(her.x, her.z); continue; }
        if (m.phase === 'go') {
          // someone in the way just ahead? stop and let them by; if they do not move, think again
          const w = m.way[m.wp]; let block = null;
          if (w) { const dx = w[0] - p.x, dz = w[1] - p.z, d = Math.hypot(dx, dz) || 1, ax = p.x + dx / d * 0.55, az = p.z + dz / d * 0.55;
            if (her && Math.hypot(her.x - ax, her.z - az) < 0.7) block = 'her';
            if (!block) for (const o of minds) if (o !== m && o !== (m.goal && m.goal.friend) && Math.hypot(o.p.x - ax, o.p.z - az) < 0.62 && (o.phase !== 'go' || o.p.id < p.id)) { block = o; break; }
            if (!block && world.bodies) for (const b of world.bodies()) if (Math.hypot(b.x - ax, b.z - az) < 0.7) { block = b; break; } }
          if (block) { if (m.walking) { m.walking = false; npc.stop(); if (block === 'her' && api.on.blocked) api.on.blocked(p); } m.wait += dt; if (m.wait > 2.5) { m.failed[m.act] = clock + 20; m.phase = 'be'; m.left = 0; m.goal = null; } }
          else if (!m.walking) { m.wait = 0; walk(m); }
          else if (!npc.moving) {                                           // the walk has ended: at the point, so on to the next; or cut short by something else, so set off again
            if (w && Math.hypot(w[0] - p.x, w[1] - p.z) < 0.1) { m.wp++; if (m.wp >= m.way.length) arrive(m); else walk(m); }
            else { m.stuck += 1; if (m.stuck > 3) { m.failed[m.act] = clock + 20; m.phase = 'be'; m.left = 0; } else npc.walkTo(w[0], w[1]); }
          }
          continue;
        }
        // standing, sitting, warming, watching, talking
        if (m.sitIn != null) { m.sitIn -= dt; if (m.sitIn <= 0) { m.sitIn = null; npc.sit(); } }
        if (m.partner) {                                                    // two talking: turn about, a few seconds each (the page may say who, when there are words)
          const o = m.partner; if (!npc.sitting) npc.face(o.p.x, o.p.z);
          if (m.turnIn != null) { m.turnIn -= dt; if (m.turnIn <= 0) { m.turn ^= 1; m.turnIn = between(2.6, 4.2); if (o.held) npc.talk(false); else if (!m.script) { npc.talk(!!m.turn); if (o.p.npc) o.p.npc.talk(!m.turn); } } }
        } else if (!npc.sitting) {
          if (dHer < 3.4) npc.face(her.x, her.z);
          else if (dHer < 7 && m.glance > 0) npc.face(her.x, her.z);
          else if (m.face != null) npc.face(p.x + Math.sin(m.face) * 5, p.z + Math.cos(m.face) * 5);
        }
        // two who find themselves side by side (at the same fire, say) fall to talking
        if (!m.partner && m.meetIn <= 0 && (m.act === 'warm' || m.act === 'watch' || m.act === 'stroll' || m.act === 'round')) {
          for (const o of minds) { if (o === m || o.partner || o.held || o.phase !== 'be' || o.meetIn > 0 || !o.p.npc || o.p.asleep) continue; if (Math.hypot(o.p.x - p.x, o.p.z - p.z) > 2.3) continue;
            m.partner = o; o.partner = m; const dur = between(12, 20); m.left = Math.max(m.left, dur); o.left = Math.max(o.left, dur + 1); m.turn = 0; m.turnIn = 0.8; o.turnIn = null; m.meetIn = o.meetIn = 150; if (api.on.pair) api.on.pair(p, o.p); break; }
        }
        m.meetIn -= dt;
        // seeing her go by
        m.glance -= dt;
        if (dHer < 7 && m.sawHer > 12 && !m.partner) { m.glance = 2.6; m.sawHer = 0; if (api.on.notice) api.on.notice(p); } else if (dHer >= 7) m.sawHer += dt;
        // small things while they stand: the look of the job
        m.emoteIn -= dt;
        if (m.emoteIn <= 0 && !npc.busy && !npc.talking && dHer > 2.4) { m.emoteIn = between(7, 15); const e = m.act === 'watch' ? ['think', 'point', 'shake_head', 'fidget_look'] : m.act === 'warm' ? ['fidget_hands', 'fidget_hands', 'nod'] : m.act === 'work' ? ['fidget_hands', 'think', 'nod', 'fidget_look'] : m.act === 'round' ? ['think', 'nod'] : ['fidget_look', 'fidget_shift']; npc.emote(e[Math.floor(rnd() * e.length)]); }
        m.left -= dt;
        if (m.left <= 0 && !(m.partner && m.partner.held)) {
          unpair(m); decide(m);
        }
      }
    };

    api.add = function (p) {
      const t = Object.assign({}, DEF, T[p.id] || {}), m = { p, t, home: { x: p.x, z: p.z, face: p.home || 0 }, need: { tired: rnd() * 0.5, cold: rnd() * 0.4, lonely: rnd() * 0.6, restless: rnd() * 0.6, watch: rnd() * 0.3, duty: 0.6 + rnd() * 0.4 },
        act: 'work', was: '', phase: 'be', left: between(4, 30), face: p.home || 0, failed: {}, partner: null, held: false, glance: 0, sawHer: 20, emoteIn: between(3, 10), roundAt: Math.floor(rnd() * 8), seat: null, fire: null, goal: null, way: null, wp: 0, walking: false, wait: 0, stuck: 0, sitIn: null, turn: 0, turnIn: null, script: false, meetIn: between(20, 60) };
      // somewhere to sit: behind where they work if they work sitting down, or beside the stall
      if (t.seat) {
        const back = 0.35, f = m.home.face;
        if (t.workSeated) m.seat = { x: m.home.x, z: m.home.z, face: f };
        else for (let k = 0; k < 10 && !m.seat; k++) { const a = f + Math.PI / 2 * (k % 2 ? 1 : -1) * (1 + Math.floor(k / 2) * 0.35), d = 1.1 + Math.floor(k / 2) * 0.25, x = m.home.x + Math.sin(a) * d, z = m.home.z + Math.cos(a) * d; if (clear(x, z) && clear(x - Math.sin(f) * back, z - Math.cos(f) * back) && !crowded(x, z, 1.0, m)) m.seat = { x, z, face: f }; }
        if (m.seat && world.seat) { const sx = m.seat.x - Math.sin(m.seat.face) * back, sz = m.seat.z - Math.cos(m.seat.face) * back; world.seat(sx, sz, m.seat.face); for (let i = Math.round(sx / CELL) - 3; i <= Math.round(sx / CELL) + 3; i++) for (let j = Math.round(sz / CELL) - 3; j <= Math.round(sz / CELL) + 3; j++) cells.delete(i + ',' + j); }      // the ground round the new seat is asked about afresh
      }
      m.fire = fireNear(m);
      if (t.workSeated && m.seat) m.sitIn = between(0.5, 2.5);
      minds.push(m); byId[p.id] = m; return m;
    };
    api.set = function (o) { P = pull(o.stage, o.lamps); };
    api.hold = function (p, on) {
      const m = byId[p.id]; if (!m) return;
      if (on && !m.held) { m.held = true; if (m.phase === 'go') { m.walking = false; if (p.npc) p.npc.stop(); } if (m.partner && m.partner.p.npc) m.partner.p.npc.talk(false); }
      else if (!on && m.held) { m.held = false; m.need.lonely = clamp(m.need.lonely - 0.4); if (m.phase === 'go' && m.goal) { const way = path(p.x, p.z, m.goal.x, m.goal.z); if (way) { m.way = way; m.wp = 0; m.wait = 0; walk(m); } else { m.phase = 'be'; m.left = 0; } } }
    };
    // the page has words for two who are talking: it says whose mouth moves
    api.script = function (a, b, on) { const A = byId[a.id], B = byId[b.id]; if (A) A.script = on; if (B) B.script = on; };
    api.doing = function (p) { const m = byId[p.id]; if (!m) return 'work'; if (m.partner) return 'chat'; if (m.phase === 'go') return 'walk'; return { work: 'work', rest: 'rest', warm: 'warm', visit: 'chat', stroll: 'walk', round: 'walk', watch: 'watch' }[m.act] || 'work'; };
    api.mind = (p) => byId[p.id];
    api.why = function (p) { const m = byId[p.id]; if (!m) return ''; const n = m.need; return m.act + (m.phase === 'go' ? ' (on the way)' : '') + (m.partner ? ' with ' + m.partner.p.id : '') + ' · stall ' + n.duty.toFixed(1) + ' tired ' + n.tired.toFixed(1) + ' cold ' + n.cold.toFixed(1) + ' company ' + n.lonely.toFixed(1) + ' restless ' + n.restless.toFixed(1) + ' worry ' + n.watch.toFixed(1); };
    return api;
  }
  root.MF_MINDS = { make, traits: T, pull };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.MF_MINDS;
})(typeof window !== 'undefined' ? window : globalThis);
