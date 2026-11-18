# The surfaces of his hat, belt, pouch and scroll, for src/N48_gear.js (stage 6): four small repeating squares cut from painting F13
# (the material squares): the grey wool felt, the black belt leather, the brown pouch leather and the parchment.
# Each is cropped well inside its square, its own uneven light is flattened (a blotch would show as a repeating stain), its edges are
# cross-faded into each other so it repeats, and it is toned to the colour that thing has on him in the paintings:
#   felt       C5 and C10 (the hat on him and alone)      belt     F10 (the belt laid out)
#   pouch      F10 (the pouch from the front)             parch    F11 and G1 (the scroll)
# Writes out/tex_gear.json = { felt, beltL, pouchL, parch (pictures), feltTile, beltTile, pouchTile, parchTile (metres one repeat covers) }.
# usage: python3 -I bake_gear.py [check.png]      (then ./build.sh joins it into out/noiz_tex.js)
import os, io, sys, json, base64, numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: np.asarray(Image.open(os.path.join(ROOT, 'refs', n)).convert('RGB')).astype(float)
a = rd('F13.png')
def med(name, box):          # the middle colour of a box of a painting (x0, y0, x1, y1)
    b = rd(name)[box[1]:box[3], box[0]:box[2]].reshape(-1, 3); return np.median(b, 0)
TONES = {'felt': (med('C10.png', (150, 400, 330, 470)) + med('C5.png', (215, 215, 330, 265))) / 2, 'beltL': med('F10.png', (120, 150, 560, 200)), 'pouchL': med('F10.png', (90, 720, 180, 860)), 'parch': med('F11.png', (840, 625, 950, 720))}
CROPS = {'felt': (40, 120, 360, 460), 'parch': (1175, 120, 1500, 460), 'beltL': (420, 555, 740, 890), 'pouchL': (795, 555, 1120, 890)}
KEEP = {'felt': 1.45, 'parch': 0.8, 'beltL': 0.85, 'pouchL': 0.9}      # how much of the square's own grain is kept
TILE = {'felt': 0.12, 'parch': 0.16, 'beltL': 0.075, 'pouchL': 0.11}  # metres one repeat covers on him
F = 44
def fold(x, axis):
    n = x.shape[axis] - F; k = np.linspace(0, 1, F); k = k.reshape((-1, 1, 1) if axis == 0 else (1, -1, 1))
    head, tail = np.take(x, range(F), axis), np.take(x, range(n, n + F), axis); body = np.take(x, range(F, n), axis)
    return np.concatenate([head * k + tail * (1 - k), body], axis)
def enc(im):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=88); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(), len(b.getvalue()) // 1024
out = {}; pics = []
print('surface   toned to (r g b)     KB   step across the join (inside)')
for k, (x0, y0, x1, y1) in CROPS.items():
    L = a[y0:y1, x0:x1]; L = L - ndi.gaussian_filter(L, (36, 36, 0)) + L.mean((0, 1))
    L = fold(fold(L, 0), 1); L = (L - L.mean((0, 1))) * KEEP[k] + TONES[k]
    im = Image.fromarray(np.clip(L, 0, 255).astype(np.uint8)).resize((256, 256), Image.LANCZOS); d, kb = enc(im); out[k] = d; out[k + 'Tile'] = TILE[k]; pics.append(im)
    arr = np.asarray(im).astype(float); print('%-8s  %-18s  %3d   %.1f (%.1f)' % (k, TONES[k].round(0), kb, np.abs(arr[:, 0] - arr[:, -1]).mean(), np.abs(arr[:, 1:] - arr[:, :-1]).mean()))
json.dump(out, open(os.path.join(ROOT, 'out', 'tex_gear.json'), 'w'))
if len(sys.argv) > 1:
    sh = Image.new('RGB', (4 * 512, 512), (59, 47, 67)); [sh.paste(p, (n * 512 + i * 256, j * 256)) for n, p in enumerate(pics) for i in range(2) for j in range(2)]; sh.save(sys.argv[1])
