# her painted profile beside the model's, millimetre by millimetre (the model's middle line is read straight from headPoint)
import sys, json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(); pg.goto('file:///home/claude/ranger/test_r.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    r = pg.evaluate('''(() => { const d = T.j.debug, out = []; for (let i = 0; i <= 4000; i++) { const p = d.headPoint(0, 1.2 + (Math.PI - 1.2) * i / 4000); out.push([p[1], p[2]]); } return { m: out, mid: d.MID }; })()''')
    b.close()
import numpy as np
m = np.array(r['m']); mid = np.array(r['mid']); o = np.argsort(m[:, 0]); m = m[o]
worst = 0
print('height   painted  model   diff (mm)')
for y, z in mid[::int(sys.argv[1]) if len(sys.argv) > 1 else 3]:
    zm = np.interp(y, m[:, 0], m[:, 1]); worst = max(worst, abs(zm - z))
    print('%.4f   %.4f  %.4f  %+.1f' % (y, z, zm, (zm - z) * 1000))
allz = np.interp(mid[:, 0], m[:, 0], m[:, 1]) - mid[:, 1]
print('worst over the whole table: %.2f mm, mean %.2f mm' % (np.abs(allz).max() * 1000, np.abs(allz).mean() * 1000))
