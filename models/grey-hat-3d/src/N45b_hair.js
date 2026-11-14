  // ---------- his hair, remade (stage 4): a scalp cap, locks from the parting to past his shoulders, and chains that let it swing ----------
  // Chris: "his ear is printed on his hair", "the hair is one piece and has clothing and face printed on it". The old shell (N41_hair.js) is
  // kept only for the "Old hair" button. This hair wears nothing but pictures of hair strands drawn here (hairTexN, hairAlphaN).
  // The method is Io's (models/io/src/I41_hair.js: tresses, a plain sheet under them, chains) on the Fox's plan (a cap on the scalp, a body
  // of hair, many separate locks over it). What is his own: the locks start at a middle parting and are led round his ears.
  //   hairCap   a thin shell on his scalp from the hairline back, so no skull shows between locks
  //   hairMass  a plain dark sheet inside the hanging hair, narrower and shorter than the locks, so nothing shows between them
  //   hair      the locks you see: wavy ribbons of strands with pointed tips (a hard cut-out, nothing blended)
  //   hairIn    the same, the layers underneath, a shade darker
  // Measured (tools/hair_measure.py; C4 is 2000 px to the metre by his pupils and by eye to lip):
  //   top of his hair 1.78 m; hairline 1.733 at the middle, 1.71 at the corners 5.5 cm out, then down the temple to the top of the ear
  //   half-width of the hair seen from the front (H_ENV, first number), how far back it reaches in profile (second), by height
  //   it ends about 1.465 m at the front of his shoulders and 1.41 at the middle of his back (C4 profile, C12)
  //   colours, dark to light, from C12
  const HAIR = (() => {
    let hseed = 40417; const hrnd = () => (hseed = (hseed * 16807) % 2147483647) / 2147483647, hrr = (a, b) => a + (b - a) * hrnd();      // its own dice, so nothing else shifts
    const COLS = ['#251915', '#34231d', '#422c25', '#53382e', '#6e472e', '#8a5a35'];      // the first four are C12's own; the two lightest are its lightest made a little warmer, for the sun-caught strands C4 shows
    const ZC = -0.025, Y_REL = HC.y;                    // the hanging hair is placed round an upright line through the middle of his neck; above Y_REL it lies on his head
    const H_ENV = [[1.40, [0.060, -0.118]], [1.42, [0.085, -0.129]], [1.44, [0.100, -0.139]], [1.46, [0.114, -0.140]], [1.48, [0.122, -0.144]], [1.50, [0.125, -0.146]], [1.52, [0.128, -0.147]], [1.54, [0.120, -0.141]],
      [1.56, [0.121, -0.140]], [1.58, [0.117, -0.142]], [1.60, [0.112, -0.137]], [1.62, [0.112, -0.138]], [1.64, [0.106, -0.136]], [1.66, [0.106, -0.132]], [1.68, [0.099, -0.131]], [1.70, [0.095, -0.122]], [1.72, [0.083, -0.115]]];
    // how far round from the middle of his back the hair reaches on each side, in degrees, by height: wide below his ears (it comes forward
    // onto the front of his shoulders), drawn back behind each ear, forward again above the ear to the hairline at his temple
    const H_OPEN = [[1.38, 50], [1.42, 62], [1.45, 80], [1.47, 96], [1.50, 106], [1.555, 108], [1.585, 98], [1.607, 82], [1.634, 70], [1.652, 76], [1.668, 92], [1.680, 110], [1.692, 121]];
    const openAt = (y) => spline(H_OPEN, cl(y, 1.38, 1.692)) * DEG;
    // ---- what the hair lies on: how far out his head, neck, collar and shoulders reach from that upright line, by height and direction ----
    const RY0 = 1.36, RDY = 0.005, RNY = 70, RNA = 91, RDA = TAU / (RNA - 1), RIN_T = new Float32Array(RNY * RNA), CLEAR = 0.024;      // CLEAR: the shirt and its collar over the doll's skin
    const NECK_T = [[1.455, [0.0640, 0.0260, -0.0960]], [1.480, [0.0600, 0.0330, -0.0900]], [1.505, [0.0575, 0.0400, -0.0850]], [1.530, [0.0560, 0.0450, -0.0800]], [1.555, [0.0550, 0.0480, -0.0770]], [1.580, [0.0545, 0.0470, -0.0750]], [1.610, [0.0540, 0.0400, -0.0730]]];
    const rayEll = (sx, sz, cz, rx, rzF, rzB) => { let a = 0, b = 0.4; for (let it = 0; it < 18; it++) { const m = (a + b) / 2, x = m * sx, z = ZC + m * sz - cz, rz = z >= 0 ? rzF : rzB; if ((x * x) / (rx * rx) + (z * z) / (rz * rz) < 1) a = m; else b = m; } return a; };
    for (let iy = 0; iy < RNY; iy++) {
      const y = RY0 + iy * RDY, row = new Float32Array(RNA);
      if (y > 1.555 && y < HC.y + HR.yT) {              // his head: one ring of it at this height, sorted into directions
        const yn = (y - HC.y) / (y >= HC.y ? HR.yT : HR.yB), ph = Math.acos(cl(yn, -1, 1));
        for (let k = 0; k < 360; k++) { const p = headPoint(-PI + (k + 0.5) / 360 * TAU, ph), an = Math.atan2(p[0], -(p[2] - ZC)), r = Math.hypot(p[0], p[2] - ZC), f = (an + PI) / RDA, i0 = Math.round(f); if (r > row[i0]) row[i0] = r; }
        row[0] = row[RNA - 1] = Math.max(row[0], row[RNA - 1]);
        for (let q = 0; q < 3; q++) for (let i = 0; i < RNA; i++) if (!row[i]) row[i] = Math.max(row[(i + RNA - 1) % RNA], row[(i + 1) % RNA]);      // a direction no sample fell in takes its neighbour's
      }
      for (let ia = 0; ia < RNA; ia++) {
        const an = -PI + ia * RDA, sx = Math.sin(an), sz = -Math.cos(an); let r = row[ia];
        if (y > 1.455 && y < 1.61) { const v = spline(NECK_T, y); r = Math.max(r, rayEll(sx, sz, (v[1] + v[2]) / 2, v[0], (v[1] - v[2]) / 2, (v[1] - v[2]) / 2)); }
        if (y > 1.468 && y < 1.524) r = Math.max(r, rayEll(sx, sz, -0.027, 0.075, 0.074, 0.074));      // the standing band of his collar
        if (y < 1.56) { let q = 0.26; while (q > 0.02 && DOLL.F(q * sx, y, ZC + q * sz) - CLEAR > 0) q -= 0.006; if (q > 0.02) { let a = q, b = q + 0.006; for (let it = 0; it < 5; it++) { const m = (a + b) / 2; if (DOLL.F(m * sx, y, ZC + m * sz) - CLEAR < 0) a = m; else b = m; } r = Math.max(r, a); } }
        RIN_T[iy * RNA + ia] = r;
      }
    }
    const rIn = (y, an) => { const fy = cl((y - RY0) / RDY, 0, RNY - 1.001), fa = cl((an + PI) / RDA, 0, RNA - 1.001), iy = Math.floor(fy), ia = Math.floor(fa), u = fy - iy, v = fa - ia, T = RIN_T; return lerp(lerp(T[iy * RNA + ia], T[iy * RNA + ia + 1], v), lerp(T[(iy + 1) * RNA + ia], T[(iy + 1) * RNA + ia + 1], v), u); };
    // the outside of the hair as C4 has it (never mirrored: it is a little fuller on his right). B1, the whole figure, paints his hair bigger
    // than C4 does: 3 cm wider each side below his ears and 6 cm longer at the back (to 1.35 m). C4 is the closer study and decides the top,
    // the hairline and the sides of his head; below his ears the hair is built part of the way toward B1 (B1_WIDE, endY).
    const B1_WIDE = 0.010;
    const rOut = (y, an) => { const v = spline(H_ENV, cl(y, 1.40, 1.72)).slice(); v[0] += B1_WIDE * sm(1.64, 1.54, y);
      const s = Math.sin(an), c = Math.cos(an), e = 2 / 2.3, x = v[0] * (s < 0 ? 1.04 : 0.96) * Math.pow(Math.abs(s), e), z = c >= 0 ? (ZC - v[1]) * Math.pow(c, e) : 0.055 * Math.pow(-c, e); return Math.hypot(x, z); };
    // where a lock lies at a height: f is its place round him (-1 the front edge on his right, 0 the middle of his back, 1 the front edge on
    // his left), lam its layer (0 next to him, 1 the outside of the hair). The waves of the outermost locks reach the measured outline.
    const lockR = (y, an, lam) => { const ri = rIn(y, an) + 0.004; return ri + lam * Math.max(0.014, rOut(y, an) - 0.005 - ri); };
    let inFull = false;                                 // the under layers stop a little short of the front edge so the outer locks wrap round them; the front-edge locks (below) do not
    const inK = (lam) => (inFull || lam >= 0.85 ? 1 : 0.86), lockPt = (y, f, lam, rMax) => { const an = f * openAt(y) * inK(lam), r = Math.min(lockR(y, an, lam), rMax == null ? 9 : rMax); return V3(r * Math.sin(an), y, ZC - r * Math.cos(an)); };
    // ---- the chains his hanging hair swings on (stepped by HAIRSIM, below). Nine round him, each from just above his ear down past the tips ----
    const CH_F = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1], CH_Y = [1.665, 1.608, 1.551, 1.494, 1.437, 1.380], chains = [];
    CH_F.forEach((f, j) => {
      const pts = []; let rp = 9; for (const y of CH_Y) { const p = lockPt(y, f, 0.6, rp + 0.012); rp = Math.hypot(p.x, p.z - ZC); pts.push(p); }
      const names = []; let par = 'head'; for (let k = 0; k < pts.length - 1; k++) { const nm = 'hair' + j + '_' + k; addBone(nm, par, pts[k].x, pts[k].y, pts[k].z); names.push(nm); par = nm; }
      chains.push({ f, names, pts });
    });
    // which bones carry a point of hair at a height (Io's chainW): the stretch of chain it lies on, shared with the next near each joint
    const chainW = (ch, y) => {
      const n = ch.names.length; if (y >= CH_Y[0]) return [BI.head, 1];
      let k = 0; while (k < n - 1 && y < CH_Y[k + 1]) k++;
      const t = (CH_Y[k] - y) / (CH_Y[k] - CH_Y[k + 1]);
      if (t < 0.5) return [k > 0 ? BI[ch.names[k - 1]] : BI.head, 0.5 - t, BI[ch.names[k]], 0.5 + t];
      if (k === n - 1) return [BI[ch.names[k]], 1];
      return [BI[ch.names[k]], 1.5 - t, BI[ch.names[k + 1]], t - 0.5];
    };
    const mixW = (a, b, f) => {
      const m = new Map(); for (let i = 0; i < a.length; i += 2) m.set(a[i], (m.get(a[i]) || 0) + a[i + 1] * (1 - f)); for (let i = 0; i < b.length; i += 2) m.set(b[i], (m.get(b[i]) || 0) + b[i + 1] * f);
      const l = []; m.forEach((w, bi) => { if (w > 1e-4) l.push([bi, w]); }); l.sort((p, q) => q[1] - p[1]); const out = []; for (const [bi, w] of l.slice(0, 4)) out.push(bi, w); return out;
    };
    const wLock = (f) => { const g = cl((f + 1) / 0.25, 0, CH_F.length - 1 - 1e-6), j = Math.floor(g); return (x, y) => (y >= CH_Y[0] ? [BI.head, 1] : mixW(chainW(chains[j], y), chainW(chains[j + 1], y), g - j)); };
    // ---- one lock: a flat wavy ribbon of strands along a middle line (Io's tress). nor: which way is away from him at each point ----
    // shade: every point carries how dark it is (its own list, 'hshade'): the edges and the underside of a ribbon, its root, and the layers
    // underneath are darker, which is what makes overlapping locks read as separate.
    const SHADE = {}; let lockN = 0;
    function lock(key, mid, nor, o) {
      const n = mid.length, len = [0]; for (let i = 1; i < n; i++) len.push(len[i - 1] + mid[i].distanceTo(mid[i - 1]));
      const L = len[n - 1], NC = 6, rings = [], vs = [], q1 = o.ph * 1.7, q2 = o.ph * 0.9, T0 = 1 - (o.wisp || 0.16), sh = SHADE[key] || (SHADE[key] = []);
      for (let k = 0; k < n; k++) {
        const P = mid[k].clone(), s = len[k], t = s / L, a = mid[Math.max(0, k - 1)], b = mid[Math.min(n - 1, k + 1)], T = V3(b.x - a.x, b.y - a.y, b.z - a.z).normalize();
        const N = nor[k].clone(); N.addScaledVector(T, -N.dot(T)).normalize(); const Bv = V3().crossVectors(T, N);
        const env = sm(o.w0 || 0.02, (o.w0 || 0.02) + 0.12, s) * (1 - 0.25 * sm(0.8, 1, t)) * (0.78 + 0.22 * Math.sin(s * 11 + q1)), ph = o.ph + (s / o.lam) * TAU + 0.7 * Math.sin(s * 6.5 + q2) + 0.2 * Math.sin(s * 17 + q1);
        P.addScaledVector(Bv, o.amp * env * Math.sin(ph) + (o.sway || 0) * t * t).addScaledVector(N, o.amp * 0.45 * env * (0.5 + 0.5 * Math.cos(ph + 0.9)));
        const tau = 0.55 * env * Math.cos(ph), ct = Math.cos(tau), st = Math.sin(tau), wd = o.w * (0.35 + 0.65 * sm(0.0, 0.06, s)) * (1 - (1 - (o.tip == null ? 0.3 : o.tip)) * Math.pow(t, 2.2)), th = o.th * (0.5 + 0.5 * sm(0, 0.05, s)) * (1 - 0.5 * t), ring = [];
        for (let j = 0; j < NC; j++) { const an = (j / NC) * TAU, cx = Math.cos(an) * wd, cy = Math.sin(an) * th; ring.push([P.x + (Bv.x * ct + N.x * st) * cx + (N.x * ct - Bv.x * st) * cy, P.y + (Bv.y * ct + N.y * st) * cx + (N.y * ct - Bv.y * st) * cy, P.z + (Bv.z * ct + N.z * st) * cx + (N.z * ct - Bv.z * st) * cy]); }
        rings.push(ring); vs.push(t < T0 ? 0.5 * t / T0 : 0.5 + 0.5 * (t - T0) / (1 - T0));
        const base = (o.dark || 1) * (0.80 + 0.20 * sm(0.0, 0.10, s)) * (0.82 + 0.30 * env * Math.sin(ph + 0.6));      // darker at the root and down in each wave
        const eK = 0.05 + 0.23 * sm(0.03, 0.12, s);      // on top of his head the locks lie side by side as one surface, so their edges are hardly darker there
        for (let j = 0; j <= NC; j++) { const an = (j / NC) * TAU, edge = Math.abs(Math.cos(an)), under = Math.max(0, -Math.sin(an)); sh.push(base * (1 - eK * edge * edge) * (1 - 0.40 * under)); }
      }
      const part = loft(rings, { v: vs }); lockN++;
      const u0 = o.u == null ? 0.0917 * lockN : o.u;
      for (let i = 0; i < part.uv.length; i += 2) part.uv[i] = part.uv[i] * 0.055 + u0;      // each lock takes a narrow strip of the strand picture. Locks side by side take strips side by side (o.u), so the lighter streaks run across several locks, as C4 paints them, and no lock is a block of another colour
      // Which way its skin faces is worked out here, from every triangle and the middle of the ring it belongs to. (addPart's own
      // test, a point inside his head, got it wrong for the locks on his left: their light came from underneath, and the two halves of his
      // head were two colours, split at the parting.)
      const pp = part.pos, vx = (q, c) => pp[q * 3 + c], cens = rings.map((ring) => { const c = [0, 0, 0]; for (const q of ring) for (let d = 0; d < 3; d++) c[d] += q[d] / NC; return c; }); let faces = 0;
      for (let tI = 0; tI < part.idx.length; tI += 3) {
        const ia = part.idx[tI], ib = part.idx[tI + 1], ic = part.idx[tI + 2], cen = cens[Math.floor(Math.min(ia, ib, ic) / (NC + 1))];
        const gx = (vx(ib, 1) - vx(ia, 1)) * (vx(ic, 2) - vx(ia, 2)) - (vx(ib, 2) - vx(ia, 2)) * (vx(ic, 1) - vx(ia, 1)), gy = (vx(ib, 2) - vx(ia, 2)) * (vx(ic, 0) - vx(ia, 0)) - (vx(ib, 0) - vx(ia, 0)) * (vx(ic, 2) - vx(ia, 2)), gz = (vx(ib, 0) - vx(ia, 0)) * (vx(ic, 1) - vx(ia, 1)) - (vx(ib, 1) - vx(ia, 1)) * (vx(ic, 0) - vx(ia, 0));
        faces += gx * ((vx(ia, 0) + vx(ib, 0) + vx(ic, 0)) / 3 - cen[0]) + gy * ((vx(ia, 1) + vx(ib, 1) + vx(ic, 1)) / 3 - cen[1]) + gz * ((vx(ia, 2) + vx(ib, 2) + vx(ic, 2)) / 3 - cen[2]);
      }
      addPart(key, part, o.wf, { flip: faces < 0 });
    }
    // ---- the middle line of a lock ----
    // The locks of the middle of his back (mer) run another way: from a root on the back of his crown straight down the back of his head,
    // their roots at different heights so the higher ones lie over the roots of the lower ones.
    // On his head a side lock runs from the parting out over the side: a curve on his skull grown a little, starting square to the parting and
    // sweeping back as it comes down (C4's profile: the hair from his forehead runs back at about 45 degrees to behind his ear). Its root
    // is on the parting: the front-edge lock at the hairline, the locks further round the back further along it, and the locks of the
    // middle of his back all at the crown, where the parting ends (C12 from above). b0: how far down that curve the lock starts
    // (0 at the parting; the under layers start lower, hidden by the layer above). Below Y_REL it hangs by height (lockPt).
    const Z_FRONT = 0.84, Z_CROWN = -0.45, Z_NAPE = -0.86, F_FAN = 0.30, STEP = 0.0085, TOP_LIFT = 0.016;      // TOP_LIFT: C4 has the top of his hair 2 cm above his skull
    function lockLine(f, lam, b0, yEnd, lift, crown, face) {
      const s = f < 0 ? -1 : 1, af = Math.abs(f), E = lockPt(Y_REL, f, lam), ze = E.z - HC.z, rzE = ze >= 0 ? HR.zF : HR.zB, kE = Math.max(1.02, Math.hypot(E.x / HR.x, ze / rzE)), zhE = cl(ze / (kE * rzE), -0.999, 0.999);
      const mer = crown != null || af <= F_FAN, th0 = crown != null ? crown : hrr(0.50, 1.05), psi = f * openAt(Y_REL) * inK(lam);
      const zh0 = af <= F_FAN ? Z_CROWN : lerp(Z_CROWN, Z_FRONT, Math.pow((af - F_FAN) / (1 - F_FAN), 0.85)), pts = [], nor = [], hold = lerp(1.5, 3.2, sm(0.45, 0.95, af)), lf = TOP_LIFT * (0.35 + 0.65 * lam) * (1 - 0.8 * sm(0.70, 1, af)) * (mer ? 0.5 : 1) + (lift || 0);      // less lift down the back of his head, where C4's profile has the hair close to his skull
      const headAt = (t) => { const be = t * PI / 2, th = lerp(th0, PI / 2, t), zh = mer ? -Math.sin(th) * Math.cos(psi) : lerp(zh0, zhE, Math.pow(t, hold)), q = Math.sqrt(Math.max(0, 1 - zh * zh)), k = lerp(1 + 0.003 / HR.x, kE, Math.pow(t, 1.6)), rz = zh >= 0 ? HR.zF : HR.zB, ux = mer ? Math.sin(th) * Math.sin(psi) : s * q * Math.sin(be), uy = mer ? Math.cos(th) : q * Math.cos(be), up = lf * (1 - Math.pow(t, 1.3)), nn = Math.hypot(ux / HR.x, uy / HR.yT, zh / rz) || 1;
        return V3(k * HR.x * ux + up * ux / HR.x / nn, HC.y + k * HR.yT * uy + up * uy / HR.yT / nn, HC.z + k * rz * zh + up * zh / rz / nn); };
      { let t = b0, p = headAt(t); pts.push(p); while (t < 1) { let dt = 0.02, q = headAt(Math.min(1, t + dt)); const d = q.distanceTo(p); dt *= STEP / Math.max(d, 1e-5); t = Math.min(1, t + dt); p = headAt(t); pts.push(p); } }
      for (const p of pts) nor.push(V3(p.x - HC.x, (p.y - HC.y) * 1.2, p.z - HC.z).normalize());
      let rp = Math.hypot(E.x, E.z - ZC), y = Y_REL, lie = Math.floor(hrr(0, 1.99));
      while (y > yEnd) {
        y = Math.max(yEnd, y - STEP * 0.92); const an = f * openAt(y) * inK(lam), want = lockR(y, an, lam);
        if (want > rp + 0.013 && y < 1.52) { if (lie-- <= 0) break; rp = Math.min(want, rp + 0.016); }      // the lock has come down onto his shoulder: it lies on it for a little way and ends there
        else rp = Math.min(want, rp + 0.013); pts.push(V3(rp * Math.sin(an), y, ZC - rp * Math.cos(an))); nor.push(face ? V3(0.5 * Math.sin(an) + s * 0.9 * Math.cos(an), 0.1, -0.5 * Math.cos(an) + s * 0.9 * Math.sin(an)).normalize() : V3(Math.sin(an), 0.15, -Math.cos(an)).normalize());
      }
      for (let q = 0; q < 3; q++) for (let i = 1; i < pts.length - 1; i++) { pts[i].x = (pts[i - 1].x + 2 * pts[i].x + pts[i + 1].x) / 4; pts[i].z = (pts[i - 1].z + 2 * pts[i].z + pts[i + 1].z) / 4; }
      return { pts, nor };
    }
    const endY = (f) => lerp(1.468, 1.385, 1 - Math.pow(Math.abs(f), 1.4));       // the tips: on the front of his shoulders at the sides, a hand lower at the middle of his back
    // (The phase of a lock's waves and its strip of the strand picture go by how far round it is from the middle of his back, the same on
    // both sides. By the signed place, one half of his head came out darker than the other, split at the parting.)
    function buildLocks() {
      // [layer (0 next to him .. 1 outside), how many each side, how far down from the parting they start, which shade]
      const LAYERS = [[0.30, 14, 0.80, 'hairIn', 0.62], [0.62, 17, 0.42, 'hairIn', 0.78], [1.00, 26, 0.0, 'hair', 1.0]];
      for (const [lam, cnt, b0, key, dark] of LAYERS) for (const s of [-1, 1]) for (let k = 0; k < cnt; k++) {
        const top = lam >= 1, f = s * (top ? Math.pow((k + 0.5 + (k > 0 && k < cnt - 1 ? hrr(-0.3, 0.3) : 0)) / cnt, 0.92) : cl((k + 0.5 + hrr(-0.35, 0.35)) / cnt, 0.03, 0.97));
        const yE = endY(f) + hrr(-0.018, 0.030) + (top ? 0 : 0.015), L = lockLine(f, lam * hrr(0.90, 1.0), top ? 0.0 : b0 + hrr(-0.12, 0.12), yE, top ? hrr(0, 0.004) : 0);
        if (L.pts.length < 6) continue;
        lock(key, L.pts, L.nor, { w: hrr(0.0115, 0.0165) * (top && k >= cnt - 2 ? 1.25 : 1), th: 0.0045, amp: hrr(0.010, 0.0145), lam: hrr(0.092, 0.108), ph: Math.abs(f) * 2.2 + lam * 1.3 + hrr(0, 0.9), tip: 0.25, sway: hrr(-0.006, 0.006), wisp: hrr(0.14, 0.22), w0: top ? 0.02 : 0.0, dark, u: 0.5 + Math.abs(f) * 0.23 + lam * 0.37 + hrr(-0.025, 0.025), wf: wLock(f) });
      }
      // the front edge of the hair, beside his cheeks and jaw: seen from the front you look at the edge of the whole thickness of hair,
      // so a few locks hang there at every depth, turned to face forward (without them only the dark under layers showed from the front)
      for (const s of [-1, 1]) for (const lam of [0.22, 0.42, 0.62, 0.82]) {
        inFull = true; const f = s * hrr(0.985, 1.0), L = lockLine(f, lam, hrr(0.45, 0.7), endY(f) + hrr(-0.01, 0.03), 0, null, true); inFull = false;
        if (L.pts.length < 6) continue;
        lock('hair', L.pts, L.nor, { w: hrr(0.012, 0.016), th: 0.0045, amp: hrr(0.007, 0.010), lam: hrr(0.088, 0.108), ph: Math.abs(f) * 2.2 + lam * 1.3 + hrr(0, 1.5), tip: 0.25, sway: 0, wisp: hrr(0.14, 0.22), w0: 0.0, dark: 0.92, u: 0.5 + Math.abs(f) * 0.23 + lam * 0.37 + hrr(-0.025, 0.025), wf: wLock(f) });
      }
    }
    // ---- the cap on his scalp: his skull grown by a few millimetres from the crown down to the hairline, thinning to nothing there ----
    // hairLine(a): how far down from the crown (as an angle) the hair starts, for each direction round his head (0 the front). From C4:
    // 1.733 m at the middle of his forehead, the corners at 1.71, then down the temple to the top of the ear, over it, and down behind it.
    const H_LINE = [[0, 0.90], [0.45, 0.94], [0.74, 1.27], [1.02, 1.56], [1.17, 1.67], [1.36, 1.73], [1.60, 1.73], [1.90, 1.84], [2.20, 2.25], [PI, 2.38]];
    const hairLine = (a) => spline(H_LINE, Math.abs(a)) + 0.02 * Math.sin(a * 11) * sm(1.3, 0.3, Math.abs(a));
    function buildCap() {
      const NU = Q(96, 48), NR = Q(30, 16), rings = [], vs = [], sh = SHADE.hairCap = [];
      for (let i = 0; i <= NR; i++) {
        const ring = [], t = i / NR;
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, ph = lerp(0.03, hairLine(a > PI ? a - TAU : a), t), rip = 0.0012 * Math.sin(j * 1.9 + i * 0.6) + 0.0010 * Math.sin(j * 0.63 + 1.1); ring.push(headPoint(a, ph, (0.0030 + 0.0050 * sm(0.95, 0.30, ph) + rip * 0.6) * (1 - 0.85 * sm(0.72, 1, t)))); }
        rings.push(ring); vs.push(t < 0.86 ? 0.5 * t / 0.86 : 0.5 + 0.30 * (t - 0.86) / 0.14);      // its last few millimetres are cut into strand tips, so the hairline is not a hard line
        for (let j = 0; j <= NU; j++) sh.push(0.62);
      }
      addPart('hairCap', loft(rings, { capA: true, uS: 9, v: vs }), wHead, { out: HC }); sh.push(0.62);
    }
    // ---- the plain dark sheet inside the hanging hair (Io: narrower than the locks, or its edge shows as a band) ----
    function buildMass() {
      const NU = Q(40, 20), NY = Q(30, 16), rings = [], vs = [], sh = SHADE.hairMass = [], fs = [];
      for (let j = 0; j <= NU; j++) fs.push(lerp(-0.90, 0.90, j / NU));
      const cols = fs.map((f) => { const c = [], yb = endY(f) + 0.045; let rp = 9; for (let i = 0; i <= NY; i++) { const y = lerp(1.700, yb, i / NY), an = f * openAt(y), r = Math.min(lockR(y, an, 0.45), rp + 0.012); rp = r; c.push([r * Math.sin(an), y, ZC - r * Math.cos(an)]); } return c; });
      for (let i = 0; i <= NY; i++) { rings.push(cols.map((c) => c[i])); vs.push(i / NY < 0.8 ? 0.5 * (i / NY) / 0.8 : 0.5 + 0.35 * (i / NY - 0.8) / 0.2); for (let j = 0; j <= NU; j++) sh.push(0.55); }
      const wc = fs.map((f) => wLock(f));
      addPart('hairMass', loft(rings, { open: true, uS: 4, v: vs }), (x, y, z, i) => wc[i % (NU + 1)](x, y), { out: V3(0, 1.55, ZC) });
    }
    // the crown: where the parting ends, a few locks run from it straight over the back of his head and down the middle of his back, over
    // the roots of the locks beside them (without these the scalp cap showed there as a bare oval)
    function buildCrown() {
      for (const [f, zh] of [[-0.035, 0.36], [0.05, 0.30], [-0.12, 0.33], [0.14, 0.38], [-0.21, 0.40], [0.23, 0.34], [0.0, 0.52], [-0.08, 0.56], [0.09, 0.60]]) {
        const L = lockLine(f, 1, 0, endY(f) + hrr(-0.018, 0.03), 0.0035, zh);
        lock('hair', L.pts, L.nor, { w: hrr(0.014, 0.018), th: 0.0045, amp: hrr(0.010, 0.0145), lam: hrr(0.092, 0.108), ph: Math.abs(f) * 2.2 + 1.3 + hrr(0, 0.9), tip: 0.25, sway: hrr(-0.006, 0.006), wisp: hrr(0.14, 0.22), w0: 0.09, dark: 1, u: 0.5 + Math.abs(f) * 0.23 + 0.37 + hrr(-0.025, 0.025), wf: wLock(f) });
      }
    }
    buildCap(); buildMass(); buildLocks(); buildCrown();
    return { chains, CH_Y, CH_F, SHADE, COLS, rIn, rOut, lockPt, openAt, hairLine, ZC, get locks() { return lockN; } };
  })();
  // ---- the pictures his hair wears: strands in his own browns with lighter streaks, and where a lock has hair (pointed tips) ----
  // As Io's (I21_tex.js): strands run up the picture; across it the mix drifts from mostly dark to mostly light and back, so a lock that
  // takes one narrow strip of it is a dark lock or a lighter one.
  function hairTexN(cols, bump) {
    const W = 2048, H = 512, c = cvs(W, H), g = c.getContext('2d'); let sd = 7193; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = bump ? '#606060' : cols[0]; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) {
      const x = r() * W, u = x / W, light = Math.pow(0.5 + 0.5 * Math.sin(u * TAU * 5 + 0.7 + 0.9 * Math.sin(u * TAU * 3)), 1.6), k = r() * 0.78 + light * 0.38, ci = k < 0.30 ? 0 : k < 0.52 ? 1 : k < 0.74 ? 2 : k < 0.94 ? 3 : k < 1.14 ? 4 : 5, a = 0.30 + 0.50 * r();
      g.strokeStyle = bump ? 'rgba(' + (r() < 0.5 ? '255,255,255' : '0,0,0') + ',' + (0.25 + 0.4 * r()) + ')' : rgba(cols[ci], a); g.lineWidth = 0.7 + 3.2 * r() * r();
      const wob = 6 * (r() - 0.5); g.beginPath(); g.moveTo(x, -4); g.bezierCurveTo(x + wob, H * 0.33, x - wob, H * 0.66, x, H + 4); g.stroke();
    }
    const t = ctex(c, 0, 0, !bump); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  function hairAlphaN() {
    const W = 2048, H = 512, c = cvs(W, H), g = c.getContext('2d'); let sd = 4409; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, H * 0.5, W, H * 0.5);
    for (let i = 0; i < 1000; i++) {                // each strand narrows to a point, so a lock ends in fine tips and not in a row of square teeth
      const x = r() * W, top = H * (1 - (0.56 + 0.44 * Math.pow(r(), 0.8))), w = 5 + 10 * r(), lean = 14 * (r() - 0.5), y0 = H * 0.52, ym = (y0 + top) / 2;
      g.beginPath(); g.moveTo(x - w / 2, y0); g.quadraticCurveTo(x - w * 0.42 + lean * 0.4, ym, x + lean, top); g.quadraticCurveTo(x + w * 0.42 + lean * 0.4, ym, x + w / 2, y0); g.closePath(); g.fill();
    }
    const t = ctex(c); t.wrapS = THREE.RepeatWrapping; t.encoding = THREE.LinearEncoding; return t;
  }

  // ---------- how his hair moves ----------
  // Io's soft chains (models/io/src/I99_static.js, softStep), in his own space like his cloth. Each chain hangs from his head. A joint is
  // pulled toward where it would rest: the way it was built, turned with his head, leaning toward plain hanging the further down it is
  // (so a nod or a tilt does not lift the tips: they hang; a turn of the head takes them round). It keeps most of its speed, so it lags
  // and swings in after. Then it is put back at its fixed length from the joint above, pushed out of balls on his neck, shoulders, chest
  // and back, and held within a short leash of its resting place, so it can never cover his face or fly off after a jump of the clock.
  // A ball never pushes a joint out of its place at rest, so standing still he looks exactly as built. Sixty steps a second whatever the
  // frame rate, at most four a frame; pose() and jumps settle it at once. The speed a joint keeps from step to step is capped at V_MAX, so nothing is flung. The same on every run. api.setCloth(false) freezes it too.
  const HAIRSIM = (() => {
    const H = 1 / 60, V_MAX = 0.012, COL = [], S = [], inv = new THREE.Matrix4(), mb = new THREE.Matrix4(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qc = new THREE.Quaternion();
    const _c = V3(), _t = V3(), _n = V3(), _d = V3(), _p = V3(), _t2 = V3(), AY = V3(0, 1, 0);
    let acc = 0, ready = false, on = true, made = false;
    const ball = (bone, x, y, z, r) => COL.push({ bone: SK[bone], off: V3(x, y, z).sub(SK[bone].userData.rest), rest: V3(x, y, z), r, p: V3() });
    function make() {
      made = true;
      ball('head', HC.x, HC.y - 0.01, HC.z, 0.086); ball('head', 0, 1.60, -0.02, 0.070);
      ball('neck', 0, 1.555, -0.018, 0.062); ball('neck', 0, 1.505, -0.026, 0.074);
      for (const s of [-1, 1]) { ball('spine3', s * 0.075, 1.425, -0.030, 0.090); ball('spine3', s * 0.150, 1.415, -0.025, 0.078); ball('spine3', s * 0.070, 1.400, 0.030, 0.090); ball('uarm' + (s < 0 ? 'R' : 'L'), s * 0.205, 1.400, -0.015, 0.068); }
      ball('spine3', 0, 1.380, -0.020, 0.115);
      for (const ch of HAIR.chains) {
        const n = ch.names.length, o = { b: ch.names.map((nm) => SK[nm]), dir: [], len: [], cur: [], prev: [], g: [], k: [], d: [], leash: [], cols: [], P: V3(), Q: new THREE.Quaternion(), Y: new THREE.Quaternion() };
        for (let i = 0; i < n; i++) {
          const tip = ch.pts[i + 1], v = tip.clone().sub(ch.pts[i]), t = n > 1 ? i / (n - 1) : 0; o.len.push(v.length()); o.dir.push(v.normalize()); o.cur.push(tip.clone()); o.prev.push(tip.clone());
          o.k.push(lerp(0.100, 0.050, t)); o.d.push(lerp(0.24, 0.17, t)); o.g.push(lerp(0.15, 0.80, t)); o.leash.push(lerp(0.020, 0.060, t));
          const cs = []; COL.forEach((c, ci) => { const r = Math.min(c.r + 0.010, tip.distanceTo(c.rest) - 0.003); if (r > 0.014) cs.push(ci, r); }); o.cols.push(cs);
        }
        S.push(o);
      }
    }
    const fitLen = (p, c, L) => { p.sub(c); p.multiplyScalar(L / (p.length() || 1e-6)).add(c); };
    function frames() {
      root.updateMatrixWorld(true); inv.copy(root.matrixWorld).invert();
      for (const c of COL) c.p.copy(c.off).applyMatrix4(c.bone.matrixWorld).applyMatrix4(inv);
      mb.multiplyMatrices(inv, SK.head.matrixWorld); qa.setFromRotationMatrix(mb); _p.set(0, 0, 1).applyQuaternion(qa); qb.setFromAxisAngle(AY, Math.atan2(_p.x, _p.z));
      for (const o of S) { o.Q.copy(qa); o.Y.copy(qb); o.P.copy(o.b[0].position).applyMatrix4(mb); }
    }
    function target(o, i, c, out) { const g = o.g[i]; out.copy(o.dir[i]).applyQuaternion(o.Q).multiplyScalar(1 - g); _t2.copy(o.dir[i]).applyQuaternion(o.Y).multiplyScalar(g); out.add(_t2); return out.normalize().multiplyScalar(o.len[i]).add(c); }
    function stepOnce(still) {
      for (const o of S) { _c.copy(o.P);
        for (let i = 0; i < o.b.length; i++) { const cur = o.cur[i], prev = o.prev[i], L = o.len[i];
          target(o, i, _c, _t);
          if (still) _n.copy(_t); else { _n.copy(cur).sub(prev).multiplyScalar(1 - o.d[i]); const sp = _n.length(); if (sp > V_MAX) _n.multiplyScalar(V_MAX / sp); _n.add(cur); _d.copy(_t).sub(cur).multiplyScalar(o.k[i]); _n.add(_d); _d.copy(_n).sub(_t); const far = _d.length(); if (far > o.leash[i]) _n.copy(_t).addScaledVector(_d, o.leash[i] / far); }
          fitLen(_n, _c, L);
          const cs = o.cols[i]; let hit = false;
          for (let j = 0; j < cs.length; j += 2) { const c = COL[cs[j]], r = cs[j + 1]; _d.copy(_n).sub(c.p); const dist = _d.length(); if (dist < r) { _n.copy(c.p).addScaledVector(_d, r / (dist || 1e-6)); hit = true; } }
          if (hit) fitLen(_n, _c, L);
          if (still) prev.copy(_n); else if (hit) prev.copy(cur).lerp(_n, 0.6); else prev.copy(cur);      // a joint pushed out of a ball keeps less than half its speed, or the push flings it
          cur.copy(_n); _c.copy(cur);
        } }
    }
    function apply() {
      for (const o of S) { _c.copy(o.P); qa.copy(o.Q);
        for (let i = 0; i < o.b.length; i++) { _d.copy(o.cur[i]).sub(_c).normalize(); qb.copy(qa).invert(); _d.applyQuaternion(qb); qc.setFromUnitVectors(o.dir[i], _d); o.b[i].quaternion.copy(qc); qa.multiply(qc); _c.copy(o.cur[i]); } }
    }
    // one frame. jump: the first frame, pose(), or a switch: the hair is hung afresh and left to settle inside this call
    function step(dt, jump) {
      if (!made) make();
      frames();
      if (!ready || jump || !on) { for (let i = 0; i < (on ? 24 : 2); i++) stepOnce(true); ready = true; acc = 0; }
      else { acc += cl(dt, 0, 0.05); let n = 0; while (acc >= H && n < 4) { acc -= H; n++; stepOnce(false); } if (acc > H) acc = 0; }
      apply();
    }
    // a meter for the tools: how far the joints are from where they would rest, and how deep in the balls (both in millimetres)
    function meter() { let far = 0, deep = -99; frames(); for (const o of S) { _c.copy(o.P); for (let i = 0; i < o.b.length; i++) { target(o, i, _c, _t); far = Math.max(far, _t.distanceTo(o.cur[i])); const cs = o.cols[i]; for (let q = 0; q < cs.length; q += 2) deep = Math.max(deep, cs[q + 1] - o.cur[i].distanceTo(COL[cs[q]].p)); _c.copy(o.cur[i]); } } return [Math.round(far * 1e4) / 10, Math.round(deep * 1e4) / 10]; }
    function sum() { let s = 0; for (const o of S) for (const p of o.cur) s += p.x + 2 * p.y + 3 * p.z; return s; }
    return { step, meter, sum, S, COL, get on() { return on; }, set on(v) { on = !!v; ready = false; } };
  })();
