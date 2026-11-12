# Jester Witch: the not-HD 3D model

A game character version of the Jester: one skinned model with a standard skeleton, saved as `out/jester.glb`, meant to walk, run, squat, kneel and cast in a 3D world and be seen from every side. It is separate from `models/jester-3d/` (the HD showpiece on branch `claude/jester-3d-model`).

The look to match is Chris's detailed pixel sheets (`refs/sheets/`), not the 128-pixel sprites and not the HD paintings. `refs/gen/A` to `F` are the 30 reference drawings made from the prompt list in the claude.ai Project "Flip Book Art", doc `claude/jester-game-model-reference-prompts.md` (each set also carries the prompts it was made from). The full notes are in that Project, doc `claude/jester-game-model.md`.

Published pages: the viewer, "Jester Witch: not-HD 3D model", https://claude.ai/artifact/SzipoQiHHriE2AQncBaR4R, "Jester Witch: the night square", https://claude.ai/artifact/SNNTwQDhYR6WHfKxPxPmjT, and the demo game "Night of No Moon: the square", https://claude.ai/artifact/MVSWShCc6GTQJZCYhGs1fD

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
- `src/cloth.py`: the skirt, veil and ribbon strands as thin layered sheets, with ragged hems and the veil's see-through weave cut by transparency. The veil's shape is worked out by draping a taut cloth over her head, shoulders, arms and skirt.
- `src/chains.py`: the bone chains the cloth hangs on (8 for the skirt, 5 for the veil). Each clip sets them to hang straight down, follow the thighs, trail when she moves and fan out instead of going through the ground. A game engine should drive these bones with its own spring or cloth bones.
- `src/anim.py` also holds her six spells as clips, with the sprite clips' own lengths and release moments (from `assets/manifest.json`). She casts straight ahead (+Z).
- `viewer/fx.js` and `viewer/fx/`: the spell effects (circle, ring, glows, sparkles, bell chain, cut from reference set F), each a pure function of the clip's time. They are part of the page, not of the `.glb`.
- `src/palette.json`: her 56 colours, stored in the `.glb` for the viewer's pixel finish.
- `src/glb.py`, `src/build.py`: the glTF writer and the build itself (`paint` repaints without re-meshing, `none` only rewrites clips).

## Look at it

```
npm install                       # three.js 0.160, playwright-core, gltf-validator
bash tools/setup_viewer.sh        # copies three.js into viewer/lib and the model (as text, in three pieces) into viewer/
node tools/smoke.mjs 390x800      # the viewer: presses every button, plays every clip, reports errors
node tools/smoke_stage.mjs 390x800   # the night square: walks her, casts every spell, flips the switches
node tools/smoke_game.mjs 390x800    # the game: a bot plays it through and reports how it went (add '' careless for a bot that only uses Gilded Rebuke)
python3 tools/sheet.py work/x.png 500x760 4 0.6 '[{"name":"a","clip":"Walk","t":0.3,"view":"side"}]'   # stills of the viewer
node tools/page_shot.mjs stage.html work/s 900x600 '[{"name":"a","js":"J.cast(\"Gravity\");J.run(1.2)"}]'   # stills of any page
bash tools/make_dist.sh           # dist/ (viewer), dist-stage/ (night square) and dist-game/ (the game) are what gets published
```

The pages in `viewer/`:

- `index.html`: the viewer. Every move and spell, straight-on views, your drawing as an overlay, veil and pixel-finish switches.
- `stage.html`: the night square. She walks and runs with a touch pad or the keyboard, the camera follows her, and she casts at a practice dummy.
- `game.html`: Night of No Moon: the square. A three-wave fight against Envoi's wisps, Shadow Wraiths and the great wraith (sprites from `art/foes/`, copied to `viewer/foes/`). Her numbers and what each spell does follow `assets/design/moves_v03.json`; the rules and what was changed for real time are at the top of the script.
- `world.js` builds the night square for both the stage and the game.
- `core.js` loads her and tells spell effects where her hands and her target are. `pipeline.js` draws a frame: bloom on anything brighter than white, and the pixel finish. `fx.js` holds the spell effects.

The tools use Google Chrome at `/usr/bin/google-chrome` and step frames by hand, because software rendering there is far slower than a real screen. The artifact host does not serve `.glb` files and limits a script file to 16 MB, so the published pages carry the model as text in `jester_glb_a.js`, `_b.js` and `_c.js`.
