import sys
from PIL import Image
out = sys.argv[1]; ims = [Image.open(p).convert('RGB') for p in sys.argv[2:]]
h = max(i.height for i in ims); W = sum(i.width for i in ims)
s = Image.new('RGB', (W, h), (30, 26, 36)); x = 0
for i in ims: s.paste(i, (x, 0)); x += i.width
if s.width > 2000: s = s.resize((2000, round(s.height * 2000 / s.width)), Image.LANCZOS)
s.save(out, quality=90); print(out, s.size)
