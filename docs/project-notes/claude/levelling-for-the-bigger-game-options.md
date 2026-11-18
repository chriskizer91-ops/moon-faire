# Levelling for the bigger game: Chris chose option B (task board F4, done)

November 14, 2026, by the "Levelling" session. Read after `claude/TASK-BOARD-moon-faire-game.md`.

## Chris's decision (November 14, 7:30 pm)

"I say option B to 3:00 to 6 hours. One 180 fights to finish level 20 Max."

- **20 levels. 180 fights to finish. Level 20 is the top:** the party stops gaining levels there.
- **Full-size fights** as the usual thing she meets. He did not answer that question in words; the "3 to 6 hours" he named is the full-size figure, so the plan uses them. Small packs would be about 2½ to 4½ hours for the same fights and levels, if he ever wants it shorter.
- **What the top level changes:** fighting more than you must no longer makes the last gate easier. It stays at 81% for an attentive player however many fights were won. Finds are the lever now, as in `lore/combat-balance.md`.

## Where it is

- **The plan the game reads:** `game/plan/levelling/plan-chosen.json`, and `plan-chosen.js` for a page (`window.MF_LEVELS`, with `levelOf(xp)`, `xpOf(foes, foeLevel)` and `ringOf(level)`).
- **Repo:** `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-levelling` (commit `8f59a2e`, on top of `claude/moon-faire-starter-world` at `90919e4`), folder `game/plan/levelling/`. Pushed. `game/plan/sim/plan.js` is the first, five-level plan and is not changed; for levels, XP and what is met where, `plan-chosen.json` replaces it.
- **Page:** "Moon Faire levelling options", https://claude.ai/artifact/DfG2jUeE2rNRJYUjJXdh6J (the choice at the top, the three options under it).

## The chosen plan

**XP in all to be each level:** 2: 80, 3: 330, 4: 610, 5: 920, 6: 1,810, 7: 2,690, 8: 3,640, 9: 6,340, 10: 9,040, 11: 11,940, 12: 17,840, 13: 23,340, 14: 29,140, 15: 46,140, 16: 60,140, 17: 74,140, 18: 115,140, 19: 149,140, 20: 184,140.

**XP for a foe** is the first plan's: wisp 10, Shadow Wraith 40, great wraith 400, 20% more a foe level. The party shares XP and levels together.

| Ring | Party level | Foe levels | What she meets | Gate fight (opens at its level) |
|---|---|---|---|---|
| The fair | 1 to 2 | 1 to 2 | three set fights, as in the first plan | |
| 1 | 2 to 5 | 2 to 6 | 2, 3 or 4 wisps | 4 wisps, level 5 |
| 2 | 5 to 8 | 5 to 9 | 3 or 4 wisps; a Shadow Wraith; a Shadow Wraith and 2 wisps | a Shadow Wraith and 2 wisps, level 8 |
| 3 | 8 to 11 | 8 to 12 | 4 or 5 wisps; a Shadow Wraith with 2 or 4 wisps; 2 Shadow Wraiths | 2 Shadow Wraiths and 2 wisps, level 11 |
| 4 | 11 to 14 | 11 to 15 | the same as ring 3 | the great wraith alone, level 14 |
| 5 | 14 to 17 | 14 to 18 | 5 wisps; a Shadow Wraith with 2 or 4 wisps; 2 Shadow Wraiths and 2 wisps | the great wraith, a Shadow Wraith and 2 wisps, level 17 |
| 6 | 17 to 20 | 17 to 21 | 6 wisps; a Shadow Wraith and 4 wisps; 2 Shadow Wraiths with 2 or 4 wisps; 3 Shadow Wraiths | the great wraith, 2 Shadow Wraiths and 2 wisps, level 20 |

Walking foes are from 2 levels under the party to 4 over, which is Chris's rule for ordinary foes. The gates of rings 4 and 5 are stand-ins: which land each ring is and what each gate is in the story are not decided here (F5, S3).

## The chosen plan, checked

Played 2,000 times per play style from `plan-chosen.js` alone, with the approved engine unchanged (careless / attentive / expert).

- **Wins to finish:** 182 / 180 / 180. **Fights alone:** 3 h 00 quick, 4 h 15 middle, 6 h 10 slow (a guess: 4 to 9 seconds a witch turn).
- **Levels arrive on wins** 3, 8, 13, 19, 27, 34, 41, 50, 59, 68, 79, 89, 100, 112, 125, 137, 151, 165 and 179: every 5 wins at first, every 14 at the end.
- **Gates fall on wins** 20, 42, 69, 101, 138 and 180.
- **Walking fights:** attentive and expert players won every one. A careless player lost about 2.5 in a whole game.
- **The gates for a careless player:** about 2 tries at the lone great wraith, 6½ at the level-17 gate, 22 at the last. For an attentive player only the last gate can be lost (81%).
- **The Jester ends on about 31,900 HP;** the last great wraith has about 256,000 Life.

## The options he chose from

| | Levels | Fights to finish | Rings beyond the fair | Fights alone: quick / middle / slow guess | The Jester's HP at the end |
|---|---|---|---|---|---|
| A | 14 | 120 | 4 | 2 h 00 / 2 h 50 / 4 h 05 | 10,700 |
| **B (chosen)** | 20 | 180 | 6 | 3 h 00 / 4 h 15 / 6 h 10 | 31,900 |
| C | 26 | 240 | 8 | 4 h 00 / 5 h 40 / 8 h 10 | 95,400 |

The first plan, for comparison: 5 levels, about 24 fights, 25 to 45 minutes of fights. All three options, the table of levels against fights, and every line-up at every level gap (`gaps.json`) stay in the folder.

Useful for F5 from `gaps.json`: wisps and Shadow Wraith packs are safe for an attentive player at every gap up to 4 over; a lone great wraith is 100% at the party's level and one over, 57% two over.

## Not measured

- **Real fight length.** Nobody has timed a real fight; the long moves run 13 to 15 seconds at normal speed.
- **HP and MP carried from fight to fight.** Every fight here starts fresh. The fight piece (`MF_FIGHT.start`) can carry them; if Chris wants that, it needs its own measuring.
- **New kinds of foe** (F3). They will change what a walking fight is worth and how long it runs.
- **How often a fight comes while she walks.** The open world has to offer about a ring's fights on the way through it: roughly 17, 22, 27, 32, 37 and 42 fights for rings 1 to 6.

## Made up here, for Chris to change

Three levels a ring and six rings; which line-ups are met in which ring; the gates of rings 4 and 5; the XP totals.

## What this unblocks

- **F5** (which foes are met where): map the six rings onto the land, and set the steps between fights so each ring offers its share. Needs F3 too.
- **S3** (a longer story): six rings and six gates to hang beats on.
- **S5** (more finds): with a top level, finds are the only way to ease the last gate.
- **F6** (joining fights to the open world): `MF_LEVELS.xpOf` and `levelOf` give the party's level and what a fight is worth.

## How to run it again

```
cd game/plan/levelling
node gaps.js 400
node run.js > results-full.txt
node run.js quick > results-quick.txt
node choose.js B full "Chris, November 14, 2026, 7:30 pm"
node check_chosen.js > results-chosen.txt
node make_page.js          # builds levelling-options.html; republish it to the link above
```
