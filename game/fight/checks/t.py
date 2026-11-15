# shared by the fight's checks: opens out/moon-faire-fight.html in the test browser (no graphics chip, so it is slow) and steps it by hand
import os, json
from playwright.async_api import async_playwright
ARGS = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
PAGE = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'out', 'moon-faire-fight.html'))
SHOTS = os.environ.get('MF_SHOTS', '/tmp/mf-fight-shots'); os.makedirs(SHOTS, exist_ok=True)
async def open_fight(p, opts, w=1366, h=768):
    b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': w, 'height': h}); errs = []
    pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:500]))
    await pg.goto(PAGE + '?shot=1')
    await pg.evaluate('(o) => { window.RES = null; MF_PAGE.go(o).then(() => { window.RES = window.MF_LAST; }); }', opts)
    await pg.wait_for_function('(MF_FIGHT.debug.fight && MF_FIGHT.debug.fight.phase !== "off" && MF_FIGHT.debug.fight.battle) || document.getElementById("out").textContent.indexOf("could not") >= 0', timeout=300000)
    return b, pg, errs
async def shot(pg, name): await pg.screenshot(path=os.path.join(SHOTS, name))
STATE = '''() => { const f = MF_FIGHT.debug.fight, B = f.battle; return { phase: f.phase, cur: f.current, act: f.act && f.act.kind ? (f.act.kind + ':' + f.act.anim + ':' + f.act.stage) : null, over: B.over,
  heroes: B.fighters.filter(x => x.side === 'hero').map(x => x.id + ' ' + Math.round(x.hp)), foes: B.fighters.filter(x => x.side === 'foe').map(x => x.name + ' ' + Math.round(x.hp) + '/' + Math.round(x.fate)), log: document.querySelector('.mff .log').textContent }; }'''
# step until the phase is one of want (or n steps have passed)
UNTIL = '''([want, max, dt]) => { const f = MF_FIGHT.debug.fight; let n = 0; while (n < max && want.indexOf(f.phase) < 0) { MF_FIGHT.debug.step(dt || 1/20, 1, true); n++; } MF_FIGHT.debug.step(1/60, 1); return n; }'''
