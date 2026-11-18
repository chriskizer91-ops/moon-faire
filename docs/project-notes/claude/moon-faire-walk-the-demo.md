# Moon Faire demo: walk the whole demo, first build (November 14, 2026, midday)

Follows `claude/moon-faire-story-pictures-and-next-steps.md` (step 1 of the order there) and `claude/moon-faire-map-editor.md`.

## Where it stands

**A first walk-through is published. Waiting for Chris's traced walking paths** from the map editor (he said it will take him a few hours). When they arrive they go in with two commands and the page is republished.

- Page: "Moon Faire: walk the demo", https://claude.ai/artifact/SbBXdfQciYPgdmqBpY2YkU (also sent as `moon-faire-walk.html`, 9.9 MB, works offline)
- Repo: `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-starter-world`, `game/src/world.js`, `game/build_walk.py`. README section "Walk the demo".

## What Chris said (November 14, 11:35 am)

"Yes I am using a map editor to make the walking paths good. That will take me a few hours." (Yes to walking the whole demo next.)

## What the page does

- The Jester, at her Lightest weight (Chris's choice for walking), walks all nine painted places.
- Walking off a place by one of its ways out opens the next place. The flight between the mooring field and the landing ledge shows its story picture, "The flight to the crag".
- The eleven fair folk stand where the map puts them. Near one, "Do it" (or E) starts their lines from the chosen story; pressing again gives the next line. They turn to face her.
- The captain is a grey stand-in with his lines, until his model is built.
- Tap or click the ground to walk: she finds a way round things and people. Or WASD and the arrow keys; Shift runs.
- A Map button shows the painted world map with a pin on each place. Tapping a pin goes straight there.
- The three rest spots are places to stand. Resting does nothing yet.
- Light on her and the fair folk changes by zone: dusk at the fair, cooler and dimmer on the moor, more so on the crag. Light from the nearest painted lanterns and fires falls on them.
- A Flipbook look switch, off to start. The witches' colours do not suit the fair folk yet (still open).
- On a phone held upright the picture is taller and she is shown closer, so she can be read.

## How the traced paths go in

The game now reads each place in the same form the map editor reads and writes, in the painting's own 1,774 by 887 pixels:

- **Walk areas** and **blocks**: where her feet can and cannot go.
- **Fronts**: pieces of the painting that are drawn over her when she is behind them. In the game each becomes an upright sheet standing at its base line's distance, so the painting itself hides her.
- **Ways out, where she arrives, people, rest spots**: single places.

Until the tracings arrive, each place uses its starting shapes, made the same way the editor's own starting shapes were made. So for now she can stray onto things, she is not hidden behind everything she should be, and two people stand on furniture (the gate keeper on his coin table; the captain under the hull). Tracing fixes all of that.

To take a tracing in: save the editor's "Copy my work" text (or the documents from the editor page's store) to a file, then `python3 tools/take_map_edits.py <file>` and `python3 build_walk.py`, and republish. One part is a guess until the first real tracing arrives: how the editor writes "where she arrives".

## Checked, and not

- Checked in a test browser: all nine places open with their people; walking out of the fair square into the stall row; walking up to someone and talking through their lines; a route past a person standing in a narrow way; the flight and its picture; the map; the phone layout.
- **Not checked: how it feels in the hand, and real speed.** The test machine has no graphics card. The line under the picture on Chris's own screen is the number that counts. Counts from the test: 20 to 30 thousand triangles and 32 to 100 draws, depending on how many people are in the place (the fair square, with four people, is the heaviest).

## Not in yet

Fights; the things that can happen; the lamp count; the gates (every way out is open); the other three witches; the fight cameras from the other session.

## Next, in the order told to Chris

1. Take in his traced paths when they arrive.
2. The story as things that happen: talk, the witches' little scenes with the story pictures, errands, finds with their item cards, rest, the lamp count, the gates.
3. The fights: the two wraiths from Envoi, the party of four with the agreed combat numbers, the fight cameras, on the five fight places.

## Cost

Nothing on Chris's key for this step (it was built in the session). The key stands at about $44.93.
