# usage: bench.py script.js [out_prefix]
# The move workbench. Loads the test page, adds the helpers below, then runs script.js in pieces cut at lines `//SHOT name`: a still is saved after each such line. Pieces share S; F is her finger shapes.
#   T.L(v)              a world point as a point in her root's own space (the space hand and foot keys are written in)
#   T.hp(x, y, z)       a point given on her head as it was modelled (bind space), where it is now, in root space
#   T.np(x, y, z)       the same for a point on her neck (the bell)
#   T.pose(over)        apply REST with these channels changed; returns the pose
#   T.reach(over, S, anchorName, target, n)   move hand S ('R' or 'L') until the named anchor (tipR, tipL, handR, handL) sits on target; returns the hand key
import sys, json, os
from playwright.sync_api import sync_playwright
script = open(sys.argv[1]).read()
out = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/fox3d/shots/bench'
HELP = r'''() => {
  const j = T.j, D = j.debug, SK = D.SK;
  T.L = (v) => { j.root.updateMatrixWorld(true); return j.root.worldToLocal(v.clone()); };
  const onBone = (b) => (x, y, z) => { const B = SK[b], r = B.userData.rest; j.root.updateMatrixWorld(true); return T.L(new THREE.Vector3(x - r.x, y - r.y, z - r.z).applyMatrix4(B.matrixWorld)); };
  T.hp = onBone('head'); T.np = onBone('neck');
  T.pose = (over) => { const P = D.clonePose(D.REST); for (const k in over) P[k] = typeof over[k] === 'number' ? over[k] : over[k].slice(); for (const k of ['ftR', 'ftL']) while (P[k].length < 7) P[k].push(0); D.applyPose(P); return P; };
  T.reach = (over, S, an, target, n) => { const o = Object.assign({}, over); o['h' + S] = (over['h' + S] || D.REST['h' + S]).slice(); let e = 0;
    for (let i = 0; i < (n || 8); i++) { T.pose(o); const tg = typeof target === 'function' ? target() : target, a = T.L(j.anchor(an)); e = a.distanceTo(tg); o['h' + S][0] += tg.x - a.x; o['h' + S][1] += tg.y - a.y; o['h' + S][2] += tg.z - a.z; }
    T.pose(o); return { h: o['h' + S].map((x) => +x.toFixed(3)), err: +e.toFixed(4) }; };
  T.r3 = (v) => [v.x, v.y, v.z].map((x) => +x.toFixed(3));
}'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1000, 'height': 1000})
    pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:600]))
    pg.on('console', lambda m: print('LOG', m.text[:1500]) if 'JLOG' in m.text else None)
    pg.goto('file:///home/claude/fox3d/test.html' + os.environ.get('Q',''))
    pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    err = pg.evaluate('T.err || ""')
    if err: print('BUILD ERROR', err); sys.exit(1)
    pg.evaluate('() => { T.step(60, 1/60); }'); pg.evaluate(HELP)
    # the script is cut at lines "//SHOT name": each piece runs in turn (they share window.S), and a still is saved after a piece that ends in one
    import re
    pieces = re.split(r'^//SHOT[ \t]+(\S+)[ \t]*$', script, flags=re.M)
    pg.evaluate('() => { window.S = {}; }')
    for i in range(0, len(pieces), 2):
        r = pg.evaluate('(async () => { const F = T.j.debug.FP, S = window.S; ' + pieces[i] + ' })()')
        if r is not None: print(json.dumps(r)[:6000])
        if i + 1 < len(pieces): pg.locator('#c').screenshot(path=f'{out}_{pieces[i + 1]}.png')
    b.close()
