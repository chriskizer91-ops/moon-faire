"""Small signed-distance toolkit: shapes, smooth blends, meshing, and
per-vertex skin weights taken from whichever shape a vertex belongs to."""
import numpy as np
from scipy.interpolate import PchipInterpolator
from skimage import measure

BIG = 10.0


def smin(a, b, k):
    if k <= 0:
        return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def norm(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


class Shape:
    """Base: dist(P) -> (N,), bbox() -> (lo, hi), weights(P) -> {bone: (N,)}."""
    bone = None
    wkeys = None      # optional [(t, {bone: w}), ...] along the shape's own parameter
    tag = None

    def param(self, P):
        return np.zeros(len(P))

    def weights(self, P):
        if self.wkeys is None:
            return {self.bone: np.ones(len(P))}
        t = self.param(P)
        ts = np.array([k[0] for k in self.wkeys])
        bones = sorted({b for _, d in self.wkeys for b in d})
        out = {}
        for b in bones:
            vals = np.array([d.get(b, 0.0) for _, d in self.wkeys])
            out[b] = np.interp(t, ts, vals)
        return out


class Ellipsoid(Shape):
    def __init__(self, c, r, bone=None, rot=None, tag=None):
        self.c = np.asarray(c, float); self.r = np.asarray(r, float)
        self.bone = bone; self.rot = rot; self.tag = tag

    def dist(self, P):
        q = P - self.c
        if self.rot is not None:
            q = q @ self.rot           # into the shape's own axes
        k0 = np.linalg.norm(q / self.r, axis=1)
        k1 = np.linalg.norm(q / (self.r * self.r), axis=1)
        return np.where(k1 > 1e-9, k0 * (k0 - 1.0) / np.maximum(k1, 1e-9), -self.r.min())

    def bbox(self):
        m = self.r.max() if self.rot is not None else self.r
        return self.c - m, self.c + m


class RoundCone(Shape):
    """Capsule with a different radius at each end."""
    def __init__(self, a, b, ra, rb, bone=None, wkeys=None, tag=None):
        self.a = np.asarray(a, float); self.b = np.asarray(b, float)
        self.ra = ra; self.rb = rb; self.bone = bone; self.wkeys = wkeys; self.tag = tag

    def param(self, P):
        ba = self.b - self.a
        return np.clip(((P - self.a) @ ba) / (ba @ ba), 0, 1)

    def dist(self, P):
        a, b, r1, r2 = self.a, self.b, self.ra, self.rb
        ba = b - a
        l2 = ba @ ba
        rr = r1 - r2
        a2 = l2 - rr * rr
        il2 = 1.0 / l2
        pa = P - a
        y = pa @ ba
        z = y - l2
        xv = pa * l2 - np.outer(y, ba)
        x2 = np.einsum('ij,ij->i', xv, xv)
        y2 = y * y * l2
        z2 = z * z * l2
        k = np.sign(rr) * rr * rr * x2
        d = (np.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1
        c1 = np.sign(z) * a2 * z2 > k
        c2 = np.sign(y) * a2 * y2 < k
        d = np.where(c2, np.sqrt(x2 + y2) * il2 - r1, d)
        d = np.where(c1, np.sqrt(x2 + z2) * il2 - r2, d)
        return d

    def bbox(self):
        m = max(self.ra, self.rb)
        return np.minimum(self.a, self.b) - m, np.maximum(self.a, self.b) + m


class Column(Shape):
    """A limb or trunk: an axis from a to b with an elliptical cross-section
    whose two radii and sideways offsets are read from a table along the axis.
    table rows: (t, ru, rv[, ou, ov[, n]])  u = 'side' axis, v = 'front' axis."""
    def __init__(self, a, b, table, front=(0, 0, 1), side=(1, 0, 0), bone=None, wkeys=None, n=2.0, tag=None):
        self.a = np.asarray(a, float); self.b = np.asarray(b, float)
        ax = self.b - self.a
        self.L = np.linalg.norm(ax); self.ax = ax / self.L
        f = np.asarray(front, float)
        v = f - (f @ self.ax) * self.ax
        self.v = v / np.linalg.norm(v)
        self.u = np.cross(self.ax, self.v)
        if self.u @ np.asarray(side, float) < 0:
            self.u = -self.u
        T = np.array([list(r) + [0.0] * (5 - len(r)) for r in table], float)
        self.t = T[:, 0]
        self.f_ru = PchipInterpolator(self.t, T[:, 1]); self.f_rv = PchipInterpolator(self.t, T[:, 2])
        self.f_ou = PchipInterpolator(self.t, T[:, 3]); self.f_ov = PchipInterpolator(self.t, T[:, 4])
        self.rmax = max(T[:, 1].max(), T[:, 2].max()) + np.abs(T[:, 3:5]).max()
        self.n = n; self.bone = bone; self.wkeys = wkeys; self.tag = tag

    def param(self, P):
        return np.clip(((P - self.a) @ self.ax) / self.L, 0, 1)

    def dist(self, P):
        pa = P - self.a
        traw = (pa @ self.ax) / self.L
        tc = np.clip(traw, 0, 1)
        ru = self.f_ru(tc); rv = self.f_rv(tc)
        qu = pa @ self.u - self.f_ou(tc)
        qv = pa @ self.v - self.f_ov(tc)
        n = self.n
        m = (np.abs(qu / ru) ** n + np.abs(qv / rv) ** n) ** (1.0 / n)
        rad = np.sqrt(qu * qu + qv * qv)
        dr = np.where(m > 1e-6, rad * (1 - 1 / np.maximum(m, 1e-6)), -np.minimum(ru, rv))
        e = (traw - tc) * self.L
        return np.where(np.abs(e) > 0, np.sqrt(np.maximum(dr, 0) ** 2 + e * e), dr)

    def bbox(self):
        lo = np.minimum(self.a, self.b) - self.rmax
        hi = np.maximum(self.a, self.b) + self.rmax
        return lo, hi


class Sweep(Shape):
    """A tube swept along a curve with a radius at every sample (horns)."""
    def __init__(self, pts, radii, bone=None, wkeys=None, tag=None):
        self.pts = np.asarray(pts, float); self.radii = np.asarray(radii, float)
        seg = np.linalg.norm(np.diff(self.pts, axis=0), axis=1)
        self.s = np.concatenate([[0], np.cumsum(seg)]) / seg.sum()
        self.bone = bone; self.wkeys = wkeys; self.tag = tag

    def _both(self, P):
        best = np.full(len(P), BIG); bt = np.zeros(len(P))
        for i in range(len(self.pts) - 1):
            a, b = self.pts[i], self.pts[i + 1]
            ba = b - a
            h = np.clip(((P - a) @ ba) / (ba @ ba), 0, 1)
            d = np.linalg.norm(P - a - np.outer(h, ba), axis=1) - (self.radii[i] * (1 - h) + self.radii[i + 1] * h)
            better = d < best
            best = np.where(better, d, best)
            bt = np.where(better, self.s[i] * (1 - h) + self.s[i + 1] * h, bt)
        return best, bt

    def dist(self, P):
        return self._both(P)[0]

    def param(self, P):
        return self._both(P)[1]

    def bbox(self):
        m = self.radii.max()
        return self.pts.min(0) - m, self.pts.max(0) + m


class Func(Shape):
    """Any distance function with a box around it."""
    def __init__(self, fn, lo, hi, bone=None, wfn=None, tag=None):
        self.fn = fn; self.lo = np.asarray(lo, float); self.hi = np.asarray(hi, float)
        self.bone = bone; self.wfn = wfn; self.tag = tag

    def dist(self, P):
        return self.fn(P)

    def bbox(self):
        return self.lo, self.hi

    def weights(self, P):
        if self.wfn is not None:
            return self.wfn(P)
        return {self.bone: np.ones(len(P))}


class Part:
    """An ordered list of (shape, blend, op). op: 'add' or 'sub'.
    'post' is an optional function (P, d) -> d applied at the end (clipping)."""
    def __init__(self, name, step, soft=0.004):
        self.name = name; self.step = step; self.items = []; self.post = None; self.soft = soft

    def add(self, shape, k=0.0):
        self.items.append((shape, k, 'add')); return shape

    def sub(self, shape, k=0.0):
        self.items.append((shape, k, 'sub')); return shape

    def _eval_one(self, shape, P, margin):
        lo, hi = shape.bbox()
        inside = np.all((P >= lo - margin) & (P <= hi + margin), axis=1)
        d = np.full(len(P), BIG)
        if inside.any():
            d[inside] = shape.dist(P[inside])
        return d

    def dist(self, P):
        d = np.full(len(P), BIG)
        for shape, k, op in self.items:
            di = self._eval_one(shape, P, k + 3 * self.step + 0.02)
            d = smin(d, di, k) if op == 'add' else smax(d, -di, k)
        if self.post is not None:
            d = self.post(P, d)
        return d

    def bbox(self):
        los, his = zip(*[s.bbox() for s, k, op in self.items if op == 'add'])
        return np.min(los, axis=0), np.max(his, axis=0)

    def mesh(self):
        lo, hi = self.bbox()
        h = self.step
        lo = lo - 3 * h; hi = hi + 3 * h
        nx, ny, nz = (np.ceil((hi - lo) / h).astype(int) + 1)
        xs = lo[0] + h * np.arange(nx); ys = lo[1] + h * np.arange(ny); zs = lo[2] + h * np.arange(nz)
        vol = np.empty((nx, ny, nz), np.float32)
        YZ = np.stack(np.meshgrid(ys, zs, indexing='ij'), -1).reshape(-1, 2)
        chunk = max(1, int(400000 // len(YZ)))
        for i0 in range(0, nx, chunk):
            xi = xs[i0:i0 + chunk]
            P = np.concatenate([np.repeat(xi, len(YZ))[:, None], np.tile(YZ, (len(xi), 1))], axis=1)
            vol[i0:i0 + chunk] = self.dist(P).reshape(len(xi), ny, nz)
        V, F, _, _ = measure.marching_cubes(vol, level=0.0, spacing=(h, h, h))
        V = V + lo
        # skimage already winds faces counter-clockwise seen from outside (values rise outward)
        return V.astype(np.float64), F.astype(np.int64)

    def normals(self, V, eps=None):
        e = eps or self.step * 0.5
        g = np.empty_like(V)
        for a in range(3):
            d = np.zeros(3); d[a] = e
            g[:, a] = self.dist(V + d) - self.dist(V - d)
        n = np.linalg.norm(g, axis=1, keepdims=True)
        return g / np.maximum(n, 1e-12)

    def weights(self, V, bones):
        """Soft ownership by nearest shape, then each shape's own bone weights."""
        index = {b: i for i, b in enumerate(bones)}
        shapes = [s for s, k, op in self.items if op == 'add']
        D = np.stack([self._eval_one(s, V, 0.05) for s in shapes], axis=1)
        dmin = D.min(axis=1, keepdims=True)
        A = np.exp(-(D - dmin) / self.soft)
        A /= A.sum(axis=1, keepdims=True)
        W = np.zeros((len(V), len(bones)))
        for j, s in enumerate(shapes):
            a = A[:, j]
            use = a > 1e-4
            if not use.any():
                continue
            for b, w in s.weights(V[use]).items():
                W[use, index[b]] += a[use] * w
        owner = D.argmin(axis=1)
        return W, owner, shapes


def part_owner(part, P, chunk=200000):
    """Which of the part's shapes each point belongs to (index into the returned list)."""
    shapes = [s for s, k, op in part.items if op == 'add']
    out = np.empty(len(P), np.int64)
    for i in range(0, len(P), chunk):
        D = np.stack([part._eval_one(s, P[i:i + chunk], 0.05) for s in shapes], axis=1)
        out[i:i + chunk] = D.argmin(axis=1)
    return out, shapes


def smooth_weights(V, F, W, iters=8, lam=0.5):
    """Blur weights along the surface so joints bend softly."""
    import scipy.sparse as sp
    n = len(V)
    i = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]])
    j = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
    A = sp.coo_matrix((np.ones(len(i)), (i, j)), shape=(n, n)).tocsr()
    A.data[:] = 1.0
    deg = np.asarray(A.sum(axis=1)).ravel()
    Dinv = sp.diags(1.0 / np.maximum(deg, 1))
    M = Dinv @ A
    for _ in range(iters):
        W = (1 - lam) * W + lam * (M @ W)
    return W


def top4(W):
    idx = np.argsort(-W, axis=1)[:, :4]
    w = np.take_along_axis(W, idx, axis=1)
    w = np.where(w < 0.02, 0.0, w)
    w /= w.sum(axis=1, keepdims=True)
    idx = np.where(w > 0, idx, 0)
    return idx.astype(np.uint8), w.astype(np.float32)


def weld(V, F, tol=1e-7):
    key = np.round(V / tol).astype(np.int64)
    _, inv_first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    V2 = V[inv_first]
    F2 = inv[F]
    good = (F2[:, 0] != F2[:, 1]) & (F2[:, 1] != F2[:, 2]) & (F2[:, 0] != F2[:, 2])
    return V2, F2[good]


def simplify(V, F, ratio):
    import fast_simplification
    V2, F2 = fast_simplification.simplify(V.astype(np.float32), F.astype(np.int32), target_reduction=1 - ratio)
    return V2.astype(np.float64), F2.astype(np.int64)
