# prints outline tables in metres for one figure of a painting
# usage: measure.py painting figIndex height mode [step] [h0] [h1]
#   height: the figure's full height in metres (soles to its top);  mode: front | side+ (faces right) | side- (faces left)
# front: spans are given from the body's centre line (the middle of the corset's narrowest row); side: from the middle of the boot shaft.
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of, figures, spans
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path, fi, HT, mode = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
step = float(sys.argv[5]) if len(sys.argv) > 5 else 0.025
h0 = float(sys.argv[6]) if len(sys.argv) > 6 else 0.0
h1 = float(sys.argv[7]) if len(sys.argv) > 7 else 9
a = load(os.path.join(ROOT, 'refs', path)); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]; fm = lab == f[5]
x0, y0, x1, y1 = f[:4]; sole = y1; pxm = (y1 - y0) / HT
print('%s fig %d  x %d-%d y %d-%d  %.1f px/m' % (path, fi, x0, x1, y0, y1, pxm))
def row_spans(h):
    yy = int(round(sole - h * pxm))
    if yy < y0 or yy >= y1: return []
    rr = fm[max(y0, yy - 1):yy + 2].sum(0) >= 2
    return [(s, e) for s, e in spans(rr) if e - s >= 3]
if mode == 'front':
    best = None
    for h in np.arange(1.00, 1.22, 0.01):
        sp = row_spans(h)
        if not sp: continue
        c = min(sp, key=lambda s: abs((s[0] + s[1]) / 2 - (x0 + x1) / 2))
        if best is None or c[1] - c[0] < best[1] - best[0]: best = c; hb = h
    cx = (best[0] + best[1]) / 2
    print('centre x %.1f (waist %.3f m wide at %.2f m)' % (cx, (best[1] - best[0]) / pxm, hb))
    sgn = 1
else:
    sgn = 1 if mode == 'side+' else -1
    cs = []
    for h in np.arange(0.16, 0.30, 0.01):
        sp = row_spans(h)
        if sp: c = max(sp, key=lambda s: s[1] - s[0]); cs.append((c[0] + c[1]) / 2)
    cx = float(np.mean(cs)); print('axis x %.1f (middle of the boot shaft, 0.16 to 0.30 m)' % cx)
h = h0
while h < min(h1, HT) + 1e-6:
    sp = row_spans(h); out = []
    for s, e in sp:
        lo, hi = sgn * (s - cx) / pxm, sgn * (e - cx) / pxm
        out.append('[%+.3f %+.3f]' % (min(lo, hi), max(lo, hi)))
    print('%.3f  ' % h + ' '.join(out))
    h += step
