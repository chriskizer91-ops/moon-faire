#!/bin/bash
# fref.sh prefix -> the face at the angles of the five newer face paintings (in4/), paired with them: shots/<prefix>_1.png and _2.png
cd /home/claude/work
python3 shoot2.py shots/$1 'T.step(60,1/60); T.clean(); T.bare(); 1' 'a:T.face(-0.87,0.0,0.47)' 'b:T.face(0,0.50,0.47)' 'c:T.face(-0.62,-0.05,0.47)' 'd:T.face(0,0.0,0.47)' 'e:T.face(0,-0.80,0.47,620,620,-0.02)' 2>&1 | tail -1
python3 -I - "$1" <<'PY'
import sys
from PIL import Image
S='/home/claude/work/shots/'; R='/home/claude/work/in4/'; pre=sys.argv[1]
pairs=[('face_q_ear','a'),('face_q_low','c'),('face_front','d'),('face_above','b'),('face_below','e')]
m=Image.new('RGB',(620*5,1240))
for i,(r,n) in enumerate(pairs):
    m.paste(Image.open(R+r+'.png').convert('RGB').resize((620,620)),(i*620,0)); m.paste(Image.open(S+pre+'_'+n+'.png'),(i*620,620))
m.crop((0,0,1860,1240)).resize((1395,930)).save(S+pre+'_1.png'); m.crop((1860,0,3100,1240)).resize((930,930)).save(S+pre+'_2.png')
PY
