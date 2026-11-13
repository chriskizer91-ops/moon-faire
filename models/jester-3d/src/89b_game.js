
  // ---------- her moves in the game (claude.ai Project "Flip Book Art", lore/combat-balance.md: the combat system Chris approved on November 13, 2026) ----------
  // Nothing above this file is changed by it. The game gives her five moves. Two were already here as the lore's moves and are used as they are:
  //   taunt_attack   her attack taunt           taunt_heal   her heal taunt
  // Three are added here, each one an older move played whole with what the game's rule asks for put on top:
  //   g_rebuke    Gilded Rebuke as her plain attack: her flipbook's swing of the bell chain, and now the blow is thrown from the bells to her foe as a thread of gold.
  //   g_seal      Sealed Fate: the lore's big spell (doom), and now the sealed foe is ended outright as the rings shut, and its end runs out along the ground
  //               to wound every other foe.
  //   g_curtain   Curtain Call: the same cast when it leaves no foe standing (doom_end), with the splash, every other foe taken with the first,
  //               and her fainted friends getting up: a light stands up where each one lay.
  // The rules belong to the game, not to her, so the host tells the model three things through J.game:
  //   fates    Fate on each foe: a list with one entry for each foe, kept in the same place in the list for the whole fight (null for a foe that is gone):
  //            { x, y, z (where it stands), r, h (how wide and tall it is, in meters), k (0 to 1: its Fate as a share of the Life it has left), sealed }
  //            Fate shows as dust falling round the foe like sand, thicker as k grows. When the foe is sealed the fall stops, the dust locks into one ring, and a small eclipse hangs over it.
  //   others   where the foes she is not casting at stand: [{ x, z, h }]. The splash goes to each.
  //   friends  where her fainted friends lie: [{ x, z }]. With none given, three places behind her are used.
  //   catches  how many blows she will still catch after a taunt (0 to 3): that many small new moons circle her, and one goes out with each blow caught.
  const gm = { fates: [], others: [], friends: [], catches: 0 };
  const game = {
    get fates() { return gm.fates; }, set fates(v) { gm.fates = Array.isArray(v) ? v : []; },
    get others() { return gm.others; }, set others(v) { gm.others = Array.isArray(v) ? v : []; },
    get friends() { return gm.friends; }, set friends(v) { gm.friends = Array.isArray(v) ? v : []; },
    get catches() { return gm.catches; }, set catches(n) { gm.catches = cl(Math.round(+n || 0), 0, 3); }
  };
  const FATE_V = `attribute vec4 aSeed; uniform vec3 uOrigin; uniform vec2 uSize; uniform float uT, uK, uPrev, uFlash, uSeal, uPx; varying float vA;
    void main(){
      float on = smoothstep(aSeed.w - 0.05, aSeed.w + 0.01, uK);                                 // each speck comes out as the foe's Fate passes its own mark
      float dir = aSeed.x > 0.5 ? 1.0 : -1.0, a = aSeed.y * 6.28318 + uT * (0.10 + 0.22 * fract(aSeed.x * 7.7)) * dir;
      float r = uSize.x * (0.55 + 0.75 * aSeed.z), h = 1.0 - fract(aSeed.w * 7.31 + aSeed.x * 3.7 + uT * (0.07 + 0.10 * aSeed.y));       // it falls, as sand does
      vec3 p = uOrigin + vec3(r * cos(a), uSize.y * (0.03 + 1.02 * h), r * sin(a));
      float s = clamp(uSeal * 1.4 - aSeed.z * 0.4, 0.0, 1.0); s = s * s * (3.0 - 2.0 * s);       // sealed: the fall stops and the dust locks into one tilted ring
      float a2 = aSeed.y * 6.28318 + uT * 0.8;
      float rr = uSize.x * (1.28 + 0.14 * fract(aSeed.z * 9.7));
      vec3 pr = uOrigin + vec3(rr * cos(a2), uSize.y * 0.56 + uSize.x * 0.62 * sin(a2 + 0.6) + 0.03 * sin(aSeed.z * 60.0), rr * sin(a2));
      p = mix(p, pr, s);
      vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = uPx * (0.8 + 0.9 * fract(aSeed.x * 13.7));
      float tw = 0.6 + 0.4 * sin(uT * (1.5 + 3.0 * aSeed.y) + aSeed.z * 50.0), edge = mix(sin(3.14159 * h), 1.0, s);
      vA = on * tw * edge * mix(0.8, 0.34, s) * (1.0 + 1.6 * uFlash * step(uPrev, aSeed.w));       // the dust a blow has just added shows brighter for a moment
      if (vA <= 0.003) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    }`;
  const fateSlots = [];
  function fateSlot(i) {
    if (!fateSlots[i]) {
      const pts = new THREE.Points(vSeeds(Q(300, 110) + i), new THREE.ShaderMaterial(Object.assign({
        uniforms: { uOrigin: { value: V3() }, uSize: { value: new THREE.Vector2(0.42, 2) }, uT: { value: 0 }, uK: { value: 0 }, uPrev: { value: 0 }, uFlash: { value: 0 }, uSeal: { value: 0 }, uPx: { value: 2 }, uColor: { value: vC(V_STAR, 1.25) } },
        vertexShader: FATE_V, fragmentShader: 'varying float vA; uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, vA);' + V_END }, VBLEND)));
      pts.frustumCulled = false; pts.renderOrder = 30; pts.visible = false; fx.add(pts);
      pts.onBeforeRender = (r) => { const rt = r.getRenderTarget(); pts.material.uniforms.uPx.value = Math.max(1.5, (rt ? rt.height : r.getDrawingBufferSize(_vsz).y) / 520); };
      fateSlots[i] = { pts, k: 0, shown: 0, prev: 0, at: -9, seal: 0, sealAt: -9, was: false };
    }
    return fateSlots[i];
  }
  const catchA = [0, 0, 0], catchOn = [0, 0, 0];
  fxTicks.push((t, dt) => {
    const camQ = camNow().quaternion, now = dt === 0 ? 1 : 0, n = Math.max(gm.fates.length, fateSlots.length);
    for (let i = 0; i < n; i++) {
      const f = gm.fates[i] || null; if (!f && !fateSlots[i]) continue;
      const s = fateSlot(i), k = f ? cl(+f.k || 0, 0, 1) : 0, sealed = !!(f && f.sealed);
      if (k > s.k + 1e-4) { s.prev = s.k; s.at = t; } s.k = k;
      if (sealed && !s.was) s.sealAt = t; s.was = sealed;
      s.shown += (k - s.shown) * Math.min(1, dt * 3 + now); s.seal += ((sealed ? 1 : 0) - s.seal) * Math.min(1, dt * 2.2 + now);
      s.pts.visible = !!f && s.shown > 0.004;
      if (!s.pts.visible) continue;
      const u = s.pts.material.uniforms, r = f.r || 0.42, h = f.h || 2.0;
      u.uOrigin.value.set(f.x || 0, f.y || 0, f.z || 0); u.uSize.value.set(r, h); u.uT.value = t; u.uK.value = s.shown; u.uPrev.value = s.prev; u.uFlash.value = cl(1 - (t - s.at) / 0.8, 0, 1); u.uSeal.value = s.seal;
      if (s.seal > 0.02) {                                             // sealed: a small eclipse hangs over it, and a ring runs out once as the seal sets
        const top = _l1.set(f.x || 0, (f.y || 0) + h * 1.13 + 0.5 * r, f.z || 0), q = t - s.sealAt, w = 1.0 * r * (1 + 0.06 * Math.sin(t * 2.2));
        vNs = 'fate' + i + ':';
        VF.shade('s', top, 3.4 * w, 0.55 * s.seal);
        VF.voidFlat('m', top, camQ, w * s.seal, t, s.seal, 0, V_STAR, 2.6);
        VF.wave('w', top, V_ID, w + 1.5 * vease(q / 0.5), 0.7 * vwin(q, 0, 0.04, 0.2, 0.5), camQ, V_STAR, 1.5);
        vNs = '';
      }
    }
    // the blows she will still catch after a taunt
    for (let i = 0; i < 3; i++) {
      const on = i < gm.catches ? 1 : 0; catchA[i] += (on - catchA[i]) * Math.min(1, dt * (on ? 4 : 9) + now);
      if (!on && catchA[i] < 0.01) { catchA[i] = 0; catchOn[i] = 0; continue; }
      const an = t * 1.5 + i * 2.094, c = anchor('chest', _l2), P = _l3.set(c.x + 0.62 * Math.cos(an), c.y + 0.10 + 0.10 * Math.sin(t * 1.1 + i * 2), c.z + 0.62 * Math.sin(an));
      if (!on && catchOn[i]) burst(P, 10, 0.5, 0.6, 0.03, COL.pale, 0.2, 1.6, 0.4);      // one goes out with the blow it caught
      catchOn[i] = on;
      vNs = 'catch:'; VF.voidBall('m' + i, P, 0.034 * catchA[i], catchA[i], V_STAR, 3.4, 2.2, 0, t); VF.orb('o' + i, P, 0.17, 0.7 * catchA[i], i === 1 ? V_GOLD : V_STAR, 2.0); vNs = '';
    }
  });

  // ---- Gilded Rebuke in the game: her plain attack. The flipbook's move, with the blow carried to her foe. ----
  { const old = ACTS.gilded_rebuke, D = old.dur, REB_T = 1.0, REB_FLY = 0.13;
    defAction('g_rebuke', D, old.keys, { hits: [(REB_T + REB_FLY) / D], tags: ['strike'], impact: 0.6, cues: old.cues, outro: 0.2, fx(a, t, dt) {
      const out = old.fx(a, t, dt), T = a.t;
      if (T < 0.45 || T > 1.9) return out;
      loreFrame(); vNs = 'reb:';
      const hand = anchor('handR', _h1), camQ = camNow().quaternion, head = flP[FL_N - 1], r = T - REB_T;
      // the chain draws a thin gold ring as it comes over
      VF.hoop('whirl', hand, _rq0, 1.28 + 0.1 * Math.sin(T * 9), -T * 9, 0.5 * vwin(T, 0.5, 0.66, 0.98, 1.2), 0, V_GOLD, 1.7);
      if (r >= 0) {
        if (!a.fired.thrown) { a.fired.thrown = true; a.from = (a.from || V3()).copy(head); a.tg = tgt0(a.tg || V3()); }
        const fly = vcl(r / REB_FLY), at = _l1.copy(a.from).lerp(a.tg, fly), e = r - REB_FLY;
        VF.strip('arc', _l2.copy(a.from).lerp(a.tg, Math.max(0, fly - 0.5)), at, 0.13, 0.9 * (1 - vramp(r, REB_FLY, REB_FLY + 0.12)), V_GOLD, 2.2);
        VF.orb('tip', at, 0.34, 0.9 * (1 - vramp(r, REB_FLY, REB_FLY + 0.1)), V_GOLD, 2.2);
        if (e >= 0) {
          if (cue(a, 'struck', REB_T + REB_FLY)) fxHitP.copy(a.tg);
          VF.wave('w', a.tg, V_ID, 0.25 + 1.5 * vease(e / 0.34), 0.75 * vwin(e, 0, 0.03, 0.14, 0.34), camQ, V_GOLD, 1.7);
          VF.flare('f', a.tg, 2.4 * vwin(e, 0, 0.04, 0.07, 0.3), 0.07, vwin(e, 0, 0.03, 0.1, 0.3), V_GOLD, 2.4);
          VF.flare('fv', a.tg, 1.1 * vwin(e, 0, 0.04, 0.07, 0.24), 0.05, vwin(e, 0, 0.03, 0.08, 0.24), V_GOLD, 2.2, true);
          VF.motes('sp', a.tg, 140, e, { emit: 0.03, life: 0.55, spread: 1.1, size: 0.04, rise: 0.1, color: V_GOLD });
          light(a.tg, 1.2 * vwin(e, 0, 0.03, 0.1, 0.35), 0xffc060);
        }
      }
      vNs = ''; return out;
    } }); }

  // ---- the splash: the end of the sealed foe runs out along the ground to every other foe. e: seconds since the rings shut ----
  const _g1 = V3(), _g2 = V3(), _g3 = V3();
  function fxSplash(a, T, e) {
    if (e < -0.2 || e > 1.6 || !a.gr) return;
    const camQ = camNow().quaternion, gr = a.gr;
    for (let i = 0; i < gm.others.length && i < 6; i++) {
      const o = gm.others[i]; if (!o) continue;
      const og = _g1.set(o.x || 0, gr.y, o.z || 0), oc = _g2.set(og.x, gr.y + 0.55 * (o.h || 2), og.z), s = e - 0.06 - 0.09 * og.distanceTo(gr);      // the further off, the later it arrives
      VF.strip('s' + i, gr, _g3.copy(gr).lerp(og, vramp(s, -0.14, 0.02)), 0.16, 0.75 * vwin(s, -0.14, -0.06, 0.1, 0.45), V_VIOLET, 1.9);
      VF.voidFlat('p' + i, og, vFlatQ, 1.4 * vwin(s, 0, 0.12, 0.4, 0.85), T, 1, 0, V_VIOLET, 2.0);
      VF.flare('f' + i, oc, 2.6 * vwin(s, 0, 0.04, 0.08, 0.36), 0.07, vwin(s, 0, 0.03, 0.1, 0.36), V_STAR, 2.4, true);
      VF.wave('w' + i, oc, V_ID, 0.2 + 1.4 * vease(s / 0.4), 0.65 * vwin(s, 0, 0.03, 0.15, 0.4), camQ, V_VIOLET, 1.5);
      VF.motes('d' + i, oc, 150, s, { emit: 0.04, life: 0.75, spread: 1.3, size: 0.04, rise: 0.1, color: V_STAR });
      if (s > 0 && s < 0.3) light(oc, 0.9 * vwin(s, 0, 0.03, 0.1, 0.3), V_ICE);
    }
  }
  // ---- Sealed Fate in the game: the lore's big spell, and the sealed foe is ended as the rings shut ----
  { const old = ACTS.doom, D = old.dur, SHUT = DOOM_REL + 1.0;
    defAction('g_seal', D, old.keys, { hits: [(DOOM_REL + 0.34) / D, (DOOM_REL + 0.5) / D, (SHUT + 0.02) / D, (SHUT + 0.24) / D], tags: ['land', 'doom', 'gone', 'splash'], impacts: [0.3, 0.3, 0.95, 0.55],
      cues: old.cues, outro: 0.35, start: old.start, fx(a) {
        const T = a.t, r = T - DOOM_REL, e = T - SHUT; fxDoom(a, T);
        if (r < 0.3 || !a.tg) return;
        vNs = 'end:';
        const tg = a.tg;
        VF.motes('in', tg, 520, r - 0.45, { emit: 0.5, life: 0.4, spread: 2.3, size: 0.045, inward: true, rise: 0, swirl: 6, color: V_STAR });      // what it was is drawn into the seal
        VF.flare('vt', tg, 3.8 * vwin(e, 0, 0.05, 0.08, 0.45), 0.08, vwin(e, 0, 0.03, 0.1, 0.45), V_STAR, 2.6, true);                    // and goes out as a thread of light
        VF.orb('pt', tg, 0.4 + 1.4 * vramp(e, 0, 0.15), vwin(e, 0, 0.03, 0.1, 0.5), V_STAR, 2.0);
        VF.motes('ash', above(_l1, tg, 0.3), 340, e - 0.05, { emit: 0.15, life: 1.3, spread: 1.1, size: 0.035, rise: -0.5, flatten: 0.6, color: V_STAR });      // its dust settles where it stood
        VF.voidFlat('gone', a.gr, vFlatQ, 1.5 * vwin(e, 0, 0.2, 0.8, 1.3), T, 1, 0, V_STAR, 1.6);
        fxSplash(a, T, e);
        vNs = '';
      } }); }
  // ---- Curtain Call in the game: the same cast when it leaves no foe standing. The splash, the other foes taken with the first, and her friends getting up. ----
  { const old = ACTS.doom_end, D = old.dur, SHUT = DOOM_REL + 1.0, HOLE = END_T1 + END_DOOM, BOW = END_T1 + CC_REL, RISE = BOW + 0.75, SPOTS = [[-0.7, -1.4], [0.4, -2.2], [1.4, -1.5]];
    defAction('g_curtain', D, old.keys, { hits: [(DOOM_REL + 0.34) / D, SHUT / D, (SHUT + 0.24) / D, HOLE / D, (HOLE + 1.0) / D, (RISE + 0.45) / D], tags: ['land', 'zero', 'splash', 'doom', 'gone', 'rise'], impacts: [0.3, 0.95, 0.55, 0.4, 1.0, 0.25],
      cues: old.cues, outro: 0.6, start: old.start, fx(a) {
        const T = a.t; old.fx(a);
        if (!a.tg) return;
        vNs = 'end:';
        fxSplash(a, T, T - SHUT);
        // the foes the splash left hanging go when the first one does: a pit under each, and a thread of light where it was
        const td = T - HOLE;
        if (td > 0 && td < 2.4) for (let i = 0; i < gm.others.length && i < 6; i++) {
          const o = gm.others[i]; if (!o) continue;
          const og = _g1.set(o.x || 0, a.gr.y, o.z || 0), oc = _g2.set(og.x, og.y + 0.55 * (o.h || 2), og.z), d = td - 0.12 * (i + 1);
          VF.voidFlat('op' + i, og, vFlatQ, 2.2 * vease(vramp(d, 0, 0.5)) * (1 - vease(vramp(d, 1.1, 1.6))), T, 1, 0, V_STAR, 2.0);
          VF.motes('oi' + i, oc, 320, d - 0.05, { emit: 0.8, life: 0.45, spread: 2.2, size: 0.045, inward: true, rise: 0, swirl: 7, color: V_STAR });
          VF.flare('ov' + i, oc, 3.2 * vwin(d, 0.9, 0.98, 1.02, 1.4), 0.08, vwin(d, 0.9, 0.97, 1.05, 1.4), V_STAR, 2.4, true);
          VF.orb('oo' + i, oc, 0.4 + 1.2 * vramp(d, 0.95, 1.1), vwin(d, 0.95, 0.99, 1.06, 1.4), V_STAR, 2.0);
        }
        // the show is over and everyone takes their bow: a light stands up where each fainted friend lay
        const u0 = T - RISE;
        if (u0 > 0) for (let i = 0; i < 3; i++) {
          const f = gm.friends[i], sp = SPOTS[i], g = f ? _g1.set(f.x || 0, a.gr.y, f.z || 0) : at0(_g1, sp[0], 0.03, sp[1]), u = u0 - 0.18 * i;
          const up = vease(vramp(u, 0.05, 0.9)), al = vwin(u, 0, 0.25, 1.2, 1.7);
          VF.wave('fw' + i, g, V_ID, 0.3 + 1.4 * vease(u / 0.6), 0.6 * vwin(u, 0, 0.05, 0.3, 0.6), 1, V_GOLD, 1.6);
          VF.pillar('fp' + i, g, 0.2, 0.3 + 1.9 * up, T * 0.5, 0.16 * al, 1, V_EMBER, 1.3);
          VF.orb('fo' + i, above(_g2, g, 0.2 + 1.05 * up), 0.55, 0.8 * al, V_EMBER, 2.0);
          VF.motes('fm' + i, above(_g3, g, 0.1), 170, u, { emit: 0.9, life: 1.1, spread: 0.5, rise: 0.9, size: 0.035, flatten: 0.2, color: V_GOLD });
        }
        vNs = '';
      } }); }
