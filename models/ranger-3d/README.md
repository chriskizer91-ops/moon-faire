# Ranger 3D model

The code-built three.js (r128) model of the Ranger, made the same way as the Jester's (`models/jester-3d/`), with Chris's
paintings baked on as textures. The method is the claude.ai Project "Flip Book Art", doc `claude/HOW-TO-3d-witch-models.md`.
Published at https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (republish every stage to that link). Project notes:
`claude/ranger-3d-stage1-body.md`, `claude/ranger-3d-stage2-head.md`, `claude/ranger-3d-stage2b-jester-face.md`,
`claude/ranger-3d-round4-face-prompts.md` and `claude/ranger-3d-stage2c-new-face.md`.

## Where she stands: stage two (November 12, 2026)

Body, base outfit, head, face, hair, headband and glasses, standing still. 324,628 triangles.

- **Approved by Chris (November 12): her body and base outfit** ("This looks very good so far"). Do not reshape them without asking.
- **Stage 2b, the same day.** Chris: "just use the jester witch 3d face model And then we will make specific new images of just her
  face so you can paint that onto the jester witch 3D face model". Her head is now the Jester's face model (see "The Jester's face
  model" below), wearing her own face.
- **Stage 2c, the same evening.** The three face pictures arrived (J1, J2, J3; `references/chatgpt/`). Her face is now J1, her
  blink, half-shut eyes, two talking mouths and smile come from J2 (buttons on the page, `setFace(eyes, mouth)` on the model), and
  her cheeks, jaw and ears at the sides are painted from the profile in J3. About 325,000 triangles.
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
  - `R40_head.js`: the head (the Jester's face model, scaled and placed on her body), face mix, ears, neck.
  - `R41_hair.js`: hair with the bun, headband with knot and tails, the gem and its drop, loose locks.
  - `R42_glasses.js`: glasses.
  - `R99_static.js`: materials, binding and `pose({arm, leg})`. This stands in for the animation files until they are brought over.
- `tools/tables.py`: the one place her body tables live. The model and the body bake both read them.
- `tools/sil.py`: lifts a figure off a painting's flat background. `tools/measure.py` and `tools/more.py` print widths and depths
  by height. `tools/cmp_r.py` puts the model beside a painting at one scale with the two outlines laid over each other.
  `tools/mont.py` joins pictures side by side. `lib/grid.py` puts a labelled grid on a painting for reading points off it.
- `variants/ownhead/`: her own head shape from stage two (traced from her profile in C3) and the bake that went with it, kept in case
  it is wanted back. `face_prompts/`: the request for three new face pictures and the script that builds its page.
- For the own-head variant: `tools/prof_r.py` traces her profile off C3 and prints the `MID` table. `tools/prof_cmp_r.py`: the painted profile beside the
  model's, millimetre by millimetre. `tools/cmp_head.py`: her head beside C3 from the side or the front, outlines overlaid.
- `bake_ranger.py`: body textures. `bake_head.py`: head textures, added to the same file. Both write `out/ranger_tex.js`
  (`window.RANGER_TEX`).
- `out/ranger_tex.js`: the baked textures in the published page (made from the original PNGs). `out/palette.js`: stage colours.
- `viewer/stage.js`: the lit stage, as in the Jester's viewer. `viewer_r/index.tpl.html`: her page.
- `build_single_r.py`: makes the one offline file. `test_r.html`, `shoot.py`, `shoot_page_r.py`: headless render and page tests
  (Playwright with Chrome and SwiftShader).
- `references/chatgpt/`: her 70 reference paintings, named by code (A1 to I6, and the face set J1 to J3), as WebP at quality 95.
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

- **Shape: the Jester's face model.** `JH` in `src/R40_head.js` is the Jester's head exactly as in `models/jester-3d/src/40_head.js`:
  her tables (`FACE_MID`, `NOSE`, `NOSE_W`, `FACE_V`) and her `headPoint`, word for word, in her own frame (eyes at 1.5246 m, lip line
  0.066 m below). It is worn at `HS` = 0.94 of its size, with the eye line at 1.512 m and the tip of the nose 0.107 m forward, as the
  Ranger's paintings have them. That puts the chin at 1.409 m and makes the face 6.4 cm wide at the eyes, both as painted. One thing
  is added (`TUCK`): below the ears the back of each ring is drawn in to the neck, because her hair is up and the Jester's cap and
  ruff are not there to hide it. The method is the project doc `claude/HOW-TO-3d-witch-faces.md`.
- **Face paint.** One material mixes three pictures by the Jester's rules: J1 from the front wherever it can see; the J3 profile
  only where the skin faces sideways and lies more than 34 to 50 mm from the middle line, its tone matched to the front cheek;
  plain chest-toned skin under the jaw and behind the ear line. `bake_head.py` lays J1 on by landmarks read off a gridded copy by
  eye (they are written in the script): eye line to lip line is 0.066 m of the head's frame; under the nose and under the chin sit
  on the head's heights. Her nose and mouth are 11 px to one side of the middle of her eyes in J1, so each half of the picture is
  scaled on its own: the nose lands on the head's middle line and each eye on its own socket (`layout.eyeX`). The painting is kept
  only inside the outline of her face and her skin is carried outward beyond it. Nothing had to be painted out of J1.
- **States** (`faceParts` in `out/ranger_tex.js`, stored as the Jester's are): `shut`, `half`, `oh` (lips parted), `oo`, `smile`. J2 is
  a grid of six faces. Its first cell is settled onto J1 picture against picture (OpenCV's ECC, started from a rough reading of
  its pupils), and each other cell onto the first by the parts that did not change. Only the eyes or the mouth are lifted, as
  soft-edged patches with their tone matched to J1 round the rim. `paintFace(eyes, mouth)` in `src/R40_head.js` draws J1 on a canvas
  and sets the patches into it; the names are the Jester's, so her blink and talk code will work unchanged.
- **Ears.** A dished shell on each side wearing the profile in J3; the painted ear under it on the head is blanked. J3 paints the ear
  larger than J1's front view allows, so the ear is built 6% smaller than its picture and the picture is drawn in to fit.
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
- Profile: the main build now has the Jester's profile, by Chris's choice, so it is not held to C3. (The own-head variant was
  within 0.4 mm of C3 from brow to chin, `tools/prof_cmp_r.py`.)
- Stage 2b was looked at from the front, three-quarter both ways, side, above, below and a low three-quarter, and the single file
  was loaded at phone size: no errors, and a drag turns her.
- Head outlines (`tools/cmp_head.py`): from the side the face, the top of the hair and the bun follow C3. From the front the
  painted loose hair spreads about 1.5 cm wider on each side than the model's, and C3's front view is a little larger than C1.
- The page was run in a headless browser at phone and laptop size (`shoot_page_r.py`): no errors, nothing off the side of the
  screen, every button pressed, and a drag turns her. Not checked: on a real phone.

Known rough spots: the sides of the torso under the arms are filled in from thin evidence; the painted strap hooks are flat;
the shins are straight where the front painting has them angled a little outward; the hair pictures still come from C3, C5 and C8 with the band painted out, so just behind
the band the hair is folded-over texture, which can read as crimped (J3 shows her hair without the band and is the source for the hair pass); a faint line remains where forearm skin meets hand skin until both are painted; a pale smudge shows at the base of the back of her neck, left from stage one.

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
python3 -I build_single_r.py          # deliver/Ranger_3D_stage2c.html, one offline file
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

Waiting on Chris: his notes on her new face, and the choices listed in the project docs.
