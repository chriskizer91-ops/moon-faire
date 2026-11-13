  // ---------- the gold on his boots ----------
  // Chris (November 13): "his boots do have gold flecks so you'll have to add those in as a code animation of pixel or floating
  // around his feet. When he walks like gold glitter dust follows his boots." Three kinds of single-point lights, all drawn in one go:
  //   flecks  sit on the leather of each boot and move with it; each one glints now and then
  //   motes   drift slowly round his feet while he stands
  //   trail   is shed by a boot whenever it moves, hangs in the air where it was shed, and fades
  // The points live in the world, not on him, so in a game the trail is left behind as he walks. A page that walks him on the spot
  // sets dust.ground to the speed the ground would be passing under him, and the trail streams away behind him.
  // The host adds j.fx to its scene beside j.root, and calls dust.setPixelRatio() when the canvas changes.
  const fx = new THREE.Group(); fx.name = 'noiz-fx';
  const DUST = (() => {
    const NF = Q(170, 100), NM = Q(240, 130), NT = Q(760, 400), N = NF * 2 + NM + NT;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const points = new THREE.Points(geo, mat); points.frustumCulled = false; points.renderOrder = 6; fx.add(points);
    let sd = 90210; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647, rb = (a, b) => a + (b - a) * r();
    const GOLD = ['#ffc640', '#ffad1f', '#ffe083', '#f59c16', '#ffd45e'].map((h) => { const c = lin(h); return [c.r * 1.25, c.g * 1.25, c.b * 1.25]; });      // gold, as light: the points are added to what is behind them
    // flecks: points on the boot's own surface, kept in the rest pose and carried by the bone that owns that part of the boot
    const flecks = [];
    for (const [S, s] of SIDES) for (let i = 0; i < NF; i++) {
      const y = Math.pow(r(), 1.25) * (B_Y1 - 0.015) + 0.008, a = r() * TAU, p = bootPt(s, y, a), c = bootPt(s, y, a + PI);
      const nx = p[0] - c[0], nz = p[2] - c[2], nl = Math.hypot(nx, nz) || 1;      // a little proud of the leather
      const bone = y > 0.16 ? 'shin' + S : (p[2] > 0.07 && y < 0.09 ? 'toe' + S : 'foot' + S);
      flecks.push({ b: bone, p: V3(p[0] + nx / nl * 0.002, y, p[2] + nz / nl * 0.002), ph: r() * TAU, f: rb(0.5, 2.3), g: GOLD[(r() * GOLD.length) | 0], k: rb(0.55, 1) });
    }
    const mote = () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, age: 1, life: 1, ph: r() * TAU, g: GOLD[(r() * GOLD.length) | 0], k: rb(0.4, 1) });
    const motes = [], trail = []; for (let i = 0; i < NM; i++) motes.push(mote()); for (let i = 0; i < NT; i++) { const m = mote(); m.age = 2; trail.push(m); }
    const M = {}, tmp = V3(), footNow = { R: V3(), L: V3() }, footWas = { R: V3(), L: V3() }, ground = V3(), emitAcc = { R: 0, L: 0 };
    let clock = 0, started = false, next = 0, amount = 1;
    const boneM = (name) => { const m = M[name] || (M[name] = new THREE.Matrix4()); return m.multiplyMatrices(SK[name].matrixWorld, skeleton.boneInverses[BI[name]]); };
    function spawnMote(m, first) {
      const S = r() < 0.5 ? 'R' : 'L', f = footNow[S], a = r() * TAU, q = Math.sqrt(r()) * 0.30 + 0.03;
      m.x = f.x + Math.cos(a) * q; m.z = f.z + 0.04 + Math.sin(a) * q; m.y = rb(0.01, 0.36);
      m.vx = rb(-0.012, 0.012); m.vz = rb(-0.012, 0.012); m.vy = rb(0.008, 0.045); m.life = rb(2.4, 5.5); m.age = first ? r() * m.life : 0;
    }
    function update(dt) {
      clock += dt;
      for (const [S] of SIDES) { boneM('shin' + S); boneM('toe' + S); footNow[S].setFromMatrixPosition(boneM('foot' + S)); }
      if (!started) { started = true; for (const [S] of SIDES) footWas[S].copy(footNow[S]); for (const m of motes) spawnMote(m, true); }
      let o = 0;
      // flecks: mostly dim, each flashing for a moment in its own time
      for (const f of flecks) {
        tmp.copy(f.p).applyMatrix4(M[f.b]); pos[o] = tmp.x; pos[o + 1] = tmp.y; pos[o + 2] = tmp.z;
        const b = amount * f.k * (0.22 + 0.95 * Math.pow(Math.max(0, Math.sin(clock * f.f + f.ph)), 10));
        col[o] = f.g[0] * b; col[o + 1] = f.g[1] * b; col[o + 2] = f.g[2] * b; o += 3;
      }
      // motes: a slow rise and a slower swirl, fading in and out
      for (const m of motes) {
        m.age += dt; if (m.age >= m.life) spawnMote(m, false);
        const sw = Math.sin(clock * 0.7 + m.ph);
        m.x += (m.vx + 0.010 * sw + ground.x) * dt; m.z += (m.vz + 0.010 * Math.cos(clock * 0.6 + m.ph) + ground.z) * dt; m.y += m.vy * dt;
        const u = m.age / m.life, b = amount * m.k * Math.sin(Math.PI * u) * (0.45 + 0.55 * Math.pow(Math.max(0, Math.sin(clock * 3.1 + m.ph * 7)), 4));
        pos[o] = m.x; pos[o + 1] = m.y; pos[o + 2] = m.z; col[o] = m.g[0] * b; col[o + 1] = m.g[1] * b; col[o + 2] = m.g[2] * b; o += 3;
      }
      // trail: a boot sheds dust as fast as it is moving (over the ground, so walking on the spot counts too)
      if (dt > 0) for (const [S, s] of SIDES) {
        tmp.copy(footNow[S]).sub(footWas[S]).multiplyScalar(1 / dt); const vx = tmp.x - ground.x, vy = tmp.y, vz = tmp.z - ground.z, sp = Math.hypot(vx, vy, vz);
        emitAcc[S] += amount * Math.min(260, Math.max(0, sp - 0.12) * 190) * dt;
        while (emitAcc[S] >= 1) {
          emitAcc[S] -= 1; const m = trail[next]; next = (next + 1) % NT;
          const y = Math.pow(r(), 1.6) * 0.30 + 0.005, a = r() * TAU, p = bootPt(s, y, a); tmp.set(p[0], p[1], p[2]).applyMatrix4(M[y > 0.16 ? 'shin' + S : 'foot' + S]);
          m.x = tmp.x; m.y = Math.max(0.004, tmp.y); m.z = tmp.z; m.vx = rb(-0.07, 0.07) + 0.10 * (tmp.x - footNow[S].x); m.vz = rb(-0.07, 0.07); m.vy = rb(0.02, 0.16); m.age = 0; m.life = rb(0.9, 2.3);
        }
        footWas[S].copy(footNow[S]);
      }
      for (const m of trail) {
        if (m.age < m.life) {
          m.age += dt; m.vy -= 0.10 * dt; const dr = Math.exp(-1.6 * dt); m.vx *= dr; m.vz *= dr; m.vy *= dr;
          m.x += (m.vx + ground.x) * dt; m.z += (m.vz + ground.z) * dt; m.y = Math.max(0.004, m.y + m.vy * dt);
          const u = m.age / m.life, b = amount * m.k * Math.pow(1 - u, 1.3) * (0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(clock * 9 + m.ph * 5)), 2));
          pos[o] = m.x; pos[o + 1] = m.y; pos[o + 2] = m.z; col[o] = m.g[0] * b; col[o + 1] = m.g[1] * b; col[o + 2] = m.g[2] * b;
        } else { pos[o] = 0; pos[o + 1] = -9; pos[o + 2] = 0; col[o] = col[o + 1] = col[o + 2] = 0; }
        o += 3;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    }
    return { update, points, ground, count: N, setPixelRatio(pr) { mat.size = Math.max(1.5, 1.7 * (pr || 1)); }, set amount(v) { amount = Math.max(0, Math.min(1, +v)); points.visible = amount > 0; }, get amount() { return amount; } };
  })();
