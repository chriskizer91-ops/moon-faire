# the doll site at phone size: an outfit, walking, in the Flipbook look, turned to her side
import sys
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.set_default_timeout(1200000); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:300]))
    pg.goto('file:///home/claude/io/deliver/doll_site/index.html'); pg.wait_for_function('window.DOLLPAGE')
    pg.wait_for_timeout(2000)
    names = pg.evaluate('[...document.querySelector("#outfits").children].map(b => b.textContent)'); print(len(names), names)
    btns = pg.evaluate('[...document.querySelectorAll("button")].map(b => b.textContent.trim())'); print([x for x in btns if x][:60])
    for c in sys.argv[1:]:
        i = names.index(c); pg.evaluate('(i) => document.querySelector("#outfits").children[i].click()', i)
        pg.wait_for_function('!/dressing|doing/.test(document.getElementById("hud").textContent)'); pg.wait_for_timeout(1500)
        pg.evaluate('''() => { const f = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Flipbook look"); if (f && !f.classList.contains("on") && f.getAttribute("aria-pressed") !== "true") f.click();
          const w = [...document.querySelectorAll("button")].find(b => /^Walk/.test(b.textContent.trim())); if (w) w.click(); }''')
        pg.wait_for_timeout(2500)
        pg.evaluate('() => { const s = DOLLPAGE.stage; s.orbit.az = -1.45; DOLLPAGE.step(); }'); pg.wait_for_timeout(800)
        pg.screenshot(path='/home/claude/io/shots/site_flip_%s.png' % c.replace(' ', '_').replace(',', ''), clip={'x': 0, 'y': 0, 'width': 412, 'height': 915})
        print('done', c, pg.inner_text('#hud'))
    print(logs[:5]); b.close()
