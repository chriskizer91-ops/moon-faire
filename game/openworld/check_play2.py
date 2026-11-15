import asyncio, os
from playwright.async_api import async_playwright
from check import ARGS, HERE
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + '?shot=1')
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=300000)
        print('err:', await pg.evaluate('document.getElementById("err").hidden ? "" : document.getElementById("err").textContent'))
        key = "(t, c) => window.dispatchEvent(new KeyboardEvent(t, { code: c, bubbles: true }))"
        r = await pg.evaluate('''async () => { const K = %s, m = OWP.me; OWP.placeAt(-60, 99, 1.57); OWP.cam.yaw = -1.57; OWP.step(1/30, 10); let a = m.x; K('keydown', 'KeyW'); OWP.step(1/30, 90); const walk = (m.x - a) / 3; K('keyup', 'KeyW');
          K('keydown', 'KeyW'); K('keyup', 'KeyW'); K('keydown', 'KeyW'); OWP.step(1/30, 30); a = m.x; OWP.step(1/30, 90); const run = (m.x - a) / 3; K('keyup', 'KeyW'); OWP.step(1/30, 20); return [walk.toFixed(2), run.toFixed(2), document.getElementById('place').textContent]; }''' % key)
        print('walk m/s, run m/s (double tap), place:', r)
        r = await pg.evaluate('''() => { OWP.enc.test = true; OWP.enc.left = 2; OWP.keys.u = true; OWP.step(1/30, 60); OWP.keys.u = false; const a = [OWP.paused, !document.getElementById('card').hidden, OWP.enc.n, document.getElementById('cardimg').src.length > 1000]; OWP.encDone(); OWP.enc.test = false; return a.concat([OWP.paused]); }''')
        print('encounter [paused, card shown, count, picture, paused after]:', r)
        r = await pg.evaluate('''() => { OWP.placeAt(-230.2, 99.5, 3.14); OWP.step(1/30, 5); const safe = OWP.enc.wild; OWP.toggleView(); OWP.step(1/30, 60); return [safe, OWP.cam.d.toFixed(1), document.getElementById('viewsw').textContent]; }''')
        print('in the square [wild?, camera distance after View, button]:', r)
        for name, x, z, face, yaw, pitch, dist in [('f_fair', -230.2, 99.5, 3.14, 0.0, 0.30, 6.0), ('f_stones', 158, 40, 3.14, 0.0, 0.35, 8), ('f_moor', 0, 102, 1.57, -1.57, 0.25, 6)]:
            await pg.evaluate('([x,z,face,yaw,pitch,dist]) => { if (!OWP.flip.on) OWP.toggleFlip(); OWP.placeAt(x, z, face); const c = OWP.cam; c.yaw = yaw; c.pitch = pitch; c.dist = dist; c.d = dist; c.lastDrag = 1e9; for (let i = 0; i < 40 && OWP.terrain.ready(OWP.me, 120) < 1; i++) OWP.step(1/30, 3); OWP.step(1/30, 4); }', [x, z, face, yaw, pitch, dist])
            await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', '%s.png' % name))
        print(await pg.evaluate('document.getElementById("meter").textContent')); print('errors:', errs[:6]); await b.close()
asyncio.run(main())
