# Fox Witch 3D – pass 1 (body, base outfit, head to size)

Written by Claude, 12 Nov 2026. Follows `claude/HOW-TO-3d-witch-models.md`. Reference prompts: `claude/fox-3d-reference-prompts.md`. Chris's decisions about her: `lore/discussion-notes.md`, "The Fox".

## What exists

- A single offline page, `Fox_Witch_3D.html` (1.4 MB), built from `models/fox-3d/` (branch `claude/fox-3d-model` of `chriskizer91-ops/moon-faire`, pushed 12 Nov). The folder holds the round 1 and round 2 paintings as WebP in `references/`.
- Her body in the **base outfit of painting B4**: brocade corset and green blouse (painted on from B1 and B4), plain charcoal leggings, brown lace-up boots.
- Face painted on from C1. Bun, a body of hair with curls over it, costume fox ears, round wire glasses, rose choker with its brass bell.
- All of the Jester's body controls work on her: stand, walk, run, kneel, squat, sit, hover; jump, talk, wave, bow, twirl, laugh, dance, look around, settle. 54 stance and move pairs run with no broken numbers.
- No trousers, belt, pouch, bracelets, tools or spells yet.

## How she was made

The Fox is a **fork of the Jester's code**. `makeJester` became `makeFox`; the files keep their numbers. Changed or new:

| File | What changed |
|---|---|
| `src/00_util.js` | `makeFox`, her colours added to `PAL` |
| `src/10_geom.js` | `FOX_SKIP`: any part added under a Jester-only material name is dropped, so the Jester's costume never appears. Hand scale 0.86 |
| `src/20_tex.js` | reads `window.FOX_TEX` |
| `src/30_body.js` | her torso table `TORSO`, arms `ARM_R`, puffed sleeves `PUFF`, legs `LEG` – all measured |
| `src/45_foxhead.js` | new: neck, choker and bell, scalp cap, the body of her hair (`massGrow`), bun, curls and locks, costume ears, glasses |
| `src/66_fox_strip.js` | new: removes the Jester's cloth (the helper functions in `60_veils.js` are still needed) |
| `src/40_head.js` | skull half-width 0.072 and chin 7 mm longer (`HR`) |
| `src/70_anim.js` | her materials; scale set **after** the skeleton is made; head scale 0.93 and head lowered 0.0245 |
| `bake_fox.py` | paints `out/fox_tex.js`: face from C1, corset atlas from B1 (above the waist) and B4 (below) |
| `compare_fox.py`, `headcmp.sh`, `viewset.sh`, `headset.sh`, `check_moves.sh`, `meas/prof.py` | checking tools |

Build: `./build.sh` → `out/fox.js`; `python3 -I bake_fox.py` → `out/fox_tex.js`; `./build_site.sh` → `out/site/`; `python3 build_single.py` → `deliver/Fox_Witch_3D.html`.

## Her measurements (from the paintings)

- A1 is 861 px a metre, soles on row 1500. B4 is 851 px a metre, soles on row 970. B1 is 572.4, B2 574.8.
- Height in boots 1.647 m. Ear tips 1.717 m.
- **Head, from A1 on a grid** (A1 rows; columns from the face's centre line at x 508): eyes row 157, pupils 54 px apart, nose base 186, mouth 208, chin 248, face 108 px wide at row 180, hairline 100 at the parting, ear bases row 88, ear tips row 22. The model now sits on those lines: head bone scale **0.93**, head lowered 0.0245.
- The first build had the head at scale 0.80. That was wrong, and Chris caught it on his phone ("the head is way too small"). See lesson 6.
- Heights: boot top 0.2585, knee 0.505, crotch 0.832, waist 1.12, shoulder 1.394, chin 1.463 m.
- Half-widths: hips 0.2075, waist 0.108 (depth 0.174).
- Everything is written in the Jester's frame and the whole figure is scaled by `FOX_K = 1.045`.

## Lessons from this pass

1. **Set the root scale after `new THREE.Skeleton(bones)`.** Set before, the bone inverses swallow the scale: bones grow but the skin does not, and everything read from a bone sits 4.5% off. It showed as the corset point 5 cm low against A1.
2. **Silhouette masks fail on charcoal against plum.** Use a colour-difference term (`meas/prof.py`), and settle doubts with a picture that has labelled height lines on painting and model side by side, not with numbers from a mask.
3. Sample skin colour on the forehead, not the cheek (blush makes it pink).
4. A leg tube that starts level with the hip surface shows as a hard band. Start it well inside the hips so it grows out of them.
5. The page test script wants every step as `"Label:seconds"`.
6. **Measure the head on its own grid, never from the whole-figure picture.** I had read the chin 8 px too high and guessed the top of the skull under the hair, which gave a head 16% too small. `headcmp.sh` puts A1's head and the model's side by side at four times A1's size with one numbered grid; read rows and columns off the labels, not by eye.
7. Hair needs a body under it. Curls alone look like noodles with sky between them. A dark lumpy shell (`massGrow`) standing 3 to 6 cm off the skull at the sides and back, with wavy locks lying on it and curls springing from it, reads as a head of hair.
8. The head bone can be moved and scaled after the skeleton is made (`SK.head.position.y`, `SK.head.scale`); the moves do not reset it.

## Known weak points

- Hair is the right size and place but still made of ribbons: too even in colour, not soft. The ears are narrower and smoother than painted (A1's are wider, dark-tipped, fluffy inside).
- Her face reads older and sterner than A1. The nose and mouth sit about 4 px (5 mm) lower than A1's because C1's own proportions differ a little from A1's.
- The head is still the Jester's skull shape with C1 laid over it: sides smear, no human ears, profile not hers (C3 has it).
- From the side her curls hide much of her face.
- Sleeves are about 15 px a side wider than A1's.
- Hands are plain skin (D1 and D2 not painted on yet). Boots are the Jester's shape in her colours (E1–E8 not used yet).
- Sleeves are too ball-like. Neckline and peplum ruffles are flat paint. The neck's plain skin does not quite match the chest's painted skin; the choker covers the join.
- A soft crease where hips meet thighs. The trousers cover it.
- Motion could not be judged here: the test machine draws about 2 frames a second. Chris needs to look on his phone.

## Open questions for Chris

- Keep C1 and C2 as her face, or redo them? They have more fine lines than C3, C13 and C14.

## Round 2 (arrived 12 Nov, during this pass)

All 17 (F1–F12, G1–G5) plus corrected grip sheets G5a and G5b, which replace G5. **Chris: the hands-holding-scissors sheets are a colour reference only** – take skin, steel and bracelet colours from them, not the grip shapes. Shapes of the shears come from G1 and G2.

## Next

Pass 2, costume: patchwork trousers (F6, F9, F10), belt and pouch (F7), bracelets (F2), studs and buckle on the choker (F1), real ruffles. Then face and hair again, hands, boots, tools, spells.

**Chris's rule for every part (12 Nov):** lay the model over the reference at the same height, width and depth, side by side, and fix what does not line up. Do this for each part before calling it done, and send him the overlay picture with the build.
