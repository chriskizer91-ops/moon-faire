  const _J = new THREE.Vector3();                  // the waist joint: hand targets shrink toward it with the upper body

  // ---------- applying a pose: spine by angles, arms and legs onto their targets, then springs and cloth ----------
  const SPF = [0.25, 0.35, 0.40], MOUTHS = ['rest', 'open', 'smile'];
  const _T = V3(), _A = V3(), _P = V3(), _pq = Qt(), _mq = Qt(), _rq = Qt(), _fq = Qt();
  const HANG_IN = opts.hangIn === undefined ? 1.0 : opts.hangIn, HANG_TW = opts.hangTw === undefined ? -0.85 : opts.hangTw, REST_WR = opts.restWr || [0.16, 0.0];
  // How her arms move (Chris, 13 Nov: "her arms and hands could use more work ... it's more of how they're moving"). Each can be turned off (0) to compare.
  //   SHOULDER   her collar bone goes with her arm: it lifts as the hand rises above the shoulder and comes forward as she reaches ahead or across.
  //   SOFT_FROM  past this share of the arm's full length the hand eases toward straight instead of locking: a locked arm snaps when it lets go.
  const SHOULDER = opts.shoulderFollow === undefined ? 1 : +opts.shoulderFollow, SOFT_FROM = opts.softReach === undefined ? 0.962 : +opts.softReach;
  // ---------- her shears in her hands (round 3) ----------
  // Each half is a rigid piece on its own bone, at rest in the sheath. Held, a half goes wherever a hand goes: its ring in her fist, its blade out of
  // the thumb side of the fist, leaning back toward her wrist the way a blade sits when the ring is held, flat to her palm. The front half (the bigger
  // ring) is her right hand's; split, the back half is her left hand's, and the two are her daggers. Pose channels: shr, shs, sho (see REST).
  const TOOL = (function () {
    if (!SK.shears || !SK.shearB || !FOXGEAR.shears) return null;
    const GS = FOXGEAR.shears, M4 = () => new THREE.Matrix4(), inv = (n) => skeleton.boneInverses[BI[n]], bind = (n) => M4().copy(inv(n)).invert(), g = (x, y, z) => V3(...GS.G(x, y, z));
    const o = g(0, 0, 0), bS = g(0, GS.tipY, 0).sub(o).normalize(), nS = g(0, 0, 1).sub(o); nS.addScaledVector(bS, -nS.dot(bS)).normalize();
    // a held half = the hand's own movement x where the ring sits in the fist (pre) x how the blade leans there (set each frame) x the half's own shape (post)
    const grip = (s, bow, hand, bone) => {
      const e3 = V3().crossVectors(bS, nS), h = g(bow[0], bow[1], 0), p = handPt(s, 0.020, -0.062, 0.006);
      return { s, pre: M4().copy(inv(hand)).multiply(M4().makeTranslation(p.x, p.y, p.z)), post: M4().makeBasis(bS, nS, e3).transpose().multiply(M4().makeTranslation(-h.x, -h.y, -h.z)).multiply(bind(bone)), t2: handDir(s, 1, 0, 0).normalize() };
    };
    return { A: grip(-1, GS.bowA, 'handR', 'shears'), B: grip(1, GS.bowB, 'handL', 'shearB'), axis: nS.clone(), a0: SK.shears.position.clone(), b0: SK.shearB.position.clone(), tip: g(0, GS.tipY, 0), mid: g(0, GS.tipY * 0.45, 0) };
  })();
  const _tmA = new THREE.Matrix4(), _tmB = new THREE.Matrix4(), _tmC = new THREE.Matrix4(), _tp1 = V3(), _tq1 = Qt(), _tsc = V3(), _t1 = V3(), _t3 = V3();
  // In her hands they are bigger than on her belt: in paintings H3 and H4 each dagger is about 45 cm, and the shears in the sheath (G1, G3) are 26.
  // "Her scissors become daggers" (lore): they grow as they leave the sheath and shrink as they go back. The ring stays in her fist as they do.
  const GROW = opts.shearsGrow === undefined ? 1.7 : +opts.shearsGrow, _tmS = new THREE.Matrix4(), _one = V3(1, 1, 1);
  const heldAt = (G, handBone, lean, k, out) => { handDir(G.s, 0, Math.sin(lean), Math.cos(lean), _t1).normalize(); _t3.crossVectors(_t1, G.t2); return out.multiplyMatrices(handBone.matrixWorld, G.pre).multiply(_tmC.makeBasis(_t1, G.t2, _t3)).multiply(_tmS.makeScale(k, k, k)).multiply(G.post); };
  function poseTools(P) {
    if (!TOOL) return;
    const A = SK.shears, B = SK.shearB, held = cl(P.shr || 0, 0, 1), split = cl(P.shs || 0, 0, 1), lean = P.shl === undefined ? 0.44 : P.shl, k = lerp(1, GROW, sm(0.25, 1, held));
    A.position.copy(TOOL.a0); A.quaternion.set(0, 0, 0, 1); A.scale.set(1, 1, 1);
    if (held > 0.001) { _tmA.copy(A.parent.matrixWorld).invert().multiply(heldAt(TOOL.A, SK.handR, lean, k, _tmB)); _tmA.decompose(_tp1, _tq1, _tsc); A.position.lerp(_tp1, held); A.quaternion.slerp(_tq1, held); A.scale.lerp(_tsc, held); }
    A.updateMatrixWorld(true);
    B.position.copy(TOOL.b0); B.quaternion.setFromAxisAngle(TOOL.axis, P.sho || 0); B.scale.set(1, 1, 1);
    if (split > 0.001) { _tmA.copy(A.matrixWorld).invert().multiply(heldAt(TOOL.B, SK.handL, lean, k, _tmB)); _tmA.decompose(_tp1, _tq1, _tsc); B.position.lerp(_tp1, split); B.quaternion.slerp(_tq1, split); B.scale.lerp(_tsc, split); }
    B.updateMatrixWorld(true);
  }
  // Two of the arm rules need to know how much time has passed, so they can change over time and not over distance. animate() sets poseDt for
  // its own call; a pose applied directly (the workbench, a still) has poseDt 0 and gets the plain, instant rule.
  //   - The elbow tuck and forearm turn of a hanging arm fade as the hand leaves her side. Tied to the hand's height alone, a quick hand crossed
  //     that fade in three frames and the forearm snapped round 49 degrees. Now the fade takes about a fifth of a second however fast the hand goes.
  //   - When the elbow's given direction lies almost along the arm, there is no telling which way the elbow should point and it could flip
  //     in one frame. Then the elbow keeps the direction it had.
  let poseDt = 0, poseQuiet = false;      // poseQuiet: a pose worked out for her ghost double; it must leave her own arm memory and her face alone
  const armSt = { R: { hang: -1, a: 0, perp: V3(), has: false }, L: { hang: -1, a: 0, perp: V3(), has: false } }, _AR = V3(), _dR = V3(), _pR = V3();
  function applyPose(P) {
    const hips = SK.hips, hh = hips.userData.home;
    hips.position.set(hh.x + P.hip[0], hh.y + P.hip[1], hh.z + P.hip[2]); hips.rotation.set(P.hipR[1], P.hipR[0], P.hipR[2], 'YXZ');
    for (let i = 0; i < 3; i++) SK['spine' + (i + 1)].rotation.set(P.sp[1] * SPF[i], P.sp[0] * SPF[i], P.sp[2] * SPF[i], 'YXZ');
    SK.neck.rotation.set(P.hd[1] * 0.35, P.hd[0] * 0.35, P.hd[2] * 0.35, 'YXZ'); SK.head.rotation.set(P.hd[1] * 0.65, P.hd[0] * 0.65, P.hd[2] * 0.65, 'YXZ');
    SK.clavR.rotation.set(0, 0, -P.sh[0]); SK.clavL.rotation.set(0, 0, P.sh[1]);
    root.updateMatrixWorld(true);
    root.getWorldQuaternion(_rq);
    for (const [S, s] of SIDES) {
      // arm
      SK['clav' + S].getWorldQuaternion(_pq); SK['uarm' + S].getWorldPosition(_A);
      const h = P['h' + S], e = P['e' + S];
      if (SHOULDER > 0) {                             // an arm hanging at her side leaves the shoulder exactly where it was, so her resting pose is unchanged
        _T.copy(_A); root.worldToLocal(_T); const dx = h[0] - _T.x, dy = h[1] - _T.y, dz = h[2] - _T.z, el = Math.atan2(dy, Math.hypot(dx, dz));
        const lift = 0.34 * sm(-0.25, 1.15, el) * SHOULDER, fwd = (0.20 * sm(0.14, 0.44, dz) + 0.14 * sm(0.02, 0.26, -s * h[0])) * SHOULDER, C = SK['clav' + S];
        C.rotation.set(0, -s * fwd, s * (P.sh[s < 0 ? 0 : 1] + lift)); C.updateMatrixWorld(true); C.getWorldQuaternion(_pq); SK['uarm' + S].getWorldPosition(_A);
      }
      // An arm hanging at her side carries its elbow in toward her waist and its forearm out and away, as in painting A1 (and as a real arm does).
      // The further a hand is lifted or swung from her side, the less of this there is, so every move keeps the elbow it was given.
      const hangT = HANG_IN * sm(1.02, 0.90, h[1]) * sm(0.34, 0.10, Math.abs(h[2] - 0.055)) * sm(0.50, 0.36, Math.abs(h[0])), AS = armSt[S]; let hang = hangT;
      if (poseDt > 0 && AS.hang >= 0) { const k = 1 - Math.exp(-poseDt / 0.075); AS.a += (hangT - AS.a) * k; AS.hang += (AS.a - AS.hang) * k; hang = AS.hang; } else if (!poseQuiet) AS.a = AS.hang = hangT;
      _T.set(h[0], h[1], h[2]).applyMatrix4(root.matrixWorld); SK.spine1.getWorldPosition(_J); _T.sub(_J).multiplyScalar(UPK).add(_J);
      _AR.copy(_A); root.worldToLocal(_AR); _dR.set(h[0] - _AR.x, h[1] - _AR.y, h[2] - _AR.z).normalize(); _pR.set(e[0] - s * hang, e[1], e[2]);
      { const pl = _pR.length() || 1; _pR.addScaledVector(_dR, -_pR.dot(_dR)); const m = _pR.length() / pl; if (m > 1e-4) _pR.multiplyScalar(1 / _pR.length()); else _pR.copy(AS.perp);
        if (poseDt > 0 && AS.has) { const w = sm(0.08, 0.38, m); if (w < 1) { _pR.lerp(AS.perp, 1 - w); _pR.addScaledVector(_dR, -_pR.dot(_dR)); if (_pR.lengthSq() > 1e-8) _pR.normalize(); else _pR.copy(AS.perp); } }
        if (!poseQuiet) { AS.perp.copy(_pR); AS.has = true; } }
      _P.copy(_pR).applyQuaternion(_rq);
      if (SOFT_FROM > 0) { const LA = LIMB['arm' + S], full = (LA.l1 + LA.l2) * 0.9985, da = (LA.l1 + LA.l2) * SOFT_FROM, z = full - da; _va.subVectors(_T, _A); const d = _va.length(); if (d > da && z > 0) _T.copy(_A).addScaledVector(_va, (da + z * (1 - Math.exp(-(d - da) / z))) / d); }
      solveLimb(SK['uarm' + S], SK['farm' + S], _A, _T, _P, LIMB['arm' + S], 0, _pq, _mq);
      { const tw = -s * (P['tw' + S] + hang * HANG_TW), ad = armDir[S]; SK['ftwA' + S].quaternion.setFromAxisAngle(ad, tw / 3); SK['ftwB' + S].quaternion.setFromAxisAngle(ad, tw * 2 / 3); SK['ftwC' + S].quaternion.setFromAxisAngle(ad, tw); }
      const HA = handAxes[S], w = P['wr' + S];
      _qa.setFromAxisAngle(HA.curl, w[0]); _qb.setFromAxisAngle(HA.palm, w[1]); SK['hand' + S].quaternion.copy(_qb).multiply(_qa);
      if (SK['wrm' + S]) SK['wrm' + S].quaternion.set(0, 0, 0, 1).slerp(SK['hand' + S].quaternion, 0.5);
      poseFingers(S, P['f' + S]);
      // leg
      hips.getWorldQuaternion(_pq); SK['thigh' + S].getWorldPosition(_A);
      const f = P['ft' + S], k = P['kn' + S], fr = SK['foot' + S].userData.rest;
      _T.set(fr.x + f[0], fr.y + f[1], fr.z + f[2]).applyMatrix4(root.matrixWorld); _P.set(k[0], k[1], k[2]).applyQuaternion(_rq);
      solveLimb(SK['thigh' + S], SK['shin' + S], _A, _T, _P, LIMB['leg' + S], 0, _pq, _mq);
      _fq.copy(_rq).multiply(_qa.setFromAxisAngle(Y_AX, f[3])).multiply(_qb.setFromAxisAngle(X_AX, f[4])); if (f[5]) _fq.multiply(_qa.setFromAxisAngle(Z_AX, f[5]));
      SK['foot' + S].quaternion.copy(_mq.invert()).multiply(_fq);
      // f[6]: how far the foot follows its shin instead of the ground (legs folded off the floor): then yaw, pitch and roll are the ankle's own
      const rel = f[6] || 0;
      if (rel > 0.001) { _qc.setFromAxisAngle(Y_AX, f[3]).multiply(_qa.setFromAxisAngle(X_AX, f[4])).multiply(_qb.setFromAxisAngle(Z_AX, f[5])); SK['foot' + S].quaternion.slerp(_qc, Math.min(1, rel)); }
      SK['toe' + S].quaternion.setFromAxisAngle(X_AX, -Math.max(0, f[4]) * 0.92 * (1 - Math.min(1, rel)));
    }
    if (SK.sheath) SK.sheath.quaternion.set(0, 0, 0, 1).slerp(SK.thighR.quaternion, 0.85);      // her sheath hangs from the belt but lies along her right thigh, and goes where it goes
    root.updateMatrixWorld(true);
    poseTools(P);
    if (!poseQuiet) paintFace(P.eyes, MOUTHS[Math.round(cl(P.mouth, 0, 2))], P.glow);
  }
  // ---------- base layer: the breathing stance and the walk ----------
  let blinkAt = 2.2, blinkT = -1;
  const walkPose = clonePose(REST), runPose = clonePose(REST);
  const RUN_PITCH = [[-0.125, 0.35], [0, -0.08], [0.125, -0.10], [0.25, 0.05], [0.375, 0.55], [0.5, 0.95], [0.67, 1.15], [0.875, 0.35], [1, -0.08], [1.125, -0.10]];
  function fillBase(t, ph, wb, dt, rb) {
    const br = Math.sin(t * 1.5), br2 = Math.sin(t * 1.5 - 0.9), sw = Math.sin(t * 0.47), sw2 = Math.sin(t * 0.31 + 1.3);
    const B = base, R = REST;
    B.hip[0] = 0.006 * sw; B.hip[1] = -0.004 + 0.003 * br; B.hip[2] = 0.004 * sw2;
    B.hipR[0] = 0.02 * sw2; B.hipR[1] = 0; B.hipR[2] = -0.012 * sw;
    B.sp[0] = -0.025 * sw2; B.sp[1] = 0.012 * br - 0.01; B.sp[2] = 0.016 * sw;
    B.hd[0] = 0.04 * Math.sin(t * 0.37 + 0.5); B.hd[1] = -0.015 + 0.012 * br2; B.hd[2] = -0.012 * sw;
    B.sh[0] = B.sh[1] = 0.025 * br + 0.01;
    for (const [S, s] of SIDES) {
      const h = B['h' + S], r = R['h' + S];
      h[0] = r[0] + s * 0.004 * br + 0.004 * sw; h[1] = r[1] + 0.006 * br2 - 0.002; h[2] = r[2] + 0.008 * sw2 * s + 0.004 * br;
      B['e' + S][0] = R['e' + S][0]; B['e' + S][1] = R['e' + S][1]; B['e' + S][2] = R['e' + S][2];
      B['tw' + S] = 0.05 * sw * s; B['wr' + S][0] = REST_WR[0] + 0.03 * br2; B['wr' + S][1] = REST_WR[1];
      for (let i = 0; i < 6; i++) B['f' + S][i] = R['f' + S][i] + 0.03 * Math.sin(t * 0.9 + i + s);
      for (let i = 0; i < 7; i++) B['ft' + S][i] = R['ft' + S][i];
      for (let i = 0; i < 3; i++) B['kn' + S][i] = R['kn' + S][i];
    }
    if (blinkT < 0 && t > blinkAt) { blinkT = 0; blinkAt = t + 2.4 + 3.2 * h1(Math.floor(t * 7.3)); }
    if (blinkT >= 0) { blinkT += dt; if (blinkT > 0.2) blinkT = -1; }
    B.eyes = blinkT >= 0 ? Math.sin(cl(blinkT / 0.2, 0, 1) * PI) : 0; B.mouth = 0; B.glow = 0;
    const lw = Math.max(wb, rb || 0), gait = cl(rb || 0, 0, 1);
    if (lw > 0.001) {
      const W = walkPose, c = Math.cos(ph), sn = Math.sin(ph), c2w = Math.cos(2 * ph), ST = 0.62, TOE = 0.78, yToe = Math.sin(TOE) * 0.085;
      // A walk, not a jog: one foot is always on the ground (each stays down for 62% of the stride), the heel lands first and the toe leaves last,
      // the swinging foot stays low, the hips are lowest when both feet are down, and the arms hang and swing from the shoulder.
      W.hip[0] = -0.020 * sn; W.hip[1] = -0.031 - 0.019 * c2w; W.hip[2] = 0.005;
      W.hipR[0] = 0.11 * c; W.hipR[1] = 0.02; W.hipR[2] = -0.030 * sn;
      W.sp[0] = -0.17 * c; W.sp[1] = 0.03; W.sp[2] = 0.035 * sn;
      W.hd[0] = 0.06 * c; W.hd[1] = -0.02; W.hd[2] = -0.01 * sn; W.sh[0] = W.sh[1] = 0;
      for (const [S, s] of SIDES) {
        const p = ph + (s < 0 ? 0 : PI), q = ((p / TAU) % 1 + 1) % 1, f = W['ft' + S], swing = -Math.cos(p); let z, y, pitch;      // the arm swings against its own leg
        if (q < ST) { const u = q / ST; z = lerp(0.24, -0.27, u); pitch = u < 0.16 ? lerp(-0.30, 0, u / 0.16) : TOE * Math.pow(sm(0.58, 1, u), 1.2); y = pitch < 0 ? -pitch * 0.04 : Math.sin(pitch) * 0.085; }
        else { const u = (q - ST) / (1 - ST); z = lerp(-0.27, 0.24, u * u * (3 - 2 * u)); pitch = TOE - (TOE + 0.30) * Math.pow(u, 0.8); y = yToe * (1 - u) * (1 - u) + 0.050 * Math.pow(Math.sin(PI * u), 0.8) + 0.012 * u; }
        f[0] = -s * 0.015; f[1] = y; f[2] = z; f[3] = s * 0.07; f[4] = pitch; f[5] = 0; f[6] = 0;
        W['kn' + S][0] = s * 0.05; W['kn' + S][1] = 0; W['kn' + S][2] = 1;
        const h = W['h' + S]; h[0] = s * (0.262 - 0.012 * swing); h[1] = 0.872 + 0.018 * swing + 0.016 * swing * swing; h[2] = 0.035 + 0.185 * swing;
        const e = W['e' + S]; e[0] = s * 0.4; e[1] = -0.2; e[2] = -1;
        W['tw' + S] = 0.10; W['wr' + S][0] = 0.10; W['wr' + S][1] = 0;
        for (let i = 0; i < 6; i++) W['f' + S][i] = lerp(FP.relax[i], FP.fist[i], 0.10);
      }
      W.eyes = B.eyes; W.mouth = 0; W.glow = 0;
      if (gait > 0.001) {                             // the run: a longer stride, both feet off the ground twice a stride, elbows bent and pumping
        const Rn = runPose, c2 = Math.cos(2 * ph), fl = 0.055 * Math.max(0, c2);
        Rn.hip[0] = -0.010 * sn; Rn.hip[1] = -0.045 + 0.040 * c2; Rn.hip[2] = 0.02;
        Rn.hipR[0] = 0.14 * c; Rn.hipR[1] = 0.05; Rn.hipR[2] = -0.05 * sn;
        Rn.sp[0] = -0.34 * c; Rn.sp[1] = 0.17; Rn.sp[2] = 0.04 * sn;
        Rn.hd[0] = 0.17 * c; Rn.hd[1] = -0.12; Rn.hd[2] = 0; Rn.sh[0] = Rn.sh[1] = 0.05;
        for (const [S, s] of SIDES) {
          const p = ph + (s < 0 ? 0 : PI), q = ((p / TAU) % 1 + 1) % 1, cz = Math.cos(p), swing = -cz;
          const u = ((q - 0.375 + 1) % 1) / 0.75, hs = u < 1 ? 0.26 * Math.pow(Math.sin(PI * Math.pow(u, 0.75)), 0.9) : 0, pitch = spline(RUN_PITCH, q);
          const f = Rn['ft' + S]; f[0] = -s * 0.012; f[1] = fl + hs + Math.max(0, Math.sin(pitch)) * 0.085; f[2] = 0.27 * cz - 0.03; f[3] = s * 0.03; f[4] = pitch; f[5] = 0;
          Rn['kn' + S][0] = s * 0.05; Rn['kn' + S][1] = 0; Rn['kn' + S][2] = 1;
          const h = Rn['h' + S]; h[0] = s * (0.205 - 0.055 * swing); h[1] = 1.05 + 0.10 * swing + 0.012 * c2; h[2] = 0.05 + 0.25 * swing;
          const e = Rn['e' + S]; e[0] = s * 0.45; e[1] = -0.35; e[2] = -1;
          Rn['tw' + S] = 0.5; Rn['wr' + S][0] = 0.05; Rn['wr' + S][1] = 0;
          for (let i = 0; i < 6; i++) Rn['f' + S][i] = lerp(FP.relax[i], FP.fist[i], 0.5);
        }
        Rn.eyes = B.eyes; Rn.mouth = 0; Rn.glow = 0;
        blendPose(W, W, Rn, sm(0, 1, gait));
      }
      blendPose(B, B, W, sm(0, 1, lw));
    }
  }
