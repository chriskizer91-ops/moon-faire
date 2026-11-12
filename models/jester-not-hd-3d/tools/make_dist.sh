#!/bin/bash
# Make what gets published: dist/ (the viewer), dist-stage/ (the night square) and dist-game/ (Night of No Moon: the square,
# the turn-based fight in viewer/battle.html; the earlier real-time try, viewer/game.html, is kept but not published).
# All load three.js from jsDelivr instead of viewer/lib, and carry the model as text in jester_glb_a/b/c.js.
set -e
cd "$(dirname "$0")/.."
cdn() { sed -e 's#"./lib/build/three.module.min.js"#"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js"#' \
            -e 's#"./lib/examples/jsm/"#"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"#' "$1" > "$2"; ! grep -q '"./lib/' "$2"; }
for d in dist dist-stage dist-game; do
  rm -rf $d && mkdir -p $d/fx
  cp viewer/jester_glb_?.js viewer/core.js viewer/pipeline.js viewer/fx.js $d/ && cp viewer/fx/*.png $d/fx/
done
cdn viewer/index.html dist/index.html && mkdir -p dist/ref && cp viewer/ref/*.png dist/ref/
cdn viewer/stage.html dist-stage/index.html && cp viewer/world.js dist-stage/
cdn viewer/battle.html dist-game/index.html && cp viewer/world.js viewer/rules.js dist-game/ && mkdir -p dist-game/envoi && cp viewer/envoi/*.js dist-game/envoi/
du -sh dist dist-stage dist-game
