# Lays the model's middle line (the points of the face mesh on x = 0) over her painted profile from C3 and prints the gap by height, in millimetres.
# The aim (HOW-TO-3d-witch-faces, step 2): within 1 mm from brow to chin.      run: python3 -I prof_check.py
import json, numpy as np
from playwright.sync_api import sync_playwright
W = '/home/claude/fox3d/'; M = json.load(open(W + 'meas/fox_profile.json')); H = json.load(open(W + 'meas/fox_head.json')); R = H['rows']; PPM = H['PPM']
pr = np.array(M['profile']); rows, cols = pr[:, 0], pr[:, 1]
fr = np.interp(rows, [0, R['sn'], R['st'], R['men'], 2000], [0, R['sn'], H['mouthRow'], R['men'], 2000]); Yp = 1.5246 - (fr - H['eyeRow']) / PPM; Zp = 0.002 + 0.0985 + (cols - H['cRef']) / PPM
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(); pg.goto('file://' + W + 'test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    pts = pg.evaluate("(() => { const g = T.j.debug.meshes.face.geometry.attributes.position, o = []; for (let i = 0; i < g.count; i++) if (Math.abs(g.getX(i)) < 0.0006 && g.getZ(i) > 0.05) o.push([g.getY(i), g.getZ(i)]); return o; })()"); b.close()
pts = np.array(sorted(pts)); worst = 0
for name, y in (('brow', 1.5404), ('nasion', H['L']['nasion'][0]), ('bridge', 1.515), ('nose tip', H['L']['tip'][0]), ('under nose', H['L']['subnasale'][0]), ('upper lip', H['L']['upperLip'][0]), ('lip line', H['L']['lipLine'][0]), ('lower lip', H['L']['lowerLip'][0]), ('fold', H['L']['fold'][0]), ('chin point', H['L']['chinPoint'][0]), ('low chin', H['L']['underChin'][0] + 0.006)):
    zm = float(np.interp(y, pts[:, 0], pts[:, 1])); zp = float(np.interp(-y, -Yp, Zp)); gap = (zm - zp) * 1000; worst = max(worst, abs(gap)); print('%-11s y %.4f  model %.1f  painting %.1f  gap %+.1f mm' % (name, y, zm * 1000, zp * 1000, gap))
ys = np.arange(H['L']['underChin'][0] + 0.006, 1.545, 0.001); bi = np.round(pts[:, 0] / 0.002).astype(int); ub = np.unique(bi); env = np.interp(ys, [pts[bi == k, 0].mean() for k in ub], [pts[bi == k, 1].max() for k in ub]); g = env - np.interp(-ys, -Yp, Zp);      # the front-most point at each height: under the chin the mesh folds back
print('brow to chin: mean gap %.2f mm, worst %.2f mm at y %.4f' % (np.abs(g).mean() * 1000, np.abs(g).max() * 1000, ys[np.argmax(np.abs(g))]))
