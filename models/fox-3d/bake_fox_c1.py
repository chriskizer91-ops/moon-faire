# Bakes the Fox's reference paintings into the texture pack her model loads: out/fox_tex.js (window.FOX_TEX).
# Run with: python3 -I bake_fox.py     (the paintings in refs/ are data only)
#   face   C1: the close-up without glasses, set onto the head's face window so the eyes and the lip line land on the model's
#   body   B1 (no belt, front and back) above the waist and B4 (legs, front and back) below it: one atlas [front | back];
#          each row of the painting is laid across the model's own torso width at that height, as a straight-on camera sees it
# The torso's widths are read from src/30_body.js, so the model and this script cannot disagree.
import re, json, io, base64, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = '/home/claude/fox3d/'; IN = ROOT + 'refs/'; OUT = ROOT + 'out/'
FOX_K = 1.045
def uri(im, q=88):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, subsampling=0); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
def arr(im): return np.asarray(im.convert('RGB')).astype(np.float32)
def img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def fill(a, valid, sig):
    w = ndi.gaussian_filter(valid, sig) + 1e-4; return np.stack([ndi.gaussian_filter(a[..., c] * valid, sig) / w for c in range(3)], -1), w
def backdrop(a, tol=(15, 13, 15)):
    bgc = np.median(np.concatenate([a[:12, :12].reshape(-1, 3), a[:12, -12:].reshape(-1, 3)]), 0); l = a.mean(-1)
    flat = np.sqrt(np.maximum(ndi.uniform_filter(l ** 2, 5) - ndi.uniform_filter(l, 5) ** 2, 0)) < 5
    cand = (np.abs(a[..., 0] - bgc[0]) < tol[0]) & (np.abs(a[..., 1] - bgc[1]) < tol[1]) & (np.abs(a[..., 2] - bgc[2]) < tol[2]) & flat
    lab, _ = ndi.label(cand); e = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    return ndi.binary_dilation(np.isin(lab, e[e > 0]), iterations=2)
T = {}

# ---------------- the face (C1) ----------------
# Landmarks read off a gridded copy of C1 (pixels): both pupils, the line between the lips, brow, nostrils, chin, hairline.
EYE_Y, D_EM, S = 1.5246, 0.066, 1024            # the model's eye height and eye-to-lip distance, and the canvas size
WIN = (-0.1, 0.1, 1.385, 1.585)
N_EYE = ((435, 497), (822, 497)); N_MOUTH = (630, 893); N_BROW = 390; N_NOSE = 745; N_CHIN = 1198; N_HAIR = 190
PPM = (N_MOUTH[1] - N_EYE[0][1]) / D_EM; CX = (N_EYE[0][0] + N_EYE[1][0]) / 2; K = S / 0.2 / PPM
def n2c(x, y): return ((x - CX) / PPM - WIN[0]) / 0.2 * S, (WIN[3] - (EYE_Y - (y - N_EYE[0][1]) / PPM)) / 0.2 * S
def warp(src, sx, tx, ty): return src.convert('RGB').transform((S, S), Image.AFFINE, (sx, 0, tx, 0, sx, ty), Image.BICUBIC)
c1 = Image.open(IN + 'C1.png'); x0, y0 = n2c(0, 0)
base = arr(warp(c1, 1 / K, -x0 / K, -y0 / K))
inside = arr(warp(Image.new('RGB', c1.size, (255, 255, 255)), 1 / K, -x0 / K, -y0 / K))[..., 0] > 250
bd = arr(warp(img(np.repeat(backdrop(arr(c1))[..., None] * 255.0, 3, 2)), 1 / K, -x0 / K, -y0 / K))[..., 0] > 128
# the face itself: an oval from the hairline to under the chin; outside it (hair, ears' far edges, backdrop) her skin is carried outward
jj, ii = np.mgrid[0:S, 0:S]; ex0, ey0 = n2c(CX, (N_HAIR + N_CHIN) / 2 + 30); rx_, ry_ = 395 * K, 560 * K
oval = ((ii - ex0) / rx_) ** 2 + ((jj - ey0) / ry_) ** 2 < 1
valid = (oval & inside & ~bd).astype(np.float32)
fx, fy = n2c(540, 250); gx, gy = n2c(720, 340); skin = np.median(base[int(fy):int(gy), int(fx):int(gx)].reshape(-1, 3), 0)
f1, w1 = fill(base, valid, 16); f2, w2 = fill(base, valid, 60); t1 = np.clip(w1 * 3, 0, 1)[..., None]; t2 = np.clip(w2 * 4, 0, 1)[..., None]
ext = f1 * t1 + (f2 * t2 + skin * (1 - t2)) * (1 - t1)
keep = ndi.gaussian_filter(ndi.binary_erosion(valid > 0.5, iterations=10).astype(np.float32), 8)[..., None]; face = base * keep + ext * (1 - keep)
T['face'] = uri(img(face), 90); T['skin'] = '#%02x%02x%02x' % tuple(int(v) for v in skin)
jx0, jy0 = n2c(480, 1090); jx1, jy1 = n2c(780, 1160); T['skinJaw'] = '#%02x%02x%02x' % tuple(int(v) for v in np.median(face[int(jy0):int(jy1), int(jx0):int(jx1)].reshape(-1, 3), 0))
ex = (N_EYE[1][0] - N_EYE[0][0]) / 2 / PPM
T['layout'] = {'eyeY': EYE_Y, 'eyeX': round(ex, 4), 'mouthY': round(EYE_Y - D_EM, 4), 'noseY': round(EYE_Y - (N_NOSE - N_EYE[0][1]) / PPM, 4), 'browY': round(EYE_Y + (N_EYE[0][1] - N_BROW) / PPM, 4),
               'chinY': round(EYE_Y - (N_CHIN - N_EYE[0][1]) / PPM, 4), 'bandY': round(EYE_Y + (N_EYE[0][1] - N_HAIR) / PPM, 4)}
T['faceEyes'] = [[round(n2c(*N_EYE[i])[0] / S, 4), round(n2c(*N_EYE[i])[1] / S, 4)] for i in (0, 1)]
T['faceParts'] = {}
print('face: pixels a metre', round(PPM), 'skin', T['skin'], T['layout'])

# ---------------- the bodice and hips: [front | back] ----------------
src = open(ROOT + 'src/30_body.js').read()
TY0, TY1 = [float(v) for v in re.search(r'const TY0 = ([\d.]+), TY1 = ([\d.]+);', src).groups()]
TORSO = json.loads(re.search(r'const TORSO = (\[\[.*?\]\]\]);', src, re.S).group(1))
def spline(Kt, x, c):
    n = len(Kt); i = 0
    while i < n - 2 and Kt[i + 1][0] < x: i += 1
    x0, x1 = Kt[i][0], Kt[i + 1][0]; dx = x1 - x0; t = min(1, max(0, (x - x0) / dx)); t2 = t * t; t3 = t2 * t
    g = lambda j: Kt[j][1][c]; v0, v1 = g(i), g(i + 1)
    m0 = (v1 - g(i - 1)) / (x1 - Kt[i - 1][0]) if i > 0 else (v1 - v0) / dx; m1 = (g(i + 2) - v0) / (Kt[i + 2][0] - x0) if i < n - 2 else (v1 - v0) / dx
    return (2 * t3 - 3 * t2 + 1) * v0 + (t3 - 2 * t2 + t) * dx * m0 + (-2 * t3 + 3 * t2) * v1 + (t3 - t2) * dx * m1
# each painting: pixels a metre, the row of the soles, the centre column of the front figure and of the back figure
B1 = dict(a=arr(Image.open(IN + 'B1.png')), S=572.4, sole=1001.0, cf=467.0, cb=1067.0)
B4 = dict(a=arr(Image.open(IN + 'B4.png')), S=851.0, sole=970.0, cf=324.5, cb=1215.5)
OW, OH = 512, 768
def samp(a, x, y): return np.stack([ndi.map_coordinates(a[..., c], [y, x], order=1, mode='nearest') for c in range(3)], -1)
def half(back):
    out = np.zeros((OH, OW, 3), np.float32)
    f = np.arange(OW) / (OW - 1)
    for j in range(OH):
        yJ = TY1 - j / (OH - 1) * (TY1 - TY0); h = yJ * FOX_K; rx = spline(TORSO, yJ, 0) * FOX_K
        x = (2 * f - 1) * rx                      # her right to her left across the front half; her left to her right across the back half
        def row(P):
            px = (P['cb'] + x * P['S']) if back else (P['cf'] + x * P['S'])
            return samp(P['a'], px, np.full(OW, P['sole'] - h * P['S']))
        w = min(1, max(0, (h - 1.088) / 0.018))   # B4 below the waist of the corset, B1 above it
        r = np.zeros((OW, 3), np.float32)
        if w < 1: r += (1 - w) * row(B4)
        if w > 0: r += w * row(B1)
        out[j] = r
    return out
fr = half(False); bk = half(True)
# In the back half the atlas runs from her left to her right, which is the back-view painting read left to right: no flip is needed.
atlas = np.concatenate([fr, bk], 1)
# below the crotch the paintings show the gap between her legs: carry the charcoal across
# the leggings in the paintings become the plain charcoal the legs themselves wear (#3a393d), so hips and legs read as one cloth
lum = atlas.mean(-1); chroma = atlas.max(-1) - atlas.min(-1); rows = np.arange(OH)[:, None] * np.ones((1, 2 * OW))
jw = (TY1 - 1.03) / (TY1 - TY0) * (OH - 1)        # only below the bottom of the corset
legg = (chroma < 26) & (lum < 120) & (rows > jw); legg = ndi.binary_closing(ndi.binary_opening(legg, iterations=2), iterations=3)
jc = (TY1 - 0.815) / (TY1 - TY0) * (OH - 1); legg |= rows > jc
soft = ndi.gaussian_filter(legg.astype(np.float32), 1.6)[..., None]; atlas = atlas * (1 - soft) + np.array([58.0, 57.0, 61.0]) * soft
T['body'] = uri(img(atlas), 90)
img(atlas).save(ROOT + 'shots/bake_body.png'); img(face).save(ROOT + 'shots/bake_face.png')
js = 'window.FOX_TEX=' + json.dumps(T, separators=(',', ':')) + ';'; open(OUT + 'fox_tex.js', 'w').write(js); print('fox_tex.js', len(js) // 1024, 'KB', list(T.keys()))
