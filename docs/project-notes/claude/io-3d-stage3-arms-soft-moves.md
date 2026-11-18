# Io 3D, stage three: real arms, hair and skirt that move, her first moves

November 13, 2026. Follows `claude/io-3d-stage2-head-hair-hat.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `e0b7866`.
One-file copy sent to Chris: `Io_3D_stage3.html`. Picture sent: `Io_stage3_arms_and_moves.jpg`.

## What Chris said

"Yes, let's make the fabric. That's on her move with her as she moves and let's do her posturing posing and moves. Not her attacks but her like animations her emotes and these are to test that the clothes work good and also work on her arms Because I do think her arms are still just tubes if I'm not mistaken but she's looking. She's looking good. It's good. Let's continue"

Before that, the order he set: arms, then her body moving, then more of her outfit.

## What changed

### Arms

- They were round tubes in one flat colour. Now the outline is her own, measured off D3 (her arm held straight out, front and back): the round of her shoulder, the taper to her elbow, the point of the elbow, the swell of her forearm, a flat wrist.
- Her arm skin is painted from D3. Both arms wear the same picture, because there is one painted arm.
- The wrist now meets the hand with no step. It narrows to the hand's own wrist and ends hidden inside the hand.
- Each arm turns in her shoulder like a ball in a socket (the Ranger's stage 6d idea). The top of the arm is a ball sitting on the joint, so it stays in place however the arm turns. Under the joint her skin goes a little way with the arm, so her armpit opens.
- Her hands are still plain skin. D1 and D2 are not painted on yet.

### Hair and skirt that move

- From the foot of her neck down, her hair hangs from 9 chains of bones: 5 down her back, 2 down the front of each shoulder. Above that it goes with her head as before. The fringe goes with her head.
- Her skirt hangs from 12 chains round her hips, jointed every 12 cm.
- Each point of a chain is pulled toward where it would rest, keeps its speed (so it lags and swings in after), stays a fixed length from the point above, keeps out of balls placed on her body, arms and legs, and stays above the floor.
- The further down a chain, the more it wants to hang straight down. So when she kneels or bends, her hair hangs and her skirt lies on the floor.
- Standing still, her hair and skirt sit where stage two built them. The chains only show when she moves.

### Her first moves

Under "Moves" on the page. The page opens with her standing and breathing.

| Button | What she does |
|---|---|
| Stand still | Held still, for checking against the paintings. |
| Standing | Breathes, shifts her weight, her head drifts. |
| Walk | An unhurried step on the spot. |
| Talk | Left hand opens palm-up at her waist and moves with her words; nods; her painted mouths. |
| Push up glasses | Right index finger to the bridge, a small push. 2.4 s. |
| Tip her hat | Left hand to the brim, a nod, a smile. 2.6 s. |
| Curtsey | Holds her skirt out, right foot behind, dips, bows her head. 3 s. |
| Twirl | One full turn on her toes, arms out, hair and skirt flying. 2.6 s. |
| Pick a herb | Kneels, picks at the ground, brings it to her nose, shuts her eyes, smiles, stands. 5 s. |
| Wave | Right hand up beside her hat, waving, smiling. 2.6 s. |
| Look round | Over her right shoulder, then her left. 3.6 s. |

- Short moves end by themselves and she goes back to standing.
- Her hands are brought to real points: the bridge of her glasses, the hat brim, the ground, her nose, her knee. Those points are followed when her head moves.
- Her feet stay planted when her hips move. Her fingers curl.

## Decisions I made, for Chris to overrule

1. **Black shorts under the skirt**, above mid-thigh. The top of a moving thigh can press through the skirt's lace; black on black does not show. Nothing changes when she stands.
2. **Arms slimmer at the forearm and wrist** than the stage-one tubes, because D3 shows that. The upper arm is about the same.
3. **Which emotes.** I chose ones that fit a herbalist who reads (glasses, hat, curtsey, herb) and ones that test the cloth (twirl, curtsey, kneeling, look round).
4. **The page opens moving**, not held still.

## Honest limits

- I tuned every move from still pictures. I cannot watch them play. Timing and feel need Chris's eye.
- Hair and skirt bend in stretches about 12 cm long. They swing and fold; they do not ripple.
- A hand can still pass through a lock of hair. Hair does not know about the skirt, and the skirt does not know about the hair.
- When she stands up from kneeling, her left thigh shows at the slit for a moment.
- In "Push up glasses" her finger comes to the bridge from her right side; it may read as touching the frame beside her right eye.
- Not checked on a real phone.

## Checked

- Her arm beside D3, front and back, hair hidden.
- Her shoulder with the arm at rest, at 50 degrees, straight out, up, and forward, from three sides.
- Her wrist from five sides.
- Stills through every move (5 to 8 moments each, some from two sides).
- Standing still, four sides: unchanged from stage two.
- The one-file page at phone size on the build machine: it loads, nothing runs off the side, every Moves button starts its move, a wave ends by itself and "Standing" lights up, "Stand still" brings her back to rest, the face buttons, the Show switches, the Flipbook look and a drag all work, no errors. One frame of walking costs 0.14 ms of script there. 182 bones.
- She stays pinned at the top of the page while the buttons scroll under her (checked at 390 by 780).

## Where things are

- Arms: `ARM_X`, `armPt`, `wArm` in `src/I30_body.js`; `bake_arms_io.py`; `tools/arm_d3.py`, `tools/arm_fit.py`.
- Chains: `CHAINS`, `addChain`, `chainW`, `mixW` in `src/10_geom.js`; skirt chains in `src/I30_body.js`; hair chains in `src/I41_hair.js`.
- Motion: `src/I99_static.js`: `COL` (the balls), `SOFT`, `softStep`, `softSettle`, `ik2`, `reach`, `aimHand`, `flatFoot`, `fingers`, `body()` (the moves), `play`, `pose`.
- Stills: `tools/strip.py` (one move), `tools/allmoves.sh` (all), `tools/armclose.sh`, `tools/shoulder.sh`.
- Build order: `bake_io.py`, `bake_head_io.py`, `bake_arms_io.py`, `build_io.sh`, `build_single_io.py`.

## Still waiting on Chris from before

- Glasses bigger and bolder as in A1, or as built (50 mm, thin)?
- Bodice back laced (F7) or a plain seam (B3, as built)?

## Next

1. Chris's notes on this stage: each move, the hair and skirt in motion, the arms.
2. Hands painted from D1 and D2; legs from B5.
3. Then more of her outfit, in his order: boots, robe (on the same chains), belt, pouch, crystal, jewellery, book, blades. Then her spells.
