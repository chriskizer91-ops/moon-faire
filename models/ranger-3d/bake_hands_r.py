# bake_hands_r.py: the Ranger's hands and arms, painted from D1 (her left hand) and D2 (her right hand).
# Made from the Jester's bake_hands.py. It adds four pictures to out/ranger_tex.js:
#   hands, handsR  1024 x 1024 each, laid out as the hand model reads them (src/32_hands.js):
#                  top half: five strips, one per digit (index, middle, ring, little, thumb), each wrapping once round its finger,
#                            [palm half | back | palm half], root at the bottom, tip at the top;
#                  bottom half: the back of the hand (left) and the palm (right) laid flat, wrist at the bottom.
#   armL, armR     512 x 1024 each: one arm unrolled. Across: once round the arm, the back of the forearm in the middle of the picture,
#                  the thumb side at three quarters. Down: shoulder at the top, wrist at the bottom; the lower forearm gets 60% of the rows.
# The model's right hand is the left hand mirrored, so D2 is flipped into a left-hand layout first (left_layout) and baked the same way.
# Landmarks are in hand_marks.json, in that layout: outlines measured by tools/hand_measure.py, then checked by eye (tools/hand_marks.py);
# tools/flip_hand.py writes the left-hand layout of a right-hand painting for those two tools.
# Her painted hand has a longer palm and shorter fingers than the hand model, which is the Jester's and was not reshaped:
#   across the hand 1 pixel = 0.2768 mm (knuckles: little to index 207 px for the model's 57.3 mm);
#   along the palm, web to wrist is 362 px for the model's 89 mm; each finger strip is fitted root to tip on its own;
#   along the forearm 1 pixel = 0.30 mm on her, the scale at which the painted forearm is as wide as the model's.
# Run after bake_ranger.py and bake_head.py:  python3 -I bake_hands_r.py
import sys, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = '/home/claude/ranger/'; OUT = ROOT + 'out/'; SH = ROOT + 'shots/'
M = json.loads(open(ROOT + 'hand_marks.json').read())
HS = 0.93                                                   # the hand's size in the model (HAND_S in src/10_geom.js)
KX = 0.0002768                                              # metres of hand model per pixel, across the hand
KA = 0.00030 / HS                                           # the same along the forearm
SL_WR = 0.470                                               # the wrist joint: metres down the arm from the shoulder (L_UARM + L_FARM)
SL0, SL1, SLK, VK = -0.054, 0.493, 0.30, 0.60               # the arm picture: its two ends, and where the forearm's share of rows begins
ARM_R = np.array([[-0.054, 0.003], [-0.050, 0.016], [-0.042, 0.030], [-0.030, 0.0405], [-0.015, 0.0480], [0, 0.0515], [0.04, 0.054], [0.11, 0.050], [0.19, 0.045], [0.245, 0.042], [0.30, 0.040], [0.39, 0.0318], [0.425, 0.0264], [0.447, 0.0235], [0.458, 0.0246], [0.470, 0.0262], [0.482, 0.0285], [0.493, 0.0290]])   # src/R30_body.js
PZ0, PZ1, PY0, PY1 = -0.042, 0.064, 0.034, -0.100          # the flat panels cover this much of the hand (metres)
ORDER = ('idx', 'mid', 'rng', 'pnk', 'thb')
SHOULDER = (212.0, 153.0, 123.0)                             # her painted skin on the body picture right beside the arm (tools/shoulder_tone.py)
ROW_END = 1204                                              # below this row the painted forearm is cut off

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
    m = M[S]; h = np.asarray(left_layout(Image.open(ROOT + m['src']).convert('RGB')) if m.get('flip') else Image.open(ROOT + m['src']).convert('RGB')).astype(np.float32); H, W = h.shape[:2]
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

    # ---- the arm, unrolled ----
    rows = np.arange(H); edge = {}
    for name, x0, x1 in (('D', 0, W // 2), ('P', W // 2, W)):
        mk = hand[:, x0:x1]; has = mk.any(1); l = np.where(has, mk.argmax(1), 0) + x0; r = np.where(has, mk.shape[1] - 1 - mk[:, ::-1].argmax(1), 0) + x0
        c = ndi.gaussian_filter1d(((l + r) / 2).astype(float), 5); wd = ndi.gaussian_filter1d(((r - l) / 2).astype(float), 5)
        edge[name] = (c, wd)
    def sil(name, row, wr):                    # centre and half-width of the painted forearm at a row; held above the wrist and below the cut
        rr = np.clip(row, wr, ROW_END - 6); return np.interp(rr, rows, edge[name][0]), np.interp(rr, rows, edge[name][1])
    Wa, Ha = 512, 1024
    jj, ii = np.mgrid[0:Ha, 0:Wa]; u = (ii + 0.5) / Wa; v = 1 - (jj + 0.5) / Ha
    sl = np.where(v >= VK, SL0 + (1 - v) / (1 - VK) * (SLK - SL0), SLK + (VK - v) / VK * (SL1 - SLK))
    yl = (SL_WR - sl) / HS; phi = (u - 0.5) * 2 * np.pi; dors = np.abs(phi) <= np.pi / 2
    a = np.where(dors, phi, np.where(phi > 0, np.pi - phi, -np.pi - phi))                       # angle from the middle of the view that shows it, toward the thumb
    lin = a / (np.pi / 2); g = 0.90 * (0.55 * np.sin(a) + 0.45 * lin)
    rD, rP = rowD(yl), rowP(yl)
    cD, wD = sil('D', rD, m['WRD']); cP, wP = sil('P', rP, m['WRP'])
    r = np.interp(sl, ARM_R[:, 0], ARM_R[:, 1]); zl = 0.0062 * sms(0.25, 0.45, sl) / HS + (r / HS) * np.sin(phi)      # ARM_Z in src/R30_body.js
    pw = 1 - sms(0.0, 0.035, yl)                                                                 # at the wrist the arm reads the painting exactly as the hand's flat panels do
    xd = (m['AXD'] + (zl - 0.0085) / KX) * pw + (cD + wD * g) * (1 - pw); xp = (m['AXP'] - (zl - 0.0085) / KX) * pw + (cP - wP * g) * (1 - pw)
    cd, cp = samp(ext, xd, np.minimum(rD, ROW_END)), samp(ext, xp, np.minimum(rP, ROW_END))
    w = (sms(0.62, 1.0, np.abs(lin)) * 0.5)[..., None]
    painted = np.where(dors[..., None], cd * (1 - w) + cp * w, cp * (1 - w) + cd * w)
    # above the painted forearm: its own tone carried on, with its fine grain (not its moles) laid over, turning to her shoulder tone under the sleeve
    j_end = int(np.argmax(np.minimum(rD, rP)[:, 0] <= ROW_END - 10))                             # first row (from the top) that is painted
    span = int(0.10 / ((SL1 - SLK) / (VK * Ha)))                                                 # ten centimetres of clean forearm, in rows
    wrapg = lambda arr, s: np.stack([ndi.gaussian_filter(arr[..., c], s, mode=('nearest', 'wrap')) for c in range(3)], -1)
    grain = np.clip(painted - wrapg(painted, 4), -7, 7)
    base = wrapg(np.repeat(painted[j_end + 6:j_end + 70].mean(0, keepdims=True), Ha, 0), (0.1, 14))
    sh = np.array(SHOULDER)
    flat = base.mean(1, keepdims=True)
    k_sh = sms(0.26, 0.04, sl)[..., None]; k_fl = sms(0.31, 0.10, sl)[..., None]                 # toward the shoulder: flatter round the arm, then her chest tone
    body = (base * (1 - 0.7 * k_fl) + flat * 0.7 * k_fl) * (1 - k_sh) + sh[None, None] * k_sh
    jr = j_end + 8 + np.abs((j_end + 8 - jj[:, 0]) % (2 * span) - 0) ; jr = np.where(jr > j_end + 8 + span, 2 * (j_end + 8 + span) - jr, jr); jr = np.clip(jr, 0, Ha - 1)
    synth = body + 0.9 * grain[jr]
    t = sms(j_end + 4, j_end + 44, jj)[..., None]
    arm = synth * (1 - t) + painted * t
    print(S, 'arm: painted from row', j_end, 'of', Ha, '(%.3f m down the arm); forearm tone' % sl[j_end, 0], np.round(base.mean((0, 1))).astype(int).tolist(), 'shoulder tone', sh.astype(int).tolist())
    Image.fromarray(np.clip(hands, 0, 255).astype(np.uint8)).save(SH + 'bake_hands_%s.jpg' % S, quality=88)
    Image.fromarray(np.clip(arm, 0, 255).astype(np.uint8)).save(SH + 'bake_arm_%s.jpg' % S, quality=88)
    return hands, arm

if __name__ == '__main__':
    txt = open(OUT + 'ranger_tex.js').read(); T = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
    for S, hk, ak in (('L', 'hands', 'armL'), ('R', 'handsR', 'armR')):
        hands, arm = make(S); T[hk], k1 = uri(hands); T[ak], k2 = uri(arm); print(S, hk, k1, 'KB;', ak, k2, 'KB')
    js = txt[:txt.index('{')] + json.dumps(T, separators=(',', ':')) + ';'; open(OUT + 'ranger_tex.js', 'w').write(js); print('ranger_tex.js', len(js) // 1024, 'KB')
