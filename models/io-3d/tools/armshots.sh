#!/bin/sh
# usage: tools/armshots.sh name   -> shots/m/<name>.jpg : her arms from several sides, at rest, out, forward, bent
cd /home/claude/io
N=$1
python3 shoot.py shots/m/${N}_r 'T.clean("color"); T.j.pose({arm:15})' f:0.5,0.05,1.5,1.18,22,520,640 b:2.6,0.05,1.5,1.18,22,520,640 s:1.5708,0.0,1.5,1.18,22,520,640 | tail -1
python3 shoot.py shots/m/${N}_o 'T.clean("color"); T.j.pose({arm:90}); ' f:0.25,0.1,1.7,1.30,22,900,420 b:2.9,0.1,1.7,1.30,22,900,420 | tail -1
python3 shoot.py shots/m/${N}_b 'T.clean("color"); T.j.pose({arm:15}); (()=>{const S=T.j.SK; S.uarmL.rotation.x=-1.0; S.farmL.rotation.x=-1.9; S.uarmR.rotation.x=-1.5; S.uarmR.rotation.z=-0.2; S.farmR.rotation.x=-0.5; T.j.root.updateMatrixWorld(true); if (T.j.settle) T.j.settle();})()' f:0.6,0.1,1.6,1.25,22,520,640 s:1.5708,0.05,1.6,1.25,22,520,640 r:-1.2,0.05,1.6,1.25,22,520,640 | tail -1
python3 - <<PY
from PIL import Image
N='$N'
r=[Image.open(f'shots/m/{N}_r_{k}.png') for k in 'fbs']; o=[Image.open(f'shots/m/{N}_o_{k}.png') for k in 'fb']; b=[Image.open(f'shots/m/{N}_b_{k}.png') for k in 'fsr']
im=Image.new('RGB',(1560,640+420+640),(20,18,26))
for i,x in enumerate(r): im.paste(x,(i*520,0))
for i,x in enumerate(o): im.paste(x.resize((780,364)),(i*780,640+28))
for i,x in enumerate(b): im.paste(x,(i*520,1060))
im.save(f'shots/m/{N}.jpg',quality=86)
PY
