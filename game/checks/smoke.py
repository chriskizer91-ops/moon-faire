import asyncio
from playwright.async_api import async_playwright
from t import open_page, shot
async def main():
    async with async_playwright() as p:
        b, pg, errs = await open_page(p, 1366, 768, '?shot=1')
        await pg.evaluate('MF.field.keys.r = true; MF.step(1/30, 30); MF.field.keys.r = false; MF.step(1/30, 5)'); await pg.screenshot(path='s_walk.png')
        await pg.evaluate('MF.setMode("fight", true)'); await pg.wait_for_timeout(500)
        ph = await pg.evaluate('''() => { let n = 0; while (n < 300 && MF.fight.phase !== 'menu') { MF.step(1/30, 5); n += 5; } return MF.fight.phase; }'''); await pg.screenshot(path='s_fight.png')
        await pg.evaluate('MF.setMode("walk", true)'); await pg.wait_for_timeout(500); await pg.evaluate('MF.step(1/30, 10)')
        print(ph, await pg.evaluate('[MF.mode, document.getElementById("meter").textContent, document.getElementById("fightpanel").hidden]'))
        # the page running on its own clock, not stepped by hand
        await b.close(); b, pg, errs2 = await open_page(p, 1366, 768, '')
        await pg.wait_for_timeout(4000); print('live:', await pg.evaluate('[MF.mode, document.getElementById("meter").textContent]'))
        print('errors:', [e for e in errs + errs2 if 'ReadPixels' not in e][:8]); await b.close()
asyncio.run(main())
