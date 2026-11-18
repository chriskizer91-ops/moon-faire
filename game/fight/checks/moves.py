# moves.py: every move of every witch and every move of every foe is played once in a real fight, with a still as it lands.
# The engine's attentive player takes any turn that has nothing left to try.   python3 moves.py [place] [foes] [camera]
import asyncio, sys, json
from playwright.async_api import async_playwright
from t import open_fight, shot, STATE
# take turns until a move from the list can be chosen (returns its id), the fight ends, or max turns pass
NEXT = '''([want, max]) => { const f = MF_FIGHT.debug.fight, E = MF_ENGINE; let turns = 0, n = 0;
  while (turns < max) { while (n < 200000 && f.phase !== 'menu' && f.phase !== 'over') { MF_FIGHT.debug.step(1/15, 1, true); n++; }
    if (f.phase === 'over') return ['over', null]; const B = f.battle, h = B.fighters.find(x => x.id === f.current), ok = E.heroMoves(B, h).filter(m => m.ok).map(m => m.id), id = want.find(w => ok.indexOf(w) >= 0);
    if (id) { f.choose(id); return ['chose', id, f.act ? f.act.stage : null]; } const c = E.choose(B, h, 'attentive'); if (!f.choose(c.move, c.target)) f.choose(ok[0]); turns++; }
  return ['none', null]; }'''
LAND = '''() => { const f = MF_FIGHT.debug.fight; let n = 0; while (n < 4000 && f.act && f.act.stage === 'in') { MF_FIGHT.debug.step(1/15, 1, true); n++; } const a = f.act; if (!a) return 0;
  const t = a.hitsAt && a.hitsAt.length ? a.hitsAt[0] + 0.3 : a.P.a.dur(a.anim) * 0.62; MF_FIGHT.debug.step(1/15, Math.max(1, Math.round(t * 15)), true); MF_FIGHT.debug.step(1/15, 1); return t; }'''
async def main():
    a = sys.argv[1:] + [None] * 3; place = a[0] or 'F3'; foes = a[1] or 'B2K2w'; cam = a[2] or 'near'
    want = ['i_revive', 'j_heal', 'f_plain', 'f_stitch', 'f_needles', 'f_quilt', 'f_decoy', 'f_cloth', 'i_mend', 'i_bloom', 'i_deity', 'i_thorn', 'i_plain', 'r_gem', 'r_plain', 'j_plain', 'j_jab', 'j_seal']
    async with async_playwright() as p:
        b, pg, errs = await open_fight(p, {'place': place, 'foes': foes, 'seed': 31, 'gap': 0, 'camera': cam, 'party': {'jester': {'hp': 520}, 'fox': {'hp': 0}, 'io': {'hp': 200}}})
        # for this check only: the foes are given six times their Life and hit at a third of their strength, so the fight lasts long enough to try everything
        await pg.evaluate('(() => { const f = MF_FIGHT.debug.fight, B = f.battle; B.kd = 0.33; for (const x of f.foes) { x.e.max *= 6; x.e.hp = x.e.max; x.shown.max = x.e.max; x.shown.life = x.e.hp; } })()')
        await pg.evaluate('MF_FIGHT.debug.step(1/15, 40, true); MF_FIGHT.debug.step(1/15, 1)'); await shot(pg, 'moves_%s_start.png' % place)
        for k in range(60):
            if not want: break
            r = await pg.evaluate(NEXT, [want, 16]); print(r, json.dumps((await pg.evaluate(STATE))['log'])[:90])
            if r[0] != 'chose': break
            want.remove(r[1]); await pg.evaluate(LAND); await shot(pg, 'moves_%s_%s.png' % (place, r[1]))
        print('left untried:', want); print(json.dumps(await pg.evaluate(STATE))); print('errors:', errs[:10]); await b.close()
asyncio.run(main())
