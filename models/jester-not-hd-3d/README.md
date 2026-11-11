# Jester Witch: the not-HD 3D model

A game character version of the Jester: one skinned model with a standard skeleton, saved as `out/jester.glb`, meant to walk, run, squat, kneel and cast in a 3D world and be seen from every side. It is separate from `models/jester-3d/` (the HD showpiece on branch `claude/jester-3d-model`).

The look to match is Chris's detailed pixel sheets (`refs/sheets/`), not the 128-pixel sprites and not the HD paintings. `refs/gen/A` to `F` are the 30 reference drawings made from the prompt list in the claude.ai Project "Flip Book Art", doc `claude/jester-game-model-reference-prompts.md` (each set also carries the prompts it was made from). The full notes are in that Project, doc `claude/jester-game-model.md`.

Published page ("Jester Witch: not-HD 3D model"): https://claude.ai/artifact/SzipoQiHHriE2AQncBaR4R

## Conventions

Metres, Y up, she faces +Z, +X is her left, soles on y = 0. Top of the cap is 1.66 m. Bones use standard game names (`Hips`, `Spine`, `LeftArm`, `LeftHandIndex1`, `LeftUpLeg` and so on), all with identity rest rotation.

## Build

```
pip install numpy scipy scikit-image pillow xatlas fast-simplification
python3 src/build.py all        # every part, then out/jester.glb (python3 src/build.py body rebuilds one part)
```

- `src/sdf.py`: shapes as distance functions, smooth blends, meshing, thinning, skin weights.
- `src/jester.py`: her measurements, skeleton and parts.
- `src/anim.py`: the pose solver and the movement clips.
- `src/bake.py`, `src/paint.py`: unwrap each part and colour every point of her surface from its position (fabrics, stars, laces, her face from drawing C3).
- `src/cloth.py`: the skirt as thin layered sheets with ragged hems cut by transparency.
- `src/glb.py`, `src/build.py`: the glTF writer and the build itself (`paint` repaints without re-meshing, `none` only rewrites clips).

## Look at it

```
npm install                       # three.js 0.160, playwright-core, gltf-validator
bash tools/setup_viewer.sh        # copies three.js into viewer/lib and the model into viewer/
node tools/smoke.mjs 390x800      # opens the page, presses every button, reports errors
python3 tools/sheet.py work/x.png 500x760 4 0.6 '[{"name":"a","clip":"Walk","t":0.3,"view":"side"}]'   # stills
bash tools/make_dist.sh           # dist/ is what gets published (three.js from jsDelivr, model inside jester_glb.js)
```

The tools use Google Chrome at `/usr/bin/google-chrome`. The artifact host does not serve `.glb` files, so the published page carries the model as text in `jester_glb.js`.
