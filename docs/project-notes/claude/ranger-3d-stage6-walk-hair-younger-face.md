# Ranger 3D, stage six: she walks, her bun moved, her younger face

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `0879add`.
One-file copy sent to Chris: `Ranger_3D_stage6.html`.

## What Chris asked

After trying the three faces, with a photo of her profile on his laptop:

"I like the younger face but her hair needs to be smoothed out. If you look at her profile ... slope the top of her head back more and have her bun of hair be on the back of her head. Not up as high as it is. Of course we need to make the charms sway and swing for when she's moving. I guess we need to get the animation of her skeleton in so we can see her walking with all of these different things."

## Decided by Chris

- **Her face is the younger one.** It is the default now. The first painting and the Fox's face stay on the page as buttons to compare, nothing more.
- **Her hair shape is by his eye**, not measured from a painting: top of the head sloping back from the band, bun on the back of her head. This replaces the stage 4b match to painting C3 above the band.

## What changed

**Her face**
- Starts as the younger version (`lookNow = 'young'` in `src/R40_head.js`).
- The side picture of her cheeks and ears gets the same treatment (`faceSideYoung` from `bake_looks_r.py`), so front and sides agree.
- Her hair is still grey. Taking the grey out is still an open offer.

**Her hair** (`src/R41_hair.js`)
- The bun points 17 degrees above straight back. It pointed 35 degrees up.
- It stands 5.2 cm proud and stops above the band, so the band is never buried.
- The swell on top of her head is 1.1 cm, down from 2.7, so the top slopes back from the band.
- Smoother: the curls on the bun are a third as deep, and the four hair pictures lose some of their fine light-and-dark.

**A first walk** (`walk(true)` and `animate(dt)` in `src/R99_static.js`)
- A plain walk on the spot, written here: thighs, knees, feet, arms swinging opposite the legs, hips dropping about 4 cm at each step, a small turn of the spine. One full cycle takes 1.08 seconds.
- Her bags and charms move with her through the stage 5b code: the bags bump on her hips, her thighs push them, the charms sway.
- It is a stand-in. The Jester's full moves (walk, run, sit, dance and the rest) still come over at the movement stage and replace it.
- On the page: a new "Movement" row with "Walk on the spot" and "Give them a swing".

## Rough, and known

- The walk is simple. Her feet slide a little on the floor, her head and sleeves do not move with her steps, and her fingers stay still.
- With the bun moved, the hair still wears the old paintings, which show the bun up high. The strands on the new bun are stretched at the very back.
- Each charm is one stiff piece on a hinge. Charms can pass through each other.
- The younger face is a filter on her painting. A new face picture made for this head would be better still.

## How it was checked

- Her head from the side, three-quarter, back and front after the hair change.
- Three moments of the walk from the side and at three-quarter.
- The one-file page in a phone-size browser: walk on and off, profile view, a drag, no errors. Not checked on a real phone, and the walk's timing cannot be judged on the test machine.

## Waiting for Chris

- How the walk looks and feels on his laptop and phone.
- Whether the bun is now where he wants it, and how big.
- Whether to take the grey out of her hair.
- Whether the satchel should sit further round to the front; whether to smooth the step where her arm meets her shoulder.

## Next

Bring the Jester's animation files over (`70_anim.js`, `75_pose.js` and the moves) so she has the full set, then cloth for the sleeves and headband tails.
