# smoke.py: a fight starts, everyone stands in the place, a turn can be taken. Writes stills.  python3 smoke.py [place] [foes]
import asyncio, sys, json
from playwright.async_api import async_playwright
from t import open_fight, shot, STATE, UNTIL
async def main():
    place = sys.argv[1] if len(sys.argv) > 1 else 'F1'; foes = sys.argv[2] if len(sys.argv) > 2 else 'K2w'
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': place, 'foes': foes, 'seed': 977})
        print('errors at start:', errs[:6])
        print('steps to menu', await pg.evaluate(UNTIL, [['menu', 'over'], 600])); print(json.dumps(await pg.evaluate(STATE)))
        await shot(pg, 'smoke_%s_%s_menu.png' % (place, foes))
        print('moves', await pg.evaluate('[...document.querySelectorAll(".mff .moves button")].map(b => b.textContent + (b.disabled ? " (off)" : ""))'))
        i = await pg.evaluate('MF_FIGHT.debug.stage.info()'); print('drawn', i)
        print('errors:', errs[:8]); await b.close()
asyncio.run(main())
