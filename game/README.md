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

### Chris's answers (November 13)

- Walking: she should be 30 to 50% larger. Done: the walking view is drawn in by 40% (`close` in `src/scenes.js`), with a
  menu on the page for 30, 40 and 50%. She keeps her true size against the tents; the screen shows less of the painting.
- Fighting: the size is good. The closer shots are sharp enough. The bunting and moths stay.
- His laptop: 144 pictures a second walking (Trim, 106k triangles, 94 draws, 2.3 ms moving her) and in the fight (Light,
  71k triangles, 56 draws, 1.3 ms).
- For the other walking paintings (Claude's plan, to confirm): guides from a closer camera, about 10.7 m of view across the
  painting's height in place of 15 m, so she is this size at the painting's own sharpness.
- Fair folk: Claude's answer and a test are in the project doc `claude/moon-faire-fair-folk-npcs-plan.md`.

## People from a template (November 13)

**Chris's ruling (November 13):** the only NPCs are people the party talks to, and by that measure none of the first twelve people are good enough for the game. He then called the hand-made lamp-seller "pretty fantastic" and asked for Opus 5.5 at high or extra-high effort and no other model. Whether the second test's people pass is his to say. The game does not load this folder yet.

A test Chris asked for: with the Jester's model as the template, how little does it cost to have a Claude model make a new background person through the API?

- Page: https://claude.ai/artifact/S2zzMgXm1qwoGEF2Nk491T (file: `people/out/moon-faire-people.html`). It shows the people in 3D, the costs, and a box that makes a new person straight from the browser with an API key (that box works in the file copy only).
- `models/jester/jester_kit.js` is `jester_lod.js` with one added step (`models/tools/patch_person_kit.py`): when `opts.lod.person` is given, her costume cloth is dropped and new parts can be added before the model is bound. Without it every line behaves as before. The game still loads `jester_lod.js`.
- `people/kit/person-kit.js` (`window.MF_PERSON`) builds a person from a small object: `height`, `build`, `head`, `skin`, `colors` for the body she already has, `parts` (materials), `face(F)` (paint over `face_plain.webp`, her face with the make-up painted out by `make_plain_face.py`) and `make(K)` (shells, panels, tubes, balls, ready-made hair and beards, bound to her bones). Built at the Lightest weight without the merged materials: about 12 thousand triangles and 15 draws.
- `people/kit/PERSON-KIT.md` is the whole instruction a model is given (about 4,900 tokens, cached). `people/lampseller.js` is the worked example in it, made by hand.
- `people/kit/make_person.py` asks a model for a person, draws it in headless Chrome (`shoot.py`, on `people/out/person-stage.html` from `build_viewer.py`), shows the model one picture, lets it fix the file up to twice, and prices every reply from its `usage`. The key is read from `~/.mf/key` (or `MF_KEY_FILE`) and is never written anywhere in the repo.
- `people/runs/<person>__<model>/` holds each run: every version of the file, `final.jpg` and `log.json` (tokens, seconds, cost per round). `people/kit/reshoot.py` redraws them all after a kit change without calling the API. `people/kit/build_maker.py` builds the page.

Measured on four one-line test descriptions (`people/kit/test-people.json`, stand-ins, not lore), list prices of November 13, 2026:

| Model | Each person | First try alone | Time |
|---|---|---|---|
| Haiku 5.5 | 0.52 cents | 0.24 cents | 34 s |
| Sonnet 5.5 | 11 cents | 5.4 cents | 58 s |
| Opus 5.5 | 18 cents | 7.5 cents | 55 s |

A second test followed Chris's ruling and his word to use Opus 5.5 only, at high or extra-high effort. The instruction was rewritten for a person seen up close (more shapes, smoother clothes, telling details) and the model could fix the file three times (`--effort high|xhigh --rounds 4`; runs are in `people/runs/<person>__claude-opus-5-5@<effort>/`).

| Opus 5.5 | Each person | Time |
|---|---|---|
| high effort | 38 cents | 123 s |
| extra-high effort | $1.33 | 423 s |

A third test gave the same four lines to Fable 5.2 through the key, at high effort (`people/runs/<person>__claude-fable-5-2@high/`): $1.08 each, about 3 minutes, about level with Opus at high effort.

High effort is the setting to use; extra-high adds little for three to five times the price. The fortune-teller at high effort stands beside the hand-made lamp-seller. The men do not, because of the template body and face. All three tests cost $12.34. Limits found: every person has the Jester's body and face shape (men and stout people only pass under a coat or apron, at a distance); shapes are stiff, so nothing sways; the painted beard only reaches round the mouth. Not measured: speed on Chris's laptop with several people in a scene.

## Skins: one person model, several painted people (November 13) — Chris: all the painted ones can be NPCs

Chris's idea: paint a simple person model with images, so one model carries two or three different skins.

- Prompts page: https://claude.ai/artifact/8BgZ19cqFPZvpJGBeqEQ2v (file: `people/out/moon-faire-skin-prompts.html`). Starter pack: `people/out/Moon_Faire_Skin_Starters.zip`. All prompts as text: `people/skins/prompts.md`.
- Five models: the lamp-seller (three skins) and the four Fable 5.2 people (two each). Eleven skins, two pictures each.
- `people/kit/guides.py` draws a model's painting guide: the standing pose in plain greys, flat from the front (left half) and from behind (right half), 1536 x 1024, each half 1.5 m wide (x -0.75 to 0.75) and 2 m tall (y -0.1 to 1.9), 512 pixels to the metre. A painting made over it can be laid back onto the model by position.
- The face is a second picture painted over `people/skins/face-guide.png` (her face with the make-up painted out), so the eyes, nose and mouth stay where the head expects them.
- `people/kit/make_skins.py` has Opus 5.5 (high effort, through the key) look at the guide and the model's file and write the skins (`people/skins/<id>/skins.json`): about 5 cents a model. They are stand-ins, not lore. `people/kit/build_skin_prompts.py` builds the page, the text and the pack.
- Chris made all 22 pictures in ChatGPT (11 skins). His originals are not in the repo (about 55 MB); `people/skins/<model>/<letter>-body.webp` and `-face.webp` are the prepared copies the game would load, 1.4 MB in all.
- `people/kit/prep_skin.py` prepares a pair: it finds the painted figures, measures how they sit against the guide (within 1 to 2 percent, as in the starter-world pilot; `<letter>.json`), spreads the figure's edge colours over the grey background, paints out the small unused face on the body sheet, and resizes the face.
- `people/kit/person-kit.js` lays a skin on a person: `MF_PERSON.prepare(person, skin)`. Every part but the face and hands reads the body sheet by where its points stand in the standing pose (front half on what faces forward, back half on what faces back). The face picture replaces the face painting. Hands and neck take the skin colour.
- `people/kit/paint_person.py` has Fable 5.2 (high effort, through the key) look at the painted person and write a small file that finishes the fit (`people/kit/SKIN-KIT.md` is its instruction): skin colour, which parts are one flat colour, how shiny, small nudges. Results in `people/painted/<model>-<letter>__<hand|fable|opus>/` (`skin.js`, `auto.jpg` the automatic fit alone, `final.jpg`, `log.json`).
- Done: the lamp-seller model (3 skins), the four Fable 5.2 models (2 each) and the same skins on the four Opus 5.5 models (2 each): 19 painted people, about 11 cents and 16 seconds of fitting each ($2.01).
- Found: the painted skin does most of the work, and the same pictures sit on the Opus models nearly as well as on the Fable models they were painted for. Still showing: hair as a flat-coloured shape round the face, angular shoulders, the Jester's body under men's clothes. ChatGPT did not have the style picture, so the skins are more lifelike than the witches' painted look.
- Everything spent on Chris's key by the end of this step: about $15.23.

## Fair folk wired for the game: talking and emotes (November 13)

Chris passed all 19 painted people as NPCs, asked for the hats to be pulled down, and asked for them to be wired for talking and emotes so they drop into the game. The moves and each person's choice of them were written by Claude Fable 5.2 (high effort) through his API key.

- Test page: https://claude.ai/artifact/Gqb3KJtYJ76eTn5k1bWkAM (file: `people/out/moon-faire-npcs.html`).
- **Hats.** The fitter's file gained `move: { part: [left, up, forward] }`: a part of the model is moved with its paint (`moved()` in `person-kit.js`). Fable pulled every hat, cap and headcloth down 1 to 4.5 cm (`people/painted/*/skin.js`, `before.jpg` and `final.jpg`).
- **Faces that blink and speak.** `person-kit.js` paints each face's own eyelids, open mouth and smile from its face picture (`faceParts`), in the places the template's face already swaps in. They are simple painted shapes, right for walking distance, plain in a close-up.
- **New moves on the template.** `jester_kit.js` now hands out `defAction`, `FP` and `hasAction`, so moves are added from outside in her own pose language (hand targets, head and spine angles, fingers, eyes, mouth).
- **The library.** `people/npc/emotes.js` (`window.MF_EMOTES`): three talking loops (`talk_calm`, `talk_lively`, `talk_gruff`), fourteen emotes (`nod`, `shake_head`, `wave`, `greet_bow`, `shrug`, `laugh`, `point`, `think`, `surprised`, `sad`, `cross`, `beckon`, `refuse`, `thanks`) and three idle fidgets. Written by `people/kit/make_emotes.py` from `people/kit/EMOTE-KIT.md`, with film strips shown back to the model (`people/npc/strips/`). $2.82.
- **Each person's own way.** `people/npc/wiring.json` (by `make_wiring.py`): which talking loops, their hello, their fidgets, their pace, the three emotes most like them, and an emote for each of yes, no, happy, unsure, upset, thanks, bye.
- **The pack the game loads** (made by `people/kit/build_npcs.py`): `people/npc/npcs.js` (`window.MF_NPCS`: shapes, skin fit, wiring), `npc_tex.js` (`window.MF_NPC_TEX`: the pictures, 1.9 MB) and `emotes.js`, with `people/npc/npc.js` (`window.MF_NPC`) as the one thing game code talks to.

To put a person in a scene (after `three.r128.min.js`, `meshopt_simplifier.js`, `jester_tex.js`, `jester_kit.js`, `lod.js`, `window.MF_FACE_PLAIN`, `person-kit.js`, then `emotes.js`, `npcs.js`, `npc_tex.js`, `npc.js`):

```js
const npc = await MF_NPC.make('old-lamp-seller');      // ids: MF_NPC.list()
stage.cast.add(npc.root, npc.fx); npc.root.position.set(x, 0, z);
npc.update(dt);                                        // every frame: blinks, fidgets, runs whatever was asked
npc.face(playerX, playerZ);                            // turn to face the party
npc.greet();                                           // their own hello
npc.talk(true);  /* words on screen */  npc.talk(false);
npc.emote('laugh');  npc.emote(npc.wiring.moods.thanks);
npc.headTop(vec3);                                     // a point above the head for a speech mark
```

Ids are the stand-in names (`old-lamp-seller`, `pie-seller`, `ballad-singer`, `fortune-teller`, `old-lamplighter`, `old-night-watchman`, `chestnut-roaster`, `fair-baker`, `ribbon-dyer`, `farm-lad`, `gate-keeper`); the last eight also exist with `-opus` on the end (the same skin on the Opus 5.5 shapes). Not done: nothing is placed in a game scene yet, the people cannot walk a path, and speed with several of them in a scene has not been measured on Chris's laptop. Everything spent on Chris's key by the end of this step: about $20 (about $21.80 after the review below).

## The fair folk reviewed in one Fable 5.2 session (November 13)

Chris asked for all the painted, wired people to be handed to a single Fable 5.2 session (high effort, through the key) to review scale and look and make its own fixes.

- `people/kit/review_npcs.py` with `people/kit/REVIEW-KIT.md`: one conversation is shown a line-up of everyone beside the Jester (1.65 m, for scale) and each person's sheet, card and skin file. It writes a review, a fixes file and notes for the maker, sees the result, and may fix again. Three looks, $2.22.
- What it could change: each person's `height`, `build` and `head` (`people/painted/<...>/person-scale.json`, applied over the person file by `npc.js` and the pages) and the skin file, which gained `size: { part: [w, h, d] }` (a part resized about its own middle, with its paint).
- It changed 18 of the 19: heights now run from 1.50 m (old lamp-seller) to 1.73 m (fortune-teller) instead of three fixed heights; the pie seller is sturdier, the ballad singer slimmer, the ribbon dyer smaller; the Opus straw hat is narrowed; hair made matt; a ring beard hidden; skin of hands and neck matched on the dyer. The old files are kept as `skin.before-review.js` and `before-review.jpg`.
- Its words are in `people/npc/review.md`; the line-ups before and after are in `people/npc/review/` and `people/out/fair-folk-review-1.jpg` and `-2.jpg`.
- One fault it found was in the kit, not the people: a flat-coloured part of a painted skin (grey hair above all) came out pale lilac whatever colour it was given, from the cloth sheen on flat materials under the rig's rim lights. Fixed in `person-kit.js` (flat skin parts have almost no sheen). `people/kit/reshoot_painted.py` redraws everyone without calling the API.
- What it says needs a repaint or a rebuild (not done): the old lamplighter reads as an old woman on the fortune-teller's shapes; hair is flat plates beside the face; the ring beard and the box beard; the three lamp-seller-model women share one outline; the roaster's hat, the lamp-seller's kerchief and the straw hats want repainting.
- Its pick where a person exists twice: Fable shapes for the fortune-teller, lamplighter, farm lad and gate keeper; Opus shapes for the night-watchman, chestnut roaster, fair baker and ribbon dyer. Chris has not chosen yet.

## Fair folk: two lighter weights, and the Flipbook look switch (November 13) — an experiment, waiting for Chris to judge

Chris asked for an attempt at lighter versions of the NPC models that the painted surfaces can go onto (half the triangles, and a quarter), made through the API key, and for a Flipbook look switch.

- **Nothing has to be baked.** The painted skin is read by where each point of the model stands, so it lies on a thinned model as it did on the whole one. A lighter weight is the same person file with parts left off and a share of each part's triangles kept: `person.weight = { drop, keep, rest, scale }` in `person-kit.js` (meshoptimizer again, after the Lightest level's own thinning).
- `people/kit/make_weights.py` with `people/kit/WEIGHT-KIT.md`: for each of the nine sets of shapes, Fable 5.2 (high effort, through the key) is shown the person at full, half and a quarter (first with every part thinned equally) and decides what to leave off and how to share the triangles; the tool scales its shares so each total lands on its budget. $1.94 for all nine. Results: `people/weights/<shapes>.json` and `.jpg` (and `.equal.jpg`, the equal thinning it started from).
- Full is 9.8 to 11.3 thousand triangles, half 4.9 to 5.6 thousand, a quarter 2.5 to 2.9 thousand. It kept the head (60 to 100% at half, 43 to 65% at a quarter), took most from boots, soles and hands, and left off legs under long skirts and robes, and the trunk under closed coats. `people/out/fair-folk-weights.jpg` shows five people at the three weights.
- In the game: `MF_NPC.make(id, { weight: 'half' })` or `'quarter'`; `npc.triangles` gives the count. `npcs.js` carries the weights per set of shapes (`MF_NPCS.weights`).
- Not done: the number of draws is unchanged (about 15 a person). Putting every painted part into one mesh would cut that, and is the next thing to try if draws matter more than triangles. Speed on Chris's laptop is not measured.
- **The Flipbook look** is now in `src/stage.js` (`stage.flip = { on, rows, snap, painting }`), applied from the other session's patch in the project note `claude/flipbook-look-finer-and-pilot.md` by `tools/patch_stage_flipbook.py`, with `models/jester/palette.js` (the witches' 56 colours, copied from `models/jester-3d/out/palette.js` on branch `claude/jester-3d-model`, commit 31b6351). With `flip.on` false a picture is drawn as before. The pilot page's own switch and sliders (the rest of that patch) are not added and the pilot page is not republished.
- On the test page the switch starts off. On, it uses Chris's setting: 1.2 mm of the person to a pixel and never finer than the screen, full flipbook colours, with 2.2 and 4.75 mm to compare. **Finding:** the witches' shared list of colours does not suit the fair folk (it has almost no green or cream: a green coat goes brown, a cream apron goes pink), so the page starts on each person's own 64 colours, worked out from their body sheet, and offers the witches' list beside it. The look holds one list of 64 for everyone on screen, so how the fair folk and the witches share it in one scene is not solved.

## Fair folk: walking, running, sitting, and Chris's choices (November 13)

- **Chris's choices.** The game uses **a quarter of the triangles** for the fair folk ("it actually looks pretty good for what they are, especially with the flipbook turned on"). `MF_NPC.make(id)` now builds a quarter unless `{ weight: 'half' }` or `'full'` is asked for. The **farm lad and the gate keeper on the Opus 5.5 shapes are dropped** (their waist goes missing at the lighter weights; the Fable 5.2 versions do not have the gap): `DROPPED` in `people/kit/build_npcs.py`. Their files stay in `people/painted/` and `people/weights/`. The pack now holds 17: eleven different people, six of them on two sets of shapes.
- **Walking, running and sitting** are the template's own (the Jester's walk, run and `sit_chair` stance), wired in `people/npc/npc.js`. No API spend:
  - `await npc.walkTo(x, z)`, `await npc.runTo(x, z)`: they stand up if seated, turn to the way they are going, and keep their feet in step with the ground (0.84 and 2.3 m/s, times the person's pace and height). The promise settles `true` on arriving, `false` if something else took over. `npc.stop()`, `npc.moving`.
  - `npc.sit()`, `npc.stand()`, `npc.sitting`, `npc.seated`. The scene gives the seat: `npc.seat()` says where its top must be (`height`, about 0.45 m times the person's height, and `x`, `z` about 0.36 m behind where they stand). The Jester's conjured stool and its puff are hidden on a person.
  - Talking and emotes play while seated or walking.
- Not offered: sitting on the ground. The template's cross-legged sit breaks skirts, coats and aprons.
- The test page has Walk about, Run about and Sit down (on a plain crate).

## The demo mapped, and prompts for the eight places still to paint (November 13) — waiting for Chris to approve the map and paint

Chris asked to use the API key to map all ten areas of the demo (three at the fair, four in the wilds, three at the Dark Beacon) with the fair folk and the lore, then for a page of the backgrounds already in use and prompts for what is left. His answers first: four wild areas; the planned three foes (wisp, Shadow Wraith, great wraith); **Envoi pictures for fights only**, walking places get Moon Faire's own paintings; a map page to approve first.

- Page: https://claude.ai/artifact/Ju2Mo1hEK5jyA3pScXkYXz (file: `out/moon-faire-demo-map.html`). Starter pack for painting: `out/Moon_Faire_Demo_Painting_Starters.zip`. All prompts as text: `world/prompts.md`.
- `world/LORE-BRIEF.md`: what is settled, written from the project's lore notes and the approved plan, with the eleven fair folk. It is what the mapper was given.
- `world/make_map.py` with `world/MAP-KIT.md`: Fable 5.2 (high effort, through the key) wrote `world/world.json`: the evening in nine beats; for each of the ten areas its look, ways out, who stands there with stand-in lines, three to five things that can happen (each with a code such as `W2-c`, so Chris can cut by code), its fights and lamps; a borrowed Envoi battle backdrop for each fight place (`world/envoi-fight-backdrops/`, from Envoi's `art/backdrops` and `art/arena`); what is still needed; and six questions for Chris. $1.70.
- `world/make_scenes.py` with `world/SCENE-KIT.md`: for W2 to W9, Fable 5.2 laid the scene out as grey boxes (`world/scenes/<id>.json`: walkable ground, flats, solids, exits, where people stand, and the words for its painting), was shown the labelled guide and a check of hidden or broken ground, and fixed it. $7.99 for eight. `world/guide2.js` draws the guide for any scene (`<id>_guide.png` for the painter, `<id>_key.jpg` with labels); `pilot/greybox.js` only knew the fair square.
- **The camera for the new places is closer than the fair square's:** 10.7 m across the frame's height instead of 15, the same lens and angle, so a witch is about 40% larger without zooming, as Chris asked for the pilot. Frame 2:1, ground from z -13.5 to +8.
- `world/build_world_page.py` builds the page, the prompts and the pack. Each prompt attaches the place's guide, the fair square painting (`style-fair-square.jpg`, for craft) and the Jester's standing picture, and uses `pilot/prompts/standing-rules.txt` with a line for the hour (dusk, night, deep night).
- In use now: W1 and F1 (Chris's paintings). Borrowed for fights: F2 `battle-warm-road` (poor fit), F3 `11-warm-roads-moor` (fair), F4 `battle-northern-crossroads` (poor), F5 `battle-dead-moonwell` (fair).
- Not done: nothing is walkable yet beyond the pilot's fair square; the scene files are made so the game can load them (ground shapes, exits, people's spots) once painted. Foes: Envoi has the wisp and the wraith with a great-wraith variant (`src/models/wraith.js`, `opts.great`); only the wisp is copied into `models/foes/` so far. The captain and the airship are not built.

## Chris's eight paintings in, his answers written into the map, and story options from Opus 5.5 (November 13, evening) — waiting for Chris to choose a story

Same page, republished: https://claude.ai/artifact/Ju2Mo1hEK5jyA3pScXkYXz (file: `out/moon-faire-demo-map.html`).

- **All nine walking places are painted.** Chris painted W2 to W9 from the guides and prompts in about forty minutes; they are in `art/world/W2.png` to `W9.png` (1774 x 887, as W1). `world/fit_check.py` draws each guide's outlines over its painting (`world/scenes/<id>_fit.jpg`): every one kept its layout closely, to within a few pixels in most places and within about 20 in the loosest (the pool at W6 is painted larger; the gate at W3 is drawn differently). Each scene's ground will want a small tune-up to its painting when the places are made walkable. The paintings were made for the lamp story: empty lamp brackets on the hull at W3, one lit lantern and one dead post at W4, twelve lit lamps on the deck at W8, empty brackets and a dead lamp post at W9.
- **Chris's answers** (`world/settle_nov13.py`, run once): yes to three rest spots (the party's wagon in W1, the camp at W6, the airship at W8); yes to wisps drawn to the sparring ring; and **where a person's 3D model looks different from their note, the note changes**. Three notes changed, in `people/skins/*/skins.json`, `people/npc/npcs.js` and `world/LORE-BRIEF.md`: the lamp-seller is no longer called old, the old lamplighter is an elderly woman in a red dress, the gate keeper is a man in a flat hat and waistcoat. Their ids in code are unchanged (`old-lamp-seller` and so on): a skin can now carry an `id` that outranks its name, in `build_npcs.py` and the page builder. The fair folk page is republished with the new notes: https://claude.ai/artifact/Gqb3KJtYJ76eTn5k1bWkAM.
- **"Does it have to be lamps?"** Chris asked for the lore questions to go to Opus 5.5 through the key. `world/make_story.py` with `world/STORY-KIT.md` gave it the lore brief, the drafted map and the nine paintings, and asked for options, not decisions. `world/story-options.json`: A keep the lamps and give them a reason; B the beacon's broken crystal heart; C the cold hearth that calls every flame (its pick); D the Fox sews the night shut. None needs a painting redone. $0.66 at high effort. A first try at extra-high effort with a 40,000-token limit used the whole limit thinking and wrote nothing (about $0.85 lost; the script now defaults to high and a larger limit).
- **The two kinds of fight picture** (the mapper's fifth question) are shown side by side on the page: Envoi's numbered pictures and Chris's own F1 are seen level; the `battle-` ones are seen from above. Suggested: keep every fight level; Envoi has level pictures of the same places for the crag (`13-northern-crossroads`) and the lamp room (`14-dead-moonwell`). Not changed in `world.json` until Chris says.
- Not done: the story is not chosen, so nothing in the map's lines or things-that-can-happen was rewritten for it. Nothing is walkable yet beyond the pilot's fair square. Foes, captain and airship as before.

## Next

Step 5, and the two-person fair-folk test if Chris wants it: the remaining twelve prompts (with the lane lesson built in), every scene traced, the
other witches and the captain as their models are finished, the foes, town fights, levels, the gate, the boss, talking,
saving.
