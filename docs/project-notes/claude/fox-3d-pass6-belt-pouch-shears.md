# Fox Witch 3D – pass 6: belt, pouch, sheath and shears (13 Nov 2026)

Written by Claude. Follows `claude/fox-3d-pass5-sleeves-arms.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model`.

Chris, 13 Nov: "the belt, scissors and pouch need more detailed work". Before this pass they were plain rounded lumps.

Picture: `deliver/Fox_belt_pouch_shears_vs_paintings.jpg` (A1, the model at A1's scale and the standing painting; the pouch beside sheet F7; the sheath beside sheet G3).

## How they are made now

Each piece is built to the painting of it, and wears that painting as its leather.

| Piece | Painting | Size in the painting | Her size |
|---|---|---|---|
| Belt | F7 | 69 px across | 2.8 cm wide, 4.4 mm thick |
| Pouch | F7 | 342 px across, 447 tall | 11.6 cm wide, 15.2 tall, 3.6 deep at the sides |
| Sheath | G3 | 535 px long, 153 across the mouth | 22.8 cm long, 6.5 across |
| Shears | G1 | 1310 px long | 26 cm long |

- `bake_gear_fox.py` cuts the paintings into one picture, `gear`: the pouch's front, back and side, the sheath's front and side, the belt's holed tail and a plain patch of leather. It also writes `gearLayout`, a map from any spot on a painting to the same spot in the picture, and `beltTex`, a length of belt between two studs that repeats without a seam. The purple backdrop is painted over with the nearest leather; holes stay dark.
- `src/48_foxgear.js` builds the pieces:
  - **Belt**: a flat strap with rounded edges all the way round her, F7's stitched leather repeating along it, brass studs 4 cm apart from the buckle round her right side and back, a brass buckle frame with its prong, the holed tail lying on top toward the pouch, and a leather keeper.
  - **Pouch**: a front, a back and the strip between them, each with its own painting; the flap over the top and down to its curved edge, standing proud with real thickness; the strap down the middle; the brass snap; the loop behind it with its stud. The embossed flower and the stitching are F7's own.
  - **Sheath**: front with a dipped lip, back, a dark inside seen through the mouth, two brass studs, and the loop that goes up behind the belt, over it and down to a stud.
  - **Shears**: two steel halves on a brass screw with a crossed slot. Each half is a blade with a spine and a thin edge, a shank, and a bow (the large oval one and the small round one). They sit in the sheath with the bows standing out, as in G3.
- Brass studs and snaps are real domes placed exactly over the painted ones.

## How they are worn

Read off A1 (861 px a metre) and the standing painting.

- **The belt sags.** In A1 it runs in a straight line from her right hip (column 380, row 602) through the buckle (545, 677) down to the pouch on her left (630, 712): 12 cm of drop. It is level round her back at her waist. Behind the pouch it climbs steeply back up to her waist at her left side, which is the strap seen above the pouch in A1. The paintings do not quite agree with each other about that strap; this reading matches A1 and the standing painting from the front.
- **The buckle** sits 4 cm to her left of the middle.
- **The pouch** hangs on the low point of the belt at her left hip, turned about 40 degrees from straight ahead, lying on the slope of her hip.
- **The sheath** hangs from the belt on her right hip by its loop. Its tip rests on the upper flounce of her right leg, so it leans a little outward, as painted.

## How they move

- The sheath is its own bone (`sheath`). Each frame it turns to follow her right thigh, so it lies along the thigh when she sits or kneels. Its loop stays with the belt.
- The flounce under the sheath is held nearly still (`underSheath` in `src/71_foxcloth.js`), so cloth and sheath do not pass through each other.
- The shears are on two bones (`shears`, and `shearB` for the second half), children of the sheath. Nothing moves them yet. They are ready to be drawn and opened in the tools round.
- Belt and pouch are carried by her hips and do not swing.

## Checks

- All 54 stance and move pairs run with no broken numbers.
- Her hair, scalp, face, arms and sleeves are point for point the same as in the last build (checked by sum).
- The single file (3.2 MB) opens offline at phone size in both builds: phone build 292k triangles, full 527k. A frame of animation costs 2.3 ms on the test machine in the phone build.
- **Not checked: motion.** The test machine draws about 2 frames a second.

## Known weak points

- In the paintings the green peplum ruffle hangs over the belt at her right hip. The model's ruffle is still flat paint, so the belt lies on top of it there. That goes with the ruffles item.
- The sheath is on the side away from the main light, so it reads darker than the pouch.
- The pouch does not swing or bounce.
- The buckle is a plain rounded frame; F7's has a slightly flatter bar.
- Not looked at closely: whether the free flounces beside the sheath lift past its tip in a wide twirl.
