# stage_cameras.py: gives src/stage.js a camera that can really move (stage.free), for the fight's close shots.
# The stage's half of patch_pilot_cameras.py from the project note claude/pilot-fight-cameras.md, with one change: a lens wide enough to ask
# for more than the painting's width takes the whole width and no more (so a second moon never shows in a mirror). src/stage.js is only read:
# patched(text) returns the changed text, and the fight's build uses that. Every replacement must be found exactly once.
def patched(s):
    def one(a, b):
        nonlocal s
        assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
    one("uSnap: { value: 1 }, uDim: { value: 1 } },", "uSnap: { value: 1 }, uDim: { value: 1 }, uSoft: { value: 0 }, uTex: { value: new THREE.Vector2(1024, 1024) } },")
    one("uniform float uSnap; uniform float uDim; varying vec2 vUv;", "uniform float uSnap; uniform float uDim; uniform float uSoft; uniform vec2 uTex; varying vec2 vUv;")
    one(r"' col *= 0.25; float best = 1e9; vec3 pick = col;\n' +",
        r"' col *= 0.25;\n' +" + "\n"
        r"      ' if (uSoft > 0.0) { col = vec3(0.0); vec2 sp = 0.5 * exp2(uSoft) / uTex;\n' +" + "      // out of focus: sixteen readings from a small copy of the painting, spread over a patch; past an edge the painting is met again in a mirror\n"
        r"      '  for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) { vec2 w = uWin.xy + c0 * uWin.zw + (vec2(float(i), float(j)) - 1.5) * sp; vec2 m = mod(w, 2.0); w = mix(m, 2.0 - m, step(1.0, m)); col += texture2D(tP, w, uSoft).rgb; }\n' +" + "\n"
        r"      '  col *= 0.0625; }\n' +" + "\n"
        r"      ' float best = 1e9; vec3 pick = col;\n' +")
    one("  const _buf = new THREE.Vector2(), _cc = new THREE.Color(); let glowT = 0;",
        "  const _buf = new THREE.Vector2(), _cc = new THREE.Color(); let glowT = 0;\n"
        "  // a second copy of a painting that can be read out of focus (made the first time the camera moves)\n"
        "  const softArt = (id) => api.soft[id] || (api.soft[id] = (() => { const t = new THREE.Texture(api.textures[id].image); t.encoding = THREE.sRGBEncoding; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t; })());")
    one("    textures: {}, ownPal: {},",
        "    textures: {}, ownPal: {}, soft: {},\n"
        "    // the camera moved for a shot: where it stands, what it looks at, its lens (degrees), how far out of focus the painting behind is\n"
        "    // (0 sharp; each step is twice as soft) and how much of its light is kept. While on is false the camera is the painter's, as always.\n"
        "    free: { on: false, pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 23, blur: 3.0, dim: 0.82 },")
    one("      api.fullProj = camera.projectionMatrix.clone(); api.fullInv = camera.projectionMatrixInverse.clone();",
        "      api.fullProj = camera.projectionMatrix.clone(); api.fullInv = camera.projectionMatrixInverse.clone();\n"
        "      // the painter's camera, kept so it can be put back, and the height of its horizon in the painting\n"
        "      api.fixed = { pos: camera.position.clone(), quat: camera.quaternion.clone(), view: camera.matrixWorldInverse.clone(), fov: C.fov, aspect: FW / FH, near: camera.near, far: camera.far, hy: 0 };\n"
        "      { const p = _v.set(camera.position.x, camera.position.y, camera.position.z - 1e5).applyMatrix4(api.fixed.view).applyMatrix4(api.fullProj); api.fixed.hy = (1 - p.y) / 2 * FH; } api._free = false;")
    one("toFrame(v, out) { const p = _v.copy(v).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(api.fullProj);", "toFrame(v, out) { const p = _v.copy(v).applyMatrix4(api.fixed ? api.fixed.view : camera.matrixWorldInverse).applyMatrix4(api.fullProj);")
    one("toScreen(v, out) { out = api.toFrame(v, out);", "toScreen(v, out) { if (api._free) { const p = _v.copy(v).project(camera); out = out || [0, 0]; out[0] = (p.x + 1) / 2 * canvas.clientWidth; out[1] = (1 - p.y) / 2 * canvas.clientHeight; if (p.z > 1) out[0] = out[1] = -9999; return out; } out = api.toFrame(v, out);")
    one("      const pixPaint = F.on && F.painting !== 'smooth' && api.painting && bgMat.map;",
        "      const FR = api.free.on && api.fixed && bgMat.map ? api.free : null; let bw = null;\n"
        "      if (FR) {                                          // the camera has moved: stand it there, and find the part of the painting that lies behind\n"
        "        const d = _v.copy(FR.look).sub(FR.pos), yaw = Math.atan2(d.x, -d.z), pit = Math.atan2(d.y, Math.hypot(d.x, d.z)), tf = Math.tan(FR.fov / 2 * RAD), fpx = (FH / 2) / Math.tan(api.fixed.fov / 2 * RAD);\n"
        "        camera.clearViewOffset(); camera.fov = FR.fov; camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight); camera.near = 0.1; camera.far = 400;\n"
        "        camera.position.copy(FR.pos); camera.lookAt(_v.copy(FR.look).add(_v2.set(sx * 0.003, sy * 0.003, 0))); camera.updateMatrixWorld(); camera.updateProjectionMatrix(); api._free = true;\n"
        "        let bh = 2 * fpx * tf, bwid = bh * camera.aspect; if (bwid > FW) { bh *= FW / bwid; bwid = FW; } const t = 0.5 + 0.5 * Math.tan(pit) / tf, by = api.fixed.hy - t * bh; let bx = FW / 2 + fpx * yaw - bwid / 2; if (bwid <= FW) bx = Math.max(0, Math.min(FW - bwid, bx));      // as large as the lens asks, its horizon on the camera's horizon, slid sideways by the camera's turn but kept inside the painting when it fits\n"
        "        bw = [bx / FW, 1 - (by + bh) / FH, bwid / FW, bh / FH];\n"
        "      } else if (api._free) { const X = api.fixed; camera.position.copy(X.pos); camera.quaternion.copy(X.quat); camera.fov = X.fov; camera.aspect = X.aspect; camera.near = X.near; camera.far = X.far; camera.updateMatrixWorld(); api._free = false; }\n"
        "      const pixPaint = F.on && F.painting !== 'smooth' && api.painting && bgMat.map;")
    one("      if (pixPaint) {\n        const u = paintMat.uniforms, own = F.painting === 'own' && api.ownPal[S.art]; u.tP.value = bgMat.map; u.uRes.value.set(gw, gh);",
        "      if (FR && api.painting) {                           // behind a moved camera: the painting out of focus (on the look's grid when the look is on, and only part of the way to its colours: a soft sky in few colours shows as rings)\n"
        "        const u = paintMat.uniforms, own = pixPaint && F.painting === 'own' && api.ownPal[S.art]; if (!pixPaint) { renderer.setRenderTarget(null); renderer.getDrawingBufferSize(_buf); }\n"
        "        u.tP.value = softArt(S.art); u.uTex.value.set(u.tP.value.image.width, u.tP.value.image.height); u.uSoft.value = FR.blur; if (pixPaint) u.uRes.value.set(gw, gh); else u.uRes.value.set(_buf.x, _buf.y);\n"
        "        u.uWin.value.set(bw[0], bw[1], bw[2], bw[3]); u.uPal.value = own || postMat.uniforms.uPal.value; u.uN.value = own ? 64 : NPW; u.uSnap.value = pixPaint ? F.snap * 0.35 : 0; u.uDim.value = (1 - 0.93 * Math.min(1, Math.max(0, api.dark))) * FR.dim;\n"
        "        renderer.render(paintScene, bgCam); renderer.setRenderTarget(null);\n"
        "      } else if (pixPaint) {\n        const u = paintMat.uniforms, own = F.painting === 'own' && api.ownPal[S.art]; u.tP.value = bgMat.map; u.uSoft.value = 0; u.uRes.value.set(gw, gh);")
    one("      camera.setViewOffset(FW, FH, wx, wy, W.w, W.h);", "      if (!FR) camera.setViewOffset(FW, FH, wx, wy, W.w, W.h);")
    one("  const _v = new THREE.Vector3();\n  return api;", "  const _v = new THREE.Vector3(), _v2 = new THREE.Vector3();\n  return api;")
    return s
if __name__ == '__main__':
    import os, sys
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'stage.js'); t = patched(open(src, encoding='utf-8').read())
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/stage_fight.js'; open(out, 'w', encoding='utf-8').write(t); print('wrote', out, len(t))
