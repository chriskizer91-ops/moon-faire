// lod_fox.js: the lighter weights of the Fox. Each level is a set of switches handed to makeFox as opts.lod (tools/patch_fox.py shows
// where her model reads them). Nothing here changes how she is built at Full. The first half is the same as the Jester's lod.js.
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
    // the Fox's shared materials are two-sided: her frills, the inside of her pouch and her shears' blades are thin sheets seen from both sides
    lod.material = (key, B, K) => {
      if (key === 'matte') return K.sheen(K.std({ vertexColors: true, roughness: 0.84, envMapIntensity: 0.3, side: THREE.DoubleSide }), '#8a7a70', 2.6, 0.25);
      if (key === 'metal') return K.std({ vertexColors: true, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.3, side: THREE.DoubleSide });
      if (key === 'gloss') return K.std({ vertexColors: true, roughness: 0.34, envMapIntensity: 0.9 });
      return null;
    };
    lod.onMesh = (key, m) => { if (L.shadowOnly && !L.shadowOnly[key]) m.castShadow = false; };
    return lod;
  }
  // ---- the Fox's own lists ----
  const TINY = { stitch: 1, eyelet: 1, aglet: 1 };                               // boot stitches, eyelets and lace tips
  const BIG = { curl: 1, scalp: 1, ear: 1, face: 1, hand: 1, arm: 1, skin: 1, emerald: 1, torso: 1, patch: 1, leggings: 1, boot: 1, sole: 1, gear: 1, beltm: 1, frill: 1 };
  const LEVELS = [
    { id: 'full', name: 'Full', note: 'The model as it is today', opts: { detail: 1, textureScale: 1 } },
    { id: 'trim', name: 'Trim', note: 'Half the rings in every part, four-sided ringlets, the smallest boot fittings left off',
      opts: { detail: 0.5, textureScale: 0.75 },
      lod: { hair: { keep: { bun: 0.8, halo: 0.7 }, sides: 4, seg: 0.6, thick: 1.08 },
        simplify: { curl: 1, face: 0.5, bellm: 0.45, woodbead: 0.5, lace: 0.6, '*': 0.8 }, err: 0.004, skip: TINY, pleatK: 2, clothIter: 2 } },
    { id: 'light', name: 'Light', note: 'Every part thinned again, fewer and thicker three-sided ringlets, flounces of a third the points',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { hair: { keep: { bun: 0.5, halo: 0.4 }, sides: 3, seg: 0.55, turns: 0.7, thick: 1.3 },
        simplify: { curl: 1, face: 0.2, hand: 0.5, emerald: 0.4, boot: 0.4, bellm: 0.15, woodbead: 0.2, lace: 0.3, brass: 0.3, nail: 0.4, '*': 0.5 }, err: 0.01, errOf: { bellm: 0.05, woodbead: 0.05, lace: 0.05, brass: 0.05 }, prune: true, keepSpecks: { curl: 1, bellm: 1, woodbead: 1, lace: 1, brass: 1 }, skip: TINY,
        cloth: 0.34, clothMin: 6, pleatK: 2, clothH: 1 / 60, clothMaxSub: 2, clothIter: 2, bend: 0.6, shadowOnly: BIG } },
    { id: 'lightest', name: 'Lightest', note: 'Small parts share three plain materials, a third of her ringlets, flounces of a quarter the points',
      opts: { detail: 0.5, textureScale: 0.5 },
      lod: { hair: { keep: { bun: 0.32, halo: 0.24, hang: 0.8, bang: 0.7 }, sides: 3, seg: 0.45, turns: 0.6, minSeg: 5, thick: 1.6 },
        simplify: { curl: 1, face: 0.1, hand: 0.25, arm: 0.4, emerald: 0.25, torso: 0.5, patch: 0.5, metal: 0.12, gloss: 0.15, matte: 0.3, frame: 0.6, '*': 0.3 }, err: 0.03, errOf: { metal: 0.08, gloss: 0.08, frame: 0.004 }, prune: true, keepSpecks: { curl: 1, metal: 1, gloss: 1, frame: 1 }, skip: Object.assign({ nail: 1 }, TINY),
        merge: { leggings: 'matte', lace: 'matte', sole: 'matte', frill: 'matte', gearIn: 'matte', choker: 'matte', beltm: 'matte', bellm: 'metal', brass: 'metal', steel: 'metal', woodbead: 'gloss' },      // her glasses' frame stays its own part: thinned with the rest of the metal it broke into pieces
        cloth: 0.25, clothMin: 5, pleatK: 1, clothH: 1 / 60, clothMaxSub: 2, clothIter: 2, bend: 0.3,
        shadowOnly: { curl: 1, face: 1, hand: 1, arm: 1, emerald: 1, torso: 1, patch: 1, boot: 1, gear: 1, matte: 1 } } }
  ];
  window.WITCH_LOD = { LEVELS, hooks, simplify, make(level, extra) { const L = typeof level === 'string' ? LEVELS.find((x) => x.id === level) : level; const o = Object.assign({}, L.opts, extra || {}); if (L.lod) o.lod = hooks(L.lod); return makeFox(o); } };
})();
