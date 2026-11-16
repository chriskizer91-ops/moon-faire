# finer_look.py: puts the finer Flipbook look (claude/HOW-TO-flipbook-look.md, section 11) into a witch's own page: the stage gets the
# enlarging pass, and the page gets two sliders that show while the look is on. Every piece of text must be found exactly once, or it stops.
# It works on the sources (viewer/stage.js and the page script) and equally on a finished page that has both inside it.
#   python3 finer_look.py jester <stage.js> <game.js>            python3 finer_look.py jester <built page.html>
#   python3 finer_look.py io     <stage.js> <index.tpl.html>     python3 finer_look.py io     <built page.html>
#   python3 finer_look.py fox    <stage.js> <app.js>             python3 finer_look.py fox    <built page.html>
# With the look off the picture does not change. With it on, the page opens at 1.2 mm of her to a pixel and full flipbook colours (what Chris
# liked, November 13); Pixel size all the way to chunky is the look as it was.
import sys

COL_OLD = "      ' vec3 col = c.rgb + uBg * (1.0 - c.a); float l = dot(col, vec3(0.30, 0.59, 0.11)); col = clamp(l + (col - l) * 1.4, 0.0, 1.0); col = clamp((col - 0.42) * 1.14 + 0.42, 0.0, 1.0); if (m < 0.4) col *= 0.45;\\n' +"
COL_NEW = "      ' vec3 col = c.rgb + uBg * (1.0 - c.a); float l = dot(col, vec3(0.30, 0.59, 0.11)); col = clamp(l + (col - l) * (1.0 + 0.4 * uSnap), 0.0, 1.0); col = clamp((col - 0.42) * (1.0 + 0.14 * uSnap) + 0.42, 0.0, 1.0); if (m < 0.4) col *= 0.45;\\n' +"
UP_SHADER = """    uniforms: { tU: { value: rt2.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uScale: { value: new THREE.Vector2(1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'precision highp float; uniform sampler2D tU; uniform vec2 uRes; uniform vec2 uScale; varying vec2 vUv;\\n' +
      'void main(){ vec2 p = vUv * uRes; vec2 i = floor(p); vec2 x = (p - i) * uScale;\\n' +                 // x: where this screen pixel sits inside its pixel of the small picture, in screen pixels
      ' vec2 sh = clamp(x - (uScale - 0.5), 0.0, 0.5) - clamp(0.5 - x, 0.0, 0.5);\\n' +                        // within half a screen pixel of an edge, lean toward the neighbour
      ' gl_FragColor = texture2D(tU, (i + 0.5 + sh) / uRes); }' });
  const upScene = new THREE.Scene(), upQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), upMat); upQuad.frustumCulled = false; upScene.add(upQuad);"""
RT2 = "  const rt2 = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: false });\n"
SIZE_NEW = """    const want = vis / (api.mmPerPixel / 1000); let w, h;
    if (api.pixelWhole) { const div = Math.max(1, Math.round(_sz.y / want)); h = Math.max(48, Math.round(_sz.y / div)); w = Math.max(16, Math.round(_sz.x / div)); }      // whole screen pixels to each of hers
    else { h = Math.max(48, Math.min(_sz.y, Math.round(want))); w = Math.max(16, Math.round(_sz.x * h / _sz.y)); }                                                      // any size, down to the screen's own
    if (rt.width !== w || rt.height !== h) { rt.setSize(w, h); rt2.setSize(w, h); postMat.uniforms.uRes.value.set(w, h); upMat.uniforms.uRes.value.set(w, h); }
    upMat.uniforms.uScale.value.set(_sz.x / w, _sz.y / h); postMat.uniforms.uSnap.value = api.snap;
"""
SIZE_OLD = """    const want = vis / (api.mmPerPixel / 1000), div = Math.max(1, Math.round(_sz.y / want)), h = Math.max(48, Math.round(_sz.y / div)), w = Math.max(16, Math.round(_sz.x / div));
    if (rt.width !== w || rt.height !== h) { rt.setSize(w, h); postMat.uniforms.uRes.value.set(w, h); }
"""

# The Jester's and Io's stage (the one with the square behind her): she is laid over what is behind her, so the enlarging pass blends.
STAGE = [
    (COL_OLD, COL_NEW),
    ("  const api = { look: 'smooth', mmPerPixel: 4.75, dim: 0, dark: 0, square: false, glow: false }, _sz = new THREE.Vector2();",
     "  // the finished small picture, and the pass that enlarges it\n" + RT2 +
     "  const upMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false, transparent: true,\n"
     "    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,\n" + UP_SHADER + "\n"
     "  const api = { look: 'smooth', mmPerPixel: 4.75, pixelWhole: true, snap: 1, dim: 0, dark: 0, square: false, glow: false }, _sz = new THREE.Vector2();"),
    (SIZE_OLD, SIZE_NEW),
    ("    renderer.setClearColor(_cc, oc); renderer.setRenderTarget(target); renderer.render(postScene, postCam);",
     "    renderer.setRenderTarget(rt2); renderer.clear(); renderer.render(postScene, postCam);      // her as inked pixels, in a small picture of its own\n"
     "    renderer.setClearColor(_cc, oc); renderer.setRenderTarget(target); renderer.render(upScene, postCam);      // and that picture enlarged over what is behind her"),
]
# The Fox's stage is the older one (the little theatre only, its colour filled in by the look itself), so her pass does not blend.
STAGE_FOX = [
    (COL_OLD, COL_NEW),
    ("  const api = { look: 'smooth', mmPerPixel: 4.75, dim: 0 }, _sz = new THREE.Vector2();",
     "  // the finished small picture, and the pass that enlarges it\n" + RT2 +
     "  const upMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false,\n" + UP_SHADER + "\n"
     "  const api = { look: 'smooth', mmPerPixel: 4.75, pixelWhole: true, snap: 1, dim: 0 }, _sz = new THREE.Vector2();"),
    (SIZE_OLD, SIZE_NEW),
    ("    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null);\n"
     "    renderer.setClearColor(0x000000, oc); renderer.render(postScene, postCam);",
     "    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera);\n"
     "    renderer.setRenderTarget(rt2); renderer.clear(); renderer.render(postScene, postCam);      // her as inked pixels, in a small picture of its own\n"
     "    renderer.setRenderTarget(null); renderer.setClearColor(0x000000, oc); renderer.render(upScene, postCam);      // and that picture enlarged to the screen"),
]

# The two sliders, made by the page script itself so the page's own markup stays as it is. %s is the row of chips they go under.
SLIDERS = """  // The finer Flipbook look (claude/HOW-TO-flipbook-look.md, section 11): two sliders that show while the look is on. They open at the setting
  // Chris liked for the witches: 1.2 mm of her to a pixel, full flipbook colours. Pixel size at chunky is the look as it first was (4.75 mm).
  const flipBox = document.createElement('div'); flipBox.id = 'flipset'; flipBox.style.cssText = 'display:none; margin-top:8px; font-size:13px; opacity:.9';
  flipBox.innerHTML = '<label style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">Pixel size: chunky <input type="range" id="pix" min="0" max="100" step="1" value="77" style="width:150px; accent-color:#d9b24c" aria-label="Pixel size, from chunky to fine"> fine <output id="pixout"></output></label>' +
    '<label style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:6px">Colours: smooth <input type="range" id="snap" min="0" max="100" step="5" value="100" style="width:150px; accent-color:#d9b24c" aria-label="Colours, from smooth to the flipbook\\'s own"> flipbook <output id="snapout"></output></label>';
  %s.parentNode.appendChild(flipBox);
  const flipSet = () => { const on = stage.look === 'flipbook', pix = +$('pix').value, mm = 4.75 * Math.pow(0.8 / 4.75, pix / 100); stage.pixelWhole = pix === 0; stage.mmPerPixel = mm; stage.snap = +$('snap').value / 100;
    $('pixout').textContent = mm.toFixed(1) + ' mm of her to a pixel'; $('snapout').textContent = $('snap').value + '%%'; flipBox.style.display = on ? 'block' : 'none'; };
  $('pix').addEventListener('input', flipSet); $('snap').addEventListener('input', flipSet);
"""
CHIP_OLD = "  chip(toggleRow, 'Flipbook look', (b) => { stage.look = stage.look === 'flipbook' ? 'smooth' : 'flipbook'; b.setAttribute('aria-pressed', stage.look === 'flipbook'); }, false);"
CHIP_NEW = SLIDERS % 'toggleRow' + "  chip(toggleRow, 'Flipbook look', (b) => { stage.look = stage.look === 'flipbook' ? 'smooth' : 'flipbook'; b.setAttribute('aria-pressed', stage.look === 'flipbook'); flipSet(); }, false);"
IO_OLD = "  toggle($('shows'), 'flipB', 'Flipbook look', false, (v) => { stage.look = v ? 'flipbook' : 'smooth'; });"
IO_NEW = SLIDERS % "$('shows')" + "  toggle($('shows'), 'flipB', 'Flipbook look', false, (v) => { stage.look = v ? 'flipbook' : 'smooth'; flipSet(); });"

PAIRS = {'jester': (STAGE, [(CHIP_OLD, CHIP_NEW)]), 'io': (STAGE, [(IO_OLD, IO_NEW)]), 'fox': (STAGE_FOX, [(CHIP_OLD, CHIP_NEW)])}

def apply(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, s.count(a), a[:90])
        s = s.replace(a, b.replace('</script', '<\\/script') if path.endswith('.html') else b)
    open(path, 'w', encoding='utf-8').write(s); print(path, 'done,', len(pairs), 'pieces')

if __name__ == '__main__':
    who = sys.argv[1]; stage, page = PAIRS[who]
    if len(sys.argv) == 3: apply(sys.argv[2], stage + page)
    else: apply(sys.argv[2], stage); apply(sys.argv[3], page)
