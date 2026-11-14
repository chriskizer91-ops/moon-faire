# Checks the doll's skin tone against his painted face, neck and hands, in one test picture of the doll (stage 2 of the rebuild).
# usage: python3 tools/trouser_check.py [out.png]
# Prints the middle colour of small patches. The chest, belly and upper arm are the doll's plain skin (DOLL_SKIN in src/N45_doll.js);
# the thigh is the doll's leg between the threads of the net (the brightest third of the patch).
import sys, os, numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/_skin.png'
W, H = 700, 900
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 800, 'height': 1000}); pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    pg.wait_for_timeout(1200); pg.evaluate("T.clean('nodust'); T.j.setDoll(true); T.view(0.3,0.05,3.0,1.35,22,%d,%d)" % (W, H)); pg.locator('#c').screenshot(path=out)
    pg.evaluate("T.view(0.3,0.05,3.0,0.75,22,%d,%d)" % (W, H)); pg.locator('#c').screenshot(path='/tmp/_skin2.png'); b.close()
a = np.asarray(Image.open(out).convert('RGB')).astype(float); a2 = np.asarray(Image.open('/tmp/_skin2.png').convert('RGB')).astype(float)
def mid(img, box, top=None):
    x0, y0, x1, y1 = box; p = img[y0:y1, x0:x1].reshape(-1, 3)
    if top: l = p.mean(1); p = p[l >= np.percentile(l, 100 - top)]
    return np.median(p, 0)
rows = [('painted: forehead', mid(a, (320, 170, 380, 195))), ('painted: lit cheek', mid(a, (300, 225, 318, 245))), ('painted: neck', mid(a, (330, 300, 380, 330))), ('painted: fingers', mid(a, (20, 790, 35, 830))),
        ('doll: chest', mid(a, (300, 420, 400, 480))), ('doll: belly', mid(a, (300, 600, 400, 680))), ('doll: upper arm', mid(a, (140, 450, 170, 520))), ('doll: thigh, between threads', mid(a2, (255, 330, 300, 400), 33))]
print('patch                         |  R    G    B  | R/G   R/B')
for n, c in rows: print('%-29s | %3.0f  %3.0f  %3.0f | %.2f  %.2f' % (n, c[0], c[1], c[2], c[0] / c[1], c[0] / c[2]))
