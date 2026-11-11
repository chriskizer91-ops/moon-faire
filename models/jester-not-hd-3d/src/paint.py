"""Colour for every point on her surface. Each function gets texel positions P, normals N,
and the tag of the shape each texel belongs to, and returns RGB (0..255).
Colours are sampled from the fabric squares (D3) and the detail sheets (C2, C3, C8)."""
import os
import numpy as np
from scipy import ndimage
import jester as JS
from bake import AP, cell, rnd, tones, stars

HERE = os.path.dirname(__file__)
REF = os.path.join(HERE, '..', 'refs', 'gen')

SKIN = (254, 205, 175)
SKIN_SH = (236, 176, 150)
LEG = ((118, 64, 132), (131, 74, 143), (146, 88, 158))
STAR = (47, 26, 50)
BODICE = ((80, 42, 102), (104, 58, 128), (124, 76, 148))
CORSET = ((30, 25, 28), (42, 35, 38), (60, 50, 52))
PLUM = ((78, 32, 74), (122, 48, 108), (150, 68, 134))
RUFFLE = ((30, 25, 27), (49, 40, 43), (82, 64, 67))
LEATHER = ((31, 26, 29), (39, 33, 35), (58, 48, 49))
CAPC = ((36, 29, 31), (50, 40, 42), (66, 52, 54))
HORN = ((40, 31, 33), (63, 48, 49), (104, 78, 76))
GOLD = ((150, 98, 40), (214, 160, 62), (250, 218, 120))
GEM = ((20, 100, 104), (36, 160, 150), (130, 232, 214))
SOCK_W = (238, 236, 240)
SOCK_L = (176, 150, 206)
INK = (22, 16, 18)


def fill(n, c):
    return np.tile(np.array(c, float), (n, 1))


def leg_coords(P):
    """Coordinates wrapped round each leg, in art pixels: u round the leg (0 on the outside), v up."""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    sx = np.where(x >= 0, 1.0, -1.0)
    ys = np.array([JS.ANKLE[1], JS.KNEE[1], JS.HIP[1]])
    cx = np.interp(y, ys, [JS.ANKLE[0], JS.KNEE[0], JS.HIP[0]])
    cz = np.interp(y, ys, [JS.ANKLE[2], JS.KNEE[2], JS.HIP[2]])
    th = np.arctan2(z - cz, (np.abs(x) - cx))
    return th * 0.05 / AP + sx * 400, y / AP          # the two legs get different phases


def body(P, N, tag):
    n = len(P)
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    C = tones(P, *LEG, pd=0.16, pl=0.12)
    # leggings with stars
    legs = np.isin(tag, ['thigh', 'shin', 'glute']) | ((tag == 'torso') & (y < 1.062))
    hips = legs & (y > JS.HIP[1] + 0.01) | (tag == 'glute')
    u, v = leg_coords(P)
    uh = np.arctan2(x, z) * 0.10 / AP                  # round the hips instead
    period = 2 * np.pi * 0.05 / AP / 5
    st = np.where(hips, stars(uh, v, period), stars(u, v, period))
    C[legs & st] = STAR
    # striped socks
    sock = (tag == 'shin') & (y > 0.292) & (y < 0.352)
    band = np.floor((y - 0.292) / 0.012).astype(int)
    C[sock] = SOCK_W
    C[sock & (band % 2 == 1)] = SOCK_L
    # bodice
    up = np.isin(tag, ['torso', 'bust', 'trap']) & (y >= 1.062)
    C[up] = tones(P[up], *BODICE, pd=0.2, pl=0.14)
    lat = up & (((np.floor(np.arctan2(x, z) * 0.08 / AP) + np.floor(y / AP)) % 5) == 0)
    C[lat] = BODICE[2]
    C[up & (y < 1.152)] = tones(P[up & (y < 1.152)], *CORSET)          # the dark waist under the bust
    front = z > -0.012
    vneck = 1.262 + 1.64 * np.abs(x)
    skin = up & front & (y > vneck) & (np.abs(x) < 0.05) | (tag == 'neck')
    C[skin] = SKIN
    trim = up & front & (np.abs(y - vneck) < 0.0042) & (np.abs(x) < 0.047)
    bead = (np.floor(np.hypot(x, y * 0.6) / 0.0045) % 2) == 0
    C[trim] = np.where(bead[trim, None], np.array(GOLD[2], float), np.array(GOLD[0], float))
    # the gold cross straps, front and back
    for cy, slope, fr in ((1.190, 1.556, True), (1.210, 1.80, False)):
        for sgn in (1, -1):
            dist = np.abs(y - cy - sgn * slope * x) / np.hypot(1, slope)
            m = up & (front == fr) & (dist < 0.0032) & (y > 1.118) & (y < (vneck if fr else 1.30)) & (np.abs(x) < 0.062)
            C[m] = np.where(((np.floor(y / 0.004) % 2) == 0)[m, None], np.array(GOLD[1], float), np.array(GOLD[0], float))
    # belt
    b = tag == 'belt'
    C[b] = tones(P[b], *LEATHER)
    C[b & (np.abs(y - 1.089) > 0.0225)] = INK
    stud = b & (np.abs(y - 1.089) < 0.004) & (np.abs(np.mod(np.arctan2(x, z) * 0.09, 0.028) - 0.014) < 0.0035)
    C[stud] = GOLD[1]
    # arms: plum under the puff, black under the cuff
    a = tag == 'arm'
    C[a] = tones(P[a], *PLUM)
    f = tag == 'forearm'
    C[f] = tones(P[f], *RUFFLE)
    return C


def boots(P, N, tag):
    C = tones(P, *LEATHER, pd=0.18, pl=0.10)
    for sx in (1, -1):
        o = np.array([JS.ANKLE[0] * sx, 0.0, JS.ANKLE[2]])
        q = P - o
        mine = np.sign(P[:, 0]) == sx
        sole = mine & (tag == 'sole')
        C[sole] = tones(P[sole], (18, 15, 17), (26, 22, 24), (40, 34, 35))
        C[sole & (q[:, 1] > 0.043) & (N[:, 1] < 0.6)] = (74, 62, 64)            # the welt line round the top of the sole
        ang = np.arctan2(q[:, 0], q[:, 2])
        notch = sole & (q[:, 1] < 0.020) & (np.mod(ang * 0.06, 0.020) < 0.007) & (N[:, 1] < 0.5)
        C[notch] = INK                                                            # tread cut into the edge
        # laces up the front of the shaft
        fr = mine & (q[:, 2] > 0.03) & (np.abs(q[:, 0]) < 0.024) & (q[:, 1] > 0.135) & (q[:, 1] < 0.295) & (N[:, 2] > 0.35)
        row = np.mod(q[:, 1] - 0.135, 0.021)
        C[fr & (np.abs(q[:, 0]) < 0.014)] = INK
        C[fr & (row < 0.007) & (np.abs(q[:, 0]) < 0.019)] = (86, 72, 74)          # a lace crossing
        C[fr & (row < 0.008) & (np.abs(np.abs(q[:, 0]) - 0.019) < 0.004)] = GOLD[1]   # eyelets
        cap = mine & np.isin(tag, ['toecap', 'vamp']) & (np.abs(q[:, 2] - 0.062) < 0.0025) & (q[:, 1] > 0.055)
        C[cap] = (70, 58, 60)                                                     # toe-cap seam
    return C


def cap(P, N, tag):
    return tones(P, *CAPC, pd=0.2, pl=0.12)


def horns(P, N, tag, owner=None, shapes=None):
    C = tones(P, *HORN, pd=0.10, pl=0.0)
    top = (N[:, 1] > 0.45) & (rnd(*cell(P).T, seed=11) > 0.45)
    C[top] = (86, 66, 65)                                  # the padded cloth catches light along the top
    for i, sh in enumerate(shapes):
        m = owner == i
        if sh.tag == 'horn' and m.any():
            s = sh.param(P[m]) * sh.length
            ph = np.mod(s / 0.034, 1.0)                   # 0 in a stitched groove, 0.5 on the crown of a rib
            c = C[m]
            c[(ph < 0.09) | (ph > 0.91)] = INK

            C[m] = c
        if sh.tag == 'pompom' and m.any():
            c = P[m] - (JS.POMPOM_C * [np.sign(P[m][:, 0].mean()), 1, 1])
            ang = np.arctan2(c[:, 0], c[:, 1]) * 9 + np.arctan2(c[:, 2], np.hypot(c[:, 0], c[:, 1])) * 7
            strand = (np.floor(ang) % 2) == 0
            cc = tones(P[m], (20, 16, 18), (34, 28, 30), (58, 46, 48), pd=0.3, pl=0.16)
            cc[strand & (rnd(*cell(P[m]).T) > 0.55)] = (58, 46, 48)
            C[m] = cc
    return C


def hands(P, N, tag):
    return fill(len(P), SKIN)


# C3 front view: face centre column, chin row, and metres per pixel (chin to cap edge is 207 px = 13.2 cm)
C3 = dict(cx=469.0, chin=580.0, k=0.132 / 207.0, chin_y=1.424)
_face = None


def face_image():
    """Her face from C3 with the cap, ruff and outline cleared away to plain skin."""
    global _face
    if _face is None:
        from PIL import Image
        im = np.asarray(Image.open(os.path.join(REF, 'C', 'C3.png')).convert('RGB')).astype(int)
        r, g, b = im[..., 0], im[..., 1], im[..., 2]
        lum = 0.3 * r + 0.59 * g + 0.11 * b
        dark = lum < 105
        H, W = lum.shape
        yy, xx = np.mgrid[0:H, 0:W]
        inface = (np.abs(xx - C3['cx']) < 100) & (yy > 366) & (yy < 590)
        eyeband = (yy >= 398) & (yy < 512) & (np.abs(xx - C3['cx']) <= 84)      # brows, lashes and tear lines are dark but hers
        lab, _ = ndimage.label(dark & inface & ~eyeband | ~inface)
        outside = lab == lab[0, 0]
        outside = ndimage.binary_dilation(outside, iterations=2) & ~eyeband | outside
        out = im.copy()
        out[outside] = SKIN
        _face = out
    return _face


def head(P, N, tag):
    C = fill(len(P), SKIN)
    img = face_image()
    px_ = C3['cx'] + P[:, 0] / C3['k']
    py_ = C3['chin'] - (P[:, 1] - C3['chin_y']) / C3['k']
    ok = (N[:, 2] > 0.12) & (py_ > 366) & (py_ < 589) & (np.abs(px_ - C3['cx']) < 99)
    xi = np.clip(np.round(px_).astype(int), 0, img.shape[1] - 1); yi = np.clip(np.round(py_).astype(int), 0, img.shape[0] - 1)
    C[ok] = img[yi[ok], xi[ok]]
    C[(P[:, 1] < 1.415) & (P[:, 2] < 0.05)] = SKIN_SH          # under the chin
    return C


def outfit(P, N, tag):
    C = tones(P, *RUFFLE, pd=0.26, pl=0.16)
    pf = tag == 'puff'
    C[pf] = tones(P[pf], *PLUM, pd=0.18, pl=0.12)
    for sx in (1, -1):
        m = np.array([sx, 1, 1.0])
        sh, el = JS.SH * m, JS.EL * m
        ax = JS.norm(el - sh)
        v = P - (sh + ax * JS.UPPER_ARM * 0.46)
        r = v - np.outer(v @ ax, ax)
        e1 = JS.norm(np.cross(ax, (0, 0, 1.0))); e2 = np.cross(ax, e1)
        phi = np.arctan2(r @ e1, r @ e2)
        groove = pf & (np.sign(P[:, 0]) == sx) & ((0.5 + 0.5 * np.cos(14 * phi)) ** 2 > 0.72)
        C[groove] = PLUM[0]
        ridge = pf & (np.sign(P[:, 0]) == sx) & ((0.5 + 0.5 * np.cos(14 * phi)) ** 2 < 0.04)
        C[ridge] = PLUM[2]
    # frill edges catch the light: lighter where a cuff or ruff surface faces up or outward at its rim
    cf = tag == 'cuff'
    C[cf & (rnd(*cell(P).T, seed=3) > 0.80)] = RUFFLE[2]
    g = np.isin(tag, ['buckle', 'bell', 'gold', 'string'])
    C[g] = tones(P[g], *GOLD, pd=0.12, pl=0.16)
    bell = tag == 'bell'
    C[bell & (N[:, 1] < -0.55)] = INK                           # the slot under each bell
    C[bell & (N[:, 1] > 0.45) & (N[:, 2] > 0.3)] = GOLD[2]
    gem = tag == 'gem'
    C[gem] = GEM[1]
    C[gem & (N[:, 1] > 0.25)] = GEM[2]
    C[gem & (N[:, 1] < -0.3)] = GEM[0]
    bw = tag == 'bow'
    C[bw] = tones(P[bw], (128, 34, 52), (176, 52, 70), (214, 92, 98), pd=0.2, pl=0.2)
    po = tag == 'pouch'
    C[po] = tones(P[po], *LEATHER, pd=0.2, pl=0.14)
    return C


PAINT = dict(body=body, boots=boots, cap=cap, horns=horns, hands=hands, head=head, outfit=outfit)
