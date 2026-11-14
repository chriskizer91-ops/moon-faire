  // ---------- his shirt: a real garment over the doll, made of cloth that moves (stage 3 of the rebuild) ----------
  // Chris: "put the shirt on top of that. So that it looks real, and the shirt's actual fabric that moves because it's like flowy and
  // billowy like the pants are."
  // Before this his shirt was part of the old clothes-shaped skin (projTrunk, projArm, projRuffle) with B1 and B2 laid on it. Now it is
  // its own garment in eleven pieces of cloth, none of which has anything of his body printed on it:
  //     body        from the neck down over shoulders, chest and back, and on down inside the corset; open at the front in a V
  //     two sleeves a full tube from the shoulder seam to the gathered band just below the elbow
  //     four cuffs  two tiers of lace-edged ruffle hanging from each band over the bare forearm
  //     four ruffles the ruffled front: two layers each side of the lacing, the under one edged with lace
  //     collar      a wide collar lying on his shoulders, edged with lace, its two points on his chest
  // and the dark red lacing, which is a small skinned shape of its own (bucket 'lacing').
  //
  // HOW THE CLOTH MOVES. The method is the Jester's cloth sheets (models/jester/src/50_cloth.js; the Fox's trouser flounces use the
  // same engine): each piece is a coarse sheet of points joined by links that keep their length; every point has a place where it
  // would sit if it were simply carried by his bones (its "target"), and a pin between 0 and 1 that says how hard it is held there.
  // Pinned points (shoulder seams, bands, the edge under the corset, the front edges with the lacing) go exactly where the bones go.
  // The rest fall under gravity, keep their speed, are pulled gently back toward their target, and are pushed out of his arms and
  // trunk (capsules riding on bones). So the loose cloth lags, swings and settles, and at rest it hangs in the built shape, which
  // is the painted one. What is drawn is finer than what is simulated: a smooth surface through the coarse points, pushed out by a
  // fixed pattern of gathers and flutes (the Jester's "pleats").
  // Three things are his own and not the Jester's:
  //   1. A leash (tether): after the links are worked out, no loose point is left further from its target than a set distance. So
  //      nothing can explode after a jump of the clock. The body, ruffles, cuffs and collar touch no capsule, so for them the leash is
  //      exact: cloth built 1.2 cm or more off his chest on a leash 6 mm shorter than that cannot reach the doll. The sleeves are
  //      different on purpose: the push out of his arm comes after the leash and wins, so where the arm presses on a sleeve the cloth
  //      goes with the arm past its leash (measured: up to 15 mm past, always a point lying on the arm; tools/shirt_walk.py).
  //   2. The sleeves know which way is down. The Ranger's README lists four tries at sleeves: one swinging bone (her arm passed through),
  //      a loop slid across the arm toward the ground, pushing the cloth up the arm when the elbow folds, and at last drawing her
  //      forearm again on top. Io's sleeves are rings that "slide toward the ground until the top rests on her arm". The lesson in all
  //      of them: a sleeve must stay a closed loop round the arm, and its slack must hang on the ground side. So here the sleeve is a
  //      closed tube pinned at both ends, and each ring's target is slid toward the ground by the slack it was built with (hang),
  //      the more the further the arm is from hanging straight down. The arm is then kept out of the cloth three ways: the tube is
  //      closed, the targets always enclose the arm, and every loose point is pushed out of the arm's capsules at the end of every step.
  //   3. A smooth curve through the points when drawing (the Jester joins them with straight lines), because a sleeve is a tube of
  //      only 22 points round and would show flat sides.
  // api.setCloth(false) freezes it: every point is then carried on its target (still with the hang and the push out of his arms).
  const CLOTH = (() => {
    const COLL = [];
    // a capsule riding on bones: masks say which sheets it touches (1 trunk, 2 his right arm, 4 his left arm, 8 hips and thighs)
    function collider(bA, a, bB, b, r0, r1, mask, open0) {
      const A = SK[bA].userData.rest, B = SK[bB].userData.rest;
      COLL.push({ ia: BI[bA], la: V3(a[0] - A.x, a[1] - A.y, a[2] - A.z), ib: BI[bB], lb: V3(b[0] - B.x, b[1] - B.y, b[2] - B.z), r0, r1: r1 == null ? r0 : r1, mask, open0: !!open0 });      // open0: no round end at the start. The upper arm's capsule starts at the shoulder joint; a round end there would reach into his body, where the sleeve's seam is
    }
    // Everything is worked out in his own space (the space of 'root'), not the world's: LM[i] is bone i's place in it. So he can be
    // scaled or stood anywhere. How he was moved since the last frame is handed to the cloth separately (carry, below).
    const LM = bones.map(() => new THREE.Matrix4()), rootInv = new THREE.Matrix4(), rootWas = new THREE.Matrix4(), carryM = new THREE.Matrix4();
    function readBones() { rootInv.copy(root.matrixWorld).invert(); for (let i = 0; i < bones.length; i++) (LM[i] || (LM[i] = new THREE.Matrix4())).multiplyMatrices(rootInv, bones[i].matrixWorld); }      // bones added after this file (his hat and gear, N48_gear.js) get their place here too
    let cW = null, cW0 = null, cS = null; const _v = V3();
    function updateColliders(first) {
      const N = COLL.length; if (!cW) { cW = new Float32Array(N * 6); cW0 = new Float32Array(N * 6); cS = new Float32Array(N * 8); first = true; }
      for (let k = 0; k < N; k++) {
        const c = COLL[k], o = k * 6;
        if (!first) for (let i = 0; i < 6; i++) cW0[o + i] = cW[o + i];
        _v.copy(c.la).applyMatrix4(LM[c.ia]); cW[o] = _v.x; cW[o + 1] = _v.y; cW[o + 2] = _v.z;
        _v.copy(c.lb).applyMatrix4(LM[c.ib]); cW[o + 3] = _v.x; cW[o + 4] = _v.y; cW[o + 5] = _v.z;
        if (first) for (let i = 0; i < 6; i++) cW0[o + i] = cW[o + i];
      }
    }
    function lerpColliders(f) {                         // cS: ax, ay, az, abx, aby, abz, 1/|ab|^2, bounding radius
      for (let k = 0; k < COLL.length; k++) {
        const o = k * 6, q = k * 8;
        const ax = cW0[o] + (cW[o] - cW0[o]) * f, ay = cW0[o + 1] + (cW[o + 1] - cW0[o + 1]) * f, az = cW0[o + 2] + (cW[o + 2] - cW0[o + 2]) * f;
        const bx = cW0[o + 3] + (cW[o + 3] - cW0[o + 3]) * f, by = cW0[o + 4] + (cW[o + 4] - cW0[o + 4]) * f, bz = cW0[o + 5] + (cW[o + 5] - cW0[o + 5]) * f;
        cS[q] = ax; cS[q + 1] = ay; cS[q + 2] = az; cS[q + 3] = bx - ax; cS[q + 4] = by - ay; cS[q + 5] = bz - az;
        const l2 = cS[q + 3] * cS[q + 3] + cS[q + 4] * cS[q + 4] + cS[q + 5] * cS[q + 5];
        cS[q + 6] = l2 > 1e-10 ? 1 / l2 : 0; cS[q + 7] = Math.sqrt(l2) + Math.max(COLL[k].r0, COLL[k].r1);
      }
    }
    // which way a sleeve's slack hangs, per arm: the part of "down" that is square to the upper arm, 1 long when the arm is as it rests
    // (27 degrees out), shorter as the arm comes nearer to hanging straight down, never more than HANG_MAX
    const HANG = { R: [0, 0, 0], L: [0, 0, 0] }, HANG_MAX = 1.12, sinA = Math.sin(A_POSE);
    function updateHang() {
      for (const [S] of SIDES) {
        const a = LM[BI['uarm' + S]].elements, b = LM[BI['farm' + S]].elements;
        let dx = b[12] - a[12], dy = b[13] - a[13], dz = b[14] - a[14]; const l = Math.hypot(dx, dy, dz) || 1; dx /= l; dy /= l; dz /= l;
        const px = dy * dx, py = -1 + dy * dy, pz = dy * dz, pl = Math.hypot(px, py, pz), m = pl < 1e-5 ? 0 : Math.min(HANG_MAX, pl / sinA) / pl;
        HANG[S][0] = px * m; HANG[S][1] = py * m; HANG[S][2] = pz * m;
      }
    }
    const sheets = [], DRAW_CLEAR = 0.002;
    // o: name, cols, rows, wrap, K (how many drawn points to one simulated), side ('R' or 'L': whose arm's hang it uses), mask, margin,
    //    inside [x, y, z] (a point the cloth's outer face looks away from), grav, drag, bend,
    //    rest(c, r) -> { p: [x,y,z] where it rests, base: the same without its hang (default p), hang: metres of slack toward the ground,
    //                    w: [bone, weight, ...], pin: 0..1, tether: metres }
    //    fold(su, sv) -> metres the drawn cloth stands out from the smooth sheet there (su along a row 0..1, sv down the rows 0..1); shift(su, sv) -> metres it is moved along its row
    //    uvm: [metres along a row, metres down the rows] for the weave;  tint(su, sv) -> brightness;  lace(su, sv) -> [repeats along, 0 heading .. 1 scallops] or null
    function makeSheet(o) {
      const NC = o.cols, NR = o.rows, n = NC * NR, wrap = !!o.wrap, K = Math.max(1, o.K || 1);
      const pos = new Float32Array(n * 3), prev = new Float32Array(n * 3), tgt = new Float32Array(n * 3), tgt0 = new Float32Array(n * 3);
      const pin = new Float32Array(n), teth = new Float32Array(n), hang = new Float32Array(n), sI = new Uint16Array(n * 4), sW = new Float32Array(n * 4), sL = new Float32Array(n * 12);
      const id = (c, r) => r * NC + ((c % NC) + NC) % NC;
      for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) {
        const i = r * NC + c, q = o.rest(c, r), b = q.base || q.p, w = q.w;
        pos[i * 3] = q.p[0]; pos[i * 3 + 1] = q.p[1]; pos[i * 3 + 2] = q.p[2];
        pin[i] = cl(q.pin, 0, 1); teth[i] = q.tether == null ? 1 : q.tether; hang[i] = q.hang || 0;
        let s = 0; for (let k = 1; k < w.length && k < 8; k += 2) s += w[k];
        for (let k = 0; k < 4; k++) {
          const has = k * 2 + 1 < w.length, bi = has ? w[k * 2] : 0, R = bones[bi].userData.rest;
          sI[i * 4 + k] = bi; sW[i * 4 + k] = has ? w[k * 2 + 1] / s : 0;
          sL[i * 12 + k * 3] = b[0] - R.x; sL[i * 12 + k * 3 + 1] = b[1] - R.y; sL[i * 12 + k * 3 + 2] = b[2] - R.z;
        }
      }
      prev.set(pos);
      // links that keep their length: along rows and columns, across the squares (shear), and over two (bend)
      const ci = [], cj = [], cl0 = [], ck = [];
      const link = (i, j, k) => { const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2]; ci.push(i); cj.push(j); cl0.push(Math.hypot(dx, dy, dz)); ck.push(k); };
      const bendK = o.bend == null ? 0.15 : o.bend;
      for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) {
        const hasR = wrap || c < NC - 1, hasR2 = wrap || c < NC - 2;
        if (hasR) link(id(c, r), id(c + 1, r), 1);
        if (r < NR - 1) link(id(c, r), id(c, r + 1), 1);
        if (hasR && r < NR - 1) { link(id(c, r), id(c + 1, r + 1), 0.5); link(id(c + 1, r), id(c, r + 1), 0.5); }
        if (hasR2) link(id(c, r), id(c + 2, r), bendK);
        if (r < NR - 2) link(id(c, r), id(c, r + 2), bendK);
      }
      const CI = new Uint32Array(ci), CJ = new Uint32Array(cj), CL = new Float32Array(cl0), CK = new Float32Array(ck), NCON = CI.length;
      const colls = []; for (let k = 0; k < COLL.length; k++) if (COLL[k].mask & (o.mask || 0)) colls.push(k);
      const margin = o.margin == null ? 0.007 : o.margin, grav = (o.grav == null ? 0.5 : o.grav) * 9.81, keep = 1 - (o.drag == null ? 0.02 : o.drag), HV = o.side ? HANG[o.side] : null;
      // --- what is drawn: K times finer, on a smooth curve through the simulated points, then pushed out by the folds ---
      const VC = wrap ? NC + 1 : NC, FC = (VC - 1) * K + 1, FR = (NR - 1) * K + 1, fn = FC * FR;
      const cI = new Int32Array(FC * 4), cWt = new Float32Array(FC * 4), rI = new Int32Array(FR * 4), rWt = new Float32Array(FR * 4);
      const crw = (u, out, a) => { const u2 = u * u, u3 = u2 * u; out[a] = 0.5 * (-u3 + 2 * u2 - u); out[a + 1] = 0.5 * (3 * u3 - 5 * u2 + 2); out[a + 2] = 0.5 * (-3 * u3 + 4 * u2 + u); out[a + 3] = 0.5 * (u3 - u2); };
      for (let fc = 0; fc < FC; fc++) { const c0 = Math.min(VC - 2, Math.floor(fc / K)); for (let k = 0; k < 4; k++) { const c = c0 - 1 + k; cI[fc * 4 + k] = (wrap ? ((c % NC) + NC) % NC : cl(c, 0, NC - 1)) * 3; } crw(fc / K - c0, cWt, fc * 4); }
      for (let fr = 0; fr < FR; fr++) { const r0 = Math.min(NR - 2, Math.floor(fr / K)); for (let k = 0; k < 4; k++) rI[fr * 4 + k] = cl(r0 - 1 + k, 0, NR - 1) * FC * 3; crw(fr / K - r0, rWt, fr * 4); }
      const tp = new Float32Array(NR * FC * 3), p0 = new Float32Array(fn * 3), fpos = new Float32Array(fn * 3), fnor = new Float32Array(fn * 3), fuv = new Float32Array(fn * 2), fcol = new Float32Array(fn * 3), flace = new Float32Array(fn * 2), dd = new Float32Array(fn);
      const ds = o.shift ? new Float32Array(fn) : null; if (ds) for (let fr = 0; fr < FR; fr++) for (let fc = 0; fc < FC; fc++) ds[fr * FC + fc] = o.shift(fc / (FC - 1), fr / (FR - 1));
      let hasFold = false, dmin = 1e9, dmax = -1e9;
      for (let fr = 0; fr < FR; fr++) for (let fc = 0; fc < FC; fc++) { const k = fr * FC + fc, d = o.fold ? o.fold(fc / (FC - 1), fr / (FR - 1)) : 0; dd[k] = d; if (d !== 0) hasFold = true; if (d < dmin) dmin = d; if (d > dmax) dmax = d; }
      // how each point stands against the cloth round it (its fold height less the average over one simulated square each way):
      // above it is the crest of a fold, below it is down in one, level is plain cloth
      const rel = new Float32Array(fn);
      if (hasFold) for (let fr = 0; fr < FR; fr++) for (let fc = 0; fc < FC; fc++) {
        let s = 0, c = 0;
        for (let a = -K; a <= K; a += Math.max(1, K >> 1)) for (let b = -K; b <= K; b += Math.max(1, K >> 1)) { const rr = cl(fr + a, 0, FR - 1), cc = wrap ? ((fc + b) % (FC - 1) + (FC - 1)) % (FC - 1) : cl(fc + b, 0, FC - 1); s += dd[rr * FC + cc]; c++; }
        rel[fr * FC + fc] = (dd[fr * FC + fc] - s / c) / (dmax - dmin || 1);
      }
      const uvm = o.uvm || [1, 1], TILE = (BAKED && BAKED.linenTile) || 0.085, uRep = wrap ? Math.max(1, Math.round(uvm[0] / TILE)) : uvm[0] / TILE, vRep = uvm[1] / TILE;
      for (let fr = 0; fr < FR; fr++) for (let fc = 0; fc < FC; fc++) {
        const k = fr * FC + fc, su = fc / (FC - 1), sv = fr / (FR - 1);
        fuv[k * 2] = su * uRep + (o.uv0 || 0); fuv[k * 2 + 1] = -sv * vRep;
        // the folds are painted as well as shaped: cloth down in a fold is darker and a little warmer, the crest of a fold lighter
        const dk = o.dark == null ? 0.80 : o.dark, t = (o.tint ? o.tint(su, sv) : 1) * (hasFold ? cl(1 + rel[k] * (o.contrast || 1.6), dk, 1.07) : 1);
        fcol[k * 3] = t; fcol[k * 3 + 1] = t * lerp(0.965, 1, t > 1 ? 1 : t); fcol[k * 3 + 2] = t * lerp(0.93, 1, t > 1 ? 1 : t);
        const lc = o.lace ? o.lace(su, sv) : null; flace[k * 2] = lc ? lc[0] : 0; flace[k * 2 + 1] = lc ? lc[1] : -1;
      }
      let sg = 1;
      const normals = (P, N) => {
        for (let fr = 0; fr < FR; fr++) for (let fc = 0; fc < FC; fc++) {
          const k = fr * FC + fc, l = (fc > 0 ? k - 1 : wrap ? k + FC - 2 : k) * 3, r = (fc < FC - 1 ? k + 1 : wrap ? k - FC + 2 : k) * 3, u = (fr > 0 ? k - FC : k) * 3, d = (fr < FR - 1 ? k + FC : k) * 3;
          const ax = P[r] - P[l], ay = P[r + 1] - P[l + 1], az = P[r + 2] - P[l + 2], bx = P[d] - P[u], by = P[d + 1] - P[u + 1], bz = P[d + 2] - P[u + 2];
          const nx = by * az - bz * ay, ny = bz * ax - bx * az, nz = bx * ay - by * ax, il = sg / (Math.sqrt(nx * nx + ny * ny + nz * nz) || 1);
          N[k * 3] = nx * il; N[k * 3 + 1] = ny * il; N[k * 3 + 2] = nz * il;
        }
      };
      const finish = () => {
        const W3 = FC * 3;
        for (let r = 0; r < NR; r++) {                    // along each simulated row
          const ro = r * NC * 3, ko = r * W3;
          for (let fc = 0; fc < FC; fc++) {
            const a = fc * 4, w0 = cWt[a], w1 = cWt[a + 1], w2 = cWt[a + 2], w3 = cWt[a + 3], i0 = ro + cI[a], i1 = ro + cI[a + 1], i2 = ro + cI[a + 2], i3 = ro + cI[a + 3], k = ko + fc * 3;
            tp[k] = w0 * pos[i0] + w1 * pos[i1] + w2 * pos[i2] + w3 * pos[i3]; tp[k + 1] = w0 * pos[i0 + 1] + w1 * pos[i1 + 1] + w2 * pos[i2 + 1] + w3 * pos[i3 + 1]; tp[k + 2] = w0 * pos[i0 + 2] + w1 * pos[i1 + 2] + w2 * pos[i2 + 2] + w3 * pos[i3 + 2];
          }
        }
        const dst = hasFold ? p0 : fpos;
        for (let fr = 0; fr < FR; fr++) {                 // then down between the rows
          const a = fr * 4, w0 = rWt[a], w1 = rWt[a + 1], w2 = rWt[a + 2], w3 = rWt[a + 3], o0 = rI[a], o1 = rI[a + 1], o2 = rI[a + 2], o3 = rI[a + 3], ko = fr * W3;
          for (let j = 0; j < W3; j++) dst[ko + j] = w0 * tp[o0 + j] + w1 * tp[o1 + j] + w2 * tp[o2 + j] + w3 * tp[o3 + j];
        }
        if (hasFold) {
          normals(p0, fnor); for (let k = 0; k < fn; k++) { const d = dd[k], k3 = k * 3; fpos[k3] = p0[k3] + fnor[k3] * d; fpos[k3 + 1] = p0[k3 + 1] + fnor[k3 + 1] * d; fpos[k3 + 2] = p0[k3 + 2] + fnor[k3 + 2] * d; }
          if (ds) for (let fr = 0; fr < FR; fr++) for (let fc = 0; fc < FC; fc++) {      // and along the row, so a flute leans over its neighbour
            const k = fr * FC + fc, l = (fc > 0 ? k - 1 : k) * 3, r = (fc < FC - 1 ? k + 1 : k) * 3, ax = p0[r] - p0[l], ay = p0[r + 1] - p0[l + 1], az = p0[r + 2] - p0[l + 2], m = ds[k] / (Math.sqrt(ax * ax + ay * ay + az * az) || 1);
            fpos[k * 3] += ax * m; fpos[k * 3 + 1] += ay * m; fpos[k * 3 + 2] += az * m;
          }
        }
        // The simulated points are kept out of his arms in step(). What is drawn is a curve between them, and in the crease of a folded
        // elbow that curve dipped up to 5 mm into his arm (found by tools/shirt_walk.py: two points of his arm outside the sleeve in talk).
        // So the drawn points are pushed out of the same capsules, 2 mm clear. Nothing drawn can then be inside a capsule.
        if (colls.length && cS) for (let k = 0; k < fn; k++) {
          const a = k * 3; let x = fpos[a], y = fpos[a + 1], z = fpos[a + 2], hit = false;
          for (let m = 0; m < colls.length; m++) {
            const kk = colls[m], q = kk * 8, C = COLL[kk], px = x - cS[q], py = y - cS[q + 1], pz = z - cS[q + 2], R = cS[q + 7] + DRAW_CLEAR;
            if (px * px + py * py + pz * pz > R * R) continue;
            let t = (px * cS[q + 3] + py * cS[q + 4] + pz * cS[q + 5]) * cS[q + 6]; if (t < 0 && C.open0) continue; t = t < 0 ? 0 : t > 1 ? 1 : t;
            const dx = px - cS[q + 3] * t, dy = py - cS[q + 4] * t, dz = pz - cS[q + 5] * t, rr = C.r0 + (C.r1 - C.r0) * t + DRAW_CLEAR, d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < rr * rr && d2 > 1e-12) { const s = rr / Math.sqrt(d2); x = cS[q] + cS[q + 3] * t + dx * s; y = cS[q + 1] + cS[q + 4] * t + dy * s; z = cS[q + 2] + cS[q + 5] * t + dz * s; hit = true; }
          }
          if (hit) { fpos[a] = x; fpos[a + 1] = y; fpos[a + 2] = z; }
        }
        normals(fpos, fnor);
        geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
      };
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(fpos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(fnor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(fuv, 2));
      geo.setAttribute('color', new THREE.BufferAttribute(fcol, 3)); geo.setAttribute('lace', new THREE.BufferAttribute(flace, 2));
      // which face is the outside: the one that looks away from o.inside as the cloth rests
      finish();
      { const c = o.inside; let s = 0; for (let k = 0; k < fn; k++) s += fnor[k * 3] * (fpos[k * 3] - c[0]) + fnor[k * 3 + 1] * (fpos[k * 3 + 1] - c[1]) + fnor[k * 3 + 2] * (fpos[k * 3 + 2] - c[2]); if (s < 0) sg = -1; }
      const fi = [];
      for (let fr = 0; fr < FR - 1; fr++) for (let fc = 0; fc < FC - 1; fc++) { const A = fr * FC + fc, B = A + 1, D = A + FC, E = D + 1; if (sg > 0) fi.push(A, D, B, B, D, E); else fi.push(A, B, D, B, E, D); }
      geo.setIndex(fn > 65535 ? new THREE.Uint32BufferAttribute(fi, 1) : new THREE.Uint16BufferAttribute(fi, 1));
      finish();
      // where each point would sit if it were simply carried by its bones, plus its slack slid toward the ground
      const targets = () => {
        tgt0.set(tgt);
        const hx = HV ? HV[0] : 0, hy = HV ? HV[1] : 0, hz = HV ? HV[2] : 0;
        for (let i = 0; i < n; i++) {
          let x = 0, y = 0, z = 0;
          for (let k = 0; k < 4; k++) {
            const w = sW[i * 4 + k]; if (w === 0) continue;
            const e = LM[sI[i * 4 + k]].elements, lx = sL[i * 12 + k * 3], ly = sL[i * 12 + k * 3 + 1], lz = sL[i * 12 + k * 3 + 2];
            x += w * (e[0] * lx + e[4] * ly + e[8] * lz + e[12]); y += w * (e[1] * lx + e[5] * ly + e[9] * lz + e[13]); z += w * (e[2] * lx + e[6] * ly + e[10] * lz + e[14]);
          }
          const hg = hang[i]; tgt[i * 3] = x + hg * hx; tgt[i * 3 + 1] = y + hg * hy; tgt[i * 3 + 2] = z + hg * hz;
        }
      };
      const out = { o, name: o.name, n, pos, pin, tgt, teth, geo, tris: fi.length / 3, NC, NR, FC, FR, fpos, colls, margin, finish, begin: targets };
      out.reset = () => { targets(); tgt0.set(tgt); pos.set(tgt); prev.set(tgt); };
      // he was moved (walked across the ground, turned): the loose cloth stays where it was in the world for now, and is then pulled after him
      out.carry = (e) => {
        for (let i = 0; i < n; i++) { if (pin[i] >= 1) continue; for (const A of [pos, prev]) { const a = i * 3, x = A[a], y = A[a + 1], z = A[a + 2]; A[a] = e[0] * x + e[4] * y + e[8] * z + e[12]; A[a + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; A[a + 2] = e[2] * x + e[6] * y + e[10] * z + e[14]; } }
      };
      out.step = (h, f, iters, frozen) => {
        const h2 = h * h, gy = -grav * h2;
        for (let i = 0; i < n; i++) {
          const a = i * 3, p = pin[i];
          const tx = tgt0[a] + (tgt[a] - tgt0[a]) * f, ty = tgt0[a + 1] + (tgt[a + 1] - tgt0[a + 1]) * f, tz = tgt0[a + 2] + (tgt[a + 2] - tgt0[a + 2]) * f;
          if (p >= 1 || frozen) { prev[a] = tx; prev[a + 1] = ty; prev[a + 2] = tz; pos[a] = tx; pos[a + 1] = ty; pos[a + 2] = tz; continue; }
          const x = pos[a], y = pos[a + 1], z = pos[a + 2];
          let nx = x + (x - prev[a]) * keep, ny = y + (y - prev[a + 1]) * keep + gy, nz = z + (z - prev[a + 2]) * keep;
          nx += (tx - nx) * p; ny += (ty - ny) * p; nz += (tz - nz) * p;
          prev[a] = x; prev[a + 1] = y; prev[a + 2] = z; pos[a] = nx; pos[a + 1] = ny; pos[a + 2] = nz;
        }
        if (!frozen) {
          for (let it = 0; it < iters; it++) for (let k = 0; k < NCON; k++) {
            const i = CI[k], j = CJ[k], a = i * 3, b = j * 3;
            const dx = pos[b] - pos[a], dy = pos[b + 1] - pos[a + 1], dz = pos[b + 2] - pos[a + 2], d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d < 1e-7) continue;
            const st = CK[k]; if (st < 1 && d < CL[k]) continue;             // shear and bend links only resist stretch
            const wi = pin[i] >= 1 ? 0 : 1, wj = pin[j] >= 1 ? 0 : 1, ws = wi + wj; if (ws === 0) continue;
            const s = (d - CL[k]) / d * (st < 1 ? st : 1) / ws;
            if (wi) { pos[a] += dx * s; pos[a + 1] += dy * s; pos[a + 2] += dz * s; }
            if (wj) { pos[b] -= dx * s; pos[b + 1] -= dy * s; pos[b + 2] -= dz * s; }
          }
          for (let i = 0; i < n; i++) {                     // the leash
            if (pin[i] >= 1) continue;
            const a = i * 3, tx = tgt0[a] + (tgt[a] - tgt0[a]) * f, ty = tgt0[a + 1] + (tgt[a + 1] - tgt0[a + 1]) * f, tz = tgt0[a + 2] + (tgt[a + 2] - tgt0[a + 2]) * f;
            const dx = pos[a] - tx, dy = pos[a + 1] - ty, dz = pos[a + 2] - tz, d2 = dx * dx + dy * dy + dz * dz, L = teth[i];
            if (!(d2 <= L * L)) { const d = Math.sqrt(d2), s = d > 0 && d < 1e6 ? L / d : 0; pos[a] = tx + dx * s; pos[a + 1] = ty + dy * s; pos[a + 2] = tz + dz * s; if (!(d < 1e6)) { prev[a] = pos[a]; prev[a + 1] = pos[a + 1]; prev[a + 2] = pos[a + 2]; } }
          }
        }
        for (let i = 0; i < n; i++) {                       // out of his arms and trunk
          if (pin[i] >= 1) continue;
          const a = i * 3; let x = pos[a], y = pos[a + 1], z = pos[a + 2], hit = false;
          for (let m = 0; m < colls.length; m++) {
            const k = colls[m], q = k * 8, C = COLL[k];
            const px = x - cS[q], py = y - cS[q + 1], pz = z - cS[q + 2], R = cS[q + 7] + margin;
            if (px * px + py * py + pz * pz > R * R) continue;
            let t = (px * cS[q + 3] + py * cS[q + 4] + pz * cS[q + 5]) * cS[q + 6]; if (t < 0 && C.open0) continue; t = t < 0 ? 0 : t > 1 ? 1 : t;
            const dx = px - cS[q + 3] * t, dy = py - cS[q + 4] * t, dz = pz - cS[q + 5] * t, rr2 = C.r0 + (C.r1 - C.r0) * t + margin, d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < rr2 * rr2 && d2 > 1e-12) { const d = Math.sqrt(d2), s = rr2 / d; x = cS[q] + cS[q + 3] * t + dx * s; y = cS[q + 1] + cS[q + 4] * t + dy * s; z = cS[q + 2] + cS[q + 5] * t + dz * s; hit = true; }
          }
          if (hit) { pos[a] = x; pos[a + 1] = y; pos[a + 2] = z; prev[a] += (x - prev[a]) * 0.35; prev[a + 1] += (y - prev[a + 1]) * 0.35; prev[a + 2] += (z - prev[a + 2]) * 0.35; }
        }
      };
      sheets.push(out); return out;
    }
    let ready = false, on = true;
    // One step of the cloth is 1/120 of a second: two a frame on a fast screen, never more than five. (Tried 1/60 to halve the work: every
    // loose piece then sagged to the end of its leash, because how hard a point is held is counted by the step. It saved a tenth. Put back.)
    const H_SUB = 1 / 120, SETTLE = 150;
    // one frame. jump: he has been moved a long way at once (or this is the first frame, or pose() was called): the cloth is laid on
    // its targets and left to settle, all inside this call, so the result is the same on every run and nothing is flung about.
    function step(dt, jump) {
      readBones();
      if (!ready || jump) {
        updateColliders(true); updateHang(); for (const c of sheets) c.reset(); lerpColliders(1);
        for (let k = 0; k < (on ? SETTLE : 1); k++) for (const c of sheets) c.step(H_SUB, 1, 3, !on);
        ready = true;
      } else if (on) {
        carryM.multiplyMatrices(rootInv, rootWas); const e = carryM.elements, far = Math.hypot(e[12], e[13], e[14]), turn = Math.abs(e[0] - 1) + Math.abs(e[5] - 1) + Math.abs(e[10] - 1);
        if ((far > 1e-6 || turn > 1e-7) && far < 0.3 && turn < 0.25) for (const c of sheets) c.carry(e);      // a bigger move than that is a jump to a new place: the cloth simply comes with him
      }
      rootWas.copy(root.matrixWorld);
      updateColliders(false); updateHang(); for (const c of sheets) c.begin();
      let nsub = Math.round(cl(dt, 0, 0.05) / H_SUB); nsub = cl(nsub, dt > 0 ? 1 : 0, 5); if (!on) nsub = 1;
      for (let s = 1; s <= nsub; s++) { const f = s / nsub; lerpColliders(f); for (const c of sheets) c.step(H_SUB, f, 2, !on); }
      for (const c of sheets) c.finish();
    }
    // a meter (as Io's tools/pen.py): how deep the drawn cloth of each sheet is inside the capsules it must stay out of. [points inside, deepest in mm]
    function pen() {
      const res = {};
      for (const c of sheets) {
        let cnt = 0, deep = 0, where = '';
        for (let i = 0; i < c.FC * c.FR; i++) {
          const x = c.fpos[i * 3], y = c.fpos[i * 3 + 1], z = c.fpos[i * 3 + 2];
          for (const k of c.colls) {
            const q = k * 8, C = COLL[k], px = x - cS[q], py = y - cS[q + 1], pz = z - cS[q + 2];
            let t = (px * cS[q + 3] + py * cS[q + 4] + pz * cS[q + 5]) * cS[q + 6]; if (t < 0 && C.open0) continue; t = t < 0 ? 0 : t > 1 ? 1 : t;
            const d = Math.hypot(px - cS[q + 3] * t, py - cS[q + 4] * t, pz - cS[q + 5] * t) - (C.r0 + (C.r1 - C.r0) * t);
            if (d < 0) { cnt++; if (-d > deep) { deep = -d; where = 'row ' + Math.floor(i / c.FC) + ' of ' + c.FR + ', column ' + (i % c.FC) + ' of ' + c.FC + ', capsule ' + k + ' at ' + t.toFixed(2); } }
          }
        }
        res[c.name] = [cnt, Math.round(deep * 10000) / 10, where];
      }
      return res;
    }
    // a second meter: the loose point of each sheet that is furthest past its leash (or nearest to it). [how far it is from where its bones would carry it in mm, its leash in mm, any number gone bad, see below]
    function stray() {
      const res = {};
      for (const c of sheets) {
        let far = 0, L = 0, bad = false, fi = -1;
        for (let i = 0; i < c.n; i++) { const d = Math.hypot(c.pos[i * 3] - c.tgt[i * 3], c.pos[i * 3 + 1] - c.tgt[i * 3 + 1], c.pos[i * 3 + 2] - c.tgt[i * 3 + 2]); if (!(d < 1e3)) bad = true; if (d - c.teth[i] > far - L || fi < 0) { far = d; L = c.teth[i]; fi = i; } }
        // and for that point: how far it is from the nearest arm it is kept out of (0 = it is lying on the arm, which is what pushed it past its leash)
        let gap = null;
        for (const k of c.colls) { const q = k * 8, C = COLL[k], px = c.pos[fi * 3] - cS[q], py = c.pos[fi * 3 + 1] - cS[q + 1], pz = c.pos[fi * 3 + 2] - cS[q + 2]; let t = (px * cS[q + 3] + py * cS[q + 4] + pz * cS[q + 5]) * cS[q + 6]; if (t < 0 && C.open0) continue; t = t < 0 ? 0 : t > 1 ? 1 : t; const d = Math.hypot(px - cS[q + 3] * t, py - cS[q + 4] * t, pz - cS[q + 5] * t) - (C.r0 + (C.r1 - C.r0) * t) - c.margin; if (gap == null || d < gap) gap = d; }
        res[c.name] = [Math.round(far * 10000) / 10, Math.round(L * 10000) / 10, bad, gap == null ? null : Math.round(gap * 10000) / 10];
      }
      return res;
    }
    // every drawn point of every sheet added up: two runs that end on the same number moved the same way
    function sum() { let s = 0; for (const c of sheets) for (let i = 0; i < c.fpos.length; i++) s += c.fpos[i] * (1 + (i % 7)); return s; }
    return { collider, makeSheet, sheets, step, pen, stray, sum, LM, HANG, get on() { return on; }, set on(v) { on = !!v; }, settle() { ready = false; } };
  })();

  // ---------- a light sway for his trousers ----------
  // Chris thinks of the trousers as flowy too. They are not made cloth here: they stay the skinned garment of stage 2, holes and all.
  // Instead each leg has two small weights on springs, one hung from the middle of the thigh and one from the knee. When the leg swings,
  // a weight lags behind its point and swings back. The trousers' material moves each point of cloth by its weight's lag, times how
  // much room the cloth has there (TR_SWAY.room: under half the gap between cloth and leg, and nothing at the waist, at the gathered
  // bottom or along the middle seam). So the baggy part trails the leg a little and settles. As he rests, no point can move more than
  // 0.45 of its gap to the leg. In a bent leg the gap is not the resting one, so that is not a proof: tools/trouser_walk.py counts doll
  // showing through the swaying cloth (none in walk, idle and talk; thousands of pixels when the sway is made eight times too big).
  // The springs are stiff enough (26 a second) that in his walk the lag stays under the cap: softer ones (14) sat on the cap all the time.
  // It is the same on every run (fixed steps, no chance), cannot run away (the lag is capped at MAX) and costs four springs.
  const TR_SWAY = (() => {
    const MAX = 0.02, W2 = 26 * 26, DAMP = 18, H = 1 / 120, uni = [V3(), V3(), V3(), V3()];
    const st = [0, 1, 2, 3].map(() => ({ p: V3(), was: V3(), d: V3(), v: V3(), ok: false })), q = V3(), e = V3();
    // where a spring hangs, in his own space: 0 his right thigh's middle, 1 his right knee, 2 and 3 the same on his left
    const point = (k, out) => { const S = k < 2 ? 'R' : 'L'; out.setFromMatrixPosition(CLOTH.LM[BI['shin' + S]]); if (k % 2 === 0) { e.setFromMatrixPosition(CLOTH.LM[BI['thigh' + S]]); out.lerp(e, 0.5); } return out; };
    function step(dt, jump) {
      dt = cl(dt, 0, 0.05); const n = Math.max(1, Math.round(dt / H));
      for (let k = 0; k < 4; k++) {
        const s = st[k]; point(k, q);
        if (!s.ok || jump || !CLOTH.on || dt <= 0) { s.p.copy(q); s.was.copy(q); if (!s.ok || jump || !CLOTH.on) { s.d.set(0, 0, 0); s.v.set(0, 0, 0); } s.ok = true; uni[k].copy(s.d).multiplyScalar(1 / MAX); continue; }
        // the point's own change of speed is what throws the weight back: a = -w2 d - damp v - (the point's acceleration)
        const vx = (q.x - s.p.x) / dt, vy = (q.y - s.p.y) / dt, vz = (q.z - s.p.z) / dt, ux = (s.p.x - s.was.x) / dt, uy = (s.p.y - s.was.y) / dt, uz = (s.p.z - s.was.z) / dt;
        const ax = cl((vx - ux) / dt, -60, 60), ay = cl((vy - uy) / dt, -60, 60), az = cl((vz - uz) / dt, -60, 60);
        for (let i = 0; i < n; i++) {
          s.v.x += (-W2 * s.d.x - DAMP * s.v.x - ax) * H; s.v.y += (-W2 * s.d.y - DAMP * s.v.y - 0.5 * ay) * H; s.v.z += (-W2 * s.d.z - DAMP * s.v.z - az) * H;
          s.d.x += s.v.x * H; s.d.y += s.v.y * H; s.d.z += s.v.z * H;
        }
        const L = s.d.length(); if (!(L < 1e3)) { s.d.set(0, 0, 0); s.v.set(0, 0, 0); } else if (L > MAX) { s.d.multiplyScalar(MAX / L); s.v.multiplyScalar(0.5); }
        s.was.copy(s.p); s.p.copy(q); uni[k].copy(s.d).multiplyScalar(1 / MAX);
      }
    }
    // how much room a point of the trousers has, as a share of MAX, and which spring it listens to (0 the thigh's, 1 the knee's)
    const room = (x, y, z, yBottom) => [cl(0.45 * (DOLL.F(x, y, z) - 0.004) / MAX, 0, 1) * sm(yBottom + 0.02, yBottom + 0.12, y) * (1 - sm(0.86, 0.95, y)) * sm(0.01, 0.06, Math.abs(x)), 1 - sm(0.50, 0.80, y)];
    return { step, uni, room, st, MAX };
  })();

  // ---------- the capsules his cloth is kept out of ----------
  // Arms: the doll's own sizes (D_ARM: 4.8 cm at the shoulder, 4.0 at the elbow, 3.1 at the wrist), a little over. Trunk and hips: the
  // corset and trousers as the old skin has them (N_TRUNK), as lying capsules a spine bone apart.
  // The trunk comes first and the arms last: a point is pushed out of each in turn and the last push wins, and it must be the arm's.
  CLOTH.collider('spine3', [-0.066, 1.335, 0.012], 'spine3', [0.066, 1.335, 0.012], 0.118, 0.118, 1);
  CLOTH.collider('spine2', [-0.052, 1.215, 0.020], 'spine2', [0.052, 1.215, 0.020], 0.106, 0.106, 1);
  CLOTH.collider('spine1', [-0.056, 1.095, 0.016], 'spine1', [0.056, 1.095, 0.016], 0.104, 0.104, 1);
  CLOTH.collider('hips', [-0.066, 0.975, 0.0], 'hips', [0.066, 0.975, 0.0], 0.122, 0.122, 8);
  for (const [S, s] of SIDES) {
    const sh = restPts['sh' + S], el = restPts['el' + S], wr = restPts['wr' + S], d = armDir[S], hd = wr.clone().addScaledVector(d, 0.10), m = s < 0 ? 2 : 4;
    // the doll's upper arm is not centred on its bone: it sits up to 12 mm to the body's side of it (D_ARM). The capsule is moved the same way.
    const nx = s * Math.cos(A_POSE), ny = Math.sin(A_POSE);
    CLOTH.collider('uarm' + S, [sh.x - nx * 0.008, sh.y - ny * 0.008, sh.z + 0.003], 'farm' + S, [el.x - nx * 0.002, el.y - ny * 0.002, el.z], 0.0500, 0.0420, m, true);
    CLOTH.collider('farm' + S, [el.x - nx * 0.002, el.y - ny * 0.002, el.z], 'hand' + S, [wr.x, wr.y, wr.z], 0.0420, 0.0320, m);
    CLOTH.collider('hand' + S, [wr.x, wr.y, wr.z], 'hand' + S, [hd.x, hd.y, hd.z], 0.0340, 0.0360, m);
    CLOTH.collider('thigh' + S, [s * 0.105, 0.90, 0.005], 'shin' + S, [s * 0.128, 0.56, 0], 0.118, 0.108, 8);
  }

  // ---------- the pieces ----------
  // Measured (tools/shirt_measure.py, gridded copies of B1 and B2 in the model's metres):
  //   the open V          skin shows from the neck down to 1.39 m; its edges are 4.8 cm either side of the middle at 1.50 and 2.8 at 1.45
  //   eyelets             four a side, 3 cm from the middle, at 1.438, 1.398, 1.358 and 1.318 m; the cord's ends hang to 1.255
  //   the ruffled front   from 4 to 5 cm either side of the middle out to 15.5 cm at 1.40 m, 10 cm at 1.30, ending in a point at 1.245. In
  //                       B2 (read by eye off a gridded copy) its foremost edge is about 4 cm in front of the corset's top edge; the model's, measured, is 5.5 cm at 1.28 m, 4.5 at 1.31 and 3.4 at 1.34.
  //                       (An earlier note here said 6 to 8 cm off his chest. That was the width of the fan seen from the side, not how far it stands.)
  //                       B2 shows four or five tiers; the model has three.
  //   collar              points at 10 cm either side, 1.455 m; lace-edged hem at 1.43 to 1.45 m across his back, out to 17 cm
  //   shoulder seam       20 cm either side at 1.45 m
  //   corset's top edge   front 1.29 m, dipping to 1.245 at the middle; back 1.287; sides (B2) 1.279
  const SHIRT = (() => {
    const XLIM = 0.190;                                 // the body of the shirt ends in a flat armhole this far out; the sleeve's head covers it
    // the doll without its arms beyond the armhole. The corner where the body's cloth turns into the flat of the armhole is rounded
    // (2 cm), so that the coarse sheet of points can follow it: a sharp corner was cut short and his shoulder showed through.
    const G = (x, y, z) => { const a = DOLL.F(x, y, z), b = Math.abs(x) - XLIM, k = 0.020, h = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + h * h * h * k / 6; };
    const TK = DOLL.tables.trunk, trunkMid = (y) => { const v = spline(TK, cl(y, TK[0][0], TK[TK.length - 1][0])); return (v[1] + v[2]) / 2; };
    // how far the cloth stands off his skin, by height. Below CORSET_TOP it is not used: there the cloth lies just inside the corset.
    const EASE = [[1.30, 0.020], [1.335, 0.019], [1.400, 0.014], [1.450, 0.012], [1.500, 0.012]];
    const easeAt = (y) => prof(EASE, y, true);
    // the corset is still the old clothes-shaped skin (N30_body.js, trunkPt). How far out that skin is from the point (0, y, cz) in the direction (sx, sz):
    const CORSET_TOP = 1.286, BLOUSE_TOP = 1.372, BLOUSE_IN = 0.50;      // the cloth leans back in from the corset's edge this fast (metres a metre) until it meets its own ease; above BLOUSE_TOP it is the ease alone
    const oldR = (y, cz, sx, sz) => {
      const v = spline(N_TRUNK, y), oc = (v[1] + v[2]) / 2, pw = trunkPw(y), inside = (r) => { const x = r * sx, z = cz + r * sz - oc; return Math.pow(Math.abs(x) / v[0], pw) + Math.pow(Math.abs(z) / (z >= 0 ? v[1] - oc : oc - v[2]), pw) < 1; };
      let a = 0, b = 0.4; for (let it = 0; it < 22; it++) { const m = (a + b) / 2; if (inside(m)) a = m; else b = m; }
      return a;
    };
    const vHalf = (y) => 0.050 * cl((y - 1.368) / 0.132, 0, 1);                 // half the width of the open V at a height
    // how far out the cloth is from the trunk's middle line at height y, in the direction th (0 the front, a quarter turn his left)
    // Above the corset: his skin plus the ease, and never less than a little outside the corset's top edge, so the cloth blouses over the
    // edge and there is no gap to see into. Inside the corset: 4 mm inside the corset's skin (and never nearer than 3 mm to his own).
    const dollR = (y, cz, sx, sz, e) => {
      let r = 0.34; while (r > 0.02 && G(r * sx, y, cz + r * sz) - e > 0) r -= 0.004;
      let a = r, b = r + 0.004; for (let it = 0; it < 12; it++) { const m = (a + b) / 2; if (G(m * sx, y, cz + m * sz) - e < 0) a = m; else b = m; }
      return (a + b) / 2;
    };
    const bodyR = (y, th, extra) => {
      const cz = trunkMid(y), sx = Math.sin(th), sz = Math.cos(th);
      if (y < CORSET_TOP) return Math.max(dollR(y, cz, sx, sz, 0.003), oldR(y, cz, sx, sz) - 0.004);
      const rd = dollR(y, cz, sx, sz, easeAt(y) + (extra || 0)); if (y > BLOUSE_TOP) return rd;
      const czT = trunkMid(CORSET_TOP), over = oldR(CORSET_TOP, czT, sx, sz) + 0.007 - BLOUSE_IN * (y - 1.298), rr = Math.hypot(over * sx, czT + over * sz - cz);
      return Math.max(rd, rr);
    };
    // the corset's own front at (x, y), for things that hang over it
    const zOld = (x, y) => { const v = spline(N_TRUNK, y), oc = (v[1] + v[2]) / 2, q = Math.min(1, Math.abs(x) / v[0]); return oc + (v[1] - oc) * Math.pow(Math.max(0, 1 - Math.pow(q, trunkPw(y))), 1 / trunkPw(y)); };
    // the front of the shirt's body at (x, y): how far forward the cloth is there
    const zBody = (x, y) => {
      const cz = trunkMid(y), e = easeAt(Math.max(y, CORSET_TOP)); let a = cz - 0.02, b = 0.30;
      for (let it = 0; it < 18; it++) { const m = (a + b) / 2; if (G(x, y, m) - e < 0) a = m; else b = m; }
      const zd = (a + b) / 2; return y > BLOUSE_TOP || y < CORSET_TOP ? zd : Math.max(zd, zOld(x, CORSET_TOP) + 0.007 - BLOUSE_IN * (y - 1.298));
    };
    // the front of whatever is outermost there: the shirt above the corset's edge, the corset below it
    const zCover = (x, y) => (y > CORSET_TOP + 0.012 ? zBody(x, y) : Math.max(y > CORSET_TOP - 0.02 ? zBody(x, CORSET_TOP + 0.012) - 0.003 : -1, zOld(x, Math.min(y, CORSET_TOP)) + 0.003));
    // how high the doll (with the shirt's body on it and 'clear' more) stands over the point (x, z) of the floor; null where there is none of him above 1.36 m
    const surfY = (x, z, clear) => {
      let y = 1.62; while (y > 1.36 && DOLL.F(x, y, z) - clear > 0) y -= 0.004;
      if (y <= 1.36) return null;
      let a = y, b = y + 0.004; for (let it = 0; it < 10; it++) { const m = (a + b) / 2; if (DOLL.F(x, m, z) - clear < 0) a = m; else b = m; }
      return (a + b) / 2;
    };
    const wBody = (x, y, z) => DOLL.wAt(x, Math.min(y, 1.43), z);              // as the doll's skin under it; above 1.43 m as his shoulders, not as his neck: a shirt does not turn with the head
    const rowAt = (rows, sv) => { const f = sv * (rows.length - 1), i = Math.min(rows.length - 2, Math.floor(f)); return lerp(rows[i], rows[i + 1], f - i); };

    // --- the body ---
    const B_Y = [1.497, 1.487, 1.474, 1.458, 1.438, 1.412, 1.382, 1.350, 1.322, 1.298, 1.272, 1.248, 1.220], B_NC = Q(51, 33);
    const bodyRows = B_Y.map((y) => {
      const N = 144, cz = trunkMid(y), w = vHalf(y), ring = [];
      const r0 = bodyR(y, 0), th0 = w > 0.0005 ? Math.asin(Math.min(0.9, w / r0)) : 0.0005;
      for (let k = 0; k <= N; k++) { const th = lerp(th0, TAU - th0, k / N), r = bodyR(y, th); ring.push([r * Math.sin(th), y, cz + r * Math.cos(th)]); }
      const cum = [0]; for (let k = 1; k <= N; k++) cum.push(cum[k - 1] + Math.hypot(ring[k][0] - ring[k - 1][0], ring[k][2] - ring[k - 1][2]));
      const row = []; let k = 0;
      for (let c = 0; c < B_NC; c++) { const s = cum[N] * c / (B_NC - 1); while (k < N - 1 && cum[k + 1] < s) k++; const u = cl((s - cum[k]) / (cum[k + 1] - cum[k] || 1), 0, 1); row.push([lerp(ring[k][0], ring[k + 1][0], u), y, lerp(ring[k][2], ring[k + 1][2], u)]); }
      row.len = cum[N]; return row;
    });
    CLOTH.makeSheet({
      name: 'body', cols: B_NC, rows: B_Y.length, K: Q(3, 2), inside: [0, 1.34, -0.01], mask: 0, grav: 0.4,
      rest: (c, r) => {
        const p = bodyRows[r][c], y = p[1], ax = Math.abs(p[0]), edge = Math.min(c, B_NC - 1 - c);
        let pin = 0.07, tether = Math.max(0.003, easeAt(y) - 0.006);
        if (y > 1.45) pin = 0.35;
        if (y < 1.305) { pin = 0.45; tether = 0.004; }                          // the row that blouses over the corset's edge must stay outside it
        if (edge === 2) pin = Math.max(pin, 0.4);
        if (r < 2 || y < CORSET_TOP || edge < 2 || (ax > 0.160 && y > 1.33)) pin = 1;
        return { p, w: wBody(p[0], p[1], p[2]), pin, tether };
      },
      // gathers that fan up from the corset's edge, and a little unevenness everywhere else
      fold: (su, sv) => { const y = rowAt(B_Y, sv), band = sm(0.035, 0.075, Math.min(su, 1 - su)), g = band * sm(1.415, 1.305, y) * sm(1.270, 1.292, y); return 0.0034 * g * (1 + Math.cos(TAU * 27 * su + 2.4 * Math.sin(TAU * 5 * su) + 9 * (y - 1.29))) + 0.0045 * band * sm(1.27, 1.31, y) * sm(1.50, 1.44, y) * fbm(su * 13, y * 15); },
      uvm: [bodyRows[6].len, 0.36], dark: 0.56, contrast: 3.2,
      tint: (su, sv) => { const y = rowAt(B_Y, sv); return (1 - 0.12 * sm(1.315, 1.283, y)) * (0.93 + 0.16 * fbm(su * 9 + 3, y * 11)) * (1 - 0.07 * sm(1.40, 1.33, y) * Math.pow(Math.max(0, Math.sin(TAU * (su * 13 + 0.6 * Math.sin(y * 21)))), 3)); }
    });

    // --- the sleeves and their cuffs ---
    // rings along the arm: distance from the shoulder joint, how hard it is pinned, how far it may stray
    // The next three rings turn partly with his body and partly with his arm (55, 28 and 10 parts in a hundred body), so that when the arm
    // lifts, the head of the sleeve is spread over 10 cm of cloth and not torn across the 4 cm between the seam and the first ring.
    // The first ring is not round the arm at all: it is the seam, the rim of the body's armhole (where the body's cloth is cut off flat at
    // XLIM), and it moves exactly as the body's cloth there does. So the sleeve grows out of the body with no gap at the shoulder.
    const S_SL = [-0.030, 0.008, 0.036, 0.064, 0.096, 0.128, 0.160, 0.192, 0.224, 0.254, 0.280, 0.300, 0.314, 0.326];
    const S_PIN = [1, 0.7, 0.25, 0.06, 0.035, 0.03, 0.03, 0.03, 0.03, 0.035, 0.06, 0.15, 0.6, 1];
    const S_TETH = [0, 0.003, 0.010, 0.03, 0.045, 0.05, 0.05, 0.05, 0.05, 0.045, 0.035, 0.02, 0.006, 0];
    const seamAt = (s, a) => {
      const X = s * (XLIM - 0.010), y0 = 1.418, z0 = N_SHOULDER[2] + 0.004, ca = Math.cos(a), sa = Math.sin(a); let r = 0.02;
      const f = (r) => { const y = y0 + r * ca; return G(X, y, z0 + r * sa) - easeAt(Math.max(y, CORSET_TOP)) + 0.002; };      // 2 mm under the body's cloth, so the seam itself is hidden
      while (r < 0.16 && f(r) < 0) r += 0.004;
      let lo = r - 0.004, hi = r; for (let it = 0; it < 12; it++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
      return [X, y0 + lo * ca, z0 + lo * sa];
    };
    const S_NC = Q(22, 16), S_RMIN = 0.062, BAND_R = 0.0465;
    const headR = (sl) => lerp(0.054, S_RMIN, sm(0.0, 0.085, sl));      // B1: the sleeve's head is close on the shoulder (24 cm from his middle at 1.45 m); the fullness comes below it
    const slvR = (sl) => (sl < 0.006 ? headR(sl) * lerp(0.5, 1, sm(-0.046, 0.006, sl)) : sl <= 0.290 ? Math.max(headR(sl), armAt(sl)[0] * sm(-0.02, 0.085, sl)) : lerp(Math.max(S_RMIN, armAt(0.290)[0]), BAND_R, sm(0.292, 0.326, sl)));
    const slvHang = (sl) => (sl <= 0.290 ? -armAt(sl)[1] * sm(-0.02, 0.06, sl) : lerp(-armAt(0.290)[1], 0.004, sm(0.290, 0.326, sl)));
    // the cuffs: [from, to (along the arm), radius at the band, at the hem, slack toward the ground at the hem, flutes round, their depth, where they start]
    const CUFFS = [[0.312, 0.360, 0.054, 0.090, 0.012, 11, 0.0060, 1.0], [0.324, 0.410, 0.048, 0.093, 0.019, 13, 0.0075, 1.7]];
    // unevenness that comes round to where it started: a sleeve is a closed tube, and its folds must be the same on both sides of the
    // line where the sheet's first and last columns meet. (First try used plain noise: the two sides stood at different heights and
    // his arm showed through a hairline slit down the whole sleeve.)
    const roundN = (su, f, v, fn) => lerp(fn(su * f, v), fn((su - 1) * f, v), su);
    for (const [S, s] of SIDES) {
      const d = armDir[S], sh = restPts['sh' + S], nrm = V3(s * Math.cos(A_POSE), Math.sin(A_POSE), 0), aMask = s < 0 ? 2 : 4;
      const at = (sl, R, a, hg) => { const ca = Math.cos(a), sa = Math.sin(a), bx = sh.x + d.x * sl + nrm.x * ca * R, by = sh.y + d.y * sl + nrm.y * ca * R, bz = sh.z + sa * R; return { base: [bx, by, bz], p: [bx - nrm.x * hg, by - nrm.y * hg, bz] }; };
      const ph = s < 0 ? 0.0 : 2.3;
      // Over the shoulder the sleeve lies on him: each ring of the sleeve's head is slid down until its top is 9 mm off his skin. (Left
      // centred on the joint, the head stood 17 mm proud and made a pointed shoulder.)
      const headHang = S_SL.map((sl) => { let hg = slvHang(sl); if (sl > 0 && sl < 0.13) { let n = 0; while (n++ < 40 && DOLL.F(...at(sl, slvR(sl), 0, hg).p) > 0.009) hg += 0.001; } return hg; });
      // The sleeve is kept out of his arm only, not out of his trunk. Under the arm the sleeve runs into the body of the shirt, as the two
      // are built, and is hidden there. (First try: kept out of the trunk as well. In the armpit the arm is itself inside the trunk's
      // capsule, so points there were pushed out of one and then out of the other, came out on the wrong side of the arm, and tore a hole.)
      CLOTH.makeSheet({
        name: 'sleeve' + S, cols: S_NC, rows: S_SL.length, wrap: true, K: Q(4, 3), side: S, mask: aMask, margin: 0.008, grav: 0.5, bend: 0.2,
        inside: [sh.x + d.x * 0.16, sh.y + d.y * 0.16, sh.z],
        rest: (c, r) => {
          const sl = S_SL[r], a = (c / S_NC) * TAU, hg = headHang[r], clr = 0.009; let R = slvR(sl), q = at(sl, R, a, hg);
          if (r === 0) { const p = seamAt(s, a); return { p, w: wBody(p[0] - s * 0.012, p[1], p[2]), pin: 1, tether: 0 }; }
          if (sl > -0.03) { const far = Math.cos(a) > -0.45 ? DOLL.F : (x, y, z) => DOLL.fArm(s, x, y, z); let n = 0; while (n++ < 30 && far(q.p[0], q.p[1], q.p[2]) < clr) { R += 0.002; q = at(sl, R, a, hg); } }      // top, front and back: clear of his whole shoulder. Underneath: clear of the arm only, because there the sleeve runs into the body of the shirt      // never nearer his arm than this: the top of the sleeve lies on the arm, the rest hangs below it
          const wa = wArm(S, sl), share = r === 1 ? 0.55 : r === 2 ? 0.28 : r === 3 ? 0.10 : 0;
          if (share > 0) { const sp = seamAt(s, a), wb = wBody(sp[0] - s * 0.012, sp[1], sp[2]), w = [BI['uarm' + S], 1 - share]; let tot = 0; for (let k = 1; k < wb.length && k < 6; k += 2) tot += wb[k]; for (let k = 0; k < wb.length && k < 6; k += 2) w.push(wb[k], share * wb[k + 1] / tot); return { p: q.p, base: q.base, hang: hg, w, pin: S_PIN[r], tether: S_TETH[r] }; }
          return { p: q.p, base: q.base, hang: hg, w: wa, pin: S_PIN[r], tether: S_TETH[r] };
        },
        // gathers into the shoulder seam and into the band, and the soft rolls where the full sleeve pouches over the band
        fold: (su, sv) => {
          const sl = rowAt(S_SL, sv), gs = sm(0.105, 0.0, sl) * sm(-0.030, -0.012, sl), gb = sm(0.185, 0.305, sl), mid = sm(0.03, 0.10, sl) * sm(0.31, 0.25, sl);
          return 0.0028 * gs * (0.55 + 0.9 * roundN(su, 11, 1.7 + ph, vnoise)) * (1 + Math.cos(TAU * 16 * su + 1.3 * Math.sin(TAU * 3 * su + ph))) + 0.0040 * gb * (0.45 + 1.1 * roundN(su, 9, sl * 9 + ph, vnoise)) * (1 + Math.cos(TAU * 15 * su + 2.2 * Math.sin(TAU * 2 * su + 1 + ph) + 1.4 * Math.sin(TAU * 5 * su + ph) + 10 * sl)) * (0.55 + 0.45 * sm(0.326, 0.30, sl))
            + 0.0110 * mid * Math.max(0, roundN(su, 5, sl * 13 + ph, fbm) - 0.38) + 0.0030 * gb * (1 + Math.sin(TAU * 13 * sl + 2.2 * Math.sin(TAU * su * 2 + ph)));
        },
        uvm: [TAU * 0.068, 0.37], uv0: s * 0.31, dark: 0.56, contrast: 3.6,
        tint: (su, sv) => { const sl = rowAt(S_SL, sv); return 1.05 * (1 - 0.12 * Math.pow(Math.max(0, -Math.cos(TAU * su)), 2) * sm(0.02, 0.12, sl)) * (0.93 + 0.16 * roundN(su, 4, sl * 9 + ph, fbm)) * (1 - 0.10 * sm(0.03, 0.10, sl) * sm(0.30, 0.22, sl) * Math.pow(Math.max(0, Math.sin(TAU * (su * 6 + 0.5 * Math.sin(sl * 16 + ph)))), 4)) * (1 - 0.10 * sm(0.26, 0.31, sl) * sm(0.326, 0.315, sl)); }      // the under side of the sleeve is in its own shade
      });
      CUFFS.forEach(([s0, s1, r0, r1, off1, flutes, amp, ph0], ti) => {
        const off0 = slvHang(s0), NR = 4, PIN = [1, 0.3, 0.07, 0.045], TETH = [0, 0.006, 0.02, 0.032], len = Math.hypot(s1 - s0, r1 - r0), lace0 = 0.42;
        const reps = Math.round(TAU * (r0 + r1) * 0.5 * 1.25 / ((1 - lace0) * len * ((BAKED && BAKED.laceAspect) || 0.37)));
        CLOTH.makeSheet({
          name: 'cuff' + S + ti, cols: Q(18, 12), rows: NR, wrap: true, K: Q(5, 3), side: S, mask: 1 | 8 | aMask, margin: 0.006, grav: 0.5, bend: 0.3,
          inside: [sh.x + d.x * (s0 + s1) / 2, sh.y + d.y * (s0 + s1) / 2, sh.z],
          rest: (c, r) => { const t = r / (NR - 1), q = at(lerp(s0, s1, t), lerp(r0, r1, Math.pow(t, 0.8)), (c / Q(18, 12)) * TAU, lerp(off0, off1, t)); return { p: q.p, base: q.base, hang: lerp(off0, off1, t), w: [BI['farm' + S], 1], pin: PIN[r], tether: TETH[r] }; },
          fold: (su, sv) => amp * sv * (Math.cos(TAU * flutes * su + ph0 * s) + 0.35 * Math.cos(TAU * (flutes * 2 + 1) * su + 2 * ph0 * s)),
          uvm: [TAU * (r0 + r1) * 0.5, len], uv0: 0.17 * ti, dark: 0.70,
          tint: (su, sv) => (ti ? 0.90 : 1) * (1 - 0.10 * (1 - sv)),
          lace: (su, sv) => [su * reps, (sv - lace0) / (1 - lace0)]
        });
      });
    }

    // --- the ruffled front: two layers each side of the lacing ---
    // A strip sewn along the edge of the front band from under the collar down to the corset, fanning outward and, at its lower end,
    // hanging down over the corset's top. [how far along it (0 top, 1 bottom), its width there]
    const J_W = [[0, 0.070], [0.22, 0.112], [0.45, 0.112], [0.70, 0.094], [0.88, 0.074], [1, 0.054]], J_Y0 = 1.470, J_Y1 = 1.292, J_NC = 11, J_NR = 4;
    const J_PIN = [1, 0.35, 0.09, 0.05], J_TETH = [0, 0.006, 0.014, 0.022];
    // The flutes: along the free edge the cloth rises off the shirt and falls back to it, six or seven times a side; where it is down it
    // lies on the tier under it. Three tiers a side, as B1 and the close painting have it: the under one widest and flattest, each one
    // over it narrower and standing higher, every one edged with lace, so three lace hems step outward from the lacing.
    // [how wide (share of J_W), flutes along it, how high they stand, how far the hem is lifted off the tier below, where the lace starts]
    const J_TIER = [[1.00, 7.5, 0.0068, 0.004, 0.78], [0.68, 6.5, 0.0100, 0.012, 0.78], [0.40, 5.5, 0.0120, 0.020, 0.74]];
    const jabot = (s, layer) => {
      const [wide, n, amp, base, lace0] = J_TIER[layer], ph = (s < 0 ? 0.7 : 3.1) + layer * 1.9;
      const pt = (c, r) => {
        const t = c / (J_NC - 1), q = r / (J_NR - 1), ya = lerp(J_Y0, J_Y1, t), xa = lerp(Math.max(vHalf(ya) + 0.026, 0.040), 0.027, sm(0.72, 1.0, t)) + layer * 0.004, W = prof(J_W, t, true) * wide, phi = lerp(8, 82, sm(0.40, 1.0, t)) * DEG;
        const x = xa + W * q * Math.cos(phi), y = ya - W * q * Math.sin(phi) - 0.012 * q * q, zs = zCover(Math.min(x, XLIM - 0.012), Math.max(y, 1.20));
        return { x: s * x, y, zs, z: zs + 0.003 + layer * 0.003 + base * Math.pow(q, 0.7) };
      };
      const reps = Math.max(4, Math.round(0.26 / ((1 - lace0) * 0.10 * wide * ((BAKED && BAKED.laceAspect) || 0.37))));
      const wave = (su) => TAU * n * su + ph + 1.1 * Math.sin(TAU * 1.3 * su + ph) + 0.5 * Math.sin(TAU * 3.1 * su + 2 * ph);
      CLOTH.makeSheet({
        name: 'ruffle' + (s < 0 ? 'R' : 'L') + layer, cols: J_NC, rows: J_NR, K: Q(layer ? 6 : 7, 4), inside: [0, 1.36, -0.25], mask: 0, grav: 0.5, bend: 0.3,
        rest: (c, r) => { const q = pt(c, r), a = pt(c, 0); return { p: [q.x, q.y, q.z], w: wBody(a.x, a.y, a.zs - 0.012), pin: J_PIN[r], tether: J_TETH[r] }; },
        fold: (su, sv) => amp * Math.pow(sv, 1.2) * (1 + Math.cos(wave(su))) * (0.8 + 0.4 * vnoise(su * 9 + ph, 3.3)),
        shift: (su, sv) => 0.55 * amp * Math.pow(sv, 1.2) * Math.sin(wave(su)),
        uvm: [0.25, 0.10 * wide], uv0: 0.37 * layer + (s < 0 ? 0.2 : 0.6), dark: 0.52, contrast: 3.4,
        // measured against B1 (tools/shirt_cmp.py): the painted ruffle is light cream (204,166,138) with deep narrow shade between its flutes (spread 31 to 44)
        tint: (su, sv) => [1.10, 1.13, 1.16][layer] * (1 - (layer < 2 ? 0.16 : 0.06) * sm(0.55, 0.15, sv)),
        lace: (su, sv) => [su * reps, (sv - lace0) / (1 - lace0)]
      });
    };
    for (const [, s] of SIDES) for (let layer = 0; layer < J_TIER.length; layer++) jabot(s, layer);

    // --- the collar ---
    // A band standing round his neck that folds over and lies out across his shoulders, lace along its hem; at the front its two ends
    // run down from the neck to a point each on his chest. Columns go from his right point round the back to his left point.
    const C_NC = Q(29, 21), C_NR = 4, C_PSI0 = 0.72, C_CZ = -0.027, C_RX = 0.067, C_RZ = 0.066, C_HEM_Y = 1.447, C_HEM_X = 0.172, C_PT_X = 0.100;
    const C_PIN = [1, 1, 0.6, 0.3], C_TETH = [0, 0, 0.003, 0.006];
    // the hem lies on the shirt along a level line round him at C_HEM_Y (over the shoulders it rides up onto their tops); where that line is C_PT_X from the middle at the front it stops: the collar's points
    let C_TH0 = 0.3;
    const hemAt = (th) => { const hy = C_HEM_Y - 0.020 * Math.pow(sm(1.25, C_TH0, Math.min(th, TAU - th)), 2), r = bodyR(hy, th, 0.006), cz = trunkMid(hy), x = cl(r * Math.sin(th), -C_HEM_X, C_HEM_X), z = cz + r * Math.cos(th), sy = surfY(x, z, 0.019); return [x, Math.max(hy, sy == null ? 0 : sy), z]; };      // the points at the front hang 2 cm lower than the rest of the hem
    { let a = 0.2, b = 1.5; for (let it = 0; it < 20; it++) { const m = (a + b) / 2; if (bodyR(C_HEM_Y - 0.020, m, 0.006) * Math.sin(m) < C_PT_X) a = m; else b = m; } C_TH0 = (a + b) / 2; }
    const collarPt = (c, r) => {
      const f = c / (C_NC - 1), psi = lerp(C_PSI0, TAU - C_PSI0, f), th = lerp(C_TH0, TAU - C_TH0, f), h = hemAt(th);
      const yn = 1.502 + 0.011 * (0.5 - 0.5 * Math.cos(psi)), nx = C_RX * Math.sin(psi), nz = C_CZ + C_RZ * Math.cos(psi);
      const e = Math.max(1 - sm(0, 0.14, f), 1 - sm(1, 0.86, f));      // toward its two ends the collar stands less and lies down onto his chest
      if (r === 0) return [nx * 1.03, yn - 0.016 - 0.008 * e, C_CZ + (nz - C_CZ) * 1.03, h];
      if (r === 1) return [nx * (0.97 + 0.08 * e), yn + 0.010 - 0.030 * e, C_CZ + (nz - C_CZ) * (0.97 + 0.08 * e), h];      // at its very ends the band is only 4 mm high: taller, and its inside face showed as a small tab at each top corner of the open front
      if (r === 3) return [h[0], h[1], h[2], h];
      const mx = lerp(nx, h[0], 0.5), mz = lerp(nz, h[2], 0.5), sy = surfY(mx, mz, 0.024);
      return [mx, Math.max(sy == null ? 0 : sy, lerp(yn + 0.010, h[1], 0.5) + 0.005), mz, h];
    };
    {
      const lace0 = 0.70, reps = Math.round(0.62 / ((1 - lace0) * 0.085 * ((BAKED && BAKED.laceAspect) || 0.37)));
      CLOTH.makeSheet({
        name: 'collar', cols: C_NC, rows: C_NR, K: Q(3, 2), inside: [0, 1.36, -0.03], mask: 0, grav: 0.4, bend: 0.4,
        rest: (c, r) => { const q = collarPt(c, r), h = q[3]; return { p: [q[0], q[1], q[2]], w: wBody(h[0] * 0.9, h[1] - 0.02, h[2] * 0.9), pin: C_PIN[r], tether: C_TETH[r] }; },
        uvm: [0.62, 0.10], uv0: 0.44,
        tint: (su, sv) => 1 - 0.06 * sm(0.2, 0.0, sv),
        lace: (su, sv) => [su * reps, (sv - lace0) / (1 - lace0)]
      });
    }

    // --- the lacing: a dark red cord crossed between four eyelets a side, its two ends hanging; and the eyelets themselves ---
    const E_Y = [1.438, 1.398, 1.358, 1.318], E_X = 0.030;
    {
      const cord = (pts, r, key) => {
        const P = pts.map((p) => V3(p[0], p[1], p[2])), rings = tubeRings(P, P.map(() => r), 7, V3(0, 0, 1)), part = loft(rings, { capA: true, capB: true });
        part.uv = part.uv.map((v, i) => (i % 2 ? 0.5 : key));
        addPart('lacing', part, (x, y, z) => wBody(x, y, zBody(x, Math.max(y, 1.30)) - 0.016), { out: V3(pts[0][0], pts[0][1], pts[0][2] - 0.1) });
      };
      const on = (x, y, lift) => [x, y, zCover(x, y) + lift];
      const span = (x0, y0, x1, y1, lift) => { const a = []; for (let k = 0; k <= 6; k++) { const t = k / 6, x = lerp(x0, x1, t), y = lerp(y0, y1, t); a.push([x, y, Math.max(zBody(x, y), lerp(zBody(x0, y0), zBody(x1, y1), t)) + lift + 0.002 * Math.sin(PI * t)]); } return a; };
      for (let i = 0; i < E_Y.length - 1; i++) { cord(span(-E_X, E_Y[i], E_X, E_Y[i + 1], 0.0050), 0.0024, 0.25); cord(span(E_X, E_Y[i], -E_X, E_Y[i + 1], 0.0092), 0.0024, 0.25); }
      cord(span(-E_X, E_Y[0], E_X, E_Y[0], 0.0050), 0.0024, 0.25);                                          // the top bar
      for (const s of [-1, 1]) cord([on(s * E_X, E_Y[3], 0.005), on(s * 0.020, 1.300, 0.007), on(s * 0.013, 1.282, 0.012), on(s * (s < 0 ? 0.011 : 0.014), 1.264, 0.016), on(s * 0.012, s < 0 ? 1.250 : 1.243, 0.018)], 0.0022, 0.25);
      for (const y of E_Y) for (const s of [-1, 1]) {                                                       // an eyelet: a small dark metal ring lying on the cloth
        const c = on(s * E_X, y, 0.0022), ring = []; for (let k = 0; k <= 10; k++) { const a = (k / 10) * TAU; ring.push([c[0] + 0.0052 * Math.cos(a), c[1] + 0.0052 * Math.sin(a), c[2] + (zBody(c[0] + 0.0052 * Math.cos(a), c[1]) - zBody(c[0], c[1]))]); }
        cord(ring, 0.0016, 0.75);
      }
    }
    return { G, zBody, zCover, surfY, vHalf, bodyRows, B_Y, S_SL, E_Y, wBody, CORSET_TOP };
  })();
