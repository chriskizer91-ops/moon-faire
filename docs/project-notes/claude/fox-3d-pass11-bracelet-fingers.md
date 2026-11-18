# Fox Witch 3D – pass 11 (the lowest bracelet; shorter fingers)

Written by Claude, 13 Nov 2026. Follows `claude/fox-3d-pass10-arms-hands-motion.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model` of `chriskizer91-ops/moon-faire`, commit `8bc3e77`.

## What Chris said (13 Nov, 11:13)

- "Her bracelet, the lowest bracelet, part of it is like disappeared inside. I think it's like her thumb."
- "Her fingers are like slightly too long ... shortening that just ever so slightly would make them look more realistic and not as strange."

## The bracelet

- **What was wrong.** The lowest of her three strands sits on the line where arm meets hand, to hide that join. It was laid on the oval of her wrist. Her hand is wider than her wrist there, at the root of her thumb, so the beads on that side were inside her hand.
- **What changed.** The beads are now strung after her hands are built (`src/33_bracelets.js`). Each strand lies on whatever is under it: her wrist's oval, or her hand where her hand stands out further. The upper two strands did not move.
- **When her wrist bends.** The lowest strand now rides a small bone at her wrist (`wrm`) that turns half as far as her hand does. So a bent wrist does not push her hand through the ring, and the ring does not tip into her forearm.
- Checked at rest from ten sides (`wristset.sh`) and in the wave, dance, laugh, talk and bow.
- Picture: `deliver/Fox_bracelet_on_her_hand.jpg`.

## Her fingers

- **He was right, and by how much.** Her finger lengths were the Jester's. Her own hand painting (D1) had been scaled to fit the model by its middle finger, so her palm was never checked against it. In D1 her middle finger, from the web to the tip, is 0.88 to 0.91 of her palm. On the model it was 0.94.
- **What changed.** All four fingers and the two free bones of her thumb are 5% shorter (`FINGER_K = 0.95` in `src/10_geom.js`). Her middle finger is now 0.89 of her palm. With her wrist and the painting's on one line, her fingertip and the start of her fingers now fall on the painting's.
- Picture: `deliver/Fox_fingers_vs_painting.jpg` (painting, before, now, at one scale).
- The fingertip points that her moves use follow the new length. The seven places where a fingertip touches her (glasses, bell, lips) were worked out again.
- `makeFox({ fingerLen: 1 })` gives the old length, for comparing.

## Found and not changed

- **Her fingers are also about 12% thinner than in her painting** (all four, measured at two heights). Thin fingers read as long ones. Chris asked only for the length, so the thickness was left for him to decide.
- With the bracelets off, a paler rectangle shows where her arm meets her hand. The bracelets cover it.

## For the other witches

- A painting scaled to fit the model by one length proves nothing about the model's other lengths. Check a second length (finger against palm) before trusting the fit.
- Anything worn on a join (a bracelet at the wrist, a collar at the neck) should be laid on the wider of the two parts it sits across, and should turn half as far as the joint.
