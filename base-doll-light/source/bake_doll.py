# The base doll's skin, painted. Run after bake_io.py, bake_head_io.py and bake_arms_io.py:  python3 -I bake_doll.py
# Adds to out/io_tex.js:
#   dollBody 2048 x 1408: her trunk, in the same layout as Io's bodice picture 'body' (u round her from the middle of her back, the
#            top row at 1.405 m, the bottom at 0.86 m). Where Io's picture is skin (her shoulders, upper chest and upper back, from B3)
#            it is kept, with the bodice's straps taken out; everywhere the bodice was, the skin is carried on from it and brought to
#            her chest's tone, with fine detail and freckles like those of the painted skin.
#   dollLegs 512 x 1024: one leg unrolled (u round the leg: 0.25 the outside, 0.5 the front, 0.75 the inside, 0 and 1 the back; the top
#            row at 1.0 m, the bottom at 0.03 m), from B5: its front, side and back views of her bare legs, mixed by which way the skin
#            faces, each brought to one tone, with the painting's own light at half strength. Above the shorts and below the socks of
#            B5 there is no bare leg: the nearest painted band is carried on there.
#   dollFeet 280 x 600: the feet seen from above (u across the foot, v from heel to toes), for the doll's bare feet, with toenails.
import sys, io, json, base64
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
ROOT = '/home/claude/io/'; OUT = ROOT + 'out/'
txt = open(OUT + 'io_tex.js').read(); pre, js = txt.split('=', 1)
T = json.loads(js.strip().rstrip(';'))
def dec(k): return np.asarray(Image.open(io.BytesIO(base64.b64decode(T[k].split(',', 1)[1]))).convert('RGB')).astype(np.float32)
def enc(a, q=88):
    b = io.BytesIO(); Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(b, 'WEBP', quality=q); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
hexc = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
SKIN, CHEST = hexc(T['skin']), hexc(T['skinChest'])
rng = np.random.default_rng(7)

def pushpull(img, m):
    """fill the unknown part of img (m == 0) smoothly from the known part"""
    imgs, ws = [img * m[..., None]], [m.astype(np.float32)]
    while min(imgs[-1].shape[:2]) > 4:
        a, w = imgs[-1], ws[-1]; H, W = w.shape; H2, W2 = H // 2 * 2, W // 2 * 2
        a = a[:H2, :W2]; w = w[:H2, :W2]
        imgs.append((a[0::2, 0::2] + a[1::2, 0::2] + a[0::2, 1::2] + a[1::2, 1::2]))
        ws.append((w[0::2, 0::2] + w[1::2, 0::2] + w[0::2, 1::2] + w[1::2, 1::2]))
    cur = imgs[-1] / np.maximum(ws[-1], 1e-6)[..., None]
    for a, w in zip(imgs[-2::-1], ws[-2::-1]):
        H, W = w.shape
        up = np.asarray(Image.fromarray(np.clip(cur, 0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32) if False else ndi.zoom(cur, (H / cur.shape[0], W / cur.shape[1], 1), order=1)
        k = np.clip(w, 0, 1)[..., None]
        cur = (a / np.maximum(w, 1e-6)[..., None]) * k + up * (1 - k)
    return cur

def detail_from(src, m, out_shape, sig=3.0, patch=72, step=44):
    """fine detail (the high-pass of src where m) laid over a whole picture in soft-edged random patches"""
    hp = src - ndi.gaussian_filter(src, (sig, sig, 0))
    ok = ndi.binary_erosion(m, iterations=patch // 2 + 2); ys, xs = np.where(ok)
    H, W = out_shape; D = np.zeros((H, W, 3), np.float32); Wt = np.zeros((H, W), np.float32)
    win = np.outer(np.hanning(patch), np.hanning(patch)).astype(np.float32) + 1e-3
    for y0 in range(-patch // 2, H, step):
        for x0 in range(-patch // 2, W, step):
            i = rng.integers(len(ys)); sy, sx = ys[i] - patch // 2, xs[i] - patch // 2
            p = hp[sy:sy + patch, sx:sx + patch]
            if rng.random() < 0.5: p = p[:, ::-1]
            ya, xa = max(0, y0), max(0, x0); yb, xb = min(H, y0 + patch), min(W, x0 + patch)
            D[ya:yb, xa:xb] += p[ya - y0:yb - y0, xa - x0:xb - x0] * win[ya - y0:yb - y0, xa - x0:xb - x0, None]
            Wt[ya:yb, xa:xb] += win[ya - y0:yb - y0, xa - x0:xb - x0]
    return D / Wt[..., None]

def freckles(H, W, n, rmin, rmax, depth):
    """a field of small soft dots: multiply by (1 - field)"""
    f = np.zeros((H, W), np.float32)
    ys, xs = rng.integers(0, H, n), rng.integers(0, W, n)
    for y, x in zip(ys, xs):
        r = rng.uniform(rmin, rmax); d = depth * rng.uniform(0.4, 1.0); R = int(r * 3) + 1
        ya, yb, xa, xb = max(0, y - R), min(H, y + R + 1), max(0, x - R), min(W, x + R + 1)
        yy, xx = np.mgrid[ya:yb, xa:xb]
        f[ya:yb, xa:xb] += d * np.exp(-((yy - y) ** 2 + (xx - x) ** 2) / (r * r))
    return np.clip(f, 0, 0.35)

# ---------------- the trunk ----------------
# Her chest's tone (the tone the painted neck has at its foot, so the two meet without a line), very slightly warmer low on her belly,
# with a faint unevenness, the fine detail of real skin taken from C18 (her neck and chest, evenly lit), and a scatter of freckles.
H, W = 1408, 2048
C18 = np.asarray(Image.open(ROOT + 'refs/C18.png').convert('RGB').resize((int(1254 * 0.73), int(1254 * 0.73)), Image.LANCZOS)).astype(np.float32)
cm = np.zeros(C18.shape[:2], bool); cm[int(800 * 0.73):int(1085 * 0.73), int(200 * 0.73):int(1050 * 0.73)] = True
cm &= (C18[..., 0] - C18[..., 2] > 30)
rows = np.linspace(1.405, 0.86, H)[:, None]
base = np.ones((H, W, 3), np.float32) * CHEST[None, None, :]
base *= (1 + 0.02 * np.clip((1.18 - rows) / 0.25, 0, 1))[..., None] * np.array([1.0, 0.99, 0.98])
lowN = ndi.gaussian_filter(rng.standard_normal((H // 16, W // 16)).astype(np.float32), 5); lowN = ndi.zoom(lowN / lowN.std(), 16, order=1)[:H, :W]
base *= (1 + 0.006 * lowN)[..., None]
D = detail_from(C18, cm, (H, W), sig=3.0, patch=96, step=60)
outT = base + 1.0 * D
outT *= 1 - freckles(H, W, 1800, 0.7, 1.6, 0.10)[..., None] * np.array([0.8, 1.0, 1.2])
T['dollBody'] = enc(outT)

# ---------------- the legs, from B5 ----------------
P = np.asarray(Image.open(ROOT + 'refs/B5.png').convert('RGB')).astype(np.float32)
sys.path.insert(0, ROOT + 'tools')
from sil import mask_of, figures, spans
m5, _ = mask_of(P); lab5, figs = figures(m5, 20000)
FIG = [lab5 == f[5] for f in figs[:3]]
SOLE = [982, 980, 979]; CEN = [318.0, 729.3, 1223.0]; PXM = 890.0
def legspans(fi, y):
    yy = int(round(SOLE[fi] - y * PXM)); rr = FIG[fi][yy]
    return [(s, e) for s, e in spans(rr) if e - s > 20]
# Io's leg table, to place the legs where the painting does not split them
IO_LEG = {}
src = open(ROOT + 'src/I05_tables.js').read(); IO_LEG = json.loads(src.split('const IO_LEG = ')[1].split(';')[0])
LEG = sorted([(y, v) for y, v in IO_LEG])
def legrow(y):
    ys = [q[0] for q in LEG]; i = int(np.clip(np.searchsorted(ys, y), 1, len(ys) - 1)); a, b_ = LEG[i - 1], LEG[i]; u = (y - a[0]) / (b_[0] - a[0])
    return [a[1][k] + (b_[1][k] - a[1][k]) * u for k in range(5)]
def sample(img, x, y):
    return np.stack([ndi.map_coordinates(img[..., c], [y, x], order=1, mode='nearest') for c in range(3)], -1)
LH, LW = 1024, 512; V0, V1 = 0.03, 1.0
u = (np.arange(LW) + 0.5) / LW; th = (u - 0.25) * 2 * np.pi; lat, frn = np.cos(th), np.sin(th)
L = np.zeros((LH, LW, 3), np.float32); Wsum = np.zeros((LH, LW), np.float32)
views = []
for fi in range(3):
    acc = np.zeros((LH, LW, 3), np.float32); wa = np.zeros((LH, LW), np.float32)
    for row in range(LH):
        y = V1 - (row + 0.5) / LH * (V1 - V0)
        if y < 0.385 or y > 0.845: continue
        sp = legspans(fi, y); rx, rzf, rzb, cx, cz = legrow(min(y, 0.975))
        yi = SOLE[fi] - y * PXM
        if fi == 1:                                     # side: her right side; front of the leg to the image's right
            if not sp: continue
            s0, e0 = sp[0][0], sp[-1][1]; mid, half = (s0 + e0) / 2, (e0 - s0) / 2
            x = mid + frn * half; w = np.clip(lat, 0, 1) ** 1.6
        else:
            if len(sp) >= 2: (a0, a1), (b0, b1) = sp[0], sp[-1]
            else: a0, a1 = CEN[fi] - PXM * (cx + rx), CEN[fi] - PXM * (cx - rx); b0, b1 = CEN[fi] + PXM * (cx - rx), CEN[fi] + PXM * (cx + rx)
            # her right leg: in the front view the left span, its outside to the image's left; in the back view the right span, outside to the right
            lc = np.clip(lat, -0.80, 1.0)            # the inside of the leg is seen edge-on: it is read a little in from the outline
            if fi == 0: mid, half = (a0 + a1) / 2, (a1 - a0) / 2; x = mid - lc * half; w = np.clip(frn, 0, 1) ** 1.6 + 0.45 * np.clip(-lat, 0, 1) ** 2 * (frn > -0.25)
            else: mid, half = (b0 + b1) / 2, (b1 - b0) / 2; x = mid + lc * half; w = np.clip(-frn, 0, 1) ** 1.6 + 0.45 * np.clip(-lat, 0, 1) ** 2 * (frn < 0.25)
        x = np.clip(x, 0, P.shape[1] - 1); c = sample(P, x, np.full_like(x, yi))
        inside = ndi.map_coordinates(FIG[fi].astype(np.float32), [np.full_like(x, yi), x], order=1) > 0.5
        isskin = np.clip((c[:, 0] - c[:, 2] - 28) / 14, 0, 1) * np.clip((c[:, 0] - 110) / 25, 0, 1)
        w = w * inside * isskin
        acc[row] = c; wa[row] = w
    views.append((acc, wa))
# each view brought to one tone (the mean of the front view's well-seen skin)
ref = None
for acc, wa in views:
    sel = wa > 0.5; mu = acc[sel].mean(0)
    if ref is None: ref = mu
for acc, wa in views:
    sel = wa > 0.5; mu = acc[sel].mean(0); acc *= (ref / mu)[None, None, :]
    L += acc * wa[..., None]; Wsum += wa
Lk = Wsum > 0.02
L = L / np.maximum(Wsum, 1e-6)[..., None]
# the painting's light at half strength, and the whole leg brought to the plain arm tone so legs, arms and hands match
low = ndi.gaussian_filter(L * Lk[..., None], (50, 22, 0), mode=('nearest', 'wrap', 'nearest')) / np.maximum(ndi.gaussian_filter(Lk.astype(np.float32), (50, 22), mode=('nearest', 'wrap')), 1e-3)[..., None]
L = np.where(Lk[..., None], L - 0.72 * (low - low[Lk].mean(0)), 0)
L = pushpull(L, Lk.astype(np.float32))
# where no view saw the skin (the inside of the thigh and knee), the carried-on colour is smoothed and given the fine detail of the rest
unk = ~ndi.binary_erosion(Lk, iterations=2); ku = ndi.gaussian_filter(unk.astype(np.float32), 4)[..., None]
Ld = detail_from(L, Lk, L.shape[:2], sig=2.5, patch=40, step=24)
L = L * (1 - ku) + (ndi.gaussian_filter(L, (10, 10, 0)) + 0.9 * Ld) * ku
L *= (SKIN / L[Lk].mean(0) * np.array([1.0, 0.99, 0.985]))[None, None, :]
# above the painted band (under the shorts) and below it (inside the socks): each column's own tone from the nearest well-painted band,
# smoothed round the leg, with fine detail from that band laid on in soft random patches (no copied rows, so no stripes), blended over 6 cm
yrow = V1 - (np.arange(LH) + 0.5) / LH * (V1 - V0)
def rows_of(y0, y1): return np.where((yrow >= y0) & (yrow <= y1))[0]
def carry(y0, y1):
    r = rows_of(y0, y1); tone = ndi.gaussian_filter1d(L[r].mean(0), 10, axis=0, mode='wrap')
    det = detail_from(L[r.min():r.max() + 1], np.ones((len(r), LW), bool), (LH, LW), sig=2.5, patch=36, step=22)
    return tone[None, :, :] + 0.95 * det
lowC, highC = carry(0.42, 0.52), carry(0.70, 0.80)
kl = np.clip((0.46 - yrow) / 0.06, 0, 1)[:, None, None]; kl = kl * kl * (3 - 2 * kl)
kh = np.clip((yrow - 0.80) / 0.04, 0, 1)[:, None, None]; kh = kh * kh * (3 - 2 * kh)
ank = np.clip((0.20 - yrow) / 0.15, 0, 1)[:, None, None] * np.array([0.035, 0.012, 0.0])[None, None, :]       # a little warmer and pinker at the ankle
L = L * (1 - kl - kh) + lowC * (1 + ank) * kl + highC * kh
# the seam at the back (u = 0 / 1): the two ends brought together over a few columns
for c in range(12):
    a = (12 - c) / 24; L[:, c] = L[:, c] * (1 - a) + L[:, -1 - c] * a; L[:, -1 - c] = L[:, -1 - c] * (1 - a) + L[:, c] * a
T['dollLegs'] = enc(L)

# ---------------- the feet, from above ----------------
FH, FW = 600, 280                      # v: 0.30 m heel to toes (row 0 at the toes), u: 0.14 m across (X from -0.07, inner side to the left)
ank = L[int((V1 - 0.12) / (V1 - V0) * LH)].mean(0) * 0.975
Fp = np.ones((FH, FW, 3), np.float32) * ank
X = (np.arange(FW) + 0.5) / FW * 0.14 - 0.07; Z = 0.20 - (np.arange(FH) + 0.5) / FH * 0.30
XX, ZZ = np.meshgrid(X, Z)
warm = np.clip((ZZ - 0.10) / 0.06, 0, 1) * 0.05 + np.exp(-((ZZ + 0.05) / 0.03) ** 2) * 0.04        # redder toes and heel
Fp *= 1 + warm[..., None] * np.array([1.0, 0.25, 0.1])[None, None, :] - warm[..., None] * np.array([0, 0.35, 0.45])[None, None, :] * 0.6
# the toes of D30_doll.js: [knuckle, middle knuckle, tip] as [X, Z, half width]. No nails are painted: they are real plates now.
TOES = [[[-0.0275, 0.101, 0.0130], [-0.0285, 0.137, 0.0123], [-0.0282, 0.1665, 0.0108]], [[-0.0058, 0.110, 0.0081], [-0.0042, 0.137, 0.0075], [-0.0027, 0.1615, 0.0065]],
        [[0.0093, 0.104, 0.0077], [0.0108, 0.128, 0.0072], [0.0124, 0.1505, 0.0062]], [[0.0233, 0.095, 0.0073], [0.0254, 0.117, 0.0068], [0.0274, 0.1375, 0.0059]],
        [[0.0362, 0.084, 0.0069], [0.0392, 0.103, 0.0064], [0.0422, 0.1205, 0.0055]]]
im = Image.fromarray(np.clip(Fp, 0, 255).astype(np.uint8)); dr = ImageDraw.Draw(im, 'RGBA')
px = lambda x, z: ((x + 0.07) / 0.14 * FW, (0.20 - z) / 0.30 * FH)
for i, (a_, b_, c_) in enumerate(TOES):
    for (x, z, rw), n in ((b_, 3), ((a_[0] * 0.4 + b_[0] * 0.6, a_[1] * 0.4 + b_[1] * 0.6, b_[2]), 2)):   # creases over the middle knuckle, and fainter over the first
        for k in range(n):
            zz = z + (k - (n - 1) / 2) * 0.0014; e0, e1 = px(x - rw * 0.85, zz + 0.0005), px(x + rw * 0.85, zz - 0.0005)
            dr.ellipse([e0[0], e0[1], e1[0], e1[1]], fill=(140, 82, 66, 34))
    t0, t1 = px(c_[0] - c_[2] * 1.0, c_[1] + 0.003), px(c_[0] + c_[2] * 1.0, c_[1] - 0.010)
    dr.ellipse([t0[0], t0[1], t1[0], t1[1]], fill=(214, 120, 104, 34))                                      # the tips a little pinker
    k0, k1 = px(b_[0] - b_[2] * 0.9, b_[1] + 0.006), px(b_[0] + b_[2] * 0.9, b_[1] - 0.006)
    dr.ellipse([k0[0], k0[1], k1[0], k1[1]], fill=(206, 122, 100, 26))                                      # and over the knuckles
# the shade between the toes, where they press together
for i in range(4):
    (xa, za, ra), (xb, zb, rb) = TOES[i][1], TOES[i + 1][1]
    xm = (xa + ra + xb - rb) / 2
    q0, q1 = px(xm - 0.0012, max(za, zb) + 0.016), px(xm + 0.0012, min(za, zb) - 0.010)
    dr.rectangle([q0[0], q0[1], q1[0], q1[1]], fill=(120, 70, 58, 30))
im = im.filter(ImageFilter.GaussianBlur(0.8))
Fp = np.asarray(im).astype(np.float32)
Fp = Fp + 0.9 * detail_from(C18, cm, (FH, FW), sig=3.0, patch=48, step=28)
Fp = Fp * (1 - freckles(FH, FW, 120, 0.8, 1.5, 0.08)[..., None] * np.array([0.8, 1.0, 1.1]))
T['dollFeet'] = enc(Fp)
T['dollTone'] = {'trunk': '#%02x%02x%02x' % tuple(int(v) for v in np.clip(outT[int(H * 0.1):int(H * 0.3)].reshape(-1, 3).mean(0), 0, 255)), 'legs': '#%02x%02x%02x' % tuple(int(v) for v in np.clip(L.reshape(-1, 3).mean(0), 0, 255)), 'ankle': '#%02x%02x%02x' % tuple(int(v) for v in np.clip(ank, 0, 255))}
open(OUT + 'io_tex.js', 'w').write(pre + '=' + json.dumps(T) + ';')
for k in ('dollBody', 'dollLegs', 'dollFeet'):
    Image.open(io.BytesIO(base64.b64decode(T[k].split(',', 1)[1]))).convert('RGB').save(ROOT + 'shots/tex_' + k + '.png')
print('dollBody, dollLegs, dollFeet added', T['dollTone'])
