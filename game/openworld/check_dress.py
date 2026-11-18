# check_dress.py: stills and meter lines for the fairground and the moor places' dressing (ow-dressing.js).
# usage: python3 check_dress.py [set] [prefix]   set: views (default) | walk | all
import sys, asyncio, json, os, time
from playwright.async_api import async_playwright
from check import ARGS, HERE
PI = 3.14159
VIEWS = [  # name, x, z, face, yaw, pitch, dist
  ('sq', -230.2, 98.9, 3.14, 0.0, 0.32, 6.5),
  ('main_w', -258, 92, 1.57, -1.3, 0.30, 7.0),
  ('back_w', -246, 73.5, 1.57, -1.57, 0.30, 7.0),
  ('back_e', -160, 77.5, -1.57, 1.57, 0.30, 7.0),
  ('front_w', -246, 117, 1.57, -1.57, 0.30, 7.0),
  ('front_e', -150, 117, -1.57, 1.57, 0.30, 7.0),
  ('gap12', -206, 78, 3.14, PI, 0.30, 7.0),
  ('gap23', -168, 118, 0.0, 0.0, 0.30, 7.0),
  ('wagons', -236, 62.4, 1.57, -1.45, 0.32, 7.5),
  ('high_w', -262, 96, 1.57, -1.57, 1.0, 16.0),
  ('high_m', -190, 128, 0, 0.0, 1.0, 16.0),
  ('gate', -126, 96.5, -1.57, 1.57, 0.30, 7.0),
  ('over', -198, 100, 0, 0.0, 1.25, 95.0), ('over2', -198, 140, 0, 0.0, 0.75, 70.0),
  ('high_b', -246, 72.5, 1.57, -1.35, 1.0, 16.0), ('high_f', -150, 118, -1.57, 1.45, 1.0, 16.0),
  ('w4a', 31.75, 114, 3.14, 0.0, 0.35, 9.0), ('w4b', 31.75, 84, 0, PI, 0.35, 9.0),
  ('w5a', 161, 52, 3.14, 0.0, 0.35, 9.0), ('w5b', 135, 36, 1.57, -1.57, 0.35, 9.0),
  ('w7a', 161, 110, 3.14, 0.0, 0.35, 9.0), ('w7b', 161, 80, 0, PI, 0.40, 9.0),
  ('w6a', 289, 110, 3.14, 0.0, 0.35, 9.0), ('w6b', 289, 82, 0, PI, 0.35, 9.0),
]
async def views(pg, names, prefix):
    for v in VIEWS:
        if names and v[0] not in names: continue
        name, x, z, face, yaw, pitch, dist = v
        await pg.evaluate('([x,z,face,yaw,pitch,dist]) => { OWP.placeAt(x, z, face); const c = OWP.cam; c.yaw = yaw; c.pitch = pitch; c.dist = dist; c.d = dist; c.lastDrag = 1e9; }', [x, z, face, yaw, pitch, dist])
        for k in range(40):
            await pg.evaluate('OWP.step(1/30, 3)')
            if await pg.evaluate('OWP.terrain.ready(OWP.me, 120) >= 1'): break
        await pg.evaluate('OWP.step(1/30, 16)')
        same, prev = 0, None
        for k in range(40):                                   # until the land round her has settled (the same draws three times running)
            await pg.wait_for_timeout(60); await pg.evaluate('OWP.step(1/30, 16)')
            m = (await pg.evaluate('document.getElementById("meter").textContent')).split(' · ')[1:3]
            same = same + 1 if m == prev else 0; prev = m
            if same >= 3: break
        await (await pg.query_selector('#stagebox')).screenshot(path=os.path.join(HERE, 'look', 'v_%s%s.png' % (prefix, name)))
        m = await pg.evaluate('document.getElementById("meter").textContent')
        print('%-8s' % name, ' · '.join(m.split(' · ')[1:3]), '|', await pg.evaluate('document.getElementById("place").textContent'), '| at', await pg.evaluate('[OWP.me.x.toFixed(1), OWP.me.z.toFixed(1)]'))
async def main():
    what = sys.argv[1] if len(sys.argv) > 1 else 'views'; prefix = sys.argv[2] if len(sys.argv) > 2 else ''
    names = sys.argv[3].split(',') if len(sys.argv) > 3 else None
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        pg = await b.new_page(viewport={'width': 1280, 'height': 720}); errs = []
        pg.on('console', lambda m: errs.append(m.type + ' ' + m.text[:400]) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:600]))
        t0 = time.time()
        await pg.goto('file://' + os.environ.get('PAGE', os.path.join(HERE, 'out', 'moon-faire-open-world.html')) + '?shot=1')
        await pg.wait_for_function('window.OWP && (window.OWP.ready || !document.getElementById("err").hidden)', timeout=600000)
        print('ready in', round(time.time() - t0, 1), 's', 'err:', await pg.evaluate('document.getElementById("err").hidden ? "" : document.getElementById("err").textContent'))
        if what in ('views', 'all'): await views(pg, names, prefix)
        if what in ('walk', 'all'):
            src = open(os.path.join(HERE, 'walk_tests.js')).read()
            r = await pg.evaluate(src)
            print(json.dumps(r, indent=1))
        print('errors:', [e for e in errs if 'ReadPixels' not in e and 'GPU stall' not in e and 'willReadFrequently' not in e][:12]); await b.close()
asyncio.run(main())
