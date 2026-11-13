# Io's head textures, cut from her paintings and added to out/io_tex.js (window.IO_TEX). Run after bake_io.py.
#   face      : C1 (her front face, no glasses), laid on the Jester head's own window (x -0.1..0.1 m, height 1.385..1.585 m in the
#               head's frame) by her eyes, nose, lip line and chin.
#   faceSide  : the profile in C3 on the head's side window, fixed at the tip of the nose, tone matched to the front cheek.
#   skinNeck, skinChest, hairCols, layout, headFrame.
# The paintings are data: run with python3 -I.
import sys, io, json, base64
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, '/home/claude/io/tools')
from sil import load, mask_of
REF = '/home/claude/io/refs/'; OUT = '/home/claude/io/out/'; SH = '/home/claude/io/shots/'
def uri(a, q=92):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=q, subsampling=0)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
def fill(a, bad, soft=2.0):                         # paint over the bad pixels with the nearest good ones, softened
    idx = ndi.distance_transform_edt(bad, return_distances=False, return_indices=True)
    f = a[idx[0], idx[1]]; g = np.stack([ndi.gaussian_filter(f[..., c], soft) for c in range(3)], -1)
    w = ndi.gaussian_filter(bad.astype(np.float32), 1.5)[..., None]
    return a * (1 - w) + g * w
def sample(a, rows, cols):
    return np.stack([ndi.map_coordinates(a[..., c], [rows, cols], order=1, mode='nearest') for c in range(3)], -1)
hexc = lambda v: '#%02x%02x%02x' % tuple(int(round(float(x))) for x in np.clip(v, 0, 255))

txt = open(OUT + 'io_tex.js').read(); T = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])

# ---------- front: C1 ----------
# The head is the Jester's face model, in its own frame: eyes at 1.5246 m, lip line 0.066 m below. Io wears it at HS = 0.95 with her
# eye line at 1.511 m and the tip of her nose 0.107 m forward (src/I40_head.js). The pictures are made in the head's frame.
HS, J_EYE, J_TIP, I_EYE, I_TIP = 0.95, 1.5246, 0.1158, 1.511, 0.107
jy = lambda Y: I_EYE + (Y - J_EYE) * HS
jz = lambda Z: I_TIP + (Z - J_TIP) * HS
C1 = load(REF + 'C1.png')
# Read off gridded copies by eye (tools/zoomgrid.py): pupils (487, 533) and (767, 533); the middles of the two eye openings x 491 and
# 764; the middle of her nose and mouth x 630; brows y 462; under the nose 745; lip line 828 (middle); under the chin 1006.
# Her nose and mouth sit 3 px to one side of the middle of her eyes, so each half of the picture is scaled on its own.
EYE1, NOSEX, EL, ER = 534.0, 630.0, 489.0, 765.5
PXJ = (828.0 - EYE1) / 0.066                      # C1 pixels per metre of the head's frame, from eye line to lip line
EYEXU = (ER - EL) / 2 / PXJ                       # half the distance between her eyes, in the picture's own measure (model x / HS)
WF_EYE = 0.95                                     # the head is this much narrower than the Jester's at eye height (WF in src/I40_head.js)
ANCH = [(J_EYE, 534.0), (1.4775, 745.0), (1.4586, 828.0), (1.4165, 1006.0)]      # height in the head's frame -> row in C1
def piece(Y, anch, top, pxm):
    Y = np.asarray(Y, np.float64); r = np.where(Y >= anch[0][0], top - (Y - anch[0][0]) * pxm, 0.0)
    for (ya, ra), (yb, rb) in zip(anch[:-1], anch[1:]):
        sel = (Y < ya) & (Y >= yb); r = np.where(sel, ra + (ya - Y) / (ya - yb) * (rb - ra), r)
    yb, rb = anch[-1]; return np.where(Y < yb, rb + (yb - Y) * pxm, r)
row_of = lambda Y: piece(Y, ANCH, EYE1, PXJ)
def col_of(X):
    X = np.asarray(X, np.float64); return np.where(X < 0, NOSEX + X * (NOSEX - EL) / EYEXU, NOSEX + X * (ER - NOSEX) / EYEXU)
# Keep the painting inside the outline of her face and on her neck. Outside it, carry her skin outward, so hair, ears and
# backdrop are not pulled onto the cheek where the surface turns (step 4 of the face how-to). [row, left edge, right edge]
EDGE = [(215, 600, 680), (225, 501, 770), (250, 459, 805), (275, 432, 822), (300, 412, 840), (325, 401, 861), (350, 389, 870), (375, 380, 879), (400, 370, 888), (425, 359, 899),
        (450, 349, 907), (475, 344, 915), (500, 342, 917), (525, 340, 920), (550, 340, 925), (575, 337, 927), (600, 338, 925), (625, 340, 925), (650, 344, 920), (675, 350, 915),
        (700, 356, 908), (725, 362, 901), (750, 366, 897), (775, 370, 893), (800, 376, 888), (825, 384, 880), (850, 395, 869), (875, 411, 852), (900, 433, 831), (925, 459, 808),
        (950, 487, 776), (975, 520, 744), (995, 560, 702), (1006, 608, 652)]
front = C1.copy(); Hh, Ww = front.shape[:2]; rr = np.arange(Hh); cc_ = np.arange(Ww)[None, :]
eL = np.interp(rr, [e[0] for e in EDGE], [e[1] for e in EDGE]); eR = np.interp(rr, [e[0] for e in EDGE], [e[2] for e in EDGE])
inside = (cc_ > eL[:, None] + 9) & (cc_ < eR[:, None] - 9) & (rr[:, None] <= 1006) & (rr[:, None] >= 215)
inside |= (rr[:, None] > 968) & (cc_ > 500) & (cc_ < 772)                             # her neck under the chin
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
T['layout'] = dict(eyeY=J_EYE, eyeX=round(EYEXU / WF_EYE, 4), browY=round(J_EYE + (EYE1 - 462.0) / PXJ, 4), noseY=1.4877, mouthY=1.4586)       # the sculpted features are placed from these
T['headFrame'] = dict(scale=HS, eye=I_EYE, tip=I_TIP)
print('C1: %.1f px per metre of the head frame; half eye distance %.4f (picture), %.4f (head frame); brow %.4f' % (PXJ, EYEXU, T['layout']['eyeX'], T['layout']['browY']))

# ---------- side: the profile in C3 (right-hand figure), for her cheeks, jaw, ears and the sides of her neck ----------
# Read off a gridded copy by eye: eye y 420; tip of the nose x 1513; lip line y 556; under the chin y 644; ear x 1195..1262, y 405..522.
C3 = load(REF + 'C3.png'); fg3, _ = mask_of(C3); bad = ~ndi.binary_erosion(fg3, iterations=3); bad[:, :1046] = True
r3, g3, b3 = C3[..., 0], C3[..., 1], C3[..., 2]
hairish = ~((r3 > 118) & (r3 - b3 > 34) & (r3 - g3 > 12))                    # not skin: her hair, behind the ear and over the forehead
zone = np.zeros(C3.shape[:2], bool); zone[:, :1300] = True; zone[:345, :] = True; zone[:480, :1352] = True; zone[:372, :1425] = True; zone[395:530, 1188:1270] = False       # ... but leave the ear and the face alone
hairish = ndi.binary_dilation(ndi.binary_opening(hairish & zone, iterations=1), iterations=4) & zone
side_src = fill(C3, bad | hairish, 3.0)
PXS = (556.0 - 420.0) / 0.066; TIPX = 1513.0; ANS = [(J_EYE, 420.0), (1.4586, 556.0), (1.4165, 644.0)]
ck_f = np.median(C1[690:770, 800:880].reshape(-1, 3), 0); ck_s = np.median(C3[470:520, 1380:1420].reshape(-1, 3), 0); gain = np.clip(ck_f / ck_s, 0.70, 1.20)      # the profile's tone matched to the front cheek
SZ0, SZ1, SY0, SY1 = -0.075, 0.125, 1.385, 1.585; S2 = 512
ii, jj = np.mgrid[0:S2, 0:S2]
Y = SY1 - (ii + 0.5) / S2 * (SY1 - SY0); Z = SZ0 + (jj + 0.5) / S2 * (SZ1 - SZ0)
side = sample(side_src, piece(Y, ANS, 420.0, PXS), TIPX + (Z - J_TIP) * PXS) * gain
T['faceSide'] = uri(side, 92); T['faceSideA'] = uri(np.full((8, 8, 3), 255.0), 90); T['faceSideWin'] = [round(jz(SZ0), 5), round(jz(SZ1), 5), round(jy(SY0), 5), round(jy(SY1), 5)]
Image.fromarray(np.clip(side, 0, 255).astype(np.uint8)).save(SH + 'bake_side.jpg', quality=90); print('profile: %.1f px per metre of the head frame; tone gain' % PXS, np.round(gain, 3))

# ---------- skin tones ----------
# C18 shows the bottom of her face, her neck and her chest in one light, so it gives how her neck and chest stand to her cheek.
# Those ratios are applied to the cheek of C1, so face, neck and chest are one skin.
C18 = load(REF + 'C18.png')
med = lambda a, y0, y1, x0, x1: np.median(a[y0:y1, x0:x1].reshape(-1, 3), 0)
ck18 = (med(C18, 60, 130, 360, 440) + med(C18, 60, 130, 800, 880)) / 2; nk18 = med(C18, 400, 520, 540, 720); ch18 = med(C18, 800, 900, 440, 800)
ck1 = (med(C1, 690, 770, 380, 460) + med(C1, 690, 770, 800, 880)) / 2
chB3 = np.array([int(T['skinChest'][i:i + 2], 16) for i in (1, 3, 5)], np.float64)           # her chest as stage one baked it from B3
G = np.clip(ck18 / ck1 * chB3 / ch18, 0.90, 1.22)       # C1 is painted a little darker than C18 and B3: lift the face so cheek, neck and chest agree
face = face * G; side = side * G
T['face'] = uri(face, 93); T['faceSide'] = uri(side, 92); T['faceGain'] = [round(float(v), 3) for v in G]
Image.fromarray(np.clip(face, 0, 255).astype(np.uint8)).save(SH + 'bake_face.jpg', quality=90)
T['skinNeck'] = hexc(nk18 * chB3 / ch18); T['skinFaceChest'] = hexc(ck1 * G)
T['skinJaw'] = hexc(med(C1, 1060, 1150, 560, 700))
print('face gain', np.round(G, 3), 'cheek C1', hexc(ck1), '| C18 cheek', hexc(ck18), 'neck', hexc(nk18), 'chest', hexc(ch18), '| skinNeck', T['skinNeck'], 'chest by C18', T['skinFaceChest'], 'skinChest (B3)', T.get('skinChest'), 'skinJaw', T['skinJaw'])
js = 'window.IO_TEX=' + json.dumps(T, separators=(',', ':')) + ';'
open(OUT + 'io_tex.js', 'w').write(js); print('io_tex.js', len(js) // 1024, 'KB', list(T.keys()))

# ---------- hat and hair: swatches from F9 (round 2), hair colours from C13 ----------
T = json.loads(open(OUT + 'io_tex.js').read().split('=', 1)[1].rstrip(';'))
F9 = load(REF + 'F9.png')
def sq(a, S):
    return np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((S, S), Image.LANCZOS)).astype(np.float32)
felt = sq(F9[126:484, 23:371], 512); T['felt'] = uri(felt, 90)                       # the hat's wine-red felt with its gold flecks
T['hatband'] = uri(sq(F9[128:484, 403:753], 512), 90)                                # black lace with a scalloped edge top and bottom
T['horn'] = uri(sq(F9[538:896, 786:1135], 256), 90)                                  # cream horn with fine brown grain
T['feltCol'] = hexc(np.median(felt.reshape(-1, 3), 0))
C13 = load(REF + 'C13.png'); hp = C13[60:1100, 330:930].reshape(-1, 3); r, g, b = hp[:, 0], hp[:, 1], hp[:, 2]
hp = hp[(r - b > 12) & (r - b < 95) & (r - g < 60) & (g > b - 4)]                    # hair, not the wine-red robe behind it
lum = hp.mean(1); o = np.argsort(lum)
T['hairCols'] = [hexc(np.median(hp[o[int(len(o) * a):int(len(o) * b_)]], 0)) for a, b_ in ((0.02, 0.12), (0.25, 0.40), (0.55, 0.70), (0.80, 0.90), (0.95, 0.995))]
print('felt', T['feltCol'], 'hair colours, dark to light', T['hairCols'])
Image.fromarray(np.concatenate([felt, sq(F9[128:484, 403:753], 512), sq(F9[538:896, 786:1135], 512)], 1).astype(np.uint8)).save(SH + 'bake_hat_swatches.jpg', quality=88)
js = 'window.IO_TEX=' + json.dumps(T, separators=(',', ':')) + ';'
open(OUT + 'io_tex.js', 'w').write(js); print('io_tex.js', len(js) // 1024, 'KB')
