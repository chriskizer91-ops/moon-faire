# Ranger 3D, stage seven second pass: sleeves her arms push aside

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `fa936a0`.
One-file copy sent to Chris: `Ranger_3D_stage7b.html`.

## What Chris said

With a photo of "Take aim" on his laptop: "You have to make the sleeves not mesh with her arms. Her arms moving move it out of the way, but it still acts like fabric."

## What was wrong with the first try (stage seven)

- Each sleeve swung from its band as one piece, like a bell. Nothing knew where her arm was, so the arm passed through the cloth, and on her drawing arm the sleeve hung straight down like a bag.

## How a sleeve works now

- A sleeve is a loop of cloth round her upper arm.
- With her arm raised, the loop slides toward the ground until its top rests on the top of her arm. The rest hangs below.
- When her elbow folds, her forearm pushes the loop away and gathers it up toward her shoulder.
- The slide always stops short of the loop's own slack, so her arm stays inside the cloth.
- It follows on a spring, so it sways and settles when she moves.

Numbers: the hem slides up to 2.6 cm toward the ground (on top of 1.9 cm built into its shape), up to 4 cm away from a folded forearm, never more than 4.4 cm in all; a fully folded elbow gathers the hem to 72% of its size.

Code: two bones per sleeve at its band (`slmL`, `slmR` for the middle; `slvL`, `slvR` for the hem), listed in `SLEEVES` (`src/R30_body.js`); `sleeveTick` in `src/R99_static.js`.

Headband tails and loose locks are unchanged from stage seven.

## Honest limits

- Still not full cloth: the sleeve keeps its bell shape and slides and gathers; it does not wrinkle or fold over itself.
- With her elbow folded as far as it goes, a little lace can still touch her forearm.
- Checked in stills only: "Take aim" from the front and at three-quarter, and arms straight out. Not watched in motion, not on a real phone.

## Next

Chris's eye on the sleeves in "Take aim", "Cheer" and the jog; then the walk and jog themselves; then more of her own moves and her bow and sword.
