
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
      act.t += dt;
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
    applyPose(P);
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
      case 'tipR': { const p = handPt(-1, 0, -0.164, 0.0315); return at('idx2R', p.x, p.y, p.z); }
      case 'tipL': { const p = handPt(1, 0, -0.165, 0.027); return at('idx2L', p.x, p.y, p.z); }
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
    reset() { act = null; pending = ''; stance = null; stanceTo = ''; resetCloth(); for (const c of chains) c.reset(); },
    get stance() { return stanceTo; }, get spin() { return spinNow; },      // spin: the host adds this to the root's turn (a twirl)
    get stanceNow() { return stance ? stance.name : ''; }, get stanceProgress() { return stance ? stance.t / stance.def.dur : 0; }, get pending() { return pending; },
    get fade() { return fade; }, get busy() { return !!act && !(act.def.hold && act.t >= act.dur); }, get action() { return act ? act.type : ''; },
    get progress() { return act ? Math.min(1, act.t / act.dur) : -1; }, get time() { return act ? act.t : -1; },
    get triangles() { return triCount; }, get dim() { return dimNow; }, set wind(v) { userWind.copy(v); }, get wind() { return userWind; },
    debug: { SK, cloths, cur, base, REST, FP, meshes, MATS, chains, applyPose, clonePose }
  };
}
