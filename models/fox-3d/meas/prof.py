# silhouette profiles from a painting on flat plum: robust to charcoal by using chroma as well as brightness
import sys, numpy as np
from PIL import Image
def mask(path):
    im = np.asarray(Image.open(path).convert('RGB')).astype(int)
    bg = np.median(np.concatenate([im[:14, :14].reshape(-1, 3), im[:14, -14:].reshape(-1, 3), im[-14:, :14].reshape(-1, 3), im[-14:, -14:].reshape(-1, 3)]), axis=0)
    d = im - bg
    chroma = np.abs((im[..., 0] - im[..., 1]) - (bg[0] - bg[1])) + np.abs((im[..., 2] - im[..., 1]) - (bg[2] - bg[1]))
    m = (np.abs(d).sum(axis=2) > 40) | (chroma > 13)
    from scipy import ndimage as ndi
    m = ndi.binary_opening(m, iterations=1); m = ndi.binary_closing(m, iterations=2)
    return m
def figures(m, gap=25):
    cols = m.sum(axis=0) > 3; xs = np.where(cols)[0]; segs = []; a = xs[0]
    for i in range(len(xs) - 1):
        if xs[i + 1] - xs[i] > gap: segs.append((a, xs[i])); a = xs[i + 1]
    segs.append((a, xs[-1])); return segs
def runs(row, x0, mingap=6, minlen=6):
    r = np.where(row)[0]
    if len(r) == 0: return []
    out = []; s = r[0]; p = r[0]
    for v in r[1:]:
        if v - p > mingap: out.append((x0 + s, x0 + p)); s = v
        p = v
    out.append((x0 + s, x0 + p)); return [q for q in out if q[1] - q[0] >= minlen]
if __name__ == '__main__':
    path, step = sys.argv[1], int(sys.argv[2]); m = mask(path)
    for k, (a, b) in enumerate(figures(m)):
        sub = m[:, a:b + 1]; rows = np.where(sub.sum(axis=1) > 3)[0]
        print('fig', k, 'x', a, b, 'rows', rows[0], rows[-1])
        for y in range(rows[0] - rows[0] % step + step, rows[-1] + 1, step):
            print('  y', y, ' '.join(f'{p}-{q}({q - p})' for p, q in runs(sub[y], a)))
