import asyncio, json, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page()
        pg.on('console', lambda m: None if 'GL Driver' in m.text else print('CONSOLE', m.text[:300]))
        pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:800]))
        await pg.goto('file:///home/claude/foxw/'+sys.argv[1])
        r = await pg.evaluate(sys.argv[2])
        print(json.dumps(r))
        await b.close()
asyncio.run(main())
