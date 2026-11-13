# Io's arm skin, painted from D3 (her arm held straight out: seen from the front in the top half, from behind in the bottom half)
# and added to out/io_tex.js as 'arms'. Run after bake_io.py and bake_head_io.py:  python3 -I bake_arms_io.py
#   arms  512 x 1024: one arm unrolled. Across: once round the arm, starting at the outer side (the top line in D3), then the front,
#         the inner side at the middle, the back. Down: the wrist at the top row, the shoulder at the bottom row (src/I30_body.js reads it so).
# Both arms wear the same picture (there is one painted arm). The painting's own light is kept at about half strength, and the picture
# is brought to the plain arm colour ('skin') so it meets her shoulder and her hand as the plain arm did.
import sys, io, json, base64
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = '/home/claude/io/'; OUT = ROOT + 'out/'
im = np.asarray(Image.open(ROOT + 'refs/D3.png').convert('RGB')).astype(np.float32)
T = json.loads(open(OUT + 'io_tex.js').read().split('=', 1)[1].rstrip(';'))
skin = np.array([int(T['skin'][i:i + 2], 16) for i in (1, 3, 5)], np.float32)
LU, LF, S0, S1 = 0.232, 0.212, -0.047 * 0.998, 0.458
VIEWS = {'front': (0, 480, ((225, 223), (655, 250), (1105, 231))), 'back': (512, 1000, ((225, 727), (665, 752), (1125, 745)))}   # rows of the view; shoulder, elbow, wrist joints
r, g, b = im[..., 0], im[..., 1], im[..., 2]
m = (r > 110) & (r > b + 18) & (r > g + 8)

def edges(y0, y1):
    top = np.zeros(im.shape[1]); bot = np.zeros(im.shape[1])
    for x in range(im.shape[1]):
        ys = np.where(m[y0:y1, x])[0]
        if len(ys) < 4: top[x] = bot[x] = np.nan; continue
        runs, s = [], ys[0]
        for a, c in zip(ys[:-1], ys[1:]):
            if c != a + 1: runs.append((s, a)); s = c
        runs.append((s, ys[-1])); q = max(runs, key=lambda q: q[1] - q[0]); top[x] = q[0] + y0; bot[x] = q[1] + y0
    return ndi.gaussian_filter1d(top, 2.0), ndi.gaussian_filter1d(bot, 2.0)

def samp(x, y):
    return np.stack([ndi.map_coordinates(im[..., c], [y, x], order=1, mode='nearest') for c in range(3)], -1)

W, H = 512, 1024
u = (np.arange(W) + 0.5) / W; v = 1 - (np.arange(H) + 0.5) / H              # the top row is the wrist end
sl = S0 + (S1 - S0) * v; a = 2 * np.pi * u; ca, sa = np.cos(a), np.sin(a)
layers = {}
for name, (y0, y1, ((x0, _), (x1, _), (x2, _))) in VIEWS.items():
    top, bot = edges(y0, y1)
    x = np.where(sl <= LU, x0 + (x1 - x0) * sl / LU, x1 + (x2 - x1) * (sl - LU) / LF)
    x = np.clip(x, x0 + (x1 - x0) * 0.022 / LU, x2 + 6)                       # nearer the body than this the painted edges are her armpit and chest
    xi = np.clip(np.round(x).astype(int), 0, im.shape[1] - 1); tt, bb = top[xi], bot[xi]
    t = 0.5 - 0.455 * ca                                                      # 0 the top line, 1 the bottom line; kept a little inside both
    X = np.repeat(x[:, None], W, 1); Y = tt[:, None] + (bb - tt)[:, None] * t[None, :]
    layers[name] = samp(X, Y)
wf = np.clip((sa + 0.35) / 0.70, 0, 1); wf = wf * wf * (3 - 2 * wf)
tex = layers['front'] * wf[None, :, None] + layers['back'] * (1 - wf[None, :, None])
# keep the painting's fine marks and half of its light; bring the whole to the plain arm colour
vis = (sl > 0.06) & (sl < 0.42)
row = ndi.gaussian_filter1d(tex.mean(1), 30, axis=0, mode='nearest')                       # the tone drifts along the painted arm: take most of that out
tex = tex * ((row[vis].mean(0) / row) ** 0.8)[:, None, :]
lp = np.stack([ndi.gaussian_filter(tex[..., c], (46, 40), mode=('nearest', 'wrap')) for c in range(3)], -1)
rm = lp.mean(1, keepdims=True)
flat = tex * (rm / lp) ** 0.5
flat *= skin / flat[vis].reshape(-1, 3).mean(0)
k = np.clip((sl - 0.004) / 0.060, 0, 1) * np.clip((0.447 - sl) / 0.045, 0, 1); k = (k * k * (3 - 2 * k))[:, None, None]   # plain at the shoulder and at the wrist
flat = skin * (1 - k) + flat * k
b_ = io.BytesIO(); Image.fromarray(np.clip(flat, 0, 255).astype(np.uint8)).save(b_, 'JPEG', quality=90, subsampling=0)
T['arms'] = 'data:image/jpeg;base64,' + base64.b64encode(b_.getvalue()).decode()
Image.fromarray(np.clip(flat, 0, 255).astype(np.uint8)).save(ROOT + 'shots/bake_arms.jpg', quality=90)
js = 'window.IO_TEX=' + json.dumps(T, separators=(',', ':')) + ';'
open(OUT + 'io_tex.js', 'w').write(js); print('io_tex.js', len(js) // 1024, 'KB; arms', len(T['arms']) // 1024, 'KB; mean', flat[vis].reshape(-1, 3).mean(0).round(1), 'skin', skin)
