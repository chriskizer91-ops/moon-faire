# Ranger 3D, stage six third pass: feet, stiffness, slower moves, a simpler page

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `9abaa8b`.
One-file copy sent to Chris: `Ranger_3D_stage6c.html`.

## Chris's notes on her first moves

- Walking and running: "her feet are bending unnaturally at the back of her step."
- "She's kind of too stiff." "She is Terminator running."
- "All the bags moving and the charms moving are great." (Keep them as they are.)
- "I can't see most of her moves because she does them fast."
- "There's a lot of buttons. The UI for this interactive page is kind of a lot."

## What changed

**Feet** (`src/R99_static.js`, the gait block)
- The cause: the code kept her sole level at all times, so with her knee folded behind her the ankle was bent far past what an ankle can do, and the boot was folded at the toe.
- Now: on the ground her sole lies flat until the leg is too far back, then the heel lifts. In the air the foot hangs loose with the toes down and comes up to land on the heel. The ankle is held to 0.26 rad up and 0.30 down. Her boots are stiff, so the toe never folds.

**Stiffness**
- Spine, neck and head each move a beat behind the part below, so she is not one block.
- Forearm and hand trail the upper arm; the shoulder rides with the arm; the hand comes a little across her body.
- Her head drifts slowly instead of being locked forward.
- The ready stance looks about, and breathes into her knees and arms.

**Jog**
- Lighter and more upright: one cycle 0.72 s (was 0.62), less forward lean, softer arms, a little more bounce.

**Seeing the moves**
- Take aim and limber up play about one and a half times slower.
- A short move plays again after a pause for as long as it is the one chosen.
- "Half speed" slows everything.

**The page**
- On top: "Her moves" (8 buttons) and "Camera" (whole body, front, side, head, hips), with "Half speed" and "Give them a swing".
- It opens on her whole body in the ready stance.
- Everything else (painting comparisons, face, boots, hands, poses, show switches) is folded under "More views and switches". The notes are folded too.

## Honest limits

- Still tuned from stills. I cannot watch it play.
- Her toes can dip a centimetre or two into the floor at push-off, because the boot is one stiff piece.
- Sleeves, headband tails and loose locks are still stiff. That is next.
- Fingers do not curl.

## Next, in Chris's order

1. His eye on the walk and jog again.
2. Cloth and hair that move with her: sleeves, headband tails, loose locks.
3. More of her own moves, and the bow and sword so "take aim" has something to draw.
