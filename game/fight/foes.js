// foes.js: the three foes of the starter world, each at two weights, under one name: MF_FOES.make(kind, weight).
//   kind:   'wisp' (the engine's "normal"), 'wraith' (the Shadow Wraith, "difficult"), 'great' (the great wraith, "boss")
//   weight: 'light' for a fight seen from the fight distance, 'fine' for close-ups
// The models are Envoi's, unchanged (models/foes/wisp.js and wraith.js). A light wraith is the model's own half detail with every large
// part thinned again by the same step the witches use (points are only removed, never moved, so skin weights and glow stay right).
(function () {
  'use strict';
  function thin(g, ratio, err) {
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
  // what the fight needs to know about each kind: its size (for bars, Fate dust and close shots), how near it comes to strike, and which
  // of its own moves shows each of the engine's moves
  const KINDS = {
    wisp:   { tier: 'normal',    name: 'Wisp',          top: 'top',  h: 0.95, r: 0.34, bar: 1.18, patch: 0.34, reach: 0,   moves: { blow: 'flicker' }, light: 0x9fe8b0 },
    wraith: { tier: 'difficult', name: 'Shadow Wraith', top: 'head', h: 2.0,  r: 0.55, bar: 2.25, patch: 0.6,  reach: 2.3, moves: { blow: 'sweep', heavy: 'grasp' }, light: 0x56ff9c },
    great:  { tier: 'boss',      name: 'Great Wraith',  top: 'head', h: 5.6,  r: 1.3,  bar: 5.9,  patch: 1.5,  reach: 6.0, moves: { blow: 'sweep', crush: 'swallow', eclipse: 'eclipse' }, light: 0xffb768 },
  };
  function make(kind, weight, o) {
    o = o || {}; const fine = weight === 'fine', K = KINDS[kind]; let m;
    if (kind === 'wisp') m = window.makeWisp({ seed: o.seed || 1, level: o.level || 1, detail: fine ? 1 : 0.5 });
    else {
      m = window.makeWraith({ great: kind === 'great', level: o.level, detail: fine ? 1 : 0.5 });
      if (!fine) m.root.traverse((x) => { if (x.isMesh && !x.isPoints && x.geometry.index && x.geometry.index.count > 1800) thin(x.geometry, 0.45, 0.012); });
    }
    // Envoi draws its picture without the screen's brightening step (its renderer's output is left linear) and with no studio reflections.
    // The witches' stage has both, and they turn a black robe pale grey. So a wraith's own materials undo the brightening for themselves
    // and take almost no reflection: it looks here as it does in Envoi. (The wisp is left as the pilot showed it, which Chris has seen.)
    if (kind !== 'wisp') { const seen = new Set(); m.root.traverse((x) => { const mats = x.material ? (Array.isArray(x.material) ? x.material : [x.material]) : [];
      for (const q of mats) { if (seen.has(q) || q.isShaderMaterial || q.isPointsMaterial) continue; seen.add(q); if ('envMapIntensity' in q) q.envMapIntensity = 0.1;
        const old = q.onBeforeCompile, key = q.customProgramCacheKey ? q.customProgramCacheKey() : '';
        q.onBeforeCompile = (sh, r) => { if (old) old(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <encodings_fragment>', 'gl_FragColor.rgb = pow(max(gl_FragColor.rgb, vec3(0.0)), vec3(2.2));\n#include <encodings_fragment>'); };
        q.customProgramCacheKey = () => key + '-mf-linear'; q.needsUpdate = true; } }); }
    m.kind = kind; m.K = K; m.weight = fine ? 'fine' : 'light'; m.tris = count(m.root);
    return m;
  }
  window.MF_FOES = { KINDS, make, byTier: { normal: 'wisp', difficult: 'wraith', boss: 'great' } };
})();
