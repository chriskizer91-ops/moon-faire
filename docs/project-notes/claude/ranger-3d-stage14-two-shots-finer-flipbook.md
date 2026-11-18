# Ranger 3D, stage 14: the gem's two shots, and the finer Flipbook look

November 13, 2026. Page: https://claude.ai/artifact/NqGHWjWfKvmjcprckzUN7v (file `Ranger_3D_stage14.html`).
Code: repo `chriskizer91-ops/moon-faire`, branch `claude/ranger-3d-model`, folder `models/ranger-3d/`.

## What Chris said

"Let's do the two shot arrows of light and then I think that's her for now. I think that's how we're going to put her
in the game. There has been an update to the instructions for the flipbook look button if you could check on that"

So: **this is the Ranger as she goes into the game, for now.** The one thing on her list not built is jewellery.

## The gem's two shots

A new move in the fight row, "The gem's two shots" (`play('shots')`). In the combat notes the gem is two shots of 200.

1. She touches her gem, as in "The gem": the flare, the ring, light down her arms, the breath where everything hangs
   still.
2. She takes the bow from her back and draws. The first arrow of light goes.
3. Her hand comes forward to the string again while the bow arm bends in to meet it. She draws a second time and the
   second arrow goes.
4. The bow is rolled up and put away.

- The two arrows are thicker and longer than the one in Moonsteel Draw.
- Her gem and the light on her arms stay lit from the touch until after the second arrow. The gem flares as each goes.
- "The gem" on its own is still on the page: the touch without the shots.
- The whole move is 9.6 seconds.

Rough: both arrows fly the same way (aiming each at a different foe is for the game to do), and the bow dips only
after the second arrow.

## The Flipbook look

The update was the finer look: section 11 of `claude/HOW-TO-flipbook-look.md`, and Chris's settings in
`claude/chris-on-flipbook-settings-light-weight-and-fight-camera.md`.

- Her stage now has the finer look.
- On her page, turning Flipbook look on shows two sliders: **Pixel size** (chunky to fine) and **Colours** (smooth to
  flipbook).
- They open where Chris said looks good on the witches: **1.2 mm of her to a pixel, full flipbook colours.**
- Pixel size slid all the way to chunky is the look as it was (4.75 mm).
- The look still starts off when the page opens.

Seen at 1.2 mm in stills: her face, glasses, lace and bow all read; one clean ink line; the arrows, the gem's light
and the light on her arms stay soft with no ink. Her hair still lands on olive brown, which Chris has said is fine.

## For the Flipbook how-to (whoever edits it next)

- Section 3: the Ranger's `viewer/stage.js` on `claude/ranger-3d-model` now has the five finer-look changes, and her
  page has the two sliders. So the last line of section 11 ("Chris has not asked for the sliders on the Ranger's or
  Io's page") is out of date for the Ranger.
- The five replacements in `patch_stage.py` all applied to her stage as written, each found exactly once.
- A page without a `hidden`-friendly row can show and hide the sliders by setting the wrapper's `style.display`.

## For the next session: how it is built

All in `src/R99_static.js` unless said.

- `shots` is one move in two parts. In `animate`, while `mv.t` is before `GEM_CUT` (1.75 of the gem's own seconds) the
  move is treated as `gem`. After that it is treated as `draw` with `two = 1`.
- `drawClock(T, two, o)` is the bow move's clock. Up to the first release (`TR`, 2.45) it runs as it is. Then her body
  and the bow hold at full draw while the first arrow flies (0.45), her string hand comes back to the string as the
  clock runs backward from 1.86 to 1.30 (so the bow arm bends in, as at the first draw), it runs forward again to draw,
  holds, and she lets go at `TR2` (`TR` + 1.5). After that the clock is the plain one, late by `DL`.
- `armsAndBow(T, dt, two)` takes the raw time and uses `drawClock` itself. The body block in `animate` gets the same
  clock's time, so her stance holds through both arrows.
- `gemGlow(Tb, ck)` keeps the gem, her lenses and the lines of light on her arms lit, and flares the gem on each
  release.
- `tools/clip_audit.sh` and `tools/pop_audit.sh` know the new move.
- The finer look is in `viewer/stage.js`; the sliders and `flipSet` are in `viewer_r/index.tpl.html`.

## Checked

Stills at 9 moments of the new move; hands reached where they were wanted at each. No clipping (4 mm left while she
holds the bow) and no jump at any hand-over inside the move. The finer look in two stills. Page test at phone size,
three parts, with the new button and both sliders: no errors.

Not checked: on a real phone, and nothing was watched in motion.
