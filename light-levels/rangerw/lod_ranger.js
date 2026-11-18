// lod_ranger.js: the lighter weights of the Ranger. Each level is a set of switches handed to makeRanger as opts.lod (tools/patch_ranger.py
// shows where her model reads them). Nothing here changes how she is built at Full. The first half is the same as the Jester's and the Fox's.
(function () {
  'use strict';
  // Take triangles out of a finished part. The simplifier only ever removes points, it never moves one or makes a new one, so the
  // painting on the part (its uv), its skin weights and anything else stored on each point stay exactly right.
  function simplify(g, ratio, err, prune) {
    const S = window.MeshoptSimplifier; if (!S || !S.supported || window.WITCH_LOD.thin === false || ratio >= 1) return;
    const src = g.index.array instanceof Uint32Array ? g.index.array : new Uint32Array(g.index.array), pos = g.attributes.position.array;
    const target = Math.max(3, Math.floor(src.length * ratio / 3) * 3);
    let out; try { out = S.simplify(src, pos, 3, target, err == null ? 0.02 : err, prune ? ['Prune'] : [])[0]; } catch (e) { return; }
    if (!out || out.length < 3) return;
    const nv = pos.length / 3, remap = new Int32Array(nv).fill(-1); let n = 0;
    for (let i = 0; i < out.length; i++) { const v = out[i]; if (remap[v] < 0) remap[v] = n++; }
    for (const name in g.attributes) {
      const a = g.attributes[name], k = a.itemSize, A = a.array, B = new A.constructor(n * k);
      for (let v = 0; v < nv; v++) { const r = remap[v]; if (r >= 0) for (let q = 0; q < k; q++) B[r * k + q] = A[v * k + q]; }
      g.setAttribute(name, new THREE.BufferAttribute(B, k, a.normalized));
    }
    const idx = n > 65535 ? new Uint32Array(out.length) : new Uint16Array(out.length);
    for (let i = 0; i < out.length; i++) idx[i] = remap[out[i]];
    g.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  // the colour a painted cloth averages to, for parts that give up their own picture
  function meanColour(mat) {
    const c = new THREE.Color(1, 1, 1);
    try {
      const im = mat.map && mat.map.image;
      if (im && im.width) { const k = document.createElement('canvas'); k.width = k.height = 8; const g = k.getContext('2d'); g.drawImage(im, 0, 0, 8, 8); const d = g.getImageData(0, 0, 8, 8).data; let r = 0, gg = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; } c.setRGB(r / 64 / 255, gg / 64 / 255, b / 64 / 255).convertSRGBToLinear(); }
    } catch (e) { /* a picture that cannot be read keeps white */ }
    if (mat.color) c.multiply(mat.color);
    return c;
  }
  const SHARED = { matte: 1, metal: 1, gloss: 1 };
  function hooks(L) {
    const lod = Object.assign({}, L);
    lod.onGeometry = (key, g, B, K) => {
      if (L.merge && SHARED[key]) {                 // merged parts wear their old colours as paint on each point
        const col = new Float32Array(B.n * 3);
        for (const [start, count, src] of B.src) { const c = meanColour(K.MATS[src] || K.MATS.cloth); for (let i = start; i < start + count; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      }
      const sp = L.simplify || {}, r = sp[key] != null ? sp[key] : sp['*'];
      if (r != null && r < 1) simplify(g, r, (L.errOf && L.errOf[key]) != null ? L.errOf[key] : L.err, L.prune && !(L.keepSpecks && L.keepSpecks[key]));
    };
    // the shared materials are two-sided: straps, blades and the insides of sheaths are thin sheets seen from both sides
    lod.material = (key, B, K) => {
      if (key === 'matte') return K.sheen(K.std({ vertexColors: true, roughness: 0.84, envMapIntensity: 0.3, side: THREE.DoubleSide }), '#8a7a70', 2.6, 0.25);
      if (key === 'metal') return K.std({ vertexColors: true, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.3, side: THREE.DoubleSide });
      if (key === 'gloss') return K.std({ vertexColors: true, roughness: 0.34, envMapIntensity: 0.9 });
      return null;
    };
    // normalScale: smaller pictures make a part's painted creases stand out harder than at Full; a level can calm them
    lod.onMesh = (key, m) => { if (L.shadowOnly && !L.shadowOnly[key]) m.castShadow = false; if (L.normalScale && L.normalScale[key] != null && m.material.normalScale) m.material.normalScale.multiplyScalar(L.normalScale[key]); };
    return lod;
  }
  // ---- the Ranger's own lists ----
  // She has no cloth worked out point by point, so her cost is triangles and separate draws (she is made of about sixty materials).
  const TINY = { stitch: 1, eyelet: 1, aglet: 1, hole: 1 };                      // boot stitches, eyelets, lace tips and the dark of the eyelet holes
  const BIG = { face: 1, hair: 1, torso: 1, skin: 1, form: 1, hand: 1, handR: 1, armL: 1, armR: 1, leggings: 1, lacesl: 1, boot: 1, sole: 1, sock: 1, gear: 1, belt: 1, moon: 1, scab: 1, blade: 1, swordSteel: 1, sheath: 1 };      // the parts big enough to throw a shadow worth drawing
  const BEADS = { charmGold: 1, teal: 1, pearl: 1, amber: 1, crystal: 1, gold: 1, gearBrass: 1, hookBrass: 1, iron: 1, steel: 1, lace: 1, moon: 1, swordGold: 1, swordSteel: 1, knifeSteel: 1, knifeCord: 1, wire: 1, bowGem: 1, swordGem: 1, knifeGem: 1, gem: 1 };      // many small separate pieces: never pruned as specks
  const LEVELS = [
    { id: 'full', name: 'Full', note: 'The model as it is today', opts: { detail: 1, textureScale: 1 } },
    { id: 'trim', name: 'Trim', note: 'Half the rings in every part, the smallest boot fittings left off',
      opts: { detail: 0.5, textureScale: 0.75 },
      lod: { simplify: { face: 0.6, charmGold: 0.4, moon: 0.6, lace: 0.6, iron: 0.6, steel: 0.7, veins: 0.5, wire: 1, lock: 1, lens: 1, '*': 0.85 }, err: 0.004, errOf: { charmGold: 0.03, lace: 0.02 }, skip: TINY } },
    { id: 'light', name: 'Light', note: 'Every part thinned again; charms, buckles and weapons most of all',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { simplify: { face: 0.3, hair: 0.6, boot: 0.85, charmGold: 0.12, teal: 0.3, pearl: 0.4, amber: 0.5, moon: 0.6, lace: 0.3, iron: 0.3, steel: 0.35, gold: 0.35, hookBrass: 0.35, gearBrass: 0.5, swordSteel: 0.4, swordGold: 0.35, knifeSteel: 0.4, knifeCord: 0.4, bowWrap: 0.4, veins: 0.3, nail: 0.4, wire: 0.7, lock: 1, lens: 1, lacesl: 1, '*': 0.5 },
        err: 0.01, errOf: { charmGold: 0.06, teal: 0.05, pearl: 0.05, lace: 0.05, iron: 0.03, steel: 0.03, gold: 0.03, hookBrass: 0.03, wire: 0.004, moon: 0.004, boot: 0.004 }, prune: true, keepSpecks: BEADS, skip: TINY, shadowOnly: BIG, normalScale: { boot: 0.4 } } },
    { id: 'lightest', name: 'Lightest', note: 'Small parts share three plain materials; her glasses, gems, face, hair, lace and leather keep their own',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { simplify: { face: 0.15, hair: 0.4, hand: 0.5, handR: 0.5, torso: 0.6, boot: 0.5, moon: 0.45, metal: 0.11, gloss: 0.3, matte: 0.24, veins: 0.2, wire: 0.6, lock: 0.75, lens: 1, gem: 0.6, lacesl: 1, '*': 0.4 },
        err: 0.03, errOf: { metal: 0.08, gloss: 0.08, wire: 0.004, moon: 0.006, boot: 0.008 }, normalScale: { boot: 0.4 }, prune: true, keepSpecks: Object.assign({ metal: 1, gloss: 1, matte: 1 }, BEADS), skip: Object.assign({ nail: 1, pad: 1 }, TINY),
        // her glasses' frame (wire) and her bow (moon) stay their own parts: thin rods thinned with the rest of the metal break into pieces. The gems keep their own
        // materials because her moves light them.
        merge: { gold: 'metal', charmGold: 'metal', gearBrass: 'metal', hookBrass: 'metal', steel: 'metal', iron: 'metal', blade: 'metal', swordSteel: 'metal', swordGold: 'metal', knifeBlade: 'metal', knifeSteel: 'metal',
          laceband: 'matte', lace: 'matte', keeperB: 'matte', bowWrap: 'matte', swordGrip: 'matte', scab: 'matte', scabStrap: 'matte', knifeCord: 'matte', sheath: 'matte', sole: 'matte', sock: 'matte', belt: 'matte', beltHole: 'matte',
          teal: 'gloss', pearl: 'gloss', amber: 'gloss', crystal: 'gloss' },
        shadowOnly: { face: 1, hair: 1, torso: 1, skin: 1, form: 1, hand: 1, handR: 1, armL: 1, armR: 1, leggings: 1, lacesl: 1, boot: 1, gear: 1, matte: 1, metal: 1, moon: 1 } } }
  ];
  // The pages that show a witch at four weights were written for the Jester's interface (animate(phase, walk, time, dt, run), play(id, force),
  // action, busy, state.hitN, fx, spellLight). This gives the Ranger that face without changing her: she has her own (animate(dt), play(name)).
  function wrap(R) {
    const light = new THREE.PointLight(0x9fd0ff, 0, 3, 1.6), own = {}; for (const k in R.meshes) if (!/Over$/.test(k)) own[k] = R.meshes[k];
    let cur = '', once = false, hitAt = 0;
    const J = { R, root: R.root, fx: new THREE.Group(), spellLight: light, skeleton: R.skeleton, fade: 1, spin: 0, dim: 0, dark: 0, action: '', pending: null, time: 0, target: null, targetDist: 0, state: { hitN: 0 },
      debug: { cloths: [], textures: R.debug.textures, meshes: own }, get busy() { return !!J.action && once; }, get triangles() { return R.triangles; },
      stop() { J.action = ''; once = false; },
      play(id, force, one) { if (R.moves.indexOf(id) < 0) return; J.action = id; once = !!one; cur = id; R.play(id); hitAt = R.shots[id] ? 0.6 * R.shots[id] : 0; },
      animate(phase, wb, time, dt, rb) {
        if (J.action && once && R.shots[J.action] && R.move.t >= R.shots[J.action]) { J.action = ''; once = false; }
        if (J.action && hitAt && R.move.t >= hitAt) { hitAt = 0; J.state.hitN++; }
        const want = J.action || (wb > 0.5 ? (rb > 0.5 ? 'jog' : 'walk') : 'idle');
        if (want !== cur) { cur = want; R.play(want); }
        J.time = R.move.t; R.animate(dt);
      } };
    R.play('idle'); cur = 'idle';
    return J;
  }
  window.WITCH_LOD = { LEVELS, hooks, simplify, wrap,
    raw(level, extra) { const L = typeof level === 'string' ? LEVELS.find((x) => x.id === level) : level; const o = Object.assign({}, L.opts, extra || {}); if (L.lod) o.lod = hooks(L.lod); return makeRanger(o); },
    make(level, extra) { return wrap(this.raw(level, extra)); } };
})();
