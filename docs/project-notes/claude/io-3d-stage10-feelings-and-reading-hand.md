# Io 3D, stage ten: her feelings (C10), and a slower reading hand

November 13, 2026. Follows `claude/io-3d-stage9-pass-through-fixes.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `648bc33`.
One-file copy sent to Chris: `Io_3D_stage10.html`. Picture sent: `Io_stage10_feelings.jpg`.

## What Chris said

"Okay when she's reading the book her pointer hand. It's her right hand and she's like following the lines reading the book. Can you slow that movement down? It's like kind of jerky moving fast. I don't know if that's a rendering issue or that's how you timed it but slow her reading motion down. And move on to doing her emotions for the next pass. The faces in C10"

He said nothing against the stage nine fixes (book on her palm, legs and cloth, sleeves).

## The reading hand

It was my timing, not his screen.

- Before: her fingertip jumped 11 cm back to the top of the page in a single frame every 5.2 seconds, and turned the leaf in under half a second.
- Now: one round takes 12 seconds. 8.4 seconds down the page with a slow drift along the lines, then her hand lifts, goes to the edge, turns the leaf across, and comes back to the top. Every stretch eases in and out.

| Her fingertip over the page | Before | After |
|---|---|---|
| Usual speed (middle value) | 3.0 cm a second | 2.2 cm a second |
| Fastest | 652 cm a second (the jump) | 12 cm a second (turning the leaf) |
| Biggest change of speed between two frames | 650 cm a second | 0.6 cm a second |

`tools/tipspeed.py` measures this. **Rule: any hand that repeats a path must be measured for jumps where the round starts again.**

## Her six feelings

From C10, whose prompt asked for "reading, working a spell, being surprised, being hit, being stern, being delighted":

| On the page | In the code | What it is |
|---|---|---|
| Reading | `reading` | eyes lowered, a small smile |
| Concentrating | `casting` | brows drawn together, eyes narrowed |
| Surprised | `surprised` | brows up, eyes wide, lips parted |
| Hit | `hit` | a wince: eyes shut tight, lips pressed |
| Stern | `stern` | calm, not smiling, eyes steady |
| Delighted | `delighted` | eyes crinkled nearly shut by a big closed-lip smile |

- Each is her whole painted face from C10, laid over her own face, with a small turn of her head and shoulders. Surprise and a hit come quickly; the others ease in.
- On the page there is a new row, Her feelings. She keeps the one picked through any move. None takes it off.
- Some moves use one by themselves: her reading face when she reads and at the bottom of her curtsey; concentrating when she lifts her sickle; delighted in the twirl and when she smells the herb.
- She blinks only in Concentrating and Stern. The others hold their own eyes.
- Her talking mouths can go over any feeling.

## How the faces were made (for the next witch with an expressions sheet)

1. **Whole-face patches, not eyes and mouths.** An expression moves brows, cheeks and mouth together. Each patch is her face inside its outline. About 50 KB each; the page grew from 2.85 to 3.17 MB.
2. **The six faces in the sheet were not in the same place or at the same size as the earlier states sheet**, though the prompt asked for it. C10's faces are 1.19 times larger than C9's, and their middles sit at 258, 226, 290, 258 and 227 pixels from box to box. So each face is placed by itself: its middle (where the face is most alike left and right) and its lip line.
3. **Picture-matching (ECC) was tried for the placing and rejected** for all six: it changed their size by up to 13% and stretched them. Measure eyes and lips instead.
4. **Edges:** the patch narrows toward her forehead and drops anything much darker than her skin away from her features (hair at her temples); it stops above her chin, so the head keeps its own chin and jaw; and it takes the broad light and colour of the face under it, fully at its rim.
5. **Check the flat face picture before blaming the bake.** Dark marks at her temples and a line at her jaw turned out to be shadows from her hair when her head turned, not paint. Rendering with her head held still showed it.

Code: `bake_head_io.py` (the section after C9's states), `paintFace(eyes, mouth, emo)` in `src/I40_head.js`, `setFeel`, `FEELS`, `FW` and `emo` in `src/I99_static.js`.

## Honest limits

- The feelings are paint on a head whose shape does not change. From the side they show less than from the front, because the side of her head wears the profile painting, which is at rest.
- Surprised looks paler than the others: her head tips back out of the shade of her hat.
- C10's faces are not exact copies of her own face with one change; proportions differ by a few percent, so her mouth sits a millimetre or two differently in some of them.
- The feelings were not looked at in the Flipbook look; the page test only confirms the switch still works.
- Checked in stills from three angles (hat and glasses on, and off), by the fingertip meter, by the pass-through meter (unchanged from stage nine), and by the full page test at phone size (no errors). I cannot watch her move, and it has not been tried on a real phone.

## Next, in Chris's order

1. His eye on her feelings and the slower reading hand.
2. Her spells and attacks (H1 to H18, I1 to I8, round 4): the pendant becoming the sickle, the dagger drawn with witchfire, the book with its pages turning. Her feelings are ready for them: Concentrating while she works a spell, Hit when she is struck, Stern, Delighted.

Still waiting on him from before: glasses bigger and bolder as in A1, or as built; bodice back laced (F7) or a plain seam (B3, as built). Still to do when he asks: bring her jog, squat, kneel and hover into line with the other witches' versions.
