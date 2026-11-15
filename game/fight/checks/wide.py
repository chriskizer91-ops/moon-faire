# wide.py: the spells that take up a lot of room (the Guardian's deer, the Fox's moon and quilt and ghost, the Jester's Heal taunt). Three
# stills of each, early, middle and late, with the director camera, to see that the whole animation is in the picture.  python3 wide.py [w] [h]
import asyncio, sys, json
from playwright.async_api import async_playwright
from t import open_fight, shot
NEXT = '''([want, max]) => { const f = MF_FIGHT.debug.fight, E = MF_ENGINE; let turns = 0, n = 0;
  while (turns < max) { while (n < 300000 && f.phase !== 'menu' && f.phase !== 'over' && !(f.act && f.act.kind === 'hero' && f.act.stage === 'play' && window.SEEN.indexOf(f.act.anim) < 0 && window.LOOK.indexOf(f.act.anim) >= 0)) { MF_FIGHT.debug.step(1/15, 1, true); n++; }
    if (f.phase === 'over') return ['over']; if (f.phase !== 'menu') { window.SEEN.push(f.act.anim); return ['playing', f.act.anim, f.act.P.a.dur(f.act.anim)]; }
    const B = f.battle, h = B.fighters.find(x => x.id === f.current), ok = E.heroMoves(B, h).filter(m => m.ok).map(m => m.id), id = want.find(w => ok.indexOf(w) >= 0);
    if (id) { f.choose(id); want.splice(want.indexOf(id), 1); } else { const c = E.choose(B, h, 'attentive'); if (!f.choose(c.move, c.target)) f.choose(ok[0]); } turns++; }
  return ['none']; }'''
async def main():
    w = int(sys.argv[1]) if len(sys.argv) > 1 else 1366; h = int(sys.argv[2]) if len(sys.argv) > 2 else 768
    look = ['guardian', 'moons_little_lie', 'crazy_quilt', 'borrowed_face', 'taunt_heal']; want = ['i_deity', 'f_needles', 'f_quilt', 'f_decoy', 'j_heal']
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': 'F3', 'foes': 'K2w', 'seed': 31, 'camera': 'auto', 'party': {'jester': {'hp': 500}}}, w=w, h=h)
        await pg.evaluate('(L) => { window.SEEN = []; window.LOOK = L; const f = MF_FIGHT.debug.fight, B = f.battle; B.kd = 0.3; for (const x of f.foes) { x.e.max *= 8; x.e.hp = x.e.max; x.shown.max = x.e.max; x.shown.life = x.seenLife = x.e.hp; } }', look)
        for k in range(40):
            r = await pg.evaluate(NEXT, [want, 30])
            if r[0] != 'playing': print('stopped', r, 'left', want); break
            name, dur = r[1], r[2]; t = 0
            for i, frac in enumerate([0.3, 0.55, 0.8]):
                await pg.evaluate('(n) => { MF_FIGHT.debug.step(1/15, n, true); MF_FIGHT.debug.step(1/120, 1); }', max(1, int((frac * dur - t) * 15))); t = frac * dur; await shot(pg, 'wide_%d_%s_%d.png' % (w, name, i))
            print(name, round(dur, 1))
            if len(await pg.evaluate('window.SEEN')) >= len(look): break
        print('errors:', errs[:6]); await b.close()
asyncio.run(main())
