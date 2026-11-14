  // ---------- his trousers: a real garment over the doll's hips and legs (stage 2 of the rebuild) ----------
  // Chris: "his legs are printed on the surface of his pants ... put the clothes over the doll", and "the pants are going to have actual holes".
  // Before this his trousers were part of the old clothes-shaped skin (projLegs, projHips) with B1 and B2 laid on them, so the fishnet
  // legs were paint on the cloth. Now the legs are the doll's (N45_doll.js, with painted fishnet), and the trousers are this: one thin
  // cloth, two legs sewn together down the middle, hanging clear of the doll. Where the paintings show a torn hole there is no cloth.
  //
  // Shape. The outline is the one the old skin had, because that was measured off B1 and B2 (N_LEG and N_TRUNK, tools/tables.py):
  // each leg is a tube of rings from inside the boot top up to the crotch; above the crotch a ring is half of his hips, from the
  // middle seam at the front, round the outside, to the middle seam at the back. The two halves meet on his centre line (x = 0), point
  // for point. From 0.96 m up the cloth is drawn 8 mm in, so that it goes up UNDER the corset (which is still the old skin).
  // On top of the outline: gathers at the hem and under the corset, and a few broad soft folds, different on each leg.
  //
  // Paint. Each leg is one flat piece of cloth: a point's place on it is how far round it is from the leg's outer side (metres, toward
  // the front) and its height. The printed pattern (one repeating square from F8, bake_cloth.py) and the map of the holes are both laid
  // on by that place, so the print is as crisp at the sides as at the front, and a hole in the paint IS a hole in the cloth: the same
  // map that paints the frayed edge decides where the cloth is left out (a hard cut, no see-through blending).
  //
  // Holes (TR_SEEN, TR_HOLES): from tools/trouser_measure.py. B1 paints six on his left leg and five on his right, B2 the same counts from
  // the sides, none at the back. B1 shows each one face on from the front and B2 shows the same one face on from the side; one hole cannot
  // be both, so each sits on the front-outer quarter of its leg, a little nearer to where B1 has it (TR_FRONT_W). Heights are B1's.
  // Slack. Cloth that is torn hangs loose, and a hole in a wide trouser leg would show only the dark inside of the leg beyond. So down
  // the strip where the holes are, the cloth falls in toward his leg (slackAt): that is what puts his leg, and not darkness, in the holes.
  const TR_TOP = 1.115, TR_HEM = N_LEG[0][0], TR_CROTCH = 0.66, TR_HIP = 0.76, TR_UNDER = 0.008;
  const TR_SLACK = [[35, 0.80], [35, 0.925]], TR_SLACK_K = 0.88, TR_NEAR = 0.017;      // where the torn cloth hangs slack, per leg (his right, his left): see slackAt
  const TR_PANEL = 0.84, TR_Y0 = 0.33;             // each leg's cloth fits a square this many metres across, whose bottom edge is at this height
  // one hole: [leg, middle: metres round from the outer side toward the front, middle height, length, width, tilt of the long axis in degrees
  //            (0 lies level; positive rises toward the FRONT of the leg), seed for its ragged outline]
  const TR_HOLES = [];
  // as measured: [leg (0 his right, 1 his left), x of its middle in B1's front view, z of its middle in B2's side view, height, length, width, tilt, seed].
  // Heights are B1's: B2 shows every hole 2.5 to 4 cm higher than B1 does (and the corset's edge 3.5 cm higher), so B2 is a little taller
  // in the leg than B1, and the rest of him is built on B1.
  // B1 paints every hole as if seen face on from the front, and B2 as if seen face on from the side. One hole cannot face both ways, so
  // each hole here is a tear that wraps a good way round the front-outer quarter of the leg: about a third longer and a fifth wider than either
  // painting shows it, because both see it on a surface that is turning away. The tilts are between what the two paintings show.
  // His left leg: six long steep tears that climb toward the back. His right leg: five shorter, flatter ones that climb toward the front.
  const TR_SEEN = [
    [1, 0.148, 0.069, 0.865, 0.132, 0.061, -50, 1], [1, 0.152, 0.066, 0.764, 0.14, 0.058, -45, 2], [1, 0.153, 0.061, 0.668, 0.131, 0.06, -43, 3],
    [1, 0.152, 0.052, 0.581, 0.124, 0.05, -40, 4], [1, 0.155, 0.04, 0.508, 0.111, 0.052, -32, 5], [1, 0.159, 0.02, 0.436, 0.078, 0.05, -22, 6],
    [0, -0.129, 0.078, 0.756, 0.114, 0.053, 22, 7], [0, -0.143, 0.069, 0.669, 0.11, 0.052, 21, 8], [0, -0.147, 0.059, 0.59, 0.107, 0.055, 23, 9],
    [0, -0.156, 0.049, 0.514, 0.096, 0.052, 22, 10], [0, -0.164, 0.034, 0.447, 0.085, 0.036, 18, 11]];
  const TROUSERS = (() => {
    const NU = Q(96, 48), NR = Q(94, 47), cols = NU + 1;
    const TUCK = [[0.006, 0.94], [0.015, 0.85], [0.026, 0.79]];      // the hem turns in and goes down into the boot: [metres below the hem, size]
    const ys = []; for (let i = 0; i <= NR; i++) ys.push(lerp(TR_TOP, TR_HEM, i / NR));
    const tuckK = ys.map(() => 1); for (const [d, k] of TUCK) { ys.push(TR_HEM - d); tuckK.push(k); }
    // where a ray from (0,0) leaves the shape g(X, Z) < 0, by halving
    const cast = (g, dX, dZ) => { let a = 0, b = 0.6; for (let it = 0; it < 26; it++) { const m = (a + b) / 2; if (g(m * dX, m * dZ) < 0) a = m; else b = m; } return (a + b) / 2; };
    // the outline at height y, as [middle X, middle Z, radius(dX, dZ)]; X is out from his centre line, Z forward
    const legForm = (y) => {
      const [hw, c, zf, zb] = spline(N_LEG, cl(y, N_LEG[0][0], N_LEG[N_LEG.length - 1][0])), cz = (zf + zb) / 2;
      return [c, cz, (dX, dZ) => cast((X, Z) => { const hd = Z >= 0 ? zf - cz : cz - zb; return X >= 0 ? Math.pow(X / hw, 2.15) + Math.pow(Math.abs(Z) / hd, 2.15) - 1 : Math.pow(-X / hw, 4.2) + Math.pow(Math.abs(Z) / hd, 2.6) - 1; }, dX, dZ)];
    };
    const hipForm = (y) => {
      const yy = Math.max(y, 0.70), [rx, zf, zb] = spline(N_TRUNK, yy), cz = (zf + zb) / 2, p = trunkPw(yy), xc = rx * 0.5;
      return [xc, cz, (dX, dZ) => { const r = cast((X, Z) => Math.pow(Math.abs(X + xc) / rx, p) + Math.pow(Math.abs(Z) / (Z >= 0 ? zf - cz : cz - zb), p) - 1, dX, dZ); return dX < 0 ? Math.min(r, xc / -dX) : r; }];
    };
    // gathers and folds: metres the cloth stands out from (or sinks into) the plain outline. th is the turn round the leg (0 the inner seam, a quarter the front), li the leg.
    const folds = (li, th, y) => {
      const ph = li * 2.4, hem = 0.0052 * sm(0.57, 0.43, y) * (0.55 + 0.45 * sm(TR_HEM - 0.03, TR_HEM + 0.03, y)), waist = 0.0032 * sm(0.84, 0.99, y);
      let d = hem * (Math.cos(th * 19 + ph + 1.1 * Math.sin(th * 3 + ph)) + 0.45 * Math.cos(th * 31 + 2 * ph)) + waist * (Math.cos(th * 23 + ph * 1.7 + 0.8 * Math.sin(th * 4 + ph)) + 0.4 * Math.cos(th * 37 + ph));
      d += 0.0075 * (fbm(th * 1.25 + li * 7.7, y * 5.0 + li * 3.1) - 0.47) * 2 * sm(0.40, 0.50, y) * (1 - sm(0.93, 1.0, y));
      return d - 0.9 * hem - 0.0045 * sm(0.40, 0.50, y) * (1 - sm(0.93, 1.0, y));      // the measured outline is the outside of the folds, so they are sunk into it
    };
    // how far the rim of the boot's top is from the point (xc, zc) of a leg's cross-section, along (dX, dZ)
    const BT = N_BOOT[N_BOOT.length - 1][1], BT_CZ = (BT[2] + BT[3]) / 2;
    const bootRim = (xc, zc, dX, dZ) => cast((X, Z) => Math.pow(Math.abs(X + xc - BT[1]) / BT[0], 2.4) + Math.pow(Math.abs(Z + zc - BT_CZ) / (Z + zc >= BT_CZ ? BT[2] - BT_CZ : BT_CZ - BT[3]), 2.4) - 1, dX, dZ);
    // how slack the cloth is: 1 down the middle of the strip of holes, 0 well away from it. The strip is centred TR_SLACK[li][0] degrees
    // from the front of the leg toward its outer side and runs up to the height TR_SLACK[li][1], just above that leg's top hole.
    const slackAt = (li, th, y) => { const [deg, top] = TR_SLACK[li], d = Math.abs(th - (PI / 2 + deg * DEG)) / DEG; return TR_SLACK_K * (1 - sm(28, 62, d)) * sm(0.375, 0.43, y) * (1 - sm(top, top + 0.09, y)); };
    // one leg's rings. Returns { P: [x,y,z] per point (rows of cols points; the last column repeats the first, for the paint's seam), arc: metres round from the outer side (positive toward the front), seam: 1 where the point lies on the middle seam }
    const build = (li) => {
      const s = li ? 1 : -1, P = [], arc = [], seam = [];
      for (let i = 0; i < ys.length; i++) {
        const y = ys[i], yy = Math.max(y, TR_HEM), t = sm(TR_CROTCH, TR_HIP, yy), A = legForm(yy), B = t > 0 ? hipForm(yy) : A, xc = lerp(A[0], B[0], t), zc = lerp(A[1], B[1], t);
        const under = TR_UNDER * sm(0.96, 0.995, y), sf = sm(0.60, TR_CROTCH, y), row = [], plain = [];      // plain: the outline before gathers and folds; the cloth's paint is laid out along it
        for (let j = 0; j < NU; j++) {
          const th = (j / NU) * TAU, dX = -Math.cos(th), dZ = Math.sin(th);
          let r = lerp(A[2](dX, dZ), t > 0 ? B[2](dX, dZ) : 0, t) * tuckK[i], X = xc + r * dX, onSeam = X <= 1e-7;
          plain.push(onSeam ? [0, zc + (xc / -dX) * dZ, 1] : [X, zc + r * dZ, 0]);
          if (!onSeam) {
            r += (folds(li, th, y) * (tuckK[i] < 1 ? 0.5 : 1) - under) * lerp(1, sm(0.0, 0.04, X), sf);      // nothing is added at the middle seam, so the two legs still meet there
            // Torn cloth hangs slack. Down the strip of each leg where the holes are (TR_SLACK), the cloth falls in toward the leg and stops
            // TR_NEAR short of it, so that the leg is what you see through a hole and not the far side of the trousers.
            const slack = slackAt(li, th, y);
            if (slack > 0.001) { let rd = r, n = 0; while (n++ < 60 && rd > 0.02 && DOLL.F(s * (xc + (rd - 0.002) * dX), y, zc + (rd - 0.002) * dZ) > TR_NEAR) rd -= 0.002; r = lerp(r, rd, slack); }
            if (y > 0.42) { let n = 0; while (n++ < 12 && DOLL.F(s * (xc + r * dX), y, zc + r * dZ) < 0.009) r += 0.002; }      // never nearer the doll than 9 mm
            if (tuckK[i] >= 1 && y < 0.435) r = Math.max(r, bootRim(xc, zc, dX, dZ) + 0.005 - 0.05 * sm(0.402, 0.435, y));      // the gathered hem pouches out over the rim of the boot, so the boot's flat top is inside the cloth
            X = xc + r * dX; onSeam = X <= 1e-7;
          }
          row.push(onSeam ? [0, y, zc + (xc / -dX) * dZ, 1] : [s * X, y, zc + r * dZ, 0]);
        }
        row.push(row[0]); plain.push(plain[0]);
        let S = 0; const cum = [0]; for (let j = 1; j < cols; j++) { if (!(plain[j][2] && plain[j - 1][2])) S += Math.hypot(plain[j][0] - plain[j - 1][0], plain[j][1] - plain[j - 1][1]); cum.push(S); }      // the stretch along the middle seam has no cloth and takes up no room on the square
        for (let j = 0; j < cols; j++) { P.push(row[j]); arc.push(cum[NU / 2] - cum[j]); seam.push(row[j][3]); }
      }
      return { P, arc, seam };
    };
    const legs = [build(0), build(1)];
    // metres round from the outer side to the place on leg li, at height y, that a painting shows at x (front view) or at z (side view)
    const arcAt = (li, y, q) => {
      let i = 0; for (let k = 1; k <= NR; k++) if (Math.abs(ys[k] - y) < Math.abs(ys[i] - y)) i = k;
      const G = legs[li]; let best = 0, bd = 1e9;
      for (let j = 1; j < NU; j++) {
        const p = G.P[i * cols + j], th = (j / NU) * TAU; if (q.x != null ? !(th > 0 && th < PI) : !(th > PI / 2 && th < 1.5 * PI)) continue;
        const d = Math.abs(q.x != null ? p[0] - q.x : p[2] - q.z); if (d < bd) { bd = d; best = G.arc[i * cols + j]; }
      }
      return best;
    };
    return { NU, NR, cols, ys, legs, arcAt };
  })();
  // each hole is put between where B1 sees it (weight TR_FRONT_W) and where B2 sees it
  const TR_FRONT_W = [0.62, 0.55], TR_WRAP = 1.07;      // TR_WRAP: every hole is this much longer again, so that it reaches round far enough to be seen from the side
  for (const [li, x, z, y, L, Wd, tilt, sd] of TR_SEEN) { const k = TR_FRONT_W[li]; TR_HOLES.push([li, k * TROUSERS.arcAt(li, y, { x }) + (1 - k) * TROUSERS.arcAt(li, y, { z }), y, L * TR_WRAP, Wd, tilt, sd]); }
  // the weights: under the corset the cloth moves as the corset does; everywhere else it moves exactly as the doll's skin nearest to it
  // (DOLL.wAt), so the doll cannot come through cloth that lies near it, and the cloth between his legs is shared by both thighs
  const wTrouser = (x, y, z) => (y >= 0.99 ? wTrunk(x, y, z) : DOLL.wAt(x, y, z));
  (function buildTrousers() {
    const { NU, cols, ys, legs } = TROUSERS, pos = [], uv = [], idx = [];
    for (let li = 0; li < 2; li++) {
      const G = legs[li], base = pos.length / 3, m = ys.length;
      for (let k = 0; k < G.P.length; k++) {
        const p = G.P[k]; pos.push(p[0], p[1], p[2]);
        uv.push((li + 0.5 + G.arc[k] / TR_PANEL) / 2, (p[1] - TR_Y0) / TR_PANEL);
      }
      for (let i = 0; i < m - 1; i++) for (let j = 0; j < NU; j++) {
        const a = i * cols + j, b = a + 1, c = a + cols, d = c + 1;
        const tri = (p, q, r) => { if (G.seam[p] && G.seam[q] && G.seam[r]) return; if (li) idx.push(base + p, base + r, base + q); else idx.push(base + p, base + q, base + r); };      // nothing is drawn where all three corners lie on the middle seam
        tri(a, b, c); tri(b, d, c);
      }
    }
    for (let i = 0; i < uv.length; i += 2) if (uv[i] < 0.002 || uv[i] > 0.998 || uv[i + 1] < 0.002 || uv[i + 1] > 0.998) throw new Error('trousers: a point falls off its square of cloth (' + uv[i].toFixed(3) + ', ' + uv[i + 1].toFixed(3) + ')');
    addPart('trousers', { pos, uv, idx }, wTrouser, { weld: true });
  })();

  // ---------- the map of the holes: one picture for both legs' cloth (his right leg's square on the left half, his left leg's on the right) ----------
  // red: how frayed the cloth is here (the dark rough band round every hole)   green: how light a loose thread is   blue: cloth (255) or no cloth (0)
  // The blue runs from 0 to 255 over a few millimetres at an edge, and the cloth's material cuts where it passes half, after adding fine
  // noise: that is what makes the edge ragged at any distance from the camera. Loose threads are drawn across the edge afterwards.
  const TR_MASK = (() => {
    const W = Math.round(2048 * TEXS), H = Math.round(1024 * TEXS), c = cvs(W, H), g = c.getContext('2d'), im = g.createImageData(W, H), d = im.data, PXM = H / TR_PANEL;
    for (let i = 0; i < W * H; i++) { d[i * 4 + 2] = 255; d[i * 4 + 3] = 255; }
    const RAMP = 0.0026 * PXM, BAND = 0.0075 * PXM, seed0 = seed; seed = 7411;
    const place = (li, sc, yc) => [(li + 0.5 + sc / TR_PANEL) / 2 * W, (1 - (yc - TR_Y0) / TR_PANEL) * H];
    // one edge of a hole: how far it stands from the long axis at t (-1 to 1 along it). The two edges (up 1, down -1) wander separately.
    const edge = (t, b, sd, up) => b * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), 2.4)), 0.62) * (1 + 0.30 * (vnoise(t * 2.1 + sd * 11.3, sd + up * 3.7) - 0.5)) + up * 0.16 * b * (vnoise(t * 1.6 + sd * 5.1, 7.3 + sd) - 0.5);
    const threads = [];
    for (const [li, sc, yc, L, Wd, tilt, sd] of TR_HOLES) {
      const [cx, cy] = place(li, sc, yc), ct = Math.cos(tilt * DEG), st = Math.sin(tilt * DEG), a = L / 2 * PXM, b = Wd / 2 * PXM, R = Math.ceil(a + BAND + 6);
      for (let py = Math.max(0, Math.floor(cy - R)); py <= Math.min(H - 1, Math.ceil(cy + R)); py++) for (let px = Math.max(0, Math.floor(cx - R)); px <= Math.min(W - 1, Math.ceil(cx + R)); px++) {
        const dx = px + 0.5 - cx, dy = py + 0.5 - cy, p = dx * ct - dy * st, q = -(dx * st + dy * ct), t = p / a;      // p along the hole, q across it (up the leg is positive)
        let dist = Math.abs(t) < 1 ? Math.max(q > 0 ? q - edge(t, b, sd, 1) : -q - edge(t, b, sd, -1), Math.abs(p) - a) : Math.hypot(Math.abs(p) - a, q);
        dist += ((vnoise(px / 9.5 + sd, py / 9.5) - 0.5) * 6.5 + (vnoise(px / 3.1, py / 3.1 + sd) - 0.5) * 3.2) * TEXS;                // the torn edge is never a clean line
        if (dist > BAND) continue;
        const o = (py * W + px) * 4, fr = dist > 0 ? Math.pow(1 - dist / BAND, 1.25) : 1;
        d[o + 2] = Math.min(d[o + 2], cl(0.5 + 0.5 * dist / RAMP, 0, 1) * 255); d[o] = Math.max(d[o], fr * 255); d[o + 1] = Math.max(d[o + 1], fr * 70 * h2(px * 0.37, py * 0.61));
      }
      // loose threads: short curved strokes that start on the edge and lie along it or hang into the hole
      const n = Math.round((a * 4.4) / (1.5 * TEXS));
      for (let k = 0; k < n; k++) {
        const t = rr(-0.97, 0.97), up = rnd() < 0.5 ? 1 : -1, q = up * edge(t, b, sd, up), len = rr(4, 13) * (rnd() < 0.18 ? 1.9 : 1) * TEXS, dir = rr(-1.1, 1.1) + (rnd() < 0.5 ? PI : 0), inw = rr(0.15, 1.0) * -up;
        const x0 = t * a, y0 = q + up * rr(-1.5, 2.5), x1 = x0 + Math.cos(dir) * len, y1 = y0 + inw * len * 0.75 + Math.sin(dir) * len * 0.3, xm = (x0 + x1) / 2 + rr(-2.5, 2.5), ym = (y0 + y1) / 2 + rr(-2.5, 2.5);
        const wxy = (px, qy) => [cx + px * ct - qy * st, cy - px * st - qy * ct];      // back from (along, across) to the picture
        threads.push([wxy(x0, y0), wxy(xm, ym), wxy(x1, y1), rr(0.9, 1.5) * TEXS, Math.round(rr(40, 150))]);
      }
    }
    g.putImageData(im, 0, 0);
    g.lineCap = 'round';
    for (const [A, M, B, lw, lightness] of threads) { g.strokeStyle = 'rgb(255,' + lightness + ',255)'; g.lineWidth = lw; g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(M[0], M[1], B[0], B[1]); g.stroke(); }
    seed = seed0;
    return ctex(c, 0, 0, false);
  })();
  // the same map with "cloth or no cloth" in the green, which is where a shadow's material looks for it: his shadow gets the same holes
  const TR_MASK_G = (() => {
    const src = TR_MASK.image, W = src.width >> 1, H = src.height >> 1, c = cvs(W, H), g = c.getContext('2d'); g.drawImage(src, 0, 0, W, H);
    const im = g.getImageData(0, 0, W, H), d = im.data; for (let i = 0; i < W * H; i++) d[i * 4 + 1] = d[i * 4 + 2];
    g.putImageData(im, 0, 0); return ctex(c, 0, 0, false);
  })();
