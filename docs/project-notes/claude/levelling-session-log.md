# The "Levelling" session: what is finished, what is started, what is next

Kept by the "Levelling" session (started November 14, 2026, 6:29 pm). Updated every time a piece is finished or started, on Chris's word (Nov 14, 7:59 pm): "Make sure you're pushing everything you've already done before you move on to the next step and making note in the project knowledge of what you finished and what you started."

**Rule for this session:** finish, push, write it here and on the board, and only then start the next piece.

Repo: `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-levelling` (on top of `claude/moon-faire-starter-world` at `90919e4`). **Last checked Nov 15, 5:20 pm: nothing unsaved in the workspace, and GitHub's branch is on the same commit, `b830e20`.**

## Finished

### F4, levelling (chosen Nov 14; revised Nov 15, 1:06 pm by Chris's word)

- Option B: 20 levels, about 180 fights, level 20 the top.
- Revised: walking foes from one level below the party to two above; two gates (the final great wraith fight at level 10, the great bramble fight at level 20); six bands of land.
- **The plan the game reads: `game/plan/levelling/plan-v2.json`** (it replaces `plan-chosen.json`). Commit `926dcd2`. Note: `claude/levelling-for-the-bigger-game-options.md` (the record of how B was chosen; the revision is in the folder's `README.md` and on the task board).

### S5, finds (Chris answered Nov 15, 7:38 am)

- 18 finds at half strength; names and cards approved; all pictures in `game/art/items/`.
- `game/plan/finds/`. Note: `claude/finds-for-the-bigger-game.md`. Page: https://claude.ai/artifact/Kn148F9d2fqFubmaygupRs
- **Left:** the strength tuned again now that HP and MP carry over, then the 13 new ones merged into `game/world/world.json`.

### F10, the eight testers (Nov 15, 8:00 am)

- `game/plan/testers/`. Note: `claude/the-eight-testers.md`. Page: https://claude.ai/artifact/PFLfM8bAxMMgbSGtHkzm2B
- **Waiting on Chris:** whether the two play styles stay.

### F9, herbs and rest spots (Chris chose Nov 15, 12:56 pm; whole games played 1:30 pm)

- Chosen: steady plants, MP herb 20, HP herb 60, "top everybody up", a very big bag; easy / medium / hard / crazy before the last fight (levels 20, 21, 22, 22.8).
- `game/plan/herbs/herbs-chosen.json` is the plan the game reads. Whole games under the revised plan: `game.js`, `game.txt`.
- Note: `claude/herbs-and-rest-spots.md`. Page: https://claude.ai/artifact/AniF3xsyjHNUnyKG3sYvYV
- **Waiting on Chris for four small answers:** a witch who fainted; where the game teaches topping up; the careless player; the two play styles. (A rest spot before the last fight: yes, just outside its place, Nov 15 4:18 pm.)
- **Note for whoever reads the herbs note and page:** their ring-by-ring tables were measured under the first plan (foes up to four levels over). Under the revised plan (two over at most) a player who thinks hardly ever loses a walking fight, and the rest spots inside bands 5 and 6 are a comfort, not a need. The whole-game table in `game/plan/herbs/README.md` is the up-to-date one.

### F11, the final boss: a proposal, prompts and a first model (Nov 15, 1:35 pm)

- Chris invited Opus 5.5 helpers to brainstorm it and begin its model. Three brainstormed (story, look, fight); a fourth built the first rough model.
- The proposal: "the fire that would not end". `game/plan/finalboss/` and `game/models/foes/final-fire/`. Commit `15626a8`.
- Note: `claude/final-boss-the-fire-that-would-not-end.md`. Pages: https://claude.ai/artifact/ATgwtL1AhuN9ce1CwxsfhW (the idea and picture prompts) and https://claude.ai/artifact/QMzCvpJ1td6hYRR5yBXiRw (the model).

### Chris's decisions written down

- `claude/chris-nov15-herbs-testers-foes-big-bad.md` (7:38 and 7:40 am); `claude/herbs-and-rest-spots.md` (7:54 am and 12:56 pm); the task board's "Changed by Chris" lines (1:06 pm).

### F11, the final boss in two forms (Nov 15, 2:25 pm)

- Chris, 1:58 pm: the model as rendered is "a good first draft of phase one of the boss". It loses HP but shows no damage, and at zero HP it changes into its final form, "which looks broken larger and more vibrant". He asked for picture prompts for both forms, and whether the fight is one body alone, harder than the gate fights, or the great wraith's numbers under new names with the same helpers.
- Done and pushed (commit `b0434e6`): prompts F1 (form one), F2 (the final form) and F3 (both side by side) in `game/plan/finalboss/picture-prompts.md`; the fight measured three ways with the eight testers (`forms.js`, `forms_run.js`, `forms.txt`); the folder's `README.md`.
- Levelling's pick: helpers in form one (the great wraith's own numbers), the body alone in the final form with a quarter of the Life. The careful expert wins hard 13% with no finds and 63% with all 18.
- Page: https://claude.ai/artifact/XCWqo2nz2DwgsF4Wk3oyVR. Note: `claude/final-boss-the-fire-that-would-not-end.md` (rewritten, newest first).
- Chris answered all three at 3:23 pm (next entry).

### F11, the final fight as Chris chose it (Nov 15, 3:35 pm)

- Chris, 3:23 pm: "Which fight helpers first and then alone. When one form ends the fallen do get up from the jester casting curtain call. But maybe the jester's curtain call or when the boss falls the first time the whole party gets back up full HP MP for some story reason and then the second round is more challenging but it still works out the same balancing. The helper should be wraiths and brambles Yes."
- Done and pushed (commit `9f2f903`): the full-refill version measured with the eight testers (a final form with 20% more Life and blows 10% bigger gives the same balance on hard: the careful expert 12% with no finds, 65% with all 18); **`game/plan/finalboss/final-fight.json` is the fight the game reads** (made by `chosen.js`), with the refill built in and marked to be confirmed.
- The page is rewritten round his choice (same link, https://claude.ai/artifact/XCWqo2nz2DwgsF4Wk3oyVR), and so are the folder's `README.md`, the note and the board's F11 and F12 rows.
- Chris sent the pictures at 3:30 pm and answered the rest at 4:18 pm (the next two entries).

### F11, the final boss's model in both forms, from Chris's pictures (Nov 15, 3:50 pm)

- Chris sent three pictures at 3:30 pm (form one, the final form, both side by side). They are in `game/models/foes/final-fire/ref/` with the prompts.
- Done and pushed (commit `9cb97a9`): `final-fire.js` rebuilt from them, `makeFinalFire({ detail, form })`, with both forms, a new `change` move between them, and the ending. 21,104 triangles and 14 draw calls at detail 1; 10,724 triangles at detail 0.5. It faces +Z now. The folder's `README.md` is rewritten.
- The viewing page is rebuilt on the same link, https://claude.ai/artifact/QMzCvpJ1td6hYRR5yBXiRw, with a switch for the form and a "Break open" button.
- Chris, 4:18 pm: "The 3D modeling it looks great."

### F11, the final fight settled (Nov 15, 4:25 pm)

- Chris, 4:18 pm: the full refill is in; a party that falls in the final form starts again from before the first form; a rest spot just outside the place of the fight; the refill's story reason comes from the Jester's magic and from what the boss is, a black orb inside light (life and death are her thing).
- Done and pushed (commit `13e53cb`): `final-fight.json`, `herbs-chosen.json`, the folder's `README.md`, the page (same link), the note and the board's F11, F9, M10 rows and its "Changed by Chris" line.
- Left on F11, none of it started: the words and picture for the refill; the fight in the fight piece (F12, the Fights session's row); a backdrop and a place on the map.

### F3, the three bramble foes (Nov 15, 5:20 pm)

- Chris, 4:24 pm: two brambles and a great bramble made by changing the larger one, a light version of each, and in a fight each is a wraith of its size by the numbers and the rules.
- Envoi's brambles are not on its main branch; they were taken from `work/arenas` (commit `865677d`): the Bramble Horror and the Bramble Colossus (the game's one, not the million-triangle study).
- Done and pushed (commit `b830e20`): `game/models/foes/bramble/` (`bramble.js`, `colossus.js` with a new `opts.great`, `brambles.js` with `MF_BRAMBLES.make(kind, weight)`, `build_view.py`, `README.md`) and `game/plan/foes/brambles.json`. Light weights: 11,965, 14,351 and 25,057 triangles. Every move runs clean.
- Note: `claude/bramble-foes.md`. The page went to Chris as one file (`moon-faire-brambles.html`), not a link, because it carries Envoi's model code, which this session did not read line by line.
- **Waiting on Chris:** to look at them and say what to change (sizes, the great bramble's look, names).

## Started

Nothing is half-built.

## Next

1. **F5, which foes are met where,** now that the brambles have their numbers: which piece of the map is which band, and how many foes in each are drawn as brambles.
2. **The finds tuned again** under carried HP and MP, then merged into `world.json`.
3. **F7, the story's own effects in fights.**
