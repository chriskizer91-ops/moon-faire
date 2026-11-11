
  // ---------- her moves, keyed from the flipbook: times are (frame - 1) / fps of each clip; x is toward her left (screen right) ----------
  const UP = V3(0, 1, 0), _c1 = V3(), _c2 = V3(), _c3 = V3();
  const above = (out, p, d) => out.copy(p).addScaledVector(UP, d);

  // Curtain Call (48 frames at 6 fps; the ring sweeps on frame 32)
  defAction('curtain_call', 8.0, [
    { t: 0, hR: [-0.30, 0.85, 0.06], hL: [0.30, 0.85, 0.06], fR: FP.soft, fL: FP.soft, twR: 0.35, twL: 0.35 },
    { t: 0.67, hR: [-0.050, 1.085, 0.200], hL: [0.050, 1.085, 0.200], eR: [-1, -0.8, -0.2], eL: [1, -0.8, -0.2], twR: 0.5, twL: 0.5, fR: FP.cup, fL: FP.cup, hd: [0, 0.14, 0], sp: [0, 0.05, 0] },
    { t: 1.0, hR: [-0.235, 1.11, 0.22], hL: [0.235, 1.11, 0.22], fR: FP.weave, fL: FP.weave, twR: 0.1, twL: 0.1, hd: [0, 0.07, 0], sp: [0, 0.02, 0] },
    { t: 1.25, hR: [-0.285, 1.19, 0.20], hL: [0.295, 1.19, 0.20], hd: [0, 0, 0], ftL: [0.01, 0, 0.09, 0.12, 0], hip: [0, -0.012, 0.03] },
    { t: 1.55, hR: [-0.17, 1.12, 0.24], hL: [0.42, 0.90, 0.10], fL: FP.soft, twL: 0.2, sp: [-0.16, 0, 0.04], hd: [-0.12, 0, 0.02] },
    { t: 2.17, hR: [-0.27, 1.33, 0.16], hL: [0.46, 1.01, 0.06], twR: 1.35, fR: FP.cup, eR: [-1, -0.9, -0.1], sp: [-0.22, -0.02, 0.05], hd: [-0.28, -0.06, 0.05], wrR: [-0.2, 0] },
    { t: 2.83, hR: [-0.39, 1.55, 0.10], hL: [0.42, 0.92, 0.04], hd: [-0.32, -0.32, 0.08], sp: [-0.18, -0.08, 0.06] },
    { t: 3.17, hR: [-0.35, 1.70, 0.05], hL: [0.48, 0.80, 0.02], eR: [-1, -0.3, -0.4], fR: FP.open, wrR: [0, 0], hd: [-0.26, -0.46, 0.08], sp: [-0.1, -0.13, 0.08], ftR: [-0.10, 0, 0, -0.22, 0], ftL: [0.17, 0, 0.04, 0.26, 0], hip: [0.02, -0.03, 0.01] },
    { t: 3.5, hR: [-0.33, 1.58, 0.08], hL: [0.55, 1.33, 0.10], twL: 1.3, fL: FP.open, eL: [1, -0.6, -0.3], hd: [0, -0.46, 0], sp: [0, -0.13, 0] },
    { t: 3.83, hR: [-0.42, 1.62, 0.06], hL: [0.40, 1.63, 0.06], eL: [1, -0.4, -0.4], eR: [-1, -0.4, -0.4], twR: 0.9, twL: 0.9 },
    { t: 4.05, hR: [-0.355, 1.665, 0.05], hL: [0.355, 1.67, 0.05], hd: [0, -0.52, 0], eyes: 1, sp: [0, -0.17, 0], ftR: [0.03, 0, 0, -0.08, 0], ftL: [-0.03, 0, 0, 0.08, 0], hip: [0, 0.012, 0] },
    { t: 4.62, hR: [-0.365, 1.67, 0.05], hL: [0.365, 1.665, 0.05], hd: [0, -0.5, 0], eyes: 1 },
    { t: 4.86, hR: [-0.59, 1.36, 0.10], hL: [0.61, 1.30, 0.10], hd: [0.15, -0.05, 0], eyes: 0, sp: [0.05, -0.04, 0], twR: 0.9, twL: 0.9, eR: [-0.3, -1, -0.4], eL: [0.3, -1, -0.4] },
    { t: 5.08, hR: [-0.575, 1.15, 0.12], hL: [0.57, 1.14, 0.12], twR: 0.6, twL: 0.6, hd: [0.1, 0.13, 0], eyes: 0.7, sp: [0, 0.04, 0], ftL: [0, 0, 0.08, 0.1, 0], ftR: 'rest', hip: [0, -0.02, 0.02], mouth: 2 },
    { t: 5.67, hR: [-0.40, 0.94, 0.08], hL: [0.44, 0.88, 0.08], fR: FP.soft, fL: FP.soft, hd: [0, 0.05, 0], eyes: 0, sp: [0, 0, 0], eR: 'rest', eL: 'rest', hip: [0, 0, 0], ftL: 'rest' },
    { t: 6.05, hR: [-0.31, 0.84, 0.05], hL: [0.32, 0.84, 0.05], twR: 0.35, twL: 0.35, hd: [0, 0, 0], mouth: 2 },
    { t: 7.4, mouth: 0 }
  ], { hits: [5.17 / 8], cues: [1.0 / 8, 3.17 / 8, 4.86 / 8], outro: 0.6, fx(a, t, dt) {
    const T = a.t, hr = anchor('handR', _h1), hl = anchor('handL', _h2), mid = _h3.copy(hr).lerp(hl, 0.5);
    const ft = anchor('feet', _h4), stage1 = win(T, 0.5, 6.3, 0.7);
    dim(0.75 * win(T, 0.8, 5.25, 0.6));                                             // the house lights go down for the ultimate
    floorSigil(ft, lerp(0.5, 1.35, sm(0.5, 5.0, T)), stage1 * (0.7 + 0.3 * Math.sin(T * 5)), T, T > 4.9 ? COL.magenta : COL.violet);
    beam(ft, 1.7, 3.5, 0.22 * win(T, 3.2, 5.0, 0.4), COL.pale);
    if (stage1 > 0.1 && Math.random() < 30 * dt) { const an = Math.random() * TAU, r = 0.3 + Math.random() * 0.9; _c3.set(ft.x + r * Math.cos(an), 0.05, ft.z + r * Math.sin(an)); motes(_c3, 1, 0.02, 1.8, 0.05, Math.random() < 0.5 ? COL.violet : COL.magenta, 0.35); }
    if (cue(a, 'ring1', 3.15)) shock(above(_c1, hr, 0.13), 0.05, 1.0, 0.8, COL.pale);
    if (cue(a, 'ring2', 5.17)) { shock(ft, 0.3, 2.8, 1.1, COL.magenta, true); shock(anchor('chest', _c1), 0.1, 1.6, 0.7, COL.pale); }
    if (cue(a, 'ring3', 5.40)) shock(ft, 0.2, 2.2, 1.0, COL.violet, true);
    const g0 = win(T, 0, 0.95, 0.25) + 0.85 * win(T, 5.5, 7.9, 0.6);            // light gathers in her hands; at the end it ebbs from them
    if (g0 > 0.01) {
      show(gHandR, hr, 0.26, 0.85 * g0); show(gHandL, hl, 0.26, 0.85 * g0); light(mid, 0.3 * g0);
      if (Math.random() < 26 * dt * g0) mist(Math.random() < 0.5 ? hr : hl, 1, 0.05, 0.8, 0.032, COL.violet, 0.16);
    }
    const orb = win(T, 0.5, 1.15, 0.22);
    if (orb > 0.01) { show(gMain, mid, 0.26 + 0.3 * orb, orb); show(gCore, mid, 0.13, orb); light(mid, 0.7 * orb); }
    const sg = win(T, 0.95, 3.0, 0.22);                                             // the wheel of fate: between her hands, then riding her right palm
    if (sg > 0.01) {
      const ride = sm(1.35, 1.8, T), p = above(_c1, hr, 0.17).lerp(mid, 1 - ride); p.z += 0.05 * (1 - ride);
      const size = lerp(0.44, 0.27, ride) * (0.55 + 0.45 * sm(0.95, 1.25, T)) * (1 - 0.55 * sm(2.6, 3.0, T));
      show(sigil, p, size, sg, T * 1.5); show(gMain, p, size * 1.7, 0.5 * sg); light(p, 0.95 * sg);
      if (Math.random() < 34 * dt) mist(p, 1, size * 0.4, 0.8, 0.03, COL.magenta, 0.05);
    }
    const star = win(T, 2.6, 3.5, 0.22);
    if (star > 0.01) { const p = above(_c1, hr, 0.13); show(gCore, p, 0.12 + 0.2 * star, star); show(gAux, p, 0.7 * star, 0.6 * star); light(p, 1.5 * star); }
    if (cue(a, 'burst', 3.15)) { const p = above(_c1, hr, 0.13); burst(p, 120, 2.3, 1.7, 0.05, COL.pale, 1.3, 1.4, 0.5); burst(p, 70, 1.2, 1.3, 0.07, COL.magenta, 0.6, 1.2, 0.6); }
    if (T > 3.25 && T < 4.9) {                                                        // a canopy of sparks from hand to hand
      const reach = sm(3.25, 3.85, T), n = 80 * dt * (1 - sm(4.6, 4.9, T));
      for (let i = 0; i < n || (i === 0 && Math.random() < n); i++) {
        const u = Math.random() * reach, p = _c1.copy(hr).lerp(hl, u); p.y += 0.12 + 0.2 * Math.sin(u * PI) + rs() * 0.06; p.x += rs() * 0.06; p.z += rs() * 0.1;
        emit(p.x, p.y, p.z, rs() * 0.1, 0.05 + rs() * 0.1, rs() * 0.1, 0.9 + Math.random() * 0.7, 0.03 + Math.random() * 0.05, Math.random() < 0.5 ? COL.pale : COL.violet, 0.25, 0.8);
      }
      light(above(_c2, mid, 0.2), 0.9 * (1 - sm(4.6, 4.9, T)));
      if (reach >= 1) { show(gHandR, above(_c2, hr, 0.1), 0.3, 0.7); show(gHandL, above(_c3, hl, 0.1), 0.3, 0.7); }
    }
    const rg = win(T, 4.9, 6.1, 0.14);                                               // the curtain falls: a ring sweeps out from her
    if (rg > 0.01) {
      const k = sm(4.9, 6.0, T), R = lerp(0.28, 1.9, Math.pow(k, 0.75)), c = anchor('feet', _c1); c.y += 0.95 - 0.5 * k;
      sweep.visible = sweep2.visible = true; sweep.position.copy(c); sweep2.position.copy(c); sweep.scale.setScalar(R); sweep2.scale.setScalar(R);
      sweep.material.opacity = rg; sweep2.material.opacity = 0.3 * rg; light(_c2.copy(c).addScaledVector(Z_AX, 0.5), 1.2 * rg);
      const n = 260 * dt * rg;
      for (let i = 0; i < n; i++) { const an = Math.random() * TAU; emit(c.x + R * Math.cos(an), c.y + rs() * 0.03 - 0.2 * R * Math.sin(an), c.z + R * Math.sin(an), Math.cos(an) * 0.5, 0.15 + Math.random() * 0.3, Math.sin(an) * 0.5, 0.7 + Math.random() * 0.6, 0.045 + Math.random() * 0.06, Math.random() < 0.6 ? COL.magenta : COL.pale, 0.3, 1); }
    }
    if (cue(a, 'release', 5.17)) { toward(fxHitP, anchor('chest', _c1), 2.6); burst(anchor('chest', _c2), 50, 1.4, 1.0, 0.05, COL.pale, 0.2, 1.4, 0.2); }
  } });

  // Sealed Fate (24 frames at 5 fps; the mark is set on frame 16)
  defAction('sealed_fate', 4.8, [
    { t: 0.4, hR: [-0.150, 1.33, 0.15], eR: [-1, -1, 0], twR: 0.5, fR: FP.soft, wrR: [0.25, 0], hd: [0.08, 0.07, -0.05] },
    { t: 0.8, hR: [-0.145, 1.375, 0.14], hd: [0.1, 0.05, -0.07] },
    { t: 1.05, hR: [-0.27, 1.40, 0.12], twR: 1.4, fR: FP.cup, wrR: [-0.3, 0], hd: [-0.08, 0, 0.04] },
    { t: 1.4, hR: [-0.385, 1.40, 0.10], eyes: 1, hd: [0.07, 0.05, -0.06], sp: [0, 0, -0.02] },
    { t: 2.6, hR: [-0.335, 1.31, 0.10], eyes: 1 },
    { t: 3.0, hR: [-0.355, 1.38, 0.10], eyes: 1, hd: [0.07, 0.02, -0.06] },
    { t: 3.2, eyes: 0, mouth: 2 },
    { t: 3.6, hR: [-0.24, 1.34, 0.12], fR: FP.soft, twR: 0.9, wrR: [0, 0] },
    { t: 4.0, hR: [-0.19, 1.36, 0.14], twR: 0.5, hd: [0.08, 0.05, -0.04], wrR: [0.25, 0] },
    { t: 4.35, mouth: 0 }
  ], { hits: [3.0 / 4.8], cues: [1.05 / 4.8], outro: 0.45, fx(a, t, dt) {
    const T = a.t, hr = anchor('handR', _h1), k = win(T, 1.0, 3.7, 0.3);
    const ft = anchor('feet', _h4); dim(0.5 * win(T, 1.0, 3.3, 0.5)); floorSigil(ft, 0.8, 0.8 * win(T, 0.9, 3.7, 0.5), -T, COL.violet);
    const mk = win(T, 3.05, 4.6, 0.25);                                              // the Doom mark hangs on the target
    if (mk > 0.01) { show(sigil2, fxHitP, 0.36 + 0.04 * Math.sin(T * 9), mk, -T * 0.8); show(gMain, fxHitP, 0.7, 0.5 * mk); if (Math.random() < 20 * dt) motes(fxHitP, 1, 0.14, 0.8, 0.05, COL.magenta, -0.2); }
    if (cue(a, 'ringA', 3.0)) shock(above(_c1, hr, 0.19), 0.05, 0.7, 0.55, COL.pale);
    if (cue(a, 'ringB', 3.3)) shock(fxHitP, 0.6, 0.12, 0.45, COL.magenta);
    if (k > 0.01) {
      const p = above(_c1, hr, 0.19 + 0.02 * Math.sin(T * 3)), grow = sm(1.0, 1.5, T), pulse = 1 + 0.08 * Math.sin(T * 7), fade = 1 - 0.75 * sm(3.05, 3.6, T);
      show(sigil, p, 0.27 * grow * pulse * fade, k, -T * 1.2); show(gMain, p, 0.5 * grow * fade, 0.75 * k); show(gCore, p, 0.14 * grow * pulse, k); light(p, 1.1 * k);
      if (Math.random() < 30 * dt * k) { const an = Math.random() * TAU, r = 0.16; emit(p.x + r * Math.cos(an), p.y + r * Math.sin(an), p.z + rs() * 0.04, -Math.sin(an) * 0.25, Math.cos(an) * 0.25 + 0.05, 0, 0.8, 0.035, Math.random() < 0.5 ? COL.pale : COL.magenta, 0, 0.8); }
      const side = anchor('chest', _c2); side.addScaledVector(_tgt, 0.36); side.y -= 0.25; show(gAux, side, 1.2, 0.22 * k * win(T, 1.4, 3.3, 0.4));   // her veil takes the light
      const sp = win(T, 3.0, 3.55, 0.05);
      if (sp > 0.01) show(sigil2, p, 0.27 + 0.9 * sm(3.0, 3.55, T), 0.8 * sp, T);
      if (cue(a, 'release', 3.0)) { burst(p, 60, 1.3, 0.9, 0.05, COL.pale, 0, 1.6); toward(fxHitP, p, 2.6); for (let i = 0; i < 40; i++) { const u = i / 40; toward(_c3, p, 2.6 * u); emit(_c3.x, _c3.y + 0.12 * Math.sin(u * PI), _c3.z, rs() * 0.1, rs() * 0.1, rs() * 0.1, 0.35 + u * 0.5, 0.05, COL.magenta, 0, 1); } }
    }
  } });

  // Against All Odds (16 frames at 2 fps; the blessing lands on frame 4)
  const swayA = { hR: [-0.45, 1.50, 0.08], hL: [0.44, 1.61, 0.08], sp: [0.04, -0.10, 0.04], hd: [0.05, -0.42, 0.04], hip: [0.014, 0, 0] };
  const swayB = { hR: [-0.44, 1.60, 0.08], hL: [0.45, 1.52, 0.08], sp: [-0.04, -0.10, -0.04], hd: [-0.05, -0.42, -0.04], hip: [-0.014, 0, 0] };
  defAction('against_all_odds', 8.0, [
    { t: 0.5, hR: [-0.555, 1.13, 0.10], hL: [0.555, 1.15, 0.10], twR: 1.35, twL: 1.35, fR: FP.soft, fL: FP.soft, eR: [-0.5, -1, -0.3], eL: [0.5, -1, -0.3] },
    { t: 1.0, hR: [-0.47, 1.38, 0.10], hL: [0.50, 1.46, 0.10], hd: [0, -0.3, 0], sp: [0, -0.06, 0], eyes: 0.5, eR: [-1, -0.6, -0.3], eL: [1, -0.6, -0.3] },
    { t: 1.5, hR: [-0.44, 1.56, 0.08], hL: [0.40, 1.60, 0.08], hd: [0, -0.42, 0], eyes: 1, fR: FP.open, fL: FP.open, sp: [0, -0.10, 0], mouth: 1 },
    Object.assign({ t: 2.5 }, swayA), Object.assign({ t: 3.5 }, swayB), Object.assign({ t: 4.5 }, swayA), Object.assign({ t: 5.5 }, swayB),
    { t: 6.5, hR: [-0.42, 1.40, 0.10], hL: [0.46, 1.46, 0.10], hd: [0, -0.15, 0], eyes: 0.4, sp: [0, -0.03, 0], hip: [0, 0, 0], mouth: 0 },
    { t: 7.0, hR: [-0.555, 1.04, 0.10], hL: [0.555, 1.04, 0.10], hd: [0, 0, 0], eyes: 0, fR: FP.soft, fL: FP.soft, twR: 0.6, twL: 0.6, sp: [0, 0, 0], eR: [-0.5, -1, -0.3], eL: [0.5, -1, -0.3] },
    { t: 7.5, hR: [-0.44, 0.87, 0.06], hL: [0.45, 0.87, 0.06], twR: 0.2, twL: 0.2 }
  ], { hits: [1.5 / 8], cues: [0.5 / 8], outro: 0.5, fx(a, t, dt) {
    const T = a.t, hr = anchor('handR', _h1), hl = anchor('handL', _h2), k = win(T, 0.8, 6.9, 0.5);
    const ft = anchor('feet', _h4); floorSigil(ft, 1.05, 0.7 * k, T * 0.6, COL.gold); beam(ft, 2.0, 3.7, 0.3 * k * (0.85 + 0.15 * Math.sin(T * 3)), [1.0, 0.86, 0.6]);
    if (k > 0.1 && Math.random() < 22 * dt) { _c3.set(ft.x + rs() * 0.4, 2.2 + Math.random() * 0.6, ft.z + rs() * 0.4); motes(_c3, 1, 0.02, 2.4, 0.06, COL.gold, -0.45); }
    if (cue(a, 'ringA', 1.5)) { shock(ft, 0.2, 1.8, 1.0, COL.gold, true); shock(anchor('chest', _c1), 0.1, 1.2, 0.8, COL.pale); }
    if (k > 0.01) {
      const tw1 = 0.8 + 0.2 * Math.sin(T * 5.1), tw2 = 0.8 + 0.2 * Math.sin(T * 4.3 + 1);
      show(gHandR, above(_c1, hr, 0.15), 0.24 * tw1, k); show(gHandL, above(_c2, hl, 0.15), 0.24 * tw2, k);
      show(gCore, above(_c1, hr, 0.15), 0.09, k * tw1); show(sigil2, above(_c2, hl, 0.15), 0.001, 0);
      const c = anchor('feet', _c3); light(above(_c2, c, 1.9), 0.8 * k); show(gAux, above(_c2, c, 1.25), 2.3, 0.10 * k);
      const n = 34 * dt * k;                                                           // slow motes rising round her, gold among the violet
      for (let i = 0; i < n || (i === 0 && Math.random() < n); i++) { const an = Math.random() * TAU, r = 0.35 + Math.random() * 0.45; emit(c.x + r * Math.cos(an), c.y + 0.1 + Math.random() * 0.5, c.z + r * Math.sin(an), 0, 0.28 + Math.random() * 0.3, 0, 2.2 + Math.random(), 0.03 + Math.random() * 0.04, Math.random() < 0.35 ? COL.gold : Math.random() < 0.5 ? COL.pale : COL.violet, -0.02, 0.3); }
      if (Math.random() < 14 * dt * k) mist(above(_c1, Math.random() < 0.5 ? hr : hl, 0.15), 1, 0.06, 0.9, 0.04, COL.pale, 0.1);
    }
    if (cue(a, 'release', 1.5)) { burst(above(_c1, hr, 0.15), 40, 0.9, 1.2, 0.05, COL.pale, 0.1, 1.2, 0.5); burst(above(_c2, hl, 0.15), 40, 0.9, 1.2, 0.05, COL.gold, 0.1, 1.2, 0.5); anchor('chest', fxHitP); }
  } });

  // Gilded Rebuke (8 frames at 4 fps; the bells strike on frame 5)
  defAction('gilded_rebuke', 2.0, [
    { t: 0.25, hR: [0.045, 0.975, 0.215], eR: [-1, -0.5, -0.5], fR: FP.grip, twR: 0.2, hL: [0.17, 0.94, 0.18], hip: [-0.03, -0.035, 0], sp: [0.22, 0.09, 0], hd: [0.3, 0.06, 0], ftR: [-0.06, 0, 0, -0.2, 0], ftL: [0.06, 0, 0, 0.2, 0] },
    { t: 0.5, hR: [-0.50, 1.19, 0.02], eR: [-0.4, -1, -0.6], hL: [0.50, 1.06, 0.10], fL: FP.open, sp: [-0.36, 0, 0.05], hd: [0.42, 0, 0], hip: [-0.05, -0.05, 0], ftR: [-0.17, 0, 0, -0.3, 0], ftL: [0.17, 0, 0.02, 0.3, 0] },
    { t: 0.75, hR: [-0.15, 1.73, -0.05], eR: [-1, 0.3, -0.5], hL: [0.46, 0.92, 0.10], sp: [-0.2, -0.15, 0.06], hd: [0.45, -0.1, 0], hip: [-0.03, -0.02, -0.01] },
    { t: 1.0, hR: [0.47, 1.25, 0.16], eR: [0, -1, -0.2], twR: -0.3, hL: [0.20, 0.96, -0.06], fL: FP.fist, sp: [0.66, 0.11, 0], hipR: [0.24, 0, 0], hd: [0.32, 0, 0], hip: [0.07, -0.055, 0.02], mouth: 1 },
    { t: 1.25, hR: [0.42, 1.25, 0.16], sp: [0.58, 0.09, 0], hipR: [0.2, 0, 0] },
    { t: 1.5, hR: [-0.24, 1.01, 0.19], eR: [-1, -0.6, -0.4], twR: 0.2, hL: [0.30, 1.0, 0.15], fL: FP.soft, sp: [0.1, 0.03, 0], hipR: [0, 0, 0], hd: [0.15, 0, 0], hip: [0, -0.02, 0], ftR: 'rest', ftL: 'rest', mouth: 0 },
    { t: 1.76, hR: [0.03, 0.965, 0.215], hL: [0.24, 0.90, 0.10], sp: [0.1, 0.04, 0], hip: [0, 0, 0], hd: [0, 0, 0] }
  ], { hits: [1.0 / 2.0], cues: [0.25 / 2.0], outro: 0.2, fx(a, t, dt) {
    const T = a.t; if (T < 0.22 || T > 1.82) return;
    const hand = anchor('handR', _h1), len = lerp(0.14, 0.64, sm(0.25, 0.6, T)) * (1 - 0.78 * sm(1.52, 1.82, T));
    const strike = win(T, 0.9, 1.34, 0.05), whip = win(T, 0.58, 0.9, 0.08);
    let w = 0; const drive = _c1;
    if (strike > 0.01) { toward(drive, hand, len); drive.y += 0.01; w = 0.55 * strike; }
    else if (whip > 0.01) { toward(drive, hand, -0.55 * len); drive.y += len * 0.8; w = 0.2 * whip; }
    flail.visible = true; stepFlail(dt, hand, len, w > 0 ? drive : null, w); trailOn = win(T, 0.55, 1.45, 0.12);
    const head = flP[FL_N - 1], hit = win(T, 0.98, 1.4, 0.04);
    if (hit > 0.01) { show(gGold, head, 0.6 + 0.5 * hit, 0.9 * hit); show(ringGold, head, 0.2 + 0.7 * sm(0.98, 1.4, T), hit, T * 2); light(head, 1.3 * hit, 0xffc060); }
    else if (trailOn > 0.01) light(head, 0.35 * trailOn, 0xffc060);
    if (cue(a, 'hit', 1.0)) { fxHitP.copy(head); shock(head, 0.06, 0.9, 0.45, COL.gold); shock(head, 0.04, 0.5, 0.3, COL.white); burst(head, 70, 2.4, 0.8, 0.06, COL.gold, 2.0, 1.6); burst(head, 20, 1.0, 0.6, 0.09, COL.white, 0.5, 2); }
    if (T > 0.6 && T < 1.3 && Math.random() < 60 * dt) emit(head.x, head.y, head.z, rs() * 0.3, rs() * 0.3, rs() * 0.3, 0.45, 0.04, COL.gold, 0.8, 1.2);
    return 'flail';
  } });

  // Hush (29 frames at 6 fps; the ring goes on frame 17)
  defAction('hush', 29 / 6, [
    { t: 0.33, hR: [-0.03, 1.21, 0.175], eR: [-1, -1, -0.1], fR: FP.soft, twR: 0.4, hd: [0, 0.10, 0] },
    { t: 0.67, hR: [0.020, 1.300, 0.150], fR: FP.point, twR: 0.55, eR: [-1, -1, 0], wrR: [0.12, 0], hd: [0, 0.03, 0], hL: [0.205, 0.925, 0.10], eL: [1, -0.1, -0.8], fL: FP.soft },
    { t: 1.0, eyes: 1, mouth: 2 }, { t: 1.36, eyes: 1, hR: [0.020, 1.300, 0.150] },
    { t: 1.67, hR: [-0.39, 1.34, 0.10], twR: 0.9, eyes: 0, hd: [-0.22, 0, 0.03], sp: [-0.1, 0, 0], eR: [-1, -0.8, -0.2], mouth: 0 },
    { t: 1.95, hR: [-0.39, 1.20, 0.12], hd: [-0.15, 0.03, 0], hL: [0.205, 0.925, 0.10], sp: [-0.1, 0, 0] },
    { t: 2.2, hR: [-0.30, 0.90, 0.06], fR: FP.relax, twR: 0.1, wrR: 'rest', hL: [0.49, 1.39, 0.16], eL: [0.3, -1, -0.4], fL: FP.open, twL: -0.4, wrL: [-0.5, 0], sp: [0.36, 0, 0], hipR: [0.12, 0, 0], hd: [0.42, 0, 0] },
    { t: 2.4, hL: [0.58, 1.44, 0.12] },
    { t: 2.67, hL: [0.42, 1.35, 0.14], wrL: [-0.95, 0] },
    { t: 3.33, hL: [0.36, 1.29, 0.14], sp: [0.28, 0, 0], hd: [0.4, 0, 0] },
    { t: 4.0, hR: [-0.11, 0.965, 0.17], eR: [-1, -0.5, -0.4], hL: [0.28, 0.85, 0.05], fL: FP.relax, wrL: [0.1, 0], twL: 0, sp: [0, 0, 0], hipR: [0, 0, 0], hd: [0, 0, 0], eL: 'rest' }
  ], { hits: [2.667 / (29 / 6)], cues: [0.67 / (29 / 6), 1.67 / (29 / 6)], outro: 0.45, fx(a, t, dt) {
    const T = a.t, tip = anchor('tipR', _h1), palm = anchor('handL', _h2);
    const pull = win(T, 0.55, 1.45, 0.2);                                            // sound drawn in to her fingertip
    if (pull > 0.05 && Math.random() < 40 * dt) { const d = _c3.set(rs(), rs(), rs()).normalize(); kindNext = 1; emit(tip.x + d.x * 0.3, tip.y + d.y * 0.3, tip.z + d.z * 0.3, -d.x * 0.6, -d.y * 0.6, -d.z * 0.6, 0.45, 0.04, COL.violet, 0, 0.2); kindNext = 0; }
    dim(0.35 * win(T, 0.6, 3.2, 0.5));
    const shh = win(T, 0.8, 1.62, 0.18);
    if (shh > 0.01) { show(gCore, tip, 0.09, shh); show(gHandR, tip, 0.24, 0.8 * shh); light(tip, 0.5 * shh); if (Math.random() < 12 * dt) mist(tip, 1, 0.02, 0.6, 0.025, COL.pale, 0.1); }
    const held = win(T, 1.5, 2.34, 0.14);                                            // the hush drawn out as a sigil over her right hand, then passed across
    if (held > 0.01) {
      const pass = sm(2.06, 2.32, T), p = above(_c1, tip, 0.14).lerp(toward(_c2, palm, 0.15), pass); p.y += 0.12 * Math.sin(pass * PI);
      show(sigil, p, 0.17 + 0.08 * sm(1.5, 2.0, T), held, T * 2); show(gMain, p, 0.4, 0.5 * held); light(p, 0.8 * held);
      if (Math.random() < 26 * dt) mist(p, 1, 0.06, 0.7, 0.03, COL.violet, 0.04);
    }
    const ring = win(T, 2.26, 3.3, 0.08);
    if (ring > 0.01) {
      const go = sm(2.667, 3.2, T), p = toward(_c1, palm, 0.15 + 2.3 * go * go), R = 0.13 + 0.10 * go;
      hushRing.visible = true; hushRing.position.copy(p); hushRing.quaternion.setFromUnitVectors(Z_AX, _tgt); hushRing.scale.setScalar(R); hushRing.material.opacity = ring * (1 - 0.6 * sm(2.95, 3.3, T));
      show(gAux, p, R * 4, 0.35 * ring); light(p, 0.9 * ring);
      if (Math.random() < 50 * dt) { const an = Math.random() * TAU; emit(p.x, p.y + R * Math.cos(an), p.z + R * Math.sin(an), -_tgt.x * 0.3, rs() * 0.1, rs() * 0.1, 0.6, 0.04, Math.random() < 0.5 ? COL.pale : COL.violet, 0, 1); }
      if (cue(a, 'release', 2.667)) { shock(p, 0.1, 0.6, 0.5, COL.violet); burst(p, 30, 0.8, 0.7, 0.04, COL.pale, 0, 1.6); toward(fxHitP, palm, 2.45); }
      if (cue(a, 'break', 3.12)) { shock(p, 0.15, 0.9, 0.6, COL.pale); shock(p, 0.7, 0.1, 0.5, COL.violet); }
      if (false) burst(p, 60, 1.1, 0.9, 0.05, COL.violet, 0.2, 1.4);
    }
  } });

  // Gravity (15 frames at 9 fps; the well is flung on frame 11)
  defAction('gravity', 15 / 9, [
    { t: 0.22, hL: [0.29, 1.12, 0.17], eL: [1, -0.8, -0.3], twL: 1.45, fL: FP.cup, wrL: [-0.25, 0], hd: [0.2, 0.09, 0], hR: [-0.28, 0.84, 0.04] },
    { t: 0.67, hL: [0.29, 1.20, 0.17], hd: [0.26, 0.06, 0], eyes: 0.4 },
    { t: 0.80, hL: [0.48, 1.31, 0.11], sp: [0.3, 0, 0], hd: [0.42, 0, 0], eyes: 0 },
    { t: 0.93, hL: [0.26, 1.04, -0.06], fL: FP.relax, twL: 0.3, wrL: [0, 0], hR: [0.30, 1.27, 0.20], eR: [-0.3, -1, -0.3], fR: FP.point, twR: -0.3, sp: [0.66, 0.06, 0], hipR: [0.22, 0, 0], hd: [0.32, 0, 0], hip: [0.04, -0.02, 0.02] },
    { t: 1.11, hR: [0.45, 1.29, 0.18] },
    { t: 1.3, hR: [0.38, 1.26, 0.18], sp: [0.56, 0.04, 0] }
  ], { hits: [1.111 / (15 / 9)], cues: [0.22 / (15 / 9)], outro: 0.34, fx(a, t, dt) {
    const T = a.t, palm = anchor('handL', _h1), tip = anchor('tipR', _h2);
    dim(0.4 * win(T, 0.2, 1.5, 0.25));
    const k = win(T, 0.14, 1.52, 0.08);
    if (k > 0.01) {
      const pass = sm(0.84, 0.98, T), go = sm(1.111, 1.5, T), p = above(_c1, palm, 0.15).lerp(toward(_c2, tip, 0.13), pass); toward(p, p, 2.7 * Math.pow(go, 0.8));
      const R = (0.03 + 0.06 * sm(0.14, 0.62, T)) * (1 + 0.5 * pass) * (1 - 0.9 * sm(1.4, 1.52, T));
      well.visible = true; well.position.copy(p); well.scale.setScalar(R); well.material.uniforms.uA.value = k;
      show(gAux, p, R * 6.5, 0.7 * k); light(p, 0.75 * k);
      const n = 90 * dt * k;                                                           // light falling into it
      for (let i = 0; i < n; i++) { const an = Math.random() * TAU, r = R * (2.5 + Math.random() * 2), cx = Math.cos(an), sy = Math.sin(an); emit(p.x + _tgt.x * 0 + r * cx * (1 - Math.abs(_tgt.x)) + rs() * 0.02, p.y + r * sy, p.z + r * cx * Math.abs(_tgt.x), (-cx * 1.2 - sy * 0.9) * r * 3 * (1 - Math.abs(_tgt.x)), (-sy * 1.2 + cx * 0.9) * r * 3, (-cx * 1.2 - sy * 0.9) * r * 3 * Math.abs(_tgt.x), 0.3, 0.03, Math.random() < 0.7 ? COL.violet : COL.pale, 0, 0.5); }
      if (go > 0 && go < 1) for (let i = 0; i < 4; i++) emit(p.x + rs() * 0.03, p.y + rs() * 0.03, p.z + rs() * 0.03, -_tgt.x * 0.6, rs() * 0.1, -_tgt.z * 0.6, 0.4, 0.05, COL.violet, 0, 1);
      if (cue(a, 'release', 1.111)) { shock(p, 0.05, 0.5, 0.35, COL.violet); burst(p, 46, 1.6, 0.5, 0.05, COL.violet, 0, 2); toward(fxHitP, p, 2.7); }
      if (cue(a, 'land', 1.46)) { shock(p, 1.0, 0.06, 0.4, COL.violet); shock(p, 0.1, 1.1, 0.7, COL.pale); burst(p, 80, 1.5, 0.7, 0.05, COL.violet, 0, 2.2); burst(p, 20, 0.6, 0.6, 0.08, COL.pale, 0, 2); }
    }
    const wind = win(T, 0.45, 0.95, 0.12);                                          // the pull stirs the air round her
    if (wind > 0.01) { const c = anchor('feet', _c3), n = 70 * dt * wind; for (let i = 0; i < n; i++) { const an = Math.random() * TAU, r = 0.42 + Math.random() * 0.15, y = 0.5 + Math.random() * 1.0; emit(c.x + r * Math.cos(an), c.y + y, c.z + r * Math.sin(an), -Math.sin(an) * 1.6, 0.25, Math.cos(an) * 1.6, 0.45, 0.035, COL.violet, 0, 0.4); } }
  } });
