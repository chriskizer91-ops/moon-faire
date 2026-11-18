# The Ranger's proportion tables, read off her paintings (B1 front/back, B2 sides, B3 legs; see tools/measure.py, tools/more.py).
# One source for both the model (src/R05_tables.js, written by this file) and the texture bake (bake_ranger.py imports it).
# Scales: every full figure is 1.665 m from the top of her hair to her soles (eye line 1.50 m, as the Jester on the shared sprite scale).
#   A1 898 px/m, B1 591.6 px/m, B2 592.5 px/m, B3 898 px/m.
# Side views lean (pelvis forward of the ankles); the model stands upright, so 0.057 m (B2) is taken off z above the hips.
import json, math

TY0, TY1 = 0.760, 1.405          # the torso loft: from the crotch to the base of the neck
TPW = 2.3                        # ring squareness (2 = ellipse)
# y: [half-width, front z, back z]   (front/back measured in profile; the bust is added on top, see BUST)
TORSO = [
    [0.760, [0.176, 0.080, -0.086]],
    [0.800, [0.187, 0.090, -0.118]],
    [0.850, [0.186, 0.0985, -0.1325]],
    [0.900, [0.177, 0.0940, -0.1435]],
    [0.950, [0.160, 0.1035, -0.1315]],
    [1.000, [0.141, 0.1115, -0.0990]],
    [1.050, [0.120, 0.1070, -0.0710]],
    [1.100, [0.102, 0.1100, -0.0605]],
    [1.150, [0.113, 0.1140, -0.0710]],
    [1.200, [0.126, 0.1090, -0.1035]],
    [1.250, [0.131, 0.0990, -0.1085]],
    [1.290, [0.150, 0.0780, -0.1100]],
    [1.325, [0.160, 0.0550, -0.1020]],
    [1.342, [0.150, 0.0420, -0.0950]],
    [1.356, [0.112, 0.0350, -0.0890]],
    [1.370, [0.080, 0.0300, -0.0840]],
    [1.385, [0.062, 0.0270, -0.0800]],
    [1.405, [0.050, 0.0240, -0.0780]],
]
# two soft mounds under the corset: amplitude, |x| of each, y, spread in x and y; and the shallow dip between them
BUST = dict(amp=0.034, x=0.062, y=1.215, sx=0.046, sy=0.052, dip=0.004, dipx=0.016, dipy=1.24, dipsy=0.045)

# legs. y: [half-width, half-depth front, half-depth back, centre x, centre z]   (widths from B3 and B1, depths the mean of B3 and B2)
LEG = [
    [0.875, [0.092, 0.098, 0.104, 0.092, -0.010]],
    [0.800, [0.090, 0.096, 0.106, 0.092, -0.010]],
    [0.740, [0.083, 0.092, 0.092, 0.091, 0.000]],
    [0.700, [0.075, 0.087, 0.087, 0.090, -0.001]],
    [0.660, [0.0670, 0.0805, 0.0805, 0.090, 0.000]],
    [0.620, [0.0610, 0.0715, 0.0715, 0.089, 0.001]],
    [0.580, [0.0565, 0.0655, 0.0655, 0.088, 0.000]],
    [0.540, [0.0540, 0.0640, 0.0640, 0.087, -0.002]],
    [0.510, [0.0520, 0.0615, 0.0595, 0.086, -0.007]],
    [0.480, [0.0540, 0.0570, 0.0610, 0.086, -0.015]],
    [0.450, [0.0575, 0.0570, 0.0660, 0.085, -0.020]],
    [0.420, [0.0595, 0.0585, 0.0710, 0.085, -0.022]],
    [0.380, [0.0550, 0.0560, 0.0670, 0.084, -0.022]],
    [0.340, [0.0470, 0.0500, 0.0560, 0.083, -0.020]],
    [0.300, [0.0420, 0.0450, 0.0470, 0.082, -0.018]],
    [0.240, [0.0380, 0.0410, 0.0410, 0.082, -0.016]],
]
KNEE_Y = 0.510                   # the knee joint (the Jester's is at 0.470)
SHOULDER = [0.150, 1.300, -0.020]

def prof(keys, x, smooth=True):
    if keys[0][0] > keys[-1][0]: keys = keys[::-1]
    if x <= keys[0][0]: return list(keys[0][1])
    if x >= keys[-1][0]: return list(keys[-1][1])
    i = 1
    while keys[i][0] < x: i += 1
    u = (x - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])
    if smooth: u = u * u * (3 - 2 * u)
    a, b = keys[i - 1][1], keys[i][1]
    return [p + (q - p) * u for p, q in zip(a, b)]

def spline(K, x):                # the same curve as spline() in src/00_util.js
    n = len(K); i = 0
    while i < n - 2 and K[i + 1][0] < x: i += 1
    x0, x1 = K[i][0], K[i + 1][0]; dx = x1 - x0; t = min(1.0, max(0.0, (x - x0) / dx)); t2 = t * t; t3 = t2 * t
    out = []
    for c in range(len(K[0][1])):
        g = lambda j: K[j][1][c]
        v0, v1 = g(i), g(i + 1)
        m0 = (v1 - g(i - 1)) / (x1 - K[i - 1][0]) if i > 0 else (v1 - v0) / dx
        m1 = (g(i + 2) - v0) / (K[i + 2][0] - x0) if i < n - 2 else (v1 - v0) / dx
        out.append((2 * t3 - 3 * t2 + 1) * v0 + (t3 - 2 * t2 + t) * dx * m0 + (-2 * t3 + 3 * t2) * v1 + (t3 - t2) * dx * m1)
    return out

def torso_pt(u, y):
    """the model's torso surface: u 0..1 round the body (0 = middle of the back, 0.25 = her right side, 0.5 = front), y height"""
    rx, zf, zb = spline(TORSO, y); cz = (zf + zb) / 2; rf = zf - cz; rb = cz - zb
    a = math.pi + u * 2 * math.pi; s = math.sin(a); c = math.cos(a); e = 2 / TPW
    x = rx * math.copysign(abs(s) ** e, s); z = cz + (rf if c >= 0 else rb) * math.copysign(abs(c) ** e, c)
    if c > 0:
        B = BUST; ax = abs(x)
        z += c * B['amp'] * math.exp(-((ax - B['x']) / B['sx']) ** 2 - ((y - B['y']) / B['sy']) ** 2)
        z -= c * B['dip'] * math.exp(-(x / B['dipx']) ** 2 - ((y - B['dipy']) / B['dipsy']) ** 2)
    return x, z

if __name__ == '__main__':
    js = ('  // ---------- the Ranger\'s proportion tables (written by tools/tables.py from her paintings; edit them there) ----------\n'
          '  const R_TY0 = %g, R_TY1 = %g, R_TPW = %g;\n' % (TY0, TY1, TPW) +
          '  const R_TORSO = %s;\n' % json.dumps(TORSO) +
          '  const R_BUST = %s;\n' % json.dumps(BUST) +
          '  const R_LEG = %s;\n' % json.dumps(LEG) +
          '  const R_KNEE_Y = %g, R_SHOULDER = %s;\n' % (KNEE_Y, json.dumps(SHOULDER)))
    open('/home/claude/ranger/src/R05_tables.js', 'w').write(js)
    print('wrote src/R05_tables.js', len(js))
