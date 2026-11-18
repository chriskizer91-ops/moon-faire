  // ===== I98_fx.js: the lights and the things of her spells (stage eleven) =====
  // Chris, November 14: "Let's move on to the rest of her animations, like her spells."
  // Her magic, from the rules given with paintings H1 on: GROWING LIGHT, soft gold with a fresh green edge and pearl-white where it
  // is brightest, drifting as small motes like pollen; SPARKS that are small four-pointed stars; SILVERLEAF, a slim silver-green leaf
  // that glows gold along its edges. It never looks like fire.
  // Everything here that glows is drawn with glowOnly: it adds light and does not count as something solid, so the Flipbook look
  // gives it no ink outline (claude/HOW-TO-flipbook-look.md, section 6). Sizes are in metres, not screen pixels, so the specks
  // shrink with her when the Flipbook look draws her small.
  const glowOnly = (m, pre) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = pre ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; m.transparent = true; m.depthWrite = false; return m; };
  const FXC = { gold: [1.0, 0.78, 0.34], green: [0.56, 0.95, 0.40], pearl: [1.0, 0.96, 0.84], leaf: [0.66, 0.92, 0.72] };
  let fxSeed = 20261114; const frnd = () => { fxSeed = (fxSeed * 1664525 + 1013904223) >>> 0; return fxSeed / 4294967296; }, frs = (a) => (frnd() * 2 - 1) * a;
  const fxG = new THREE.Group(); fxG.name = 'ioSpells';

  // ----- specks of light: motes (0), four-pointed stars (1), small glowing leaves (2). One draw for all of them. -----
  const PN = 1100, IMN = 110, PT = { n: 0, pos: new Float32Array(PN * 3), vel: new Float32Array(PN * 3), life: new Float32Array(PN), max: new Float32Array(PN), size: new Float32Array(PN), col: new Float32Array(PN * 3), kind: new Float32Array(PN), rot: new Float32Array(PN), spin: new Float32Array(PN), drag: new Float32Array(PN), grav: new Float32Array(PN) }, IM = [];
  const aPos = new THREE.InstancedBufferAttribute(new Float32Array((PN + IMN) * 3), 3), aSize = new THREE.InstancedBufferAttribute(new Float32Array(PN + IMN), 1), aCol = new THREE.InstancedBufferAttribute(new Float32Array((PN + IMN) * 3), 3), aRot = new THREE.InstancedBufferAttribute(new Float32Array(PN + IMN), 1), aKind = new THREE.InstancedBufferAttribute(new Float32Array(PN + IMN), 1);
  const partGeo = new THREE.InstancedBufferGeometry(); partGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3)); partGeo.setIndex([0, 1, 2, 0, 2, 3]);
  for (const [n, a] of [['iPos', aPos], ['iSize', aSize], ['iCol', aCol], ['iRot', aRot], ['iKind', aKind]]) { a.setUsage(THREE.DynamicDrawUsage); partGeo.setAttribute(n, a); }
  partGeo.instanceCount = 0;
  const partMesh = new THREE.Mesh(partGeo, glowOnly(new THREE.ShaderMaterial({ side: THREE.DoubleSide,
    vertexShader: 'attribute vec3 iPos; attribute float iSize; attribute vec3 iCol; attribute float iRot; attribute float iKind; varying vec2 vUv; varying vec3 vCol; varying float vKind;\nvoid main() { vUv = position.xy * 2.0; vCol = iCol; vKind = iKind; float c = cos(iRot), s = sin(iRot); vec2 q = vec2(c * position.x - s * position.y, s * position.x + c * position.y) * iSize; vec4 mv = modelViewMatrix * vec4(iPos, 1.0); mv.xy += q; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec2 vUv; varying vec3 vCol; varying float vKind;\nvoid main() { float r = length(vUv); float a;\n if (vKind < 0.5) a = pow(max(0.0, 1.0 - r), 2.2);\n else if (vKind < 1.5) { vec2 p = abs(vUv); a = max(pow(max(0.0, 1.0 - r), 3.0), max(exp(-p.y * 20.0) * max(0.0, 1.0 - p.x), exp(-p.x * 20.0) * max(0.0, 1.0 - p.y))); }\n else { float w = 0.36 * (1.0 - vUv.y * vUv.y); a = (1.0 - smoothstep(w - 0.06, w + 0.02, abs(vUv.x))) * step(abs(vUv.y), 1.0) * (0.55 + 0.45 * (1.0 - smoothstep(0.0, 0.07, abs(vUv.x)))); }\n gl_FragColor = vec4(vCol * a, a); }' }), true));
  partMesh.frustumCulled = false; partMesh.renderOrder = 20; fxG.add(partMesh);
  // emit(place, speed, how long it lives, size, colour, kind, and how it slows, falls and spins)
  function emit(x, y, z, vx, vy, vz, life, size, col, kind, drag, grav, spin) { if (PT.n >= PN) return; const i = PT.n++, j = i * 3; PT.pos[j] = x; PT.pos[j + 1] = y; PT.pos[j + 2] = z; PT.vel[j] = vx; PT.vel[j + 1] = vy; PT.vel[j + 2] = vz; PT.life[i] = PT.max[i] = life; PT.size[i] = size; PT.col[j] = col[0]; PT.col[j + 1] = col[1]; PT.col[j + 2] = col[2]; PT.kind[i] = kind || 0; PT.rot[i] = frnd() * TAU; PT.spin[i] = spin == null ? frs(1.5) : spin; PT.drag[i] = drag == null ? 1.2 : drag; PT.grav[i] = grav || 0; }
  // a light that is there for this frame only: the glow in her hand, under the leaf, on a foe that is struck
  function glow(p, size, col, a, kind, rot) { if (IM.length < IMN && a > 0.003) IM.push([p.x, p.y, p.z, size, col[0] * a, col[1] * a, col[2] * a, kind || 0, rot || 0]); }
  const mote = () => { const t = frnd(); return t < 0.5 ? FXC.gold : t < 0.82 ? FXC.green : FXC.pearl; };
  function fxParticles(dt) {
    let i = 0; while (i < PT.n) { PT.life[i] -= dt; if (PT.life[i] <= 0) { const l = --PT.n; if (i !== l) { for (const k of ['life', 'max', 'size', 'kind', 'rot', 'spin', 'drag', 'grav']) PT[k][i] = PT[k][l]; for (const k of ['pos', 'vel', 'col']) for (let c = 0; c < 3; c++) PT[k][i * 3 + c] = PT[k][l * 3 + c]; } continue; }
      const j = i * 3, dk = Math.max(0, 1 - PT.drag[i] * dt); PT.vel[j] *= dk; PT.vel[j + 1] = PT.vel[j + 1] * dk - PT.grav[i] * dt; PT.vel[j + 2] *= dk; PT.pos[j] += PT.vel[j] * dt; PT.pos[j + 1] += PT.vel[j + 1] * dt; PT.pos[j + 2] += PT.vel[j + 2] * dt; PT.rot[i] += PT.spin[i] * dt; i++; }
    for (i = 0; i < PT.n; i++) { const j = i * 3, u = PT.life[i] / PT.max[i], a = Math.min(1, (1 - u) * 9) * Math.min(1, u * 2.2), tw = PT.kind[i] === 1 ? 0.7 + 0.3 * Math.sin(PT.rot[i] * 9) : 1;
      aPos.array[j] = PT.pos[j]; aPos.array[j + 1] = PT.pos[j + 1]; aPos.array[j + 2] = PT.pos[j + 2]; aSize.array[i] = PT.size[i] * (0.6 + 0.4 * u); aCol.array[j] = PT.col[j] * a * tw; aCol.array[j + 1] = PT.col[j + 1] * a * tw; aCol.array[j + 2] = PT.col[j + 2] * a * tw; aRot.array[i] = PT.kind[i] === 1 ? 0 : PT.rot[i]; aKind.array[i] = PT.kind[i]; }
    let n = PT.n; for (const m of IM) { const j = n * 3; aPos.array[j] = m[0]; aPos.array[j + 1] = m[1]; aPos.array[j + 2] = m[2]; aSize.array[n] = m[3]; aCol.array[j] = m[4]; aCol.array[j + 1] = m[5]; aCol.array[j + 2] = m[6]; aKind.array[n] = m[7]; aRot.array[n] = m[8]; n++; }
    IM.length = 0; partGeo.instanceCount = n; aPos.needsUpdate = aSize.needsUpdate = aCol.needsUpdate = aRot.needsUpdate = aKind.needsUpdate = true; partMesh.visible = n > 0;
  }

  // ----- a ribbon of light: a strip laid between pairs of points, each pair fading as it ages -----
  const RIB_V = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  const RIB_F = 'uniform vec3 uA; uniform vec3 uB; uniform float uK; varying vec2 vUv; void main() { float e = 1.0 - abs(vUv.y * 2.0 - 1.0); float a = pow(e, 1.4) * vUv.x * uK; vec3 c = mix(uB, uA, e * e); gl_FragColor = vec4(c * a, a); }';
  const ribMat = (a, b) => glowOnly(new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { uA: { value: new THREE.Vector3(a[0], a[1], a[2]) }, uB: { value: new THREE.Vector3(b[0], b[1], b[2]) }, uK: { value: 1 } }, vertexShader: RIB_V, fragmentShader: RIB_F }), true);
  function makeRibbon(N, life, a, b) {
    const pos = new THREE.BufferAttribute(new Float32Array(N * 6), 3), uv = new THREE.BufferAttribute(new Float32Array(N * 4), 2), idx = []; pos.setUsage(THREE.DynamicDrawUsage); uv.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < N - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', pos); g.setAttribute('uv', uv); g.setIndex(idx);
    const mesh = new THREE.Mesh(g, ribMat(a, b)); mesh.frustumCulled = false; mesh.renderOrder = 19; mesh.visible = false; fxG.add(mesh);
    const R = { mesh, pts: [], life, push(p, q, s) { R.pts.unshift({ p: p.clone(), q: q.clone(), age: 0, s: s == null ? 1 : s }); if (R.pts.length > N) R.pts.length = N; },
      tick(dt) { for (const t of R.pts) t.age += dt; while (R.pts.length && R.pts[R.pts.length - 1].age >= R.life) R.pts.pop(); const n = R.pts.length; mesh.visible = n > 1; if (n < 2) return;
        for (let i = 0; i < N; i++) { const t = R.pts[Math.min(i, n - 1)], u = i < n ? Math.max(0, 1 - t.age / R.life) * t.s * Math.min(1, i / 2) : 0; pos.setXYZ(i * 2, t.p.x, t.p.y, t.p.z); pos.setXYZ(i * 2 + 1, t.q.x, t.q.y, t.q.z); uv.setXY(i * 2, u, 0); uv.setXY(i * 2 + 1, u, 1); }
        pos.needsUpdate = uv.needsUpdate = true; } };
    return R;
  }

  // ----- plain shapes for the things spells are cast at -----
  const fxStd = (hex, rough) => new THREE.MeshStandardMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), roughness: rough });       // colours are given as they should look on screen
  const lathe = (pts, seg) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y)), seg || 20);
  const capsule = (r0, r1, len, seg) => { const pts = []; for (let i = 0; i <= 6; i++) { const a = (i / 6) * PI / 2; pts.push([r0 * Math.sin(a), -r0 * Math.cos(a)]); } for (let i = 0; i <= 6; i++) { const a = (i / 6) * PI / 2; pts.push([r1 * Math.cos(a), len + r1 * Math.sin(a)]); } return lathe(pts, seg || 14); };
  const fxPart = (grp, geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; m.receiveShadow = true; grp.add(m); return m; };
  // the training dummy (the magic rules: "a post with a padded canvas body, a round canvas head and two short arms")
  const DUMMY = new THREE.Group(), dummyTilt = new THREE.Group(); DUMMY.add(dummyTilt); DUMMY.position.set(0, 0, 1.40); DUMMY.visible = false; fxG.add(DUMMY);
  { const wood = fxStd(0x5f4028, 0.86), canvas = fxStd(0xa48d68, 0.96), rope = fxStd(0x6f5836, 0.9);
    fxPart(DUMMY, new THREE.CylinderGeometry(0.19, 0.23, 0.05, 18), wood, 0, 0.025, 0); fxPart(dummyTilt, new THREE.CylinderGeometry(0.034, 0.040, 1.30, 12), wood, 0, 0.65, 0);
    fxPart(dummyTilt, lathe([[0.0, 0.74], [0.11, 0.76], [0.150, 0.88], [0.158, 1.05], [0.140, 1.22], [0.085, 1.32], [0.0, 1.33]], 22), canvas, 0, 0, 0); fxPart(dummyTilt, new THREE.SphereGeometry(0.108, 20, 14), canvas, 0, 1.475, 0);
    fxPart(dummyTilt, new THREE.CylinderGeometry(0.026, 0.026, 0.60, 10), wood, 0, 1.20, 0, 0, 0, PI / 2); for (const s of [-1, 1]) fxPart(dummyTilt, capsule(0.050, 0.046, 0.10, 12), canvas, s * 0.215, 1.20, 0, 0, 0, -s * PI / 2);
    for (const y of [0.83, 1.26, 1.375]) fxPart(dummyTilt, new THREE.TorusGeometry(y > 1.3 ? 0.058 : y > 1 ? 0.112 : 0.132, 0.008, 6, 20), rope, 0, y, 0, PI / 2); }
  // the friend she heals (the magic rules: "a plain grey artist's mannequin the same height as her, with no face and no clothes")
  const ALLY = new THREE.Group(); ALLY.position.set(0, 0, 1.30); ALLY.rotation.y = PI; ALLY.visible = false; fxG.add(ALLY);
  { const grey = fxStd(0x85878f, 0.7), joint = fxStd(0x63656d, 0.6), ball = (r, x, y, z) => fxPart(ALLY, new THREE.SphereGeometry(r, 14, 10), joint, x, y, z);
    fxPart(ALLY, lathe([[0, 1.41], [0.062, 1.43], [0.082, 1.50], [0.078, 1.57], [0.05, 1.62], [0, 1.63]], 18), grey, 0, 0, 0); fxPart(ALLY, capsule(0.036, 0.034, 0.05), grey, 0, 1.345, 0);
    fxPart(ALLY, lathe([[0, 1.01], [0.10, 1.02], [0.115, 1.12], [0.14, 1.24], [0.15, 1.31], [0.10, 1.355], [0, 1.36]], 18), grey, 0, 0, 0).scale.z = 0.72; fxPart(ALLY, lathe([[0, 0.83], [0.11, 0.85], [0.135, 0.92], [0.12, 0.99], [0, 1.005]], 18), grey, 0, 0, 0).scale.z = 0.74;
    for (const s of [-1, 1]) { ball(0.046, s * 0.17, 1.30, 0); fxPart(ALLY, capsule(0.040, 0.034, 0.22), grey, s * 0.185, 1.03, 0, 0, 0, s * 0.07); ball(0.036, s * 0.20, 1.00, 0); fxPart(ALLY, capsule(0.032, 0.026, 0.20), grey, s * 0.215, 0.775, 0.012, 0.06, 0, s * 0.05); fxPart(ALLY, capsule(0.026, 0.030, 0.085), grey, s * 0.228, 0.66, 0.02, 0.1, 0, s * 0.03);
      ball(0.052, s * 0.085, 0.84, 0); fxPart(ALLY, capsule(0.058, 0.046, 0.33), grey, s * 0.09, 0.47, 0, 0, 0, s * 0.012); ball(0.044, s * 0.094, 0.455, 0); fxPart(ALLY, capsule(0.042, 0.032, 0.33), grey, s * 0.096, 0.085, 0); fxPart(ALLY, capsule(0.036, 0.034, 0.12), grey, s * 0.098, 0.036, -0.03, PI / 2, 0, 0).scale.x = 1.1; } }
  // the silverleaf (the magic rules: "a slim, pointed leaf about 8 cm long, silver-green, that glows gold along its edges and veins")
  const LEAF = new THREE.Group(); LEAF.visible = false; fxG.add(LEAF);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x8a6a3c, roughness: 0.7, side: THREE.DoubleSide, emissive: 0x000000 });
  { const pos = [], idx = [], NL = 12; for (let i = 0; i <= NL; i++) { const t = i / NL, y = (t - 0.5) * 0.08, w = 0.0105 * Math.pow(Math.sin(PI * Math.min(1, t * 0.96 + 0.02)), 0.75), bend = 0.004 * Math.sin(PI * t); pos.push(-w, y, bend + w * 0.25, 0, y, bend, w, y, bend + w * 0.25); }
    for (let i = 0; i < NL; i++) { const a = i * 3; idx.push(a, a + 1, a + 4, a, a + 4, a + 3, a + 1, a + 2, a + 5, a + 1, a + 5, a + 4); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, leafMat); m.castShadow = true; LEAF.add(m); }
  const LEAF_DRY = new THREE.Color(0x8a6a3c).convertSRGBToLinear(), LEAF_FRESH = new THREE.Color(0xa9cdb0).convertSRGBToLinear(), LEAF_GLOW = new THREE.Color(0.55, 0.47, 0.20);
  function leafSet(p, q, fresh, lit, scale) { LEAF.visible = scale > 0.01; LEAF.position.copy(p); LEAF.quaternion.copy(q); LEAF.scale.setScalar(Math.max(0.001, scale)); leafMat.color.copy(LEAF_DRY).lerp(LEAF_FRESH, fresh); leafMat.emissive.copy(LEAF_GLOW).multiplyScalar(lit); }

  // ----- the crescent of light her sickle throws (I3): a flat crescent, horns back, that flies to the foe -----
  const WAVE = (() => { const pos = [], uv = [], idx = [], NW = 28, R = 0.46; for (let i = 0; i <= NW; i++) { const t = i / NW, a = lerp(-1.75, 1.75, t), w = 0.012 + 0.13 * Math.pow(Math.sin(PI * t), 0.8); pos.push(R * Math.sin(a), 0, R * Math.cos(a) - R, (R - w) * Math.sin(a), 0, (R - w) * Math.cos(a) - R + w * 0.35); uv.push(1, 0.15, 1, 1); }
    for (let i = 0; i < NW; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); const m = new THREE.Mesh(g, ribMat(FXC.pearl, FXC.gold)); m.frustumCulled = false; m.renderOrder = 19; m.visible = false; fxG.add(m); return m; })();
  const RIB_CUT = makeRibbon(40, 0.50, FXC.pearl, [1.0, 0.70, 0.22]), RIB_SALVE = makeRibbon(96, 1.25, [1.0, 0.93, 0.62], [0.50, 0.92, 0.36]), RIB_SALVE2 = makeRibbon(96, 1.25, FXC.gold, [0.50, 0.92, 0.36]);
  // how far each thing has come into being (0 gone .. 1 there), slid toward what the spell being cast wants
  const FXW = { dummy: 0, ally: 0 }; let dumA = 0, dumV = 0;
  function dummyHit(v) { dumV += v; }
  function fxTick(dt, wantDummy, wantAlly, wantAlly2) {
    FXW.dummy += ((wantDummy ? 1 : 0) - FXW.dummy) * Math.min(1, dt * 4); FXW.ally += ((wantAlly ? 1 : 0) - FXW.ally) * Math.min(1, dt * 4); FXW.ally2 += ((wantAlly2 ? 1 : 0) - FXW.ally2) * Math.min(1, dt * 4);
    for (const [g, w] of [[DUMMY, FXW.dummy], [ALLY, FXW.ally], [ALLY2, FXW.ally2]]) { g.visible = w > 0.02; const e = sm(0, 1, w); g.scale.set(e, Math.max(0.001, e * (1 + 0.12 * Math.sin(PI * e))), e); }
    dumV += (-dumA * 95 - dumV * 6.5) * dt; dumA += dumV * dt; dummyTilt.rotation.x = dumA;                     // the dummy rocks on its post when it is struck, and settles
    RIB_CUT.tick(dt); RIB_SALVE.tick(dt); RIB_SALVE2.tick(dt); for (const v of VINES) v.tick(dt); fxParticles(dt);
  }
  function fxClear() { PT.n = 0; IM.length = 0; RIB_CUT.pts.length = 0; RIB_SALVE.pts.length = 0; RIB_SALVE2.pts.length = 0; WAVE.visible = false; LEAF.visible = false; fxSeed = 20261114; woodClear(); GARDEN.hide(); PAGES.visible = false; thornHide(); }
