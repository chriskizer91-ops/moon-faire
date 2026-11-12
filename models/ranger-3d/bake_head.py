# The Ranger's head textures, cut from her paintings and added to out/ranger_tex.js (window.RANGER_TEX). Run after bake_ranger.py.
#   face     : the front painting C1 (4541 pixels a metre), laid on the window x -0.1..0.1 m, height 1.380..1.580 m.
#              Its rows are moved a little so eyes, nose, mouth and chin sit at the heights of her profile (C3), which shapes the head.
#   faceSide : the profile painting C3 (1837 pixels a metre) on the window forward -0.075..0.125 m, height 1.380..1.580 m.
#   Headband, gem, earrings and background are painted out of both, because those are real objects on the model.
# The paintings are data: run with python3 -I.
import sys, io, json, base64
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, '/home/claude/ranger/tools')
from sil import load, mask_of
REF = '/home/claude/ranger/refs/'; OUT = '/home/claude/ranger/out/'; SH = '/home/claude/ranger/shots/'
def uri(a, q=92):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=q, subsampling=0)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
def blue_band(a):                                   # the headband's cloth: clearly blue, with its orange stitching closed in
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (b - r > 18) & (b - g > 8) & (b > 60)
    m = ndi.binary_opening(m, iterations=1); m = ndi.binary_closing(m, iterations=14); m = ndi.binary_fill_holes(m)
    lab, n = ndi.label(m)
    if n: sizes = ndi.sum(m, lab, range(1, n + 1)); m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 3000])
    return ndi.binary_dilation(m, iterations=5)
def fill(a, bad, soft=2.0):                         # paint over the bad pixels with the nearest good ones, softened
    idx = ndi.distance_transform_edt(bad, return_distances=False, return_indices=True)
    f = a[idx[0], idx[1]]; g = np.stack([ndi.gaussian_filter(f[..., c], soft) for c in range(3)], -1)
    w = ndi.gaussian_filter(bad.astype(np.float32), 1.5)[..., None]
    return a * (1 - w) + g * w
def fill_down(a, band):                             # paint out the headband with whatever lies just below it in each column: brow skin in front, hair at the temples
    out = a.copy(); H = a.shape[0]
    for x in np.nonzero(band.any(0))[0]:
        col = band[:, x]; d = np.diff(np.concatenate([[0], col.astype(np.int8), [0]])); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
        for r0, r1 in zip(st, en):
            if r1 + 4 < H: out[r0:r1 + 3, x] = a[r1 + 3:min(H, r1 + 10), x].mean(0)
    w = ndi.gaussian_filter(ndi.binary_dilation(band, iterations=4).astype(np.float32), 2.0)[..., None]
    g = np.stack([ndi.gaussian_filter(out[..., c], (3, 14)) for c in range(3)], -1)
    return a * (1 - w) + g * w
def paint_out(a, boxes, grow=6, rad=9):             # jewellery inside the boxes: gold and blue beads are repainted from the skin and hair round them
    import cv2
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; m = np.zeros(a.shape[:2], bool)
    for x0, y0, x1, y1 in boxes:
        sel = np.zeros_like(m); sel[y0:y1, x0:x1] = True
        m |= sel & (((r - b > 92) & (g - b > 40)) | (b > r + 4))
    m = ndi.binary_dilation(ndi.binary_closing(m, iterations=4), iterations=grow)
    out = cv2.inpaint(np.clip(a, 0, 255).astype(np.uint8), m.astype(np.uint8) * 255, rad, cv2.INPAINT_TELEA).astype(np.float32)
    return out, m
def sample(a, rows, cols):
    return np.stack([ndi.map_coordinates(a[..., c], [rows, cols], order=1, mode='nearest') for c in range(3)], -1)

txt = open(OUT + 'ranger_tex.js').read(); T = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
for k in [k for k in T if k.startswith('hc')]: del T[k]                # pictures from an abandoned trial

# ---------- front ----------
C1 = load(REF + 'C1.png')
band = blue_band(C1) & (np.arange(C1.shape[0])[:, None] < 640)
for x0, y0, x1, y1 in ((560, 190, 706, 352), (606, 330, 660, 414)): band[y0:y1, x0:x1] = True     # the gem and its drop
front = fill_down(C1, band)
front, em = paint_out(front, ((300, 800, 400, 1090), (870, 800, 970, 1090)))                        # both earrings
Image.fromarray(front.astype(np.uint8)).resize((627, 627)).save(SH + 'bake_c1_clean.jpg', quality=88)
PXM1, MIDX, EYE1 = 4541.0, 633.5, 628.0
EYE_H = 1.512
ANCH = [(EYE_H, 628.0), (1.4660, 822.0), (1.4494, 902.0), (1.4065, 1092.0)]      # height on the model -> row in C1: eyes, under the nose, mouth line, under the chin
def row_of(Y):
    Y = np.asarray(Y, np.float64); r = np.where(Y >= EYE_H, EYE1 - (Y - EYE_H) * PXM1, 0.0)
    for (ya, ra), (yb, rb) in zip(ANCH[:-1], ANCH[1:]):
        sel = (Y < ya) & (Y >= yb); r = np.where(sel, ra + (ya - Y) / (ya - yb) * (rb - ra), r)
    yb, rb = ANCH[-1]; r = np.where(Y < yb, rb + (yb - Y) * PXM1, r)
    return r
S = 1024; FX0, FX1, FY0, FY1 = -0.1, 0.1, 1.380, 1.580
ii, jj = np.mgrid[0:S, 0:S]
Y = FY1 - (ii + 0.5) / S * (FY1 - FY0); X = FX0 + (jj + 0.5) / S * (FX1 - FX0)
face = sample(front, row_of(Y), MIDX + X * PXM1)
T['face'] = uri(face, 93); Image.fromarray(np.clip(face, 0, 255).astype(np.uint8)).save(SH + 'bake_face.jpg', quality=90)

# ---------- side ----------
C3 = load(REF + 'C3.png'); fg3, _ = mask_of(C3)
band3 = blue_band(C3); band3[185:290, 1395:1478] = True; band3[:, :1010] = False                   # the band, the gem and its drop on the profile figure
side_src = fill_down(C3, band3)
side_src, em3 = paint_out(side_src, ((1252, 452, 1316, 600),))                                       # earring
PXM3, NOSE_X, NOSE_Z, EYE3 = 1837.0, 1498.0, 0.107, 381.0
SZ0, SZ1, SY0, SY1 = -0.075, 0.125, 1.380, 1.580; S2 = 512
ii, jj = np.mgrid[0:S2, 0:S2]
Y = SY1 - (ii + 0.5) / S2 * (SY1 - SY0); Z = SZ0 + (jj + 0.5) / S2 * (SZ1 - SZ0)
side = sample(side_src, EYE3 + (EYE_H - Y) * PXM3, NOSE_X + (Z - NOSE_Z) * PXM3)
T['faceSide'] = uri(side, 92); T['faceSideA'] = uri(np.full((8, 8, 3), 255.0), 90); T['faceSideWin'] = [SZ0, SZ1, SY0, SY1]
Image.fromarray(np.clip(side, 0, 255).astype(np.uint8)).save(SH + 'bake_side.jpg', quality=90)

# ---------- hair: four views of her hair, each laid on the hair from its own side (the model mixes them by which way the hair faces) ----------
#   hairSide  : C3 profile, 1837 px/m, window forward -0.16..0.11, height 1.43..1.70 (mirrored for her left side)
#   hairFront : C3 front view, about 1970 px/m, window x -0.135..0.135, height 1.43..1.70
#   hairBack  : C5 from behind, 2000 px/m across and 1836 px/m up (the painting is wider than the front views), same window
#   hairTop   : C8 from above and a little in front, 4200 px/m across and 3393 px/m front to back, window x -0.135..0.135, forward -0.17..0.10
# The headband is painted out with the hair behind it, and the background with the nearest hair, so nothing but hair lands on the hair.
def clean_hair(a, fg, band, mode='up', centre=None):
    band = ndi.binary_dilation(band, iterations=3); good = fg & ~band; out = a.copy(); done = good.copy(); H, W = good.shape
    if mode == 'up':
        for x in np.nonzero(band.any(0))[0]:
            col = band[:, x]; d = np.diff(np.concatenate([[0], col.astype(np.int8), [0]])); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
            for r0, r1 in zip(st, en):
                rs = np.arange(r0, r1); src = np.clip(np.round(r0 - 3 - (rs - r0) * 0.75).astype(int), 0, H - 1); ok = good[src, x]      # the hair above the band, folded down over it
                out[rs[ok], x] = a[src[ok], x]; done[rs[ok], x] = True
                rr = np.arange(max(0, r0 - 16), max(0, r0 - 1)); rr = rr[good[rr, x]] if len(rr) else rr
                if len(rr) and (~ok).any(): out[rs[~ok], x] = a[rr, x].mean(0); done[rs[~ok], x] = True
    else:                                           # seen from above the band is a ring: take the hair just inside it
        cx, cy, ea, eb = centre; ys, xs = np.nonzero(band); rho = np.sqrt(((xs - cx) / ea) ** 2 + ((ys - cy) / eb) ** 2); k = np.clip((1.84 - rho) / np.maximum(rho, 1e-6), 0.3, 1.0)       # folded inward over the band
        sx = np.clip(np.round(cx + (xs - cx) * k).astype(int), 0, W - 1); sy = np.clip(np.round(cy + (ys - cy) * k).astype(int), 0, H - 1); ok = good[sy, sx]
        out[ys[ok], xs[ok]] = a[sy[ok], sx[ok]]; done[ys[ok], xs[ok]] = True
    solid = ndi.binary_fill_holes(ndi.binary_closing(fg, iterations=4)); deep = ndi.binary_erosion(solid, iterations=14) & done       # fill only from well inside the hair: its wispy edge is half background
    idx = ndi.distance_transform_edt(~deep, return_distances=False, return_indices=True); f = out[idx[0], idx[1]]
    w = ndi.gaussian_filter((~done).astype(np.float32), 1.2)[..., None]; g = np.stack([ndi.gaussian_filter(f[..., c], 4.0) for c in range(3)], -1)
    g = 0.6 * g + 0.4 * np.median(out[deep], 0)
    return out * (1 - w) + g * w
HS = 512
def grid2(u0, u1, v0, v1):
    ii, jj = np.mgrid[0:HS, 0:HS]; return u0 + (jj + 0.5) / HS * (u1 - u0), v1 - (ii + 0.5) / HS * (v1 - v0)
# side
raw3, _ = mask_of(C3, 17.0, True); raw3 = ndi.binary_erosion(raw3, iterations=1)
fgs = raw3.copy(); fgs[:, :1012] = False
hs = clean_hair(C3, fgs, band3)
Z, Y = grid2(-0.16, 0.11, 1.43, 1.70); T['hairSide'] = uri(sample(hs, EYE3 + (EYE_H - Y) * PXM3, NOSE_X + (Z - NOSE_Z) * PXM3), 90)
# front
fgf = raw3.copy(); fgf[:, 505:] = False; bandf = blue_band(C3); bandf[:, 505:] = False; bandf[150:300, 240:335] = True
hf = clean_hair(C3, fgf, bandf)
X, Y = grid2(-0.135, 0.135, 1.43, 1.70); T['hairFront'] = uri(sample(hf, 384.0 + (EYE_H - Y) * 1970.0, 287.5 + X * 1970.0), 90)
# back
C5 = load(REF + 'C5.png'); fg5, _ = mask_of(C5, 17.0, True); fgb = ndi.binary_erosion(fg5, iterations=1); fgb[:, :545] = False; fgb[:, 1030:] = False
bandb = blue_band(C5); bandb[:, :545] = False; bandb[:, 1030:] = False
hb = clean_hair(C5, fgb, bandb)
X, Y = grid2(-0.135, 0.135, 1.43, 1.70); T['hairBack'] = uri(sample(hb, 415.0 + (1.4935 - Y) * 1836.0, 782.0 - X * 2000.0), 90)
# top
C8 = load(REF + 'C8.png'); fg8, _ = mask_of(C8, 17.0, True); fg8 = ndi.binary_erosion(fg8, iterations=1); band8 = blue_band(C8); band8[640:945, 545:750] = True
ht = clean_hair(C8, fg8, band8, 'in', (647.0, 400.0, 300.0, 290.0))
ii, jj = np.mgrid[0:HS, 0:HS]; X = -0.135 + (jj + 0.5) / HS * 0.27; Z = -0.17 + (ii + 0.5) / HS * 0.27      # rows run from the back of her head to the front
T['hairTop'] = uri(sample(ht, 790.0 + (Z - 0.082) * 3393.0, 647.0 + X * 4200.0), 90)
T['hairWin'] = dict(side=[-0.16, 0.11, 1.43, 1.70], fb=[-0.135, 0.135, 1.43, 1.70], top=[-0.135, 0.135, -0.17, 0.10])
for k in ('hairSide', 'hairFront', 'hairBack', 'hairTop'):
    Image.open(io.BytesIO(base64.b64decode(T[k].split(',')[1]))).save(SH + 'bake_' + k + '.jpg', quality=88)
hp = C3[130:300, 1080:1200].reshape(-1, 3); lum = hp.mean(1); o = np.argsort(lum)
T['hairCols'] = ['#%02x%02x%02x' % tuple(int(v) for v in hp[o[int(len(o) * q)]]) for q in (0.12, 0.5, 0.92)]
# ---------- headband: the flat strip in F2, without its gem and its pointed ends ----------
F2 = load(REF + 'F2.png'); bm = blue_band(F2[:260]); rows = np.nonzero(bm[:, 200:1300].mean(1) > 0.6)[0]; r0, r1 = rows.min() + 2, rows.max() - 1
strip = F2[r0:r1, 64:1472].copy(); cxs = 768 - 64; strip[:, cxs - 62:cxs + 62] = strip[:, cxs + 62:cxs + 186][:, ::-1]
strip[-int((r1 - r0) * 0.0):, :] = strip[-int((r1 - r0) * 0.0):, :]
bt = np.asarray(Image.fromarray(np.clip(strip, 0, 255).astype(np.uint8)).resize((1024, 64), Image.LANCZOS)).astype(np.float32)
T['band'] = uri(bt, 92); Image.fromarray(bt.astype(np.uint8)).save(SH + 'bake_band.jpg', quality=90); print('band rows', r0, r1, 'hair colours', T['hairCols'])
# skin under the jaw and on the neck: the neck just under her chin in C1, where it is evenly lit
nk = front[1120:1170, 560:710].reshape(-1, 3); T['skinJaw'] = '#%02x%02x%02x' % tuple(int(v) for v in np.median(nk, 0))
print('skinJaw', T['skinJaw'], 'skinChest', T.get('skinChest'))
js = 'window.RANGER_TEX=' + json.dumps(T, separators=(',', ':')) + ';'
open(OUT + 'ranger_tex.js', 'w').write(js); print('ranger_tex.js', len(js) // 1024, 'KB', list(T.keys()))
