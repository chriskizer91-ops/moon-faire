# Measures his body for the blank doll (src/N45_doll.js) off the two paintings that show it with the outer clothes off:
#   B5  his legs in shorts and fishnet: front, right side, back
#   B3  shirt and trousers only: front and side (his waist without the corset, his shoulders, his bare forearm)
#   D3  his bare hands and forearms: how wide the wrist is beside the hand
# Prints small tables and writes out/doll_measure.json. It does NOT write the doll's tables: those are in src/N45_doll.js, set by
# hand from these numbers, because half of the doll (chest, back, upper arm) is under cloth in every painting.
# usage: python3 -I tools/doll_measure.py
#
# Scale of B5. B5 has no whole figure to take a scale from, and its three cues do not agree:
#   780 px/m  makes its boots the size of the boots in B1 (then his hips are 0.41 m across, wider than his baggy trousers)
#   850 px/m  puts the top of the shorts where B3 has the top of his trousers (1.065 m) with the soles on the floor (hips 0.37 m)
#   930 px/m  puts its knee at the knee of his skeleton, 0.53 m (hips 0.34 m)
# 900 is used for every width and depth. It lies between the two cues that come from his body (not his boots), and at 900 his hips
# are 0.35 m across and his thigh 0.166 m: a man of his height, and narrower than the Ranger's hips (0.374 m), as Chris asked.
# So B5 gives the SHAPE of his legs and hips; their size is this decision. Change S5 here to see another scale.
# Heights are not taken by scale at all: each landmark row of B5 is given the height that the same landmark has on his skeleton
# (LAND below), and rows between landmarks are spread evenly.
import os, sys, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of, figures, spans
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S5 = 900.0; HT = 1.78; ZOFF = 0.035
# B5 landmark rows (read off a gridded copy, lib/grid.py) and the height of each on his skeleton, in metres
LAND = [(35, 1.065, 'top of the shorts (waist)'), (215, 0.900, 'hips at their widest'), (250, 0.845, 'crotch'), (445, 0.530, 'knee joint (crease behind the knee)'),
        (565, 0.414, 'calf at its widest'), (628, 0.353, 'top of the boot cuff in B5'), (880, 0.110, 'ankle (inside the boot)')]
def row_h(y): return float(np.interp(y, [l[0] for l in LAND], [l[1] for l in LAND][::1]))      # np.interp wants rising x: the rows rise as the heights fall
def h_row(h): return float(np.interp(h, [l[1] for l in LAND][::-1], [l[0] for l in LAND][::-1]))
def figs_of(name):
    a = load(os.path.join(ROOT, 'refs', name)); m, _ = mask_of(a); lab, figs = figures(m, 20000); return [(lab == f[5], f) for f in figs]
def row(m, y):
    rr = m[y - 1:y + 2].sum(0) >= 2; return [(s, e) for s, e in spans(rr) if e - s >= 3]
out = {'S5': S5, 'land': LAND}

# ---------- B5: legs ----------
F5 = figs_of('B5.png'); (mf, ff), (ms, fs), (mb, fb) = F5
cxf = float(np.mean([np.mean(row(mf, y)[0]) for y in range(120, 240, 10)]))        # middle of the front figure: the middle of the shorts
cxb = float(np.mean([np.mean(row(mb, y)[0]) for y in range(120, 240, 10)]))
axs = float(np.mean([np.mean(max(row(ms, y), key=lambda q: q[1] - q[0])) for y in range(735, 800, 5)]))      # the side figure's axis: the middle of the boot shaft
print('B5 at %.0f px/m: front middle x %.1f, back middle x %.1f, side axis (boot shaft) x %.1f' % (S5, cxf, cxb, axs))
print('\nB5 hips and waist (front and back figures: half width; side figure: front and back of him, z from 3.5 cm ahead of the boot shaft)')
print('  row  height | half width front  back | z front   z back   depth')
hips = []
for y in (40, 65, 90, 115, 140, 165, 190, 215, 240):
    a = row(mf, y); b = row(mb, y); s = max(row(ms, y), key=lambda q: q[1] - q[0])
    wf = (a[-1][1] - a[0][0]) / 2 / S5; wb = (b[-1][1] - b[0][0]) / 2 / S5; zf = (s[1] - axs) / S5 - ZOFF; zb = (s[0] - axs) / S5 - ZOFF
    hips.append([round(row_h(y), 3), round(wf, 4), round(wb, 4), round(zf, 4), round(zb, 4)])
    print('  %3d  %.3f  |   %.3f          %.3f |  %+.3f   %+.3f   %.3f' % (y, row_h(y), wf, wb, zf, zb, zf - zb))
out['hips'] = hips
print('\nB5 legs (his right leg in the front figure, the same leg from behind, and the side figure)')
print('  row  height | width front  back  | middle out from his centre line | z front   z back   depth   middle z')
legs = []
for y in list(range(265, 630, 25)):
    a = row(mf, y)[0]; b = row(mb, y)[-1]; s = max(row(ms, y), key=lambda q: q[1] - q[0])
    wf = (a[1] - a[0]) / S5; wb = (b[1] - b[0]) / S5; c = (cxf - (a[0] + a[1]) / 2) / S5; zf = (s[1] - axs) / S5 - ZOFF; zb = (s[0] - axs) / S5 - ZOFF
    legs.append([round(row_h(y), 3), round(wf, 4), round(wb, 4), round(c, 4), round(zf, 4), round(zb, 4)])
    print('  %3d  %.3f  |  %.3f      %.3f  |   %.3f                         |  %+.3f   %+.3f   %.3f   %+.3f' % (y, row_h(y), wf, wb, c, zf, zb, zf - zb, (zf + zb) / 2))
out['legs'] = legs

# ---------- B3: trunk in shirt and trousers, and the forearm ----------
F3 = figs_of('B3.png'); (m3, f3), (m3s, f3s) = F3
p3 = (f3[3] - f3[1]) / HT; p3s = (f3s[3] - f3s[1]) / HT
def r3(h): return row(m3, int(round(f3[3] - h * p3)))
def r3s(h): return max(row(m3s, int(round(f3s[3] - h * p3s))), key=lambda q: q[1] - q[0])
w = min((r3(h) for h in np.arange(1.04, 1.09, 0.01)), key=lambda sp: min(e - s for s, e in sp if s < 470 < e))
cx3 = float(np.mean([q for q in w if q[0] < 470 < q[1]][0]))
ax3 = float(np.mean([np.mean(max(row(m3s, int(round(f3s[3] - h * p3s))), key=lambda q: q[1] - q[0])) for h in np.arange(0.16, 0.30, 0.01)]))
print('\nB3 front %.1f px/m, middle x %.1f; side %.1f px/m, axis x %.1f' % (p3, cx3, p3s, ax3))
print('B3 trunk in the shirt (the body is somewhere inside this): half width, and front and back from the side')
print('  height | half width | z front   z back   depth')
trunk = []
for h in (1.00, 1.04, 1.06, 1.08, 1.12, 1.16, 1.20, 1.24, 1.28, 1.32, 1.36, 1.40, 1.44, 1.46, 1.48, 1.50, 1.52, 1.54):
    sp = [q for q in r3(h) if q[0] < cx3 < q[1]][0]; s = r3s(h); hw = (sp[1] - sp[0]) / 2 / p3; zf = (s[1] - ax3) / p3s - ZOFF; zb = (s[0] - ax3) / p3s - ZOFF
    note = '  (arms and sleeves are in this row)' if h >= 1.24 and h < 1.47 else ''
    trunk.append([h, round(hw, 4), round(zf, 4), round(zb, 4)]); print('  %.2f   |   %.3f    |  %+.3f   %+.3f   %.3f%s' % (h, hw, zf, zb, zf - zb, note))
out['trunk_clothed'] = trunk
# the bare forearm and the cuff, measured square across the arm (the arm hangs 27 degrees out from straight down)
tj = open(os.path.join(ROOT, 'src', 'N05_tables.js')).read(); ap = float(tj.split('N_APOSE = ')[1].split(',')[0]); shx, shy = [float(v) for v in tj.split('N_SHOULDER = [')[1].split(']')[0].split(',')[:2]]
d = np.array([np.sin(np.radians(ap)), -np.cos(np.radians(ap))]); n = np.array([np.cos(np.radians(ap)), np.sin(np.radians(ap))])
print('\nB3 arm, square across it, by distance from the shoulder joint (mean of his two arms). From 0.33 to 0.42 the ruffle is in the way.')
arm = []
for sl in np.arange(0.42, 0.56, 0.02):
    ws = []
    for sg in (1, -1):
        c = np.array([shx, shy]) + d * sl; ext = []
        for dr in (1, -1):
            t = 0.0
            while t < 0.09:
                p = c + n * dr * t; px = int(round(cx3 + sg * p[0] * p3)); py = int(round(f3[3] - p[1] * p3))
                if not m3[py, px]: break
                t += 0.001
            ext.append(t)
        ws.append(ext[0] + ext[1])
    arm.append([round(float(sl), 2), round(float(np.mean(ws)), 4)]); print('  %.2f m from the shoulder: %.3f m across' % (sl, np.mean(ws)))
out['arm'] = arm

# ---------- D3: bare hands and forearms ----------
FD = figs_of('D3.png'); print('\nD3 bare hands and forearms (each scaled so the palm is as wide as the hand model on him, 0.0788 m)'); wr = []
for mk, f in FD:
    rows = {y: row(mk, y) for y in range(f[1] + 4, f[3] - 2, 4)}
    palm = max((max(e - s for s, e in sp), y) for y, sp in rows.items() if 330 <= y <= 400 and len(sp) == 2)       # the palm beside the free thumb
    wrist = min((sp[0][1] - sp[0][0], y) for y, sp in rows.items() if 520 <= y <= 700 and len(sp) == 1)
    k = 0.0788 / palm[0]; fore = [(yy, rows[yy][0][1] - rows[yy][0][0]) for yy in (wrist[1] + 120, wrist[1] + 240, wrist[1] + 360) if yy in rows]
    wr.append(wrist[0] * k); print('  palm %d px at row %d, wrist %d px at row %d: wrist %.4f m across; forearm ' % (palm[0], palm[1], wrist[0], wrist[1], wrist[0] * k) + ', '.join('%.3f m at %.3f m above the wrist' % (w_ * k, (yy - wrist[1]) * k) for yy, w_ in fore))
out['wrist'] = round(float(np.mean(wr)), 4)
json.dump(out, open(os.path.join(ROOT, 'out', 'doll_measure.json'), 'w'), indent=1)
