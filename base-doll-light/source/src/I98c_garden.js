  // ===== I98c_garden.js: the Moonflower Garden (stage twelve; paintings H11, H12, I6) =====
  // "She scatters a handful of glowing seeds in a ring, buds rise where they land, and ... they open into white flowers that glow
  // like small moons." The magic rules: "MOONFLOWERS: large white trumpet-shaped flowers on dark green vines with heart-shaped
  // leaves; each open flower glows pearl-white like a small moon."
  // A ring of twelve flowers round her and her friends. Each flower is its own small mesh whose points slide from a tight twisted
  // bud to the open trumpet (I6, top row), so it truly opens; the vine is one braid that is shown bit by bit outward from where each
  // seed fell.
  const GARDEN = (() => {
    const G = new THREE.Group(); G.name = 'moonflowers'; G.visible = false; fxG.add(G);
    const NF = 12, R0 = 1.22, FU = 10, FV = 20, flowers = [], gLin = (hex) => { const c = new THREE.Color(hex).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
    const GC = { vineA: gLin(0x3f5226), vineB: gLin(0x5a4a2a), leafA: gLin(0x3f7a34), leafB: gLin(0x285526), stem: gLin(0x6f9a3c), white: gLin(0xe4e0d2), throat: gLin(0xb9c47c) };
    const petMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, side: THREE.DoubleSide, emissive: new THREE.Color(0.92, 0.88, 0.74), emissiveIntensity: 0 });
    const greenMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, side: THREE.DoubleSide });
    // one flower, as a bud and open (the rim creased into a five-pointed star, I6)
    const bud = [], open = [], fcol = [], fidx = [];
    for (let i = 0; i <= FU; i++) for (let j = 0; j < FV; j++) { const u = i / FU, th = (j / FV) * TAU, cr = Math.cos(5 * th), u3 = u * u * u;
      const ro = (0.011 + 0.108 * Math.pow(u, 2.3)) * (1 + 0.08 * cr * u3), ho = 0.135 * Math.pow(u, 0.7) - 0.022 * Math.pow(u, 5) + 0.012 * cr * u3; open.push(ro * Math.cos(th), ho, ro * Math.sin(th));
      const tb = th + 2.4 * u, rb = (0.008 + 0.026 * Math.pow(Math.sin(PI * Math.min(1, u * 0.96 + 0.03)), 0.8) * (1 - 0.42 * u)) * (1 + 0.14 * Math.cos(5 * th) * Math.sin(PI * u)); bud.push(rb * Math.cos(tb), 0.165 * u, rb * Math.sin(tb));
      const c = [lerp(GC.throat[0], GC.white[0], sm(0.05, 0.5, u)), lerp(GC.throat[1], GC.white[1], sm(0.05, 0.5, u)), lerp(GC.throat[2], GC.white[2], sm(0.05, 0.5, u))], sh = (1 - 0.30 * Math.pow(Math.max(0, cr), 4) * u) * (0.82 + 0.18 * u); fcol.push(c[0] * sh, c[1] * sh, c[2] * sh); }
    for (let i = 0; i < FU; i++) for (let j = 0; j < FV; j++) { const a = i * FV + j, b = i * FV + (j + 1) % FV, c = a + FV, d = b + FV; fidx.push(a, c, b, b, c, d); }
    // its green cup and its stalk
    const cup = wBag(); for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU + 0.3; wLeaf(cup, V3(0, 0.004, 0), V3(Math.cos(a) * 0.55, 1, Math.sin(a) * 0.55), V3(Math.cos(a), -0.3, Math.sin(a)), 0.045, 0.016, GC.stem, GC.leafA); }
    wTube(cup, [V3(0.012, -0.10, 0.0), V3(0.016, -0.06, 0.004), V3(0.008, -0.025, 0), V3(0, 0.004, 0)], (i) => [0.0045, 0.0042, 0.0045, 0.008][i], 6, () => GC.stem); const cupGeo = wMesh(cup).geometry;
    const angOf = (i) => (i / NF) * TAU + 0.26 + 0.10 * Math.sin(i * 2.7), ringP = (a, out) => { const r = R0 + 0.045 * Math.sin(5 * a + 1); return out.set(r * Math.sin(a), 0.030 + 0.014 * Math.sin(7 * a), r * Math.cos(a)); };       // a = 0 is straight in front of her
    for (let i = 0; i < NF; i++) { const a = angOf(i), g = new THREE.Group(), p = ringP(a, V3()), geo = new THREE.BufferGeometry(), pos = new THREE.BufferAttribute(new Float32Array(bud), 3); pos.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('position', pos); geo.setAttribute('color', new THREE.Float32BufferAttribute(fcol, 3)); geo.setIndex(fidx); geo.computeVertexNormals();
      const pet = new THREE.Mesh(geo, petMat), cp = new THREE.Mesh(cupGeo, greenMat), tilt = new THREE.Group(); pet.frustumCulled = false; pet.castShadow = true; cp.castShadow = true;
      g.position.set(p.x, p.y, p.z); g.rotation.y = a; tilt.position.y = 0.105; tilt.rotation.set(0.50 + 0.25 * wHash(i * 3.3), 0, (wHash(i * 5.1) - 0.5) * 0.5); tilt.add(pet); tilt.add(cp); g.add(tilt); G.add(g);       // each leans outward, away from her, and a little to one side
      flowers.push({ g, tilt, pet, pos, a, p, e: -1, lean: tilt.rotation.x, tip: V3() }); }
    // the vine round the ring: two strands twisted together, shown outward from where each seed fell
    const near = (a) => { let m = 9; for (const f of flowers) { let d = Math.abs(a - f.a) % TAU; if (d > PI) d = TAU - d; m = Math.min(m, d); } return m / (PI / NF) * 0.5; };       // 0 at a flower .. about 1 midway between two
    const vine = (() => { const bag = wBag(); wBraid(bag, (t) => ringP(t * TAU, V3()), () => 0.021, () => 0.021, 2, 26, 300, 5, 0.9, (t, k) => k ? GC.vineB : GC.vineA, (t) => near(t * TAU));
      for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU + 0.11, p = ringP(a, V3()), q = p.clone().add(V3(Math.sin(a + 1.3) * 0.07, 0.035, Math.cos(a + 1.3) * 0.07)); wTube(bag, [p, p.clone().lerp(q, 0.5).add(V3(0, 0.03, 0)), q, q.clone().add(V3(Math.sin(a) * 0.012, 0.014, -0.01))], (j) => [0.004, 0.0032, 0.0024, 0.0012][j], 4, () => GC.stem, () => near(a) + 0.15); }       // tendrils
      const m = wMesh(bag, greenMat, true); G.add(m); return m; })();
    // heart-shaped leaves along it, and small white star-flowers between the big ones
    const heart = (() => { const pos = [0, 0.006, 0.020], col = [...GC.leafB], idx = [], N = 14; for (let i = 0; i <= N; i++) { const t = (i / N) * TAU, x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); pos.push(x * 0.0027, 0.004 * Math.cos(t * 2), (13 - y) * 0.0027 - 0.022); const c = wMix(GC.leafA, GC.leafB, 0.5 + 0.5 * Math.sin(i * 2.1)); col.push(c[0], c[1], c[2]); }
      for (let i = 1; i <= N; i++) idx.push(0, i + 1, i); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; })();
    const NL = 52, leaves = new THREE.InstancedMesh(heart, greenMat, NL), leafAt = [], NS = 26, starG = (() => { const b = wBag(); wStar(b, V3(0, 0, 0), V3(0, 1, 0), 0.019); return wMesh(b).geometry; })(), stars = new THREE.InstancedMesh(starG, petMat, NS), starAt = [], dm = new THREE.Object3D();
    leaves.castShadow = true; leaves.frustumCulled = false; stars.frustumCulled = false; G.add(leaves); G.add(stars);
    for (let i = 0; i < NL; i++) { const a = (i / NL) * TAU + 0.05 * Math.sin(i * 3.3), p = ringP(a, V3()), out = (i % 2 ? 1 : -1) * (0.035 + 0.05 * wHash(i * 1.7)); leafAt.push({ p: V3(p.x + Math.sin(a) * out, p.y + 0.018 + 0.03 * wHash(i * 2.9), p.z + Math.cos(a) * out), ry: a + (i % 2 ? 0 : PI) + (wHash(i) - 0.5) * 1.2, rx: -0.25 - 0.5 * wHash(i * 4.3), s: 0.85 + 0.75 * wHash(i * 6.1), k: near(a) }); }
    for (let i = 0; i < NS; i++) { const a = (i / NS) * TAU + 0.13 + 0.06 * Math.sin(i * 1.9), p = ringP(a, V3()), out = (wHash(i * 3.7) - 0.5) * 0.13; starAt.push({ p: V3(p.x + Math.sin(a) * out, p.y + 0.035 + 0.04 * wHash(i * 5.3), p.z + Math.cos(a) * out), rx: (wHash(i * 7.7) - 0.5) * 0.9, rz: (wHash(i * 8.3) - 0.5) * 0.9, k: near(a) }); }
    // the threads of light the flying seeds trail (H11, right): one strip for all twelve
    const TM = 12, thPos = new THREE.BufferAttribute(new Float32Array(NF * (TM + 1) * 6), 3), thUv = new THREE.BufferAttribute(new Float32Array(NF * (TM + 1) * 4), 2), thIdx = []; thPos.setUsage(THREE.DynamicDrawUsage); thUv.setUsage(THREE.DynamicDrawUsage);
    for (let f = 0; f < NF; f++) for (let i = 0; i < TM; i++) { const a = (f * (TM + 1) + i) * 2; thIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const thG = new THREE.BufferGeometry(); thG.setAttribute('position', thPos); thG.setAttribute('uv', thUv); thG.setIndex(thIdx); const threads = new THREE.Mesh(thG, ribMat(FXC.pearl, FXC.gold)); threads.frustumCulled = false; threads.renderOrder = 19; threads.visible = false; fxG.add(threads);
    const seedAt = (f, from, u, out) => { const e = u, a = (1 - e) * (1 - e), b = 2 * e * (1 - e), c = e * e, L = f.p; return out.set(a * from.x + b * (from.x * 0.4 + L.x * 0.6) + c * L.x, a * from.y + b * (from.y + 0.75) + c * L.y, a * from.z + b * (from.z * 0.4 + L.z * 0.6) + c * L.z); };
    const tA = V3(), tB = V3(), tS = V3();
    return { G, flowers, NF, R0, angOf, ringP, seedAt, threads,
      // fly[i]: how far seed i is along its way (under 0: not thrown; over 1: landed); from[i]: the hand it left
      setThreads(fly, from, view) { let any = false; for (let f = 0; f < NF; f++) { const u1 = fly[f], on = u1 > 0 && u1 < 1.25;
          for (let i = 0; i <= TM; i++) { const u = cl(u1 - 0.34 * (1 - i / TM), 0, 1), v = (f * (TM + 1) + i) * 2; seedAt(flowers[f], from[f], u, tA); seedAt(flowers[f], from[f], Math.min(1, u + 0.02), tB); tS.copy(tB).sub(tA).cross(view).normalize().multiplyScalar(on ? 0.007 : 0);
            thPos.setXYZ(v, tA.x + tS.x, tA.y + tS.y, tA.z + tS.z); thPos.setXYZ(v + 1, tA.x - tS.x, tA.y - tS.y, tA.z - tS.z); const al = on ? (i / TM) * (1 - sm(1.0, 1.25, u1)) : 0; thUv.setXY(v, al, 0); thUv.setXY(v + 1, al, 1); } any = any || on; }
        thPos.needsUpdate = thUv.needsUpdate = true; threads.visible = any; },
      // shoot[i]: how far flower i's stalk and bud have risen; open[i]: how far it has opened; vine: how far the vine has crept (0..1); lit: how brightly the open flowers glow; gone: all of it sinking away at the end
      set(shoot, open2, vineK, lit, gone) { G.visible = true; const keep = 1 - gone;
        for (let f = 0; f < NF; f++) { const F = flowers[f], s = sm(0, 1, shoot[f]) * keep, e = cl(open2[f], 0, 1); F.g.visible = s > 0.004; if (!F.g.visible) continue; F.g.scale.setScalar(Math.max(0.001, lerp(0.30, 1, s) * sm(0, 0.25, s)));
          F.tilt.position.y = 0.105 * s; F.tilt.rotation.x = lerp(0.12, F.lean, sm(0.2, 1, e)); F.tilt.scale.setScalar(lerp(0.42, 1.0, sm(0, 0.8, e) * 0.75 + 0.25 * s));
          if (Math.abs(e - F.e) > 0.004) { F.e = e; const q = e * e * (3 - 2 * e), A = F.pos.array; for (let i = 0; i < A.length; i++) A[i] = bud[i] + (open[i] - bud[i]) * q; F.pos.needsUpdate = true; F.pet.geometry.computeVertexNormals(); } }
        wRange(vine, -1, vineK * 1.25 * keep - 0.02); vine.visible = vineK * keep > 0.01;
        for (let i = 0; i < NL; i++) { const L = leafAt[i], k = sm(L.k, L.k + 0.3, vineK * 1.4) * keep; dm.position.copy(L.p); dm.rotation.set(L.rx, L.ry, 0, 'YXZ'); dm.scale.setScalar(Math.max(0.0001, k * L.s)); dm.updateMatrix(); leaves.setMatrixAt(i, dm.matrix); } leaves.instanceMatrix.needsUpdate = true;
        for (let i = 0; i < NS; i++) { const S = starAt[i], k = sm(S.k + 0.5, S.k + 0.75, vineK * 1.75) * keep; dm.position.copy(S.p); dm.rotation.set(S.rx, i, S.rz); dm.scale.setScalar(Math.max(0.0001, k)); dm.updateMatrix(); stars.setMatrixAt(i, dm.matrix); } stars.instanceMatrix.needsUpdate = true;
        petMat.emissiveIntensity = 0.03 + 0.27 * lit; },
      // the middle of flower i's open face, in her frame (where its light and its motes come from)
      face(i, out) { const F = flowers[i]; G.updateMatrixWorld(true); return out.set(0, 0.10, 0).applyMatrix4(F.tilt.matrixWorld).applyMatrix4(_inv); },
      hide() { G.visible = false; threads.visible = false; } };
  })();
  // a second friend for spells that heal the whole party, and the leaves of her floating book (H11: "its pages lifting")
  const ALLY2 = ALLY.clone(); ALLY2.visible = false; fxG.add(ALLY2); FXW.ally2 = 0;
  const PAGES = new THREE.Group(); PAGES.visible = false; fxG.add(PAGES);
  { const pos = [], idx = [], NP = 7, W = 0.138, H = 0.186; for (let i = 0; i <= NP; i++) { const t = i / NP, x = W * t, z = 0.020 * Math.sin(PI * t) * (1 - 0.3 * t); pos.push(x, -H / 2, z, x, H / 2, z); if (i < NP) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xe9dcba).convertSRGBToLinear(), roughness: 0.8, side: THREE.DoubleSide, emissive: new THREE.Color(0.16, 0.13, 0.07) });
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(g, mat); m.position.set(0, 0, 0.012); m.castShadow = true; PAGES.add(m); } }
  // lay the fluttering leaves on the book, wherever it is; k: how much they lift
  function pagesSet(k, t) { PAGES.visible = k > 0.01; if (!PAGES.visible) return; PAGES.position.copy(SK.book.position); PAGES.quaternion.copy(SK.book.quaternion); PAGES.scale.copy(SK.book.scale);
    PAGES.children.forEach((m, i) => { const th = PI * (0.5 + 0.34 * Math.sin(t * (1.1 + 0.23 * i) + i * 1.7)) , lift = lerp(i % 2 ? 0.12 : PI - 0.12, th, k); m.rotation.y = -lift; }); }
