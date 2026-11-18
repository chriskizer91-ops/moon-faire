# Fox Witch 3D – pass 7: one skin, resting hands, and why her face goes wrong off-centre (13 Nov 2026)

Written by Claude. Follows `claude/fox-3d-pass6-belt-pouch-shears.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model`.

Chris, 13 Nov, looking at the sleeves and arms picture:

- "The skin tone of her hands compared to her arms compared to her chest compared to her face are not the same." He wants them colour matched and matte matched.
- Her arms need more detail painted onto them. Her chest is very shiny compared to her face, "which makes her face look weird". The detail on her hands could do with a little softening.
- Her arms should hang closer to A1 and A2, with her whole hand turned at the wrist so her palm faces in toward her body.
- Good as they are: hair, fox ears, the shears, pouch and belt, the trousers, the boots.
- Her face "looks perfect straight on" and looks weird from every angle that is not straight on (side to side, from 45 degrees above, from 45 degrees below). He does not know how to direct a fix that will not spoil the straight-on view.

Pictures: `deliver/Fox_skin_and_resting_hands.jpg`, `deliver/Fox_face_off_centre_vs_paintings.jpg`.

## What was wrong with her skin

Measured in the same front render, as red, green, blue:

| Part | Before | Now |
|---|---|---|
| Face (cheeks, chin) | 192–209, 113–128, 95–107 | unchanged |
| Neck below the choker | 255, 187, 166 | 211, 131, 101 |
| Chest | 255, 203, 182 (red at its limit) | 217, 136, 107 |
| Upper arm | 227, 154, 129 | 207, 127, 97 |
| Forearm | 232, 160, 137 | 210, 130, 101 |

Three causes:

1. **The tone was read off her forehead**, the lightest part of her painted face (`#e1a086`). Everything unpainted took that tone, so her arms, her neck and the edges of her own face were paler and less ruddy than her face. It is now the middle tone of the painted skin of her face (`#cc8262`), set in `bake_face_r5.py`.
2. **Her chest was lit as cloth.** It is part of the corset's painting, and the corset's material has no glow of its own and takes five times the sky's light that her face does. The painting of her chest also has shine painted into it.
3. **Her arms were one flat colour** with a few drawn freckles, next to hands and a face full of painted detail.

## What changed

- **One recipe for all bare skin** (`src/70_anim.js`): tint `#d8ccc6`, 44% of its own picture as glow, roughness 0.66, a fifth of the sky's light, the same soft rim. Face, neck, arms and hands already shared most of it; now they share all of it.
- **Her chest is lit by that recipe.** `match_skin_fox.py` writes `bodySkin`, a picture of where the body painting is skin. The torso material reads it and, on those pixels only, uses the skin recipe. The corset keeps its cloth finish.
- **The painted shine is off her chest.** In the bake, shadows on her chest keep 60% of their depth and highlights 18%. Freckles and the soft shading of her collarbones stay. The chest is set 5% under the tone, because it faces the light more than her face does.
- **Her arms are painted from the hand paintings.** D1 and D2 show the forearm above each hand, front and back, at the same scale as her hands. Their lighting is divided out, leaving skin: freckles, fine texture, the creases at the wrist. That skin is wrapped round the arm from the wrist up, so arm and hand are one piece of painting. Above the real paint it is borrowed again, winding slowly round the arm so the repeats do not line up. Drawn on top: the flush and wrinkles on the point of her elbow, the creases inside it, the paler inside of her forearm, and freckles as in A1.
- **Her hands are softer.** 40% of the painted detail (veins, tendons, creases) is taken off, and their broad lights and darks are evened out so the back of the hand is not a paler patch at the end of the arm.
- **The arm's skin sleeves the wrist** by a millimetre or two. Before, the top of the hand showed through as a pale rectangle above the wrist.

`match_skin_fox.py` replaces `tone_skin_fox.py` and must run last, once, on a fresh bake.

## Her resting hands

- The turn of a hanging hand (`HANG_TW` in `src/75_pose.js`) goes from -1.35 to -0.85: her palm faces in toward her thigh. A1 from the front and A2 from behind do not quite agree about this turn (A1 suggests about -1.1, A2 about -0.6); -0.85 sits between and follows what Chris asked for.
- Resting fingers (`FP.relax` in `src/70_anim.js`): a little more curl and closer together. Resting wrist bent a little more (`REST_WR`).
- Her arm's shape is as in pass 5 except at the wrist, where it is a millimetre or two fuller. Its outline against A1 was not re-measured in this pass; by eye it still sits on A1 and A2 (`handcmp.sh`).

## Why her face looks wrong off-centre

`deliver/Fox_face_off_centre_vs_paintings.jpg` puts her head, with hair and glasses off, under the round 5 paintings at 45 degrees, in profile, from below and from above; once painted, once as plain shape.

Straight on, the painting does all the work, and it is a good painting. Turn her and the shape under the paint shows. The shape is shallow:

- No eye sockets. Her eyes are paint on a smooth band; a real eye sits a centimetre back under the brow.
- Her nose stands out too little and its bridge is flat.
- Her cheeks are one flat plane from nose to ear. In the paintings the cheekbone is the widest point and the cheek falls back from it.
- Her lips and chin barely stand out in profile.
- Under her jaw is a wide flat shelf with a sharp edge, which is what looks so wrong from below.

**A fix that cannot spoil the straight-on view:** move points only toward or away from the viewer. Seen from straight in front, a point that moves straight back or forward stays on the same spot, so the painting lands exactly where it does now. Every fault above is a fault of depth. The depths can be read off the profile and 45-degree paintings (`04-Left-90`, `05-Right-90`, `02-Left-45`, `03-Right-45`, and F3).

**Not done, and waiting on Chris.** On 12 Nov he said to only resize her head, not refit its shape to the new side views. This would change the shape of her head in depth, so it needs his word.

## Checks

- All 54 stance and move pairs run with no broken numbers.
- Her hair, scalp and face meshes are point for point the same as in the last build (checked by sum).
- The single file (3.2 MB) opens offline at phone size in both builds: phone build 292k triangles, full 527k.
- **Not checked: motion.** The test machine draws about 2 frames a second.

## Known weak points

- The paintings' own skin is paler than this (A1's arm is about 204, 148, 126). Her body now follows her round 5 face, which is ruddier.
- The borrowed skin above mid-forearm repeats; it is hard to see, but it is not new paint.
- The front painting of her face also lands on the back of her head, under her hair.
