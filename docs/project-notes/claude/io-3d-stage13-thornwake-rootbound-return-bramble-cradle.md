# Io 3D, stage thirteen: Thornwake, Rootbound Return, Bramble Cradle

November 14, 2026. Follows `claude/io-3d-stage12-elderwood-guardian-moonflower-garden.md`.
Same link as every stage: https://claude.ai/artifact/Uvz35Hj97w5yjyA5j2Z6Ep
Repo: `chriskizer91-ops/moon-faire`, branch `claude/io-3d-model`, folder `models/io-3d/`. Commit `a4b313d`.
One-file copy sent to Chris: `Io_3D_stage13.html`. Picture sent: `Io_stage13_three_spells.jpg`.

## What Chris said

Of stage twelve: "Oh this is beautiful. Are you going to do a second higher detail pass of both of those spells? Maybe a higher detail pass of all of her spells."

I said yes, as one pass over all her spells once the rest have first builds. He chose: "Let's do her next set of spells and her reactions first then we'll come back to it."

This stage is the next set of spells. Her reactions are the next stage.

## What was built

All seven of her spells now have a first build. Three new buttons under Her spells.

**Thornwake**, her one spell that harms (paintings H14, H15, I7, I8). 7.6 seconds.

1. The closed book is hugged to her chest in her left arm. She draws her dagger and holds it point-down in front of her. Violet witchfire wakes along the blade. Her face is stern.
2. She drops to her right knee and drives the dagger into the ground.
3. A jagged crack of violet light runs along the ground to the foe, with small thorned roots pushing up along it.
4. Six dark thorned roots burst out under the training dummy, close round it like fingers and lift it off the ground. Witchfire glows in the wood and wine-red roses open on it.
5. The briar sinks back, the dummy drops, she stands.

**Rootbound Return**, she brings a fallen friend back (H13). 9.8 seconds.

1. A grey friend lies on their back beside her. She kneels on her right knee. Her book floats open beside her.
2. She holds a glowing seed on her open palm over their chest, her head bowed.
3. She tips her hand. The seed falls onto their chest and sinks in with a flash.
4. Roots of light trace the friend's whole outline on the ground, and small white flowers open along them.
5. The friend sits up. She takes their hand, smiling, and soft light rises.

**Bramble Cradle**, her guard (H16). 6.4 seconds.

1. The closed book hugged to her chest, she raises her right hand, palm outward.
2. A dome of woven living branches grows up round her from the ground, like an upturned basket, taller than her hat, with small gold-green leaves all over it and thorns pointing out. You see her through the gaps.
3. Three blows land on it and bounce off as sparks. The dome shivers.
4. It sinks back into the ground.

## Things that are mine, for Chris to keep or drop

- The briar lifts the dummy, then sinks back into the ground at the end.
- The fallen friend lies at her right side with their head toward the foe, so from the spell's camera they lie along the front of the picture as in H13.
- Three blows land on the Cradle to show it holding. The painting shows a few sparks.

## How it is made

- `src/I98d_thorn.js`: the drawn dagger, the crack, the briar and its roses, the dome, the fallen friend (who can sit up and lift a hand) and the outline of light with its flowers. Everything grows by showing more of a mesh whose triangles are sorted, as in stage twelve.
- The closed book held to her chest is new (`bookHug`, `hugArm`). Thornwake and Bramble Cradle use it; her reactions will too (H17, H18 show the closed book).

## Checked

- Pass-through meter: legs at the standing floor in all three, both kneels included. Sleeves 38 points (Thornwake) and 52 (Cradle). Rootbound Return has 179 points, up to 30 mm, while she reaches down for the friend's hand. That is more than her other spells.
- Full page test at phone size: no errors, all seven spells play.
- The three new spells photographed on a phone-size page: no errors, everything in frame.

## Honest limits

- First builds, timed from still pictures. I cannot watch them play. Not tried on a real phone. Not looked at in the Flipbook look.
- The dagger she draws is a second dagger. The one in the sheath on her hip stays where it is.
- Witchfire is made of the same small specks as her other lights, coloured violet. It reads as sparks more than as tongues of flame.
- The friend sits up stiffly, with their free arm held straight out.
- The closed book against her chest is not measured by the pass-through meter.

## Next

1. **Her reactions** (H17, H18): being hit (she holds her hat on), falling (she sinks to the ground, her hat falls off, the book lies under her hand), and winning (she snaps the book shut and tips her hat brim).
2. **Then the higher-detail pass over all her spells.** What I listed for him: the Guardian's face, finer roots and planted feet; the sapling truly twisting into the fawn; the stag peeling apart strand by strand; the flowers' star crease and stamens, buds that swell, veined leaves, curling tendrils; the sickle unfolding piece by piece from the pendant; gold veins on the silverleaf; her magic's light falling on her face and clothes; her hair and cloak stirring as she casts; greens that survive the Flipbook look. Add from this stage: real tongues of witchfire, the hip dagger leaving its sheath, the friend sitting up more naturally.

Still waiting on him from before: glasses bigger and bolder as in A1, or as built; bodice back laced (F7) or a plain seam (B3, as built).
