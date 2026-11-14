# Adds the Flipbook look to src/stage.js. The stage part of patch_pilot_flipbook.py from the project note
# claude/flipbook-look-finer-and-pilot.md (written by the session that made "Moon Faire pilot: the Flipbook look"), applied once on
# November 13. The pilot page's own switch and sliders (src/main.js, pilot.tpl.html) are not added here. Two small things are new:
# stage.flipColours(list) swaps the list of colours, and stage.ownColours(image) works a list out from a picture.
# With stage.flip.on false, a picture is drawn exactly as before. Every replacement must be found exactly once.
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
  ("    info() { const i = renderer.info.render; return { triangles: i.triangles, calls: i.calls }; },", "    info() { return api.last || { triangles: 0, calls: 0 }; },      // the cast's own count (the look adds three small passes)\n    flipColours(list) { postMat.uniforms.uPal.value = toV((list || WITCH_PAL).slice(0, NPW)); }, ownColours,      // the look's list of colours can be swapped (never more than the stage was made with)"),
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
print('the Flipbook look is in src/stage.js')
