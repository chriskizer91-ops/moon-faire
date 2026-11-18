# Do his hanging things pass through his trousers or his hands? (stage 6)
# usage: python3 tools/gear_clear.py [walk|talk|stand]
# Steps the model's own clock through the stance, twelve moments of the walk and four of talk. At each moment, for every hanging thing
# (pouch, scroll, two charms, dagger): how deep its deepest point is inside the trouser cloth (0 = none; found from the nearest point
# of the cloth and which way that cloth faces), and how near the nearest joint of each hand comes to any of his gear (a joint is the
# middle of a finger or the wrist: a finger is about 9 mm thick round it, the wrist and palm about 20 mm, so under 10 mm from a finger joint is a touch).
import sys, json
from playwright.sync_api import sync_playwright
ROOT = __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
JS = r'''
(() => { const j = T.j, SK = j.SK, out = [], v = new THREE.Vector3(), n = new THREE.Vector3(), w = new THREE.Vector3();
  const HB = ['pouch', 'scroll', 'charmS', 'charmL', 'dagger'], bi = {}; j.meshes.gBelt.skeleton.bones.forEach((b, i) => { bi[b.name] = i; });
  const gear = []; for (const k of ['gPouch', 'gParch', 'gBelt', 'gSteel', 'gBrass', 'gLeaf', 'gDark']) { const m = j.meshes[k]; if (!m) continue; const S = m.geometry.attributes.skinIndex, P = m.geometry.attributes.position; for (let i = 0; i < P.count; i += 1) { const b = S.getX(i), name = HB.find((h) => bi[h] === b); if (P.getY(i) < 0.6 || P.getY(i) > 1.15) continue; gear.push({ m, i, name: name || 'belt' }); } }
  const tr = j.meshes.trousers, TP = tr.geometry.attributes.position, TN = tr.geometry.attributes.normal, cloth = []; for (let i = 0; i < TP.count; i += 2) if (TP.getY(i) > 0.55 && TP.getY(i) < 1.12) cloth.push(i);
  // which way a point of the cloth faces now: its resting direction carried by the same bones, in the same shares, as the point itself
  const SI = tr.geometry.attributes.skinIndex, SW = tr.geometry.attributes.skinWeight, M4 = new THREE.Matrix4(), sk = tr.skeleton;
  const skinDir = (i) => { const d = new THREE.Vector3(), a = new THREE.Vector3(); n.fromBufferAttribute(TN, i); for (let k = 0; k < 4; k++) { const wt = SW.array[i * 4 + k]; if (!wt) continue; const b = SI.array[i * 4 + k]; M4.multiplyMatrices(sk.bones[b].matrixWorld, sk.boneInverses[b]); d.addScaledVector(a.copy(n).transformDirection(M4), wt); } return d.normalize(); };
  const joints = (S) => Object.keys(SK).filter((k) => /^(hand|thumb|idx|mid|ring|pin|pinky|index)/.test(k) && k.endsWith(S));
  const measure = (label) => { j.root.updateMatrixWorld(true);
    const C = cloth.map((i) => { v.fromBufferAttribute(TP, i); tr.boneTransform(i, v); const p = v.clone(); return [p, skinDir(i)]; });
    const deep = {}, near = { R: [9, ''], L: [9, ''] }, JP = { R: joints('R').map((k) => SK[k].getWorldPosition(new THREE.Vector3())), L: joints('L').map((k) => SK[k].getWorldPosition(new THREE.Vector3())) };
    for (const g of gear) { v.fromBufferAttribute(g.m.geometry.attributes.position, g.i); g.m.boneTransform(g.i, v);
      for (const S of ['R', 'L']) for (const q of JP[S]) { const d = v.distanceTo(q); if (d < near[S][0]) near[S] = [d, g.name]; }
      if (g.name === 'belt') continue; let bd = 9, bc = null; for (const c of C) { const d = v.distanceToSquared(c[0]); if (d < bd) { bd = d; bc = c; } }
      const inside = -w.copy(v).sub(bc[0]).dot(bc[1]); if (bd < 0.0009 && inside > (deep[g.name] || 0)) deep[g.name] = inside; }
    out.push(label.padEnd(9) + HB.map((h) => (h + ' ' + ((deep[h] || 0) * 1000).toFixed(1)).padEnd(13)).join('') + '| right hand ' + (near.R[0] * 1000).toFixed(0) + ' mm from ' + near.R[1].padEnd(7) + ' left hand ' + (near.L[0] * 1000).toFixed(0) + ' mm from ' + near.L[1] + '   swing: ' + j.debug.gear.HANG.map((h) => (h.a * 57.3).toFixed(0) + '/' + (h.b * 57.3).toFixed(0)).join(' ')); };
  out.push('moment   deepest point inside the trouser cloth, mm (0 = none)                 | nearest hand joint to any gear          angles out/along, degrees: ' + j.debug.gear.HANG.map((h) => h.bone).join(' '));
  j.play('stand', true); for (let i = 0; i < 30; i++) j.animate(1 / 60); measure('stand');
  { const h = j.debug.gear.HANG.find((q) => q.bone === 'pouch'); SK.pouch.quaternion.setFromAxisAngle(h.ex, 0.30); measure('(test: pouch turned 17 degrees INTO him, to prove the meter reads)'); j.play('stand', true); }
  j.play('walk', true); for (let i = 0; i < 120; i++) j.animate(1 / 60);
  for (let i = 0; i < 12; i++) { const n = Math.round(j.strideTime / 12 * 60); for (let k = 0; k < n; k++) j.animate(1 / 60); measure('walk ' + i); }
  j.play('talk', true); for (let i = 0; i < 4; i++) { for (let k = 0; k < 45; k++) j.animate(1 / 60); measure('talk ' + i); }
  return out.join('\n'); })()
'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:400]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    print(pg.evaluate(JS)); b.close()
