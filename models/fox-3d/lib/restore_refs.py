# Rebuild the working folders the bake script reads: PNG copies of the reference paintings.
# Run from models/jester-3d after copying it to /home/claude/fox3d:  python3 -I lib/restore_refs.py
import glob, os
from PIL import Image
W = '/home/claude/fox3d/'
for sub, out in (('chatgpt', 'in'), ('hands', 'in3'), ('faces', 'in4'), ('boots', 'in5')):
    os.makedirs(W + out, exist_ok=True)
    for f in sorted(glob.glob(W + 'references/' + sub + '/*.webp')): Image.open(f).save(W + out + '/' + os.path.basename(f)[:-5] + '.png')
