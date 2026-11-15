# hits.py: can a blow be seen landing? Stills at the moment a move lands and a third of a second after, for a witch's ranged move, a walk-up
# move, and a foe's strike, with the director camera; plus the bars after some damage.   python3 hits.py [width] [height]
import asyncio, sys, json
from playwright.async_api import async_playwright
from t import open_fight, shot, STATE, UNTIL
PLAY = '''() => { const f = MF_FIGHT.debug.fight; let n = 0; while (n < 9000 && f.phase !== 'over' && !(f.act && f.act.kind && f.act.stage === 'play')) { MF_FIGHT.debug.step(1/30, 1, true); n++; } const a = f.act; if (!a || !a.kind) return null; return (a.P ? a.P.id : a.f.e.name) + ' ' + a.anim; }'''
LAND = '''() => { const f = MF_FIGHT.debug.fight, a = f.act; let n = 0; const hp = () => f.battle && f.party && Object.values(f.party).filter(P => P.e).map(P => Math.round(P.shown.hp)).join() + '|' + f.foes.map(x => Math.round(x.shown.life)).join(); const h0 = hp();
  while (n < 900 && f.act === a && hp() === h0) { MF_FIGHT.debug.step(1/30, 1, true); n++; } MF_FIGHT.debug.step(1/120, 1); return n; }'''
async def main():
    w = int(sys.argv[1]) if len(sys.argv) > 1 else 1366; h = int(sys.argv[2]) if len(sys.argv) > 2 else 768
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': 'F1', 'foes': '2K2w', 'seed': 31, 'auto': 'attentive', 'camera': 'auto'}, w=w, h=h); seen = 0
        for k in range(14):
            what = await pg.evaluate(PLAY)
            if not what: break
            n = await pg.evaluate(LAND); name = what.replace(' ', '_'); await shot(pg, 'hit_%d_%02d_%s_0.png' % (w, k, name)); await pg.evaluate('MF_FIGHT.debug.step(1/30, 9, true); MF_FIGHT.debug.step(1/120, 1)'); await shot(pg, 'hit_%d_%02d_%s_1.png' % (w, k, name)); print(k, what, n)
            await pg.evaluate(UNTIL, [['menu', 'wait', 'over'], 6000, 1 / 15])
        print('errors:', errs[:8]); await b.close()
asyncio.run(main())
