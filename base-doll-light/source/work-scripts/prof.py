# compare the top line of the model's foot with the paintings, heel (u=0) to toe tip (u=1), heights in cm (foot length 23.7 cm)
import numpy as np, sys
from PIL import Image
from scipy import ndimage as ndi
def msk(a):
    bg = np.median(np.concatenate([a[:6].reshape(-1,3), a[:, :6].reshape(-1,3)]), 0)
    m = np.sqrt(((a - bg) ** 2).sum(-1)) > 30; m = ndi.binary_opening(m, iterations=1); return ndi.binary_fill_holes(m)
def prof(m):
    sole = np.where(m.any(1))[0].max(); band = m[sole - 12: sole - 2]; c = np.where(band.any(0))[0]; a, b = c.min(), c.max()
    L = b - a; top = np.array([np.where(m[:, x])[0].min() if m[:, x].any() else sole for x in range(m.shape[1])])
    return sole, a, b, L, top
res = {}
for shot, ft in (('a', 'FT2'), ('b', 'FT1')):
    rm = msk(np.asarray(Image.open('shots/of_%s.png' % shot).convert('RGB')).astype(float))
    pm = np.load('/home/claude/work/ref2/m_%s.npy' % ft)
    rs, ra, rb, rL, rt = prof(rm); ps, pa, pb, pL, pt = prof(pm)
    # which end is the heel: the end nearer the leg (the column of mask far above the sole)
    def heel_left(m, sole, a, b):
        hi = m[: sole - int(0.45 * (b - a))]; c = np.where(hi.any(0))[0]; mid = c.mean(); return (mid - a) / (b - a) < 0.5
    rh, ph = heel_left(rm, rs, ra, rb), heel_left(pm, ps, pa, pb)
    row = []
    for u in np.arange(0.0, 1.001, 0.05):
        xr = int(ra + u * rL) if rh else int(rb - u * rL); xp = int(pa + u * pL) if ph else int(pb - u * pL)
        xr = min(max(xr, ra), rb); xp = min(max(xp, pa), pb)
        row.append(((rs - rt[xr]) / rL * 23.7, (ps - pt[xp]) / pL * 23.7))
    res[ft] = row
    print(ft, 'model | painting  (cm above floor)')
    print('  u   ' + ' '.join('%5.2f' % u for u in np.arange(0, 1.001, 0.05)))
    print('  mdl ' + ' '.join('%5.1f' % r[0] for r in row)); print('  pnt ' + ' '.join('%5.1f' % r[1] for r in row))
