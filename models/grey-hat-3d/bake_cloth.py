# The cloth of his trousers as one square that repeats, for src/N46_trousers.js (stage 2 of the rebuild).
# F8 is a flat sample of the cloth: three repeats across and three down (one repeat is 418 px), with a torn hole in the middle one.
# This takes the top-left repeat, mends the corner of it that the hole's frayed edge reaches with the same corner of the bottom-right
# repeat (which the hole does not reach), and turns F8's flat colours (pure black, bright red) into the tones the same cloth has on him
# in B1, so the new trousers sit beside the painted shirt, corset and boots.
# Writes out/tex_cloth.json = { cloth: picture, clothTile: how many metres one repeat covers on him }.
# The size on him: in B1's back view the flowers are 7.8 cm apart (nearest neighbours, tools/trouser_measure.py); in F8 they are
# 260 px apart, which gives 12.5 cm for one repeat. B1's flowers also repeat every 9.8 cm across and 11.9 cm up. 11.5 cm is used.
# usage: python3 -I bake_cloth.py [check.png]      (then ./build.sh joins it into out/noiz_tex.js)
import os, io, sys, json, base64, numpy as np
ROOT = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(ROOT, 'tools'))
from sil import load
from PIL import Image
from scipy import ndimage as ndi
P, OUT, TILE_M = 418, 512, 0.115
a = load(os.path.join(ROOT, 'refs', 'F8.png'))
ys, xs = np.mgrid[0:a.shape[0], 0:a.shape[1]]
hole = ((xs - 627) / 545.0) ** 2 + ((ys - 627) / 290.0) ** 2 < 1          # the hole with its frayed edge and some room
far = ndi.distance_transform_edt(~hole)                                    # how far each pixel is from the hole
t00, t22 = a[0:P, 0:P], a[2 * P:3 * P, 2 * P:3 * P]
k = np.clip(far[0:P, 0:P] / 14.0, 0, 1)[..., None]                         # 0 at the hole's edge, 1 from 14 px away
assert far[2 * P:3 * P, 2 * P:3 * P][k[..., 0] < 1].min() > 20, 'the mending corner is not clear of the hole'
tile = t00 * k + t22 * (1 - k)
# colours: F8's black (15,16,15) and red (172,5,19) become B1's (measured on the seat and legs of the back view, and the front top)
DARK, RED = np.array([35.0, 27.0, 30.0]), np.array([156.0, 24.0, 32.0])
R, G, B = tile[..., 0], tile[..., 1], tile[..., 2]
t = np.clip((R - np.minimum(G, B) - 0.0) / 160.0, 0, 1.12)                 # how red the print is here
grain = (np.minimum(G, B) - 12.0) * 0.9                                    # the weave, read off the channels the red does not use
res = DARK + t[..., None] * (RED - DARK) + grain[..., None] * (1 - 0.7 * np.clip(t, 0, 1))[..., None]
res = np.clip(res, 0, 255)
im = Image.fromarray(res.astype(np.uint8)).resize((OUT, OUT), Image.LANCZOS)
b = io.BytesIO(); im.save(b, 'JPEG', quality=90)
json.dump({'cloth': 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(), 'clothTile': TILE_M}, open(os.path.join(ROOT, 'out', 'tex_cloth.json'), 'w'))
arr = np.asarray(im).astype(float); seam = max(np.abs(arr[:, 0] - arr[:, -1]).mean(), np.abs(arr[0] - arr[-1]).mean()); inner = np.abs(arr[:, 1:] - arr[:, :-1]).mean()
print('cloth tile %d px, %.1f cm on him, %d KB; mean colour %s; step across the join %.1f (between neighbours inside %.1f)' % (OUT, TILE_M * 100, len(b.getvalue()) // 1024, arr.reshape(-1, 3).mean(0).round(0), seam, inner))
if len(sys.argv) > 1:
    sh = Image.new('RGB', (OUT * 2, OUT * 2)); [sh.paste(im, (i * OUT, j * OUT)) for i in range(2) for j in range(2)]; sh.save(sys.argv[1])
