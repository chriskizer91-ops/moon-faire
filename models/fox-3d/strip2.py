# usage: strip2.py move name rows 'az,el' dist targetY t1 t2 ...   like strip.py, then folded into rows and shrunk to look over -> shots/<name>.jpg   (env OX, TW as strip.py; SC = shrink)
import sys, subprocess, os
from PIL import Image
mv, name, rows = sys.argv[1], sys.argv[2], int(sys.argv[3]); ts = sys.argv[7:]
r = subprocess.run(['python3', '/home/claude/fox3d/strip.py', mv, sys.argv[4], sys.argv[5], sys.argv[6]] + ts, capture_output=True, text=True)
if r.returncode: print(r.stdout[-800:], r.stderr[-800:]); sys.exit(1)
im = Image.open(f'/home/claude/fox3d/shots/strip_{mv}.jpg'); n = len(ts); w = im.width // n; h = im.height; per = -(-n // rows)
s = Image.new('RGB', (w * per, h * rows), (20, 20, 20))
for i in range(rows): s.paste(im.crop((w * per * i, 0, min(im.width, w * per * (i + 1)), h)), (0, h * i))
k = float(os.environ.get('SC', 1)); s = s.resize((int(s.width * k), int(s.height * k))); s.save(f'/home/claude/fox3d/shots/{name}.jpg', quality=88); print(f'shots/{name}.jpg', s.size)
