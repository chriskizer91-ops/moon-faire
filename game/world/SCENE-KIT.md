You lay out one walking scene of a painted fantasy game, Moon Faire, as a simple grey-box model, and write what its painting should show. A painter (an image model) will paint over your grey-box guide, so the painting fits the game's hidden 3D camera and realistic 3D characters can walk on its ground. Then you are shown your guide and may fix it.

Reply with JSON only (or the single word DONE when the guide you are shown is right).

## The space

Metres. The ground is ONE flat level: y = 0 everywhere a character walks. x is to the viewer's right. z is toward the viewer: far is negative, near is positive. The camera never moves: it looks down at about 24 degrees through a long lens from the near side, so far things are only a little smaller than near things.

The painting is 2 wide by 1 tall. Its top 15% is a sky band (skyline and sky, with the moon Auros in the upper left); the game never walks there. Below it the frame shows the ground from about z = -13.5 (far, top) to z = +8 (near, bottom). It is about 25 m wide at the far edge, 21 m wide across the middle (x from -10.5 to +10.5 at z = -2.5) and 17.5 m wide at the near edge.

Because the camera looks down at 24 degrees, anything upright HIDES the ground behind it (farther away, at smaller z) for 2.25 times its height: a 2.3 m stall hides 5 m of ground behind it. So:
- Tall things go at the far side and the left and right sides of the walkable ground, never between the walkable ground and the viewer.
- On the near side of walkable ground only low things may stand (up to 1 m: crates, a low wall, a log), or tall things in the bottom corners with no walkable ground behind them.
- You are told how much walkable ground each solid hides. Aim for none.

## The file

{
 "id": "W2", "name": "The stall row and the sparring ring",
 "figure": [-2, 1],
 "ground": [ { "kind": "disc", "name": "the ring", "x": 4, "z": -2, "r": 3.2 }, { "kind": "box", "name": "the row", "x": -3, "z": 0, "w": 12, "d": 5, "turn": 0 }, { "kind": "path", "name": "lane to the square", "a": [-6, 0], "b": [-12, 0.5], "w": 4 } ],
 "flats": [ { "kind": "disc", "name": "the pool", "tone": "water", "x": 0, "z": -6, "r": 3 } ],
 "solids": [ { "kind": "stall", "name": "pie stall", "x": -5, "z": -4.5, "w": 3.2, "d": 1.7, "h": 2.3, "turn": 0 } ],
 "exits": [ { "to": "W1", "side": "left", "x": -10, "z": 0.4 } ],
 "people": [ { "who": "pie-seller", "x": -5, "z": -2.9, "seat": false } ],
 "painting": { "title": "THE STALL ROW AND THE SPARRING RING AT DUSK", "intro": "Two sentences: what place this is and the hour.", "bullets": [ "The ground: ...", "..." ], "top": "what the sky band shows beyond the scene" }
}

- `figure`: where a 1.70 m measuring marker stands, on open walkable ground near the middle.
- `ground`: the WALKABLE ground, pale in the guide. `disc` (x, z, r), `box` (x, z, w across, d deep, turn in degrees) or `path` (from a to b, w wide). The shapes must overlap into one connected area that reaches every exit and holds every person. Give 80 to 200 square metres. Leave open room; the party's witch runs about on it.
- `flats`: flat things that are not walked on, drawn in a tone: `water`, `cloth` (a rug, a ring's canvas), `dark` (a pit, scorched earth), `stone` (paving, a slab), `grass`.
- `solids`: upright things. Kinds:
  - `box` (x, z, w, d, h, turn; optional `y` to lift it, and `tone`: stone, wood, hull, dark): crates, walls, wagons, standing stones, an arch's pillars and lintel, steps, an airship's hull.
  - `cyl` (x, z, r, h): a well, a pillar, a barrel, a tower.
  - `cone` (x, z, r, h): a tree, a spire of rock, a pile.
  - `tent-round` (x, z, r, wall, top), `tent-square` (x, z, w, d, wall, top), `stall` (x, z, w, d, h, turn; its counter faces +z before turning).
  - `post` (x, z, h): a lantern post with a lit lantern. `fire` (x, z, r): a camp fire or brazier.
  Give every solid a short `name`: it is how the painter is told what it is. Use 8 to 22 solids. They are stand-ins: a box 0.6 wide and 3 tall is a standing stone once painted.
- `exits`: one for each exit you are told about, where the walker leaves: on the walkable ground at the frame's edge. `left`: x about -10. `right`: x about +10. `near`: z about +7.5. `far`: z about -12.5 (a way leading up and out between things).
- `people`: where each person you are told about stands, on walkable ground, at least 1 m clear of solids, not hidden. `seat: true` if they sit (the game brings a low seat; do not add one).
- `painting`: what the painter is told. `bullets` go through everything in the guide, back to front, saying what each grey shape really is and what it is made of, in plain words, six to ten bullets. Start the first with "The ground:". Do not mention people, creatures, lettering or anything that moves. `top` is the sky band: the skyline beyond the scene, and that Auros, the moon, is large, pale and nearly full in the upper left.

## What makes a good scene

- Read at a glance: one clear open place with a few strong landmarks, not a clutter.
- The walkable ground is obvious in the finished painting (trodden earth, paving, a boardwalk) and nothing overhangs it.
- Each exit is a visible way out: a lane, a gate, a gap between rocks, a gangway.
- Things the plan says are here are here (a ring, an airship, standing stones, a pool and broken arch, a stair), with room beside them to walk.
- It is all one level. A stair, a slope or a ledge is painted at the far side or the edges as scenery; the party walks the level ground in front of it. An airship is moored at the far side with its gangway coming down to the walkable ground.
- Light: the hour you are told. Lantern posts and fires are the only bright things besides the moon.
