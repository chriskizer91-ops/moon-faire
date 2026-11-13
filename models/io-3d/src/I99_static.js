
  // ---------- materials ----------
  const tBody = bakedTex('body', 2048, 1408, '#17131a'); tBody.wrapS = THREE.RepeatWrapping;
  const tLace = bakedTex('lace', 1024, 1024, '#17131a'); tLace.wrapS = tLace.wrapT = THREE.MirroredRepeatWrapping; tLace.repeat.set(1, 1);
  const SKIN_C = (BAKED && BAKED.skinChest) || SKIN || '#c99a80', SKIN_L = (BAKED && BAKED.skin) || SKIN_C, lit = (o) => Object.assign({ roughness: 0.70, envMapIntensity: 0.2 }, o);
  const tHair = hairTexIo(HAIRC), tHairB = hairTexIo(HAIRC, true), tHairA = hairAlphaIo();       // one set of hair pictures, shared by every hair material
  const MATS = {
    // the wrapped painting carries its own soft studio light, so most of it is shown as it was painted and only a little is lit again
    torso: sheen(std({ map: tBody, color: lin('#b9b2b6'), roughness: 0.74, envMapIntensity: 0.25, emissive: lin('#ffffff'), emissiveMap: tBody, emissiveIntensity: 0.34 }), '#8fa4d8', 3, 0.06),
    skin: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_L)), emissive: lin(SKIN_L), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    form: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_C)), emissive: lin(SKIN_C), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    // the head wears three pictures at once, mixed by which way the skin faces (see buildHead): the front painting, the profile painting, plain skin
    face: (() => {
      const t = faceT;
      const m = sheen(std({ map: t, color: lin('#b9b2b6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.06);
      const ts = bakedTex('faceSide', 512, 512, SKIN_C), ta = bakedTex('faceSideA', 512, 512, '#000000'), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        sh.uniforms.uSide = { value: ts }; sh.uniforms.uSideA = { value: ta }; sh.uniforms.uPlain = { value: lin(SKIN_C) }; sh.uniforms.uPlain2 = { value: lin((BAKED && BAKED.skinNeck) || '#ad7a59') };       // plain skin: her chest's tone at the foot of the neck (faceMix.w = 0), her neck's tone above (1)
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 faceMix; attribute vec2 uvSide; varying vec4 vFaceMix; varying vec2 vUvSide;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFaceMix = faceMix; vUvSide = uvSide;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSide; uniform sampler2D uSideA; uniform vec3 uPlain; uniform vec3 uPlain2; varying vec4 vFaceMix; varying vec2 vUvSide; vec3 gFaceCol;')
          .replace('#include <map_fragment>', 'vec4 texelColor = mapTexelToLinear( texture2D( map, vUv ) );\n float fSide = texture2D( uSideA, vUvSide ).r * vFaceMix.x;\n vec3 sideCol = mapTexelToLinear( texture2D( uSide, vUvSide ) ).rgb;\n gFaceCol = ( texelColor.rgb * max( 0.0, 1.0 - fSide - vFaceMix.y ) + sideCol * fSide + mix( uPlain, uPlain2, vFaceMix.w ) * vFaceMix.y ) * vFaceMix.z;\n diffuseColor.rgb *= gFaceCol;')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gFaceCol;');
      };
      return m;
    })(),
    // her hair: tresses of strands in her own colours (the inner layers a shade darker), over a plain dark sheet; the fringe is locks and wisps of separate strands
    tress: sheen(std({ map: tHair, alphaMap: tHairA, alphaTest: 0.5, bumpMap: tHairB, bumpScale: 0.0016, color: lin('#d6cdcb'), roughness: 0.48, envMapIntensity: 0.30, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: tHair, emissiveIntensity: 0.24 }), '#e8c9a8', 3, 0.10),
    tressIn: std({ map: tHair, alphaMap: tHairA, alphaTest: 0.5, bumpMap: tHairB, bumpScale: 0.0016, color: lin('#8e8583'), roughness: 0.60, envMapIntensity: 0.2, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: tHair, emissiveIntensity: 0.14 }),
    wisp: std({ map: tHair, alphaMap: wispAlphaIo(), alphaTest: 0.42, color: lin('#e6dcd8'), roughness: 0.55, envMapIntensity: 0.2, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: tHair, emissiveIntensity: 0.34 }),
    lock: std({ map: tHair, alphaMap: tHairA, alphaTest: 0.5, color: lin('#dcd2ce'), roughness: 0.55, envMapIntensity: 0.2, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: tHair, emissiveIntensity: 0.30 }),
    hairmass: std({ map: tHair, color: lin('#8e8583'), roughness: 0.75, envMapIntensity: 0.1, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: tHair, emissiveIntensity: 0.20 }),
    // the hat: felt and lace from the swatches in F9, horn from F9, gold and silver for the chain and charms
    felt: (() => { const t = bakedTex('felt', 512, 512, (BAKED && BAKED.feltCol) || '#481324'); t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; return sheen(std({ map: t, color: lin('#cfc4c8'), roughness: 0.96, envMapIntensity: 0.12, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.30 }), '#e58aa8', 3, 0.16); })(),
    brim: (() => { const t = brimTexIo(); return sheen(std({ map: t, color: lin('#cfc4c8'), roughness: 0.96, envMapIntensity: 0.12, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.30 }), '#e58aa8', 3, 0.14); })(),
    hatband: (() => { const t = bakedTex('hatband', 512, 512, '#1a1518'); t.wrapS = THREE.MirroredRepeatWrapping; return std({ map: t, color: lin('#d9d2d6'), roughness: 0.9, envMapIntensity: 0.15, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.25 }); })(),
    horn: (() => { const t = bakedTex('horn', 256, 256, '#e2d2b4'); t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; return std({ map: t, color: lin('#f0e8e0'), roughness: 0.42, envMapIntensity: 0.5, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.18 }); })(),
    gold: std({ color: lin('#d0a045'), metalness: 1, roughness: 0.32, envMapIntensity: 1.5 }),
    silver: std({ color: lin('#c9c6cc'), metalness: 1, roughness: 0.34, envMapIntensity: 1.4 }),
    // glasses (C14): antique bronze wire, clear lenses that catch a little light
    wire: std({ color: lin('#4a3a2a'), metalness: 0.85, roughness: 0.40, envMapIntensity: 1.2 }),
    pad: phys({ color: lin('#d8d2cc'), transparent: true, opacity: 0.55, roughness: 0.2 }),
    lens: phys({ color: lin('#e9e4f2'), transparent: true, opacity: 0.10, roughness: 0.04, metalness: 0, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide }),
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
    if (key === 'face') { g.setAttribute('faceMix', new THREE.Float32BufferAttribute(faceMix, 4)); g.setAttribute('uvSide', new THREE.Float32BufferAttribute(faceUvS, 2)); }
    g.setIndex(B.n > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key; m.castShadow = !/^(lens|pad|wisp)$/.test(key); m.receiveShadow = true; m.frustumCulled = false;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }
  // stage one has no motion yet: pose() sets a few bone turns by hand, for checking her against the paintings
  function animate() {}
  function pose(o) {
    o = o || {}; const arm = (o.arm == null ? 15 : o.arm) * DEG - A_POSE, leg = (o.leg || 0) * DEG;
    for (const [S, s] of SIDES) { SK['uarm' + S].rotation.set(0, 0, s * arm); SK['thigh' + S].rotation.set(0, 0, s * leg); SK['foot' + S].rotation.set(0, 0, -s * leg); }
    root.updateMatrixWorld(true);
  }
  return { root, skeleton, bones, SK, animate, pose, meshes, spin: 0, time: 0, stanceProgress: 1, setStance() {}, play() {}, setFace: (eyes, mouth) => paintFace(eyes || 0, mouth || 'rest'), debug: { SK, meshes, cloths: [], headPoint, headHalfW, JH, HC, FC }, get triangles() { return triCount; } };
}
