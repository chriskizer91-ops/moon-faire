import asyncio, sys, json, time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':1280,'height':720})
        pg.on('console', lambda m: None if ('GL Driver' in m.text or 'clearcoat' in m.text) else print('CONSOLE', m.text[:600]))
        pg.on('crash', lambda *a: print('CRASH'))
        pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:900]))
        await pg.goto('file:///home/claude/pilot/game3/out/moon-faire-pilot.html?shot=1&mode=fight')
        for i in range(400):
            await pg.wait_for_timeout(500)
            if await pg.evaluate('!!(window.MF && MF.ready)'): break
        for s in sys.argv[1:]:
            if s=='shot':
                t=time.time()
                try:
                    await pg.screenshot(path='/home/claude/pilot/dbg%d.png'%int(t%1000), timeout=120000); print('shot ok', round(time.time()-t,1))
                except Exception as e: print('shot failed', str(e)[:200])
                continue
            t=time.time(); r = await pg.evaluate(s); print(round(time.time()-t,1),'s', s[:50],'->',json.dumps(r)[:400])
        await b.close()
asyncio.run(main())
