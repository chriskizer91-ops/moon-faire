# Ranger 3D, stage five: belts, satchel, pouch and strap hooks (and her hair lowered)

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commits `2055d38` (hair) and `98bf226` (stage five).
One-file copy sent to Chris: `Ranger_3D_stage5.html`.

## What Chris asked

"The boots look perfect as they are. Let's move on to her belts, satchels, pouch, and strap hooks as real objects. ... her hair is too big above the hairband ... if everything else stayed the same head-wise and you pulled the hair down, lowered the elevation of the front bulge of it."

So three things:

1. **Boots are approved.** Do not reshape them without asking.
2. **Hair:** lower the swell above the headband at the front, nothing else on her head changed.
3. **Belts, satchel, pouch and strap hooks** built as real objects.

## Her hair (stage 4b)

- The swell of hair just behind the band stood 2.5 to 4.6 cm higher than the slope in her side painting (C3).
- It now follows that slope to within 3 mm. Her crown, bun, band and face are untouched.
- In code: `FRONT_LOW` in `hairPt`, `src/R41_hair.js`.
- Left open: C3's own front view draws her hair lower and wider than its side view. The side view was followed. If she still reads too big from the front, the next step is to bring the crown and bun down too.

## What is built in stage five

Everything is in `src/R45_gear.js`. The leather comes from painting F6, cut by `bake_gear_r.py`.

**Belts**
- Two belts, each a real loop lying in a tilted plane round her hips. They cross in the middle, front and back, 96 cm up.
- Belt A sits high on her right hip. It carries the steel ring buckle at her front right.
- Belt B sits high on her left hip. It carries the square buckle and the blue keeper, and lies on top where the two cross.
- 2.4 cm wide (A1 measures 2.2 to 2.5), a steel stud every 2.2 cm, stitched edges from the painting.
- Each belt has its end tucked past the buckle, with a round tip and punched holes.

**Satchel and pouch**
- Satchel: 20 cm across, 19 tall, 6.5 deep at the foot. Hangs by two loops from belt A on her right hip, a little forward of her side.
- Pouch: 9.3 cm across, 14 tall. Hangs by one loop from belt B behind her left hip.
- Each is built to its own painting in F6 and wears it: back, front, the strip round the sides, a flap with a rim, straps and the pointed tab lifted off the leather, steel buckles, brass studs.
- Each hangs from its belt like a hinge. It swings in until its back rests on her hip, and turns until both halves touch. So nothing floats and nothing sinks into her.

**Strap hooks**
- Four, where the shoulder straps come over, front and back.
- Each is a brass buckle on the strap with a black iron curl either side. The outer curl is the bigger one, as painted.
- In front the buckle is an oval ring with an upright prong (A1). Behind it is a narrow bar with a tooth (A2).
- They lie on her real skin: the model looks straight through the built chest and arm to find the outer surface, so the curls ride over the shoulder instead of sinking into it.
- The flat painted hooks that were on her body picture are painted out (`paint_out` in `bake_ranger.py`). The straps at her back used to fade to skin above the buckles; they now run on.

## How close

Model against painting A1, in metres (x is to her left, then height):

| What | Built | Painted |
|---|---|---|
| Ring buckle | -0.078, 0.992 | -0.077, 0.992 |
| Square buckle | 0.090, 0.996 | 0.090, 0.986 |
| Where the belts cross | 0.962 | 0.965 |
| Satchel, front view, side to side | -0.268 to -0.115 | -0.262 to -0.104 |
| Satchel, top and foot | 0.976 and 0.783 | 0.984 and 0.791 |
| Pouch, front view, side to side | 0.138 to 0.239 | 0.146 to 0.215 |

The pouch is 14 cm tall, the shape F6 gives it. The body paintings draw it nearer 12.

## Choices I made (Chris can overrule)

- **Where the bags face.** The paintings draw each bag face-on in the front view, the back view and the side view. One bag cannot do all three. The satchel is on the side of her right hip, turned a little forward; the pouch is behind her left hip. Each can be seen from the front, the side and the back. If Chris wants the satchel further round to the front, it is one number (`uSat` in `R45_gear.js`: 0.25 is her side, 0.5 is her front; it is 0.30 now).
- **Satchel loops.** They sit 2 cm nearer the middle of the bag than F6 paints them, so the front loop hangs clear of the ring buckle.
- **Belt A's keeper** is on the tucked-end side of the ring buckle (the painting has it on the other side), for the same reason.
- **Buckles only in front.** A2 also draws buckles on the belts at her back. A belt has one buckle, so the back has none.

## Rough, or not here yet

- The bags are stiff. They do not swing, and when her legs move a thigh can pass through one.
- When she lifts her arms, the outer iron curls stay where they are instead of riding her shoulder.
- At her back the straps blur just above the buckles, where the old painting ran out.
- The charms that hang from the belts (F7), and the small rings they hang from, are a later stage.

## The page

- New row "Belts, bags and hooks": Belts, Satchel, Pouch, From behind, Buckles, Strap hook, Hook behind. Each shows Chris's painting beside her.
- New switches under "Show": "Belts and bags" and "Strap hooks".
- It opens on her hips from the front.

## How it was checked

- Front and back of her hips beside A1 and A2 at one scale; both sides; from above; close on each bag, the buckles, the back crossing and each hook; three arm poses.
- The one-file page was opened in a phone-size browser: every new button pressed, a drag turns her, no errors. Not checked on a real phone.
- The whole thing was rebuilt from a clean copy of the repo folder and came out the same.

## For the next session

- Build order now: `bake_ranger.py`, `bake_head.py`, `bake_hands_r.py`, `bake_gear_r.py`, `./build_r.sh`, `build_single_r.py` (writes `deliver/Ranger_3D_stage5.html`).
- Parts of the gear have their own names so the page can switch them: `belt`, `gear`, `steel`, `keeperB`, `gearBrass`, `beltHole` (belts and bags); `iron`, `hookBrass` (strap hooks).
- Approved so far, not to be reshaped without asking: body and base outfit (November 12), boots (November 13). Chris called the hands "really good already".
- Waiting for his notes: head and face, hands and arms, the lowered hair, and this stage.
- Next in the how-to's order: sleeves and headband tails as cloth; necklaces, earrings, bracelets and the belt charms (F7); bow, sword and knives; then movement.
