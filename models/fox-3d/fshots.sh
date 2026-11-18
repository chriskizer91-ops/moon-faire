#!/bin/bash
# fshots.sh prefix [query] -> head from front, 3/4, steep 3/4, side, above, below; montages <prefix>_a.png and <prefix>_b.png
cd /home/claude/fox3d
Q="$2" python3 shoot2.py shots/$1 'T.step(60,1/60); T.clean(); T.bare(); 1' \
 'front:T.view(0,0.0,1.0,1.428,22,560,640)' 'q:T.view(-0.66,0.0,1.0,1.428,22,560,640)' 'q2:T.view(-1.1,0.0,1.0,1.428,22,560,640)' 'side:T.view(-1.5708,0.0,1.0,1.428,22,560,640)' \
 'hi:T.view(-0.3,0.75,1.0,1.428,22,560,640)' 'hi2:T.view(-0.9,0.5,1.0,1.428,22,560,640)' 'lo:T.view(-0.2,-0.6,1.0,1.428,22,560,640)' 'lo2:T.view(-0.9,-0.45,1.0,1.428,22,560,640)' 2>&1 | tail -2
python3 lib/montage.py shots/$1_a.png 0.75 shots/$1_front.png shots/$1_q.png shots/$1_q2.png shots/$1_side.png
python3 lib/montage.py shots/$1_b.png 0.75 shots/$1_hi.png shots/$1_hi2.png shots/$1_lo.png shots/$1_lo2.png
