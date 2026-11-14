
  // ---------- materials (stage one) ----------
  const tBody = bakedTex('body', 2048, 1408, '#3a2c36'); tBody.wrapS = THREE.RepeatWrapping;
  const tLegs = bakedTex('legs', 1024, 1024, '#3a2a26'); tLegs.wrapS = tLegs.wrapT = THREE.RepeatWrapping;
  const tLaceC = bakedTex('lace', 1024, 1024, '#141114'), tLaceA = bakedTex('laceA', 1024, 1024, '#808080'); for (const t of [tLaceC, tLaceA]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } tLaceA.encoding = THREE.LinearEncoding;
  const SKIN_C = (BAKED && BAKED.skinChest) || SKIN || '#c99a80', lit = (o) => Object.assign({ roughness: 0.70, envMapIntensity: 0.2 }, o);
  const skinPainted = (key, W, H, wrap) => { const t = bakedTex(key, W, H, SKIN_C); if (wrap) t.wrapS = THREE.RepeatWrapping; return sheen(std({ map: t, color: lin('#b9b2b6'), roughness: 0.68, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.06); };
  const MATS = {
    // the wrapped painting carries its own soft studio light, so most of it is shown as it was painted and only a little is lit again
    torso: sheen(std({ map: tBody, color: lin('#b9b2b6'), roughness: 0.74, envMapIntensity: 0.25, emissive: lin('#ffffff'), emissiveMap: tBody, emissiveIntensity: 0.34 }), '#8fa4d8', 3, 0.06),
    skin: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_C)), emissive: lin(SKIN_C), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    form: sheen(std(lit({ color: lin('#b9b2b6').multiply(lin(SKIN_C)), emissive: lin(SKIN_C), emissiveIntensity: 0.34 })), '#ffb49a', 3.2, 0.06),
    // the head wears three pictures at once, mixed by which way the skin faces (see buildHead): the front painting, the profile painting, plain skin
    face: (() => {
      const t = faceT;
      const m = sheen(std({ map: t, color: lin('#b9b2b6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.06);
      const ts = bakedTex(BAKED && BAKED.faceSideYoung ? 'faceSideYoung' : 'faceSide', 512, 512, SKIN_C), ta = bakedTex('faceSideA', 512, 512, '#000000'), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        sh.uniforms.uSide = { value: ts }; sh.uniforms.uSideA = { value: ta }; sh.uniforms.uPlain = { value: lin(SKIN_C) }; sh.uniforms.uPlain2 = { value: lin((BAKED && BAKED.skinNeck) || '#be7f62') };       // plain skin is her chest tone, so neck and chest are one colour; the shade under the jaw comes from faceMix
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 faceMix; attribute vec2 uvSide; varying vec4 vFaceMix; varying vec2 vUvSide;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFaceMix = faceMix; vUvSide = uvSide;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSide; uniform sampler2D uSideA; uniform vec3 uPlain; uniform vec3 uPlain2; varying vec4 vFaceMix; varying vec2 vUvSide; vec3 gFaceCol;')
          .replace('#include <map_fragment>', 'vec4 texelColor = mapTexelToLinear( texture2D( map, vUv ) );\n float fSide = texture2D( uSideA, vUvSide ).r * vFaceMix.x;\n vec3 sideCol = mapTexelToLinear( texture2D( uSide, vUvSide ) ).rgb;\n gFaceCol = ( texelColor.rgb * max( 0.0, 1.0 - fSide - vFaceMix.y ) + sideCol * fSide + mix( uPlain, uPlain2, vFaceMix.w ) * vFaceMix.y ) * vFaceMix.z;\n diffuseColor.rgb *= gFaceCol;')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gFaceCol;');
      };
      return m;
    })(),
    // her hair wears four paintings at once: each is laid on from its own side, and they are mixed by which way the hair faces
    hair: (() => {
      const hk = (k) => (BAKED && BAKED[k + 'Soft'] ? k + 'Soft' : k), tS = bakedTex(hk('hairSide'), 512, 512, '#3e282a'), tF = bakedTex(hk('hairFront'), 512, 512, '#3e282a'), tB = bakedTex(hk('hairBack'), 512, 512, '#3e282a'), tT = bakedTex(hk('hairTop'), 512, 512, '#3e282a');
      const HW = (BAKED && BAKED.hairWin) || { side: [-0.16, 0.11, 1.43, 1.70], fb: [-0.135, 0.135, 1.43, 1.70], top: [-0.135, 0.135, -0.17, 0.10] };
      const m = sheen(std({ map: tS, color: lin('#b9b2b6'), roughness: 0.62, envMapIntensity: 0.25, emissive: lin('#ffffff'), emissiveIntensity: 0.36 }), '#c9b6c4', 3, 0.10), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        Object.assign(sh.uniforms, { uHF: { value: tF }, uHB: { value: tB }, uHT: { value: tT }, uHC: { value: new THREE.Vector3(0, 1.565, -0.030) },
          uWS: { value: new THREE.Vector4(HW.side[0], HW.side[1], HW.side[2], HW.side[3]) }, uWF: { value: new THREE.Vector4(HW.fb[0], HW.fb[1], HW.fb[2], HW.fb[3]) }, uWT: { value: new THREE.Vector4(HW.top[0], HW.top[1], HW.top[2], HW.top[3]) } });
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRest;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = position;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uHF; uniform sampler2D uHB; uniform sampler2D uHT; uniform vec3 uHC; uniform vec4 uWS; uniform vec4 uWF; uniform vec4 uWT; varying vec3 vRest; vec3 gHairCol;')
          .replace('#include <map_fragment>', 'vec3 hd = normalize( vRest - uHC );\n float ws = pow( abs( hd.x ), 3.0 ), wf = pow( max( 0.0, hd.z ), 4.0 ), wb = pow( max( 0.0, -hd.z ), 3.0 ), wt = pow( max( 0.0, hd.y ), 1.6 ) * 2.2 * smoothstep( -0.10, 0.02, hd.z ) + pow( max( 0.0, hd.y ), 3.0 ) * 0.5;\n vec2 uvs = vec2( ( vRest.z - uWS.x ) / ( uWS.y - uWS.x ), ( vRest.y - uWS.z ) / ( uWS.w - uWS.z ) );\n vec2 uvf = vec2( ( vRest.x - uWF.x ) / ( uWF.y - uWF.x ), ( vRest.y - uWF.z ) / ( uWF.w - uWF.z ) );\n vec2 uvt = vec2( ( vRest.x - uWT.x ) / ( uWT.y - uWT.x ), 1.0 - ( vRest.z - uWT.z ) / ( uWT.w - uWT.z ) );\n gHairCol = ( mapTexelToLinear( texture2D( map, uvs ) ).rgb * ws + mapTexelToLinear( texture2D( uHF, uvf ) ).rgb * wf + mapTexelToLinear( texture2D( uHB, uvf ) ).rgb * wb + mapTexelToLinear( texture2D( uHT, uvt ) ).rgb * wt ) / ( ws + wf + wb + wt + 0.0001 );\n diffuseColor.rgb *= gHairCol;')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gHairCol;');
      };
      return m;
    })(),
    lock: std({ map: lockTexR((BAKED && BAKED.hairCols) || ['#170e0d', '#3e282a', '#816962']), alphaMap: lockAlphaR(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6, envMapIntensity: 0.3 }),
    band: (() => { const t = bakedTex('band', 1024, 64, '#27408c'); t.wrapS = THREE.MirroredRepeatWrapping; return std({ map: t, color: lin('#d6d2d8'), roughness: 0.86, envMapIntensity: 0.2, side: THREE.DoubleSide }); })(),
    gold: std({ color: lin('#c9963c'), metalness: 1, roughness: 0.34, envMapIntensity: 1.5 }),
    gem: phys({ map: gemTexR(), roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 }),
    wire: std({ color: lin('#1b191d'), metalness: 0.85, roughness: 0.36, envMapIntensity: 1.3 }),
    pad: phys({ color: lin('#d8d2cc'), transparent: true, opacity: 0.55, roughness: 0.2 }),
    lens: phys({ color: lin('#b6a8e8'), transparent: true, opacity: 0.12, roughness: 0.04, metalness: 0, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide }),
    // her hands and arms wear her own paintings, D1 on the left and D2 on the right (bake_hands_r.py); they are lit as her chest is, so skin meets skin
    hand: skinPainted('hands', 1024, 1024, false), handR: skinPainted('handsR', 1024, 1024, false),
    armL: skinPainted('armL', 512, 1024, true), armR: skinPainted('armR', 512, 1024, true),
    nail: phys({ color: lin('#ecc9c0'), transparent: true, opacity: 0.20, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15, depthWrite: false }),      // her nails are painted on her fingers; this is only their gloss
    leggings: sheen(std({ map: tLegs, color: lin('#cfc6c6'), roughness: 0.78, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: tLegs, emissiveIntensity: 0.30 }), '#7a6470', 3, 0.10),
    lacesl: std({ map: tLaceC, alphaMap: tLaceA, alphaTest: 0.30, transparent: false, side: THREE.DoubleSide, roughness: 0.9, color: lin('#8d868c') }),
    laceband: std({ color: lin('#17131a'), roughness: 0.95 }),
    boot: (() => { const n = crinkleTex(), k = new THREE.Vector2(0.36, 0.36); return std({ map: leatherTexR(), color: lin('#c4b8ac'), roughness: 0.58, envMapIntensity: 0.55, normalMap: n, normalScale: k }); })(),
    sole: std({ map: soleTexR(), color: lin('#aaa29c'), roughness: 0.86 }),
    stitch: std({ color: lin('#a98459'), roughness: 0.8 }), eyelet: std({ color: lin('#b08a4e'), roughness: 0.36, metalness: 1, envMapIntensity: 1.4 }), aglet: std({ color: lin('#a8823e'), roughness: 0.35, metalness: 1 }),
    lace: std({ color: lin('#7d5a38'), roughness: 0.92 }), hole: std({ color: lin('#0c0a0a'), roughness: 1 }),
    // belts, satchel and pouch wear the leather of painting F6 (bake_gear_r.py); their buckles and studs are steel, the strap hooks black iron
    gear: std({ map: bakedTex('gear', 1024, 1024, '#3a2c2a'), color: lin('#d6cac2'), roughness: 0.60, envMapIntensity: 0.4 }),
    belt: (() => { const t = bakedTex('beltTex', 128, 128, '#4a3830'); t.wrapS = THREE.RepeatWrapping; return std({ map: t, color: lin('#d6cac2'), roughness: 0.62, envMapIntensity: 0.4 }); })(),
    keeperB: std({ color: lin('#2f5aa6'), roughness: 0.85 }),
    // charms (F7): gold, turquoise and pearl beads, cut amber, cut turquoise crystal
    charmGold: std({ color: lin('#c9a04a'), metalness: 1, roughness: 0.3, envMapIntensity: 1.5 }), teal: std({ color: lin('#2a8f9c'), roughness: 0.22, metalness: 0.15, envMapIntensity: 1.2 }), pearl: std({ color: lin('#d9c6c2'), roughness: 0.3, envMapIntensity: 1.0 }),
    amber: std({ color: lin('#e08a1c'), roughness: 0.1, envMapIntensity: 1.6, transparent: true, opacity: 0.9, emissive: lin('#7a3200'), emissiveIntensity: 0.28 }),
    crystal: std({ color: lin('#2fb0c4'), roughness: 0.1, metalness: 0.25, envMapIntensity: 2.2, transparent: true, opacity: 0.93, emissive: lin('#0b5a68'), emissiveIntensity: 0.14 }),
    gearBrass: std({ color: lin('#b08a4e'), roughness: 0.36, metalness: 1, envMapIntensity: 1.4 }), hookBrass: std({ color: lin('#b08a4e'), roughness: 0.34, metalness: 1, envMapIntensity: 1.4 }), beltHole: std({ color: lin('#0c0a0a'), roughness: 1 }),
    steel: std({ color: lin('#bcb8b0'), metalness: 1, roughness: 0.36, envMapIntensity: 1.3 }),
    // her bow (G1): moonsteel is a pale silver-white metal; the grip is dark blue leather; the two gems are the blue of her headband gem
    moon: std({ color: lin('#e2e6ee'), metalness: 1, roughness: 0.30, envMapIntensity: 1.7 }),
    bowWrap: std({ color: lin('#263c8a'), roughness: 0.74, envMapIntensity: 0.3 }),
    // her sword (G4): a bright blade, moonsteel guard and fittings, the same blue leather on the grip, a turquoise-blue gem in gold; black leather scabbard
    blade: std({ color: lin('#f0f3f8'), metalness: 1, roughness: 0.17, envMapIntensity: 2.1 }), swordSteel: std({ color: lin('#e2e6ee'), metalness: 1, roughness: 0.30, envMapIntensity: 1.7 }),
    swordGrip: std({ color: lin('#263c8a'), roughness: 0.74, envMapIntensity: 0.3 }), swordGold: std({ color: lin('#c9963c'), metalness: 1, roughness: 0.32, envMapIntensity: 1.5 }),
    swordGem: phys({ color: lin('#1f9ec4'), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, emissive: lin('#0c6f9a'), emissiveIntensity: 0.4 }),
    scab: std({ color: lin('#17141a'), roughness: 0.58, envMapIntensity: 0.5 }), scabStrap: std({ color: lin('#2a2020'), roughness: 0.8 }),
    // her knives (G5): each one piece of moonsteel with a handle of dark blue cord; a black leather sheath with a blue stud
    knifeBlade: std({ color: lin('#eef1f6'), metalness: 1, roughness: 0.20, envMapIntensity: 2.0 }), knifeSteel: std({ color: lin('#e2e6ee'), metalness: 1, roughness: 0.30, envMapIntensity: 1.7 }),
    knifeCord: std({ color: lin('#24397f'), roughness: 0.85, envMapIntensity: 0.2 }), sheath: std({ color: lin('#17141a'), roughness: 0.58, envMapIntensity: 0.5 }),
    // the light that runs down her arms (R49_veins.js): a picture two wide and 256 long that is lit for its first half, brightest at the
    // leading edge; sliding it along makes the light run. Light only.
    veins: (() => { const n = 256, d = new Uint8Array(2 * n * 4); for (let j = 0; j < n; j++) { const sv = (j + 0.5) / n, lit = sv < 0.5 ? 0.45 + 0.55 * Math.exp(-(0.5 - sv) / 0.035) : 0;
        for (let i = 0; i < 2; i++) { const k = (j * 2 + i) * 4, v = Math.round(255 * lit * (i ? 0.24 : 1)); d[k] = Math.round(v * 0.78); d[k + 1] = Math.round(v * 0.90); d[k + 2] = v; d[k + 3] = 255; } }
      const t = new THREE.DataTexture(d, 2, n, THREE.RGBAFormat); t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true;
      const m = new THREE.MeshBasicMaterial({ skinning: true, map: t, color: new THREE.Color('#b4d6ff'), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false });
      m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; return m; })(),
    knifeGem: phys({ color: lin('#2191c8'), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, emissive: lin('#0c5fa8'), emissiveIntensity: 0.4 }),
    bowGem: phys({ color: lin('#2191c8'), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, emissive: lin('#0c5fa8'), emissiveIntensity: 0.45 }),
    iron: std({ color: lin('#1b1a1e'), metalness: 0.75, roughness: 0.48, envMapIntensity: 1.0 }),
    sock: std({ map: sockTexR(), color: lin('#d2cbc8'), roughness: 0.97 }),
    cloth: std({ color: lin('#1a1518'), roughness: 0.9 })
  };

  // ---------- bind: one skinned mesh per material ----------
  const root = new THREE.Group(); root.name = 'ranger';
  root.add(SK.hips); if (SK.bow) root.add(SK.bow); if (SK.sword) root.add(SK.sword); if (SK.knifeR) root.add(SK.knifeR, SK.knifeL); root.updateMatrixWorld(true);
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
    m.name = key; m.castShadow = !/^(lens|pad|lock)$/.test(key); m.receiveShadow = true; m.frustumCulled = false;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }
  // Lace and arms. A sleeve is a bell of lace and her forearm swings through where the bell is. Instead of bending the lace out of the
  // way, the picture is drawn so it can never show: the lace is drawn after her body and leaves no mark in the depth picture, then her
  // forearms and hands are drawn once more on top. Wherever the two cross, her forearm is whole and the lace lies behind it.
  if (meshes.lacesl) { meshes.lacesl.material.depthWrite = false; meshes.lacesl.renderOrder = 5;
    const lower = new Set(); for (const k in BI) if (/^(farm|hand)/.test(k) || (bones[BI[k]].parent && /^(hand)/.test(bones[BI[k]].parent.name || ''))) lower.add(BI[k]);
    for (const k in BI) { let b = bones[BI[k]]; while (b && b.isBone) { if (/^hand/.test(b.name || '')) { lower.add(BI[k]); break; } b = b.parent; } }
    for (const key of ['armL', 'armR', 'hand', 'handR', 'nail', 'skin']) { const src = meshes[key]; if (!src) continue; const g = src.geometry, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, ix = g.index.array, keep = [];
      const low = (v) => { let w = 0; for (let j = 0; j < 4; j++) if (lower.has(si.array[v * 4 + j])) w += sw.array[v * 4 + j]; return w; };
      for (let i = 0; i < ix.length; i += 3) if (low(ix[i]) + low(ix[i + 1]) + low(ix[i + 2]) > 1.2) keep.push(ix[i], ix[i + 1], ix[i + 2]);
      if (!keep.length) continue; const g2 = new THREE.BufferGeometry(); for (const n in g.attributes) g2.setAttribute(n, g.attributes[n]); g2.setIndex(keep);
      const o = new THREE.SkinnedMesh(g2, src.material); o.name = key + 'Over'; o.renderOrder = 6; o.frustumCulled = false; o.castShadow = false; o.receiveShadow = true; root.add(o); o.bind(skeleton, new THREE.Matrix4()); meshes[key + 'Over'] = o; } }
  // stage one has no motion yet: pose() sets a few bone turns by hand, for checking her against the paintings
  // ---------- her moves (a first set, written for her: she is the quick, sporty one) ----------
  // pose() holds her still for checking against the paintings. play(name) starts a move: 'idle' (ready, light on her feet), 'walk',
  // 'jog', 'talk' (her own: one quick hand, weight on one hip), and three short ones that end by themselves: 'aim' (she draws a bow
  // that is not built yet), 'cheer' (a jump with an arm thrown up) and 'limber' (she shakes out and bounces). Every frame the bones
  // are set back to rest and the layers are added on top. The Jester's moves are the reference for what a full set holds, not copied.
  let lastPose = { arm: 15, leg: 0 }, mv = { name: 'pose', t: 0 }, wk = 0, jg = 0, gph = 0, clock = 0, blinkAt = 2.4, blinkT = -1, mouthAt = 0, mouthNow = 'rest', facePainted = '';
  const SHOTS = { draw: 5.5, sword: 4.5, knives: 3.2, gem: 3.4, glass: 3.9, cheer: 1.5, limber: 3.9, hit: 1.3, hard: 2.4, dodge: 1.3, win: 3.6, bow: 3.2, wave: 2.7 }, SLOW = { draw: 1.22, sword: 1.25, knives: 1.3, gem: 1.3, glass: 1.3, limber: 1.5, hit: 1.25, hard: 1.2, dodge: 1.2, win: 1.2, bow: 1.2, wave: 1.2 },
    MOVES = ['pose', 'idle', 'walk', 'jog', 'talk', 'draw', 'sword', 'knives', 'gem', 'glass', 'cheer', 'limber', 'hit', 'hard', 'dodge', 'win', 'fall', 'bow', 'wave', 'kneel', 'squat', 'sit', 'hover'];
  const add = (b, x, y, z) => { const r = SK[b].rotation; r.x += x; r.y += y; r.z += z; };
  function restAll() { for (const k in SK) if (!/^(bag|charm|slv|tail|lock)/.test(k)) SK[k].rotation.set(0, 0, 0); SK.hips.position.copy(SK.hips.userData.home); }
  // ---------- fingers ----------
  // A hand shape is [thumb, index, middle, ring, little, spread]: 0 is straight, 1 is curled shut. A finger may also be three numbers,
  // the bend at each of its joints from the knuckle out, for shapes like the hook that holds a bowstring. Her hands ease from one
  // shape to the next. (The angles and axes are the Jester's; the shapes are hers.)
  const HOOK = [0.30, 1.30, 0.70];
  const FP = { relax: [0.30, 0.26, 0.32, 0.38, 0.44, 0.15], soft: [0.14, 0.12, 0.17, 0.22, 0.28, 0.55], open: [0.04, 0.03, 0.02, 0.05, 0.09, 0.95], fist: [0.72, 0.95, 0.96, 0.96, 0.95, 0],
    two: [0.62, 0.04, 0.07, 0.92, 0.94, 0.12], flat: [0.10, 0.02, 0.02, 0.04, 0.08, 0.50],
    grip: [0.62, 0.72, 0.76, 0.79, 0.80, 0.05], hold: [0.58, 0.76, 0.80, 0.83, 0.84, 0], hook: [0.50, HOOK, HOOK, HOOK, 0.84, 0], mudra: [0.46, 0.56, 0.08, 0.10, 0.14, 0.45] };
  const handAxes = {}, _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), SPREAD = [0, 1, 0.3, -0.45, -1.0];
  for (const [S, s] of SIDES) {
    const c = Math.cos(s * A_POSE), sn = Math.sin(s * A_POSE), palm = V3(-s * c, -s * sn, 0), along = V3(sn, -c, 0), td = V3(-s * THUMB.dir[0], THUMB.dir[1], THUMB.dir[2]).normalize();
    td.set(td.x * c - td.y * sn, td.x * sn + td.y * c, td.z);
    const tn = V3(1, 0, 0), tdc = V3(...THUMB.dir).normalize(); tn.addScaledVector(tdc, -tn.x).normalize(); const tb = V3().crossVectors(tdc, tn);
    tn.multiplyScalar(Math.cos(THUMB.roll)).addScaledVector(tb, -Math.sin(THUMB.roll));
    handAxes[S] = { palm, along, curl: V3(0, 0, -s), thumbFlex: V3().crossVectors(td, handDir(s, tn.x, tn.y, tn.z)).normalize(), thumbOpp: along.clone() };
  }
  const fingerNums = (f, o) => { o[0] = f[0]; for (let k = 0; k < 4; k++) { const c = f[k + 1]; if (typeof c === 'number') { o[1 + k * 3] = c * 1.38; o[2 + k * 3] = c * 1.62; o[3 + k * 3] = c * 1.05; } else { o[1 + k * 3] = c[0]; o[2 + k * 3] = c[1]; o[3 + k * 3] = c[2]; } } o[13] = f[5]; return o; };
  const fNow = { R: fingerNums(FP.relax, []), L: fingerNums(FP.relax, []) }, fWant = { R: FP.relax, L: FP.relax }, _fn = [];
  let snapNow = false;
  function fingersTick(dt, snap) {
    for (const [S] of SIDES) { const v = fNow[S], w = fingerNums(fWant[S], _fn), k = snap ? 1 : 1 - Math.exp(-dt * 16), A = handAxes[S];
      for (let i = 0; i < 14; i++) v[i] += (w[i] - v[i]) * k;
      for (let j = 0; j < 4; j++) { const fn = FINGERS[j][0], c0 = v[1 + j * 3], sp = SPREAD[j + 1] * (v[13] - 0.3) * 0.26 * (1 - cl(c0 / 1.38, 0, 1) * 0.8);
        _qa.setFromAxisAngle(A.curl, c0); _qb.setFromAxisAngle(A.palm, sp); SK[fn + '0' + S].quaternion.copy(_qb).multiply(_qa);
        SK[fn + '1' + S].quaternion.setFromAxisAngle(A.curl, v[2 + j * 3]); SK[fn + '2' + S].quaternion.setFromAxisAngle(A.curl, v[3 + j * 3]); }
      const t = v[0]; _qa.setFromAxisAngle(A.thumbOpp, (A.curl.z > 0 ? 1 : -1) * (0.15 + t * 0.9)); _qb.setFromAxisAngle(A.palm, (0.5 - v[13]) * 0.35); SK['thb0' + S].quaternion.copy(_qb).multiply(_qa);
      SK['thb1' + S].quaternion.setFromAxisAngle(A.thumbFlex, t * 0.7); SK['thb2' + S].quaternion.setFromAxisAngle(A.thumbFlex, t * 0.9); }
  }

  // ---------- reach: a hand is put where it is wanted and the arm is worked out from it ----------
  // Everything here is measured in her own space (the space of 'root'), so it holds wherever she stands and whichever way she faces.
  const rInv = new THREE.Matrix4(), _m = new THREE.Matrix4(), _mb = new THREE.Matrix4(), _dp = V3(), _ds = V3(), _ba = V3(), _bb = V3(), _bc = V3(), XAX = V3(1, 0, 0), YAX = V3(0, 1, 0), ZAX = V3(0, 0, 1);
  const Qn = () => new THREE.Quaternion();
  const inRoot = () => { root.updateMatrixWorld(true); rInv.copy(root.matrixWorld).invert(); };
  const rp = (b, out) => out.setFromMatrixPosition(b.matrixWorld).applyMatrix4(rInv);                                          // where a bone is
  const rq = (b, out) => { _m.multiplyMatrices(rInv, b.matrixWorld); _m.decompose(_dp, out, _ds); return out; };               // how a bone is turned
  const rpt = (b, restPt, out) => out.copy(restPt).sub(b.userData.rest).applyMatrix4(b.matrixWorld).applyMatrix4(rInv);        // where a point that rides on a bone is now
  const basisQ = (a, b, out) => { _ba.copy(a).normalize(); _bb.copy(b).addScaledVector(_ba, -b.dot(_ba)).normalize(); _bc.crossVectors(_ba, _bb); _mb.makeBasis(_ba, _bb, _bc); return out.setFromRotationMatrix(_mb); };
  const ARM = {};
  for (const [S] of SIDES) { const u = SK['uarm' + S].userData.rest, f = SK['farm' + S].userData.rest, h = SK['hand' + S].userData.rest, ru = f.clone().sub(u).normalize(), rf = h.clone().sub(f).normalize(), A = handAxes[S];
    ARM[S] = { U: SK['uarm' + S], F: SK['farm' + S], H: SK['hand' + S], share: 0.6, l1: u.distanceTo(f), l2: f.distanceTo(h), rf, qU0: basisQ(ru, ZAX, Qn()).invert(), qF0: basisQ(rf, ZAX, Qn()).invert(), qH0: basisQ(A.along, A.palm, Qn()).invert() }; }
  // how a hand is turned when its fingers point along F and its palm faces P
  const handQ = (S, F, P, out) => basisQ(F, P, out).multiply(ARM[S].qH0);
  const ik = { p0: V3(), d: V3(), pole: V3(), u1: V3(), u2: V3(), E: V3(), b1: V3(), b2: V3(), qP: Qn(), qU: Qn(), qF: Qn(), qL: Qn(), qT: Qn(), lU: Qn(), lF: Qn(), lH: Qn() };
  // Put the wrist of arm S at W, with the hand turned to qH (or carried by the forearm when qH is null). hint is the way her elbow
  // leans. k mixes this with the pose her arm already has: 0 leaves it, 1 takes it whole. Her elbow is a hinge; six tenths of any
  // turn of her wrist about her forearm is given to the forearm itself, as a real forearm turns.
  const reach = (S, W, qH, hint, k) => solve(ARM[S], W, qH, hint, k);
  function solve(A, W, qH, hint, k) {
    if (k <= 0.0005) return 0; const U = A.U, Fb = A.F, H = A.H;
    const p0 = rp(U, ik.p0), qP = rq(U.parent, ik.qP), d = ik.d.copy(W).sub(p0), far = d.length(), dist = cl(far, Math.abs(A.l1 - A.l2) + 0.004, A.l1 + A.l2 - 0.0008); d.multiplyScalar(1 / Math.max(1e-6, far));
    const a = (A.l1 * A.l1 - A.l2 * A.l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, A.l1 * A.l1 - a * a));
    const pole = ik.pole.copy(hint).addScaledVector(d, -hint.dot(d)); if (pole.lengthSq() < 1e-8) pole.set(0, -1, 0).addScaledVector(d, d.y); pole.normalize();
    const u1 = ik.u1.copy(d).multiplyScalar(a).addScaledVector(pole, h).normalize(), E = ik.E.copy(p0).addScaledVector(u1, A.l1), u2 = ik.u2.copy(d).multiplyScalar(dist).add(p0).sub(E).normalize();
    const b1 = ik.b1.copy(pole).multiplyScalar(-1).addScaledVector(u1, pole.dot(u1)).normalize(), qU = basisQ(u1, b1, ik.qU).multiply(A.qU0);
    const c = u2.dot(u1), sn = u2.dot(b1), b2 = ik.b2.copy(b1).multiplyScalar(c).addScaledVector(u1, -sn), qF = basisQ(u2, b2, ik.qF).multiply(A.qF0);
    if (qH && A.share) { const qL = ik.qL.copy(qF).invert().multiply(qH); if (qL.w < 0) qL.set(-qL.x, -qL.y, -qL.z, -qL.w);
      const tw = cl(2 * Math.atan2(qL.x * A.rf.x + qL.y * A.rf.y + qL.z * A.rf.z, qL.w), -2.4, 2.4) * A.share; qF.multiply(ik.qT.setFromAxisAngle(A.rf, tw)); }
    U.quaternion.slerp(ik.lU.copy(qP).invert().multiply(qU), k); Fb.quaternion.slerp(ik.lF.copy(qU).invert().multiply(qF), k);
    if (qH) H.quaternion.slerp(ik.lH.copy(qF).invert().multiply(qH), k);
    U.updateMatrixWorld(true); return far - dist;       // more than zero: the place asked for is further than her arm
  }

  // which way the forearm of chain A will run, elbow to wrist, when its wrist is put at W (the same working as solve, without moving her)
  const forearmDir = (A, W, hint, out) => { const p0 = rp(A.U, ik.p0), d = ik.d.copy(W).sub(p0), far = d.length(), dist = cl(far, Math.abs(A.l1 - A.l2) + 0.004, A.l1 + A.l2 - 0.0008); d.multiplyScalar(1 / Math.max(1e-6, far));
    const a = (A.l1 * A.l1 - A.l2 * A.l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, A.l1 * A.l1 - a * a)), pole = ik.pole.copy(hint).addScaledVector(d, -hint.dot(d)); if (pole.lengthSq() < 1e-8) pole.set(0, -1, 0).addScaledVector(d, d.y); pole.normalize();
    const E = ik.E.copy(d).multiplyScalar(a).addScaledVector(pole, h).normalize().multiplyScalar(A.l1).add(p0); return out.copy(d).multiplyScalar(dist).add(p0).sub(E).normalize(); };
  // A wrist bends only so far. If the way a hand is asked to point (F) is more than lim from her forearm, it is brought back to lim, and
  // the turn that did it is handed back (qFix) so whatever she holds can turn with her hand. Returns true when it had to.
  const _wl = { fd: V3(), v: V3(), n: V3() };
  const wristLimit = (A, W, hint, F, P, lim, qFix) => { const fd = forearmDir(A, W, hint, _wl.fd), c = cl(F.dot(fd), -1, 1); qFix.identity(); if (Math.acos(c) <= lim) return false;
    const v = _wl.v.copy(F).addScaledVector(fd, -c); if (v.lengthSq() < 1e-10) return false; v.normalize(); const n = _wl.n.copy(fd).multiplyScalar(Math.cos(lim)).addScaledVector(v, Math.sin(lim));
    qFix.setFromUnitVectors(F, n); F.copy(n); P.applyQuaternion(qFix); return true; };

  // ---------- light: her bowstring, her arrow (I1) and the sparks where the string is about to be ----------
  // These only ever add light to the picture (HOW-TO-flipbook-look, section 6), so in the Flipbook look they are neither inked nor
  // snapped to her colours. They are made of small solid shapes, sized in metres, so they are the same at any picture size.
  const glowOnly = (m, pre) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = pre ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; return m; };
  const FX = new THREE.Group(); FX.name = 'rangerLight'; root.add(FX);
  const lightMat = (hex) => glowOnly(new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide }));
  const cylG = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true); cylG.translate(0, 0.5, 0);
  const coneG = new THREE.CylinderGeometry(0, 1, 1, 8, 1, true); coneG.translate(0, 0.5, 0);
  const octG = new THREE.OctahedronGeometry(1, 0);
  const lightMesh = (g, hex) => { const m = new THREE.Mesh(g, lightMat(hex)); m.frustumCulled = false; m.visible = false; m.renderOrder = 8; FX.add(m); return m; };
  const _lv = V3();
  // a line of light from a to b: a bright core and two wider, fainter coats round it
  const beam = () => [lightMesh(cylG, '#eaf4ff'), lightMesh(cylG, '#7fb4ff'), lightMesh(cylG, '#4a7dff')];
  const setBeam = (B, a, b, r, op, g) => { _lv.copy(b).sub(a); const L = _lv.length(); if (L > 1e-5) _lv.multiplyScalar(1 / L);
    for (let i = 0; i < 3; i++) { const m = B[i], o = op * [1, 0.26, 0.09][i]; m.visible = o > 0.004 && L > 1e-5; if (!m.visible) continue; const rr = r * [1, 2.8, 6][i] * (i ? (g || 1) : 1); m.position.copy(a); m.scale.set(rr, L, rr); m.quaternion.setFromUnitVectors(YAX, _lv); m.material.opacity = o; } };
  const LT = { strU: beam(), strD: beam(), shaft: beam(), trail: beam(), head: [lightMesh(coneG, '#f4f9ff'), lightMesh(coneG, '#7fb4ff')], fl: [lightMesh(coneG, '#9cc6ff'), lightMesh(coneG, '#5a8cff')], sparks: [] };
  for (let i = 0; i < 11; i++) LT.sparks.push(lightMesh(octG, i % 3 ? '#bcd9ff' : '#f4f9ff'));
  const lightsOff = () => { FX.traverse((o) => { if (o.isMesh) o.visible = false; }); };

  // ---------- her bow: on her back, in her hands, drawn ----------
  // Where the folded bow rides (G6): flat and upright against the middle of her back, following the slope of her back.
  const BACK = (() => { const z = (y) => rTorso(0, y)[2], y0 = 1.205, h = 0.12, tilt = Math.atan2(z(y0 + h) - z(y0 - h), 2 * h);
    return { p: V3(0.012, y0, Math.min(z(y0), (z(y0 + h) + z(y0 - h)) / 2) - 0.019), q: Qn().setFromAxisAngle(XAX, tilt) }; })();
  const GRIP = [0.064 * HAND_S, 0.0235 * HAND_S, 0], HOOKP = [0.112 * HAND_S, 0.021 * HAND_S, 0.019 * HAND_S];      // where a held rod, and a hooked string, sit in her hand: [along her fingers, out from her palm, toward her thumb]
  const ANCH = V3(-0.060, 1.418, 0.040);                // the corner of her jaw on her right side, where the string comes back to (it rides on her head)
  const TR = 2.45;                                       // the moment she lets go, in the move's own seconds
  const K1 = V3(-0.40, 1.17, -0.04), K2 = V3(0.07, 1.20, 0.31);      // the bow's way round her: out past her right side, then in front of her chest
  const D = { pBack: V3(), qBack: Qn(), p: V3(), q: Qn(), qS: Qn(), qt: Qn(), a: V3(), b: V3(), c: V3(), K3: V3(), shL: V3(), anch: V3(), F: V3(), P: V3(), Th: V3(), W: V3(), g: V3(), qH: Qn(), qG: Qn(), qFK: Qn(), pFK: V3(), hint: V3(),
    missL: 0, missR: 0, missLeg: 0, clip: 0, clipLeft: 0, clipLeg: 0, clipAt: '', tU: V3(), tD: V3(), nock: V3(), nock0: V3(), pass: V3(), dir: V3(), tail: V3(), tip: V3(), rel: V3(), relDir: V3(), e1: V3(), e2: V3() };
  const bez = (a, b, c, u, out) => out.copy(a).multiplyScalar((1 - u) * (1 - u)).addScaledVector(b, 2 * u * (1 - u)).addScaledVector(c, u * u);
  // the wrist that puts point g of the bow at the place GP of her hand, the hand turned by yaw about the bow's length
  const onBow = (S, a, f, yaw, GP, outW, outQ) => { const s = S === 'L' ? 1 : -1, cy = Math.cos(yaw), sy = Math.sin(yaw);
    D.F.set(cy, 0, -sy).applyQuaternion(D.q); D.P.set(s * sy, 0, s * cy).applyQuaternion(D.q); D.Th.crossVectors(D.F, D.P).multiplyScalar(-s);
    outW.set(f, a, 0).applyQuaternion(D.q).add(D.p).addScaledVector(D.F, -GP[0]).addScaledVector(D.P, -GP[1]).addScaledVector(D.Th, -GP[2]); return handQ(S, D.F, D.P, outQ); };
  let lastRel = -1;
  function armsAndBow(T, dt) {
    inRoot();
    rpt(SK.spine3, BACK.p, D.pBack); rq(SK.spine3, D.qBack).multiply(BACK.q);
    if (T < 0) { SK.bow.position.copy(D.pBack); SK.bow.quaternion.copy(D.qBack); BOWK.set(0, 0, 0); SK.bow.updateMatrixWorld(true); lightsOff(); MATS.bowGem.emissiveIntensity = 0.45; return; }
    // --- the beats of the move. She pulls the folded bow from her back with her right hand and brings it round to the front; her left
    // hand takes the grip and starts it out to her left while the limbs unroll; sparks, then the string; her right hand hooks the
    // string while it is still in reach, and she pushes the bow out and pulls the string back together. She holds, lets go, the bow
    // dips, and it all runs back: rolled up, passed to her right hand, and put away.
    const bring = sm(0.28, 0.80, T) * (1 - sm(3.46, 3.98, T)), lift = sm(0.20, 0.32, T) * (1 - sm(3.95, 4.08, T)), open = sm(0.84, 1.26, T) * (1 - sm(2.94, 3.36, T));
    const pres = (0.45 * sm(0.84, 1.24, T) + 0.55 * sm(1.28, 1.84, T)) * (1 - sm(2.95, 3.40, T));
    const wR = sm(0.02, 0.27, T) * (1 - sm(4.06, 4.3, T)), wRs = sm(0.86, 1.24, T) * (1 - sm(2.78, 3.22, T)), wLb = sm(0.58, 0.84, T) * (1 - sm(3.42, 3.64, T));
    const loosed = T >= TR, aft = Math.max(0, T - TR), dr = loosed ? 0 : sm(1.28, 1.86, T), fol = sm(2.50, 2.80, T) * (1 - sm(2.95, 3.3, T));
    // --- the bow's own way: off her back, round her right side, to the front, then out to her left at full reach
    D.a.set(0, 0, -0.045 * lift).applyQuaternion(D.qBack).add(D.pBack); bez(D.a, K1, K2, bring, D.p);
    rp(SK.uarmL, D.shL); rpt(SK.head, ANCH, D.anch); D.anch.z += 0.030;                                 // the string stands a little clear of her cheek
    { const r = ARM.L.l1 + ARM.L.l2 - 0.004, dy = 0.085, dz = D.anch.z - GRIP[1] - D.shL.z, dx = Math.sqrt(Math.max(0.01, r * r - dy * dy - dz * dz)); D.K3.set(D.shL.x + dx + GRIP[0], D.shL.y + dy, D.anch.z); }
    D.p.lerp(D.K3, pres); D.p.y += 0.05 * Math.sin(PI * pres) - 0.11 * fol; D.p.x -= 0.02 * fol;
    const yaw = (290 * bring * bring - 345 * bring) * DEG * (1 - pres), tz = (-100 * bring * bring + 94 * bring) * DEG * (1 - pres) - 36 * DEG * fol, px = 14 * DEG * bring * bring * (1 - pres);
    D.qS.setFromAxisAngle(ZAX, tz).multiply(D.qt.setFromAxisAngle(XAX, px)).multiply(D.qt.setFromAxisAngle(YAX, yaw)); D.q.copy(D.qBack).slerp(D.qS, sm(0, 0.3, bring));
    const shake = (T > 1.24 && T < TR ? 0.05 * Math.exp(-(T - 1.24) / 0.12) * Math.sin((T - 1.24) * 40) : 0) + (loosed ? 0.07 * Math.exp(-aft / 0.10) * Math.sin(aft * 55) : 0);
    SK.bow.position.copy(D.p); SK.bow.quaternion.copy(D.q); BOWK.set(open, dr, shake); SK.bow.updateMatrixWorld(true);
    // --- the string's ends, and where the arrow sits on it
    rpt(SK[BOWK.tipBone.U], BOWK.tips.U, D.tU); rpt(SK[BOWK.tipBone.D], BOWK.tips.D, D.tD);
    D.nock0.set(BOWK.stringF, BOWK.nockA, 0).applyQuaternion(D.q).add(D.p); D.pass.set(0.012, BOWK.nockA, 0).applyQuaternion(D.q).add(D.p);
    D.c.copy(D.anch); D.c.y = lerp(D.c.y, D.pass.y, 0.15); D.nock.copy(D.nock0).lerp(D.c, dr);
    if (loosed) D.nock.addScaledVector(D.e1.set(1, 0, 0).applyQuaternion(D.q), 0.035 * Math.exp(-aft / 0.07) * Math.sin(aft * 62));      // the string sings
    // --- her left hand: takes the grip in front of her and carries the bow out
    if (wLb > 0) { rp(SK.handL, D.pFK); rq(SK.handL, D.qFK); onBow('L', 0, 0, -45 * DEG * (1 - pres), GRIP, D.W, D.qG);
      D.W.lerp(D.pFK, 1 - wLb); const arc = 4 * wLb * (1 - wLb); D.W.x += 0.07 * arc; D.W.z += 0.10 * arc; D.qH.copy(D.qFK).slerp(D.qG, wLb);
      const miss = reach('L', D.W, D.qH, D.hint.set(lerp(0.5, 0.15, pres), lerp(-1, -0.55, pres), lerp(-0.3, -1, pres)), sm(0, 0.25, wLb)); if (miss > D.missL) D.missL = miss; }
    // --- her right hand: pulls the bow free by the lower crescent; later goes to the string, draws, and springs back when she lets go
    if (wR > 0) { rp(SK.handR, D.pFK); rq(SK.handR, D.qFK); onBow('R', -BOWK.hubA, 0, -40 * DEG, GRIP, D.W, D.qG); D.qH.copy(D.qG);
      if (wRs > 0) { D.F.set(1, 0, 0).applyQuaternion(D.q); D.P.set(0, 0, -1).applyQuaternion(D.q); D.Th.crossVectors(D.F, D.P);
        D.g.copy(loosed ? D.c : D.nock); if (loosed) { const e = 1 - Math.exp(-aft / 0.06); D.g.addScaledVector(D.F, -0.19 * e); D.g.y += 0.045 * e; }
        D.g.addScaledVector(D.F, -HOOKP[0]).addScaledVector(D.P, -HOOKP[1]).addScaledVector(D.Th, -HOOKP[2]); D.W.lerp(D.g, wRs); D.qH.slerp(handQ('R', D.F, D.P, D.qG), wRs); }
      D.W.lerp(D.pFK, 1 - wR); const arc = 4 * wR * (1 - wR); D.W.x -= 0.07 * arc; D.W.z -= 0.05 * arc; D.qG.copy(D.qH); D.qH.copy(D.qFK).slerp(D.qG, wR);
      D.hint.set(lerp(-0.6, -0.9, bring), lerp(-0.2, -0.45, bring), lerp(-1, 0.05, bring)).lerp(D.e1.set(-0.9, lerp(-0.25, 0.5, loosed ? 1 : dr), lerp(0.1, -0.2, loosed ? 1 : dr)), wRs);
      const miss = reach('R', D.W, D.qH, D.hint, sm(0, 0.25, wR)); if (miss > D.missR) D.missR = miss; }
    fWant.L = wLb > 0.7 ? FP.grip : FP.relax;
    fWant.R = wRs > 0.85 ? (loosed ? (aft < 0.45 ? FP.open : FP.relax) : FP.hook) : wR > 0.75 && wRs < 0.15 ? FP.hold : FP.relax;
    // --- light
    const strOn = sm(1.20, 1.32, T) * (1 - sm(2.80, 2.95, T)), flick = 0.92 + 0.08 * Math.sin(T * 47);
    setBeam(LT.strU, D.tU, D.nock, 0.0012, strOn * flick, 1 + 0.5 * dr); setBeam(LT.strD, D.nock, D.tD, 0.0012, strOn * flick, 1 + 0.5 * dr);
    MATS.bowGem.emissiveIntensity = 0.45 + 1.5 * strOn * (0.3 + 0.7 * (loosed ? Math.exp(-aft / 0.3) : dr));
    const spk = sm(1.02, 1.12, T) * (1 - sm(1.26, 1.40, T)); D.e1.copy(BOWK.tips.U).sub(BOWK.G0).applyQuaternion(D.q).add(D.p); D.e2.copy(BOWK.tips.D).sub(BOWK.G0).applyQuaternion(D.q).add(D.p);
    for (let i = 0; i < LT.sparks.length; i++) { const m = LT.sparks[i], tw = 0.5 + 0.5 * Math.sin(T * (23 + i * 3.1) + i * 1.7), o = spk * tw; m.visible = o > 0.02; if (!m.visible) continue;
      const u = (i + 0.5) / LT.sparks.length; m.position.copy(D.e1).lerp(D.e2, u); m.position.x += 0.012 * Math.sin(i * 2.3 + T * 9); m.position.y += 0.010 * Math.sin(i * 1.3 + T * 7); m.scale.setScalar(0.0022 + 0.0042 * tw); m.rotation.set(T * 3 + i, T * 2, 0); m.material.opacity = o; }
    // the arrow: it forms on the string as she draws, and flies when she lets go
    if (!loosed) { lastRel = -1; D.dir.copy(D.pass).sub(D.nock).normalize(); D.tail.copy(D.nock); }
    else { if (lastRel !== mv) { lastRel = mv; D.rel.copy(D.c); D.relDir.copy(D.pass).sub(D.c).normalize(); } D.dir.copy(D.relDir); D.tail.copy(D.rel).addScaledVector(D.dir, 26 * aft); }
    const aOn = loosed ? 1 - sm(0.7, 0.95, aft) : sm(1.34, 1.62, T), La = loosed ? 0.76 : 0.26 + 0.50 * dr;
    D.tip.copy(D.tail).addScaledVector(D.dir, La); D.e1.copy(D.tip).addScaledVector(D.dir, -0.062);
    setBeam(LT.shaft, D.tail, D.e1, 0.0021, aOn, 1.15);
    for (let i = 0; i < 2; i++) { const m = LT.head[i], o = aOn * (i ? 0.26 : 1); m.visible = o > 0.004; if (m.visible) { const r = i ? 0.024 : 0.0105, L = i ? 0.10 : 0.062; m.position.copy(D.tip).addScaledVector(D.dir, -L + (i ? 0.02 : 0)); m.scale.set(r, L, r); m.quaternion.setFromUnitVectors(YAX, D.dir); m.material.opacity = o; } }
    for (let i = 0; i < 2; i++) { const m = LT.fl[i], o = aOn * (i ? 0.10 : 0.30); m.visible = o > 0.004; if (m.visible) { const r = i ? 0.020 : 0.009, L = i ? 0.15 : 0.10; m.position.copy(D.tail); m.scale.set(r, L, r); m.quaternion.setFromUnitVectors(YAX, D.dir); m.material.opacity = o; } }
    setBeam(LT.trail, D.rel, D.tail, 0.0016, loosed ? 0.8 * Math.exp(-aft / 0.22) * (1 - sm(0.7, 0.95, aft)) : 0, 1.6);
  }
  // ---------- planted feet: her legs are worked out the same way as her arms. Her knee folds backward and her shin does not twist ----------
  const NZ = V3(0, 0, -1), LEG = {}, FOOT_Y = SK.footR.userData.rest.y;
  for (const [S] of SIDES) { const u = SK['thigh' + S].userData.rest, f = SK['shin' + S].userData.rest, h = SK['foot' + S].userData.rest, ru = f.clone().sub(u).normalize(), rf = h.clone().sub(f).normalize();
    LEG[S] = { U: SK['thigh' + S], F: SK['shin' + S], H: SK['foot' + S], l1: u.distanceTo(f), l2: f.distanceTo(h), rf, share: 0, qU0: basisQ(ru, NZ, Qn()).invert(), qF0: basisQ(rf, NZ, Qn()).invert() }; }
  // Put the ankle of leg S at W with the foot turned to qF; hint is the way her knee points
  const plant = (S, W, qF, hint, k) => solve(LEG[S], W, qF, hint, k);

  // ---------- her sword: in its scabbard, drawn, on guard, the cut ----------
  // The scabbard hangs from her belt and swings: its far end is a weight on a spring, pulled to where it would hang. It is kept clear
  // of her left thigh. When she draws, her left hand tips its mouth forward and turns it flat to her, so her right hand can take the grip
  // from above (tilt 0 to 1).
  const SC = { tip: null, vel: V3(), L: 0.36, axis: V3(1, 0, -0.25).normalize() };
  const W = { qh: Qn(), qi: Qn(), qt: Qn(), qr: Qn(), piv: V3(), rest: V3(), tgt: V3(), dir: V3(), tl: V3(), a: V3(), b: V3(), e: V3(), d: V3(), p: V3(), q: Qn(), q2: Qn(), qs: Qn(), sh: V3(), shL: V3(), fk: V3(), qfk: Qn(), ft: V3(), qf: Qn(), hint: V3(),
    F: V3(), P: V3(), Th: V3(), W: V3(), g: V3(), qG: Qn(), qH: Qn(), foot: V3(), tip: V3(), v1: V3(), v2: V3(), shP: V3() };
  function scabTick(dt, settle, tilt) {
    const Hb = SK.hips, B = SK.scab; rq(Hb, W.qh); rpt(Hb, SWK.pivot, W.piv);
    const rest = W.rest.copy(SWK.ds).applyQuaternion(W.qh), tgt = W.tgt.copy(rest); tgt.y -= 0.30; tgt.normalize().multiplyScalar(SC.L).add(W.piv);
    if (!SC.tip || settle) { SC.tip = tgt.clone(); SC.vel.set(0, 0, 0); }
    else { const n = Math.max(1, Math.ceil(dt / 0.012)), st = dt / n; for (let k = 0; k < n; k++) { SC.vel.x += ((tgt.x - SC.tip.x) * 60 - SC.vel.x * 6) * st; SC.vel.y += ((tgt.y - SC.tip.y) * 60 - SC.vel.y * 6) * st; SC.vel.z += ((tgt.z - SC.tip.z) * 60 - SC.vel.z * 6) * st; SC.tip.addScaledVector(SC.vel, st); } }
    const dir = W.dir.copy(SC.tip).sub(W.piv).normalize(), c = cl(dir.dot(rest), -1, 1);
    if (Math.acos(c) > 0.45) { dir.addScaledVector(rest, -c).normalize().multiplyScalar(Math.sin(0.45)).addScaledVector(rest, Math.cos(0.45)); SC.vel.multiplyScalar(0.6); }
    SC.tip.copy(dir).multiplyScalar(SC.L).add(W.piv);
    W.qi.copy(W.qh).invert(); dir.applyQuaternion(W.qi);                                           // into her hips' own space
    const tl = W.tl.copy(rp(SK.shinL, W.a)).sub(rp(SK.thighL, W.b)).normalize().applyQuaternion(W.qi), need = tl.x + 0.035; if (dir.x < need) { dir.x = need; dir.normalize(); }
    { const low = (0.03 - W.piv.y) / (SWK.LEN + 0.05); dir.applyQuaternion(W.qh); if (dir.y < low && low < 1) { const hz = Math.hypot(dir.x, dir.z), k = Math.sqrt(Math.max(0, 1 - low * low)); if (hz > 1e-4) { dir.x *= k / hz; dir.z *= k / hz; } else { dir.x = 0.3 * k; dir.z = -0.95 * k; } dir.y = low; dir.normalize(); } dir.applyQuaternion(W.qi); }       // nor the floor: when she is low it lies back along the ground      // her thigh pushes it out, never through it
    B.quaternion.setFromUnitVectors(SWK.ds, dir); if (tilt) B.quaternion.multiply(W.qr.setFromAxisAngle(SWK.ds, 0.70 * tilt)).premultiply(W.qt.setFromAxisAngle(SC.axis, 0.40 * tilt));
    B.updateMatrixWorld(true);
  }
  // The beats of the sword move, in its own seconds: her right hand crosses to the grip while her left tips the scabbard (to 0.26); the
  // blade slides out as she hops round into her guard, right foot leading toward screen right (to 0.6); guard; the blade goes back over
  // her shoulder (1.02 to 1.24); the cut comes over the top with a long step (1.27 to 1.40); she holds the lunge, recovers to guard
  // (1.9 to 2.3), turns back and puts the sword away (from 2.56).
  const SWB = {};
  const swordBeats = (T, o) => { o.T = T; o.st = sm(0.26, 0.58, T) * (1 - sm(2.74, 3.08, T)); o.hop = Math.sin(PI * sm(0.26, 0.58, T)) + Math.sin(PI * sm(2.74, 3.08, T));
    o.lun = sm(1.20, 1.40, T) * (1 - sm(1.90, 2.28, T)); o.step = Math.sin(PI * sm(1.20, 1.38, T)) + Math.sin(PI * sm(1.90, 2.28, T)); o.a = sm(1.02, 1.24, T); o.b = sm(1.27, 1.39, T); o.c = sm(1.95, 2.30, T);
    o.slide = sm(0.24, 0.48, T) * (1 - sm(2.86, 3.12, T)); o.free = sm(0.34, 0.58, T) * (1 - sm(2.60, 2.92, T)); o.tilt = sm(0.04, 0.26, T) * (1 - sm(0.46, 0.66, T)) + sm(2.56, 2.80, T) * (1 - sm(3.12, 3.32, T));
    o.wR = sm(0.02, 0.26, T) * (1 - sm(3.14, 3.42, T)); return o; };
  // Where the grip is and how the blade is turned once it is in her hand, measured from her right shoulder. The blade turns in the
  // plane of the picture: phi is how far its point is raised from pointing straight at screen right. Guard 50 degrees, back over her
  // shoulder 118, the end of the cut 2 (it dips a little past and comes back).
  const HP = { p: V3(), phi: 0, beta: 0 }, HQ = { p: V3(), phi: 0, beta: 0 }, OQ = {};
  const swordHand = (o, sh, out) => { const ph = lerp(lerp(lerp(50, 118, o.a), 2, o.b), 50, o.c) - 7 * o.b * (1 - o.c) * Math.exp(-Math.max(0, o.T - 1.39) / 0.07), arc = Math.sin(PI * o.b);
    out.p.set(sh.x + lerp(lerp(lerp(0.40, -0.02, o.a), 0.455, o.b), 0.40, o.c) + 0.10 * arc, sh.y + lerp(lerp(lerp(-0.14, 0.26, o.a), -0.03, o.b), -0.14, o.c) + 0.10 * arc, sh.z + lerp(0.03, 0.05, o.a * (1 - o.b)));
    out.phi = ph * DEG; out.beta = lerp(35, 50, o.b * (1 - o.c)) * DEG; return out; };
  // the crescent of light the cut leaves (I5): bright and sharp along its outer edge, fading to nothing on the inside and behind
  const NT = 44, trailG = new THREE.BufferGeometry(), trailP = new Float32Array((NT + 1) * 12), trailC = new Float32Array((NT + 1) * 12);
  trailG.setAttribute('position', new THREE.BufferAttribute(trailP, 3)); trailG.setAttribute('color', new THREE.BufferAttribute(trailC, 3));
  { const ix = []; for (let j = 0; j < NT; j++) { const a = j * 4, b = a + 4; ix.push(a, a + 1, b, a + 1, b + 1, b, a + 2, a + 3, b + 2, a + 3, b + 3, b + 2); } trailG.setIndex(ix); }
  const trailM = new THREE.Mesh(trailG, glowOnly(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide })));
  trailM.frustumCulled = false; trailM.visible = false; trailM.renderOrder = 8; FX.add(trailM); LT.swGlow = beam();
  const swordLightOff = () => { trailM.visible = false; for (const m of LT.swGlow) m.visible = false; MATS.swordGem.emissiveIntensity = 0.4; };
  function swordStage(T, dt, settle) {
    inRoot();
    if (T < 0) { scabTick(dt, settle, 0); rpt(SK.scab, SWK.Psh, W.p); rq(SK.scab, W.q).multiply(SWK.Qsh); SK.sword.position.copy(W.p); SK.sword.quaternion.copy(W.q); SK.sword.updateMatrixWorld(true); swordLightOff(); return; }
    const o = swordBeats(T, SWB);
    // --- her feet: planted. Her right foot leads toward screen right; her left is set back and stays where it is through the lunge
    const kLeg = sm(0, 0.2, o.st);
    if (kLeg > 0) for (const [Sd] of SIDES) { const lead = Sd === 'R', yaw = (lead ? 80 : 12) * DEG * o.st;
      W.ft.set(lead ? 0.26 + 0.34 * o.lun : -0.22, FOOT_Y, lead ? 0.06 : -0.07).lerp(SK['foot' + Sd].userData.rest, 1 - o.st); W.ft.y = FOOT_Y + 0.07 * o.hop * (lead ? 1 : 0.8) + (lead ? 0.055 * o.step : 0);
      const miss = plant(Sd, W.ft, W.qf.setFromAxisAngle(YAX, yaw), W.hint.set(Math.sin(yaw), 0.25, Math.cos(yaw)), kLeg); if (miss > D.missLeg) D.missLeg = miss; }
    // --- the scabbard, then the sword: it slides out along the scabbard and is handed over to her sword hand's own path
    scabTick(dt, settle, o.tilt);
    rq(SK.scab, W.qs); W.d.copy(SWK.ds).applyQuaternion(W.qs); rpt(SK.scab, SWK.Psh, W.p).addScaledVector(W.d, -0.585 * o.slide); W.q.copy(W.qs).multiply(SWK.Qsh);
    rp(SK.uarmR, W.sh); swordHand(o, W.sh, HP); W.p.lerp(HP.p, o.free); W.q.slerp(W.q2.setFromAxisAngle(ZAX, HP.phi - PI / 2), o.free);
    SK.sword.position.copy(W.p); SK.sword.quaternion.copy(W.q); SK.sword.updateMatrixWorld(true);
    // --- her right hand: the grip lies a little across her palm, more so at full reach, so her wrist never has to bend further than a wrist can
    const beta = lerp(35 * DEG, HP.beta, o.free), a = W.a.set(0, 1, 0).applyQuaternion(W.q), e = W.e.set(1, 0, 0).applyQuaternion(W.q);
    W.F.copy(e).multiplyScalar(Math.cos(beta)).addScaledVector(a, Math.sin(beta)); W.Th.copy(a).multiplyScalar(Math.cos(beta)).addScaledVector(e, -Math.sin(beta)); W.P.crossVectors(W.Th, W.F);
    W.W.copy(W.p).addScaledVector(W.F, -GRIP[0]).addScaledVector(W.P, -GRIP[1]); handQ('R', W.F, W.P, W.qG);
    rp(SK.handR, W.fk); rq(SK.handR, W.qfk); W.W.lerp(W.fk, 1 - o.wR); { const arc = 4 * o.wR * (1 - o.wR); W.W.z += 0.10 * arc; } W.qH.copy(W.qfk).slerp(W.qG, o.wR);
    W.hint.set(lerp(-0.7, -0.1, o.free), lerp(-0.6, -1, o.free), 0.5).lerp(W.v1.set(0.2, -0.4, 1), o.a * (1 - o.b));
    { const miss = reach('R', W.W, W.qH, W.hint, sm(0, 0.25, o.wR)); if (miss > D.missR) D.missR = miss; }
    // --- her left hand: steadies the scabbard while the blade leaves it and comes back; in between it is held low and back, thrown back in the lunge
    const wLs = o.tilt, wLb = o.free * (1 - o.tilt), kLh = Math.max(wLs, wLb);
    if (kLh > 0) { rp(SK.handL, W.fk); rp(SK.uarmL, W.shL); W.b.set(lerp(-0.18, -0.40, o.lun), lerp(-0.30, -0.10, o.lun), -0.10).add(W.shL);
      rpt(SK.scab, W.v1.copy(SWK.Pm).addScaledVector(SWK.ns, 0.034).addScaledVector(SWK.ds, -0.02), W.g); W.g.y += 0.05;
      W.W.copy(W.fk).lerp(W.b, wLb).lerp(W.g, wLs); { const bell = 4 * wLs * (1 - wLs), ar = W.arc || (W.arc = V3()); rp(SK.hips, ar); ar.subVectors(W.W, ar); ar.y = 0; if (bell > 0.001 && ar.lengthSq() > 1e-6) W.W.addScaledVector(ar.normalize(), 0.17 * bell); } const miss = reach('L', W.W, null, W.hint.set(0.3, -0.5, -1), sm(0, 0.25, kLh)); if (miss > D.missL) D.missL = miss; }
    fWant.R = o.wR > 0.75 ? FP.hold : FP.relax; fWant.L = o.tilt > 0.6 ? FP.hold : o.free > 0.5 ? (o.lun > 0.5 ? FP.open : FP.soft) : FP.relax;
    // --- light: the blade shines as she cuts, and leaves its crescent
    const glow = sm(1.20, 1.30, T) * (1 - sm(1.45, 1.80, T)); W.foot.copy(W.p).addScaledVector(a, SWK.Y0); W.tip.copy(W.p).addScaledVector(a, SWK.Y1);
    setBeam(LT.swGlow, W.foot, W.tip, 0.0042, 0.5 * glow, 1.3); MATS.swordGem.emissiveIntensity = 0.4 + 1.4 * glow;
    let most = 0;
    for (let j = 0; j <= NT; j++) { const Tq = T - j * 0.006, q = swordBeats(Tq, OQ), dl = o.lun - q.lun; W.shP.set(W.sh.x - 0.31 * dl, W.sh.y + 0.10 * dl, W.sh.z); swordHand(q, W.shP, HQ);
      const w = sm(1.262, 1.30, Tq) * (1 - sm(1.40, 1.47, Tq)) * Math.pow(1 - j / NT, 2.2), ca = Math.cos(HQ.phi), sa = Math.sin(HQ.phi), k = j * 12; most = Math.max(most, w);
      for (let v = 0; v < 4; v++) { const r = [SWK.Y0 + 0.50 * (SWK.Y1 - SWK.Y0), SWK.Y1, SWK.Y1 - 0.022, SWK.Y1 + 0.003][v], c = [0, 0.30, 0.55, 0.85][v] * w; trailP[k + v * 3] = HQ.p.x + ca * r; trailP[k + v * 3 + 1] = HQ.p.y + sa * r; trailP[k + v * 3 + 2] = HQ.p.z;
        trailC[k + v * 3] = c * 0.72; trailC[k + v * 3 + 1] = c * 0.86; trailC[k + v * 3 + 2] = c; } }
    trailM.visible = most > 0.01 && o.free > 0.99; if (trailM.visible) { trailG.attributes.position.needsUpdate = true; trailG.attributes.color.needsUpdate = true; }
  }
  // ---------- her knives: in their sheath, in her hands, thrown ----------
  // The beats, in the move's own seconds: both hands go behind her to the handles (to 0.24); the knives come up out of the sheath and
  // round her sides as she hops her feet wide, left foot toward screen right (to 0.6). Her right hand is up by her head, her left low
  // in front (H8). She coils, throws the first with her right hand (let go at 0.88) while the second is already coming up, and
  // throws that with her left as her body unwinds (let go at 1.20). She watches them go, stands up, and the knives come back to
  // their sheath in a glint of light (from 1.95).
  const KNB = {}, KNQ = {}, TK = [0.88, 1.20], KH = { p: V3(), phi: 0 }, KR = { p: V3(), phi: 0 };
  const knifeBeats = (T, o) => { o.T = T; o.on = sm(0.02, 0.24, T) * (1 - sm(1.50, 1.90, T)); o.st = sm(0.30, 0.58, T) * (1 - sm(1.62, 1.96, T)); o.hop = Math.sin(PI * sm(0.30, 0.58, T)) + Math.sin(PI * sm(1.62, 1.96, T));
    o.slide = sm(0.22, 0.38, T); o.free = sm(0.30, 0.60, T); o.coil = sm(0.56, 0.76, T) * (1 - sm(0.78, 0.88, T)); o.t1 = sm(0.78, 0.90, T); o.f1 = sm(0.88, 1.06, T); o.up2 = sm(0.82, 1.04, T); o.t2 = sm(1.10, 1.22, T); o.f2 = sm(1.20, 1.38, T);
    o.y1 = sm(0.74, 0.88, T); o.y2 = sm(1.06, 1.20, T); o.onH = [o.on * (1 - sm(1.08, 1.42, T)), o.on * (1 - sm(1.40, 1.72, T))]; o.out = sm(1.50, 1.90, T); o.back = sm(1.95, 2.25, T); return o; };
  // where each knife is held and how it is turned once it is in her hand, measured from that hand's shoulder. It turns in the plane of
  // the picture: phi is how far its point is raised from pointing straight at screen right. The wrist snaps late in each throw.
  const knifeHand = (i, o, sh, out) => {
    if (i === 0) { const up = Math.sin(PI * o.t1) * (1 - o.f1); out.phi = lerp(lerp(112 + 10 * o.coil, 6, o.t1 * o.t1), -45, o.f1) * DEG;
      out.p.set(sh.x + lerp(lerp(-0.10 - 0.04 * o.coil, 0.40, o.t1), 0.34, o.f1) + 0.06 * up, sh.y + lerp(lerp(0.22, 0.04, o.t1), -0.22, o.f1) + 0.03 * up, sh.z + lerp(lerp(0.03, 0.07, o.t1), 0.14, o.f1)); }
    else { const up = Math.sin(PI * o.t2) * (1 - o.f2); out.phi = lerp(lerp(lerp(20, 108, o.up2), 6, o.t2 * o.t2), -45, o.f2) * DEG;
      out.p.set(sh.x + lerp(lerp(lerp(0.12, -0.02, o.up2), 0.42, o.t2), 0.36, o.f2) + 0.06 * up, sh.y + lerp(lerp(lerp(-0.32, 0.21, o.up2), 0.04, o.t2), -0.20, o.f2) + 0.03 * up, sh.z + lerp(lerp(lerp(0.22, 0.06, o.up2), 0.06, o.t2), 0.16, o.f2)); }
    return out; };
  const KW = { qfix: Qn(), qh: Qn(), ps: V3(), qs: Qn(), ax: V3(), sh: V3(), p: V3(), q: Qn(), q2: Qn(), a: V3(), e: V3(), F: V3(), P: V3(), W: V3(), fk: V3(), qfk: Qn(), qG: Qn(), qH: Qn(), hint: V3(), ft: V3(), qf: Qn(), dir: V3(), v1: V3(), v2: V3() };
  const KGRIP = [0.060 * HAND_S, 0.0195 * HAND_S], FLY = V3(Math.cos(3 * DEG), Math.sin(3 * DEG), 0);
  LT.kTrail = [beam(), beam()]; LT.kGlint = [[beam(), beam()], [beam(), beam()]];
  const knifeLightOff = () => { for (const B of LT.kTrail) for (const m of B) m.visible = false; for (const G of LT.kGlint) for (const B of G) for (const m of B) m.visible = false; };
  function knifeStage(T) {
    inRoot();
    const drawn = T >= 0, o = drawn ? knifeBeats(T, KNB) : null;
    if (!drawn) knifeLightOff();
    else { const kLeg = sm(0, 0.2, o.st);       // her feet: hopped wide and planted, her left toward screen right
      if (kLeg > 0) for (const [Sd] of SIDES) { const lead = Sd === 'L', yaw = (lead ? 50 : -5) * DEG * o.st;
        KW.ft.set(lead ? 0.27 : -0.25, FOOT_Y, lead ? 0.03 : -0.02).lerp(SK['foot' + Sd].userData.rest, 1 - o.st); KW.ft.y = FOOT_Y + 0.06 * o.hop;
        const miss = plant(Sd, KW.ft, KW.qf.setFromAxisAngle(YAX, yaw), KW.hint.set(Math.sin(yaw), 0.25, Math.cos(yaw)), kLeg); if (miss > D.missLeg) D.missLeg = miss; } }
    rq(SK.hips, KW.qh);
    for (let i = 0; i < 2; i++) { const B = SK[KNK.names[i]], S = i ? 'L' : 'R', s8 = KNK.sheath[i];
      rpt(SK.hips, s8.P, KW.ps); KW.qs.copy(KW.qh).multiply(s8.Q); KW.ax.copy(s8.ax).applyQuaternion(KW.qh);
      if (!drawn) { B.position.copy(KW.ps); B.quaternion.copy(KW.qs); B.scale.setScalar(1); B.updateMatrixWorld(true); continue; }
      // the knife as her hand holds it: up out of its pocket, round her side, then on that hand's own path
      rp(SK['uarm' + S], KW.sh); knifeHand(i, o, KW.sh, KH);
      const arc = 4 * o.free * (1 - o.free); KW.p.copy(KW.ps).addScaledVector(KW.ax, -KNK.pull * o.slide).lerp(KH.p, o.free); KW.p.x += (i ? 0.14 : -0.16) * arc; KW.p.z -= 0.03 * arc;
      KW.q.copy(KW.qs).slerp(KW.q2.setFromAxisAngle(ZAX, KH.phi - PI / 2), o.free);
      // her hand, from the knife: the handle in her fist, the blade out past her thumb
      const cb = Math.cos(15 * DEG), sb = Math.sin(15 * DEG), a = KW.a.set(0, 1, 0).applyQuaternion(KW.q), e = KW.e.set(1, 0, 0).applyQuaternion(KW.q);
      KW.F.copy(e).multiplyScalar(cb).addScaledVector(a, sb); KW.v1.copy(a).multiplyScalar(cb).addScaledVector(e, -sb); if (i) KW.P.crossVectors(KW.F, KW.v1); else KW.P.crossVectors(KW.v1, KW.F);
      KW.W.copy(KW.p).addScaledVector(KW.F, -KGRIP[0]).addScaledVector(KW.P, -KGRIP[1]);
      KW.hint.set((i ? 1 : -1) * lerp(0.6, 0.8, o.free), lerp(-0.3, -0.5, o.free), lerp(-1, 0.3, o.free));
      // Her wrist: cocked back a little in the wind-up, snapped forward at the throw, never past what a wrist can do. Once the knife has
      // gone her open hand follows her forearm. The knife turns with her hand, so its point is still high when she lets go.
      { const aft0 = T - TK[i], lim = lerp(34, 12, sm(0, 0.10, aft0)) * DEG;
        for (let it = 0; it < 2; it++) { if (!wristLimit(ARM[S], KW.W, KW.hint, KW.F, KW.P, lim, KW.qfix)) break; KW.q.premultiply(KW.q2.identity().slerp(KW.qfix, o.free)); KW.W.copy(KW.p).addScaledVector(KW.F, -KGRIP[0]).addScaledVector(KW.P, -KGRIP[1]); } }
      handQ(S, KW.F, KW.P, KW.qG);
      const on = o.onH[i]; rp(SK['hand' + S], KW.fk); rq(SK['hand' + S], KW.qfk); KW.W.lerp(KW.fk, 1 - on); if (T < 0.5) { const ar = 4 * on * (1 - on); KW.W.x += (i ? 0.06 : -0.06) * ar; KW.W.z -= 0.08 * ar; } KW.qH.copy(KW.qfk).slerp(KW.qG, on);
      { const miss = reach(S, KW.W, KW.qH, KW.hint, sm(0, 0.25, on)); if (i) { if (miss > D.missL) D.missL = miss; } else if (miss > D.missR) D.missR = miss; }
      // the knife itself: in her hand until she lets go, then flying point first, then back in its pocket
      const aft = T - TK[i], G = LT.kGlint[i]; let trail = 0, glint = 0;
      if (aft < 0) { B.position.copy(KW.p); B.quaternion.copy(KW.q); B.scale.setScalar(1); }
      else if (o.back <= 0) { knifeHand(i, knifeBeats(TK[i], KNQ), KW.sh, KR); B.position.copy(KR.p).addScaledVector(FLY, 0.02 + 19 * aft); B.quaternion.setFromAxisAngle(ZAX, lerp(40, 3, sm(0, 0.07, aft)) * DEG - PI / 2); B.scale.setScalar(aft < 0.5 ? 1 : 0.0001);
        trail = 0.75 * Math.exp(-aft / 0.16) * (1 - sm(0.35, 0.5, aft)); KW.v2.copy(B.position).addScaledVector(FLY, -Math.min(19 * aft, 1.6)); }
      else { B.position.copy(KW.ps); B.quaternion.copy(KW.qs); B.scale.setScalar(Math.max(0.0001, o.back)); glint = Math.sin(PI * o.back); }
      B.updateMatrixWorld(true);
      setBeam(LT.kTrail[i], KW.v2, B.position, 0.0018, trail, 1.5);
      KW.v1.copy(KW.ps).addScaledVector(XAX, -0.045 * glint); KW.v2.copy(KW.ps).addScaledVector(XAX, 0.045 * glint); setBeam(G[0], KW.v1, KW.v2, 0.0008, glint, 1);
      KW.v1.copy(KW.ps).addScaledVector(YAX, -0.065 * glint); KW.v2.copy(KW.ps).addScaledVector(YAX, 0.065 * glint); setBeam(G[1], KW.v1, KW.v2, 0.0008, glint, 1);
      const held = aft < 0 && on > 0.8; if (i) fWant.L = held ? FP.fist : aft >= 0 && aft < 0.35 ? FP.open : FP.relax; else fWant.R = held ? FP.fist : aft >= 0 && aft < 0.35 ? FP.open : FP.relax; }
  }
  // ---------- her magic: the gem (H9) and Silverglass (H6), with their light (I2, I3, I4, I6) ----------
  // Small pictures of light, drawn once: a soft round glow, a star with four long rays, a thin ring, and the pane of glass.
  const cvTex = (n, draw) => { const c = document.createElement('canvas'); c.width = c.height = n; draw(c.getContext('2d'), n); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; };
  const TXG = cvTex(128, (g, n) => { const r = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.55)'); r.addColorStop(0.6, 'rgba(255,255,255,0.12)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, n, n); });
  const TXS = cvTex(256, (g, n) => { for (const [sx, sy] of [[1, 0.035], [0.035, 1], [0.16, 0.16]]) { g.save(); g.translate(n / 2, n / 2); g.scale(sx, sy); const r = g.createRadialGradient(0, 0, 0, 0, 0, n / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); g.arc(0, 0, n / 2, 0, TAU); g.fill(); g.restore(); } });
  const TXR = cvTex(256, (g, n) => { g.strokeStyle = 'rgba(255,255,255,1)'; g.shadowColor = 'rgba(255,255,255,1)'; g.shadowBlur = n * 0.03; g.lineWidth = n * 0.012; g.beginPath(); g.arc(n / 2, n / 2, n * 0.42, 0, TAU); g.stroke(); g.stroke(); });
  // The pane (I2): a round window of thin petal-shaped facets, made of circles laid over one another, with a crescent moon at its centre
  const TXP = cvTex(768, (g, n) => { const c = n / 2, R = n * 0.455; g.globalCompositeOperation = 'lighter'; g.save(); g.beginPath(); g.arc(c, c, R, 0, TAU); g.clip();
    for (const [k, q, rr] of [[12, 0.5, 0.5], [12, 0.75, 0.25], [6, 0.5, 0.25]]) for (let i = 0; i < k; i++) { const a = (i / k) * TAU + (rr < 0.3 ? 0.26 : 0), x = c + R * q * Math.cos(a), y = c + R * q * Math.sin(a);
      g.beginPath(); g.arc(x, y, R * rr, 0, TAU); g.fillStyle = i % 3 ? 'rgba(60,110,255,0.055)' : 'rgba(120,90,240,0.065)'; g.fill(); g.strokeStyle = 'rgba(205,228,255,0.50)'; g.lineWidth = n * 0.0032; g.shadowColor = 'rgba(150,190,255,0.9)'; g.shadowBlur = n * 0.008; g.stroke(); }
    g.restore(); g.shadowColor = 'rgba(160,200,255,1)'; g.shadowBlur = n * 0.02; g.strokeStyle = 'rgba(235,245,255,0.95)'; g.lineWidth = n * 0.008; g.beginPath(); g.arc(c, c, R, 0, TAU); g.stroke(); g.stroke();
    g.globalCompositeOperation = 'destination-out'; g.shadowBlur = 0; g.fillStyle = 'rgba(0,0,0,0.85)'; g.beginPath(); g.arc(c, c, R * 0.235, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter'; g.save(); g.beginPath(); g.arc(c - R * 0.02, c, R * 0.20, 0, TAU); g.clip(); g.beginPath(); g.rect(0, 0, n, n); g.arc(c + R * 0.075, c - R * 0.03, R * 0.175, 0, TAU, true); g.fillStyle = 'rgba(232,242,255,0.96)'; g.fill('evenodd'); g.restore(); });
  const sprite = (tex, hex) => { const sp = new THREE.Sprite(glowOnly(new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(hex), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false }))); sp.visible = false; sp.renderOrder = 8; FX.add(sp); return sp; };
  const setSprite = (sp, p, size, op) => { sp.visible = op > 0.004 && size > 1e-4; if (!sp.visible) return; sp.position.copy(p); sp.scale.set(size, size, 1); sp.material.opacity = op; };
  const rndK = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };       // the same scatter every time
  const MG = { gGlow: sprite(TXG, '#9fd0ff'), gStar: sprite(TXS, '#eaf4ff'), gRing: sprite(TXR, '#a8d4ff'), flash: sprite(TXG, '#cfe4ff'), sparks: [], rim: [], shards: [] };
  for (let i = 0; i < 18; i++) MG.sparks.push(sprite(i % 3 ? TXS : TXG, i % 2 ? '#cfe4ff' : '#f4f9ff'));
  for (let i = 0; i < 12; i++) MG.rim.push(sprite(TXS, '#dcebff'));
  MG.pane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowOnly(new THREE.MeshBasicMaterial({ map: TXP, color: new THREE.Color('#ffffff'), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide })));
  MG.pane.frustumCulled = false; MG.pane.visible = false; MG.pane.renderOrder = 7; FX.add(MG.pane);
  // shards (I3): long diamonds, thin slivers and crescents
  { const flatG = (pts, tris) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(tris); return g; };
    const dia = (w) => flatG([0, 1, 0, w, 0, 0, 0, -1, 0, -w, 0, 0], [0, 3, 1, 1, 3, 2]), cres = (() => { const p = [], ix = [], n = 10; for (let i = 0; i <= n; i++) { const a = lerp(-1.25, 1.25, i / n), k = Math.cos(a / 1.25 * PI / 2); p.push(Math.cos(a) - 0.55, Math.sin(a), 0, Math.cos(a) - 0.55 - 0.42 * k, Math.sin(a), 0); } for (let i = 0; i < n; i++) { const a = i * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } return flatG(p, ix); })();
    const GS = [dia(0.34), cres, dia(0.15)]; for (let i = 0; i < 20; i++) MG.shards.push(lightMesh(GS[i % 3], i % 4 === 0 ? '#eaf2ff' : i % 2 ? '#a9c8ff' : '#b9b0ff')); }
  const magicOff = () => { for (const k of ['gGlow', 'gStar', 'gRing', 'flash']) MG[k].visible = false; for (const a of [MG.sparks, MG.rim, MG.shards]) for (const m of a) m.visible = false; MG.pane.visible = false; if (meshes.veins) meshes.veins.visible = false; MATS.gem.emissiveIntensity = 0; MATS.lens.emissiveIntensity = 0; };
  MATS.gem.emissive = lin('#7fc4ff'); MATS.gem.emissiveIntensity = 0; MATS.lens.emissive = lin('#9fc8ff'); MATS.lens.emissiveIntensity = 0; if (meshes.veins) { meshes.veins.visible = false; meshes.veins.castShadow = false; meshes.veins.renderOrder = 7; }
  // The hover: a round of pale light on the ground under her that turns slowly, a soft glow at her gem, and a few sparks that hang round her.
  const HV = { p: V3(), g: V3(), s: V3(), q: Qn(), q2: Qn() };
  function hoverLight() { const a = PE.hover; if (a <= 0.01) return; inRoot(); rp(SK.hips, HV.p); rpt(SK.head, GEMP, HV.g);
    MG.pane.visible = true; MG.pane.position.set(HV.p.x, 0.014, HV.p.z + 0.14); MG.pane.quaternion.copy(HV.q.setFromAxisAngle(XAX, -PI / 2)).multiply(HV.q2.setFromAxisAngle(ZAX, clock * 0.22)); MG.pane.scale.setScalar(0.5 + 0.55 * a); MG.pane.material.opacity = 0.50 * a;
    setSprite(MG.gGlow, HV.g, 0.15 + 0.02 * Math.sin(clock * 1.5), 0.55 * a); MATS.gem.emissiveIntensity = 0.9 * a;
    for (let i = 0; i < 10; i++) { const an = i * TAU / 10 + clock * 0.22 + 2 * rndK(i, 1), r = 0.40 + 0.16 * rndK(i, 2); HV.s.set(HV.p.x + r * Math.cos(an), HV.p.y - 0.12 + 0.75 * rndK(i, 3) + 0.035 * Math.sin(clock * 1.3 + i), HV.p.z + 0.12 + r * Math.sin(an)); setSprite(MG.sparks[i], HV.s, 0.022 + 0.022 * rndK(i, 4), a * (0.35 + 0.45 * (0.5 + 0.5 * Math.sin(clock * 2.1 + i * 1.7)))); } }
  const GEMP = (() => { const O = bandPt(0, bandPh(0), 0.0036); return V3(O[0], O[1], O[2] + 0.012); })();       // just in front of the gem on her headband (it rides on her head)
  const MW = { gw: V3(), F: V3(), P: V3(), W: V3(), qG: Qn(), qH: Qn(), fk: V3(), qfk: Qn(), hint: V3(), sh: V3(), n: V3(), side: V3(), C: V3(), v: V3(), palm: V3(), ft: V3(), qf: Qn(), q: Qn(), q2: Qn() };
  // The gem, in its own seconds: her right hand rises and two fingers touch the gem (0.45); it flares, a ring of light opens from it, and
  // light runs down both her arms to her knuckles (to 1.05). For one breath (0.55 to 1.15) everything hangs still: sparks in the air
  // round her, her sleeves, hair and charms. Then it all lets go at once, her eyes open and her hand comes down. Her arms stay lit a while.
  const GMB = {}; let stillK = 0, gemWas = 9;
  const gemBeats = (T, o) => { o.T = T; o.up = sm(0.05, 0.45, T) * (1 - sm(1.20, 1.65, T)); o.touch = sm(0.42, 0.50, T); o.run = sm(0.46, 1.05, T); o.still = sm(0.55, 0.66, T) * (1 - sm(1.15, 1.19, T)); o.lit = o.touch * (1 - sm(1.35, 2.45, T)); o.eyes = sm(0.30, 0.42, T) * (1 - sm(1.18, 1.30, T)); o.burst = sm(1.15, 1.55, T); return o; };
  function gemStage(T) {
    if (T < 0) { gemWas = 9; return false; }
    inRoot(); const o = gemBeats(T, GMB); rpt(SK.head, GEMP, MW.gw);
    // her right hand: first two fingers straight, the others folded, their tips on the gem
    if (o.up > 0) { MW.F.set(0.50, 0.80, -0.35).normalize(); MW.P.set(-0.10, -0.35, -0.93); MW.W.copy(MW.gw).addScaledVector(MW.F, -0.150).addScaledVector(MW.P.normalize(), -0.004); handQ('R', MW.F, MW.P, MW.qG);
      rp(SK.handR, MW.fk); rq(SK.handR, MW.qfk); MW.W.lerp(MW.fk, 1 - o.up); { const arc = 4 * o.up * (1 - o.up); MW.W.z += 0.10 * arc; MW.W.x -= 0.05 * arc; } MW.qH.copy(MW.qfk).slerp(MW.qG, o.up);
      const miss = reach('R', MW.W, MW.qH, MW.hint.set(-0.8, -0.3, 0.5), sm(0, 0.25, o.up)); if (miss > D.missR) D.missR = miss; }
    fWant.R = o.up > 0.5 ? FP.two : FP.relax;
    // the gem's light (I6): a soft glow, a star with four rays when she touches it, a ring that opens and fades
    const since = Math.max(0, T - 0.46), flare = o.touch * Math.exp(-since / 0.28), ru = cl(since / 0.55, 0, 1);
    setSprite(MG.gGlow, MW.gw, 0.07 + 0.07 * o.lit + 0.14 * flare, 0.45 * o.lit + 0.4 * flare); setSprite(MG.gStar, MW.gw, 0.16 + 0.42 * flare + 0.05 * o.lit * Math.sin(T * 9), Math.max(flare, 0.35 * o.lit));
    setSprite(MG.gRing, MW.gw, 0.05 + 0.85 * ru, o.touch * Math.pow(1 - ru, 1.6)); MATS.gem.emissiveIntensity = 2.2 * o.lit; MATS.lens.emissiveIntensity = 0.55 * o.lit;
    // the light down her arms: the picture slides so the lit part grows from her shoulders to her knuckles
    if (meshes.veins) { meshes.veins.visible = o.lit > 0.01; MATS.veins.opacity = o.lit; MATS.veins.map.offset.y = 0.5 * (1 - o.run); }
    // the moment: sparks hang where they are, then drift up and out and fade
    for (let i = 0; i < MG.sparks.length; i++) { const a = rndK(i, 1) * TAU, r = 0.28 + 0.42 * rndK(i, 2), y = 0.35 + 1.45 * rndK(i, 3), on = sm(0.52 + 0.1 * rndK(i, 4), 0.66 + 0.1 * rndK(i, 4), T) * (1 - sm(0.1, 1, o.burst));
      MW.v.set(Math.cos(a) * r * (1 + 0.5 * o.burst), y + 0.22 * o.burst * o.burst, 0.10 + Math.sin(a) * r * 0.55 * (1 + 0.5 * o.burst)); setSprite(MG.sparks[i], MW.v, (0.035 + 0.06 * rndK(i, 5)) * (i % 3 ? 1.5 : 0.6), on * (0.55 + 0.45 * rndK(i, 6))); }
    if (gemWas < 1.17 && T >= 1.17 && gearKick) gearKick(); gemWas = T;       // everything lets go at once
    return true;
  }
  // Silverglass, in its own seconds: she hops her feet wide and draws her left hand back (to 0.36), pushes her palm out flat toward screen
  // right and a little toward us (0.36 to 0.60), and the pane opens in front of it (0.52 to 0.92): a round window of glass a metre
  // across, with loose shards floating at its rim. She holds it (to 1.90), then it breaks into shards that scatter and fade.
  const GLB = {}, PN = V3(0.80, 0, 0.60).normalize(), PSIDE = V3(0.60, 0, -0.80), PQ = Qn().setFromUnitVectors(ZAX, PN);
  const glassBeats = (T, o) => { o.T = T; o.st = sm(0.05, 0.36, T) * (1 - sm(2.15, 2.55, T)); o.hop = Math.sin(PI * sm(0.05, 0.36, T)) + Math.sin(PI * sm(2.15, 2.55, T)); o.back = sm(0.10, 0.34, T) * (1 - sm(0.36, 0.56, T)); o.push = sm(0.36, 0.60, T) * (1 - sm(2.02, 2.40, T));
    o.arms = sm(0.08, 0.36, T) * (1 - sm(2.05, 2.50, T)); o.form = sm(0.52, 0.92, T); o.brk = sm(1.90, 2.00, T); return o; };
  function glassStage(T) {
    if (T < 0) return false;
    inRoot(); const o = glassBeats(T, GLB), kLeg = sm(0, 0.2, o.st);
    if (kLeg > 0) for (const [Sd] of SIDES) { const lead = Sd === 'L', yaw = (lead ? 35 : -8) * DEG * o.st; MW.ft.set(lead ? 0.25 : -0.24, FOOT_Y, lead ? 0.04 : -0.03).lerp(SK['foot' + Sd].userData.rest, 1 - o.st); MW.ft.y = FOOT_Y + 0.05 * o.hop;
      const miss = plant(Sd, MW.ft, MW.qf.setFromAxisAngle(YAX, yaw), MW.hint.set(Math.sin(yaw), 0.25, Math.cos(yaw)), kLeg); if (miss > D.missLeg) D.missLeg = miss; }
    // her left palm, flat, fingers up, pushed out along the way the pane faces; her right hand raised open behind it
    rp(SK.uarmL, MW.sh); MW.F.set(0.06, 1, 0).normalize(); MW.P.copy(PN); MW.W.copy(MW.sh).addScaledVector(PN, 0.20 - 0.08 * o.back + 0.235 * o.push); MW.W.y += 0.04; handQ('L', MW.F, MW.P, MW.qG); MW.palm.copy(MW.W).addScaledVector(MW.F, 0.085);
    rp(SK.handL, MW.fk); rq(SK.handL, MW.qfk); MW.W.lerp(MW.fk, 1 - o.arms); MW.qH.copy(MW.qfk).slerp(MW.qG, o.arms); { const miss = reach('L', MW.W, MW.qH, MW.hint.set(0.3, -1, -0.4), sm(0, 0.25, o.arms)); if (miss > D.missL) D.missL = miss; }
    rp(SK.uarmR, MW.sh); MW.F.set(0.25, 0.95, 0.10).normalize(); MW.P.copy(PN); MW.W.copy(MW.sh).add(MW.v.set(0.17, 0.02 + 0.03 * o.push, 0.24)); handQ('R', MW.F, MW.P, MW.qG);
    rp(SK.handR, MW.fk); rq(SK.handR, MW.qfk); MW.W.lerp(MW.fk, 1 - o.arms); { const arc = 4 * o.arms * (1 - o.arms); MW.W.z += 0.08 * arc; } MW.qH.copy(MW.qfk).slerp(MW.qG, o.arms); { const miss = reach('R', MW.W, MW.qH, MW.hint.set(-0.7, -0.7, 0.2), sm(0, 0.25, o.arms)); if (miss > D.missR) D.missR = miss; }
    fWant.L = o.arms > 0.5 ? FP.flat : FP.relax; fWant.R = o.arms > 0.5 ? FP.soft : FP.relax;
    // the pane: in front of her palm, its centre a little below and beyond it
    const R = 0.50, grow = o.form < 1 ? o.form * (1 + 0.35 * Math.sin(PI * o.form) * (1 - o.form)) : 1, alive = o.form * (1 - o.brk);
    MW.C.copy(MW.palm).addScaledVector(PN, 0.07).addScaledVector(PSIDE, 0.10); MW.C.y -= 0.13;
    MG.pane.visible = alive > 0.01; if (MG.pane.visible) { MG.pane.position.copy(MW.C); MG.pane.quaternion.copy(PQ).multiply(MW.q2.setFromAxisAngle(ZAX, 0.9 * (1 - o.form) + 0.05 * Math.sin(T * 1.7))); MG.pane.scale.setScalar(2 * R / 0.91 * Math.max(0.02, grow)); MG.pane.material.opacity = alive * (0.86 + 0.14 * Math.sin(T * 13)); }
    const fl = Math.sin(PI * sm(1.86, 2.12, T)) + 0.6 * Math.sin(PI * sm(0.50, 0.80, T)); setSprite(MG.flash, MW.C, 0.5 + 0.9 * fl, 0.55 * fl);
    for (let i = 0; i < MG.rim.length; i++) { const a = (i / MG.rim.length) * TAU + T * 0.5, tw = 0.5 + 0.5 * Math.sin(T * (17 + i * 2.3) + i), on = sm(0.50, 0.70, T) * (1 - o.brk) * tw; MW.v.copy(MW.C).addScaledVector(PSIDE, Math.cos(a) * R * grow).addScaledVector(YAX, Math.sin(a) * R * grow); setSprite(MG.rim[i], MW.v, 0.03 + 0.05 * tw, on); }
    // shards: six float at the rim while the pane stands; when it breaks, all of them fly out from where the glass was, turn, slow and fade
    const e = T < 1.92 ? 0 : 1 - Math.exp(-(T - 1.92) / 0.30), gone = 1 - sm(2.25, 2.95, T);
    for (let i = 0; i < MG.shards.length; i++) { const m = MG.shards[i], loose = i < 6, a = rndK(i, 7) * TAU, r0 = loose ? R * (1.08 + 0.12 * rndK(i, 8)) : R * Math.sqrt(0.08 + 0.9 * rndK(i, 8)), op = (loose ? sm(0.62, 0.95, T) : o.brk) * gone * (0.30 + 0.35 * rndK(i, 9));
      m.visible = op > 0.01; if (!m.visible) continue; const rr = r0 * (1 + 0.85 * e * (0.5 + rndK(i, 10))), bob = loose ? 0.02 * Math.sin(T * 2.1 + i) * (1 - o.brk) : 0, sz = (loose ? 0.045 : 0.035) + 0.06 * rndK(i, 11);
      m.position.copy(MW.C).addScaledVector(PSIDE, Math.cos(a) * rr).addScaledVector(YAX, Math.sin(a) * rr + bob - 0.22 * e * e).addScaledVector(PN, (rndK(i, 12) - 0.35) * 0.45 * e + (loose ? 0.02 : 0));
      m.quaternion.copy(PQ).multiply(MW.q2.setFromAxisAngle(MW.v.set(rndK(i, 13) - 0.5, rndK(i, 14) - 0.5, 0.6).normalize(), a + T * (loose ? 0.6 : 0.3) + 5 * e * (rndK(i, 15) - 0.5))); m.scale.setScalar(sz); m.material.opacity = op; }
    return true;
  }
  // ---------- nothing passes through anything: her hands and forearms are kept out of her bags and her legs ----------
  // Each thing to keep out of is a simple shape that rides on a bone. A thigh or a shin is a rod with round ends, thicker at one end.
  // A bag is a dome on her hip: an egg shape whose middle is 5 cm inside her, a little wider and taller than the bag and as deep,
  // so an arm swinging by slides up over its face and down again without a jump. Each hand is six balls (wrist, palm, knuckles, fingers) and
  // its forearm two more. After everything else has placed her arms, any ball found inside a shape is pushed out the short way, her
  // wrist is moved by the worst push, and her arm is worked out again; a few rounds settle it. Moves that hold a weapon place her
  // hands exactly, so there a hand is only moved while it holds nothing (CLR.free eases between the two). D.clip is the deepest a
  // ball was this frame before the fix (metres), D.clipAt which hand and shape, D.clipLeg the deepest into a leg, D.clipLeft what was
  // left after the fix. D.clearOff = true turns the fix off. "Stand still" is left as posed, to compare with the paintings.
  const CLR = { balls: {}, rods: [], bags: [], free: { R: 1, L: 1 }, hit: '', n: V3(), p: V3(), q: V3(), c: V3(), ab: V3(), l: V3(), push: V3(), best: V3(), W: V3(), E: V3(), S0: V3(), hint: V3(), qH: Qn() };
  for (const [S, s] of SIDES) { const H = SK['hand' + S], Fa = SK['farm' + S], fr = Fa.userData.rest, hr = H.userData.rest;
    CLR.balls[S] = [[H, handPt(s, 0, 0, 0), 0.021], [H, handPt(s, 0, -0.045, 0.020), 0.017], [H, handPt(s, 0, -0.045, -0.020), 0.017], [H, handPt(s, 0, -0.088, 0.020), 0.014], [H, handPt(s, 0, -0.088, -0.022), 0.014], [H, handPt(s, 0, -0.125, 0), 0.011],
      [Fa, fr.clone().lerp(hr, 0.55), 0.030], [Fa, fr.clone().lerp(hr, 0.80), 0.026]]; }
  { const rad = (y) => { const p = prof(R_LEG, y, true); return Math.max(p[0], (p[1] + p[2]) / 2); };
    for (const [S] of SIDES) { CLR.rods.push({ name: 'thigh' + S, A: SK['thigh' + S], B: SK['shin' + S], rA: rad(0.775), rB: rad(0.525), a: V3(), b: V3() }); CLR.rods.push({ name: 'shin' + S, A: SK['shin' + S], B: SK['foot' + S], rA: rad(0.50), rB: 0.052, a: V3(), b: V3() }); } }
  for (const bn in BAGBOX) if (SK[bn]) { const B = BAGBOX[bn]; CLR.bags.push(Object.assign({ name: bn, bone: SK[bn], rest: SK[bn].userData.rest, bp: V3(), qn: Qn(), qi: Qn(), C: B.O.clone().addScaledVector(B.ey, (B.drop - B.H) / 2).addScaledVector(B.ez, -0.05), a: B.W / 2 + 0.05, b: (B.H + B.drop) / 2 + 0.03, c: B.D + 0.05 }, B)); }
  const legRod = (S) => CLR.rods.find((R) => R.name === 'thigh' + S);
  // The way out of a shape is straight through its skin when a ball is only just inside. The deeper it is, the more the way out leans
  // toward one fixed side (out from her hip for a bag; out to that hand's own side and up for a leg), so a ball that goes right
  // through the middle is still carried out the same side and never flips across.
  function clrPush(p, r, out, legsOnly, s) { let dep = 0; out.set(0, 0, 0);
    for (const R of CLR.rods) { const ab = CLR.ab.copy(R.b).sub(R.a), L2 = ab.lengthSq(), t = cl(CLR.q.copy(p).sub(R.a).dot(ab) / L2, 0, 1), c = CLR.c.copy(R.a).addScaledVector(ab, t), rr = lerp(R.rA, R.rB, t) + r, v = CLR.q.copy(p).sub(c), d0 = v.length(); if (d0 >= rr) continue;
      const k = 1 - d0 / rr, pref = CLR.n.set(s * 0.6, 0.8, 0.15); pref.addScaledVector(ab, -pref.dot(ab) / L2).normalize(); if (d0 > 1e-6) pref.multiplyScalar(k).addScaledVector(v, (1 - k) / d0).normalize();
      const b = v.dot(pref), d = -b + Math.sqrt(Math.max(0, b * b - (d0 * d0 - rr * rr))); if (d > dep) { dep = d; out.copy(pref).multiplyScalar(d); CLR.hit = R.name; } }
    if (!legsOnly) for (const B of CLR.bags) { const l = CLR.l.copy(p).sub(B.bp).applyQuaternion(B.qi).add(B.rest).sub(B.C), a = B.a + r, b = B.b + r, c = B.c + r, x = l.dot(B.ex), y = l.dot(B.ey), z = l.dot(B.ez), F = x * x / (a * a) + y * y / (b * b) + z * z / (c * c); if (F >= 1) continue;
      let ux = x / (a * a), uy = y / (b * b), uz = z / (c * c); const g = Math.hypot(ux, uy, uz), k = 1 - Math.sqrt(F); if (g > 1e-6) { ux *= (1 - k) / g; uy *= (1 - k) / g; uz = uz * (1 - k) / g + k; } else { ux = uy = 0; uz = 1; } const gn = Math.hypot(ux, uy, uz); ux /= gn; uy /= gn; uz /= gn;
      const qa = ux * ux / (a * a) + uy * uy / (b * b) + uz * uz / (c * c), qb = 2 * (x * ux / (a * a) + y * uy / (b * b) + z * uz / (c * c)), d = (-qb + Math.sqrt(Math.max(0, qb * qb - 4 * qa * (F - 1)))) / (2 * qa);
      if (d > dep) { dep = d; out.set(0, 0, 0).addScaledVector(B.ex, ux).addScaledVector(B.ey, uy).addScaledVector(B.ez, uz).applyQuaternion(B.qn).multiplyScalar(d); CLR.hit = B.name; } }
    return dep; }
  function clrDepth(S, legsOnly) { let dep = 0; const s = S === 'R' ? -1 : 1; CLR.best.set(0, 0, 0); for (const [bone, pt, r] of CLR.balls[S]) { rpt(bone, pt, CLR.p); const d = clrPush(CLR.p, r, CLR.push, legsOnly, s); if (d > dep) { dep = d; CLR.best.copy(CLR.push); CLR.at = CLR.hit; } } return dep; }
  const HOLDS = [FP.hook, FP.hold, FP.grip, FP.fist];
  function clearHands(N, dt, snap) { D.clip = 0; D.clipLeft = 0; D.clipLeg = 0; D.clipAt = ''; inRoot(); const weapon = /^(draw|sword|knives)$/.test(N);
    for (const R of CLR.rods) { rp(R.A, R.a); rp(R.B, R.b); } for (const B of CLR.bags) { rp(B.bone, B.bp); rq(B.bone, B.qn); B.qi.copy(B.qn).invert(); }
    for (const [S] of SIDES) { const want = weapon && HOLDS.includes(fWant[S]) ? 0 : 1; CLR.free[S] = snap ? want : CLR.free[S] + (want - CLR.free[S]) * Math.min(1, dt * 7);
      const leg = clrDepth(S, true); if (leg > D.clipLeg) D.clipLeg = leg; let dep = clrDepth(S); if (dep > D.clip) { D.clip = dep; D.clipAt = S + ' ' + CLR.at; } const kf = D.clearOff ? 0 : sm(0, 0.006, dep) * CLR.free[S];
      for (let it = 0; it < 4 && dep > 0.0008 && kf > 0.001; it++) { rp(SK['hand' + S], CLR.W); rq(SK['hand' + S], CLR.qH); rp(SK['farm' + S], CLR.E); rp(SK['uarm' + S], CLR.S0); CLR.hint.copy(CLR.E).sub(CLR.S0.lerp(CLR.W, 0.5)); CLR.W.add(CLR.best);
        reach(S, CLR.W, CLR.qH, CLR.hint, kf); inRoot(); dep = clrDepth(S); }
      if (dep > D.clipLeft) D.clipLeft = dep; } }
  // ---------- postures she holds, and her short fight moves and emotes ----------
  // Postures (kneel, squat, sit, hover, down) each have a weight that eases to 1 while that posture is chosen and back to 0 when it is
  // not, so she slides in and out of them and from one to another. A posture is a place for her hips (set in animate), a place and
  // turn for each foot, and somewhere for each hand to rest. Her legs and arms are then worked out from those, as in the weapon moves.
  // Each foot: [x, y, z, turn out (degrees), toes down (degrees), then the way her knee points]. The hover's feet are measured from
  // her hips, and follow her shins.
  const PW = { kneel: 0, squat: 0, sit: 0, hover: 0, down: 0 }, PE = { kneel: 0, squat: 0, sit: 0, hover: 0, down: 0, all: 0 };
  const PST = { kneel: { R: [-0.09, 0.075, -0.40, 0, 165, 0, -1, 0.3], L: [0.10, FOOT_Y, 0.36, 5, 0, 0.1, 0.5, 1] },
    squat: { R: [-0.15, FOOT_Y, 0.0, -22, 0, -0.45, 0.3, 1], L: [0.15, FOOT_Y, 0.0, 22, 0, 0.45, 0.3, 1] },
    sit: { R: [-0.18, 0.075, 0.66, -15, -70, -0.2, 1, 0.3], L: [0.13, FOOT_Y, 0.37, 8, 0, 0.15, 1, 0.5] },
    hover: { R: [0.13, -0.08, 0.36, 0, 0, -1, -0.25, 0.35], L: [-0.11, -0.10, 0.30, 0, 0, 1, -0.25, 0.35] },
    down: { R: [-0.10, 0.075, -0.205, 0, 170, -0.15, -0.6, 1], L: [0.10, 0.075, -0.205, 0, 170, 0.15, -0.6, 1] } };
  const OS = { R: V3(), L: V3(), yawR: 0, yawL: 0, plant: 0 };       // what a short move asks of her feet: how far each is from its resting spot, its turn, and how firmly both are planted
  const EW = { hv: V3(), ft: V3(), hint: V3(), q: Qn(), qk: Qn(), qx: Qn(), qy: Qn(), qfol: Qn(), W: V3(), fk: V3(), qfk: Qn(), kn: V3(), v: V3(), sh: V3(), F: V3(), P: V3(), qG: Qn(), qH: Qn(), hp: V3() };
  const hardBeats = (T, o) => { o.j = sm(0, 0.08, T) * (1 - sm(0.15, 0.6, T)); o.back = sm(0.04, 0.46, T) * (1 - sm(1.18, 1.68, T)); o.fold = sm(0.05, 0.30, T) * (1 - sm(0.85, 1.25, T)); o.sR = sm(0.05, 0.26, T); o.sL = sm(0.24, 0.46, T); o.rL = sm(1.18, 1.44, T); o.rR = sm(1.40, 1.66, T); return o; }, HDB = {};
  function emoteStage(N, T) {
    const a = PE, any = a.all > 0.001 || OS.plant > 0.001; if (!any && !/^(hard|win|bow|wave)$/.test(N)) return;
    inRoot();
    // --- her feet
    if (any) { rp(SK.hips, EW.hp);
      for (const [Sd] of SIDES) { const rest = SK['foot' + Sd].userData.rest, off = OS[Sd]; EW.ft.copy(rest).multiplyScalar(1 - a.all); EW.hint.set(0, 0.25, 1).multiplyScalar(1 - a.all); EW.q.identity(); let wAcc = 0;
        for (const k in PST) { const w = a[k]; if (w <= 0) continue; const f = PST[k][Sd]; if (k === 'hover') EW.ft.x += w * (EW.hp.x + f[0]), EW.ft.y += w * (EW.hp.y + f[1]), EW.ft.z += w * (EW.hp.z + f[2]); else EW.ft.x += w * f[0], EW.ft.y += w * f[1], EW.ft.z += w * f[2];
          EW.hint.x += w * f[5]; EW.hint.y += w * f[6]; EW.hint.z += w * f[7];
          if (k !== 'hover') { EW.qk.copy(EW.qy.setFromAxisAngle(YAX, f[3] * DEG)).multiply(EW.qx.setFromAxisAngle(XAX, f[4] * DEG)); wAcc += w; EW.q.slerp(EW.qk, w / wAcc); } }
        EW.q.copy(EW.qk.identity().slerp(EW.q, Math.min(1, wAcc))); EW.ft.add(off); if (Sd === 'R' ? OS.yawR : OS.yawL) EW.q.premultiply(EW.qy.setFromAxisAngle(YAX, Sd === 'R' ? OS.yawR : OS.yawL));
        const kL = Math.max(sm(0, 0.15, a.all), OS.plant);
        if (a.hover > 0.001) { plant(Sd, EW.ft, null, EW.hint, 1); rq(SK['foot' + Sd], EW.qfol); EW.q.slerp(EW.qfol, a.hover / Math.max(a.all, 1e-4)); }       // floating, her feet go where her shins point
        const miss = plant(Sd, EW.ft, EW.q, EW.hint, kL); if (miss > D.missLeg) D.missLeg = miss; } }
    // --- her hands in a posture: on a knee, on her thigh, or limp on the ground
    if (a.all > 0.001) for (const [Sd, s] of SIDES) { rp(SK['hand' + Sd], EW.fk); rp(SK['shin' + Sd], EW.kn); let w = 0, ay = 0.05, az = 0.06; EW.W.set(0, 0, 0);
      const onKnee = a.squat + (Sd === 'L' ? a.kneel + a.sit : 0); if (onKnee > 0) { EW.W.addScaledVector(EW.v.copy(EW.kn).add(EW.sh.set(-s * 0.01, 0.048, 0.04)), onKnee); w += onKnee; }
      if (a.hover > 0) { const R = legRod(Sd), A = ARM[Sd]; rp(SK['thigh' + Sd], EW.v); EW.F.copy(EW.kn).sub(EW.v); const Lt = EW.F.length(); EW.F.multiplyScalar(1 / Lt); EW.P.set(0, 1, 0).addScaledVector(EW.F, -EW.F.y).normalize(); rp(SK['uarm' + Sd], EW.sh);       // floating, the backs of her hands rest on her thighs just above her knees, palms up
        let t = 0.82; for (let i = 0; i < 9; i++) { EW.hv.copy(EW.v).addScaledVector(EW.F, Lt * t).addScaledVector(EW.P, lerp(R.rA, R.rB, t) + 0.024); if (EW.hv.distanceTo(EW.sh) < A.l1 + A.l2 - 0.012) break; t -= 0.05; }
        EW.W.addScaledVector(EW.hv, a.hover); w += a.hover; EW.F.y -= 0.10; handQ(Sd, EW.F.normalize(), EW.P, EW.qG); }
      if (Sd === 'R' && a.sit > 0) { rp(SK.shinL, EW.v).lerp(rp(SK.footL, EW.hv), 0.22); EW.v.z += 0.062; EW.v.x -= 0.035; EW.W.addScaledVector(EW.v, a.sit); w += a.sit; ay += 0.27 * a.sit; az += 0.12 * a.sit; }       // sitting, her right hand comes across to the shin of her raised knee
      if (a.down > 0) { EW.W.addScaledVector(EW.v.set(s * 0.21, 0.150, SK.hips.position.z + 0.31), a.down); w += a.down; }
      if (w > 0.001) { const wc = Math.min(1, w), bell = 4 * wc * (1 - wc); EW.W.multiplyScalar(1 / w).lerp(EW.fk, 1 - wc); EW.W.x += s * 0.07 * bell; EW.W.y += ay * bell; EW.W.z += az * bell; let q = null; /* on its way to its resting place a hand goes round, not through: a small arc out, up and forward */ if (a.hover > 0.001) { rq(SK['hand' + Sd], EW.qfk); q = EW.qH.copy(EW.qfk).slerp(EW.qG, sm(0.15, 0.85, a.hover)); } const miss = reach(Sd, EW.W, q, EW.hint.set(s * 0.8, -0.5, -0.4), sm(0, 0.12, w)); if (Sd === 'L') { if (miss > D.missL) D.missL = miss; } else if (miss > D.missR) D.missR = miss; }
      if (a.hover > 0.5) fWant[Sd] = FP.mudra; }
    // --- her hands in the short moves
    const hand = (Sd, W, w, hint, F, P) => { if (w <= 0.001) return; const bell = 4 * w * (1 - w); rp(SK['hand' + Sd], EW.fk); EW.W.copy(W).lerp(EW.fk, 1 - w); EW.W.x += (Sd === 'R' ? -1 : 1) * 0.05 * bell; EW.W.z += 0.13 * bell; /* out and forward on the way, round her hip and bag */ let q = null; if (F) { rq(SK['hand' + Sd], EW.qfk); handQ(Sd, F, P, EW.qG); q = EW.qH.copy(EW.qfk).slerp(EW.qG, w); }
      const miss = reach(Sd, EW.W, q, hint, sm(0, 0.25, w)); if (Sd === 'L') { if (miss > D.missL) D.missL = miss; } else if (miss > D.missR) D.missR = miss; };
    if (N === 'hard') { const o = hardBeats(T, HDB); rpt(SK.spine1, EW.v.set(0.03, 1.06, 0.135), EW.kn); hand('R', EW.kn, o.fold, EW.hint.set(-0.9, -0.5, 0.1), EW.F.set(0.9, -0.2, 0.3).normalize(), EW.P.set(0, 0, -1)); if (o.fold > 0.5) fWant.R = FP.soft; }
    if (N === 'win') { const p = sm(1.0, 1.35, T) * (1 - sm(2.5, 2.9, T)), sl = sm(1.42, 1.62, T); rpt(SK.hips, EW.v.set(0.172, 0.975, 0.02), EW.kn); hand('L', EW.kn, p, EW.hint.set(1, -0.2, -0.7));
      rpt(SK.head, EW.v.set(-0.075, 1.580, 0.095), EW.kn); rp(SK.uarmR, EW.sh); EW.sh.x += 0.04; EW.sh.y += 0.34; EW.sh.z += 0.28; EW.kn.lerp(EW.sh, sl);
      EW.F.set(0.50, 0.82, -0.20).lerp(EW.v.set(0.30, 0.70, 0.60), sl).normalize(); EW.P.set(0.25, -0.55, 0.80); EW.W.copy(EW.kn).addScaledVector(EW.F, -0.150); hand('R', EW.W, p, EW.hint.set(-0.9, -0.2, 0.4), EW.F, EW.P); if (p > 0.5) { fWant.R = FP.two; fWant.L = FP.soft; } }
    if (N === 'bow') { const b = sm(0.10, 0.90, T) * (1 - sm(1.50, 2.30, T)); rpt(SK.spine3, EW.v.set(0.035, 1.235, 0.128), EW.kn); EW.F.set(0.85, 0.45, -0.2).normalize(); EW.P.set(0, -0.2, -1); EW.W.copy(EW.kn).addScaledVector(EW.F, -0.085); hand('R', EW.W, b, EW.hint.set(-0.8, -0.6, 0.2), EW.F, EW.P);
      rp(SK.uarmL, EW.sh); EW.sh.x += 0.30; EW.sh.y -= 0.16; EW.sh.z -= 0.14; hand('L', EW.sh, b, EW.hint.set(0.4, -0.3, -1)); if (b > 0.4) { fWant.R = FP.flat; fWant.L = FP.soft; } }
    if (N === 'wave') { const k = sm(0, 0.35, T) * (1 - sm(1.7, 2.1, T)), sw = Math.sin(T * 11), sw2 = Math.sin(T * 11 - 0.7); rpt(SK.hips, EW.v.set(0.172, 0.975, 0.02), EW.kn); hand('L', EW.kn, k, EW.hint.set(1, -0.2, -0.7));
      rp(SK.uarmR, EW.sh); EW.sh.x += -0.20 - 0.12 * sw; EW.sh.y += 0.33 - 0.03 * Math.abs(sw); EW.sh.z += 0.10; EW.F.set(-0.12 - 0.50 * sw2, 1, 0.05).normalize(); EW.P.set(0, 0.05, 1); hand('R', EW.sh, k, EW.hint.set(-0.7, -1, 0.1), EW.F, EW.P); if (k > 0.4) { fWant.R = FP.open; fWant.L = FP.soft; } }
  }
  // Soft things (SOFT): each hangs from its root and its tip is a weight on a spring. It is pulled to where it would rest (its built
  // direction, bent toward straight down), it lags when its root moves, and it cannot swing past a set angle. A sleeve may hang
  // further the more her elbow folds, so her forearm does not pass through it.
  const sv = { a: V3(), b: V3(), c: V3(), q: new THREE.Quaternion() };
  // Sleeves: each is a loop of cloth round her upper arm. Its hem slides across the arm toward the ground until the top of the loop
  // rests on the top of her arm, and away from her forearm when her elbow folds, which also gathers the cloth up toward her
  // shoulder. The slide is held short of the loop's own slack, so her arm stays inside the cloth. It follows on a spring, so it sways.
  const DOWN0 = V3(0, -1, 0), slq = new THREE.Quaternion(), sl1 = V3(), sl2 = V3(), sl3 = V3();
  function sleeveTick(dt, settle) {
    for (const it of SLEEVES) { const U = SK['uarm' + it.S], F = SK['farm' + it.S], H = SK[it.hem], M = SK[it.mid], d = it.d;
      U.getWorldQuaternion(slq); const g = sl1.copy(DOWN0).applyQuaternion(slq.invert()); g.addScaledVector(d, -g.dot(d)).sub(it.g0);
      const fl = sl2.copy(d).applyQuaternion(F.quaternion), c = fl.dot(d), fold = sm(0.35, -0.6, c); fl.addScaledVector(d, -c); const sl = fl.length();
      // A folded elbow gathers the cloth small and close round her upper arm, well short of her forearm; the smaller the loop, the less it may slide.
      // As soon as her elbow bends past a quarter of the way, the cloth is pushed up her arm: shorter (to 35%) and closer (to 55%), so its hem
      // always ends well above her elbow and her forearm has nothing to pass through.
      const up = sm(0.2, -0.7, c), kR = 1 - 0.12 * up, kL = 1 - 0.22 * up, cap = Math.max(0.003, 0.085 * kR - 0.044);
      const tgt = sl3.copy(g).multiplyScalar(0.017); if (sl > 1e-4) tgt.addScaledVector(fl, -0.040 * fold / sl); if (tgt.length() > cap) tgt.setLength(cap);
      if (!it.off || settle) { it.off = tgt.clone(); it.vel = V3(); }
      else { const n = Math.max(1, Math.ceil(dt / 0.012)), st = dt / n; for (let k = 0; k < n; k++) { it.vel.x += ((tgt.x - it.off.x) * 110 - it.vel.x * 7) * st; it.vel.y += ((tgt.y - it.off.y) * 110 - it.vel.y * 7) * st; it.vel.z += ((tgt.z - it.off.z) * 110 - it.vel.z * 7) * st; it.off.addScaledVector(it.vel, st); } if (it.off.length() > cap + 0.003) it.off.setLength(cap + 0.003); }
      H.position.copy(H.userData.home).add(it.off); M.position.copy(M.userData.home).addScaledVector(it.off, 0.5); H.scale.set(kR, kL, kR); M.scale.set(kR, kL, kR); }
  }
  function softTick(dt, settle) {
    sleeveTick(dt, settle);
    for (const it of SOFT) { const P = SK[it.parent], B = SK[it.bone], fx = it.flex ? cl(-SK[it.flex].rotation.x / 2.2, 0, 1) : 0, maxA = it.maxA + 1.15 * fx;
      const root = sv.a.copy(it.root).sub(P.userData.rest).applyMatrix4(P.matrixWorld), rest = sv.b.copy(it.dir).transformDirection(P.matrixWorld);
      const tgt = sv.c.copy(rest); tgt.y -= it.grav + 2.4 * fx; tgt.normalize().multiplyScalar(it.L).add(root);
      if (!it.tip || settle) { it.tip = tgt.clone(); it.vel = V3(); }
      else { const n = Math.max(1, Math.ceil(dt / 0.012)), st = dt / n; for (let k = 0; k < n; k++) { it.vel.x += ((tgt.x - it.tip.x) * it.w2 - it.vel.x * it.c) * st; it.vel.y += ((tgt.y - it.tip.y) * it.w2 - it.vel.y * it.c) * st; it.vel.z += ((tgt.z - it.tip.z) * it.w2 - it.vel.z * it.c) * st; it.tip.addScaledVector(it.vel, st); } }
      const dir = tgt.copy(it.tip).sub(root).normalize(), dt2 = cl(dir.dot(rest), -1, 1), ang = Math.acos(dt2);
      if (ang > maxA) { dir.addScaledVector(rest, -dt2).normalize().multiplyScalar(Math.sin(maxA)).addScaledVector(rest, Math.cos(maxA)); it.vel.multiplyScalar(0.6); }
      it.tip.copy(dir).multiplyScalar(it.L).add(root);
      P.getWorldQuaternion(sv.q); B.quaternion.setFromUnitVectors(it.dir, dir.applyQuaternion(sv.q.invert())); }
  }
  function pose(o) {
    o = o || {}; mv = { name: 'pose', t: 0 }; wk = 0; jg = 0; lastPose = { arm: o.arm == null ? 15 : o.arm, leg: o.leg || 0 }; const arm = lastPose.arm * DEG - A_POSE, leg = lastPose.leg * DEG;
    restAll(); for (const [S, s] of SIDES) { SK['uarm' + S].rotation.z = s * arm; SK['thigh' + S].rotation.z = s * leg; SK['foot' + S].rotation.z = -s * leg; }
    armsAndBow(-1, 0); swordStage(-1, 0, true); knifeStage(-1); magicOff(); stillK = 0; for (const k in PW) PW[k] = PE[k] = 0; PE.all = 0; root.updateMatrixWorld(true);
    if (gearSettle) { gearSettle(); root.updateMatrixWorld(true); }       // the bags come to rest against her in the new pose
    softTick(0, true); root.updateMatrixWorld(true);
  }
  function play(name) { if (name === 'aim') name = 'draw'; if (name === 'down') name = 'fall'; if (!MOVES.includes(name) || name === 'pose') { pose(lastPose); return 'pose'; } mv = { name, t: 0 }; return name; }
  // for checking a move in stills: put her at one moment of it, with her hands and soft things settled
  function seek(name, t) { play(name); mv.t = t * (SLOW[mv.name] || 1); snapNow = true; animate(0); snapNow = false; root.updateMatrixWorld(true); if (gearSettle) { gearSettle(); root.updateMatrixWorld(true); } softTick(0, true); root.updateMatrixWorld(true); return mv.t; }
  function walk(on) { return play(on ? 'walk' : 'pose') === 'walk'; }
  function animate(dt) {
    dt = dt > 0 ? Math.min(dt, 0.05) : 0; clock += dt;
    if (mv.name === 'pose') { if (gearTick) gearTick(dt); softTick(dt); return; }
    mv.t += dt; if (SHOTS[mv.name] && mv.t >= SHOTS[mv.name] + 1.2) mv.t = 0;       // a short move plays again after a pause, for as long as it is the one chosen
    const N = SHOTS[mv.name] && mv.t >= SHOTS[mv.name] ? 'idle' : mv.name, T = mv.t / (SLOW[N] || 1); restAll();
    fWant.R = N === 'talk' ? FP.soft : N === 'cheer' && T > 0.25 && T < 1.2 ? FP.fist : FP.relax; fWant.L = FP.relax;
    wk += ((N === 'walk' ? 1 : 0) - wk) * Math.min(1, dt * 4.5); jg += ((N === 'jog' ? 1 : 0) - jg) * Math.min(1, dt * 4.5);
    { const P = N === 'fall' ? 'down' : N; let Wt = 0; for (const k in PW) { PW[k] = snapNow ? (P === k ? 1 : 0) : PW[k] + ((P === k ? 1 : 0) - PW[k]) * Math.min(1, dt * (k === 'down' ? 2.0 : 3.4)); PE[k] = sm(0, 1, PW[k]); Wt += PE[k]; } if (Wt > 1) for (const k in PW) PE[k] /= Wt; PE.all = Math.min(1, Wt); }
    OS.R.set(0, 0, 0); OS.L.set(0, 0, 0); OS.yawR = OS.yawL = 0; OS.plant = 0;
    const go = Math.min(1, wk + jg), g = wk + jg > 1e-4 ? jg / (wk + jg) : 0, L = (a, b) => a + (b - a) * g, still = 1 - go;
    for (const [S, s] of SIDES) SK['uarm' + S].rotation.z = s * (9 * DEG - A_POSE);       // arms hang close
    const bounce = (h) => { if (h <= 0) return; const a = h / 0.10; SK.hips.position.y += h; for (const [S] of SIDES) { add('foot' + S, a, 0, 0); add('toe' + S, -a, 0, 0); } };       // up on the balls of her feet
    // always: breath, and a small shift of weight when she stands
    const br = Math.sin(clock * 1.7), sway = Math.sin(clock * 0.9);
    add('spine2', 0.012 * br, 0, 0); add('spine3', 0.010 * br, 0, 0); for (const [S, s] of SIDES) add('clav' + S, 0, 0, s * 0.014 * br);
    SK.hips.position.x += 0.007 * sway * still; add('hips', 0, 0, 0.012 * sway * still); add('spine1', 0, 0, -0.012 * sway * still);
    if (N === 'idle') { const lk = Math.sin(clock * 0.37) + 0.5 * Math.sin(clock * 0.83 + 1); add('neck', 0, 0.07 * lk, 0); add('head', 0.02 * Math.sin(clock * 0.6), 0.10 * lk, 0.02 * Math.sin(clock * 0.45)); add('spine2', 0, 0.03 * lk, 0);
      for (const [S, s] of SIDES) { add('uarm' + S, 0.03 * Math.sin(clock * 0.9 + s), 0, 0); add('farm' + S, -0.10 - 0.03 * br, 0, 0); add('shin' + S, 0.03 + 0.02 * br, 0, 0); add('thigh' + S, -0.015 - 0.01 * br, 0, 0); add('foot' + S, -0.015 - 0.01 * br, 0, 0); }
      const c = clock % 4.2; if (c < 0.7) bounce(0.024 * Math.pow(Math.sin(c / 0.35 * PI), 2) * (c < 0.35 ? 1 : 0.6)); }       // light on her feet: a quick double bounce now and then
    // walking and jogging share one cycle; g slides from one to the other
    if (go > 0.001) { gph += dt * TAU / L(1.02, 0.72); const A = L(0.40, 0.50), sn = Math.sin(gph), cs = Math.cos(gph);
      for (const [S, s] of SIDES) { const p = gph + (s < 0 ? 0 : PI), si = Math.sin(p), co = Math.cos(p), sw = Math.max(0, co), st = Math.max(0, -co);
        const th = -(A * si + L(0.05, 0.12)) * go, kn = (L(1.05, 1.50) * Math.pow(sw, 1.3) + L(0.20, 0.38) * Math.pow(Math.max(0, Math.sin(p - 0.5)), 3) * st + L(0.04, 0.22)) * go;       // thigh; knee folding in the swing and giving a little as the foot lands
        // Her ankle bends only as far as an ankle can. On the ground the sole lies flat until the leg is too far back, then the heel
        // lifts. In the air the foot hangs loose, toes down, and comes up to land on the heel. Her boots are stiff: the toe never folds.
        const onG = sm(-0.2, 0.2, -co), ank = cl(-(th + kn), -0.26, 0.30) * onG + lerp(L(0.32, 0.45), -0.12, (si + 1) / 2) * (1 - onG);
        add('thigh' + S, th, 0, 0); add('shin' + S, kn, 0, 0); add('foot' + S, ank * go, 0, 0);
        // arms hang loose: forearm and hand trail the upper arm, the shoulder rides with it, the hand comes a little across her body
        const sl = Math.sin(p - 0.45), sl2 = Math.sin(p - 0.9);
        add('uarm' + S, (L(0.40, 0.52) * si + L(0, 0.10)) * go, -s * L(0.10, 0.24) * Math.max(0, -si) * go, 0); add('farm' + S, -(L(0.30, 1.20) + L(0.28, 0.38) * Math.max(0, -sl)) * go, 0, 0);
        add('hand' + S, 0.20 * sl2 * go, 0, 0); add('clav' + S, 0, -s * 0.05 * si * go, s * 0.035 * Math.max(0, -si) * go); }
      const lag = Math.sin(gph - 0.5), lag2 = Math.sin(gph - 0.9), bob2 = Math.cos(2 * gph - 0.7), drift = Math.sin(clock * 0.53);       // each part a beat behind the one below it, so she is not one stiff block
      SK.hips.position.y += (-L(0.045, 0) * sn * sn - L(0, 0.045) * cs * cs + L(0, 0.03)) * go; SK.hips.position.x += L(0.014, 0.010) * cs * go;
      add('hips', L(0.02, 0.04) * go, L(0.10, 0.13) * sn * go, L(0.045, 0.035) * cs * go);
      add('spine1', L(0.02, 0.035) * go, -0.06 * lag * go, -L(0.035, 0.03) * cs * go); add('spine2', 0.012 * bob2 * go, -L(0.10, 0.15) * lag * go, -0.02 * cs * go); add('spine3', 0.012 * bob2 * go, -0.06 * lag2 * go, 0.012 * cs * go);
      add('neck', (-L(0.03, 0.05) + 0.015 * bob2) * go, (L(0.11, 0.16) * lag + 0.04 * drift) * go, 0.01 * cs * go); add('head', 0.02 * Math.cos(2 * gph - 1.3) * go, (0.05 * lag2 + 0.05 * drift) * go, 0.012 * drift * go); }
    // talking: weight on one hip, one quick hand at chest height, small nods
    if (N === 'talk') { const k = sm(0, 0.4, T), a1 = Math.sin(T * 4.4), a2 = Math.sin(T * 2.3 + 1), a3 = Math.sin(T * 6.1);
      SK.hips.position.x += 0.016 * k; add('hips', 0, 0.10 * k, 0.03 * k); add('spine1', 0, -0.06 * k, -0.035 * k);
      add('uarmR', -(0.55 + 0.12 * a2) * k, 0, -0.10 * k); add('farmR', -(1.55 + 0.28 * a1) * k, 0, 0); add('handR', 0.25 * a3 * k, 0.5 * a2 * k, 0);
      add('uarmL', 0.06 * a2 * k, 0, 0); add('farmL', -0.22 * k, 0, 0);
      add('head', (0.05 * a1 + 0.03) * k, 0.10 * a2 * k, 0.05 * Math.sin(T * 1.3) * k); add('neck', 0, 0.06 * a2 * k, 0);
      if (clock > mouthAt) { mouthAt = clock + 0.10 + 0.09 * Math.abs(Math.sin(clock * 37.7)); const r = Math.abs(Math.sin(clock * 91.3)); mouthNow = r < 0.28 ? 'rest' : r < 0.62 ? 'open' : r < 0.86 ? 'oo' : 'smile'; }
    } else mouthNow = N === 'cheer' && T > 0.2 && T < 1.3 ? 'smile' : 'rest';
    let squint = 0;
    // Moonsteel Draw (H1, H2, H4): the bow from her back, the full draw, the arrow loosed toward her left (screen right), the bow put
    // away. Her body does this much here; her arms, her hands and the bow itself are worked out in armsAndBow, from where the bow is.
    if (N === 'draw') { const st = sm(0.30, 1.05, T) * (1 - sm(2.95, 3.5, T)), tw = sm(0.0, 0.24, T) * (1 - sm(0.42, 0.85, T)) + sm(3.5, 3.9, T) * (1 - sm(4.05, 4.4, T)), lk = sm(0.80, 1.22, T) * (1 - sm(2.95, 3.35, T));
      const hold = T < TR ? sm(1.28, 1.86, T) : 0, aft = Math.max(0, T - TR), kick = T >= TR ? Math.exp(-aft / 0.14) : 0, easeIn = 1 - sm(0, 0.2, T) + sm(4.25, 4.5, T);
      add('hips', 0, 0.10 * st, 0); add('spine1', 0, -0.08 * tw, 0); add('spine2', 0, 0.12 * st - 0.22 * tw, -0.04 * hold + 0.004 * Math.sin(T * 31) * hold); add('spine3', -0.03 * hold - 0.02 * kick, 0.04 * st - 0.10 * tw + 0.03 * kick, 0);
      add('neck', 0.05 * tw, 0.46 * lk - 0.18 * tw, 0); add('head', 0.10 * tw, 0.56 * lk - 0.22 * tw, 0.03 * hold);
      for (const [S, s] of SIDES) { add('thigh' + S, -0.03 * st - 0.015 * easeIn, 0, s * 0.23 * st); add('shin' + S, 0.06 * st + 0.03 * easeIn, 0, 0); add('foot' + S, -0.03 * st - 0.015 * easeIn, 0, -s * 0.23 * st); add('farm' + S, -0.10 * easeIn, 0, 0); }
      SK.hips.position.y -= 0.024 * st; bounce(0.026 * Math.pow(Math.sin(PI * cl((T - 0.26) / 0.5, 0, 1)), 2));       // she comes up on her toes as her feet go wide
      squint = hold > 0.7 ? 0.5 : 0; }
    // Sword (G4, H7): drawn from her left hip as she hops round to face screen right, a guard, one full cut with a long step, back to
    // guard, and away. Her body does this much here; her feet, her arms, the sword and its scabbard are worked out in swordStage.
    if (N === 'sword') { const o = swordBeats(T, SWB), easeIn = 1 - sm(0, 0.2, T) + sm(3.3, 3.55, T);
      add('hips', 0, (62 + 8 * o.lun) * DEG * o.st, 0); SK.hips.position.x += 0.24 * o.lun * o.st; SK.hips.position.y += 0.05 * o.hop - (0.11 + 0.10 * o.lun) * o.st;
      add('spine1', 0.07 * o.st + 0.13 * o.lun, 0.03 * o.st, 0); add('spine2', 0.03 * o.st + 0.05 * o.lun, 0.04 * o.st - 0.12 * o.a * (1 - o.b) + 0.08 * o.b * (1 - o.c), 0);
      add('neck', -0.06 * o.lun, 0.04 * o.st, 0); add('head', -0.05 * o.st - 0.08 * o.lun, 0.06 * o.st, 0);
      for (const [S] of SIDES) { add('farm' + S, -0.10 * easeIn, 0, 0); add('shin' + S, 0.03 * easeIn, 0, 0); add('thigh' + S, -0.015 * easeIn, 0, 0); add('foot' + S, -0.015 * easeIn, 0, 0); } }
    // Knives (G5, H8): both from the back of her belt, a wide stance with her chest to us, the first thrown with her right hand as her
    // body turns toward screen right, the second with her left as it turns back. Her feet, arms and the knives are worked out in knifeStage.
    if (N === 'knives') { const o = knifeBeats(T, KNB), yaw = (4 * o.st - 14 * o.coil + 62 * o.y1 * (1 - o.y2) + 6 * o.y2) * (1 - o.out) * DEG, lean = 0.10 * (o.t1 * (1 - 0.5 * o.f1) + 0.5 * o.t2 * (1 - o.f2)) * (1 - o.out);
      const look = sm(0.45, 0.70, T) * (1 - sm(1.55, 1.85, T)), hy = (62 * DEG - yaw) * look, easeIn = 1 - sm(0, 0.2, T) + sm(2.2, 2.45, T);
      add('hips', 0, 0.40 * yaw, 0); add('spine1', Math.sin(0.5 * yaw) * lean, 0.10 * yaw, -Math.cos(0.5 * yaw) * lean); add('spine2', 0, 0.28 * yaw, 0); add('spine3', 0, 0.22 * yaw, 0);
      add('neck', 0, 0.45 * hy, 0); add('head', 0, 0.55 * hy, 0); SK.hips.position.x += (-0.03 * o.coil + 0.07 * o.t1) * o.st; SK.hips.position.y += 0.05 * o.hop - 0.07 * o.st;
      for (const [S] of SIDES) { add('farm' + S, -0.10 * easeIn, 0, 0); add('shin' + S, 0.03 * easeIn, 0, 0); add('thigh' + S, -0.015 * easeIn, 0, 0); add('foot' + S, -0.015 * easeIn, 0, 0); } }
    // The gem (H9): she stands straight and still, eyes closed, a small smile. Her hand and the light are worked out in gemStage.
    stillK = 0;
    if (N === 'gem') { const o = gemBeats(T, GMB); stillK = o.still; add('head', 0.05 * o.up, 0, 0); add('neck', 0.03 * o.up, 0, 0); add('spine3', -0.02 * o.up, 0, 0); for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0);
      squint = Math.max(squint, o.eyes); if (o.eyes > 0.5) mouthNow = 'smile'; }
    // Silverglass (H6): feet wide, her body turned a little toward screen right and leaning into her palm. The rest is in glassStage.
    if (N === 'glass') { const o = glassBeats(T, GLB), easeIn = 1 - sm(0, 0.15, T) + sm(2.6, 2.9, T);
      add('hips', 0, 8 * DEG * o.st, 0); add('spine1', 0.05 * o.push, 0, -0.03 * o.push); add('spine2', 0, (12 * o.st + 6 * o.push - 8 * o.back) * DEG, 0); add('neck', 0, 0.20 * o.st, 0); add('head', 0, 0.26 * o.st, 0);
      SK.hips.position.x += 0.03 * o.push * o.st; SK.hips.position.y += 0.04 * o.hop - 0.06 * o.st; for (const [S] of SIDES) add('farm' + S, -0.10 * easeIn, 0, 0); }
    // ---- postures: where her hips go and how her back and head are held. Her feet and hands are in emoteStage ----
    if (PE.all > 0.001) { const a = PE, bob = 0.025 * Math.sin(clock * 1.5), stag = N === 'fall' ? sm(0, 0.08, T) * (1 - sm(0.15, 0.5, T)) : 0;
      SK.hips.position.y += -0.43 * a.kneel - 0.535 * a.squat - 0.745 * a.sit + (-0.38 + bob) * a.hover - 0.595 * a.down; SK.hips.position.z += 0.02 * a.kneel - 0.20 * a.squat - 0.05 * a.sit - 0.10 * a.down; SK.hips.position.x -= 0.05 * stag;
      add('hips', 0.30 * a.squat + 0.25 * a.down, 0, 0.05 * stag); add('spine1', 0.04 * a.kneel + 0.25 * a.squat + 0.16 * a.sit + 0.35 * a.down - 0.10 * stag, 0, 0.10 * stag); add('spine2', 0.15 * a.squat + 0.14 * a.sit + 0.30 * a.down, 0.15 * stag + 0.10 * a.sit, 0.08 * stag); add('spine3', 0.15 * a.down - 0.03 * a.hover, 0, 0);
      add('neck', -0.20 * a.squat - 0.10 * a.sit + 0.30 * a.down - 0.15 * stag, 0, 0); add('head', -0.15 * a.squat - 0.10 * a.sit + 0.20 * a.down, -0.08 * a.sit, 0.08 * a.down);
      if (a.hover > 0.5 || a.down > 0.4) squint = 1; if (a.hover > 0.5) mouthNow = 'smile'; if (stag > 0.3) mouthNow = 'oo'; }
    // ---- a blow from screen right: she rocks away from it, flinches, then rolls her shoulder and is ready again ----
    if (N === 'hit') { const j = sm(0, 0.07, T) * (1 - sm(0.13, 0.58, T)), j2 = sm(0.02, 0.12, T) * (1 - sm(0.20, 0.62, T)), sh = sm(0.60, 0.74, T) * (1 - sm(0.86, 1.04, T));
      SK.hips.position.x -= 0.085 * j2; SK.hips.position.y -= 0.035 * j2; add('hips', 0, -0.10 * j2, 0.07 * j2); add('spine1', -0.05 * j, 0, 0.15 * j2); add('spine2', -0.06 * j, -0.14 * j2, 0.17 * j2); add('spine3', 0, 0, 0.06 * j2); add('neck', -0.10 * j, 0, -0.12 * j); add('head', -0.10 * j, -0.16 * j2, -0.20 * j);
      add('clavL', 0, 0, 0.22 * j); add('uarmL', -0.35 * j2, 0, 0.42 * j2); add('farmL', -1.25 * j2, 0, 0); add('uarmR', 0.20 * j2, 0, -0.50 * j2); add('farmR', -0.45 * j2, 0, 0);
      add('clavR', 0, 0, -0.16 * sh); add('clavL', 0, 0, 0.10 * sh); add('head', 0, 0, 0.10 * sh); add('spine2', 0, 0.08 * sh, 0); bounce(0.012 * sh);
      for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0); if (j > 0.3 || j2 > 0.45) { squint = 1; mouthNow = 'oo'; } fWant.L = j2 > 0.3 ? FP.fist : FP.relax; OS.plant = sm(0, 0.03, T) * (1 - sm(0.62, 0.8, T)); }
    // ---- a hard blow: knocked two steps back, turned from it and folded over, an arm across her middle; she straightens and steps back in ----
    if (N === 'hard') { const o = hardBeats(T, HDB); SK.hips.position.x -= 0.30 * o.back + 0.03 * o.j; SK.hips.position.y -= 0.09 * o.fold + 0.02 * o.back; SK.hips.position.z += 0.03 * o.fold; add('hips', 0.14 * o.fold, -0.30 * o.fold + 0.10 * o.j, 0.05 * o.fold);
      add('spine1', 0.30 * o.fold - 0.08 * o.j, -0.08 * o.fold, 0.12 * o.fold + 0.08 * o.j); add('spine2', 0.24 * o.fold, -0.08 * o.fold, 0.10 * o.fold + 0.06 * o.j); add('neck', 0.14 * o.fold - 0.12 * o.j, 0, 0); add('head', 0.12 * o.fold, 0.12 * o.fold, -0.14 * o.j); add('uarmL', -0.15 * o.fold, 0, 0.50 * o.fold); add('farmL', -0.7 * o.fold, 0, 0);
      OS.R.set(-0.34 * (o.sR - o.rR), 0.05 * (Math.sin(PI * o.sR) + Math.sin(PI * o.rR)), -0.05 * (o.sR - o.rR)); OS.L.set(-0.27 * (o.sL - o.rL), 0.05 * (Math.sin(PI * o.sL) + Math.sin(PI * o.rL)), 0.03 * (o.sL - o.rL)); OS.yawR = -0.38 * (o.sR - o.rR); OS.yawL = -0.20 * (o.sL - o.rL); OS.plant = sm(0, 0.06, T) * (1 - sm(1.66, 1.9, T));
      for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0); if (o.fold > 0.3) { squint = Math.max(squint, T < 0.55 ? 1 : 0.5); mouthNow = 'oo'; } }
    // ---- a dodge: she drops and slips away from screen right on a bent right leg, one arm up as a guard, and springs back ----
    if (N === 'dodge') { const d = sm(0, 0.16, T) * (1 - sm(0.42, 0.85, T)), stepK = Math.sin(PI * sm(0, 0.16, T)) + Math.sin(PI * sm(0.42, 0.85, T));
      SK.hips.position.x -= 0.36 * d; SK.hips.position.y -= 0.23 * d; add('hips', 0, 0.14 * d, 0.10 * d); add('spine1', 0.06 * d, 0, 0.26 * d); add('spine2', 0.08 * d, 0.12 * d, 0.22 * d); add('neck', 0, 0.16 * d, -0.16 * d); add('head', 0, 0.22 * d, -0.20 * d);
      add('uarmL', -0.6 * d, 0, 0.20 * d); add('farmL', -1.7 * d, 0, 0); add('uarmR', 0, 0, -0.85 * d); add('farmR', -0.25 * d, 0, 0); OS.R.set(-0.52 * d, 0.05 * stepK, -0.03 * d); OS.yawR = -0.45 * d; OS.yawL = 0.15 * d; OS.plant = sm(0, 0.05, T) * (1 - sm(0.85, 1.0, T));
      for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0); fWant.L = d > 0.3 ? FP.fist : FP.relax; if (d > 0.4) squint = Math.max(squint, 0.5); }
    // ---- a win: a low pump of both fists, a hop with one thrown up, then her weight on one hip, a hand on it, and a two-finger salute from her brow ----
    if (N === 'win') { const c = sm(0, 0.25, T) * (1 - sm(0.42, 0.55, T)), u = cl((T - 0.5) / 0.45, 0, 1), air = 4 * u * (1 - u), c2 = sm(0.93, 1.0, T) * (1 - sm(1.0, 1.3, T)), cc = c + 0.7 * c2, jk = sm(0.45, 0.60, T) * (1 - sm(0.88, 1.05, T)), p = sm(1.0, 1.35, T) * (1 - sm(2.5, 2.9, T));
      for (const [S] of SIDES) { add('thigh' + S, -0.42 * cc - 0.2 * air, 0, 0); add('shin' + S, 0.84 * cc + 0.4 * air, 0, 0); add('foot' + S, -0.42 * cc + 0.25 * air, 0, 0); add('uarm' + S, 0.45 * c, 0, 0); add('farm' + S, -1.7 * c - 0.10, 0, 0); }
      SK.hips.position.y += -0.07 * cc + 0.18 * air; add('uarmR', -2.6 * jk, 0, 0); add('farmR', -0.5 * jk, 0, 0); add('spine2', -0.06 * jk, 0, 0); add('head', -0.12 * jk, 0, 0);
      SK.hips.position.x -= 0.025 * p; add('hips', 0, 0, -0.06 * p); add('spine1', 0, 0, 0.07 * p); add('head', 0, 0.12 * p, 0.05 * p); if (c > 0.3 || jk > 0.3) fWant.R = fWant.L = FP.fist; if (T > 0.45 && T < 2.7) mouthNow = 'smile'; }
    // ---- a court bow: her right foot drawn back, her right hand to her heart, her left arm swept out, and she bends from the hips ----
    if (N === 'bow') { const b = sm(0.10, 0.90, T) * (1 - sm(1.50, 2.30, T)), st = Math.sin(PI * sm(0.10, 0.50, T)) + Math.sin(PI * sm(1.75, 2.25, T));
      SK.hips.position.z -= 0.10 * b; SK.hips.position.y -= 0.05 * b; add('hips', 0.28 * b, 0, 0); add('spine1', 0.26 * b, 0, 0); add('spine2', 0.16 * b, 0, 0); add('neck', 0.14 * b, 0, 0); add('head', 0.10 * b, 0, 0);
      OS.R.set(-0.03 * b, 0.035 * st, -0.27 * b); OS.yawR = -0.5 * b; OS.plant = sm(0, 0.1, T) * (1 - sm(2.3, 2.6, T)); for (const [S] of SIDES) add('farm' + S, -0.10, 0, 0); if (b > 0.7) squint = Math.max(squint, 0.5); if (T > 1.6 && T < 2.5) mouthNow = 'smile'; }
    // ---- a wave: up on her toes, her right hand high and going from side to side (emoteStage), her left hand on her hip ----
    if (N === 'wave') { const k = sm(0, 0.35, T) * (1 - sm(1.7, 2.1, T)), sw = Math.sin(T * 11);
      add('clavR', 0, 0, -0.16 * k); add('spine2', 0, 0, 0.05 * k + 0.02 * sw * k); add('head', 0, 0, -0.08 * k); bounce(0.022 * Math.abs(Math.sin(T * 5.5)) * k);
      for (const [S] of SIDES) add('farm' + S, -0.10 * (1 - k), 0, 0); if (k > 0.3) mouthNow = 'smile'; }
    // a cheer: she dips, jumps, throws an arm up, lands soft
    if (N === 'cheer') { const c1 = sm(0, 0.22, T) * (1 - sm(0.22, 0.36, T)), u = cl((T - 0.36) / 0.5, 0, 1), air = Math.sin(PI * u), c2 = sm(0.84, 0.94, T) * (1 - sm(0.94, 1.3, T)), c = c1 + 0.8 * c2, k = sm(0.2, 0.45, T) * (1 - sm(1.0, 1.45, T));
      for (const [S] of SIDES) { add('thigh' + S, -0.45 * c - 0.25 * air, 0, 0); add('shin' + S, 0.9 * c + 0.5 * air, 0, 0); add('foot' + S, -0.45 * c + 0.2 * air, 0, 0); }
      SK.hips.position.y += -0.075 * c + 0.20 * 4 * u * (1 - u);
      add('uarmR', -2.7 * k, 0, 0); add('farmR', -0.45 * k, 0, 0); add('uarmL', -1.1 * k, 0, 0); add('farmL', -1.9 * k, 0, 0); add('head', -0.18 * k, 0, 0); add('spine2', -0.08 * k, 0, 0); }
    // limbering up: bouncing on her toes, shoulders rolling, arms shaken loose, her head from side to side
    if (N === 'limber') { const k = sm(0, 0.3, T) * (1 - sm(2.2, 2.6, T));
      bounce(0.020 * Math.abs(Math.sin(T * 9.5)) * k); for (const [S, s] of SIDES) { add('clav' + S, 0, 0, s * 0.16 * Math.sin(T * 5 + (s > 0 ? 1.6 : 0)) * k); add('uarm' + S, 0.14 * Math.sin(T * 9 + s) * k, 0, s * 0.06 * k); add('farm' + S, -(0.5 + 0.2 * Math.sin(T * 11 + s)) * k, 0, 0); add('shin' + S, 0.10 * k, 0, 0); add('thigh' + S, -0.05 * k, 0, 0); }
      add('head', 0, 0, 0.22 * Math.sin(T * 2.4) * k); add('neck', 0.04 * k, 0, 0.08 * Math.sin(T * 2.4) * k); }
    armsAndBow(N === 'draw' ? T : -1, dt); swordStage(N === 'sword' ? T : -1, dt * (1 - stillK), snapNow); knifeStage(N === 'knives' ? T : -1); { const g1 = gemStage(N === 'gem' ? T : -1), g2 = glassStage(N === 'glass' ? T : -1); if (!g1 && !g2) magicOff(); else { if (!g1) { for (const k of ['gGlow', 'gStar', 'gRing']) MG[k].visible = false; for (const m of MG.sparks) m.visible = false; if (meshes.veins) meshes.veins.visible = false; MATS.gem.emissiveIntensity = 0; MATS.lens.emissiveIntensity = 0; } if (!g2) { MG.pane.visible = false; MG.flash.visible = false; for (const a of [MG.rim, MG.shards]) for (const m of a) m.visible = false; } } } emoteStage(N, T); hoverLight(); clearHands(N, dt, snapNow); fingersTick(dt, snapNow);
    // her face: she blinks; her mouth moves when she talks
    if (clock > blinkAt) { blinkT = clock; blinkAt = clock + 2.2 + 2.6 * Math.abs(Math.sin(clock * 12.9)); }
    const bt = clock - blinkT, eyes = Math.max(squint, bt < 0.05 ? 0.5 : bt < 0.10 ? 1 : bt < 0.15 ? 0.5 : 0), key = eyes + '|' + mouthNow;
    if (key !== facePainted) { paintFace(eyes, mouthNow); facePainted = key; }
    if (gearTick) gearTick(dt * (1 - stillK));       // the bags and charms swing with her (and hang still for the breath of the gem)
    softTick(dt * (1 - stillK));       // and her sleeves, the tails of her headband and her loose locks
  }
  return { root, skeleton, bones, SK, animate, pose, play, seek, moves: MOVES, walk, bow: BOWK, sword: SWK, knives: KNK, light: FX, swing: () => { if (gearKick) gearKick(); }, setLook, meshes, spin: 0, time: 0, stanceProgress: 1, setStance() {}, setFace: (eyes, mouth) => paintFace(eyes || 0, mouth || 'rest'), debug: { SK, meshes, D, cloths: [], headPoint, JH, hairPt, phOfY }, get triangles() { return triCount; } };
}
