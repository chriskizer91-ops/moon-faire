# Stills of his hat, belt and hanging things through the walk and the talk (stage 6), stepped on the model's own clock at 60 frames a second.
# usage: python3 tools/gear_walk.py out_prefix
# Writes out_prefix_walk_whole.jpg (twelve moments of one stride, whole figure), _walk_right.jpg and _walk_left.jpg (the same twelve
# moments close on his hips from his right front and his left front), _walk_head.jpg (hat, hair, earring, pearls) and _talk.jpg (four
# moments of talk: whole, right hip, left hip, head). Movement cannot be judged from these; they show where things are at each moment.
import os, sys, math
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); pre = sys.argv[1]
VIEWS = {'whole': (-0.55, 0.05, 7.4, 0.95, 440, 680), 'right': (-0.75, 0.05, 2.5, 0.93, 440, 400), 'left': (0.95, 0.05, 2.5, 0.93, 440, 400), 'head': (0.5, 0.02, 2.2, 1.62, 440, 400)}
def shot(pg, v, label):
    az, el, dist, ty, w, h = VIEWS[v]; pg.evaluate(f'T.view({az},{el},{dist},{ty},16,{w},{h})'); tmp = pre + '.tmp.png'; pg.locator('#c').screenshot(path=tmp); im = Image.open(tmp).convert('RGB').crop((0, 0, w, h)); os.remove(tmp)
    ImageDraw.Draw(im).text((6, 4), label, fill=(255, 255, 0)); return im
def sheet(ims, cols, path):
    w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols; S = Image.new('RGB', (cols * w, rows * h), (20, 20, 20))
    for i, im in enumerate(ims): S.paste(im, ((i % cols) * w, (i // cols) * h))
    S.save(path, quality=88); print('wrote', path, S.size)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1000, 'height': 1000}); pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000); pg.evaluate("T.clean('nodust')")
    pg.evaluate("T.j.play('walk', true); for (let i = 0; i < 120; i++) T.j.animate(1 / 60);")
    out = {k: [] for k in VIEWS}
    for i in range(12):
        pg.evaluate("for (let k = 0; k < Math.round(T.j.strideTime / 12 * 60); k++) T.j.animate(1 / 60);")
        for k in VIEWS: out[k].append(shot(pg, k, 'walk %d/12' % i))
    for k in VIEWS: sheet(out[k], 6, pre + '_walk_' + k + '.jpg')
    pg.evaluate("T.j.play('talk', true);"); talk = []
    for i in range(4):
        pg.evaluate("for (let k = 0; k < 45; k++) T.j.animate(1 / 60);")
        for k in VIEWS: talk.append(shot(pg, k, 'talk %d/4 %s' % (i, k)).resize((440, 680) if k == 'whole' else (440, 400)))
    # talk: four rows of the three close views, and one row of whole figures
    sheet([t for t in talk if t.size == (440, 400)], 3, pre + '_talk_close.jpg'); sheet([t for t in talk if t.size == (440, 680)], 4, pre + '_talk_whole.jpg')
    b.close()
