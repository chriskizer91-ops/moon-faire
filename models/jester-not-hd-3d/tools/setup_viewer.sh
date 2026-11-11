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
python3 -c "
import base64
b = open('out/jester.glb', 'rb').read()
open('viewer/jester_glb.js', 'w').write('window.JESTER_GLB=\"' + base64.b64encode(b).decode() + '\";\n')
"
echo "viewer ready"
