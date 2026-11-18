# Io 3D, stage six: her ankles in the walk, her wrists in the hand moves

November 13, 2026. Follows `claude/io-3d-stage5-belt-pouch-crystal-jewellery.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`.
One-file copy sent to Chris: `Io_3D_stage6.html`. Picture sent: `Io_stage6_ankles_wrists.jpg`.

## What Chris said

"So I think that the skeleton movement animation needs to be worked on the way her ankles move when she's walking or not bending the right way at the back of her step as well as the way her wrists move when she waves and does a few other things"

This is the same note he gave on the Ranger's walk ("her feet are bending unnaturally at the back of her step", `claude/ranger-3d-stage6c-feet-looser-simpler-page.md`).

## Rule for every witch's moves from here

1. **Never hold a foot level by force.** Keep the ankle inside what an ankle can do (0.26 rad up, 0.30 down) and let the heel lift.
2. **Never turn a hand at the wrist alone.** The turn belongs to the forearm. Hold the wrist's bend to about 0.6 rad.
3. **Stiff boots do not fold at the toe.**
4. **A wave comes from the elbow**, with the hand a moment behind.

## What changed

### Ankles (the walk)

- The cause: the code kept her sole level at all times, so behind her the ankle was bent past what an ankle can do.
- Now, on the ground: her sole lies flat until her leg is too far back, then her heel lifts.
- Now, in the air: her foot hangs loose with the toes down, and comes up to land on the heel.
- Her knee starts to give as her foot leaves the ground.
- Her toe bone is never turned now (walk, twirl, curtsey), because her boots are stiff.

### Wrists

- The cause: when a move turned her hand over (palm up to talk, palm out to wave, a finger to her glasses), the whole turn happened at the wrist, so the wrist twisted like a wrung cloth.
- Now each forearm has a bone that takes most of the turn (80%), so it runs along her forearm as a real one does. Her arm's skin and her bracelets ride that bone.
- What bend is left at the wrist is held to 0.62 rad.
- This runs every frame for both hands, so it covers every move, old and new.

### The wave

- Her forearm swings from side to side from the elbow, and her hand follows a moment behind.
- A little slower and longer: 3 seconds.

## Honest limits

- Still tuned from stills. I cannot watch it play. Not checked on a real phone.
- Only the walk's feet were reworked. In the curtsey and the kneel her feet are placed by reach and were not changed, apart from the toe.
- I did not add the Ranger's other cures for stiffness (spine, neck and head a beat behind; forearm and hand trailing the upper arm), slower short moves, or a half-speed switch. Chris did not ask for them here.

## Checked

- Eight moments of one step from the side with skirt and cloak hidden: heel lifts at the back, foot hangs toes-down in the air, lands heel first.
- Four moments of the wave and two of the talk: wrist in line with the forearm, no twist at the wrist, bracelets in place.
- The one-file page at phone size on the build machine: every Moves button starts its move, switches and drag work, no errors. 234 bones.

## Where things are

- Walk feet: the walk block of `body()` in `src/I99_static.js`.
- Wrists: `wristFix` and `WRIST_MAX` in `src/I99_static.js`; bones `ftwL`, `ftwR` in `src/10_geom.js`; skin weights in `wArm` (`src/I30_body.js`); bracelets in `src/I46_gear.js`.

## Still waiting on Chris from before

- Glasses bigger and bolder as in A1, or as built?
- Bodice back laced (F7) or a plain seam (B3, as built)?
- Which next: more detail on belt, pouch and necklaces; the cloak nearer to his moss picture; or her own boots.

## Next

1. Chris's eye on the walk and the hand moves again.
2. If he wants her less stiff: the Ranger's lag between spine, neck and head, and a trailing forearm and hand; slower short moves; a half-speed switch.
3. Then the outfit and boots, in his order.
