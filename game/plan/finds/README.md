# Finds for the bigger game (task board S5)

Made by the "Levelling" session on November 14, 2026. With level 20 as the top (`../levelling/plan-chosen.json`),
what the party finds is the only thing that makes the last gate easier. This folder holds 18 finds, three in each of
the six rings beyond the fair (one on the way, one off the path, one hidden), each with one measurable effect, and
what they are worth, measured with the approved combat engine unchanged.

**Chris's decisions, November 15, 2026:** half strength (every percentage in `finds.js` is half of the first
proposal: 5% became 2.5%, 2% became 1%, Revive 35%, Sealed Fate 22.5%; the fourth Bloom and the ghost's third blow are
unchanged); "the names and cards work good"; the two MP finds stay, because fights will start with the MP the party
has; and a big bad at level 21 or 22 against a party that stops at 20, which only an expert who has found everything
should just barely beat (`target.js`).

All 18 are painted: `game/art/items/<id>.png`, cut from Chris's `items2.png` and `items3.png`, with `far-amulet.png`.

**Not merged into `game/world/world.json` yet.** Its five old cards still say the old numbers in their `does` lines.
The strength will be tuned again once fights carry HP and MP over (the resource work), so merge after that.

The page for Chris: `finds.html` (published; the link is in the project note `claude/finds-for-the-bigger-game.md`).

## What is here

| File | What it is |
|---|---|
| `finds.js` | The 18 finds: ring, how hard to find, name, what it does, card words, the picture in words, and the numbers it changes. |
| `finds.json` | The same as the game reads it, with the five existing cards' words and pictures taken from `world.json`. Made by `export.js`. |
| `lib.js` | How a find is applied: each change is one number in the engine's `RULES` (`{path, mul}` or `{path, add}`). The rules code is untouched. |
| `candidates.js`, `each.js` | 26 kinds of find, each measured alone against the fights that can be lost. Results: `each.json`, `each.txt`. |
| `profiles.js` | What a player is likely to carry at each gate (nothing; what lies on the way; also off the path; everything) and what it does there. Results: `profiles.*`. |
| `gentler.js` | The same at half of the chosen strength. Results: `gentler.*`. |
| `target.js` | The last fight with its foes 0 to 3 levels above the party, with no finds and with all 18, at the chosen strength, twice it and half it. Results: `target.*`. |
| `picture-prompts.md` | Prompts for the thirteen new cards' pictures: two sheets of six and one single, after the first item sheet's prompt. |
| `make_page.js`, `thumbs.py` | Build `finds.html`. |

```
cd game/plan/finds
node each.js 4000 > each.txt          # about 2 minutes
node profiles.js 4000 > profiles.txt
node gentler.js 4000 > gentler.txt
node target.js 3000 > target.txt
node export.js
node make_page.js
```

## What was measured (careless / attentive / expert)

The last gate as it stands (`B2K2w` at the party's level, level 20), at the chosen strength, 4,000 fights each:

| She has found | Finds | Wins |
|---|---|---|
| nothing | 0 | 6% / 81% / 99% |
| what lies on the way | 6 | 10% / 90% / 100% |
| and what is off the path | 12 | 15% / 95% / 100% |
| everything | 18 | 20% / 99% / 100% |

The same fight with its foes above the party, for the big bad Chris wants (3,000 fights each):

| Its foes are | No finds | All 18 |
|---|---|---|
| level 21 | 0% / 3% / 91% | 1% / 13% / 97% |
| level 22 | 0% / 0% / 27% | 0% / 0% / 80% |
| level 23 | 0% / 0% / 0% | 0% / 0% / 1% |

- Chris's aim ("only an expert who has found everything just barely wins, two levels above") sits between 22 and 23
  for this line-up: at 22 the expert already wins 27% with nothing and 80% with everything. A big bad at 22 a little
  tougher than today's last fight would do it. To be set when the big bad is designed.
- The two gates before the last are never lost by an attentive player. For a careless one, the lone great wraith goes
  from 58% to 73% with everything, and the level-17 gate from 17% to 34%.
- **HP is the strongest lever** (`each.json`, at the first proposal's sizes): 2% more HP was worth 3 points to an
  attentive player at the last gate, 5% was worth 7; 5% stronger healing was worth 3. As `lore/combat-balance.md` found.
- **MP finds do nothing while every fight starts with full MP.** Chris has decided fights will start with the MP the
  party has, so they will matter; not measured yet.
- **The sim's attentive player never uses the Fox's ghost and seldom needs Bloom,** so The spare outline and The
  fourth seed show a gain only for the careless player. The new testers Chris asked for should cover this.
- **Left out:** the Ranger's gem ready a turn sooner (+13 points alone, too strong); the Jester catching a fourth
  blow (no help); getting up for the bow at 50% (no change); a turned-back blow at two and a half times (no change).
- The keeper's charm ("the Jester takes 2.5% less damage") is measured as 2.6% more HP for the Jester, because the
  engine has no number for damage taken.

## Not decided here

Which piece of the map each ring is and where each find lies (F5, S1); how hidden "hidden" is; the final strength.
