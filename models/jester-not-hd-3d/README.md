# Jester Witch: the not-HD 3D model

A game character version of the Jester: one skinned model with a standard skeleton, saved as `out/jester.glb`, meant to walk, run, squat, kneel and cast in a 3D world and be seen from every side. It is separate from `models/jester-3d/` (the HD showpiece on branch `claude/jester-3d-model`).

The look to match is Chris's detailed pixel sheets (`refs/sheets/`), not the 128-pixel sprites and not the HD paintings. `refs/gen/A` to `F` are the 30 reference drawings made from the prompt list in the claude.ai Project "Flip Book Art", doc `claude/jester-game-model-reference-prompts.md` (each set also carries the prompts it was made from). The full notes are in that Project, doc `claude/jester-game-model.md`.

Published pages: the viewer, "Jester Witch: not-HD 3D model", https://claude.ai/artifact/SzipoQiHHriE2AQncBaR4R, the training square, "Jester Witch: the training square", https://claude.ai/artifact/SNNTwQDhYR6WHfKxPxPmjT, and the demo game "Night of No Moon: the square" (turn-based since November 11), https://claude.ai/artifact/MVSWShCc6GTQJZCYhGs1fD

## The file that is her

Chris said (November 12) that she is the only character for now, and that what is being built is how she looks and moves, not the game she will go in. Balance comes later. So she is kept apart from any game:

- `out/jester.glb`: her body, skeleton, clothes, palette and every movement, with each spell's label and release moment stored inside.
- `viewer/core.js`: loads her and tells an effect where her hands and her target are.
- `viewer/fx.js` (with `viewer/fx/`): what each spell looks like, as a pure function of the clip's time.
- `viewer/moves.js`: when each move lands, how hard, and what it leaves on what it hits (the Doom mark, Doom itself, the quiet of Hush).
- `viewer/pipeline.js`: how a frame is drawn, including the darkness her spells bring down.

The training square (`viewer/stage.html`) is those five files and nothing else: no numbers, no turns. `rules.js` and `battle.html` are one game built on top, and can be thrown away without touching her.

### The look of her power

The four witches are four scales of power: the moment, then nature, then chaos, then infinity. She is infinity. Her spells are not built from light; they open holes in the world with the night sky inside, and the light around them is swallowed. Rules for new effects:

- Black comes first. A spell darkens the square (`out.dim`, which `pipeline.js` turns into real darkness over the stage while she and the effects stay lit), then shows the sky through a hole (`F.voidBall`, `F.voidFlat`, `F.hole`).
- Light is thin and cold: a rim, a hoop, a line. Gold is only a thread (her bells, Gilded Rebuke).
- Dust is round star dust, not four-point sparkles.
- Keep bright things small. Anything much brighter than white over a wide area blooms into a grey haze over the black.
- Doom and Curtain Call are the darkest. Doom is a black hole that takes its target whole. Curtain Call puts the night sky under her feet and across the whole sky, then draws two curtains of night shut.

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
node tools/smoke_stage.mjs 390x800   # the training square: walks her, casts every spell, watches Doom take the dummy, flips the switches
node tools/smoke_battle.mjs 390x800 work/stills   # the turn-based fight: a careful player plays it through, with stills (add: attack, to only attack, or slow, to see the moves a careful player skips; pixel; a number of levels)
node tools/sim_battle.mjs 4000       # the balance simulator: thousands of fights by four kinds of player, on the page's own rules
node tools/smoke_game.mjs 390x800    # the earlier real-time game: a bot plays it through
python3 tools/sheet.py work/x.png 500x760 4 0.6 '[{"name":"a","clip":"Walk","t":0.3,"view":"side"}]'   # stills of the viewer
node tools/page_shot.mjs stage.html work/s 900x600 '[{"name":"a","js":"J.cast(\"Gravity\");J.run(1.2)"}]'   # stills of any page
bash tools/make_dist.sh           # dist/ (viewer), dist-stage/ (training square) and dist-game/ (the turn-based fight) are what gets published
```

The pages in `viewer/`:

- `index.html`: the viewer. Every move and spell, straight-on views, your drawing as an overlay, veil and pixel-finish switches.
- `stage.html`: the training square. She walks and runs with a touch pad or the keyboard, the camera is free (drag to turn, pinch or wheel to move in and out), and a practice dummy stands in the corner. Every spell plays out in full on the dummy: Sealed Fate's mark counts down by itself and Doom takes the dummy (a new one is stood up), Curtain Call lands Doom at once on a marked dummy, Hush leaves it wrapped in quiet. A Slow switch plays everything at a third of the speed.
- `battle.html`: Night of No Moon: the square, the published game. Envoi's first fight (turn gauges, a command menu, Trance, set damage with a swing, 20% growth a level) with the 3D Jester in the witch's place, her six moves as her commands, and two Shadow Wraiths against her (two, so the picture has enough in it to test how it holds up). One pulled-back camera holds the whole field the whole time, leans a little toward whoever is acting, and widens its lens when the edge of the square stops it backing away; dragging the picture turns it. Aimed moves ask which wraith.
  - `rules.js`: every number and rule, with nothing about pictures in it; the page and `tools/sim_battle.mjs` both play from it. The Jester is the most powerful of the four and her power ends fights (Chris, November 11): Doom releases an ordinary foe outright and Curtain Call lands Doom at once. The numbers are placeholders: balance is parked until there is a game for her to go in.
  - `refs/sheets/four-witches-group-and-sheets.png`: Chris's picture of all four with their sheets (sent November 11).
  - `envoi/wraith.js`: Envoi's 3D Shadow Wraith, unchanged (envoi-on-the-longest-night, `src/models/wraith.js`). `envoi/foe.js` fits it to three.js 0.160 and this pipeline (colour textures, glow strength, layers, light units). `envoi/snd.js`: Envoi's synthesized sound effects and battle theme (from `reference/demos/night-square-shadow-wraith.html`), plus the Jester's cues and the chapel bell.
  - The staging (the camera, her casts, the wraiths' four moves, the windows) is in the page. Scripts are generators on a game clock, so the checks can step them by hand.
- `game.html`: the earlier real-time try at the same game, kept but no longer published. A three-wave fight against Envoi's wisps, Shadow Wraiths and the great wraith (sprites from `art/foes/`, copied to `viewer/foes/`). Her numbers and what each spell does follow `assets/design/moves_v03.json`; the rules and what was changed for real time are at the top of the script.
- `world.js` builds the night square for the stage and both games.
- `core.js` loads her and tells spell effects where her hands and her target are. `pipeline.js` draws a frame: the stage, then a darkness over it that a spell asks for, then her and the effects, then bloom on anything brighter than white, and the pixel finish. `fx.js` holds the spell effects.

The tools use Google Chrome at `/usr/bin/google-chrome` and step frames by hand, because software rendering there is far slower than a real screen. The artifact host does not serve `.glb` files and limits a script file to 16 MB, so the published pages carry the model as text in `jester_glb_a.js`, `_b.js` and `_c.js`.
