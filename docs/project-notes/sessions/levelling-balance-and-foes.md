# The "Levelling" session: levelling, finds, testers, herbs, the final boss and the bramble foes

November 14 to 18, 2026. Written at wrap-up, before the game is merged into a new repo.

- **Branch:** `claude/moon-faire-levelling` (on top of `claude/moon-faire-starter-world`). **Last commit of the work:** `b830e20`; this note is the commit after it.
- **Nothing is left unpushed.** Every page below is also a file in the repo.

## What it built

| Piece (task board row) | Where | What the game reads |
|---|---|---|
| Levelling (F4): 20 levels, about 180 fights, walking foes from one level below to two above, gates at levels 10 and 20 | `game/plan/levelling/` | `plan-v2.json` |
| Finds (S5): 18 finds at half strength, with pictures | `game/plan/finds/`, `game/art/items/` | `finds.json` |
| The eight pretend players (F10) | `game/plan/testers/` | `testers.js` |
| Herbs and rest spots (F9): HP and MP carry between fights | `game/plan/herbs/` | `herbs-chosen.json` |
| The final boss (F11): the fight in two forms, picture prompts, Chris's pictures, the model in both forms | `game/plan/finalboss/`, `game/models/foes/final-fire/` | `final-fight.json`, `final-fire.js` |
| The three bramble foes (F3): Envoi's two, a great bramble made from the larger, a light version of each | `game/models/foes/bramble/`, `game/plan/foes/` | `brambles.js`, `brambles.json` |

Each folder has a `README.md`. The approved fight engine (`game/plan/sim/blob-battle-engine.js`) was never changed.

## Pages

- Levelling options: https://claude.ai/artifact/DfG2jUeE2rNRJYUjJXdh6J (`game/plan/levelling/levelling-options.html`)
- Finds: https://claude.ai/artifact/Kn148F9d2fqFubmaygupRs (`game/plan/finds/finds.html`)
- Testers: https://claude.ai/artifact/PFLfM8bAxMMgbSGtHkzm2B (`game/plan/testers/testers.html`)
- Herbs: https://claude.ai/artifact/AniF3xsyjHNUnyKG3sYvYV (`game/plan/herbs/herbs.html`)
- The final boss, first idea: https://claude.ai/artifact/ATgwtL1AhuN9ce1CwxsfhW (`game/plan/finalboss/concept.html`)
- The final boss in two forms: https://claude.ai/artifact/XCWqo2nz2DwgsF4Wk3oyVR (`game/plan/finalboss/two-forms.html`)
- The final boss's model: https://claude.ai/artifact/QMzCvpJ1td6hYRR5yBXiRw (`game/models/foes/final-fire/out/final-fire-view.html`)
- The bramble foes: sent to Chris as a file, not a link. `game/models/foes/bramble/out/brambles-view.html`; `build_view.py --inline` makes the one-file copy.

## Chris's decisions

All of them are written in the project knowledge; none is only here. The notes: `claude/levelling-session-log.md` (the running record), `claude/levelling-for-the-bigger-game-options.md`, `claude/finds-for-the-bigger-game.md`, `claude/chris-nov15-herbs-testers-foes-big-bad.md`, `claude/the-eight-testers.md`, `claude/herbs-and-rest-spots.md`, `claude/final-boss-the-fire-that-would-not-end.md`, `claude/bramble-foes.md`, and the task board.

In short: 20 levels and about 180 fights; finds at half strength; fights start with the HP and MP the party has, and Io's herbs refill them; a rest spot refills everything; easy, medium, hard and crazy before the last fight (levels 20, 21, 22, 22.8); the final boss in two forms, helpers first and then alone, with the whole party back to full between them by the Jester's magic; a fall in the final form starts the whole fight again; a rest spot just outside it; a bramble is the wraith of its size in every number and rule.

## Unfinished

- **Chris has not yet looked at the bramble foes.** Their sizes, names and the great bramble's look are first guesses.
- **Waiting on Chris, four small answers on herbs:** a witch who fainted; where the game teaches topping up; the careless player; whether the two play styles stay.
- **The final boss:** the words and picture for the refill; a backdrop; a place on the map. Not joined to the fight piece.
- **The brambles:** where they stand in a fight (they are wide and rooted); the stage's lights and the Flipbook look on them. Not joined to the fight piece.
- **The finds:** to be tuned again now that HP and MP carry over, then the 13 new ones merged into `game/world/world.json`.
- **Not started:** which foes are met where (F5); the story's own effects in fights (F7).
- The final boss's model and the brambles have only been seen through a software renderer.
