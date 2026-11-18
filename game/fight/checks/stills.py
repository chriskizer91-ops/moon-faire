# stills.py: pictures of one kind of move at chosen moments, with what the guard did.   python3 stills.py "jester g_seal" 1 0.3,1.5,3.0 [tag] [on|off]
import asyncio, sys
from playwright.async_api import async_playwright
from t import open_fight, shot
FIND = '''([want, nth]) => { const f = MF_FIGHT.debug.fight; let n = 0, seen = 0, last = '';
  while (n < 40000 && f.phase !== 'over') { MF_FIGHT.debug.step(1/30, 1, true); n++; const a = f.act && f.act.kind ? f.act : null, key = a ? (a.kind === 'hero' ? a.P.id : a.f.e.name.replace(/ [AB]$/, '')) + ' ' + a.anim + (a.stage === 'play' ? '' : ' (walking)') : f.phase;
    if (key !== last) { last = key; if (key === want && ++seen === nth) return true; } } return false; }'''
TO = '''(t) => { const f = MF_FIGHT.debug.fight, G = f.guard, a = f.act; let n = 0; while (f.act === a && a.stage === 'play' && a.t < t && n++ < 2000) MF_FIGHT.debug.step(1/30, 1, true); MF_FIGHT.debug.step(1/240, 1);
  const nm = (o) => o.K ? o.e.name : o.id, A = f.audit(), fr = MF_FIGHT.debug.stage.free; return (f.act === a ? a.stage + ' t' + a.t.toFixed(2) : 'over') + ' cam[' + [fr.pos.x, fr.pos.y, fr.pos.z].map(v => v.toFixed(1)) + '] fov' + fr.fov.toFixed(0) + ' move[' + [G.a, G.b, G.c, G.up].map(v => v.toFixed(1)) + '] ahead ' + G.ahead.toFixed(1) + ' req:' + G.req.map(nm).join(',') + ' out:' + [...G.hide].map(nm).join(',') + ' | ' + A.map(x => x.who.slice(0, 9) + (x.inv ? '*' : '') + (x.cut ? ' CUT' : '') + ' ' + x.in.toFixed(2) + (x.near ? 'n' : '')).join('; '); }'''
async def main():
    want = sys.argv[1]; nth = int(sys.argv[2]); times = [float(x) for x in sys.argv[3].split(',')]; tag = sys.argv[4] if len(sys.argv) > 4 else want.replace(' ', '_'); on = (sys.argv[5] if len(sys.argv) > 5 else 'on') == 'on'
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': 'F3', 'foes': 'B2K2w', 'seed': 4242, 'auto': 'attentive', 'camera': 'auto'})
        await pg.evaluate('(on) => { MF_FIGHT.debug.fight.guard.on = on; }', on)
        if not await pg.evaluate(FIND, [want, nth]): print('not found'); return
        for t in times:
            print(await pg.evaluate(TO, t)); await shot(pg, '%s_%s_%04.1f.png' % (tag, 'on' if on else 'off', t))
        print(errs[:4]); await b.close()
asyncio.run(main())
