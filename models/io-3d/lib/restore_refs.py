# Rebuild the folder the tools read: PNG copies of Io's reference paintings, as refs/A1.png ... refs/E8.png.
# Run from models/io-3d after copying it to /home/claude/io:  python3 -I lib/restore_refs.py
import glob, os
from PIL import Image
W = '/home/claude/io/'
os.makedirs(W + 'refs', exist_ok=True)
for f in sorted(glob.glob(W + 'references/round*/*.webp')): Image.open(f).save(W + 'refs/' + os.path.basename(f)[:-5] + '.png')
print(len(glob.glob(W + 'refs/*.png')), 'paintings in refs/')
