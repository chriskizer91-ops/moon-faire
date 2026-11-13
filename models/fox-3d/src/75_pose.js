  const _J = new THREE.Vector3();                  // the waist joint: hand targets shrink toward it with the upper body

  // ---------- applying a pose: spine by angles, arms and legs onto their targets, then springs and cloth ----------
  const SPF = [0.25, 0.35, 0.40], MOUTHS = ['rest', 'open', 'smile'];
  const _T = V3(), _A = V3(), _P = V3(), _pq = Qt(), _mq = Qt(), _rq = Qt(), _fq = Qt();
  const HANG_IN = opts.hangIn === undefined ? 1.0 : opts.hangIn, HANG_TW = opts.hangTw === undefined ? -0.85 : opts.hangTw, REST_WR = opts.restWr || [0.16, 0.0];
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
      // An arm hanging at her side carries its elbow in toward her waist and its forearm out and away, as in painting A1 (and as a real arm does).
      // The further a hand is lifted or swung from her side, the less of this there is, so every move keeps the elbow it was given.
      const hang = HANG_IN * sm(1.02, 0.90, h[1]) * sm(0.34, 0.10, Math.abs(h[2] - 0.055)) * sm(0.50, 0.36, Math.abs(h[0]));
      _T.set(h[0], h[1], h[2]).applyMatrix4(root.matrixWorld); SK.spine1.getWorldPosition(_J); _T.sub(_J).multiplyScalar(UPK).add(_J); _P.set(e[0] - s * hang, e[1], e[2]).applyQuaternion(_rq);
      solveLimb(SK['uarm' + S], SK['farm' + S], _A, _T, _P, LIMB['arm' + S], 0, _pq, _mq);
      { const tw = -s * (P['tw' + S] + hang * HANG_TW), ad = armDir[S]; SK['ftwA' + S].quaternion.setFromAxisAngle(ad, tw / 3); SK['ftwB' + S].quaternion.setFromAxisAngle(ad, tw * 2 / 3); SK['ftwC' + S].quaternion.setFromAxisAngle(ad, tw); }
      const HA = handAxes[S], w = P['wr' + S];
      _qa.setFromAxisAngle(HA.curl, w[0]); _qb.setFromAxisAngle(HA.palm, w[1]); SK['hand' + S].quaternion.copy(_qb).multiply(_qa);
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
    paintFace(P.eyes, MOUTHS[Math.round(cl(P.mouth, 0, 2))], P.glow);
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
