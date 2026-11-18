# Fox Witch 3D – pass 8: neck, chest, shoulders, wrists, and two head options to choose from (13 Nov 2026)

Written by Claude. Follows `claude/fox-3d-pass7-one-skin.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model`.

Chris, 13 Nov, after the one-skin build:

- Her neck is the right tone but needs detail painted onto it.
- Her chest wants a little more highlighting and shading.
- Move her bracelets down her forearm, or add one at the wrist, to hide the join of wrist and forearm, which shows from a distance.
- Paint texture onto her skin wherever it shows.
- The tops of her shoulders have a purple splotch.
- "Her face is good. I think her face is done other than maybe making her whole head a little bit larger." He asked for stills of her head 5, 10 and 15% larger with nothing else changed, and then, as well, for the depth reshaping beside how she is now.

Pictures: `deliver/Fox_head_sizes.jpg`, `deliver/Fox_head_depth_reshaping.jpg`, `deliver/Fox_neck_chest_shoulders_wrists.jpg`.

## Done in the build

- **Neck.** It was a plain fade of colour. It is now a painting (`neck` in the bake, made by `match_skin_fox.py`): the same borrowed skin as her arms, with the two cords from behind her ears to the pit of her throat, the pit itself, her throat catching the light, the two faint rings, the shade under her jaw, and a few freckles. Same skin recipe as everything else.
- **Chest.** Pass 7 kept 60% of the painted shadow and 18% of the painted highlight, which was too flat. It now keeps 90% and 45%. Still lit as skin, not as cloth, so it does not shine.
- **Shoulders.** The purple was the paintings' backdrop: seen from the front, the tops of her shoulders are edge-on, so the bake had filled them with whatever was behind her. Backdrop that touches the top or side edge of the body picture is now painted over with the nearest cloth or skin. The tops of her shoulders now carry the strap's own colours, a little blurred because few pixels cover them.
- **Bracelets.** All three strands moved 3.5 cm down to the wrist, as in A1. The last strand sits on the line where the arm's skin ends and the hand begins.

## Offered, not yet chosen: head size

`deliver/Fox_head_sizes.jpg` shows her as she is (head scale 0.85) and 5, 10 and 15% larger (0.8925, 0.935, 0.9775), full figure, close and at an angle. Hair, ears and glasses grow with the head; nothing else moves. For the record: 0.85 is the size of the head in the standing painting. Sized to A1 instead it was 0.93, which is 9% larger, so "10% larger" is about A1's head.

## Offered, not yet chosen: depth-only reshaping of her face

`deliver/Fox_head_depth_reshaping.jpg` shows her from six angles as she is and reshaped: worn, with hair and glasses off, and as plain shape.

- What it is: every point of her face may move straight back or straight forward and nowhere else (`faceDepth` in `variants/ownface/40_head.js`). Seen from in front nothing shifts, so the painting lands where it did.
- What moves, in millimetres: eye sockets back 5.5, deepest at the inner corner (6.5), with the round of the eye left standing 2.6; the sides of her nose back 5.8 and its ridge forward 3; nostril wings, brow, lips and chin forward about 2; the fold from nose to mouth corner cut 1.6 deep; and the shelf under her jaw sloped up toward her neck by up to 15.
- How the amounts were chosen: the profile painting `04-Left-90` was measured against the model's own profile. Allowing for the painting's head being tipped back about 5 degrees, her middle line was within 2 to 5 mm of the painting. The real fault was sideways: the bridge of her nose was a wide low mound and her eyes sat on a smooth band. The amounts above are an anatomist's guess fitted to that, not a point-by-point fit to the paintings.
- Straight on, with hair and glasses off, the two builds differ in 503 of 136,000 pixels by more than a tenth of full brightness. That is shading, not movement: the new sockets and the sides of the nose take the light differently.
- The glasses' nose pads follow the nose back when it is on.

On 12 Nov Chris said to only resize her head and not refit its shape. On 13 Nov he asked to see this. It stays off until he says.

## In the page

Two new switches beside "Full detail": **Reshaped head** and **Head +0%** (tap to step through 5, 10, 15 and back). Each reloads the page with its choice in the address, for example `#lite-depth-head110`.

## Checks

- All 54 stance and move pairs run with no broken numbers.
- With both options off, her hair, scalp and face meshes are point for point the same as in the last build (checked by sum).
- The single file (3.2 MB) opens offline at phone size as `#lite`, `#full`, `#lite-depth` and `#lite-depth-head110`, with no errors, and the switches write the address they should.
- **Not checked: motion.** The test machine draws about 2 frames a second.

## Known weak points

- Under her jaw and at the sides of her head she is still plain skin tone with no painted detail. Her hair covers most of it.
- The shoulder tops are a few stretched pixels of strap, not a painting of a shoulder.
- With a bigger head her neck, choker and hair are not re-fitted; that waits for his choice of size.
