# Ranger 3D, stage nine: fingers that curl, her bow, Moonsteel Draw

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `181356a`.
One-file copy sent to Chris: `Ranger_3D_stage9.html`.

## What Chris said

"Yes, let's continue to her spells and attacks, starting with fingers that curl and her bow. In Moonsteel, draw. Yes, go."

His "yes" also settles the choices that were waiting: the bow folded on her back with limbs that curl like fern tips, the sword at her left hip, the knives across the back of her belt, and the order of work below.

## What is new

**Fingers**
- Her fingers curl. Hand shapes: relaxed, soft, open, fist, grip (bow hand), hold, hook (three fingers on the string).
- Her hands ease from one shape to the next.
- In "Stand still" they stay straight, for checking against the paintings.

**Her bow** (paintings G1, G2)
- Moonsteel, a dark blue leather grip with a collar at each end, a crescent holding a blue gem either side of the grip.
- Each limb is two rails with a vine and leaves between them, closing to one stem and a small curl.
- 96 cm tip to tip. The G1 prompt said 130 cm, but in her own paintings (H2) it is smaller, so it is sized to those.
- Folded, each limb rolls up toward its tip like a fern. It is 37 cm long then, and rides upright on the middle of her back.
- It unrolls from the grip outward, so the curl never sweeps across her hand.

**Moonsteel Draw** (paintings H1, H2, H4). It replaces "Take aim".
1. Her right hand goes behind her back and pulls the bow free by its lower crescent.
2. She brings it round her right side to the front. Her left hand takes the grip.
3. The limbs unroll as her left arm starts out. Sparks show where the string will be, then the string of light.
4. Her right hand hooks the string while it is still in reach. She pushes the bow out and pulls the string back together.
5. Full draw to the corner of her jaw, right elbow high, eyes narrowed. An arrow of light has formed on the string.
6. She lets go. The arrow flies toward screen right with a thin trail, her hand springs back with the fingers open, the string sings.
7. The bow dips, rolls up, goes back to her right hand and onto her back.

**How her arms work now**
- Her hands are put where they need to be (on the grip, on the string) and her arms are worked out from that.
- The bow's path is written out, and her hands follow the bow. At every still that was checked, both hands reached.

**Light**
- String, sparks and arrow are light only. In the Flipbook look they stay soft and get no ink line.

**Page**
- "Moonsteel Draw" button in place of "Take aim". It turns the camera to the front so the bow fits at screen right.
- "Back" in the camera row. "Bow" switch under "More views and switches".

## Checked

- Stills at 23 moments of the move from the front, the take from behind, close-ups of her face and both hands at full draw.
- The folded bow from behind and from the side.
- The Flipbook look at three moments of the move.
- Her hands in Ready, Talk, Cheer and Jog.
- The page at phone size: no errors, and a drag turns her.

Not watched in motion. Not tried on a real phone.

## Still rough

- Timing is tuned from stills. It needs Chris's eye.
- Her feet slide out to the wide stance instead of stepping.
- Nothing holds the bow to her back: no clip or loop.
- From behind, her fingers go a little way into the bow's curl as she takes hold.
- In the Flipbook look the bow's thin silver is mostly ink line, so it reads dark.
- At full draw her hand sits in front of her chin from the front camera.

## For the next session

- Files: `src/R46_bow.js` (the bow), `src/R99_static.js` (fingers `FP` and `fingersTick`, `reach`, `armsAndBow`, the light `FX`).
- `R.seek(name, t)` puts her at one moment of a move. `tools/seq.sh` takes a row of stills with it.
- `tools/page_test.py` is slow without a graphics card. Run it as `PART=1` (bow and draw) and `PART=2` (the rest).
- The same `reach` and hand shapes are meant for the sword and knives.

## Next, in the order Chris agreed

1. Sword at her left hip: a fencer's guard and a full cut with a long step (G4, H7).
2. Knives across the back of her belt: wind-up and throw (G5, H8).
3. Silverglass (H6) and the gem (H9).
4. Hit reactions, a dodge, a win and a fall.
