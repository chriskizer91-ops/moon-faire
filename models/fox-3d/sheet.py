# usage: sheet.py prefix cols [names...]   joins shots/prefix_<name>.png into shots/prefix.jpg (all of them in name order if no names are given)
import sys, glob
from PIL import Image
pre, cols = sys.argv[1], int(sys.argv[2]); names = sys.argv[3:]
fs = [f'/home/claude/fox3d/shots/{pre}_{n}.png' for n in names] if names else sorted(glob.glob(f'/home/claude/fox3d/shots/{pre}_*.png'))
ims = [Image.open(f).convert('RGB') for f in fs]; w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (w * cols, h * rows), '#222')
for i, im in enumerate(ims): S.paste(im, ((i % cols) * w, (i // cols) * h))
S.save(f'/home/claude/fox3d/shots/{pre}.jpg', quality=88); print(len(ims), S.size)
