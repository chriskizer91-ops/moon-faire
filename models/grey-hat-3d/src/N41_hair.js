  // ---------- his hair: long, loose, parted in the middle, lying behind his ears and on his shoulders and back ----------
  // One shell outside his head, shaped by N_HAIR (how far the hair reaches to each side and to the back at each height, measured from
  // B1 and B2). It wraps right over his crown, opens from the parting down to behind his ears, comes forward again under them onto his
  // shoulders, and narrows down his back to its tips. It wears the same four body paintings as the rest of him (material 'projHair').
  // It is one smooth mass for now: no separate locks, and it does not move as hair.
  const H_Y0 = N_HAIR[0][0], H_Y1 = N_HAIR[N_HAIR.length - 1][0];
  // how far round from the middle of his back the hair reaches on each side, in degrees, by height
  const HAIR_A = [[1.32, 55], [1.44, 74], [1.50, 106], [1.555, 110], [1.60, 94], [1.635, 84], [1.67, 90], [1.70, 112], [1.726, 150], [1.744, 180], [1.80, 180]];
  const headFrontZ = (y) => headPoint(0, Math.acos(cl((y - HC.y) / HR.yT, -1, 1)))[2];
  function hairPt(y, a) {                            // a: signed angle from the middle of his back, positive toward his left
    const [rx, zb] = spline(N_HAIR, cl(y, H_Y0, H_Y1)), zc = HC.z + 0.004, s = Math.sin(a), c = Math.cos(a), e = 2 / 2.2;
    // in front of the middle of his head the hair lies close: over the crown it follows his head a finger's width out; lower down it hangs just ahead of his ears
    const rf = y > HC.y ? Math.max(0.03, headFrontZ(Math.min(y, HC.y + HR.yT * 0.985)) + 0.013 - zc) : 0.058;
    return [Math.max(rx, y > 1.60 ? headHalfW(y) + 0.011 : 0) * sgnPow(s, e), y, c >= 0 ? zc - (zc - zb) * Math.pow(c, e) : zc + rf * Math.pow(-c, e)];
  }
  const HEAD_TOP = HC.y + HR.yT, HAIR_TOP = Math.max(H_Y1 + 0.002, HEAD_TOP + 0.016);
  (function buildHair() {
    const NR = Q(128, 64), NU = Q(104, 52), rings = [];
    for (let i = 0; i <= NR; i++) {
      const t = i / NR, y = t < 0.5 ? lerp(H_Y0, 1.60, t / 0.5) : lerp(1.60, HAIR_TOP, (t - 0.5) / 0.5), A = prof(HAIR_A, y, true) * DEG, ring = [];
      const top = cl((y - (HAIR_TOP - 0.032)) / 0.032, 0, 1), rxy = Math.max(spline(N_HAIR, cl(y, H_Y0, H_Y1))[0], 0.02);
      const k = Math.max(Math.sqrt(Math.max(0.0004, 1 - top * top)), y < HEAD_TOP ? (headHalfW(y) + 0.010) / rxy : 0);      // the last rows round the top of his hair off, never closer to his skull than a centimetre
      // each edge turns in and back toward his head or neck, so the shell has no open rim and its turned-in face looks sideways, not forward
      const tuck = (sg) => { const p = hairPt(y, sg * A), inner = (y > 1.58 ? headHalfW(Math.min(y, HC.y + HR.yT * 0.98)) * 0.92 : 0.052) * Math.min(1, Math.abs(Math.sin(A)) + 0.02); return [sg * lerp(Math.abs(p[0]) * k, inner, 0.8), y, p[2] - 0.028 * Math.abs(Math.sin(A))]; };
      ring.push(tuck(-1));
      for (let j = 0; j <= NU; j++) { const p = hairPt(y, lerp(-A, A, j / NU)); ring.push([p[0] * k, y, HC.z - 0.03 + (p[2] - HC.z + 0.03) * k]); }
      ring.push(tuck(1));
      rings.push(ring);
    }
    const wHair = (x, y) => { if (y > 1.61) return [BI.head, 1]; if (y > 1.51) { const u = sm(1.51, 1.61, y); return [BI.neck, 1 - u, BI.head, u]; } const u = sm(1.40, 1.51, y); return [BI.spine3, 1 - u, BI.neck, u]; };
    addPart('projHair', projUV(loft(rings, { open: true, capB: true }), 1), wHair, { out: V3(0, 1.62, HC.z) });
  })();
