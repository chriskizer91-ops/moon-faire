import asyncio, os
from playwright.async_api import async_playwright
from check import ARGS, HERE
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + '?shot=1')
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=300000)
        key = "(t, c) => window.dispatchEvent(new KeyboardEvent(t, { code: c, bubbles: true }))"
        r = await pg.evaluate('''async () => { const K = %s, c = OWP.cam, f = () => (c.d / c.dist).toFixed(2); OWP.enc.on = false; OWP.placeAt(-60, 99, 1.57); c.yaw = -1.57; OWP.step(1/30, 90); const still = f();
          K('keydown', 'KeyW'); OWP.step(1/30, 120); const walk = f(); K('keyup', 'KeyW');
          K('keydown', 'KeyW'); K('keyup', 'KeyW'); K('keydown', 'KeyW'); OWP.step(1/30, 120); const run = f(); K('keyup', 'KeyW');
          OWP.step(1/30, 30); const s1 = f(); OWP.step(1/30, 30); const s2 = f(); OWP.step(1/30, 60); const s4 = f(); return { dist: c.dist, still, walk, run, stopped1s: s1, stopped2s: s2, stopped4s: s4 }; }''' % key)
        print('camera distance as a multiple of the standing distance:', r); print('errors:', errs[:4]); await b.close()
asyncio.run(main())
