#!/bin/bash
# Put three.js and the built model where the local viewer expects them.
set -e
cd "$(dirname "$0")/.."
L=viewer/lib
mkdir -p $L/build $L/examples/jsm/loaders $L/examples/jsm/controls $L/examples/jsm/utils
cp node_modules/three/build/three.module.min.js $L/build/
cp node_modules/three/examples/jsm/loaders/GLTFLoader.js $L/examples/jsm/loaders/
cp node_modules/three/examples/jsm/controls/OrbitControls.js $L/examples/jsm/controls/
cp node_modules/three/examples/jsm/utils/BufferGeometryUtils.js $L/examples/jsm/utils/
python3 - <<'PY'
# The page host limits a script file to 16 MB, so the model travels as text in two halves.
import base64, os
t = base64.b64encode(open('out/jester.glb', 'rb').read()).decode()
h = (len(t) // 2) // 4 * 4
for name, part in (('a', t[:h]), ('b', t[h:])):
    open(f'viewer/jester_glb_{name}.js', 'w').write('(window.JESTER_GLB_PARTS = window.JESTER_GLB_PARTS || []).push("' + part + '");\n')
if os.path.exists('viewer/jester_glb.js'):
    os.remove('viewer/jester_glb.js')
PY
echo "viewer ready"
