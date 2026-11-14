# A row of pictures of him at chosen moments, from one loading of the test page (so a move can be stepped through).
# usage: python3 tools/seq.py out.jpg steps.json [columns]
# steps.json: {"w": 420, "h": 560, "setup": "js", "steps": [{"label": "...", "js": "...", "view": [az, el, dist, ty, fov, tx, tz], "follow": true}]}
# "follow": the camera's target is moved to where he stands (his root), and az is counted from the way he faces.
import sys, os, json, io
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out, spec = sys.argv[1], json.load(open(sys.argv[2])); cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
W, H = spec.get('w', 420), spec.get('h', 560); tiles = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:600]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.evaluate("T.clean('nodust'); 1")
    if spec.get('setup'): pg.evaluate(spec['setup'])
    view = [0.5, 0.05, 6.4, 0.93, 20, 0, 0]
    for st in spec['steps']:
        if st.get('js'): pg.evaluate('(async () => { ' + st['js'] + ' })()')
        if st.get('view'): view = (st['view'] + [0, 0])[:7]
        az, el, dist, ty, fov, tx, tz = view
        if st.get('follow', spec.get('follow')):
            r = pg.evaluate('[T.j.root.position.x, T.j.root.position.z, T.j.root.rotation.y]'); tx, tz, az = tx + r[0], tz + r[1], az + (r[2] if spec.get('faceRel') else 0)
        pg.evaluate(f'T.view({az},{el},{dist},{ty},{fov},{W},{H},{tx},{tz})')
        im = Image.open(io.BytesIO(pg.locator('#c').screenshot())).convert('RGB').resize((W, H))
        ImageDraw.Draw(im).text((6, 4), st.get('label', ''), fill=(255, 240, 150)); tiles.append(im)
    for l in logs[:10]: print(l)
    b.close()
rows = (len(tiles) + cols - 1) // cols; sheet = Image.new('RGB', (cols * W, rows * H), (56, 48, 67))
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * W, (i // cols) * H))
sheet.save(out, quality=88); print(out, sheet.size)
