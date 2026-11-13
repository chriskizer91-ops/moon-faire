# the single-file page at phone size: loads, no errors, nothing off the side, buttons and a drag work; three stills
# (software rendering is slow: each still takes about half a minute)
import sys
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=1); logs = []
    pg.set_default_timeout(150000)
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:500]))
    pg.goto('file:///home/claude/io/deliver/' + (sys.argv[1] if len(sys.argv) > 1 else 'Io_3D_stage1.html')); pg.wait_for_function('window.IO || !document.getElementById("err").hidden')
    pg.wait_for_timeout(3000)
    print('hud:', pg.inner_text('#hud'), '| err hidden:', pg.evaluate('document.getElementById("err").hidden'), '| scrollW', pg.evaluate('document.documentElement.scrollWidth'), 'clientW', pg.evaluate('document.documentElement.clientWidth'))
    print('buttons:', pg.evaluate('[...document.querySelectorAll(".chip")].map(b => b.textContent)'))
    def still(name):
        pg.wait_for_timeout(2500); pg.evaluate('IO.step()'); pg.screenshot(path='shots/page_%s.png' % name, clip={'x': 0, 'y': 0, 'width': 412, 'height': 915})
    still('0')
    pg.evaluate('document.querySelector("#views").children[4].click()'); still('bodice')
    pg.evaluate('document.querySelector("#views").children[5].click()'); still('skirt')
    az0 = pg.evaluate('IO.stage.orbit.az')
    pg.evaluate('document.querySelector("#skirtB").click(); document.querySelector("#refB").click(); document.querySelector("#poses").children[2].click()')
    print('skirt hidden:', pg.evaluate('!IO.R.meshes.skirt.visible'), '| painting hidden:', pg.evaluate('document.getElementById("ref").hidden'))
    bx = pg.locator('#stage').bounding_box()
    pg.mouse.move(bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] / 2); pg.mouse.down(); pg.mouse.move(bx['x'] + bx['width'] / 2 + 80, bx['y'] + bx['height'] / 2, steps=4); pg.mouse.up()
    pg.wait_for_timeout(1500); print('a drag turned her by', round(pg.evaluate('IO.stage.orbit.az') - az0, 3), 'rad')
    for l in logs[:8]: print('  ', l)
    print('errors:', len(logs))
    b.close()
