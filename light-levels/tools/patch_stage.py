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
