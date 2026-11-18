
  // ---------- spell effects, in world space (the scene adds fx): sparks, glows, sigils, rings, the well, the flail ----------
  const COL = { violet: [0.58, 0.24, 1.0], magenta: [1.0, 0.30, 0.80], pale: [0.86, 0.72, 1.0], gold: [1.0, 0.74, 0.30], white: [1, 1, 1] };
  const glowOnly = (m, pre) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = pre ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; return m; };
  const NPART = 900, pPos = new Float32Array(NPART * 3), pCol = new Float32Array(NPART * 3), pSize = new Float32Array(NPART), pAlpha = new Float32Array(NPART);
  const pVel = new Float32Array(NPART * 3), pLife = new Float32Array(NPART), pMax = new Float32Array(NPART), pGrav = new Float32Array(NPART), pDrag = new Float32Array(NPART), pS0 = new Float32Array(NPART), pTw = new Float32Array(NPART), pKind = new Float32Array(NPART);
  let pNext = 0;
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3)); pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1)); pGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pAlpha, 1)); pGeo.setAttribute('aKind', new THREE.BufferAttribute(pKind, 1));
  const pMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uVH: { value: 800 } },
    vertexShader: 'attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aKind; uniform float uVH; varying vec3 vC; varying float vA; varying float vK;\nvoid main(){ vC = aColor; vA = aAlpha; vK = aKind; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(1.5, aSize * 1.6 * projectionMatrix[1][1] * uVH * 0.5 / max(0.05, -mv.z)); }',
    fragmentShader: 'varying vec3 vC; varying float vA; varying float vK;\nvoid main(){ vec2 p = gl_PointCoord * 2.0 - 1.0; float a = 1.0 - (sqrt(abs(p.x)) + sqrt(abs(p.y))); float star = pow(max(a, 0.0), 1.3) * 1.9 + exp(-dot(p, p) * 6.0) * 0.5; float mote = exp(-dot(p, p) * 3.2) * 0.9; gl_FragColor = vec4(vC * mix(star, mote, vK) * vA, 1.0); }' });
  glowOnly(pMat, true); const pPoints = new THREE.Points(pGeo, pMat); pPoints.frustumCulled = false; pPoints.renderOrder = 30;
  const _dbs = new THREE.Vector2();
  pPoints.onBeforeRender = (r) => { r.getDrawingBufferSize(_dbs); pMat.uniforms.uVH.value = _dbs.y; };
  fx.add(pPoints);
  function emit(x, y, z, vx, vy, vz, life, size, col, grav, drag) {
    const i = pNext; pNext = (pNext + 1) % NPART;
    pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z; pVel[i * 3] = vx; pVel[i * 3 + 1] = vy; pVel[i * 3 + 2] = vz;
    pLife[i] = pMax[i] = life; pS0[i] = size; pCol[i * 3] = col[0]; pCol[i * 3 + 1] = col[1]; pCol[i * 3 + 2] = col[2]; pGrav[i] = grav || 0; pDrag[i] = drag == null ? 1.2 : drag; pTw[i] = Math.random() * 20; pKind[i] = kindNext;
  }
  let kindNext = 0;
  const rs = () => Math.random() * 2 - 1;
  function burst(p, n, speed, life, size, col, grav, drag, up) {
    for (let i = 0; i < n; i++) { const d = _va.set(rs(), rs() + (up || 0), rs()).normalize(), sp = speed * (0.35 + 0.65 * Math.random()); emit(p.x, p.y, p.z, d.x * sp, d.y * sp, d.z * sp, life * (0.5 + 0.5 * Math.random()), size * (0.5 + Math.random()), col, grav, drag); }
  }
  function mist(p, n, rad, life, size, col, vy) {
    for (let i = 0; i < n; i++) emit(p.x + rs() * rad, p.y + rs() * rad, p.z + rs() * rad, rs() * 0.06, (vy || 0) + rs() * 0.05, rs() * 0.06, life * (0.6 + 0.4 * Math.random()), size * (0.5 + Math.random()), col, 0, 0.6);
  }
  function stepParticles(dt, t) {
    for (let i = 0; i < NPART; i++) {
      if (pLife[i] <= 0) { if (pAlpha[i] !== 0) { pAlpha[i] = 0; pSize[i] = 0; } continue; }
      pLife[i] -= dt; const a = i * 3, k = Math.max(0, 1 - pDrag[i] * dt);
      pVel[a] *= k; pVel[a + 1] = pVel[a + 1] * k - pGrav[i] * dt; pVel[a + 2] *= k;
      pPos[a] += pVel[a] * dt; pPos[a + 1] += pVel[a + 1] * dt; pPos[a + 2] += pVel[a + 2] * dt;
      const u = cl(pLife[i] / pMax[i], 0, 1), env = Math.min(1, (1 - u) * 8) * Math.pow(u, 0.6);
      pAlpha[i] = env * (0.65 + 0.35 * Math.sin(t * 17 + pTw[i])); pSize[i] = pS0[i] * (0.6 + 0.4 * u);
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.aSize.needsUpdate = true; pGeo.attributes.aAlpha.needsUpdate = true; pGeo.attributes.aColor.needsUpdate = true; pGeo.attributes.aKind.needsUpdate = true;
  }
  // glow and sigil sprites
  const glowTex = (function () { const c = cvs(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return ctex(c, 0, 0, false); })();
  const sigilTex = (function () {
    const S = 512, c = cvs(S, S), g = c.getContext('2d'), m = S / 2; g.translate(m, m); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineCap = 'round';
    g.shadowColor = '#fff'; g.shadowBlur = 14;
    g.lineWidth = 9; g.beginPath(); g.arc(0, 0, m * 0.86, 0, TAU); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.arc(0, 0, m * 0.74, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, m * 0.30, 0, TAU); g.stroke();
    g.lineWidth = 6; for (let k = 0; k < 4; k++) { g.rotate(TAU / 4); g.beginPath(); g.moveTo(0, m * 0.12); g.lineTo(0, m * 0.74); g.stroke(); }
    g.lineWidth = 3; g.rotate(TAU / 8); for (let k = 0; k < 4; k++) { g.rotate(TAU / 4); g.beginPath(); g.moveTo(0, m * 0.34); g.lineTo(0, m * 0.58); g.stroke(); g.beginPath(); g.arc(0, m * 0.64, m * 0.03, 0, TAU); g.fill(); }
    for (let k = 0; k < 12; k++) { g.rotate(TAU / 12); g.beginPath(); g.arc(0, m * 0.80, m * 0.018, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(0, 0, m * 0.07, 0, TAU); g.fill();
    return ctex(c, 0, 0, false);
  })();
  const colOf = (a, k) => new THREE.Color(a[0] * (k || 1), a[1] * (k || 1), a[2] * (k || 1));
  function sprite(tex, col, order) { const m = glowOnly(new THREE.SpriteMaterial({ map: tex, color: colOf(col), depthWrite: false, transparent: true, opacity: 0 })); const s = new THREE.Sprite(m); s.visible = false; s.renderOrder = order || 28; fx.add(s); return s; }
  function show(s, p, size, op, rot) { if (op <= 0.003) { s.visible = false; return; } s.visible = true; s.position.copy(p); s.scale.set(size, size, 1); s.material.opacity = Math.min(1, op * 0.62); if (rot != null) s.material.rotation = rot; }
  const gHandR = sprite(glowTex, COL.violet), gHandL = sprite(glowTex, COL.violet), gMain = sprite(glowTex, [0.8, 0.2, 0.7]), gCore = sprite(glowTex, COL.pale), gAux = sprite(glowTex, [0.45, 0.16, 0.85]);
  const sigil = sprite(sigilTex, [0.95, 0.45, 1.0], 29), sigil2 = sprite(sigilTex, [0.95, 0.45, 1.0], 29), gGold = sprite(glowTex, COL.gold), ringGold = sprite(sigilTex, COL.gold, 29);
  // rings: the Curtain Call sweep (flat round her waist) and the Hush ring (facing the target)
  const addMat = (col) => glowOnly(new THREE.MeshBasicMaterial({ color: colOf(col), transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide }));
  const sweep = new THREE.Mesh(new THREE.TorusGeometry(1, 0.016, 8, 96), addMat([1.0, 0.22, 0.7])); sweep.rotation.x = PI / 2 - 0.2; sweep.visible = false; sweep.renderOrder = 27; fx.add(sweep);
  const sweep2 = new THREE.Mesh(new THREE.RingGeometry(0.86, 1.0, 96, 1), addMat(COL.violet)); sweep2.rotation.x = -PI / 2 - 0.2; sweep2.visible = false; sweep2.renderOrder = 27; fx.add(sweep2);
  const hushRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 64), addMat(COL.violet)); hushRing.visible = false; hushRing.renderOrder = 27; fx.add(hushRing);
  // layers borrowed from how big spell effects are built: marks on the floor, shock rings, a shaft of light, soft motes
  const floorSig = [0, 1].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glowOnly(new THREE.MeshBasicMaterial({ map: sigilTex, color: colOf(COL.violet), transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide }))); m.rotation.x = -PI / 2; m.visible = false; m.renderOrder = 25; fx.add(m); return m; });
  function floorSigil(c, R, op, t, col) { floorSig.forEach((m, i) => { m.visible = op > 0.003; if (!m.visible) return; m.position.set(c.x, c.y + 0.014 + i * 0.004, c.z); m.scale.setScalar(R * (i ? 0.6 : 1)); m.rotation.z = (i ? -1.6 : 1) * t * 0.45; m.material.opacity = op * (i ? 0.6 : 0.8); m.material.color.copy(colOf(col || COL.violet)); }); }
  const shocks = []; let shockNext = 0;
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 72, 1), addMat(COL.violet)), r = { m, t: 1, dur: 1, r0: 0, r1: 1, flat: false };
    m.visible = false; m.renderOrder = 27; fx.add(m); shocks.push(r);
    m.onBeforeRender = (rn, sc, cam) => { if (!r.flat) { m.quaternion.copy(cam.quaternion); m.updateMatrixWorld(); } };
  }
  function shock(p, r0, r1, dur, col, flat) { const r = shocks[shockNext]; shockNext = (shockNext + 1) % shocks.length; r.t = 0; r.dur = dur; r.r0 = r0; r.r1 = r1; r.flat = !!flat; r.m.position.copy(p); if (flat) { r.m.position.y += 0.02; r.m.rotation.set(-PI / 2, 0, 0); } r.m.material.color.copy(colOf(col)); r.m.visible = true; }
  function stepShocks(dt) { for (const r of shocks) { if (r.t >= r.dur) { r.m.visible = false; continue; } r.t += dt; const u = Math.min(1, r.t / r.dur), e = 1 - Math.pow(1 - u, 3); r.m.scale.setScalar(Math.max(0.001, lerp(r.r0, r.r1, e))); r.m.material.opacity = (1 - u) * (1 - u); } }
  const shaftTex = (function () { const c = cvs(64, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    const gv = g.createLinearGradient(0, 0, 0, 256); gv.addColorStop(0, 'rgba(0,0,0,1)'); gv.addColorStop(0.3, 'rgba(0,0,0,0)'); gv.addColorStop(0.85, 'rgba(0,0,0,0)'); gv.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = gv; g.fillRect(0, 0, 64, 256); return ctex(c, 0, 0, false); })();
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowOnly(new THREE.MeshBasicMaterial({ map: shaftTex, color: colOf(COL.pale), transparent: true, depthWrite: false, depthTest: false, opacity: 0, side: THREE.DoubleSide }))); shaft.visible = false; shaft.renderOrder = 24; fx.add(shaft);
  shaft.onBeforeRender = (rn, sc, cam) => { shaft.rotation.set(0, Math.atan2(cam.position.x - shaft.position.x, cam.position.z - shaft.position.z), 0); shaft.updateMatrixWorld(); };
  function beam(c, w, h, op, col) { shaft.visible = op > 0.003; if (!shaft.visible) return; shaft.position.set(c.x, c.y + h / 2, c.z); shaft.scale.set(w, h, 1); shaft.material.opacity = op; shaft.material.color.copy(colOf(col)); }
  function motes(p, n, rad, life, size, col, vy) { kindNext = 1; mist(p, n, rad, life, size, col, vy); kindNext = 0; }
  let dimK = 0, dimNow = 0;
  const dim = (k) => { if (k > dimK) dimK = k; };
  // the gravity well: a black heart with a violet rim
  const well = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uA: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uA; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(mix(vec3(0.01,0.0,0.02), vec3(0.75,0.32,1.0), f) * (0.2 + f * 2.2), uA); }' }));
  well.visible = false; well.renderOrder = 26; fx.add(well);
  const spellLight = new THREE.PointLight(0xb060ff, 0, 3.2, 1.6); fx.add(spellLight);
  let lightK = 0; const lightP = V3(0, 1.2, 0.4);
  function light(p, k, hex) { if (k <= lightK) return; lightP.copy(p); lightK = k; spellLight.color.setHex(hex || 0xb060ff); }
  // the flail: the hip bells on their chain, loose in her hand
  const FL_N = 15, flP = [], flV = []; for (let i = 0; i < FL_N; i++) { flP.push(V3()); flV.push(V3()); }
  const flBeads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0085, 8, 6), new THREE.MeshStandardMaterial({ color: lin(0xe0ad48), roughness: 0.25, metalness: 1 }), FL_N - 1); flBeads.frustumCulled = false; flBeads.castShadow = true;
  const flHead = new THREE.Group(), bellMat = new THREE.MeshStandardMaterial({ color: lin(0xe6b24a), roughness: 0.2, metalness: 1, emissive: lin(0x7a4a08), emissiveIntensity: 0.25 });
  for (const [dx, dy, dz, r] of bellGeo.bells) { const b = new THREE.Mesh(new THREE.SphereGeometry(r * 2.0, 16, 12), bellMat); b.position.set(dx * 2.1, dy * 2.1 + 0.08, dz * 2.1); b.castShadow = true; flHead.add(b); }
  const flail = new THREE.Group(); flail.add(flBeads, flHead); flail.visible = false; fx.add(flail);
  const TRAIL_N = 26, trailPts = []; for (let i = 0; i < TRAIL_N; i++) trailPts.push(V3());
  const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_N * 6), 3));
  { const col = new Float32Array(TRAIL_N * 6), idx = []; for (let i = 0; i < TRAIL_N; i++) { const a = Math.pow(1 - i / (TRAIL_N - 1), 1.5); for (let k = 0; k < 6; k++) col[i * 6 + k] = [1.0, 0.72, 0.28][k % 3] * a; if (i < TRAIL_N - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); } trailGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); trailGeo.setIndex(idx); }
  const trail = new THREE.Mesh(trailGeo, glowOnly(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0 }))); trail.frustumCulled = false; trail.visible = false; fx.add(trail);
  let flLen = 0.6, flInit = false, trailOn = 0;
  const _im = new THREE.Matrix4(), _fa = V3(), _fb = V3();
  function stepFlail(dt, hand, len, drive, driveW) {       // a rope from her hand; drive pulls the bells toward a scripted point
    const seg = len / (FL_N - 1);
    if (!flInit) { for (let i = 0; i < FL_N; i++) { flP[i].copy(hand); flP[i].y -= i * seg; flV[i].copy(flP[i]); } flInit = true; for (let i = 0; i < TRAIL_N; i++) trailPts[i].copy(flP[FL_N - 1]); }
    const steps = dt > 0 ? 3 : 0, h = dt / 3;
    for (let s = 0; s < steps; s++) {
      for (let i = 1; i < FL_N; i++) { const p = flP[i], v = flV[i]; _fa.subVectors(p, v).multiplyScalar(0.985); v.copy(p); p.add(_fa); p.y -= 9.8 * h * h * (i === FL_N - 1 ? 1.6 : 1); if (p.y < 0.03) p.y = 0.03; }
      if (drive && driveW > 0) flP[FL_N - 1].lerp(drive, 1 - Math.pow(1 - driveW, h * 60));
      for (let it = 0; it < 6; it++) { flP[0].copy(hand); for (let i = 1; i < FL_N; i++) { _fa.subVectors(flP[i], flP[i - 1]); const L = _fa.length() || 1e-6, k = (L - seg) / L; if (i === 1) flP[i].addScaledVector(_fa, -k); else { flP[i - 1].addScaledVector(_fa, k * 0.5); flP[i].addScaledVector(_fa, -k * 0.5); } } }
    }
    flP[0].copy(hand);
    for (let i = 0; i < FL_N - 1; i++) { _fa.copy(flP[i]).lerp(flP[i + 1], 0.5); _im.makeTranslation(_fa.x, _fa.y, _fa.z); flBeads.setMatrixAt(i, _im); }
    flBeads.instanceMatrix.needsUpdate = true;
    const head = flP[FL_N - 1]; flHead.position.copy(head); _fa.subVectors(head, flP[FL_N - 2]).normalize(); flHead.quaternion.setFromUnitVectors(_fb.set(0, -1, 0), _fa);
    for (let i = TRAIL_N - 1; i > 0; i--) trailPts[i].copy(trailPts[i - 1]); trailPts[0].copy(head);
    const ta = trailGeo.attributes.position.array;
    for (let i = 0; i < TRAIL_N; i++) { const p = trailPts[i], w = 0.05 * (1 - i / TRAIL_N); ta[i * 6] = p.x; ta[i * 6 + 1] = p.y + w; ta[i * 6 + 2] = p.z; ta[i * 6 + 3] = p.x; ta[i * 6 + 4] = p.y - w; ta[i * 6 + 5] = p.z; }
    trailGeo.attributes.position.needsUpdate = true; trail.visible = trailOn > 0.01; trail.material.opacity = trailOn;
  }
  const fxHitP = V3();
  function fxHit(out) { return out.copy(fxHitP); }
  let tgtK = 1;                                       // how far off her target stands, as a share of the usual 2.6 m (hosts set targetDist)
  const toward = (out, p, d) => out.copy(p).addScaledVector(_tgt, d >= 2 ? d * tgtK : d);      // a point d meters toward the target
  const _tgt = V3(1, 0, 0), _h1 = V3(), _h2 = V3(), _h3 = V3(), _h4 = V3();
  const cue = (a, name, at) => { if (a.t >= at && !a.fired[name]) { a.fired[name] = true; return true; } return false; };
  const win = (t, a, b, fade) => sm(a, a + (fade || 0.15), t) * (1 - sm(b - (fade || 0.15), b, t));
  let aura = 0;
  const fxAuto = [];                                  // extra effect objects (later files add theirs): hidden at the start of every frame
  const fxTicks = [];                                 // called every frame after the move's own effects (her charge rings live here)
  let darkK = 0, darkNow = 0, shakeNow = 0;           // dark: how far the place round her goes black while she and her spell stay lit; shake: a rumble for the host to add to the picture
  function flailSingle(on) { flHead.children.forEach((b, i) => { if (!b.userData.p0) b.userData.p0 = b.position.clone(); b.visible = !on || i === 0; if (on && i === 0) { b.position.set(0, 0.03, 0); b.scale.setScalar(1.35); } else { b.position.copy(b.userData.p0); b.scale.setScalar(1); } }); }
  let flailOne = false;
  function updateFx(t, dt, P) {
    _tgt.set(1, 0, 0).applyQuaternion(_rq);
    for (const s of [gHandR, gHandL, gMain, gCore, gAux, sigil, sigil2, gGold, ringGold]) s.visible = false;
    sweep.visible = sweep2.visible = hushRing.visible = well.visible = shaft.visible = false; floorSig[0].visible = floorSig[1].visible = false; lightK = 0; trailOn = 0; dimK = 0; darkK = 0; shakeNow = 0;
    for (const o of fxAuto) o.visible = false;
    let flailOn = false;
    if (act && act.def.fx) flailOn = act.def.fx(act, t, dt) === 'flail';
    if (stance && stance.def.fx) stance.def.fx(stance, t, dt);
    for (const f of fxTicks) f(t, dt);
    if (grabbed && !(act && act.def.grabs)) releaseGrab();
    const one = flailOn && !!act.def.oneBell; if (one !== flailOne) { flailOne = one; flailSingle(one); }
    if (!flailOn && flail.visible) { flail.visible = false; flInit = false; trail.visible = false; }
    if (meshes.bells) meshes.bells.visible = meshes.bellslit.visible = !flailOn;
    spellLight.position.copy(lightP); spellLight.intensity += (lightK * 2.4 - spellLight.intensity) * Math.min(1, dt * 14 + (dt === 0 ? 1 : 0));
    dimNow += (dimK - dimNow) * Math.min(1, dt * 4 + (dt === 0 ? 1 : 0)); darkNow += (darkK - darkNow) * Math.min(1, dt * 10 + (dt === 0 ? 1 : 0)); stepShocks(dt);
    stepParticles(dt, t);
  }
