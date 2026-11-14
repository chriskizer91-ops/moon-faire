// npc.js: a painted person ready for the game: stands, blinks, fidgets, turns to face the player, talks, and plays emotes.
// three.js r128, global THREE. Load before this file: jester_tex.js, jester_kit.js, lod.js, person-kit.js (and window.MF_FACE_PLAIN),
// then the data made by people/kit/build_npcs.py: npcs.js (window.MF_NPCS), npc_tex.js (window.MF_NPC_TEX), emotes.js (window.MF_EMOTES).
//
//   const npc = await MF_NPC.make('old-lamp-seller');     // ids: MF_NPC.list()
//   scene.add(npc.root); npc.root.position.set(x, 0, z);  // metres, y up; npc.root.rotation.y turns them (0 faces +z)
//   npc.update(dt);                                       // every frame
//   npc.face(playerX, playerZ);                           // turn to face a point on the ground
//   npc.greet();                                          // their own hello
//   npc.talk(true); ... npc.talk(false);                  // while their words are on screen
//   npc.emote('laugh');                                   // any name in npc.emotes
//   npc.headTop(vec3);                                    // a point just above the head, for a speech mark
//   MF_NPC.make('old-lamp-seller', { weight: 'half' })    // or 'quarter': the same person with half or a quarter of the triangles
(function () {
  'use strict';
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  async function make(id, o) {
    o = o || {}; const D = window.MF_NPCS.people[id]; if (!D) throw new Error('no person called ' + id);
    const T = window.MF_NPC_TEX[D.skin], WS = (window.MF_NPCS.weights || {})[D.shapeId] || {}, wt = o.weight && WS[o.weight] ? WS[o.weight].weight : null;      // o.weight: 'half' or 'quarter' for a lighter build of the same person
    const person = Object.assign(D.person(), D.scale || {}, wt ? { weight: wt } : null), W = D.wiring || {};
    const prepared = await window.MF_PERSON.prepare(person, { body: T.body, face: T.face, fit: D.fit, faceFit: D.faceFit, skin: D.skinColour, SKIN: D.SKIN });
    const J = window.MF_PERSON.make(person, prepared, o.opts); J.fx.remove(J.spellLight);
    const E = window.MF_EMOTES(J.FP), all = Object.keys(E);
    for (const n of all) J.defAction('e_' + n, E[n].dur, E[n].keys, { outro: E[n].outro == null ? 0.4 : E[n].outro });
    const has = (n) => all.indexOf(n) >= 0, loops = (W.talk || ['talk_calm']).filter(has), fidgets = (W.fidgets || []).filter(has), pace = W.pace || 1;
    let seed = hash(id) || 1; const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
    const st = { t: rnd() * 10, talking: false, loop: 0, turn: null, fidget: 3 + rnd() * 8, fade: 0, from: J.bones.map((b) => b.quaternion.clone()) };
    const cut = () => { J.bones.forEach((b, i) => st.from[i].copy(b.quaternion)); st.fade = 1; };          // remember the pose, so a move that is cut short melts into the next
    const start = (n) => { if (J.busy) cut(); return J.play('e_' + n, true); };
    const npc = {
      id, name: D.name, who: D.who, root: J.root, fx: J.fx, model: J, wiring: W, weight: wt ? o.weight : 'full', triangles: Object.values(J.partTris).reduce((a, b) => a + b, 0),
      emotes: all.filter((n) => !/^(talk|fidget)_/.test(n)),
      update(dt) {
        dt = Math.min(dt || 0, 0.05); st.t += dt * pace;
        if (st.turn != null) { let d = st.turn - J.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); const step = 3.2 * dt; if (Math.abs(d) <= step) { J.root.rotation.y = st.turn; st.turn = null; } else J.root.rotation.y += Math.sign(d) * step; }
        if (st.talking && !J.busy && loops.length) J.play('e_' + loops[st.loop++ % loops.length], true);
        if (!st.talking && !J.busy && fidgets.length) { st.fidget -= dt; if (st.fidget <= 0) { J.play('e_' + fidgets[Math.floor(rnd() * fidgets.length)], true); st.fidget = 7 + rnd() * 10; } }
        J.animate(0, 0, st.t, dt * pace, 0);
        if (st.fade > 0) { st.fade = Math.max(0, st.fade - dt / 0.28); const k = st.fade * st.fade * (3 - 2 * st.fade); J.bones.forEach((b, i) => { b.quaternion.slerp(st.from[i], k); }); }
      },
      talk(on) { on = !!on; if (on === st.talking) return; st.talking = on; st.fidget = 5 + rnd() * 6; if (!on && /^e_talk_/.test(J.action)) { cut(); J.stop(); } },
      emote(name) { return has(name) ? start(name) : false; },
      greet() { return npc.emote(has(W.greet) ? W.greet : 'nod'); },
      face(x, z) { st.turn = Math.atan2(x - J.root.position.x, z - J.root.position.z); },
      headTop(out) { J.root.updateMatrixWorld(true); return (out || new THREE.Vector3()).set(0, 1.80, 0).applyMatrix4(J.root.matrixWorld); },
      get busy() { return J.busy; }, get talking() { return st.talking; }, get doing() { return J.action ? J.action.replace(/^e_/, '') : ''; },
      dispose() { J.root.traverse((m) => { if (m.geometry) m.geometry.dispose(); }); for (const x of (J.debug.textures || [])) x.dispose(); if (prepared.bodyTex) prepared.bodyTex.dispose(); },
    };
    return npc;
  }
  window.MF_NPC = { make, list: () => Object.keys(window.MF_NPCS.people), info: (id) => window.MF_NPCS.people[id] };
})();
