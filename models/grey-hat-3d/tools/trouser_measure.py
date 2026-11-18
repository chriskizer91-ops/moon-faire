# Measures his trousers off the paintings, for src/N46_trousers.js (stage 2 of the rebuild):
#   the torn holes        B1 front figure (both legs from the front), B2 (his left side, his right side), B1 back (none)
#   the cloth's pattern   how far apart the flowers are in B1's back view and in F8
#   the fishnet           how big its diamonds are in B5 (on his bare legs), in the holes of B1 and in F8
# (The corset's bottom edge was read by eye off enlarged, gridded copies of B1 and B2; the numbers are in src/N99_static.js at CORSET_CUT.)
# Prints small tables and writes out/trouser_measure.json. Nothing here writes the model's tables: they are set by hand in the source.
# usage: python3 -I tools/trouser_measure.py [pictures_dir]     (with a folder, it also saves pictures of what it found)
import os, sys, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load
from scipy import ndimage as ndi
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = json.load(open(os.path.join(ROOT, 'out', 'registration.json'))); ZOFF = 0.035
PIC = sys.argv[1] if len(sys.argv) > 1 else None
out = {}
# where a pixel of a view is on him, in metres. across: x for the front (his left is positive), -x for the back, z for the sides (forward is positive)
def to_m(view, px, py):
    r = REG[view]; a = (px - r['c']) / r['pxm']; h = (r['y1'] - py) / r['pxm']
    if view == 'sideR': a = a - ZOFF
    if view == 'sideL': a = -(a + ZOFF)
    if view == 'back': a = -a
    return a, h
def to_px(view, a, h):
    r = REG[view]
    if view == 'sideR': a = a + ZOFF
    if view == 'sideL': a = -a - ZOFF
    if view == 'back': a = -a
    return r['c'] + a * r['pxm'], r['y1'] - h * r['pxm']

# ---------- the holes: skin showing through, between the boot tops and the corset ----------
def holes(view):
    r = REG[view]; a = load(os.path.join(ROOT, 'refs', r['name'])); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    skin = (R > 150) & (R - B > 45) & (G > 85) & (G - B > 12)          # his skin between the threads of the net; the red of the cloth has little green
    skin = ndi.binary_closing(skin, iterations=3)                       # the net's threads are closed over
    skin = ndi.binary_opening(skin, iterations=2)
    sel = np.zeros_like(skin); y0 = int(r['y1'] - 1.00 * r['pxm']); y1 = int(r['y1'] - 0.40 * r['pxm']); sel[y0:y1, r['x0']:r['x1']] = True
    if view == 'front': sel[:, :int(r['c'] - 0.26 * r['pxm'])] = False; sel[:, int(r['c'] + 0.26 * r['pxm']):] = False       # not his hands
    lab, n = ndi.label(skin & sel); res = []
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        if len(ys) < 150: continue
        cx, cy = xs.mean(), ys.mean(); C = np.cov(np.stack([xs - cx, -(ys - cy)])); w, v = np.linalg.eigh(C); major = v[:, 1] * (1 if v[1, 1] >= 0 else -1)
        t = (xs - cx) * major[0] - (ys - cy) * major[1]; u = (xs - cx) * major[1] + (ys - cy) * major[0]
        L = (np.percentile(t, 99.5) - np.percentile(t, 0.5)) / r['pxm']; Wd = (np.percentile(u, 99.5) - np.percentile(u, 0.5)) / r['pxm']
        ac, hc = to_m(view, cx, cy); a0, _ = to_m(view, xs.min(), cy); a1, _ = to_m(view, xs.max(), cy); _, h0 = to_m(view, cx, ys.max()); _, h1 = to_m(view, cx, ys.min())
        ang = np.degrees(np.arctan2(major[1], major[0] * (-1 if view in ('sideL', 'back') else 1)))       # tilt of the long axis, degrees up from 'across' as measured on him
        if ang > 90: ang -= 180
        res.append(dict(across=round(ac, 4), h=round(hc, 4), a0=round(min(a0, a1), 4), a1=round(max(a0, a1), 4), h0=round(h0, 4), h1=round(h1, 4), long=round(L, 4), wide=round(Wd, 4), tilt=round(float(ang), 1), px=[int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], area=int(len(ys))))
    res.sort(key=lambda q: -q['h'])
    if PIC:
        im = Image.fromarray(a.astype(np.uint8)).convert('RGB'); ov = np.asarray(im).copy(); ov[(lab > 0)] = (0.5 * ov[(lab > 0)] + np.array([0, 127, 127])).astype(np.uint8)
        Image.fromarray(ov).crop((r['x0'], y0 - 30, r['x1'], y1 + 30)).save(os.path.join(PIC, 'holes_%s.png' % view))
    return res
for view, what, name in (('front', 'x (his left is +)', 'B1 front'), ('sideL', 'z (forward is +)', 'B2, his LEFT side'), ('sideR', 'z (forward is +)', 'B2, his RIGHT side'), ('back', 'x', 'B1 back')):
    hs = holes(view); out['holes_' + view] = hs
    print('\nholes in %s: %d    across = %s, metres' % (name, len(hs), what))
    if hs: print('   n  leg | middle across, height | across from..to    | height from..to | long   wide   tilt')
    for i, q in enumerate(hs):
        leg = ('L' if q['across'] > 0 else 'R') if view == 'front' else ('L' if view == 'sideL' else 'R')
        q['leg'] = leg
        print('  %2d   %s  |  %+.3f   %.3f      | %+.3f .. %+.3f  | %.3f .. %.3f  | %.3f  %.3f  %+5.1f' % (i + 1, leg, q['across'], q['h'], q['a0'], q['a1'], q['h0'], q['h1'], q['long'], q['wide'], q['tilt']))

# ---------- how often a pattern repeats: the nearest strong peaks of a picture laid over a shifted copy of itself ----------
def repeats(g, mind):
    g = g - g.mean(); F = np.fft.rfft2(g); ac = np.fft.fftshift(np.fft.irfft2(F * np.conj(F), s=g.shape)); ac = ac / ac.max()
    h, w = ac.shape; cy, cx = h // 2, w // 2; mx = ndi.maximum_filter(ac, size=2 * mind + 1); res = []
    for y, x in np.argwhere((ac == mx) & (ac > 0.12)):
        if x - cx > 0 or (x == cx and y > cy): res.append((float(ac[y, x]), int(x - cx), int(y - cy)))
    return sorted(res, key=lambda q: np.hypot(q[1], q[2]))[:4]
def band(a, s): g = 255 - a.mean(-1); return g - ndi.gaussian_filter(g, s)        # dark threads, with the slow shading taken off
B1 = load(os.path.join(ROOT, 'refs', 'B1.png')); B5 = load(os.path.join(ROOT, 'refs', 'B5.png')); F8 = load(os.path.join(ROOT, 'refs', 'F8.png'))
pxm1 = REG['front']['pxm']; fg5 = np.abs(B5 - B5[5, 5]).sum(-1) > 60; rows5 = np.nonzero(fg5[:, :B5.shape[1] // 3].any(1))[0]; pxm5 = (rows5[-1] - rows5[0]) / 1.78
print('\nthe fishnet: one diamond, from the nearest repeats of the net (B5 is scaled by his height, 1.78 m, head to sole: %.0f px to a metre)' % pxm5)
print('   where                       | repeat along one thread set, the other (px) | diamond wide x tall (cm)')
def net(nm, a, box, pxm, s):
    x0, y0, x1, y1 = box; r = [q for q in repeats(band(a, s)[y0:y1, x0:x1], 2) if q[2] != 0 and q[1] != 0][:2]
    if len(r) < 2: print('   %-27s | not found' % nm); return
    wd = abs(r[0][1]) + abs(r[1][1]); tl = abs(r[0][2]) + abs(r[1][2]); out.setdefault('net', {})[nm] = [round(100 * wd / pxm, 2), round(100 * tl / pxm, 2)]
    print('   %-27s | (%+d, %+d)  (%+d, %+d)                    | %.2f x %.2f' % (nm, r[0][1], r[0][2], r[1][1], r[1][2], 100 * wd / pxm, 100 * tl / pxm))
for nm, box in (('B5 front, his right thigh', (170, 270, 270, 400)), ('B5 front, his left thigh', (340, 270, 440, 400)), ('B5 front, his right calf', (160, 520, 250, 610)), ('B5 back, a thigh', (1100, 280, 1200, 400)), ('B5 back, a calf', (1090, 520, 1170, 610))): net(nm, B5, box, pxm5, 4)
for nm, box in (('B1 front, left leg hole 2', (528, 545, 568, 580)), ('B1 front, right leg hole 1', (378, 558, 428, 582))): net(nm, B1, box, pxm1, 3)
r = [q for q in repeats(band(F8, 20)[480:780, 300:950], 12) if q[1] != 0 and q[2] != 0][:2]
if len(r) == 2: print('   F8, in the hole (no scale)  | (%+d, %+d)  (%+d, %+d)                  | wide : tall = 1 : %.2f' % (r[0][1], r[0][2], r[1][1], r[1][2], (abs(r[0][2]) + abs(r[1][2])) / (abs(r[0][1]) + abs(r[1][1]))))
print('\nthe cloth: how far apart the flowers are (nearest repeats of the red print)')
red = lambda a: np.clip(a[..., 0] - np.maximum(a[..., 1], a[..., 2]), 0, 255)
for nm, a, box, pxm, mind in (('B1 back, the seat', B1, (990, 470, 1140, 600), pxm1, 8), ('B1 back, his left leg', B1, (950, 560, 1050, 720), pxm1, 8), ('F8, top band (no scale)', F8, (0, 0, 1254, 360), None, 20)):
    x0, y0, x1, y1 = box; r = repeats(red(a)[y0:y1, x0:x1], mind)[:3]
    print('   %-24s | %s' % (nm, '   '.join('(%+d, %+d) px%s' % (q[1], q[2], (' = %.1f cm' % (100 * np.hypot(q[1], q[2]) / pxm)) if pxm else '') for q in r)))
json.dump(out, open(os.path.join(ROOT, 'out', 'trouser_measure.json'), 'w'), indent=1)
