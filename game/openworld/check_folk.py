# check_folk.py: the fair folk's minds and talk on the real page, without a graphics card (Playwright and Chrome, as check.py).
# Runs the square test for a few minutes of the evening, says what everyone did, has her talk to people, and takes stills into look/.
#   python3 check_folk.py [open]      (open: the open world itself, not the square test)
import asyncio, os, sys, json
from playwright.async_api import async_playwright
from check import ARGS, HERE
PAGE = 'moon-faire-open-world.html' if 'open' in sys.argv else 'moon-faire-square-test.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        for (w, h, tag) in [(1280, 720, 'lap'), (390, 760, 'phone')]:
            pg = await b.new_page(viewport={'width': w, 'height': h}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:400])); pg.on('console', lambda m: errs.append('console: ' + m.text[:300]) if m.type in ('error', 'warning') and 'GPU' not in m.text and 'WebGL' not in m.text else None)
            await pg.goto('file://' + os.path.join(HERE, 'out', PAGE) + '?shot=1')
            await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
            for k in range(40):
                await pg.evaluate('OWP.step(1/30, 4)')
                if await pg.evaluate('OWP.places.people.filter((p) => p.npc).length') >= 11: break
            shot = lambda name: pg.locator('#stagebox').screenshot(path=os.path.join(HERE, 'look', 'f_%s_%s.png' % (tag, name)))
            await pg.evaluate('() => { document.getElementById("mindsw").click(); const c = OWP.cam; c.yaw = 0.25; c.pitch = 0.5; c.dist = 13; c.lastDrag = 1e9; }')
            seen = {}; moved = {}
            for stage, secs in ((0, 60), (1, 90), (2, 90)):
                await pg.evaluate('(s) => OW.folk.evening({ stage: s, lamps: 3 })', stage)
                for k in range(secs // 5):
                    await pg.evaluate('OWP.step(1/20, 100)'); await asyncio.sleep(0)
                    for (pid, wd, x, z) in await pg.evaluate('OWP.places.people.filter((p) => p.mind).map((p) => [p.id, OW.folk.words(p), p.x, p.z])'):
                        seen.setdefault(pid, {}); seen[pid][wd] = seen[pid].get(wd, 0) + 5
                        if pid in moved: moved[pid][2] += ((x - moved[pid][0]) ** 2 + (z - moved[pid][1]) ** 2) ** 0.5; moved[pid][0] = x; moved[pid][1] = z
                        else: moved[pid] = [x, z, 0]
                await shot('stage%d' % stage)
            if tag == 'lap':
                for pid in sorted(seen): print(' ', pid.ljust(20), 'moved %3d m |' % moved[pid][2], ', '.join('%s %ds' % kv for kv in sorted(seen[pid].items(), key=lambda kv: -kv[1])))
                print('  inside something solid:', await pg.evaluate('OWP.places.people.filter((p) => p.mind && !p.npc.sitting && !OWP.ground(p.x, p.z, 0.02)).map((p) => p.id)'))
                print('  bark showing:', await pg.evaluate('document.getElementById("bark").hidden ? "" : document.getElementById("barkline").textContent'))
            # she walks up to the nearest person and talks, three times
            said = await pg.evaluate('''() => { const out = []; const P = OWP.places.people.filter((p) => p.mind).sort((a, b) => Math.hypot(a.x - OWP.me.x, a.z - OWP.me.z) - Math.hypot(b.x - OWP.me.x, b.z - OWP.me.z))[0];
              for (let n = 0; n < 3; n++) { OWP.placeAt(P.x + 1.2, P.z + 0.3, -1.8); OWP.step(1/30, 6); OWP.act(); let g = 0; while (!document.getElementById("say").hidden && g++ < 12) { out.push(P.id + ": " + document.getElementById("sayline").textContent); OWP.act(); OWP.act(); OWP.step(1/30, 3); } out.push("--"); OWP.step(1/30, 30); }
              OWP.placeAt(P.x + 1.2, P.z + 0.3, -1.8); OWP.step(1/30, 6); OWP.act(); OWP.step(1/30, 40); return out; }''')
            if tag == 'lap': print('  talk:'); [print('    ' + s) for s in said]
            await pg.evaluate('() => { const c = OWP.cam; c.dist = 3.2; c.pitch = 0.25; OWP.step(1/30, 30); }'); await shot('talk')
            print(tag, await pg.evaluate('document.getElementById("meter").textContent'))
            print(tag, 'errors:', errs[:6]); await pg.close()
        await b.close()
asyncio.run(main())
