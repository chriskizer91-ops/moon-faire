# loads the single-file page at phone and laptop size, presses its buttons, reports errors, saves stills
import sys
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    for tag, vp, dpr in [('phone', {'width': 412, 'height': 915}, 1), ('laptop', {'width': 1280, 'height': 860}, 1)]:
        pg = b.new_page(viewport=vp, device_scale_factor=dpr); pg.set_default_timeout(240000); logs = []
        def snap(path):                                 # a clipped page screenshot: an element screenshot waits for the picture to hold still, which software rendering never does in time
            bb = pg.locator('#box').bounding_box(); pg.screenshot(path=path, clip={'x': bb['x'], 'y': max(0, bb['y']), 'width': bb['width'], 'height': min(bb['height'], vp['height'] - max(0, bb['y']))})
        pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:500]))
        pg.goto('file:///home/claude/ranger/deliver/Ranger_3D_stage2b.html'); pg.wait_for_function('window.RANGER || !document.getElementById("err").hidden', timeout=120000)
        pg.wait_for_timeout(2500)
        print(tag, 'hud:', pg.inner_text('#hud'), '| err hidden:', pg.evaluate('document.getElementById("err").hidden'), '| scrollW', pg.evaluate('document.documentElement.scrollWidth'), 'clientW', pg.evaluate('document.documentElement.clientWidth'))
        def settle(n=40):
            pg.evaluate('new Promise(r => { let i = 0; const f = () => { if (++i > %d) r(1); else requestAnimationFrame(f); }; f(); })' % n)
        pg.screenshot(path='shots/page_%s_0.png' % tag)
        for name in ['Face', 'Profile', 'Back of head', 'From above']:
            pg.click('#hviews >> text="%s"' % name); settle(); pg.wait_for_timeout(1500); settle(8); snap('shots/page_%s_%s.png' % (tag, name.replace(' ', '_')))
        pg.click('#glassB'); pg.click('#hviews >> text="Three-quarter"'); settle(); pg.wait_for_timeout(1500); settle(8); snap('shots/page_%s_noglasses.png' % tag)
        pg.click('#glassB'); pg.click('#poses >> text="Arms out"'); pg.click('#views >> text="Front"'); settle(); pg.wait_for_timeout(1500); settle(8); snap('shots/page_%s_body.png' % tag)
        pg.click('#sleeveB'); pg.click('#refB'); pg.click('#views >> text="Boots"'); settle(12)
        print('  buttons pressed without error; head chips', pg.evaluate('document.querySelectorAll("#hviews .chip").length'), 'body chips', pg.evaluate('document.querySelectorAll("#views .chip").length'))
        # a drag turns her
        pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(400); az0 = pg.evaluate('RANGER.stage.orbit.az'); bx = pg.locator('#stage').bounding_box()
        pg.mouse.move(bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] / 2); pg.mouse.down(); pg.mouse.move(bx['x'] + bx['width'] / 2 + 80, bx['y'] + bx['height'] / 2, steps=5); pg.mouse.up()
        print('  drag turned her by', round(pg.evaluate('RANGER.stage.orbit.az') - az0, 3), 'rad')
        for l in logs[:8]: print('  ', l)
        pg.close()
    b.close()
