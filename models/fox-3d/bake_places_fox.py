# bake_places_fox.py: the six "patches of other places" from her magic set (references/round3/I7.webp), cut out and laid in one small picture,
# three across and two down: night sky, meadow, sea / snow, sunset, chessboard floor. Slip Stitch shows them through the cut, Crazy Quilt is made of them.
# Writes 'places' into out/fox_tex_own.js, out/fox_tex.js and variants/ownface/fox_tex_own.js.      run: python3 -I bake_places_fox.py [tile]
import json, io, base64, sys
import numpy as np
from PIL import Image
import os
W = '/home/claude/fox3d/'; SRC = W + 'references/round3/I7.webp'
if not os.path.exists(SRC): SRC = '/home/claude/moon-faire/models/fox-3d/references/round3/I7.webp'      # the paintings as they sit in the repo
TILE = int(sys.argv[1]) if len(sys.argv) > 1 else 176
im = Image.open(SRC).convert('RGB'); a = np.asarray(im).astype(np.float32); lum = a.max(axis=2)
def runs(v, thr, minlen):
    on = v > thr; out = []; s = None
    for i, x in enumerate(on):
        if x and s is None: s = i
        if not x and s is not None:
            if i - s >= minlen: out.append((s, i))
            s = None
    if s is not None and len(on) - s >= minlen: out.append((s, len(on)))
    return out
cols = runs((lum > 40).mean(axis=0), 0.2, im.width // 8); rows = runs((lum > 40).mean(axis=1), 0.2, im.height // 6)
assert len(cols) == 3 and len(rows) == 2, (cols, rows)
atlas = Image.new('RGB', (TILE * 3, TILE * 2))
for r, (y0, y1) in enumerate(rows):
    for c, (x0, x1) in enumerate(cols):
        inset = int(0.045 * (x1 - x0))            # inside the painted stitch border: the spells draw their own stitches
        t = im.crop((x0 + inset, y0 + inset, x1 - inset, y1 - inset)).resize((TILE, TILE), Image.LANCZOS); atlas.paste(t, (c * TILE, r * TILE))
b = io.BytesIO(); atlas.save(b, 'JPEG', quality=84); url = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(); print('places', atlas.size, len(b.getvalue()) // 1024, 'KB', cols, rows)
atlas.save(W + 'shots/ref/places_atlas.jpg', quality=90)
for f in ('out/fox_tex_own.js', 'out/fox_tex.js', 'variants/ownface/fox_tex_own.js'):
    raw = open(W + f).read(); T = json.loads(raw[raw.index('{'):raw.rindex('}') + 1]); T['places'] = url; open(W + f, 'w').write('window.FOX_TEX=' + json.dumps(T, separators=(',', ':')) + ';')
