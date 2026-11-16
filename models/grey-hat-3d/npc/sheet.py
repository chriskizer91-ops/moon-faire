# The painted body sheet for his light version, taken from his finished model (no painter needed).
# His finished model is drawn flat-on, without perspective, in the frame the fair folk kit reads its body sheets in
# (game/people/kit/guides.py on claude/moon-faire-starter-world): front on the left half, back on the right half seen from behind,
# each half 1.5 m wide (x -0.75 to 0.75) and 2 m tall (y -0.1 to 1.9) of the TEMPLATE's own size. The template is 1.65 m; he is
# drawn shrunk by the light version's height (H) and width (BX) so that a point of him lands where the same point of the light
# version stands before it is scaled up. So the sheet needs no fitting: its fit is [1, 1, 0, 0].
#   python3 npc/sheet.py <out folder>        writes front.png, back.png, side.png (from his left, for measuring depths), sheet.png
import sys, os, io, json, base64
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
FIT = json.load(open(os.path.join(ROOT, 'npc', 'frame.json')))          # H, BX, BZ, ARM (his arms out from straight down, degrees, to match the template's)
JS = '''async (F) => {
  const j = T.j, st = T.stage, R = st.renderer, c = R.domElement, out = {};
  j.pose({ arm: F.ARM, leg: F.LEG || 0 }); j.fx.visible = false; j.root.updateMatrixWorld(true);
  for (const k of (F.HIDE || [])) if (j.meshes[k]) j.meshes[k].visible = false;      // things the light version builds itself, in a plain colour, so they must not be painted onto what is behind them
  for (let i = 0; i < 90; i++) j.animate(0); j.pose({ arm: F.ARM, leg: F.LEG || 0 });
  const lights = []; st.scene.traverse((o) => { if (o.isLight) { lights.push([o, o.intensity]); o.intensity = 0; } });
  const amb = new THREE.HemisphereLight(0xffffff, 0xd8d2cc, F.AMB), sun = new THREE.DirectionalLight(0xffffff, F.SUN); st.scene.add(amb, sun, sun.target);
  const hid = []; st.scene.traverse((o) => { if (o !== st.scene && (o.isMesh || o.isGroup) && !o.isSkinnedMesh && o.parent === st.scene && o !== j.root) { if (o.visible) { hid.push(o); o.visible = false; } } });
  if (st.floor) st.floor.visible = false; if (st.shadowCatcher) st.shadowCatcher.visible = false;
  const sh = R.shadowMap.enabled; R.shadowMap.enabled = false; st.scene.background = null;
  const W = F.W, Hh = F.HH; R.setPixelRatio(1); R.setSize(W, Hh, false); R.setClearColor(0x6e6e6e, 1);
  const sx = F.H * F.BX, sy = F.H, sz = F.H * F.BZ;
  const views = { front: [0, 0, 5, -0.75 * sx, 0.75 * sx], back: [0, 0, -5, -0.75 * sx, 0.75 * sx], side: [5, 0, 0, -0.75 * sz, 0.75 * sz] };
  for (const k in views) {
    const v = views[k], cam = new THREE.OrthographicCamera(v[3], v[4], 1.9 * sy, -0.1 * sy, 0.1, 20); cam.position.set(v[0], 0, v[2]); cam.lookAt(0, 0, 0); cam.updateMatrixWorld();
    sun.position.set(v[0] ? 4 : (v[2] > 0 ? 1.2 : -1.2), 3.0, v[2] ? v[2] : 1.0); sun.target.position.set(0, 0.95, 0); sun.target.updateMatrixWorld();
    R.setRenderTarget(null); R.clear(); R.render(st.scene, cam); out[k] = c.toDataURL('image/png');
  }
  R.shadowMap.enabled = sh; st.scene.remove(amb, sun, sun.target); for (const [o, v] of lights) o.intensity = v; for (const o of hid) o.visible = true;
  return out;
}'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 900, 'height': 1100}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('file://' + ROOT + '/test.html'); pg.wait_for_function('window.T && (T.ok || T.err)', timeout=180000)
    if pg.evaluate('T.err || ""'): print('BUILD ERROR', pg.evaluate('T.err')); sys.exit(1)
    F = dict(FIT, W=768 * 2, HH=1024 * 2)
    shots = pg.evaluate(JS, F)
    for e in errs: print(e)
    b.close()
ims = {k: Image.open(io.BytesIO(base64.b64decode(v.split(',')[1]))).convert('RGB').resize((768, 1024), Image.LANCZOS) for k, v in shots.items()}
for k, im in ims.items(): im.save(os.path.join(OUT, k + '.png'))
sheet = Image.new('RGB', (1536, 1024)); sheet.paste(ims['front'], (0, 0)); sheet.paste(ims['back'], (768, 0)); sheet.save(os.path.join(OUT, 'sheet.png'))
print('sheet written', OUT)
