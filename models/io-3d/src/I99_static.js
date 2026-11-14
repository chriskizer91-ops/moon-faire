
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
  root.add(SK.hips); if (SK.book) root.add(SK.book); root.updateMatrixWorld(true);       // her book is not carried by her body: it has its own place every frame
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
  const _inv = new THREE.Matrix4(), _m4 = new THREE.Matrix4(), _mb = new THREE.Matrix4(), _p = V3(), _c = V3(), _t = V3(), _t2 = V3(), _n = V3(), _d = V3(), _e = V3();
  const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qc = new THREE.Quaternion(), AX = V3(1, 0, 0), AY = V3(0, 1, 0);
  const BODY = Object.keys(SK).filter((k) => !/_\d+$/.test(k));               // every bone but the soft chains
  const add = (b, x, y, z) => { const r = SK[b].rotation; r.x += x; r.y += y; r.z += z; };
  function restAll() { for (const k of BODY) SK[k].rotation.set(0, 0, 0); SK.hips.position.copy(SK.hips.userData.home); }
  function sync() { root.updateMatrixWorld(true); _inv.copy(root.matrixWorld).invert(); }
  const rootQuat = (bone, out) => out.setFromRotationMatrix(_m4.multiplyMatrices(_inv, bone.matrixWorld));       // a bone's turn, in her own space
  const carried = (bone, x, y, z, out) => (out || V3()).set(x, y, z).sub(SK[bone].userData.rest).applyMatrix4(SK[bone].matrixWorld).applyMatrix4(_inv);   // a point of her rest pose, where its bone has carried it

  // ----- balls her hair ('h') and her skirt ('s') cannot pass into, each carried by a bone -----
  const COL = [];
  const ball = (bone, x, y, z, r, g) => COL.push({ bone: SK[bone], off: V3(x, y, z).sub(SK[bone].userData.rest), rest: V3(x, y, z), r, g, p: V3() });
  ball('neck', 0, 1.385, -0.022, 0.050, 'h'); ball('spine3', 0, 1.300, -0.030, 0.078, 'h'); ball('spine3', -0.058, 1.245, 0.002, 0.086, 'h'); ball('spine3', 0.058, 1.245, 0.002, 0.086, 'h');
  ball('spine2', 0, 1.165, 0.002, 0.092, 'h'); ball('spine1', 0, 1.075, -0.004, 0.080, 'h'); ball('hips', 0, 0.955, -0.020, 0.135, 'h');
  for (const [S] of SIDES) {
    const sh = restPts['sh' + S], d = armDir[S];
    [['uarm', 0, 0.048], ['uarm', 0.08, 0.043], ['uarm', 0.16, 0.039], ['farm', 0.232, 0.037], ['farm', 0.30, 0.035], ['farm', 0.37, 0.030], ['hand', 0.484, 0.033], ['hand', 0.544, 0.026]].forEach(([b, sl, r]) => { const p = sh.clone().addScaledVector(d, sl); ball(b + S, p.x, p.y, p.z, r, 'hs'); });
    const hip = SK['thigh' + S].userData.rest, kn = SK['shin' + S].userData.rest, an = SK['foot' + S].userData.rest, T = (a, b, t) => a.clone().lerp(b, t);
    [['thigh', T(hip, kn, 0.06), 0.094], ['thigh', T(hip, kn, 0.18), 0.092], ['thigh', T(hip, kn, 0.31), 0.086], ['thigh', T(hip, kn, 0.46), 0.078], ['thigh', T(hip, kn, 0.64), 0.071], ['thigh', T(hip, kn, 0.82), 0.065], ['shin', kn.clone(), 0.063], ['shin', T(kn, an, 0.22), 0.058], ['shin', T(kn, an, 0.45), 0.055], ['shin', T(kn, an, 0.70), 0.049], ['foot', V3(an.x, 0.08, 0.0), 0.055], ['foot', V3(an.x, 0.05, 0.07), 0.050]].forEach(([b, p, r]) => ball(b + S, p.x, p.y, p.z, r, 's'));
  }
  // ----- the soft chains (made in 10_geom.js, I30_body.js and I41_hair.js) -----
  // Each point of a chain is pulled toward where it would rest: the way it was built, carried by its body bone (her chest for her hair,
  // her hips for her skirt), leaning toward plain hanging the further down the chain it is. It keeps its speed, so it lags behind her and
  // swings in after. It stays a fixed length from the point above, outside the balls, and above the floor.
  const FLOOR = 0.018, SOFT_H = 1 / 60;
  const SOFT = CHAINS.map((ch) => {
    const n = ch.names.length, hair = ch.grp === 'hair', own = ch.soft || null, pad = own ? own.pad : hair ? 0.012 : 0.030, grp = own ? own.col : hair ? 'h' : 's';       // the skirt's inner layers lie inside its chains, so its balls are padded more
    const o = { ch, hair, yb: SK[ch.yaw || ch.parent], par: SK[ch.parent], b: ch.names.map((nm) => SK[nm]), dir: [], len: [], cur: [], prev: [], g: [], k: [], d: [], cols: [], lift: 0, out: ch.a != null ? V3(Math.sin(ch.a), 0, Math.cos(ch.a)) : null, P: V3(), Q: new THREE.Quaternion(), Y: new THREE.Quaternion() };
    for (let i = 0; i < n; i++) {
      const tip = ch.pts[i + 1], v = tip.clone().sub(ch.pts[i]), t = n > 1 ? i / (n - 1) : 0; o.len.push(v.length()); o.dir.push(v.normalize()); o.cur.push(tip.clone()); o.prev.push(tip.clone());
      if (own) { o.k.push(own.k); o.d.push(own.d); o.g.push(own.g); }
      else if (!hair) { o.k.push(lerp(0.10, 0.05, t)); o.d.push(lerp(0.22, 0.16, t)); o.g.push(lerp(0.05, 0.32, t)); }
      else if (ch.front) { o.k.push(lerp(0.060, 0.026, t)); o.d.push(lerp(0.17, 0.11, t)); o.g.push(lerp(0.30, 0.88, t)); }
      else { o.k.push(lerp(0.060, 0.024, t)); o.d.push(lerp(0.17, 0.11, t)); o.g.push(lerp(0.10, 0.85, t)); }
      const cs = []; COL.forEach((c, ci) => { if (c.g.indexOf(grp) < 0) return; const r = Math.min(c.r + pad, tip.distanceTo(c.rest) - 0.003); if (r > 0.014) cs.push(ci, r); }); o.cols.push(cs);       // a ball never pushes a point out of its place at rest
    }
    return o;
  });
  const fitLen = (p, c, L) => { p.sub(c); p.multiplyScalar(L / (p.length() || 1e-6)).add(c); };
  function softFrames() {
    for (const c of COL) c.p.copy(c.off).applyMatrix4(c.bone.matrixWorld).applyMatrix4(_inv);
    for (const o of SOFT) { _mb.multiplyMatrices(_inv, o.par.matrixWorld); o.Q.setFromRotationMatrix(_mb); o.P.copy(o.b[0].position).applyMatrix4(_mb); if (o.yb === o.par) _p.set(0, 0, 1).applyQuaternion(o.Q); else _p.set(0, 0, 1).applyQuaternion(rootQuat(o.yb, _qa)); o.Y.setFromAxisAngle(AY, Math.atan2(_p.x, _p.z)); }
  }
  function softTarget(o, i, c, out) {                 // where point i of a chain would rest, hanging from c
    const g = o.g[i]; out.copy(o.dir[i]).applyQuaternion(o.Q).multiplyScalar(1 - g); _t2.copy(o.dir[i]).applyQuaternion(o.Y).multiplyScalar(g); out.add(_t2);
    if (o.lift && o.out) { _t2.copy(o.out).applyQuaternion(o.Y).multiplyScalar(o.lift * (0.35 + 0.65 * i / Math.max(1, o.b.length - 1))); out.add(_t2); }
    return out.normalize().multiplyScalar(o.len[i]).add(c);
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
        if (_n.y < FLOOR) { const dy = cl(FLOOR - _c.y, -L, L), R = Math.sqrt(Math.max(0, L * L - dy * dy)); _d.set(_n.x - _c.x, 0, _n.z - _c.z); if (_d.lengthSq() < 1e-10) { if (o.out) _d.copy(o.out).applyQuaternion(o.Y); else _d.set(0, 0, -1); } _d.normalize(); _n.set(_c.x + _d.x * R, _c.y + dy, _c.z + _d.z * R); }       // it lies on the floor
        if (still) prev.copy(_n); else prev.copy(cur); cur.copy(_n); _c.copy(cur);
      } }
  }
  function softApply() {
    for (const o of SOFT) { _c.copy(o.P); _qa.copy(o.Q);
      for (let i = 0; i < o.b.length; i++) { _d.copy(o.cur[i]).sub(_c).normalize(); _qb.copy(_qa).invert(); _d.applyQuaternion(_qb); _qc.setFromUnitVectors(o.dir[i], _d); o.b[i].quaternion.copy(_qc); _qa.multiply(_qc); _c.copy(o.cur[i]); } }
  }
  let softAcc = 0;
  function softTick(dt) { softFrames(); softAcc += dt; let n = 0; while (softAcc >= SOFT_H && n < 4) { softStep(false); softAcc -= SOFT_H; n++; } if (softAcc > SOFT_H) softAcc = 0; softApply(); }
  function softSettle() { softFrames(); for (let i = 0; i < 24; i++) softStep(true); softApply(); }       // everything comes to rest at once in the pose she is in

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
  const SHOTS = { glasses: 2.4, hat: 2.6, curtsey: 3.0, twirl: 2.6, herb: 5.0, wave: 3.0, look: 3.6, sickle: 3.4 }, MOVES = ['pose', 'idle', 'walk', 'talk', 'read', 'glasses', 'hat', 'curtsey', 'twirl', 'herb', 'wave', 'look', 'sickle'];
  // Her book (G8, and the rule in her prompts: it is in her LEFT hand; when she lets go of it, it floats open at her left side).
  // bkF: 0 held shut in her left arm .. 1 floating open; bkR: 1 open in front of her to read. Moves that need her left hand let it float.
  const BK_FLOAT = { talk: 1, hat: 1, curtsey: 1, twirl: 1, herb: 1 }, bkP = V3(), bkQ = new THREE.Quaternion(), bkP2 = V3(), bkQ2 = new THREE.Quaternion(), EU = new THREE.Euler(); let bkF = 0, bkR = 0, showProps = true;
  const propVis = (on, sick) => { const m = meshes, shut = bkF < 0.5 && bkR < 0.5; for (const [k, v] of [['bookShut', on && shut], ['bookShutPg', on && shut], ['bookRibbon', on && shut], ['bookOpen', on && !shut], ['bookOpenPg', on && !shut], ['sickleGold', on && sick], ['sickleGrip', on && sick]]) if (m[k]) m[k].visible = !!v && showProps; };
  function bookPlace(dt, N) {
    if (!SK.book) return 0; const k = Math.min(1, dt * 3.2); bkF += ((BK_FLOAT[N] ? 1 : 0) - bkF) * k; bkR += ((N === 'read' ? 1 : 0) - bkR) * k;
    rootQuat(SK.spine3, _qa); carried('spine3', 0.118, 1.150, 0.122, bkP); bkQ.copy(_qa).multiply(_qb.setFromEuler(EU.set(-0.10, 0.50, 0.07, 'YXZ')));                     // held: against the front of her left side
    rootQuat(SK.hips, _qc); _p.set(0, 0, 1).applyQuaternion(_qc); _qc.setFromAxisAngle(AY, Math.atan2(_p.x, _p.z)); carried('hips', 0, 0.96, 0, bkP2).add(_e.set(0.37, 0.10 + 0.018 * Math.sin(clock * 1.7), 0.15).applyQuaternion(_qc));
    bkQ2.copy(_qc).multiply(_qb.setFromEuler(EU.set(-0.55, -1.05 + 0.10 * Math.sin(clock * 0.8), 0, 'YXZ'))); bkP.lerp(bkP2, bkF); bkQ.slerp(bkQ2, bkF);                           // floating: open at her left side, turned to her
    if (bkR > 0.001) { carried('spine3', 0.035, 1.095, 0.300, bkP2); bkQ2.copy(_qa).multiply(_qb.setFromEuler(EU.set(0.93, PI, 0, 'XYZ'))); bkP.lerp(bkP2, bkR); bkQ.slerp(bkQ2, bkR); }   // reading: open in front of her, tipped up to her face
    SK.book.position.copy(bkP); SK.book.quaternion.copy(bkQ); return (1 - bkF) * (1 - bkR);
  }
  const bookPt = (x, y, z, out) => out.set(x, y, z).applyQuaternion(bkQ).add(bkP);
  const pulse = (t, a, b, c, d) => sm(a, b, t) * (1 - sm(c, d, t)), ANK = {}; for (const [S] of SIDES) ANK[S] = SK['foot' + S].userData.rest.clone();
  const tgt = V3(), tg2 = V3(), fv = V3(), nv = V3();
  function pose(o) {
    o = o || {}; mv = { name: 'pose', t: 0 }; wk = 0; lastPose = { arm: o.arm == null ? 15 : o.arm, leg: o.leg || 0 }; const arm = lastPose.arm * DEG - A_POSE, leg = lastPose.leg * DEG;
    restAll(); for (const [S, s] of SIDES) { SK['uarm' + S].rotation.z = s * arm; SK['thigh' + S].rotation.z = s * leg; SK['foot' + S].rotation.z = -s * leg; }
    for (const o2 of SOFT) o2.lift = 0; sync(); softSettle(); root.updateMatrixWorld(true); bkF = 0; bkR = 0; propVis(false, false);       // held still she carries nothing, as in the paintings she is checked against
  }
  function play(name) { if (!MOVES.includes(name) || name === 'pose') { pose(lastPose); return 'pose'; } mv = { name, t: 0 }; return name; }
  // one frame of a move: returns her face { eyes, mouth }
  function body(N, T, dt) {
    restAll(); for (const o of SOFT) o.lift = 0;
    let eyes = 0, mouth = 'rest', plant = 1; const footP = { R: 0, L: 0 }, ank = { R: tgt.clone().copy(ANK.R), L: tgt.clone().copy(ANK.L) };
    wk += ((N === 'walk' ? 1 : 0) - wk) * Math.min(1, dt * 4.5); const go = wk, still = 1 - go;
    // always: arms hanging easy, fingers a little curled, her breath, and a slow shift of her weight when she stands
    const br = Math.sin(clock * 1.5), sway = Math.sin(clock * 0.62), sw2 = Math.sin(clock * 0.41 + 1.3);
    for (const [S, s] of SIDES) { add('uarm' + S, 0, 0, s * (13 * DEG - A_POSE)); add('farm' + S, -0.10, 0, 0); fingers(S, 0.24); add('clav' + S, 0, 0, s * 0.012 * br); }
    add('spine2', 0.010 * br, 0, 0); add('spine3', 0.009 * br, 0, 0);
    SK.hips.position.x += 0.009 * sway * still; add('hips', 0, 0, 0.014 * sway * still); add('spine1', 0, 0, -0.012 * sway * still); add('head', 0.012 * sw2 * still, 0.03 * sw2 * still, 0.014 * sway * still);
    // walking: an unhurried step; her hips turn a little, her arms swing small
    if (go > 0.001) { gph += dt * TAU / 1.12; const A = 0.30, sn = Math.sin(gph), cs = Math.cos(gph); plant *= still;
      for (const [S, s] of SIDES) { const p = gph + (s < 0 ? 0 : PI), si = Math.sin(p), co = Math.cos(p), sw = Math.max(0, co), st = Math.max(0, -co);
        const th = -(A * si + 0.04) * go, kn = (0.95 * Math.pow(sw, 1.3) + 0.18 * Math.pow(Math.max(0, Math.sin(p - 0.5)), 3) * st + 0.04) * go;
        // Her feet (Chris, November 13: her ankles were "not bending the right way at the back of her step"; the Ranger's had the same fault).
        // On the ground her sole lies flat until the leg is too far back for an ankle, then her heel lifts. In the air the foot hangs
        // loose, toes down, and comes up to land on the heel. The ankle is held to 0.26 up and 0.30 down. Her boots are stiff: no toe fold.
        const u = (((p / TAU) % 1) + 1) % 1, onG = sm(0.22, 0.28, u) * (1 - sm(0.72, 0.78, u)), sp = ((((u - 0.75) % 1) + 1) % 1) / 0.5;
        const kn2 = kn + 0.30 * Math.exp(-Math.pow((u - 0.76) / 0.07, 2)) * go;       // her knee is already giving as the foot leaves the ground
        add('thigh' + S, th, 0, 0); add('shin' + S, kn2, 0, 0); add('foot' + S, lerp(lerp(0.24, -0.14, sm(0.55, 1.0, sp)) * go, cl(-(th + kn2), -0.26, 0.30), onG), 0, 0);
        add('uarm' + S, 0.24 * si * go, 0, 0); add('farm' + S, -(0.16 + 0.14 * Math.max(0, -si)) * go, 0, 0); }
      SK.hips.position.y += -0.035 * sn * sn * go; SK.hips.position.x += 0.011 * cs * go;
      add('hips', 0.015 * go, 0.08 * sn * go, 0.03 * cs * go); add('spine1', 0.015 * go, -0.04 * sn * go, -0.018 * cs * go); add('spine2', 0, -0.07 * sn * go, -0.016 * cs * go); add('spine3', 0, -0.04 * sn * go, 0);
      add('neck', -0.02 * go, 0.07 * sn * go, 0); }
    // reaches are gathered here and done after her body is in place: [side, point, weight, swivel], and hands to turn: [side, fingers, palm, weight]
    const reaches = [], aims = [];
    if (N === 'talk') { const k = sm(0, 0.5, T), a1 = Math.sin(T * 3.1), a2 = Math.sin(T * 1.7 + 1), a3 = Math.sin(T * 4.7);
      add('head', 0.035 * a1 * k + 0.02 * k, 0.07 * a2 * k, 0.04 * Math.sin(T * 1.1) * k); add('neck', 0, 0.04 * a2 * k, 0); add('spine3', 0, 0.03 * a2 * k, 0);
      reaches.push(['L', V3(0.13 + 0.02 * a2, 1.03 + 0.03 * a1, 0.25 + 0.02 * a3), 0.95 * k, 0.5]); aims.push(['L', V3(-0.25, 0.22 + 0.16 * a1, 0.9), V3(0.15, 1, -0.1), 0.95 * k]);
      if (clock > mouthAt) { mouthAt = clock + 0.10 + 0.09 * Math.abs(Math.sin(clock * 37.7)); const r = Math.abs(Math.sin(clock * 91.3)); mouthNow = r < 0.30 ? 'rest' : r < 0.66 ? 'open' : r < 0.92 ? 'oo' : 'smile'; }
      mouth = mouthNow; }
    if (N === 'read') { const k = sm(0, 0.7, T), turn = pulse(T % 5.2, 3.6, 4.0, 4.3, 4.7);       // she reads: her head down to the page, a finger following the lines, and now and then she turns a leaf
      add('head', 0.30 * k, 0.05 * Math.sin(T * 0.7) * k, 0); add('neck', 0.12 * k, 0, 0); add('spine3', 0.04 * k, 0, 0); eyes = 0.5 * (k > 0.6 ? 1 : 0); if (T % 9 > 7.6) mouth = 'smile'; }
    if (N === 'sickle') { const k = pulse(T, 0, 0.6, 2.5, 3.3), up = pulse(T, 0.9, 1.4, 1.9, 2.5);       // she lifts her sickle and turns it to the light (the moon pendant will become it when her spells are built)
      add('head', -0.05 * up, -0.14 * k, 0); add('spine3', 0, -0.05 * k, 0);
      reaches.push(['R', V3(-0.21 - 0.03 * up, 1.14 + 0.14 * up, 0.27), k, -0.3]); aims.push(['R', V3(0.10 * up, 0.25 + 0.45 * up, 1), V3(1, 0.1 * Math.sin(T * 3) * up, 0), k]); fingers('R', lerp(0.24, 1.35, sm(0, 0.25, k))); }
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
      add('head', -0.07 * k, 0, 0); add('spine3', -0.04 * k, 0, 0); for (const o of SOFT) if (!o.hair) o.lift = Math.min(0.55, 0.075 * rate); if (k > 0.4) mouth = 'smile'; } else spinWas = 0;
    if (N === 'curtsey') { const k = pulse(T, 0, 0.7, 2.15, 2.9), dip = pulse(T, 0.6, 1.25, 1.75, 2.4);
      SK.hips.position.y -= 0.13 * dip; SK.hips.position.z -= 0.015 * dip; add('hips', 0.08 * dip, 0, 0); add('spine1', 0.09 * dip, 0, 0); add('spine2', 0.07 * dip, 0, 0); add('neck', 0.10 * dip, 0, 0); add('head', 0.20 * dip, 0, 0);
      ank.R.set(lerp(ANK.R.x, 0.05, k), ANK.R.y + 0.03 * k, lerp(ANK.R.z, -0.24, k)); footP.R = 0.55 * k;
      for (const [S, s] of SIDES) { reaches.push([S, V3(s * 0.335, 0.865 - 0.10 * dip, 0.015), k, s * 0.12]); fingers(S, lerp(0.24, 0.95, k)); }
      for (const o of SOFT) if (!o.hair) { const side = Math.abs(Math.sin(o.ch.a)); o.lift = 0.5 * k * Math.pow(side, 3); }
      if (dip > 0.5) mouth = 'smile'; if (dip > 0.85) eyes = 1; }
    if (N === 'herb') { const d1 = pulse(T, 0, 0.9, 3.6, 4.7), rg = pulse(T, 0.6, 1.3, 1.65, 2.25), sml = pulse(T, 2.05, 2.65, 3.25, 3.8), lean = 0.80 * rg + 0.10 * d1 * (1 - rg);
      SK.hips.position.y -= 0.47 * d1; SK.hips.position.z += 0.05 * d1;
      add('spine1', 0.36 * lean, 0, 0); add('spine2', 0.36 * lean, 0, 0); add('spine3', 0.28 * lean, -0.10 * rg, 0); add('neck', -0.10 * rg + 0.06 * sml, 0, 0); add('head', 0.10 * rg + 0.14 * sml, -0.08 * rg, 0);
      ank.L.set(ANK.L.x + 0.01 * d1, ANK.L.y + 0.05 * Math.sin(PI * d1), ANK.L.z + 0.36 * d1); ank.R.set(ANK.R.x - 0.01 * d1, ANK.R.y - 0.015 * d1, ANK.R.z - 0.40 * d1); footP.R = 1.25 * d1; sync();
      const wR = Math.max(rg, sml), a = wR > 1e-4 ? sml / (rg + sml) : 0; fv.set(0.22, 0.86, -0.46).normalize(); carried('head', -0.012, 1.452, 0.128, tg2).addScaledVector(fv, -0.125); tgt.set(-0.15, 0.22, 0.52).lerp(tg2, a);
      reaches.push(['R', tgt.clone(), wR, -0.4]); aims.push(['R', V3(0.05, -0.85, 0.5), V3(0, -0.4, -0.9), rg * (1 - a)]); aims.push(['R', fv.clone(), V3(0.55, 0, -0.83), sml]); fingers('R', lerp(0.24, 0.8, wR));
      reaches.push(['L', () => carried('shinL', ANK.L.x + 0.02, IO_KNEE_Y + 0.085, 0.006, V3()), 0.9 * d1, 0.3]);       // her left hand rests on her raised knee
      if (sml > 0.6) eyes = 1; if (T > 3.0 && T < 4.4) mouth = 'smile'; }
    // her body is in place: plant her feet, then her hands
    sync();
    for (const [S] of SIDES) { ik2(SK['thigh' + S], SK['shin' + S], SK['foot' + S], ank[S], plant, 0, 1); flatFoot(S, footP[S], plant); }
    sync();
    // a hand travels from where it hangs to its point, a little forward on the way so it clears her skirt and her hair, with its elbow bending as it goes
    { const hold = bookPlace(dt, N);
      if (hold > 0.001) { reaches.push(['L', bookPt(0.060, -0.118, -0.012, V3()), hold, 0.25]); aims.push(['L', V3(-0.55, 0.62, 0.55).applyQuaternion(bkQ), V3(-0.45, 0.15, -0.88).applyQuaternion(bkQ), hold]); SK.farmL.rotation.x *= 1; fingers('L', lerp(0.24, 0.75, hold)); }
      if (bkR > 0.001) { const tn = N === 'read' ? pulse(T % 5.2, 3.6, 4.0, 4.3, 4.7) : 0;
        reaches.push(['L', bookPt(0.0, -0.035, -0.050, V3()), bkR, 0.3]); aims.push(['L', V3(-0.25, 0.75, 0.2).applyQuaternion(bkQ), V3(0, 0, 1).applyQuaternion(bkQ), bkR]);
        reaches.push(['R', bookPt(0.085 - 0.10 * tn, -0.085 + 0.05 * Math.sin(T * 0.9) * (1 - tn), 0.085 + 0.03 * tn, V3()), bkR, -0.3]); aims.push(['R', V3(-0.15, 0.7, -0.7).applyQuaternion(bkQ), V3(0, 0.25, -1).applyQuaternion(bkQ), bkR]); fingers('R', lerp(0.24, 0.9, bkR), lerp(0.24, 0.10, bkR)); }
      propVis(true, N === 'sickle' && T > 0.12 && T < 3.25); }
    for (const r of reaches) { const k = r[2]; if (k <= 0.0005) continue; const P = typeof r[1] === 'function' ? r[1]() : r[1], e = k * k * (3 - 2 * k);
      SK['hand' + r[0]].getWorldPosition(_p).applyMatrix4(_inv).lerp(P, e); _p.z += 0.09 * Math.sin(PI * e); reach(r[0], tg2.copy(_p), sm(0, 0.15, k), (r[3] || 0) * e); }
    for (const a of aims) aimHand(a[0], a[1], a[2], a[3]);
    for (const [S] of SIDES) wristFix(S);
    sync(); softTick(dt);
    return { eyes, mouth };
  }
  function animate(a0, a1, a2, a3) {
    let dt = a3 !== undefined ? a3 : a0; dt = dt > 0 ? Math.min(dt, 0.05) : 0; clock += dt;
    let eyes = 0, mouth = 'rest';
    if (mv.name !== 'pose') { mv.t += dt; if (SHOTS[mv.name] && mv.t >= SHOTS[mv.name]) mv = { name: 'idle', t: 0 }; const f = body(mv.name, mv.t, dt); eyes = f.eyes; mouth = f.mouth; }
    if (blinking && clock > blinkAt) { blinkT = clock; blinkAt = clock + 2.2 + 2.6 * Math.abs(Math.sin(clock * 12.9)); }
    const bt = clock - blinkT; eyes = Math.max(eyes, bt < 0.05 ? 0.5 : bt < 0.11 ? 1 : bt < 0.17 ? 0.5 : 0);
    if (talking && mv.name !== 'talk') {
      if (clock > mouthAt) { mouthAt = clock + 0.10 + 0.09 * Math.abs(Math.sin(clock * 37.7)); const r = Math.abs(Math.sin(clock * 91.3)); mouthNow = r < 0.30 ? 'rest' : r < 0.66 ? 'open' : r < 0.92 ? 'oo' : 'smile'; }
      mouth = mouthNow;
      if (mv.name === 'pose') { SK.head.rotation.set(0.030 * Math.sin(clock * 4.4) + 0.015, 0.045 * Math.sin(clock * 2.3 + 1), 0.020 * Math.sin(clock * 1.3)); SK.neck.rotation.set(0, 0.025 * Math.sin(clock * 2.3 + 1), 0); }
    } else if (mv.name === 'pose' && (SK.head.rotation.x || SK.head.rotation.y)) { SK.head.rotation.set(0, 0, 0); SK.neck.rotation.set(0, 0, 0); }
    if (held) { if (held.eyes != null) eyes = held.eyes; if (held.mouth) mouth = held.mouth; }
    const key = eyes + '|' + mouth; if (key !== facePainted) { paintFace(eyes, mouth); facePainted = key; }
  }
  const talk = (on) => { talking = !!on; mouthAt = 0; return talking; };
  const setFace = (eyes, mouth) => { held = eyes == null && !mouth ? null : { eyes, mouth }; facePainted = ''; animate(0); };
  return { root, skeleton, bones, SK, animate, pose, play, moves: MOVES, shots: SHOTS, settle: () => { sync(); softSettle(); root.updateMatrixWorld(true); }, meshes, spin: 0, time: 0, stanceProgress: 1, setStance() {}, talk, setFace, setBlink: (on) => { blinking = !!on; }, setProps: (on) => { showProps = !!on; if (mv.name === 'pose') propVis(false, false); }, get move() { return mv.name; },
    debug: { SK, meshes, cloths: [], headPoint, headHalfW, JH, HC, FC, CHAINS, SOFT, COL }, get triangles() { return triCount; } };
}
