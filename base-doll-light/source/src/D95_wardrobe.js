  // ---------- the wardrobe (November 14, 2026): outfits and hairstyles put on and taken off while the page runs ----------
  // Every outfit or hairstyle is a module, a small script that says DOLLWEAR_DEFS.<code> = { name, kind, build(W) }.
  // wear(code) takes off what she wears, then runs build(W): the module makes its pieces with the tools in W (below), each piece a
  // skinned mesh on her own skeleton, so it moves exactly as she does. Its look comes from its paintings: DOLLWEAR_TEX.<code> holds the
  // outfit's three painted views (front, her right side, back) in one picture, and how each view lines up with her (made by
  // tools/outfit_prep.py). A painted piece takes its colour from the view it faces, where it was seen in the painting's pose: each point
  // is first carried into that pose (arms 32 degrees out, as she stands in the paintings) and the views that could not see it (behind
  // an arm, between the legs) are left out.
  function makeWardrobe(API, X) {
    const { root, skeleton, meshes } = X;
    const DEFS = () => window.DOLLWEAR_DEFS || {}, TEXS = () => window.DOLLWEAR_TEX || {};
    const S = { light: null, outfit: null, hair: 'long', parts: { outfit: [], hair: [] }, skinIdx: {}, vis: { outfit: [], hair: [] }, mats: { outfit: [], hair: [] }, hooks: { outfit: [], hair: [] }, ms: 0 };
    let group = 'outfit';                                  // which list a piece made now belongs to
    const PAINT_POSE = { arm: 30 };
    root.updateMatrixWorld(true); const ROOT0 = root.matrixWorld.clone();

    // ----- weights: which bones carry a point -----
    const wBody = (x, y, z) => DOLL.wAt(x, y, z).w;                              // her trunk, neck and legs, as her skin is carried
    function armFrame(S2, x, y, z) {                                             // where a point lies along her arm at rest
      const s = S2 === 'L' ? 1 : -1, d = armDir[S2], sh = restPts['sh' + S2];
      const px = x - sh.x, py = y - sh.y, pz = z - sh.z, sl = px * d.x + py * d.y + pz * d.z, rx = px - d.x * sl, ry = py - d.y * sl, rz = pz - d.z * sl;
      const ox = s * Math.cos(A_POSE), oy = Math.sin(A_POSE);
      return { sl, a: Math.atan2(rz, rx * ox + ry * oy), r: Math.hypot(rx, ry, rz) };
    }
    const wArmAt = (S2, x, y, z) => { const f = armFrame(S2, x, y, z); return wArm(S2, f.sl, f.a); };
    const wBone = (name) => [BI[name], 1];

    // ----- a piece from a surface: g = { pos, idx, nor?, uv? } (flat arrays), wf(x, y, z, i) = [bone, weight, bone, weight, ...] -----
    function part(key, g, wf, o) {
      o = o || {};
      const pos = g.pos, idx = g.idx, n = pos.length / 3, nor = g.nor || computeNormals(pos, idx, o.weld);
      const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
        const w = wf(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], i); let s = 0; for (let k = 1; k < w.length && k < 8; k += 2) s += w[k];
        for (let k = 0; k < 4; k++) { si[i * 4 + k] = k * 2 < w.length ? w[k * 2] : 0; sw[i * 4 + k] = k * 2 < w.length ? w[k * 2 + 1] / s : 0; }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.uv || new Float32Array(n * 2), 2));
      geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
      geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
      geo.setIndex(n > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
      const m = new THREE.SkinnedMesh(geo, o.mat || std({ color: lin(o.color || '#888888'), roughness: o.rough == null ? 0.8 : o.rough, side: o.double ? THREE.DoubleSide : THREE.FrontSide }));
      m.name = key; m.castShadow = o.shadow !== false; m.receiveShadow = true; m.frustumCulled = false;
      root.add(m); m.bind(skeleton, new THREE.Matrix4());
      const rec = { key, mesh: m, o, painted: !!(m.material.userData && m.material.userData.painted), occluder: o.occluder !== false };
      // put on for a light model (wear(code, keepHair, { light: true })): the piece is made (its hooks and its neighbours may need it) but never
      // drawn, unless the light model keeps it (D.keep: wings, a feather, a mask)
      if (S.light && !S.light.has(key)) { m.visible = false; rec.ghost = true; }
      S.parts[group].push(rec); return rec;
    }
    // a piece never drawn (put on for a light model) is found on a grid this many times coarser: only its outfit's hooks and neighbours use it
    // (a module's own W.snets calls are all for pieces a light model bakes in: shoes, boots, bodices; so they go coarse too). Where an
    // outfit's hooks read those pieces (its boots: M1, D4, X1, X2), wear's opt.exact = 'snets' keeps them exact ('all': nothing coarse)
    const LIGHT_COARSE = 3, coarse = (key, h) => (S.light && S.lightExact !== 'all' && !S.light.has(key) ? h * LIGHT_COARSE : h);
    // a close-fitting piece, as the sports bra and shorts are made: her body swollen by th, kept inside the outline R < 0
    // her body with her feet (DOLL.F stops above the ankle, as her body's skin does): for socks, tights and anything snug over a foot
    const withFeet = (base) => (x, y, z) => { let f = base(x, y, z); if (y < 0.17) f = smin(f, DOLL.fFoot(x < 0 ? -1 : 1, x, y, z), 0.011); return f; };
    const F_FEET = withFeet(DOLL.F), FS_FEET = withFeet(DOLL.Fsnug);
    function snug(key, R, th, box, h, o) {
      const F = o && o.feet ? F_FEET : DOLL.F, Fs = o && o.feet ? FS_FEET : DOLL.Fsnug;
      const G = (x, y, z) => { const r = R(x, y, z); return smax(Fs(x, y, z) - th(x, y, z) - 0.0011 * Math.exp(-r * r / 1.6e-5), r, 0.0022); };
      const g = DOLL.snets(G, box, coarse(key, h || 0.0045));
      const keep = [], used = new Int32Array(g.nv).fill(-1), pos = [], nor = [], W = [];
      for (let t = 0; t < g.tris.length; t += 3) {
        let inside = 0; for (let k = 0; k < 3; k++) { const v = g.tris[t + k]; if (F(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]) < -0.0012) inside++; }
        if (inside < 3) keep.push(g.tris[t], g.tris[t + 1], g.tris[t + 2]);
      }
      const idx = [];
      for (const v of keep) {
        if (used[v] < 0) {
          used[v] = pos.length / 3; const x = g.pos[v * 3], y = g.pos[v * 3 + 1], z = g.pos[v * 3 + 2];
          pos.push(x, y, z); nor.push(g.nor[v * 3], g.nor[v * 3 + 1], g.nor[v * 3 + 2]);
          const f = F(x, y, z), bx = x - g.nor[v * 3] * f, by = y - g.nor[v * 3 + 1] * f, bz = z - g.nor[v * 3 + 2] * f;
          W.push(o && o.wf ? o.wf(bx, by, bz) : wBody(bx, by, bz));
        }
        idx.push(used[v]);
      }
      return part(key, { pos, idx, nor }, (x, y, z, i) => W[i], o);
    }
    // any closed surface G(x, y, z) < 0 inside, found on a grid of step h in box [x0, x1, y0, y1, z0, z1]; o.keep(x, y, z) may drop triangles
    function surface(key, G, box, h, wf, o) {
      o = o || {};
      const g = DOLL.snets(G, box, coarse(key, h)), pos = [], nor = [], used = new Int32Array(g.nv).fill(-1), idx = [];
      for (let t = 0; t < g.tris.length; t += 3) {
        if (o.keep) { let ok = false; for (let k = 0; k < 3; k++) { const v = g.tris[t + k]; if (o.keep(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2])) { ok = true; break; } } if (!ok) continue; }
        for (let k = 0; k < 3; k++) { const v = g.tris[t + k];
          if (used[v] < 0) { used[v] = pos.length / 3; pos.push(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]); nor.push(g.nor[v * 3], g.nor[v * 3 + 1], g.nor[v * 3 + 2]); }
          idx.push(used[v]); }
      }
      return part(key, { pos, idx, nor }, wf, o);
    }
    // a sleeve: a tube round her rest arm S ('R' or 'L') from sl0 to sl1 metres down it (0 is the ball of her shoulder, about 0.45 the wrist).
    // off(sl, a) is how far out from her skin it stands (a: round the arm, 0 the outer side, PI/2 the front). Open at both ends unless o.capA.
    function sleeve(key, S2, sl0, sl1, off, o) {
      o = o || {};
      const NS = o.ns || 40, NU = o.nu || 28, rings = [], ss = [];
      for (let i = 0; i <= NS; i++) {
        const sl = lerp(sl0, sl1, i / NS), ring = [];
        const c = armPt(S2, sl, 0), c2 = armPt(S2, sl, PI), ax = [(c[0] + c2[0]) / 2, (c[1] + c2[1]) / 2, (c[2] + c2[2]) / 2];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, p = armPt(S2, sl, a), dx = p[0] - ax[0], dy = p[1] - ax[1], dz = p[2] - ax[2], L = Math.hypot(dx, dy, dz) || 1, e = off(sl, a);
          ring.push([p[0] + dx / L * e, p[1] + dy / L * e, p[2] + dz / L * e]); }
        rings.push(ring); ss.push(sl);
      }
      const g = loft(rings, { capA: !!o.capA }), cols = NU + 1;
      // face outward: the first band's triangles should face away from the arm's middle
      { const nor = computeNormals(g.pos, g.idx), r0 = rings[Math.floor(NS / 2)], i0 = Math.floor(NS / 2) * cols; let sgn = 0;
        const c0 = r0.reduce((a, p) => [a[0] + p[0] / NU, a[1] + p[1] / NU, a[2] + p[2] / NU], [0, 0, 0]);
        for (let j = 0; j < NU; j++) { const v = i0 + j; sgn += nor[v * 3] * (g.pos[v * 3] - c0[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c0[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c0[2]); }
        if (sgn < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; } }
      return part(key, g, (x, y, z, i) => i < ss.length * cols ? wArm(S2, ss[Math.floor(i / cols)], ((i % cols) / NU) * TAU) : wArm(S2, ss[0]), Object.assign({ out: null }, o));
    }

    // ----- what she has on under it: skin that can never be seen is not drawn; her own pieces can be hidden; a mesh can borrow a material -----
    const SKIN_KEYS = ['dollTrunk', 'dollLeg', 'dollFoot', 'toenail', 'arm'];
    // Her skin's triangles drawn now = all of them, less the skin under the sports bra and shorts while those are shown, less every
    // triangle whose three corners (at rest) satisfy a hideSkin rule of what she wears. Worked out again whenever any of that changes.
    const FULL = {}; for (const k of SKIN_KEYS) if (meshes[k]) FULL[k] = meshes[k].geometry.userData.fullIndex || meshes[k].geometry.index.array.slice();
    const preds = { outfit: [], hair: [] }, baseHidden = { outfit: new Set(), hair: new Set() };
    function refreshSkin() {
      const rules = preds.outfit.concat(preds.hair), hid = new Set([...baseHidden.outfit, ...baseHidden.hair]);
      for (const key in FULL) { const m = meshes[key], g = m.geometry, P = g.attributes.position.array, full = FULL[key], n = full.length / 3, drop = new Uint8Array(n);
        const cut = WEAR.cut && WEAR.cut[key]; if (cut) for (const b in cut) if (!hid.has(b)) for (const t of cut[b]) drop[t] = 1;
        const mine = rules.filter((r) => !r.keys || r.keys.includes(key));
        if (mine.length) for (let t = 0; t < n; t++) { if (drop[t]) continue; for (const r of mine) { let all = true; for (let k = 0; k < 3; k++) { const v = full[t * 3 + k]; if (!r.pred(P[v * 3], P[v * 3 + 1], P[v * 3 + 2])) { all = false; break; } } if (all) { drop[t] = 1; break; } } }
        const keep = []; for (let t = 0; t < n; t++) if (!drop[t]) keep.push(full[t * 3], full[t * 3 + 1], full[t * 3 + 2]);
        g.setIndex(P.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(keep, 1) : new THREE.Uint16BufferAttribute(keep, 1)); }
    }
    function hideSkin(pred, keys) { preds[group].push({ pred, keys: keys || null }); refreshSkin(); }
    function hideMeshes(keys) { let base = false;
      for (const k of keys) { const m = meshes[k]; if (m && m.visible) { m.visible = false; S.vis[group].push(m); } if (k === 'wearBra' || k === 'wearShorts') { baseHidden[group].add(k); base = true; } }
      if (base) refreshSkin(); }
    function swapMat(key, mat) { const m = meshes[key]; if (!m) return; S.mats[group].push([m, m.material]); m.material = mat; }
    function onFrame(fn) { S.hooks[group].push(fn); }
    let afterFns = [];
    function afterPaint(fn) { afterFns.push(fn); }        // fn(parts) runs once the painted pieces know their painting coordinates (aPP, aPN, aPE): to adjust which views a piece takes

    // ----- the painted look -----
    // paint(o): a material that takes its colour from the module's paintings. o.tex the texture's code (default: the module's own);
    // o.rough, o.metal, o.color (multiplies the painting: '#ffffff' leaves it), o.emis (how much of the painting it shows even in shade),
    // o.double (both sides drawn: thin cloth whose inside shows), o.alpha (see-through: the painting's own alpha, for wings).
    const texCache = {};
    // for a light model the paintings are not loaded (they are baked into it): a piece that is never drawn gets a blank stand-in
    let texStub = null;
    const stubTex = () => texStub || (texStub = { t: new THREE.Texture(), cleaned: true,
      T: { W: 1, H: 1, views: Object.fromEntries(['front', 'back', 'side'].map((v) => [v, { c0: 0, kc: 1, r0: 0, k: 1, rect: [0, 0, 1, 1] }])) } });
    function texOf(code) {
      if (texCache[code]) return texCache[code];
      const T0 = TEXS()[code]; if (!T0 && S.light) return stubTex(); if (!T0) throw new Error('no paintings loaded for ' + code);
      const img = new Image(); img.src = T0.atlas;
      const t = new THREE.Texture(img); img.onload = () => { t.needsUpdate = true; };
      if (img.complete) t.needsUpdate = true;
      t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.flipY = true;
      return (texCache[code] = { t, T: T0 });
    }
    const PAINT_GLSL = `
      varying vec3 vPP; varying vec3 vPN; varying vec3 vPE;
      uniform vec4 uF; uniform vec4 uB; uniform vec4 uS; uniform vec4 uFr; uniform vec4 uBr; uniform vec4 uSr; uniform vec2 uAt;
      vec2 atUV(vec2 p, vec4 r) { p = clamp(p, r.xy, r.zw); return vec2(p.x / uAt.x, 1.0 - p.y / uAt.y); }
      vec4 paintColor(sampler2D m) {
        vec3 n = normalize(vPN);
        float wF = max(n.z, 0.0), wB = max(-n.z, 0.0), wS = n.x * n.x; wF *= wF * vPE.x; wB *= wB * vPE.y; wS *= vPE.z;
        float sum = wF + wB + wS;
        float lo = 1.0 - smoothstep(0.0, 0.06, sum);       // where no view sees it well (tops of shoulders, under a sleeve), front and back fade in smoothly
        wF += lo * (max(n.z, 0.0) * vPE.x + 0.01); wB += lo * (max(-n.z, 0.0) * vPE.y + 0.01); sum = wF + wB + wS;
        vec2 pf = vec2(uF.x + uF.y * vPP.x, uF.z - uF.w * vPP.y), pb = vec2(uB.x + uB.y * vPP.x, uB.z - uB.w * vPP.y), ps = vec2(uS.x + uS.y * vPP.z, uS.z - uS.w * vPP.y);
        return (wF * texture2D(m, atUV(pf, uFr)) + wB * texture2D(m, atUV(pb, uBr)) + wS * texture2D(m, atUV(ps, uSr))) / sum;
      }`;
    function paint(o) {
      o = o || {};
      (S.texUsed = S.texUsed || new Set()).add(o.tex || S.building); if (o.alpha) texOf(o.tex || S.building).cleaned = true;       // a see-through painting keeps its outline: not cleaned
      const { t, T: T0 } = texOf(o.tex || S.building), V = T0.views, U = {
        uF: { value: new THREE.Vector4(V.front.c0, V.front.kc, V.front.r0, V.front.k) }, uB: { value: new THREE.Vector4(V.back.c0, V.back.kc, V.back.r0, V.back.k) },
        uS: { value: new THREE.Vector4(V.side.c0, V.side.kc, V.side.r0, V.side.k) },
        uFr: { value: new THREE.Vector4(...V.front.rect) }, uBr: { value: new THREE.Vector4(...V.back.rect) }, uSr: { value: new THREE.Vector4(...V.side.rect) },
        uAt: { value: new THREE.Vector2(T0.W, T0.H) } };
      const P = o.metal != null || o.clearcoat ? phys : std;
      const mat = P(Object.assign({ map: t, color: lin(o.color || '#c8c0c2'), emissive: lin('#ffffff'), emissiveMap: t, emissiveIntensity: o.emis == null ? 0.26 : o.emis,
        roughness: o.rough == null ? 0.78 : o.rough, metalness: o.metal || 0, envMapIntensity: o.env == null ? 0.25 : o.env, side: o.double ? THREE.DoubleSide : THREE.FrontSide },
        o.alpha ? { transparent: true, alphaTest: 0.02, depthWrite: false } : {}, o.clearcoat ? { clearcoat: o.clearcoat, clearcoatRoughness: 0.3 } : {}));
      mat.userData.painted = true;
      mat.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aPP; attribute vec3 aPN; attribute vec3 aPE; varying vec3 vPP; varying vec3 vPN; varying vec3 vPE;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPP = aPP; vPN = aPN; vPE = aPE;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + PAINT_GLSL)
          .replace('#include <map_fragment>', 'vec4 _pc = paintColor(map);\ndiffuseColor *= mapTexelToLinear(_pc);')
          .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance *= mapTexelToLinear(_pc).rgb;');
      };
      mat.customProgramCacheKey = () => 'dollPaint';
      return mat;
    }

    // ----- finish: carry every painted piece into the paintings' pose, and work out which views could see each point -----
    const _v = new THREE.Vector3(), _w = new THREE.Vector3();
    function skinnedAll(m, inv, noN) {                          // every point of a mesh where it is now (her root's own space), and its direction
      const P = m.geometry.attributes.position, N = m.geometry.attributes.normal, n = P.count, out = new Float32Array(n * 3), on = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        m.boneTransform(i, _v); _v.applyMatrix4(inv); out[i * 3] = _v.x; out[i * 3 + 1] = _v.y; out[i * 3 + 2] = _v.z;
        if (N && !noN) { _w.fromBufferAttribute(P, i); const sx = _w.x, sy = _w.y, sz = _w.z; P.setXYZ(i, sx + N.getX(i) * 0.003, sy + N.getY(i) * 0.003, sz + N.getZ(i) * 0.003);
          m.boneTransform(i, _w); _w.applyMatrix4(inv); P.setXYZ(i, sx, sy, sz);
          const dx = _w.x - _v.x, dy = _w.y - _v.y, dz = _w.z - _v.z, L = Math.hypot(dx, dy, dz) || 1; on[i * 3] = dx / L; on[i * 3 + 1] = dy / L; on[i * 3 + 2] = dz / L; }
      }
      return { p: out, n: on };
    }
    // ----- the paintings, cleaned of her bare arms and hands -----
    // A painting shows her arms over or beside the cloth: in the side view her arm and hand hang over the side of the dress at her hips.
    // A piece that is not on her arm would take their skin colour there (pink patches on the sides of a skirt). So once per painting,
    // in the paintings' pose, her bare arms and her hands (painted bare or in plain gloves)
    // are drawn into each view (the side view: her right arm only, the one it sees), widened (the painted arm hangs a little elsewhere),
    // and filled from the cloth round them (push-pull), so every piece reads cloth there.
    function cleanArms(code, inv, cover) {
      const rec = texOf(code); if (rec.cleaned) return; rec.cleaned = true;
      const T0 = rec.T, V = T0.views, tris = { front: [], side: [], back: [] };
      // where a piece lies on her arm (a sleeve, a puff, a strap over her shoulder, a glove's cuff: any piece within 2.5 cm of it) the painting
      // shows that piece, not her arm: there it is not cleaned. Her hands always are, unless a piece lies right on them (a painted glove).
      const CC = 0.025, ck = (x, y, z) => ((Math.floor(x / CC) + 200) * 400 + Math.floor(y / CC) + 200) * 400 + Math.floor(z / CC) + 200, cells = new Map();
      for (const r of cover) { const p = r.sk.p; for (let i = 0; i < p.length; i += 3) { const k0 = ck(p[i], p[i + 1], p[i + 2]); let L = cells.get(k0); if (!L) cells.set(k0, (L = [])); L.push(p[i], p[i + 1], p[i + 2]); } }
      const covered = (q, R = CC) => { const ix = Math.floor(q[0] / CC), iy = Math.floor(q[1] / CC), iz = Math.floor(q[2] / CC);
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const L = cells.get(((ix + a + 200) * 400 + iy + b + 200) * 400 + iz + c + 200); if (!L) continue;
          for (let i = 0; i < L.length; i += 3) { const dx = L[i] - q[0], dy = L[i + 1] - q[1], dz = L[i + 2] - q[2]; if (dx * dx + dy * dy + dz * dz < R * R) return true; } }
        return false; };
      for (const k of ['arm', 'hand', 'handR']) {
        const m = meshes[k]; if (!m || !m.visible) continue;       // a glove lent to her hand is a plain colour: the painted glove goes too
        const p = skinnedAll(m, inv, true).p, ix = m.geometry.index, n = ix ? Math.min(ix.count, m.geometry.drawRange.count) : p.length / 3;
        for (let t = 0; t + 2 < n; t += 3) {
          const a = ix ? ix.array[t] : t, b = ix ? ix.array[t + 1] : t + 1, c = ix ? ix.array[t + 2] : t + 2, P = [a, b, c].map((i) => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]]);
          const pr = (v, q) => (v === 'side' ? [V[v].c0 + V[v].kc * q[2], V[v].r0 - V[v].k * q[1]] : [V[v].c0 + V[v].kc * q[0], V[v].r0 - V[v].k * q[1]]);
          if (k === 'arm' && (P.some((q) => q[1] > 1.22) || P.every((q) => covered(q)))) continue;       // not her shoulder: a sleeve's or strap's top is painted there
          if (k !== 'arm' && P.every((q) => covered(q, 0.012))) continue;       // a painted glove piece over her hand
          tris.front.push(P.map((q) => pr('front', q))); tris.back.push(P.map((q) => pr('back', q)));
          if (P[0][0] < 0) tris.side.push(P.map((q) => pr('side', q)));
        }
      }
      const run = () => {
        const img = rec.t.image, Wd = T0.W, Hd = T0.H; if (!img || !img.naturalWidth) return;
        const cv = document.createElement('canvas'); cv.width = Wd; cv.height = Hd; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, Wd, Hd);
        const id = g.getImageData(0, 0, Wd, Hd), D = id.data;
        // the arms drawn small (a quarter of the painting's size), then widened by DIL, then read at full size
        const q = 0.25, mw = Math.ceil(Wd * q), mh = Math.ceil(Hd * q), mc = document.createElement('canvas'); mc.width = mw; mc.height = mh; const mg = mc.getContext('2d');
        mg.fillStyle = '#fff';
        for (const v of ['front', 'side', 'back']) {
          const r = V[v].rect; mg.save(); mg.beginPath(); mg.rect((r[0] - 0.5) * q, (r[1] - 0.5) * q, (r[2] - r[0] + 1) * q, (r[3] - r[1] + 1) * q); mg.clip();
          mg.beginPath(); for (const T3 of tris[v]) {       // every triangle turned the same way round, so front and back faces add up instead of cancelling
            const ar = (T3[1][0] - T3[0][0]) * (T3[2][1] - T3[0][1]) - (T3[2][0] - T3[0][0]) * (T3[1][1] - T3[0][1]), B = ar < 0 ? T3[2] : T3[1], Cc = ar < 0 ? T3[1] : T3[2];
            mg.moveTo(T3[0][0] * q, T3[0][1] * q); mg.lineTo(B[0] * q, B[1] * q); mg.lineTo(Cc[0] * q, Cc[1] * q); mg.closePath(); }
          mg.fill(); mg.restore();
        }
        // widened 3.5 cm to either side, 3 cm up and 5 cm down: the painted arms are shorter or longer than hers, and hang a little forward or back
        const m0 = mg.getImageData(0, 0, mw, mh).data, m1 = new Uint8Array(mw * mh), kq = V.side.k * q, Rx = Math.max(1, Math.round(0.035 * kq)), Ru = Math.max(1, Math.round(0.03 * kq)), Rd = Math.max(1, Math.round(0.05 * kq)), offs = [];
        for (let dy = -Ru; dy <= Rd; dy++) for (let dx = -Rx; dx <= Rx; dx++) { const ry = dy < 0 ? Ru : Rd; if ((dx * dx) / (Rx * Rx) + (dy * dy) / (ry * ry) <= 1.02) offs.push(dy * mw + dx, dx); }
        for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) { if (m0[(y * mw + x) * 4] < 128) continue; const i = y * mw + x;
          for (let o = 0; o < offs.length; o += 2) { const xx = x + offs[o + 1], j = i + offs[o]; if (xx >= 0 && xx < mw && j >= 0 && j < mw * mh) m1[j] = 1; } }
        rec.armMask = { m1, mw, mh, q };       // kept for looking at
        const hole = (x, y) => m1[Math.min(mh - 1, (y * q) | 0) * mw + Math.min(mw - 1, (x * q) | 0)] === 1;
        for (const v of ['front', 'side', 'back']) {        // each view on its own, so no colour crosses from one view to the next
          const r = V[v].rect, x0 = Math.max(0, Math.floor(r[0])), y0 = Math.max(0, Math.floor(r[1])), x1 = Math.min(Wd, Math.ceil(r[2]) + 1), y1 = Math.min(Hd, Math.ceil(r[3]) + 1);
          const w = x1 - x0, h = y1 - y0; let any = false;
          const col = new Float32Array(w * h * 3), wt = new Float32Array(w * h);
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const j = (y0 + y) * Wd + x0 + x, i = y * w + x, hl = D[j * 4 + 3] < 128 || hole(x0 + x, y0 + y); if (hl) any = true;
            if (!hl) { wt[i] = 1; col[i * 3] = D[j * 4]; col[i * 3 + 1] = D[j * 4 + 1]; col[i * 3 + 2] = D[j * 4 + 2]; } }
          if (!any) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) D[(y * Wd + x) * 4 + 3] = 255; continue; }
          const was = wt.slice(), filled = pushPull(col, wt, w, h); wt.set(was);

          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const j = (y0 + y) * Wd + x0 + x, i = y * w + x;
            D[j * 4 + 3] = 255; if (wt[i] === 0) { D[j * 4] = filled[i * 3]; D[j * 4 + 1] = filled[i * 3 + 1]; D[j * 4 + 2] = filled[i * 3 + 2]; } }
        }
        g.putImageData(id, 0, 0); rec.t.image = cv; rec.t.needsUpdate = true;
      };
      const img = rec.t.image; if (img && img.complete && img.naturalWidth) run(); else if (img) img.addEventListener('load', run, { once: true });
    }
    // fill the holes (weight 0) of a picture from what is round them, smoothly: halve until there is nothing left to fill, then come back up
    function pushPull(col, wt, w, h) {
      const lv = [{ c: col, w: wt, W: w, H: h }];
      while (lv[lv.length - 1].W > 2 && lv[lv.length - 1].H > 2) {
        const a = lv[lv.length - 1], W2 = a.W >> 1, H2 = a.H >> 1, c = new Float32Array(W2 * H2 * 3), ww = new Float32Array(W2 * H2);
        for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { let s = 0; const o = y * W2 + x;
          for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const i = (2 * y + dy) * a.W + 2 * x + dx, q = a.w[i]; s += q; c[o * 3] += a.c[i * 3] * q; c[o * 3 + 1] += a.c[i * 3 + 1] * q; c[o * 3 + 2] += a.c[i * 3 + 2] * q; }
          if (s > 0) { c[o * 3] /= s; c[o * 3 + 1] /= s; c[o * 3 + 2] /= s; } ww[o] = Math.min(1, s); }
        lv.push({ c, w: ww, W: W2, H: H2 });
      }
      for (let l = lv.length - 2; l >= 0; l--) {
        const a = lv[l], b = lv[l + 1];
        for (let y = 0; y < a.H; y++) for (let x = 0; x < a.W; x++) { const i = y * a.W + x, q = a.w[i]; if (q >= 1) continue;
          const bx = Math.min(b.W - 1, Math.max(0, (x - 0.5) / 2)), by = Math.min(b.H - 1, Math.max(0, (y - 0.5) / 2)), x0 = Math.floor(bx), y0 = Math.floor(by), x1 = Math.min(b.W - 1, x0 + 1), y1 = Math.min(b.H - 1, y0 + 1), fx = bx - x0, fy = by - y0;
          for (let ch = 0; ch < 3; ch++) {
            const u = (b.c[(y0 * b.W + x0) * 3 + ch] * (1 - fx) + b.c[(y0 * b.W + x1) * 3 + ch] * fx) * (1 - fy) + (b.c[(y1 * b.W + x0) * 3 + ch] * (1 - fx) + b.c[(y1 * b.W + x1) * 3 + ch] * fx) * fy;
            a.c[i * 3 + ch] = a.c[i * 3 + ch] * q + u * (1 - q); }
          a.w[i] = 1; }
      }
      return lv[0].c;
    }
    function finish(pp) {
      const all = S.parts.outfit.concat(S.parts.hair), painted = all.filter((r) => r.painted && !r.ghost);
      // a piece never drawn (put on for a light model) gets blank painting coordinates, so what adjusts them after (afterPaint) still finds them
      for (const r of all) if (r.ghost && r.painted && !r.mesh.geometry.attributes.aPP) { const g = r.mesh.geometry, n = g.attributes.position.count;
        for (const a of ['aPP', 'aPN', 'aPE']) g.setAttribute(a, new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3)); }
      if (!painted.length) return;
      pose0.call(API, pp || PAINT_POSE); root.updateMatrixWorld(true); skeleton.update();     // the paintings' pose, without the outfit's own frame hooks (heels)
      // boneTransform gives a point where her bones put it, in the frame her bones were bound in (her root as it stood then, ROOT0);
      // brought into her root's own frame now, so a point at rest lands exactly on its rest position
      const inv = ROOT0.clone().multiply(new THREE.Matrix4().copy(root.matrixWorld).invert());
      // what can hide a painted point: every piece she wears, and her legs and feet (not her bare arms and hands: the paintings are
      // cleaned of them below, so the cloth behind a hanging arm reads the side painting's cloth, not a patch from the front and back)
      const occ = [];
      for (const r of all) if (r.occluder) occ.push({ m: r.mesh, rec: r });
      for (const k of ['dollLeg', 'dollFoot']) if (meshes[k] && meshes[k].visible) occ.push({ m: meshes[k] });
      const C = 0.006, key = (a, b) => (Math.floor(a / C) + 600) * 2000 + Math.floor(b / C) + 600;
      const maxZ = new Map(), minZ = new Map(), minX = new Map(), maxX = new Map();
      const up = (M, k, v, f) => { const q = M.get(k); if (q === undefined || f(v, q)) M.set(k, v); };
      for (const o of occ) {
        const sk = o.rec && o.rec.sk ? o.rec.sk : skinnedAll(o.m, inv, !(o.rec && o.rec.painted)); if (o.rec) o.rec.sk = sk; const p = sk.p;
        for (let i = 0; i < p.length; i += 3) { const x = p[i], y = p[i + 1], z = p[i + 2];
          up(maxZ, key(x, y), z, (a, b) => a > b); up(minZ, key(x, y), z, (a, b) => a < b); up(minX, key(z, y), x, (a, b) => a < b); up(maxX, key(z, y), x, (a, b) => a > b); }
      }
      const near = (M, a, b, f, d) => { let v = d; const ia = Math.floor(a / C) + 600, ib = Math.floor(b / C) + 600;
        for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) { const q = M.get((ia + da) * 2000 + ib + db); if (q !== undefined) v = f(v, q); } return v; };
      const ex = (d) => 1 - sm(0.004, 0.012, d);
      for (const r of painted) {
        const sk = r.sk || skinnedAll(r.mesh, inv), p = sk.p, n = sk.n, N = p.length / 3, E = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) { const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2];
          E[i * 3] = ex(near(maxZ, x, y, Math.max, z) - z); E[i * 3 + 1] = ex(z - near(minZ, x, y, Math.min, z));
          E[i * 3 + 2] = n[i * 3] < 0 ? ex(x - near(minX, z, y, Math.min, x)) : ex(near(maxX, z, y, Math.max, x) - x); }
        const g = r.mesh.geometry;
        g.setAttribute('aPP', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('aPN', new THREE.Float32BufferAttribute(n, 3)); g.setAttribute('aPE', new THREE.Float32BufferAttribute(E, 3));
      }
      // her bare arms and hands as the paintings show them are no cloth: the paintings are cleaned of them once, for this outfit
      if (S.texUsed) { if (!S.light) for (const code of S.texUsed) cleanArms(code, inv, S.parts.outfit.filter((r) => r.sk)); S.texUsed.clear(); }
      for (const r of all) delete r.sk;
      pose0.call(API, { arm: 15 });
    }

    // ----- taking off -----
    function takeOff(gr) {
      for (const r of S.parts[gr]) { root.remove(r.mesh); r.mesh.geometry.dispose(); if (r.mesh.material && !r.o.keepMat) r.mesh.material.dispose(); }
      S.parts[gr] = [];
      for (const m of S.vis[gr]) m.visible = true; S.vis[gr] = [];
      for (const [m, mat] of S.mats[gr].reverse()) m.material = mat; S.mats[gr] = [];
      S.hooks[gr] = [];
      preds[gr] = []; baseHidden[gr].clear(); refreshSkin();
    }

    // ----- the tools a module gets -----
    const W = { THREE, DOLL, F: DOLL.F, Fsnug: DOLL.Fsnug, Ffeet: F_FEET, snets: (G, box, h) => DOLL.snets(G, box, S.light && !S.lightExact ? h * LIGHT_COARSE : h), snug, surface, part, sleeve, loft, computeNormals,
      armPt, armFrame, wArm: wArmAt, wArmSL: wArm, wBody, wSkirt, chainW, chains: CHAINS, wBone, mixW, BI, SK: X.SK, meshes,
      hideSkin, hideMeshes, swapMat, onFrame, afterPaint, paint, tex: (code) => texOf(code).t, std, phys, lin,
      hairNow: () => S.hair, hairParts: () => S.parts.hair.map((r) => r.mesh),       // the hairstyle she wears (put on before the outfit is built) and its meshes, at rest
      sm, smin, smax, cl, lerp, prof, V3, PI, TAU, DEG,
      SOLE: DOLL_SOLE, KNEE: IO_KNEE_Y, A_POSE, L_UARM, L_FARM, restPts, armDir, trunkAt: DOLL.trunkAt, legAt: DOLL.legAt,
      toLocal: DOLL.toLocal, toWorld: DOLL.toWorld, uvTrunk: DOLL.uvTrunk, uvLeg: DOLL.uvLeg, base: WEAR,
      // her head and her own hair (D41_hair.js, I40_head.js): for hairstyles and hats
      headPoint, headHalfW, hair: { SKR, HV, hvDir, hvAngles, HCX, hairT, wHair, HAIRC, HB } };
    function build(code, gr) {
      const def = DEFS()[code]; if (!def) throw new Error('no module ' + code);
      const t0 = performance.now(); group = gr; S.building = def.tex || code;
      afterFns = []; def.build(W);
      finish(def.paintPose);
      for (const f of afterFns) { const ps = S.parts[gr].map((r) => ({ key: r.key, mesh: r.mesh }));
        if (!S.light) f(ps); else try { f(ps); } catch (e) { console.warn('wardrobe: ' + code + ' afterPaint, light build:', e); } }
      afterFns = [];
      group = 'outfit'; S.ms = Math.round(performance.now() - t0);
      return def;
    }
    // her frame hooks run after each frame of her moves (heels, a held pose); a hook may move bones: her matrices are brought up to date after
    const anim0 = API.animate, pose0 = API.pose;
    const runHooks = () => { const h = S.hooks.outfit.concat(S.hooks.hair); if (!h.length) return; for (const f of h) f(X.SK, API); root.updateMatrixWorld(true); };
    API.animate = function () { const r = anim0.apply(this, arguments); runHooks(); return r; };
    API.pose = function () { const r = pose0.apply(this, arguments); runHooks(); return r; };
    const HAIR_LONG = ['tress', 'tressIn', 'wisp', 'lock', 'hairmass'];
    return {
      // put on an outfit (null: just the sports bra and shorts); its suggested hairstyle comes with it unless keepHair
      // opt.light: put on for its light model: the pieces are made but not drawn (but those in opt.keep), and no paintings are needed
      wear(code, keepHair, opt) {
        takeOff('outfit'); S.outfit = null;
        let ms = 0;
        S.light = opt && opt.light ? new Set(opt.keep || []) : null; S.lightExact = S.light ? opt.exact || null : null;
        try {
          if (code) { const d0 = DEFS()[code]; if (!keepHair && d0 && d0.hair && (d0.hair !== S.hair || !!S.light !== !!S.hairLight)) this.hair(d0.hair);       // her hairstyle first, so hats and ties can find the hair
            const def = build(code, 'outfit'); S.outfit = code; ms = S.ms; }
        } finally { S.light = null; S.lightExact = null; }
        return { outfit: S.outfit, hair: S.hair, ms, tris: this.triangles() };
      },
      // a hairstyle: 'long' (her own long waves) or a hair module's code
      hair(name) {
        takeOff('hair'); S.hair = 'long'; S.hairLight = !!S.light;          // made for a light model (not drawn) or to be seen
        if (name && name !== 'long') { if (!DEFS()[name]) { console.warn('wardrobe: no hairstyle ' + name + ' loaded'); return S.hair; } group = 'hair'; hideMeshes(HAIR_LONG); group = 'outfit'; build(name, 'hair'); S.hair = name; }
        return S.hair;
      },
      get outfit() { return S.outfit; }, get hairStyle() { return S.hair; },
      list: () => Object.keys(DEFS()).map((k) => ({ code: k, name: DEFS()[k].name, kind: DEFS()[k].kind || 'outfit' })),
      parts: () => S.parts.outfit.concat(S.parts.hair).map((r) => r.key),
      triangles: () => S.parts.outfit.concat(S.parts.hair).reduce((s, r) => s + r.mesh.geometry.index.count / 3, 0),
      W, paintPose: PAINT_POSE, paintings: (code) => texCache[code],
    };
  }
