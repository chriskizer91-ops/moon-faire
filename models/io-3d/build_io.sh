#!/bin/bash
# joins Io's model source. Stage two: body, base outfit, head, glasses, hair and hat; no motion yet.
cd /home/claude/io
python3 tools/tables.py >/dev/null
cat src/00_util.js src/I05_tables.js src/10_geom.js src/20_tex.js src/I21_tex.js src/I30_body.js src/I31_boots.js src/32_hands.js src/I40_head.js src/I42_glasses.js src/I43_hat.js src/I41_hair.js src/I45_robe.js src/I46_gear.js src/I99_static.js > out/io.js
node --check out/io.js && echo "syntax ok: $(wc -c < out/io.js) bytes"
