# Stills of the real page, stepped by hand so a move can be seen at a chosen moment (the headless browser is far too slow to watch it run).
# usage: shoot_page.py out_prefix WIDTHxHEIGHT [query] step ...      (PAGE=out/game/test_local.html for the game moves page)
#   step:  name=JS            run JS, then take a still called out_prefix_name.png   (JS can use P = window.JESTER; P.step(n, dt) advances the page)
#          =JS                run JS without a still
import sys, os
from playwright.sync_api import sync_playwright
out, size = sys.argv[1], sys.argv[2]; rest = sys.argv[3:]
q = ''
if rest and rest[0].startswith('?'): q = rest.pop(0)
w, h = [int(x) for x in size.split('x')]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=w < 600)
    logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:500]) if m.type in ('error', 'warning') and 'GPU stall' not in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:800]))
    pg.goto('file:///home/claude/work/' + os.environ.get('PAGE', 'out/site/test_local.html') + (q or '?shot=1') + ('&' if q else '&') + 'shot=1' + os.environ.get('HASH', '#lite'))
    try: pg.wait_for_function('window.JESTER', timeout=180000)
    except Exception as e:
        print('NO PAGE', e); [print(l) for l in logs[:20]]; sys.exit(1)
    pg.evaluate('window.P = window.JESTER; P.step(2, 1/30)')
    for st in rest:
        name, js = st.split('=', 1)
        r = pg.evaluate(js) if js.strip() else None
        if r is not None: print(name or '-', '->', str(r)[:300])
        if name:
            if name.startswith('full:'): pg.screenshot(path=f'{out}_{name[5:]}.png', full_page=True)
            else: pg.locator('#stagebox').screenshot(path=f'{out}_{name}.png')
    for l in list(dict.fromkeys(logs))[:25]: print(l)
    b.close()
