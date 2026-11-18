# Fox Witch 3D – pass 12 (thicker fingers; her shears in her hands; Hemline Fangs)

Written by Claude, 13 Nov 2026. Follows `claude/fox-3d-pass11-bracelet-fingers.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model` of `chriskizer91-ops/moon-faire`, commit `445b456`. This is the start of round 3.

## What Chris asked (13 Nov, 11:31)

- Her shortened fingers "almost look perfect": now thicken them.
- "Round three: her shears in her hands, then Hemline Fangs."

## Her fingers

- 12% thicker, fingers and thumb (`FINGER_W = 1.12` in `src/10_geom.js`). Measured across all four fingers at three heights, they are now within 3 pixels of her painting D1.
- Picture: `deliver/Fox_fingers_vs_painting.jpg` (painting, this morning, now).

## Her shears in her hands

- **What it does.** The two halves of her shears can leave the sheath and follow her hands. Whole, they sit in her right fist and can open and shut. Split, the back half goes to her left hand and she has two daggers.
- **How it is keyed.** Four numbers in any move's keys: `shr` (0 in the sheath, 1 in her right hand), `shs` (1 when split), `sho` (how far open), `shl` (how the blades lean in her fists: back toward her wrists for carrying, forward for a cut).
- **How a half sits in a hand.** Its ring is in her fist. Its blade comes out of the thumb side, flat to her palm.
- **They grow.** On her belt they are 26 cm. In her paintings H3 and H4 each dagger is about 45 cm. So they grow 1.7 times as they leave the sheath and shrink as they go back. Her lore says "her scissors become daggers". If Chris wants them belt-sized in her hands, it is one number (`shearsGrow: 1`).
- **A move to look at them:** "Shears" on her page. She draws them, snips twice, parts them into two daggers and turns them, puts them together and away (5.5 s).

## Hemline Fangs (her first spell)

- **From:** the flipbook clip `hemline_fangs` (12 frames at 6 a second, the blow on frame 7) and paintings H3 and H4.
- **What she does:** hand on the ring; out and up, and her left hand takes the back half; a dagger at each side, blades up; a step into a wide stance and a wind-up to her right; the first cut with her right hand, high right to low left; the second with her left, down across it; up out of it with blades wide; together again in front of her with a snip; away.
- **Timing:** the flipbook's frames at 1.22 times their length, so 2.4 s and the blow at 1.22 s. At the flipbook's own 2.0 s her hands had to travel at 6 metres a second just to part the daggers.
- **Magic:** cold blue foxfire strewn along the path of each blade, sparks and a small ring where the two cuts cross, a flat ring round her as the halves come back together (as in H4), a glint at the points while they are out.
- **Numbers:** her arms never lock (reach 0.96 of their length); fingertips reach 5.4 m/s in the cuts.
- Picture: `deliver/Fox_shears_and_Hemline_Fangs.jpg` (stills of both moves, with H3 and H4 beside them).

**Not seen in motion.** The test machine draws about two frames a second. Chris judges the flow on his phone.

## Where it differs from the paintings

- In H4 her arms are both stretched forward and the blades cross in front of her. In the model the two cuts pass one after the other through that point.
- In H4 her wrists are crossed low with blades pointing down as the ring goes round her. With the daggers held this way her hands cannot point them down, so she brings them together blades up.
- Her fingers do not go through the rings. Her fist closes on the ring.
- The first cut's arc passes near her head when seen from straight in front.

## How it was made (for the other witches' tools)

1. Give each rigid piece of a tool its own bone, at rest where it is worn.
2. Work out once where the piece sits in a hand (its handle point, which way its blade points, which way its flat faces). Each frame: the piece goes where the hand's own movement takes that.
3. Blend from worn to held with one number, so a move can key the draw.
4. **Do not guess wrist turns for a blade.** `bench/blades.js` tries every forearm turn, wrist bend and lean for a pose and prints the one that points the blade nearest to where it should go. Twelve poses took one run.
5. If a pose cannot be reached with one grip (a blade along the arm for a cut, across it for carrying), make the grip itself a key (`shl`).
6. A page with one spell broke the spell picker, which started on the second spell. Test the page itself, not only the model.

## Next in round 3

Blue Mischief (H5, H6), Borrowed Face (H7, H8), then Same Cloth, Slip Stitch and Crazy Quilt (H9 to H13), with her magic set (I1 to I9).
