// walk-main.js: the walk-through page. The Jester (at her Lightest weight, as Chris chose for walking) walks all nine painted places.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id), QS = new URLSearchParams(location.search), DATA = window.MF_WORLD;
  const canvas = $('stage'), box = $('stagebox'), err = $('err'), loading = $('loading'), fadeEl = $('fade');
  let stage, world, J = null, time = 0, last = performance.now(), cardGo = null, cardT = 0;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const H = {
    aspect: () => canvas.clientWidth / Math.max(1, canvas.clientHeight), size: () => [canvas.clientWidth, canvas.clientHeight], close: () => +$('size').value || 1,
    toast(t) { const e = $('toast'); e.textContent = t; e.hidden = false; clearTimeout(H._t); H._t = setTimeout(() => { e.hidden = true; }, 4200); },
    prompt(t) { const e = $('prompt'); if (e._t !== t) { e._t = t; e.hidden = !t; e.querySelector('span').textContent = t; } },
    say(name, line, i, n) { const e = $('say'); if (!name) { e.hidden = true; return; } e.hidden = false; $('sayname').textContent = name; $('sayline').textContent = line; $('saynext').textContent = i + 1 < n ? 'Next (' + (i + 1) + ' of ' + n + ')' : 'Done'; },
    fade(on) { fadeEl.classList.toggle('on', !!on); },
    // a story picture shown on its own, with one line of words, on the way from one place to another
    card(c, then) { $('cardimg').src = DATA.cards[c.art]; $('cardline').textContent = c.line; $('card').hidden = false; H.fade(false); cardGo = then; clearTimeout(cardT); cardT = setTimeout(H.cardDone, 6000); },
    cardDone() { if (!cardGo) return; const g = cardGo; cardGo = null; clearTimeout(cardT); H.fade(true); setTimeout(() => { $('card').hidden = true; g(); }, 260); },
    place(P) {
      const L = P.L; $('place').textContent = P.id + '  ' + P.M.name; $('jump').value = P.id;
      for (const b of document.querySelectorAll('#mappins button')) b.setAttribute('aria-current', b.dataset.id === P.id);
      const ppl = P.people.map((p) => '<li><b>' + esc(p.name) + '</b>' + (p.standIn ? ' <span class="muted">(his model is not built yet: a grey stand-in)</span>' : '') + '</li>').join('');
      const hap = (L.happens || []).map((h) => '<li><b>' + esc(h.code) + '</b> ' + esc(h.title) + ' <span class="muted">(' + esc(h.kind) + (h.witch ? ', ' + esc(h.witch) : '') + ')</span></li>').join('');
      $('here').innerHTML = '<h2>' + esc(P.M.name) + '</h2><p class="muted">' + esc(L.light || '') + '</p>' + (ppl ? '<p><b>Who is here</b></p><ul>' + ppl + '</ul>' : '<p class="muted">Nobody stands here.</p>') +
        (hap ? '<details><summary>What the map says can happen here (none of it plays yet)</summary><ul>' + hap + '</ul></details>' : '') + (P.M.traced ? '<p class="muted">Walking paths: traced by you in the map editor.</p>' : '<p class="muted">Walking paths: the starting shapes, not yet traced in the map editor.</p>');
    },
  };
  function fail(e) { err.hidden = false; err.textContent = 'This page needs WebGL to draw. ' + (e && e.message ? e.message : ''); loading.hidden = true; }

  const meter = { n: 0, t: 0, real: 0, upd: 0, drw: 0 };
  function advance(dt, draw) {
    time += dt; const a = performance.now(); stage.resize(); world.step(dt, time);
    const b = performance.now(); if (draw) stage.render(); const c = performance.now();
    meter.n++; meter.t += dt; meter.upd += b - a; meter.drw += c - b;
    if (meter.t >= 0.5) { const i = stage.info(); $('meter').textContent = Math.round(meter.n / (meter.real || meter.t)) + ' pictures a second · ' + Math.round(i.triangles / 1000) + 'k triangles · ' + i.calls + ' draws · moving ' + (meter.upd / meter.n).toFixed(1) + ' ms · drawing ' + (meter.drw / meter.n).toFixed(1) + ' ms'; meter.n = 0; meter.t = 0; meter.real = 0; meter.upd = 0; meter.drw = 0; }
  }
  let manual = /[?&]shot/.test(location.search);
  function frame(now) { requestAnimationFrame(frame); if (manual || !world) return; const real = (now - last) / 1000, dt = Math.min(0.05, real); last = now; meter.real += real; advance(dt, true); }

  function start() {
    try {
      if (!window.THREE) throw new Error('three.js did not load');
      stage = makeMFStage(canvas, { preserve: manual, shadow: 2048 }); stage.painting = true;
      const ids = Object.keys(DATA.art); let left = ids.length;
      const ready = () => { if (--left) return; try {
        J = window.WITCH_LOD.make('lightest', { treadmill: false }); J.fx.remove(J.spellLight); stage.cast.add(J.root, J.fx); J.camera = stage.camera;
        const w = makeMFWorld(stage, DATA, H); w.enter(J, DATA.maps[QS.get('at')] ? QS.get('at') : 'W1'); world = w; advance(0, true);
        loading.hidden = true; last = performance.now(); requestAnimationFrame(frame); window.MF.ready = true; } catch (e) { fail(e); } };
      for (const id of ids) stage.loadArt(id, DATA.art[id], ready);
    } catch (e) { fail(e); }
  }
  const S = window.MeshoptSimplifier; if (S && S.ready && S.ready.then) S.ready.then(start, start); else start();

  // ---- the page's own parts ----
  $('jump').innerHTML = DATA.order.map((id) => '<option value="' + id + '">' + id + '  ' + esc(DATA.maps[id].name) + '</option>').join('');
  $('mapimg').src = DATA.mapArt;
  $('mappins').innerHTML = DATA.order.map((id) => { const p = DATA.pins[id]; return '<button type="button" data-id="' + id + '" style="left:' + (p[0] * 100).toFixed(2) + '%;top:' + (p[1] * 100).toFixed(2) + '%" title="' + esc(DATA.maps[id].name) + '">' + id + '</button>'; }).join('');
  if (window.innerWidth < 700) $('size').value = '1.6';      // a phone held upright: closer, or she is too small to read
  const jump = (id) => { $('mapbox').hidden = true; if (world && id !== world.id) world.jump(id); };
  $('jump').addEventListener('change', () => jump($('jump').value));
  $('mappins').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) jump(b.dataset.id); });
  $('mapbtn').addEventListener('click', () => { $('mapbox').hidden = !$('mapbox').hidden; });
  $('mapclose').addEventListener('click', () => { $('mapbox').hidden = true; });
  $('use').addEventListener('click', () => world && world.act());
  $('saynext').addEventListener('click', () => world && world.act());
  $('card').addEventListener('click', () => H.cardDone());
  $('flipsw').addEventListener('click', () => { const on = !stage.flip.on; stage.flip.on = on; stage.flip.rows = 1440; stage.flip.snap = 1; stage.flip.painting = 'own'; $('flipsw').setAttribute('aria-pressed', on); });
  $('full').addEventListener('click', () => { try { const p = document.fullscreenElement ? document.exitFullscreen() : box.requestFullscreen(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not allowed here */ } });
  const KEY = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ShiftLeft: 'run', ShiftRight: 'run' };
  addEventListener('keydown', (e) => {
    if (!world || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (!$('card').hidden) { H.cardDone(); e.preventDefault(); return; }
    if (KEY[e.code]) { world.keys[KEY[e.code]] = true; e.preventDefault(); } else if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') { world.act(); e.preventDefault(); } else if (e.code === 'KeyM') $('mapbox').hidden = !$('mapbox').hidden;
  });
  addEventListener('keyup', (e) => { if (world && KEY[e.code]) world.keys[KEY[e.code]] = false; });
  addEventListener('blur', () => { if (world) for (const k in world.keys) world.keys[k] = false; });
  canvas.addEventListener('pointerdown', (e) => { if (!world) return; const r = canvas.getBoundingClientRect(); world.pointer(e.clientX - r.left, e.clientY - r.top); });
  // for checking: step the page by hand (?shot=1)
  window.MF = { get stage() { return stage; }, get world() { return world; }, get J() { return J; }, H, set manual(v) { manual = !!v; }, step(dt, n) { for (let i = 0; i < (n || 1); i++) advance(dt, i === (n || 1) - 1); }, ready: false };
})();
