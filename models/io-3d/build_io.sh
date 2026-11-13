#!/bin/bash
# joins Io's model source. Stage one: body and base outfit, no motion yet.
cd /home/claude/io
python3 tools/tables.py >/dev/null
cat src/00_util.js src/I05_tables.js src/10_geom.js src/20_tex.js src/I21_tex.js src/I30_body.js src/I31_boots.js src/32_hands.js src/I40_head.js src/I99_static.js > out/io.js
node --check out/io.js && echo "syntax ok: $(wc -c < out/io.js) bytes"
