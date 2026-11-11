#!/bin/bash
# builds out/site: index.html (stage and app inlined), jester.js (the model), fb/ (flipbook frames)
cd /home/claude/work && ./build.sh >/dev/null && cp out/jester.js out/site/jester.js && cp out/jester_tex.js out/site/jester_tex.js && python3 - <<'PY'
t=open('viewer/index.tpl.html').read()
t=t.replace('/*PAL*/',open('out/palette.js').read()).replace('/*FB*/','const FB='+open('out/fb.json').read()+';').replace('/*STAGE*/',open('viewer/stage.js').read()).replace('/*APP*/',open('viewer/app.js').read())
open('out/site/index.html','w').write(t)
# a local copy for testing, with three.js from disk
open('out/site/test_local.html','w').write(t.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','../../node_modules/three/build/three.min.js'))
print('site built', len(t))
PY
node --check out/site/jester.js && ls -la out/site | head -8
