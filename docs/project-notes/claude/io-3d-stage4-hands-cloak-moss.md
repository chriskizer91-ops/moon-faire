# Io 3D, stage four: painted hands, her cloak, and the mossy frill

November 13, 2026. Follows `claude/io-3d-stage3-arms-soft-moves.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep (latest version `1794611198-8b92`)
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `954f42f`.
One-file copy sent to Chris: `Io_3D_stage4.html`. Picture sent: `Io_stage4_cloak_moss_hands.jpg`.

## What Chris said

- After stage three: "Oh my goodness she's fantastic. Very nice. Well done. Let's continue"
- Then, with a picture of Io from three sides (front, side, back) in her full outfit with moss and ferns on her cloak: "This was requested is how IO should look adding a little bit of moss to her. Overclock changing. Nothing else. Just giving like a mossy green frill to her outfit"

How I read it, and told him: only her cloak changes. It gets a mossy green frill: moss and little ferns along the edges of its tiers. Nothing else about her changes. He has not yet confirmed that reading of "Overclock changing".

## Rule to keep

**The moss picture is the master for her cloak.** It is in the repo as `references/moss/M1.webp` (in the work folder, `refs/M1.png`). It also shows her belt, pouch, crystal, necklaces, bracelets and boots as they should look on her.

## What changed

### Hands

- Painted from D1 (her left hand) and D2 (her right): backs, palms, every finger, her nails. Nothing is mirrored.
- The model's nail plates are now only a clear gloss over the painted nails.
- Hand and arm meet in one tone at the wrist. A faint line of shape remains there.
- The shape of her hands was not changed.

### The cloak

- Built from F4 (laid flat), F5 (the sleeve on an arm) and F6 (cloth, trim, shoulder cut-out, hem point).
- Open down the front. Bare shoulders, with a gold band round each upper arm.
- Sleeves in three tiers; the third ends in a long point at the back of her arm.
- A body in two layers with pointed hems, gold trim on every hem.
- Deep red cloth with small gold dots and a gold vine trim. These are drawn by code in F6's colours.

### The moss

- Patches of moss along every hem of the cloak, with gaps between them, and a small fern every few centimetres.

### How the cloak moves

- Its body rides on the skirt's chains, just outside the skirt, so skirt and cloak never fight.
- Each sleeve hangs from 24 soft points on her arm. It drops below her arm when she lifts it, slides toward her elbow when her forearm rises, and flies out when she twirls.
- Standing still, it sits exactly as built.

### The page

- "Cloak" under Show takes it off.
- Everything from stage three is still there: the moves, the sticky stage, the Flipbook look.

## Decisions I made, for Chris to overrule

1. **I built the cloak now**, ahead of belt and jewellery, because his picture was about the cloak.
2. **Moss in patches**, not one unbroken band, because he said "a little bit".
3. **The cloak is not see-through.** F4 to F6 show sheer cloth; solid cloth was the safe first build.

## Honest limits

- It is a first build. Against the moss picture the body is rounder and fuller (it rides the skirt), and the sleeves are narrower than the wide wings in the picture.
- Hair and sleeves pass through each other at her shoulders.
- A forearm can show through a sleeve when her elbow bends (talk, glasses, hat).
- The cloth and trim are not cut from the F10 and F12 swatches yet.
- The thin edges of her hands are soft paint with no detail.
- Not checked in the Flipbook look for new colours (the moss greens may need adding to the palette).
- I tuned from still pictures and cannot watch it play. Not checked on a real phone.

## Checked

- The cloak beside the moss picture: front, side and back, in the "As painted" pose.
- Stills through the twirl and the wave with the cloak on.
- Both hands: backs, palms, thumb sides.
- The one-file page at phone size on the build machine: loads, nothing runs off the side, every Moves button starts its move, the Cloak switch and the other switches work, a drag turns her, no errors. 230 bones; one frame of walking costs 0.18 ms of script there.

## Where things are

- Hands: `bake_hands_io.py`, `hand_marks.json`, `tools/hand_measure.py`, `tools/hand_marks.py`, `tools/flip_hand.py`, `tools/handshots.sh`.
- Cloak: `src/I45_robe.js` (`tier`, `robeS`, the sleeve points `SLN` and `SLA`). Pictures: `robeTexIo`, `mossTexIo`, `fernTexIo` in `src/I21_tex.js`.
- Chains with their own settings: `soft` and `yaw` in `addChain` (`src/10_geom.js`), read in `src/I99_static.js`.
- Build order: `bake_io.py`, `bake_head_io.py`, `bake_arms_io.py`, `bake_hands_io.py`, `build_io.sh`, `build_single_io.py`.

## Still waiting on Chris from before

- Glasses bigger and bolder as in A1, or as built?
- Bodice back laced (F7) or a plain seam (B3, as built)?

## Next

1. Chris's notes on the cloak: its shape against his picture, how much moss, how it moves.
2. Likely fixes: wider sleeve wings, a narrower pointed back, sheer cloth cut from F10 and F12, hair and sleeves kept apart, the Flipbook look checked.
3. Belt, pouch and crystal (F3, G8); necklaces and bracelets (F1, F2, D4).
4. Her own boots (E1 to E8), legs from B5, the emotions in C10.
5. Book and blades, then her spells.
