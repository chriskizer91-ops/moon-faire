import asyncio, json
from playwright.async_api import async_playwright
from t import open_page, shot
RUN = '''([style, count, max]) => { document.getElementById('count').value = String(count); MF.fight.setAuto(style); MF.fight.begin(count); let n = 0, acts = {}; while (n < max && MF.fight.phase !== 'over') { MF.step(1/30, 6); n += 6; const a = MF.J.action; if (a) acts[a] = 1; }
  const B = MF.fight.battle; MF.step(1/30, 2); return { style, count, over: B.over, heroTurns: B.heroTurns, foeTurns: B.foeTurns, curtain: B.curtain, seconds: Math.round(n / 30), hp: Math.round(MF.fight.shown.hp), moves: Object.keys(acts).join(' '), wispsLeft: MF.fight.wisps.filter(w => w.m.root.visible).length }; }'''
async def main():
    async with async_playwright() as p:
        b, pg, errs = await open_page(p, q='?shot=1&mode=fight')
        for count, style in ((1, 'careless'), (1, 'attentive'), (1, 'expert'), (3, 'attentive')):
            r = await pg.evaluate(RUN, [style, count, 3600]); print(json.dumps(r), flush=True)
        # stills of a three-wisp fight played by the attentive engine
        await pg.evaluate('''() => { MF.fight.setAuto('attentive'); MF.fight.begin(3); }''')
        for k in range(8):
            await pg.evaluate('MF.step(1/30, 110)'); await shot(pg, 'a3_%d.png' % k)
        print('errors:', [e for e in errs if 'ReadPixels' not in e][:8]); await b.close()
asyncio.run(main())
