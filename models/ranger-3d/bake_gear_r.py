# bake_gear_r.py: the leather of her belts, satchel and pouch, cut from painting F6 (her belt gear laid out as separate objects).
# Adds to out/ranger_tex.js:
#   gear        1024 x 1024: the satchel's front, back and side, the pouch's front, and a plain patch of the same leather
#   gearLayout  for each piece: where it is in the picture [x, y, w, h] and which part of F6 it came from [x0, y0, x1, y1],
#               so the model can find any spot of the painting on the picture
#   beltTex     one stud's length of belt (leather, stitched edges, the stud in the middle), made to repeat without a seam
#   beltPitch   how long that length is on her, in metres
# The purple backdrop is painted over with the nearest leather, so edges never show it.
# Scale: the satchel is 450 px across in F6 and 20 cm across on her (A1, A3): 0.444 mm a pixel. The belts are 2.2 cm wide on her (A1, A2).
# Run after the other bakes:  python3 -I bake_gear_r.py
import sys, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = '/home/claude/ranger/'; OUT = ROOT + 'out/'; SH = ROOT + 'shots/'
a = np.asarray(Image.open(ROOT + 'refs/F6.png').convert('RGB')).astype(np.float32); H, W = a.shape[:2]
bg = np.median(np.concatenate([a[:14, :14].reshape(-1, 3), a[-14:, -14:].reshape(-1, 3), a[:14, -14:].reshape(-1, 3)]), 0)
d = np.sqrt(((a - bg) ** 2).sum(-1)); obj = ndi.binary_fill_holes(ndi.binary_opening(d > 26, iterations=1))
# leather carried outward past every outline
valid = ndi.binary_erosion(obj, iterations=3)
dist, (iy, ix) = ndi.distance_transform_edt(~valid, return_indices=True)
near = a[iy, ix]; soft = np.stack([ndi.gaussian_filter(near[..., c], 4) for c in range(3)], -1)
wv = valid.astype(np.float32)[..., None]; ext = a * wv + (near * 0.4 + soft * 0.6) * (1 - wv)

PIECES = {   # name: box in F6 (x0, y0, x1, y1), place in the picture (x, y, w, h)
    'satFront': ((40, 432, 520, 942), (0, 0, 480, 510)),
    'satBack': ((736, 432, 1206, 942), (480, 0, 448, 486)),
    'satSide': ((524, 432, 716, 942), (0, 512, 192, 510)),
    'pouchFront': ((1262, 492, 1488, 880), (200, 512, 226, 388)),
}
S = 1024; atlas = np.zeros((S, S, 3), np.float32); layout = {}
# the plain patch: a clean stretch of the satchel's back, away from seams and loops
patch = a[730:900, 900:1050]; atlas[:] = np.median(patch.reshape(-1, 3), 0)
for name, ((x0, y0, x1, y1), (px, py, pw, ph)) in PIECES.items():
    im = Image.fromarray(np.clip(ext[y0:y1, x0:x1], 0, 255).astype(np.uint8)).resize((pw, ph), Image.LANCZOS)
    atlas[py:py + ph, px:px + pw] = np.asarray(im); layout[name] = [px, py, pw, ph, x0, y0, x1, y1]
ph_, pw_ = 300, 300; tile = np.asarray(Image.fromarray(np.clip(patch, 0, 255).astype(np.uint8)).resize((pw_, ph_), Image.LANCZOS)).astype(np.float32)
atlas[560:560 + ph_, 480:480 + pw_] = tile; layout['plain'] = [480, 560, pw_, ph_, 900, 730, 1050, 900]

# ---- one stud's length of belt ----
by0, by1 = 122, 203                                             # the first belt's leather, edge to edge
row = a[(by0 + by1) // 2 - 6:(by0 + by1) // 2 + 6, 170:1460]; lum = row.mean((0, 2)); sat = (row.max(2) - row.min(2)).mean(0)
metal = ndi.gaussian_filter1d((lum > 105) * (sat < 40) * 1.0, 3)  # studs are pale and grey
peaks = [x for x in range(8, len(metal) - 8) if metal[x] > 0.35 and metal[x] == metal[x - 8:x + 9].max()]
peaks = [p for i, p in enumerate(peaks) if i == 0 or p - peaks[i - 1] > 30]
xs = np.array(peaks) + 170; pitch_px = float(np.median(np.diff(xs)))
k = len(xs) // 2; x0 = int(round(xs[k] - pitch_px / 2)); x1 = int(round(xs[k] + pitch_px / 2))
strip = ext[by0:by1, x0:x1].copy(); n = strip.shape[1]; f = 10
for i in range(f):                                               # the two ends are faded into each other so the length repeats
    t = (i + 0.5) / f; l = strip[:, i].copy(); r = strip[:, n - f + i].copy(); strip[:, n - f + i] = r * (1 - t) + l * t
belt = np.asarray(Image.fromarray(np.clip(strip, 0, 255).astype(np.uint8)).resize((128, 128), Image.LANCZOS))
BELT_W = 0.022; mm_px = BELT_W / (by1 - by0); pitch_m = pitch_px * mm_px
print('studs found', len(xs), 'pitch %.1f px = %.1f mm on her; belt %d px wide' % (pitch_px, pitch_m * 1000, by1 - by0))

def uri(arr, q=90):
    b = io.BytesIO(); Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(), len(b.getvalue()) // 1024
txt = open(OUT + 'ranger_tex.js').read(); T = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
T['gear'], k1 = uri(atlas); T['beltTex'], k2 = uri(belt, 92); T['gearLayout'] = layout; T['beltPitch'] = round(pitch_m, 5)
js = txt[:txt.index('{')] + json.dumps(T, separators=(',', ':')) + ';'; open(OUT + 'ranger_tex.js', 'w').write(js)
Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8)).save(SH + 'bake_gear.jpg', quality=88); Image.fromarray(belt).resize((384, 384), Image.NEAREST).save(SH + 'bake_belt.png')
print('gear', k1, 'KB; beltTex', k2, 'KB; ranger_tex.js', len(js) // 1024, 'KB')
