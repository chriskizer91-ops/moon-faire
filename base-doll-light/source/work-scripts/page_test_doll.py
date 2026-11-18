# the doll page at phone size: loads without errors, nothing off the side; stills of the default view, the feet, the feet in the Flipbook look
import sys
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=1); logs = []
    pg.set_default_timeout(200000)
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:500]))
    pg.goto('file:///home/claude/io/deliver/Doll_3D_v1.html'); pg.wait_for_function('window.DOLLPAGE || !document.getElementById("err").hidden')
    pg.wait_for_timeout(3000)
    print('err hidden:', pg.evaluate('document.getElementById("err").hidden'), '| scrollW', pg.evaluate('document.documentElement.scrollWidth'), '| hud:', pg.inner_text('#hud')[:120])
    def still(name):
        pg.wait_for_timeout(3500); pg.evaluate('DOLLPAGE.step()'); pg.screenshot(path='/home/claude/io/shots/dpage_%s.png' % name, clip={'x': 0, 'y': 0, 'width': 412, 'height': 915})
    still('0')
    pg.evaluate('[...document.querySelector("#views").children].find(b => b.textContent === "Feet").click()'); still('feet')
    pg.evaluate('document.querySelector("#flipB").click()'); still('feetflip')
    pg.evaluate('document.querySelector("#flipB").click(); [...document.querySelector("#moves").children].find(b => b.textContent === "Kneel").click()'); pg.wait_for_timeout(2500); still('kneel')
    print('errors:', logs[:8])
    b.close()
