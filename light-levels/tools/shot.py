# usage: shot.py out.png 'optsJSON' 'js steps' ...   steps: list of "label|js" each producing a screenshot; joined into a montage
import asyncio, json, sys, io
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    out=sys.argv[1]; opts=sys.argv[2]; steps=sys.argv[3:]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':600,'height':800})
        pg.on('console', lambda m: print('CONSOLE', m.text[:300]))
        pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:800]))
        await pg.goto('file:///home/claude/work/shot.html')
        r = await pg.evaluate(f'setup({opts})'); print(r)
        ims=[]
        for s in steps:
            r = await pg.evaluate(s); print(s[:60], r)
            await pg.wait_for_timeout(150)
            ims.append(Image.open(io.BytesIO(await pg.screenshot())))
        W=sum(i.width for i in ims); H=max(i.height for i in ims)
        m=Image.new('RGB',(W,H)); x=0
        for i in ims: m.paste(i,(x,0)); x+=i.width
        m.save(out)
        await b.close()
asyncio.run(main())
