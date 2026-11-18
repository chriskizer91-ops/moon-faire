"""Texture baking: unwrap a part, find the 3D point behind every texel, and let a
paint function colour it. Everything is painted from position, so patterns stay
the same size on every part and line up from every side."""
import numpy as np
from scipy import ndimage

AP = 0.002          # one 'art pixel' on her surface, in metres (the drawings are about 1.8 mm per pixel)


def unwrap(V, F, res, padding=3):
    import xatlas
    atlas = xatlas.Atlas()
    atlas.add_mesh(V.astype(np.float32), F.astype(np.uint32))
    co = xatlas.ChartOptions(); co.max_iterations = 1
    po = xatlas.PackOptions(); po.resolution = res; po.padding = padding; po.bilinear = False
    atlas.generate(co, po)
    vmap, idx, uv = atlas[0]
    return np.asarray(vmap, np.int64), np.asarray(idx, np.int64), np.asarray(uv, np.float64)


def raster(uv, F, attrs, R):
    """Per-texel interpolated vertex attributes. Returns (image (R,R,k) float32, mask)."""
    k = attrs.shape[1]
    img = np.zeros((R, R, k), np.float32)
    mask = np.zeros((R, R), bool)
    P = uv * R
    T = P[F]                                  # (nf, 3, 2)
    lo = np.floor(T.min(axis=1) - 0.5).astype(int); hi = np.ceil(T.max(axis=1) + 0.5).astype(int)
    lo = np.clip(lo, 0, R - 1); hi = np.clip(hi, 0, R - 1)
    A = attrs[F]                              # (nf, 3, k)
    for f in range(len(F)):
        x0, y0 = lo[f]; x1, y1 = hi[f]
        a, b, c = T[f]
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-12:
            continue
        xs = np.arange(x0, x1 + 1) + 0.5; ys = np.arange(y0, y1 + 1) + 0.5
        X, Y = np.meshgrid(xs, ys)
        w0 = ((b[1] - c[1]) * (X - c[0]) + (c[0] - b[0]) * (Y - c[1])) / den
        w1 = ((c[1] - a[1]) * (X - c[0]) + (a[0] - c[0]) * (Y - c[1])) / den
        w2 = 1 - w0 - w1
        m = (w0 >= -0.06) & (w1 >= -0.06) & (w2 >= -0.06)
        if not m.any():
            continue
        sub = img[y0:y1 + 1, x0:x1 + 1]
        val = w0[..., None] * A[f, 0] + w1[..., None] * A[f, 1] + w2[..., None] * A[f, 2]
        strict = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
        take = m & (strict | ~mask[y0:y1 + 1, x0:x1 + 1])      # a texel's own triangle wins over a neighbour's overhang
        sub[take] = val[take]
        mask[y0:y1 + 1, x0:x1 + 1] |= m
    return img, mask


def spread(rgb, mask):
    """Fill texels outside every chart with the nearest painted colour, so seams don't show."""
    idx = ndimage.distance_transform_edt(~mask, return_distances=False, return_indices=True)
    return rgb[idx[0], idx[1]]


# ------------------------------------------------------------------ pattern helpers
def cell(P):
    return np.floor(P / AP).astype(np.int64)


def rnd(ix, iy, iz=0, seed=0):
    h = (ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791) ^ (seed * 2654435761)
    h = (h ^ (h >> 13)) * 1274126177
    return ((h ^ (h >> 16)) & 0xFFFF) / 65535.0


def tones(P, dark, mid, light, pd=0.22, pl=0.14, seed=0, scale=1):
    """Three-tone speckle, like hand-placed pixels on cloth."""
    c = cell(P) // scale
    h = rnd(c[:, 0], c[:, 1], c[:, 2], seed)
    out = np.tile(np.array(mid, float), (len(P), 1))
    out[h < pd] = dark
    out[h > 1 - pl] = light
    return out


def star(u, v, ro=10.5, ri=4.4):
    """True inside a five-pointed star centred on (0,0), one point up. u right, v up, in art pixels."""
    r = np.hypot(u, v)
    a = np.mod(np.arctan2(u, v), 2 * np.pi / 5)
    a = np.minimum(a, 2 * np.pi / 5 - a)                       # 0 at a point, pi/5 at an inner corner
    edge = ro * ri * np.sin(np.pi / 5) / (ro * np.sin(a) + ri * np.sin(np.pi / 5 - a))
    return r <= edge


def stars(u, v, period, row=27.0):
    """A staggered field of stars over art-pixel coordinates (u, v)."""
    ui = np.floor(u) + 0.5; vi = np.floor(v) + 0.5
    rr = np.floor(vi / row)
    us = ui - (np.mod(rr, 2)) * period / 2
    cu = (np.floor(us / period) + 0.5) * period
    cv = (rr + 0.5) * row
    return star(us - cu, vi - cv)
