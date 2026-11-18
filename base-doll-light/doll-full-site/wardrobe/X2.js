// X2, Chris's red damask devil gown (X2A.png, X2B.png): a floor-length gown of deep red damask with a dark floral pattern; a strapless
// sweetheart corset bodice with gold piping on its seams, its waist dipping in two points (a basque) over the skirt below the belt;
// off-the-shoulder black velvet bands round her upper arms; a black leather belt with a gold buckle; a full, gathered, flared skirt
// with a gold-trimmed hem and a slit at the front (on her LEFT, as all three paintings show it) through which a black heeled knee boot
// shows; black velvet opera gloves above the elbow; small black curved horns on a thin gold circlet over the bun; and a red devil tail
// hanging from the back of the belt down the skirt, ending in an arrowhead.
// Pieces:
//   x2Bodice    the corset: close over her body from under the belt to the sweetheart neckline (front) and a low straight back
//   x2Basque    the two points of the bodice below the belt, lying on the top of the skirt (they move with it)
//   x2Skirt     the skirt: gathered under the belt, flaring to a hem just above her boots' feet, folds deepening toward the hem;
//               open in a slit on her left front from the hem to just below her knee, every edge turned back so it has thickness
//   x2Trim      the gold braid round the hem and up both edges of the slit (a woven braid picture made here)
//   x2Belt      the belt: a leather band round her over bodice, skirt and points; x2Buckle its gold buckle and the tail tab's rivets
//   x2TailTab   the leather loop under the belt at the back that holds the tail; x2Tail the tail and its arrowhead (on the skirt's chains, so it swings)
//   x2Bands     the velvet bands: a soft roll from the bodice's corner at her front, round her upper arm, to its corner at her back
//   x2GloveR/L  the opera gloves' sleeves from above her elbows to her wrists; her hands are lent the same black velvet
//   x2BootR/L   black leather knee boots with a block heel: modelled as she stands in them (feet tipped), carried back to rest
//   x2Headband  a thin gold circlet lying on her hair, high over her forehead and low under the bun; x2Horns two curved black horns on it
// She stands in the boots' heels: the frame hook lifts her by HEEL and tips her feet (as wardrobe/M1.js does it; its boot outline is
// used here with a lower sole and a longer shaft). X2_prep.json gives the prep the same heel, so the paintings line up with her lifted.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
DOLLWEAR_DEFS.X2 = {
  name: 'Devil gown: red damask, velvet bands, opera gloves, horns and tail', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { THREE, sm, lerp, cl, PI, TAU, smin, smax, DOLL } = W;
    const F = W.F, Fs = W.Fsnug, BI = W.BI, FLOOR = W.SOLE;

    // ======================= materials =======================
    const damask = W.paint({ rough: 0.80, emis: 0.30, env: 0.16 });
    const damaskD = W.paint({ rough: 0.80, emis: 0.30, env: 0.16, double: true });
    // velvet: a dark pile that catches the light where it turns away (a soft rim)
    const velvet = (mat, key, k) => { mat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <tonemapping_fragment>', `{ float vN = clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0);
        gl_FragColor.rgb += vec3(0.060, 0.050, 0.056) * ${k.toFixed(2)} * pow(1.0 - vN, 2.2) * (0.55 + 0.45 * clamp(normal.y * 0.5 + 0.6, 0.0, 1.0)); }
        #include <tonemapping_fragment>`); }; mat.customProgramCacheKey = () => key; return mat; };
    const VELVET = velvet(W.std({ color: W.lin('#211a1e'), roughness: 0.90, envMapIntensity: 0.14 }), 'x2Velvet', 1.2);
    const VELVET_H = velvet(W.std({ color: W.lin('#1a1419'), roughness: 0.90, envMapIntensity: 0.12 }), 'x2VelvetH', 1.0);
    const LEATHER = W.phys({ color: W.lin('#151214'), roughness: 0.44, clearcoat: 0.30, clearcoatRoughness: 0.42, envMapIntensity: 0.8 });
    const BOOTLEATHER = W.phys({ color: W.lin('#171315'), roughness: 0.40, clearcoat: 0.34, clearcoatRoughness: 0.38, envMapIntensity: 0.85 });
    const GOLD = W.std({ color: W.lin('#c99a4c'), metalness: 1.0, roughness: 0.30, envMapIntensity: 1.3 });
    const HORN = W.phys({ color: W.lin('#1e181a'), roughness: 0.36, clearcoat: 0.45, clearcoatRoughness: 0.35, envMapIntensity: 0.8 });
    const TAILM = W.phys({ color: W.lin('#86222b'), roughness: 0.46, clearcoat: 0.30, clearcoatRoughness: 0.45, envMapIntensity: 0.6, side: THREE.DoubleSide });

    // ======================= small geometry helpers =======================
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    function faceOut(g, c) {                               // flip a mesh's triangles if they face toward c(point) on the whole
      const nor = W.computeNormals(g.pos, g.idx); let s = 0;
      for (let v = 0; v < g.pos.length / 3; v += 3) { const p = [g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]], q = c(p); s += nor[v * 3] * (p[0] - q[0]) + nor[v * 3 + 1] * (p[1] - q[1]) + nor[v * 3 + 2] * (p[2] - q[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    // a tube along points P[i] = { p, n (a side direction), r }, rings of NV points, capped at both ends
    function tube(P, NV, flat) {
      const rings = [];
      for (let i = 0; i < P.length; i++) {
        const q = P[i], a = P[Math.max(0, i - 1)].p, b = P[Math.min(P.length - 1, i + 1)].p, t = norm(sub(b, a)), n0 = q.n;
        const u = norm(sub(n0, [t[0] * dot(n0, t), t[1] * dot(n0, t), t[2] * dot(n0, t)])), v = cross(t, u), ring = [];
        for (let j = 0; j < NV; j++) { const ph = (j / NV) * TAU, rr = q.r * (q.ring ? q.ring(ph) : 1); ring.push(add(add(q.p, u, Math.cos(ph) * rr * (flat || 1)), v, Math.sin(ph) * rr)); }
        rings.push(ring);
      }
      const g = W.loft(rings, { capA: true, capB: true }), mid = Math.floor(rings.length / 2);
      return faceOut(g, (p) => { let best = 0, bd = 9; for (let i = 0; i < P.length; i++) { const d = Math.hypot(p[0] - P[i].p[0], p[1] - P[i].p[1], p[2] - P[i].p[2]); if (d < bd) { bd = d; best = i; } } return P[best].p; });
    }
    // a smooth curve through keys [[x, [values]], ...] (Catmull-Rom)
    function cprof(K, x) {
      if (K[0][0] > K[K.length - 1][0]) K = K._r || (K._r = K.slice().reverse());
      const n = K.length; if (x <= K[0][0]) return K[0][1]; if (x >= K[n - 1][0]) return K[n - 1][1];
      let i = 1; while (K[i][0] < x) i++;
      const x0 = K[i - 1][0], x1 = K[i][0], u = (x - x0) / (x1 - x0), A = K[Math.max(0, i - 2)], B = K[i - 1], C = K[i], D = K[Math.min(n - 1, i + 1)];
      return B[1].map((b, j) => { const c = C[1][j], m0 = (c - A[1][j]) / (C[0] - A[0]) * (x1 - x0), m1 = (D[1][j] - b) / (D[0] - B[0]) * (x1 - x0), u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * b + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * c + (u3 - u2) * m1; });
    }
    // a sheet with thickness from a grid of points G[i][j] (wardrobe/M1.js): outer surface, inner surface th inward, rims on the open borders
    function thickSheet(G, th, closedU, outRef) {
      const m = G.length, n = G[0].length, cols = closedU ? n + 1 : n, pos = [], idx = [], N = [];
      for (let i = 0; i < m; i++) { const row = []; for (let j = 0; j < n; j++) {
        const i0 = Math.max(0, i - 1), i1 = Math.min(m - 1, i + 1), j0 = closedU ? (j - 1 + n) % n : Math.max(0, j - 1), j1 = closedU ? (j + 1) % n : Math.min(n - 1, j + 1);
        const nn = norm(cross(sub(G[i1][j], G[i0][j]), sub(G[i][j1], G[i][j0]))); row.push(nn); } N.push(row); }
      let sg = 0; for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) { const p = G[i][j], c = outRef(p); sg += dot(N[i][j], sub(p, c)); }
      const s = sg < 0 ? -1 : 1, base = m * cols;
      for (let L = 0; L < 2; L++) for (let i = 0; i < m; i++) for (let j = 0; j < cols; j++) { const jj = closedU ? j % n : j, p = G[i][jj], q = N[i][jj], t = L ? th : 0; pos.push(p[0] - s * q[0] * t, p[1] - s * q[1] * t, p[2] - s * q[2] * t); }
      const fo = s < 0, quad = (a, b, c, d, flip) => { if (flip) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c); };
      for (let i = 0; i < m - 1; i++) for (let j = 0; j < cols - 1; j++) { const a = i * cols + j, b = a + 1, c = a + cols + 1, d = a + cols; quad(a, b, c, d, fo); quad(base + a, base + b, base + c, base + d, !fo); }
      const rim = (list, flip) => { const k0 = pos.length / 3, L = list.length;
        for (const v of list) pos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); for (const v of list) { const w = base + v; pos.push(pos[w * 3], pos[w * 3 + 1], pos[w * 3 + 2]); }
        for (let k = 0; k < L - 1; k++) quad(k0 + k, k0 + k + 1, k0 + L + k + 1, k0 + L + k, flip !== fo); };
      const row = (i) => { const l = []; for (let j = 0; j < cols; j++) l.push(i * cols + j); return l; }, col = (j) => { const l = []; for (let i = 0; i < m; i++) l.push(i * cols + j); return l; };
      rim(row(0), true); rim(row(m - 1), false); if (!closedU) { rim(col(0), false); rim(col(cols - 1), true); }
      return { pos, idx };
    }

    // ======================= heights from the paintings (rest, metres) =======================
    // (the painted belt is at 1.024 to 1.053; hers is 1.4 cm higher, where her waist is as narrow as the painting's: her own waist is
    // lower and wider than the painted figure's, so at the painted height the belt would stand 4 cm out past the painted one each side)
    const BELT0 = 1.038, BELT1 = 1.067;                    // the belt
    const WAIST_B = 1.030;                                 // the bodice's bottom edge, under the belt
    const SK_TOP = 1.054, HEM = 0.056;                     // the skirt: its top under the belt, its hem
    const SKC = -0.020;                                    // the skirt's middle line (z)

    // ======================= the bodice =======================
    // a sweetheart neckline at the front: a sharp dip in the middle (1.205), two round crests over her breasts (1.258), easing down toward
    // her sides; a low, nearly straight back (1.186 in the middle). The front is read where z is in front of her middle at bust height.
    const CZ = (W.trunkAt(1.22)[1] + W.trunkAt(1.22)[2]) / 2;
    const sweet = (ax) => ax < 0.075 ? 1.205 + 0.053 * (1 - Math.pow(1 - ax / 0.075, 2)) : 1.258 - 0.004 * sm(0.075, 0.13, ax);
    const backTop = (ax) => 1.181 + 0.016 * sm(0.0, 0.10, ax);
    const topB = (x, z) => { const ax = Math.abs(x); return lerp(backTop(ax), sweet(ax), sm(CZ - 0.05, CZ + 0.03, z)); };
    const bodR = (x, y, z) => Math.max(WAIST_B - y, y - topB(x, z));
    const bodTh = (x, y, z) => 0.0040 + 0.0010 * sm(0.010, 0.003, topB(x, z) - y);       // the piped top edge stands a little proud
    W.snug('x2Bodice', bodR, bodTh, [-0.158, 0.158, WAIST_B - 0.008, 1.272, -0.135, 0.135], 0.0047, { mat: damask });
    // ======================= the skirt =======================
    // her body's outline round the skirt's middle line, by height and angle (from outside in, so her legs count as one) (wardrobe/D1.js)
    const NA = 72, YB0 = 1.10, YB1 = 0.62, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1;
    const BT = window.__X2body || (window.__X2body = (() => { const T = new Float32Array(NB * NA);
      for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
        for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
          let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
          T[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
      return T; })());
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; const fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    // the painted outline: half width, front and back from the middle line SKC (front, side and back paintings)
    // (measured off the paintings' outline: the front and back paintings' half widths averaged; the side painting's front and back)
    const FLa = [[1.05, 0.100, 0.085, -0.075], [0.98, 0.140, 0.098, -0.112], [0.93, 0.158, 0.104, -0.133], [0.88, 0.175, 0.112, -0.145], [0.80, 0.197, 0.132, -0.159],
      [0.70, 0.221, 0.150, -0.173], [0.60, 0.244, 0.160, -0.188], [0.50, 0.265, 0.172, -0.203], [0.40, 0.287, 0.184, -0.223], [0.30, 0.308, 0.195, -0.240],
      [0.20, 0.330, 0.207, -0.260], [0.10, 0.352, 0.216, -0.280], [0.04, 0.356, 0.220, -0.285]];
    const FL = FLa.map((r) => [r[0], [r[1], r[2] - SKC, SKC - r[3]]]), FLc = FLa.map((r) => [r[0], [r[1], r[2], r[3]]]);
    const gAmp = (y) => lerp(0.0020, 0.026, Math.pow(sm(SK_TOP, HEM, y), 0.7));
    const flareR = (y, a) => { const v = cprof(FL, y), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2], k = 0.85 * gAmp(y);
      return 1 / Math.sqrt((s / (v[0] - k)) * (s / (v[0] - k)) + (c / (rz - k)) * (c / (rz - k))); };
    const clear = (y) => lerp(0.0058, 0.010, sm(1.03, 0.90, y));
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), lerp(0.004, 0.030, sm(1.035, 0.92, y)));
    // heavy organ-pipe folds toward the hem, fine gathers under the belt
    const fold = (a, y) => { const t = sm(SK_TOP, HEM, y), ph = 0.45 * t * Math.sin(2 * a + 0.4);
      const fine = Math.sin(a * 46 + 0.3), main = 0.70 * Math.sin(a * 20 + ph + 0.7 * Math.sin(a * 3)) + 0.30 * Math.sin(a * 33 + 1.3 + ph * 1.5);
      return lerp(fine, main, sm(0.0, 0.25, t)); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    const envR = (y, a) => baseR(y, a) + gAmp(y);
    const hemY = (a) => HEM + 0.016 * Math.pow(Math.max(0, Math.cos(a)), 2) + 0.004 * Math.sin(a * 3 + 1) - 0.005 * (0.5 + 0.5 * fold(a, HEM));      // a little higher at the front (side painting)
    const atR = (y, a, r) => [r * Math.sin(a), y, SKC + r * Math.cos(a)];
    // the slit: on her left front (angle SL_A from the front toward her left), opening from SL_TOP down to the hem
    const SL_A = 0.44, SL_TOP = 0.47;
    const gap = (y) => 0.22 * Math.pow(sm(SL_TOP, HEM + 0.01, y), 0.75);
    let skirtInfo = null;
    {
      const NU = 184, NV = 60, ys = []; for (let i = 0; i <= NV; i++) { const t = i / NV; ys.push(lerp(SK_TOP, HEM, t * t * 0.35 + t * 0.65)); }
      // the columns of a row at height y: [angle, which edge (-1 left, 1 right, 0 cloth), inward offset, along]
      const colsAt = (y) => { const g = gap(y), aL = SL_A + g / 2, aR = SL_A + TAU - g / 2, c = [];
        c.push([aL + 0.075, aL, -0.0042], [aL, aL, -0.0030]);
        for (let j = 0; j <= NU; j++) c.push([lerp(aL, aR, j / NU), null, 0]);
        c.push([aR, aR, -0.0030], [aR - 0.075, aR, -0.0042]);
        return c; };
      const NC = NU + 5;
      const ptAt = (y, col, dr) => { const [a, aE, d] = col, r = (aE == null ? skirtR(y, a) : skirtR(y, aE)) + d + (dr || 0); return atR(y, a, r); };
      const rings = [];
      { const c = colsAt(SK_TOP); rings.push(c.map((q) => ptAt(SK_TOP + 0.002, q, -0.0025))); }            // the gathered top edge, rolled in under the belt
      for (const y of ys) { const c = colsAt(y); rings.push(c.map((q) => { const a = q[1] == null ? q[0] : q[1], yy = y === HEM ? hemY(a) : lerp(y, hemY(a), sm(SK_TOP, HEM, y) * sm(0.40, HEM, y)); return ptAt(yy, q); })); }
      // the hem: a rounded edge, then turned up inside 3 cm
      { const c = colsAt(HEM), r0 = [], r1 = [], r2 = [];
        for (const q of c) { const a = q[1] == null ? q[0] : q[1], h = hemY(a); r0.push(ptAt(h - 0.0016, q, -0.0018)); r1.push(ptAt(h + 0.0005, q, -0.0040)); r2.push(ptAt(h + 0.030, q, -0.0046)); }
        rings.push(r0, r1, r2); }
      const g = W.loft(rings, { open: true });
      faceOut(g, (p) => [0, p[1], SKC]);
      skirtInfo = { rows: rings.length, cols: NC };
      W.part('x2Skirt', g, (x, y, z) => W.wSkirt(x, y, z), { mat: damaskD });
    }

    // ======================= the gold braid on the hem and up both edges of the slit =======================
    const braidTex = window.__X2braid || (window.__X2braid = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 32; const g = c.getContext('2d');
      g.fillStyle = '#6a4e24'; g.fillRect(0, 0, 64, 32); g.fillStyle = '#2a1c0e'; g.fillRect(0, 0, 64, 5); g.fillRect(0, 27, 64, 5);
      g.strokeStyle = '#b8944e'; g.lineWidth = 9; for (let x = -32; x < 96; x += 32) { g.beginPath(); g.moveTo(x, 6); g.lineTo(x + 18, 26); g.stroke(); }
      g.strokeStyle = '#d9b86c'; g.lineWidth = 3; for (let x = -32; x < 96; x += 32) { g.beginPath(); g.moveTo(x + 1, 7); g.lineTo(x + 17, 25); g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; })());
    const BRAID = W.std({ map: braidTex, color: W.lin('#e8e0d0'), metalness: 0.50, roughness: 0.48, envMapIntensity: 0.9, side: THREE.DoubleSide });
    {
      const strips = [], TW = 0.0090;
      const strip = (rows) => { const g = W.loft(rows, { open: true }), n = rows[0].length, uv = [];
        const L = [0]; for (let j = 1; j < n; j++) { const a = rows[1][j - 1], b = rows[1][j]; L.push(L[j - 1] + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])); }
        for (let i = 0; i < rows.length; i++) for (let j = 0; j < n; j++) uv.push(L[j] / 0.016, i / (rows.length - 1));
        g.uv = uv; return faceOut(g, (p) => [0, p[1], SKC]); };
      { const g0 = gap(HEM), aL = SL_A + g0 / 2, aR = SL_A + TAU - g0 / 2, NU = 368, rows = [];
        for (const [dy, dr] of [[-0.0024, -0.0012], [-0.0012, 0.0010], [TW, 0.0010], [TW + 0.0012, -0.0002]]) { const row = [];
          for (let j = 0; j <= NU; j++) { const a = lerp(aL, aR, j / NU), h = hemY(a); row.push(atR(h + dy, a, skirtR(h + Math.max(dy, 0), a) + dr)); } rows.push(row); }
        strips.push(strip(rows)); }
      for (const side of [-1, 1]) { const NV = 44, rows = [];
        for (const [da, dr] of [[-0.0012, -0.0012], [0, 0.0010], [TW, 0.0010], [TW + 0.0012, -0.0002]]) { const row = [];
          for (let i = 0; i <= NV; i++) { const y = lerp(HEM, SL_TOP + 0.010, i / NV), aE = SL_A + side * gap(y) / 2, h = Math.max(y, hemY(aE) + TW * 0.5), r = skirtR(h, aE), a = aE + side * da / r; row.push(atR(h, a, r + dr)); }
          rows.push(row); }
        strips.push(strip(rows)); }
      const all = merge(strips), uv = []; for (const g of strips) for (const v of g.uv) uv.push(v); all.uv = uv;
      W.part('x2Trim', all, (x, y, z) => W.wSkirt(x, y, z), { mat: BRAID });
    }
    // ======================= the basque: the bodice's two points over the top of the skirt =======================
    // Each point: its inner edge runs from the belt (|x| 0.056) down and out to the point (|x| 0.104, 0.925); its outer edge from the
    // point up round her hip to the belt behind her side. It lies on the skirt's folds and is carried as the skirt under it is.
    const TAB_Y0 = 0.923, TAB_Y1 = BELT0 + 0.006, TAB_X0 = 0.058, TAB_X1 = 0.095, A_SIDE = PI / 2 + 0.30;
    const angForX = (y, x) => { let lo = 0, hi = PI / 2 + 0.3; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (envR(y, m) * Math.sin(m) < x) lo = m; else hi = m; } return (lo + hi) / 2; };
    const A_PT = angForX(TAB_Y0, TAB_X1);
    {
      const parts = [];
      for (const s of [-1, 1]) {
        const NR = 26, NCt = 30, G = [];
        for (let i = 0; i <= NR; i++) {
          const y = lerp(TAB_Y0, TAB_Y1, Math.pow(i / NR, 0.9)), f = (y - TAB_Y0) / (TAB_Y1 - TAB_Y0);
          const aIn = i === 0 ? A_PT : angForX(y, lerp(TAB_X1, TAB_X0, f)), aOut = A_PT + (A_SIDE - A_PT) * Math.pow(f, 1.25), row = [];
          for (let j = 0; j <= NCt; j++) { const a = lerp(aIn, Math.max(aIn, aOut), j / NCt), r = envR(y, a) + 0.0032; row.push(atR(y, s * a, r)); }
          G.push(row);
        }
        parts.push(thickSheet(G, 0.0026, false, (p) => [0, p[1], SKC]));
      }
      W.part('x2Basque', merge(parts), (x, y, z) => W.wSkirt(x, y, z), { mat: damask });
    }
    const inTab = (x, y, z) => { if (y < TAB_Y0 || y > TAB_Y1 || z < SKC) return false; const f = (y - TAB_Y0) / (TAB_Y1 - TAB_Y0), ax = Math.abs(x); return ax > lerp(TAB_X1, TAB_X0, f); };
    // the tail's tab at her back: a leather loop over the top of the tail (x across it; it stands out over the tail below the belt)
    const tabR = (y, x) => { const a = PI - Math.asin(cl(x / envR(y, PI), -1, 1)); return Math.max(envR(y, a), bodyR(y, a) + 0.006) + 0.0030 + 0.0230 * Math.pow(Math.max(0, Math.cos(x / 0.0125 * PI / 2)), 0.5) * sm(BELT0 + 0.002, BELT0 - 0.008, y); };
    // ======================= the belt and its buckle =======================
    // a leather band round her over the bodice, the skirt's gathered top and the points; a little rounded at its edges
    const beltR = (a) => { let r = 0; for (const y of [BELT0, (BELT0 + BELT1) / 2, BELT1]) { r = Math.max(r, bodyR(y, a) + 0.0046); if (y <= SK_TOP + 0.002) r = Math.max(r, envR(y, a) + 0.0012); }
      const aa = Math.abs(((a + PI) % TAU + TAU) % TAU - PI); if (aa > A_PT - 0.05 && aa < A_SIDE + 0.05) r = Math.max(r, envR(BELT0, a) + 0.0036);
      return r + 0.0028; };
    {
      const NU = 180, RB = new Float32Array(NU); for (let j = 0; j < NU; j++) RB[j] = beltR((j / NU) * TAU);
      // smooth the radius round her a little (the band is stiff)
      const RS = new Float32Array(NU); for (let j = 0; j < NU; j++) { let s = 0, w = 0; for (let k = -4; k <= 4; k++) { const q = Math.exp(-k * k / 8); s += RB[(j + k + NU) % NU] * q; w += q; } RS[j] = Math.max(RB[j], s / w); }
      const PRO = [[BELT0 + 0.0015, -0.0042], [BELT0, -0.0020], [BELT0 + 0.0012, 0], [BELT1 - 0.0012, 0], [BELT1, -0.0020], [BELT1 - 0.0015, -0.0042], [BELT1 - 0.004, -0.0048], [BELT0 + 0.004, -0.0048]];
      const rings = []; for (const [y, d] of PRO.concat([PRO[0]])) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(atR(y, a, RS[j] + d)); } rings.push(ring); }
      const g = faceOut(W.loft(rings, {}), (p) => [0, p[1], SKC]);
      W.part('x2Belt', g, (x, y, z) => { const a = Math.atan2(x, z - SKC), r = bodyR(y, a) - 0.003; return W.wBody(r * Math.sin(a), y, SKC + r * Math.cos(a)); }, { mat: LEATHER });
      // the buckle: a rectangular gold frame with a bar and a prong, a little right of her middle (as painted)
      const yB = (BELT0 + BELT1) / 2, xB = 0.004, zB = SKC + beltR(0) + 0.0010, pieces = [];
      const box = (cx, cy, cz, hx, hy, hz) => { const P = [], I = []; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) P.push(cx + sx * hx, cy + sy * hy, cz + sz * hz);
        const f = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]; for (const q of f) I.push(q[0], q[1], q[2], q[0], q[2], q[3]); return { pos: P, idx: I }; };
      const HX = 0.019, HY = 0.0175, BW = 0.0028, BZ = 0.0018;
      pieces.push(box(xB, yB + HY - BW / 2, zB + BZ, HX, BW / 2, BZ), box(xB, yB - HY + BW / 2, zB + BZ, HX, BW / 2, BZ),
        box(xB - HX + BW / 2, yB, zB + BZ, BW / 2, HY, BZ), box(xB + HX - BW / 2, yB, zB + BZ, BW / 2, HY, BZ),
        box(xB - 0.004, yB, zB + BZ * 0.8, 0.0012, HY - BW, BZ * 0.8), box(xB + 0.003, yB, zB + BZ * 1.6, HX * 0.55, 0.0011, 0.0009));
      // the tail tab's two rivets (on the tab, at the back)
      for (const yr of [BELT0 + 0.017, BELT0 - 0.012]) { const zz = yr > BELT0 ? SKC - beltR(PI) - 0.0006 : SKC - tabR(yr, 0) - 0.0006; pieces.push(box(0, yr, zz, 0.0026, 0.0026, 0.0013)); }
      const wB = W.wBody(0, yB, W.trunkAt(yB)[1] - 0.004), wBk = W.wBody(0, yB, W.trunkAt(yB)[2] + 0.004);
      W.part('x2Buckle', merge(pieces), (x, y, z) => (z > 0 ? wB : wBk), { mat: GOLD });
    }
    // ======================= the tail and its tab =======================
    // The tab: a short leather strap from under the belt at her back down over the skirt. The tail: from under the tab, down the back
    // of the skirt, curving toward her right, ending in an arrowhead at about 0.45 m (back and side paintings). It lies on the skirt's
    // folds and is carried by the skirt's chains, so it swings with the skirt.
    {
      const G = [], NRt = 8, NCt = 10;
      for (let i = 0; i <= NRt; i++) { const y = lerp(BELT0 - 0.024, BELT0 + 0.010, i / NRt), row = [];
        for (let j = 0; j <= NCt; j++) { const x = lerp(-0.0125, 0.0125, j / NCt), a = PI - Math.asin(x / envR(y, PI)); row.push(atR(y, a, tabR(y, x))); }
        G.push(row); }
      W.part('x2TailTab', thickSheet(G, 0.0025, false, (p) => [0, p[1], SKC]), (x, y, z) => W.mixW(W.wBody(x, y, z + 0.02), W.wSkirt(x, y, z), sm(1.03, 1.00, y)), { mat: LEATHER });
    }
    const TAILX = [[1.020, [0.000]], [0.960, [0.000]], [0.900, [-0.004]], [0.820, [-0.014]], [0.740, [-0.030]], [0.660, [-0.052]], [0.590, [-0.078]], [0.530, [-0.102]], [0.490, [-0.118]], [0.460, [-0.128]]];
    const tailPath = [];
    {
      const NT = 64, Y0 = BELT0 - 0.018, Y1 = 0.462;
      for (let i = 0; i <= NT; i++) { const t = i / NT, y = lerp(Y0, Y1, t), x = cprof(TAILX, y)[0];
        let a = PI; for (let k = 0; k < 6; k++) a = PI - Math.asin(cl(x / envR(y, a), -0.9, 0.9));
        const rad = lerp(0.0078, 0.0050, t) * (1 + 0.15 * sm(0.06, 0.0, t));
        const r = Math.max(envR(y, a), y > 0.96 ? bodyR(y, a) + 0.006 : 0) + rad + 0.0012 + (y > 0.995 ? 0.0012 : 0) + 0.020 * Math.pow(sm(0.80, 0.47, y), 1.5);      // the lower tail hangs a little off the skirt
        tailPath.push({ p: atR(y, a, r), n: [Math.sin(a), 0, Math.cos(a)], r: rad, a }); }
      const tl = tube(tailPath, 12);
      // the arrowhead: a flat spade lying on the skirt, pointing on along the tail
      const end = tailPath[tailPath.length - 1], prev = tailPath[tailPath.length - 4], t = norm(sub(end.p, prev.p)), n = end.n, b = norm(cross(t, n));
      const SH = [[0.0035, -0.004], [0.0060, 0.000], [0.0185, 0.010], [0.0130, 0.024], [0.0000, 0.046], [-0.0130, 0.024], [-0.0185, 0.010], [-0.0060, 0.000], [-0.0035, -0.004]];
      const pos = [], idx = [], TH2 = 0.0024, o0 = add(end.p, t, -0.002);
      for (const L of [-1, 1]) { const k0 = pos.length / 3, c = add(add(o0, t, 0.016), n, L * TH2 * 1.3); pos.push(...c);
        for (const [w, u] of SH) pos.push(...add(add(add(o0, b, w), t, u), n, L * TH2));
        for (let k = 0; k < SH.length - 1; k++) { if (L > 0) idx.push(k0, k0 + 1 + k, k0 + 2 + k); else idx.push(k0, k0 + 2 + k, k0 + 1 + k); }
        idx.push(...(L > 0 ? [k0, k0 + SH.length, k0 + 1] : [k0, k0 + 1, k0 + SH.length])); }
      const nS = SH.length + 1; for (let k = 0; k < SH.length; k++) { const a1 = 1 + k, a2 = 1 + (k + 1) % SH.length, A1 = a1, A2 = a2, B1 = nS + a1, B2 = nS + a2; idx.push(A1, B1, B2, A1, B2, A2); }
      const head = faceOut({ pos, idx }, (p) => add(o0, t, 0.016));
      W.part('x2Tail', merge([tl, head]), (x, y, z) => { const a = Math.atan2(x, z - SKC), r = Math.max(0.05, bodyR(Math.min(y, 1.0), a) * 0.5 + envR(y, a) * 0.5 - 0.02); return y > 0.995 ? W.mixW(W.wBody(x, y, z + 0.02), W.wSkirt(x, y, z), 0.5) : W.wSkirt(r * Math.sin(a), y, SKC + r * Math.cos(a)); }, { mat: TAILM });
    }
    // ======================= the velvet bands round her upper arms =======================
    // Each band is one soft roll of velvet (a flattened section, a few folds along it): from the bodice's top corner at her front, across
    // the front of her armpit, round the outside of her upper arm (centre 1.24 m at her outer arm, 7 cm wide), across the back of her
    // arm and down to the bodice's top corner at her back. Round her arm it is carried by her arm; at its two ends by her body.
    {
      const parts = [], WT = [];
      const A = 0.034, B = 0.0075;                                                      // half width (along her arm), half thickness of the roll
      const skinZ = (x, y, z0, dir) => { let z = z0; for (let k = 0; k < 60; k++) { const f = F(x, y, z); if (Math.abs(f) < 2e-4) break; z += dir * f * 0.9; } return z; };
      for (const [S, s] of [['R', -1], ['L', 1]]) {
        const C = (sl) => { const c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), c3 = W.armPt(S, sl, PI / 2), c4 = W.armPt(S, sl, 1.5 * PI); return [(c1[0] + c2[0] + c3[0] + c4[0]) / 4, (c1[1] + c2[1] + c3[1] + c4[1]) / 4, (c1[2] + c2[2] + c3[2] + c4[2]) / 4]; };
        const slC = (a) => 0.058 - 0.010 * Math.max(0, Math.sin(a)) + 0.010 * Math.max(0, -Math.sin(a));
        const P = [], WP = [];
        // the front end on her chest, the arm part, the back end on her back
        const ends = { F: [s * 0.103, 1.247], B: [s * 0.092, 1.199] };
        const endPt = (k) => { const [x, y] = ends[k], dir = k === 'F' ? -1 : 1, z = skinZ(x, y, k === 'F' ? 0.15 : -0.15, dir), n = k === 'F' ? [s * 0.25, 0.1, 0.96] : [s * 0.25, 0.1, -0.96];
          return { p: add([x, y, z], norm(n), 0.6 * B + 0.0040), n: norm(n), w: W.wBody(x, y, z) }; };
        const armP = (a) => { const sl = slC(a), q = W.armPt(S, sl, a), n = norm(sub(q, C(sl))); return { p: add(q, n, 0.6 * B + 0.0016), n, w: W.wArmSL(S, sl, a) }; };
        const aF = 0.62, aB = -0.70, NA2 = 22, NE = 12;
        // keep a point of the straight stretches off her arm (a round arm about its rest axis) and off her body
        const pushArm = (q) => { for (let k = 0; k < 4; k++) { const f = W.armFrame(S, q.p[0], q.p[1], q.p[2]), sl = cl(f.sl, 0.0, 0.2), c = C(sl), rs = Math.hypot(...sub(W.armPt(S, sl, f.a), c)) + B + 0.0025;
          if (f.r >= rs) break; const d = norm(sub(q.p, c)), ax = W.armDir[S], e = dot(d, [ax.x, ax.y, ax.z]); const dd = norm(sub(d, [ax.x * e, ax.y * e, ax.z * e])); q.p = add(q.p, dd, rs - f.r); } return q; };
        const eF = endPt('F'), eB = endPt('B'), a0 = armP(aF), a1 = armP(aB);
        const pushOut = (q) => { for (let k = 0; k < 20; k++) { const f = F(q.p[0], q.p[1], q.p[2]); if (f > B + 0.003) break; q.p = add(q.p, q.n, B + 0.0035 - f); } return q; };
        // the front bridge: from the chest end to the arm, sagging a little outward
        for (let k = 0; k < NE; k++) { const t = k / NE, p = add(add([0, 0, 0], eF.p, 1 - t), a0.p, t), n = norm(add(add([0, 0, 0], eF.n, 1 - t), a0.n, t));
          P.push(pushArm(pushOut({ p: add(p, n, 0.003 * Math.sin(PI * t)), n }))); WP.push(W.mixW(eF.w, a0.w, sm(0.35, 0.95, t))); }
        for (let k = 0; k <= NA2; k++) { const a = lerp(aF, aB, k / NA2), q = armP(a); P.push(q); WP.push(k === 0 || k === NA2 ? W.mixW(q.w, (k ? eB : eF).w, 0.1) : q.w); }
        for (let k = 1; k <= NE; k++) { const t = k / NE, p = add(add([0, 0, 0], a1.p, 1 - t), eB.p, t), n = norm(add(add([0, 0, 0], a1.n, 1 - t), eB.n, t));
          P.push(pushArm(pushOut({ p: add(p, n, 0.003 * Math.sin(PI * t)), n }))); WP.push(W.mixW(a1.w, eB.w, sm(0.05, 0.65, t))); }
        // folds along it, and fuller round the outside of her arm
        const NP2 = P.length;
        // its section: a soft roll, flat on her skin, domed outside, its edges rounded; ruched in shallow diagonal folds along its length
        const NV = 24, rings = []; let sArc = 0;
        for (let i = 0; i < NP2; i++) {
          const q = P[i], a0 = P[Math.max(0, i - 1)].p, b0 = P[Math.min(NP2 - 1, i + 1)].p, t = norm(sub(b0, a0));
          if (i) sArc += Math.hypot(...sub(q.p, P[i - 1].p));
          const u = norm(sub(q.n, [t[0] * dot(q.n, t), t[1] * dot(q.n, t), t[2] * dot(q.n, t)])), v = cross(t, u), fu = i / (NP2 - 1), full = 1 + 0.18 * Math.sin(PI * fu), ring = [];
          for (let j = 0; j < NV; j++) { const ph = (j / NV) * TAU, c = Math.cos(ph), sn = Math.sin(ph), cu = Math.sign(c) * Math.pow(Math.abs(c), 0.55), sv = Math.sign(sn) * Math.pow(Math.abs(sn), 0.55);
            const wv = A * full * sv, e = 1 - sv * sv;
            const uo = c > 0 ? cu * (B + 0.0040 * e + 0.0024 * e * Math.sin(sArc / 0.030 * TAU + 2.6 * sv + 0.9 * Math.sin(sArc * 41))) : cu * 0.6 * B;
            ring.push(add(add(q.p, u, uo), v, wv)); }
          rings.push(ring);
        }
        const g = faceOut(W.loft(rings, { capA: true, capB: true }), (pt) => { let bi = 0, bd = 9; for (let i = 0; i < NP2; i++) { const d = Math.hypot(...sub(pt, P[i].p)); if (d < bd) { bd = d; bi = i; } } return add(P[bi].p, P[bi].n, -0.02); });
        const cols = NV + 1, nR = NP2 * cols; for (let k = 0; k < g.pos.length / 3; k++) WT.push(k < nR ? WP[Math.floor(k / cols)] : WP[k === nR ? 0 : NP2 - 1]);
        parts.push(g);
      }
      W.part('x2Bands', merge(parts), (x, y, z, i) => WT[i], { mat: VELVET });
    }
    // ======================= the opera gloves =======================
    // close velvet sleeves from above her elbow (a little higher on the outside) to her wrist, soft rings of creases down the forearm,
    // the top edge turned in; her hands take the same velvet
    const GL_TOP = (a) => lerp(0.168, 0.188, (1 - Math.cos(a)) / 2), GL_END = 0.458;
    for (const S of ['R', 'L']) {
      const NU = 36, NR = 52, rings = [], SLs = [];
      const C = (sl) => { const c1 = W.armPt(S, sl, 0), c2 = W.armPt(S, sl, PI), c3 = W.armPt(S, sl, PI / 2), c4 = W.armPt(S, sl, 1.5 * PI); return [(c1[0] + c2[0] + c3[0] + c4[0]) / 4, (c1[1] + c2[1] + c3[1] + c4[1]) / 4, (c1[2] + c2[2] + c3[2] + c4[2]) / 4]; };
      const pt = (sl, a, e) => { const p = W.armPt(S, sl, a); return add(p, norm(sub(p, C(sl))), e); };
      const off = (sl, a) => 0.0022 + 0.0012 * sm(0.30, 0.19, sl) + 0.0013 * sm(0.20, 0.30, sl) * sm(0.455, 0.42, sl)
        * Math.pow(0.5 + 0.5 * Math.sin(sl / 0.024 * TAU + 0.8 * Math.sin(a) + 0.4 * Math.sin(sl * 61)), 2.4) * (0.6 + 0.4 * Math.cos(a - PI / 2));
      const row = (f, dsl, de) => { const ring = [], sls = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, s0 = GL_TOP(a), sl = (f == null ? s0 : lerp(s0, GL_END, f)) + (dsl || 0);
          ring.push(pt(sl, a, (de == null ? off(Math.max(sl, s0), a) : de))); sls.push([sl, a]); }
        rings.push(ring); SLs.push(sls); };
      row(null, 0.016, 0.0006); row(null, 0.002, 0.0012); row(null, -0.0012, 0.0022);           // the top edge turned in
      for (let i = 0; i <= NR; i++) row(i / NR);
      const g = W.loft(rings, {}), cols = NU + 1;
      faceOut(g, (p) => { const f = W.armFrame(S, p[0], p[1], p[2]); return C(cl(f.sl, 0.1, 0.46)); });
      W.part('x2Glove' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, 0.3); const [sl, a] = SLs[r][j % NU]; return W.wArmSL(S, cl(sl, 0.0, 0.452), a); }, { mat: VELVET });
    }
    W.swapMat('hand', VELVET_H); W.swapMat('handR', VELVET_H);
    // ======================= the boots: modelled as she stands in them, then carried back to her rest pose =======================
    // The foot's geometry in the heels is wardrobe/M1.js's (the same tip of her feet), on a thinner sole (1 cm) and a block heel:
    // heel seat HS above the floor, the ball of her foot PLAT. Posed space: she is lifted by HEEL, each foot tipped by TH about its ankle.
    const HS = 0.076, PLAT = 0.010;
    const A_R = { y: 0.105, z: -0.012 }, T_R = { y: 0.054, z: 0.088 };
    let TH = 0.5; for (let i = 0; i < 40; i++) { const f = -0.016 * Math.cos(TH) + 0.133 * Math.sin(TH) + 0.016 - (HS - PLAT); TH -= f / (0.016 * Math.sin(TH) + 0.133 * Math.cos(TH)); }
    const HEEL = FLOOR + PLAT + 0.016 - A_R.y + 0.051 * Math.cos(TH) + 0.100 * Math.sin(TH);       // how far she is lifted (about 0.052)
    const cT = Math.cos(TH), sT = Math.sin(TH);
    const A_P = { y: A_R.y + HEEL, z: A_R.z };
    const T_P = { y: A_P.y + (T_R.y - A_R.y) * cT - (T_R.z - A_R.z) * sT, z: A_P.z + (T_R.y - A_R.y) * sT + (T_R.z - A_R.z) * cT };
    const DZ = -0.012;                                        // M1's outline, lowered by the thinner sole
    const KTOP_R = 0.495, KTOP = KTOP_R + HEEL;              // the shaft's top: just below her knee (rest; posed)
    const sdBox = (px, py, pz, bx, by, bz, r) => { const qx = Math.abs(px) - bx + r, qy = Math.abs(py) - by + r, qz = Math.abs(pz) - bz + r;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r; };
    const BOOT = {};
    let gL = null;                                           // the left boot's surface, mirrored for the right (she is symmetric): half the work
    for (const [S, s] of [['L', 1], ['R', -1]]) {
      const tout = 0.08, du = [s * Math.sin(tout), Math.cos(tout)];
      const O = [s * 0.080, -0.073];
      const loc = (x, z) => { const px = x - O[0], pz = z - O[1]; return [px * du[0] + pz * du[1], s * (px * du[1] - pz * du[0])]; };
      const ySole = (u) => lerp(FLOOR + HS, FLOOR + PLAT, sm(0.010, 0.128, u));
      const yBot = (u) => lerp(FLOOR + 0.048, FLOOR, sm(0.036, 0.110, u));
      const U_TIP = 0.214;
      const halfW = (u) => { const base = lerp(0.034, 0.0430, sm(0.03, 0.125, u)), tip = u > 0.120 ? Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.120) / (U_TIP - 0.120), 3.0))) : 1, back = u < 0.0 ? Math.sqrt(Math.max(0, 1 - Math.pow(u / -0.026, 2))) : 1; return base * tip * back; };
      const vMid = (u) => -0.003 * sm(0.06, 0.16, u);
      const TOPU = 0.300;
      const PROF = [[-0.024, 0.122 + DZ], [-0.0255, 0.140 + DZ], [-0.0215, 0.160 + DZ], [-0.010, 0.184 + DZ], [0.003, 0.208 + DZ], [0.009, 0.230 + DZ], [0.0105, TOPU],
        [0.1035, TOPU], [0.1045, 0.226 + DZ], [0.1095, 0.202 + DZ], [0.126, 0.175 + DZ], [0.148, 0.146 + DZ], [0.170, 0.121 + DZ], [0.188, 0.1065 + DZ], [0.203, 0.0965 + DZ],
        [0.2125, 0.084 + DZ], [0.2150, 0.070 + DZ], [0.2125, 0.058 + DZ]];
      for (let k = 0; k <= 12; k++) { const u = lerp(0.205, -0.020, k / 12); PROF.push([u, ySole(u) - 0.003]); }
      const prof2 = (u, y) => { let d = 9, inside = false;
        for (let k = 0, n = PROF.length; k < n; k++) { const a = PROF[k], b = PROF[(k + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], L2 = ex * ex + ey * ey;
          const t = cl(((u - a[0]) * ex + (y - a[1]) * ey) / L2, 0, 1); d = Math.min(d, Math.hypot(u - a[0] - ex * t, y - a[1] - ey * t));
          if ((a[1] > y) !== (b[1] > y) && u < a[0] + (y - a[1]) / ey * ex) inside = !inside; }
        return inside ? -d : d; };
      const hwAt = (u, y) => lerp(halfW(Math.min(u, 0.15)) * (u > 0.15 ? lerp(1, 0.93, sm(0.15, 0.21, u)) : 1), 0.0372, sm(0.125 + DZ, 0.225 + DZ, y));
      const Gfoot = (x, y, z) => {
        const [u, v] = loc(x, z), ys = ySole(u);
        { const ob = Math.max(Math.abs(v) - 0.050, -0.032 - u, u - 0.222); if (ob > 0.012) return ob; }
        const hw = hwAt(u, y), vm = v - vMid(u) * (1 - sm(0.12 + DZ, 0.16 + DZ, y)), q2 = Math.min(1.4, Math.pow(vm / hw, 2));
        const duu = q2 * 0.017 * (2 * sm(0.03, 0.09, u) - 1), dy = q2 * 0.026 * sm(0.235 + DZ, 0.150 + DZ, y) * sm(0.08, 0.14, u);
        const r = 0.008, dp = prof2(u + duu, y + dy), dv = Math.abs(vm) - hw, qx = dp + r, qy = dv + r;
        const up = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
        const hwS = Math.max(halfW(u), 1e-4) + 0.0028;
        const sole = smax(smax(Math.abs(v - vMid(u)) - hwS, Math.max(u - U_TIP - 0.0030, 0.030 - u), 0.004), Math.max(yBot(u) - y, y - (ys + 0.004)), 0.0022);
        const tp = 0.86 + 0.14 * cl((y - FLOOR) / HS, 0, 1);                                    // the block heel narrows a little to the floor
        const hb = sdBox(u - 0.0040, y - (FLOOR + HS / 2), v, 0.0270 * tp, HS / 2, 0.0225 * tp, 0.0025);
        return Math.min(smin(up, sole, 0.004), hb);
      };
      // the shaft: her leg (lifted) swollen a little, looser toward its top; open at the top (the cut through her leg is dropped)
      const shaft = (x, y, z) => { const yr = y - HEEL; return smax(DOLL.fLegOnly(s, x, yr, z) - (0.0048 + 0.0030 * sm(0.30, 0.48, yr)), Math.max(0.24 - y, y - KTOP), 0.003); };
      const xc = s * 0.081;
      const G = (x, y, z) => {
        if (y > 0.31) return shaft(x, y, z);
        const gf = Gfoot(x, y, z); if (y < 0.255) return gf;
        return lerp(gf, shaft(x, y, z), sm(0.262, 0.298, y));
      };
      // posed -> rest, through the shin (lifted), the foot (lifted and tipped) and the toes (lying flat)
      const toRest = (x, y, z) => {
        const wS = sm(A_P.y + 0.006, A_P.y + 0.050, y), wT = (1 - wS) * sm(T_P.z - 0.012, T_P.z + 0.018, z), wF = 1 - wS - wT;
        const Mi = (ry, rz) => [wS * (ry + HEEL) + wF * (A_P.y + (ry - A_R.y) * cT - (rz - A_R.z) * sT) + wT * (ry - T_R.y + T_P.y),
          wS * rz + wF * (A_P.z + (ry - A_R.y) * sT + (rz - A_R.z) * cT) + wT * (rz - T_R.z + T_P.z)];
        let ry = wS * (y - HEEL) + wF * (A_R.y + (y - A_P.y) * cT + (z - A_P.z) * sT) + wT * (y - T_P.y + T_R.y), rz = wS * z + wF * (A_R.z - (y - A_P.y) * sT + (z - A_P.z) * cT) + wT * (z - T_P.z + T_R.z);
        for (let it = 0; it < 6; it++) { const q = Mi(ry, rz); ry += y - q[0]; rz += z - q[1]; }
        let w = [BI['shin' + S], wS, BI['foot' + S], wF, BI['toe' + S], wT];
        if (ry > 0.20) w = W.mixW(w, W.wBody(x, ry, z), sm(0.20, 0.30, ry));
        return { p: [x, ry, rz], w };
      };
      const box = [xc - 0.075, xc + 0.075, FLOOR - 0.004, KTOP + 0.004, -0.112, 0.160];
      let g;
      if (!gL) g = gL = W.snets(G, box, 0.0053);
      else { const P2 = Float32Array.from(gL.pos), T2 = Array.from(gL.tris); for (let v = 0; v < gL.nv; v++) P2[v * 3] = -P2[v * 3];
        for (let t = 0; t < T2.length; t += 3) { const q = T2[t + 1]; T2[t + 1] = T2[t + 2]; T2[t + 2] = q; } g = { pos: P2, tris: T2, nv: gL.nv }; }
     
      const pos = new Float32Array(g.pos.length), Wt = [], inside = new Uint8Array(g.nv);
      for (let v = 0; v < g.nv; v++) { const r = toRest(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]); pos.set(r.p, v * 3); Wt.push(r.w);
        if (r.p[1] > 0.28 && DOLL.fLegOnly(s, r.p[0], r.p[1], r.p[2]) < -0.0012) inside[v] = 1; }
      const idx = []; for (let t = 0; t < g.tris.length; t += 3) { const a = g.tris[t], b = g.tris[t + 1], c = g.tris[t + 2]; if (inside[a] && inside[b] && inside[c]) continue; idx.push(a, b, c); }
      const bp = W.part('x2Boot' + S, { pos, idx }, (x, y, z, i) => Wt[i], { mat: BOOTLEATHER });
      const contact = []; for (let v = 0; v < g.nv; v++) if (g.pos[v * 3 + 1] < FLOOR + 0.010) contact.push(v);
      const step = Math.max(1, Math.ceil(contact.length / 48));
      BOOT[S] = { mesh: bp.mesh, contact: contact.filter((v, k) => k % step === 0) };
    }
    // ======================= the circlet and the horns =======================
    // The circlet lies on her hair in a plane through a point high over her forehead (1.612) and one low under the bun (1.487), tipped
    // about 39 degrees; the horns stand on it over her temples, curving up and out, then in and back to their tips.
    // The bun's outer surface (hair_bun.js: its cap, locks and bun) in the circlet's plane, measured from the plane's middle PC by angle
    // round it (0 toward the front, 5-degree steps to the back; the same on both sides): read off the bun on the doll, both sides' larger.
    const HAIR_R = [0.0996, 0.0996, 0.0996, 0.0996, 0.0990, 0.0970, 0.0946, 0.0920, 0.0885, 0.0868, 0.0860, 0.0850, 0.0863, 0.0887, 0.0895, 0.0895, 0.0895, 0.0888, 0.0874,
      0.0867, 0.0863, 0.0851, 0.0819, 0.0785, 0.0771, 0.0766, 0.0779, 0.0820, 0.0847, 0.0853, 0.0862, 0.0876, 0.0889, 0.0894, 0.0894, 0.0894, 0.0894];
    const hairR = (ps) => { const a = Math.abs(Math.atan2(Math.sin(ps), Math.cos(ps))) / (PI / 36), i = Math.min(35, Math.floor(a)), u = a - i; return lerp(HAIR_R[i], HAIR_R[i + 1], u); };
    const BF = [0, 1.612, 0.055], BB = [0, 1.487, -0.100], PC = [(BF[0] + BB[0]) / 2, (BF[1] + BB[1]) / 2, (BF[2] + BB[2]) / 2], E2 = norm(sub(BF, BB)), E1 = [1, 0, 0], NP = norm(cross(E1, E2));
    const bandPt = (ps) => { const d = add([0, 0, 0], E2, Math.cos(ps)); d[0] += Math.sin(ps); const dn = norm(d); return { p: add(PC, dn, hairR(ps) - 0.0012), n: dn }; };
    const HEAD = W.wBone('head');
    {
      const NB2 = 120, rings = [];
      for (let k = 0; k < NB2; k++) { const q = bandPt((k / NB2) * TAU), ring = [], HW = 0.0050, HT = 0.0013;
        for (let j = 0; j < 8; j++) { const ph = (j / 8) * TAU, cx = Math.sign(Math.cos(ph)) * Math.pow(Math.abs(Math.cos(ph)), 0.4), cy = Math.sign(Math.sin(ph)) * Math.pow(Math.abs(Math.sin(ph)), 0.4);
          ring.push(add(add(q.p, NP, cx * HW), q.n, HT + cy * HT)); }
        rings.push(ring); }
      rings.push(rings[0]);
      const g = faceOut(W.loft(rings, {}), (p) => { const d = sub(p, PC), e = dot(d, NP); return add(PC, sub(d, [NP[0] * e, NP[1] * e, NP[2] * e]), 0.6); });
      W.part('x2Headband', g, () => HEAD, { mat: GOLD });
    }
    {
      const horns = [];
      for (const s of [-1, 1]) {
        let best = null; for (let k = 0; k < 90; k++) { const ps = s * (k / 90) * PI / 2, q = bandPt(ps); if (!best || Math.abs(q.p[0] - s * 0.058) < Math.abs(best.p[0] - s * 0.058)) best = q; }
        const P0 = add(best.p, best.n, -0.005), P1 = [s * 0.097, 1.636, best.p[2] - 0.012], P2 = [s * 0.069, 1.664, best.p[2] - 0.048];
        const P = [], NH = 30;
        for (let i = 0; i <= NH; i++) { const t = i / NH, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t, p = [a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1], a * P0[2] + b * P1[2] + c * P2[2]];
          const r = 0.0130 * Math.pow(1 - t, 0.85) + 0.0007, rg = 1 + 0.05 * Math.pow(Math.abs(Math.sin(t * 13 * PI)), 3) * (1 - t);
          P.push({ p, n: [0, 0, 1], r: r * rg }); }
        horns.push(tube(P, 14));
      }
      W.part('x2Horns', merge(horns), () => HEAD, { mat: HORN });
    }
    // ======================= her legs keep out of the skirt (wardrobe/D1.js) =======================
    // The skirt's chains are pushed out past her legs, level by level down the chains; each chain goes at least most of the way its
    // neighbours go, so the cloth between two chains cannot cut a corner through a knee.
    const legPush = () => {
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), PAD = 0.085, NC = CH.length, NL = CH[0].names.length;
      const tipOff = CH.map((c) => c.names.map((nm, k) => new T3.Vector3().subVectors(c.pts[k + 1], c.pts[k])));
      const A = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), V = new T3.Vector3(), M = new T3.Vector3();
      const pq = new T3.Quaternion(), legs = [];
      for (const S of ['R', 'L']) legs.push([new T3.Vector3(), new T3.Vector3(), 0.080, 0.060, 'thigh' + S, 'shin' + S], [new T3.Vector3(), new T3.Vector3(), 0.060, 0.050, 'shin' + S, 'foot' + S]);
      const restOf = (p) => { const out = []; for (const L of legs) { const a = W.SK[L[4]].userData.rest, b = W.SK[L[5]].userData.rest;
        for (let j = 0; j <= 5; j++) out.push(V.copy(a).lerp(b, j / 5).distanceTo(p)); } return out; };
      const restT = CH.map((c) => c.names.map((nm, k) => restOf(c.pts[k + 1])));
      const restM = CH.map((c) => c.names.map((nm, k) => restOf(M.copy(c.pts[k]).add(c.pts[k + 1]).multiplyScalar(0.5))));
      const push = (p, RD, out) => {
        E.set(p.x - Hc.x, 0, p.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return false; E.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0;
        legs.forEach((L, li) => { for (let k = 0; k <= 5; k++) { const t = k / 5; V.copy(L[0]).lerp(L[1], t); const R = Math.min(L[2] + (L[3] - L[2]) * t + PAD, RD[li * 6 + k] - 0.004);
          const vx = p.x - V.x, vy = p.y - V.y, vz = p.z - V.z, cc = vx * vx + vy * vy + vz * vz - R * R; if (cc >= 0) continue;
          const b1 = vx * E.x + vz * E.z, q1 = b1 * b1 - cc; if (q1 > 0) sOut = Math.max(sOut, -b1 + Math.sqrt(q1)); const q2 = vy * vy - cc; if (q2 > 0) sUp = Math.max(sUp, -vy + Math.sqrt(q2)); } });
        if (sOut <= 1e-4 && sUp <= 1e-4) return false;
        if (sUp < sOut) out.set(0, sUp, 0); else out.copy(E).multiplyScalar(sOut); return true;
      };
      const P = CH.map(() => new T3.Vector3()), Tp = CH.map(() => new T3.Vector3()), Q = CH.map(() => new T3.Quaternion()), ANG = new Float32Array(NC), dm = new T3.Vector3();
      const DIR0 = CH.map((c) => c.names.map(() => new T3.Vector3())), dT = new T3.Vector3(), dM = new T3.Vector3(), cur = new T3.Vector3(), qa = new T3.Quaternion();
      const turn = (b, qw) => { b.parent.getWorldQuaternion(pq); b.quaternion.premultiply(pq.clone().invert().multiply(qw).multiply(pq)); b.updateMatrixWorld(true); };
      const tipOf = (ci, k, b, out) => out.copy(tipOff[ci][k]).applyMatrix4(b.matrixWorld).sub(A.setFromMatrixPosition(b.matrixWorld)).add(b.getWorldPosition(V));
      return (SK) => {
        for (const L of legs) { SK[L[4]].getWorldPosition(L[0]); SK[L[5]].getWorldPosition(L[1]); }
        SK.hips.getWorldPosition(Hc);
        for (let ci = 0; ci < NC; ci++) for (let k = 0; k < NL; k++) { const b = SK[CH[ci].names[k]]; b.getWorldPosition(M); tipOf(ci, k, b, DIR0[ci][k]).sub(M).normalize(); }
        for (let k = 0; k < NL; k++) {
          for (let ci = 0; ci < NC; ci++) {
            const b = SK[CH[ci].names[k]];
            if (k > 0) { b.getWorldPosition(P[ci]); cur.copy(tipOf(ci, k, b, Tp[ci])).sub(P[ci]).normalize(); if (cur.dot(DIR0[ci][k]) < 0.99999) turn(b, qa.setFromUnitVectors(cur, DIR0[ci][k])); }
            b.getWorldPosition(P[ci]); tipOf(ci, k, b, Tp[ci]); cur.copy(Tp[ci]).sub(P[ci]); const len = cur.length(); cur.multiplyScalar(1 / len);
            ANG[ci] = 0; Q[ci].identity(); let best = 0;
            if (push(Tp[ci], restT[ci][k], dm)) { dT.copy(Tp[ci]).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dT), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dT); } }
            M.copy(P[ci]).add(Tp[ci]).multiplyScalar(0.5);
            if (push(M, restM[ci][k], dm)) { dM.copy(M).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dM), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dM); } }
            ANG[ci] = best;
          }
          for (let ci = 0; ci < NC; ci++) {
            let qq = Q[ci], a0 = ANG[ci];
            for (const cj of [(ci + 1) % NC, (ci + NC - 1) % NC]) if (ANG[cj] * 0.6 > a0) { a0 = ANG[cj] * 0.6; qq = new T3.Quaternion().slerp(Q[cj], 0.6); }
            if (a0 > 1e-4) turn(SK[CH[ci].names[k]], qq === Q[ci] ? Q[ci] : qq);
          }
        }
      };
    };

    // ======================= standing in heels: lift her, tip her feet, keep her forefeet flat (wardrobe/M1.js) =======================
    const AXX = new THREE.Vector3(1, 0, 0), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), vk = new THREE.Vector3(), mInv = new THREE.Matrix4();
    const fwd = new THREE.Vector3(), qw = new THREE.Quaternion(), qr = new THREE.Quaternion();
    const _H = new THREE.Vector3(), _K = new THREE.Vector3(), _A = new THREE.Vector3(), _T = new THREE.Vector3(), _d = new THREE.Vector3(), _p = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qf = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _up = new THREE.Vector3();
    function rotBone(b, from, to) { _q1.setFromUnitVectors(from.clone().normalize(), to.clone().normalize()); b.parent.getWorldQuaternion(_qp); b.getWorldQuaternion(_q2); b.quaternion.copy(_qp.clone().invert().multiply(_q1).multiply(_q2)); b.updateMatrixWorld(true); }
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
    let done = null;
    W.onFrame((SK) => {
      if (done && SK.hips.position.y === done.y && SK.footR.quaternion.equals(done.qR) && SK.footL.quaternion.equals(done.qL)) return;     // a held pose: not twice
      const root = SK.hips.parent; root.updateMatrixWorld(true); mInv.copy(root.matrixWorld).invert(); root.getWorldQuaternion(qr).invert();
      let kneeLo = 9; for (const S of ['R', 'L']) { SK['shin' + S].getWorldPosition(vk).applyMatrix4(mInv); kneeLo = Math.min(kneeLo, vk.y); }
      const kn = sm(0.30, 0.15, kneeLo);
      SK.hips.position.y += HEEL * (1 - kn);
      for (const S of ['R', 'L']) {
        SK['foot' + S].getWorldQuaternion(qw); qw.premultiply(qr); fwd.set(0, 0, 1).applyQuaternion(qw);
        const already = -Math.asin(cl(fwd.y, -1, 1)), th = TH * (1 - sm(0.25, 0.9, already));
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
    { const lp = legPush(); W.onFrame((SK) => lp(SK)); }

    // ======================= paint corrections =======================
    W.afterPaint((parts) => {
      const copy = (mesh, pairs) => { for (const key of ['aPP', 'aPN', 'aPE']) { const at = mesh.geometry.attributes[key]; if (!at) continue; const A = at.array;
        for (const [i, j] of pairs) { A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; } at.needsUpdate = true; } };
      for (const p of parts) {
        const g = p.mesh.geometry, P = g.attributes.position.array, PP = g.attributes.aPP, PE = g.attributes.aPE;
        if (!PP) continue;
        if (p.key === 'x2Skirt') {
          // the turned-up hem and the slit's turned-back edges take the cloth just outside them
          const R = skirtInfo.rows, C = skirtInfo.cols, pairs = [];
          for (let r = R - 3; r < R; r++) for (let c = 0; c < C; c++) pairs.push([r * C + c, (R - 5) * C + c]);
          for (let r = 0; r < R; r++) { pairs.push([r * C, r * C + 3], [r * C + 1, r * C + 3], [r * C + C - 1, r * C + C - 4], [r * C + C - 2, r * C + C - 4]); }
          copy(p.mesh, pairs);
          // under the belt and its points: read the painting a little lower (the painted belt sits a centimetre lower than hers)
          for (let i = 0; i < PP.count; i++) { const y = P[i * 3 + 1]; if (y > 1.000) PP.array[i * 3 + 1] = Math.min(PP.array[i * 3 + 1], 1.000 - 0.3 * (y - 1.000)); }
          PP.needsUpdate = true;
        }
        // the skirt's pieces read the paintings inside their painted outline (outside it the paintings hold only a coarse fill)
        if (p.key === 'x2Skirt' || p.key === 'x2Basque') {
          // her skirt is wider than the painted one near the top (her hips are wider than the painted figure's): each point reads the
          // paintings at its place squeezed in proportion, so the painted pattern is spread over her skirt rather than cut off at its edge
          for (let i = 0; i < PP.count; i++) { const y = PP.array[i * 3 + 1], Y = P[i * 3 + 1], v = cprof(FLc, cl(y, 0.06, 1.05));
            const wM = envR(Y, PI / 2) + 0.006, fM = envR(Y, 0) + 0.006, bM = envR(Y, PI) + 0.006, x = PP.array[i * 3], z = PP.array[i * 3 + 2] - SKC;
            const sq = (h, M, Tt) => { const ah = Math.abs(h), h0 = 0.75 * Tt; if (M <= Tt || ah <= h0) return h; return Math.sign(h) * (h0 + (Math.min(ah, M) - h0) * (Tt - h0) / (M - h0)); };   // the middle as painted
            PP.array[i * 3] = sq(x, wM, v[0] - 0.018);
            PP.array[i * 3 + 2] = SKC + (z > 0 ? sq(z, fM, v[1] - SKC - 0.018) : sq(z, bM, SKC - v[2] - 0.018)); }
          if (p.key === 'x2Skirt') {
            // at the back, beside the painted tail: read the cloth just beside it (the tail is a piece of its own and swings)
            for (let i = 0; i < PP.count; i++) { const x = PP.array[i * 3], y = PP.array[i * 3 + 1], z = PP.array[i * 3 + 2]; if (z > SKC - 0.05 || y < 0.40 || y > 1.02) continue;
              const d = x - cprof(TAILX, y)[0], hw = 0.020 * sm(0.40, 0.46, y); if (Math.abs(d) < hw) PP.array[i * 3] += (d < 0 ? -1 : 1) * (hw - Math.abs(d)); }
          }
          PP.needsUpdate = true;
        }
        if (p.key === 'x2Basque') { for (let i = 0; i < PP.count; i++) { const y = P[i * 3 + 1]; if (y > BELT0 - 0.012) PP.array[i * 3 + 1] = Math.min(PP.array[i * 3 + 1], BELT0 - 0.012 - 0.3 * (y - BELT0 + 0.012)); } PP.needsUpdate = true; }
        if (p.key === 'x2Bodice') { for (let i = 0; i < PP.count; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], e = y - (topB(x, z) - 0.007); if (e > 0) PP.array[i * 3 + 1] -= e; } PP.needsUpdate = true; }
        if (p.key === 'x2Bodice') { for (let i = 0; i < PP.count; i++) { const y = P[i * 3 + 1]; if (y < BELT1 + 0.010) PP.array[i * 3 + 1] = Math.max(PP.array[i * 3 + 1], BELT1 + 0.010 + 0.3 * (BELT1 + 0.010 - y)); } PP.needsUpdate = true; }
        // the side painting: her arm and glove hang over the skirt's side and the bodice's; there the side view is not read
        if (p.key === 'x2Skirt' || p.key === 'x2Bodice' || p.key === 'x2Basque') {
          // (her own arms hang well clear of the cloth in the paintings' pose, so the side view's visibility is set here, smoothly)
          // where her arm hangs over the cloth in the side painting, the side view is not read; the skirt and its points are open to
          // the front and back views everywhere (her arms hang clear of them in the paintings), so no edge of a hidden patch shows
          const open = p.key !== 'x2Bodice';
          for (let i = 0; i < PP.count; i++) { const y = PP.array[i * 3 + 1], z = PP.array[i * 3 + 2], k = sm(0.69, 0.75, y) * sm(1.24, 1.19, y) * (open ? 1 : sm(0.095, 0.070, z) * sm(-0.155, -0.130, z));
            if (open) { PE.array[i * 3] = 1; PE.array[i * 3 + 1] = 1; PE.array[i * 3 + 2] = 1 - k; } else PE.array[i * 3 + 2] *= 1 - k; }
          PE.needsUpdate = true;
        }
      }
    });
    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'toenail', 'dollFoot']);
    // (each rule added makes her skin be worked out again with every rule so far: the small arm rule first, then trunk and legs in one)
    W.hideSkin((x, y, z) => { const S = x < 0 ? 'R' : 'L', f = W.armFrame(S, x, y, z); return f.sl > 0.205 && f.sl < GL_END + 0.02; }, ['arm']);
    // her trunk from under the bodice down, and her legs except the boots' feet (hidden with her feet) and, on her left, the 1.5 cm just
    // above the boot that fills its top where the slit could show it; her trunk and legs meet under the skirt, so one rule serves both
    W.hideSkin((x, y, z) => (y > WAIST_B + 0.012 && y < topB(x, z) - 0.022) || (y < WAIST_B + 0.014 && (y > 0.511 || (x < 0 && y > 0.45) || y < KTOP_R - 0.012)), ['dollTrunk', 'dollLeg']);
    W.X2 = { HEEL, TH };
  },
};
