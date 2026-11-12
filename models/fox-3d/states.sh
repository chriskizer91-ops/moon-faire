#!/bin/bash
# usage: states.sh prefix     her face at rest, mid-blink, talking and laughing, from the front and turned, in one picture: shots/<prefix>_states.jpg
cd /home/claude/fox3d && V="1.7,1.555,10.5,430,470" && python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(40, 1/60); r(1); }, 1500))' \
 "s1:T.view(0,0,$V)" "s2:T.view(-0.6,0,$V)" \
 "s3:(T.step(Math.max(1, Math.round((2.31 - T.time) * 60)), 1/60), T.view(0,0,$V))" "s4:T.view(-0.6,0,$V)" \
 "s5:(T.at('talk', 0.40), T.view(0,0,$V))" "s6:T.view(-0.6,0,$V)" \
 "s7:(T.at('laugh', 0.70), T.view(0,0,$V))" "s8:T.view(-0.6,0,$V)" 2>&1 | tail -1
python3 -c "
from PIL import Image
import sys
n=sys.argv[1]; ims=[Image.open('/home/claude/fox3d/shots/%s_s%d.png'%(n,i)).convert('RGB') for i in range(1,9)]; w,h=ims[0].size
sh=Image.new('RGB',(w*4,h*2))
for i,im in enumerate(ims): sh.paste(im,((i//2)*w,(i%2)*h))
sh.resize((1480, round(1480*sh.height/sh.width)), Image.LANCZOS).save('/home/claude/fox3d/shots/%s_states.jpg'%n, quality=86)" $1
