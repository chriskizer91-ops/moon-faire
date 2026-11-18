# paint_clean.py CODE [--preview] [--undo] [--tol 14]
# The outfit paintings show her own skin (arms and hands over the dress, her chest, legs under a hem) and, outside the figure,
# the plum background. A garment piece that lies a little off the painted outline, or where her painted arm hangs over the cloth
# (the side view, at her hips), would take those colours: pink and lilac patches on the sides of a dress, the tops of the shoulders.
# This takes them out of the outfit's atlas (wardrobe/CODE_tex.js): her skin is found by the colour of her own cheeks in the same
# painting, and it and the background are filled from the cloth around them (push-pull), so every piece reads cloth. The atlas's
# alpha (the outline, for see-through parts) and the views' registration are not changed. The first run keeps the original as
# wardrobe/_orig/CODE_tex.js; --undo puts it back; --preview writes shots/wear/CODE_clean.jpg (the skin found, in green) and changes nothing.
import sys, os, io, json, base64, argparse
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.color import rgb2lab

IO = '/home/claude/io/'
ap = argparse.ArgumentParser(); ap.add_argument('code'); ap.add_argument('--preview', action='store_true'); ap.add_argument('--undo', action='store_true')
ap.add_argument('--tol', type=float, default=14.0, help='hue tolerance (degrees, Lab) round her cheeks\' hue')
ap.add_argument('--keep', default='', help='boxes to leave alone, metres in the paintings: view:x0,x1,y0,y1;...')
A = ap.parse_args(); code = A.code
path = IO + 'wardrobe/%s_tex.js' % code; orig = IO + 'wardrobe/_orig/%s_tex.js' % code
if A.undo:
    if os.path.exists(orig): open(path, 'w').write(open(orig).read()); print(code, 'restored')
    sys.exit(0)
src = open(orig).read() if os.path.exists(orig) else open(path).read()
i = src.index('= {', src.index('DOLLWEAR_TEX[')); T = json.loads(src[i + 2:src.rindex('}') + 1])
im = np.asarray(Image.open(io.BytesIO(base64.b64decode(T['atlas'].split(',', 1)[1]))).convert('RGBA')).astype(np.float32)
rgb, alpha = im[..., :3], im[..., 3]
lab = rgb2lab(np.clip(rgb / 255, 0, 1))
L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]; C = np.hypot(a, b); Hh = np.degrees(np.arctan2(b, a))
V = T['views']

def px(view, x, y):          # a point of her (metres; x across, or z in the side view) to the atlas
    v = V[view]; return v['c0'] + v['kc'] * x, v['r0'] - v['k'] * y

def patch(view, x, y, r=0.008):
    c, rr = px(view, x, y); k = V[view]['k']; d = max(2, int(r * k))
    c, rr = int(round(c)), int(round(rr)); s = (slice(max(0, rr - d), rr + d + 1), slice(max(0, c - d), c + d + 1))
    return np.stack([L[s].ravel(), a[s].ravel(), b[s].ravel()], 1), alpha[s].ravel()

# her skin's colour: her cheeks in the front and side paintings (masks, scarves and hats leave the cheeks bare)
samples = []
for view, pts in (('front', [(-0.040, 1.478), (0.040, 1.478), (-0.032, 1.462), (0.032, 1.462)]), ('side', [(0.045, 1.478), (0.050, 1.462)])):
    for (x, y) in pts:
        p, al = patch(view, x, y); samples.append(p[al > 200])
S = np.concatenate(samples); ref = np.median(S, 0); refC = float(np.hypot(ref[1], ref[2])); refH = float(np.degrees(np.arctan2(ref[2], ref[1])))
print('%s: skin L %.0f  C %.1f  hue %.0f' % (code, ref[0], refC, refH))

keeps = []
for part in filter(None, A.keep.split(';')):
    vn, nums = part.split(':'); x0, x1, y0, y1 = map(float, nums.split(',')); keeps.append((vn, x0, x1, y0, y1))

out = rgb.copy(); prev = rgb.copy(); total = 0
for view in ('front', 'side', 'back'):
    v = V[view]; X0, Y0, X1, Y1 = [int(round(t)) for t in v['rect']]; X1 += 1; Y1 += 1
    sl = (slice(Y0, Y1), slice(X0, X1))
    fig = alpha[sl] > 128
    dh = np.abs(((Hh[sl] - refH) + 180) % 360 - 180)
    skin = fig & (dh < A.tol) & (C[sl] > 0.50 * refC) & (C[sl] < 1.75 * refC) & (L[sl] > ref[0] - 42) & (L[sl] < ref[0] + 20)
    skin = ndi.binary_opening(skin, iterations=1)
    lab_, n = ndi.label(skin)
    if n:
        sizes = ndi.sum(skin, lab_, range(1, n + 1)); skin = np.isin(lab_, 1 + np.where(sizes >= 40)[0])
    skin = ndi.binary_dilation(skin, iterations=2) & fig            # the soft edge of an arm or hand goes too
    for (vn, x0, x1, y0, y1) in keeps:
        if vn != view: continue
        ca, ra = px(view, x0, y1); cb, rb = px(view, x1, y0); c0_, c1_ = sorted((ca, cb)); r0_, r1_ = sorted((ra, rb))
        skin[max(0, int(r0_) - Y0):max(0, int(r1_) - Y0), max(0, int(c0_) - X0):max(0, int(c1_) - X0)] = False
    good = fig & ~skin; good = ndi.binary_erosion(good, iterations=1)
    w = good.astype(np.float32); reg = rgb[sl]
    # push-pull: the cloth's colours carried into the holes, smoothly
    imgs, ws = [reg * w[..., None]], [w]
    while min(imgs[-1].shape[:2]) > 4:
        bb, vv = imgs[-1], ws[-1]; h2, w2 = vv.shape[0] // 2 * 2, vv.shape[1] // 2 * 2; bb = bb[:h2, :w2]; vv = vv[:h2, :w2]
        imgs.append(bb[0::2, 0::2] + bb[1::2, 0::2] + bb[0::2, 1::2] + bb[1::2, 1::2]); ws.append(vv[0::2, 0::2] + vv[1::2, 0::2] + vv[0::2, 1::2] + vv[1::2, 1::2])
    cur = imgs[-1] / np.maximum(ws[-1], 1e-6)[..., None]
    for bb, vv in zip(imgs[-2::-1], ws[-2::-1]):
        up = ndi.zoom(cur, (vv.shape[0] / cur.shape[0], vv.shape[1] / cur.shape[1], 1), order=1)
        if up.shape[:2] != vv.shape: up = np.pad(up, ((0, vv.shape[0] - up.shape[0]), (0, vv.shape[1] - up.shape[1]), (0, 0)), mode='edge')
        kk = np.clip(vv, 0, 1)[..., None]; cur = (bb / np.maximum(vv, 1e-6)[..., None]) * kk + up * (1 - kk)
    filled = np.where(good[..., None], reg, cur)
    out[sl] = filled; total += int(skin.sum())
    pv = prev[sl]; pv[skin] = pv[skin] * 0.35 + np.array([40, 255, 90]) * 0.65; prev[sl] = pv
    print('  %s: skin %d px (%.1f%% of the figure)' % (view, skin.sum(), 100 * skin.sum() / max(1, fig.sum())))

if A.preview:
    os.makedirs(IO + 'shots/wear', exist_ok=True)
    side = np.concatenate([prev, out], 1)
    Image.fromarray(np.clip(side, 0, 255).astype(np.uint8)).save(IO + 'shots/wear/%s_clean.jpg' % code, quality=82)
    print('preview: shots/wear/%s_clean.jpg' % code); sys.exit(0)
os.makedirs(IO + 'wardrobe/_orig', exist_ok=True)
if not os.path.exists(orig): open(orig, 'w').write(src)
atl = np.concatenate([np.clip(out, 0, 255), alpha[..., None]], -1).astype(np.uint8)
bio = io.BytesIO(); Image.fromarray(atl, 'RGBA').save(bio, 'WEBP', quality=88, method=6, exact=True)
T['atlas'] = 'data:image/webp;base64,' + base64.b64encode(bio.getvalue()).decode(); T['cleaned'] = True
open(path, 'w').write('window.DOLLWEAR_TEX = window.DOLLWEAR_TEX || {};\nDOLLWEAR_TEX[%s] = %s;\n' % (json.dumps(code), json.dumps(T)))
print('%s: cleaned, %d px of skin filled; atlas %.0f KB' % (code, total, len(bio.getvalue()) / 1024))
