# Jester Witch: the not-HD 3D model

Chris's name for this work: "the not HD 3D model of Jester Witch".

- Viewer page: **Jester Witch: not-HD 3D model**, https://claude.ai/artifact/SzipoQiHHriE2AQncBaR4R
- Training page: **Jester Witch: the training square** (the night square, renamed November 12), https://claude.ai/artifact/SNNTwQDhYR6WHfKxPxPmjT
- Demo game: **Night of No Moon: the square** (turn-based), https://claude.ai/artifact/MVSWShCc6GTQJZCYhGs1fD (notes in `claude/night-of-no-moon-the-square.md`)
- Repo: `chriskizer91-ops/moon-faire`, branch **`claude/jester-not-hd-3d-model`**, folder `models/jester-not-hd-3d/` (its `README.md` says how to build and test).
- Step 8 (November 12): her spells redrawn as "infinity", the training square, and the demo fight with two wraiths and one wide camera.
- Steps 1 to 6 built November 11, 2026: body and skeleton; paint and the outfit under the veil; veil, cloth chains and fuller frills; cloth collision and the veil matched to A1; her six spells with effects, and the pixel finish; finer character detail, grander spells and the night square.

## What this is, and how it differs from "Jester Witch 3D"

A separate model from the one in `claude/jester-3d-model.md` (branch `claude/jester-3d-model`). That one is the HD showpiece that plays six fixed clips in its own viewer. This one is a **game character**: one skinned `.glb` with a standard skeleton, meant to walk, run, squat, kneel and cast in a 3D world and be seen from every side. It is to replace the flipbook character of about 400 images.

Chris's decisions (November 11):
- The look to match is his **detailed pixel sheets**, not the 128-pixel sprites and not the HD paintings. The original source painting is for details the sheets don't show.
- All three sheets show the same veil.
- She must be viewable from all sides and able to walk toward and away from the camera.
- Spells need their own animated effects (purple circle, sparkles).
- No ribbon strands beside her head: he asked for them to be removed. The veil should be semi-transparent.
- The spells in the sprite clips are ideas for a direction, not a spec: the game is not made yet. They can be made grander and changed as long as each still reads as what it is.
- He asked for refinement of her boots, face and hands, and more detail on her generally.
- The work lives in its own place in the repo under the name above.
- **She is the most powerful of the four, overwhelmingly so: her power ends fights** (said with his picture of all four and their sheets, kept at `refs/sheets/four-witches-group-and-sheets.png`). The demo game's rules are built on this; see `claude/night-of-no-moon-the-square.md`.
- **November 12: she is the only character for now.** Chris is building the way she looks and moves, not the game she will go in; balance comes later. He wants "the file that is her, all of her moves and how she interacts" as the basis.
- **November 12: the four witches are four scales of power: the moment, then nature, then chaos, then infinity.** She is infinity. Her spells should be more dramatic (not literally more sparkly), and the Doom and Curtain Call kind must be dark and terrifying, like the blackness of interstellar space. That is the inspiration for the look, not the source of her power.
- **November 12: a training area** with free control of the camera and just a dummy in the corner. He said this was the goal in the original concept.

## The file that is her

Kept apart from any game, in `models/jester-not-hd-3d/`:

- `out/jester.glb`: her body, skeleton, clothes, palette and every movement, with each spell's label and release moment stored inside.
- `viewer/core.js`: loads her and tells an effect where her hands and her target are.
- `viewer/fx.js` (with `viewer/fx/`): what each spell looks like.
- `viewer/moves.js`: when each move lands, how hard, and what it leaves on what it hits (the Doom mark, Doom itself, the quiet of Hush).
- `viewer/pipeline.js`: how a frame is drawn, including the darkness her spells bring down.

The training square is those five files and nothing else. The demo fight's rules (`rules.js`) sit on top and can be thrown away without touching her.

## The look of her power (November 12)

Her spells are not built from light. They open holes in the world with the night sky inside, and the light around them is swallowed.

- Each spell darkens the square for real (the stage goes dark while she and the effect stay lit), then shows the sky through a hole: black balls and flat discs with stars inside them.
- Light is thin and cold: a rim, a hoop, a line. Gold is only a thread (her bells, Gilded Rebuke).
- Dust is round star dust, not four-point sparkles. Chris's set F ring and glow pictures are no longer used for these (they are pink sparkle art); the gold bell chain still is.
- **Curtain Call:** every lamp gutters. A new moon the size of a coin is lit between her hands and lifted inside three thin turning rings. The ground under her becomes the night sky. A new moon rises at the far edge of the square and swells until the whole sky behind is stars, with whatever stands there as a black shape against it. On the release two curtains of night sweep shut across the picture, a line of light runs through the dark, and star dust falls as they part.
- **Sealed Fate (Doom):** a hole ringed with a tally opens in her hand and is thrown. It lands as an eclipse over the target's heart, three thin rings clamp shut on it, and the ground under it shows the sky for a moment. The mark then hangs over the target as a small black sun with one point of light for each turn left. **When Doom lands,** a pit opens under the target, a black hole falls onto it and swallows it, and it collapses to a line of light.
- **Gravity:** a small black hole with a lit disc round it gathers over her hand and is dropped; the ground under the target opens.
- **Hush:** a hoop leaves her fingertip, the light round the target is swallowed, and a thin shell closes on its head.
- **Against All Odds:** she stands on the night sky, seven stars come out round her and lines join them into a constellation, inside a thin cold column.
- **Gilded Rebuke:** still the gold bell chain, with a cut of dark that hangs in the air after it.

The rules for adding more are in the folder's `README.md`.

## The training square (November 12)

`viewer/stage.html`, published as **Jester Witch: the training square**. The night square with her alone and a practice dummy in the corner.

- Free camera: drag to turn it, pinch or wheel to move in and out. The pad (or WASD) walks and runs her.
- Six spell buttons. Every spell plays out in full on the dummy: Sealed Fate's mark counts down by itself and Doom takes the dummy (a new one is stood up a few seconds later); Curtain Call on a marked dummy lands Doom at once; Hush leaves it wrapped in quiet for a few seconds.
- A **Slow** switch plays everything at a third of the speed, to study a move.
- No numbers, no turns.

## References

All 30 drawings from `claude/jester-game-model-reference-prompts.md` arrived on November 11 and are in the repo at `models/jester-not-hd-3d/refs/gen/A` to `F` (each set carries the prompts it was made from). Chris keeps them at [left out of this public copy: a folder path on his own computer]. His three sheets and the source painting are in `refs/sheets/`.

- The zipped set A is a **newer generation** than the first A1 he sent in chat (kept as `refs/sheets/A1_first_version.png`): plain cap with no cross, smaller eyes, tear lines under the eyes, arms about 43° from vertical. The model follows the newer set.
- Sets A and B give proportions and the standing pose. C3 gives the face. C1, C2 and C8 give legs, boots and small details. D3 gives fabric colours. D1 and the A set guided the veil. C2 guided the rebuilt boots and C7 the hands. Set F (spell effects on black) supplies the circle, ring, glow and bell-chain pictures. D2 (skirt laid flat), E (running, squatting, kneeling) and C6 (expressions) are not used directly yet.

## State after step 6

- **Skeleton:** 92 bones. The body uses standard game names (`Hips`, `Spine`, `Spine1`, `Spine2`, `Neck`, `Head`, `LeftShoulder`, `LeftArm`, `LeftForeArm`, `LeftHand`, fingers `LeftHandIndex1` to `3`, `LeftUpLeg`, `LeftLeg`, `LeftFoot`, `LeftToeBase`), plus `LeftHorn1` to `3`, `LeftPompom` and `Bells`. Cloth hangs on chains: `SkirtA1`/`SkirtA2` to `SkirtH1`/`SkirtH2` (eight round her hips) and `VeilL`, `VeilBL`, `VeilB`, `VeilBR`, `VeilR` with three bones each (the side ones hang from her arms). Rest rotations are identity.
- **Units and facing:** metres, Y up, she faces +Z, +X is her left, soles on y = 0. Top of cap 1.66 m, horn tops 1.72 m, about 7 heads.
- **Bind pose** is the standing pose of A1 and B1.
- **Parts:** body, head, cap (with a rolled edge round the face), horns and pompoms, hands (thumb mound, painted nails), boots (lugged sole with a taller heel and an arch, welt, eyelets, crossed laces, bow, pull loop), outfit (three-row ruff, puffed sleeves, hollow three-tier cuffs, belt buckle, pouch, bells on bead strings, pendant on a bead chain, cap bow), skirt (five ragged layers), veil (three sheer layers), and `mesh_lids` (closed eyelids, hidden except for a blink).
- **Paint:** every solid part has a baked texture coloured from position in `src/paint.py`, with painted light and shadow (`shade`) so she reads as shaded even under flat light. One "art pixel" is 2 mm on her surface. Her face is projected from C3 onto a head with lips, a nose bridge and shallow eye sockets.
- **Veil:** draped over her head, shoulders, upper arms and skirt, hanging behind her forearms. Its cloth is blended at about 60% (`SHEER` in `src/cloth.py`), with the gold lines and edges solid.
- **Cloth movement:** each clip sets the chains to hang straight down, follow the thighs, trail in the walk and run, keep clear of capsules for her trunk, arms, cuffs, skirt and legs, and fan out on the ground. Baked into the clips; a game engine should drive the same bones with its own spring bones.
- **Six test clips** (Idle, Walk 0.93 m/s, Run 2.6 m/s, Squat, Kneel, ArmsUp) and **six spell clips** with the sprite clips' lengths and release moments: CurtainCall (8.0 s, release 5.17), SealedFate (4.8, 3.0), AgainstAllOdds (8.0, 1.5), GildedRebuke (2.0, 1.0), Hush (4.83, 2.67), Gravity (1.67, 1.11). Poses are read off the sprite frames by eye. She casts straight ahead.
- **Spell effects (as first built on November 11; redrawn November 12, see "The look of her power" above)** live in the pages (`viewer/fx.js`), not in the `.glb`. Each is a pure function of the clip's time, her hand positions and a target point. Building blocks: shader-drawn magic circles that draw themselves in, columns and curtains of light, shock rings, rim-lit shells, a black ball, GPU sparkles (hundreds to 1,200 per burst), and Chris's set F pictures (circle, ring, glows, bell chain). Each spell also reports how far to dim the stage and how hard to shake the camera, and moves one coloured light.
  - Curtain Call: a circle raised into a chandelier of three, the stage dims, curtains of light close behind her on the release, rings sweep out, gold and rose sparkles fall as she bows.
  - Sealed Fate: a seal drawn in her hand, thrown, stamped on the target and locked by three turning rings that clamp shut.
  - Against All Odds: a great circle under her, a column of light, climbing rings, four circling lights, embers spiralling up.
  - Gilded Rebuke: the gold bell chain whirled in a ring of gold and lashed out to the target.
  - Hush: the air stills, a thin ring leaves her fingertip, rings contract on the target and a shell closes round it.
  - Gravity: a black ball with a spinning ring gathers over her hand and is dropped on the target under a falling column.
- **Drawing pipeline** (`viewer/pipeline.js`): effects are brighter than white and a bloom pass makes that glow. Layers: 0 stage, 1 her, 2 stage glows, 3 spell effects.
- **Pixel finish:** she is drawn about 520 rows tall under flat white light, snapped to 56 colours taken from the reference drawings (`src/palette.json`, stored in the `.glb`), given a one-pixel dark outline and scaled up with hard pixels; spell light is drawn small too and added on top. The stage stays smooth.
- **The night square** (`viewer/stage.html`, now the training square): a paved festival square at night built in code (flagstones round a new-moon medallion, lantern posts, bunting, striped tents, stars, a new moon with a burning rim, fireflies). A touch pad or WASD walks and runs her (Shift walks), dragging turns the camera, wheel or pinch zooms, keys 1 to 6 or the buttons cast. She turns to face a practice dummy, which rocks when hit; the camera steps back for the big spells. The square itself is built in `viewer/world.js`.
- **332k triangles**, 17.4 MB. Chris says his phone handles this kind of load easily. Passes the Khronos glTF validator with no errors or warnings. Both pages pass their checks at phone and laptop size (the viewer: every button and clip; the square: walk, look, cast all six, flip the switches).

## The demo game (step 7, November 11)

*Night of No Moon: the square*. Live: https://claude.ai/artifact/MVSWShCc6GTQJZCYhGs1fD. Its notes are in `claude/night-of-no-moon-the-square.md`.

- First version (afternoon): a real-time, three-wave fight against flat pictures of Envoi's foes. Kept as `viewer/game.html`, no longer published.
- Second version (evening), at Chris's request: **turn-based, as Envoi's first fight.** The Jester against Envoi's own 3D Shadow Wraith, with Envoi's turn gauges, command menu, Trance, numbers and sound. `viewer/battle.html`, `viewer/rules.js`, `viewer/envoi/`.

- November 12: two wraiths, a target menu, and one pulled-back camera that holds the whole field (Chris's requests). The numbers are placeholders.

For these the square moved into `viewer/world.js`, spell effects got a name space per spell so several can play at once, and the camera is kept inside the lantern ring.

## Known gaps

- The darkness and bloom of the new spell look were judged from stills made with software rendering. A real screen may show the black as greyer or the thin lights as brighter; the gains are all in `viewer/fx.js`.
- With two wraiths, her, and full-screen dark passes, this is the heaviest the fight page has been.
- None of the three published pages has been opened by Claude: the desktop app's built-in browser is not signed in to claude.ai (checked November 11). Checks run on the same files in headless Chrome with software rendering, which says nothing about speed on a real phone.
- Bloom, 4x anti-aliasing and 332k triangles are the heaviest this has been. If a phone struggles, lower `samples` or the bloom in `pipeline.js` first.
- Cloth collision is by chain, not by point, so a fold between two chains can still clip. With arms raised the veil hangs from her elbows, not her forearms as in A5.
- The face is the front drawing only; C6's expressions are not used beyond the blink. In the pixel finish her face is only a few pixels across at a game distance.
- The movement clips are still test clips. Turning on the spot has no animation, and walk and run are blended by speed without matching their strides.
- The training square uses a practice dummy built in code. Envoi's 3D Shadow Wraith is in the demo game only.
- Sound is in the demo game only (Envoi's, made in the browser), and Claude has not heard it.
- She has no hurt, guard or victory motion of her own; the game makes do with a lean, her squat and the arms-up clip.

## How it is built

Python, no Blender. Everything is in the repo folder.

- `src/sdf.py`: shapes as distance functions, smooth blends, meshing, thinning, skin weights from whichever shape a point belongs to.
- `src/jester.py`: her measurements, skeleton and parts. `px(x, y)` turns a pixel of the first A1 into metres.
- `src/bake.py`, `src/paint.py`: unwrap each part and colour every texel from its 3D position.
- `src/cloth.py`: the skirt and veil as thin sheets.
- `src/chains.py`: the bone chains cloth hangs on, and how each clip poses them.
- `src/anim.py`: the pose solver (two-bone IK, feet placed by heel or ball) and the clips.
- `src/glb.py`, `src/build.py`: the writer and the build (`all`, a part name, `paint`, or `none`).
- `viewer/index.html` (viewer), `viewer/stage.html` (training square) with `viewer/moves.js`, `viewer/battle.html` with `viewer/rules.js` and `viewer/envoi/` (the turn-based demo game), `viewer/game.html` with `viewer/foes/` (the earlier real-time try), `viewer/world.js` (the square), `viewer/core.js` (loading her, spell context), `viewer/pipeline.js` (bloom and pixel finish), `viewer/fx.js` (spells).
- `tools/`: still renders, the checks for every page (`smoke_battle.mjs` plays the turn-based fight, `sim_battle.mjs` is its balance simulator), and `make_dist.sh` for publishing.

The artifact host does not serve `.glb` files, and limits a script file to 16 MB, so the published pages carry the model as base64 text in three script files. The page loads three.js 0.160.0 from jsDelivr.

## What cost time

- skimage's marching cubes already winds faces outward for a field that rises outward.
- A thin raised layer needs to be at least as thick as the mesh step or its edge comes out ragged. Colour edges belong in the texture.
- The repo's `.gitignore` ignores any folder called `build/`, so the code lives in `src/`.
- The walk needs a stride near 1 m per cycle for the knees to straighten.
- With the big cuffs her relaxed arms must hang about 26° out, or the cuffs sink into her hips.
- Headless Chrome's software rendering is far too slow to run the pages in real time with bloom on, so the check tools load `#test` and step frames by hand.
- For the pixel finish to tell her from her spell light, effects must add to colour without adding to alpha (custom blending), and are drawn into their own small target.

## Next steps

1. Real movement clips, using set E for running, squatting and kneeling; a turn on the spot.
2. Expressions from C6 (smile, "oh", concentration) as swappable face patches like the eyelids.
3. Her own hurt, guard and victory motions for battles; Chris's songs under the fight.
4. More of Envoi through the same door as the wraith (`viewer/envoi/foe.js`): the wisp, the great wraith, Halcyon.
5. The other three witches by the same method.
6. Smaller file encoding, so detail can keep growing.

No new reference drawings are needed yet (asked November 11; Chris will run a new prompt list in the same image session if one is written).
