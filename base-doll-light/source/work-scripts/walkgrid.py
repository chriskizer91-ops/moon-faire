# walkgrid.py OUT CODES... : one page, every outfit in turn, walking (t 1.3), seen from her right and her left side
import sys, os
from PIL import Image
from playwright.sync_api import sync_playwright
out, codes = sys.argv[1], sys.argv[2:]
T_WALK = float(os.environ.get('TW', '1.3')); MOVE = os.environ.get('MOVE', 'walk')
VIEWS = [(-1.5708, 0.05), (1.5708, 0.05), (2.4, 0.12)]
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
tiles = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 720, 'height': 920}); pg.set_default_timeout(900000); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR ' + str(e)[:300]))
    pg.goto('file:///home/claude/io/test_doll.html?wear=' + codes[0]); pg.wait_for_function('window.T && (T.ok || T.err)')
    pg.evaluate('T.clean()')
    for c in codes:
        r = pg.evaluate('''async (c) => {
          const add = (src) => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ok(); document.head.appendChild(s); });
          if (!(window.DOLLWEAR_DEFS && DOLLWEAR_DEFS[c])) { await add('wardrobe/' + c + '_tex.js'); await add('wardrobe/' + c + '.js'); }
          const w = T.j.wardrobe.wear(c); await new Promise((ok) => setTimeout(ok, 400)); return w; }''', c)
        row = []
        pg.evaluate('([m, t]) => T.at(m, t)', [MOVE, T_WALK])
        for az, el in VIEWS:
            pg.evaluate('([az, el]) => T.view(az, el, 34, 0.85, 3.2, 480, 800)', [az, el])
            pg.wait_for_timeout(300)
            fn = '/tmp/wg_%s_%d.png' % (c, len(row)); pg.locator('#c').screenshot(path=fn); row.append(Image.open(fn).convert('RGB'))
        tiles.append((c, row)); print(c, r and r.get('ms'), flush=True)
    print('\n'.join(logs[:10])); b.close()
W, H = tiles[0][1][0].size; per = len(VIEWS)
cols = 2; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * per * W, rows * H), (30, 26, 36))
for k, (c, row) in enumerate(tiles):
    for j, im in enumerate(row): sheet.paste(im, ((k % cols) * per * W + j * W, (k // cols) * H))
sheet.save(out, quality=85); print('wrote', out, sheet.size)
