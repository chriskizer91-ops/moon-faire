import sys, asyncio, json
from playwright.async_api import async_playwright
ARGS=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
async def open_page(p, w=1366, h=768, q='?shot=1'):
    b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    pg = await b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('console', lambda m: errs.append(m.text[:300]) if m.type in ('error','warning') else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:400]))
    await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__), '..', 'out', 'moon-faire-pilot.html')) + '' + q)
    await pg.wait_for_function('window.MF && (window.MF.ready || !document.getElementById("err").hidden)', timeout=240000)
    return b, pg, errs
async def shot(pg, name):
    el = await pg.query_selector('#stagebox'); await el.screenshot(path=name)
if __name__ == '__main__':
    async def main():
        async with async_playwright() as p:
            b, pg, errs = await open_page(p)
            print('err box:', await pg.evaluate('document.getElementById("err").hidden ? "" : document.getElementById("err").textContent'))
            await pg.evaluate('MF.step(1/30, 30)'); await shot(pg, 'walk0.png')
            print(await pg.evaluate('document.getElementById("meter").textContent'))
            print('errors:', errs[:8]); await b.close()
    asyncio.run(main())
