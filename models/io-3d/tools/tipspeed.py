# usage: tools/tipspeed.py [seconds]  -> how fast her reading fingertip moves over the page (cm a second), and its biggest jumps
import sys, json
from playwright.sync_api import sync_playwright
secs = float(sys.argv[1]) if len(sys.argv) > 1 else 22
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 400, 'height': 400}); pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300]))
    pg.goto('file:///home/claude/io/test_io.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    r = pg.evaluate("""(() => { const SK = T.j.debug.SK, V = THREE.Vector3, inv = new THREE.Matrix4(), tip = new V(), last = new V(), out = []; T.j.pose({arm:15}); T.j.setBlink(false); T.j.play('idle'); for (let i = 0; i < 40; i++) T.j.animate(0, 0, 0, 1/60); T.j.play('read');
      const n = Math.round(%f * 60); for (let i = 0; i < n; i++) { T.j.animate(0, 0, 0, 1/60); inv.copy(SK.book.matrixWorld).invert(); tip.setFromMatrixPosition(SK.idx2R.matrixWorld).applyMatrix4(inv); if (i > 90) out.push(+(tip.distanceTo(last) * 60 * 100).toFixed(2)); last.copy(tip); } return out; })()""" % secs)
    b.close()
import statistics
acc = [abs(r[i + 1] - r[i]) for i in range(len(r) - 1)]
print('fingertip over the page, from 1.5 s on: mean %.1f cm/s, median %.1f, 95th %.1f, fastest %.1f cm/s; biggest change of speed between two frames %.1f cm/s' % (statistics.mean(r), statistics.median(r), sorted(r)[int(len(r) * 0.95)], max(r), max(acc)))
print('frames faster than 12 cm/s:', sum(1 for x in r if x > 12), 'of', len(r))
