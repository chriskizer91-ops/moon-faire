#!/bin/bash
cd /home/claude/work/lightbake
for C in "$@"; do node simplify.mjs $C 50000 > log/$C.simp.log 2>&1; python3 unwrap.py $C 2048 > log/$C.unwrap.log 2>&1; python3 bake.py $C 2048 > log/$C.bake.log 2>&1; python3 compare.py $C > log/$C.compare.log 2>&1; echo "$C redone: $(head -1 log/$C.simp.log) | $(tail -1 log/$C.bake.log)"; done
