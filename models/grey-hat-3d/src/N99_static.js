  // ---------- materials (stage one) ----------
  const SKIN_C = (BAKED && BAKED.skinHand) || SKIN || '#c07a54', LEATHER_C = '#211e1f', SKIN_F = (BAKED && BAKED.skinNeck) || '#c5815e';
  // a painting that is laid on by position, not by uv: the canvas takes the picture's own size once it has decoded
  function projTex(key, fill) {
    const c = cvs(4, 4), g = c.getContext('2d'); g.fillStyle = fill; g.fillRect(0, 0, 4, 4);
    const t = ctex(c); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
    onBaked(key, (im) => { c.width = im.naturalWidth; c.height = im.naturalHeight; g.drawImage(im, 0, 0); t.needsUpdate = true; });
    return t;
  }
  const WIN = (BAKED && BAKED.win) || { front: [-0.57, 0.57, -0.03, 1.81], back: [-0.57, 0.57, -0.03, 1.81], sideR: [-0.27, 0.21, -0.03, 1.81], sideL: [-0.21, 0.27, -0.03, 1.81] };
  const v4 = (a) => new THREE.Vector4(a[0], a[1], a[2], a[3]);
  const MATS = {
    // Four paintings at once. Each is laid on flat from its own side by where the point rests (not where it has moved to), and they
    // are mixed by which way the surface faced at rest: B1 from the front and from behind, B2 from his right and from his left.
    // uv.x (set by projUV) says how far the side paintings may be used. The paintings carry their own soft studio light, so most of
    // what shows is the painting as painted and only a little is lit again.
    proj: null, projArm: null,
  };
  const tFront = projTex('front', '#3a2c36'), tBack = projTex('back', '#3a2c36');
  const mkProj = (kR, kL) => {
    {
      const tF = tFront, tB = tBack, tR = projTex(kR, '#3a2c36'), tL = projTex(kL, '#3a2c36');
      const m = sheen(std({ map: tF, color: lin('#b9b2b6'), roughness: 0.80, envMapIntensity: 0.18, emissive: lin('#ffffff'), emissiveIntensity: 0.36 }), '#c9b6c4', 3, 0.05), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        Object.assign(sh.uniforms, { uPB: { value: tB }, uPR: { value: tR }, uPL: { value: tL }, uWF: { value: v4(WIN.front) }, uWB: { value: v4(WIN.back) }, uWR: { value: v4(WIN[kR] || WIN.sideR) }, uWL: { value: v4(WIN[kL] || WIN.sideL) }, uPPow: { value: 5.0 } });
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRest; varying vec3 vRestN;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = position; vRestN = normal;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uPB; uniform sampler2D uPR; uniform sampler2D uPL; uniform vec4 uWF; uniform vec4 uWB; uniform vec4 uWR; uniform vec4 uWL; uniform float uPPow; varying vec3 vRest; varying vec3 vRestN; vec3 gProj;')
          .replace('#include <map_fragment>', [
            'vec3 rn = normalize( vRestN ); float sideK = vUv.x;',
            'float wf = pow( max( 0.0, rn.z ), uPPow ) + 0.02 * step( 0.0, rn.z ), wb = pow( max( 0.0, -rn.z ), uPPow ) + 0.02 * step( rn.z, 0.0 );',
            'float pS = uPPow * ( 1.0 + 3.0 * vUv.y ); float wr = pow( max( 0.0, -rn.x ), pS ) * sideK, wl = pow( max( 0.0, rn.x ), pS ) * sideK;',
            'vec2 uf = vec2( ( vRest.x - uWF.x ) / ( uWF.y - uWF.x ), ( vRest.y - uWF.z ) / ( uWF.w - uWF.z ) );',
            'vec2 ub = vec2( ( -vRest.x - uWB.x ) / ( uWB.y - uWB.x ), ( vRest.y - uWB.z ) / ( uWB.w - uWB.z ) );',
            'vec2 ur = vec2( ( vRest.z - uWR.x ) / ( uWR.y - uWR.x ), ( vRest.y - uWR.z ) / ( uWR.w - uWR.z ) );',
            'vec2 ul = vec2( ( -vRest.z - uWL.x ) / ( uWL.y - uWL.x ), ( vRest.y - uWL.z ) / ( uWL.w - uWL.z ) );',
            'gProj = ( mapTexelToLinear( texture2D( map, uf ) ).rgb * wf + mapTexelToLinear( texture2D( uPB, ub ) ).rgb * wb + mapTexelToLinear( texture2D( uPR, ur ) ).rgb * wr + mapTexelToLinear( texture2D( uPL, ul ) ).rgb * wl ) / ( wf + wb + wr + wl );',
            'diffuseColor.rgb *= gProj;'].join('\n'))
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gProj;');
      };
      return m;
    }
  };
  // the trunk, legs and boots take their sides from B2 (arms held out of the way); the arms take theirs from A3 (arms hanging)
  MATS.proj = mkProj('sideR', 'sideL'); MATS.projArm = mkProj('armR', 'armL'); MATS.projHair = mkProj('sideR', 'sideL'); MATS.projHair.side = THREE.DoubleSide; MATS.projRuffle = mkProj('armR', 'armL'); MATS.projRuffle.side = THREE.DoubleSide;
  Object.assign(MATS, {
    // the head wears three pictures at once, mixed by which way the skin faces (N40_head.js): the front painting, the profile painting, a plain colour
    face: (() => {
      const t = faceT;
      const m = sheen(std({ map: t, color: lin('#b9b2b6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.06);
      const ts = bakedTex('faceSide', 512, 512, SKIN_F), ta = bakedTex('faceSideA', 512, 512, '#000000'), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        sh.uniforms.uSide = { value: ts }; sh.uniforms.uSideA = { value: ta }; sh.uniforms.uPlain = { value: lin('#2b1d17') }; sh.uniforms.uPlain2 = { value: lin(SKIN_F) };       // plain colours: his beard under the jaw (faceMix.w 0), his neck's skin elsewhere (faceMix.w 1)
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 faceMix; attribute vec2 uvSide; varying vec4 vFaceMix; varying vec2 vUvSide;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFaceMix = faceMix; vUvSide = uvSide;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSide; uniform sampler2D uSideA; uniform vec3 uPlain; uniform vec3 uPlain2; varying vec4 vFaceMix; varying vec2 vUvSide; vec3 gFaceCol;')
          .replace('#include <map_fragment>', 'vec4 texelColor = mapTexelToLinear( texture2D( map, vUv ) );\n float fSide = texture2D( uSideA, vUvSide ).r * vFaceMix.x;\n vec3 sideCol = mapTexelToLinear( texture2D( uSide, vUvSide ) ).rgb;\n gFaceCol = ( texelColor.rgb * max( 0.0, 1.0 - fSide - vFaceMix.y ) + sideCol * fSide + mix( uPlain, uPlain2, vFaceMix.w ) * vFaceMix.y ) * vFaceMix.z;\n diffuseColor.rgb *= gFaceCol;')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gFaceCol;');
      };
      return m;
    })(),
    frame: std({ color: lin('#0d0d10'), roughness: 0.28, envMapIntensity: 1.1 }),
    lens: phys({ color: lin('#dfe6ee'), transparent: true, opacity: 0.10, roughness: 0.04, metalness: 0, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide }),
    // the hand model in two plain colours until his hand paintings are baked on: uv.x 1 is glove leather, 0 is skin
    glove: (() => {
      const c = cvs(64, 4), g = c.getContext('2d'); g.fillStyle = SKIN_C; g.fillRect(0, 0, 32, 4); g.fillStyle = LEATHER_C; g.fillRect(32, 0, 32, 4);
      const t = ctex(c); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
      return sheen(std({ map: t, color: lin('#b9b2b6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.04);
    })(),
    skin: sheen(std({ color: lin('#b9b2b6').multiply(lin(SKIN_C)), roughness: 0.70, envMapIntensity: 0.2, emissive: lin(SKIN_C), emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.06),
    nail: phys({ color: lin('#e3c2b0'), transparent: true, opacity: 0.22, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.2, depthWrite: false }),
    cloth: std({ color: lin('#1a1518'), roughness: 0.9 })
  });

  // ---------- bind: one skinned mesh per material ----------
  const root = new THREE.Group(); root.name = 'noiz';
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
    m.name = key; m.castShadow = !/^(nail|lens)$/.test(key); m.receiveShadow = true; m.frustumCulled = false; m.userData.painted = m.material;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }

  // ---------- holding still, and a first few moves ----------
  // pose() holds him still for checking against the paintings (arm: degrees out from straight down; leg: degrees apart).
  // play(name) starts a move: 'idle' (he stands and breathes, arms hanging), 'walk' (a first walk, on the spot, so the gold dust can
  // be seen following his boots) and 'talk' (one hand, small nods; no mouth yet). Every frame the bones go back to rest and the
  // layers are added on top. The walk is the Ranger's stride slowed and widened for him; it is a first draft, not his own walk.
  const A_REST = N_APOSE, MOVES = ['pose', 'idle', 'walk', 'talk'];
  let lastPose = { arm: A_REST, leg: 0 }, mv = { name: 'pose', t: 0 }, wk = 0, gph = 0, clock = 0;
  const add = (b, x, y, z) => { const r = SK[b].rotation; r.x += x; r.y += y; r.z += z; };
  function restAll() { for (const k in SK) SK[k].rotation.set(0, 0, 0); SK.hips.position.copy(SK.hips.userData.home); }
  function pose(o) {
    o = o || {}; mv = { name: 'pose', t: 0 }; wk = 0; lastPose = { arm: o.arm == null ? A_REST : o.arm, leg: o.leg || 0 };
    const arm = lastPose.arm * DEG - A_POSE, leg = lastPose.leg * DEG;
    restAll(); for (const [S, s] of SIDES) { SK['uarm' + S].rotation.z = s * arm; SK['thigh' + S].rotation.z = s * leg; SK['foot' + S].rotation.z = -s * leg; }
    root.updateMatrixWorld(true);
  }
  function play(name) { if (!MOVES.includes(name) || name === 'pose') { pose(lastPose); return 'pose'; } mv = { name, t: 0 }; return name; }
  const WALK_SPEED = 1.15;                          // metres a second his stride would cover; the page tells the dust the ground is passing at this speed
  function animate(dt) {
    dt = dt > 0 ? Math.min(dt, 0.05) : 0; clock += dt;
    if (mv.name !== 'pose') {
      mv.t += dt; const N = mv.name, T = mv.t; restAll();
      wk += ((N === 'walk' ? 1 : 0) - wk) * Math.min(1, dt * 4.5); const go = wk, still = 1 - go;
      for (const [S, s] of SIDES) SK['uarm' + S].rotation.z = s * (17 * DEG - A_POSE);       // arms hang, as near his sides as the big sleeves allow
      const br = Math.sin(clock * 1.5), sway = Math.sin(clock * 0.8);
      add('spine2', 0.012 * br, 0, 0); add('spine3', 0.010 * br, 0, 0); for (const [S, s] of SIDES) add('clav' + S, 0, 0, s * 0.012 * br);
      SK.hips.position.x += 0.008 * sway * still; add('hips', 0, 0, 0.012 * sway * still); add('spine1', 0, 0, -0.012 * sway * still); add('head', 0.015 * Math.sin(clock * 0.6), 0.05 * Math.sin(clock * 0.37) * still, 0);
      if (go > 0.001) {
        gph += dt * TAU / 1.06; const A = 0.36, sn = Math.sin(gph), cs = Math.cos(gph);
        for (const [S, s] of SIDES) {
          const p = gph + (s < 0 ? 0 : PI), si = Math.sin(p), co = Math.cos(p), sw = Math.max(0, co), st = Math.max(0, -co);
          const th = -(A * si + 0.04) * go, kn = (0.95 * Math.pow(sw, 1.3) + 0.18 * Math.pow(Math.max(0, Math.sin(p - 0.5)), 3) * st + 0.04) * go;       // thigh; knee folding in the swing and giving a little as the foot lands
          const up = 0.20 * Math.pow(Math.max(0, si), 3) * go, off = 0.50 * Math.max(0, -si) * st * go;                                                // toes up to land on the heel; heel up to push off
          add('thigh' + S, th, 0, -s * 0.035 * go); add('shin' + S, kn, 0, 0); add('foot' + S, -(th + kn) * 0.92 - up + off, 0, s * 0.035 * go); add('toe' + S, -off * 0.9, 0, 0);       // his feet come in a little under him as he walks
          add('uarm' + S, 0.34 * si * go, 0, 0); add('farm' + S, -(0.24 + 0.26 * Math.max(0, -si)) * go, 0, 0);
        }
        SK.hips.position.y += -0.040 * sn * sn * go; SK.hips.position.x += 0.016 * cs * go;
        add('hips', 0.02 * go, 0.09 * sn * go, 0.03 * cs * go); add('spine1', 0.02 * go, -0.045 * sn * go, -0.02 * cs * go); add('spine2', 0, -0.08 * sn * go, -0.02 * cs * go); add('spine3', 0, -0.05 * sn * go, 0);
        add('neck', -0.03 * go, 0.08 * sn * go, 0);
      }
      if (N === 'talk') {
        const k = sm(0, 0.4, T), a1 = Math.sin(T * 3.6), a2 = Math.sin(T * 1.9 + 1), a3 = Math.sin(T * 5.2);
        SK.hips.position.x += 0.014 * k; add('hips', 0, 0.08 * k, 0.025 * k); add('spine1', 0, -0.05 * k, -0.03 * k);
        add('uarmR', -(0.50 + 0.10 * a2) * k, 0, -0.08 * k); add('farmR', -(1.35 + 0.25 * a1) * k, 0, 0); add('handR', 0.2 * a3 * k, 0.4 * a2 * k, 0);
        add('farmL', -0.18 * k, 0, 0); add('head', (0.05 * a1 + 0.02) * k, 0.10 * a2 * k, 0.04 * Math.sin(T * 1.3) * k); add('neck', 0, 0.05 * a2 * k, 0);
      }
      root.updateMatrixWorld(true);
    }
    DUST.ground.set(-Math.sin(root.rotation.y), 0, -Math.cos(root.rotation.y)).multiplyScalar(api.walkOnSpot ? WALK_SPEED * wk : 0);
    DUST.update(dt);
  }
  // the blank doll: every part in one plain clay colour, so his shape can be judged without his paintings on it
  const CLAY = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15 }), CLAY2 = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15, side: THREE.DoubleSide });
  let blank = false;
  function setBlank(on) { blank = !!on; for (const k in meshes) { const m = meshes[k]; m.material = !blank ? m.userData.painted : /^(projHair|projRuffle)$/.test(k) ? CLAY2 : /^(lens|nail)$/.test(k) ? m.userData.painted : CLAY; if (k === 'lens' || k === 'nail') m.visible = !blank; } return blank; }
  // Every list a mesh carries must be as long as its list of points. A real graphics chip refuses to draw a mesh with a short list, so the
  // whole mesh vanishes (his face did, November 13), while the software renderer the tools here use draws it anyway. So it is caught here.
  for (const k in meshes) { const g = meshes[k].geometry, n = g.attributes.position.count; for (const a in g.attributes) if (g.attributes[a].count !== n) throw new Error('mesh "' + k + '": ' + a + ' has ' + g.attributes[a].count + ' entries for ' + n + ' points'); }
  const api = { root, fx, skeleton, bones, SK, animate, pose, play, moves: MOVES, meshes, dust: DUST, setBlank, get blank() { return blank; }, walkOnSpot: true, walkSpeed: WALK_SPEED, name: 'Noiz', debug: { SK, meshes, trunkPt, legPt, bootPt, headPoint, hairPt }, get triangles() { return triCount; } };
  pose(lastPose);
  return api;
}
