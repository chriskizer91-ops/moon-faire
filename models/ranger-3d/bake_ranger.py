# The Ranger's textures, cut from her paintings (refs/*.png) into out/ranger_tex.js (window.RANGER_TEX).
#   body : one picture that wraps round her torso and the legs of her shorts (u round the body from the middle of her back,
#          v height from 0.715 m to 1.405 m), mixed from four paintings by which way the surface faces:
#          B1 front, B1 back, B2 right side, B2 left side. The shapes come from tools/tables.py, the same tables the model uses.
#   lace, laceA : her sleeve lace (F11) as thread colour and see-through mask.     legs : that lace laid over her skin (the leggings).
#   skin : the colour of her bare arms, for the plain-skin parts.
# The paintings are data: run with python3 -I.
import sys, io, json, base64, math
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, '/home/claude/ranger/tools')
import tables as TB
from sil import load, mask_of, figures, spans
REF = '/home/claude/ranger/refs/'; OUT = '/home/claude/ranger/out/'
FULL_H = 1.665                                    # top of her hair to her soles, meters

def uri(a, q=90, fmt='JPEG'):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); b = io.BytesIO()
    if fmt == 'JPEG': im.convert('RGB').save(b, 'JPEG', quality=q, subsampling=0)
    else: im.save(b, 'PNG', optimize=True)
    return 'data:image/%s;base64,' % ('jpeg' if fmt == 'JPEG' else 'png') + base64.b64encode(b.getvalue()).decode()

def figure(name, fi):
    a = load(REF + name); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]; fm = lab == f[5]
    return dict(a=a, fm=fm, x0=f[0], y0=f[1], x1=f[2], y1=f[3], sole=f[3], pxm=(f[3] - f[1]) / FULL_H)

def waist_centre(F):
    best = None
    for h in np.arange(0.98, 1.14, 0.01):
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
AY0, AY1 = 0.715, TB.TY1
W, H = 2048, 1408
LEAN = 0.057                                      # how far forward of her shins her hips stand in the side paintings
front, back = figure('B1.png', 0), figure('B1.png', 1)
sideR, sideL = figure('B2.png', 1), figure('B2.png', 0)          # she faces right: her right side shows; she faces left: her left side
front['cx'] = waist_centre(front); back['cx'] = waist_centre(back); sideR['ax'] = shin_axis(sideR); sideL['ax'] = shin_axis(sideL)
print('front cx %.1f pxm %.1f | back cx %.1f pxm %.1f | sideR ax %.1f | sideL ax %.1f' % (front['cx'], front['pxm'], back['cx'], back['pxm'], sideR['ax'], sideL['ax']))
us = (np.arange(W) + 0.5) / W; X = np.zeros((H, W), np.float32); Z = np.zeros((H, W), np.float32); Y = np.zeros((H, W), np.float32)
for j in range(H):
    y = AY1 - (j + 0.5) / H * (AY1 - AY0); yr = max(y, TB.TORSO[0][0])
    rx, zf, zb = TB.spline(TB.TORSO, yr); cz = (zf + zb) / 2; rf = zf - cz; rb = cz - zb
    a = math.pi + us * 2 * math.pi; s = np.sin(a); c = np.cos(a); e = 2 / TB.TPW
    x = rx * np.sign(s) * np.abs(s) ** e; z = cz + np.where(c >= 0, rf, rb) * np.sign(c) * np.abs(c) ** e
    B = TB.BUST; ax = np.abs(x); cp = np.maximum(c, 0)
    z = z + cp * B['amp'] * np.exp(-((ax - B['x']) / B['sx']) ** 2 - ((yr - B['y']) / B['sy']) ** 2) - cp * B['dip'] * np.exp(-(x / B['dipx']) ** 2 - ((yr - B['dipy']) / B['dipsy']) ** 2)
    X[j] = x; Z[j] = z; Y[j] = y
# which way each point of the surface faces (from the ring's own run)
dX = np.roll(X, -1, 1) - np.roll(X, 1, 1); dZ = np.roll(Z, -1, 1) - np.roll(Z, 1, 1); L = np.hypot(dX, dZ) + 1e-9
NX, NZ = -dZ / L, dX / L                          # u runs back -> right side -> front -> left side, so this normal points outward
flip = (NX * X + NZ * (Z - (Z.max(1, keepdims=True) + Z.min(1, keepdims=True)) / 2)) < 0
NX = np.where(flip, -NX, NX); NZ = np.where(flip, -NZ, NZ)
P = 3.0
views = [
    (front, front['cx'] + X * front['pxm'], front['sole'] - Y * front['pxm'], np.maximum(NZ, 0) ** P, None),
    (back, back['cx'] - X * back['pxm'], back['sole'] - Y * back['pxm'], np.maximum(-NZ, 0) ** P, None),
    (sideR, sideR['ax'] + (Z + LEAN) * sideR['pxm'], sideR['sole'] - Y * sideR['pxm'], np.maximum(-NX, 0) ** P, 'side'),
    (sideL, sideL['ax'] - (Z + LEAN) * sideL['pxm'], sideL['sole'] - Y * sideL['pxm'], np.maximum(NX, 0) ** P, 'side'),
]
smooth = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(np.clip((x - a) / (b - a), 0, 1))
acc = np.zeros((H, W, 3), np.float32); wsum = np.zeros((H, W), np.float32)
for F, px, py, w, kind in views:
    col, ok = sample(F, px, py)
    if kind == 'side': w = w * (1 - smooth(1.13, 1.20, Y))        # in the side paintings her arm and sleeve are in front of everything above the bust
    w = w * ok; acc += col * w[..., None]; wsum += w
col = acc / np.maximum(wsum, 1e-6)[..., None]
conf = np.clip(wsum / 0.12, 0, 1)
f1, _ = fill(col, conf, 6.0); f2, d2 = fill(col, conf, 28.0); fl = np.where((d2 > 1e-3)[..., None], f2, col)
fl = np.where((ndi.gaussian_filter(conf, 6.0, mode='wrap') > 0.02)[..., None], f1, fl)
atlas = col * conf[..., None] + fl * (1 - conf[..., None])
# the neck: above her collarbones the paintings bring hair, ears and their shadows; plain skin takes over there
jj0, jj1 = int((AY1 - 1.345) / (AY1 - AY0) * H), int((AY1 - 1.300) / (AY1 - AY0) * H); cu = (np.abs(us - 0.5) < 0.045)
chest = np.median(atlas[jj0:jj1][:, cu].reshape(-1, 3), 0); T['skinChest'] = '#%02x%02x%02x' % tuple(int(round(v)) for v in chest); print('chest skin', T['skinChest'])
NECK = np.array([190.0, 127.0, 98.0]); T['skinNeck'] = '#be7f62'      # her neck in J3, between collarbones and chin: darker and warmer than her chest
ub = np.minimum(us, 1 - us)[None, :]; lower = 0.030 * smooth(0.30, 0.18, ub)       # at her back the band's tails, loose hair and their shadows hang lower in the painting, so plain skin starts lower there
nk = smooth(1.350, 1.398, Y)[..., None]; fade = smooth(1.352 - lower, 1.392 - lower, Y)[..., None]; atlas = atlas * (1 - fade) + (chest[None, None] * (1 - nk) + NECK[None, None] * nk) * fade
T['body'] = uri(atlas, 90); Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8)).save('/home/claude/ranger/shots/bake_body.jpg', quality=90)
print('body atlas', atlas.shape, 'low-confidence share %.3f' % float((conf < 0.5).mean()))

# ================= her skin colour (bare forearms in the front painting) =================
a = front['a']; r, g, b = a[..., 0], a[..., 1], a[..., 2]
sk = front['fm'] & (r > 150) & (r > g + 18) & (g > b + 4)
yy0, yy1 = int(front['sole'] - 1.02 * front['pxm']), int(front['sole'] - 0.86 * front['pxm'])       # forearm heights
m = np.zeros_like(sk); m[yy0:yy1] = sk[yy0:yy1]
skin = np.median(a[m], 0); T['skin'] = '#%02x%02x%02x' % tuple(int(round(v)) for v in skin); print('skin', T['skin'], 'from', int(m.sum()), 'pixels')

# ================= lace: the sleeve lace (F11) and the leggings (that lace over her skin) =================
f11 = load(REF + 'F11.png'); lum = f11.mean(-1)
# the painting has a dark rim: keep the middle
k = 96; f11 = f11[k:-k, k:-k]; lum = lum[k:-k, k:-k]; lumAll = lum
bgL = np.percentile(lum, 97); blk = np.percentile(lum, 2)
al = np.clip((bgL - lum) / (bgL - blk), 0, 1); al = np.clip((al - 0.10) / 0.80, 0, 1)                # 0 in the holes, 1 on thread; the fine net lands in between
S = 1024
alI = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).resize((S, S), Image.LANCZOS)).astype(np.float32) / 255
thread = np.array([24, 20, 24], np.float32)
laceC = np.ones((S, S, 3), np.float32) * thread * (0.85 + 0.5 * ndi.gaussian_filter(np.random.RandomState(7).rand(S, S), 1.2)[..., None])
T['lace'] = uri(laceC, 88); T['laceA'] = uri(np.repeat((alI * 255)[..., None], 3, -1), 90)
# leggings: sheer black net darkens her skin; the flowers are solid black thread
# the leggings wear bigger flowers than the sleeves: the middle 58% of the lace, enlarged
q = int(al.shape[0] * 0.21); alB = np.asarray(Image.fromarray((al[q:-q, q:-q] * 255).astype(np.uint8)).resize((S, S), Image.BICUBIC)).astype(np.float32) / 255; alI2 = alI; alI = alB
grey = skin.mean(); base = (skin * 0.72 + grey * 0.28) * 0.50 + np.array([4, 1, 3]); net = np.clip(alI / 0.55, 0, 1) * 0.32; motif = smooth(0.50, 0.85, alI)
legs = base[None, None] * (1 - net[..., None]); legs = legs * (1 - motif[..., None]) + np.array([26, 21, 24], np.float32) * motif[..., None]
legs *= (0.94 + 0.12 * ndi.gaussian_filter(np.random.RandomState(8).rand(S, S), 24)[..., None] / 0.5)
T['legs'] = uri(legs, 90); Image.fromarray(np.clip(legs, 0, 255).astype(np.uint8)).save('/home/claude/ranger/shots/bake_legs.jpg', quality=88)

js = 'window.RANGER_TEX=' + json.dumps(T, separators=(',', ':')) + ';'
open(OUT + 'ranger_tex.js', 'w').write(js); print('ranger_tex.js', len(js) // 1024, 'KB', list(T.keys()))
