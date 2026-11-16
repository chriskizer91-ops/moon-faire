# usage: pilot_shot.py WxH out.png [mode=walk|fight] step...  steps are JS; "shot" takes a picture of the stage; "shot:page" of the whole page
import asyncio, sys, io, json
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    w,h=[int(x) for x in sys.argv[1].split('x')]; out=sys.argv[2]; mode=sys.argv[3]; steps=sys.argv[4:]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':w,'height':h}, device_scale_factor=1)
        pg.on('console', lambda m: None if ('GL Driver' in m.text or 'clearcoat' in m.text) else print('CONSOLE', m.text[:300]))
        pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:900]))
        await pg.goto('file://'+__import__('os').environ.get('PILOT','/home/claude/pilot/game/out/moon-faire-pilot.html')+'?shot=1&mode='+mode)
        for i in range(400):
            await pg.wait_for_timeout(500)
            if await pg.evaluate('!!(window.MF && MF.ready)'): break
        ims=[]
        for s in steps:
            if s.startswith('shot'):
                await pg.wait_for_timeout(200)
                ims.append(Image.open(io.BytesIO(await (pg.screenshot(full_page=True, timeout=180000) if s=='shot:page' else pg.locator('#stagebox').screenshot(timeout=180000)))))
            else:
                r = await pg.evaluate(s)
                if r is not None: print(s[:60],'->',json.dumps(r)[:600])
        if ims:
            W=sum(i.width for i in ims); H=max(i.height for i in ims); m=Image.new('RGB',(W,H),(20,16,26)); x=0
            for i in ims: m.paste(i,(x,0)); x+=i.width
            m.save(out); print('saved',out,m.size)
        await b.close()
asyncio.run(main())
