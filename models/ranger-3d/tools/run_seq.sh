#!/bin/bash
# run_seq.sh name az el dist ty fov t1 t2 ...  ->  shots/<name>.jpg : stills of a move as it really plays, stepped from the start.
# FROM is the move she is in first (held 3 seconds, default idle), MOVE the one she goes to; times are real seconds after the change.
# Use this for the postures (kneel, squat, sit, hover, fall), which slide in and out; seq.sh jumps straight to the finished posture.
cd /home/claude/ranger; name=$1; az=$2; el=$3; dist=$4; ty=$5; fov=$6; shift 6; files=""
for t in "$@"; do python3 shoot.py shots/rq_$t "T.stage.orbit.target.x = ${TX:-0}; T.j.play('${FROM:-idle}'); for (let i = 0; i < 180; i++) T.j.animate(1 / 60); T.j.play('${MOVE:-kneel}'); for (let i = 0; i < Math.round($t * 60); i++) T.j.animate(1 / 60); T.j.root.updateMatrixWorld(true); const D = T.j.debug.D; [Math.round(D.missL*1000), Math.round(D.missR*1000), Math.round(D.missLeg*1000)]" v:$az,$el,$dist,$ty,$fov,${W:-560},${H:-760} 2>&1 | grep -E "setup|ERR|error" | sed "s/^/t=$t /"; files="$files shots/rq_${t}_v.png"; done
python3 tools/mont.py shots/$name.jpg $files
