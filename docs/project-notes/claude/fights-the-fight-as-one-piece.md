# Fights: the fight as one piece, and the two wraiths (task board F1 and F2)

November 14, 2026, by the "Fights" session. Read after `claude/TASK-BOARD-moon-faire-game.md` and `claude/HANDOFF-starter-world-to-the-open-world.md`.

- **Page:** "Moon Faire: the fight on its own", https://claude.ai/artifact/6KjWrHpztUDZsCu15fkYpi. One file, 13.8 MB, nothing loaded from outside.
- **What Chris asked:** in a new session, "read the task board and pick which one you can work on". This session took F1 with F2.
- **Where the code is:** in this session's workspace, in `game/fight/` and `game/models/foes/wraith.js`, on top of branch `claude/moon-faire-starter-world` (commit `90919e4`). **It is not in the repo yet.** It waits for Chris to say "push" in the Fights conversation; it would go on its own branch, `claude/moon-faire-fights`, and touch no existing file. Until then the published page holds all of the code in readable form.

## What it is

The party of four (Jester, Ranger, Fox, Io) against wisps, Shadow Wraiths and the great wraith, on any of the five painted fight places, with the approved combat engine unchanged. One call starts a fight and answers who won and what was gained:

```js
const result = await MF_FIGHT.start({ place: 'F3', foes: 'K2w', partyLevel: 3, foeLevel: 4, party: last && last.party });
// { result: 'won' | 'lost' | 'fled', won, xp, turns, foeTurns, fainted, place, foes, tag,
//   party: { jester: { hp, max, mp, mpMax }, ranger: {...}, fox: {...}, io: {...} } }
```

- `place`: F1 the moor clearing, F2 the fair, F3 the standing stones, F4 the beacon stair, F5 the lamp room.
- `foes`: a line-up as the plan writes it (`w` wisp, `K` Shadow Wraith, `B` great wraith: `3w`, `K2w`, `B2K2w`), or a list.
- `party`: what each witch brings in. Hand back the last result's `party` and HP and MP carry from fight to fight.
- XP uses the plan's numbers (10, 40 and 400 for a level-1 wisp, Shadow Wraith and great wraith, 20% more a foe level).
- The fight covers the page with a canvas of its own. The page that called it should stop drawing while it runs.
- `python3 game/fight/build_fight.py` builds `out/mf-fight.js` (for another page to load) and `out/moon-faire-fight.html` (the page above).

## How it plays

- On a witch's turn her moves are buttons. A move aimed at a foe goes to the foe whose bar is lit; tapping another bar aims there. Mend and Revive ask which friend.
- The strip along the top is who acts next. A foe's Heavy, Crush or Eclipse is named there before it comes.
- Under the picture: a row for each witch (HP, MP, what she is catching), the camera, the speed (1 to 3 times) and the Flipbook look.
- Five cameras: Closer (the default), On whoever acts, Over the shoulder, Low and close, Wide. The last-but-two really move the camera, with the painting out of focus behind, as in `claude/pilot-fight-cameras.md`. Anyone standing between a moved camera and what it looks at steps out of the picture for that shot.
- A fainted witch kneels (Jester, Fox), falls (Ranger) or lies where she fell (Io) until she is revived or Curtain Call stands her up.

## The foes (F2)

Envoi's `wraith.js`, unchanged, from `chriskizer91-ops/envoi-on-the-longest-night`, branch `claude/send-note-gigdew` (the branch the wisp came from), commit `318bc96`. `MF_FOES.make(kind, weight)`.

| Triangles | Light, for fights | Fine, for close-ups |
|---|---|---|
| Wisp | 4,700 | 16,300 |
| Shadow Wraith | 14,500 | 58,600 |
| Great wraith (5.6 m tall) | 19,900 | 70,000 |

- Light is the model's own half detail, with every large part thinned again by the step the witches use.
- **Why the wraiths first came out pale grey:** Envoi leaves its picture without the screen's brightening step and has no studio reflections; the witches' stage has both. A wraith's own materials now undo the brightening for themselves and take almost no reflection, so it is black with burning green edges, as in Envoi. The wisp is left as the pilot showed it.
- Which of a foe's moves shows which rule: wisp, Blow is its flicker. Shadow Wraith, Blow is the scythe sweep and Heavy is the grasp. Great wraith, Blow is the sweep, Crush is the swallow, Eclipse is its eclipse.
- Wraiths walk up to whoever they strike and walk back.

## The four witches together

- The Jester's files were already in the repo. The Fox, the Ranger and Io are built from their own branches (`0a21ddc`, `3e6706e`, `3bc17a3`) with the light-level scripts from their notes, by `game/fight/tools/build_witches.py`. The branches are only read.
- **Each model defines one function and nothing else, so all four load in one page.** What clashed was the levels file (each page set `window.WITCH_LOD`). `game/fight/witches/witch_levels.js` gives them one name: `MF_WITCHES.fox.raw('lightest')`. **This is most of rows C2 and C3 (and C4 for Io as she stands today).** Those sessions are welcome to take the files in `game/fight/witches/` as they are.
- The fight uses Lightest, as Chris's rule says for fight distance: Jester 18,800 triangles, Fox 30,200, Ranger 37,800, Io 45,000.
- Drawn each picture: about 160,000 triangles in 140 draws with a Shadow Wraith and two wisps; about 194,000 in 180 draws in the last fight (five foes).

## Which move shows which rule (`MOVES` in `actors.js`)

| Rule | Model's move | |
|---|---|---|
| Jester: Gilded Rebuke, Attack taunt, Heal taunt, Sealed Fate, Curtain Call | her five game moves | as in the pilot |
| Ranger: Bow | Moonsteel Draw | |
| Ranger: The gem | the gem, then two shots | both shots go to the lit foe |
| Fox: Hemline Fangs, Same Cloth, Crazy Quilt, Borrowed Face, Slip Stitch | her own | |
| Fox: Stitch | Blue Mischief | **stand-in** |
| Fox: Pins and Needles | The Moon's Little Lie | **stand-in** |
| Io: Harvest Crescent, Thorn, Mend, Bloom, Revive | crescent, Thornwake, salve, the garden, Rootbound Return | |
| Io: Deity | her herb move when cast; the Elderwood Guardian on her next turn | the cast is a **stand-in** |

- **Io's spells land 1.4 m in front of her**, so she walks to her target, casts and walks back. The Fox does the same for Hemline Fangs. Io's practice dummy and practice friends are hidden.
- The Ranger's arrow leaves level and would pass over a wisp, so she leans a few degrees toward a low target.

## Checked (test browser, `game/fight/checks/`)

- Whole fights played by the engine's own players through the real page, no errors: a Shadow Wraith and two wisps on the moor (won in 12 turns), three wisps on the beacon stair (6 turns), and the last fight in the lamp room (won in 27 party turns by sealing the great wraith; for that run the foes hit at 60% so it would last).
- All 18 witch moves played once each in one fight at the fair, and every foe move, each with a still as it landed. A lost fight and a fight begun with two witches already fainted.
- All five places seen. The phone layout held upright, tapping a move button, the two moving cameras, the Flipbook look.

## Not checked, and not built

- **Real speed, and how anything moves.** The test browser has no graphics chip. Chris's laptop and phone are the ones that count.
- One weight of each witch for a whole fight. Swapping to Light for the close cameras is not built.
- On a phone held upright the "Closer" camera has to fit everyone across a narrow screen, so they are small. "On whoever acts" is better there.
- No sound. No story effects (F7). Not joined to the open world (F6): that needs this pushed and the open world pushed.
- Slip Stitch (the party leaves) is in and answers `fled`, but was not played in a check.

## For Chris to say

- "push", to save it to the repo.
- Which camera should be the default, and whether the long moves want the speed up (the Guardian is 14.6 seconds, Curtain Call 12.9).
- Whether the stand-in moves above are fine or want moves of their own.
- Whether the great wraith is the right size at 5.6 m, and whether it should walk up to the party at all.
