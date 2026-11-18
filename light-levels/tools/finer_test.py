# finer_test.py: opens a witch's own page before and after finer_look.py and takes the same pictures of both.
# usage: python3 finer_test.py <old.html> <new.html> <out prefix> [hash]
# Pictures: look off; look on as the page opens it; (new page) Pixel size at chunky, at fine, and Colours at half.
import asyncio, sys, io
from playwright.async_api import async_playwright
from PIL import Image, ImageChops, ImageStat
async def run(p, path, new, hash_):
    b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg = await b.new_page(viewport={'width': 412, 'height': 915}); pg.set_default_timeout(240000); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' else None)
    await pg.goto('file://' + path + hash_); await pg.wait_for_selector('canvas'); await pg.wait_for_timeout(9000)
    await pg.evaluate('window.scrollTo(0,0)'); bx = await pg.locator('canvas').first.bounding_box(); clip = {'x': bx['x'], 'y': bx['y'], 'width': bx['width'], 'height': bx['height']}; shots = {}
    async def shot(k): await pg.wait_for_timeout(5000); await pg.evaluate('window.scrollTo(0,0)'); shots[k] = Image.open(io.BytesIO(await pg.screenshot(clip=clip))).convert('RGB')
    await shot('off')
    await pg.get_by_role('button', name='Flipbook look', exact=True).click(); await shot('on')
    info = await pg.evaluate("(() => { const f = document.getElementById('flipset'); return f ? { shown: getComputedStyle(f).display, pix: document.getElementById('pixout').textContent, snap: document.getElementById('snapout').textContent } : null; })()")
    if new:
        setv = "(a) => { const e = document.getElementById(a[0]); e.value = a[1]; e.dispatchEvent(new Event('input')); return document.getElementById('pixout').textContent + ' / ' + document.getElementById('snapout').textContent; }"
        print('  chunky:', await pg.evaluate(setv, ['pix', 0])); await shot('chunky')
        print('  fine:', await pg.evaluate(setv, ['pix', 100])); await shot('fine')
        await pg.evaluate(setv, ['pix', 77]); print('  half colours:', await pg.evaluate(setv, ['snap', 50])); await shot('half')
        await pg.get_by_role('button', name='Flipbook look', exact=True).click()
        print('  sliders after turning the look off:', await pg.evaluate("getComputedStyle(document.getElementById('flipset')).display")); await shot('off2')
    await b.close(); return shots, info, errs
async def main():
    old, new, pre = sys.argv[1:4]; hash_ = sys.argv[4] if len(sys.argv) > 4 else ''
    async with async_playwright() as p:
        so, io_, eo = await run(p, old, False, hash_); print('old page: sliders', io_, 'errors', eo)
        sn, in_, en = await run(p, new, True, hash_); print('new page: sliders', in_, 'errors', en)
    def diff(a, b): d = ImageChops.difference(a, b); st = ImageStat.Stat(d); return round(sum(st.mean) / 3, 3), max(e[1] for e in d.getextrema())
    print('look off, old against new (mean, worst of 255):', diff(so['off'], sn['off']))
    print('old look on against new at chunky:', diff(so['on'], sn['chunky']))
    print('new: off at the start against off at the end:', diff(sn['off'], sn['off2']))
    def row(ims):
        W = sum(i.width for i in ims); m = Image.new('RGB', (W, max(i.height for i in ims))); x = 0
        for i in ims: m.paste(i, (x, 0)); x += i.width
        return m
    row([so['off'], sn['off'], so['on'], sn['chunky']]).save(pre + '_same.png'); row([sn['on'], sn['fine'], sn['half']]).save(pre + '_new.png')
asyncio.run(main())
