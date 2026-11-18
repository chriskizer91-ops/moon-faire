# check_play.py: walk with the keys, bump into things, talk to someone, the map, the Flipbook look, a phone-sized window
import asyncio, os, json
from playwright.async_api import async_playwright
from check import ARGS, HERE
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        for (w, h, tag) in [(1280, 720, 'lap'), (390, 760, 'phone')]:
            pg = await b.new_page(viewport={'width': w, 'height': h}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
            await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + '?shot=1')
            await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
            if tag == 'lap':
                # walk north with W from the start in the fair square, for 4 seconds
                r = await pg.evaluate('() => { const m = OWP.me, a = [m.x, m.z]; OWP.keys.u = true; OWP.step(1/30, 120); OWP.keys.u = false; OWP.step(1/30, 10); return [a, [m.x, m.z], document.getElementById("place").textContent]; }')
                print('walk north 4 s:', r)
                # run east along the lane toward the stall row: 10 s
                r = await pg.evaluate('() => { const m = OWP.me; OWP.placeAt(-218, 97.3, 1.57); OWP.cam.yaw = -1.57; OWP.keys.u = true; OWP.step(1/30, 300); OWP.keys.u = false; return [m.x, m.z, document.getElementById("place").textContent]; }')
                print('run east 10 s:', r)
                # walk into the well: she must stop
                r = await pg.evaluate('() => { const m = OWP.me; OWP.placeAt(-228 + 3.9, 96.5 + 6, 3.14); OWP.cam.yaw = 0; OWP.keys.u = true; OWP.step(1/30, 120); OWP.keys.u = false; return [m.x, m.z, Math.hypot(m.x - (-228 + 3.9), m.z - (96.5 + 2.6))]; }')
                print('into the well (distance from its middle, should stay above 1.2):', r)
                # talk to the lamp-seller
                r = await pg.evaluate('() => { const P = OWP.places.people.find((q) => q.id === "old-lamp-seller"); OWP.placeAt(P.x + 1.2, P.z, -1.57); OWP.step(1/30, 20); const pr = document.getElementById("prompt"); const before = [pr.hidden, pr.textContent]; OWP.act(); OWP.step(1/30, 30); return [before, document.getElementById("sayname").textContent, document.getElementById("sayline").textContent, !!P.npc]; }')
                print('talk:', r)
                await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 'p_talk.png'))
                await pg.evaluate('() => { OWP.act(); OWP.act(); OWP.act(); OWP.act(); }')
                # the Flipbook look in the fair and on the moor
                await pg.evaluate('() => { document.getElementById("flipsw").click(); OWP.placeAt(-230.2, 98.9, 3.14); OWP.cam.yaw = 0; OWP.step(1/30, 20); }')
                await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 'p_flip_fair.png'))
                await pg.evaluate('() => { OWP.placeAt(158, 40, 3.14); OWP.cam.yaw = 0; OWP.cam.dist = 8; OWP.cam.pitch = 0.35; for (let i = 0; i < 40 && OWP.terrain.ready(OWP.me, 120) < 1; i++) OWP.step(1/30, 3); OWP.step(1/30, 5); }')
                await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 'p_flip_stones.png'))
                await pg.evaluate('() => { document.getElementById("flipsw").click(); document.getElementById("mapbtn").click(); }')
                await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 'p_map.png'))
            else:
                await pg.evaluate('() => { OWP.step(1/30, 10); }')
                await pg.screenshot(path=os.path.join(HERE, 'look', 'p_phone.png'))
            print(tag, 'errors:', errs[:5]); await pg.close()
        await b.close()
asyncio.run(main())
