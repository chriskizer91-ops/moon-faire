"""Cloth as thin sheets: the skirt (and later the veil). Each layer is a grid wrapped
round her, painted in its own strip of one picture, with the ragged hem cut by the
picture's transparency, so the edge is as crisp as the drawing."""
import io
import numpy as np
from PIL import Image
from scipy.interpolate import PchipInterpolator
from scipy import ndimage
import jester as JS
from sdf import sstep
from bake import rnd

# how wide the skirt is at each height (half-width to the side, half-depth front to back), read off B1 and B2
_Y = np.array([0.28, 0.40, 0.50, 0.60, 0.68, 0.755, 0.83, 0.90, 0.97, 1.075])
_RX = PchipInterpolator(_Y, [0.288, 0.298, 0.303, 0.300, 0.290, 0.266, 0.240, 0.201, 0.170, 0.092])
_RZ = PchipInterpolator(_Y, [0.196, 0.202, 0.197, 0.188, 0.177, 0.164, 0.150, 0.134, 0.117, 0.077])

OLIVE = ((80, 66, 52), (104, 86, 65), (130, 108, 76))
BLACK = ((34, 28, 33), (54, 44, 50), (78, 62, 67))
INK = (20, 15, 18)

# name, colours, top height, lowest hem height (fn of angle), front opening (radians each side), size, folds, fold phase, tooth depth (m)
TIERS = [
    ('swag',   BLACK, 1.074, lambda a: 0.900 - 0.048 * np.cos(2 * a) - 0.02 * np.cos(a), 0.00, 1.000, 9, 0.4, 0.05),
    ('olive1', OLIVE, 1.060, lambda a: 0.660 + 0.03 * np.cos(a), 0.30, 0.965, 13, 1.3, 0.13),
    ('black2', BLACK, 0.970, lambda a: 0.550 + 0.03 * np.cos(a), 0.36, 0.930, 15, 2.9, 0.14),
    ('olive2', OLIVE, 0.820, lambda a: 0.440 + 0.03 * np.cos(a), 0.42, 0.895, 14, 4.4, 0.13),
    ('black3', BLACK, 0.720, lambda a: 0.310 + 0.02 * np.cos(a), 0.48, 0.860, 16, 0.9, 0.12),
]
NU, NV = 72, 12          # grid squares round and down each tier
TW, TH = 1024, 204       # each tier's strip in the picture


def hem_profile(j, length, depth, w=TW):
    """How far down (0..1 of the tier) the cloth reaches at each column: long ragged points."""
    rs = np.random.RandomState(100 + j)
    out = np.ones(w)
    x = 0
    while x < w:
        width = rs.randint(22, 92)
        deep = rs.uniform(0.25, 1.0) * depth / length * (0.6 + width / 92)
        xs = np.arange(width)
        tri = np.abs(xs / (width - 1) * 2 - 1) ** rs.uniform(0.8, 1.5)      # 0 at the point, 1 at the notches
        out[x:x + width] = (1 - deep * tri)[: max(0, min(width, w - x))]
        x += width
    step = np.repeat(rs.uniform(-0.012, 0.012, w // 3 + 1), 3)[:w]          # small stair-steps, like torn cloth
    return np.clip(out + step, 0.3, 1.0)


def paint_tier(j, name, cols, length, depth, folds, phase):
    hem = hem_profile(j, length, depth)
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
    Vs, Ns, UVs, Fs, Js, Ws = [], [], [], [], [], []
    tex = np.zeros((TW, TW, 4), np.uint8)             # square, a power of two; the strips fill it from the top
    base = 0
    for j, (name, cols, ytop, hemfn, gap, scale, folds, phase, depth) in enumerate(TIERS):
        tt = np.linspace(0, 1, NV + 1)
        ss = np.linspace(0, 1, NU + 1)
        S, T = np.meshgrid(ss, tt)
        g = gap * (0.35 + 0.65 * T)
        ang = g + S * (2 * np.pi - 2 * g)                 # 0 is straight ahead; the opening is at the front
        yhem = hemfn(ang)
        y = ytop - T * (ytop - yhem)
        length = float(np.mean(ytop - yhem))
        m = scale * (1 + 0.055 * T ** 1.4 * np.cos(folds * ang + phase) + 0.02 * T * np.cos(2.3 * folds * ang + 1.7 * phase))
        yc = np.clip(y, _Y[0], _Y[-1])
        x = _RX(yc) * np.sin(ang) * m
        z = _RZ(yc) * np.cos(ang) * m - 0.028 * sstep(1.0, 0.5, y) - 0.004
        P = np.stack([x, y, z], -1)
        du = np.gradient(P, axis=1); dv = np.gradient(P, axis=0)
        N = np.cross(du, dv); N /= np.maximum(np.linalg.norm(N, axis=-1, keepdims=True), 1e-9)
        if (N[..., 0] * x + N[..., 2] * z).mean() < 0:
            N = -N
        uv = np.stack([(S * (TW - 2) + 1) / TW, (j * TH + 1 + T * (TH - 2)) / TW], -1)
        # skin weights: hips at the top, sharing with each thigh lower down so the skirt moves with her legs
        f = sstep(0.98, 0.60, y) * 0.62
        wl = np.clip(0.5 + 0.8 * np.sin(ang), 0, 1)
        W = np.zeros(P.shape[:2] + (4,), np.float32); J = np.zeros(P.shape[:2] + (4,), np.uint8)
        J[..., 0] = idx['Hips']; J[..., 1] = idx['LeftUpLeg']; J[..., 2] = idx['RightUpLeg']
        W[..., 0] = 1 - f; W[..., 1] = f * wl; W[..., 2] = f * (1 - wl)
        J[W == 0] = 0
        n1 = NU + 1
        a = (np.arange(NV)[:, None] * n1 + np.arange(NU)[None, :]).reshape(-1)
        F = np.concatenate([np.stack([a, a + n1, a + 1], 1), np.stack([a + 1, a + n1, a + n1 + 1], 1)]) + base
        Pf = P.reshape(-1, 3); f0 = F[0] - base
        if np.cross(Pf[f0[1]] - Pf[f0[0]], Pf[f0[2]] - Pf[f0[0]]) @ N.reshape(-1, 3)[f0[0]] < 0:
            F = F[:, ::-1]                                # counter-clockwise seen from outside
        for lst, arr in ((Vs, P), (Ns, N), (UVs, uv), (Js, J), (Ws, W)):
            lst.append(arr.reshape(-1, arr.shape[-1]))
        Fs.append(F); base += P.shape[0] * P.shape[1]
        rgb, alpha = paint_tier(j, name, cols, length, depth, folds, phase)
        tex[j * TH:(j + 1) * TH, :, :3] = rgb; tex[j * TH:(j + 1) * TH, :, 3] = alpha
    buf = io.BytesIO(); Image.fromarray(tex, 'RGBA').save(buf, 'PNG', optimize=True)
    return dict(V=np.concatenate(Vs), N=np.concatenate(Ns), uv=np.concatenate(UVs).astype(np.float32), F=np.concatenate(Fs),
                J=np.concatenate(Js), W=np.concatenate(Ws), png=buf.getvalue(), rough=0.9, cloth=True, n0=sum(len(f) for f in Fs))
