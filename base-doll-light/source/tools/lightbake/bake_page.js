// In the test page (test_doll.html?wear=CODE), after the outfit is on: bake the full model's look onto the light model's picture.
// window.LIGHTBAKE(data) -> { albedo, emissive, orm } as data URLs (webp), and the numbers.
// data: { res, parts: [names], drop: {mesh: [target parts]}, body: { pos, nor, uv, idx, part } (base64 typed arrays) }
window.LIGHTBAKE = async function (data) {
  const t0 = performance.now(), THREE = window.THREE, R = T.stage.renderer, RES = data.res || 2048;
  const de = (s, T_) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T_(u.buffer); };
  const L = { pos: de(data.body.pos, Float32Array), nor: de(data.body.nor, Float32Array), uv: de(data.body.uv, Float32Array), idx: de(data.body.idx, Uint32Array), part: de(data.body.part, Uint8Array) };
  T.j.pose({ arm: 15 }); T.j.root.updateMatrixWorld(true);
  // ----- the light model's triangles, by part, in a grid -----
  const NT = L.idx.length / 3, C = 0.02, key = (x, y, z) => ((Math.floor(x / C) + 300) * 600 + Math.floor(y / C) + 300) * 600 + Math.floor(z / C) + 300;
  const tri = new Float32Array(NT * 12);       // a, e1, e2, normal
  const grid = new Map();
  for (let t = 0; t < NT; t++) {
    const a = L.idx[t * 3], b = L.idx[t * 3 + 1], c = L.idx[t * 3 + 2], P = L.pos;
    const ax = P[a * 3], ay = P[a * 3 + 1], az = P[a * 3 + 2], e1 = [P[b * 3] - ax, P[b * 3 + 1] - ay, P[b * 3 + 2] - az], e2 = [P[c * 3] - ax, P[c * 3 + 1] - ay, P[c * 3 + 2] - az];
    let nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0]; const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    tri.set([ax, ay, az, e1[0], e1[1], e1[2], e2[0], e2[1], e2[2], nx, ny, nz], t * 12);
    const xs = [ax, ax + e1[0], ax + e2[0]], ys = [ay, ay + e1[1], ay + e2[1]], zs = [az, az + e1[2], az + e2[2]];
    for (let i = Math.floor(Math.min(...xs) / C); i <= Math.floor(Math.max(...xs) / C); i++) for (let j = Math.floor(Math.min(...ys) / C); j <= Math.floor(Math.max(...ys) / C); j++) for (let k = Math.floor(Math.min(...zs) / C); k <= Math.floor(Math.max(...zs) / C); k++) {
      const kk = ((i + 300) * 600 + j + 300) * 600 + k + 300; let l = grid.get(kk); if (!l) grid.set(kk, (l = [])); l.push(t); }
  }
  const tPart = new Uint8Array(NT); for (let t = 0; t < NT; t++) tPart[t] = L.part[L.idx[t * 3]];
  // barycentric of p in triangle t (in its plane), and the distance along its normal
  const bary = (t, px, py, pz, o) => {
    const q = t * 12, ax = tri[q], ay = tri[q + 1], az = tri[q + 2], v0 = [tri[q + 3], tri[q + 4], tri[q + 5]], v1 = [tri[q + 6], tri[q + 7], tri[q + 8]];
    const v2 = [px - ax, py - ay, pz - az], d00 = v0[0] * v0[0] + v0[1] * v0[1] + v0[2] * v0[2], d01 = v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2], d11 = v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2];
    const d20 = v2[0] * v0[0] + v2[1] * v0[1] + v2[2] * v0[2], d21 = v2[0] * v1[0] + v2[1] * v1[1] + v2[2] * v1[2], den = d00 * d11 - d01 * d01 || 1e-12;
    const v = (d11 * d20 - d01 * d21) / den, w = (d00 * d21 - d01 * d20) / den; o[0] = 1 - v - w; o[1] = v; o[2] = w; o[3] = v2[0] * tri[q + 9] + v2[1] * tri[q + 10] + v2[2] * tri[q + 11]; return o;
  };
  const tmp = [0, 0, 0, 0];
  const nearest = (px, py, pz, nx, ny, nz, allowed) => {
    let best = -1, bs = 1e9; const i0 = Math.floor(px / C), j0 = Math.floor(py / C), k0 = Math.floor(pz / C);
    for (let r = 0; r <= 2 && (best < 0 || r <= 1); r++) {
      for (let i = i0 - r; i <= i0 + r; i++) for (let j = j0 - r; j <= j0 + r; j++) for (let k = k0 - r; k <= k0 + r; k++) {
        if (Math.max(Math.abs(i - i0), Math.abs(j - j0), Math.abs(k - k0)) !== r) continue;
        const l = grid.get(((i + 300) * 600 + j + 300) * 600 + k + 300); if (!l) continue;
        for (const t of l) { if (allowed && !allowed.has(tPart[t])) continue;
          bary(t, px, py, pz, tmp); const u = Math.max(0, -tmp[0]) + Math.max(0, -tmp[1]) + Math.max(0, -tmp[2]);
          const q = t * 12, e = Math.hypot(tri[q + 3], tri[q + 4], tri[q + 5]) + Math.hypot(tri[q + 6], tri[q + 7], tri[q + 8]);
          const facing = nx * tri[q + 9] + ny * tri[q + 10] + nz * tri[q + 11];
          const s = Math.abs(tmp[3]) + u * e * 0.5 + 0.004 * (1 - facing); if (s < bs) { bs = s; best = t; } }
      }
    }
    return best;
  };
  // ----- each full mesh, drawn flat into the light model's picture -----
  const parts = data.parts, partOf = new Map(parts.map((n, i) => [n, i]));
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1), mode = { value: 0 }, made = [];
  let nTri = 0, nMiss = 0;
  T.j.root.traverse((o) => {
    if (!o.isMesh || !o.name || o.name === 'face') return; let vis = true, p = o; while (p) { if (!p.visible) { vis = false; break; } p = p.parent; } if (!vis) return;
    const allowed = partOf.has(o.name) ? new Set([partOf.get(o.name)]) : (data.drop[o.name] ? new Set(data.drop[o.name].map((n) => partOf.get(n)).filter((x) => x !== undefined)) : null);
    if (!partOf.has(o.name) && !data.drop[o.name]) return;
    const g0 = o.geometry, ix = g0.index, n = ix ? Math.min(ix.count, g0.drawRange.count) : g0.attributes.position.count; if (n < 3) return;
    const g = new THREE.BufferGeometry(); g.setIndex(ix ? Array.from(ix.array.subarray(0, n)) : null);
    for (const k in g0.attributes) g.setAttribute(k, g0.attributes[k]);
    const gn = g.toNonIndexed(), P = gn.attributes.position.array, N = gn.attributes.normal ? gn.attributes.normal.array : null, M = P.length / 9;
    const buv = new Float32Array(M * 6), bd = new Float32Array(M * 3);
    for (let t = 0; t < M; t++) {
      const cx = (P[t * 9] + P[t * 9 + 3] + P[t * 9 + 6]) / 3, cy = (P[t * 9 + 1] + P[t * 9 + 4] + P[t * 9 + 7]) / 3, cz = (P[t * 9 + 2] + P[t * 9 + 5] + P[t * 9 + 8]) / 3;
      let nx = 0, ny = 0, nz = 0; if (N) { nx = N[t * 9] + N[t * 9 + 3] + N[t * 9 + 6]; ny = N[t * 9 + 1] + N[t * 9 + 4] + N[t * 9 + 7]; nz = N[t * 9 + 2] + N[t * 9 + 5] + N[t * 9 + 8]; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l; }
      const lt = nearest(cx, cy, cz, nx, ny, nz, allowed); nTri++;
      if (lt < 0) { nMiss++; for (let k = 0; k < 3; k++) { buv[t * 6 + k * 2] = -5; buv[t * 6 + k * 2 + 1] = -5; } continue; }
      const a = L.idx[lt * 3], b = L.idx[lt * 3 + 1], c = L.idx[lt * 3 + 2];
      for (let k = 0; k < 3; k++) { bary(lt, P[t * 9 + k * 3], P[t * 9 + k * 3 + 1], P[t * 9 + k * 3 + 2], tmp);
        buv[t * 6 + k * 2] = tmp[0] * L.uv[a * 2] + tmp[1] * L.uv[b * 2] + tmp[2] * L.uv[c * 2];
        buv[t * 6 + k * 2 + 1] = tmp[0] * L.uv[a * 2 + 1] + tmp[1] * L.uv[b * 2 + 1] + tmp[2] * L.uv[c * 2 + 1];
        bd[t * 3 + k] = tmp[3] + (partOf.has(o.name) ? 0 : 0.002); }       // a part laid onto another (her nails) sits just above it
    }
    gn.setAttribute('aBakeUV', new THREE.Float32BufferAttribute(buv, 2)); gn.setAttribute('aBakeD', new THREE.Float32BufferAttribute(bd, 1));
    const om = o.material, std = /Standard|Physical/.test(om.type), bm = om.clone();
    bm.skinning = false; bm.morphTargets = false; bm.side = THREE.DoubleSide; bm.transparent = false; bm.depthWrite = true; bm.depthTest = true; bm.blending = THREE.NoBlending;
    const prev = om.onBeforeCompile, pk = om.customProgramCacheKey ? om.customProgramCacheKey() : '';
    bm.onBeforeCompile = (sh, r) => {
      if (prev) prev.call(bm, sh, r);
      sh.uniforms.uBakeMode = mode;
      // a piece's own shader may read her bone weights (a glove's two tones): declared here, as skinning is off for the bake
      if (/skinIndex/.test(sh.vertexShader)) sh.vertexShader = '#ifndef USE_SKINNING\nattribute vec4 skinIndex; attribute vec4 skinWeight;\n#endif\n' + sh.vertexShader;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aBakeUV; attribute float aBakeD;')
        .replace('#include <fog_vertex>', '#include <fog_vertex>\ngl_Position = vec4(aBakeUV * 2.0 - 1.0, clamp(0.5 - aBakeD * 8.0, 0.0, 1.0) * 2.0 - 1.0, 1.0);\n#ifndef FLAT_SHADED\n vViewPosition = vNormal;\n#endif');       // seen head-on
      // the rim: the soft light a cloth or her skin catches where it turns away (the sheen wrapper's colour times its strength, and a velvet's sheen)
      const rim = 'vec3 bRim = vec3(0.0);\n' + (sh.uniforms.uSheenC ? 'bRim += uSheenC * uSheenK;\n' : '') + '#ifdef USE_SHEEN\n bRim += sheen * 0.35;\n#endif\n';
      // a velvet's own sheen (MeshPhysicalMaterial.sheen) lights it from every side, not only at the rim: part of it goes into its colour
      const out = std ? rim + 'vec3 bCol = diffuseColor.rgb;\n#ifdef USE_SHEEN\n bCol += sheen * 0.12;\n#endif\nif (uBakeMode < 0.5) gl_FragColor = vec4(pow(max(bCol, 0.0), vec3(1.0 / 2.2)), 1.0);\n else if (uBakeMode < 1.5) gl_FragColor = vec4(pow(max(totalEmissiveRadiance, 0.0), vec3(1.0 / 2.2)), 1.0);\n else if (uBakeMode < 2.5) gl_FragColor = vec4(1.0, roughnessFactor, metalnessFactor, 1.0);\n else gl_FragColor = vec4(clamp(bRim * 3.0, 0.0, 1.0), 1.0);\n return;'
        : 'if (uBakeMode < 0.5) gl_FragColor = vec4(pow(max(diffuseColor.rgb, 0.0), vec3(1.0 / 2.2)), 1.0);\n else if (uBakeMode < 1.5) gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n else if (uBakeMode < 2.5) gl_FragColor = vec4(1.0, 0.85, 0.0, 1.0);\n else gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n return;';
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uBakeMode;')
        .replace(std ? '#include <lights_physical_fragment>' : '#include <output_fragment>', out + '\n' + (std ? '#include <lights_physical_fragment>' : '#include <output_fragment>'));
      if (sh.fragmentShader.indexOf('uBakeMode < 0.5') < 0) console.warn('lightbake: no place for the bake in ' + o.name);
    };
    bm.customProgramCacheKey = () => 'lightbake|' + pk + '|' + om.uuid;
    const mesh = new THREE.Mesh(gn, bm); mesh.frustumCulled = false; scene.add(mesh); made.push(mesh);
  });
  const t1 = performance.now();
  // ----- the three pictures -----
  const rt = new THREE.WebGLRenderTarget(RES, RES, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
  const pics = [], prevRT = R.getRenderTarget(), prevClear = R.getClearColor(new THREE.Color()).clone(), prevA = R.getClearAlpha(), prevAuto = R.autoClear;
  for (const m of [0, 1, 2, 3]) {
    mode.value = m; R.setRenderTarget(rt); R.setClearColor(0x000000, 0); R.autoClear = true; R.clear(true, true, true); R.render(scene, cam);
    const px = new Uint8Array(RES * RES * 4); R.readRenderTargetPixels(rt, 0, 0, RES, RES, px); pics.push(px);
  }
  R.setRenderTarget(prevRT); R.setClearColor(prevClear, prevA); R.autoClear = prevAuto;
  for (const m of made) { m.geometry.dispose(); m.material.dispose(); } rt.dispose();
  // ----- fill the gaps round every piece of the picture from what is beside them (so no seam shows), then to webp -----
  const cover = new Uint8Array(RES * RES); let covered = 0; for (let i = 0; i < RES * RES; i++) if (pics[0][i * 4 + 3] > 0) { cover[i] = 1; covered++; }
  const fill = (px) => {
    const lv = [{ c: new Float32Array(RES * RES * 3), w: new Float32Array(RES * RES), W: RES }];
    for (let i = 0; i < RES * RES; i++) if (cover[i]) { lv[0].w[i] = 1; lv[0].c[i * 3] = px[i * 4]; lv[0].c[i * 3 + 1] = px[i * 4 + 1]; lv[0].c[i * 3 + 2] = px[i * 4 + 2]; }
    while (lv[lv.length - 1].W > 1) { const a = lv[lv.length - 1], W2 = a.W >> 1, c = new Float32Array(W2 * W2 * 3), w = new Float32Array(W2 * W2);
      for (let y = 0; y < W2; y++) for (let x = 0; x < W2; x++) { const o = y * W2 + x; let s = 0;
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const i = (2 * y + dy) * a.W + 2 * x + dx, q = a.w[i]; s += q; c[o * 3] += a.c[i * 3] * q; c[o * 3 + 1] += a.c[i * 3 + 1] * q; c[o * 3 + 2] += a.c[i * 3 + 2] * q; }
        if (s > 0) { c[o * 3] /= s; c[o * 3 + 1] /= s; c[o * 3 + 2] /= s; } w[o] = Math.min(1, s); }
      lv.push({ c, w, W: W2 }); }
    for (let l = lv.length - 2; l >= 0; l--) { const a = lv[l], b = lv[l + 1];
      for (let y = 0; y < a.W; y++) for (let x = 0; x < a.W; x++) { const i = y * a.W + x, q = a.w[i]; if (q >= 1) continue; const j = Math.min(b.W - 1, y >> 1) * b.W + Math.min(b.W - 1, x >> 1);
        for (let ch = 0; ch < 3; ch++) a.c[i * 3 + ch] = a.c[i * 3 + ch] * q + b.c[j * 3 + ch] * (1 - q); a.w[i] = 1; } }
    const cv = document.createElement('canvas'); cv.width = RES; cv.height = RES; const g = cv.getContext('2d'), id = g.createImageData(RES, RES);
    for (let y = 0; y < RES; y++) for (let x = 0; x < RES; x++) { const s = (RES - 1 - y) * RES + x, d = y * RES + x;       // the picture's rows come back bottom first
      id.data[d * 4] = lv[0].c[s * 3]; id.data[d * 4 + 1] = lv[0].c[s * 3 + 1]; id.data[d * 4 + 2] = lv[0].c[s * 3 + 2]; id.data[d * 4 + 3] = 255; }
    g.putImageData(id, 0, 0); return cv.toDataURL('image/webp', 0.9);
  };
  const res = { albedo: fill(pics[0]), emissive: fill(pics[1]), orm: fill(pics[2]), rim: fill(pics[3]) };
  res.stats = { meshes: made.length, highTris: nTri, missed: nMiss, coverage: covered / (RES * RES), mapMs: Math.round(t1 - t0), totalMs: Math.round(performance.now() - t0) };
  return res;
};
