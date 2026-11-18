# beats.py: (1) the Guardian's stag is in the picture while it stands and as it leaps; (2) a blow's number comes a beat after it lands, and
# two hits on one foe show two numbers and then a total; (3) the laptop layout, with the moves in the corner.   python3 beats.py
import asyncio, json
from playwright.async_api import async_playwright
from t import open_fight, shot, STATE, UNTIL
TURN = '''([who, id]) => { const f = MF_FIGHT.debug.fight, E = MF_ENGINE; for (let n = 0; n < 60; n++) { let k = 0; while (k < 40000 && f.phase !== 'menu' && f.phase !== 'over') { MF_FIGHT.debug.step(1/15, 1, true); k++; } if (f.phase === 'over') return 'over';
  const B = f.battle, h = B.fighters.find(x => x.id === f.current); if (f.current === who && E.heroMoves(B, h).find(m => m.id === id && m.ok)) return 'ready'; const c = E.choose(B, h, 'attentive'); if (!f.choose(c.move, c.target)) f.choose(E.heroMoves(B, h).find(m => m.ok).id); } return 'none'; }'''
WATCH = '''() => { const f = MF_FIGHT.debug.fight, a = f.act, log = []; let n = 0, last = ''; const seen = () => [...document.querySelectorAll('.mff .float')].map(d => d.className.replace('float ', '') + ':' + d.textContent).join(' | ');
  while (n < 400 && f.act === a) { MF_FIGHT.debug.step(1/30, 1, true); n++; const s = seen(), life = f.foes.map(x => Math.round(x.shown.life) + '/' + Math.round(x.seenLife)).join(' '); const line = life + ' :: ' + s; if (line !== last) { log.push((n / 30).toFixed(2) + 's ' + line); last = line; } } return log; }'''
async def main():
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': 'F3', 'foes': 'K2w', 'seed': 31, 'camera': 'auto'}, w=1366, h=768)
        await pg.evaluate('(() => { const f = MF_FIGHT.debug.fight, B = f.battle; B.kd = 0.3; for (const x of f.foes) { x.e.max *= 8; x.e.hp = x.e.max; x.shown.max = x.e.max; x.shown.life = x.seenLife = x.e.hp; } })()')
        print(await pg.evaluate(TURN, ['ranger', 'r_gem'])); await pg.evaluate('MF_FIGHT.debug.step(1/15, 14, true); MF_FIGHT.debug.step(1/120, 1)'); await shot(pg, 'beats_laptop_menu.png')
        await pg.click('.mff .tile[data-id="r_gem"]'); await pg.evaluate('MF_FIGHT.debug.step(1/120, 1)'); await shot(pg, 'beats_laptop_picked.png'); await pg.click('.mff .cast')
        for line in await pg.evaluate(WATCH): print('   ', line[:200])
        print(await pg.evaluate(TURN, ['io', 'i_deity'])); await pg.evaluate('MF_FIGHT.debug.fight.choose("i_deity")')
        await pg.evaluate('(() => { const f = MF_FIGHT.debug.fight; let k = 0; while (k < 60000 && !(f.act && f.act.kind === "hero" && f.act.anim === "guardian" && f.act.stage === "play")) { if (f.phase === "menu") { const B = f.battle, h = B.fighters.find(x => x.id === f.current), c = MF_ENGINE.choose(B, h, "attentive"); if (!f.choose(c.move, c.target)) f.choose(MF_ENGINE.heroMoves(B, h).find(m => m.ok).id); } MF_FIGHT.debug.step(1/15, 1, true); k++; } })()')
        t = 0
        for sec in [8.4, 10.6, 12.2, 13.5]:
            await pg.evaluate('(n) => { MF_FIGHT.debug.step(1/30, n, true); MF_FIGHT.debug.step(1/120, 1); }', int((sec - t) * 30)); t = sec; await shot(pg, 'beats_guardian_%04.1f.png' % sec)
        print('errors:', errs[:6]); await b.close()
asyncio.run(main())
