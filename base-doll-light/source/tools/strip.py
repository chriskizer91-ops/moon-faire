# usage: tools/strip.py out.jpg move "az,el,dist,ty[,fov]" t1 t2 ...  [--w 420 --h 640] [--pre 'JS'] [--idle 1.0]
# One page, one move: she is stepped to each time in turn at 60 steps a second and a still is taken; the stills are joined in a row.
import sys, io, os
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
args = sys.argv[1:]; opt = {'--w': '420', '--h': '640', '--pre': '', '--idle': '0.8', '--view2': ''}
for k in list(opt):
    if k in args: i = args.index(k); opt[k] = args[i + 1]; del args[i:i + 2]
out, move, view, times = args[0], args[1], [float(x) for x in args[2].split(',')], [float(x) for x in args[3:]]
while len(view) < 5: view.append(22)
W, H = int(opt['--w']), int(opt['--h'])
views = [view] + ([[float(x) for x in opt['--view2'].split(',')]] if opt['--view2'] else [])
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type == 'error' else None); pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:500]))
    pg.goto('file:///home/claude/io/test_io.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.evaluate("T.clean('color'); T.j.pose({arm:15}); T.j.setBlink(false);" + opt['--pre'])
    n0 = round(float(opt['--idle']) * 60)
    pg.evaluate(f"T.j.play('idle'); for (let i = 0; i < {n0}; i++) T.j.animate(0, 0, 0, 1/60); T.j.play('{move}'); T.now = 0;")
    rows = [[] for _ in views]
    for t in times:
        pg.evaluate(f"(() => {{ const n = Math.round(({t} - T.now) * 60); for (let i = 0; i < n; i++) T.j.animate(0, 0, 0, 1/60); T.now = {t}; }})()")
        for vi, v in enumerate(views):
            pg.evaluate(f"T.view({v[0]},{v[1]},{v[2]},{v[3]},{v[4] if len(v) > 4 else 22},{W},{H})")
            im = Image.open(io.BytesIO(pg.locator('#c').screenshot())).convert('RGB'); ImageDraw.Draw(im).text((8, 6), f'{move} {t:.2f}s', fill=(255, 235, 160)); rows[vi].append(im)
    for l in logs[:12]: print(l)
    b.close()
sheet = Image.new('RGB', (W * len(times), H * len(views)), (20, 18, 26))
for vi, r in enumerate(rows):
    for i, im in enumerate(r): sheet.paste(im, (i * W, vi * H))
sheet.save(out, quality=86); print(out, sheet.size)
