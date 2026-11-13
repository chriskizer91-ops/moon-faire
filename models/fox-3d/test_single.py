# usage: test_single.py [hash]    opens the single offline file at phone size with the network cut off, plays every move button once, reports errors
import sys
from playwright.sync_api import sync_playwright
h = sys.argv[1] if len(sys.argv) > 1 else 'lite'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    logs = []; blocked = []
    pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') or r.request.url.startswith('data:') or r.request.url.startswith('blob:') else (blocked.append(r.request.url[:80]), r.abort()))
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:600]))
    pg.goto('file:///home/claude/fox3d/deliver/Fox_Witch_3D.html#' + h)
    pg.wait_for_function('window.FOX', timeout=180000); pg.wait_for_timeout(2500)
    print('triangles', pg.evaluate('FOX.J.triangles'), 'head', pg.evaluate('FOX.J.bones ? 1 : 0'))
    rows = pg.evaluate("[...document.querySelectorAll('section')].map((s) => s.querySelector('.label').textContent + ': ' + [...s.querySelectorAll('button')].map((b) => b.textContent).join(', '))")
    for r in rows: print(' ', r)
    for i, (mv, wait) in enumerate([('talk', 2.2), ('laugh', 1.2), ('dance', 2.0), ('curtsey', 1.4), ('pounce', 1.9), ('bow', 1.5), ('twirl', 1.5), ('shears_out', 1.5), ('hemline_fangs', 1.5), ('blue_mischief', 1.5), ('borrowed_face', 2.5), ('same_cloth', 3.4), ('slip_stitch', 3.1), ('crazy_quilt', 2.0)]):
        pg.evaluate(f"FOX.setMove('{mv}')"); pg.wait_for_timeout(int(wait * 1000))
        pg.screenshot(path=f'/home/claude/fox3d/shots/single_{h}_{i}.png')
        print(mv, 'action now:', pg.evaluate('FOX.J.action'), 'pressed:', pg.evaluate("[...document.querySelectorAll('button[aria-pressed=true]')].map((b) => b.textContent).join('|')"))
        pg.evaluate('FOX.J.stop()'); pg.wait_for_timeout(300)
    print('blocked requests:', len(blocked), blocked[:3]); print('errors:', logs[:8])
    b.close()
