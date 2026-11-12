  // ---------- her moves under the lore (claude.ai Project "Flip Book Art", lore/jester-3d-and-lore.md and lore/discussion-notes.md) ----------
  // Nothing above this file is changed by it: her ten spells and her body moves play as before. These are added beside them:
  //   doom          her big spell: Sealed Fate, with a ring for each hit she has taken. She throws the seal and the rings clamp shut on her target.
  //   doom_end      the cast that brings every foe to zero: the same, running on into Curtain Call, the end of the show.
  //   taunt_attack  her attack taunt: Gravity gathered over her hand in a jig and a twirl, dropped on her target, and a laugh.
  //   taunt_heal    her heal taunt: Against All Odds, danced and laughed through. It heals only her.
  //   hit_laugh, hit_dust   taking a hit at full power: she rocks back, bounces up, and laughs or dusts herself off. Each lights a ring.
  //   caper, prance, juggle more dancing and jester acting.
  // The effects are the not-HD model's look for her (88_void.js), keyed to these moves' own clocks.
  const _rq0 = Qt(), _rp = V3(), _Lq1 = Qt(), _Lq2 = Qt(), _l1 = V3(), _l2 = V3(), _l3 = V3(), _l4 = V3(), _l5 = V3();
  // the frame she casts in: where she stands and the way she faces, without the turn of a twirl
  function loreFrame() { _rq0.copy(_rq).multiply(_Lq2.setFromAxisAngle(Y_AX, -spinHost)); root.getWorldPosition(_rp); }
  const at0 = (out, x, y, z) => out.set(x, y, z).applyQuaternion(_rq0).add(_rp);
  const tgt0 = (out) => at0(out, 2.6 * tgtK, 1.15, 0);                 // the middle of what she casts at: on her left, where the host says it stands
  const kShift = (keys, dt, t0, t1) => keys.filter((k) => k.t >= (t0 == null ? -1 : t0) && k.t <= (t1 == null ? 1e9 : t1)).map((k) => Object.assign({}, k, { t: k.t + dt, raw: true }));      // keys taken from an older move, left as they were written
  // Her older moves let a channel drift from rest toward its first key over however long that takes. In these moves a pose is struck quickly instead:
  // a channel holds what it had until shortly before its next key (LEAD seconds, or the key's own 'lead'), then moves. Keys marked raw are left alone.
  const LEAD = { mouth: 0.10, eyes: 0.14, fR: 0.25, fL: 0.25 };
  function autoHold(keys) {
    const ks = keys.slice().sort((a, b) => a.t - b.t), last = {}, holds = {};
    for (const key of ks) for (const c of CHANS) {
      if (key[c] === undefined) continue;
      const p = last[c] || { t: 0, v: 'rest' }, lead = key.lead || LEAD[c] || 0.35;
      if (!key.raw && key.t - p.t > lead + 0.02) { const th = Math.round((key.t - lead) * 1000) / 1000; (holds[th] = holds[th] || { t: th })[c] = p.v; }
      last[c] = { t: key.t, v: key[c] };
    }
    return ks.concat(Object.keys(holds).map((k) => holds[k])).sort((a, b) => a.t - b.t);
  }
  const defLore = (name, dur, keys, o) => defAction(name, dur, autoHold(keys), o);
  const HIPS_R = [-0.20, 1.01, 0.05], HIPS_L = [0.20, 1.01, 0.05];
  // one step of her jig: a hop, then down on one foot with the other kicking across. sd: which foot kicks (-1 her right); hi: a higher kick
  function jigStep(keys, t, B, sd, hi, more) {
    const kick = [sd * -0.07, 0.17 + 0.10 * hi, 0.20 + 0.06 * hi, sd * -0.2, 0.5], stand = [sd * -0.02, 0.0, -0.02, sd * -0.1, 0];
    keys.push({ t: t - B * 0.5, hip: [sd * -0.015, 0.045, 0], ftR: [0, 0.06, 0, -0.1, 0.55], ftL: [0, 0.06, 0, 0.1, 0.55] });
    keys.push(Object.assign({ t, hip: [sd * 0.03, -0.045, 0], hipR: [sd * -0.10, 0, sd * 0.05], ['ft' + (sd < 0 ? 'R' : 'L')]: kick, ['ft' + (sd < 0 ? 'L' : 'R')]: stand, ['kn' + (sd < 0 ? 'R' : 'L')]: [sd * -0.25, 0, 1], ['kn' + (sd < 0 ? 'L' : 'R')]: 'rest' }, more || {}));
  }
  // her laugh: shoulders shaking, mouth going. n shakes from t, with her head turned by yaw
  function laughShakes(keys, t, n, yaw, sp0) {
    for (let i = 0; i < n; i++) { const up = i % 2; keys.push({ t: t + i * 0.16, sh: up ? [0.16, 0.16] : [0.02, 0.02], sp: [sp0 || 0, -0.07 + (up ? 0.035 : 0) + 0.012 * i, 0], hd: [yaw + 0.03 * (up ? 1 : -1), -0.18 + 0.02 * i + (up ? 0.03 : 0), 0.05], mouth: up ? 1 : 2, eyes: 0.85 }); }
    return t + n * 0.16;
  }

  // ---- the rings: one for each hit she has taken since her last big spell. They turn round her until she casts it. ----
  let ringN = 0; const ringBorn = [0, 0, 0, 0, 0, 0];
  const RING_TILT = [0.30, -0.62, 0.95, -1.20, 0.50, -0.85], RING_HEAD = [0, 2.1, 4.2, 1.0, 3.1, 5.2], RING_W = [0.55, -0.42, 0.36, -0.60, 0.48, -0.38], RING_COL = [V_STAR, V_VIOLET, V_STAR, V_GOLD, V_STAR, V_VIOLET];
  function setRings(n) { n = cl(Math.round(+n || 0), 0, 6); for (let i = ringN; i < n; i++) ringBorn[i] = st.time; ringN = n; }
  const ringQ = (i, t, fast, out) => out.setFromAxisAngle(Y_AX, RING_HEAD[i] + RING_W[i] * t + (fast || 0) * (i % 2 ? -1 : 1)).multiply(_Lq2.setFromAxisAngle(X_AX, RING_TILT[i])).multiply(vFlatQ);
  const ringSize = (i) => 1.5 + 0.11 * i;
  fxTicks.push((t) => {
    if (!ringN || (act && act.ringsTaken)) return;                      // while she casts her big spell the cast draws them itself
    vNs = 'rings:';
    const c = anchor('chest', _l1); c.y -= 0.18;
    for (let i = 0; i < ringN; i++) {
      const age = t - ringBorn[i], k = vease(vramp(age, 0, 0.55));
      VF.hoop('r' + i, c, V_ID, ringSize(i) * (1 + 1.3 * (1 - k)), t * (i % 2 ? -0.8 : 0.9), vramp(age, 0, 0.25), ringQ(i, t, 0, _Lq1), RING_COL[i], 2.2);
      if (age < 0.6) VF.orb('f' + i, c, 0.5 + 2.2 * age, 0.5 * (1 - age / 0.6), V_STAR, 1.6);      // a flash as it lights
    }
    vNs = '';
  });

  // ---- the big spell: Sealed Fate as the lore has it. Her flipbook's opening (the seal drawn over her right palm, eyes closed), then she turns
  //      and throws it at her target, holds her open hand on it while the rings turn, and closes her fist as they clamp shut. ----
  const DOOM_REL = 3.0;
  const K_DOOM = kShift(ACTS.sealed_fate.keys, 0, 0, 1.5).concat([
    { t: 2.45, hR: [-0.335, 1.31, 0.10], eyes: 1, lead: 1.0 },
    { t: 2.80, hR: [-0.42, 1.47, 0.03], eR: [-1, -0.6, -0.3], wrR: [0.3, 0], sp: [-0.22, -0.03, 0], hd: [0.12, 0, -0.04], eyes: 0.3, hip: [-0.02, 0, 0] },
    { t: 3.00, hR: [0.36, 1.33, 0.22], eR: [0, -1, -0.2], twR: -0.2, wrR: [-0.55, 0], fR: FP.open, sp: [0.52, 0.05, 0], hipR: [0.16, 0, 0], hd: [0.36, 0, 0], eyes: 0, hip: [0.03, -0.02, 0.01], hL: [0.20, 0.96, -0.06], fL: FP.fist },
    { t: 3.30, hR: [0.41, 1.34, 0.20] },
    { t: 3.86, hR: [0.41, 1.35, 0.20], fR: FP.open },
    { t: 4.00, hR: [0.33, 1.30, 0.21], fR: FP.fist, wrR: [0.15, 0], sp: [0.46, 0.06, 0], mouth: 2 },
    { t: 4.50, hR: [0.33, 1.30, 0.21], fR: FP.fist, mouth: 2 }
  ]);
  function fxDoom(a, T) {
    const r = T - DOOM_REL, n = a.n || 3, camQ = camNow().quaternion;
    loreFrame(); vNs = 'doom:';
    const hr = anchor('handR', _h1), held = above(_l1, hr, 0.19 + 0.02 * Math.sin(T * 3)), chest = anchor('chest', _l2); chest.y -= 0.18;
    const grow = vease(vramp(T, 1.0, 1.9));
    darkK = Math.max(darkK, 0.62 * vwin(T, 0.7, 2.3, DOOM_REL + 1.25, DOOM_REL + 1.9));
    if (r < 0) {
      a.from = (a.from || V3()).copy(held);
      VF.shade('sh', held, 0.6 + 1.8 * grow, 0.85 * grow);
      VF.voidFlat('seal', held, camQ, 0.46 * grow, T, 1, 0, V_STAR, 2.8);                    // a hole in her hand, ringed with a tally
      VF.rune('tally', held, V_ID, 0.68 * grow, T * 0.8, vramp(T, 1.0, 2.2), 0.9, camQ, V_STAR, 1.0, 7);
      for (let k = 0; k < 3; k++) { const an = T * 1.6 + k * 2.094; VF.orb('o' + k, _l3.copy(held).addScaledVector(camRight(_l4), 0.38 * Math.cos(an) * grow).addScaledVector(UP, 0.38 * Math.sin(an) * grow), 0.09, grow, V_STAR, 2.4); }
      VF.motes('draw', held, 220, T - 1.0, { emit: 1.9, life: 0.9, spread: 1.7, size: 0.035, inward: true, rise: 0, swirl: 3, color: V_STAR });
      light(held, 0.9 * grow, V_ICE);
      // her rings quicken round her, then leave her for the seal; if she has fewer than three, the seal makes up the count
      const g = vease(vramp(T, 1.9, 2.7)), fast = 2.2 * T * vease(vramp(T, 0.3, 2.6));
      for (let i = 0; i < n; i++) {
        const carried = i < a.carried, gi = carried ? g : 1; if (!carried && g <= 0) continue;
        _l3.copy(chest).lerp(held, gi);
        VF.hoop('g' + i, _l3, V_ID, lerp(ringSize(i) * (1 - 0.2 * vease(vramp(T, 0.4, 1.9))), 0.60 + 0.075 * i, gi), T * (i % 2 ? -1.6 : 1.8), carried ? 1 : g, ringQ(i, T, fast, _Lq1), RING_COL[i], 2.2);
      }
    } else {
      if (!a.fired.rel) { a.fired.rel = true; a.tg = tgt0(a.tg || V3()); a.gr = (a.gr || V3()).copy(a.tg); a.gr.y = _rp.y + 0.03; fxHitP.copy(a.tg); ringN = 0; }      // the rings are spent
      const from = a.from || held, tg = a.tg, fly = vease(r / 0.32), at = _l3.copy(from).lerp(tg, fly);
      if (r < 0.34) {
        VF.shade('sh', at, 2.4, 0.8); VF.voidFlat('seal', at, camQ, 0.46 + 0.5 * fly, T, 1, 0, V_STAR, 2.8);
        VF.strip('trail', _l4.copy(from).lerp(tg, Math.max(0, fly - 0.35)), at, 0.16, 0.9, V_STAR, 2.4);
      }
      // it lands as an eclipse over her target's heart; the rings turn round it, then clamp shut into one, and the ground shows what is waiting
      const lock = vease(vramp(r, 0.34, 0.60)), clamp = vease(vramp(r, 0.95, 1.12)), fade = 1 - vramp(r, 1.35, 1.75);
      VF.shade('sh2', tg, 5.5 * lock, 0.9 * lock * fade);
      VF.voidFlat('stamp', tg, camQ, 2.3 * lock - 1.55 * clamp, T, fade * lock, 0, V_STAR, 2.0);
      const spin = r * (5 - 4.6 * clamp), fast = 2.2 * DOOM_REL + spin;
      for (let i = 0; i < n; i++) VF.hoop('g' + i, at, V_ID, lerp(0.60 + 0.075 * i, (2.9 - 1.9 * clamp) * (1 - 0.085 * i * (1 - clamp)), lock), T * (i % 2 ? -1.6 : 1.8), fade, ringQ(i, T, fast, _Lq1).slerp(camQ, clamp), RING_COL[i], 2.2);
      VF.voidFlat('pit', a.gr, vFlatQ, 3.6 * vwin(r, 0.5, 0.95, 1.05, 1.5), T, 1, 0, V_VIOLET, 2.0);
      VF.motes('pull', tg, 420, r - 0.34, { emit: 0.55, life: 0.6, spread: 2.6, size: 0.045, inward: true, rise: 0, swirl: 5, color: V_STAR });
      VF.flare('fl', tg, 8 * vwin(r, 0.95, 1.0, 1.05, 1.4), 0.2, vwin(r, 0.95, 1.0, 1.1, 1.4));
      VF.wave('w', a.gr, V_ID, 0.6 + 6 * vease((r - 1.0) / 0.7), 0.7 * vwin(r, 1.0, 1.05, 1.3, 1.7), 1, V_VIOLET, 1.6);
      light(tg, 0.5 * lock * fade + 1.6 * vwin(r, 0.95, 1.0, 1.1, 1.5), V_ICE);
      shakeNow = Math.max(shakeNow, 0.7 * vwin(r, 0.98, 1.02, 1.08, 1.5));
    }
    vNs = '';
  }
  const doomStart = (a) => { a.carried = ringN; a.n = Math.max(3, ringN); a.ringsTaken = true; };
  defLore('doom', 5.4, K_DOOM.concat([
    { t: 4.95, hR: [0.08, 1.04, 0.20], fR: FP.loose, twR: 0.3, wrR: [0.1, 0], eR: [-1, -0.6, -0.3], sp: [0.12, 0, 0], hipR: [0, 0, 0], hd: [0.12, 0, 0], hip: [0, 0, 0], hL: 'rest', fL: FP.relax },
    { t: 5.2, mouth: 0 }
  ]), { hits: [3.34 / 5.4, 4.0 / 5.4], tags: ['land', 'clamp'], impacts: [0.3, 0.95], cues: [1.05 / 5.4, DOOM_REL / 5.4], outro: 0.35, start: doomStart, fx(a) { fxDoom(a, a.t); } });

  // ---- the ending: the cast that brings every foe to zero runs on into Curtain Call. Her flipbook's Curtain Call, with the night closing over the show:
  //      a new moon the size of a coin is lit between her hands and lifted in thin rings, the ground under her becomes the sky, a black hole falls on
  //      what is left of her foe, a new moon rises behind until the sky is stars, and as her arms come down two curtains of night sweep shut. ----
  const END_T1 = 4.9, CC_REL = 5.17, END_DOOM = 4.25;
  function fxCurtain(a, t) {
    const r = t - CC_REL, C = camNow(), camQ = C.quaternion, camP = C.position;
    vNs = 'curtain:';
    const hr = anchor('handR', _h1), hl = anchor('handL', _h2), mid = _h3.copy(hr).lerp(hl, 0.5), here = at0(_h4, 0, 0, 0);
    darkK = Math.max(darkK, 0.95 * vwin(t, 0.6, 3.6, CC_REL + 1.7, 7.5));
    VF.motes('gather', mid, 260, t - 0.3, { emit: 2.2, life: 1.3, spread: 2.2, size: 0.04, inward: true, rise: 0, swirl: 1.2, color: V_STAR });
    // the new moon: between her hands, then riding her right palm, then let go overhead, where it opens
    const ride = sm(1.35, 1.8, t), up = vease(vramp(t, 3.05, 3.8)), open = vease(vramp(t, 3.6, 4.8)), al = vwin(t, 0.55, 1.1, CC_REL + 0.15, CC_REL + 0.5);
    const p = _l1.copy(mid).add(_l2.set(0, 0.02, 0.06).applyQuaternion(_rq0)).lerp(above(_l2, hr, 0.17), ride); p.lerp(at0(_l2, 0, 2.6, 0), up);
    const rad = 0.045 * vease(vramp(t, 0.55, 1.3)) + 0.015 * ride + 0.15 * up + 0.2 * open;
    VF.shade('sh', p, 1.2 + 4.5 * open, 0.8 * al);
    VF.voidBall('moon', p, rad, al, V_STAR, 2.2, 5.0, 1, t);
    VF.wave('halo', p, V_ID, rad * 2.5, 0.7 * al, camQ, V_STAR, 1.4);
    const ar = al * vramp(t, 1.0, 1.7);
    VF.hoop('a0', p, V_ID, rad * 4.4, t * 0.9, ar, vgyro(_rq0, UP, t * 0.7), V_STAR, 2.0);
    VF.hoop('a1', p, V_ID, rad * 3.8, -t * 0.7, ar, vgyro(_rq0, X_AX, 1.1 + t * 0.5), V_VIOLET, 2.0);
    VF.hoop('a2', p, V_ID, rad * 3.2, t * 0.5, ar, vgyro(_rq0, V_SKEW, 2.2 - t * 0.6), V_GOLD, 1.8);
    // she stands on the night sky
    VF.voidFlat('floor', at0(_l2, 0, 0.02, 0), vFlatQ, 5.4 * vease(vramp(t, 2.6, 4.4)) * (1 - vease(vramp(t, 6.6, 7.6))), t, 1, 0, V_STAR, 1.3);
    VF.rune('circle', at0(_l2, 0, 0.035, 0), _rq0, 6.2, t * 0.3, vramp(t, 3.0, 4.6), 0.13 * vwin(t, 3.0, 3.6, 7.0, 7.8), 1, V_STAR, 0.8, 3);
    VF.motes('lift', at0(_l2, 0, 0.1, 0), 420, t - 3.0, { emit: 2.2, life: 2.0, spread: 1.7, rise: 0.7, size: 0.035, flatten: 0.15, swirl: 0.8, color: V_STAR });
    // the new moon itself rises beyond the open ground and swells until the whole sky behind her is stars
    const away = _l2.copy(here).sub(camP).setY(0).normalize(), sw = vease(vramp(t, 3.4, CC_REL + 0.3));
    const b = here.x * away.x + here.z * away.z, far = arenaR ? Math.min(16, -b + Math.sqrt(Math.max(0, b * b - (here.x * here.x + here.z * here.z) + (arenaR - 0.5) * (arenaR - 0.5)))) : 9;
    const moon = _l3.copy(here).addScaledVector(away, far); moon.y = 3.0 + 5.0 * sw;
    VF.voidFlat('sky', moon, camQ, (5 + 19 * sw) * (0.5 + far / 32), t, vwin(t, 3.4, 4.1, CC_REL + 1.9, 7.6), 0, V_STAR, 1.4);
    // what is left of her foe: a pit opens under it, a black hole falls on it and swallows it, and it collapses to a line of light
    const td = t - END_DOOM;
    if (td > 0 && td < 2.4 && a.tg) {
      const tg = a.tg, top = above(_l2, tg, 1.6), fall = vease(vramp(td, 0, 0.35)), grow = vease(vramp(td, 0.08, 0.85)), gone = vease(vramp(td, 0.9, 1.02)), q = _l3.copy(top).lerp(tg, fall);
      darkK = Math.max(darkK, 0.92 * vwin(td, 0, 0.3, 1.3, 2.2));
      VF.voidFlat('pit', a.gr, vFlatQ, 4.6 * vease(vramp(td, 0, 0.5)) * (1 - vease(vramp(td, 1.15, 1.7))), td, 1, 0, V_STAR, 2.0);
      VF.hole('h', q, (0.16 + 0.95 * grow) * (1 - gone), td, 1, 0.8);
      VF.motes('in', q, 900, td - 0.05, { emit: 0.8, life: 0.5, spread: 4.8, size: 0.05, inward: true, rise: 0, swirl: 8, color: V_STAR });
      VF.flare('hz', q, 12 * vwin(td, 0.9, 1.0, 1.02, 1.5), 0.14, vwin(td, 0.9, 0.98, 1.1, 1.5), V_STAR, 2.4);
      VF.flare('vt', q, 4.5 * vwin(td, 0.92, 1.0, 1.02, 1.3), 0.09, vwin(td, 0.92, 0.98, 1.05, 1.3), V_STAR, 2.2, true);
      VF.orb('pt', q, 0.5 + 1.8 * vramp(td, 1.0, 1.15), vwin(td, 1.0, 1.03, 1.1, 1.5), V_STAR, 2.2);
      for (let k = 0; k < 3; k++) { const u = td - 1.05 - 0.14 * k; VF.wave('dw' + k, _l4.copy(a.gr).setY(a.gr.y + 0.3 * k), V_ID, 0.8 + 10 * vease(u / 1.1), 0.8 * vwin(u, 0, 0.05, 0.4, 1.1), 1, k === 1 ? V_VIOLET : V_STAR, 1.3); }
      VF.motes('dust', q, 500, td - 1.05, { emit: 0.1, life: 1.8, spread: 4.0, size: 0.04, rise: 0.15, color: V_STAR });
      light(q, 0.6 * grow * (1 - gone) + 1.2 * vwin(td, 1.0, 1.03, 1.15, 1.6), V_ICE);
      shakeNow = Math.max(shakeNow, 0.5 * vwin(td, 0.1, 0.8, 0.9, 1.0) + vwin(td, 1.0, 1.03, 1.1, 1.6));
    }
    // the curtains of night, close to the eye: they meet as her arms come down, and part on her bow
    const shut = vease(vramp(r, -0.14, 0.2)), part = vease(vramp(r, 0.48, 0.95));
    if (r > -0.16 && r < 0.98) {
      const D = 1.2, hh = D * Math.tan((C.fov || 30) * PI / 360), hw = hh * (C.aspect || 1), W = 2.1 * hw + 0.05, x = W / 2 + 1.12 * hw * (1 - shut) + 1.4 * hw * part;
      const base = _l2.copy(camP).addScaledVector(camFwd(_l3), D), rt = camRight(_l3);
      VF.voidFlat('cL', _l4.copy(base).addScaledVector(rt, -x), camQ, [W, 2.7 * hh], t, 1, 1, V_STAR, 3.0);
      VF.voidFlat('cR', _l5.copy(base).addScaledVector(rt, x), camQ, [W, 2.7 * hh], t + 9, 1, 2, V_STAR, 3.0);
    }
    // the release: a line of light through the dark, rings running out over the ground, and star dust falling as the curtains part
    VF.flare('line', at0(_l2, 0, 1.2, 0), 30 * vease(vramp(r, 0.2, 0.6)), 0.05 + 0.2 * (1 - vramp(r, 0.25, 0.9)), vwin(r, 0.2, 0.25, 0.6, 1.2), V_STAR, 2.4);
    for (let k = 0; k < 3; k++) { const u = r - 0.25 - 0.3 * k; VF.wave('w' + k, at0(_l2, 0, 0.04 + 0.4 * k, 0), V_ID, 1 + 15 * vease(u / 1.1), vwin(u, 0, 0.06, 0.45, 1.1), 1, k === 1 ? V_VIOLET : V_STAR, 1.3); }
    VF.motes('fall', at0(_l2, 0, 4.2, 0), 700, r - 0.6, { emit: 1.8, life: 2.6, spread: 4.5, rise: -1.0, size: 0.04, flatten: 0.2, color: V_STAR, swirl: 0.3 });
    VF.motes('gold', at0(_l2, 0, 3.8, 0), 160, r - 0.8, { emit: 1.6, life: 2.4, spread: 3.0, rise: -1.1, size: 0.05, flatten: 0.2, color: V_GOLD });
    light(at0(_l2, 0, 2.2, 0.5), 1.1 * vwin(t, 1.2, 3.0, 6.6, 7.6) + 1.0 * vwin(r, 0.2, 0.26, 0.5, 1.1), V_ICE);
    shakeNow = Math.max(shakeNow, 0.3 * vwin(t, 3.6, 5.0, CC_REL, CC_REL + 0.1) + vwin(r, 0.2, 0.25, 0.35, 1.0));
    vNs = '';
  }
  { const D = END_T1 + 8.0;
    // everything Curtain Call does not set on its first key goes back to rest as it begins, so from there on it plays as it does alone
    const cc = ACTS.curtain_call.keys, bridge = { t: END_T1 }; for (const c of CHANS) if (cc[0][c] === undefined) bridge[c] = 'rest';
    defAction('doom_end', D, autoHold(K_DOOM).concat([bridge], kShift(cc, END_T1)),
      { hits: [3.34 / D, 4.0 / D, (END_T1 + END_DOOM) / D, (END_T1 + END_DOOM + 1.0) / D], tags: ['land', 'zero', 'doom', 'gone'], impacts: [0.3, 0.95, 0.4, 1.0],
        cues: [DOOM_REL / D, (END_T1 + CC_REL) / D], outro: 0.6, start: doomStart, fx(a) { if (a.t < END_T1 + 0.3) fxDoom(a, a.t); else loreFrame(); if (a.t > END_T1) fxCurtain(a, a.t - END_T1); } }); }

  // ---- the attack taunt: two steps of her jig, a twirl with the black hole gathering over her raised hand, the fling, her hand pressing it down, and a laugh ----
  const TA_S = 0.78, TA_REL = 2.92;
  (function () {
    const keys = [], B = 0.32;
    keys.push({ t: 0.16, hR: HIPS_R, hL: HIPS_L, eR: [-1, -0.1, -0.5], eL: [1, -0.1, -0.5], fR: FP.loose, fL: FP.loose, wrR: [0.5, 0], wrL: [0.5, 0], hip: [0, -0.05, 0], hd: [0.30, 0, 0.05], mouth: 2 });
    jigStep(keys, 0.36, B, -1, 0, { sp: [-0.14, 0.02, 0.06], hd: [0.36, 0, -0.07] }); jigStep(keys, 0.36 + B, B, 1, 1, { sp: [0.14, 0.02, -0.06], hd: [0.24, 0, 0.07] });
    keys.push({ t: TA_S + 0.30, hip: [0.02, -0.05, 0], hipR: 'rest', ftR: 'rest', ftL: 'rest', hR: [-0.50, 1.20, 0.10], hL: [0.50, 1.20, 0.10], eR: [-0.4, -1, -0.5], eL: [0.4, -1, -0.5], fR: FP.open, fL: FP.open, twR: 0.6, twL: 0.6, wrR: 'rest', wrL: 'rest', sp: [-0.14, 0.04, 0], hd: [0.15, 0, 0], knR: [-0.2, 0, 1], knL: [0.2, 0, 1] });
    const up = { hip: [-0.004, 0.035, 0], ftR: [0.077, 0.055, 0.012, 0.10, 0.62], ftL: [-0.085, 0.33, 0.07, 0.25, 0.95], knL: [1, 0, 0.7], knR: [0, 0, 1] };
    keys.push(Object.assign({ t: TA_S + 0.52, hR: [-0.17, 1.24, 0.21], eR: [-1, -0.4, -0.2], fR: FP.soft, hL: [0.16, 1.58, 0.13], eL: [1, -0.4, -0.3], twL: 1.45, fL: FP.cup, wrL: [-0.25, 0], sp: [0, -0.03, 0], hd: [0, -0.10, 0], mouth: 2 }, up));
    keys.push(Object.assign({ t: TA_S + 1.62, hR: [-0.17, 1.24, 0.21], hL: [0.16, 1.66, 0.11] }, up));
    keys.push({ t: TA_S + 1.94, hip: [-0.03, -0.05, 0], ftR: [-0.10, 0, 0, -0.25, 0], ftL: [0.17, 0, 0.02, 0.3, 0], knL: 'rest', knR: 'rest', hL: [0.02, 1.70, 0.02], eL: [1, 0.2, -0.5], sp: [-0.20, -0.06, 0], hd: [0.30, 0, 0], hR: [0.20, 1.20, 0.22], fR: FP.point, eR: [-0.3, -1, -0.3], twR: -0.3 });
    keys.push({ t: TA_REL, hL: [0.50, 1.44, 0.14], eL: [0.3, -1, -0.4], fL: FP.open, twL: -0.4, wrL: [-0.5, 0], sp: [0.40, 0.04, 0], hipR: [0.14, 0, 0], hd: [0.42, 0, 0], hip: [0.05, -0.05, 0.01], hR: [0.30, 1.22, 0.22], mouth: 1 });
    keys.push({ t: TA_REL + 0.22, hL: [0.52, 1.50, 0.12], wrL: [-0.7, 0] });
    keys.push({ t: TA_REL + 0.40, hL: [0.46, 0.98, 0.16], wrL: [-0.6, 0], sp: [0.44, 0.14, 0], hip: [0.05, -0.10, 0.01], hd: [0.42, 0.10, 0] });           // her hand comes down with it
    keys.push({ t: TA_REL + 0.74, hL: [0.46, 0.96, 0.16], hip: [0.05, -0.10, 0.01] });
    let t = TA_REL + 1.05;
    keys.push({ t, hip: [0, 0, 0], hipR: [0, 0, 0], ftR: 'rest', ftL: 'rest', sp: [0.10, -0.07, 0], hd: [0.26, -0.18, 0.05], hL: [0.09, 1.02, 0.17], eL: [1, -0.3, -0.2], fL: FP.soft, wrL: [0.3, 0], twL: 0, hR: [-0.20, 1.34, 0.20], eR: [-1, -0.6, -0.1], fR: FP.soft, twR: 0.7, eyes: 0.85, mouth: 1 });
    t = laughShakes(keys, t + 0.13, 6, 0.26, 0.10);
    keys.push({ t: t + 0.12, sh: [0, 0], sp: [0, 0.03, 0], hd: [0.10, 0.03, 0.03], mouth: 2, eyes: 0.4 }, { t: t + 0.45, mouth: 2, eyes: 0 });
    const D = t + 0.95;
    defLore('taunt_attack', D, keys, { outro: 0.45, stand: true, hits: [(TA_REL + 0.40) / D, (TA_REL + 0.78) / D], tags: ['press', 'burst'], impacts: [0.5, 0.9], cues: [(TA_S + 0.52) / D, TA_REL / D],
      spin: [[0, 0], [TA_S, 0], [TA_S + 0.34, -0.5], [TA_S + 0.56, 0.6], [TA_S + 1.10, 6.9], [TA_S + 1.62, 12.0], [TA_S + 1.92, TAU * 2], [D, TAU * 2]],
      fx(a) {
        const T = a.t, r = T - TA_REL; loreFrame(); vNs = 'grav:';
        if (r < 0) {                                                       // it gathers over her hand as she turns, drinking the light
          const p = above(_l1, anchor('handL', _h1), 0.17), s = vease(vramp(T, TA_S + 0.45, TA_S + 1.75));
          a.from = (a.from || V3()).copy(p);
          VF.hole('g', p, 0.05 + 0.09 * s, T, vramp(T, TA_S + 0.42, TA_S + 0.7));
          VF.motes('pull', p, 420, T - TA_S - 0.45, { emit: 1.35, life: 0.42, spread: 1.5, size: 0.04, inward: true, rise: 0, swirl: 9, color: V_STAR });
          light(p, 0.7 * s, V_EMBER); darkK = Math.max(darkK, 0.5 * s);
        } else if (a.from) {                                               // flung up and over, then dropped on her target with the weight of the sky
          if (!a.fired.rel) { a.fired.rel = true; a.tg = tgt0(a.tg || V3()); a.gr = (a.gr || V3()).copy(a.tg); a.gr.y = _rp.y + 0.03; a.mid = (a.mid || V3()).copy(a.tg).lerp(a.gr, 0.35); fxHitP.copy(a.mid); }
          const apex = above(_l1, a.tg, 1.9), mid = a.mid, gr = a.gr, u = vcl(r / 0.28), drop = vease((r - 0.28) / 0.12);
          const p = _l2.copy(a.from).multiplyScalar((1 - u) * (1 - u)).addScaledVector(_l3.copy(a.from).lerp(apex, 0.5).setY(apex.y + 0.5), 2 * u * (1 - u)).addScaledVector(apex, u * u); p.lerp(mid, drop);
          const grow = vease(vramp(r, 0.26, 0.46)), gone = vease(vramp(r, 0.66, 0.76)), b = r - 0.78;
          VF.hole('g', p, (0.14 + 0.72 * grow) * (1 - gone), T, 1 - gone);
          VF.voidFlat('pit', gr, vFlatQ, 4.6 * vwin(r, 0.30, 0.50, 0.74, 1.04), T, 1, 0, V_STAR, 2.2);
          VF.wave('imp', gr, V_ID, 5.0 - 4.6 * vease((r - 0.30) / 0.36), 0.7 * vwin(r, 0.30, 0.36, 0.60, 0.70), 1, V_VIOLET, 1.5);
          VF.motes('in', mid, 800, r - 0.30, { emit: 0.12, life: 0.34, spread: 3.4, size: 0.05, inward: true, flatten: 0.5, rise: 0, swirl: 7, color: V_STAR });
          VF.flare('hz', mid, 13 * vwin(b, 0, 0.05, 0.08, 0.4), 0.25, vwin(b, 0, 0.03, 0.1, 0.4));
          VF.flare('vt', mid, 5 * vwin(b, 0, 0.05, 0.08, 0.3), 0.12, vwin(b, 0, 0.03, 0.1, 0.3), V_STAR, 3.0, true);
          VF.orb('hit', mid, 0.5 + 1.5 * vramp(b, 0, 0.12), vwin(b, 0, 0.02, 0.06, 0.3), V_STAR, 1.8);
          VF.wave('out', gr, V_ID, 0.5 + 8 * vease(b / 0.5), 0.8 * vwin(b, 0, 0.02, 0.2, 0.5), 1, V_VIOLET, 1.6);
          VF.motes('pop', mid, 500, b, { emit: 0.04, life: 0.9, spread: 2.6, size: 0.045, rise: 0.2, color: V_STAR });
          light(mid, 0.8 * (1 - gone) + 1.6 * vwin(b, 0, 0.02, 0.1, 0.4), V_ICE);
          darkK = Math.max(darkK, 0.5 * (1 - vramp(r, 0.78, 1.15))); shakeNow = Math.max(shakeNow, 0.5 * vwin(r, 0.30, 0.38, 0.6, 0.7) + 0.9 * vwin(b, 0, 0.02, 0.06, 0.35));
        }
        vNs = '';
      } });
  })();

  // ---- the heal taunt: Against All Odds, danced. The odds turn; she stands on the night sky, seven stars come out round her and join into a figure,
  //      and she jigs a full turn inside it with her arms up, laughs, and takes her due. Their light runs down into her alone. ----
  (function () {
    const keys = kShift(ACTS.against_all_odds.keys, 0, 0, 1.6), B = 0.34, N = 10, T0 = 2.02, REL = 1.5;
    const armsA = { hR: [-0.45, 1.50, 0.08], hL: [0.44, 1.61, 0.08] }, armsB = { hR: [-0.44, 1.60, 0.08], hL: [0.45, 1.52, 0.08] };
    for (let i = 0; i < N; i++) { const sd = i % 2 ? 1 : -1, A = i % 4 < 2 ? armsA : armsB;
      jigStep(keys, T0 + i * B, B, sd, i % 4 >= 2 ? 1 : 0, Object.assign({ sp: [sd * 0.10, -0.08, sd * -0.05], hd: [sd * -0.06, -0.26 + 0.10 * (i % 2), sd * 0.05], eyes: i % 3 === 2 ? 0.7 : 0, mouth: i % 2 ? 1 : 2 }, i % 2 === 0 ? A : {})); }
    let t = T0 + N * B;
    keys.push({ t: t - B * 0.5, hip: [0, 0.05, 0], ftR: [0, 0.07, 0, -0.1, 0.55], ftL: [0, 0.07, 0, 0.1, 0.55] });
    keys.push({ t: t + 0.06, hip: [0, -0.04, 0], hipR: [0, 0, 0], ftR: [-0.04, 0, 0, -0.2, 0], ftL: [0.04, 0, 0, 0.2, 0], knR: 'rest', knL: 'rest', sp: [0, -0.07, 0], hd: [0, -0.20, 0.05], hL: [0.09, 1.02, 0.17], eL: [1, -0.3, -0.2], fL: FP.soft, wrL: [0.3, 0], twL: 0.2, hR: [-0.20, 1.34, 0.20], eR: [-1, -0.6, -0.1], fR: FP.soft, twR: 0.7, eyes: 0.85, mouth: 1 });
    const TL = t + 0.06; t = laughShakes(keys, t + 0.20, 6, 0, 0);
    keys.push({ t: t + 0.22, sh: [0, 0], hip: [0, 0, 0], ftR: 'rest', ftL: 'rest', hR: [-0.52, 1.21, 0.13], hL: [0.52, 1.21, 0.13], fR: FP.open, fL: FP.open, twR: 1.3, twL: 1.3, wrR: [-0.2, 0], wrL: [-0.2, 0], eR: [-0.5, -1, -0.4], eL: [0.5, -1, -0.4], sp: [0, -0.04, 0], hd: [0, -0.08, 0], eyes: 0, mouth: 2 });       // and there you have it
    keys.push({ t: t + 0.85, hR: [-0.50, 1.18, 0.14], hL: [0.50, 1.18, 0.14], mouth: 2 });
    const D = t + 1.45, OUT = t + 0.3;
    defLore('taunt_heal', D, keys, { outro: 0.5, stand: true, hits: [REL / D], tags: ['heal'], impact: 0.5, cues: [0.5 / D, TL / D],
      spin: [[0, 0], [T0 - 0.2, 0], [T0 + N * B * 0.5, PI * 1.02], [T0 + N * B, TAU], [D, TAU]],
      fx(a) {
        const T = a.t, r = T - REL, al = vwin(T, 1.0, 1.6, OUT, OUT + 0.9), end = T - OUT, r2 = T - TL; loreFrame(); vNs = 'heal:';
        darkK = Math.max(darkK, 0.5 * al);
        VF.voidFlat('floor', at0(_l1, 0, 0.02, 0), vFlatQ, 4.6 * vease(vramp(T, 0.5, 1.5)) * (1 - vease(vramp(T, OUT + 0.1, OUT + 1.0))), T, 1, 0, V_STAR, 2.2);
        VF.rune('floor2', at0(_l1, 0, 0.035, 0), _rq0, 2.9, -T * 0.5, vramp(T, 0.9, 1.5), 0.7 * al, 1, V_GOLD, 1.5, 4);
        const heart = anchor('chest', _h1); let last = null;
        for (let k = 0; k < 7; k++) {
          const ang = k * 2.399 + 0.6 + 0.22 * T, rad = 1.5 + 0.5 * ((k * 37) % 5) / 5, h = 0.8 + 2.3 * ((k * 53) % 7) / 7, t0 = 1.2 + 0.28 * k, P = at0(k % 2 ? _l2 : _l3, rad * Math.cos(ang), h, rad * Math.sin(ang));
          VF.orb('st' + k, P, 0.2 * (1 + 0.25 * Math.sin(T * 5 + k)), al * vramp(T, t0, t0 + 0.2), V_STAR, 2.4);
          if (last) VF.strip('ln' + k, last, _l4.copy(last).lerp(P, vramp(T, t0, t0 + 0.28)), 0.03, 0.8 * al, V_STAR, 1.6);
          // their light runs down into her: once as the odds turn, and again as she laughs
          VF.strip('dn' + k, P, _l4.copy(P).lerp(heart, vramp(r, 0.1 + 0.05 * k, 0.5 + 0.05 * k)), 0.022, 0.5 * al * vwin(r, 0.1, 0.3, 1.2, 2.0), V_EMBER, 1.6);
          VF.strip('de' + k, P, _l4.copy(P).lerp(heart, vramp(r2, 0.05 * k, 0.4 + 0.05 * k)), 0.022, 0.5 * al * vwin(r2, 0, 0.2, 1.0, 1.6), V_EMBER, 1.6);
          last = P;
        }
        VF.pillar('col', at0(_l1, 0, 0, 0), 0.9, 6.0, T * 0.6, (0.2 * vwin(r, 0, 0.15, 0.5, 1.2) + 0.07) * al, 1, V_ICE, 1.3);
        for (let k = 0; k < 5; k++) { const u = (r / 1.6 - k * 0.2) % 1; if (r > k * 0.32 && T < OUT && u >= 0) VF.hoop('up' + k, at0(_l1, 0, 0.1 + 2.2 * u, 0), V_ID, 1.5 - 0.6 * u, T * 1.5 + k, 0.8 * Math.sin(u * PI), 1, k % 2 ? V_GOLD : V_STAR, 1.7); }      // rings of light climb her
        VF.motes('embers', at0(_l1, 0, 0.1, 0), 700, r, { emit: OUT - REL - 1.2, life: 2.2, spread: 1.5, rise: 1.0, size: 0.035, flatten: 0.1, swirl: 1.2, color: V_STAR });
        VF.motes('glints', at0(_l1, 0, 0.1, 0), 200, r, { emit: OUT - REL - 1.2, life: 1.8, spread: 1.0, rise: 1.4, size: 0.04, flatten: 0.1, swirl: -2.0, color: V_GOLD });
        VF.flare('hz', at0(_l1, 0, 1.2, 0), 10 * vwin(r, 0, 0.08, 0.1, 0.5), 0.2, vwin(r, 0, 0.04, 0.15, 0.5));
        VF.wave('w0', at0(_l1, 0, 0.05, 0), V_ID, 1 + 9 * vease(r / 1.0), 0.6 * vwin(r, 0, 0.05, 0.4, 1.0), 1, V_VIOLET, 1.5);
        VF.wave('w1', at0(_l1, 0, 0.05, 0), V_ID, 1 + 8 * vease(end / 0.9), vwin(end, 0, 0.05, 0.4, 0.9), 1, V_GOLD, 1.9);
        light(at0(_l1, 0, 2.0, 0.5), 0.5 * al + 0.9 * vwin(r, 0, 0.05, 0.2, 0.7), V_ICE);
        shakeNow = Math.max(shakeNow, 0.4 * vwin(r, 0, 0.05, 0.1, 0.6));
        if (cue(a, 'release', REL)) fxHitP.copy(heart);
        vNs = '';
      } });
  })();

  // ---- taking a hit at full power. The blow comes from her casting side. She rocks back, bounces up, and laughs it off or dusts herself off;
  //      her bells jingle, and a ring lights. Over a stance only her body above the hips moves. ----
  function fxHitTaken(a) {
    const T = a.t; loreFrame(); vNs = 'hit:';
    const c = anchor('chest', _h1), from = _l1.copy(c).addScaledVector(_l2.set(1, 0, 0.3).applyQuaternion(_rq0), 0.2), camQ = camNow().quaternion;
    if (cue(a, 'struck', 0.08)) { fxHitP.copy(c); burst(anchor('bells', _l3), 12, 0.7, 0.5, 0.03, COL.gold, 1.2, 1.8, 0.3); }
    VF.wave('w', from, V_ID, 0.12 + 0.95 * vease((T - 0.08) / 0.35), 0.55 * vwin(T, 0.08, 0.1, 0.2, 0.42), camQ, V_STAR, 1.4);
    VF.shade('s', from, 1.8, 0.7 * vwin(T, 0.08, 0.1, 0.2, 0.45));
    VF.flare('f', from, 2.2 * vwin(T, 0.08, 0.11, 0.14, 0.3), 0.06, vwin(T, 0.08, 0.1, 0.16, 0.3));
    VF.motes('d', from, 140, T - 0.08, { emit: 0.04, life: 0.6, spread: 1.1, size: 0.035, rise: 0.1, color: V_STAR });
    const j = vwin(T, 0.15, 0.25, 0.7, 1.1); if (j > 0.01) show(gGold, anchor('bells', _l3), 0.22 + 0.06 * Math.sin(T * 40), 0.5 * j);
    vNs = '';
  }
  const hitGain = () => setRings(ringN + 1);
  (function () {
    const keys = [
      { t: 0.10, hip: [-0.07, -0.04, -0.05], hipR: [-0.10, -0.10, 0.06], sp: [-0.22, -0.26, 0.10], hd: [0.20, 0.22, 0.10], hR: [-0.52, 1.28, 0.00], hL: [0.42, 1.36, 0.06], eR: [-0.6, -0.6, -0.6], eL: [0.6, -0.6, -0.6], fR: FP.open, fL: FP.open, ftR: [-0.16, 0, -0.14, -0.3, 0], eyes: 1, mouth: 1 },
      { t: 0.26, hip: [-0.10, -0.07, -0.07], sp: [-0.26, -0.30, 0.12], hR: [-0.56, 1.20, -0.04], hL: [0.38, 1.30, 0.02] },
      { t: 0.60, hip: [0, 0.03, 0], hipR: [0, 0, 0], sp: [0.06, 0.06, 0], hd: [0.12, -0.06, 0], hR: [-0.34, 1.02, 0.10], hL: [0.34, 1.02, 0.10], fR: FP.soft, fL: FP.soft, ftR: [-0.02, 0.04, 0, -0.1, 0.4], ftL: [0.02, 0.04, 0, 0.1, 0.4], eyes: 0, mouth: 2 },
      { t: 0.82, hip: [0, -0.03, 0], ftR: 'rest', ftL: 'rest' },
      { t: 1.00, hip: [0, 0, 0], hR: HIPS_R, hL: HIPS_L, eR: [-1, -0.1, -0.5], eL: [1, -0.1, -0.5], fR: FP.loose, fL: FP.loose, wrR: [0.5, 0], wrL: [0.5, 0], hd: [0.25, -0.16, 0.05], sp: [0.08, -0.06, 0], eyes: 0.8, mouth: 1 }];
    const t = laughShakes(keys, 1.12, 5, 0.25, 0.08);
    keys.push({ t: t + 0.12, sh: [0, 0], hd: [0.15, 0, 0.03], sp: [0.04, 0, 0], mouth: 2, eyes: 0 });
    defLore('hit_laugh', t + 0.62, keys, { outro: 0.45, hits: [0.10 / (t + 0.62)], tags: ['ring'], impact: 0.45, onHit: hitGain, fx: fxHitTaken });
  })();
  defLore('hit_dust', 2.9, [
    { t: 0.10, hip: [-0.06, -0.03, -0.03], hipR: [-0.16, -0.06, 0.05], sp: [-0.36, -0.14, 0.10], hd: [0.26, 0.16, 0.08], hL: [0.50, 1.22, 0.02], hR: [-0.40, 1.10, 0.14], eL: [0.6, -0.6, -0.6], fL: FP.open, fR: FP.open, ftL: [0.02, 0.02, 0, 0.1, 0.3], eyes: 1 },
    { t: 0.28, hip: [-0.09, -0.05, -0.04], sp: [-0.42, -0.16, 0.12] },
    { t: 0.75, hip: [0, 0, 0], hipR: [0, 0, 0], sp: [0.05, 0.02, 0], hd: [0.20, 0.04, 0.05], hL: [0.31, 0.90, 0.07], eL: 'rest', fL: FP.relax, hR: [-0.30, 0.90, 0.07], fR: FP.relax, ftL: 'rest', eyes: 0 },
    { t: 1.05, hR: [0.150, 1.385, 0.150], eR: [-1, -0.8, 0.1], twR: 0.4, fR: FP.soft, wrR: [0.3, 0], hd: [0.42, 0.14, 0.02], sp: [0.10, 0.03, 0], mouth: 2 },          // she brushes her shoulder off
    { t: 1.22, hR: [0.255, 1.345, 0.115] }, { t: 1.38, hR: [0.150, 1.385, 0.150] }, { t: 1.54, hR: [0.255, 1.345, 0.115] }, { t: 1.70, hR: [0.155, 1.380, 0.150] },
    { t: 1.95, hR: [-0.30, 1.16, 0.22], fR: FP.open, twR: 1.0, wrR: [-0.3, 0], eR: [-0.6, -1, -0.3], hd: [0.22, -0.05, 0.05] },
    { t: 2.35, hR: [-0.30, 0.92, 0.08], fR: FP.relax, twR: 0.1, wrR: 'rest', hd: [0.10, 0, 0.02], sp: [0, 0, 0], mouth: 2 }
  ], { outro: 0.45, hits: [0.10 / 2.9], tags: ['ring'], impact: 0.45, onHit: hitGain, fx: fxHitTaken });

  // ---- more dancing and jester acting ----
  // Caper: four leaps from side to side with her heels clicked together in the air, then a turn in the air and a pose
  (function () {
    const keys = [{ t: 0.16, hip: [0, -0.09, 0], sp: [0, 0.10, 0], hR: [-0.34, 0.92, -0.06], hL: [0.34, 0.92, -0.06], fR: FP.soft, fL: FP.soft, knR: [-0.2, 0, 1], knL: [0.2, 0, 1], mouth: 2 }], L = 0.50;
    for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, t = 0.40 + i * L;           // s: the side she leaps to (-1 her right)
      keys.push({ t, hip: [s * 0.10, 0.17, 0], hipR: [0, 0, s * -0.10], sp: [0, -0.02, s * 0.14], hd: [s * 0.10, -0.06, s * -0.10],
        ['ft' + (s < 0 ? 'R' : 'L')]: [s * 0.13, 0.27, 0, s * 0.3, 0.5], ['ft' + (s < 0 ? 'L' : 'R')]: [s * 0.215, 0.25, 0.01, s * -0.3, 0.5], knR: [-0.1, 0, 1], knL: [0.1, 0, 1],
        hR: [-0.50, 1.34 + (s < 0 ? 0.10 : 0), 0.06], hL: [0.50, 1.34 + (s > 0 ? 0.10 : 0), 0.06], eR: [-0.4, -1, -0.5], eL: [0.4, -1, -0.5], fR: FP.open, fL: FP.open, twR: 0.8, twL: 0.8, mouth: 1 });
      keys.push({ t: t + 0.25, hip: [s * 0.03, -0.07, 0], hipR: [0, 0, 0], sp: [0, 0.06, 0], hd: [0, 0, 0], ftR: [-0.05, 0, 0, -0.15, 0], ftL: [0.05, 0, 0, 0.15, 0], hR: [-0.36, 1.00, 0.06], hL: [0.36, 1.00, 0.06], fR: FP.soft, fL: FP.soft, mouth: 2 });
    }
    const t = 0.40 + 4 * L;                                                              // 2.40: she gathers, turns once in the air, and lands in a pose
    keys.push({ t: t + 0.02, hip: [0, -0.12, 0], sp: [0, 0.14, 0], hR: [-0.30, 0.90, -0.10], hL: [0.30, 0.90, -0.10] });
    keys.push({ t: t + 0.24, hip: [0, 0.20, 0], sp: [0, -0.04, 0], hd: [0, -0.08, 0], ftR: [0.02, 0.26, 0, -0.1, 0.7], ftL: [-0.02, 0.24, 0, 0.1, 0.7], hR: [-0.14, 1.26, 0.20], hL: [0.14, 1.24, 0.20], eR: [-1, -0.4, -0.2], eL: [1, -0.4, -0.2], fR: FP.soft, fL: FP.soft, mouth: 1 });
    keys.push({ t: t + 0.44, hip: [0, 0.12, 0], ftR: [0.02, 0.16, 0, -0.1, 0.6], ftL: [-0.02, 0.15, 0, 0.1, 0.6] });
    keys.push({ t: t + 0.60, hip: [-0.03, -0.07, 0], hipR: [0, 0, -0.06], sp: [0, -0.02, 0.06], hd: [-0.10, -0.12, 0.08], ftR: [0, 0, 0, -0.2, 0], ftL: [0.11, 0.02, 0.07, 0.35, 0.5], knL: [0.3, 0, 1], knR: 'rest',
      hR: [-0.30, 1.68, 0.06], eR: [-1, -0.3, -0.4], fR: FP.open, twR: 0.9, wrR: [0, 0], hL: HIPS_L, eL: [1, -0.1, -0.5], fL: FP.loose, wrL: [0.5, 0], twL: 0, mouth: 2 });
    keys.push({ t: t + 0.76, hip: [-0.03, -0.02, 0] }, { t: t + 1.25, hip: [-0.03, -0.02, 0], hR: [-0.30, 1.68, 0.06], mouth: 2 });
    const D = t + 1.75;
    defLore('caper', D, keys, { outro: 0.45, stand: true, spin: [[0, 0], [t + 0.10, 0], [t + 0.56, TAU], [D, TAU]] });
  })();
  // Prance: six high-kneed skips on the spot with her elbows going, then a heel dug out in front and her arms thrown wide
  (function () {
    const keys = [{ t: 0.14, hip: [0, -0.05, 0], fR: FP.loose, fL: FP.loose, mouth: 2 }], B = 0.36, N = 6;
    for (let i = 0; i < N; i++) { const s = i % 2 ? 1 : -1, t = 0.40 + i * B, up = s < 0 ? 'R' : 'L', dn = s < 0 ? 'L' : 'R';       // s: which knee is up (-1 her right)
      keys.push({ t: t - B * 0.5, hip: [0, 0.05, 0], ['ft' + dn]: [0, 0.07, 0, -s * 0.1, 0.6] });
      keys.push({ t, hip: [s * -0.02, -0.035, 0], hipR: [s * 0.08, 0, s * -0.04], sp: [s * -0.12, 0.03, s * 0.05], hd: [0, -0.04, s * -0.09], ['ft' + up]: [s * -0.01, 0.36, 0.17, 0, 0.75], ['ft' + dn]: [0, 0, -0.02, -s * 0.1, 0], ['kn' + up]: [s * 0.04, 0, 1],
        ['h' + dn]: [-s * 0.19, 1.24, 0.30], ['h' + up]: [s * 0.31, 1.00, -0.10], eR: [-0.5, -0.4, -1], eL: [0.5, -0.4, -1], twR: 0.5, twL: 0.5, mouth: i % 2 ? 2 : 1 });
    }
    const t = 0.40 + N * B;                                                              // 2.56: ta-da
    keys.push({ t: t - B * 0.5, hip: [0, 0.05, 0], ftR: [0, 0.06, 0, -0.1, 0.5], ftL: [0, 0.06, 0, 0.1, 0.5] });
    keys.push({ t: t + 0.04, hip: [0.02, -0.06, -0.03], hipR: [0, 0, 0], sp: [0, 0.14, 0], hd: [0, -0.20, 0.06], ftR: [-0.03, 0.035, 0.27, -0.2, -0.50], ftL: [0.03, 0, -0.04, 0.25, 0], knL: [0.2, 0, 1], knR: 'rest',
      hR: [-0.56, 1.20, 0.14], hL: [0.56, 1.24, 0.14], eR: [-0.5, -1, -0.4], eL: [0.5, -1, -0.4], fR: FP.open, fL: FP.open, twR: 1.3, twL: 1.3, wrR: [-0.2, 0], wrL: [-0.2, 0], mouth: 2 });
    keys.push({ t: t + 0.75, hip: [0.02, -0.06, -0.03], hR: [-0.56, 1.22, 0.14], mouth: 2 });
    defLore('prance', t + 1.3, keys, { outro: 0.45, stand: true });
  })();
  // Juggle: three small new moons, tossed from hand to hand. Only her arms, head and face move, so she can juggle sitting, kneeling or in the air.
  const JG = { t0: 0.70, tau: 0.27, beats: 13 };
  (function () {
    const inR = [-0.09, 1.13, 0.31], outR = [-0.25, 1.03, 0.30], inL = [0.09, 1.13, 0.31], outL = [0.25, 1.03, 0.30], eD = (s) => [s * 0.6, -1, -0.3];
    const keys = [{ t: 0.30, hR: outR, hL: outL, eR: eD(-1), eL: eD(1), twR: 1.35, twL: 1.35, fR: FP.cup, fL: FP.cup, wrR: [-0.1, 0], wrL: [-0.1, 0], hd: [0, 0.10, 0], mouth: 2 }];
    for (let k = 0; k <= JG.beats; k++) keys.push({ t: JG.t0 + k * JG.tau, hR: k % 2 ? outR : inR, hL: k % 2 ? inL : outL, hd: [k % 2 ? 0.05 : -0.05, -0.14, k % 2 ? -0.02 : 0.02], mouth: 1, eyes: 0 });      // each hand scoops in to throw and out to catch
    const te = JG.t0 + (JG.beats + 2) * JG.tau;
    keys.push({ t: te, hR: outR, hL: outL, hd: [0, -0.04, 0], mouth: 2 });
    keys.push({ t: te + 0.40, hR: [-0.46, 1.30, 0.14], hL: [0.46, 1.30, 0.14], fR: FP.open, fL: FP.open, twR: 1.3, twL: 1.3, eR: [-0.5, -1, -0.4], eL: [0.5, -1, -0.4], hd: [0, -0.16, 0], mouth: 2 });
    keys.push({ t: te + 0.95, hR: [-0.46, 1.28, 0.14], mouth: 2 });
    JG.end = te + 0.12;
    defLore('juggle', te + 1.5, keys, { outro: 0.5, fx(a) {
      const T = a.t, F = 2 * JG.tau, H = 9.8 * F * F / 8, on = vwin(T, 0.22, 0.45, JG.end + 0.25, JG.end + 0.6), rise = vease(vramp(T, JG.end, JG.end + 0.6));
      loreFrame(); vNs = 'jug:';
      const hr = above(_h1, anchor('handR', _h1), 0.045), hl = above(_h2, anchor('handL', _h2), 0.045), beat = Math.min(JG.beats - 1, Math.floor((T - JG.t0) / JG.tau));
      const heldR = [], heldL = [], P = [_l1, _l2, _l3];
      for (let b = 0; b < 3; b++) {
        let n = -1; for (let k = beat; k >= 0; k--) if (k % 3 === b) { n = k; break; }      // the last beat on which this one was thrown
        if (n < 0) { (b === 1 ? heldL : heldR).push(b); continue; }
        const u = (T - JG.t0 - n * JG.tau) / F, from = n % 2 ? hl : hr, to = n % 2 ? hr : hl;
        if (u < 1) { P[b].copy(from).lerp(to, u); P[b].y += 4 * H * u * (1 - u); } else (n % 2 ? heldR : heldL).push(b);
      }
      heldR.forEach((b, i) => { P[b].copy(hr); P[b].x += (i - (heldR.length - 1) / 2) * 0.05; });       // two in one hand lie side by side
      heldL.forEach((b, i) => { P[b].copy(hl); P[b].x += (i - (heldL.length - 1) / 2) * 0.05; });
      for (let b = 0; b < 3; b++) {
        P[b].y += (0.35 + 0.12 * b) * rise;
        VF.voidBall('m' + b, P[b], 0.028 * (1 - 0.6 * rise), on, V_STAR, 3.4, 2.2, 0, T);
        VF.orb('o' + b, P[b], 0.15 + 0.1 * rise, 0.7 * on, b === 2 ? V_GOLD : V_STAR, 2.0);
      }
      if (cue(a, 'gone', JG.end + 0.5)) for (let b = 0; b < 3; b++) burst(P[b], 10, 0.5, 0.6, 0.03, COL.pale, 0.2, 1.6, 0.4);
      vNs = '';
    } });
  })();

  // how hard the lore's moves land, where one number serves for all of a move's blows
  for (const [n, k] of [['taunt_heal', 0.5]]) if (ACTS[n]) ACTS[n].impact = k;
