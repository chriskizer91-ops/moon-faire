# bake_hands_io.py: Io's hands, painted from D1 (her left hand) and D2 (her right hand). Made from the Ranger's bake_hands_r.py.
# It adds two pictures to out/io_tex.js:
#   hands, handsR  1024 x 1024 each, laid out as the hand model reads them (src/32_hands.js):
#                  top half: five strips, one per digit (index, middle, ring, little, thumb), each wrapping once round its finger,
#                            [palm half | back | palm half], root at the bottom, tip at the top;
#                  bottom half: the back of the hand (left) and the palm (right) laid flat, wrist at the bottom.
# The model's right hand is the left hand mirrored, so D2 is flipped into a left-hand layout first (left_layout) and baked the same way.
# Landmarks are in hand_marks.json, in that layout: outlines measured by tools/hand_measure.py, then checked by eye (tools/hand_marks.py);
# tools/flip_hand.py writes the left-hand layout of a right-hand painting for those two tools.
# Each hand has its own scale across (KX in hand_marks.json: little knuckle to index knuckle is the model's 57.3 mm);
# along the palm, web to wrist is fitted to the model's 89 mm; each finger strip is fitted root to tip on its own.
# Her arms are painted from D3 (bake_arms_io.py) and end in the plain arm colour at the wrist, so each hand picture is brought to
# that colour at its wrist and the two meet without a line.
# Run after bake_io.py, bake_head_io.py and bake_arms_io.py:  python3 -I bake_hands_io.py
import sys, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = '/home/claude/io/'; OUT = ROOT + 'out/'; SH = ROOT + 'shots/'
M = json.loads(open(ROOT + 'hand_marks.json').read())
PZ0, PZ1, PY0, PY1 = -0.042, 0.064, 0.034, -0.100          # the flat panels cover this much of the hand (metres)
ORDER = ('idx', 'mid', 'rng', 'pnk', 'thb')
ROW_END = 1150                                              # below this row the painted forearm is cut off
KX = KA = 0.00025                                           # set per hand in make()

def sms(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def samp(a, x, y):
    return np.stack([ndi.map_coordinates(a[..., c], [y, x], order=1, mode='nearest') for c in range(a.shape[-1])], -1)

def uri(a, q=90):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); b = io.BytesIO(); im.save(b, 'JPEG', quality=q)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(), len(b.getvalue()) // 1024

def left_layout(im):                                         # a right-hand painting as a left hand: mirrored, then its halves put back so the back view is on the left
    d = im.transpose(Image.FLIP_LEFT_RIGHT); W, H = d.size; h = W // 2; o = Image.new('RGB', (W, H)); o.paste(d.crop((h, 0, W, H)), (0, 0)); o.paste(d.crop((0, 0, h, H)), (W - h, 0)); return o

def row_fn(web, wr):
    # painting row for a height on the hand model (0 at the wrist joint, -0.089 at the middle finger's web, positive up the forearm).
    # The palm has its own scale, chosen so the painted wrist lands on the model's; it eases into the forearm's scale across the wrist.
    ys = np.linspace(-0.13, 0.62, 7501)
    def build(kp):
        k = kp + (KA - kp) * sms(-0.02, 0.025, ys); r = np.concatenate([[0], np.cumsum((ys[1:] - ys[:-1]) / ((k[1:] + k[:-1]) / 2))])
        return r + web - np.interp(-0.089, ys, r)
    lo, hi = 0.00012, 0.00045
    for _ in range(60):
        mid = (lo + hi) / 2
        if np.interp(0, ys, build(mid)) > wr: lo = mid
        else: hi = mid
    r = build((lo + hi) / 2); return (lambda y: np.interp(y, ys, r)), (lo + hi) / 2

def make(S):
    global KX, KA
    m = M[S]; KX = KA = m['KX']; h = np.asarray(left_layout(Image.open(ROOT + m['src']).convert('RGB')) if m.get('flip') else Image.open(ROOT + m['src']).convert('RGB')).astype(np.float32); H, W = h.shape[:2]
    D, P = m['D'], m['P']
    bg = np.median(h[:20, :20].reshape(-1, 3), 0)
    hand = ndi.binary_fill_holes(ndi.binary_opening(np.abs(h - bg).sum(-1) > 60, iterations=2))
    lab, n = ndi.label(hand); keep = np.argsort(ndi.sum(hand, lab, range(1, n + 1)))[-2:] + 1; hand = np.isin(lab, keep)
    hand[ROW_END + 8:] = False
    valid = ndi.binary_erosion(hand, iterations=4)
    # carry the skin outward past the outline, so nothing ever samples the backdrop
    dist, (iy, ix) = ndi.distance_transform_edt(~valid, return_indices=True)
    near = h[iy, ix]; soft = np.stack([ndi.gaussian_filter(near[..., c], 5) for c in range(3)], -1)
    wv = valid.astype(np.float32)[..., None]; ext = h * wv + (near * 0.35 + soft * 0.65) * (1 - wv)
    inside = ndi.distance_transform_edt(ndi.binary_erosion(hand, iterations=3))   # how far inside the outline each pixel is
    rowD, kpD = row_fn(m['WEBD'], m['WRD']); rowP, kpP = row_fn(m['WEBP'], m['WRP'])
    print(S, 'palm scale along, mm a pixel: back %.4f, palm %.4f; across %.4f' % (kpD * 1000, kpP * 1000, KX * 1000))

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

    def panel(palm, Sz=512):
        jj, ii = np.mgrid[0:Sz, 0:Sz]; pu = (ii + 0.5) / Sz; pv = 1 - (jj + 0.5) / Sz
        z = PZ0 + pu * (PZ1 - PZ0); y = PY0 - pv * (PY0 - PY1)
        xd = m['AXD'] + (z - 0.0085) / KX; yd = rowD(y); xp = m['AXP'] - (z - 0.0085) / KX; yp = rowP(y)
        cd, cp = samp(ext, xd, yd), samp(ext, xp, yp)
        din = np.minimum(ndi.map_coordinates(inside, [yd, xd], order=1, mode='nearest'), ndi.map_coordinates(inside, [yp, xp], order=1, mode='nearest'))
        w = (sms(14, 2, din) * 0.5)[..., None]
        out = cp * (1 - w) + cd * w if palm else cd * (1 - w) + cp * w
        # the edge of the hand is seen side-on, where one column of the painting is drawn out across its whole thickness: creases there
        # would show as bands, so toward the outline the picture is smoothed along the hand
        e = sms(16, 3, din)[..., None]; return out * (1 - e) + np.stack([ndi.gaussian_filter(out[..., c], (11, 2)) for c in range(3)], -1) * e

    top = np.concatenate([cell(k) for k in ORDER], 1); top = np.concatenate([top, np.repeat(top[:, -1:], 1024 - top.shape[1], 1)], 1)
    hands = np.concatenate([top, np.concatenate([panel(False), panel(True)], 1)], 0)

    Image.fromarray(np.clip(hands, 0, 255).astype(np.uint8)).save(SH + 'bake_hands_%s.jpg' % S, quality=88)
    # the tone of the painted hand where it leaves the arm (both panels, a band across the wrist joint, the middle of the wrist only)
    r0, r1 = (int(512 * (1 - (PY0 - y) / (PY0 - PY1))) for y in (-0.016, 0.006)); c0, c1 = (int(512 * (z - PZ0) / (PZ1 - PZ0)) for z in (-0.012, 0.024))
    band = np.concatenate([hands[512 + r0:512 + r1, c0:c1].reshape(-1, 3), hands[512 + r0:512 + r1, 512 + (512 - c1):512 + (512 - c0)].reshape(-1, 3)])
    return hands, band.mean(0)

if __name__ == '__main__':
    T = json.loads(open(OUT + 'io_tex.js').read().split('=', 1)[1].rstrip(';'))
    skin = np.array([int(T['skin'][i:i + 2], 16) for i in (1, 3, 5)], np.float32)
    for S, hk in (('L', 'hands'), ('R', 'handsR')):
        hands, wrist = make(S); gain = skin / wrist; hands = hands * gain
        Image.fromarray(np.clip(hands, 0, 255).astype(np.uint8)).save(SH + 'bake_hands_%s.jpg' % S, quality=88)
        T[hk], k1 = uri(hands); print(S, hk, k1, 'KB; wrist tone', wrist.round(0), '-> arm colour', skin, 'gain', gain.round(3))
    js = 'window.IO_TEX=' + json.dumps(T, separators=(',', ':')) + ';'; open(OUT + 'io_tex.js', 'w').write(js); print('io_tex.js', len(js) // 1024, 'KB')
