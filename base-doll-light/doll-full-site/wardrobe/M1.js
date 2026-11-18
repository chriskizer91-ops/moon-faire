// M1, a modern night out (M1A.png, M1B.png): a short teal satin dress, ruched along both sides, a cropped black leather biker jacket
// worn open, sheer black tights, black leather ankle boots with a side zip, a platform and a block heel, small silver hoops.
// She stands in heels: the frame hook lifts her by HEEL and tips her feet so the boots' heels and the balls of her feet are on the floor.
// The paintings are lined up for her as she stands in the boots (wardrobe/M1_prep.json: the neck rows are moved so that the prep's
// scale is the heeled one, while the paintings' soles stay at the floor).
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.M1 = {
  name: 'Night out: satin dress, biker jacket, ankle boots', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { THREE, sm, lerp, cl, PI, TAU } = W;
    const F = W.F;

    // plain materials with a little life: a fine grain and a broad mottling worked out from each point's rest position (the
    // paintings' light and her hands at her sides would otherwise be printed on the cloth; plain colours suit satin and leather)
    const NOISE = `
      varying vec3 vRP;
      float m1h(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float m1n(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(m1h(i), m1h(i + vec3(1,0,0)), f.x), mix(m1h(i + vec3(0,1,0)), m1h(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(m1h(i + vec3(0,0,1)), m1h(i + vec3(1,0,1)), f.x), mix(m1h(i + vec3(0,1,1)), m1h(i + vec3(1,1,1)), f.x), f.y), f.z); }`;
    function lively(mat, key, fine, broad, rgh) {
      mat.onBeforeCompile = (sh) => {
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvRP = position;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + NOISE)
          .replace('#include <color_fragment>', `#include <color_fragment>
            float m1g = m1n(vRP * ${fine.toFixed(1)}) * 0.6 + m1n(vRP * ${(fine * 2.3).toFixed(1)}) * 0.4, m1b = m1n(vRP * ${broad.toFixed(1)});
            diffuseColor.rgb *= 0.90 + 0.14 * m1b + 0.10 * (m1g - 0.5);`)
          .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
            roughnessFactor = clamp(roughnessFactor * (0.86 + ${rgh.toFixed(2)} * m1g + 0.12 * m1b), 0.05, 1.0);`);
      };
      mat.customProgramCacheKey = () => key;
      return mat;
    }
    const LEATHER = lively(W.phys({ color: W.lin('#1b1719'), roughness: 0.58, clearcoat: 0.22, clearcoatRoughness: 0.5, envMapIntensity: 0.7, side: THREE.DoubleSide }), 'm1Leather', 520, 34, 0.34);
    const BOOTLEATHER = lively(W.phys({ color: W.lin('#1b1719'), roughness: 0.50, clearcoat: 0.28, clearcoatRoughness: 0.42, envMapIntensity: 0.7, vertexColors: true }), 'm1BootLeather', 520, 34, 0.30);
    const SATIN = lively(W.phys({ color: W.lin('#0d5661'), roughness: 0.40, clearcoat: 0.16, clearcoatRoughness: 0.30, envMapIntensity: 0.85, side: THREE.DoubleSide }), 'm1Satin', 900, 18, 0.10);

    // ===================== the boots' geometry first: how far she is lifted and her feet tipped =====================
    // Heel seat (back of her foot) HS above the floor, the ball of her foot P above it. Solved for her own foot: heel point
    // (y 0.038, z -0.045), ankle (0.105, -0.012), toe joint (0.054, 0.088), the sole 1.6 cm under the toe joint.
    const HS = 0.088, PLAT = 0.022, FLOOR = W.SOLE;
    const A_R = { y: 0.105, z: -0.012 }, T_R = { y: 0.054, z: 0.088 };
    let TH = 0.5; for (let i = 0; i < 40; i++) { const f = -0.016 * Math.cos(TH) + 0.133 * Math.sin(TH) + 0.016 - (HS - PLAT); TH -= f / (0.016 * Math.sin(TH) + 0.133 * Math.cos(TH)); }
    const HEEL = FLOOR + PLAT + 0.016 - A_R.y + 0.051 * Math.cos(TH) + 0.100 * Math.sin(TH);       // how far she is lifted (about 0.064)
    const cT = Math.cos(TH), sT = Math.sin(TH);
    const A_P = { y: A_R.y + HEEL, z: A_R.z };
    const T_P = { y: A_P.y + (T_R.y - A_R.y) * cT - (T_R.z - A_R.z) * sT, z: A_P.z + (T_R.y - A_R.y) * sT + (T_R.z - A_R.z) * cT };

    // ===================== her trunk's outline, by height and angle round her (cached: it depends only on the doll) =====================
    // For each height, rays from her middle find her outermost skin (arms are not in F); the convex hull of those points is what a
    // close cloth would bridge (between her breasts, the small of her back, between her thighs). R(y, a): a 0 at the front, PI/2 her left.
    const PR = window.__M1prof || (window.__M1prof = (() => {
      const Y0 = 0.66, Y1 = 1.47, DY = 0.004, NY = Math.round((Y1 - Y0) / DY) + 1, NA = 144, R = new Float32Array(NY * NA), CZ = new Float32Array(NY);
      for (let iy = 0; iy < NY; iy++) {
        const y = Y0 + iy * DY, t = W.trunkAt(Math.max(y, 0.87)), cz = (t[1] + t[2]) / 2; CZ[iy] = cz;
        const pts = [];
        for (let j = 0; j < NA; j++) {
          const a = (j / NA) * TAU, dx = Math.sin(a), dz = Math.cos(a); let r = 0.34, hit = false;
          for (let k = 0; k < 60; k++) { const f = F(dx * r, y, cz + dz * r); if (f < 0.0004) { hit = true; break; } r -= Math.max(f * 0.9, 0.0006); if (r < 0.004) break; }
          if (hit) pts.push([dx * r, dz * r]);
        }
        // convex hull (monotone chain)
        pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], hi = [];
        for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
        for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
        const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
        for (let j = 0; j < NA; j++) {
          const a = (j / NA) * TAU, dx = Math.sin(a), dz = Math.cos(a); let best = 0;
          for (let i = 0; i < hull.length; i++) {
            const p = hull[i], q = hull[(i + 1) % hull.length], ex = q[0] - p[0], ez = q[1] - p[1], den = dx * ez - dz * ex;
            if (Math.abs(den) < 1e-12) continue;
            const t = (p[0] * ez - p[1] * ex) / den, u = (p[0] * dz - p[1] * dx) / den;
            if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.max(best, t);
          }
          R[iy * NA + j] = best;
        }
      }
      return { Y0, DY, NY, NA, R, CZ };
    })());
    // bilinear look-up of a table (rows by height, columns by angle)
    const look = (T, y, a) => {
      const fy = cl((y - PR.Y0) / PR.DY, 0, PR.NY - 1.001), iy = Math.floor(fy), ty = fy - iy;
      let fa = (((a / TAU) % 1) + 1) % 1 * PR.NA; const ia = Math.floor(fa) % PR.NA, ib = (ia + 1) % PR.NA, ta = fa - Math.floor(fa);
      const r0 = T[iy * PR.NA + ia] * (1 - ta) + T[iy * PR.NA + ib] * ta, r1 = T[(iy + 1) * PR.NA + ia] * (1 - ta) + T[(iy + 1) * PR.NA + ib] * ta;
      return r0 * (1 - ty) + r1 * ty;
    };
    const czAt = (y) => { const fy = cl((y - PR.Y0) / PR.DY, 0, PR.NY - 1.001), iy = Math.floor(fy), t = fy - iy; return PR.CZ[iy] * (1 - t) + PR.CZ[iy + 1] * t; };
    const Rb = (y, a) => look(PR.R, y, a);
    const at = (y, a, r) => [Math.sin(a) * r, y, czAt(y) + Math.cos(a) * r];

    // a sheet with thickness from a grid of points: outer surface, inner surface (moved in by th along the grid's normals) and the
    // rims joining them along the open borders. G[i][j]: rows i, columns j; closedU: the columns wrap round. Returns { pos, idx }.
    function thickSheet(G, th, closedU, o) {
      o = o || {};
      const m = G.length, n = G[0].length, cols = closedU ? n + 1 : n, pos = [], idx = [];
      const P = (i, j) => G[i][closedU ? j % n : j];
      // normals of the outer grid by central differences
      const N = [];
      for (let i = 0; i < m; i++) { const row = []; for (let j = 0; j < n; j++) {
        const i0 = Math.max(0, i - 1), i1 = Math.min(m - 1, i + 1), j0 = closedU ? (j - 1 + n) % n : Math.max(0, j - 1), j1 = closedU ? (j + 1) % n : Math.min(n - 1, j + 1);
        const a = G[i0][j], b = G[i1][j], c = G[i][j0], d = G[i][j1], u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - c[0], d[1] - c[1], d[2] - c[2]];
        let nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0]; const L = Math.hypot(nx, ny, nz) || 1;
        row.push([nx / L, ny / L, nz / L]); } N.push(row); }
      // which way is out: the normals should point away from her middle line
      let sg = 0; for (let i = 0; i < m; i += 2) for (let j = 0; j < n; j += 2) { const p = G[i][j], q = N[i][j];
        if (o.outRef) { const c = o.outRef(i, j); sg += q[0] * (p[0] - c[0]) + q[1] * (p[1] - c[1]) + q[2] * (p[2] - c[2]); } else sg += q[0] * p[0] + q[2] * (p[2] - czAt(p[1])); }
      const s = (o.flip ? -1 : 1) * (sg < 0 ? -1 : 1);
      const thAt = typeof th === 'function' ? th : () => th;
      const base = (k) => k * m * cols;
      for (let L = 0; L < 2; L++) for (let i = 0; i < m; i++) for (let j = 0; j < cols; j++) {
        const jj = closedU ? j % n : j, p = G[i][jj], q = N[i][jj], t = L ? thAt(i, jj) : 0;
        pos.push(p[0] - s * q[0] * t, p[1] - s * q[1] * t, p[2] - s * q[2] * t);
      }
      const quad = (a, b, c, d, flip) => { if (flip) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c); };
      const fo = s < 0;
      for (let i = 0; i < m - 1; i++) for (let j = 0; j < cols - 1; j++) {
        const a = i * cols + j, b = a + 1, c = a + cols + 1, d = a + cols;
        quad(a, b, c, d, fo);
        if (!o.inner || i < o.inner || i >= m - 1 - o.inner || (!closedU && (j < o.inner || j >= cols - 1 - o.inner))) quad(base(1) + a, base(1) + b, base(1) + c, base(1) + d, !fo);
      }
      // rims: separate vertices so their normals stay sharp
      const rim = (list, flip) => {
        const k0 = pos.length / 3;
        for (const v of list) { pos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); }
        for (const v of list) { const w = base(1) + v; pos.push(pos[w * 3], pos[w * 3 + 1], pos[w * 3 + 2]); }
        const L = list.length;
        for (let k = 0; k < L - 1; k++) quad(k0 + k, k0 + k + 1, k0 + L + k + 1, k0 + L + k, flip !== fo);
      };
      const row = (i) => { const l = []; for (let j = 0; j < cols; j++) l.push(i * cols + j); return l; };
      const col = (j) => { const l = []; for (let i = 0; i < m; i++) l.push(i * cols + j); return l; };
      if (o.rimA !== false) rim(row(0), true);
      if (o.rimB !== false) rim(row(m - 1), false);
      if (!closedU) { rim(col(0), false); rim(col(cols - 1), true); }
      return { pos, idx, nOut: m * cols };
    }

    // ===================== the dress =====================
    // From her chest (a straight neckline, 1.236) to mid-thigh; satin, close; ruched along both sides from the hem to her waist.
    const D_TOP = 1.250, D_HEM = 0.744, D_OFF = 0.0042;
    const side = (a) => { const d = Math.min(Math.abs(((a - PI / 2) % TAU + TAU + PI) % TAU - PI), Math.abs(((a + PI / 2) % TAU + TAU + PI) % TAU - PI)); return d; };   // angle from the nearer side seam
    const ruch = (y, a) => {                                    // the gathers: ripples that run out from each side seam, curving down toward the front and back
      const d = side(a), w = Math.exp(-Math.pow(d / 0.50, 2)), env = sm(D_HEM - 0.004, D_HEM + 0.03, y) * (1 - sm(1.00, 1.065, y));
      const sgn = Math.sin(a) > 0 ? 1 : 0, fb = Math.cos(a) > 0 ? 1 : -1;
      const ph = (y + 0.060 * Math.pow(1 - w, 1.5) + 0.0045 * Math.sin(y * 97 + sgn * 2.1) + 0.003 * fb * (1 - w)) / (0.031 + 0.006 * Math.sin(y * 41 + sgn)) * TAU;
      const r = 0.5 + 0.5 * Math.sin(ph); return 0.0046 * w * env * Math.pow(r, 2.0) * (0.75 + 0.25 * Math.sin(y * 63 + a * 3));
    };
    const hemAt = (a) => D_HEM + 0.010 * Math.exp(-Math.pow(side(a) / 0.45, 2));        // the gathers lift the hem a little at the sides
    const dressR = (y, a) => Rb(y, a) + D_OFF + 0.0030 * sm(1.00, 0.88, y) * (1 - 0.6 * Math.max(0, Math.cos(a))) + ruch(y, a);      // a little more room over her hips and seat, where a deep bend pushes
    {
      const NU = 132, NV = 100, G = [];
      for (let i = 0; i <= NV; i++) { const row = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, y = lerp(hemAt(a), D_TOP, i / NV);
        row.push(at(y, a, dressR(y, a))); } G.push(row); }
      const g = thickSheet(G, (i) => i < 3 || i > NV - 2 ? 0.0028 : 0.0016, true, { inner: 6 });
      W.part('m1Dress', g, (x, y, z) => W.wBody(x, y, z), { mat: SATIN });
    }
    const inDress = (x, y, z, m) => { if (y < D_HEM + m || y > D_TOP - m) return false; const a = Math.atan2(x, z - czAt(y)); return Math.hypot(x, z - czAt(y)) < Rb(y, a) + 0.002; };

    // ===================== tights: her own legs, darkened as sheer black nylon (darker where the leg turns away) =====================
    {
      const src = W.meshes.dollLeg.material, tm = src.clone();
      tm.onBeforeCompile = (sh) => {
        sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
          float tNV = clamp(abs(dot(normalize(vViewPosition), normalize(vNormal))), 0.0, 1.0);
          float tDen = clamp(0.56 + 0.44 * pow(1.0 - tNV, 1.25), 0.0, 1.0);
          diffuseColor.rgb = mix(diffuseColor.rgb * vec3(0.47, 0.44, 0.45) + vec3(0.006), vec3(0.008, 0.0068, 0.0072), tDen);`)
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= 0.48 * (1.0 - tDen);')
          .replace('#include <tonemapping_fragment>', `{ float tN2 = clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0);
            gl_FragColor.rgb += vec3(0.030, 0.026, 0.028) * pow(1.0 - tN2, 3.0) * (0.4 + 0.6 * clamp(normal.y * 0.5 + 0.5, 0.0, 1.0)); }
          #include <tonemapping_fragment>`);
      };
      tm.customProgramCacheKey = () => 'm1Tights';
      tm.roughness = 0.55;
      W.swapMat('dollLeg', tm);
    }

    // ===================== the boots: modelled as she stands in them, then carried back to her rest pose =====================
    // Posed space: she is lifted by HEEL, each foot tipped by TH about its ankle, the forefoot flat on the platform. The boot is a
    // signed distance in that space: a shaft round her ankle (its back swelling over her heel, its front sloping into the instep),
    // a last over her forefoot with a round toe, a platform sole with a welt, and a block heel. Each point found is carried back
    // through the bones that will carry it (shin, foot, toes), so posed again she stands in it.
    const BI = W.BI, TOPB = 0.187 + HEEL;                              // the shaft's rim, posed (the painting: 0.251)
    const sdBox = (px, py, pz, bx, by, bz, r) => { const qx = Math.abs(px) - bx + r, qy = Math.abs(py) - by + r, qz = Math.abs(pz) - bz + r;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r; };
    const BOOT = {};
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const xc = s * 0.081, zc0 = -0.012;
      const tout = 0.08, du = [s * Math.sin(tout), Math.cos(tout)];     // the foot's line (x, z), turned out a little
      const O = [s * 0.080, -0.073];                                 // where her heel stands (x, z), posed
      const loc = (x, z) => { const px = x - O[0], pz = z - O[1]; return [px * du[0] + pz * du[1], s * (px * du[1] - pz * du[0])]; };   // u forward, v outward
      const ySole = (u) => lerp(FLOOR + HS, FLOOR + PLAT, sm(0.010, 0.128, u));                     // the insole: heel seat down to the ball
      const yBot = (u) => lerp(FLOOR + 0.060, FLOOR, sm(0.038, 0.110, u));                          // the outsole's underside, from the heel's front up the shank
      const U_TIP = 0.212, U_BACK = -0.026;
      const halfW = (u) => {
        const base = lerp(0.034, 0.0435, sm(0.03, 0.125, u));
        const tip = u > 0.120 ? Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.120) / (U_TIP - 0.120), 3.0))) : 1;
        const back = u < 0.0 ? Math.sqrt(Math.max(0, 1 - Math.pow(u / U_BACK, 2))) : 1;
        return base * tip * back;
      };
      const vMid = (u) => -0.003 * sm(0.06, 0.16, u);                // the toe box leans a little to the inside, as a foot does
      const htAt = (u) => lerp(0.050, 0.045, sm(0.10, 0.16, u)) * (u > 0.150 ? Math.pow(Math.max(0.0, 1 - Math.pow((u - 0.150) / (U_TIP + 0.004 - 0.150), 2.6)), 0.5) : 1);
      const P = W.prof;
      const RF = [[0.10, 0.100], [0.135, 0.079], [0.165, 0.061], [0.195, 0.050], [0.225, 0.0455], [0.26, 0.0445]], RB = [[0.10, 0.0855], [0.128, 0.0855], [0.150, 0.0820], [0.175, 0.0730], [0.200, 0.0630], [0.230, 0.0565], [0.26, 0.0540]];
      const RX = [[0.10, 0.0350], [0.14, 0.0360], [0.18, 0.0368], [0.215, 0.0370], [0.26, 0.0378]];
      const shaftD = (x, y, z) => {
        const rf = P(RF, y, true), rb = P(RB, y, true), rx = P(RX, y, true), dx = (x - xc) / rx, dz = z - zc0, nz = dz / (dz > 0 ? rf : rb);
        return (Math.hypot(dx, nz) - 1) * Math.min(rx, dz > 0 ? rf : rb);
      };
      // the upper: its side outline (u forward, y up; posed), drawn from the painting's boot, swept across with a rounded section
      const PROF = [[-0.024, 0.122], [-0.0255, 0.140], [-0.0215, 0.160], [-0.010, 0.184], [0.003, 0.208], [0.009, 0.230], [0.0105, TOPB + 0.004],
        [0.1035, TOPB + 0.004], [0.1045, 0.226], [0.1095, 0.202], [0.126, 0.175], [0.148, 0.146], [0.170, 0.121], [0.188, 0.1065], [0.203, 0.0965],
        [0.2125, 0.084], [0.2150, 0.070], [0.2125, 0.058]];
      for (let k = 0; k <= 12; k++) { const u = lerp(0.205, -0.020, k / 12); PROF.push([u, ySole(u) - 0.003]); }
      const prof2 = (u, y) => {                                       // signed distance to the outline (negative inside)
        let d = 9, inside = false;
        for (let k = 0, n = PROF.length; k < n; k++) { const a = PROF[k], b = PROF[(k + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], L2 = ex * ex + ey * ey;
          const t = cl(((u - a[0]) * ex + (y - a[1]) * ey) / L2, 0, 1); d = Math.min(d, Math.hypot(u - a[0] - ex * t, y - a[1] - ey * t));
          if ((a[1] > y) !== (b[1] > y) && u < a[0] + (y - a[1]) / ey * ex) inside = !inside; }
        return inside ? -d : d;
      };
      const hwAt = (u, y) => lerp(halfW(Math.min(u, 0.15)) * (u > 0.15 ? lerp(1, 0.93, sm(0.15, 0.21, u)) : 1), 0.0372, sm(0.125, 0.225, y));
      const G = (x, y, z) => {
        const [u, v] = loc(x, z), ys = ySole(u);
        const hw = hwAt(u, y), vm = v - vMid(u) * (1 - sm(0.12, 0.16, y)), q2 = Math.min(1.4, Math.pow(vm / hw, 2));
        const du = q2 * 0.017 * (2 * sm(0.03, 0.09, u) - 1), dy = q2 * 0.026 * sm(0.235, 0.150, y) * sm(0.08, 0.14, u);       // rounded in plan; the vamp domed
        const r = 0.008, dp = prof2(u + du, y + dy), dv = Math.abs(vm) - hw;
        const qx = dp + r, qy = dv + r;
        let up = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
        const hwS = Math.max(halfW(u), 1e-4) + 0.0030;
        const sole = W.smax(W.smax(Math.abs(v - vMid(u)) - hwS, Math.max(u - U_TIP - 0.0032, 0.030 - u), 0.004), Math.max(yBot(u) - y, y - (ys + 0.005)), 0.0025);
        const hb = sdBox(u - 0.0085, y - (FLOOR + HS / 2), v, 0.0335, HS / 2, 0.0285, 0.0028);
        return Math.min(W.smin(up, sole, 0.004), hb);
      };
      // posed -> rest, through the shin (lifted), the foot (lifted and tipped) and the toes (lying flat)
      const toRest = (x, y, z) => {
        const wS = sm(A_P.y + 0.006, A_P.y + 0.050, y), wT = (1 - wS) * sm(T_P.z - 0.012, T_P.z + 0.018, z), wF = 1 - wS - wT;
        const Mi = (ry, rz) => [wS * (ry + HEEL) + wF * (A_P.y + (ry - A_R.y) * cT - (rz - A_R.z) * sT) + wT * (ry - T_R.y + T_P.y),
          wS * rz + wF * (A_P.z + (ry - A_R.y) * sT + (rz - A_R.z) * cT) + wT * (rz - T_R.z + T_P.z)];
        let ry = wS * (y - HEEL) + wF * (A_R.y + (y - A_P.y) * cT + (z - A_P.z) * sT) + wT * (y - T_P.y + T_R.y), rz = wS * z + wF * (A_R.z - (y - A_P.y) * sT + (z - A_P.z) * cT) + wT * (z - T_P.z + T_R.z);
        for (let it = 0; it < 6; it++) { const q = Mi(ry, rz); ry += y - q[0]; rz += z - q[1]; }
        return { p: [x, ry, rz], w: [BI['shin' + S], wS, BI['foot' + S], wF, BI['toe' + S], wT] };
      };
      const box = [xc - 0.07, xc + 0.07, FLOOR - 0.004, TOPB + 0.004, -0.112, 0.155];
      const g = W.snets(G, box, 0.0042);
      const pos = new Float32Array(g.pos.length), Wt = [];
      for (let v = 0; v < g.nv; v++) { const r = toRest(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]); pos.set(r.p, v * 3); Wt.push(r.w); }
      const leather = BOOTLEATHER;
      const bp = W.part('m1Boot' + S, { pos, idx: Array.from(g.tris) }, (x, y, z, i) => Wt[i], { mat: leather });
      { const col = new Float32Array(g.nv * 3);                       // the rim of the shaft and its inside are dark; the sole's edge a little lighter
        for (let v = 0; v < g.nv; v++) { const y = g.pos[v * 3 + 1], ny = g.nor[v * 3 + 1]; let c = 1 - 0.75 * sm(TOPB - 0.006, TOPB - 0.001, y) * sm(0.2, 0.7, ny);
          const [u] = loc(g.pos[v * 3], g.pos[v * 3 + 2]); if (y < ySole(u) + 0.004 && y > FLOOR + 0.003) c *= 0.82;
          col[v * 3] = col[v * 3 + 1] = col[v * 3 + 2] = c; }
        bp.mesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
      const contact = []; for (let v = 0; v < g.nv; v++) if (g.pos[v * 3 + 1] < FLOOR + 0.010) contact.push(v);
      const step = Math.max(1, Math.ceil(contact.length / 48));
      BOOT[S] = { xc, zc0, shaftD, toRest, G, mesh: bp.mesh, contact: contact.filter((v, k) => k % step === 0) };
    }
    // the side zips: on the inside of each shaft, from the rim down to her ankle bone, with a pull at the top
    {
      const pos = [], idx = [], Wt = [];
      const quadBox = (pts, w) => { const k = pos.length / 3; for (const p of pts) { pos.push(...p.p); Wt.push(p.w); } return k; };
      for (const [S, s0] of [['R', -1], ['L', 1], ['R', 1], ['L', -1]]) {
        const s = s0;                                                 // a zip on each side of each shaft (the paintings show one inside and one outside)
        const B = BOOT[S], NZ = 22, y0 = 0.150, y1 = TOPB - 0.002, zz = B.zc0 - 0.006;
        const surfX = (y) => { let x = B.xc - s * 0.02; for (let it = 0; it < 30; it++) { const d = B.G(x, y, zz); x += -s * d; } return x; };       // the shaft's side at this height (s: minus the side the zip is on)
        const rings = [];
        for (let i = 0; i <= NZ; i++) {
          const y = lerp(y0, y1, i / NZ), xs = surfX(y), out = -s;          // out: toward the middle of her (the zip's outside)
          const tw = 0.0034, tp = 0.0018;
          rings.push([[xs - out * 0.0006, y, zz - tw], [xs + out * tp, y, zz - tw * 0.8], [xs + out * tp, y, zz + tw * 0.8], [xs - out * 0.0006, y, zz + tw]]);
        }
        const k0 = pos.length / 3;
        for (const r of rings) for (const p of r) { const t = B.toRest(p[0], p[1], p[2]); pos.push(...t.p); Wt.push(t.w); }
        for (let i = 0; i < NZ; i++) for (let j = 0; j < 3; j++) { const a = k0 + i * 4 + j, b = a + 1, c = a + 4, d = b + 4; if (s < 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c); }
        // the pull: a small flat tab hanging from the top of the zip
        const ty = y1 - 0.004, xs = surfX(ty) + (-s) * 0.0024, k1 = pos.length / 3;
        const tab = [[0, 0.004, -0.0040], [0, 0.004, 0.0040], [0, -0.020, 0.0034], [0, -0.020, -0.0034]];
        for (const L of [0, 1]) for (const q of tab) { const t = B.toRest(xs + (-s) * 0.0012 * L, ty + q[1], zz + q[2]); pos.push(...t.p); Wt.push(t.w); }
        const f = s < 0; const tri = (a, b, c) => (f ? idx.push(a, b, c) : idx.push(a, c, b));
        tri(k1, k1 + 1, k1 + 2); tri(k1, k1 + 2, k1 + 3); tri(k1 + 4, k1 + 6, k1 + 5); tri(k1 + 4, k1 + 7, k1 + 6);
        for (let e = 0; e < 4; e++) { const a = k1 + e, b = k1 + (e + 1) % 4; tri(a, b + 4, b); tri(a, a + 4, b + 4); }
      }
      W.part('m1BootZips', { pos, idx }, (x, y, z, i) => Wt[i], { mat: W.std({ color: W.lin('#b9b9be'), metalness: 0.55, roughness: 0.38, envMapIntensity: 1.3, side: THREE.DoubleSide }) });
    }

    // ===================== the jacket =====================
    // Cropped black leather, worn open. Its body hangs from her bust and shoulder blades (each height takes the widest of what is
    // above it, less 10 cm per metre), stands 1 cm off her, and is open at the front between two fold lines; above the break each
    // front edge folds back as a revers that becomes the notched lapel, and a collar stands round the back of her neck. Sizes from
    // M1A (front: x = (col - 354) / 565; rest height = 1.7393 - row / 565).
    const J_HEM = 1.058, J_OFF = 0.0100, J_TH = 0.0030;
    const RJ = new Float32Array(PR.NY * PR.NA);
    for (let iy = 0; iy < PR.NY; iy++) for (let j = 0; j < PR.NA; j++) {
      const ca = Math.cos((j / PR.NA) * TAU);                     // a row above is measured from its own middle: carry it to this row's
      let r = PR.R[iy * PR.NA + j]; for (let k = 1; k <= 32 && iy + k < PR.NY; k++) r = Math.max(r, PR.R[(iy + k) * PR.NA + j] + ca * (PR.CZ[iy + k] - PR.CZ[iy]) - 0.10 * k * PR.DY);
      RJ[iy * PR.NA + j] = r;
    }
    const RJo = (y, a) => look(RJ, y, a) + J_OFF;                     // the jacket's outer surface
    // the fold lines (the front edges), her right (x < 0) and her left
    const xR = (y) => W.prof([[1.04, -0.069], [1.19, -0.072], [1.28, -0.0735], [1.34, -0.071], [1.385, -0.066], [1.43, -0.052]], y, true);
    const xL = (y) => W.prof([[1.04, 0.0745], [1.19, 0.077], [1.28, 0.0745], [1.34, 0.071], [1.385, 0.066], [1.43, 0.052]], y, true);
    const angAt = (x, y, Rf) => { let lo = -1.55, hi = 1.55; for (let k = 0; k < 34; k++) { const m = (lo + hi) / 2; if (Math.sin(m) * Rf(y, m) < x) lo = m; else hi = m; } return (lo + hi) / 2; };
    const frontPt = (x, y, Rf, dr) => { const a = angAt(x, y, Rf), r = Rf(y, a) + (dr || 0); return at(y, a, r); };
    const leatherJ = LEATHER;
    const wJ = (x, y, z) => W.wBody(x, y, z);
    const J_TOP = (a) => { const b = Math.abs(((a % TAU) + TAU) % TAU - PI); return 1.398 - 0.012 * sm(0.4, 1.4, b); };   // the neckline: 1.398 at the back
    {
      // seams (a shallow groove each): the back yoke, two back panel seams, two front panel seams, the hem band; and a few soft creases
      const groove = (d) => -0.0011 * Math.exp(-Math.pow(d / 0.0021, 2));
      const seams = (x, y, z, a) => {
        const back = z < czAt(y), sd = side(a), sx = Math.abs(x); let g = 0;
        if (back && sx < 0.125) g += groove(y - (1.302 - 0.010 * Math.pow(sx / 0.125, 2)));
        if (back && y < 1.302) g += groove(sx - lerp(0.084, 0.056, sm(J_HEM, 1.30, y)));
        if (!back && y < 1.24) g += groove(sx - lerp(0.108, 0.112, sm(J_HEM, 1.24, y)));
        g += groove(y - (J_HEM + 0.030));
        const cr = Math.exp(-Math.pow(sd / 0.45, 2)) * sm(J_HEM + 0.03, J_HEM + 0.06, y) * (1 - sm(1.14, 1.20, y));
        g += 0.0009 * cr * Math.pow(0.5 + 0.5 * Math.sin((y + 0.03 * Math.cos(a)) / 0.024 * TAU), 2);
        return g;
      };
      const NU = 176, NV = 70, G = [];
      const aL0 = angAt(xL(1.38), 1.38, RJo), aR0 = TAU + angAt(xR(1.38), 1.38, RJo), yTs = [];
      for (let j = 0; j <= NU; j++) yTs.push(J_TOP(lerp(aL0, aR0, j / NU)));
      const edgeA = new Map(), edges = (y) => { const k = Math.round(y * 2e4); let e = edgeA.get(k); if (!e) { e = [angAt(xL(y), y, RJo), TAU + angAt(xR(y), y, RJo)]; edgeA.set(k, e); } return e; };
      for (let i = 0; i <= NV; i++) { const row = [];
        for (let j = 0; j <= NU; j++) {
          const t = j / NU, yT = yTs[j];
          const y = lerp(J_HEM, yT, i / NV), [aL, aR] = edges(y), a = lerp(aL, aR, t);
          const p0 = at(y, a, RJo(y, a));
          row.push(at(y, a, RJo(y, a) + seams(p0[0], y, p0[2], a)));
        } G.push(row); }
      W.part('m1Jacket', thickSheet(G, J_TH, false, { inner: 5 }), wJ, { mat: leatherJ });
    }
    // the revers and lapels: a plate on each front, from the break up to the neck; its outer edge runs from the break out to the
    // lapel's corner, in to the notch, out to the collar's point and up to her neck (the painting's outline)
    const REV = [[-0.072, 1.190], [-0.128, 1.294], [-0.092, 1.334], [-0.127, 1.343], [-0.106, 1.372], [-0.081, 1.398], [-0.060, 1.412]];
    const REV_L = [[0.077, 1.190], [0.128, 1.294], [0.093, 1.334], [0.127, 1.343], [0.106, 1.372], [0.081, 1.398], [0.060, 1.412]];
    const plateR = (y, a) => RJo(y, a) + 0.0048;
    const revers = [];
    for (const [S, poly, xF] of [['R', REV, xR], ['L', REV_L, xL]]) {
      const segL = []; let L = 0; for (let k = 0; k < poly.length - 1; k++) { const d = Math.hypot(poly[k + 1][0] - poly[k][0], poly[k + 1][1] - poly[k][1]); segL.push(d); L += d; }
      const along = (u) => { let d = u * L; for (let k = 0; k < segL.length; k++) { if (d <= segL[k] || k === segL.length - 1) { const f = Math.min(1, d / segL[k]); return [lerp(poly[k][0], poly[k + 1][0], f), lerp(poly[k][1], poly[k + 1][1], f)]; } d -= segL[k]; } };
      const NS = 54, NT = 9, G = [];
      for (let i = 0; i <= NS; i++) { const o = along(i / NS), yf = cl(o[1], 1.19, 1.412), f = [xF(yf), yf], row = [];
        for (let j = 0; j <= NT; j++) { const t = j / NT, x = lerp(f[0], o[0], t), y = lerp(f[1], o[1], t);
          row.push(frontPt(x, y, plateR, 0.0018 * Math.pow(1 - t, 3))); }
        G.push(row); }
      revers.push({ S, along, L });
      W.part('m1Lapel' + S, thickSheet(G, 0.0030, false), wJ, { mat: leatherJ });
    }
    // the collar: round the back of her neck from one lapel to the other; a stand up her neck, folded over, the fall lying on her shoulders
    {
      const NC = 64, NQ = 14, G = [], aE = angAt(0.064, 1.40, RJo), a0 = aE, a1 = TAU - aE;
      for (let i = 0; i <= NQ; i++) { const q = i / NQ, row = [];
        for (let j = 0; j <= NC; j++) {
          const a = lerp(a0, a1, j / NC), b = Math.abs(a - PI) / (PI - aE);           // 0 at the back, 1 at the ends
          const yN = 1.392 - 0.006 * b, yT = 1.434 - 0.022 * b * b, yE = 1.391 - 0.020 * b * b;
          let y, r;
          if (q <= 0.32) { const u = q / 0.32; y = lerp(yN, yT - 0.003, u); r = Rb(y, a) + 0.0035 + 0.003 * u; }
          else if (q <= 0.42) { const u = (q - 0.32) / 0.10; y = yT - 0.003 + 0.003 * Math.sin(u * PI / 2); r = Rb(yT, a) + 0.0065 + 0.0045 * u; }
          else { const u = (q - 0.42) / 0.58; y = lerp(yT, yE, u); r = lerp(Rb(yT, a) + 0.011, Math.max(RJo(yE, a) + 0.004, Rb(yE, a) + 0.016), Math.pow(u, 0.75)) + 0.004 * Math.sin(u * PI); }
          row.push(at(y, a, r));
        } G.push(row); }
      W.part('m1Collar', thickSheet(G, 0.0028, false), wJ, { mat: leatherJ });
    }
    // the sleeves: long and fitted, to her wrists; a few soft creases inside the elbow and above the cuff
    const SL1 = 0.447;
    for (const S of ['R', 'L']) {
      const NS = 58, NU = 34, G = [], ss = [];
      for (let i = 0; i <= NS; i++) {
        const tq = i / NS, sl = lerp(-0.046, SL1, tq < 0.12 ? 0.5 * (1 - Math.cos(PI * tq / 0.24)) * 0.24 : 0.12 + (tq - 0.12) * (0.88 / 0.88));
        const c = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c[0] + c2[0]) / 2, (c[1] + c2[1]) / 2, (c[2] + c2[2]) / 2], row = [];
        for (let j = 0; j < NU; j++) {
          const a = (j / NU) * TAU, p = W.armPt(S, sl, a), dx = p[0] - ax[0], dy = p[1] - ax[1], dz = p[2] - ax[2], Lr = Math.hypot(dx, dy, dz) || 1;
          let e = lerp(0.0082, 0.0068, sm(0.18, 0.30, sl)) - 0.0008 * sm(0.40, 0.445, sl) + 0.0012 * sm(0.03, -0.04, sl);
          e += 0.0026 * Math.exp(-Math.pow((((a - PI / 2) % TAU) + TAU) % TAU > PI ? (((a - PI / 2) % TAU) + TAU) % TAU - TAU : (((a - PI / 2) % TAU) + TAU) % TAU, 2) / 0.55) * Math.exp(-Math.pow((sl - 0.235) / 0.04, 2)) * (0.5 + 0.5 * Math.sin(sl / 0.017 * TAU));
          { const fa = Math.atan2(Math.sin(a - PI / 2), Math.cos(a - PI / 2));          // soft creases, mostly on the inside of the arm, bunching above the cuff
            e += (0.0007 + 0.0011 * sm(0.34, 0.41, sl)) * sm(0.05, 0.12, sl) * (0.35 + 0.65 * Math.exp(-fa * fa / 0.8)) * Math.pow(0.5 + 0.5 * Math.sin(sl / 0.031 * TAU + 0.45 * Math.sin(a) + 0.3 * Math.sin(sl * 47)), 3); }
          row.push([p[0] + dx / Lr * e, p[1] + dy / Lr * e, p[2] + dz / Lr * e]);
        }
        G.push(row); ss.push([sl, ax]);
      }
      const g = thickSheet(G, 0.0026, true, { rimA: false, inner: 4, outRef: (i) => ss[i][1] });
      const cols = NU + 1, nOut = g.nOut;
      const wf = (x, y, z, v) => { const k = v < nOut ? v : v < 2 * nOut ? v - nOut : -1; if (k < 0) { const f = W.armFrame(S, x, y, z); return W.wArmSL(S, f.sl, f.a); } return W.wArmSL(S, ss[Math.floor(k / cols)][0], ((k % cols) / NU) * TAU); };
      W.part('m1Sleeve' + S, g, wf, { mat: leatherJ });
    }
    // metal: the two front zips (up each front edge, then out along the revers to the lapel's corner), their pulls, and the snaps
    {
      const pos = [], idx = [], wts = [];
      const strip = (path, w, hgt) => {                              // a raised strip along points [x, y, z, nx, ny, nz]
        const k0 = pos.length / 3, n = path.length;
        for (let i = 0; i < n; i++) {
          const p = path[i], q = path[Math.min(n - 1, i + 1)], o = path[Math.max(0, i - 1)], tx = q[0] - o[0], ty = q[1] - o[1], tz = q[2] - o[2];
          let bx = ty * p[5] - tz * p[4], by = tz * p[3] - tx * p[5], bz = tx * p[4] - ty * p[3]; const L = Math.hypot(bx, by, bz) || 1; bx /= L; by /= L; bz /= L;
          for (const [sw, sh] of [[-1, 0], [-0.8, 1], [0.8, 1], [1, 0]]) pos.push(p[0] + bx * w * sw + p[3] * hgt * sh, p[1] + by * w * sw + p[4] * hgt * sh, p[2] + bz * w * sw + p[5] * hgt * sh);
        }
        for (let i = 0; i < n - 1; i++) for (let j = 0; j < 3; j++) { const a = k0 + i * 4 + j, b = a + 1, c = a + 4, d = b + 4; idx.push(a, c, b, b, c, d); }
      };
      const surfN = (x, y, Rf, dr) => { const a = angAt(x, y, Rf), r = Rf(y, a) + dr; const p = at(y, a, r); return [p[0], p[1], p[2], Math.sin(a), 0, Math.cos(a)]; };
      for (const [S, xF, sg] of [['R', xR, -1], ['L', xL, 1]]) {
        const path = [];
        for (let y = J_HEM + 0.004; y <= 1.19; y += 0.006) path.push(surfN(xF(y) + sg * 0.0042, y, RJo, 0.0003));
        const rv = revers.find((r) => r.S === S);
        const segs = 18; for (let k = 1; k <= segs; k++) { const f = k / segs, o = rv.along(f * 0.335); path.push(surfN(o[0] + sg * 0.0042 * (1 - f) - sg * 0.0035 * f, o[1] + 0.0035 * f, RJo, 0.0003 + 0.0048 * Math.min(1, f * 4))); }
        strip(path, 0.0026, 0.0016);
        // the pull: a small tab hanging from the slider at the hem
        const p0 = surfN(xF(J_HEM + 0.010) + sg * 0.0042, J_HEM + 0.010, RJo, 0.0028), k1 = pos.length / 3;
        for (const [dx, dy] of [[-0.0035, 0.004], [0.0035, 0.004], [0.003, -0.016], [-0.003, -0.016]]) pos.push(p0[0] + dx * p0[5], p0[1] + dy, p0[2] - dx * p0[3]);
        for (const [dx, dy] of [[-0.0035, 0.004], [0.0035, 0.004], [0.003, -0.016], [-0.003, -0.016]]) pos.push(p0[0] + dx * p0[5] + p0[3] * 0.0015, p0[1] + dy, p0[2] - dx * p0[3] + p0[5] * 0.0015);
        idx.push(k1, k1 + 2, k1 + 1, k1, k1 + 3, k1 + 2, k1 + 4, k1 + 5, k1 + 6, k1 + 4, k1 + 6, k1 + 7);
        for (let e = 0; e < 4; e++) { const a = k1 + e, b = k1 + (e + 1) % 4; idx.push(a, b, b + 4, a, b + 4, a + 4); }
        // snaps on the lower lapel and the collar's point
        for (const [sx, sy] of [[0.119, 1.300], [0.118, 1.348]]) {
          const c = surfN(-sg * -sx, sy, plateR, 0.0001), NR = 12, kc = pos.length / 3, rr = 0.0042, hh = 0.0018;
          const ux = c[5], uz = -c[3];
          pos.push(c[0] + c[3] * hh * 1.2, c[1], c[2] + c[5] * hh * 1.2);
          for (let r = 0; r < NR; r++) { const t = r / NR * TAU, cx = Math.cos(t) * rr, cy = Math.sin(t) * rr; pos.push(c[0] + ux * cx + c[3] * hh, c[1] + cy, c[2] + uz * cx + c[5] * hh); }
          for (let r = 0; r < NR; r++) { const t = r / NR * TAU, cx = Math.cos(t) * rr * 1.08, cy = Math.sin(t) * rr * 1.08; pos.push(c[0] + ux * cx, c[1] + cy, c[2] + uz * cx); }
          for (let r = 0; r < NR; r++) { const a = kc + 1 + r, b = kc + 1 + (r + 1) % NR; idx.push(kc, a, b); idx.push(a, a + NR, b + NR, a, b + NR, b); }
        }
      }
      W.part('m1JacketMetal', { pos, idx }, (x, y, z) => W.wBody(x, y, z), { mat: W.std({ color: W.lin('#cfcfd4'), metalness: 1.0, roughness: 0.26, envMapIntensity: 1.3, side: THREE.DoubleSide }) });
    }
    // the hoops: small silver rings through her ear lobes
    {
      const pos = [], idx = [], R0 = 0.0074, r0 = 0.00095, NA = 28, NB = 8;
      for (const sg of [-1, 1]) {
        const cx = sg * (W.headHalfW(1.466) + 0.0035), cy = 1.4675 - R0, cz = -0.0175, k0 = pos.length / 3;
        for (let i = 0; i < NA; i++) { const t = i / NA * TAU, ccy = Math.cos(t), ccz = Math.sin(t);
          for (let j = 0; j < NB; j++) { const u = j / NB * TAU, rr = R0 + r0 * Math.cos(u); pos.push(cx + r0 * Math.sin(u), cy + rr * ccy, cz + rr * ccz); } }
        for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) { const a = k0 + i * NB + j, b = k0 + i * NB + (j + 1) % NB, c = k0 + ((i + 1) % NA) * NB + j, d = k0 + ((i + 1) % NA) * NB + (j + 1) % NB; idx.push(a, c, b, b, c, d); }
      }
      W.part('m1Earrings', { pos, idx }, () => W.wBone('head'), { mat: W.std({ color: W.lin('#d8d8dc'), metalness: 1.0, roughness: 0.22, envMapIntensity: 1.4, side: THREE.DoubleSide }) });
    }

    // (her skin where the sports bra was comes back by itself when the bra is hidden: no patch needed)

    // ===================== what cannot be seen =====================
    W.hideMeshes(['wearBra', 'wearShorts', 'dollFoot', 'toenail']);
    // the tights' top, where her bike shorts were (her skin under them was never made): thinner than the shorts, so a deep bend
    // that creases the dress over her hip does not bring it through
    W.snug('m1TightsTop', (x, y, z) => Math.max(0.754 - y, y - 0.835), () => 0.0010, [-0.21, 0.21, 0.74, 0.85, -0.165, 0.135], 0.0045,
      { mat: W.std({ color: W.lin('#16110f'), roughness: 0.62, envMapIntensity: 0.3 }) });
    W.hideSkin((x, y, z) => y < 0.172, ['dollLeg']);
    W.hideSkin((x, y, z) => y < D_TOP - 0.05 && inDress(x, y, z, 0.012), ['dollTrunk', 'dollLeg']);
    W.hideSkin((x, y, z) => y > J_HEM + 0.012 && y < 1.372 && (z < czAt(y) || x < xR(y) - 0.028 || x > xL(y) + 0.028), ['dollTrunk']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl < SL1 - 0.014; }, ['arm']);

    // ===================== standing in heels: lift her, tip her feet, keep her forefeet flat =====================
    const AXX = new THREE.Vector3(1, 0, 0), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), vk = new THREE.Vector3(), mInv = new THREE.Matrix4();
    const fwd = new THREE.Vector3(), qw = new THREE.Quaternion(), qr = new THREE.Quaternion();
    let done = null;
    // two-bone reach: lift a leg's ankle by dh (her own up), keeping the knee's plane and the foot's turn in the world
    const _H = new THREE.Vector3(), _K = new THREE.Vector3(), _A = new THREE.Vector3(), _T = new THREE.Vector3(), _d = new THREE.Vector3(), _p = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qf = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _up = new THREE.Vector3();
    function rotBone(b, from, to) {                                   // turn bone b in the world so that direction from becomes to
      _q1.setFromUnitVectors(from.clone().normalize(), to.clone().normalize());
      b.parent.getWorldQuaternion(_qp); b.getWorldQuaternion(_q2);
      b.quaternion.copy(_qp.clone().invert().multiply(_q1).multiply(_q2)); b.updateMatrixWorld(true);
    }
    function liftLeg(SK, S, dh) {
      const th = SK['thigh' + S], sh = SK['shin' + S], ft = SK['foot' + S], root = SK.hips.parent;
      root.getWorldQuaternion(_qp); _up.set(0, 1, 0).applyQuaternion(_qp);
      th.getWorldPosition(_H); sh.getWorldPosition(_K); ft.getWorldPosition(_A); ft.getWorldQuaternion(_qf); const qFoot = _qf.clone();
      const a = _K.distanceTo(_H), b = _A.distanceTo(_K); _T.copy(_A).addScaledVector(_up, dh);
      let c = _T.distanceTo(_H); c = cl(c, Math.abs(a - b) + 1e-4, a + b - 1e-4);
      const d0 = _A.clone().sub(_H).normalize(); _d.copy(_T).sub(_H).normalize();
      const m0 = _K.clone().sub(_H); m0.addScaledVector(d0, -m0.dot(d0)); _p.copy(m0).addScaledVector(_d, -m0.dot(_d));
      if (_p.lengthSq() < 1e-10) return; _p.normalize();
      const al = Math.acos(cl((a * a + c * c - b * b) / (2 * a * c), -1, 1));
      const K2 = _H.clone().addScaledVector(_d, a * Math.cos(al)).addScaledVector(_p, a * Math.sin(al));
      rotBone(th, _K.clone().sub(_H), K2.clone().sub(_H));
      sh.getWorldPosition(_K); ft.getWorldPosition(_A);
      rotBone(sh, _A.clone().sub(_K), _T.clone().sub(_K));
      sh.getWorldQuaternion(_qp); ft.quaternion.copy(_qp.invert().multiply(qFoot)); ft.updateMatrixWorld(true);
    }
    W.onFrame((SK) => {
      // in a held pose her bones are not reset between frames: do not add twice
      if (done && SK.hips.position.y === done.y && SK.footR.quaternion.equals(done.qR) && SK.footL.quaternion.equals(done.qL)) return;
      const root = SK.hips.parent; root.updateMatrixWorld(true); mInv.copy(root.matrixWorld).invert(); root.getWorldQuaternion(qr).invert();
      // kneeling: a knee near the floor; she is lifted less, and a foot already on its toes is not tipped further
      let kneeLo = 9; for (const S of ['R', 'L']) { SK['shin' + S].getWorldPosition(vk).applyMatrix4(mInv); kneeLo = Math.min(kneeLo, vk.y); }
      const kn = sm(0.30, 0.15, kneeLo);
      SK.hips.position.y += HEEL * (1 - kn);
      for (const S of ['R', 'L']) {
        SK['foot' + S].getWorldQuaternion(qw); qw.premultiply(qr); fwd.set(0, 0, 1).applyQuaternion(qw);
        const already = -Math.asin(cl(fwd.y, -1, 1));                  // + heel up
        const th = TH * (1 - sm(0.25, 0.9, already));
        SK['foot' + S].quaternion.multiply(qa.setFromAxisAngle(AXX, th));
        SK['toe' + S].quaternion.multiply(qb.setFromAxisAngle(AXX, -th));
      }
      // the boots never go through the floor: where one would (a kneel's forward foot, a step's heel strike), that leg reaches up
      root.updateMatrixWorld(true); const lows = {};
      for (const S of ['R', 'L']) {
        const B = BOOT[S], m = B.mesh; m.updateMatrixWorld(true); let lo = 9;
        for (const v of B.contact) { m.boneTransform(v, vk); lo = Math.min(lo, vk.y); }
        const need = FLOOR - lo;
        if (need > 0.001) { liftLeg(SK, S, need); root.updateMatrixWorld(true); lows[S] = FLOOR; } else lows[S] = lo;
      }
      // and if both float a little (a deep squat), she comes down onto them
      const fl = Math.min(lows.R, lows.L) - FLOOR;
      if (fl > 0.002 && fl < 0.03) { SK.hips.position.y -= fl; root.updateMatrixWorld(true); }
      done = { y: SK.hips.position.y, qR: SK.footR.quaternion.clone(), qL: SK.footL.quaternion.clone() };
    });
    W.M1 = { HEEL, TH, T_P, A_P };
  },
};
