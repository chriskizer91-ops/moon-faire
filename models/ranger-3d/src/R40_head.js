
  // ---------- stage one: a plain head form, so her body and base outfit can be judged before her face and hair are built ----------
  (function buildHeadForm() {
    const NU = Q(40, 20), wNeck = (x, y) => { const u = sm(1.40, 1.47, y); return [BI.neck, 1 - u, BI.head, u]; }, wHead = () => [BI.head, 1];
    // neck: from the top of the torso to under the jaw
    const nr = [];
    for (const [y, rx, zf, zb] of [[1.396, 0.0505, 0.0245, -0.0785], [1.420, 0.0480, 0.0265, -0.0760], [1.445, 0.0475, 0.0300, -0.0750], [1.470, 0.0490, 0.0340, -0.0770], [1.495, 0.0510, 0.0360, -0.0800]])
      nr.push(ringXZ(0, y, (zf + zb) / 2, rx, (zf - zb) / 2, (zf - zb) / 2, NU));
    addPart('skin', loft(nr), wNeck, { out: V3(0, 1.44, -0.025) });
    // head: height -> [half-width, front z, back z], an egg with a jaw (chin 1.428 m, crown 1.640 m; the eye line is 1.50 m)
    const HD = [[1.428, [0.012, 0.058, 0.040]], [1.436, [0.030, 0.074, 0.020]], [1.452, [0.046, 0.084, -0.010]], [1.475, [0.059, 0.090, -0.040]], [1.500, [0.068, 0.094, -0.072]], [1.530, [0.073, 0.094, -0.098]],
      [1.560, [0.075, 0.091, -0.110]], [1.590, [0.072, 0.082, -0.112]], [1.615, [0.062, 0.064, -0.102]], [1.632, [0.044, 0.038, -0.082]], [1.640, [0.016, 0.004, -0.044]]];
    const hr = [], NR = Q(34, 16);
    for (let i = 0; i <= NR; i++) { const t = i / NR, y = lerp(1.428, 1.640, t * t * (3 - 2 * t) * 0.35 + t * 0.65), [rx, zf, zb] = spline(HD, y); hr.push(ringXZ(0, y, (zf + zb) / 2, rx, (zf - zb) / 2, (zf - zb) / 2, NU, 2.15)); }
    addPart('form', loft(hr, { capA: true, capB: true }), wHead, { out: V3(0, 1.54, -0.01) });
  })();
