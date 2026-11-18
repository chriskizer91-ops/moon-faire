# Fox Witch 3D – pass 3: hands, bracelets, boots (started 12 Nov 2026)

Written by Claude. Follows `claude/fox-3d-pass2-head.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model`.

## Approved by Chris, do not reshape without asking

- **Her hair**, third style (loose and messy, heavy parted bangs, small bun, ears hidden, hair that swings): "Yes, this is wonderful." 12 Nov.
- Her forehead, half an inch shorter.
- No teeth, anywhere.
- Her face is on hold until the round 5 face set arrives (`claude/fox-3d-round5-face-prompts.md`). Until then: the Jester's head shape wearing the Fox's own painting from C3.

His order for the rest: hands, boots, trousers, the rest of the costume. Then tools and spells.

## Hands

- `bake_hands_fox.py` (made from the Jester's `bake_hands.py`) lays her own hands painting **D1** onto the hands: back view on the left, palm view on the right. Landmarks were read by eye off `shots/D1_grid.jpg`.
  - Scale: her middle finger, web to tip, is 327 px for the hand model's 84 mm, so 0.2569 mm a pixel. Middle finger axis x 329 (back view), web y 395; the palm view mirrors about x 626.
  - Roots and tips (x, y) and half-widths, back view: index (412,402)-(422,110) 33; middle (330,395)-(327,68) 32; ring (250,402)-(240,112) 32; little (178,430)-(148,230) 25; thumb (481,568)-(570,375) 30. Palm view: index (832,395)-(822,110); middle (922,388)-(925,68); ring (1002,395)-(1010,115); little (1072,430)-(1106,232); thumb (761,568)-(672,375).
  - Her nails are natural, so none are masked out; the model's nail plates sit over them.
- It writes `hands` into `out/fox_tex_own.js`; `make_jface.py` carries it into `out/fox_tex.js`.
- Check picture of the baked sheet: `shots/bake_hands.png`.
- Not done: the hands' size and finger lengths have not been laid over a painting yet (hand scale is still 0.86 from pass 1). The painted hand is a little pinker than the plain forearm; the bracelets sit on the join.

## Bracelets (F2)

Three strands above each wrist, in `src/30_body.js` just before the sleeve: 13 large dark wood beads, 27 small gold ones, 20 medium wood ones, at 41.3, 42.9 and 44.2 cm down the arm. Each bead is a small sphere carried by the forearm. Materials `woodbead` and `bellm` (the bell's brass). They do not slide or rattle yet.

## Boots

- Soles are dark brown rubber now, not black.
- `bake_boot_fox.py` makes a tile of her boot leather in the colours and grain of painting **E1**: dark `(43,25,20)` and worn `(132,93,79)` measured from the shaft, soft blotches made fresh so the tile has no seam, the painting's fine grain laid over. A straight cut of the painting, repeated, showed as a snakeskin pattern; that is why it is made this way.
- Comparison: `deliver/Fox_boots_vs_E1.jpg`.
- **Not done: the boot's shape is still the Jester's.** Against E1 her boot is shorter in the shaft and longer in the foot (about as tall as it is long), with a padded collar, a rounder toe and a thicker sole (heel about 18% of the boot's length). E1 to E8 have not been measured.

## Boot shape, hand size, bracelets that move (Chris: "boot shape adjust against the painting, hand size, bracelets can have motion")

- **Boot shape.** E1's outline measured as fractions of the boot's length: height 0.83 of its length; shaft back edge at 0.04 and front edge at 0.57 at the collar; outline height 0.24 over the toe box. The model's boot was as tall as it was long with a platform sole. Rather than refit every boot table, all boot parts are reshaped in one place, `FOX_BOOT` in `addPart` (`src/10_geom.js`): heights under 0.066 are scaled by 0.757 (thinner sole), the shaft above by 0.878 (top now 0.222), and the shaft is made up to 28% deeper toward the collar. Laces, eyelets and stitches move with it. The leg runs down to 0.200 inside the wider collar.
  - The automatic outline of the model's boot failed (the mottled leather is too close to the backdrop), so the model's numbers came from its tables: sole length 0.264, top 0.262.
  - A1 and B4 put the boot top a little higher (0.2585 m on her) than E1's shape gives (0.232). E1 was followed, as Chris asked.
  - Still different from E1: the toe is less bulbous, the collar is not padded, the heel block is plainer.
- **Hand size.** Laid beside A1 at one scale (`shots/b4_strip.jpg`): her hands are the same length and hang at the same height. Hand scale stays 0.86.
- **Bracelets move.** Each strand has two bones on the forearm and its own spring (`braceletChains` in `src/30_body.js`, registered in `src/70_anim.js`), each a little stiffer or looser than the next so they knock out of step. Measured tilt: about 8 degrees in a wave, 5 to 15 in a jump. A twirl threw them over 100 degrees, through her arm, so the tilt is limited to 24 degrees.

## Trousers, first build (`src/47_foxtrousers.js`)

- **Cloth:** `bake_patch_fox.py` takes the two swatch sheets as they are: F9 is `patch`, F10 is `patch2`, repeated. About 6 cm squares on her.
- **Sizes from A1:** each leg is about 33 cm across from knee to mid-calf, the two meet at the middle, hips 23 cm either side. In A1 she stands with her feet wider apart than the model's rest pose, so each trouser leg sits out from its leg bone (`LEGT`: height, how far out, half-width, half-depth).
- **Pieces:** a yoke round the hips from under the corset's frill (`YOKE`); two wide legs, fullest at the calf and gathered onto the boot; two flounces over each leg with dipping hems (the upper one in `patch2`); a magenta frill at each ankle.
- **How they move:** they are sewn shapes carried by hips, thighs and shins. **They are not cloth yet**: nothing falls, swings or settles. Standing and walking hold together; kneeling and sitting fold the legs through each other.
- Comparison: `deliver/Fox_trousers_vs_A1.jpg`. Against A1 they are still too regular (a quilt grid), the flounces are short and not layered enough, and the cloth has no painted shading.
- The single page is now 2.9 MB (the patchwork is 0.8 MB of it).

## Build order now

```
python3 -I bake_fox.py && cp out/fox_tex.js out/fox_tex_own.js
python3 -I bake_hands_fox.py && python3 -I bake_boot_fox.py && python3 -I bake_patch_fox.py
python3 make_jface.py && ./build.sh && ./build_site.sh && python3 build_single.py
```

`bake_fox.py` rewrites the own bake without hands, boot leather and patchwork, so the three small bakes must run after it every time.

## Next

1. Belt, pouch and sheath (F7, G4) over the join of corset and trousers.
2. Trousers as real cloth, using the Jester's cloth sheets (`50_cloth.js`): the flounces first, then the legs. Longer, layered flounces as in A1.
3. Real ruffles at neckline, sleeves and peplum. Boot toe and collar. 
4. Her face, when round 5 arrives. Then tools and spells (rounds 3 and 4).

## Trousers slimmed (Chris, 12 Nov, 19:18: "her pants are too baggy, far too baggy")

Each leg was about 30 cm across, as measured in A1. It is now about 20 cm (`LEGT` half-width 0.100, half-depth 0.112 to 0.118), and the hips 20.6 cm either side instead of 23 (`YOKE`). Flounces stand off less. Still a wide leg, gathered onto the boot. This is Chris's call by eye and goes against A1's measure, so do not widen them again from the painting. Comparison: `deliver/Fox_trousers_vs_A1.jpg`.
