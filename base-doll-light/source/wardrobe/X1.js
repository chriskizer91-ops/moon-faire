// X1, the Sorceress (X1A.png, X1B.png), Chris's own design: a floor-length coat of black velvet worn open over a deep purple velvet
// dress. The coat is fitted through the body and flares into a long skirt; a tall standing collar rises behind her neck and opens in a
// V at the front; sharp pointed caps stand up and out on her shoulders; its front edges, collar and sleeves are embroidered with a pale
// thorny vine (from the paintings). Its sleeves are fitted to just above the elbow, then open into long pointed hanging sleeves split up
// the front, through which the dress's fitted purple sleeves show down to her wrists. A black leather belt with a silver crescent-moon
// buckle at her waist; black heeled ankle boots with a 6 cm block heel.
// Pieces: x1DressBodice, x1DressSkirt, x1DressSleeveR/L, x1Coat, x1Collar, x1ShoulderR/L, x1CoatSleeveR/L, x1HangR/L (the hanging
// sleeves), x1Belt, x1Buckle, x1BootR/L, x1SkinPatch.
// The hanging sleeves hang from her upper arm just above the elbow and swing as heavy cloth: each is carried by six bones of the doll's
// own sleeve rig (slS0_0 ... slS2_0, made for her cloak's sleeves in src/I45_robe.js and unused while she wears this), which a frame
// hook here sets every frame from a small hanging chain of its own: it lags and swings, rests against the coat's skirt (where the skirt's
// chains have carried it), keeps her forearm inside its opening, and stays above the floor.
// She stands in heels: the frame hook lifts her by HEEL and tips her feet (as M1 does).
// Paintings: the prep was run on agents/X1/X1A_clean.png (her purple forearms and hands painted out of the hanging sleeves, so the
// coat behind them takes black velvet). The coat and dress take the paintings' colours, deepened in the dark and lifted in the pale
// (so the vine stands out); the dress's sleeves are plain purple velvet, and the hanging sleeves plain black velvet with the vine drawn
// in the shader along their split edges and pointed hem (painted, they came out patchy). Her knees, thighs and hips are not drawn
// (they cannot be seen under the dress, and so can never come through it); the bottom of her shins is, for a kneel's back foot.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.X1 = {
  name: 'The Sorceress: black velvet coat over a purple velvet dress', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { THREE, sm, lerp, cl, prof, PI, TAU } = W;
    const F = W.F, Fs = W.Fsnug;
    const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * h * k / 6; };
    const smax = (a, b, k) => -smin(-a, -b, k);
    const nrm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const add = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

    // ===================== materials =====================
    // velvet: the painted colour, very rough, a soft sheen at grazing angles (MeshPhysicalMaterial's sheen)
    const velvet = (o, sheen) => { const m = W.paint(Object.assign({ metal: 0, rough: 0.93, env: 0.06, emis: 0.22 }, o)); m.sheen = new THREE.Color(sheen); return m; };
    // the painted colour is deepened where it is dark (the velvet) and lifted where it is pale (the embroidery), so the vine stands out
    const deepen = (mat, key, lo, hi) => { const f = mat.onBeforeCompile;
      mat.onBeforeCompile = (sh) => { f(sh); sh.fragmentShader = sh.fragmentShader
        .replace('diffuseColor *= mapTexelToLinear(_pc);', `vec4 _pl = mapTexelToLinear(_pc); float _lu = dot(_pl.rgb, vec3(0.3, 0.55, 0.15)); _pl.rgb *= mix(${lo.toFixed(2)}, ${hi.toFixed(2)}, smoothstep(0.025, 0.22, _lu)); diffuseColor *= _pl;`)
        .replace('totalEmissiveRadiance *= mapTexelToLinear(_pc).rgb;', 'totalEmissiveRadiance *= _pl.rgb;'); };
      mat.customProgramCacheKey = () => key; return mat; };
    const COAT = deepen(velvet({ double: true, emis: 0.14, color: '#c4bcc0' }, '#2b2630'), 'x1Coat', 0.58, 1.55);
    const DRESS = deepen(velvet({ double: true, emis: 0.16, color: '#c0b0c0' }, '#4a2266'), 'x1Dress', 0.62, 1.0);
    const plainVelvet = (hex, sheen, rough) => { const m = W.phys({ color: W.lin(hex), roughness: rough || 0.9, envMapIntensity: 0.08, side: THREE.DoubleSide }); m.sheen = new THREE.Color(sheen); return m; };
    const PURPLE = plainVelvet('#230830', '#4e2468');
    const LEATHER = W.phys({ color: W.lin('#151315'), roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.45, envMapIntensity: 0.7, side: THREE.DoubleSide });
    const SILVER = W.std({ color: W.lin('#d4d4da'), metalness: 1.0, roughness: 0.24, envMapIntensity: 1.4, side: THREE.DoubleSide });


    // the hanging sleeves: plain black velvet (the paintings' sleeves hang behind her arms, so they paint patchily), with the pale thorny
    // vine worked along both split edges and round the pointed hem in the shader: aVn = (distance from the edge, distance along it, outside)
    const VINE = `
      varying vec3 vVn;
      float x1seg(vec2 p, vec2 a, vec2 b) { vec2 e = b - a; float h = clamp(dot(p - a, e) / dot(e, e), 0.0, 1.0); return length(p - a - e * h); }
      float x1vine(float d, float s) {
        float d0 = 0.0125 + 0.0036 * sin(s * 105.0) + 0.0012 * sin(s * 290.0 + 1.0);
        float v = 1.0 - smoothstep(0.0011, 0.0017, abs(d - d0));
        float P = 0.029, k = floor(s / P), side = mod(k, 2.0) < 0.5 ? 1.0 : -1.0;
        vec2 p = vec2(s - (k + 0.2) * P, d - d0), dir = normalize(vec2(1.0, side * 0.85)), dir2 = normalize(vec2(1.0, side * 0.25));
        vec2 e1 = dir * 0.0095, e2 = e1 + dir2 * 0.0075, e3 = e1 + normalize(vec2(-0.3, side)) * 0.005;
        float tw = min(min(x1seg(p, vec2(0.0), e1), x1seg(p, e1, e2)), x1seg(p, e1, e3));
        v = max(v, 1.0 - smoothstep(0.0008, 0.0013, tw));
        v = max(v, 1.0 - smoothstep(0.0014, 0.0021, min(length(p - e2), length(p - e3) + 0.0003)));
        float c2 = s / 0.0085, f2 = (fract(c2) - 0.5) * 0.0085, sd = mod(floor(c2), 2.0) < 0.5 ? 1.0 : -1.0, qy = (d - d0) * sd;
        if (qy > 0.0 && qy < 0.0026) { float tp = 1.0 - qy / 0.0026; v = max(v, 1.0 - smoothstep(0.0004 * tp + 0.00008, 0.0007 * tp + 0.00015, abs(f2 + qy * 0.5))); }
        v = max(v, 0.45 * (1.0 - smoothstep(0.0009, 0.0015, abs(d - 0.0030))));
        return v * (1.0 - smoothstep(0.022, 0.026, d));
      }`;
    const HANGMAT = W.phys({ color: W.lin('#ffffff'), roughness: 0.92, envMapIntensity: 0.08, side: THREE.DoubleSide });
    HANGMAT.sheen = new THREE.Color('#2e2833');
    HANGMAT.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aVn; varying vec3 vVn;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvVn = aVn;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + VINE)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float x1v = vVn.z * x1vine(vVn.x, vVn.y) * smoothstep(0.02, 0.06, vVn.y);
          float x1g = fract(sin(dot(floor(vVn.xy * 3000.0), vec2(12.9898, 78.233))) * 43758.5453);
          diffuseColor.rgb = mix(vec3(0.0062, 0.0052, 0.0060) * (0.85 + 0.3 * x1g), vec3(0.50, 0.43, 0.30) * (0.8 + 0.4 * x1g), x1v);`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.55, x1v);')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += vec3(0.05, 0.043, 0.03) * x1v;');
    };
    HANGMAT.customProgramCacheKey = () => 'x1Hang';

    // ===================== her trunk's outline, by height and angle round her (as M1: the convex hull of her skin at each height) =====================
    const PR = window.__X1prof || (window.__X1prof = (() => {
      const Y0 = 0.60, Y1 = 1.47, DY = 0.005, NY = Math.round((Y1 - Y0) / DY) + 1, NA = 96, R = new Float32Array(NY * NA), CZ = new Float32Array(NY);
      for (let iy = 0; iy < NY; iy++) {
        const y = Y0 + iy * DY, t = W.trunkAt(Math.max(y, 0.87)), cz = (t[1] + t[2]) / 2; CZ[iy] = cz;
        const pts = [];
        for (let j = 0; j < NA; j++) {
          const a = (j / NA) * TAU, dx = Math.sin(a), dz = Math.cos(a); let r = 0.34, hit = false;
          for (let k = 0; k < 60; k++) { const f = F(dx * r, y, cz + dz * r); if (f < 0.0004) { hit = true; break; } r -= Math.max(f * 0.9, 0.0006); if (r < 0.004) break; }
          if (hit) pts.push([dx * r, dz * r]);
        }
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
            const t2 = (p[0] * ez - p[1] * ex) / den, u = (p[0] * dz - p[1] * dx) / den;
            if (t2 > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.max(best, t2);
          }
          R[iy * NA + j] = best;
        }
      }
      // the coat hangs from her bust: each height takes the widest of what lies a little above it, less 30 cm per metre
      const RC = new Float32Array(NY * NA);
      for (let iy = 0; iy < NY; iy++) for (let j = 0; j < NA; j++) {
        const ca = Math.cos((j / NA) * TAU); let r = R[iy * NA + j];
        for (let k = 1; k <= 30 && iy + k < NY; k++) r = Math.max(r, R[(iy + k) * NA + j] + ca * (CZ[iy + k] - CZ[iy]) - 0.30 * k * DY);
        // above her bust the stiff fronts go up straight from it (in front only), less 25 cm per metre
        const y = Y0 + iy * DY; if (y > 1.21 && ca > 0.2) for (let k = 1; k <= 30 && iy - k >= 0 && Y0 + (iy - k) * DY > 1.18; k++) r = Math.max(r, R[(iy - k) * NA + j] + ca * (CZ[iy - k] - CZ[iy]) - 0.25 * k * DY * (1 + 1.5 * (1 - ca)));
        RC[iy * NA + j] = r;
      }
      return { Y0, DY, NY, NA, R, RC, CZ };
    })());
    const look = (T, y, a) => {
      const fy = cl((y - PR.Y0) / PR.DY, 0, PR.NY - 1.001), iy = Math.floor(fy), ty = fy - iy;
      const fa = ((((a / TAU) % 1) + 1) % 1) * PR.NA, ia = Math.floor(fa) % PR.NA, ib = (ia + 1) % PR.NA, ta = fa - Math.floor(fa);
      const r0 = T[iy * PR.NA + ia] * (1 - ta) + T[iy * PR.NA + ib] * ta, r1 = T[(iy + 1) * PR.NA + ia] * (1 - ta) + T[(iy + 1) * PR.NA + ib] * ta;
      return r0 * (1 - ty) + r1 * ty;
    };
    const czAt = (y) => { const fy = cl((y - PR.Y0) / PR.DY, 0, PR.NY - 1.001), iy = Math.floor(fy), t = fy - iy; return PR.CZ[iy] * (1 - t) + PR.CZ[iy + 1] * t; };
    const Rb = (y, a) => look(PR.R, y, a), Rh = (y, a) => look(PR.RC, y, a);
    const at = (y, a, r) => [Math.sin(a) * r, y, czAt(y) + Math.cos(a) * r];

    // a sheet with thickness from a grid of points (as M1): outer surface, inner surface th further in, rims along the open borders
    function thickSheet(G, th, closedU, o) {
      o = o || {};
      const m = G.length, n = G[0].length, cols = closedU ? n + 1 : n, pos = [], idx = [];
      const N = [];
      for (let i = 0; i < m; i++) { const row = []; for (let j = 0; j < n; j++) {
        const i0 = Math.max(0, i - 1), i1 = Math.min(m - 1, i + 1), j0 = closedU ? (j - 1 + n) % n : Math.max(0, j - 1), j1 = closedU ? (j + 1) % n : Math.min(n - 1, j + 1);
        const a = G[i0][j], b = G[i1][j], c = G[i][j0], d = G[i][j1], u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - c[0], d[1] - c[1], d[2] - c[2]];
        let nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0]; const L = Math.hypot(nx, ny, nz) || 1;
        row.push([nx / L, ny / L, nz / L]); } N.push(row); }
      let sg = 0; for (let i = 0; i < m; i += 2) for (let j = 0; j < n; j += 2) { const p = G[i][j], q = N[i][j];
        if (o.outRef) { const c = o.outRef(i, j); sg += q[0] * (p[0] - c[0]) + q[1] * (p[1] - c[1]) + q[2] * (p[2] - c[2]); } else sg += q[0] * p[0] + q[2] * (p[2] - czAt(p[1])); }
      const s = sg < 0 ? -1 : 1, thAt = typeof th === 'function' ? th : () => th, base = (k) => k * m * cols;
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
      const rimSrc = [];
      const rim = (list, flip) => {
        const k0 = pos.length / 3;
        for (const v of list) { pos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); rimSrc.push(v); }
        for (const v of list) { const w = base(1) + v; pos.push(pos[w * 3], pos[w * 3 + 1], pos[w * 3 + 2]); rimSrc.push(v); }
        const L = list.length;
        for (let k = 0; k < L - 1; k++) quad(k0 + k, k0 + k + 1, k0 + L + k + 1, k0 + L + k, flip !== fo);
      };
      const row = (i) => { const l = []; for (let j = 0; j < cols; j++) l.push(i * cols + j); return l; };
      const col = (j) => { const l = []; for (let i = 0; i < m; i++) l.push(i * cols + j); return l; };
      if (o.rimA !== false) rim(row(0), true);
      if (o.rimB !== false) rim(row(m - 1), false);
      if (!closedU) { rim(col(0), false); rim(col(cols - 1), true); }
      // src(v): the outer grid vertex a vertex was made from (for weights): its row and column
      const nOut = m * cols, src = (v) => { const k = v < nOut ? v : v < 2 * nOut ? v - nOut : rimSrc[v - 2 * nOut]; return [Math.floor(k / cols), (k % cols) % n]; };
      return { pos, idx, nOut, src };
    }

    // ===================== the coat's shape =====================
    // Measured from X1A (rest metres; the paintings' marks put her in 4.6 cm heels): the front edges (where the purple begins), the
    // flare (half width; front and back), the hem.
    const HEM = 0.076, TOP_C = (a) => 1.372 - 0.010 * sm(0.55, 0.95, Math.cos(a));
    const EDGE = [[0.07, 0.118], [0.20, 0.112], [0.40, 0.103], [0.60, 0.094], [0.70, 0.086], [0.80, 0.079], [0.90, 0.071], [1.00, 0.058], [1.05, 0.053],
      [1.10, 0.054], [1.15, 0.060], [1.25, 0.072], [1.30, 0.067], [1.34, 0.060], [1.38, 0.056]];
    const edgeX = (y) => prof(EDGE, y, true);
    const FLc = [[1.07, [0.112, 0.094, -0.064]], [1.00, [0.158, 0.106, -0.098]], [0.90, [0.184, 0.116, -0.125]], [0.80, [0.191, 0.123, -0.140]], [0.70, [0.196, 0.131, -0.152]],
      [0.60, [0.207, 0.138, -0.164]], [0.50, [0.221, 0.146, -0.176]], [0.40, [0.234, 0.148, -0.185]], [0.30, [0.249, 0.146, -0.198]], [0.20, [0.264, 0.146, -0.208]], [0.10, [0.279, 0.143, -0.222]], [0.05, [0.284, 0.143, -0.226]]];
    const famp = (y) => 0.017 * sm(1.00, 0.30, y);
    const flareR = (y, a) => { if (y > 1.07) return 0; const v = prof(FLc, y, true), cz = czAt(y), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] - cz : cz - v[2];
      return 1 / Math.sqrt((s / v[0]) * (s / v[0]) + (c / rz) * (c / rz)); };
    const offC = (y) => lerp(0.0095, 0.014, sm(1.04, 0.90, y));
    const coatBase = (y, a) => smax(Rh(y, a) + offC(y), flareR(y, a) - 0.80 * famp(y), 0.02);
    // soft heavy folds, deeper toward the hem; none in front between the edges
    const fold = (a, y) => { const t = sm(1.0, 0.1, y); return 0.62 * Math.sin(a * 11 + 0.7 + 0.6 * Math.sin(a * 2)) + 0.38 * Math.sin(a * 17 + 1.9 + t * 0.8); };
    const coatR = (y, a) => coatBase(y, a) + famp(y) * (0.5 + 0.5 * fold(a, y)) * sm(0.10, 0.45, 1 - Math.cos(a));
    const angAt = (x, y, Rf) => { let lo = -1.6, hi = 1.6; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (Math.sin(m) * Rf(y, m) < x) lo = m; else hi = m; } return (lo + hi) / 2; };
    const edgeCache = new Map();
    const edges = (y) => { const k = Math.round(y * 2e4); let e = edgeCache.get(k); if (!e) { const x = edgeX(y); e = [angAt(x, y, coatBase), TAU + angAt(-x, y, coatBase)]; edgeCache.set(k, e); } return e; };
    const wC = (x, y, z) => (y >= 1.07 ? W.wBody(x, y, z) : y <= 1.0 ? W.wSkirt(x, y, z) : W.mixW(W.wSkirt(x, y, z), W.wBody(x, y, z), sm(1.0, 1.07, y)));

    // ===================== the coat =====================
    {
      const NU = 140, NV = 100, G = [], yTs = [];
      const aL0 = edges(1.37)[0], aR0 = edges(1.37)[1];
      for (let j = 0; j <= NU; j++) yTs.push(TOP_C(lerp(aL0, aR0, j / NU)));
      const hemY = (a) => HEM + 0.003 * Math.sin(a * 3 + 1) + 0.008 * sm(0.5, 0.95, Math.cos(a));
      for (let i = 0; i <= NV; i++) { const row = [], t0 = i / NV, t = t0 < 0.5 ? t0 : t0;
        for (let j = 0; j <= NU; j++) {
          const yT = yTs[j], y0 = hemY(lerp(aL0, aR0, j / NU)), y = lerp(y0, yT, t), [aL, aR] = edges(y), a = lerp(aL, aR, j / NU);
          const eg = Math.min(j, NU - j) / NU;                          // near the front edges the folds fade
          row.push(at(y, a, coatBase(y, a) + famp(y) * (0.5 + 0.5 * fold(a, y)) * sm(0.0, 0.06, eg)));
        } G.push(row); }
      W.part('x1Coat', thickSheet(G, 0.0032, false, { inner: 4 }), (x, y, z) => wC(x, y, z), { mat: COAT });
    }

    // ===================== the collar: standing, flared, open in a V at the front =====================
    {
      const NQ = 16, NC = 72, G = [];
      const baseY = (a) => TOP_C(a) - 0.004;
      const aEb = edges(1.366)[0];
      for (let i = 0; i <= NQ; i++) { const q = i / NQ, row = [];
        for (let j = 0; j <= NC; j++) {
          const u = j / NC;
          // where along the ring: the edge opens from x 0.056 at the base to 0.085 at the top
          const xE = lerp(0.056, 0.080, Math.pow(q, 1.3)), aE = angAt(xE - lerp(0, 0.020, Math.pow(q, 1.3)), 1.366, coatBase), a = lerp(aE, TAU - aE, u);
          const front = sm(0.3, 0.9, Math.cos(a)), yb = baseY(a), yt = lerp(1.447, 1.434, front) - 0.003 * Math.cos((a - PI) * 2) * (1 - front);
          const y = lerp(yb, yt, q), rb = coatBase(yb, a) + 0.0035;
          const flare = (0.024 * (1 - front) + 0.020 * front) * Math.pow(q, 1.8);
          // the collar stands up the neck: its radius follows her neck a little way out, flaring at the top
          const rn = Rb(Math.min(y, 1.44), a) + 0.011 + 0.005 * (1 - front);
          row.push(at(y, a, lerp(rb, rn, sm(0, 0.30, q)) + flare));
        } G.push(row); }
      const wCol = (x, y, z) => W.mixW([W.BI.spine3, 1], [W.BI.neck, 1], 0.35 * sm(1.38, 1.47, y));
      W.part('x1Collar', thickSheet(G, 0.0030, false), wCol, { mat: COAT });
    }

    // ===================== the shoulders: padded, ending in a sharp cap that stands up and out =====================
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      // its outline seen from the front (X out from her middle, y up), and its depth front to back
      const POLY = [[0.052, 1.364], [0.100, 1.369], [0.160, 1.374], [0.218, 1.386], [0.206, 1.352], [0.198, 1.318], [0.190, 1.272], [0.178, 1.236], [0.132, 1.226], [0.090, 1.292], [0.052, 1.336]];
      const d2 = (X, y) => { let d = 9, inside = false;
        for (let k = 0, n = POLY.length; k < n; k++) { const a = POLY[k], b = POLY[(k + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], L2 = ex * ex + ey * ey;
          const t = cl(((X - a[0]) * ex + (y - a[1]) * ey) / L2, 0, 1); d = Math.min(d, Math.hypot(X - a[0] - ex * t, y - a[1] - ey * t));
          if ((a[1] > y) !== (b[1] > y) && X < a[0] + (y - a[1]) / ey * ex) inside = !inside; }
        return inside ? -d : d; };
      // seen from her side: flat on top, rounded front and back, narrowing where it meets her sleeve below
      const zc = (y) => lerp(-0.020, -0.034, sm(1.26, 1.37, y)), hz = (X, y) => lerp(0.036, 0.068, sm(1.24, 1.345, y)) * lerp(1, 0.94, sm(0.12, 0.22, X)) * lerp(0.92, 1, sm(0.05, 0.10, X));
      const G = (x, y, z) => { const X = s * x; return smax(d2(X, y), Math.abs(z - zc(y)) - hz(X, y), 0.026); };
      const bx = s < 0 ? [-0.235, -0.035] : [0.035, 0.235];
      const wSh = (x, y, z) => { const X = s * x; return W.mixW([W.BI.spine3, 1], [W.BI['uarm' + S], 1], sm(0.10, 0.17, X) * lerp(0.9, 0.3, sm(1.25, 1.35, y))); };
      W.surface('x1Shoulder' + S, G, [bx[0], bx[1], 1.21, 1.41, -0.115, 0.055], 0.0048, wSh, { mat: COAT });
    }

    // ===================== sleeves on her arms: the coat's (shoulder to just above the elbow) and the dress's (to her wrists) =====================
    function armTube(key, S, sl0, sl1, off, th, mat, o) {
      o = o || {};
      const NS = o.ns || 46, NU = o.nu || 34, G = [], ss = [];
      for (let i = 0; i <= NS; i++) {
        const tq = i / NS, sl = lerp(sl0, sl1, tq);
        const c = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), ax = [(c[0] + c2[0]) / 2, (c[1] + c2[1]) / 2, (c[2] + c2[2]) / 2], row = [];
        for (let j = 0; j < NU; j++) {
          const a = (j / NU) * TAU, p = W.armPt(S, sl, a), dx = p[0] - ax[0], dy = p[1] - ax[1], dz = p[2] - ax[2], Lr = Math.hypot(dx, dy, dz) || 1, e = off(sl, a);
          row.push([p[0] + dx / Lr * e, p[1] + dy / Lr * e, p[2] + dz / Lr * e]);
        }
        G.push(row); ss.push([sl, ax]);
      }
      const g = thickSheet(G, th, true, { rimA: o.rimA !== false, inner: 3, outRef: (i) => ss[i][1] });
      const wf = (x, y, z, v) => { const [r, c] = g.src(v); return W.wArmSL(S, ss[r][0], (c / NU) * TAU); };
      return W.part(key, g, wf, { mat });
    }
    const SLC = 0.205;
    for (const S of ['R', 'L']) {
      armTube('x1DressSleeve' + S, S, 0.06, 0.443, (sl, a) => 0.0034 + 0.0010 * sm(0.30, 0.20, sl) - 0.0006 * sm(0.40, 0.44, sl), 0.0022, PURPLE, { rimA: false });
      armTube('x1CoatSleeve' + S, S, -0.046, SLC, (sl, a) => 0.0088 + 0.0016 * sm(0.03, -0.04, sl), 0.0030, COAT, { rimA: false, ns: 30 });
    }

    // ===================== the dress =====================
    const NECK_D = (x, z) => { const front = 1.266 + 1.05 * Math.abs(x); return lerp(1.345, Math.min(1.345, front), sm(-0.02, 0.04, z)); };
    const bodR = (x, y, z) => Math.max(1.060 - y, y - NECK_D(x, z));
    // only its front shows, between the coat's edges (the coat lies on her everywhere else)
    W.snug('x1DressBodice', (x, y, z) => Math.max(bodR(x, y, z), Math.abs(x) - 0.118, -0.005 - z), () => 0.0036, [-0.13, 0.13, 1.05, 1.36, -0.02, 0.13], 0.0046, { mat: DRESS });
    {
      const NU = 96, NV = 56, G = [], TOP = 1.090, DH = 0.084;
      for (let i = 0; i <= NV; i++) { const t = i / NV, y = lerp(TOP, DH, t), row = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU;
          const r = Math.max(Rb(y, a) + 0.0048 + 0.004 * sm(1.0, 0.9, y), coatBase(y, a) - 0.0105) + 0.0035 * famp(y) / 0.017 * (0.5 + 0.5 * Math.sin(a * 23 + 0.4 + 3 * y));
          row.push(at(y, a, r)); } G.push(row); }
      W.part('x1DressSkirt', thickSheet(G, 0.0025, true, { rimA: false, inner: 3 }), (x, y, z) => wC(x, y, z), { mat: DRESS });
    }

    // ===================== the belt and its crescent buckle =====================
    const B0 = 1.073, B1 = 1.100;
    {
      const NU = 140, ys = [B0, B0 + 0.004, (B0 + B1) / 2, B1 - 0.004, B1], G = [];
      for (const y of ys) { const row = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, e = (y === B0 || y === B1) ? 0.0026 : 0.0040;
        row.push(at(y, a, coatBase(y, a) + e)); } G.push(row); }
      W.part('x1Belt', thickSheet(G, 0.0030, true), (x, y, z) => W.wBody(x, y, z), { mat: LEATHER });
    }
    {
      const yc = 1.087, zf = czAt(yc) + coatBase(yc, 0) + 0.0048, R1 = 0.0212, R2 = 0.0168, off = [0.0088, 0.0016];
      const G = (x, y, z) => { const dO = Math.hypot(x, y - yc) - R1, dI = Math.hypot(x - off[0], y - yc - off[1]) - R2;
        const cres = smax(dO, -dI, 0.0012), dz = Math.abs(z - zf) - 0.0024; return smax(cres, dz, 0.0016); };
      W.surface('x1Buckle', G, [-0.03, 0.03, yc - 0.03, yc + 0.03, zf - 0.006, zf + 0.006], 0.0011, (x, y, z) => W.wBody(x, y, zf - 0.03), { mat: SILVER });
    }

    // ===================== the boots: modelled as she stands in them, then carried back to her rest pose (as M1) =====================
    const HS = 0.065, PLAT = 0.010, FLOOR = W.SOLE;
    const A_R = { y: 0.105, z: -0.012 }, T_R = { y: 0.054, z: 0.088 };
    let TH = 0.4; for (let i = 0; i < 40; i++) { const f = -0.016 * Math.cos(TH) + 0.133 * Math.sin(TH) + 0.016 - (HS - PLAT); TH -= f / (0.016 * Math.sin(TH) + 0.133 * Math.cos(TH)); }
    const HEEL = FLOOR + PLAT + 0.016 - A_R.y + 0.051 * Math.cos(TH) + 0.100 * Math.sin(TH);
    const cT = Math.cos(TH), sT = Math.sin(TH);
    const A_P = { y: A_R.y + HEEL, z: A_R.z };
    const T_P = { y: A_P.y + (T_R.y - A_R.y) * cT - (T_R.z - A_R.z) * sT, z: A_P.z + (T_R.y - A_R.y) * sT + (T_R.z - A_R.z) * cT };
    const BI = W.BI, TOPB = 0.168 + HEEL;
    const sdBox = (px, py, pz, bx, by, bz, r) => { const qx = Math.abs(px) - bx + r, qy = Math.abs(py) - by + r, qz = Math.abs(pz) - bz + r;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r; };
    const BOOT = {};
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const xc = s * 0.081;
      const tout = 0.08, du = [s * Math.sin(tout), Math.cos(tout)];
      const O = [s * 0.080, -0.073];
      const loc = (x, z) => { const px = x - O[0], pz = z - O[1]; return [px * du[0] + pz * du[1], s * (px * du[1] - pz * du[0])]; };
      const ySole = (u) => lerp(FLOOR + HS, FLOOR + PLAT, sm(0.012, 0.128, u));
      const yBot = (u) => lerp(FLOOR + 0.046, FLOOR, sm(0.036, 0.112, u));
      const U_TIP = 0.207;
      const halfW = (u) => {
        const base = lerp(0.033, 0.0425, sm(0.03, 0.125, u));
        const tip = u > 0.118 ? Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.118) / (U_TIP - 0.118), 3.0))) : 1;
        const back = u < 0.0 ? Math.sqrt(Math.max(0, 1 - Math.pow(u / -0.024, 2))) : 1;
        return base * tip * back;
      };
      const vMid = (u) => -0.003 * sm(0.06, 0.16, u);
      const PROF = [[-0.019, 0.090], [-0.0215, 0.108], [-0.019, 0.128], [-0.011, 0.150], [-0.002, 0.172], [0.005, 0.195], [0.008, TOPB + 0.004],
        [0.101, TOPB + 0.004], [0.102, 0.192], [0.107, 0.172], [0.118, 0.152], [0.136, 0.131], [0.156, 0.113], [0.175, 0.098], [0.190, 0.087],
        [0.201, 0.077], [0.2065, 0.066], [0.2055, 0.054]];
      for (let k = 0; k <= 12; k++) { const u = lerp(0.200, -0.016, k / 12); PROF.push([u, ySole(u) - 0.003]); }
      const prof2 = (u, y) => {
        let d = 9, inside = false;
        for (let k = 0, n = PROF.length; k < n; k++) { const a = PROF[k], b = PROF[(k + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], L2 = ex * ex + ey * ey;
          const t = cl(((u - a[0]) * ex + (y - a[1]) * ey) / L2, 0, 1); d = Math.min(d, Math.hypot(u - a[0] - ex * t, y - a[1] - ey * t));
          if ((a[1] > y) !== (b[1] > y) && u < a[0] + (y - a[1]) / ey * ex) inside = !inside; }
        return inside ? -d : d;
      };
      const hwAt = (u, y) => lerp(halfW(Math.min(u, 0.15)) * (u > 0.15 ? lerp(1, 0.93, sm(0.15, 0.20, u)) : 1), 0.0368, sm(0.108, 0.200, y));
      const G = (x, y, z) => {
        const [u, v] = loc(x, z), ys = ySole(u);
        const hw = hwAt(u, y), vm = v - vMid(u) * (1 - sm(0.10, 0.14, y)), q2 = Math.min(1.4, Math.pow(vm / hw, 2));
        const du2 = q2 * 0.017 * (2 * sm(0.03, 0.09, u) - 1), dy = q2 * 0.024 * sm(0.215, 0.132, y) * sm(0.08, 0.14, u);
        const r = 0.008, dp = prof2(u + du2, y + dy), dv = Math.abs(vm) - hw;
        const qx = dp + r, qy = dv + r;
        const up = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
        const hwS = Math.max(halfW(u), 1e-4) + 0.0030;
        const sole = smax(smax(Math.abs(v - vMid(u)) - hwS, Math.max(u - U_TIP - 0.0032, 0.028 - u), 0.004), Math.max(yBot(u) - y, y - (ys + 0.005)), 0.0025);
        const hb = sdBox(u - 0.0115, y - (FLOOR + HS / 2), v, 0.0255, HS / 2, 0.0265, 0.0028);
        return Math.min(smin(up, sole, 0.004), hb);
      };
      const toRest = (x, y, z) => {
        const wS = sm(A_P.y + 0.006, A_P.y + 0.050, y), wT = (1 - wS) * sm(T_P.z - 0.012, T_P.z + 0.018, z), wF = 1 - wS - wT;
        const Mi = (ry, rz) => [wS * (ry + HEEL) + wF * (A_P.y + (ry - A_R.y) * cT - (rz - A_R.z) * sT) + wT * (ry - T_R.y + T_P.y),
          wS * rz + wF * (A_P.z + (ry - A_R.y) * sT + (rz - A_R.z) * cT) + wT * (rz - T_R.z + T_P.z)];
        let ry = wS * (y - HEEL) + wF * (A_R.y + (y - A_P.y) * cT + (z - A_P.z) * sT) + wT * (y - T_P.y + T_R.y), rz = wS * z + wF * (A_R.z - (y - A_P.y) * sT + (z - A_P.z) * cT) + wT * (z - T_P.z + T_R.z);
        for (let it = 0; it < 6; it++) { const q = Mi(ry, rz); ry += y - q[0]; rz += z - q[1]; }
        return { p: [x, ry, rz], w: [BI['shin' + S], wS, BI['foot' + S], wF, BI['toe' + S], wT] };
      };
      const box = [xc - 0.07, xc + 0.07, FLOOR - 0.004, TOPB + 0.004, -0.11, 0.15];
      const g = W.snets(G, box, 0.0048);
      const pos = new Float32Array(g.pos.length), Wt = [];
      for (let v = 0; v < g.nv; v++) { const r = toRest(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]); pos.set(r.p, v * 3); Wt.push(r.w); }
      const bm = W.phys({ color: W.lin('#171517'), roughness: 0.40, clearcoat: 0.30, clearcoatRoughness: 0.40, envMapIntensity: 0.75, vertexColors: true });
      const bp = W.part('x1Boot' + S, { pos, idx: Array.from(g.tris) }, (x, y, z, i) => Wt[i], { mat: bm });
      { const col = new Float32Array(g.nv * 3);
        for (let v = 0; v < g.nv; v++) { const y = g.pos[v * 3 + 1], ny = g.nor[v * 3 + 1]; let c = 1 - 0.75 * sm(TOPB - 0.006, TOPB - 0.001, y) * sm(0.2, 0.7, ny);
          const [u] = loc(g.pos[v * 3], g.pos[v * 3 + 2]); if (y < ySole(u) + 0.003 && y > FLOOR + 0.003 && u > 0.03) c *= 0.80;
          col[v * 3] = col[v * 3 + 1] = col[v * 3 + 2] = c; }
        bp.mesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
      const contact = []; for (let v = 0; v < g.nv; v++) if (g.pos[v * 3 + 1] < FLOOR + 0.010) contact.push(v);
      const step = Math.max(1, Math.ceil(contact.length / 48));
      BOOT[S] = { mesh: bp.mesh, contact: contact.filter((v, k) => k % step === 0) };
    }

    // (her skin where the sports bra was comes back by itself when the bra is hidden: no patch needed)

    // ===================== the hanging sleeves =====================
    // Each opens from a ring round her arm just above the elbow (SLA down her arm) into a long cone split up the front, its hem cut on a
    // slant: it hangs to a point (the end of its outer split edge, LT down) and is shortest at its inner split edge (LH). Measured from
    // X1A: in the paintings' pose the point is at (0.27, 0.49), the cone about 10 cm wide and 12 cm deep, its middle 5 cm behind her arm.
    // A hanging line (six links of LSEG) from the ring carries it: the cloth round each link is carried by one bone of the doll's own
    // sleeve rig, set every frame (below) so that it goes where the link went.
    const DEG = PI / 180, SLA = 0.195, LT = 0.630, LH = 0.420, NSEG = 6, LSEG = LT / NSEG;
    const skel = (Object.values(W.meshes).find((m) => m && m.isSkinnedMesh && m.skeleton) || {}).skeleton;
    const HB = { R: ['slR0_0', 'slR0_1', 'slR1_0', 'slR1_1', 'slR1_2', 'slR2_0'], L: ['slL0_0', 'slL0_1', 'slL1_0', 'slL1_1', 'slL1_2', 'slL2_0'] };
    const armAxis = (S, sl) => { const sh = W.restPts['sh' + S], d = W.armDir[S]; return [sh.x + d.x * sl, sh.y + d.y * sl, sh.z + d.z * sl]; };
    const rArm = (() => { let r = 0; const c = armAxis('L', SLA); for (let j = 0; j < 24; j++) { const p = W.armPt('L', SLA, (j / 24) * TAU); r = Math.max(r, Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])); } return r; })();
    const R0 = rArm + 0.0175;                                         // the ring: outside the coat's own sleeve
    const thS = (l) => lerp(0.22, 0.70, sm(0.0, 0.24, l));            // half the split's opening, round from the front
    const TH0 = (l) => -0.42 * sm(0.04, 0.26, l);                     // down the sleeve the split turns toward her body (the paintings' back view sees into it)
    const WX = (l) => lerp(R0, 0.054, sm(0.0, 0.14, l)) * lerp(1, 0.22, sm(0.36, LT, l));
    const WZ = (l) => lerp(R0, 0.060, sm(0.0, 0.14, l)) * lerp(1, 0.30, sm(0.36, LT, l));
    const ZO = (l) => -0.048 * sm(0.0, 0.16, l) * lerp(1, 0.55, sm(0.34, LT, l));
    // the hem: shortest at the two split edges (the inner one LH, the outer one 0.50), down to the point at the back of the sleeve
    const lmax = (u) => LT - (LT - (u < 0.5 ? 0.50 : LH)) * Math.pow(Math.abs(2 * u - 1), 1.25);
    const D_NAT = (s) => nrm([s * Math.sin(5 * DEG), -Math.cos(5 * DEG), -Math.sin(1.5 * DEG)]);
    const FLOOR_Y = W.SOLE + 0.012;
    // the coat's outside (its fold crests) and a little room, at rest
    const coatOut = (y, a) => coatBase(y, a) + famp(y) * sm(0.10, 0.45, 1 - Math.cos(a)) + 0.007;
    // samples of a cone's section on the side toward her body (where it can meet her coat): [angle round from the front]
    const SAMP = [PI * 0.75, PI, PI * 1.25, PI * 1.5, PI * 1.75];
    const sectPt = (Q, Lo, Fw, l, th) => add(add(Q, Lo, WX(l) * Math.sin(th)), Fw, ZO(l) + WZ(l) * Math.cos(th));
    const uOfTh = (l, th) => { const t = (((th - TH0(l)) % TAU) + TAU) % TAU; return (t - thS(l)) / (TAU - 2 * thS(l)); };
    // ---- one chain's step: links from the ring point A, each wanting to hang along dirT; kept out of the coat (env), her forearm kept
    // inside the cone's opening (arm), above the floor. still: settle where it would hang; else swing on from where it was. ----
    function stepChain(st, A, dirT, Lo, Fw, env, arm, still, floorY) {
      const K = 0.06, DAMP = 0.20, Q = st.cur, P = st.prev;
      Q[0] = A.slice(); P[0] = A.slice();
      const passes = still ? 30 : 1;
      for (let it = 0; it < passes; it++) {
        for (let k = 1; k <= NSEG; k++) {
          const c = Q[k - 1], tgt = add(c, dirT, LSEG), l = k * LSEG;
          let n;
          if (still) n = it === 0 ? tgt : add(Q[k], sub(tgt, Q[k]), 0.5);
          else { const v = sub(Q[k], P[k]); n = add(add(Q[k], v, 1 - DAMP), sub(tgt, Q[k]), K); }
          const fit = () => { const d = sub(n, c), L = Math.hypot(d[0], d[1], d[2]) || 1e-6; n = add(c, d, LSEG / L); };
          fit(); const n0 = n.slice();
          for (let r = 0; r < 3; r++) {
            let moved = false;
            // the coat: every sample of this link's section and of the half-way section stays outside it
            for (const f of [1, 0.5]) { const ll = l - (1 - f) * LSEG, q = add(c, sub(n, c), f); let best = null, bl = 0;
              for (const th of SAMP) { const uu = uOfTh(ll, th); if (uu < 0 || uu > 1 || ll > lmax(uu) + 0.01) continue; const p = sectPt(q, Lo, Fw, ll, th), d = env(p); if (d) { const dl = Math.hypot(d[0], d[1], d[2]); if (dl > bl) { bl = dl; best = d; } } }
              if (best) { n = add(n, best, 1 / f); moved = true; } }
            // her forearm and hand: never behind the cone's back wall or through its sides
            if (arm) { const d = arm(n, c, l); if (d) { n = add(n, d, 1); moved = true; } }
            if (n[1] < floorY) { n[1] = floorY; moved = true; }
            if (!moved) break; fit();
          }
          // a push from the coat or her arm moves the cloth, but does not throw it: most of it is taken off its speed
          if (still) { P[k] = n.slice(); Q[k] = n; } else { P[k] = add(Q[k], sub(n, n0), 0.85); Q[k] = n; }
        }
      }
    }
    // her rest pose: the coat's outside at rest
    const envRest = (p) => { const y = p[1]; if (y > 1.32 || y < HEM - 0.02) return null; const cz = czAt(y), dx = p[0], dz = p[2] - cz, r = Math.hypot(dx, dz) || 1e-6, a = Math.atan2(dx, dz), R = coatOut(y, a);
      return r >= R ? null : [dx / r * (R - r), 0, dz / r * (R - r)]; };
    // her forearm and hand as a polyline with radii: keep it inside the cone's opening (in front of the middle it may leave by the split)
    const armKeep = (pts) => (n, c, l) => {
      const T = nrm(sub(n, c)), Fw = st0.Fw, Lo = st0.Lo, cc = add(n, Fw, ZO(l));
      let best = null, bd = 9;
      for (let i = 0; i < pts.length - 1; i++) { const a = pts[i].p, b = pts[i + 1].p, e = sub(b, a), t = cl(dot(sub(cc, a), e) / dot(e, e), 0, 1), q = add(a, e, t), d = Math.hypot(...sub(q, cc)); if (d < bd) { bd = d; best = { q, r: lerp(pts[i].r, pts[i + 1].r, t) }; } }
      if (!best) return null;
      let d = sub(best.q, cc); const along = dot(d, T); if (Math.abs(along) > 0.05) return null; d = add(d, T, -along);
      const dl = dot(d, Lo), df = dot(d, Fw); if (df > 0.012) return null;
      const ax = Math.max(0.008, WX(l) - best.r - 0.004), az = Math.max(0.008, WZ(l) - best.r - 0.004), rho = Math.hypot(dl / ax, df / az);
      return rho > 1 ? add([0, 0, 0], d, 1 - 1 / rho) : null;
    };
    const st0 = { Fw: [0, 0, 1], Lo: [1, 0, 0] };
    const HANG = {};
    for (const [S, s] of [['R', -1], ['L', 1]]) {
      const A = armAxis(S, SLA), wr = armAxis(S, W.L_UARM + W.L_FARM), tip = armAxis(S, W.L_UARM + W.L_FARM + 0.15), el = armAxis(S, W.L_UARM);
      const st = { cur: [], prev: [] }; for (let k = 0; k <= NSEG; k++) { const p = add(A, D_NAT(s), LSEG * k); st.cur.push(p); st.prev.push(p.slice()); }
      st0.Fw = [0, 0, 1]; st0.Lo = [s, 0, 0];
      stepChain(st, A, D_NAT(s), [s, 0, 0], [0, 0, 1], envRest, armKeep([{ p: el, r: 0.040 }, { p: wr, r: 0.034 }, { p: tip, r: 0.030 }]), true, -1);
      const Qr = st.cur.map((p) => p.slice()), dRest = []; for (let k = 0; k < NSEG; k++) dRest.push(nrm(sub(Qr[k + 1], Qr[k])));
      // the spine through the links, smoothed (Catmull-Rom)
      const C = (l) => { const f = cl(l / LSEG, 0, NSEG - 1e-6), k = Math.floor(f), t = f - k, P0 = Qr[Math.max(0, k - 1)], P1 = Qr[k], P2 = Qr[k + 1], P3 = Qr[Math.min(NSEG, k + 2)];
        const t2 = t * t, t3 = t2 * t; return [0, 1, 2].map((i) => 0.5 * (2 * P1[i] + (-P0[i] + P2[i]) * t + (2 * P0[i] - 5 * P1[i] + 4 * P2[i] - P3[i]) * t2 + (-P0[i] + 3 * P1[i] - 3 * P2[i] + P3[i]) * t3)); };
      const ringPt = (th, l) => { const c = armAxis(S, SLA), p = W.armPt(S, SLA, PI / 2 - th), d = nrm(sub(p, c)); return add(add(p, d, R0 - Math.hypot(...sub(p, c))), sub(C(l), C(0)), 1); };
      const NR = 46, NC = 40, G = [], Ls = [];
      for (let i = 0; i <= NR; i++) { const sr = Math.pow(i / NR, 1.15), row = [], lrow = [];
        for (let j = 0; j <= NC; j++) { const u = j / NC, l = sr * lmax(u), th = lerp(thS(l), TAU - thS(l), u) + TH0(l);
          const pS = sectPt(C(l), [s, 0, 0], [0, 0, 1], l, th), pR = ringPt(th, l);
          row.push(add(pR, sub(pS, pR), sm(0.0, 0.10, l))); lrow.push(l); }
        G.push(row); Ls.push(lrow); }
      const g = thickSheet(G, 0.0030, false, { outRef: (i, j) => add(C(Ls[i][j]), [0, 0, 1], ZO(Ls[i][j])) });
      { // aVn: distance from the nearest edge (the two split edges and the hem), and along the edges from the top of the outer one round to the top of the inner one
        const avgR = (l) => Math.sqrt((WX(l) * WX(l) + WZ(l) * WZ(l)) / 2), per = (l) => (TAU - 2 * thS(l)) * avgR(l);
        const HU = [0]; for (let k = 1; k <= 200; k++) { const u0 = (k - 1) / 200, u1 = k / 200, l0 = lmax(u0), l1 = lmax(u1); HU.push(HU[k - 1] + Math.hypot((u1 - u0) * per((l0 + l1) / 2), l1 - l0)); }
        const hemS = (u) => { const f = cl(u, 0, 1) * 200, k = Math.min(199, Math.floor(f)); return lerp(HU[k], HU[k + 1], f - k); };
        const LA = lmax(0), HL = HU[200];
        const nOut = g.nOut, VN = new Float32Array(g.pos.length);
        for (let v = 0; v < g.pos.length / 3; v++) {
          const [r, c] = g.src(v), u = c / NC, l = Ls[r][c], dA = u * per(l), dB = (1 - u) * per(l);
          const sl = (lmax(Math.min(1, u + 0.01)) - lmax(Math.max(0, u - 0.01))) / (0.02 * per(l) || 1e-6), dH = (lmax(u) - l) / Math.sqrt(1 + sl * sl);
          let d = dA, sv = l; if (dB < d) { d = dB; sv = LA + HL + (lmax(1) - l); } if (dH < d) { d = dH; sv = LA + hemS(u); }
          VN[v * 3] = Math.max(0, d); VN[v * 3 + 1] = sv; VN[v * 3 + 2] = v >= nOut && v < 2 * nOut ? 0 : 1;
        }
        g.aVn = VN;
      }
      // weights: [which, weight] with which -1 her upper arm, 0..5 the links
      const myW = (l) => { const f = cl(l / LSEG, 0, NSEG - 1e-6), k = Math.floor(f), t = f - k; let w;
        if (t < 0.5) w = k > 0 ? [[k - 1, 0.5 - t], [k, 0.5 + t]] : [[0, 1]]; else w = k < NSEG - 1 ? [[k, 1.5 - t], [k + 1, t - 0.5]] : [[k, 1]];
        const top = 1 - sm(0.015, 0.075, l); return [[-1, top]].concat(w.map(([b, x]) => [b, x * (1 - top)])).filter((q) => q[1] > 1e-4); };
      const VW = []; for (let v = 0; v < g.pos.length / 3; v++) { const [r, c] = g.src(v); VW.push(myW(Ls[r][c])); }
      const toW = (w) => { const o = []; for (const [b, x] of w) o.push(b < 0 ? W.BI['uarm' + S] : W.BI[HB[S][b]], x); return o; };
      const part = W.part('x1Hang' + S, g, (x, y, z, i) => toW(VW[i]), { mat: HANGMAT, occluder: false });
      part.mesh.geometry.setAttribute('aVn', new THREE.Float32BufferAttribute(g.aVn, 3));
      HANG[S] = { s, A, el, wr, tip, Qr, dRest, VW, mesh: part.mesh, st: { cur: Qr.map((p) => p.slice()), prev: Qr.map((p) => p.slice()) }, lastA: null };
    }

    // ---- every frame: the links swing on, and the six bones of each sleeve are set so the cloth goes where its links went ----
    {
      const T3 = THREE, M4 = () => new T3.Matrix4(), mA = M4(), mB = M4(), mC = M4(), mInvH = M4(), qY = new T3.Quaternion(), qS = new T3.Quaternion(), qK = new T3.Quaternion();
      const vA = new T3.Vector3(), vB = new T3.Vector3(), pos = new T3.Vector3(), quat = new T3.Quaternion(), scl = new T3.Vector3(), Yax = new T3.Vector3(0, 1, 0);
      const binv = (name) => skel.boneInverses[W.BI[name]];
      const boneM = (SK, name, out) => out.multiplyMatrices(SK[name].matrixWorld, binv(name));
      const apply = (m, p) => { vA.set(p[0], p[1], p[2]).applyMatrix4(m); return [vA.x, vA.y, vA.z]; };
      // the skirt's chains: how far each joint has moved out from her middle (in her hips' frame), for the coat's outside now
      const CHS = W.chains.filter((c) => c.grp === 'skirt').map((c) => ({ c, a: Math.atan2(c.pts[1].x, c.pts[1].z - czAt(c.pts[1].y)) })).sort((p, q) => p.a - q.a);
      const DISP = CHS.map((c) => new Float32Array(c.c.pts.length));
      const dispAt = (y, a) => {
        let i1 = CHS.findIndex((c) => c.a > a); if (i1 < 0) i1 = 0; const i0 = (i1 - 1 + CHS.length) % CHS.length;
        let a0 = CHS[i0].a, a1 = CHS[i1].a; if (a1 <= a0) a1 += TAU; let aa = a; if (aa < a0) aa += TAU; const t = cl((aa - a0) / (a1 - a0), 0, 1);
        const at1 = (ci) => { const P = CHS[ci].c.pts, D = DISP[ci]; if (y >= P[0].y) return 0; for (let k = 0; k < P.length - 1; k++) if (y >= P[k + 1].y) { const f = (P[k].y - y) / (P[k].y - P[k + 1].y); return lerp(D[k], D[k + 1], f); } return D[P.length - 1]; };
        return lerp(at1(i0), at1(i1), t);
      };
      let MH = null, MHI = null;
      const envNow = (p) => {
        const r0 = apply(MHI, p), y = r0[1]; if (y > 1.32 || y < HEM - 0.02) return null;
        const cz = czAt(y), dx = r0[0], dz = r0[2] - cz, r = Math.hypot(dx, dz) || 1e-6, a = Math.atan2(dx, dz), R = coatOut(y, a) + Math.max(0, dispAt(y, a));
        if (r >= R) return null;
        vB.set(dx / r * (R - r), 0, dz / r * (R - r)).transformDirection(MH).multiplyScalar(R - r); return [vB.x, vB.y, vB.z];
      };
      const setBone = (SK, name, D) => {                       // the bone goes where D (rest point -> world now) says
        const b = SK[name]; mB.copy(binv(name)).invert(); mC.multiplyMatrices(D, mB); mA.copy(b.parent.matrixWorld).invert().multiply(mC);
        mA.decompose(b.position, b.quaternion, scl); b.scale.set(1, 1, 1); b.updateMatrixWorld(true);
      };
      W.onFrame((SK, API) => {
        const root = SK.hips.parent; root.updateMatrixWorld(true);
        MH = boneM(SK, 'hips', M4()); MHI = M4().copy(MH).invert();
        MH.decompose(pos, quat, scl); vA.set(0, 0, 1).applyQuaternion(quat); qY.setFromAxisAngle(Yax, Math.atan2(vA.x, vA.z));
        // the skirt chains' joints, now, in her hips' frame
        CHS.forEach((ch, ci) => { const c = ch.c, P = c.pts; for (let k = 0; k < P.length; k++) {
          const q = k === 0 ? apply(MH, [P[0].x, P[0].y, P[0].z]) : apply(boneM(SK, c.names[k - 1], mA), [P[k].x, P[k].y, P[k].z]);
          const qr = apply(MHI, q), cz = czAt(P[k].y); DISP[ci][k] = Math.hypot(qr[0], qr[2] - cz) - Math.hypot(P[k].x, P[k].z - cz); } });
        const floorY = apply(root.matrixWorld, [0, FLOOR_Y, 0])[1];
        const still = !API || API.move === 'pose';
        for (const S of ['R', 'L']) {
          const H = HANG[S], s = H.s, mU = boneM(SK, 'uarm' + S, M4()), mF = boneM(SK, 'farm' + S, M4()), mHd = boneM(SK, 'hand' + S, M4());
          const A = apply(mU, H.A), arm = [{ p: apply(mF, H.el), r: 0.040 }, { p: apply(mF, H.wr), r: 0.034 }, { p: apply(mHd, H.tip), r: 0.030 }];
          const rot = (v) => { vA.set(v[0], v[1], v[2]).applyQuaternion(qY); return [vA.x, vA.y, vA.z]; };
          const dirT = rot(D_NAT(s)); st0.Fw = rot([0, 0, 1]); st0.Lo = rot([s, 0, 0]);
          const jump = H.lastA ? Math.hypot(...sub(A, H.lastA)) : 9; H.lastA = A;
          stepChain(H.st, A, dirT, st0.Lo, st0.Fw, envNow, armKeep(arm), still || jump > 0.08, floorY);
          const Q = H.st.cur;
          for (let k = 0; k < NSEG; k++) {
            const dcur = nrm(sub(Q[k + 1], Q[k])), dr = rot(H.dRest[k]);
            vA.set(dr[0], dr[1], dr[2]); vB.set(dcur[0], dcur[1], dcur[2]); qS.setFromUnitVectors(vA, vB); qK.copy(qS).multiply(qY);
            // D: rest point p -> Q[k] + R (p - Qr[k])
            const D = M4().makeRotationFromQuaternion(qK), Qr = H.Qr[k]; vA.set(-Qr[0], -Qr[1], -Qr[2]).applyQuaternion(qK);
            D.setPosition(Q[k][0] + vA.x, Q[k][1] + vA.y, Q[k][2] + vA.z);
            setBone(SK, HB[S][k], D);
          }
        }
      });
    }

    // ---- the paintings' pose: where the hanging sleeves hang when her arms are 30 degrees out (her bones are not asked: the robe rig's
    // bones would put them elsewhere), and which views see them; the coat behind them is kept from the views they hide it in ----
    W.afterPaint((parts) => {
      const byKey = {}; for (const p of parts) byKey[p.key] = p.mesh;
      const turn = (S, p) => { const sh = W.restPts['sh' + S], s = S === 'L' ? 1 : -1, an = s * 15 * DEG, c = Math.cos(an), sn = Math.sin(an), x = p[0] - sh.x, y = p[1] - sh.y; return [sh.x + x * c - y * sn, sh.y + x * sn + y * c, p[2]]; };
      const turnV = (S, v) => { const s = S === 'L' ? 1 : -1, an = s * 15 * DEG, c = Math.cos(an), sn = Math.sin(an); return [v[0] * c - v[1] * sn, v[0] * sn + v[1] * c, v[2]]; };
      const PP = {};
      for (const S of ['R', 'L']) {
        const H = HANG[S], s = H.s, st = { cur: H.Qr.map((p) => turn(S, p)), prev: H.Qr.map((p) => turn(S, p)) };
        st0.Fw = [0, 0, 1]; st0.Lo = [s, 0, 0];
        stepChain(st, turn(S, H.A), D_NAT(s), [s, 0, 0], [0, 0, 1], envRest, armKeep([{ p: turn(S, H.el), r: 0.040 }, { p: turn(S, H.wr), r: 0.034 }, { p: turn(S, H.tip), r: 0.030 }]), true, -1);
        const Q = st.cur, R = []; const T3 = THREE;
        for (let k = 0; k < NSEG; k++) { const q = new T3.Quaternion().setFromUnitVectors(new T3.Vector3(...H.dRest[k]), new T3.Vector3(...nrm(sub(Q[k + 1], Q[k])))); R.push(q); }
        const g = H.mesh.geometry, P = g.attributes.position.array, N = g.attributes.normal.array, n = P.length / 3, out = new Float32Array(n * 3), on = new Float32Array(n * 3), v3 = new T3.Vector3();
        for (let i = 0; i < n; i++) { const p = [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]], nn = [N[i * 3], N[i * 3 + 1], N[i * 3 + 2]]; let acc = [0, 0, 0], an = [0, 0, 0];
          for (const [b, w] of H.VW[i]) { let q, qn;
            if (b < 0) { q = turn(S, p); qn = turnV(S, nn); }
            else { v3.set(p[0] - H.Qr[b][0], p[1] - H.Qr[b][1], p[2] - H.Qr[b][2]).applyQuaternion(R[b]); q = [Q[b][0] + v3.x, Q[b][1] + v3.y, Q[b][2] + v3.z]; v3.set(nn[0], nn[1], nn[2]).applyQuaternion(R[b]); qn = [v3.x, v3.y, v3.z]; }
            acc = add(acc, q, w); an = add(an, qn, w); }
          out.set(acc, i * 3); on.set(nrm(an), i * 3); }
        PP[S] = { out, on, g };
      }
      // what the views see of the hanging sleeves (each other and the coat may hide them), and of the coat behind them
      const Cs = 0.006, key = (a, b) => (Math.floor(a / Cs) + 600) * 2000 + Math.floor(b / Cs) + 600;
      const mk = () => ({ maxZ: new Map(), minZ: new Map(), minX: new Map(), maxX: new Map() });
      const up = (M, k, v, f) => { const q = M.get(k); if (q === undefined || f(v, q)) M.set(k, v); };
      const addPts = (D, p) => { for (let i = 0; i < p.length; i += 3) { const x = p[i], y = p[i + 1], z = p[i + 2];
        up(D.maxZ, key(x, y), z, (a, b) => a > b); up(D.minZ, key(x, y), z, (a, b) => a < b); up(D.minX, key(z, y), x, (a, b) => a < b); up(D.maxX, key(z, y), x, (a, b) => a > b); } };
      const near = (M, a, b, f, d) => { let v = d; const ia = Math.floor(a / Cs) + 600, ib = Math.floor(b / Cs) + 600;
        for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) { const q = M.get((ia + da) * 2000 + ib + db); if (q !== undefined) v = f(v, q); } return v; };
      const ex = (d) => 1 - sm(0.004, 0.012, d);
      const vis = (D, x, y, z, nx) => [ex(near(D.maxZ, x, y, Math.max, z) - z), ex(z - near(D.minZ, x, y, Math.min, z)), nx < 0 ? ex(x - near(D.minX, z, y, Math.min, x)) : ex(near(D.maxX, z, y, Math.max, x) - x)];
      const coat = byKey.x1Coat && byKey.x1Coat.geometry, Dall = mk(), Dh = mk();
      for (const S of ['R', 'L']) { addPts(Dall, PP[S].out); addPts(Dh, PP[S].out); }
      if (coat && coat.attributes.aPP) addPts(Dall, coat.attributes.aPP.array);
      for (const S of ['R', 'L']) { const { out, on, g } = PP[S], n = out.length / 3, E = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) E.set(vis(Dall, out[i * 3], out[i * 3 + 1], out[i * 3 + 2], on[i * 3]), i * 3);
        g.setAttribute('aPP', new THREE.Float32BufferAttribute(out, 3)); g.setAttribute('aPN', new THREE.Float32BufferAttribute(on, 3)); g.setAttribute('aPE', new THREE.Float32BufferAttribute(E, 3)); }
      if (coat && coat.attributes.aPE) { const P = coat.attributes.aPP.array, N = coat.attributes.aPN.array, E = coat.attributes.aPE.array;
        for (let i = 0; i < P.length / 3; i++) { const v = vis(Dh, P[i * 3], P[i * 3 + 1], P[i * 3 + 2], N[i * 3]); E[i * 3] *= v[0]; E[i * 3 + 1] *= v[1]; E[i * 3 + 2] *= v[2]; }
        coat.attributes.aPE.needsUpdate = true; }
    });

    // ===================== what cannot be seen =====================
    W.hideMeshes(['wearBra', 'wearShorts', 'dollFoot', 'toenail']);
    // her knees, thighs and hips can never be seen under the long dress (and so cannot come through it); the bottom of her shins can
    // (kneeling, her back foot comes out under the hem), so they stay
    W.hideSkin((x, y, z) => y < 0.155 || (y > 0.30 && y < 1.0), ['dollLeg']);
    W.hideSkin((x, y, z) => y < 1.0, ['dollTrunk']);
    W.hideSkin((x, y, z) => y >= 0.95 && bodR(x, y, z) < -0.012, ['dollTrunk']);
    W.hideSkin((x, y, z) => { const f = W.armFrame(x < 0 ? 'R' : 'L', x, y, z); return f.sl < 0.430; }, ['arm']);

    // ===================== standing in heels (as M1) =====================
    const AXX = new THREE.Vector3(1, 0, 0), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), vk = new THREE.Vector3(), mInv = new THREE.Matrix4();
    const fwd = new THREE.Vector3(), qw = new THREE.Quaternion(), qr = new THREE.Quaternion();
    let done = null;
    const _H = new THREE.Vector3(), _K = new THREE.Vector3(), _A = new THREE.Vector3(), _T = new THREE.Vector3(), _d = new THREE.Vector3(), _p = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qf = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _up = new THREE.Vector3();
    function rotBone(b, from, to) {
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
      if (done && SK.hips.position.y === done.y && SK.footR.quaternion.equals(done.qR) && SK.footL.quaternion.equals(done.qL)) return;
      const root = SK.hips.parent; root.updateMatrixWorld(true); mInv.copy(root.matrixWorld).invert(); root.getWorldQuaternion(qr).invert();
      let kneeLo = 9; for (const S of ['R', 'L']) { SK['shin' + S].getWorldPosition(vk).applyMatrix4(mInv); kneeLo = Math.min(kneeLo, vk.y); }
      const kn = sm(0.30, 0.15, kneeLo);
      SK.hips.position.y += HEEL * (1 - kn);
      for (const S of ['R', 'L']) {
        SK['foot' + S].getWorldQuaternion(qw); qw.premultiply(qr); fwd.set(0, 0, 1).applyQuaternion(qw);
        const already = -Math.asin(cl(fwd.y, -1, 1));
        const th = TH * (1 - sm(0.25, 0.9, already));
        SK['foot' + S].quaternion.multiply(qa.setFromAxisAngle(AXX, th));
        SK['toe' + S].quaternion.multiply(qb.setFromAxisAngle(AXX, -th));
      }
      root.updateMatrixWorld(true); const lows = {};
      for (const S of ['R', 'L']) {
        const B = BOOT[S], m = B.mesh; m.updateMatrixWorld(true); let lo = 9;
        for (const v of B.contact) { m.boneTransform(v, vk); lo = Math.min(lo, vk.y); }
        const need = FLOOR - lo;
        if (need > 0.001) { liftLeg(SK, S, need); root.updateMatrixWorld(true); lows[S] = FLOOR; } else lows[S] = lo;
      }
      const fl = Math.min(lows.R, lows.L) - FLOOR;
      if (fl > 0.002 && fl < 0.03) { SK.hips.position.y -= fl; root.updateMatrixWorld(true); }
      done = { y: SK.hips.position.y, qR: SK.footR.quaternion.clone(), qL: SK.footL.quaternion.clone() };
    });

    // ===================== her legs keep out of the long skirts (as D2): the skirt's chains are pushed out past (or up onto) her legs =====================
    {
      const T3 = THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.070;
      const tipOff = CH.map((c) => c.names.map((nm, k) => new T3.Vector3().subVectors(c.pts[k + 1], c.pts[k])));
      const A = new T3.Vector3(), Hc = new T3.Vector3(), P = new T3.Vector3(), Tp = new T3.Vector3(), N = new T3.Vector3(), E = new T3.Vector3(), V = new T3.Vector3();
      const q = new T3.Quaternion(), pq = new T3.Quaternion(), v1 = new T3.Vector3(), v2 = new T3.Vector3();
      const legs = [];
      for (const S of ['R', 'L']) legs.push([new T3.Vector3(), new T3.Vector3(), 0.078, 0.056, 'thigh' + S, 'shin' + S], [new T3.Vector3(), new T3.Vector3(), 0.056, 0.042, 'shin' + S, 'foot' + S]);
      const restD = CH.map((c) => c.names.map((nm, k) => { const out = []; for (const L of legs) { const a = W.SK[L[4]].userData.rest, b = W.SK[L[5]].userData.rest;
        for (let j = 0; j <= 5; j++) out.push(V.copy(a).lerp(b, j / 5).distanceTo(c.pts[k + 1])); } return out; }));
      let RD = null;
      const push = (p) => {
        E.set(p.x - Hc.x, 0, p.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return null; E.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0;
        legs.forEach((L, li) => { for (let k = 0; k <= 5; k++) { const t = k / 5; V.copy(L[0]).lerp(L[1], t); const R = Math.min(L[2] + (L[3] - L[2]) * t + PAD, RD[li * 6 + k] - 0.004);
          const vx = p.x - V.x, vy = p.y - V.y, vz = p.z - V.z, cc = vx * vx + vy * vy + vz * vz - R * R; if (cc >= 0) continue;
          const b1 = vx * E.x + vz * E.z, q1 = b1 * b1 - cc; if (q1 > 0) sOut = Math.max(sOut, -b1 + Math.sqrt(q1)); const q2 = vy * vy - cc; if (q2 > 0) sUp = Math.max(sUp, -vy + Math.sqrt(q2)); } });
        if (sOut <= 1e-4 && sUp <= 1e-4) return null;
        return sUp < sOut ? N.set(0, sUp, 0) : N.copy(E).multiplyScalar(sOut);
      };
      W.onFrame((SK) => {
        SK.hips.parent.updateMatrixWorld(true);
        for (const L of legs) { SK[L[4]].getWorldPosition(L[0]); SK[L[5]].getWorldPosition(L[1]); }
        SK.hips.getWorldPosition(Hc);
        CH.forEach((c, ci) => { for (let k = 0; k < c.names.length; k++) {
          const b = SK[c.names[k]]; b.getWorldPosition(P); Tp.copy(tipOff[ci][k]).applyMatrix4(b.matrixWorld); Tp.sub(A.setFromMatrixPosition(b.matrixWorld)).add(P);
          RD = restD[ci][k]; const d = push(Tp); if (!d) continue;
          v1.subVectors(Tp, P); const len = v1.length(); v2.copy(Tp).add(d).sub(P).setLength(len); v1.normalize(); v2.normalize();
          q.setFromUnitVectors(v1, v2); b.parent.getWorldQuaternion(pq);
          b.quaternion.premultiply(pq.clone().invert().multiply(q).multiply(pq)); b.updateMatrixWorld(true); } });
      });
    }
    W.X1 = { HEEL, TH, coatBase, coatR, edges };
  },
};
