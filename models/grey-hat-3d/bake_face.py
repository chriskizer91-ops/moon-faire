# His face, baked for the Jester's face model (the head every witch wears; method: project doc claude/HOW-TO-3d-witch-faces.md).
#   C1  his bare face straight on         -> 'face'      laid on flat from the front, placed by his pupils and the line of his lips
#   C3  the true profile (right figure)   -> 'faceSide'  for cheek, jaw and ear at the sides, with 'faceSideA' saying where it may be used
# Landmarks were read by eye off gridded copies (lib/grid.py), from the labels. One set of numbers places paint and shape alike:
# 'layout' goes to the head code, which puts the sculpted eyes, nose and lips where the painted ones are.
# The head is the Jester's at HS times its size, with his eye line R_EYE up and the tip of his nose R_TIP forward (from B1 and B2).
# usage: python3 -I bake_face.py     -> out/tex_face.json (build.sh joins it into out/noiz_tex.js)
import os, io, sys, json, base64, numpy as np
ROOT = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(ROOT, 'tools'))
from sil import load, mask_of, figures
from PIL import Image
from scipy import ndimage as ndi
HS, R_EYE, R_TIP = 1.06, 1.660, 0.096
J_EYE, J_TIP, J_EYEX = 1.5246, 0.1158, 0.0304
jy = lambda Y: R_EYE + (Y - J_EYE) * HS
jz = lambda Z: R_TIP + (Z - J_TIP) * HS
# ---- C1, read off the grid: pupils, the line between the lips, the base of the nose, the middle of the brows ----
PUP_L, PUP_R, LIP_Y, NOSE_Y, BROW_Y = (455, 512), (815, 512), 870, 748, 428
ppm = (PUP_R[0] - PUP_L[0]) / (2 * J_EYEX * HS); cx = (PUP_L[0] + PUP_R[0]) / 2; ey = (PUP_L[1] + PUP_R[1]) / 2
eye_lip = (LIP_Y - ey) / ppm
layout = dict(eyeY=J_EYE, eyeX=J_EYEX, mouthY=J_EYE - eye_lip / HS, noseY=J_EYE - (NOSE_Y - ey) / ppm / HS, browY=J_EYE + (ey - BROW_Y) / ppm / HS)
def carried(path, pick=None):
    a = load(os.path.join(ROOT, 'refs', path)); m, _ = mask_of(a); lab, figs = figures(m, 20000)
    fm = (lab == figs[pick][5]) if pick is not None else m
    core = ndi.binary_erosion(fm, iterations=3); _, idx = ndi.distance_transform_edt(~core, return_indices=True)
    filled = a[idx[0], idx[1]]; soft = np.stack([ndi.gaussian_filter(filled[..., c], 3.0) for c in range(3)], -1)
    d = ndi.distance_transform_edt(~core); k = np.clip(d / 8.0, 0, 1)[..., None]
    return a * (d <= 0)[..., None] + (filled * (1 - k) + soft * k) * (d > 0)[..., None], fm
def warp(arr, size, ax, cx0, ay, cy0, pad=420, mode=Image.BICUBIC):
    # output pixel (i, j) reads input (ax * i + cx0, ay * j + cy0); the input is padded with its own edge so the window may run past it
    p = np.pad(arr, ((pad, pad), (pad, pad)) + ((0, 0),) * (arr.ndim - 2), mode='edge')
    im = Image.fromarray(np.clip(p, 0, 255).astype(np.uint8))
    return im.transform((size, size), Image.AFFINE, (ax, 0, cx0 + pad + 0.5 * ax - 0.5, 0, ay, cy0 + pad + 0.5 * ay - 0.5), mode)
def uri(im, q=90):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
X0, X1, Y0, Y1 = -0.1 * HS, 0.1 * HS, jy(1.385), jy(1.585)
front, _ = carried('C1.png')
S = 1024; face = warp(front, S, (X1 - X0) / S * ppm, cx + X0 * ppm, (Y1 - Y0) / S * ppm, ey + (R_EYE - Y1) * ppm)
# ---- C3, the profile: the eye line, the tip of the nose, the line between the lips ----
P_EYE_Y, P_TIP, P_LIP_Y, P_EYE_X = 380, (1503, 470), 563, 1416
ppm_s = (P_LIP_Y - P_EYE_Y) / eye_lip
side, pm = carried('C3.png', pick=2)
Z0, Z1 = jz(-0.075), jz(0.125); SS = 512
ax, cx0, ay, cy0 = (Z1 - Z0) / SS * ppm_s, P_TIP[0] + (Z0 - R_TIP) * ppm_s, (Y1 - Y0) / SS * ppm_s, P_EYE_Y + (R_EYE - Y1) * ppm_s
side_im = warp(side, SS, ax, cx0, ay, cy0)
# where the profile may be used: inside the figure, feathered, and not over the eye (the front painting keeps the eyes)
alpha = ndi.gaussian_filter(ndi.binary_erosion(pm, iterations=5).astype(np.float32), 4.0)
yy, xx = np.mgrid[0:pm.shape[0], 0:pm.shape[1]]
alpha *= 1 - np.exp(-(((xx - P_EYE_X) / 46.0) ** 2 + ((yy - P_EYE_Y) / 30.0) ** 2))
alpha_im = warp((alpha * 255)[..., None].repeat(3, 2), SS, ax, cx0, ay, cy0, mode=Image.BILINEAR)
# its tone is matched to the cheek of the front painting (gain held between 0.7 and 1.2)
fa = np.asarray(face).astype(np.float32); sa = np.asarray(side_im).astype(np.float32)
def patch_front(x, y, r=14): i, j = int((x - X0) / (X1 - X0) * S), int((Y1 - y) / (Y1 - Y0) * S); return np.median(fa[j - r:j + r, i - r:i + r].reshape(-1, 3), 0)
def patch_side(z, y, r=8): i, j = int((z - Z0) / (Z1 - Z0) * SS), int((Y1 - y) / (Y1 - Y0) * SS); return np.median(sa[j - r:j + r, i - r:i + r].reshape(-1, 3), 0)
cf = 0.5 * (patch_front(-0.050, R_EYE - 0.030) + patch_front(0.050, R_EYE - 0.030)); cs = patch_side(R_TIP - 0.062, R_EYE - 0.030)
gain = np.clip(cf / np.maximum(cs, 1), 0.70, 1.20); side_im = Image.fromarray(np.clip(sa * gain, 0, 255).astype(np.uint8))
neck = np.median(side[640:690, 1235:1325].reshape(-1, 3), 0) * gain
hexc = lambda c: '#%02x%02x%02x' % tuple(int(round(min(255, v))) for v in c)
out = dict(face=uri(face), faceSide=uri(side_im), faceSideA=uri(alpha_im, 88), layout={k: round(v, 5) for k, v in layout.items()}, faceSideWin=[round(v, 5) for v in (Z0, Z1, Y0, Y1)],
           head=dict(HS=HS, R_EYE=R_EYE, R_TIP=R_TIP), skinNeck=hexc(neck), skinCheek=hexc(cf))
json.dump(out, open(os.path.join(ROOT, 'out', 'tex_face.json'), 'w'))
face.save('/tmp/noiz_face.jpg', quality=90); side_im.save('/tmp/noiz_side.jpg', quality=90); alpha_im.save('/tmp/noiz_sideA.jpg', quality=90)
print('front: %.0f px/m, eye to lip %.4f m; profile: %.0f px/m' % (ppm, eye_lip, ppm_s))
print('layout (the Jester head\'s own frame):', out['layout'])
print('profile tone gain', np.round(gain, 3), 'neck', out['skinNeck'], 'cheek', out['skinCheek'], '| sizes KB', len(out['face']) // 1024, len(out['faceSide']) // 1024, len(out['faceSideA']) // 1024)
