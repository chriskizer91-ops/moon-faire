# The Moon Faire starter world

A small, complete Moon Faire game: three zones, the four witches and the airship captain, levels 1 to 5, painted scenes
with the 3D models on top. The brief is the project doc `claude/moon-faire-starter-world-brief.md`.

Every name, place and story beat is a placeholder until Chris says otherwise.

## Step 1: the whole game on one page (November 13, 2026) — approved by Chris, with all four witches from the start

- **The page:** `plan/starter-world-plan.html`, published at https://claude.ai/artifact/97eaGFUQv1WqPMUJEdDUPU.
  It works offline as one file (only the two web fonts are fetched; it falls back without them).
- **Chris's answer (November 13):** yes to every pick except the party: "all four of them from the start. I like it being a
  party of four and the story goes back from before the game." The page, the data and the numbers below are updated to that.
- **What it holds:**
  - Zone 1, the Moon Faire (W1 fair square, W2 stall row and ring, W3 mooring field): party level 1 to 2, three set fights.
  - Zone 2, the wilds (W4 Last Lantern, W5 standing stones, W6 still pool, W7 hidden hollow): party level 2 to 4.
  - Zone 3, the Dark Beacon (W8 landing ledge, W9 beacon stair, F5 lamp room): party level 4 to 5, the boss at level 5.
  - The gate: the airship's twelve lamps, won back one fight at a time in the wilds (3, 4 and 5 per wild scene).
  - All four witches in the party from the first fight. One witch walks the scene; the others appear when a fight starts.
  - 14 paintings: 9 walking scenes and 5 fight backdrops. Pilots: W1 and F1.
  - Chris's ten decisions, as a table.
- **The plan as data:** `plan/sim/plan.js` (scenes, fight tables, foe levels, XP).

### What was measured, and how to run it again

`plan/sim/blob-battle-engine.js` is a copy of the approved combat engine, the project doc `lore/sim/blob-battle-engine.js`,
unchanged. New line-ups are passed in through `opts.rules`; no rule or number of the engine is touched.

```
cd game/plan/sim
node check.js                      # the copy gives the same wins as lore/combat-balance.md
node table.js                      # every planned fight at the level the party meets it, 1,000 fights x 3 play styles
node finds.js                      # the three end-boss line-ups, with and without the small finds
node route.js xp                   # 2,000 whole playthroughs per play style: level at each milestone, fights, turns
node pace.js                       # which fight each level arrives on
node survey.js K2w,5w 0,2,4 500    # any line-up (w wisp, K Shadow Wraith, B great wraith; leading t = no Jester) at any level gaps
```

Results on November 13 (careless / attentive / expert):

- Every set fight and every walking fight before the boss: 100% / 100% / 100%.
- The boss (great wraith, two Shadow Wraiths, two wisps) at level 5: 6% / 81% / 100%. A level short: 0% / 3% / 92%.
- Levels arrive on fights 3, 8, 14 and 22 of about 24. The party is level 4 when the twelfth lamp is back, in every run.
- About 245 witch turns and 85 foe turns in all. Fight minutes are an estimate (4 to 9 seconds a witch turn).

Not measured, because it cannot be yet: real speed on Chris's laptop (the test browser runs at under two frames a second),
how long a fight takes with the spell animations, and how the walking feels.

## Step 2: the pilot paintings (November 13, 2026) — prompts ready, waiting for Chris's paintings

- **The page:** `pilot/pilot-prompts.html`, published at https://claude.ai/artifact/MZkGxxTinuBr6ZBVS3hSWv. Its text is
  `pilot/pilot-prompts.md`. The four images to attach are in `pilot/references/` and `pilot/out/Moon_Faire_Pilot_Starters.zip`.
- **Two paintings:** W1 the fair square (walking, 2:1) and F1 the moor clearing (fight backdrop, 4:3). Chris saves the
  keepers as `W1.png` and `F1.png` and sends them back.
- **The scenes as data:** `pilot/scenes-pilot.js`: each painting's camera, its grey-box layout in meters, where Auros sits,
  and where everyone stands in a fight. Names are placeholders kept there.
- **The cameras are Envoi's,** because they already work with paintings:
  - Walking: a 12 degree lens pitched 24 degrees down (Envoi's `src/stage/night-square.js`). For W1 the frame is 2048 x 1024,
    15 m of view across its height at the target, so about 70 painting pixels to a meter at the middle of the square. The
    camera is fixed for the whole painting; the screen will show a 16:9 crop that follows the witch (`setViewOffset`).
    The top 15% of the painting is a backdrop band (skyline and sky); the ground runs from z = -18 m to z = +12.4 m.
  - Fights: a 38 degree lens, 2 m up, 18 m back, pitched 4.2 degrees up (Envoi's `src/fx/arena.js`, `makeArenaField.view`).
    The horizon is 61% down and Auros is at 31% across, 17% down.
- **The guides are lit with the witches' rig** (numbers copied from `models/jester-3d/viewer/stage.js`), so the boxes show
  the house light: lit sides toward the viewer and the right, shadows falling up and to the left.
- **The standing rules** for every painting are `pilot/prompts/standing-rules.txt`; each prompt carries them whole.

```
cd game/pilot
python3 shoot_guides.py            # draws the grey-box guides and labelled layouts into out/ (Playwright and Chrome)
python3 build_prompts_page.py      # builds pilot-prompts.html and pilot-prompts.md from prompts/ and references/
```

Copy the four files from `out/` into `references/` after re-drawing (the keys as JPEG) before rebuilding the page.

Checked: both guides draw with no errors; the page at phone and laptop size. Not checked, because it cannot be yet: whether
ChatGPT keeps to the guides closely enough to fit, and what size it returns (it gave 1448 and 1536 wide for Envoi).

## Steps 3 and 4: the pilot paintings in, the Jester walking and fighting (November 13, 2026) — waiting for Chris to judge the look

Chris sent both paintings back the same afternoon, so steps 3 and 4 were done as one.

- **The page:** `out/moon-faire-pilot.html`, one offline file (3.8 MB), published at
  https://claude.ai/artifact/PkUTHyHVp9ZQDwvNgtUFqh. Build it with `python3 build_pilot.py`.
- **The paintings:** `art/pilot/W1.png` (1774 x 887) and `art/pilot/F1.png` (1448 x 1086), as they came.
- **They fit the guides without refitting.** `stills/W1-guide-over-painting.jpg` and `F1-guide-over-painting.jpg` lay each
  guide's outlines over its painting: tents, posts, well and floor cloth within a few pixels; Auros exactly placed; the
  horizon at 61%. The game uses the cameras in `pilot/scenes-pilot.js` as they are.

### What is in

| File | What it does |
|---|---|
| `src/stage.js` | Draws the painting as one flat picture, then the cast over it through the hidden fitted camera. A pan or a closer shot is a window of the painting's frame (`setViewOffset`); the camera never moves. The witches' rig and studio reflections are copied from her own `stage.js`, numbers unchanged. Four fixed lights for nearby things. Her shadow on an unseen plane, and a soft patch at her feet. |
| `src/scenes.js` | The two scenes as data: painting, walk area, blockers, exits, spots, fight places. Words and names are here. |
| `src/field.js` | Walking: keys or click-to-walk, walk and run with her own stride numbers, sliding round blockers, exits, spots, the window that follows her, lamp lights on the four nearest painted lamps, and the live layer (lamp glow, footlights, moths, fireflies, bunting). The grey-box shapes are drawn into depth only as the things she walks behind. |
| `src/fight.js` | A fight on the approved engine, unchanged: turn bar, her four buttons, Life and Fate bars, her game moves (`g_rebuke`, `taunt_attack`, `taunt_heal`, `g_seal`, `g_curtain`) driven through `J.game`, the wisp's own moves, closer shots as crops, the place darkening and shaking with her spells. |
| `src/main.js`, `src/pilot.tpl.html` | The page: two modes, switches, her detail, the speed line. |
| `models/jester/` | Copied from branch `claude/jester-3d-model` (pass 21, commit `31b6351`): `jester.js` is her `src/` joined as her `build.sh` does; `jester_tex.js` as it is. `jester_lod.js` is `jester.js` with the fifteen light-level switches from the project doc `claude/jester-3d-light-levels-and-fight-test.md` (`models/tools/patch_jester_lod.py`); `lod.js` is that doc's file; `meshopt_simplifier.js` is meshoptimizer 1.3.0. Her branch is not touched. |
| `models/foes/wisp.js` | Envoi's wisp, unchanged (`src/models/wisp.js`, branch `claude/send-note-gigdew`). |
| `sim/blob-battle-engine.js` | The approved engine, unchanged; the page wraps it so its names stay its own. |

- **Her weight follows Chris's plan:** Trim for walking, Light in fights. A menu on the page tries any of the four.
- **One spell light for everyone:** her own spell light is taken out of her effects and one of the four fixed lights follows it,
  so no light is ever added or removed while playing.
- **The pilot's party is the Jester alone,** because she is the only finished model. The engine's party is cut down to her
  after `newBattle`; no rule or number changes.

### Checked (in the test browser, `checks/*.py`)

- Walking: every blocker, both exits by key, click-to-walk round the well, both spots, a bow on the cloth. No errors.
- She goes behind the well and the lantern posts (`stills/walk-behind-things.jpg`).
- One wisp, played by the engine's careless, attentive and expert styles: won each time, in 2 turns, on Curtain Call.
- Three wisps, played by the attentive style with one added rule (alone, she ends each sealed foe herself): won in 4 turns.
  The engine's brains on their own lose this one, because they leave small foes for her three friends, who are not here yet.
- Her in the painting against her in her plain theatre, same window (`stills/check-painting-and-theatre.jpg`): her pixels
  average 76.5 in the painting and 75.2 in the theatre, out of 255. The difference is the wisp's glow.
- The page on its own clock, both modes, at laptop and phone size. No errors.

### Not checked, and not built

- **Real speed.** The test browser has no graphics chip and draws one to three pictures a second. The line under the
  picture gives the count on whatever machine opens it.
- How anything moves or feels: timing is Chris's to judge.
- Not built yet: the Flipbook look and glow switches; Envoi's live ground for fights (moving grass); haze on far
  characters; the other three witches and the captain; talking; saving; sound; cut-outs traced to the painting (they are
  the grey-box shapes, a few pixels off in places).

### Found on the way

- **ChatGPT returned 1774 and 1448 pixels wide,** not the 2048 asked for. Wide shots are fine; closer shots in a fight are
  soft, because a closer shot is a crop.
- **My W1 layout hides the far ends of both lanes** behind a stall roof (left) and a tent top (right). The painting is
  right; the layout is at fault. The scene now changes at the mouth of each lane. In later guides, nothing tall stands on
  the near side of a path.
- **The painting has moon-phase motifs** on one stall's awning and a crescent on the wagon. Moon phases are out of the
  witches' magic; as fairground decoration it is Chris's call.

```
cd game
python3 build_pilot.py              # builds out/moon-faire-pilot.html
python3 checks/walk.py              # from game/checks: walks the square and writes stills
python3 checks/fight.py             # a fight by hand
python3 checks/auto.py              # the engine's styles through the real page (slow: about 8 minutes)
```

## Next

Chris judges the look. Then step 5: the remaining twelve prompts (with the lane lesson built in), every scene traced, the
other witches and the captain as their models are finished, the foes, town fights, levels, the gate, the boss, talking,
saving.
