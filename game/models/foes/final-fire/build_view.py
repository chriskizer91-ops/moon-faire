#!/usr/bin/env python3
"""Build out/final-fire-view.html: one page with final-fire.js inlined, to look at the final foe on a phone or a laptop.

    python3 build_view.py                      # the page Chris opens (three.js r128 from cdnjs)
    python3 build_view.py --three FILE_URL --out PATH   # a test copy that loads three.js from somewhere else
"""
import argparse
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

PAGE = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Moon Faire: the fire that would not end, both forms</title>
<style>
 html, body { margin: 0; height: 100%; background: #241c2b; overflow: hidden; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #eadfe6; }
 canvas { display: block; position: fixed; inset: 0; width: 100%; height: 100%; touch-action: none; }
 #top { position: fixed; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 10px; pointer-events: none; gap: 8px; }
 #info { font-size: 12px; line-height: 1.35; opacity: .8; white-space: pre; }
 #info b { font-size: 14px; opacity: 1; }
 #sw { pointer-events: auto; display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
 .seg { display: flex; border: 1px solid #6a5670; border-radius: 8px; overflow: hidden; background: rgba(24, 18, 29, .6); }
 .seg button { background: transparent; color: #eadfe6; border: 0; padding: 8px 10px; font-size: 13px; }
 .seg button.on { background: #6a3346; }
 #bar { position: fixed; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 10px 10px calc(10px + env(safe-area-inset-bottom)); background: rgba(24, 18, 29, .85); }
 #bar button { font-size: 16px; padding: 14px 4px; border-radius: 10px; border: 1px solid #7a4a5a; background: #3a2733; color: #ffe3e9; }
 #bar button:active, #bar button.on { background: #7a2c42; }
 @media (max-width: 760px) { #bar { grid-template-columns: repeat(4, 1fr); } #bar button { font-size: 15px; padding: 12px 2px; } }
</style>
</head>
<body>
<div id="top"><div id="info"><b>The fire that would not end</b>
</div><div id="sw"><div class="seg" id="frm"><button data-f="1" class="on">Form one</button><button data-f="2">Final form</button></div><div class="seg" id="det"><button data-d="1" class="on">Detail 1</button><button data-d="0.5">Detail ½</button></div></div></div>
<div id="bar">
 <button data-m="idle">Idle</button><button data-m="blow">Blow</button><button data-m="call">The Call</button>
 <button data-m="hurt">Hurt</button><button data-m="change">Break open</button><button data-m="ending">Ending</button><button data-m="reset">Start again</button>
</div>
<script src="%THREE%"></script>
<script>
%MODEL%
</script>
<script>
(function () {
 'use strict';
 const renderer = new THREE.WebGLRenderer({ antialias: true });
 renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
 document.body.prepend(renderer.domElement);
 const scene = new THREE.Scene(); scene.background = new THREE.Color(0x241c2b);
 scene.add(new THREE.HemisphereLight(0x9a7f9c, 0x2a1f24, .75));
 const key = new THREE.DirectionalLight(0xffe2da, .45); key.position.set(4, 9, 10); scene.add(key);
 // a faint ground disc
 const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gg = gc.getContext('2d'), gr = gg.createRadialGradient(128, 128, 0, 128, 128, 128);
 gr.addColorStop(0, 'rgba(70,52,78,1)'); gr.addColorStop(.7, 'rgba(52,40,60,.6)'); gr.addColorStop(1, 'rgba(36,28,43,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 256, 256);
 const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false }));
 ground.rotation.x = -Math.PI / 2; ground.position.y = .002; scene.add(ground);
 // a flat grey person, 1.7 m tall, for scale
 const pc = document.createElement('canvas'); pc.width = 64; pc.height = 128; const pg = pc.getContext('2d'); pg.fillStyle = '#8d8792';
 pg.beginPath(); pg.arc(32, 12, 10, 0, 7); pg.fill(); pg.beginPath(); pg.moveTo(18, 26); pg.lineTo(46, 26); pg.lineTo(52, 72); pg.lineTo(44, 72); pg.lineTo(42, 128); pg.lineTo(34, 128); pg.lineTo(32, 80); pg.lineTo(30, 128); pg.lineTo(22, 128); pg.lineTo(20, 72); pg.lineTo(12, 72); pg.closePath(); pg.fill();
 const person = new THREE.Mesh(new THREE.PlaneGeometry(.85, 1.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), alphaTest: .5, side: THREE.DoubleSide }));
 person.position.set(-3.6, .85, 1.2); scene.add(person);

 const camera = new THREE.PerspectiveCamera(30, 1, .1, 300);
 const target = new THREE.Vector3(-.3, 4.25, 0), BASE_D = 24;
 const view = { yaw: -.22, pitch: .05, zoom: 1 };
 let tall = 8, wide = 4.8;
 const bar = document.getElementById('bar'), top = document.getElementById('top'), info = document.getElementById('info');
 function fit() {
  const W = window.innerWidth, H = window.innerHeight, topH = top.offsetHeight + 4, barH = bar.offsetHeight, avail = Math.max(100, H - topH - barH);
  renderer.setSize(W, H, false);
  const aspect = W / avail, hH = tall / 2 + .7, hW = Math.max(wide / 2 + .5, 4.4);   // the model from the ground to its crown, and the person beside it
  target.y = tall / 2 + .25;
  camera.fov = 2 * Math.atan(Math.max(hH / BASE_D, hW / (BASE_D * aspect)) * 1.04) * 180 / Math.PI;
  camera.aspect = aspect; camera.setViewOffset(W, avail, 0, -topH, W, H); camera.updateProjectionMatrix();
 }
 window.addEventListener('resize', fit);
 function place() {
  const d = BASE_D * view.zoom, cp = Math.cos(view.pitch);
  camera.position.set(target.x + Math.sin(view.yaw) * cp * d, target.y + Math.sin(view.pitch) * d, target.z + Math.cos(view.yaw) * cp * d);
  camera.lookAt(target);
  person.rotation.y = Math.atan2(camera.position.x - person.position.x, camera.position.z - person.position.z);
 }
 // drag to turn, wheel or pinch to zoom
 const ptrs = new Map(); let pinch0 = 0, zoom0 = 1;
 const cv = renderer.domElement;
 cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = view.zoom; } });
 cv.addEventListener('pointermove', (e) => {
  const p = ptrs.get(e.pointerId); if (!p) return;
  if (ptrs.size === 1) { view.yaw -= (e.clientX - p.x) * .008; view.pitch = Math.max(-.15, Math.min(1.2, view.pitch + (e.clientY - p.y) * .006)); }
  p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 2 && pinch0 > 0) { const [a, b] = [...ptrs.values()]; view.zoom = Math.max(.35, Math.min(2.5, zoom0 * pinch0 / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)))); }
 });
 const up = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = 0; };
 cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
 cv.addEventListener('wheel', (e) => { e.preventDefault(); view.zoom = Math.max(.35, Math.min(2.5, view.zoom * Math.exp(e.deltaY * .001))); }, { passive: false });

 let model = null, detail = 1, clock = 0, paused = false;
 function dispose(o) { o.traverse((c) => { if (c.geometry) c.geometry.dispose(); if (c.material) { for (const k of ['map', 'emissiveMap']) if (c.material[k]) c.material[k].dispose(); if (c.material.uniforms && c.material.uniforms.uMap) c.material.uniforms.uMap.value.dispose(); c.material.dispose(); } }); }
 function build(d) {
  if (model) { scene.remove(model.root, model.fx); dispose(model.root); dispose(model.fx); }
  const f = model ? model.form : 1;
  detail = d; model = makeFinalFire({ detail: d, form: f }); scene.add(model.root, model.fx);
  document.querySelectorAll('#det button').forEach((b) => b.classList.toggle('on', +b.dataset.d === d));
 }
 function act(m) { if (m === 'reset') model.reset(); else model.play(m, true); }
 document.querySelectorAll('#frm button').forEach((b) => b.addEventListener('click', () => model.reset(+b.dataset.f)));
 document.querySelectorAll('#bar button').forEach((b) => b.addEventListener('click', () => act(b.dataset.m)));
 document.querySelectorAll('#det button').forEach((b) => b.addEventListener('click', () => build(+b.dataset.d)));

 let last = performance.now(), infoT = 0;
 function readout() {
  const r = renderer.info.render;
  document.querySelectorAll('#frm button').forEach((b) => b.classList.toggle('on', +b.dataset.f === model.form));
  info.innerHTML = '<b>The fire that would not end</b>\n' + 'triangles ' + r.triangles.toLocaleString() + '   draw calls ' + r.calls + '\n' +
   'model alone: ' + model.stats.triangles.toLocaleString() + ' tris, ' + model.stats.drawCalls + ' calls\n' + 'now: ' + (model.action || 'idle') + (model.gone ? ' (ended)' : '');
 }
 function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!paused) { clock += dt; model.animate(0, 0, clock, dt); }
  if (Math.abs(model.height - tall) > .01 || Math.abs(model.width - wide) > .01) { tall = model.height; wide = model.width; fit(); }
  place(); renderer.render(scene, camera);
  infoT -= dt; if (infoT <= 0) { infoT = .5; readout(); }
  requestAnimationFrame(frame);
 }
 // for checking: jump the model's clock in small steps
 window.FF = {
  get model() { return model; }, renderer, build,
  pause(p) { paused = p !== false; },
  play: act,
  view,
  jump(sec) { paused = true; const n = Math.round(sec * 30); for (let i = 0; i < n; i++) { clock += 1 / 30; model.animate(0, 0, clock, 1 / 30); } tall = model.height; wide = model.width; fit(); place(); renderer.render(scene, camera); readout(); }
 };
 build(1); fit(); requestAnimationFrame(frame);
})();
</script>
</body>
</html>
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--three', default=CDN, help='where the page loads three.js r128 from')
    ap.add_argument('--out', default=str(HERE / 'out' / 'final-fire-view.html'))
    a = ap.parse_args()
    model = (HERE / 'final-fire.js').read_text(encoding='utf-8')
    html = PAGE.replace('%THREE%', a.three).replace('%MODEL%', model)
    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'wrote {out} ({out.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
