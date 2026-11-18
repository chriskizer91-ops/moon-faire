# Handoff from the starter-world session to the open-world map (November 14, 2026)

Chris decided on November 14 (2:16 pm) that walking and exploring happen in a **3D open world**, and that **fights stay painted** (`claude/moon-faire-open-world-map.md`). At 2:27 pm he asked this session to make sure everything it built for the map, the exploring and the game is saved to the repo or the project knowledge. This note is the index: what exists, where it is, and what it is good for now.

## Where it all is

- **Repo:** `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-starter-world`, folder `game/`. Everything this session made is committed and pushed. The only files left out are scratch test pictures (`people/runs/*/v*.jpg`, `checks/*.png`), which the scripts remake.
- **`game/README.md`** tells the whole build in order, one section per step, with what was checked and what was not.
- **Project notes** (`claude/` in the project): one per step. The ones that matter most now are listed at the end.
- **Not saved anywhere, on purpose: Chris's API key.** It lived only in this session's workspace. It is not in the repo, the notes or memory. A session that needs it must be given it by Chris again. The scripts read it from `~/.mf/key`.

## What carries straight over to the open world

### The story and everything that hangs on it
- `world/story-chosen.json`: the chosen story, "The fire that would not end": what it is about, the premise, the four acts (one per witch), what is counted, the ending, and what it leans on that is Chris's to say. Chosen by Claude at Chris's request; he is building on it and has not changed it.
- `world/world.json`: the demo as data. The open world should read this file and not copy it.
  - `story`: the evening in ten beats.
  - `areas`: the ten places (W1 to W9, F5), each with its look, light, ways out, `people` (who, where in words, what they are doing, their lines), `happens` (45 things that can happen, each with a code such as `W4-e`, a kind, and often the witch it belongs to), `fights` and `lamps` (3, 4 and 5 on the moor).
  - `captain`: his lines. `finds`: the five item cards (name, lore, one measurable effect, picture). `needs`: what is still to be made. `questions`: four open questions for Chris. `invented`: every made-up fact, so he can cut any. `settled`: what he has decided. `backdrops`: which fight painting each place's fights use. `pictures`: the title, the lamp icon.
- `world/LORE-BRIEF.md`: the settled lore in one page, as given to the models that wrote the map.
- **Open questions for Chris, still unanswered:** can the player walk on after the end; do the lamps hang on the hull or stand on deck; does the troupe's own show stay off-screen; where is the fair gate.

### The people
- `people/npc/npc.js`: the fair folk's runtime. `await MF_NPC.make(id, { weight })` gives a person with `root`, `update(dt)`, `talk(on)`, `emote(name)`, `greet()`, `face(x, z)`, `walkTo(x, z, { run })`, `stop()`, `sit()`, `stand()`, `headTop(v)`. Quarter weight is the default, as Chris chose (about 2,500 to 2,900 triangles each).
- Ids: `old-lamp-seller`, `ribbon-dyer`, `fortune-teller`, `ballad-singer`, `fair-baker`, `old-night-watchman`, `pie-seller`, `gate-keeper`, `chestnut-roaster`, `old-lamplighter`, `farm-lad` (and six `-opus` doubles on other body shapes, not used in the demo).
- `people/npc/npcs.js` (who they are), `npc_tex.js` (their painted skins), `emotes.js` (the shared feelings and moves), `wiring.json` (which each person uses). How to make more people, skins and weights: `people/kit/*.md` and the scripts beside them; project note `claude/HOW-TO-moon-faire-fair-folk-npcs.md`.
- Open: the Flipbook look uses the witches' 56 colours, which do not suit the fair folk. They cannot sit on the ground. The captain has no model here (another session is building him).

### The fights (they stay painted)
- **The five fight places:** `art/pilot/F1.png` (the moor clearing) and `art/fights/F2.png` (the fair), `F3.png` (the standing stones), `F4.png` (the beacon stair), `F5.png` (the lamp room). All Chris's own, 1448 x 1086, all seen level. `world.json` `backdrops` says which place uses which.
- **The fight camera** they were painted for: 38 degree lens, 2 m up, 18 m back, tilted 4.2 degrees up; horizon 61% down; the moon at 31% across, 17% down. The party stands at x -5.2 to -2.2 and the foes at x 2.6 to 5.4, on flat open ground. `world/pictures/F*.json` hold each place's layout; `world/guide2.js` draws a guide for any fight place.
- `src/stage.js` (a painting with the 3D cast on it, the lights, the Flipbook look), `src/fight.js` (the pilot's fight with the Jester), `sim/blob-battle-engine.js` (the combat numbers Chris approved). Five closer fight cameras exist as a patch from another session (`claude/pilot-fight-cameras.md`), not yet in the branch.
- Foes: only the wisp is here (`models/foes/wisp.js`, from Envoi). The Shadow Wraith and the great wraith are in `chriskizer91-ops/envoi-on-the-longest-night`, `src/models/wraith.js` (`opts.great` builds the great one), not yet brought over.

### The story's pictures
- `art/story/S1.png` to `S4.png` (Warm in her hands, The threads, The flight to the crag, The lights go home) and `T1.png` (the title). `world.json` puts each on the thing it belongs to.
- `art/items/`: the six item card pictures (five finds and the ship's lamp for the lamp count).
- How they were asked for: `world/pictures/prompts.md`. Rule: no witches in any painting, because the game stages its 3D cast on top.

### The world map
- `world/map/map.png`: Chris's painted map (1536 x 1024, north up). `map.svg`: the flat reference it was painted from, which the open world already reads for its land. `map.json`: each place's square on a 12 by 8 grid, how the places join, the land around them, and what was made up. `map_pins.jpg`: the painting with pins and stand-in names.

### The places, in metres
- `world/scenes/W2.json` to `W9.json`: each walking place as grey boxes in metres: the walkable ground, the flat patches, every solid thing with its name and size, the ways out, where each person stands, and the words its painting was made from. W1 is in `pilot/scenes-pilot.js` (and written out in `tools/mf_maps.py`). The open world builds its places from these.
- `art/pilot/W1.png` and `art/world/W2.png` to `W9.png`: Chris's paintings of the nine places, now references and skins for the 3D places. W8 and W9 (the crag) are painted and laid out but not yet built in the open world.

## What the open world can borrow from the painted walk-through

`src/world.js` and `src/walk-main.js` (page: https://claude.ai/artifact/SbBXdfQciYPgdmqBpY2YkU). The walking itself is tied to paintings and does not carry over, but these parts do:
- **Talking:** walk near someone, a prompt, their lines one at a time in a box, they turn to face her and gesture, she turns to them.
- **Going from place to place with a story picture** (the flight shows `S3`).
- **Light by zone:** dusk at the fair, cooler and dimmer on the moor, more so on the crag (`zones` in `build_walk.py`), and light from the nearest lanterns and fires.
- **The place panel:** who is here and what the map says can happen here, read from `world.json`.
- **Finding a way round things** on a grid, pulled straight.

## What is set aside by the open world

- The painted walking places as the game's map, and with them: the traced walking shapes (`world/maps/start.json`, `tools/mf_maps.py`, `tools/take_map_edits.py`), the pieces she goes behind, and the map editor's tracing. Nothing was ever sent from the map editor.
- The two changed paintings `art/world/W9-thirteen-lights.png` and `W4-both-lit.png` were for fading a painted place. In a 3D world the beacon's new light and the second post's flame are lights, so these are now only references for how they should look.
- The walking-place guides and fit checks (`world/scenes/*_guide.png`, `*_fit.jpg`) are history.

## The order of work agreed with Chris, which still holds on the new map

1. The story as things that happen: talk, the witches' little scenes with the story pictures, errands, finds with their item cards, rest spots, the lamp count, the gates.
2. The fights: the two wraiths from Envoi, the party of four with the agreed combat numbers, the closer fight cameras, on the five fight places.
3. The story's own effects: a beaten wisp that warms and drifts home, the Fox's blue thread, the Curtain Call ending.
4. The captain and the airship. 5. Talk for every circumstance and simple minds for the fair folk. 6. Sound and music.

## How the API key was used (the scripts are in the repo; the key is not)

`people/kit/make_person.py` holds the helper (`ask(model, messages, max_tokens, effort)`, `cost`). Each job is a kit (a brief in plain words) and a script: people, skins, emotes, wiring, the review, weights (`people/kit/`); the demo map, the place layouts, the story options, the story rewrite, the world map reference, the story pictures and fight guides (`world/*-KIT.md`, `world/make_*.py`). Chris's rule: Fable 5.2 at high effort for building, Opus 5.5 for lore questions, no Haiku or Sonnet. Spent in this session: about $44.93. One lesson: at extra-high effort a model can spend its whole answer thinking and write nothing, so give it room (60,000 tokens or more) or use high.

## Pages this session published

- The demo map, the story, the fight places: https://claude.ai/artifact/Ju2Mo1hEK5jyA3pScXkYXz
- Story pictures: https://claude.ai/artifact/UWNhi4oUQieZd5WVLPfVK9
- Walk the demo (painted): https://claude.ai/artifact/SbBXdfQciYPgdmqBpY2YkU
- Fair folk who talk: https://claude.ai/artifact/Gqb3KJtYJ76eTn5k1bWkAM
- Making people from a template: https://claude.ai/artifact/S2zzMgXm1qwoGEF2Nk491T. Skin prompts: https://claude.ai/artifact/8BgZ19cqFPZvpJGBeqEQ2v

## Project notes to read, newest first

`claude/moon-faire-walk-the-demo.md`, `claude/moon-faire-story-pictures-and-next-steps.md`, `claude/moon-faire-demo-story-chosen.md`, `claude/moon-faire-world-map-reference-and-prompt.md`, `claude/moon-faire-demo-map-and-painting-prompts.md`, `claude/HOW-TO-moon-faire-fair-folk-npcs.md`, `claude/moon-faire-fair-folk-lighter-weights-and-flipbook.md`, `claude/moon-faire-fair-folk-review-by-fable.md`, `claude/moon-faire-people-skins-prompts.md`, `claude/moon-faire-people-from-a-template-api-cost.md`.

## One thing that is not saved, and is not this session's

By its own note, the open-world map's code is only in that session's workspace, not in the repo. If that conversation ends before it is pushed, the code is gone. It reads this branch and changes nothing here, so it can be pushed beside `game/` without any clash.
