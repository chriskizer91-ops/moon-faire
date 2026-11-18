# Io's head, hat and hair beside her paintings at one scale: for each view, the painting on the left and the model on the right.
#   front  : C4 left figure  (1370 px a metre, middle x 287, eyes y 453.5)
#   profile: C4 right figure (1290 px a metre, tip of the nose x 1432, eye y 462); the model is seen from her right, as painted
#   back   : C5 middle figure (1235 px a metre, middle x 742, the back edge of the brim y 372 = 1.44 m)
# usage: python3 tools/cmp_head_io.py out.jpg
import sys, numpy as np
sys.path.insert(0, '/home/claude/io/tools')
from sil import load, mask_of, figures
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
out = sys.argv[1]
S = 900.0; WM, HM, CY = 0.66, 0.84, 1.40          # the window: metres wide and high, and the height of its middle
W, H = int(WM * S), int(HM * S); FOV = 5.0; DIST = H / (2 * S * np.tan(np.radians(FOV / 2)))
BG = (56, 48, 67)
def painting(name, fi, pxm, ax, ay, mx, my):       # the figure's pixel (ax, ay) is the point (mx across, my up) of the window
    a = load('/home/claude/io/refs/' + name); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]
    x0, y0, x1, y1 = max(0, f[0] - 6), max(0, f[1] - 6), f[2] + 6, f[3] + 6
    im = Image.fromarray(a[y0:y1, x0:x1].astype(np.uint8)); k = S / pxm; im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    c = Image.new('RGB', (W, H), BG); c.paste(im, (round(W / 2 + mx * S - (ax - x0) * k), round(H / 2 - (my - CY) * S - (ay - y0) * k))); return c
views = [('Front: painting C4 and the model', painting('C4.png', 0, 1370.0, 287.0, 453.5, 0.0, 1.511), 0.0, 0.0),
         ('Profile: painting C4 and the model', painting('C4.png', 2, 1290.0, 1432.0, 462.0, 0.107 + 0.02, 1.511), -np.pi / 2, 0.02),
         ('From behind: painting C5 and the model', painting('C5.png', 1, 1235.0, 742.0, 372.0, 0.0, 1.44), np.pi, 0.0)]
shots = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': W + 40, 'height': H + 40}); pg.goto('file:///home/claude/io/test_io.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1500); pg.evaluate('T.clean("color"); T.j.pose({arm:15})')
    for i, (lab_, pa, az, shift) in enumerate(views):
        pg.evaluate('T.stage.orbit.target.z = %f; T.view(%f,0,%f,%f,%f,%d,%d)' % (-shift if az else 0, az, DIST, CY, FOV, W, H)); pg.locator('#c').screenshot(path='/tmp/_ch%d.png' % i); shots.append(Image.open('/tmp/_ch%d.png' % i).convert('RGB'))
    b.close()
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
G = 14; TH = 44; sheet = Image.new('RGB', (3 * (2 * W + G) + 2 * 28, H + TH + 30), (21, 18, 28)); d = ImageDraw.Draw(sheet)
for i, (lab_, pa, az, shift) in enumerate(views):
    x = i * (2 * W + G + 28); d.text((x + 6, 10), lab_, fill=(240, 223, 192), font=f); sheet.paste(pa, (x, TH)); sheet.paste(shots[i], (x + W + G, TH))
d.text((6, H + TH + 6), 'Each pair is at one scale. The paintings show her robe, belt and jewellery, which are not built yet.', fill=(169, 157, 185), font=f2)
if sheet.width > 3000: sheet = sheet.resize((3000, round(sheet.height * 3000 / sheet.width)), Image.LANCZOS)
sheet.save(out, quality=88); print(out, sheet.size)
