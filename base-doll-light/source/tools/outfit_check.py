# Checks an outfit against its paintings:  python3 tools/outfit_check.py CODE [--hair hair_bun] [--move kneel:1.6]
# Renders the doll wearing it, in the paintings' pose, from the front, her right side and the back, with a near-flat camera, and lays
# each render beside its painting at the same scale and height (lined up by the marks outfit_prep.py found), plus the painting with
# the render's outline drawn on it.  Writes shots/wear/CODE_check.jpg (and the three renders shots/wear/CODE_f.png, _s.png, _b.png).
# --move NAME:SECONDS renders her in a move instead (no paintings beside it): shots/wear/CODE_NAME.jpg from four sides.
import sys, os, json, subprocess, argparse
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
IO = '/home/claude/io/'
ap = argparse.ArgumentParser(); ap.add_argument('code'); ap.add_argument('--hair', default=''); ap.add_argument('--move', default=''); ap.add_argument('--keep', action='store_true'); ap.add_argument('--img', default='')
A = ap.parse_args(); code = A.code
q = '?wear=' + code + ('&hair=' + A.hair if A.hair else '')
env = dict(os.environ, PAGE='test_doll.html', Q=q)
K = 1000 / (2 * 34 * np.tan(np.radians(1.5))); TY = 0.85; SOLE = 0.038
os.makedirs(IO + 'shots/wear', exist_ok=True)
if A.move:
    name, t = A.move.split(':')
    setup = "(()=>{ T.clean(); return T.at('%s', %s) })()" % (name, t)
    r = subprocess.run(['python3', 'shoot.py', 'shots/wear/%s_%s' % (code, name), setup, 'a:0.5,0.15,34,0.85,3.3,600,1000', 'b:2.2,0.15,34,0.85,3.3,600,1000', 'c:-2.4,0.25,34,0.85,3.3,600,1000', 'd:-0.9,0.1,34,0.85,3.3,600,1000'], cwd=IO, env=env, capture_output=True, text=True, timeout=1500)
    print(r.stdout[-600:], r.stderr[-600:])
    ims = [Image.open(IO + 'shots/wear/%s_%s_%s.png' % (code, name, v)).convert('RGB') for v in 'abcd']
    c = Image.new('RGB', (2400, 1000)); [c.paste(im, (600 * i, 0)) for i, im in enumerate(ims)]; c.resize((1440, 600)).save(IO + 'shots/wear/%s_%s.jpg' % (code, name), quality=85)
    print('wrote shots/wear/%s_%s.jpg' % (code, name)); sys.exit()
setup = "(()=>{ if (T.err) return T.err; T.j.pose(T.j.wardrobe.paintPose); T.clean(); const c = T.stage.camera; c.near = 30; c.far = 40; c.updateProjectionMatrix(); return JSON.stringify(T.wore || null) })()"
r = subprocess.run(['python3', 'shoot.py', 'shots/wear/%s' % code, setup, 'f:0,0,34,0.85,3,600,1000', 's:-1.5708,0,34,0.85,3,600,1000', 'b:3.14159,0,34,0.85,3,600,1000'], cwd=IO, env=env, capture_output=True, text=True, timeout=1500)
print((r.stdout + r.stderr)[-900:])
txt = open(IO + 'wardrobe/%s_tex.js' % code).read(); T = json.loads(txt.split('] = ', 1)[1].rstrip().rstrip(';'))
pa = np.asarray(Image.open(A.img or IO + 'refs_outfits/%sA.png' % code).convert('RGB'))
cols = []
for v, key in (('front', 'f'), ('side', 's'), ('back', 'b')):
    V = T['views'][v]; mk = V['marks']; k = V['k']; heel = T.get('heel', 0)
    # painting (col, row) -> render (col, row):  y_rest = 0.035 - heel + (sole - row) / k ;  render row = 500 - (y_rest - SOLE - TY) * K
    s = K / k; ys0 = 0.035 - heel
    # an outfit in heels lifts her by its heel height every frame (its frame hook), so the painting is lifted with her here
    def r_row(row): return 500 - ((ys0 + (mk['sole'] - row) / k) + heel - SOLE - TY) * K
    if v == 'front': c_of = lambda col: 300 + (col - mk['mid']) / k * K
    elif v == 'back': c_of = lambda col: 300 + (col - mk['mid']) / k * K
    else: c_of = lambda col: 300 + (-0.0231 + (col - mk['mid']) / k) * K      # az -PI/2: she faces the image's right edge, as in the paintings
    # inverse affine for PIL: render (X, Y) -> painting (col, row)
    a_ = 1 / s; c0 = c_of(0); r0 = r_row(0)
    paint = Image.fromarray(pa).transform((600, 1000), Image.AFFINE, (a_, 0, -c0 * a_, 0, a_, -r0 * a_), resample=Image.BILINEAR, fillcolor=(56, 48, 67))
    rend = Image.open(IO + 'shots/wear/%s_%s.png' % (code, key)).convert('RGB')
    ra = np.asarray(rend).astype(float); bg = np.median(ra[:5].reshape(-1, 3), 0); rm = ndi.binary_fill_holes(np.sqrt(((ra - bg) ** 2).sum(-1)) > 25)
    edge = rm & ~ndi.binary_erosion(rm, iterations=2)
    ov = np.asarray(paint).copy(); ov[edge] = [80, 255, 120]
    cols.append([paint, rend, Image.fromarray(ov)])
c = Image.new('RGB', (1800, 3000), (30, 30, 30))
for j, trio in enumerate(cols):
    for i, im in enumerate(trio): c.paste(im, (600 * i, 1000 * j))
c.resize((900, 1500)).save(IO + 'shots/wear/%s_check.jpg' % code, quality=86)
print('wrote shots/wear/%s_check.jpg  (rows: front, her right side, back; columns: painting, model, painting with the model outline)' % code)
