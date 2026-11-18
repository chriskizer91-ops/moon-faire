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
