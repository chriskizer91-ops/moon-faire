#!/bin/bash
# usage: handcmp.sh prefix [query]   her hanging arm and hand: painting A1 beside the model (front), painting A2 beside the model (back), all at A1's scale
cd /home/claude/fox3d && Q="$2" python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(60, 1/60); r(1); }, 1500))' 'af:(T.stage.orbit.target.set(0,0,0), T.view(0,0,60,0.8502,1.7034,1024,1536))' 'bk:(T.view(Math.PI,0,60,0.8502,1.7034,1024,1536))' 2>&1 | tail -1 && python3 -I - $1 <<'PY'
import sys
from PIL import Image
W = '/home/claude/fox3d/'; n = sys.argv[1]
a1 = Image.open(W + 'refs/A1.png').convert('RGB'); a2 = Image.open(W + 'refs/A2.png').convert('RGB'); m = Image.open(W + f'shots/{n}_af.png').convert('RGB'); mb = Image.open(W + f'shots/{n}_bk.png').convert('RGB')
bf, bb, k = (640, 480, 880, 880), (140, 480, 380, 880), 1.5
cr = lambda im, b, dx=0: im.crop((b[0] + dx, b[1], b[2] + dx, b[3])).resize((round((b[2] - b[0]) * k), round((b[3] - b[1]) * k)), Image.LANCZOS)
P = [cr(a1, bf), cr(m, bf, 4), cr(a2, bb), cr(mb, bb, -4)]
sh = Image.new('RGB', (sum(p.width for p in P) + 30, P[0].height), (30, 26, 36)); x = 0
for p in P: sh.paste(p, (x, 0)); x += p.width + 10
sh.save(W + f'shots/{n}_handcmp.jpg', quality=90); print(sh.size)
PY
