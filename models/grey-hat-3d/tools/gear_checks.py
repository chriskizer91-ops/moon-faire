# Checks on the moving parts of his hat, belt and jewellery (stage 6). usage: python3 tools/gear_checks.py
#  1. The same frames give the same result on every run: the page is loaded TWICE from fresh and 200 frames of walk are stepped in each;
#     the angles of every hanging thing and the places of six bones are compared to six decimal places.
#  2. The same run repeated inside one page. This is NOT expected to match for things hung from his head: his body's idle sway runs on a
#     clock that play() does not reset (N99_static.js, Math.sin(clock * ...)), so his head is in a slightly different place the second
#     time. The check prints which bones and which hanging things differ, so that cause can be seen rather than assumed.
#  3. Jumps of the clock (a tab left in the background, zero and negative frames, 4 frames a second) and a kick: everything stays finite
#     and inside its limits.  4. Laid to rest at once in the stance, and still there 4 seconds later.
#  5. What one frame costs, the triangle counts, and that every attribute list is as long as its list of points.
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUN = r'''
(() => { const j = T.j, G = j.debug.gear, SK = j.SK, v = new THREE.Vector3();
  const names = G.HANG.map((h) => h.bone).concat(G.SPRING.map((s) => s.bone)), BN = ['hips', 'thighR', 'thighL', 'spine3', 'head', 'handR'];
  const gear = () => G.HANG.map((h) => h.a.toFixed(6) + '/' + h.b.toFixed(6)).concat(G.SPRING.map((s) => s.x.toFixed(6) + '/' + s.z.toFixed(6)));
  const body = () => BN.map((n) => SK[n].getWorldPosition(v).toArray().map((x) => x.toFixed(6)).join(','));
  const run = () => { j.play('stand', true); j.play('walk', true); for (let i = 0; i < 200; i++) j.animate(1 / 60); j.root.updateMatrixWorld(true); return { gear: gear(), body: body() }; };
  const a = run(), b = run(), out = { names, BN, first: a, second: b, more: [] };
  let mx = G.HANG.map(() => 0), sp = G.SPRING.map(() => 0); j.play('walk', true); for (let i = 0; i < 600; i++) { j.animate(1 / 60); G.HANG.forEach((h, k) => { mx[k] = Math.max(mx[k], Math.abs(h.a), Math.abs(h.b)); }); G.SPRING.forEach((s, k) => { sp[k] = Math.max(sp[k], Math.hypot(s.x, s.z)); }); }
  out.more.push('widest angle in 10 s of walk, degrees: ' + G.HANG.map((h, k) => h.bone + ' ' + (mx[k] * 57.3).toFixed(1)).join(', ') + ' | hat point ' + sp.map((x) => (x * 57.3).toFixed(2)).join(', '));
  const inside = () => G.HANG.every((h) => isFinite(h.a) && isFinite(h.b) && Math.abs(h.a) <= h.aMax + 1e-6 && Math.abs(h.b) <= h.bMax + 1e-6) && G.SPRING.every((s) => isFinite(s.x) && isFinite(s.z) && Math.abs(s.x) <= s.max + 1e-6 && Math.abs(s.z) <= s.max + 1e-6);
  for (const dt of [30, 0, -1, 0.25, 0.25, 0.25, 0.25, 2, 1 / 60]) j.animate(dt); let ok = inside(); j.gearKick(); for (let i = 0; i < 20; i++) { j.animate(0.25); ok = ok && inside(); }
  out.more.push('finite and inside their limits after clock jumps and a kick: ' + ok);
  j.play('stand', true); const r0 = gear().join(' '); for (let i = 0; i < 240; i++) j.animate(1 / 60); out.more.push('stance: laid to rest at once and unchanged 4 s later: ' + (r0 === gear().join(' ')));
  j.play('walk', true); const t0 = performance.now(); for (let i = 0; i < 300; i++) G.step(1 / 60, false); out.more.push('gear step: ' + ((performance.now() - t0) / 300).toFixed(3) + ' ms a frame (headless, software drawing; a phone is not measured)');
  const tri = {}; let sum = 0, bad = []; for (const k of ['hatFelt', 'hatBand', 'gPearl', 'gSteel', 'gFeather', 'gBelt', 'gPouch', 'gParch', 'gBrass', 'gDark', 'gLeaf']) { const g = j.meshes[k].geometry, n = g.attributes.position.count; tri[k] = g.index.count / 3; sum += tri[k]; for (const a in g.attributes) if (g.attributes[a].count !== n) bad.push(k + '.' + a); }
  out.more.push('triangles: ' + Object.keys(tri).map((k) => k + ' ' + tri[k]).join(', ') + ' | total ' + sum); out.more.push('attribute lists of the wrong length: ' + (bad.join(', ') || 'none'));
  return out; })()
'''
def load(p):
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:400]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    r = pg.evaluate(RUN); b.close(); return r
with sync_playwright() as p: A = load(p); B = load(p)
same = A['first'] == B['first']
print('1. two fresh loads, 200 frames of walk: gear angles and bone places identical to 6 places: %s' % ('YES' if same else 'NO'))
if not same:
    for n, x, y in zip(A['names'], A['first']['gear'], B['first']['gear']):
        if x != y: print('     differs: %s  %s  vs  %s' % (n, x, y))
print('2. the same run repeated inside one page (his idle sway keeps its clock, so his upper body is not in the same place):')
print('     bones that differ:           %s' % (', '.join(n for n, x, y in zip(A['BN'], A['first']['body'], A['second']['body']) if x != y) or 'none'))
print('     hanging things that differ:  %s' % (', '.join(n for n, x, y in zip(A['names'], A['first']['gear'], A['second']['gear']) if x != y) or 'none'))
print('     hanging things identical:    %s' % (', '.join(n for n, x, y in zip(A['names'], A['first']['gear'], A['second']['gear']) if x == y) or 'none'))
d = [abs(float(x.split('/')[k]) - float(y.split('/')[k])) for x, y in zip(A['first']['gear'], A['second']['gear']) for k in (0, 1)]
print('     largest difference: %.2f degrees' % (max(d) * 57.3))
for i, l in enumerate(A['more']): print('%d. %s' % (i + 3, l))
sys.exit(0 if same else 1)
