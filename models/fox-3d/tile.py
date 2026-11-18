# usage: tile.py out.jpg height img1 img2 ...    a row of pictures at one height, to look several over at once
import sys
from PIL import Image
out, h = sys.argv[1], int(sys.argv[2]); ims = []
for f in sys.argv[3:]:
    im = Image.open(f).convert('RGB'); ims.append(im.resize((round(im.width * h / im.height), h), Image.LANCZOS))
W = sum(i.width for i in ims) + 6 * (len(ims) - 1); s = Image.new('RGB', (W, h), (20, 20, 20)); x = 0
for i in ims: s.paste(i, (x, 0)); x += i.width + 6
s.save(out, quality=90); print(out, s.size)
