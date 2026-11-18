# Io 3D, stage eleven: her first two spells

November 14, 2026. Follows `claude/io-3d-stage10-feelings-and-reading-hand.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `7dee89a`.
One-file copy sent to Chris: `Io_3D_stage11.html`. Picture sent: `Io_stage11_first_spells.jpg`.

## What Chris said

Of stage ten (her feelings and the slower reading hand): "its Quite good. Let's move on to the rest of her animations, like her spells."

## What was built

On the page there is a new row, Her spells. Picking one turns the camera to her side and pulls it back, so she casts toward the right as in her paintings.

**Harvest Crescent**, her plain attack (paintings H3, H4, I3). 4.7 seconds.

1. Her right hand closes on the moon pendant at her chest and gold light leaks out. She looks down at it with her reading face.
2. The sickle appears in her hand in a flash. She sets her left foot forward, bends her knees and lifts the sickle up and back behind her right shoulder.
3. One wide cut, her body unwinding and sinking onto her front knee. The blade leaves a crescent of gold light that breaks into sparks.
4. A crescent of light flies to the training dummy and bursts. The dummy rocks on its post.
5. Her hand goes back to her chest and the sickle folds away in a flash.

**Silverleaf Salve**, her heal for one friend (H5, H6, I1). 7.2 seconds.

1. Her open book is on her left palm. With finger and thumb she lifts a pressed leaf from the page.
2. The leaf turns from dry brown to silver-green. Her palm opens under it and it stands in the air a hand's width above, glowing, while motes rise from the pages.
3. Her arm goes out. The leaf breaks into a ribbon of gold-green light and small leaves.
4. The ribbon drops to her friend's feet and winds once round them up to their shoulders, and soft light rises.

In both she holds her open book in her left hand, as painted. The dummy and the grey friend appear only while a spell needs them. She wears her stage ten feelings as she casts.

## Two things that are mine, for Chris to keep or drop

- **The crescent of light flies to the foe.** The paintings show the light round her only. I added the flight so the attack reaches a foe who is not standing beside her, as in a fight on a painted backdrop.
- **The sickle appears and goes in a flash of light.** It does not unfold piece by piece from the pendant.

## How it is made (for the rest of her spells, and for anyone reading the code)

- `src/I98_fx.js` holds everything a spell shows that is not her: specks of light (motes, four-pointed stars, small glowing leaves, up to 900, one draw), ribbons of light, the dummy, the friend, the leaf, the flying crescent.
- Every light is drawn with `glowOnly`, so the Flipbook look gives it no ink outline. Sizes are in metres, so the specks shrink with her in that look.
- The sickle's light is the strip its blade really sweeps, frame by frame. Nothing is faked round her.
- `readHands` from stage nine was split into `bookOnPalm` and `fingerTo`, and the spells reuse them. So in the Salve her finger truly touches the leaf on the page, and the book truly rests on her palm.
- `afterHands` is a hook a spell uses once her hands are in their final place for the frame. Every light that starts from a hand or a blade is made there, so no light lags a frame behind her.

## Honest limits

- First builds, timed from still pictures. I cannot watch them play. Not tried on a real phone.
- Not looked at in the Flipbook look. Her magic is gold-green and the look's 56 colours have no green; the lights are not snapped to those colours, but the solid leaf and her moss are, and that is unchecked.
- In the cut, a few points of her left hand sit up to 6 mm inside the book resting on it. It is under the book and does not show.
- The dummy and the grey friend are plain shapes, made only to have something to cast at.
- The full page test passed before I moved the dummy and the friend 15 cm closer and the camera back; after that change I checked both spells on the phone-size page (no errors, everything in frame) but did not run the whole test again.

## Next: the rest of her spells

Chris asked for "the rest of her animations, like her spells". Still to build, with their paintings:

1. **Elderwood Guardian** (H7 to H10, I4): the seed held up, planted, the sapling, the fawn, the stag of living wood, and its charge. The stag is a creature to build, so this is the biggest one.
2. **Moonflower Garden** (H11, H12, I6): she heals the whole party. The book floats.
3. **Thornwake** (H14, H15, I7, I8): her one damage spell. The dagger, witchfire, the briar.
4. **Rootbound Return** (H13): she brings a fallen friend back.
5. **Bramble Cradle** (H16): her guard.
6. **Being hit, falling, winning** (H17, H18).

Still waiting on him from before: glasses bigger and bolder as in A1, or as built; bodice back laced (F7) or a plain seam (B3, as built).
