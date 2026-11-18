# Jester Witch HD 3D model: passes 15, 16 and 17 (November 11, 2026)

This adds to `claude/HANDOFF-jester-3d-and-flipbook.md`, which is still the place to start. It records what was done after the
face was put back to the pass-13 shape.

- Page: https://claude.ai/artifact/9jmp5uWiBTZbfZ5hE5fP8M (live version `1794447408-9a22`).
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/jester-3d-model`, folder `models/jester-3d/`, commit `81ff510`.
  The README there has three new sections with the code-level detail: "How she moves", "Her boots, and crossed legs", and
  "Walking her around, and more moves".

## What Chris asked for

1. "Now we need to work on her animations so we have walking. We need running, kneeling, squatting, sitting down in a chair
   sitting down on the ground. Jumping. talking with hand motions. And then more of her spells and open to adding magical
   animations."
2. Eight boot paintings, sent with no words (he had offered to make them and was given the list of views).
3. "the skeleton of her legs and her feet when she sits cross legged the sit on the ground and hover animation. Her feet look
   like they break"
4. "I want to see more of her moves animated, or like more animation done to her moves, and the ability to walk her around a
   small space"

## Pass 15: how she moves

Motion has three layers, added each frame:

1. The base: breathing, the walk, and a run. `animate(phase, walk, t, dt, run)`.
2. A stance she holds until told otherwise: `setStance('kneel' | 'squat' | 'sit_chair' | 'sit_ground' | 'hover' | '')`.
   Each is keyed from standing to the held pose and plays backwards to stand up. Sitting on the stool conjures the stool.
   Hover is an addition of mine: she folds her legs and floats over a wheel of light.
3. A move, played once over whatever stance she is in: `play(name, true)`. The stance keeps her legs; the move's hands are
   carried by the chest. So she can talk while seated or cast from her knees. Moves that need her feet stand her up first.

Moves: `jump`, `talk` (11.4 s, nine gestures, mouth in bursts of syllables).
Spells from `assets/design/moves_v03.json`, timed to the sheet: `ill_omen` (2 s), `stop` (4 s), `royal_reversal` (3 s),
`last_toll` (5 s). They have no flipbook frames; they are built from the sheet's eight-step descriptions.

## Pass 16: boots and crossed legs

- Boots are rebuilt in code to the eight paintings (`src/31_boots.js`; references in `references/boots/`): crinkled patent
  leather, yellow double stitching, ten pairs of silver eyelets, crossed laces with a bow, a ridged platform sole with lugs and a
  block heel, and a ribbed cream sock with two grey stripes as its own part. Nothing is projected from the paintings.
- Feet can now follow their own shin instead of the ground. Sitting on the ground and hovering use it, with the right shin
  resting across the left. Before, the foot stayed turned to the floor and the ankle looked broken.

## Pass 17: walking her around, and more moves

- The page has a **Walk around** switch at the head of the Body row. A round pad on the stage (or W A S D / arrows, Shift to
  run, Space to jump) moves her about a round stage 2.85 m in radius with lanterns at its edge. The camera and the light follow.
  Her step keeps pace with the ground. She gets up before she goes, stands still to cast, and can talk, wave, laugh or jump on
  the move. This lives in the viewer (`roamStep` in `viewer/app.js`), not in the model.
- New moves: `wave`, `bow`, `twirl` (two turns on one foot; a move can now turn her whole body, read by the host as `J.spin`),
  `laugh`, `dance` (a jig), and two she does by herself when left standing, `look_around` and `settle`.

## Checked, and not checked

- Every move over every stance was run headless with no errors and no broken numbers (72 pairs in pass 15; the pass-17 moves over
  standing, the stool and the hover). Stills of every move were looked at. The walk pad was driven with keys in a headless
  browser and she went where she was sent.
- Not seen at real speed by me: headless runs at under 2 frames a second, so timing, feel, and the pad under a thumb are
  Chris's to judge.

## Open items

- Chris has not yet given notes on the new moves, spells, boots or the walk-around.
- He said the boot leather question (mine is greyer and smoother than his painting) and move notes are both open; no answer yet.
- No eyebrow motion. Going from one stance to another always stands up first. The run was tuned from stills.
- The bow on the boots is stiff; the thick sole still bends at the ball when she rises on her toes; the hip bells do not rest
  on her lap when she sits.
- Ideas not started: turning in place with steps, walking backwards and sideways, picking things up, more spells of her own.
- Standing rules are unchanged: keep the pass-13 face shape, hands at 7% smaller, one two-toned sheer veil with no strips.
