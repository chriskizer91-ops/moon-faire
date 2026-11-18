# His trousers beside a painting at one scale, with a grid in metres, and the holes of both measured the same way.
# usage: python3 tools/trouser_cmp.py out.jpg view [js]      view: front | back | sideL | sideR      js: run in the page first (optional)
# Three panels: the painting (placed by out/registration.json, as the old painted skin placed it) | the model | the two laid over each other:
#   grey: both are him     red: only the painting     blue: only the model     yellow: a hole in the painting     cyan line: a hole in the model
# A hole in the painting is where skin colour shows between 0.40 and 1.00 m (tools/trouser_measure.py uses the same rule). A hole in the
# model is the opening itself: the cloth is drawn alone, in white, with its holes and with them closed, and the difference is measured. The same skin rule on the model's
# picture then says how much of each opening shows leg.
# From the sides the model holds its arms out, as B2 does. Prints two small tables: the outline's edges every 5 cm, and the holes.
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of
from scipy import ndimage as ndi
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out, view = sys.argv[1], sys.argv[2]; js = sys.argv[3] if len(sys.argv) > 3 else '1'
W, H = 900, 1500; PXM = 357.6 * H / 900; GY = H / 2 + 0.93 * PXM; ZOFF = 0.035
r = json.load(open(os.path.join(ROOT, 'out', 'registration.json')))[view]
az, pose, zo = {'front': (0.0, '{}', 0), 'back': (3.14159265, '{}', 0), 'sideL': (1.57079633, '{arm: 85}', -ZOFF), 'sideR': (-1.57079633, '{arm: 85}', ZOFF)}[view]
a = load(os.path.join(ROOT, 'refs', r['name'])); m, _ = mask_of(a)
ys = np.arange(H); hs = (GY - ys) / PXM; xs = np.arange(W); sx = (xs - W / 2) / PXM
pr = r['y1'] - hs * r['pxm']; pc = r['c'] + (sx + zo) * r['pxm']
ri = np.clip(np.round(pr).astype(int), 0, a.shape[0] - 1); ci = np.clip(np.round(pc).astype(int), 0, a.shape[1] - 1)
keep = ((pr >= 0) & (pr < a.shape[0]))[:, None] & ((pc >= r['x0'] - 4) & (pc <= r['x1'] + 4))[None, :]
pa = np.zeros((H, W, 3), np.uint8); pa[...] = (56, 48, 67); pa[keep] = a[ri][:, ci].astype(np.uint8)[keep]; pm = m[ri][:, ci] & keep
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1000, 'height': 1600}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1500); pg.evaluate('T.j.pose(%s); %s' % (pose, js))
    pg.evaluate("T.clean('mask'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_tm.png')
    pg.evaluate("T.clean('nodust'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_tc.png')
    # the openings themselves: only the cloth, in white, seen from its outer side, so every hole shows the green behind it
    pg.evaluate("(() => { const M = T.j.meshes, t = M.trousers; for (const k in M) M[k].visible = k === 'trousers'; t.material = new THREE.MeshBasicMaterial({ color: 0xffffff, skinning: true, alphaMap: t.customDepthMaterial.alphaMap, alphaTest: 0.5 }); })(); T.clean('mask'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_to.png')
    # and the same cloth with its holes closed, front faces only: an opening is where this one has cloth facing us and the other has none
    pg.evaluate("(() => { const t = T.j.meshes.trousers; t.material = new THREE.MeshBasicMaterial({ color: 0xffffff, skinning: true }); })(); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_ts.png')
    pg.evaluate("(() => { const t = T.j.meshes.trousers; t.material = new THREE.MeshBasicMaterial({ color: 0xffffff, skinning: true, side: THREE.DoubleSide, alphaMap: t.customDepthMaterial.alphaMap, alphaTest: 0.5 }); })(); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_to2.png')
    for e in errs[:5]: print('ERR', e)
    b.close()
G0 = np.array([0, 255, 0]); isw = lambda f: np.abs(np.asarray(Image.open(f).convert('RGB')).astype(int) - G0).sum(-1) > 90
cloth, solid, seen = isw('/tmp/_to.png'), isw('/tmp/_ts.png'), isw('/tmp/_to2.png')      # near cloth with holes | near cloth, holes closed | any cloth, near or far
opening = solid & ~cloth; opening[:int(GY - 1.00 * PXM)] = False; opening = ndi.binary_opening(opening, iterations=2)
mk = np.asarray(Image.open('/tmp/_tm.png').convert('RGB')).astype(int); mm = np.abs(mk - np.array([0, 255, 0])).sum(-1) > 90
mc = np.asarray(Image.open('/tmp/_tc.png').convert('RGB'))
def holes(img):
    R, G, B = img[..., 0].astype(float), img[..., 1].astype(float), img[..., 2].astype(float)
    skin = (R > 150) & (R - B > 45) & (G > 85) & (G - B > 12); skin = ndi.binary_opening(ndi.binary_closing(skin, iterations=4), iterations=2)
    sel = np.zeros_like(skin); sel[int(GY - 1.00 * PXM):int(GY - 0.40 * PXM), :] = True
    if view in ('front', 'back'): sel[:, :int(W / 2 - 0.26 * PXM)] = False; sel[:, int(W / 2 + 0.26 * PXM):] = False       # not his hands
    lab, n = ndi.label(skin & sel); res = []
    for i in range(1, n + 1):
        yy, xx = np.nonzero(lab == i)
        if len(yy) < 180: continue
        res.append(((xx.mean() - W / 2) / PXM, (GY - yy.mean()) / PXM, (xx.max() - xx.min()) / PXM, (yy.max() - yy.min()) / PXM, len(yy) / PXM ** 2 * 1e4))
    return sorted(res, key=lambda q: (q[0] > 0, -q[1])) if view in ('front', 'back') else sorted(res, key=lambda q: -q[1]), lab > 0
hp, hpm = holes(pa); hm, hmm = holes(mc)
def openings():
    lab, n = ndi.label(opening); res = []
    for i in range(1, n + 1):
        yy, xx = np.nonzero(lab == i)
        if len(yy) < 120: continue
        res.append(((xx.mean() - W / 2) / PXM, (GY - yy.mean()) / PXM, (xx.max() - xx.min()) / PXM, (yy.max() - yy.min()) / PXM, len(yy) / PXM ** 2 * 1e4, 100.0 * (hmm & (lab == i)).sum() / len(yy)))
    return sorted(res, key=lambda q: (q[0] > 0, -q[1])) if view in ('front', 'back') else sorted(res, key=lambda q: -q[1])
ho = openings()
B = ((hs > 0.33) & (hs < 1.16))[:, None] & np.ones((1, W), bool)
d = np.zeros((H, W, 3), np.uint8); d[...] = (30, 26, 36)
d[pm & mm & B] = (105, 105, 115); d[pm & ~mm & B] = (235, 70, 70); d[mm & ~pm & B] = (70, 140, 245); d[hpm & B] = (230, 210, 60)
edge = opening & ~ndi.binary_erosion(opening, iterations=2); d[edge & B] = (60, 240, 240)
def grid(im):
    im = Image.fromarray(im); dr = ImageDraw.Draw(im)
    for yy in np.arange(0.4, 1.15, 0.1): y = GY - yy * PXM; dr.line([(0, y), (W, y)], fill=(120, 110, 140)); dr.text((4, y - 11), '%.1f' % yy, fill=(240, 230, 255))
    for xx in np.arange(-0.3, 0.31, 0.1): x = W / 2 + xx * PXM; dr.line([(x, 0), (x, H)], fill=(120, 110, 140)); dr.text((x + 3, GY - 1.15 * PXM + 2), '%+.1f' % xx, fill=(240, 230, 255))
    return im
sheet = Image.new('RGB', (W * 3, H)); sheet.paste(grid(pa), (0, 0)); sheet.paste(grid(mc.copy()), (W, 0)); sheet.paste(grid(d), (W * 2, 0))
x0, x1 = int(W / 2 - 0.36 * PXM), int(W / 2 + 0.36 * PXM); y0, y1 = int(GY - 1.16 * PXM), int(GY - 0.33 * PXM)
cut = Image.new('RGB', ((x1 - x0) * 3 + 20, y1 - y0), (255, 255, 255))
for k in range(3): cut.paste(sheet.crop((W * k + x0, y0, W * k + x1, y1)), (k * (x1 - x0 + 10), 0))
cut.save(out, quality=92)
side = view.startswith('side'); nm = 'forward' if side else ('his left' if view == 'front' else 'screen right')
print('%s: the outline. Across is metres on the screen (+ is %s)' % (view, 'screen right' if side else nm))
print('  height | painting from .. to  | model from .. to     | model minus painting: left edge, right edge (mm)')
for h in (1.00, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45, 0.41):
    y = int(GY - h * PXM); P = np.nonzero(pm[y] & (np.abs(sx) < 0.33))[0]; M = np.nonzero(mm[y] & (np.abs(sx) < 0.33))[0]
    if len(P) and len(M): print('   %.2f  | %+.3f .. %+.3f     | %+.3f .. %+.3f     | %+4.0f  %+4.0f' % (h, sx[P[0]], sx[P[-1]], sx[M[0]], sx[M[-1]], (sx[M[0]] - sx[P[0]]) * 1000, (sx[M[-1]] - sx[P[-1]]) * 1000))
print('%s: the holes (middle across, middle height, how wide, how tall, metres; area in square cm; for the model, the share of the opening where leg shows)' % view)
print('   n | painting: leg showing                   | model: the opening itself                 leg %')
for i in range(max(len(hp), len(ho))):
    f = lambda q: '%+.3f  %.3f   %.3f x %.3f   %5.1f' % q[:5] if q else ' ' * 39
    print('  %2d | %s | %s   %s' % (i + 1, f(hp[i] if i < len(hp) else None), f(ho[i] if i < len(ho) else None), ('%3.0f' % ho[i][5]) if i < len(ho) else ''))
