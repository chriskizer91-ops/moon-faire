# Reads his outline off paintings B1 (front and back, standing pose, no hat or belt) and B2 (both sides, arms out) and writes
# src/N05_tables.js. Everything is in metres, soles on y = 0, his left at +X, his front at +Z.
# He stands 1.78 m from the soles of his boots to the top of his hair (a real man of average height, in boots).
# The side paintings lean forward a little, as a man stands; he is built with that lean, because the paintings are laid back onto him
# from the same four sides (see bake_proj.py). Z is measured from 3.5 cm ahead of the middle of the boot shaft.
# usage: python3 -I tools/tables.py        (prints a short summary, never the arrays)
import os, sys, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of, figures, spans
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HT, ZOFF = 1.78, 0.035

def figure(path, fi):
    a = load(os.path.join(ROOT, 'refs', path)); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]
    return dict(a=a, m=(lab == f[5]), x0=f[0], y0=f[1], x1=f[2], y1=f[3], pxm=(f[3] - f[1]) / HT, name=path, fi=fi)
def row(F, h):
    yy = int(round(F['y1'] - h * F['pxm']))
    if yy < F['y0'] or yy >= F['y1']: return []
    rr = F['m'][max(F['y0'], yy - 1):yy + 2].sum(0) >= 2
    return [(s, e) for s, e in spans(rr) if e - s >= 3]
def front_centre(F):
    best = None
    for h in np.arange(1.06, 1.22, 0.01):
        sp = row(F, h)
        c = min(sp, key=lambda s: abs((s[0] + s[1]) / 2 - (F['x0'] + F['x1']) / 2))
        if best is None or c[1] - c[0] < best[1] - best[0]: best = c
    return (best[0] + best[1]) / 2
def side_axis(F):
    cs = []
    for h in np.arange(0.16, 0.30, 0.01):
        c = max(row(F, h), key=lambda s: s[1] - s[0]); cs.append((c[0] + c[1]) / 2)
    return float(np.mean(cs))

FR, BK = figure('B1.png', 0), figure('B1.png', 1)
SR, SL = figure('B2.png', 1), figure('B2.png', 0)          # SR faces the right edge (we see his right side); SL faces the left edge
FR['cx'], BK['cx'] = front_centre(FR), front_centre(BK)
SR['ax'], SL['ax'] = side_axis(SR), side_axis(SL)

def front_spans(F, h, sgn=1):
    return sorted((min(sgn * (s - F['cx']), sgn * (e - F['cx'])) / F['pxm'], max(sgn * (s - F['cx']), sgn * (e - F['cx'])) / F['pxm']) for s, e in row(F, h))
def side_span(h):
    out = []
    for F, sgn in ((SR, 1), (SL, -1)):
        sp = row(F, h)
        if not sp: continue
        s, e = max(sp, key=lambda q: q[1] - q[0]); lo, hi = sgn * (s - F['ax']) / F['pxm'], sgn * (e - F['ax']) / F['pxm']
        out.append((min(lo, hi) - ZOFF, max(lo, hi) - ZOFF))
    return (float(np.mean([o[0] for o in out])), float(np.mean([o[1] for o in out])))
def smooth(v, k=1):
    v = np.asarray(v, float); o = v.copy()
    for _ in range(k): o[1:-1] = 0.25 * o[:-2] + 0.5 * o[1:-1] + 0.25 * o[2:]
    return o
R = lambda v: [round(float(x), 4) for x in v]

# ---- the trunk: from just under the crotch of the trousers to the top of his hair, one ring a row ----
# Front: the span that holds the centre line. Above the armpits the arms join it, so the width there is set by hand (SHOULDER),
# read off the gridded painting: the shirt's shoulder seam, then the hair lying on his shoulders, then his head and hair.
SHOULDER = [(1.23, None), (1.30, 0.184), (1.34, 0.192), (1.38, 0.198), (1.41, 0.200), (1.44, 0.186), (1.46, 0.158), (1.48, 0.118), (1.50, 0.080), (1.52, 0.070)]
T_TOP = 1.50          # the trunk ends at the foot of his neck; his head, neck and hair are their own parts
ys = np.arange(0.62, T_TOP + 0.001, 0.02); rx, xc, zf, zb = [], [], [], []
for h in ys:
    # below the crotch the front shows two legs: the seat's last rows span both, from the outside of one to the outside of the other
    both = lambda q: [(q[0][0], q[-1][1])] if q else []
    sp = [s for s in front_spans(FR, h) if s[0] <= 0.0 <= s[1]] or both(front_spans(FR, h))
    spb = [s for s in front_spans(BK, h, -1) if s[0] <= 0.0 <= s[1]] or both(front_spans(BK, h, -1)) or sp
    w = 0.5 * ((sp[0][1] - sp[0][0]) / 2 + (spb[0][1] - spb[0][0]) / 2)
    rx.append(w); xc.append(0.0); b, f = side_span(min(h, HT - 0.012)); zf.append(f); zb.append(b)
rx = np.array(rx)
k0, k1 = SHOULDER[0][0], SHOULDER[-1][0]
v0 = float(np.interp(k0, ys, rx))
keys = [(k0, v0)] + [k for k in SHOULDER[1:]]
for i, h in enumerate(ys):
    if k0 < h: rx[i] = np.interp(h, [k[0] for k in keys], [k[1] for k in keys])
# the top of his head closes in: the last rows are rounded off by hand
# In the side paintings the arms are held out, and the hand hides his back between 1.26 and 1.46 m: the back there is set by hand
# (the shirt across his shoulder blades, then his hair lying on it), read off A3, where the arms hang.
# (His hair lies on it in every painting, so the shape of his upper back under the hair is a man's ordinary back, not a measurement.)
BACK = [(1.24, None), (1.30, -0.112), (1.36, -0.113), (1.42, -0.108), (1.46, -0.100), (1.50, -0.092), (1.52, -0.09)]
zb = np.array(zb); ysT = np.arange(0.62, T_TOP + 0.001, 0.02)
bk = [(BACK[0][0], float(np.interp(BACK[0][0], ysT, zb)))] + BACK[1:]
for i, h in enumerate(ysT):
    if BACK[0][0] < h: zb[i] = np.interp(h, [k[0] for k in bk], [k[1] for k in bk])
rx, zf, zb = smooth(rx, 2), smooth(zf, 3), smooth(zb, 2)
# under the crotch the seat closes in a rounded gusset that sits in the gap between the legs (the legs carry the outline from there down)
for i, h in enumerate(ysT):
    t = float(np.clip((0.71 - h) / 0.09, 0, 1))
    if t > 0:
        cz = (zf[i] + zb[i]) / 2; kd = 1 - 0.5 * t * t; rx[i] *= float(np.sqrt(1 - 0.93 * t * t)); zf[i] = cz + (zf[i] - cz) * kd; zb[i] = cz + (zb[i] - cz) * kd
TRUNK = [[round(float(h), 3), R([rx[i], zf[i], zb[i]])] for i, h in enumerate(ys)]

# ---- his hair: long and loose. One row a height: how far it reaches to each side (front painting) and how far back (side paintings) ----
# From his shoulders up these are measured. Below them the hair lies on his back and narrows to its tips: read off B1's back view.
HAIR_LOW = [(1.32, 0.030, -0.128), (1.36, 0.078, -0.150), (1.40, 0.108, -0.172), (1.44, 0.130, -0.190), (1.48, 0.152, -0.208)]
HAIR = [[h, [w, b]] for h, w, b in HAIR_LOW]
for h in np.arange(1.50, 1.7801, 0.02):
    sp = [s for s in front_spans(FR, h) if s[0] <= 0.0 <= s[1]]; w = (sp[0][1] - sp[0][0]) / 2 if sp else 0.03
    if h < 1.54: w = min(w, 0.168)                       # his shoulders join the outline here
    b, f = side_span(min(h, HT - 0.012)); HAIR.append([float(h), [w, b]])
hw_ = smooth([r[1][0] for r in HAIR], 1); hb_ = smooth([r[1][1] for r in HAIR], 1)
HAIR = [[round(r[0], 3), R([hw_[i], hb_[i]])] for i, r in enumerate(HAIR)]

# ---- the legs of the trousers: two rings a row from the gathered hems up into the seat ----
ys = np.arange(0.39, 0.7401, 0.02); L = []
for h in ys:
    sp = front_spans(FR, h)
    if len(sp) >= 2:
        l, r = sp[0], sp[-1]; hw = 0.5 * ((l[1] - l[0]) / 2 + (r[1] - r[0]) / 2); c = 0.5 * (-(l[0] + l[1]) / 2 + (r[0] + r[1]) / 2)
    else:
        w = (sp[0][1] - sp[0][0]) / 2; hw = w / 2 + 0.004; c = w / 2 - 0.004        # above the crotch: two legs side by side inside the seat
    b, f = side_span(h); L.append([h, hw, c, f, b])
L = np.array(L);
for k in (1, 2, 3, 4): L[:, k] = smooth(L[:, k], 2)
LEG = [[round(float(r[0]), 3), R(r[1:])] for r in L]            # [y, [half width, centre x, z front, z back]]

# ---- the boots: one ring a row from the sole to the top of the cuff ----
ys = np.concatenate([np.arange(0.0, 0.06, 0.01), np.arange(0.06, 0.4001, 0.02)]); Bt = []
for h in ys:
    sp = front_spans(FR, max(h, 0.02))
    if len(sp) >= 2:
        l = max([q for q in sp if q[1] <= 0.0], key=lambda q: q[1] - q[0]); r = max([q for q in sp if q[0] >= 0.0], key=lambda q: q[1] - q[0]); hw = 0.5 * ((l[1] - l[0]) / 2 + (r[1] - r[0]) / 2); c = 0.5 * (-(l[0] + l[1]) / 2 + (r[0] + r[1]) / 2)
    b, f = side_span(max(h, 0.02)); Bt.append([h, hw, c, f, b])
Bt = np.array(Bt)
for k in (1, 2, 3, 4): Bt[:, k] = smooth(Bt[:, k], 1)
BOOT = [[round(float(r[0]), 3), R(r[1:])] for r in Bt]

# ---- an arm, from the front painting: the outline either side of a straight line from the shoulder to the wrist ----
# The line runs from the shoulder joint through the middle of the forearm; s is the distance along it. The sleeve hangs below the
# line, so each row has a radius and how far its middle sits from the line (positive: away from his body and up).
SH = (0.196, 1.435)
def arm_profile(F, sgn):
    # middle of the forearm from the rows where the arm stands clear of the body
    pts = []
    for h in np.arange(0.93, 1.03, 0.01):
        sp = [s for s in front_spans(F, h, sgn) if s[0] > 0.30]
        if sp: pts.append(((sp[-1][0] + sp[-1][1]) / 2, h))
    pts = np.array(pts); wx, wy = pts[:, 0].mean(), pts[:, 1].mean()
    d = np.array([wx - SH[0], wy - SH[1]]); Ld = np.hypot(*d); d /= Ld; n = np.array([d[1], -d[0]]) * -1        # n: away from the body, up
    if n[0] < 0: n = -n
    prof = []
    for s in np.arange(0.0, 0.7401, 0.01):
        c = np.array(SH) + d * s; ext = []
        for sg in (1, -1):
            t = 0.0; last = 0.0
            while t < 0.20:
                p = c + n * sg * t; px = int(round(F['cx'] + sgn * p[0] * F['pxm'])); py = int(round(F['y1'] - p[1] * F['pxm']))
                inside = 0 <= py < F['m'].shape[0] and 0 <= px < F['m'].shape[1] and F['m'][py, px]
                if inside: last = t
                elif t - last > 0.012: break
                t += 0.002
            ext.append(last)
        prof.append((s, ext[0], ext[1]))
    return np.array(prof), float(np.degrees(np.arctan2(d[0], -d[1]))), float(Ld)
pL, angL, lenL = arm_profile(FR, 1); pR, angR, lenR = arm_profile(FR, -1)
P = 0.5 * (pL + pR); ARM = []
k16 = (P[:, 0] >= 0.16) & (P[:, 0] <= 0.20); SAG = float((P[k16, 2] - P[k16, 1]).mean())        # how much lower the sleeve hangs than it rises, just clear of the trunk
for s, out, inn in P:
    # Near the shoulder the under-side of the sleeve runs into the trunk in the painting, and only stands clear from 16 cm out. So there the
    # under-side is grown from the top side: even at the shoulder, sagging by SAG at 16 cm. (Before November 13 this stopped at 13 cm, and
    # the three readings after it took the trunk for sleeve: a lump that folded through itself and stuck out as a sharp flap.)
    if s < 0.16: t = s / 0.16; inn = out + SAG * t * t * (3 - 2 * t)
    ARM.append([s, (out + inn) / 2, (out - inn) / 2])
ARM = np.array(ARM); ARM[:, 1] = smooth(ARM[:, 1], 5); ARM[:, 2] = smooth(ARM[:, 2], 5)
ARMT = [[round(float(r[0]), 3), R(r[1:])] for r in ARM[::2]]
A_POSE = 0.5 * (angL + angR)

js = '  // ---------- his proportion tables (written by tools/tables.py from paintings B1 and B2; edit them there) ----------\n'
js += '  const N_HT = %s, N_ZOFF = %s, N_APOSE = %.2f, N_SHOULDER = [%s, %s, -0.075];\n' % (HT, ZOFF, A_POSE, SH[0], SH[1])
js += '  const N_TRUNK = %s;\n  const N_LEG = %s;\n  const N_BOOT = %s;\n  const N_ARM = %s;\n  const N_HAIR = %s;\n' % (json.dumps(TRUNK), json.dumps(LEG), json.dumps(BOOT), json.dumps(ARMT), json.dumps(HAIR))
open(os.path.join(ROOT, 'src', 'N05_tables.js'), 'w').write(js)
# where each painting sits on him, for laying it back on (bake_proj.py reads this)
reg = {k: dict(name=F['name'], fi=F['fi'], x0=F['x0'], y0=F['y0'], x1=F['x1'], y1=F['y1'], pxm=F['pxm'], c=F.get('cx', F.get('ax'))) for k, F in (('front', FR), ('back', BK), ('sideR', SR), ('sideL', SL))}
# The arms hang at his sides only in A3 (full outfit, with the hat), so A3 paints the outer and inner faces of the sleeves.
# Its scale is found by matching its boots to B2's (tools/reg_side.py).
from reg_side import register
reg['armR'] = register('A3.png', 1, 1); reg['armL'] = register('A3.png', 0, -1)
json.dump(reg, open(os.path.join(ROOT, 'out', 'registration.json'), 'w'), indent=1)
print('trunk rows %d (%.2f to %.2f m)  legs %d  boots %d  arm rows %d' % (len(TRUNK), TRUNK[0][0], TRUNK[-1][0], len(LEG), len(BOOT), len(ARMT)))
print('arm angle from straight down: left %.1f right %.1f degrees; shoulder to mid forearm %.3f / %.3f m' % (angL, angR, lenL, lenR))
for h in (0.70, 0.90, 1.04, 1.16, 1.24, 1.40, 1.46, 1.50):
    i = int(np.argmin([abs(t[0] - h) for t in TRUNK])); print('  trunk %.2f  half width %.3f  front %+.3f  back %+.3f' % (TRUNK[i][0], *TRUNK[i][1]))
for t in LEG[::4]: print('  leg %.2f  half width %.3f  centre %.3f  front %+.3f back %+.3f' % (t[0], *t[1]))
for t in BOOT[::4]: print('  boot %.2f  half width %.3f  centre %.3f  front %+.3f back %+.3f' % (t[0], *t[1]))
for t in ARMT[::5]: print('  arm s %.2f  radius %.3f  off %+.3f' % (t[0], *t[1]))
for t in HAIR[::3]: print('  hair %.2f  half width %.3f  back %+.3f' % (t[0], *t[1]))
