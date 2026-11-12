import sys, numpy as np
sys.path.insert(0, '/home/claude/ranger/tools')
from sil import load, mask_of, figures, spans
def fig(path, fi):
    a = load(path); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]; return a, lab == f[5], f
# (a) B1 front: blue corset extent and skin extent by height
a, fm, f = fig('refs/B1.png', 0); pxm = (f[3] - f[1]) / 1.665; sole = f[3]; cx = 484.0
r, g, b = a[..., 0], a[..., 1], a[..., 2]
blue = fm & (b > r + 18) & (b > g + 6) & (b > 70)
skin = fm & (r > 150) & (r > g + 18) & (g > b + 4)
print('(a) B1 front: corset blue half-widths L/R and skin extents; pxm %.1f' % pxm)
for h in np.arange(1.00, 1.42, 0.02):
    yy = int(round(sole - h * pxm)); rb = blue[yy - 1:yy + 2].sum(0) >= 2; rs = skin[yy - 1:yy + 2].sum(0) >= 2
    xb = np.where(rb)[0]; sb = '[%+.3f %+.3f]' % ((xb.min() - cx) / pxm, (xb.max() - cx) / pxm) if len(xb) > 6 else '   -   '
    ss = ' '.join('[%+.3f %+.3f]' % ((s - cx) / pxm, (e - cx) / pxm) for s, e in spans(rs) if e - s > 4)
    print('  %.2f blue %s   skin %s' % (h, sb, ss))
# (b) B3 legs: front (fig 0) and side (fig 1, faces right)
a, fm, f = fig('refs/B3.png', 0); pxm = 898.0; sole = f[3]; cx = 308.0
print('(b) B3 front legs: her-right leg [x0 x1] w c | her-left leg [x0 x1] w c')
for h in np.arange(0.24, 0.80, 0.02):
    yy = int(round(sole - h * pxm)); sp = [(s, e) for s, e in spans(fm[yy - 1:yy + 2].sum(0) >= 2) if e - s > 8]
    if len(sp) == 2:
        o = []
        for s, e in sp: o.append('[%+.3f %+.3f] w %.3f c %+.3f' % ((s - cx) / pxm, (e - cx) / pxm, (e - s) / pxm, ((s + e) / 2 - cx) / pxm))
        print('  %.2f  %s | %s' % (h, o[0], o[1]))
a, fm, f = fig('refs/B3.png', 1); sole = f[3]
cs = []
for h in np.arange(0.32, 0.40, 0.01):
    yy = int(round(sole - h * pxm)); sp = spans(fm[yy]); c = max(sp, key=lambda s: s[1] - s[0]); cs.append((c[0] + c[1]) / 2)
ax = float(np.mean(cs))
print('(b2) B3 side (faces right): back front depth centre ; sole y %d' % sole)
for h in np.arange(0.24, 1.06, 0.02):
    yy = int(round(sole - h * pxm))
    if yy < f[1]: break
    sp = [(s, e) for s, e in spans(fm[yy - 1:yy + 2].sum(0) >= 2) if e - s > 8]
    if sp:
        s, e = max(sp, key=lambda q: q[1] - q[0]); print('  %.2f  back %+.3f front %+.3f  depth %.3f  centre %+.3f' % (h, (s - ax) / pxm, (e - ax) / pxm, (e - s) / pxm, ((s + e) / 2 - ax) / pxm))
