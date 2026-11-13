import asyncio, json
from playwright.async_api import async_playwright
from t import open_page, shot
JS_UNTIL = '''([want, max]) => { let n = 0; while (n < max && want.indexOf(MF.fight.phase) < 0) { MF.step(1/30, 1); n++; } MF.step(1/30, 1); return [MF.fight.phase, n, MF.J.action, document.querySelector('#fightpanel .log').textContent]; }'''
async def main():
    async with async_playwright() as p:
        b, pg, errs = await open_page(p, q='?shot=1&mode=fight')
        print('start', await pg.evaluate(JS_UNTIL, [['menu', 'over'], 400])); await shot(pg, 'f_menu.png')
        print('moves', await pg.evaluate('[...document.querySelectorAll("#fightpanel .moves button")].map(b => b.textContent + (b.disabled ? " (off)" : ""))'))
        print('choose taunt', await pg.evaluate('MF.fight.choose("j_jab")'))
        for k, n in enumerate([40, 50, 40]):
            await pg.evaluate('(n) => MF.step(1/30, n)', n); await shot(pg, 'f_taunt%d.png' % k)
        print('after taunt', await pg.evaluate(JS_UNTIL, [['menu', 'over'], 900])); await shot(pg, 'f_menu2.png')
        print('shown', await pg.evaluate('JSON.stringify({hp: MF.fight.shown.hp, foes: MF.fight.shown.foes.map(f => f && [f.up, Math.round(f.life), f.fate])})'))
        print('moves', await pg.evaluate('[...document.querySelectorAll("#fightpanel .moves button")].map(b => b.textContent + (b.disabled ? " (off)" : ""))'))
        ok = await pg.evaluate('MF.fight.choose("j_seal")'); print('choose seal', ok, await pg.evaluate('MF.J.action'))
        for k, n in enumerate([60, 60, 60, 60, 60]):
            await pg.evaluate('(n) => MF.step(1/30, n)', n); await shot(pg, 'f_seal%d.png' % k)
        print('end', await pg.evaluate(JS_UNTIL, [['over'], 1200])); await shot(pg, 'f_over.png')
        print('banner', await pg.evaluate('document.querySelector("#fightui .banner").textContent'))
        print('errors:', [e for e in errs if 'ReadPixels' not in e][:8]); await b.close()
asyncio.run(main())
