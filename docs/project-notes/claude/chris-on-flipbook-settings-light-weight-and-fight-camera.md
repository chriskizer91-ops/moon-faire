# Chris on the Flipbook look's settings, the Light weight, and the fight camera

November 13, 2026, 7:38 pm. What Chris said after trying the three pages with the sliders. Read with `claude/flipbook-look-finer-and-pilot.md` and `claude/HOW-TO-3d-light-levels.md`.

## His words

- "I do like it on the Moon Faire pilot, at least the way it was showing up. I think the finest pixel setting that was available and full flipbook appearance."
- "For their faces, the characters, 1.2 millimeters of her to a pixel, and then full flipbook is a good level for the flipbook."
- "At 1.7 millimeters of her to a pixel is also interesting. But when you get to like 2.4, too much detail is taken away. Right around 2.2 millimeters of her to a pixel is also good."
- "I think fight distance is too far away for whatever's happening. I think we have to come up with interesting camera angles."
- "We could probably use the light model for almost everything in the game, as good as she looks up close. I don't think there's ever a reason to get closer to her. And it doesn't really change her face. It changes like details. And how the fabric behaves though. But I think for rendering smoothness and not having the computer fans spin like crazy to run the game, maybe the light model weight is the best."

## What that settles, and what it does not

**The Flipbook look (his preference so far, not a final choice for the game):**

- Colours: full flipbook (100%). He did not ask for the in-between colours.
- Pixel size close up, on the witches' pages: **1.2 mm of her to a pixel** is the good level. 1.7 and about 2.2 are also good. **2.4 and above lose too much.** The old look is 4.75.
- On the pilot: the finest setting, with full flipbook colours.

These two are one rule. On the pilot she is small on the screen, so the finest setting there is one pixel of the look to one pixel of the screen: no pixels show, only the flipbook's colours and the ink outline. "1.2 mm of her to a pixel, and never finer than the screen" gives the pilot's picture at walking and fight distance, and small pixels only when the camera is close. In the witches' `stage.js` that is `stage.pixelWhole = false; stage.mmPerPixel = 1.2; stage.snap = 1`. The pilot's stage counts rows down the screen instead and has no setting in millimetres yet.

**The weights (his leaning: "maybe"):**

- Light for almost everything in the game, not only fights. His reasons: she looks good close up at Light, her face does not change, and the computer should not have to work hard.
- What he sees change at Light: small details, and how the cloth behaves.
- This replaces the earlier plan of Trim for walking. Full is still wanted for the menu viewer (one character alone, turned round, playing her spells): he has not taken that back.
- Not said: whether Trim is still wanted for anything, or a use for Lightest.

**The fight camera:**

- The fight distance used in the fight tests and the pilot is too far away. The game needs closer, more interesting camera angles. None are designed yet.

## Does pixel size change the cost of drawing her? (he asked)

Hardly. She is still built, moved and lit in full; only the picture she is drawn into is smaller. A chunkier pixel saves a little of the graphics card's work per picture and none of the two big costs: the cloth, which the processor works out (the Jester), and the number of triangles (the Fox). So pixel size is a choice of look only. The weight is what changes the cost.

Measured on the test machine, one witch standing: the Jester at Light is 43 thousand triangles against 584 thousand at Full, and her cloth takes 1.1 ms a picture against 27.5. The Fox is 55 thousand against 578 thousand. Real speed on Chris's machines has not been measured for the lighter weights.

## For other sessions

- Do not change any page's starting look: the Flipbook look still starts off on every page (`claude/HOW-TO-flipbook-look.md`, section 2).
- When a page gets the finer look, 1.2 mm with full colours is the setting to show Chris first.
- Build fight scenes for a closer camera than the fight tests used. A witch at Light holds up close.
