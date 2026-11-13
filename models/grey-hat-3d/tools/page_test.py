# loads his real page in a headless browser at phone size, presses every button, reports errors and takes pictures
# usage: page_test.py out_prefix [width height]
import sys, os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; W = int(sys.argv[2]) if len(sys.argv) > 2 else 390; H = int(sys.argv[3]) if len(sys.argv) > 3 else 844
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2); errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)[:300])); pg.on('console', lambda m: errs.append('console ' + m.text[:200]) if m.type == 'error' else None)
    pg.goto('file://' + ROOT + '/deliver/Noiz_3D_stage1.html'); pg.wait_for_function('window.NOIZ', timeout=180000); pg.wait_for_timeout(2500)
    print('hud:', pg.inner_text('#hud'), '| page wider than screen:', pg.evaluate('document.documentElement.scrollWidth > window.innerWidth'))
    pg.screenshot(path=out + '_top.png')
    n = pg.locator('button.chip').count(); print('buttons', n)
    for i in range(n):
        bt = pg.locator('button.chip').nth(i); name = bt.inner_text(); bt.click(); pg.wait_for_timeout(350)
        if name == 'Walk': pg.wait_for_timeout(4000); pg.locator('#stage').screenshot(path=out + '_walk.png')
    pg.locator('button.chip', has_text='Three-quarter').click(); pg.locator('button.chip', has_text='Idle').click(); pg.wait_for_timeout(2500)
    pg.screenshot(path=out + '_end.png', full_page=True)
    print('errors:', len(errs)); [print('  ', e) for e in errs[:10]]
    b.close()
