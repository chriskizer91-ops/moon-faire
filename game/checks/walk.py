import asyncio, json
from playwright.async_api import async_playwright
from t import open_page, shot
async def main():
    async with async_playwright() as p:
        b, pg, errs = await open_page(p)
        spots = {'well': (3.9, 0.95, 0.0), 'post': (-3.75, 6.2, 0.6), 'laneL': (-11.2, 1.2, -1.2), 'laneR': (12.4, 1.9, 1.2), 'cloth': (0.0, -3.4, 0.0)}
        for n, (x, z, f) in spots.items():
            await pg.evaluate('([x,z,f]) => { const m = MF.field.me; m.x = x; m.z = z; m.face = f; m.vx = m.vz = 0; m.goal = null; MF.step(1/30, 45); }', [x, z, f]); await shot(pg, 'w_%s.png' % n)
        # walk with the keys: right along the lane to the exit, running
        r = await pg.evaluate('''() => { const m = MF.field.me; m.x = 6; m.z = 0.6; MF.field.keys.r = true; MF.field.keys.run = true; MF.step(1/30, 200); MF.field.keys.r = false; MF.field.keys.run = false; return [m.x, m.z, document.getElementById('toast').textContent, document.getElementById('toast').hidden]; }''')
        print('run right ->', r); await shot(pg, 'w_exitR.png')
        r = await pg.evaluate('''() => { const m = MF.field.me; m.x = -6; m.z = 0.6; MF.field.keys.l = true; MF.step(1/30, 420); MF.field.keys.l = false; return [m.x, m.z, document.getElementById('toast').textContent]; }''')
        print('walk left ->', r)
        # click to walk: from the middle to a point past the well; she must go round it or stop
        r = await pg.evaluate('''() => { const m = MF.field.me; m.x = 0; m.z = 3; m.vx = m.vz = 0; MF.step(1/30, 20); const s = MF.stage, c = document.getElementById('stage'); const p = s.toScreen(new THREE.Vector3(7.5, 0, 2.6)); MF.field.pointer(p[0], p[1]); MF.step(1/30, 400); return [m.x, m.z, m.goal]; }''')
        print('click past the well ->', r)
        # walk mid-stride still, the prompt at the well, a bow on the cloth
        r = await pg.evaluate('''() => { const m = MF.field.me; m.x = 2.2; m.z = 3.2; MF.step(1/30, 10); const pr = document.getElementById('prompt'); return [pr.hidden, pr.textContent]; }''')
        print('prompt at well ->', r)
        await pg.evaluate('''() => { const m = MF.field.me; m.x = -4; m.z = 2; m.face = 1.57; MF.field.keys.r = true; MF.step(1/30, 38); }'''); await shot(pg, 'w_walking.png')
        await pg.evaluate('''() => { MF.field.keys.r = false; const m = MF.field.me; m.x = 0; m.z = -3.4; m.vx = m.vz = 0; m.face = 0; MF.step(1/30, 20); MF.field.act(); MF.step(1/30, 40); }'''); await shot(pg, 'w_bow.png')
        print('errors:', [e for e in errs if 'ReadPixels' not in e][:8]); await b.close()
asyncio.run(main())
