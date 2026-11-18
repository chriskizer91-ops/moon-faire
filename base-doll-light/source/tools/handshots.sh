#!/bin/sh
# usage: tools/handshots.sh name -> shots/m/<name>.jpg : each hand alone with its arm: back, thumb side, palm, little-finger side
cd /home/claude/io
N=$1
ONLY="T.clean('color'); T.j.pose({arm:15}); T.only(['arm','hand','handR','nail']); T.stage.orbit.target.z = -0.01;"
python3 shoot.py shots/m/${N}_a "$ONLY T.stage.orbit.target.x = 0.255;" b:1.5708,0,0.62,0.79,22,330,560 t:0,0,0.62,0.79,22,330,560 p:-1.5708,0,0.62,0.79,22,330,560 k:3.14159,0,0.62,0.79,22,330,560 > /dev/null 2>&1
python3 shoot.py shots/m/${N}_b "$ONLY T.stage.orbit.target.x = -0.255;" b:-1.5708,0,0.62,0.79,22,330,560 t:0,0,0.62,0.79,22,330,560 p:1.5708,0,0.62,0.79,22,330,560 k:3.14159,0,0.62,0.79,22,330,560 > /dev/null 2>&1
python3 - <<PY
from PIL import Image
N='$N'
im=Image.new('RGB',(330*8,560),(20,18,26))
for i,k in enumerate(['a_b','a_t','a_p','a_k','b_b','b_t','b_p','b_k']): im.paste(Image.open(f'shots/m/{N}_{k}.png'),(i*330,0))
im.save(f'shots/m/{N}.jpg',quality=88)
PY
