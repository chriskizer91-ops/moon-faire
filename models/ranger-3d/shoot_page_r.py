# loads the single-file page at phone and laptop size, presses its buttons, reports errors, saves stills
import sys
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    for tag, vp, dpr in [('phone', {'width': 412, 'height': 915}, 2), ('laptop', {'width': 1280, 'height': 860}, 1)]:
        pg = b.new_page(viewport=vp, device_scale_factor=dpr); logs = []
        pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:500]))
        pg.goto('file:///home/claude/ranger/deliver/Ranger_3D_stage1.html'); pg.wait_for_function('window.RANGER || !document.getElementById("err").hidden', timeout=120000)
        pg.wait_for_timeout(2500)
        print(tag, 'hud:', pg.inner_text('#hud'), '| err hidden:', pg.evaluate('document.getElementById("err").hidden'), '| scrollW', pg.evaluate('document.documentElement.scrollWidth'), 'clientW', pg.evaluate('document.documentElement.clientWidth'))
        def settle(n=40):
            pg.evaluate('new Promise(r => { let i = 0; const f = () => { if (++i > %d) r(1); else requestAnimationFrame(f); }; f(); })' % n)
        pg.screenshot(path='shots/page_%s_0.png' % tag)
        for name in ['Front', 'Back', 'Corset', 'Boots']:
            pg.click('#views >> text="%s"' % name); settle(); pg.wait_for_timeout(1500); settle(8); pg.locator('#box').screenshot(path='shots/page_%s_%s.png' % (tag, name))
        pg.click('#poses >> text="Arms out"'); pg.click('#views >> text="Three-quarter"'); settle(); pg.wait_for_timeout(1500); settle(8); pg.locator('#box').screenshot(path='shots/page_%s_armsout.png' % tag)
        pg.click('#sleeveB'); pg.click('#refB'); settle(6); pg.locator('#box').screenshot(path='shots/page_%s_nosleeve.png' % tag)
        # a drag turns her
        az0 = pg.evaluate('RANGER.stage.orbit.az'); bx = pg.locator('#stage').bounding_box()
        pg.mouse.move(bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] / 2); pg.mouse.down(); pg.mouse.move(bx['x'] + bx['width'] / 2 + 80, bx['y'] + bx['height'] / 2, steps=5); pg.mouse.up()
        print('  drag turned her by', round(pg.evaluate('RANGER.stage.orbit.az') - az0, 3), 'rad')
        for l in logs[:8]: print('  ', l)
        pg.close()
    b.close()
