# rectify.py: a painting's ground seen from straight above. Each point of the ground is sent through the camera the painting was made
# for and takes the painting's colour there, so a patch cut from it has the ground's true proportions (not foreshortened).
import math
import numpy as np
from PIL import Image
RAD = math.pi / 180
FW, FH = 1774, 887
def camera(C):
    t = math.tan(C['fov'] / 2 * RAD); d = (C['span'] / 2) / t; p = C['pitch'] * RAD; T = C['target']
    return {'pos': (T[0], T[1] + d * math.sin(p), T[2] + d * math.cos(p)), 't': t, 's': math.sin(p), 'c': math.cos(p)}
def project(K, x, y, z):
    vx, vy, vz = x - K['pos'][0], y - K['pos'][1], z - K['pos'][2]
    xc = vx; yc = vy * K['c'] - vz * K['s']; zc = -vy * K['s'] - vz * K['c']
    return ((xc / (zc * K['t'] * (FW / FH)) + 1) / 2 * FW, (1 - yc / (zc * K['t'])) / 2 * FH)
def sample(img, u, v):
    h, w = img.shape[:2]; u = np.clip(u, 0, w - 1.001); v = np.clip(v, 0, h - 1.001)
    i, j = np.floor(u).astype(int), np.floor(v).astype(int); fu, fv = (u - i)[..., None], (v - j)[..., None]
    return img[j, i] * (1 - fu) * (1 - fv) + img[j, i + 1] * fu * (1 - fv) + img[j + 1, i] * (1 - fu) * fv + img[j + 1, i + 1] * fu * fv
def topdown(painting, C, x0, x1, z0, z1, res):
    img = np.asarray(Image.open(painting).convert('RGB')).astype(np.float32); K = camera(C)
    xs = np.arange(x0, x1, res); zs = np.arange(z0, z1, res); X, Z = np.meshgrid(xs, zs)
    u, v = project(K, X, 0 * X, Z)
    out = sample(img, u, v); bad = (u < 0) | (u > FW - 1) | (v < 0) | (v > FH - 1)
    out[bad] = 0
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
