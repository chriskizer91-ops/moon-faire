# check.py: open the page in the test browser (software WebGL), step it by hand and take stills.
# usage: python3 check.py [name x z face yaw pitch dist] ...   (no arguments: a default set of views)
import sys, asyncio, json, os, time
from playwright.async_api import async_playwright
ARGS = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
HERE = os.path.dirname(os.path.abspath(__file__))
async def main(views, w=1280, h=720, q=os.environ.get('Q', '?shot=1')):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        pg = await b.new_page(viewport={'width': w, 'height': h})
        errs = []
        pg.on('console', lambda m: errs.append(m.type + ' ' + m.text[:400]) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:600]))
        t0 = time.time()
        await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + q)
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
        print('ready in', round(time.time() - t0, 1), 's', 'err:', await pg.evaluate('document.getElementById("err").hidden ? "" : document.getElementById("err").textContent'))
        print('worker:', await pg.evaluate('OWP.terrain.usingWorker'), 'made', await pg.evaluate('OWP.terrain.made'))
        for v in views:
            name, x, z, face, yaw, pitch, dist = v[:7]; extra = v[7] if len(v) > 7 else ''
            await pg.evaluate('([x,z,face,yaw,pitch,dist]) => { OWP.placeAt(x, z, face); const c = OWP.cam; c.yaw = yaw; c.pitch = pitch; c.dist = dist; c.d = dist; c.lastDrag = 1e9; }', [x, z, face, yaw, pitch, dist])
            if extra: await pg.evaluate(extra)
            await pg.evaluate('for (const P of OWP.places.list) P.mesh.material.uniforms.uDebug.value = %s' % os.environ.get('DBG', '0'))
            for k in range(40):
                await pg.evaluate('OWP.step(1/30, 3)')
                if await pg.evaluate('OWP.terrain.ready(OWP.me, 120) >= 1'): break
            await pg.evaluate('OWP.step(1/30, 2)')
            await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 'v_%s.png' % name))
            print(name, await pg.evaluate('document.getElementById("meter").textContent'), '|', await pg.evaluate('document.getElementById("place").textContent'))
        print('errors:', [e for e in errs if 'ReadPixels' not in e and 'GPU stall' not in e][:12]); await b.close()
if __name__ == '__main__':
    V = [('fair', -230.2, 98.9, 3.14, 0.0, 0.32, 6.5), ('fair_back', -228, 90, 0.0, 3.14, 0.32, 7.0), ('moor', 0, 102, 1.57, -1.57, 0.25, 6), ('stones', 158, 40, 3.14, 0.0, 0.35, 8)]
    if len(sys.argv) > 1: V = [json.loads(a) for a in sys.argv[1:]]
    asyncio.run(main(V))
