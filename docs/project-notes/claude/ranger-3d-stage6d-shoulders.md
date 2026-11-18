# Ranger 3D, stage six fourth pass: her shoulders

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `a7c2267`.
One-file copy sent to Chris: `Ranger_3D_stage6d.html`.

## What Chris said

With two phone screenshots of "Take aim" (arms raised): "She's looking pretty good. Just the way her arms attach to her torso is very goofy, clunky looking. We may have to come up with something that hides this."

## What was wrong

- The first 9 cm of each arm was shared between her body and her arm. When the arm lifted, that stretch was pulled two ways and pinched, so the arm looked stepped where it met her shoulder.

## What changed

- Each arm now turns in her shoulder like a ball in a socket. Everything of the arm that shows moves as one piece about the joint. Only its hidden tip, inside her body, stays behind. (`wArm` in `src/R30_body.js`.)
- Under the joint her body's skin goes 30% of the way with the arm, so her armpit opens as the arm lifts. (`wTorso`.)
- Only the way skin follows bones changed. Her shape standing still, which Chris approved, is the same.
- In "Take aim" her drawing arm is a little lower, so her hand comes nearer her jaw.

## Tried and dropped

- Letting the top of her shoulder follow the arm as well. It made a round lump on each shoulder with a notch beside it when her arms were out. Do not go back to that.

## So nothing needs hiding

Chris wondered about covering the join. With this fix it reads cleanly with her arms straight out, at 55 degrees, and in "Take aim", front and back, so no cover was added. If a pose still shows it, the next step is to round the corner of her shoulder to the same curve as the top of her arm.

## Checked

- Stills: arms straight out from the front and the back, arms at 55 degrees, and the held "Take aim".
- The one-file page in a phone-size browser: no errors. Not checked on a real phone, and not watched in motion.

## Still next, in Chris's order

1. His eye on the walk and jog after the feet and stiffness fixes.
2. Cloth and hair that move with her: sleeves, headband tails, loose locks.
3. More of her own moves; the bow and sword.
