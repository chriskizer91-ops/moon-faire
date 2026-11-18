#!/bin/bash
# builds out/site: index.html (stage and app inlined), fox.js (the model), fox_tex.js (her baked paintings)
cd /home/claude/fox3d && ./build.sh >/dev/null && mkdir -p out/site && cp out/fox.js out/site/fox.js && cp out/fox_tex.js out/site/fox_tex.js && python3 - <<'PY'
t=open('viewer/index.tpl.html').read()
t=t.replace('/*PAL*/',open('out/palette.js').read()).replace('/*FB*/','const FB={clips:{},frames:{}};').replace('/*STAGE*/',open('viewer/stage.js').read()).replace('/*APP*/',open('viewer/app.js').read())
open('out/site/index.html','w').write(t)
# a local copy for testing, with three.js from disk
open('out/site/test_local.html','w').write(t.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','../../node_modules/three/build/three.min.js'))
print('site built', len(t))
PY
node --check out/site/fox.js && ls -la out/site | head -8
