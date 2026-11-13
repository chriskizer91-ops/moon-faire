#!/bin/sh
# usage: tools/armclose.sh name  -> shots/m/<name>.jpg : her left arm close, hair hidden: at rest from four sides, held out front and back, bent
cd /home/claude/io
N=$1; HIDE='for (const k of ["tress","tressIn","hairmass","wisp","lock"]) if (T.j.meshes[k]) T.j.meshes[k].visible=false;'
python3 shoot.py shots/m/${N}_r "T.clean('color'); $HIDE T.j.pose({arm:15})" f:0,0,2.1,1.02,22,420,760 q:0.8,0,2.1,1.02,22,420,760 s:1.5708,0,2.1,1.02,22,420,760 b:3.14159,0,2.1,1.02,22,420,760 | tail -1
python3 shoot.py shots/m/${N}_o "T.clean('color'); $HIDE T.j.pose({arm:90})" f:0,0,2.6,1.30,22,1260,420 b:3.14159,0,2.6,1.30,22,1260,420 | tail -1
python3 shoot.py shots/m/${N}_b "T.clean('color'); $HIDE T.j.pose({arm:15}); (()=>{const S=T.j.SK; S.uarmL.rotation.x=-0.9; S.farmL.rotation.x=-2.0; S.uarmR.rotation.z=-2.3; S.farmR.rotation.x=-0.6; T.j.root.updateMatrixWorld(true);})()" f:0.5,0.05,1.5,1.32,22,560,700 s:1.5708,0.05,1.5,1.32,22,560,700 b:2.7,0.05,1.5,1.32,22,560,700 | tail -1
python3 - <<PY
from PIL import Image
N='$N'
r=[Image.open(f'shots/m/{N}_r_{k}.png') for k in 'fqsb']; o=[Image.open(f'shots/m/{N}_o_{k}.png') for k in 'fb']; b=[Image.open(f'shots/m/{N}_b_{k}.png') for k in 'fsb']
im=Image.new('RGB',(1680,760+420+700),(20,18,26))
for i,x in enumerate(r): im.paste(x,(i*420,0))
for i,x in enumerate(o): im.paste(x.resize((840,280)),(i*840,760+70))
for i,x in enumerate(b): im.paste(x,(i*560,1180))
im.save(f'shots/m/{N}.jpg',quality=86)
PY
