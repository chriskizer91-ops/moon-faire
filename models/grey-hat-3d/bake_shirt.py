# The cloth of his shirt, for src/N47_shirt.js (stage 3 of the rebuild): two small pictures cut from painting F13 (the material squares).
#   linen   the cream linen square, made to repeat (its edges are cross-faded into each other), toned to the shirt of B1
#   lace, laceMask   one repeat of the lace band (a flower and the scallop under it), stored 128 x 256 (squeezed: sizes that are powers of
#           two repeat on every phone) as two plain pictures: the thread's colour everywhere, and a mask that is white where there is thread.
#           Where the painting has a hole the lace has a hole. It repeats sideways only; its top is the solid heading, its bottom the scallops.
#           (Two pictures and no see-through one: a see-through picture goes dark at the edge of every thread when it is drawn small.)
# The tones: B1's shirt in plain light is about (203, 171, 149) (tools/shirt_measure.py, back view); F13's linen is lighter and yellower.
# Writes out/tex_shirt.json = { linen, lace, laceMask, linenTile: metres one repeat of the linen covers on him, laceAspect: width / height of the lace repeat }.
# usage: python3 -I bake_shirt.py [check.png]      (then ./build.sh joins it into out/noiz_tex.js)
import os, io, sys, json, base64, numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = os.path.dirname(os.path.abspath(__file__))
a = np.asarray(Image.open(os.path.join(ROOT, 'refs', 'F13.png')).convert('RGB')).astype(float)
TONE = np.array([223.0, 190.0, 155.0])      # set by comparing pictures of the model with B1 (tools/shirt_cmp.py), not by B1's own pixel values: the model's light takes about a tenth off
def enc(im, fmt):
    b = io.BytesIO(); im.save(b, fmt, **({'quality': 90} if fmt == 'JPEG' else {'optimize': True})); return 'data:image/%s;base64,' % fmt.lower() + base64.b64encode(b.getvalue()).decode(), len(b.getvalue()) // 1024
# --- linen: crop, flatten the square's own uneven light, cross-fade the edges so it repeats, tone ---
L = a[116:466, 410:750]; H, W = L.shape[:2]
L = L - ndi.gaussian_filter(L, (40, 40, 0)) + L.mean((0, 1))                 # keep the weave, drop the blotches (they would show as a repeating stain)
F = 48                                                                       # px of overlap
def fold(x, axis):
    n = x.shape[axis] - F; k = np.linspace(0, 1, F); k = k.reshape((-1, 1, 1) if axis == 0 else (1, -1, 1))
    head, tail = np.take(x, range(F), axis), np.take(x, range(n, n + F), axis); body = np.take(x, range(F, n), axis)
    return np.concatenate([head * k + tail * (1 - k), body], axis)
L = fold(fold(L, 0), 1)
L = (L - L.mean((0, 1))) * 0.62 + TONE                                       # a quieter weave than the close-up square: on him it is seen from metres away
lin = Image.fromarray(np.clip(L, 0, 255).astype(np.uint8)).resize((256, 256), Image.LANCZOS)
# --- lace: one repeat, alpha from "is it thread" ---
X0, X1, Y0, Y1 = 898, 1034, 100, 470
C = a[Y0:Y1, X0:X1]
thread = np.clip((C[..., 0] - 105.0) / 60.0, 0, 1) * np.clip((C[..., 0] - C[..., 2] - 8.0) / 25.0, 0, 1)
thread = ndi.gaussian_filter(thread, 0.6)
col = (C - np.array([226.0, 199.0, 166.0])) * 0.75 + TONE + 6                # same tone as the linen, a touch lighter
col[thread < 0.3] = TONE * 0.82                                              # no plum fringe where the cut passes
lace = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).resize((128, 256), Image.LANCZOS)
mask = Image.fromarray((thread * 255).astype(np.uint8)).resize((128, 256), Image.LANCZOS)
d1, k1 = enc(lin, 'JPEG'); d2, k2 = enc(lace, 'JPEG'); d3, k3 = enc(mask.convert('RGB'), 'JPEG')
json.dump({'linen': d1, 'lace': d2, 'laceMask': d3, 'linenTile': 0.055, 'laceAspect': (X1 - X0) / (Y1 - Y0)}, open(os.path.join(ROOT, 'out', 'tex_shirt.json'), 'w'))
arr = np.asarray(lin).astype(float)
print('linen %d KB, mean colour %s, step across the join %.1f (inside %.1f); lace %d KB, %.0f%% thread' % (k1, arr.reshape(-1, 3).mean(0).round(0), np.abs(arr[:, 0] - arr[:, -1]).mean(), np.abs(arr[:, 1:] - arr[:, :-1]).mean(), k2 + k3, 100 * (thread > 0.5).mean()))
if len(sys.argv) > 1:
    sh = Image.new('RGB', (512 + 384, 512), (59, 47, 67)); [sh.paste(lin, (i * 256, j * 256)) for i in range(2) for j in range(2)]; [sh.paste(lace.resize((128, 348)), (512 + i * 128, 80), mask.resize((128, 348))) for i in range(3)]; sh.save(sys.argv[1])
