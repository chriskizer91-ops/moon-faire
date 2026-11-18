from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
CASES = [('Woodland fae', 'Back'), ('Masquerade', 'Face'), ('Bard', 'Face, turned')]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    for site in ('doll_site', 'doll_light_site'):
        pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.set_default_timeout(1200000)
        pg.goto('file:///home/claude/io/deliver/%s/index.html' % site); pg.wait_for_function('window.DOLLPAGE'); pg.wait_for_timeout(1500)
        if site == 'doll_light_site': pg.wait_for_function('/triangles/.test(document.getElementById("hud").textContent)')
        names = pg.evaluate('[...document.querySelector("#outfits").children].map(b => b.textContent)')
        views = pg.evaluate('[...document.querySelector("#views").children].map(b => b.textContent)')
        for c, v in CASES:
            pg.evaluate('(i) => document.querySelector("#outfits").children[i].click()', names.index(c)); pg.wait_for_timeout(300)
            pg.wait_for_function('/triangles/.test(document.getElementById("hud").textContent) && !/loading|dressing/.test(document.getElementById("hud").textContent)')
            if site == 'doll_site' and pg.evaluate('document.getElementById("lightB").getAttribute("aria-pressed")') != 'true':
                pg.click('#lightB'); pg.wait_for_timeout(300); pg.wait_for_function('/Light ·/.test(document.getElementById("hud").textContent)')
            pg.evaluate('(i) => document.querySelector("#views").children[i].click()', views.index(v))
            # the moves chip 'Stand still' so both stand the same
            pg.evaluate('document.querySelector("#moves").children[0].click()')
            pg.wait_for_timeout(4000); pg.evaluate('window.scrollTo(0,0)'); pg.evaluate('DOLLPAGE.step()')
            pg.locator('#stage').screenshot(path='/tmp/kv_%s_%s.png' % (site, c.replace(' ', '_')))
            print(site, c, pg.inner_text('#hud'), flush=True)
        pg.close()
    b.close()
