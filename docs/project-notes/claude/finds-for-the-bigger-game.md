# Finds for the bigger game: 18 finds, measured (task board S5)

By the "Levelling" session, November 14 and 15, 2026. Read after `claude/TASK-BOARD-moon-faire-game.md`, `claude/levelling-for-the-bigger-game-options.md` and `claude/chris-nov15-herbs-testers-foes-big-bad.md`.

- **Page for Chris:** "Moon Faire finds", https://claude.ai/artifact/Kn148F9d2fqFubmaygupRs
- **Where it is:** repo `chriskizer91-ops/moon-faire`, branch `claude/moon-faire-levelling` (commit `38db67c`), folder `game/plan/finds/`; the pictures are in `game/art/items/`. Pushed. `game/world/world.json` is not changed yet.

## Chris's decisions (November 15, 7:38 am)

- **"I say half strength for the power of the found items."** Done: every percentage is half of the first proposal.
- **"The names and cards work good."** All 18 are approved; none is a stand-in any more.
- **The two MP finds stay,** because a fight will start with the MP the party has.
- **He sent the thirteen new pictures** (`items2.png`, `items3.png`, `far-amulet.png`). They are cut into cards in `game/art/items/<id>.png`.
- **"I really don't even like that finding all of the items gets you that close to a guaranteed win."** His aim: with a big bad at level 21 or 22, only an expert who has found everything should just barely win. So the strength is not final. It is tuned again once HP and MP carry over (task board F9) and the big bad exists (F11). The 13 new finds go into `world.json` after that.

## Why finds matter

Level 20 is the top, so fighting more no longer makes the end easier. What the party finds is the only lever, which is how Chris wanted easier and harder to work (`lore/combat-balance.md`).

## The 18 finds, at the chosen strength

Three in each ring: one on the way, one off the path, one hidden. "Old" means the card was already in `world.json`; its `does` line there still shows the old number.

| Ring | How found | Find | What it does |
|---|---|---|---|
| 1 | on the way | Cold lantern glass (old) | All four have 2.5% more MP |
| 1 | off the path | The stubborn candle | All four have 1% more HP |
| 1 | hidden | The straight spark | The Ranger's arrows and gem shots hit 2.5% harder |
| 2 | on the way | The cut thread (old) | The Fox's spells cost 2.5% less MP |
| 2 | off the path | The idle needle | The Fox's Stitch and Pins and Needles hit 2.5% harder |
| 2 | hidden | The brass snuffer | Every blow the Jester takes lays 2.5% more Fate on the foe |
| 3 | on the way | The warm stone (old) | All four have 2.5% more HP |
| 3 | off the path | The winter blackthorn | Io's Thorn and her Deity hit 2.5% harder |
| 3 | hidden | The hollow amulet (old) | All healing is 2.5% stronger |
| 4 | on the way | The warm oil flask | All four have 1% more HP |
| 4 | off the path | The fourth seed | Io's Bloom opens 4 times, up from 3 |
| 4 | hidden | The paired amulet | All healing is 2.5% stronger |
| 5 | on the way | The spare outline | The Fox's ghost eats 3 blows, up from 2 |
| 5 | off the path | The keeper's glove | All four have 1% more HP |
| 5 | hidden | The curtain weight | Sealed Fate takes 22.5% of their Life from the other foes, up from 20% |
| 6 | on the way | The lit taper | Io's Revive brings a friend back at 35% HP, up from 30% |
| 6 | off the path | The keeper's charm (old) | The Jester takes 2.5% less damage |
| 6 | hidden | The far amulet | All healing is 2.5% stronger |

The three amulets and the small HP finds are Chris's own idea from `lore/combat-balance.md`. Which piece of the map each ring is, and where each find lies, are not decided here (F5, S1).

## What they do

The approved engine, unchanged; a find changes numbers in its `RULES` and nothing else. Fresh fights (the old rule). Careless / attentive / expert.

**The last gate as it stands,** at the party's level (4,000 fights each):

| She has found | Finds | Wins |
|---|---|---|
| nothing | 0 | 6% / 81% / 99% |
| what lies on the way | 6 | 10% / 90% / 100% |
| and what is off the path | 12 | 15% / 95% / 100% |
| everything | 18 | 20% / 99% / 100% |

**The same fight with its foes above the party,** for the big bad (3,000 fights each):

| Its foes are | No finds | All 18 |
|---|---|---|
| level 21 | 0% / 3% / 91% | 1% / 13% / 97% |
| level 22 | 0% / 0% / 27% | 0% / 0% / 80% |
| level 23 | 0% / 0% / 0% | 0% / 0% / 1% |

Chris's aim sits between 22 and 23 for this line-up: at 22 the expert already wins 27% with nothing and 80% with everything. A big bad at 22 a little tougher than today's last fight would put the expert with everything at "just barely".

The two gates before the last are never lost by an attentive player. For a careless one the lone great wraith (level 14) goes from 58% to 73% with everything, and the level-17 gate from 17% to 34%.

## What the measuring found

- **HP is the strongest lever,** as the combat notes said. At the first proposal's sizes, 2% more HP was worth 3 points to an attentive player at the last gate and 5% was worth 7; 5% stronger healing was worth 3.
- **MP finds do nothing while every fight starts with full MP.** Under the new rule they will matter; not measured yet.
- **The sim's attentive player never calls the Fox's ghost and seldom needs Bloom,** so The spare outline and The fourth seed show a gain only for the careless player. The new testers (F10) should close this.
- **Left out on purpose:** the Ranger's gem ready a turn sooner (+13 points alone, too strong); the Jester catching a fourth blow (no help); getting up for the bow at 50% (no change); a turned-back blow at two and a half times (no change).
- **The keeper's charm** is measured as 2.6% more HP for the Jester, because the engine has no number for damage taken. Whoever builds finds into the fight piece needs either that reading or a new number in `RULES`.

## For whoever builds this into the game

- `game/plan/finds/finds.json`: each find's `changes` is a list of `{path, mul}` or `{path, add}` against the engine's `RULES`. Apply every held find's changes to a copy of `RULES` before a fight starts. `lib.js` `rulesWith(changes)` does exactly that.
- The five old finds keep their `code` (`W4-f`, `W5-e`, `W6-f`, `W7-b`, `W9-b`), card words and pictures from `world.json`.
- Pictures: `game/art/items/<id>.png`, 512 by 512, with the sheets they were cut from and the prompts Chris made them with.
- The fair folk have no lines about the 13 new finds yet (task board S7).

## How to run it again

```
cd game/plan/finds
node each.js 4000 > each.txt          # about 2 minutes; the 26 kinds of find at the first proposal's sizes
node profiles.js 4000 > profiles.txt
node gentler.js 4000 > gentler.txt    # half of the chosen strength
node target.js 3000 > target.txt      # the last fight with its foes 0 to 3 levels above
node export.js
node make_page.js                      # builds finds.html; republish it to the link above
```
