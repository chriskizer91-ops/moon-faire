# His trousers while he moves: stills, and a count of any doll that comes through the cloth.
# usage: python3 tools/trouser_walk.py out_folder [sway multiplier, default 1; 8 is the check that the count can see sway that is too big]
# 1. walk_stills.jpg: four moments of one stride (a quarter of a stride apart), each from the front, his left side and the back.
#    idle_talk_stills.jpg: two moments of idle and two of talk, from the front and a three-quarter view.
# 2. The count. The cloth is drawn solid white with its holes closed, the boots white, the doll's hips and legs pink, nothing else.
#    Any pink left in the picture is doll in front of cloth: a fault. Eight moments of the walk from eight sides, and idle and talk.
# The headless browser cannot show movement: these are stills. How it looks moving has to be watched on a phone.
import sys, os, numpy as np
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W, H = 560, 720
SOLID = """(() => { const M = T.j.meshes, mk = (c) => new THREE.MeshBasicMaterial({ color: c, skinning: true, side: THREE.DoubleSide });
  T._keep = {}; for (const k in M) { T._keep[k] = [M[k].visible, M[k].material]; M[k].visible = /^(trousers|projBoots|dollHips|dollLegs)$/.test(k); }
  M.trousers.material = mk(0xffffff); M.projBoots.material = mk(0xffffff);
  // the white stand-in for the trousers is given the same sway as the real cloth (stage 3), or this count would be of cloth that does not sway.
  // T._swayK: 1 = as the model moves it; a bigger number multiplies the sway, to check that this count can see cloth pushed into the leg.
  { const U = T.j.debug.sway.uni, K = { value: T._swayK == null ? 1 : T._swayK }; M.trousers.material.onBeforeCompile = (sh) => { sh.uniforms.uSway = { value: U }; sh.uniforms.uK = K;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\\nattribute vec2 sway; uniform vec3 uSway[ 4 ]; uniform float uK;')
        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\\ntransformed += uK * sway.x * 0.02 * ( position.x < 0.0 ? mix( uSway[ 0 ], uSway[ 1 ], sway.y ) : mix( uSway[ 2 ], uSway[ 3 ], sway.y ) );'); }; } M.dollHips.material = M.dollLegs.material = mk(0xff00ff); T.clean('mask'); })()"""
BACK = "(() => { const M = T.j.meshes; for (const k in M) { M[k].visible = T._keep[k][0]; M[k].material = T._keep[k][1]; } T.clean('nodust'); })()"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 720, 'height': 920}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:400]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    pg.wait_for_timeout(1200); pg.evaluate('T._swayK = %s' % (sys.argv[2] if len(sys.argv) > 2 else '1')); pg.evaluate("T.clean('nodust')")
    def shot(az, dist=4.6, ty=0.72):
        pg.evaluate('T.view(%f,0.04,%f,%f,22,%d,%d)' % (az, dist, ty, W, H)); pg.locator('#c').screenshot(path='/tmp/_w.png'); return Image.open('/tmp/_w.png').convert('RGB')
    def pink(az):
        pg.evaluate(SOLID); im = np.asarray(shot(az, 3.4, 0.66)).astype(int); pg.evaluate(BACK)
        return int(((im[..., 0] > 200) & (im[..., 1] < 80) & (im[..., 2] > 200)).sum())
    AZ8 = [i * 0.7853982 for i in range(8)]
    rows = []; stills = []
    pg.evaluate("T.j.play('walk'); T.step(64, 1/30)")
    for k in range(8):
        if k: pg.evaluate('T.step(4, 1/30)')
        rows.append(('walk, moment %d of 8' % (k + 1), [pink(a) for a in AZ8]))
        if k % 2 == 0: stills.append([shot(0), shot(1.5707963), shot(3.1415927)])
    sh = Image.new('RGB', (W * 4, H * 3), (56, 48, 67))
    for i, col in enumerate(stills):
        for j, im in enumerate(col): sh.paste(im, (i * W, j * H))
    sh.save(os.path.join(OUT, 'walk_stills.jpg'), quality=90)
    others = []
    for name in ('idle', 'talk'):
        pg.evaluate("T.j.play('%s'); T.step(50, 1/30)" % name)
        for k in range(2):
            if k: pg.evaluate('T.step(22, 1/30)')
            rows.append(('%s, moment %d of 2' % (name, k + 1), [pink(a) for a in AZ8])); others.append([shot(0), shot(0.75)])
    sh = Image.new('RGB', (W * 4, H * 2), (56, 48, 67))
    for i, col in enumerate(others):
        for j, im in enumerate(col): sh.paste(im, (i * W, j * H))
    sh.save(os.path.join(OUT, 'idle_talk_stills.jpg'), quality=90)
    for e in errs[:5]: print('ERR', e)
    b.close()
print('doll showing in front of cloth, in pixels of a %d x %d picture (0 is right), from eight sides: front, then every 45 degrees round by his left' % (W, H))
for name, v in rows: print('  %-22s %s   %s' % (name, '  '.join('%5d' % x for x in v), 'ok' if max(v) == 0 else 'FAULT'))
