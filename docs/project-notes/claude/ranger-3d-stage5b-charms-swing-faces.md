# Ranger 3D, stage five second pass: charms, swinging bags, shoulders, and three faces to try

November 13, 2026. Same link as every stage: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v
Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`. Commit `780e75d` (charms, swing, shoulders) and the one after it (faces).
One-file copy sent to Chris: `Ranger_3D_stage5c.html`.

## What Chris asked

1. "Continue on with fixing what's still rough: the bags, the charms, her shoulders."
2. While that was being built: "Could we also experiment with giving her the Fox's face or making a younger version of her face."

## Charms (from painting F7)

- Six, each built as a string of parts: clasp, ring, chain links, beads, a gold cap, a cut stone.
- Three turquoise crystals hang under the satchel, toward her back as in A1.
- The bead string (amber, turquoise, pearl) hangs from the ring buckle.
- The cluster of four gold balls with an amber drop hangs from the square buckle.
- The amber string hangs under the pouch.
- Lengths follow A1: the bead string and the cluster are about 18.5 cm; the crystals about 13 cm.
- Stones have flat faces so they look cut. Code: `charm()` in `src/R45_gear.js`.

## Bags and charms that swing

- Each bag and each charm has its own bone at its hinge (`bagsat`, `bagpouch`, `charm1` to `charm6`).
- Gravity pulls each in against her. Her thigh pushes a bag outward instead of passing through it: the bag's lean is worked out from where her thigh is, every frame.
- A push sets them swinging and they settle. So will her own movement, once she moves.
- On the page: "Give them a swing", and a new pose, "Legs apart".
- Code: `gearTick`, `gearKick`, `gearSettle` in `src/R45_gear.js`; `animate(dt)`, `swing()` on the model.

## Shoulders

- The strap hooks take the skin's own weights, so the outer iron curls ride her shoulder when her arm lifts.
- The straps are redrawn cleanly over the top of each shoulder, front to back (`strap_over` in `bake_ranger.py`). They used to blur there.
- Not touched: the small step where her arm meets her shoulder. That is body shape, and her body is approved, so it waits for Chris to say.

## The face experiment (nothing decided)

The page has a row, "Try a face", with three buttons. Only the picture painted on the front of her face changes. Head shape, hair, band and glasses stay. Blink, talk and smile work on all three.

- **Her own**: J1, as before. Still the default.
- **Younger**: her own face with the lines of age lifted (forehead lines, crow's feet, the shade under her eyes, the folds beside her mouth). Eyes, brows, lashes, lips and her mole are kept. Her hair is still grey.
- **The Fox's**: the Fox's painted face laid on the same head. Both heads are the Jester's face model, so it lays straight on. Her eyes are moved 2.8 mm apart to sit in the Ranger's eye sockets, and her skin is toned to the Ranger's so face and neck agree.

How it is made: `bake_looks_r.py` (run after `bake_gear_r.py`), `LOOKS` and `setLook('own' | 'young' | 'fox')` in `src/R40_head.js`. The Fox's face data is `refs_fox/fox_face.json`, copied from branch `claude/fox-3d-model`, commit `f7cac64`.

Things for Chris to weigh:

- With the Fox's face, she and the Fox would be the same person. He ruled that out earlier for the Fox and the Jester ("unique characters").
- The younger face is a filter on her painting, not a new painting. A new face picture made for this head (the way J1 was made) would look better than any filter, if he likes the direction.
- Rough: the sides of her cheeks and her ears keep the paint of her own face, so a seam of tone can show at three-quarter.
- Not done: her hair. It is still grey with the younger face. Taking the grey out is a separate, easy change if he wants it.

## Rough, and known

- Each charm is one stiff piece on a hinge: its chain does not bend, and charms can pass through each other.
- The gold caps on the stones are plain, without the leaf work in F7.
- She does not walk yet, so things only swing when the button is pressed.
- With her arms straight out the iron curls bend a little with her skin.

## How it was checked

- Charms and bags from the front and the side beside A1; a legs-apart pose; a still taken mid-swing; a check that everything returns to rest.
- Shoulders with her arms at rest and straight out, front and back.
- The three faces on her head from the front and at three-quarter.
- The one-file page in a phone-size browser: every new button, a drag, no errors. Not checked on a real phone.
- The folder rebuilds from a clean copy of the repo and gives the same model.

## Build order now

`bake_ranger.py`, `bake_head.py`, `bake_hands_r.py`, `bake_gear_r.py`, `bake_looks_r.py`, `./build_r.sh`, `build_single_r.py` (writes `deliver/Ranger_3D_stage5c.html`).

## Waiting for Chris

- Which face: hers, younger, or the Fox's. Or a new younger face picture.
- Whether to take the grey out of her hair.
- Whether the satchel should sit further round to the front.
- Whether to smooth the step where her arm meets her shoulder.
