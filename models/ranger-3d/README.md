# Ranger 3D model

The code-built three.js (r128) model of the Ranger, made the same way as the Jester's (`models/jester-3d/`), with Chris's
paintings baked on as textures. The method is the claude.ai Project "Flip Book Art", doc `claude/HOW-TO-3d-witch-models.md`.
Published at https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (republish every stage to that link). The notes for this stage
are in the project doc `claude/ranger-3d-stage1-body.md`.

## Where she stands: stage one (November 12, 2026)

Her body and base outfit, standing still. 188,076 triangles.

Built:

- Body proportions measured off her paintings (A1, B1, B2, B3).
- Corset, lace top and shorts: the paintings wrapped right round her torso (front, back and both sides).
- Leggings: her sleeve lace laid over her skin.
- Boots and scrunched socks, built to B3 and the eight boot paintings (E1 to E8), with nine rows of eyelets as painted.
- Lace sleeves, stiff for now.

Placeholders: the head is a plain form with no face. Arms and hands are plain skin.

Not built yet: face, hair, headband, glasses; painted arms and hands; the strap hooks as real objects, belts, satchel, pouch,
charms, necklaces, bracelets; sleeves as hanging cloth; bow, sword, knives; all movement and spells.

## What is here

- `src/`: the model, in parts that `build_r.sh` joins into `out/ranger.js` (`makeRanger(opts)`).
  - `00_util.js`, `10_geom.js`, `20_tex.js`, `32_hands.js`: the Jester's engine, with small changes (her knee height and
    shoulder place in `10_geom.js`, `window.RANGER_TEX` in `20_tex.js`).
  - `R05_tables.js`: her body tables. Written by `tools/tables.py`; do not edit by hand.
  - `R21_tex.js`: sock knit, boot leather and sole pictures.
  - `R30_body.js`: torso, arms, lace sleeves, legs and the legs of the shorts.
  - `R31_boots.js`: boots and socks, reshaped from the Jester's `31_boots.js`.
  - `R40_head.js`: the plain head form and the neck.
  - `R99_static.js`: materials, binding and `pose({arm, leg})`. This stands in for the animation files until they are brought over.
- `tools/tables.py`: the one place her body tables live (torso, bust, legs, knee, shoulder). The model and the bake both read them.
- `tools/sil.py`: lifts a figure off a painting's flat background. `tools/measure.py` and `tools/more.py` print widths and depths
  by height. `tools/cmp_r.py` puts the model beside a painting at one scale with the two outlines laid over each other.
  `tools/mont.py` joins pictures side by side.
- `bake_ranger.py`: turns the paintings into `out/ranger_tex.js` (`window.RANGER_TEX`): the picture that wraps her torso, her lace,
  the leggings and her skin colours.
- `out/ranger_tex.js`: the baked textures in the published page (made from the original PNGs). `out/palette.js`: stage colours.
- `viewer/stage.js`: the lit stage, as in the Jester's viewer. `viewer_r/index.tpl.html`: her stage-one page.
- `build_single_r.py`: makes the one offline file. `test_r.html`, `shoot.py`, `shoot_page_r.py`: headless render and page tests
  (Playwright with Chrome and SwiftShader).
- `references/chatgpt/`: her 67 reference paintings, named by code (A1 to I6), as WebP at quality 95.
  `references/ranger-3d-reference-prompts.md`: the prompts that made them, and what each code is.
  `lib/restore_refs.py` turns the paintings back into the PNG folder (`refs/`) the tools read.

Not kept here: scratch renders, and the rest of the Jester's engine (cloth, animation, moves, spells, the full viewer). Copy
those from `models/jester-3d/` when their stage comes.

## Her measurements

Every full figure is 1.665 m from the top of her hair to her soles. Her eye line is at 1.50 m, the same as the Jester's.

| Painting | Pixels per metre | Centre line (x) | Soles (y) |
|---|---|---|---|
| A1 (master, front) | 898 | 512.5 | 1507 |
| B1 front / back | 591.6 | 484.0 / 1049.0 | 998 |
| B2 left-facing / right-facing | 592.2 / 592.8 | 488.9 / 1048.0 | |
| B3 (legs, front) | 898 | 308.0 | 961 |

Heights in metres: boot collar 0.236, sock 0.204 to 0.316, calf widest 0.425, knee 0.51, hem of the shorts 0.75 (inside) to
0.774 (outside), hips widest 0.80 to 0.85, waist 1.10, bust 1.215, shoulder joint 1.30 (0.150 out from the middle, 0.020 back).

In the side paintings she leans: her hips are about 5.7 cm ahead of her shins in B2. The model stands upright, and the bake
takes the lean out (`LEAN` in `bake_ranger.py`). Her arms keep the Jester's bone lengths (0.63 m; the paintings give about 0.60 m).

## How stage one is made

- **Torso.** A stack of rings from `TORSO` in `tools/tables.py` (half-width, front depth and back depth at each height), with the
  bust added as two soft mounds (`BUST`). It wears one picture, 2048 x 1408, that runs right round her from the middle of her
  back. The bake fills that picture from four views, B1 front and back and B2 both sides, using each view where the surface
  faces it. Above the collarbones it fades to plain chest skin, so painted hair and shadow do not land on the neck.
- **Shorts.** Their legs are short cuffs that sit just outside the leg and wear the same picture as the torso.
- **Leggings.** One tube per leg from `LEG` (half-width, depth to front and back, centre). The picture is her sleeve lace (F11)
  over toned-down skin. B3 shows the leggings as sheer black lace, and the model follows B3.
- **Sleeves.** Lace cylinders that follow the upper arm, see-through where the lace has holes. They are stiff until the cloth stage.
- **Boots and socks.** The Jester's boot, made lower and a little shorter, with a thicker lugged sole and nine eyelets. The sock
  is three soft rolls above the collar.

## Checking

`tools/cmp_r.py` compares outlines, model against painting:

- Front (B1): hips 0.376 m wide against 0.386, waist 0.204 against 0.202, calves 0.116 against about 0.119.
- Side (B2): hips 0.238 m deep against 0.234, bust 0.235 against 0.239, thigh 0.176 against 0.182, knee 0.131 against 0.134,
  calf 0.123 against 0.130.

The page was run in a headless browser at phone and laptop size: no errors, nothing off the side of the screen, dragging turns
her, every button works. Not checked: on a real phone.

Known rough spots: the sides of the torso under the arms are filled in from thin evidence (about 7% of the picture); the painted
strap hooks are flat; the shins are straight where the front painting has them angled a little outward.

## Building

The scripts use the absolute path `/home/claude/ranger`. In a fresh session:

```
mkdir -p /home/claude/ranger && cp -r models/ranger-3d/. /home/claude/ranger/ && cd /home/claude/ranger
npm install three@0.128.0 playwright
mkdir -p shots deliver
python3 -I lib/restore_refs.py        # PNG copies of the paintings into refs/
python3 -I bake_ranger.py             # out/ranger_tex.js (needs Pillow, numpy, scipy); about 10 seconds
./build_r.sh                          # tools/tables.py, then out/ranger.js
python3 -I build_single_r.py          # deliver/Ranger_3D_stage1.html, one offline file
python3 tools/cmp_r.py shots/cmp_front.jpg front      # model beside B1 with outlines; also back, sideR, sideL
python3 shoot.py shots/x 'T.j.pose({arm:24,leg:3})' full:0.35,0.05,6.4,0.86,22,620,900   # a still; angles are in radians
python3 shoot_page_r.py               # the real page at phone and laptop size (slow: about ten minutes)
```

Baking from the WebP copies gives a picture a hair different from the one kept in `out/` (that one came from the original
PNGs). The paintings are data: run Python that reads them with `-I`.

## Next stages

In the order of the how-to: head from her profile (C3) with her face baked on (C1), hair, headband and glasses (C12); hands and
painted arms (D1, D2); boots against E1 to E8 once more; strap hooks, belts, satchel and pouch as solid things; sleeves as
cloth; necklaces, charms and bracelets; bow, sword and knives (G1 to G7); then the Jester's body moves in her clothes; then her
own moves and spells with their effects (I1 to I6); then the full page.

Waiting on Chris: whether the base outfit and proportions are right, and the choices listed in the project doc
(`claude/ranger-3d-stage1-body.md`, "Choices waiting for Chris").
