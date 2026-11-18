# Io's textures, cut from her round 1 paintings (refs/*.png) into out/io_tex.js (window.IO_TEX).
#   body : one picture that wraps round her torso (u round the body from the middle of her back, v height from 0.86 m to 1.405 m),
#          mixed from four paintings by which way the surface faces: B3 front and back, and B2's two sides in the narrow band between
#          her belt and her arms. Below the waistband it is plain black (the skirt covers it). Shapes come from tools/tables.py.
#   lace : one tier of the skirt's lace, cut from B4 (the skirt seen from behind).
#   skin, skinChest : the colour of her bare arms and of her chest, for the plain-skin parts.
# The paintings are data: run with python3 -I.
import sys, io, json, base64, math
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, '/home/claude/io/tools')
import tables as TB
from sil import load, mask_of, figures, spans
REF = '/home/claude/io/refs/'; OUT = '/home/claude/io/out/'

def uri(a, q=90, fmt='JPEG'):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); b = io.BytesIO()
    if fmt == 'JPEG': im.convert('RGB').save(b, 'JPEG', quality=q, subsampling=0)
    else: im.save(b, 'PNG', optimize=True)
    return 'data:image/%s;base64,' % ('jpeg' if fmt == 'JPEG' else 'png') + base64.b64encode(b.getvalue()).decode()

def figure(name, fi, pxm):
    a = load(REF + name); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]; fm = lab == f[5]
    return dict(a=a, fm=fm, x0=f[0], y0=f[1], x1=f[2], y1=f[3], sole=f[3], pxm=pxm)

def waist_centre(F):
    best = None
    for h in np.arange(1.06, 1.14, 0.01):
        yy = int(round(F['sole'] - h * F['pxm'])); sp = [s for s in spans(F['fm'][yy]) if s[1] - s[0] > 20]
        if not sp: continue
        c = max(sp, key=lambda s: s[1] - s[0])
        if best is None or c[1] - c[0] < best[1] - best[0]: best = c
    return (best[0] + best[1]) / 2

def shin_axis(F):
    cs = []
    for h in np.arange(0.32, 0.40, 0.01):
        yy = int(round(F['sole'] - h * F['pxm'])); c = max(spans(F['fm'][yy]), key=lambda s: s[1] - s[0]); cs.append((c[0] + c[1]) / 2)
    return float(np.mean(cs))

def sample(F, px, py):
    col = np.stack([ndi.map_coordinates(F['a'][..., c], [py, px], order=1, mode='nearest') for c in range(3)], -1)
    inside = ndi.binary_erosion(F['fm'], iterations=2).astype(np.float32)
    ok = ndi.map_coordinates(inside, [py, px], order=1, mode='constant', cval=0.0)
    return col, ok

def fill(col, w, sig):
    """colour spread outward from where w is high (normalised blur)"""
    num = np.stack([ndi.gaussian_filter(col[..., c] * w, sig, mode='wrap') for c in range(3)], -1); den = ndi.gaussian_filter(w, sig, mode='wrap')[..., None]
    return num / np.maximum(den, 1e-6), den[..., 0]

T = {}
# ================= the wrapped body picture =================
AY0, AY1 = 0.86, TB.TY1
W, H = 2048, 1408
front, back = figure('B3.png', 0, 584.3), figure('B3.png', 1, 584.3)
sideR, sideL = figure('B2.png', 1, 578.0), figure('B2.png', 0, 578.0)          # she faces right: her right side shows; she faces left: her left side
front['cx'] = waist_centre(front); back['cx'] = waist_centre(back); sideR['ax'] = shin_axis(sideR); sideL['ax'] = shin_axis(sideL)
print('front cx %.1f | back cx %.1f | sideR ax %.1f | sideL ax %.1f' % (front['cx'], back['cx'], sideR['ax'], sideL['ax']))
us = (np.arange(W) + 0.5) / W; X = np.zeros((H, W), np.float32); Z = np.zeros((H, W), np.float32); Y = np.zeros((H, W), np.float32)
for j in range(H):
    y = AY1 - (j + 0.5) / H * (AY1 - AY0); yr = max(y, TB.TORSO[0][0])
    rx, zf, zb = TB.spline(TB.TORSO, yr); cz = (zf + zb) / 2; rf = zf - cz; rb = cz - zb
    a = math.pi + us * 2 * math.pi; s = np.sin(a); c = np.cos(a); e = 2 / TB.TPW
    x = rx * np.sign(s) * np.abs(s) ** e; z = cz + np.where(c >= 0, rf, rb) * np.sign(c) * np.abs(c) ** e
    B = TB.BUST; ax = np.abs(x); cp = np.maximum(c, 0)
    z = z + cp * B['amp'] * np.exp(-((ax - B['x']) / B['sx']) ** 2 - ((yr - B['y']) / B['sy']) ** 2) - cp * B['dip'] * np.exp(-(x / B['dipx']) ** 2 - ((yr - B['dipy']) / B['dipsy']) ** 2)
    X[j] = x; Z[j] = z; Y[j] = y
dX = np.roll(X, -1, 1) - np.roll(X, 1, 1); dZ = np.roll(Z, -1, 1) - np.roll(Z, 1, 1); L = np.hypot(dX, dZ) + 1e-9
NX, NZ = -dZ / L, dX / L
flip = (NX * X + NZ * (Z - (Z.max(1, keepdims=True) + Z.min(1, keepdims=True)) / 2)) < 0
NX = np.where(flip, -NX, NX); NZ = np.where(flip, -NZ, NZ)
smooth = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(np.clip((x - a) / (b - a), 0, 1))
LEAN = 0.034 - 0.020 * smooth(1.10, 1.35, Y)      # how far forward of the model the side paintings stand, by height (see tools/tables.py)
P = 3.0
band = smooth(1.115, 1.135, Y) * (1 - smooth(1.19, 1.23, Y))      # the side paintings are only clear between her belt and her arms
views = [
    (front, front['cx'] + X * front['pxm'], front['sole'] - Y * front['pxm'], np.maximum(NZ, 0) ** P),
    (back, back['cx'] - X * back['pxm'], back['sole'] - Y * back['pxm'], np.maximum(-NZ, 0) ** P),
    (sideR, sideR['ax'] + (Z + LEAN) * sideR['pxm'], sideR['sole'] - Y * sideR['pxm'], np.maximum(-NX, 0) ** P * band),
    (sideL, sideL['ax'] - (Z + LEAN) * sideL['pxm'], sideL['sole'] - Y * sideL['pxm'], np.maximum(NX, 0) ** P * band),
]
acc = np.zeros((H, W, 3), np.float32); wsum = np.zeros((H, W), np.float32)
for F, px, py, w in views:
    col, ok = sample(F, px, py); w = w * ok; acc += col * w[..., None]; wsum += w
col = acc / np.maximum(wsum, 1e-6)[..., None]
conf = np.clip(wsum / 0.12, 0, 1)
f1, _ = fill(col, conf, 6.0); f2, d2 = fill(col, conf, 28.0); fl = np.where((d2 > 1e-3)[..., None], f2, col)
fl = np.where((ndi.gaussian_filter(conf, 6.0, mode='wrap') > 0.02)[..., None], f1, fl)
atlas = col * conf[..., None] + fl * (1 - conf[..., None])
# The tops of her shoulders and the sides of her neck: the front and back paintings see these edge-on, so they bring the backdrop
# (purple streaks) and the shadow under her hair (a dark patch). Anything there that is neither skin nor bodice strap is repainted
# from the skin beside it, and each strap is carried over the top of the shoulder to meet its other half.
r_, g_, b_ = atlas[..., 0], atlas[..., 1], atlas[..., 2]
zone = Y > 1.318
skinlike = (r_ > 125) & (r_ - b_ > 48) & (r_ - g_ > 14)
strap = (np.maximum(np.maximum(r_, g_), b_) < 82) & (Y < 1.353) & (np.abs(np.abs(us[None, :] - 0.5) - 0.25) > 0.004)
strap = ndi.binary_opening(strap, iterations=2)
badsk = ndi.binary_dilation(zone & ~skinlike & ~strap, iterations=3) & zone & ~ndi.binary_dilation(strap, iterations=2)
good = skinlike & ~badsk
idx = ndi.distance_transform_edt(~good, return_distances=False, return_indices=True); near = atlas[idx[0], idx[1]]
near = np.stack([ndi.gaussian_filter(near[..., c], 5.0, mode='wrap') for c in range(3)], -1)
wb = ndi.gaussian_filter(badsk.astype(np.float32), 2.0, mode='wrap')[..., None]; atlas = atlas * (1 - wb) + near * wb
jtop, jbot = int((AY1 - 1.353) / (AY1 - AY0) * H), int((AY1 - 1.322) / (AY1 - AY0) * H)
for uc in (0.25, 0.75):
    ends = []
    for lo, hi in ((uc - 0.060, uc - 0.010), (uc + 0.010, uc + 0.060)):
        c0, c1 = int(lo * W), int(hi * W); ys, xs = np.nonzero(strap[jtop:jbot, c0:c1])
        if len(ys) < 20: continue
        near_side = np.abs((xs + c0) / W - uc); sel = near_side < np.percentile(near_side, 30)          # the end of the strap nearest the top of the shoulder
        ends.append((float(xs[sel].mean() + c0), float(ys[sel].mean() + jtop)))
    if len(ends) == 2:
        (x0, y0), (x1, y1) = ends; n = int(abs(x1 - x0)) + 1; scol = np.median(atlas[strap], 0); hw = 0.0026 * H / (AY1 - AY0)          # a strap 5 mm wide, as painted
        yy, xx = np.mgrid[0:H, 0:W]; t = np.clip((xx - x0) / (x1 - x0), 0, 1); d = np.abs(yy - (y0 + (y1 - y0) * t)); k = np.clip((hw - d) / 2.5 + 0.5, 0, 1) * np.clip((xx - x0 + 8) / 6.0, 0, 1) * np.clip((x1 + 8 - xx) / 6.0, 0, 1)
        atlas = atlas * (1 - k[..., None]) + scol[None, None] * k[..., None]; print('strap carried over the shoulder at u %.2f: %s' % (uc, [(round(a), round(b)) for a, b in ends]))
# the neck: above her collarbones the paintings bring hair, ears and their shadows; plain skin takes over there
jj0, jj1 = int((AY1 - 1.345) / (AY1 - AY0) * H), int((AY1 - 1.300) / (AY1 - AY0) * H); cu = (np.abs(us - 0.5) < 0.045)
chest = np.median(atlas[jj0:jj1][:, cu].reshape(-1, 3), 0); T['skinChest'] = '#%02x%02x%02x' % tuple(int(round(v)) for v in chest); print('chest skin', T['skinChest'])
fade = smooth(1.352, 1.392, Y)[..., None]; atlas = atlas * (1 - fade) + chest[None, None] * fade
# under the skirt: plain black
low = smooth(1.062, 1.046, Y)[..., None] if False else (1 - smooth(1.046, 1.062, Y))[..., None]; atlas = atlas * (1 - low) + np.array([20, 16, 20], np.float32)[None, None] * low
T['body'] = uri(atlas, 90); Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8)).save('/home/claude/io/shots/bake_body.jpg', quality=90)
print('body atlas', atlas.shape, 'low-confidence share above the waist %.3f' % float((conf[Y > 1.07] < 0.5).mean()))

# ================= her skin colour (bare forearms in the front painting) =================
a = front['a']; r, g, b = a[..., 0], a[..., 1], a[..., 2]
sk = front['fm'] & (r > 150) & (r > g + 18) & (g > b + 4)
yy0, yy1 = int(front['sole'] - 1.10 * front['pxm']), int(front['sole'] - 0.95 * front['pxm'])       # forearm heights
m = np.zeros_like(sk); m[yy0:yy1] = sk[yy0:yy1]
skin = np.median(a[m], 0); T['skin'] = '#%02x%02x%02x' % tuple(int(round(v)) for v in skin); print('skin', T['skin'], 'from', int(m.sum()), 'pixels')

# ================= the skirt's lace: one tier, from the skirt seen from behind (B4) =================
b4 = load(REF + 'B4.png')[415:545, 1180:1380]
S = 1024
lace = np.asarray(Image.fromarray(b4.astype(np.uint8)).resize((S, S), Image.LANCZOS)).astype(np.float32)
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32); v = yy / (S - 1)
lace = lace * (0.80 + 0.36 * v)[..., None]          # darker toward the top of a tier, where it lies under the tier above
NSC = 6; cxs = (np.floor(xx / (S / NSC)) + 0.5) * (S / NSC); rad = S / NSC * 0.56
dist = np.hypot(xx - cxs, yy - (S - 1 - rad * 0.86))
edge = np.exp(-((dist - rad * 0.88) / (S * 0.006)) ** 2) * (yy > S - 1 - rad * 0.86)      # one fine line: the scallops along the hem
edge2 = np.exp(-((dist - rad * 0.70) / (S * 0.010)) ** 2) * (yy > S - 1 - rad * 0.86) * 0.45
bronze = np.array([150, 112, 70], np.float32)
k = np.clip(edge + edge2, 0, 1)[..., None] * 0.55; lace = lace * (1 - k) + bronze * k
rs = np.random.RandomState(11)
for _ in range(26):                                 # a few tiny gold sequins near the hem
    sx, sy, sr = rs.rand() * S, S * (0.62 + 0.36 * rs.rand()), 2.5 + 3 * rs.rand()
    dd = np.hypot(np.minimum(np.abs(xx - sx), S - np.abs(xx - sx)), yy - sy); m = np.clip(1.5 - dd / sr, 0, 1)[..., None]
    lace = lace * (1 - m) + np.array([226, 190, 120], np.float32) * m
T['lace'] = uri(lace, 90); Image.fromarray(np.clip(lace, 0, 255).astype(np.uint8)).save('/home/claude/io/shots/bake_lace.jpg', quality=88)

js = 'window.IO_TEX=' + json.dumps(T, separators=(',', ':')) + ';'
open(OUT + 'io_tex.js', 'w').write(js); print('io_tex.js', len(js) // 1024, 'KB', list(T.keys()))
