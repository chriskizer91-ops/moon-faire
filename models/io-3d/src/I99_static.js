
  // ---------- materials ----------
  const tBody = bakedTex('body', 2048, 1408, '#17131a'); tBody.wrapS = THREE.RepeatWrapping;
  const tLace = bakedTex('lace', 1024, 1024, '#17131a'); tLace.wrapS = tLace.wrapT = THREE.MirroredRepeatWrapping; tLace.repeat.set(1, 1);
  const SKIN_C = (BAKED && BAKED.skinChest) || SKIN || '#c99a80', SKIN_L = (BAKED && BAKED.skin) || SKIN_C, lit = (o) => Object.assign({ roughness: 0.70, envMapIntensity: 0.2 }, o);
  const tHair = hairTexIo(HAIRC), tHairB = hairTexIo(HAIRC, true), tHairA = hairAlphaIo();       // one set of hair pictures, shared by every hair material
  const MATS = {
    // the wrapped painting carries its own soft studio light, so most of it is shown as it was painted and only a little is lit again
    torso: sheen(std({ map: tBody, color: lin('#b9b2b6'), roughness: 0.74, envMapIntensity: 0.25, emissive: lin('#ffffff'), emissiveMap: tBody, emissiveIntensity: 0.34 }), '#8fa4d8', 3, 0.06),
    skin: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_L)), emissive: lin(SKIN_L), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    arm: (() => { const t = bakedTex('arms', 512, 1024, SKIN_L); return sheen(std(lit({ map: t, color: lin('#b9b2b6'), emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06); })(),
    robe: (() => { const t = robeTexIo(); return sheen(std({ map: t, color: lin('#b0a9ab'), roughness: 0.84, envMapIntensity: 0.15, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.27 }), '#ff9aa8', 3, 0.10); })(),
    moss: (() => { const t = mossTexIo(); return std({ map: t, alphaTest: 0.5, color: lin('#b8b8b0'), roughness: 0.95, envMapIntensity: 0.1, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.32, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); })(),
    fern: (() => { const t = fernTexIo(); return std({ map: t, alphaTest: 0.5, color: lin('#b8b8b0'), roughness: 0.9, envMapIntensity: 0.1, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.32 }); })(),
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
    hand: (() => { const t = bakedTex('hands', 1024, 1024, SKIN_L); return sheen(std(lit({ map: t, color: lin('#b9b2b6'), emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06); })(),
    handR: (() => { const t = bakedTex('handsR', 1024, 1024, SKIN_L); return sheen(std(lit({ map: t, color: lin('#b9b2b6'), emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06); })(),
    nail: BAKED && BAKED.hands ? phys({ color: lin('#ecc9c0'), transparent: true, opacity: 0.20, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15, depthWrite: false }) : phys({ color: lin('#d9a79a'), roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2 }),      // her nails are painted on her fingers (D1, D2); the plate is only their gloss
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

  MATS.propGold = MATS.gold; MATS.sickleGold = MATS.gold; MATS.propLeather = std({ color: lin('#1c1614'), roughness: 0.6, envMapIntensity: 0.3 }); MATS.propWood = std({ color: lin('#2a1c16'), roughness: 0.5, envMapIntensity: 0.4 }); MATS.sickleGrip = MATS.propWood;
  { const tc = bookCoverTexIo(), tp = bookPageTexIo(), cov = () => std({ map: tc, color: lin('#c8c0bc'), roughness: 0.62, envMapIntensity: 0.25, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: tc, emissiveIntensity: 0.22 }), pg = () => std({ map: tp, color: lin('#cfc8c0'), roughness: 0.9, side: THREE.DoubleSide, emissive: lin('#ffffff'), emissiveMap: tp, emissiveIntensity: 0.30 });
    MATS.bookShut = cov(); MATS.bookOpen = cov(); MATS.bookShutPg = pg(); MATS.bookOpenPg = pg(); MATS.bookRibbon = std({ color: lin('#8a1f2c'), roughness: 0.8, side: THREE.DoubleSide }); }
  MATS.gearGold = MATS.gold; MATS.gearSilver = MATS.silver;       // the same metals as her hat's, kept as their own parts so the page can hide them
  MATS.leather = std({ color: lin('#2e221d'), roughness: 0.62, envMapIntensity: 0.3 }); MATS.bead = std({ color: lin('#151211'), roughness: 0.28, envMapIntensity: 0.9 }); MATS.wood = std({ color: lin('#5b3320'), roughness: 0.5, envMapIntensity: 0.4 });
  MATS.crystal = phys({ color: lin('#eef4fb'), roughness: 0.06, transparent: true, opacity: 0.66, envMapIntensity: 1.6, emissive: lin('#cfe0f5'), emissiveIntensity: 0.20 });
  // ---------- bind: one skinned mesh per material ----------
  const root = new THREE.Group(); root.name = 'io';
  root.add(SK.hips); if (SK.book) root.add(SK.book); root.add(fxG); root.updateMatrixWorld(true);       // her book is not carried by her body: it has its own place every frame
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
  // ---------- motion ----------
  // pose() holds her still, for checking her against the paintings. play(name) starts one of her own moves:
  //   'idle' she stands and breathes; 'walk'; 'talk' (one open hand, small nods, her painted mouths);
  //   and seven short ones that end by themselves and go back to 'idle': 'glasses' (she pushes them up), 'hat' (she tips it),
  //   'curtsey', 'twirl', 'herb' (she kneels, picks a sprig and smells it), 'wave', 'look' (over each shoulder).
  // They are her poses and emotes, not her attacks. They are also the test of her hair and skirt: every frame the bones go back to
  // rest, the move is laid on top (restAll, add), her feet and hands are brought to where they should be (ik2, aimHand, flatFoot),
  // and then the soft chains of her hair and skirt are stepped (softTick).
  const _inv = new THREE.Matrix4(), _m4 = new THREE.Matrix4(), _mb = new THREE.Matrix4(), _p = V3(), _c = V3(), _t = V3(), _t2 = V3(), _n = V3(), _d = V3(), _e = V3(), _s = V3();
  const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qc = new THREE.Quaternion(), AX = V3(1, 0, 0), AY = V3(0, 1, 0);
  const BODY = Object.keys(SK).filter((k) => !/_\d+$/.test(k));               // every bone but the soft chains
  const add = (b, x, y, z) => { const r = SK[b].rotation; r.x += x; r.y += y; r.z += z; };
  function restAll() { for (const k of BODY) SK[k].rotation.set(0, 0, 0); SK.hips.position.copy(SK.hips.userData.home); }
  function sync() { root.updateMatrixWorld(true); _inv.copy(root.matrixWorld).invert(); }
  const rootQuat = (bone, out) => out.setFromRotationMatrix(_m4.multiplyMatrices(_inv, bone.matrixWorld));       // a bone's turn, in her own space
  const carried = (bone, x, y, z, out) => (out || V3()).set(x, y, z).sub(SK[bone].userData.rest).applyMatrix4(SK[bone].matrixWorld).applyMatrix4(_inv);   // a point of her rest pose, where its bone has carried it

  // ----- balls her hair ('h') and her skirt ('s') cannot pass into, each carried by a bone ('hs': both) -----
  const COL = [];
  const ball = (bone, x, y, z, r, g) => COL.push({ bone: SK[bone], off: V3(x, y, z).sub(SK[bone].userData.rest), rest: V3(x, y, z), r, g, p: V3() });
  ball('neck', 0, 1.385, -0.022, 0.050, 'h'); ball('spine3', 0, 1.300, -0.030, 0.078, 'h'); ball('spine3', -0.058, 1.245, 0.002, 0.086, 'h'); ball('spine3', 0.058, 1.245, 0.002, 0.086, 'h');
  ball('spine2', 0, 1.165, 0.002, 0.092, 'h'); ball('spine1', 0, 1.075, -0.004, 0.080, 'h'); ball('hips', 0, 0.955, -0.020, 0.135, 'h');
  for (const [S] of SIDES) {
    const sh = restPts['sh' + S], d = armDir[S];
    [['uarm', 0, 0.048], ['uarm', 0.08, 0.043], ['uarm', 0.16, 0.039], ['farm', 0.232, 0.037], ['farm', 0.30, 0.035], ['farm', 0.37, 0.030], ['hand', 0.484, 0.033], ['hand', 0.544, 0.026]].forEach(([b, sl, r]) => { const p = sh.clone().addScaledVector(d, sl); ball(b + S, p.x, p.y, p.z, r, 'hs'); });
    const hip = SK['thigh' + S].userData.rest, kn = SK['shin' + S].userData.rest, an = SK['foot' + S].userData.rest, T = (a, b, t) => a.clone().lerp(b, t);
    [['thigh', T(hip, kn, 0.06), 0.094], ['thigh', T(hip, kn, 0.18), 0.092], ['thigh', T(hip, kn, 0.31), 0.086], ['thigh', T(hip, kn, 0.46), 0.078], ['thigh', T(hip, kn, 0.64), 0.071], ['thigh', T(hip, kn, 0.82), 0.065], ['shin', kn.clone(), 0.063], ['shin', T(kn, an, 0.22), 0.058], ['shin', T(kn, an, 0.45), 0.055], ['shin', T(kn, an, 0.70), 0.049], ['foot', V3(an.x, 0.08, 0.0), 0.055], ['foot', V3(an.x, 0.05, 0.07), 0.050]].forEach(([b, p, r]) => ball(b + S, p.x, p.y, p.z, r, 'g'));       // 'g': her legs, for the things on her belt and her sleeve points; her skirt uses LEGCAP below
  }
  // ----- her legs as six tapered tubes, for her skirt and her cloak (stage nine) -----
  // Chris, November 13: "the legs pass through the clothes a lot". Her legs were rows of balls, and only the joints of the skirt's
  // chains were kept out of them: a thigh could pass between two balls, between two joints, or between two chains. Now each leg is
  // three tubes with no gaps; every stretch of chain is tested at its end and at two points along it; and the same six tubes are
  // given to the cloth's own drawing (legPush), which moves any point of cloth that is still inside a leg straight out of it.
  // A point is never pushed further from a leg than it lies when she stands, so standing she looks as she did.
  const LEGCAP = [];
  for (const [S] of SIDES) { const hip = SK['thigh' + S].userData.rest, kn = SK['shin' + S].userData.rest, an = SK['foot' + S].userData.rest;
    for (const [b, A0, B0, r0, r1] of [['thigh', hip.clone(), kn.clone(), 0.098, 0.070], ['shin', kn.clone(), an.clone(), 0.072, 0.070], ['foot', V3(an.x, 0.072, an.z - 0.008), V3(an.x, 0.052, 0.112), 0.070, 0.058]])
      LEGCAP.push({ bone: SK[b + S], A0, B0, r0, r1, offA: A0.clone().sub(SK[b + S].userData.rest), offB: B0.clone().sub(SK[b + S].userData.rest), A: A0.clone(), B: B0.clone() }); }
  const capRest = (c, pt) => { const ab = c.B0.clone().sub(c.A0), t = cl(pt.clone().sub(c.A0).dot(ab) / ab.lengthSq(), 0, 1); return pt.distanceTo(c.A0.clone().addScaledVector(ab, t)); };       // how far a point of her rest pose lies from a tube
  const CAPF = [1, 0.66, 0.33], CAPN = 6, HIP = V3(), LEGS = []; LEGCAP.forEach((c, ci) => { for (let k = 0; k < CAPN; k++) LEGS.push({ c, ci, t: k / (CAPN - 1), r: lerp(c.r0, c.r1, k / (CAPN - 1)), p: V3() }); });
  const LEGU = { uCapA: { value: LEGCAP.map((c) => c.A) }, uCapB: { value: LEGCAP.map((c) => c.B) }, uCapA0: { value: LEGCAP.map((c) => c.A0) }, uCapB0: { value: LEGCAP.map((c) => c.B0) }, uCapR: { value: LEGCAP.map((c) => new THREE.Vector2(c.r0, c.r1)) }, uHip: { value: HIP } };
  // legPush: each layer keeps a little further off her leg than the one under it, so they do not flicker where they are pressed together
  const LEGPAD = { band: 0.004, tulle: 0.007, skirt: 0.010, robe: 0.015, moss: 0.017, fern: 0.017 };
  // Her sleeves do not go round her legs, they only meet them (a hand on a knee). A sleeve point inside a leg, or just under one, is
  // lifted onto it if the leg lies level (a raised thigh), so a sleeve lies on her lap; out of a leg that stands it is moved straight out.
  for (const key in LEGPAD) { const mesh = meshes[key]; if (!mesh) continue; const g = mesh.geometry, si = g.attributes.skinIndex.array, sw = g.attributes.skinWeight.array, n = g.attributes.position.count, mode = new Float32Array(n);
    for (let i = 0; i < n; i++) for (let q = 0; q < 4; q++) if (sw[i * 4 + q] > 0.2 && /^(sl[RL]\d_|svt|uarm|farm|hand|clav)/.test(bones[si[i * 4 + q]].name)) mode[i] = 1;
    g.setAttribute('capMode', new THREE.Float32BufferAttribute(mode, 1)); }
  for (const key in LEGPAD) { const pad = LEGPAD[key], m = MATS[key]; if (!m) continue; const first = m.onBeforeCompile;
    m.onBeforeCompile = (sh) => { if (first) first(sh); Object.assign(sh.uniforms, LEGU); sh.uniforms.uCapPad = { value: pad };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float capMode; uniform vec3 uCapA[6]; uniform vec3 uCapB[6]; uniform vec3 uCapA0[6]; uniform vec3 uCapB0[6]; uniform vec2 uCapR[6]; uniform float uCapPad; uniform vec3 uHip;')
        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n#ifdef USE_SKINNING\n{ vec2 hd = transformed.xz - uHip.xz; vec3 rho = vec3(hd.x, 0.0, hd.y) / max(length(hd), 1e-4); float sOut = 0.0; float sUp = 0.0; float sLev = 0.0; vec3 rad = vec3(0.0);\nfor (int ci = 0; ci < 6; ci++) {\n vec3 abp = uCapB[ci] - uCapA[ci]; float lev = step(abs(abp.y), 0.6 * length(abp)); vec3 ab0 = uCapB0[ci] - uCapA0[ci]; float d0 = distance(position, uCapA0[ci] + ab0 * clamp(dot(position - uCapA0[ci], ab0) / dot(ab0, ab0), 0.0, 1.0));\n if (capMode > 0.5) { vec3 ab = uCapB[ci] - uCapA[ci]; float tc = clamp(dot(transformed - uCapA[ci], ab) / dot(ab, ab), 0.0, 1.0); vec3 rv = transformed - (uCapA[ci] + ab * tc); float dd = length(rv); float RR = min(mix(uCapR[ci].x, uCapR[ci].y, tc) + uCapPad, d0 - 0.002); if (dd < RR) rad += rv * ((RR - dd) / max(dd, 1e-5)); }\n for (int k = 0; k < 6; k++) { float tk = float(k) / 5.0; float RR = min(mix(uCapR[ci].x, uCapR[ci].y, tk) + uCapPad, d0 - 0.002); if (RR > 0.0) { vec3 v = transformed - mix(uCapA[ci], uCapB[ci], tk); float cc = dot(v, v) - RR * RR; float b1 = dot(v, rho); float q1 = b1 * b1 - cc; if (q1 > 0.0) sOut = max(sOut, sqrt(q1) - b1); float q2 = v.y * v.y - cc; if (q2 > 0.0) { sUp = max(sUp, sqrt(q2) - v.y); sLev = max(sLev, lev * (sqrt(q2) - v.y)); } } }\n}\nif (capMode > 0.5) { if (sLev > 0.0 && sLev < 0.30) transformed.y += sLev; else transformed += rad; }\nelse if (sOut > 0.0 && sUp > 0.0) { if (sUp < sOut) transformed.y += sUp; else transformed += rho * sOut; } }\n#endif'); };
    m.customProgramCacheKey = () => 'legPush' + (first ? 1 : 0); m.needsUpdate = true; }
  // ----- the soft chains (made in 10_geom.js, I30_body.js and I41_hair.js) -----
  // Each point of a chain is pulled toward where it would rest: the way it was built, carried by its body bone (her chest for her hair,
  // her hips for her skirt), leaning toward plain hanging the further down the chain it is. It keeps its speed, so it lags behind her and
  // swings in after. It stays a fixed length from the point above, outside the balls, and above the floor.
  const FLOOR = 0.018, SOFT_H = 1 / 60;
  const SOFT = CHAINS.map((ch) => {
    const n = ch.names.length, hair = ch.grp === 'hair', own = ch.soft || null, pad = own ? own.pad : hair ? 0.012 : 0.030, grp = own ? own.col : hair ? 'h' : 's';       // the skirt's inner layers lie inside its chains, so its balls are padded more
    const o = { ch, hair, yb: SK[ch.yaw || ch.parent], par: SK[ch.parent], b: ch.names.map((nm) => SK[nm]), dir: [], len: [], cur: [], prev: [], g: [], k: [], d: [], cols: [], lift: 0, out: ch.a != null ? V3(Math.sin(ch.a), 0, Math.cos(ch.a)) : null, P: V3(), Q: new THREE.Quaternion(), Y: new THREE.Quaternion() };
    if (ch.grp === 'skirt') { o.caps = []; o.pad = pad; for (let i = 0; i < n; i++) o.caps.push(CAPF.map((f) => { const pt = ch.pts[i].clone().lerp(ch.pts[i + 1], f); return LEGCAP.map((c) => capRest(c, pt)); })); }
    for (let i = 0; i < n; i++) {
      const tip = ch.pts[i + 1], v = tip.clone().sub(ch.pts[i]), t = n > 1 ? i / (n - 1) : 0; o.len.push(v.length()); o.dir.push(v.normalize()); o.cur.push(tip.clone()); o.prev.push(tip.clone());
      if (own) { o.k.push(own.k); o.d.push(own.d); o.g.push(own.g); }
      else if (!hair) { o.k.push(lerp(0.10, 0.05, t)); o.d.push(lerp(0.22, 0.16, t)); o.g.push(lerp(0.05, 0.32, t)); }
      else if (ch.front) { o.k.push(lerp(0.060, 0.026, t)); o.d.push(lerp(0.17, 0.11, t)); o.g.push(lerp(0.30, 0.88, t)); }
      else { o.k.push(lerp(0.060, 0.024, t)); o.d.push(lerp(0.17, 0.11, t)); o.g.push(lerp(0.10, 0.85, t)); }
      const cs = []; COL.forEach((c, ci) => { let hit = false; for (let q = 0; q < grp.length; q++) if (c.g.indexOf(grp[q]) >= 0) hit = true; if (!hit) return; const r = Math.min(c.r + pad, tip.distanceTo(c.rest) - 0.003); if (r > 0.014) cs.push(ci, r); }); o.cols.push(cs);       // a ball never pushes a point out of its place at rest
    }
    return o;
  });
  const fitLen = (p, c, L) => { p.sub(c); p.multiplyScalar(L / (p.length() || 1e-6)).add(c); };
  function softFrames() {
    for (const c of COL) c.p.copy(c.off).applyMatrix4(c.bone.matrixWorld).applyMatrix4(_inv);
    for (const c of LEGCAP) { c.A.copy(c.offA).applyMatrix4(c.bone.matrixWorld).applyMatrix4(_inv); c.B.copy(c.offB).applyMatrix4(c.bone.matrixWorld).applyMatrix4(_inv); }
    for (const sp of LEGS) sp.p.copy(sp.c.A).lerp(sp.c.B, sp.t); HIP.setFromMatrixPosition(SK.hips.matrixWorld).applyMatrix4(_inv);
    for (const o of SOFT) { _mb.multiplyMatrices(_inv, o.par.matrixWorld); o.Q.setFromRotationMatrix(_mb); o.P.copy(o.b[0].position).applyMatrix4(_mb); if (o.yb === o.par) _p.set(0, 0, 1).applyQuaternion(o.Q); else _p.set(0, 0, 1).applyQuaternion(rootQuat(o.yb, _qa)); o.Y.setFromAxisAngle(AY, Math.atan2(_p.x, _p.z)); }
  }
  function softTarget(o, i, c, out) {                 // where point i of a chain would rest, hanging from c
    const g = o.g[i]; out.copy(o.dir[i]).applyQuaternion(o.Q).multiplyScalar(1 - g); _t2.copy(o.dir[i]).applyQuaternion(o.Y).multiplyScalar(g); out.add(_t2);
    if (o.lift && o.out) { _t2.copy(o.out).applyQuaternion(o.Y).multiplyScalar(o.lift * (0.35 + 0.65 * i / Math.max(1, o.b.length - 1))); out.add(_t2); }
    return out.normalize().multiplyScalar(o.len[i]).add(c);
  }
  // _n, a joint of her skirt hanging from _c, is kept out of her legs: its end and two points along its stretch are tested.
  // The rule (the same one legPush draws with): her skirt goes round her legs, so a point of it may never be where a leg is
  // both further out from her middle AND overhead. Such a point is moved the shorter way: out past the leg, or up onto it.
  // So cloth is pushed forward by a knee when she walks, and lies on her lap when she squats, kneels or sits in the air;
  // it is never pushed under a leg or behind one.
  function legOut(o, i, L) {
    for (let it = 0; it < 4; it++) { let moved = false;
      for (let fi = 0; fi < 3; fi++) { const f = CAPF[fi], rd = o.caps[i][fi]; _s.copy(_c).lerp(_n, f); _e.set(_s.x - HIP.x, 0, _s.z - HIP.z); const rl = _e.length(); if (rl < 1e-4) continue; _e.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0;
        for (let q = 0; q < LEGS.length; q++) { const sp = LEGS[q], R = Math.min(sp.r + o.pad, rd[sp.ci] - 0.003); if (R <= 0) continue; const vx = _s.x - sp.p.x, vy = _s.y - sp.p.y, vz = _s.z - sp.p.z, cc = vx * vx + vy * vy + vz * vz - R * R;
          const b1 = vx * _e.x + vz * _e.z, q1 = b1 * b1 - cc; if (q1 > 0) sOut = Math.max(sOut, -b1 + Math.sqrt(q1)); const q2 = vy * vy - cc; if (q2 > 0) sUp = Math.max(sUp, -vy + Math.sqrt(q2)); }
        if (sOut > 1e-4 && sUp > 1e-4) { if (sUp < sOut) _n.y += sUp / f; else _n.addScaledVector(_e, sOut / f); fitLen(_n, _c, L); moved = true; } }
      if (!moved) break; }
  }
  function softStep(still) {
    for (const o of SOFT) { _c.copy(o.P);
      for (let i = 0; i < o.b.length; i++) { const cur = o.cur[i], prev = o.prev[i], L = o.len[i];
        softTarget(o, i, _c, _t);
        if (still) _n.copy(_t); else { _n.copy(cur).sub(prev).multiplyScalar(1 - o.d[i]).add(cur); _t.sub(cur).multiplyScalar(o.k[i]); _n.add(_t); }
        fitLen(_n, _c, L);
        const cs = o.cols[i]; let hit = false;
        for (let j = 0; j < cs.length; j += 2) { const c = COL[cs[j]], r = cs[j + 1]; _d.copy(_n).sub(c.p); const dist = _d.length(); if (dist < r) { _n.copy(c.p).addScaledVector(_d, r / (dist || 1e-6)); hit = true; } }
        if (hit) fitLen(_n, _c, L);
        if (o.caps) legOut(o, i, L);
        if (_n.y < FLOOR) { const dy = cl(FLOOR - _c.y, -L, L), R = Math.sqrt(Math.max(0, L * L - dy * dy)); _d.set(_n.x - _c.x, 0, _n.z - _c.z); if (_d.lengthSq() < 1e-10) { if (o.out) _d.copy(o.out).applyQuaternion(o.Y); else _d.set(0, 0, -1); } _d.normalize(); _n.set(_c.x + _d.x * R, _c.y + dy, _c.z + _d.z * R); }       // it lies on the floor
        if (still) prev.copy(_n); else prev.copy(cur); cur.copy(_n); _c.copy(cur);
      } }
  }
  function softApply() {
    for (const o of SOFT) { _c.copy(o.P); _qa.copy(o.Q);
      for (let i = 0; i < o.b.length; i++) { _d.copy(o.cur[i]).sub(_c).normalize(); _qb.copy(_qa).invert(); _d.applyQuaternion(_qb); _qc.setFromUnitVectors(o.dir[i], _d); o.b[i].quaternion.copy(_qc); _qa.multiply(_qc); _c.copy(o.cur[i]); } }
  }
  // ----- the rings of her sleeves (made in I45_robe.js; stage nine) -----
  // Each ring is carried along her arm, round the bend of her elbow. Where her arm is not hanging straight down, the ring slides
  // toward the ground until its top rests on her arm. It follows on a spring, so it sways; it can never slide further than its
  // own slack, so her arm stays inside the cloth.
  const SLF = {}, s1 = V3(), s2 = V3(), s3 = V3(), s4 = V3(), sq = new THREE.Quaternion(), SL_E = 0.06;
  for (const [S, s] of SIDES) SLF[S] = { qU: new THREE.Quaternion(), qF: new THREE.Quaternion(), sh: V3(), el: V3(), wr: V3(), O: V3(s * Math.cos(A_POSE), Math.sin(A_POSE), 0) };
  const SLV = (typeof SLEEVES !== 'undefined' ? SLEEVES : []).map((st) => Object.assign(st, { bone: SK[st.name], C: V3(), Q: new THREE.Quaternion(), u: V3(), tg: V3(), p: SK[st.name].userData.rest.clone(), pp: SK[st.name].userData.rest.clone(), k: 0.11, d: 0.20, sc: 1 }));
  function ringAt(st, dir, tab) { sq.copy(st.Q).invert(); s3.copy(dir).applyQuaternion(sq); const O = SLF[st.S].O; let ph = Math.atan2(s3.z, s3.x * O.x + s3.y * O.y); if (ph < 0) ph += TAU; const f = (ph / TAU) * 16, i = Math.floor(f) % 16; return lerp(tab[i], tab[(i + 1) % 16], f - Math.floor(f)); }
  const slackAt = (st, dir) => ringAt(st, dir, st.slack);
  function sleeveFrames() {
    for (const [S] of SIDES) { const F = SLF[S]; rootQuat(SK['uarm' + S], F.qU); rootQuat(SK['farm' + S], F.qF); F.sh.setFromMatrixPosition(SK['uarm' + S].matrixWorld).applyMatrix4(_inv); F.el.setFromMatrixPosition(SK['farm' + S].matrixWorld).applyMatrix4(_inv); F.wr.setFromMatrixPosition(SK['hand' + S].matrixWorld).applyMatrix4(_inv); }
    for (const st of SLV) { const F = SLF[st.S], sl = st.sl, tau = cl((sl - (L_UARM - SL_E)) / (2 * SL_E), 0, 1);
      if (tau <= 0) st.C.copy(F.sh).lerp(F.el, sl / L_UARM); else if (tau >= 1) st.C.copy(F.el).lerp(F.wr, (sl - L_UARM) / L_FARM);
      else { s1.copy(F.sh).lerp(F.el, 1 - SL_E / L_UARM); s2.copy(F.el).lerp(F.wr, SL_E / L_FARM); st.C.copy(s1).multiplyScalar((1 - tau) * (1 - tau)).addScaledVector(F.el, 2 * tau * (1 - tau)).addScaledVector(s2, tau * tau); }       // round the bend of her elbow
      st.Q.copy(F.qU).slerp(F.qF, tau * tau * (3 - 2 * tau)); st.u.copy(armDir[st.S]).applyQuaternion(st.Q);
      const uy = st.u.y; s1.set(st.u.x * uy, uy * uy - 1, st.u.z * uy); const m = s1.length(); st.tg.set(0, 0, 0);                    // the pull of the ground, across her arm
      if (m > 0.05) { s1.multiplyScalar(1 / m); st.tg.copy(s1).multiplyScalar(slackAt(st, s1) * sm(0.25, 0.60, m)); } }
  }
  function sleeveStep(still) {
    for (const st of SLV) { const F = SLF[st.S];
      if (still) s1.copy(st.tg);
      else { s1.copy(st.p).sub(st.pp).multiplyScalar(1 - st.d).add(st.p); s2.copy(st.C).add(st.tg).sub(st.p).multiplyScalar(st.k); s1.add(s2).sub(st.C); }
      // When her elbow folds, the other half of her arm comes through this ring's place too. The ring slides toward it, and if
      // that is not enough it opens wider, so both halves of her arm are inside the cloth (a sleeve gathering round a bent elbow).
      let want = 1; { const far = st.sl >= L_UARM, A = far ? F.sh : F.el, B = far ? F.el : F.wr, rf = far ? 0.046 : 0.038;
        s2.copy(A).sub(st.C).sub(s1); const dA = s2.dot(st.u); s4.copy(B).sub(st.C).sub(s1); const dB = s4.dot(st.u);
        if (dA * dB < 0) { s2.lerp(s4, dA / (dA - dB)); s2.addScaledVector(st.u, -s2.dot(st.u)); const wl = s2.length(); if (wl > 0.004) { s2.multiplyScalar(1 / wl); const have = ringAt(st, s2, st.rad), short = wl + rf - have; if (short > 0) { s1.addScaledVector(s2, short); want = 0; } } } }
      s1.addScaledVector(st.u, -s1.dot(st.u)); const len = s1.length(); if (len > 1e-5) { s2.copy(s1).multiplyScalar(1 / len); const lim = slackAt(st, s2); if (len > lim) s1.multiplyScalar(lim / len); }
      if (!want) { const far = st.sl >= L_UARM, A = far ? F.sh : F.el, B = far ? F.el : F.wr, rf = far ? 0.046 : 0.038; s2.copy(A).sub(st.C).sub(s1); const dA = s2.dot(st.u); s4.copy(B).sub(st.C).sub(s1); const dB = s4.dot(st.u); want = 1;
        if (dA * dB < 0) { s2.lerp(s4, dA / (dA - dB)); s2.addScaledVector(st.u, -s2.dot(st.u)); const wl = s2.length(); if (wl > 0.004) { s2.multiplyScalar(1 / wl); want = cl((wl + rf) / ringAt(st, s2, st.rad), 1, 1.45); } } }
      st.sc = still ? want : st.sc + (want - st.sc) * 0.25;
      st.pp.copy(still ? s2.copy(st.C).add(s1) : st.p); st.p.copy(st.C).add(s1); }
  }
  function sleeveApply() {
    for (const st of SLV) { const par = SK[st.par]; rootQuat(par, sq).invert(); s1.setFromMatrixPosition(par.matrixWorld).applyMatrix4(_inv); st.bone.position.copy(s2.copy(st.p).sub(s1).applyQuaternion(sq)); st.bone.quaternion.copy(sq).multiply(st.Q); st.bone.scale.setScalar(st.sc); }
    if (SLV.length) sync();       // the long points hang from the cuff rings
  }
  let softAcc = 0;
  function softTick(dt) { softAcc += dt; let n = 0; while (softAcc >= SOFT_H && n < 4) { softAcc -= SOFT_H; n++; } if (softAcc > SOFT_H) softAcc = 0;
    sleeveFrames(); for (let i = 0; i < n; i++) sleeveStep(false); sleeveApply(); softFrames(); for (let i = 0; i < n; i++) softStep(false); softApply(); }
  function softSettle() { sleeveFrames(); sleeveStep(true); sleeveApply(); softFrames(); for (let i = 0; i < 24; i++) softStep(true); softApply(); }       // everything comes to rest at once in the pose she is in

  // ----- reaching: two bones in a row (upper arm and forearm, or thigh and shin) bring their end to a point of her own space -----
  // bend -1: an elbow (the forearm folds forward of the upper arm); +1: a knee (the shin folds back). swivel turns the elbow or knee about
  // the line from the joint to the point. w blends from the pose the move already gave (0) to the reach (1).
  function ik2(up, lo, end, P, w, swivel, bend) {
    if (w <= 0.0005) return;
    _mb.copy(up.parent.matrixWorld).invert(); _t.copy(P).applyMatrix4(root.matrixWorld).applyMatrix4(_mb).sub(up.position);
    const a = lo.position.length(), b = end.position.length(); let L = _t.length(); L = cl(L, Math.abs(a - b) + 0.004, a + b - 0.0012); _t.normalize();
    const A = Math.acos(cl((a * a + L * L - b * b) / (2 * a * L), -1, 1)), C = Math.acos(cl((a * a + b * b - L * L) / (2 * a * b), -1, 1));
    _qa.setFromUnitVectors(_e.copy(lo.position).normalize(), _t); _qb.setFromAxisAngle(AX, -bend * A); _qc.setFromAxisAngle(_t, swivel || 0);
    _qc.multiply(_qa).multiply(_qb); up.quaternion.slerp(_qc, w);
    lo.rotation.set(lerp(lo.rotation.x, bend * (PI - C), w), lo.rotation.y * (1 - w), lo.rotation.z * (1 - w));
  }
  const reach = (S, P, w, swivel) => ik2(SK['uarm' + S], SK['farm' + S], SK['hand' + S], P, w, swivel, -1);
  const HAND0 = {}; for (const [S, s] of SIDES) { const d0 = armDir[S], p0 = V3(-s * Math.cos(A_POSE), -Math.sin(A_POSE), 0); HAND0[S] = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(d0, p0, V3().crossVectors(d0, p0))).invert(); }
  // turn a hand so its fingers point along f and its palm faces n (both in her own space)
  function aimHand(S, f, n, w) {
    if (w <= 0.0005) return;
    _t.copy(f).normalize(); _n.copy(n).addScaledVector(_t, -_t.dot(n)).normalize(); _d.crossVectors(_t, _n);
    _qc.setFromRotationMatrix(_mb.makeBasis(_t, _n, _d)).multiply(HAND0[S]);
    rootQuat(SK['clav' + S], _qa); _qa.multiply(SK['uarm' + S].quaternion).multiply(SK['farm' + S].quaternion).invert();
    SK['hand' + S].quaternion.slerp(_qa.multiply(_qc), w);
  }
  // A wrist only bends so far, and it does not twist: the turn of a hand is made along the forearm. So whatever a move asked of a hand,
  // its turn about the arm's own line is taken out, most of it is given to the forearm (ftw), and the bend that is left is held to WRIST_MAX.
  const WRIST_MAX = 0.62, QI = new THREE.Quaternion();
  function wristFix(S) {
    const h = SK['hand' + S].quaternion, a = armDir[S]; if (h.w < 0) h.set(-h.x, -h.y, -h.z, -h.w);
    const dp = h.x * a.x + h.y * a.y + h.z * a.z; _qa.set(a.x * dp, a.y * dp, a.z * dp, h.w); if (_qa.lengthSq() < 1e-8) _qa.set(0, 0, 0, 1); _qa.normalize();       // the turn about her arm's line
    _qb.copy(_qa).invert(); _qc.copy(h).multiply(_qb);                                                                  // what is left: the bend of the wrist
    const ang = 2 * Math.acos(Math.min(1, Math.abs(_qc.w))); if (ang > WRIST_MAX) _qc.copy(QI.set(0, 0, 0, 1).slerp(_qc, WRIST_MAX / ang));
    h.copy(_qc).multiply(_qa); SK['ftw' + S].quaternion.set(0, 0, 0, 1).slerp(_qa, 0.8);
  }
  // after a leg has reached, set its foot level on the ground (pitch: + heel up), toes the way she started out facing
  function flatFoot(S, pitch, w) {
    if (w <= 0.0005) return;
    rootQuat(SK.hips, _qa); _qa.multiply(SK['thigh' + S].quaternion).multiply(SK['shin' + S].quaternion).invert(); _qb.setFromAxisAngle(AX, pitch || 0);
    SK['foot' + S].quaternion.slerp(_qa.multiply(_qb), w);
  }
  // fingers: curl 0 open .. 1.4 a fist; idx sets the index finger apart (for pointing)
  function fingers(S, curl, idx) {
    const s = S === 'L' ? 1 : -1;
    for (const fn of ['idx', 'mid', 'rng', 'pnk']) { const c = fn === 'idx' && idx != null ? idx : curl * (fn === 'pnk' ? 1.1 : 1); for (let k = 0; k < 3; k++) SK[fn + k + S].rotation.z = -s * c * [0.85, 1.1, 0.7][k]; }
    SK['thb1' + S].rotation.z = -s * curl * 0.25; SK['thb2' + S].rotation.z = -s * curl * 0.35;
  }

  let lastPose = { arm: 15, leg: 0 }, mv = { name: 'pose', t: 0 }, wk = 0, gph = 0, spinWas = 0;
  let clock = 0, blinkAt = 1.6, blinkT = -1, mouthAt = 0, mouthNow = 'rest', facePainted = '', talking = false, held = null, blinking = true;
  const SHOTS = { glasses: 2.4, hat: 2.6, curtsey: 3.0, twirl: 2.6, herb: 5.0, wave: 3.0, look: 3.6, sickle: 3.4, crescent: 4.7, salve: 7.2, guardian: 14.6, garden: 12.4 }, MOVES = ['pose', 'idle', 'walk', 'jog', 'squat', 'kneel', 'hover', 'talk', 'read', 'glasses', 'hat', 'curtsey', 'twirl', 'herb', 'wave', 'look', 'sickle', 'crescent', 'salve', 'guardian', 'garden'], SPELLS = ['crescent', 'salve', 'guardian', 'garden'];
  let jg = 0, hSq = 0, hKn = 0, hHv = 0;
  // Her emotions (C10; stage ten). feel: the one she is asked to hold (the page's Feelings buttons, setFeel); FW: how far she is into each,
  // for the small turn of her head and shoulders that goes with it. A move can also ask for one for a moment (her reading face when she reads).
  const FEELS = ['reading', 'casting', 'surprised', 'hit', 'stern', 'delighted'], FW = {}; for (const n of FEELS) FW[n] = 0; let feel = null;       // the moves all four witches share (Chris, November 13: "squat ... kneel ... hover, and jog"); each slides in and out
  // Her book (G8, and the rule in her prompts: it is in her LEFT hand; when she lets go of it, it floats open at her left side).
  // bkR: 1 open on her left palm to read (see readHands). bkF is no longer used: she does not carry it.
  const BK_FLOAT = {},       // Chris, November 13: "her book should like appear when she does the read her book animation. I don't think she should just be holding it"
     bkP = V3(), bkQ = new THREE.Quaternion(), bkP2 = V3(), bkQ2 = new THREE.Quaternion(), EU = new THREE.Euler(); let bkF = 0, bkR = 0, bkS = 0, showProps = true;
  // SPB: where her left hand holds the open book for a spell (the paintings H3 to H6 show it in her left hand); FXWANT: what the spell being cast needs standing in front of her
  const SPB = { P: V3(0.10, 1.03, 0.22), f: V3(-0.42, 0.30, 0.86), n: V3(-0.06, 0.90, -0.43), want: false }, FXWANT = { dummy: false, ally: false, ally2: false }; let afterHands = null, sickNow = false;
  // FLB: her book floating open at her left side (H11: "her spellbook floats open in the air at her left side at waist height, its pages lifting"); FXVIEW: the way to the camera, which the page keeps up to date, so thin threads of light can face it
  const FLB = { want: false, P: V3(0.57, 1.00, 0.05), lift: 0 }, FXVIEW = V3(0, 0.2, 1); let bkFl = 0;
  function bookFloat(k, T) { const sc = Math.max(0.001, sm(0.05, 0.9, k)); EU.set(-0.86 + 0.05 * Math.sin(T * 1.1), -0.32 + 0.06 * Math.sin(T * 0.8), 0.05 * Math.sin(T * 1.3), 'YXZ'); bkQ.setFromEuler(EU); bkP.set(FLB.P.x, FLB.P.y + 0.012 * Math.sin(T * 1.7) - 0.07 * (1 - sc), FLB.P.z); SK.book.position.copy(bkP); SK.book.quaternion.copy(bkQ); SK.book.scale.setScalar(sc); }
  const propVis = (on, sick) => { const m = meshes, shut = false, open = Math.max(bkR, bkS, bkFl) > 0.03; for (const [k, v] of [['bookShut', on && shut], ['bookShutPg', on && shut], ['bookRibbon', on && shut], ['bookOpen', on && open], ['bookOpenPg', on && open], ['sickleGold', on && sick], ['sickleGrip', on && sick]]) if (m[k]) m[k].visible = !!v && showProps; };
  function bookPlace(dt, N) { const k = Math.min(1, dt * 3.2); bkF = 0; bkR += ((N === 'read' ? 1 : 0) - bkR) * k; bkS += ((SPB.want && N !== 'read' ? 1 : 0) - bkS) * k; bkFl += ((FLB.want ? 1 : 0) - bkFl) * k; return 0; }
  // Reading (stage nine; Chris, November 13: her pointing finger "is phasing through the book", and "the book's hovering above"
  // the hand that holds it). Her hands used to be sent to places worked out beside a book that was placed from her chest, so
  // neither truly touched it. Now, in order: her left hand goes to its place, palm up; the book is laid ON that palm, wherever the
  // palm really ended up; then her right forefinger is brought to a point on the page, and the place of its tip is measured and
  // corrected until it rests on the paper.
  const rdP = V3(), rdF = V3(), rdN = V3(), rdX = V3(), rdU = V3(), rdT = V3(), rdW = V3(), rdV = V3(), rdQ = new THREE.Quaternion(), rdB = new THREE.Matrix4(), TIP0 = {};
  for (const [S, s] of SIDES) { const [, fz, fy, fl, , fa] = FINGERS[0], fd = fingerDir(fa); TIP0[S] = handPt(s, 0, fy + fd[1] * fl, fz + fd[2] * fl).sub(SK['idx2' + S].userData.rest); }       // the tip of a forefinger, from its last joint
  const pageZ = (x) => { const u = Math.abs(x) / Math.cos(0.17); return u * Math.sin(0.17) + 0.004 + 0.013 * Math.sin(Math.min(1, u / 0.07) * PI / 2) - 0.004 * (u / BOOK.w); };       // how high the paper lies, across the open book
  function handFrame(S) { rootQuat(SK['hand' + S], rdQ).multiply(_qb.copy(HAND0[S]).invert()); rdF.set(1, 0, 0).applyQuaternion(rdQ); rdN.set(0, 1, 0).applyQuaternion(rdQ); rdX.crossVectors(rdF, rdN); rdW.setFromMatrixPosition(SK['hand' + S].matrixWorld).applyMatrix4(_inv); }
  function armTo(S, P, k, swivel, f, n, from) { const e = k * k * (3 - 2 * k); rdV.copy(from).lerp(P, e); rdV.z += 0.09 * Math.sin(PI * e); reach(S, rdV, sm(0, 0.15, k), swivel * e); aimHand(S, f, n, k); wristFix(S); }
  const rdFrom = { L: V3(), R: V3() };
  // The open book on her left palm: her hand goes to P, palm facing n, fingers along f, and the book is laid on that palm wherever
  // the palm really ended up; it grows out of nothing there once her hand is nearly in place.
  function bookOnPalm(k, P, f, n) {
    rdFrom.L.setFromMatrixPosition(SK.handL.matrixWorld).applyMatrix4(_inv); fingers('L', lerp(0.24, 0.12, k)); armTo('L', P, k, 0.3, f, n, rdFrom.L); sync();
    handFrame('L'); const sc = Math.max(0.001, sm(0.45, 0.92, k)); rdU.set(0, 0.35, 1).addScaledVector(rdN, -(0.35 * rdN.y + rdN.z)).normalize(); _d.crossVectors(rdU, rdN);
    bkQ.setFromRotationMatrix(rdB.makeBasis(_d, rdU, rdN)); bkP.copy(rdW).addScaledVector(rdF, 0.058).addScaledVector(rdN, 0.0245).addScaledVector(rdX, -0.008).sub(_e.set(0, -0.050, -0.0045).multiplyScalar(sc).applyQuaternion(bkQ));
    SK.book.position.copy(bkP); SK.book.quaternion.copy(bkQ); SK.book.scale.setScalar(sc);
  }
  // Her right forefinger is brought to tipTo: her hand held level above the page with her other fingers folded up under her palm,
  // the forefinger bent down; the place of its tip is measured and her whole hand moved until it is right.
  function fingerTo(tipTo, k) {
    fingers('R', lerp(0.24, 1.2, k)); for (const fn of ['mid', 'rng', 'pnk']) [0.75, 1.75, 0.90].forEach((a, j) => { SK[fn + j + 'R'].rotation.z = lerp(0.24 * [0.85, 1.1, 0.7][j], a, k); });
    [0.95, 0.20, 0.15].forEach((a, j) => { SK['idx' + j + 'R'].rotation.z = lerp(0.24 * [0.85, 1.1, 0.7][j], a, k); }); sync();
    rootQuat(SK.handR, _qa).invert(); rdT.copy(TIP0.R).applyMatrix4(SK.idx2R.matrixWorld).applyMatrix4(_inv).sub(_e.setFromMatrixPosition(SK.handR.matrixWorld).applyMatrix4(_inv)).applyQuaternion(_qa);       // where her fingertip is from her wrist, in her hand's own frame
    fv.set(-0.50, 0.85, 0.12).applyQuaternion(bkQ).normalize(); nv.set(0, 0, -1).applyQuaternion(bkQ);
    _t.copy(fv); _n.copy(nv).addScaledVector(_t, -_t.dot(nv)).normalize(); _d.crossVectors(_t, _n); _qc.setFromRotationMatrix(rdB.makeBasis(_t, _n, _d)).multiply(HAND0.R);       // the turn her hand is asked for
    rdP.copy(tipTo).sub(_e.copy(rdT).applyQuaternion(_qc)); const want = rdP.clone(), f2 = fv.clone(), n2 = nv.clone();
    if (k < 1) want.addScaledVector(_e.set(0, 0, 1).applyQuaternion(bkQ), 0.08 * (1 - sm(0.72, 1, k)));       // her right hand comes down onto the page from above, after the book is there
    armTo('R', want, k, -0.3, f2, n2, rdFrom.R); sync();
    if (k > 0.98) for (let it = 0; it < 2; it++) { rdV.copy(TIP0.R).applyMatrix4(SK.idx2R.matrixWorld).applyMatrix4(_inv); _e.copy(tipTo).sub(rdV); if (_e.length() < 0.0008) break; want.add(_e); armTo('R', want, 1, -0.3, f2, n2, rdFrom.R); sync(); }       // her wrist only bends so far, so the tip is put right by moving her whole hand
  }
  const tipNow = (out) => out.copy(TIP0.R).applyMatrix4(SK.idx2R.matrixWorld).applyMatrix4(_inv);
  function readHands(N, T) {
    const k = bkR; rdFrom.R.setFromMatrixPosition(SK.handR.matrixWorld).applyMatrix4(_inv);
    // her left hand: palm up and a little toward her face, at the foot of her ribs
    carried('spine3', 0.082, 1.040, 0.215, rdP); bookOnPalm(k, rdP.clone(), fv.set(-0.42, 0.30, 0.86).clone(), nv.set(-0.06, 0.90, -0.43).clone());
    // Where her fingertip goes (Chris, November 13: the reading hand was "kind of jerky moving fast": it jumped back to the top of
    // the page in one frame every 5.2 s, and turned a leaf in under half a second). One slow round now takes 12 s: 8.4 s down the
    // page at about 1.5 cm a second with a slow drift along the lines, then it lifts, goes to the edge, turns the leaf across, and
    // comes back to the top. Every stretch eases in and out, so its speed never jumps.
    const RD = [[0, 0.055, 0.050, 0], [8.4, 0.055, -0.040, 0], [9.5, 0.110, -0.010, 0.026], [10.9, 0.000, 0.004, 0.034], [12.0, 0.055, 0.050, 0]], tc = N === 'read' ? T % 12 : 0;
    let px = RD[0][1], py = RD[0][2], pz = 0; for (let i = 0; i < RD.length - 1; i++) if (tc >= RD[i][0] && tc <= RD[i + 1][0]) { const e = sm(RD[i][0], RD[i + 1][0], tc); px = lerp(RD[i][1], RD[i + 1][1], e); py = lerp(RD[i][2], RD[i + 1][2], e); pz = lerp(RD[i][3], RD[i + 1][3], e); }
    px += 0.014 * Math.sin(tc * TAU / 4.2) * sm(0, 1.2, tc) * (1 - sm(7.2, 8.4, tc));
    fingerTo(bookPt(px, py, pageZ(px) + 0.0075 + pz, V3()), k);
  }
  const bookPt = (x, y, z, out) => out.set(x, y, z).applyQuaternion(bkQ).add(bkP);
  const pulse = (t, a, b, c, d) => sm(a, b, t) * (1 - sm(c, d, t)), ANK = {}; for (const [S] of SIDES) ANK[S] = SK['foot' + S].userData.rest.clone();
  const tgt = V3(), tg2 = V3(), fv = V3(), nv = V3();
  // ----- for her spells (stage eleven) -----
  const cromP = (K, u, out) => { const n = K.length - 1, x = cl(u, 0, 1) * n, i = Math.min(n - 1, Math.floor(x)), t = x - i, p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(n, i + 2)], t2 = t * t, t3 = t2 * t;       // a smooth path through points
    return out.set(0, 0, 0).addScaledVector(p0, -0.5 * t3 + t2 - 0.5 * t).addScaledVector(p1, 1.5 * t3 - 2.5 * t2 + 1).addScaledVector(p2, -1.5 * t3 + 2 * t2 + 0.5 * t).addScaledVector(p3, 0.5 * t3 - 0.5 * t2); };
  // a hand closed on a handle: h the way the handle points (toward the blade), f the way her knuckles face
  const gripAim = (list, S, h, f, w) => { const hh = h.clone().normalize(), ff = f.clone().addScaledVector(hh, -f.dot(hh)).normalize(); list.push([S, ff, V3().crossVectors(hh, ff), w]); };
  // her sickle's blade, in her right hand at rest: where it leaves the handle, its far edge, and how far the light of a cut reaches
  const SKL = (() => { const wr = restPts.wrR, d0 = armDir.R, p0 = V3(Math.cos(A_POSE), -Math.sin(A_POSE), 0), Pc = wr.clone().addScaledVector(d0, 0.073).addScaledVector(p0, 0.024); return { inner: V3(Pc.x, Pc.y, Pc.z + 0.088), outer: Pc.clone().addScaledVector(d0, 0.105).add(V3(0, 0, 0.176)), far: Pc.clone().addScaledVector(d0, 0.15).add(V3(0, 0, 0.36)), mid: Pc.clone().addScaledVector(d0, 0.088).add(V3(0, 0, 0.13)) }; })();
  const CUT = [V3(-0.40, 1.50, -0.20), V3(-0.52, 1.36, 0.14), V3(-0.26, 1.12, 0.50), V3(0.14, 0.86, 0.52), V3(0.30, 0.60, 0.38)], GRIP = V3(-0.060, 1.135, 0.175), PEND = V3(0, 1.2035, 0.125);
  const sp1 = V3(), sp2 = V3(), sp3 = V3(), sp4 = V3(), sp5 = V3(), spq = new THREE.Quaternion(), spq2 = new THREE.Quaternion(), UP = V3(0, 1, 0);
  const yawOf = (bone) => { rootQuat(bone, spq); sp5.set(0, 0, 1).applyQuaternion(spq); return Math.atan2(sp5.x, sp5.z); };
  // the path the Salve's ribbon takes: out from her hand, down to her friend's feet, then once round them up to their shoulders (H6)
  const SALVE_A = V3();
  // Elderwood Guardian: S0 where the seed is planted, F0 where the fawn lies, ST where the Guardian stands (at her right side, facing the foe), DUM where the foe stands for it, hit: the second it strikes
  // (she is seen from her right and a little in front, so the Guardian stands behind her right shoulder, turned toward the foe: on screen it is to her left, in side view, as in H9, and it springs past her as in H10)
  const GRD = { S0: V3(-0.52, 0, -0.20), F0: V3(-0.62, 0, -0.42), ST: V3(-0.82, 0, -1.20), DUM: V3(-0.20, 0, 1.80), rel: V3(), hit: 13.02, yaw: 0, h: V3(), end: V3() };
  GRD.h.copy(GRD.DUM).sub(GRD.ST).setY(0).normalize(); GRD.yaw = Math.atan2(GRD.h.x, GRD.h.z); GRD.end.copy(GRD.DUM).addScaledVector(GRD.h, -1.42);
  // Moonflower Garden: each seed's hand, how far it has flown, how far its shoot has risen and its flower opened
  const GDN = { from: [], fly: [], shoot: [], open: [] }; for (let i = 0; i < GARDEN.NF; i++) { GDN.from.push(V3()); GDN.fly.push(-1); GDN.shoot.push(0); GDN.open.push(0); }
  function salvePath(u, out) { const AX = ALLY.position.x, AZ = ALLY.position.z, th0 = -PI / 2 - 0.55;
    if (u < 0.36) { const t = u / 0.36, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t; sp4.set(AX + 0.30 * Math.cos(th0), 0.12, AZ + 0.30 * Math.sin(th0)); return out.set(0, 0, 0).addScaledVector(SALVE_A, a).addScaledVector(sp5.copy(SALVE_A).add(sp3.set(0.16, 0.20, 0.50)), b).addScaledVector(sp4, c); }
    const v = (u - 0.36) / 0.64, th = th0 + TAU * 1.22 * v, r = lerp(0.30, 0.215, v); return out.set(AX + r * Math.cos(th), lerp(0.12, 1.44, Math.pow(v, 0.9)), AZ + r * Math.sin(th)); }

  function pose(o) {
    o = o || {}; mv = { name: 'pose', t: 0 }; wk = 0; lastPose = { arm: o.arm == null ? 15 : o.arm, leg: o.leg || 0 }; const arm = lastPose.arm * DEG - A_POSE, leg = lastPose.leg * DEG;
    restAll(); for (const [S, s] of SIDES) { SK['uarm' + S].rotation.z = s * arm; SK['thigh' + S].rotation.z = s * leg; SK['foot' + S].rotation.z = -s * leg; }
    for (const o2 of SOFT) o2.lift = 0; sync(); softSettle(); root.updateMatrixWorld(true); bkF = 0; bkR = 0; bkS = 0; bkFl = 0; propVis(false, false);       // held still she carries nothing, as in the paintings she is checked against
  }
  function play(name) { if (!MOVES.includes(name) || name === 'pose') { pose(lastPose); return 'pose'; } if (SPELLS.includes(name)) fxClear(); mv = { name, t: 0 }; return name; }
  // one frame of a move: returns her face { eyes, mouth }
  function body(N, T, dt) {
    restAll(); for (const o of SOFT) o.lift = 0;
    afterHands = null; sickNow = false; SPB.want = false; FLB.want = false; FLB.lift = 0; FXWANT.dummy = false; FXWANT.ally = false; FXWANT.ally2 = false;
    let eyes = 0, mouth = 'rest', emo = null, plant = 1; const footP = { R: 0, L: 0 }, ank = { R: tgt.clone().copy(ANK.R), L: tgt.clone().copy(ANK.L) };
    wk += ((N === 'walk' || N === 'jog' ? 1 : 0) - wk) * Math.min(1, dt * 4.5); jg += ((N === 'jog' ? 1 : 0) - jg) * Math.min(1, dt * 4.5); const go = wk, still = 1 - go;
    hSq += ((N === 'squat' ? 1 : 0) - hSq) * Math.min(1, dt * 3.2); hKn += ((N === 'kneel' ? 1 : 0) - hKn) * Math.min(1, dt * 2.8); hHv += ((N === 'hover' ? 1 : 0) - hHv) * Math.min(1, dt * 2.2);
    // always: arms hanging easy, fingers a little curled, her breath, and a slow shift of her weight when she stands
    const br = Math.sin(clock * 1.5), sway = Math.sin(clock * 0.62), sw2 = Math.sin(clock * 0.41 + 1.3);
    for (const [S, s] of SIDES) { add('uarm' + S, 0, 0, s * (13 * DEG - A_POSE)); add('farm' + S, -0.10, 0, 0); fingers(S, 0.24); add('clav' + S, 0, 0, s * 0.012 * br); }
    add('spine2', 0.010 * br, 0, 0); add('spine3', 0.009 * br, 0, 0);
    SK.hips.position.x += 0.009 * sway * still; add('hips', 0, 0, 0.014 * sway * still); add('spine1', 0, 0, -0.012 * sway * still); add('head', 0.012 * sw2 * still, 0.03 * sw2 * still, 0.014 * sway * still);
    // a feeling she holds: small, as all her gestures are. Surprise and a hit come quickly; the others ease in.
    { for (const n of FEELS) FW[n] += ((feel === n ? 1 : 0) - FW[n]) * Math.min(1, dt * (n === 'surprised' || n === 'hit' ? 10 : 4));
      const a = FW.reading, b = FW.casting, c = FW.surprised, d = FW.hit, e = FW.stern, f = FW.delighted;
      if (a + b + c + d + e + f > 0.002) {
        add('head', 0.15 * a + 0.05 * b - 0.07 * c + 0.11 * d - 0.025 * e + 0.02 * f, 0.20 * d, 0.05 * a + 0.07 * d + 0.09 * f); add('neck', 0.06 * a + 0.03 * b - 0.03 * c + 0.05 * d, 0.08 * d, 0.03 * f);
        add('spine3', 0.02 * b - 0.035 * c + 0.05 * d - 0.02 * e, 0.04 * d, 0); add('spine2', -0.02 * c + 0.04 * d - 0.015 * e, 0, 0);
        for (const [S, s] of SIDES) { add('clav' + S, 0, 0, s * (0.07 * c + 0.09 * d + 0.03 * f - 0.02 * a)); add('farm' + S, -(0.10 * c + 0.16 * d), 0, 0); }
        SK.hips.position.y += 0.005 * Math.sin(clock * 7) * f; SK.hips.position.z -= 0.012 * d; } }
    // walking: an unhurried step; her hips turn a little, her arms swing small
    if (go > 0.001) { gph += dt * TAU / lerp(1.12, 0.72, jg); const A = lerp(0.30, 0.50, jg), sn = Math.sin(gph), cs = Math.cos(gph); plant *= still;       // jog: the same step made quick and light, elbows bent
      for (const [S, s] of SIDES) { const p = gph + (s < 0 ? 0 : PI), si = Math.sin(p), co = Math.cos(p), sw = Math.max(0, co), st = Math.max(0, -co);
        const th = -(A * si + lerp(0.04, 0.13, jg)) * go, kn = (lerp(0.95, 1.55, jg) * Math.pow(sw, 1.3) + 0.18 * Math.pow(Math.max(0, Math.sin(p - 0.5)), 3) * st + lerp(0.04, 0.18, jg)) * go;
        // Her feet (Chris, November 13: her ankles were "not bending the right way at the back of her step"; the Ranger's had the same fault).
        // On the ground her sole lies flat until the leg is too far back for an ankle, then her heel lifts. In the air the foot hangs
        // loose, toes down, and comes up to land on the heel. The ankle is held to 0.26 up and 0.30 down. Her boots are stiff: no toe fold.
        const u = (((p / TAU) % 1) + 1) % 1, onG = sm(0.22, 0.28, u) * (1 - sm(0.72, 0.78, u)), sp = ((((u - 0.75) % 1) + 1) % 1) / 0.5;
        const kn2 = kn + 0.30 * Math.exp(-Math.pow((u - 0.76) / 0.07, 2)) * go;       // her knee is already giving as the foot leaves the ground
        add('thigh' + S, th, 0, 0); add('shin' + S, kn2, 0, 0); add('foot' + S, lerp(lerp(0.24, -0.14, sm(0.55, 1.0, sp)) * go, cl(-(th + kn2), -0.26, 0.30), onG), 0, 0);
        add('uarm' + S, lerp(0.24, 0.58, jg) * si * go, 0, 0); add('farm' + S, -(lerp(0.16, 1.30, jg) + 0.14 * Math.max(0, -si)) * go, 0, 0); }
      SK.hips.position.y += -0.035 * sn * sn * go; SK.hips.position.x += 0.011 * cs * go;
      SK.hips.position.y += 0.022 * jg * go; add('hips', lerp(0.015, 0.075, jg) * go, 0.08 * sn * go, 0.03 * cs * go); add('spine1', 0.015 * go, -0.04 * sn * go, -0.018 * cs * go); add('spine2', 0, -0.07 * sn * go, -0.016 * cs * go); add('spine3', 0, -0.04 * sn * go, 0);
      add('neck', -0.02 * go, 0.07 * sn * go, 0); }
    // reaches are gathered here and done after her body is in place: [side, point, weight, swivel], and hands to turn: [side, fingers, palm, weight]
    const reaches = [], aims = [];
    if (N === 'talk') { const k = sm(0, 0.5, T), a1 = Math.sin(T * 3.1), a2 = Math.sin(T * 1.7 + 1), a3 = Math.sin(T * 4.7);
      add('head', 0.035 * a1 * k + 0.02 * k, 0.07 * a2 * k, 0.04 * Math.sin(T * 1.1) * k); add('neck', 0, 0.04 * a2 * k, 0); add('spine3', 0, 0.03 * a2 * k, 0);
      reaches.push(['L', V3(0.13 + 0.02 * a2, 1.03 + 0.03 * a1, 0.25 + 0.02 * a3), 0.95 * k, 0.5]); aims.push(['L', V3(-0.25, 0.22 + 0.16 * a1, 0.9), V3(0.15, 1, -0.1), 0.95 * k]);
      if (clock > mouthAt) { mouthAt = clock + 0.10 + 0.09 * Math.abs(Math.sin(clock * 37.7)); const r = Math.abs(Math.sin(clock * 91.3)); mouthNow = r < 0.30 ? 'rest' : r < 0.66 ? 'open' : r < 0.92 ? 'oo' : 'smile'; }
      mouth = mouthNow; }
    const knee = (S) => () => carried('shin' + S, SK['shin' + S].userData.rest.x, IO_KNEE_Y + 0.075, 0.03, V3());
    if (hSq > 0.001) { const q = hSq;       // squat: down on her heels, leaning in, hands on her knees
      SK.hips.position.y -= 0.42 * q; SK.hips.position.z -= 0.05 * q; add('hips', 0.10 * q, 0, 0); add('spine1', 0.26 * q, 0, 0); add('spine2', 0.16 * q, 0, 0); add('neck', -0.14 * q, 0, 0); add('head', -0.16 * q, 0, 0);
      ank.L.x += 0.05 * q; ank.R.x -= 0.05 * q; for (const [S, s] of SIDES) { reaches.push([S, knee(S), q, s * 0.3]); fingers(S, lerp(0.24, 0.55, q)); } }
    if (hKn > 0.001) { const q = hKn;       // kneel: her right knee down, her left foot forward, her left hand on her raised knee
      SK.hips.position.y -= 0.47 * q; SK.hips.position.z += 0.05 * q; add('spine1', 0.05 * q, 0, 0); add('head', 0.04 * q, 0, 0);
      ank.L.set(ank.L.x + 0.01 * q, ank.L.y + 0.05 * Math.sin(PI * q), ank.L.z + 0.36 * q); ank.R.set(ank.R.x - 0.01 * q, ank.R.y - 0.015 * q, ank.R.z - 0.40 * q); footP.R = Math.max(footP.R, 1.25 * q); reaches.push(['L', knee('L'), 0.9 * q, 0.3]); }
    if (hHv > 0.001) { const q = hHv, bob = 0.022 * Math.sin(clock * 1.3);       // hover: she floats cross-legged, hands open on her knees, eyes shut. All four witches can.
      SK.hips.position.y += (0.30 + bob) * q; plant *= 1 - q; add('spine1', -0.03 * q, 0, 0); add('head', 0.07 * q, 0, 0);
      for (const [S, s] of SIDES) {       // knees wide and forward, each shin folded level across her front, the left one over the right
        const D = V3(s * 0.62, s > 0 ? -0.10 : -0.26, s > 0 ? 0.72 : 0.80).normalize(), H = V3(0, -s, 0).addScaledVector(D, s * D.y).normalize(), nD = D.clone().negate();
        _qc.setFromRotationMatrix(_mb.makeBasis(H, nD, V3().crossVectors(H, nD))); SK['thigh' + S].quaternion.slerp(_qc, q); add('shin' + S, (s > 0 ? 2.34 : 2.16) * q, 0, 0); add('foot' + S, 0.40 * q, 0, 0);
        reaches.push([S, knee(S), q, s * 0.2]); aims.push([S, V3(s * 0.45, -0.1, 0.9), V3(0, 1, 0.1), q]); fingers(S, lerp(0.24, 0.40, q)); }
      if (q > 0.6) { eyes = 1; mouth = 'smile'; } }
    if (N === 'read') { const k = sm(0, 0.7, T);       // she reads: her head down to the page, a finger following the lines, and now and then she turns a leaf
      add('head', 0.30 * k, 0.05 * Math.sin(T * 0.7) * k, 0); add('neck', 0.12 * k, 0, 0); add('spine3', 0.04 * k, 0, 0); if (k > 0.6) emo = 'reading'; }       // her reading face (C10): eyes lowered to the page, a small smile
    if (N === 'sickle') { const k = pulse(T, 0, 0.6, 2.5, 3.3), up = pulse(T, 0.9, 1.4, 1.9, 2.5);       // she lifts her sickle and turns it to the light (the moon pendant will become it when her spells are built)
      add('head', -0.05 * up, -0.14 * k, 0); add('spine3', 0, -0.05 * k, 0);
      reaches.push(['R', V3(-0.21 - 0.03 * up, 1.14 + 0.14 * up, 0.27), k, -0.3]); aims.push(['R', V3(0.10 * up, 0.25 + 0.45 * up, 1), V3(1, 0.1 * Math.sin(T * 3) * up, 0), k]); fingers('R', lerp(0.24, 1.35, sm(0, 0.25, k))); if (up > 0.35) emo = 'casting'; }
    // ----- Harvest Crescent (H3, H4, I3): her plain attack. Her hand closes on the moon pendant, it unfolds into the gold sickle,
    // and she makes one wide cut that leaves a crescent of gold light; the light flies to the foe. The sickle folds back into the pendant.
    if (N === 'crescent') {
      const arm = pulse(T, 0.15, 0.62, 3.75, 4.3), grip = pulse(T, 0.2, 0.65, 1.02, 1.3), draw = sm(1.05, 1.55, T), cut = sm(1.86, 2.26, T), low = pulse(T, 1.95, 2.28, 2.8, 3.3), back = sm(2.9, 3.5, T), st = pulse(T, 0.95, 1.5, 2.95, 3.65), wind = draw * (1 - cut), sw = cut * (1 - back);
      FXWANT.dummy = T < 4.35; DUMMY.position.set(0, 0, 1.40); SPB.want = T > 0.05 && T < 3.9; sickNow = T > 1.12 && T < 3.48;
      // her stance: left foot forward, feet wide, knees bent; she sinks onto her front knee as the cut comes round
      const dy = -(0.07 * st + 0.21 * low), dz = 0.03 * st + 0.13 * low; SK.hips.position.y += dy; SK.hips.position.z += dz;
      ank.L.x += 0.07 * st; ank.L.z += (0.12 + 0.14 * low) * st; ank.R.x -= 0.10 * st; ank.R.z -= 0.17 * st; footP.R = Math.max(footP.R, 0.6 * low);
      const tw = -0.48 * wind + 0.55 * sw; add('hips', 0, 0.35 * tw, 0); add('spine1', 0.30 * low, 0.25 * tw, 0); add('spine2', 0.16 * low, 0.25 * tw, 0); add('spine3', 0.02 * st, 0.22 * tw, 0);
      add('neck', -0.18 * low + 0.10 * grip, -0.30 * tw, 0); add('head', -0.16 * low + 0.20 * grip, -0.38 * tw, 0);
      // her right hand: to the pendant, up and back behind her shoulder, round in the cut, and back to her chest
      const P = V3(); if (T < 1.86) P.copy(GRIP).lerp(CUT[0], draw * draw * (3 - 2 * draw)); else if (T < 2.9) cromP(CUT, cut, P); else P.copy(CUT[4]).lerp(GRIP, back * back * (3 - 2 * back));
      const fol = 1 - sm(0, 1, grip + (1 - draw) * (T < 1.3 ? 1 : 0)) * (T < 1.3 ? 1 : 0), body = (T < 1.3 ? draw : 1 - back); P.y += dy * 0.85 * body; P.z += dz * 0.85 * body;
      reaches.push(['R', P.clone(), arm, -0.35 + 0.5 * sw]); fingers('R', lerp(0.24, 1.35, sm(0.3, 0.6, T) * (1 - sm(3.6, 4.0, T))));
      if (T < 1.12 || T > 3.4) aims.push(['R', V3(0.55, 0.80, 0.05), V3(0.10, 0.10, -1), arm]);
      else { cromP(CUT, cut + 0.03, sp1).sub(cromP(CUT, cut - 0.03, sp2)); if (cut <= 0 || cut >= 1) sp1.set(0.6, -0.5, 0.6); const e = sm(0, 0.22, cut), q = 1 - sm(0, 1, back);
        carried('uarmR', restPts.shR.x, restPts.shR.y, restPts.shR.z, sp2); sp3.copy(P).sub(sp2).normalize().addScaledVector(UP, 0.18); const h = V3(-0.25, 0.85, -0.45).lerp(sp3, e).lerp(V3(0.1, 1, 0.2), 1 - q), f = V3(-0.55, 0, -0.83).lerp(sp1.normalize(), e).lerp(V3(0.6, 0.1, 0.5), 1 - q); gripAim(aims, 'R', h, f, arm); }
      // her left hand keeps the open book out of the way of the blade
      const by = yawOf(SK.spine3); carried('spine3', 0.19 + 0.07 * (wind + low), 1.02, 0.17 - 0.13 * (wind + low), SPB.P); SPB.f.set(-0.25, 0.25, 0.93).applyAxisAngle(UP, by); SPB.n.set(-0.05, 0.93, -0.36).applyAxisAngle(UP, by);
      if (T < 1.0) emo = 'reading'; else if (T < 2.9) emo = 'casting'; else if (T > 3.3) mouth = 'smile';
      afterHands = () => {
        const hp = carried('handR', SKL.mid.x, SKL.mid.y, SKL.mid.z, sp1);
        if (grip > 0.02) { carried('spine3', PEND.x, PEND.y, PEND.z, sp2); glow(sp2, 0.20 * grip, FXC.gold, 0.9 * grip); glow(sp2, 0.07, FXC.pearl, grip); if (frnd() < 0.5 * grip) emit(sp2.x + frs(0.02), sp2.y + frs(0.02), sp2.z + 0.02, frs(0.10), 0.05 + frnd() * 0.16, 0.05 + frnd() * 0.12, 0.7 + frnd() * 0.5, 0.020, FXC.gold, frnd() < 0.3 ? 1 : 0, 1.5, -0.05); }
        const pop = pulse(T, 1.08, 1.16, 1.2, 1.5) + pulse(T, 3.36, 3.46, 3.5, 3.8); if (pop > 0.01) { glow(hp, 0.55 * pop, FXC.gold, 0.8 * pop); glow(hp, 0.22 * pop, FXC.pearl, pop, 1); }       // the pendant unfolds into the sickle, and the sickle folds back, in a flash of gold
        if (T > 1.14 && T < 2.8) { const wide = sm(1.80, 1.96, T); carried('handR', SKL.inner.x, SKL.inner.y, SKL.inner.z, sp2); sp4.copy(SKL.outer).lerp(SKL.far, wide); carried('handR', sp4.x, sp4.y, sp4.z, sp3); RIB_CUT.push(sp2, sp3, (0.30 + 0.70 * wide) * (1 - sm(2.45, 2.8, T))); }       // the light the blade leaves
        if (T > 2.2 && T < 2.95 && RIB_CUT.pts.length > 4) for (let i = 0; i < 3; i++) { const t = RIB_CUT.pts[Math.floor(frnd() * RIB_CUT.pts.length)], u = frnd(); emit(lerp(t.p.x, t.q.x, u), lerp(t.p.y, t.q.y, u), lerp(t.p.z, t.q.z, u), frs(0.25), 0.1 + frnd() * 0.3, frs(0.25), 0.5 + frnd() * 0.5, 0.030 + frnd() * 0.02, frnd() < 0.7 ? FXC.gold : FXC.pearl, 1, 1.4, 0.5); }       // the crescent breaks up into sparks
        // the crescent of light flies to the foe, and strikes
        const fly = (T - 2.06) / 0.32, DZ = DUMMY.position.z; WAVE.visible = fly > 0 && fly < 1.12;
        if (WAVE.visible) { const e = Math.min(1, fly); WAVE.position.set(0.03 * (1 - e), 1.02 + 0.05 * e, lerp(0.50, DZ - 0.15, e)); WAVE.rotation.set(0, 0, -0.62); WAVE.scale.setScalar(lerp(0.72, 1.15, e)); WAVE.material.uniforms.uK.value = Math.min(1, fly * 6) * (1 - sm(0.92, 1.12, fly)) * 1.25; if (frnd() < 0.8) emit(WAVE.position.x + frs(0.3), WAVE.position.y + frs(0.25), WAVE.position.z - 0.1, frs(0.1), frs(0.1), -0.3, 0.35, 0.025, FXC.gold, 1, 2, 0); }
        const hitT = 2.06 + 0.32; if (T >= hitT && T - dt < hitT) { dummyHit(2.6); for (let i = 0; i < 60; i++) { const a = frnd() * TAU, v = 0.5 + frnd() * 1.6, up = frs(1); emit(frs(0.12), 1.05 + frs(0.2), DZ - 0.17, Math.cos(a) * v * 0.9, up * v * 0.8 + 0.3, -Math.abs(Math.sin(a)) * v * 0.6 + 0.25, 0.45 + frnd() * 0.6, 0.028 + frnd() * 0.03, i % 4 === 0 ? FXC.pearl : FXC.gold, i % 3 === 0 ? 0 : 1, 2.2, 1.4); } }
        const fl = pulse(T, hitT - 0.01, hitT + 0.03, hitT + 0.08, hitT + 0.4); if (fl > 0.01) { sp2.set(0, 1.05, DZ - 0.2); glow(sp2, 1.2 * fl, FXC.gold, 0.55 * fl); glow(sp2, 0.5 * fl, FXC.pearl, fl, 1, 0.4); }
      };
    }
    // ----- Silverleaf Salve (H5, H6, I1): she heals one friend. She lifts a pressed leaf from the page; it turns fresh and silver-green,
    // floats over her palm, and breaks into a ribbon of light and leaves that winds once round her friend.
    if (N === 'salve') {
      const look = pulse(T, 0.3, 0.9, 3.35, 3.9), pick = sm(0.85, 1.5, T), lift = sm(1.7, 2.4, T), open = sm(2.4, 3.0, T), give = sm(3.55, 4.15, T), down = sm(5.9, 6.6, T), fresh = sm(1.55, 2.5, T), lit = sm(2.3, 3.0, T) * (1 - sm(4.0, 4.3, T)), head = cl((T - 4.15) / 1.35, 0, 1);
      FXWANT.ally = T < 6.85; ALLY.position.set(0, 0, 1.30); ALLY.rotation.y = PI; SPB.want = T > 0.05 && T < 6.25; carried('spine3', 0.10, 1.03, 0.22, SPB.P); SPB.f.set(-0.42, 0.30, 0.86); SPB.n.set(-0.06, 0.90, -0.43);
      add('head', 0.26 * look - 0.03 * give, -0.05 * look, 0); add('neck', 0.06 * look, 0, 0); add('spine3', 0.05 * give * (1 - down), 0.10 * give * (1 - down), 0); add('spine2', 0.03 * give * (1 - down), 0, 0);
      if (look > 0.5 && T < 3.4) emo = 'reading'; else if (T > 3.4 && T < 6.6) mouth = 'smile';
      afterHands = () => { if (bkS < 0.02) { LEAF.visible = false; return; }
        const hang = rdFrom.R.setFromMatrixPosition(SK.handR.matrixWorld).applyMatrix4(_inv).clone(), page = bookPt(0.058, -0.012, pageZ(0.058) + 0.002, V3()), bn = V3(0, 0, 1).applyQuaternion(bkQ), bsc = SK.book.scale.x;
        // her right hand: forefinger and thumb to the pressed leaf, lifting it; then her palm opens under it; then her arm goes out to her friend
        const tipTo = page.clone().addScaledVector(bn, 0.006 + 0.10 * lift).add(V3(-0.035 * lift, 0.035 * lift, -0.02 * lift));
        if (open < 1) { fingerTo(tipTo, pick); SK.thb1R.rotation.z = lerp(SK.thb1R.rotation.z, 0.55, pick); SK.thb2R.rotation.z = lerp(SK.thb2R.rotation.z, 0.5, pick); sync(); }
        const tip = tipNow(V3());
        if (open > 0) { const from = SK.handR.getWorldPosition(V3()).applyMatrix4(_inv), k = 1 - down;
          for (const fn of ['idx', 'mid', 'rng', 'pnk']) for (let j = 0; j < 3; j++) SK[fn + j + 'R'].rotation.z = lerp(SK[fn + j + 'R'].rotation.z, (0.10 + 0.10 * give) * [0.85, 1.1, 0.7][j] * (fn === 'idx' ? 0.6 : 1), open); SK.thb1R.rotation.z = lerp(SK.thb1R.rotation.z, 0.05, open); SK.thb2R.rotation.z = lerp(SK.thb2R.rotation.z, 0.05, open);
          const Pp = carried('spine3', -0.215, 1.085, 0.30, V3()).lerp(carried('spine3', -0.15, 1.27, 0.50, V3()), give), f = V3(-0.22, 0.12, 0.95).lerp(V3(0.02, 0.50, 0.86), give).normalize(), n = V3(0.05, 1, 0.10).lerp(V3(0, 0.80, -0.55), give).normalize();
          if (open < 1) armTo('R', Pp, open, -0.25, f, n, from); else armTo('R', Pp, k, -0.25, f, n, hang); sync(); }
        // the leaf: pressed flat on the page, lifted between her finger and thumb, then standing in the air a hand's width over her open palm
        handFrame('R'); const palm = rdW.clone().addScaledVector(rdF, 0.062).addScaledVector(rdN, 0.02), flt = palm.clone().add(V3(0, 0.105 + 0.006 * Math.sin(T * 2.2), 0)).addScaledVector(V3(0, 0.05, 0.16), sm(3.9, 4.25, T));
        const qPage = spq.copy(bkQ).multiply(spq2.setFromAxisAngle(V3(0, 0, 1), 0.5)).clone(), qUp = new THREE.Quaternion().setFromAxisAngle(UP, T * 1.5), lp = page.clone().lerp(tip.clone().addScaledVector(bn, -0.004), sm(1.45, 1.7, T)).lerp(flt, open), lq = qPage.slerp(qUp, sm(1.8, 2.7, T));
        const gone = sm(4.02, 4.28, T); leafSet(lp, lq, fresh, lit, bsc * (1 - gone)); if (T > 4.02) SALVE_A.copy(flt); else SALVE_A.copy(flt);
        if (lit > 0.02) { glow(lp, 0.26 * lit, FXC.gold, 0.55 * lit); glow(sp1.copy(lp).add(V3(0, -0.05, 0)), 0.16 * lit, FXC.pearl, 0.5 * lit); if (frnd() < 0.35 * lit) emit(palm.x + frs(0.03), palm.y + 0.02, palm.z + frs(0.03), frs(0.03), 0.10 + frnd() * 0.12, frs(0.03), 0.9, 0.016, mote(), 0, 0.6, -0.02); }
        // warm light and motes rise from the open pages while the spell is worked
        const pg = sm(2.1, 2.8, T) * (1 - sm(5.6, 6.2, T)); if (pg > 0.02) { const c = bookPt(0, 0, 0.03, sp2); glow(c, 0.34 * pg, FXC.gold, 0.22 * pg); if (frnd() < 0.5 * pg) { const q = bookPt(frs(0.11), frs(0.08), 0.02, sp3); emit(q.x, q.y, q.z, frs(0.02), 0.10 + frnd() * 0.14, frs(0.02), 1.1 + frnd() * 0.6, 0.014 + frnd() * 0.01, mote(), 0, 0.4, -0.03); } }
        // the leaf breaks into a ribbon of motes and small silver leaves
        if (T >= 4.02 && T - dt < 4.02) for (let i = 0; i < 26; i++) emit(flt.x + frs(0.03), flt.y + frs(0.04), flt.z + frs(0.03), frs(0.35), frs(0.35), frs(0.35) + 0.15, 0.5 + frnd() * 0.5, 0.022 + frnd() * 0.02, mote(), i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 0, 2.2, 0);
        if (T > 4.15 && head < 1) { for (let sub = 0; sub < 2; sub++) { const u = cl(head - (1 - sub) * dt / 1.35 * 0.5, 0, 1), p = salvePath(u, sp1), tg = salvePath(Math.min(1, u + 0.01), sp2).sub(p).normalize(), sd = sp3.crossVectors(tg, UP).normalize(), w = 0.042 + 0.014 * Math.sin(u * 40), up2 = sp4.crossVectors(sd, tg);
            RIB_SALVE.push(sp5.copy(p).addScaledVector(sd, w), V3().copy(p).addScaledVector(sd, -w), 1); RIB_SALVE2.push(sp5.copy(p).addScaledVector(up2, w), V3().copy(p).addScaledVector(up2, -w), 0.8);
            for (let i = 0; i < 2; i++) emit(p.x + frs(0.03), p.y + frs(0.03), p.z + frs(0.03), frs(0.10), 0.04 + frnd() * 0.22 * (u > 0.36 ? 1 : 0.3), frs(0.10), 0.7 + frnd() * 0.8, 0.018 + frnd() * 0.016, mote(), 0, 1.0, -0.04);
            if (frnd() < 0.55) emit(p.x + frs(0.04), p.y + frs(0.04), p.z + frs(0.04), frs(0.16), frs(0.10), frs(0.16), 0.9 + frnd() * 0.7, 0.045 + frnd() * 0.02, FXC.leaf, 2, 0.9, 0.12, frs(3)); if (frnd() < 0.3) emit(p.x, p.y, p.z, frs(0.2), frs(0.2), frs(0.2), 0.5, 0.03, FXC.gold, 1, 1.5, 0); }
          glow(salvePath(head, sp1), 0.20, FXC.pearl, 0.9); glow(sp1, 0.42, FXC.green, 0.35); }
        // where it has wound round them, soft light rises
        const heal = pulse(T, 5.2, 5.6, 6.0, 6.7); if (heal > 0.02) { const AX = ALLY.position.x, AZ = ALLY.position.z; glow(sp1.set(AX, 1.05, AZ), 1.5 * heal, FXC.gold, 0.30 * heal); glow(sp1.set(AX, 1.25, AZ), 0.7 * heal, FXC.pearl, 0.35 * heal);
          for (let i = 0; i < 3; i++) if (frnd() < heal) { const a = frnd() * TAU, r = 0.16 + frnd() * 0.16; emit(AX + r * Math.cos(a), 0.1 + frnd() * 1.4, AZ + r * Math.sin(a), 0, 0.28 + frnd() * 0.3, 0, 0.9 + frnd() * 0.6, 0.016 + frnd() * 0.014, mote(), frnd() < 0.15 ? 1 : 0, 0.3, -0.05); } }
      };
    }
    // ----- Elderwood Guardian (H7 to H10, I4): her one-time summon. She takes a seed from her pouch and holds it up; it glows like a
    // lantern. She lets it sink into the ground at her right side and roots of light spread. A sapling grows under her hand, twists
    // itself into a fawn, and the fawn stands up as a stag of living wood. She sends it at the foe: it leaps, unravelling into vines.
    // In the game these are three clips: the planting (0 to 7.0 s), the arriving (7.0 to 11.6 s) and the charge (11.6 s to the end).
    if (N === 'guardian') {
      const tk = sm(0.15, 0.6, T), up = sm(0.85, 1.75, T), cr = pulse(T, 2.9, 3.9, 4.35, 5.2), dn = sm(2.9, 4.0, T), ov = sm(4.3, 5.2, T), grow = sm(4.9, 7.0, T), tw = sm(7.0, 8.0, T), lowr = sm(7.2, 8.2, T), rise = sm(9.0, 10.8, T),
        away = pulse(T, 9.0, 9.6, 10.3, 11.0), rest = sm(10.3, 11.1, T), pt = sm(11.6, 12.1, T), end = sm(13.4, 14.3, T), arm = tk * (1 - end), S0 = GRD.S0;
      const lookUp = pulse(T, 1.0, 1.7, 2.75, 3.2), lookDn = pulse(T, 3.1, 3.8, 8.9, 9.7), lookSt = pulse(T, 9.3, 10.3, 11.45, 11.95), fwd = pulse(T, 11.7, 12.2, 13.5, 14.2);
      FXWANT.dummy = T < 14.25; DUMMY.position.copy(GRD.DUM); SPB.want = T > 0.05 && T < 13.9; carried('spine3', 0.10, 1.03, 0.22, SPB.P); SPB.f.set(-0.42, 0.30, 0.86); SPB.n.set(-0.06, 0.90, -0.43);
      // her body: she looks up at the seed; bends her knees and leans to her right to plant it; watches it grow; turns to the Guardian; then faces the foe
      SK.hips.position.y -= 0.40 * cr; SK.hips.position.x -= 0.07 * cr; SK.hips.position.z -= 0.05 * cr; ank.R.x -= 0.07 * cr; ank.R.z -= 0.05 * cr; ank.L.x += 0.04 * cr; ank.L.z += 0.06 * cr;
      add('hips', 0.10 * cr, -0.10 * cr - 0.06 * lookSt, 0); add('spine1', 0.24 * cr, -0.20 * cr - 0.06 * lookDn - 0.12 * lookSt, 0.16 * cr); add('spine2', 0.16 * cr, -0.20 * cr - 0.08 * lookDn - 0.14 * lookSt, 0.12 * cr); add('spine3', 0.05 * cr, -0.12 * cr - 0.06 * lookDn - 0.18 * lookSt + 0.06 * fwd, 0.05 * cr);
      add('neck', -0.10 * lookUp + 0.08 * lookDn - 0.10 * cr, -0.14 * lookUp - 0.26 * lookDn - 0.30 * lookSt, 0); add('head', -0.20 * lookUp + 0.17 * lookDn - 0.12 * cr - 0.05 * lookSt, -0.20 * lookUp - 0.36 * lookDn - 0.40 * lookSt, 0);
      // her right hand: to her pouch, high with the seed, down to the ground, palm down over the sapling, onto the Guardian's neck, then swept out at the foe
      const hP = () => { const P = carried('hips', -0.150, 0.925, 0.120, V3()); P.lerp(carried('spine3', -0.50, 1.74, 0.24, sp1), up); P.lerp(sp1.set(S0.x + 0.02, 0.43, S0.z + 0.02), dn);
        P.lerp(sp1.set(S0.x + 0.08, 0.78 + 0.50 * Math.pow(grow, 0.85) - 0.36 * lowr, S0.z + 0.05), ov); P.lerp(carried('spine3', -0.36, 1.20, 0.14, sp1), away);
        P.lerp(STAG.pt(STAG.cheek, sp1).add(sp2.set(0.075, -0.045, 0.02)), rest); P.lerp(carried('spine3', -0.22, 1.36, 0.54, sp1), pt); return P; };
      reaches.push(['R', hP, arm, -0.3 - 0.25 * up * (1 - dn)]);
      aims.push(['R', V3(-0.45, 0.80, 0.30), V3(0.55, 0.45, 0.45), arm * up * (1 - dn)]); aims.push(['R', V3(-0.12, -0.92, 0.22), V3(0.55, -0.15, -0.80), arm * dn * (1 - ov)]); aims.push(['R', V3(-0.85, -0.10, 0.45), V3(0, -1, 0), arm * ov * (1 - away) * (1 - rest)]);
      aims.push(['R', V3(-0.80, 0.52, -0.30), V3(-0.25, -0.20, -0.95), arm * rest * (1 - pt)]); aims.push(['R', V3(0.05, 0.02, 1), V3(0.25, -0.95, 0), arm * pt]);
      fingers('R', lerp(0.24, 0.24 + 0.40 * tk * (1 - sm(3.95, 4.4, T)) - 0.10 * ov + 0.06 * rest - 0.14 * pt, arm));
      if (T > 1.0 && T < 2.9) mouth = 'smile'; else if (T >= 2.9 && T < 9.2) emo = 'reading'; else if (T >= 9.2 && T < 11.65) emo = 'delighted'; else if (T >= 11.65 && T < 13.35) emo = 'stern'; else if (T >= 13.35) mouth = 'smile';
      afterHands = () => {
        handFrame('R'); const palm = rdW.clone().addScaledVector(rdF, 0.072).addScaledVector(rdN, 0.034), tips = rdW.clone().addScaledVector(rdF, 0.118).addScaledVector(rdN, 0.030);
        // the seed: in her hand, then sinking into the ground
        const held = palm.lerp(tips, sm(2.9, 3.6, T)); if (T < 4.0) GRD.rel.copy(held); const sink = sm(4.0, 4.8, T), sd = sp1.copy(GRD.rel).lerp(sp2.set(S0.x, -0.03, S0.z), sink), show = sm(0.62, 0.80, T) * (1 - sm(0.6, 1, sink)), lit = 0.22 + 0.78 * sm(1.4, 2.3, T);
        SEED.visible = show > 0.01; if (SEED.visible) { SEED.position.copy(sd); SEED.rotation.set(0.10 * Math.sin(T * 1.3), T * 0.5, 0.10 * Math.cos(T * 1.1)); SEED.scale.setScalar(show); seedMat.emissiveIntensity = 0.9 * lit; SHOOT.scale.setScalar(Math.max(0.001, sm(1.9, 2.7, T)));
          glow(sd, 0.30 * lit * show, FXC.gold, 0.55 * lit * show); glow(sd, 0.11 * show, FXC.pearl, 0.55 * lit * show); if (lit > 0.5 && frnd() < 0.30) emit(sd.x + frs(0.03), sd.y + frs(0.03), sd.z + frs(0.03), frs(0.04), 0.03 + frnd() * 0.10, frs(0.04), 0.8 + frnd() * 0.5, 0.013 + frnd() * 0.008, mote(), 0, 0.6, -0.02); }
        if (T >= 0.66 && T - dt < 0.66) for (let i = 0; i < 8; i++) emit(sd.x, sd.y, sd.z, frs(0.2), frs(0.2), frs(0.2), 0.4, 0.02, FXC.gold, 1, 2, 0);
        // roots of light over the ground, and the sapling drawn up under her hand
        ROOTS.position.set(S0.x, 0, S0.z); ROOTS.userData.set(sm(4.45, 5.6, T), 1 - sm(6.3, 7.5, T)); const gl = pulse(T, 4.3, 4.9, 6.9, 7.6); if (gl > 0.02) glow(sp2.set(S0.x, 0.04, S0.z), 0.55 * gl, FXC.gold, 0.35 * gl);
        sapSet(S0, grow, tw); if (grow > 0.02 && tw < 0.9) { const h = Math.pow(grow, 0.85) * (1 - 0.7 * tw); glow(sp2.set(S0.x + 0.02, 0.58 * h, S0.z), 0.34 * sm(0.45, 1, grow), FXC.green, 0.40 * sm(0.45, 1, grow) * (1 - tw)); glow(sp2, 0.12, FXC.pearl, 0.45 * sm(0.45, 1, grow) * (1 - tw));
          if (frnd() < 0.55 * (grow < 1 ? 1 : 0.4)) { const a = frnd() * TAU, r = 0.05 + frnd() * 0.10; emit(S0.x + r * Math.cos(a), frnd() * h, S0.z + r * Math.sin(a), 0, 0.12 + frnd() * 0.2, 0, 0.9 + frnd() * 0.6, 0.014 + frnd() * 0.010, mote(), 0, 0.4, -0.04); } }
        // it twists itself into a fawn, lying down, which lifts its head to her hand; the fawn stands up as the Guardian
        const fl = pulse(T, 7.25, 7.7, 7.9, 8.5); if (fl > 0.01) { glow(sp2.set(S0.x, 0.30, S0.z), 1.0 * fl, FXC.gold, 0.50 * fl); glow(sp2, 0.45 * fl, FXC.pearl, 0.8 * fl, 1, T); }
        if (T >= 7.55 && T - dt < 7.55) for (let i = 0; i < 44; i++) { const a = frnd() * TAU, v = 0.2 + frnd() * 0.7; emit(S0.x + frs(0.08), 0.10 + frnd() * 0.5, S0.z + frs(0.08), Math.cos(a) * v, 0.1 + frnd() * 0.7, Math.sin(a) * v, 0.6 + frnd() * 0.7, 0.020 + frnd() * 0.02, i % 4 === 0 ? FXC.leaf : mote(), i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0, 1.8, 0.3, frs(4)); }
        const here = T >= 7.45 && T < GRD.hit; STAG.G.visible = here;
        if (here) { const riseP = sm(9.0, 10.5, T), ap = sm(7.45, 8.2, T), lift = sm(8.05, 8.9, T), gat = sm(11.72, 12.22, T), u = cl((T - 12.3) / (GRD.hit - 12.3), 0, 1), sc = lerp(lerp(0.20, 0.55, ap), 1, rise), brth = 0.006 * Math.sin(T * 2.1);
          if (T < 12.3) { if (gat > 0) STAG.pose('stand', 'gather', gat, { by: brth }); else STAG.pose('lie', 'stand', riseP, { nk: lerp(0.62, -0.26, lift) * (1 - riseP) + 0.26 * lookSt, hd: lerp(0.25, -0.30, lift) * (1 - riseP) - 0.06 * lookSt, hy: 0.42 * lookSt, ny: 0.22 * lift * (1 - riseP) + 0.20 * lookSt, by: brth * riseP, fd: 0.04 * Math.sin(PI * riseP) }); }
          else { const a = sm(0, 0.24, u), b = sm(0.66, 1, u); if (b > 0) STAG.pose('leap', 'land', b, { bp: -0.20 * Math.cos(PI * u) }); else STAG.pose('gather', 'leap', a, { bp: -0.20 * Math.cos(PI * u) * a }); }
          const e = lerp(u, sm(0, 1, u), 0.35); sp2.copy(GRD.F0).lerp(GRD.ST, rise).lerp(GRD.end, e); sp2.y += 0.50 * Math.sin(PI * Math.pow(u, 0.92)) * (1 - 0.15 * u);
          STAG.set(sp2, (1 - ap) * 3.2 + lerp(0.75, GRD.yaw, riseP), sc, lerp(0.30, 1, sm(9.3, 10.9, T))); const ur = sm(0.10, 0.94, u), zc = STAG.unravel(ur);
          for (const eye of STAG.eyeP) { STAG.pt(eye, sp3); glow(sp3, 0.085 * sc, [0.75, 1.0, 0.35], 0.9 * ap); }
          if (rise > 0.02 && rise < 0.98 && frnd() < 0.7) { const a = frnd() * TAU; emit(sp2.x + 0.3 * sc * Math.cos(a), frnd() * 1.2 * sc, sp2.z + 0.5 * sc * Math.sin(a), 0, 0.15 + frnd() * 0.25, 0, 0.9 + frnd() * 0.5, 0.016 + frnd() * 0.012, mote(), frnd() < 0.2 ? 2 : 0, 0.4, -0.04, frs(3)); }
          // where it comes apart, vines and light trail behind it in a spiral, with leaves (H10)
          if (ur > 0.01) { const rear = STAG.local(0, 1.06, zc, sp3), ph = T * 13;
            const cy = Math.cos(GRD.yaw), sy = Math.sin(GRD.yaw); VINES.forEach((v, j) => { const a = ph * (j % 2 ? 1 : -0.8) + j * TAU / 5, r = 0.13 + 0.07 * Math.sin(T * 9 + j * 2); sp4.set(Math.cos(a) * cy, Math.sin(a), -Math.cos(a) * sy); sp5.set(-Math.sin(a) * cy, Math.cos(a), Math.sin(a) * sy); v.push(V3(rear.x + sp4.x * r, rear.y + sp4.y * r, rear.z + sp4.z * r), sp4, sp5); });
            for (const [R, k] of [[RIB_SALVE, 0], [RIB_SALVE2, PI]]) { const a = ph * 0.6 + k, r = 0.22; sp4.set(Math.cos(a) * cy, Math.sin(a), -Math.cos(a) * sy); R.push(V3(rear.x + sp4.x * (r + 0.05), rear.y + sp4.y * (r + 0.05), rear.z + sp4.z * (r + 0.05)), V3(rear.x + sp4.x * (r - 0.05), rear.y + sp4.y * (r - 0.05), rear.z + sp4.z * (r - 0.05)), 0.9); }
            for (let i = 0; i < 4; i++) emit(rear.x + frs(0.2), rear.y + frs(0.2), rear.z + frs(0.1), frs(0.3) - 0.15 * GRD.h.x, frs(0.3), -0.2 - frnd() * 0.8, 0.5 + frnd() * 0.7, 0.020 + frnd() * 0.03, i === 0 ? FXC.leaf : mote(), i === 0 ? 2 : i === 1 ? 1 : 0, 1.4, 0.15, frs(4)); glow(rear, 0.7, FXC.green, 0.30); glow(rear, 0.3, FXC.pearl, 0.5); } }
        // it strikes: what is left of it bursts, and its vines whip once round the foe
        const DX = GRD.DUM.x, DZ = GRD.DUM.z, w = (T - GRD.hit) / 0.6;
        if (T >= GRD.hit && T - dt < GRD.hit) { dummyHit(4.2); for (let i = 0; i < 90; i++) { const a = frnd() * TAU, v = 0.4 + frnd() * 1.8; emit(DX - 0.25 * GRD.h.x + frs(0.2), 0.7 + frnd() * 1.1, DZ - 0.25 + frs(0.15), Math.cos(a) * v, frs(1) * v * 0.7 + 0.35, Math.sin(a) * v * 0.7 - 0.2, 0.5 + frnd() * 0.9, 0.024 + frnd() * 0.035, i % 3 === 0 ? FXC.leaf : mote(), i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 0, 2.0, 1.0, frs(5)); } }
        if (w >= 0 && w < 1) VINES.forEach((v, j) => { const a = j * TAU / 5 + w * TAU * 1.25 + 2.6, r = 0.26 - 0.05 * w, y = lerp(1.15, j % 2 ? 0.45 : 1.55, w); sp4.set(Math.cos(a), 0, Math.sin(a)); v.push(V3(DX + sp4.x * r, y, DZ + sp4.z * r), sp4, UP); });
        const hf = pulse(T, GRD.hit - 0.01, GRD.hit + 0.04, GRD.hit + 0.10, GRD.hit + 0.55); if (hf > 0.01) { sp2.set(DX, 1.1, DZ - 0.2); glow(sp2, 1.5 * hf, FXC.green, 0.45 * hf); glow(sp2, 0.6 * hf, FXC.pearl, hf, 1, 0.3); }
        const ptg = pt * (1 - end); if (ptg > 0.05 && T < GRD.hit) { handFrame('R'); glow(sp2.copy(rdW).addScaledVector(rdF, 0.10), 0.16 * ptg, FXC.gold, 0.5 * ptg); }
      };
    }
    // ----- Moonflower Garden (H11, H12, I6): she heals the whole party. Her book floats open at her left side. She cups a handful of
    // glowing seeds at her chest, flings them out in a ring, and where they land shoots rise, a vine creeps round, and twelve white
    // flowers open and glow like small moons; light rises round her friends. Then the garden sinks away.
    if (N === 'garden') {
      const inn = sm(0.35, 1.2, T), fl = sm(2.15, 2.62, T), end = sm(11.0, 12.0, T), w = inn * (1 - end), bloom = sm(7.4, 8.6, T) * (1 - sm(10.5, 11.2, T)), lit = sm(7.2, 8.6, T) * (1 - sm(10.3, 11.1, T)), gone = sm(11.0, 11.9, T);
      FXWANT.ally = FXWANT.ally2 = T > 0.15 && T < 11.85; ALLY.position.set(-0.90, 0, 0.02); ALLY.rotation.y = 0; ALLY2.position.set(0.93, 0, 0.02); ALLY2.rotation.y = 0; FLB.want = T > 0.05 && T < 11.5; FLB.lift = sm(0.6, 1.6, T) * (1 - sm(10.6, 11.4, T));
      add('head', 0.13 * inn * (1 - fl) - 0.05 * fl * (1 - end), 0, 0); add('neck', 0.04 * inn * (1 - fl), 0, 0); add('spine3', -0.04 * fl * (1 - end), 0, 0); add('spine2', -0.02 * fl * (1 - end), 0, 0);
      for (const [S, s] of SIDES) { const P = () => carried('spine3', s * lerp(0.050, 0.43, fl), lerp(1.165, 0.965, fl) + 0.05 * Math.sin(PI * fl), lerp(0.215, 0.21, fl) + 0.10 * Math.sin(PI * fl), V3());
        reaches.push([S, P, w, s * 0.25]); aims.push([S, V3(-s * 0.30, 0.45, 0.84).lerp(V3(s * 0.70, -0.12, 0.70), fl), V3(-s * 0.35, 0.85, -0.38).lerp(V3(-s * 0.10, 0.97, -0.20), fl), w]); fingers(S, lerp(0.24, lerp(0.55, 0.13, fl), w)); }
      if ((T > 0.7 && T < 2.1) || (T > 7.7 && T < 10.7)) eyes = 1; if (T > 0.5 && T < 11.6) mouth = 'smile';
      afterHands = () => {
        const hand = {}; for (const [S] of SIDES) { handFrame(S); hand[S] = rdW.clone().addScaledVector(rdF, 0.075).addScaledVector(rdN, 0.03); } const mid = hand.R.clone().lerp(hand.L, 0.5);
        // the seeds in her cupped hands
        const cupG = sm(0.9, 1.7, T) * (1 - sm(2.2, 2.5, T)); if (cupG > 0.02) { glow(mid, 0.34 * cupG, FXC.gold, 0.6 * cupG); for (let i = 0; i < 9; i++) glow(sp1.set(mid.x + 0.045 * Math.sin(i * 2.4 + T * 0.7), mid.y + 0.012 * Math.sin(i * 1.3 + T * 1.9), mid.z + 0.03 * Math.cos(i * 2.4 + T * 0.5)), 0.035, FXC.pearl, 0.8 * cupG);
          if (frnd() < 0.4 * cupG) emit(mid.x + frs(0.05), mid.y + 0.02, mid.z + frs(0.03), frs(0.02), 0.08 + frnd() * 0.12, frs(0.02), 0.8 + frnd() * 0.4, 0.013 + frnd() * 0.008, mote(), 0, 0.5, -0.02); }
        // they fly out in a ring, each trailing a thread of light, and land
        const F = GARDEN.flowers, shoot = GDN.shoot, opn = GDN.open;
        for (let i = 0; i < GARDEN.NF; i++) { const f = F[i], t0 = 2.24 + 0.022 * ((i * 5) % GARDEN.NF), dur = 0.95 + 0.25 * wHash(i * 3.1), u = (T - t0) / dur; if (T <= t0) GDN.from[i].copy(f.p.x < 0 ? hand.R : hand.L); GDN.fly[i] = u;
          if (u > 0 && u < 1) { GARDEN.seedAt(f, GDN.from[i], u, sp1); glow(sp1, 0.075, FXC.gold, 1); glow(sp1, 0.03, FXC.pearl, 1); }
          const tl = t0 + dur; if (T >= tl && T - dt < tl) for (let k = 0; k < 7; k++) emit(f.p.x + frs(0.03), 0.04, f.p.z + frs(0.03), frs(0.25), 0.15 + frnd() * 0.35, frs(0.25), 0.5 + frnd() * 0.4, 0.018 + frnd() * 0.012, k % 2 ? FXC.gold : FXC.pearl, k % 3 === 0 ? 1 : 0, 2, 0.5);
          const lf = pulse(T, tl - 0.02, tl + 0.05, tl + 0.2, tl + 0.9); if (lf > 0.02) glow(sp1.set(f.p.x, 0.05, f.p.z), 0.26 * lf, FXC.gold, 0.6 * lf);
          shoot[i] = cl((T - tl - 0.05) / 1.5, 0, 1); let d = Math.abs(f.a - 0.2) % TAU; if (d > PI) d = TAU - d; opn[i] = cl((T - 6.0 - 0.42 * d) / 1.15, 0, 1); }
        GARDEN.setThreads(GDN.fly, GDN.from, FXVIEW); GARDEN.set(shoot, opn, sm(4.2, 6.7, T), lit, gone);
        // every open flower glows like a small moon, and motes rise from it
        for (let i = 0; i < GARDEN.NF; i++) { const o = sm(0.5, 1, opn[i]) * (1 - gone); if (o < 0.02) continue; GARDEN.face(i, sp1); glow(sp1, 0.40 * o * (0.55 + 0.45 * lit), FXC.pearl, 0.26 * o * (0.25 + 0.75 * lit)); glow(sp1, 0.09 * o, FXC.pearl, 0.45 * o * lit);
          if (frnd() < 0.20 * o * (0.3 + lit)) emit(sp1.x + frs(0.06), sp1.y + frs(0.03), sp1.z + frs(0.06), frs(0.03), 0.10 + frnd() * 0.20, frs(0.03), 1.3 + frnd() * 0.9, 0.014 + frnd() * 0.012, mote(), frnd() < 0.1 ? 1 : 0, 0.3, -0.03); }
        // light rises round her friends as the garden blooms
        if (bloom > 0.02) for (const A of [ALLY, ALLY2]) { glow(sp1.set(A.position.x, 1.0, A.position.z), 1.4 * bloom, FXC.gold, 0.22 * bloom); glow(sp1.set(A.position.x, 1.25, A.position.z), 0.6 * bloom, FXC.pearl, 0.28 * bloom);
          for (let i = 0; i < 2; i++) if (frnd() < bloom) { const a = frnd() * TAU, r = 0.16 + frnd() * 0.16; emit(A.position.x + r * Math.cos(a), 0.1 + frnd() * 1.4, A.position.z + r * Math.sin(a), 0, 0.26 + frnd() * 0.3, 0, 0.9 + frnd() * 0.6, 0.016 + frnd() * 0.014, mote(), frnd() < 0.15 ? 1 : 0, 0.3, -0.05); } }
        // her book: warm light and motes rise from its pages
        const bk = FLB.lift; if (bk > 0.02 && bkFl > 0.5) { const c = bookPt(0, 0, 0.05, sp2); glow(c, 0.42 * bk, FXC.gold, 0.30 * bk); if (frnd() < 0.5 * bk) { const q = bookPt(frs(0.11), frs(0.08), 0.03, sp3); emit(q.x, q.y, q.z, frs(0.02), 0.12 + frnd() * 0.16, frs(0.02), 1.1 + frnd() * 0.6, 0.014 + frnd() * 0.01, mote(), 0, 0.4, -0.03); } }
        // at the end the garden sinks away in sparks
        if (gone > 0.02 && gone < 0.98) for (let k = 0; k < 3; k++) { const a = frnd() * TAU; GARDEN.ringP(a, sp1); emit(sp1.x + frs(0.08), 0.04 + frnd() * 0.16, sp1.z + frs(0.08), frs(0.1), 0.15 + frnd() * 0.3, frs(0.1), 0.6 + frnd() * 0.6, 0.018 + frnd() * 0.016, k ? mote() : FXC.pearl, k === 0 ? 1 : 0, 1, 0); }
      };
    }
    if (N === 'glasses') { const k = pulse(T, 0, 0.55, 1.5, 2.25), push = pulse(T, 0.62, 0.9, 1.05, 1.4);
      add('head', 0.09 * k - 0.07 * push, -0.04 * k, 0); add('neck', 0.03 * k, 0, 0); sync();
      fv.set(0.16, 0.93, -0.30).normalize(); carried('head', -0.003, 1.497 + 0.010 * push, 0.108, tgt).addScaledVector(fv, -0.150);
      reaches.push(['R', tgt.clone(), k, -0.55]); aims.push(['R', fv.clone(), V3(0.6, -0.1, -0.8), k]); fingers('R', lerp(0.24, 1.25, k), lerp(0.24, 0.06, k)); }
    if (N === 'hat') { const k = pulse(T, 0, 0.6, 1.75, 2.45), tip = pulse(T, 0.75, 1.05, 1.3, 1.65);
      add('head', 0.17 * tip, 0.05 * k, 0); add('neck', 0.06 * tip, 0, 0); add('spine3', 0.04 * tip, 0, 0); sync();
      fv.set(-0.30, 0.90, -0.32).normalize(); carried('head', 0.126, 1.546, 0.102, tgt).addScaledVector(fv, -0.135);
      reaches.push(['L', tgt.clone(), k, -0.35]); aims.push(['L', fv.clone(), V3(-0.75, 0.1, -0.65), k]); fingers('L', lerp(0.24, 0.55, k)); if (tip > 0.4) mouth = 'smile'; }
    if (N === 'wave') { const k = pulse(T, 0, 0.5, 2.3, 2.9), env = pulse(T, 0.5, 0.8, 2.0, 2.35), ph = (T - 0.5) * 8.5, w1 = Math.sin(ph) * env, w2 = Math.sin(ph - 0.8) * env;
      // Chris, November 13: "her hand needs to be maybe mid-chest height, and her elbow needs to be lower, so she's just kind of like
      // more coyly waving". A small wave close to her body: elbow down by her side, hand at her chest, head tipped toward it.
      add('head', 0.03 * k, -0.08 * k, 0.10 * k); add('neck', 0, -0.03 * k, 0.03 * k); add('spine3', 0, -0.04 * k, 0); add('clavR', 0, 0, -0.06 * k);
      reaches.push(['R', V3(-0.205 - 0.038 * w1, 1.165 - 0.006 * Math.abs(w1), 0.175), k, -0.25]); aims.push(['R', V3(-0.05 - 0.20 * w2, 1, 0.10), V3(0.10, 0, 1), k]);
      fingers('R', lerp(0.24, 0.12, k)); if (k > 0.5) mouth = 'smile'; }
    if (N === 'look') { const yaw = 0.95 * (pulse(T, 1.8, 2.4, 2.9, 3.4) - pulse(T, 0.1, 0.7, 1.2, 1.7));
      add('head', 0.02 * Math.abs(yaw), 0.50 * yaw, 0); add('neck', 0, 0.30 * yaw, 0); add('spine3', 0, 0.12 * yaw, 0); add('spine2', 0, 0.08 * yaw, 0); }
    if (N === 'twirl') { const u = cl((T - 0.35) / 1.55, 0, 1), k = pulse(T, 0.2, 0.6, 1.7, 2.3), up = pulse(T, 0.4, 0.7, 1.7, 2.0);
      const ang = TAU * u * u * (3 - 2 * u) - 0.22 * pulse(T, 0, 0.3, 0.38, 0.6), rate = dt > 0 ? Math.abs(ang - spinWas) / dt : 0; spinWas = ang;
      add('hips', 0, ang, 0); plant *= 1 - pulse(T, 0.2, 0.36, 1.92, 2.1);
      const h = 0.035 * up, ah = h / 0.10; SK.hips.position.y += h; for (const [S, s] of SIDES) { add('foot' + S, ah, 0, 0); add('uarm' + S, 0, 0, s * 0.72 * k); add('farm' + S, -0.22 * k, 0, 0); }
      add('head', -0.07 * k, 0, 0); add('spine3', -0.04 * k, 0, 0); for (const o of SOFT) if (!o.hair) o.lift = Math.min(0.55, 0.075 * rate); if (k > 0.4) mouth = 'smile'; if (up > 0.5) emo = 'delighted'; } else spinWas = 0;
    if (N === 'curtsey') { const k = pulse(T, 0, 0.7, 2.15, 2.9), dip = pulse(T, 0.6, 1.25, 1.75, 2.4);
      SK.hips.position.y -= 0.13 * dip; SK.hips.position.z -= 0.015 * dip; add('hips', 0.08 * dip, 0, 0); add('spine1', 0.09 * dip, 0, 0); add('spine2', 0.07 * dip, 0, 0); add('neck', 0.10 * dip, 0, 0); add('head', 0.20 * dip, 0, 0);
      ank.R.set(lerp(ANK.R.x, 0.05, k), ANK.R.y + 0.03 * k, lerp(ANK.R.z, -0.24, k)); footP.R = 0.55 * k;
      for (const [S, s] of SIDES) { reaches.push([S, V3(s * 0.335, 0.865 - 0.10 * dip, 0.015), k, s * 0.12]); fingers(S, lerp(0.24, 0.95, k)); }
      for (const o of SOFT) if (!o.hair) { const side = Math.abs(Math.sin(o.ch.a)); o.lift = 0.5 * k * Math.pow(side, 3); }
      if (dip > 0.5) mouth = 'smile'; if (dip > 0.8) emo = 'reading'; }       // at the bottom of the curtsey her eyes are lowered
    if (N === 'herb') { const d1 = pulse(T, 0, 0.9, 3.6, 4.7), rg = pulse(T, 0.6, 1.3, 1.65, 2.25), sml = pulse(T, 2.05, 2.65, 3.25, 3.8), lean = 0.80 * rg + 0.10 * d1 * (1 - rg);
      SK.hips.position.y -= 0.47 * d1; SK.hips.position.z += 0.05 * d1;
      add('spine1', 0.36 * lean, 0, 0); add('spine2', 0.36 * lean, 0, 0); add('spine3', 0.28 * lean, -0.10 * rg, 0); add('neck', -0.10 * rg + 0.06 * sml, 0, 0); add('head', 0.10 * rg + 0.14 * sml, -0.08 * rg, 0);
      ank.L.set(ANK.L.x + 0.01 * d1, ANK.L.y + 0.05 * Math.sin(PI * d1), ANK.L.z + 0.36 * d1); ank.R.set(ANK.R.x - 0.01 * d1, ANK.R.y - 0.015 * d1, ANK.R.z - 0.40 * d1); footP.R = 1.25 * d1; sync();
      const wR = Math.max(rg, sml), a = wR > 1e-4 ? sml / (rg + sml) : 0; fv.set(0.22, 0.86, -0.46).normalize(); carried('head', -0.012, 1.452, 0.128, tg2).addScaledVector(fv, -0.125); tgt.set(-0.15, 0.22, 0.52).lerp(tg2, a);
      reaches.push(['R', tgt.clone(), wR, -0.4]); aims.push(['R', V3(0.05, -0.85, 0.5), V3(0, -0.4, -0.9), rg * (1 - a)]); aims.push(['R', fv.clone(), V3(0.55, 0, -0.83), sml]); fingers('R', lerp(0.24, 0.8, wR));
      reaches.push(['L', () => carried('shinL', ANK.L.x + 0.02, IO_KNEE_Y + 0.085, 0.006, V3()), 0.9 * d1, 0.3]);       // her left hand rests on her raised knee
      if (sml > 0.6) emo = 'delighted'; else if (T > 3.0 && T < 4.4) mouth = 'smile'; }
    // her body is in place: plant her feet, then her hands
    sync();
    for (const [S] of SIDES) { ik2(SK['thigh' + S], SK['shin' + S], SK['foot' + S], ank[S], plant, 0, 1); flatFoot(S, footP[S], plant); }
    sync();
    // a hand travels from where it hangs to its point, a little forward on the way so it clears her skirt and her hair, with its elbow bending as it goes
    bookPlace(dt, N);
    for (const r of reaches) { const k = r[2]; if (k <= 0.0005) continue; const P = typeof r[1] === 'function' ? r[1]() : r[1], e = k * k * (3 - 2 * k);
      SK['hand' + r[0]].getWorldPosition(_p).applyMatrix4(_inv).lerp(P, e); _p.z += 0.09 * Math.sin(PI * e); reach(r[0], tg2.copy(_p), sm(0, 0.15, k), (r[3] || 0) * e); }
    for (const a of aims) aimHand(a[0], a[1], a[2], a[3]);
    for (const [S] of SIDES) wristFix(S);
    if (bkR > 0.001 && SK.book) { sync(); readHands(N, T); }
    else if (bkS > 0.001 && SK.book) { sync(); bookOnPalm(bkS, SPB.P, SPB.f, SPB.n); }
    else if (bkFl > 0.001 && SK.book) bookFloat(bkFl, T);
    pagesSet(bkFl * FLB.lift, T);
    if (afterHands) { sync(); afterHands(); }       // what a spell does once her hands are where they will be drawn: fine finger work, and the lights that start from them
    propVis(true, (N === 'sickle' && T > 0.12 && T < 3.25) || sickNow);
    sync(); softTick(dt);
    return { eyes, mouth, emo };
  }
  function animate(a0, a1, a2, a3) {
    let dt = a3 !== undefined ? a3 : a0; dt = dt > 0 ? Math.min(dt, 0.05) : 0; clock += dt;
    let eyes = 0, mouth = 'rest', emo = null;
    if (mv.name !== 'pose') { mv.t += dt; if (SHOTS[mv.name] && mv.t >= SHOTS[mv.name]) mv = { name: 'idle', t: 0 }; const f = body(mv.name, mv.t, dt); eyes = f.eyes; mouth = f.mouth; emo = f.emo; }
    if (blinking && clock > blinkAt) { blinkT = clock; blinkAt = clock + 2.2 + 2.6 * Math.abs(Math.sin(clock * 12.9)); }
    const bt = clock - blinkT; eyes = Math.max(eyes, bt < 0.05 ? 0.5 : bt < 0.11 ? 1 : bt < 0.17 ? 0.5 : 0);
    if (talking && mv.name !== 'talk') {
      if (clock > mouthAt) { mouthAt = clock + 0.10 + 0.09 * Math.abs(Math.sin(clock * 37.7)); const r = Math.abs(Math.sin(clock * 91.3)); mouthNow = r < 0.30 ? 'rest' : r < 0.66 ? 'open' : r < 0.92 ? 'oo' : 'smile'; }
      mouth = mouthNow;
      if (mv.name === 'pose') { SK.head.rotation.set(0.030 * Math.sin(clock * 4.4) + 0.015, 0.045 * Math.sin(clock * 2.3 + 1), 0.020 * Math.sin(clock * 1.3)); SK.neck.rotation.set(0, 0.025 * Math.sin(clock * 2.3 + 1), 0); }
    } else if (mv.name === 'pose' && (SK.head.rotation.x || SK.head.rotation.y)) { SK.head.rotation.set(0, 0, 0); SK.neck.rotation.set(0, 0, 0); }
    if (mv.name === 'pose') { FXWANT.dummy = FXWANT.ally = FXWANT.ally2 = false; LEAF.visible = false; WAVE.visible = false; PAGES.visible = false; } else if (!SPELLS.includes(mv.name)) { LEAF.visible = false; WAVE.visible = false; }
    if (mv.name !== 'guardian') woodHide(); if (mv.name !== 'garden') GARDEN.hide();
    fxTick(dt, FXWANT.dummy, FXWANT.ally, FXWANT.ally2);
    if (feel) emo = feel; if (held) { if (held.eyes != null) eyes = held.eyes; if (held.mouth) mouth = held.mouth; }
    const key = eyes + '|' + mouth + '|' + emo; if (key !== facePainted) { paintFace(eyes, mouth, emo); facePainted = key; }
  }
  const talk = (on) => { talking = !!on; mouthAt = 0; return talking; };
  const setFace = (eyes, mouth) => { held = eyes == null && !mouth ? null : { eyes, mouth }; facePainted = ''; animate(0); };
  const setFeel = (name) => { feel = FEELS.includes(name) ? name : null; facePainted = ''; animate(0); return feel; };       // hold one of her emotions (or none)
  return { root, skeleton, bones, SK, animate, pose, play, moves: MOVES, shots: SHOTS, settle: () => { sync(); softSettle(); root.updateMatrixWorld(true); }, meshes, spin: 0, time: 0, stanceProgress: 1, setStance() {}, talk, setFace, setFeel, feels: FEELS, spells: SPELLS, spellFx: { group: fxG, dummy: DUMMY, ally: ALLY, ally2: ALLY2, leaf: LEAF, parts: PT, view: FXVIEW }, wood: { STAG, SAP, SEED, ROOTS, sapSet, VINES, GARDEN }, get moveT() { return mv.t; }, get feel() { return feel; }, setBlink: (on) => { blinking = !!on; }, setProps: (on) => { showProps = !!on; if (mv.name === 'pose') propVis(false, false); }, get move() { return mv.name; },
    debug: { SK, meshes, cloths: [], headPoint, headHalfW, JH, HC, FC, CHAINS, SOFT, COL, LEGCAP, LEGPAD, LEGS, HIP, SLV }, get triangles() { return triCount; } };
}
