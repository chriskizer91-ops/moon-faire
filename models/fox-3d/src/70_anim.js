
  // ---------- bind: one skinned mesh per material ----------
  const tLeg = leggingsTex(); tLeg.wrapS = THREE.RepeatWrapping;
  const tLace = laceTex(); tLace.map.wrapS = tLace.alpha.wrapS = THREE.RepeatWrapping;
  const BLK = '#251d22', BLK_HI = '#40343c', BLK_LO = '#110b10', WARM = '#7a6470';
  const MATS = {
    torso: sheen(std({ map: PROJ ? bakedTex('body', 1024, 768, '#2c1e30') : torsoTex(), roughness: 0.78 }), '#b888b0', 3, PROJ ? 0.1 : 0.2),
    wine: sheen(std({ map: fabricTex(256, '#6e1a3a', '#8e2a50', '#3c0c20', 3, false, 'wine'), roughness: 0.92 }), '#e0608c', 2.6, 0.45),
    cloth: sheen(std({ map: fabricTex(256, BLK, BLK_HI, BLK_LO, 3), roughness: 0.94 }), WARM, 3, 0.3),
    leggings: sheen(std({ color: lin('#3a393d'), roughness: 0.78 }), '#b888b0', 3, 0.1),      // the same plain charcoal and the same finish as the hips in the torso's picture, so they read as one cloth
    emerald: sheen(std({ map: fabricTex(256, PAL.emerald, PAL.emeraldHi, PAL.emeraldDk, 3, false), roughness: 0.9, side: THREE.DoubleSide }), '#6fd0b0', 2.6, 0.38),
    boot: (() => { const n = crinkleTex(), k = new THREE.Vector2(0.6, 0.6); const lt = BAKED && BAKED.bootLeather ? bakedTex('bootLeather', 512, 512, '#4a2a1b') : null; if (lt) { lt.wrapS = lt.wrapT = THREE.RepeatWrapping; lt.repeat.set(2, 2); } return phys({ color: lt ? lin(0xfff0d6) : lin(0x4a2a1b), map: lt, roughness: 0.56, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 0.6, normalMap: n, normalScale: k, clearcoatNormalMap: n, clearcoatNormalScale: k }); })(),
    stitch: std({ color: lin(0xd9a24a), roughness: 0.7 }), eyelet: std({ color: lin(0xb89148), roughness: 0.32, metalness: 1, envMapIntensity: 1.5 }), aglet: std({ color: lin(0xb08a3e), roughness: 0.35, metalness: 0.9 }),
    sock: std({ map: sockTex(), roughness: 0.95 }), lace: std({ color: lin(0xc98a34), roughness: 0.82 }),
    sole: std({ map: soleTex(), color: lin(0xffd2a6), emissive: lin(0x2a1608), emissiveIntensity: 0.55, roughness: 0.82 }),      // her soles are dark brown rubber, not black
    leather: std({ color: lin(0x1a1418), roughness: 0.42, envMapIntensity: 0.8 }),
    gold: std({ color: lin(0xd8a546), roughness: 0.3, metalness: 1, envMapIntensity: 1.6 }),
    bells: std({ color: lin(0xe0ad48), roughness: 0.22, metalness: 1, envMapIntensity: 1.8 }),
    bellslit: std({ color: lin(0x1a1206), roughness: 0.9 }),
    cord: std({ color: lin(0x3a3038), roughness: 0.85 }),
    skin: sheen(std({ color: SKIN ? lin('#d8ccc6').multiply(lin(SKIN)) : lin('#dcb49c'), roughness: 0.64, envMapIntensity: 0.2, emissive: lin(SKIN || PAL.skin), emissiveIntensity: SKIN ? 0.44 : 0.42 }), '#ffb49a', 3.2, 0.1),
    hand: (() => { const t = bakedTex('hands', 1024, 1024, SKIN || '#d99f91'); return sheen(std({ map: t, color: lin('#d8ccc6'), roughness: 0.62, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: 0.44 }), '#ffb49a', 3.2, 0.08); })(),
    nail: phys({ color: lin(0xd8a39a), roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    face: (() => {
      const m = sheen(std({ map: faceT, color: lin('#d8ccc6'), roughness: 0.66, envMapIntensity: 0.2, emissive: lin('#ffffff'), emissiveMap: faceT, emissiveIntensity: 0.44 }), '#ffb49a', 3.2, 0.08);
      if (!(BAKED && BAKED.faceSide)) return m;
      // the head wears three pictures at once, mixed by which way the skin faces (see buildHead): the front painting, the profile painting, plain skin
      const ts = bakedTex('faceSide', 420, 540, SKIN || '#d99f91'), ta = bakedTex('faceSideA', 420, 540, '#000000'), first = m.onBeforeCompile;
      m.onBeforeCompile = (sh) => {
        first(sh); sh.uniforms.uSide = { value: ts }; sh.uniforms.uSideA = { value: ta }; sh.uniforms.uPlain = { value: lin((BAKED && BAKED.skinJaw) || SKIN || '#d99f91') };
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 faceMix; attribute vec2 uvSide; varying vec3 vFaceMix; varying vec2 vUvSide;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFaceMix = faceMix; vUvSide = uvSide;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uSide; uniform sampler2D uSideA; uniform vec3 uPlain; varying vec3 vFaceMix; varying vec2 vUvSide; vec3 gFaceCol;')
          .replace('#include <map_fragment>', 'vec4 texelColor = mapTexelToLinear( texture2D( map, vUv ) );\n float fSide = texture2D( uSideA, vUvSide ).r * vFaceMix.x;\n vec3 sideCol = mapTexelToLinear( texture2D( uSide, vUvSide ) ).rgb;\n gFaceCol = ( texelColor.rgb * max( 0.0, 1.0 - fSide - vFaceMix.y ) + sideCol * fSide + uPlain * vFaceMix.y ) * vFaceMix.z;\n diffuseColor.rgb *= gFaceCol;')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= gFaceCol;');
      };
      return m;
    })(),
    hair: sheen(std({ map: fabricTex(256, '#241a18', '#4a3830', '#0c0807', 2, true), roughness: 0.5, side: THREE.DoubleSide }), WARM, 3, 0.3),
    cap: sheen(std({ map: capTex(), roughness: 0.92 }), WARM, 2.6, 0.4),
    velvet: sheen(std({ map: fabricTex(256, BLK, BLK_HI, BLK_LO, 1, false, 'satin', 2, 'rgba(20,14,18,0.25)'), roughness: 0.86 }), WARM, 2.4, 0.42),
    fur: sheen(std({ color: lin(0x1a1418), roughness: 1, envMapIntensity: 0.3 }), WARM, 2.2, 0.4),
    gem: phys({ color: lin(PAL.teal), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, emissive: lin('#1c8a86'), emissiveIntensity: 0.6, envMapIntensity: 1.4 }),
    ruffle: sheen(std({ map: tLace.map, color: lin(BAKED && BAKED.ruffle ? '#b4a8b0' : '#9a8a92'), side: THREE.DoubleSide, roughness: 0.95, emissive: lin('#ffffff'), emissiveMap: tLace.map, emissiveIntensity: BAKED && BAKED.ruffle ? 0.14 : 0 }), WARM, 2.4, 0.14),
    pearl: phys({ color: lin(0x8f8a98), roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1.2 })
  };
  // ---------- the Fox's own materials ----------
  const curlTex = (() => {                           // a lock of her hair from root (bottom) to tip (top): dark brown running out to honey gold
    const c = cvs(32, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 256, 0, 0);
    gr.addColorStop(0, '#24130a'); gr.addColorStop(0.40, '#4c2a11'); gr.addColorStop(0.74, '#96531f'); gr.addColorStop(1, '#d98f3e'); g.fillStyle = gr; g.fillRect(0, 0, 32, 256);
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(' + (i % 2 ? '255,220,160' : '30,15,5') + ',0.10)'; g.fillRect(Math.floor(h1(i + 3) * 32), 0, 1 + (i % 3), 256); }
    return ctex(c);
  })();
  const earTex = (() => {                            // round the ear: its inner face at the two side edges of the picture, its back in the middle; base at the bottom, tip at the top
    const W = 256, H = 256, c = cvs(W, H), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, '#b0602f'); gr.addColorStop(0.6, '#9a4d26'); gr.addColorStop(0.82, '#4a2a1c'); gr.addColorStop(1, '#1e1412'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 500; i++) { const x = h1(i * 3.1) * W, y = h1(i * 7.7 + 2) * H; g.strokeStyle = 'rgba(' + (i % 2 ? '235,150,90' : '40,18,8') + ',0.22)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (h1(i) - 0.5) * 4, y - 9 - h1(i + 9) * 10); g.stroke(); }
    for (const x0 of [0, W]) {                       // the cream fur inside: a soft-edged tongue up each side edge, which meet at the front seam
      for (let y = 0; y < H; y++) { const v = 1 - y / H, hw = W * 0.185 * Math.pow(Math.max(0, 1 - v / 0.84), 0.6); if (hw <= 0) continue;
        const gg = g.createLinearGradient(x0 ? x0 - hw : 0, 0, x0 ? x0 : hw, 0); const e0 = 'rgba(244,232,214,0)', e1 = 'rgba(244,232,214,1)';
        if (x0) { gg.addColorStop(0, e0); gg.addColorStop(0.3, e1); gg.addColorStop(1, e1); } else { gg.addColorStop(0, e1); gg.addColorStop(0.7, e1); gg.addColorStop(1, e0); }
        g.fillStyle = gg; g.fillRect(x0 ? x0 - hw : 0, y, hw, 1); }
    }
    for (let i = 0; i < 260; i++) { const side = i % 2, x = side ? W - h1(i * 1.7) * W * 0.17 : h1(i * 1.7) * W * 0.17, y = H * (0.2 + 0.8 * h1(i * 5.3 + 1)); g.strokeStyle = 'rgba(200,180,150,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (side ? 3 : -3), y - 14); g.stroke(); }
    return ctex(c);
  })();
  Object.assign(MATS, {
    neck: (() => {                                   // her neck: the chest's tone where it leaves the collar, her face's tone above the choker, darkening into the shade under her jaw
      const c = cvs(8, 128), g = c.getContext('2d'), CH = (BAKED && BAKED.skinChest) || SKIN || '#e0a890', J = (BAKED && BAKED.skinJaw) || SKIN || '#c08068', F = SKIN || '#d89780';
      const ratio = (hex, k) => { const a = new THREE.Color(hex), b = new THREE.Color(CH); return 'rgb(' + [a.r / b.r, a.g / b.g, a.b / b.b].map((v) => Math.round(255 * Math.min(1, v * k))).join(',') + ')'; };
      const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.24, '#ffffff'); gr.addColorStop(0.34, ratio(F, 1.0)); gr.addColorStop(0.50, ratio(F, 0.93)); gr.addColorStop(0.62, ratio(J, 0.92)); gr.addColorStop(1, ratio(J, 0.85));
      g.fillStyle = gr; g.fillRect(0, 0, 8, 128); const t = ctex(c);
      return sheen(std({ color: lin('#d8ccc6').multiply(lin(CH)), map: t, emissive: lin(CH), emissiveMap: t, emissiveIntensity: 0.44, roughness: 0.64, envMapIntensity: 0.2 }), '#ffb49a', 3.2, 0.1);
    })(),
    choker: sheen(std({ color: lin('#b9506f'), roughness: 0.62 }), '#ffc0d0', 3, 0.15),
    bellm: std({ color: lin('#c9973a'), roughness: 0.28, metalness: 0.9 }),
    woodbead: std({ color: lin('#4a2416'), roughness: 0.34, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    scalp: (() => {                                  // the hair that lies close to her head and the body of hair under the curls: drawn strands, dark at the root with a few gold ones, running back toward the bun
      const c = cvs(256, 256), g = c.getContext('2d'); g.fillStyle = '#24150a'; g.fillRect(0, 0, 256, 256); let sd = 7;
      const rn = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }, tones = ['#170d06', '#2c1a0e', '#3e2612', '#553518', '#6f4720', '#8a5c2a', '#b07c3c'];
      for (let i = 0; i < 420; i++) {
        const x0 = rn() * 256, amp = 2 + rn() * 5, f = 1 + rn() * 2.5, p0 = rn() * 6.28, k = rn(); g.strokeStyle = tones[Math.floor(k * k * tones.length)]; g.globalAlpha = 0.35 + rn() * 0.5; g.lineWidth = 0.8 + rn() * 2.2; g.beginPath();
        for (let y = -4; y <= 260; y += 6) { const x = x0 + amp * Math.sin(y / 256 * 6.28 * f + p0); if (y < 0) g.moveTo(x, y); else g.lineTo(x, y); }
        g.stroke();
      }
      g.globalAlpha = 1; const t = ctex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return sheen(std({ map: t, roughness: 0.52 }), '#ffd9a0', 3, 0.34);
    })(),
    curl: sheen(std({ map: curlTex, roughness: 0.52 }), '#ffe0a8', 2.6, 0.34),
    ear: sheen(std({ map: earTex, roughness: 0.95 }), '#ffd2a8', 2.2, 0.45),
    frame: std({ color: lin(0x3b2b20), roughness: 0.34, metalness: 0.9, envMapIntensity: 1.3 }),
    lens: phys({ color: lin(0xffffff), roughness: 0.05, transparent: true, opacity: 0.09, depthWrite: false, envMapIntensity: 1.2 })
  });
  const root = new THREE.Group(); root.name = 'fox';
  root.add(SK.hips); root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones), meshes = {};
  const FOX_K = opts.scale || 1.045;                 // the whole figure, against the Jester's frame: her legs, shoulders and chin all land on her paintings at this one number
  root.scale.setScalar(FOX_K);                       // set here, after the skeleton has taken its rest pose: set any earlier, the bones would grow and the skin would not
  SK.spine1.scale.setScalar(UPK); SK.head.scale.setScalar(opts.headScale || 0.93); SK.head.position.y -= (opts.headDrop === undefined ? 0.0233 : opts.headDrop); root.updateMatrixWorld(true);   // horns keep their size as the head shrinks       // after the bind, so head, cap, horns and their veils all shrink about the neck
  let triCount = 0;
  for (const key in buckets) {
    const B = buckets[key], g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(B.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(B.si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(B.sw, 4));
    if (key === 'face') { g.setAttribute('faceMix', new THREE.Float32BufferAttribute(faceMix, 3)); g.setAttribute('uvSide', new THREE.Float32BufferAttribute(faceUvS, 2)); }
    g.setIndex(B.n > 65535 ? new THREE.Uint32BufferAttribute(B.idx, 1) : new THREE.Uint16BufferAttribute(B.idx, 1));
    const m = new THREE.SkinnedMesh(g, MATS[key] || MATS.cloth);
    m.name = key; m.castShadow = key !== 'faceSide'; m.receiveShadow = true; m.frustumCulled = false; if (key === 'faceSide') m.renderOrder = 0.6;
    root.add(m); m.bind(skeleton, new THREE.Matrix4()); meshes[key] = m; triCount += B.idx.length / 3;
  }
  for (const c of cloths) triCount += c.tris;
  const fx = new THREE.Group(); fx.name = 'fox-fx'; fx.add(clothGroup);

  // ---------- motion: a pose is a flat set of channels; limbs are solved onto hand and foot targets ----------
  const Qt = () => new THREE.Quaternion(), _qa = Qt(), _qb = Qt(), _qc = Qt(), _qd = Qt(), _m4 = new THREE.Matrix4(), _va = V3(), _vb = V3(), _vc = V3(), _vd = V3(), _ve = V3();
  const X_AX = V3(1, 0, 0), Y_AX = V3(0, 1, 0), Z_AX = V3(0, 0, 1);
  function basisQ(x, z, out) { _vd.crossVectors(z, x).normalize(); _ve.crossVectors(x, _vd).normalize(); _m4.makeBasis(x, _vd, _ve); return out.setFromRotationMatrix(_m4); }
  const LIMB = {};
  for (const [S, s] of SIDES) {
    const ax = armDir[S].clone(), az = V3(0, 0, -1).cross(ax).normalize();
    LIMB['arm' + S] = { inv: basisQ(ax, az, Qt()).invert(), l1: L_UARM * UPK, l2: L_FARM * UPK };
    const hip = SK['thigh' + S].userData.rest, kn = SK['shin' + S].userData.rest, an = SK['foot' + S].userData.rest;
    const lx = kn.clone().sub(hip).normalize(), lz = V3(0, 0, 1).cross(lx).normalize();
    const lx2 = an.clone().sub(kn).normalize(), lz2 = V3(0, 0, 1).cross(lx2).normalize();
    LIMB['leg' + S] = { inv: basisQ(lx, lz, Qt()).invert(), inv2: basisQ(lx2, lz2, Qt()).invert(), l1: hip.distanceTo(kn), l2: kn.distanceTo(an) };
  }
  // two-bone IK: from joint a at world A to target T with the middle joint leaning toward pole; sets both bones' rotations
  function solveLimb(bA, bB, A, T, pole, L, twist, parentQ, outMidQ) {
    _va.subVectors(T, A); let d = _va.length(); const mx = (L.l1 + L.l2) * 0.9985, mn = Math.abs(L.l1 - L.l2) + 0.02;
    if (d < 1e-5) { _va.set(0, -1, 0); d = 1e-5; }
    _va.multiplyScalar(1 / d); d = cl(d, mn, mx);
    const a = (L.l1 * L.l1 - L.l2 * L.l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L.l1 * L.l1 - a * a));
    _vb.copy(pole).addScaledVector(_va, -pole.dot(_va)); if (_vb.lengthSq() < 1e-8) _vb.set(0, 0, -1).addScaledVector(_va, _va.z); _vb.normalize();
    const hinge = _vc.crossVectors(_vb, _va).normalize();                        // the axis the middle joint bends about
    const d1 = V3().copy(_va).multiplyScalar(a).addScaledVector(_vb, h).normalize();          // A -> middle
    const mid = V3().copy(A).addScaledVector(d1, L.l1), end = V3().copy(A).addScaledVector(_va, d), d2 = end.sub(mid).normalize();
    const hz = V3().copy(hinge);
    basisQ(d1, hz, _qa).multiply(L.inv);                                          // world rotation of the upper bone
    bA.quaternion.copy(_qb.copy(parentQ).invert()).multiply(_qa);
    basisQ(d2, hz, _qc).multiply(L.inv2 || L.inv);
    if (twist) { _qd.setFromAxisAngle(d2, twist); _qc.premultiply(_qd); }
    bB.quaternion.copy(_qb.copy(_qa).invert()).multiply(_qc);
    if (outMidQ) outMidQ.copy(_qc);
    return mid;
  }
  // finger poses: [thumb, index, middle, ring, little, spread]; 0 is straight, 1 is curled shut
  const FP = { relax: [0.32, 0.30, 0.36, 0.42, 0.48, 0.12], open: [0.04, 0.03, 0.02, 0.05, 0.09, 0.95], soft: [0.14, 0.12, 0.17, 0.22, 0.28, 0.55], point: [0.62, 0.0, 0.86, 0.92, 0.94, 0.08],
    fist: [0.72, 0.95, 0.96, 0.96, 0.95, 0], cup: [0.18, 0.30, 0.36, 0.42, 0.48, 0.55], grip: [0.6, 0.8, 0.86, 0.88, 0.88, 0], weave: [0.36, 0.10, 0.46, 0.56, 0.62, 0.7] };
  const handAxes = {};
  for (const [S, s] of SIDES) {
    const c = Math.cos(s * A_POSE), sn = Math.sin(s * A_POSE);
    const palm = V3(-s * c, -s * sn, 0), along = V3(sn, -c, 0), td = V3(-s * THUMB.dir[0], THUMB.dir[1], THUMB.dir[2]).normalize();
    td.set(td.x * c - td.y * sn, td.x * sn + td.y * c, td.z);                     // the thumb's direction in the bind pose
    const tn = V3(1, 0, 0), tdc = V3(...THUMB.dir).normalize(); tn.addScaledVector(tdc, -tn.x).normalize(); const tb = V3().crossVectors(tdc, tn);
    tn.multiplyScalar(Math.cos(THUMB.roll)).addScaledVector(tb, -Math.sin(THUMB.roll));          // the way the thumb's pad faces (it is turned toward the fingers)
    handAxes[S] = { palm, along, curl: V3(0, 0, -s), thumbFlex: V3().crossVectors(td, handDir(s, tn.x, tn.y, tn.z)).normalize(), thumbOpp: along.clone() };
  }
  const SPREAD = [0, 1, 0.3, -0.45, -1.0];
  function poseFingers(S, f) {
    const A = handAxes[S];
    for (let k = 0; k < 4; k++) {
      const [fn] = FINGERS[k], c = f[k + 1], sp = SPREAD[k + 1] * (f[5] - 0.3) * 0.26 * (1 - c * 0.8);
      _qa.setFromAxisAngle(A.curl, c * 1.38); _qb.setFromAxisAngle(A.palm, sp); SK[fn + '0' + S].quaternion.copy(_qb).multiply(_qa);
      SK[fn + '1' + S].quaternion.setFromAxisAngle(A.curl, c * 1.62); SK[fn + '2' + S].quaternion.setFromAxisAngle(A.curl, c * 1.05);
    }
    const t = f[0];
    _qa.setFromAxisAngle(A.thumbOpp, (A.curl.z > 0 ? 1 : -1) * (0.15 + t * 0.9)); _qb.setFromAxisAngle(A.palm, (0.5 - f[5]) * 0.35); SK['thb0' + S].quaternion.copy(_qb).multiply(_qa);
    SK['thb1' + S].quaternion.setFromAxisAngle(A.thumbFlex, t * 0.7); SK['thb2' + S].quaternion.setFromAxisAngle(A.thumbFlex, t * 0.9);
  }
  // the resting pose: every channel a spell can move
  const REST = {
    hip: [0, 0, 0], hipR: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], sh: [0, 0],
    hR: [-0.300, 0.868, 0.055], hL: [0.300, 0.868, 0.055], eR: [-0.55, -0.1, -1], eL: [0.55, -0.1, -1], twR: 0, twL: 0, wrR: [0.1, 0], wrL: [0.1, 0],
    fR: FP.relax.slice(), fL: FP.relax.slice(),
    ftR: [0, 0, 0, -0.10, 0, 0, 0], ftL: [0, 0, 0, 0.10, 0, 0, 0], knR: [-0.12, 0, 1], knL: [0.12, 0, 1],
    eyes: 0, mouth: 0, glow: 0
  };
  const CHANS = Object.keys(REST);
  const clonePose = (p) => { const o = {}; for (const k of CHANS) o[k] = typeof p[k] === 'number' ? p[k] : p[k].slice(); return o; };
  const cur = clonePose(REST), base = clonePose(REST);
  function blendPose(out, a, b, w) { for (const k of CHANS) { const x = a[k], y = b[k]; if (typeof x === 'number') out[k] = x + (y - x) * w; else { const o = out[k]; for (let i = 0; i < x.length; i++) o[i] = x[i] + (y[i] - x[i]) * w; } } }
  // actions: keys inherit the last value of every channel they leave out; values glide through keys on smooth curves
  const ACTS = {}, STANCES = {};
  function buildTracks(keys, dur, outro, hold) {
    const tracks = {};
    for (const k of CHANS) {
      const ts = [0], vs = [REST[k]], n = typeof REST[k] === 'number' ? 0 : REST[k].length;
      for (const key of keys) if (key[k] !== undefined) {
        let v = key[k] === 'rest' ? REST[k] : key[k]; if (n && v.length < n) v = v.concat(REST[k].slice(v.length));      // short lists (feet without a roll) are filled from rest
        if (key.t <= 0) vs[0] = v; else { ts.push(key.t); vs.push(v); }
      }
      if (ts.length === 1 && vs[0] === REST[k]) continue;
      const tl = ts[ts.length - 1], vl = vs[vs.length - 1];        // hold the last value, then settle back to rest at the end (a stance stays)
      if (hold) { if (tl < dur) { ts.push(dur); vs.push(vl); } }
      else { if (tl < dur - outro - 1e-3) { ts.push(dur - outro); vs.push(vl); } if (ts[ts.length - 1] < dur) { ts.push(dur); vs.push(REST[k]); } }
      tracks[k] = { ts, vs };
    }
    return tracks;
  }
  function defAction(name, dur, keys, o) {
    ACTS[name] = Object.assign({ dur, tracks: buildTracks(keys, dur, (o && o.outro) || 0.5, false), hits: [], cues: [] }, o || {});
    if (o && o.spin) ACTS[name].spinT = { ts: o.spin.map((e) => e[0]), vs: o.spin.map((e) => e[1]) };      // a turn of her whole body about the spot she stands on, [[time, angle], ...]
  }
  // a stance is a way of holding the body (kneeling, sitting): its keys run from standing to the held pose, and play backwards to stand up again
  function defStance(name, dur, keys, o) { STANCES[name] = Object.assign({ dur, tracks: buildTracks(keys, dur, 0, true) }, o || {}); }
  function evalTrack(tr, t, out) {
    const ts = tr.ts, vs = tr.vs, n = ts.length; let i = 1; while (i < n - 1 && ts[i] < t) i++;
    const t0 = ts[i - 1], t1 = ts[i], u = cl((t - t0) / (t1 - t0), 0, 1), u2 = u * u, u3 = u2 * u, dtt = t1 - t0;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    const comp = (a, b, pa, nb, ta, tb) => {
      let m0 = i - 1 > 0 ? (b - pa) / (t1 - ta) : 0, m1 = i < n - 1 ? (nb - a) / (tb - t0) : 0;
      if ((b - a) * (a - pa) <= 0) m0 = 0; if ((nb - b) * (b - a) <= 0) m1 = 0;       // rest at holds and turning points
      return h00 * a + h10 * dtt * m0 + h01 * b + h11 * dtt * m1;
    };
    const a = vs[i - 1], b = vs[i], pa = vs[Math.max(0, i - 2)], nb = vs[Math.min(n - 1, i + 1)], ta = ts[Math.max(0, i - 2)], tb = ts[Math.min(n - 1, i + 1)];
    if (typeof a === 'number') return comp(a, b, pa, nb, ta, tb);
    for (let k = 0; k < a.length; k++) out[k] = comp(a[k], b[k], pa[k], nb[k], ta, tb);
    return out;
  }
  let act = null, guardOn = false, stance = null, stanceTo = '', pending = '';
  const actPose = clonePose(REST), stPose = clonePose(REST);
  function evalPose(tracks, t, out) { for (const k of CHANS) { const tr = tracks[k]; if (tr) { const v = evalTrack(tr, t, out[k]); if (typeof v === 'number') out[k] = v; } else if (typeof REST[k] === 'number') out[k] = REST[k]; else for (let i = 0; i < REST[k].length; i++) out[k][i] = REST[k][i]; } return out; }
  function setStance(name) { if (name && !STANCES[name]) return false; stanceTo = name || ''; return true; }
  function play(name, force) {
    const def = ACTS[name]; if (!def) return false;
    if (act && !force) return false;
    if (def.stand && (stance || stanceTo)) { stanceTo = ''; pending = name; act = null; return true; }      // moves that need her feet (a jump) wait until she is standing
    pending = '';
    act = { type: name, t: 0, dur: def.dur, def, fired: {} };
    if (def.start) def.start(act);
    return true;
  }
  // ---------- springs: the horns and their pompoms, and the bell chain ----------
  function makeChain(names, anchor, o) {
    const n = names.length, rest = names.map((nm) => SK[nm].userData.rest.clone()), aRest = SK[anchor].userData.rest;
    const loc = rest.map((r) => r.clone().sub(aRest)), p = rest.map((r) => r.clone()), pv = rest.map((r) => r.clone()), len = [], dir = [];
    for (let i = 0; i < n - 1; i++) { len.push(rest[i].distanceTo(rest[i + 1])); dir.push(rest[i + 1].clone().sub(rest[i]).normalize()); }
    const tg = V3(), aQ = Qt(), pq = Qt(), wq = Qt(), d0 = V3(), d1 = V3(); let init = false;
    return { p, reset() { init = false; }, update(dt) {
      const A = SK[anchor]; A.matrixWorld.decompose(_va, aQ, _vb);
      const h = Math.min(dt, 0.033), steps = dt > 0 ? 2 : 0;
      for (let s = 0; s < (init ? steps : 1); s++) for (let i = 0; i < n; i++) {
        tg.copy(loc[i]).applyMatrix4(A.matrixWorld);
        if (i === 0 || !init) { p[i].copy(tg); pv[i].copy(tg); continue; }
        const hs = h / steps, k = o.stiff[i], damp = o.damp;
        d0.subVectors(p[i], pv[i]).multiplyScalar(damp); pv[i].copy(p[i]); p[i].add(d0); p[i].y -= o.grav * hs * hs * (o.gw ? o.gw[i] : 1);
        p[i].lerp(tg, 1 - Math.pow(1 - k, hs * 60));
        d0.subVectors(p[i], p[i - 1]); const L = d0.length() || 1e-6; p[i].copy(p[i - 1]).addScaledVector(d0, len[i - 1] / L);
        if (o.collide) o.collide(p[i], i);
      }
      init = true; pq.copy(aQ);
      for (let i = 0; i < n - 1; i++) {
        d0.copy(dir[i]).applyQuaternion(aQ); d1.subVectors(p[i + 1], p[i]).normalize();
        wq.setFromUnitVectors(d0, d1).multiply(aQ);
        SK[names[i]].quaternion.copy(_qa.copy(pq).invert()).multiply(wq); pq.copy(wq);
      }
    } };
  }
  const chains = [];
  for (const [S, s] of SIDES) chains.push(makeChain(hornChains[S].names, 'head', { stiff: [1, 0.55, 0.42, 0.33, 0.27, 0.22, 0.10], damp: 0.90, grav: 3.2, gw: [0, 0.2, 0.3, 0.4, 0.5, 0.6, 2.2] }));
  for (const names of hairChains) chains.push(makeChain(names, 'head', names.length === 3 ? { stiff: [1, 0.62, 0.46], damp: 0.88, grav: 1.4, gw: [0, 0.4, 0.7] } : { stiff: [1, 0.34, 0.22, 0.16], damp: 0.90, grav: 2.6, gw: [0, 0.6, 1.0, 1.4] }));      // her loose hair; the bun (three bones) is held firmer
  const hipsInv = new THREE.Matrix4(), bellChain = makeChain(['bell0', 'bell1', 'bell2', 'bell3'], 'hips', { stiff: [1, 0.02, 0.012, 0.008], damp: 0.965, grav: 9.0, collide(p, i) {
    _va.copy(p).applyMatrix4(hipsInv); const y = cl(_va.y + SK.hips.userData.rest.y - (i === 3 ? 0.03 : 0), 0.3, 0.985), [rx, rz] = prof(SKIRT_R, y, true), m = 0.034 + (i === 3 ? 0.012 : 0), zc = skirtZc(y);
    const q = Math.pow(_va.x / (rx + m), 2) + Math.pow((_va.z - zc) / (rz + m), 2);
    if (q < 1 && _va.z > zc) { const k = 1 / Math.sqrt(q); _va.x *= k; _va.z = zc + (_va.z - zc) * k; p.copy(_va).applyMatrix4(SK.hips.matrixWorld); }
  } });
  chains.push(bellChain);
