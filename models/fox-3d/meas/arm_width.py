# usage: python3 -I meas/arm_width.py image.png x0 x1 y0 y1 [shiftx]   rows of the arm's skin against the backdrop: left edge, right edge, centre, width
import sys
from PIL import Image
import numpy as np
im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int); x0, x1, y0, y1 = [int(v) for v in sys.argv[2:6]]; sx = int(sys.argv[6]) if len(sys.argv) > 6 else 0
R, G, B = im[..., 0], im[..., 1], im[..., 2]
skin = (R > 140) & (R - B > 45) & (R > G) & (G > B - 5) & (G > 70)
rows = []
for y in range(y0, y1, 10):
    xs = np.where(skin[y, x0:x1])[0]
    if len(xs) < 5: print(y, '-'); continue
    # the longest run
    runs = np.split(xs, np.where(np.diff(xs) > 3)[0] + 1); r = max(runs, key=len); a, b = r[0] + x0 - sx, r[-1] + x0 - sx
    rows.append((y, a, b)); print(y, a, b, 'centre %.1f' % ((a + b) / 2), 'width', b - a + 1)
