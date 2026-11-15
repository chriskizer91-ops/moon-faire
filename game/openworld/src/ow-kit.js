// ow-kit.js: a kit of fair pieces skinned with Chris's Round 2 and 3 pictures, to set down anywhere at any turn and draw in very few
// draws. Each piece is real geometry with its own picture laid on it: the flat views of single things (stall fronts and back, the wagon,
// the booth, the carts, crates and barrels...) come from one atlas (kit_atlas.webp, see-through where the grey background was), the
// repeating materials (planks, dark planks, shingles, rubble, straw, the three canvases, the cream awning) from their own tiles, the
// valances round the tents' roofs from kit_trim.webp. A batch gathers any number of pieces into one mesh (and one more for the lamps'
// glow), in world coordinates, so a whole place of stalls, tents and crates is two draws. Things she walks round are simple 3D shapes
// with the pictures on their faces; thin things (the lantern's arm, the brazier, the well's bucket) are crossed cut-out cards.
//
//   const B = OW.kit.batch();  B.stall({ x, z, turn: 30, front: 'lamp' });  B.well({ x, z });  const out = B.finish(scene);
//   out.mesh, out.glow, out.blockers (as ow-main.js wants them), out.lamps, out.fires, out.geometry (for a place's depth picture)
//   or, one at a time: OW.kit.stall({ x, z, turn, front: 'lamp' }) ... then OW.kit.flush(scene)
// Every piece takes x, z (metres, world), y (its ground; if left out, OW.kit.heightAt(x, z) or 0), turn (degrees about the up axis; the
// piece's front, its +z, faces south at 0), and its own sizes. Every world surface writes alpha 0 (OW.out); cut-outs are alpha-tested.
(function (OW) {
  'use strict';
  const RAD = Math.PI / 180;
  const KIT = OW.kit = {};
  // the pictures, by the number the shader picks them by, and how many metres one repeat of each tile covers
  const TEX = ['atlas', 'trim', 'mat_wood', 'tile_wooddark', 'tile_shingles', 'tile_rubble', 'tile_straw', 'mat_stripe', 'tile_bluestripe', 'tile_damask', 'mat_awning'];
  const ID = { atlas: 0, trim: 1, wood: 2, dark: 3, shingle: 4, rubble: 5, straw: 6, red: 7, blue: 8, damask: 9, awning: 10 };
  const TILE_M = { 2: 1.6, 3: 2.2, 4: 1.5, 5: 2.0, 6: 1.1, 7: 3.8, 8: 3.0, 9: 2.6, 10: 2.0 };
  const CANVAS = { red: ID.red, blue: ID.blue, damask: ID.damask };
  let tex = null, mats = null;
  function textures() {
    if (tex) return tex; const I = window.OW_DATA.img; tex = {};
    TEX.forEach((k, i) => { const src = I[k === 'atlas' ? 'kit_atlas' : k === 'trim' ? 'kit_trim' : k]; const t = OW.tex(src, { repeat: i >= 1 }); tex[i] = t; });
    tex[1].wrapT = THREE.ClampToEdgeWrapping; tex[0].anisotropy = 4;
    return tex;
  }
  KIT.ready = () => Promise.all(Object.values(textures()).map((t) => t.ready));

  const SHADER_TEX = `uniform sampler2D tA, tT, t2, t3, t4, t5, t6, t7, t8, t9, t10;
vec4 kitTex(float id, vec2 uv) {
  if (id < 0.5) return texture2D(tA, uv);
  if (id < 1.5) return texture2D(tT, uv);
  vec3 c;
  if (id < 2.5) c = texture2D(t2, uv).rgb; else if (id < 3.5) c = texture2D(t3, uv).rgb; else if (id < 4.5) c = texture2D(t4, uv).rgb; else if (id < 5.5) c = texture2D(t5, uv).rgb;
  else if (id < 6.5) c = texture2D(t6, uv).rgb; else if (id < 7.5) c = texture2D(t7, uv).rgb; else if (id < 8.5) c = texture2D(t8, uv).rgb; else if (id < 9.5) c = texture2D(t9, uv).rgb; else c = texture2D(t10, uv).rgb;
  return vec4(c, 1.0);
}
`;
  function texUniforms() { const t = textures(), u = { tA: { value: t[0] }, tT: { value: t[1] } }; for (let i = 2; i < TEX.length; i++) u['t' + i] = { value: t[i] }; return u; }
  // the look: the picture in its own colour, times the piece's tint and the batch's gain (to sit with the paintings), lit like the land;
  // lamp glass and coals (marked 200 in the atlas's see-through channel) also shine by themselves
  function material(gain, glow, sat) {
    return new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: Object.assign(texUniforms(), { uGain: { value: new THREE.Vector3(...gain) }, uGlow: { value: glow }, uSat: { value: sat } }, OW.U),
      vertexShader: `attribute vec4 aK; varying vec3 vP; varying vec3 vN; varying vec2 vUv; varying vec4 vK;
        void main() { vP = position; vN = normal; vUv = uv; vK = aK; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: OW.GLSL + SHADER_TEX + `uniform vec3 uGain; uniform float uGlow, uSat; varying vec3 vP; varying vec3 vN; varying vec2 vUv; varying vec4 vK;
        void main() {
          vec4 c = kitTex(vK.w, vUv); if (c.a < 0.45) discard;
          vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
          vec3 base = s2l(c.rgb); base = mix(vec3(dot(base, vec3(0.3, 0.59, 0.11))), base, uSat);         // a little of the colour taken out, as the dusk takes it from the paintings
          float e = vK.w < 0.5 ? (1.0 - smoothstep(0.80, 0.87, c.a)) * smoothstep(0.30, 0.60, dot(c.rgb, vec3(0.3, 0.59, 0.11))) : 0.0;
          vec3 col = base * vK.rgb * uGain * owLight(n, vP, 0.3) + base * e * uGlow;
          col = owFog(col, vP);
          ` + OW.out + `
        }` });
  }
  // the pieces in a painting's depth picture (ow-places.js): their cut-outs cut, a little fattened like the places' own shapes
  KIT.depthMaterial = function () {
    return new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: texUniforms(),
      vertexShader: `attribute vec4 aK; varying vec2 vUv; varying float vId; void main() { vUv = uv; vId = aK.w; gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * 0.03, 1.0); }`,
      fragmentShader: `#include <packing>
        uniform sampler2D tA, tT; varying vec2 vUv; varying float vId;
        void main() { if (vId < 0.5 && texture2D(tA, vUv).a < 0.45) discard; if (vId > 0.5 && vId < 1.5 && texture2D(tT, vUv).a < 0.45) discard; gl_FragColor = packDepthToRGBA(gl_FragCoord.z); }` });
  };
  // the lamps' soft glow: one quad per lamp, turned to face the camera in the vertex shader, all of a batch's in one draw
  function glowMaterial() {
    return OW.glowOnly(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { tG: { value: OW.glowTex() }, uTime: OW.U.uTime },
      vertexShader: `attribute vec3 aG; varying vec2 vUv; varying float vF; uniform float uTime;
        void main() { vUv = uv; vF = 0.88 + 0.07 * sin(uTime * 7.3 + aG.z * 9.0) + 0.05 * sin(uTime * 13.1 + aG.z * 21.0); vec4 mv = modelViewMatrix * vec4(position, 1.0); mv.xy += aG.xy; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D tG; varying vec2 vUv; varying float vF; void main() { vec4 t = texture2D(tG, vUv); gl_FragColor = linearToOutputTexel(vec4(t.rgb * vec3(1.0, 0.78, 0.53) * vF, 1.0)); gl_FragColor.a = t.a; }` }));
  }

  // ---- a batch: everything set down goes into its arrays, already in world coordinates ----
  KIT.batch = function (opts) {
    opts = opts || {};
    const A = window.OW_DATA.kit.atlas, TR = window.OW_DATA.kit.trim;
    const pos = [], nrm = [], uv = [], kk = [], gpos = [], gofs = [], guv = [], blockers = [], lamps = [], fires = [], place = opts.place;
    let M = new THREE.Matrix4(), NM = new THREE.Matrix3(), tint = [1, 1, 1]; const ONE = [1, 1, 1];
    const v3 = new THREE.Vector3(), n3 = new THREE.Vector3();
    // the piece's frame: where it stands and how it is turned
    function frame(o) {
      const y = o.y != null ? o.y : KIT.heightAt ? KIT.heightAt(o.x, o.z) : 0, a = (o.turn || 0) * RAD;
      M = new THREE.Matrix4().makeRotationY(a).setPosition(o.x, y, o.z); NM = new THREE.Matrix3().getNormalMatrix(M); tint = o.tint || [1, 1, 1];
      return { y, a, at: (lx, lz) => [o.x + lx * Math.cos(a) + lz * Math.sin(a), o.z - lx * Math.sin(a) + lz * Math.cos(a)] };
    }
    // k: this part's own tint; the piece's tint (o.tint) multiplies every part
    function vert(p, n, t, id, k) { v3.set(p[0], p[1], p[2]).applyMatrix4(M); n3.set(n[0], n[1], n[2]).applyMatrix3(NM).normalize(); pos.push(v3.x, v3.y, v3.z); nrm.push(n3.x, n3.y, n3.z); uv.push(t[0], t[1]); k = k || ONE; kk.push(k[0] * tint[0], k[1] * tint[1], k[2] * tint[2], id); }
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    // a four-cornered face: p0 bottom-left, p1 bottom-right, p2 top-right, p3 top-left as seen from its front; t the same corners' uv
    function quad(p0, p1, p2, p3, t0, t1, t2, t3, id, k) { const n = unit(cross(sub(p1, p0), sub(p3, p0))); vert(p0, n, t0, id, k); vert(p1, n, t1, id, k); vert(p2, n, t2, id, k); vert(p0, n, t0, id, k); vert(p2, n, t2, id, k); vert(p3, n, t3, id, k); }
    function tri(p0, p1, p2, t0, t1, t2, id, k) { const n = unit(cross(sub(p1, p0), sub(p2, p0))); vert(p0, n, t0, id, k); vert(p1, n, t1, id, k); vert(p2, n, t2, id, k); }
    // a picture's own pixel (as measured in Chris's file) to the atlas's uv
    const au = (name) => { const r = A[name].rect, b = A[name].bb; return (px, py) => [r[0] + (px - b[0]) / (b[2] - b[0]) * r[2], 1 - (r[1] + (py - b[1]) / (b[3] - b[1]) * r[3])]; };
    // a face in a tile: corners' uv in metres along (s) and up (t) the face, over the tile's own size
    const tq = (p0, p1, p2, p3, id, s0, s1, t0, t1, k) => { const m = TILE_M[id] || 2; quad(p0, p1, p2, p3, [s0 / m, t0 / m], [s1 / m, t0 / m], [s1 / m, t1 / m], [s0 / m, t1 / m], id, k); };
    // a box of a tile (faces chosen by 'fbklrtd': front +z, back, left -x, right +x, top, down)
    function tbox(x0, x1, y0, y1, z0, z1, id, faces, k) {
      faces = faces || 'fbklrtd';
      if (faces.includes('f')) tq([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], id, x0, x1, y0, y1, k);
      if (faces.includes('b')) tq([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], id, -x1, -x0, y0, y1, k);
      if (faces.includes('l')) tq([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], id, z0, z1, y0, y1, k);
      if (faces.includes('r')) tq([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], id, -z1, -z0, y0, y1, k);
      if (faces.includes('t')) tq([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], id, x0, x1, -z1, -z0, k);
      if (faces.includes('d')) tq([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], id, x0, x1, z0, z1, k);
    }
    // a box with a picture on its sides (each side the whole picture; the ends may take another), and on its top if asked
    function pbox(w, d, h, y0, side, end, top, k) {
      const S = au(side), b = A[side].bb, E = au(end || side), e = A[end || side].bb, x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2, y1 = y0 + h;
      const face = (p0, p1, p2, p3, F, bb) => quad(p0, p1, p2, p3, F(bb[0], bb[3]), F(bb[2], bb[3]), F(bb[2], bb[1]), F(bb[0], bb[1]), 0, null);
      face([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], S, b); face([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], S, b);
      face([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], E, e); face([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], E, e);
      if (top === 'pic') face([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], S, b); else if (top != null) tq([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], top, x0, x1, -z1, -z0, k);      // (k: the top's tint)
    }
    // a round thing turned on a lathe: radius r(t) at height y(t) for t 0..1; the picture's columns c0..c1 wrapped round it as seen from
    // the front (a point at angle q shows where the picture has it, sin(q) of the way out), rows r0 (top) .. r1 (bottom)
    function lathe(cx, cz, rOf, yOf, seg, rings, name, c0, c1, r0, r1, k) {
      const F = au(name), rmax = Math.max(...Array.from({ length: rings + 1 }, (_, i) => rOf(i / rings)));
      const P = (i, j) => { const q = i / seg * Math.PI * 2, t = j / rings, r = rOf(t); return { p: [cx + Math.sin(q) * r, yOf(t), cz + Math.cos(q) * r], uv: F((c0 + c1) / 2 + Math.sin(q) * r / rmax * (c1 - c0) / 2, r1 + (r0 - r1) * t), n: [Math.sin(q), 0, Math.cos(q)] }; };
      for (let i = 0; i < seg; i++) for (let j = 0; j < rings; j++) { const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); vert(a.p, a.n, a.uv, 0, k); vert(b.p, b.n, b.uv, 0, k); vert(c.p, c.n, c.uv, 0, k); vert(a.p, a.n, a.uv, 0, k); vert(c.p, c.n, c.uv, 0, k); vert(d.p, d.n, d.uv, 0, k); }
    }
    function disc(cx, cy, cz, r, seg, id, k, up) { const m = TILE_M[id] || 2; for (let i = 0; i < seg; i++) { const a0 = i / seg * 6.2832, a1 = (i + 1) / seg * 6.2832, p0 = [cx, cy, cz], p1 = [cx + Math.sin(a0) * r, cy, cz + Math.cos(a0) * r], p2 = [cx + Math.sin(a1) * r, cy, cz + Math.cos(a1) * r]; const T = (p) => [p[0] / m, p[2] / m]; if (up === false) tri(p0, p2, p1, T(p0), T(p2), T(p1), id, k); else tri(p0, p1, p2, T(p0), T(p1), T(p2), id, k); } }
    // a tile wrapped round a cylinder (or a cone's slope when r1 differs), uv in metres round and up
    function tcyl(cx, cz, r0, r1, y0, y1, seg, id, k, a0, a1, s0) {
      a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1; const m = TILE_M[id] || 2, L = Math.hypot(r1 - r0, y1 - y0), C = (a1 - a0) * r0;
      const reps = id >= 7 && id <= 9 && Math.abs(a1 - a0 - Math.PI * 2) < 1e-3 ? Math.max(1, Math.round(C / m)) * m / C : 1 / 1;
      for (let i = 0; i < seg; i++) { const q0 = a0 + (a1 - a0) * i / seg, q1 = a0 + (a1 - a0) * (i + 1) / seg, P = (q, r, y) => [cx + Math.sin(q) * r, y, cz + Math.cos(q) * r];
        const s = (q) => ((s0 || 0) + (q - a0) * r0 * reps) / m;
        const nq = (q) => unit([Math.sin(q) * (y1 - y0), r0 - r1, Math.cos(q) * (y1 - y0)]);
        const A0 = P(q0, r0, y0), B0 = P(q1, r0, y0), B1 = P(q1, r1, y1), A1 = P(q0, r1, y1);
        vert(A0, nq(q0), [s(q0), 0], id, k); vert(B0, nq(q1), [s(q1), 0], id, k); vert(B1, nq(q1), [s(q1), L / m], id, k); vert(A0, nq(q0), [s(q0), 0], id, k); vert(B1, nq(q1), [s(q1), L / m], id, k); vert(A1, nq(q0), [s(q0), L / m], id, k); }
    }
    // a band of trim hanging round a ring (radius r, from y0 down by h), or along a straight edge
    function trimRing(cx, cz, r, y0, h, seg, kind, k) {
      const T = TR[kind], per = h * T.aspect, C = Math.PI * 2 * r, reps = Math.max(1, Math.round(C / per));
      for (let i = 0; i < seg; i++) { const q0 = i / seg * Math.PI * 2, q1 = (i + 1) / seg * Math.PI * 2, P = (q, y) => [cx + Math.sin(q) * r, y, cz + Math.cos(q) * r];
        const u0 = i / seg * reps, u1 = (i + 1) / seg * reps, v0 = 1 - T.v1, v1 = 1 - T.v0;
        quad(P(q0, y0 - h), P(q1, y0 - h), P(q1, y0), P(q0, y0), [u0, v0], [u1, v0], [u1, v1], [u0, v1], 1, k); }
    }
    function trimLine(p0, p1, h, kind, k) { const T = TR[kind], L = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]), u = Math.max(1, Math.round(L / (h * T.aspect))), v0 = 1 - T.v1, v1 = 1 - T.v0; quad([p0[0], p0[1] - h, p0[2]], [p1[0], p1[1] - h, p1[2]], p1, p0, [0, v0], [u, v0], [u, v1], [0, v1], 1, k); }
    function card(name, c0, c1, r0, r1, p0, p1, yb, yt, k) { const F = au(name); quad([p0[0], yb, p0[1]], [p1[0], yb, p1[1]], [p1[0], yt, p1[1]], [p0[0], yt, p0[1]], F(c0, r1), F(c1, r1), F(c1, r0), F(c0, r0), 0, k); }
    function glow(lx, ly, lz, size, f) { v3.set(lx, ly, lz).applyMatrix4(M); const s = size / 2, seed = Math.random(); if (size > 0) for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]) { gpos.push(v3.x, v3.y, v3.z); gofs.push(a * s, b * s, seed); guv.push((a + 1) / 2, (b + 1) / 2); } const L = { x: v3.x, y: v3.y, z: v3.z, seed: Math.random() * 10, k: f || 1 }; lamps.push(L); return L; }
    const block = (F, lx, lz, r) => { const [x, z] = F.at(lx, lz); const b = { x, z, r }; if (place) b.place = place; blockers.push(b); return b; };
    const blockBox = (F, o, lx, lz, w, d) => { const [x, z] = F.at(lx, lz); const b = { x, z, w: w / 2, d: d / 2, a: F.a }; if (place) b.place = place; blockers.push(b); return b; };

    const B = {
      // ---- an awning stall: its front picture on the counter and, set back behind the counter, on the goods; the valance cut out at
      // the awning's front edge; the awning's top from the front picture, its underside cream cloth; plank sides; the back picture ----
      stall(o) {
        const F = frame(o), w = o.w || 3.2, d = o.d || 1.7, h = o.h || 2.3, nm = 'stall_' + (o.front || 'lamp'), S = A[nm], b = S.bb, R = S.rows, bx0 = S.cols.bx0, bx1 = S.cols.bx1;
        const ppm = (bx1 - bx0) / w, mv = h / (b[3] - R.yS), X = (px) => (px - (bx0 + bx1) / 2) / ppm, Y = (py) => (b[3] - py) * mv;
        const T = au(nm), V = au('val_' + (o.front || 'lamp')), cd = 0.42, ov = 0.18, rise = 0.5, zf = d / 2, zb = -d / 2, hb = h + rise * (d + 0.05) / (d + ov + 0.05), k = null;
        const pic = (F2, c0, c1, r0, r1, x0, x1, y0, y1, z) => quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], F2(c0, r1), F2(c1, r1), F2(c1, r0), F2(c0, r0), 0, k);
        pic(T, bx0, bx1, R.yC, b[3], -w / 2, w / 2, 0, Y(R.yC), zf);                                          // the counter
        pic(T, bx0, bx1, R.yT, R.yC, -w / 2, w / 2, Y(R.yC), Y(R.yT), zf - cd);                                // the goods, behind it
        tq([-w / 2, Y(R.yC), zf], [w / 2, Y(R.yC), zf], [w / 2, Y(R.yC), zf - cd], [-w / 2, Y(R.yC), zf - cd], ID.wood, -w / 2, w / 2, 0, cd, [0.75, 0.62, 0.55]);   // the counter's top
        pic(V, b[0], b[2], R.yS, R.yT, X(b[0]), X(b[2]), Y(R.yT), h, zf + ov);                                 // the valance
        const ax0 = X(b[0]), ax1 = X(b[2]);
        quad([ax0, h, zf + ov], [ax1, h, zf + ov], [ax1, h + rise, zb - 0.05], [ax0, h + rise, zb - 0.05], T(b[0], R.yS), T(b[2], R.yS), T(b[2], b[1]), T(b[0], b[1]), 0, k);    // the awning, from above
        tq([ax0, h - 0.015, zf + ov], [ax0, h + rise - 0.015, zb - 0.05], [ax1, h + rise - 0.015, zb - 0.05], [ax1, h - 0.015, zf + ov], ID.awning, 0, d + ov, ax0, ax1, [0.55, 0.5, 0.5]);   // and from below
        for (const sx of [-1, 1]) { const x = sx * w / 2, p = [[x, 0, zb], [x, 0, zf], [x, h, zf], [x, hb, zb]]; if (sx < 0) tq(p[0], p[1], p[2], p[3], ID.wood, zb, zf, 0, h, [0.8, 0.7, 0.62]); else tq(p[1], p[0], p[3], p[2], ID.wood, -zf, -zb, 0, h, [0.8, 0.7, 0.62]); }
        const Bk = au('stall_back'), bb = A.stall_back.bb, bc = A.stall_back.cols;
        quad([w / 2, 0, zb], [-w / 2, 0, zb], [-w / 2, hb, zb], [w / 2, hb, zb], Bk(bc.bx0, bb[3]), Bk(bc.bx1, bb[3]), Bk(bc.bx1, A.stall_back.rows.yS), Bk(bc.bx0, A.stall_back.rows.yS), 0, k);   // the back, outside
        tq([-w / 2, 0, zb + 0.02], [w / 2, 0, zb + 0.02], [w / 2, hb, zb + 0.02], [-w / 2, hb, zb + 0.02], ID.wood, -w / 2, w / 2, 0, hb, [0.45, 0.38, 0.34]);                       // and inside
        blockBox(F, o, 0, 0.05, w + 0.2, d + 0.3); return B;
      },
      // ---- a round tent: canvas walls (or the big top's door picture on the side that faces +z), a cone roof of the canvas or the big
      // top's roof picture seen from above, the valance round the roof's edge ----
      tentRound(o) {
        const F = frame(o), r = o.r || 2.5, wall = o.wall || 2.0, top = o.top || 4.2, cv = CANVAS[o.canvas || 'red'], k = null, seg = 48, R = r * 1.08;
        let a0 = 0, a1 = Math.PI * 2;
        if (o.door) {
          const D = A[o.door + '_door'], db = D.bb, dw = wall * (db[2] - db[0]) / (db[3] - db[1]), span = Math.min(Math.PI * 1.2, dw / r), Fd = au(o.door + '_door'), n = 16;
          for (let i = 0; i < n; i++) { const q0 = -span / 2 + span * i / n, q1 = -span / 2 + span * (i + 1) / n, P = (q, y) => [Math.sin(q) * r, y, Math.cos(q) * r], c = (q) => db[0] + (q + span / 2) / span * (db[2] - db[0]);
            quad(P(q0, 0), P(q1, 0), P(q1, wall), P(q0, wall), Fd(c(q0), db[3]), Fd(c(q1), db[3]), Fd(c(q1), db[1]), Fd(c(q0), db[1]), 0, k); }
          a0 = span / 2; a1 = Math.PI * 2 - span / 2;
        }
        tcyl(0, 0, r, r, 0, wall, Math.round(seg * (a1 - a0) / (Math.PI * 2)), cv, k, a0, a1);
        if (o.roof) { const Fr = au(o.roof + '_roof'), rb = A[o.roof + '_roof'].bb, n = seg;
          for (let i = 0; i < n; i++) { const q0 = i / n * 6.2832, q1 = (i + 1) / n * 6.2832, P = (q) => [Math.sin(q) * R, wall, Math.cos(q) * R], ap = [0, top, 0], U = (p) => Fr(rb[0] + (0.5 + p[0] / (2 * R)) * (rb[2] - rb[0]), rb[1] + (0.5 + p[2] / (2 * R)) * (rb[3] - rb[1]));
            const p0 = P(q0), p1 = P(q1); tri(p0, p1, ap, U(p0), U(p1), U(ap), 0, k); } }
        else tcyl(0, 0, R, 0.02, wall, top, seg, cv, k);
        if (o.trim) trimRing(0, 0, R + 0.012, wall + 0.02, o.trimH || (o.trim === 'bigtop' ? 0.36 : 0.46), seg, o.trim, k);
        tcyl(0, 0, 0.05, 0.05, top - 0.1, top + 0.45, 6, ID.dark, [0.9, 0.75, 0.55]);                                                    // the pole's top
        block(F, 0, 0, r + 0.1); return B;
      },
      // ---- a square tent: canvas walls (a door picture on its +z side if asked), a pyramid roof, the valance round the eaves ----
      tentSquare(o) {
        const F = frame(o), w = o.w || 3.5, d = o.d || 3.0, wall = o.wall || 2.0, top = o.top || 3.6, cv = CANVAS[o.canvas || 'red'], k = null, x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2;
        if (o.door) { const D = A[o.door + '_door'], db = D.bb, dw = Math.min(w, wall * (db[2] - db[0]) / (db[3] - db[1])), Fd = au(o.door + '_door');
          quad([-dw / 2, 0, z1], [dw / 2, 0, z1], [dw / 2, wall, z1], [-dw / 2, wall, z1], Fd(db[0], db[3]), Fd(db[2], db[3]), Fd(db[2], db[1]), Fd(db[0], db[1]), 0, k);
          if (dw < w) { tq([x0, 0, z1], [-dw / 2, 0, z1], [-dw / 2, wall, z1], [x0, wall, z1], cv, x0, -dw / 2, 0, wall, k); tq([dw / 2, 0, z1], [x1, 0, z1], [x1, wall, z1], [dw / 2, wall, z1], cv, dw / 2, x1, 0, wall, k); }
          tbox(x0, x1, 0, wall, z0, z1, cv, 'blr', k);
        } else tbox(x0, x1, 0, wall, z0, z1, cv, 'fblr', k);
        const kx = 1.07, X0 = x0 * kx, X1 = x1 * kx, Z0 = z0 * kx, Z1 = z1 * kx, ap = [0, top, 0], cs = [[X0, wall, Z1], [X1, wall, Z1], [X1, wall, Z0], [X0, wall, Z0]], m = TILE_M[cv];
        for (let e = 0; e < 4; e++) { const p0 = cs[e], p1 = cs[(e + 1) % 4], L = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]), sl = Math.hypot(top - wall, (e % 2 ? w : d) * kx / 2);
          tri(p0, p1, ap, [0, 0], [L / m, 0], [L / 2 / m, sl / m], cv, k);
          if (o.trim) { const off = (p) => [p[0] * 1.004, p[1] + 0.02, p[2] * 1.004]; trimLine(off(p0), off(p1), o.trimH || 0.42, o.trim, k); } }
        tcyl(0, 0, 0.05, 0.05, top - 0.1, top + 0.4, 6, ID.dark, [0.9, 0.75, 0.55]);
        blockBox(F, o, 0, 0, w + 0.2, d + 0.2); return B;
      },
      // ---- the shuttered booth: its front picture on the front wall, plank sides and back, a shingled roof ridged left to right ----
      booth(o) {
        const F = frame(o), w = o.w || 4, d = o.d || 2.2, h = o.h || 2.8, S = A.booth, b = S.bb, bx0 = S.cols.bx0, bx1 = S.cols.bx1, ppm = (bx1 - bx0) / w, k = null;
        const hw = Math.min((b[3] - S.rows.yE) / ppm, h * 0.78), T = au('booth'), ov = 0.25, wk = [0.82, 0.72, 0.66];
        quad([-w / 2, 0, d / 2], [w / 2, 0, d / 2], [w / 2, hw, d / 2], [-w / 2, hw, d / 2], T(bx0, b[3]), T(bx1, b[3]), T(bx1, S.rows.yE), T(bx0, S.rows.yE), 0, k);
        tbox(-w / 2, w / 2, 0, hw, -d / 2, d / 2, ID.wood, 'blr', wk);
        for (const sz of [-1, 1]) { const zE = sz * (d / 2 + ov), sl = Math.hypot(h - hw + 0.08, d / 2 + ov), p = [[-w / 2 - 0.15, hw - 0.08, zE], [w / 2 + 0.15, hw - 0.08, zE], [w / 2 + 0.15, h, 0], [-w / 2 - 0.15, h, 0]];
          if (sz > 0) tq(p[0], p[1], p[2], p[3], ID.shingle, 0, w + 0.3, 0, sl, k); else tq(p[1], p[0], p[3], p[2], ID.shingle, 0, w + 0.3, 0, sl, k); }
        for (const sx of [-1, 1]) { const x = sx * w / 2; if (sx > 0) tri([x, hw, d / 2], [x, hw, -d / 2], [x, h - 0.04, 0], [0, 0], [d / 1.6, 0], [d / 3.2, (h - hw) / 1.6], ID.wood, wk); else tri([x, hw, -d / 2], [x, hw, d / 2], [x, h - 0.04, 0], [0, 0], [d / 1.6, 0], [d / 3.2, (h - hw) / 1.6], ID.wood, wk); }
        blockBox(F, o, 0, 0, w + 0.25, d + 0.3); return B;
      },
      // ---- the painted wagon: its side picture on both sides (wheels and all, see-through between the spokes), its end picture on both
      // ends, a curved roof of dark planks (or shingles), a draw-bar at the front (its -x end) ----
      wagon(o) {
        const F = frame(o), w = o.w || 3.2, d = o.d || 1.6, S = A.wagon_side, b = S.bb, R = S.rows, E = A.wagon_end, e = E.bb, k = null;
        const ppm = (1348 - 294) / w, X = (px) => -w / 2 + (px - 294) / ppm, Y = (py) => (b[3] - py) / ppm, T = au('wagon_side'), U = au('wagon_end');
        for (const sz of [-1, 1]) { const z = sz * d / 2; quad([X(b[0]), Y(b[3]), z], [X(b[2]), Y(b[3]), z], [X(b[2]), Y(R.yE), z], [X(b[0]), Y(R.yE), z], T(b[0], b[3]), T(b[2], b[3]), T(b[2], R.yE), T(b[0], R.yE), 0, k); }
        const ppe = (E.cols.bx1 - E.cols.bx0) / d, Z = (px) => (px - (E.cols.bx0 + E.cols.bx1) / 2) / ppe, top = Y(b[1]);
        const rowsE = [[e[3], 0], [E.rows.yB, Y(R.yB)], [E.rows.yE, Y(R.yE)], [e[1], top]];
        for (const sx of [-1, 1]) { const x = sx * w / 2 + sx * 0.005;
          for (let i = 0; i < 3; i++) { const [ra, ya] = rowsE[i], [rb, yb] = rowsE[i + 1];
            if (sx < 0) quad([x, ya, Z(e[0])], [x, ya, Z(e[2])], [x, yb, Z(e[2])], [x, yb, Z(e[0])], U(e[0], ra), U(e[2], ra), U(e[2], rb), U(e[0], rb), 0, k);
            else quad([x, ya, Z(e[2])], [x, ya, Z(e[0])], [x, yb, Z(e[0])], [x, yb, Z(e[2])], U(e[0], ra), U(e[2], ra), U(e[2], rb), U(e[0], rb), 0, k); } }
        const yE = Y(R.yE), rz = d / 2 + 0.08, n = 10, xr0 = -w / 2 - 0.12, xr1 = w / 2 + 0.12, rid = o.roof === 'shingle' ? ID.shingle : ID.dark, rk = o.roof === 'shingle' ? [0.8, 0.7, 0.75] : [3.2, 2.7, 3.0], m = TILE_M[rid];
        for (let i = 0; i < n; i++) { const q0 = Math.PI * i / n, q1 = Math.PI * (i + 1) / n, P = (x, q) => [x, yE - 0.04 + (top - yE + 0.04) * Math.sin(q), rz * Math.cos(q)], s = (q) => q * rz * 1.2;
          if (rid === ID.dark) quad(P(xr0, q0), P(xr1, q0), P(xr1, q1), P(xr0, q1), [s(q0) / m, xr0 / m], [s(q0) / m, xr1 / m], [s(q1) / m, xr1 / m], [s(q1) / m, xr0 / m], rid, rk);
          else quad(P(xr0, q0), P(xr1, q0), P(xr1, q1), P(xr0, q1), [xr0 / m, -s(q0) / m], [xr1 / m, -s(q0) / m], [xr1 / m, -s(q1) / m], [xr0 / m, -s(q1) / m], rid, rk); }
        tbox(-w / 2 + 0.03, w / 2 - 0.03, Y(R.yB), yE, -d / 2 + 0.03, d / 2 - 0.03, ID.dark, 'd', [2, 1.8, 2]);
        const bar = (x0, y0, x1, y1, t) => { quad([x0, y0 - t, -t], [x1, y1 - t, -t], [x1, y1 - t, t], [x0, y0 - t, t], [0, 0], [1, 0], [1, 0.1], [0, 0.1], ID.wood, [0.6, 0.5, 0.45]); quad([x0, y0 - t, t], [x1, y1 - t, t], [x1, y1 + t, t], [x0, y0 + t, t], [0, 0], [1, 0], [1, 0.1], [0, 0.1], ID.wood, [0.6, 0.5, 0.45]); quad([x1, y1 - t, -t], [x0, y0 - t, -t], [x0, y0 + t, -t], [x1, y1 + t, -t], [0, 0], [1, 0], [1, 0.1], [0, 0.1], ID.wood, [0.6, 0.5, 0.45]); quad([x0, y0 + t, t], [x1, y1 + t, t], [x1, y1 + t, -t], [x0, y0 + t, -t], [0, 0], [1, 0], [1, 0.1], [0, 0.1], ID.wood, [0.6, 0.5, 0.45]); };
        bar(-w / 2, Y(R.yB) + 0.05, -w / 2 - 1.05, Y(R.yB) - 0.2, 0.045);
        blockBox(F, o, -0.1, 0, w + 0.5, d + 0.4); return B;
      },
      // ---- the well: a ring of rubble, two posts, a shingled roof ridged left to right; the bucket and the lantern (cards, from its picture) ----
      well(o) {
        const F = frame(o), r = o.r || 0.95, hr = 0.85, ri = r - 0.2, k = null, wk = [0.75, 0.62, 0.55];
        tcyl(0, 0, r, r, 0, hr, 24, ID.rubble, k); tcyl(0, 0, ri, ri, 0.3, hr, 20, ID.rubble, [0.5, 0.45, 0.45]);
        for (let i = 0; i < 24; i++) { const q0 = i / 24 * 6.2832, q1 = (i + 1) / 24 * 6.2832, P = (q, rr) => [Math.sin(q) * rr, hr, Math.cos(q) * rr], T = (p) => [p[0] / 2, p[2] / 2]; const a = P(q0, r), b2 = P(q1, r), c = P(q1, ri), dd = P(q0, ri); quad(dd, c, b2, a, T(dd), T(c), T(b2), T(a), ID.rubble, [1.1, 1.05, 1.05]); }
        disc(0, 0.32, 0, ri, 16, ID.dark, [0.25, 0.25, 0.35]);
        const ph = 2.15, px = r - 0.05; for (const sx of [-1, 1]) tbox(sx * px - 0.08, sx * px + 0.08, 0, ph, -0.08, 0.08, ID.wood, 'fblr', wk);
        tbox(-px - 0.12, px + 0.12, ph - 0.14, ph, -0.07, 0.07, ID.wood, 'fbtd', wk);
        const rw = r + 0.35, rt = 2.78, re = ph - 0.04, rd = 0.78;
        tq([-rw, re, rd], [rw, re, rd], [rw, rt, 0], [-rw, rt, 0], ID.shingle, -rw, rw, 0, Math.hypot(rd, rt - re), k); tq([rw, re, -rd], [-rw, re, -rd], [-rw, rt, 0], [rw, rt, 0], ID.shingle, -rw, rw, 0, Math.hypot(rd, rt - re), k);
        for (const sx of [-1, 1]) tri([sx * (px + 0.1), re, sx * rd * 0.8], [sx * (px + 0.1), re, -sx * rd * 0.8], [sx * (px + 0.1), rt - 0.04, 0], [0, 0], [1, 0], [0.5, 0.35], ID.wood, wk);
        // the bucket and lantern hang from the beam: their picture (cut from the well's) on a card across the well, and a card across that through the bucket
        const H = A.well_hang.bb, ppm = 427, cx = 508, X = (p) => (p - cx) / ppm, Y = (p) => ph - 0.12 - (p - H[1]) / ppm;
        card('well_hang', H[0], H[2], H[1], H[3], [X(H[0]), 0], [X(H[2]), 0], Y(H[3]), Y(H[1]), k);
        const bc = (H[0] + 560) / 2; card('well_hang', H[0], 560, H[1], H[3], [X(bc), -(560 - H[0]) / 2 / ppm], [X(bc), (560 - H[0]) / 2 / ppm], Y(H[3]), Y(H[1]), k);
        glow(X(650), Y(690), 0, 1.0, 0.8);
        block(F, 0, 0, r + 0.15); return B;
      },
      // ---- a lantern post: its post wrapped round a thin cylinder, the arm and lantern on a card, the lantern again on a card across it; a lamp ----
      lanternPost(o) {
        const F = frame(o), h = o.h || 3.3, S = A.post, b = S.bb, C = S.cols, ppm = (b[3] - b[1]) / h, cx = (C.px0 + C.px1) / 2, X = (p) => (p - cx) / ppm, Y = (p) => (b[3] - p) / ppm, k = null;
        lathe(0, 0, (t) => t < 0.12 ? 0.085 : 0.06, (t) => t * h, 8, 2, 'post', Math.max(C.px0, b[0]), C.px1, b[1], b[3], k);
        card('post', C.px1 - 6, b[2], b[1], 540, [X(C.px1 - 6), 0], [X(b[2]), 0], Y(540), Y(b[1]), k);
        card('post', 500, b[2], 165, 535, [X(C.lx), -(C.lx - 500) / ppm], [X(C.lx), (b[2] - C.lx) / ppm], Y(535), Y(165), k);
        glow(X(C.lx), Y(C.ly), 0, 1.3, 1);
        block(F, 0, 0, 0.22); return B;
      },
      crate(o) { const F = frame(o); pbox(o.w || 1.1, o.d || 0.9, o.h || 0.75, 0, 'crate', null, 'pic', null); blockBox(F, o, 0, 0, (o.w || 1.1) + 0.2, (o.d || 0.9) + 0.2); return B; },
      crateTall(o) { const F = frame(o); pbox(o.w || 0.75, o.d || 0.75, o.h || 1.4, 0, 'crate_tall', null, 'pic', null); blockBox(F, o, 0, 0, (o.w || 0.75) + 0.2, (o.d || 0.75) + 0.2); return B; },
      barrel(o) { return keg(o, 'barrel', o.r || 0.38, o.h || 0.95); },
      keg(o) { return keg(o, 'keg', o.r || 0.3, o.h || 0.6); },
      // ---- a straw bale: its picture on all four sides, straw on top ----
      bale(o) { const F = frame(o), w = o.w || 1.1, d = o.d || 0.55, h = o.h || 0.5; pbox(w, d, h, 0, 'bale', 'bale', ID.straw, [0.62, 0.55, 0.5]); blockBox(F, o, 0, 0, w + 0.15, d + 0.15); return B; },
      // ---- a coil of rope: its picture round a low cylinder, straw-coloured rope on top ----
      rope(o) {
        const F = frame(o), r = o.r || 0.5, h = o.h || 0.32, b = A.rope.bb, T = au('rope'), n = 20, m = 3; lathe(0, 0, () => r, (t) => t * h, 16, 1, 'rope', b[0], 755, b[1], b[3], null);
        // its top: the rope's own picture laid round in rings (the picture's rows out from the middle, its length round the coil)
        for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const P = (ii, jj) => { const q = ii / n * 6.2832, rr = r * (0.25 + 0.75 * jj / m); return [Math.sin(q) * rr, h, Math.cos(q) * rr]; }, U = (ii, jj) => T(b[0] + 10 + (ii % 2 ? 280 : 0), b[1] + 8 + (b[3] - b[1] - 16) * jj / m);
          quad(P(i, j + 1), P(i + 1, j + 1), P(i + 1, j), P(i, j), U(i, j + 1), U(i + 1, j + 1), U(i + 1, j), U(i, j), 0, [0.85, 0.8, 0.78]); }
        disc(0, h - 0.01, 0, r * 0.26, 8, ID.dark, [0.6, 0.5, 0.45]); block(F, 0, 0, r + 0.08); return B; },
      // ---- the brazier: two crossed cards, its coals glowing; a fire and a lamp ----
      brazier(o) {
        const F = frame(o), w = o.w || 0.8, b = A.brazier.bb, ppm = (b[2] - b[0]) / w, h = (b[3] - b[1]) / ppm;
        for (const q of [0, Math.PI / 2]) { const c = Math.cos(q) * w / 2, s = Math.sin(q) * w / 2; card('brazier', b[0], b[2], b[1], b[3], [-c, s], [c, -s], 0, h, null); }
        const L = glow(0, h * 0.82, 0, 0, 1.3);           // a lamp (its light) but no glow: the fire's own flames glow L.fire = true; const [x, z] = F.at(0, 0); fires.push({ x, y: F.y + h * 0.78, z, r: w * 0.35 });
        block(F, 0, 0, w / 2 + 0.1); return B;
      },
      // ---- a small table: its picture on all four sides (see-through between the legs), planks on top ----
      table(o) { const F = frame(o), w = o.w || 1.0, d = o.d || 0.7, h = o.h || 0.8; pbox(w, d, h, 0, 'table', 'table', ID.wood, null); blockBox(F, o, 0, 0, w + 0.15, d + 0.15); return B; },
      // ---- the fair gate: two posts and a bar, each its own part of the gate's picture wrapped round a cylinder; across local x ----
      gate(o) {
        const F = frame(o), span = o.span || 4.6, h = o.h || 2.9, S = A.gate, b = S.bb, k = null, r = o.r || 0.13;
        for (const [sx, c] of [[-1, S.cols.p0], [1, S.cols.p1]]) lathe(sx * span / 2, 0, () => r, (t) => t * h, 10, 1, 'gate', c[0], c[1], b[1], b[3], k);
        const yb = h * (1 - (((S.rows.b0 + S.rows.b1) / 2) - b[1]) / (b[3] - b[1])), rb = 0.075, Fg = au('gate'), n = 8, x0 = -span / 2, x1 = span / 2, c0 = S.cols.p0[1], c1 = S.cols.p1[0], vm = (S.rows.b0 + S.rows.b1) / 2, vh = (S.rows.b1 - S.rows.b0) / 2;
        for (let i = 0; i < n; i++) { const q0 = i / n * 6.2832, q1 = (i + 1) / n * 6.2832, P = (x, q) => [x, yb + Math.sin(q) * rb, Math.cos(q) * rb], N = (q) => [0, Math.sin(q), Math.cos(q)], V = (q) => vm - Math.sin(q) * vh;
          vert(P(x0, q0), N(q0), Fg(c0, V(q0)), 0, k); vert(P(x1, q0), N(q0), Fg(c1, V(q0)), 0, k); vert(P(x1, q1), N(q1), Fg(c1, V(q1)), 0, k); vert(P(x0, q0), N(q0), Fg(c0, V(q0)), 0, k); vert(P(x1, q1), N(q1), Fg(c1, V(q1)), 0, k); vert(P(x0, q1), N(q1), Fg(c0, V(q1)), 0, k); }
        block(F, -span / 2, 0, r + 0.12); block(F, span / 2, 0, r + 0.12); return B;
      },
      // ---- a log post (a mooring bollard, a stake): one post of the gate's picture, its rope lashing at the top, wrapped round a cylinder ----
      bollard(o) { const F = frame(o), S = A.gate, b = S.bb, r = o.r || 0.2, h = o.h || 1.1, c = S.cols.p0, y0 = b[1] + (b[3] - b[1]) * 0.04; lathe(0, 0, () => r, (t) => t * h, 10, 1, 'gate', c[0], c[1], y0, y0 + (c[1] - c[0]) * h / (2 * r) * 0.75, null); disc(0, h, 0, r, 10, ID.wood, [0.6, 0.48, 0.4]); block(F, 0, 0, r + 0.1); return B; },
      // ---- the bread oven cart: its picture on both long sides, a plank body between, the oven's dome and chimney in the round ----
      ovenCart(o) {
        const F = frame(o), w = o.w || 2.4, d = o.d || 1.5, S = A.oven, b = S.bb, C = S.cols, R = S.rows, ppm = (b[2] - b[0]) / w, X = (p) => (p - (b[0] + b[2]) / 2) / ppm, Y = (p) => (b[3] - p) / ppm, T = au('oven'), k = null;
        for (const sz of [-1, 1]) { const z = sz * d / 2; quad([X(b[0]), 0, z], [X(b[2]), 0, z], [X(b[2]), Y(b[1]), z], [X(b[0]), Y(b[1]), z], T(b[0], b[3]), T(b[2], b[3]), T(b[2], b[1]), T(b[0], b[1]), 0, k); }
        tbox(X(C.bx0), X(C.bx1), Y(R.yB), Y(R.yD), -d / 2 + 0.02, d / 2 - 0.02, ID.wood, 'lrtd', [0.62, 0.5, 0.42]);
        const dr = C.dr / ppm, dz = Math.min(dr, d / 2 - 0.06), dy = Y(R.yD), dx = X(C.dx), n = 14, m = 6;
        for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const P = (ii, jj) => { const q = ii / n * 6.2832, t = jj / m * Math.PI / 2; return [dx + Math.sin(q) * Math.cos(t) * dr, dy + Math.sin(t) * dr, Math.cos(q) * Math.cos(t) * dz]; }, T2 = (p) => [(p[0] + p[2]) / 1.4, p[1] / 1.4];
          const a = P(i, j), b2 = P(i + 1, j), c = P(i + 1, j + 1), dd = P(i, j + 1); quad(a, b2, c, dd, T2(a), T2(b2), T2(c), T2(dd), ID.rubble, [1.25, 0.95, 0.85]); }
        tcyl(dx, 0, 0.12, 0.12, dy + dr * 0.8, Y(b[1]), 8, ID.dark, [1.6, 1.35, 1.3]);
        blockBox(F, o, 0, 0, w + 0.2, d + 0.2); return B;
      },
      // ---- the pie cart: its picture on both long sides, a cloth over the top, plank ends, two shafts to the front (-x) ----
      pieCart(o) {
        const F = frame(o), w = o.w || 2.2, d = o.d || 1.2, S = A.pie, b = S.bb, R = S.rows, ppm = (1408 - 94) / w, X = (p) => (p - 751) / ppm, Y = (p) => (b[3] - p) / ppm, T = au('pie'), k = null;
        for (const sz of [-1, 1]) { const z = sz * d / 2; quad([X(b[0]), 0, z], [X(b[2]), 0, z], [X(b[2]), Y(b[1]), z], [X(b[0]), Y(b[1]), z], T(b[0], b[3]), T(b[2], b[3]), T(b[2], b[1]), T(b[0], b[1]), 0, k); }
        const x0 = X(445), x1 = X(1385);
        tbox(x0, x1, Y(R.yC), Y(R.yT), -d / 2 + 0.01, d / 2 - 0.01, ID.awning, 'lrt', [0.8, 0.7, 0.62]);
        tbox(x0 + 0.04, x1 - 0.04, Y(R.yB), Y(R.yC), -d / 2 + 0.03, d / 2 - 0.03, ID.wood, 'lrd', [0.62, 0.5, 0.42]);
        for (const sz of [-0.32, 0.32]) tbox(X(94), x0 + 0.05, Y(640), Y(600), sz - 0.04, sz + 0.04, ID.wood, 'fbtd', [0.62, 0.5, 0.42]);
        blockBox(F, o, (x0 + x1) / 2, 0, x1 - x0 + 0.2, d + 0.2); return B;
      },
      // ---- the pieces gathered into one mesh and one glow ----
      finish(scene, o2) {
        o2 = o2 || {}; const out = { blockers, lamps, fires, mesh: null, glow: null, geometry: null, gain: opts.gain || [1, 1, 1] };
        if (pos.length) {
          const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('aK', new THREE.Float32BufferAttribute(kk, 4)); g.computeBoundingSphere();
          out.mesh = new THREE.Mesh(g, material(opts.gain || [1, 1, 1], opts.glow == null ? 1.6 : opts.glow, opts.sat == null ? 1 : opts.sat)); out.geometry = g; if (scene) scene.add(out.mesh);
        }
        if (gpos.length) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(gpos, 3)); g.setAttribute('aG', new THREE.Float32BufferAttribute(gofs, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(guv, 2)); g.computeBoundingSphere(); g.boundingSphere.radius += 1; out.glow = new THREE.Mesh(g, glowMaterial()); out.glow.renderOrder = 3; if (scene) scene.add(out.glow); }
        out.triangles = pos.length / 9; return out;
      },
    };
    function keg(o, name, r, h) {
      const F = frame(o), b = A[name].bb, k = null;
      lathe(0, 0, (t) => r * (0.86 + 0.14 * Math.sin(Math.PI * t)), (t) => t * h, 16, 6, name, b[0], b[2], b[1], b[3], k);
      disc(0, h, 0, r * 0.86, 16, ID.wood, [0.5, 0.4, 0.34]); block(F, 0, 0, r + 0.08); return B;
    }
    return B;
  };
  // several batches' pieces (each already finished without a scene) drawn as one mesh and one glow: each batch's gain is baked into its
  // pieces' tint, so places lit differently still share a draw. Returns { mesh, glow }.
  KIT.merge = function (outs, scene, opts) {
    opts = opts || {}; const res = { mesh: null, glow: null }, cat = (list, name, sz, f) => { let n = 0; for (const g of list) n += g.attributes[name].count; const a = new Float32Array(n * sz); let o = 0; list.forEach((g, i) => { const src = g.attributes[name].array; if (f) for (let j = 0; j < src.length; j += sz) f(a, o + j, src, j, i); else a.set(src, o); o += src.length; }); return new THREE.BufferAttribute(a, sz); };
    const gs = outs.filter((o) => o && o.geometry), gains = gs.map((o) => o.gain || [1, 1, 1]);
    if (gs.length) { const geos = gs.map((o) => o.geometry), g = new THREE.BufferGeometry();
      g.setAttribute('position', cat(geos, 'position', 3)); g.setAttribute('normal', cat(geos, 'normal', 3)); g.setAttribute('uv', cat(geos, 'uv', 2));
      g.setAttribute('aK', cat(geos, 'aK', 4, (a, o, s2, j, i) => { a[o] = s2[j] * gains[i][0]; a[o + 1] = s2[j + 1] * gains[i][1]; a[o + 2] = s2[j + 2] * gains[i][2]; a[o + 3] = s2[j + 3]; }));
      g.computeBoundingSphere(); res.mesh = new THREE.Mesh(g, material([1, 1, 1], opts.glow == null ? 1.6 : opts.glow, opts.sat == null ? 1 : opts.sat)); if (scene) scene.add(res.mesh); }
    const gl = outs.filter((o) => o && o.glow).map((o) => o.glow.geometry);
    if (gl.length) { const g = new THREE.BufferGeometry(); g.setAttribute('position', cat(gl, 'position', 3)); g.setAttribute('aG', cat(gl, 'aG', 3)); g.setAttribute('uv', cat(gl, 'uv', 2)); g.computeBoundingSphere(); g.boundingSphere.radius += 1; res.glow = new THREE.Mesh(g, glowMaterial()); res.glow.renderOrder = 3; if (scene) scene.add(res.glow); }
    return res;
  };
  // one at a time, into a batch of their own until flushed
  let def = null;
  for (const k of ['stall', 'tentRound', 'tentSquare', 'booth', 'wagon', 'well', 'lanternPost', 'crate', 'crateTall', 'barrel', 'keg', 'bale', 'rope', 'brazier', 'table', 'gate', 'bollard', 'ovenCart', 'pieCart']) KIT[k] = (o) => { def = def || KIT.batch(); def[k](o); return def; };
  KIT.flush = (scene, opts) => { const b = def; def = null; return b ? b.finish(scene, opts) : null; };

  // ---- the plants' crossed cards (the bare thorn tree, the reeds), for many copies (instanced, ow-props.js) ----
  KIT.plantGeo = function (kind) {
    const P = window.OW_DATA.kit.plants[kind], r = P.rect, pos = [], nrm = [], uv = [], col = [];
    const U = (fx, fy) => [r[0] + fx * r[2], 1 - (r[1] + fy * r[3])];
    const card = (q, f0, f1, w, h, ox) => { const c = Math.cos(q), s = Math.sin(q), P2 = (x, y) => [x * c, y, -x * s]; const xs = [ox - 0, ox + w];
      const a = P2(xs[0], 0), b = P2(xs[1], 0), cc = P2(xs[1], h), d = P2(xs[0], h), n = [s, 0.35, c];
      for (const [p, t] of [[a, U(f0, 1)], [b, U(f1, 1)], [cc, U(f1, 0)], [a, U(f0, 1)], [cc, U(f1, 0)], [d, U(f0, 0)]]) { pos.push(...p); nrm.push(...n); uv.push(...t); col.push(1, 1, 1); } };
    if (kind === 'thorn') { const ar = P.rect[2] / P.rect[3], base = 0.16; for (const q of [0, 1.05]) card(q, 0, 1, ar, 1, -base * ar); }       // 1 m tall, the trunk's foot at the middle
    else { for (let i = 0; i < 3; i++) { const q = i * Math.PI / 3, f0 = i / 3, f1 = (i + 1) / 3, ar = (P.rect[2] / 3) / P.rect[3]; card(q, f0, f1, ar, 1, -ar / 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return g;
  };
  KIT.plantMat = function (tint, sway) {
    const t = OW.tex(window.OW_DATA.img.kit_plants);
    return new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: Object.assign({ tP: { value: t }, uTint: { value: new THREE.Vector3(...tint) }, uSway: { value: sway || 0 } }, OW.U),
      vertexShader: `uniform float uTime, uSway; varying vec3 vP; varying vec3 vN; varying vec2 vUv;
        void main() { mat4 m = modelMatrix;
          #ifdef USE_INSTANCING
            m = m * instanceMatrix;
          #endif
          vec4 w = m * vec4(position, 1.0); float k = position.y * position.y; w.x += uSway * k * sin(uTime * 1.3 + w.x * 0.4 + w.z * 0.3); w.z += uSway * 0.6 * k * sin(uTime * 1.1 + w.z * 0.5);
          vP = w.xyz; vN = normalize(mat3(m) * normal); vUv = uv; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: OW.GLSL + `uniform sampler2D tP; uniform vec3 uTint; varying vec3 vP; varying vec3 vN; varying vec2 vUv;
        void main() { vec4 c = texture2D(tP, vUv); if (c.a < 0.5) discard; vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
          vec3 col = s2l(c.rgb) * uTint * owLight(n, vP, 0.6); col = owFog(col, vP); ` + OW.out + ` }` });
  };
})(window.OW);
