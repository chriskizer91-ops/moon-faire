#!/bin/bash
# usage: headcmp.sh prefix    her head in painting A1 beside the model's, one scale (A1's pixels x4), one grid; numbers are A1's rows and columns from the face's centre line
cd /home/claude/fox3d && python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(40, 1/60); r(1); }, 1500))' 'hf:T.view(0,0,60,1.5854,0.2994,1120,1080)' 2>&1 | tail -1 && python3 -I - $1 <<'PY'
import sys
from PIL import Image, ImageDraw
a = Image.open('/home/claude/fox3d/refs/A1.png').convert('RGB'); cx, r0, r1 = 508, 0, 270
A = a.crop((cx - 140, r0, cx + 140, r1)).resize((1120, 1080), Image.LANCZOS); M = Image.open(f'/home/claude/fox3d/shots/{sys.argv[1]}_hf.png').convert('RGB')
sh = Image.new('RGB', (2260, 1080), (20, 18, 26)); sh.paste(A, (0, 0)); sh.paste(M, (1140, 0)); d = ImageDraw.Draw(sh)
for r in range(0, 271, 10):
    y = r * 4; d.line([(0, y), (2260, y)], fill=(90, 255, 200) if r % 50 == 0 else (70, 120, 110)); d.text((4, y + 2), str(r), fill=(255, 255, 160)); d.text((1144, y + 2), str(r), fill=(255, 255, 160))
for c in range(-130, 131, 10):
    for off in (0, 1140):
        x = off + 560 + c * 4; d.line([(x, 0), (x, 1080)], fill=(70, 120, 110) if c else (255, 120, 120))
        if c % 20 == 0: d.text((x + 2, 1066), str(c), fill=(255, 255, 160))
sh.resize((1695, 810), Image.LANCZOS).save(f'/home/claude/fox3d/shots/{sys.argv[1]}_headcmp.png')
PY
