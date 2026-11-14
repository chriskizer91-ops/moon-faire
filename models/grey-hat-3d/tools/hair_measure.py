# Measures his hair off the head paintings: C4 (front and true profile, hair down, glasses on) and C12 (hair from behind).
# usage: python3 -I tools/hair_measure.py        prints small tables, in metres in the model's own frame
# Scale and place of C4 come from landmarks read by eye off gridded copies (lib/grid.py):
#   front:   pupils (212, 351) and (337, 351), the line of his lips y 483
#   profile: eye line y 352, lips y 480, tip of the nose x 1500
# The model has his pupils 0.0644 m apart and 0.0641 m above the line of his lips (bake_face.py), his eye line 1.660 m up and
# the tip of his nose 0.096 m forward. So C4 is 2000 px to the metre in both figures (1940 by the pupils, 2059 and 1997 by eye to lip).
import os, sys, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(ROOT, 'tools'))
from sil import load, mask_of, figures
PPM, R_EYE, R_TIP = 2000.0, 1.660, 0.096
a = load(os.path.join(ROOT, 'refs', 'C4.png')); m, _ = mask_of(a)
CX, EY = 274.5, 351.0
print('C4 front: half-width of the whole outline (hair is the outside of it down to the collar), by height')
print('  height   to his right  to his left   (m)')
for y in np.arange(1.78, 1.47, -0.02):
    r = int(round(EY - (y - R_EYE) * PPM)); xs = np.where(m[r, :520])[0]
    if len(xs): print('  %.2f     %.3f         %.3f' % (y, (CX - xs.min()) / PPM, (xs.max() - CX) / PPM))
col = np.where(m[:, 274])[0]; print('  top of his hair on the middle line: %.3f m' % (R_EYE + (EY - col.min()) / PPM))
EYs, TIP = 352.0, 1500.0
print('C4 profile: how far back the hair reaches, by height (z, forward positive)')
for y in np.arange(1.78, 1.33, -0.02):
    r = int(round(EYs - (y - R_EYE) * PPM)); xs = np.where(m[r, 1013:])[0] + 1013
    if len(xs): print('  %.2f     back %.3f' % (y, R_TIP + (xs.min() - TIP) / PPM))
rows = np.where(m[:, 1013:1500].any(1))[0]; print('  top of his hair: %.3f m' % (R_EYE + (EYs - rows.min()) / PPM))
# C12, from behind: no face to scale it by. Its widest hair is set equal to C4's widest (both show the same hair at shoulder height).
b = load(os.path.join(ROOT, 'refs', 'C12.png')); mb, _ = mask_of(b)
hair = (b[..., 0] < 150) & (b[..., 0] > b[..., 2] + 4) & mb       # brown: darker than linen, redder than the plum ground
from scipy import ndimage as ndi
hair = ndi.binary_opening(hair, iterations=2)
sub = hair[:, 15:513]; rows = np.where(sub.sum(1) > 20)[0]; top, bot = rows.min(), rows.max()
wid = [(sub[r].nonzero()[0].max() - sub[r].nonzero()[0].min()) if sub[r].sum() > 20 else 0 for r in range(sub.shape[0])]
wmax = max(wid); ppm12 = wmax / (2 * 0.124)
print('C12 from behind: hair top row %d, bottom row %d, widest %d px -> %.0f px/m if its widest is C4\'s 0.248 m' % (top, bot, wmax, ppm12))
print('  hair length top to tips: %.3f m' % ((bot - top) / ppm12))
print('  down from top (m)   width (m)   middle (px)')
for d in np.arange(0.02, (bot - top) / ppm12, 0.04):
    r = int(top + d * ppm12); xs = sub[r].nonzero()[0]
    if len(xs) > 5: print('  %.2f               %.3f       %d' % (d, (xs.max() - xs.min()) / ppm12, (xs.max() + xs.min()) / 2 + 15))
# his hair's colours: C12 from behind is nothing but hair. Its pixels sorted by brightness, and the middle colour of each of five bands.
px = b[200:560, 110:420].reshape(-1, 3); lum = px @ np.array([0.299, 0.587, 0.114]); order = np.argsort(lum)
cols = []
for lo, hi in [(0.02, 0.20), (0.20, 0.45), (0.45, 0.70), (0.70, 0.90), (0.90, 0.99)]:
    c = np.median(px[order[int(lo * len(order)):int(hi * len(order))]], 0); cols.append('#%02x%02x%02x' % tuple(int(v) for v in c))
print('hair colours, dark to light (C12, back view, rows 200-560, columns 110-420):', cols)
# B1, the whole figure front and back: how big the hair is there (it is bigger than in C4). Scale: the figure is 957 px tall; the model
# stands 1.82 m to the top of his hair by C4's measure, his soles at 0.
bb = load(os.path.join(ROOT, 'refs', 'B1.png')); mB, _ = mask_of(bb)
brown = (bb[..., 0] < 140) & (bb[..., 0] > bb[..., 2] + 6) & (bb[..., 0] < 2.6 * bb[..., 2]) & mB
brown = ndi.binary_opening(brown, iterations=1)
print('B1 whole figure: half-width of the brown hair by height, front figure and back figure (m), and the lowest brown under the head')
for name, x0, x1, top, bot in [('front', 181, 755, 19, 976), ('back', 781, 1354, 18, 975)]:
    ppm = (bot - top) / 1.80; cx = (x0 + x1) / 2.0; out = []
    for y in np.arange(1.76, 1.30, -0.04):
        r = int(round(top + (1.80 - y) * ppm)); xs = np.where(brown[r, int(cx - 0.2 * ppm):int(cx + 0.2 * ppm)])[0]
        out.append('%.2f:%.3f' % (y, (xs.max() - xs.min()) / 2.0 / ppm) if len(xs) > 3 else '%.2f:  -  ' % y)
    col = np.where(brown[top:int(top + 0.6 * ppm), int(cx - 0.05 * ppm):int(cx + 0.05 * ppm)].sum(1) > 4)[0]
    print('  %-5s %s   lowest %.3f m (%.0f px/m)' % (name, '  '.join(out), 1.80 - col.max() / ppm, ppm))
# where his waves turn: brightness down a few upright strips of hair in C4's profile (behind his ear) and in C12 (the back), smoothed, and
# the distance from one light crest to the next (the first peak of the strip's likeness to itself moved down).
def wave(img, x0, x1, y0, y1, ppm, name):
    lum = img[y0:y1, x0:x1].astype(float) @ np.array([0.299, 0.587, 0.114]); outs = []
    for k in range(0, lum.shape[1] - 12, 12):
        p = ndi.gaussian_filter1d(lum[:, k:k + 12].mean(1), 3); p = p - ndi.gaussian_filter1d(p, 40); best, bl = 0, 0
        for lag in range(int(0.03 * ppm), int(0.14 * ppm)):
            c = float((p[:-lag] * p[lag:]).mean())
            if c > best: best, bl = c, lag
        if bl: outs.append(bl / ppm)
    print('  %-28s crest to crest, down the hair: median %.3f m (strips: %s)' % (name, float(np.median(outs)), ' '.join('%.3f' % v for v in outs)))
print('his waves:')
wave(a, 1050, 1200, 300, 760, PPM, 'C4 profile, behind his ear')
wave(a, 30, 110, 330, 760, PPM, 'C4 front, beside his cheek')
wave(b, 130, 400, 260, 700, ppm12, 'C12, the back')
