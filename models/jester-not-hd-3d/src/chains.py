"""Hanging chains: short runs of bones that carry the skirt and the veil.

A chain does not turn with the bone it hangs from. Each frame it is set to hang
straight down in the world, follow a thigh where it should, trail back when she
moves, sway a little, and fan out sideways instead of going through the ground."""
import numpy as np
from scipy.interpolate import PchipInterpolator

# how wide the skirt is at each height (half-width to the side, half-depth front to back), read off B1 and B2
_Y = np.array([0.28, 0.40, 0.50, 0.60, 0.68, 0.755, 0.83, 0.90, 0.97, 1.075])
SKIRT_RX = PchipInterpolator(_Y, [0.288, 0.298, 0.303, 0.300, 0.290, 0.266, 0.240, 0.201, 0.170, 0.092])
SKIRT_RZ = PchipInterpolator(_Y, [0.196, 0.202, 0.197, 0.188, 0.177, 0.164, 0.150, 0.134, 0.117, 0.077])
SKIRT_Y0, SKIRT_Y1 = _Y[0], _Y[-1]


def skirt_point(phi, y, scale=1.0):
    yc = np.clip(y, SKIRT_Y0, SKIRT_Y1)
    return np.array([SKIRT_RX(yc) * np.sin(phi) * scale, y, SKIRT_RZ(yc) * np.cos(phi) * scale - 0.03])


GROUND = 0.03          # cloth never goes lower than this

CHAINS = []
# skirt: eight chains round her hips, two bones each. 'follow' is how much the upper bone goes with the thigh.
for k, (deg, follow) in enumerate(((30, 0.85), (75, 0.60), (120, 0.35), (165, 0.20), (195, 0.20), (240, 0.35), (285, 0.60), (330, 0.85))):
    phi = np.radians(deg)
    CHAINS.append(dict(name='Skirt' + 'ABCDEFGH'[k], kind='skirt', phi=phi, parent='Hips',
                       joints=[skirt_point(phi, 0.95, 0.93), skirt_point(phi, 0.62, 0.93)], tip=skirt_point(phi, 0.30, 0.93),
                       thigh='LeftUpLeg' if deg < 180 else 'RightUpLeg', follow=follow))
# veil: five chains (left side, back-left, back, back-right, right side), three bones each
VEIL_Y = (1.10, 0.84, 0.56, 0.28)
for name, deg, parent, rho in (('VeilL', 108, 'LeftArm', (0.31, 0.37, 0.43, 0.47)), ('VeilBL', 144, 'Spine2', (0.25, 0.30, 0.35, 0.39)),
                               ('VeilB', 180, 'Spine2', (0.17, 0.22, 0.27, 0.31)), ('VeilBR', 216, 'Spine2', (0.25, 0.30, 0.35, 0.39)),
                               ('VeilR', 252, 'RightArm', (0.31, 0.37, 0.43, 0.47))):
    phi = np.radians(deg)
    pts = [np.array([r * np.sin(phi), y, r * np.cos(phi) - 0.01]) for r, y in zip(rho, VEIL_Y)]
    CHAINS.append(dict(name=name, kind='veil', phi=phi, parent=parent, joints=pts[:3], tip=pts[3], thigh=None, follow=0.0))


def bones():
    """(name, parent, rest position) for every chain bone, in order."""
    out = []
    for c in CHAINS:
        prev = c['parent']
        for i, p in enumerate(c['joints']):
            out.append((f"{c['name']}{i + 1}", prev, p)); prev = f"{c['name']}{i + 1}"
    return out


def _axis_rot(axis, ang):
    a = np.asarray(axis, float); a = a / np.linalg.norm(a)
    x, y, z = a; c, s = np.cos(ang), np.sin(ang); C = 1 - c
    return np.array([[c + x * x * C, x * y * C - z * s, x * z * C + y * s],
                     [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
                     [z * x * C - y * s, z * y * C + x * s, c + z * z * C]])


def _toward(R, f):
    """Part of a rotation: f = 0 gives none of it, f = 1 all of it."""
    ang = np.arccos(np.clip((np.trace(R) - 1) / 2, -1, 1))
    if ang < 1e-6:
        return np.eye(3)
    ax = np.array([R[2, 1] - R[1, 2], R[0, 2] - R[2, 0], R[1, 0] - R[0, 1]]) / (2 * np.sin(ang))
    return _axis_rot(ax, ang * f)


def _springs(acc, dt, loops, w=7.0, z=0.4, gain=0.010):
    """A damped spring per chain driven by how its root is accelerating. Returns (frames, 2): lean back, lean left."""
    n = len(acc)
    th = np.zeros(2); om = np.zeros(2); out = np.zeros((n, 2))
    for cyc in range(4 if loops else 1):
        for k in range(n):
            drive = np.array([acc[k][2], -acc[k][0]]) * gain
            for _ in range(4):
                om += (-w * w * th - 2 * z * w * om + drive * w * w) * (dt / 4)
                th += om * (dt / 4)
            out[k] = np.clip(th, -0.6, 0.6)
    if loops:
        out[-1] = out[0]
    return out


def _from_to(u, v):
    """The smallest rotation that turns direction u onto direction v."""
    u = u / np.linalg.norm(u); v = v / np.linalg.norm(v)
    ax = np.cross(u, v); s = np.linalg.norm(ax)
    if s < 1e-9:
        return np.eye(3)
    return _axis_rot(ax / s, np.arctan2(s, u @ v))


def _colliders(kind, name, P):
    """Capsules (end, end, radius) the cloth must stay outside of, for this frame's joint positions P."""
    out = []
    if kind == 'veil':
        out.append((P['Hips'] + np.array([0, 0.02, 0]), P['Spine2'] + np.array([0, 0.06, -0.01]), 0.125))          # trunk
        out.append((P['Hips'] + np.array([0, -0.10, -0.03]), P['Hips'] + np.array([0, -0.60, -0.03]), 0.215))      # the skirt's bulk
        for side in ('Left', 'Right'):
            out.append((P[side + 'ForeArm'], P[side + 'Hand'], 0.105))                                            # forearm in its cuff
            if not name.endswith(side[0]):
                out.append((P[side + 'Arm'], P[side + 'ForeArm'], 0.075))
    else:
        for side in ('Left', 'Right'):
            out.append((P[side + 'UpLeg'], P[side + 'Leg'], 0.082))
            out.append((P[side + 'Leg'], P[side + 'Foot'], 0.062))
    return out


def _push_out(p, end, caps):
    """Move a segment's far end out of every capsule, keeping the segment's length."""
    L = np.linalg.norm(end - p)
    for _ in range(3):
        moved = False
        for a, b, r in caps:
            ab = b - a
            h = np.clip(((end - a) @ ab) / (ab @ ab), 0, 1)
            c = a + h * ab
            v = end - c; d = np.linalg.norm(v)
            if d < r:
                v = v / d if d > 1e-6 else np.array([0, 0, -1.0])
                end = c + v * r
                end = p + (end - p) * (L / np.linalg.norm(end - p))
                moved = True
        if not moved:
            break
    return end


def bake(rig, frames_L, pos, Wd, T, loops, speed):
    """Fill in every chain bone's rotation for every frame of a clip."""
    n = len(frames_L)
    dt = T / (n - 1)
    drag = min(0.55, 0.13 * speed ** 1.25)                 # cloth trails behind when she moves forward
    for c in CHAINS:
        par = c['parent']
        off0 = rig.off[rig.i[c['name'] + '1']]
        roots = np.array([pos[k][par] + Wd[k][par] @ off0 for k in range(n)])
        acc = np.zeros((n, 3))
        for k in range(n):
            a, b, d = roots[(k - 1) % (n - 1)], roots[k % (n - 1)], roots[(k + 1) % (n - 1)]
            acc[k] = (a - 2 * b + d) / (dt * dt)
        sway = _springs(acc, dt, loops)
        segs = [c['joints'][i + 1] - c['joints'][i] for i in range(len(c['joints']) - 1)] + [c['tip'] - c['joints'][-1]]
        out_axis = np.array([-np.cos(c['phi']), 0, np.sin(c['phi'])])      # turning about this swings the cloth outward
        nj = len(segs)
        for k in range(n):
            p = roots[k].copy()
            Rprev = Wd[k][par]
            caps = _colliders(c['kind'], c['name'], pos[k])
            for i, seg in enumerate(segs):
                depth = (i + 1) / nj
                R = _axis_rot((1, 0, 0), drag * depth * (0.6 if c['kind'] == 'skirt' else 1.0) + sway[k, 0] * depth) @ _axis_rot((0, 0, 1), sway[k, 1] * depth)
                if c['thigh'] and i == 0:
                    R = _toward(Wd[k][c['thigh']], c['follow']) @ R
                elif c['thigh']:
                    R = _toward(Wd[k][c['thigh']], c['follow'] * 0.35) @ R
                end = p + R @ seg
                free = _push_out(p, end, caps)                               # keep clear of her body
                if np.linalg.norm(free - end) > 1e-6:
                    R = _from_to(end - p, free - p) @ R
                    end = p + R @ seg
                if end[1] < GROUND:                                          # fan outward until the end clears the ground
                    lo, hi = 0.0, np.pi * 0.55
                    for _ in range(14):
                        mid = (lo + hi) / 2
                        if (p + _axis_rot(out_axis, mid) @ R @ seg)[1] < GROUND:
                            lo = mid
                        else:
                            hi = mid
                    R = _axis_rot(out_axis, hi) @ R
                    end = p + R @ seg
                frames_L[k][rig.i[f"{c['name']}{i + 1}"]] = Rprev.T @ R
                Rprev = R; p = end
