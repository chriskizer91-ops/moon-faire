  // ---------- her cloak (stage four) ----------
  // Chris, November 13, with a picture of her from three sides (references/moss/M1): "This ... is how Io should look, adding a little
  // bit of moss to her ... Just giving like a mossy green frill to her outfit." Only the cloak changes: moss and small ferns grow
  // along the hems of its tiers. The cloak itself is F4 (laid flat), F5 (the sleeve on an arm) and F6 (cloth, trim, shoulder, hem point):
  // open down the front, bare shoulders, sleeves in three tiers that end in a long point, a body in two layers with handkerchief hems.
  //   body    above her waist it lies on her torso; below, it rides the skirt's chains, a little outside the skirt.
  //   sleeves each hangs from 24 soft points (4 round the arm at 6 heights), each on a bone hung from a point on her arm, so the cloth
  //           hangs below her arm however she holds it.
  const ROBE = !opts.noRobe, SLEEVES = [];       // SLEEVES: every ring of her sleeves, for sleeveTick
  (function buildRobe() {
    if (!ROBE) return;
    const zig = (x) => Math.abs((((x / TAU) % 1) + 1) % 1 * 2 - 1);          // a zigzag from 0 to 1 and back, once a turn
    let ferns = 0;
    // one tier of cloth: columns at the angles A; down each column s runs from top(a) to hem(a); pt(a, s, t) is the point, out(a) the way
    // away from her, wf(a, s, pt) the bones. The moss strip and the ferns sit on its hem.
    function tier(pt, A, top, hem, NY, wf, out, o) {
      o = o || {}; const rings = [], vs = [], S = [], n = A.length; let hSum = 0;
      for (const a of A) hSum += Math.abs(hem(a) - top(a)); const vTop = Math.min(1, (hSum / n) / 0.5) * (o.vK || 1);
      for (let i = 0; i <= NY; i++) { const t = i / NY, ring = [], row = []; for (const a of A) { const s = lerp(top(a), hem(a), t); ring.push(pt(a, s, t)); row.push(s); } rings.push(ring); S.push(row); vs.push(o.trim ? 0.10 * (1 - t) : 0.004 + (1 - t) * vTop); }
      const mid = rings[NY >> 1][n >> 1], oc = out(A[n >> 1]);
      addPart('robe', loft(rings, { open: true, v: vs, uS: o.uS || 6 }), (x, y, z, i) => wf(A[i % n], S[Math.floor(i / n)][i % n], [x, y, z]), { out: V3(mid[0] - oc[0], mid[1] - oc[1], mid[2] - oc[2]) });
      if (o.moss === false) return;
      const hemR = rings[NY], up = rings[NY - 1], mr = [[], []];
      for (let j = 0; j < n; j++) { const p = hemR[j], q = up[j], oo = out(A[j]); let ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2]; const l = Math.hypot(ux, uy, uz) || 1; ux /= l; uy /= l; uz /= l;
        mr[0].push([p[0] - ux * 0.014 + oo[0] * 0.004, p[1] - uy * 0.014 + oo[1] * 0.004, p[2] - uz * 0.014 + oo[2] * 0.004]); mr[1].push([p[0] + ux * 0.028 + oo[0] * 0.005, p[1] + uy * 0.028 + oo[1] * 0.005, p[2] + uz * 0.028 + oo[2] * 0.005]);
        if ((j * 7 + ferns * 3) % (o.fernEvery || 6) === 2) {                    // a small fern stands up and out from the hem
          const L = 0.075 + 0.035 * (((j * 13) % 7) / 7), w = L * 0.27, dx = ux * 0.35 + oo[0] * 0.75, dy = uy * 0.35 + oo[1] * 0.75 + 0.55, dz = uz * 0.35 + oo[2] * 0.75, dl = Math.hypot(dx, dy, dz);
          const lx = dx / dl, ly = dy / dl, lz = dz / dl, sx = ly * oo[2] - lz * oo[1], sy = lz * oo[0] - lx * oo[2], sz = lx * oo[1] - ly * oo[0], sl = Math.hypot(sx, sy, sz) || 1, b = [p[0] + oo[0] * 0.006, p[1] + oo[1] * 0.006, p[2] + oo[2] * 0.006];
          const P4 = [[-1, 0], [1, 0], [-1, 1], [1, 1]].map(([e, f]) => [b[0] + sx / sl * w * e + lx * L * f, b[1] + sy / sl * w * e + ly * L * f, b[2] + sz / sl * w * e + lz * L * f]);
          const wj = wf(A[j], S[NY][j], p); addPart('fern', { pos: [].concat(...P4), uv: [0, 0, 1, 0, 0, 1, 1, 1], idx: [0, 1, 2, 1, 3, 2] }, () => wj, {}); ferns++; } }
      addPart('moss', loft(mr, { open: true, uS: o.mossU || Math.max(2, Math.round(n / 9)), vS: 1 }), (x, y, z, i) => wf(A[i % n], S[NY][i % n], hemR[i % n]), {});
    }
    // ----- the body -----
    const robeS = (a, y, off) => {
      const lo = skirtPt(Math.min(y, 1.0), a, 1.0, off + 0.012); if (y <= 1.0) return [lo[0], y, lo[2]];
      const u = ((((a - PI) / TAU) % 1) + 1) % 1, tp = ioTorso(u, Math.max(y, 1.06)), k = sm(1.0, 1.06, y);
      return [lerp(lo[0], tp[0] + (off + 0.004) * Math.sin(a), k), y, lerp(lo[2], tp[2] + (off + 0.004) * Math.cos(a), k)];
    };
    const wBody = (a, y, p) => (y > 1.02 ? wTorso(p[0], y, p[2]) : wSkirt(p[0], y, p[2])), outB = (a) => [Math.sin(a), 0, Math.cos(a)];
    const AB = [], A0 = 0.50; for (let j = 0; j <= 72; j++) AB.push(lerp(A0, TAU - A0, j / 72));
    const topB = (a) => 1.334 - 0.119 * sm(0.80, 0.955, Math.abs(Math.sin(a)));         // over her shoulders in front and behind; under her arms it starts at the armpit
    const offB = (y) => lerp(0.005, 0.015, sm(1.25, 1.02, y));
    tier((a, y) => robeS(a, y, offB(y)), AB, topB, (a) => 0.56 + 0.15 * zig(a * 4 + 0.6), 30, wBody, outB, { uS: 9, fernEvery: 7 });
    tier((a, y) => robeS(a, y, 0.007), AB, () => 0.74, (a) => 0.33 - 0.17 * zig(a * 4 + 3.7) - 0.05 * Math.exp(-Math.pow((a - PI) / 0.35, 2)), 22, wBody, outB, { uS: 9, fernEvery: 6 });
    // ----- the sleeves -----
    for (const [S, s] of SIDES) {
      const sh = restPts['sh' + S], d = armDir[S], ox = s * Math.cos(A_POSE), oy = Math.sin(A_POSE);
      const P = (sl, a, r) => [sh.x + d.x * sl + ox * r * Math.cos(a), sh.y + d.y * sl + oy * r * Math.cos(a), sh.z + r * Math.sin(a)];
      const armRad = (sl, a) => { const q = armPt(S, Math.min(sl, 0.44), a), m = Math.min(sl, 0.44); return Math.hypot(q[0] - sh.x - d.x * m, q[1] - sh.y - d.y * m, q[2] - sh.z); };
      const rIn = (sl) => armRad(sl, PI) + 0.007 + 0.022 * sm(0.30, 0.60, sl);         // toward her body the sleeve stays close to her arm, so it clears her side and her skirt
      const R = (sl, a, ro, rf) => { const ca = Math.cos(a), sa = Math.sin(a), ex = ca >= 0 ? ro : Math.min(ro, rIn(sl)); return Math.max(1 / Math.sqrt((ca * ca) / (ex * ex) + (sa * sa) / (rf * rf)), sl < 0.45 ? armRad(sl, a) + 0.005 : 0); };
      const outS = (a) => [ox * Math.cos(a), oy * Math.cos(a), Math.sin(a)];
      // Stage nine (Chris, November 13: "the arms pass through the sleeves of the cloak"). A sleeve was 24 points that each hung from a
      // point of her arm, so with her forearm raised the whole sleeve hung under it and her arm came out through the cloth.
      // Now each tier is a row of rings round her arm (F5: on a raised arm each tier rests on top of the arm and hangs below it).
      // A ring follows her arm round the bend of her elbow, and slides toward the ground until its top rests on her arm; how far it
      // may slide each way is measured here, so her arm is always inside it (the sliding is done in I99_static.js, sleeveTick).
      // The long point of the last tier, past her wrist, hangs from the cuff ring as a soft chain.
      const TIERS = [[0.085, 0.255, 0.035, 0.052, 0.085, 0.080, 0.012], [0.20, 0.385, 0.045, 0.058, 0.105, 0.098, 0.014], [0.33, 0.398, 0.462, 0.062, 0.120, 0.112, 0.016]];
      const axisPt = (sl) => V3(sh.x + d.x * sl, sh.y + d.y * sl, sh.z);
      const wl = (a) => Math.pow(0.5 + 0.5 * Math.cos(a - 3.9), 2.2);                  // the long point hangs at the back of her arm, on the side toward her body
      const hemOf = (ti, a) => TIERS[ti][1] + TIERS[ti][2] * wl(a) + TIERS[ti][6] * zig(a * 6 + ti);
      const tierRad = (ti, sl, a) => { const T = TIERS[ti], hm = hemOf(ti, a), t = cl((sl - T[0]) / (hm - T[0]), 0, 1), k = Math.pow(t, 0.8); return R(Math.min(sl, hm), a, lerp(T[3], T[4], k), lerp(T[3], T[5], k)); };
      const ST_SL = [[0.17, 0.26], [0.20, 0.29, 0.39], [0.33, 0.40]], NB = 48, ND = 16;
      const st = ST_SL.map((row, ti) => row.map((sl, k) => {
        const nm = 'sl' + S + ti + '_' + k, c = axisPt(sl), par = (sl < L_UARM ? 'uarm' : 'farm') + S; addBone(nm, par, c.x, c.y, c.z);
        const ring = []; for (let j = 0; j < NB; j++) { const a = (j / NB) * TAU, r = tierRad(ti, sl, a), ra = armRad(Math.min(sl, 0.44), a); ring.push([r * Math.cos(a), r * Math.sin(a), ra + Math.min(0.006, r - ra - 0.0005)]); }
        const slack = [];                                                             // slack[j]: how far the ring may slide toward angle j before her arm touches it
        for (let j = 0; j < ND; j++) { const ph = (j / ND) * TAU, ux = Math.cos(ph), uz = Math.sin(ph); let lo = 0, hi = 0.2;
          for (let it = 0; it < 14; it++) { const m = (lo + hi) / 2, qx = -ux * m, qz = -uz * m; let ok = Math.hypot(qx, qz) < tierRad(ti, sl, Math.atan2(qz, qx)); if (ok) for (const [bx, bz, need] of ring) if (Math.hypot(bx - qx, bz - qz) < need) { ok = false; break; } if (ok) lo = m; else hi = m; }
          slack.push(lo); }
        const rad = []; for (let j = 0; j < ND; j++) rad.push(tierRad(ti, sl, (j / ND) * TAU));
        return { name: nm, S, sl, ti, par, slack, rad };
      }));
      const tailN = [0.40, 0.52, 0.64, 0.76, 0.88], cuff = st[2][1].name;
      const tail = addChain('sleeve', 'svt' + S, cuff, tailN.map(axisPt), { yaw: 'spine3', soft: { k: 0.05, d: 0.15, g: 0.92, col: 'hg', pad: 0.020 } });
      SLEEVES.push(...st[0], ...st[1], ...st[2]);
      const wA = (nm) => [BI[nm], 1];
      const tailW = (sl) => { const n = tail.names.length; let k = 0; while (k < n - 1 && sl > tailN[k + 1]) k++; const t = cl((sl - tailN[k]) / (tailN[k + 1] - tailN[k]), 0, 1), bn = (i) => wA(tail.names[i]);
        if (t < 0.5) return k > 0 ? mixW(bn(k - 1), bn(k), 0.5 + t) : mixW(wA(cuff), bn(0), 2 * t);
        return k === n - 1 ? bn(k) : mixW(bn(k), bn(k + 1), t - 0.5); };
      const wSl = (ti) => (a, sl) => { const row = st[ti], n = row.length;
        if (sl <= row[0].sl) return ti === 0 ? mixW(wA('uarm' + S), wA(row[0].name), cl((sl - 0.085) / (row[0].sl - 0.085), 0, 1)) : wA(row[0].name);
        for (let k = 0; k < n - 1; k++) if (sl <= row[k + 1].sl) return mixW(wA(row[k].name), wA(row[k + 1].name), (sl - row[k].sl) / (row[k + 1].sl - row[k].sl));
        return ti === 2 ? tailW(sl) : wA(row[n - 1].name); };
      const AS = []; for (let j = 0; j <= 32; j++) AS.push((j / 32) * TAU);
      // the lower two tiers stop short of her wrist on the outside, so her bracelets show
      TIERS.forEach(([s0, s1, lng, r0, ro, rf, zz], ti) => {
        tier((a, sl, t) => { const k = Math.pow(t, 0.8); return P(sl, a, R(sl, a, lerp(r0, ro, k), lerp(r0, rf, k))); }, AS, () => s0, (a) => hemOf(ti, a), 14, wSl(ti), outS, { uS: 5, fernEvery: ti === 2 ? 5 : 6, mossU: 3 });
      });
      // the gathered band round her upper arm, and the cloth in front of and behind her bare shoulder that joins the sleeve to the body
      const wUp = () => [BI['uarm' + S], 1], skinP = (a, sl, off) => { const q = armPt(S, sl, a), oo = outS(a); return [q[0] + oo[0] * off, q[1] + oo[1] * off, q[2] + oo[2] * off]; };
      tier((a, sl) => skinP(a, sl, 0.0055), AS, () => 0.066, () => 0.090, 2, wUp, outS, { trim: true, moss: false, uS: 3 });
      for (const [a0, a1] of [[0.95, 2.25], [4.05, 5.35]]) { const AF = []; for (let j = 0; j <= 8; j++) AF.push(lerp(a0, a1, j / 8)); tier((a, sl) => skinP(a, sl, 0.0045), AF, () => -0.034, () => 0.070, 8, wUp, outS, { moss: false, uS: 1, vK: 3 }); }
    }
  })();
