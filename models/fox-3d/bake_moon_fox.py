# bake_moon_fox.py: the blue full moon from her magic set (references/round4/K2), cut to its disc (the painted stitches are left out: the spell sews its own).
# Writes 'moon' into out/fox_tex_own.js, out/fox_tex.js and variants/ownface/fox_tex_own.js.      run: python3 -I bake_moon_fox.py [size]
import json, io, base64, sys, os, glob
import numpy as np
from PIL import Image, ImageDraw
W = '/home/claude/fox3d/'; D = W + 'references/round4/'
if not glob.glob(D + 'K2-*.webp'): D = '/home/claude/moon-faire/models/fox-3d/references/round4/'      # the paintings as they sit in the repo
SIZE = int(sys.argv[1]) if len(sys.argv) > 1 else 320
im = Image.open(glob.glob(D + 'K2-*.webp')[0]).convert('RGB'); a = np.asarray(im).astype(np.float32); x0 = int(im.width * 0.45)
m = a[:, x0:, :].max(axis=2) > 45; ys, xs = np.nonzero(m); cx = (xs.min() + xs.max()) / 2 + x0; cy = (ys.min() + ys.max()) / 2; R = min(xs.max() - xs.min(), ys.max() - ys.min()) / 2
r = R * 0.885      # inside the painted rope and stitches that run round its rim
t = im.crop((int(cx - r), int(cy - r), int(cx + r), int(cy + r))).resize((SIZE, SIZE), Image.LANCZOS)
b = io.BytesIO(); t.save(b, 'JPEG', quality=84); url = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(); print('moon', t.size, len(b.getvalue()) // 1024, 'KB', 'centre', round(cx), round(cy), 'outer', round(R), 'disc', round(r))
t.save(W + 'shots/ref/moon.jpg', quality=90)
for f in ('out/fox_tex_own.js', 'out/fox_tex.js', 'variants/ownface/fox_tex_own.js'):
    raw = open(W + f).read(); T = json.loads(raw[raw.index('{'):raw.rindex('}') + 1]); T['moon'] = url; open(W + f, 'w').write('window.FOX_TEX=' + json.dumps(T, separators=(',', ':')) + ';')
