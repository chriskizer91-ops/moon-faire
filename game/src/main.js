// main.js: the pilot page. Two things to try, each on one of Chris's two pilot paintings: walking the fair square, and a
// fight in the moor clearing. The Jester is the only finished witch, so she stands in for the party.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id), QS = new URLSearchParams(location.search);
  const canvas = $('stage'), box = $('stagebox'), err = $('err'), loading = $('loading'), fadeEl = $('fade');
  const PLAN = { walk: 'trim', fight: 'light' };                    // Chris's plan: Trim for walking, Light in fights, Full for close shots
  let stage, field, fight, mode = '', J = null, level = '', time = 0, last = performance.now(), busy = false;
  const made = {}, sw = { live: true, close: true, painting: true };
  const H = {
    ui: $('fightui'), panel: $('fightpanel'),
    aspect: () => canvas.clientWidth / Math.max(1, canvas.clientHeight), width: () => canvas.clientWidth,
    liveOn: () => sw.live, closeOn: () => sw.close, close: () => +$('size').value || 0,
    toast(t) { const e = $('toast'); e.textContent = t; e.hidden = false; clearTimeout(H._t); H._t = setTimeout(() => { e.hidden = true; }, 4200); },
    prompt(t) { const e = $('prompt'); if (e._t !== t) { e._t = t; e.hidden = !t; e.querySelector('span').textContent = t; } },
  };
  function fail(e) { err.hidden = false; err.textContent = 'This page needs WebGL to draw. ' + (e && e.message ? e.message : ''); loading.hidden = true; }

  // one model, several weights: build a weight the first time it is asked for, and show only one of them
  function witch(lv) {
    if (!made[lv]) { const j = window.WITCH_LOD.make(lv, { treadmill: false }); j.fx.remove(j.spellLight); stage.cast.add(j.root, j.fx); j.camera = stage.camera; made[lv] = j; }
    for (const k in made) { const on = k === lv; made[k].root.visible = on; made[k].fx.visible = on; }
    level = lv; J = made[lv]; return J;
  }
  function free(keep) { for (const k in made) if (keep.indexOf(k) < 0) { const j = made[k]; stage.cast.remove(j.root, j.fx); j.root.traverse((m) => { if (m.geometry) m.geometry.dispose(); }); for (const t of j.debug.textures || []) t.dispose(); delete made[k]; } }
  const pick = () => { const v = $('detail').value; return v === 'plan' ? PLAN[mode] : v; };

  function setMode(m, quick) {
    if (busy || m === mode) return; busy = true; fadeEl.classList.add('on');
    setTimeout(() => {
      try {
        if (mode === 'walk') field.leave(); if (mode === 'fight') fight.leave();
        mode = m; witch(pick()); free([PLAN.walk, PLAN.fight, level]);
        if (m === 'walk') field.enter(J); else fight.enter(J, +$('count').value || 1);
        for (const b of document.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', b.dataset.mode === m);
        $('walkrow').hidden = m !== 'walk'; $('sizelab').hidden = m !== 'walk'; $('fightrow').hidden = m !== 'fight'; $('closesw').hidden = m !== 'fight'; $('livesw').hidden = m !== 'walk';
        H.prompt(''); stage.painting = sw.painting; advance(0, true);
      } catch (e) { fail(e); }
      busy = false; fadeEl.classList.remove('on');
    }, quick ? 0 : 260);
  }

  // ---- the loop ----
  const meter = { n: 0, t: 0, real: 0, upd: 0, drw: 0 };      // real: time by the clock, so a slow machine's count is honest
  function advance(dt, draw) {
    time += dt; const a = performance.now();
    stage.resize();
    if (mode === 'walk') field.step(dt, time); else if (mode === 'fight') fight.step(dt, time);
    const b = performance.now(); if (draw) stage.render(); const c = performance.now();
    meter.n++; meter.t += dt; meter.upd += b - a; meter.drw += c - b;
    if (meter.t >= 0.5) { const i = stage.info(); $('meter').textContent = Math.round(meter.n / (meter.real || meter.t)) + ' pictures a second · ' + Math.round(i.triangles / 1000) + 'k triangles · ' + i.calls + ' draws · moving her ' + (meter.upd / meter.n).toFixed(1) + ' ms · drawing ' + (meter.drw / meter.n).toFixed(1) + ' ms · ' + level; meter.n = 0; meter.t = 0; meter.real = 0; meter.upd = 0; meter.drw = 0; }
  }
  let manual = /[?&]shot/.test(location.search);
  function frame(now) { requestAnimationFrame(frame); if (manual || !mode) return; const real = (now - last) / 1000, dt = Math.min(0.05, real); last = now; meter.real += real; advance(dt, true); }

  // ---- start ----
  function start() {
    try {
      if (!window.THREE) throw new Error('three.js did not load');
      stage = makeMFStage(canvas, { preserve: manual, shadow: 2048 });
      field = makeMFField(stage, window.MF_SCENES.W1, H); fight = makeMFFight(stage, window.MF_SCENES.F1, H);
    } catch (e) { return fail(e); }
    let left = 2; const ready = () => { if (--left) return; try { setMode(QS.get('mode') === 'fight' ? 'fight' : 'walk', true); loading.hidden = true; last = performance.now(); requestAnimationFrame(frame); window.MF.ready = true; } catch (e) { fail(e); } };
    stage.loadArt('W1', window.MF_ART.W1, ready); stage.loadArt('F1', window.MF_ART.F1, ready);
  }
  const S = window.MeshoptSimplifier; if (S && S.ready && S.ready.then) S.ready.then(start, start); else start();

  // ---- buttons and keys ----
  for (const b of document.querySelectorAll('[data-mode]')) b.addEventListener('click', () => setMode(b.dataset.mode));
  for (const b of document.querySelectorAll('[data-act]')) b.addEventListener('click', () => { if (mode === 'walk') field.play(b.dataset.act); });
  $('use').addEventListener('click', () => field.act());
  const flip = (id, key, fn) => $(id).addEventListener('click', () => { sw[key] = !sw[key]; $(id).setAttribute('aria-pressed', sw[key]); if (fn) fn(); });
  flip('livesw', 'live'); flip('closesw', 'close'); flip('paintsw', 'painting', () => { stage.painting = sw.painting; });
  $('detail').addEventListener('change', () => { if (!mode || busy) return; const m = mode; mode = ''; if (m === 'walk') field.leave(); else fight.leave(); busy = false; setMode(m); });
  $('again').addEventListener('click', () => { if (mode === 'fight') fight.begin(+$('count').value || 1); });
  $('count').addEventListener('change', () => { if (mode === 'fight') fight.begin(+$('count').value || 1); });
  $('auto').addEventListener('change', () => fight.setAuto($('auto').value));
  $('full').addEventListener('click', () => { try { const p = document.fullscreenElement ? document.exitFullscreen() : box.requestFullscreen(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not allowed here */ } });
  const KEY = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ShiftLeft: 'run', ShiftRight: 'run' };
  addEventListener('keydown', (e) => {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (mode === 'walk') { if (KEY[e.code]) { field.keys[KEY[e.code]] = true; e.preventDefault(); } else if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') { field.act(); e.preventDefault(); } }
    else if (mode === 'fight') { if (e.code === 'Tab' ? fight.key('Tab') : /^Digit[1-9]$/.test(e.code) && fight.key(e.code.slice(5))) e.preventDefault(); }
  });
  addEventListener('keyup', (e) => { if (KEY[e.code]) field.keys[KEY[e.code]] = false; });
  addEventListener('blur', () => { if (field) for (const k in field.keys) field.keys[k] = false; });
  canvas.addEventListener('pointerdown', (e) => { if (mode !== 'walk') return; const r = canvas.getBoundingClientRect(); field.pointer(e.clientX - r.left, e.clientY - r.top); });
  // for checking: step the page by hand (?shot=1)
  window.MF = { get stage() { return stage; }, get field() { return field; }, get fight() { return fight; }, get J() { return J; }, get mode() { return mode; }, setMode, sw,
    set manual(v) { manual = !!v; }, step(dt, n) { for (let i = 0; i < (n || 1); i++) advance(dt, i === (n || 1) - 1); }, ready: false };
})();
