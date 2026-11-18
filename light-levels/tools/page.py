# usage: page.py WxH out.png [--full] step...   each step is JS run in the page; a step starting with "shot:" names a screenshot region ('stage' or 'page')
import asyncio, sys, io, json
from playwright.async_api import async_playwright
from PIL import Image
PAGE=__import__('os').environ.get('PAGE','file:///home/claude/work/out/index.html?shot=1')
async def main():
    size=sys.argv[1]; out=sys.argv[2]; steps=sys.argv[3:]
    w,h=[int(x) for x in size.split('x')]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':w,'height':h}, device_scale_factor=float(__import__('os').environ.get('DSF','1')))
        pg.on('console', lambda m: None if 'GL Driver' in m.text else print('CONSOLE', m.text[:400]))
        pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:900]))
        await pg.goto(PAGE)
        for i in range(600):
            await pg.wait_for_timeout(500)
            ok = await pg.evaluate('!!window.LODPAGE && !LODPAGE.building && Object.keys(LODPAGE.stats).length>=4')
            if ok: break
        ims=[]
        for s in steps:
            if s.startswith('shot:'):
                await pg.wait_for_timeout(200)
                if s=='shot:page': ims.append(Image.open(io.BytesIO(await pg.screenshot(full_page=True))))
                else: ims.append(Image.open(io.BytesIO(await pg.locator('#stagebox').screenshot())))
            elif s.startswith('wait:'):
                for i in range(600):
                    await pg.wait_for_timeout(500)
                    if not await pg.evaluate('LODPAGE.building'): break
            else:
                r = await pg.evaluate(s)
                if r is not None: print(s[:70], '->', json.dumps(r)[:1500])
        if ims:
            W=sum(i.width for i in ims); H=max(i.height for i in ims)
            m=Image.new('RGB',(W,H),(20,16,26)); x=0
            for i in ims: m.paste(i,(x,0)); x+=i.width
            m.save(out); print('saved',out,m.size)
        await b.close()
asyncio.run(main())
