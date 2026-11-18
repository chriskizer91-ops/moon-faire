# ui.py: the move-picking screen. Stills on a phone held upright and on a laptop: a witch's turn, a move picked (help and Cast bar filled),
# a move that cannot be used, a friend-target move, and playing by taps and by keys.   python3 ui.py
import asyncio, json
from playwright.async_api import async_playwright
from t import open_fight, shot, STATE, UNTIL
TO = '''(who) => { const f = MF_FIGHT.debug.fight, E = MF_ENGINE; let n = 0; while (n < 400) { let k = 0; while (k < 20000 && f.phase !== 'menu' && f.phase !== 'over') { MF_FIGHT.debug.step(1/15, 1, true); k++; } if (f.phase === 'over') return 'over'; if (f.current === who) { MF_FIGHT.debug.step(1/15, 12, true); MF_FIGHT.debug.step(1/60, 1); return who; }
  const B = f.battle, h = B.fighters.find(x => x.id === f.current), c = E.choose(B, h, 'attentive'); if (!f.choose(c.move, c.target)) f.choose(E.heroMoves(B, h).find(m => m.ok).id); n++; } return 'none'; }'''
SEE = '''() => ({ help: document.querySelector('.mff .help').textContent, cast: document.querySelector('.mff .cast').textContent, castOff: document.querySelector('.mff .cast').disabled, tiles: [...document.querySelectorAll('.mff .tile')].map(b => b.textContent + (b.classList.contains('off') ? ' (off)' : '') + (b.classList.contains('on') ? ' (ON)' : '')) })'''
async def main():
    async with async_playwright() as p:
        for (w, h, tag) in [(390, 844, 'phone'), (1366, 768, 'laptop')]:
            b, pg, errs = await open_fight(p, {'place': 'F2', 'foes': 'K2w', 'seed': 21, 'party': {'jester': {'hp': 430}}}, w=w, h=h)
            print(tag, await pg.evaluate(TO, 'fox')); await shot(pg, 'ui_%s_1_turn.png' % tag); print(json.dumps(await pg.evaluate(SEE)))
            await pg.click('.mff .tile[data-id="f_stitch"]'); await pg.evaluate('MF_FIGHT.debug.step(1/60, 1)'); await shot(pg, 'ui_%s_2_picked.png' % tag); print(json.dumps(await pg.evaluate(SEE))[:300])
            bars = await pg.query_selector_all('.mff .foebar:not([hidden])'); await bars[-1].click(); await pg.evaluate('MF_FIGHT.debug.step(1/60, 1)'); print('other foe:', (await pg.evaluate(SEE))['cast'])
            await pg.click('.mff .tile[data-id="f_cloth"]'); await pg.evaluate('MF_FIGHT.debug.step(1/60, 1)'); await shot(pg, 'ui_%s_3_cannot.png' % tag); print('cannot:', (await pg.evaluate(SEE))['help'][:120])
            await pg.click('.mff .tile[data-id="f_stitch"]'); await pg.click('.mff .cast'); print('cast ->', (await pg.evaluate(STATE))['act'])
            print(await pg.evaluate(TO, 'io')); await pg.click('.mff .tile[data-id="i_mend"]'); await pg.evaluate('MF_FIGHT.debug.step(1/60, 1)'); await shot(pg, 'ui_%s_4_friend.png' % tag); print('mend:', (await pg.evaluate(SEE))['cast'])
            await pg.keyboard.press('Escape'); await pg.keyboard.press('2'); await pg.keyboard.press('Tab'); print('keys:', (await pg.evaluate(SEE))['cast']); await pg.keyboard.press('Enter'); print('enter ->', (await pg.evaluate(STATE))['act'])
            print('errors:', errs[:6]); await b.close()
asyncio.run(main())
