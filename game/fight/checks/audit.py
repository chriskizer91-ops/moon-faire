# audit.py: is anyone cut by the edge of the picture? The engine's own player takes the last fight (the great wraith, two Shadow Wraiths,
# two wisps) through the page on a laptop-sized screen with the director camera, without drawing (so it is quick). Every few steps it asks
# the fight who is showing and whether the picture's edge cuts them, and adds it up by move.
#   python3 audit.py [on|off] [width] [height] [foes] [place] [seed]        "*" marks someone the move involves
import asyncio, sys, json, collections
from playwright.async_api import async_playwright
from t import open_fight
RUN = '''([every, maxSteps]) => { const f = MF_FIGHT.debug.fight, G = f.guard, acts = {}; let n = 0, order = 0;
  while (n < maxSteps && f.phase !== 'over') { MF_FIGHT.debug.step(1/30, 1, true); n++; if (n % every) continue;
    const a = f.act && f.act.kind ? f.act : null, key = a ? (a.kind === 'hero' ? a.P.id : a.f.e.name.replace(/ [AB]$/, '')) + ' ' + a.anim + (a.stage === 'play' ? '' : ' (walking)') : f.phase, A = f.audit(); if (!A.length) continue;
    const R = acts[key] || (acts[key] = { n: 0, bad: 0, who: {}, order: order++, shot: {}, move: 0, bob: 0, out: 0 }); R.n++; R.shot[A[0].shot] = 1; R.move = Math.max(R.move, G.move || 0); R.bob = Math.max(R.bob, G.bob || 0); R.out = Math.max(R.out, G.hide ? G.hide.size : 0); let any = false;
    for (const x of A) if (x.cut) { any = true; const k = x.who.replace(/ [AB]$/, '') + (x.inv ? '*' : ''); R.who[k] = (R.who[k] || 0) + 1; } if (any) R.bad++; }
  return { acts, n, over: f.phase === 'over' }; }'''
async def main():
    a = sys.argv[1:] + [None] * 7; on = (a[0] or 'on') == 'on'; w = int(a[1] or 1366); h = int(a[2] or 768); foes = a[3] or 'B2K2w'; place = a[4] or 'F3'; seed = int(a[5] or 4242)
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': place, 'foes': foes, 'seed': seed, 'auto': 'attentive', 'camera': 'auto'}, w=w, h=h)
        await pg.evaluate('(on) => { MF_FIGHT.debug.fight.guard.on = on; }', on)
        tot = {}; steps = 0
        for k in range(40):
            r = await pg.evaluate(RUN, [3, 1500]); steps += r['n']
            for key, R in r['acts'].items():
                T = tot.setdefault(key, {'n': 0, 'bad': 0, 'who': collections.Counter(), 'shot': set(), 'move': 0, 'bob': 0, 'out': 0}); T['n'] += R['n']; T['bad'] += R['bad']; T['who'].update(R['who']); T['shot'].update(R['shot'].keys())
                for q in ('move', 'bob', 'out'): T[q] = max(T[q], R[q])
            if r['over']: break
        n = sum(T['n'] for T in tot.values()); bad = sum(T['bad'] for T in tot.values())
        print('%dx%d %s %s guard %s | %.0f s of fight | moments looked at: %d | with someone cut by the edge: %d (%.1f%%)' % (w, h, foes, place, 'ON' if on else 'OFF', steps / 30, n, bad, 100 * bad / max(1, n)))
        for key, T in sorted(tot.items(), key=lambda kv: -kv[1]['bad']):
            if T['bad'] or on: print('  %4d of %4d  %-34s %-12s moved up to %4.1f m, in-shot drift %4.1f m, stepped out %d | %s' % (T['bad'], T['n'], key, '/'.join(sorted(T['shot'])), T['move'], T['bob'], T['out'], ', '.join('%s %d' % kv for kv in T['who'].most_common(6))))
        print('errors:', errs[:6]); await b.close()
asyncio.run(main())
