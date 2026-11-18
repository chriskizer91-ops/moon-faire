# The Ranger in 3D, stage four: boots

November 13. Follows `claude/ranger-3d-stage3-hands-arms.md`.

## What Chris asked

"Yes let's continue she is looking good." Next in the how-to's order was her boots, against the eight boot paintings E1 to E8.

## What changed

- **Size and outline.** Her boot was laid over the side, front, back and sole paintings at one scale and rebuilt until the outlines agreed. It was much too wide: the sole was 12 cm across at the ball and is now 9.6. Shaft and toe are narrower to match.
- **Sock.** Lower and smaller: three soft rolls ending 29 cm up. It stood 32 cm and bulged wider than the boot.
- **Lacing.** Nine pairs of brass eyelets placed from the side painting. They sit back from the front edge and the last two run out onto the instep. The laces cross over the front of the boot, and the bow has drooping loops and hanging tails with brass tips.
- **Seams.** As painted: the toe cap, the piece the eyelets sit in, the seam from the last eyelet down to the welt, a domed heel counter, a strap up the back with a pull loop.
- **Sole.** Flat under the heel, thinner at the ball, lifting at the toe. Four lugs a side on the heel and eight on the forefoot. Bold tan stitches round the welt.
- **Colours.** Worn charcoal-brown leather, a dark warm-grey sole, a grey knit sock, tan laces. All were drawn fresh from colours sampled in the paintings.
- **The page.** A new "Boots" row (three-quarter, outer side, front, back, from above) with the painting beside it, and a "Boots only" switch that hides the rest of her. It opens on her boots.

## Measured

Model against painting, in millimetres, after the rebuild.

| | Model | Painted |
| --- | --- | --- |
| Boot length | 257 | 257 |
| Height, ground to sock top | 295 | 296 |
| Sole across at the ball | 95 | 96 |
| Toe box across, 44 mm up | 86 | 84 |
| Shaft across, 100 to 180 mm up | 72 to 74 | 70 to 76 |
| Sock across | 84 to 89 | 89 to 92 |
| Back edge of the shaft, side view | within 3 of the painting from sole to collar | |

Before the rebuild the sole was 119 wide, the shaft 77 to 88, and the whole boot 323 tall.

## Where the paintings disagree

- **E6, from above,** has strong perspective and shows a boot about 2 cm too narrow. Widths came from E3, E4 and E7.
- **The heel.** E7 (the sole) gives a heel 7.3 cm across, E4 (the back) about 8.6. The model's is 8.6 at the welt.
- **Eyelets.** The side painting puts them further back than the front painting allows. The model splits the difference: about 5 mm wider apart than the front painting, 3 mm further forward than the side painting.
- **On her leg.** The full-body leggings painting (B3) puts the sock top at about 29.5 cm, which agrees with the boot paintings. The old 32 cm was my misreading in stage one.

## Still rough

- The leather is one worn texture all over. The paintings rub paler on the toe cap and heel.
- The shaft is smooth. The soft creases at the ankle are missing.
- Under the sole the tread is plain bars, not the little crosses in E7.
- The collar is not padded.

## How it was checked

- `tools/cmp_boot.py`: each view beside its painting with the model's outline drawn over it, and tables of both outlines.
- `tools/page_test.py`: the page at phone size on the build machine. Every boot button, a hand view, a body view, a drag, no errors. Not tried on a real phone by me.

## Where things are

- Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (same link as every stage). One offline file: `Ranger_3D_stage4.html`.
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`, commit `1776f2c`.
- Code: `src/R31_boots.js` (shape, seams, laces, sock), `src/R21_tex.js` (leather, sole and sock pictures), `src/R99_static.js` (materials).

## Next, in the how-to's order

Strap hooks, belts, satchel and pouch as real objects; then cloth (sleeves, headband tails); jewellery (rings and bracelets from D3, earrings and necklaces from F1); weapons; then movement.
