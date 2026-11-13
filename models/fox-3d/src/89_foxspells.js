
  // ---------- the Fox's spells (round 3). First: her shears in her hands, and Hemline Fangs ----------
  // References: references/round3/H3.webp (the draw and the split), H4.webp (the two cuts), and the flipbook clip hemline_fangs (12 frames at 6 a
  // second, the blow on frame 7). Her magic is cold blue foxfire (lore/discussion-notes.md, "The Fox").
  COL.fox = [0.36, 0.78, 1.0]; COL.foxPale = [0.84, 0.95, 1.0]; COL.thread = [1.0, 0.82, 0.42];
  (function foxSpells() {
    const arm = (S, h, e, f, tw, wr) => ({ ['h' + S]: h, ['e' + S]: e, ['f' + S]: f, ['tw' + S]: tw, ['wr' + S]: wr });
    // Hand keys for her shears. GRIP: her right palm on the ring of the sheathed shears (bench: T.reach of 'handR' onto the ring). The turns of her
    // forearms and wrists that point a blade where it should go were searched for on the model (bench/blades.js), pose by pose.
    const GRIP = arm('R', [-0.216, 1.015, 0.123], [-1, 0.2, -0.6], FP.grip, 0.2, [0.3, 0]);
    const upR = (y) => arm('R', [-0.13, y, 0.27], [-0.7, -1, -0.2], FP.grip, 0.2, [0.4, 0.3]), upL = (y) => arm('L', [-0.045, y - 0.01, 0.275], [0.7, -1, -0.2], FP.grip, 0.2, [0.4, -0.3]);      // held up in front of her right shoulder, clear of her face, blades up (H3)
    const outR = arm('R', [-0.40, 1.02, 0.08], [-0.2, -0.5, -1], FP.grip, 1.0, [0, 0.3]), outL = arm('L', [0.40, 1.02, 0.08], [0.2, -0.5, -1], FP.grip, 1.0, [0, -0.3]);                          // a dagger out at each side, blades up (H3)
    const restL = arm('L', [0.29, 0.882, 0.055], [0.55, -0.1, -1], FP.relax, 0, [0.1, 0]), restR = arm('R', [-0.29, 0.882, 0.055], [-0.55, -0.1, -1], FP.relax, 0, [0.1, 0]);
    const _f1 = V3(), _f2 = V3(), _f3 = V3(), _f4 = V3(), prev = { A: { tip: V3(), mid: V3(), on: false }, B: { tip: V3(), mid: V3(), on: false } };
    // foxfire off a moving blade: sparks strewn over the strip the blade swept since the last frame, so a fast cut leaves an unbroken arc
    function bladeTrail(W, k, dt) {
      const tip = anchor('blade' + W, _f1), mid = anchor('blade' + W + 'm', _f2), p = prev[W];
      if (p.on && k > 0.01) { const sp = tip.distanceTo(p.tip) / Math.max(dt, 1e-3), n = Math.min(40, (10 + sp * 14) * k * dt * 60 / 2.2);
        for (let i = 0; i < n || (i === 0 && Math.random() < n); i++) { const u = Math.random(), v = Math.pow(Math.random(), 0.6); _f3.copy(p.mid).lerp(p.tip, v); _f4.copy(mid).lerp(tip, v); _f3.lerp(_f4, u);
          emit(_f3.x, _f3.y, _f3.z, rs() * 0.05, 0.03 + rs() * 0.05, rs() * 0.05, 0.16 + Math.random() * 0.22, 0.022 + 0.034 * v, Math.random() < 0.3 ? COL.foxPale : COL.fox, 0.1, 0.6); } }
      p.tip.copy(tip); p.mid.copy(mid); p.on = true; return tip;
    }
    const glint = (W, dt, rate) => { if (Math.random() < rate * dt) { const t = anchor('blade' + W, _f1); emit(t.x, t.y, t.z, rs() * 0.08, 0.05 + Math.random() * 0.1, rs() * 0.08, 0.35 + Math.random() * 0.3, 0.03, COL.foxPale, 0.2, 0.8); } };

    // Shears: she takes them out to look at them. Draws them, holds them up, two snips, parts them into her two daggers and shows them, puts them
    // back together and away. For looking at the tools in her hands; not a spell.
    defAction('shears_out', 5.5, [
      Object.assign({ t: 0.32, hd: [-0.25, 0.18, 0], sp: [-0.08, 0.05, 0], shr: 0 }, GRIP),
      Object.assign({ t: 0.42, shr: 0 }, GRIP),
      Object.assign({ t: 0.80, shr: 1, hd: [0, 0.07, 0.05], sp: [0, 0, 0], sho: 0, mouth: 2 }, upR(1.17)),
      { t: 1.05, sho: 0 }, { t: 1.20, sho: 0.55 }, { t: 1.36, sho: 0.04 }, { t: 1.52, sho: 0.55 }, { t: 1.68, sho: 0 },                                        // snip, snip
      Object.assign({ t: 1.80, shs: 0 }, upR(1.17), restL),
      Object.assign({ t: 2.15, shs: 0, sho: 0 }, upL(1.17)),                                                                                                   // her left hand takes the back half
      { t: 2.30, shs: 1 },
      Object.assign({ t: 2.70, hd: [0, -0.03, 0.08], shl: 0.44 }, outR, outL),                                                                                 // two daggers
      { t: 3.10, twR: 0.7, twL: 1.3, hd: [0.2, -0.03, 0.08] }, { t: 3.50, twR: 1.3, twL: 0.7, hd: [-0.2, -0.03, 0.08] }, Object.assign({ t: 3.85, hd: [0, 0, 0.05], shs: 1 }, outR, outL),      // she turns them in the light
      Object.assign({ t: 4.25, shs: 1, hd: [0, 0.07, 0] }, upR(1.10), upL(1.10)),
      { t: 4.40, shs: 0 },
      Object.assign({ t: 4.60, shr: 1 }, upR(1.10), restL),
      Object.assign({ t: 4.95, shr: 1, hd: [-0.22, 0.16, 0], sp: [-0.06, 0.04, 0] }, GRIP),
      Object.assign({ t: 5.10, shr: 0, mouth: 2 }, GRIP),
      Object.assign({ t: 5.20, shr: 0, hd: [0, 0, 0], sp: [0, 0, 0] }, GRIP)
    ], { outro: 0.3, cues: [1.36 / 5.5, 1.68 / 5.5], fx(a, t, dt) { const T = a.t; if (T > 0.8 && T < 4.9) { glint('A', dt, 2.5); if (T > 2.3 && T < 4.4) glint('B', dt, 2.5); } } });

    // Hemline Fangs. Keyed on the flipbook's twelve frames, a little slower so no hand has to whip: time = (frame - 1) / 6 x TS.
    (function () {
      const TS = 1.22, K = (f, o) => Object.assign({ t: (f - 1) / 6 * TS }, o), keys = [], stand = { hip: [0, 0, 0], hipR: [0, 0, 0], ftR: 'rest', ftL: 'rest', knR: 'rest', knL: 'rest' };
      const lunge = (dz, dy) => ({ hip: [0.03, dy, dz], ftL: [0.12, 0, 0.30, 0.25, 0], ftR: [-0.10, 0.02, -0.16, -0.5, 0.25], knL: [0.30, 0, 1], knR: [-0.4, 0, 1] });
      const cutR = (h, wr) => arm('R', h, [-1, -0.6, -0.2], FP.grip, 0.8, wr), cutL = (h, wr) => arm('L', h, [1, -0.6, -0.2], FP.grip, 0.8, wr);
      keys.push(K(1.85, Object.assign({ hd: [-0.25, 0.18, 0], sp: [-0.08, 0.05, 0], shr: 0 }, GRIP, arm('L', [0.10, 1.04, 0.24], [0.7, -1, -0.2], FP.soft, 0.2, [0.2, 0]))));       // her hand on the ring
      keys.push(K(2.00, { shr: 0 }));
      keys.push(K(2.30, Object.assign({ shr: 1, shs: 0, sho: 0.3, shl: 0.44, hd: [0, 0.08, 0], sp: [0, 0, 0], mouth: 2 }, upR(1.10), upL(1.10))));                                   // out and up, and her left hand has the back half
      keys.push(K(2.50, { shs: 0 }));
      keys.push(K(3.20, Object.assign({ shs: 1, sho: 0, shl: 0.44, hd: [0, -0.03, 0.06] }, outR, outL, stand)));                                                                     // frame 3: a dagger at each side
      keys.push(K(3.70, Object.assign({ shl: 0.44 }, outR, outL, stand)));
      keys.push(K(4.65, Object.assign({ shl: -0.35, sp: [-0.35, 0.10, 0], hd: [0.25, 0, 0] }, lunge(0.10, -0.15),                                                                    // frames 4 and 5: the step, and she winds up to her right
        arm('R', [-0.40, 1.28, -0.03], [-1, -0.3, -0.6], FP.grip, 1.6, [-0.4, -0.3]), cutL([0.12, 1.08, 0.30], [0, 0]))));
      keys.push(K(5.30, Object.assign({ shl: -0.45, sp: [-0.37, 0.10, 0] }, lunge(0.10, -0.15), arm('R', [-0.41, 1.29, -0.05], [-1, -0.3, -0.6], FP.grip, 1.6, [-0.4, -0.3]))));
      keys.push(K(6.15, Object.assign({ shl: -0.7, sp: [0, 0.12, 0], hd: [0, 0.03, 0] }, lunge(0.14, -0.17), cutR([-0.05, 1.16, 0.43], [0, 0.3]), cutL([0.30, 1.28, 0.12], [-0.2, 0.2]))));   // the first cut, her right hand, high right to low left
      keys.push(K(7.00, Object.assign({ shl: -0.7, sp: [0.25, 0.14, 0], hd: [-0.2, 0.05, 0] }, lunge(0.15, -0.17), cutR([0.18, 0.93, 0.36], [0, 0.3]),                               // frame 7: it lands
        arm('L', [0.34, 1.40, 0.06], [1, -0.2, -0.6], FP.grip, 1.6, [-0.4, 0.3]))));
      keys.push(K(7.75, Object.assign({ sp: [0.05, 0.13, 0], hd: [0, 0.04, 0] }, lunge(0.15, -0.17), cutL([0.05, 1.14, 0.44], [0, 0]), cutR([0.21, 0.90, 0.28], [0, 0.3]))));        // the second, her left hand, down across the first
      keys.push(K(8.45, Object.assign({ shl: -0.7, sp: [-0.15, 0.12, 0], hd: [0.12, 0.05, 0] }, lunge(0.14, -0.16), cutL([-0.16, 0.91, 0.36], [0, -0.3]), cutR([0.20, 0.92, 0.25], [0, 0.3]))));
      keys.push(K(9.40, Object.assign({ shl: 0.1, shs: 1, sp: [0, 0.02, 0], hd: [0, 0, 0.05], mouth: 2 }, stand, arm('R', [-0.34, 0.98, 0.20], [-0.4, -0.6, -0.8], FP.grip, 1.0, [0, 0.3]),   // she comes up out of it, blades wide
        arm('L', [0.34, 0.98, 0.20], [0.4, -0.6, -0.8], FP.grip, 1.0, [0, -0.3]))));
      keys.push(K(10.30, Object.assign({ shl: 0.44, shs: 1, sho: 0.3, hd: [0, 0.07, 0] }, upR(1.10), upL(1.10))));                                                                 // and together again in front of her
      keys.push(K(10.65, { shs: 0, sho: 0.3 })); keys.push(K(10.90, { sho: 0 }));                                                                                                  // snip
      keys.push(K(11.00, Object.assign({ shr: 1 }, upR(1.10), restL)));
      keys.push(K(11.70, Object.assign({ shr: 1, hd: [-0.22, 0.16, 0], sp: [-0.06, 0.04, 0] }, GRIP)));                                                                           // and away
      keys.push(K(11.95, Object.assign({ shr: 0 }, GRIP)));
      keys.push(K(12.10, Object.assign({ shr: 0, hd: [0, 0, 0], sp: [0, 0, 0], mouth: 2 }, GRIP)));
      const dur = (12.9 - 1) / 6 * TS, tt = (f) => (f - 1) / 6 * TS, T_HIT = tt(7.0), T_HIT2 = tt(8.3), T_RING = tt(9.4);
      // Her spells act toward her left (screen right when she faces you, as on the sprite sheet), so for a blow struck forward she turns to face it.
      const spin = [[0, 0], [tt(2.2), 0], [tt(4.4), PI / 2], [tt(9.0), PI / 2], [tt(11.4), 0], [dur, 0]];
      defAction('hemline_fangs', dur, keys, { outro: 0.28, stand: true, spin, hits: [T_HIT / dur], cues: [tt(3) / dur, T_HIT2 / dur], impact: 0.6,
        start() { prev.A.on = prev.B.on = false; },
        fx(a, t, dt) {
          const T = a.t, out = T > tt(2.4) && T < tt(11.7), split = T > tt(2.8) && T < tt(10.6);
          const k1 = win(T, tt(5.5), tt(7.3), 0.08), k2 = win(T, tt(6.9), tt(8.7), 0.08), kr = win(T, tt(8.9), tt(10.0), 0.08);
          if (out) { const tip = bladeTrail('A', Math.max(k1, 0.5 * kr), dt); if (k1 > 0.2) light(tip, 0.9 * k1, 0x66c8ff); glint('A', dt, 3); } else prev.A.on = false;
          if (split) { const tip = bladeTrail('B', Math.max(k2, 0.5 * kr), dt); if (k2 > 0.2) light(tip, 0.9 * k2, 0x66c8ff); glint('B', dt, 3); } else prev.B.on = false;
          if (cue(a, 'split', tt(2.75))) { const p = anchor('bladeAm', _f1); burst(p, 26, 0.9, 0.5, 0.03, COL.foxPale, 0.3, 1.2, 0.2); }
          const X = anchor('chest', _f1); X.addScaledVector(_f2.set(0, 0, 1).applyQuaternion(root.getWorldQuaternion(_qa)), 0.62 * FOX_K); X.y -= 0.12 * FOX_K; fxHitP.copy(X);      // where the two cuts cross, in front of her (and where the page puts its own flash)
          if (cue(a, 'hit1', T_HIT)) { burst(X, 60, 2.2, 0.55, 0.04, COL.fox, 0.5, 1.4, 0.3); shock(X, 0.05, 0.42, 0.30, COL.foxPale); }
          if (cue(a, 'hit2', T_HIT2)) { burst(X, 46, 1.8, 0.5, 0.04, COL.foxPale, 0.5, 1.4, 0.3); shock(X, 0.04, 0.34, 0.26, COL.fox); }
          const fl = win(T, T_HIT - 0.03, T_HIT2 + 0.2, 0.06); if (fl > 0.01) light(X, 1.4 * fl, 0x8fd8ff);
          if (cue(a, 'ring', T_RING)) { const c = anchor('hips', _f1); c.y += 0.16 * FOX_K; shock(c, 0.22, 1.05, 0.55, COL.fox, true); }                              // the ring as she spins them back (H4)
          if (cue(a, 'snip', tt(10.9))) { const p = anchor('bladeAm', _f1); burst(p, 14, 0.6, 0.4, 0.025, COL.foxPale, 0.3, 1.2, 0.2); }
        } });
    })();
  })();
