# compare.py CODE [OUT] : the full model and the light model of one outfit side by side (front, her right side, back, walking)
import sys, os
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
code = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/work/lightbake/%s_compare.jpg' % code
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
VIEWS = [('front', 0.25, 0.08, 0.85, 3.2, None), ('side', -1.5708, 0.05, 0.85, 3.2, None), ('back', 2.9, 0.08, 0.85, 3.2, None), ('walk', -1.3, 0.06, 0.85, 3.2, ('walk', 1.3)), ('face', 0.35, 0.05, 1.45, 1.1, None)]
rows = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 720, 'height': 920}); pg.set_default_timeout(1800000); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR ' + str(e)[:300]))
    pg.goto('file:///home/claude/io/test_doll.html?wear=' + code); pg.wait_for_function('window.T && (T.ok || T.err)'); pg.wait_for_timeout(1000)
    pg.add_script_tag(path='/home/claude/io/wardrobe_light/%s_light.js' % code); pg.add_script_tag(path='/home/claude/io/wardrobe_light/light_loader.js')
    pg.evaluate('T.clean()')
    for mode in ('full', 'light'):
        info = pg.evaluate('(on) => { const r = DOLLLIGHT_USE(T.j, %r, on); T.stage.render(); return [r, T.stage.renderer.info.render.triangles]; }' % code, mode == 'light')
        pg.wait_for_timeout(1500); row = []
        for name, az, el, ty, fov, mv in VIEWS:
            if mv: pg.evaluate('([m, t]) => { T.time = 0; T.at(m, t); }', list(mv))
            else: pg.evaluate("() => { T.j.play('idle', true); T.j.pose({ arm: 15 }); }")
            tr = pg.evaluate('([az, el, ty, fov]) => T.view(az, el, 34, ty, fov, 420, 700)', [az, el, ty, fov])
            fn = '/tmp/cmp_%s_%s_%s.png' % (code, mode, name); pg.locator('#c').screenshot(path=fn); row.append(Image.open(fn).convert('RGB'))
            if name == 'front': print(mode, 'triangles drawn', tr)
        rows[mode] = row
    print('\n'.join(logs[:5])); b.close()
W, H = rows['full'][0].size; sheet = Image.new('RGB', (W * len(VIEWS), H * 2 + 40), (28, 24, 34)); d = ImageDraw.Draw(sheet)
for r, mode in enumerate(('full', 'light')):
    for c, im in enumerate(rows[mode]): sheet.paste(im, (c * W, 20 + r * (H + 20)))
    d.text((8, 4 + r * (H + 20)), mode.upper(), fill=(240, 220, 160))
sheet.save(out, quality=88); print('wrote', out)
