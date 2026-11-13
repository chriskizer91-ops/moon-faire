
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
    iron: std({ color: lin('#1b1a1e'), metalness: 0.75, roughness: 0.48, envMapIntensity: 1.0 }),
    sock: std({ map: sockTexR(), color: lin('#d2cbc8'), roughness: 0.97 }),
    cloth: std({ color: lin('#1a1518'), roughness: 0.9 })
  };

  // ---------- bind: one skinned mesh per material ----------
  const root = new THREE.Group(); root.name = 'ranger';
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
    m.name = key; m.castShadow = !/^(lens|pad|lock)$/.test(key); m.receiveShadow = true; m.frustumCulled = false;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }
  // stage one has no motion yet: pose() sets a few bone turns by hand, for checking her against the paintings
  // ---------- her moves (a first set, written for her: she is the quick, sporty one) ----------
  // pose() holds her still for checking against the paintings. play(name) starts a move: 'idle' (ready, light on her feet), 'walk',
  // 'jog', 'talk' (her own: one quick hand, weight on one hip), and three short ones that end by themselves: 'aim' (she draws a bow
  // that is not built yet), 'cheer' (a jump with an arm thrown up) and 'limber' (she shakes out and bounces). Every frame the bones
  // are set back to rest and the layers are added on top. The Jester's moves are the reference for what a full set holds, not copied.
  let lastPose = { arm: 15, leg: 0 }, mv = { name: 'pose', t: 0 }, wk = 0, jg = 0, gph = 0, clock = 0, blinkAt = 2.4, blinkT = -1, mouthAt = 0, mouthNow = 'rest', facePainted = '';
  const SHOTS = { aim: 3.0, cheer: 1.5, limber: 2.6 }, MOVES = ['pose', 'idle', 'walk', 'jog', 'talk', 'aim', 'cheer', 'limber'];
  const add = (b, x, y, z) => { const r = SK[b].rotation; r.x += x; r.y += y; r.z += z; };
  function restAll() { for (const k in SK) if (!/^(bag|charm)/.test(k)) SK[k].rotation.set(0, 0, 0); SK.hips.position.copy(SK.hips.userData.home); }
  function pose(o) {
    o = o || {}; mv = { name: 'pose', t: 0 }; wk = 0; jg = 0; lastPose = { arm: o.arm == null ? 15 : o.arm, leg: o.leg || 0 }; const arm = lastPose.arm * DEG - A_POSE, leg = lastPose.leg * DEG;
    restAll(); for (const [S, s] of SIDES) { SK['uarm' + S].rotation.z = s * arm; SK['thigh' + S].rotation.z = s * leg; SK['foot' + S].rotation.z = -s * leg; }
    root.updateMatrixWorld(true);
    if (gearSettle) { gearSettle(); root.updateMatrixWorld(true); }       // the bags come to rest against her in the new pose
  }
  function play(name) { if (!MOVES.includes(name) || name === 'pose') { pose(lastPose); return 'pose'; } mv = { name, t: 0 }; return name; }
  function walk(on) { return play(on ? 'walk' : 'pose') === 'walk'; }
  function animate(dt) {
    dt = dt > 0 ? Math.min(dt, 0.05) : 0; clock += dt;
    if (mv.name === 'pose') { if (gearTick) gearTick(dt); return; }
    mv.t += dt; if (SHOTS[mv.name] && mv.t >= SHOTS[mv.name]) mv = { name: 'idle', t: 0 };
    const N = mv.name, T = mv.t; restAll();
    wk += ((N === 'walk' ? 1 : 0) - wk) * Math.min(1, dt * 4.5); jg += ((N === 'jog' ? 1 : 0) - jg) * Math.min(1, dt * 4.5);
    const go = Math.min(1, wk + jg), g = wk + jg > 1e-4 ? jg / (wk + jg) : 0, L = (a, b) => a + (b - a) * g, still = 1 - go;
    for (const [S, s] of SIDES) SK['uarm' + S].rotation.z = s * (9 * DEG - A_POSE);       // arms hang close
    const bounce = (h) => { if (h <= 0) return; const a = h / 0.10; SK.hips.position.y += h; for (const [S] of SIDES) { add('foot' + S, a, 0, 0); add('toe' + S, -a, 0, 0); } };       // up on the balls of her feet
    // always: breath, and a small shift of weight when she stands
    const br = Math.sin(clock * 1.7), sway = Math.sin(clock * 0.9);
    add('spine2', 0.012 * br, 0, 0); add('spine3', 0.010 * br, 0, 0); for (const [S, s] of SIDES) add('clav' + S, 0, 0, s * 0.014 * br);
    SK.hips.position.x += 0.007 * sway * still; add('hips', 0, 0, 0.012 * sway * still); add('spine1', 0, 0, -0.012 * sway * still);
    if (N === 'idle') { const c = clock % 4.2; if (c < 0.7) bounce(0.024 * Math.pow(Math.sin(c / 0.35 * PI), 2) * (c < 0.35 ? 1 : 0.6)); }       // light on her feet: a quick double bounce now and then
    // walking and jogging share one cycle; g slides from one to the other
    if (go > 0.001) { gph += dt * TAU / L(0.98, 0.62); const A = L(0.40, 0.58), sn = Math.sin(gph), cs = Math.cos(gph);
      for (const [S, s] of SIDES) { const p = gph + (s < 0 ? 0 : PI), si = Math.sin(p), co = Math.cos(p), sw = Math.max(0, co), st = Math.max(0, -co);
        const th = -(A * si + L(0.05, 0.16)) * go, kn = (L(1.05, 1.75) * Math.pow(sw, 1.3) + L(0.20, 0.38) * Math.pow(Math.max(0, Math.sin(p - 0.5)), 3) * st + L(0.04, 0.22)) * go;       // thigh; knee folding in the swing and giving a little as the foot lands
        const up = 0.22 * Math.pow(Math.max(0, si), 3) * go, off = L(0.55, 0.75) * Math.max(0, -si) * st * go;       // toes up to land on the heel; heel up to push off
        add('thigh' + S, th, 0, 0); add('shin' + S, kn, 0, 0); add('foot' + S, -(th + kn) * 0.92 - up + off, 0, 0); add('toe' + S, -off * 0.9, 0, 0);
        add('uarm' + S, (L(0.42, 0.72) * si + L(0, 0.18)) * go, 0, 0); add('farm' + S, -(L(0.28, 1.45) + L(0.30, 0.22) * Math.max(0, -si)) * go, 0, 0); }
      SK.hips.position.y += (-L(0.045, 0) * sn * sn - L(0, 0.036) * cs * cs + L(0, 0.02)) * go; SK.hips.position.x += L(0.013, 0.006) * cs * go;
      add('hips', L(0.02, 0.09) * go, L(0.10, 0.14) * sn * go, L(0.035, 0.02) * cs * go);       // lean, the turn of the pelvis with each stride, and its dip on the swinging side
      add('spine1', L(0.02, 0.05) * go, -0.05 * sn * go, -0.02 * cs * go); add('spine2', 0, -L(0.09, 0.12) * sn * go, -0.02 * cs * go); add('spine3', 0, -0.05 * sn * go, 0);
      add('neck', -L(0.03, 0.10) * go, L(0.09, 0.13) * sn * go, 0); }       // her shoulders turn against her hips; her head stays on the way she is going
    // talking: weight on one hip, one quick hand at chest height, small nods
    if (N === 'talk') { const k = sm(0, 0.4, T), a1 = Math.sin(T * 4.4), a2 = Math.sin(T * 2.3 + 1), a3 = Math.sin(T * 6.1);
      SK.hips.position.x += 0.016 * k; add('hips', 0, 0.10 * k, 0.03 * k); add('spine1', 0, -0.06 * k, -0.035 * k);
      add('uarmR', -(0.55 + 0.12 * a2) * k, 0, -0.10 * k); add('farmR', -(1.55 + 0.28 * a1) * k, 0, 0); add('handR', 0.25 * a3 * k, 0.5 * a2 * k, 0);
      add('uarmL', 0.06 * a2 * k, 0, 0); add('farmL', -0.22 * k, 0, 0);
      add('head', (0.05 * a1 + 0.03) * k, 0.10 * a2 * k, 0.05 * Math.sin(T * 1.3) * k); add('neck', 0, 0.06 * a2 * k, 0);
      if (clock > mouthAt) { mouthAt = clock + 0.10 + 0.09 * Math.abs(Math.sin(clock * 37.7)); const r = Math.abs(Math.sin(clock * 91.3)); mouthNow = r < 0.28 ? 'rest' : r < 0.62 ? 'open' : r < 0.86 ? 'oo' : 'smile'; }
    } else mouthNow = N === 'cheer' && T > 0.2 && T < 1.3 ? 'smile' : 'rest';
    let squint = 0;
    // taking aim: bow arm out to her left, head turned to it, the other hand drawn back to her jaw, a held breath, the release
    if (N === 'aim') { const k1 = sm(0, 0.5, T), k2 = sm(0.5, 1.3, T), rel = sm(1.95, 2.02, T), out = 1 - sm(2.4, 3.0, T), hold = k2 * (1 - rel);
      add('uarmL', 0, 0, (86 - 9) * DEG * k1 * out); add('uarmR', 0, 0, -(100 - 9) * DEG * k1 * out); add('farmR', -(1.7 * k1 + 1.1 * k2 - 1.0 * rel) * out, 0, 0); add('uarmR', 0, -0.35 * rel * out, 0);
      add('neck', 0, 0.5 * k1 * out, 0); add('head', 0, 0.62 * k1 * out, 0.04 * hold); add('spine2', 0, 0.12 * k1 * out, -0.05 * k2 * out);
      for (const [S, s] of SIDES) { add('thigh' + S, 0, 0, s * 0.10 * k1 * out); add('foot' + S, 0, 0, -s * 0.10 * k1 * out); }
      add('farmL', 0, 0, 0.012 * Math.sin(T * 31) * hold); squint = hold > 0.6 ? 0.5 : 0; }
    // a cheer: she dips, jumps, throws an arm up, lands soft
    if (N === 'cheer') { const c1 = sm(0, 0.22, T) * (1 - sm(0.22, 0.36, T)), u = cl((T - 0.36) / 0.5, 0, 1), air = Math.sin(PI * u), c2 = sm(0.84, 0.94, T) * (1 - sm(0.94, 1.3, T)), c = c1 + 0.8 * c2, k = sm(0.2, 0.45, T) * (1 - sm(1.0, 1.45, T));
      for (const [S] of SIDES) { add('thigh' + S, -0.45 * c - 0.25 * air, 0, 0); add('shin' + S, 0.9 * c + 0.5 * air, 0, 0); add('foot' + S, -0.45 * c + 0.2 * air, 0, 0); }
      SK.hips.position.y += -0.075 * c + 0.20 * 4 * u * (1 - u);
      add('uarmR', -2.7 * k, 0, 0); add('farmR', -0.45 * k, 0, 0); add('uarmL', -1.1 * k, 0, 0); add('farmL', -1.9 * k, 0, 0); add('head', -0.18 * k, 0, 0); add('spine2', -0.08 * k, 0, 0); }
    // limbering up: bouncing on her toes, shoulders rolling, arms shaken loose, her head from side to side
    if (N === 'limber') { const k = sm(0, 0.3, T) * (1 - sm(2.2, 2.6, T));
      bounce(0.020 * Math.abs(Math.sin(T * 9.5)) * k); for (const [S, s] of SIDES) { add('clav' + S, 0, 0, s * 0.16 * Math.sin(T * 5 + (s > 0 ? 1.6 : 0)) * k); add('uarm' + S, 0.14 * Math.sin(T * 9 + s) * k, 0, s * 0.06 * k); add('farm' + S, -(0.5 + 0.2 * Math.sin(T * 11 + s)) * k, 0, 0); add('shin' + S, 0.10 * k, 0, 0); add('thigh' + S, -0.05 * k, 0, 0); }
      add('head', 0, 0, 0.22 * Math.sin(T * 2.4) * k); add('neck', 0.04 * k, 0, 0.08 * Math.sin(T * 2.4) * k); }
    // her face: she blinks; her mouth moves when she talks
    if (clock > blinkAt) { blinkT = clock; blinkAt = clock + 2.2 + 2.6 * Math.abs(Math.sin(clock * 12.9)); }
    const bt = clock - blinkT, eyes = Math.max(squint, bt < 0.05 ? 0.5 : bt < 0.10 ? 1 : bt < 0.15 ? 0.5 : 0), key = eyes + '|' + mouthNow;
    if (key !== facePainted) { paintFace(eyes, mouthNow); facePainted = key; }
    if (gearTick) gearTick(dt);       // the bags and charms swing with her
  }
  return { root, skeleton, bones, SK, animate, pose, play, moves: MOVES, walk, swing: () => { if (gearKick) gearKick(); }, setLook, meshes, spin: 0, time: 0, stanceProgress: 1, setStance() {}, setFace: (eyes, mouth) => paintFace(eyes || 0, mouth || 'rest'), debug: { SK, meshes, cloths: [], headPoint, JH, hairPt, phOfY }, get triangles() { return triCount; } };
}
