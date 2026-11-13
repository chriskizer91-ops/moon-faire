# the model beside a painting at one scale, soles on one line, with the two outlines laid over each other
# usage: cmp.py out.jpg view      view: front | back | sideR | sideL
# Red: the painting reaches further than the model. Blue: the model reaches further than the painting. Grey: they agree.
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of, figures, spans
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out, view = sys.argv[1], sys.argv[2]
W, H = 900, 1500; PXM = 357.6 * H / 900; GY = H / 2 + 0.93 * PXM; ZOFF = 0.035
reg = json.load(open(os.path.join(ROOT, 'out', 'registration.json')))[view]
az, pose, sgn = {'front': (0.0, '{}', 1), 'back': (3.14159265, '{}', -1), 'sideR': (-1.57079633, '{arm: 90}', 1), 'sideL': (1.57079633, '{arm: 90}', -1)}[view]
a = load(os.path.join(ROOT, 'refs', reg['name'])); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[reg['fi']]; fm = lab == f[5]
k = PXM / reg['pxm']; cx = reg['c']; off = 0 if view in ('front', 'back') else -ZOFF * PXM
def place(img, mode):
    im = Image.fromarray(img).resize((round(img.shape[1] * k), round(img.shape[0] * k)), Image.LANCZOS if mode != '1' else Image.NEAREST)
    canvas = Image.new(im.mode, (W, H), (56, 48, 67) if im.mode == 'RGB' else 0)
    canvas.paste(im, (round(W / 2 + sgn * off - cx * k), round(GY - f[3] * k))); return canvas
pa = place(a.astype(np.uint8), 'RGB'); pm = np.asarray(place((fm * 255).astype(np.uint8), 'L')) > 127
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1000, 'height': 1600}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1500); pg.evaluate('T.j.pose(%s)' % pose)
    pg.evaluate("T.clean('mask'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_m.png')
    pg.evaluate("T.clean('nodust'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_c.png')
    for e in errs[:5]: print('ERR', e)
    b.close()
mk = np.asarray(Image.open('/tmp/_m.png').convert('RGB')).astype(int); mm = np.abs(mk - np.array([0, 255, 0])).sum(-1) > 90
mc = Image.open('/tmp/_c.png').convert('RGB')
d = np.zeros((H, W, 3), np.uint8); d[...] = (30, 26, 36); d[pm & mm] = (105, 105, 115); d[pm & ~mm] = (235, 70, 70); d[mm & ~pm] = (70, 140, 245)
dd = Image.fromarray(d); dr = ImageDraw.Draw(dd)
for yy in np.arange(0, 1.9, 0.1): y = GY - yy * PXM; dr.line([(0, y), (W, y)], fill=(70, 62, 84)); dr.text((4, y - 11), '%.1f' % yy, fill=(210, 200, 230))
sheet = Image.new('RGB', (W * 3, H)); sheet.paste(pa, (0, 0)); sheet.paste(mc, (W, 0)); sheet.paste(dd, (W * 2, 0))
sheet = sheet.resize((W * 3 * 2 // 3, H * 2 // 3), Image.LANCZOS); sheet.save(out, quality=90)
iou = (pm & mm).sum() / max(1, (pm | mm).sum()); print(view, 'overlap %.3f  painting only (red) %.3f  model only (blue) %.3f' % (iou, (pm & ~mm).sum() / pm.sum(), (mm & ~pm).sum() / pm.sum()))
