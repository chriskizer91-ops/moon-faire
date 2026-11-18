import sys, time
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
names = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.set_default_timeout(1200000); logs = []
    reqs = []; pg.on('request', lambda r: reqs.append(r.url[:120]) if not r.url.startswith('data:') else None); pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:300])); pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]) if m.type in ('error', 'warning') else None)
    t0 = time.time()
    pg.goto('file:///tmp/single/moon_faire_base_doll_light.html'); pg.wait_for_function('window.DOLLPAGE')
    pg.wait_for_function('/triangles/.test(document.getElementById("hud").textContent)')
    print('first outfit in %.1fs' % (time.time() - t0), pg.inner_text('#hud'))
    allnames = pg.evaluate('[...document.querySelector("#outfits").children].map(b => b.textContent)')
    for c in (names or allnames):
        t1 = time.time()
        pg.evaluate('(i) => document.querySelector("#outfits").children[i].click()', allnames.index(c))
        pg.wait_for_timeout(100); pg.wait_for_function('/triangles/.test(document.getElementById("hud").textContent)'); dt = time.time() - t1
        pg.wait_for_timeout(1500); pg.evaluate('DOLLPAGE.step()')
        info = pg.evaluate('''() => { const R = DOLLPAGE.R, st = DOLLPAGE.stage; const vis = []; R.root.traverse((o) => { if (o.isMesh && o.visible) vis.push(o.name); });
          st.renderer.info.autoReset = true; st.render(); return { drawnTris: st.renderer.info.render.triangles, calls: st.renderer.info.render.calls, vis: vis, heap: Math.round(performance.memory.usedJSHeapSize / 1e6), wm: R.wardrobe.outfit }; }''')
        pg.screenshot(path='/tmp/single_shot_%s.png' % c.replace(' ', '_').replace(',', ''), clip={'x': 0, 'y': 0, 'width': 412, 'height': 915})
        print('%-26s %4.1fs | %s | drawn %s tris, %s calls, heap %sMB | visible: %s' % (c, dt, pg.inner_text('#hud'), info['drawnTris'], info['calls'], info['heap'], info['vis']), flush=True)
    print('requests:', reqs[:10]); print(logs[:10]); b.close()
