#!/bin/bash
# hshots.sh prefix [query]  -> square-on views of the left hand (fingers straight), montage in shots/<prefix>_all.png
cd /home/claude/fox3d
Q="$2" python3 shoot2.py shots/$1 'T.step(30,1/60); T.clean(); T.flat(); T.only(["hand","nail","skin"]); 1' 'back:T.hv("L",-1,0,0);T.shot(0.55,22,700,900)' 'palm:T.hv("L",1,0,0);T.shot(0.55,22,700,900)' 'side:T.hv("L",0,0,1);T.shot(0.55,22,700,900)' 'uln:T.hv("L",0,0,-1);T.shot(0.55,22,700,900)' 'tip:T.hv("L",-0.5,-0.8,0.3);T.shot(0.55,22,700,900)' 2>&1 | tail -3
python3 -I - "$1" <<'PY'
import sys
from PIL import Image
ims=[Image.open('/home/claude/fox3d/shots/%s_%s.png'%(sys.argv[1],n)).rotate(180) for n in ('back','palm','side','uln','tip')]
W=sum(i.width for i in ims); m=Image.new('RGB',(W,900)); x=0
for i in ims: m.paste(i,(x,0)); x+=i.width
m=m.resize((W*45//100,405)); m.save('/home/claude/fox3d/shots/%s_all.png'%sys.argv[1]); print(m.size)
PY
