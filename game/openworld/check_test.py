import asyncio, os
from playwright.async_api import async_playwright
from check import ARGS, HERE
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        for (w, h, tag) in [(1280, 720, 'lap'), (390, 760, 'phone')]:
            pg = await b.new_page(viewport={'width': w, 'height': h}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
            await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-square-test.html') + '?shot=1')
            await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
            print(tag, 'err:', await pg.evaluate('document.getElementById("err").hidden ? "" : document.getElementById("err").textContent'))
            for k in range(30):
                await pg.evaluate('OWP.step(1/30, 4)')
                if await pg.evaluate('OWP.places.people.filter((p) => p.npc).length') >= 11: break
            await pg.evaluate('() => { const c = OWP.cam; c.yaw = 0.25; c.pitch = 0.42; c.dist = 11; c.lastDrag = 1e9; OWP.step(1/30, 30); }')
            await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 't_%s.png' % tag))
            print(tag, await pg.evaluate('document.getElementById("meter").textContent'))
            if tag == 'lap':
                await pg.evaluate('() => { OWP.cam.yaw = 2.6; OWP.cam.pitch = 0.3; OWP.cam.dist = 7; OWP.step(1/30, 20); }'); await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 't_lap2.png'))
                r = await pg.evaluate('() => { const out = []; for (const w of ["lightest", "trim", "light"]) { OWP.setWeight(w); OWP.step(1/30, 45); out.push(w + ": " + document.getElementById("meter").textContent.split(" · ").slice(2, 4).join(", ")); } return out; }')
                print(r)
                await pg.evaluate('() => { OWP.keys.u = true; OWP.cam.yaw = 0; OWP.step(1/30, 60); OWP.keys.u = false; }'); print('moved to', await pg.evaluate('[OWP.me.x, OWP.me.z]'))
            print(tag, 'errors:', errs[:5]); await pg.close()
        await b.close()
asyncio.run(main())
