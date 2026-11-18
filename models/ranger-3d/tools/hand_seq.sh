#!/bin/bash
# hand_seq.sh name move bone az el dist t1 t2 ... : close stills of one hand at chosen moments of a move
cd /home/claude/ranger; name=$1; mv=$2; bone=$3; az=$4; el=$5; dist=$6; shift 6; files=""
for t in "$@"; do python3 shoot.py shots/hs_$t "T.j.seek('$mv', $t); const v = T.aim('$bone'), V0 = T.view; T.view = (az, el, dist, ty, fov, w, h) => V0(az, el, dist, v[1], fov, w, h); 1" v:$az,$el,$dist,0,22,460,460 2>&1 | grep -E "ERR|error"; files="$files shots/hs_${t}_v.png"; done
python3 tools/mont.py shots/$name.jpg $files
