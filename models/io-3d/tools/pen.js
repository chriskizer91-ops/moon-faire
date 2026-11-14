// Pass-through meter (stage nine). Loaded into test_io.html by tools/pen.py.
// PEN.measure() looks at her as she stands in the page right now and counts cloth points that are inside her limbs:
//   legs    points of her skirt and cloak inside her thighs, shins and boots
//   arms    points of her cloak's sleeves inside her arms and hands
//   book    points of her hands inside her open book
// It returns counts and the deepest point of each, in millimetres.
window.PEN = (function () {
  const V = THREE.Vector3, v = new V(), a = new V(), b = new V(), c = new V(), d = new V(), inv = new THREE.Matrix4();
  const j = () => T.j, SK = () => T.j.debug.SK, M = () => T.j.debug.meshes;
  const wp = (bone, out) => out.setFromMatrixPosition(SK()[bone].matrixWorld);
  // depth of point p inside a capsule from a (radius ra) to b (radius rb); <= 0 outside
  function capDepth(p, a, b, ra, rb) { d.subVectors(b, a); const L2 = d.lengthSq(); let t = L2 > 0 ? c.subVectors(p, a).dot(d) / L2 : 0; t = Math.max(0, Math.min(1, t)); c.copy(a).addScaledVector(d, t); return (ra + (rb - ra) * t) - c.distanceTo(p); }
  // the same push the cloth's drawing does (legPush in I99_static.js), so the meter sees what is drawn
  const r0 = new V(), e = new V(), ab = new V(), rv = new V(), p0 = new V();
  function legPush(p, m, i, pad) { const D = T.j.debug, C = D.LEGCAP; if (!C || pad == null) return; p0.fromBufferAttribute(m.geometry.attributes.position, i);
    const cm = m.geometry.attributes.capMode, slv = cm && cm.array[i] > 0.5, radv = new V();
    e.set(p.x - D.HIP.x, 0, p.z - D.HIP.z); const rl = e.length(); if (rl < 1e-4) return; e.multiplyScalar(1 / rl); let sOut = 0, sUp = 0;
    let sLev = 0; for (const cp of C) { ab.subVectors(cp.B, cp.A); const lev = Math.abs(ab.y) <= 0.6 * ab.length() ? 1 : 0; ab.subVectors(cp.B0, cp.A0); const t0 = Math.max(0, Math.min(1, r0.subVectors(p0, cp.A0).dot(ab) / ab.lengthSq())), d0 = r0.copy(cp.A0).addScaledVector(ab, t0).distanceTo(p0);
      if (slv) { ab.subVectors(cp.B, cp.A); const tc = Math.max(0, Math.min(1, rv.subVectors(p, cp.A).dot(ab) / ab.lengthSq())); rv.copy(cp.A).addScaledVector(ab, tc); rv.subVectors(p, rv); const dd = rv.length(), RR = Math.min(cp.r0 + (cp.r1 - cp.r0) * tc + pad, d0 - 0.002); if (dd < RR) radv.addScaledVector(rv, (RR - dd) / Math.max(dd, 1e-5)); }
      for (let k = 0; k < 6; k++) { const tk = k / 5, RR = Math.min(cp.r0 + (cp.r1 - cp.r0) * tk + pad, d0 - 0.002); if (RR <= 0) continue; rv.copy(cp.A).lerp(cp.B, tk); rv.subVectors(p, rv); const cc = rv.lengthSq() - RR * RR, b1 = rv.dot(e), q1 = b1 * b1 - cc; if (q1 > 0) sOut = Math.max(sOut, Math.sqrt(q1) - b1); const q2 = rv.y * rv.y - cc; if (q2 > 0) { sUp = Math.max(sUp, Math.sqrt(q2) - rv.y); sLev = Math.max(sLev, lev * (Math.sqrt(q2) - rv.y)); } } }
    if (slv) { if (sLev > 0 && sLev < 0.30) p.y += sLev; else p.add(radv); } else if (sOut > 0 && sUp > 0) { if (sUp < sOut) p.y += sUp; else p.addScaledVector(e, sOut); } }
  function eachVert(keys, fn) { const mm = M(), PAD = T.j.debug.LEGPAD || {}, rinv = new THREE.Matrix4().copy(T.j.root.matrixWorld).invert(); for (const k of keys) { const m = mm[k]; if (!m || !m.visible) continue; const n = m.geometry.attributes.position.count; for (let i = 0; i < n; i++) { m.boneTransform(i, v); legPush(v, m, i, PAD[k]); v.applyMatrix4(m.matrixWorld); fn(v, k, i, m); } } }
  function limbs() {
    const L = { leg: [], arm: [] }, s = SK();
    for (const S of ['R', 'L']) {
      const hip = wp('thigh' + S, new V()), kn = wp('shin' + S, new V()), an = wp('foot' + S, new V()), toe = new V(0, -0.045, 0.10).applyMatrix4(s['foot' + S].matrixWorld);
      L.leg.push([hip, kn, 0.078, 0.056, 'thigh' + S], [kn, an, 0.054, 0.040, 'shin' + S], [an, toe, 0.040, 0.036, 'foot' + S]);
      const sh = wp('uarm' + S, new V()), el = wp('farm' + S, new V()), wr = wp('hand' + S, new V()), kn2 = wp('mid0' + S, new V());
      L.arm.push([sh, el, 0.040, 0.034, 'uarm' + S], [el, wr, 0.033, 0.024, 'farm' + S], [wr, kn2, 0.024, 0.026, 'hand' + S]);
    }
    return L;
  }
  function measure(o) {
    o = o || {}; T.j.root.updateMatrixWorld(true); const L = limbs(), out = { leg: { n: 0, mm: 0, by: {} }, arm: { n: 0, mm: 0, by: {} }, book: { n: 0, mm: 0 } }, mm = M();
    const sleeveBone = {}; T.j.skeleton.bones.forEach((bn, i) => { if (/^(sl[RL]\d_|svt)/.test(bn.name)) sleeveBone[i] = 1; });
    eachVert(['skirt', 'band', 'tulle', 'robe', 'moss'], (p, k, i, m) => {
      let best = 0, who = '';
      for (const cp of L.leg) { const dp = capDepth(p, cp[0], cp[1], cp[2], cp[3]); if (dp > best) { best = dp; who = cp[4]; } }
      if (best > 0.002) { out.leg.n++; out.leg.mm = Math.max(out.leg.mm, best * 1000); const key = k + '>' + who.replace(/[RL]$/, ''); out.leg.by[key] = (out.leg.by[key] || 0) + 1; }
      if (k === 'robe' || k === 'moss') { if (!m.userData.slv) { const si = m.geometry.attributes.skinIndex.array, sw = m.geometry.attributes.skinWeight.array, nn = si.length / 4, mk = new Uint8Array(nn); for (let e = 0; e < nn; e++) for (let q = 0; q < 4; q++) if (sw[e * 4 + q] > 0.2 && /^(sl[RL]\d_|svt)/.test(T.j.skeleton.bones[si[e * 4 + q]].name)) mk[e] = 1; m.userData.slv = mk; }
        const sl = m.userData.slv[i];
        if (sl) { let b2 = 0, w2 = ''; for (const cp of L.arm) { const dp = capDepth(p, cp[0], cp[1], cp[2], cp[3]); if (dp > b2) { b2 = dp; w2 = cp[4]; } }
          if (b2 > 0.002) { out.arm.n++; out.arm.mm = Math.max(out.arm.mm, b2 * 1000); const key = w2.replace(/[RL]$/, ''); out.arm.by[key] = (out.arm.by[key] || 0) + 1; } } }
    });
    if (mm.bookOpen && mm.bookOpen.visible && window.PEN.bookBox) {       // hands in the book: bookBox(p in the book's own space) -> depth inside, or <= 0
      inv.copy(SK().book.matrixWorld).invert();
      out.book.by = {}; eachVert(['hand', 'handR', 'nail'], (p, k) => { a.copy(p).applyMatrix4(inv); const dp = window.PEN.bookBox(a); if (dp > 0.0015) { out.book.n++; out.book.mm = Math.max(out.book.mm, dp * 1000); out.book.by[k] = (out.book.by[k] || 0) + 1; } });
    }
    for (const k of ['leg', 'arm', 'book']) out[k].mm = Math.round(out[k].mm);
    return out;
  }
  return { measure, capDepth, limbs };
})();
