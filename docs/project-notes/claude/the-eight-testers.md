# The eight testers: the pretend players for every balance run (task board F10)

November 15, 2026, by the "Levelling" session. Read after `claude/chris-nov15-herbs-testers-foes-big-bad.md`.

- **Page for Chris:** "Moon Faire testers", https://claude.ai/artifact/PFLfM8bAxMMgbSGtHkzm2B
- **Where it is:** repo `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-levelling` (commit `3b2afc8`), folder `game/plan/testers/`. Pushed.
- **What Chris asked (7:38 am):** "five levels of attentiveness and two variations of the three most attentive, so that's eight total... very careless and careless, then attentive, focused and expert, and those three are split into two different play styles. I am less sure about that one." At 7:54 am he asked to see the big-bad table with all eight.

## Who they are

| Tester | In plain words |
|---|---|
| very careless | Presses any button that is lit, at any foe or friend. No plan. Never runs away. |
| careless | Mostly hits things; seals a foe when the game offers it; revives a fallen friend; sometimes heals. **The same careless player as before.** |
| attentive, careful | Reads the next three turns; turns a Heavy or Crush back with the Fox; mends anyone under half; keeps MP back for healing. **The same attentive player as before.** |
| attentive, bold | The same reading, but heals late (under about a third), spends MP on hitting, calls Io's Deity against two foes. |
| focused, careful | Reads three turns and uses every tool: the Fox's ghost when the Jester is low, quilt in a crowd, Bloom before an Eclipse. |
| focused, bold | The same tools, healing late and spending freely. |
| expert, careful | Reads the whole turn bar, uses every tool, and knows the fine points: lets the Jester take a Crush on purpose for the Fate, holds a seal for the right moment, tops the Jester up before a blow she could not survive. **The same expert as before.** |
| expert, bold | The same fine points with thinner margins. |

**The approved engine is not changed.** The testers play through the engine's own functions. Three of the eight are the engine's own careless, attentive and expert, move for move; `check.js` proves it over 4,200 fights. So every number measured before today still means what it meant: "attentive" in the older notes is "attentive, careful" here, and "expert" is "expert, careful".

## The table Chris asked to see

Today's last fight (the great wraith, two Shadow Wraiths and two wisps) with its foes at levels 20 to 23, against a party that stops at 20. Wins with nothing found / with all 18 finds at half strength. 2,000 fights each, fresh fights.

| Tester | Level 20 | Level 21 | Level 22 | Level 23 |
|---|---|---|---|---|
| very careless | 2% / 11% | 0% / 1% | 0% / 0% | 0% / 0% |
| careless | 5% / 19% | 0% / 1% | 0% / 0% | 0% / 0% |
| attentive, careful | 80% / 98% | 3% / 13% | 0% / 0% | 0% / 0% |
| attentive, bold | 54% / 85% | 3% / 10% | 0% / 0% | 0% / 0% |
| focused, careful | 96% / 100% | 35% / 65% | 0% / 7% | 0% / 0% |
| focused, bold | 77% / 93% | 15% / 37% | 0% / 0% | 0% / 0% |
| expert, careful | 100% / 100% | 91% / 97% | 26% / 80% | 0% / 1% |
| expert, bold | 98% / 100% | 68% / 84% | 8% / 51% | 0% / 0% |

- **Level 22 is an expert's fight.** Chris on the careful expert's 27% with nothing and 80% with everything (7:54 am): "This is actually a good balance."
- **Level 21 sorts the players out:** with everything found, attentive 13%, focused 65%, expert 97%.
- **Level 23 is out of reach** for everyone.

## What was found

- **The two styles differ only in the hard fights, and bold is simply weaker.** In ordinary fights careful and bold take the same number of turns and end with the same HP and MP. So today the styles are not a real second choice. They are to be reworked around herbs under F9: a thrifty player and a spender.
- **An ordinary fight costs HP and MP.** After two Shadow Wraiths and two wisps two levels over, an attentive party has about 87% of its HP and 66% of its MP left; after the worst walking fight (four levels over), 75% and 60%. This is what the herbs have to give back.
- **The focused player uses the Fox's ghost,** which the old attentive player never did. That alone lifts the last fight at level 21 from 3% to 35%.
- **The spare outline** (the ghost eats a third blow) helps the expert a little and does nothing for the focused player, because blows the ghost eats lay no Fate on the foe.
- **Reading more of the turn bar is not always better for a pretend player.** One that read the whole bar and used the ghost, without the expert's fine timing, matched the expert at level 21 but was worse than the three-turn reader at level 20. So "focused" reads three turns and is told apart by her tools.
- **Nobody uses Slip Stitch.** A fight is won or lost. With herbs to protect, running may be worth testing.

## Not done

- The levelling and finds runs still report the old three. They are run again with all eight under F9, since carrying HP and MP over changes those numbers anyway.
- None of the eight manages herbs yet (F9).

## How to use them

```
const { playOut, names } = require('game/plan/testers/testers.js');
const B = playOut('B2K2w', { tester: 'focused, careful', level: 2, seed: 977, rules });   // level = how far the foes are above the party
```

`names` lists the eight in order. The habits are the `base` and `K` tables at the top of `testers.js`, one number or switch a habit. `node check.js` must pass after any change.
