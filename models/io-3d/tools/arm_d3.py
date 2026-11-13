# Measures her arm in D3 (front view on top, back view below): the top and bottom edge along the arm.
import sys, json
import numpy as np
from PIL import Image
im = np.asarray(Image.open('/home/claude/io/refs/D3.png').convert('RGB')).astype(float)
H, W, _ = im.shape
bg = np.array([58, 42, 64.])
def mask(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r > 110) & (r > b + 18) & (r > g + 8)
m = mask(im)
out = {}
for name, y0, y1 in (('front', 0, 480), ('back', 512, 1000)):
    rows = []
    for x in range(150, 1530, 6):
        col = m[y0:y1, x]
        ys = np.where(col)[0]
        if len(ys) < 4: rows.append((x, None, None)); continue
        # the arm is the run of skin that holds the arm's axis row; take the longest run
        runs, s = [], ys[0]
        for a, b in zip(ys[:-1], ys[1:]):
            if b != a + 1: runs.append((s, a)); s = b
        runs.append((s, ys[-1]))
        r = max(runs, key=lambda r: r[1] - r[0])
        rows.append((x, int(r[0] + y0), int(r[1] + y0)))
    out[name] = rows
    print(name)
    for x, a, b in rows[::5]: print('  x', x, 'top', a, 'bottom', b, 'thick', None if a is None else b - a)
json.dump(out, open('/home/claude/io/shots/arm_d3.json', 'w'))
