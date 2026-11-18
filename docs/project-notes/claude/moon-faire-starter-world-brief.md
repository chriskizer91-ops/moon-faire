# Moon Faire: the starter world (brief for the conversation that builds it)

Written November 13, 2026, by the lore and combat session, for a Fable conversation Chris starts to build it.
This replaces the place-building parts of `claude/moon-faire-demo-world-plan.md`: places are now **paintings with 3D on
top**, not 3D places. That plan's light rules, foes, character interface and performance notes still hold where this brief
does not say otherwise.

## What Chris asked (his words)

- "I don't want to call it a demo. I want it to be a game in mini form."
- "let's let them level from level 1 to level five in this space. At least three zones. Something gates them from the third
  zone so that they have to run around the wilds and level up. Maybe battles happen in town and they level up."
- "We'll have to make image prompts to get" the paintings.
- "I like the painted background ... for fights since the fights have more things going on. We have a painted background
  for the fight that the characters and all of the animations of their spells get superimposed on, and then they're not
  using spells outside of combat. They're running around a painted background that has 3D modeling on top of it."
- Earlier the same day: "I think this is also only a laptop game."

## What it is

A small, complete game: the four witches, the airship captain, levels 1 to 5, at least three zones, painted scenes with the
3D characters on top, and the approved combat rules (`lore/combat-balance.md`). Working name "the starter world"; Chris
names it.

**A suggested shape** (everything here is for Chris to change):

| Zone | What it is | Levels | Fights |
|---|---|---|---|
| 1. The Moon Faire | The tent town: the fair square, a row of stalls, the mooring field with the captain and his airship, and a sparring ring | 1 to 2 | Set fights in town: bouts in the sparring ring, or wisps drifting into the fair at night |
| 2. The wilds | Three or four walking scenes in a row beside the fair, a rest spot, a hidden find or two | 1 to 5 | Random fights as they walk; foes up to four levels above the party are always the weak kind (Chris's rule) |
| 3. Beyond the gate | One or two walking scenes and the boss's place | 5 | The big boss at level 5: Chris's rule is that the party must be the boss's level |

**The gate, some ideas:**
- The captain flies them to zone 3 once they have done something in the wilds that takes fighting, such as bringing back
  lantern flames stolen by wisps. It uses the airship, which Chris wants in the game, and the captain.
- A ward that opens at level 4.
- The Jester joining opens it. Chris has said she shows up later in the story and the party is built up; the simulator shows
  the other three win small fights without her.

**Playing it:**
- About 40 to 60 minutes of play.
- Spells only in fights. Outside fights the witches walk, run, talk, wave, bow, laugh and do their other body moves.
- Talking to the captain and to a few fair folk.
- Saving.
- Fights on the approved rules, with levels growing 20% a level for both sides, and Chris's level rules (in
  `combat-balance.md`).
- Use the blob battle engine (`lore/sim/blob-battle-engine.js`) to set how much each fight gives, so the levels arrive at
  the right pace, and say what it measured.

## How it looks

**Walking** (as in Final Fantasy IX):
- A painting of the place, with a hidden three.js camera fitted to it, so the 3D characters stand on the painted ground at
  the right size.
- Traced data for each scene: where they can walk, round obstacles, upright cut-outs of the things they walk behind (a
  well, a tent pole, a stall), lights on the painted lamps, exits, and spots (people, a rest, a find).
- A live 3D layer brings the painting to life: lantern flicker, bunting and flags, grass, smoke, fireflies, moths.
- Paint each scene wider than the screen, so the camera can pan across it and follow them. Panning is a crop of the frame;
  the camera does not move.

**Fighting:**
- A painting of the place far off, with a locked camera fitted to it, live 3D ground in front, and the characters, foes and
  every spell on top.
- Closer shots are crops of the frame. The acting witch can be her full HD model in her close shot, and everyone else the
  lighter version.

**Style:** realistic painterly scenes, to sit with realistic witches; not pixel art. The Flipbook look stays a switch, and
in a scene it pixels the whole picture, painting included.

**Why this is good for speed:** a painting is one flat picture, almost free to draw. Nearly the whole budget goes to the
characters and the spells.

## Light: paint the scenes in the witches' light

All four witches are lit by the same studio rig (`viewer/stage.js` on their branches), and their looks were tuned under it.
Change the paintings to suit the witches, not the witches to suit each painting.

- **The house light for every painting** (written into the image prompts' standing rules):
  - warm light from the viewer's side and from the right, about 45 degrees up (the rig's warm key);
  - the moon behind the scene, to the upper left, edging things in cool lilac (the rig's rim and back light);
  - a cool sky light from low on the left;
  - warm earth underfoot.
- **Each scene may nudge the rig, no more:** key ×0.85 to 1.1, rim ×0.8 to 1.4, the hemisphere's colours. Painted lamps get
  point lights from a fixed set of four made at load; never add or remove lights while playing.
- **Shadows and haze:** characters cast shadows onto an invisible plane laid on the painted ground, with a soft dark patch
  at the feet, and the haze in the painting is matched with fog on the characters at a distance.
- **The check:** the Jester standing in the scene, beside her in her theatre, at the same size. She must look neither
  brighter nor darker, and lit from the same side as the painting.

## The image prompts

The conversation writes them, as the witches' reference prompts were written, and Chris runs them in ChatGPT.

- **Two kinds:** walking scenes (a high three-quarter view, as in FF9: ground, paths and doorways clearly readable) and fight
  backdrops (near eye level, a flat open clearing across the bottom third, landmarks far off).
- **Camera guides.** For each scene, build its layout first as grey boxes in 3D, with a 1.70 m figure for scale, and render
  it from the camera the game will use. Attach that render to the prompt as the layout guide. The painting then comes back
  in a camera the game already knows, and only needs fine fitting.
- **Standing rules** in every prompt:
  - the house light;
  - realistic painterly style matched to the witches' paintings;
  - no people, creatures or lettering;
  - every path, door and walkable piece of ground clear and never hidden under roofs or branches;
  - landscape, at least 2048 pixels wide for walking scenes (wider for scenes that pan), 4:3 at 2048×1536 or larger for fight
    backdrops.
- **Pilot first:** one walking scene (the fair square) and one fight backdrop (the first wild clearing). Fit them and put the
  Jester in them before anything else is painted. Envoi learned this way.
- One prompt makes one image. Each prompt has a code (W1, F1, ...) and a file name. A page shows every prompt with the
  images to attach. Chris sends the keepers back as zips.

## What to reuse

- **The witches:** branches `claude/jester-3d-model`, `claude/ranger-3d-model`, `claude/fox-3d-model`,
  `claude/io-3d-model`, each with its model as one function (`makeJester(opts)` and so on).
  - Copy their built files; never edit their branches.
  - The Jester is done. The others are still being built, and the game takes newer copies as they come.
  - Chris is testing a lighter version of the Jester in another conversation, for when all four are on screen.
- **The captain** (maybe named Noiz): branch `claude/grey-hat-3d-model`, first build, about 345k triangles, 1.78 m. Notes:
  `claude/grey-hat-3d-first-build.md`.
- **Envoi on the Longest Night** (`chriskizer91-ops/envoi-on-the-longest-night`, read-only, branch
  `claude/send-note-gigdew`), Chris's earlier game. It already does all of this with paintings; copy what helps, and say in
  each copied file where it came from:
  - `reference/demos/night-square-shadow-wraith.html`: code-built characters on a painting with a fitted camera, and the
    scene data (walk area, obstacles, upright cut-outs, lights on painted lamps, start).
  - `docs/ff9-style-game-brief.md`: the plan for it as reusable pieces.
  - `src/fx/arena.js` and `src/stage/arena-*.js`: fights on a painting with a locked camera, live ground in front, and
    the painting brought to life.
  - `src/game/field.js`: walking a traced painting (tap to walk, exits, random fights that come evenly).
  - `envoi-final-draft/map-editor/`: Chris's tool for tracing walk areas.
  - `docs/art-requests/11-battle-backgrounds.md` and `04-walking-maps.md`: how the painting prompts were written.
  - `src/models/wisp.js` and `wraith.js` (and `opts.great`): the foes.
- **Combat:** `lore/combat-balance.md` and `lore/sim/blob-battle-engine.js` (every number is in its `RULES`).
- **The Jester's game page** (pass 21, `claude/jester-3d-pass21-game-moves.md`): how her moves are driven in a fight
  (`J.game`, the Fate dust on each foe, aiming at a foe).
- **Lore:** `lore/README.md` first. The fair follows the moon, Auros, which hangs almost still in the sky; it is a melting
  pot; airships are part of the world; moon phases are not part of the magic.

## Foes

- **Suggested tiers:**
  - the wisp (normal);
  - the Shadow Wraith (the difficult one: the balance sheet's "knight" is only numbers);
  - the great wraith (the boss).
  All three are Envoi's own three.js r128 models. Use Envoi's originals, not the newer-three.js copy in the not-HD Jester
  branch.
- **Simple new foes for the wilds (ideas):**
  - a lamp-thief wisp carrying a stolen fair lantern;
  - a ragflag, a torn fair banner come alive;
  - Envoi's Gloamwing, after a look.
  Spirits first: they sit with realistic witches better than furred animals.
- **In a fight:** the party on the left and the foes on the right. A witch facing the camera casts toward her own left, at
  the foes. Nobody and no spell is ever mirrored.

## Rules every part follows

1. three.js r128, global `THREE`, plain scripts, no modules.
2. sRGB output, no tone mapping, as on the witches' stages.
3. Meters, y up; characters face +z with their soles at y = 0.
4. The witches' rig is used as it is. Characters, foes and spell effects share one scene and one rig.
5. A laptop game: Chris's laptop is the speed target (60 frames a second), with a meter on the page. No Claude session can
   measure real speed: the test browser runs at under two frames a second. Say so each time.
6. Full HD in close shots; the lighter version for walking and wide shots. Same skeleton, same moves.
7. The Flipbook look is a switch.
8. Seeded randoms only.
9. Repo `chriskizer91-ops/moon-faire`: a new branch `claude/moon-faire-starter-world`, folder `game/`.
   - Never edit the models' branches; copy their built files.
   - Envoi's repo is read-only.
10. **Every step ends with something Chris can open:**
    - a new published page;
    - one offline HTML file sent in the chat;
    - a push to the branch with a README section;
    - a short note in the project (`claude/starter-world-stepN-....md`).
11. Never republish the Jester's night square page (https://claude.ai/artifact/8733piMPdu8AMzQbmPQTjh) or any other
    session's page.
12. Lore, names and story are Chris's. Keep names in data, not code, and mark what is a suggestion.

## Order of work

1. **One page with the whole game on it, for Chris to approve before anything is painted:**
   - a map of the zones and scenes;
   - what happens in each;
   - the fights and the level each zone is for;
   - the gate;
   - when each witch is in the party;
   - how long it plays.
2. **The pilot:**
   - grey-box layouts and camera guides for the fair square (walking) and the first wild clearing (fight);
   - the standing rules;
   - the pilot prompts on a page Chris can use on his phone.
3. **While Chris paints:**
   - walking on a placeholder picture with the Jester (fitted camera, walk area, cut-outs, the live layer);
   - a fight screen on the blob engine with the Jester and a wisp, on a placeholder backdrop.
4. **The pilot paintings in:**
   - fit them, trace them, light them;
   - the Jester walks the square and fights in the clearing;
   - Chris judges the look.
5. **The rest:**
   - the remaining prompts;
   - every scene traced;
   - all four witches and the captain;
   - the foes;
   - town fights, levels, the gate, the boss, talking, saving.
6. **Before each hand-over:**
   - every scene walked end to end and every exit taken in the test browser;
   - every fight played by the engine's three play styles;
   - no errors;
   - stills at laptop size;
   - plainly said what could not be checked.

## Ask Chris early (a few words each)

1. The fair at dusk or at night?
2. Does Auros show in the paintings, low over the road ahead?
3. When does each witch join: all four from the start, or the Jester later?
4. The gate: the captain's airship, a level, or the Jester?
5. Town fights: a sparring ring, wisps coming into the fair, or both?
6. Foes: the wraith family (wisp, Shadow Wraith, great wraith)?
7. Names for the game, the zones and the places, or placeholders for now?
