# Levelling for the bigger game (task board F4)

Made by the "Levelling" session on November 14, 2026. Chris asked for 5 to 10 times the fights of the starter plan
(about 120 to 240) and a wider span of levels, now that the map is an open world. This folder holds three options
with numbers, for him to choose from. **Nothing is chosen yet, and `../sim/plan.js` is not changed.**

The page for Chris: `levelling-options.html` (published; the link is in the project note
`claude/levelling-for-the-bigger-game-options.md`).

## What is here

| File | What it is |
|---|---|
| `options.js` | The three options as data: top level, fights aimed for, rings, what is met in each ring, the gate fights, and how the XP for each level is worked out. |
| `run.js` | Plays each option through 2,000 times per play style. Writes `results-full.json` and `results-full.txt`; with `quick`, `results-quick.*`. |
| `gaps.js` | Every line-up at every level gap from 4 under to 4 over: wins, length, faints. Writes `gaps.json`. |
| `make_page.js` | Builds `levelling-options.html` from the results. |

The approved combat engine is used unchanged, through `../sim/lib.js`. No rule or number of the engine is touched.

```
cd game/plan/levelling
node gaps.js 400          # about 10 seconds
node run.js > results-full.txt          # about 15 seconds
node run.js quick > results-quick.txt
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

## Not measured

- Real fight length. The hours use the starter plan's guess of 4 to 9 seconds a witch turn.
- HP and MP carried from fight to fight. Every fight here starts fresh.
- New kinds of foe (task board F3), which land each ring is (F5), and what the gate fights are in the story (S3).

## Made up here, for Chris to change

Three levels a ring; 4, 6 or 8 rings; which line-ups are met in which ring; the gate fights other than the starter
plan's own (`4w`, `K2w`, `2K2w`, `B2K2w`); the XP totals.
