# Io 3D, stage five: belt, pouch, crystal, necklaces and bracelets

November 13, 2026. Follows `claude/io-3d-stage4-hands-cloak-moss.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `7971cd0`.
One-file copy sent to Chris: `Io_3D_stage5.html`. Picture sent: `Io_stage5_belt_jewellery.jpg`.

## What Chris said

"Yes overcloak was correct and it looks good the moss on it It looks good. Let's move on to the belt pouch and Crystal the necklace and bracelets"

## Settled by this

- "Overclock changing" meant her overcloak: only the cloak changed. Confirmed.
- The moss on the cloak looks good to him as built (patches of moss and small ferns on the hems).
- The moss picture (`references/moss/M1.webp`) stays the master for her cloak.

## What was built

- **Fine necklace (F1):** a silver chain on her collarbones with a clear drop.
- **Moon necklace (F1, F2):** a dark cord to mid-chest with a large gold crescent, a small crescent under it, and a cross.
- **Belt (F3):** dark leather round her waist with a gold ring buckle at the front. It sits under the cloak and over the skirt.
- **Pouch (F3):** on her right hip, hanging from the belt, with two gold pieces on its front and a gold ball under it. It swings.
- **Crystal (F3):** a clear six-sided point with a gold cap, on a gold chain from the belt at the front of her left hip. It swings.
- **Bracelets (F1, D4):** on each wrist, from her hand up: black beads, wood beads, small gold beads.
- The cloak's two lower sleeve tiers now stop short of her wrist on the outside, so the bracelets show.
- The page has a new switch under Show, "Belt and jewellery".

## Decisions I made, for Chris to overrule

1. **Shortened the cloak's sleeves at the wrist** (outside only) so the bracelets are seen. The long point at the back of each sleeve is unchanged.
2. **Pouch on her right hip, crystal at her left front**, as in the moss picture.
3. **The moon pendant is fixed to her chest.** It does not swing yet.

## Honest limits

- The new pieces are plain shapes. The belt has no gold vine, holes or pointed tip. The pouch has no flap, studs or real filigree. The leather is one flat colour.
- Hair can lie through the necklace cord.
- Tuned from still pictures; not watched playing. Not checked on a real phone. The Flipbook look has not been checked for the cloak's and moss's colours.

## Checked

- Close stills of her chest, waist, right hip, and left wrist beside F1, F2 and F3.
- A twirl and the herb-picking kneel with everything on: nothing flies off or passes through her.
- The one-file page at phone size on the build machine: loads, every Moves button starts its move, the new switch and the old ones work, a drag turns her, no errors. 232 bones, 593,000 triangles; one frame of walking costs 0.17 ms of script there.

## Where things are

- All of it: `src/I46_gear.js` (`tube`, `ball`, `hoop`, `crescent`, `frontZ`). Soft bones `pouch_0` and `cryst_0`.
- Sleeve change: the tier table in `src/I45_robe.js`.
- Materials `leather`, `bead`, `wood`, `crystal`, `gearGold`, `gearSilver` in `src/I99_static.js`.
- `opts.noGear` builds her without them.

## Still waiting on Chris from before

- Glasses bigger and bolder as in A1, or as built?
- Bodice back laced (F7) or a plain seam (B3, as built)?

## Next

1. Chris's notes on these pieces.
2. More detail on them if he wants it: belt vine and holes, the pouch's flap, studs and filigree, leather from the F9 swatches, a swinging pendant.
3. The cloak nearer to the moss picture: wider sleeve wings, a narrower pointed back, sheer cloth from F10 and F12.
4. Her own boots (E1 to E8), legs from B5, the emotions in C10.
5. Book and blades, then her spells.
