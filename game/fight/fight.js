// fight.js: one fight on a painted backdrop, the party of four against any line-up of foes.
// The rules are the approved combat engine (sim/blob-battle-engine.js), used unchanged: this file shows what the engine decides, with the
// real models, and asks the player for each move. Nothing is timed: on a witch's turn the game waits.
// The party stands on the left and the foes on the right. The Jester, the Fox and the Ranger face the audience and cast to their own
// left, at the foes; Io turns to face whoever she casts at. Nobody is ever mirrored.
// It grew out of the pilot's src/fight.js (the Jester alone against wisps), which is left as it is.
function makeMFFight(stage, H) {
  'use strict';
  const E = window.MF_ENGINE, AC = window.MF_ACTORS, FO = window.MF_FOES, ui = H.ui, panel = H.panel;
  const group = new THREE.Group(); group.visible = false; stage.cast.add(group);
  const WORDS = H.words || { sealed: 'sealed', ended: 'Ended', fate: 'Fate', won: 'The show is over', lost: 'The party has fainted', fled: 'The party slipped away', xp: 'XP', turn: 'turn', turns: 'turns',
    yourTurn: 'to move', pickMove: 'Pick a move.', cast: 'Cast', everyFoe: 'every foe', acts: 'acts', up: 'Up', full: 'Full', miss: 'Nobody is hurt', done: 'Carry on', deity: 'The deity arrives', bloom: 'The bloom opens' };
  const XP = { normal: 10, difficult: 40, boss: 400 }, XP_SLOPE = 1.2;                       // game/plan/sim/plan.js
  const ORDER = ['jester', 'ranger', 'fox', 'io'];
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), num = (n) => Math.round(n).toLocaleString('en-US');
  let rs = 977; const rnd = () => { rs ^= rs << 13; rs >>>= 0; rs ^= rs >>> 17; rs ^= rs << 5; rs >>>= 0; return rs / 4294967296; };

  // ---------- the cast ----------
  const party = {}, pool = {}; let foes = [], S = null, C = [0, 0];
  function hero(id) {                                      // a witch is built the first time she is needed, and kept
    if (party[id]) return party[id];
    const a = AC.make(id, H.weight ? H.weight() : 'lightest'); group.add(a.root); if (a.fx) group.add(a.fx);
    const P = { id, a, patch: stage.footPatch(0.42), home: { x: 0, z: 0 }, x: 0, z: 0, e: null, shown: { hp: 0, mp: 0 }, row: null };
    party[id] = P; return P;
  }
  function foeModel(kind) {                                // foes too: a pool of each kind, reused from fight to fight
    const list = pool[kind] || (pool[kind] = []); let m = list.find((x) => !x.inUse);
    if (!m) { m = FO.make(kind, H.foeWeight ? H.foeWeight() : 'light', { seed: list.length + 1 }); list.push(m); group.add(m.root, m.fx); m.patch = stage.footPatch(m.K.patch); }
    m.inUse = true; return m;
  }

  // ---------- the words and bars over the picture ----------
  // The move-picking screen (reworked November 14 after two Opus 5.5 brainstorms; Chris: "the UI for selecting moves could be better").
  // Pick a move, then who, then Cast: the first tap never acts. The help line is always there. The Cast bar says the move and the target.
  ui.innerHTML = '<div class="turnbar" aria-label="The next turns"></div><div class="title" hidden></div><div class="banner" hidden></div><div class="floats"></div><div class="bars"></div><p class="log" aria-live="polite"></p>';
  panel.innerHTML = '<div class="party"></div><p class="help"></p><div class="moves"></div><div class="castrow" hidden><button type="button" class="back" hidden></button><button type="button" class="cast" disabled></button></div>';
  const $ = (q) => ui.querySelector(q) || panel.querySelector(q), elBar = $('.turnbar'), elBanner = $('.banner'), elTitle = $('.title'), elFloats = $('.floats'), elBars = $('.bars'), elMoves = $('.moves'), elHelp = $('.help'), elLog = $('.log'), elParty = $('.party'), elCast = $('.cast'), elBack = $('.back'), elCastRow = $('.castrow');
  elBack.textContent = 'Back'; elBack.addEventListener('click', () => { sel = null; paint(); }); elCast.addEventListener('click', () => cast());
  // numbers over the picture stay on the one they belong to, even when the camera cuts
  const floats = [];
  function float(v, text, cls) { const d = document.createElement('span'); d.className = 'float ' + (cls || ''); d.textContent = text; elFloats.appendChild(d); const o = { d, pos: v.clone(), born: time }; floats.push(o); place(o); setTimeout(() => { d.remove(); const k = floats.indexOf(o); if (k >= 0) floats.splice(k, 1); }, 1500); }
  function place(o) { const p = stage.toScreen(o.pos); o.d.style.display = p[0] < -999 ? 'none' : ''; o.d.style.left = p[0].toFixed(0) + 'px'; o.d.style.top = p[1].toFixed(0) + 'px'; }
  // a blow that lands: a burst of light where it lands, the picture held for a beat, and the bar of whoever took it flashes
  const burstTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'), r = g.createRadialGradient(48, 48, 2, 48, 48, 46); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.75)'); r.addColorStop(0.55, 'rgba(255,255,255,0.18)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 96, 96);
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.2; g.beginPath(); g.moveTo(48 + 14 * Math.cos(a), 48 + 14 * Math.sin(a)); g.lineTo(48 + 44 * Math.cos(a), 48 + 44 * Math.sin(a)); g.stroke(); } return new THREE.CanvasTexture(c); })();
  const bursts = []; let hitStop = 0;
  function burst(v, colour, size) { let b = bursts.find((x) => !x.on); if (!b) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: burstTex, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); m.renderOrder = 60; group.add(m); b = { m, on: false, t: 0, size: 1 }; bursts.push(b); }
    b.on = true; b.t = 0; b.size = size; b.m.material.color.setHex(colour); b.m.material.rotation = rnd() * 6.28; b.m.position.copy(v); b.m.visible = true; }
  const flash = (el) => { if (!el) return; el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); };
  function title(text) { elTitle.textContent = text; elTitle.hidden = false; clearTimeout(title.t); title.t = setTimeout(() => { elTitle.hidden = true; }, 2200); }
  const say = (t) => { elLog.textContent = t; };

  // ---------- the fight ----------
  const GEO = { pcx: 0, pcz: 0, fcx: 1, fcz: 0, ux: 1, uz: 0, D: 1, tall: 1 };
  let intro = 0;      // seconds left of a fight's opening
  let B = null, phase = 'off', act = null, cur = null, selFoe = 0, selHero = 'jester', time = 0, shake = 0, win = null, auto = null, wait = 0, O = null, onDone = null, sel = null;
  const J = () => party.jester && party.jester.a.m;
  const heroesE = () => B.fighters.filter((f) => f.side === 'hero'), foesE = () => B.fighters.filter((f) => f.side === 'foe');
  const upFoes = () => foes.filter((f) => f.up), foeOf = (id) => foes.find((f) => f.e.id === id);

  function begin(opts) {
    O = opts; S = opts.place; C = S.centre; stage.setScene(S); win = null; rs = 977;
    // the shadow plane and the key light cover the whole fight, not one witch
    const sc = stage.key.shadow.camera; sc.left = -11; sc.right = 11; sc.top = 8; sc.bottom = -5; sc.near = -20; sc.far = 30; sc.updateProjectionMatrix(); stage.follow(C[0] + 1.2, C[1]); stage.catcher.scale.set(3.4, 3.4, 1);
    for (const l of stage.near) l.intensity = 0;
    // the engine's own rules, with this fight's line-up and the foes' names added; no number is touched
    const R = JSON.parse(JSON.stringify(E.RULES)); for (const t in FO.byTier) R.foes[t].name = FO.KINDS[FO.byTier[t]].name;
    const tiers = opts.foes.map((k) => FO.KINDS[k].tier); R.encounters = [{ id: 'fight', label: opts.label || 'A fight', foes: tiers, noJester: !!opts.noJester }];
    B = E.newBattle('fight', { rules: R, seed: opts.seed || (1 + Math.floor(Math.random() * 1e9)), level: opts.gap || 0 }); B.log.length = 0; B.events.length = 0;
    // the party: where each stands, and what she brings from the last fight
    for (const id in party) { const P = party[id]; P.e = null; P.a.root.visible = false; if (P.a.fx) P.a.fx.visible = false; P.patch.visible = false; }
    for (const e of heroesE()) { const P = hero(e.id), p = S.party[e.id], st = opts.party && opts.party[e.id]; P.e = e; P.home.x = P.x = C[0] + p[0]; P.home.z = P.z = C[1] + p[1];
      if (st) { if (st.hp != null) e.hp = Math.max(0, Math.min(e.max, st.hp)); if (st.mp != null) e.mp = Math.max(0, Math.min(e.mpMax, st.mp)); }
      P.a.reset(); P.a.root.visible = true; if (P.a.fx) P.a.fx.visible = true; P.patch.visible = true; P.a.root.position.set(P.x, 0, P.z); P.shown.hp = e.hp; P.shown.mp = e.mp; if (e.hp <= 0) P.a.down(true); }
    if (!heroesE().some((e) => e.hp > 0)) heroesE()[0].hp = 1;
    // the foes: each kind takes the first free place of its own size
    for (const k in pool) for (const m of pool[k]) { m.inUse = false; m.root.visible = m.fx.visible = false; m.patch.visible = false; }
    const free = { small: S.spots.small.slice(), mid: (opts.foes.indexOf('great') >= 0 ? S.spots.midBig : S.spots.mid).slice(), big: S.spots.big.slice() }, size = { wisp: 'small', wraith: 'mid', great: 'big' };
    elBars.innerHTML = '';
    foes = foesE().map((e, i) => { const kind = opts.foes[i], m = foeModel(kind), sp = free[size[kind]].shift() || free.small.shift() || [4 + i, 0], x = C[0] + sp[0], z = C[1] + sp[1];
      const f = { i, e, kind, m, K: m.K, x, z, up: true, vis: true, shown: { life: e.hp, fate: 0, max: e.max }, fade: 1, fadeTo: 1, dying: false, mark: {}, bar: null };
      m.root.position.set(x, 0, z); m.root.visible = m.fx.visible = true; m.patch.visible = true; m.setFade(1); m.reset(); m.play('appear', true);
      const d = document.createElement('button'); d.type = 'button'; d.className = 'foebar ' + kind; d.innerHTML = '<span></span><div><i class="lost"></i><i class="life"></i><i class="fate"></i></div>'; f.elLost = d.lastChild.children[0]; f.elLife = d.lastChild.children[1]; f.elFate = d.lastChild.children[2]; d.addEventListener('click', () => tapFoe(f)); elBars.appendChild(d); f.bar = d; return f; });
    // the party looks at the foes. GEO: the middle of each side, and the way from one to the other
    { const hs = heroesE().map((e) => party[e.id]), n = hs.length, m = foes.length, G = GEO; G.pcx = hs.reduce((q, P) => q + P.x, 0) / n; G.pcz = hs.reduce((q, P) => q + P.z, 0) / n; G.fcx = foes.reduce((q, f) => q + f.x, 0) / m; G.fcz = foes.reduce((q, f) => q + f.z, 0) / m;
      G.D = Math.hypot(G.fcx - G.pcx, G.fcz - G.pcz) || 1; G.ux = (G.fcx - G.pcx) / G.D; G.uz = (G.fcz - G.pcz) / G.D; G.tall = foes.reduce((q, f) => Math.max(q, f.K.h), 0);
      for (const P of hs) { P.a.rest = Math.atan2(G.fcx - P.x, G.fcz - P.z); P.a.face = P.a.rest; } }
    if (J()) { J().arena = 9; J().game.fates = foes.map(() => null); }
    selFoe = 0; selHero = heroesE()[0].id; act = null; cur = null; sel = null; shake = 0; intro = 2.2; lastShot = null; wait = CAMNOW() === 'directed' || CAMNOW() === 'auto' ? 2.5 : 1.4; phase = 'wait'; elBanner.hidden = true; elTitle.hidden = true;
    partyRows(); say((opts.label || 'A fight') + '.'); paint();
  }
  function partyRows() {
    elParty.innerHTML = '';
    for (const id of ORDER) { const P = party[id]; if (!P || !P.e) continue; const d = document.createElement('button'); d.type = 'button'; d.className = 'who'; d.innerHTML = '<b></b><div class="hp"><i class="lost"></i><i class="life"></i></div><span class="hpn"></span><div class="mp"><i></i></div><span class="mpn"></span>'; d.addEventListener('click', () => tapHero(P)); elParty.appendChild(d); P.row = d; }
  }

  // ---------- showing what the engine did ----------
  function killFoe(f) { if (f.dying || !f.up) return; f.dying = true; f.m.play('die', true); }
  function showFoeLife(f, life, cls) { const was = f.shown.life; f.shown.life = Math.max(0, life); const lost = was - f.shown.life; if (lost > 0.5) { const big = lost > 0.3 * f.shown.max || f.shown.life <= 0.5;
      float(f.m.anchor(f.K.top, _v), '\u2212' + num(lost), (cls || 'dmg') + (big ? ' big' : '')); burst(f.m.anchor('chest', _v), 0xfff1c4, (big ? 1.5 : 1.05) * (0.9 + 0.5 * f.K.h)); hitStop = Math.max(hitStop, big ? 0.13 : 0.08); flash(f.bar); shake = Math.max(shake, big ? 0.6 : 0.4);
      if (f.shown.life <= 0.5) killFoe(f); else if (!f.dying) f.m.play('hurt', true); } }
  function showHeroHp(P, hp) { const was = P.shown.hp, a = P.a; P.shown.hp = Math.max(0, Math.min(P.e.max, hp)); const lost = was - P.shown.hp;
    if (lost > 0.5) { const big = lost > 0.2 * P.e.max; float(a.anchor('head', _v), '\u2212' + num(lost), 'dmg hero' + (big ? ' big' : '')); burst(a.anchor('chest', _v), 0xff8a6a, big ? 2.0 : 1.4); hitStop = Math.max(hitStop, big ? 0.14 : 0.09); flash(P.row); shake = Math.max(shake, big ? 0.75 : 0.5); if (P.shown.hp <= 0.5) a.down(true); else a.hit(big); }
    else if (-lost > 0.5) { if (was <= 0.5) a.down(false); float(a.anchor('head', _v), '+' + num(-lost), 'heal'); burst(a.anchor('chest', _v), 0x8dffb0, 1.5); flash(P.row); } }
  function showEvent(ev) {
    if (ev.type === 'dmg') { const f = foeOf(ev.id); if (f && f.up) showFoeLife(f, f.shown.life - ev.n); }
    else if (ev.type === 'hurt') { const P = party[ev.id]; if (P) showHeroHp(P, P.shown.hp - ev.n); }
    else if (ev.type === 'heal') { const P = party[ev.id]; if (P) showHeroHp(P, P.shown.hp + ev.n); }
    else if (ev.type === 'banner') title(ev.text);
  }
  function showSome(a, n) { for (let i = 0; i < n && a.ev.length; i++) showEvent(a.ev.shift()); syncFates(); paint(); }
  function syncFates() { for (const f of foes) { if (!f.up) continue; const wasF = f.shown.fate; f.shown.fate = f.e.fate; if (f.shown.fate > wasF + 0.5 && f.shown.life > 0.5) float(f.m.anchor('chest', _v), WORDS.fate + ' +' + num(f.shown.fate - wasF), 'fate'); } if (J()) J().game.catches = B.taunt; }
  function syncAll() {                                     // whatever has not been shown yet is shown now, so the picture never disagrees with the engine
    if (act) { while (act.ev.length) showEvent(act.ev.shift()); }
    for (const f of foes) { if (!f.up) continue; if (Math.abs(f.shown.life - f.e.hp) > 0.5) showFoeLife(f, f.e.hp, 'end'); f.shown.life = f.e.hp; if (f.e.hp <= 0) killFoe(f); }
    for (const e of heroesE()) { const P = party[e.id]; if (Math.abs(P.shown.hp - e.hp) > 0.5) showHeroHp(P, e.hp); P.shown.hp = e.hp; P.shown.mp = e.mp; if (e.hp > 0 && P.a.isDown) P.a.down(false); if (e.hp <= 0 && !P.a.isDown) P.a.down(true); }
    syncFates(); paint();
  }

  // ---------- whose turn ----------
  function next() {
    const nb = E.bar(B, 1)[0], r = E.step(B);
    if (r.over) return finish();
    if (r.foe) return foeActs(foeOf(r.foe.id), nb && nb.u === r.foe ? nb.move : 'blow');
    const h = r.hero, P = party[h.id], hadDeity = h.id === 'io' && B.deityPending, hadBloom = h.id === 'io' && B.bloom > 0;
    E.heroTurnStart(B, h); const ev = B.events.splice(0), words = B.log.map((l) => l.text); B.log.length = 0;
    if (B.over === 'fled') return finish();
    cur = P; selHero = h.id;
    if (hadDeity) { const big = upFoes().sort((a, b) => b.shown.max - a.shown.max)[0]; say(words[0] || WORDS.deity); return heroPlays(P, 'i_deity_arrives', big ? { foe: big } : null, ev, true); }
    if (ev.length) { act = { ev }; syncAll(); act = null; if (hadBloom) say(words[words.length - 1] || WORDS.bloom); }
    if (B.over) { wait = 0.9; phase = 'ending'; return; }
    toMenu();
  }
  function toMenu() {
    phase = 'menu'; sel = null; wait = 0.7; say(cur.a.name + ' ' + WORDS.yourTurn + '.');
    if (!foes[selFoe] || !foes[selFoe].up) { const k = foes.findIndex((f) => f.up); if (k >= 0) selFoe = k; }
    paint();
  }

  // ---------- a witch's move ----------
  function choose(id, target) {
    if (phase !== 'menu' || !cur) return false;
    const h = cur.e, mv = E.heroMoves(B, h).find((m) => m.id === id); if (!mv || !mv.ok) return false;
    let tf = null, th = null, tid = null;
    if (mv.target === 'foe' || mv.target === 'foe2' || mv.target === 'sealed' || mv.target === 'marked') {
      const ok = E.targetsFor(B, h, id).map((e) => foeOf(e.id)).filter((f) => f && f.up); if (!ok.length) return false;
      const first = Array.isArray(target) ? target[0] : target;
      tf = (first && ok.find((f) => f.e.id === first)) || (ok.indexOf(foes[selFoe]) >= 0 ? foes[selFoe] : ok[0]); tid = Array.isArray(target) && target[0] === tf.e.id ? target : tf.e.id;
    } else if (mv.target === 'hero' || mv.target === 'fallen') {
      const ok = E.targetsFor(B, h, id); if (!ok.length) return false;
      const e = (target && ok.find((x) => x.id === target)) || ok.find((x) => x.id === selHero && mv.target === 'fallen') || (mv.target === 'hero' ? ok.slice().sort((a, b) => a.hp / a.max - b.hp / b.max)[0] : ok[0]); th = party[e.id]; tid = e.id;
    }
    const others = upFoes().filter((f) => f !== tf), fallen = heroesE().filter((e) => e.hp <= 0).map((e) => party[e.id]);
    E.doHero(B, h, id, tid); const ev = B.events.splice(0), words = B.log.map((l) => l.text); B.log.length = 0;
    say(words[0] || mv.label);
    heroPlays(cur, id === 'j_seal' && B.curtain ? 'j_curtain' : id, tf ? { foe: tf } : th ? { hero: th } : null, ev, false, { others, fallen });
    return true;
  }
  function heroPlays(P, id, target, ev, thenMenu, X) {
    const mv = id === 'j_curtain' ? { anim: 'g_curtain', aim: 'left' } : AC.MOVES[id], a = P.a, m = a.m;
    const T = target ? (target.foe ? { x: target.foe.x, z: target.foe.z } : { x: target.hero.x, z: target.hero.z }) : null, self = target && target.hero === P;
    act = { kind: 'hero', P, id, mv, anim: mv.anim, ev, t: 0, tf: target && target.foe, th: target && target.hero, T, thenMenu, others: (X && X.others) || [], stage: 'play', hitK: 0, hitsAt: [], tags: P.id === 'jester', hitSeen: 0, from: null, to: null, g: 0 };
    if (T && mv.near && !self) {                           // she goes to her target first: her spell is built to land that far in front of her
      const dx = P.home.x - T.x, dz = P.home.z - T.z, L = Math.hypot(dx, dz) || 1, r = target.foe ? mv.near + target.foe.K.r * (mv.aim === 'front' ? 0.6 : 0.3) : mv.near;
      if (L > r + 0.3) { act.from = { x: P.x, z: P.z }; act.to = { x: T.x + dx / L * r, z: T.z + dz / L * r }; act.stage = 'in'; act.gd = Math.max(0.35, Math.min(0.8, (L - r) / 9)); }
    }
    if (P.id === 'jester') { m.game.catches = 0; m.game.friends = (X && X.fallen ? X.fallen : []).map((p) => ({ x: p.x, z: p.z }));
      m.game.others = (mv.anim === 'g_seal' || mv.anim === 'g_curtain') ? act.others.map((o) => ({ x: o.x, z: o.z, h: o.K.h })) : []; }
    phase = 'act'; if (act.stage === 'play') startPlay(); paint();
  }
  function startPlay() {
    const a = act, P = a.P, A = P.a, m = A.m, T = a.T;
    if (T && a.mv.aim && a.th !== P) { const dx = T.x - P.x, dz = T.z - P.z; A.aim = a.mv.aim === 'front' ? Math.atan2(dx, dz) : Math.atan2(-dz, dx); if ('targetDist' in m || P.id === 'jester' || P.id === 'fox') m.targetDist = Math.hypot(dx, dz); if (a.mv.copies && a.tf) m.target = a.tf.m.root;
      A.leanTo = P.id === 'ranger' && a.tf ? Math.max(0, Math.atan2(1.42 - Math.min(1.42, a.tf.K.h * 0.62), Math.hypot(dx, dz))) : 0; }
    else { A.aim = null; if (P.id === 'jester' || P.id === 'fox') m.targetDist = 0; }
    a.stage = 'play'; a.t = 0; a.hitsAt = a.tags ? [] : A.hits(a.mv); a.hitSeen = a.tags ? (m.state.hitN || 0) : 0; A.play(a.anim);
  }
  function jesterTag(tag) {                                // her model says what each beat of a move is; the picture follows it
    const a = act, f = a.tf, m = J();
    if (a.anim === 'taunt_heal') { if (tag === 'heal') { showSome(a, 99); m.game.catches = B.taunt; } return; }
    if (a.anim === 'g_rebuke') { showSome(a, 99); return; }
    if (a.anim === 'taunt_attack') { if (tag === 'burst') { showSome(a, 99); m.game.catches = B.taunt; } return; }
    const all = a.anim === 'g_curtain' ? [f].concat(a.others) : [f];
    if (tag === 'land') float(f.m.anchor(f.K.top, _v), WORDS.sealed, 'fate');
    else if (tag === 'zero') { f.shown.life = 0; f.shown.fate = 0; float(f.m.anchor('chest', _v), WORDS.ended, 'end'); shake = Math.max(shake, 0.6); title(a.anim === 'g_curtain' ? 'Curtain Call' : 'Sealed Fate'); }
    else if (tag === 'doom') { for (const o of all) if (o.up) o.fadeTo = 0; }
    else if (tag === 'gone') { for (const o of all) if (o.up) gone(o); }
    else if (tag === 'splash') { for (const o of a.others) if (o.up) showFoeLife(o, o.e.hp, 'end'); }
    else if (tag === 'rise') { for (const e of heroesE()) { const P = party[e.id]; if (e.hp > 0 && P.a.isDown) { P.shown.hp = e.hp; P.a.down(false); float(P.a.anchor('head', _v), WORDS.up, 'heal'); } } }
    paint();
  }
  function gone(f) { f.up = false; f.vis = false; f.shown.life = 0; f.m.root.visible = f.m.fx.visible = false; f.m.patch.visible = false; }

  // ---------- a foe's move ----------
  function foeActs(f, move) {
    const ev = B.events.splice(0), words = B.log.map((l) => l.text); B.log.length = 0;
    const hurts = ev.filter((x) => x.type === 'hurt'), dmg = ev.find((x) => x.type === 'dmg');
    let tp = null, tfo = null, all = hurts.length > 1 || move === 'eclipse';
    if (!all && hurts.length) tp = party[hurts[0].id]; else if (!all && dmg) tfo = foeOf(dmg.id);
    else if (!all && !ev.length) tp = (B.fighters.find((x) => x.id === 'fox' && x.hp > 0) && party.fox) || null;      // her ghost took it
    const m = f.m, anim = m.ACTIONS[f.K.moves[move]] ? f.K.moves[move] : f.K.moves.blow, A = m.ACTIONS[anim];
    const T = tp ? { x: tp.x, z: tp.z } : tfo && tfo !== f ? { x: tfo.x, z: tfo.z } : null;
    act = { kind: 'foe', f, move, anim, ev, t: 0, hitAt: (A.hits[0] || 0.6) * A.dur, dur: A.dur, done: false, tp, tfo, T, all, stage: 'play', from: null, to: null, g: 0, quiet: !ev.length };
    if (T && f.K.reach) { const dx = f.x - T.x, dz = f.z - T.z, L = Math.hypot(dx, dz) || 1, r = f.K.reach; if (L > r + 0.3) { act.from = { x: f.x, z: f.z }; act.to = { x: T.x + dx / L * r, z: T.z + dz / L * r }; act.stage = 'in'; act.gd = Math.max(0.4, Math.min(0.9, (L - r) / 8)); } }
    phase = 'act'; say(words[0] || (f.e.name + ' ' + WORDS.acts + '.')); if (act.stage === 'play') foePlay(); paint();
  }
  function foePlay() {
    const a = act, f = a.f, m = f.m; a.stage = 'play'; a.t = 0;
    if (a.tp) { a.tp.a.anchor('chest', _v); m.state = { target: { x: _v.x, y: _v.y, z: _v.z } }; } else if (a.tfo) { m.state = { target: { x: a.tfo.x, y: a.tfo.K.h * 0.6, z: a.tfo.z } }; }
    m.play(a.anim, true);
  }

  // ---------- the end ----------
  function finish() {
    act = { ev: [] }; syncAll(); act = null; phase = 'over'; cur = null;
    for (const P of Object.values(party)) if (P.e) { P.a.aim = null; if (B.over === 'won') { P.a.rest = REAR(CAMNOW()) ? Math.atan2(GEO.ux * 6 + SIDE(GEO.ux, GEO.uz)[0] * 2.2 + GEO.pcx - P.x, GEO.uz * 6 + SIDE(GEO.ux, GEO.uz)[1] * 2.2 + GEO.pcz - P.z) : 0; P.a.win(); } }
    const won = B.over === 'won', lvl = O.foeLevel || 1;
    const xp = won ? Math.round(foesE().reduce((s, f) => s + XP[f.tier] * Math.pow(XP_SLOPE, lvl - 1), 0)) : 0;
    const out = { result: B.over, won, xp, turns: B.heroTurns, foeTurns: B.foeTurns, fainted: B.kos, place: S.id, foes: O.foes.slice(), tag: O.tag == null ? null : O.tag, party: {} };
    for (const e of heroesE()) out.party[e.id] = { hp: Math.round(e.hp), max: e.max, mp: e.mp, mpMax: e.mpMax };
    elBanner.hidden = false; elBanner.innerHTML = '<b></b><span></span><button type="button"></button>';
    elBanner.children[0].textContent = won ? WORDS.won : B.over === 'fled' ? WORDS.fled : WORDS.lost;
    elBanner.children[1].textContent = won ? '+' + num(xp) + ' ' + WORDS.xp + ' · ' + B.heroTurns + ' ' + (B.heroTurns === 1 ? WORDS.turn : WORDS.turns) : '';
    elBanner.children[2].textContent = WORDS.done; elBanner.children[2].addEventListener('click', () => { const d = onDone; onDone = null; if (d) d(out); });
    api.result = out; say(won ? 'Victory.' : B.over === 'fled' ? 'Away.' : 'Defeat.'); paint(); if (H.onOver) H.onOver(out);
  }

  // ---------- what is on screen ----------
  // sel: the move that is picked and who it is aimed at. kind: 'foe', 'hero' (a friend), 'none', or 'off' (it cannot be used now; the help line says why)
  function select(id) {
    if (phase !== 'menu' || !cur) return false;
    const m = E.heroMoves(B, cur.e).find((x) => x.id === id); if (!m) return false;
    if (sel && sel.id === id && m.ok) return cast();                                   // the same move a second time: cast it
    if (!m.ok) { sel = { id, m, kind: 'off', ok: [], t: null }; paint(); return false; }
    let kind = 'none', ok = [], t = null;
    if (/^(foe|foe2|sealed|marked)$/.test(m.target)) { kind = 'foe'; ok = E.targetsFor(B, cur.e, id).map((e) => foeOf(e.id)).filter((f) => f && f.up); t = ok.indexOf(cur.lastFoe) >= 0 ? cur.lastFoe : ok.indexOf(foes[selFoe]) >= 0 ? foes[selFoe] : ok[0]; if (t) selFoe = t.i; }      // she aims where she aimed last, if she still can
    else if (m.target === 'hero' || m.target === 'fallen') { kind = 'hero'; const es = E.targetsFor(B, cur.e, id); ok = es.map((e) => e.id); t = m.target === 'hero' ? es.slice().sort((a, b) => a.hp / a.max - b.hp / b.max)[0].id : ok[0]; }      // a heal starts on whoever is hurt most
    sel = { id, m, kind, ok, t }; paint(); return true;
  }
  function cast() { if (phase !== 'menu' || !sel || sel.kind === 'off') return false; const q = sel; if (q.kind === 'foe') cur.lastFoe = q.t; sel = null; return choose(q.id, q.kind === 'foe' ? q.t.e.id : q.kind === 'hero' ? q.t : undefined); }
  function tapFoe(f) { if (phase !== 'menu' || !f.up) return; if (sel && sel.kind === 'foe') { if (sel.ok.indexOf(f) < 0) return; if (sel.t === f) { cast(); return; } sel.t = f; } selFoe = f.i; paint(); }
  function tapHero(P) { if (phase !== 'menu' || !sel || sel.kind !== 'hero' || sel.ok.indexOf(P.id) < 0) return; if (sel.t === P.id) { cast(); return; } sel.t = P.id; paint(); }
  function paint() {
    if (!B) return; const menu = phase === 'menu' && !!cur, pct = (k) => (100 * Math.max(0, Math.min(1, k))).toFixed(1) + '%';
    for (const e of heroesE()) { const P = party[e.id], d = P.row; if (!d) continue; const c = d.children;
      c[0].textContent = P.a.name; c[1].children[0].style.width = c[1].children[1].style.width = pct(P.shown.hp / e.max); c[2].textContent = num(P.shown.hp) + ' HP'; { const k = P.shown.hp / e.max; d.classList.toggle('mid', k < 0.5 && k >= 0.25); d.classList.toggle('low', k < 0.25 && k > 0); } c[3].style.visibility = e.mpMax ? '' : 'hidden'; if (e.mpMax) c[3].firstChild.style.width = pct(P.shown.mp / e.mpMax);
      c[4].textContent = e.id === 'jester' && B.taunt > 0 ? 'catching ' + B.taunt : e.mpMax ? P.shown.mp + ' MP' : (e.id === 'ranger' && B.gem > 0 ? 'gem in ' + B.gem : '\u00a0');
      d.classList.toggle('now', menu && cur === P); d.classList.toggle('down', P.shown.hp <= 0.5); d.classList.toggle('pick', !!(sel && sel.kind === 'hero' && sel.ok.indexOf(e.id) >= 0)); d.classList.toggle('tgt', !!(sel && sel.kind === 'hero' && sel.t === e.id)); }
    elBar.innerHTML = ''; if (phase !== 'over') for (const b of E.bar(B)) { const big = b.move && b.move !== 'blow', c = document.createElement('span'); c.className = 'chip ' + b.u.side + (big ? ' marked' : ''); c.textContent = (big ? '\u25b2 ' : '') + b.u.name + (big ? ': ' + b.move.charAt(0).toUpperCase() + b.move.slice(1) : ''); elBar.appendChild(c); }      // a Heavy, Crush or Eclipse that is coming is named, with a mark that does not rely on colour
    if (elBar.firstChild && menu) elBar.firstChild.classList.add('now');
    elMoves.innerHTML = ''; elCastRow.hidden = !menu;
    if (!menu) { elHelp.textContent = ''; ui.classList.remove('picking'); return; }
    for (const m of E.heroMoves(B, cur.e)) { const b = document.createElement('button'); b.type = 'button'; b.className = 'tile' + (m.ok ? '' : ' off') + (sel && sel.id === m.id ? ' on' : ''); b.dataset.id = m.id;
      const n = document.createElement('b'), x = document.createElement('span'); n.textContent = m.label; x.textContent = m.ok ? (m.mp ? m.mp + ' MP' : '\u00a0') : m.why; b.append(n, x); b.addEventListener('click', () => select(m.id)); elMoves.appendChild(b); }
    elHelp.textContent = !sel ? cur.a.name + ': ' + WORDS.pickMove : sel.kind === 'off' ? sel.m.why + '. ' + sel.m.help : sel.m.help;
    const can = !!sel && sel.kind !== 'off'; elCast.disabled = !can; elBack.hidden = !sel;
    elCast.textContent = !can ? WORDS.cast : sel.m.label + (sel.kind === 'foe' ? ' \u2192 ' + sel.t.e.name : sel.kind === 'hero' ? ' \u2192 ' + party[sel.t].a.name : sel.m.target === 'allfoes' ? ' \u2192 ' + WORDS.everyFoe : '');
    ui.classList.toggle('picking', upFoes().length > 1);
  }
  function bars() {
    const m = J(), put = [];
    for (const f of foes) { const d = f.bar, on = f.up && phase !== 'off' && !f.dying; d.hidden = !on; if (!on) { if (m) m.game.fates[f.i] = null; continue; }
      const p = stage.toScreen(_v.set(f.m.root.position.x, f.K.bar, f.m.root.position.z)); let y = p[1]; for (let k = 0; k < 6 && put.some((q) => Math.abs(q[0] - p[0]) < 96 && Math.abs(q[1] - y) < 30); k++) y -= 30;      // two bars never sit on each other
      put.push([p[0], y]); d.style.left = p[0].toFixed(0) + 'px'; d.style.top = y.toFixed(0) + 'px';
      const life = f.shown.life, Lk = life / f.shown.max, Fk = Math.min(Lk, f.shown.fate / f.shown.max), sealedNow = life > 0 && f.shown.fate > 0 && f.shown.fate >= life;
      d.classList.toggle('sealed', sealedNow); { const aim = sel && sel.kind === 'foe'; d.classList.toggle('tgt', phase === 'menu' && (aim ? sel.t === f : f.i === selFoe)); d.classList.toggle('pick', !!(aim && sel.t !== f && sel.ok.indexOf(f) >= 0)); d.classList.toggle('dim', !!(aim && sel.ok.indexOf(f) < 0)); }
      d.firstChild.textContent = f.e.name + (sealedNow ? ' · ' + WORDS.sealed : '') + (f.e.conf > 0 ? ' · lost' : '') + (f.e.cloth ? ' · cut' : ''); f.elLife.style.width = f.elLost.style.width = (100 * Lk).toFixed(1) + '%'; f.elFate.style.width = (100 * Fk).toFixed(1) + '%';
      // what the Jester's model is told: Fate on each foe, shown as dust falling round it
      if (m) { const k = f.mark; k.x = f.m.root.position.x; k.y = 0; k.z = f.m.root.position.z; k.r = f.K.r; k.h = f.K.h; k.k = life > 0 ? Math.min(1, f.shown.fate / life) : 0; k.sealed = sealedNow; m.game.fates[f.i] = life > 0 ? k : null; } }
  }
  function glide(a, o, dt, back) {                         // someone crosses the ground to a target, or home again
    a.g += dt / a.gd; const k = Math.min(1, a.g), e = k * k * (3 - 2 * k), A0 = back ? a.to : a.from, A1 = back ? a.from : a.to;
    o.x = A0.x + (A1.x - A0.x) * e; o.z = A0.z + (A1.z - A0.z) * e; return k >= 1;
  }

  // ---------- the camera ----------
  // 'behind' (Chris, November 14: "the camera is from behind their heads ... swing around and look at each move but cut back to the whole
  // group in between"): at rest the camera stands behind the party and looks over their heads at the foes. For each move it cuts to a
  // camera that swings round whoever is moving, then cuts back. It is a camera that really moves, so the painting behind is out of focus.
  const CAMNOW = () => (H.cam ? H.cam() : 'auto'), SIDE = (ux, uz) => (ux >= 0 ? [-uz, ux] : [uz, -ux]);      // SIDE: the way across a line, on the audience's side of it
  const ease = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }, mix = (p, q, k) => p + (q - p) * k, DEG = Math.PI / 180;
  const swing = (cx, cz, ux, uz, phi, R) => { const sd = SIDE(ux, uz), c = Math.cos(phi), n = Math.sin(phi); return [cx - ux * R * c + sd[0] * R * n, cz - uz * R * c + sd[1] * R * n]; };
  // 'directed' (Chris, November 14, 7:26 pm: "behind the party with a wider angle ... director decisions"). The decisions:
  //   1. Every fight opens on the painting, sharp and side on, for two seconds while the foes arrive. Then it cuts behind the party.
  //   2. The resting view is wide: behind the party and off to the audience's side, high enough to see all four witches whole and every foe.
  //   3. A plain move stays in that wide view, with a slow push in. Nothing cuts.
  //   4. A big move earns its own shot, the swing: a witch's spells that are named in BIG, and a foe's Heavy, Crush or Eclipse.
  //   5. A won fight ends on the party's bow, seen from the foes' side.
  const BIG = { g_seal: 1, g_curtain: 1, taunt_heal: 1, shots: 1, moons_little_lie: 1, crazy_quilt: 1, same_cloth: 1, borrowed_face: 1, guardian: 1, revive: 1, garden: 1 };
  const REAR = (c) => c === 'behind' || c === 'directed' || c === 'auto';
  function behindShot(a, playing, asp) {
    const G = GEO, sd = SIDE(G.ux, G.uz), WIDE = CAMNOW() === 'directed';
    if (WIDE && intro > 0 && phase !== 'over') return null;
    // the wide view: from behind the party and well round to the audience's side (55 degrees off the line from party to foes), so the party
    // is on the left with their backs to us and the foes are beyond them on the right. A narrow screen gets a wider lens, not a further camera.
    const wide = (push) => { const th = 55 * DEG, R = 6.0 * (1 - 0.12 * push), q = [G.pcx - G.ux * R * Math.cos(th) + sd[0] * R * Math.sin(th), G.pcz - G.uz * R * Math.cos(th) + sd[1] * R * Math.sin(th)];
      return { p: [q[0], 2.9 + 0.08 * G.tall - 0.2 * push, q[1]], l: [G.pcx + G.ux * 0.42 * G.D, 1.0 + 0.1 * G.tall, G.pcz + G.uz * 0.42 * G.D], fov: Math.min(64, 46 * Math.max(1, 1.45 / asp)), blur: 1.7, dim: 0.92, group: true }; };
    const group = () => { const back = 4.7 * Math.max(1, Math.min(2.3, 1.5 / asp)); return { p: [G.pcx - G.ux * back + sd[0] * 0.7, 2.7 + 0.1 * G.tall, G.pcz - G.uz * back + sd[1] * 0.7], l: [G.pcx + G.ux * 0.8 * G.D, 0.8 + 0.08 * G.tall, G.pcz + G.uz * 0.8 * G.D], fov: 36 + Math.max(0, G.tall - 2), blur: 2.0, dim: 0.9, group: true }; };
    if (phase === 'over' && B.over === 'won') return { p: [G.pcx + G.ux * 6 + sd[0] * 2.2, 1.5, G.pcz + G.uz * 6 + sd[1] * 2.2], l: [G.pcx, 1.15, G.pcz], fov: 34, blur: 2.4, dim: 0.9, group: true };      // the bow: from the foes' side, looking back at the party
    if (WIDE) { if (!a || !playing || a.stage !== 'play') return wide(0);
      else if (!(a.kind === 'hero' ? BIG[a.anim] : a.move !== 'blow')) return wide(ease(a.t / 2.6)); }
    else if (!a || !playing || a.stage !== 'play') return group();
    if (a.kind === 'hero') { const P = a.P, landed = a.hitK > 0 || a.landed; if (landed && a.landT == null) a.landT = a.t; const after = a.landT == null ? 0 : ease((a.t - a.landT) / 0.7);
      if (a.T && a.th !== P) {                               // a move at someone: from over her shoulder, round to her side; when it lands the camera looks to whoever it landed on
        const dx = a.T.x - P.x, dz = a.T.z - P.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, tHit = a.tags ? 0.5 * P.a.dur(a.anim) : (a.hitsAt[0] || 0.6 * P.a.dur(a.anim)), th = a.tf ? a.tf.K.h : 1.7;
        const phi = (mix(24, 80, ease(a.t / tHit)) + 12 * after) * DEG, R = Math.max(4, Math.min(6.5, 3.6 + 0.3 * L)) + 0.25 * Math.max(0, th - 2) * after, q = swing(P.x + ux * 0.3 * L * after, P.z + uz * 0.3 * L * after, ux, uz, phi, R), k = mix(0.3, 0.8, after);
        return { p: [q[0], 1.75 + 0.12 * Math.max(0, th - 2) * after, q[1]], l: [P.x + ux * k * L, mix(1.15, 0.3 + 0.5 * th, after), P.z + uz * k * L], fov: 30 }; }
      if (landed) return WIDE ? wide(1) : group();                            // a move at everyone, or on herself: once it lands, everyone is in the picture
      const phi = mix(40, 140, ease(a.t / Math.max(1.5, 0.8 * P.a.dur(a.anim)))) * DEG, q = swing(P.x, P.z, G.ux, G.uz, phi, 4.6);
      return { p: [q[0], 1.7, q[1]], l: [P.x, 1.2, P.z], fov: 30 }; }
    const f = a.f, fp = f.m.root.position, tall = f.K.h, after = a.done ? ease((a.t - a.hitAt) / 0.7) : 0;
    if (a.tp && !a.all) {                                    // a foe strikes a witch: from behind her head as it comes, round to her side as it lands
      const P = a.tp, dx = fp.x - P.x, dz = fp.z - P.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, phi = mix(12, 64, ease(a.t / a.hitAt)) * DEG, q = swing(P.x, P.z, ux, uz, phi, 3.3 + 0.45 * tall), k = mix(0.6, 0.12, after);
      return { p: [q[0], 1.9 + 0.2 * tall, q[1]], l: [P.x + ux * k * L, mix(0.3 + 0.5 * tall, 1.15, after), P.z + uz * k * L], fov: 34 }; }
    if (a.all && a.done) return WIDE ? wide(1) : group();
    { const dx = fp.x - G.pcx, dz = fp.z - G.pcz, L = Math.hypot(dx, dz) || 1, phi = mix(-16, 32, ease(a.t / a.hitAt)) * DEG, q = swing(fp.x, fp.z, dx / L, dz / L, phi, 4.5 + 1.3 * tall);      // a foe on its own, or striking another foe: from the party's side, drifting round it
      return { p: [q[0], 1.6 + 0.3 * tall, q[1]], l: [fp.x, 0.55 * tall, fp.z], fov: 34 }; }
  }
  // 'auto', the director (Chris, November 14, 7:48 pm: "a combination: directed wide behind the party and behind their heads, a swing on
  // every move ... maybe some other good angles ... switching between those intelligently as the fight takes place").
  // The shots it can call:  WIDE the rear three-quarter view of everyone;  HEADS close behind the party's heads;  TURN over the shoulder of
  // the witch whose turn it is, at the foe she is aiming at;  SWING from over the mover's shoulder round to her side, then to whoever it
  // landed on;  PROFILE both of them from the side, pushing in;  LOW low in front of the mover, drifting;  REVERSE from behind the target,
  // looking back at who is coming;  HIGH from above, over whoever a move at everyone lands on;  FOE round a foe that acts on its own.
  // How it chooses:
  //   - the fight opens on the sharp painting; a witch's turn is TURN; crossing the ground to a target is WIDE; between moves it holds the last shot
  //   - a move at one foe from where she stands takes SWING, PROFILE and LOW in turn (never the same twice running); Sealed Fate, Curtain
  //     Call and the gem's two shots are always SWING
  //   - a move she walks up for (Io's, the Fox's fangs) takes REVERSE and SWING in turn; a move on a friend is PROFILE, close
  //   - a move at everyone or on herself is LOW until it lands, then HIGH over the foes, or HEADS when it is the party that feels it
  //   - a foe's strike at a witch takes "behind her head" and REVERSE in turn; its Eclipse is FOE, then HEADS as it falls on the party
  //   - a won fight ends on the bow
  //   - whatever the shot, the camera goes to the target half a second before a move lands, so the blow itself is always seen
  let shotN = 0, lastShot = null;
  function directorShot(a, playing, asp) {
    const G = GEO, sd = SIDE(G.ux, G.uz), keep = (q) => (lastShot = q);
    if (intro > 0 && phase !== 'over') return null;
    if (phase === 'over' && B.over === 'won') return { p: [G.pcx + G.ux * 6 + sd[0] * 2.2, 1.5, G.pcz + G.uz * 6 + sd[1] * 2.2], l: [G.pcx, 1.15, G.pcz], fov: 34, blur: 2.4, dim: 0.9, group: true };
    const WIDE = (push) => { const th = 55 * DEG, R = 6.0 * (1 - 0.12 * push), q = [G.pcx - G.ux * R * Math.cos(th) + sd[0] * R * Math.sin(th), G.pcz - G.uz * R * Math.cos(th) + sd[1] * R * Math.sin(th)];
      return { p: [q[0], 2.9 + 0.08 * G.tall - 0.2 * push, q[1]], l: [G.pcx + G.ux * 0.42 * G.D, 1.0 + 0.1 * G.tall, G.pcz + G.uz * 0.42 * G.D], fov: Math.min(64, 46 * Math.max(1, 1.45 / asp)), blur: 1.7, dim: 0.92, group: true }; };
    const HEADS = () => { const back = 4.7 * Math.max(1, Math.min(2.3, 1.5 / asp)); return { p: [G.pcx - G.ux * back + sd[0] * 0.7, 2.7 + 0.1 * G.tall, G.pcz - G.uz * back + sd[1] * 0.7], l: [G.pcx + G.ux * 0.8 * G.D, 0.8 + 0.08 * G.tall, G.pcz + G.uz * 0.8 * G.D], fov: 36 + Math.max(0, G.tall - 2), blur: 2.0, dim: 0.9, group: true }; };
    const dirTo = (x0, z0, x1, z1) => { const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz) || 1; return [dx / L, dz / L, L]; };
    if (phase === 'menu' && cur) {                           // TURN: over her shoulder, at the foe she is aiming at
      const f = foes[selFoe] && foes[selFoe].up ? foes[selFoe] : upFoes()[0], tx = f ? f.x : G.fcx, tz = f ? f.z : G.fcz, th = f ? f.K.h : 2, d = dirTo(cur.x, cur.z, tx, tz), ps = SIDE(d[0], d[1]), k = Math.max(1, Math.min(1.5, 1.2 / asp));
      return keep({ p: [cur.x - d[0] * 2.9 * k + ps[0] * 0.95, 2.05 + 0.05 * th, cur.z - d[1] * 2.9 * k + ps[1] * 0.95], l: [cur.x + d[0] * 0.72 * d[2], 0.7 + 0.13 * th, cur.z + d[1] * 0.72 * d[2]], fov: Math.min(56, 42 * k), blur: 2.2, dim: 0.9, group: true }); }
    if (!a) return lastShot || WIDE(0);                      // between moves: hold
    if (a.kind === 'hero' && a.anim === 'g_curtain' && a.stage === 'play' && a.P.a.time > 5.2) return keep(WIDE(1));
    if (!playing || a.stage !== 'play') return keep(WIDE(a.stage === 'in' ? ease(a.g) * 0.6 : 0));      // crossing the ground
    if (a.shotK == null) a.shotK = shotN++;
    const n = a.shotK;
    if (a.kind === 'hero') { const P = a.P, landed = a.hitK > 0 || a.landed; if (landed && a.landT == null) a.landT = a.t; const dur = P.a.dur(a.anim), tHit = (a.tags ? P.a.hits(a.mv)[0] : a.hitsAt[0]) || 0.6 * dur, lead = ease((a.t - (tHit - 0.5)) / 0.42), after = Math.max(lead, a.landT == null ? 0 : ease((a.t - a.landT) / 0.35));
      if (a.T && a.th !== P) { const d = dirTo(P.x, P.z, a.T.x, a.T.z), ux = d[0], uz = d[1], L = d[2], ps = SIDE(ux, uz), th = a.tf ? a.tf.K.h : 1.7, always = { g_seal: 1, g_curtain: 1, shots: 1, guardian: 1 }[a.anim];
        let kind = always ? 'swing' : a.th ? 'profile' : a.from ? ['reverse', 'swing'][n % 2] : ['swing', 'profile', 'low'][n % 3];
        if (kind === 'reverse' && after > 0.5) kind = 'profile';      // from behind the target the blow itself would be hidden by the target, so it cuts to the side just before it lands
        if (kind === 'profile') { const c = a.th ? 0.5 : 0.3, R = Math.max(3.4, Math.min(6.0, 2.2 + 0.5 * L)) * (1 - 0.1 * ease(a.t / tHit)), k = mix(c, 0.72, after);      // both of them, side on, pushing in; when it lands the picture slides to the one it landed on
          return keep({ p: [P.x + ux * k * L + ps[0] * R, 1.45, P.z + uz * k * L + ps[1] * R], l: [P.x + ux * k * L, 1.1 + 0.15 * Math.max(0, th - 2) * after, P.z + uz * k * L], fov: 34 }); }
        if (kind === 'low') { const phi = mix(105, 150, ease(a.t / Math.max(tHit, 1))) * DEG, q = swing(P.x, P.z, ux, uz, phi, 3.3);                                 // low in front of her as she casts; then to her target
          if (!after) return keep({ p: [q[0], 0.6, q[1]], l: [P.x, 1.25, P.z], fov: 32 });
          const q2 = swing(a.T.x, a.T.z, ux, uz, 35 * DEG, 3.0 + 0.9 * th); return keep({ p: [q2[0], 0.9 + 0.3 * th, q2[1]], l: [a.T.x, 0.55 * th, a.T.z], fov: 34 }); }
        if (kind === 'reverse') { const R = 2.3 + 0.7 * th, k = mix(0.25, 0.85, after);                                                                               // from behind her target, looking back at her
          return keep({ p: [a.T.x + ux * R + ps[0] * (0.9 + 0.2 * th), 0.9 + 0.55 * th, a.T.z + uz * R + ps[1] * (0.9 + 0.2 * th)], l: [P.x + ux * k * L, mix(1.15, 0.5 * th, after), P.z + uz * k * L], fov: 36 }); }
        const phi = (mix(24, mix(80, 42, Math.max(0, Math.min(1, (L - 3) / 5))), ease(a.t / tHit)) + 8 * after) * DEG, R = Math.max(4, Math.min(6.5, 3.6 + 0.3 * L)) + 0.25 * Math.max(0, th - 2) * after, q = swing(P.x + ux * 0.3 * L * after, P.z + uz * 0.3 * L * after, ux, uz, phi, R), k = mix(0.3, 0.8, after);      // the swing
        return keep({ p: [q[0], 1.75 + 0.12 * Math.max(0, th - 2) * after, q[1]], l: [P.x + ux * k * L, mix(1.15, 0.3 + 0.5 * th, after), P.z + uz * k * L], fov: 30 }); }
      if (landed) { const hitsFoes = AC.MOVES[a.id] && /needles|quilt/.test(a.id);                                                                                    // a move at everyone, or on herself, once it lands
        if (hitsFoes) { const h = 4.2 + 0.2 * G.tall - 0.4 * after; return keep({ p: [G.fcx - G.ux * 8.6 + sd[0] * 4.6, h, G.fcz - G.uz * 8.6 + sd[1] * 4.6], l: [G.fcx, 1.2, G.fcz], fov: 34, blur: 2.4, group: true }); }      // HIGH: not so high that the camera looks down past the painting
        return keep(a.id === 'i_bloom' || a.id === 'j_heal' ? HEADS() : WIDE(1)); }
      const phi = mix(100, 150, ease(a.t / Math.max(1.5, 0.8 * dur))) * DEG, q = swing(P.x, P.z, G.ux, G.uz, phi, 3.5);
      return keep({ p: [q[0], 0.65, q[1]], l: [P.x, 1.25, P.z], fov: 32 }); }
    const f = a.f, fp = f.m.root.position, tall = f.K.h, after = a.done ? ease((a.t - a.hitAt) / 0.7) : 0;
    if (a.tp && !a.all) { const P = a.tp, d = dirTo(P.x, P.z, fp.x, fp.z), ux = d[0], uz = d[1], L = d[2], ps = SIDE(ux, uz);
      if (n % 2) { const R = 2.4 + 0.75 * tall, k = mix(0.3, 0.9, after);                                                                                           // from behind the foe, down at the witch it strikes
        return keep({ p: [fp.x + ux * R + ps[0] * (1.0 + 0.3 * tall), 1.0 + 0.6 * tall, fp.z + uz * R + ps[1] * (1.0 + 0.3 * tall)], l: [fp.x - ux * k * L, 1.1, fp.z - uz * k * L], fov: 38 }); }
      const phi = mix(12, 64, ease(a.t / a.hitAt)) * DEG, q = swing(P.x, P.z, ux, uz, phi, 3.3 + 0.45 * tall), k = mix(0.6, 0.12, after);                             // from behind her head as it comes, round to her side as it lands
      return keep({ p: [q[0], 1.9 + 0.2 * tall, q[1]], l: [P.x + ux * k * L, mix(0.3 + 0.5 * tall, 1.15, after), P.z + uz * k * L], fov: 34 }); }
    if (a.all && a.done) return keep(HEADS());
    { const d = dirTo(G.pcx, G.pcz, fp.x, fp.z), phi = mix(-16, 32, ease(a.t / a.hitAt)) * DEG, q = swing(fp.x, fp.z, d[0], d[1], phi, 4.5 + 1.3 * tall);              // FOE: a foe on its own, from the party's side, drifting round it
      return keep({ p: [q[0], 1.6 + 0.3 * tall, q[1]], l: [fp.x, 0.55 * tall, fp.z], fov: 34 }); }
  }
  // the older cameras: a window on the painting, or (for 'shoulder' and 'low') a camera that really moves, with the painting out of focus behind
  const heroPts = (P, out) => { out.push([P.x - 0.75, 0, P.z], [P.x, P.id === 'io' ? 2.25 : 2.0, P.z], [P.x + 0.75, 0, P.z + 0.9]); };
  const foePts = (f, out) => { const p = f.m.root.position, r = f.K.r + 0.35; out.push([p.x - r, 0, p.z], [p.x + r, 0, p.z + 0.5], [p.x, f.K.h + 0.25, p.z]); };
  function camera(dt) {
    const FW = S.frame[0], FH = S.frame[1], asp = H.aspect(); let ww = FW, wh = ww / asp; if (wh > FH) { wh = FH; ww = wh * asp; }
    const feet = stage.toFrame(_w.set(0, 0, C[1] + 2.9))[1] + wh * 0.05;
    let wx = (FW - ww) / 2, wy = Math.max(Math.min(S.wideTop, FH - wh), feet - wh), quick = 2.4, shot = null;
    const CAM = CAMNOW(), a = act && act.kind ? act : null, playing = a && phase === 'act' && !(a.kind === 'hero' && a.anim === 'g_curtain' && a.P.a.time > 5.2);
    const frame = (pts, kx, ky, least, foot) => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) { const q = stage.toFrame(_w.set(p[0], p[1], p[2])); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
      let cw = Math.max((x1 - x0) * kx, (y1 - y0) * ky * asp, FW * least); cw = Math.min(cw, ww); const ch = cw / asp; ww = cw; wh = ch; wx = (x0 + x1) / 2 - cw / 2; wy = y1 + ch * foot - ch; };
    if (REAR(CAM)) { shot = CAM === 'auto' ? directorShot(a, playing, asp) : behindShot(a, playing, asp); if (!shot) { const all = []; for (const id in party) if (party[id].e) heroPts(party[id], all); for (const f of foes) if (f.vis) foePts(f, all); frame(all, 1.08, 1.16, 0.4, 0.1); } }      // no shot: the fight's opening, on the sharp painting
    else if (CAM !== 'wide') {
      const all = []; for (const id in party) if (party[id].e) heroPts(party[id], all); for (const f of foes) if (f.up) foePts(f, all);
      frame(all, 1.08, 1.16, 0.4, 0.1);                    // at rest: everyone still standing, and no more of the place than that
      if (CAM === 'side') { if (playing && a.kind === 'hero') { all.push([a.P.x, 3.3, a.P.z]); frame(all, 1.08, 1.12, 0.4, 0.1); } }      // 'side' (Chris, November 14, 6:38 pm): the whole party and every foe, from the side, in front of the sharp painting, for the whole fight; a little room above whoever is casting
      else if (phase === 'menu' && cur && CAM !== 'near') { const pts = []; heroPts(cur, pts); const f = foes[selFoe]; if (f && f.up) foePts(f, pts); frame(pts, 1.12, 1.25, 0.34, 0.12); }
      if (playing && CAM !== 'side') {
        const pts = [], who = a.kind === 'hero' ? a.P : null, landed = a.kind === 'hero' ? a.hitK > 0 || a.landed : a.done;
        if (CAM === 'near' || a.all || (a.kind === 'hero' && !a.T)) {                       // the one who moves and whoever it is aimed at; a move at everyone keeps everyone
          if (a.kind === 'hero' && a.T) { heroPts(who, pts); if (a.tf) foePts(a.tf, pts); if (a.th) heroPts(a.th, pts); frame(pts, 1.1, 1.22, 0.3, 0.12); }
          else if (a.kind === 'foe' && !a.all && (a.tp || a.tfo)) { foePts(a.f, pts); if (a.tp) heroPts(a.tp, pts); if (a.tfo) foePts(a.tfo, pts); frame(pts, 1.1, 1.22, 0.3, 0.12); }
          else if (a.kind === 'hero' && CAM !== 'near' && !landed) { heroPts(who, pts); frame(pts, 1.5, 1.3, 0.26, 0.1); }
        } else if (CAM === 'actor') { quick = 4.2;           // whoever is moving, then whoever is hit
          if (a.kind === 'hero') { if (!landed) heroPts(who, pts); else if (a.tf) foePts(a.tf, pts); else if (a.th) heroPts(a.th, pts); else heroPts(who, pts); }
          else { if (!landed) foePts(a.f, pts); else if (a.tp) heroPts(a.tp, pts); else if (a.tfo) foePts(a.tfo, pts); else foePts(a.f, pts); }
          frame(pts, 1.5, 1.28, 0.22, 0.1);
        } else if (a.stage === 'play') {                     // 'shoulder' and 'low': the real camera moves for the length of a move
          const hero = a.kind === 'hero', mp = hero ? who : a.f.m.root.position, ax = mp.x, az = mp.z, T = hero ? a.T : (a.tp ? { x: a.tp.x, z: a.tp.z } : a.T), u = Math.min(1, a.t / 3.5), tall = hero ? 1.7 : a.f.K.h, th = hero ? (a.tf ? a.tf.K.h : 1.7) : 1.7;
          if (T && CAM === 'shoulder') { const dx = T.x - ax, dz = T.z - az, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, back = (2.6 + 1.0 * tall) - 0.4 * u;
            shot = { p: [ax - ux * back, 0.55 + 0.68 * tall, az - uz * back + 1.1 + 0.35 * tall], l: [ax + dx * 0.6, 0.35 + 0.42 * Math.max(tall, th), az + dz * 0.6], fov: 24 }; }
          else if (CAM === 'low') { const onMover = !landed || !T, fx = onMover ? ax : T.x, fz = onMover ? az : T.z, hh = onMover ? tall : th, d = 2.4 + 1.3 * hh - (onMover ? 0.6 * u : 0);
            shot = { p: [fx + (onMover === hero ? 1.2 : -1.1), 0.25 + 0.2 * hh, fz + d], l: [fx, 0.15 + 0.6 * hh, fz], fov: 22 }; }
        }
      }
    }
    stage.free.on = !!shot; stage.free.group = !!(shot && shot.group); if (shot) { stage.free.pos.set(shot.p[0], shot.p[1], shot.p[2]); stage.free.look.set(shot.l[0], shot.l[1], shot.l[2]); stage.free.fov = shot.fov; stage.free.blur = shot.blur || 3.0; stage.free.dim = shot.dim || 0.82; }
    wx = Math.max(0, Math.min(FW - ww, wx)); wy = Math.max(0, Math.min(FH - wh, wy));
    if (!win || shot) win = { x: wx, y: wy, w: ww, h: wh }; else { const k = Math.min(1, dt * quick); win.x += (wx - win.x) * k; win.y += (wy - win.y) * k; win.w += (ww - win.w) * k; win.h = win.w / asp; if (win.h > FH) { win.h = FH; win.w = FH * asp; } }
    stage.setWindow(win.x, win.y, win.w, win.h);
  }

  const api = {
    group, party, get foes() { return foes; }, get phase() { return phase; }, get battle() { return B; }, get current() { return cur ? cur.id : null; }, get act() { return act; }, result: null, choose, hero,
    setAuto(style) { auto = style || null; },
    // keys: 1 to 7 pick a move, Tab or the arrows change who it is aimed at, Enter casts, Esc goes back
    key(k) { if (phase !== 'menu' || !cur) return false;
      if (k === 'Tab' || k === 'ArrowRight' || k === 'ArrowLeft') { const step = k === 'ArrowLeft' ? -1 : 1;
        if (sel && sel.kind === 'hero') { const L = sel.ok; sel.t = L[(L.indexOf(sel.t) + step + L.length) % L.length]; }
        else { const L = sel && sel.kind === 'foe' ? sel.ok : upFoes(); if (L.length) { const f = L[(L.indexOf(foes[selFoe]) + step + L.length) % L.length]; selFoe = f.i; if (sel && sel.kind === 'foe') sel.t = f; } }
        paint(); return true; }
      if (k === 'Enter') { cast(); return true; }
      if (k === 'Escape') { sel = null; paint(); return true; }
      const n = +k, ms = n >= 1 && n <= 9 ? E.heroMoves(B, cur.e) : null; if (ms && ms[n - 1]) { select(ms[n - 1].id); return true; } return false; },
    select, cast,
    // start a fight: { place (one of MF_PLACES), foes: ['wisp', 'wraith', 'great', ...], gap, foeLevel, seed, party: { jester: { hp, mp }, ... }, label, tag }; done(result) is called when the player leaves the result
    enter(opts, done) { onDone = done || null; api.result = null; group.visible = true; ui.hidden = false; panel.hidden = false; begin(opts); },
    leave() { group.visible = false; ui.hidden = true; panel.hidden = true; phase = 'off'; act = null; stage.free.on = false; for (const l of stage.near) l.intensity = 0; stage.dark = stage.dim = 0; stage.shakeX = stage.shakeY = 0; stage.catcher.scale.set(1, 1, 1);
      for (const id in party) { const P = party[id]; P.patch.visible = false; if (P.a.m.stop) P.a.m.stop(); } for (const k in pool) for (const m of pool[k]) { m.patch.visible = false; m.inUse = false; } },
    step(dt, t) {
      if (phase === 'off' || !B) return; time = t; intro = Math.max(0, intro - dt);
      // a blow has just landed: the picture holds for a beat (the burst of light and the numbers keep moving)
      const raw = dt; if (hitStop > 0) { hitStop -= raw; dt = raw * 0.05; }
      for (const b of bursts) { if (!b.on) continue; b.t += raw / 0.34; if (b.t >= 1) { b.on = false; b.m.visible = false; continue; } const k = b.t, e = 1 - (1 - k) * (1 - k), sz = b.size * (0.3 + 1.5 * e); b.m.scale.set(sz, sz, 1); b.m.material.opacity = Math.pow(1 - k, 1.4); }
      if (phase === 'wait') { wait -= dt; if (wait <= 0) next(); }
      else if (phase === 'ending') { wait -= dt; if (wait <= 0) finish(); }
      else if (phase === 'menu' && auto && cur) { wait -= dt; if (wait <= 0) { const c = E.choose(B, cur.e, auto); wait = 0.6; if (!choose(c.move, c.target)) { const m = E.heroMoves(B, cur.e).find((x) => x.ok); choose(m.id); } } }
      else if (phase === 'act' && act) {
        const a = act;
        if (a.kind === 'hero') { const P = a.P, A = P.a;
          if (a.stage === 'in') { if (a.T) A.aim = Math.atan2(a.to.x - a.from.x, a.to.z - a.from.z); if (glide(a, P, dt)) startPlay(); }
          else if (a.stage === 'play') { a.t += dt;
            if (a.tags) { const hn = A.m.state.hitN || 0; if (hn !== a.hitSeen) { a.hitSeen = hn; a.landed = true; if (A.m.state.hitName === a.anim) jesterTag(A.m.state.hitTag || ''); } }
            else while (a.hitK < a.hitsAt.length && a.t >= a.hitsAt[a.hitK]) { a.hitK++; showSome(a, a.hitK >= a.hitsAt.length ? 99 : Math.ceil(a.ev.length / (a.hitsAt.length - a.hitK + 1))); }
            if (a.t > 0.3 && !A.busy) { syncAll(); A.aim = null; if (P.id === 'jester' || P.id === 'fox') A.m.targetDist = 0; if (a.from) { a.stage = 'out'; a.g = 0; } else a.stage = 'done'; } }
          else if (a.stage === 'out') { A.aim = Math.atan2(a.from.x - a.to.x, a.from.z - a.to.z); if (glide(a, P, dt, true)) { A.aim = null; a.stage = 'done'; } }
          if (a.stage === 'done') { act = null; if (B.over) { phase = 'ending'; wait = 0.9; } else if (a.thenMenu) toMenu(); else { phase = 'wait'; wait = 0.35; } paint(); }
        } else { const f = a.f, m = f.m, p = m.root.position;
          if (a.stage === 'in') { if (glide(a, _w, dt)) { p.set(a.to.x, 0, a.to.z); foePlay(); } else p.set(_w.x, 0, _w.z); }
          else if (a.stage === 'play') { a.t += dt; if (!f.K.reach) m.root.translateZ((m.dash || 0) * dt);
            if (!a.done && a.t >= a.hitAt) { a.done = true; if (a.quiet) { const at = a.tp ? a.tp.a.anchor('head', _v) : m.anchor(f.K.top, _v); float(at, WORDS.miss, 'fate'); } showSome(a, 99); }
            if (a.t > a.dur + 0.2 && !m.busy) { syncAll(); if (a.from && !f.dying) { a.stage = 'out'; a.g = 0; } else a.stage = 'done'; } }
          else if (a.stage === 'out') { if (glide(a, _w, dt, true)) a.stage = 'done'; else p.set(_w.x, 0, _w.z); }
          if (a.stage === 'done') { p.set(f.x, 0, f.z); act = null; if (B.over) { phase = 'ending'; wait = 0.9; } else { phase = 'wait'; wait = 0.25; } paint(); }
        }
      }
      // the party: each where she is, turned as her move asks
      const mover = act && act.kind === 'hero' ? act.P : null;
      for (const id in party) { const P = party[id]; if (!P.e) continue; const walking = mover === P && (act.stage === 'in' || act.stage === 'out');
        P.a.root.position.set(P.x, 0, P.z); P.a.update(dt, t, walking); P.patch.position.set(P.x, 0.006, P.z); }
      // the foes: each faces the party (or whoever it strikes), fades when a seal takes it, goes when its last light is out
      for (const f of foes) { const m = f.m; if (!f.vis) continue; const a = act && act.kind === 'foe' && act.f === f ? act : null, p = m.root.position;
        const tx = a && a.T ? a.T.x : C[0] - 3.4, tz = a && a.T ? a.T.z : C[1] + 0.3; if (!a || a.stage !== 'play' || f.K.reach) m.root.rotation.y = Math.atan2(tx - p.x, tz - p.z);
        if (f.fade !== f.fadeTo) { f.fade += Math.sign(f.fadeTo - f.fade) * Math.min(Math.abs(f.fadeTo - f.fade), dt * 0.9); m.setFade(f.fade); }
        m.animate(0, 0, t, dt); m.patch.position.set(p.x, 0.006, p.z); m.patch.material.opacity = 0.7 * f.fade;
        if (f.dying && !m.busy) gone(f); }
      camera(dt);
      // when the camera has moved in for a move, anyone standing on the line from it to what it looks at steps out of the picture, and stays out for that shot
      { const fr = stage.free.on && !stage.free.group ? stage.free : null, a = act && act.kind ? act : null, hid = a ? (a.hid || (a.hid = new Set())) : null; if (a && !fr) hid.clear();
        const inWay = (x, z, r) => { const ax = fr.pos.x, az = fr.pos.z, bx = fr.look.x - ax, bz = fr.look.z - az, L2 = bx * bx + bz * bz || 1, k = Math.max(0, Math.min(1, ((x - ax) * bx + (z - az) * bz) / L2)); return Math.hypot(x - ax - bx * k, z - az - bz * k) < r || Math.hypot(x - ax, z - az) < 2.2; };
        for (const id in party) { const P = party[id]; if (!P.e) continue; if (fr && a && P !== a.P && P !== a.th && P !== a.tp && inWay(P.x, P.z, 0.85)) hid.add(P); const hide = !!(fr && a && hid.has(P)); P.a.root.visible = !hide; if (P.a.fx) P.a.fx.visible = !hide; P.patch.visible = !hide; }
        for (const f of foes) { if (!f.vis) continue; if (fr && a && f !== a.f && f !== a.tf && f !== a.tfo && inWay(f.x, f.z, 0.5 + f.K.r)) hid.add(f); const hide = !!(fr && a && hid.has(f)); f.m.root.visible = f.m.fx.visible = !hide; f.m.patch.visible = !hide; } }
      // the place answers a spell: it darkens, the picture shakes, and one shared light carries the spell
      const cast = mover ? mover.a : null, dk = cast ? Math.max(cast.dark, 0.55 * cast.dim) : 0; stage.dark = 1 - Math.pow(1 - 0.97 * dk, 2); stage.dim = cast ? cast.dim : 0;
      shake = Math.max(shake * Math.exp(-dt * 5), 0.7 * (cast ? cast.shake : 0)); const sp = (stage.free.on ? 85 : 16) * shake * (win ? win.w : 1) / Math.max(1, H.width()); stage.shakeX = (rnd() - 0.5) * sp; stage.shakeY = (rnd() - 0.5) * sp;
      const n0 = stage.near[0]; if (cast && cast.light) { n0.position.copy(cast.light.position); n0.color.copy(cast.light.color); n0.intensity = cast.light.intensity; n0.distance = 3.2; } else n0.intensity = 0;
      let k = 1; for (const f of foes) { if (k > 3) break; if (!f.up || !f.m.root.visible) continue; const l = stage.near[k++]; f.m.anchor('chest', l.position); l.color.setHex(f.K.light); l.distance = 3 + 1.2 * f.K.h; l.intensity = 0.5 * f.fade; }
      for (; k < 4; k++) stage.near[k].intensity = 0;
      bars(); for (const o of floats) place(o);
    },
  };
  return api;
}
