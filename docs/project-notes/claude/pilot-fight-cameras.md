# The pilot's fight cameras

November 14, 2026. Read after `claude/chris-on-flipbook-settings-light-weight-and-fight-camera.md` and `claude/flipbook-look-finer-and-pilot.md`.

- **Page:** "Moon Faire pilot: fight cameras and the Flipbook look", https://claude.ai/artifact/8xmYGwUDoJXSU65FMk9dWg. The same link as the Flipbook-look copy of the pilot; it now opens with the camera on "Closer". The starter-world session's own page (https://claude.ai/artifact/PkUTHyHVp9ZQDwvNgtUFqh) was not touched.
- **Built from:** branch `claude/moon-faire-starter-world`, commit `bdaa792`, `game/`. The branch was only read. Nothing was pushed.

## What Chris said

- November 13: "I think fight distance is too far away for whatever's happening. I think we have to come up with interesting camera angles."
- November 14: "Yes closer fight camera angles added to the pilot so I can flip between them absolutely."

## The five cameras

A "Camera" choice in the fight's row of controls.

| | At rest | While someone moves |
|---|---|---|
| **Wide, as it was** | the whole clearing | a closer window on the two of them (the old "Closer shots" switch) |
| **Closer** | her turn: her and the foe she has picked. Between turns: whoever is still standing | tighter on the two of them |
| **On whoever acts** | as Closer | whoever is moving; when the move lands, whoever is hit, for a second and a half; then both |
| **Over the shoulder** | as Closer | the camera moves behind whoever is moving and looks past them at who they aim at |
| **Low and close** | as Closer | the camera moves low in front of whoever is moving; when the move lands it cuts to whoever is hit |

The big finishing spell still opens out to the whole clearing for its end, in every camera.

## What a painted place allows

The fight's place is one flat painting, made from one spot. So there are two kinds of shot, and only two.

1. **A window on the painting.** The 3D camera stays where the painter stood, and a closer shot shows a smaller part of the same picture. Everything stays true: feet on the ground, the same place behind. But it can only come closer or slide. It cannot go round anyone. And the closer it comes, the softer the painting gets, because the painting has only so many pixels (1,448 across here). The first three cameras are this kind.
2. **The camera really moves.** The painting cannot turn with it. So behind the cast the painting is shown out of focus, with its horizon put where the moved camera's horizon is, and slid sideways as the camera turns. Out of focus, the eye takes it for the same place seen from somewhere else. The last two cameras are this kind. They use a long lens (22 to 24 degrees), because a wide one would show more sky and moor than the painting holds.

A third kind is possible and not built: more paintings of the same place from other spots.

## Found on the way

- **At rest, closer means someone is out of the picture.** With three foes the party and the foes fill the clearing from side to side. A resting shot can only be closer by leaving some of them out. "Closer" holds her and the foe she has picked, and slides when she picks another. With four witches this will matter more.
- **A moved camera has to cut.** A window can glide. A window and a moved camera cannot blend into each other, so those two cameras cut in when a move starts and cut back when it ends. Whether that is too much cutting in a long fight is for Chris to judge.
- **Out of focus needs real softening.** The first try read a small copy of the painting once for each pixel and showed blocky bands in the sky. It now takes sixteen readings spread over a patch.
- **Past the painting's edge it is met again in a mirror.** That put a second moon in the sky. So the part shown is kept inside the painting whenever it fits, and the mirror is only for what is left over (mostly ground below the bottom edge).
- **With the Flipbook look on,** an out-of-focus sky in few colours shows as rings. Behind a moved camera the painting only goes about a third of the way to its colours.
- **Name bars and damage numbers** follow the moved camera, and a foe behind the camera gets no bar.

## Checked, and not

- Stills of all five cameras, at rest and during her attack and a foe's attack, with one wisp and with three; the Flipbook look on with a moved camera; the phone layout; walking.
- On "Wide, as it was" the fight draws as it did before, within the run-to-run difference of the spell's sparks.
- **Not checked: any of it in motion, and real speed.** In the test browser the first picture from a moved camera took about 18 seconds, because it makes the soft copy of the painting on a machine with no graphics card. On a real graphics card that step should take a few thousandths of a second, but nobody has seen it there yet. If the first cut stutters on Chris's laptop, the soft copy should be made when the painting loads.
- **Not built:** camera moves that glide (a slow turn round her); cameras for a party of four; any camera work in the walking scenes.

## Still open, for Chris

- Which of the five he wants to keep, and for what: every move, or only the big ones.
- Whether cutting in and back each turn is too much.
- Whether more paintings of each fight place, from other spots, are worth their cost.

## The code

`patch_pilot_cameras.py`, below in full. It goes on top of `patch_pilot_flipbook.py` (`claude/flipbook-look-finer-and-pilot.md`). That script now sees that the branch already has the stage's half of the look (commit `b19877a`) and only adds the page's controls. Every replacement must be found exactly once.

- `src/stage.js`: `stage.free` (the moved camera: `on`, `pos`, `look`, `fov`, `blur`, `dim`), the painter's camera kept in `stage.fixed`, the out-of-focus painting in the painting's shader (`uSoft`, `uTex`), `toScreen` following a moved camera.
- `src/fight.js`: the camera choice, in place of the old "closer" lines of `step`.
- `src/main.js`, `src/pilot.tpl.html`: the "Camera" choice, a notes block, the Flipbook look's pixel slider opening at the fine end.

```python
# patch_pilot_cameras.py: fight cameras for the starter-world pilot. Run after patch_pilot_flipbook.py, from the repo's game/ folder (or pass its path).
# It changes src/stage.js, src/fight.js, src/main.js and src/pilot.tpl.html. Every replacement must be found exactly once, or the script stops.
# With the camera set to "Wide, as it was" the fight is drawn exactly as before.
#
# What it adds. The fight's camera has only ever been a window on the painting: the 3D camera is fixed where the painter stood, and a closer
# shot is a smaller window. That stays, and gets two more ways of choosing the window. Then one new thing: the camera can really move
# (stage.free). The painting cannot turn with it, so behind the cast it is shown out of focus, slid sideways as the camera turns and set so
# its horizon is where the moved camera's horizon is. Out of focus, the eye takes it for the same place seen from somewhere else.
import sys, os
G = sys.argv[1] if len(sys.argv) > 1 else '.'
def edit(path, pairs):
    p = os.path.join(G, path); s = open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, a[:80], s.count(a)); s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s)

edit('src/stage.js', [
  # the painting's shader can show the painting out of focus, mirrored past its side edges
  ("uSnap: { value: 1 }, uDim: { value: 1 } },", "uSnap: { value: 1 }, uDim: { value: 1 }, uSoft: { value: 0 }, uTex: { value: new THREE.Vector2(1024, 1024) } },"),
  ("uniform float uSnap; uniform float uDim; varying vec2 vUv;", "uniform float uSnap; uniform float uDim; uniform float uSoft; uniform vec2 uTex; varying vec2 vUv;"),
  (r"' col *= 0.25; float best = 1e9; vec3 pick = col;\n' +",
   r"' col *= 0.25;\n' +" + "\n"
   r"      ' if (uSoft > 0.0) { col = vec3(0.0); vec2 sp = 0.5 * exp2(uSoft) / uTex;\n' +" + "      // out of focus: sixteen readings from a small copy of the painting, spread over a patch; past an edge the painting is met again in a mirror\n"
   r"      '  for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) { vec2 w = uWin.xy + c0 * uWin.zw + (vec2(float(i), float(j)) - 1.5) * sp; vec2 m = mod(w, 2.0); w = mix(m, 2.0 - m, step(1.0, m)); col += texture2D(tP, w, uSoft).rgb; }\n' +" + "\n"
   r"      '  col *= 0.0625; }\n' +" + "\n"
   r"      ' float best = 1e9; vec3 pick = col;\n' +"),
  ("  const _buf = new THREE.Vector2(), _cc = new THREE.Color(); let glowT = 0;",
   "  const _buf = new THREE.Vector2(), _cc = new THREE.Color(); let glowT = 0;\n"
   "  // a second copy of a painting that can be read out of focus (made the first time the camera moves)\n"
   "  const softArt = (id) => api.soft[id] || (api.soft[id] = (() => { const t = new THREE.Texture(api.textures[id].image); t.encoding = THREE.sRGBEncoding; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t; })());"),
  ("    textures: {}, ownPal: {},",
   "    textures: {}, ownPal: {}, soft: {},\n"
   "    // the camera moved for a shot: where it stands, what it looks at, its lens (degrees), how far out of focus the painting behind is\n"
   "    // (0 sharp; each step is twice as soft) and how much of its light is kept. While on is false the camera is the painter's, as always.\n"
   "    free: { on: false, pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 23, blur: 3.0, dim: 0.82 },"),
  ("      api.fullProj = camera.projectionMatrix.clone(); api.fullInv = camera.projectionMatrixInverse.clone();",
   "      api.fullProj = camera.projectionMatrix.clone(); api.fullInv = camera.projectionMatrixInverse.clone();\n"
   "      // the painter's camera, kept so it can be put back, and the height of its horizon in the painting\n"
   "      api.fixed = { pos: camera.position.clone(), quat: camera.quaternion.clone(), view: camera.matrixWorldInverse.clone(), fov: C.fov, aspect: FW / FH, near: camera.near, far: camera.far, hy: 0 };\n"
   "      { const p = _v.set(camera.position.x, camera.position.y, camera.position.z - 1e5).applyMatrix4(api.fixed.view).applyMatrix4(api.fullProj); api.fixed.hy = (1 - p.y) / 2 * FH; } api._free = false;"),
  ("toFrame(v, out) { const p = _v.copy(v).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(api.fullProj);", "toFrame(v, out) { const p = _v.copy(v).applyMatrix4(api.fixed ? api.fixed.view : camera.matrixWorldInverse).applyMatrix4(api.fullProj);"),
  ("toScreen(v, out) { out = api.toFrame(v, out);", "toScreen(v, out) { if (api._free) { const p = _v.copy(v).project(camera); out = out || [0, 0]; out[0] = (p.x + 1) / 2 * canvas.clientWidth; out[1] = (1 - p.y) / 2 * canvas.clientHeight; if (p.z > 1) out[0] = out[1] = -9999; return out; } out = api.toFrame(v, out);"),
  ("      const pixPaint = F.on && F.painting !== 'smooth' && api.painting && bgMat.map;",
   "      const FR = api.free.on && api.fixed && bgMat.map ? api.free : null; let bw = null;\n"
   "      if (FR) {                                          // the camera has moved: stand it there, and find the part of the painting that lies behind\n"
   "        const d = _v.copy(FR.look).sub(FR.pos), yaw = Math.atan2(d.x, -d.z), pit = Math.atan2(d.y, Math.hypot(d.x, d.z)), tf = Math.tan(FR.fov / 2 * RAD), fpx = (FH / 2) / Math.tan(api.fixed.fov / 2 * RAD);\n"
   "        camera.clearViewOffset(); camera.fov = FR.fov; camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight); camera.near = 0.1; camera.far = 400;\n"
   "        camera.position.copy(FR.pos); camera.lookAt(_v.copy(FR.look).add(_v2.set(sx * 0.003, sy * 0.003, 0))); camera.updateMatrixWorld(); camera.updateProjectionMatrix(); api._free = true;\n"
   "        const bh = 2 * fpx * tf, bwid = bh * camera.aspect, t = 0.5 + 0.5 * Math.tan(pit) / tf, by = api.fixed.hy - t * bh; let bx = FW / 2 + fpx * yaw - bwid / 2; if (bwid <= FW) bx = Math.max(0, Math.min(FW - bwid, bx));      // as large as the lens asks, its horizon on the camera's horizon, slid sideways by the camera's turn but kept inside the painting when it fits\n"
   "        bw = [bx / FW, 1 - (by + bh) / FH, bwid / FW, bh / FH];\n"
   "      } else if (api._free) { const X = api.fixed; camera.position.copy(X.pos); camera.quaternion.copy(X.quat); camera.fov = X.fov; camera.aspect = X.aspect; camera.near = X.near; camera.far = X.far; camera.updateMatrixWorld(); api._free = false; }\n"
   "      const pixPaint = F.on && F.painting !== 'smooth' && api.painting && bgMat.map;"),
  ("      if (pixPaint) {\n        const u = paintMat.uniforms, own = F.painting === 'own' && api.ownPal[S.art]; u.tP.value = bgMat.map; u.uRes.value.set(gw, gh);",
   "      if (FR && api.painting) {                           // behind a moved camera: the painting out of focus (on the look's grid when the look is on, and only part of the way to its colours: a soft sky in few colours shows as rings)\n"
   "        const u = paintMat.uniforms, own = pixPaint && F.painting === 'own' && api.ownPal[S.art]; if (!pixPaint) { renderer.setRenderTarget(null); renderer.getDrawingBufferSize(_buf); }\n"
   "        u.tP.value = softArt(S.art); u.uTex.value.set(u.tP.value.image.width, u.tP.value.image.height); u.uSoft.value = FR.blur; if (pixPaint) u.uRes.value.set(gw, gh); else u.uRes.value.set(_buf.x, _buf.y);\n"
   "        u.uWin.value.set(bw[0], bw[1], bw[2], bw[3]); u.uPal.value = own || postMat.uniforms.uPal.value; u.uN.value = own ? 64 : NPW; u.uSnap.value = pixPaint ? F.snap * 0.35 : 0; u.uDim.value = (1 - 0.93 * Math.min(1, Math.max(0, api.dark))) * FR.dim;\n"
   "        renderer.render(paintScene, bgCam); renderer.setRenderTarget(null);\n"
   "      } else if (pixPaint) {\n        const u = paintMat.uniforms, own = F.painting === 'own' && api.ownPal[S.art]; u.tP.value = bgMat.map; u.uSoft.value = 0; u.uRes.value.set(gw, gh);"),
  ("      camera.setViewOffset(FW, FH, wx, wy, W.w, W.h);", "      if (!FR) camera.setViewOffset(FW, FH, wx, wy, W.w, W.h);"),
  ("  const _v = new THREE.Vector3();\n  return api;", "  const _v = new THREE.Vector3(), _v2 = new THREE.Vector3();\n  return api;"),
])

OLD_CAM = """      const closeOn = H.closeOn() && phase === 'act' && act && !(act.kind === 'hero' && act.anim === 'g_curtain' && J.time > 5.2);
      if (closeOn) { const w = act.w || wisps[tgt], pts = [[her.x - 1.5, 0, her.z], [her.x, 2.5, her.z], [her.x + 1.2, 0, her.z + 1]]; if (w && act.anim !== 'taunt_heal') pts.push([w.x + 1.1, 0, w.z], [w.x, 1.7, w.z]);
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) { const q = stage.toFrame(_w.set(p[0], p[1], p[2])); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
        let cw = Math.max((x1 - x0) * 1.25, (y1 - y0) * 1.5 * asp, FW * 0.5); cw = Math.min(cw, ww); const ch = cw / asp; ww = cw; wh = ch; wx = (x0 + x1) / 2 - cw / 2; wy = y1 + ch * 0.14 - ch; }
      wx = Math.max(0, Math.min(FW - ww, wx)); wy = Math.max(0, Math.min(FH - wh, wy));
      if (!win) win = { x: wx, y: wy, w: ww, h: wh }; else { const k = Math.min(1, dt * 2.4); win.x += (wx - win.x) * k; win.y += (wy - win.y) * k; win.w += (ww - win.w) * k; win.h = win.w / asp; if (win.h > FH) { win.h = FH; win.w = FH * asp; } }"""
NEW_CAM = """      // Which camera (H.cam): 'wide' is the fight as it was first shown; 'near' keeps to whoever is still standing and comes in on a move;
      // 'actor' goes to whoever is moving and then to whoever is hit; 'shoulder' and 'low' move the real camera for the length of a move.
      const CAM = H.cam ? H.cam() : 'wide', acting = phase === 'act' && act && !(act.kind === 'hero' && act.anim === 'g_curtain' && J.time > 5.2);
      // fit the window round some points: how much room to leave across and up, the narrowest it may get, and the room under the lowest point
      const frame = (pts, kx, ky, least, foot) => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) { const q = stage.toFrame(_w.set(p[0], p[1], p[2])); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
        let cw = Math.max((x1 - x0) * kx, (y1 - y0) * ky * asp, FW * least); cw = Math.min(cw, ww); const ch = cw / asp; ww = cw; wh = ch; wx = (x0 + x1) / 2 - cw / 2; wy = y1 + ch * foot - ch; };
      const herPts = () => [[her.x - 1.5, 0, her.z], [her.x, 2.5, her.z], [her.x + 1.2, 0, her.z + 1]], foePts = (w) => { const p = w.m.root.position; return [[p.x - 0.7, 0, p.z], [p.x + 1.1, 0, p.z], [p.x, 1.7, p.z]]; };
      const tw = acting ? (act.kind === 'foe' ? act.w : (act.anim !== 'taunt_heal' ? (act.w || wisps[tgt]) : null)) : null;      // the foe in this move: the one who makes it, or the one it is aimed at
      if (acting) { if (act.cam0 == null) act.cam0 = J.state.hitN || 0; if (act.camT == null && (act.kind === 'foe' ? act.done : (J.state.hitN || 0) !== act.cam0)) act.camT = act.t; }      // camT: when the move landed
      const landed = acting && act.camT != null, justHit = landed && act.t < act.camT + 1.5; let quick = 2.4, shot = null;
      if (CAM === 'wide') { if (H.closeOn() && acting) { const pts = herPts(); if (tw) pts.push([tw.x + 1.1, 0, tw.z], [tw.x, 1.7, tw.z]); frame(pts, 1.25, 1.5, 0.5, 0.14); } }
      else {
        const all = herPts(); for (const w of wisps) if (w.m.root.visible) all.push(...foePts(w));
        frame(all, 1.14, 1.28, 0.34, 0.12);                                   // at rest: everyone still standing, and no more of the place than that
        if (phase === 'menu') { const w = wisps[tgt]; if (w && w.m.root.visible) { const pts = herPts(); pts.push(...foePts(w)); frame(pts, 1.1, 1.24, 0.3, 0.12); } }      // her turn: her and the foe she has picked
        if (acting && CAM === 'near') { const pts = herPts(); if (tw) pts.push(...foePts(tw)); frame(pts, 1.08, 1.2, 0.3, 0.12); }
        if (acting && CAM === 'actor') { quick = 4.2; const hero = act.kind === 'hero', onHer = hero ? !landed || !tw : landed, both = hero && landed && !justHit;
          if (both) { const pts = herPts(); pts.push(...foePts(tw)); frame(pts, 1.08, 1.2, 0.3, 0.12); }
          else if (onHer) frame([[her.x - 1.0, 0, her.z], [her.x, 2.4, her.z], [her.x + 1.0, 0, her.z]], 1.1, 1.16, 0.2, 0.1);
          else { const p = tw.m.root.position; frame([[p.x - 0.9, 0, p.z], [p.x, 1.9, p.z], [p.x + 0.9, 0, p.z]], 1.1, 1.22, 0.2, 0.12); } }
        if (acting && (CAM === 'shoulder' || CAM === 'low')) {
          const hero = act.kind === 'hero', T = tw ? tw.m.root.position : null, u = Math.min(1, act.t / 3.5);
          if (CAM === 'shoulder' && T) {                                       // behind whoever is moving, on the audience's side, looking past them at who they aim at
            const ax = hero ? her.x : T.x, az = hero ? her.z : T.z, bx = hero ? T.x : her.x, bz = hero ? T.z : her.z, dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, back = hero ? 4.3 - 0.4 * u : 3.6 - 0.4 * u;
            shot = { p: [ax - ux * back, hero ? 1.7 : 1.4, az - uz * back + 1.7], l: [ax + dx * 0.6, hero ? 1.05 : 1.15, az + dz * 0.6], fov: 24 };
          } else {                                                             // low and close on whoever is moving, then on whoever is hit
            const onHer = hero ? !justHit || !T : landed;
            if (onHer) shot = { p: [her.x + (hero ? 1.4 : 0.8), hero ? 0.55 : 1.0, her.z + 4.6 - 0.6 * u], l: [her.x + 0.15, hero ? 1.2 : 1.18, her.z], fov: 22 };
            else shot = { p: [T.x - 1.1, 0.7, T.z + 4.2 - (hero ? 0 : 0.4 * u)], l: [T.x, 0.92, T.z], fov: 22 };
          }
        }
      }
      stage.free.on = !!shot; if (shot) { stage.free.pos.set(shot.p[0], shot.p[1], shot.p[2]); stage.free.look.set(shot.l[0], shot.l[1], shot.l[2]); stage.free.fov = shot.fov; }
      wx = Math.max(0, Math.min(FW - ww, wx)); wy = Math.max(0, Math.min(FH - wh, wy));
      if (!win || shot) win = { x: wx, y: wy, w: ww, h: wh }; else { const k = Math.min(1, dt * quick); win.x += (wx - win.x) * k; win.y += (wy - win.y) * k; win.w += (ww - win.w) * k; win.h = win.w / asp; if (win.h > FH) { win.h = FH; win.w = FH * asp; } }"""
edit('src/fight.js', [
  (OLD_CAM, NEW_CAM),
  ("phase = 'off'; for (const w of wisps) w.patch.visible = false;", "phase = 'off'; stage.free.on = false; for (const w of wisps) w.patch.visible = false;"),
])
edit('src/main.js', [
  ("liveOn: () => sw.live, closeOn: () => sw.close,", "liveOn: () => sw.live, closeOn: () => sw.close, cam: () => $('cam').value,"),
  ("$('closesw').hidden = m !== 'fight';", "$('closesw').hidden = m !== 'fight' || $('cam').value !== 'wide';"),
  ("  $('again').addEventListener('click',", "  $('cam').addEventListener('change', () => { $('closesw').hidden = mode !== 'fight' || $('cam').value !== 'wide'; });\n  $('again').addEventListener('click',"),
])
edit('src/pilot.tpl.html', [
  ('    <label class="row"><span class="muted">Foes</span> <select id="count">',
   '    <label class="row"><span class="muted">Camera</span> <select id="cam"><option value="wide">Wide, as it was</option><option value="near" selected>Closer</option><option value="actor">On whoever acts</option><option value="shoulder">Over the shoulder</option><option value="low">Low and close</option></select></label>\n'
   '    <label class="row"><span class="muted">Foes</span> <select id="count">'),
  ('  <div class="notes">\n    <div>\n      <h2>The Flipbook look</h2>',
   '  <div class="notes">\n    <div>\n      <h2>Fight cameras</h2>\n      <ul>\n'
   '        <li><b>Wide, as it was</b>: the whole clearing, and a closer window when someone moves.</li>\n'
   '        <li><b>Closer</b>: only as much of the place as holds whoever is still standing. Tighter again on a move.</li>\n'
   '        <li><b>On whoever acts</b>: the picture goes to whoever is moving, then to whoever is hit.</li>\n'
   '        <li><b>Over the shoulder</b> and <b>Low and close</b>: the camera really moves for the length of a move, then cuts back. The painting cannot turn with it, so it is shown out of focus behind them.</li>\n'
   '      </ul>\n    </div>\n    <div>\n      <h2>The Flipbook look</h2>'),
  ('id="pix" min="0" max="100" step="1" value="45"', 'id="pix" min="0" max="100" step="1" value="100"'),
  ("<title>Moon Faire pilot: the Flipbook look</title>", "<title>Moon Faire pilot: fight cameras and the Flipbook look</title>"),
])
print('fight cameras are in: src/stage.js, src/fight.js, src/main.js, src/pilot.tpl.html')
```

### The change to patch_pilot_flipbook.py

The copy of that script in `claude/flipbook-look-finer-and-pilot.md` was written before the branch took the stage's half of the look, and stops on today's branch. One line makes it skip the stage when the look is already there. Where it says `edit('src/stage.js', [`, put:

```python
if 'flip: { on: false' in open(os.path.join(G, 'src/stage.js'), encoding='utf-8').read(): print('src/stage.js already has the look: left as it is')
else: edit('src/stage.js', [
```
