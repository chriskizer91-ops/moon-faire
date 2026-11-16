# trace.py: one kind of move, moment by moment: what the guard did and who the picture's edge cuts.   python3 trace.py "Great Wraith sweep" [nth]
import asyncio, sys
from playwright.async_api import async_playwright
from t import open_fight
RUN = '''([want, nth]) => { const f = MF_FIGHT.debug.fight, G = f.guard, rows = []; let n = 0, seen = 0, last = '', on = false;
  const nm = (o) => o.K ? o.e.name : o.id;
  while (n < 40000 && f.phase !== 'over') { MF_FIGHT.debug.step(1/30, 1, true); n++; const a = f.act && f.act.kind ? f.act : null, key = a ? (a.kind === 'hero' ? a.P.id : a.f.e.name.replace(/ [AB]$/, '')) + ' ' + a.anim : f.phase;
    if (key !== last) { if (on) break; last = key; if (key === want && ++seen === nth) on = true; }
    if (on && n % 3 === 0) { const A = f.audit(), fr = MF_FIGHT.debug.stage.free; rows.push((a ? a.stage + ' t' + a.t.toFixed(2) : '') + ' ' + (A[0] ? A[0].shot : '-') + ' cam[' + [fr.pos.x, fr.pos.y, fr.pos.z].map(v => v.toFixed(1)) + '] fov' + fr.fov.toFixed(0) + ' move[' + [G.a, G.b, G.c, G.up].map(v => v.toFixed(1)) + '] ahead ' + G.ahead.toFixed(1) + ' req:' + G.req.map(nm).join(',') + ' out:' + [...G.hide].map(nm).join(',') + ' | ' + A.map(x => x.who.slice(0, 9) + (x.inv ? '*' : '') + (x.cut ? ' CUT' : '') + ' ' + x.in.toFixed(2) + (x.near ? 'n' : '')).join('; ')); } }
  return rows; }'''
async def main():
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': 'F3', 'foes': 'B2K2w', 'seed': 4242, 'auto': 'attentive', 'camera': 'auto'})
        for r in await pg.evaluate(RUN, [sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 1]): print(r[:420])
        print(errs[:5]); await b.close()
asyncio.run(main())
