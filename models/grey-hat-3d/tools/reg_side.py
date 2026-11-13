# Finds the scale of a side figure that wears the hat (so its full height cannot be used): its boot is matched to the boot of the
# same side in B2, whose scale is known. Prints px per metre and the boot-shaft axis.
# usage: reg_side.py painting figIndex side(+|-)
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of, figures, spans
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def fig(path, fi):
    a = load(os.path.join(ROOT, 'refs', path)); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]; return (lab == f[5]), f
def prof(fm, f, pxm, sgn, hs):
    out = []
    for h in hs:
        yy = int(round(f[3] - h * pxm)); sp = spans(fm[max(f[1], yy - 1):yy + 2].sum(0) >= 2)
        if not sp: out.append((np.nan, np.nan)); continue
        s, e = max(sp, key=lambda q: q[1] - q[0]); out.append((s, e))
    return np.array(out, float)
def register(path, fi, sgn):
    ref_fm, ref_f = fig('B2.png', 1 if sgn > 0 else 0); rp = (ref_f[3] - ref_f[1]) / 1.78
    hs = np.arange(0.03, 0.36, 0.01); R = prof(ref_fm, ref_f, rp, sgn, hs); rw = (R[:, 1] - R[:, 0]) / rp
    fm, f = fig(path, fi); best = None
    for pxm in np.arange(480, 620, 1.0):
        P = prof(fm, f, pxm, sgn, hs); w = (P[:, 1] - P[:, 0]) / pxm; err = np.nanmean(np.abs(w - rw))
        if best is None or err < best[0]: best = (err, pxm)
    pxm = best[1]; cs = []
    for h in np.arange(0.16, 0.30, 0.01):
        yy = int(round(f[3] - h * pxm)); s, e = max(spans(fm[yy]), key=lambda q: q[1] - q[0]); cs.append((s + e) / 2)
    return dict(name=path, fi=fi, x0=int(f[0]), y0=int(f[1]), x1=int(f[2]), y1=int(f[3]), pxm=float(pxm), c=float(np.mean(cs)), err=float(best[0]))
if __name__ == '__main__':
    r = register(sys.argv[1], int(sys.argv[2]), 1 if sys.argv[3] == '+' else -1); print(json.dumps(r))
