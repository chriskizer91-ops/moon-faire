# Fox 3D, pass 14: Same Cloth, Slip Stitch, Crazy Quilt

13 November 2026. Branch `claude/fox-3d-model` of `chriskizer91-ops/moon-faire`, commit `4a0091c`. Page: `models/fox-3d/deliver/Fox_Witch_3D.html` (one file, 3.47 MB, works offline).

Chris, 15:02: "Yes, these are all wonderful. Let's continue on to the next set of spells." These three finish round 3. Round 4 is next.

## The three spells

They come from her lore, not from the flipbook, so there was no clip to time them by. The timing is mine and can change.

**Same Cloth** (6.7 s, the blow lands at 4.2 s). Paintings H9, H10.

- She draws her shears, points them at her target and snips four times. A line of thread is drawn round the target as she snips. It follows the target's own shape, and it faces whoever is looking.
- A see-through blue copy of the target peels away toward her.
- Shears away. Both hands up, a thread from every fingertip to the copy.
- She draws the copy back and throws it. It whirls into the thing it was cut from.
- She laughs, takes the shears out again, snips the threads. They fall, and the copy unravels from the top down.
- The copy is made from whatever she is aiming at. On her page that is the practice dummy, so turn **Walk around** on. With nothing to aim at, a plain cloth doll stands in.

**Slip Stitch** (6.6 s on her page). Paintings H11, H12.

- She turns to her left, goes up on her toes and drags the point of her shears straight down. The air is left cut behind it.
- Shears away. She steps in, takes hold of the cut and draws its edge back like a curtain. Other places show through.
- She waves, and steps in sideways behind the lifted edge.
- A needle of light sews the cut shut from the top. Nobody is left standing there.
- **On her page she pops back at the end**, because the page needs her. In the game the move should stop at about 5.4 s with her gone.

**Crazy Quilt** (4.6 s, it lands at 3.0 s). Painting H13.

- She gathers it at her hip, swings it over her head and shakes it out like a bedsheet. A quilt of light unrolls from her hands.
- A second flick sends a wave down it. She lets go.
- It settles over her target. Its squares start changing places, and stars circle where a head would be.
- The squares are the six places from her own painting I7: night sky, meadow, sea, snow, sunset, chessboard floor. Some are sewn in sideways or upside down.

Picture: `deliver/Fox_Same_Cloth_Slip_Stitch_Crazy_Quilt.jpg`, stills of each beside H9 to H13.

## Not seen in motion

The test machine draws about two frames a second. Every move here was checked as stills and by measurement only. **How they flow is for Chris to judge on his phone.** Same Cloth and Slip Stitch are the longest moves she has, so pacing is the thing most likely to need changing.

## Checks

- Every stance with every move: 126 pairs, no broken numbers.
- Her arms never lock (reach at most 0.96 of their length). Fingertips at most 2.5 m/s in Same Cloth, 3.2 in Slip Stitch, 3.5 in Crazy Quilt.
- Her hair is unchanged (same vertex sums as the last build).
- The single file plays all 14 moves at phone size with the network cut off. The only error is the blocked web font.
- The real page, Walk around on, Flipbook look off and on, at chosen seconds of each spell: no errors.
- A spell cut short brings her back and leaves no magic standing.

## Where they differ from the paintings

- **H10:** the copy swings one arm. Here the copy is stiff, so it whirls round its post and its arm comes round with it.
- **H9:** the copy trails a veil of cloth back to the outline. Here there is no veil.
- **H12:** she steps through with her back to us and looks over her shoulder. Here she faces us, waves, and steps in sideways behind the lifted edge.
- **Slip Stitch is a stage trick.** The patches of other places are a solid surface and she goes behind it. From the front she disappears behind the flap. From the side or behind you can see her standing there until she is gone.
- **H11:** the slit is taller than she can reach. Here it starts where her shears reach (1.96 m) and runs on down to the ground by itself.
- **H13:** seven or so big pictures with wild frayed edges. Here six square pictures in a neat three by two, with a plain bright rim.
- **No teeth,** as everywhere. She laughs with her mouth shut.

## Pieces the other witches can use

All in `src/89c_foxspells3.js`. The README has how to call each.

- **Thread** (`RIB`): ribbons of light that face the eye, in her thread's colours.
- **Patches of other places** (`PLACES`): six pictures in one small file, cut from painting I7 by `bake_places_fox.py`.
- **A cut in the air** (`SLIT`): the line, the opening with the patches behind it, the stitches, the needle.
- **A ghost copy of an enemy** (`EGHOST`): the host says what she is aiming at (`fox.target = an object`). It also works out the line round that object, a hand's breadth outside it. It copies plain shapes only. An enemy with bones would need the second-skeleton trick her own double uses.
- **A quilt of light** (`QUILT`).
- **Any fingertip** (`tipOf`).
- **"She is away"**: a spell can say she is not to be drawn. `fox.state.away` tells the game.

## For the game

- Same Cloth needs the game to hand her the enemy (`fox.target`). The foes in the repo so far are flat sprites (Envoi's, in `art/foes/`). A flat sprite has no shape to copy. That needs deciding before this spell goes into a fight.
- Slip Stitch ends with her gone. The game decides what happens next (the party leaves the fight).

## Lessons

1. **A tool held along the forearm cannot follow a straight line with a straight arm.** For the downward cut, the grip had to change through the stroke (blade up at the top, along the arm at the bottom). A search over grip and wrist found it. Guessing did not.
2. **A hand-on-target solver can run away** when moving the hand also turns the tool. Take small steps (0.4 of the error each time).
3. **A flat thing seen edge-on is invisible.** The outline first faced her and the audience saw a line. The quilt first flew level and the audience saw its edge. Turn flat magic to face whoever is looking.
4. **A page with a roaming camera needs to know how wide a spell is.** The cut and the quilt were off the edge of the screen until the page was told.
5. **Loose cloth lives outside her body group.** Hiding her left her trouser flounces floating. Hide both.

## Next

Round 4: paintings J1 to J11 and K1 to K4 (Switcheroo, Finders Keepers, Loose Thread, Ninefold Lie, Bellbound Bargain, When the Bell Falls Silent, The Moon's Little Lie, Pins and Needles, Seam Ripper, Thimble).

Still open from before, not started: make the foxfire fox look like painting H6; soften the Jester's jump she borrowed.
