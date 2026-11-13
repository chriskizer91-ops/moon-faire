# Ranger 3D model

The code-built three.js (r128) model of the Ranger, made the same way as the Jester's (`models/jester-3d/`), with Chris's
paintings baked on as textures. The method is the claude.ai Project "Flip Book Art", doc `claude/HOW-TO-3d-witch-models.md`.
Published at https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (republish every stage to that link). Project notes:
`claude/ranger-3d-stage1-body.md`, `claude/ranger-3d-stage2-head.md`, `claude/ranger-3d-stage2b-jester-face.md`,
`claude/ranger-3d-round4-face-prompts.md`, `claude/ranger-3d-stage2c-new-face.md`, `claude/ranger-3d-stage2d-fidelity.md`,
`claude/ranger-3d-stage3-hands-arms.md`, `claude/ranger-3d-stage4-boots.md` and `claude/ranger-3d-stage5-belts-bags-hooks.md`.

## Where she stands: stage five (November 13, 2026)

Body, base outfit, head, face, hair, headband, glasses, painted hands and arms, boots, and now her two belts, satchel, pouch and
four strap hooks as real objects, standing still. About 355,000 triangles.

- **Approved by Chris (November 12): her body and base outfit** ("This looks very good so far"). Do not reshape them without asking.
- **Stage 2b, the same day.** Chris: "just use the jester witch 3d face model And then we will make specific new images of just her
  face so you can paint that onto the jester witch 3D face model". Her head is now the Jester's face model (see "The Jester's face
  model" below), wearing her own face.
- **Stage 2c, the same evening.** The three face pictures arrived (J1, J2, J3; `references/chatgpt/`). Her face is now J1, her
  blink, half-shut eyes, two talking mouths and smile come from J2 (buttons on the page, `setFace(eyes, mouth)` on the model), and
  her cheeks, jaw and ears at the sides are painted from the profile in J3. About 325,000 triangles.
- **Stage 2d, a fidelity pass on her head.** Chris: "Her hair band is floating above her forehead and I think she needs another head
  and face fidelity pass." The band now lies on her skin below the hairline and on her hair above it (`bandPt` in `src/R41_hair.js`).
  Her head was laid over J3's front and side views at one scale (`tools/cmp_j3.py`) and corrected: the neck leans forward as it
  rises, front and back; neck and the top of the chest take her painted neck tone (`skinNeck`), darker and warmer than her chest;
  the sides of the neck wear J3's profile; the hair is rounder on top and fuller at the back of the head and the nape; the painted
  shadows of loose hair and band tails are cleared from the back of her neck; the lenses are fainter.
  The foot of the neck takes the chest's surface direction where the two meet (`buildNeck` in `src/R40_head.js`), so the light
  no longer breaks in a line across her neck.
- **Stage three, hands and painted arms.** Chris: "Leta move on to her hands and painted arms." Her left hand and forearm wear D1,
  her right D2, nothing mirrored (`bake_hands_r.py`, landmarks in `hand_marks.json`). Nails are the painted ones under a clear
  gloss. The paint runs from fingertips to about 15 cm above the wrist; above that the arm carries the forearm's tone and grain to
  the shoulder. The wrist was slimmed from 5.3 to 4.7 cm to match D1, D2 and A1 and moved in line with the hand; the arm's hidden
  end was thinned so it stays under the skin of the palm (it showed as a patch once it was painted). The hands' shape is unchanged.
- **Stage four, boots.** Chris: "Yes let's continue she is looking good." Next in the how-to's order was her boots. They were laid
  over E1 to E8 at one scale (`tools/cmp_boot.py`) and rebuilt until the outlines agreed to within about 3 mm: sole 9.6 cm across
  at the ball (it was 12), shaft and toe narrower, shaft shallower front to back with the eyelets set back from the front edge, sock
  lower and smaller (top 29.1 cm up, it was 32). Lacing, seams, heel counter, back strap with a pull loop, welt stitching, lugs and
  the leather, sole and sock pictures all follow the paintings now (`src/R31_boots.js`, `src/R21_tex.js`).
- **Approved by Chris (November 13): her boots** ("the boots look perfect as they are"). Do not reshape them without asking.
- **Stage 4b, her hair lowered.** Chris: "her hair is too big above the hairband ... lowered the elevation of the front bulge of
  it", with everything else on her head the same. The swell of hair just behind the band stood 2.5 to 4.6 cm above the slope in
  C3's side view. It now follows that slope to within 3 mm (`FRONT_LOW` in `hairPt`, `src/R41_hair.js`). Crown, bun, band and face
  are untouched. C3's own front view draws the hair lower and wider than its side view; the side view was followed.
- **Stage five, belts, satchel, pouch and strap hooks.** Chris: "Let's move on to her belts, satchels, pouch, and strap hooks as
  real objects." All in `src/R45_gear.js`, wearing the leather of F6 (`bake_gear_r.py`).
  - Two belts, each a loop lying in a tilted plane round her hips (slope 0.38, crossing 96.2 cm up at the middle, front and back).
    Belt A is high on her right hip with a steel ring buckle at her front right; belt B is high on her left with a square buckle
    and a blue keeper, and lies on top where they cross. 2.4 cm wide, one steel stud every 2.2 cm, each with a tucked end with
    punched holes past its buckle.
  - The satchel (20 cm across, 19 tall, 6.5 deep at the foot) hangs by two loops from belt A on her right hip, a little forward of
    her side. The pouch (9.3 by 14 cm) hangs by one loop from belt B behind her left hip. Each is built to its own painting in F6:
    back, front, gusset, flap with a rim, straps or tab lifted off the leather, steel buckles, brass studs. Each hangs from its
    belt like a hinge, swung in until its back rests on her hip and turned until both halves touch (`bag()`).
  - Four strap hooks, front and back: a brass buckle on the strap (an oval ring with an upright prong in front, a narrow bar with
    a tooth behind) and a black iron curl either side, the outer one bigger, shapes read off A1 and A2. They lie on the real
    outer surface of chest and shoulder, found by looking straight through the built torso and arms. The flat painted hooks are
    painted out of the body picture (`paint_out` in `bake_ranger.py`), and the straps at her back no longer fade to skin above
    the buckles.
  - A choice made here, told to Chris: the paintings draw each bag face-on in every view. The satchel is on the side of her hip
    turned a little forward and the pouch behind her left hip, so each shows from the front, the side and the back.
- **Stage 5b, the rough spots of stage five.** Chris: "Continue on with fixing what's still rough: the bags, the charms, her shoulders."
  - Charms (F7), in `src/R45_gear.js`: three turquoise crystals under the satchel, the bead string from the ring buckle, the
    cluster of gold balls from the square buckle, the amber string under the pouch. Each is a list of parts (clasp, ring, links,
    beads, cap, cut stone) drawn down a line, at the lengths in A1 (bead string and cluster about 18.5 cm). Stones are flat-faced.
  - Things that hang have bones now: `bagsat`, `bagpouch` (children of the hips, at the belt hinge) and `charm1` to `charm6`
    (children of the hips or of a bag). `animate(dt)` swings them: gravity pulls each in against her, her thigh pushes a bag out
    (the bag's lean is worked out from the thigh's place each frame), a push (`swing()`) or the movement of its hinge sets it
    swinging. `pose()` lets them come to rest at once. The page has "Give them a swing" and a "Legs apart" pose.
  - Strap hooks take the skin's own weights (the six nearest skin points, `wNear`), so the outer curls ride her shoulder when her
    arm lifts. The strap is redrawn over the top of each shoulder in the body picture (`strap_over` in `bake_ranger.py`).
- **Stage 5c, an experiment with her face.** Chris: "Could we also experiment with giving her the Fox's face or making a younger
  version of her face." Nothing is decided. `bake_looks_r.py` adds two more face pictures (with their blink and mouth patches) and
  the page's "Try a face" row swaps them on her head with `setLook('own' | 'young' | 'fox')` (`LOOKS` in `src/R40_head.js`).
  - `young`: her own J1 face with the lines of age lifted (forehead lines, crow's feet, shade under the eyes, folds by the mouth),
    eyes, brows, lashes, lips and mole kept. Hair unchanged.
  - `fox`: the Fox's painted face as baked for the Fox's model (`refs_fox/fox_face.json`, copied from branch `claude/fox-3d-model`,
    commit f7cac64, `models/fox-3d/out/fox_tex_own.js`). Both heads are the Jester's face model with the same picture window, so it
    lays straight on; her eye band is slid 2.8 mm outward to the Ranger's eye sockets and her skin toned to the Ranger's cheek.
  - Only the front picture changes: the side pictures of cheeks and ears stay her own.
- **Stage six, the same day.** Chris: "I like the younger face but her hair needs to be smoothed out ... slope the top of her head
  back more and have her bun of hair be on the back of her head. Not up as high as it is ... we need to get the animation of her
  skeleton in so we can see her walking with all of these different things."
  - **Younger face chosen.** `lookNow` starts as `young`; the side picture of her cheeks and ears gets the same treatment
    (`faceSideYoung`). The first painting (`own`) and the Fox's stay on the page to compare.
  - **Hair** (`src/R41_hair.js`): the bun points 17 degrees above straight back (it was 35), 5.2 cm proud, and stops above the band
    so the band is never buried; the swell on top of her head is 1.1 cm (was 2.7), so the top slopes back from the band; the curls
    on the bun are a third as deep; the four hair pictures lose some fine light-and-dark (`hairSideSoft` and so on). By his eye,
    not measured from a painting. It overrides stage 4b's match to C3 above the band.
  - **A first walk** (`walk(true)`, `animate(dt)` in `src/R99_static.js`): a plain cycle on the spot written here (thighs, knees,
    feet, arms, hips dropping 4 cm at each step, a turn of the spine), period 1.08 s. Bags and charms move with her through the
    code from stage 5b. The Jester's full moves still come over at the movement stage and replace it.
- **Stage 6b, her own first moves.** Chris: younger face as made, hair left grey. "Working on making her walk look better is where
  we are now, and then making her body and her fabric and materials move on her body as she walks." The Jester's set of moves is
  the reference, "but she should have her own moves as the character that she is": dexterous, acrobatic, the sporty one, draws a
  bow, good with a sword, quick on her feet. She needs her own talking animation (the four must not share one) and a couple of
  emotes with face, hands and body.
  - `play(name)` in `src/R99_static.js` (`moves` lists them): `idle` (ready: breath, weight shift, a double bounce on her toes
    every 4 seconds), `walk` (heel strike, toe push-off, knee giving on landing, pelvis turn and dip, shoulders against hips, head
    held on her heading; period 0.98 s), `jog` (the same cycle slid quicker: lean, heels up, elbows pumping; 0.62 s), `talk`
    (weight on one hip, one quick hand at chest height, nods, mouths from J2), and three that end by themselves: `aim` (bow arm
    out to her left, head turned, draw to the jaw, squint, hold, release; no bow yet), `cheer` (dip, jump, arm up, smile),
    `limber` (toe bounces, shoulder rolls, arms shaken out). She blinks in every move.
  - How it is written: each frame every bone goes back to rest and the layers are added (`restAll`, `add`); walking and jogging
    share one cycle and blend. `pose()` stops everything for checking against the paintings.
  - First drafts, tuned from stills only. Fingers do not curl; sleeves, band tails and loose locks are still stiff.
- **Stage 6c, his notes on the moves.** Chris: her feet bent unnaturally at the back of each step, walking and running; she was
  too stiff ("Terminator running"); the bags and charms moving "are great"; the short moves were too fast to see; the page had too
  many buttons.
  - Feet: the ankle is clamped to what an ankle can do (0.26 rad up, 0.30 down) while the foot is on the ground, hangs loose and
    toes-down in the air, and the toe bone no longer folds (stiff boots).
  - Looser: spine, neck and head each follow a beat behind the part below; forearm and hand trail the upper arm; the shoulder
    rides with the arm; a slow drift of the head. The ready stance looks about and breathes into her knees and arms.
  - Jog: lighter and more upright (cycle 0.72 s, less lean, softer arms).
  - Short moves play slower (`SLOW`), and repeat after a pause while chosen. The page has "Half speed".
  - Page: "Her moves" and "Camera" on top, opening on her whole body in the ready stance; every other row and the notes are folded
    under "More".
- **Stage 6d, her shoulders.** Chris, with a screenshot of "Take aim": "the way her arms attach to her torso is very goofy,
  clunky looking." The cause was the hand-over of skin from shoulder to arm (`wArm` in `src/R30_body.js`): the first 9 cm of the
  arm was shared between body and arm, which pinches when the arm lifts. Now everything of the arm that shows moves as one piece
  about the joint, like a ball in a socket; only its hidden tip inside her body stays behind. Under the joint the body's skin goes
  30% with the arm so the armpit opens (`wTorso`). Weights only: her shape standing still, which he approved, is unchanged.
  A first try that let the top of the shoulder follow the arm made a lump there and was dropped.
- **Stage seven, soft sleeves, headband tails and loose locks.** Chris: in "Take aim" her sleeves meshed into her arm; "her
  sleeves, headband tails and loose hair moving. Let's do those." Each soft thing gets a bone at its root (`slvL`, `slvR` on the
  upper arms at the sleeve band; `tail0`, `tail1` and `lock1` to `lock16` on the head) and is listed in `SOFT` (declared in
  `src/R30_body.js`). Its skin goes over from the parent bone to its own bone along its length, so it bends near the root.
  `softTick` in `src/R99_static.js` moves them: the tip is a weight on a spring, pulled to where it would rest (its built
  direction bent toward straight down), lagging when its root moves, held inside a largest angle. A sleeve's pull down and its
  largest angle grow with the fold of that elbow, so a folded forearm no longer passes through it. `pose()` settles them at once.
  Not real cloth: each swings as one piece; no folds, and no collision with her neck or shoulders.
- **Stage 7b, sleeves again.** Chris, with a photo of "Take aim": the sleeves must not mesh with her arms; "her arms moving move
  it out of the way but it still acts like fabric." The one-bone swing let the arm pass through the cloth. Each sleeve is now a
  loop of cloth round her upper arm with two bones at its band (`slmL/R` for its middle, `slvL/R` for its hem; `SLEEVES`).
  `sleeveTick` in `src/R99_static.js` slides them across the arm: toward the ground until the top of the loop rests on the top of
  her arm (2.6 cm at the hem, on top of the 1.9 cm built in), and away from her forearm as her elbow folds (up to 4 cm), which
  also gathers the cloth toward her shoulder (hem scaled to 72%). The slide is capped at 4.4 cm, short of the loop's slack, so
  her arm stays inside. It follows on a spring. Tails and locks keep the stage-seven swing.
- **Stage eight, the Flipbook look and the sleeves once more.** Chris: "Her arms are still passing through the lace. Also, can you
  add the flipbook look button", with the note that all four witches share the same 56 colours and that the 56 have no green.
  - Flipbook look: a switch on her page ("Flipbook look", beside "Half speed"), off when the page opens, done exactly as the
    project doc `claude/HOW-TO-flipbook-look.md` says: it sets `stage.look` to `'flipbook'` or `'smooth'`. `viewer/stage.js` and
    `out/palette.js` were already in place. Seen on her for the first time here: her face, glasses, outline and skin read well;
    **her grey hair lands on olive brown**, because the 56 have no grey near it. The fix the how-to gives (up to eight extra
    colours, taken from her own flipbook frames and passed as `makeStage(canvas, { palette })`) is not done yet.
  - Sleeves: a folded elbow gathers the hem to 55% of its size, close round her upper arm and short of her forearm, and the slide
    allowed shrinks with it so her upper arm stays inside. The slide toward the ground is 1.7 cm (was 2.6), so the loop rides a
    little above her raised arm instead of lying on it, where its ragged folds dipped into her skin.
- **Stage 8b.** Chris: no greys needed for her hair in the Flipbook look (leave it as it lands). Her arm still passed through the
  lace: "if you can make that not happen somehow." Sleeves now work a third way (`sleeveTick`): as soon as her elbow bends past
  about 25 degrees the cloth is pushed up her arm, to 35% of its length and 55% of its width by about 107 degrees, so the hem
  ends well above her elbow and her forearm has nothing to pass through. Straight arm: full length, as painted. The elbow in
  "aim" folds to 143 degrees at most. Next, by his word: "the rest of her animations and spells and attacks."
- **Stage 8c, sleeves a fourth and different way.** Chris, with photos of the lace shrunk to a line in "Talk" and a tuft in "Take
  aim": "maybe there's a different way to do it. I'd like to be able to continue." The push-up is dropped (only a 12% and 22%
  gather on a deep fold remains). Instead it is solved in how the picture is drawn (`src/R99_static.js`, after the meshes are
  made): the lace is drawn after her body and writes no depth, then her forearms and hands (`armLOver`, `armROver`, `handOver`,
  `handROver`: the same geometry, only the triangles that follow forearm, hand and finger bones) are drawn once more on top. So
  where forearm and lace cross, her forearm is whole and the lace lies behind it, and the sleeve keeps its painted length in
  every pose. Known cost: a forearm that is truly behind her own sleeve still shows in front of it.
- Waiting for his notes: the moves again; stage two (head), stage three (hands and arms) and stage five.

Rough or not built yet: her face does not move (no blink, no expressions); the hair has a smooth edge with none of the painted
flyaway wisps, and the loose locks are simple; earrings and necklaces; fingers that bend; bracelets; each charm is one stiff piece on a hinge (its chain does not bend, charms can
pass through each other); the caps on the stones are plain cones; with her arms straight out the iron curls bend with her skin;
sleeves and headband tails as hanging cloth; bow, sword, knives; all movement and spells.

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
  - `R45_gear.js`: belts with buckles, studs and tucked ends; satchel and pouch; the four strap hooks.
  - `R99_static.js`: materials, binding and `pose({arm, leg})`. This stands in for the animation files until they are brought over.
- `tools/tables.py`: the one place her body tables live. The model and the body bake both read them.
- `tools/sil.py`: lifts a figure off a painting's flat background. `tools/measure.py` and `tools/more.py` print widths and depths
  by height. `tools/cmp_r.py` puts the model beside a painting at one scale with the two outlines laid over each other.
  `tools/mont.py` joins pictures side by side. `lib/grid.py` puts a labelled grid on a painting for reading points off it.
- `variants/ownhead/`: her own head shape from stage two (traced from her profile in C3) and the bake that went with it, kept in case
  it is wanted back. `face_prompts/`: the request for three new face pictures and the script that builds its page.
- For the own-head variant: `tools/prof_r.py` traces her profile off C3 and prints the `MID` table. `tools/prof_cmp_r.py`: the painted profile beside the
  model's, millimetre by millimetre. `tools/cmp_head.py`: her head beside C3 from the side or the front, outlines overlaid.
- `bake_hands_r.py`: hand and arm textures (`hands`, `handsR`, `armL`, `armR`), added to the same file; `hand_marks.json` holds the
  finger, web and wrist landmarks of D1 and D2.
- `bake_gear_r.py`: the leather of her bags and belts from F6 (`gear`, a 1024 atlas, with `gearLayout` saying where each piece
  sits and which F6 pixels it holds; `beltTex`, one stud's length of belt, and `beltPitch`).
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
| A2 (master, back) | 898 | centre x 507, soles y 1505 |
| B3 (legs, front) | 898 | centre x 308.0, soles y 961 |
| F6 (satchel, pouch, belt) | satchel 0.474 mm a pixel | satchel front x 60 to 482, y 512 to 910; pouch front x 1278 to 1474, y 564 to 862 |
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

Belts and bags, read off A1 in metres (x to her left, height): ring buckle (-0.077, 0.992), square buckle (0.090, 0.986), the belts
cross at (-0.005, 0.965), belt width 0.022 to 0.025; satchel x -0.262 to -0.104, height 0.791 to 0.984; pouch x 0.146 to 0.215, top
about 0.976. Strap hooks sit where the body picture had them painted: 0.117 either side of the middle at 1.321 in front, 0.1115 either
side at 1.337 behind (u 0.5 -+ 0.117 and 0 +- 0.1115 round the torso).

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
- **Boots and socks (rebuilt in stage four).** The builder began as the Jester's; every table in `src/R31_boots.js` is now read off
  her own boot paintings.
  - *Scale.* E1 (outer side) is scaled so its sole is as long as the model's: 1 painting pixel = 0.27 mm. The others are scaled to
    E1's height (ground to sock top), or to its length for the views from above and below. E6 (from above) has strong perspective
    and gives a boot about 2 cm too narrow, so widths come from E3, E4 and E7.
  - *Outline.* `B_SH` is the shaft by height (half-width, front, back, centre), `B_FT` the foot by length, `B_YT` the welt line,
    `B_HW` the sole's plan, `bBot` the arch. Seen from above, the back half of the shaft is a rounded box and the front half comes
    to a rounded nose (`B_EF`), which is what puts the eyelets well back from the front edge in the side view.
  - *Places on the side* are given as [z, y] in metres, read straight off E1, and laid on whichever of shaft and foot is outside
    there (`sideX`, `onSide`): the nine eyelets (`B_EYE`), the edge of the piece they sit in (`STAY`), the seam from the last
    eyelet down to the welt (`VAMP`). The back is given by angle from the back seam (`COUNTER`, the strap, the stitched box).
  - *Laces* run from eyelet to eyelet over the front of the boot (`over` finds the leather under them). The bow has two drooping
    loops and two tails with brass tips.
  - *Sock.* Three soft rolls from the collar (23.2 cm) to 29.1 cm, 9 cm across and 11.4 deep.
  - *Paintings disagree* about the heel: E7 gives a heel 7.3 cm across, E4 about 8.6. The model's is 8.6 at the welt.

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
- **Headband.** A strip of even width that lies on her skin where there is no hair under it and on her hair elsewhere, pressing
  it flat (`bandPt`), wrapped in a tilted plane, from high on the forehead down behind the ears to the knot at
  the nape (`BAND`). Its picture is the flat strip in F2, mirrored each way from the gem. Knot and two stiff tails at the back.
- **Gem.** Turquoise dome, gold rim, ring of beads, leaves, and the drop that rests on her forehead.
- **Loose locks.** Eight on each side: flat twisting ribbons wearing fine strands with gaps, drawn in code.
- **Glasses.** Wire rims a little wider than tall (46 by 39 mm, from C2), bridge, pads, arms over the ears, lilac lenses.
- **Wrists.** The forearm narrows to 5.3 cm two centimetres above the joint, then widens and flattens into the heel of the hand
  and runs on inside it. The heel's size and place were measured off the hand mesh. The hands themselves were not changed.

## How the hands and arms are painted (stage three)

- **Hands.** The hand model reads one 1024 picture: five strips, one per finger, each wrapped once round it, and two flat panels for
  the back of the hand and the palm. `bake_hands_r.py` (from the Jester's `bake_hands.py`) fills it from D1 for her left hand. Her
  right hand is the same mesh mirrored, so D2 is flipped into a left-hand layout, baked the same way into `handsR`, and worn by the
  right hand (`handR` in `src/32_hands.js`), which mirrors it back.
- **Landmarks** (`hand_marks.json`): each finger's root and tip and half its width, in the back view (`D`) and the palm view (`P`); the
  middle finger's line, its web and the wrist in each view. Outlines were measured by `tools/hand_measure.py` (fingertips, webs,
  finger lines, widths by row) and the result checked by eye with `tools/hand_marks.py`. A finger's root is where it parts from its
  neighbour; the thumb's is its knuckle, where it comes free of the palm.
- **Her painted hand is not the hand model's shape.** Painted: middle finger 284 px from web to tip, palm 362 px from web to wrist,
  207 px from little knuckle to index knuckle. Model (the Jester's hand): 84, 89 and 57.3 mm. So the paint is fitted piece by piece:
  across the hand 0.2768 mm a pixel (knuckles), along the palm about 0.245 (web to wrist), each finger strip from its own root to
  its own tip (drawn out about 15%). The hands were approved and were not reshaped.
- **Arms.** Each arm wears a 512 by 1024 picture of itself unrolled (`armL`, `armR`): once round the arm across the picture, with
  the back of the forearm in the middle and the thumb side at three quarters; shoulder at the top, wrist at the bottom, the lower
  forearm on 60% of the rows (`vs` in `src/R30_body.js`). The back view of the painting covers the back half and the palm view the
  inner half, mixed at the sides. At the wrist the arm reads the painting exactly as the hand's flat panels do, so lines cross the
  join; further up, the painted outline is wrapped round the arm. Scale along the forearm: 0.30 mm a pixel.
- **Above the painting** (higher than 0.32 m down the arm): the forearm's own tone carried on, with the painting's fine grain (not
  its moles) laid over, turning to the tone of the body picture beside the shoulder (`SHOULDER`, from `tools/shoulder_tone.py`).
- **Wrist.** `ARM_R`, `ARM_T`, `ARM_PALM` and `ARM_Z` in `src/R30_body.js`. D1 and D2 give a wrist 0.86 of the width across the
  knuckles (4.7 cm on her; A1 gives 4.5) and in line with the middle of the hand, 6 mm to the thumb side of the wrist joint. The
  arm covers the stub of the hand, meets the heel of the hand at the joint and runs on inside it; `tools/wrist_sections.py` prints
  both, slice by slice, and was used to keep the hidden end under the skin of the palm and of the back of the hand.
- **Light at the joins.** Arm and hands use the body's material settings. Where the arm leaves the shoulder its surface direction is
  blended into the shoulder's. A step remains there: it is the shape of the body, not the paint.
- **Nails.** Painted on the fingers; the model's nail plates are only a clear gloss over them (`nail`).

## Checking

- Body outlines, model against painting (`tools/cmp_r.py`): front (B1) hips 0.376 m wide against 0.386, waist 0.204 against 0.202,
  calves 0.116 against about 0.119; side (B2) hips 0.238 m deep against 0.234, bust 0.235 against 0.239, thigh 0.176 against 0.182,
  knee 0.131 against 0.134, calf 0.123 against 0.130.
- Profile: the main build now has the Jester's profile, by Chris's choice, so it is not held to C3. (The own-head variant was
  within 0.4 mm of C3 from brow to chin, `tools/prof_cmp_r.py`.)
- Head against J3 (`tools/cmp_j3.py`, stage 2d), model against painting. Front: jaw 0.094 m wide against 0.096; below the ears 0.112
  against 0.117; across the ears 0.166 against 0.161. Side, forward of the body's middle line: brow 0.092 against 0.090, cheek 0.092
  against 0.094, chin 0.084 against 0.089 (the Jester's chin); back of the hair at 1.54 m -0.127 against -0.124; nape at 1.43 m -0.066
  against -0.061. Where they still differ by more than a centimetre, the body paintings rule: J3's shoulders sit about 3 cm lower
  than B1's (a longer neck), its neck is 1 cm narrower just under the chin, and its bun is smaller and lower than C3's.
- Stage 2b was looked at from the front, three-quarter both ways, side, above, below and a low three-quarter, and the single file
  was loaded at phone size: no errors, and a drag turns her.
- Head outlines (`tools/cmp_head.py`): from the side the face, the top of the hair and the bun follow C3. From the front the
  painted loose hair spreads about 1.5 cm wider on each side than the model's, and C3's front view is a little larger than C1.
- The page was run in a headless browser at phone and laptop size (`shoot_page_r.py`): no errors, nothing off the side of the
  screen, every button pressed, and a drag turns her. Not checked: on a real phone.

Stage three was looked at with `tools/shoot_hand.py` (each hand and forearm from four sides beside its painting) and
`tools/page_test.py` (the page at phone size: every hand and arm button, a drag, no errors).

Stage four was looked at with `tools/cmp_boot.py` (each view beside its painting with the model's outline drawn over it, and
tables of both outlines in millimetres) and `tools/page_test.py`. Side view: back edge within 3 mm from sole to collar; front view:
widths within 3 mm from sole to collar, sock within 6; whole boot 257 mm long and 295 mm tall against 257 and 296 painted.

Stage five was looked at beside A1 and A2 at one scale from the front and the back, from both sides, from above and close up, in
three arm poses, and with `tools/page_test.py`. Built against painted: ring buckle (-0.078, 0.992) against (-0.077, 0.992); square
buckle (0.090, 0.996) against (0.090, 0.986); crossing 0.962 against 0.965; satchel in the front view x -0.268 to -0.115 and height
0.783 to 0.976 against -0.262 to -0.104 and 0.791 to 0.984; pouch x 0.138 to 0.239 against 0.146 to 0.215, 14 cm tall where the body
paintings draw about 12 (F6's shape was kept).

Known rough spots: the boot leather is one worn texture all over (the paintings rub paler on toe cap and heel), the shaft has no
ankle creases, and the tread under the sole is plain bars, not the crosses in E7; the thin edge of the hand (little-finger side, round the base of the thumb) is soft paint with no detail, because
neither painting shows it; the paint on the fingers is drawn out; the arm meets the shoulder with a step; the sides of the torso under the arms are filled in from thin evidence; the satchel's loops sit 2 cm nearer its middle than F6 paints them, to hang clear of the ring buckle;
the shins are straight where the front painting has them angled a little outward; the hair pictures still come from C3, C5 and C8 with the band painted out, so just behind
the band the hair is folded-over texture, which can read as crimped (J3 shows her hair without the band and is the source for the hair pass); a faint line remains where forearm skin meets hand skin until both are painted.

## Building

The scripts use the absolute path `/home/claude/ranger`. In a fresh session:

```
mkdir -p /home/claude/ranger && cp -r models/ranger-3d/. /home/claude/ranger/ && cd /home/claude/ranger
npm install three@0.128.0 playwright
mkdir -p shots deliver
python3 -I lib/restore_refs.py        # PNG copies of the paintings into refs/
python3 -I bake_ranger.py             # out/ranger_tex.js: body (needs Pillow, numpy, scipy)
python3 -I bake_head.py               # adds the head, hair and band pictures to it (also needs opencv)
python3 -I bake_hands_r.py            # adds her hands and arms from D1 and D2
python3 -I bake_gear_r.py             # adds the leather of her bags and belts from F6
python3 -I bake_looks_r.py            # adds the two trial faces (younger, the Fox's)
./build_r.sh                          # tools/tables.py, then out/ranger.js
python3 -I build_single_r.py          # deliver/Ranger_3D_stage8c.html, one offline file
python3 tools/shoot_hand.py shots/hand_L.jpg L hand   # one hand from four sides beside D1 or D2; also R, and arm
python3 tools/wrist_sections.py                       # forearm and hand, slice by slice through the wrist
python3 tools/page_test.py                            # the page at phone size: belt, bag, hook, boot, hand and body buttons, a drag
python3 tools/cmp_boot.py shots/boot                  # her boot beside E1 to E7 at one scale, with outline tables in mm
python3 tools/cmp_j3.py shots/cj3.jpg                 # head beside J3's three views, with widths and depths by height
python3 tools/cmp_head.py shots/ch_side.jpg side      # head beside C3 with outlines; also front
python3 tools/cmp_r.py shots/cmp_front.jpg front      # body beside B1 with outlines; also back, sideR, sideL
python3 shoot.py shots/x 'T.j.pose({arm:24,leg:3})' face:0,0,1.25,1.53,22,520,600   # a still; angles are in radians
python3 shoot_page_r.py               # the real page at phone and laptop size (slow: run it in the background)
```

Always run `bake_ranger.py`, then `bake_head.py`, then `bake_hands_r.py`, then `bake_gear_r.py`, then `bake_looks_r.py`: each adds to the file the first writes. Baking from the WebP copies
gives pictures a hair different from the ones kept in `out/` (those came from the original PNGs). The paintings are data: run
Python that reads them with `-I`.

## Next stages

In the order of the how-to: sleeves and headband tails as cloth; necklaces, earrings and bracelets; bow, sword and knives
(G1 to G7); then the Jester's body moves in her clothes; a face that blinks and changes expression (C10, C11); then her own moves
and spells with their effects (I1 to I6); then the full page.

Waiting on Chris: his notes on stage five (above all whether the satchel should sit further round to the front), on her hair, hands
and face, and the choices listed in the project docs.
