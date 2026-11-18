# Stage 6 report: his hat, pearls, feather earring, belt, pouch, scroll, charms and dagger

Written by the builder, November 14, 2026. Model folder: `/home/claude/moon-faire/models/grey-hat-3d/`.
Pictures and check outputs: `/home/claude/builder/work6/final/`. Nothing was published. Git was not used. The network was not used.
Source before this stage: `src_before_gear/`.

## In short

- Everything asked for is built as real objects and both required checks pass (`python3 -I build_single.py` exit 0;
  `quick_page.py` exit 0, 32 buttons pressed, 0 errors).
- 36,362 triangles added (limit 80,000). The whole model is 599,059.
- **Motion was not watched.** The headless browser cannot show it. Everything below about movement comes from stills stepped on the
  model's own clock and from meters. Whether the swing looks right at speed is for Chris to say.
- **The real page was pressed but not pictured.** Two tries at a screenshot of `deliver/Noiz_3D_stage1.html` timed out in the
  software browser (it never got a stable frame). The framing of the new "Hat" and "Belt" views was checked in the test page with the
  same camera numbers at a phone's shape, but at a 16 degree lens where the page uses 20, so the page shows a little more round him.
- Four things are checked only by eye, not by a meter: see "What is not proven" below. Read that section before publishing.

## What I built, and where

All geometry: `src/N48_gear.js` (new; joined in `build.sh` after the shirt). Materials and switches: `src/N99_static.js`.
Surfaces: `bake_gear.py` -> `out/tex_gear.json` (four repeating squares cut from the material squares of F13: felt, black leather,
brown leather, parchment; each flattened, made to repeat, and toned to that thing's colour in C5/C10, F10 and F11).
One line changed in `src/N47_shirt.js` (`readBones` makes room for bones added after it). Page: `viewer_n/index.tpl.html`,
`build_single.py` (paintings beside the two new views).

| piece | mesh | what it is | bone |
|---|---|---|---|
| hat | `hatFelt`, `hatBand` | crown lofted along a bent middle line with folds and dents, brim 4 mm thick with a waved drooping edge and a stitch line top and bottom, dark band | `hat` (child of head), `hatTip1`, `hatTip2` |
| pearls | `gPearl` | 53 rigid beads, 1 cm | none of their own: each takes the bone shares of what it lies on |
| earring | `gSteel`, `gPearl`, `gFeather` | five chain links, two pearls, a cap, a black feather 5.6 cm with a quill; LEFT ear only | `ear` (child of head) |
| belt | `gBelt`, `gSteel` | 4.8 cm black strap, steel ring in front, buckle and keeper at his left front, studs, second strap to his right hip | hips and thighs, as the cloth under it |
| pouch | `gPouch`, `gBrass`, `gDark` | body, flap with stitched edge, brass stud, two belt loops | `pouch` |
| scroll | `gParch`, `gPouch` | coiled roll 27 cm, leather loop, strap up behind the pouch | `scroll` |
| charms | `gSteel`, `gDark`, `gLeaf` | silver skull, gold leaf, each on a clip and two links | `charmS`, `charmL` |
| dagger | `gDark`, `gSteel`, `gPouch`, `gBelt`, `gBrass` | pommel, ribbed grip, guard, sheath with two bands and a tip, hanger with studs | `dagger` |

Triangles: hatFelt 12,736; hatBand 1,984; gPearl 7,700; gSteel 4,293; gBelt 4,684; gPouch 2,016; gParch 1,092; gBrass 825;
gDark 744; gFeather 240; gLeaf 48.

## What I took from which witch

- **Ranger, `src/R45_gear.js` (her stages 5 and 5b):** the whole method. Straps as shapes on the body's real surface; one bone per
  hanging thing at its hinge; each thing a weight on that hinge with gravity, damping, a floor set by the leg under it, and a push from
  the hinge's own movement; `kick` and `settle`; laid to rest at once on a pose change.
- **What I changed from hers, and why.** Her floor follows one thigh bone. His trousers are full cloth carried by several bones, so
  `floorOf` carries every point of cloth under a thing by that cloth's own bone shares, and first moves the hinge to where the belt is
  now. Before that change the meter read the pouch several millimetres inside the cloth in the walk; after it, 0.
- **His own stage 3 and 4 code:** the collar's pinned fold (for the pearls), `wTrouser` (belt weights), `DOLL.wAt` (skin weights).
- I found nothing in the four witches' READMEs for hair under a hat, so `hatPress` is new (see below).

## What I measured

Hat, off C5 (1225 px to the metre, by his pupils and lips) and C6. Model numbers are from `final/gear_places.txt`.

| | painting | model |
|---|---|---|
| brim across | 0.414 m | 0.418 |
| brim front edge, height | 1.715 | 1.715 |
| brim back edge, height | 1.557 | 1.564 |
| top of the fold | 1.855 | 1.865 |
| tip: height, and to his left of the middle | 1.730, 0.144 | 1.733, 0.145 |
| opening: across, front to back, tilt | 0.172, 0.22, 24 degrees | 0.176, 0.234, 23 degrees |

The prompt list says the brim is "about 55 cm across". The paintings measure 41 cm. I followed the paintings.

Jewellery and belt:

| | painting | model |
|---|---|---|
| pearls, lowest bead | 1.445 (C5) | 1.447 |
| feather | left ear, beside the jaw (C5, C6, F1) | left ear, 1.558 down to 1.502 |
| ring across | about 7 cm (A1, scale approximate) | 9 cm |
| pouch | his right hip toward the front, about 12 by 13 cm | same place, 13.4 by 15 cm |
| scroll length | about 28 cm | 26.9 cm |
| charm order | leaf nearer the ring, skull further toward his right | the same |
| dagger | his left hip, slanting outward | his left hip, hanging straight |

A1 and A2 (the only paintings with the belt on him) are not registered to the model. Their scale here is taken from the height of
the whole figure, so belt numbers from them are good to a few per cent only. B1 and B2, which are registered, do not show the belt.

## What I decided, and why

- **The hat's opening sits 2.5 cm further forward than painted.** The painted head is shallower at the forehead than the model's;
  at the painted place the band cut into his brow.
- **His hair is kept under the hat on the graphics card (`hatPress`)** instead of reshaping the hair. A point of hair outside the
  hat's room is pulled straight in toward the hat's middle line after its bones and chains have moved it. The hair's design and
  chains are untouched, and with the hat off the hair is exactly as before. Cost: a few lines of vertex shader.
- **A fault found and fixed on the way:** hair showed through two dents in the crown, seen from above. The dents are now limited to
  3 mm where his head is, the hair is held 5 mm inside, and the crown's lower rings lie level with the opening so the two shapes are
  the same shape. Checked again from four high angles after the fix.
- **The band is dark leather, a little warm**, because that is how it reads in C5 and C10. The prompt list calls it darker grey felt.
  It is one line to change (`hatBand` in `N99_static.js`). I am not certain which Chris means.
- **Pearls are not simulated.** Each bead rides on the collar's fold or on his skin. That is why they cannot sink into his neck, and
  also why they do not swing by themselves.
- **The scroll has its own bone on the belt, not on the pouch.** Hung from the pouch it went into his thigh when the pouch swung.
- **Charms.** I first had the skull and the leaf in the wrong order. A1 has the leaf nearer the ring. Swapped to match, then the
  clearance meter, the checks and every picture that shows them were run again.
- **A check of mine was wrong and I replaced it.** My first "same result on every run" test repeated a run inside one page and
  read false. Cause, found by comparing bones: his body's idle sway runs on a clock that `play()` does not reset, so his head, chest
  and hand are in a slightly different place the second time. Only the earring and the hat's point differ (at most 0.19 degrees);
  the five things on his hips repeat exactly. Two fresh loads of the page agree to six decimal places. `tools/gear_checks.py` now
  tests both and prints which bones differ. I did not change the body's clock (the brief says not to touch his walk or stance).
- **A line in the page notes was wrong and I corrected it.** It said the ring and pouch are smaller than painted. They are not:
  the ring is bigger and the pouch about the same. The note now says what the comparison shows.

## Checks

`final/gear_clear.txt` (stance, twelve moments of the walk, four of talk):

| | result |
|---|---|
| pouch, scroll, skull, leaf, dagger inside the trouser cloth | 0.0 mm at all 17 moments |
| the meter's own test (pouch turned 17 degrees into him on purpose) | reads 28.7 mm, so it can see a fault |
| nearest right-hand joint to any gear | 25 mm from the pouch (walk, moment 8); 32 mm (talk, moment 3) |
| nearest left-hand joint to any gear | 61 mm from the dagger |

`final/gear_checks.txt`:

| | result |
|---|---|
| two fresh loads, 200 walk frames | identical to 6 places |
| clock jumps (30 s frame, 0, negative, 4 frames a second) and a kick | all angles finite and inside their limits |
| stance | at rest at once, unchanged 4 s later |
| widest swing in 10 s of walk | earring 7.0, scroll 16.5, pouch 15.9, skull 29.8, leaf 6.6, dagger 15.5 degrees; hat point 1.6 and 3.1. The skull's 30 degrees is his thigh pushing it out as the leg comes forward; I have not seen whether that reads as too much. |
| cost of the gear's step | 0.15 to 0.18 ms a frame over two runs in the headless browser. Not measured on a phone. |
| attribute lists of the wrong length | none (the model also throws if the shade list is the wrong length) |

## What is not proven

- **The clearance meter covers one thing only:** hanging things against the trouser cloth. It does not test them against the corset,
  against each other, or against the surface of his hands. The hand figures are from the middle of a joint to the gear; a finger is
  about 9 mm thick round its joint and the palm about 20 mm, so 25 mm is a near miss of a few millimetres, not a comfortable gap.
  Only the joints are sampled, not the lengths of finger between them, so the true nearest distance can be a little less. In the
  walk stills from his right front (`final/g_walk_right.jpg`, moments 8 to 11) his fingers are drawn across the scroll and pouch;
  the hand is nearer the camera there and I read it as passing outside them, but that view alone cannot prove it.
- **The belt against corset and trousers** ("no gap, no passing through, in the stance and through the walk") was checked by eye:
  eight sides in the stance and the walk sheets from two sides. No meter. I saw no gap and no cloth through it, at those sizes.
- **Pearls against the ruffles and neck** were checked by eye in four close views in the stance, and small in the walk sheet. The
  ruffles are simulated cloth and the beads are not, so a ruffle that moves forward could cover a bead. Not measured.
- **The feather against his hair and collar** was checked by eye the same way. The hair is simulated and does not push the feather.
- **Hair through the hat while he moves** was looked at only in the small walk and talk head sheets.
- **"Old hair", "Old shirt" and "Old trousers" with the gear on** were looked at once, whole figure, small (`final/modes.png`).
  I cannot say the belt sits right on the old trousers close up.

## What is rough

- The hat's folds are simpler and smoother than the painted ones, and the felt's grain is a repeating square.
- The ring is about 2 cm bigger than painted. The scroll hangs a few centimetres nearer his middle than in A1 and has no writing or
  curled ends. The dagger hangs straight where A1 slants it, and its sheath has no tooling.
- The pouch's two belt loops stand up above the belt as plain brown tabs and look boxy close up (`final/belt_close.png`).
- In the walk and in talk his right hand passes close to the pouch (see the figures above).
- The pearls go onto the collar at the sides rather than lying wholly over it as in C5.

## Pictures

- `final/hat_12_views.png`: the hat from eight sides, above and below.
- `final/cmp_hat.jpg`: hat beside C5 and C6 at one scale, gridded. `final/cmp_neck.jpg`: pearls and earring beside C5 and C6.
- `final/belt_close.png`: belt, ring, pouch, scroll, charms, dagger close. `final/cmp_beltA.jpg`: beside A1 and A2 (scale approximate).
- `final/stance_8_sides.png`: resting stance from eight sides.
- `final/apose_beside_B1_B2.jpg`: A-pose beside B1 and B2 at one scale. `final/cmp_belt.jpg`: the same, close on the hips.
- `final/g_walk_whole.jpg`, `g_walk_right.jpg`, `g_walk_left.jpg`, `g_walk_head.jpg`: twelve moments of the walk.
- `final/g_talk_close.jpg`, `g_talk_whole.jpg`: four moments of talk.
- `final/modes.png`: Blank doll, Doll, old hair and shirt and trousers, hat and gear off, A-pose.
- `final/new_views_phone_shape.png`: the "Hat" and "Belt" views at a phone's shape (test page, see the caveat at the top).
