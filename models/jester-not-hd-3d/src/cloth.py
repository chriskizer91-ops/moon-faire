"""Cloth as thin sheets: the skirt, the veil and the ribbon strands. Each layer is a grid
painted in its own strip of one picture, with the ragged hem cut by the picture's
transparency, so the edge is as crisp as the drawing. Cloth hangs on the chains in chains.py."""
import io
import numpy as np
from PIL import Image
from scipy import ndimage
import jester as JS
import chains as CH
from sdf import sstep
from bake import rnd

OLIVE = ((80, 66, 52), (104, 86, 65), (130, 108, 76))
BLACK = ((34, 28, 33), (54, 44, 50), (78, 62, 67))
WINE = ((92, 32, 60), (124, 44, 74), (166, 68, 84))
GOLDV = ((196, 124, 52), (238, 178, 82))
INK = (20, 15, 18)
TW = 1024
SHEER = 150                 # how solid the veil's cloth is, out of 255


def hem_profile(seed, length, depth, wmin, wmax, w=TW):
    """How far down (0..1 of the layer) the cloth reaches at each column: long ragged points."""
    rs = np.random.RandomState(seed)
    out = np.ones(w)
    x = 0
    while x < w:
        width = rs.randint(wmin, wmax)
        deep = rs.uniform(0.25, 1.0) * depth / length * (0.6 + width / wmax)
        xs = np.arange(width)
        tri = np.abs(xs / (width - 1) * 2 - 1) ** rs.uniform(0.8, 1.5)      # 0 at the point, 1 at the notches
        out[x:x + width] = (1 - deep * tri)[: max(0, min(width, w - x))]
        x += width
    step = np.repeat(rs.uniform(-0.012, 0.012, w // 3 + 1), 3)[:w]          # small stair-steps, like torn cloth
    return np.clip(out + step, 0.3, 1.0)


def chain_weights(idx, kind, phi, y, levels):
    """Skin weights over the chains of one kind: blend between the two nearest chains round her,
    and between the bones above and below this height. Returns {bone index: weight array}."""
    cs = [c for c in CH.CHAINS if c['kind'] == kind]
    ang = np.array([c['phi'] for c in cs])
    out = {}
    ph = np.mod(phi, 2 * np.pi)
    k1 = np.searchsorted(ang, ph) % len(cs)
    k0 = (k1 - 1) % len(cs)
    a0, a1 = ang[k0], ang[k1]
    span = np.mod(a1 - a0, 2 * np.pi); span = np.where(span == 0, 1, span)
    f = np.clip(np.mod(ph - a0, 2 * np.pi) / span, 0, 1)
    if kind == 'veil':                                    # the veil is open at the front: don't blend across the gap
        f = np.where(ph < ang[0], 1.0, np.where(ph > ang[-1], 0.0, f))
    lv = np.array(levels)
    seg = np.clip(np.searchsorted(-lv, -y) - 1, 0, len(lv) - 2)      # which pair of bones this height lies between
    top, bot = lv[seg], lv[seg + 1]
    b = np.clip((y - bot) / (top - bot), 0, 1)                         # 1 at the upper bone
    for kk, wk in ((k0, 1 - f), (k1, f)):
        for lev, wl in ((seg, b), (seg + 1, 1 - b)):
            for ci in range(len(cs)):
                for li in range(len(lv)):
                    m = (kk == ci) & (lev == li)
                    if m.any():
                        bi = idx[f"{cs[ci]['name']}{li + 1}"]
                        out.setdefault(bi, np.zeros(phi.shape))
                        out[bi][m] += (wk * wl)[m]
    return out


def pack(wdict, shape):
    """{bone: weights} -> the four strongest per vertex."""
    bones = sorted(wdict)
    Wm = np.stack([(wdict[b] * np.ones(shape)).reshape(-1) for b in bones], axis=1)
    if Wm.shape[1] < 4:
        Wm = np.concatenate([Wm, np.zeros((len(Wm), 4 - Wm.shape[1]))], axis=1); bones = bones + [0] * (4 - len(bones))
    order = np.argsort(-Wm, axis=1)[:, :4]
    w = np.take_along_axis(Wm, order, axis=1)
    w[w < 0.015] = 0
    w /= np.maximum(w.sum(axis=1, keepdims=True), 1e-9)
    j = np.array(bones)[order]
    j[w == 0] = 0
    return j.astype(np.uint8), w.astype(np.float32)


def grid_faces(nu, nv, base, P, N):
    n1 = nu + 1
    a = (np.arange(nv)[:, None] * n1 + np.arange(nu)[None, :]).reshape(-1)
    F = np.concatenate([np.stack([a, a + n1, a + 1], 1), np.stack([a + 1, a + n1, a + n1 + 1], 1)])
    Pf = P.reshape(-1, 3); Nf = N.reshape(-1, 3)
    f0 = F[len(a) // 2]
    if np.cross(Pf[f0[1]] - Pf[f0[0]], Pf[f0[2]] - Pf[f0[0]]) @ Nf[f0[0]] < 0:
        F = F[:, ::-1]                                    # counter-clockwise seen from outside
    return F + base


def grid_normals(P, outward):
    du = np.gradient(P, axis=1); dv = np.gradient(P, axis=0)
    N = np.cross(du, dv)
    ln = np.linalg.norm(N, axis=-1, keepdims=True)
    N = N / np.maximum(ln, 1e-12)
    if (N * outward).sum(axis=-1).mean() < 0:
        N = -N
    return np.where(ln < 1e-10, np.array([0.0, 1.0, 0.0]), N)          # where a sheet closes to a point, face up


class Sheets:
    def __init__(self):
        self.V, self.N, self.UV, self.F, self.J, self.W = [], [], [], [], [], []
        self.base = 0

    def add(self, P, N, uv, J, W, nu, nv):
        self.F.append(grid_faces(nu, nv, self.base, P, N))
        for lst, arr in ((self.V, P), (self.N, N), (self.UV, uv)):
            lst.append(arr.reshape(-1, arr.shape[-1]))
        self.J.append(J); self.W.append(W)
        self.base += P.shape[0] * P.shape[1]

    def done(self, tex, rough=0.9):
        buf = io.BytesIO(); Image.fromarray(tex, 'RGBA').save(buf, 'PNG', optimize=True)
        F = np.concatenate(self.F)
        return dict(V=np.concatenate(self.V), N=np.concatenate(self.N), uv=np.concatenate(self.UV).astype(np.float32), F=F,
                    J=np.concatenate(self.J), W=np.concatenate(self.W), png=buf.getvalue(), rough=rough, cloth=True, n0=len(F))


# ----------------------------------------------------------------------- skirt
# name, colours, top height, lowest hem height (fn of angle), front opening (radians each side), size, folds, fold phase, tooth depth (m)
TIERS = [
    ('swag',   BLACK, 1.074, lambda a: 0.900 - 0.048 * np.cos(2 * a) - 0.02 * np.cos(a), 0.00, 1.000, 9, 0.4, 0.05),
    ('olive1', OLIVE, 1.060, lambda a: 0.660 + 0.03 * np.cos(a), 0.30, 0.965, 13, 1.3, 0.13),
    ('black2', BLACK, 0.970, lambda a: 0.550 + 0.03 * np.cos(a), 0.36, 0.930, 15, 2.9, 0.14),
    ('olive2', OLIVE, 0.820, lambda a: 0.440 + 0.03 * np.cos(a), 0.42, 0.895, 14, 4.4, 0.13),
    ('black3', BLACK, 0.720, lambda a: 0.310 + 0.02 * np.cos(a), 0.48, 0.860, 16, 0.9, 0.12),
]
NU, NV, TH = 96, 16, 204


def paint_tier(j, name, cols, length, depth, folds, phase):
    hem = hem_profile(100 + j, length, depth, 22, 92)
    v = (np.arange(TH) + 0.5) / TH
    u = (np.arange(TW) + 0.5) / TW
    U, V = np.meshgrid(u, v)
    ix, iy = np.meshgrid(np.arange(TW), np.arange(TH))
    h = rnd(ix, iy, j, seed=7)
    fold = np.cos(folds * U * 2 * np.pi * 0.93 + phase)                     # pleats: dark in the valleys, light on the ridges
    shade = h + 0.22 * fold * (0.3 + 0.7 * V) - 0.10 * (V < 0.12)
    rgb = np.empty((TH, TW, 3), np.uint8)
    rgb[:] = cols[1]
    rgb[shade < 0.24] = cols[0]
    rgb[shade > 0.90] = cols[2]
    if name == 'swag':                                                      # draped folds hanging in arcs across the hips
        arc = np.sin((V * 4.2 + 0.35 * np.cos(U * 2 * np.pi * 2)) * np.pi * 2)
        rgb[(arc > 0.82) & (h > 0.25)] = cols[2]
        rgb[arc < -0.9] = cols[0]
    alpha = V < hem[None, :]
    edge = alpha & ~ndimage.binary_erosion(alpha, iterations=2, border_value=1)
    rgb[edge] = INK
    return rgb, (alpha * 255).astype(np.uint8)


def skirt(names):
    idx = {n: i for i, n in enumerate(names)}
    sh = Sheets()
    tex = np.zeros((TW, TW, 4), np.uint8)             # square, a power of two; the strips fill it from the top
    for j, (name, cols, ytop, hemfn, gap, scale, folds, phase, depth) in enumerate(TIERS):
        S, T = np.meshgrid(np.linspace(0, 1, NU + 1), np.linspace(0, 1, NV + 1))
        g = gap * (0.35 + 0.65 * T)
        ang = g + S * (2 * np.pi - 2 * g)                 # 0 is straight ahead; the opening is at the front
        yhem = hemfn(ang)
        y = ytop - T * (ytop - yhem)
        length = float(np.mean(ytop - yhem))
        m = scale * (1 + 0.055 * T ** 1.4 * np.cos(folds * ang + phase) + 0.02 * T * np.cos(2.3 * folds * ang + 1.7 * phase))
        yc = np.clip(y, CH.SKIRT_Y0, CH.SKIRT_Y1)
        x = CH.SKIRT_RX(yc) * np.sin(ang) * m
        z = CH.SKIRT_RZ(yc) * np.cos(ang) * m - 0.028 * sstep(1.0, 0.5, y) - 0.004
        P = np.stack([x, y, z], -1)
        N = grid_normals(P, np.stack([x, np.zeros_like(x), z], -1))
        uv = np.stack([(S * (TW - 2) + 1) / TW, (j * TH + 1 + T * (TH - 2)) / TW], -1)
        hips = sstep(0.93, 1.02, y)
        wd = {idx['Hips']: hips}
        for b, w in chain_weights(idx, 'skirt', ang, y, (0.95, 0.62)).items():
            wd[b] = w * (1 - hips)
        J, W = pack(wd, P.shape[:2])
        sh.add(P, N, uv, J, W, NU, NV)
        rgb, alpha = paint_tier(j, name, cols, length, depth, folds, phase)
        tex[j * TH:(j + 1) * TH, :, :3] = rgb; tex[j * TH:(j + 1) * TH, :, 3] = alpha
    return sh.done(tex)


# ------------------------------------------------------------------------ veil
YTOP = 1.674
AXIS_Z = -0.010
# name, top height, hem height at the back, extra height of the hem at the sides, gap off her body, folds, fold phase, tooth depth, rows in the picture
VTIERS = [
    ('top',  YTOP, 0.90, 0.10, 0.024, 22, 0.3, 0.17, 300),
    ('mid',  1.30, 0.58, 0.12, 0.016, 26, 1.7, 0.20, 300),
    ('long', 1.02, 0.27, 0.16, 0.008, 24, 3.1, 0.22, 300),
]
VNU, VNV = 150, 34


def edge_angle(y):
    """How far round from straight ahead the veil's front edge sits, at each height."""
    # it comes forward over her shoulders and upper arms, then hangs behind her forearms and cuffs
    return np.interp(y, [0.2, 1.02, 1.10, 1.20, 1.33, 1.50, YTOP], [1.80, 1.80, 1.50, 1.00, 0.80, 1.25, 1.30])


def drape_table():
    """For every direction round her and every height: how far out a cloth hung over her would lie."""
    sup = JS.support_part()
    nph, nys, nr = 180, 230, 121
    phis = np.linspace(0, 2 * np.pi, nph, endpoint=False)
    ys = np.linspace(YTOP, 0.24, nys)
    rhos = np.linspace(0.0, 0.48, nr)
    PH, YY, RR = np.meshgrid(phis, ys, rhos, indexing='ij')
    P = np.stack([RR * np.sin(PH), YY, RR * np.cos(PH) + AXIS_Z], -1).reshape(-1, 3)
    d = np.empty(len(P))
    for i in range(0, len(P), 400000):
        d[i:i + 400000] = sup.dist(P[i:i + 400000])
    inside = (d < 0).reshape(nph, nys, nr)
    rs = np.where(inside, rhos[None, None, :], 0).max(axis=2)                # the outermost solid point along each ray
    yc = np.clip(ys, CH.SKIRT_Y0, CH.SKIRT_Y1)
    sk = 1.0 / np.sqrt((np.sin(phis)[:, None] / CH.SKIRT_RX(yc)[None, :]) ** 2 + (np.cos(phis)[:, None] / CH.SKIRT_RZ(yc)[None, :]) ** 2)
    rs = np.where((ys < 1.07)[None, :], np.maximum(rs, sk), rs)             # it also rests on the skirt
    R = np.empty_like(rs)
    for a in range(nph):
        # a taut line over the supports (upper hull of radius against height), then never narrower further down
        hull = []
        for yv, rv in zip(ys, rs[a]):
            p = (-yv, rv)
            while len(hull) >= 2 and (hull[-1][0] - hull[-2][0]) * (p[1] - hull[-2][1]) - (hull[-1][1] - hull[-2][1]) * (p[0] - hull[-2][0]) >= 0:
                hull.pop()
            hull.append(p)
        hx = np.array([h[0] for h in hull]); hy = np.array([h[1] for h in hull])
        R[a] = np.maximum.accumulate(np.interp(-ys, hx, hy))
    # the cloth also spans straight between supports round her (from arm to arm across her back): convex outline at each height
    from scipy.spatial import ConvexHull
    sn, cs_ = np.sin(phis), np.cos(phis)
    for b in range(nys):
        pts = np.stack([R[:, b] * sn, R[:, b] * cs_], 1)
        if R[:, b].max() < 1e-4:
            continue
        try:
            hv = ConvexHull(pts + 1e-9 * np.random.RandomState(b).randn(*pts.shape)).vertices
        except Exception:
            continue
        hp = pts[hv]; ha = np.mod(np.arctan2(hp[:, 0], hp[:, 1]), 2 * np.pi)
        o = np.argsort(ha); hp = hp[o]; ha = ha[o]
        A = np.concatenate([hp[-1:], hp]); B = np.concatenate([hp, hp[:1]])          # hull edges A -> B, in order round her
        k = np.searchsorted(ha, phis) % (len(ha) + 0)
        a, bb = A[np.clip(k, 0, len(A) - 1)], B[np.clip(k, 0, len(B) - 1)]
        e = bb - a
        den = sn * e[:, 1] - cs_ * e[:, 0]
        t = (a[:, 0] * e[:, 1] - a[:, 1] * e[:, 0]) / np.where(np.abs(den) < 1e-9, 1e-9, den)   # where each ray meets its hull edge
        R[:, b] = np.maximum(R[:, b], np.clip(t, 0, 0.6))
    flare = (0.11 + 0.20 * np.sin(phis) ** 2)[:, None] * np.clip(1.15 - ys, 0, None)[None, :]   # cloth spreads as it falls, most at her sides
    R = ndimage.gaussian_filter1d(R + flare, 2.0, axis=0, mode='wrap')
    return phis, ys, R


def paint_veil(j, length, depth, folds, phase, rows):
    hem = hem_profile(300 + j, length, depth, 96, 190)
    v = (np.arange(rows) + 0.5) / rows
    U, V = np.meshgrid((np.arange(TW) + 0.5) / TW, v)
    ix, iy = np.meshgrid(np.arange(TW), np.arange(rows))
    h = rnd(ix, iy, j, seed=21)
    fold = np.cos(folds * U * 2 * np.pi + phase)
    shade = h + 0.26 * fold * (0.25 + 0.75 * V)
    rgb = np.empty((rows, TW, 3), np.uint8)
    rgb[:] = WINE[1]
    rgb[shade < 0.26] = WINE[0]
    rgb[shade > 0.92] = WINE[2]
    inside = V < hem[None, :]
    gold = (np.mod(ix, 34) < 2) & (np.mod(iy, 5) < 2)                         # dotted gold lines running down the cloth
    edge = inside & ~ndimage.binary_erosion(inside, iterations=3, border_value=1)
    inner = ndimage.binary_erosion(inside, iterations=7, border_value=1) & ~ndimage.binary_erosion(inside, iterations=9, border_value=1)
    dots = (np.mod(ix + iy, 4) < 2)
    rgb[gold] = GOLDV[0]
    rgb[inner & dots] = GOLDV[0]
    rgb[edge] = np.where(dots[edge, None], np.array(GOLDV[1]), np.array(WINE[0]))
    solid = gold | edge | (inner & dots)                                      # the gold stays solid; the cloth itself is sheer
    alpha = np.where(solid, 255, SHEER) * inside
    return rgb, alpha.astype(np.uint8)


def veil(names):
    idx = {n: i for i, n in enumerate(names)}
    phis, ys, R = drape_table()
    Rp = np.concatenate([R, R[:1]], axis=0)                                   # wrap round

    def radius(phi, y):
        fa = np.mod(phi, 2 * np.pi) / (2 * np.pi) * len(phis)
        fy = np.clip((YTOP - y) / (YTOP - ys[-1]), 0, 1) * (len(ys) - 1)
        return ndimage.map_coordinates(Rp, [fa, fy], order=1, mode='nearest')

    sh = Sheets()
    tex = np.zeros((TW, TW, 4), np.uint8)
    row0 = 0
    for j, (name, ytop, hback, hside, gap, folds, phase, depth, rows) in enumerate(VTIERS):
        S, T = np.meshgrid(np.linspace(0, 1, VNU + 1), np.linspace(0, 1, VNV + 1))
        y = ytop - T * (ytop - (hback + hside * 0.5))
        for _ in range(2):                                                    # the edge angle depends on height and the hem on angle
            e = edge_angle(y)
            phi = e + S * (2 * np.pi - 2 * e)
            y = ytop - T * (ytop - (hback + hside * np.sin(phi) ** 2))
        length = ytop - (hback + hside * 0.5)
        hang = sstep(1.15, 0.70, y)
        rho = (radius(phi, y) + gap * np.clip((YTOP - y) / 0.05, 0, 1)) * (1 + 0.05 * hang * np.cos(folds * phi + phase) + 0.02 * hang * np.cos(2.2 * folds * phi + phase))
        x = rho * np.sin(phi); z = rho * np.cos(phi) + AXIS_Z
        P = np.stack([x, y, z], -1)
        N = grid_normals(P, np.stack([x, np.full_like(x, 0.02), z - AXIS_Z], -1))
        uv = np.stack([(S * (TW - 2) + 1) / TW, (row0 + 1 + T * (rows - 2)) / TW], -1)
        # resting on her: head, then chest and arms. Hanging free below about elbow height: the veil chains.
        free = sstep(1.22, 0.98, y)
        w_head = sstep(1.41, 1.48, y)
        w_arm = sstep(0.09, 0.24, np.abs(x)) * (1 - w_head) * sstep(1.40, 1.28, y)
        wd = {idx['Head']: w_head * (1 - free), idx['Spine2']: (1 - w_head - w_arm) * (1 - free),
              idx['LeftArm']: w_arm * (x > 0) * (1 - free), idx['RightArm']: w_arm * (x <= 0) * (1 - free)}
        for b, w in chain_weights(idx, 'veil', phi, y, CH.VEIL_Y[:3]).items():
            wd[b] = w * free
        J, W = pack(wd, P.shape[:2])
        sh.add(P, N, uv, J, W, VNU, VNV)
        rgb, alpha = paint_veil(j, length, depth, folds, phase, rows)
        tex[row0:row0 + rows, :, :3] = rgb; tex[row0:row0 + rows, :, 3] = alpha
        row0 += rows

    out = sh.done(tex, rough=0.85)
    out['blend'] = True                 # truly see-through: drawn after everything solid, blended over it
    return out
