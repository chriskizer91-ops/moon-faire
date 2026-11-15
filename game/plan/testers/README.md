# The eight testers (task board F10)

Made by the "Levelling" session on November 15, 2026. Chris asked for more pretend players than the engine's three:
five levels of attentiveness (very careless, careless, attentive, focused, expert), with the top three each in two
play styles, eight in all. He is less sure about the two styles, so those are a proposal.

**The approved engine is not changed.** `testers.js` plays through the engine's own exported functions.
Three of the eight are the engine's own players, move for move: `careless`, `attentive, careful` (the engine's
attentive) and `expert, careful` (the engine's expert). `check.js` proves it, fight by fight. So every number
measured before with careless / attentive / expert still means what it meant.

| Tester | What is new about her |
|---|---|
| very careless | Any lit button, any target. Never Slip Stitch. |
| careless | The engine's careless. |
| attentive, careful | The engine's attentive. |
| attentive, bold | Heals late (under 35%), keeps 20 MP back and not 50, Bloom only when three are hurt, Deity against two foes. |
| focused, careful | Attentive, plus every tool: the Fox's ghost, quilt for two small foes in a crowd, Bloom before an Eclipse. |
| focused, bold | The same tools with the bold habits. |
| expert, careful | The engine's expert. |
| expert, bold | The expert with thinner margins. |

The habits are the `base` and `K` tables at the top of `testers.js`, one number or switch a habit.

```
cd game/plan/testers
node check.js                 # the written-out attentive and expert match the engine's own; all eight finish every fight
node bigbad.js 2000 > bigbad.txt
node make_page.js             # builds testers.html
```

`playOut(code, { tester, level, seed, rules })` is the engine's `playOut` with a tester's name in place of `style`.

## What was measured (2,000 fights each, fresh fights)

Today's last fight (`B2K2w`), wins with no finds / with all 18, its foes at levels 20, 21, 22 and 23:

| Tester | 20 | 21 | 22 | 23 |
|---|---|---|---|---|
| very careless | 2% / 11% | 0% / 1% | 0% / 0% | 0% / 0% |
| careless | 5% / 19% | 0% / 1% | 0% / 0% | 0% / 0% |
| attentive, careful | 80% / 98% | 3% / 13% | 0% / 0% | 0% / 0% |
| attentive, bold | 54% / 85% | 3% / 10% | 0% / 0% | 0% / 0% |
| focused, careful | 96% / 100% | 35% / 65% | 0% / 7% | 0% / 0% |
| focused, bold | 77% / 93% | 15% / 37% | 0% / 0% | 0% / 0% |
| expert, careful | 100% / 100% | 91% / 97% | 26% / 80% | 0% / 1% |
| expert, bold | 98% / 100% | 68% / 84% | 8% / 51% | 0% / 0% |

## What was found

- **The two styles differ only in the hard fights, and bold is simply weaker.** In ordinary fights careful and bold
  take the same turns and end with the same HP and MP. The styles are to be reworked around herbs (F9): thrifty and spender.
- **An ordinary fight costs HP and MP.** After `2K2w` two levels over, an attentive party has about 87% of its HP and
  66% of its MP left. `bigbad.json` has this for five fights and all eight testers.
- **Reading more of the turn bar is not always better for these players.** A tester who read the whole bar and used
  the ghost, with none of the expert's fine timing, was as good as the expert at level 21 (90%) but worse than the
  three-turn reader at level 20. So "focused" reads three turns and is told apart from "attentive" by her tools.
- **The spare outline** (the ghost eats a third blow) helped the expert a little and did nothing for the focused
  player: blows the ghost eats lay no Fate on the foe.
- **Nobody uses Slip Stitch.** A fight is won or lost.

## Not done

The levelling and finds runs (`../levelling/`, `../finds/`) still report the old three. They are to be run again with
all eight when HP and MP carry over (F9), since those numbers change then anyway.
