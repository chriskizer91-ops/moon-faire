#!/bin/bash
# usage: wristset.sh prefix [query]   her right wrist and hand, close, from eight sides at rest, then in three moves. For checking the bracelets against her hand.
cd /home/claude/fox3d && Q="$2" python3 shoot2.py shots/$1 'new Promise(r => setTimeout(() => { T.step(90, 1/60); T.clean("color"); r(1); }, 1500))' \
 "a:(T.stage.orbit.target.set(-0.305,0,0.07), T.view(0,0,0.62,0.86,22,300,360))" "b:(T.view(0.785,0,0.62,0.86,22,300,360))" "c:(T.view(1.5708,0,0.62,0.86,22,300,360))" "d:(T.view(2.356,0,0.62,0.86,22,300,360))" "e:(T.view(3.1416,0,0.62,0.86,22,300,360))" "f:(T.view(-2.356,0,0.62,0.86,22,300,360))" "g:(T.view(-1.5708,0,0.62,0.86,22,300,360))" "h:(T.view(-0.785,0,0.62,0.86,22,300,360))" \
 "i:(T.view(-0.9,0.9,0.62,0.86,22,300,360))" "j:(T.view(0.6,-0.7,0.62,0.86,22,300,360))" 2>&1 | tail -1 && python3 sheet.py $1 5
