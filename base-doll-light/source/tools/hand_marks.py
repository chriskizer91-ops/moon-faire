# hand_marks.py painting out.jpg marks.json [x0,y0,x1,y1] : draws finger landmarks (root, tip, half width) on a hands painting
import sys, json
from PIL import Image, ImageDraw
src, out, marks = sys.argv[1], sys.argv[2], json.loads(open(sys.argv[3]).read())
im = Image.open(src).convert('RGB'); d = ImageDraw.Draw(im)
import math
for view, col in (('D', (0, 255, 0)), ('P', (255, 255, 0))):
    for k, (bx, by, tx, ty, hw) in marks[view].items():
        ax, ay = tx - bx, ty - by; L = math.hypot(ax, ay); ux, uy = ax / L, ay / L; nx, ny = -uy, ux
        d.line([(bx, by), (tx, ty)], fill=col, width=1)
        for t in (-0.10, 0, 0.5, 1.0):
            w = hw * (1 - 0.14 * max(0, min(1, t))); cx, cy = bx + ax * t, by + ay * t
            d.line([(cx - nx * w, cy - ny * w), (cx + nx * w, cy + ny * w)], fill=(255, 0, 255) if t == 0 else col, width=1)
for name, v in marks.get('lines', {}).items():
    if v[0] == 'h': d.line([(v[2], v[1]), (v[3], v[1])], fill=(0, 255, 255)); d.text((v[2] + 3, v[1] + 2), name, fill=(0, 255, 255))
    else: d.line([(v[1], v[2]), (v[1], v[3])], fill=(0, 255, 255)); d.text((v[1] + 3, v[2] + 2), name, fill=(0, 255, 255))
if len(sys.argv) > 4: im = im.crop([int(v) for v in sys.argv[4].split(',')])
im.save(out, quality=92); print(out, im.size)
