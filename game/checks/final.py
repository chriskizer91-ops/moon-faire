import asyncio, json
from playwright.async_api import async_playwright
from t import open_page, shot
UNTIL = '''([want, max]) => { let n = 0; while (n < max && want.indexOf(MF.fight.phase) < 0) { MF.step(1/30, 5); n += 5; } MF.step(1/30, 1); return MF.fight.phase; }'''
async def main():
    async with async_playwright() as p:
        b, pg, errs = await open_page(p, 1366, 768, '?shot=1&mode=fight')
        await pg.evaluate(UNTIL, [['menu'], 400]); await shot(pg, 'z_fight_wide.png')
        # the check: her in the painting and in her theatre, same window
        await pg.evaluate('MF.sw.close = true; MF.fight.choose("j_jab"); MF.step(1/30, 55)'); await shot(pg, 'z_cast_paint.png')
        await pg.evaluate('MF.stage.painting = false; MF.step(0, 1)'); await shot(pg, 'z_cast_theatre.png'); await pg.evaluate('MF.stage.painting = true')
        await pg.screenshot(path='z_page_fight.png', full_page=True)
        await b.close()
        b, pg, errs2 = await open_page(p, 1366, 768, '?shot=1')
        await pg.evaluate('MF.step(1/30, 40)'); await shot(pg, 'z_walk_paint.png')
        await pg.evaluate('MF.stage.painting = false; MF.step(0, 1)'); await shot(pg, 'z_walk_theatre.png'); await pg.evaluate('MF.stage.painting = true')
        # full detail, to compare with trim at walking size
        await pg.evaluate('''() => { const d = document.getElementById('detail'); d.value = 'full'; d.dispatchEvent(new Event('change')); }'''); await pg.wait_for_timeout(1500)
        await pg.evaluate('MF.step(1/30, 40)'); await shot(pg, 'z_walk_full.png'); print('full:', await pg.evaluate('document.getElementById("meter").textContent'))
        await b.close()
        b, pg, errs3 = await open_page(p, 390, 844, '?shot=1')
        await pg.evaluate('MF.step(1/30, 30)'); await pg.screenshot(path='z_phone_walk.png', full_page=True)
        await pg.evaluate('MF.setMode("fight", true)'); await pg.wait_for_timeout(600); await pg.evaluate(UNTIL, [['menu'], 400]); await pg.screenshot(path='z_phone_fight.png', full_page=True)
        ov = await pg.evaluate("document.documentElement.scrollWidth - window.innerWidth"); print('phone sideways overflow', ov)
        print('errors:', [e for e in errs + errs2 + errs3 if 'ReadPixels' not in e][:8]); await b.close()
asyncio.run(main())
