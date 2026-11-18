# His hat, jewellery and belt beside the paintings they were measured from, at one scale, with a grid in metres of the MODEL's own frame.
# usage: python3 tools/gear_cmp.py out.jpg [set]     set: hat (default), neck, belt
# Each row: a painting (left) and the model from the same side (right). Both are drawn at the same number of pixels to the metre and
# cropped so the same model point is in the middle; grid lines are every 5 cm (labels are heights in metres; sideways labels are metres
# from his middle line, or from the tip of his nose in a profile). Scales and anchors were read off gridded copies of the paintings.
import os, sys, math, subprocess, json
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; which = sys.argv[2] if len(sys.argv) > 2 else 'hat'
# name, painting, px per metre, painting pixel (x, y) of an anchor, the anchor in the model (sideways, height), camera az, flip painting?, middle of the crop (sideways, height), size in metres (w, h)
SETS = {
 'hat': [('front (C5)', 'C5.png', 1225, (285.5, 411), (0.0, 1.660), 0.0, False, (0.0, 1.70), (0.62, 0.52), "T.j.play('stand', true); T.j.pose({})"),
         ('his right side (C5)', 'C5.png', 1230, (1412, 418), (0.096, 1.660), -math.pi / 2, False, (-0.03, 1.70), (0.62, 0.52), "T.j.pose({})"),
         ('his left side (C6)', 'C6.png', 1200, (92, 425), (0.096, 1.660), math.pi / 2, False, (-0.03, 1.70), (0.62, 0.52), "T.j.pose({})"),
         ('from behind (C6)', 'C6.png', 1170, (795, 425), (0.0, 1.660), math.pi, False, (0.0, 1.70), (0.62, 0.52), "T.j.pose({})")],
 # B1 and B2 are registered to the model already (out/registration.json): feet on the bottom row, his middle line on column c
 'belt': [('front (B1)', 'B1.png', 537.64, (469, 976), (0.0, 0.0), 0.0, False, (0.0, 0.84), (0.70, 0.56), "T.j.pose({})"),
          ('from behind (B1)', 'B1.png', 537.64, (1065, 975), (0.0, 0.0), math.pi, False, (0.0, 0.84), (0.70, 0.56), "T.j.pose({})"),
          ('his right side (B2)', 'B2.png', 548.3, (1035.1, 993), (0.0, 0.0), -math.pi / 2, False, (0.0, 0.84), (0.70, 0.56), "T.j.pose({})"),
          ('his left side (B2)', 'B2.png', 548.9, (499.9, 993), (0.0, 0.0), math.pi / 2, False, (0.0, 0.84), (0.70, 0.56), "T.j.pose({})")],
 # A1 and A2 (the full outfit with all of this on) are not registered: their scale is taken from the height of the whole figure, hat and all
 # (1496 px for the model's 1.866 m), so it is good to a few per cent only
 'beltA': [('front (A1, scale approximate)', 'A1.png', 802, (495, 1508), (0.0, 0.0), 0.0, False, (0.0, 0.92), (0.80, 0.50), "T.j.play('stand', true); T.step(20, 0.016)"),
           ('from behind (A2, scale approximate)', 'A2.png', 798, (493, 1501), (0.0, 0.0), math.pi, False, (0.0, 0.92), (0.80, 0.50), "T.j.play('stand', true); T.step(20, 0.016)")],
 'whole': [('front (B1)', 'B1.png', 537.64, (469, 976), (0.0, 0.0), 0.0, False, (0.0, 0.96), (1.30, 2.00), "T.j.pose({})"),
           ('from behind (B1)', 'B1.png', 537.64, (1065, 975), (0.0, 0.0), math.pi, False, (0.0, 0.96), (1.30, 2.00), "T.j.pose({})"),
           ('his right side (B2)', 'B2.png', 548.3, (1035.1, 993), (0.0, 0.0), -math.pi / 2, False, (0.0, 0.96), (1.30, 2.00), "T.j.pose({})"),
           ('his left side (B2)', 'B2.png', 548.9, (499.9, 993), (0.0, 0.0), math.pi / 2, False, (0.0, 0.96), (1.30, 2.00), "T.j.pose({})")],
 'neck': [('front (C5)', 'C5.png', 1225, (285.5, 411), (0.0, 1.660), 0.0, False, (0.0, 1.50), (0.40, 0.34), "T.j.play('stand', true); T.j.pose({})"),
          ('his left side (C6)', 'C6.png', 1200, (92, 425), (0.096, 1.660), math.pi / 2, False, (0.0, 1.50), (0.40, 0.34), "T.j.pose({})")],
}
rows = SETS[which]; PX = {'neck': 1600.0, 'whole': 330.0}.get(which, 1000.0)          # every panel is redrawn at 1000 px to the metre
def grid(im, mid, size, prof):
    d = ImageDraw.Draw(im); w, h = im.size
    for k in range(-20, 60):
        if which == 'whole' and k % 5: continue          # the whole figure is drawn small: a line every 25 cm only
        v = k * 0.05; X = w / 2 + (v - mid[0]) * PX * (1 if not prof else prof)
        if 0 <= X < w: d.line([(X, 0), (X, h)], fill=(0, 255, 0) if k % 2 == 0 else (0, 110, 0)); d.text((X + 2, 2), '%.2f' % v, fill=(255, 255, 0))
        yv = k * 0.05; Y = h / 2 - (yv - mid[1]) * PX
        if 0 <= Y < h: d.line([(0, Y), (w, Y)], fill=(0, 255, 0) if k % 2 == 0 else (0, 110, 0)); d.text((2, Y + 2), '%.2f' % yv, fill=(255, 255, 0))
    return im
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1300, 'height': 1300}); pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    pg.evaluate("T.clean('nodust')"); panels = []
    for (name, pic, ppm, apx, am, az, flip, mid, size, js) in rows:
        w, h = int(size[0] * PX), int(size[1] * PX)
        # the painting: sideways direction on the picture. front: his left is picture right (+x). from behind: his left is picture left. right profile (facing right): forward is +x. left profile (facing left): forward is -x.
        sx = {0.0: 1, math.pi: -1, -math.pi / 2: 1, math.pi / 2: -1}[az]
        im = Image.open(os.path.join(ROOT, 'refs', pic)).convert('RGB')
        cx = apx[0] + sx * (mid[0] - am[0]) * ppm; cy = apx[1] - (mid[1] - am[1]) * ppm
        box = [cx - size[0] * ppm / 2, cy - size[1] * ppm / 2, cx + size[0] * ppm / 2, cy + size[1] * ppm / 2]
        pa = im.crop([int(round(v)) for v in box]).resize((w, h), Image.LANCZOS)
        # the model, from far away through a long lens (nearly flat)
        pg.evaluate(js); dist = 14.0; fov = 2 * math.degrees(math.atan(size[1] / 2 / dist))
        tx = mid[0] if az in (0.0, math.pi) else 0.0; tz = mid[0] if az not in (0.0, math.pi) else 0.0
        pg.evaluate(f'T.view({az},0,{dist},{mid[1]},{fov},{w},{h},{tx},{tz})'); tmp = out + '.tmp.png'; pg.locator('#c').screenshot(path=tmp); mo = Image.open(tmp).convert('RGB').resize((w, h)); os.remove(tmp)
        row = Image.new('RGB', (2 * w + 10, h + 24), (20, 20, 20)); row.paste(grid(pa, mid, size, sx), (0, 24)); row.paste(grid(mo, mid, size, sx), (w + 10, 24)); ImageDraw.Draw(row).text((6, 6), name + '   painting | model   (grid %s, model metres)' % ('25 cm' if which == 'whole' else '5 cm'), fill=(255, 255, 255)); panels.append(row)
    b.close()
side = which == 'whole'
sheet = Image.new('RGB', (sum(r.width for r in panels) if side else panels[0].width, panels[0].height if side else sum(r.height for r in panels)), (20, 20, 20)); y = 0
for r in panels: sheet.paste(r, (y, 0) if side else (0, y)); y += r.width if side else r.height
sheet.save(out, quality=90); print('wrote', out, sheet.size)
