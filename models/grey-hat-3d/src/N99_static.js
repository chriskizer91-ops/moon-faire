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
  const mkProj = (kR, kL, cut, cuff) => {
    {
      const tF = tFront, tB = tBack, tR = projTex(kR, '#3a2c36'), tL = projTex(kL, '#3a2c36');
      const m = sheen(std({ map: tF, color: lin('#b9b2b6'), roughness: 0.80, envMapIntensity: 0.18, emissive: lin('#ffffff'), emissiveIntensity: 0.36 }), '#c9b6c4', 3, 0.05), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        if (first) first(sh);
        Object.assign(sh.uniforms, { uPB: { value: tB }, uPR: { value: tR }, uPL: { value: tL }, uWF: { value: v4(WIN.front) }, uWB: { value: v4(WIN.back) }, uWR: { value: v4(WIN[kR] || WIN.sideR) }, uWL: { value: v4(WIN[kL] || WIN.sideL) }, uPPow: { value: 5.0 }, uCorsetCut: cut ? CORSET_CUT : { value: 0 }, uShirtCut: cut ? SHIRT_CUT : { value: 0 }, uLeatherC: { value: lin('#2c2624') }, uCuffCut: cuff ? CUFF_CUT : { value: 0 } });
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRest; varying vec3 vRestN;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = position; vRestN = normal;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uPB; uniform sampler2D uPR; uniform sampler2D uPL; uniform vec4 uWF; uniform vec4 uWB; uniform vec4 uWR; uniform vec4 uWL; uniform float uPPow; uniform float uCorsetCut; uniform float uShirtCut; uniform float uCuffCut; uniform vec3 uLeatherC; varying vec3 vRest; varying vec3 vRestN; vec3 gProj;')
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
            '// with the new shirt on, what is left of this skin is the corset. The paintings have the ruffle and the cord ends hanging over its top: those are real shapes now, so where the corset shows cream or red up there it is given plain leather',
            '// the wrist cuff (the piece of the old arm skin that is kept): where the paintings have skin above the leather it is given plain leather, so the cuff has a clean top edge',
            'if ( uCuffCut > 0.5 ) gProj = mix( gProj, uLeatherC, smoothstep( 0.07, 0.12, gProj.r ) * step( gProj.b * 1.7, gProj.r ) );',
            'if ( uShirtCut > 0.5 && vRest.y > 1.232 && vRest.z > 0.0 ) gProj = mix( gProj, uLeatherC, smoothstep( 0.060, 0.120, gProj.r ) );',
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
  // The corset's top edge (stage 3). With the new shirt on (N47_shirt.js) the old skin's trunk is drawn only up to the corset's top edge
  // (uShirtCut 1) and thrown away above it: what is left of the old skin is the corset and nothing else. The edge is measured off the
  // same paintings (tools/shirt_measure.py): 1.29 m across the front with a small notch at the middle, 1.287 across the back, 1.28 at the sides.
  const hatPressLater = (m) => hatPress(m);      // hatPress is written out further down, with the hair's own materials
  const CORSET_CUT = { value: 1 }, SHIRT_CUT = { value: 1 }, CUFF_CUT = { value: 1 }, UNDER_CUFF = { value: 1 };
  const CUT_GLSL = [
    'float topF = 1.289 - 0.040 * ( 1.0 - smoothstep( 0.0, 0.034, abs( vRest.x ) ) ), topB = 1.287, topS = 1.281;',
    'if ( uShirtCut > 0.5 && vRest.y > ( topF * wf + topB * wb + topS * ( wr + wl ) ) / ( wf + wb + wr + wl ) ) discard;',
    'float cutF = 0.997 + 0.051 * pow( min( abs( vRest.x ) / 0.17, 1.0 ), 0.70 ), cutB = 1.027 + 0.020 * min( abs( vRest.x ) / 0.17, 1.0 ), cutS = 1.082 - 1.71 * ( vRest.z + 0.03 ) * ( vRest.z + 0.03 );',
    'if ( uCorsetCut > 0.5 && vRest.y < ( cutF * wf + cutB * wb + cutS * ( wr + wl ) ) / ( wf + wb + wr + wl ) ) discard;'].join('\n');
  // the trunk, legs and boots take their sides from B2 (arms held out of the way); the arms take theirs from A3 (arms hanging)
  MATS.proj = mkProj('sideR', 'sideL'); MATS.projArm = mkProj('armR', 'armL'); MATS.projHair = mkProj('sideR', 'sideL'); MATS.projHair.side = THREE.DoubleSide; MATS.projHair = hatPressLater(MATS.projHair); MATS.projRuffle = mkProj('armR', 'armL'); MATS.projRuffle.side = THREE.DoubleSide; MATS.projCuff = mkProj('armR', 'armL', false, true);
  MATS.projLegs = MATS.projBoots = MATS.proj; MATS.projTrunk = mkProj('sideR', 'sideL', true);      // one material, three meshes: each region of the old skin can be hidden by itself
  const tHairN = hairTexN(HAIR.COLS, false), tHairBumpN = hairTexN(HAIR.COLS, true), tHairAlphaN = hairAlphaN();
  function hairMat(k, cut, rep) {
    const mk = (t) => { if (!rep) return t; const c = t.clone(); c.repeat.set(1, rep); c.needsUpdate = true; return c; };
    const m = std({ map: tHairN, bumpMap: tHairBumpN, bumpScale: 0.0006, color: lin('#cba585').multiplyScalar(k), roughness: 0.58, envMapIntensity: 0.12, side: THREE.DoubleSide, emissive: lin('#ffdcc0').multiplyScalar(k), emissiveMap: tHairN, emissiveIntensity: 0.26 });      // the warm tint undoes the cool cast of the stage lights: measured against C4's hair at one scale (tools/hair_cmp.py)
    if (cut) { m.alphaMap = tHairAlphaN; m.alphaTest = 0.5; }
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float hshade; varying float vHs;').replace('#include <begin_vertex>', '#include <begin_vertex>\n vHs = hshade;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vHs;').replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb *= vHs;').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= vHs;');
    };
    return m;
  }
  // His hair under his hat. With the hat on, every point of his hair is kept inside the room the hat leaves it: inside the crown above the
  // opening, and under a cone that lies below the brim outside it. A point outside that room is pulled straight in toward the hat's middle
  // line, the way a hat presses hair to the head. It is done on the graphics card after the hair's own bones and chains have moved it, so
  // the hair still hangs and swings as before and nothing about its design changes; with the hat off it is untouched.
  const HAT_U = { m: { value: new THREE.Matrix4() }, mi: { value: new THREE.Matrix4() }, on: { value: 1 } };
  function hatPress(m) {
    const first = m.onBeforeCompile;
    m.onBeforeCompile = (sh) => {
      if (first) first(sh);
      sh.uniforms.uHatM = HAT_U.m; sh.uniforms.uHatMi = HAT_U.mi; sh.uniforms.uHatOn = HAT_U.on;
      const f = (v) => v.toFixed(5), K = HAT.KC;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', ['#include <common>', 'uniform mat4 uHatM; uniform mat4 uHatMi; uniform float uHatOn;',
        'vec3 hatPress( vec3 p ) {',
        '  vec3 q = ( uHatMi * vec4( p, 1.0 ) ).xyz - vec3( ' + f(HAT.O.x) + ', ' + f(HAT.O.y) + ', ' + f(HAT.O.z) + ' );',
        '  float sT = ' + f(Math.sin(HAT.TILT)) + ', cT = ' + f(Math.cos(HAT.TILT)) + ';',
        '  float hu = q.x, hw = q.y * sT + q.z * cT, hn = q.y * cT - q.z * sT;',
        '  float r = length( vec2( hu, hw ) ); if ( r < 0.0001 ) return p;',
        '  float redge = r / length( vec2( hu / ' + f(HAT.A) + ', hw / ' + f(HAT.B) + ' ) );',
        '  float kc = hn < ' + f(K[1][0]) + ' ? mix( 1.0, ' + f(K[1][1]) + ', clamp( hn / ' + f(K[1][0]) + ', 0.0, 1.0 ) ) : hn < ' + f(K[2][0]) + ' ? mix( ' + f(K[1][1]) + ', ' + f(K[2][1]) + ', ( hn - ' + f(K[1][0]) + ' ) / ' + f(K[2][0] - K[1][0]) + ' ) : mix( ' + f(K[2][1]) + ', ' + f(K[3][1]) + ', clamp( ( hn - ' + f(K[2][0]) + ' ) / ' + f(K[3][0] - K[2][0]) + ', 0.0, 1.0 ) );',
        '  float rmax = redge * kc - ' + f(HAT.INSET) + ' - 0.25 * max( 0.0, hn - 0.05 ) + max( 0.0, - hn - ' + f(HAT.GAP) + ' ) / ' + f(HAT.CONE) + ';',
        '  if ( r <= rmax ) return p;',
        '  float k = max( rmax, 0.0 ) / r; hu *= k; hw *= k;',
        '  q = vec3( hu, hw * sT + hn * cT, hw * cT - hn * sT ) + vec3( ' + f(HAT.O.x) + ', ' + f(HAT.O.y) + ', ' + f(HAT.O.z) + ' );',
        '  return ( uHatM * vec4( q, 1.0 ) ).xyz;',
        '}'].join('\n')).replace('#include <skinning_vertex>', '#include <skinning_vertex>\n if ( uHatOn > 0.5 ) transformed = hatPress( transformed );');
    };
    m.customProgramCacheKey = () => 'hatPress|' + (first ? first.toString() : '');
    return m;
  }
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
    // his hair (N45b_hair.js): pictures of strands and nothing else. Each point carries its own shade ('hshade': darker at the edges and the
    // underside of a lock, at its root, and in the layers underneath). Tips are a hard cut-out; nothing is blended.
    hair: hatPress(hairMat(1.0, true)), hairIn: hatPress(hairMat(0.86, true)), hairCap: hatPress(hairMat(0.80, true)), hairMass: hatPress(hairMat(0.48, true)),
    steel: std({ color: lin('#b9bcc2'), roughness: 0.30, metalness: 0.9, envMapIntensity: 1.2 }),      // the rims of the plugs in his ears
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
        Object.assign(sh.uniforms, { uNetC: { value: lin('#19161a') }, uKnitC: { value: lin('#1b181c') }, uNetN: { value: NET_N }, uNetH: { value: NET_H }, uNetT: { value: NET_T }, uHairC: { value: lin('#2a1a14') }, uUnderCuff: UNDER_CUFF });
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 dollLeg; attribute vec3 dollArm; varying vec3 vLeg; varying vec3 vArm; varying vec3 vRest;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLeg = dollLeg; vArm = dollArm; vRest = position;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', ['#include <common>',
          'uniform vec3 uNetC; uniform vec3 uKnitC; uniform float uNetN; uniform float uNetH; uniform float uNetT; uniform float uUnderCuff; uniform vec3 uHairC; varying vec3 vLeg; varying vec3 vArm; varying vec3 vRest; vec3 gDollC;',
          'float dGauss( float v, float w ) { return exp( - v * v / ( w * w ) ); }',
          '// body hair: short dark strokes, one to a cell of a grid laid over the skin twice. p is the place in cells (a cell is cell.x by cell.y metres), fw the size of a pixel in metres.',
          '// Returns the share of the pixel that is hair. Far away, where a pixel is wider than a cell, it turns into the even share all the hairs together cover, so it never shimmers.',
          'float dollHair( vec2 p, vec2 cell, float fw ) {',
          '  float s = 0.0, th = 0.00013;',
          '  for ( int k = 0; k < 2; k ++ ) {',
          '    vec2 q = p + float( k ) * vec2( 0.37, 0.61 ); q.y += fract( sin( floor( q.x ) * 12.9898 + float( k ) ) * 43758.5453 ); vec2 c = floor( q ), f = fract( q );',
          '    float h1 = fract( sin( dot( c, vec2( 127.1, 311.7 ) ) + float( k ) * 7.3 ) * 43758.5453 ), h2 = fract( h1 * 57.31 ), h3 = fract( h1 * 113.7 );',
          '    vec2 a = vec2( 0.3 + 0.4 * h1, 0.12 + 0.25 * h2 ), d = vec2( ( h3 - 0.5 ) * 0.56, 0.30 + 0.32 * h2 ), pa = f - a;',
          '    float t = clamp( dot( pa * cell, d * cell ) / dot( d * cell, d * cell ), 0.0, 1.0 ), dist = length( ( pa - d * t ) * cell );',
          '    s += clamp( ( min( dist + 0.5 * fw, th ) - max( dist - 0.5 * fw, - th ) ) / fw, 0.0, 1.0 );',
          '  }',
          '  float even = 2.0 * 2.0 * th * 0.46 * cell.y / ( cell.x * cell.y );',
          '  return mix( min( s, 1.0 ), even, smoothstep( 0.35, 1.1, fw / cell.x ) );',
          '}',
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
            '// Under his leather wrist cuff (still a piece of the old skin, which is the same size as the doll there) the doll is not drawn when he is dressed:',
            '// when his wrist bent, the doll came through the cuff in patches. The cuff starts 0.472 m down the arm; the doll goes 2 cm into it and stops.',
            'if ( uUnderCuff > 0.5 && vLeg.z < 0.5 && vArm.z > 0.492 ) discard;',
            '// ---- the paint on his trunk and arms (stage 3) ----',
            '// Soft light and dark where B1, B3 and A3 paint them, so that the skin in the open front of his shirt and on his forearms reads as a body,',
            '// and nothing under the shirt is plain plastic if the cloth lifts. m is brightness, red a little more red (elbows, nipples).',
            '{',
            '  float ax = abs( vRest.x ), y = vRest.y, m = 1.0, red = 0.0, hair = 0.0, fw = max( length( dFdx( vRest ) ), length( dFdy( vRest ) ) ) + 0.00001;',
            '  float trunk = vLeg.z * smoothstep( 1.00, 1.04, y ), front = trunk * smoothstep( 0.0, 0.04, vRest.z ), back = trunk * ( 1.0 - smoothstep( -0.03, 0.01, vRest.z ) );',
            '  // collarbones: a light ridge from the notch at the foot of his neck out to each shoulder, shade under it and a hollow over it; the notch itself',
            '  float cy = 1.449 + 0.10 * max( ax - 0.02, 0.0 ), cb = smoothstep( 0.012, 0.030, ax ) * ( 1.0 - smoothstep( 0.125, 0.170, ax ) );',
            '  m += front * cb * ( 0.15 * dGauss( y - cy, 0.006 ) - 0.13 * dGauss( y - cy + 0.014, 0.009 ) - 0.08 * dGauss( y - cy - 0.013, 0.008 ) );',
            '  m -= front * 0.17 * dGauss( length( vec2( vRest.x, y - 1.447 ) ), 0.012 );',
            '  // breastbone, the under edge of each chest muscle and the light on it, nipples',
            '  m -= front * 0.10 * dGauss( vRest.x, 0.010 ) * smoothstep( 1.30, 1.34, y ) * ( 1.0 - smoothstep( 1.415, 1.440, y ) );',
            '  float py = 1.336 + 0.9 * pow( max( ax - 0.03, 0.0 ), 2.0 );',
            '  m -= front * 0.13 * dGauss( y - py, 0.013 ) * smoothstep( 0.02, 0.05, ax ) * ( 1.0 - smoothstep( 0.13, 0.17, ax ) );',
            '  m += front * 0.075 * dGauss( y - py - 0.045, 0.030 ) * dGauss( ax - 0.085, 0.050 );',
            '  float nip = front * ( 1.0 - smoothstep( 0.0055, 0.0095, length( vec2( ax - 0.094, y - 1.351 ) ) ) ); m -= 0.17 * nip; red += 1.6 * nip;',
            '  // belly: the middle line, three faint bands across, the outer edge of the straight muscle, the navel',
            '  float belly = front * smoothstep( 1.05, 1.09, y ) * ( 1.0 - smoothstep( 1.27, 1.31, y ) );',
            '  m -= belly * ( 0.085 * dGauss( vRest.x, 0.008 ) + 0.055 * dGauss( ax - 0.068, 0.011 ) );',
            '  m -= belly * 0.055 * ( 1.0 - smoothstep( 0.050, 0.075, ax ) ) * ( dGauss( y - 1.245, 0.007 ) + dGauss( y - 1.185, 0.007 ) + dGauss( y - 1.125, 0.007 ) );',
            '  m -= front * 0.24 * ( 1.0 - smoothstep( 0.0035, 0.0085, length( vec2( vRest.x, ( y - 1.082 ) * 0.7 ) ) ) );',
            '  // back: the groove of the spine, the shoulder blades',
            '  m -= back * 0.12 * dGauss( vRest.x, 0.012 ) * smoothstep( 1.00, 1.05, y ) * ( 1.0 - smoothstep( 1.43, 1.47, y ) );',
            '  m += back * 0.07 * dGauss( ax - 0.085, 0.040 ) * dGauss( y - 1.395, 0.050 );',
            '  m -= back * 0.09 * dGauss( y - 1.335 - 0.3 * ( ax - 0.085 ), 0.012 ) * dGauss( ax - 0.085, 0.045 );',
            '  // the armpit, and the shade under his chin on the foot of his neck',
            '  m -= 0.14 * dGauss( length( vec2( ax - 0.168, y - 1.362 ) ), 0.034 );',
            '  // The neck join. His painted neck (N40_head.js) stands in the doll\'s shoulders (its rim is 1.48 m high at the front, 1.505 at the sides and back, 6 cm from the line x 0, z -0.027).',
            '  // Measured in a picture from the front: the neck is (164,105,79); the doll just under it, which faces up and so is lit brighter than the chest, would be (192,125,98).',
            '  // So the doll is darkened to the neck\'s tone where the two meet (in linear light that is 0.71, 0.68, 0.62) and fades to its own over about 5 cm: the shade under his chin. (smoothstep edges must go low, high: the other way round is undefined and differs between graphics chips.)',
            '  float chin = trunk * ( 1.0 - smoothstep( 0.062, 0.120, length( vec2( vRest.x, vRest.z + 0.027 ) ) ) ) * smoothstep( 1.425, 1.470, y );',
            '  // hair on his chest (B1 and B3 show it in the open front) and thinly down the middle of his belly',
            '  float hd = front * ( dGauss( vRest.x, 0.060 ) * smoothstep( 1.335, 1.385, y ) * ( 1.0 - smoothstep( 1.425, 1.452, y ) ) + 0.55 * dGauss( vRest.x, 0.013 ) * smoothstep( 1.07, 1.10, y ) * ( 1.0 - smoothstep( 1.33, 1.37, y ) ) );',
            '  hair = max( hair, hd * dollHair( vec2( vRest.x / 0.0024 + ( y - 1.30 ) * sign( vRest.x ) * 110.0, y / 0.0052 ), vec2( 0.0024, 0.0052 ), fw ) );',
            '  // ---- arms: vArm is ( out from the arm, forward of it, how far down it from the shoulder joint ); the elbow is 0.285 down, the wrist 0.53 ----',
            '  float arm = 1.0 - vLeg.z, sl = vArm.z, ar = max( length( vArm.xy ), 0.0005 ), ang = atan( vArm.y, vArm.x );',
            '  float outw = vArm.x / ar, fr = max( vArm.y / ar, 0.0 ), bk = max( - vArm.y / ar, 0.0 ), inn = max( - outw, 0.0 );',
            '  float am = 1.0;',
            '  am -= 0.10 * inn * inn;',
            '  am += 0.05 * max( outw, 0.0 ) * dGauss( sl - 0.07, 0.05 ) - 0.08 * max( outw, 0.0 ) * dGauss( sl - 0.140, 0.014 );',
            '  am += 0.07 * fr * dGauss( sl - 0.195, 0.050 ) - 0.06 * bk * dGauss( sl - 0.20, 0.06 );',
            '  am -= 0.13 * fr * dGauss( sl - 0.290, 0.011 ) + 0.09 * bk * dGauss( sl - 0.285, 0.018 );',
            '  am += 0.08 * dGauss( ang - 0.7, 0.55 ) * dGauss( sl - 0.345, 0.045 ) - 0.06 * dGauss( ang - 1.9, 0.35 ) * dGauss( sl - 0.36, 0.05 );',
            '  am += 0.030 * max( outw, 0.0 ) * smoothstep( 0.40, 0.50, sl ) - 0.050 * smoothstep( 0.49, 0.53, sl ) * inn;',
            '  am -= 0.05 * inn * smoothstep( 0.44, 0.50, sl ) * ( dGauss( ang - 2.75, 0.07 ) + dGauss( ang + 2.95, 0.07 ) );',
            '  m += arm * ( am - 1.0 ); red += arm * ( 0.9 * bk * dGauss( sl - 0.285, 0.028 ) + 0.4 * smoothstep( 0.47, 0.53, sl ) );',
            '  // hair on the outside and back of the forearm (A3 and B3 show it), thinner on the upper arm',
            '  float ad = arm * smoothstep( -0.45, 0.45, outw - 0.35 * vArm.y / ar ) * ( 0.22 * smoothstep( 0.10, 0.20, sl ) + 0.78 * smoothstep( 0.275, 0.335, sl ) ) * ( 1.0 - smoothstep( 0.505, 0.535, sl ) );',
            '  hair = max( hair, ad * dollHair( vec2( ang * ar / 0.0021, sl / 0.0085 ), vec2( 0.0021, 0.0085 ), fw ) );',
            '  gDollC *= mix( vec3( 1.0 ), vec3( 0.71, 0.68, 0.62 ), chin );\n  gDollC *= m; gDollC.r *= 1.0 + 0.020 * red; gDollC.g *= 1.0 - 0.035 * red; gDollC.b *= 1.0 - 0.030 * red;',
            '  gDollC = mix( gDollC, uHairC, 0.70 * hair );',
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
      // the light sway (TR_SWAY, N47_shirt.js): after the bones have moved a point, it is moved on by its spring's lag times its room
      sh.uniforms.uSway = { value: TR_SWAY.uni };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 sway; uniform vec3 uSway[ 4 ];')
        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\ntransformed += sway.x * 0.02 * ( position.x < 0.0 ? mix( uSway[ 0 ], uSway[ 1 ], sway.y ) : mix( uSway[ 2 ], uSway[ 3 ], sway.y ) );');
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

  // His hat, belt and jewellery (N48_gear.js). Felt and leathers and parchment wear small repeating squares cut from F13 (bake_gear.py);
  // like the trousers they are lit partly as painted, so they sit beside his painted corset and boots. Metals and pearls are plain.
  { const sq = (key, fill) => { const t = bakedTex(key, 256, 256, fill); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
    const tf = sq('felt', '#665c5c'), tb = sq('beltL', '#322d2d'), tp = sq('pouchL', '#4d2f26'), tq = sq('parch', '#dab690');
    const worn = (t, k, rough, em, o) => std(Object.assign({ map: t, color: lin('#b9b2b6').multiplyScalar(k), roughness: rough, envMapIntensity: 0.15, emissive: lin('#ffffff').multiplyScalar(k), emissiveMap: t, emissiveIntensity: em }, o || {}));
    // the brightness each point carries (darker down in a fold or under the brim) dims the picture's own glow too, not only the lamps' light
    const shadeGlow = (m) => { const first = m.onBeforeCompile; m.onBeforeCompile = (sh) => { if (first) first(sh); sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= vColor.rgb;'); }; m.customProgramCacheKey = () => 'shadeGlow|' + (first ? first.toString() : ''); return m; };
    Object.assign(MATS, {
      hatFelt: shadeGlow(sheen(worn(tf, 1.0, 0.96, 0.34, { bumpMap: tf, bumpScale: 0.0012, side: THREE.DoubleSide, envMapIntensity: 0.05, color: lin('#b6b8c0'), vertexColors: true }), '#c4c4cc', 2.6, 0.07)),      // wool felt: no shine, a soft pale edge where it turns away
      hatBand: worn(tb, 1.15, 0.70, 0.30, { bumpMap: tb, bumpScale: 0.0006, color: lin('#c4b4ae') }),                              // the band: dark worn leather, a little warmer than his belt
      gBelt: worn(tb, 1.0, 0.62, 0.30, { bumpMap: tb, bumpScale: 0.0008 }),
      gPouch: worn(tp, 1.0, 0.66, 0.32, { bumpMap: tp, bumpScale: 0.0010 }),
      gParch: worn(tq, 1.0, 0.88, 0.36, { bumpMap: tq, bumpScale: 0.0004, side: THREE.DoubleSide }),
      gBrass: std({ color: lin('#b08a4a'), roughness: 0.42, metalness: 0.85, envMapIntensity: 1.1, emissive: lin('#5a4320'), emissiveIntensity: 0.25 }),      // worn brass: rings, buckle, skull, dagger guard
      gSteel: std({ color: lin('#b9bcc2'), roughness: 0.32, metalness: 0.9, envMapIntensity: 1.2 }),                                // the earring's chain and the dagger's fittings
      gPearl: phys({ color: lin('#efe3d6'), roughness: 0.28, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.25, envMapIntensity: 0.55, emissive: lin('#e8d6c8'), emissiveIntensity: 0.22 }),
      gFeather: std({ color: lin('#20262b'), roughness: 0.62, envMapIntensity: 0.25, side: THREE.DoubleSide, emissive: lin('#1c2428'), emissiveIntensity: 0.3 }),      // a black feather with a blue-green cast
      gDark: std({ color: lin('#1c1a1c'), roughness: 0.6, envMapIntensity: 0.2 }),                                                 // cords, the dagger's grip and sheath
      gLeaf: std({ color: lin('#c79a3c'), roughness: 0.4, metalness: 0.8, envMapIntensity: 1.1, side: THREE.DoubleSide, emissive: lin('#6a4a16'), emissiveIntensity: 0.35 }),      // the gold leaf charm
    });
  }

  // His shirt (N47_shirt.js). The cloth is the cream linen square of F13, repeated; each point also carries a brightness (darker down in a
  // fold, lighter on its crest) and, on the pieces edged with lace, where it sits in the lace band of F13: there the lace picture is drawn
  // instead of the linen and its holes are cut out (a hard cut: nothing is see-through, so nothing has to be sorted). Both faces are drawn;
  // the inside is a little darker. These pieces are moved by the cloth code point by point, not by bones, so the material does no skinning.
  MATS.shirt = (() => {
    const t = bakedTex('linen', 256, 256, '#cdae96'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    const tl = bakedTex('lace', 128, 256, '#cdae96'), tm = bakedTex('laceMask', 128, 256, '#ffffff'); tl.wrapS = tm.wrapS = THREE.RepeatWrapping; tl.anisotropy = tm.anisotropy = 4;
    const m = sheen(std({ skinning: false, map: t, vertexColors: true, color: lin('#b9b2b6'), roughness: 0.90, envMapIntensity: 0.12, emissive: lin('#ffffff'), emissiveIntensity: 0.36, side: THREE.DoubleSide }), '#e6d2c4', 3, 0.05), first = m.onBeforeCompile;
    m.onBeforeCompile = (sh) => {
      if (first) first(sh);
      sh.uniforms.uLace = { value: tl }; sh.uniforms.uLaceM = { value: tm };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 lace; varying vec2 vLace;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLace = lace;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uLace; uniform sampler2D uLaceM; varying vec2 vLace; vec3 gCloth;')
        .replace('#include <map_fragment>', [
          'gCloth = mapTexelToLinear( texture2D( map, vUv ) ).rgb;',
          'if ( vLace.y > 0.0 ) { vec2 lu = vec2( vLace.x, 1.0 - min( vLace.y, 0.995 ) ); if ( texture2D( uLaceM, lu ).g < 0.5 ) discard; gCloth = mapTexelToLinear( texture2D( uLace, lu ) ).rgb; }',
          'if ( ! gl_FrontFacing ) gCloth *= 0.74;'].join('\n'))
        .replace('#include <color_fragment>', '#include <color_fragment>\ngCloth *= vColor.rgb; diffuseColor.rgb = diffuse * gCloth;')
        .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gCloth;');
    };
    return m;
  })();
  // the lacing: dark red cord (uv.x under a half) and small dark metal eyelets (uv.x over a half)
  MATS.lacing = (() => {
    const c = cvs(2, 1), g = c.getContext('2d'); g.fillStyle = '#5e1822'; g.fillRect(0, 0, 1, 1); g.fillStyle = '#3a3334'; g.fillRect(1, 0, 1, 1);
    const t = ctex(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    return std({ map: t, color: lin('#b9b2b6'), roughness: 0.7, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.34 });
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
    if (key === 'doll') { g.setAttribute('color', new THREE.Float32BufferAttribute(dollCol, 3)); g.setAttribute('dollLeg', new THREE.Float32BufferAttribute(dollLeg, 3)); g.setAttribute('dollArm', new THREE.Float32BufferAttribute(dollArm, 3)); }
    if (HAIR.SHADE[key]) { if (HAIR.SHADE[key].length !== B.n) throw new Error('hair shade list for ' + key + ' has ' + HAIR.SHADE[key].length + ' entries for ' + B.n + ' points'); g.setAttribute('hshade', new THREE.Float32BufferAttribute(HAIR.SHADE[key], 1)); }
    if (GEAR.SHADE[key]) { if (GEAR.SHADE[key].length !== B.n) throw new Error('shade list for ' + key + ' has ' + GEAR.SHADE[key].length + ' entries for ' + B.n + ' points'); const c = new Float32Array(B.n * 3); for (let i = 0; i < B.n; i++) c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = GEAR.SHADE[key][i]; g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); }
    if (key === 'face') { g.setAttribute('faceMix', new THREE.Float32BufferAttribute(faceMix, 4)); g.setAttribute('uvSide', new THREE.Float32BufferAttribute(faceUvS, 2)); }
    g.setIndex(B.n > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key; m.castShadow = !/^(nail|lens)$/.test(key); m.receiveShadow = true; m.frustumCulled = false; m.userData.painted = m.material;
    if (key === 'trousers') m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, skinning: true, alphaMap: TR_MASK_G, alphaTest: 0.5, side: THREE.DoubleSide });      // its shadow has the same holes
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }
  // the trousers' room to sway, point by point (TR_SWAY, N47_shirt.js)
  { const g = meshes.trousers.geometry, P = g.attributes.position, a = new Float32Array(P.count * 2); let yb = 9;
    for (let i = 0; i < P.count; i++) yb = Math.min(yb, P.getY(i));
    for (let i = 0; i < P.count; i++) { const r = TR_SWAY.room(P.getX(i), P.getY(i), P.getZ(i), yb); a[i * 2] = r[0]; a[i * 2 + 1] = r[1]; }
    g.setAttribute('sway', new THREE.BufferAttribute(a, 2)); }
  // the pieces of his shirt: plain meshes (the cloth code moves their points), kept in their own list
  const shirtMeshes = {};
  for (const c of CLOTH.sheets) {
    const m = new THREE.Mesh(c.geo, MATS.shirt); m.name = 'shirt_' + c.name; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; m.userData.painted = m.material;
    root.add(m); shirtMeshes[c.name] = m; triCount += c.tris;
  }

  // ---------- holding still, standing, walking and talking (stage 5 of the rebuild) ----------
  // Chris: "the boots, the ankles need to make a realistic motion as he walks. And I think the posturing of the whole body could be
  // improved as well. There is a how to do this. And you could also look at one of the other models for the witches."
  //   pose(o)        the measuring pose: his paintings' A-pose (arm: degrees out from straight down; leg: degrees apart). Nothing moves.
  //                  Every view that lays him over a painting needs this one, so it is kept exactly as it was.
  //   play('stand')  his resting stance, held still: weight on his right leg, left foot a little forward and turned out, arms hanging
  //                  by his sides with the palms turned in, chest open, head up.
  //   play('idle')   the same stance, alive: breath, a slow shift of his weight over planted feet, his head looking about.
  //   play('walk')   his walk, on the spot (the ground passes under him at WALK_SPEED, so the gold dust streams away behind).
  //   play('talk')   the stance with gestures of its own from his hands and head.
  //   play(name, true) goes there at once and lays the cloth afresh, for still pictures; without it he eases from one to the next.
  // WHERE THE METHOD COMES FROM (the four finished witches):
  //   - Feet are placed on the ground and the legs are worked out from them (the Jester's walk, 75_pose.js: "each foot is down for 62%
  //     of the stride ... the heel lands first and the toe leaves last, the swinging foot stays low"), not swung by angles.
  //   - "Never hold a foot level by force; clamp the ankle and let the heel lift" (Io's README, stage six; the Ranger's 6c was the same
  //     fault). Here the foot is never held level: it stands on its heel's back edge, then flat, then on its ball, then on its toe tip,
  //     and where the ankle is follows from that. If the leg is too short to reach, the heel lifts further (heelFor).
  //   - "A foot follows the ground when standing and its own shin when the legs are folded" (the Jester's crossed legs). On the ground
  //     his foot is turned to the ground whatever the shin does; in the air it is given its own pitch and the ankle takes what is left.
  //   - Looser, not "Terminator" (the Ranger's 6c): spine, shoulders, neck and head each follow a beat behind the part below; forearm
  //     and hand trail the upper arm.
  //   - A hand is never turned at the wrist alone: the turn goes to the forearm (Io's wristFix and ftw bone).
  // One thing differs from Io and the Ranger on purpose: their stiff boots never fold at the toe. Chris asked for his to bend at the
  // ball as the toe pushes off, so the toe bone turns, by at most TOE_MAX (a thick lug sole gives less than a shoe).
  const A_REST = N_APOSE, MOVES = ['pose', 'stand', 'idle', 'walk', 'talk'];
  let lastPose = { arm: A_REST, leg: 0 }, mv = { name: 'pose', t: 0 }, wk = 0, tk = 0, live = 0, gph = 0, clock = 0;
  // (stage 7) rn: how far he has gone over from walking to running; sk: how far he is sat down (0 standing, 1 seated); sitWant: asked to sit.
  // NAV: where game code has sent him. go: the point and what to call when he is there; run: running to it; k: his stride made this much longer
  // or shorter over the last strides; brake: he is stopping; face: a heading he has been asked to turn to while standing.
  let rn = 0, sk = 0, sitWant = false;
  const NAV = { go: null, run: false, k: 1, kNow: 1, kSet: false, q1: 0, brake: false, face: null };
  // The seat: its top is SEAT.height up and its middle SEAT.back behind where he stands. hip: how high his hip joints sit over the floor on it;
  // tilt: his hips tipped back; knee: his knees fallen a little apart. SEATF: where each ankle rests when seated [x, z, toes out], his left foot the further forward.
  const SEAT = { height: 0.46, back: 0.34, hip: 0.555, x: -0.006, tilt: -0.09, knee: 0.10, time: 1.15 }, SEATF = { R: [-0.150, 0.150, 0.16], L: [0.175, 0.215, 0.30] };
  const add = (b, x, y, z) => { const r = SK[b].rotation; r.x += x; r.y += y; r.z += z; };
  // where the hat is now, for keeping his hair under it (hatPress, above): from the hat's resting place to where its bone has carried it, in his own space
  const _hr = new THREE.Matrix4(), _ht = new THREE.Matrix4();
  function hatRoom() { const b = SK.hat, r = b.userData.rest; _hr.copy(root.matrixWorld).invert().multiply(b.matrixWorld).multiply(_ht.makeTranslation(-r.x, -r.y, -r.z)); HAT_U.m.value.copy(_hr); HAT_U.mi.value.copy(_hr).invert(); }
  function restAll() { for (const k in SK) SK[k].rotation.set(0, 0, 0); SK.hips.position.copy(SK.hips.userData.home); }
  function pose(o) {
    o = o || {}; mv = { name: 'pose', t: 0 }; wk = 0; tk = 0; live = 0; rn = 0; sk = 0; sitWant = false; if (NAV.go) arrive(false); NAV.face = null; ACT.name = ACT.old = ACT.loop = ''; ACT.fade = 0; lastPose = { arm: o.arm == null ? A_REST : o.arm, leg: o.leg || 0 };
    const arm = lastPose.arm * DEG - A_POSE, leg = lastPose.leg * DEG;
    restAll(); for (const [S, s] of SIDES) { SK['uarm' + S].rotation.z = s * arm; SK['thigh' + S].rotation.z = s * leg; SK['foot' + S].rotation.z = -s * leg; }
    root.updateMatrixWorld(true);
    GEAR.step(0, true); hatRoom(); HAIRSIM.step(0, true); CLOTH.step(0, true); TR_SWAY.step(0, true);     // the cloth is laid on him in the new pose and left to settle, so a still picture is right at once
  }
  const AX = V3(1, 0, 0), AY = V3(0, 1, 0), AZ = V3(0, 0, 1), Qt = () => new THREE.Quaternion();
  const _q1 = Qt(), _q2 = Qt(), _q3 = Qt(), _q4 = Qt(), _v1 = V3(), _v2 = V3(), _v3 = V3();
  // ----- his feet -----
  // A boot touches the ground along three lines across it: the back edge of the heel, the ball (under the toe joint) and the tip of
  // the toe. Each is kept here as a point in the foot's own frame, measured from the ankle joint, as he rests.
  const FOOT = {}, TOE_MAX = 0.48, HEEL_Z = -0.1126, TIP_Z = 0.169;      // the sole's back and front ends at rest (N_BOOT, the row at height 0)
  for (const [S] of SIDES) { const J = SK['foot' + S].userData.rest, Tj = SK['toe' + S].userData.rest; FOOT[S] = { J, heel: V3(0, -J.y, HEEL_Z - J.z), tj: V3(0, Tj.y - J.y, Tj.z - J.z), tip: V3(0, -J.y, TIP_Z - J.z), ball: V3(0, -J.y, Tj.z - J.z) }; }
  // A foot on the ground. F: where its ankle would be if it stood flat there; yaw: which way it points; pitch: how far the heel is up
  // (negative: toes up, standing on the heel's back edge). Gives the ankle's place (out.p), the foot's turn (out.q, in his own space)
  // and how far the boot is bent at the ball (out.bend). The line it stands on does not move as the pitch changes, so a planted
  // foot cannot slide: on its heel it turns about the heel's edge; with the heel up, the toe piece stays flat on the ground and the
  // foot turns about the toe joint, until the boot is bent as far as it goes (TOE_MAX), then all of it turns about the toe's tip.
  function footOn(S, F, yaw, pitch, out) {
    const f = FOOT[S]; _q1.setFromAxisAngle(AY, yaw); out.q.copy(_q1).multiply(_q2.setFromAxisAngle(AX, pitch));
    if (pitch <= 0) { out.p.copy(f.heel).applyQuaternion(_q1).add(F).sub(_v1.copy(f.heel).applyQuaternion(out.q)); out.bend = 0; return out; }
    const bend = Math.min(pitch, TOE_MAX), tipUp = pitch - bend;
    if (tipUp <= 0) out.p.copy(f.tj).applyQuaternion(_q1).add(F);
    else { out.p.copy(f.tip).applyQuaternion(_q1).add(F); _q2.setFromAxisAngle(AX, tipUp); out.p.add(_v1.subVectors(f.tj, f.tip).applyQuaternion(_q3.copy(_q1).multiply(_q2))); }
    out.p.sub(_v1.copy(f.tj).applyQuaternion(out.q)); out.bend = bend; return out;
  }
  // how far below the ankle the lowest point of the sole is, for a foot in the air at this pitch with its boot bent this much
  function soleLow(S, pitch, bend) {
    const f = FOOT[S], c = Math.cos(pitch), sn = Math.sin(pitch), c2 = Math.cos(pitch - bend), s2 = Math.sin(pitch - bend), dy = f.tip.y - f.tj.y, dz = f.tip.z - f.tj.z;
    return Math.min(f.heel.y * c - f.heel.z * sn, f.ball.y * c - f.ball.z * sn, f.tj.y * c - f.tj.z * sn + dy * c2 - dz * s2);
  }
  // ----- a leg onto its ankle -----
  // The thigh and shin are turned so that the ankle joint is exactly at P (his own space). Exact matters: the Ranger's and Io's
  // solver takes thigh and shin to lie in one line at rest, which his do not quite (3 degrees), and 3 degrees at the knee is 2 cm
  // at the ankle: a sliding foot. The knee is a hinge about the shin's own X; it folds back. Returns how far the knee is bent.
  const LEG = {};
  for (const [S] of SIDES) { const a = SK['shin' + S].position, b = SK['foot' + S].position, A = a.y * b.y + a.z * b.z, B = a.z * b.y - a.y * b.z;
    LEG[S] = { a, b, M: Math.hypot(A, B), del: Math.atan2(B, A), c0: a.lengthSq() + b.lengthSq() + 2 * a.x * b.x, hip: V3() }; LEG[S].max = Math.sqrt(LEG[S].c0 + 2 * LEG[S].M * Math.cos(0.035)); }
  const hipAt = (S) => LEG[S].hip.copy(SK['thigh' + S].position).applyQuaternion(SK.hips.quaternion).add(SK.hips.position);      // the hip joint, in his own space (the hips bone hangs straight from root)
  function legTo(S, P, swivel) {
    const g = LEG[S], th = SK['thigh' + S], sh = SK['shin' + S];
    _v1.copy(P).sub(SK.hips.position).applyQuaternion(_q1.copy(SK.hips.quaternion).invert()).sub(th.position);
    const L = Math.min(_v1.length(), g.max), phi = g.del + Math.acos(cl((L * L - g.c0) / (2 * g.M), -1, 1));
    _v2.copy(g.b).applyAxisAngle(AX, phi).add(g.a).normalize(); _v1.normalize();
    th.quaternion.setFromUnitVectors(_v2, _v1); if (swivel) th.quaternion.premultiply(_q2.setFromAxisAngle(_v1, swivel));
    sh.rotation.set(phi, 0, 0); return phi;
  }
  // the foot is then turned to face the way it was asked to (q, his own space), whatever its shin is doing, and the boot bent at the ball
  function footTo(S, q, bend) {
    _q1.copy(SK.hips.quaternion).multiply(SK['thigh' + S].quaternion).multiply(SK['shin' + S].quaternion).invert();
    SK['foot' + S].quaternion.copy(_q1.multiply(q)); SK['toe' + S].rotation.set(-bend, 0, 0);
  }
  // ----- his hands -----
  // fingers: curl 0 open .. 1.4 a fist (Io's; his hands rest turned on the wrist, so the hinge is worked out, not taken as Z)
  const FING = {}; for (const [S, s] of SIDES) FING[S] = handDir(s, 0, 0, 1).normalize();
  function fingers(S, curl, idx) {
    const s = S === 'L' ? 1 : -1, ax = FING[S];
    for (const fn of ['idx', 'mid', 'rng', 'pnk']) { const c = fn === 'idx' && idx != null ? idx : curl * (fn === 'pnk' ? 1.1 : 1); for (let k = 0; k < 3; k++) SK[fn + k + S].quaternion.setFromAxisAngle(ax, -s * c * [0.85, 1.1, 0.7][k]); }
    SK['thb1' + S].quaternion.setFromAxisAngle(ax, -s * curl * 0.25); SK['thb2' + S].quaternion.setFromAxisAngle(ax, -s * curl * 0.35);
  }
  // A wrist only bends so far, and it does not twist: the turn of a hand is made along the forearm (Io's wristFix). Whatever a move
  // asked of a hand, its turn about the arm's own line is taken out, 80% of it is given to the forearm's bone (ftw), and the bend
  // that is left is held to WRIST_MAX.
  const WRIST_MAX = 0.62, QI = Qt();
  function wristFix(S) {
    const h = SK['hand' + S].quaternion, a = armDir[S]; if (h.w < 0) h.set(-h.x, -h.y, -h.z, -h.w);
    const dp = h.x * a.x + h.y * a.y + h.z * a.z; _q1.set(a.x * dp, a.y * dp, a.z * dp, h.w); if (_q1.lengthSq() < 1e-8) _q1.set(0, 0, 0, 1); _q1.normalize();
    _q2.copy(_q1).invert(); _q3.copy(h).multiply(_q2);
    const ang = 2 * Math.acos(Math.min(1, Math.abs(_q3.w))); if (ang > WRIST_MAX) _q3.copy(QI.set(0, 0, 0, 1).slerp(_q3, WRIST_MAX / ang));
    h.copy(_q3).multiply(_q1); SK['ftw' + S].quaternion.set(0, 0, 0, 1).slerp(_q1, 0.8);
  }
  // an arm, from hanging: out (radians from straight down), fwd (the upper arm swung forward), turn (the whole arm turned outward
  // about its own line: the elbow's fold then opens away from him), elbow (bent), palm (the hand turned from "palm to his thigh"
  // toward "palm up"), wrist (the hand bent back at the wrist). His hands are built with their backs forward (HAND_TW); here they are turned palm-in.
  // the hanging arm. palmIn: how far the hand is turned back from the way it is built (palm to the thigh and a little behind); turn: the whole arm turned in a
  // little, as a relaxed one is; hang: the arm this far out from straight down (his full sleeves and baggy trousers need the room); elbow: never quite straight
  const TUNE = { palmIn: 0.90, turn: -0.10, hang: 8.5 * DEG, elbow: 0.20 };
  function armSet(S, s, out, fwd, turn, elbow, palm, wrist) {
    SK['uarm' + S].rotation.set(-fwd, s * turn, s * (out - A_POSE)); SK['farm' + S].rotation.set(-elbow, 0, 0);
    SK['hand' + S].quaternion.setFromAxisAngle(armDir[S], -s * (TUNE.palmIn + palm)); if (wrist) SK['hand' + S].quaternion.multiply(_q4.setFromAxisAngle(FING[S], s * wrist));
    wristFix(S);
  }
  const pulse = (t, a, b, c, d) => sm(a, b, t) * (1 - sm(c, d, t)), frac = (v) => v - Math.floor(v);
  const herm = (p0, p1, m0, m1, t) => { const t2 = t * t, t3 = t2 * t; return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1; };
  // ----- the walk's numbers -----
  // One stride (two steps) is G.L metres and takes G.T seconds: an unhurried 1.08 m a second. Each foot is down for G.ST of it.
  // (stage 7) The walk's numbers are a set, GW, and the run's a second set, GR. G is the set in use this frame: GW, GR or a mix of the two
  // while he speeds up or slows down, so one piece of code plants the feet for both and nothing jumps between them.
  // T: seconds a stride; L: metres a stride; ST: the share of it each foot is down; X: his ankles this far from his middle line; YAW: toes turned out;
  // Z0: how far ahead of him the foot would stand flat as its heel lands; STRIKE: toes up as the heel lands (radians); FLAT: flat by this share of its
  // time on the ground; HEEL: the heel starts up at this share; OFF: heel up this far as the toe leaves; CLEAR: the sole clears the ground by this in the swing.
  const GW = { T: 1.22, L: 1.32, ST: 0.62, X: 0.100, YAW: 0.13, Z0: 0.310, STRIKE: 0.30, FLAT: 0.16, HEEL: 0.50, OFF: 0.85, CLEAR: 0.028 };
  // His run: a heavy-booted jog, 2.6 m a second. Each foot is down for well under half the stride, so he is off the ground twice in it.
  const GR = { T: 0.74, L: 1.92, ST: 0.38, X: 0.072, YAW: 0.06, Z0: 0.235, STRIKE: 0.13, FLAT: 0.14, HEEL: 0.40, OFF: 1.00, CLEAR: 0.115 };
  const G = Object.assign({}, GW);
  const WALK_SPEED = GW.L / GW.T;                     // metres a second his walking stride covers; the page tells the dust the ground is passing at this speed
  const FA = { p: V3(), q: Qt(), bend: 0 }, FB = { p: V3(), q: Qt(), bend: 0 }, FF = V3(), ANK = { R: V3(), L: V3() }, FQ = { R: Qt(), L: Qt() }, FBEND = { R: 0, L: 0 }, WF = { p: V3(), q: Qt(), bend: 0, pitch: 0, down: 0 };
  const stPitch = (u) => (u < G.FLAT ? -G.STRIKE * Math.pow(1 - u / G.FLAT, 1.4) : u > G.HEEL ? G.OFF * Math.pow((u - G.HEEL) / (1 - G.HEEL), 1.7) : 0);
  // with the heel up: if the hip has gone too far ahead for the leg to reach the ankle, the heel lifts further until it can
  function heelFor(S, s, zF, pitch, out) {
    FF.set(s * G.X, FOOT[S].J.y, zF); footOn(S, FF, s * G.YAW, pitch, out); if (pitch <= 0) return pitch;
    const hip = hipAt(S), lim = LEG[S].max * 0.9985; if (out.p.distanceTo(hip) <= lim) return pitch;
    let lo = pitch, hi = 1.25; for (let i = 0; i < 9; i++) { const m = (lo + hi) / 2; footOn(S, FF, s * G.YAW, m, out); if (out.p.distanceTo(hip) > lim) lo = m; else hi = m; }
    footOn(S, FF, s * G.YAW, hi, out); return hi;
  }
  // one foot of the walk at q (0 as its heel lands, G.ST as its toe leaves, 1 as the heel lands again): fills WF
  function walkFoot(S, s, q) {
    const reach = G.L * G.ST, yaw = s * G.YAW;
    if (q < G.ST) { const u = q / G.ST; WF.pitch = heelFor(S, s, G.Z0 - reach * u, stPitch(u), WF); WF.down = 1; return WF; }
    // In the air. It leaves as the ground foot's formula left it (toe tip down, heel high) and arrives toes-up on the heel's edge, moving
    // back at the ground's own speed so it does not skid as it lands. Between, its lowest point is kept a little above the ground.
    const w = (q - G.ST) / (1 - G.ST), e = 0.012;
    const pOff = heelFor(S, s, G.Z0 - reach, G.OFF, FA), z0 = FA.p.z, x0 = FA.p.x; const pE = heelFor(S, s, G.Z0 - reach * (1 - e), stPitch(1 - e), FB), vz0 = (z0 - FB.p.z) / e * (1 - G.ST) / G.ST, vp0 = (pOff - pE) / e * (1 - G.ST) / G.ST;
    FF.set(s * G.X, FOOT[S].J.y, G.Z0); footOn(S, FF, yaw, -G.STRIKE, FB);
    const pitch = herm(pOff, -G.STRIKE, Math.min(vp0, 1.1) * 0.55, 0, sm(0, 0.92, w) * 0.5 + w * 0.5), bend = FA.bend * (1 - sm(0, 0.30, w));
    WF.p.set(lerp(x0, FB.p.x, w), G.CLEAR * Math.pow(Math.sin(PI * w), 0.9) - soleLow(S, pitch, bend), herm(z0, FB.p.z, vz0, -G.L * (1 - G.ST), w));
    WF.q.setFromAxisAngle(AY, yaw).multiply(_q2.setFromAxisAngle(AX, pitch)); WF.bend = bend; WF.pitch = pitch; WF.down = 0; return WF;
  }
  // ----- his resting stance -----
  // Weight on his right leg; his left foot stands a little forward and turned out, its knee soft. [ankle x, z, toes out]
  const STAND = { R: [-0.118, -0.050, 0.10], L: [0.150, 0.030, 0.30] };
  const gait = { q: 0, pitch: { R: 0, L: 0 }, down: { R: 1, L: 1 }, knee: { R: 0, L: 0 } };
  function snapTo(name) { wk = name === 'walk' ? 1 : 0; tk = name === 'talk' ? 1 : 0; live = name === 'stand' ? 0 : 1; if (name === 'walk') gph = 0; }
  function play(name, now) {
    if (!MOVES.includes(name) || name === 'pose') { pose(lastPose); return 'pose'; }
    const from = mv.name; mv = { name, t: 0 }; if (name === 'walk') sitWant = false;
    if (now || from === 'pose') { snapTo(name); body(0); root.updateMatrixWorld(true); GEAR.step(0, true); hatRoom(); HAIRSIM.step(0, true); CLOTH.step(0, true); TR_SWAY.step(0, true); }      // from the measuring pose there is nothing sensible to ease through
    return name;
  }
  // an arm's numbers for armSet, per side. A move's hand mixes its palm, wrist and fingers into them by its weight; its arm is then
  // turned toward the arm reachQuat (N98_moves.js) solves for its wrist, by the same weight, bone by bone (mixReach).
  const ARMV = { R: { out: 0, fwd: 0, turn: 0, elbow: 0, palm: 0, wrist: 0, curl: 0, idx: 0 }, L: { out: 0, fwd: 0, turn: 0, elbow: 0, palm: 0, wrist: 0, curl: 0, idx: 0 } }, QU = Qt(), QF = Qt(), _tq = V3(), _pl = V3();
  function mixHand(v, h) { if (!(h.k > 0.0005)) return; const k = h.k; v.palm = lerp(v.palm, h.pa, k); v.wrist = lerp(v.wrist, h.wr, k); v.curl = lerp(v.curl, h.c, k); v.idx = lerp(v.idx, h.i, k); }
  function mixReach(S, s, h) {
    if (!(h.k > 0.0005)) return;
    layerTarget(S, h, _tq); dirToClav(S, h.el, _pl); reachQuat(S, s, _tq, _pl, QU, QF);
    SK['uarm' + S].quaternion.slerp(QU, h.k); SK['farm' + S].quaternion.slerp(QF, h.k);
  }
  // one frame of standing, walking or talking
  function body(dt) {
    const N = mv.name, T = mv.t, ease = (v, to, rate) => v + (to - v) * Math.min(1, dt * rate);
    wk = ease(wk, N === 'walk' && sk < 0.02 ? 1 : 0, 3.2); rn = ease(rn, NAV.run ? 1 : 0, 2.4); sk = cl(sk + (sitWant && wk < 0.05 ? dt : -dt) / SEAT.time, 0, 1); tk = ease(tk, N === 'talk' ? 1 : 0, 3.5); live = ease(live, N === 'stand' ? 0 : 1, 2.5);
    const go = wk * wk * (3 - 2 * wk), still = 1 - go, al = live, rk = rn * rn * (3 - 2 * rn), sks = sk * sk * (3 - 2 * sk), up = 1 - sks;
    for (const k in GW) G[k] = lerp(GW[k], GR[k], rk); NAV.kNow = ease(NAV.kNow, NAV.k, 5); G.L *= NAV.kNow;      // the stride is changed gently: a planted foot is moved by it
    restAll();
    // --- the move layer (N98_moves.js): talking loops, emotes and fidgets, over whatever the legs are doing; AO is the move fading out ---
    const AL = actFrame(dt, N === 'idle' && go < 0.01 && tk < 0.01 && sk < 0.01 && !NAV.go && NAV.face == null), AO = LAY_OLD, lay = (c, i) => AL[c][i] + AO[c][i];
    // --- always: breath, and while he stands a slow shift of his weight and a look about ---
    const br = Math.sin(clock * 1.45) * al, br2 = Math.sin(clock * 1.45 - 0.9) * al, sway = Math.sin(clock * 0.52) * al * still, sw2 = Math.sin(clock * 0.33 + 1.3) * al * still, look = Math.sin(clock * 0.21 + 0.4) * al * still;
    // --- standing: the hips sit over the right leg and drop on the left; the chest leans back the other way and opens; head level ---
    const H = SK.hips;
    H.position.x += (-0.044 + 0.010 * sway) * still; H.position.z += (-0.012 + 0.004 * sw2) * still;
    H.position.x += lay('hip', 0); H.position.z += lay('hip', 2);
    add('hips', 0.010 * still, (0.070 + 0.015 * sw2) * still, (-0.066 + 0.012 * sway) * still);
    add('spine1', -0.012 * still, -0.024 * still, (0.034 - 0.006 * sway) * still); add('spine2', -0.022 * still + 0.012 * br, -0.024 * still, (0.032 - 0.006 * sway) * still); add('spine3', -0.026 * still + 0.011 * br, -0.012 * still, 0.016 * still);
    add('neck', 0.020 * still, 0.02 * look, -0.006 * still); add('head', (-0.012 + 0.010 * sw2) * still + 0.006 * br2, (-0.010 + 0.07 * look) * still, (-0.012 + 0.012 * sway) * still);
    for (const [S, s] of SIDES) add('clav' + S, 0, -s * 0.030 * still, s * (0.012 * br - 0.010 * still));
    // how high his hips are is not chosen: it is what leaves the leg he stands on almost straight (its knee 6 to 12 degrees off straight as he breathes and shifts), so
    // the weight is seen to be on it, and it can never be asked to reach further than it is long
    if (still > 0.001) { const g = LEG.R, hp = hipAt('R'), hx = hp.x - STAND.R[0], hz = hp.z - STAND.R[1], want = FOOT.R.J.y + Math.sqrt(g.c0 + 2 * g.M * Math.cos(0.10) - hx * hx - hz * hz);
      H.position.y += (want - hp.y - 0.0012 * (1 + br) - 0.0015 * (1 + sw2)) * still; }
    H.position.y += lay('hip', 1);
    // the move's head and spine: the head takes its own and a third more on the neck; the spine shares its lean out over three bones
    add('head', lay('hd', 0), lay('hd', 1), lay('hd', 2)); add('neck', 0.33 * lay('hd', 0), 0.33 * lay('hd', 1), 0.2 * lay('hd', 2));
    add('spine1', 0.25 * lay('sp', 0), 0.25 * lay('sp', 1), 0.25 * lay('sp', 2)); add('spine2', 0.35 * lay('sp', 0), 0.35 * lay('sp', 1), 0.35 * lay('sp', 2)); add('spine3', 0.40 * lay('sp', 0), 0.40 * lay('sp', 1), 0.40 * lay('sp', 2));
    // --- walking ---
    let ph = 0;
    if (go > 0.001) {
      gph += dt * TAU / G.T; if (gph > TAU * 64) gph -= TAU * 64; ph = gph;
      const c1 = Math.cos(ph - 0.10), dsup = 0.5 + 0.5 * Math.cos(2 * (ph - TAU * 0.045));       // dsup: 1 when both feet are down (he is lowest then), 0 when one leg stands under him
      // running, he is lowest as each foot takes his weight and highest in the air between them
      H.position.y += lerp(-0.009 - 0.021 * dsup, -0.060 + 0.030 * Math.cos(2 * (ph - TAU * 0.44)), rk) * go; H.position.x += -0.020 * (1 - 0.6 * rk) * Math.sin(ph - TAU * 0.07) * go; H.position.z += (0.012 + 0.030 * rk) * go;
      const yawH = 0.085 * (1 + 0.45 * rk) * c1, rollH = -0.050 * Math.sin(ph + 0.15);                           // the hip of the leading leg goes forward; the hip of the swinging leg drops
      add('hips', 0.035 * go, yawH * go, rollH * go);
      if (rk > 0.001) { const r = rk * go; add('hips', 0.055 * r, 0, 0); add('spine1', 0.040 * r, 0, 0); add('spine2', 0.050 * r, 0, 0); add('spine3', 0.040 * r, 0, 0); add('neck', -0.050 * r, 0, 0); add('head', -0.060 * r, 0, 0); }      // he leans into the run, and keeps his head up
      // above the hips each part turns the other way, a beat later than the one below: shoulders against hips, and the head stays on his heading
      const yb = (lag) => 0.085 * Math.cos(ph - 0.10 - lag), rb = (lag) => -0.050 * Math.sin(ph + 0.15 - lag);
      add('spine1', -0.005 * go, -0.50 * yb(0.25) * go, -0.42 * rb(0.20) * go); add('spine2', 0, -0.62 * yb(0.45) * go, -0.42 * rb(0.35) * go); add('spine3', -0.012 * go, -0.52 * yb(0.65) * go, -0.34 * rb(0.5) * go);
      add('neck', -0.010 * go, 0.30 * yb(0.75) * go, 0.08 * rb(0.6) * go); add('head', -0.012 * go + 0.010 * Math.cos(2 * ph - 1.2) * go, 0.34 * yb(0.9) * go, 0.10 * rb(0.7) * go);
    }
    // --- sitting (stage 7): his hips go back and down onto the seat; he leans forward over his feet on the way and settles a little back ---
    if (sks > 0.001) {
      const bump = Math.sin(PI * sk), hy = SEAT.hip - SK.thighR.position.y;
      H.position.set(lerp(H.position.x, SEAT.x, sks), lerp(H.position.y, hy + 0.003 * br, sks), lerp(H.position.z, -SEAT.back, sks) + 0.05 * bump);
      H.rotation.set(lerp(H.rotation.x, SEAT.tilt, sks) + 0.20 * bump, H.rotation.y * up, H.rotation.z * up);
      add('spine1', 0.06 * sks + 0.14 * bump, 0, 0); add('spine2', 0.05 * sks + 0.12 * bump, 0, 0); add('spine3', 0.03 * sks + 0.06 * bump, 0, 0); add('neck', -0.10 * bump, 0, 0); add('head', -0.02 * sks - 0.14 * bump, 0, 0);
    }
    // --- arms: hanging, palms in, elbows soft; swinging from the shoulder as he walks, each against its own leg, the forearm trailing ---
    // his stage 5 talk runs on the move's own clock when the move is talk_lively (N98_moves.js), and on the leg move's clock for play('talk')
    const lv = Math.max(AL.lively, AO.lively), TK = lv > tk ? talkArms(AL.lively >= AO.lively ? AL.livelyT : AO.livelyT, lv) : talkArms(T, tk), tkk = Math.max(tk, lv);
    // --- talking: his head and chest go with his hands ---
    if (tkk > 0.001) { const g = TK; add('head', g.nod, g.turn, g.tilt); add('neck', 0.35 * g.nod, 0.4 * g.turn, 0); add('spine3', g.lean, 0.3 * g.turn, 0); add('spine2', 0.6 * g.lean, 0, 0); }
    // the arms as the legs, the stance and the stage 5 talk want them; then a move's hands are mixed in over them (reachArm)
    for (const [S, s] of SIDES) {
      const p = ph + (s < 0 ? 0 : PI), sw = Math.cos(p - 0.30) * go, late = Math.cos(p - 0.85) * go, g = TK[S], v = ARMV[S];
      v.out = TUNE.hang + 0.02 * go + (s < 0 ? 0.012 : -0.006) * still + 0.004 * br + g.out; v.fwd = 0.02 * still - (0.27 * sw - 0.02 * go) + 0.010 * br2 + g.fwd;
      v.elbow = TUNE.elbow * still + (0.24 - 0.17 * late) * go + 0.012 * br2 + g.elbow; v.turn = TUNE.turn + g.turn; v.palm = 0.04 * late + g.palm; v.wrist = -0.05 + 0.10 * late * go + g.wrist; v.curl = lerp(0.42 + 0.04 * late, g.curl, g.k); v.idx = lerp(0.30, g.idx, g.k);
      if (rk > 0.001) { const r = rk * go; v.fwd += -0.42 * sw * rk + 0.10 * r; v.elbow += (1.15 + 0.22 * late) * r; v.out += 0.05 * r; v.curl = lerp(v.curl, 0.95, r); v.idx = lerp(v.idx, 0.85, r); }      // running: elbows bent and pumping, hands loosely closed
      if (sks > 0.001) { v.fwd += -0.04 * sks; v.elbow += 1.12 * sks; v.out += -0.075 * sks; v.turn += 0.12 * sks; v.palm += -0.55 * sks; v.curl = lerp(v.curl, 0.22, sks); v.idx = lerp(v.idx, 0.16, sks); }      // seated: his hands rest on his thighs
      add('clav' + S, 0, s * 0.035 * sw, s * (g.shrug + lay('sh', s < 0 ? 0 : 1)));                 // the shoulder goes forward with its own arm (measured: with the sign the other way the shoulders cancelled the counter-turn of the chest)
    }
    if (AL.R.k + AL.L.k + AO.R.k + AO.L.k > 0) SK.hips.updateMatrixWorld(true);      // a move's hands are placed on his chest or head as they are now
    for (const [S, s] of SIDES) {
      const v = ARMV[S]; mixHand(v, AO[S]); mixHand(v, AL[S]);
      armSet(S, s, v.out, v.fwd, v.turn, v.elbow, v.palm, v.wrist); fingers(S, v.curl, v.idx);
      mixReach(S, s, AO[S]); mixReach(S, s, AL[S]);
    }
    // --- feet on the ground, legs to them ---
    for (const [S, s] of SIDES) {
      const st = STAND[S], J = FOOT[S].J, A = ANK[S];
      A.set(st[0], J.y, st[1]); FQ[S].setFromAxisAngle(AY, s * st[2]); FBEND[S] = 0; gait.pitch[S] = 0; gait.down[S] = 1;
      if (sks > 0.001) { const sf = SEATF[S]; A.lerp(_v3.set(sf[0], J.y, sf[1]), sks); FQ[S].slerp(_q4.setFromAxisAngle(AY, s * sf[2]), sks); }
      if (go > 0.001) { const f = walkFoot(S, s, frac(ph / TAU + (s < 0 ? 0 : 0.5))); A.lerp(f.p, go); FQ[S].slerp(f.q, go); FBEND[S] = f.bend * go; gait.pitch[S] = f.pitch; gait.down[S] = f.down; }
      gait.knee[S] = legTo(S, A, s * (0.03 * go + SEAT.knee * sks)); footTo(S, FQ[S], FBEND[S]);
    }
    gait.q = frac(ph / TAU);
  }
  // What his hands and head do when he talks: a loop of TALK_T seconds with three gestures in it, and small beats on each.
  //   1. his right hand comes up, palm half up, and offers the thing he is saying; it beats twice
  //   2. both hands open outward, a small shrug, head tipped: "and there you have it"
  //   3. his left hand lifts and one finger marks a point; his head turns that way
  // Between them the arms hang. Returned per arm: what to add to the hanging arm (armSet's numbers), finger curl, and k (how far the
  // fingers have gone over to the gesture); and for his head and chest: nod, turn, tilt, lean.
  const TALK_T = 9.6, TKO = { R: { out: 0, fwd: 0, turn: 0, elbow: 0, palm: 0, wrist: 0, curl: 0, idx: 0, k: 0, shrug: 0 }, L: { out: 0, fwd: 0, turn: 0, elbow: 0, palm: 0, wrist: 0, curl: 0, idx: 0, k: 0, shrug: 0 }, nod: 0, turn: 0, tilt: 0, lean: 0 };
  function talkArms(T, k) {
    const o = TKO; for (const S of ['R', 'L']) { const a = o[S]; a.out = a.fwd = a.turn = a.elbow = a.palm = a.wrist = a.curl = a.idx = a.k = a.shrug = 0; } o.nod = o.turn = o.tilt = o.lean = 0;
    if (k <= 0.001) return o;
    const t = T % TALK_T, g1 = pulse(t, 0.15, 0.85, 2.55, 3.25) * k, g2 = pulse(t, 3.45, 4.15, 5.75, 6.45) * k, g3 = pulse(t, 6.65, 7.25, 8.6, 9.3) * k;
    const b1 = Math.sin((t - 0.85) * 5.2) * sm(0.85, 1.1, t) * g1, b2 = Math.sin((t - 4.1) * 3.4) * g2, b3 = Math.sin((t - 7.2) * 6.0) * sm(7.2, 7.4, t) * g3;
    const R = o.R, L = o.L;
    R.fwd = 0.38 * g1 + 0.05 * b1 + 0.20 * g2; R.out = 0.02 * g1 + 0.10 * g2; R.turn = 0.02 * g1 + 0.42 * g2; R.elbow = 1.28 * g1 + 0.12 * b1 + 1.12 * g2 + 0.05 * b2; R.palm = 0.80 * g1 + 0.95 * g2; R.wrist = 0.22 * g1 + 0.08 * b1 + 0.26 * g2; R.curl = lerp(0.20, 0.10, g2); R.idx = R.curl * 0.7; R.k = Math.max(g1, g2); R.shrug = 0.07 * g2;
    L.fwd = 0.20 * g2 + 0.30 * g3 + 0.04 * b3; L.out = 0.10 * g2 + 0.04 * g3; L.turn = 0.42 * g2 + 0.05 * g3; L.elbow = 1.12 * g2 + 0.05 * b2 + 1.45 * g3 + 0.10 * b3; L.palm = 0.95 * g2 + 0.25 * g3; L.wrist = 0.26 * g2 + 0.05 * g3; L.curl = g3 > g2 ? 1.0 : 0.10; L.idx = g3 > g2 ? 0.06 : 0.07; L.k = Math.max(g2, g3); L.shrug = 0.07 * g2;
    o.nod = 0.05 * g1 + 0.030 * b1 - 0.03 * g2 + 0.04 * g3 + 0.025 * b3 + 0.012 * Math.sin(T * 2.3) * k; o.turn = -0.12 * g1 + 0.02 * b2 + 0.16 * g3 + 0.03 * Math.sin(T * 0.9) * k; o.tilt = 0.03 * g1 - 0.07 * g2 + 0.04 * g3; o.lean = 0.025 * g1 - 0.015 * g2 + 0.02 * g3;
    return o;
  }
  // ----- going somewhere (stage 7) -----
  // Game code sends him to a point on the ground (walkTo, runTo). He turns to it and steps off with his left foot (his weight rests on
  // his right). He is not pushed along at a set speed: each frame he is moved by whatever keeps the foot he is standing on still on the
  // ground (travel, below), so his feet cannot slide, starting and stopping included. To stop tidily he should arrive at the moment of
  // his stride that looks most like his resting stance: right foot under him, left about to come down. So his last strides are made a
  // little shorter (NAV.k) for that moment and the place to meet. BRAKE is how long the walk takes to fade out, as seconds at full speed.
  const BRAKE = 0.26, wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  function turnTo(want, dt, rate) { const d = wrapPi(want - root.rotation.y), st = cl(d * Math.min(1, dt * 6), -rate * dt, rate * dt); root.rotation.y = wrapPi(root.rotation.y + st); return Math.abs(d - st); }
  function arrive(ok) { const g = NAV.go; NAV.go = null; NAV.run = false; NAV.k = 1; NAV.kSet = false; NAV.brake = false; if (mv.name === 'walk') mv = { name: 'idle', t: 0 }; if (g && g.done) g.done(!!ok); }
  function navFrame(dt) {
    const g = NAV.go;
    if (!g) { if (NAV.face != null && turnTo(NAV.face, dt, 2.6) < 0.004) NAV.face = null; return; }
    if (sk > 0.02 || sitWant) { sitWant = false; return; }                // seated: he gets up first
    const dx = g.x - root.position.x, dz = g.z - root.position.z, d = Math.hypot(dx, dz), goW = wk * wk * (3 - 2 * wk), v = G.L / G.T;
    if (NAV.brake) { if (goW < 0.01) arrive(true); return; }
    if (d < 0.06 && goW < 0.02) { arrive(true); return; }
    const off = turnTo(Math.atan2(dx, dz), dt, 2.8), P = NAV.run ? GR : GW;
    if (mv.name !== 'walk') { if (off < 0.6) { if (goW < 0.02) gph = TAU * (P.Z0 + 0.05) / P.L; mv = { name: 'walk', t: 0 }; } return; }
    const L0 = G.L / NAV.kNow, brakeD = v * BRAKE;
    // the stride is only ever shortened: a longer one would ask his standing leg to reach further than it is long
    // q1 is the moment of his stride, counted on from now, at which he should start to stop; until then the stride is kept at whatever
    // length makes that moment and the place meet
    const D = Math.max(0, d - L0 / G.T * BRAKE);
    if (!NAV.kSet && goW > 0.9 && D < 3.2 * L0) { const dq = frac((G.Z0 + 0.05) / L0 - gph / TAU + 2); NAV.q1 = gph / TAU + dq + Math.max(dq < 0.35 ? 1 : 0, Math.ceil(D / L0 - dq - 1e-6)); NAV.kSet = true; }
    if (NAV.kSet) { const rem = NAV.q1 - gph / TAU; if (rem > 0.08) NAV.k = cl(D / (rem * L0), 0.70, 1); }
    if (d <= brakeD) { NAV.brake = true; mv = { name: 'idle', t: 0 }; }
  }
  // The foot he stands on, and the point of its sole that is on the ground: the back edge of the heel while the toes are up, the toe joint
  // while the heel is up, the tip of the toe once the boot is bent as far as it goes (footOn). After each frame's pose he is moved so that
  // this point is where it was on the ground a frame ago, turning included. With both feet off the ground (the run) he carries on at his speed.
  const TR = { sup: 'R', yaw: 0, R: { a: V3(), q: Qt(), b: 0, ok: false }, L: { a: V3(), q: Qt(), b: 0, ok: false } }, _c1 = V3(), _c2 = V3(), _c3 = V3(), _cq = Qt(), _cq2 = Qt();
  function solePoint(S, a, q, b, type, out) { const f = FOOT[S]; if (type === 0) return out.copy(f.heel).applyQuaternion(q).add(a); out.copy(f.tj).applyQuaternion(q).add(a); if (type === 2) out.add(_c3.subVectors(f.tip, f.tj).applyQuaternion(_cq.copy(q).multiply(_cq2.setFromAxisAngle(AX, -b)))); return out; }
  function travel(dt) {
    const go = wk * wk * (3 - 2 * wk), yaw = root.rotation.y;
    if (NAV.go && go > 0.004) {
      let S = TR.sup; if (!gait.down[S]) { const O = S === 'R' ? 'L' : 'R'; S = gait.down[O] ? O : ''; }
      if (S && TR[S].ok) { const pch = gait.pitch[S] * go, type = pch <= 1e-7 ? 0 : pch <= TOE_MAX ? 1 : 2, P = TR[S];
        solePoint(S, P.a, P.q, P.b, type, _c1).applyAxisAngle(AY, TR.yaw); solePoint(S, ANK[S], FQ[S], FBEND[S], type, _c2).applyAxisAngle(AY, yaw);
        root.position.x += _c1.x - _c2.x; root.position.z += _c1.z - _c2.z; }
      else if (!S) { const v = G.L / G.T * go * dt; root.position.x += Math.sin(yaw) * v; root.position.z += Math.cos(yaw) * v; }
      if (S) TR.sup = S;
    } else TR.sup = 'R';
    for (const K of ['R', 'L']) { TR[K].a.copy(ANK[K]); TR[K].q.copy(FQ[K]); TR[K].b = FBEND[K]; TR[K].ok = true; } TR.yaw = yaw;
  }
  // What game code calls on a fair folk NPC (game/people/npc/npc.js on the starter-world branch), by the same names, as his own.
  // WIRING is his own choice from the shared list of moves: stand-ins until Chris says who he is.
  const WIRING = { talk: ['talk_gruff', 'talk_calm', 'talk_lively'], greet: 'greet_bow', fidgets: ['fidget_look', 'fidget_hands', 'fidget_shift'], pace: 1, likes: ['beckon', 'laugh', 'point'], moods: { yes: 'nod', no: 'shake_head', happy: 'laugh', unsure: 'think', upset: 'cross', thanks: 'thanks', bye: 'wave' } };
  const awake = () => { if (mv.name === 'pose') play('idle', true); };
  const NPC = {
    face(x, z) { awake(); if (!NAV.go) NAV.face = Math.atan2(x - root.position.x, z - root.position.z); },
    greet() { awake(); return act(WIRING.greet); },
    talk(on) { awake(); talkLoop(on ? WIRING.talk[0] : null); if (on) act(WIRING.talk[0]); return !!on; },
    emote(name) { awake(); return act(name); },
    walkTo(x, z, opt) { awake(); if (NAV.go) arrive(false); NAV.face = null; return new Promise((done) => { NAV.go = { x, z, done }; NAV.run = !!(opt && opt.run); }); },
    runTo(x, z) { return NPC.walkTo(x, z, { run: true }); },
    stop() { if (NAV.go) arrive(false); NAV.face = null; },
    sit() { awake(); if (NAV.go) arrive(false); if (mv.name === 'walk') mv = { name: 'idle', t: 0 }; sitWant = true; },
    stand() { sitWant = false; },
    seat() { const a = root.rotation.y; return { x: root.position.x - Math.sin(a) * SEAT.back, z: root.position.z - Math.cos(a) * SEAT.back, height: SEAT.height, back: SEAT.back }; },
    headTop(out) { root.updateMatrixWorld(true); out = out || V3(); SK.head.getWorldPosition(out); out.y += 0.40; return out; },
  };
  function animate(dt) {
    dt = dt > 0 ? Math.min(dt, 0.05) : 0; clock += dt;
    if (mv.name !== 'pose') { navFrame(dt); mv.t += dt; body(dt); travel(dt); root.updateMatrixWorld(true); }
    faceFrame(dt, mv.name !== 'pose');
    GEAR.step(dt, mv.name === 'pose'); hatRoom(); HAIRSIM.step(dt, false); root.updateMatrixWorld(true); CLOTH.step(dt, false); TR_SWAY.step(dt, false);
    DUST.ground.set(-Math.sin(root.rotation.y), 0, -Math.cos(root.rotation.y)).multiplyScalar(api.walkOnSpot && !NAV.go ? WALK_SPEED * wk : 0);
    DUST.update(dt);
  }
  // the blank doll: every part in one plain clay colour, so his shape can be judged without his paintings on it
  const CLAY = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15 }), CLAY2 = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15, side: THREE.DoubleSide }), CLAY_H = hatPress(std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15, side: THREE.DoubleSide }));      // CLAY_H: clay hair, kept under his hat like the painted hair
  // the blank doll's clay for the old skin's trunk: the same clay, ending at the corset's edge as the painted one does
  const CLAY_CUT = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15 });
  CLAY_CUT.onBeforeCompile = (sh) => {
    sh.uniforms.uCorsetCut = CORSET_CUT; sh.uniforms.uShirtCut = SHIRT_CUT;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRest; varying vec3 vRestN;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = position; vRestN = normal;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uCorsetCut; uniform float uShirtCut; varying vec3 vRest; varying vec3 vRestN;')
      .replace('#include <map_fragment>', ['vec3 rn = normalize( vRestN );', 'float wf = pow( max( 0.0, rn.z ), 5.0 ) + 0.02 * step( 0.0, rn.z ), wb = pow( max( 0.0, -rn.z ), 5.0 ) + 0.02 * step( rn.z, 0.0 ), wr = pow( max( 0.0, -rn.x ), 5.0 ), wl = pow( max( 0.0, rn.x ), 5.0 );', CUT_GLSL].join('\n'));
  };
  // and for the trousers: clay seen from both sides, with the same holes cut in it
  const CLAY_T = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15, side: THREE.DoubleSide, alphaMap: TR_MASK_G, alphaTest: 0.5 });
  const CLAY_S = new THREE.MeshStandardMaterial({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15, side: THREE.DoubleSide });      // and for the shirt's cloth, which is not moved by bones
  let blank = false;
  function setBlank(on) { blank = !!on; for (const k in meshes) { const m = meshes[k]; m.material = !blank ? m.userData.painted : k === 'trousers' ? CLAY_T : /^(projHair|hair|hairIn|hairCap|hairMass)$/.test(k) ? CLAY_H : k === 'projRuffle' ? CLAY2 : /^(lens|nail)$/.test(k) ? m.userData.painted : /^(projTrunk|projHips)$/.test(k) ? CLAY_CUT : CLAY; if (k === 'lens' || k === 'nail') m.visible = !blank; } for (const k in shirtMeshes) shirtMeshes[k].material = blank ? CLAY_S : shirtMeshes[k].userData.painted; return blank; }
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
  // The old arm skin carries his leather wrist cuffs. They stay (they are not shirt), so the arm is cut in two where the cuff begins:
  // 'projArm' is the old sleeve and painted forearm, 'projCuff' the cuff, which is drawn over the doll's bare forearm with the new shirt.
  { const g = meshes.projArm.geometry, P = g.attributes.position, ix = g.index.array, slOf = (i) => { const S = P.getX(i) < 0 ? 'R' : 'L', sh = restPts['sh' + S], d = armDir[S]; return (P.getX(i) - sh.x) * d.x + (P.getY(i) - sh.y) * d.y; };
    cutMesh('projArm', ['projArm', 'projCuff'], (t) => ((slOf(ix[t * 3]) + slOf(ix[t * 3 + 1]) + slOf(ix[t * 3 + 2])) / 3 > A_CUFF + 0.010 ? 1 : 0));
    meshes.projCuff.material = meshes.projCuff.userData.painted = MATS.projCuff; }
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
    // Stage 3: the new shirt (N47_shirt.js) is worn whenever the old sleeves are off and he is not stripped to the doll. The old trunk
    // skin is then still drawn, but only as the corset (SHIRT_CUT, above), and the doll's chest shows in the shirt's open front.
    const newS = !doll && !oldOn.arms; SHIRT_CUT.value = newS ? 1 : 0; CUFF_CUT.value = newS ? 1 : 0;
    for (const k in shirtMeshes) shirtMeshes[k].visible = newS; meshes.lacing.visible = newS; meshes.projCuff.visible = !doll; UNDER_CUFF.value = doll ? 0 : 1;
    if (newS) meshes.dollTrunk.visible = true;
  }
  // Stage 6: his hat, and his belt and jewellery (N48_gear.js). Each can be switched off by itself ("Hat" and "Belt and jewellery" on the
  // page); both are hidden with the clothes when he is stripped to the doll. With the hat off his hair is no longer pressed under it.
  const HAT_KEYS = ['hatFelt', 'hatBand'], PROP_KEYS = ['gPearl', 'gSteel', 'gFeather', 'gBelt', 'gPouch', 'gParch', 'gBrass', 'gDark', 'gLeaf']; let hatOn = true, propsOn = true;
  function showGear() { for (const k of HAT_KEYS) if (meshes[k]) meshes[k].visible = hatOn && !doll; HAT_U.on.value = hatOn && !doll ? 1 : 0; for (const k of PROP_KEYS) if (meshes[k]) meshes[k].visible = propsOn && !doll; }
  function setHat(on) { hatOn = !!on; showGear(); return hatOn; }
  function setProps(on) { propsOn = !!on; showGear(); return propsOn; }
  function setDoll(on) { doll = !!on; showSkins(); showGear(); return doll; }
  function setOldSkin(o) { for (const k in (o || {})) if (k in OLD) oldOn[k] = !!o[k]; showSkins(); return Object.assign({}, oldOn); }
  function setOldTrousers(on) { setOldSkin({ legs: !!on, hips: !!on }); return oldOn.legs; }
  function setOldShirt(on) { setOldSkin({ arms: !!on, ruffles: !!on }); return oldOn.arms; }      // "Old shirt" on the page: the old painted shirt skin goes back on in place of the new shirt, for comparing
  function setCloth(on) { CLOTH.on = !!on; HAIRSIM.on = !!on; root.updateMatrixWorld(true); HAIRSIM.step(0, true); CLOTH.settle(); CLOTH.step(0, true); TR_SWAY.step(0, true); return CLOTH.on; }      // off: the cloth is frozen, carried on his bones
  // Stage 4: his hair. New hair (N45b_hair.js) by default; setOldHair(true) puts the old painted shell back to compare ("Old hair" on the
  // page); setHair(false) hides whichever is worn.
  const HAIR_KEYS = ['hair', 'hairIn', 'hairCap', 'hairMass']; let oldHair = false, hairOn = true;
  function showHair() { for (const k of HAIR_KEYS) if (meshes[k]) meshes[k].visible = hairOn && !oldHair; meshes.projHair.visible = hairOn && oldHair; }
  function setOldHair(on) { oldHair = !!on; showHair(); return oldHair; }
  function setHair(on) { hairOn = !!on; showHair(); return hairOn; }
  showHair(); showGear();
  setOldSkin({ legs: false, hips: false, arms: false, ruffles: false });
  // Every list a mesh carries must be as long as its list of points. A real graphics chip refuses to draw a mesh with a short list, so the
  // whole mesh vanishes (his face did, November 13), while the software renderer the tools here use draws it anyway. So it is caught here.
  for (const M of [meshes, shirtMeshes]) for (const k in M) { const g = M[k].geometry, n = g.attributes.position.count; for (const a in g.attributes) if (g.attributes[a].count !== n) throw new Error('mesh "' + k + '": ' + a + ' has ' + g.attributes[a].count + ' entries for ' + n + ' points'); }
  // and no triangle may name a point that is not there (the cut meshes above share their lists of points, so this is checked too)
  for (const M of [meshes, shirtMeshes]) for (const k in M) { const g = M[k].geometry, n = g.attributes.position.count, ix = g.index.array; if (ix.length % 3) throw new Error('mesh "' + k + '": its list of triangles is not a multiple of three'); for (let i = 0; i < ix.length; i++) if (ix[i] >= n) throw new Error('mesh "' + k + '": a triangle names point ' + ix[i] + ' of ' + n); }
  const api = { root, fx, skeleton, bones, SK, animate, pose, play, moves: MOVES, meshes, dust: DUST, setBlank, get blank() { return blank; }, setDoll, get doll() { return doll; }, setOldSkin, get oldSkin() { return Object.assign({}, oldOn); }, setOldTrousers, get oldTrousers() { return oldOn.legs; }, setOldShirt, get oldShirt() { return oldOn.arms; }, setCloth, get cloth() { return CLOTH.on; }, setOldHair, get oldHair() { return oldHair; }, setHair, get hair() { return hairOn; }, setHat, get hat() { return hatOn; }, setProps, get props() { return propsOn; }, gearKick: GEAR.kick, act, stopAct, talkLoop, get acting() { return ACT.name; }, get actTime() { return ACT.t; }, get looping() { return ACT.loop; }, acts: { talk: ACT_TALK.slice(), emotes: ACT_EMOTES.slice(), fidgets: ACT_FIDGETS.slice(), dur: (n) => (ACTS[n] ? ACTS[n].dur : 0) }, auto: AUTO, setFace: (eyes, mouth) => { if (eyes == null) FACE_FIX.on = false; else Object.assign(FACE_FIX, { on: true, eyes: eyes >= 0.75 ? 1 : eyes >= 0.25 ? 0.5 : 0, mouth: mouth || 'rest' }); faceFrame(0, mv.name !== 'pose'); return FACE_FIX.on; }, shirtMeshes, update: animate, face: NPC.face, greet: NPC.greet, talk: NPC.talk, emote: NPC.emote, walkTo: NPC.walkTo, runTo: NPC.runTo, stop: NPC.stop, get moving() { return !!NAV.go; }, sit: NPC.sit, stand: NPC.stand, get sitting() { return sitWant || sk > 0.02; }, get seated() { return sk > 0.98; }, seat: NPC.seat, headTop: NPC.headTop, wiring: WIRING, runSpeed: GR.L / GR.T, walkOnSpot: true, walkSpeed: WALK_SPEED, stride: GW.L, strideTime: GW.T, name: 'Noiz', debug: { NAV, GW, GR, G, SEAT, SEATF, get sk() { return sk; }, get wk() { return wk; }, get rn() { return rn; }, SK, meshes, trunkPt, legPt, bootPt, headPoint, hairPt, armAt, doll: DOLL, trousers: TROUSERS, holes: TR_HOLES, cloth: CLOTH, shirt: SHIRT, sway: TR_SWAY, hair: HAIR, hairSim: HAIRSIM, gear: GEAR, hat: HAT, gait, FOOT, LEG, soleLow, TUNE, ACTS, reachQuat, LAY, ACT }, get triangles() { return triCount; } };
  pose(lastPose);
  return api;
}
