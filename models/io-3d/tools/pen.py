# usage: tools/pen.py [move ...]   -> a table: for each move, the worst pass-through seen while it plays
# (points of cloth inside her legs, points of sleeve inside her arms, points of her hands inside her book; and the deepest of each in mm)
import sys, json
from playwright.sync_api import sync_playwright
MOVES = {'idle': [0.5, 2.0], 'walk': [0.6, 0.9, 1.2, 1.5, 1.8, 2.1], 'jog': [0.6, 0.8, 1.0, 1.2, 1.4, 1.6], 'squat': [0.4, 0.8, 1.5, 3.0], 'kneel': [0.4, 0.8, 1.5, 3.0], 'hover': [0.5, 1.0, 2.0, 4.0],
         'talk': [0.6, 1.8, 3.0], 'read': [0.4, 1.0, 2.0, 4.0, 6.0, 8.0, 9.0, 9.6, 10.2, 10.9, 11.5], 'glasses': [0.5, 0.9, 1.3, 2.0], 'hat': [0.5, 1.0, 1.4, 2.2], 'curtsey': [0.5, 1.0, 1.5, 2.0, 2.6], 'twirl': [0.5, 1.0, 1.4, 1.8, 2.4],
         'herb': [0.6, 1.2, 1.8, 2.6, 3.4, 4.4], 'wave': [0.5, 1.0, 1.6, 2.6], 'look': [0.7, 2.4], 'sickle': [0.6, 1.4, 2.2, 3.0]}
want = sys.argv[1:] or list(MOVES)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 400, 'height': 400}); logs = []
    pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:500]))
    pg.goto('file:///home/claude/io/test_io.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=120000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.add_script_tag(path='/home/claude/io/tools/pen.js')
    pg.evaluate("""(() => { PEN.bookBox = (p) => { const w = 0.150, h = 0.205, ca = Math.cos(0.17), sa = Math.sin(0.17), u = Math.abs(p.x) / ca; if (u > w || Math.abs(p.y) > h / 2) return -1;
      const lift = 0.004 + 0.013 * Math.sin(Math.min(1, u / 0.07) * Math.PI / 2) - 0.004 * (u / w), z0 = u * sa - 0.004, z1 = u * sa + lift; return Math.min(p.z - z0, z1 - p.z, w - u, h / 2 - Math.abs(p.y)); }; })()""")
    pg.evaluate("T.clean('color'); T.j.pose({arm:15}); T.j.setBlink(false);")
    rest = pg.evaluate("PEN.measure()"); print('rest      ', json.dumps(rest))
    tot = {'leg': 0, 'arm': 0, 'book': 0}
    for m in want:
        worst = {'leg': [0, 0, 0], 'arm': [0, 0, 0], 'book': [0, 0, 0]}; by = {}
        pg.evaluate(f"T.j.pose({{arm:15}}); T.j.play('idle'); for (let i = 0; i < 40; i++) T.j.animate(0, 0, 0, 1/60); T.j.play('{m}'); T.now = 0;")
        for t in MOVES[m]:
            r = pg.evaluate(f"(() => {{ const n = Math.round(({t} - T.now) * 60); for (let i = 0; i < n; i++) T.j.animate(0, 0, 0, 1/60); T.now = {t}; return PEN.measure(); }})()")
            for k in worst:
                if r[k]['n'] > worst[k][0]: worst[k] = [r[k]['n'], r[k]['mm'], t]
                elif r[k]['mm'] > worst[k][1]: worst[k][1] = r[k]['mm']
            for k in ('leg', 'arm'):
                for kk, n in r[k].get('by', {}).items(): by[k + ':' + kk] = max(by.get(k + ':' + kk, 0), n)
        for k in tot: tot[k] += worst[k][0]
        print(f"{m:9s} legs {worst['leg'][0]:5d} pts {worst['leg'][1]:3d} mm (t={worst['leg'][2]})   sleeves {worst['arm'][0]:5d} pts {worst['arm'][1]:3d} mm (t={worst['arm'][2]})   book {worst['book'][0]:4d} pts {worst['book'][1]:3d} mm   " + ' '.join(f'{k}={v}' for k, v in sorted(by.items(), key=lambda x: -x[1])[:6]))
    print('TOTAL', tot)
    for l in logs[:8]: print(l)
    b.close()
