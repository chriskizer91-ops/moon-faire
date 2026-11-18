import sys, time
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.set_default_timeout(1200000)
    pg.goto('file:///home/claude/io/deliver/doll_light_site/index.html'); pg.wait_for_function('/triangles/.test(document.getElementById("hud").textContent)')
    for c in sys.argv[1:]:
        r = pg.evaluate('''async (c) => { const R = DOLLPAGE.R; const sc = (f) => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = f + '.js'; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
          const T = [performance.now()];
          await sc('wardrobe_light/' + c + '_light'); T.push(performance.now());
          await sc('wardrobe/' + c); T.push(performance.now());
          await window.DOLLLIGHT_PREP(R, c); T.push(performance.now());
          const w = R.wardrobe.wear(c, false, { light: true, keep: window.DOLLLIGHT[c].keep || [] }); T.push(performance.now());
          return { lightFile: Math.round(T[1] - T[0]), module: Math.round(T[2] - T[1]), prep: Math.round(T[3] - T[2]), wear: Math.round(T[4] - T[3]) }; }''', c)
        print(c, r, flush=True)
    b.close()
