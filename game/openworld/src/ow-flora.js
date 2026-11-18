// ow-flora.js: what grows on the open moor besides the heather and the gorse: flowers of the moor in drifts (lavender-like spikes,
// cotton-grass in the wet, small yellow flowers low in the turf, harebells, foxgloves by walls, rocks and gorse), grasses (pale moor-grass
// tussocks, rushes in the wet), low shrubs (bilberry, bracken), and a few trees (wind-bent thorns standing alone, small stands of rowan
// and birch in the dips, by the stream and along the moor's edge).
// The small plants are sown on a grid fixed to the ground round her (so they do not swim as she walks), worked out once per square and
// kept, gathered again only when she has moved a few metres, and shrunk to nothing toward the edge so none pops in. Each kind is one
// shape made here and drawn many times (one draw a kind). The trees are the same everywhere on the map and each blocks her at its trunk.
// Everything is lit and fogged as the land is, and sways a little in the wind (in the drawing, from the time: no work here per frame).
(function (OW) {
  'use strict';
  OW.makeFlora = function (scene, land, macroImg) {
    const F = window.OW_DATA.F, U = OW.U, WL = land.WL, sm = land.smooth;
    const lin = (c) => c.map((v) => Math.pow(v, 2.2));
    const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

    // ---- the painted map, small: is it heather (purple) or turf (yellow-green) here ----
    const MW = 384, MH = 256, cv = document.createElement('canvas'); cv.width = MW; cv.height = MH;
    const cg = cv.getContext('2d', { willReadFrequently: true }); cg.drawImage(macroImg, 0, 0, MW, MH); const px = cg.getImageData(0, 0, MW, MH).data;
    function mapAt(x, z) { const u = Math.max(0, Math.min(MW - 1, Math.round((x + 384) / 2))), v = Math.max(0, Math.min(MH - 1, Math.round((z + 256) / 2))), i = (v * MW + u) * 4; return [(px[i] + px[i + 2]) / 2 - px[i + 1], (px[i] + px[i + 1]) / 2 - px[i + 2]]; }

    // ---- shapes, built a triangle at a time with their own colours (linear) and normals ----
    function Builder() {
      const P = [], N = [], C = [];
      const v = (p, n, c) => { P.push(p[0], p[1], p[2]); N.push(n[0], n[1], n[2]); C.push(c[0], c[1], c[2]); };
      const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
      const b = {
        // a thin piece of leaf or petal: lit as if it faced up and out, the same from either side
        leaf(a, bb, c, ca, cb, cc, up) {
          const e1 = [bb[0] - a[0], bb[1] - a[1], bb[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
          let n = nrm([e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]); if (n[1] < 0) n = [-n[0], -n[1], -n[2]];
          n = nrm([n[0], n[1] + (up === undefined ? 0.9 : up), n[2]]); v(a, n, ca); v(bb, n, cb || ca); v(c, n, cc || ca);
        },
        // a triangle of something solid: each corner lit along its own way out from the middle o
        solid(a, bb, c, ca, cb, cc, o) { for (const [p, col] of [[a, ca], [bb, cb || ca], [c, cc || ca]]) v(p, nrm([p[0] - o[0], p[1] - o[1] + 0.15, p[2] - o[2]]), col); },
        // a blade from (x, 0, z), leaning toward angle ang, h tall, w wide at the foot, in segs pieces
        blade(x, y, z, ang, h, w, lean, segs, c0, c1, up) {
          const ca = Math.cos(ang), sa = Math.sin(ang), qx = -sa, qz = ca;
          const pt = (t) => [x + ca * lean * h * t * t, y + h * t * (1 - 0.25 * lean * lean * t), z + sa * lean * h * t * t];
          for (let s = 0; s < segs; s++) {
            const t0 = s / segs, t1 = (s + 1) / segs, p0 = pt(t0), p1 = pt(t1), w0 = w * (1 - t0) / 2, w1 = w * (1 - t1) / 2, k0 = mixc(c0, c1, t0), k1 = mixc(c0, c1, t1);
            const L0 = [p0[0] - qx * w0, p0[1], p0[2] - qz * w0], R0 = [p0[0] + qx * w0, p0[1], p0[2] + qz * w0];
            if (s === segs - 1) b.leaf(L0, R0, p1, k0, k0, k1, up);
            else { const L1 = [p1[0] - qx * w1, p1[1], p1[2] - qz * w1], R1 = [p1[0] + qx * w1, p1[1], p1[2] + qz * w1]; b.leaf(L0, R0, R1, k0, k0, k1, up); b.leaf(L0, R1, L1, k0, k1, k1, up); }
          }
          return pt(1);
        },
        // a spindle (two cones base to base): a flower head, a bud, a berry
        spike(x, y, z, r, len, sides, c0, c1, rot) {
          const lo = [x, y, z], hi = [x, y + len, z], ym = y + len * 0.4, o = [x, y + len * 0.45, z];
          for (let s = 0; s < sides; s++) {
            const a0 = (s / sides) * 6.2832 + (rot || 0), a1 = ((s + 1) / sides) * 6.2832 + (rot || 0);
            const p0 = [x + Math.cos(a0) * r, ym, z + Math.sin(a0) * r], p1 = [x + Math.cos(a1) * r, ym, z + Math.sin(a1) * r];
            b.solid(lo, p0, p1, c0, mixc(c0, c1, 0.4), mixc(c0, c1, 0.4), o); b.solid(p0, hi, p1, mixc(c0, c1, 0.4), c1, mixc(c0, c1, 0.4), o);
          }
        },
        // an open bell hanging from (x, y, z): its mouth len below, r wide, tipped toward angle ang by tip
        bell(x, y, z, r, len, sides, c0, c1, ang, tip) {
          const dx = Math.cos(ang) * tip, dz = Math.sin(ang) * tip, top = [x, y, z], o = [x + dx * len * 0.5, y - len * 0.5, z + dz * len * 0.5];
          for (let s = 0; s < sides; s++) {
            const a0 = (s / sides) * 6.2832, a1 = ((s + 1) / sides) * 6.2832;
            const m0 = [x + dx * len + Math.cos(a0) * r, y - len, z + dz * len + Math.sin(a0) * r], m1 = [x + dx * len + Math.cos(a1) * r, y - len, z + dz * len + Math.sin(a1) * r];
            b.solid(top, m0, m1, c0, c1, c1, o);
          }
        },
        // a flat flower facing up: petals round a middle
        star(x, y, z, r, petals, col, rot) {
          for (let s = 0; s < petals; s++) {
            const a = (s / petals) * 6.2832 + rot, w = 3.1416 / petals * 0.8;
            b.leaf([x, y + 0.004, z], [x + Math.cos(a - w) * r, y, z + Math.sin(a - w) * r], [x + Math.cos(a + w) * r, y, z + Math.sin(a + w) * r], col, col, col, 2.5);
          }
        },
        // a lumpy ball (a crown of leaves, a shrub): 20 faces
        blob(x, y, z, sx, sy, sz, c0, c1, seed) {
          const g = new THREE.IcosahedronGeometry(1, 0), p = g.attributes.position, pts = [];
          for (let i = 0; i < p.count; i++) { const X = p.getX(i), Y = p.getY(i), Z = p.getZ(i), n = 1 + 0.22 * land.vn(X * 1.7 + seed, Z * 1.7 + Y * 1.3 - seed); pts.push([x + X * sx * n, y + Y * sy * n, z + Z * sz * n, Y]); }
          for (let i = 0; i < pts.length; i += 3) { const q = [pts[i], pts[i + 1], pts[i + 2]]; b.solid(q[0], q[1], q[2], mixc(c0, c1, q[0][3] * 0.5 + 0.5), mixc(c0, c1, q[1][3] * 0.5 + 0.5), mixc(c0, c1, q[2][3] * 0.5 + 0.5), [x, y - sy * 0.3, z]); }
        },
        // a trunk or a branch: rings along a line of points, each with its radius and colour
        tube(pts, radii, cols, sides) {
          const ring = (k, s) => { const a = (s / sides) * 6.2832, p = pts[k]; return [p[0] + Math.cos(a) * radii[k], p[1], p[2] + Math.sin(a) * radii[k]]; };
          for (let k = 0; k < pts.length - 1; k++) for (let s = 0; s < sides; s++) {
            const a = ring(k, s), bb = ring(k, s + 1), c = ring(k + 1, s), d = ring(k + 1, s + 1), o0 = pts[k], o1 = pts[k + 1];
            const na = (p, o) => [p[0] - o[0], 0.1, p[2] - o[2]];
            v(a, nrm(na(a, o0)), cols[k]); v(bb, nrm(na(bb, o0)), cols[k]); v(d, nrm(na(d, o1)), cols[k + 1]);
            v(a, nrm(na(a, o0)), cols[k]); v(d, nrm(na(d, o1)), cols[k + 1]); v(c, nrm(na(c, o1)), cols[k + 1]);
          }
        },
        geo() { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeBoundingSphere(); return g; },
      };
      return b;
    }
    let seed = 7031; const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
    const R = (a, b2) => a + (b2 - a) * rnd();

    // ---- one material for all of them: their own colours, lit and fogged like the land; the wind moves the tips (more the higher) ----
    function mat(sway, h, wrap) {
      return new THREE.ShaderMaterial({ side: THREE.DoubleSide, vertexColors: true, uniforms: Object.assign({ uSway: { value: sway }, uH: { value: h }, uWrap: { value: wrap } }, U),
        vertexShader: `uniform float uTime; uniform float uSway; uniform float uH; varying vec3 vP; varying vec3 vN; varying vec3 vC;
          void main() {
            #ifdef USE_INSTANCING
              mat4 m = modelMatrix * instanceMatrix;
            #else
              mat4 m = modelMatrix;
            #endif
            vec4 w = m * vec4(position, 1.0);
            float hv = fract(sin(dot(m[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
            float k = max(position.y, 0.0) / uH; k = uSway * k * k * length(m[1].xyz);
            float ph = uTime * (1.2 + 0.5 * hv) + dot(m[3].xz, vec2(0.21, 0.13));
            float gust = 0.55 + 0.45 * sin(uTime * 0.31 + m[3].x * 0.015 + m[3].z * 0.011);
            w.x += k * gust * (0.55 + 0.45 * sin(ph)); w.z -= k * gust * (0.2 + 0.35 * sin(ph * 1.37 + 2.0));
            vP = w.xyz; vN = normalize(mat3(m) * normal); vC = color * (0.84 + 0.32 * hv);
            gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: OW.GLSL + `uniform float uWrap; varying vec3 vP; varying vec3 vN; varying vec3 vC;
          void main() {
            vec3 n = normalize(vN); vec3 col = vC * owLight(n, vP, uWrap); col = owFog(col, vP);
            ` + OW.out + `
          }` });
    }

    // ---- the small plants: each kind's shape ----
    const COL = {
      stem: lin([0.17, 0.20, 0.12]), stemHi: lin([0.25, 0.28, 0.17]), lavLeaf: lin([0.22, 0.26, 0.20]), lav: lin([0.33, 0.25, 0.49]), lavHi: lin([0.45, 0.37, 0.61]),
      cotton: lin([0.52, 0.52, 0.50]), cottonHi: lin([0.64, 0.64, 0.62]), sedge: lin([0.20, 0.19, 0.10]), sedgeHi: lin([0.36, 0.30, 0.14]),
      yel: lin([0.70, 0.58, 0.16]), yelLeaf: lin([0.15, 0.19, 0.09]), hare: lin([0.34, 0.38, 0.62]), hareHi: lin([0.50, 0.54, 0.76]),
      fox: lin([0.48, 0.24, 0.43]), foxHi: lin([0.64, 0.42, 0.60]), foxLeaf: lin([0.14, 0.18, 0.09]),
      grass0: lin([0.15, 0.14, 0.08]), grass1: lin([0.50, 0.45, 0.31]), rush0: lin([0.11, 0.14, 0.07]), rush1: lin([0.30, 0.33, 0.17]), rushFl: lin([0.30, 0.22, 0.11]),
      bil0: lin([0.085, 0.10, 0.065]), bil1: lin([0.17, 0.18, 0.11]), bilRed: lin([0.17, 0.11, 0.11]), br0: lin([0.11, 0.085, 0.055]), br1: lin([0.27, 0.18, 0.11]), brG: lin([0.15, 0.16, 0.09]), brS: lin([0.12, 0.09, 0.06]),
    };
    const shapes = {
      lav() { const b = Builder();
        for (let i = 0; i < 4; i++) b.blade(R(-0.05, 0.05), 0, R(-0.05, 0.05), i * 1.57 + R(0, 1), R(0.14, 0.2), 0.07, 0.9, 1, COL.stem, COL.lavLeaf, 0.5);
        for (let i = 0; i < 7; i++) { const a = i * 0.898 + R(-0.3, 0.3), r = R(0.02, 0.12), h = R(0.4, 0.6), x = Math.cos(a) * r, z = Math.sin(a) * r;
          const tip = b.blade(x, 0, z, a, h * 0.64, 0.014, R(0.2, 0.45), 1, COL.stem, COL.stemHi, 0.6);
          b.spike(tip[0], tip[1] - 0.01, tip[2], 0.026, h * 0.38, 3, COL.lav, COL.lavHi, a); }
        return b.geo(); },
      cotton() { const b = Builder();
        for (let i = 0; i < 3; i++) b.blade(R(-0.03, 0.03), 0, R(-0.03, 0.03), i * 2.1 + R(0, 1), R(0.14, 0.22), 0.03, 0.7, 1, COL.sedge, COL.sedgeHi, 0.5);
        for (let i = 0; i < 5; i++) { const a = i * 1.257 + R(-0.4, 0.4), r = R(0.0, 0.07), h = R(0.26, 0.42);
          const tip = b.blade(Math.cos(a) * r, 0, Math.sin(a) * r, a, h, 0.016, R(0.15, 0.4), 2, COL.sedge, COL.sedgeHi, 0.6);
          b.spike(tip[0] + Math.cos(a) * 0.012, tip[1] - 0.05, tip[2] + Math.sin(a) * 0.012, 0.026, 0.065, 4, COL.cotton, COL.cottonHi, a); }
        return b.geo(); },
      yel() { const b = Builder();
        for (let i = 0; i < 3; i++) b.blade(0, 0, 0, i * 2.1 + R(0, 1), 0.07, 0.07, 1.2, 1, COL.yelLeaf, COL.yelLeaf, 1.2);
        for (let i = 0; i < 5; i++) { const a = i * 1.257 + R(-0.4, 0.4), r = R(0.03, 0.13), x = Math.cos(a) * r, z = Math.sin(a) * r, h = R(0.07, 0.14);
          b.blade(x * 0.3, 0, z * 0.3, a, h, 0.01, 0.6, 1, COL.yelLeaf, COL.stem, 0.6);
          b.star(x + Math.cos(a) * h * 0.25, h * 0.92, z + Math.sin(a) * h * 0.25, 0.032, 4, COL.yel, R(0, 1.5)); }
        return b.geo(); },
      hare() { const b = Builder();
        for (let i = 0; i < 2; i++) b.blade(0, 0, 0, i * 3 + R(0, 1), 0.08, 0.05, 1.1, 1, COL.stem, COL.stem, 1.0);
        for (let i = 0; i < 3; i++) { const a = i * 2.1 + R(-0.4, 0.4), h = R(0.22, 0.34);
          const tip = b.blade(Math.cos(a) * 0.02, 0, Math.sin(a) * 0.02, a, h, 0.012, R(0.35, 0.55), 2, COL.stem, COL.stemHi, 0.6);
          b.bell(tip[0], tip[1], tip[2], 0.032, 0.055, 5, COL.hare, COL.hareHi, a, 0.6); }
        return b.geo(); },
      fox() { const b = Builder(), H = 1.15;
        for (let i = 0; i < 5; i++) b.blade(0, 0, 0, i * 1.257 + R(-0.2, 0.2), R(0.2, 0.28), 0.1, 1.3, 2, COL.foxLeaf, COL.foxLeaf, 0.7);
        b.blade(0, 0, 0, 0, H, 0.03, 0.08, 2, COL.foxLeaf, COL.stem, 0.6);
        for (let i = 0; i < 10; i++) { const t = 0.45 + i * 0.052, y = H * t, sz = 0.075 * (1 - (i / 10) * 0.65), a = -0.5 + R(-0.7, 0.7), x = 0.08 * t * t;
          b.bell(x + Math.cos(a) * 0.02, y, Math.sin(a) * 0.02, sz * 0.5, sz * 1.3, 4, COL.fox, COL.foxHi, a, 0.8); }
        return b.geo(); },
      tussock() { const b = Builder();
        for (let i = 0; i < 8; i++) { const a = i * 0.785 + R(-0.3, 0.3); b.blade(Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04, a, R(0.32, 0.55), R(0.035, 0.05), R(0.45, 0.85), 2, COL.grass0, COL.grass1, 0.8); }
        return b.geo(); },
      rush() { const b = Builder();
        for (let i = 0; i < 12; i++) { const a = rnd() * 6.28, r = R(0, 0.06), h = R(0.45, 0.78), top = b.blade(Math.cos(a) * r, 0, Math.sin(a) * r, a, h, 0.022, R(0.03, 0.2), 1, COL.rush0, COL.rush1, 0.4);
          if (i % 5 === 0) b.spike(top[0] - Math.cos(a) * 0.01, h * 0.72, top[2] - Math.sin(a) * 0.01, 0.014, 0.04, 3, COL.rushFl, COL.rushFl, a); }
        return b.geo(); },
      bil() { const b = Builder();
        b.blob(0, 0.05, 0, 0.3, 0.26, 0.3, COL.bil0, COL.bil1, 1.3);
        b.blob(0.3, 0.03, 0.18, 0.22, 0.2, 0.22, COL.bil0, COL.bilRed, 4.1);
        b.blob(-0.26, 0.02, 0.24, 0.2, 0.17, 0.2, COL.bil0, COL.bil1, 2.7);
        b.blob(-0.1, 0.02, -0.3, 0.2, 0.16, 0.2, COL.bil0, COL.bil1, 6.1);
        return b.geo(); },
      bracken() { const b = Builder();
        for (let i = 0; i < 7; i++) { const a = i * 0.898 + R(-0.3, 0.3), ca = Math.cos(a), sa = Math.sin(a), qx = -sa, qz = ca, H = R(0.12, 0.42), L = R(0.32, 0.55), up = R(0.05, 0.55), col1 = rnd() < 0.3 ? COL.brG : COL.br1;
          const top = b.blade(ca * 0.03, 0, sa * 0.03, a, H, 0.02, 0.3, 1, COL.brS, COL.brS, 0.5);
          const pt = (t) => [top[0] + ca * L * t, top[1] + L * (up * t - 0.5 * t * t), top[2] + sa * L * t], wd = (t) => 0.3 * (1 - t) * Math.min(1, 0.3 + t * 3);
          const p0 = pt(0), p1 = pt(0.45), p2 = pt(1), w0 = wd(0) / 2, w1 = wd(0.45) / 2, k0 = mixc(COL.br0, col1, 0.45), k1 = mixc(COL.br0, col1, 0.8), k2 = col1;
          const L0 = [p0[0] - qx * w0, p0[1], p0[2] - qz * w0], R0 = [p0[0] + qx * w0, p0[1], p0[2] + qz * w0], L1 = [p1[0] - qx * w1, p1[1] - 0.04, p1[2] - qz * w1], R1 = [p1[0] + qx * w1, p1[1] - 0.04, p1[2] + qz * w1];
          b.leaf(L0, p0, p1, k0, k0, k1, 0.6); b.leaf(p0, R0, p1, k0, k0, k1, 0.6); b.leaf(L0, p1, L1, k0, k1, k1, 0.6); b.leaf(R0, R1, p1, k0, k1, k1, 0.6);
          b.leaf(L1, p1, p2, k1, k1, k2, 0.6); b.leaf(p1, R1, p2, k1, k1, k2, 0.6); }
        return b.geo(); },
    };

    // ---- where each kind grows: a slow noise of its own decides its drifts; the ground decides the rest (e: the ground round a square) ----
    const patch = (x, z, s, o) => land.fbm(x / s + o * 31.7, z / s - o * 17.3, 2);
    // each kind: its shape, the most drawn at once, how far round her (m), plants a square metre where it thrives best, its size, how
    // close to a road's edge it still grows (in metres: it thins from r0 to r1), and how it sways (amount, height, wrap of the light)
    const KINDS = [
      { id: 'lav', cap: 460, rad: 42, dens: 1.0, size: [0.8, 1.25], tall: [0.85, 1.2], r0: 0.3, r1: 4, sway: [0.05, 0.5, 0.6],
        suit: (e, x, z) => e.heath * e.dry * (sm(0.12, 0.34, patch(x, z, 22, 1)) + 0.015) },
      { id: 'cotton', cap: 320, rad: 44, dens: 0.6, size: [0.8, 1.2], tall: [0.85, 1.2], r0: 0.5, r1: 3, sway: [0.06, 0.45, 0.7],
        suit: (e, x, z) => e.damp * (sm(-0.2, 0.2, patch(x, z, 13, 2)) * 0.9 + 0.1) },
      { id: 'yel', cap: 350, rad: 30, dens: 0.4, size: [0.8, 1.3], tall: [0.8, 1.2], r0: -0.3, r1: 2, sway: [0.015, 0.15, 0.8],
        suit: (e, x, z) => e.dry * (0.5 + 0.5 * e.turf) * sm(0.1, 0.32, patch(x, z, 9, 3)) },
      { id: 'hare', cap: 260, rad: 32, dens: 0.3, size: [0.85, 1.25], tall: [0.8, 1.25], r0: -0.3, r1: 1.5, sway: [0.06, 0.35, 0.7],
        suit: (e, x, z) => e.dry * ((0.3 + 0.7 * e.turf) * sm(0.12, 0.34, patch(x, z, 11, 4)) + 0.35 * (1 - sm(1, 5, e.rd)) * sm(-0.1, 0.2, patch(x, z, 6, 4))) },
      { id: 'fox', cap: 60, rad: 60, dens: 0.16, size: [0.8, 1.2], tall: [0.75, 1.25], r0: 1, r1: 4, sway: [0.09, 1.2, 0.6],
        suit: (e, x, z) => e.dry * e.nook * sm(-0.25, 0.15, patch(x, z, 7, 5)) },
      { id: 'tussock', cap: 550, rad: 45, dens: 0.24, size: [0.8, 1.35], tall: [0.75, 1.25], r0: 0.3, r1: 3, sway: [0.06, 0.55, 0.7],
        suit: (e, x, z) => (0.2 + 0.8 * e.turf * e.dry + 0.7 * e.damp) * sm(-0.12, 0.22, patch(x, z, 30, 6)) },
      { id: 'rush', cap: 380, rad: 42, dens: 0.5, size: [0.8, 1.3], tall: [0.8, 1.2], r0: 0.5, r1: 2.5, sway: [0.05, 0.75, 0.5],
        suit: (e, x, z) => e.wet * sm(-0.3, 0.05, patch(x, z, 10, 7)) },
      { id: 'bil', cap: 260, rad: 52, dens: 0.12, size: [0.7, 1.15], tall: [0.7, 1.2], r0: 0.5, r1: 3, sway: [0.0, 0.4, 0.4],
        suit: (e, x, z) => e.heath * e.dry * sm(0.12, 0.38, patch(x, z, 18, 8)) * (0.45 + 0.55 * sm(4, 10, e.h)) },
      { id: 'bracken', cap: 260, rad: 55, dens: 0.2, size: [0.8, 1.35], tall: [0.8, 1.3], r0: 0.5, r1: 3.5, sway: [0.05, 0.6, 0.6],
        suit: (e, x, z) => e.dry * (sm(0.18, 0.4, patch(x, z, 35, 9)) * (0.4 + 0.6 * e.turf) + 0.7 * e.edge) },
    ];
    const meshes = KINDS.map((k, i) => {
      seed = 7031 + i * 101; const g = shapes[k.id](); k.tris = g.attributes.position.count / 3;
      const im = new THREE.InstancedMesh(g, mat(k.sway[0], k.sway[1], k.sway[2]), k.cap); im.count = 0; im.frustumCulled = false; scene.add(im); return im;
    });

    // ---- the ground, a square of 2 m at a time, worked out once and kept: which plants stand in it, where, how big ----
    const CELL = 2, RMAX = 60, memo = new Map(), WOODS = land.prep(F.woods, true), FIELDS = land.prep(F.fields, true);
    const hsh = (i, j, s) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
    const NOOKS = F.boulders.map((b) => [b[0], b[1], 2.2]).concat(F.menhirs.map((m) => [m[0], m[1], 1.0]), F.gorse.map((c) => [c[0], c[1], c[2] + 0.5]), [[land.TOR.x, land.TOR.z, 13]]);
    function cell(i, j) {
      const cx = (i + 0.5) * CELL, cz = (j + 0.5) * CELL, out = [];
      if (Math.abs(cx) > 380 || Math.abs(cz) > 252) return out;
      const g = land.at(cx, cz); if (g.sea > 0.02 || g.place > 0 || g.fair > 0.02 || g.rock > 0.35 || g.h < WL + 0.25) return out;
      const h = g.h, wet = g.wet, sl = Math.max(Math.abs(land.height(cx + 1.2, cz) - h), Math.abs(land.height(cx, cz + 1.2) - h)) / 1.2; if (sl > 0.7) return out;
      let pl = 1e9; for (const P of land.PLACES) pl = Math.min(pl, land.sd(P.P, cx, cz, 14)); if (pl < 5) return out;
      let rd = 9; for (const L of land.ROADS) rd = Math.min(rd, land.dist(L, cx, cz, 9 + L.w / 2) - L.w / 2);
      let pool = 0; for (const p of land.POOLS) { const dx = (cx - p.x) / p.rx, dz = (cz - p.z) / p.rz, q = Math.sqrt(dx * dx + dz * dz); if (q < 1.5) return out; pool = Math.max(pool, 1 - sm(1.5, 2.4, q)); }
      if (land.sd(FIELDS, cx, cz, 4) < 1) return out;
      const wd = land.sd(WOODS, cx, cz, 30); let nook = 0;
      for (const W of land.WALLS) nook = Math.max(nook, 1 - sm(1.2, 3.5, land.dist(W, cx, cz, 4)));
      for (const q of NOOKS) { const d = Math.hypot(cx - q[0], cz - q[1]) - q[2]; if (d < 4) nook = Math.max(nook, 1 - sm(0.5, 3.5, Math.abs(d))); }
      nook = Math.max(nook, sm(-6, -1, wd) * (1 - sm(1, 8, wd)));
      const [pu, ye] = mapAt(cx, cz), heath = sm(2, 14, pu), e = {
        h, rd, nook, heath, turf: sm(0, 18, ye) * (1 - 0.6 * heath), edge: sm(-4, 2, wd) * (1 - sm(3, 18, wd)),
        dry: (1 - sm(0.12, 0.32, wet)) * (1 - pool), damp: Math.max(sm(0.1, 0.3, wet) * (1 - sm(0.8, 0.97, wet)), pool * 0.8), wet: Math.max(sm(0.3, 0.55, wet) * (1 - sm(0.9, 0.99, wet)), pool),
      };
      const pk = 1 - sm(5, 11, pl);
      for (let k = 0; k < KINDS.length; k++) {
        const K = KINDS[k], s = K.suit(e, cx, cz) * sm(K.r0, K.r1, rd) * (1 - pk * 0.85); if (s <= 0.004) continue;
        const n = K.dens * s * CELL * CELL, tries = Math.ceil(n), p = n / tries;
        for (let t = 0; t < tries; t++) {
          if (hsh(i, j, k * 16 + t) >= p) continue;
          const x = (i + hsh(i, j, k * 16 + t + 400)) * CELL, z = (j + hsh(i, j, k * 16 + t + 800)) * CELL, g2 = land.at(x, z);
          if (g2.road > 0.03 || g2.place > 0 || g2.sea > 0 || g2.fair > 0.01 || g2.rock > 0.4 || g2.h < WL + 0.25 || (K.id !== 'rush' && K.id !== 'cotton' && g2.wet > 0.5) || g2.wet > 0.93) continue;
          const r3 = hsh(i, j, k * 16 + t + 1200), sz = K.size[0] + (K.size[1] - K.size[0]) * r3 * (0.6 + 0.4 * s), tl = K.tall[0] + (K.tall[1] - K.tall[0]) * hsh(i, j, k * 16 + t + 1600);
          out.push(k, x, g2.h - 0.03 * sz, z, hsh(i, j, k * 16 + t + 2000) * 6.2832, sz, sz * tl);
        }
      }
      return out;
    }
    // the squares round her, nearest first
    const OFF = []; { const n = Math.ceil(RMAX / CELL) + 1; for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) { const d = Math.hypot(i, j) * CELL - CELL; if (d < RMAX) OFF.push([i, j, d]); } OFF.sort((a, b) => a[2] - b[2]); }
    const key = (i, j) => (i + 1000) * 4096 + (j + 1000);
    let last = [1e9, 1e9], pending = false, first = true;
    const counts = new Int32Array(KINDS.length), cPl = KINDS.map(() => []), cO = KINDS.map(() => []), cD = KINDS.map(() => []);
    function sow(pos) {
      const jump = Math.hypot(pos.x - last[0], pos.z - last[1]);
      if (jump < 2.5 && !pending) return; last = [pos.x, pos.z];
      const t0 = performance.now(), budget = first ? 1e9 : jump > 20 ? 30 : 3; first = false; pending = false;
      const ci = Math.floor(pos.x / CELL), cj = Math.floor(pos.z / CELL); counts.fill(0);
      for (let k = 0; k < KINDS.length; k++) { cPl[k].length = 0; cO[k].length = 0; cD[k].length = 0; }
      // every plant near enough, kind by kind
      for (let q = 0; q < OFF.length; q++) {
        const i = ci + OFF[q][0], j = cj + OFF[q][1], kk = key(i, j); let pl = memo.get(kk);
        if (pl === undefined) { if (performance.now() - t0 > budget) { pending = true; continue; } pl = cell(i, j); memo.set(kk, pl); }
        for (let o = 0; o < pl.length; o += 7) { const k = pl[o], d = Math.hypot(pl[o + 1] - pos.x, pl[o + 3] - pos.z); if (d < KINDS[k].rad) { cPl[k].push(pl); cO[k].push(o); cD[k].push(d); } }
      }
      // where a kind has more than it may draw, it is drawn less far round her, still shrinking to nothing at its edge
      for (let k = 0; k < KINDS.length; k++) {
        const K = KINDS[k], D = cD[k], a = meshes[k].instanceMatrix.array; let rad = K.rad;
        if (D.length > K.cap) { const sd = Float32Array.from(D).sort(); rad = sd[K.cap]; }
        for (let n = 0; n < D.length; n++) {
          const d = D[n]; if (d >= rad || counts[k] >= K.cap) continue; const f = sm(rad, rad * 0.72, d); if (f < 0.02) continue;
          const pl = cPl[k][n], o = cO[k][n], b = counts[k]++ * 16, c = Math.cos(pl[o + 4]), s = Math.sin(pl[o + 4]), sx = pl[o + 5] * f, sy = pl[o + 6] * f;
          a[b] = c * sx; a[b + 1] = 0; a[b + 2] = -s * sx; a[b + 3] = 0; a[b + 4] = 0; a[b + 5] = sy; a[b + 6] = 0; a[b + 7] = 0;
          a[b + 8] = s * sx; a[b + 9] = 0; a[b + 10] = c * sx; a[b + 11] = 0; a[b + 12] = pl[o + 1]; a[b + 13] = pl[o + 2]; a[b + 14] = pl[o + 3]; a[b + 15] = 1;
        }
        stats.rad[k] = rad;
      }
      meshes.forEach((m, k) => { m.count = counts[k]; m.instanceMatrix.needsUpdate = true; });
      if (memo.size > 24000) { for (const kk of memo.keys()) { const i = Math.floor(kk / 4096) - 1000, j = kk % 4096 - 1000; if (Math.abs(i - ci) * CELL > RMAX * 2.5 || Math.abs(j - cj) * CELL > RMAX * 2.5) memo.delete(kk); } }
      stats.ms = performance.now() - t0;
    }
    const stats = { ms: 0, rad: KINDS.map((k) => k.rad), get counts() { return Array.from(counts); }, kinds: KINDS.map((k) => k.id), get tris() { return KINDS.reduce((s, k, i) => s + k.tris * counts[i], 0); } };

    // ---- the trees: wind-bent thorns standing alone, and small stands of rowan and birch where there is shelter ----
    const TC = { bark: lin([0.16, 0.13, 0.11]), barkD: lin([0.10, 0.08, 0.07]), thorn0: lin([0.08, 0.09, 0.055]), thorn1: lin([0.17, 0.17, 0.10]),
      rowan0: lin([0.07, 0.10, 0.05]), rowan1: lin([0.15, 0.18, 0.08]), berry: lin([0.46, 0.12, 0.09]), birchW: lin([0.47, 0.46, 0.44]), birchD: lin([0.16, 0.14, 0.13]), birch0: lin([0.11, 0.12, 0.05]), birch1: lin([0.26, 0.24, 0.10]) };
    const treeGeo = {
      thorn() { const b = Builder(); seed = 911;
        b.tube([[0, -0.2, 0], [0.18, 0.7, 0.02], [0.6, 1.4, 0.05], [1.25, 1.85, 0.1]], [0.17, 0.13, 0.09, 0.05], [TC.barkD, TC.bark, TC.bark, TC.bark], 5);
        b.tube([[0.2, 0.75, 0.02], [0.05, 1.3, 0.35], [0.3, 1.75, 0.55]], [0.07, 0.05, 0.03], [TC.bark, TC.bark, TC.bark], 4);
        for (const q of [[0.9, 1.95, 0.05, 0.62, 0.48, 0.55], [1.45, 1.85, -0.15, 0.5, 0.42, 0.45], [0.4, 1.75, 0.35, 0.5, 0.42, 0.45], [1.1, 2.2, 0.35, 0.45, 0.38, 0.42], [0.55, 2.1, -0.25, 0.45, 0.38, 0.42], [1.85, 1.72, 0.1, 0.4, 0.34, 0.36]]) b.blob(q[0], q[1], q[2], q[3], q[4], q[5], TC.thorn0, TC.thorn1, q[0] * 3 + q[2] * 5);
        return b.geo(); },
      rowan() { const b = Builder(); seed = 1913;
        b.tube([[0, -0.2, 0], [0.05, 1.3, 0], [0.0, 2.5, 0.05], [-0.05, 3.3, 0]], [0.12, 0.09, 0.065, 0.03], [TC.barkD, TC.bark, TC.bark, TC.bark], 5);
        for (const q of [[0, 3.5, 0, 0.75, 0.6, 0.7], [0.55, 3.0, 0.3, 0.6, 0.5, 0.55], [-0.5, 3.05, -0.25, 0.6, 0.55, 0.55], [0.3, 2.7, -0.5, 0.5, 0.45, 0.5], [-0.35, 2.75, 0.5, 0.5, 0.45, 0.5], [0.1, 3.95, 0.1, 0.5, 0.4, 0.5]]) b.blob(q[0], q[1], q[2], q[3], q[4], q[5], TC.rowan0, TC.rowan1, q[0] * 3 + q[2] * 5 + 2);
        for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, r = i % 2 ? 0.95 : 0.8, y = 2.6 + (i % 3) * 0.35; b.spike(Math.cos(a) * r, y, Math.sin(a) * r, 0.06, 0.11, 3, TC.berry, TC.berry, a); }
        return b.geo(); },
      birch() { const b = Builder(); seed = 2917; const W = TC.birchW, Dk = TC.birchD;
        b.tube([[0, -0.2, 0], [0.02, 0.5, 0], [0.04, 1.3, 0], [0.02, 2.2, 0.02], [-0.02, 3.2, 0.02], [0.02, 4.7, 0]], [0.13, 0.12, 0.1, 0.085, 0.065, 0.03], [Dk, mixc(Dk, W, 0.5), W, mixc(W, Dk, 0.35), W, W], 5);
        for (const q of [[0, 4.5, 0, 0.55, 0.6, 0.55], [0.4, 4.0, 0.25, 0.5, 0.55, 0.45], [-0.4, 4.1, -0.2, 0.5, 0.6, 0.5], [0.15, 3.5, -0.4, 0.45, 0.5, 0.45], [-0.3, 3.4, 0.35, 0.45, 0.5, 0.45], [0.35, 3.2, 0.1, 0.4, 0.45, 0.4], [0, 4.95, 0, 0.38, 0.4, 0.38]]) b.blob(q[0], q[1], q[2], q[3], q[4], q[5], TC.birch0, TC.birch1, q[0] * 3 + q[2] * 5 + 4);
        return b.geo(); },
    };
    seed = 5150;
    const SEA = land.prep(F.sea, true), MARSH = land.prep(F.marsh, true), STREAM = F.stream[0], placed = [], blockers = [], lists = { thorn: [], rowan: [], birch: [] };
    function treeOk(x, z, gap) {
      if (Math.abs(x) > 374 || Math.abs(z) > 246) return null;
      const g = land.at(x, z); if (g.road > 0 || g.place > 0 || g.fair > 0 || g.sea > 0 || g.rock > 0.15 || g.wet > 0.4 || g.h < WL + 0.5) return null; const h = g.h;
      if (Math.max(Math.abs(land.height(x + 1.5, z) - h), Math.abs(land.height(x, z + 1.5) - h)) / 1.5 > 0.45) return null;
      for (const L of land.ROADS) if (land.dist(L, x, z, 10) < L.w / 2 + 2.5) return null;
      for (const P of land.PLACES) if (land.sd(P.P, x, z, 20) < 12) return null;
      for (const p of land.POOLS) { const dx = (x - p.x) / p.rx, dz = (z - p.z) / p.rz; if (dx * dx + dz * dz < 3.6) return null; }
      for (const W of land.WALLS) if (land.dist(W, x, z, 4) < 2.4) return null;
      for (const q of NOOKS) if (Math.hypot(x - q[0], z - q[1]) < q[2] + 2.5) return null;
      if (Math.hypot(x - F.fold[0][0], z - F.fold[0][1]) < F.fold[1] + 3) return null;
      if (land.sd(WOODS, x, z, 10) < 4 || land.sd(FIELDS, x, z, 6) < 3 || land.sd(SEA, x, z, 20) < 14) return null;
      for (const t of placed) if ((t[0] - x) * (t[0] - x) + (t[1] - z) * (t[1] - z) < gap * gap) return null;
      return h;
    }
    function addTree(kind, x, z, h, s, ry) {
      lists[kind].push([x, h - 0.05, z, ry, s, s * R(0.88, 1.12)]); placed.push([x, z]);
      blockers.push({ x, z, r: (kind === 'thorn' ? 0.3 : 0.24) * s });
    }
    // thorns: alone on the open moor, every one bent the same way by the wind off the sea in the south-west (leaning north-east)
    for (let i = 0; i < 3000 && lists.thorn.length < 70; i++) { const x = R(-140, 370), z = R(-235, 190), h = treeOk(x, z, 16); if (h !== null) addTree('thorn', x, z, h, R(0.75, 1.25), 0.64 + R(-0.25, 0.25)); }
    // a stand: a few trees close together, far enough apart to run between
    function stand(cx, cz, n, rowanK) {
      let got = 0; for (let t = 0; t < n * 6 && got < n; t++) { const a = rnd() * 6.283, r = got ? R(2.5, 7) : R(0, 2), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, h = treeOk(x, z, 3.6);
        if (h !== null) { addTree(rnd() < rowanK ? 'rowan' : 'birch', x, z, h, R(0.8, 1.2), rnd() * 6.283); got++; } }
      return got;
    }
    // by the stream, rowan mostly
    for (let k = 4; k < STREAM.length - 8; k += 11) { const p = STREAM[k], q = STREAM[k + 1], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1, side = (k / 11) % 2 ? 1 : -1, o = R(4.5, 7) * side; stand(p[0] - dz / l * o, p[1] + dx / l * o, 2 + Math.floor(rnd() * 3), 0.75); }
    // in sheltered dips on the moor
    { let made = 0, centres = [];
      for (let i = 0; i < 900 && made < 9; i++) { const x = R(-130, 360), z = R(-230, 180), g = land.at(x, z); if (g.wet > 0.3 || g.sea > 0) continue; let m = 0; for (let a = 0; a < 8; a++) m += land.height(x + Math.cos(a * 0.785) * 16, z + Math.sin(a * 0.785) * 16); m /= 8;
        if (m - g.h < 0.6 || centres.some((c) => Math.hypot(c[0] - x, c[1] - z) < 45)) continue; if (stand(x, z, 3 + Math.floor(rnd() * 3), 0.45)) { made++; centres.push([x, z]); } } }
    // along the moor's edge: under the woods' edge (birch), and above the marsh (both)
    for (let i = 0; i < 400; i++) { const x = R(-262, -140), z = R(-245, -140), d = land.sd(WOODS, x, z, 30); if (d < 6 || d > 16 || rnd() > 0.15) continue; stand(x, z, 2 + Math.floor(rnd() * 3), 0.2); }
    for (let i = 0; i < 600; i++) { const x = R(-120, 340), z = R(150, 205), d = land.sd(MARSH, x, z, 30); if (d < 7 || d > 18 || rnd() > 0.06) continue; stand(x, z, 2 + Math.floor(rnd() * 2), 0.5); }
    const treeTris = {}, treeMeshes = [];
    for (const kind of ['thorn', 'rowan', 'birch']) {
      const L = lists[kind]; if (!L.length) continue; const g = treeGeo[kind](); treeTris[kind] = g.attributes.position.count / 3 * L.length;
      const im = new THREE.InstancedMesh(g, mat(kind === 'thorn' ? 0.06 : 0.1, kind === 'birch' ? 4.8 : kind === 'rowan' ? 3.6 : 2.0, 0.45), L.length), a = im.instanceMatrix.array;
      L.forEach((t, n) => { const b = n * 16, c = Math.cos(t[3]), s = Math.sin(t[3]); a.set([c * t[4], 0, -s * t[4], 0, 0, t[5], 0, 0, s * t[4], 0, c * t[4], 0, t[0], t[1], t[2], 1], b); });
      im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; scene.add(im); treeMeshes.push(im);
    }
    stats.trees = { thorn: lists.thorn.length, rowan: lists.rowan.length, birch: lists.birch.length, tris: treeTris };
    stats.meshes = meshes.concat(treeMeshes); OW.flora = stats;
    return { update(pos, time) { sow(pos); }, blockers, stats };      // time: the sway is drawn from OW.U.uTime, so nothing is done here per picture
  };
})(window.OW);
