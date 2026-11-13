# usage: flip_shots.py out_prefix    stills of the real page with the Flipbook look on and off: close, at fight distance, and in her spells. Also saves a smooth still cropped to her for far.py.
import sys
from playwright.sync_api import sync_playwright
out = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 520, 'height': 900}, device_scale_factor=1); logs = []
    pg.on('pageerror', lambda e: logs.append(str(e)[:300]))
    pg.goto('file:///home/claude/fox3d/out/site/test_local.html#lite'); pg.wait_for_function('window.FOX', timeout=180000); pg.wait_for_timeout(2500)
    cv = pg.locator('canvas').first
    def shot(n): pg.wait_for_timeout(900); cv.screenshot(path=f'{out}_{n}.png')
    def step(mv, secs): pg.evaluate(f"(() => {{ FOX.J.stop(); FOX.setMove('{mv}'); }})()"); pg.wait_for_timeout(int(secs * 1000))
    for look in ('smooth', 'flipbook'):
        pg.evaluate(f"FOX.stage.look = '{look}'"); pg.evaluate("FOX.J.stop()"); shot(look + '_stand')
        for mv, secs in (('talk', 3.0), ('hemline_fangs', 5.0), ('blue_mischief', 9.0), ('borrowed_face', 8.0)): step(mv, secs); cv.screenshot(path=f'{out}_{look}_{mv}.png')
    print('times', pg.evaluate("FOX.J.action"), 'errors', logs[:3]); b.close()
