# The extra pictures the story needs: fight places, story pictures, two changed paintings and the item cards

Chris, who makes Moon Faire with Claude, has a story now ("The fire that would not end", below) and nine painted walking places. He paints with an image generator: for each picture he attaches a few reference images and pastes a prompt. You write what each new picture shows, and for the fight places you also lay out a grey-box guide, as was done for the walking places.

The game draws realistic 3D witches, fair folk and foes on top of paintings. So wherever a witch's face or whole figure would be in a picture, the game stages her 3D model: the paintings never show the four witches, the fair folk, the captain or any wisp or wraith. The one exception is S1, which shows only a pair of hands.

Write for an image generator: concrete and visual, positions in plain words ("in the lower left", "a third of the way in from the right"), short sentences. No proper names. No lettering in any picture. Everything must agree with Chris's nine paintings (shown to you) and with the story.

## The pictures (the list is fixed)

### Fight places: 4:3, drawn from the game's fight camera, with a guide you lay out
The fight camera stands near eye level and tilts slightly up. The horizon is level, 61% of the way down. The bottom third is flat, open, empty ground where the game stands the party (left) and the foes (right). The moon, Auros, is at 31% across and 17% down, about 13% of the picture's height across, unless something in front hides it.
- **F5 the lamp room**, deep night: the top of the dead beacon tower, where the story ends. It must be a wide, flat, round stone floor open to the sky, ringed by stone piers, with the great iron fire cradle cold and empty, raised on a plinth behind the open ground. The cradle is where one small flame is left burning at the very end, so it must be easy to find, and the game adds that flame itself. Empty iron lamp brackets on the piers. Beyond the piers: night sky, the dark sea to the horizon, the moon.
- **F2 the fair**, dusk: for the three fights in the fair (a wisp in the square, wisps at the ring lamps, wisps at the brazier). One place for all three: trodden earth between tents, with the fair behind.
- **F4 the beacon stair**, deep night: for fights on the stair. A broad flat landing of the crag stair, with the dark tower above and behind and the sea beyond.
- **F3 the standing stones**, night: for the fight with the Shadow Wraith that bars the road. Open turf with the tall stones behind it, and the crag small and far away over the sea.

### Story pictures: 2:1, full screen, shown with one line of words, nothing drawn on top
- **S1 "Warm in her hands"** (thing W4-e): close on two cupped hands holding a small flame that is turning from cold pale green to warm gold. Only the hands and the cuffs of Io's sleeves (her picture is attached to that prompt), the heather dark behind, the lit lantern of the Last Lantern soft and out of focus.
- **S2 "The threads"** (thing W5-e): what the Fox sees from the standing stones. The moor at night, and from every flame in sight a hair-fine thread of cold blue light, all of them pulled tight toward the crag far off over the sea. Wide and still. No people.
- **S3 "The flight to the crag"** (after thing W3-e): the captain's airship in flight at night, seen from behind and a little above, small against the sky, its twelve deck lamps lit and every flame leaning forward. The moor and the cliff coast below, the dark sea ahead, the crag and its dead tower beyond. Blue stitches too fine to see: do not paint them.
- **S4 "The lights go home"** (thing F5-c): seen from the top of the tower, looking out over the sea and the moor. Hundreds of small warm lights streaming outward and down, every way at once, like slow star dust, some toward the far glow of the fair on the horizon. In the foreground, low in the picture, the edge of the iron cradle with one small ordinary flame.
- **T1 the title picture**: the Moon Faire at dusk from a little way off on the moor road: tents and lanterns, the big top, the captain's airship moored at its edge, and Auros huge and nearly full, hanging still in the sky.

### Changed paintings: an edit of a painting Chris already has, same size, everything else untouched
- **E1 "Thirteen lights"** (thing F5-d): the beacon stair painting (W9), with a small warm light now burning at the top of the tower and spilling down its stone, and the far airship's twelve lamps a little brighter.
- **E2 "The dead post lit"** (after the end): the Last Lantern painting (W4), with the second, dead post now carrying a small steady flame too.

### The item sheet: one 3:2 picture, six things in two rows of three
Each thing lies alone in the middle of its own square on dark cloth, lit the same way, so the game can cut the sheet into six card pictures. In this order: the cold lantern glass; the cut thread; the warm stone; the hollow amulet; the keeper's charm; one of the captain's ship lamps, lit (for the lamp count).

## The fight guides
For each of F5, F2, F4 and F3 give a layout in metres. x runs left to right, z runs toward the camera (negative z is farther away), y is up. The camera stands at x 0, z 18, 2 m up. At z 0 the picture is about 16.5 m wide; at z -12 about 27 m; at z -30 about 44 m.
- `clear`: the open ground, an ellipse: `{"x": 0, "z": 0, "rx": 7.5, "rz": 4.2}`. Keep these numbers. The party stands at x -5.2 to -2.2 and the foes at x 2.6 to 5.4; the biggest foe is 4.4 m tall at x 4.5.
- Nothing may stand on the clear ground, in front of it, or beside it nearer than z -5. Everything with a shape stands behind (z -7 or farther) or far to the sides and back.
- `flats`: flat patches on the ground behind the clear (a paved ring, a path), each `{"kind": "disc"|"box"|"path", "name", "tone", ...}`: a disc has x, z, r; a box has x, z, w, d, turn; a path has a [x, z], b [x, z], w. Tones: path, stone, water, cloth, grass, dark.
- `solids`: `{"kind": "box", "name", "x", "z", "w", "d", "h", "turn", "y", "tone"}`, `{"kind": "cyl", "name", "x", "z", "r", "h", "y", "tone"}`, `{"kind": "cone", "name", "x", "z", "r", "h", "tone"}`, `{"kind": "tent-round", "x", "z", "r", "wall", "top"}`, `{"kind": "tent-square", "x", "z", "w", "d", "wall", "top", "turn"}`, `{"kind": "stall", "x", "z", "w", "d", "h", "turn"}`, `{"kind": "post", "x", "z", "h"}` (a lit lantern post), `{"kind": "fire", "x", "z", "r"}`. Tones: stone, wood, dark, tree, tent, roof, hull, solid. Use 6 to 16 solids. Big simple shapes: this is a guide, not a model.
- `moon`: true, or false if a roof or wall hides it.
- The far horizon (hills, sea) is flat ground in the guide; say what it is in the words.

## Format
One JSON object and nothing else:
{
 "fights": {
  "F5": {"name": "The lamp room", "clear": {"x": 0, "z": 0, "rx": 7.5, "rz": 4.2}, "flats": [], "solids": [], "moon": true,
         "ground": "one or two sentences: what the open ground is made of and how it looks",
         "scene": "one sentence: the place and the hour",
         "shows": ["four to seven lines, each one thing in the picture and where it is"]},
  "F2": {}, "F4": {}, "F3": {}
 },
 "stills": {
  "S1": {"view": "where the viewer stands and how close", "shows": ["four to seven lines"], "light": "one or two sentences", "attach": ["which of Chris's paintings to attach as references, by id (W1 to W9, F1, MAP), at most two, and why in five words each"]},
  "S2": {}, "S3": {}, "S4": {}, "T1": {}
 },
 "edits": {"E1": {"change": ["each change, exactly where"], "keep": "what must not change"}, "E2": {}},
 "items": {"cloth": "one sentence on the cloth and the light", "cells": ["six lines, one per thing, in order: what it looks like, so it can be told at a glance at card size"]}
}

When you are shown your four fight guides with labels, check each honestly: is the open ground empty and are the party and the foes clear of everything? Is each place readable as that place from big shapes alone? Does anything stand in front of a fighter or hide the moon by accident? Then answer with a JSON object holding only `"fights"`, with all four in full, fixed. If nothing needs fixing, answer with the single word DONE.
