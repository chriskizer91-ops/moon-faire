# the doll site at phone size: loads, no errors; pick each outfit given on the command line; a still of each
import sys
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
codes = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=1); logs = []
    pg.set_default_timeout(300000)
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:500]))
    pg.goto('file:///home/claude/io/deliver/doll_site/index.html'); pg.wait_for_function('window.DOLLPAGE || !document.getElementById("err").hidden')
    pg.wait_for_timeout(2500)
    print('err hidden:', pg.evaluate('document.getElementById("err").hidden'), '| scrollW', pg.evaluate('document.documentElement.scrollWidth'), '| hud:', pg.inner_text('#hud'))
    print('outfit chips:', pg.evaluate('[...document.querySelector("#outfits").children].map(b => b.textContent)'), '| hair chips:', pg.evaluate('[...document.querySelector("#hairs").children].map(b => b.textContent)'))
    for c in codes:
        pg.evaluate('(c) => [...document.querySelector("#outfits").children].find(b => b.textContent === c || DOLLPAGE && false) ', c)
        names = pg.evaluate('[...document.querySelector("#outfits").children].map(b => b.textContent)')
        idx = int(c) if c.isdigit() else 0
        pg.evaluate('(i) => document.querySelector("#outfits").children[i].click()', idx)
        pg.wait_for_function('!/dressing|doing/.test(document.getElementById("hud").textContent)', timeout=300000); pg.wait_for_timeout(2500)
        pg.evaluate('DOLLPAGE.step()'); pg.screenshot(path='/home/claude/io/shots/site_%s.png' % c, clip={'x': 0, 'y': 0, 'width': 412, 'height': 915})
        print('picked', names[idx], '| hud:', pg.inner_text('#hud'), '| hair:', pg.evaluate('DOLLPAGE.R.wardrobe.hairStyle'))
    print('console:', logs[:8]); b.close()
