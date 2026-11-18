// brambles.js: Moon Faire's three bramble foes, each at two weights, under one name: MF_BRAMBLES.make(kind, weight, opts).
//   kind:   'bramble'   the small one (in a fight it is a wisp by the numbers: the engine's "normal")
//           'flowering' the large one with the flower bud ("difficult": a Shadow Wraith by the numbers)
//           'great'     the great bramble, made from the large one ("boss": a great wraith by the numbers)
//   weight: 'light' for a fight seen from the fight distance, 'fine' for close-ups
//   opts:   { level 1 to 20 (the look only: bigger, darker, longer thorns), size (in place of the kind's own) }
// Chris, November 15, 2026: "Two different brambles and then making the bigger bramble a great bramble ... their attacks
// should just be using the strategy and the numbers that the wraiths use ... different names and different animations but
// mathematically be the same as they would if they were a wraith."
// The models are Envoi's (bramble.js and colossus.js in this folder; their first lines say where from and what changed).
// A light bramble is the model's own low detail with every large part thinned again by the step the witches and the
// wraiths use: points are only removed, never moved, so skin weights and painting stay right.
// Needs THREE (r128), makeBramble, makeBrambleColossus and, for the light weight, MeshoptSimplifier.
(function () {
  'use strict';
  function thin(g, ratio, err) {                // the same step as game/fight/foes.js on the fights branch
    const S = window.MeshoptSimplifier; if (!S || !S.supported || !g.index) return;
    const src = g.index.array instanceof Uint32Array ? g.index.array : new Uint32Array(g.index.array), pos = g.attributes.position.array;
    if (pos.length % 3 || g.attributes.position.isInterleavedBufferAttribute) return;
    const target = Math.max(3, Math.floor(src.length * ratio / 3) * 3);
    let out; try { out = S.simplify(src, pos, 3, target, err, [])[0]; } catch (e) { return; }
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
    g.setIndex(new THREE.BufferAttribute(idx, 1)); g.groups.length = 0;
  }
  const count = (root) => { let t = 0; root.traverse((o) => { if (o.isMesh) t += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); return Math.round(t); };
  // What the fight needs to know about each kind. Names are stand-ins.
  //   tier and asWraith: which of the engine's foes it is by the numbers and the rules
  //   size:   how big it stands here (1 is Envoi's size: the small one 2.5 m tall and 5 m across, the large one 9.4 m and 15 m)
  //   moves:  which of its own moves shows each of the engine's moves
  //   light:  the detail the light weight is built at, and how far its large parts are thinned again
  const KINDS = {
    bramble:   { tier: 'normal',    asWraith: 'wisp',   name: 'Bramble',           size: 0.6,  moves: { blow: 'strike' },                                   light: [0.35, 0.5] },
    flowering: { tier: 'difficult', asWraith: 'wraith', name: 'Flowering Bramble', size: 0.28, moves: { blow: 'lance', heavy: 'slam' },                     light: [0.25, 0.5] },
    great:     { tier: 'boss',      asWraith: 'great',  name: 'Great Bramble',     size: 0.6,  moves: { blow: 'lance', crush: 'briar', eclipse: 'volley' }, light: [0.4, 0.55] },
  };
  const ALSO = { hurt: 'hurt', fall: 'die', appear: 'appear', guard: 'block' };   // the same for all three
  function make(kind, weight, o) {
    o = o || {}; const K = KINDS[kind]; if (!K) throw new Error('no such bramble: ' + kind);
    const fine = weight === 'fine', detail = fine ? 1 : K.light[0], size = o.size > 0 ? +o.size : K.size; let m;
    if (kind === 'bramble') m = window.makeBramble({ detail, size, level: o.level || 1 });
    else if (kind === 'flowering') m = window.makeBrambleColossus({ detail, size, level: o.level || 1 });
    else {
      // the great bramble: the large one's own highest level, with more canes and a taller spire (opts.great), and held
      // in its wrath with its flower open and its heart bare, which the large one only shows for a moment
      m = window.makeBrambleColossus({ great: true, detail, size, level: 20 });
      m.state.wrath = 1; m.state.open = 0.8;
    }
    if (!fine) m.root.traverse((x) => { if (x.isMesh && !x.isPoints && x.geometry.index && x.geometry.index.count > 1800) thin(x.geometry, K.light[1], 0.012); });
    m.kind = kind; m.K = K; m.weight = fine ? 'fine' : 'light'; m.tris = count(m.root);
    m.movesFor = Object.assign({}, ALSO, K.moves);
    m.does = (engineMove) => { const n = m.movesFor[engineMove]; return n ? m.play(n, true) : false; };   // play the engine's move by its own name
    return m;
  }
  window.MF_BRAMBLES = { KINDS, ALSO, make, byTier: { normal: 'bramble', difficult: 'flowering', boss: 'great' } };
})();
