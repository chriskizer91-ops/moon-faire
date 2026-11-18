# How near his hands come to his trousers and corset in the stance and round the walk (the hands must hang clear of the cloth).
# usage: python3 tools/hand_clear.py
# For each hand: the joints of the wrist, knuckles and finger ends (bones), and the nearest point of the trousers' cloth and of the old
# skin's trunk (corset), each moved by its bones as the graphics card moves it. A hand is about 12 mm thick either side of its bones, so
# anything over about 15 mm is clear air. Only points that a visible triangle uses are looked at (the old skin's pieces share one list of points). The trousers' own sway is left out (it is a few mm).
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = r"""
(() => { const j = T.j, SK = j.SK, M = j.debug.meshes, USED = {}, out = [], v = new THREE.Vector3(), w = new THREE.Vector3();
  const names = Object.keys(M).filter((k) => /trouser|projCorset|projTrunk|projBody|projLegs/.test(k) && M[k].visible);
  const near = (S) => { const pts = []; for (const b of ['hand', 'idx0', 'idx2', 'mid2', 'pnk0', 'pnk2', 'thb2']) pts.push(new THREE.Vector3().setFromMatrixPosition(SK[b + S].matrixWorld));
    let best = 9, where = '';
    for (const k of names) { const m = M[k], P = m.geometry.attributes.position, used = USED[k] || (USED[k] = [...new Set(m.geometry.index.array)]); for (const i of used) { v.fromBufferAttribute(P, i); if (v.y > 1.15 || v.y < 0.45) continue; m.boneTransform(i, w.copy(v)); for (const p of pts) { const d = p.distanceTo(w); if (d < best) { best = d; where = k; } } } }
    return [best * 1000, where]; };
  const row = (label) => { j.root.updateMatrixWorld(true); const r = near('R'), l = near('L'); out.push([label, r[0], r[1], l[0], l[1]]); };
  j.play('stand', true); row('stance');
  j.play('talk', true); for (let i = 0; i < 4; i++) { for (let k = 0; k < 60; k++) j.animate(0.04); row('talk ' + ((i + 1) * 2.4).toFixed(1) + ' s'); }
  j.play('walk', true); for (let k = 0; k < 150; k++) j.animate(j.strideTime / 60); for (let i = 0; i < 12; i++) { row('walk q ' + j.debug.gait.q.toFixed(2)); for (let k = 0; k < 5; k++) j.animate(j.strideTime / 60); }
  return { out, names }; })()
"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    R = pg.evaluate(JS); b.close()
print('cloth looked at:', ', '.join(R['names']))
print(' moment          right hand: nearest cloth (mm)        left hand: nearest cloth (mm)')
for r in R['out']: print(' %-14s   %6.1f  %-22s   %6.1f  %s' % (r[0], r[1], r[2], r[3], r[4]))
print('nearest of all: %.1f mm' % min(min(r[1], r[3]) for r in R['out']))
