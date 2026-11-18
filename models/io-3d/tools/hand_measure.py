# hand_measure.py painting : reads fingertips, webs, finger axes and widths, and the wrist, off the outline of a hands painting
# (back view in the left half, palm view in the right half, thumb toward the middle of the picture). Prints numbers to check by eye.
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
src = sys.argv[1]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32); H, W = a.shape[:2]
bg = np.median(a[:20, :20].reshape(-1, 3), 0)
mask = (np.abs(a - bg).sum(-1) > 60); mask = ndi.binary_opening(mask, iterations=2); mask = ndi.binary_fill_holes(mask)
out = {}
for view, (x0, x1) in (('D', (0, W // 2)), ('P', (W // 2, W))):
    m = mask[:, x0:x1]; lab, n = ndi.label(m); big = np.argmax(ndi.sum(m, lab, range(1, n + 1))) + 1; m = lab == big
    cols = np.where(m.any(0))[0]; top = np.full(m.shape[1], H, int); top[cols] = m.argmax(0)[cols]
    ts = ndi.gaussian_filter1d(top.astype(float), 2)
    tips = [x for x in range(cols[0] + 3, cols[-1] - 3) if ts[x] == ts[x - 12:x + 13].min() and ts[x] < 420]
    tips = [t for i, t in enumerate(tips) if i == 0 or t - tips[i - 1] > 30]
    webs = [int(np.argmax(ts[tips[i]:tips[i + 1]]) + tips[i]) for i in range(len(tips) - 1)]
    print(view, 'tips', [(t + x0, int(top[t])) for t in tips], 'webs', [(w + x0, int(top[w])) for w in webs])
    fingers = []
    for i, t in enumerate(tips):
        # walk down from the tip: at each row take the run of the mask that holds the finger, until it merges with a neighbour
        pts = []; cx = t
        for y in range(int(top[t]) + 6, 700, 4):
            row = m[y]; 
            if not row[int(cx)]: break
            l = int(cx); r = int(cx)
            while l > 0 and row[l - 1]: l -= 1
            while r < len(row) - 1 and row[r + 1]: r += 1
            if pts and (r - l) > 1.45 * np.median([p[2] for p in pts[-12:]]) : break
            pts.append((y, (l + r) / 2, r - l)); cx = (l + r) / 2
        ys = np.array([p[0] for p in pts]); cs = np.array([p[1] for p in pts]); ws = np.array([p[2] for p in pts])
        k = np.polyfit(ys, cs, 1); fingers.append(dict(tip=(float(np.polyval(k, top[t])) + x0, int(top[t])), end=(float(np.polyval(k, ys[-1])) + x0, int(ys[-1])), width_root=float(np.median(ws[-8:])), width_mid=float(np.median(ws)), slope=float(k[0])))
        print('  finger', i, {kk: (np.round(v, 1).tolist() if not isinstance(v, float) else round(v, 1)) for kk, v in fingers[-1].items()})
    # the wrist: the narrowest row below the palm
    wid = m.sum(1); ys = np.arange(H); band = (ys > 560) & (ys < 900); yw = int(ys[band][np.argmin(wid[band])]); r = np.where(m[yw])[0]
    print('  narrowest wrist row', yw, 'x', r[0] + x0, r[-1] + x0, 'width', len(r))
    for y in (500, 560, 620, 700, 760, 800, 900, 1000, 1100, 1200):
        r = np.where(m[y])[0]; print('   row', y, 'x', r[0] + x0, r[-1] + x0, 'width', r[-1] - r[0], 'centre', (r[0] + r[-1]) / 2 + x0)
