import asyncio, os
from playwright.async_api import async_playwright
from check import ARGS, HERE
# Measures the automatic zoom, and takes phone-size stills standing, walking and running (look/zoom_*.png).
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': 390, 'height': 760}, device_scale_factor=1, has_touch=True, is_mobile=True); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + '?shot=1')
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=300000)
        key = "(t, c) => window.dispatchEvent(new KeyboardEvent(t, { code: c, bubbles: true }))"
        box = await pg.query_selector('#stagebox'); out = {}
        async def shot(n): await box.screenshot(path=os.path.join(HERE, 'look', 'zoom_%s.png' % n))
        await pg.evaluate('''() => { const c = OWP.cam; OWP.enc.on = false; if (!OWP.flip.on) OWP.toggleFlip(); OWP.placeAt(-60, 99, 1.57); c.yaw = -1.57; for (let i = 0; i < 40 && OWP.terrain.ready(OWP.me, 120) < 1; i++) OWP.step(1/30, 3); OWP.step(1/30, 90); }''')
        out['still'] = await pg.evaluate('(OWP.cam.d / OWP.cam.dist).toFixed(2)'); await shot('still')
        await pg.evaluate('''() => { const K = %s; K('keydown', 'KeyW'); OWP.step(1/30, 150); }''' % key)
        out['walk'] = await pg.evaluate('(OWP.cam.d / OWP.cam.dist).toFixed(2)'); await shot('walk')
        await pg.evaluate('''() => { const K = %s; K('keyup', 'KeyW'); K('keydown', 'KeyW'); K('keyup', 'KeyW'); K('keydown', 'KeyW'); OWP.step(1/30, 150); }''' % key)
        out['run'] = await pg.evaluate('(OWP.cam.d / OWP.cam.dist).toFixed(2)'); await shot('run')
        out['after'] = await pg.evaluate('''() => { const K = %s, c = OWP.cam, f = () => (c.d / c.dist).toFixed(2); K('keyup', 'KeyW'); const a = []; for (let i = 0; i < 4; i++) { OWP.step(1/30, 30); a.push(f()); } return a; }''' % key)
        print('camera distance as a multiple of the standing distance:', out, 'standing distance', await pg.evaluate('OWP.cam.dist')); print('errors:', errs[:4]); await b.close()
asyncio.run(main())
