import asyncio, json, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for det in [float(x) for x in sys.argv[1:]]:
            pg = await b.new_page()
            pg.on('console', lambda m: print('CONSOLE', m.text[:300]))
            pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:500]))
            await pg.goto('file:///home/claude/work/prof.html')
            r = await pg.evaluate(f'run({det},1)')
            acts = r.pop('actions')
            print(json.dumps(r, indent=None)[:6000])
            print('ACTIONS', acts)
            await pg.close()
        await b.close()
asyncio.run(main())
