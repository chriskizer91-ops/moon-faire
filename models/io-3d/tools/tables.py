# Io's proportion tables, read off her round 1 paintings (B3 front, B2 sides, B5 legs; see tools/measure.py).
# One source for both the model (src/I05_tables.js, written by this file) and the texture bake (bake_io.py imports it).
# Scales: her eye line is 1.50 m above her soles in every full figure, as on the Jester and the Ranger (she stands on 5.5 cm platforms).
#   A1 885.7 px/m (soles y 1515, middle x 501.5), B1 578 (soles 998 front, 996 back), B2 578 (soles 996), B3 584.3 (soles 1007),
#   B5 890 (soles 982, 980, 979: fixed by the boot, 0.317 m to its leather top and 0.359 m to the sock top, as in B3).
# The side paintings lean: her hips stand about 4 cm ahead of her shins. The model stands upright: z has 0.04 m taken off at the hips
# and above (less toward the ankle, and 0.02 m at the neck).
import json, math

TY0, TY1 = 0.860, 1.405          # the torso loft: from the crotch to the base of the neck
TPW = 2.25                       # ring squareness (2 = ellipse)
# y: [half-width, front z, back z]   (widths from B3 above the waist and B5 at the hips; depths from B2 and B5; the bust is added on top)
TORSO = [
    [0.860, [0.181, 0.095, -0.115]],
    [0.880, [0.180, 0.093, -0.125]],
    [0.920, [0.172, 0.088, -0.129]],
    [0.960, [0.155, 0.093, -0.118]],
    [1.000, [0.132, 0.094, -0.090]],
    [1.040, [0.106, 0.091, -0.063]],
    [1.070, [0.094, 0.088, -0.051]],
    [1.100, [0.0905, 0.082, -0.048]],
    [1.130, [0.097, 0.084, -0.051]],
    [1.160, [0.106, 0.086, -0.060]],
    [1.200, [0.114, 0.082, -0.073]],
    [1.250, [0.120, 0.078, -0.086]],
    [1.290, [0.128, 0.064, -0.089]],
    [1.320, [0.132, 0.046, -0.086]],
    [1.340, [0.098, 0.036, -0.080]],
    [1.356, [0.066, 0.031, -0.076]],
    [1.370, [0.050, 0.029, -0.074]],
    [1.385, [0.043, 0.027, -0.073]],
    [1.405, [0.040, 0.025, -0.072]],
]
# two soft mounds under the bodice: amplitude, |x| of each, y, spread in x and y; and the shallow dip between them
BUST = dict(amp=0.033, x=0.058, y=1.222, sx=0.044, sy=0.050, dip=0.004, dipx=0.016, dipy=1.245, dipsy=0.045)

# legs. y: [half-width, half-depth front, half-depth back, centre x, centre z]   (B5: widths from the front figure, depths from the side figure)
LEG = [
    [0.975, [0.066, 0.070, 0.070, 0.078, -0.012]],
    [0.930, [0.078, 0.082, 0.084, 0.084, -0.012]],
    [0.890, [0.087, 0.090, 0.096, 0.088, -0.010]],
    [0.840, [0.091, 0.094, 0.098, 0.091, -0.002]],
    [0.800, [0.089, 0.092, 0.092, 0.089, 0.007]],
    [0.760, [0.0815, 0.0885, 0.0885, 0.0875, 0.008]],
    [0.720, [0.0725, 0.084, 0.084, 0.0855, 0.007]],
    [0.680, [0.0645, 0.075, 0.075, 0.0835, 0.007]],
    [0.640, [0.0595, 0.065, 0.065, 0.082, 0.009]],
    [0.600, [0.056, 0.0595, 0.0595, 0.081, 0.0095]],
    [0.560, [0.052, 0.055, 0.055, 0.081, 0.002]],
    [0.520, [0.052, 0.0545, 0.0545, 0.082, -0.009]],
    [0.480, [0.057, 0.058, 0.058, 0.083, -0.016]],
    [0.440, [0.058, 0.059, 0.059, 0.084, -0.0165]],
    [0.400, [0.054, 0.055, 0.055, 0.084, -0.015]],
    [0.360, [0.047, 0.049, 0.049, 0.083, -0.012]],
    [0.300, [0.042, 0.046, 0.046, 0.082, -0.010]],
]
KNEE_Y = 0.570                   # the knee joint (the Ranger's is at 0.51, the Jester's at 0.47)
HIP_Y = 0.935                    # the hip joint (theirs is at 0.835): her crotch is at 0.862 in B5
SHOULDER = [0.119, 1.285, -0.018]

# the skirt (stage one: stiff). y: [half-width, half-depth, middle z], read off B3 (front) and B2 (side): it sits on her waist and hangs from her hips
SKIRT = [[1.060, [0.097, 0.080, 0.019]], [1.020, [0.126, 0.099, 0.008]], [0.980, [0.152, 0.117, -0.006]], [0.940, [0.175, 0.132, -0.017]], [0.900, [0.193, 0.142, -0.019]],
         [0.850, [0.208, 0.156, -0.022]], [0.800, [0.214, 0.163, -0.022]], [0.750, [0.226, 0.175, -0.024]], [0.700, [0.228, 0.188, -0.024]], [0.650, [0.238, 0.186, -0.025]],
         [0.600, [0.248, 0.196, -0.026]], [0.550, [0.254, 0.201, -0.028]], [0.500, [0.262, 0.198, -0.028]], [0.450, [0.268, 0.210, -0.030]], [0.400, [0.264, 0.213, -0.030]],
         [0.350, [0.270, 0.214, -0.030]], [0.300, [0.270, 0.218, -0.032]], [0.250, [0.262, 0.226, -0.034]], [0.200, [0.250, 0.212, -0.034]], [0.150, [0.236, 0.200, -0.034]]]
SKIRT_CZ = -0.015
# the slit over her left leg: it opens at 0.93 m and is this many radians wide (in all) by height; its middle is this far round from the front toward her left
SLIT_TOP, SLIT_MID = 0.930, 0.37
SLIT_W = [[0.930, 0.0], [0.850, 0.16], [0.700, 0.36], [0.500, 0.52], [0.300, 0.62], [0.150, 0.66]]

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
    js = ("  // ---------- Io's proportion tables (written by tools/tables.py from her paintings; edit them there) ----------\n"
          '  const IO_TY0 = %g, IO_TY1 = %g, IO_TPW = %g;\n' % (TY0, TY1, TPW) +
          '  const IO_TORSO = %s;\n' % json.dumps(TORSO) +
          '  const IO_BUST = %s;\n' % json.dumps(BUST) +
          '  const IO_LEG = %s;\n' % json.dumps(LEG) +
          '  const IO_KNEE_Y = %g, IO_HIP_Y = %g, IO_SHOULDER = %s;\n' % (KNEE_Y, HIP_Y, json.dumps(SHOULDER)) +
          '  const IO_SKIRT = %s, IO_SKIRT_CZ = %g;\n' % (json.dumps(SKIRT), SKIRT_CZ) +
          '  const IO_SLIT_TOP = %g, IO_SLIT_MID = %g, IO_SLIT_W = %s;\n' % (SLIT_TOP, SLIT_MID, json.dumps(SLIT_W)))
    open('/home/claude/io/src/I05_tables.js', 'w').write(js)
    print('wrote src/I05_tables.js', len(js))
