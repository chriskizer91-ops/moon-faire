# The Ranger's head textures, cut from her paintings and added to out/ranger_tex.js (window.RANGER_TEX). Run after bake_ranger.py.
#   face      : J1 (round 4, her face painted for this head), laid on the Jester head's own window (x -0.1..0.1 m, height 1.385..1.585 m
#               in the head's frame) by her eyes, nose and lip line.
#   faceParts : her states from J2 (eyes shut, half shut, lips parted, 'oo', smile), as soft patches that sit on the face picture.
#   faceSide  : the profile in J3 on the head's side window, fixed at the tip of the nose, tone matched to the front cheek.
#   The hair pictures still come from C3, C5 and C8, with the headband painted out.
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

# ---------- front: J1, her face painted for this head (round 4: no band, gem, glasses, earrings or loose hair in it) ----------
# The head is the Jester's face model, in its own frame: eyes at 1.5246 m, lip line 0.066 m below. The model wears it at HS of its
# size with the eye line at 1.512 m and the tip of the nose 0.107 m forward (src/R40_head.js). The pictures are made in the head's frame.
HS, J_EYE, J_TIP, R_EYE, R_TIP = 0.94, 1.5246, 0.1158, 1.512, 0.107
jy = lambda Y: R_EYE + (Y - J_EYE) * HS
jz = lambda Z: R_TIP + (Z - J_TIP) * HS
EYE_H = 1.512
J1 = load(REF + 'J1.png')
# Read off a gridded copy by eye (lib/grid.py refs/J1.png out 250,400,1010,1200 50): pupils (436, 541) and (823.5, 541); the middles
# of the two eye openings x 442.5 and 838.5; the middle of her nose and mouth x 651; brows y 452; under the nose 810; lip line 928;
# under the chin 1168. Her nose and mouth sit 11 px to one side of the middle of her eyes, so each half of the picture is scaled
# on its own: the nose lands on the middle line of the head and each eye on its own socket.
EYE1, NOSEX, EL, ER = 541.0, 651.0, 442.5, 838.5
PXJ = (928.0 - EYE1) / 0.066                      # J1 pixels per metre of the head's frame, from eye line to lip line
EYEX = (ER - EL) / 2 / PXJ
ANCH = [(J_EYE, 541.0), (1.4775, 810.0), (1.4586, 928.0), (1.4165, 1168.0)]      # height in the head's frame -> row in J1
def piece(Y, anch, top, pxm):
    Y = np.asarray(Y, np.float64); r = np.where(Y >= anch[0][0], top - (Y - anch[0][0]) * pxm, 0.0)
    for (ya, ra), (yb, rb) in zip(anch[:-1], anch[1:]):
        sel = (Y < ya) & (Y >= yb); r = np.where(sel, ra + (ya - Y) / (ya - yb) * (rb - ra), r)
    yb, rb = anch[-1]; return np.where(Y < yb, rb + (yb - Y) * pxm, r)
row_of = lambda Y: piece(Y, ANCH, EYE1, PXJ)
def col_of(X):
    X = np.asarray(X, np.float64); return np.where(X < 0, NOSEX + X * (NOSEX - EL) / EYEX, NOSEX + X * (ER - NOSEX) / EYEX)
# Keep the painting inside the outline of her face and on her neck. Outside it, carry her skin outward, so hair, ears and
# backdrop are not pulled onto the cheek where the surface turns (step 4 of the face how-to). [row, left edge, right edge]
EDGE = [(150, 480, 800), (187, 400, 880), (250, 322, 958), (300, 287, 988), (350, 270, 1002), (400, 263, 1007), (450, 262, 1007), (540, 256, 1003), (650, 254, 1000), (760, 262, 998), (800, 272, 995),
        (850, 280, 992), (900, 290, 985), (950, 302, 972), (1000, 322, 950), (1050, 362, 908), (1100, 430, 850), (1140, 520, 765), (1168, 620, 665)]
front = J1.copy(); Hh, Ww = front.shape[:2]; rr = np.arange(Hh); cc_ = np.arange(Ww)[None, :]
eL = np.interp(rr, [e[0] for e in EDGE], [e[1] for e in EDGE]); eR = np.interp(rr, [e[0] for e in EDGE], [e[2] for e in EDGE])
inside = (cc_ > eL[:, None] + 9) & (cc_ < eR[:, None] - 9) & (rr[:, None] <= 1168)
inside |= (rr[:, None] > 1125) & (cc_ > 352) & (cc_ < 918)                             # her neck under the chin
r_, g_, b_ = front[..., 0], front[..., 1], front[..., 2]
skin = ndi.binary_erosion(inside, iterations=8) & (r_ > 112) & (r_ - b_ > 40) & (r_ - g_ > 14)
def carry(sig):
    den = ndi.gaussian_filter(skin.astype(np.float32), sig); num = np.stack([ndi.gaussian_filter(front[..., c] * skin, sig) for c in range(3)], -1)
    return num / np.maximum(den, 1e-4)[..., None], den
c1, d1 = carry(14.0); c2, d2 = carry(48.0); mid = np.median(front[skin], 0)
k1 = np.clip(d1 / 0.08, 0, 1)[..., None]; k2 = np.clip(d2 / 0.03, 0, 1)[..., None]
carried = c1 * k1 + (c2 * k2 + mid * (1 - k2)) * (1 - k1)
wi = ndi.gaussian_filter(inside.astype(np.float32), 5.0)[..., None]
front = front * wi + carried * (1 - wi)
S = 1024; FX0, FX1, FY0, FY1 = -0.1, 0.1, 1.385, 1.585
ii, jj = np.mgrid[0:S, 0:S]
FYg = FY1 - (ii + 0.5) / S * (FY1 - FY0); FXg = FX0 + (jj + 0.5) / S * (FX1 - FX0)
face = sample(front, row_of(FYg), col_of(FXg))
T['face'] = uri(face, 93); Image.fromarray(np.clip(face, 0, 255).astype(np.uint8)).save(SH + 'bake_face.jpg', quality=90)
T['layout'] = dict(eyeY=J_EYE, eyeX=round(EYEX, 4), browY=round(J_EYE + (EYE1 - 452.0) / PXJ, 4), noseY=1.4877, mouthY=1.4586)       # the sculpted features are placed from these
T['headFrame'] = dict(scale=HS, eye=R_EYE, tip=R_TIP)

# ---------- her states, from J2: six faces in a grid, three across and two down, each 512 px square ----------
# Cell 1 is J1 again, so it is settled onto J1 picture against picture (starting from a rough reading of its pupils), and every
# other cell is settled onto cell 1 by the parts that did not change. Then only the eyes or the mouth are lifted, as soft-edged
# patches with their tone matched to J1 round the rim, and stored as the Jester's are (faceParts: shut, half, oh, oo, smile).
import cv2
J2 = load(REF + 'J2.png'); cells = [J2[512 * i:512 * (i + 1), 512 * j:512 * (j + 1)] for i in range(2) for j in range(3)]
gray = lambda a: cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 400, 1e-7)
tmpl = cv2.resize(gray(J1), (627, 627), interpolation=cv2.INTER_AREA)
W1 = np.array([[2 / 2.25, 0, 258 - 629.75 / 2.25], [0, 2 / 2.25, 161 - 541 / 2.25]], np.float32)       # half-size J1 -> cell 1, to start from
fm = np.zeros((512, 512), np.uint8); cv2.ellipse(fm, (262, 222), (112, 150), 0, 0, 360, 255, -1)
_, W1 = cv2.findTransformECC(tmpl, gray(cells[0]), W1, cv2.MOTION_AFFINE, crit, fm, 5)
def to_cell(k, col, row):                           # J1 pixel -> pixel in cell k
    x = W1[0, 0] * col / 2 + W1[0, 1] * row / 2 + W1[0, 2]; y = W1[1, 0] * col / 2 + W1[1, 1] * row / 2 + W1[1, 2]
    if k == 0: return x, y
    Wk = WK[k]; return Wk[0, 0] * x + Wk[0, 1] * y + Wk[0, 2], Wk[1, 0] * x + Wk[1, 1] * y + Wk[1, 2]
WK = {}
for k in range(1, 6):
    mk = fm.copy()
    if k in (1, 2): mk[118:205, :] = 0              # the eyes changed
    else: mk[270:410, 150:380] = 0                  # the mouth changed (and the cheeks beside it, in the smile)
    _, WK[k] = cv2.findTransformECC(gray(cells[0]), gray(cells[k]), np.eye(2, 3, dtype=np.float32), cv2.MOTION_EUCLIDEAN, crit, mk, 5)
print('cell 1 on J1:', np.round(W1, 4).tolist(), '| shifts of the others (px):', {k + 1: [round(float(WK[k][0, 2]), 2), round(float(WK[k][1, 2]), 2)] for k in WK})
def webp_rgba(rgb, al):
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(al * 255, 0, 255)]).astype(np.uint8), 'RGBA'); b = io.BytesIO(); im.save(b, 'WEBP', quality=90, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
def state(name, k, x0, x1, y0, y1, ells):            # ells: [centre x, centre height, half-width, half-height] in the head's frame
    j0, j1 = int((x0 - FX0) / (FX1 - FX0) * S), int(np.ceil((x1 - FX0) / (FX1 - FX0) * S)); i0, i1 = int((FY1 - y1) / (FY1 - FY0) * S), int(np.ceil((FY1 - y0) / (FY1 - FY0) * S))
    X = FXg[i0:i1, j0:j1]; Y = FYg[i0:i1, j0:j1]; cx, cy = to_cell(k, col_of(X), row_of(Y))
    pt = np.stack([ndi.map_coordinates(cells[k][..., c], [cy, cx], order=1, mode='nearest') for c in range(3)], -1)
    al = np.zeros(X.shape, np.float32)
    for ex, ey, rx, ry in ells: rho = np.sqrt(((X - ex) / rx) ** 2 + ((Y - ey) / ry) ** 2); t = np.clip((1 - rho) / 0.38, 0, 1); al = np.maximum(al, t * t * (3 - 2 * t))
    base = face[i0:i1, j0:j1]; rim = (al > 0.04) & (al < 0.55); gain = np.clip(base[rim].mean(0) / pt[rim].mean(0), 0.85, 1.18); pt = pt * gain
    T['faceParts'][name] = dict(src=webp_rgba(pt, al), x=round(j0 / S, 5), y=round(i0 / S, 5), w=round((j1 - j0) / S, 5), h=round((i1 - i0) / S, 5))
    out = face.copy(); out[i0:i1, j0:j1] = base * (1 - al[..., None]) + pt * al[..., None]; return out, np.round(gain, 3)
T['faceParts'] = {}
EYES = [[-EYEX, J_EYE - 0.0010, 0.0228, 0.0128], [EYEX, J_EYE - 0.0010, 0.0228, 0.0128]]
shots = [face]
for name, k, box, ells in (('shut', 1, (-0.060, 0.060, J_EYE - 0.017, J_EYE + 0.015), EYES), ('half', 2, (-0.060, 0.060, J_EYE - 0.017, J_EYE + 0.015), EYES),
                           ('oh', 3, (-0.038, 0.038, 1.4390, 1.4770), [[0, 1.4574, 0.0345, 0.0168]]), ('oo', 4, (-0.038, 0.038, 1.4390, 1.4770), [[0, 1.4574, 0.0345, 0.0168]]),
                           ('smile', 5, (-0.050, 0.050, 1.4360, 1.4790), [[0, 1.4578, 0.0465, 0.0200]])):
    o, gn = state(name, k, *box, ells); shots.append(o); print(' ', name, 'tone gain', gn.tolist(), len(T['faceParts'][name]['src']) // 1024, 'KB')
sheet = np.concatenate([np.concatenate([s_[250:900:2, 150:874:2] for s_ in shots[:3]], 1), np.concatenate([s_[250:900:2, 150:874:2] for s_ in shots[3:]], 1)], 0)
Image.fromarray(np.clip(sheet, 0, 255).astype(np.uint8)).save(SH + 'bake_states.jpg', quality=88)

# ---------- side: the profile in J3 (right-hand figure), for her cheeks, jaw and ears ----------
# Read off a gridded copy by eye: eye y 405; tip of the nose x 1502.5; lip line y 535; under the chin y 627; ear x 1187..1262, y 382..519.
J3 = load(REF + 'J3.png'); fgj, _ = mask_of(J3); badj = ~ndi.binary_erosion(fgj, iterations=3); badj[:, :1012] = True
side_src = fill(J3, badj, 3.0)
PXS = (535.0 - 405.0) / 0.066; TIPX = 1502.5; ANS = [(J_EYE, 405.0), (1.4586, 535.0), (1.4165, 627.0)]
ck_f = np.median(J1[700:780, 850:930].reshape(-1, 3), 0); ck_s = np.median(J3[470:520, 1380:1420].reshape(-1, 3), 0); gain = np.clip(ck_f / ck_s, 0.70, 1.20)      # the profile's tone matched to the front cheek
SZ0, SZ1, SY0, SY1 = -0.075, 0.125, 1.385, 1.585; S2 = 512
ii, jj = np.mgrid[0:S2, 0:S2]
Y = SY1 - (ii + 0.5) / S2 * (SY1 - SY0); Z = SZ0 + (jj + 0.5) / S2 * (SZ1 - SZ0)
side = sample(side_src, piece(Y, ANS, 405.0, PXS), TIPX + (Z - J_TIP) * PXS) * gain
T['faceSide'] = uri(side, 92); T['faceSideA'] = uri(np.full((8, 8, 3), 255.0), 90); T['faceSideWin'] = [round(jz(SZ0), 5), round(jz(SZ1), 5), round(jy(SY0), 5), round(jy(SY1), 5)]
Image.fromarray(np.clip(side, 0, 255).astype(np.uint8)).save(SH + 'bake_side.jpg', quality=90); print('profile tone gain', np.round(gain, 3))
# C3 is still the source of her hair pictures (below)
C3 = load(REF + 'C3.png'); fg3, _ = mask_of(C3)
band3 = blue_band(C3); band3[185:290, 1395:1478] = True; band3[:, :1010] = False
PXM3, NOSE_X, NOSE_Z, EYE3 = 1837.0, 1498.0, 0.107, 381.0       # the profile in C3, in her own measure

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
nk = J1[1200:1250, 560:740].reshape(-1, 3); T['skinJaw'] = '#%02x%02x%02x' % tuple(int(v) for v in np.median(nk, 0))
print('skinJaw', T['skinJaw'], 'skinChest', T.get('skinChest'))
js = 'window.RANGER_TEX=' + json.dumps(T, separators=(',', ':')) + ';'
open(OUT + 'ranger_tex.js', 'w').write(js); print('ranger_tex.js', len(js) // 1024, 'KB', list(T.keys()))
