import asyncio, os
from playwright.async_api import async_playwright
from check import ARGS, HERE
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS); pg = await b.new_page(viewport={'width': 960, 'height': 540}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto('file://' + os.path.join(HERE, 'out', 'moon-faire-open-world.html') + '?shot=1')
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=300000)
        r = await pg.evaluate('''() => { const m = OWP.me; OWP.placeAt(-262, 97.6, 1.57); OWP.cam.yaw = -1.57; OWP.cam.lastDrag = 1e9; const out = []; let stuckAt = null, lastx = m.x, still = 0;
          for (let i = 0; i < 160 && m.x < -124; i++) { m.goal = { x: m.x + 8, z: 97.2 + (m.x > -160 ? -0.7 : 0), run: true }; OWP.cam.yaw = -1.57; OWP.step(1/30, 12); if (Math.abs(m.x - lastx) < 0.05) { if (++still > 4) { stuckAt = [m.x.toFixed(1), m.z.toFixed(1)]; break; } } else still = 0; lastx = m.x; }
          return { reached: m.x.toFixed(1), z: m.z.toFixed(1), stuckAt, wildInFair: [[-250,97],[-228,96],[-208,97],[-190,80],[-190,112],[-168,97],[-148,100],[-135,97]].map((q) => { OWP.placeAt(q[0], q[1], 0); OWP.step(1/30, 2); return OWP.enc.wild; }), people: OWP.places.people.length, lamps: OWP.places.lamps.length }; }''')
        print(r, errs[:4]); await b.close()
asyncio.run(main())
