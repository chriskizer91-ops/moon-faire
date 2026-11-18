# For each outfit: put it on the full way and the light way (fresh page each), play the same moves with the same steps, and compare
# every bone's world matrix (the hooks: heels, skirts kept off her legs, wings) between the two. Also times both builds.
import sys, json
from playwright.sync_api import sync_playwright
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files']
SEQ = [['walk', 2.0], ['jog', 1.2], ['kneel', 2.5], ['squat', 2.5], ['twirl', 2.0], ['curtsey', 2.0], ['hover', 1.5]]
JS = '''async ([c, light, seq, exact]) => { const R = DOLLPAGE.R; const sc = (f) => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = f + '.js'; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  if (!(window.DOLLWEAR_DEFS || {}).hair_bun) await sc('wardrobe/hair_bun');
  if (light) { await sc('wardrobe_light/' + c + '_light'); if (window.DOLLLIGHT[c].keep && window.DOLLLIGHT[c].keep.length) await sc('wardrobe/' + c + '_tex'); }
  else await sc('wardrobe/' + c + '_tex');
  await sc('wardrobe/' + c);
  const t0 = performance.now();
  const w = light ? R.wardrobe.wear(c, false, { light: true, keep: window.DOLLLIGHT[c].keep || [], exact: exact || undefined }) : R.wardrobe.wear(c);
  const ms = performance.now() - t0;
  R.pose({ arm: 15, leg: 0 }); R.settle();
  const out = [], bones = R.skeleton.bones;
  for (const [mv, secs] of seq) { R.play(mv); const n = Math.round(secs * 30);
    for (let i = 0; i < n; i++) { R.animate(1 / 30); if (i % 10 === 9) { const a = []; for (const b of bones) { const e = b.matrixWorld.elements; a.push(e[12], e[13], e[14], e[0], e[5], e[10]); } out.push(a); } } }
  return { ms: Math.round(ms), build: w.ms, frames: out }; }'''
codes = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
    def run(c, light, exact=None):
        pg = b.new_page(viewport={'width': 300, 'height': 400}); pg.set_default_timeout(1200000)
        pg.add_init_script('window.requestAnimationFrame = () => 0;')
        pg.goto('file:///home/claude/io/deliver/doll_site/index.html'); pg.wait_for_function('window.DOLLPAGE')
        r = pg.evaluate(JS, [c, light, SEQ, exact]); pg.close(); return r
    for cc in codes:
        c, _, ex = cc.partition(':'); f = run(c, False); l = run(c, True, ex or None)
        worst, at = 0, None
        for fi, (A, B) in enumerate(zip(f['frames'], l['frames'])):
            for k, (x, y) in enumerate(zip(A, B)):
                d = abs(x - y)
                if d > worst: worst, at = d, (fi, k // 6, k % 6)
        print('%-4s %d frames x %d  full %5d ms   light %5d ms   bones: worst difference %.2e %s' % (c, len(f['frames']), len(f['frames'][0]) // 6, f['ms'], l['ms'], worst, at), flush=True)
    b.close()
