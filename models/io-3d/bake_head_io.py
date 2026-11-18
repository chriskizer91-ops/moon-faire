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
# Chris, November 13: her painted face is to carry no hair at all; the hair in front of her face is real hair on the model.
# So the fine strands that cross her temple, cheek, ear and neck in C3 are painted out too: anything on her skin (clear of her brow,
# eye, nostril and lips) that is darker than the skin round it is repainted from the skin beside it.
import cv2
sk8 = np.clip(side_src, 0, 255).astype(np.uint8); lum = sk8.astype(np.float32).mean(-1)
loc = cv2.medianBlur(cv2.GaussianBlur(sk8, (0, 0), 3).mean(-1).astype(np.uint8), 41).astype(np.float32)
strand = (lum < loc * 0.90) | ((sk8[..., 0].astype(np.float32) - sk8[..., 2]) < 26)
zs = np.zeros(C3.shape[:2], bool); zs[300:900, 1046:1372] = True; zs[300:372, 1046:1425] = True; zs[430:900, 1046:1430] = True       # her temple, cheek, jaw, ear and neck
zs[428:520, 1205:1250] = False                                                                                                         # ... but not the hollow of her ear
zs[480:600, 1440:1536] = False
strand = ndi.binary_dilation(strand & zs & fg3, iterations=2)
side_src = cv2.inpaint(sk8, strand.astype(np.uint8) * 255, 6, cv2.INPAINT_TELEA).astype(np.float32)
print('painted strands taken out of the side picture: %.1f%% of her skin there' % (100.0 * strand.sum() / max(1, (zs & fg3).sum())))
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
# ---------- her states, from C9: six faces in a grid, three across and two down, each 512 px square ----------
# neutral, eyes shut, eyes half shut / lips parted, 'oo', smile. Cell 1 is C1's face again, so it is settled onto C1 picture against
# picture (starting from its pupils: (217.5, 224) and (332.5, 224)), and every other cell onto cell 1 by the parts that did not
# change. Then only the eyes or the mouth are lifted, as soft-edged patches with their tone matched to the face round the rim.
C9 = load(REF + 'C9.png'); cells = [C9[512 * i:512 * (i + 1), 512 * j:512 * (j + 1)] for i in range(2) for j in range(3)]
gray = lambda a: cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 400, 1e-7)
tmpl = cv2.resize(gray(C1), (627, 627), interpolation=cv2.INTER_AREA); k0 = 115.0 / 140.0
W1 = np.array([[k0, 0, 275.0 - 313.5 * k0], [0, k0, 224.0 - 267.0 * k0]], np.float32)       # half-size C1 -> cell 1, to start from
fm = np.zeros((512, 512), np.uint8); cv2.ellipse(fm, (275, 285), (98, 138), 0, 0, 360, 255, -1)
_, W1 = cv2.findTransformECC(tmpl, gray(cells[0]), W1, cv2.MOTION_AFFINE, crit, fm, 5)
WK = {}
for k in range(1, 6):
    mk = fm.copy()
    if k in (1, 2): mk[190:252, :] = 0              # the eyes changed
    else: mk[296:400, 170:380] = 0                  # the mouth changed (and the cheeks beside it, in the smile)
    _, WK[k] = cv2.findTransformECC(gray(cells[0]), gray(cells[k]), np.eye(2, 3, dtype=np.float32), cv2.MOTION_EUCLIDEAN, crit, mk, 5)
print('cell 1 on C1:', np.round(W1, 4).tolist(), '| shifts of the others (px):', {k + 1: [round(float(WK[k][0, 2]), 2), round(float(WK[k][1, 2]), 2)] for k in WK})
def to_cell(k, col, row):                           # C1 pixel -> pixel in cell k
    x = W1[0, 0] * col / 2 + W1[0, 1] * row / 2 + W1[0, 2]; y = W1[1, 0] * col / 2 + W1[1, 1] * row / 2 + W1[1, 2]
    if k == 0: return x, y
    Wk = WK[k]; return Wk[0, 0] * x + Wk[0, 1] * y + Wk[0, 2], Wk[1, 0] * x + Wk[1, 1] * y + Wk[1, 2]
def webp_rgba(rgb, al):
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(al * 255, 0, 255)]).astype(np.uint8), 'RGBA'); b = io.BytesIO(); im.save(b, 'WEBP', quality=90, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
def state(name, k, x0, x1, y0, y1, ells):            # ells: [centre x, centre height, half-width, half-height] in the picture's measure
    j0, j1 = int((x0 - FX0) / (FX1 - FX0) * S), int(np.ceil((x1 - FX0) / (FX1 - FX0) * S)); i0, i1 = int((FY1 - y1) / (FY1 - FY0) * S), int(np.ceil((FY1 - y0) / (FY1 - FY0) * S))
    X = FXg[i0:i1, j0:j1]; Y = FYg[i0:i1, j0:j1]; cx, cy = to_cell(k, col_of(X), row_of(Y))
    pt = np.stack([ndi.map_coordinates(cells[k][..., c], [cy, cx], order=1, mode='nearest') for c in range(3)], -1)
    al = np.zeros(X.shape, np.float32)
    for ex, ey, rx, ry in ells: rho = np.sqrt(((X - ex) / rx) ** 2 + ((Y - ey) / ry) ** 2); t = np.clip((1 - rho) / 0.38, 0, 1); al = np.maximum(al, t * t * (3 - 2 * t))
    base = face[i0:i1, j0:j1]; rim = (al > 0.04) & (al < 0.55); gain = np.clip(base[rim].mean(0) / pt[rim].mean(0), 0.80, 1.30); pt = pt * gain
    T['faceParts'][name] = dict(src=webp_rgba(pt, al), x=round(j0 / S, 5), y=round(i0 / S, 5), w=round((j1 - j0) / S, 5), h=round((i1 - i0) / S, 5))
    out = face.copy(); out[i0:i1, j0:j1] = base * (1 - al[..., None]) + pt * al[..., None]; return out, np.round(gain, 3)
T['faceParts'] = {}
EYES = [[-EYEXU, J_EYE - 0.0010, 0.0240, 0.0135], [EYEXU, J_EYE - 0.0010, 0.0240, 0.0135]]
shots = [face]
for name, k, box, ells in (('shut', 1, (-0.064, 0.064, J_EYE - 0.018, J_EYE + 0.016), EYES), ('half', 2, (-0.064, 0.064, J_EYE - 0.018, J_EYE + 0.016), EYES),
                           ('oh', 3, (-0.050, 0.050, 1.4350, 1.4800), [[0, 1.4574, 0.0460, 0.0200]]), ('oo', 4, (-0.050, 0.050, 1.4350, 1.4800), [[0, 1.4574, 0.0460, 0.0200]]),
                           ('smile', 5, (-0.058, 0.058, 1.4330, 1.4820), [[0, 1.4578, 0.0540, 0.0225]])):
    o, gn = state(name, k, *box, ells); shots.append(o); print(' ', name, 'tone gain', gn.tolist(), len(T['faceParts'][name]['src']) // 1024, 'KB')
sheet = np.concatenate([np.concatenate([s_[250:900:2, 150:874:2] for s_ in shots[:3]], 1), np.concatenate([s_[250:900:2, 150:874:2] for s_ in shots[3:]], 1)], 0)
Image.fromarray(np.clip(sheet, 0, 255).astype(np.uint8)).save(SH + 'bake_states.jpg', quality=88)

# ---------- her emotions, from C10: six faces in a grid like C9's (stage ten) ----------
# reading (eyes lowered, a small smile), casting (brows drawn together, eyes narrowed), surprised, hit (a wince), stern, delighted.
# An expression moves the whole face, so each is lifted as one patch of the face inside its outline, not as eyes or a mouth alone.
# C10's faces are larger in their boxes than C9's, so each is settled onto C9's first face with a free fit that starts from the
# distance between her eyes (142 px here, 115 px there), using the parts an expression moves least: her nose, the sides of her
# cheeks, her chin, her forehead. The fit is then made rigid again (one size both ways, no shear), so a face is never stretched.
C10 = load(REF + 'C10.png'); ecells = [C10[512 * i:512 * (i + 1), 512 * j:512 * (j + 1)] for i in range(2) for j in range(3)]
EMO = ['reading', 'casting', 'surprised', 'hit', 'stern', 'delighted']
em = fm.copy(); em[150:262, :] = 0; em[296:410, 165:385] = 0; ys, xs = np.nonzero(em); cen = np.array([xs.mean(), ys.mean()])
WE = {}; s0 = 1.19                                  # her face is 1.19 times larger in C10's boxes than in C9's (eyes 137 px apart against 115, eye line to lip line 139 against 117)
def find_face(c):                                   # the middle of her face (where it is most alike left and right) and the row of her lip line
    lum = ndi.gaussian_filter(c.mean(-1), 2.0); best = None
    for m in range(195, 300):
        d = np.arange(4, 100); e = np.abs(lum[170:400, m + d] - lum[170:400, m - d]).mean()
        if best is None or e < best[0]: best = (e, m)
    m = best[1]; lip = 330 + int(np.argmin(lum[330:410, m - 10:m + 11].mean(1))); return m, lip
for k in range(6):
    mx, lip = find_face(ecells[k])
    W0 = np.array([[s0, 0, mx - s0 * 275.0], [0, s0, lip - s0 * 341.0]], np.float32)       # C9's first face: middle at 275, lip line at row 341
    emk = cv2.warpAffine(em, W0, (512, 512)); how = 'fitted'                               # the mask, laid on C10's face
    try:
        cc, Wa = cv2.findTransformECC(gray(cells[0]), gray(ecells[k]), W0.copy(), cv2.MOTION_AFFINE, crit, emk, 7)
        U, sv, Vt = np.linalg.svd(Wa[:, :2].astype(np.float64)); Rm = U @ Vt; sc = float(np.sqrt(sv[0] * sv[1])); ang = float(np.degrees(np.arctan2(Rm[1, 0], Rm[0, 0])))
        if not (1.12 <= sc <= 1.27 and abs(ang) < 5 and sv[0] / sv[1] < 1.12): raise ValueError('a poor fit: size %.3f, turn %.2f, stretch %.3f' % (sc, ang, sv[0] / sv[1]))
        A = sc * Rm; t = (Wa[:, :2] @ cen + Wa[:, 2]) - A @ cen; WE[k] = np.concatenate([A, t[:, None]], 1)
    except Exception as ex:
        WE[k] = W0.astype(np.float64); cc, sc, ang, how = 0.0, s0, 0.0, 'kept at its first placing (' + str(ex)[:60] + ')'
    print('  C10 face %d (%s): middle %d, lip row %d; %s: fit %.3f, size %.3f, turned %.2f deg' % (k + 1, EMO[k], mx, lip, how, cc, sc, ang))
def to_ecell(k, col, row):                          # C1 pixel -> pixel in C10's face k
    x = W1[0, 0] * col / 2 + W1[0, 1] * row / 2 + W1[0, 2]; y = W1[1, 0] * col / 2 + W1[1, 1] * row / 2 + W1[1, 2]; Wk = WE[k]
    return Wk[0, 0] * x + Wk[0, 1] * y + Wk[0, 2], Wk[1, 0] * x + Wk[1, 1] * y + Wk[1, 2]
# the patch: her face inside its outline in C1, kept well clear of the outline and of her hairline, with a soft edge
ins = ndi.binary_erosion(inside & (rr[:, None] >= 262), iterations=30).astype(np.float32); ins = ndi.gaussian_filter(ins, 11.0)
ex0, ex1, ey0, ey1 = -0.074, 0.074, 1.408, 1.582
j0, j1 = int((ex0 - FX0) / (FX1 - FX0) * S), int(np.ceil((ex1 - FX0) / (FX1 - FX0) * S)); i0, i1 = int((FY1 - ey1) / (FY1 - FY0) * S), int(np.ceil((FY1 - ey0) / (FY1 - FY0) * S))
Xe = FXg[i0:i1, j0:j1]; Ye = FYg[i0:i1, j0:j1]; c1c, c1r = col_of(Xe), row_of(Ye)
ale = np.clip(ndi.map_coordinates(ins, [c1r, c1c], order=1, mode='constant', cval=0.0), 0, 1); ale = np.clip((ale - 0.08) / 0.84, 0, 1); ale = ale * ale * (3 - 2 * ale)
# narrower toward her forehead, where her hair comes in at her temples; and it stops above her chin, so the head keeps its own chin and jaw
lim = np.interp(Ye, [1.440, 1.500, J_EYE, 1.541, 1.556, 1.572, 1.582], [0.052, 0.062, 0.062, 0.058, 0.050, 0.040, 0.030])
sd = np.clip((lim - np.abs(Xe)) / 0.008, 0, 1); bt = np.clip((Ye - 1.424) / 0.012, 0, 1); ale = ale * sd * sd * (3 - 2 * sd) * bt * bt * (3 - 2 * bt)
ale[0, :] = 0; ale[-1, :] = 0; ale[:, 0] = 0; ale[:, -1] = 0
featz = ((np.abs(Xe) <= 0.057) & (Ye > J_EYE - 0.022) & (Ye < J_EYE + 0.036)) | ((np.abs(Xe) <= 0.045) & (Ye > 1.436) & (Ye < 1.482)) | ((np.abs(Xe) <= 0.020) & (Ye > 1.468) & (Ye < 1.494))       # her brows and eyes, her mouth, her nostrils: dark there is hers
def lowpass(a, w, sig): return np.stack([ndi.gaussian_filter(a[..., c] * w, sig) for c in range(3)], -1) / np.maximum(ndi.gaussian_filter(w, sig), 1e-4)[..., None]
def webp_rgba_q(rgb, al, q):
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(al * 255, 0, 255)]).astype(np.uint8), 'RGBA'); b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
eshots = []
for k, name in enumerate(EMO):
    cx, cy = to_ecell(k, c1c, c1r)
    pt = np.stack([ndi.map_coordinates(ecells[k][..., c], [cy, cx], order=1, mode='nearest') for c in range(3)], -1)
    base = face[i0:i1, j0:j1]; rim = (ale > 0.04) & (ale < 0.55); gain = np.clip(base[rim].mean(0) / pt[rim].mean(0), 0.80, 1.30); pt = pt * gain
    # strands of hair and backdrop that fall inside the patch are left out: anything much darker than her skin there, away from her features
    dark = (pt.mean(-1) < 0.66 * ndi.gaussian_filter(base.mean(-1), 12.0)) & ~featz; hm = ndi.gaussian_filter(ndi.binary_dilation(dark, iterations=5).astype(np.float32), 4.0)
    al = ale * np.clip(1 - 1.6 * hm, 0, 1)
    # toward its rim the patch takes the broad light and colour of the face under it, so no edge shows; its middle keeps its own
    wm = (al > 0.02).astype(np.float32)
    pt = pt * (1 + (np.clip(lowpass(base, wm, 60.0) / np.maximum(lowpass(pt, wm, 60.0), 1.0), 0.80, 1.25) - 1) * 0.75)       # and all over, most of the way to the face's own broad tone: C10's six faces are not lit quite alike
    ratio = np.clip(lowpass(base, wm, 26.0) / np.maximum(lowpass(pt, wm, 26.0), 1.0), 0.78, 1.28)
    dist = ndi.distance_transform_edt(al > 0.5); we = np.clip(1 - dist / 80.0, 0, 1)[..., None]; pt = pt * (1 + (ratio - 1) * we)
    T['faceParts']['emo_' + name] = dict(src=webp_rgba_q(pt, al, 86), x=round(j0 / S, 5), y=round(i0 / S, 5), w=round((j1 - j0) / S, 5), h=round((i1 - i0) / S, 5))
    out = face.copy(); out[i0:i1, j0:j1] = base * (1 - al[..., None]) + pt * al[..., None]; eshots.append(out)
    print('  emotion', name, 'tone gain', np.round(gain, 3).tolist(), len(T['faceParts']['emo_' + name]['src']) // 1024, 'KB')
sheet = np.concatenate([np.concatenate([s_[60:960:2, 130:894:2] for s_ in [face] + eshots[:3]], 1), np.concatenate([s_[60:960:2, 130:894:2] for s_ in [face] + eshots[3:]], 1)], 0)
Image.fromarray(np.clip(sheet, 0, 255).astype(np.uint8)).save(SH + 'bake_emotions.jpg', quality=88)
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
