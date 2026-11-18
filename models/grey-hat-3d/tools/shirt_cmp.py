# His shirt beside a painting at one scale, with a grid in metres. usage: python3 tools/shirt_cmp.py out.jpg view [js]     view: front | back
# Three panels from 1.05 to 1.62 m: the painting (placed by out/registration.json, as the old painted skin placed it) | the model |
# the two outlines laid over each other: grey both, red only the painting, blue only the model.
# Prints a small table: the outline's outer edges (which at these heights are the sleeves) every 5 cm, painting and model, in cm from his middle line.
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out, view = sys.argv[1], sys.argv[2]; js = sys.argv[3] if len(sys.argv) > 3 else '1'
W, H = 900, 1500; PXM = 357.6 * H / 900; GY = H / 2 + 0.93 * PXM
r = json.load(open(os.path.join(ROOT, 'out', 'registration.json')))[view]; az = {'front': 0.0, 'back': 3.14159265}[view]
a = load(os.path.join(ROOT, 'refs', r['name'])); m, _ = mask_of(a)
ys = np.arange(H); hs = (GY - ys) / PXM; xs = np.arange(W); sx = (xs - W / 2) / PXM
pr = r['y1'] - hs * r['pxm']; pc = r['c'] + sx * r['pxm']
ri = np.clip(np.round(pr).astype(int), 0, a.shape[0] - 1); ci = np.clip(np.round(pc).astype(int), 0, a.shape[1] - 1)
keep = ((pr >= 0) & (pr < a.shape[0]))[:, None] & ((pc >= r['x0'] - 4) & (pc <= r['x1'] + 4))[None, :]
pa = np.zeros((H, W, 3), np.uint8); pa[...] = (56, 48, 67); pa[keep] = a[ri][:, ci].astype(np.uint8)[keep]; pm = m[ri][:, ci] & keep
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1000, 'height': 1600}); pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1500); pg.evaluate('T.j.pose({}); %s' % js)
    pg.evaluate("T.clean('mask'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_sm.png')
    pg.evaluate("T.clean('nodust'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_sc.png'); b.close()
mm = np.abs(np.asarray(Image.open('/tmp/_sm.png').convert('RGB')).astype(int) - np.array([0, 255, 0])).sum(-1) > 90
mc = np.asarray(Image.open('/tmp/_sc.png').convert('RGB'))
ov = np.zeros((H, W, 3), np.uint8); ov[...] = (56, 48, 67); ov[pm & mm] = (150, 150, 150); ov[pm & ~mm] = (230, 60, 60); ov[~pm & mm] = (70, 110, 255)
y0, y1 = int(GY - 1.62 * PXM), int(GY - 1.05 * PXM); x0, x1 = int(W / 2 - 0.62 * PXM), int(W / 2 + 0.62 * PXM)
sh = Image.new('RGB', ((x1 - x0) * 3, y1 - y0))
for i, im in enumerate((pa, mc, ov)):
    t = Image.fromarray(im).crop((x0, y0, x1, y1)); d = ImageDraw.Draw(t)
    for hcm in range(110, 161, 10): Y = GY - hcm / 100 * PXM - y0; d.line([(0, Y), (x1 - x0, Y)], fill=(0, 120, 0)); d.text((3, Y + 2), '%.2f' % (hcm / 100), fill=(255, 255, 0))
    for xcm in range(-60, 61, 20): X = W / 2 + xcm / 100 * PXM - x0; d.line([(X, 0), (X, y1 - y0)], fill=(0, 120, 0)); d.text((X + 2, 2), '%.1f' % (xcm / 100), fill=(255, 255, 0))
    sh.paste(t, (i * (x1 - x0), 0))
sh.save(out, quality=90)
print(view, ': outer edges of the outline, cm from his middle line (painting | model | model minus painting)')
print('  height   left edge             right edge')
for hcm in range(120, 151, 5):
    Y = int(GY - hcm / 100 * PXM); pe = np.nonzero(pm[Y])[0]; me = np.nonzero(mm[Y])[0]
    if len(pe) == 0 or len(me) == 0: continue
    f = lambda px: (px - W / 2) / PXM * 100
    print('  %.2f    %6.1f %6.1f %+5.1f    %6.1f %6.1f %+5.1f' % (hcm / 100, f(pe[0]), f(me[0]), f(me[0]) - f(pe[0]), f(pe[-1]), f(me[-1]), f(me[-1]) - f(pe[-1])))
# the cloth's colour at a few places that are plain cloth in both (metres from his middle line, height): mean and spread of painting and model
print('  colour of plain cloth: place | painting mean (spread of its brightness) | model mean (spread)')
for name, x, y in (('his right sleeve', -0.27, 1.33), ('his left sleeve', 0.27, 1.33), ('right of the ruffle', -0.155, 1.33), ('left of the ruffle', 0.155, 1.33), ('on his right ruffle', -0.095, 1.385), ('on his left ruffle', 0.095, 1.385)):
    X, Y = int(W / 2 + x * PXM), int(GY - y * PXM); A = pa[Y - 14:Y + 14, X - 10:X + 10].reshape(-1, 3).astype(float); B = mc[Y - 14:Y + 14, X - 10:X + 10].reshape(-1, 3).astype(float)
    print('  %-20s %s (%4.1f) | %s (%4.1f)' % (name, A.mean(0).round(0), A.mean(1).std(), B.mean(0).round(0), B.mean(1).std()))
