# prints silhouette tables in meters for one figure of a painting
# usage: measure.py painting figIndex pxPerM mode [step]    mode: front | side+ (faces right) | side- (faces left)
import sys, numpy as np
sys.path.insert(0, '/home/claude/ranger/tools')
from sil import load, mask_of, figures, spans
path, fi, pxm, mode = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
step = float(sys.argv[5]) if len(sys.argv) > 5 else 0.025
a = load(path); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]; fm = lab == f[5]
x0, y0, x1, y1 = f[:4]; sole = y1
if pxm <= 0: pxm = (y1 - y0) / -pxm          # negative: the figure's full height in meters
# sock rows: light, nearly grey pixels
r, g, b = a[..., 0], a[..., 1], a[..., 2]
sock = fm & (r > 105) & (g > 95) & (b > 105) & (np.abs(r - b) < 22) & (r - g < 28) & (r - g > -4)
rows = np.where(sock[:, x0:x1].sum(1) > 0.10 * fm[:, x0:x1].sum(1).clip(1))[0]
rows = rows[rows > y0 + 0.6 * (y1 - y0)]
print('%s fig %d  x %d-%d y %d-%d  pxm %.1f  height %.3f m' % (path.split('/')[-1], fi, x0, x1, y0, y1, pxm, (y1 - y0) / pxm))
if len(rows): print('sock rows y %d-%d  -> heights %.3f to %.3f m' % (rows.min(), rows.max(), (sole - rows.max()) / pxm, (sole - rows.min()) / pxm))
H = lambda yy: (sole - yy) / pxm
def row_spans(h):
    yy = int(round(sole - h * pxm)); 
    if yy < y0 or yy >= y1: return []
    rr = fm[max(y0, yy - 1):yy + 2].sum(0) >= 2
    return [(s, e) for s, e in spans(rr) if e - s >= 3]
if mode == 'front':
    # centre line: middle of the single span at the waist rows (narrowest between 0.95 and 1.15 m)
    best = None
    for h in np.arange(0.95, 1.16, 0.01):
        sp = row_spans(h)
        if not sp: continue
        c = max(sp, key=lambda s: s[1] - s[0])
        if best is None or c[1] - c[0] < best[1] - best[0]: best = c; hb = h
    cx = (best[0] + best[1]) / 2
    print('centre x %.1f (waist %.3f m wide at %.2f m)' % (cx, (best[1] - best[0]) / pxm, hb))
    h = 0.0
    while h < (y1 - y0) / pxm:
        sp = row_spans(h)
        print('%.3f  ' % h + '  '.join('[%+.3f %+.3f]' % ((s - cx) / pxm, (e - cx) / pxm) for s, e in sp))
        h += step
else:
    sgn = 1 if mode == 'side+' else -1
    # axis: centre of the leg just above the sock (shin), averaged
    cs = []
    for h in np.arange(0.32, 0.40, 0.01):
        sp = row_spans(h)
        if sp: c = max(sp, key=lambda s: s[1] - s[0]); cs.append((c[0] + c[1]) / 2)
    ax = float(np.mean(cs)); print('axis x %.1f (shin centre 0.32-0.40 m)' % ax)
    h = 0.0
    while h < (y1 - y0) / pxm:
        sp = row_spans(h)
        out = []
        for s, e in sp:
            lo, hi = sgn * (s - ax) / pxm, sgn * (e - ax) / pxm
            out.append('[back %+.3f front %+.3f]' % (min(lo, hi), max(lo, hi)))
        print('%.3f  ' % h + '  '.join(out))
        h += step
