# usage: shoot2.py out_prefix 'JS setup' name:'js expr run before the shot' ...   (each js sets the camera itself, e.g. T.hv(...);T.shot(...))
import sys, json, os
from playwright.sync_api import sync_playwright
out, setup, views = sys.argv[1], sys.argv[2], sys.argv[3:]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1000, 'height': 1000})
    logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:400]) if m.type in ('error',) or 'JLOG' in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:600]))
    pg.goto('file:///home/claude/work/test.html' + os.environ.get('Q',''))
    pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    err = pg.evaluate('T.err || ""')
    if err: print('BUILD ERROR', err); sys.exit(1)
    print('build ms', pg.evaluate('Math.round(T.buildMs)'), 'tris', pg.evaluate('T.j.triangles'))
    if setup.strip():
        r = pg.evaluate(setup)
        if r is not None: print('setup ->', json.dumps(r)[:1500])
    for v in views:
        name, js = v.split(':', 1)
        r = pg.evaluate(js)
        pg.locator('#c').screenshot(path=f'{out}_{name}.png')
    for l in logs[:25]: print(l)
    b.close()
