"""Movement clips for the Jester's skeleton.

Each clip is a function of time that fills in a Pose (where the hips are, where
each foot stands, which way each arm points). The solver turns that into bone
rotations, so feet stay planted and limbs keep their lengths."""
import numpy as np
import jester as JS

FPS = 30


def Rx(a):
    c, s = np.cos(a), np.sin(a); return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def Ry(a):
    c, s = np.cos(a), np.sin(a); return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def Rz(a):
    c, s = np.cos(a), np.sin(a); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def unit(v):
    v = np.asarray(v, float); n = np.linalg.norm(v)
    return v / n if n > 1e-12 else v


def frame(axis, front):
    """Columns: axis, hinge (axis x front), and their cross. 'front' is the side of the limb that faces forward at rest."""
    a = unit(axis)
    h = np.cross(a, front)
    if np.linalg.norm(h) < 1e-6:
        h = np.cross(a, (1, 0, 0))
    h = unit(h)
    return np.stack([a, h, np.cross(a, h)], axis=1)


def quat(R):
    t = np.trace(R)
    if t > 0:
        s = np.sqrt(t + 1) * 2; q = [(R[2, 1] - R[1, 2]) / s, (R[0, 2] - R[2, 0]) / s, (R[1, 0] - R[0, 1]) / s, 0.25 * s]
    elif R[0, 0] > R[1, 1] and R[0, 0] > R[2, 2]:
        s = np.sqrt(1 + R[0, 0] - R[1, 1] - R[2, 2]) * 2; q = [0.25 * s, (R[0, 1] + R[1, 0]) / s, (R[0, 2] + R[2, 0]) / s, (R[2, 1] - R[1, 2]) / s]
    elif R[1, 1] > R[2, 2]:
        s = np.sqrt(1 + R[1, 1] - R[0, 0] - R[2, 2]) * 2; q = [(R[0, 1] + R[1, 0]) / s, 0.25 * s, (R[1, 2] + R[2, 1]) / s, (R[0, 2] - R[2, 0]) / s]
    else:
        s = np.sqrt(1 + R[2, 2] - R[0, 0] - R[1, 1]) * 2; q = [(R[0, 2] + R[2, 0]) / s, (R[1, 2] + R[2, 1]) / s, 0.25 * s, (R[1, 0] - R[0, 1]) / s]
    return np.array(q)


def ease(x):
    x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)


def ramp(t, t0, t1):
    return ease((t - t0) / (t1 - t0))


def lerp(a, b, u):
    return np.asarray(a, float) * (1 - u) + np.asarray(b, float) * u


ZREF = np.array([0.0, 0.0, 1.0])
HIPS0 = np.array(JS.skeleton()[2][0])
ANK_TO_BALL = np.array([0.0, -JS.ANKLE[1], 0.072])      # from the ankle to the ball of the sole
ANK_TO_HEEL = np.array([0.0, -JS.ANKLE[1], -0.073])


class Foot:
    """Where a boot is: the ankle's x/z, how high the sole is off the ground, heel-lift pitch and toe-out yaw."""
    def __init__(self, x, z, lift=0.0, pitch=0.0, yaw=0.0, front=None, ankle=None):
        self.x, self.z, self.lift, self.pitch, self.yaw, self.front, self.ankle = x, z, lift, pitch, yaw, front, ankle


class Arm:
    """An arm by direction (in the chest's own axes): upper-arm direction, elbow bend, and which way the arm's front faces.
    Or by target: a world position for the wrist."""
    def __init__(self, upper=None, bend=0.0, front=(0, 0, 1), target=None, world=False, twist=0.0, hand=None, curl=0.25, spread=0.0):
        self.upper, self.bend, self.front, self.target, self.world = upper, bend, front, target, world
        self.twist, self.hand, self.curl, self.spread = twist, hand, curl, spread


class Pose:
    def __init__(self):
        self.hips = HIPS0.copy()
        self.hips_rot = np.eye(3)
        self.spine = [(0, 0, 0)] * 3          # (bend forward, turn, lean sideways) for Spine, Spine1, Spine2
        self.neck = (0, 0, 0); self.head = (0, 0, 0)
        self.feet = {'Left': Foot(JS.ANKLE[0], JS.ANKLE[2]), 'Right': Foot(-JS.ANKLE[0], JS.ANKLE[2])}
        self.arms = {'Left': Arm(upper=JS.ARM_DIR), 'Right': Arm(upper=JS.ARM_DIR * [-1, 1, 1])}
        self.shoulder = {'Left': (0, 0), 'Right': (0, 0)}      # (raise, forward)


class Rig:
    def __init__(self, names, parents, rest):
        self.names, self.parents, self.rest = names, parents, np.asarray(rest)
        self.i = {n: k for k, n in enumerate(names)}
        self.off = np.array([self.rest[k] - (self.rest[p] if p is not None else 0) for k, p in enumerate(parents)])

    def rest_dir(self, a, b):
        return unit(self.rest[self.i[b]] - self.rest[self.i[a]])

    def length(self, a, b):
        return np.linalg.norm(self.rest[self.i[b]] - self.rest[self.i[a]])

    def solve(self, P):
        """Pose -> (local rotation matrices per bone, hips position)."""
        n = len(self.names)
        L = [np.eye(3) for _ in range(n)]
        Wd = {}                                # world rotations as we go
        pos = {}

        def set_world(name, Rw):
            k = self.i[name]; p = self.parents[k]
            Rp = Wd[self.names[p]] if p is not None else np.eye(3)
            L[k] = Rp.T @ Rw; Wd[name] = Rw
            pos[name] = (pos[self.names[p]] + Rp @ self.off[k]) if p is not None else np.asarray(P.hips, float)

        def set_local(name, Rl):
            k = self.i[name]; p = self.parents[k]
            Rp = Wd[self.names[p]] if p is not None else np.eye(3)
            set_world(name, Rp @ Rl)

        def child_pos(name, child):
            return pos[name] + Wd[name] @ self.off[self.i[child]]

        set_world('Hips', P.hips_rot)
        for nm, (b, t, s) in zip(('Spine', 'Spine1', 'Spine2'), P.spine):
            set_local(nm, Ry(t) @ Rx(b) @ Rz(s))
        b, t, s = P.neck; set_local('Neck', Ry(t) @ Rx(b) @ Rz(s))
        b, t, s = P.head; set_local('Head', Ry(t) @ Rx(b) @ Rz(s))
        for side in ('Left', 'Right'):
            for h in ('Horn1', 'Horn2', 'Horn3', 'Pompom'):
                set_local(side + h, np.eye(3))

        chest = Wd['Spine2']
        for side, sx in (('Left', 1), ('Right', -1)):
            up, fw = P.shoulder[side]
            set_local(side + 'Shoulder', Rz(sx * up) @ Ry(-sx * fw))
            A = P.arms[side]
            r1 = self.rest_dir(side + 'Arm', side + 'ForeArm'); r2 = self.rest_dir(side + 'ForeArm', side + 'Hand')
            l1 = self.length(side + 'Arm', side + 'ForeArm'); l2 = self.length(side + 'ForeArm', side + 'Hand')
            sh = child_pos(side + 'Shoulder', side + 'Arm')
            if A.target is not None:
                front = unit(A.front if A.world else chest @ np.asarray(A.front, float))
                d1, d2 = self.two_bone(sh, np.asarray(A.target, float), l1, l2, -front)
            else:
                base = np.eye(3) if A.world else chest
                d1 = unit(base @ np.asarray(A.upper, float))
                front = unit(base @ np.asarray(A.front, float))
                hinge = unit(np.cross(d1, front))
                d2 = JS.rot_axis(hinge, A.bend) @ d1       # bending brings the forearm toward the arm's front
            f = front if A.target is None else unit(d2 - d1 * (d1 @ d2)) if np.linalg.norm(np.cross(d1, d2)) > 0.05 else front
            R1 = frame(d1, f) @ frame(r1, ZREF).T
            set_world(side + 'Arm', R1)
            R2 = frame(d2, f) @ frame(r2, ZREF).T
            if A.twist:
                R2 = JS.rot_axis(d2, sx * A.twist) @ R2
            set_world(side + 'ForeArm', R2)
            set_local(side + 'Hand', np.eye(3) if A.hand is None else A.hand)
            dirm = JS.ARM_DIR * [sx, 1, 1]; pn = JS.PALM_N * [sx, 1, 1]
            hinge = unit(np.cross(dirm, pn))
            for fi, fn in enumerate(('Index', 'Middle', 'Ring', 'Pinky')):
                sp = JS.rot_axis(pn, sx * A.spread * (fi - 1.5) * 0.35)
                for j in range(3):
                    c = A.curl * (1.0, 1.1, 0.8)[j] * 1.5
                    set_local(f'{side}Hand{fn}{j + 1}', (sp if j == 0 else np.eye(3)) @ JS.rot_axis(hinge, c))
            th = unit(np.cross(unit(0.6 * dirm + 0.74 * ZREF), pn))
            for j in range(3):
                set_local(f'{side}HandThumb{j + 1}', JS.rot_axis(th, A.curl * 0.6 * (0.3, 1, 1)[j]) @ (JS.rot_axis(dirm, -sx * A.spread * 0.5) if j == 0 else np.eye(3)))

        hips_R = Wd['Hips']
        for side, sx in (('Left', 1), ('Right', -1)):
            F = P.feet[side]
            Rf = Ry(F.yaw) @ Rx(F.pitch)
            if F.ankle is not None:
                ankle = np.asarray(F.ankle, float)
            else:
                piv = ANK_TO_BALL if F.pitch >= 0 else ANK_TO_HEEL
                ground = np.array([F.x, F.lift, F.z]) + Ry(F.yaw) @ np.array([0, 0, piv[2]])
                ankle = ground - Rf @ piv
            hip = child_pos('Hips', side + 'UpLeg')
            r1 = self.rest_dir(side + 'UpLeg', side + 'Leg'); r2 = self.rest_dir(side + 'Leg', side + 'Foot')
            l1 = self.length(side + 'UpLeg', side + 'Leg'); l2 = self.length(side + 'Leg', side + 'Foot')
            front = unit(F.front) if F.front is not None else unit(hips_R @ ZREF * 0.5 + Ry(F.yaw) @ ZREF * 0.5 + np.array([sx * 0.06, 0, 0]))
            d1, d2 = self.two_bone(hip, ankle, l1, l2, front)
            set_world(side + 'UpLeg', frame(d1, front) @ frame(r1, ZREF).T)
            set_world(side + 'Leg', frame(d2, front) @ frame(r2, ZREF).T)
            set_world(side + 'Foot', Rf)
            set_local(side + 'ToeBase', Rx(-max(F.pitch, 0) * 0.9))
        return L, np.asarray(P.hips, float), pos, Wd

    @staticmethod
    def two_bone(root, target, l1, l2, pole):
        v = target - root
        d = np.linalg.norm(v)
        d = np.clip(d, abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4)
        u = unit(v)
        perp = unit(pole - u * (u @ pole))
        ca = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)
        sa = np.sqrt(max(0.0, 1 - ca * ca))
        mid = root + u * (l1 * ca) + perp * (l1 * sa)
        end = root + u * d
        return unit(mid - root), unit(end - mid)


# ------------------------------------------------------------------ the clips
def relaxed(P, amount=1.0, bend=0.20):
    """Arms hanging closer to the body than the bind pose."""
    ang = JS.ARM_ANGLE - np.radians(19) * amount
    for side, sx in (('Left', 1), ('Right', -1)):
        P.arms[side] = Arm(upper=(sx * np.sin(ang), -np.cos(ang), 0.02), bend=bend * amount, curl=0.32)
    return P


def idle(t, T):
    P = relaxed(Pose())
    w = 2 * np.pi * t / T
    br = np.sin(w)
    P.hips = P.hips + np.array([0.006 * np.sin(w / 1.0 + 0.6), -0.004 - 0.003 * br, 0])
    P.hips_rot = Rz(0.012 * np.sin(w + 0.6))
    P.spine = [(0.010 * br, 0, -0.006 * np.sin(w + 0.6)), (0.012 * br, 0, -0.006 * np.sin(w + 0.6)), (-0.016 * br, 0, 0)]
    P.head = (0.012 * np.sin(w + 1.2), 0.03 * np.sin(w), 0)
    for side, sx in (('Left', 1), ('Right', -1)):
        P.shoulder[side] = (0.02 + 0.02 * br, 0)
        a = P.arms[side]; a.bend += 0.03 * br
    return P


def gait(t, T, stride, stance, drop, bob, lift, lean, arm_swing, arm_bend, kick=0.0, toe=35, strike=14, sway=0.018, yaw=0.10):
    P = Pose()
    ph = (t / T) % 1.0
    half = stride * stance / 2          # how far the ankle travels behind / ahead of the hips on the ground
    hz = 0.0
    for side, sx, off in (('Left', 1, 0.0), ('Right', -1, 0.5)):
        p = (ph + off) % 1.0
        x = sx * (JS.ANKLE[0] - 0.035)
        z0 = JS.ANKLE[2]
        if p < stance:
            u = p / stance
            z = z0 + half * (1 - 2 * u)
            pitch = -np.radians(strike) * (1 - ramp(u, 0.0, 0.22)) + np.radians(toe) * ramp(u, 0.62, 1.0)
            P.feet[side] = Foot(x, z, 0.0, pitch)
        else:
            u = (p - stance) / (1 - stance)
            e = ease(u)
            z = z0 - half + 2 * half * e
            h = lift * np.sin(np.pi * u) ** 0.9 + kick * np.sin(np.pi * min(u * 1.6, 1.0)) ** 2
            pitch = np.radians(toe) * (1 - ramp(u, 0.0, 0.55)) + np.radians(toe) * kick * 3.0 * np.sin(np.pi * min(u * 1.5, 1.0)) - np.radians(strike) * ramp(u, 0.6, 1.0)
            P.feet[side] = Foot(x, z, h, pitch)
    w = 2 * np.pi * ph
    P.hips = np.array([sway * np.sin(w - 0.3 + np.pi * stance), HIPS0[1] - drop - bob * np.cos(2 * w - 0.5), hz])
    yw = -yaw * np.cos(w)
    P.hips_rot = Ry(yw) @ Rx(lean * 0.4) @ Rz(-0.035 * np.sin(w + np.pi * stance))
    P.spine = [(lean * 0.3, -yw * 0.5, 0.012 * np.sin(w + np.pi * stance)), (lean * 0.3, -yw * 0.7, 0.01 * np.sin(w + np.pi * stance)), (0, -yw * 0.8, 0)]
    P.neck = (-lean * 0.3, yw * 0.5, 0); P.head = (-lean * 0.3, yw * 0.4, 0)
    ang = JS.ARM_ANGLE - np.radians(20)
    for side, sx, off in (('Left', 1, 0.5), ('Right', -1, 0.0)):
        sw = arm_swing * np.cos(2 * np.pi * (ph + off))          # forward when the opposite leg is forward
        d = Rx(-sw) @ np.array([sx * np.sin(ang), -np.cos(ang), 0])
        P.arms[side] = Arm(upper=d, bend=arm_bend + 0.35 * max(sw, 0) * (1 if arm_bend < 1 else 0.3), curl=0.35 if arm_bend < 1 else 0.8)
        P.shoulder[side] = (0.02, 0.10 * sw)
    return P


def walk(t, T):
    return gait(t, T, stride=1.02, stance=0.60, drop=0.022, bob=0.014, lift=0.085, lean=0.03, arm_swing=0.38, arm_bend=0.22)


def run(t, T):
    return gait(t, T, stride=1.70, stance=0.36, drop=0.075, bob=0.030, lift=0.16, lean=0.22, arm_swing=0.85, arm_bend=1.45,
                kick=0.16, toe=42, strike=6, sway=0.010, yaw=0.16)


def squat(t, T):
    u = ramp(t, 0.15, 0.95) - ramp(t, T - 0.95, T - 0.15)
    P = relaxed(Pose(), 1 - 0.3 * u)
    base = HIPS0
    P.hips = base + np.array([0, -0.415 * u, -0.150 * u])
    P.hips_rot = Rx(0.34 * u)
    P.spine = [(0.14 * u, 0, 0), (0.10 * u, 0, 0), (0.02 * u, 0, 0)]
    P.neck = (-0.20 * u, 0, 0); P.head = (-0.22 * u, 0, 0)
    for side, sx in (('Left', 1), ('Right', -1)):
        P.feet[side] = Foot(sx * (JS.ANKLE[0] + 0.02 * u), JS.ANKLE[2], 0, 0, yaw=sx * 0.22 * u, front=unit([sx * 0.45 * u, 0.15, 1]))
    L, _, pos, Wd = RIG.solve(P)
    for side, sx in (('Left', 1), ('Right', -1)):
        knee = pos[side + 'Leg']
        tgt = knee + np.array([sx * 0.006, 0.060, 0.012])
        rest_wrist = pos[side + 'Hand']
        P.arms[side] = Arm(target=lerp(rest_wrist, tgt, ease(u)), front=(sx * -0.5, 0.2, 1.0), curl=0.25 + 0.35 * u, spread=0.4 * u)
        P.shoulder[side] = (0.03 * u, 0.25 * u)
    return P


def kneel(t, T):
    u = ramp(t, 0.15, 1.35) - ramp(t, T - 1.35, T - 0.15)
    P = relaxed(Pose())
    base = HIPS0
    kn_y = 0.047
    hip_y = kn_y + RIG.length('RightUpLeg', 'RightLeg') * 0.985
    P.hips = base + np.array([0.012 * u, (hip_y + 0.030 - base[1]) * u, 0.05 * np.sin(np.pi * u) * 0.5])
    P.hips_rot = Rx(0.05 * np.sin(np.pi * u))
    P.spine = [(0.02 * u, 0, 0), (-0.02 * u, 0, 0), (-0.03 * u, 0, 0)]
    # left foot steps forward and stays flat; right leg goes back until the knee rests on the ground
    stepf = ramp(u, 0.05, 0.55)
    P.feet['Left'] = Foot(JS.ANKLE[0] + 0.015 * stepf, JS.ANKLE[2] + 0.30 * stepf, 0.05 * np.sin(np.pi * stepf), 0, yaw=0.08 * stepf)
    back = ramp(u, 0.25, 1.0)
    shin = RIG.length('RightLeg', 'RightFoot')
    az = JS.ANKLE[2] - (shin * 0.985 + 0.0) * back
    ay = lerp(JS.ANKLE[1], 0.118, back) + 0.07 * np.sin(np.pi * back)
    P.feet['Right'] = Foot(0, 0, ankle=(-JS.ANKLE[0] + 0.01 * back, ay, az), pitch=np.radians(72) * back,
                           front=unit(lerp([-0.06, 0, 1], [-0.04, -1.0, 0.25], back)))
    for side, sx in (('Left', 1), ('Right', -1)):
        P.arms[side].bend += 0.15 * u
    return P


def arms_up(t, T):
    u = ramp(t, 0.1, 1.0) - ramp(t, T - 1.0, T - 0.1)
    P = Pose()
    P.hips = P.hips + np.array([0, 0.004 * u, 0])
    P.spine = [(-0.03 * u, 0, 0), (-0.05 * u, 0, 0), (-0.07 * u, 0, 0)]
    P.neck = (-0.10 * u, 0, 0); P.head = (-0.16 * u, 0, 0)
    a0 = JS.ARM_ANGLE - np.radians(19)
    for side, sx in (('Left', 1), ('Right', -1)):
        ang = lerp(a0, np.radians(158), u)                 # from hanging to raised in a wide V
        d = np.array([sx * np.sin(ang), -np.cos(ang), 0.10 * np.sin(np.pi * u) + 0.05 * u])
        P.arms[side] = Arm(upper=d, bend=0.20 + 0.30 * np.sin(np.pi * u) - 0.02 * u, front=(sx * -0.55 * u, 0.2 * u, 1.0),
                           curl=0.30 - 0.22 * u, spread=0.9 * u)
        P.shoulder[side] = (0.42 * u, -0.05 * u)
    return P


CLIPS = [  # name, function, length in seconds, loops, ground speed (m/s), button label
    ('Idle', idle, 4.0, True, 0.0, 'Idle'),
    ('Walk', walk, 1.10, True, 1.02 / 1.10, 'Walk'),
    ('Run', run, 0.66, True, 1.70 / 0.66, 'Run'),
    ('Squat', squat, 3.2, True, 0.0, 'Squat'),
    ('Kneel', kneel, 4.4, True, 0.0, 'Kneel'),
    ('ArmsUp', arms_up, 3.4, True, 0.0, 'Arms up'),
]
RIG = None


def horn_sway(rig, frames_L, head_pos, head_R, T, loops):
    """Let the horns and pompoms lag behind the head a little (a damped spring, run round the loop until it settles)."""
    n = len(head_pos)
    dt = T / (n - 1)
    acc = np.zeros((n, 3))
    hp = np.asarray(head_pos)
    for k in range(n):
        a, b, c = hp[(k - 1) % (n - 1)], hp[k % (n - 1)], hp[(k + 1) % (n - 1)]
        acc[k] = (a - 2 * b + c) / (dt * dt)
    th = np.zeros(2); om = np.zeros(2)
    w, z = 9.0, 0.35
    out = np.zeros((n, 2))
    for cyc in range(4 if loops else 1):
        for k in range(n):
            al = head_R[k].T @ acc[k]
            drive = np.array([-al[2], al[0]]) * 0.012 + np.array([0, 0])
            sub = 4
            for _ in range(sub):
                om += (-w * w * th - 2 * z * w * om + drive * w * w) * (dt / sub)
                th += om * (dt / sub)
            out[k] = np.clip(th, -0.5, 0.5)
    if loops:
        out[-1] = out[0]
    for k in range(n):
        px_, rz_ = out[k]
        for side, sx in (('Left', 1), ('Right', -1)):
            frames_L[k][rig.i[side + 'Horn2']] = Rx(px_ * 0.35) @ Rz(rz_ * 0.25)
            frames_L[k][rig.i[side + 'Horn3']] = Rx(px_ * 0.7) @ Rz(rz_ * 0.6)
            frames_L[k][rig.i[side + 'Pompom']] = Rx(px_ * 1.4) @ Rz(rz_ * 1.2)


def all_clips(names, parents, rest):
    global RIG
    RIG = Rig(names, parents, rest)
    out = []
    for name, fn, T, loops, speed, label in CLIPS:
        n = int(round(T * FPS)) + 1
        times = np.linspace(0, T, n)
        frames = []; hips = []; hpos = []; hR = []
        for t in times:
            tt = 0.0 if (loops and t == times[-1]) else t
            L, hp, pos, Wd = RIG.solve(fn(tt, T))
            frames.append(L); hips.append(hp); hpos.append(pos['Head']); hR.append(Wd['Head'])
        horn_sway(RIG, frames, hpos, hR, T, loops)
        rot = {}
        for k, nm in enumerate(names):
            Q = np.array([quat(f[k]) for f in frames])
            for j in range(1, len(Q)):
                if Q[j] @ Q[j - 1] < 0:
                    Q[j] = -Q[j]
            if np.abs(Q - np.array([0, 0, 0, 1.0])).max() > 1e-5 or nm == 'Hips':
                rot[nm] = Q.astype(np.float32)
        out.append(dict(name=name, times=times, rot=rot, hips=np.array(hips, np.float32), loop=loops, speed=speed, label=label))
    return out
