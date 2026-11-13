
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
    bowGem: phys({ color: lin('#2191c8'), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, emissive: lin('#0c5fa8'), emissiveIntensity: 0.45 }),
    iron: std({ color: lin('#1b1a1e'), metalness: 0.75, roughness: 0.48, envMapIntensity: 1.0 }),
    sock: std({ map: sockTexR(), color: lin('#d2cbc8'), roughness: 0.97 }),
    cloth: std({ color: lin('#1a1518'), roughness: 0.9 })
  };

  // ---------- bind: one skinned mesh per material ----------
  const root = new THREE.Group(); root.name = 'ranger';
  root.add(SK.hips); if (SK.bow) root.add(SK.bow); root.updateMatrixWorld(true);
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
  const SHOTS = { draw: 5.5, cheer: 1.5, limber: 3.9 }, SLOW = { draw: 1.22, limber: 1.5 }, MOVES = ['pose', 'idle', 'walk', 'jog', 'talk', 'draw', 'cheer', 'limber'];
  const add = (b, x, y, z) => { const r = SK[b].rotation; r.x += x; r.y += y; r.z += z; };
  function restAll() { for (const k in SK) if (!/^(bag|charm|slv|tail|lock)/.test(k)) SK[k].rotation.set(0, 0, 0); SK.hips.position.copy(SK.hips.userData.home); }
  // ---------- fingers ----------
  // A hand shape is [thumb, index, middle, ring, little, spread]: 0 is straight, 1 is curled shut. A finger may also be three numbers,
  // the bend at each of its joints from the knuckle out, for shapes like the hook that holds a bowstring. Her hands ease from one
  // shape to the next. (The angles and axes are the Jester's; the shapes are hers.)
  const HOOK = [0.30, 1.30, 0.70];
  const FP = { relax: [0.30, 0.26, 0.32, 0.38, 0.44, 0.15], soft: [0.14, 0.12, 0.17, 0.22, 0.28, 0.55], open: [0.04, 0.03, 0.02, 0.05, 0.09, 0.95], fist: [0.72, 0.95, 0.96, 0.96, 0.95, 0],
    grip: [0.62, 0.72, 0.76, 0.79, 0.80, 0.05], hold: [0.58, 0.76, 0.80, 0.83, 0.84, 0], hook: [0.50, HOOK, HOOK, HOOK, 0.84, 0] };
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
    ARM[S] = { l1: u.distanceTo(f), l2: f.distanceTo(h), rf, qU0: basisQ(ru, ZAX, Qn()).invert(), qF0: basisQ(rf, ZAX, Qn()).invert(), qH0: basisQ(A.along, A.palm, Qn()).invert() }; }
  // how a hand is turned when its fingers point along F and its palm faces P
  const handQ = (S, F, P, out) => basisQ(F, P, out).multiply(ARM[S].qH0);
  const ik = { p0: V3(), d: V3(), pole: V3(), u1: V3(), u2: V3(), E: V3(), b1: V3(), b2: V3(), qP: Qn(), qU: Qn(), qF: Qn(), qL: Qn(), qT: Qn(), lU: Qn(), lF: Qn(), lH: Qn() };
  // Put the wrist of arm S at W, with the hand turned to qH (or carried by the forearm when qH is null). hint is the way her elbow
  // leans. k mixes this with the pose her arm already has: 0 leaves it, 1 takes it whole. Her elbow is a hinge; six tenths of any
  // turn of her wrist about her forearm is given to the forearm itself, as a real forearm turns.
  function reach(S, W, qH, hint, k) {
    if (k <= 0.0005) return 0; const A = ARM[S], U = SK['uarm' + S], Fb = SK['farm' + S], H = SK['hand' + S];
    const p0 = rp(U, ik.p0), qP = rq(U.parent, ik.qP), d = ik.d.copy(W).sub(p0), far = d.length(), dist = cl(far, Math.abs(A.l1 - A.l2) + 0.004, A.l1 + A.l2 - 0.0008); d.multiplyScalar(1 / Math.max(1e-6, far));
    const a = (A.l1 * A.l1 - A.l2 * A.l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, A.l1 * A.l1 - a * a));
    const pole = ik.pole.copy(hint).addScaledVector(d, -hint.dot(d)); if (pole.lengthSq() < 1e-8) pole.set(0, -1, 0).addScaledVector(d, d.y); pole.normalize();
    const u1 = ik.u1.copy(d).multiplyScalar(a).addScaledVector(pole, h).normalize(), E = ik.E.copy(p0).addScaledVector(u1, A.l1), u2 = ik.u2.copy(d).multiplyScalar(dist).add(p0).sub(E).normalize();
    const b1 = ik.b1.copy(pole).multiplyScalar(-1).addScaledVector(u1, pole.dot(u1)).normalize(), qU = basisQ(u1, b1, ik.qU).multiply(A.qU0);
    const c = u2.dot(u1), sn = u2.dot(b1), b2 = ik.b2.copy(b1).multiplyScalar(c).addScaledVector(u1, -sn), qF = basisQ(u2, b2, ik.qF).multiply(A.qF0);
    if (qH) { const qL = ik.qL.copy(qF).invert().multiply(qH); if (qL.w < 0) qL.set(-qL.x, -qL.y, -qL.z, -qL.w);
      const tw = cl(2 * Math.atan2(qL.x * A.rf.x + qL.y * A.rf.y + qL.z * A.rf.z, qL.w), -2.4, 2.4) * 0.6; qF.multiply(ik.qT.setFromAxisAngle(A.rf, tw)); }
    U.quaternion.slerp(ik.lU.copy(qP).invert().multiply(qU), k); Fb.quaternion.slerp(ik.lF.copy(qU).invert().multiply(qF), k);
    if (qH) H.quaternion.slerp(ik.lH.copy(qF).invert().multiply(qH), k);
    U.updateMatrixWorld(true); return far - dist;       // more than zero: the place asked for is further than her arm
  }

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
  const BACK = (() => { const z = (y) => rTorso(0, y)[2], y0 = 1.185, h = 0.12, tilt = Math.atan2(z(y0 + h) - z(y0 - h), 2 * h);
    return { p: V3(0.012, y0, Math.min(z(y0), (z(y0 + h) + z(y0 - h)) / 2) - 0.019), q: Qn().setFromAxisAngle(XAX, tilt) }; })();
  const GRIP = [0.064 * HAND_S, 0.0235 * HAND_S, 0], HOOKP = [0.112 * HAND_S, 0.021 * HAND_S, 0.019 * HAND_S];      // where a held rod, and a hooked string, sit in her hand: [along her fingers, out from her palm, toward her thumb]
  const ANCH = V3(-0.060, 1.418, 0.040);                // the corner of her jaw on her right side, where the string comes back to (it rides on her head)
  const TR = 2.45;                                       // the moment she lets go, in the move's own seconds
  const K1 = V3(-0.40, 1.17, -0.04), K2 = V3(0.07, 1.20, 0.31);      // the bow's way round her: out past her right side, then in front of her chest
  const D = { pBack: V3(), qBack: Qn(), p: V3(), q: Qn(), qS: Qn(), qt: Qn(), a: V3(), b: V3(), c: V3(), K3: V3(), shL: V3(), anch: V3(), F: V3(), P: V3(), Th: V3(), W: V3(), g: V3(), qH: Qn(), qG: Qn(), qFK: Qn(), pFK: V3(), hint: V3(),
    missL: 0, missR: 0, tU: V3(), tD: V3(), nock: V3(), nock0: V3(), pass: V3(), dir: V3(), tail: V3(), tip: V3(), rel: V3(), relDir: V3(), e1: V3(), e2: V3() };
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
    armsAndBow(-1, 0); root.updateMatrixWorld(true);
    if (gearSettle) { gearSettle(); root.updateMatrixWorld(true); }       // the bags come to rest against her in the new pose
    softTick(0, true); root.updateMatrixWorld(true);
  }
  function play(name) { if (name === 'aim') name = 'draw'; if (!MOVES.includes(name) || name === 'pose') { pose(lastPose); return 'pose'; } mv = { name, t: 0 }; return name; }
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
    // a cheer: she dips, jumps, throws an arm up, lands soft
    if (N === 'cheer') { const c1 = sm(0, 0.22, T) * (1 - sm(0.22, 0.36, T)), u = cl((T - 0.36) / 0.5, 0, 1), air = Math.sin(PI * u), c2 = sm(0.84, 0.94, T) * (1 - sm(0.94, 1.3, T)), c = c1 + 0.8 * c2, k = sm(0.2, 0.45, T) * (1 - sm(1.0, 1.45, T));
      for (const [S] of SIDES) { add('thigh' + S, -0.45 * c - 0.25 * air, 0, 0); add('shin' + S, 0.9 * c + 0.5 * air, 0, 0); add('foot' + S, -0.45 * c + 0.2 * air, 0, 0); }
      SK.hips.position.y += -0.075 * c + 0.20 * 4 * u * (1 - u);
      add('uarmR', -2.7 * k, 0, 0); add('farmR', -0.45 * k, 0, 0); add('uarmL', -1.1 * k, 0, 0); add('farmL', -1.9 * k, 0, 0); add('head', -0.18 * k, 0, 0); add('spine2', -0.08 * k, 0, 0); }
    // limbering up: bouncing on her toes, shoulders rolling, arms shaken loose, her head from side to side
    if (N === 'limber') { const k = sm(0, 0.3, T) * (1 - sm(2.2, 2.6, T));
      bounce(0.020 * Math.abs(Math.sin(T * 9.5)) * k); for (const [S, s] of SIDES) { add('clav' + S, 0, 0, s * 0.16 * Math.sin(T * 5 + (s > 0 ? 1.6 : 0)) * k); add('uarm' + S, 0.14 * Math.sin(T * 9 + s) * k, 0, s * 0.06 * k); add('farm' + S, -(0.5 + 0.2 * Math.sin(T * 11 + s)) * k, 0, 0); add('shin' + S, 0.10 * k, 0, 0); add('thigh' + S, -0.05 * k, 0, 0); }
      add('head', 0, 0, 0.22 * Math.sin(T * 2.4) * k); add('neck', 0.04 * k, 0, 0.08 * Math.sin(T * 2.4) * k); }
    armsAndBow(N === 'draw' ? T : -1, dt); fingersTick(dt, snapNow);
    // her face: she blinks; her mouth moves when she talks
    if (clock > blinkAt) { blinkT = clock; blinkAt = clock + 2.2 + 2.6 * Math.abs(Math.sin(clock * 12.9)); }
    const bt = clock - blinkT, eyes = Math.max(squint, bt < 0.05 ? 0.5 : bt < 0.10 ? 1 : bt < 0.15 ? 0.5 : 0), key = eyes + '|' + mouthNow;
    if (key !== facePainted) { paintFace(eyes, mouthNow); facePainted = key; }
    if (gearTick) gearTick(dt);       // the bags and charms swing with her
    softTick(dt);       // and her sleeves, the tails of her headband and her loose locks
  }
  return { root, skeleton, bones, SK, animate, pose, play, seek, moves: MOVES, walk, bow: BOWK, light: FX, swing: () => { if (gearKick) gearKick(); }, setLook, meshes, spin: 0, time: 0, stanceProgress: 1, setStance() {}, setFace: (eyes, mouth) => paintFace(eyes || 0, mouth || 'rest'), debug: { SK, meshes, D, cloths: [], headPoint, JH, hairPt, phOfY }, get triangles() { return triCount; } };
}
