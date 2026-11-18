#!/bin/bash
# usage: headset.sh prefix    her head from the front, three-quarter, side and back, joined into one sheet
cd /home/claude/fox3d && python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(40, 1/60); r(1); }, 1500))' 'h0:T.face(0,0.02,1.25,520,560,0.045)' 'h1:T.face(0.7,0.02,1.25,520,560,0.045)' 'h2:T.face(Math.PI/2,0.02,1.25,520,560,0.045)' 'h3:T.face(Math.PI,0.02,1.25,520,560,0.045)' 2>&1 | grep -v "^build\|^setup" ; python3 -c "
from PIL import Image
ims=[Image.open(f'shots/$1_h{n}.png') for n in range(4)]
sh=Image.new('RGB',(520*4,560)); [sh.paste(im,(i*520,0)) for i,im in enumerate(ims)]; sh.save('shots/$1_heads.png')"
