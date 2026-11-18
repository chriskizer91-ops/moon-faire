# Starter world, steps 3 and 4: the Jester in the two pilot paintings

November 13, 2026. Follows `claude/starter-world-step2-pilot-prompts.md`. **Chris has judged the pilot (his answers are
below). One answer is still open: the moon-phase awning.**

- **The page:** "Moon Faire pilot: the Jester in the paintings", https://claude.ai/artifact/PkUTHyHVp9ZQDwvNgtUFqh
- **Single offline file:** `moon-faire-pilot.html` (3.8 MB), sent to Chris in the chat.
- **Repo:** `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-starter-world`, folder `game/`. Its README has a section
  for these steps, with every file and where each copied piece came from.

## Chris's answers (November 13, after trying the page on his laptop)

- **Walking: she should be 30 to 50% larger.** "She could be maybe even like 50% larger." Done the same day: the walking
  view is drawn in by 40%, with a menu on the page for 30, 40 and 50%. She keeps her true size against the tents; the screen
  shows less of the painting.
- **Fighting: the size is good,** "especially if it's gonna hold a party or multiple foes."
- **The closer fight shots are sharp enough.**
- **The bunting and moths are good.** "Gives atmosphere."
- **Speed on his laptop:** 144 pictures a second walking (Trim: 106k triangles, 94 draws, 2.3 ms moving her), the same while
  running; in the fight, Light: 71k triangles, 56 draws, 1.3 ms moving her. 144 is very likely his screen's own rate, so the
  true headroom is more than that. This answers the open question in `claude/HOW-TO-3d-light-levels.md` for one witch.
- **He asked how to make fair folk quickly.** Claude's answer and a test are in
  `claude/moon-faire-fair-folk-npcs-plan.md`.

**What follows for the other walking paintings (Claude's plan, not yet confirmed by Chris):** draw their guides from a
closer camera, about 10.7 m of view across the painting's height in place of 15 m, so a witch is this larger size at the
painting's own sharpness. Each walking painting then covers about 21 m by 10.7 m. W1 stays as painted and is shown drawn in.

## What Chris sent

Both pilot paintings, the same afternoon: the moor clearing (F1, 1448 x 1086) and the fair square (W1, 1774 x 887). They are
in the repo as they came, `game/art/pilot/`.

## What was found

- **Both paintings fit their grey-box guides without refitting.** With each guide's outlines laid over its painting, the
  tents, lantern posts, well and floor cloth of W1 land within a few pixels, and F1 has Auros exactly placed and the horizon
  at 61%. The cameras in `game/pilot/scenes-pilot.js` are used as they are. So the method works: a grey-box guide from the
  game's camera, plus a finish guide and a realism guide, gives a painting the game can use straight away.
- **ChatGPT returned 1774 and 1448 pixels wide,** not the 2048 the prompts asked for. Chris finds the closer shots sharp
  enough at that size.
- **A fault in my W1 layout:** the far ends of both lanes run behind a stall roof (left) and a tent top (right), so a witch
  walking there is hidden. The scene now changes at the mouth of each lane, where she can still be seen. **For the other
  guides: nothing tall on the near side of a path.**
- **The W1 painting has moon-phase motifs** on one stall's awning, and a crescent on the wagon. Moon phases are out of the
  witches' magic; as fairground decoration it is Chris's call. Not changed. **Still open.**

## What the page does

**Walk the fair square**
- The Jester walks and runs on the painting with the keys or by clicking the ground. The screen follows her and shows about
  44% of the painting's width (62% before Chris asked for her larger).
- She goes behind the well, the lantern posts and the stalls. The cut-outs are the grey-box shapes, drawn into depth only.
- Her shadow falls on the painted ground, up and to the left like the painted shadows, with a soft patch at her feet.
- The four fixed lights sit on the four nearest painted lamps and flicker.
- The live layer: lamp glow, the floor cloth's footlights, moths round the lamps, fireflies at the edges, and strings of
  bunting between posts (the painting was asked to leave bunting out).
- Spots: rest at the well; take a bow on the floor cloth. Buttons for wave, bow, laugh, talk, twirl, dance, jump.
- The two lanes stop with a line of words where the next paintings will begin.

**Fight on the moor**
- The approved engine, unchanged, with the Jester alone against one wisp or three. Nothing is timed.
- The turn bar; her four buttons (Gilded Rebuke, Attack taunt, Heal taunt, Sealed Fate) with their help lines; HP and MP.
- Each wisp has a bar: Life in red, Fate growing in from the other end, "sealed" when they meet. Fate also shows as the
  model's own dust round the wisp.
- Her game moves from pass 21 play whole (`g_rebuke`, `taunt_attack`, `taunt_heal`, `g_seal`, `g_curtain`), aimed at her
  target, with the place darkening and the picture shaking as she casts. A cast that leaves no foe standing becomes
  Curtain Call by itself.
- Envoi's wisp uses its own moves: it flings a spark at her, flinches when struck, and goes out.
- The wide shot shows the whole width of the painting. Closer shots are crops; a switch turns them off.
- "It plays itself" lets the engine's attentive style play, with one added rule: alone, she ends each sealed foe herself.

**Switches:** the live layer, her size when walking, closer shots, the painting (off shows her against her theatre's plain
plum at the same size), her detail (as planned, or any of Lightest, Light, Trim, Full), full screen. A line under the picture
gives pictures a second, triangles, draws and the time spent moving her.

## How it is built (for the next session)

- `game/src/stage.js`: the painting is one flat picture drawn first; the cast is one scene with the witches' rig (copied from
  her `stage.js`, numbers unchanged) drawn over it through a hidden camera fitted to the painting. The camera never moves:
  a pan or a closer shot is a window of the painting's frame, and the 3D is drawn through the same window with
  `setViewOffset`.
- **Her weight follows the plan:** Trim for walking, Light in fights, made by `opts.lod` from the light-levels doc.
- **Lights never change while playing:** the rig, plus four fixed point lights. Her own spell light is taken out of her
  effects and one of the four follows it.
- The engine's party is cut down to the Jester after `newBattle`; no rule or number is changed.
- The fight's middle is 2 m behind where the guide drew it, so everyone's feet clear the bottom of a 16:9 screen.
- Her size when walking is `close` in `game/src/scenes.js` (1.4).

## Checked

- Walking: every blocker, both exits, click-to-walk round the well, both spots. At the largest size the screen's window
  stays inside the painting at all four edges. No errors.
- One wisp played by the careless, attentive and expert styles: won each time in 2 turns, on Curtain Call.
- Three wisps played by the attentive style with the added rule: won in 4 turns. The engine's brains on their own lose this
  one, because they leave small foes for her three friends, who are not here yet.
- **The brief's check:** her in the painting beside her in her theatre, same size and window. Her pixels average 76.5 in the
  painting and 75.2 in the theatre, out of 255; the difference is the wisp's glow. She is lit from the same side as both
  paintings.
- The page on its own clock at laptop and phone size. No errors.

## Not checked, and not built

- How anything moves or feels in the test browser, which draws one to three pictures a second. Chris's laptop has now given
  the real speed for one witch (above). Four witches with foes has not been measured in a painted scene.
- Not built yet: the Flipbook look and glow switches; Envoi's live ground for fights (moving grass); haze on far
  characters; the other three witches and the captain; talking; saving; sound; cut-outs traced to the painting itself.

## Next

- The two-person fair-folk test, if Chris wants it (`claude/moon-faire-fair-folk-npcs-plan.md`).
- Step 5: the remaining twelve prompts, with the lane lesson and the closer walking camera built in; every scene traced; the
  other witches and the captain as they are finished; the foes, town fights, levels, the gate, the boss, talking, saving.
