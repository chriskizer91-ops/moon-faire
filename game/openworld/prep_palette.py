# prep_palette.py: the open world's own 64 colours for the Flipbook look: the paintings' colours and the map's, counted the way the
# walk page counts a painting's colours (game/src/stage.js ownColours): each colour for far less than its share, strong ones a little more.
import sys, os, json
import numpy as np
from PIL import Image
OUT = sys.argv[1]
pts = []
for n in ['macro', 'paint_W1', 'paint_W2', 'paint_W3', 'paint_W4', 'paint_W5', 'paint_W6', 'paint_W7']:
    im = Image.open(os.path.join(OUT, n + '.webp')).convert('RGB'); im.thumbnail((192, 192)); pts.append(np.asarray(im).reshape(-1, 3))
P = np.concatenate(pts).astype(np.int64); key = (P[:, 0] >> 3) << 10 | (P[:, 1] >> 3) << 5 | (P[:, 2] >> 3)
u, cnt = np.unique(key, return_counts=True)
c = np.stack([((u >> 10) & 31) * 8 + 4, ((u >> 5) & 31) * 8 + 4, (u & 31) * 8 + 4], 1).astype(float)
w = cnt ** 0.6 * (1 + (c.max(1) - c.min(1)) / 255)
boxes = [np.arange(len(c))]
def span(b):
    lo, hi = c[b].min(0), c[b].max(0); ax = int(np.argmax(hi - lo)); return (hi - lo)[ax] * np.sqrt(w[b].sum()), ax
while len(boxes) < 64:
    best = max(range(len(boxes)), key=lambda i: span(boxes[i])[0] if len(boxes[i]) > 1 else -1)
    b = boxes[best]; ax = span(b)[1]; b = b[np.argsort(c[b, ax])]; cs = np.cumsum(w[b]); cut = int(np.searchsorted(cs, cs[-1] / 2)) + 1; cut = min(max(cut, 1), len(b) - 1)
    boxes[best:best + 1] = [b[:cut], b[cut:]]
pal = np.array([(c[b] * w[b, None]).sum(0) / w[b].sum() for b in boxes])
for _ in range(4):
    d = ((c[:, None, :] - pal[None]) ** 2).sum(2); a = d.argmin(1)
    for i in range(64):
        m = a == i
        if m.any(): pal[i] = (c[m] * w[m, None]).sum(0) / w[m].sum()
json.dump([[int(round(v)) for v in p] for p in pal], open(os.path.join(OUT, 'palette.json'), 'w'))
print('palette', len(pal))
