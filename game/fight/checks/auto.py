# auto.py: the engine's own players take a whole fight through the real page. Prints each move, and writes a still of each kind of move
# the first time it is seen.  python3 auto.py [place] [foes] [style] [gap] [seed] [camera]
import asyncio, sys, json
from playwright.async_api import async_playwright
from t import open_fight, shot, STATE
RUN = '''([max, dt]) => { const f = MF_FIGHT.debug.fight; const key = () => f.phase + '|' + (f.act && f.act.kind ? f.act.kind + ':' + (f.act.P ? f.act.P.id : f.act.f.e.name) + ':' + f.act.anim + ':' + f.act.stage : '');
  const k0 = key(); let n = 0; while (n < max && key() === k0 && f.phase !== 'over') { MF_FIGHT.debug.step(dt, 1, true); n++; } return [key(), n]; }'''
async def main():
    a = sys.argv[1:] + [None] * 6; place = a[0] or 'F1'; foes = a[1] or 'K2w'; style = a[2] or 'attentive'; gap = int(a[3] or 0); seed = int(a[4] or 977); cam = a[5] or 'near'
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': place, 'foes': foes, 'seed': seed, 'auto': style, 'gap': gap, 'camera': cam})
        import os
        if os.environ.get('MF_EASY'): await pg.evaluate('(k) => { MF_FIGHT.debug.fight.battle.kd = k; }', float(os.environ['MF_EASY']))      # for a check only: the foes hit at this share of their strength
        seen = set(); steps = 0; tag = '%s_%s_%s' % (place, foes, cam)
        for i in range(900):
            key, n = await pg.evaluate(RUN, [4000, 1 / 20]); steps += n
            if key.startswith('over'): break
            parts = key.split('|')[1].split(':') if '|' in key and key.split('|')[1] else None
            if parts and parts[3] == 'play':
                st = await pg.evaluate(STATE); print('%5d %-8s %-18s %s | %s | %s' % (steps, parts[1], parts[2], st['log'][:70], ' '.join(st['heroes']), ' '.join(st['foes'])))
                name = parts[1].split(' ')[0] + '_' + parts[2]
                if name not in seen:
                    seen.add(name); d = await pg.evaluate('(() => { const a = MF_FIGHT.debug.fight.act; const m = a.P ? a.P.a : null; const t = a.kind === "hero" ? (a.hitsAt && a.hitsAt.length ? a.hitsAt[0] + 0.25 : (m.dur(a.anim) * 0.6)) : a.hitAt + 0.15; return t; })()')
                    await pg.evaluate('(n) => MF_FIGHT.debug.step(1/20, n, true)', max(1, int(d * 20) - 1)); await pg.evaluate('MF_FIGHT.debug.step(1/20, 1)'); await shot(pg, '%s_%s.png' % (tag, name))
        st = await pg.evaluate(STATE); print('END', json.dumps(st)); await pg.evaluate('MF_FIGHT.debug.step(1/20, 30, true); MF_FIGHT.debug.step(1/20, 1)'); await shot(pg, tag + '_over.png')
        print('banner:', await pg.evaluate('document.querySelector(".mff .banner").textContent'))
        await pg.evaluate('document.querySelector(".mff .banner button").click()'); await pg.wait_for_function('window.RES', timeout=10000); print('result:', json.dumps(await pg.evaluate('window.RES')))
        print('errors:', errs[:10]); await b.close()
asyncio.run(main())
