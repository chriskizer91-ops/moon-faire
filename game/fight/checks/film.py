# film.py: pictures of the whole of a fight for people to look through: every move at three moments (winding up, as it lands, just after)
# and every turn's menu. Each picture has a line under it saying what it is; cut.json lists who the fight's own audit says the edge cuts.
#   MF_SHOTS=dir python3 film.py [part] [of] [foes] [place] [width] [height]       (run "of" copies side by side, parts 0..of-1)
import asyncio, sys, json, os
from playwright.async_api import async_playwright
from t import open_fight, shot, SHOTS
NEXT = '''() => { const f = MF_FIGHT.debug.fight; let n = 0; const st = () => f.phase === 'over' ? 'over' : f.act && f.act.kind && f.act.stage === 'play' ? 'play' : f.phase === 'menu' ? 'menu' : 'other', s0 = st(), a0 = f.act;
  while (n++ < 6000) { MF_FIGHT.debug.step(1/30, 1, true); const s = st(); if (s === 'over') return { what: 'over' }; if (s === 'play' && (s0 !== 'play' || f.act !== a0)) { const a = f.act, hero = a.kind === 'hero', hit = hero ? ((a.tags ? a.P.a.hits(a.mv)[0] : a.hitsAt[0]) || a.P.a.dur(a.anim) * 0.6) : a.hitAt; return { what: 'play', name: (hero ? a.P.id : a.f.e.name) + ' ' + a.anim, hit, dur: hero ? a.P.a.dur(a.anim) : a.dur }; }
    if (s === 'menu' && s0 !== 'menu') return { what: 'menu', name: f.current + ' turn' }; } return { what: 'over' }; }'''
TO = '''(t) => { const f = MF_FIGHT.debug.fight, a = f.act; let n = 0; if (t != null) while (f.act === a && a.stage === 'play' && a.t < t && n++ < 3000) MF_FIGHT.debug.step(1/30, 1, true); else MF_FIGHT.debug.step(1/30, 14, true); MF_FIGHT.debug.step(1/240, 1); MF_FIGHT.debug.step(1/240, 1);
  return { ok: t == null || (f.act === a && a.stage === 'play'), t: f.act && f.act.kind ? f.act.t : 0, cut: f.audit().filter(x => x.cut).map(x => x.who + (x.inv ? '*' : '') + (x.must ? '!' : '')) }; }'''
async def main():
    a = sys.argv[1:] + [None] * 6; part = int(a[0] or 0); of = int(a[1] or 1); foes = a[2] or 'B2K2w'; place = a[3] or 'F3'; w = int(a[4] or 1366); h = int(a[5] or 768); log = {}
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': place, 'foes': foes, 'seed': 4242, 'auto': 'attentive', 'camera': 'auto'}, w=w, h=h); k = 0
        while True:
            e = await pg.evaluate(NEXT)
            if e['what'] == 'over': break
            k += 1
            if k % of != part: continue
            for tag, t in ([('turn', None)] if e['what'] == 'menu' else [('1 winding up', e['hit'] * 0.45), ('2 as it lands', e['hit'] + 0.12), ('3 just after', min(e['dur'] - 0.1, e['hit'] + 0.9))]):
                r = await pg.evaluate(TO, t)
                if not r['ok']: break
                name = '%03d %s - %s' % (k, e['name'], tag); await shot(pg, name + '.png'); log[name] = r['cut']
        json.dump(log, open(os.path.join(SHOTS, 'cut_%d.json' % part), 'w'), indent=0); print('part', part, 'pictures', len(log), 'errors', errs[:3]); await b.close()
asyncio.run(main())
