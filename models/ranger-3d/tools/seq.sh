#!/bin/bash
# seq.sh name az el dist ty fov t1 t2 ...  ->  shots/<name>.jpg : one still for each moment of a move, side by side.
# MOVE picks the move (default draw). Times are the move's own seconds. W and H set the size of each still.
# Each line it prints is how far her left and right hands fell short of where they were wanted, in millimetres (0 0 is right).
cd /home/claude/ranger; name=$1; az=$2; el=$3; dist=$4; ty=$5; fov=$6; shift 6; files=""
for t in "$@"; do python3 shoot.py shots/sq_$t "T.j.seek('${MOVE:-draw}', $t); const D = T.j.debug.D; [Math.round(D.missL*1000), Math.round(D.missR*1000)]" v:$az,$el,$dist,$ty,$fov,${W:-560},${H:-760} 2>&1 | grep -E "setup|ERR|error" | sed "s/^/t=$t /"; files="$files shots/sq_${t}_v.png"; done
python3 tools/mont.py shots/$name.jpg $files
