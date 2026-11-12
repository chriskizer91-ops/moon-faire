# Rebuild refs/: PNG copies of the Fox's reference paintings, which the bake and compare scripts read.
# Run from /home/claude/fox3d:  python3 -I lib/restore_fox_refs.py
import glob, os
from PIL import Image
W = '/home/claude/fox3d/'
os.makedirs(W + 'refs', exist_ok=True)
for f in sorted(glob.glob(W + 'references/round*/*.webp')): Image.open(f).save(W + 'refs/' + os.path.basename(f)[:-5] + '.png')
