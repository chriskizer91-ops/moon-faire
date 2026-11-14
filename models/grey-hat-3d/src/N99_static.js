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
  const CORSET_CUT = { value: 1 }, SHIRT_CUT = { value: 1 }, CUFF_CUT = { value: 1 }, UNDER_CUFF = { value: 1 };
  const CUT_GLSL = [
    'float topF = 1.289 - 0.040 * ( 1.0 - smoothstep( 0.0, 0.034, abs( vRest.x ) ) ), topB = 1.287, topS = 1.281;',
    'if ( uShirtCut > 0.5 && vRest.y > ( topF * wf + topB * wb + topS * ( wr + wl ) ) / ( wf + wb + wr + wl ) ) discard;',
    'float cutF = 0.997 + 0.051 * pow( min( abs( vRest.x ) / 0.17, 1.0 ), 0.70 ), cutB = 1.027 + 0.020 * min( abs( vRest.x ) / 0.17, 1.0 ), cutS = 1.082 - 1.71 * ( vRest.z + 0.03 ) * ( vRest.z + 0.03 );',
    'if ( uCorsetCut > 0.5 && vRest.y < ( cutF * wf + cutB * wb + cutS * ( wr + wl ) ) / ( wf + wb + wr + wl ) ) discard;'].join('\n');
  // the trunk, legs and boots take their sides from B2 (arms held out of the way); the arms take theirs from A3 (arms hanging)
  MATS.proj = mkProj('sideR', 'sideL'); MATS.projArm = mkProj('armR', 'armL'); MATS.projHair = mkProj('sideR', 'sideL'); MATS.projHair.side = THREE.DoubleSide; MATS.projRuffle = mkProj('armR', 'armL'); MATS.projRuffle.side = THREE.DoubleSide; MATS.projCuff = mkProj('armR', 'armL', false, true);
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
    CLOTH.step(0, true); TR_SWAY.step(0, true);     // the cloth is laid on him in the new pose and left to settle, so a still picture is right at once
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
    root.updateMatrixWorld(true); CLOTH.step(dt, false); TR_SWAY.step(dt, false);
    DUST.ground.set(-Math.sin(root.rotation.y), 0, -Math.cos(root.rotation.y)).multiplyScalar(api.walkOnSpot ? WALK_SPEED * wk : 0);
    DUST.update(dt);
  }
  // the blank doll: every part in one plain clay colour, so his shape can be judged without his paintings on it
  const CLAY = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15 }), CLAY2 = std({ color: lin('#b7a797'), roughness: 0.92, envMapIntensity: 0.15, side: THREE.DoubleSide });
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
  function setBlank(on) { blank = !!on; for (const k in meshes) { const m = meshes[k]; m.material = !blank ? m.userData.painted : k === 'trousers' ? CLAY_T : /^(projHair|projRuffle)$/.test(k) ? CLAY2 : /^(lens|nail)$/.test(k) ? m.userData.painted : /^(projTrunk|projHips)$/.test(k) ? CLAY_CUT : CLAY; if (k === 'lens' || k === 'nail') m.visible = !blank; } for (const k in shirtMeshes) shirtMeshes[k].material = blank ? CLAY_S : shirtMeshes[k].userData.painted; return blank; }
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
  function setDoll(on) { doll = !!on; showSkins(); return doll; }
  function setOldSkin(o) { for (const k in (o || {})) if (k in OLD) oldOn[k] = !!o[k]; showSkins(); return Object.assign({}, oldOn); }
  function setOldTrousers(on) { setOldSkin({ legs: !!on, hips: !!on }); return oldOn.legs; }
  function setOldShirt(on) { setOldSkin({ arms: !!on, ruffles: !!on }); return oldOn.arms; }      // "Old shirt" on the page: the old painted shirt skin goes back on in place of the new shirt, for comparing
  function setCloth(on) { CLOTH.on = !!on; CLOTH.settle(); CLOTH.step(0, true); TR_SWAY.step(0, true); return CLOTH.on; }      // off: the cloth is frozen, carried on his bones
  setOldSkin({ legs: false, hips: false, arms: false, ruffles: false });
  // Every list a mesh carries must be as long as its list of points. A real graphics chip refuses to draw a mesh with a short list, so the
  // whole mesh vanishes (his face did, November 13), while the software renderer the tools here use draws it anyway. So it is caught here.
  for (const M of [meshes, shirtMeshes]) for (const k in M) { const g = M[k].geometry, n = g.attributes.position.count; for (const a in g.attributes) if (g.attributes[a].count !== n) throw new Error('mesh "' + k + '": ' + a + ' has ' + g.attributes[a].count + ' entries for ' + n + ' points'); }
  // and no triangle may name a point that is not there (the cut meshes above share their lists of points, so this is checked too)
  for (const M of [meshes, shirtMeshes]) for (const k in M) { const g = M[k].geometry, n = g.attributes.position.count, ix = g.index.array; if (ix.length % 3) throw new Error('mesh "' + k + '": its list of triangles is not a multiple of three'); for (let i = 0; i < ix.length; i++) if (ix[i] >= n) throw new Error('mesh "' + k + '": a triangle names point ' + ix[i] + ' of ' + n); }
  const api = { root, fx, skeleton, bones, SK, animate, pose, play, moves: MOVES, meshes, dust: DUST, setBlank, get blank() { return blank; }, setDoll, get doll() { return doll; }, setOldSkin, get oldSkin() { return Object.assign({}, oldOn); }, setOldTrousers, get oldTrousers() { return oldOn.legs; }, setOldShirt, get oldShirt() { return oldOn.arms; }, setCloth, get cloth() { return CLOTH.on; }, shirtMeshes, walkOnSpot: true, walkSpeed: WALK_SPEED, name: 'Noiz', debug: { SK, meshes, trunkPt, legPt, bootPt, headPoint, hairPt, armAt, doll: DOLL, trousers: TROUSERS, holes: TR_HOLES, cloth: CLOTH, shirt: SHIRT, sway: TR_SWAY }, get triangles() { return triCount; } };
  pose(lastPose);
  return api;
}
