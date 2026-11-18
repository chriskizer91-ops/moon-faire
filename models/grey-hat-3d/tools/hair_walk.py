# His hair in motion, by numbers (the headless browser is too slow to watch): steps the model's clock and reads the hair's meter.
# usage: python3 -I tools/hair_walk.py [out_prefix]     with a prefix it also saves stills of a head turn
# far: how far the furthest joint of a chain is from where it would rest (mm). deep: how deep the deepest joint is inside a ball on his
# neck, shoulders, chest or back (mm; negative is clear). sum: a checksum of every joint, to compare runs.
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); out = sys.argv[1] if len(sys.argv) > 1 else None
JS = r"""
(() => { const j = T.j, H = j.debug.hairSim, R = {}, r3 = (v) => Math.round(v * 1e6) / 1e6;
  const run = (n, dt) => { let far = 0, deep = -99, bad = 0; for (let i = 0; i < n; i++) { j.animate(dt); const m = H.meter(); far = Math.max(far, m[0]); deep = Math.max(deep, m[1]); if (!isFinite(H.sum())) bad++; } return { far, deep, bad }; };
  j.pose(); R.rest = H.meter(); R.restSum = r3(H.sum());
  j.play('idle'); R.idle = run(180, 1 / 60);
  j.play('walk'); R.walk = run(240, 1 / 60); R.walkSum = r3(H.sum());
  j.play('talk'); R.talk = run(240, 1 / 60);
  j.play('walk'); R.walk30 = run(90, 1 / 30); R.walkSlow = run(40, 0.2); R.walk144 = run(200, 1 / 144);
  j.animate(30); j.animate(1e9); j.animate(-5); j.animate(NaN); R.afterJumps = H.meter(); R.jumpFinite = isFinite(H.sum());
  j.root.position.set(40, 0, -30); j.root.rotation.y = 2.5; j.animate(1 / 60); R.afterMove = H.meter(); j.root.position.set(0, 0, 0); j.root.rotation.y = 0;
  j.pose(); R.restAgain = H.meter(); R.restAgainSum = r3(H.sum());
  j.setCloth(false); j.play('walk'); R.frozen = run(60, 1 / 60); j.setCloth(true); j.pose(); R.sumBack = r3(H.sum());
  const t0 = performance.now(); for (let i = 0; i < 2000; i++) H.step(1 / 60, false); R.msPerFrame = Math.round((performance.now() - t0) / 2000 * 1000) / 1000;
  j.pose(); return R; })()
"""
TURN = r"""
(() => { const j = T.j, H = j.debug.hairSim, SK = j.SK; j.pose(); let was = [0, 0, 0];
  window.turn = (ry, rx, rz, ramp, n) => { let far = 0, deep = -99; for (let i = 1; i <= n; i++) { const u = Math.min(1, i / ramp), e = u * u * (3 - 2 * u); SK.head.rotation.set(was[1] + (rx - was[1]) * e, was[0] + (ry - was[0]) * e, was[2] + (rz - was[2]) * e); j.root.updateMatrixWorld(true); H.step(1 / 60, false); const m = H.meter(); far = Math.max(far, m[0]); deep = Math.max(deep, m[1]); } if (n >= ramp) was = [ry, rx, rz]; return [far, deep, H.meter()]; }; return 1; })()
"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    sums = []
    for k in range(2):
        pg = b.new_page(viewport={'width': 720, 'height': 920}); pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
        err = pg.evaluate('T.err || ""')
        if err: print('BUILD ERROR', err); sys.exit(1)
        R = pg.evaluate(JS); sums.append((R['restSum'], R['walkSum'], R['restAgainSum'], R['sumBack']))
        if k == 0:
            for key in R: print('  %-12s %s' % (key, json.dumps(R[key])))
            pg.evaluate(TURN)
            print('  head turned 35 degrees in 0.3 s and held, snapped back in one frame, nodded, tilted: [most far, most deep, [far, deep] at the end]')
            for name, args in [('turn mid', '0.61,0,0,18,9'), ('turn end', '0.61,0,0,18,18'), ('turn +0.2s', '0.61,0,0,1,12'), ('turn +1s', '0.61,0,0,1,60'), ('snap back', '0,0,0,1,4'), ('snap +1s', '0,0,0,1,60'), ('nod 20', '0,0.35,0,18,60'), ('tilt 15', '0,0,0.26,18,60'), ('rest again', '0,0,0,18,90')]:
                print('    %-18s %s' % (name, json.dumps(pg.evaluate('turn(%s)' % args))))
                if out:
                    pg.evaluate("T.clean('nodust')"); pg.evaluate('T.view(0.5,0.1,1.3,1.58,22,700,800)'); pg.wait_for_timeout(300); pg.locator('#c').screenshot(path='%s_%s_a.png' % (out, name.replace(' ', '').replace('+', 'p').replace('.', '')))
                    pg.evaluate('T.view(3.6,0.1,1.3,1.58,22,700,800)'); pg.wait_for_timeout(300); pg.locator('#c').screenshot(path='%s_%s_b.png' % (out, name.replace(' ', '').replace('+', 'p').replace('.', '')))
        pg.close()
    print('  same on two runs:', sums[0] == sums[1], sums[0])
    b.close()
