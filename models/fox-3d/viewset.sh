#!/bin/bash
# usage: viewset.sh prefix    front, side and back of the whole figure, joined into one sheet
cd /home/claude/fox3d && python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(40, 1/60); r(1); }, 1500))' 'front:T.view(0,0.03,5.4,0.86,26,700,900)' 'side:T.view(Math.PI/2,0.03,5.4,0.86,26,700,900)' 'back:T.view(Math.PI,0.03,5.4,0.86,26,700,900)' 2>&1 | tail -4 && python3 -c "
from PIL import Image
ims=[Image.open(f'shots/$1_{n}.png').crop((120,120,580,800)) for n in ['front','side','back']]
sh=Image.new('RGB',(460*3,680)); [sh.paste(im,(i*460,0)) for i,im in enumerate(ims)]; sh.save('shots/$1_sheet.png')"
