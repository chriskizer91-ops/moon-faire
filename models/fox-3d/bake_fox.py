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

# ---------------- the face (C3: her head from the front, at 45 degrees and in true profile, painted as one sheet) ----------------
# The head is shaped to this sheet's profile (meas/fox_headfit.py), so the face comes from the same sheet: front panel on the front, profile panel on the sides.
import json as _json
HM = _json.load(open(ROOT + 'meas/fox_head.json')); RW = HM['rows']
EYE_Y, D_EM, S = 1.5246, 0.066, 1024            # the model's eye height and eye-to-lip distance, and the canvas size
WIN = (-0.1, 0.1, 1.385, 1.585)
PPM = HM['PPM']; CX = HM['cx']; N_EYE = ((CX - HM['eyeX'] * PPM, HM['eyeRow']), (CX + HM['eyeX'] * PPM, HM['eyeRow'])); N_BROW = HM['eyeRow'] - 27; N_CHIN = RW['men']; N_HAIR = 272
K = S / 0.2 / PPM
def n2c(x, y): return ((x - CX) / PPM - WIN[0]) / 0.2 * S, (WIN[3] - (EYE_Y - (y - N_EYE[0][1]) / PPM)) / 0.2 * S
def warp(src, sx, tx, ty): return src.convert('RGB').transform((S, S), Image.AFFINE, (sx, 0, tx, 0, sx, ty), Image.BICUBIC)
c3 = Image.open(IN + 'C3.png').convert('RGB'); c1 = c3; x0, y0 = n2c(0, 0)
from PIL import ImageFilter
base = arr(warp(c3, 1 / K, -x0 / K, -y0 / K).filter(ImageFilter.UnsharpMask(radius=3, percent=70, threshold=2)))
inside = arr(warp(Image.new('RGB', c3.size, (255, 255, 255)), 1 / K, -x0 / K, -y0 / K))[..., 0] > 250
# the face itself: an oval from the hairline to under the chin; outside it (hair, backdrop) her skin is carried outward
jj, ii = np.mgrid[0:S, 0:S]; ex0, ey0 = n2c(CX, (N_HAIR + N_CHIN) / 2 + 6); rx_, ry_ = 0.0610 * PPM * K, 0.0880 * PPM * K      # kept inside the shade her hair throws on the edge of her face, so that shade is not carried round her cheeks
oval = ((ii - ex0) / rx_) ** 2 + ((jj - ey0) / ry_) ** 2 < 1
# her loose curls cross the corners of the forehead in this panel: anything much darker or browner than skin is left out and filled from the skin beside it
hairish = (base[..., 0] < 138) | (base[..., 0] - base[..., 2] > 108)
_mx = (ii / S * 0.2 + WIN[0]); _my = WIN[3] - jj / S * 0.2; _ex = HM['eyeX']         # eyes, brows, nose and mouth are dark too, and stay
protect = ((((np.abs(_mx) - (_ex - 0.005)) / 0.0215) ** 2 + ((_my - (EYE_Y + 0.006)) / 0.020) ** 2) < 1) | ((np.abs(_mx) < 0.036) & (_my < EYE_Y - 0.012) & (_my > EYE_Y - 0.085)) | ((np.abs(_mx) < 0.020) & (_my < EYE_Y + 0.02) & (_my > EYE_Y - 0.03))
hairish = ndi.binary_dilation(hairish & ~protect, iterations=6)
valid = (oval & inside & ~hairish).astype(np.float32)
fx, fy = n2c(CX - 36, 308); gx, gy = n2c(CX + 36, 334); skin = np.median(base[int(fy):int(gy), int(fx):int(gx)].reshape(-1, 3), 0)
f1, w1 = fill(base, valid, 16); f2, w2 = fill(base, valid, 60); t1 = np.clip(w1 * 3, 0, 1)[..., None]; t2 = np.clip(w2 * 4, 0, 1)[..., None]
ext = f1 * t1 + (f2 * t2 + skin * (1 - t2)) * (1 - t1)
keep = ndi.gaussian_filter(ndi.binary_erosion(valid > 0.5, iterations=8).astype(np.float32), 7)[..., None]; face = base * keep + ext * (1 - keep)
T['face'] = uri(img(face), 90); T['skin'] = '#%02x%02x%02x' % tuple(int(v) for v in skin)
jx0, jy0 = n2c(CX - 45, RW['pg'] + 2); jx1, jy1 = n2c(CX + 45, RW['men'] - 4); T['skinJaw'] = '#%02x%02x%02x' % tuple(int(v) for v in np.median(face[int(jy0):int(jy1), int(jx0):int(jx1)].reshape(-1, 3), 0))
T['layout'] = {'eyeY': EYE_Y, 'eyeX': round(HM['eyeX'], 4), 'mouthY': round(EYE_Y - D_EM, 4), 'noseY': HM['L']['tip'][0], 'browY': round(EYE_Y + 27 / PPM, 4), 'chinY': HM['L']['underChin'][0], 'bandY': round(EYE_Y + (N_EYE[0][1] - N_HAIR) / PPM, 4)}
T['faceEyes'] = [[round(n2c(*N_EYE[i])[0] / S, 4), round(n2c(*N_EYE[i])[1] / S, 4)] for i in (0, 1)]
# ---- the sides of her face, from the profile panel: cheek, jaw and ear. The model decides where it shows, by which way the skin faces. ----
a3 = arr(c3); PX0, PX1, PY0, PY1 = 1180, 1536, 200, 660; c7 = a3[PY0:PY1, PX0:PX1]
skinm = (c7[..., 0] > 140) & (c7[..., 0] - c7[..., 2] > 26) & (c7[..., 0] - c7[..., 2] < 100) & (c7[..., 0] > c7[..., 1] + 8); skinm = ndi.binary_opening(skinm, np.ones((5, 5), bool)); skinm = ndi.binary_closing(skinm, np.ones((9, 9), bool))
lab, nl = ndi.label(skinm); skinm = ndi.binary_fill_holes(lab == (1 + np.argmax(ndi.sum(skinm, lab, range(1, nl + 1)))))
edge = np.array([(len(r) - 1 - np.argmax(r[::-1])) if r.any() else -9999 for r in skinm], float)
tipr, nasr = RW['tip'] - PY0, RW['nas'] - PY0; ZTIP = HM['L']['tip'][1] + 0.002; WINS = (-0.01, 0.13, 1.40, 1.58); OW, OH = 420, 540
jj2, ii2 = np.mgrid[0:OH, 0:OW]; zz = WINS[0] + (ii2 + 0.5) / OW * (WINS[1] - WINS[0]); yy = WINS[3] - (jj2 + 0.5) / OH * (WINS[3] - WINS[2])
rowF = HM['eyeRow'] + (EYE_Y - yy) * PPM; rowP = np.interp(rowF, [0, RW['sn'], HM['mouthRow'], RW['men'], 2000], [0, RW['sn'], RW['st'], RW['men'], 2000])
px = edge[tipr] - (ZTIP - zz) * PPM; py = rowP - PY0
def samp(a, x, y): return np.stack([ndi.map_coordinates(a[..., c], [y, x], order=1, mode='nearest') for c in range(3)], -1)
def sms(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
col = samp(c7, px, py); m = ndi.map_coordinates(ndi.binary_erosion(skinm, iterations=8).astype(np.float32), [py, px], order=1, mode='constant')
ed = np.interp(py[:, 0], np.arange(len(edge)), np.where(edge > -9000, edge, edge[tipr] - 200))[:, None]; behind = ed - px
exx, eyy = edge[nasr] - 0.0227 * PPM, HM['eyeRow'] - PY0 + 2; eye = sms(0.75, 1.15, np.sqrt(((px - exx) / (0.035 * PPM)) ** 2 + ((py - eyy) / (0.019 * PPM)) ** 2))
alpha = ndi.gaussian_filter(m, 2.0) * sms(0.004 * PPM, 0.015 * PPM, behind) * eye * (1 - sms(0.066 * PPM, 0.080 * PPM, behind))      # cheek and jaw only: her ear is left for a modelled ear
okm = (m > 0.9).astype(np.float32); fcol, _ = fill(col, okm, 8); col = col * okm[..., None] + fcol * (1 - okm[..., None])
cx0, cy0 = n2c(CX + 0.048 * PPM, N_EYE[0][1] + (EYE_Y - 1.485) * PPM); front_cheek = face[int(cy0) - 25:int(cy0) + 25, int(cx0) - 20:int(cx0) + 20].reshape(-1, 3).mean(0)
sel = (alpha > 0.9) & (np.abs(yy - 1.485) < 0.012); side_cheek = col[sel].mean(0) if sel.sum() > 50 else front_cheek; g2 = np.clip(front_cheek / side_cheek, 0.70, 1.25); print('side tone gain', np.round(g2, 3), 'opaque share', round(float((alpha > 0.9).mean()), 3))
T['faceSide'] = uri(img(col * g2), 90); T['faceSideA'] = uri(img(np.repeat((alpha * 255)[..., None], 3, -1)), 88); T['faceSideWin'] = list(WINS)
_chk = Image.new('RGB', (S + OW * 2, S), (40, 40, 40)); _chk.paste(img(face), (0, 0)); _chk.paste(img(col * g2), (S, 0)); _chk.paste(img(col * g2 * alpha[..., None] + np.array([0, 255, 0]) * (1 - alpha[..., None])), (S + OW, 0)); _chk.resize((932, 512)).save(ROOT + 'shots/bake_face.png')
# ---- her face states: eyes shut, an "oo" mouth for talking, the open grin. Only the eyes or the mouth are lifted from the expression sheets
# (C14, C16), as soft-edged patches set into the neutral face, with their tone matched to it round the rim. Nothing else moves.
# Every point below was read by eye off a gridded copy (shots/C14_grid.jpg, shots/C16_grid.jpg). Pupils in those sheets are 142 px apart; in C3, 107.5.
c14 = Image.open(IN + 'C14.png').convert('RGB'); c16 = Image.open(IN + 'C16.png').convert('RGB')
def rrect(x0, y0, x1, y1, fe):       # a feathered box, in C3 pixels -> canvas mask
    (a_, b_), (c_, d_) = n2c(x0, y0), n2c(x1, y1); m = np.zeros((S, S), np.float32); f = fe * K; m[int(b_ + f):int(d_ - f), int(a_ + f):int(c_ - f)] = 1; return np.clip(ndi.gaussian_filter(m, f / 1.6), 0, 1)
def patch(sheet, pairs, boxes, fe=7):
    # pairs: [(point in the sheet, the point in C3 it must land on, C3 pixels per sheet pixel)], one per box
    lay = np.zeros((S, S, 3), np.float32); al = np.zeros((S, S), np.float32)
    for (sp, tp, sc), bx in zip(pairs, boxes):
        cx_, cy_ = n2c(*tp); s_ = 1 / (sc * K); w = arr(warp(sheet, s_, sp[0] - cx_ * s_, sp[1] - cy_ * s_)); m = rrect(*bx, fe)
        ring = (m > 0.05) & (m < 0.5); w = w + (face[ring].mean(0) - w[ring].mean(0))
        sel = (m > 0.002)[..., None]; lay = np.where(sel, w, lay); al = np.maximum(al, m)
    ys_, xs_ = np.where(al > 0.01); xa, xb, ya, yb_ = xs_.min(), xs_.max() + 1, ys_.min(), ys_.max() + 1
    rgba = np.dstack([np.clip(lay, 0, 255), al * 255])[ya:yb_, xa:xb].astype(np.uint8); bb = io.BytesIO(); Image.fromarray(rgba, 'RGBA').save(bb, 'WEBP', quality=90, method=6)
    return {'src': 'data:image/webp;base64,' + base64.b64encode(bb.getvalue()).decode(), 'x': round(xa / S, 4), 'y': round(ya / S, 4), 'w': round((xb - xa) / S, 4), 'h': round((yb_ - ya) / S, 4)}, lay, al
EL, ER = (235.0, 381.0), (342.5, 379.0); ERW = HM['eyeRow']; SC14, SC16 = 107.5 / 142.0, 107.5 / 143.2       # C3: her right pupil (image left), her left pupil
EB = [(EL[0] - 38, EL[1] - 24, EL[0] + 38, EL[1] + 22), (ER[0] - 38, ER[1] - 24, ER[0] + 38, ER[1] + 22)]
P = {}
# eyes shut (C14, lower left): the middle of each closed lash line goes a little under where the pupil was
P['shut'], l1, a1 = patch(c14, [((219, 727), (EL[0], EL[1] + 11), SC14), ((365, 727), (ER[0], ER[1] + 11), SC14)], EB)
P['half'] = P['shut']                           # there is no half-shut painting yet; a blink goes straight to shut
# the "oo" mouth (C16, upper right): its pupils are on row 191.8, the middle of the mouth at (1314.6, 356.8)
P['oh'], l3, a3 = patch(c16, [((1314.6, 356.8), (CX, ERW + (356.8 - 191.8) * SC16), SC16)], [(CX - 66, 464, CX + 66, 548)])
# Chris, 12 Nov: no teeth, anywhere. The open grin (C14, upper right) is not used; when she laughs she keeps her closed-lip smile and shuts her eyes.
# Two more talking mouths without teeth, both from C16: lips just parted (upper middle; pupils 141.2 px apart on row 192, mouth middle (804, 349.4))
# and the pucker (lower right; pupils 148.2 px apart on row 702, mouth middle (1319.4, 868.8)).
P['oh2'], l4, a4 = patch(c16, [((804.0, 349.4), (CX, ERW + (349.4 - 192.0) * 107.5 / 141.2), 107.5 / 141.2)], [(CX - 66, 464, CX + 66, 548)])
P['oh3'], l5, a5 = patch(c16, [((1319.4, 868.8), (CX, ERW + (868.8 - 702.0) * 107.5 / 148.2), 107.5 / 148.2)], [(CX - 66, 464, CX + 66, 552)])
T['faceParts'] = P
def comp(lay, al): return img(face * (1 - al[..., None]) + lay * al[..., None]).resize((384, 384), Image.LANCZOS)
_e = Image.new('RGB', (384 * 5, 384)); [_e.paste(c_, (i * 384, 0)) for i, c_ in enumerate((img(face).resize((384, 384), Image.LANCZOS), comp(l1, a1), comp(l3, a3), comp(l4, a4), comp(l5, a5)))]; _e.save(ROOT + 'shots/bake_states.jpg', quality=88)
# ---- tones for her neck: the chest it rises from (painting B1) and the jaw it meets
_b1 = arr(Image.open(IN + 'B1.png')); _cy = int(round(1001.0 - 1.345 * 572.4)); _chest = np.median(_b1[_cy - 6:_cy + 6, 467 - 12:467 + 12].reshape(-1, 3), 0)
T['skinChest'] = '#%02x%02x%02x' % tuple(int(v) for v in _chest); print('tones: face', T['skin'], 'jaw', T['skinJaw'], 'chest', T['skinChest'])
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
