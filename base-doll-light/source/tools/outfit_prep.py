# Prepares an outfit's paintings for the wardrobe:  python3 tools/outfit_prep.py CODE [--heel 0.07]
# Reads refs_outfits/CODEA.png (three paintings side by side: front, her right side facing the image's right edge, back), and writes
# wardrobe/CODE_tex.js: one picture holding the three views (light evened out, the plum background replaced by the edge colours of the
# figure, the figure's outline kept in the alpha), and how each view lines up with the doll:
#     view column = c0 + kc * h,  view row = r0 - k * y      (h = x for front and back, z for the side view; y = height at rest, metres)
# Lining up uses two marks found in each painting: the lowest point of her feet (or shoes) and the narrowest point of her neck, put at
# the doll's own (0.035 m, or 0.035 - heel when she stands in heels; and 1.410 m, 1.388 m from the side), with the middle of her neck as the middle line.
# If a mark is found wrong (a high collar, a hat brim), put the right rows in wardrobe/CODE_prep.json:
#     {"heel": 0.07, "front": {"neck": 212, "sole": 975, "mid": 250}, "side": {...}, "back": {...}}    (rows and columns in CODEA.png)
# It also writes shots/wear/CODE_prep.jpg: the three views with the marks drawn, to check.
import sys, os, io, json, base64, argparse
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
IO = '/home/claude/io/'
YS, ZN = 0.035, -0.0231                    # the doll: lowest point of her bare feet; the middle of her neck seen from the side (z; her front is +z)
YNV = {'front': 1.410, 'back': 1.410, 'side': 1.388}   # the middle of the narrowest stretch of her neck, as each view sees it
ap = argparse.ArgumentParser(); ap.add_argument('code'); ap.add_argument('--heel', type=float, default=None); ap.add_argument('--flatten', type=float, default=0.5)
ap.add_argument('--img', default=None); A = ap.parse_args()
code = A.code; src = A.img or IO + 'refs_outfits/%sA.png' % code
over = {}
if os.path.exists(IO + 'wardrobe/%s_prep.json' % code): over = json.load(open(IO + 'wardrobe/%s_prep.json' % code))
heel = A.heel if A.heel is not None else over.get('heel', 0.0)
img = np.asarray(Image.open(src).convert('RGB')).astype(np.float32); H, W = img.shape[:2]

# the figure: everything that is not the flat plum background
border = np.concatenate([img[:6].reshape(-1, 3), img[-6:].reshape(-1, 3), img[:, :6].reshape(-1, 3), img[:, -6:].reshape(-1, 3)])
bg = np.median(border, 0); dist = np.sqrt(((img - bg) ** 2).sum(-1))
m = dist > 24; m = ndi.binary_opening(m, iterations=1); m = ndi.binary_fill_holes(m)
lab, n = ndi.label(m); sizes = ndi.sum(m, lab, range(1, n + 1)); keep = np.isin(lab, 1 + np.where(sizes > 1500)[0]); m = keep
soft = np.clip((dist - 10) / 22, 0, 1) * ndi.binary_dilation(m, iterations=2)     # see-through parts (wings) keep a partial alpha

# the three panels: split at the two widest empty gaps between figures (or at thirds)
colocc = m.any(0); cuts = []
runs = []; x = 0
while x < W:
    if not colocc[x]:
        x0 = x
        while x < W and not colocc[x]: x += 1
        if x0 > 0 and x < W: runs.append((x - x0, (x0 + x) // 2))
    else: x += 1
runs.sort(reverse=True)
if len(runs) >= 2 and runs[1][0] >= 4: cuts = sorted([runs[0][1], runs[1][1]])
else: cuts = [W // 3, 2 * W // 3]
panels = {'front': (0, cuts[0]), 'side': (cuts[0], cuts[1]), 'back': (cuts[1], W)}

def marks(name, x0, x1):
    pm = m[:, x0:x1]; rows = np.where(pm.any(1))[0]; top, sole = int(rows.min()), int(rows.max()); Hh = sole - top
    # the neck: the narrowest part of the figure's middle between 6% and 24% of the way down (widths smoothed over 9 rows)
    cm = np.where(pm[int(top + 0.30 * Hh)])[0]; cm = (cm.min() + cm.max()) / 2 if len(cm) else (x1 - x0) / 2
    rr = list(range(int(top + 0.06 * Hh), int(top + 0.24 * Hh))); ws, mids = [], []
    for r in rr:
        xs = np.where(pm[r])[0]; xs = xs[np.abs(xs - cm) < 0.12 * Hh]
        if len(xs) < 2: ws.append(9e9); mids.append(cm); continue
        ws.append(xs.max() - xs.min()); mids.append((xs.max() + xs.min()) / 2)
    ws = ndi.median_filter(np.array(ws, float), 9, mode='nearest'); near = np.where(ws <= ws.min() + 2)[0]; i = int(near[len(near) // 2]); best = (ws[i], rr[i], mids[i] + x0)   # the middle of the narrowest stretch
    o = over.get(name, {})
    return {'top': top, 'sole': o.get('sole', sole), 'neck': o.get('neck', best[1]), 'mid': o.get('mid', best[2])}

def pushpull(a, w):
    imgs, ws = [a * w[..., None]], [w.astype(np.float32)]
    while min(imgs[-1].shape[:2]) > 4:
        b, v = imgs[-1], ws[-1]; h2, w2 = v.shape[0] // 2 * 2, v.shape[1] // 2 * 2; b = b[:h2, :w2]; v = v[:h2, :w2]
        imgs.append(b[0::2, 0::2] + b[1::2, 0::2] + b[0::2, 1::2] + b[1::2, 1::2]); ws.append(v[0::2, 0::2] + v[1::2, 0::2] + v[0::2, 1::2] + v[1::2, 1::2])
    cur = imgs[-1] / np.maximum(ws[-1], 1e-6)[..., None]; cur[ws[-1] <= 0] = imgs[0].reshape(-1, 3).sum(0) / max(ws[0].sum(), 1e-6)
    for b, v in zip(imgs[-2::-1], ws[-2::-1]):
        up = ndi.zoom(cur, (v.shape[0] / cur.shape[0], v.shape[1] / cur.shape[1], 1), order=1); k = np.clip(v, 0, 1)[..., None]
        cur = (b / np.maximum(v, 1e-6)[..., None]) * k + up * (1 - k)
    return cur

out_views, crops, X = {}, [], 0
vis = Image.fromarray(img.astype(np.uint8)); d = ImageDraw.Draw(vis)
for name in ('front', 'side', 'back'):
    x0, x1 = panels[name]; mk = marks(name, x0, x1)
    k = (mk['sole'] - mk['neck']) / (YNV[name] - (YS - heel))
    # crop: the figure's box with a margin
    pm = m[:, x0:x1]; cols = np.where(pm.any(0))[0]; cx0, cx1 = max(0, x0 + cols.min() - 24), min(W, x0 + cols.max() + 25)
    ry0, ry1 = max(0, mk['top'] - 24), min(H, mk['sole'] + 25)
    crop = img[ry0:ry1, cx0:cx1].copy(); cm = m[ry0:ry1, cx0:cx1]; ca = soft[ry0:ry1, cx0:cx1]
    # the painting's light, broad, partly taken out (its folds and seams stay)
    lum = crop @ np.array([0.3, 0.55, 0.15], np.float32); wsum = ndi.gaussian_filter(cm.astype(np.float32), 30)
    big = ndi.gaussian_filter(lum * cm, 30) / np.maximum(wsum, 1e-3); med = np.median(lum[cm])
    crop = crop * np.where(cm, (med / np.maximum(big, 1)) ** A.flatten, 1)[..., None]
    # outside the figure: the figure's own edge colours carried outward, so nothing samples the plum background
    inner = ndi.binary_erosion(cm, iterations=2)
    crop = pushpull(crop, inner.astype(np.float32)) * (1 - inner[..., None]) + crop * inner[..., None]
    crops.append((name, crop, ca, X))
    c0 = X + (mk['mid'] - cx0); r0 = (mk['sole'] - ry0) + k * (YS - heel)
    if name == 'side': c0 -= k * ZN
    out_views[name] = {'c0': round(float(c0), 2), 'kc': round(float(k if name != 'back' else -k), 3), 'r0': round(float(r0), 2), 'k': round(float(k), 3),
                       'rect': [X + 0.5, 0.5, X + crop.shape[1] - 0.5, crop.shape[0] - 0.5], 'marks': mk, 'crop': [int(cx0), int(ry0)]}
    X += crop.shape[1]
    for r, col in ((mk['neck'], (80, 255, 120)), (mk['sole'], (255, 200, 60))): d.line([(x0, r), (x1, r)], fill=col, width=2)
    d.line([(mk['mid'], mk['neck'] - 40), (mk['mid'], mk['neck'] + 40)], fill=(80, 255, 120), width=2)
    d.text((x0 + 8, 8), '%s  k=%.0f px/m' % (name, k), fill=(255, 255, 255))
AH = max(c[1].shape[0] for c in crops); AW = X
atlas = np.zeros((AH, AW, 4), np.uint8)
for name, crop, ca, x in crops:
    h, w = crop.shape[:2]; atlas[:h, x:x + w, :3] = np.clip(crop, 0, 255).astype(np.uint8); atlas[:h, x:x + w, 3] = (ca * 255).astype(np.uint8)
for name in out_views:                                    # rows of the atlas: each crop starts at the top
    pass
b = io.BytesIO(); Image.fromarray(atlas, 'RGBA').save(b, 'WEBP', quality=88, method=6)
uri = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
for v in out_views.values(): v.pop('crop')
os.makedirs(IO + 'wardrobe', exist_ok=True); os.makedirs(IO + 'shots/wear', exist_ok=True)
js = 'window.DOLLWEAR_TEX = window.DOLLWEAR_TEX || {};\nDOLLWEAR_TEX[%s] = %s;\n' % (json.dumps(code), json.dumps({'atlas': uri, 'W': AW, 'H': AH, 'heel': heel, 'views': out_views}))
open(IO + 'wardrobe/%s_tex.js' % code, 'w').write(js)
vis.resize((W // 2, H // 2)).save(IO + 'shots/wear/%s_prep.jpg' % code, quality=85)
print('%s: atlas %dx%d, %.0f KB; k front %.0f side %.0f back %.0f px/m; heel %.3f' % (code, AW, AH, len(b.getvalue()) / 1024, out_views['front']['k'], out_views['side']['k'], out_views['back']['k'], heel))
