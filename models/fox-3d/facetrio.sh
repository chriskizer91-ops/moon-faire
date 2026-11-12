#!/bin/bash
# usage: facetrio.sh prefix     her head with hair and glasses on: front, turned, profile, and laughing  ->  shots/<prefix>_trio.jpg
cd /home/claude/fox3d && V="1.7,1.555,10.5,430,470" && python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(40, 1/60); r(1); }, 1500))' "f1:T.view(0,0,$V)" "f2:T.view(-0.6,0,$V)" "f3:T.view(-Math.PI/2,0,$V)" "f4:(T.at('laugh', 0.70), T.view(0,0,$V))" 2>&1 | tail -1
python3 -c "
from PIL import Image
import sys
n=sys.argv[1]; ims=[Image.open('/home/claude/fox3d/shots/%s_f%d.png'%(n,i)).convert('RGB') for i in range(1,5)]; w,h=ims[0].size; sh=Image.new('RGB',(w*4,h))
for i,im in enumerate(ims): sh.paste(im,(i*w,0))
sh.save('/home/claude/fox3d/shots/%s_trio.jpg'%n, quality=90)" $1
