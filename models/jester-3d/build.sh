#!/bin/bash
# concatenates the model source; pass "tmp" to use the temporary finish file
cd /home/claude/work
if [ "$1" = "tmp" ]; then cat src/00_util.js src/10_geom.js src/20_tex.js src/30_body.js src/40_head.js src/99_finish_tmp.js > out/jester.js
else cat src/[0-8]*.js src/90_api.js > out/jester.js; fi
node --check out/jester.js && echo "syntax ok: $(wc -c < out/jester.js) bytes"
