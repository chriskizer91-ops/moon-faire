(() => {
  // Is his arm inside his sleeve? For points of the doll's arm from 0.08 to 0.30 m down it (above that the sleeve runs into the body of the shirt by design),
  // six rays are sent out square to the arm; a ray that crosses the sleeve's cloth an odd number of times started inside the tube.
  // A point counts as OUTSIDE when four or more of its six rays say so (one or two can leave by the open end at the band when the elbow is folded).
  const M = T.j.meshes.dollArms, g = M.geometry, P = g.attributes.position, A = g.attributes.dollArm, L = g.attributes.dollLeg, v = new THREE.Vector3(), C = T.j.debug.cloth, res = {};
  const bp = (n) => new THREE.Vector3().setFromMatrixPosition(T.j.SK[n].matrixWorld).applyMatrix4(new THREE.Matrix4().copy(T.j.root.matrixWorld).invert());
  // OFF: a check on the test itself. Each point is first moved OFF metres straight out from the arm's middle line. At 0.08 every point must be
  // reported outside, at 0.02 some (the top of the sleeve lies 9 mm off the arm). shirt_walk.py fills in OFF and ONLY_REST.
  const OFF = __OFF__, ONLY_REST = __ONLY_REST__, STRIDE = __STRIDE__;      // STRIDE 1: every point of the arm; 3: every third (for the checks on the test)
  let moments = [['rest', () => { T.j.pose('A'); }], ['walk a', () => { T.j.play('walk'); T.step(64, 1/30); }], ['walk b', () => { T.step(8, 1/30); }], ['walk c', () => { T.step(8, 1/30); }], ['idle', () => { T.j.play('idle'); T.step(45, 1/30); }], ['talk a', () => { T.j.play('talk'); T.step(45, 1/30); }], ['talk b', () => { T.step(20, 1/30); }], ['talk c', () => { T.step(20, 1/30); }]];
  if (ONLY_REST) moments = moments.slice(0, 1);
  for (const [name, go] of moments) {
    go(); T.j.root.updateMatrixWorld(true);
    const row = {};
    for (const S of ['R', 'L']) {
      const c = C.sheets.find((s) => s.name === 'sleeve' + S), fp = c.fpos, ix = c.geo.index.array, nt = ix.length / 3;
      const a0 = bp('uarm' + S), a1 = bp('farm' + S), a2 = bp('hand' + S);
      const frame = (p, q) => { const ax = q.clone().sub(p).normalize(), u = new THREE.Vector3(0, 0, 1).cross(ax).normalize(), w = ax.clone().cross(u); return [u, w]; };
      const FU = frame(a0, a1), FF = frame(a1, a2);
      let out = 0, tested = 0, lo = 9, hi = 0; const bands = [0, 0, 0, 0, 0];
      for (let i = 0; i < P.count; i += STRIDE) {
        if (L.getZ(i) > 0.5) continue; const sl = A.getZ(i); if (sl < 0.08 || sl > 0.30) continue; if ((P.getX(i) < 0) !== (S === 'R')) continue;
        M.boneTransform(i, v); tested++;
        const F = sl > 0.285 ? FF : FU; let even = 0;
        if (OFF) { const p0 = sl > 0.285 ? a1 : a0, p1 = sl > 0.285 ? a2 : a1, ax = p1.clone().sub(p0).normalize(), rel = v.clone().sub(p0), rad = rel.sub(ax.clone().multiplyScalar(rel.dot(ax))).normalize(); v.addScaledVector(rad, OFF); }
        for (let r = 0; r < 6; r++) {
          const an = r * Math.PI / 3 + 0.2, dx = F[0].x * Math.cos(an) + F[1].x * Math.sin(an), dy = F[0].y * Math.cos(an) + F[1].y * Math.sin(an), dz = F[0].z * Math.cos(an) + F[1].z * Math.sin(an);
          let hits = 0;
          for (let t = 0; t < nt; t++) {
            const i0 = ix[t*3]*3, i1 = ix[t*3+1]*3, i2 = ix[t*3+2]*3;
            const e1x = fp[i1]-fp[i0], e1y = fp[i1+1]-fp[i0+1], e1z = fp[i1+2]-fp[i0+2], e2x = fp[i2]-fp[i0], e2y = fp[i2+1]-fp[i0+1], e2z = fp[i2+2]-fp[i0+2];
            const px = dy*e2z - dz*e2y, py = dz*e2x - dx*e2z, pz = dx*e2y - dy*e2x, det = e1x*px + e1y*py + e1z*pz; if (det > -1e-12 && det < 1e-12) continue;
            const inv = 1/det, tx = v.x-fp[i0], ty = v.y-fp[i0+1], tz = v.z-fp[i0+2], uu = (tx*px + ty*py + tz*pz)*inv; if (uu < 0 || uu > 1) continue;
            const qx = ty*e1z - tz*e1y, qy = tz*e1x - tx*e1z, qz = tx*e1y - ty*e1x, vv = (dx*qx + dy*qy + dz*qz)*inv; if (vv < 0 || uu + vv > 1) continue;
            if ((e2x*qx + e2y*qy + e2z*qz)*inv > 1e-6) hits++;
          }
          if (hits % 2 === 0) even++;
        }
        if (even >= 4) { out++; lo = Math.min(lo, sl); hi = Math.max(hi, sl); bands[Math.min(4, Math.floor((sl - 0.08) / 0.044))]++; }
      }
      row[S] = tested + ' tested, ' + out + ' outside' + (out ? ' (from ' + lo.toFixed(3) + ' to ' + hi.toFixed(3) + ' down the arm; by fifths of the stretch: ' + bands.join(' ') + ')' : '');
    }
    res[name] = row;
  }
  return JSON.stringify(res);
})()
