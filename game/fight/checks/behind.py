# behind.py: the "Behind the party" camera. Stills of the group at rest, of the swing round a move at three moments (as it starts, just
# before it lands, after it has landed), and of the bow at the end.   python3 behind.py [place] [foes] [how many moves to look at] [width] [height]
import asyncio, sys, json
from playwright.async_api import async_playwright
from t import open_fight, shot, STATE, UNTIL
PLAY = '''() => { const f = MF_FIGHT.debug.fight; let n = 0; while (n < 6000 && f.phase !== 'over' && !(f.act && f.act.kind && f.act.stage === 'play')) { MF_FIGHT.debug.step(1/15, 1, true); n++; } const a = f.act; if (!a || !a.kind) return null;
  const tHit = a.kind === 'hero' ? (a.hitsAt && a.hitsAt.length ? a.hitsAt[0] : a.P.a.dur(a.anim) * 0.5) : a.hitAt; return [(a.P ? a.P.id : a.f.e.name) + ' ' + a.anim, tHit]; }'''
FWD = '''(t) => { MF_FIGHT.debug.step(1/15, Math.max(1, Math.round(t * 15)), true); MF_FIGHT.debug.step(1/60, 1); }'''
async def main():
    a = sys.argv[1:] + [None] * 5; place = a[0] or 'F1'; foes = a[1] or 'K2w'; many = int(a[2] or 4); w = int(a[3] or 1366); h = int(a[4] or 768)
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': place, 'foes': foes, 'seed': 977, 'auto': 'attentive', 'camera': 'behind'}, w=w, h=h); tag = 'behind_%s_%s_%d' % (place, foes, w)
        await pg.evaluate(UNTIL, [['menu', 'over'], 900]); await pg.evaluate(FWD, 0.2); await shot(pg, tag + '_group.png')
        for k in range(many):
            r = await pg.evaluate(PLAY)
            if not r: break
            name = r[0].replace(' ', '_'); await pg.evaluate(FWD, 0.25); await shot(pg, '%s_%d_%s_a.png' % (tag, k, name))
            await pg.evaluate(FWD, max(0.1, r[1] - 0.55)); await shot(pg, '%s_%d_%s_b.png' % (tag, k, name)); await pg.evaluate(FWD, 1.1); await shot(pg, '%s_%d_%s_c.png' % (tag, k, name)); print(k, r)
            await pg.evaluate(UNTIL, [['menu', 'wait', 'over'], 4000, 1 / 15])
        if many < 0: pass
        if many > 0:
            await pg.evaluate('MF_FIGHT.debug.fight.setAuto("expert")'); await pg.evaluate(UNTIL, [['over'], 60000, 1 / 10]); await pg.evaluate(FWD, 1.6); await shot(pg, tag + '_bow.png')
        print(json.dumps(await pg.evaluate(STATE))[:200]); print('errors:', errs[:8]); await b.close()
asyncio.run(main())
