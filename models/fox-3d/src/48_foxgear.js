  // ---------- her belt, pouch, sheath and shears (shapes and leather: F7, G1, G3; how they are worn: A1, A2, G4 and the standing painting) ----------
  // Everything here is measured in the painting it comes from and turned into her size by one number each:
  //   belt   F7, 69 px across = 2.8 cm        pouch  F7, 342 px across = 11 cm
  //   sheath G3, 535 px long = 22.8 cm        shears G1, 1310 px long = 26 cm
  // The leather is the paintings themselves (bake_gear_fox.py): each face of each piece is looked at straight on and given the painting of that face.
  const FOXGEAR = {};
  (function foxGear() {
    const onHip = FOXHIP.onHip, legAt = FOXHIP.legAt, ZC = FOXHIP.ZC, GL = (BAKED && BAKED.gearLayout) || null;
    // a spot on a painting -> the same spot on the baked picture
    const guv = (name, sx, sy) => {
      if (!GL) return [0.5, 0.5];
      const s = GL[name].s, d = GL[name].d, fx = cl((sx - s[0]) / (s[2] - s[0]), 0.006, 0.994), fy = cl((sy - s[1]) / (s[3] - s[1]), 0.006, 0.994);
      return [(d[0] + fx * (d[2] - d[0])) / 1024, 1 - (d[1] + fy * (d[3] - d[1])) / 1024];
    };
    // a sheet of points: fn(u, v) -> [x, y, z, U, V], with u and v running from 0 to 1
    const sheet = (nu, nv, fn) => {
      const pos = [], uv = [], idx = [];
      for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const q = fn(i / nu, j / nv); pos.push(q[0], q[1], q[2]); uv.push(q[3], q[4]); }
      for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
      return { pos, uv, idx };
    };
    // rings of points with their own picture coordinates, joined into a tube (give each ring its first point again at the end)
    const ringLoft = (rings, uvs) => {
      const m = rings.length, n = rings[0].length, pos = [], uv = [], idx = [];
      for (let i = 0; i < m; i++) for (let k = 0; k < n; k++) { pos.push(rings[i][k][0], rings[i][k][1], rings[i][k][2]); uv.push(uvs[i][k][0], uvs[i][k][1]); }
      for (let i = 0; i < m - 1; i++) for (let k = 0; k < n - 1; k++) { const a = i * n + k, b = a + 1, c = a + n, d = c + 1; idx.push(a, c, b, b, c, d); }
      return { pos, uv, idx };
    };
    // a piece's own space: where its origin is and which way its across, up and outward run
    const frame = (O, X, Y, Z) => (x, y, z) => [O.x + X.x * x + Y.x * y + Z.x * z, O.y + X.y * x + Y.y * y + Z.y * z, O.z + X.z * x + Y.z * y + Z.z * z];
    const frameOn = (top, bot, nrm) => { const Y = top.clone().sub(bot).normalize(), X = V3().crossVectors(Y, nrm).normalize(), Z = V3().crossVectors(X, Y).normalize(); return { O: top, X, Y, Z, at: frame(top, X, Y, Z) }; };
    // a sheet given thickness: its face, its back (th behind, in the piece's own space) and the edge between
    const slab = (F, nu, nv, fn, th, buv) => {
      const fr = sheet(nu, nv, (u, v) => { const q = fn(u, v), w = F(q[0], q[1], q[2]); return [w[0], w[1], w[2], q[3], q[4]]; });
      const bk = sheet(nu, nv, (u, v) => { const q = fn(u, v), w = F(q[0], q[1], q[2] - th), t = buv ? buv(u, v, q) : [q[3], q[4]]; return [w[0], w[1], w[2], t[0], t[1]]; });
      const B = []; for (let i = 0; i <= nu; i++) B.push([i / nu, 0]); for (let j = 1; j <= nv; j++) B.push([1, j / nv]); for (let i = nu - 1; i >= 0; i--) B.push([i / nu, 1]); for (let j = nv - 1; j >= 1; j--) B.push([0, j / nv]);
      const ed = sheet(B.length, 1, (u, v) => { const k = Math.round(u * B.length) % B.length, q = fn(B[k][0], B[k][1]), w = F(q[0], q[1], q[2] - th * v); return [w[0], w[1], w[2], q[3], q[4]]; });
      return [fr, bk, ed];
    };
    const put = (key, parts, wf, out) => { for (const p of (Array.isArray(parts) ? parts : [parts])) addPart(key, p, wf, { out: Array.isArray(out) ? V3(out[0], out[1], out[2]) : out }); };
    const wHips = [BI.hips, 1], wH = () => wHips;
    const dome = (c, r, h, key, wf) => { const q = Array.isArray(c) ? V3(c[0], c[1], c[2]) : c; addPart(key || 'brass', spherePart(q, r, r, r, Q(12, 8), Q(8, 6)), wf || wH, { out: q }); };      // a stud; flattened afterwards by its caller where it matters
    const plainUV = (u, v) => guv('plain', 1074 + 112 * u, 644 + 212 * v);

    // ================= the belt =================
    // Worn loose: level round her back at her waist, sagging across the front from her right hip down to the pouch on her left (A1: 12 cm of drop),
    // then climbing steeply behind the pouch back up to her waist at her left side.
    const BW = 0.0268, BT = 0.0042, KB = BW / 69, AB = 0.24;      // width, thickness, metres to one F7 pixel, and where the buckle sits (a little to her left of the middle)
    const beltY = (a) => { const w = sm(-0.25, 0.35, Math.cos(a)); return w * (0.9395 - 0.43 * 0.18 * Math.sin(a)) + (1 - w) * 0.985; };
    const beltP = (a, out) => onHip(a, beltY(a), out);
    const UP = V3(0, 1, 0), hipN = (a, y) => onHip(a + 0.01, y, 0).sub(onHip(a - 0.01, y, 0)).cross(UP).normalize();      // which way her hip faces at that spot
    const beltF = (a, out) => { const p = beltP(a, out), T = beltP(a + 0.012, out).sub(beltP(a - 0.012, out)).normalize(), n0 = V3().crossVectors(T, UP).normalize(), B = V3().crossVectors(n0, T).normalize(), N = V3().crossVectors(T, B).normalize(); return { p, T, B, N }; };
    const PROF = [[-0.93, 1, 0.04], [0.93, 1, 0.96], [1, 0.6, 0.99], [1, -0.6, 1], [0.93, -1, 0.96], [-0.93, -1, 0.04], [-1, -0.6, 0], [-1, 0.6, 0.01], [-0.93, 1, 0.04]];      // across, through, and where across the leather's picture
    const strap = (a0, a1, n, out, hw, ht, uvf) => {
      const rings = [], uvs = []; let s = 0, prev = null;
      for (let i = 0; i <= n; i++) {
        const a = lerp(a0, a1, i / n), f = beltF(a, typeof out === 'function' ? out(i / n) : out); if (prev) s += f.p.distanceTo(prev); prev = f.p;
        rings.push(PROF.map((q) => [f.p.x + f.B.x * q[0] * hw + f.N.x * q[1] * ht, f.p.y + f.B.y * q[0] * hw + f.N.y * q[1] * ht, f.p.z + f.B.z * q[0] * hw + f.N.z * q[1] * ht]));
        uvs.push(PROF.map((q) => uvf(s, q[2], i / n)));
      }
      return ringLoft(rings, uvs);
    };
    const O0 = BT / 2 + 0.0018;                      // how far the belt's middle stands off her trousers
    put('beltm', strap(AB, AB + TAU, Q(180, 96), O0, BW / 2, BT / 2, (s, v) => [s / 0.0458, v]), wH, V3(0, 0.95, 0.02));
    // its holed tail, through the buckle and on toward the pouch, lying on top of the belt (F7's own tail, holes and all)
    put('gear', strap(AB - 0.02, AB + 0.74, Q(44, 24), (t) => O0 + BT * 1.05 + 0.0030 * Math.sin(Math.min(1, t * 6) * PI / 2), BW / 2, BT / 2, (s, v) => guv('tail', 1146 + s / KB, 139 + (1 - v) * 78)), wH, V3(0, 0.95, 0.02));
    // the keeper, a band of leather round both layers
    put('gear', strap(AB + 0.37, AB + 0.43, 4, O0 + BT * 0.55, BW / 2 + 0.0030, BT * 1.75, (s, v, t) => plainUV(v, t * 0.3)), wH, V3(0, 0.95, 0.02));
    // brass studs, 4 cm apart, from the buckle round her right side and her back
    { let a = AB - 0.20, s = 0, prev = beltP(a, O0);
      while (a > AB - TAU + 1.45) { a -= 0.004; const p = beltP(a, O0); s += p.distanceTo(prev); prev = p; if (s >= 0.040) { s = 0; const f = beltF(a, O0 + BT / 2 + 0.0006); dome(f.p, 0.0034); } } }
    // the buckle: a brass frame standing on the belt, its bar toward her left, its prong lying back across the tail
    { const f = beltF(AB, O0 + BT * 1.6 + 0.0026), pts = [], NPB = Q(40, 24);
      for (let i = 0; i <= NPB; i++) { const th = (i / NPB) * TAU, c = Math.cos(th), sn = Math.sin(th), t = 0.0005 + 0.0240 * Math.sign(c) * Math.pow(Math.abs(c), 0.62), b = 0.0218 * Math.sign(sn) * Math.pow(Math.abs(sn), 0.52); pts.push(f.p.clone().addScaledVector(f.T, t).addScaledVector(f.B, b)); }
      addPart('brass', loft(tubeRings(pts, pts.map(() => 0.0036), Q(10, 7), f.N)), wH, { out: f.p });
      const pr = []; for (let i = 0; i <= 8; i++) { const t = lerp(0.0240, -0.0255, i / 8); pr.push(f.p.clone().addScaledVector(f.T, t).addScaledVector(f.N, 0.0012 + 0.0016 * Math.sin((i / 8) * PI))); }
      addPart('brass', loft(tubeRings(pr, pr.map((q, i) => 0.0019 - 0.0006 * (i / 8)), Q(8, 6), f.B), { capA: true, capB: true }), wH, { out: f.p.clone().addScaledVector(f.N, -0.01) }); }
    FOXGEAR.belt = { beltY, beltP, AB };

    // ================= the pouch (F7), on the sag of the belt at her left hip =================
    { const AP = 0.92, W = 0.111, KP = W / 342, H = 447 * KP, RC = 70 * KP, DG = 0.034;       // angle round her hips, width, metres to one F7 pixel, height, corner radius, depth at the sides
      const top = onHip(AP, 0.939, BT + 0.0075), bot = onHip(AP, 0.939 - H, BT + 0.0075 + 0.016), nrm = hipN(AP, 0.87);
      const P = frameOn(top, bot, nrm), F = P.at, mid = V3(...F(0, -H / 2, DG / 2));
      const hwAt = (y) => { const yb = y + H; return yb >= RC ? W / 2 : W / 2 - RC + Math.sqrt(Math.max(0, RC * RC - (RC - yb) * (RC - yb))); };
      const dgAt = (y) => DG * (0.80 + 0.20 * sm(0, 0.03, y + H));                              // the sides are a little shallower round the bottom
      const zf = (x, y) => { const hw = hwAt(y), uu = cl(x / hw, -1, 1), v = cl(-y / H, 0, 1); return dgAt(y) + 0.0085 * (1 - uu * uu) * Math.pow(Math.sin(PI * (0.08 + 0.86 * v)), 0.7); };      // the face swells out between its edges
      const fuv = (x, y) => guv('pouchF', 318 + x / KP, 448 - y / KP);
      const NX = Q(18, 10), NY = Q(22, 12);
      // face, back and the strip of leather between them
      put('gear', sheet(NX, NY, (u, v) => { const y = -H * v, x = hwAt(y) * (2 * u - 1), w = F(x, y, zf(x, y)), t = fuv(x, y); return [w[0], w[1], w[2], t[0], t[1]]; }), wH, mid);
      put('gear', sheet(NX, NY, (u, v) => { const y = -H * v, x = hwAt(y) * (2 * u - 1), w = F(x, y, 0), t = guv('pouchB', 1222 - x / KP, 448 - y / KP); return [w[0], w[1], w[2], t[0], t[1]]; }), wH, mid);
      { const OUTL = [], NS = Q(14, 8), NA = Q(8, 5);                                            // the outline, from the top of her right-hand edge, round the bottom, up the other edge
        for (let i = 0; i <= NS; i++) OUTL.push([-W / 2, -(H - RC) * (i / NS), -1, 0]);
        for (let i = 1; i <= NA; i++) { const th = (i / NA) * PI / 2; OUTL.push([-W / 2 + RC - RC * Math.cos(th), -(H - RC) - RC * Math.sin(th), -Math.cos(th), -Math.sin(th)]); }
        for (let i = 1; i <= 4; i++) OUTL.push([lerp(-W / 2 + RC, W / 2 - RC, i / 4), -H, 0, -1]);
        for (let i = 1; i <= NA; i++) { const th = PI / 2 - (i / NA) * PI / 2; OUTL.push([W / 2 - RC + RC * Math.cos(th), -(H - RC) - RC * Math.sin(th), Math.cos(th), -Math.sin(th)]); }
        for (let i = 1; i <= NS; i++) OUTL.push([W / 2, -(H - RC) * (1 - i / NS), 1, 0]);
        put('gear', sheet(OUTL.length - 1, 4, (u, v) => { const o = OUTL[Math.round(u * (OUTL.length - 1))], dg = dgAt(o[1]), b = 0.0030 * Math.sin(PI * v), w = F(o[0] + o[2] * b, o[1] + o[3] * b, dg * v), t = guv('pouchS', 808 - (dg * v) / KP, Math.min(868, 452 - o[1] / KP)); return [w[0], w[1], w[2], t[0], t[1]]; }), wH, mid); }
      // the flap: over the top and down the face to its curved edge, standing a little proud, with its own thickness
      const FE = 0.0042, flapY = (uu) => -KP * (142 + 115 * Math.sqrt(Math.max(0, 1 - uu * uu))), FW = W / 2 + 0.0022;
      const flapPt = (u, v) => {                     // v: 0 at the back of the top, 0.22 at the front of the top, 1 at the flap's edge
        const uu = 2 * u - 1, x = FW * uu;
        if (v < 0.22) { const k = v / 0.22, zt = zf(x * 0.98, 0) + FE; return [x, 0.0010 + 0.0060 * Math.sin(PI * k * 0.5) * Math.cos(PI * k * 0.5) * 2 - 0.0002, lerp(-0.0012, zt, k), ...guv('pouchS', 808 - lerp(-0.001, zt, k) / KP, 454)]; }
        const k = (v - 0.22) / 0.78, y = flapY(uu) * k, xx = cl(x, -hwAt(y) * 1.0 - 0.0022, hwAt(y) + 0.0022);
        return [xx, y, zf(cl(xx, -hwAt(y), hwAt(y)), y) + FE * (1 - 0.25 * Math.pow(k, 6)), ...fuv(x, y)];
      };
      put('gear', slab(F, NX, Q(18, 10), flapPt, 0.0034, (u, v, q) => plainUV(u, v)), wH, V3(...F(0, -0.03, DG / 2)));
      // the strap down the middle of the face, and the brass snap that holds the flap
      put('gear', slab(F, 3, Q(10, 6), (u, v) => { const x = 28.5 * KP * (2 * u - 1), y = lerp(-232 * KP, -H + 0.0030, v); return [x, y, zf(x, y) + 0.0022, ...fuv(x, y)]; }, 0.0030), wH, V3(...F(0, -0.10, DG * 0.6)));
      { const y = -(665 - 448) * KP, c = V3(...F(0, y, zf(0, y) + FE + 0.0012)), part = spherePart(c, 0.0082, 0.0082, 0.0082, Q(14, 9), Q(9, 6));
        for (let i = 0; i < part.pos.length; i += 3) { const d = (part.pos[i] - c.x) * P.Z.x + (part.pos[i + 1] - c.y) * P.Z.y + (part.pos[i + 2] - c.z) * P.Z.z, sq = d * (0.42 - 1); part.pos[i] += P.Z.x * sq; part.pos[i + 1] += P.Z.y * sq; part.pos[i + 2] += P.Z.z * sq; }
        addPart('brass', part, wH, { out: c }); }
      // the loop it hangs by, standing up behind the flap with its stud, leaning in with her waist
      { const lean = (y) => 0.0030 - 0.16 * Math.max(0, y);
        put('gear', slab(F, 3, Q(8, 5), (u, v) => { const x = 45 * KP * (2 * u - 1), y = lerp(-0.012, 143 * KP, v); return [x, y, lean(y) + 0.0036, ...fuv(x, y)]; }, 0.0036, (u, v) => plainUV(u, v)), wH, V3(...F(0, 0.02, lean(0.02) + 0.0018)));
        const ys = (448 - 410) * KP, c = V3(...F(0, ys, lean(ys) + 0.0036 + 0.0008)); dome(c, 0.0042); }
      FOXGEAR.pouch = { F, W, H };
    }

    // ================= the sheath (G3) on her right hip, and her shears in it (G1) =================
    { const AS = -0.95, L = 0.218, KS = L / 535, HW = 76.5 * KS, DS = 0.0245;       // angle round her hips, length, metres to one G3 pixel, half the mouth's width, its depth at the mouth
      const M = onHip(AS, 0.935, 0.0100);            // the middle of the mouth's back edge
      // its tip rests on the upper flounce of her right leg, so it hangs a little outward, as in the standing painting
      const yT = 0.935 - L * 0.985, [cxo, rx, rz] = legAt(yT), g = 0.012 + 0.046 * (0.815 - yT) / 0.295 + 0.020, al = Math.atan2(M.x + cxo, M.z - ZC);
      const tip = V3(-cxo + (rx + g) * Math.sin(al), yT, ZC + (rz + g) * Math.cos(al)), nrm = hipN(AS, 0.90);
      const P = frameOn(M, tip, nrm), F = P.at;
      addBone('sheath', 'hips', M.x, M.y, M.z);
      const wS = [BI.sheath, 1], wSh = () => wS;
      const hwAt = (t) => HW * Math.pow(Math.max(0, 1 - t), 0.92) + 0.0012, dsAt = (t) => DS * Math.max(0, 1 - t) + 0.0030;
      const zfS = (uu, t) => dsAt(t) * Math.pow(Math.max(0, 1 - uu * uu), 0.55);
      const LIP = 24 * KS;                           // the front of the mouth dips this far in the middle
      const front = (inset) => (u, v) => { const uu = 2 * u - 1, t = v, x = hwAt(t) * uu, y = -L * t - LIP * (1 - uu * uu) * Math.pow(1 - t, 8), w = F(x, y, Math.max(0, zfS(uu, t) - inset)), q = guv('sheathF', 391.5 + x / KS, 448 - y / KS); return [w[0], w[1], w[2], q[0], q[1]]; };
      const NX = Q(14, 8), NY = Q(30, 16), midS = V3(...F(0, -L * 0.35, DS * 0.3));
      put('gear', sheet(NX, NY, front(0)), wSh, midS);
      put('gear', sheet(NX, NY, (u, v) => { const uu = 2 * u - 1, t = v, x = hwAt(t) * uu, y = -L * t, w = F(x, y, -0.0006), q = plainUV(u, v); return [w[0], w[1], w[2], q[0], q[1]]; }), wSh, midS);
      // its dark inside, seen through the mouth
      addPart('gearIn', sheet(NX, Q(8, 5), (u, v) => { const uu = 2 * u - 1, t = v * 0.30, x = hwAt(t) * uu * 0.97, y = -L * t - LIP * (1 - uu * uu) * Math.pow(1 - t, 8) - 0.0006, w = F(x, y, Math.max(0.0006, zfS(uu, t) - 0.0022)); return [w[0], w[1], w[2], 0.5, 0.5]; }), wSh, { out: V3(...F(0, -0.02, DS * 2)) });
      addPart('gearIn', sheet(NX, Q(8, 5), (u, v) => { const uu = 2 * u - 1, t = v * 0.30, x = hwAt(t) * uu * 0.97, w = F(x, -L * t + 0.0002, 0.0012); return [w[0], w[1], w[2], 0.5, 0.5]; }), wSh, { out: V3(...F(0, -0.02, -DS)) });
      // the two brass studs at the corners of the mouth
      for (const sx of [339, 444]) { const x = (sx - 391.5) * KS, y = -(496 - 448) * KS, t = -y / L; dome(F(x, y, zfS(x / hwAt(t), t) + 0.0006), 0.0036, 0, 'brass', wSh); }
      // the loop it hangs by: up behind the belt, over it and down its front to a stud. It stays with the belt while the sheath swings.
      { const SW = 33 * KS, lean = (y) => -0.20 * Math.max(0, y), wL = (x, y, z) => { const k = sm(M.y + 0.004, M.y + 0.030, y); return [BI.sheath, 1 - k, BI.hips, k]; };
        const yTop = 0.0880, zFront = BT * 2 + 0.0070;
        put('gear', slab(F, 3, Q(10, 6), (u, v) => { const x = SW * (2 * u - 1), y = lerp(-0.016, yTop, v); return [x, y, lean(y) + 0.0010, ...plainUV(u, v)]; }, 0.0030), wL, V3(...F(0, 0.04, lean(0.04) - 0.0005)));
        put('gear', slab(F, 3, Q(10, 6), (u, v) => { const x = SW * (2 * u - 1), y = lerp(0.0100, yTop, v), q = guv('sheathF', 391.5 + x / KS, 448 - y * (148 / yTop) ); return [x, y, lean(y) + zFront + 0.0030 * Math.sin(PI * v), q[0], q[1]]; }, 0.0030, (u, v) => plainUV(u, v)), wL, V3(...F(0, 0.05, lean(0.05) + zFront - 0.0015)));
        put('gear', slab(F, 3, 4, (u, v) => { const x = SW * (2 * u - 1), k = v, y = yTop + 0.0050 * Math.sin(PI * k); return [x, y, lean(yTop) + lerp(0.0010, zFront, k), ...plainUV(u, 0.4 + 0.2 * v)]; }, 0.0030), wL, V3(...F(0, yTop - 0.004, lean(yTop) + zFront / 2)));
        const ys = (448 - 408) * (yTop / 148), c = V3(...F(0, ys, lean(ys) + zFront + 0.0012)); dome(c, 0.0042, 0, 'brass', wL); }
      FOXGEAR.sheath = { M, tip, X: P.X, Y: P.Y, Z: P.Z, L, hwAt, F };

      // ---- her shears: two halves on one brass screw. Each half is its own piece on its own bone, so they can open, and come out of the sheath, later. ----
      const KG = 0.2488 / 1310, PV = [0, -0.034, 0];      // metres to one G1 pixel (26 cm long, in her frame); the screw sits 3.4 cm down inside the mouth
      const pv = V3(...F(PV[0], PV[1], 0.5 * (DS * (1 + PV[1] / L) + 0.0030)));
      addBone('shears', 'sheath', pv.x, pv.y, pv.z); addBone('shearB', 'shears', pv.x, pv.y, pv.z);
      const zMid = (yl) => 0.5 * (DS * (1 + yl / L) + 0.0030);       // half way through the sheath at that height: the blades lie down the middle of it, leaning back as it thins
      const G = (x, y, z) => F(PV[0] + x, PV[1] + y, zMid(PV[1] + y) + z);      // the shears' own space: the screw at the middle, blades pointing down, flat to the front
      const TIPY = -729 * KG, PLY = 111 * KG, PW = 37.5 * KG, TH = 0.0016;
      for (const [nm, sgn, bow, wb] of [['A', -1, { c: [-58 * KG, 406 * KG], rx: 80 * KG - 0.0021, ry: 175 * KG - 0.0021 }, [BI.shears, 1]], ['B', 1, { c: [87 * KG, 395 * KG], rx: 60 * KG - 0.0021, ry: 94 * KG - 0.0021 }, [BI.shearB, 1]]]) {
        const wf = () => wb, z0 = sgn < 0 ? 0 : -TH;                          // half A lies in front, half B behind
        // the blade and the plate round the screw: spine on its own side, edge toward the other half
        const wAt = (y) => (y >= -8 * KG ? PW : PW * Math.pow(Math.max(0, 1 - (-8 * KG - y) / (-8 * KG - TIPY)), 0.92));
        const blade = (u, v) => { const y = lerp(PLY, TIPY, Math.pow(v, 0.9)), w = wAt(y), x = sgn * lerp(w, -0.62 * w, u), th = TH * lerp(1, 0.22, Math.pow(u, 1.4)) * (0.35 + 0.65 * sm(TIPY, TIPY + 0.03, y)); return [x, y, th]; };
        const NBL = Q(26, 14);
        addPart('steel', sheet(4, NBL, (u, v) => { const q = blade(u, v), w = G(q[0], q[1], z0 + (sgn < 0 ? q[2] : TH)); return [w[0], w[1], w[2], 0, 0]; }), wf, { out: V3(...G(0, -0.05, -0.02)) });
        addPart('steel', sheet(4, NBL, (u, v) => { const q = blade(u, v), w = G(q[0], q[1], z0 + (sgn < 0 ? 0 : TH - q[2])); return [w[0], w[1], w[2], 0, 0]; }), wf, { out: V3(...G(0, -0.05, 0.02)) });
        addPart('steel', sheet(NBL, 1, (u, v) => { const q = blade(0, u), w = G(q[0], q[1], z0 + (sgn < 0 ? q[2] * v : TH - q[2] * v)); return [w[0], w[1], w[2], 0, 0]; }), wf, { out: V3(...G(0, -0.05, z0 + TH / 2)) });      // the spine
        // the shank, from the plate up to the bow, and the bow itself: a round bar bent into an oval
        const cx = bow.c[0], cy = bow.c[1], pts = [], rad = [], NB2 = Q(40, 22);
        const j0 = [sgn * 0.0040, PLY - 0.0030], j1 = [cx, cy - bow.ry];
        for (let i = 0; i <= 6; i++) { const k = i / 6; pts.push(V3(...G(lerp(j0[0], j1[0], k * k * (3 - 2 * k)), lerp(j0[1], j1[1], k), z0 + TH / 2))); rad.push([lerp(0.0012, 0.0021, k), lerp(0.0036, 0.0024, k)]); }      // flat and wide where it leaves the plate, round where it meets the bow
        addPart('steel', loft(tubeRings(pts, rad, Q(10, 7), P.Z), { capA: true }), wf, { out: V3(...G(lerp(j0[0], j1[0], 0.5), lerp(j0[1], j1[1], 0.5), z0 + TH / 2)) });
        const bp = []; for (let i = 0; i <= NB2; i++) { const th = -PI / 2 + (i / NB2) * TAU; bp.push(V3(...G(cx + bow.rx * Math.cos(th), cy + bow.ry * Math.sin(th), z0 + TH / 2))); }
        addPart('steel', loft(tubeRings(bp, bp.map(() => [0.0021, 0.0024]), Q(10, 7), P.Z)), wf, { out: V3(...G(cx, cy, z0 + TH / 2)) });
      }
      // the brass screw, front and back, with its crossed slot
      for (const sg of [1, -1]) { const c = V3(...G(0, 0, sg > 0 ? TH + 0.0003 : -TH - 0.0003)), part = spherePart(c, 0.0059, 0.0059, 0.0059, Q(14, 9), Q(8, 6));
        for (let i = 0; i < part.pos.length; i += 3) { const d = (part.pos[i] - c.x) * P.Z.x + (part.pos[i + 1] - c.y) * P.Z.y + (part.pos[i + 2] - c.z) * P.Z.z, sq = d * (0.30 - 1); part.pos[i] += P.Z.x * sq; part.pos[i + 1] += P.Z.y * sq; part.pos[i + 2] += P.Z.z * sq; }
        addPart('brass', part, () => [BI.shears, 1], { out: c });
        if (sg > 0) for (const rot of [PI / 4, -PI / 4]) { const cs = Math.cos(rot), sn = Math.sin(rot); put('gearIn', slab((x, y, z) => G(x * cs - y * sn, x * sn + y * cs, TH + 0.0003 + 0.0019 + z), 1, 1, (u, v) => [0.0048 * (2 * u - 1), 0.00055 * (2 * v - 1), 0, 0.5, 0.5], 0.0004), () => [BI.shears, 1], V3(...G(0, 0, TH))); } }
      FOXGEAR.shears = { pivot: pv, KG };
    }
  })();
