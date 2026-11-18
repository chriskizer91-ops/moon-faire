# Lays his paintings back onto him. Stage one paints the whole model from four paintings, each laid on flat from its own side and
# mixed by which way the surface faces: B1 front, B1 back, B2 right side, B2 left side. This cuts each figure out, carries its colours
# outward past its outline (so the plum backdrop is never pulled onto him where a surface turns away), and writes
# out/tex_proj.json = { front, back, sideR, sideL, armR, armL (pictures), win (where each picture sits on him, in metres), skin, ... }.
# usage: python3 -I bake_proj.py      (run tools/tables.py first: it writes out/registration.json)
import os, io, sys, json, base64, numpy as np
ROOT = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(ROOT, 'tools'))
from sil import load, mask_of, figures
from PIL import Image
from scipy import ndimage as ndi
ZOFF, PAD = 0.035, 18
reg = json.load(open(os.path.join(ROOT, 'out', 'registration.json')))
def uri(arr, q=88):
    b = io.BytesIO(); Image.fromarray(arr.astype(np.uint8)).save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
out, win = {}, {}
for key, r in reg.items():
    a = load(os.path.join(ROOT, 'refs', r['name'])); m, _ = mask_of(a); lab, figs = figures(m, 20000); fm = lab == figs[r['fi']][5]
    H, W = fm.shape; bx0, by0, bx1, by1 = max(0, r['x0'] - PAD), max(0, r['y0'] - PAD), min(W, r['x1'] + PAD), min(H, r['y1'] + PAD)
    core = ndi.binary_erosion(fm, iterations=2)
    _, idx = ndi.distance_transform_edt(~core, return_indices=True)
    filled = a[idx[0], idx[1]]                                   # every pixel outside takes the nearest colour inside
    soft = np.stack([ndi.gaussian_filter(filled[..., c], 2.0) for c in range(3)], -1)
    d = ndi.distance_transform_edt(~core); k = np.clip(d / 6.0, 0, 1)[..., None]
    res = a * (1 - np.clip(d, 0, 1)[..., None]) + (filled * (1 - k) + soft * k) * np.clip(d, 0, 1)[..., None]
    crop = res[by0:by1, bx0:bx1]; out[key] = uri(crop)
    ym0, ym1 = (r['y1'] - by1) / r['pxm'], (r['y1'] - by0) / r['pxm']
    xm0, xm1 = (bx0 - r['c']) / r['pxm'], (bx1 - r['c']) / r['pxm']
    if key in ('sideR', 'armR'): xm0, xm1 = xm0 - ZOFF, xm1 - ZOFF        # the shader reads these pictures by Z
    if key in ('sideL', 'armL'): xm0, xm1 = xm0 + ZOFF, xm1 + ZOFF        # and these by -Z
    win[key] = [round(v, 5) for v in (xm0, xm1, ym0, ym1)]
    print(key, r['name'], 'figure', r['fi'], 'crop %dx%d' % (bx1 - bx0, by1 - by0), 'window', win[key], '%d KB' % (len(out[key]) // 1024))
# his skin tone, from the backs of his bare hands (D3)
a = load(os.path.join(ROOT, 'refs', 'D3.png')); m, _ = mask_of(a); px = a[ndi.binary_erosion(m, iterations=12)]
lum = px.mean(1); sel = px[(lum > np.percentile(lum, 35)) & (lum < np.percentile(lum, 80))]; skin = np.median(sel, 0)
out['skin'] = '#%02x%02x%02x' % tuple(int(round(v)) for v in skin); out['win'] = win
# the tone of his fingers as B1 paints them, so the plain hands agree with the painted forearms beside them
r = reg['front']; a = load(os.path.join(ROOT, 'refs', r['name'])); px = []
for sx in (-1, 1):
    x0, x1 = sorted((r['c'] + sx * 0.455 * r['pxm'], r['c'] + sx * 0.525 * r['pxm'])); y0, y1 = r['y1'] - 0.875 * r['pxm'], r['y1'] - 0.80 * r['pxm']
    px.append(a[int(y0):int(y1), int(x0):int(x1)].reshape(-1, 3))
px = np.concatenate(px); px = px[(px[:, 0] > 120) & (px[:, 0] - px[:, 2] > 35)]
if len(px) > 50: out['skinHand'] = '#%02x%02x%02x' % tuple(int(round(v)) for v in np.median(px, 0)); print('skin of the fingers in B1', out['skinHand'], len(px), 'pixels')
print('skin', out['skin'])
json.dump(out, open(os.path.join(ROOT, 'out', 'tex_proj.json'), 'w')); print('out/tex_proj.json %.2f MB (build.sh joins it into out/noiz_tex.js)' % (os.path.getsize(os.path.join(ROOT, 'out', 'tex_proj.json')) / 1e6))
