# Rebuild the folder the tools read: PNG copies of the Ranger's reference paintings, as refs/A1.png ... refs/I6.png.
# Run from models/ranger-3d after copying it to /home/claude/ranger:  python3 -I lib/restore_refs.py
import glob, os
from PIL import Image
W = '/home/claude/ranger/'
os.makedirs(W + 'refs', exist_ok=True)
for f in sorted(glob.glob(W + 'references/chatgpt/*.webp')): Image.open(f).save(W + 'refs/' + os.path.basename(f)[:-5] + '.png')
print(len(glob.glob(W + 'refs/*.png')), 'paintings in refs/')
