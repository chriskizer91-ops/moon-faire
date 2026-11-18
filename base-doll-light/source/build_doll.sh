#!/bin/bash
# the base doll: Io's model with her bare one-skin body (D30_doll.js), built into out/doll.js
cd /home/claude/io
cat src/00_util.js src/I05_tables.js src/10_geom.js src/20_tex.js src/I21_tex.js src/I30_body.js src/I31_boots.js src/32_hands.js src/D30_doll.js src/D50_wear.js src/I40_head.js src/I42_glasses.js src/I43_hat.js src/D41_hair.js src/I45_robe.js src/I46_gear.js src/I47_props.js src/I98_fx.js src/I98b_wood.js src/I98c_garden.js src/I98d_thorn.js src/D95_wardrobe.js src/D99_static.js > out/doll.tmp.js
node --check out/doll.tmp.js && mv out/doll.tmp.js out/doll.js && echo "syntax ok: $(wc -c < out/doll.js) bytes"
