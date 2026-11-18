# The Ranger in 3D, stage three: hands and painted arms

November 12. Follows `claude/ranger-3d-stage2d-fidelity.md`.

## What Chris asked

"Leta move on to her hands and painted arms."

## What changed

- **Hands.** Her left hand wears D1 and her right hand wears D2: backs, palms and every finger. Nothing is mirrored, so each hand has its own lines and moles.
- **Nails.** They are the nails in the paintings, short and natural. The model's nail plates are now only a clear gloss over them.
- **Forearms.** Painted from the same two pictures, from the wrist to about 15 cm above it, with the moles where they were painted.
- **The rest of the arm.** Above the painted part, the skin carries on in the forearm's tone and fine grain, and turns to her shoulder tone under the sleeve.
- **Wrist.** Slimmer: 4.7 cm across. It was 5.3 cm. D1 and D2 show her wrist at 0.86 of the width across her knuckles, and A1 gives about 4.5 cm. It also sits in line with the middle of her hand now.
- **A patch on the palm.** Once the arm was painted, its hidden end showed through the heel of the palm. The end was thinned so it stays under the skin.
- **The page.** A new row, "Hands and arms": each hand, each palm, each arm, with the painting beside it. It opens on her left hand.

The shape of her hands was not changed.

## Measured

Her painted hand is not the same shape as the hand she wears, which is the Jester's hand model.

| | Painted (D1) | Hand model |
| --- | --- | --- |
| Middle finger, web to tip | 284 px | 84 mm |
| Palm, web to wrist | 362 px | 89 mm |
| Little knuckle to index knuckle | 207 px | 57.3 mm |

So her painted hand has a longer palm and shorter fingers. The paint is fitted piece by piece: the palm by its own length, each finger from its own root to its own tip. The paint on the fingers is drawn out about 15%.

Against A1 her hand is about the right size: 166 mm painted (with fingers a little curled) against 161 mm on the model.

## Decisions I made, for Chris to overrule

1. **Slimmer wrist.** The body was approved, and the wrist is part of it. I changed it because the hand paintings show it clearly and because he had flagged the wrist earlier. The old numbers are in the repo history (commit `3958882`).
2. **Hands not reshaped.** They were approved ("the hands look really good already"). Refitting the hand to her painting (longer palm, shorter fingers) is possible if he wants it.
3. **Nails as a clear gloss.** The Jester's solid nail plates would have covered the painted nails.

## How it was checked

- Each hand and forearm from four sides beside its painting (`tools/shoot_hand.py`).
- Slices through the wrist, arm against hand (`tools/wrist_sections.py`).
- The page at phone size on the build machine: every hand and arm button, a drag, no errors (`tools/page_test.py`). Not tried on a real phone by me.

## Still rough

- The thin edge of the hand (little-finger side, and round the base of the thumb) is soft paint with no detail. Neither painting shows it.
- Where the arm meets the shoulder there is a step. It is the shape of the body, which was not touched. Smoothing it would mean reshaping the shoulder.
- Her fingers do not bend yet. That comes with movement.
- The palms look dark in the "palm" views because they are seen from below, away from the light.

## Where things are

- Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (same link as every stage). One offline file: `Ranger_3D_stage3.html`.
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`, commit `2217016`.
- Code: `bake_hands_r.py`, `hand_marks.json`, arms in `src/R30_body.js`, hands in `src/32_hands.js`, materials in `src/R99_static.js`.
- Build order: `bake_ranger.py`, then `bake_head.py`, then `bake_hands_r.py`, then `build_r.sh`, then `build_single_r.py`.

## Next, in the how-to's order

Boots again (E1 to E8), strap hooks, belts, satchel and pouch, cloth, jewellery (rings and bracelets from D3), weapons, then movement.
