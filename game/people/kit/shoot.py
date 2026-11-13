# Draws a person on the test stage and saves one sheet of views (front, three-quarter, side, back, walking, and the face twice).
# As a tool: python3 people/kit/shoot.py <person.js> <sheet.jpg>      As a library: Shooter (one browser, many people).
import asyncio, io, json, os, sys
from PIL import Image
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.abspath(os.path.join(HERE, '..', 'out', 'person-stage.html'))
ARGS = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
BODY = ['front', 'threeq', 'side', 'back']; FACE = ['face', 'faceq']
class Shooter:
    async def start(self):
        self.pw = await async_playwright().start()
        self.b = await self.pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        self.errs = []
        self.body = await self._page(300, 560); self.head = await self._page(330, 330)
        return self
    async def _page(self, w, h):
        pg = await self.b.new_page(viewport={'width': w, 'height': h})
        pg.on('pageerror', lambda e: self.errs.append(str(e)[:300]))
        await pg.goto('file://' + PAGE); await pg.wait_for_function('window.PV && PV.ready', timeout=120000); return pg
    async def stop(self): await self.b.close(); await self.pw.stop()
    # code: the text of a person file (it sets PERSON). Returns (facts, sheet picture or None)
    async def shoot(self, code, scale=1.0):
        self.errs.clear()
        try:
            facts = await self.body.evaluate('(c) => PV.show(c)', code)
            await self.head.evaluate('(c) => PV.show(c)', code)
        except Exception as e:
            return {'errors': ['the file did not run: ' + str(e).split('\n')[0][:400]]}, None
        shots = []
        for v in BODY:
            await self.body.evaluate('(v) => { PV.draw(v); }', v); shots.append(Image.open(io.BytesIO(await self.body.screenshot())))
        await self.body.evaluate('() => { PV.step(1/30, 40, true); PV.draw("threeq"); }'); shots.append(Image.open(io.BytesIO(await self.body.screenshot())))
        info = await self.body.evaluate('() => { PV.step(1/30, 20); return PV.draw("front"); }')
        heads = []
        for v in FACE:
            await self.head.evaluate('(v) => { PV.draw(v); }', v); heads.append(Image.open(io.BytesIO(await self.head.screenshot())))
        W = 300 * 5 + 330; sheet = Image.new('RGB', (W, 660), (56, 48, 67))
        for i, s in enumerate(shots): sheet.paste(s, (300 * i, 50))
        for i, s in enumerate(heads): sheet.paste(s, (1500, 330 * i))
        if scale != 1.0: sheet = sheet.resize((round(W * scale), round(660 * scale)), Image.LANCZOS)
        facts['draws'] = info['calls']; facts['drawn_triangles'] = info['triangles']
        if self.errs: facts['errors'] = facts.get('errors', []) + self.errs[:3]
        return facts, sheet
if __name__ == '__main__':
    async def main():
        s = await Shooter().start(); facts, sheet = await s.shoot(open(sys.argv[1], encoding='utf-8').read()); print(json.dumps(facts))
        if sheet: sheet.save(sys.argv[2], quality=88)
        await s.stop()
    asyncio.run(main())
