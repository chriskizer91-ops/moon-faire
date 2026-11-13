# wrist_sections.py : where the forearm runs into the hand, slice by slice down the arm: how wide and thick each is, and which lies outside
import sys, os, json
from playwright.sync_api import sync_playwright
JS = '''() => { const out = []; const g = (k) => T.j.meshes[k].geometry.attributes.position; const S = 'L';
  const sh = new THREE.Vector3(), wr = new THREE.Vector3(); T.j.SK['uarm' + S].getWorldPosition(sh); T.j.SK['hand' + S].getWorldPosition(wr);
  const d = wr.clone().sub(sh); const L = d.length(); d.normalize(); const Bv = new THREE.Vector3(d.y, -d.x, 0);      // for the left arm this points to the palm side
  const acc = (key, test) => { const a = g(key), rows = {}; for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i); if (test && !test(x)) continue;
      const rx = x - sh.x, ry = y - sh.y, rz = z - sh.z, sl = rx * d.x + ry * d.y, th = rx * Bv.x + ry * Bv.y, k = Math.round(sl / 0.004);
      const r = rows[k] || (rows[k] = [1, -1, 1, -1, 1, -1]); if (rz < r[0]) r[0] = rz; if (rz > r[1]) r[1] = rz; if (th < r[2]) r[2] = th; if (th > r[3]) r[3] = th;
      if (Math.abs(rz - 0.004) < 0.006) { if (th < r[4]) r[4] = th; if (th > r[5]) r[5] = th; } } return rows; };
  return { L, hand: acc('hand'), arm: acc('armL') }; }'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(); pg.goto('file:///home/claude/ranger/test_r.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    r = pg.evaluate(JS); b.close()
print('shoulder to wrist joint %.4f m' % r['L'])
print(' sl     | hand: thumb-side  little-side   palm    back   (mid palm, back) | arm: thumb  little   palm    back  (mid palm, back)')
for k in sorted(set(int(k) for k in r['hand']) | set(int(k) for k in r['arm'])):
    sl = k * 0.004
    if sl < 0.43 or sl > 0.51: continue
    h = r['hand'].get(str(k)); a = r['arm'].get(str(k))
    f = lambda v: '   --  ' if v is None else '%7.4f' % v
    hh = [h[1], h[0], h[3], h[2], h[5], h[4]] if h else [None] * 6; aa = [a[1], a[0], a[3], a[2], a[5], a[4]] if a else [None] * 6
    print(' %.3f |' % sl, ' '.join(f(v) for v in hh), '|', ' '.join(f(v) for v in aa))
