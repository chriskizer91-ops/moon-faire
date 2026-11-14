  // ---------- materials (stage one) ----------
  const NET_N = 26, NET_H = 0.024, NET_T = 0.0024;      // the fishnet: diamonds round a leg, how tall one is (metres), how thick the thread is (metres)
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
  const mkProj = (kR, kL, cut) => {
    {
      const tF = tFront, tB = tBack, tR = projTex(kR, '#3a2c36'), tL = projTex(kL, '#3a2c36');
      const m = sheen(std({ map: tF, color: lin('#b9b2b6'), roughness: 0.80, envMapIntensity: 0.18, emissive: lin('#ffffff'), emissiveIntensity: 0.36 }), '#c9b6c4', 3, 0.05), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        Object.assign(sh.uniforms, { uPB: { value: tB }, uPR: { value: tR }, uPL: { value: tL }, uWF: { value: v4(WIN.front) }, uWB: { value: v4(WIN.back) }, uWR: { value: v4(WIN[kR] || WIN.sideR) }, uWL: { value: v4(WIN[kL] || WIN.sideL) }, uPPow: { value: 5.0 }, uCorsetCut: cut ? CORSET_CUT : { value: 0 } });
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRest; varying vec3 vRestN;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = position; vRestN = normal;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uPB; uniform sampler2D uPR; uniform sampler2D uPL; uniform vec4 uWF; uniform vec4 uWB; uniform vec4 uWR; uniform vec4 uWL; uniform float uPPow; uniform float uCorsetCut; varying vec3 vRest; varying vec3 vRestN; vec3 gProj;')
          .replace('#include <map_fragment>', [
            'vec3 rn = normalize( vRestN ); float sideK = vUv.x;',
            'float wf = pow( max( 0.0, rn.z ), uPPow ) + 0.02 * step( 0.0, rn.z ), wb = pow( max( 0.0, -rn.z ), uPPow ) + 0.02 * step( rn.z, 0.0 );',
            'float pS = uPPow * ( 1.0 + 3.0 * vUv.y ); float wr = pow( max( 0.0, -rn.x ), pS ) * sideK, wl = pow( max( 0.0, rn.x ), pS ) * sideK;',
            CUT_GLSL,
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
  // The corset's bottom edge. The old skin's trunk still carries the corset, and the corset comes down in a point at the front, lower than
  // the top of the new trousers. So the old skin over his hips is not switched off whole: it is drawn down to the corset's painted edge
  // and thrown away below it (uCorsetCut 1), pixel by pixel, and the new trousers show from there down. The edge is measured off the
  // paintings (tools/trouser_measure.py): B1's front (a V, 1.00 m at the middle, 1.05 at the sides), B1's back (1.03 to 1.05) and B2's
  // sides (1.08 at the side seam: B2 has it higher than B1). Each painting's edge is used where that painting is the one that shows.
  // (Every painted-skin material carries the cut and most have it switched off: materials built by one function share one compiled program.)
  const CORSET_CUT = { value: 1 };
  const CUT_GLSL = [
    'float cutF = 0.997 + 0.051 * pow( min( abs( vRest.x ) / 0.17, 1.0 ), 0.70 ), cutB = 1.027 + 0.020 * min( abs( vRest.x ) / 0.17, 1.0 ), cutS = 1.082 - 1.71 * ( vRest.z + 0.03 ) * ( vRest.z + 0.03 );',
    'if ( uCorsetCut > 0.5 && vRest.y < ( cutF * wf + cutB * wb + cutS * ( wr + wl ) ) / ( wf + wb + wr + wl ) ) discard;'].join('\n');
  // the trunk, legs and boots take their sides from B2 (arms held out of the way); the arms take theirs from A3 (arms hanging)
  MATS.proj = mkProj('sideR', 'sideL'); MATS.projArm = mkProj('armR', 'armL'); MATS.projHair = mkProj('sideR', 'sideL'); MATS.projHair.side = THREE.DoubleSide; MATS.projRuffle = mkProj('armR', 'armL'); MATS.projRuffle.side = THREE.DoubleSide;
  MATS.projLegs = MATS.projBoots = MATS.proj; MATS.projTrunk = mkProj('sideR', 'sideL', true);      // one material, three meshes: each region of the old skin can be hidden by itself
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
    cloth: std({ color: lin('#1a1518'), roughness: 0.9 }),
    // The doll's skin: matte, lit like his face and hands. Its colour comes point by point (dollCol, N45_doll.js). From the hips down it
    // also wears black fishnet tights, drawn here and not as a picture, so that the net stays sharp close up and never shimmers far off:
    //   the net     two sets of slanting threads round each leg, NET_N diamonds round and NET_H metres tall. The paintings do not agree on
    //               the size (tools/trouser_measure.py): in the holes of B1 a diamond is 1.3 to 1.5 cm wide and 2.1 tall; on the bare legs
    //               of B5 it is 2.2 to 3.2 cm; in F8, by the scale of its cloth, 2.3 by 2.9. This net is B1's width, because B1 is the
    //               painting the holes are compared with, and a little taller, toward the other two: about 1.5 cm wide round the knee
    //               and calf (1.8 at the top of the thigh) and 2.4 tall. Each set is worked out as the share of the pixel that thread
    //               covers (not as a hard line), so far away it fades evenly into a darker skin and never shimmers.
    //               It is placed by where a point RESTS on the leg (dollLeg), so it follows the leg when he walks.
    //   the top     above a line cut like briefs the tights are solid black, as B5's black shorts are; so is the foot, below the ankle
    // A leg's net runs up its own side of his hips; the two sides meet on his centre line under the solid top.
    doll: (() => {
      const m = sheen(std({ color: lin('#b9b2b6'), vertexColors: true, roughness: 0.74, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveIntensity: 0.34 }), '#ffb49a', 3.2, 0.06), first = m.onBeforeCompile;
      m.extensions = { derivatives: true };
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        Object.assign(sh.uniforms, { uNetC: { value: lin('#19161a') }, uKnitC: { value: lin('#1b181c') }, uNetN: { value: NET_N }, uNetH: { value: NET_H }, uNetT: { value: NET_T } });
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 dollLeg; varying vec3 vLeg; varying vec3 vRest;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLeg = dollLeg; vRest = position;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', ['#include <common>',
          'uniform vec3 uNetC; uniform vec3 uKnitC; uniform float uNetN; uniform float uNetH; uniform float uNetT; varying vec3 vLeg; varying vec3 vRest; vec3 gDollC;',
          '// threads d wide at every whole number of x: the share of a stretch w long, centred on x, that they cover',
          'float netCover( float x, float w, float d ) { float a = x - 0.5 * w + 0.5 * d, b = x + 0.5 * w + 0.5 * d; return ( ( floor( b ) * d + min( fract( b ), d ) ) - ( floor( a ) * d + min( fract( a ), d ) ) ) / w; }'].join('\n'))
          .replace('#include <color_fragment>', ['gDollC = vColor.rgb;',
            '{',
            '  float r = max( length( vLeg.xy ), 0.0005 ), onLeg = step( 0.5, vLeg.z );',
            '  float hem = 0.925 + 0.075 * vLeg.x / r - 0.10 * ( 1.0 - smoothstep( 0.014, 0.050, abs( vRest.x ) ) );',
            '  float fy = fwidth( vRest.y ) + 0.00002;',
            '  float below = 1.0 - smoothstep( -fy, fy, vRest.y - hem ), foot = 1.0 - smoothstep( -fy, fy, vRest.y - 0.185 ), top = smoothstep( -fy, fy, vRest.y - 1.045 );',
            '  float uN = atan( vLeg.y, vLeg.x ) / 6.2831853 * uNetN, vN = vRest.y / uNetH, kq = uNetN / ( 6.2831853 * r * r );',
            '  vec2 gx = dFdx( vLeg.xy ), gy = dFdy( vLeg.xy );',
            '  float ux = ( vLeg.x * gx.y - vLeg.y * gx.x ) * kq, uy = ( vLeg.x * gy.y - vLeg.y * gy.x ) * kq, vx = dFdx( vRest.y ) / uNetH, vy = dFdy( vRest.y ) / uNetH;',
            '  float a = uN + vN, b = uN - vN, wa = abs( ux + vx ) + abs( uy + vy ) + 0.0001, wb = abs( ux - vx ) + abs( uy - vy ) + 0.0001;',
            '  float d = clamp( uNetT * sqrt( uNetN * uNetN / ( 39.478418 * r * r ) + 1.0 / ( uNetH * uNetH ) ), 0.03, 0.45 );',
            '  float ca = netCover( a, wa, d ), cb = netCover( b, wb, d ), net = 1.0 - ( 1.0 - ca ) * ( 1.0 - cb );',
            '  float da = abs( fract( a + 0.5 ) - 0.5 ), db = abs( fract( b + 0.5 ) - 0.5 ), near = 1.0 - smoothstep( 0.25, 0.9, max( wa, wb ) );',
            '  net = max( net, near * ( 1.0 - smoothstep( 1.25 * d - 0.7 * max( wa, wb ), 1.25 * d + 0.7 * max( wa, wb ), length( vec2( da, db ) ) ) ) );',
            '  float sa = netCover( a - 0.6 * d, wa, min( 0.9, 3.2 * d ) ), sb = netCover( b + 0.6 * d, wb, min( 0.9, 3.2 * d ) ), shade = 1.0 - 0.17 * ( 1.0 - ( 1.0 - sa ) * ( 1.0 - sb ) );',
            '  float cord = 0.82 + 0.36 * near * ( 0.5 + 0.5 * sin( 6.2831853 * 7.0 * ( ca > cb ? b : a ) ) );',
            '  float solid = max( foot, ( 1.0 - below ) * ( 1.0 - top ) );',
            '  gDollC = mix( gDollC, mix( gDollC * shade, uNetC * cord, net ), onLeg * below * ( 1.0 - foot ) );',
            '  gDollC = mix( gDollC, uKnitC, onLeg * solid );',
            '}',
            'diffuseColor.rgb *= gDollC;'].join('\n'))
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= gDollC;');
      };
      return m;
    })()
  });

  // His trousers (N46_trousers.js): the printed cloth, repeated, with the map of the holes over it. Lit the way the old painted skin is (most
  // of what shows is the picture as painted), so they sit beside the painted corset and boots. Drawn from both sides: the inside is the
  // same cloth, much darker and with the print showing through only faintly, which is what you see past the leg through a hole.
  // Where the map says "no cloth" the pixel is thrown away (a hard cut). Nothing here is see-through, so nothing has to be sorted.
  MATS.trousers = (() => {
    const t = bakedTex('cloth', 512, 512, '#46222a'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    const TILE = (BAKED && BAKED.clothTile) || 0.115;
    const m = sheen(std({ map: t, color: lin('#b9b2b6'), roughness: 0.86, envMapIntensity: 0.12, emissive: lin('#ffffff'), emissiveIntensity: 0.36, side: THREE.DoubleSide }), '#c9a6ae', 3, 0.04), first = m.onBeforeCompile;
    m.onBeforeCompile = (sh) => {
      if (first) first(sh);
      Object.assign(sh.uniforms, { uMask: { value: TR_MASK }, uClothK: { value: new THREE.Vector2(2 * TR_PANEL / TILE, TR_PANEL / TILE) }, uFrayC: { value: lin('#141113') }, uThreadC: { value: lin('#4a4046') } });
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uMask; uniform vec2 uClothK; uniform vec3 uFrayC; uniform vec3 uThreadC; vec3 gCloth;')
        .replace('#include <map_fragment>', [
          'vec4 mk = texture2D( uMask, vUv );',
          'if ( mk.b < 0.5 ) discard;',
          'gCloth = mapTexelToLinear( texture2D( map, vUv * uClothK ) ).rgb;',
          'gCloth = mix( gCloth, mix( uFrayC, uThreadC, mk.g ), mk.r * 0.92 );',
          'if ( ! gl_FrontFacing ) gCloth = mix( gCloth, uFrayC, 0.40 ) * 0.50;',
          'diffuseColor.rgb *= gCloth;'].join('\n'))
        .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gCloth;');
    };
    return m;
  })();

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
    if (key === 'doll') { g.setAttribute('color', new THREE.Float32BufferAttribute(dollCol, 3)); g.setAttribute('dollLeg', new THREE.Float32BufferAttribute(dollLeg, 3)); }
    if (key === 'face') { g.setAttribute('faceMix', new THREE.Float32BufferAttribute(faceMix, 4)); g.setAttribute('uvSide', new THREE.Float32BufferAttribute(faceUvS, 2)); }
    g.setIndex(B.n > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key; m.castShadow = !/^(nail|lens)$/.test(key); m.receiveShadow = true; m.frustumCulled = false; m.userData.painted = m.material;
    if (key === 'trousers') m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, skinning: true, alphaMap: TR_MASK_G, alphaTest: 0.5, side: THREE.DoubleSide });      // its shadow has the same holes
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
  // the blank doll's clay for the old skin's trunk: the same clay, ending at the corset's edge as the painted one does
  const CLAY_CUT = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15 });
  CLAY_CUT.onBeforeCompile = (sh) => {
    sh.uniforms.uCorsetCut = CORSET_CUT;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRest; varying vec3 vRestN;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = position; vRestN = normal;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uCorsetCut; varying vec3 vRest; varying vec3 vRestN;')
      .replace('#include <map_fragment>', ['vec3 rn = normalize( vRestN );', 'float wf = pow( max( 0.0, rn.z ), 5.0 ) + 0.02 * step( 0.0, rn.z ), wb = pow( max( 0.0, -rn.z ), 5.0 ) + 0.02 * step( rn.z, 0.0 ), wr = pow( max( 0.0, -rn.x ), 5.0 ), wl = pow( max( 0.0, rn.x ), 5.0 );', CUT_GLSL].join('\n'));
  };
  // and for the trousers: clay seen from both sides, with the same holes cut in it
  const CLAY_T = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15, side: THREE.DoubleSide, alphaMap: TR_MASK_G, alphaTest: 0.5 });
  let blank = false;
  function setBlank(on) { blank = !!on; for (const k in meshes) { const m = meshes[k]; m.material = !blank ? m.userData.painted : k === 'trousers' ? CLAY_T : /^(projHair|projRuffle)$/.test(k) ? CLAY2 : /^(lens|nail)$/.test(k) ? m.userData.painted : /^(projTrunk|projHips)$/.test(k) ? CLAY_CUT : CLAY; if (k === 'lens' || k === 'nail') m.visible = !blank; } return blank; }
  // ---------- the doll and the old skin ----------
  // The old skin is his clothes as one smooth shape with the paintings laid on. It is being replaced, a region at a time, by real garments
  // over the doll (N45_doll.js). Both are cut into the same regions here, so that a region of the old skin can be switched off and the same
  // region of the doll shows in its place:
  //     region    old skin      doll under it
  //     trunk     projTrunk     dollTrunk      from the waist line (OLD_WAIST) up: shirt and corset; the doll's chest, back, shoulders, neck
  //     hips      projHips      dollHips       below the waist line: the seat and top of the trousers; the doll's hips and seat
  //     legs      projLegs      dollLegs       the trouser legs; the doll's whole legs and feet (its feet stay inside the boots)
  //     boots     projBoots     (none)
  //     arms      projArm       dollArms       the sleeves; the doll's arms from the shoulder to the wrist
  //     ruffles   projRuffle    (none)
  // A cut mesh keeps the very same lists of points (shared, not copied) and gets its own list of triangles, so nothing moves and no seam shows.
  // setDoll(true) shows the whole bare doll: every region of the old skin is hidden; head, hair, glasses and hands stay.
  // setOldSkin({ legs: false, hips: false }) switches single regions (for the stages that follow). A region of the doll is drawn only where
  // the old skin over it is off: under the old skin it could not be seen, and it does not fit inside it everywhere (shoulders, see N45_doll.js).
  // With nothing switched off (the default) the doll is not drawn at all and he looks as he did before it was built.
  const OLD_WAIST = 1.06;                           // where B3 has the top of his trousers. Stage two may want this line somewhere else: it is only used here.
  function cutMesh(key, names, which) {             // which(triangle number, height of its middle at rest) says which of the names it goes to
    const m = meshes[key], g = m.geometry, ix = g.index.array, P = g.attributes.position, lists = names.map(() => []);
    for (let t = 0; t < ix.length; t += 3) { const a = ix[t], b = ix[t + 1], c = ix[t + 2]; lists[which(t / 3, (P.getY(a) + P.getY(b) + P.getY(c)) / 3)].push(a, b, c); }
    root.remove(m); delete meshes[key];
    names.forEach((name, i) => {
      const g2 = new THREE.BufferGeometry(); for (const a in g.attributes) g2.setAttribute(a, g.attributes[a]);
      g2.setIndex(P.count > 65535 ? new THREE.Uint32BufferAttribute(lists[i], 1) : new THREE.Uint16BufferAttribute(lists[i], 1));
      const m2 = new THREE.SkinnedMesh(g2, m.material); m2.name = name; m2.castShadow = m.castShadow; m2.receiveShadow = m.receiveShadow; m2.frustumCulled = false; m2.userData.painted = m.userData.painted;
      root.add(m2); m2.bind(skeleton, new THREE.Matrix4()); meshes[name] = m2;
    });
  }
  cutMesh('projTrunk', ['projTrunk', 'projHips'], (t, y) => (y < OLD_WAIST ? 1 : 0));
  cutMesh('doll', ['dollTrunk', 'dollHips', 'dollLegs', 'dollArms'], (t, y) => (DOLL.reg[t] === 0 ? (y < OLD_WAIST ? 1 : 0) : DOLL.reg[t] + 1));
  const OLD = { trunk: 'projTrunk', hips: 'projHips', legs: 'projLegs', boots: 'projBoots', arms: 'projArm', ruffles: 'projRuffle' }, UNDER = { dollTrunk: 'trunk', dollHips: 'hips', dollLegs: 'legs', dollArms: 'arms' };
  const oldOn = { trunk: true, hips: true, legs: true, boots: true, arms: true, ruffles: true };
  let doll = false;
  // Stage 2: he now wears the new trousers (N46_trousers.js) over the doll's hips and legs, in place of the old skin's hips and legs.
  // The trousers are drawn whenever the old leg skin is off and he is not stripped to the doll. setOldTrousers(true) puts the old leg
  // skin back, for comparing ("Old trousers" on the page).
  // With the new trousers on, the old skin over his hips is still drawn, but only down to the corset's bottom edge (CORSET_CUT, above).
  function showSkins() {
    for (const k in OLD) meshes[OLD[k]].visible = !doll && oldOn[k]; for (const k in UNDER) meshes[k].visible = doll || !oldOn[UNDER[k]];
    const newT = !doll && !oldOn.legs; meshes.trousers.visible = newT; CORSET_CUT.value = newT && !oldOn.hips ? 1 : 0;
    if (newT && !oldOn.hips && oldOn.trunk) meshes.projHips.visible = true;
  }
  function setDoll(on) { doll = !!on; showSkins(); return doll; }
  function setOldSkin(o) { for (const k in (o || {})) if (k in OLD) oldOn[k] = !!o[k]; showSkins(); return Object.assign({}, oldOn); }
  function setOldTrousers(on) { setOldSkin({ legs: !!on, hips: !!on }); return oldOn.legs; }
  setOldSkin({ legs: false, hips: false });
  // Every list a mesh carries must be as long as its list of points. A real graphics chip refuses to draw a mesh with a short list, so the
  // whole mesh vanishes (his face did, November 13), while the software renderer the tools here use draws it anyway. So it is caught here.
  for (const k in meshes) { const g = meshes[k].geometry, n = g.attributes.position.count; for (const a in g.attributes) if (g.attributes[a].count !== n) throw new Error('mesh "' + k + '": ' + a + ' has ' + g.attributes[a].count + ' entries for ' + n + ' points'); }
  // and no triangle may name a point that is not there (the cut meshes above share their lists of points, so this is checked too)
  for (const k in meshes) { const g = meshes[k].geometry, n = g.attributes.position.count, ix = g.index.array; if (ix.length % 3) throw new Error('mesh "' + k + '": its list of triangles is not a multiple of three'); for (let i = 0; i < ix.length; i++) if (ix[i] >= n) throw new Error('mesh "' + k + '": a triangle names point ' + ix[i] + ' of ' + n); }
  const api = { root, fx, skeleton, bones, SK, animate, pose, play, moves: MOVES, meshes, dust: DUST, setBlank, get blank() { return blank; }, setDoll, get doll() { return doll; }, setOldSkin, get oldSkin() { return Object.assign({}, oldOn); }, setOldTrousers, get oldTrousers() { return oldOn.legs; }, walkOnSpot: true, walkSpeed: WALK_SPEED, name: 'Noiz', debug: { SK, meshes, trunkPt, legPt, bootPt, headPoint, hairPt, armAt, doll: DOLL, trousers: TROUSERS, holes: TR_HOLES }, get triangles() { return triCount; } };
  pose(lastPose);
  return api;
}
