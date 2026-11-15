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
//     pace       how fast moves play against the models' own timing (0.9: a tenth slower);   zoomOut  how far back the director's camera stands (1.25)
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
.mff .log{position:absolute;left:10px;right:54px;bottom:8px;margin:0;min-height:0;text-align:left;color:#f3ead9;font-size:14px;text-shadow:0 1px 0 #000,0 0 6px #000,0 0 12px #000}
.mff .gear{position:absolute;right:8px;bottom:6px;width:40px;height:40px;border-radius:50%;background:rgba(18,12,26,.78);border:1px solid rgba(255,255,255,.25);color:#efe6da;font-size:20px;line-height:1;pointer-events:auto;cursor:pointer}
.mff .panel{padding:8px 10px 10px;max-height:50vh}
.mff .party{grid-template-columns:repeat(4,1fr);gap:6px}
.mff .who{padding:5px 7px 4px;border-radius:9px;transition:transform .12s}
.mff .who b{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mff .who .hp{height:7px;margin:3px 0 2px}.mff .who .mp{height:4px;background:#2f2439;border-radius:2px;overflow:hidden;margin:3px 0 1px}.mff .who .mp i{display:block;height:100%;background:#6f9be8}
.mff .who span{font-size:11.5px}
.mff .who.now{transform:translateY(-3px);border-color:#f3dfae;background:#2e2338;box-shadow:0 3px 0 #f3dfae}
.mff .who.pick{box-shadow:0 0 0 2px #7fd6ff}.mff .who.tgt{box-shadow:0 0 0 3px #7fd6ff;background:#1f3140}
.mff .help{margin:8px 2px 6px;min-height:2.7em;font-size:13.5px;color:#e4d9c8}
.mff .moves{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:0;min-height:0}
.mff .tile{display:block;text-align:left;min-height:50px;padding:7px 10px;background:#2a1f36;color:#efe6da;border:1px solid #6a557e;border-radius:10px;cursor:pointer}
.mff .tile b{display:block;font-weight:600;font-size:14.5px}.mff .tile span{display:block;font-size:12px;color:#b9c9f2}
.mff .tile.off{opacity:.5;border-style:dashed}.mff .tile.off span{color:#e0b9a8}
.mff .tile.on{background:#f3dfae;color:#20150c;border-color:#f3dfae}.mff .tile.on span{color:#4a3a22}.mff .tile.on.off{background:#4a3d2f;color:#efe6da;opacity:.8}
.mff .castrow{display:flex;gap:8px;margin-top:9px;position:sticky;bottom:0;padding:6px 0 2px;background:linear-gradient(to bottom,rgba(23,17,31,0),#17111f 30%)}
.mff .cast{flex:1 1 auto;min-height:52px;border-radius:12px;border:0;background:#58c98e;color:#0c2015;font-weight:700;font-size:16px;cursor:pointer}
.mff .cast:disabled{background:#2a2433;color:#8d8398;cursor:default}
.mff .back{flex:0 0 auto;min-height:52px;padding:0 16px;border-radius:12px;background:#2a1f36;color:#efe6da;border:1px solid #6a557e;cursor:pointer}
.mff .foebar{min-width:92px;padding:5px 8px 6px;font-size:12px}.mff .foebar div{height:7px}
.mff .foebar.tgt{border-color:#f3dfae;box-shadow:0 0 0 3px rgba(243,223,174,.75)}.mff .foebar.pick{box-shadow:0 0 0 2px #7fd6ff}.mff .foebar.dim{opacity:.35}
.mff .chip.marked{font-weight:700}
.mff .set{margin-top:10px;padding-top:8px;border-top:1px solid #33283f}
/* reading the fight (Chris, November 14, 9 pm: "the HP bar should read more clearly, not larger, just better colour usage"): every bar sits
   on a black track with a light edge; a witch's HP is green, then amber under half, then red under a quarter; a foe's Life is rose red,
   its Fate gold; whatever was just lost shows white for a moment before it drains; MP is blue */
.mff .who .hp,.mff .foebar div{position:relative;background:#000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.34);overflow:hidden}
.mff .who .hp i,.mff .foebar i{position:absolute;left:0;top:0;bottom:0;display:block;height:auto}
.mff .who .hp .lost,.mff .foebar .lost{background:#fff;transition:width .6s ease-in .28s}
.mff .who .hp .life{background:#3ddc84}.mff .who.mid .hp .life{background:#ffc531}.mff .who.low .hp .life{background:#ff4a4a}
.mff .who .hpn{color:#fff;font-weight:600}.mff .who.mid .hpn{color:#ffd76a}.mff .who.low .hpn{color:#ff8c8c}
.mff .who .mp{background:#000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)}.mff .who .mp i{background:#4da3ff}.mff .who .mpn{color:#a8cdff}
.mff .who{background:#15101c;border-color:#4a3d5c}.mff .who.down{opacity:.6}.mff .who.down .hpn{color:#b9b0c4}
.mff .foebar{background:rgba(6,4,10,.9);border:1px solid rgba(255,255,255,.4);color:#fff}.mff .foebar span{font-weight:600;text-shadow:0 1px 0 #000}
.mff .foebar .life{background:#ff4d70}.mff .foebar .fate{background:#ffd54a;top:auto;height:3px;box-shadow:0 -1px 0 #000}
.mff .foebar.sealed{border-color:#ffd54a}.mff .foebar.sealed .life{background:repeating-linear-gradient(45deg,#ffd54a 0 5px,#c9981a 5px 10px)}
.mff .foebar.hit{animation:mffbar .3s ease-out}.mff .who.hit{animation:mffwho .32s ease-out}
@keyframes mffbar{0%{background:#fff;transform:translate(-50%,-100%) scale(1.14)}100%{transform:translate(-50%,-100%) scale(1)}}
@keyframes mffwho{0%{background:#fff;transform:scale(1.05)}100%{}}
.mff .float{font-size:26px;font-weight:800;animation:mffpop 1.45s ease-out forwards;text-shadow:0 2px 0 #000,0 0 3px #000,0 0 10px #000;-webkit-text-stroke:1px rgba(0,0,0,.55)}
.mff .float.big{font-size:38px}.mff .float.dmg{color:#fff}.mff .float.dmg.hero{color:#ff9a8c}.mff .float.heal{color:#7dffa6}.mff .float.end{color:#ffd0c2}.mff .float.fate{color:#ffd54a;font-size:15px;-webkit-text-stroke:0}
@keyframes mffpop{0%{opacity:0;transform:translate(-50%,-100%) scale(2.3)}11%{opacity:1;transform:translate(-50%,-100%) scale(.94)}18%{transform:translate(-50%,-100%) scale(1)}72%{opacity:1;transform:translate(-50%,-150%) scale(1)}100%{opacity:0;transform:translate(-50%,-185%) scale(.92)}}
.mff .log{left:8px;right:auto;max-width:calc(100% - 64px);background:rgba(6,4,10,.72);border-radius:8px;padding:4px 9px;color:#fff}
.mff .log:empty{display:none}
.mff .chip{background:rgba(6,4,10,.86);color:#fff}.mff .chip.hero{border-color:#3ddc84;color:#c9ffe0}.mff .chip.foe{border-color:#ff4d70;color:#ffd0da}.mff .chip.marked{border-color:#ffd54a;color:#ffe69a;background:rgba(60,34,0,.92)}.mff .chip.now{background:#fff;color:#111;border-color:#fff}
@media (max-width:640px){.mff{font-size:14px}.mff .box{flex:0 0 46vh}.mff .tile{min-height:44px;padding:5px 9px}.mff .help{min-height:2.5em;margin:6px 2px 5px}.mff .panel{padding-bottom:4px}.mff .panel{flex:1 1 auto;max-height:none}.mff .title{font-size:24px}.mff .chip{font-size:11px;padding:1px 6px}.mff .moves{grid-template-columns:repeat(2,1fr)}.mff .who{padding:4px 5px 3px}.mff .who b{font-size:13px}.mff .who span{font-size:10.5px}.mff .party{gap:4px}}
`;
  const CODE = { w: 'wisp', K: 'wraith', B: 'great' };
  function lineUp(v) { if (Array.isArray(v)) return v.slice(); const out = []; String(v || 'w').replace(/(\d*)([wKB])/g, (_, n, k) => { for (let i = 0; i < (+n || 1); i++) out.push(CODE[k]); }); return out.length ? out : ['wisp']; }
  function label(list) { const n = {}; for (const k of list) n[k] = (n[k] || 0) + 1; const W = window.MF_FOES.KINDS, part = (k) => (n[k] === 1 ? 'a ' : n[k] + ' ') + W[k].name.toLowerCase() + (n[k] > 1 ? 's' : ''); const s = ['great', 'wraith', 'wisp'].filter((k) => n[k]).map(part).join(', '); return s.charAt(0).toUpperCase() + s.slice(1); }
  const set = { pace: 0.9, zoomOut: 1.25, camera: 'auto', speed: 1, flipbook: false, weight: 'lightest', foeWeight: 'light', rows: 540 };
  let root = null, canvas = null, stage = null, fight = null, running = false, last = 0, clock = 0, manual = /[?&]shot/.test(location.search), el = {};
  function build() {
    if (root) return;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement('div'); root.className = 'mff'; root.hidden = true;
    root.innerHTML = '<div class="box"><canvas></canvas><div class="ui"></div><button type="button" class="gear" aria-label="Settings">\u2699</button><div class="wait">Setting the stage…</div></div><div class="panel"><div class="fp"></div><div class="set" hidden>' +
      '<label>Camera <select class="cam"><option value="auto">Director: mixes the views</option><option value="directed">Wide behind the party, swing on big moves</option><option value="side">Side on, everyone</option><option value="near">Side on, closer on a move</option><option value="actor">On whoever acts</option><option value="shoulder">Over the shoulder</option><option value="low">Low and close</option><option value="wide">Side on, wide</option><option value="behind">Behind their heads, a swing on every move</option></select></label>' +
      '<label>Speed <select class="spd"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option><option value="3">3×</option></select></label>' +
      '<label><input type="checkbox" class="flip"> Flipbook look</label><span class="meter"></span></div></div>';
    document.body.appendChild(root);
    canvas = root.querySelector('canvas'); el = { ui: root.querySelector('.ui'), fp: root.querySelector('.fp'), cam: root.querySelector('.cam'), spd: root.querySelector('.spd'), flip: root.querySelector('.flip'), wait: root.querySelector('.wait'), meter: root.querySelector('.meter'), box: root.querySelector('.box') };
    root.querySelector('.gear').addEventListener('click', () => { const x = root.querySelector('.set'); x.hidden = !x.hidden; });
    el.cam.addEventListener('change', () => { set.camera = el.cam.value; }); el.spd.addEventListener('change', () => { set.speed = +el.spd.value || 1; }); el.flip.addEventListener('change', () => { set.flipbook = el.flip.checked; });
    stage = window.makeMFStage(canvas, { preserve: manual, shadow: 2048, maxPixelRatio: 2 });
    fight = window.makeMFFight(stage, { ui: el.ui, panel: el.fp, aspect: () => canvas.clientWidth / Math.max(1, canvas.clientHeight), width: () => canvas.clientWidth, cam: () => set.camera, zoomOut: () => set.zoomOut, weight: () => set.weight, foeWeight: () => set.foeWeight });
    window.addEventListener('keydown', (e) => { if (!running) return; if (fight.key(e.key)) e.preventDefault(); });
  }
  function frame(now) {
    if (!running) return; requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000) * set.speed * set.pace; last = now; tick(dt);      // pace: the whole fight runs a tenth slower than the models' own timing (Chris, November 14, 9:16 pm)
    if ((frame.n = (frame.n || 0) + 1) % 30 === 0) { const i = stage.info(); el.meter.textContent = Math.round(i.triangles / 1000) + ' thousand triangles, ' + i.calls + ' draws'; }
  }
  function tick(dt, noDraw) { clock += dt; stage.resize(); stage.flip.on = set.flipbook; stage.flip.rows = set.rows; fight.step(dt, clock); if (!noDraw) stage.render(); }
  const art = (id) => new Promise((ok) => stage.loadArt(id, window.MF_FIGHT_ART[id], ok));
  async function start(o) {
    o = o || {}; build(); if (running) throw new Error('A fight is already running');
    for (const k of ['camera', 'speed', 'flipbook', 'weight', 'foeWeight', 'rows', 'pace', 'zoomOut']) if (o[k] != null) set[k] = o[k];
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
