# views.py: the things auto.py and moves.py do not look at: the phone layout, the two cameras that really move, the Flipbook look,
# fainted witches, and playing by tapping the buttons.   python3 views.py
import asyncio, json
from playwright.async_api import async_playwright
from t import open_fight, shot, STATE, UNTIL
MID = '''() => { const f = MF_FIGHT.debug.fight; let n = 0; while (n < 3000 && f.act && f.act.stage === 'in') { MF_FIGHT.debug.step(1/15, 1, true); n++; } const a = f.act; if (!a) return null;
  const t = a.kind === 'hero' ? (a.hitsAt && a.hitsAt.length ? a.hitsAt[0] - 0.4 : a.P.a.dur(a.anim) * 0.5) : a.hitAt - 0.1; MF_FIGHT.debug.step(1/15, Math.max(1, Math.round(t * 15)), true); MF_FIGHT.debug.step(1/15, 1); return a.kind + ' ' + a.anim; }'''
async def main():
    async with async_playwright() as p:
        # 1. a phone, held upright: two witches already fainted; play by tapping
        b, pg, errs = await open_fight(p, {'place': 'F4', 'foes': 'K2w', 'seed': 5, 'party': {'ranger': {'hp': 0}, 'io': {'hp': 0}}}, w=390, h=844)
        if __import__('sys').argv[1:] == ['ui']: pass
        await pg.evaluate(UNTIL, [['menu', 'over'], 900]); await pg.evaluate('MF_FIGHT.debug.step(1/15, 60, true); MF_FIGHT.debug.step(1/15, 1)'); await shot(pg, 'view_phone_menu.png')
        print('phone:', json.dumps(await pg.evaluate(STATE))[:260])
        btn = await pg.query_selector('.mff .moves .tile:not(.off)'); print('tapping', await btn.text_content()); await btn.click(); await pg.evaluate('MF_FIGHT.debug.step(1/30, 1)'); await shot(pg, 'view_phone_picked.png'); print('help:', await pg.evaluate('document.querySelector(".mff .help").textContent'), '| cast bar:', await pg.evaluate('document.querySelector(".mff .cast").textContent')); await pg.click('.mff .cast'); print('after Cast:', (await pg.evaluate(STATE))['act'])
        bars = await pg.query_selector_all('.mff .foebar:not([hidden])'); print('foe bars shown:', len(bars)); print('errors:', errs[:6]); await b.close()
        # 2. the cameras that move, and the Flipbook look
        for cam in ['shoulder', 'low']:
            b, pg, errs = await open_fight(p, {'place': 'F2', 'foes': 'K2w', 'seed': 977, 'auto': 'attentive', 'camera': cam})
            for k in range(3):
                await pg.evaluate(UNTIL, [['act', 'over'], 900]); what = await pg.evaluate(MID)
                if what: await shot(pg, 'view_%s_%d.png' % (cam, k)); print(cam, k, what)
                await pg.evaluate(UNTIL, [['menu', 'wait', 'over'], 3000, 1 / 15])
            if cam == 'low':
                await pg.evaluate('MF_FIGHT.settings.flipbook = true; MF_FIGHT.settings.camera = "near"'); await pg.evaluate(UNTIL, [['act', 'over'], 900]); await pg.evaluate(MID); await shot(pg, 'view_flipbook.png')
            print('errors:', errs[:6]); await b.close()
asyncio.run(main())
