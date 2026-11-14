# The world map of the Moon Faire demo: a reference drawing and the words for its painting

Chris, who makes this game with Claude, wants one painted map that shows the whole demo: every scene set down in its place on a grid, with a fictional land around them. He will have the painting made by an image generator from two things you make here: a flat reference drawing (so the generator keeps the layout) and detailed descriptions in words. The game will later draw pins, names and the grid on top of the finished painting, so the painting itself carries no words.

The lore is Chris's. Proper names are open: invent none. Call things by plain stand-ins ("the settled country", "the old beacon road"). Everything you invent for the land around the scenes is a stand-in he may cut, and you must list it.

## The frame (fixed)
- An SVG, `viewBox="0 0 1536 1024"`, width 1536, height 1024. North is up. West is left.
- A grid of 12 columns (A to L, left to right) and 8 rows (1 to 8, top to bottom). Each square is 128 px. Square C6 runs from x 256 to 384 and y 640 to 768; its centre is (320, 704).
- In every scene of the game the camera looks north: a scene's "left" is west, "right" is east, "far" is north, "near" is south. Auros, the moon, hangs in the upper left of every sky, so on the map moonlight comes from the north-west and shadows fall to the south-east.

## Where the ten places are (fixed: draw each at the centre of its square)
| Place | Square | Centre (x, y) |
|---|---|---|
| W1 the fair square | C6 | (320, 704) |
| W2 the stall row and the sparring ring | D6 | (448, 704) |
| W3 the mooring field, with the captain's airship moored on its north side and the fair gate on its east side | E6 | (576, 704) |
| W4 the Last Lantern | G6 | (832, 704) |
| W5 the standing stones | I5 | (1088, 576) |
| W7 the hollow (hidden, just south of the stones) | I6 | (1088, 704) |
| W6 the still pool and the broken arch | K6 | (1344, 704) |
| W8 the landing ledge | J3 | (1216, 320) |
| W9 the beacon stair | K3 | (1344, 320) |
| F5 the lamp room, the top of the dead beacon tower | K2 | (1344, 192) |

How they join, which the drawing must show as roads and tracks:
- The fair is one fairground lying across C6, D6 and E6: a lane runs west to east through it from the square, along the stall row, to the mooring field. It is small: a travelling fair of tents and stalls, not a town.
- From the fair gate on the east side of E6 the moor road runs east to the Last Lantern at G6.
- From G6 a track climbs north-east to the standing stones at I5.
- From the stones the road goes on east and a little south, down to the pool at K6, where it ends.
- A faint gap in the gorse leads from the stones south into the hollow at I6. It should be barely there.
- The beacon crag (J3, K3, K2) cannot be reached on foot: the party is flown there. It must be cut off from the moor by sea or by a drop no path crosses. Draw no road to it that still works; a broken one is welcome.
- Do not draw the airship's flight line. The game draws it.

## The land around (yours to draw; a suggested skeleton you may improve)
- The fair stands where the settled country ends and the moor begins. The road the fair came by enters from the west edge and reaches the fair square.
- West: farmed country, hedged fields, a river with a bridge, a few farms. North-west: wooded hills. The middle and east: open moor, heather, gorse, drystone walls, lone stones, rock outcrops, small moor pools. South: the moor falling to a river valley or marsh.
- North-east: the sea. The coast runs from the north edge down to the east edge, with cliffs. The dead beacon's crag stands off this coast in the sea, tall and bare, with the tower on top. The paintings of W8 and W9 show a dark flat horizon and open air below the ledge.
- The world: a Dark Ages fantasy that runs on solar crystal power that looks like steam; airships matter here. An airship beacon is a tower that once showed a light for airships. This one is dead. Keep the land modest and real. No castles, no cities, no volcanoes, no glowing magic.
- Fill every square with something a painter can paint, but keep the ten places the clearest things on the map. Leave the land quieter the farther it is from them.

## The drawing
- Flat shapes in these colours only, so the painter's instructions can name them. No gradients, no textures, no outlines thicker than 2 px, no text of any kind, no grid lines.
  - `#8a9a5b` farmed fields; `#9aa56a` a second field tone for a patchwork
  - `#3f5f45` woods
  - `#6b5a7a` heather moor; `#7d8466` rough grass; `#5d6b3a` gorse
  - `#6f6f78` rock, crag and stones; `#4a4a55` cliff faces and deep shadow
  - `#27314f` sea; `#3b5a8c` rivers and pools; `#5f7a6e` marsh
  - `#c9b48a` roads and tracks; `#b98a5a` trodden fairground
  - `#b0453a` and `#e8dcc0` tent stripes; `#5a3d2a` wood (the airship's hull, booths, the bridge)
  - `#ffcf6b` warm lights (lanterns, the camp fire, the fair's glow)
- It is a pictorial map: the ground is seen from straight above, and landmarks are drawn as small simple pictures standing upright, larger than life, as on old maps. A tent is a striped cone or triangle. A standing stone is a tall grey slab. The tower is a small dark tower.
- Each of the ten places must be readable at its square's centre as that place, in a patch about 90 to 120 px across:
  - W1: a small open square with a well in the middle and tents round it, and a few warm lights.
  - W2: two rows of stalls along a lane, with a roped ring of pale sawdust.
  - W3: an open trodden field; a wooden airship hull lying along its north side; a gate of two posts on its east side.
  - W4: one lantern post with a warm light where the road meets a broken drystone wall; a second, dark post beside it.
  - W5: a ring of seven or eight tall stones round a patch of worn turf.
  - W7: a small rocky dip, darker than the moor round it, with a tiny pool.
  - W6: a round dark pool with a broken stone arch on its north bank and a small camp fire on its south bank.
  - W8: a flat rock shelf low on the crag's south-west side.
  - W9: a stair cut up the rock from the shelf to the tower's foot.
  - F5: the dead tower at the top of the crag. No light in it.
- Warm lights only at the fair, at the one lit lantern (W4) and at the camp fire (W6).

## The words
The painter's instructions are assembled from what you write. Write for an image generator: concrete, visual, positions given in plain words ("in the lower left", "a third of the way in from the left edge") and never by grid square or pixel. Plain words, short sentences.

## Format
Answer with exactly two fenced blocks and nothing else.

First the drawing:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1024" width="1536" height="1024"> ... </svg>
```

Then the words:
```json
{
 "whole": "four to six sentences: the map as one picture, for the painter",
 "land": [{"name": "plain stand-in name, lower case", "where": "where it lies on the map, in plain words", "paint": "two or three sentences for the painter", "label": [x, y]}],
 "places": {"W1": "two or three sentences: how this place looks on the map, from above, matching its painting", "W2": "...", "W3": "...", "W4": "...", "W5": "...", "W6": "...", "W7": "...", "W8": "...", "W9": "...", "F5": "..."},
 "routes": [{"from": "W3", "to": "W4", "name": "plain stand-in name", "paint": "one or two sentences"}],
 "invented": ["each thing you made up that is not in the brief or the paintings, one short line each"]
}
```
"label" is where a small name tag for that piece of land should sit on the key, in SVG pixels, clear of the ten places. Give six to ten pieces of land.

When you are shown your drawing with the grid and the pins laid over it, check it honestly: is each place's picture under its pin and readable as that place? Do the roads join the pins in the right order and stop where they should? Is the crag cut off? Is anything confusing, crowded or empty? Then answer again with both blocks in full, fixed. If nothing needs fixing, answer with the single word DONE.
