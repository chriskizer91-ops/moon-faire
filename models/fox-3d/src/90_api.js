
  // ---------- per-frame update ----------
  const st = { init: false, px: 0, py: 0, pz: 0, time: 0 };
  let fade = 1, userWind = V3(0, 0, 0);
  // where the chest sits for a pose, from the hips up the spine (root space): a stance carries the hands of any move played over it
  const _tm = new THREE.Matrix4(), _tm2 = new THREE.Matrix4(), _te = new THREE.Euler(), _tq = Qt(), _tp = V3(), _ts1 = V3(1, 1, 1), torsoD = new THREE.Matrix4(), torsoQ = Qt();
  function torsoM(P, out) {
    const hh = SK.hips.userData.home;
    _tq.setFromEuler(_te.set(P.hipR[1], P.hipR[0], P.hipR[2], 'YXZ')); out.compose(_tp.set(hh.x + P.hip[0], hh.y + P.hip[1], hh.z + P.hip[2]), _tq, _ts1);
    for (let i = 0; i < 3; i++) { const b = SK['spine' + (i + 1)]; _tq.setFromEuler(_te.set(P.sp[1] * SPF[i], P.sp[0] * SPF[i], P.sp[2] * SPF[i], 'YXZ')); out.multiply(_tm2.compose(b.position, _tq, b.scale)); }
    return out;
  }
  const torso0inv = torsoM(REST, new THREE.Matrix4()).invert();
  const LEGS = { hip: 1, hipR: 1, ftR: 1, ftL: 1, knR: 1, knL: 1 }; let spinNow = 0;
  // ---------- life in her hands (13 Nov) ----------
  // Keys say where a hand should be. Left at that, a hand is carried like a board, every finger moves at the same instant, and a key can snap the
  // wrist round faster than a wrist turns. Here, each frame, between the pose and the skeleton:
  //   - each finger follows its key a little late, and no two by the same amount;
  //   - wrist turns and bends are eased;
  //   - the hand drags behind the way it is travelling and swings through a little when it stops (a spring), as a loose wrist does.
  // A held pose settles to exactly what its key says, so a fingertip set on her lips still lands on her lips. opts.handLife: 0 turns it off.
  const HAND_LIFE = opts.handLife === undefined ? 1 : +opts.handLife, F_TAU = [0.050, 0.038, 0.052, 0.066, 0.080, 0.055], W_TAU = 0.032, DRAG = 0.11, DRAG_MAX = [0.40, 0.24], D_W = 16, D_Z = 0.60;
  const ARML = {}, lifePose = clonePose(REST), _lq = Qt(), _lr = Qt(), _ld = V3();
  for (const [S] of SIDES) ARML[S] = { init: false, hp: V3(), v: V3(), o: [0, 0], ov: [0, 0], f: [0, 0, 0, 0, 0, 0], tw: 0, wr: [0, 0] };
  function armLife(P, dt) {
    if (!(HAND_LIFE > 0) || !(dt > 0)) return P;
    const out = lifePose; for (const k of CHANS) { const x = P[k]; if (typeof x === 'number') out[k] = x; else { const o = out[k]; for (let i = 0; i < x.length; i++) o[i] = x[i]; } }
    root.getWorldQuaternion(_lr).invert();
    for (const [S] of SIDES) {
      const a = ARML[S], h = P['h' + S], f = out['f' + S], w = out['wr' + S];
      if (!a.init) { a.hp.set(h[0], h[1], h[2]); a.v.set(0, 0, 0); a.o[0] = a.o[1] = a.ov[0] = a.ov[1] = 0; for (let k = 0; k < 6; k++) a.f[k] = f[k]; a.tw = P['tw' + S]; a.wr[0] = w[0]; a.wr[1] = w[1]; a.init = true; }
      for (let k = 0; k < 6; k++) { a.f[k] += (f[k] - a.f[k]) * (1 - Math.exp(-dt / F_TAU[k])); f[k] = lerp(f[k], a.f[k], HAND_LIFE); }
      const kw = 1 - Math.exp(-dt / W_TAU); a.tw += (P['tw' + S] - a.tw) * kw; a.wr[0] += (w[0] - a.wr[0]) * kw; a.wr[1] += (w[1] - a.wr[1]) * kw;
      // how fast the hand is travelling (in her own space, so walking her about the stage does not count), smoothed over a few frames
      _ld.set(h[0], h[1], h[2]).sub(a.hp).multiplyScalar(1 / dt); a.hp.set(h[0], h[1], h[2]); if (_ld.lengthSq() > 400) _ld.set(0, 0, 0); a.v.lerp(_ld, 1 - Math.exp(-dt / 0.035));
      // the two ways the wrist can give: bending (fingertips toward the palm side) and tilting (toward the thumb or little-finger side)
      const HA = handAxes[S]; SK['ftwC' + S].getWorldQuaternion(_lq).premultiply(_lr);
      for (let i = 0; i < 2; i++) {
        _ld.crossVectors(i ? HA.palm : HA.curl, HA.along).applyQuaternion(_lq);
        const want = cl(-DRAG * a.v.dot(_ld), -DRAG_MAX[i], DRAG_MAX[i]);
        a.ov[i] += (-D_W * D_W * (a.o[i] - want) - 2 * D_Z * D_W * a.ov[i]) * dt; a.o[i] += a.ov[i] * dt; a.o[i] = cl(a.o[i], -0.55, 0.55);
      }
      out['tw' + S] = lerp(P['tw' + S], a.tw, HAND_LIFE); w[0] = lerp(w[0], a.wr[0] + a.o[0], HAND_LIFE); w[1] = lerp(w[1], a.wr[1] + a.o[1], HAND_LIFE);
    }
    return out;
  }
  function animate(phase, wb, t, dt, rb) {
    dt = dt > 0 ? Math.min(dt, 0.05) : 0; st.time = t; wb = wb || 0; rb = rb || 0;
    // the stance clock: forward to settle into a stance, backward to stand up out of it
    if (stance) {
      if (stanceTo !== stance.name) { stance.t -= dt * (stance.def.rise || 1.15); if (stance.t <= 0) { if (stance.def.leave) stance.def.leave(); stance = stanceTo ? { name: stanceTo, def: STANCES[stanceTo], t: 0 } : null; } }
      else stance.t = Math.min(stance.def.dur, stance.t + dt);
    } else if (stanceTo) stance = { name: stanceTo, def: STANCES[stanceTo], t: 0 };
    const sk = stance ? sm(0, 0.3, stance.t) : 0;
    fillBase(t, phase || 0, wb * (1 - sk), dt, rb * (1 - sk));
    if (stance) {
      evalPose(stance.def.tracks, stance.t, stPose);
      for (const k of CHANS) { if (typeof REST[k] === 'number') base[k] += stPose[k] - REST[k]; else for (let i = 0; i < REST[k].length; i++) base[k][i] += stPose[k][i] - REST[k][i]; }
      if (stance.def.live) stance.def.live(base, t, stance.t / stance.def.dur);
      torsoM(stPose, torsoD).multiply(torso0inv); torsoQ.setFromRotationMatrix(torsoD);
    }
    if (pending && !stance && !stanceTo) { const n = pending; pending = ''; play(n, true); }
    let P = base; spinNow = 0;
    if (act) {
      const tPrev = act.t; act.t += dt;
      for (const h of act.def.hits || []) { const th = h * act.dur; if (tPrev < th && act.t >= th) { state.hitN = (state.hitN || 0) + 1; state.hitK = act.def.impact || 0.55; state.hitName = act.type; } }      // a blow lands: hosts watch state.hitN to shake the picture or knock a target
      if (act.t >= act.dur && !act.def.hold) { if (act.def.end) act.def.end(act); act = null; }
      else {
        if (act.def.spinT) spinNow = evalTrack(act.def.spinT, Math.min(act.t, act.dur));
        const tt = Math.min(act.t, act.dur), tr = act.def.tracks, w = sm(0, 0.18, tt) * (act.def.hold ? 1 : 1 - sm(act.dur - 0.22, act.dur, tt));
        for (const k of CHANS) {
          if (tr[k] && !(stance && LEGS[k])) {
            const v = evalTrack(tr[k], tt, actPose[k]); if (typeof v === 'number') actPose[k] = v;
            if (stance) {                             // over a stance: hands ride with the chest, lean and gaze add to the stance's own
              const a = actPose[k];
              if (k === 'hR' || k === 'hL') { _va.set(a[0], a[1], a[2]).applyMatrix4(torsoD); a[0] = _va.x; a[1] = _va.y; a[2] = _va.z; }
              else if (k === 'eR' || k === 'eL') { _va.set(a[0], a[1], a[2]).applyQuaternion(torsoQ); a[0] = _va.x; a[1] = _va.y; a[2] = _va.z; }
              else if (k === 'sp' || k === 'hd') for (let i = 0; i < 3; i++) a[i] += stPose[k][i];
            }
          } else if (typeof base[k] === 'number') actPose[k] = base[k]; else for (let i = 0; i < base[k].length; i++) actPose[k][i] = base[k][i];
        }
        blendPose(cur, base, actPose, w); if (actPose.eyes < base.eyes) cur.eyes = base.eyes;
        P = cur;
      }
    }
    poseDt = dt; applyPose(armLife(P, dt)); poseDt = 0;
    // a jump of the root (a teleport) lays the cloth and springs afresh instead of whipping them
    root.getWorldPosition(_va);
    if (!st.init || Math.hypot(_va.x - st.px, _va.y - st.py, _va.z - st.pz) > 1.0) { resetCloth(); for (const c of chains) c.reset(); st.init = true; }
    st.px = _va.x; st.py = _va.y; st.pz = _va.z;
    hipsInv.copy(SK.hips.matrixWorld).invert();
    for (const c of chains) c.update(dt);
    root.updateMatrixWorld(true);
    // walking in place still stirs the veils: an apparent wind from ahead
    _vb.set(0, 0, -1).applyQuaternion(_rq).multiplyScalar((2.6 * wb + 3.2 * rb) * (1 - sk) * (opts.treadmill === false ? 0 : 1)); WIND.copy(userWind).add(_vb);
    if (typeof bodyTick === 'function') bodyTick(t, dt);
    stepCloth(dt, t);
    if (typeof updateFx === 'function') updateFx(t, dt, P);
  }
  const ACTIONS = {};
  for (const n in ACTS) ACTIONS[n] = Object.freeze({ dur: ACTS[n].dur, hits: Object.freeze((ACTS[n].hits || []).slice()), cues: Object.freeze((ACTS[n].cues || []).slice()), hold: !!ACTS[n].hold });
  const STANCE_LIST = Object.freeze(Object.keys(STANCES));
  Object.freeze(ACTIONS);
  // named points in world space
  function anchor(name, out) {
    out = out || V3(); root.updateMatrixWorld(true);
    const at = (b, x, y, z) => { const B = SK[b], r = B.userData.rest; return out.set(x - r.x, y - r.y, z - r.z).applyMatrix4(B.matrixWorld); };
    switch (name) {
      case 'head': return at('head', 0, 1.50, 0.09);
      case 'crown': return at('head', 0, 1.70, 0);
      case 'handR': { const p = handPt(-1, 0.018, -0.06, 0.004); return at('handR', p.x, p.y, p.z); }
      case 'handL': { const p = handPt(1, 0.018, -0.06, 0.004); return at('handL', p.x, p.y, p.z); }
      case 'tipR': { const p = handPt(-1, 0, FINGERS[0][2] - FINGERS[0][3], 0.0315); return at('idx2R', p.x, p.y, p.z); }      // the tip of her first finger, whatever its length
      case 'tipL': { const p = handPt(1, 0, FINGERS[0][2] - FINGERS[0][3] - 0.001, 0.027); return at('idx2L', p.x, p.y, p.z); }
      case 'bladeA': return TOOL ? at('shears', TOOL.tip.x, TOOL.tip.y, TOOL.tip.z) : at('handR', 0, 0, 0);          // the points and middles of her two blades
      case 'bladeB': return TOOL ? at('shearB', TOOL.tip.x, TOOL.tip.y, TOOL.tip.z) : at('handL', 0, 0, 0);
      case 'bladeAm': return TOOL ? at('shears', TOOL.mid.x, TOOL.mid.y, TOOL.mid.z) : at('handR', 0, 0, 0);
      case 'bladeBm': return TOOL ? at('shearB', TOOL.mid.x, TOOL.mid.y, TOOL.mid.z) : at('handL', 0, 0, 0);
      case 'bells': return at('bell3', bellRest[3].x, bellRest[3].y - 0.035, bellRest[3].z);
      case 'feet': return out.set(0, 0, 0).applyMatrix4(root.matrixWorld);
      case 'pendant': { const tp = prof(TORSO, 1.306, true); return at('spine3', 0, 1.306, tp[3] + tp[1] + 0.012); }
      case 'chest': return at('spine3', 0, 1.22, 0.06);
      case 'hips': return at('hips', 0, 0.86, 0);
      case 'hit': if (typeof fxHit === 'function') return fxHit(out); return at('handL', restPts.wrL.x, restPts.wrL.y - 0.08, restPts.wrL.z);
      default: return at('spine3', 0, 1.22, 0.06);
    }
  }
  const state = {};
  function setFade(f) { const was = fade > 0.001; fade = cl(Number.isFinite(+f) ? +f : 1, 0, 1); const now = fade > 0.001; if (now !== was) { root.visible = now; fx.visible = now; } }
  return {
    root, fx, skeleton, bones, animate, play, ACTIONS, anchor, setFade, state, setStance, STANCES: STANCE_LIST,
    stop() { act = null; pending = ''; },
    reset() { act = null; pending = ''; stance = null; stanceTo = ''; for (const S in ARML) { ARML[S].init = false; armSt[S].hang = -1; armSt[S].has = false; } resetCloth(); for (const c of chains) c.reset(); },
    get stance() { return stanceTo; }, set targetDist(v) { tgtK = v > 0 ? cl(v / 2.6, 0.4, 2.6) : 1; }, get spin() { return spinNow; },      // spin: the host adds this to the root's turn (a twirl)
    get stanceNow() { return stance ? stance.name : ''; }, get stanceProgress() { return stance ? stance.t / stance.def.dur : 0; }, get pending() { return pending; },
    get fade() { return fade; }, get busy() { return !!act && !(act.def.hold && act.t >= act.dur); }, get action() { return act ? act.type : ''; },
    get progress() { return act ? Math.min(1, act.t / act.dur) : -1; }, get time() { return act ? act.t : -1; },
    get triangles() { return triCount; }, get dim() { return dimNow; }, set wind(v) { userWind.copy(v); }, get wind() { return userWind; },
    debug: { SK, cloths, cur, base, REST, FP, meshes, MATS, chains, applyPose, clonePose }
  };
}
