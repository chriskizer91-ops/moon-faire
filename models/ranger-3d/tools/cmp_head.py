# her head beside a painting at one scale: painting | model | the two outlines over each other (red: painting only, blue: model only)
# usage: cmp_head.py out.jpg side|front [js to run first]
import sys, numpy as np
sys.path.insert(0, '/home/claude/ranger/tools')
from sil import load, mask_of
from PIL import Image
from scipy import ndimage as ndi
from playwright.sync_api import sync_playwright
out, view = sys.argv[1], sys.argv[2]; pre = sys.argv[3] if len(sys.argv) > 3 else ''
W, H, FOV, DIST, TY = 640, 760, 5.0, 8.0, 1.545
PXM = H / (2 * DIST * np.tan(np.radians(FOV / 2)))          # pixels a metre in the render
a = load('/home/claude/ranger/refs/C3.png'); m, _ = mask_of(a)
if view == 'side': m[:, :1012] = False; pxm, ax, ay, az = 1837.0, 1498.0, 381.0, -np.pi / 2; mx, my = 0.107, 1.512      # the tip of her nose sits 0.107 m forward, her eye at 1.512 m
else: m[:, 505:] = False; pxm, ax, ay, az = 1970.0, 287.5, 384.0, 0.0; mx, my = 0.0, 1.512
k = PXM / pxm
def place(arr, mode):
    im = Image.fromarray(arr, mode); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    c = Image.new(mode, (W, H), (56, 48, 67) if mode == 'RGB' else 0); c.paste(im, (round(W / 2 + mx * PXM - ax * k), round(H / 2 - (my - TY) * PXM - ay * k))); return c
pa = place(a.astype(np.uint8), 'RGB'); pm = np.asarray(place((m * 255).astype(np.uint8), 'L')) > 127
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 800, 'height': 900}); pg.goto('file:///home/claude/ranger/test_r.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1500); pg.evaluate('T.j.pose({arm:24,leg:3});' + pre)
    pg.evaluate("T.clean('mask'); T.view(%f,0,%f,%f,%f,%d,%d)" % (az, DIST, TY, FOV, W, H)); pg.locator('#c').screenshot(path='/tmp/_hm.png')
    pg.evaluate("T.clean('color'); T.view(%f,0,%f,%f,%f,%d,%d)" % (az, DIST, TY, FOV, W, H)); pg.locator('#c').screenshot(path='/tmp/_hc.png')
    b.close()
mk = np.asarray(Image.open('/tmp/_hm.png').convert('RGB')).astype(int); mm = np.abs(mk - np.array([0, 255, 0])).sum(-1) > 90
mc = Image.open('/tmp/_hc.png').convert('RGB')
d = np.asarray(pa).astype(np.float32) * 0.45; d[pm & ~mm] = d[pm & ~mm] * 0.4 + np.array([235, 70, 70]) * 0.6; d[mm & ~pm] = d[mm & ~pm] * 0.4 + np.array([70, 140, 245]) * 0.6
edge = mm ^ ndi.binary_erosion(mm, iterations=2); d[edge] = (255, 255, 255)
sheet = Image.new('RGB', (W * 3, H)); sheet.paste(pa, (0, 0)); sheet.paste(mc, (W, 0)); sheet.paste(Image.fromarray(d.astype(np.uint8)), (W * 2, 0)); sheet.save(out, quality=88)
# how high the outline stands, column by column: painting and model, in metres
print('top of the outline by ' + ('z (forward of the body line)' if view == 'side' else 'x (from the middle)') + ': painting, model, model - painting (mm)')
for v in ([-0.12, -0.10, -0.08, -0.06, -0.04, -0.02, 0.0, 0.02, 0.04, 0.06, 0.08] if view == 'side' else [-0.08, -0.06, -0.04, -0.02, 0.0, 0.02, 0.04, 0.06, 0.08]):
    c = int(round(W / 2 + v * PXM)); pa_ = np.nonzero(pm[:, c])[0]; ma_ = np.nonzero(mm[:, c])[0]
    f = lambda r: TY + (H / 2 - r) / PXM
    if len(pa_) and len(ma_): print('  %+.2f   %.3f  %.3f  %+4.0f' % (v, f(pa_.min()), f(ma_.min()), (f(ma_.min()) - f(pa_.min())) * 1000))
print(out, 'px/m', round(PXM))
