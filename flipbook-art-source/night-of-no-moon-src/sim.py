"""Balance check: an auto-player fights battles and prints win or lose, her HP left and the fight length.

    python3 sim.py                                   # a default set of fights
    python3 sim.py '[[3,["boss"],true]]'            # [level, enemies, is_boss] per fight

The game clock runs 4x faster while it plays.

Start a local server in flipbook-art-source/ first:
    cd flipbook-art-source && python3 -m http.server 8000
Needs Playwright for Python (pip install playwright; playwright install chromium).
Set GAME_URL to test another copy.
"""
import os
URL = os.environ.get('GAME_URL', 'http://localhost:8000/night-of-no-moon.html')
from playwright.sync_api import sync_playwright
import time, json, sys
AUTO = r"""
window.__auto=setInterval(()=>{ const g=__game, B=g.B; if(!B||!B.inputOpen||B.mode!=='root') return; const j=B.j, P=g.P;
  const al=B.enemies.filter(e=>e.alive); const boss=al.find(e=>e.d.boss);
  if(j.hp<j.max.hp*.35 && P.items.tonic>0) return g.doAction('item:tonic');
  if(j.curtain>=1&&!j.curtainUsed&&j.mp>=20&&(boss||al.length>1)) return g.doAction('curtain_call');
  if(boss){ if(boss.charging&&j.mp>=12) return g.doAction('hush');
    if(j.hp<j.max.hp*.6&&j.regen<=0&&j.mp>=25) return g.doAction('against_all_odds');
    if(boss.doom===0&&j.mp>=15) return g.doAction('sealed_fate',boss);
    if(j.mp<15&&P.items.moonwater>0) return g.doAction('item:moonwater');
    return g.doAction('gilded_rebuke',boss) }
  if(al.length>=3&&j.mp>=12) return g.doAction('hush');
  const t=al.sort((a,b)=>a.hp-b.hp)[0]; g.doAction('gilded_rebuke',t);
},50);"""
DEFAULT_PLAN=[[1,['wisp','wisp'],False],[1,['toad','wisp'],False],[3,['marionette','moth'],False],[3,['boss'],True]]
def run(pg, lv, ids, theme='marsh', boss=False, items=(2,1,0)):
    pg.evaluate(f"__game.newGame(); __game.P.lv={lv}; const st={{hp:300+45*{lv},mp:56+4*{lv}}}; __game.P.hp=st.hp; __game.P.mp=st.mp; __game.P.items={{tonic:{items[0]},moonwater:{items[1]},sunstone:{items[2]}}}; __game.field('marsh',300,430,'right')")
    time.sleep(.2)
    pg.evaluate(f"__game.startBattle({json.dumps(ids)},'{theme}',{str(boss).lower()})")
    t0=time.time()
    while True:
        time.sleep(.25)
        st=pg.evaluate("(()=>{const B=__game.B; if(!B) return 'none'; if(B.over) return B.j.hp<=0?'lose':'win'; return 'run'})()")
        if st in('win','lose') or time.time()-t0>200: break
    info=pg.evaluate("(()=>{const B=__game.B; return {hp:Math.round(B.j.hp),max:B.j.max.hp,t:Math.round(B.t),boss:B.enemies.map(e=>e.hp)}})()")
    # dismiss
    time.sleep(1.6); pg.keyboard.press('Enter'); time.sleep(.8)
    pg.evaluate("document.getElementById('gameover').hidden=true; document.getElementById('results').hidden=true")
    return st, info
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':960,'height':540})
    pg.goto(URL); pg.wait_for_function('document.getElementById("loading").hidden', timeout=30000)
    pg.keyboard.press('Enter'); time.sleep(.3)
    pg.wait_for_function("['K48','O24','S16','U29','V15','E08'].every(n=>__game.IMG[n])", timeout=60000)
    pg.evaluate("__game.TS=4; __game.S.speed=1;"); pg.evaluate(AUTO)
    plan=json.loads(sys.argv[1]) if len(sys.argv)>1 else DEFAULT_PLAN
    for lv,ids,boss in plan:
        st,info=run(pg,lv,ids,'stage' if boss else 'marsh',boss)
        print(lv, ids, st, info, flush=True)
    b.close()
