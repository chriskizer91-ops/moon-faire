import asyncio, json, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for lid in sys.argv[1:]:
            pg = await b.new_page()
            pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:800]))
            await pg.goto('file:///home/claude/work/nan.html')
            print(json.dumps(await pg.evaluate(f'run("{lid}")')))
            await pg.close()
        await b.close()
asyncio.run(main())
