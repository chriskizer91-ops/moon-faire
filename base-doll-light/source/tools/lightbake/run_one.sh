#!/bin/bash
# run_one.sh CODE : the whole light model of one outfit (export, thin, lay flat, bake, compare)
set -e; cd /home/claude/work/lightbake; C=$1
python3 export.py $C > log/$C.export.log 2>&1
python3 npz2raw.py $C > /dev/null
node simplify.mjs $C 50000 > log/$C.simp.log 2>&1
python3 unwrap.py $C 2048 > log/$C.unwrap.log 2>&1
python3 bake.py $C 2048 > log/$C.bake.log 2>&1
python3 compare.py $C > log/$C.compare.log 2>&1
echo "$C done: $(tail -1 log/$C.bake.log)"
