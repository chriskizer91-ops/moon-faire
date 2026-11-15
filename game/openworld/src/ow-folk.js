// ow-folk.js: the fair folk in the open world: their minds (people/talk/minds.js) and what they say (people/talk/talk.js, lines.js).
// ow-main.js calls in at five places: start, step, lines (when she talks to someone), line and ended, and place (the small bubbles).
// Everything about the evening that the talk leans on (the stage, lamps home, the party's level, a fight won or lost) is set here from the
// menu's "The evening" rows for now. The story (task board S1) and the fights (F6) will set the same things by the same calls:
//   OW.folk.evening({ stage, lamps, level, hurt })   OW.folk.happened('won' | 'lost' | 'lamp')   MF_TALK.news(id, whoSawIt)   MF_TALK.find(code)   MF_TALK.errand(name, 'open' | 'done')
(function () {
  'use strict';
  const OW = window.OW, $ = (id) => document.getElementById(id);
  const TALK = window.MF_TALK, LINES = window.MF_LINES;
  if (!OW || !TALK || !window.MF_MINDS) return;
  if (LINES) TALK.use(LINES);
  const SAW = { 1: ['lamps-gone', ['gate-keeper', 'chestnut-roaster', 'captain']], 3: ['stitched', ['gate-keeper', 'chestnut-roaster', 'captain']] };      // what each stage has shown, and to whom
  let C = null, minds = null, bark = null, queue = [], labels = [], showMinds = false; const v3 = new THREE.Vector3();
  const eve = { stage: 0, lamps: 0, level: 1, hurt: false };
  const EARSHOT = 13;

  // ---- the small bubble: something called out as she passes, or overheard between two of them ----
  function showBark(p, text, opt) { const e = $('bark'); if (!e) return; bark = { p, t: Math.max(2.4, text.length / 13) + (opt && opt.extra || 0), pair: opt && opt.pair }; $('barkline').textContent = text; e.classList.toggle('over', !!(opt && opt.pair)); e.hidden = false; bark.w = e.offsetWidth; bark.h = e.offsetHeight; if (p.npc && !(opt && opt.quiet)) p.npc.talk(true); }
  function hideBark() { if (!bark) return; if (bark.p.npc && !bark.held) bark.p.npc.talk(false); bark = null; const e = $('bark'); if (e) e.hidden = true; }
  function placeBark() {
    if (!bark) return; const e = $('bark'), p = bark.p, W = C.canvas.clientWidth, H = C.canvas.clientHeight;
    if (p.npc && p.npc.headTop) p.npc.headTop(v3); else v3.set(p.x, (p.root ? p.root.position.y : p.y) + 2.2, p.z);
    v3.project(C.camera()); if (v3.z > 1) { e.style.visibility = 'hidden'; return; } e.style.visibility = '';
    const x = Math.max(8, Math.min(W - bark.w - 8, (v3.x + 1) / 2 * W - bark.w / 2)), y = Math.max(58, Math.min(H - bark.h - 40, (1 - v3.y) / 2 * H - bark.h - 16));
    e.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)';
    $('barktail').style.left = Math.max(14, Math.min(bark.w - 14, (v3.x + 1) / 2 * W - x)) + 'px';
  }
  const dHer = (p) => Math.hypot(p.x - C.me.x, p.z - C.me.z);

  // ---- what people are up to, in plain words (the menu's "Show what people are doing") ----
  const short = (p) => p.name.replace(/^The /, 'the ');
  function words(p) {
    const m = minds && minds.mind(p); if (!m) return '';
    if (m.held) return 'talking with her';
    if (m.partner) return 'talking with ' + short(m.partner.p);
    const go = m.phase === 'go';
    return { work: go ? 'going back to work' : 'at work', rest: go ? 'going to sit down' : 'resting', warm: go ? 'going to warm up' : 'warming up', visit: 'going to see ' + (m.goal && m.goal.friend ? short(m.goal.friend.p) : 'a friend'), stroll: go ? 'taking a turn' : 'looking about', watch: go ? 'going to look east' : 'watching the east', round: go ? 'on the round' : 'checking a lamp' }[m.act] || '';
  }
  function placeLabels() {
    const box = $('minds'); if (!box) return; let n = 0;
    if (showMinds && minds) for (const p of C.places.people) {
      if (!p.mind || dHer(p) > 40) continue; if (p.npc.headTop) p.npc.headTop(v3); v3.y += 0.18; v3.project(C.camera()); if (v3.z > 1 || Math.abs(v3.x) > 1.1) continue;
      let e = labels[n]; if (!e) { e = document.createElement('span'); box.appendChild(e); labels.push(e); } n++;
      const t = words(p); if (e._t !== t) { e._t = t; e.textContent = t; } e.hidden = false; e.style.transform = 'translate3d(' + Math.round((v3.x + 1) / 2 * C.canvas.clientWidth) + 'px,' + Math.round((1 - v3.y) / 2 * C.canvas.clientHeight) + 'px,0) translate(-50%,-100%)';
    }
    for (let i = n; i < labels.length; i++) labels[i].hidden = true;
  }

  const api = OW.folk = {
    start(ctx) {
      C = ctx;
      minds = window.MF_MINDS.make({
        walk: ctx.ground, height: ctx.height, fires: ctx.places.fires, lamps: ctx.places.lamps,
        her: () => ctx.me, bodies: () => ctx.others,
        seat(x, z, face) {                                               // a small crate to sit on, in the kit's own painted wood
          if (!OW.kit || !OW.kit.crate || !window.OW_DATA.kit) return;
          try { OW.kit.crate({ x, z, y: ctx.height(x, z), turn: face * 180 / Math.PI, w: 0.52, d: 0.46, h: 0.43 }); const out = OW.kit.flush(ctx.scene, { sat: 0.84 }); if (out) ctx.block({ x, z, r: 0.3 }); } catch (e) { console.warn('no seat', e); }
        },
      });
      minds.on.notice = (p) => {                                         // someone has seen her go by: a look, a wave if they know her, and now and then a word
        if (ctx.talking() || bark) return;
        const ln = LINES ? TALK.bark(p.id, { doing: minds.doing(p), where: p.place }) : null;
        if (ln) showBark(p, ln.text); else if (TALK.talks(p.id) > 0 && p.npc && Math.random() < 0.5) p.npc.emote(p.npc.wiring && p.npc.wiring.greet || 'wave');
      };
      minds.on.blocked = (p) => { if (p.npc && !bark) p.npc.emote('beckon'); };
      minds.on.pair = (a, b) => {                                        // two have met. If she is near enough to hear, they have words; either way the news passes
        if (!LINES) return;
        if (ctx.talking() || bark || Math.min(dHer(a), dHer(b)) > EARSHOT) { TALK.gossip(a.id, b.id); return; }
        const pr = TALK.pair(a.id, b.id); if (!pr) return;
        minds.script(a, b, true); queue = pr.lines.map((l) => ({ p: l.by === a.id ? a : b, o: l.by === a.id ? b : a, text: l.text, a, b }));
      };
      api.evening(eve);
      wireMenu();
    },
    // every frame, before the people's own update
    step(dt, talkingTo) {
      if (!minds) return;
      TALK.tick(dt);
      for (const p of C.places.people) { if (p.npc && !p.mind) p.mind = minds.add(p); }
      minds.step(dt);
      if (bark) { bark.t -= dt; if (bark.t <= 0 || talkingTo) { const was = bark; hideBark(); if (was.pair && !queue.length) { minds.script(was.pair[0], was.pair[1], false); } } }
      if (!bark && queue.length) {
        const q = queue.shift(), ok = !talkingTo && q.p.mind && q.p.mind.partner && Math.min(dHer(q.a), dHer(q.b)) < EARSHOT * 1.4;
        if (ok) { showBark(q.p, q.text, { pair: [q.a, q.b], extra: 0.3 }); if (q.o.npc) q.o.npc.talk(false); } else { queue = []; minds.script(q.a, q.b, false); }
      }
    },
    place() { placeBark(); placeLabels(); },
    // she talks to someone: their lines for this talk, or null to use the place's own old lines
    lines(w) {
      if (!LINES || !LINES.people[w.id]) return null;
      if (bark) hideBark(); queue = [];
      const L = TALK.talk(w.id, { doing: minds && w.mind ? minds.doing(w) : ['work', 'walk', 'watch'][Math.floor(Math.random() * 3)], where: w.place });      // someone with no mind yet (the captain's stand-in) is taken to be about one of their usual things
      if (minds && w.mind) minds.hold(w, true);
      return L.length ? L : null;
    },
    line(w, ln) { if (ln && ln.emote && w.npc) w.npc.emote(ln.emote); },
    ended(w) { if (minds && w.mind) minds.hold(w, false); },
    evening(o) {
      Object.assign(eve, o); eve.stage = Math.max(0, Math.min(5, eve.stage)); eve.level = Math.max(1, Math.min(20, eve.level));
      if (eve.stage < 1) eve.lamps = 0; else if (eve.stage === 2) eve.lamps = Math.max(1, Math.min(11, eve.lamps)); else if (eve.stage >= 3) eve.lamps = 12; else eve.lamps = 0;
      TALK.set(eve); for (const s in SAW) if (eve.stage >= +s) TALK.news(SAW[s][0], SAW[s][1]);
      if (minds) minds.set(eve); showEvening();
    },
    happened(what) { TALK.event(what); eve.lamps = TALK.state.lamps; if (what === 'lamp') api.evening({ stage: eve.lamps >= 12 ? 3 : Math.max(2, eve.stage), lamps: eve.lamps }); },
    get minds() { return minds; }, words,
  };

  // ---- the menu's rows for trying the talk before the story and the fights are joined on ----
  const NAMES = ['Dusk: the flames lean', 'The twelve lamps have flown', 'Lamps are coming home', 'All twelve home and sewn down', 'The four are on the crag', 'After the end'];
  function showEvening() {
    if (!$('evestage')) return;
    $('evestage').value = eve.stage; $('evelampsv').textContent = eve.lamps + ' of 12'; $('evelamps').value = eve.lamps; $('evelamps').disabled = eve.stage !== 2; $('evelevelv').textContent = eve.level; $('evelevel').value = eve.level; $('evehurt').setAttribute('aria-pressed', eve.hurt);
  }
  function wireMenu() {
    if (!$('evestage')) return;
    $('evestage').innerHTML = NAMES.map((n, i) => '<option value="' + i + '">' + n + '</option>').join('');
    $('evestage').addEventListener('change', (e) => api.evening({ stage: +e.target.value, lamps: +e.target.value === 2 ? Math.max(1, eve.lamps) : eve.lamps }));
    $('evelamps').addEventListener('input', (e) => { const n = +e.target.value; if (n > eve.lamps) for (let i = eve.lamps; i < n; i++) TALK.event('lamp'); TALK.state.lamps = n; api.evening({ lamps: n }); });
    $('evelevel').addEventListener('input', (e) => api.evening({ level: +e.target.value }));
    $('evehurt').addEventListener('click', () => api.evening({ hurt: !eve.hurt }));
    $('evewon').addEventListener('click', () => { api.happened('won'); flash('evewon'); });
    $('evelost').addEventListener('click', () => { api.happened('lost'); flash('evelost'); });
    $('mindsw').addEventListener('click', () => { showMinds = !showMinds; $('mindsw').setAttribute('aria-pressed', showMinds); });
    showEvening();
  }
  function flash(id) { const e = $(id); e.classList.add('did'); setTimeout(() => e.classList.remove('did'), 900); }
})();
