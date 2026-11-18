
  // ---------- round 4: two of its ten moves, When the Bell Falls Silent and The Moon's Little Lie ----------
  // Chris, 13 Nov: "do your two favorite and let's call it that". Paintings J6, J7, J8 and the magic set K1 (the nine tails), K2 (the coin and the moon).
  // The other eight (Switcheroo, Finders Keepers, Loose Thread, Ninefold Lie, Bellbound Bargain, Pins and Needles, Seam Ripper, Thimble) are not built.

  // Her nine tails of foxfire (K1): nine flames in a fan from one point behind her, each a flat strip worked out afresh every frame.
  // The fan always turns to face whoever is looking, so it is never seen edge-on.
  const TAILS = (function () {
    const NT = 9, NS = 22, NP = NS + 1, NV = NT * NP * 2, pos = new Float32Array(NV * 3), uvw = new Float32Array(NV * 3), idx = [];
    for (let i = 0; i < NT; i++) for (let k = 0; k < NP; k++) for (let s = 0; s < 2; s++) { const v = (i * NP + k) * 2 + s; uvw[v * 3] = k / NS; uvw[v * 3 + 1] = s ? 1 : -1; uvw[v * 3 + 2] = i / (NT - 1); if (k < NS && !s) { const a = (i * NP + k) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const geo = new THREE.BufferGeometry(), pa = new THREE.BufferAttribute(pos, 3); pa.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('position', pa); geo.setAttribute('aU', new THREE.BufferAttribute(uvw, 3)); geo.setIndex(idx);
    const mat = glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uOp: { value: 0 } },
      vertexShader: `attribute vec3 aU; varying vec3 vU; void main() { vU = aU; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uT; uniform float uOp; varying vec3 vU;
void main() { float u = vU.x, w = 1.0 - abs(vU.y), ph = vU.z * 37.0;
  float lick = 0.72 + 0.28 * sin(u * 26.0 - uT * 8.0 + ph) * sin(u * 9.0 + vU.y * 3.0 + uT * 4.0 + ph);
  float a = smoothstep(0.05, 0.75, w * lick) * smoothstep(0.0, 0.05, u);
  vec3 body = mix(vec3(0.04, 0.16, 0.95), vec3(0.55, 0.82, 1.0), pow(w, 3.0) * (1.0 - 0.5 * u));
  vec3 tip = mix(vec3(0.60, 0.32, 1.0), mix(vec3(1.0, 0.42, 0.70), vec3(1.0, 0.78, 0.36), smoothstep(0.88, 1.0, u)), smoothstep(0.74, 0.9, u));
  vec3 c = mix(body, tip, smoothstep(0.76, 0.93, u) * (1.0 - 0.5 * pow(w, 3.0)));
  gl_FragColor = vec4(c * a * uOp * (0.55 + 0.35 * u), 1.0); }` }), true);
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 26; mesh.visible = false; fx.add(mesh); fxAuto.push(mesh);
    const _p = V3();
    return { mesh,
      // base: the point they spring from (world); right: across the fan; back: away from whoever is looking. open 0 shut to 1; len: the longest tail, metres;
      // spread: how far the outermost tails lean from straight up, radians
      shape(base, right, back, open, len, spread, op, t) {
        mesh.visible = op > 0.004 && open > 0.004; if (!mesh.visible) return; mat.uniforms.uOp.value = op; mat.uniforms.uT.value = t;
        for (let i = 0; i < NT; i++) { const k = (i - 4) / 4, a0 = k * spread * open, L = len * (1 - 0.14 * Math.abs(k)) * (0.25 + 0.75 * open), sgn = k === 0 ? 0 : Math.sign(k); let px = 0, py = 0;
          for (let j = 0; j < NP; j++) { const s = j / NS, th = a0 * (0.30 + 0.70 * sm(0, 0.55, s)) + (sgn * 1.25 + (k === 0 ? 0.5 : 0)) * sm(0.72, 1, s) * open + 0.20 * Math.sin(s * 7 - t * 2.4 + i * 1.7) * Math.sin(PI * s);
            const w = 0.135 * len * Math.pow(Math.max(0, Math.sin(PI * Math.pow(s, 0.80))), 1.0) * (0.4 + 0.6 * open), sn = Math.sin(th), cs = Math.cos(th);
            for (let e = 0; e < 2; e++) { const q = e ? 1 : -1, v = (i * NP + j) * 2 + e; _p.copy(base).addScaledVector(right, px + q * cs * w).addScaledVector(back, 0.10 + 0.22 * s * L); pos[v * 3] = _p.x; pos[v * 3 + 1] = _p.y + py - q * sn * w; pos[v * 3 + 2] = _p.z; }
            px += sn * L / NS; py += cs * L / NS; } }
        pa.needsUpdate = true;
      } };
  })();

  // The coin and the moon (K2): one disc that is a thin bright crescent when small (phase 0) and the blue full moon when grown (phase 1), with a rim of
  // stitches that can be sewn on, and unpicked again, clockwise from the top. It always faces whoever is looking; as a coin it also spins.
  const MOON = (function () {
    const blank = new THREE.DataTexture(new Uint8Array([70, 120, 230, 255]), 1, 1, THREE.RGBAFormat); blank.needsUpdate = true;
    const U = { tM: { value: blank }, uHasM: { value: 0 }, uPhase: { value: 0 }, uSewn: { value: 0 }, uUn: { value: 0 }, uBright: { value: 1 } };
    onBaked('moon', (img) => { const t = new THREE.Texture(img); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; U.tM.value = t; U.uHasM.value = 1; });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: U,
      vertexShader: `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform sampler2D tM; uniform float uHasM; uniform float uPhase; uniform float uSewn; uniform float uUn; uniform float uBright; varying vec2 vP;
void main() { float r = length(vP), an = fract(atan(vP.x, vP.y) / 6.2832 + 1.0), on = step(uUn, an) * step(an, uSewn) * step(0.98, uPhase);
  float bar = on * step(abs(fract(an * 30.0) - 0.5), 0.15) * step(0.93, r) * step(r, 1.13), rope = on * step(0.985, r) * step(r, 1.03), st = max(bar, rope);
  vec3 sc = mix(0.62 + 0.38 * cos(6.2832 * (an + vec3(0.0, 0.33, 0.67))), vec3(1.0), 0.45), c;
  if (r < 1.0) { if (length(vP - vec2(0.42 + 2.2 * uPhase, 0.12 * (1.0 - uPhase))) < 0.92) discard;
    vec3 plain = vec3(0.30, 0.52, 0.95) * (0.75 + 0.25 * sin(vP.x * 9.0) * sin(vP.y * 7.0 + 1.0)), tex = mix(plain, texture2D(tM, vP * 0.46 + 0.5).rgb, uHasM);
    c = mix(vec3(0.85, 0.95, 1.0), tex, smoothstep(0.15, 0.9, uPhase)) * uBright * (1.0 - 0.25 * smoothstep(0.9, 1.0, r)); c = mix(c, sc, st); }
  else { if (st < 0.5) discard; c = sc; }
  gl_FragColor = vec4(c, 1.0); }` }));
    mesh.frustumCulled = false; mesh.renderOrder = 4; mesh.visible = false; fx.add(mesh); fxAuto.push(mesh);
    const halo = sprite(glowTex, [0.35, 0.55, 1.0], 3); fxAuto.push(halo); let spin = 0; const _qs = Qt(), UPY = V3(0, 1, 0);
    mesh.onBeforeRender = (r, sc, cam) => { mesh.quaternion.copy(cam.quaternion); if (spin) mesh.quaternion.multiply(_qs.setFromAxisAngle(UPY, spin)); mesh.updateMatrixWorld(); };
    return { mesh,
      // p: its middle (world); rad: its radius; phase 0 crescent to 1 full; sewn, un: the stitched part of its rim runs from un to sewn (0 to 1, clockwise from the top)
      show(p, rad, phase, sewn, un, bright, turn) { mesh.visible = rad > 0.002; if (!mesh.visible) return; mesh.position.copy(p); mesh.scale.setScalar(rad); U.uPhase.value = phase; U.uSewn.value = sewn; U.uUn.value = un; U.uBright.value = bright; spin = turn || 0; show(halo, p, rad * 3.6, 0.5 * bright * (0.4 + 0.6 * phase)); },
      // a point on its rim (world), for the needle: an 0 to 1 clockwise from the top as seen by whoever is looking
      rim(an, k, out) { const a = an * 2 * PI; return out.set(Math.sin(a) * k, Math.cos(a) * k, 0.02).applyMatrix4(mesh.matrixWorld); } };
  })();

  (function foxSpells4() {
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr }), K = (t, ...o) => Object.assign({ t }, ...o), UPV = V3(0, 1, 0), _q4 = Qt();
    const _a = V3(), _b = V3(), _c = V3(), _d = V3(), RT = V3(), BK = V3(), c3 = [0, 0, 0];
    const restArm = (S) => ({ ['h' + S]: 'rest', ['e' + S]: 'rest', ['f' + S]: 'rest', ['tw' + S]: 'rest', ['wr' + S]: 'rest' }), stand = { hip: [0, 0, 0], hipR: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest' };
    const FR = { X: V3(), Z: V3(), O: V3() }; let spinWas = 0;
    const frame = () => { root.getWorldQuaternion(_q4); FR.X.set(1, 0, 0).applyQuaternion(_q4).applyAxisAngle(UPV, -spinWas); FR.Z.set(0, 0, 1).applyQuaternion(_q4).applyAxisAngle(UPV, -spinWas); root.getWorldPosition(FR.O); spinWas = spinNow; };
    const many = (n, dt, f) => { const x = n * dt; for (let i = 0; i < x || (i === 0 && Math.random() < x); i++) f(); };
    const flame = (p, spread, size, up) => emit(p.x + rs() * spread, p.y + rs() * spread * 0.5, p.z + rs() * spread, rs() * 0.06, (up || 0.3) * (0.5 + Math.random()), rs() * 0.06, 0.3 + Math.random() * 0.35, size * (0.6 + 0.7 * Math.random()), Math.random() < 0.3 ? COL.foxPale : COL.fox, -0.2, 0.9);
    // her tails behind her as whoever is looking sees her: RT runs across their view, BK away from them
    const fan = (open, len, spread, op, t) => { const h = anchor('hips', _a); BK.copy(FR.Z).negate(); if (RIB.seen) { _b.subVectors(h, RIB.eye); _b.y = 0; if (_b.lengthSq() > 0.04) BK.copy(_b).normalize(); } RT.set(-BK.z, 0, BK.x); h.addScaledVector(BK, 0.14 * FOX_K); h.y += 0.04 * FOX_K; TAILS.shape(h, RT, BK, open, len * FOX_K, spread, op, t); return h; };
    const mantle = (k, dt) => { if (k < 0.02) return; SK.uarmR.getWorldPosition(_b); SK.uarmL.getWorldPosition(_c); many(46 * k, dt, () => { _d.lerpVectors(_b, _c, Math.random()); _d.y += 0.045 * FOX_K; flame(_d, 0.03, 0.03, 0.22); });       // a mantle of blue flame along her shoulders, and her ears lit
      const cr = anchor('crown', _d); many(18 * k, dt, () => { const s = Math.random() < 0.5 ? -1 : 1; emit(cr.x + s * RT.x * 0.085 + rs() * 0.02, cr.y + 0.02 + Math.random() * 0.05, cr.z + s * RT.z * 0.085 + rs() * 0.02, 0, 0.12, 0, 0.3, 0.022, COL.foxPale, -0.1, 0.8); }); };
    const BELLK = [-0.125, 1.28, 0.102], akL = arm('L', [0.215, 0.985, 0.03], [1, 0.05, -0.45], FP.soft, 0.3, [0.2, 0]), akR = arm('R', [-0.215, 0.985, 0.03], [-1, 0.05, -0.45], FP.soft, 0.3, [0.2, 0]);      // BELLK: two fingers on her bell, elbow down (poses.py, tipR onto the bell); akL, akR: a hand on her hip

    // When the Bell Falls Silent (J6). She lays two fingers on her bell and holds it still. Her smile goes. Nine tails of foxfire open behind her
    // like a peacock's fan, blue flame lies along her shoulders, the stage dims. Then she lets the bell go, it rings, and she is herself again.
    (function () {
      const dur = 6.0, T_ST = 0.95, T_OPEN = 1.5, T_SHUT = 4.4, T_GO = 4.9, keys = [], onBell = arm('R', BELLK, [-0.5, -1, 0.1], FP.two, 0.6, [0.6, 0.4]), tog = { hip: [0, 0, 0], ftR: [0.045, 0, 0, 0, 0], ftL: [-0.045, 0, 0, 0, 0], knR: 'rest', knL: 'rest' };
      keys.push(K(0.40, { hd: [0.10, 0, 0.12], sp: [0, 0, 0.03], mouth: 2, eyes: 0 }, restArm('L')));
      keys.push(K(T_ST, { hd: [0, 0.03, 0.04], sp: [0, 0, 0], mouth: 2 }, onBell, tog)); keys.push(K(1.15, { hd: [0, 0.03, 0.04], mouth: 2 }, onBell));
      keys.push(K(T_OPEN, { hd: [0, 0, 0], sp: [0, -0.03, 0], mouth: 0, eyes: 0 }, onBell, tog));                                                          // the smile goes
      keys.push(K(2.90, { eyes: 0 })); keys.push(K(3.02, { eyes: 1 })); keys.push(K(3.18, { eyes: 0 }));                                                   // one slow blink
      keys.push(K(T_SHUT, { hd: [0, 0, 0], sp: [0, -0.03, 0], mouth: 0, eyes: 0 }, onBell, tog));
      keys.push(K(T_GO, { hd: [0, 0.02, 0.03], mouth: 0 }, onBell)); keys.push(K(T_GO + 0.12, {}, arm('R', [BELLK[0] - 0.03, BELLK[1] - 0.012, BELLK[2] + 0.025], [-0.5, -1, 0.1], FP.two, 0.6, [0.4, 0.4])));
      keys.push(K(5.30, { hd: [-0.06, 0, 0.10], sp: [0, 0, 0.02], mouth: 2 })); keys.push(K(5.65, { hd: [-0.04, 0, 0.08], sp: [0, 0, 0], mouth: 2 }, restArm('R'), stand));
      defAction('bell_silent', dur, keys, { outro: 0.3, stand: true, cues: [T_ST / dur, T_GO / dur],
        start() { spinWas = 0; },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          const open = sm(T_OPEN, T_OPEN + 1.3, T) * (1 - sm(T_SHUT, T_SHUT + 0.75, T)), hush = win(T, T_ST, T_GO + 0.3, 0.5);
          dim(0.55 * hush); const h = fan(open, 1.8, 1.22, Math.min(1, open * 1.4), t); mantle(open, dt);
          if (open > 0.02) { _b.copy(h); _b.y += 0.7 * FOX_K; light(_b, 1.5 * open, 0x4f8cff); many(22 * open, dt, () => { _c.copy(h).addScaledVector(RT, rs() * 1.1 * open); _c.y += (0.3 + Math.random() * 1.6) * FOX_K; flame(_c, 0.05, 0.03, 0.15); }); }
          if (cue(a, 'still', T_ST)) burst(anchor('tipR', _b), 12, 0.35, 0.5, 0.02, COL.foxPale, -0.1, 1.6, 0.1);
          if (cue(a, 'ring', T_GO + 0.06)) { const p = anchor('tipR', _b); burst(p, 26, 0.9, 0.5, 0.028, COL.gold, 0.2, 1.3, 0.3); shock(p, 0.02, 0.22, 0.35, COL.gold); }
        } });
    })();

    // The Moon's Little Lie (J7, J8), her biggest spell. A crescent no bigger than a coin spins on her raised fingertip. She flicks it up: it climbs,
    // grows and fills into a huge blue moon, and a needle sews it onto the sky like a patch. Arms wide, head back, her nine tails out: its light falls
    // on her target. Then the stitches come undone, the moon drops back into her open hand as a coin, and she closes her fingers on it.
    (function () {
      const dur = 7.0, T_ON = 0.55, T_FL = 2.18, T_UP = 3.25, T_SEW = 4.15, T_HIT = 4.35, T_UN = 5.05, T_FALL = 5.65, T_CATCH = 6.25, keys = [];
      const up = (y, wr) => arm('R', [-0.33, y, 0.06], [-1, -0.45, -0.05], FP.point, 0.4, [wr || 0.1, 0]), wide = [arm('R', [-0.44, 1.40, 0.02], [-0.4, -1, -0.3], FP.open, 1.3, [0.2, 0]), arm('L', [0.44, 1.40, 0.02], [0.4, -1, -0.3], FP.open, 1.3, [0.2, 0])];
      const palm = (f) => arm('R', [-0.24, 1.13, 0.27], [-0.7, -1, -0.2], f, 1.35, [-0.25, 0]);
      keys.push(K(T_ON, { hd: [-0.22, -0.20, 0.06], sp: [0, 0, 0.03], hip: [0.02, 0, 0], mouth: 2 }, up(1.60), akL)); keys.push(K(1.85, { hd: [-0.22, -0.20, 0.06], sp: [0, 0, 0.03] }, up(1.60), akL));      // the coin on her fingertip (J7)
      keys.push(K(2.04, { hd: [-0.20, -0.16, 0.06] }, up(1.54, 0.3))); keys.push(K(T_FL + 0.04, { hd: [-0.16, -0.34, 0.04] }, up(1.69, -0.15))); keys.push(K(2.50, { hd: [-0.10, -0.36, 0.02] }, up(1.66)));     // and up it goes
      keys.push(K(3.05, { hd: [-0.08, -0.36, 0.02], sp: [0, -0.04, 0.02] }, up(1.62), akL));
      keys.push(K(3.50, { hd: [0, -0.30, 0], sp: [0, -0.10, 0], hip: [0, 0, 0], mouth: 2, sh: [0, 0] }, wide[0], wide[1]));                                                                                   // arms wide, head back (J8)
      for (let i = 0; i < 3; i++) { keys.push(K(4.50 + i * 0.2, { sh: [0.5, 0.5] })); keys.push(K(4.60 + i * 0.2, { sh: [0, 0] })); }
      keys.push(K(5.10, { hd: [0, -0.30, 0], sp: [0, -0.10, 0], sh: [0, 0] }, wide[0], wide[1]));
      keys.push(K(5.70, { hd: [-0.10, -0.12, 0.05], sp: [0, 0, 0.02], mouth: 2 }, palm(FP.open), akL)); keys.push(K(T_CATCH - 0.04, { hd: [-0.12, 0.10, 0.05] }, palm(FP.open)));                               // her hand out for what comes down
      keys.push(K(T_CATCH + 0.14, { hd: [-0.12, 0.10, 0.05], mouth: 2 }, palm(FP.fist))); keys.push(K(6.60, { hd: [0.05, 0, 0.10], sp: [0, 0, 0.02] }, palm(FP.fist), akL));
      keys.push(K(6.85, { hd: [0, 0, 0.05], sp: [0, 0, 0], mouth: 2 }, restArm('R'), restArm('L'), stand));
      const p0 = V3(), sky = V3(), tg = V3(), mp = V3(); let has = false;
      defAction('moons_little_lie', dur, keys, { outro: 0.3, stand: true, hits: [T_HIT / dur], cues: [T_FL / dur, T_UP / dur, T_CATCH / dur], impact: 0.9,
        start() { has = false; spinWas = 0; },
        fx(a, t, dt) {
          const T = a.t; frame(); RIB.begin();
          tg.copy(FR.O).addScaledVector(FR.X, 2.6 * tgtK); fxHitP.copy(tg); fxHitP.y += 1.1 * FOX_K;
          if (!has || T < T_FL) { sky.copy(FR.O).addScaledVector(FR.X, 1.0 * tgtK).addScaledVector(FR.Z, -2.0); sky.y += 3.45 * FOX_K; has = true; }
          const tip = anchor('tipR', _a); tip.y += 0.045 * FOX_K;
          const RAD = 1.55 * FOX_K, g = sm(T_FL, T_UP, T), fall = sm(T_FALL, T_CATCH, T), sewn = cl((T - T_UP) / (T_SEW - T_UP), 0, 1), un = cl((T - T_UN) / (T_FALL - T_UN), 0, 1);
          if (T < T_FL) { p0.copy(tip); mp.copy(tip); } else if (T < T_FALL) { mp.lerpVectors(p0, sky, 1 - Math.pow(1 - g, 2.2)); } else { const hd = anchor('handR', _b); hd.y += 0.05 * FOX_K; mp.lerpVectors(sky, hd, fall * fall); }
          const rad = lerp(0.034 * FOX_K, RAD, T < T_FALL ? g * g * (3 - 2 * g) : Math.pow(1 - fall, 1.6)), phase = T < T_FALL ? sm(T_FL + 0.25, T_UP - 0.1, T) : 1 - sm(T_FALL + 0.1, T_CATCH - 0.08, T);
          const flash = win(T, T_HIT - 0.12, T_HIT + 0.7, 0.12), seen = sm(T_ON - 0.2, T_ON + 0.1, T) * (T < T_CATCH ? 1 : 0);
          if (seen > 0.01) MOON.show(mp, rad * seen, phase, sewn, un, 1 + 0.9 * flash, (1 - Math.max(g, 0)) * (t * 9 % (2 * PI)) * (T < T_FALL ? 1 : 0) + (T >= T_FALL ? fall * fall * 12 : 0));
          if (T < T_FL + 0.1) { many(8, dt, () => emit(mp.x + rs() * 0.03, mp.y + rs() * 0.03, mp.z + rs() * 0.03, 0, 0.05, 0, 0.3, 0.02, COL.foxPale, 0, 0.8)); light(mp, 0.5 * seen, 0xcfe4ff); }
          else if (T < T_CATCH) light(mp, 1.6 * phase * (1 + flash), 0x5f96ff);
          if (cue(a, 'flick', T_FL)) burst(tip, 16, 0.7, 0.4, 0.025, COL.foxPale, 0.2, 1.2, 0.5);
          if (sewn > 0 && sewn < 1) { MOON.rim(sewn, rad * 1.07, _b); MOON.rim(Math.min(1, sewn + 0.01), rad * 1.07, _c); SLIT.needle(_b, _c.sub(_b), 1);                                               // the needle goes round its rim
            RIB.path((u, o) => MOON.rim(Math.max(0, sewn - 0.10 * (1 - u)), rad * (1.07 + 0.05 * Math.sin(u * 40)), o), 0.02, 1, t * 0.5, 0.6, 2); many(30, dt, () => { RIB.thCol(Math.random(), c3); emit(_b.x, _b.y, _b.z, rs() * 0.3, rs() * 0.3, rs() * 0.3, 0.4, 0.05, c3, 0.2, 0.9); }); }
          const open = sm(T_UP - 0.15, T_UP + 0.55, T) * (1 - sm(T_UN + 0.2, T_FALL + 0.3, T)); fan(open, 2.0, 1.72, Math.min(1, open * 1.4), t); mantle(open * 0.7, dt);
          dim(0.6 * win(T, T_UP - 0.2, T_FALL, 0.4));
          const bm = win(T, T_HIT - 0.1, T_HIT + 0.75, 0.1); if (bm > 0.01) { _b.copy(tg); beam(_b, 0.95, mp.y - tg.y, 0.75 * bm, [0.42, 0.62, 1.0]); _c.copy(tg); _c.y += 1.0 * FOX_K; light(_c, 2.2 * bm, 0x6fa0ff); many(60 * bm, dt, () => { _d.copy(tg); _d.y += Math.random() * 2.2; flame(_d, 0.3, 0.04, -0.6); }); }
          if (cue(a, 'hit', T_HIT)) { _b.copy(tg); shock(_b, 0.2, 1.5, 0.6, [0.6, 0.78, 1.0], true); _b.y += 1.0 * FOX_K; burst(_b, 110, 2.8, 0.7, 0.05, COL.fox, 0.5, 1.3, 0.5); burst(_b, 50, 1.6, 0.9, 0.04, COL.foxPale, 0.3, 1.1, 0.8); }
          if (T > T_UN && T < T_FALL + 0.2) many(40, dt, () => { MOON.rim(un, rad * 1.07, _b); RIB.thCol(Math.random(), c3); emit(_b.x, _b.y, _b.z, rs() * 0.4, -0.2 + rs() * 0.3, rs() * 0.4, 0.5, 0.045, c3, 0.5, 0.9); });      // the stitches come undone
          if (cue(a, 'catch', T_CATCH)) { const hd = anchor('handR', _b); burst(hd, 30, 0.9, 0.5, 0.03, COL.foxPale, 0.2, 1.3, 0.4); shock(hd, 0.02, 0.2, 0.3, COL.foxPale); }
        } });
    })();
  })();
