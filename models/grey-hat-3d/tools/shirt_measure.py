# Measures his shirt and the corset's top edge off the paintings, in the model's own metres.
# It reads the baked copies of B1 (front, back) and B2 (sides) in out/tex_proj.json: bake_proj.py has already placed those on the model
# (the 'win' entry says which metres each picture spans), so a pixel here is a place on him.
# usage: python3 -I tools/shirt_measure.py [folder for gridded pictures]
# Prints small tables: the corset's top edge by x, the open V of the shirt, the ruffle's outline, the shirt's cream tones.
import os, sys, io, json, base64, numpy as np
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, 'out', 'tex_proj.json'))); WIN = T['win']
def pic(k): return np.asarray(Image.open(io.BytesIO(base64.b64decode(T[k].split(',')[1]))).convert('RGB')).astype(float)
def px(k, a, x, y):                                   # metres to pixel in picture k
    w = WIN[k]; return (x - w[0]) / (w[1] - w[0]) * a.shape[1], (1 - (y - w[2]) / (w[3] - w[2])) * a.shape[0]
def grid(k, a, box, out, step=0.05, zoom=3):          # box = x0, x1, y0, y1 in metres
    (X0, Y1), (X1, Y0) = px(k, a, box[0], box[3]), px(k, a, box[1], box[2])
    im = Image.fromarray(a.astype(np.uint8)).crop((int(X0), int(Y1), int(X1), int(Y0))); im = im.resize((im.width * zoom, im.height * zoom), Image.LANCZOS); d = ImageDraw.Draw(im)
    sx, sy = im.width / (box[1] - box[0]), im.height / (box[3] - box[2])
    v = np.ceil(box[0] / step) * step
    while v < box[1]: X = (v - box[0]) * sx; d.line([(X, 0), (X, im.height)], fill=(0, 255, 0) if abs(v) < 1e-6 else (0, 110, 0)); d.text((X + 2, 2), '%.2f' % v, fill=(255, 255, 0)); v += step
    v = np.ceil(box[2] / step) * step
    while v < box[3]: Y = (box[3] - v) * sy; d.line([(0, Y), (im.width, Y)], fill=(0, 110, 0)); d.text((2, Y + 2), '%.2f' % v, fill=(255, 255, 0)); v += step
    im.save(out, quality=90)
def cream(c): return (c[..., 0] > 150) & (c[..., 1] > 120) & (c[..., 2] > 85) & (c[..., 0] - c[..., 2] > 25) & (c[..., 0] - c[..., 2] < 110)
def dark(c): return c.max(-1) < 95
if __name__ == '__main__':
    outdir = sys.argv[1] if len(sys.argv) > 1 else None
    for k in ('front', 'back'):
        a = pic(k); print(k, a.shape[1], 'x', a.shape[0], 'px;', round(a.shape[0] / (WIN[k][3] - WIN[k][2])), 'px a metre')
        if outdir: grid(k, a, (-0.32, 0.32, 1.10, 1.56), os.path.join(outdir, 'grid_' + k + '.jpg'))
        # the corset's top edge: going up a column from 1.15 m, the first place where leather gives way to cream for at least 1.5 cm
        print('  corset top edge (x: height):', end=' ')
        for x in np.arange(-0.16, 0.161, 0.04):
            col = []
            for y in np.arange(1.15, 1.40, 0.002):
                X, Y = px(k, a, x, y); col.append(a[int(Y), int(X)])
            col = np.array(col); cr = cream(col); edge = None
            for i in range(len(col) - 8):
                if cr[i:i + 8].all(): edge = 1.15 + i * 0.002; break
            print('%.2f: %s' % (x, 'none' if edge is None else '%.3f' % edge), end='  ')
        print()
        sel = []
        for (x, y) in ((-0.13, 1.30), (0.13, 1.30), (-0.14, 1.36), (0.14, 1.36)):
            X, Y = px(k, a, x, y); sel.append(a[int(Y) - 6:int(Y) + 6, int(X) - 6:int(X) + 6].reshape(-1, 3))
        s = np.concatenate(sel); print('  cream of the shirt beside the ruffle: mean', s.mean(0).round(0), ' dark tenth', np.percentile(s, 10, 0).round(0), ' light tenth', np.percentile(s, 90, 0).round(0))
    for k in ('sideR', 'sideL'):
        a = pic(k)
        if outdir: grid(k, a, (-0.2, 0.2, 1.10, 1.56), os.path.join(outdir, 'grid_' + k + '.jpg'))
