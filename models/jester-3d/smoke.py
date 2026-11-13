# Opens a built single file as a phone would and lets it run on its own clock, pressing a few buttons. Prints any errors.
import sys
from playwright.sync_api import sync_playwright
path = sys.argv[1]; clicks = sys.argv[2:]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 390, 'height': 800}, device_scale_factor=1, has_touch=True); logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:400]) if m.type in ('error', 'warning') and 'GPU stall' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:600]))
    pg.goto('file://' + path); pg.wait_for_function('window.JESTER', timeout=240000); pg.wait_for_timeout(2500)
    for c in clicks:
        pg.evaluate("(t) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t); if (!b) throw new Error('no button ' + t); b.click(); }", c); pg.wait_for_timeout(3500)
        print(c, '->', pg.evaluate("JESTER.J.action + ' | ' + document.getElementById('hud').textContent + ' | ' + (document.getElementById('fightNote') || {}).textContent"))
    print('errors:', len(logs)); [print('  ', l) for l in list(dict.fromkeys(logs))[:15]]
    b.close()
