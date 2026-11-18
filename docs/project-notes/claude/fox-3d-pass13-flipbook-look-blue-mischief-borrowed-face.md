# Fox Witch 3D – pass 13 (Flipbook look; Blue Mischief; Borrowed Face)

Written by Claude, 13 Nov 2026. Follows `claude/fox-3d-pass12-shears-hemline-fangs.md`. Code: `models/fox-3d/` on branch `claude/fox-3d-model` of `chriskizer91-ops/moon-faire`, commit `bfc7ab5`. All three of her flipbook moves are now in.

## What Chris asked (13 Nov, 13:48)

- "Round 3: Blue Mischief then Borrowed Face."
- "Add the flipbook look as a button to turn on and off."
- He passed on two findings from the session that wrote `claude/HOW-TO-flipbook-look.md`: all four witches share the same 56 colours, and the 56 have no green.

## The Flipbook look on the Fox

Done as `claude/HOW-TO-flipbook-look.md` says. **That doc's table (section 3) and its "not checked" line (section 10) are now out of date for the Fox:** she has the colours and the switch, and the look has been seen on her.

What was found on her:

| Checked | Result |
|---|---|
| Her blouse | Snapped to **blue**, as the doc warned. Fixed by adding three colours, the blouse colours of her own flipbook frames: `[84,122,116]`, `[51,82,82]`, `[22,45,47]`. Three of the eight spare places are used. |
| A fourth colour | The pale of her foxfire in the flipbook, `[200,247,250]`, was tried and taken out. It pulled the white of her costume ears to ice blue. **Adding a pale colour changes every near-white on her.** |
| Her face | Eyes, mouth and smile read. |
| Skin | Face, neck, chest and arms land on the same family of colours. |
| Thin things | Her wire glasses show as dotted rings. Bracelets, choker, bell and belt show. Her shears are thin lines. Left as they are. |
| Her outline | One dark line round her. The ghost double is inked and coloured too, as a sprite's would be. Foxfire is not inked. |
| Sparks | Were drawn far too big: her older `src/80_fx.js` sized them by the screen. They are now sized by the picture being drawn into. |
| The page's own hit flash | The pale dots the page throws on a hit were lilac and landed at her feet, because her spells did not say where they land. They now have her foxfire colour and each spell sets the point. |
| The smooth look | Unchanged. |

Picture: `deliver/Fox_flipbook_look.jpg` (off and on: standing, talking, each spell). Check tool: `flip_shots.py`.

## Which way her spells go

Her spells act **toward her left** (screen right when she faces you), as on the sprite sheet, and the page turns her so that is the dummy. Hemline Fangs was first built striking forward, which had her cutting sideways to her target. A move that strikes forward now turns her to face it as part of the move.

## A ghost double

Her lore asks for it: "If a ghost 3D copy of any character in the game can be made, that is the direction."

- It is her own body drawn a second time, on a second skeleton, in one see-through blue material. No new shapes and no paintings are loaded for it. It costs drawing her twice while it shows, and nothing otherwise.
- A spell gives it any pose, a place and a turn, each frame. If no spell asks for it, it is gone. (A spell cut short left it standing there until this was added.)
- It does not have the loose cloth tiers of her trousers.
- **This is the piece Same Cloth needs** (a ghost copy of an enemy that turns on it), and Ninefold Lie (nine doubles) could draw the same double nine times.

## A fox of foxfire

A fox of light made of a dozen simple shapes: body, chest, head, snout, two ears, four legs that reach out in a leap, a big brush. It is plain. It reads as a four-legged thing with ears and a tail, **not as the running fox of painting H6**. Making it look like H6 is its own piece of work.

## Blue Mischief

- **From:** flipbook clip `blue_mischief` (22 frames at 6 a second, the release on frame 16), paintings H5 and H6.
- **What she does:** flicks her bell; the spark jumps to her fingertip; she turns her hand over and it grows into a little fox on her palm; she turns to her target and winds up; throws; the fox leaps, growing from 17 cm to 95 cm, and bursts where it lands.
- **Timing:** the flipbook's own 3.67 s. The throw is at 2.5 s and the hit 0.42 s later.

## Borrowed Face

- **From:** flipbook clip `borrowed_face` (22 frames, the release on frame 10), paintings H7 and H8.
- **What she does:** puts her palm over her right eye; a ghost double steps out of her left side, toward whoever is watching her, and makes them a deep mocking bow (the Jester's bow, which she keeps); behind it she leans away with a finger to her lips; the double fades at the end.
- **Timing:** 3.67 s; the double stands clear of her at 1.5 s.

Picture of both: `deliver/Fox_Blue_Mischief_and_Borrowed_Face.jpg`, with H5 to H8 beside them.

**Not seen in motion.** Stills and measurements only. In both spells her arms never lock and her fingertips stay under 5.5 metres a second.

## Where they differ from the paintings

- H5: the little fox sits on her left hand. Here it is her right, the hand that flicked the bell.
- H6: a detailed running fox with a streaming tail. Here a plain one.
- H8: she tiptoes away while the double bows. Here she stays where she is and leans.
- H7: the double has her lace and flounces. Here it has neither.

## Next

Round 3 still has Same Cloth, Slip Stitch and Crazy Quilt (H9 to H13) and her magic set (I1 to I9). Then round 4.
