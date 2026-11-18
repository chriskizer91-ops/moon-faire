# His shirt while he moves: stills, and three counts. usage: python3 tools/shirt_walk.py out_folder
# 1. Stills. walk_stills.jpg: four moments of one stride from the front, his left side and the back. idle_talk_stills.jpg: idle and talk.
#    sleeve_stills.jpg: his right sleeve close up through the talk (the arm lifts and the elbow folds).
# 2. Doll seen where shirt should be. The shirt, corset, wrist cuffs and hands are drawn solid white with the lace's holes closed; the doll's
#    arms down to 0.30 m (the band is at 0.326) and its trunk outside the open front are drawn pink; the rest of the doll black. Counted from
#    eight sides at eight moments of the walk, and in idle and talk. Pink is his body seen where cloth should hide it. That is a fault unless
#    it is seen through an opening: in talk his forearm points at the camera and the elbow shows as a thin crescent through the 6 mm ring
#    between the band and the forearm. A picture cannot tell those two apart, so:
# 2b. Arm inside sleeve, by rays (tools/shirt_through.js): does not depend on where the camera is. This is the one that decides.
# 3. The cloth's own meters (CLOTH.pen, CLOTH.stray): drawn cloth inside the capsules of his arms, and loose points further from their bones than their leash.
# 4. Same every run, and no explosion: the same moves twice give the same sum; then he is thrown about (a turn, a 10 m move, a long pause).
# The headless browser cannot show movement: these are stills. How it looks moving has to be watched on a phone.
import sys, os, json, numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W, H = 560, 720
SOLID = """(() => { const M = T.j.meshes, S = T.j.shirtMeshes, mk = (c, sk) => new THREE.MeshBasicMaterial({ color: c, skinning: sk, side: THREE.DoubleSide });
  T._keep = {}; for (const k in M) { T._keep[k] = [M[k].visible, M[k].material]; M[k].visible = /^(projTrunk|projHips|projCuff|dollTrunk|dollArms|hand|glove|trousers)/.test(k); if (M[k].visible) M[k].material = mk(0xffffff, true); }
  T._keepS = {}; for (const k in S) { T._keepS[k] = S[k].material; S[k].material = mk(0xffffff, false); }
  for (const k of ['dollTrunk', 'dollArms']) { const g = M[k].geometry, P = g.attributes.position, A = g.attributes.dollArm, L = g.attributes.dollLeg, c = new Float32Array(P.count * 3);
    for (let i = 0; i < P.count; i++) { const arm = L.getZ(i) < 0.5, x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const must = arm ? A.getZ(i) < 0.30 : (y > 1.30 && y < 1.47 && !(z > 0 && Math.abs(x) < 0.075 && y > 1.36) && Math.hypot(x, z + 0.027) > 0.10);
      c[i * 3] = must ? 1 : 0; c[i * 3 + 2] = must ? 1 : 0; }
    T._col = T._col || {}; T._col[k] = g.attributes.color; g.setAttribute('color', new THREE.BufferAttribute(c, 3)); M[k].material = new THREE.MeshBasicMaterial({ vertexColors: true, skinning: true }); }
  T.clean('mask'); })()"""
BACK = "(() => { const M = T.j.meshes, S = T.j.shirtMeshes; for (const k in M) { M[k].visible = T._keep[k][0]; M[k].material = T._keep[k][1]; } for (const k in S) S[k].material = T._keepS[k]; for (const k in T._col) M[k].geometry.setAttribute('color', T._col[k]); T.clean('nodust'); })()"
METERS = "JSON.stringify([T.j.debug.cloth.pen(), T.j.debug.cloth.stray()])"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1200); pg.evaluate("T.clean('nodust')")
    def shot(az, dist=3.0, ty=1.15, el=0.04, tx=0.0):
        pg.evaluate('T.view(%f,%f,%f,%f,22,%d,%d,%f,0)' % (az, el, dist, ty, W, H, tx)); pg.locator('#c').screenshot(path='/tmp/_w.png'); return Image.open('/tmp/_w.png').convert('RGB')
    most = [0]
    def pink(az):
        pg.evaluate(SOLID); pic = shot(az, 2.6, 1.2); im = np.asarray(pic).astype(int); pg.evaluate(BACK)
        n = int(((im[..., 0] > 200) & (im[..., 1] < 80) & (im[..., 2] > 200)).sum())
        if n > most[0]: most[0] = n; pic.save(os.path.join(OUT, 'most_pink.png'))
        return n
    worst = {}
    def meters(tag):
        pen, stray = json.loads(pg.evaluate(METERS))
        for k in pen:
            w = worst.setdefault(k, [0, 0.0, 0.0, -1e9, False, None]); w[0] = max(w[0], pen[k][0]); w[1] = max(w[1], pen[k][1]); w[2] = max(w[2], stray[k][0]); w[4] = w[4] or stray[k][2]
            if stray[k][0] - stray[k][1] > w[3]: w[3] = stray[k][0] - stray[k][1]; w[5] = stray[k][3]
    AZ8 = [i * 0.7853982 for i in range(8)]
    rows = []; stills = []
    pg.evaluate("T.j.play('walk'); T.step(64, 1/30)")
    for k in range(8):
        if k: pg.evaluate('T.step(4, 1/30)')
        rows.append(('walk, moment %d of 8' % (k + 1), [pink(a) for a in AZ8])); meters('walk')
        if k % 2 == 0: stills.append([shot(0), shot(1.5707963), shot(3.1415927)])
    def sheet(cols, name):
        sh = Image.new('RGB', (W * len(cols), H * len(cols[0])), (56, 48, 67))
        for i, col in enumerate(cols):
            for j, im in enumerate(col): sh.paste(im, (i * W, j * H))
        sh.save(os.path.join(OUT, name), quality=90)
    sheet(stills, 'walk_stills.jpg')
    others = []; sleeve = []
    for name in ('idle', 'talk'):
        pg.evaluate("T.j.play('%s'); T.step(45, 1/30)" % name)
        for k in range(2):
            if k: pg.evaluate('T.step(20, 1/30)')
            rows.append(('%s, moment %d of 2' % (name, k + 1), [pink(a) for a in AZ8])); meters(name)
            others.append([shot(0), shot(-0.8)])
            if name == 'talk': sleeve.append([shot(-0.6, 1.3, 1.25, 0.1, -0.2), shot(-2.2, 1.3, 1.25, 0.1, -0.2)])
    sheet(others, 'idle_talk_stills.jpg'); sheet(sleeve, 'sleeve_stills.jpg')
    print('doll in front of shirt, pixels (eight sides, from the front round by his left):')
    for name, v in rows: print('  %-22s %s   sum %d' % (name, ' '.join('%5d' % x for x in v), sum(v)))
    print('cloth meters, worst over those moments: [drawn points inside an arm capsule, deepest mm | furthest from its bones mm, over its leash mm, that point\'s gap to the arm mm (0 = lying on the arm), bad numbers]')
    for k, w in worst.items(): print('  %-9s %4d  %5.1f | %5.1f  %5.1f  %s  %s' % (k, w[0], w[1], w[2], max(0, w[3]), '   - ' if w[5] is None or w[3] <= 0 else '%5.1f' % w[5], w[4]))
    # thrown about
    res = pg.evaluate("""(() => { const C = T.j.debug.cloth, far = () => { let m = 0, bad = false; const s = C.stray(); for (const k in s) { m = Math.max(m, s[k][0] - s[k][1]); bad = bad || s[k][2]; } return [Math.round(m * 10) / 10, bad]; }, out = {};
      T.j.play('walk'); T.step(30, 1/30); T.j.root.rotation.y += 2.5; T.step(1, 1/30); out['a turn of 2.5 radians in one frame'] = far();
      T.j.root.position.x += 10; T.step(1, 1/30); out['a move of 10 m in one frame'] = far(); T.j.root.position.x -= 10; T.j.root.rotation.y -= 2.5; T.step(1, 1/30);
      T.step(1, 30); out['one frame 30 seconds long'] = far(); T.j.play('talk'); T.step(1, 0.05); T.j.pose('A'); out['from talk straight to the A pose'] = far();
      T.j.play('walk'); T.step(600, 1/30); out['20 seconds of walking'] = far(); return JSON.stringify(out); })()""")
    print('thrown about: [mm over the leash, bad numbers]'); [print('  %-36s %s' % (k, v)) for k, v in json.loads(res).items()]
    # is his arm inside his sleeve: the ray test (tools/shirt_through.js), then the test tested
    TH = open(os.path.join(ROOT, 'tools', 'shirt_through.js')).read()
    def through(off, only_rest): return json.loads(pg.evaluate(TH.replace('__OFF__', str(off)).replace('__ONLY_REST__', 'true' if only_rest else 'false').replace('__STRIDE__', '3' if only_rest else '1')))
    print('arm inside sleeve, by rays (every point of the doll\'s arm from 0.08 to 0.30 m down it):')
    for k, v in through(0, False).items(): print('  %-7s his right: %s | his left: %s' % (k, v['R'], v['L']))
    for off in (0.02, 0.08):
        v = through(off, True)['rest']; print('  check on the test, points moved %.2f m out: his right: %s | his left: %s' % (off, v['R'].split(' (')[0], v['L'].split(' (')[0]))
    # the same every run: the page is loaded afresh twice and the same moves are played
    def fresh():
        pg.reload(); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000); pg.wait_for_timeout(300); return pg.evaluate("(() => { T.j.play('walk'); T.step(40, 1/30); T.j.play('talk'); T.step(40, 1/30); return T.j.debug.cloth.sum(); })()")
    a, b2 = fresh(), fresh(); print('same moves twice: sums %.6f and %.6f -> %s' % (a, b2, 'the same' if a == b2 else 'DIFFERENT'))
    if errs: print('PAGE ERRORS', errs)
    b.close()
