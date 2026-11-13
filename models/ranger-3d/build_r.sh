#!/bin/bash
# joins the Ranger's model source. "static" (the default for now) is stage one: body and base outfit, no motion yet.
cd /home/claude/ranger
python3 tools/tables.py >/dev/null
cat src/00_util.js src/R05_tables.js src/10_geom.js src/20_tex.js src/R21_tex.js src/R30_body.js src/R31_boots.js src/32_hands.js src/R40_head.js src/R41_hair.js src/R42_glasses.js src/R45_gear.js src/R99_static.js > out/ranger.js
node --check out/ranger.js && echo "syntax ok: $(wc -c < out/ranger.js) bytes"
