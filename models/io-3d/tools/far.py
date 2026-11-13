# colours of a smooth still that have no close neighbour among the Flipbook look's colours (claude/HOW-TO-flipbook-look.md, section 7)
# usage: python3 -I tools/far.py out/palette.js still.png [x0,y0,x1,y1]
import sys, json
from collections import Counter
from PIL import Image
s = open(sys.argv[1]).read(); pal = json.loads(s[s.index('['):s.rindex(']') + 1])
near = lambda c: min(sum((a - b) ** 2 for a, b in zip(c, p)) ** .5 for p in pal)
im = Image.open(sys.argv[2]).convert('RGB')
if len(sys.argv) > 3: im = im.crop([int(v) for v in sys.argv[3].split(',')])
im.thumbnail((300, 300)); d = im.tobytes()
n = Counter((d[i] >> 4, d[i + 1] >> 4, d[i + 2] >> 4) for i in range(0, len(d), 3))
far = sorted(((k, c) for c, k in n.items() if near([v * 16 + 8 for v in c]) > 40), reverse=True)[:12]
for k, c in far: print([v * 16 + 8 for v in c], '%.1f%%' % (100 * k / (len(d) / 3)))
print(len(far), 'common colours far from the palette')
