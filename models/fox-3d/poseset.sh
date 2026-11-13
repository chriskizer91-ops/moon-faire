#!/bin/bash
# usage: poseset.sh prefix    eight poses in one strip (shots/prefix_poses.jpg), for a before-and-after look when the pose solver changes
cd /home/claude/fox3d && python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(90, 1/60); r(1); }, 1500))' \
  "p0:T.view(0,0.05,4.6,0.85,22,330,470)" "p1:T.view(Math.PI/2,0.05,4.6,0.85,22,330,470)" \
  "p2:(T.at('wave', 1.0), T.view(0,0.05,4.6,0.85,22,330,470))" "p3:(T.at('curtsey', 1.2), T.view(0.6,0.05,4.6,0.85,22,330,470))" \
  "p4:(T.at('dance', 1.2), T.view(0,0.05,4.6,0.85,22,330,470))" \
  "p5:(T.st('kneel', 1.6), T.step(40, 1/60), T.view(-0.6,0.1,4.6,0.7,22,330,470))" "p6:(T.st('sit_ground', 1.8), T.step(40, 1/60), T.view(-0.6,0.1,4.6,0.6,22,330,470))" \
  "p7:(T.st('squat', 1.8), T.step(40, 1/60), T.view(0.5,0.1,4.6,0.7,22,330,470))" 2>&1 | tail -2 && python3 -I -c "
from PIL import Image
import sys
W='/home/claude/fox3d/shots/'; ims=[Image.open(W+'%s_p%d.png'%(sys.argv[1],k)).convert('RGB') for k in range(8)]
sh=Image.new('RGB',(330*8,470))
for i,im in enumerate(ims): sh.paste(im,(i*330,0))
sh.save(W+'%s_poses.jpg'%sys.argv[1], quality=86)" $1
