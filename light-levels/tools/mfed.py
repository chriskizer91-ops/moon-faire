# usage: mfed.py WxH out.png step...   steps are JS; "shot" takes a picture of the page
import asyncio, sys, io, json, os
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    w,h=[int(x) for x in sys.argv[1].split('x')]; out=sys.argv[2]; steps=sys.argv[3:]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width':w,'height':h}, device_scale_factor=float(os.environ.get('DSF','1')))
        pg.on('console', lambda m: print('CONSOLE', m.type, m.text[:300]) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:900]))
        await pg.goto('file://'+os.environ.get('PAGE','/home/claude/mfmap/out/index.html'))
        await pg.wait_for_timeout(2500)
        ims=[]
        for s in steps:
            if s.startswith('shot'):
                await pg.wait_for_timeout(700); ims.append(Image.open(io.BytesIO(await pg.screenshot(full_page=(s=='shot:page')))))
            elif s.startswith('wait:'): await pg.wait_for_timeout(int(s[5:]))
            else:
                r = await pg.evaluate(s)
                if r is not None: print(s[:60],'->',json.dumps(r)[:900])
        if ims:
            W=max(i.width for i in ims); H=sum(i.height for i in ims); m=Image.new('RGB',(W,H),(20,16,26)); y=0
            for i in ims: m.paste(i,(0,y)); y+=i.height
            m.save(out); print('saved',out,m.size)
        await b.close()
asyncio.run(main())
