# Ranger 3D, stage seven: soft sleeves, headband tails and loose hair

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `0444eca`.
One-file copy sent to Chris: `Ranger_3D_stage7.html`.

## What Chris said

"Take aim: her sleeves mesh into her arm. So if you're about to fix her sleeves, headband tails and loose hair moving, let's do those."

## What is soft now

- Her two lace sleeves.
- The two tails of her headband.
- Her sixteen loose locks (eight a side).

## How each one moves

- Each has a bone at its root: the sleeve at its band on the upper arm, the tails at the knot, each lock where it leaves her hair.
- Its skin hands over from the body to its own bone along its length, so it bends near the root and the root never tears away.
- The tip is a weight on a spring. It is pulled to where it would rest: the way it was built, bent toward straight down.
- When its root moves, the tip lags and then swings in. When she stops, it settles.
- It cannot swing past a set angle.
- A sleeve hangs further down the more that elbow folds. So in "Take aim" the drawing arm's sleeve hangs below the arm and her forearm no longer passes through it.
- When she is put in a still pose, everything settles at once.

Code: `SOFT` (declared in `src/R30_body.js`, filled there and in `src/R41_hair.js`), `softTick` in `src/R99_static.js`.

## Honest limits

- This is not real cloth. Each sleeve, tail and lock swings as one piece that bends near its root. Nothing folds or ripples.
- Nothing stops a lock passing through her neck or shoulder if she turns her head far, or a tail passing through her back.
- With her arm straight out, the arm can still touch the top edge of the sleeve near the hem.
- Tuned from stills. I have not watched it move.

## Checked

- Stills: the held "Take aim" from the front, arms straight out, a moment of the jog from the side, and the back of her head while jogging.
- The one-file page in a phone-size browser: no errors. Not checked on a real phone.

## Next

1. Chris's eye on the walk, jog and the soft things in motion.
2. If he wants more: sleeves that fold (two or three bones down each sleeve), and locks kept out of her neck and shoulders.
3. More of her own moves; the bow and sword.
