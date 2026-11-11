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
mkdir -p $L/examples/jsm/postprocessing $L/examples/jsm/shaders
cp node_modules/three/examples/jsm/postprocessing/*.js $L/examples/jsm/postprocessing/
cp node_modules/three/examples/jsm/shaders/*.js $L/examples/jsm/shaders/
python3 - <<'PY'
# The page host limits a script file to 16 MB, so the model travels as text in three pieces.
import base64, os, glob
t = base64.b64encode(open('out/jester.glb', 'rb').read()).decode()
for f in glob.glob('viewer/jester_glb*.js'):
    os.remove(f)
h = (len(t) // 3) // 4 * 4 + 4
for k, name in enumerate('abc'):
    open(f'viewer/jester_glb_{name}.js', 'w').write('(window.JESTER_GLB_PARTS = window.JESTER_GLB_PARTS || [])[' + str(k) + '] = "' + t[k * h:(k + 1) * h] + '";\n')
PY
echo "viewer ready"
