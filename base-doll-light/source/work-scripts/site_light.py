import sys
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.set_default_timeout(1200000); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:300])); pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:200]) if m.type == 'error' else None)
    pg.goto('file:///home/claude/io/deliver/doll_site/index.html'); pg.wait_for_function('window.DOLLPAGE'); pg.wait_for_timeout(1500)
    for c in sys.argv[1:]:
        names = pg.evaluate('[...document.querySelector("#outfits").children].map(b => b.textContent)')
        pg.evaluate('(i) => document.querySelector("#outfits").children[i].click()', names.index(c))
        pg.wait_for_function('!/dressing|doing|loading/.test(document.getElementById("hud").textContent)'); pg.wait_for_timeout(1000)
        if pg.evaluate('document.getElementById("lightB").getAttribute("aria-pressed")') != 'true': pg.click('#lightB')
        pg.wait_for_timeout(500); pg.wait_for_function('!/dressing|doing|loading/.test(document.getElementById("hud").textContent)'); pg.wait_for_timeout(2500)
        pg.evaluate('DOLLPAGE.step()'); pg.screenshot(path='/home/claude/io/shots/site_light_%s.png' % c.replace(' ', '_'), clip={'x': 0, 'y': 0, 'width': 412, 'height': 915})
        print(c, '|', pg.inner_text('#hud'), '|', pg.inner_text('#lightNote'))
    print(logs[:5]); b.close()
