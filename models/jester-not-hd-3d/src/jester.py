"""The Jester as a game character: skeleton and body shape.

All sizes are in metres. She faces +Z, +X is her left, +Y is up, feet on y = 0.
Proportions are read off the A1 front view (930 px from boot soles to the top of
the cap = 1.66 m), so the bind pose is the A1 standing pose and the paintings
can be projected straight onto it later."""
import numpy as np
from sdf import (Part, Ellipsoid, RoundCone, Column, Sweep, Func, smin, smax, sstep, norm, BIG)

HEIGHT = 1.66                 # soles to top of cap
S = HEIGHT / 930.0            # metres per A1 pixel
CX, GROUND = 447.5, 980.0     # A1 pixel column of her centre line, and row of the ground


def px(x, y):
    """A1 front-view pixel -> (x, y) in metres."""
    return (x - CX) * S, (GROUND - y) * S


# ----------------------------------------------------------------- skeleton
ARM_ANGLE = np.radians(31.0)                      # arms away from vertical in the bind pose
ARM_DIR = np.array([np.sin(ARM_ANGLE), -np.cos(ARM_ANGLE), 0.0])
UPPER_ARM, FOREARM = 0.255, 0.233

SH = np.array([0.092, 1.305, -0.010])
EL = SH + UPPER_ARM * ARM_DIR + np.array([0, 0, -0.004])
WR = EL + FOREARM * ARM_DIR + np.array([0, 0, 0.012])
HIP = np.array([0.066, 0.925, 0.0])
KNEE = np.array([0.074, 0.557, 0.012])
ANKLE = np.array([0.095, 0.137, -0.012])
TOE = np.array([0.095, 0.055, 0.060])

PALM_N = np.array([-np.cos(ARM_ANGLE), -np.sin(ARM_ANGLE), 0.0])   # left palm faces her thigh
ZF = np.array([0.0, 0.0, 1.0])
PALM_LEN = 0.058
FINGERS = {   # name: (offset along z at knuckle, knuckle distance along hand, length, base radius, tip radius)
    'Index':  (0.0165, 0.058, 0.050, 0.0060, 0.0047),
    'Middle': (0.0055, 0.060, 0.055, 0.0061, 0.0048),
    'Ring':   (-0.0055, 0.058, 0.051, 0.0058, 0.0046),
    'Pinky':  (-0.0160, 0.053, 0.040, 0.0052, 0.0042),
}
PHAL = (0.45, 0.30, 0.25)
CURL = np.radians(7.0)        # relaxed curl per joint in the bind pose

HORN = np.array([   # x, y, z, radius  (left horn; mirrored for the right)
    (0.030, 1.598, -0.020, 0.048),
    (0.075, 1.650, -0.026, 0.057),
    (0.120, 1.672, -0.031, 0.060),
    (0.165, 1.664, -0.036, 0.060),
    (0.205, 1.640, -0.039, 0.054),
    (0.235, 1.605, -0.041, 0.044),
    (0.249, 1.570, -0.041, 0.033),
    (0.256, 1.537, -0.041, 0.020),
    (0.258, 1.510, -0.041, 0.012),
])
POMPOM_C = np.array([0.266, 1.458, -0.041]); POMPOM_R = 0.058


def rot_axis(axis, ang):
    axis = norm(axis); x, y, z = axis; c, s = np.cos(ang), np.sin(ang); C = 1 - c
    return np.array([[c + x * x * C, x * y * C - z * s, x * z * C + y * s],
                     [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
                     [z * x * C - y * s, z * y * C + x * s, c + z * z * C]])


def finger_chain(name):
    """World positions of a left finger's three joints and its tip (bind pose)."""
    if name == 'Thumb':
        base = WR + 0.014 * ARM_DIR + 0.017 * ZF + 0.003 * PALM_N
        d = norm(0.60 * ARM_DIR + 0.74 * ZF + 0.22 * PALM_N)
        lens = (0.024, 0.021, 0.017)
        hinge = norm(np.cross(d, norm(PALM_N - ZF * 0.6)))
        pts = [base]
        for i, L in enumerate(lens):
            d = rot_axis(hinge, CURL * (0 if i == 0 else 1)) @ d
            pts.append(pts[-1] + L * d)
        return np.array(pts), (0.0078, 0.0058)
    zoff, kd, L, r0, r1 = FINGERS[name]
    base = WR + kd * ARM_DIR + zoff * ZF
    hinge = np.cross(ARM_DIR, PALM_N)            # curling turns the finger toward the palm
    d = ARM_DIR.copy()
    pts = [base]
    for f in PHAL:
        d = rot_axis(hinge, CURL) @ d
        pts.append(pts[-1] + L * f * d)
    return np.array(pts), (r0, r1)


def skeleton():
    """Returns (names, parents, rest world positions). Rest rotations are identity."""
    J = []

    def add(n, p, pos):
        J.append((n, p, np.asarray(pos, float)))

    add('Hips', None, (0, 0.955, 0.0))
    add('Spine', 'Hips', (0, 1.045, 0.0))
    add('Spine1', 'Spine', (0, 1.130, 0.0))
    add('Spine2', 'Spine1', (0, 1.215, -0.004))
    add('Neck', 'Spine2', (0, 1.340, -0.012))
    add('Head', 'Neck', (0, 1.428, -0.004))
    for side, sx in (('Left', 1), ('Right', -1)):
        m = np.array([sx, 1, 1.0])
        add(side + 'Shoulder', 'Spine2', np.array([0.026, 1.318, -0.008]) * m)
        add(side + 'Arm', side + 'Shoulder', SH * m)
        add(side + 'ForeArm', side + 'Arm', EL * m)
        add(side + 'Hand', side + 'ForeArm', WR * m)
        for f in ('Thumb', 'Index', 'Middle', 'Ring', 'Pinky'):
            pts, _ = finger_chain(f)
            for i in range(3):
                add(f'{side}Hand{f}{i + 1}', side + 'Hand' if i == 0 else f'{side}Hand{f}{i}', pts[i] * m)
    for side, sx in (('Left', 1), ('Right', -1)):
        m = np.array([sx, 1, 1.0])
        add(side + 'UpLeg', 'Hips', HIP * m)
        add(side + 'Leg', side + 'UpLeg', KNEE * m)
        add(side + 'Foot', side + 'Leg', ANKLE * m)
        add(side + 'ToeBase', side + 'Foot', TOE * m)
    for side, sx in (('Left', 1), ('Right', -1)):
        m = np.array([sx, 1, 1.0])
        add(side + 'Horn1', 'Head', HORN[1, :3] * m)
        add(side + 'Horn2', side + 'Horn1', HORN[3, :3] * m)
        add(side + 'Horn3', side + 'Horn2', HORN[6, :3] * m)
        add(side + 'Pompom', side + 'Horn3', HORN[8, :3] * m)
    names = [j[0] for j in J]
    parents = [None if j[1] is None else names.index(j[1]) for j in J]
    pos = np.array([j[2] for j in J])
    return names, parents, pos


BONES = skeleton()[0]

# -------------------------------------------------------------------- colours (sRGB 0..255)
SKIN = (249, 211, 187)
LEGGING = (140, 84, 152)
LEGGING_DK = (58, 30, 78)
BODICE = (92, 50, 108)
BELT = (38, 32, 36)
SLEEVE = (104, 30, 52)
SOCK = (236, 236, 240)
SOCK_DK = (52, 46, 58)
BOOT = (26, 22, 26)
SOLE = (16, 14, 16)
CAP = (46, 38, 42)
HORNC = (54, 46, 50)
POMC = (30, 26, 30)


# ---------------------------------------------------------------------- parts
def body_part(step=0.004):
    p = Part('body', step, soft=0.008)
    Y0, Y1 = 0.885, 1.345
    L = Y1 - Y0

    def ty(y):
        return (y - Y0) / L

    rows = [  # y, rx, rz, ox, oz
        (0.885, 0.060, 0.060, 0, -0.004),
        (0.925, 0.120, 0.088, 0, -0.008),
        (0.975, 0.113, 0.086, 0, -0.006),
        (1.030, 0.090, 0.070, 0, -0.002),
        (1.095, 0.070, 0.055, 0, 0.002),
        (1.150, 0.077, 0.061, 0, 0.002),
        (1.215, 0.087, 0.068, 0, -0.002),
        (1.270, 0.089, 0.064, 0, -0.008),
        (1.310, 0.078, 0.054, 0, -0.010),
        (1.345, 0.044, 0.042, 0, -0.012),
    ]
    torso = Column((0, Y0, 0), (0, Y1, 0), [(ty(r[0]),) + r[1:] for r in rows], n=2.3, tag='torso',
                   wkeys=[(ty(1.000), {'Hips': 1}), (ty(1.090), {'Spine': 1}),
                          (ty(1.170), {'Spine1': 1}), (ty(1.255), {'Spine2': 1})])
    p.add(torso)
    for sx, side in ((1, 'Left'), (-1, 'Right')):
        m = np.array([sx, 1, 1.0])
        p.add(Ellipsoid(np.array([0.040, 1.212, 0.048]) * m, (0.040, 0.041, 0.038), bone='Spine2', tag='bust'), 0.022)
        p.add(Ellipsoid(np.array([0.052, 0.915, -0.052]) * m, (0.058, 0.062, 0.050), bone='Hips', tag='glute'), 0.03)
        p.add(RoundCone(np.array([0.030, 1.345, -0.014]) * m, np.array([0.086, 1.312, -0.012]) * m, 0.030, 0.035,
                        wkeys=[(0, {'Spine2': 1}), (0.5, {'Spine2': 0.5, side + 'Shoulder': 0.5}), (1, {side + 'Shoulder': 1})],
                        tag='trap'), 0.025)
        sh, el, wr = SH * m, EL * m, WR * m
        p.add(Column(sh, el, [(0, 0.035, 0.038), (0.25, 0.034, 0.036), (0.6, 0.029, 0.030), (1, 0.026, 0.027)],
                     side=(sx, 0, 0), tag='arm',
                     wkeys=[(0, {side + 'Shoulder': 0.5, side + 'Arm': 0.5}), (0.2, {side + 'Arm': 1}),
                            (0.84, {side + 'Arm': 1}), (1, {side + 'Arm': 0.5, side + 'ForeArm': 0.5})]), 0.02)
        p.add(Column(el, wr, [(0, 0.026, 0.027), (0.25, 0.027, 0.028), (0.7, 0.021, 0.023), (1, 0.014, 0.019)],
                     side=(sx, 0, 0), tag='forearm',
                     wkeys=[(0, {side + 'Arm': 0.5, side + 'ForeArm': 0.5}), (0.18, {side + 'ForeArm': 1}),
                            (0.93, {side + 'ForeArm': 1}), (1, {side + 'ForeArm': 0.6, side + 'Hand': 0.4})]), 0.004)
        hip, kn, an = HIP * m, KNEE * m, ANKLE * m
        p.add(Column(hip, kn, [(0, 0.061, 0.066), (0.25, 0.059, 0.064), (0.6, 0.051, 0.055), (0.9, 0.044, 0.047), (1, 0.043, 0.046)],
                     side=(sx, 0, 0), tag='thigh',
                     wkeys=[(0, {'Hips': 0.55, side + 'UpLeg': 0.45}), (0.17, {side + 'UpLeg': 1}),
                            (0.87, {side + 'UpLeg': 1}), (1, {side + 'UpLeg': 0.5, side + 'Leg': 0.5})]), 0.03)
        p.add(Column(kn, an, [(0, 0.043, 0.046), (0.10, 0.0425, 0.044, 0.001, -0.002), (0.25, 0.050, 0.053, 0.004, -0.008),
                              (0.42, 0.041, 0.043, 0.002, -0.004), (0.52, 0.0365, 0.038), (0.80, 0.034, 0.035), (1, 0.033, 0.034)],
                     side=(sx, 0, 0), tag='shin',
                     wkeys=[(0, {side + 'UpLeg': 0.5, side + 'Leg': 0.5}), (0.13, {side + 'Leg': 1}), (1, {side + 'Leg': 1})]), 0.004)
    for sx, side in ((1, 'Left'), (-1, 'Right')):
        m = np.array([sx, 1, 1.0])
        kn, el = KNEE * m, EL * m
        up = np.array([0, 0.012, 0])
        p.add(RoundCone(kn + up, kn - up, 0.0445, 0.0440, tag='shin',
                        wkeys=[(0, {side + 'UpLeg': 0.7, side + 'Leg': 0.3}), (1, {side + 'UpLeg': 0.3, side + 'Leg': 0.7})]), 0.006)
        ad = ARM_DIR * m * 0.008
        p.add(RoundCone(el - ad, el + ad, 0.0265, 0.0265, tag='forearm',
                        wkeys=[(0, {side + 'Arm': 0.7, side + 'ForeArm': 0.3}), (1, {side + 'Arm': 0.3, side + 'ForeArm': 0.7})]), 0.006)
    p.add(Column((0, 1.33, -0.012), (0, 1.455, -0.006), [(0, 0.031, 0.031), (1, 0.030, 0.031)], tag='neck',
                 wkeys=[(0, {'Spine2': 0.6, 'Neck': 0.4}), (0.45, {'Neck': 1}), (0.75, {'Neck': 1}), (1, {'Neck': 0.4, 'Head': 0.6})]), 0.015)

    tb = Part('tb', step)
    for s_, k_, _ in p.items:
        if s_.tag in ('torso', 'bust'):
            tb.add(s_, k_)

    def neckline(P):
        x, z = np.abs(P[:, 0]), P[:, 2]
        front = 1.268 + 0.85 * np.maximum(x - 0.026, 0)
        return np.where(z > -0.012, front, 1.312)

    def bodice(P):
        d = tb.dist(P) - 0.005
        return smax(smax(d, P[:, 1] - neckline(P), 0.002), 1.100 - P[:, 1], 0.002)

    def belt(P):
        return smax(tb.dist(P) - 0.0075, np.abs(P[:, 1] - 1.089) - 0.027, 0.003)

    tb2 = Part('tb2', step)
    for s_, k_, _ in p.items:
        if s_.tag in ('torso', 'bust', 'trap'):
            tb2.add(s_, k_)

    def shrug(P):     # the wine velvet over her shoulders and upper back, open over the chest
        x, y, z = np.abs(P[:, 0]), P[:, 1], P[:, 2]
        d = tb2.dist(P) - 0.0055
        chest = np.maximum(x - 0.058, -(z + 0.012))                 # negative inside the open chest window
        d = smax(d, -chest, 0.003)
        d = smax(d, 1.262 - y, 0.003)
        return smax(d, 0.047 - np.sqrt(P[:, 0] ** 2 + (z + 0.012) ** 2), 0.004)   # hole for the neck

    def wshrug(P):
        W, _, _ = tb2.weights(P, BONES)
        return {b: W[:, i] for i, b in enumerate(BONES) if W[:, i].max() > 1e-4}

    p.add(Func(shrug, (-0.14, 1.25, -0.11), (0.14, 1.40, 0.11), wfn=wshrug, tag='shrug'))
    p.add(Func(bodice, (-0.13, 1.09, -0.11), (0.13, 1.36, 0.11), wfn=torso.weights, tag='bodice'))
    p.add(Func(belt, (-0.13, 1.05, -0.11), (0.13, 1.13, 0.11), wfn=torso.weights, tag='belt'))
    p.post = lambda P, d: np.maximum(d, 0.262 - P[:, 1])        # the boots take over below here

    def colour(V, owner_tags):
        C = np.empty((len(V), 3))
        x, y, z = V[:, 0], V[:, 1], V[:, 2]
        tag = np.array(owner_tags)
        C[:] = LEGGING
        up = np.isin(tag, ['torso', 'bust'])
        C[up & (y > 1.10)] = SKIN
        C[tag == 'bodice'] = BODICE
        C[tag == 'belt'] = BELT
        C[np.isin(tag, ['trap', 'arm', 'forearm', 'shrug'])] = SLEEVE
        C[tag == 'neck'] = SKIN
        return C

    p.colour = colour
    return p


def head_core():
    c = Part('headcore', 0.003)
    c.add(Ellipsoid((0, 1.555, -0.012), (0.0715, 0.095, 0.088), bone='Head'))
    c.add(Ellipsoid((0, 1.492, 0.020), (0.058, 0.070, 0.066), bone='Head'), 0.02)
    c.add(Ellipsoid((0, 1.440, 0.055), (0.022, 0.018, 0.022), bone='Head'), 0.015)
    return c


def window(P):
    """Negative inside the opening of the cap that shows her face."""
    q = np.abs(np.stack([P[:, 0], P[:, 1] - 1.462], 1)) - np.array([0.057 - 0.028, 0.095 - 0.028])
    d2 = np.linalg.norm(np.maximum(q, 0), axis=1) + np.minimum(q.max(axis=1), 0) - 0.028
    return np.maximum(d2, 0.010 - P[:, 2])


def head_part(step=0.003):
    core = head_core()
    p = Part('head', step)
    for s, k, op in core.items:
        p.add(s, k)
    p.add(Ellipsoid((0, 1.479, 0.0835), (0.0055, 0.012, 0.0095), bone='Head'), 0.007)      # nose
    p.add(Column((0, 1.36, -0.010), (0, 1.47, -0.004), [(0, 0.031, 0.031), (1, 0.030, 0.031)], bone='Head'), 0.02)

    def clip(P, d):   # only the face and the front of the neck are skin; the cap covers the rest
        q = np.abs(P - np.array([0, 1.465, 0.055])) - np.array([0.068, 0.103, 0.062])
        box = np.linalg.norm(np.maximum(q, 0), axis=1) + np.minimum(q.max(axis=1), 0)
        return smax(d, box, 0.004)

    p.post = clip
    p.colour = lambda V, tags: np.tile(np.array(SKIN, float), (len(V), 1))
    return p


def cap_part(step=0.003):
    core = head_core()

    def fn(P):
        y = P[:, 1]
        band = sstep(1.550, 1.558, y) * (1 - sstep(1.598, 1.606, y)) * sstep(-0.02, 0.02, P[:, 2])
        d = core.dist(P) - (0.007 + 0.004 * band)
        d = smax(d, -window(P), 0.006)
        d = smax(d, 1.385 - y, 0.01)          # ends at the nape
        return d

    p = Part('cap', step)
    p.add(Func(fn, (-0.095, 1.37, -0.115), (0.095, 1.675, 0.105), bone='Head'))
    p.colour = lambda V, tags: np.tile(np.array(CAP, float), (len(V), 1))
    return p


def catmull(P, n):
    P = np.asarray(P, float)
    Q = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]])
    out = []
    segs = len(P) - 1
    for i in range(segs):
        p0, p1, p2, p3 = Q[i], Q[i + 1], Q[i + 2], Q[i + 3]
        ts = np.linspace(0, 1, n, endpoint=(i == segs - 1))
        for t in ts:
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return np.array(out)


def horns_part(step=0.0045):
    p = Part('horns', step, soft=0.004)
    for sx, side in ((1, 'Left'), (-1, 'Right')):
        m = np.array([sx, 1, 1, 1.0])
        C = catmull(HORN * m, 10)
        pts, rad = C[:, :3], C[:, 3].copy()
        seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
        s = np.concatenate([[0], np.cumsum(seg)])
        rib = (0.5 + 0.5 * np.cos(2 * np.pi * s / 0.034)) ** 6          # stitched ribs along the padded horn
        rad *= 1 - 0.07 * rib * sstep(0.02, 0.06, s)
        sw = Sweep(pts, rad, tag='horn')
        sN = sw.s

        def at(i):
            return float(sN[np.argmin(np.linalg.norm(pts - HORN[i, :3] * m[:3], axis=1))])

        sw.wkeys = [(0.0, {'Head': 1}), (at(1), {'Head': 0.6, side + 'Horn1': 0.4}),
                    (at(2), {side + 'Horn1': 1}), (at(3), {side + 'Horn1': 0.5, side + 'Horn2': 0.5}),
                    (at(4), {side + 'Horn2': 1}), (at(6), {side + 'Horn2': 0.5, side + 'Horn3': 0.5}),
                    (at(7), {side + 'Horn3': 1}), (1.0, {side + 'Horn3': 1})]
        p.add(sw)
        c = POMPOM_C * m[:3]

        def pom(P, c=c):
            q = P - c
            d = np.linalg.norm(q, axis=1) - POMPOM_R
            return d - 0.0035 * np.sin(70 * q[:, 0] + 1.3) * np.sin(70 * q[:, 1]) * np.sin(70 * q[:, 2] + 0.7)

        p.add(Func(pom, c - POMPOM_R - 0.006, c + POMPOM_R + 0.006, bone=side + 'Pompom', tag='pompom'), 0.004)

    def colour(V, tags):
        C = np.tile(np.array(HORNC, float), (len(V), 1))
        C[np.array(tags) == 'pompom'] = POMC
        return C

    p.colour = colour
    return p


def hands_part(step=0.0016):
    p = Part('hands', step, soft=0.0012)
    for sx, side in ((1, 'Left'), (-1, 'Right')):
        m = np.array([sx, 1, 1.0])
        wr = WR * m; d = ARM_DIR * m
        p.add(Column(wr - 0.012 * d, wr + PALM_LEN * d,
                     [(0, 0.0135, 0.0185), (0.22, 0.0120, 0.0190), (0.55, 0.0105, 0.0235), (0.9, 0.0092, 0.0245), (1, 0.0085, 0.0235)],
                     front=(0, 0, 1), side=(sx, 0, 0), n=2.6, bone=side + 'Hand', tag='palm'))
        for f in ('Thumb', 'Index', 'Middle', 'Ring', 'Pinky'):
            pts, (r0, r1) = finger_chain(f)
            pts = pts * m
            rr = np.linspace(r0, r1, 4)
            for i in range(3):
                p.add(RoundCone(pts[i], pts[i + 1], rr[i], rr[i + 1], bone=f'{side}Hand{f}{i + 1}', tag='finger'),
                      0.004 if i == 0 else 0.0015)
    p.colour = lambda V, tags: np.tile(np.array(SKIN, float), (len(V), 1))
    return p


def boots_part(step=0.0045):
    p = Part('boots', step, soft=0.006)
    for sx, side in ((1, 'Left'), (-1, 'Right')):
        o = np.array([ANKLE[0] * sx, 0.0, ANKLE[2]])        # on the ground under the ankle

        def sole(P, o=o):
            q = P - o
            # outline seen from above: a round cone from heel to ball
            a = np.array([0.0, -0.036]); b = np.array([0.0, 0.066]); ra, rb = 0.050, 0.068
            xz = q[:, [0, 2]]
            ba = b - a
            h = np.clip(((xz - a) @ ba) / (ba @ ba), 0, 1)
            d2 = np.linalg.norm(xz - a - np.outer(h, ba), axis=1) - (ra * (1 - h) + rb * h)
            top = 0.050 + 0.014 * (1 - sstep(-0.035, 0.03, q[:, 2]))        # taller under the heel
            dy = np.abs(q[:, 1] - top / 2) - top / 2
            w = np.stack([d2 + 0.006, dy + 0.006], 1)
            return np.linalg.norm(np.maximum(w, 0), axis=1) + np.minimum(w.max(axis=1), 0) - 0.006

        def wsole(P, o=o, side=side):
            t = sstep(0.045, 0.085, (P - o)[:, 2])
            return {side + 'Foot': 1 - t, side + 'ToeBase': t}

        p.add(Func(sole, o + np.array([-0.075, -0.004, -0.092]), o + np.array([0.075, 0.07, 0.14]), wfn=wsole, tag='sole'))
        p.add(Func(lambda P, o=o: Ellipsoid(o + np.array([0, 0.084, 0.040]), (0.055, 0.044, 0.086)).dist(P),
                   o + np.array([-0.06, 0.03, -0.05]), o + np.array([0.06, 0.135, 0.13]), wfn=wsole, tag='vamp'), 0.012)
        p.add(Func(lambda P, o=o: Ellipsoid(o + np.array([0, 0.080, 0.080]), (0.056, 0.037, 0.050)).dist(P),
                   o + np.array([-0.062, 0.035, 0.028]), o + np.array([0.062, 0.13, 0.136]), wfn=wsole, tag='toecap'), 0.012)
        p.add(Ellipsoid(o + np.array([0, 0.10, -0.030]), (0.047, 0.062, 0.050), bone=side + 'Foot', tag='heel'), 0.012)
        p.add(Column(o + np.array([0, 0.105, 0.004]), o + np.array([-0.003 * sx, 0.302, 0.012]),
                     [(0, 0.047, 0.056), (0.3, 0.043, 0.048), (0.7, 0.042, 0.046), (1, 0.0425, 0.046)],
                     side=(sx, 0, 0), tag='shaft',
                     wkeys=[(0, {side + 'Foot': 1}), (0.12, {side + 'Foot': 0.75, side + 'Leg': 0.25}),
                            (0.45, {side + 'Leg': 1}), (1, {side + 'Leg': 1})]), 0.012)
        p.add(RoundCone(o + np.array([0, 0.125, 0.046]), o + np.array([-0.003 * sx, 0.295, 0.047]), 0.016, 0.014,
                        wkeys=[(0, {side + 'Foot': 0.7, side + 'Leg': 0.3}), (0.4, {side + 'Leg': 1}), (1, {side + 'Leg': 1})],
                        tag='tongue'), 0.012)

        kn, an = KNEE * np.array([sx, 1, 1.0]), ANKLE * np.array([sx, 1, 1.0])

        def on_leg(y):
            return kn + (an - kn) * ((kn[1] - y) / (kn[1] - an[1]))

        for y0, y1, r, tg in ((0.288, 0.3150, 0.0410, 'sock'), (0.3270, 0.350, 0.0410, 'sock')):
            p.add(Column(on_leg(y0), on_leg(y1), [(0, r, r + 0.001), (1, r, r + 0.001)], side=(sx, 0, 0), bone=side + 'Leg', tag=tg))

    def colour(V, tags):
        C = np.tile(np.array(BOOT, float), (len(V), 1))
        tags = np.array(tags)
        C[tags == 'sole'] = SOLE
        C[tags == 'sock'] = SOCK
        C[tags == 'sockline'] = SOCK_DK
        return C

    p.colour = colour
    return p


PARTS = [  # (builder, roughness, metallic, keep ratio when thinning the mesh, weight-smoothing passes)
    (body_part, 0.85, 0.0, 0.30, 14),
    (head_part, 0.80, 0.0, 0.60, 2),
    (cap_part, 0.70, 0.0, 0.40, 2),
    (horns_part, 0.80, 0.0, 0.50, 8),
    (hands_part, 0.80, 0.0, 0.55, 4),
    (boots_part, 0.28, 0.0, 0.50, 6),
]


def head_face(V):
    """Her face from the A1 front view, laid flat onto the front of the head.
    Returns per-vertex UVs and the small picture they point into."""
    import os
    from PIL import Image
    X0, Y0, N = 400, 100, 96
    im = np.asarray(Image.open(os.path.join(os.path.dirname(__file__), '..', 'refs', 'sheets', 'A1_first_version.png')).convert('RGB')).astype(int)
    crop = im[Y0:Y0 + N, X0:X0 + N].copy()
    from scipy import ndimage
    r, g, b = crop[..., 0], crop[..., 1], crop[..., 2]
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    notface = (lum < 112) | ((r > g + 40) & (b > g + 10) & (lum < 175))     # cap, ruff, outline, ribbon strands
    lab, _ = ndimage.label(notface)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    outside = np.isin(lab, edge[edge > 0])
    yy, xx = np.mgrid[0:N, 0:N]
    eyeband = (yy >= 10) & (yy < 52) & (xx >= 14) & (xx <= 82)             # brows and lashes are dark but belong to the face
    outside &= ~eyeband
    outside |= yy < 9
    outside = ndimage.binary_dilation(outside, iterations=1) & ~eyeband | outside
    out = crop.copy()
    out[outside] = SKIN
    u = (CX + V[:, 0] / S - X0) / N
    v = (GROUND - V[:, 1] / S - Y0) / N
    return np.stack([u, v], 1).astype(np.float32), Image.fromarray(out.astype(np.uint8))
