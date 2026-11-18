import sys, json
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
site = sys.argv[1]; codes = sys.argv[2:]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.set_default_timeout(1200000); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:300]))
    pg.goto('file://' + site + '/index.html'); pg.wait_for_function('window.DOLLPAGE'); pg.wait_for_timeout(1000)
    for c in codes:
        r = pg.evaluate('''async (c) => { const R = DOLLPAGE.R; const sc = (f) => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = f; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
          if (!(window.DOLLWEAR_DEFS || {}).hair_bun) await sc('wardrobe/hair_bun.js');
          await sc('wardrobe/' + c + '_tex.js'); await sc('wardrobe/' + c + '.js');
          const t0 = performance.now(); const w = R.wardrobe.wear(c); return { ms: Math.round(performance.now() - t0), build: w.ms, tris: w.tris, heap: Math.round(performance.memory.usedJSHeapSize / 1e6) }; }''', c)
        print(c, r, flush=True)
    print(logs[:5]); b.close()
