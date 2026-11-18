# Io 3D, stage nine: one pass on things passing through each other

November 13, 2026. Follows `claude/io-3d-stage8-party-moves-book-appears.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `112b610`.
One-file copy sent to Chris: `Io_3D_stage9.html`. Picture sent: `Io_stage9_pass_through_fixes.jpg`.

## What Chris said

"When she reads her book, the finger that she's using to like point at the book is phasing through the book. The hand that's holding the book is the book's hovering above that hand. So that's like pass through, phase through issues of the skeleton parts. And I wanted to say that the legs pass through the clothes a lot, and the arms pass through the sleeves of the cloak. If we can do a one pass of fixing all of those elements, then move on to the emotions, then spells and attacks."

## What changed

**Reading.** The book now lies on her left palm, and her right forefinger rests on the page. Her other fingers are folded up under her palm, clear of the paper. The book grows on her palm once her hand is nearly there, and her right hand comes down onto it from above.

**Legs and cloth.** Skirt and cloak are kept outside her legs. A knee pushes the cloth forward when she walks or jogs. It lies over her lap when she squats, kneels or hovers. Her left leg still shows through the slit in the skirt, as painted.

**Sleeves.** Each tier of a sleeve is now a ring of cloth round her arm. It follows her arm round her elbow. On a raised arm it rests on top of the arm and hangs below it, as in painting F5. The long point hangs from the cuff. Before, on a raised forearm the whole sleeve hung underneath and her arm came out through the cloth.

Standing still she looks the same as in stage eight (checked pixel by pixel from three sides: at most 58 of 395,200 pixels differ).

## The meter (new, and worth copying to the other witches)

`tools/pen.py` plays every move and counts points of cloth inside her legs, points of sleeve inside her arms, and points of her hands inside her book, with the deepest of each in millimetres. `tools/s9.sh` takes stills of the moves where cloth and limbs meet, from two sides.

| | Before | After |
|---|---|---|
| Cloth inside her legs, all sixteen moves | 7,499 points, up to 74 mm | 1,529 points, up to 12 mm |
| Hands inside her book | 4,675 points | 0 |
| Sleeve inside her arms | 1,189 points | 906 points |

- Standing still scores 99 leg points at 10 mm (cloth that lies close at her hips as built), so 1,529 over sixteen moves means every move is now about as clean as standing.
- The sleeve count misses the real change: her arm now stays inside the sleeve. What is left is cloth pinched in the crook of a folded elbow, and between a forearm and a thigh.

## Rules learned (for any witch with a long skirt, a cloak or wide sleeves)

1. **Measure it.** Stills alone missed how much was passing through; the meter found it in seconds and showed each try's effect.
2. **Hands and props: place the prop on the hand, then measure the fingertip.** Lay the thing on the palm wherever the palm really ended up. Then bring the fingertip to its point, measure where the tip is, and move the hand until it is right. Do not send hands to places worked out beside a prop placed from her chest.
3. **A skirt goes round the legs.** A point of skirt or cloak may never be where a leg is both further out from her middle and overhead. Move it the shorter way: out past the leg, or up onto it. Use the same rule in the chains and when the cloth is drawn.
4. **Never push cloth further from a leg than it lies when she stands.** Then the approved standing look cannot change.
5. **A sleeve is rings round the arm, not points hanging from it.** Each ring may slide only as far as its own slack, measured when she is built, so the arm is always inside.
6. **Sleeve cloth is not skirt cloth.** It only meets her legs: lift it onto a leg that lies level, move it straight out of a leg that stands.

Three tries that failed, so nobody repeats them:

- Cloth keeps to the side of each leg it was on at rest, turned with the leg's bone. Fails when a thigh rolls (the cross-legged hover).
- Cloth goes straight out of a leg, with neighbouring skirt chains tied together. The whole skirt climbed into her lap.
- Sleeve cloth lifted onto any leg overhead. Standing, the sleeve tails jumped up her arm.

## Honest limits

- Checked by the meter, by stills of every move from two sides, and by the full page test at phone size (no errors, Flipbook look on and off). I cannot watch her move, and it has not been tried on a real phone.
- Still passing through: her hair and her sleeves at her shoulders; a sleeve and her skirt or her side when her arm is close to her body; a little cloth pinched in the crook of a tightly folded elbow; in the hover a boot can show through the thin edge of the skirt.
- In the hover the skirt now covers her crossed legs like a tent, with her left knee out through the slit. That is how a long skirt would lie, but it hides more of her legs than stage eight did.
- The cloth push is done as the cloth is drawn, so shadows on the floor do not include it.
- When she jogs, the inside of the cloak can show pale at her left side.
- The new colours and the cloth push were not looked at closely in the Flipbook look; the page test only confirms the switch works without errors.

## Where things are

- `src/I99_static.js`: `readHands`, `handFrame`, `armTo` (reading); `LEGCAP`, `LEGS`, `legOut`, `legPush`, `LEGPAD`, `capMode` (legs and cloth); `sleeveFrames`, `sleeveStep`, `sleeveApply` (sleeves).
- `src/I45_robe.js`: the sleeve rings (`sl<side><tier>_<n>`), their `slack` and `rad` tables, the tail chain `svt<side>`.
- 210 bones (was 236). One frame of motion costs about 0.3 ms on the build machine.

## Next, in Chris's order

1. His eye on these fixes.
2. Her emotions: the faces in C10.
3. Her spells and attacks (H1 to H18, I1 to I8, round 4): the pendant becoming the sickle, the dagger drawn with witchfire, the book with its pages turning.

Still waiting on him from before: glasses bigger and bolder as in A1, or as built; bodice back laced (F7) or a plain seam (B3, as built). Still to do when he asks: bring her jog, squat, kneel and hover into line with the other witches' versions.
