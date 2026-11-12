# Ranger 3D model

The code-built three.js (r128) model of the Ranger, made the same way as the Jester's (`models/jester-3d/`), with Chris's
paintings baked on as textures. The method is the claude.ai Project "Flip Book Art", doc `claude/HOW-TO-3d-witch-models.md`.
Published at https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (republish every stage to that link). Project notes:
`claude/ranger-3d-stage1-body.md` and `claude/ranger-3d-stage2-head.md`.

## Where she stands: stage two (November 12, 2026)

Body, base outfit, head, face, hair, headband and glasses, standing still. 328,588 triangles.

- **Approved by Chris (November 12): her body and base outfit** ("This looks very good so far"). Do not reshape them without asking.
- Stage two, waiting for his notes: face, ears, hair with the bun, headband with knot, tails, gem and drop, glasses, loose locks,
  and a wrist that joins the hand.

Rough or not built yet: her face does not move (no blink, no expressions); the hair has a smooth edge with none of the painted
flyaway wisps, and the loose locks are simple; earrings and necklaces; painted arms and hands; the strap hooks as real objects,
belts, satchel, pouch, charms, bracelets; sleeves and headband tails as hanging cloth; bow, sword, knives; all movement and spells.

## What is here

- `src/`: the model, in parts that `build_r.sh` joins into `out/ranger.js` (`makeRanger(opts)`).
  - `00_util.js`, `10_geom.js`, `20_tex.js`, `32_hands.js`: the Jester's engine, with small changes (her knee height and
    shoulder place in `10_geom.js`, `window.RANGER_TEX` in `20_tex.js`).
  - `R05_tables.js`: her body tables. Written by `tools/tables.py`; do not edit by hand.
  - `R21_tex.js`: pictures drawn in code: sock knit, boot leather, sole, the strands of the loose locks, the turquoise.
  - `R30_body.js`: torso, arms and wrists, lace sleeves, legs and the legs of the shorts.
  - `R31_boots.js`: boots and socks, reshaped from the Jester's `31_boots.js`.
  - `R40_head.js`: head, face mix, ears, neck.
  - `R41_hair.js`: hair with the bun, headband with knot and tails, the gem and its drop, loose locks.
  - `R42_glasses.js`: glasses.
  - `R99_static.js`: materials, binding and `pose({arm, leg})`. This stands in for the animation files until they are brought over.
- `tools/tables.py`: the one place her body tables live. The model and the body bake both read them.
- `tools/sil.py`: lifts a figure off a painting's flat background. `tools/measure.py` and `tools/more.py` print widths and depths
  by height. `tools/cmp_r.py` puts the model beside a painting at one scale with the two outlines laid over each other.
  `tools/mont.py` joins pictures side by side. `lib/grid.py` puts a labelled grid on a painting for reading points off it.
- `tools/prof_r.py`: traces her profile off C3 and prints the `MID` table. `tools/prof_cmp_r.py`: the painted profile beside the
  model's, millimetre by millimetre. `tools/cmp_head.py`: her head beside C3 from the side or the front, outlines overlaid.
- `bake_ranger.py`: body textures. `bake_head.py`: head textures, added to the same file. Both write `out/ranger_tex.js`
  (`window.RANGER_TEX`).
- `out/ranger_tex.js`: the baked textures in the published page (made from the original PNGs). `out/palette.js`: stage colours.
- `viewer/stage.js`: the lit stage, as in the Jester's viewer. `viewer_r/index.tpl.html`: her page.
- `build_single_r.py`: makes the one offline file. `test_r.html`, `shoot.py`, `shoot_page_r.py`: headless render and page tests
  (Playwright with Chrome and SwiftShader).
- `references/chatgpt/`: her 67 reference paintings, named by code (A1 to I6), as WebP at quality 95.
  `references/ranger-3d-reference-prompts.md`: the prompts that made them, and what each code is.
  `lib/restore_refs.py` turns the paintings back into the PNG folder (`refs/`) the tools read.

Not kept here: scratch renders, and the rest of the Jester's engine (cloth, animation, moves, spells, the full viewer). Copy
those from `models/jester-3d/` when their stage comes.

## Her measurements

Every full figure is 1.665 m from the top of her hair to her soles.

| Painting | Pixels per metre | Fixed points |
|---|---|---|
| A1 (master, front) | 898 | centre x 512.5, soles y 1507 |
| B1 front / back | 591.6 | centre x 484.0 / 1049.0, soles y 998 |
| B2 left-facing / right-facing | 592.2 / 592.8 | centre x 488.9 / 1048.0 |
| B3 (legs, front) | 898 | centre x 308.0, soles y 961 |
| C1 (face, front) | 4541 | middle x 633.5, eyes y 628 |
| C3 profile (right figure) | 1837 | eye y 381, tip of the nose x 1498 |
| C3 front (left figure) | about 1970 | middle x 287.5, eyes y 384 |
| C5 from behind (middle figure) | 2000 across, 1836 up | middle x 782, knot y 415 |
| C8 from above | 4200 across, 3393 front to back | middle x 647, front of the band y 790 |

Body heights in metres: boot collar 0.236, sock 0.204 to 0.316, calf widest 0.425, knee 0.51, hem of the shorts 0.75 to 0.774,
hips widest 0.80 to 0.85, waist 1.10, bust 1.215, shoulder joint 1.30 (0.150 out from the middle, 0.020 back).

Head heights: under the chin 1.405, mouth 1.4494, under the nose 1.466, tip of the nose 1.4805, eyes 1.512, brows 1.525, ear 1.4636
to 1.5218, middle of the headband on the forehead 1.589, knot at the nape 1.4935, top of the bun about 1.67. Her pupils are 61 mm
apart. Forward of the body's middle line: tip of the nose 0.107, ear line -0.0215. The scale of C1 comes from her pupils (61 mm in
A1 and B1); the scale of the profile comes from eye-to-chin being the same as in C1.

In the side paintings she leans: her hips are about 5.7 cm ahead of her shins in B2. The model stands upright, and the bakes
take the lean out. Her arms keep the Jester's bone lengths (0.63 m; the paintings give about 0.60 m).

## How the body is made (stage one)

- **Torso.** A stack of rings from `TORSO` in `tools/tables.py` (half-width, front depth and back depth at each height), with the
  bust added as two soft mounds (`BUST`). It wears one picture, 2048 x 1408, that runs right round her from the middle of her
  back. The bake fills that picture from four views, B1 front and back and B2 both sides, using each view where the surface
  faces it. Above the collarbones it fades to plain chest skin, so painted hair and shadow do not land on the neck.
- **Shorts.** Their legs are short cuffs that sit just outside the leg and wear the same picture as the torso.
- **Leggings.** One tube per leg from `LEG`. The picture is her sleeve lace (F11) over toned-down skin, following B3.
- **Sleeves.** Lace cylinders that follow the upper arm, see-through where the lace has holes. Stiff until the cloth stage.
- **Boots and socks.** The Jester's boot, made lower and a little shorter, with a thicker lugged sole and nine eyelets.

## How the head is made (stage two)

- **Shape** (`headPoint` in `src/R40_head.js`, after the Jester's). Rings by height. `MID` is her profile down the middle of her
  face, traced from C3; the nose and lips are whatever stands off a smooth line under them and die away sideways (`NOSE_W`).
  `FACE_W` is half the width of her face at each height, read off C1. `FACE_V` says how the face turns back toward the ears.
  Brows, eye sockets, cheekbones and the wings of the nose are small mounds placed from the landmarks in `FC`. Below the ears the
  back of each ring tucks in to the neck, so the jaw has a corner and there is no skull behind it.
- **Face paint.** One material mixes three pictures by which way the skin faces: C1 from the front, the C3 profile on the sides,
  and plain skin under the jaw. In the bake, C1's rows are moved a little so eyes, nose, mouth and chin sit at the profile's
  heights (`ANCH` in `bake_head.py`). Headband, gem and earrings are painted out of both pictures: they are real objects.
- **Ears.** A dished shell on each side wearing the profile painting; the painted ear under it on the head is blanked.
- **Hair** (`src/R41_hair.js`). One shell: the head grown outward by a thickness that is small where the band presses it and
  lifts behind the band, plus a mound for the bun (`BUN_D`, `BUN`), narrower side to side than it is tall. It wears four paintings
  at once, each laid on from its own side (C3 profile, C3 front, C5 from behind, C8 from above) and mixed in the hair material by
  which way the hair faces. In each, the band is painted out with the hair next to it folded over, and everything outside the
  hair is filled from well inside it.
- **Headband.** A strip wrapped round the hair in a tilted plane, from high on the forehead down behind the ears to the knot at
  the nape (`BAND`). Its picture is the flat strip in F2, mirrored each way from the gem. Knot and two stiff tails at the back.
- **Gem.** Turquoise dome, gold rim, ring of beads, leaves, and the drop that rests on her forehead.
- **Loose locks.** Eight on each side: flat twisting ribbons wearing fine strands with gaps, drawn in code.
- **Glasses.** Wire rims a little wider than tall (46 by 39 mm, from C2), bridge, pads, arms over the ears, lilac lenses.
- **Wrists.** The forearm narrows to 5.3 cm two centimetres above the joint, then widens and flattens into the heel of the hand
  and runs on inside it. The heel's size and place were measured off the hand mesh. The hands themselves were not changed.

## Checking

- Body outlines, model against painting (`tools/cmp_r.py`): front (B1) hips 0.376 m wide against 0.386, waist 0.204 against 0.202,
  calves 0.116 against about 0.119; side (B2) hips 0.238 m deep against 0.234, bust 0.235 against 0.239, thigh 0.176 against 0.182,
  knee 0.131 against 0.134, calf 0.123 against 0.130.
- Profile (`tools/prof_cmp_r.py`): from brow to chin the model's middle line is within 0.4 mm of the painted one. Under the band
  the forehead is about 1 mm full, and the last few millimetres under the chin are not matched.
- Head outlines (`tools/cmp_head.py`): from the side the face, the top of the hair and the bun follow C3. From the front the
  painted loose hair spreads about 1.5 cm wider on each side than the model's, and C3's front view is a little larger than C1.
- The page was run in a headless browser at phone and laptop size (`shoot_page_r.py`): no errors, nothing off the side of the
  screen, every button pressed, and a drag turns her. Not checked: on a real phone.

Known rough spots: the sides of the torso under the arms are filled in from thin evidence; the painted strap hooks are flat;
the shins are straight where the front painting has them angled a little outward; the hair just behind the band is folded-over
texture, which can read as crimped; a faint line remains where forearm skin meets hand skin until both are painted; a pale smudge shows at the base of the back of her neck, left from stage one.

## Building

The scripts use the absolute path `/home/claude/ranger`. In a fresh session:

```
mkdir -p /home/claude/ranger && cp -r models/ranger-3d/. /home/claude/ranger/ && cd /home/claude/ranger
npm install three@0.128.0 playwright
mkdir -p shots deliver
python3 -I lib/restore_refs.py        # PNG copies of the paintings into refs/
python3 -I bake_ranger.py             # out/ranger_tex.js: body (needs Pillow, numpy, scipy)
python3 -I bake_head.py               # adds the head, hair and band pictures to it (also needs opencv)
./build_r.sh                          # tools/tables.py, then out/ranger.js
python3 -I build_single_r.py          # deliver/Ranger_3D_stage2.html, one offline file
python3 tools/prof_cmp_r.py           # painted profile against the model's
python3 tools/cmp_head.py shots/ch_side.jpg side      # head beside C3 with outlines; also front
python3 tools/cmp_r.py shots/cmp_front.jpg front      # body beside B1 with outlines; also back, sideR, sideL
python3 shoot.py shots/x 'T.j.pose({arm:24,leg:3})' face:0,0,1.25,1.53,22,520,600   # a still; angles are in radians
python3 shoot_page_r.py               # the real page at phone and laptop size (slow: run it in the background)
```

Always run `bake_ranger.py` before `bake_head.py`: the second adds to the file the first writes. Baking from the WebP copies
gives pictures a hair different from the ones kept in `out/` (those came from the original PNGs). The paintings are data: run
Python that reads them with `-I`.

## Next stages

In the order of the how-to: hands and painted arms (D1, D2); boots against E1 to E8 once more; strap hooks, belts, satchel and
pouch as solid things; sleeves and headband tails as cloth; necklaces, earrings, charms and bracelets; bow, sword and knives
(G1 to G7); then the Jester's body moves in her clothes; a face that blinks and changes expression (C10, C11); then her own moves
and spells with their effects (I1 to I6); then the full page.

Waiting on Chris: his notes on her head, and the choices listed in the project docs.
