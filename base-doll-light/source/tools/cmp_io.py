# the model beside a painting at one scale, soles on one line, with the two outlines laid over each other
# usage: cmp_io.py out.jpg view      view: front | back | sideR | sideL
import sys, numpy as np
sys.path.insert(0, '/home/claude/io/tools')
from sil import load, mask_of, figures, spans
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
out, view = sys.argv[1], sys.argv[2]
W, H = 900, 1500; PXM = 357.6 * H / 900; GY = H / 2 + 0.93 * PXM
CFG = {'front': ('B3.png', 0, 0.0, '{arm: 28, leg: 5.5}', 1, 584.3), 'back': ('B3.png', 1, 3.14159, '{arm: 28, leg: 5.5}', -1, 584.3),
       'sideR': ('B2.png', 1, -1.5708, '{arm: 90, leg: 0}', 1, 578.0), 'sideL': ('B2.png', 0, 1.5708, '{arm: 90, leg: 0}', -1, 578.0)}
name, fi, az, pose, sgn, pxm = CFG[view]
a = load('/home/claude/io/refs/' + name); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]; fm = lab == f[5]
k = PXM / pxm
if view in ('front', 'back'):
    best = None
    for h in np.arange(1.06, 1.14, 0.01):
        yy = int(round(f[3] - h * pxm)); sp = [s for s in spans(fm[yy]) if s[1] - s[0] > 20]; c = max(sp, key=lambda s: s[1] - s[0])
        if best is None or c[1] - c[0] < best[1] - best[0]: best = c
    cx = (best[0] + best[1]) / 2
else:
    cs = []
    for h in np.arange(0.32, 0.40, 0.01):
        yy = int(round(f[3] - h * pxm)); c = max(spans(fm[yy]), key=lambda s: s[1] - s[0]); cs.append((c[0] + c[1]) / 2)
    cx = float(np.mean(cs)) + (1 if view == 'sideR' else -1) * 0.034 * pxm      # the painting's skirt hangs 3.4 cm ahead of where the upright model's does
def place(img, mode):
    im = Image.fromarray(img).resize((round(img.shape[1] * k), round(img.shape[0] * k)), Image.LANCZOS if mode != '1' else Image.NEAREST)
    canvas = Image.new(im.mode, (W, H), (56, 48, 67) if im.mode == 'RGB' else 0)
    canvas.paste(im, (round(W / 2 - cx * k), round(GY - f[3] * k))); return canvas
pa = place(a.astype(np.uint8), 'RGB'); pm = np.asarray(place((fm * 255).astype(np.uint8), 'L')) > 127
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1000, 'height': 1600}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
    pg.goto('file:///home/claude/io/test_io.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1500); pg.evaluate('T.j.pose(%s)' % pose)
    pg.evaluate("T.clean('mask'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_m.png')
    pg.evaluate("T.clean('color'); T.view(%f,0,18,0.93,8,%d,%d)" % (az, W, H)); pg.locator('#c').screenshot(path='/tmp/_c.png')
    for e in errs[:5]: print('ERR', e)
    b.close()
mk = np.asarray(Image.open('/tmp/_m.png').convert('RGB')).astype(int); mm = np.abs(mk - np.array([0, 255, 0])).sum(-1) > 90
mc = Image.open('/tmp/_c.png').convert('RGB')
d = np.zeros((H, W, 3), np.uint8); d[...] = (30, 26, 36); d[pm & mm] = (105, 105, 115); d[pm & ~mm] = (235, 70, 70); d[mm & ~pm] = (70, 140, 245)
dd = Image.fromarray(d); dr = ImageDraw.Draw(dd)
for yy in np.arange(0, 1.7, 0.1): y = GY - yy * PXM; dr.line([(0, y), (W, y)], fill=(70, 62, 84)); dr.text((4, y - 11), '%.1f' % yy, fill=(210, 200, 230))
sheet = Image.new('RGB', (W * 3, H)); sheet.paste(pa, (0, 0)); sheet.paste(mc, (W, 0)); sheet.paste(dd, (W * 2, 0))
sheet = sheet.resize((W * 3 * 2 // 3, H * 2 // 3), Image.LANCZOS); sheet.save(out, quality=90)
iou = (pm & mm).sum() / max(1, (pm | mm).sum()); print(view, 'overlap %.3f  painting-only (red) %.3f  model-only (blue) %.3f' % (iou, (pm & ~mm).sum() / pm.sum(), (mm & ~pm).sum() / pm.sum()))
# widths by height: the middle run of each outline
print('  h     painting            model')
for h in np.arange(0.10, 1.45, 0.05):
    yy = int(round(GY - h * PXM)); o = []
    for M in (pm, mm):
        sp = [s for s in spans(M[yy]) if s[1] - s[0] > 6]
        o.append(' '.join('[%+.3f %+.3f]' % (sgn * (s - W / 2) / PXM, sgn * (e - W / 2) / PXM) if sgn > 0 else '[%+.3f %+.3f]' % (-(e - W / 2) / PXM, -(s - W / 2) / PXM) for s, e in sp[:5]))
    print('  %.2f  %-44s | %s' % (h, o[0], o[1]))
