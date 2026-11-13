# a figure of a painting with a metre grid over it (labels in metres from the soles and from the centre line)
# usage: mgrid.py painting figIndex height out.jpg [cx_px] [zoom]
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sil import load, mask_of, figures
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path, fi, HT, out = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
a = load(os.path.join(ROOT, 'refs', path)); m, _ = mask_of(a); lab, figs = figures(m, 20000); f = figs[fi]
x0, y0, x1, y1 = f[:4]; pxm = (y1 - y0) / HT
cx = float(sys.argv[5]) if len(sys.argv) > 5 and float(sys.argv[5]) > 0 else (x0 + x1) / 2
Z = float(sys.argv[6]) if len(sys.argv) > 6 else 1.6
pad = 20; box = (max(0, x0 - pad), max(0, y0 - pad), min(a.shape[1], x1 + pad), min(a.shape[0], y1 + pad))
im = Image.fromarray(a.astype(np.uint8)).crop(box); im = im.resize((round(im.width * Z), round(im.height * Z)), Image.LANCZOS); d = ImageDraw.Draw(im)
for k in range(0, int(HT * 20) + 2):
    h = k * 0.05; Y = (y1 - h * pxm - box[1]) * Z
    d.line([(0, Y), (im.width, Y)], fill=(0, 255, 0) if k % 2 == 0 else (0, 110, 0))
    if k % 2 == 0: d.text((2, Y - 11), '%.1f' % h, fill=(255, 255, 0))
for k in range(-12, 13):
    X = (cx + k * 0.05 * pxm - box[0]) * Z
    if 0 <= X < im.width:
        d.line([(X, 0), (X, im.height)], fill=(0, 255, 0) if k % 2 == 0 else (0, 110, 0))
        if k % 2 == 0: d.text((X + 2, 2), '%+.1f' % (k * 0.05), fill=(255, 255, 0))
im.convert('RGB').save(out, quality=88); print(out, im.size, 'px/m %.1f' % pxm, 'cx', cx)
