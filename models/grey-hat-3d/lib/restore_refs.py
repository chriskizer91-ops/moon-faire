# Rebuild the folder the tools read: PNG copies of his reference paintings, as refs/A1.png ... refs/E8.png (refs/ is not committed).
# Run from anywhere:  python3 -I models/grey-hat-3d/lib/restore_refs.py
import glob, os
from PIL import Image
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
os.makedirs(W + 'refs', exist_ok=True)
for f in sorted(glob.glob(W + 'references/chatgpt/*.webp')): Image.open(f).save(W + 'refs/' + os.path.basename(f)[:-5] + '.png')
print(len(glob.glob(W + 'refs/*.png')), 'paintings in refs/')
