#!/bin/bash
# Make what gets published: dist/ (the viewer) and dist-stage/ (the night square).
# Both load three.js from jsDelivr instead of viewer/lib, and carry the model as text in jester_glb_a/b/c.js.
set -e
cd "$(dirname "$0")/.."
cdn() { sed -e 's#"./lib/build/three.module.min.js"#"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js"#' \
            -e 's#"./lib/examples/jsm/"#"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"#' "$1" > "$2"; ! grep -q '"./lib/' "$2"; }
for d in dist dist-stage; do
  rm -rf $d && mkdir -p $d/fx
  cp viewer/jester_glb_?.js viewer/core.js viewer/pipeline.js viewer/fx.js $d/ && cp viewer/fx/*.png $d/fx/
done
cdn viewer/index.html dist/index.html && mkdir -p dist/ref && cp viewer/ref/*.png dist/ref/
cdn viewer/stage.html dist-stage/index.html
ls -la dist dist-stage | grep -v "^total"
