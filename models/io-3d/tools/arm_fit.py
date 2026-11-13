# From the measured edges of D3: how far the arm's outer (top) and inner (bottom) lines sit from the bone, along the arm.
import json, numpy as np
d = json.load(open('/home/claude/io/shots/arm_d3.json'))
LU, LF, PXM = 0.232, 0.212, 2016.0
V = {'front': ((225, 223), (655, 250), (1105, 231)), 'back': ((225, 727), (665, 752), (1125, 745))}
for name in ('front', 'back'):
    (x0, y0), (x1, y1), (x2, y2) = V[name]
    rows = [r for r in d[name] if r[1] is not None]
    xs = np.array([r[0] for r in rows], float); top = np.array([r[1] for r in rows], float); bot = np.array([r[2] for r in rows], float)
    print(name)
    for sl in [0.0, 0.02, 0.04, 0.06, 0.08, 0.10, 0.12, 0.14, 0.16, 0.18, 0.20, 0.22, 0.232, 0.25, 0.27, 0.29, 0.31, 0.33, 0.35, 0.37, 0.39, 0.41, 0.43, 0.444]:
        if sl <= LU: x = x0 + (x1 - x0) * sl / LU; ya = y0 + (y1 - y0) * sl / LU
        else: x = x1 + (x2 - x1) * (sl - LU) / LF; ya = y1 + (y2 - y1) * (sl - LU) / LF
        t = np.interp(x, xs, top); b = np.interp(x, xs, bot)
        up, dn = (ya - t) / PXM, (b - ya) / PXM; T = up + dn
        print('  sl %.3f  x %4d  up %.4f dn %.4f  total %.4f   mod up %.4f dn %.4f' % (sl, x, up, dn, T, T / 2 + 0.6 * (up - T / 2), T / 2 + 0.6 * (dn - T / 2)))
