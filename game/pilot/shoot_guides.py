# Renders the grey-box guides to out/. Needs Playwright and a Chrome; run from game/pilot.
import asyncio, base64, json, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME', '/usr/bin/google-chrome'), args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 900})
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + HERE + '/guide.html')
        await pg.wait_for_function('window.MF_DONE === true', timeout=120000)
        names = await pg.evaluate('Object.keys(window.MF_SHOTS)')
        info = {}
        for n in names:
            data = await pg.evaluate('(n) => window.MF_SHOTS[n].canvas.toDataURL("image/png")', n)
            open(os.path.join(HERE, 'out', n + '.png'), 'wb').write(base64.b64decode(data.split(',')[1]))
            info[n] = await pg.evaluate('(n) => window.MF_SHOTS[n].info', n)
        json.dump(info, open(os.path.join(HERE, 'out', 'guides.json'), 'w'), indent=1)
        print(json.dumps(info)[:900]); print('errors:', errs)
        await b.close()
asyncio.run(main())
