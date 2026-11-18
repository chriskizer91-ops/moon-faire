# usage: fshot.py out.png model('fox'|'fox_lod') 'optsJS' step...   each step is JS; a screenshot is taken after each step that starts with "view" or contains "view("
import asyncio, json, sys, io
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    out=sys.argv[1]; model=sys.argv[2]; opts=sys.argv[3]; steps=sys.argv[4:]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':600,'height':800})
        pg.on('console', lambda m: None if ('GL Driver' in m.text or 'clearcoat' in m.text) else print('CONSOLE', m.text[:300]))
        pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:800]))
        await pg.goto('file:///home/claude/iow/shot.html?m='+model)
        r = await pg.evaluate(f'setup({opts})'); parts=r.pop('parts'); print(r); print(' '.join('%s:%d'%(k,v) for k,v in sorted(parts.items(), key=lambda x:-x[1])))
        ims=[]
        for s in steps:
            r = await pg.evaluate(s)
            if r is not None: print(s[:50], r)
            if 'view(' in s:
                await pg.wait_for_timeout(150); ims.append(Image.open(io.BytesIO(await pg.screenshot())))
        if ims:
            W=sum(i.width for i in ims); H=max(i.height for i in ims); m=Image.new('RGB',(W,H)); x=0
            for i in ims: m.paste(i,(x,0)); x+=i.width
            m.save(out)
        await b.close()
asyncio.run(main())
