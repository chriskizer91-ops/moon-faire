# a zoomed, gridded crop of a painting: python3 -I tools/zoomgrid.py refs/A1.png out.png x0,y0,x1,y1 step zoom
import sys
from PIL import Image, ImageDraw
src, out, box, step, s = sys.argv[1], sys.argv[2], [int(v) for v in sys.argv[3].split(',')], int(sys.argv[4]), int(sys.argv[5])
im = Image.open(src).convert('RGB').crop(box); im = im.resize((im.width * s, im.height * s), Image.LANCZOS); d = ImageDraw.Draw(im)
for x in range((box[0] // step + 1) * step, box[2], step):
    X = (x - box[0]) * s; d.line([(X, 0), (X, im.height)], fill=(0, 255, 0) if x % (step * 5) == 0 else (0, 110, 0)); d.text((X + 2, 2), str(x), fill=(255, 255, 0))
for y in range((box[1] // step + 1) * step, box[3], step):
    Y = (y - box[1]) * s; d.line([(0, Y), (im.width, Y)], fill=(0, 255, 0) if y % (step * 5) == 0 else (0, 110, 0)); d.text((2, Y + 2), str(y), fill=(255, 255, 0))
im.save(out)
