import sys, json, subprocess, os
from PIL import Image
# usage: sheet.py out.png WxH cols scale '<json shots>'
out, size, cols, scale, shots = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4]), json.loads(sys.argv[5])
d = out + '_d'
r = subprocess.run(['node', os.path.join(os.path.dirname(__file__), 'shot.mjs'), d, size, json.dumps(shots)], capture_output=True, text=True)
msg = '\n'.join(l for l in (r.stdout + r.stderr).splitlines() if 'GL Driver' not in l and '404' not in l)
print(msg)
ims = [Image.open(os.path.join(d, s['name'] + '.png')) for s in shots]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (w * cols, h * rows))
for k, im in enumerate(ims):
    sheet.paste(im, ((k % cols) * w, (k // cols) * h))
sheet = sheet.resize((int(sheet.width * scale), int(sheet.height * scale)), Image.LANCZOS)
sheet.save(out); print(sheet.size)
