#!/bin/bash
# Make dist/: the page as published (three.js from jsDelivr instead of viewer/lib).
set -e
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist/ref
sed -e 's#"./lib/build/three.module.min.js"#"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js"#' \
    -e 's#"./lib/examples/jsm/"#"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"#' viewer/index.html > dist/index.html
! grep -q '"./lib/' dist/index.html
cp viewer/jester_glb.js dist/ && cp viewer/ref/*.png dist/ref/
ls -la dist dist/ref
