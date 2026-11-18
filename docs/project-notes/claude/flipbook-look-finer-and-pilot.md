# The Flipbook look: a finer version, and the look on the pilot

November 13, 2026, evening. Read after `claude/HOW-TO-flipbook-look.md`.

## What Chris asked (his words)

- "Yes, I want to see the flipbook pixel button for the pilot using the same technique as the flipbook style flipbook look button."
- "If possible, can we make a finer detail flipbook pixel filter for the pilot and the jester and fox witches. I just want to see a intermediary between the current flipbook look and no flipbook look. If you could make a slider, that would be cool."

## The pages

- **Moon Faire pilot: the Flipbook look**: https://claude.ai/artifact/8xmYGwUDoJXSU65FMk9dWg. A new page, a copy of the pilot. The starter-world session's own page (https://claude.ai/artifact/PkUTHyHVp9ZQDwvNgtUFqh) was not touched.
- **Jester Witch 3D: how light can she go**: https://claude.ai/artifact/Xk8Y7ojoPE9yLuEantbvUh. Same link as before, now with the two sliders.
- **Fox Witch 3D: how light can she go**: https://claude.ai/artifact/MtcEi9TdtLCh4CroRm6Jgo. Same link, now with the two sliders.

Nothing was pushed to the repo. The model branches and the starter-world branch were only read.

## The finer look: two sliders

Both appear when Flipbook look is switched on.

- **Pixel size.** On the witches' pages it goes from the look as it was (4.75 mm of her to a pixel) down to 0.8 mm, which is as fine as most screens. On the pilot it is a number of rows down the screen, 240 (chunky) to 1,440 (fine). At the fine end no pixels show: only the colours and the ink are left.
- **Colours.** From the smooth colours (0%) to the flipbook's own (100%). In between, each pixel is a mix of its smooth colour and its flipbook colour, and the push on saturation and contrast is scaled down by the same amount. The outline is inked at every setting.

So "halfway to no flipbook" can be reached two ways, and they can be mixed: smaller pixels, or softer colours.

## How it is done

The look used to be one step: draw her small, then ink, colour and enlarge in one go. That only works when each of her pixels is a whole number of screen pixels. Now it is two steps:

1. She is drawn small into a picture of her own (as before).
2. Ink and colours are done into a second small picture of the same size.
3. That second picture is enlarged onto the screen with hard pixels whose edges are one screen pixel soft. Any size of pixel is clean, not only whole ones.

In `stage.js` this adds `rt2`, `upMat`, `upScene`, and two settings beside `stage.look` and `stage.mmPerPixel`:

- `stage.pixelWhole` (starts `true`): `true` keeps whole screen pixels to each of hers, as the look always was. `false` lets `mmPerPixel` take any value.
- `stage.snap` (starts `1`): 1 is the flipbook's colours, 0 is the smooth colours.

With `pixelWhole` true and `snap` 1 the picture is the old look. A page that sets nothing sees no change.

The slider on the witches' pages:

```js
// v is 0 to 100. 0 is the look as it was.
stage.pixelWhole = v === 0;
stage.mmPerPixel = 4.75 * Math.pow(0.8 / 4.75, v / 100);
stage.snap = s / 100;      // the Colours slider, 0 to 100
```

## What the pilot needed that the witches' pages did not

- **Its own measure of pixel size.** At the pilot's distances 4.75 mm of her is smaller than a pixel of the screen, so the witches' setting shows nothing. The pilot counts rows down the screen instead (`stage.flip.rows`).
- **The painting.** Three choices on the page, so Chris can decide: pixels in the painting's own colours, pixels in the witches' colours, or left smooth with only the cast pixelled.
  - The witches' 56 colours do not suit a painting: it goes pink and purple, and anything green is lost.
  - Its own colours: 64, worked out once when the painting loads. Each colour counts for much less than its share (count to the power 0.6, a little more for strong colours), or the big dull areas take every slot.
- **The painting's pixels must not swim.** The window on the painting moves a whole pixel of the grid at a time.
- **Greens for the wisp.** The 56 have no green and the wisp came out white. Three greens are added to the pilot's list: `[176,250,170]`, `[140,214,132]`, `[84,150,96]`. That makes 59. With the Fox's three blouse colours it will be 62 of 64.
- **Glows.** Lamps, moths, fireflies and the wisp's light were drawn with ordinary adding, which the look takes for something solid and inks. The stage changes those materials to the adding that leaves the see-through channel alone (the HOW-TO's section 6), once, as it finds them. On the screen the two look the same.
- **The patch at her feet** is drawn a little weaker in the look, so it stays a shadow and is not inked as a thing.
- **Darkening for a spell** is done after the painting's colours are chosen, so the pixels dim without changing colour.

## Checked, and not

- Pilot: walking and fighting, the look off and on, several settings of both sliders, the three choices for the painting, at laptop and phone size. Stills only.
- With the look off, the patched pilot draws the same picture as the starter-world build (to within 1 or 2 levels in 255 where moths and fireflies are).
- Jester: four panels, the glow, the fight test, with the sliders. Fox: across the slider's range.
- On a screen with few pixels the old look is already close to the finest step, so the Pixel size slider has little room. It shows best on a laptop or a phone with a sharp screen.
- **Not checked: real speed, and how it looks in motion.** The test browser draws about two pictures a second. The look adds three small passes over the screen, which should cost very little, but that is a guess until Chris runs it.
- **Not checked:** the Ranger and Io with the sliders. Their pages have the old look only.

## Still open, for Chris

- On painted places: pixel the whole picture, or only the cast? The pilot page lets him try all three.
- Where the sliders should rest, if the game is to use the look.
- Whether to put these changes in the repo, and hand the pilot patch to the starter-world session.

## To apply it

Two scripts, both below in full. Every replacement must be found exactly once, or the script stops.

- `patch_stage.py`: makes the witches' `stage.js` into the one with panels and the finer look. Written against the Jester's `viewer/stage.js` (branch `claude/jester-3d-model`); the Fox's is the same file. The last five replacements are the finer look. The first three (panels side by side) are for the "how light can she go" pages and can be left out. The paths at the top and bottom are this session's and need changing.
- `patch_pilot_flipbook.py`: run on the `game/` folder of branch `claude/moon-faire-starter-world` (written against commit `afcee0f`). It needs `models/jester/palette.js`, a copy of `models/jester-3d/out/palette.js`.

### patch_stage.py

```python
# Makes stage_lod.js from stage.js: the same stage, and one more way to draw a frame: several panels side by side, each
# showing the same place through the same camera with whatever the page makes visible for it.
s=open('/home/claude/work/stage.js',encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:60],s.count(a)); s=s.replace(a,b)
rep("""  function drawHer(target) {                               // her, her spells and whatever stands with her, over what is already there
    if (api.look !== 'flipbook') { renderer.setRenderTarget(target); renderer.render(scene, camera); return; }
    renderer.getDrawingBufferSize(_sz);""",
"""  function drawHer(target, PW, PH) {                       // her, her spells and whatever stands with her, over what is already there (PW, PH: the size of the panel being drawn, when it is not the whole canvas)
    if (api.look !== 'flipbook') { renderer.setRenderTarget(target); renderer.render(scene, camera); return; }
    renderer.getDrawingBufferSize(_sz); if (PW) _sz.set(PW, PH);""")
rep("""  // the light and its shadow go where she goes""",
"""  // Several pictures in one frame. panels: [{ x, y, w, h, show }] in CSS pixels, y measured up from the bottom of the canvas;
  // show() makes visible whatever that panel is to hold. Every panel looks through the same camera at the same place.
  const _css = new THREE.Vector2();
  function renderPanels(panels) {
    for (const [l, base, k] of LIT) l.intensity = base * (1 - k * api.dim);
    const sq = api.square && world.children.length > 0, flip = api.look === 'flipbook', glow = api.glow && !glowBad, pr = renderer.getPixelRatio();
    floor.visible = !sq && !flip && !api.noFloor;
    let target = null;
    if (glow) { try { glowSize(); target = main; } catch (e) { glowBad = true; target = null; } }
    const ac = renderer.autoClear; renderer.autoClear = false; scene.background = null; renderer.getSize(_css);
    const b = api.bg || BG;
    const whole = () => { if (target) { target.viewport.set(0, 0, target.width, target.height); target.scissor.set(0, 0, target.width, target.height); target.scissorTest = false; } renderer.setViewport(0, 0, _css.x, _css.y); renderer.setScissor(0, 0, _css.x, _css.y); renderer.setScissorTest(false); };
    whole(); renderer.setRenderTarget(target); renderer.setClearColor(sq ? _black : b, 1); renderer.clear();
    if (sq) postMat.uniforms.uBg.value.set(0.10, 0.075, 0.13); else postMat.uniforms.uBg.value.set(b.r, b.g, b.b);
    for (const p of panels) {
      if (p.show) p.show();
      camera.aspect = p.w / p.h; placeCamera();
      const X = Math.floor(p.x * pr), Y = Math.floor(p.y * pr), W = Math.max(1, Math.floor(p.w * pr)), H = Math.max(1, Math.floor(p.h * pr));
      if (target) { target.viewport.set(X, Y, W, H); target.scissor.set(X, Y, W, H); target.scissorTest = true; }
      renderer.setViewport(p.x, p.y, p.w, p.h); renderer.setScissor(p.x, p.y, p.w, p.h); renderer.setScissorTest(true);
      renderer.setRenderTarget(target);
      if (sq) {
        if (api.worldLight) api.worldLight(api.dim, api.dark);
        renderer.render(world, camera);
        const d = Math.min(1, Math.max(0, api.dark)); if (d > 0.003) { darkMat.color.setScalar(1 - d); pass(darkMat, target); }
      }
      drawHer(target, W, H);
    }
    whole(); renderer.setRenderTarget(target);
    if (glow) { try { bloom(); } catch (e) { glowBad = true; } }
    renderer.setRenderTarget(null); renderer.autoClear = ac;
  }
  // the light and its shadow go where she goes""")
rep("follow, resize, render, placeCamera, BG,", "follow, resize, render, renderPanels, placeCamera, BG,")
# ---- the finer Flipbook look (November 13, evening): any size of pixel, and colours that can go part of the way ----
# stage.mmPerPixel was always there; stage.pixelWhole = false now lets it take any value (the small picture is enlarged with hard pixels whose
# edges are one screen pixel soft, so sizes between whole numbers are clean), and stage.snap goes from 1 (the flipbook's colours) to 0 (smooth colours).
# With pixelWhole true and snap 1, the look is the one it has always been.
rep("""      ' vec3 col = c.rgb + uBg * (1.0 - c.a); float l = dot(col, vec3(0.30, 0.59, 0.11)); col = clamp(l + (col - l) * 1.4, 0.0, 1.0); col = clamp((col - 0.42) * 1.14 + 0.42, 0.0, 1.0); if (m < 0.4) col *= 0.45;\\n' +""",
    """      ' vec3 col = c.rgb + uBg * (1.0 - c.a); float l = dot(col, vec3(0.30, 0.59, 0.11)); col = clamp(l + (col - l) * (1.0 + 0.4 * uSnap), 0.0, 1.0); col = clamp((col - 0.42) * (1.0 + 0.14 * uSnap) + 0.42, 0.0, 1.0); if (m < 0.4) col *= 0.45;\\n' +""")
rep("""  const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat); postQuad.frustumCulled = false; postScene.add(postQuad);""",
    """  const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat); postQuad.frustumCulled = false; postScene.add(postQuad);
  // the finished small picture, and the pass that enlarges it
  const rt2 = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: false });
  const upMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    uniforms: { tU: { value: rt2.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uScale: { value: new THREE.Vector2(1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tU; uniform vec2 uRes; uniform vec2 uScale; varying vec2 vUv;\\n' +
      'void main(){ vec2 p = vUv * uRes; vec2 i = floor(p); vec2 x = (p - i) * uScale;\\n' +                 // x: where this screen pixel sits inside its pixel of the small picture, in screen pixels
      ' vec2 sh = clamp(x - (uScale - 0.5), 0.0, 0.5) - clamp(0.5 - x, 0.0, 0.5);\\n' +                        // within half a screen pixel of an edge, lean toward the neighbour
      ' gl_FragColor = texture2D(tU, (i + 0.5 + sh) / uRes); }' });
  const upScene = new THREE.Scene(), upQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), upMat); upQuad.frustumCulled = false; upScene.add(upQuad);""")
rep("const api = { look: 'smooth', mmPerPixel: 4.75,", "const api = { look: 'smooth', mmPerPixel: 4.75, pixelWhole: true, snap: 1,")
rep("""    const want = vis / (api.mmPerPixel / 1000), div = Math.max(1, Math.round(_sz.y / want)), h = Math.max(48, Math.round(_sz.y / div)), w = Math.max(16, Math.round(_sz.x / div));
    if (rt.width !== w || rt.height !== h) { rt.setSize(w, h); postMat.uniforms.uRes.value.set(w, h); }
    const oc = renderer.getClearAlpha(); renderer.getClearColor(_cc); renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera);
    renderer.setClearColor(_cc, oc); renderer.setRenderTarget(target); renderer.render(postScene, postCam);""",
"""    const want = vis / (api.mmPerPixel / 1000); let w, h;
    if (api.pixelWhole) { const div = Math.max(1, Math.round(_sz.y / want)); h = Math.max(48, Math.round(_sz.y / div)); w = Math.max(16, Math.round(_sz.x / div)); }      // whole screen pixels to each of hers
    else { h = Math.max(48, Math.min(_sz.y, Math.round(want))); w = Math.max(16, Math.round(_sz.x * h / _sz.y)); }                                                      // any size, down to the screen's own
    if (rt.width !== w || rt.height !== h) { rt.setSize(w, h); rt2.setSize(w, h); postMat.uniforms.uRes.value.set(w, h); upMat.uniforms.uRes.value.set(w, h); }
    upMat.uniforms.uScale.value.set(_sz.x / w, _sz.y / h); postMat.uniforms.uSnap.value = api.snap;
    const oc = renderer.getClearAlpha(); renderer.getClearColor(_cc); renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera);
    renderer.setRenderTarget(rt2); renderer.clear(); renderer.render(postScene, postCam);      // her as inked pixels, in a small picture of its own
    renderer.setClearColor(_cc, oc); renderer.setRenderTarget(target); renderer.render(upScene, postCam);      // and that picture enlarged over what is behind her""")
open('/home/claude/work/stage_lod.js','w',encoding='utf-8').write(s); print('ok')

```

### patch_pilot_flipbook.py

```python
# patch_pilot_flipbook.py: adds the Flipbook look to the starter-world pilot. Run from the repo's game/ folder (or pass its path).
# It changes src/stage.js, src/main.js, src/pilot.tpl.html and build_pilot.py, and needs models/jester/palette.js
# (a copy of models/jester-3d/out/palette.js from branch claude/jester-3d-model: the 56 colours every witch shares).
# Every replacement must be found exactly once, or the script stops. With the switch off, a picture is drawn exactly as before.
import sys, os
G = sys.argv[1] if len(sys.argv) > 1 else '.'
def edit(path, pairs):
    p = os.path.join(G, path); s = open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, a[:70], s.count(a)); s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s)

LOOK = r'''
  // ---- the Flipbook look (the same technique as on the witches' own stages, models/jester-3d/viewer/stage.js) ----
  // The cast is drawn small into a picture of its own, every solid pixel takes the nearest of the flipbook's colours, and the figure
  // gets an inked outline. Then it is laid over the painting. Four things are this stage's own:
  //  - the pixel grid is a number of rows down the screen (flip.rows), any number: a slider. On the witches' stages a pixel is 4.75 mm of
  //    her, which at this game's distances is smaller than a pixel of the screen, so nothing would show;
  //  - the small picture is enlarged with hard pixels whose edges are one screen pixel soft, so any size of pixel is clean, not only whole ones;
  //  - flip.snap goes from 1 (every pixel one of the flipbook's colours) to 0 (the smooth colours, still pixelled and inked);
  //  - the painting is put on the same grid, in its own colours (worked out once from the painting), in the witches' colours, or left smooth;
  //  - the window of the painting moves a whole pixel of the grid at a time, so the painting's pixels do not swim as she walks.
  const WITCH_PAL = (o.palette || window.JESTER_PALETTE || []).slice(0, 64), NPW = Math.max(1, WITCH_PAL.length);
  const toV = (list) => { const v = [], n = Math.max(1, list.length); for (let i = 0; i < 64; i++) { const p = list[i % n] || [0, 0, 0]; v.push(new THREE.Vector3(p[0] / 255, p[1] / 255, p[2] / 255)); } return v; };
  const rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat }); rt.texture.encoding = THREE.sRGBEncoding;
  const postMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    uniforms: { tD: { value: rt.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uPal: { value: toV(WITCH_PAL) }, uBg: { value: new THREE.Vector3(0.10, 0.075, 0.13) }, uSnap: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tD; uniform vec2 uRes; uniform vec3 uPal[64]; uniform vec3 uBg; uniform float uSnap; varying vec2 vUv;\n' +
      'void main(){ vec2 px = 1.0 / uRes; vec2 uv = (floor(vUv * uRes) + 0.5) * px; vec4 c = texture2D(tD, uv);\n' +
      ' float n = max(max(texture2D(tD, uv + vec2(px.x, 0.0)).a, texture2D(tD, uv - vec2(px.x, 0.0)).a), max(texture2D(tD, uv + vec2(0.0, px.y)).a, texture2D(tD, uv - vec2(0.0, px.y)).a));\n' +
      ' float m = min(min(texture2D(tD, uv + vec2(px.x, 0.0)).a, texture2D(tD, uv - vec2(px.x, 0.0)).a), min(texture2D(tD, uv + vec2(0.0, px.y)).a, texture2D(tD, uv - vec2(0.0, px.y)).a));\n' +
      ' if (c.a < 0.5) { if (n > 0.6) gl_FragColor = vec4(0.075, 0.05, 0.065, 1.0); else gl_FragColor = vec4(c.rgb, c.a); return; }\n' +                          // the inked outline; elsewhere only shadow, and what light the cast and its spells add
      ' vec3 col = c.rgb + uBg * (1.0 - c.a); float l = dot(col, vec3(0.30, 0.59, 0.11)); col = clamp(l + (col - l) * (1.0 + 0.4 * uSnap), 0.0, 1.0); col = clamp((col - 0.42) * (1.0 + 0.14 * uSnap) + 0.42, 0.0, 1.0); if (m < 0.4) col *= 0.45;\n' +                       // colours pushed toward painted pixels (less so as the snap is turned down); the rim of the figure, inked
      ' float best = 1e9; vec3 pick = col; for (int i = 0; i < ' + NPW + '; i++) { vec3 d = col - uPal[i]; float e = dot(d * d, vec3(0.30, 0.59, 0.11)); if (e < best) { best = e; pick = uPal[i]; } }\n' +
      ' gl_FragColor = vec4(mix(col, pick, uSnap), 1.0); }' });
  const postScene = new THREE.Scene(), postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat); postQuad.frustumCulled = false; postScene.add(postQuad);
  // the painting on the same grid: each pixel of the grid is the average of the painting under it, then takes the nearest colour of its list
  const paintMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: { tP: { value: null }, uRes: { value: new THREE.Vector2(4, 4) }, uWin: { value: new THREE.Vector4(0, 0, 1, 1) }, uPal: { value: toV([]) }, uN: { value: 1 }, uSnap: { value: 1 }, uDim: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tP; uniform vec2 uRes; uniform vec4 uWin; uniform vec3 uPal[64]; uniform float uN; uniform float uSnap; uniform float uDim; varying vec2 vUv;\n' +
      'void main(){ vec2 px = 1.0 / uRes; vec2 c0 = vUv; vec3 col = vec3(0.0);\n' +
      ' for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) { vec2 q = c0 + (vec2(float(i), float(j)) - 0.5) * 0.5 * px; col += texture2D(tP, uWin.xy + q * uWin.zw).rgb; }\n' +
      ' col *= 0.25; float best = 1e9; vec3 pick = col;\n' +
      ' for (int i = 0; i < 64; i++) { if (float(i) >= uN) break; vec3 d = col - uPal[i]; float e = dot(d, d); if (e < best) { best = e; pick = uPal[i]; } }\n' +
      ' gl_FragColor = vec4(mix(col, pick, uSnap) * uDim, 1.0); }' });      // darkening comes after the colours are chosen, so a spell dims the pixels without making them change colour
  // the finished small picture (painting and cast together, or the cast alone), and the pass that enlarges it onto the screen
  const rt2 = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: false });
  const upMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    uniforms: { tU: { value: rt2.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uScale: { value: new THREE.Vector2(1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tU; uniform vec2 uRes; uniform vec2 uScale; varying vec2 vUv;\n' +
      'void main(){ vec2 p = vUv * uRes; vec2 i = floor(p); vec2 x = (p - i) * uScale;\n' +                 // x: where this screen pixel sits inside its pixel of the grid, in screen pixels
      ' vec2 sh = clamp(x - (uScale - 0.5), 0.0, 0.5) - clamp(0.5 - x, 0.0, 0.5);\n' +                        // within half a screen pixel of an edge, lean toward the neighbour
      ' gl_FragColor = texture2D(tU, (i + 0.5 + sh) / uRes); }' });
  const upScene = new THREE.Scene(), upQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), upMat); upQuad.frustumCulled = false; upScene.add(upQuad);
  const paintScene = new THREE.Scene(), paintQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), paintMat); paintQuad.frustumCulled = false; paintScene.add(paintQuad);
  // A painting's own colours, worked out once when it loads: 64 of them. Each colour counts for far less than its share of the picture, so
  // small bright things (a lamp, a flag) keep a place. Counting plain pixels gives a washed-out list: the big dull areas take every slot.
  function ownColours(im) {
    const k = document.createElement('canvas'), W = 192, Hh = Math.max(1, Math.round(W * im.height / im.width)); k.width = W; k.height = Hh;
    const g = k.getContext('2d'); g.drawImage(im, 0, 0, W, Hh); const d = g.getImageData(0, 0, W, Hh).data, seen = new Map();
    for (let i = 0; i < d.length; i += 4) { const key = (d[i] >> 3) << 10 | (d[i + 1] >> 3) << 5 | (d[i + 2] >> 3); seen.set(key, (seen.get(key) || 0) + 1); }
    const pts = []; seen.forEach((n, key) => { const r = ((key >> 10) & 31) * 8 + 4, gr = ((key >> 5) & 31) * 8 + 4, b = (key & 31) * 8 + 4; pts.push([r, gr, b, Math.pow(n, 0.6) * (1 + (Math.max(r, gr, b) - Math.min(r, gr, b)) / 255)]); });      // strong colours count a little more
    let boxes = [pts];
    const span = (b) => { let best = 0, ax = 0, wsum = 0; for (let a = 0; a < 3; a++) { let lo = 255, hi = 0; for (const p of b) { if (p[a] < lo) lo = p[a]; if (p[a] > hi) hi = p[a]; } if (hi - lo > best) { best = hi - lo; ax = a; } } for (const p of b) wsum += p[3]; return [best * Math.sqrt(wsum), ax]; };
    while (boxes.length < 64) {
      let bi = -1, bs = 0, bax = 0; boxes.forEach((b, i) => { if (b.length < 2) return; const [s, ax] = span(b); if (s > bs) { bs = s; bi = i; bax = ax; } });
      if (bi < 0) break;
      const b = boxes[bi].sort((p, q) => p[bax] - q[bax]); let half = 0, tot = 0, cut = 1; for (const p of b) tot += p[3]; for (let i = 0; i < b.length - 1; i++) { half += b[i][3]; if (half >= tot / 2) { cut = i + 1; break; } }
      boxes.splice(bi, 1, b.slice(0, cut), b.slice(cut));
    }
    const pal = boxes.map((b) => { let r = 0, gg = 0, bl = 0, w = 0; for (const p of b) { r += p[0] * p[3]; gg += p[1] * p[3]; bl += p[2] * p[3]; w += p[3]; } return [r / w, gg / w, bl / w]; });
    for (let round = 0; round < 4; round++) {            // then each colour moves to the middle of the pixels nearest it, four times over
      const sum = pal.map(() => [0, 0, 0, 0]);
      for (const p of pts) { let best = 1e9, bi = 0; for (let i = 0; i < pal.length; i++) { const q = pal[i], e = (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]) + (p[2] - q[2]) * (p[2] - q[2]); if (e < best) { best = e; bi = i; } } const a = sum[bi]; a[0] += p[0] * p[3]; a[1] += p[1] * p[3]; a[2] += p[2] * p[3]; a[3] += p[3]; }
      sum.forEach((a, i) => { if (a[3] > 0) pal[i] = [a[0] / a[3], a[1] / a[3], a[2] / a[3]]; });
    }
    return pal;
  }
  // Light that is added (lamp glow, moths, a wisp) must leave the picture's see-through channel alone, or the look takes the air round it for
  // something solid and inks it. On the screen the two ways of adding look the same, so a material is changed once and stays changed.
  const _pts = [];
  function tameGlows() {
    _pts.length = 0;
    cast.traverse((ob) => {
      const ms = ob.material ? (Array.isArray(ob.material) ? ob.material : [ob.material]) : [];
      for (const m of ms) {
        if (m.blending === THREE.AdditiveBlending) { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = m.premultipliedAlpha ? THREE.OneFactor : THREE.SrcAlphaFactor; m.blendDst = THREE.OneFactor; m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor; }
        if (ob.isPoints && m.isPointsMaterial && !m.sizeAttenuation) { if (m.userData.mfSize == null) m.userData.mfSize = m.size; _pts.push(m); }      // specks sized in screen pixels shrink with the grid
      }
    });
  }
  const _buf = new THREE.Vector2(), _cc = new THREE.Color(); let glowT = 0;
'''
edit('src/stage.js', [
  ("    info() { const i = renderer.info.render; return { triangles: i.triangles, calls: i.calls }; },", "    info() { return api.last || { triangles: 0, calls: 0 }; },      // the cast's own count (the look adds three small passes)"),
  ("  const THEATRE = new THREE.Color('#383043');", "  const THEATRE = new THREE.Color('#383043');" + LOOK),
  ("  function footPatch(r) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false, toneMapped: false }));",
   "  const patches = [];\n  function footPatch(r) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false, toneMapped: false })); patches.push(m.material);"),
  ("    textures: {},", "    textures: {}, ownPal: {},\n    flip: { on: false, rows: 540, snap: 1, painting: 'own' },      // the Flipbook look: on or off; rows of pixels down the screen; how far colours go to the flipbook's (0 to 1); the painting 'own' (its own colours), 'witch' (the witches' colours) or 'smooth'"),
  ("t.needsUpdate = true; api.textures[id] = t; if (cb) cb(t); }; im.src = src;", "t.needsUpdate = true; api.textures[id] = t; try { api.ownPal[id] = toV(ownColours(im)); } catch (e) { api.ownPal[id] = null; } if (cb) cb(t); }; im.src = src;"),
  ("""      const W = api.win, wx = Math.max(0, Math.min(FW - W.w, W.x + sx)), wy = Math.max(0, Math.min(FH - W.h, W.y + sy));
      renderer.setRenderTarget(null); renderer.setClearColor(THEATRE, 1); renderer.clear();
      if (api.painting && bgMat.map) {""",
   """      const W = api.win, F = api.flip; let wx = Math.max(0, Math.min(FW - W.w, W.x + sx)), wy = Math.max(0, Math.min(FH - W.h, W.y + sy)), gw = 0, gh = 0;
      if (F.on) {                                        // the grid: whole screen pixels to each of its pixels, and the window on a whole step of it
        renderer.getDrawingBufferSize(_buf); gh = Math.max(48, Math.min(_buf.y, Math.round(F.rows))); gw = Math.max(16, Math.round(_buf.x * gh / _buf.y));
        const cx = W.w / gw, cy = W.h / gh; wx = Math.min(FW - W.w, Math.round(wx / cx) * cx); wy = Math.min(FH - W.h, Math.round(wy / cy) * cy);
      }
      for (const m of patches) m.opacity = F.on ? 0.85 : 1;      // the soft patch at her feet stays under half strength in the look, so it is shadow and not a solid thing to ink
      renderer.setRenderTarget(null); renderer.setClearColor(THEATRE, 1); renderer.clear();
      const pixPaint = F.on && F.painting !== 'smooth' && api.painting && bgMat.map;
      if (F.on) {                                        // the small finished picture starts clear, or as the painting on the grid
        if (rt.width !== gw || rt.height !== gh) { rt.setSize(gw, gh); rt2.setSize(gw, gh); postMat.uniforms.uRes.value.set(gw, gh); upMat.uniforms.uRes.value.set(gw, gh); }
        upMat.uniforms.uScale.value.set(_buf.x / gw, _buf.y / gh); postMat.uniforms.uSnap.value = F.snap;
        renderer.getClearColor(_cc); const oc = renderer.getClearAlpha(); renderer.setClearColor(0x000000, 0); renderer.setRenderTarget(rt2); renderer.clear(); renderer.setClearColor(_cc, oc);
      }
      if (pixPaint) {
        const u = paintMat.uniforms, own = F.painting === 'own' && api.ownPal[S.art]; u.tP.value = bgMat.map; u.uRes.value.set(gw, gh); bgMat.map.repeat.set(1, 1); bgMat.map.offset.set(0, 0);
        u.uWin.value.set(wx / FW, 1 - (wy + W.h) / FH, W.w / FW, W.h / FH); u.uPal.value = own || postMat.uniforms.uPal.value; u.uN.value = own ? 64 : NPW; u.uSnap.value = F.snap; u.uDim.value = 1 - 0.93 * Math.min(1, Math.max(0, api.dark));
        renderer.render(paintScene, bgCam); renderer.setRenderTarget(null);
      } else if (api.painting && bgMat.map) {
        renderer.setRenderTarget(null);"""),
  ("""      camera.setViewOffset(FW, FH, wx, wy, W.w, W.h);
      renderer.render(cast, camera);
    },""",
   """      camera.setViewOffset(FW, FH, wx, wy, W.w, W.h);
      if (!F.on) { for (const m of _pts) m.size = m.userData.mfSize; _pts.length = 0; renderer.render(cast, camera); api.last = { triangles: renderer.info.render.triangles, calls: renderer.info.render.calls }; return; }
      if (--glowT <= 0) { tameGlows(); glowT = 20; }
      for (const m of _pts) m.size = Math.max(1, m.userData.mfSize * gh / _buf.y);
      const oc = renderer.getClearAlpha(); renderer.getClearColor(_cc); renderer.setClearColor(0x000000, 0);
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(cast, camera); renderer.setClearColor(_cc, oc); api.last = { triangles: renderer.info.render.triangles, calls: renderer.info.render.calls + 3 };
      renderer.setRenderTarget(rt2); renderer.render(postScene, bgCam);             // the cast as inked pixels, over the painting's pixels or over nothing
      renderer.setRenderTarget(null); renderer.render(upScene, bgCam);              // and the small picture onto the screen
    },"""),
])
edit('src/main.js', [
  ("      stage = makeMFStage(canvas, { preserve: manual, shadow: 2048 });",
   "      // The Flipbook look's colours: the 56 every witch shares, then three greens for the wisp. The 56 have no green, and the wisp came out\n"
   "      // white. (The Fox adds her three blouse colours the same way when she joins: 64 is the most the look holds.)\n"
   "      const FOE_COLOURS = [[176, 250, 170], [140, 214, 132], [84, 150, 96]];\n"
   "      stage = makeMFStage(canvas, { preserve: manual, shadow: 2048, palette: (window.JESTER_PALETTE || []).concat(FOE_COLOURS) });"),
  ("const made = {}, sw = { live: true, close: true, painting: true };", "const made = {}, sw = { live: true, close: true, painting: true, flip: false };"),
  ("flip('livesw', 'live'); flip('closesw', 'close'); flip('paintsw', 'painting', () => { stage.painting = sw.painting; });",
   "flip('livesw', 'live'); flip('closesw', 'close'); flip('paintsw', 'painting', () => { stage.painting = sw.painting; });\n"
   "  // the Flipbook look: the cast drawn as pixels in the flipbook's colours with an inked outline, and the painting on the same grid\n"
   "  // Pixel size is a slider from chunky to as fine as the screen; Colours goes from the smooth colours to the flipbook's own.\n"
   "  const flipSet = () => { const rows = Math.round(240 * Math.pow(6, +$('pix').value / 100)); stage.flip.on = sw.flip; stage.flip.rows = rows; stage.flip.snap = +$('snap').value / 100; stage.flip.painting = $('ppix').value;\n"
   "    $('pixout').textContent = rows + ' rows'; $('snapout').textContent = $('snap').value + '%'; for (const id of ['pixlab', 'snaplab', 'ppixlab']) $(id).hidden = !sw.flip; };\n"
   "  flip('flipsw', 'flip', flipSet); for (const id of ['pix', 'snap']) $(id).addEventListener('input', flipSet); $('ppix').addEventListener('change', flipSet);"),
])
edit('src/pilot.tpl.html', [
  ('  <div class="notes">\n    <div>\n      <h2>Walking</h2>',
   '  <div class="notes">\n    <div>\n      <h2>The Flipbook look</h2>\n      <ul>\n'
   '        <li>The same look as on the witches\' own pages: everyone who moves is drawn as pixels in the flipbook\'s colours, with an inked outline.</li>\n'
   '        <li><b>Pixel size</b> slides from chunky to as fine as this screen. At the fine end there are no pixels to see, only the colours and the ink.</li>\n'
   '        <li><b>Colours</b> slides from the smooth colours to the flipbook\'s own. Halfway is in between.</li>\n'
   '        <li><b>The painting</b> can be put on the same pixels in its own colours, in the witches\' colours (they do not suit it), or left smooth.</li>\n'
   '      </ul>\n    </div>\n    <div>\n      <h2>Walking</h2>'),
  ("<title>Moon Faire pilot: the Jester in the paintings</title>", "<title>Moon Faire pilot: the Flipbook look</title>"),
  ('    <button type="button" id="paintsw" aria-pressed="true">The painting</button>',
   '    <button type="button" id="paintsw" aria-pressed="true">The painting</button>\n'
   '    <button type="button" id="flipsw" aria-pressed="false">Flipbook look</button>\n'
   '    <label class="row" id="pixlab" hidden><span class="muted">Pixel size: chunky</span> <input type="range" id="pix" min="0" max="100" step="1" value="45" aria-label="Pixel size, from chunky to fine"> <span class="muted">fine</span> <output id="pixout" class="muted"></output></label>\n'
   '    <label class="row" id="snaplab" hidden><span class="muted">Colours: smooth</span> <input type="range" id="snap" min="0" max="100" step="5" value="100" aria-label="Colours, from smooth to the flipbook\'s own"> <span class="muted">flipbook</span> <output id="snapout" class="muted"></output></label>\n'
   '    <label class="row" id="ppixlab" hidden><span class="muted">The painting in the look</span> <select id="ppix"><option value="own" selected>Pixels, its own colours</option><option value="witch">Pixels, the witches\' colours</option><option value="smooth">Left smooth</option></select></label>'),
  ("#stage { display: block; width: 100%; height: 100%; touch-action: none; }", "#stage { display: block; width: 100%; height: 100%; touch-action: none; }\ninput[type=range] { width: 150px; accent-color: #d9b24c; }"),
])
edit('build_pilot.py', [
  ("rd('models/jester/meshopt_simplifier.js'), rd('models/jester/jester_tex.js'),", "rd('models/jester/meshopt_simplifier.js'), rd('models/jester/palette.js'), rd('models/jester/jester_tex.js'),"),
])
print('the Flipbook look is in: src/stage.js, src/main.js, src/pilot.tpl.html, build_pilot.py')

```
