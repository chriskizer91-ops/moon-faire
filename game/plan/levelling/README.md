# Levelling for the bigger game (task board F4)

Made by the "Levelling" session on November 14, 2026. Chris asked for 5 to 10 times the fights of the starter plan
(about 120 to 240) and a wider span of levels, now that the map is an open world. This folder holds three options
with numbers, which he chose from.

**Chris chose option B on November 14, 2026 (7:30 pm): 20 levels, 180 fights to finish, level 20 the top.** He said
nothing against full-size fights, and the "3 to 6 hours" he named is their figure, so the plan uses them.
The plan the game reads is **`plan-chosen.json`** (or `plan-chosen.js`, which a page loads as `window.MF_LEVELS`
with `levelOf(xp)`, `xpOf(foes, foeLevel)` and `ringOf(level)`). `../sim/plan.js` is the first, five-level plan and
is not changed; for levels, XP and what is met where, `plan-chosen.json` replaces it.

The page for Chris: `levelling-options.html` (published; the link is in the project note
`claude/levelling-for-the-bigger-game-options.md`).

## What is here

| File | What it is |
|---|---|
| `options.js` | The three options as data: top level, fights aimed for, rings, what is met in each ring, the gate fights, and how the XP for each level is worked out. |
| `run.js` | Plays each option through 2,000 times per play style. Writes `results-full.json` and `results-full.txt`; with `quick`, `results-quick.*`. |
| `gaps.js` | Every line-up at every level gap from 4 under to 4 over: wins, length, faints. Writes `gaps.json`. |
| `make_page.js` | Builds `levelling-options.html` from the results. |
| `play.js` | The playthrough itself, shared by `run.js` and `check_chosen.js`. |
| `choose.js` | Writes an option out as the plan: `plan-chosen.json` and `plan-chosen.js`. |
| `check_chosen.js` | Plays the chosen plan 2,000 times per play style from `plan-chosen.js` alone. Writes `results-chosen.*`. |

The approved combat engine is used unchanged, through `../sim/lib.js`. No rule or number of the engine is touched.

```
cd game/plan/levelling
node gaps.js 400          # about 10 seconds
node run.js > results-full.txt          # about 15 seconds
node run.js quick > results-quick.txt
node choose.js B full "Chris, November 14, 2026, 7:30 pm"
node check_chosen.js > results-chosen.txt
node make_page.js
```

## The options

| | Levels | Fights | Rings beyond the fair | Fights alone (quick / middle / slow guess) |
|---|---|---|---|---|
| A | 14 | 120 | 4 | 2 h 00 / 2 h 50 / 4 h 05 |
| B | 20 | 180 | 6 | 3 h 00 / 4 h 15 / 6 h 10 |
| C | 26 | 240 | 8 | 4 h 00 / 5 h 40 / 8 h 10 |

- XP for a foe is the starter plan's: wisp 10, Shadow Wraith 40, great wraith 400, 20% more a foe level.
- A ring is three levels wide. Its foes run from the level the party arrives at to one above the level it leaves at,
  so walking foes are from 2 under the party to 4 over.
- Each ring ends in a gate fight that opens at the ring's last level. The last gate is `B2K2w` at the top level.
- The XP to reach each level is sized so the walking fights come to the number aimed for; a gate fight's own XP is
  added to the level after it, so a gate does not skew the pace. `run.js` then nudges the whole curve (about 1%) so a
  steady, attentive party finishes on the number of wins aimed for.

## What was measured (2,000 playthroughs per play style; careless / attentive / expert)

- Wins to finish, fighting only what the gates ask: A 121 / 120 / 120, B 182 / 180 / 180, C 241 / 239 / 239.
- Walking fights: attentive and expert players won every one, at every gap up to 4 over. A careless player lost about
  2, 2.5 and 3 walking fights in a whole game of A, B and C.
- The last gate at the party's level (3,000 fights): 6% / 81% / 99%. One level over: 61% / 100% / 100%.
  A careless player needs about 22 tries at it, as in the starter plan (17 there, from fewer fights).
- A player who fights half as many again in every ring: 156, 227 and 295 wins, and about one level ahead at the last gate.
- Small packs as the usual fight (`run.js quick`): the same fights and levels in about a quarter less time
  (middle guess 2 h 10, 3 h 15, 4 h 15).
- Levels and fights are separate dials: `results-*.json` `grid` has all nine pairs of 14, 20, 26 levels with 120, 180, 240 fights.

## The chosen plan, checked (2,000 playthroughs per play style, from `plan-chosen.js` alone)

- Wins to finish: 182 / 180 / 180 (careless / attentive / expert). Fights alone: 3 h 00 / 4 h 15 / 6 h 10.
- **Level 20 is the top, so extra fighting does not ease the last gate.** A player who fights half as many again in
  every ring still meets it at level 20: 81% for an attentive player, about 22 tries for a careless one. In the
  options' own runs, which had no top level, that player arrived a level ahead. Finds are the lever now
  (`lore/combat-balance.md`: both small finds took the first plan's boss from 81% to 87%).

## Not measured

- Real fight length. The hours use the starter plan's guess of 4 to 9 seconds a witch turn.
- HP and MP carried from fight to fight. Every fight here starts fresh.
- New kinds of foe (task board F3), which land each ring is (F5), and what the gate fights are in the story (S3).

## Made up here, for Chris to change

Three levels a ring; 4, 6 or 8 rings; which line-ups are met in which ring; the gate fights other than the starter
plan's own (`4w`, `K2w`, `2K2w`, `B2K2w`); the XP totals.
