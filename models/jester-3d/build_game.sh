#!/bin/bash
# builds out/game: the page for her moves in the game. The same model, stage and square as the night square page (build_site.sh), with viewer/game.js in place of viewer/app.js.
cd /home/claude/work && ./build.sh >/dev/null && rm -rf out/game/fb && mkdir -p out/game/fb && cp out/jester.js out/game/jester.js && cp out/jester_tex.js out/game/jester_tex.js && python3 - <<'PY'
import json, shutil
# only the flipbook frames this page can show: standing, walking and Gilded Rebuke
fb=json.load(open('out/fb.json'))
for n in sorted({n for c in ('idle','walk','gilded_rebuke') for n in fb['clips'][c]['frames']}): shutil.copy('out/fb/%s.webp'%n, 'out/game/fb/%s.webp'%n)
t=open('viewer/game.tpl.html').read()
t=t.replace('/*PAL*/',open('out/palette.js').read()).replace('/*FB*/','const FB='+open('out/fb.json').read()+';').replace('/*STAGE*/',open('viewer/stage.js').read()).replace('/*SQUARE*/',open('viewer/square.js').read()).replace('/*GAME*/',open('viewer/game.js').read())
open('out/game/index.html','w').write(t)
# a local copy for testing, with three.js from disk
open('out/game/test_local.html','w').write(t.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','../../node_modules/three/build/three.min.js'))
print('game page built', len(t))
PY
node --check out/game/jester.js && ls out/game | head -6
