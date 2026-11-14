#!/bin/bash
# joins his model source into out/noiz.js, and his baked paintings (out/tex_*.json, from bake_proj.py and bake_face.py) into out/noiz_tex.js
cd "$(dirname "$0")"
python3 -I tools/tables.py >/dev/null || exit 1
cat src/00_util.js src/N05_tables.js src/10_geom.js src/N20_tex.js src/N30_body.js src/32_hands.js src/N40_head.js src/N41_hair.js src/N42_glasses.js src/N45_doll.js src/N80_dust.js src/N99_static.js > out/noiz.js
python3 -I -c "
import json, glob
o = {}
for f in sorted(glob.glob('out/tex_*.json')): o.update(json.load(open(f)))
open('out/noiz_tex.js', 'w').write('window.NOIZ_TEX = ' + json.dumps(o) + ';\\n'); print('paintings:', ', '.join(k for k in o if isinstance(o[k], str) and o[k].startswith('data:')))
"
node --check out/noiz.js && echo "syntax ok: $(wc -c < out/noiz.js) bytes"
