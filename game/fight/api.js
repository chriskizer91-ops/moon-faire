// api.js: the one way in. Another page loads the fight's file and calls:
//
//     const result = await MF_FIGHT.start({ place: 'F1', foes: 'K2w', partyLevel: 3, foeLevel: 4 });
//
// The fight covers the page, plays, and answers when the player leaves the result:
//     { result: 'won' | 'lost' | 'fled', won, xp, turns, foeTurns, fainted, place, foes, tag,
//       party: { jester: { hp, max, mp, mpMax }, ranger: ..., fox: ..., io: ... } }
// Everything it can be told (all but place and foes may be left out):
//     place      'F1' the moor clearing, 'F2' the fair, 'F3' the standing stones, 'F4' the beacon stair, 'F5' the lamp room
//     foes       a line-up as the plan writes it ('3w', 'K2w', 'B2K2w': w wisp, K Shadow Wraith, B great wraith) or a list (['wisp', 'wraith'])
//     partyLevel, foeLevel    the engine only needs the gap between them; XP grows with foeLevel
//     party      what each witch brings from the last fight: { jester: { hp, mp }, ... } (give back result.party to carry HP and MP on)
//     seed       the same seed gives the same dice
//     label      words for the log's first line;   tag  anything, handed back unchanged
//     camera, speed, flipbook, weight     settings for this fight (the player can change the first three in the fight)
//     auto       'careless' | 'attentive' | 'expert': the engine's own players choose every move (for testing)
// The fight draws on a canvas of its own. While it runs, the page that called it should stop drawing its own picture.
(function () {
  'use strict';
  const CSS = `
.mff{position:fixed;inset:0;z-index:9000;background:#0d0a12;color:#efe6da;font:15px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;flex-direction:column;-webkit-user-select:none;user-select:none}
.mff[hidden]{display:none}.mff *{box-sizing:border-box}
.mff .box{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;background:#000}
.mff canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.mff .ui{position:absolute;inset:0;pointer-events:none}
.mff .turnbar{position:absolute;top:8px;left:8px;right:8px;display:flex;gap:5px;overflow:hidden;white-space:nowrap}
.mff .chip{padding:2px 8px;border-radius:999px;background:rgba(18,12,26,.78);border:1px solid rgba(255,255,255,.16);font-size:12px}
.mff .chip.hero{border-color:#d7b46a;color:#f3dfae}.mff .chip.foe{border-color:#58c98e;color:#b9f0d2}.mff .chip.marked{border-color:#ff8a70;color:#ffc4b6}
.mff .chip.now{background:#f3dfae;color:#20150c;font-weight:600}
.mff .floats,.mff .bars{position:absolute;inset:0}
.mff .float{position:absolute;transform:translate(-50%,-100%);font-weight:700;font-size:20px;text-shadow:0 2px 0 #000,0 0 8px #000;animation:mffup 1.5s ease-out forwards;white-space:nowrap}
.mff .float.dmg{color:#fff}.mff .float.heal{color:#9df0a8}.mff .float.fate{color:#e9c877;font-size:14px}.mff .float.end{color:#ffb7a5}
@keyframes mffup{from{opacity:0;margin-top:8px}15%{opacity:1}to{opacity:0;margin-top:-46px}}
.mff .foebar{position:absolute;transform:translate(-50%,-100%);pointer-events:auto;background:rgba(14,9,20,.72);border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:2px 6px 4px;color:#e9f6ee;font:inherit;font-size:11px;min-width:84px;text-align:left;cursor:pointer}
.mff .foebar span{display:block;white-space:nowrap}.mff .foebar div{position:relative;height:6px;background:#261c30;border-radius:3px;overflow:hidden;margin-top:2px}
.mff .foebar i{position:absolute;left:0;top:0;bottom:0;display:block}.mff .foebar .life{background:#58c98e}.mff .foebar .fate{background:#e9c877;height:3px;top:auto}
.mff .foebar.tgt{border-color:#f3dfae;box-shadow:0 0 0 2px rgba(243,223,174,.5)}.mff .foebar.sealed{border-color:#e9c877}.mff .foebar.pick{box-shadow:0 0 0 3px #7fd6ff}
.mff .title{position:absolute;left:50%;top:22%;transform:translateX(-50%);font-size:34px;font-weight:700;letter-spacing:.04em;color:#f3dfae;text-shadow:0 3px 0 #000,0 0 18px #000}
.mff .banner{position:absolute;left:50%;top:44px;transform:translateX(-50%);pointer-events:auto;background:rgba(14,9,20,.9);border:1px solid #d7b46a;border-radius:12px;padding:18px 22px;text-align:center;min-width:240px}
.mff .banner b{display:block;font-size:22px;color:#f3dfae}.mff .banner span{display:block;margin:6px 0 12px;min-height:1em}
.mff button{font:inherit}.mff .banner button,.mff .moves button,.mff .set button{background:#2a1f36;color:#efe6da;border:1px solid #6a557e;border-radius:8px;padding:9px 12px;cursor:pointer}
.mff .panel{flex:0 0 auto;padding:8px 10px 10px;background:#17111f;border-top:1px solid #33283f;max-height:46vh;overflow:auto}
.mff .log{margin:0 0 6px;min-height:1.35em;color:#d9cdbd}
.mff .party{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.mff .who{background:#201829;border:1px solid #3a2e48;border-radius:8px;padding:5px 7px;color:inherit;text-align:left;cursor:pointer;display:block;min-width:0}
.mff .who b{display:block}.mff .who span{font-size:12px;color:#cbbfae;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mff .who .hp{height:6px;background:#2f2439;border-radius:3px;overflow:hidden;margin:3px 0}.mff .who .hp i{display:block;height:100%;background:#e0705a}
.mff .who.now{border-color:#f3dfae;background:#2b2135}.mff .who.down{opacity:.55}.mff .who.pick{box-shadow:0 0 0 3px #7fd6ff}
.mff .moves{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;min-height:40px}.mff .moves button:disabled{opacity:.42;cursor:default}.mff .moves button.on{border-color:#7fd6ff}
.mff .help{margin:6px 0 0;min-height:2.7em;font-size:13px;color:#bfb2a2}
.mff .set{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px;font-size:13px;color:#bfb2a2}
.mff .set select{font:inherit;background:#2a1f36;color:#efe6da;border:1px solid #6a557e;border-radius:6px;padding:4px}
.mff .wait{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#0d0a12;color:#d9cdbd}
.mff .wait[hidden],.mff [hidden]{display:none}
.mff .set label{display:flex;gap:6px;align-items:center}
@media (max-width:640px){.mff{font-size:14px}.mff .party{grid-template-columns:repeat(2,1fr)}.mff .box{flex:0 0 46vh}.mff .panel{flex:1 1 auto;max-height:none}.mff .title{font-size:24px}.mff .chip{font-size:11px;padding:1px 6px}}
`;
  const CODE = { w: 'wisp', K: 'wraith', B: 'great' };
  function lineUp(v) { if (Array.isArray(v)) return v.slice(); const out = []; String(v || 'w').replace(/(\d*)([wKB])/g, (_, n, k) => { for (let i = 0; i < (+n || 1); i++) out.push(CODE[k]); }); return out.length ? out : ['wisp']; }
  function label(list) { const n = {}; for (const k of list) n[k] = (n[k] || 0) + 1; const W = window.MF_FOES.KINDS, part = (k) => (n[k] === 1 ? 'a ' : n[k] + ' ') + W[k].name.toLowerCase() + (n[k] > 1 ? 's' : ''); const s = ['great', 'wraith', 'wisp'].filter((k) => n[k]).map(part).join(', '); return s.charAt(0).toUpperCase() + s.slice(1); }
  const set = { camera: 'behind', speed: 1, flipbook: false, weight: 'lightest', foeWeight: 'light', rows: 540 };
  let root = null, canvas = null, stage = null, fight = null, running = false, last = 0, clock = 0, manual = /[?&]shot/.test(location.search), el = {};
  function build() {
    if (root) return;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement('div'); root.className = 'mff'; root.hidden = true;
    root.innerHTML = '<div class="box"><canvas></canvas><div class="ui"></div><div class="wait">Setting the stage…</div></div><div class="panel"><div class="fp"></div><div class="set">' +
      '<label>Camera <select class="cam"><option value="behind">Behind the party</option><option value="near">Side on, closer</option><option value="actor">On whoever acts</option><option value="shoulder">Over the shoulder</option><option value="low">Low and close</option><option value="wide">Side on, wide</option></select></label>' +
      '<label>Speed <select class="spd"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option><option value="3">3×</option></select></label>' +
      '<label><input type="checkbox" class="flip"> Flipbook look</label><span class="meter"></span></div></div>';
    document.body.appendChild(root);
    canvas = root.querySelector('canvas'); el = { ui: root.querySelector('.ui'), fp: root.querySelector('.fp'), cam: root.querySelector('.cam'), spd: root.querySelector('.spd'), flip: root.querySelector('.flip'), wait: root.querySelector('.wait'), meter: root.querySelector('.meter'), box: root.querySelector('.box') };
    el.cam.addEventListener('change', () => { set.camera = el.cam.value; }); el.spd.addEventListener('change', () => { set.speed = +el.spd.value || 1; }); el.flip.addEventListener('change', () => { set.flipbook = el.flip.checked; });
    stage = window.makeMFStage(canvas, { preserve: manual, shadow: 2048, maxPixelRatio: 2 });
    fight = window.makeMFFight(stage, { ui: el.ui, panel: el.fp, aspect: () => canvas.clientWidth / Math.max(1, canvas.clientHeight), width: () => canvas.clientWidth, cam: () => set.camera, weight: () => set.weight, foeWeight: () => set.foeWeight });
    window.addEventListener('keydown', (e) => { if (!running) return; if (fight.key(e.key)) e.preventDefault(); });
  }
  function frame(now) {
    if (!running) return; requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000) * set.speed; last = now; tick(dt);
    if ((frame.n = (frame.n || 0) + 1) % 30 === 0) { const i = stage.info(); el.meter.textContent = Math.round(i.triangles / 1000) + ' thousand triangles, ' + i.calls + ' draws'; }
  }
  function tick(dt, noDraw) { clock += dt; stage.resize(); stage.flip.on = set.flipbook; stage.flip.rows = set.rows; fight.step(dt, clock); if (!noDraw) stage.render(); }
  const art = (id) => new Promise((ok) => stage.loadArt(id, window.MF_FIGHT_ART[id], ok));
  async function start(o) {
    o = o || {}; build(); if (running) throw new Error('A fight is already running');
    for (const k of ['camera', 'speed', 'flipbook', 'weight', 'foeWeight', 'rows']) if (o[k] != null) set[k] = o[k];
    el.cam.value = set.camera; el.spd.value = String(set.speed); el.flip.checked = !!set.flipbook;
    const place = window.MF_PLACES[o.place || 'F1']; if (!place) throw new Error('No fight place called ' + o.place);
    const list = lineUp(o.foes); root.hidden = false; el.wait.hidden = false; running = true;
    await new Promise((r) => setTimeout(r, 30));           // let the "setting the stage" words show before the models are built
    try {
      if (window.MeshoptSimplifier && window.MeshoptSimplifier.ready) await window.MeshoptSimplifier.ready;
      await art(place.art);
      const gap = o.gap != null ? o.gap : (o.foeLevel != null && o.partyLevel != null ? o.foeLevel - o.partyLevel : 0);
      const done = new Promise((resolve) => fight.enter({ place, foes: list, gap, foeLevel: o.foeLevel || (o.partyLevel != null ? o.partyLevel + gap : 1), seed: o.seed, party: o.party, label: o.label || label(list), tag: o.tag, noJester: !!o.noJester }, resolve));
      fight.setAuto(o.auto || null); el.wait.hidden = true; stage.resize(); last = performance.now(); if (!manual) requestAnimationFrame(frame);
      const result = await done; fight.leave(); running = false; root.hidden = true; return result;
    } catch (e) { running = false; root.hidden = true; throw e; }
  }
  window.MF_FIGHT = { start, lineUp, settings: set, places: () => Object.values(window.MF_PLACES).map((p) => ({ id: p.id, name: p.name })),
    get running() { return running; },
    // for checking by hand (?shot=1): the page does not run on its own clock; step(dt, n) moves it
    debug: { get stage() { return stage; }, get fight() { return fight; }, step(dt, n, noDraw) { for (let i = 0; i < (n || 1); i++) tick(dt, noDraw); }, get manual() { return manual; } } };
})();
