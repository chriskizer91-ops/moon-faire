# Fox Witch 3D – pass 5: sleeves and arms (13 Nov 2026)

Written by Claude. Follows `claude/fox-3d-pass4-face-round5.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model`.

Chris, 13 Nov: "let's continue on to the sleeves but also her arms". He also reset the list (see the end).

Picture: `deliver/Fox_sleeves_arms_vs_paintings.jpg` (A1 and the model at one scale, A2 and the model from behind, the sleeve sheet F5 over the model's sleeve).

## What the paintings say

All at A1's scale: 861 px a metre, soles on row 1500, her middle on column 508. Tool: `armcmp.sh`, and `meas/arm_width.py` for the arm's edges row by row.

| Thing | Painting A1 | Model before | Model now |
|---|---|---|---|
| Elbow (column, row) | about 688, 528 | 723, 533 | 691, 542 |
| Wrist | 775, 708 | 784, 721 | 774, 705 |
| Forearm at its widest | 7.8 cm, 3 to 4 cm below the elbow | 7.0 cm, a straight tube | 7.7 cm |
| Forearm two thirds down | 4.8 cm | 5.9 cm | 4.7 cm |
| Sleeve, widest | 7.1 cm out from the arm's line | 9.0 cm | 7.2 cm |
| Sleeve band | 14 cm down from the shoulder joint | 16 cm | 14.6 cm |
| Ruffle hem | 19 to 20 cm down | 20 cm | 19.6 cm |
| Sleeve colour (average) | 48, 62, 66 | bright emerald | 53, 66, 65 |

Row by row down the forearm, the model's width is now within 2 px (2 mm) of A1's and its middle line within 3 px.

A5 (arms out) gives the arm's other thickness: 7.1 cm below the elbow, 3.9 cm at the wrist. Its arms are drawn short, so lengths come from A1 only.

## The sleeve (`src/30_body.js`, table `SLEEVE`)

- A ball of linen that starts 5 cm above the shoulder joint, is widest half way down, overhangs the band a little, then a band with 21 gold beads and a 5 cm ruffle.
- Gathers are uneven on purpose: each fold has its own width and depth (several wave counts added together, with the spacing wobbling round the arm). Even pleats looked like a pumpkin.
- Where the ball would cover the corset strap it is pressed flat against her side (`SLEEVE_IN`), as in A1, where the sleeve comes out from under the strap.
- The cloth is a new drawn linen (`emerald` in `src/70_anim.js`): fine weave, slubs, mottle, in A1's dark green.
- The phone build has fewer points round the sleeve (81 against 108), so it gets fewer, broader gathers (`COARSE`).

## The arm (table `ARM_S`)

- Its own width and depth all the way down, where it was one round tube: a swell below the elbow, a taper to a flat wrist that meets her hand's wrist (4.4 by 2.8 cm), the point of the elbow, the hollow inside it, the wrist bone.
- Skin (`arm` material): her face's tone, paler down the inside of the forearm, flushed at the elbow, freckled on the outside and back as in A1 and A5.
- Built once as her left arm and mirrored, so both arms are the same.
- Her bracelets now lie on the wrist's oval, with the beads spaced evenly round it.

## How her arm hangs

In A1 her elbow sits in toward her waist and her forearm angles out. Three changes give that:

1. **A fault in the pose solver, mended.** The solver measured hand and foot targets in the world but her limb lengths in the unscaled frame, 4.5% shorter. Every target looked too far away, so her arms hung dead straight and never bent at rest. Limb lengths are now multiplied by `FOX_K`. Eight poses were compared before and after (`poseset.sh`): no move looks different to the eye, and hands now land where the moves put them.
2. **Resting wrist** moved to where A1 has it (`REST_HX` 0.290, `REST_HY` 0.882).
3. **A hanging arm tucks its elbow in** (`HANG_IN` in `src/75_pose.js`). It fades out as the hand lifts above her waist, swings forward or back, or moves away from her side, so every move keeps the elbow it was written with.

The hand is then turned to face as it does in A1 (`HANG_TW`, -1.35). That turn goes to three new bones along the forearm (`ftwA`, `ftwB`, `ftwC`), a third each, so the skin twists along the forearm instead of wringing at the elbow. The `tw` channel that moves already use goes the same way.

## A fault in my comparison pictures, mended

The stage camera sees 60 m and no further. My side-by-side renders are taken from 60 m away, so the far limit ran through her middle and **everything behind her middle was cut off on the model side**: back hair, the backs of the elbows, the back half of anything wide. It showed up now because the elbow moved back and a piece of arm vanished. `T.view` in `test.html` now moves the limits with the distance.

- The page Chris opens was never affected.
- Measurements read off the front of her (eyes, lips, chin, joints) were not affected.
- Outlines were: in earlier comparison pictures her hair and anything behind her middle looked smaller on the model than it really was.

## Checks

- All 54 stance and move pairs run with no broken numbers.
- Her hair, scalp, ears and face meshes are point for point the same as in the last build (checked by sum).
- The single file opens offline at phone size in both builds: phone build 283k triangles, full 512k.
- **Not checked: motion.** The test machine draws about 2 frames a second. How the arm swings when she walks, and how the wrist turn fades in and out, need Chris's eye on his phone.

## Known weak points

- The sleeve is a shape carried by her arm, not cloth. With an arm raised (the wave), the ball narrows where it meets her shoulder.
- The model's hand reads a little larger than A1's.
- The model's skin is lit brighter than the paintings everywhere (chest, arms, face alike).

## Chris's list, as reset on 13 Nov

Boots good. Glasses good. Hair good "at least until multiple other things get perfected". Trouser legs look good already; improve only if there is a clear gain.

1. Belt, shears and pouch: more detailed work
2. Face: still needs work
3. Ruffles at the neckline and peplum
4. Round 3 (tools), then round 4 (spells)
