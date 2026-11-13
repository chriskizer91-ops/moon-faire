# bake_face_r5.py: her face from the round 5 set. F1r5 = her face straight on (the picture on the head); F2r5 = six states of it in a 3 x 2 grid.
# Writes face, skin, skinJaw, layout, faceEyes and faceParts into out/fox_tex_own.js, and drops the old side pictures cut from C3.
# Landmarks in F1 were read by eye off a gridded copy (shots/F1_grid.jpg): pupils (459, 532) and (809, 532), the line between the lips at 904.
# Each state in F2 is placed by matching it to F1 itself (the eyes of the first box) and by its nose (every other box), not by eye and not by a dark-spot finder.
# run: python3 -I bake_face_r5.py && python3 make_jface.py && ./build.sh
import json, io, base64, numpy as np
from PIL import Image
from scipy import ndimage as ndi
W = '/home/claude/fox3d/'; EYE_Y, D_EM, S, WIN = 1.5246, 0.066, 1024, (-0.1, 0.1, 1.385, 1.585)
HM = json.load(open(W + 'meas/fox_head.json'))
f1 = Image.open(W + 'refs/F1r5.png').convert('RGB'); f2 = Image.open(W + 'refs/F2r5.png').convert('RGB')
ER, EL, LIP = (459.0, 532.0), (809.0, 532.0), 904.0; CX, EROW, PD = (ER[0] + EL[0]) / 2, 532.0, EL[0] - ER[0]
N_HAIR, N_BROW, N_CHIN = 96, 432, 1150
PPM = (LIP - EROW) / D_EM; K = S / 0.2 / PPM
def n2c(x, y): return ((x - CX) / PPM - WIN[0]) / 0.2 * S, (WIN[3] - (EYE_Y - (y - EROW) / PPM)) / 0.2 * S
def arr(im): return np.asarray(im.convert('RGB')).astype(np.float32)
def img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def warp(src, sx, tx, ty): return src.convert('RGB').transform((S, S), Image.AFFINE, (sx, 0, tx, 0, sx, ty), Image.BICUBIC)
def fill(a, w, s): den = ndi.gaussian_filter(w, s); return np.stack([ndi.gaussian_filter(a[..., c] * w, s) for c in range(3)], -1) / np.maximum(den, 1e-4)[..., None], den
def uri(im, q=91): b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
x0, y0 = n2c(0, 0); base = arr(warp(f1, 1 / K, -x0 / K, -y0 / K)); inside = arr(warp(Image.new('RGB', f1.size, (255, 255, 255)), 1 / K, -x0 / K, -y0 / K))[..., 0] > 250
jj, ii = np.mgrid[0:S, 0:S]; ex0, ey0 = n2c(CX, (N_HAIR + N_CHIN) / 2 + 6); rx_, ry_ = 0.0630 * PPM * K, 0.0925 * PPM * K; oval = ((ii - ex0) / rx_) ** 2 + ((jj - ey0) / ry_) ** 2 < 1
mx = ii / S * 0.2 + WIN[0]; my = WIN[3] - jj / S * 0.2; exx = PD / 2 / PPM
hairish = (base[..., 0] < 105) | (base[..., 0] - base[..., 2] > 128)          # dark hair and backdrop, gold curls. Her skin here is warm and freckled (red minus blue up to about 115), so the test is set above that
protect = (((mx / 0.052) ** 2 + ((my - 1.495) / 0.078) ** 2) < 1) | ((((np.abs(mx) - (exx - 0.004)) / 0.0225) ** 2 + ((my - (EYE_Y + 0.006)) / 0.021) ** 2) < 1) | ((np.abs(mx) < 0.038) & (my < EYE_Y - 0.012) & (my > EYE_Y - 0.090)) | ((np.abs(mx) < 0.020) & (my < EYE_Y + 0.02) & (my > EYE_Y - 0.03))
hairish = ndi.binary_dilation(hairish & ~protect, iterations=6); valid = (oval & inside & ~hairish).astype(np.float32)
fa, fb = n2c(CX - 60, 250), n2c(CX + 60, 330); skin = np.median(base[int(fa[1]):int(fb[1]), int(fa[0]):int(fb[0])].reshape(-1, 3), 0)
f1_, w1 = fill(base, valid, 16); f2_, w2 = fill(base, valid, 60); t1 = np.clip(w1 * 3, 0, 1)[..., None]; t2 = np.clip(w2 * 4, 0, 1)[..., None]; ext = f1_ * t1 + (f2_ * t2 + skin * (1 - t2)) * (1 - t1)
keep = ndi.gaussian_filter(ndi.binary_erosion(valid > 0.5, iterations=8).astype(np.float32), 7)[..., None]; face = base * keep + ext * (1 - keep)
T = {}; T['face'] = uri(img(face)); T['skin'] = '#%02x%02x%02x' % tuple(int(v) for v in skin)
ja, jb = n2c(CX - 70, 1085), n2c(CX + 70, 1130); T['skinJaw'] = '#%02x%02x%02x' % tuple(int(v) for v in np.median(face[int(ja[1]):int(jb[1]), int(ja[0]):int(jb[0])].reshape(-1, 3), 0))
T['layout'] = {'eyeY': EYE_Y, 'eyeX': round(exx, 4), 'mouthY': round(EYE_Y - D_EM, 4), 'noseY': HM['L']['tip'][0], 'browY': round(EYE_Y + (EROW - N_BROW) / PPM, 4), 'chinY': HM['L']['underChin'][0], 'bandY': round(EYE_Y + (EROW - N_HAIR) / PPM, 4)}
T['faceEyes'] = [[round(n2c(*e)[0] / S, 4), round(n2c(*e)[1] / S, 4)] for e in (ER, EL)]
# ---- the six states. Find the first box's eyes by sliding F1's own eyes (shrunk) over it; then every other box by its nose. ----
g1 = np.asarray(f1.convert('L')).astype(np.float32); g2 = np.asarray(f2.convert('L')).astype(np.float32)
def find(tpl, im, cx, cy, r):       # best place for a small picture near (cx, cy), by least squared difference after taking the means off
    h, w = tpl.shape; t = tpl - tpl.mean(); best = (1e18, 0, 0)
    for y in range(int(cy - r), int(cy + r) + 1):
        for x in range(int(cx - r), int(cx + r) + 1):
            p = im[y - h // 2:y - h // 2 + h, x - w // 2:x - w // 2 + w]; d = ((p - p.mean() - t) ** 2).sum()
            if d < best[0]: best = (d, x, y)
    return best
best = None
for s in (0.58, 0.60, 0.62, 0.64, 0.66):
    small = np.asarray(f1.convert('L').resize((round(f1.width * s), round(f1.height * s)), Image.LANCZOS)).astype(np.float32)
    def tp(e): x, y = round(e[0] * s), round(e[1] * s); return small[y - 22:y + 22, x - 36:x + 36]
    a = find(tp(ER), g2, 148, 100, 22); b = find(tp(EL), g2, 365, 100, 22)
    if best is None or a[0] + b[0] < best[0]: best = (a[0] + b[0], s, a[1:], b[1:])
_, s2, e2r, e2l = best; s2 = (e2l[0] - e2r[0]) / PD; sc = 1 / s2; m2 = ((e2r[0] + e2l[0]) / 2, (e2r[1] + e2l[1]) / 2 + (LIP - EROW) * s2)
print('F2 first box: pupils', e2r, e2l, 'scale to F1 x%.3f' % sc, 'mouth middle', [round(v, 1) for v in m2])
nose = g2[150:262, 200:316]; off = {}
for cxi in range(3):
    for cyi in range(2):
        d, x, y = find(nose, g2, cxi * 512 + 258, cyi * 512 + 206, 14); off[(cxi, cyi)] = (x - 258, y - 206)
print('box offsets', off)
def rrect(xa, ya, xb, yb, fe): (a_, b_), (c_, d_) = n2c(xa, ya), n2c(xb, yb); m = np.zeros((S, S), np.float32); f = fe * K; m[int(b_ + f):int(d_ - f), int(a_ + f):int(c_ - f)] = 1; return np.clip(ndi.gaussian_filter(m, f / 1.6), 0, 1)
def patch(cell, kind):
    ox, oy = off[cell]; lay = np.zeros((S, S, 3), np.float32); al = np.zeros((S, S), np.float32)
    pairs = [((e2r[0] + ox, e2r[1] + oy), ER, (ER[0] - 80, ER[1] - 54, ER[0] + 80, ER[1] + 46)), ((e2l[0] + ox, e2l[1] + oy), EL, (EL[0] - 80, EL[1] - 54, EL[0] + 80, EL[1] + 46))] if kind == 'eyes' else [((m2[0] + ox, m2[1] + oy), (CX, LIP), (CX - 192, LIP - 100, CX + 192, LIP + 114))]
    for sp, tp_, bx in pairs:
        cx_, cy_ = n2c(*tp_); s_ = 1 / (sc * K); w = arr(warp(f2, s_, sp[0] - cx_ * s_, sp[1] - cy_ * s_)); m = rrect(*bx, 14)
        ring = (m > 0.05) & (m < 0.5); w = w + (face[ring].mean(0) - w[ring].mean(0)); sel = (m > 0.002)[..., None]; lay = np.where(sel, w, lay); al = np.maximum(al, m)
    ys_, xs_ = np.where(al > 0.01); xa, xb, ya, yb = xs_.min(), xs_.max() + 1, ys_.min(), ys_.max() + 1
    rgba = np.dstack([np.clip(lay, 0, 255), al * 255])[ya:yb, xa:xb].astype(np.uint8); bb = io.BytesIO(); Image.fromarray(rgba, 'RGBA').save(bb, 'WEBP', quality=90, method=6)
    return {'src': 'data:image/webp;base64,' + base64.b64encode(bb.getvalue()).decode(), 'x': round(xa / S, 4), 'y': round(ya / S, 4), 'w': round((xb - xa) / S, 4), 'h': round((yb - ya) / S, 4)}, img(face * (1 - al[..., None]) + lay * al[..., None])
P = {}; chk = [img(face)]
for name, cell, kind in (('shut', (1, 0), 'eyes'), ('half', (2, 0), 'eyes'), ('oh', (0, 1), 'mouth'), ('oh2', (1, 1), 'mouth'), ('smile', (2, 1), 'mouth')):
    P[name], c = patch(cell, kind); chk.append(c)
T['faceParts'] = P
sh = Image.new('RGB', (300 * 6, 300)); [sh.paste(c.resize((300, 300), Image.LANCZOS), (i * 300, 0)) for i, c in enumerate(chk)]; sh.save(W + 'shots/bake_face_r5.jpg', quality=88)
OUT = W + 'out/fox_tex_own.js'; raw = open(OUT).read(); O = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])
for k in ('faceSide', 'faceSideA', 'faceSideWin'): O.pop(k, None)
O.update(T); js = 'window.FOX_TEX=' + json.dumps(O, separators=(',', ':')) + ';'; open(OUT, 'w').write(js); open(W + 'variants/ownface/fox_tex_own.js', 'w').write(js)
print('skin', T['skin'], 'jaw', T['skinJaw'], 'layout', T['layout'], '| own bake', len(js) // 1024, 'KB')
