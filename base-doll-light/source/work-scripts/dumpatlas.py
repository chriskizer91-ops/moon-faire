# dumpatlas.py CODE : wear the outfit and save its (cleaned) painting as the page holds it
import sys, base64
from playwright.sync_api import sync_playwright
code = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(); pg.set_default_timeout(900000)
    pg.goto('file:///home/claude/io/test_doll.html?wear=' + code); pg.wait_for_function('window.T && (T.ok || T.err)'); pg.wait_for_timeout(2000)
    url = pg.evaluate("(()=>{ const m = T.j.root.children.find(m => m.material && m.material.userData && m.material.userData.painted); const im = m.material.map.image; return im.toDataURL ? im.toDataURL('image/png') : 'notcanvas'; })()")
    if url.startswith('data:'): open('/home/claude/work/%s_cleaned.png' % code, 'wb').write(base64.b64decode(url.split(',', 1)[1])); print('ok')
    else: print(url)
    b.close()
