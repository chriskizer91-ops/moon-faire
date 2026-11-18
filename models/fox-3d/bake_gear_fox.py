# bake_gear_fox.py: her belt, pouch and sheath, straight from the paintings (F7: belt and pouch, G3: sheath).
# Writes into out/fox_tex_own.js:
#   'gear'        one 1024 x 1024 picture holding the pouch's front, back and side, the sheath's front and side, the belt's holed tail and a plain patch of leather
#   'gearLayout'  where each of those sits: its box in the painting (sx0, sy0, sx1, sy1) and its box in the picture (dx0, dy0, dx1, dy1), so the model can
#                 turn a spot on a painting into a spot on the picture
#   'beltTex'     128 x 128, a length of the belt between two studs, mirrored so it repeats without a seam
# The paintings' purple backdrop is painted over with the nearest leather, so an edge of the model that overshoots the painted outline still lands on leather.
# run: python3 -I bake_gear_fox.py && python3 make_jface.py
import json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage

W = '/home/claude/fox3d/'; OUT = W + 'out/fox_tex_own.js'; raw = open(OUT).read(); T = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])

def clean(name, box):
    a = np.asarray(Image.open(W + 'refs/%s.png' % name).convert('RGB').crop(box)).astype(np.int32)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    bg = (R - B < 16) & (R < 120) & (G < R + 6)                    # the purple backdrop and the shadows on it; leather, brass and steel are all redder than they are blue, or bright
    bg = ndimage.binary_dilation(bg, iterations=2)                  # and the soft edge between them
    if bg.all(): return Image.fromarray(a.astype(np.uint8))
    idx = ndimage.distance_transform_edt(bg, return_distances=False, return_indices=True); out = a[idx[0], idx[1]]
    lab, n = ndimage.label(bg); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    for k in range(1, n + 1):                                       # backdrop seen through the piece itself (the holes in the belt, the gap inside a loop) stays a dark hole
        if k in edge: continue
        ys, xs = np.where(lab == k); hh, ww = ys.max() - ys.min() + 1, xs.max() - xs.min() + 1
        if len(ys) >= 150 and max(hh, ww) < 2.2 * min(hh, ww): out[lab == k] = (20, 12, 10)      # (the long thin shadows in the stitching grooves are not holes, and stay leather)
    return Image.fromarray(out.astype(np.uint8))

S = 1024; atlas = Image.new('RGB', (S, S), (74, 44, 28)); layout = {}
REGIONS = [   # name, painting, box in the painting, where it goes (x, y, w, h)
    ('pouchF', 'F7', (140, 296, 500, 904), (0, 0, 303, 512)),
    ('pouchB', 'F7', (1040, 296, 1400, 904), (303, 0, 303, 512)),
    ('pouchS', 'F7', (626, 286, 858, 904), (606, 0, 192, 512)),
    ('sheathF', 'G3', (300, 290, 484, 992), (800, 0, 134, 512)),
    ('sheathS', 'G3', (696, 290, 796, 992), (938, 0, 73, 512)),
    ('tail', 'F7', (1150, 134, 1516, 222), (0, 530, 732, 176)),
    ('plain', 'F7', (1070, 640, 1190, 860), (740, 530, 120, 220)),
    ('strap', 'F7', (252, 134, 420, 222), (0, 720, 672, 352 // 2)),      # a length of belt with two studs, for the pieces that do not repeat
]
for name, src, box, (dx, dy, dw, dh) in REGIONS:
    im = clean(src, box).resize((dw, dh), Image.LANCZOS); atlas.paste(im, (dx, dy)); layout[name] = {'s': list(box), 'd': [dx, dy, dx + dw, dy + dh]}
b = io.BytesIO(); atlas.save(b, 'JPEG', quality=88); T['gear'] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(); T['gearLayout'] = layout; print('gear', len(b.getvalue()) // 1024, 'KB')
atlas.save(W + 'shots/bake_gear.jpg', quality=88)

# the belt's own repeating length: between the studs at x 331 and 418, clear of both, with both rows of stitching; mirrored, then squared up
t = clean('F7', (345, 139, 404, 217)); tw, th = t.size; pair = Image.new('RGB', (tw * 2, th)); pair.paste(t, (0, 0)); pair.paste(t.transpose(Image.FLIP_LEFT_RIGHT), (tw, 0))
bt = pair.resize((128, 128), Image.LANCZOS); b = io.BytesIO(); bt.save(b, 'JPEG', quality=90); T['beltTex'] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(); print('beltTex', len(b.getvalue()) // 1024, 'KB')
bt.save(W + 'shots/bake_belt.png')

js = 'window.FOX_TEX=' + json.dumps(T, separators=(',', ':')) + ';'; open(OUT, 'w').write(js); open(W + 'variants/ownface/fox_tex_own.js', 'w').write(js)
