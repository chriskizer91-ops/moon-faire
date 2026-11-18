# check_kit.py: like check.py, but for any built page (PAGE=out/....html) and with a prefix for the stills (TAG=...), so the page before
# a change can be measured beside the page after it. usage: PAGE=... TAG=... python3 check_kit.py '["name", x, z, face, yaw, pitch, dist]' ...
import sys, asyncio, json, os, time
from playwright.async_api import async_playwright
from check import ARGS, HERE
PAGE = os.environ.get('PAGE', os.path.join(HERE, 'out', 'moon-faire-open-world.html')); TAG = os.environ.get('TAG', 'k')
async def main(views):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': 1280, 'height': 720}); errs = []
        pg.on('console', lambda m: errs.append(m.type + ' ' + m.text[:300]) if m.type in ('error', 'warning') else None); pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:600]))
        t0 = time.time(); await pg.goto('file://' + os.path.abspath(PAGE) + '?shot=1')
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
        print('ready in', round(time.time() - t0, 1), 's', 'err:', await pg.evaluate('document.getElementById("err").hidden ? "" : document.getElementById("err").textContent'))
        for v in views:
            name, x, z, face, yaw, pitch, dist = v[:7]; extra = v[7] if len(v) > 7 else ''
            await pg.evaluate('([x,z,face,yaw,pitch,dist]) => { OWP.placeAt(x, z, face); const c = OWP.cam; c.yaw = yaw; c.pitch = pitch; c.dist = dist; c.d = dist; c.lastDrag = 1e9; }', [x, z, face, yaw, pitch, dist])
            if extra: await pg.evaluate(extra)
            for k in range(40):
                await pg.evaluate('OWP.step(1/30, 3)')
                if await pg.evaluate('OWP.terrain.ready(OWP.me, 120) >= 1'): break
            await pg.evaluate('OWP.step(1/30, 18)')
            await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', '%s_%s.png' % (TAG, name)))
            print(name, await pg.evaluate('document.getElementById("meter").textContent'))
        print('errors:', [e for e in errs if 'ReadPixels' not in e and 'GPU stall' not in e and 'willReadFrequently' not in e][:12]); await b.close()
asyncio.run(main([json.loads(a) for a in sys.argv[1:]]))
