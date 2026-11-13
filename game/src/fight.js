// fight.js: a fight on a painted backdrop. The rules are the approved combat engine (lore/sim/blob-battle-engine.js),
// used unchanged: this file only shows what the engine decides, with the real models, and asks the player for each move.
// Nothing is timed: when it is a witch's turn the game waits. The party is on the left and the foes on the right; a witch
// facing the camera casts toward her own left, at the foes; nobody is ever mirrored.
// For the pilot the party is the Jester alone, because she is the only finished model.
function makeMFFight(stage, S, H) {
  'use strict';
  const E = window.MF_ENGINE, ui = H.ui, panel = H.panel, group = new THREE.Group(); group.visible = false; stage.cast.add(group);
  const WORDS = { sealed: 'sealed', ended: 'Ended', fate: 'Fate', won: 'The show is over', lost: 'The party has fainted', xp: 'XP', again: 'Fight again', yourTurn: 'Her turn: choose a move', foeTurn: 'acts', target: 'Target' };
  const ANIM = { j_plain: 'g_rebuke', j_jab: 'taunt_attack', j_heal: 'taunt_heal', j_seal: 'g_seal' }, AIMED = { g_rebuke: 1, taunt_attack: 1, g_seal: 1, g_curtain: 1 }, HITS = ['hit_laugh', 'hit_dust'];
  const XP = { normal: 10, difficult: 40, boss: 400 };
  const C = S.centre, at = (p) => [C[0] + p[0], C[1] + p[1]];
  // the foes: Envoi's wisp, built once at load
  const wisps = S.foes.slice(0, 3).map((p, i) => { const m = window.makeWisp({ seed: i + 1, level: 1 }), [x, z] = at(p); m.root.position.set(x, 0, z); group.add(m.root, m.fx); m.root.visible = false; return { m, x, z, patch: stage.footPatch(0.34), i }; });
  for (const w of wisps) w.patch.visible = false;
  const herPatch = stage.footPatch(0.42); herPatch.visible = false;
  const hp0 = at(S.party.jester), her = { x: hp0[0], z: hp0[1], face: 0, aim: null };

  // ---------- the words and bars over the picture ----------
  ui.innerHTML = '<div class="turnbar" aria-label="The next turns"></div><div class="banner" hidden></div><div class="floats"></div><div class="bars"></div>';
  panel.innerHTML = '<p class="log" aria-live="polite"></p><div class="who"><b class="nm"></b><span class="hpn"></span><div class="hp"><i></i></div><span class="mpn"></span></div><div class="moves"></div><p class="help"></p>';
  const $ = (q) => ui.querySelector(q) || panel.querySelector(q), elBar = $('.turnbar'), elBanner = $('.banner'), elFloats = $('.floats'), elBars = $('.bars'), elMoves = $('.moves'), elHelp = $('.help'), elLog = $('.log');
  const foeBars = wisps.map((w) => { const d = document.createElement('button'); d.type = 'button'; d.className = 'foebar'; d.innerHTML = '<span></span><div><i class="life"></i><i class="fate"></i></div>'; d.addEventListener('click', () => { if (B && phase === 'menu' && shown.foes[w.i] && shown.foes[w.i].up) { tgt = w.i; paint(); } }); elBars.appendChild(d); return d; });
  function float(v, text, cls) { const p = stage.toScreen(v), d = document.createElement('span'); d.className = 'float ' + (cls || ''); d.textContent = text; d.style.left = p[0].toFixed(0) + 'px'; d.style.top = p[1].toFixed(0) + 'px'; elFloats.appendChild(d); setTimeout(() => d.remove(), 1500); }
  const num = (n) => Math.round(n).toLocaleString('en-US');

  // ---------- the fight ----------
  let J = null, B = null, phase = 'off', act = null, tgt = 0, fights = 0, hitTurn = 0, time = 0, shake = 0, win = null, auto = null, wait = 0, count = 1;
  const shown = { hp: 0, mp: 0, foes: [] }, _v = new THREE.Vector3(), _w = new THREE.Vector3();
  let rs = 977; const rnd = () => { rs ^= rs << 13; rs >>>= 0; rs ^= rs >>> 17; rs ^= rs << 5; rs >>>= 0; return rs / 4294967296; };
  const heroE = () => B.fighters.find((f) => f.id === 'jester'), foesE = () => B.fighters.filter((f) => f.side === 'foe');
  function begin(n) {
    count = n || count; fights++;
    const R = JSON.parse(JSON.stringify(E.RULES)); R.encounters = [{ id: 'pilot', label: count > 1 ? count + ' wisps' : 'A wisp', foes: Array(count).fill('normal') }];
    B = E.newBattle('pilot', { rules: R, seed: 977 + fights * 7919 });
    B.fighters = B.fighters.filter((f) => f.side === 'foe' || f.id === 'jester');            // the pilot's party is the Jester alone
    B.log.length = 0; B.events.length = 0;
    const fe = foesE(); shown.foes = wisps.map((w, i) => (fe[i] ? { e: fe[i], up: true, life: fe[i].hp, max: fe[i].max, fate: 0 } : null));
    wisps.forEach((w, i) => { const on = !!fe[i]; w.m.root.visible = on; w.m.fx.visible = on; w.patch.visible = on; w.fade = 1; w.fadeTo = 1; w.dying = false; if (on) { w.m.setFade(1); w.m.reset(); w.m.play('appear', true); } });
    const h = heroE(); shown.hp = h.hp; shown.mp = h.mp; tgt = 0; act = null; her.face = 0; her.aim = null; hitTurn = 0; wait = 1.2; phase = 'wait';
    J.reset(); J.game.fates = wisps.map(() => null); J.game.others = []; J.game.friends = []; J.game.catches = 0; J.charge = 0;
    elBanner.hidden = true; say(R.encounters[0].label + '. ' + num(h.max) + ' HP against ' + num(fe[0].max) + ' Life' + (count > 1 ? ' each' : '') + '.'); paint();
  }
  function say(t) { elLog.textContent = t; }
  function sync() { const h = heroE(); shown.hp = h.hp; shown.mp = h.mp; for (const f of shown.foes) if (f) { f.life = f.e.hp; f.fate = f.e.fate; } }
  function next() {
    const r = E.step(B);
    if (r.over) return finish();
    if (r.foe) {
      const i = foesE().indexOf(r.foe), w = wisps[i], ev = B.events.splice(0); B.log.length = 0;
      J.anchor('chest', _v); w.m.state = { target: { x: _v.x, y: _v.y, z: _v.z } }; w.m.play('flicker', true);
      const A = w.m.ACTIONS.flicker; act = { kind: 'foe', w, i, ev, t: 0, hitAt: A.hits[0] * A.dur, dur: A.dur, done: false }; phase = 'act'; say(r.foe.name + ' ' + WORDS.foeTurn + '.');
    } else {
      E.heroTurnStart(B, r.hero); B.events.length = 0; B.log.length = 0; if (B.over) return finish();
      J.game.catches = 0; phase = 'menu'; say(WORDS.yourTurn + '.');
      if (!shown.foes[tgt] || !shown.foes[tgt].up) tgt = shown.foes.findIndex((f) => f && f.up);
    }
    paint();
  }
  function choose(id) {
    if (phase !== 'menu') return false;
    const h = heroE(), mv = E.heroMoves(B, h).find((m) => m.id === id); if (!mv || !mv.ok) return false;
    let f = shown.foes[tgt] && shown.foes[tgt].up ? shown.foes[tgt] : shown.foes.find((x) => x && x.up);
    if (id === 'j_seal') { const s = shown.foes.filter((x) => x && x.up && E.sealed(x.e)); f = s.indexOf(f) >= 0 ? f : s[0]; }
    const others = shown.foes.filter((x) => x && x.up && x !== f);
    E.doHero(B, h, id, mv.target === 'none' ? null : f.e.id); const ev = B.events.splice(0), words = B.log.map((l) => l.text); B.log.length = 0;
    const anim = id === 'j_seal' && B.curtain ? 'g_curtain' : ANIM[id], w = f ? wisps[shown.foes.indexOf(f)] : null;
    if (AIMED[anim] && w) { const dx = w.x - her.x, dz = w.z - her.z; her.aim = Math.atan2(-dz, dx); J.targetDist = Math.hypot(dx, dz); } else { her.aim = null; J.targetDist = 0; }
    J.game.catches = 0;
    J.game.others = (anim === 'g_seal' || anim === 'g_curtain') ? others.map((o) => { const ow = wisps[shown.foes.indexOf(o)]; return { x: ow.x, z: ow.z, h: 0.95 }; }) : [];
    J.game.friends = [];
    act = { kind: 'hero', id, anim, f, w, others, ev, t: 0, hitSeen: J.state.hitN || 0, shownDmg: false }; phase = 'act'; J.play(anim, true); say(words[0] || mv.label); paint();
    return true;
  }
  function hurtFoe(f, cls) {                              // show what the engine did to a foe, and let the wisp answer
    if (!f || !f.up) return; const w = wisps[shown.foes.indexOf(f)], was = f.life; f.life = f.e.hp; f.fate = f.e.fate;
    if (was - f.life > 0.5) float(w.m.anchor('top', _v), '−' + num(was - f.life), cls || 'dmg');
    if (f.life <= 0 && !w.dying) { w.dying = true; w.m.play('die', true); } else if (!w.dying) w.m.play('hurt', true);
    shake = Math.max(shake, 0.35);
  }
  function onTag(tag) {
    const a = act, f = a.f;
    if (a.anim === 'taunt_heal') { if (tag === 'heal') { const h = heroE(), was = shown.hp; shown.hp = h.hp; shown.mp = h.mp; float(J.anchor('head', _v), shown.hp > was + 0.5 ? '+' + num(shown.hp - was) : 'Full', 'heal'); J.game.catches = B.taunt; } return; }
    if (a.anim === 'g_rebuke') { hurtFoe(f); return; }
    if (a.anim === 'taunt_attack') { if (tag === 'burst') { J.game.catches = B.taunt; hurtFoe(f); } return; }
    const all = a.anim === 'g_curtain' ? [f].concat(a.others) : [f];
    if (tag === 'land') float(wisps[shown.foes.indexOf(f)].m.anchor('top', _v), WORDS.sealed, 'fate');
    else if (tag === 'zero') { f.life = 0; f.fate = 0; float(wisps[shown.foes.indexOf(f)].m.anchor('chest', _v), WORDS.ended, 'end'); shake = Math.max(shake, 0.6); }
    else if (tag === 'doom') { for (const o of all) if (o.up) wisps[shown.foes.indexOf(o)].fadeTo = 0; }
    else if (tag === 'gone') { for (const o of all) if (o.up) { const w = wisps[shown.foes.indexOf(o)]; o.up = false; o.life = 0; w.m.root.visible = w.m.fx.visible = false; w.patch.visible = false; } }
    else if (tag === 'splash') { for (const o of a.others) hurtFoe(o, 'end'); }
  }
  function finish() {
    sync(); phase = 'over'; act = null; her.aim = null;
    for (const f of shown.foes) if (f && f.up && f.e.hp <= 0) f.up = false;
    const won = B.over === 'won', xp = won ? foesE().reduce((s, f) => s + XP[f.tier], 0) : 0;
    elBanner.hidden = false; elBanner.innerHTML = '<b>' + (won ? WORDS.won : WORDS.lost) + '</b>' + (won ? '<span>+' + xp + ' ' + WORDS.xp + ' · ' + B.heroTurns + ' turn' + (B.heroTurns > 1 ? 's' : '') + '</span>' : '') + '<button type="button">' + WORDS.again + '</button>';
    elBanner.querySelector('button').addEventListener('click', () => begin()); say(won ? 'Victory.' : 'Defeat.'); paint();
    if (H.onOver) H.onOver(B.over);
  }
  // ---------- what is on screen ----------
  function paint() {
    if (!B) return; const h = heroE();
    $('.nm').textContent = 'Jester'; $('.hpn').textContent = num(shown.hp) + ' / ' + num(h.max) + ' HP'; $('.hp i').style.width = (100 * shown.hp / h.max).toFixed(1) + '%'; $('.mpn').textContent = shown.mp + ' / ' + h.mpMax + ' MP' + (J && J.game.catches ? ' · catching ' + J.game.catches : '');
    elBar.innerHTML = ''; if (phase !== 'over') for (const b of E.bar(B)) { const c = document.createElement('span'); c.className = 'chip ' + b.u.side; c.textContent = b.u.name; elBar.appendChild(c); }
    if (elBar.firstChild) elBar.firstChild.classList.add('now');
    elMoves.innerHTML = ''; elHelp.textContent = '';
    if (phase === 'menu') for (const m of E.heroMoves(B, h)) { const b = document.createElement('button'); b.type = 'button'; b.textContent = m.label + (m.mp ? ' · ' + m.mp + ' MP' : ''); b.disabled = !m.ok; b.title = m.ok ? m.help : m.why; b.dataset.id = m.id;
      b.addEventListener('click', () => choose(m.id)); const tip = () => { elHelp.textContent = m.ok ? m.help : m.why + '. ' + m.help; }; b.addEventListener('pointerenter', tip); b.addEventListener('focus', tip); elMoves.appendChild(b); }
    ui.classList.toggle('picking', phase === 'menu' && shown.foes.filter((f) => f && f.up).length > 1);
  }
  function bars() {
    wisps.forEach((w, i) => { const f = shown.foes[i], d = foeBars[i], on = !!(f && f.up && phase !== 'off'); d.hidden = !on; if (!on) { J.game.fates[i] = null; return; }
      const p = stage.toScreen(_v.set(w.m.root.position.x, 1.18, w.m.root.position.z)); d.style.left = p[0].toFixed(0) + 'px'; d.style.top = p[1].toFixed(0) + 'px';
      const Lk = f.life / f.max, Fk = Math.min(Lk, f.fate / f.max), sealedNow = f.life > 0 && f.fate >= f.life; d.classList.toggle('sealed', sealedNow); d.classList.toggle('tgt', phase === 'menu' && i === tgt);
      d.firstChild.textContent = f.e.name + (sealedNow ? ' · ' + WORDS.sealed : ''); d.lastChild.children[0].style.width = (100 * Lk).toFixed(1) + '%'; d.lastChild.children[1].style.width = (100 * Fk).toFixed(1) + '%';
      // what the model is told: Fate on each foe, shown as dust falling round it
      const m = w.mark || (w.mark = {}); m.x = w.m.root.position.x; m.y = 0; m.z = w.m.root.position.z; m.r = 0.34; m.h = 0.95; m.k = f.life > 0 ? Math.min(1, f.fate / f.life) : 0; m.sealed = sealedNow; J.game.fates[i] = f.life > 0 ? m : null; });
  }
  const api = {
    S, group, her, wisps, get phase() { return phase; }, get battle() { return B; }, shown, choose, begin,
    setAuto(style) { auto = style || null; },
    key(k) { if (phase !== 'menu') return false; if (k === 'Tab') { const up = shown.foes.map((f, i) => (f && f.up ? i : -1)).filter((i) => i >= 0); if (up.length) { tgt = up[(up.indexOf(tgt) + 1) % up.length]; paint(); } return true; } const b = elMoves.children[+k - 1]; if (b && !b.disabled) { choose(b.dataset.id); return true; } return false; },
    enter(j, n) {
      J = j; group.visible = true; herPatch.visible = true; ui.hidden = false; panel.hidden = false; stage.setScene(S); win = null;
      J.root.position.set(her.x, 0, her.z); J.root.rotation.y = 0; J.arena = 9; stage.follow(her.x, her.z); herPatch.position.set(her.x, 0.006, her.z);
      for (const l of stage.near) l.intensity = 0; stage.near[1].color.setHex(0x9fe8b0); stage.near[1].distance = 5;
      begin(n);
    },
    leave() { group.visible = false; herPatch.visible = false; ui.hidden = true; panel.hidden = true; phase = 'off'; for (const w of wisps) w.patch.visible = false; for (const l of stage.near) l.intensity = 0; if (J) { J.stop(); J.game.fates = []; J.game.catches = 0; } stage.dark = stage.dim = 0; stage.shakeX = stage.shakeY = 0; },
    step(dt, t) {
      time = t;
      if (phase === 'wait') { wait -= dt; if (wait <= 0) next(); }
      else if (phase === 'menu' && auto) { wait -= dt; if (wait <= 0) { let c = E.choose(B, heroE(), auto);
        // the engine's brains expect her three friends to finish the small foes. Alone, she has to end each sealed foe herself.
        const sl = shown.foes.find((f) => f && f.up && E.sealed(f.e)); if (sl && c.move !== 'j_seal') c = { move: 'j_seal', target: sl.e.id }; const i = shown.foes.findIndex((f) => f && f.e.id === (Array.isArray(c.target) ? c.target[0] : c.target)); if (i >= 0) tgt = i; choose(c.move); wait = 0.6; } }
      else if (phase === 'act' && act) {
        const a = act; a.t += dt;
        if (a.kind === 'foe') {
          a.w.m.root.translateZ(a.w.m.dash * dt);
          if (!a.done && a.t >= a.hitAt) { a.done = true; const h = heroE(), was = shown.hp; shown.hp = h.hp; if (was - shown.hp > 0.5) { float(J.anchor('head', _v), '−' + num(was - shown.hp), 'dmg'); if (h.hp > 0) J.play(HITS[hitTurn++ % HITS.length], true); shake = Math.max(shake, 0.5); }
            const f = shown.foes[a.i], wasF = f.fate; f.fate = f.e.fate; if (f.fate > wasF) float(a.w.m.anchor('top', _v), WORDS.fate + ' +' + num(f.fate - wasF), 'fate'); J.game.catches = B.taunt; paint(); }
          if (a.t > a.dur + 0.2 && !a.w.m.busy && (!J.action || a.t > a.dur + 3.6)) { a.w.m.root.position.set(a.w.x, 0, a.w.z); act = null; if (B.over) finish(); else { phase = 'wait'; wait = 0.25; } }
        } else {
          const hn = J.state.hitN || 0; if (hn !== a.hitSeen) { a.hitSeen = hn; if (J.state.hitName === a.anim) { onTag(J.state.hitTag || ''); paint(); } }
          if (a.t > 0.3 && !J.action && !J.pending) { for (const f of shown.foes) if (f && f.up && f.e.hp <= 0 && f.life > 0) hurtFoe(f); sync(); her.aim = null; J.targetDist = 0; act = null; paint(); phase = 'wait'; wait = B.over ? 0.9 : 0.35; }
        }
      }
      // wisps: bob, face her, fade when a seal takes them, go when their last light is out
      for (const w of wisps) { if (!w.m.root.visible) continue; w.m.root.rotation.y = Math.atan2(her.x - w.x, her.z - w.z);
        if (w.fade !== w.fadeTo) { w.fade += Math.sign(w.fadeTo - w.fade) * Math.min(Math.abs(w.fadeTo - w.fade), dt * 0.9); w.m.setFade(w.fade); }
        w.m.animate(0, 0, t, dt); w.patch.position.set(w.m.root.position.x, 0.006, w.m.root.position.z); w.patch.material.opacity = 0.7 * w.fade;
        const f = shown.foes[w.i]; if (w.dying && !w.m.busy) { if (f) f.up = false; w.m.root.visible = w.m.fx.visible = false; w.patch.visible = false; } }
      // she turns her casting side to her target, then back to the audience
      { const to = J.action && AIMED[J.action] && her.aim != null ? her.aim : 0; let df = to - her.face; df = Math.atan2(Math.sin(df), Math.cos(df)); her.face += df * Math.min(1, dt * 8); J.root.rotation.y = her.face + J.spin; }
      // the camera never moves: a closer shot is a smaller window of the same picture
      const FW = S.frame[0], FH = S.frame[1], asp = H.aspect(); let ww = FW, wh = ww / asp; if (wh > FH) { wh = FH; ww = wh * asp; }
      const feet = stage.toFrame(_w.set(0, 0, C[1] + 2.2))[1] + wh * 0.07;                      // the wide shot keeps everyone's feet in the picture first, and Auros whole when the screen is tall enough
      let wx = (FW - ww) / 2, wy = Math.max(Math.min(S.wideTop, FH - wh), feet - wh);
      const closeOn = H.closeOn() && phase === 'act' && act && !(act.kind === 'hero' && act.anim === 'g_curtain' && J.time > 5.2);
      if (closeOn) { const w = act.w || wisps[tgt], pts = [[her.x - 1.5, 0, her.z], [her.x, 2.5, her.z], [her.x + 1.2, 0, her.z + 1]]; if (w && act.anim !== 'taunt_heal') pts.push([w.x + 1.1, 0, w.z], [w.x, 1.7, w.z]);
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) { const q = stage.toFrame(_w.set(p[0], p[1], p[2])); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
        let cw = Math.max((x1 - x0) * 1.25, (y1 - y0) * 1.5 * asp, FW * 0.5); cw = Math.min(cw, ww); const ch = cw / asp; ww = cw; wh = ch; wx = (x0 + x1) / 2 - cw / 2; wy = y1 + ch * 0.14 - ch; }
      wx = Math.max(0, Math.min(FW - ww, wx)); wy = Math.max(0, Math.min(FH - wh, wy));
      if (!win) win = { x: wx, y: wy, w: ww, h: wh }; else { const k = Math.min(1, dt * 2.4); win.x += (wx - win.x) * k; win.y += (wy - win.y) * k; win.w += (ww - win.w) * k; win.h = win.w / asp; if (win.h > FH) { win.h = FH; win.w = FH * asp; } }
      stage.setWindow(win.x, win.y, win.w, win.h);
      // the place answers her spells: it darkens, the picture shakes, and one shared light carries the spell
      const dk = Math.max(J.dark || 0, 0.55 * (J.dim || 0)); stage.dark = 1 - Math.pow(1 - 0.97 * dk, 2); stage.dim = J.dim || 0;
      shake = Math.max(shake * Math.exp(-dt * 5), 0.7 * (J.shake || 0)); const sp = 16 * shake * win.w / Math.max(1, H.width()); stage.shakeX = (rnd() - 0.5) * sp; stage.shakeY = (rnd() - 0.5) * sp;
      const sl = J.spellLight, n0 = stage.near[0]; n0.position.copy(sl.position); n0.color.copy(sl.color); n0.intensity = sl.intensity; n0.distance = 3.2;
      { const w = wisps.find((x) => x.m.root.visible), n1 = stage.near[1]; if (w) { w.m.anchor('chest', n1.position); n1.intensity = 0.5 * w.fade; } else n1.intensity = 0; }
      J.animate(0, 0, t, dt, 0);
      bars();
    },
  };
  return api;
}
