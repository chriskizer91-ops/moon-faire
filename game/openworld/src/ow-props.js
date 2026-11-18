// ow-props.js: what stands on the open land between the places, as the map paints it: the drystone walls and the sheepfold, the tor's
// rock pile, lone boulders and standing stones, gorse in flower, the woods in the north-west, three farms and the bridge in the settled
// country, and the dead tower on the beacon crag. Many copies of a few shapes (instanced, as Mud Lab's trees are), in squares of 64 m so
// the ones off screen are skipped. Everything here is a rule of the map's lines and a seeded random, so it is the same every time.
(function (OW) {
  'use strict';
  OW.makeProps = function (scene, land, placeBushes) {
    const F = window.OW_DATA.F, U = OW.U, blockers = [];
    let seed = 20261114; const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
    const I = window.OW_DATA.img, T = { rock: OW.tex(I.rock, { repeat: true }), wall: OW.tex(I.wall, { repeat: true }) };
    // Chris's Round 2 and 3 tiles, each with its own average colour (linear, worked out in prep_round23.py): gorse in flower, bracken, the
    // woods' leaves, straw, rubble. A surface takes the tile's grain and pattern, at the brightness and part of the colour it had before.
    const TM = (window.OW_DATA.kit || {}).tiles || {}, tile = (k) => I['tile_' + k] ? { t: OW.tex(I['tile_' + k], { repeat: true }), m: TM[k] || [0.1, 0.1, 0.1] } : null;
    const TL = { gorse: tile('gorse'), bracken: tile('bracken'), leaves: tile('leaves'), straw: tile('straw'), rubble: tile('rubble') };
    const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white.needsUpdate = true;
    const ok = (x, z, o) => { if (Math.abs(x) > 380 || Math.abs(z) > 252) return false; const g = land.at(x, z); if (g.road > 0.15 || g.place > 0 || g.sea > 0.05 || g.h < land.WL + 0.25 || (o && o.dry && g.wet > 0.3)) return false; for (const P of land.PLACES) if (land.sd(P.P, x, z, 12) < 9) return false; return g; };

    // one material for all the props: their own colour (per vertex), the hollow's painted rock laid on from three sides where asked, lit and fogged like the land
    function mat(o) {
      const tl = o.tile && TL[o.tile];
      return new THREE.ShaderMaterial({ uniforms: Object.assign({ tR: { value: T.rock }, tW: { value: T.wall }, uRockK: { value: o.rock || 0 }, uWallK: { value: o.wall || 0 }, uFlowers: { value: o.flowers || 0 }, uFlowerCol: { value: new THREE.Vector3(...(o.flowerCol || [0.84, 0.64, 0.18]).map((v) => Math.pow(v, 2.2))) },
        tTile: { value: tl ? tl.t : white }, mTile: { value: new THREE.Vector3(...(tl ? tl.m : [1, 1, 1])) }, uTileK: { value: tl ? (o.tileK == null ? 1 : o.tileK) : 0 }, uTileS: { value: o.tileS || 1.5 }, uTileT: { value: o.tileT == null ? 0.3 : o.tileT }, uTileB: { value: o.tileB || 1 }, uTileWhere: { value: o.tileWhere || 0 } }, U), vertexColors: true,
        vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vC; varying vec2 vUv; varying vec3 vL;
          void main() {
            #ifdef USE_INSTANCING
              mat4 m = modelMatrix * instanceMatrix;
            #else
              mat4 m = modelMatrix;
            #endif
            vec4 w = m * vec4(position, 1.0); vP = w.xyz; vL = position; vN = normalize(mat3(m) * normal); vC = color; vUv = uv;
            gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: OW.GLSL + `uniform sampler2D tR, tW, tTile; uniform float uRockK, uWallK, uFlowers, uTileK, uTileS, uTileT, uTileB, uTileWhere; uniform vec3 uFlowerCol, mTile; varying vec3 vP; varying vec3 vN; varying vec3 vC; varying vec2 vUv; varying vec3 vL;
          void main() {
            vec3 n = normalize(vN); vec3 col = vC;
            if (uTileK > 0.0) {                                       // the tile, laid on from three sides, at this surface's own brightness and part of its colour
              vec3 an = abs(n); an = an * an * an; an /= an.x + an.y + an.z; vec3 q = vP / uTileS;
              vec3 tx = s2l(texture2D(tTile, q.zy).rgb) * an.x + s2l(texture2D(tTile, q.xz + 0.5).rgb) * an.y + s2l(texture2D(tTile, q.xy + 0.25).rgb) * an.z;
              float lc = dot(vC, vec3(0.3, 0.59, 0.11)), lm = dot(mTile, vec3(0.3, 0.59, 0.11));
              float where = uTileWhere > 0.5 ? step(vC.r * 1.05, vC.g) : 1.0;           // (the woods: only the canopy, not the trunk)
              col = mix(col, tx / mTile * mix(mTile * lc / lm, vC, uTileT) * uTileB, uTileK * where);
            }
            if (uRockK > 0.0) { vec3 an = abs(n); an /= an.x + an.y + an.z; vec3 rk = s2l(texture2D(tR, vP.zy / 3.0).rgb) * an.x + s2l(texture2D(tR, vP.xz / 3.0).rgb) * an.y + s2l(texture2D(tR, vP.xy / 3.0).rgb) * an.z; col = mix(col, rk * vC * 4.0, uRockK); }
            if (uWallK > 0.0) { vec3 wl = s2l(texture2D(tW, vec2(vUv.x, clamp(vUv.y, 0.004, 0.996))).rgb); col = mix(col, wl * 0.9, uWallK * step(n.y, 0.6)); }
            col *= uTileK > 0.0 ? 0.9 + 0.2 * owNoise(vP.xz * 0.9 + vP.y) : 0.8 + 0.4 * owNoise(vP.xz * 2.7 + vP.y * 3.1);
            if (uFlowers > 0.0) { vec3 q = vP * 17.0; vec2 cell = q.xz + q.y * 0.7; vec2 fc = fract(cell) - 0.5; float f = step(0.62, owHash(floor(cell))) * (1.0 - smoothstep(0.12, 0.28, length(fc))) * smoothstep(-0.2, 0.4, n.y); col = mix(col, uFlowerCol, f * uFlowers * 0.85); }
            col *= owLight(n, vP, 0.35); col = owFog(col, vP);
            ` + OW.out + `
          }` });
    }
    const colourise = (g, c) => { g = g.index ? g.toNonIndexed() : g; const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c[0]; a[i * 3 + 1] = c[1]; a[i * 3 + 2] = c[2]; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2)); return g; };
    const lump = (g, k, s) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = land.vn(x * 2.1 + s, z * 2.1 - s) * 0.6 + land.vn(y * 2.6 - s, x * 1.7 + s) * 0.4; p.setXYZ(i, x * (1 + n * k), y * (1 + n * k), z * (1 + n * k)); } g.computeVertexNormals(); return g; };
    function merge(gs) { let n = 0; for (const g of gs) n += g.attributes.position.count; const out = new THREE.BufferGeometry(); for (const k of ['position', 'normal', 'color', 'uv']) { const sz = k === 'uv' ? 2 : 3, a = new Float32Array(n * sz); let o = 0; for (const g of gs) { a.set(g.attributes[k].array, o); o += g.attributes[k].array.length; } out.setAttribute(k, new THREE.BufferAttribute(a, sz)); } return out; }
    const s2l = (c) => c.map((v) => Math.pow(v, 2.2));
    // many copies of one shape, cut into squares of 64 m so each square can be skipped when it is off screen
    function plant(geo, material, list, cell) {
      cell = cell || 128; const cells = new Map(); for (const it of list) { const k = Math.floor(it.x / cell) + ',' + Math.floor(it.z / cell); if (!cells.has(k)) cells.set(k, []); cells.get(k).push(it); }
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
      for (const items of cells.values()) {
        const im = new THREE.InstancedMesh(geo, material, items.length);
        items.forEach((it, i) => { e.set(it.tilt || 0, it.ry || 0, it.tz || 0); q.setFromEuler(e); m4.compose(new THREE.Vector3(it.x, it.y, it.z), q, new THREE.Vector3(it.sx, it.sy, it.sz)); im.setMatrixAt(i, m4); });
        im.instanceMatrix.needsUpdate = true; im.geometry.computeBoundingSphere();
        let cx = 0, cz = 0, cy = 0; for (const it of items) { cx += it.x; cz += it.z; cy += it.y; } cx /= items.length; cz /= items.length; cy /= items.length; let r = 0; for (const it of items) r = Math.max(r, Math.hypot(it.x - cx, it.z - cz) + Math.max(it.sx, it.sy, it.sz) * 2);
        im.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy, cz), r + 4);
        im.computeBoundingSphere = function () {}; scene.add(im);
      }
    }

    // ---- rocks: the tor's pile, the painted lone boulders, the five lone standing stones, and smaller ones scattered on the moor ----
    const rockGeo = colourise(lump(new THREE.IcosahedronGeometry(1, 1), 0.28, 3.1), s2l([0.42, 0.41, 0.40])), rockMat = mat({ rock: 1 });
    const rocks = [];
    const R1 = (x, z, s, h, o) => { const g = land.at(x, z); if (!o && (g.place > 0 || g.road > 0.3)) return; const it = { x, z, y: g.h - s * 0.25, sx: s * (0.8 + rnd() * 0.5), sy: h, sz: s * (0.8 + rnd() * 0.5), ry: rnd() * 6.3, tilt: (rnd() - 0.5) * 0.3, tz: (rnd() - 0.5) * 0.3 }; if (g.fair > 0.02) return; rocks.push(it); blockers.push({ x, z, r: Math.max(it.sx, it.sz) * 0.85 }); };      // (none on the fairground; its random numbers still drawn, so the rest of the moor stays as it was)
    const tor = land.TOR; for (let i = 0; i < 26; i++) { const a = rnd() * 6.3, r = Math.pow(rnd(), 0.7) * 11; R1(tor.x + Math.cos(a) * r, tor.z + Math.sin(a) * r * 0.8, 1.6 + rnd() * 2.6 * (1 - r / 14), 1.2 + rnd() * 2.4 * (1 - r / 13)); }
    for (let i = 0; i < 4; i++) R1(tor.x + (rnd() - 0.5) * 6, tor.z + (rnd() - 0.5) * 4, 3.2 + rnd(), 3.5 + rnd() * 1.5);
    for (const b of F.boulders) R1(b[0], b[1], 1.3 + rnd(), 1.0 + rnd() * 0.6);
    for (const m of F.menhirs) { const g = land.at(m[0], m[1]); rocks.push({ x: m[0], z: m[1], y: g.h - 0.4, sx: 0.55, sy: 2.6 + rnd(), sz: 0.38, ry: rnd() * 3, tilt: (rnd() - 0.5) * 0.15 }); blockers.push({ x: m[0], z: m[1], r: 0.6 }); }
    for (let i = 0; i < 520; i++) { const x = -330 + rnd() * 700, z = -230 + rnd() * 400, g = ok(x, z, { dry: true }); if (!g) continue; if (land.sd(land.prep(F.woods, true), x, z, 5) < 0 || land.sd(land.prep(F.fields, true), x, z, 5) < 0) continue; const s = 0.2 + Math.pow(rnd(), 3) * 1.1; R1(x, z, s, s * (0.5 + rnd() * 0.5)); }
    for (const it of (OW.dressing && OW.dressing.rocks) || []) rocks.push(it);           // the moor places' own outcrops and stones (ow-dressing.js; their blockers are with the places')
    plant(rockGeo, rockMat, rocks);

    // ---- gorse: in the clumps the map paints, and scattered through the heather ----
    const bushGeo = colourise(lump(new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0.26, 7.7), s2l([0.10, 0.12, 0.05])), bushMat = TL.gorse ? mat({ tile: 'gorse', tileS: 1.3, tileT: 0.1, tileB: 2.6 }) : mat({ flowers: 1 });
    const bushes = [], B1 = (x, z, s) => { const g = ok(x, z, { dry: true }); if (!g) return; bushes.push({ x, z, y: g.h - 0.1, sx: s * (0.9 + rnd() * 0.4), sy: s * (0.6 + rnd() * 0.4), sz: s * (0.9 + rnd() * 0.4), ry: rnd() * 6.3 }); if (g.fair > 0.02) { bushes.pop(); return; } if (s > 0.7) blockers.push({ x, z, r: s * 0.8 }); };
    for (const c of F.gorse) { const n = 3 + Math.floor(rnd() * 4); for (let i = 0; i < n; i++) { const a = rnd() * 6.3, r = rnd() * c[2]; B1(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 0.7 + rnd() * 0.8); } }
    const woodsP = land.prep(F.woods, true), fieldsP = land.prep(F.fields, true);
    for (let i = 0; i < 900; i++) { const x = -260 + rnd() * 640, z = -240 + rnd() * 420; if (land.sd(woodsP, x, z, 5) < 2 || land.sd(fieldsP, x, z, 5) < 4) continue; B1(x, z, 0.4 + rnd() * 0.8); }
    plant(bushGeo, bushMat, bushes);
    // the bushes that stand in the painted places, each kind in its own colour
    const KINDS = { gorse: [[0.10, 0.12, 0.05], 1, [0.84, 0.64, 0.18]], heather: [[0.13, 0.08, 0.14], 0.9, [0.42, 0.24, 0.46]], bracken: [[0.13, 0.075, 0.04], 0.6, [0.36, 0.17, 0.07]], reed: [[0.22, 0.18, 0.10], 0.5, [0.42, 0.35, 0.18]] };
    for (const k in KINDS) { const L = (placeBushes || []).filter((b) => b.kind === k); if (!L.length || (k === 'reed' && OW.kit && I.kit_plants)) continue;
      const geo2 = colourise(lump(new THREE.SphereGeometry(1, 12, 7, 0, Math.PI * 2, 0, Math.PI / 2), k === 'reed' ? 0.14 : 0.3, 3.3), s2l(KINDS[k][0]));
      const items = []; for (const b of L) { const n = b.r > 1.1 ? 3 : b.r > 0.7 ? 2 : 1; for (let i = 0; i < n; i++) { const a = rnd() * 6.3, r = n > 1 ? b.r * 0.45 * rnd() : 0, s = b.r * (n > 1 ? 0.7 : 0.95); const thin = k === 'reed' ? 0.55 : 1; items.push({ x: b.x + Math.cos(a) * r, z: b.z + Math.sin(a) * r, y: b.y - 0.05, sx: s * thin * (0.9 + rnd() * 0.2), sy: b.h * (k === 'reed' ? 1.25 : 0.95) * (0.85 + rnd() * 0.2), sz: s * thin * (0.9 + rnd() * 0.2), ry: rnd() * 6.3 }); } }
      plant(geo2, TL[k] ? mat({ tile: k, tileS: 1.3, tileT: 0.1, tileB: 2.4 }) : mat({ flowers: KINDS[k][1], flowerCol: KINDS[k][2] }), items); }
    // ---- crossed cards from Chris's pictures: the bare thorn trees of the moor's places, and reeds at the pool, the river and the marsh ----
    if (OW.kit && I.kit_plants) {
      const thorns = (placeBushes || []).filter((b) => b.kind === 'thorn').map((b) => ({ x: b.x, z: b.z, y: b.y - 0.05, sx: b.h * 1.3, sy: b.h * 1.3, sz: b.h * 1.3, ry: (rnd() - 0.5) * 0.5 }));
      if (thorns.length) plant(OW.kit.plantGeo('thorn'), OW.kit.plantMat([0.62, 0.6, 0.66], 0.004), thorns, 800);
      const reeds = [], R1r = (x, z, s) => reeds.push({ x, z, y: land.height(x, z) - 0.08, sx: s, sy: s * (0.85 + rnd() * 0.3), sz: s, ry: rnd() * 6.3 });
      for (const b of (placeBushes || []).filter((q) => q.kind === 'reed')) { const n = b.r > 0.75 ? 3 : 2; for (let i = 0; i < n; i++) { const a = rnd() * 6.3, r = b.r * 0.5 * rnd(); R1r(b.x + Math.cos(a) * r, b.z + Math.sin(a) * r, b.h * 1.2 * (0.8 + rnd() * 0.3)); } }
      const wetEdge = (x, z) => { if (Math.abs(x) > 380 || Math.abs(z) > 252) return false; const g = land.at(x, z); return g.wet > 0.35 && g.sea < 0.05 && g.place <= 0 && g.road < 0.1 && g.h > land.WL - 0.12 && g.h < land.WL + 0.55; };
      const riv = F.river[0]; for (let i = 0; i < riv.length - 1; i += 2) { const [ax, az] = riv[i], [bx, bz] = riv[i + 1], l = Math.hypot(bx - ax, bz - az) || 1, nx = -(bz - az) / l, nz = (bx - ax) / l;
        for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { const off = 2.4 + rnd() * 4, x = ax + nx * off * sd + (rnd() - 0.5) * 2, z = az + nz * off * sd + (rnd() - 0.5) * 2; if (rnd() < 0.7 && wetEdge(x, z)) R1r(x, z, 1.3 + rnd() * 0.7); } }
      for (let i = 0; i < 9000 && reeds.length < 1700; i++) { const x = -260 + rnd() * 640, z = 170 + rnd() * 84; if (wetEdge(x, z) && land.vn(x / 9, z / 9) > -0.1) R1r(x, z, 1.1 + rnd() * 0.8); }
      for (const p of land.POOLS) for (let i = 0; i < 14; i++) { const a = rnd() * 6.3, e = 1.05 + rnd() * 0.35, x = p.x + Math.cos(a) * p.rx * e, z = p.z + Math.sin(a) * p.rz * e; const g = land.at(x, z); if (g.place <= 0 && g.road < 0.1 && rnd() < 0.6) R1r(x, z, 0.9 + rnd() * 0.5); }
      if (reeds.length) plant(OW.kit.plantGeo('reeds'), OW.kit.plantMat([0.55, 0.55, 0.5], 0.03), reeds, 800);          // few, wide squares: thin cards cost little, draws cost more
    }

    // ---- the woods: a dark round-topped tree, many times; and the copses the map paints in the fields ----
    const tree = (() => { const parts = [colourise(new THREE.CylinderGeometry(0.16, 0.26, 3.2, 6).translate(0, 1.6, 0), s2l([0.17, 0.12, 0.09]))];
      for (const [x, y, z, r] of [[0, 4.2, 0, 1.9], [0.9, 3.5, 0.4, 1.4], [-0.8, 3.6, -0.3, 1.5], [0.1, 5.3, 0.1, 1.3]]) parts.push(colourise(lump(new THREE.IcosahedronGeometry(r, 0), 0.25, x * 5 + z), s2l([0.075, 0.11, 0.06])).translate(x, y, z));
      return merge(parts); })(), treeMat = TL.leaves ? mat({ tile: 'leaves', tileS: 1.6, tileT: 0.2, tileB: 1.3, tileWhere: 1 }) : mat({});
    const trees = [], T1 = (x, z, s) => { const g = land.at(x, z); if (g.place > 0 || g.road > 0.2 || g.h < land.WL + 0.4 || g.sea > 0) return; trees.push({ x, z, y: g.h - 0.2, sx: s, sy: s * (0.85 + rnd() * 0.35), sz: s, ry: rnd() * 6.3 }); blockers.push({ x, z, r: 0.4 * s }); };
    for (let i = 0; i < 2600 && trees.length < 900; i++) { const x = -384 + rnd() * 260, z = -256 + rnd() * 150; if (land.sd(woodsP, x, z, 5) > -2) continue; let bare = false; for (const b of F.bare_tops) if (((x - b[0]) / b[2]) ** 2 + ((z - b[1]) / b[3]) ** 2 < 1.3) bare = true; if (bare) continue; T1(x, z, 0.85 + rnd() * 0.6); }
    for (const c of F.tree_clumps) { if (c[1] < -150 && c[0] < -150) continue; const n = Math.round(c[2] / 2.5); for (let i = 0; i < n; i++) { const a = rnd() * 6.3, r = rnd() * c[2]; T1(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 0.8 + rnd() * 0.5); } }
    plant(tree, treeMat, trees);

    // ---- drystone walls along the map's lines, broken every few metres, and the round sheepfold ----
    (function walls() {
      const gs = [], seg = (ax, az, bx, bz, h, u0) => {
        const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), ya = land.height(ax, az), yb = land.height(bx, bz), mx = (ax + bx) / 2, mz = (az + bz) / 2;
        const g = new THREE.BoxGeometry(L + 0.02, h + 0.4, 0.66, 1, 1, 1); g.translate(0, (h + 0.4) / 2 - 0.4, 0);
        const uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, (u0 + p.getX(i) + L / 2) / 1.8, p.getY(i) / h);          // Chris's wall picture: 1.8 m of wall along, ground (v 0) to the top stones (v 1)
        g.rotateY(-Math.atan2(dz, dx)); g.translate(mx, (ya + yb) / 2, mz); gs.push(colourise(g, s2l([0.36, 0.34, 0.31])));
        blockers.push({ x: mx, z: mz, r: Math.max(0.45, L / 2) });
      };
      const run = (pts, h) => { let u = 0, on = true, left = 6 + rnd() * 3;
        for (let k = 0; k < pts.length - 1; k++) { const [ax, az] = pts[k], [bx, bz] = pts[k + 1], L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 1.0);
          for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1, l = L / n;
            if (on && ok((x0 + x1) / 2, (z0 + z1) / 2)) seg(x0, z0, x1, z1, h * (0.85 + 0.3 * land.vn(u * 0.4, k)), u);
            u += l; left -= l; if (left <= 0) { on = !on; left = on ? 5 + rnd() * 5 : 1.2 + rnd() * 1.6; } } } };
      for (const w of F.walls) run(w, 1.0);
      for (const w of (OW.dressing && OW.dressing.walls) || []) { let u = 0; for (let k = 0; k < w.pts.length - 1; k++) { const [ax, az] = w.pts[k], [bx, bz] = w.pts[k + 1], n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az))); for (let i = 0; i < n; i++) { seg(ax + (bx - ax) * i / n, az + (bz - az) * i / n, ax + (bx - ax) * (i + 1) / n, az + (bz - az) * (i + 1) / n, w.h * (0.85 + 0.3 * land.vn(u * 0.4, ax)), u); u += Math.hypot(bx - ax, bz - az) / n; } } }      // the moor places' longer wall runs (ow-dressing.js), every piece where its table says
      const f = F.fold; const ring = []; for (let a = 0; a <= 24; a++) ring.push([f[0][0] + Math.cos(a / 24 * 6.283) * f[1], f[0][1] + Math.sin(a / 24 * 6.283) * f[1]]); run(ring, 1.1);
      if (gs.length) scene.add(new THREE.Mesh(merge(gs), mat({ wall: 1 })));
    })();

    // ---- the settled country: three farms and the bridge over the river ----
    (function farms() {
      const gs = [], roofs = [];
      for (const f of F.farms) { const y = land.height(f[0], f[1]), a = rnd() * 0.6 - 0.3;
        const wall = colourise(new THREE.BoxGeometry(8, 3, 5).translate(0, 1.5, 0), s2l([0.55, 0.50, 0.45])), roof = colourise(new THREE.CylinderGeometry(3.0, 3.0, 8.6, 3, 1).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2).scale(1, 0.75, 1.0).translate(0, 4.1, 0), s2l([0.36, 0.28, 0.16]));
        for (const g of [wall, roof]) { g.rotateY(a); g.translate(f[0], y, f[1]); (g === roof ? roofs : gs).push(g); } blockers.push({ x: f[0], z: f[1], w: 4.3, d: 2.8, a: -a }); }
      const b = F.bridge, y = land.WL + 1.0, deck = colourise(new THREE.BoxGeometry(4.2, 0.3, 10).translate(0, 0, 0), s2l([0.30, 0.22, 0.15]));
      deck.rotateY(0.5); deck.translate(b[0], y, b[1]); gs.push(deck);
      for (const s of [-1, 1]) { const r = colourise(new THREE.BoxGeometry(0.15, 0.9, 10).translate(s * 2, 0.5, 0), s2l([0.26, 0.19, 0.13])); r.rotateY(0.5); r.translate(b[0], y, b[1]); gs.push(r); }
      scene.add(new THREE.Mesh(merge(gs), mat({}))); scene.add(new THREE.Mesh(merge(roofs), TL.straw ? mat({ tile: 'straw', tileS: 1.4, tileT: 0.35, tileB: 1.2 }) : mat({})));
    })();

    // ---- the dead tower on the beacon crag: a round stone keep, its top broken, its lamp room dark ----
    (function tower() {
      const t = F.tower, y = land.height(t[0], t[1]) - 1, g = new THREE.CylinderGeometry(3.4, 4.0, 17, 14, 6, true), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const yy = p.getY(i); if (yy > 7) { const a = Math.atan2(p.getZ(i), p.getX(i)); p.setY(i, yy - Math.max(0, Math.sin(a * 3 + 1) * 3.5 + land.vn(a * 4, 1) * 1.5)); } }
      g.computeVertexNormals();
      const parts = [colourise(g, s2l([0.30, 0.29, 0.31])).translate(0, 8.5, 0), colourise(new THREE.CylinderGeometry(4.6, 5.0, 1.2, 14).translate(0, 0.6, 0), s2l([0.25, 0.24, 0.26]))];
      const m = new THREE.Mesh(merge(parts), TL.rubble ? mat({ tile: 'rubble', tileS: 2.4, tileT: 0.3, tileB: 1.1 }) : mat({ rock: 0.7 })); m.position.set(t[0], y, t[1]); scene.add(m);
    })();
    return { blockers, mat };
  };

  // ---- heather close round her: small low clumps, sown on a grid that stays put on the ground (so they do not swim as she walks), only
  // where the painted map is heather, and only within a few tens of metres; further off the painted ground carries it ----
  OW.makeTufts = function (scene, land, macroImg, matFn) {
    const c = document.createElement('canvas'); c.width = 768; c.height = 512; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(macroImg, 0, 0, 768, 512); const px = g.getImageData(0, 0, 768, 512).data;
    const purple = (x, z) => { const u = Math.round(x + 384), v = Math.round(z + 256); if (u < 0 || v < 0 || u > 767 || v > 511) return 0; const i = (v * 768 + u) * 4; return (px[i] + px[i + 2]) / 2 - px[i + 1]; };
    const MAX = 3200, CELL = 1.25, RAD = 34, geo = (() => { const q = new THREE.SphereGeometry(1, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2); const p = q.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = land.vn(x * 3 + 1, z * 3 - 2) * 0.35; p.setXYZ(i, x * (1 + n), y * (1 + n * 0.6), z * (1 + n)); } q.computeVertexNormals(); return q; })();
    const n = geo.index ? geo.toNonIndexed() : geo, cnt = n.attributes.position.count, col = new Float32Array(cnt * 3).fill(0); for (let i = 0; i < cnt; i++) { col[i * 3] = Math.pow(0.15, 2.2); col[i * 3 + 1] = Math.pow(0.09, 2.2); col[i * 3 + 2] = Math.pow(0.16, 2.2); }
    n.setAttribute('color', new THREE.BufferAttribute(col, 3)); n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(cnt * 2), 2));
    const im = new THREE.InstancedMesh(n, matFn, MAX); im.count = 0; im.frustumCulled = false; scene.add(im);
    const memo = new Map(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(); let last = [1e9, 1e9];
    function at(i, j) {
      const k = i * 100003 + j; if (memo.has(k)) return memo.get(k);
      const h1 = Math.abs(Math.sin(i * 127.1 + j * 311.7) * 43758.5453) % 1, h2 = Math.abs(Math.sin(i * 269.5 + j * 183.3) * 24634.6345) % 1, h3 = Math.abs(Math.sin(i * 419.2 + j * 371.9) * 12345.678) % 1;
      const x = (i + h1) * CELL, z = (j + h2) * CELL; let r = null;
      const pu = purple(x, z);
      if (pu > 6 + h3 * 14) { const gg = land.at(x, z); if (gg.road < 0.15 && gg.place <= 0 && gg.fair <= 0.02 && gg.sea <= 0 && gg.wet < 0.4 && gg.rock < 0.3 && gg.h > land.WL + 0.3) r = { x, z, y: gg.h - 0.05, w: 0.34 + h3 * 0.4, hh: 0.12 + h1 * 0.2, a: h2 * 6.28 }; }
      memo.set(k, r); return r;
    }
    return { mesh: im, update(cam) {
      if (Math.hypot(cam.x - last[0], cam.z - last[1]) < 2.5) return; last = [cam.x, cam.z];
      let n2 = 0; const i0 = Math.floor((cam.x - RAD) / CELL), i1 = Math.floor((cam.x + RAD) / CELL), j0 = Math.floor((cam.z - RAD) / CELL), j1 = Math.floor((cam.z + RAD) / CELL);
      for (let j = j0; j <= j1 && n2 < MAX; j++) for (let i = i0; i <= i1 && n2 < MAX; i++) {
        const t = at(i, j); if (!t) continue; const d = Math.hypot(t.x - cam.x, t.z - cam.z); if (d > RAD) continue; const f = 1 - Math.max(0, (d - RAD * 0.7) / (RAD * 0.3));
        e.set(0, t.a, 0); q.setFromEuler(e); m4.compose(v.set(t.x, t.y, t.z), q, s.set(t.w * f, t.hh * f, t.w * f)); im.setMatrixAt(n2++, m4);
      }
      im.count = n2; im.instanceMatrix.needsUpdate = true;
    } };
  };

  // ---- the fires: a few soft flames that never stop moving; every fire's flames in one mesh, moved in its vertex shader (one draw) ----
  OW.makeFires = function (scene, fires) {
    const pos = [], fl = [], uv = [];
    fires.forEach((f) => { for (let i = 0; i < 5; i++) { const ph = Math.random() * 6, k = i ? 0.5 + Math.random() * 0.4 : 0.9; for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]) { pos.push(f.x, f.y, f.z); fl.push(a, b, ph, k); uv.push((a + 1) / 2, (b + 1) / 2, f.r, i ? 0 : 1); } } });
    if (!pos.length) return { step() {} };
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aF', new THREE.Float32BufferAttribute(fl, 4)); g.setAttribute('aU', new THREE.Float32BufferAttribute(uv, 4)); g.computeBoundingSphere(); g.boundingSphere.radius += 2;
    const m = OW.glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { tG: { value: OW.glowTex() }, uTime: OW.U.uTime },
      vertexShader: `attribute vec4 aF; attribute vec4 aU; uniform float uTime; varying vec2 vUv; varying vec3 vC;
        void main() { float t = uTime, ph = aF.z, k = aF.w, r = aU.z; float w = 0.5 + 0.5 * sin(t * (7.0 + k * 5.0) + ph);
          vec3 c = position + vec3(sin(t * 3.0 + ph) * 0.08, 0.15 + k * 0.35 + w * 0.1, cos(t * 2.3 + ph) * 0.08); float s = r * (1.2 + k * 0.8) * (0.85 + 0.3 * w);
          vec4 mv = modelViewMatrix * vec4(c, 1.0); mv.xy += aF.xy * vec2(s * 0.4, s * 0.65); gl_Position = projectionMatrix * mv; vUv = aU.xy;
          vC = aU.w > 0.5 ? vec3(1.0, 0.878, 0.627) : vec3(1.0, 0.604, 0.227); }`,
      fragmentShader: `uniform sampler2D tG; varying vec2 vUv; varying vec3 vC; void main() { vec4 t = texture2D(tG, vUv); gl_FragColor = linearToOutputTexel(vec4(t.rgb * vC, 1.0)); gl_FragColor.a = t.a; }` }));
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 3; scene.add(mesh);
    return { mesh, step() {} };
  };
})(window.OW);
