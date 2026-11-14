  // ---------- his hat, pearls, feather earring, belt, pouch, scroll, charms and dagger as real objects (stage 6) ----------
  // Chris: "give him his hat, his belt and pouch and scroll and jewelry". He is called the Grey Hat after the hat, so it comes first.
  // The method is the Ranger's (witches/ranger/src/R45_gear.js, her stages 5 and 5b): every piece is a real shape lying on the real surface
  // of his body; a thing that hangs has its own bone at its hinge (a child of his hips or his head) and is a weight on that hinge: gravity
  // pulls it in against him, his thigh pushes it out, and the movement of the hinge sets it swinging (GEAR.step, at the foot of this file).
  // Sizes and places are read off his paintings: C5, C6 and C10 (the hat on him and alone), F1 (pearls and earring), A1 to A4 (the belt and
  // what hangs from it, on him), F10 and F11 (the same things laid out), G1 and G2 (scroll and dagger). The numbers are in the stage report.
  // The surfaces (felt, black and brown leather, parchment) are cut from the material squares of F13 by bake_gear.py.
  //
  // The hat's own frame: O is the middle of the opening for his head; the opening is an oval (half-widths A across, B front to back) in a
  // plane tipped back by TILT, as C5's profile has it (the hat sits at the top of his forehead in front and low on the back of his head).
  // (hu, hw, hn): metres toward his left, toward the front along the plane, and up out of the plane.
  // kc(hn): how much narrower than the opening the inside of the crown is, by height. press(): the room his hair has under the hat
  // (see hatPress in N99_static.js, which does the same sum on the graphics card for every point of his hair).
  const HAT = (() => {
    const TILT = 23 * DEG, A = 0.088, B = 0.117, O = V3(0, 1.687, -0.042), INSET = 0.005, GAP = 0.004, CONE = Math.tan(32 * DEG);
    const U = V3(1, 0, 0), Wv = V3(0, Math.sin(TILT), Math.cos(TILT)), Nv = V3(0, Math.cos(TILT), -Math.sin(TILT));
    const KC = [[0, 1], [0.042, 0.955], [0.088, 0.84], [0.125, 0.66]];
    const kc = (hn) => { if (hn <= 0) return 1; for (let i = 1; i < KC.length; i++) if (hn < KC[i][0]) return lerp(KC[i - 1][1], KC[i][1], (hn - KC[i - 1][0]) / (KC[i][0] - KC[i - 1][0])); return KC[KC.length - 1][1]; };
    return { TILT, A, B, O, U, W: Wv, N: Nv, KC, kc, INSET, GAP, CONE, at: (hu, hw, hn) => O.clone().addScaledVector(U, hu).addScaledVector(Wv, hw).addScaledVector(Nv, hn) };
  })();
  const GEAR = (() => {
    const HANG = [], SPRING = [], SHADE = {}, _v = V3(), _w = V3();
    const shade = (key, list) => { const a = SHADE[key] || (SHADE[key] = []); for (const v of list) a.push(v); };      // a brightness for every point of a mesh, in the order its parts are added (N99_static.js checks the count)
    const G_TEX = (k, d) => (BAKED && BAKED[k + 'Tile']) || d;
    // ---- small builders ----
    // a tube along points (closed: a ring), a ball, a low dome standing on a surface, a strap (a flat band with rounded edges along a line)
    const tube = (key, pts, r, wf, o) => {
      o = o || {}; const P = o.closed ? pts.concat([pts[0].clone()]) : pts, c = P.reduce((a, p) => a.add(p), V3()).multiplyScalar(1 / P.length);
      const part = loft(tubeRings(P, P.map((p, i) => (typeof r === 'function' ? r(i / (P.length - 1)) : r)), o.n || 7, o.up), o.closed ? {} : { capA: true, capB: true });
      if (o.uv) for (let i = 0; i < part.uv.length; i += 2) { part.uv[i] = o.uv[0]; part.uv[i + 1] = o.uv[1]; }
      return addPart(key, part, wf, { out: o.out || c });
    };
    const ball = (key, c, r, wf, o) => {
      o = o || {}; const nu = o.nu || 12, nv = o.nv || 8, sq = o.sq || [1, 1, 1], rings = [];
      for (let i = 0; i <= nv; i++) { const ph = (i / nv) * PI, ring = []; for (let j = 0; j < nu; j++) { const a = (j / nu) * TAU, s = Math.max(1e-4, Math.sin(ph)); ring.push([c.x + r * sq[0] * s * Math.cos(a), c.y + r * sq[1] * Math.cos(ph), c.z + r * sq[2] * s * Math.sin(a)]); } rings.push(ring); }
      const part = loft(rings); if (o.uv) for (let i = 0; i < part.uv.length; i += 2) { part.uv[i] = o.uv[0]; part.uv[i + 1] = o.uv[1]; }
      return addPart(key, part, wf, { out: c });
    };
    const dome = (key, c, n, r, h, wf) => {
      const t1 = (Math.abs(n.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0)).cross(n).normalize(), t2 = V3().crossVectors(n, t1), rings = [];
      for (let i = 0; i <= 4; i++) { const ph = (i / 4) * PI / 2 * 0.96, ring = []; for (let j = 0; j < 9; j++) { const a = (j / 9) * TAU; ring.push(c.clone().addScaledVector(t1, r * Math.cos(ph) * Math.cos(a)).addScaledVector(t2, r * Math.cos(ph) * Math.sin(a)).addScaledVector(n, h * Math.sin(ph)).toArray()); } rings.push(ring); }
      return addPart(key, loft(rings, { capB: true }), wf, { out: c.clone().addScaledVector(n, -0.004) });
    };
    // strap: line = [{ p: middle of the strap's under side, n: the way it faces (off the body), w: across it }], hw half its width (a number or a
    // function of how far along, 0 to 1), th its thickness. The picture on it repeats every `tile` metres. Ends are closed.
    const strap = (key, line, hw, th, wf, tile, o) => {
      o = o || {}; const rings = [], vs = []; let L = 0;
      const SEC = [[-1, 0.12], [-0.86, 0.02], [0, 0], [0.86, 0.02], [1, 0.12], [1, 0.88], [0.86, 1], [0, 1.04], [-0.86, 1], [-1, 0.88]];
      for (let i = 0; i < line.length; i++) {
        const e = line[i], h = typeof hw === 'function' ? hw(i / (line.length - 1)) : hw; if (i) L += e.p.distanceTo(line[i - 1].p);
        rings.push(SEC.map(([a, b]) => e.p.clone().addScaledVector(e.w, a * h).addScaledVector(e.n, b * th).toArray())); vs.push(L / tile);
      }
      const part = loft(rings, { capA: true, capB: true, v: vs, uS: 2 * (typeof hw === 'function' ? hw(0.5) : hw) / tile * 2.2 });
      const mid = line[line.length >> 1];
      return addPart(key, part, wf, { out: o.out || mid.p.clone().addScaledVector(mid.n, th / 2) });
    };
    // a closed solid from rings of Vector3 with a painted square laid on by two of its own axes (metres / tile)
    const solid = (key, rings, wf, uvOf, o) => {
      o = o || {}; const part = loft(rings.map((r) => r.map((p) => p.toArray())), { capA: o.capA !== false, capB: o.capB !== false }), n = rings[0].length + 1;
      if (uvOf) { let k = 0; for (let i = 0; i < rings.length; i++) for (let j = 0; j < n; j++) { const uv = uvOf(rings[i][j % rings[0].length], i, j); part.uv[k++] = uv[0]; part.uv[k++] = uv[1]; } for (; k < part.uv.length; k += 2) { const uv = uvOf(V3(part.pos[(k / 2) * 3], part.pos[(k / 2) * 3 + 1], part.pos[(k / 2) * 3 + 2]), -1, 0); part.uv[k] = uv[0]; part.uv[k + 1] = uv[1]; } }
      return addPart(key, part, wf, { out: o.out || centroidOf(rings.map((r) => r.map((p) => p.toArray()))), flip: o.flip });
    };

    // =====================================================================================================================
    // THE HAT. Grey wool felt: a wide brim that droops all round, a tall baggy crown that has slumped and folded over so its blunt point
    // falls to HIS LEFT (C5 front, C11, and C6 from behind agree; C6's left profile alone has it falling back), a dark band round the foot
    // of the crown, a line of stitching just inside the brim's edge. Measured off C5 (1225 px to the metre by his pupils and lips):
    //   brim 0.414 m across; front edge 1.715 m up, back edge 1.557 m; the brim leaves the crown about 30 degrees below the opening's plane
    //   opening 0.172 m across and 0.22 m front to back, on a plane rising 24 degrees to the front, its middle 1.687 m up
    //   band 4 cm; top of the fold 1.855 m; tip 1.730 m up and 0.144 m to his left of the middle
    // The painted head is shallower at the forehead than his model's, so the opening sits 2.5 cm further forward than painted, to clear his brow.
    // Bones: hat (child of his head, so the whole hat can come off in a later stage), hatTip1 at the fold, hatTip2 half way down the point.
    // =====================================================================================================================
    const FT = G_TEX('felt', 0.085);
    {
      const H = HAT, NTH = Q(96, 56);
      // the crown's middle line, from the opening up to the fold and down to the tip: [x, y, z, half-width across, half-width front to back]
      const SP = [null, null, null, [0.007, 1.800, -0.068, 0.066, 0.080], [0.023, 1.817, -0.067, 0.052, 0.060], [0.050, 1.823, -0.069, 0.038, 0.042],
        [0.082, 1.811, -0.074, 0.033, 0.034], [0.110, 1.788, -0.080, 0.029, 0.031], [0.131, 1.761, -0.085, 0.025, 0.027], [0.141, 1.743, -0.088, 0.020, 0.021], [0.145, 1.733, -0.089, 0.008, 0.008]];
      [0, 0.042, 0.088].forEach((hn, i) => { const p = H.at(0, 0, hn), k = H.kc(hn); SP[i] = [p.x, p.y, p.z, H.A * k, H.B * k]; });      // up to here the crown is the opening's oval, narrowing: the hair's room (HAT.kc) is this same shape
      const NS = Q(60, 36), sAt = (t) => { const x = t * (SP.length - 1), i = Math.min(SP.length - 2, Math.floor(x)), f = x - i, g = (k, c) => SP[cl(k, 0, SP.length - 1)][c]; const o = []; for (let c = 0; c < 5; c++) { const p0 = g(i - 1, c), p1 = g(i, c), p2 = g(i + 1, c), p3 = g(i + 2, c); o.push(0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f)); } return o; };
      // more rings where it folds: t runs evenly along the list of key points
      const TS = []; for (let i = 0; i <= NS; i++) TS.push(i / NS);
      const C = TS.map((t) => sAt(t)), FR = [];
      // a frame carried along the line without twisting; it starts as the opening's own (across = his left, along = forward)
      // Up to the third ring (9 cm above the opening: all the room his head and hair take) every ring lies level with the opening, so the
      // crown there is exactly the shape his hair is kept inside (HAT.kc); above it the rings turn to follow the fold.
      { let Np = H.U.clone(), Bp = H.W.clone(), Tp = H.N.clone();
        for (let i = 0; i < C.length; i++) { const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], T = H.N.clone().lerp(V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(), sm(2.0, 3.4, i / NS * (SP.length - 1))).normalize(), q = new THREE.Quaternion().setFromUnitVectors(Tp, T); Np = Np.clone().applyQuaternion(q); Bp = Bp.clone().applyQuaternion(q); Np.addScaledVector(T, -Np.dot(T)).normalize(); Bp.addScaledVector(T, -Bp.dot(T)).addScaledVector(Np, -Bp.dot(Np)).normalize(); Tp = T; FR.push({ c: V3(C[i][0], C[i][1], C[i][2]), N: Np, B: Bp, T, ra: C[i][3], rb: C[i][4] }); } }
      addBone('hat', 'head', H.O.x, H.O.y, H.O.z);
      const iT1 = Math.round(NS * 4.7 / (SP.length - 1)), iT2 = Math.round(NS * 7.0 / (SP.length - 1));
      addBone('hatTip1', 'hat', FR[iT1].c.x, FR[iT1].c.y, FR[iT1].c.z); addBone('hatTip2', 'hatTip1', FR[iT2].c.x, FR[iT2].c.y, FR[iT2].c.z);
      const wHatI = (i) => { const k1 = sm(iT1 - 5, iT1 + 4, i), k2 = sm(iT2 - 4, iT2 + 4, i); return [BI.hat, 1 - k1, BI.hatTip1, k1 * (1 - k2), BI.hatTip2, k1 * k2]; };
      // The felt is old and soft, so the crown is not a clean cone: it has long folds running up it, soft dents, rings of wrinkles on the
      // inside of the bend where the point is folded over, and lumps along the point. All of it fades out under the band, which lies flat.
      const valley = (x, p) => Math.pow(0.5 + 0.5 * Math.cos(x), p);
      let lastK = 1;      // how far the last point made was pushed in or out (1 = not at all): the folds are shaded by it
      const crownPt = (i, al, lift) => {
        const f = FR[i], t = i / NS, ca = Math.cos(al), sa = Math.sin(al), free = sm(0.10, 0.20, t);
        const inner = Math.max(0, ca * 0.8 - sa * 0.3), bend = sm(0.28, 0.42, t) * (1 - sm(0.60, 0.78, t));
        let k = 1 - 0.30 * bend * inner * valley(t * 78 + 1.6 * sa, 2) - 0.05 * bend * inner;
        k += free * (1 - sm(0.46, 0.62, t)) * (0.09 * Math.sin(al * 2 + 1.9 + t * 7) - 0.24 * valley(al - 5.0 * t + 0.9, 2) - 0.13 * valley(al * 3 + 2.2 * Math.sin(t * 8 + 1) + 0.7, 3) + 0.10);
        k += free * 0.18 * (fbm(ca * 1.1 + 3.1 + t * 8, sa * 1.1 + 0.7 + t * 5) - 0.47) + sm(0.5, 0.62, t) * (0.08 * Math.sin(al * 2 + t * 22) - 0.17 * valley(al * 3 + t * 13, 3) + 0.05);
        k = Math.max(k, lerp(0.975, 0.5, sm(0.20, 0.32, t)));      // round his head (up to 9 cm above the opening) a dent is never deeper than 3 mm: his hair is kept 5 mm inside this shape (hatPress)
        lastK = k; const flat = 1 - 0.18 * sm(0.5, 0.66, t);      // the point hangs a little flattened, like a folded sock
        return f.c.clone().addScaledVector(f.N, (f.ra * k + lift) * ca).addScaledVector(f.B, (f.rb * k * flat + lift) * sa);
      };
      { const rings = [], NA = Q(64, 40), W = [], SH = []; let vv = 0; const vs = [];
        for (let i = 0; i <= NS; i++) { const ring = [], ks = []; for (let j = 0; j < NA; j++) { ring.push(crownPt(i, (j / NA) * TAU, 0)); ks.push(lastK); } rings.push(ring); if (i) vv += FR[i].c.distanceTo(FR[i - 1].c); vs.push(vv / FT); for (let j = 0; j <= NA; j++) { W.push(wHatI(i)); SH.push(cl(1 + 2.2 * (ks[j % NA] - 1.0), 0.45, 1.10)); } }
        const part = loft(rings.map((r) => r.map((p) => p.toArray())), { capB: true, v: vs, uS: Math.round(TAU * 0.095 / FT) }); W.push(wHatI(NS));
        while (SH.length < part.pos.length / 3) SH.push(0.9);
        shade('hatFelt', SH); addPart('hatFelt', part, (x, y, z, i) => W[i], { out: V3(0.01, 1.76, -0.06) }); }
      // the band: darker felt, 3 cm tall, lying on the foot of the crown and standing 2 mm off it
      { const rings = [], NA = Q(56, 36), i0 = 0, i1 = Math.round(NS * 0.95 / (SP.length - 1)), rows = [[i0, 0.0005, 0.02], [i0, 0.0024, 0.1], [Math.round((i0 + i1) / 2), 0.0028, 0.5], [i1, 0.0026, 0.9], [i1, 0.0004, 0.98]];
        for (const [i, lift] of rows) { const ring = []; for (let j = 0; j < NA; j++) ring.push(crownPt(i, (j / NA) * TAU, lift).addScaledVector(H.N, i === i0 ? 0.004 : 0)); rings.push(ring); }
        addPart('hatBand', loft(rings.map((r) => r.map((p) => p.toArray())), { v: rows.map((r) => r[2]), uS: 6 }), wOne('hat'), { out: H.at(0, 0, 0.02) }); }
      // the brim. th: round the hat from the front toward his left. Across it (s 0 at the crown, 1 at the edge) it starts nearly flat and
      // droops about 30 degrees below the opening's plane all round (so it is nearly level in front and steep behind); the edge waves a little.
      const brimW = (th) => 0.137 - (Math.cos(th) > 0 ? 0.017 : 0.032) * Math.cos(th) * Math.cos(th) + 0.0035 * Math.sin(th * 3 + 0.6) + 0.0025 * Math.sin(th * 7 + 2.1) + 0.0015 * Math.sin(th * 13 + 0.4);
      const droop = (th, s) => lerp(23 * DEG, 36 * DEG, Math.pow(s, 0.8)) + (0.09 * Math.sin(th * 3 + 1.1) + 0.06 * Math.sin(th * 5 + 2.9)) * s * s;      // never steeper than HAT.CONE near the crown: his hair is kept under that cone
      const KB = Q(12, 8), TH = 0.0042;
      const brimLine = (th) => {
        const st = Math.sin(th), ct = Math.cos(th), ex = st / H.A, ez = ct / H.B, el = Math.hypot(ex, ez), rad = H.U.clone().multiplyScalar(ex / el).addScaledVector(H.W, ez / el), W = brimW(th), pts = [];
        let p = H.at(H.A * st, H.B * ct, 0);
        for (let k = 0; k <= KB; k++) { const s = k / KB, ph = droop(th, s), dir = rad.clone().multiplyScalar(Math.cos(ph)).addScaledVector(H.N, -Math.sin(ph)), up = H.N.clone().multiplyScalar(Math.cos(ph)).addScaledVector(rad, Math.sin(ph)); pts.push({ p: p.clone(), dir, up, s }); p = p.clone().addScaledVector(dir, W / KB); }
        return pts;
      };
      { const rows = [], uvs = [];
        for (let j = 0; j < NTH; j++) { const L = brimLine((j / NTH) * TAU), col = [];
          for (let k = 0; k <= KB; k++) col.push(L[k].p.clone().addScaledVector(L[k].up, TH * (k === KB ? 0.55 : 1)));
          col.push(L[KB].p.clone().addScaledVector(L[KB].dir, TH * 0.5).addScaledVector(L[KB].up, TH * 0.1));
          for (let k = KB; k >= 0; k--) col.push(L[k].p.clone().addScaledVector(L[k].up, k === KB ? -TH * 0.35 : 0));
          rows.push(col); }
        // rings run round the hat: ring k is the k-th point of every line
        const rings = []; for (let k = 0; k < rows[0].length; k++) rings.push(rows.map((c) => c[k]));
        // shaded: the top is in the light, a little darker where it meets the crown; the under side is in its own shade, darkest near his head
        const SH = [], nr = rings.length; for (let k = 0; k < nr; k++) { const topSide = k <= KB + 1, s = topSide ? Math.min(1, k / KB) : (nr - 1 - k) / KB, v = topSide ? 0.84 + 0.16 * sm(0, 0.25, s) : 0.60 + 0.22 * sm(0.1, 1, s); for (let j = 0; j <= NTH; j++) SH.push(v); }
        shade('hatFelt', SH); solid('hatFelt', rings, wOne('hat'), (p) => { const d = p.clone().sub(H.O); return [d.dot(H.U) / FT, d.dot(H.W) / FT]; }, { capA: false, capB: false, out: H.at(0, 0, -0.03) }); }
      // a row of stitching just inside the edge, top and bottom, as C10 shows: a thin raised line of the band's darker felt
      for (const side of [1, -1]) { const pts = []; for (let j = 0; j < NTH; j++) { const L = brimLine((j / NTH) * TAU), e = L[KB - 1], f = L[KB]; pts.push(e.p.clone().lerp(f.p, 0.45).addScaledVector(e.up, side > 0 ? TH + 0.0002 : -0.0002)); } tube('hatBand', pts, 0.0007, wOne('hat'), { closed: true, n: 4, out: H.at(0, 0, side > 0 ? -0.2 : 0.2), uv: [0.5, 0.5] }); }
      SPRING.push({ bone: 'hatTip1', k: 60, damp: 7, max: 0.10, gain: 2.2 }, { bone: 'hatTip2', k: 45, damp: 6, max: 0.14, gain: 3.2 });
    }

    // =====================================================================================================================
    // Shared measuring: his skin (the doll) and his clothes as they rest.
    // =====================================================================================================================
    // how far from o, along the level direction d, his skin lies: the furthest point of the doll within 8 mm of that line
    const skinHit = (o, d, fall) => { const P = DOLL.pos; let best = -1; for (let i = 0; i < P.length; i += 3) { const x = P[i] - o.x, y = P[i + 1] - o.y, z = P[i + 2] - o.z; if (y > 0.008 || y < -0.008) continue; const t = x * d.x + z * d.z; if (t <= 0) continue; const ox = x - t * d.x, oz = z - t * d.z; if (ox * ox + oz * oz < 0.000064 && t > best) best = t; } return best < 0 ? fall : best; };
    // the outside of his corset and the top of his trousers at a place round him (u: 0 the middle of his back, 0.25 his right, 0.5 the front) and a height
    // His trousers are fuller than the hips under them, so where they stand out past the corset's line the belt must lie on the cloth, not
    // in it: over() is how far the trouser cloth stands out from a point of that line (0 where the corset is outermost).
    const CL = []; for (const leg of TROUSERS.legs) for (const q of leg.P) if (q[1] > 0.88 && q[1] < 1.10) CL.push(q);
    const over = (p, n) => { let m = 0; for (const q of CL) { const dx = q[0] - p.x, dy = q[1] - p.y, dz = q[2] - p.z, t = dx * n.x + dy * n.y + dz * n.z; if (t <= m) continue; const r2 = dx * dx + dy * dy + dz * dz - t * t; if (r2 < 0.00032) m = t; } return Math.min(m, 0.04); };
    const bodyAt = (u, y) => { const f = bodyAt0(u, y), e = over(f.p, f.n); if (e > 0) f.p.addScaledVector(f.n, e); return f; };
    const bodyAt0 = (u, y) => { const p = V3(...trunkPt(u, y)), a = V3(...trunkPt(u - 0.004, y)), b = V3(...trunkPt(u + 0.004, y)), c = V3(...trunkPt(u, y + 0.01)), d = V3(...trunkPt(u, y - 0.01)); const t = b.sub(a).normalize(), up = c.sub(d).normalize(), n = V3().crossVectors(up, t).normalize(); if (n.x * p.x + n.z * p.z < 0) n.negate(); return { p, t, n, up: V3().crossVectors(t, n).normalize() }; };
    const wHipsAt = (p) => wTrouser(p.x, p.y, p.z);      // a strap moves exactly as the cloth it lies on (the corset above 0.99 m, the trousers below)
    // the points of his trouser cloth that lie under a hanging thing, each with the bones that carry it and their shares (for GEAR's floor)
    const clothUnder = (hinge, ex, ez, t0, t1, depth) => { const out = [], v = V3(); for (const leg of TROUSERS.legs) for (const p of leg.P) { v.set(p[0], p[1], p[2]).sub(hinge); const t = v.dot(ex); if (t < t0 || t > t1 || -v.y < 0.012 || -v.y > depth || v.dot(ez) < -0.06) continue; out.push({ p: V3(p[0], p[1], p[2]), w: unit(wTrouser(p[0], p[1], p[2])) }); } return out; };      // the shares are made to add up to one, as addPart does for the cloth itself
    function unit(w0) { const w = w0.slice(); let sum = 0; for (let j = 1; j < w.length; j += 2) sum += w[j]; for (let j = 1; j < w.length; j += 2) w[j] /= sum; return w; }      // bone shares made to add up to one
    const flatUV = (part, u, v) => { for (let i = 0; i < part.uv.length; i += 2) { part.uv[i] = u; part.uv[i + 1] = v; } return part; };
    const torus = (key, c, a, b, R, r, wf, o) => { o = o || {}; const pts = [], n = o.seg || 28; for (let i = 0; i < n; i++) { const th = (i / n) * TAU; pts.push(c.clone().addScaledVector(a, R * Math.cos(th) * (o.sx || 1)).addScaledVector(b, R * Math.sin(th))); } return tube(key, pts, r, wf, { closed: true, n: o.n || 8, out: c.clone().addScaledVector(V3().crossVectors(a, b), -0.05), uv: [0.5, 0.5] }); };
    const BT = G_TEX('beltL', 0.075), PT = G_TEX('pouchL', 0.11), QT = G_TEX('parch', 0.16);

    // =====================================================================================================================
    // PEARLS (C5, C6, F1). One strand of cream pearls about 1 cm across, worn over his shirt: round the back and sides of his neck it lies
    // on the fold of the collar, and in the open front it hangs down onto his chest (painted: 1.50 m up at the sides, 1.445 m at the
    // lowest bead). The collar's fold is one of the shirt's pinned edges (it goes exactly where his bones go), so each bead there takes the
    // weights of the point of the fold under it and sits on it without sinking in; each bead in front takes the weights of the skin
    // under it. So the strand moves with his neck and chest and cannot pass through either.
    // =====================================================================================================================
    { const R = 0.0050, col = CLOTH.sheets.find((q) => q.name === 'collar'), NC = col.NC, path = [];
      const foldPt = (c) => { const i = (NC + c) * 3, p = V3(col.pos[i], col.pos[i + 1], col.pos[i + 2]), out = V3(p.x, 0, p.z + 0.027).normalize(); return p.addScaledVector(out, 0.0030).add(V3(0, R + 0.0022, 0)); };
      // the collar runs from his right front, round the back, to his left front. Its last two columns at each end lie down onto his chest,
      // so the strand leaves the fold there (C0) and crosses the open front in a U, on his skin or on whatever cloth lies there
      const C0 = 2;
      for (let c = C0; c <= NC - 1 - C0; c++) for (let k = 0; k < 6; k++) { if (c === NC - 1 - C0 && k) break; const f = k / 6, p = k ? foldPt(c).lerp(foldPt(c + 1), f) : foldPt(c); path.push({ p, w: unit(col.o.rest(Math.min(NC - 1, Math.round(c + f)), 1).w) }); }
      const CP = []; for (const sh of CLOTH.sheets) for (let i = 0; i < sh.pos.length; i += 3) if (sh.pos[i + 1] > 1.43 && sh.pos[i + 1] < 1.53 && Math.abs(sh.pos[i]) < 0.10 && sh.pos[i + 2] > 0) CP.push([sh.pos[i], sh.pos[i + 1], sh.pos[i + 2]]);
      const clothZ = (x, y) => { let z = -1; for (const q of CP) { const dx = q[0] - x, dy = q[1] - y; if (dx * dx + dy * dy < 0.00017 && q[2] > z) z = q[2]; } return z; };
      const eL = path[path.length - 1].p.clone(), eR = path[0].p.clone(), Y0 = 1.452, o = V3(), NF = 48;
      for (let k = 1; k < NF; k++) { const t = 1 - 2 * k / NF, a = Math.abs(t), e = t > 0 ? eL : eR, x = e.x * a, y = Y0 + (e.y - Y0) * Math.pow(a, 1.6); o.set(x, y, -0.03); const zs = skinHit(o, V3(0, 0, 1), 0.06) - 0.03 + R * 0.95, zc = clothZ(x, y) + R + 0.0015, p = V3(x, y, lerp(Math.max(zs, zc), e.z, Math.pow(a, 8))); path.push({ p, w: unit(DOLL.wAt(x, y, zs - R)) }); }
      // the front is smoothed a little, outward only (the skin and cloth under it are made of flat pieces)
      { const n0 = path.length - (NF - 1); for (let pass = 0; pass < 3; pass++) for (let i = n0; i < path.length; i++) { const A = path[i - 1].p, B = path[(i + 1) % path.length].p, mz = (A.z + B.z) / 2; if (mz > path[i].p.z) path[i].p.z = lerp(path[i].p.z, mz, 0.6); } }
      const N = path.length; let len = 0; for (let i = 0; i < N; i++) len += path[i].p.distanceTo(path[(i + 1) % N].p);
      const nb = Math.round(len / (2 * R * 1.005)), stepL = len / nb; let acc = 0, k = 0;
      for (let i = 0; i < N && k < nb; i++) { const a = path[i], b = path[(i + 1) % N], seg = a.p.distanceTo(b.p); while (acc <= seg && k < nb) { const c = a.p.clone().lerp(b.p, acc / seg), w = acc / seg < 0.5 ? a.w : b.w; ball('gPearl', c, R * (0.95 + 0.07 * (((Math.sin(k * 12.9898) * 43758.5453) % 1 + 1) % 1)), () => w, { nu: 10, nv: 7, uv: [0.5, 0.5] }); k++; acc += stepL; } acc -= seg; }
    }

    // =====================================================================================================================
    // THE FEATHER EARRING, in his LEFT ear only (C5, C6, F1): from the plug hang a short silver chain, two small pearls, and a black
    // feather about 6 cm long. One bone at the bottom of the plug (ear, a child of his head); it hangs and swings as a weight on a hinge.
    // =====================================================================================================================
    // His hair falls just in front of and below that ear (to 1 cm forward of the plug), so the chain leaves the plug toward the front and the
    // pearls and feather hang in front of the hair, beside his jaw, where the paintings show them.
    { const top = V3(0.0770, 1.6030, -0.0120); addBone('ear', 'head', top.x, top.y, top.z); const wf = wOne('ear');
      const PATH = [[0, 0], [0.0050, 0.0048], [0.0100, 0.0100], [0.0150, 0.0156], [0.0200, 0.0206], [0.0260, 0.0236], [0.0330, 0.0246], [0.0390, 0.0250]], at = (i) => V3(top.x + 0.0012 * Math.min(i, 3), top.y - PATH[i][0], top.z + PATH[i][1]);
      for (let i = 0; i < 5; i++) { const c = at(i).lerp(at(i + 1), 0.5), d = at(i + 1).sub(at(i)).normalize(), a = i % 2 ? V3(1, 0, 0) : V3().crossVectors(V3(1, 0, 0), d).normalize(); torus('gSteel', c, a, d, 0.0034, 0.0007, wf, { seg: 10, n: 5 }); }
      ball('gPearl', at(5).lerp(at(6), 0.45), 0.0037, wf, { nu: 10, nv: 7, uv: [0.5, 0.5] }); ball('gPearl', at(6).lerp(at(7), 0.6), 0.0031, wf, { nu: 10, nv: 7, uv: [0.5, 0.5] });
      const q = at(7); let y = q.y - 0.0040; ball('gSteel', V3(q.x, y, q.z), 0.0019, wf, { nu: 8, nv: 5, sq: [1, 1.5, 1], uv: [0.5, 0.5] }); y -= 0.0020;
      // the feather: a flat blade with a raised quill down its middle, turned half toward the front so it shows from the front and from the side
      const LEN = 0.056, face = V3(0.70, 0, 0.71).normalize(), across = V3(0.71, 0, -0.70).normalize(), rows = [], NV = 14;
      const halfW = (t) => 0.0128 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.75) * (1 - 0.10 * Math.abs(Math.sin(t * 34))) + 0.0006;
      for (let i = 0; i <= NV; i++) { const t = i / NV, hw = halfW(t), c = V3(q.x, y - t * LEN, q.z).addScaledVector(face, 0.003 * Math.sin(t * 2.4)), ring = []; for (const [a, b] of [[-1, 0], [-0.5, 0.0009], [0, 0.0016], [0.5, 0.0009], [1, 0], [0.5, -0.0006], [0, -0.0010], [-0.5, -0.0006]]) ring.push(c.clone().addScaledVector(across, a * hw).addScaledVector(face, b).addScaledVector(V3(0, -1, 0), Math.abs(a) * hw * 0.55)); rows.push(ring); }
      addPart('gFeather', flatUV(loft(rows.map((r) => r.map((p) => p.toArray())), { capA: true, capB: true }), 0.5, 0.5), wf, { out: V3(q.x, y - LEN / 2, q.z) });
      tube('gSteel', [V3(q.x, y + 0.001, q.z).addScaledVector(face, 0.0016), V3(q.x, y - LEN * 0.5, q.z).addScaledVector(face, 0.0016 + 0.003 * Math.sin(1.2)), V3(q.x, y - LEN * 0.93, q.z).addScaledVector(face, 0.0012 + 0.003 * Math.sin(2.23))], (k) => 0.0006 * (1 - 0.6 * k), wf, { n: 4, uv: [0.5, 0.5] });      // the quill
      hang({ bone: 'ear', parent: 'head', hinge: top.clone(), ez: V3(1, 0, 0), L: 0.055, damp: 2.6, bMax: 0.22, kb: 1.6, aMax: 0.6, drive: 1.5, kickA: 1.5 });
    }

    // =====================================================================================================================
    // THE BELT (A1, A2, A3, F10). A wide black leather belt lying over the bottom edge of his corset and the top of his trousers, a little
    // higher on his LEFT hip. Its two ends meet at one large steel ring (7 cm across) that hangs in front, over the corset's point; a
    // buckle sits on the belt at his left front. A second, shorter strap leaves the ring, droops across the front of his right thigh and
    // climbs back to the belt at his right hip. Everything here lies on his hips and is carried by them (bone weights of the corset).
    // =====================================================================================================================
    const U0 = 0.488, RING_R = 0.045, RING_T = 0.0050, BELT_HW = 0.024, BELT_TH = 0.0034, LIFT = 0.0036;
    const beltY = (u) => { let d = Math.abs(u - U0); d = Math.min(d, 1 - d); return 1.047 + 0.008 * Math.sin((u - 0.5) * TAU) - 0.040 * Math.pow(Math.max(0, 1 - d / 0.17), 1.2); };
    const ringF = bodyAt(U0, 1.000), ringT = ringF.t.clone();      // ringT points toward his left
    // the ring leans on him at its top (the corset) and its bottom (the trousers): its plane is laid through those two places and then stood off whatever lies between
    const rTop = bodyAt(U0, 1.000 + RING_R).p, rBot = bodyAt(U0, 1.000 - RING_R).p, ringUp = rTop.clone().sub(rBot).normalize(), ringN = V3().crossVectors(ringT, ringUp).normalize(); if (ringN.dot(ringF.n) < 0) ringN.negate();
    const rMid = rTop.clone().add(rBot).multiplyScalar(0.5), ringC = rMid.clone().addScaledVector(ringN, Math.max(0, ringF.p.clone().sub(rMid).dot(ringN)) + RING_T + 0.0045); ringF.n = ringN;
    torus('gSteel', ringC, ringT, ringUp, RING_R, RING_T, wOne('hips'), { seg: 40, n: 10 });
    // a strap end that comes down onto the ring from outside and wraps round its wire: returns the last few points of the strap's line
    const wrap = (ang, wAcross) => { const dirOut = ringT.clone().multiplyScalar(Math.cos(ang)).addScaledVector(ringUp, Math.sin(ang)), c = ringC.clone().addScaledVector(dirOut, RING_R), pts = []; for (let k = 0; k <= 5; k++) { const th = (k / 5) * PI * 0.92, nn = ringF.n.clone().multiplyScalar(Math.cos(th)).addScaledVector(dirOut, -Math.sin(th)); pts.push({ p: c.clone().addScaledVector(nn, RING_T + 0.0006), n: nn, w: wAcross }); } return pts; };
    const beltLine = (uA, uB, n) => { const line = []; for (let i = 0; i <= n; i++) { const u = lerp(uA, uB, i / n), f = bodyAt(((u % 1) + 1) % 1, beltY(((u % 1) + 1) % 1)); const g = bodyAt((((u + 0.004) % 1) + 1) % 1, beltY((((u + 0.004) % 1) + 1) % 1)); const along = g.p.clone().sub(f.p).normalize(), w = V3().crossVectors(along, f.n).normalize(); if (w.y < 0) w.negate(); line.push({ p: f.p.clone().addScaledVector(f.n, LIFT), n: f.n, w, u }); } for (let pass = 0; pass < 2; pass++) { const c = line.map((e) => e.p.clone()); for (let i = 1; i < n; i++) { const m = c[i - 1].clone().add(c[i + 1]).multiplyScalar(0.5), d = m.sub(c[i]).dot(line[i].n); if (d > 0) line[i].p.addScaledVector(line[i].n, d * 0.7); } } return line; };      // smoothed outward only, so it never sinks
    { // the main belt: from the ring, round his right hip, his back and his left hip, and back to the ring
      const aR = PI - 0.36, aL = 0.36, body = beltLine(U0 - 0.062, U0 - 1 + 0.062, Q(150, 90));
      const wR = wrap(aR, body[0].w).reverse(), wL = wrap(aL, body[body.length - 1].w);
      // ease the first and last points off the body up onto the ring's wire
      const line = wR.concat(body, wL);
      strap('gBelt', line, BELT_HW, BELT_TH, (x, y, z) => wHipsAt({ x, y, z }), BT, { out: V3(0, 1.04, 0) });
      // rivets beside the ring, the buckle at his left front with its keeper, and a row of small steel studs round the belt
      for (const e of [body[3], body[body.length - 4]]) dome('gSteel', e.p.clone().addScaledVector(e.n, BELT_TH), e.n, 0.0040, 0.0022, wOne('hips'));
      for (let u = U0 - 0.10; u > U0 - 0.92; u -= 0.052) { if (u < U0 - 0.80 && u > U0 - 0.90) continue; const f = bodyAt(((u % 1) + 1) % 1, beltY(((u % 1) + 1) % 1)); dome('gSteel', f.p.clone().addScaledVector(f.n, LIFT + BELT_TH), f.n, 0.0028, 0.0016, (x, y, z) => wHipsAt(f.p)); }
      { const u = U0 + 0.118, f = bodyAt(u, beltY(u)), g = bodyAt(u + 0.004, beltY(u + 0.004)), along = g.p.clone().sub(f.p).normalize(), w = V3().crossVectors(along, f.n).normalize(), c = f.p.clone().addScaledVector(f.n, LIFT + BELT_TH + 0.0024); if (w.y < 0) w.negate();
        const fr = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => c.clone().addScaledVector(along, a * 0.014).addScaledVector(w, b * (BELT_HW + 0.0045)));
        const pts = []; for (let k = 0; k < 4; k++) for (let m = 0; m < 4; m++) pts.push(fr[k].clone().lerp(fr[(k + 1) % 4], m / 4));
        tube('gSteel', pts, 0.0026, () => wHipsAt(f.p), { closed: true, n: 6, out: c.clone().addScaledVector(f.n, -0.05), uv: [0.5, 0.5] });
        tube('gSteel', [c.clone().addScaledVector(along, -0.014), c.clone().addScaledVector(along, 0.016).addScaledVector(f.n, 0.001)], 0.0017, () => wHipsAt(f.p), { n: 5, uv: [0.5, 0.5] });
        const kp = bodyAt(u - 0.034, beltY(u - 0.034)), kl = []; for (const [a, b] of [[-1, 0], [-1, 1], [1, 1], [1, 0]]) kl.push(kp.p.clone().addScaledVector(kp.n, LIFT + b * (BELT_TH + 0.0022)).addScaledVector(w, a * (BELT_HW + 0.0015)));
        strap('gBelt', [0, 0.33, 0.66, 1].map((t) => ({ p: kp.p.clone().addScaledVector(kp.n, LIFT + BELT_TH + 0.0004).addScaledVector(w, lerp(-BELT_HW - 0.001, BELT_HW + 0.001, t)), n: kp.n, w: along })), 0.0045, 0.0022, () => wHipsAt(kp.p), BT, { out: kp.p }); }
    }
    // the second strap: (u, height) of its middle line from the ring to his right hip
    const SW = [[U0 - 0.036, 0.962], [U0 - 0.062, 0.946], [U0 - 0.092, 0.938], [U0 - 0.122, 0.942], [U0 - 0.150, 0.960], [U0 - 0.172, 0.990], [U0 - 0.186, 1.022]];
    const swagAt = (t) => { const x = t * (SW.length - 1), i = Math.min(SW.length - 2, Math.floor(x)), f = x - i, g = (k, c) => SW[cl(k, 0, SW.length - 1)][c], cr = (c) => { const p0 = g(i - 1, c), p1 = g(i, c), p2 = g(i + 1, c), p3 = g(i + 2, c); return 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f); }; return [cr(0), cr(1)]; };
    const swagFrame = (t) => { const [u, y] = swagAt(t), [u2, y2] = swagAt(Math.min(1, t + 0.01)), [u1, y1] = swagAt(Math.max(0, t - 0.01)), f = bodyAt(u, y), a = bodyAt(u1, y1).p, b = bodyAt(u2, y2).p, along = b.sub(a).normalize(), w = V3().crossVectors(along, f.n).normalize(); if (w.y < 0) w.negate(); return { p: f.p.clone().addScaledVector(f.n, LIFT + 0.0008), n: f.n, w, along, f }; };
    { const n = Q(44, 28), line = []; for (let i = 0; i <= n; i++) line.push(swagFrame(i / n));
      const wr = wrap(PI + 0.66, line[0].w).reverse();
      strap('gBelt', wr.concat(line), 0.0135, 0.0030, (x, y, z) => wHipsAt({ x, y, z }), BT, { out: V3(-0.05, 0.96, 0) });
      dome('gSteel', line[2].p.clone().addScaledVector(line[2].n, 0.003), line[2].n, 0.0032, 0.0018, wOne('hips')); }

    // =====================================================================================================================
    // WHAT HANGS FROM THE BELT. Each thing has one bone at its hinge on the belt's top edge and is a weight on that hinge (hang()).
    // A frame for a hanging thing at a place round the belt: H the hinge, T along the belt, N out from his body (level), D straight down.
    // =====================================================================================================================
    const hingeAt = (u, y, lift) => { const f = bodyAt(u, y), N = V3(f.n.x, 0, f.n.z).normalize(), T = V3().crossVectors(V3(0, 1, 0), N).normalize(); return { H: f.p.clone().addScaledVector(f.n, lift), T, N, D: V3(0, -1, 0), at(t, d, n) { return this.H.clone().addScaledVector(this.T, t).addScaledVector(this.D, d).addScaledVector(this.N, n); } }; };
    // a rounded box hanging in such a frame: rows of [d, half-width along T, n of its back, n of its front]; pw squares the corners
    const slab = (key, F, rows, wf, tile, o) => { o = o || {}; const NA = o.na || 20, rings = rows.map(([d, hw, n0, n1]) => { const r = []; for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU; r.push(F.at((o.t0 || 0) + hw * sgnPow(Math.cos(a), o.pw || 0.45), d, (n0 + n1) / 2 + (n1 - n0) / 2 * sgnPow(Math.sin(a), o.pw || 0.45))); } return r; }); return solid(key, rings, wf, (p) => { const v = p.clone().sub(F.H); return [(v.dot(F.T) + 0.6 * v.dot(F.N)) / tile, v.dot(F.D) / tile]; }, { out: F.at(o.t0 || 0, (rows[0][0] + rows[rows.length - 1][0]) / 2, (rows[1][2] + rows[1][3]) / 2) }); };
    const BELT_OUT = LIFT + BELT_TH + 0.0012;

    // ---- the pouch, on his RIGHT hip toward the front (A1, A3, F10): brown leather, a flap with a stitched edge and one brass stud ----
    { const u = 0.350, F = hingeAt(u, beltY(u) + BELT_HW * 0.92, BELT_OUT); addBone('pouch', 'hips', F.H.x, F.H.y, F.H.z); const wf = wOne('pouch');
      const HW = 0.067, TOP = 2 * BELT_HW + 0.002, BOT = TOP + 0.150, B0 = 0.0040, DEPTH = 0.054;
      const prof = [[0, 0.80, 0.50], [0.03, 0.90, 0.70], [0.12, 0.95, 0.86], [0.35, 1.0, 1.0], [0.65, 1.0, 1.0], [0.86, 0.96, 0.94], [0.95, 0.88, 0.74], [0.985, 0.74, 0.52], [1, 0.5, 0.26]];
      slab('gPouch', F, prof.map(([s, kw, kd]) => [lerp(TOP, BOT, s), HW * kw, B0, B0 + DEPTH * kd]), wf, PT, { na: 24 });
      // the flap: it comes over the top from the back and lies down the front, longest in the middle, with a rolled edge
      { const NT = 18, cols = [], flapLen = (t) => 0.082 * (1 - 0.42 * Math.pow(Math.abs(t), 2.6)), TH = 0.0032, front = (d) => { const s = cl((d - TOP) / (BOT - TOP), 0, 1); let kd = prof[0][2]; for (let i = 1; i < prof.length; i++) if (s <= prof[i][0]) { kd = lerp(prof[i - 1][2], prof[i][2], (s - prof[i - 1][0]) / (prof[i][0] - prof[i - 1][0])); break; } return B0 + DEPTH * kd; };
        for (let i = 0; i <= NT; i++) { const t = -1 + 2 * i / NT, tt = t * (HW + 0.003) * (1 - 0.05 * t * t), fl = flapLen(t), path = [];
          path.push([TOP + 0.004, B0 + 0.001]); path.push([TOP - 0.006, B0 + 0.006]); path.push([TOP - 0.009, B0 + DEPTH * 0.28]); path.push([TOP - 0.004, B0 + DEPTH * 0.50]);
          for (let k = 1; k <= 6; k++) { const d = TOP + fl * k / 6; path.push([d, front(d) * (1 - 0.10 * t * t) + 0.0012]); }
          const col = path.map(([d, n]) => F.at(tt, d, n + TH)); for (let k = path.length - 1; k >= 0; k--) col.push(F.at(tt, path[k][0] - (k === path.length - 1 ? 0.0006 : 0), path[k][1])); cols.push(col); }
        solid('gPouch', cols, wf, (p) => { const v = p.clone().sub(F.H); return [v.dot(F.T) / PT + 0.37, (v.dot(F.D) + v.dot(F.N)) / PT + 0.21]; }, { out: F.at(0, TOP + 0.03, B0 + DEPTH * 0.3) });
        // the stitching just inside the flap's edge, and the brass stud that holds it shut
        const st = []; for (let i = 1; i < NT; i++) { const t = -1 + 2 * i / NT, d = TOP + flapLen(t) - 0.007; st.push(F.at(t * (HW - 0.004), d, front(d) * (1 - 0.10 * t * t) + 0.0012 + TH)); } tube('gDark', st, 0.0007, wf, { n: 4, uv: [0.5, 0.5] });
        const sd = TOP + flapLen(0) - 0.020; dome('gBrass', F.at(0, sd, front(sd) + TH + 0.0010), F.N, 0.0075, 0.0050, wf); }
      // two loops of the same leather hold it on the belt: over the belt's top edge and down its front to the pouch
      for (const t of [-0.040, 0.040]) strap('gPouch', [[-0.004, -0.0020], [0.004, 0.0006], [BELT_HW, 0.0010], [TOP - 0.002, 0.0010], [TOP + 0.012, B0 + 0.004]].map(([d, n]) => ({ p: F.at(t, d, n), n: F.N, w: F.T })), 0.011, 0.0026, wf, PT, { out: F.at(t, 0.02, -0.02) });
      // ---- the scroll (A1, A3, F11, G1): rolled parchment about 27 cm long in a brown leather loop under the pouch, slanting, front end
      // higher. Its strap runs up behind the pouch to the belt, so it has its own bone on the same hinge and swings by itself; the pouch
      // rests on that strap (it can never hang nearer his leg than the scroll's strap does) ----
      addBone('scroll', 'hips', F.H.x, F.H.y, F.H.z); const ws = wOne('scroll'), SA = F.at(0.006, BOT - 0.004, B0 + 0.022);
      const SL = 16 * DEG, A = F.T.clone().multiplyScalar(Math.cos(SL)).addScaledVector(F.D, -Math.sin(SL)), Bv = F.D.clone().multiplyScalar(-Math.cos(SL)).addScaledVector(F.T, -Math.sin(SL)), R0 = 0.0235, C = SA.clone().addScaledVector(F.D, 0.038).addScaledVector(A, 0.050).addScaledVector(F.N, 0.004), s0 = -0.082, s1 = 0.182;
      // the roll: its radius grows a little once round, so the loose edge of the sheet shows as a step along it; the ends show the coil
      const coil = (s, r, a) => C.clone().addScaledVector(A, s).addScaledVector(Bv, r * Math.cos(a)).addScaledVector(F.N, r * Math.sin(a));
      { const NA = 26, NSg = 12, rings = [], rr = (j, s) => R0 * (1 + 0.10 * (j / NA)) * (1 + 0.025 * Math.sin(s * 70 + 1) + 0.03 * (s - s0) / (s1 - s0));
        const mk = (s, k) => { const r = []; for (let j = 0; j < NA; j++) r.push(coil(s, rr(j, s) * k, (j / NA) * TAU + 0.9)); return r; };
        rings.push(mk(s0 + 0.010, 0.30), mk(s0 + 0.006, 0.62), mk(s0 + 0.008, 0.66), mk(s0, 0.90), mk(s0, 1)); for (let i = 1; i < NSg; i++) rings.push(mk(lerp(s0, s1, i / NSg), 1)); rings.push(mk(s1, 1), mk(s1, 0.90), mk(s1 - 0.008, 0.66), mk(s1 - 0.006, 0.62), mk(s1 - 0.010, 0.30));
        solid('gParch', rings, ws, (p, i, j) => { const v = p.clone().sub(C); return [v.dot(A) / QT, (j / NA) * TAU * R0 / QT + v.dot(Bv) * 0.3 / QT]; }, { out: C }); }
      // the leather loop round its middle, and the strap that carries the loop up behind the pouch to the belt
      { const NA = 20, mk = (s, r) => { const rg = []; for (let j = 0; j < NA; j++) rg.push(coil(s, r, (j / NA) * TAU)); return rg; }, c0 = -0.030, rings = [mk(c0 - 0.022, R0 * 1.05), mk(c0 - 0.021, R0 * 1.19), mk(c0, R0 * 1.21), mk(c0 + 0.021, R0 * 1.19), mk(c0 + 0.022, R0 * 1.05)];
        solid('gPouch', rings, ws, (p, i, j) => [i * 0.2, j / NA * 1.4], { out: C.clone().addScaledVector(A, c0), capA: false, capB: false });
        const topOfLoop = C.clone().addScaledVector(A, c0).addScaledVector(Bv, R0 * 1.2).addScaledVector(F.N, -0.0013), tl = topOfLoop.clone().sub(F.H).dot(F.T);
        strap('gPouch', [F.at(tl, 0.004, 0.0003), F.at(tl, BELT_HW * 2, 0.0005), F.at(tl, BOT - 0.03, 0.0008), F.at(tl, BOT - 0.004, 0.006), topOfLoop].map((q) => ({ p: q, n: F.N, w: F.T })), 0.011, 0.0026, ws, PT, { out: F.at(tl, 0.08, -0.03) }); }
      const sH = hang({ bone: 'scroll', hinge: F.H.clone(), ez: F.N.clone(), L: 0.20, damp: 3.0, bMax: 0.07, kb: 3, aMax: 0.9, drive: 0.9, back: 0.0008, clear: 0.004, follow: true }); under(sH, -0.095, 0.20, BOT + 0.075);
      const pH = hang({ bone: 'pouch', hinge: F.H.clone(), ez: F.N.clone(), L: 0.115, damp: 3.4, bMax: 0.07, kb: 3, aMax: 1.0, drive: 0.9, back: B0, clear: 0.004, follow: true, restsOn: sH }); under(pH, -HW - 0.005, HW + 0.005, BOT + 0.01);
    }

    // ---- two charms on the second strap, between the ring and the pouch (A1, F11): a silver skull and a gold leaf, each on a small clip ----
    // A1 has the leaf nearer the ring and the skull further toward his right hip; they are in that order here (never swapped or mirrored).
    { const mk = (name, t, build) => { const sf = swagFrame(t), N = V3(sf.n.x, 0, sf.n.z).normalize(), T = V3().crossVectors(V3(0, 1, 0), N).normalize(), H = sf.p.clone().addScaledVector(sf.w, -0.0105).addScaledVector(sf.n, 0.0062), F = { H, T, N, D: V3(0, -1, 0), at: (a, d, n) => H.clone().addScaledVector(T, a).addScaledVector(V3(0, -1, 0), d).addScaledVector(N, n) };
        addBone(name, 'hips', H.x, H.y, H.z); const wf = wOne(name);
        torus('gSteel', F.at(0, -0.001, 0), N, V3(0, 1, 0), 0.0050, 0.0009, wf, { seg: 12, n: 5 });      // the clip through the strap
        torus('gSteel', F.at(0, 0.0085, 0.0005), T, V3(0, 1, 0), 0.0042, 0.0008, wf, { seg: 12, n: 5 }); torus('gSteel', F.at(0, 0.0150, 0.0005), N, V3(0, 1, 0), 0.0036, 0.0008, wf, { seg: 10, n: 5 });
        build(F, wf); const h = hang({ bone: name, hinge: H.clone(), ez: N, L: 0.034, damp: 2.4, bMax: 0.3, aMax: 1.0, drive: 0.8, back: 0.002, clear: 0.013, follow: true }); under(h, -0.035, 0.035, 0.068); };
      mk('charmS', 0.17, (F, wf) => { const c = F.at(0, 0.033, 0.0078);
        ball('gSteel', c, 0.0135, wf, { nu: 14, nv: 9, sq: [0.92, 1.0, 0.86], uv: [0.5, 0.5] });                                            // the skull's dome
        slab('gSteel', F, [[0.040, 0.0060, 0.0030, 0.0150], [0.044, 0.0082, 0.0022, 0.0172], [0.050, 0.0078, 0.0026, 0.0168], [0.0545, 0.0056, 0.0050, 0.0150]], wf, 1, { na: 10, pw: 0.7 });      // cheeks and jaw
        for (const sx of [-1, 1]) ball('gDark', F.at(sx * 0.0052, 0.0345, 0.0175), 0.0040, wf, { nu: 8, nv: 5, sq: [1, 1.1, 0.5], uv: [0.5, 0.5] });      // eye sockets
        ball('gDark', F.at(0, 0.0415, 0.0185), 0.0017, wf, { nu: 6, nv: 4, sq: [1, 1.5, 0.5], uv: [0.5, 0.5] });                         // the nose
        for (let k = -2; k <= 2; k++) tube('gDark', [F.at(k * 0.0024, 0.0465, 0.0170), F.at(k * 0.0024, 0.0530, 0.0158)], 0.0004, wf, { n: 3, uv: [0.5, 0.5] }); });      // lines between the teeth
      mk('charmL', 0.02, (F, wf) => {      // the leaf: a flat brass maple leaf with a raised middle vein, point down
        const OUT = [[0, 0.019], [0.005, 0.024], [0.0125, 0.0225], [0.010, 0.029], [0.0165, 0.0335], [0.0085, 0.0370], [0.0105, 0.0445], [0.0040, 0.0430], [0, 0.0545]], pts = OUT.concat(OUT.slice(1, -1).reverse().map(([a, d]) => [-a, d]));
        const pos = [], idx = [], uv = [], n = pts.length; for (const side of [1, -1]) { const base = pos.length / 3; pos.push(...F.at(0, 0.036, 0.0030 + side * 0.0016).toArray()); uv.push(0.5, 0.5); for (const [a, d] of pts) { pos.push(...F.at(a, d, 0.0030 + side * 0.0003).toArray()); uv.push(0.5, 0.5); } for (let j = 0; j < n; j++) { const a = base + 1 + j, b = base + 1 + (j + 1) % n; if (side > 0) idx.push(base, a, b); else idx.push(base, b, a); } }
        addPart('gLeaf', { pos, uv, idx }, wf, {}); tube('gLeaf', [F.at(0, 0.0185, 0.003), F.at(0, 0.052, 0.0048)], 0.0007, wf, { n: 4, uv: [0.5, 0.5] }); });
    }

    // ---- the dagger, on his LEFT hip (A1, A3, G2): a dark brown sheath hanging straight down his thigh from a black hanger with brass
    // studs; only the black grip, the short steel guard and the round pommel show above the sheath ----
    { const u = 0.655, F = hingeAt(u, beltY(u) + BELT_HW * 0.92, BELT_OUT); addBone('dagger', 'hips', F.H.x, F.H.y, F.H.z); const wf = wOne('dagger'), NB = 0.0125;
      strap('gBelt', [[-0.004, -0.0020], [0.004, 0.0006], [2 * BELT_HW, 0.0010], [0.085, 0.0030], [0.150, 0.0040]].map(([d, n]) => ({ p: F.at(0, d, n), n: F.N, w: F.T })), (k) => lerp(0.017, 0.024, sm(0.3, 0.8, k)), 0.0028, wf, BT, { out: F.at(0, 0.05, -0.02) });
      for (const [t, d] of [[-0.010, 0.012], [0.010, 0.012], [-0.010, 0.036], [0.010, 0.036]]) dome('gBrass', F.at(t, d, 0.0036), F.N, 0.0028, 0.0018, wf);
      const G0 = 0.004, G1 = 0.090, TIP = 0.318;
      ball('gSteel', F.at(0, G0, NB), 0.0105, wf, { nu: 12, nv: 8, uv: [0.5, 0.5] });                                                    // pommel
      { const pts = [], rr = []; for (let i = 0; i <= 16; i++) { const k = i / 16; pts.push(F.at(0, lerp(G0 + 0.008, G1 - 0.004, k), NB)); rr.push([0.0098 * (1 + 0.10 * Math.sin(k * PI)) * (1 + 0.05 * Math.cos(i * PI)), 0.0082 * (1 + 0.10 * Math.sin(k * PI)) * (1 + 0.05 * Math.cos(i * PI))]); } const part = loft(tubeRings(pts, rr, 10, F.T), { capA: true, capB: true }); addPart('gDark', flatUV(part, 0.5, 0.5), wf, { out: F.at(0, 0.05, NB) }); }      // the grip, wrapped in black leather (ribs)
      slab('gSteel', F, [[G1 - 0.0045, 0.030, NB - 0.0045, NB + 0.0045], [G1 - 0.003, 0.033, NB - 0.0055, NB + 0.0055], [G1 + 0.003, 0.033, NB - 0.0055, NB + 0.0055], [G1 + 0.0045, 0.030, NB - 0.0045, NB + 0.0045]], wf, 1, { na: 12, pw: 0.6 });      // the guard
      const shw = (k) => lerp(0.0225, 0.0050, Math.pow(k, 1.7)), sth = (k) => lerp(0.0075, 0.0030, k), rowsS = []; for (let i = 0; i <= 12; i++) { const k = i / 12, d = lerp(G1 + 0.006, TIP, k), e = i === 0 || i === 12 ? 0.6 : 1; rowsS.push([d, shw(k) * e, NB - sth(k) * e, NB + sth(k) * e]); }
      slab('gPouch', F, rowsS, wf, PT, { na: 14, pw: 0.75 });                                                                             // the sheath
      for (const [d0, d1] of [[G1 + 0.008, G1 + 0.030], [G1 + 0.058, G1 + 0.074]]) { const k0 = (d0 - G1) / (TIP - G1), k1 = (d1 - G1) / (TIP - G1); slab('gBelt', F, [[d0, shw(k0) + 0.0012, NB - sth(k0) - 0.0006, NB + sth(k0) + 0.0006], [d0 + 0.001, shw(k0) + 0.0022, NB - sth(k0) - 0.0016, NB + sth(k0) + 0.0016], [d1 - 0.001, shw(k1) + 0.0022, NB - sth(k1) - 0.0016, NB + sth(k1) + 0.0016], [d1, shw(k1) + 0.0012, NB - sth(k1) - 0.0006, NB + sth(k1) + 0.0006]], wf, BT, { na: 14, pw: 0.75 }); for (const sx of [-1, 1]) dome('gBrass', F.at(sx * (shw(k0) - 0.006), (d0 + d1) / 2, NB + sth(k0) + 0.0016), F.N, 0.0024, 0.0016, wf); }
      ball('gBrass', F.at(0, TIP + 0.002, NB), 0.0052, wf, { nu: 8, nv: 6, sq: [1, 1.3, 0.7], uv: [0.5, 0.5] });                           // the sheath's metal tip
      const dH = hang({ bone: 'dagger', hinge: F.H.clone(), ez: F.N.clone(), L: 0.17, damp: 3.2, bMax: 0.14, kb: 2.5, aMax: 0.9, drive: 0.9, back: 0.003, clear: 0.004, follow: true }); under(dH, -0.035, 0.035, TIP + 0.01);
    }

    // =====================================================================================================================
    // HOW THE HANGING THINGS MOVE (the Ranger's method, R45_gear.js "how the hanging things move").
    // Each is a weight on a hinge with two angles: a, out from his body about the hinge's own line, and b, along it. Gravity pulls it in;
    // it cannot come nearer than its floor (what his thigh allows this frame); the movement of the hinge sets it swinging.
    // A frame is cut into steps of 8 ms or less and is never taken longer than 0.05 s; every angle and speed is clamped, so nothing can
    // fly off after a jump of the clock, and the same frames give the same result on every run. After pose() or play(name, true) it is
    // laid to rest at once. The hat's point is two soft springs that lean against the movement of his head and come back.
    // =====================================================================================================================
    const _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _a = V3(), _e = V3();
    let on = true;
    // a hanging thing. hinge: where it hangs from (as he rests); ex: the hinge's line; ez: out from his body; L: how far below the hinge its
    // weight is; pts: points of his cloth under it, each with how much it follows the thigh; back: how far its back stands out from the hinge
    function hang(o) { const h = Object.assign({ parent: 'hips', th0: 0, damp: 3.0, kb: 1, bMax: 0.5, aMax: 1.2, drive: 1, back: 0, clear: 0.002, pts: null, a: 0, b: 0, va: 0, vb: 0, pw: null, pv: null }, o); if (!o.ex) h.ex = V3().crossVectors(V3(0, 1, 0), h.ez).normalize(); HANG.push(h); return h; }      // ex = up x ez, so a positive angle a always swings the thing out along ez
    const _pi = new THREE.Matrix4(), _bm = {}, _h = V3();
    // a resting point carried by bones (list: bone, share, bone, share ...) exactly as a mesh's point is, seen from the thing's parent bone
    const carry = (p, w, par, out) => { out.set(0, 0, 0); for (let j = 0; j < w.length; j += 2) out.addScaledVector(_w.copy(p).sub(bones[w[j]].userData.rest).applyMatrix4(_bm[w[j]]), w[j + 1]); return out.add(par.userData.rest); };
    // The lowest angle a thing may hang at this frame. First its hinge is put where the belt is now (the belt lies on his corset and
    // trousers and moves a little with his waist and thigh; h.follow), then every point of cloth under it is found where it is now, and the
    // thing's back is kept clear of all of them.
    const floorOf = (h) => {
      if (!h.pts || !h.pts.length) return 0;
      const par = SK[h.parent]; let a = 0; _pi.copy(par.matrixWorld).invert();
      for (const b of h.used) (_bm[b] || (_bm[b] = new THREE.Matrix4())).multiplyMatrices(_pi, bones[b].matrixWorld);
      if (h.follow) { carry(h.hinge, h.hw, par, _h); SK[h.bone].position.copy(_h).sub(par.userData.rest); } else _h.copy(h.hinge);
      for (const q of h.pts) { carry(q.p, q.w, par, _v).sub(_h); const dn = -_v.y; if (dn < 0.012) continue; a = Math.max(a, Math.atan2(_v.dot(h.ez) - h.back + h.clear, dn)); }
      if (h.restsOn) a = Math.max(a, h.restsOn.a - 0.01);
      return Math.min(a, h.aMax);
    };
    function under(h, t0, t1, depth) { h.pts = clothUnder(h.hinge, h.ex, h.ez, t0, t1, depth); h.hw = unit(wTrouser(h.hinge.x, h.hinge.y - 0.02, h.hinge.z)); h.used = []; for (const w of h.pts.map((q) => q.w).concat([h.hw])) for (let j = 0; j < w.length; j += 2) if (h.used.indexOf(w[j]) < 0) h.used.push(w[j]); }
    const apply = (h) => { const b = SK[h.bone]; b.quaternion.setFromAxisAngle(h.ex, -h.a).multiply(_q.setFromAxisAngle(h.ez, h.b)); b.updateMatrix(); b.matrixWorld.multiplyMatrices(b.parent.matrixWorld, b.matrix); };
    const settle = () => {
      for (const h of HANG) { h.a = floorOf(h); h.b = 0; h.va = 0; h.vb = 0; h.pw = null; h.pv = null; apply(h); }
      for (const s of SPRING) { s.x = 0; s.z = 0; s.vx = 0; s.vz = 0; s.pw = null; s.pv = null; SK[s.bone].quaternion.identity(); }
    };
    // how fast the hinge is speeding up, in its parent's own directions (from where it was the last two frames)
    const accel = (o, bone, dt) => { bone.getWorldPosition(_w); _a.set(0, 0, 0); if (o.pw) { _v.copy(_w).sub(o.pw).multiplyScalar(1 / dt); if (o.pv) { _a.copy(_v).sub(o.pv).multiplyScalar(1 / dt); const l = _a.length(); if (l > 1e-9) { _m.copy(bone.parent.matrixWorld).invert(); _a.transformDirection(_m).multiplyScalar(Math.min(l, 30)); } } (o.pv || (o.pv = V3())).copy(_v); } (o.pw || (o.pw = V3())).copy(_w); return _a; };
    // one frame. jump: pose(), a switch, or the first frame: everything is laid to rest inside this call
    const step = (dt, jump) => {
      if (jump) { settle(); return; }
      if (!on || !(dt > 0)) return;
      dt = Math.min(dt, 0.05); const n = Math.ceil(dt / 0.008), st = dt / n;
      for (const h of HANG) {
        const ac = accel(h, SK[h.bone], dt), ia = -ac.dot(h.ez) / h.L * h.drive, ib = -ac.dot(h.ex) / h.L * h.drive, lo = floorOf(h), w2 = 9.8 / h.L;
        for (let k = 0; k < n; k++) {
          h.va += (-w2 * Math.sin(h.a + h.th0) - h.damp * h.va + ia) * st; h.va = cl(h.va, -9, 9); h.a += h.va * st;
          if (h.a < lo) { h.a = lo; if (h.va < 0) h.va *= -0.10; h.vb *= Math.max(0, 1 - 8 * st); }
          if (h.a > h.aMax) { h.a = h.aMax; if (h.va > 0) h.va = 0; }
          h.vb += (-w2 * h.kb * Math.sin(h.b) - h.damp * h.vb + ib) * st; h.vb = cl(h.vb, -9, 9); h.b = cl(h.b + h.vb * st, -h.bMax, h.bMax);
        }
        apply(h);
      }
      for (const s of SPRING) {
        const ac = accel(s, SK[s.bone], dt), ax = ac.x, az = ac.z;
        // x, z: how far the point leans (radians) toward his left and forward; pushed the other way by the hinge's own speeding up
        for (let k = 0; k < n; k++) { s.vx += (-s.k * s.x - s.damp * s.vx - s.gain * ax) * st; s.vz += (-s.k * s.z - s.damp * s.vz - s.gain * az) * st; s.x = cl(s.x + s.vx * st, -s.max, s.max); s.z = cl(s.z + s.vz * st, -s.max, s.max); }
        SK[s.bone].quaternion.setFromAxisAngle(_e.set(0, 0, 1), -s.x).multiply(_q.setFromAxisAngle(_e.set(1, 0, 0), s.z));
      }
    };
    const kick = () => { HANG.forEach((h, i) => { h.va += h.kickA || 2.4; h.vb += (i % 2 ? 1 : -1) * (h.kickB || 1.2); }); for (const s of SPRING) s.vx += 1.2; };
    return { HANG, SPRING, SHADE, step, settle, kick, set on(v) { on = !!v; }, get on() { return on; } };
  })();
