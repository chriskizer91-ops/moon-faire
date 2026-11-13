  // ---------- her belts, satchel, pouch and strap hooks as real objects (stage five) ----------
  // Sizes and places are read off A1 (front, 898 px a metre), A2 (back) and A3 (sides); the leather is cut from F6 (bake_gear_r.py).
  //   Belts: two, 2.2 cm wide. Each lies in a tilted plane round her hips. A (ring buckle, front right) is high on her right hip and low on
  //   her left; B (square buckle, front left) is the other way. They cross at the middle, front and back, 96 cm up. In A1 they run from
  //   103 cm at the high hip to 92 cm at the low one: a slope of 0.38.
  //   Satchel: 20 cm across, 19 tall, 6.5 deep at the foot. It hangs by two loops from belt A on her right hip, a little forward of her side.
  //   Pouch: 9.3 cm across, 14 tall. It hangs from belt B behind her left hip.
  //   Strap hooks: where each shoulder strap comes over, front and back (133 and 134 cm up, 11.5 cm out): a brass buckle and two black
  //   iron curls, each curl 2.6 cm across and 3.9 tall, in rod 6 mm thick.
  (function buildGear() {
    if (!BAKED || !BAKED.gearLayout) return;
    const GL = BAKED.gearLayout, P3 = (a) => V3(a[0], a[1], a[2]), wHip = () => [BI.hips, 1];
    const gUV = (name, px, py) => { const L = GL[name]; return [(L[0] + (px - L[4]) / (L[6] - L[4]) * L[2]) / 1024, 1 - (L[1] + (py - L[5]) / (L[7] - L[5]) * L[3]) / 1024]; };
    // the surface of her body and the way it faces
    const surf = (u, y) => { const p = P3(rTorso(u, y)), du = P3(rTorso(u + 0.003, y)).sub(P3(rTorso(u - 0.003, y))), dv = P3(rTorso(u, y + 0.004)).sub(P3(rTorso(u, y - 0.004))), n = du.cross(dv).normalize(); if (n.x * p.x + n.z * (p.z + 0.02) < 0) n.negate(); return { p, n }; };
    const onBody = (p, lift) => { const e = surf(rTorsoU(p.x, p.y, p.z), p.y); return e.p.addScaledVector(e.n, lift); };
    // small builders
    const tube = (key, pts, r, wf, closed) => { const P = closed ? pts.concat([pts[0].clone()]) : pts, c = P.reduce((a, p) => a.add(p), V3()).multiplyScalar(1 / P.length); addPart(key, loft(tubeRings(P, P.map((p, i) => (typeof r === 'function' ? r(i / (P.length - 1)) : r)), 7), closed ? {} : { capA: true, capB: true }), wf, { out: c }); };
    const dome = (key, c, n, r, h, wf) => { const t1 = (Math.abs(n.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0)).cross(n).normalize(), t2 = V3().crossVectors(n, t1), rings = [];
      for (let i = 0; i <= 4; i++) { const ph = (i / 4) * PI / 2 * 0.96, ring = []; for (let j = 0; j < 9; j++) { const a = (j / 9) * TAU; ring.push(c.clone().addScaledVector(t1, r * Math.cos(ph) * Math.cos(a)).addScaledVector(t2, r * Math.cos(ph) * Math.sin(a)).addScaledVector(n, h * Math.sin(ph)).toArray()); } rings.push(ring); }
      addPart(key, loft(rings, { capB: true }), wf, { out: c.clone().addScaledVector(n, -0.002) }); };
    const roundRect = (c, t, w, a, b, rc, n) => { const pts = []; for (let k = 0; k < 4; k++) { const sx = k === 0 || k === 3 ? 1 : -1, sy = k < 2 ? 1 : -1, cx0 = sx * (a - rc), cy0 = sy * (b - rc); for (let j = 0; j <= n; j++) { const ang = (k + j / n) * PI / 2; pts.push(c.clone().addScaledVector(t, cx0 + rc * Math.cos(ang)).addScaledVector(w, cy0 + rc * Math.sin(ang))); } } return pts; };

    // ---- the two belts ----
    const BELT = { hw: 0.012, th: 0.0036, off: 0.0018, y0: 0.962, k: 0.38 };
    const beltPt = (sgn, u) => { let y = BELT.y0; for (let i = 0; i < 7; i++) y = BELT.y0 + sgn * BELT.k * rTorso(u, y)[0]; return surf(u, y); };
    const mkBelt = (sgn, over) => {
      const N = Q(220, 120), F = [];
      for (let i = 0; i < N; i++) F.push(beltPt(sgn, i / N));
      let L = 0; const Ls = [0];
      for (let i = 0; i < N; i++) {
        const a = F[(i + N - 1) % N].p, b = F[(i + 1) % N].p, e = F[i]; e.t = b.clone().sub(a).normalize(); e.n.addScaledVector(e.t, -e.n.dot(e.t)).normalize(); e.w = V3().crossVectors(e.n, e.t); if (e.w.y < 0) e.w.negate();
        e.off = BELT.off + (over ? (BELT.th + 0.0007) * sm(0.070, 0.034, Math.abs(e.p.x)) : 0);       // where the belts cross, this one lies on top
        L += e.p.distanceTo(F[(i + 1) % N].p); Ls.push(L);
      }
      const nT = Math.round(L / ((BAKED.beltPitch || 0.0204) * BELT.hw / 0.011)), pitch = L / nT, r = 0.0014, VV = [0.06, 0.02, 0.07, 0.93, 0.98, 0.94], rings = [];
      const sect = (e) => { const b = e.p.clone().addScaledVector(e.n, e.off), q = (s, d) => b.clone().addScaledVector(e.w, s).addScaledVector(e.n, d).toArray(); return [q(-BELT.hw + r, 0), q(-BELT.hw, BELT.th / 2), q(-BELT.hw + r, BELT.th), q(BELT.hw - r, BELT.th), q(BELT.hw, BELT.th / 2), q(BELT.hw - r, 0)]; };
      for (let i = 0; i <= N; i++) rings.push(sect(F[i % N]));
      const part = loft(rings);
      for (let i = 0; i <= N; i++) for (let j = 0; j <= 6; j++) { part.uv[(i * 7 + j) * 2] = Ls[i] / pitch; part.uv[(i * 7 + j) * 2 + 1] = VV[j % 6]; }
      addPart('belt', part, (x, y, z) => wTorso(x, y, z), { out: V3(0, BELT.y0, -0.02) });
      const at = (s) => { s = ((s % L) + L) % L; let i = 0; while (i < N - 1 && Ls[i + 1] < s) i++; const f = (s - Ls[i]) / (Ls[i + 1] - Ls[i]), a = F[i], b = F[(i + 1) % N];
        return { p: a.p.clone().lerp(b.p, f), n: a.n.clone().lerp(b.n, f).normalize(), t: a.t.clone().lerp(b.t, f).normalize(), w: a.w.clone().lerp(b.w, f).normalize(), off: lerp(a.off, b.off, f), s }; };
      const sOfX = (x, front) => { let best = 0, bd = 1e9; for (let i = 0; i < N; i++) { const p = F[i].p; if ((p.z > -0.02) !== front) continue; const dd = Math.abs(p.x - x); if (dd < bd) { bd = dd; best = i; } } return Ls[best]; };
      const sOfU = (u) => Ls[Math.round((((u % 1) + 1) % 1) * N) % N];
      const above = (O, ex, X, s0) => { let bs = s0, bd = 1e9; for (let k = -160; k <= 160; k++) { const s = s0 + k * 0.0012, d = Math.abs(at(s).p.clone().sub(O).dot(ex) - X); if (d < bd) { bd = d; bs = s; } } return at(bs); };
      return { F, L, Ls, pitch, nT, at, sOfX, sOfU, sgn, above };
    };
    const beltA = mkBelt(-1, false), beltB = mkBelt(1, true);
    const studs = (B, skip) => { for (let k = 0; k < B.nT; k++) { const s = (k + 0.5) * B.pitch; if (skip.some(([c, d]) => Math.abs(((s - c + B.L * 1.5) % B.L) - B.L / 2) < d)) continue; const e = B.at(s); dome('steel', e.p.clone().addScaledVector(e.n, e.off + BELT.th - 0.0002), e.n, 0.0029, 0.0019, (x, y, z) => wTorso(x, y, z)); } };
    const keeper = (B, s, key, more) => { const rings = []; for (const ds of [-0.004, 0.004]) { const e = B.at(s + ds), b = e.p.clone().addScaledVector(e.n, e.off - 0.0004), hw = BELT.hw + 0.0013, th = BELT.th + 0.0018 + (more || 0), q = (a, d) => b.clone().addScaledVector(e.w, a).addScaledVector(e.n, d).toArray(); rings.push([q(-hw, 0), q(-hw, th), q(hw, th), q(hw, 0)]); }
      const part = loft(rings, { capA: true, capB: true }), uv0 = gUV('plain', 960, 800); for (let i = 0; i < part.uv.length / 2; i++) { part.uv[i * 2] = uv0[0] + 0.02 * ((i % 5) / 5); part.uv[i * 2 + 1] = uv0[1] + 0.01 * (i % 2); }
      addPart(key || 'gear', part, (x, y, z) => wTorso(x, y, z), { out: B.at(s).p }); };
    // the end of a belt past its buckle: a second layer lying on the belt, with a round tip and punched holes
    const tail = (B, s0, dir, len) => { const n = Q(22, 12), rows = [], hwT = BELT.hw - 0.0005, tip = 0.013, wf = (x, y, z) => wTorso(x, y, z);
      for (let i = 0; i <= n; i++) { const d = len * i / n, e = B.at(s0 + dir * d), k = d > len - tip ? Math.sqrt(Math.max(0.0004, 1 - Math.pow((d - (len - tip)) / tip, 2))) : 1, c = e.p.clone().addScaledVector(e.n, e.off + BELT.th), row = [];
        for (const q of [-1, -0.86, 0, 0.86, 1]) row.push(c.clone().addScaledVector(e.w, q * hwT * k * dir).addScaledVector(e.n, Math.abs(q) === 1 ? 0.0006 : BELT.th * (i === n ? 0.5 : 1)).toArray());
        rows.push(row); }
      const part = loft(rows, { open: true });
      for (let i = 0; i <= n; i++) for (let j = 0; j < 5; j++) { const tw = (len * i / n) / B.pitch * 0.5, tri = Math.abs(((tw % 1) + 1) % 1 - 0.5) * 2; part.uv[(i * 5 + j) * 2] = 0.80 + 0.40 * tri; part.uv[(i * 5 + j) * 2 + 1] = [0.05, 0.10, 0.5, 0.90, 0.95][dir > 0 ? j : 4 - j]; }
      addPart('belt', part, wf, { out: B.at(s0 + dir * len / 2).p });
      for (let d = 0.034; d < len - 0.012; d += 0.024) { const e = B.at(s0 + dir * d); dome('beltHole', e.p.clone().addScaledVector(e.n, e.off + BELT.th * 2 + 0.0001), e.n, 0.0019, 0.0003, wf); } };
    // belt A: a ring buckle at her front right, with its prong
    { const s = beltA.sOfX(-0.077, true), e = beltA.at(s), c = e.p.clone().addScaledVector(e.n, e.off + BELT.th * 2 + 0.0022), ring = [];
      for (let j = 0; j < 24; j++) { const a = (j / 24) * TAU; ring.push(c.clone().addScaledVector(e.t, 0.0140 * Math.cos(a)).addScaledVector(e.w, 0.0152 * Math.sin(a))); }
      tube('steel', ring, 0.0024, (x, y, z) => wTorso(x, y, z), true);
      tube('steel', [c.clone().addScaledVector(e.t, -0.0140).addScaledVector(e.n, 0.0012), c.clone().addScaledVector(e.n, 0.0024), c.clone().addScaledVector(e.t, 0.0138).addScaledVector(e.n, 0.0014)], 0.0015, (x, y, z) => wTorso(x, y, z));
      keeper(beltA, s + 0.027, null, BELT.th); tail(beltA, s - 0.012, 1, 0.050); beltA.buckle = s; }
    // belt B: a square buckle at her front left
    { const s = beltB.sOfX(0.090, true), e = beltB.at(s), c = e.p.clone().addScaledVector(e.n, e.off + BELT.th * 2 + 0.0020);
      tube('steel', roundRect(c, e.t, e.w, 0.0150, 0.0160, 0.0038, 4), 0.0022, (x, y, z) => wTorso(x, y, z), true);
      tube('steel', [c.clone().addScaledVector(e.t, 0.0150).addScaledVector(e.n, 0.0010), c.clone().addScaledVector(e.n, 0.0022), c.clone().addScaledVector(e.t, -0.0147).addScaledVector(e.n, 0.0012)], 0.0015, (x, y, z) => wTorso(x, y, z));
      keeper(beltB, s + 0.034, 'keeperB'); tail(beltB, s + 0.012, -1, 0.114); beltB.buckle = s; }

    // ---- satchel and pouch: each built to its painting in F6 and wearing it ----
    // S: the painting's numbers in F6 pixels. f: front view (left, right, top, bottom), b: back view, sd: side view (front edge, back edge, top, bottom).
    const bag = (S, B, uAnchor, drop) => {
      const sAnchor = B.sOfU(uAnchor);
      const m = S.W / (S.f[1] - S.f[0]), cxF = (S.f[0] + S.f[1]) / 2, H = (S.f[3] - S.f[2]) * m, hw0 = S.W / 2, rc = S.rc * m;
      // It hangs from the belt like a hinge: gravity swings it in until its back rests on her hip, and it turns until both halves touch.
      const e = B.at(sAnchor), UP = V3(0, 1, 0), nh = V3(e.n.x, 0, e.n.z).normalize(), hinge = e.p.clone().addScaledVector(nh, e.off + BELT.th + 0.0022);
      const body = []; for (let i = 0; i <= 80; i++) for (let j = 0; j <= 30; j++) body.push(P3(rTorso(uAnchor - 0.19 + 0.38 * i / 80, hinge.y - drop - 0.004 - (H + 0.004) * j / 30)));
      for (let j = 0; j <= 6; j++) for (const p of legRing(hinge.x < 0 ? -1 : 1, lerp(0.845, 0.775, j / 6), 1.04, 30)) body.push(P3(p));
      const lean = (yaw) => { const z0 = nh.clone().applyAxisAngle(UP, yaw), x0 = V3().crossVectors(UP, z0); let a = -1, b = -1;
        for (const p of body) { const d = p.clone().sub(hinge), X = d.dot(x0), Yd = d.y; if (Math.abs(X) > hw0 * 0.94 || Yd > -drop - 0.004 || Yd < -drop - H) continue; const t = Math.atan2(d.dot(z0), -Yd); if (X < 0) a = Math.max(a, t); else b = Math.max(b, t); }
        return [a, b, z0, x0]; };
      let best = null; for (let k = -30; k <= 30; k++) { const r = lean(k * 0.02); if (r[0] < -0.9 || r[1] < -0.9) continue; const sc = Math.abs(r[0] - r[1]) + 0.15 * Math.abs(k * 0.02); if (!best || sc < best.sc) best = { sc, r, yaw: k * 0.02 }; }
      const th = Math.min(S.maxLean || 0.2, Math.max(0, Math.max(best.r[0], best.r[1]) - (S.sink || 0.004) / (H * 0.6))), ez0 = best.r[2], ex = best.r[3];
      { let push = 0; const tn = Math.tan(th);       // where she is rounder than that lean allows, the loop lets it stand off the belt instead
        for (const p of body) { const d = p.clone().sub(hinge), X = d.dot(ex), Yd = d.y; if (Math.abs(X) > hw0 * 0.94 || Yd > -drop - 0.004 || Yd < -drop - H) continue; push = Math.max(push, d.dot(ez0) + Yd * tn - (S.sink || 0.004)); }
        hinge.addScaledVector(ez0, push); }
      const ey = UP.clone().multiplyScalar(Math.cos(th)).addScaledVector(ez0, -Math.sin(th)), ez = ez0.clone().multiplyScalar(Math.cos(th)).addScaledVector(UP, Math.sin(th));
      const O = hinge.clone().addScaledVector(ey, -drop);
      if (typeof window !== 'undefined') (window.__gear = window.__gear || {})[S.name] = { yaw: best.yaw, lean: th, O: O.toArray(), ex: ex.toArray(), ez: ez.toArray(), box: [[-hw0, 0, 0], [hw0, 0, 0], [-hw0, -H, 0], [hw0, -H, 0], [-hw0, 0, S.D[1]], [hw0, 0, S.D[1]], [-hw0, -H, S.D[0]], [hw0, -H, S.D[0]]].map(([X, Y, Z]) => O.clone().addScaledVector(ex, X).addScaledVector(ey, Y).addScaledVector(ez, Z).toArray()) };
      const W3 = (X, Y, Z) => O.clone().addScaledVector(ex, X).addScaledVector(ey, Y).addScaledVector(ez, Z), A = (X, Y, Z) => W3(X, Y, Z).toArray();
      const halfW = (Y) => { const h = Y + H; return h < rc ? hw0 - rc + Math.sqrt(Math.max(0, rc * rc - (rc - h) * (rc - h))) : hw0; };
      const depth = (Y) => lerp(S.D[0], S.D[1], cl((Y + H) / H, 0, 1)) * (0.55 + 0.45 * Math.sqrt(sm(0, 0.03, Y + H)));
      const zF = (X, Y) => depth(Y) * (1 - 0.10 * Math.pow(X / hw0, 2)) * (1 - 0.30 * sm(0.80, 1.0, Math.abs(X) / Math.max(1e-6, halfW(Y))));
      // the painted bag has round shoulders: near its top the picture is read a little narrower, so no background comes in at the corners
      const uvF = (X, Y) => { const py = S.f[2] - Y / m; return gUV(S.name + 'Front', cxF + (X / m) * 0.975 * lerp(S.topK, 1, sm(S.f[2] - 5, S.f[2] + S.topR, py)), py); }, inside = W3(0, -H / 2, S.D[0] / 2);
      const sheet = (rows, uvs, key) => { const part = loft(rows, { open: true }); for (let i = 0; i < uvs.length; i++) { part.uv[i * 2] = uvs[i][0]; part.uv[i * 2 + 1] = uvs[i][1]; } addPart(key || 'gear', part, wHip, { out: inside }); };
      const NX = Q(14, 8), NY = Q(16, 9);
      // back and front
      { const rb = [], ub = [], rf = [], uf = [], cxB = (S.b[0] + S.b[1]) / 2, mB = S.W / (S.b[1] - S.b[0]);
        for (let i = 0; i <= NY; i++) { const Y = -H * i / NY, hw = halfW(Y), r1 = [], r2 = [];
          for (let j = 0; j <= NX; j++) { const X = lerp(-hw, hw, j / NX); r1.push(A(X, Y, 0)); ub.push(S.b.length ? gUV(S.name + 'Back', cxB - X / mB, S.b[2] + (-Y / H) * (S.b[3] - S.b[2])) : gUV('plain', 900 + 150 * (j / NX), 730 + 170 * (i / NY))); r2.push(A(X, Y, zF(X, Y))); uf.push(uvF(X, Y)); }
          rb.push(r1); rf.push(r2); }
        sheet(rb, ub); sheet(rf, uf); }
      // the strip between them, down one side, across the foot and up the other
      { const path = [], n1 = Q(8, 5), n2 = Q(7, 4);
        for (let i = 0; i <= n1; i++) path.push([-hw0, lerp(0, -H + rc, i / n1)]);
        for (let i = 1; i <= n2; i++) { const a = (i / n2) * PI / 2; path.push([-hw0 + rc - rc * Math.cos(a), -H + rc - rc * Math.sin(a)]); }
        for (let i = 1; i <= n2; i++) { const a = (i / n2) * PI / 2; path.push([hw0 - rc + rc * Math.sin(a), -H + rc - rc * Math.cos(a)]); }
        for (let i = 1; i <= n1; i++) path.push([hw0, lerp(-H + rc, 0, i / n1)]);
        const rows = [], uvs = [];
        for (const [X, Y] of path) { const zf = zF(X, Y), row = []; for (let k = 0; k <= 3; k++) { const Z = zf * k / 3, bow = 0.004 * Math.sin(PI * k / 3) * Math.sign(X) * sm(0.6, 1, Math.abs(X) / hw0); row.push(A(X + bow, Y, Z));
            uvs.push(S.sd.length ? gUV(S.name + 'Side', S.sd[1] - (Z / S.D[0]) * (S.sd[1] - S.sd[0]), S.sd[2] + cl(-Y / H, 0, 1) * (S.sd[3] - S.sd[2])) : gUV('plain', 900 + 150 * (k / 3), 730 + 170 * cl(-Y / H, 0, 1))); } rows.push(row); }
        sheet(rows, uvs); }
      // the flap: from the back, over the top and down the front to its curved edge, standing a little proud
      { const hwF = hw0 + 0.002, fe = (X) => -(S.flap[0] - 0.5 * (S.flap[0] - S.flap[1]) * 2 * Math.pow(sm(0.74, 1.0, Math.abs(X) / hwF), 1.6) - S.f[2]) * m;       // how far down the flap comes at X
        const NTOP = 6, NF = Q(9, 6), rows = [], uvs = [];
        const col = (X) => { const zt = zF(X, 0), pts = [[-0.012, -0.0022], [0.003, -0.0018], [0.0085, 0.004], [0.0105, zt * 0.5], [0.0075, zt + 0.001], [0.0, zt + 0.0048]].map(([Y, Z]) => [X, Y, Z, 0]), end = fe(X); for (let i = 1; i <= NF; i++) { const Y = end * i / NF; pts.push([X, Y, zF(X, Y) + 0.0048, 1]); } return pts; };
        const cols = []; for (let j = 0; j <= NX; j++) cols.push(col(lerp(-hwF, hwF, j / NX)));
        for (let i = 0; i < cols[0].length; i++) { const row = []; for (let j = 0; j <= NX; j++) { const [X, Y, Z, fr] = cols[j][i]; row.push(A(X, Y, Z)); let arc = 0; if (!fr) for (let k = i; k < NTOP - 1; k++) arc += Math.hypot(cols[j][k + 1][1] - cols[j][k][1], cols[j][k + 1][2] - cols[j][k][2]); uvs.push(fr ? uvF(X * hw0 / hwF, Y) : uvF(X * hw0 / hwF, -0.0015 - 0.55 * arc)); } rows.push(row); }
        sheet(rows, uvs);
        const edge = [], eu = []; for (let i = NTOP - 1; i < cols[0].length; i++) edge.push(cols[0][i]); for (let j = 1; j <= NX; j++) edge.push(cols[j][cols[j].length - 1]); for (let i = cols[NX].length - 2; i >= NTOP - 1; i--) edge.push(cols[NX][i]);
        const r1 = [], r2 = []; edge.forEach(([X, Y, Z], i) => { r1.push(A(X, Y, Z)); r2.push(A(X * 0.985, Y + 0.0012, Z - 0.0040)); eu.push(gUV('plain', 905 + 140 * (i / edge.length), 800)); });
        sheet([r1, r2], eu.concat(eu.map(([a, b]) => [a, b - 0.004]))); }
      // straps and the tab that lie on the front: [left, right, top, point at the top, start of the point at the bottom, bottom], lifted off the leather
      const slab = ([x0, x1, y0, yA, yB, y1], lift) => { const rows = [], uvs = [], n = Q(12, 7), xc = (x0 + x1) / 2, hw = (x1 - x0) / 2;
        for (let i = 0; i <= n; i++) { const py = lerp(y0, y1, i / n), k = Math.min(yA > y0 ? sm(y0, yA, py) : 1, sm(y1, yB, py)), Y = -(py - S.f[2]) * m, row = [];
          for (const q of [-1, -0.82, 0, 0.82, 1]) { const px = xc + q * hw * Math.max(0.02, k), X = (px - cxF) * m; row.push(A(X, Y, zF(X, Y) + lift - (Math.abs(q) === 1 ? 0.0016 : 0))); uvs.push(gUV(S.name + 'Front', px, py)); } rows.push(row); }
        sheet(rows, uvs); };
      for (const sp of S.straps) slab(sp, 0.0030);
      for (const tb of S.tabs) slab(tb, 0.0048 + 0.0032);
      // buckles on the straps: a steel frame and its prong
      for (const [px, py, hwp, hhp] of S.buckles) { const X = (px - cxF) * m, Y = -(py - S.f[2]) * m, c = W3(X, Y, zF(X, Y) + S.bz);
        tube('steel', roundRect(c, ex, ey, hwp * m, hhp * m, 0.0034, 3), 0.0021, wHip, true);
        tube('steel', [c.clone().addScaledVector(ey, hhp * m).addScaledVector(ez, 0.0008), c.clone().addScaledVector(ez, 0.0018), c.clone().addScaledVector(ey, -hhp * m).addScaledVector(ez, 0.0010)], 0.0014, wHip); }
      for (const [px, py, lift] of S.studs) { const X = (px - cxF) * m, Y = -(py - S.f[2]) * m; dome('gearBrass', W3(X, Y, zF(X, Y) + lift), ez, 0.0027, 0.0018, wHip); }
      // the loops it hangs by: up the back, out over the belt and down behind it
      for (const [lx0, lx1, bx0, bx1] of S.loops) { const X0 = (lx0 - cxF) * m, X1 = (lx1 - cxF) * m, span = S.loopPy[1] - S.loopPy[0], colsL = [], hw = BELT.hw, th = BELT.th;
        for (const q of [0, 0.5, 1]) { const X = lerp(X0, X1, q), b = B.above(O, ex, X, sAnchor), c = b.p.clone().addScaledVector(b.n, b.off), bq = (a, d) => c.clone().addScaledVector(b.w, a).addScaledVector(b.n, d);
          colsL.push([W3(X, -0.060, -0.0016), W3(X, -0.022, -0.0016), W3(X, -0.001, -0.0014), bq(-hw - 0.0016, th + 0.0010), bq(-hw * 0.4, th + 0.0016), bq(hw * 0.4, th + 0.0016), bq(hw + 0.0012, th + 0.0012), bq(hw + 0.0030, th * 0.4), bq(hw + 0.0008, -0.0010), bq(-hw * 0.5, -0.0010)]); }
        const rows = [], uvs = []; let acc = 0;
        for (let i = 0; i < colsL[1].length; i++) { if (i) acc += colsL[1][i].distanceTo(colsL[1][i - 1]); rows.push(colsL.map((cp) => cp[i].toArray())); for (const q of [0, 0.5, 1]) uvs.push(gUV('satBack', lerp(bx0, bx1, q), S.loopPy[1] - cl(acc / 0.13, 0, 1) * span)); }
        const part = loft(rows, { open: true }); for (let i = 0; i < uvs.length; i++) { part.uv[i * 2] = uvs[i][0]; part.uv[i * 2 + 1] = uvs[i][1]; }
        addPart('gear', part, wHip, { out: B.above(O, ex, (X0 + X1) / 2, sAnchor).p.clone().addScaledVector(ey, -0.004) });
        if (typeof window !== 'undefined') (window.__gear[S.name].loops = window.__gear[S.name].loops || []).push([B.above(O, ex, X0, sAnchor).p.x, B.above(O, ex, X1, sAnchor).p.x]); }
      return { O, ex, ey, ez, H };
    };
    const SAT = { name: 'sat', W: 0.200, D: [0.065, 0.044], rc: 70, topK: 0.86, topR: 52, f: [60, 482, 512, 910], b: [757, 1203, 542, 909], sd: [546, 692, 530, 915], flap: [686, 648],
      straps: [[164, 218, 690, 690, 874, 902], [340, 392, 690, 690, 874, 902]], tabs: [[245, 308, 604, 634, 834, 864]], buckles: [[190, 779, 36, 36], [366, 779, 36, 36]], bz: 0.0030 + 0.0030,
      studs: [[277, 630, 0.0085], [269, 682, 0.0085], [286, 682, 0.0085]], loops: [[176, 226, 828, 875], [316, 366, 1072, 1119]], loopPy: [448, 675] };       // the loops sit 2 cm nearer the middle than painted, to hang clear of the ring buckle
    const POU = { name: 'pouch', W: 0.093, D: [0.040, 0.030], rc: 48, topK: 0.80, topR: 40, maxLean: 0.2, f: [1278, 1474, 564, 862], b: [], sd: [], flap: [692, 668],
      straps: [], tabs: [[1352, 1402, 648, 672, 866, 890]], buckles: [[1377, 775, 32, 33]], bz: 0.0085,
      studs: [[1376, 655, 0.0062], [1368, 690, 0.0062], [1385, 690, 0.0062]], loops: [[1347, 1402, 828, 875]], loopPy: [448, 675] };
    if (typeof window !== 'undefined') { window.__gear = window.__gear || {}; window.__gear.belts = { ring: beltA.at(beltA.buckle).p.toArray(), square: beltB.at(beltB.buckle).p.toArray(), lenA: beltA.L, lenB: beltB.L, studsA: beltA.nT, pitch: beltA.pitch, hiA: beltA.at(beltA.sOfU(0.25)).p.toArray(), loA: beltA.at(beltA.sOfU(0.75)).p.toArray(), crossF: beltA.at(beltA.sOfU(0.5)).p.toArray(), crossB: beltA.at(beltA.sOfU(0)).p.toArray() }; }
    const uSat = 0.300, uPou = 0.815, sSat = beltA.sOfU(uSat), sPou = beltB.sOfU(uPou);
    bag(SAT, beltA, uSat, 0.043); bag(POU, beltB, uPou, 0.045);
    studs(beltA, [[beltA.buckle + 0.006, 0.050], [beltA.sOfU(0.5), 0.026], [beltA.sOfU(0), 0.026]]);       // none under its buckle and tail, nor where the other belt lies over it studs(beltB, [[beltB.buckle - 0.042, 0.086]]);

    // ---- strap hooks: a brass buckle on each shoulder strap and a black iron curl either side of it, front and back ----
    // Each sits where the flat painted one was on her body picture (bake_ranger.py paints those out). Shapes are read off A1 (front) and
    // A2 (back): in front an oval ring with an upright prong, behind a narrow bar with a tooth; the outer curl is the bigger one.
    // They are laid on the real outer skin of chest and shoulder, found by looking straight at her from the front or the back.
    const TRI = [];
    for (const k of ['torso', 'armL', 'armR']) { const Bk = buckets[k]; if (!Bk) continue; const P = Bk.pos, I = Bk.idx;
      for (let i = 0; i < I.length; i += 3) { const a = I[i] * 3, b = I[i + 1] * 3, c = I[i + 2] * 3; if (Math.max(P[a + 1], P[b + 1], P[c + 1]) < 1.27 || Math.min(P[a + 1], P[b + 1], P[c + 1]) > 1.39) continue; TRI.push([P[a], P[a + 1], P[a + 2], P[b], P[b + 1], P[b + 2], P[c], P[c + 1], P[c + 2]]); } }
    const castZ = (x, y, front) => { let best = null;
      for (const t of TRI) { const d = (t[4] - t[7]) * (t[0] - t[6]) + (t[6] - t[3]) * (t[1] - t[7]); if (Math.abs(d) < 1e-13) continue;
        const l1 = ((t[4] - t[7]) * (x - t[6]) + (t[6] - t[3]) * (y - t[7])) / d, l2 = ((t[7] - t[1]) * (x - t[6]) + (t[0] - t[6]) * (y - t[7])) / d, l3 = 1 - l1 - l2; if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        const z = l1 * t[2] + l2 * t[5] + l3 * t[8]; if (best === null || (front ? z > best : z < best)) best = z; }
      return best === null ? rTorso(rTorsoU(x, y, front ? 0.1 : -0.1), y)[2] : best; };
    const skin = (x, y, front, lift) => { const h = 0.005, xa = castZ(x + h, y, front), xb = castZ(x - h, y, front), ya = castZ(x, y + h, front), yb = castZ(x, y - h, front), z = (2 * castZ(x, y, front) + xa + xb + ya + yb) / 6, zx = (xa - xb) / (2 * h), zy = (ya - yb) / (2 * h);       // a little smoothed, so the rod does not kink where arm meets chest
      const n = V3(-zx, -zy, 1).normalize(); if (!front) n.set(zx, zy, -1).normalize(); n.x = cl(n.x, -0.75, 0.75); n.y = cl(n.y, -0.75, 0.75); n.normalize(); return V3(x, y, z).addScaledVector(n, lift); };
    // curls as [out from the middle of the buckle, up], in metres
    const CURLS = { front: { out: [[0.0128, 0.0050], [0.0180, 0.0100], [0.0255, 0.0120], [0.0345, 0.0070], [0.0398, -0.0030], [0.0392, -0.0130], [0.0335, -0.0195], [0.0265, -0.0210]], inn: [[0.0128, 0.0055], [0.0170, 0.0100], [0.0230, 0.0118], [0.0315, 0.0070], [0.0362, -0.0020], [0.0350, -0.0100], [0.0290, -0.0140], [0.0232, -0.0130]] },
      back: { out: [[0.0125, 0.0000], [0.0180, 0.0012], [0.0245, 0.0005], [0.0325, -0.0035], [0.0372, -0.0120], [0.0360, -0.0215], [0.0300, -0.0275], [0.0250, -0.0273]], inn: [[0.0125, 0.0000], [0.0180, 0.0012], [0.0240, 0.0005], [0.0315, -0.0035], [0.0364, -0.0115], [0.0348, -0.0198], [0.0295, -0.0236], [0.0250, -0.0223]] } };
    const HOOKS = [[0.5 - 0.117, 1.321, true], [0.5 + 0.117, 1.321, true], [0.1115, 1.337, false], [1 - 0.1115, 1.337, false]];
    for (const [u, y, front] of HOOKS) {
      const cx = rTorso(u, y)[0], sOut = cx < 0 ? -1 : 1, wf = (X, Y, Z) => wTorso(X, Y, Z), at = (a, b, lift) => skin(cx + sOut * a, y + b, front, lift);
      const loop = (pts, r, key) => tube(key || 'hookBrass', pts, r, wf, true);
      if (front) { const ring = []; for (let j = 0; j < 26; j++) { const a = (j / 26) * TAU; ring.push(at(0.0135 * Math.cos(a), 0.0110 * Math.sin(a), 0.0030)); } loop(ring, 0.0013);
        tube('hookBrass', [at(0, 0.0125, 0.0036), at(0, 0.004, 0.0046), at(0, -0.005, 0.0046), at(0, -0.0130, 0.0036)], 0.0010, wf);
        for (const b of [0.0128, -0.0133]) { const c = at(0, b, 0.0038); addPart('hookBrass', spherePart(c, 0.0017, 0.0017, 0.0017, 8, 6), wf, { out: c }); } }
      else { const bar = []; for (let j = 0; j < 22; j++) { const a = (j / 22) * TAU; bar.push(at(0.0150 * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.5), 0.0030 * Math.sin(a), 0.0030)); } loop(bar, 0.0014);
        const c = at(0, 0.0012, 0.0042); addPart('hookBrass', spherePart(c, 0.0021, 0.0024, 0.0021, 8, 6), wf, { out: c }); tube('hookBrass', [at(0, 0.0005, 0.0042), at(0, -0.0045, 0.0040), at(0, -0.0085, 0.0030)], (q) => 0.0012 - 0.0006 * q, wf); }
      for (const [tbl, sd] of [[CURLS[front ? 'front' : 'back'].out, 1], [CURLS[front ? 'front' : 'back'].inn, -1]]) {
        const ctrl = tbl.map(([a, b]) => V3(sd * a, b, 0)), pts2 = curvePts(ctrl, 30), rod = (q) => 0.0028 - 0.0005 * q, pts = pts2.map((p, i) => at(p.x, p.y, rod(i / 29) * 0.80));
        tube('iron', pts, rod, wf); const e = pts[pts.length - 1]; addPart('iron', spherePart(e, 0.0031, 0.0031, 0.0031, 9, 7), wf, { out: e });
      }
    }
  })();
