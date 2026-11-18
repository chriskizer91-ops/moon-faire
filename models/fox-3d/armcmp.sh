#!/bin/bash
# usage: armcmp.sh prefix    her arms in painting A1 beside the model's at A1's own scale (861 px a metre, soles on row 1500), one numbered grid
cd /home/claude/fox3d && python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(60, 1/60); r(1); }, 1500))' 'af:T.view(0,0,60,0.8502,1.7034,1024,1536)' 2>&1 | tail -1 && python3 -I - $1 <<'PY'
import sys
from PIL import Image, ImageDraw
W = '/home/claude/fox3d/'
a = Image.open(W + 'refs/A1.png').convert('RGB'); m = Image.open(W + f'shots/{sys.argv[1]}_af.png').convert('RGB')
mm = Image.new('RGB', m.size, (56, 48, 67)); mm.paste(m, (-4, 0)); m = mm                 # A1's centre line is column 508, the render's 512
box = (560, 300, 900, 880); k = 2
A = a.crop(box).resize(((box[2]-box[0])*k, (box[3]-box[1])*k), Image.LANCZOS); M = m.crop(box).resize(A.size, Image.LANCZOS)
sh = Image.new('RGB', (A.width * 2 + 20, A.height), (20, 18, 26)); sh.paste(A, (0, 0)); sh.paste(M, (A.width + 20, 0)); d = ImageDraw.Draw(sh)
for off in (0, A.width + 20):
    for y in range((box[1]//20+1)*20, box[3], 20):
        Y = (y - box[1]) * k; d.line([(off, Y), (off + A.width, Y)], fill=(90, 255, 200) if y % 100 == 0 else (60, 110, 100)); d.text((off + 3, Y + 2), str(y), fill=(255, 255, 160))
    for x in range((box[0]//20+1)*20, box[2], 20):
        X = off + (x - box[0]) * k; d.line([(X, 0), (X, A.height)], fill=(90, 255, 200) if x % 100 == 0 else (60, 110, 100)); d.text((X + 2, 3), str(x), fill=(255, 255, 160))
sh.convert('RGB').save(W + f'shots/{sys.argv[1]}_armcmp.jpg', quality=90); print(sh.size)
PY
