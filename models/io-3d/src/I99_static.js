
  // ---------- materials (stage one) ----------
  const tBody = bakedTex('body', 2048, 1408, '#17131a'); tBody.wrapS = THREE.RepeatWrapping;
  const tLace = bakedTex('lace', 1024, 1024, '#17131a'); tLace.wrapS = tLace.wrapT = THREE.MirroredRepeatWrapping; tLace.repeat.set(1, 1);
  const SKIN_C = (BAKED && BAKED.skinChest) || SKIN || '#c99a80', SKIN_L = (BAKED && BAKED.skin) || SKIN_C, lit = (o) => Object.assign({ roughness: 0.70, envMapIntensity: 0.2 }, o);
  const MATS = {
    // the wrapped painting carries its own soft studio light, so most of it is shown as it was painted and only a little is lit again
    torso: sheen(std({ map: tBody, color: lin('#b9b2b6'), roughness: 0.74, envMapIntensity: 0.25, emissive: lin('#ffffff'), emissiveMap: tBody, emissiveIntensity: 0.34 }), '#8fa4d8', 3, 0.06),
    skin: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_L)), emissive: lin(SKIN_L), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    form: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_C)), emissive: lin(SKIN_C), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    hand: (() => { const t = bakedTex('hands', 1024, 1024, SKIN_L); return sheen(std({ map: t, color: lin('#d8ccc6'), roughness: 0.62, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.40 }), '#ffb49a', 3.2, 0.08); })(),
    nail: phys({ color: lin('#d9a79a'), roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2 }),
    // the skirt's lace is a piece of painting B4, repeated; it is solid for now (the see-through lace needs the round 2 lace square)
    skirt: sheen(std({ map: tLace, color: lin('#a8a0a4'), roughness: 0.86, envMapIntensity: 0.15, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: tLace, emissiveIntensity: 0.30 }), '#7a6470', 3, 0.10),
    tulle: std({ color: lin('#0f0c10'), roughness: 0.95, side: THREE.DoubleSide, transparent: true, opacity: 0.62, depthWrite: false }),
    band: std({ color: lin('#17131a'), roughness: 0.9 }),
    boot: (() => { const n = crinkleTex(), k = new THREE.Vector2(0.9, 0.9); return std({ color: lin('#1c1512'), roughness: 0.30, envMapIntensity: 0.95, normalMap: n, normalScale: k }); })(),
    sole: std({ map: soleTex(), color: lin('#8a8280'), roughness: 0.86 }),
    stitch: std({ color: lin('#b08d4a'), roughness: 0.8 }), eyelet: std({ color: lin('#b9914a'), roughness: 0.34, metalness: 1, envMapIntensity: 1.4 }), aglet: std({ color: lin('#b9914a'), roughness: 0.35, metalness: 1 }),
    lace: std({ color: lin('#161316'), roughness: 0.9 }),
    sock: std({ map: sockTexIo(), color: lin('#d9d2d0'), roughness: 0.96 }),
    cloth: std({ color: lin('#1a1518'), roughness: 0.9 })
  };

  // ---------- bind: one skinned mesh per material ----------
  const root = new THREE.Group(); root.name = 'io';
  root.add(SK.hips); root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  const meshes = {};
  let triCount = 0;
  for (const key in buckets) {
    const B = buckets[key], g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(B.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(B.sw, 4));
    g.setIndex(B.n > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }
  // stage one has no motion yet: pose() sets a few bone turns by hand, for checking her against the paintings
  function animate() {}
  function pose(o) {
    o = o || {}; const arm = (o.arm == null ? 15 : o.arm) * DEG - A_POSE, leg = (o.leg || 0) * DEG;
    for (const [S, s] of SIDES) { SK['uarm' + S].rotation.set(0, 0, s * arm); SK['thigh' + S].rotation.set(0, 0, s * leg); SK['foot' + S].rotation.set(0, 0, -s * leg); }
    root.updateMatrixWorld(true);
  }
  return { root, skeleton, bones, SK, animate, pose, meshes, spin: 0, time: 0, stanceProgress: 1, setStance() {}, play() {}, debug: { SK, meshes, cloths: [] }, get triangles() { return triCount; } };
}
