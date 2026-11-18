#!/usr/bin/env python3
"""Build out/brambles-view.html: one page with the three bramble foes side by side, to look at on a phone or a laptop.

    python3 build_view.py                               # the page Chris opens (three.js r128 from cdnjs)
    python3 build_view.py --three FILE_URL --out PATH   # a test copy that loads three.js from somewhere else
    python3 build_view.py --inline THREE_MIN_JS --out PATH   # one file with three.js inside it, which needs no network
"""
import argparse
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
SIMPLIFIER = HERE.parent.parent / 'jester' / 'meshopt_simplifier.js'

PAGE = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Moon Faire: the three bramble foes</title>
<style>
 html, body { margin: 0; height: 100%; background: #241c2b; overflow: hidden; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #eadfe6; }
 canvas { display: block; position: fixed; inset: 0; width: 100%; height: 100%; touch-action: none; }
 #top { position: fixed; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 10px; pointer-events: none; gap: 8px; }
 #info { font-size: 12px; line-height: 1.4; opacity: .88; white-space: pre; }
 #info b { font-size: 14px; }
 .seg { pointer-events: auto; display: flex; border: 1px solid #6a5670; border-radius: 8px; overflow: hidden; background: rgba(24, 18, 29, .6); }
 .seg button { background: transparent; color: #eadfe6; border: 0; padding: 9px 12px; font-size: 14px; }
 .seg button.on { background: #6a3346; }
 #bar { position: fixed; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; padding: 10px 10px calc(10px + env(safe-area-inset-bottom)); background: rgba(24, 18, 29, .85); }
 #bar button { font-size: 15px; padding: 13px 2px; border-radius: 10px; border: 1px solid #7a4a5a; background: #3a2733; color: #ffe3e9; }
 #bar button:active { background: #7a2c42; }
 #wait { position: fixed; inset: 0; display: none; place-items: center; background: rgba(24, 18, 29, .7); font-size: 18px; }
 @media (max-width: 760px) { #bar { grid-template-columns: repeat(4, 1fr); } }
</style>
</head>
<body>
<div id="top"><div id="info"><b>The three bramble foes</b>
</div><div class="seg" id="wt"><button data-w="light" class="on">Light</button><button data-w="fine">Fine</button></div></div>
<div id="bar">
 <button data-m="idle">Idle</button><button data-m="blow">Blow</button><button data-m="big">Heavy / Crush</button><button data-m="eclipse">On everyone</button>
 <button data-m="hurt">Hurt</button><button data-m="fall">Fall</button><button data-m="appear">Appear</button><button data-m="reset">Start again</button>
</div>
<div id="wait">Building the fine ones…</div>
<script src="%THREE%"></script>
<script>
%SIMPLIFIER%
</script>
<script>
%BRAMBLE%
</script>
<script>
%COLOSSUS%
</script>
<script>
%BRAMBLES%
</script>
<script>
(function () {
 'use strict';
 const renderer = new THREE.WebGLRenderer({ antialias: true });
 renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
 document.body.prepend(renderer.domElement);
 const scene = new THREE.Scene(); scene.background = new THREE.Color(0x241c2b);
 scene.add(new THREE.HemisphereLight(0xb9a9c9, 0x2a1f24, .9));
 const key = new THREE.DirectionalLight(0xfff0e0, .7); key.position.set(4, 9, 10); scene.add(key);
 const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gg = gc.getContext('2d'), gr = gg.createRadialGradient(128, 128, 0, 128, 128, 128);
 gr.addColorStop(0, 'rgba(70,52,78,1)'); gr.addColorStop(.7, 'rgba(52,40,60,.6)'); gr.addColorStop(1, 'rgba(36,28,43,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 256, 256);
 const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 48), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false }));
 ground.rotation.x = -Math.PI / 2; ground.position.y = .002; scene.add(ground);
 // a flat grey person, 1.7 m tall, for scale
 const pc = document.createElement('canvas'); pc.width = 64; pc.height = 128; const pg = pc.getContext('2d'); pg.fillStyle = '#8d8792';
 pg.beginPath(); pg.arc(32, 12, 10, 0, 7); pg.fill(); pg.beginPath(); pg.moveTo(18, 26); pg.lineTo(46, 26); pg.lineTo(52, 72); pg.lineTo(44, 72); pg.lineTo(42, 128); pg.lineTo(34, 128); pg.lineTo(32, 80); pg.lineTo(30, 128); pg.lineTo(22, 128); pg.lineTo(20, 72); pg.lineTo(12, 72); pg.closePath(); pg.fill();
 const person = new THREE.Mesh(new THREE.PlaneGeometry(.85, 1.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), alphaTest: .5, side: THREE.DoubleSide }));
 person.position.set(-8.4, .85, 0); scene.add(person);

 const camera = new THREE.PerspectiveCamera(30, 1, .1, 300);
 const target = new THREE.Vector3(-.7, 2.6, 0), BASE_D = 32;
 const view = { yaw: .2, pitch: .1, zoom: 1 };
 const bar = document.getElementById('bar'), top = document.getElementById('top'), info = document.getElementById('info'), wait = document.getElementById('wait');
 function fit() {
  const W = window.innerWidth, H = window.innerHeight, topH = top.offsetHeight + 4, barH = bar.offsetHeight, avail = Math.max(100, H - topH - barH);
  renderer.setSize(W, H, false);
  const aspect = W / avail, hH = 4.2, hW = 10.4;
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
 const ptrs = new Map(); let pinch0 = 0, zoom0 = 1;
 const cv = renderer.domElement;
 cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = view.zoom; } });
 cv.addEventListener('pointermove', (e) => {
  const p = ptrs.get(e.pointerId); if (!p) return;
  if (ptrs.size === 1) { view.yaw -= (e.clientX - p.x) * .008; view.pitch = Math.max(-.1, Math.min(1.2, view.pitch + (e.clientY - p.y) * .006)); }
  p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 2 && pinch0 > 0) { const [a, b] = [...ptrs.values()]; view.zoom = Math.max(.2, Math.min(2.5, zoom0 * pinch0 / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)))); }
 });
 const up = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = 0; };
 cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
 cv.addEventListener('wheel', (e) => { e.preventDefault(); view.zoom = Math.max(.2, Math.min(2.5, view.zoom * Math.exp(e.deltaY * .001))); }, { passive: false });

 const WHERE = { bramble: -6.2, flowering: -2.2, great: 4.6 };
 let all = [], weight = 'light', clock = 0, paused = false, building = false;
 function dispose(o) { o.traverse((c) => { if (c.geometry) c.geometry.dispose(); if (c.material) { const ms = Array.isArray(c.material) ? c.material : [c.material]; for (const m of ms) { for (const k of ['map', 'emissiveMap', 'alphaMap']) if (m[k]) m[k].dispose(); m.dispose(); } } }); }
 function hold(m) { if (m.kind === 'great') { m.state.wrath = 1; m.state.open = .8; } }
 async function build(w) {
  if (building) return; building = true; wait.style.display = w === 'fine' ? 'grid' : 'none';
  await new Promise((r) => setTimeout(r, 30));
  if (window.MeshoptSimplifier && MeshoptSimplifier.ready) await MeshoptSimplifier.ready;
  for (const m of all) { scene.remove(m.root, m.fx); dispose(m.root); dispose(m.fx); }
  all = []; weight = w;
  for (const kind of ['bramble', 'flowering', 'great']) {
   const m = MF_BRAMBLES.make(kind, w, {}); m.root.position.x = WHERE[kind]; scene.add(m.root, m.fx);
   m.state.target = new THREE.Vector3(WHERE[kind], 0, m.reach || 2); all.push(m);
  }
  document.querySelectorAll('#wt button').forEach((b) => b.classList.toggle('on', b.dataset.w === w));
  wait.style.display = 'none'; building = false; readout();
 }
 function act(k) {
  for (const m of all) {
   if (k === 'reset') { m.reset(); hold(m); continue; }
   if (k === 'idle') { m.play('idle', true); continue; }
   const move = k === 'big' ? (m.movesFor.heavy ? 'heavy' : m.movesFor.crush ? 'crush' : null) : k;
   if (move && m.movesFor[move]) m.does(move);
  }
 }
 document.querySelectorAll('#bar button').forEach((b) => b.addEventListener('click', () => act(b.dataset.m)));
 document.querySelectorAll('#wt button').forEach((b) => b.addEventListener('click', () => build(b.dataset.w)));
 function readout() {
  let s = '<b>The three bramble foes</b>  (' + weight + ')\n', sum = 0;
  for (const m of all) { sum += m.tris; s += m.K.name + ': ' + m.tris.toLocaleString() + ' triangles' + (m.action ? '   ' + m.action : '') + '\n'; }
  info.innerHTML = s + 'all three: ' + sum.toLocaleString() + '   draw calls ' + renderer.info.render.calls;
 }
 let last = performance.now(), infoT = 0;
 function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!paused && !building) { clock += dt; for (const m of all) m.animate(0, 0, clock, dt); }
  place(); renderer.render(scene, camera);
  infoT -= dt; if (infoT <= 0) { infoT = .5; readout(); }
  requestAnimationFrame(frame);
 }
 window.BR = {
  get all() { return all; }, view, build, act,
  jump(sec) { paused = true; const n = Math.round(sec * 30); for (let i = 0; i < n; i++) { clock += 1 / 30; for (const m of all) m.animate(0, 0, clock, 1 / 30); } place(); renderer.render(scene, camera); readout(); }
 };
 fit(); build('light').then(() => requestAnimationFrame(frame));
})();
</script>
</body>
</html>
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--three', default=CDN, help='where the page loads three.js r128 from')
    ap.add_argument('--out', default=str(HERE / 'out' / 'brambles-view.html'))
    ap.add_argument('--inline', default='', help='a three.min.js (r128) to put inside the page')
    a = ap.parse_args()
    html = PAGE.replace('%THREE%', a.three)
    if a.inline:
        three = pathlib.Path(a.inline).read_text(encoding='utf-8').replace('</script>', '<\\/script>')
        html = html.replace('<script src="' + a.three + '"></script>', '<script>\n' + three + '\n</script>')
    for mark, path in (('%SIMPLIFIER%', SIMPLIFIER), ('%BRAMBLE%', HERE / 'bramble.js'), ('%COLOSSUS%', HERE / 'colossus.js'), ('%BRAMBLES%', HERE / 'brambles.js')):
        html = html.replace(mark, path.read_text(encoding='utf-8').replace('</script>', '<\\/script>'))
    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'wrote {out} ({out.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
