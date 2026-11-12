# usage: shoot.py out_prefix 'JS setup expr' view1 view2 ...   where view = name:az,el,dist,ty,fov[,w,h]
import sys, json
from playwright.sync_api import sync_playwright
out, setup, views = sys.argv[1], sys.argv[2], sys.argv[3:]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920})
    logs = []
    pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:400]) if m.type in ('error',) or 'JLOG' in m.text else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:600]))
    import os; pg.goto('file:///home/claude/fox3d/test.html' + os.environ.get('Q',''))
    pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    err = pg.evaluate('T.err || ""')
    if err: print('BUILD ERROR', err); sys.exit(1)
    print('build ms', pg.evaluate('Math.round(T.buildMs)'), 'tris', pg.evaluate('T.j.triangles'))
    if setup.strip(): 
        r = pg.evaluate(setup)
        if r is not None: print('setup ->', json.dumps(r)[:1500])
    for v in views:
        name, spec = v.split(':'); a = [float(x) for x in spec.split(',')]
        while len(a) < 7: a.append([0,0.05,6.4,0.93,22,700,900][len(a)])
        pre = ''
        tri = pg.evaluate(f'T.view({a[0]},{a[1]},{a[2]},{a[3]},{a[4]},{int(a[5])},{int(a[6])})')
        pg.locator('#c').screenshot(path=f'{out}_{name}.png')
    for l in logs[:25]: print(l)
    b.close()
