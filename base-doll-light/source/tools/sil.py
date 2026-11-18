# silhouette tools for the reference paintings: flat plum (or grey/black) background -> mask; figures as connected blobs
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
def load(path):
    return np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
def mask_of(a, thr=11.0, raw=False):
    h, w, _ = a.shape
    cs = np.concatenate([a[:12, :12].reshape(-1, 3), a[:12, -12:].reshape(-1, 3), a[-12:, :12].reshape(-1, 3), a[-12:, -12:].reshape(-1, 3)])
    bg0 = np.median(cs, 0)
    d0 = np.sqrt(((a - bg0) ** 2).sum(-1))
    sure_bg = ~ndi.binary_dilation(d0 > 22, iterations=18)
    # the background has a soft vignette: fit a quadratic surface per channel to the sure background
    ys, xs = np.mgrid[0:h, 0:w]; X = xs / w - 0.5; Y = ys / h - 0.5
    A = np.stack([np.ones_like(X), X, Y, X * X, Y * Y, X * Y], -1)
    sel = sure_bg.ravel(); step = max(1, sel.sum() // 60000)
    Af = A.reshape(-1, 6)[sel][::step]; fit = np.zeros_like(a)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(Af, a[..., c].reshape(-1)[sel][::step], rcond=None); fit[..., c] = A @ coef
    r = a - fit
    lum = r.mean(-1); chroma = np.sqrt(((r - lum[..., None]) ** 2).sum(-1))
    d = np.sqrt((r ** 2).sum(-1) + (1.6 * chroma) ** 2)
    d = ndi.gaussian_filter(d, 0.8)
    m = d > thr
    if raw: return m, fit
    m = ndi.binary_opening(m, iterations=1); m = ndi.binary_closing(m, iterations=3); m = ndi.binary_fill_holes(m)
    return m, fit
def figures(m, min_area=4000):
    lab, n = ndi.label(m); out = []
    for i, sl in enumerate(ndi.find_objects(lab)):
        area = (lab[sl] == i + 1).sum()
        if area >= min_area: out.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, int(area), i + 1))
    out.sort(); return lab, out
def spans(row):
    # runs of True in a boolean row -> [(x0, x1), ...] (x1 exclusive)
    d = np.diff(np.concatenate([[0], row.astype(np.int8), [0]])); s = np.where(d == 1)[0]; e = np.where(d == -1)[0]
    return list(zip(s.tolist(), e.tolist()))
if __name__ == '__main__':
    for p in sys.argv[1:]:
        a = load(p); m, bg = mask_of(a); lab, figs = figures(m)
        print(p.split('/')[-1], a.shape[1], 'x', a.shape[0])
        for f in figs: print('   fig x %d-%d  y %d-%d  h %d  area %d' % (f[0], f[2], f[1], f[3], f[3] - f[1], f[4]))
