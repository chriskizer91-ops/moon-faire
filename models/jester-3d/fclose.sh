#!/bin/bash
# fclose.sh prefix -> close views of the face: 3/4, profile, from below, from above; montage <prefix>_c.png
cd /home/claude/work
Q="$2" python3 shoot2.py shots/$1 'T.step(60,1/60); T.clean(); T.bare(); 1' \
 'c1:T.view(-0.66,0.0,0.66,1.438,22,620,620)' 'c2:T.view(-1.5708,0.0,0.66,1.438,22,620,620)' 'c3:T.view(-0.25,-0.62,0.66,1.428,22,620,620)' 'c4:T.view(-0.3,0.72,0.66,1.438,22,620,620)' 'c5:T.view(-1.15,0.0,0.66,1.438,22,620,620)' 'c6:T.view(-0.9,-0.4,0.66,1.428,22,620,620)' 2>&1 | tail -1
python3 lib/montage.py shots/$1_c.png 0.9 shots/$1_c1.png shots/$1_c5.png shots/$1_c2.png
python3 lib/montage.py shots/$1_d.png 0.9 shots/$1_c3.png shots/$1_c6.png shots/$1_c4.png
