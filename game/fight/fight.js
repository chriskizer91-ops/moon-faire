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
    yourTurn: 'to move', acts: 'acts', up: 'Up', full: 'Full', miss: 'Nobody is hurt', done: 'Carry on', deity: 'The deity arrives', bloom: 'The bloom opens' };
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
  ui.innerHTML = '<div class="turnbar" aria-label="The next turns"></div><div class="title" hidden></div><div class="banner" hidden></div><div class="floats"></div><div class="bars"></div>';
  panel.innerHTML = '<p class="log" aria-live="polite"></p><div class="party"></div><div class="moves"></div><p class="help"></p>';
  const $ = (q) => ui.querySelector(q) || panel.querySelector(q), elBar = $('.turnbar'), elBanner = $('.banner'), elTitle = $('.title'), elFloats = $('.floats'), elBars = $('.bars'), elMoves = $('.moves'), elHelp = $('.help'), elLog = $('.log'), elParty = $('.party');
  function float(v, text, cls) { const p = stage.toScreen(v); if (p[0] < -999) return; const d = document.createElement('span'); d.className = 'float ' + (cls || ''); d.textContent = text; d.style.left = p[0].toFixed(0) + 'px'; d.style.top = p[1].toFixed(0) + 'px'; elFloats.appendChild(d); setTimeout(() => d.remove(), 1500); }
  function title(text) { elTitle.textContent = text; elTitle.hidden = false; clearTimeout(title.t); title.t = setTimeout(() => { elTitle.hidden = true; }, 2200); }
  const say = (t) => { elLog.textContent = t; };

  // ---------- the fight ----------
  const GEO = { pcx: 0, pcz: 0, fcx: 1, fcz: 0, ux: 1, uz: 0, D: 1, tall: 1 };
  let intro = 0;      // seconds left of a fight's opening
  let B = null, phase = 'off', act = null, cur = null, selFoe = 0, selHero = 'jester', time = 0, shake = 0, win = null, auto = null, wait = 0, O = null, onDone = null, pick = null;
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
      const d = document.createElement('button'); d.type = 'button'; d.className = 'foebar ' + kind; d.innerHTML = '<span></span><div><i class="life"></i><i class="fate"></i></div>'; d.addEventListener('click', () => tapFoe(f)); elBars.appendChild(d); f.bar = d; return f; });
    // the party looks at the foes. GEO: the middle of each side, and the way from one to the other
    { const hs = heroesE().map((e) => party[e.id]), n = hs.length, m = foes.length, G = GEO; G.pcx = hs.reduce((q, P) => q + P.x, 0) / n; G.pcz = hs.reduce((q, P) => q + P.z, 0) / n; G.fcx = foes.reduce((q, f) => q + f.x, 0) / m; G.fcz = foes.reduce((q, f) => q + f.z, 0) / m;
      G.D = Math.hypot(G.fcx - G.pcx, G.fcz - G.pcz) || 1; G.ux = (G.fcx - G.pcx) / G.D; G.uz = (G.fcz - G.pcz) / G.D; G.tall = foes.reduce((q, f) => Math.max(q, f.K.h), 0);
      for (const P of hs) { P.a.rest = Math.atan2(G.fcx - P.x, G.fcz - P.z); P.a.face = P.a.rest; } }
    if (J()) { J().arena = 9; J().game.fates = foes.map(() => null); }
    selFoe = 0; selHero = heroesE()[0].id; act = null; cur = null; pick = null; shake = 0; intro = 2.2; wait = CAMNOW() === 'directed' ? 2.5 : 1.4; phase = 'wait'; elBanner.hidden = true; elTitle.hidden = true;
    partyRows(); say((opts.label || 'A fight') + '.'); paint();
  }
  function partyRows() {
    elParty.innerHTML = '';
    for (const id of ORDER) { const P = party[id]; if (!P || !P.e) continue; const d = document.createElement('button'); d.type = 'button'; d.className = 'who'; d.innerHTML = '<b></b><span class="hpn"></span><div class="hp"><i></i></div><span class="mpn"></span>'; d.addEventListener('click', () => tapHero(P)); elParty.appendChild(d); P.row = d; }
  }

  // ---------- showing what the engine did ----------
  function killFoe(f) { if (f.dying || !f.up) return; f.dying = true; f.m.play('die', true); }
  function showFoeLife(f, life, cls) { const was = f.shown.life; f.shown.life = Math.max(0, life); if (was - f.shown.life > 0.5) { float(f.m.anchor(f.K.top, _v), '−' + num(was - f.shown.life), cls || 'dmg'); shake = Math.max(shake, 0.35); if (f.shown.life <= 0.5) killFoe(f); else if (!f.dying) f.m.play('hurt', true); } }
  function showHeroHp(P, hp) { const was = P.shown.hp, a = P.a; P.shown.hp = Math.max(0, Math.min(P.e.max, hp));
    if (was - P.shown.hp > 0.5) { float(a.anchor('head', _v), '−' + num(was - P.shown.hp), 'dmg'); shake = Math.max(shake, 0.5); if (P.shown.hp <= 0.5) a.down(true); else a.hit(was - P.shown.hp > 0.2 * P.e.max); }
    else if (P.shown.hp - was > 0.5) { if (was <= 0.5) a.down(false); float(a.anchor('head', _v), '+' + num(P.shown.hp - was), 'heal'); } }
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
    phase = 'menu'; pick = null; wait = 0.7; say(cur.a.name + ' ' + WORDS.yourTurn + '.');
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
  function tapFoe(f) { if (phase !== 'menu' || !f.up) return; selFoe = f.i; if (pick && pick.kind === 'foe' && pick.ok.indexOf(f) >= 0) { const id = pick.id; pick = null; choose(id, f.e.id); } else paint(); }
  function tapHero(P) { if (phase !== 'menu') return; selHero = P.id; if (pick && pick.kind === 'hero' && pick.ok.indexOf(P.id) >= 0) { const id = pick.id; pick = null; choose(id, P.id); } else paint(); }
  function press(m) {                                      // a move button: moves aimed at a friend ask who; moves aimed at a foe use the foe that is marked (tap a foe's bar to mark another)
    if (!m.ok) return;
    if (m.target === 'hero' || m.target === 'fallen') { const ok = E.targetsFor(B, cur.e, m.id).map((e) => e.id); if (ok.length > 1) { pick = { id: m.id, kind: 'hero', ok }; elHelp.textContent = m.label + ': choose a friend above.'; paint(true); return; } }
    if (m.target === 'marked' || m.target === 'sealed') { const ok = E.targetsFor(B, cur.e, m.id).map((e) => foeOf(e.id)); if (ok.length > 1 && ok.indexOf(foes[selFoe]) < 0) { pick = { id: m.id, kind: 'foe', ok }; elHelp.textContent = m.label + ': choose one of the lit foes.'; paint(true); return; } }
    choose(m.id);
  }
  function paint(keepHelp) {
    if (!B) return;
    for (const e of heroesE()) { const P = party[e.id], d = P.row; if (!d) continue; d.children[0].textContent = P.a.name; d.children[1].textContent = num(P.shown.hp) + ' / ' + num(e.max); d.children[2].firstChild.style.width = (100 * P.shown.hp / e.max).toFixed(1) + '%';
      d.children[3].textContent = e.mpMax ? P.shown.mp + ' MP' : (e.id === 'ranger' && B.gem > 0 ? 'gem in ' + B.gem : ''); if (e.id === 'jester' && B.taunt > 0) d.children[3].textContent += ' · catching ' + B.taunt;
      d.classList.toggle('now', phase === 'menu' && cur === P); d.classList.toggle('down', P.shown.hp <= 0.5); d.classList.toggle('pick', !!(pick && pick.kind === 'hero' && pick.ok.indexOf(e.id) >= 0)); }
    elBar.innerHTML = ''; if (phase !== 'over') for (const b of E.bar(B)) { const c = document.createElement('span'); c.className = 'chip ' + b.u.side + (b.move && b.move !== 'blow' ? ' marked' : ''); c.textContent = b.u.name + (b.move && b.move !== 'blow' ? ' · ' + b.move : ''); elBar.appendChild(c); }
    if (elBar.firstChild && phase === 'menu') elBar.firstChild.classList.add('now');
    elMoves.innerHTML = ''; if (!keepHelp) elHelp.textContent = '';
    if (phase === 'menu' && cur) for (const m of E.heroMoves(B, cur.e)) { const b = document.createElement('button'); b.type = 'button'; b.textContent = m.label + (m.mp ? ' · ' + m.mp + ' MP' : ''); b.disabled = !m.ok; b.title = m.ok ? m.help : m.why; b.dataset.id = m.id; if (pick && pick.id === m.id) b.className = 'on';
      b.addEventListener('click', () => press(m)); const tip = () => { if (!pick) elHelp.textContent = m.ok ? m.help : m.why + '. ' + m.help; }; b.addEventListener('pointerenter', tip); b.addEventListener('focus', tip); elMoves.appendChild(b); }
    ui.classList.toggle('picking', phase === 'menu' && upFoes().length > 1);
  }
  function bars() {
    const m = J(), put = [];
    for (const f of foes) { const d = f.bar, on = f.up && phase !== 'off' && !f.dying; d.hidden = !on; if (!on) { if (m) m.game.fates[f.i] = null; continue; }
      const p = stage.toScreen(_v.set(f.m.root.position.x, f.K.bar, f.m.root.position.z)); let y = p[1]; for (let k = 0; k < 6 && put.some((q) => Math.abs(q[0] - p[0]) < 96 && Math.abs(q[1] - y) < 30); k++) y -= 30;      // two bars never sit on each other
      put.push([p[0], y]); d.style.left = p[0].toFixed(0) + 'px'; d.style.top = y.toFixed(0) + 'px';
      const life = f.shown.life, Lk = life / f.shown.max, Fk = Math.min(Lk, f.shown.fate / f.shown.max), sealedNow = life > 0 && f.shown.fate > 0 && f.shown.fate >= life;
      d.classList.toggle('sealed', sealedNow); d.classList.toggle('tgt', phase === 'menu' && f.i === selFoe); d.classList.toggle('pick', !!(pick && pick.kind === 'foe' && pick.ok.indexOf(f) >= 0));
      d.firstChild.textContent = f.e.name + (sealedNow ? ' · ' + WORDS.sealed : '') + (f.e.conf > 0 ? ' · lost' : '') + (f.e.cloth ? ' · cut' : ''); d.lastChild.children[0].style.width = (100 * Lk).toFixed(1) + '%'; d.lastChild.children[1].style.width = (100 * Fk).toFixed(1) + '%';
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
  const CAMNOW = () => (H.cam ? H.cam() : 'directed'), SIDE = (ux, uz) => (ux >= 0 ? [-uz, ux] : [uz, -ux]);      // SIDE: the way across a line, on the audience's side of it
  const ease = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }, mix = (p, q, k) => p + (q - p) * k, DEG = Math.PI / 180;
  const swing = (cx, cz, ux, uz, phi, R) => { const sd = SIDE(ux, uz), c = Math.cos(phi), n = Math.sin(phi); return [cx - ux * R * c + sd[0] * R * n, cz - uz * R * c + sd[1] * R * n]; };
  // 'directed' (Chris, November 14, 7:26 pm: "behind the party with a wider angle ... director decisions"). The decisions:
  //   1. Every fight opens on the painting, sharp and side on, for two seconds while the foes arrive. Then it cuts behind the party.
  //   2. The resting view is wide: behind the party and off to the audience's side, high enough to see all four witches whole and every foe.
  //   3. A plain move stays in that wide view, with a slow push in. Nothing cuts.
  //   4. A big move earns its own shot, the swing: a witch's spells that are named in BIG, and a foe's Heavy, Crush or Eclipse.
  //   5. A won fight ends on the party's bow, seen from the foes' side.
  const BIG = { g_seal: 1, g_curtain: 1, taunt_heal: 1, shots: 1, moons_little_lie: 1, crazy_quilt: 1, same_cloth: 1, borrowed_face: 1, guardian: 1, revive: 1, garden: 1 };
  const REAR = (c) => c === 'behind' || c === 'directed';
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
    if (REAR(CAM)) { shot = behindShot(a, playing, asp); if (!shot) { const all = []; for (const id in party) if (party[id].e) heroPts(party[id], all); for (const f of foes) if (f.vis) foePts(f, all); frame(all, 1.08, 1.16, 0.4, 0.1); } }      // no shot: the fight's opening, on the sharp painting
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
    key(k) { if (phase !== 'menu') return false; if (k === 'Tab') { const up = upFoes().map((f) => f.i); if (up.length) { selFoe = up[(up.indexOf(selFoe) + 1) % up.length]; paint(); } return true; } const b = elMoves.children[+k - 1]; if (b && !b.disabled) { b.click(); return true; } return false; },
    // start a fight: { place (one of MF_PLACES), foes: ['wisp', 'wraith', 'great', ...], gap, foeLevel, seed, party: { jester: { hp, mp }, ... }, label, tag }; done(result) is called when the player leaves the result
    enter(opts, done) { onDone = done || null; api.result = null; group.visible = true; ui.hidden = false; panel.hidden = false; begin(opts); },
    leave() { group.visible = false; ui.hidden = true; panel.hidden = true; phase = 'off'; act = null; stage.free.on = false; for (const l of stage.near) l.intensity = 0; stage.dark = stage.dim = 0; stage.shakeX = stage.shakeY = 0; stage.catcher.scale.set(1, 1, 1);
      for (const id in party) { const P = party[id]; P.patch.visible = false; if (P.a.m.stop) P.a.m.stop(); } for (const k in pool) for (const m of pool[k]) { m.patch.visible = false; m.inUse = false; } },
    step(dt, t) {
      if (phase === 'off' || !B) return; time = t; intro = Math.max(0, intro - dt);
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
        const inWay = (x, z, r) => { const ax = fr.pos.x, az = fr.pos.z, bx = fr.look.x - ax, bz = fr.look.z - az, L2 = bx * bx + bz * bz || 1, k = Math.max(0, Math.min(1, ((x - ax) * bx + (z - az) * bz) / L2)); return Math.hypot(x - ax - bx * k, z - az - bz * k) < r || Math.hypot(x - ax, z - az) < 1.5; };
        for (const id in party) { const P = party[id]; if (!P.e) continue; if (fr && a && P !== a.P && P !== a.th && P !== a.tp && inWay(P.x, P.z, 0.85)) hid.add(P); const hide = !!(fr && a && hid.has(P)); P.a.root.visible = !hide; if (P.a.fx) P.a.fx.visible = !hide; P.patch.visible = !hide; }
        for (const f of foes) { if (!f.vis) continue; if (fr && a && f !== a.f && f !== a.tf && f !== a.tfo && inWay(f.x, f.z, 0.5 + f.K.r)) hid.add(f); const hide = !!(fr && a && hid.has(f)); f.m.root.visible = f.m.fx.visible = !hide; f.m.patch.visible = !hide; } }
      // the place answers a spell: it darkens, the picture shakes, and one shared light carries the spell
      const cast = mover ? mover.a : null, dk = cast ? Math.max(cast.dark, 0.55 * cast.dim) : 0; stage.dark = 1 - Math.pow(1 - 0.97 * dk, 2); stage.dim = cast ? cast.dim : 0;
      shake = Math.max(shake * Math.exp(-dt * 5), 0.7 * (cast ? cast.shake : 0)); const sp = 16 * shake * (win ? win.w : 1) / Math.max(1, H.width()); stage.shakeX = (rnd() - 0.5) * sp; stage.shakeY = (rnd() - 0.5) * sp;
      const n0 = stage.near[0]; if (cast && cast.light) { n0.position.copy(cast.light.position); n0.color.copy(cast.light.color); n0.intensity = cast.light.intensity; n0.distance = 3.2; } else n0.intensity = 0;
      let k = 1; for (const f of foes) { if (k > 3) break; if (!f.up || !f.m.root.visible) continue; const l = stage.near[k++]; f.m.anchor('chest', l.position); l.color.setHex(f.K.light); l.distance = 3 + 1.2 * f.K.h; l.intensity = 0.5 * f.fade; }
      for (; k < 4; k++) stage.near[k].intensity = 0;
      bars();
    },
  };
  return api;
}
