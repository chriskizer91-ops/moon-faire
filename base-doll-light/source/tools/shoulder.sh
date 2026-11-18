#!/bin/sh
# usage: tools/shoulder.sh name -> shots/m/<name>.jpg : her left shoulder close with hair hidden: arm at rest, at 50, straight out, up, forward
cd /home/claude/io
N=$1; HIDE='for (const k of ["tress","tressIn","hairmass","wisp","lock"]) if (T.j.meshes[k]) T.j.meshes[k].visible=false;'
V="f:0,0.05,1.0,1.27,22,400,400 q:0.9,0.15,1.0,1.27,22,400,400 b:3.14159,0.05,1.0,1.27,22,400,400"
i=0
for P in "T.j.pose({arm:15})" "T.j.pose({arm:50})" "T.j.pose({arm:90})" "T.j.pose({arm:150})" "T.j.pose({arm:15}); T.j.SK.uarmL.rotation.x=-1.4; T.j.SK.uarmR.rotation.x=-1.4; T.j.root.updateMatrixWorld(true)"; do
  python3 shoot.py shots/m/${N}_$i "T.clean('color'); $HIDE $P" $V > /dev/null; i=$((i+1))
done
python3 - <<PY
from PIL import Image
N='$N'
im=Image.new('RGB',(2000,1200),(20,18,26))
for i in range(5):
    for j,k in enumerate('fqb'): im.paste(Image.open(f'shots/m/{N}_{i}_{k}.png'),(i*400,j*400))
im.save(f'shots/m/{N}.jpg',quality=86)
PY
