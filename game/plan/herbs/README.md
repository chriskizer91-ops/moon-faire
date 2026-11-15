# Herbs and rest spots: fights that start with the HP and MP the party has (task board F9)

Made by the "Levelling" session on November 15, 2026, from Chris's decisions of that morning
(project note `claude/chris-nov15-herbs-testers-foes-big-bad.md`):

- A fight starts with the HP and MP the party has, not full.
- Io's herbs refill them: an HP herb and an MP herb. A herb is worth less than any spell; eaten in a fight it is half
  as good as the weakest healing spell. They are mostly eaten after a fight, several at a time.
- She gets more by picking the wild plants already growing on the moor.
- A rest spot refills everything for free, so rest spots are to be placed with care.

**A proposal with numbers, waiting on Chris.** Nothing here is in the plan yet.

The page for Chris: `herbs.html` (published; the link is in the project note `claude/herbs-and-rest-spots.md`).

## The approved engine is not changed

`journey.js` sets a fight up with the engine, sets each witch's HP and MP to what the party carries, and runs the fight
through the engine's own step and move functions with the eight testers (`../testers/`). A fresh fight played this way
is the same fight, turn for turn, as before (checked over 200 fights). The one thing added is the herb: on her turn a
witch may eat one in place of a move, and the turn passes as after any move.

## The rules as built (`HERBS` and `HABIT` at the top of `journey.js`)

| Thing | Value | Where it comes from |
|---|---|---|
| HP herb | 60 HP on the scale where the Jester has 1,000 | Chris's rule: half the weakest heal (the Jester's own, 120) |
| MP herb | 20 MP | Made up here; at 10 she eats twice as many |
| Eaten in a fight | the same size, and it takes the witch's turn | Chris: usable in a fight |
| A witch who fainted in a won fight | gets up after it with 10% HP | Made up here |
| Spells between fights | not allowed | Made up here; if Io could Mend between fights, MP herbs would be worth far more than HP herbs |
| Rest spot | all HP and MP back, no herbs | Chris |
| Losing | wake at the last rest spot | As before |

How the testers use herbs: after a fight the careful ones top everyone up to 90% HP and 80% MP, the bold ones to 60%
and 40%, the careless one eats only when someone is under 40% HP or 20% MP, and the very careless one never does.
In a fight the thinking testers eat a herb only when a friend is under 35% and Io cannot mend.

## What is here

| File | What it is |
|---|---|
| `journey.js` | One fight with carried HP and MP and herbs (`fight`), what she eats after it (`after`), and a run of fights from a rest spot in one ring of the chosen plan (`stretch`). |
| `first.js` | A first look: no herbs against all the herbs she wants. |
| `run.js` | Every ring and tester, for six rates of plants picked between fights. `node run.js 200 20 > results-mp20.txt` (two minutes). The second number is the MP in one MP herb. |
| `make_page.js` | Builds `herbs.html` from `results-mp20.json`. |

## What was measured (200 stretches for every number; HP herb 60, MP herb 20)

Fights won from a rest spot before the first loss, for a careful attentive player: the unlucky 1 in 10 / the usual run.
The party is at the ring's middle level and meets the ring's own foes. "40" means she was still winning at 40.

| Ring | No plants | 0.5 HP + 1 MP a fight | 1 + 2 | 1.5 + 3 | 2 + 4 |
|---|---|---|---|---|---|
| 1 | 23 / 31 | 40 / 40 | 40 / 40 | 40 / 40 | 40 / 40 |
| 2 | 12 / 18 | 40 / 40 | 40 / 40 | 40 / 40 | 40 / 40 |
| 3 and 4 | 6 / 9 | 13 / 20 | 40 / 40 | 40 / 40 | 40 / 40 |
| 5 | 4 / 6 | 6 / 10 | 10 / 32 | 40 / 40 | 40 / 40 |
| 6 | 3 / 4 | 4 / 6 | 6 / 11 | 11 / 26 | 40 / 40 |

What she eats a fight when she has all she wants (HP herbs, MP herbs): ring 1: 0.3, 1.9; ring 2: 1.1, 2.3;
rings 3 and 4: 1.8, 3.0; ring 5: 2.2, 3.6; ring 6: 2.6, 4.1. Over the 177 walking fights of the chosen plan that is
about 330 HP herbs and 570 MP herbs.

Three ways to set it, each sized so the unlucky careful attentive player still reaches the next rest spot:

| | Plants between fights | Plants in the whole game | Rest spots inside the rings |
|---|---|---|---|
| Sparing | 0.5 HP + 1 MP | about 270 | 20 (ring 3: 2, ring 4: 2, ring 5: 6, ring 6: 10) |
| Steady | 1 HP + 2 MP | about 530 | 9 (ring 5: 3, ring 6: 6) |
| Generous | 1.5 HP + 3 MP | about 800 | 3 (all in ring 6) |

## What was found

- **MP runs out, not HP.** Mend turns 10 MP into 250 HP.
- **Herbs do not save a careless player in the far rings.** She loses those fights outright: about 3 fights from a
  rest spot in ring 6 whatever she carries. Under fresh fights she lost two or three walking fights in a whole game.
- **"Bold" (topping up only part of the way) is not a real second style.** She saves almost no herbs and is much less
  safe: in ring 6 with 2 + 4 plants a fight, 8 fights on an unlucky run against 40 for the careful player.
- Rings 3 and 4 give the same numbers because they meet the same line-ups at the same gaps.

## Not done yet (after Chris has picked)

- A whole playthrough of the chosen plan with carried HP and MP, herbs and rest spots, for all eight testers: fights,
  losses and hours. The levelling numbers so far assume fresh fights.
- The finds tuned again, and the big bad measured as met straight from a rest spot.
- A bag limit, if Chris wants one. There is none here.
