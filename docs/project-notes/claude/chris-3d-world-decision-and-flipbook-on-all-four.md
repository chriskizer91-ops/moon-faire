# Chris: the map and the world will be 3D rendered. And where the Flipbook look stands on all four witches

November 14, 2026, 2:19 pm.

## His words

"I want to convey to you that we are moving forward with a 3D rendered map and world."

In the same message he asked for Io's light levels (done: `claude/io-3d-light-levels-and-fight-test.md`) and to make sure all four witches have "the updated flipbook pixel overlay".

## What he said, and what he did not

**Said:** the map and the world are to be 3D rendered.

**Not said, so not to be assumed:**

- How the 3D world is made (built in code like the witches and the night square, or some other way).
- What becomes of the nine painted places (W1 to W9), the painted world map and the painted fight backdrops.
- Whether the camera stays at the fixed walking angle or is free.
- Whether the Moon Faire map editor (`claude/moon-faire-map-editor.md`) still has a job.

Ask him before building on any of these.

## What it changes in the work done here

These are consequences I can see, not decisions of his.

- **Fight cameras** (`claude/pilot-fight-cameras.md`). The limit that note describes goes away. A painted place could only be cropped, and a moved camera needed the painting shown out of focus behind the cast. In a 3D place any camera is true: it can go round anyone, and nothing has to be blurred. The five camera choices on the pilot still say what kinds of shot were tried; the two that move would simply be real.
- **The Flipbook look on the whole picture** (`claude/flipbook-look-finer-and-pilot.md`). On a painting, the place needed its own 64 colours worked out from the painting, and its pixels had to be kept from swimming. A 3D place can be drawn into the same small picture as the cast and take the same ink and colour step. It will need its own colours chosen: the witches' 56 have no green.
- **The weights** (`claude/chris-which-weight-where.md`). A painted place costs nothing to draw. A 3D place costs triangles and draws like everything else, so the witches' share of the budget shrinks. That argues for his rule (Lightest for walking and far fights, Light close up) more strongly, not less.
- **There is already one small 3D place:** the night square the fight tests stand in, built in code. Four witches at Lightest and 12 stand-in foes in it draw between 156,000 triangles (the Jester) and 373,000 (Io). That is a first measure of a 3D scene with a party in it. Real speed has not been measured.
- **The map editor's tracing** is in painting pixels. If the paintings go, the tracing has nothing to sit on. Its ground positions (through `ground()` in `mf_maps.py`) could still seed a 3D place's layout.

## The Flipbook look on all four witches (checked November 14, 2:40 pm)

"The updated overlay" is the finer look: a Pixel size slider and a Colours slider, in place of one fixed chunky size.

| | Her "how light can she go" page (this session's) | Her own model page | Her branch's `viewer/stage.js` |
|---|---|---|---|
| Jester | yes, opens at 1.2 mm | **old look only** | old (commit `31b6351`) |
| Fox | yes, opens at 1.2 mm | **old look only** | old, and an older copy of the file (commit `0a21ddc`) |
| Ranger | yes, opens at 1.2 mm | yes (her stage 14) | has it (commit `3e6706e`) |
| Io | yes, opens at 1.2 mm | **old look only** | old (commit `3bc17a3`) |

- All four of this session's pages now open the sliders at Chris's setting (1.2 mm of her to a pixel, full flipbook colours). The Jester's and the Fox's used to open at the old chunky size.
- The three "old look only" pages belong to the witches' own sessions, and the branches were only read. Nothing was pushed.
- **To bring a branch up to date:** the Jester's and Io's `viewer/stage.js` are the same file, and the four replacements of the finer look (`patch_stage.py`, the part after "the finer Flipbook look", in `claude/flipbook-look-finer-and-pilot.md`) turn it into exactly the Ranger's current `viewer/stage.js`. So copying the Ranger's file over is the whole change. The Fox's is an older copy that the last replacement does not fit; she takes the Ranger's file whole too (her "how light can she go" page already runs on it). Each page then needs the two sliders; the Ranger's `viewer_r/index.tpl.html` shows how.
- With nothing set, the newer stage draws the old look exactly, so a page that does not add the sliders is unchanged.

## The four "how light can she go" pages

- Jester: https://claude.ai/artifact/Xk8Y7ojoPE9yLuEantbvUh
- Fox: https://claude.ai/artifact/MtcEi9TdtLCh4CroRm6Jgo
- Ranger: https://claude.ai/artifact/N79UjtHYW2rn1gmHgyt2Ks
- Io: https://claude.ai/artifact/MUxJCt6d921JK6Yzwa1TXn

| One witch standing, triangles in her | Full | Trim | Light | Lightest |
|---|---|---|---|---|
| Jester | 584,000 | 91,000 | 43,000 | 19,000 |
| Fox | 578,000 | 122,000 | 55,000 | 31,000 |
| Ranger | 394,000 | 96,000 | 59,000 | 38,000 |
| Io | 594,000 | 140,000 | 69,000 | 45,000 |

A party of the four, one of each, is about 133,000 triangles at Lightest and 226,000 at Light, before shadows, foes and the place.
