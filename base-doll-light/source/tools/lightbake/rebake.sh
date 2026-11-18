#!/bin/bash
cd /home/claude/work/lightbake
for c in "$@"; do python3 bake.py $c 2048 > log/$c.bake.log 2>&1 && python3 compare.py $c > log/$c.compare.log 2>&1; echo "$c rebaked: $(tail -1 log/$c.bake.log)"; done
