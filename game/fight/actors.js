// actors.js: the four witches behind one face, for the fight. Each model keeps its own interface (the Jester and the Fox share one; the
// Ranger and Io share another); this file gives the fight the same few things from each: play a move, know when it lands and ends,
// take a blow, faint, get up, bow. Nothing in a model is changed.
//   MF_ACTORS.make(id, weight) -> actor      id: 'jester' | 'fox' | 'ranger' | 'io'      weight: 'lightest' | 'light' | 'full'
// MOVES says which of a witch's own moves shows each move of the combat engine. Where the engine's move has no move of its own on the
// model yet, the nearest one stands in; those are marked "stand-in" and are Chris's to change.
(function () {
  'use strict';
  // anim: the model's move.  aim: 'left' she turns her casting side to the target; 'front' she faces it.
  // near: she goes to this many meters from her target first (her spell is built to land that far from her), and comes back after.
  // hits: seconds into the move when it lands (the Jester's and the Fox's models say this themselves).
  const MOVES = {
    j_plain: { anim: 'g_rebuke', aim: 'left' }, j_jab: { anim: 'taunt_attack', aim: 'left' }, j_heal: { anim: 'taunt_heal' }, j_seal: { anim: 'g_seal', aim: 'left' },
    r_plain: { anim: 'draw', aim: 'left', hits: [3.25] },                       // Moonsteel Draw: the arrow leaves at 2.99 s
    r_gem: { anim: 'shots', aim: 'left', hits: [5.5, 7.35] },                   // the gem, then two shots
    f_plain: { anim: 'hemline_fangs', aim: 'left', near: 2.3 },
    f_stitch: { anim: 'blue_mischief', aim: 'left' },                           // stand-in: Stitch has no move of its own yet
    f_needles: { anim: 'moons_little_lie' },                                    // stand-in: Pins and Needles has no move of its own yet
    f_cloth: { anim: 'same_cloth', aim: 'left', copies: true }, f_quilt: { anim: 'crazy_quilt' }, f_decoy: { anim: 'borrowed_face' }, f_flee: { anim: 'slip_stitch' },
    i_plain: { anim: 'crescent', aim: 'front', near: 1.4, hits: [2.38] }, i_thorn: { anim: 'thorn', aim: 'front', near: 1.4, hits: [2.62] },
    i_mend: { anim: 'salve', aim: 'front', near: 1.3, hits: [5.4] }, i_bloom: { anim: 'garden', hits: [7.5] },
    i_deity: { anim: 'herb', hits: [3.0] },                                     // stand-in: she plants her prayer; the Guardian comes on her next turn
    i_deity_arrives: { anim: 'guardian', aim: 'front', near: 1.8, hits: [13.02] },      // her model's own numbers: the foe stands 1.8 m in front of her and the stag strikes at 13.02 s (planting to 7 s, the stag arriving to 11.6 s, then its leap)
    i_revive: { anim: 'revive', aim: 'front', near: 1.3, hits: [6.4] },
  };
  const NAMES = { jester: 'Jester', fox: 'Fox', ranger: 'Ranger', io: 'Io' };
  const _p = new THREE.Vector3();

  function make(id, weight) {
    const m = window.MF_WITCHES[id].raw(weight || 'lightest'), jf = !!m.ACTIONS;      // jf: the Jester's kind of interface
    const A = { id, name: NAMES[id], m, root: m.root, fx: m.fx || null, weight: weight || 'lightest', face: 0, aim: null, phase: 0, isDown: false, flinch: 0, lean: 0, leanTo: 0, rest: 0, hitN: 0, cur: '', one: false, froze: false,
      light: m.spellLight || null, tris: m.triangles };
    if (A.light && A.light.parent) A.light.parent.remove(A.light);      // her spell light is read, not lit: the stage has one shared light that follows it, so no light is ever added while playing
    A.dur = (anim) => (jf ? m.ACTIONS[anim].dur : (m.shots[anim] || 2));
    A.hits = (mv) => (mv.hits ? mv.hits.slice() : (jf ? m.ACTIONS[mv.anim].hits.map((h) => h * m.ACTIONS[mv.anim].dur) : [0.6 * A.dur(mv.anim)]));
    A.has = (anim) => (jf ? !!m.ACTIONS[anim] : m.moves.indexOf(anim) >= 0);
    A.play = (anim) => { if (!A.has(anim)) return false; if (jf) { if (A.isDown) return false; m.play(anim, true); } else { m.play(anim); A.cur = anim; A.one = true; } A.froze = false; return true; };
    Object.defineProperty(A, 'busy', { get() { return jf ? !!(m.action || m.pending) : A.one; } });
    Object.defineProperty(A, 'time', { get() { return jf ? m.time : (id === 'io' ? m.moveT : m.move.t); } });
    Object.defineProperty(A, 'action', { get() { return jf ? m.action : (A.one ? A.cur : ''); } });
    for (const k of ['dark', 'dim', 'shake', 'spin']) Object.defineProperty(A, k, { get() { return m[k] || 0; } });
    // a point on her, in the world: 'head' or 'chest'
    A.anchor = (name, out) => { out = out || new THREE.Vector3(); if (jf) return m.anchor(name === 'head' ? 'head' : 'chest', out); const b = m.SK && (name === 'head' ? m.SK.head : m.SK.spine3); if (b) { b.getWorldPosition(out); if (name === 'head') out.y += 0.12; return out; } return out.set(A.root.position.x, name === 'head' ? 1.6 : 1.2, A.root.position.z); };
    // she takes a blow: big is more than a fifth of her HP at once
    A.hit = (big) => { if (A.isDown) return; A.flinch = 1; if (id === 'jester') m.play(A.hitN++ % 2 ? 'hit_dust' : 'hit_laugh', true); else if (id === 'ranger') A.play(big ? 'hard' : 'hit'); else if (id === 'io') A.play('hit'); };
    A.down = (on) => { if (on === A.isDown) return; A.isDown = on;
      if (jf) { if (on) { m.stop && m.stop(); m.setStance('kneel'); } else m.setStance(''); }
      else if (on) { m.play(id === 'ranger' ? 'fall' : 'down'); A.cur = 'down'; A.one = false; A.froze = false; } else { if (id === 'ranger') m.play('idle'); A.cur = id === 'ranger' ? 'idle' : 'down'; A.froze = false; } };
    A.win = () => { if (A.isDown) return; A.play(id === 'jester' ? 'bow' : id === 'fox' ? 'curtsey' : 'win'); };
    A.reset = () => { A.isDown = false; A.face = 0; A.rest = 0; A.aim = null; A.flinch = 0; A.lean = A.leanTo = 0; A.froze = false; if (jf) { m.reset(); m.setStance(''); if (m.game) { m.game.fates = []; m.game.others = []; m.game.friends = []; m.game.catches = 0; } if ('charge' in m) m.charge = 0; } else { m.play('idle'); A.cur = 'idle'; A.one = false; } };
    A.update = (dt, t, walking) => {
      if (walking) A.phase += dt * 2.2;
      if (jf) m.animate(A.phase, walking ? 1 : 0, t, dt, 0);
      else {
        if (A.one && (id === 'io' ? m.move !== A.cur : m.move.t >= (m.shots[A.cur] || 0))) { A.one = false; A.cur = ''; }      // a short move has run out
        if (!A.isDown && id === 'io' && A.cur === 'down' && m.move !== 'down') A.cur = '';                                     // Io has got up again
        if (!A.one && !A.isDown && A.cur !== 'down') { const want = walking ? 'jog' : 'idle'; if (A.cur !== want) { m.play(want); A.cur = want; } }
        if (A.isDown && id === 'io' && m.move === 'down' && m.moveT >= 4.2) A.froze = true;                                    // Io lies where she fell until she is helped up (her own move gets up by itself)
        m.animate(A.froze ? 0 : dt);
        if (id === 'io' && m.spellFx) { m.spellFx.dummy.visible = false; m.spellFx.ally.visible = false; m.spellFx.ally2.visible = false; const Fl = m.wood && m.wood.FALLEN; if (Fl && Fl.isObject3D) Fl.visible = false; else if (Fl && Fl.G) Fl.G.visible = false; }      // her practice targets: the fight has real ones
      }
      // she turns to her target while she casts at it, then back to how she rests; a blow rocks her back a little
      // rest: the way she stands between moves (the fight turns her to the foes)
      const to = A.aim != null ? A.aim : A.rest; let df = to - A.face; df = Math.atan2(Math.sin(df), Math.cos(df)); A.face += df * Math.min(1, dt * 8);
      A.flinch = Math.max(0, A.flinch - dt * 3.2); A.root.rotation.y = A.face + A.spin; A.lean += ((A.aim != null ? A.leanTo : 0) - A.lean) * Math.min(1, dt * 5); A.root.rotation.z = (id === 'fox' ? 0.09 : 0) * Math.sin(A.flinch * Math.PI) - A.lean;      // lean: the Ranger tips her bow arm down a little to a low target (her arrow leaves level)
    };
    A.reset();
    return A;
  }
  window.MF_ACTORS = { make, MOVES, NAMES };
})();
