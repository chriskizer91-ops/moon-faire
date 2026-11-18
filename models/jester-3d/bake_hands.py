# bake_hands.py: the hands picture (1024 x 1024) for the Jester's continuous hand skin (src/32_hands.js).
#   top half:    five strips, one per digit (index, middle, ring, little, thumb). Each wraps once round its finger:
#                [palm half | back | palm half], root at the bottom, tip at the top.
#   bottom half: the back of the hand (left) and the palm (right) laid flat, wrist at the bottom.
# The painting is in3/hands_young_left.png: back view on the left, palm view on the right.
# Scale: 1 pixel = 0.2366 mm; the middle finger's axis is x 330 (back view), its web y 425; the palm view mirrors about x 620.
# Run: python3 -I bake_hands.py   (rewrites 'hands' in out/jester_tex.js and saves shots/bake_hands.png to look at)
import sys, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

K = 0.0002366
PZ0, PZ1, PY0, PY1 = -0.042, 0.064, 0.034, -0.100          # the flat panels cover this much of the hand (metres)
D = {'idx': (417, 440, 425, 108, 30), 'mid': (330, 425, 327, 70, 31), 'rng': (252, 440, 243, 116, 30), 'pnk': (175, 455, 148, 236, 24), 'thb': (490, 600, 566, 382, 34)}   # root x,y, tip x,y, half width (true pixels)
P = {'idx': (836, 430, 822, 106, 30), 'mid': (920, 415, 920, 64, 31), 'rng': (998, 430, 1014, 108, 30), 'pnk': (1068, 460, 1104, 232, 24), 'thb': (760, 590, 680, 382, 34)}
ORDER = ('idx', 'mid', 'rng', 'pnk', 'thb')

def sms(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def samp(a, x, y):
    return np.stack([ndi.map_coordinates(a[..., c], [y, x], order=1, mode='nearest') for c in range(a.shape[-1])], -1)

def flood_backdrop(a, tol=(14, 12, 14)):
    bgc = np.median(a[:12, :12].reshape(-1, 3), 0); l = a.mean(-1)
    flat = np.sqrt(np.maximum(ndi.uniform_filter(l ** 2, 5) - ndi.uniform_filter(l, 5) ** 2, 0)) < 4.5
    cand = (np.abs(a[..., 0] - bgc[0]) < tol[0]) & (np.abs(a[..., 1] - bgc[1]) < tol[1]) & (np.abs(a[..., 2] - bgc[2]) < tol[2]) & flat
    lab, _ = ndi.label(cand); e = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    return ndi.binary_dilation(np.isin(lab, e[e > 0]), iterations=2)

def make(painting, skin_hex=None, check=None):
    h = np.asarray(Image.open(painting).convert('RGB')).astype(np.float32); H, W = h.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    hand = ~flood_backdrop(h)
    hand &= yy < 896                                                     # below this the cuffs begin
    # nails are taken off the painting: the model has real nails, and paint under them would show round their edges
    dark = (h.mean(-1) < 118) & (h[..., 0] - h[..., 2] < 34)
    nail = np.zeros_like(hand)
    for lm, rad in [(D[k], 62) for k in D] + [(P[k], 40) for k in P]:
        nail |= dark & (np.hypot(xx - lm[2], yy - lm[3] - 0.35 * rad) < rad)
    nail = ndi.binary_dilation(nail, iterations=3)
    valid = ndi.binary_erosion(hand, iterations=4) & ~nail
    # carry the skin outward past the outline (and across the nails), so nothing ever samples the backdrop
    dist, (iy, ix) = ndi.distance_transform_edt(~valid, return_indices=True)
    near = h[iy, ix]
    soft = np.stack([ndi.gaussian_filter(near[..., c], 5) for c in range(3)], -1)
    wv = valid.astype(np.float32)[..., None]
    ext = h * wv + (near * 0.35 + soft * 0.65) * (1 - wv)
    if skin_hex:
        sk = np.array([int(skin_hex[i:i + 2], 16) for i in (1, 3, 5)], float)
        gain = np.clip(sk / np.median(h[600:750, 200:300].reshape(-1, 3), 0), 0.8, 1.15); ext = ext * gain; print('hand tone gain', np.round(gain, 3))
    inside = ndi.distance_transform_edt(ndi.binary_erosion(hand, iterations=3))   # how far inside the outline each pixel is

    def strip(lm, s, t):                       # s: -1..1 across the finger (picture left to right), t: 0 at the root of the strip, 1 at the tip
        bx, by, tx, ty, hw = lm; ax, ay = tx - bx, ty - by; L = np.hypot(ax, ay); ux, uy = ax / L, ay / L; nx, ny = -uy, ux
        tt = -0.10 + 1.10 * t; w = hw * (1 - 0.14 * np.clip(tt, 0, 1)); return bx + ax * tt + nx * s * w, by + ay * tt + ny * s * w

    def cell(k, Wc=204, Hc=512):
        jj, ii = np.mgrid[0:Hc, 0:Wc]; q = (ii + 0.5) / Wc; t = 1 - (jj + 0.5) / Hc; th = q * 2 * np.pi
        isd = (q >= 0.25) & (q < 0.75)
        a = np.where(isd, np.pi - th, np.where(q < 0.25, th, th - 2 * np.pi))                  # the angle from the middle of whichever view shows this part
        lin = a / (np.pi / 2); g = 0.90 * (0.55 * np.sin(a) + 0.45 * lin)                      # part flat picture, part even wrap; stops short of the outline
        xd, yd = strip(D[k], g, t); xp, yp = strip(P[k], -g, t)                                # the same side of the finger in the back view and the palm view
        cd, cp = samp(ext, xd, yd), samp(ext, xp, yp)
        w = (sms(0.62, 1.0, np.abs(lin)) * 0.5)[..., None]                                     # near the sides the two views are mixed, so they meet without a line
        return np.where(isd[..., None], cd * (1 - w) + cp * w, cp * (1 - w) + cd * w)

    def panel(palm, S=512):
        jj, ii = np.mgrid[0:S, 0:S]; pu = (ii + 0.5) / S; pv = 1 - (jj + 0.5) / S
        z = PZ0 + pu * (PZ1 - PZ0); y = PY0 - pv * (PY0 - PY1)
        xd = 330 + (z - 0.0085) / K; yp = 425 + (y + 0.089) / K; xp = 1240 - xd
        cd, cp = samp(ext, xd, yp), samp(ext, xp, yp)
        din = np.minimum(ndi.map_coordinates(inside, [yp, xd], order=1, mode='nearest'), ndi.map_coordinates(inside, [yp, xp], order=1, mode='nearest'))
        w = (sms(14, 2, din) * 0.5)[..., None]
        return cp * (1 - w) + cd * w if palm else cd * (1 - w) + cp * w

    top = np.concatenate([cell(k) for k in ORDER], 1); top = np.concatenate([top, np.repeat(top[:, -1:], 1024 - top.shape[1], 1)], 1)
    atlas = np.concatenate([top, np.concatenate([panel(False), panel(True)], 1)], 0)
    im = Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8))
    if check: im.save(check)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=90); print('hands picture', im.size, len(b.getvalue()) // 1024, 'KB')
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

if __name__ == '__main__':
    OUT = '/home/claude/work/out/jester_tex.js'
    T = json.loads(open(OUT).read()[len('window.JESTER_TEX='):-1])
    T['hands'] = make('/home/claude/work/in3/hands_young_left.png', T.get('skin'), '/home/claude/work/shots/bake_hands.png')
    js = 'window.JESTER_TEX=' + json.dumps(T, separators=(',', ':')) + ';'; open(OUT, 'w').write(js); print('jester_tex.js', len(js) // 1024, 'KB')
